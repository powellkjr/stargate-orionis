import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,readdir,rm} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';import {spawnSync} from 'node:child_process';
import {installSpriteVariant,readActiveSprites,migrateInstalledVariants,writeActiveSprites} from './install-server.mjs';import {setSpriteRejected,listSpriteSources,readSpriteReviews} from './sources-server.mjs';
import {demoServer} from '../serve.mjs';
test('transparent room overlays are discovered and install without cropping or recentering',async()=>{
 const root=await mkdtemp(join(tmpdir(),'room-overlay-install-'));
 const source=join(root,'artwork/sprite-sources/room-b001'),prepared=join(root,'artwork/sprite-prepared/room-b001/v02');
 await mkdir(source,{recursive:true});await mkdir(prepared,{recursive:true});
 try{
  const fixture=spawnSync(process.env.SPRITE_PYTHON??'python',['-c',`from PIL import Image
from pathlib import Path
import sys
s,p=map(Path,sys.argv[1:])
im=Image.new('RGBA',(1024,1024));im.paste((120,140,160,255),(0,0,256,180));im.save(s/'floor-room-analysis__v01__source.png')
im.resize((128,128),Image.Resampling.LANCZOS).save(p/'floor-room-analysis.png')
Image.new('RGBA',(384,128)).save(s/'floor-room-analysis__v03__source.png')
`,source,prepared],{encoding:'utf8'});assert.equal(fixture.status,0,fixture.stderr);
  const files=await listSpriteSources(root);
  assert(files.some(file=>file.name==='floor-room-analysis__v01__source.png'));
  assert(files.some(file=>file.path==='artwork/sprite-prepared/room-b001/v02/floor-room-analysis.png'));
  const result=await installSpriteVariant(root,'room-b001/floor-room-analysis__v01__source.png');
  const installed=join(root,'demos/offworld-sandbox',result.active['floor-room-analysis'].src);
  const check=spawnSync(process.env.SPRITE_PYTHON??'python',['-c',`from PIL import Image
import sys
assert Image.open(sys.argv[1]).tobytes()==Image.open(sys.argv[2]).tobytes()
`,installed,join(prepared,'floor-room-analysis.png')],{encoding:'utf8'});assert.equal(check.status,0,check.stderr);
  const exact=await installSpriteVariant(root,'sprite-prepared/room-b001/v02/floor-room-analysis.png');
  assert.deepEqual(await readFile(join(root,'demos/offworld-sandbox',exact.active['floor-room-analysis'].src)),await readFile(join(prepared,'floor-room-analysis.png')));
  const before=await readFile(join(root,'demos/shared/sprites/active-sprites.mjs'));
  await assert.rejects(()=>installSpriteVariant(root,'room-b001/floor-room-analysis__v03__source.png'),/square frame|entirely transparent/);
  assert.deepEqual(await readFile(join(root,'demos/shared/sprites/active-sprites.mjs')),before);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('prepared art installs its exact bytes with independent review and installed identity',async()=>{
 const root=await mkdtemp(join(tmpdir(),'sprite-prepared-test-')),folder=join(root,'artwork/sprite-prepared/test-b001/v03');await mkdir(folder,{recursive:true});
 try{
  const fixture=spawnSync(process.env.SPRITE_PYTHON??'python',['-c',`from PIL import Image
from pathlib import Path
import sys
p=Path(sys.argv[1])
im=Image.new('RGBA',(128,128));im.paste((100,120,140,255),(20,16,108,112));im.save(p/'technician.png')
Image.new('RGBA',(64,64)).save(p/'medic.png')
im=Image.new('RGBA',(128,128));im.paste((100,120,140,255),(16,40,112,88));im.save(p/'door.png');im.save(p/'door-open.png')
`,folder],{encoding:'utf8'});assert.equal(fixture.status,0,fixture.stderr);
  const sourceId='test-b001/technician__v03__source.png',preparedId='sprite-prepared/test-b001/v03/technician.png';
  await setSpriteRejected(root,sourceId,true);
  assert((await listSpriteSources(root)).some(s=>s.path==='artwork/'+preparedId));
  const result=await installSpriteVariant(root,preparedId),original=await readFile(join(folder,'technician.png'));
  assert.deepEqual(await readFile(join(root,'demos/offworld-sandbox',result.active.technician.src)),original,'prepared bytes must not be resized or recentered');
  assert.equal(result.active.technician.sourceId,preparedId);
  assert(!(await readSpriteReviews(root)).includes(preparedId));
  await setSpriteRejected(root,preparedId,true);assert((await readActiveSprites(root)).technician.disabled);
  await setSpriteRejected(root,sourceId,false);assert((await readActiveSprites(root)).technician.disabled,'restoring source must not restore prepared variant');
  await assert.rejects(()=>installSpriteVariant(root,preparedId),/rejected/);
  const before=await readFile(join(root,'demos/shared/sprites/active-sprites.mjs'));
  await assert.rejects(()=>installSpriteVariant(root,'sprite-prepared/test-b001/v03/medic.png'),/expected/);
  assert.deepEqual(await readFile(join(root,'demos/shared/sprites/active-sprites.mjs')),before);
  const paired=await installSpriteVariant(root,'sprite-prepared/test-b001/v03/door.png');assert.deepEqual(paired.keys,['door','door-open']);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('installation validates runtime PNGs, commits both states, and preserves active choices on rejection/missing/invalid sources',async()=>{
 const root=await mkdtemp(join(tmpdir(),'sprite-install-test-')),batch=join(root,'artwork/sprite-sources/test-b001');await mkdir(batch,{recursive:true});
 const server=demoServer(root);await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 try{
  const fixture=spawnSync(process.env.SPRITE_PYTHON??'python',['-c',`from PIL import Image
from pathlib import Path
import sys
p=Path(sys.argv[1])
Image.new('RGB',(1024,1024),(150,160,170)).save(p/'floor-indoor__v01__source.png')
Image.new('RGB',(1024,1024),(160,170,180)).save(p/'floor-indoor__v02__source.png')
Image.new('RGB',(1024,1024),(150,160,170)).save(p/'guard__v01__source.png')
im=Image.new('RGBA',(1024,1024));im.paste((100,120,140,255),(112,320,912,704));im.save(p/'door__v01__source.png')
im.paste((0,0,0,0),(256,352,768,672));im.save(p/'door-open__v01__source.png')
im.putpixel((120,400),(255,0,0,255));im.save(p/'door-open__v02__source.png')
Image.open(p/'door__v01__source.png').save(p/'door__v02__source.png')
`,batch],{encoding:'utf8'});assert.equal(fixture.status,0,fixture.stderr);
  const response=await fetch(origin+'/api/sprite-install',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'test-b001/floor-indoor__v01__source.png'})});assert.equal(response.status,200);const first=await response.json();assert.deepEqual(first.keys,['floor-indoor']);
  assert.equal((await (await fetch(origin+'/api/sprite-install')).json()).active['floor-indoor'].sourceId,'test-b001/floor-indoor__v01__source.png');
  assert.equal((await fetch(origin+'/api/sprite-install',{method:'POST',headers:{Origin:'http://other.example'},body:'{}'})).status,403);
  const floorPath=join(root,'demos/offworld-sandbox',first.active['floor-indoor'].src),png=await readFile(floorPath);assert.equal(png.readUInt32BE(16),128);assert.equal(png.readUInt32BE(20),128);
  assert.equal((await readActiveSprites(root))['floor-indoor'].sourceId,'test-b001/floor-indoor__v01__source.png');
  const registry=join(root,'demos/shared/sprites/active-sprites.mjs');
  await setSpriteRejected(root,'test-b001/floor-indoor__v01__source.png',true);
  assert((await readActiveSprites(root))['floor-indoor'].variants[0].disabled);
  const before=await readFile(registry);
  await assert.rejects(()=>installSpriteVariant(root,'test-b001/floor-indoor__v01__source.png'),/rejected/);
  await assert.rejects(()=>installSpriteVariant(root,'test-b001/guard__v01__source.png'),/RGBA/);
  await assert.rejects(()=>installSpriteVariant(root,'test-b001/door__v03__source.png'),/Missing source/);
  await assert.rejects(()=>installSpriteVariant(root,'test-b001/door__v02__source.png'),/frame pixels differ/);
  assert.deepEqual(await readFile(registry),before);
  const second=await installSpriteVariant(root,'test-b001/floor-indoor__v02__source.png');assert.equal(second.active['floor-indoor'].variants.length,2);
  // Simulate an older registry which remembered only its latest installation.
  const latest={...second.active['floor-indoor']};delete latest.variants;await writeActiveSprites(root,{'floor-indoor':latest});
  const recovered=await migrateInstalledVariants(root);assert.equal(recovered['floor-indoor'].variants.length,2);
  assert(recovered['floor-indoor'].variants.find(v=>v.sourceId.includes('v01')).disabled);
  const paired=await installSpriteVariant(root,'test-b001/door-open__v01__source.png');assert.deepEqual(paired.keys,['door-open','door']);
  assert(paired.active['floor-indoor']);assert.equal(paired.active.door.src.split('/').at(-2),paired.active['door-open'].src.split('/').at(-2));
  for(const key of ['door','door-open']){const file=await readFile(join(root,'demos/offworld-sandbox',paired.active[key].src));assert.equal(file.readUInt32BE(16),128);}
  assert((await readdir(join(root,'demos/shared/sprites/offworld/production'))).every(name=>name.startsWith('installed-')),'failed installations must leave no staging directories');
 }finally{await new Promise(r=>server.close(r));await rm(root,{recursive:true,force:true});}
});
