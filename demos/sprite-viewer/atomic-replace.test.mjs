import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {replaceRegistry} from './atomic-replace.mjs';

test('temporary Windows replacement locks retry before atomic commit',async()=>{
 const root=await mkdtemp(join(tmpdir(),'registry-retry-'));
 const source=join(root,'new.mjs'),destination=join(root,'active.mjs');
 try{
  await writeFile(source,'new');await writeFile(destination,'old');let attempts=0;const waits=[];
  await replaceRegistry(source,destination,{platform:'win32',wait:async ms=>waits.push(ms),renameFile:async(a,b)=>{
   assert.equal(await readFile(destination,'utf8'),'old');
   if(++attempts<3)throw Object.assign(new Error('locked'),{code:'EPERM'});
   await rename(a,b);
  }});
  assert.equal(attempts,3);assert.deepEqual(waits,[50,100]);assert.equal(await readFile(destination,'utf8'),'new');
 }finally{await rm(root,{recursive:true,force:true});}
});

test('persistent Windows denial preserves both files and reports recovery steps',async()=>{
 const root=await mkdtemp(join(tmpdir(),'registry-denied-'));
 const source=join(root,'new.mjs'),destination=join(root,'active.mjs');
 try{
  await writeFile(source,'new');await writeFile(destination,'old');let attempts=0;
  await assert.rejects(()=>replaceRegistry(source,destination,{platform:'win32',wait:async()=>{},renameFile:async()=>{
   attempts++;throw Object.assign(new Error('denied'),{code:'EPERM'});
  }}),/previous registry was kept/);
  assert.equal(attempts,7);assert.equal(await readFile(destination,'utf8'),'old');assert.equal(await readFile(source,'utf8'),'new');
 }finally{await rm(root,{recursive:true,force:true});}
});

test('non-lock failures and non-Windows failures do not retry',async()=>{
 for(const [platform,code] of [['win32','ENOENT'],['linux','EPERM']]){
  let attempts=0;const failure=Object.assign(new Error('failure'),{code});
  await assert.rejects(()=>replaceRegistry('source','destination',{platform,wait:async()=>assert.fail('unexpected retry'),renameFile:async()=>{attempts++;throw failure;}}),error=>error===failure);
  assert.equal(attempts,1);
 }
});