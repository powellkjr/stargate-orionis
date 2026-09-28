import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdtemp,mkdir,copyFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {baseCapacity,validateBase,reserveRecovery,saveBase} from '../shared/js/base-configuration.mjs';
import {demoServer} from '../serve.mjs';
const read=name=>JSON.parse(readFileSync(new URL(`../shared/data/${name}.json`,import.meta.url)));
const schemas=read('rooms_schema');
test('physical room tiers supply capacity; reservations survive and block overflow or shrinking',()=>{
 const base=read('base-configuration');base.reservations=[];assert.equal(baseCapacity(base,schemas).HOLDING.total,4);assert.equal(baseCapacity(base,schemas).RECEIVING.total,40);
 base.rooms.find(r=>r.roomId==='receiving').constructionTier=2;assert.equal(baseCapacity(base,schemas).RECEIVING.total,60);
 const occupied=reserveRecovery(base,schemas,[{instanceId:'captive',destination:'HOLDING',cost:4}],'mission-one');assert.equal(baseCapacity(occupied,schemas).HOLDING.free,0);
 assert.throws(()=>reserveRecovery(occupied,schemas,[{instanceId:'other',destination:'HOLDING',cost:1}],'mission-two'),/capacity/);
 assert.equal(occupied.reservations.length,1);occupied.rooms=occupied.rooms.filter(r=>r.roomId!=='holding');assert.throws(()=>validateBase(occupied,schemas),/capacity/);
});
test('persistent base API saves atomically and rejects stale revisions or capacity overflow',async()=>{
 const root=await mkdtemp(join(tmpdir(),'base-save-')),dir=join(root,'demos/shared/data');await mkdir(dir,{recursive:true});
 for(const name of ['base-configuration','rooms_schema'])await copyFile(new URL(`../shared/data/${name}.json`,import.meta.url),join(dir,`${name}.json`));
 const server=demoServer(root);await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/api/base-configuration`;
 const save=base=>fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(base)});
 try{const base=read('base-configuration'),changed=structuredClone(base);changed.rooms.find(r=>r.roomId==='receiving').constructionTier=2;
 const response=await save(changed);assert.equal(response.status,200);const saved=await response.json();assert.equal(saved.revision,base.revision+1);assert.equal((await save(base)).status,400);
 const invalid=structuredClone(saved);invalid.reservations.push({key:'bad',destination:'HOLDING',cost:999});assert.equal((await save(invalid)).status,400);
 assert.deepEqual(JSON.parse(await readFile(join(dir,'base-configuration.json'),'utf8')),saved);
 }finally{await new Promise(r=>server.close(r));}
});


test('base save handles static-server HTML, malformed success and network errors without committing',async()=>{
 const base=read('base-configuration'),before=structuredClone(base);
 for(const status of [200,404,405,501])await assert.rejects(saveBase(base,async()=>new Response('<html>Unsupported method PUT</html>',{status})),/non-JSON response.*node demos\/serve.mjs/);
 await assert.rejects(saveBase(base,async()=>new Response('')),/non-JSON/);
 await assert.rejects(saveBase(base,async()=>new Response('{"saved":true}')),/did not acknowledge/);
 await assert.rejects(saveBase(base,async()=>{throw Error('offline');}),/Could not reach.*selection is unchanged/);
 await assert.rejects(saveBase(base,async()=>new Response('{"error":"Base changed in another simulator"}',{status:400})),/Base changed in another simulator/);
 assert.deepEqual(base,before);
 const saved={...base,revision:base.revision+1};assert.deepEqual(await saveBase(base,async()=>new Response(JSON.stringify(saved))),saved);
});
