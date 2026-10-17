import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {zipFixture} from './sprite-viewer/zip-fixtures.mjs';
import {assertSpriteCandidateAllowed} from './sprite-viewer/sources-server.mjs';
import {demoServer} from './serve.mjs';
import {writableDemoStatus} from './hosting-status.mjs';

test('one writable server serves the hub and all demos',async()=>{
  const server=demoServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`;
  try{
    assert(await writableDemoStatus((path,options)=>fetch(origin+path,options)));
    const hub=await (await fetch(`${origin}/demos/`)).text();
    const links=[...hub.matchAll(/class="demo-card" href="\.\/([^"#?]+)"/g)].map(match=>match[1]);
    const directories=await readdir(new URL('./',import.meta.url),{withFileTypes:true});
    const entryPoints=[];
    for(const directory of directories.filter(entry=>entry.isDirectory())){
      try{await readFile(new URL(`./${directory.name}/index.html`,import.meta.url));entryPoints.push(`${directory.name}/`);}
      catch(error){if(error.code!=='ENOENT')throw error;}
    }
    assert.equal(new Set(links).size,links.length,'launcher links must be unique');
    assert.deepEqual([...links].sort(),entryPoints.sort(),'launcher must list every demo entry point');
    assert.equal((hub.match(/class="save-scope"/g)||[]).length,links.length,'every demo explains its persistence scope');
    for(const link of links){
      assert.equal((await fetch(new URL(link,`${origin}/demos/`))).status,200,link);
    }
    for(const path of ['','offworld-sandbox/','room-sandbox/','room-staffing-demo/','world-map-simulator/','portrait-simulator/','mission-authoring-simulator/','sprite-viewer/']){
      const response=await fetch(`${origin}/demos/${path}`);assert.equal(response.status,200,path);
      assert.match(response.headers.get('content-type'),/text\/html/);assert.match(await response.text(),/<!doctype html>/i);
    }
    assert.equal((await fetch(origin+'/api/demo-status',{method:'POST'})).status,405);
  }finally{await new Promise(r=>server.close(r));}
});
test('static hosting detection rejects missing, HTML, unrelated and unavailable services',async()=>{
  for(const response of [new Response('',{status:404}),new Response('<html>static fallback</html>'),new Response('{}'),new Response('{"service":"other","writable":true}')]){
    assert.equal(await writableDemoStatus(async()=>response),false);
  }
  assert.equal(await writableDemoStatus(async()=>{throw Error('offline');}),false);
});
test('sprite ZIP saves persist and list source PNGs; repeated imports are idempotent and invalid saves leave originals intact',async()=>{
 const root=await mkdtemp(join(tmpdir(),'sprite-save-test-')),server=demoServer(root);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`,png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1ioAAAAASUVORK5CYII=','base64');
 const post=(name,bytes,headers={})=>fetch(`${origin}/api/sprite-sources?name=${encodeURIComponent(name)}`,{method:'POST',body:bytes,headers});
 try{
  assert.deepEqual((await (await fetch(origin+'/api/sprite-sources')).json()).files,[]);
  const bytes=zipFixture([['arbitrary-root/floor-indoor__v01__source.png',png],['notes.txt',new TextEncoder().encode('notes')]]);
  let response=await post('floor-review.zip',bytes);assert.equal(response.status,200);let result=await response.json();assert(result.saved);assert.equal(result.count,1);
  const path=join(root,'artwork/sprite-sources/floor-review/floor-indoor__v01__source.png');assert.deepEqual(await readFile(path),png);
  const listing=await (await fetch(origin+'/api/sprite-sources')).json();assert.equal(listing.files.length,1);assert.deepEqual(listing.files[0].dimensions,[1,1]);assert.equal((await fetch(origin+listing.files[0].url)).status,200);
  response=await post('floor-review.zip',bytes);assert.equal(response.status,200);assert((await response.json()).alreadySaved);
  response=await post('floor-review.zip',zipFixture([['crate.png',png]]));assert.equal(response.status,400);assert.deepEqual(await readFile(path),png);
  for(const [name,bad] of [['../escape.zip',bytes],['unsafe.zip',zipFixture([['../crate.png',png]])],['invalid.zip',zipFixture([['crate.png',new Uint8Array([1,2,3])]])]])assert.equal((await post(name,bad)).status,400,name);
  assert.equal((await post('cross-origin.zip',bytes,{Origin:'http://other.example'})).status,403);
  assert.deepEqual(await readdir(join(root,'artwork/sprite-sources')),['floor-review']);
 }finally{await new Promise(r=>server.close(r));await rm(root,{recursive:true,force:true});}
});
test('persistent rejection excludes a source from preparation and can be restored without deleting it',async()=>{
 const root=await mkdtemp(join(tmpdir(),'sprite-review-test-')),server=demoServer(root);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`,id='orionis-door-b001/door__v02__source.png';
 const post=body=>fetch(origin+'/api/sprite-reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try{
  assert.deepEqual((await (await fetch(origin+'/api/sprite-reviews')).json()).rejected,[]);
  assert.equal((await post({id,rejected:true})).status,200);
  assert.deepEqual((await (await fetch(origin+'/api/sprite-reviews')).json()).rejected,[id]);
  await assert.rejects(()=>assertSpriteCandidateAllowed(root,join(root,'artwork/sprite-sources',id)),/rejected/);
  await assertSpriteCandidateAllowed(root,join(root,'artwork/sprite-sources/orionis-door-b001/door__v01__source.png'));
  assert.equal((await post({id:'../../escape.png',rejected:true})).status,400);
  assert.equal((await post({id,rejected:'yes'})).status,400);
  assert.equal((await post({id,rejected:false})).status,200);await assertSpriteCandidateAllowed(root,join(root,'artwork/sprite-sources',id));
  assert.deepEqual(JSON.parse(await readFile(join(root,'artwork/sprite-sources/sprite-review.json'),'utf8')).rejected,[]);
 }finally{await new Promise(r=>server.close(r));await rm(root,{recursive:true,force:true});}
});
