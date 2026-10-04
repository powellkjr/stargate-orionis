import test from 'node:test';
import assert from 'node:assert/strict';
import {demoServer} from './serve.mjs';
import {writableDemoStatus} from './hosting-status.mjs';

test('one writable server serves the hub and all five demos',async()=>{
  const server=demoServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`;
  try{
    assert(await writableDemoStatus((path,options)=>fetch(origin+path,options)));
    for(const path of ['','offworld-sandbox/','room-sandbox/','room-staffing-demo/','world-map-simulator/','portrait-simulator/']){
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