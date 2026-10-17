import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,readdirSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {roomKitGeometry as g,roomKitMetadata,roomKitPromptEntries,roomKitPrompt,roomKitCatalog} from '../shared/sprites/room-kit-prompts.mjs';

test('CT runs fill exactly 24 units with symmetric openings and increasing colored coverage',()=>{
 const colored=[];
 for(const pattern of Object.values(g.ctPatterns)){
  assert.equal(pattern.runs.reduce((sum,n)=>sum+n,0),24);
  assert.deepEqual(pattern.runs,[...pattern.runs].reverse());
  colored.push(pattern.runs.filter((_,i)=>i%2).reduce((sum,n)=>sum+n,0));
 }
 assert.deepEqual(colored,[8,12,16]);
 assert.equal(g.slotThickness,5);
});

test('registered slots partition the cell, door is contained and full-frame rotation preserves registration',()=>{
 const rects=[];
 const rotate=([x,y,w,h])=>[128-y-h,x,h,w];
 for(const kind of ['corner','edge-normal']){
  let rect=g.rectangles[kind];
  for(let i=0;i<4;i++){rects.push(rect);rect=rotate(rect);}
  assert.deepEqual(rect,g.rectangles[kind]);
 }
 rects.push(g.rectangles.center);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  assert.equal(rects.filter(([rx,ry,w,h])=>x>=rx&&x<rx+w&&y>=ry&&y<ry+h).length,1,`slot coverage at ${x},${y}`);
 }
 const [x,y,w,h]=g.doorOpening;
 assert.equal(x+w/2,g.pivot[0]);
 assert.equal(w,32);
 assert.deepEqual(g.rectangles['edge-door'],g.rectangles['edge-open']);
 assert(y>=0&&y+h<=32&&x>=32&&x+w<=96);
 assert.equal(g.sourcePixelsPerUnit*g.cellUnits,g.sourceSize[0]);
 assert.equal(g.slotInset+g.slotThickness<=g.wallDepth,true);
 assert.deepEqual(g.runtimeSize,[128,128]);
});

test('each kit has 18 coordinated filenames, roles preserve clearance and authored subject exclusions',()=>{
 for(const kitId of Object.keys(roomKitCatalog)){
  const metadata=roomKitMetadata([kitId]).kits[0];
  const entries=roomKitPromptEntries([kitId]);
  assert.equal(entries.length,18);
  assert.equal(new Set(entries.map(e=>e.file)).size,18);
  const files=Object.values(metadata.variants).flatMap(v=>Object.values(v));
  assert.equal(new Set(files).size,18);
  for(const [variant,pieces] of Object.entries(metadata.variants))for(const [piece,file] of Object.entries(pieces)){
   assert(file.endsWith(`__${variant}__source.png`));
   const text=roomKitPrompt(kitId,piece,variant);
   assert(text.includes(file));
   assert.match(text,/no crop, recenter, stretch/);
   assert.match(text,/Do NOT bake any tier colors/);
   assert.match(text,/Never independently randomize pieces/);
   assert.match(text,/no people, movable crates/);
  }
 }
 assert.match(roomKitPrompt('receiving','edge-door','v01'),/x=48\.\.80/);
 assert.match(roomKitPrompt('material-storage','edge-open','v02'),/entire module transparent/);
 assert.match(roomKitPrompt('receiving','shared','v03'),/diagonal reflection/);
 assert.match(roomKitPrompt('cultural-platform','center','v01'),/No central table, chairs or planters/);
 assert.throws(()=>roomKitPrompt('not-a-room','center','v01'));
 assert.throws(()=>roomKitPrompt('receiving','corner','v04'));
});

test('CLI exports a complete kit selection and rejects overwrite, bad selectors and bad arguments before writing',()=>{
 const root=mkdtempSync(join(tmpdir(),'room-kit-prompts-')),out=join(root,'valid');
 const run=(args)=>spawnSync(process.execPath,['demos/offworld-sandbox/prepare-sprite.mjs','room-kit-prompts',...args],{encoding:'utf8'});
 const args=['--kit','receiving','--kit','material-storage','--out',out];
 try{
  const result=run(args);assert.equal(result.status,0,result.stderr);
  assert.equal(readdirSync(out).length,39);
  assert.deepEqual(JSON.parse(readFileSync(join(out,'room-kits.json'),'utf8')),roomKitMetadata(['receiving','material-storage']));
  const before=readdirSync(out).map(file=>[file,readFileSync(join(out,file),'utf8')]);
  for(const entry of roomKitPromptEntries(['receiving','material-storage']))assert.equal(readFileSync(join(out,entry.file),'utf8'),entry.text);
  assert.match(readFileSync(join(out,'README.md'),'utf8'),/not yet support|still pending/);
  assert.notEqual(run(args).status,0);
  assert.deepEqual(readdirSync(out).map(file=>[file,readFileSync(join(out,file),'utf8')]),before);
  for(const bad of [['--kit','../receiving'],['--unexpected','yes'],['--out']]){
   const invalid=join(root,'invalid');
   assert.notEqual(run([...bad,'--out',invalid]).status,0);
   assert(!existsSync(invalid));
  }
 }finally{rmSync(root,{recursive:true,force:true});}
});
