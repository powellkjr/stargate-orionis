import test from 'node:test';import assert from 'node:assert/strict';
import {assets,identifySprite,previewSize,newestAssetsFirst,spriteSourceId} from './model.mjs';
import {readFileSync} from 'node:fs';
import {spriteManifest,roomOverlayKeys} from '../offworld-sandbox/sprite-manifest.mjs';
test('viewer resolves all manifest resources relative to the manifest, including distinct aspect ratios',()=>{
 assert.equal(assets.length,50+roomOverlayKeys.length);assert.match(assets[0].url,/shared\/sprites\/offworld\/(?:production\/installed-[^/]+\/)?floor-indoor\.(svg|png)$/);
 assert.deepEqual(previewSize(assets.find(a=>a.key==='wall'),'runtime'),[128,12]);
 assert.deepEqual(previewSize(assets.find(a=>a.key==='gate'),'world'),[56,56]);
});
test('room requirements cover exactly the authored rooms and geology with shared valid keys',()=>{
 const read=name=>JSON.parse(readFileSync(new URL(`../shared/data/${name}.json`,import.meta.url),'utf8'));
 assert.deepEqual(Object.keys(spriteManifest.roomTypes).sort(),read('rooms_schema').map(r=>r.identity.id).sort());
 assert.deepEqual(Object.keys(spriteManifest.baseTiles).sort(),read('base_tiles').map(r=>r.identity.id).sort());
 for(const room of Object.values(spriteManifest.roomTypes))for(const key of [room.floor,...room.props])assert(spriteManifest.assets[key],key);
 for(const key of Object.values(spriteManifest.baseTiles)){assert(spriteManifest.assets[key].opaque);assert.equal(spriteManifest.assets[key].size,100);}
});
test('variant recognition preserves open states and rejects unrelated or unsafe names',()=>{
 for(const key of roomOverlayKeys){
  assert.equal(identifySprite(`${key}__v01__source.png`).key,key);
  assert.equal(identifySprite(`${key}.png`).key,key);
  assert.equal(spriteManifest.assets[key].opaque,false);
  assert.equal(spriteManifest.assets[key].preserveFrame,true);
  assert.equal(spriteManifest.assets[key].padding,0);
 }
 assert.deepEqual(identifySprite('door-open__v02__source.png'),{key:'door-open',variant:'v02',source:true});
 assert.deepEqual(identifySprite('crate.png'),{key:'crate',variant:'Prepared PNG',source:false});
 for(const name of ['../crate.png','random.png','crate__v04__source.png','crate.jpg','crate.png.exe'])assert.equal(identifySprite(name),null,name);
});
test('recent imports rank groups first, preserve unloaded order and respond to reloads without mutating inputs',()=>{
 const list=[{key:'floor'},{key:'wall'},{key:'door'},{key:'guard'}],candidates=[{key:'door',loadedOrder:1},{key:'guard',loadedOrder:2},{key:'door',loadedOrder:3}];
 assert.deepEqual(newestAssetsFirst(list,candidates).map(a=>a.key),['door','guard','floor','wall']);
 assert.deepEqual(newestAssetsFirst(list,[]),list);assert.deepEqual(list.map(a=>a.key),['floor','wall','door','guard']);
 candidates[1].loadedOrder=4;assert.equal(newestAssetsFirst(list,candidates)[0].key,'guard');
});
test('review identity follows a batch through ZIP import, folder import and saved-source reload',()=>{
 const id='orionis-door-b001/door__v02__source.png';
 for(const path of ['orionis-door-b001.zip/root/door__v02__source.png','sprite-sources/orionis-door-b001/door__v02__source.png','artwork/sprite-sources/orionis-door-b001/door__v02__source.png',id])assert.equal(spriteSourceId(path),id);
 assert.notEqual(spriteSourceId('other-batch/door__v02__source.png'),id);assert.equal(spriteSourceId('bad.png'),null);
});
test('prepared candidates have independent identities from sources, other batches and variants',()=>{
 assert.notEqual(spriteSourceId('sprite-prepared/orionis-wall-b002/v03/wall.png'),spriteSourceId('artwork/sprite-sources/orionis-wall-b002/wall__v03__source.png'));
 assert.notEqual(spriteSourceId('artwork/sprite-sources/orionis-wall-b001/wall__v03__source.png'),spriteSourceId('artwork/sprite-sources/orionis-wall-b002/wall__v03__source.png'));
 assert.notEqual(spriteSourceId('sprite-prepared/orionis-wall-b001/v03/wall.png'),spriteSourceId('sprite-prepared/orionis-wall-b002/v03/wall.png'));
 for(const path of ['orionis-console-b001/v01/console.png','orionis-console-b001\\v01\\console.png','sprite-prepared/orionis-console-b001/v01/console.png','artwork/sprite-prepared/orionis-console-b001/v01/console.png','C:\\artwork\\sprite-prepared\\orionis-console-b001\\v01\\console.png'])assert.equal(spriteSourceId(path),'sprite-prepared/orionis-console-b001/v01/console.png');
 assert.equal(spriteSourceId('sprite-prepared/orionis-door-b002/v03/door-open.png'),'sprite-prepared/orionis-door-b002/v03/door-open.png');
 for(const path of ['sprite-prepared/batch/v04/crate.png','sprite-prepared/batch/crate.png','sprite-prepared/batch/v01/nested/crate.png','sprite-prepared/batch/v01/crate__v01__source.png'])assert.equal(spriteSourceId(path),null,path);
});
