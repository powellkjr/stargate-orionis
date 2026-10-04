import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {demoServer} from '../serve.mjs';
import {personnelSaver,cachedLoadouts} from '../shared/offworld/personnel-save.mjs';
test('writable server persists valid stats and tools atomically; invalid saves leave JSON untouched',async()=>{
  const root=await mkdtemp(join(tmpdir(),'personnel-save-')),dir=join(root,'demos/shared/data');await mkdir(join(dir,'offworld'),{recursive:true});
  for(const name of ['personnel-loadouts','base-classes','personnel-names','offworld/archetypes'])await copyFile(new URL(`../shared/data/${name}.json`,import.meta.url),join(dir,`${name}.json`));
  const path=join(dir,'personnel-loadouts.json'),before=JSON.parse(await readFile(path,'utf8')),server=demoServer(root);await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`,save=(id,value,origin)=>fetch(base+'/api/personnel/'+id,{method:'PUT',headers:{'Content-Type':'application/json',...(origin?{Origin:origin}:{})},body:JSON.stringify(value)});
  try{
    const edited={...before.units['unit-1'],perception:9,availableTools:[{type:'SOT1',charges:7}],toolSlots:[{kitId:'SOT1',charges:7},{kitId:'',charges:0}]};
    assert.equal((await save('unit-1',edited)).status,200);const after=JSON.parse(await readFile(path,'utf8'));assert.deepEqual(after.units['unit-1'],edited);assert.deepEqual(after.units['unit-2'],before.units['unit-2']);
    assert.equal((await save('unit-1',{...edited,tier:99})).status,400);
    assert.equal((await save('unit-1',{...edited,toolSlots:[{kitId:'TET3',charges:3},{kitId:'',charges:0}]})).status,400);
    assert.equal((await save('unit-1',edited,'https://unrelated.example')).status,403);
    assert.deepEqual(JSON.parse(await readFile(path,'utf8')),after);
    assert.equal((await fetch(base+'/demos/shared/data/personnel-loadouts.json')).headers.get('cache-control'),'no-store');
  }finally{await new Promise(r=>server.close(r));}
});
test('read-only hosting preserves edits in browser and clearly reports the save location',async()=>{
  const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},status={};
  const save=personnelSaver(status,async()=>({ok:false}),storage);await save({unitId:'unit-1'},{tier:2});
  assert.deepEqual(cachedLoadouts(storage),{'unit-1':{tier:2}});assert.match(status.textContent,/Saved in this browser/);
  await personnelSaver(status,async()=>({ok:true}),storage)({unitId:'unit-1'},{tier:2});
  assert.deepEqual(cachedLoadouts(storage),{});assert.match(status.textContent,/Saved to shared personnel JSON/);
});
