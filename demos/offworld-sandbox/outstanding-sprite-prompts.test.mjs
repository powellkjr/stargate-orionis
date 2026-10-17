import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {outstandingSpriteRequests} from '../shared/sprites/outstanding-sprite-prompts.mjs';

test('coverage counts enabled existing PNGs and includes explicit failures and paired states',()=>{
 const assets={good:{},missing:{},disabled:{},broken:{},review:{},door:{pair:'door-open'},'door-open':{pair:'door'}};
 const installed={good:{src:'good.png'},disabled:{variants:[{src:'good.png',disabled:true}]},broken:{src:'gone.png'},review:{src:'good.png'},door:{src:'good.png'}};
 assert.deepEqual(outstandingSpriteRequests(assets,installed,src=>src==='good.png',{review:'Needs regeneration'}).map(r=>r.key),['missing','disabled','broken','review','door']);
 assert.deepEqual(outstandingSpriteRequests({good:{}},installed,()=>true,{}),[]);
});

test('outstanding CLI exports overlay prompts and refuses overwrite',()=>{
 const dir=mkdtempSync(join(tmpdir(),'outstanding-sprites-'));
 try{
  const run=()=>spawnSync(process.execPath,['demos/offworld-sandbox/prepare-sprite.mjs','outstanding-prompts','--out',dir],{encoding:'utf8'});
  const result=run();assert.equal(result.status,0,result.stderr);
  const files=readdirSync(dir);
  const cultural=files.find(f=>f.endsWith('floor-room-cultural-platform-prompt.txt'));
  assert(cultural);assert.match(readFileSync(join(dir,cultural),'utf8'),/center entirely free of furniture/);
  const medical=files.find(f=>f.endsWith('floor-room-offworld-medical-holding-prompt.txt'));
  assert.match(readFileSync(join(dir,medical),'utf8'),/Do not draw beds/);
  assert(files.some(f=>f.endsWith('floor-base-bedrock-prompt.txt')));
  assert(!files.some(f=>f.endsWith('floor-room-generator-prompt.txt')));
  const before=readFileSync(join(dir,'README.md'),'utf8');
  assert.notEqual(run().status,0);assert.equal(readFileSync(join(dir,'README.md'),'utf8'),before);
 }finally{rmSync(dir,{recursive:true,force:true});}
});