import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {demoServer} from './serve.mjs';
import {writableDemoStatus} from './hosting-status.mjs';

test('one writable server serves the hub and all six demos',async()=>{
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
    for(const path of ['','offworld-sandbox/','room-sandbox/','room-staffing-demo/','world-map-simulator/','portrait-simulator/','mission-authoring-simulator/']){
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