import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {roomTilePrompts,settledRoomTileIds,offworldRoomTileSubjects} from '../shared/sprites/room-tile-prompts.mjs';
import {roomSprites} from '../shared/sprites/room-sprite-requirements.mjs';

test('room tile queue covers existing rooms, transparent ground, door clearance and safe text export',()=>{
 const dir=mkdtempSync(join(tmpdir(),'room-tile-prompts-'));
 try{
  assert.equal(roomTilePrompts.length,Object.keys(roomSprites).length+Object.keys(offworldRoomTileSubjects).length);
  for(const id of settledRoomTileIds)assert(roomTilePrompts.some(prompt=>prompt.key===`floor-room-${id.replaceAll('_','-')}`));
  assert(roomTilePrompts.some(prompt=>prompt.key==='floor-room-cultural-platform'&&/2×2/.test(prompt.text)));
  const archetypes=JSON.parse(readFileSync('demos/shared/data/offworld/archetypes.json','utf8')).archetypes.stage;
  assert.deepEqual(Object.keys(offworldRoomTileSubjects).map(id=>id.replace('offworld_','stage_')).sort(),Object.keys(archetypes).sort());
  assert.equal(new Set(roomTilePrompts.map(prompt=>prompt.file)).size,roomTilePrompts.length);
  for(const prompt of roomTilePrompts){
   assert.match(prompt.text,/exactly THREE square/);
   assert.match(prompt.text,/3072 x 1024/);
   assert.match(prompt.text,/90 degrees/);
   assert.match(prompt.text,/ONE RGBA PNG/);
   assert.match(prompt.text,/All ground and empty space must be fully transparent \(alpha 0\)/);
   assert.match(prompt.text,/add the floor separately with its tile system/);
   assert.match(prompt.text,/Reserve a clear bottom-center space in EVERY square/);
   assert.match(prompt.text,/approach to the central walking area fully transparent and unobstructed/);
   assert.match(prompt.text,/Do not draw the door or its frame/);
   assert.match(prompt.text,/Do not crop, recenter furnishings/);
   assert.doesNotMatch(prompt.text,/Every pixel must be fully opaque|floor palette/);
   assert.match(prompt.text,/Do not draw walls, doors/);
  }
  const run=()=>spawnSync(process.execPath,['demos/offworld-sandbox/prepare-sprite.mjs','room-tile-prompts','--out',dir],{encoding:'utf8'});
  const result=run();assert.equal(result.status,0,result.stderr);
  const before=readFileSync(join(dir,roomTilePrompts[0].file));
   const checklist=readFileSync(join(dir,'README.md'),'utf8');
   assert.match(checklist,/rejects these transparent overlays/);
   assert.match(checklist,/neither mode is suitable/);
   for(const prompt of roomTilePrompts)assert.equal(readFileSync(join(dir,prompt.file),'utf8'),prompt.text);
  assert.notEqual(run().status,0);
  assert.deepEqual(readFileSync(join(dir,roomTilePrompts[0].file)),before);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('opaque tile splitting preserves full cells and rejects non-square or transparent sheets',()=>{
 const dir=mkdtempSync(join(tmpdir(),'room-tiles-')),python=process.env.SPRITE_PYTHON??'python';
 try{
  const fixture=spawnSync(python,['-c',`from PIL import Image
from pathlib import Path
import sys
p=Path(sys.argv[1]);im=Image.new('RGBA',(384,128))
for i,color in enumerate([(200,40,50,255),(40,200,50,255),(40,50,200,255)]):
 im.paste(color,(128*i,0,128*(i+1),128))
im.save(p/'sheet.png')
im.putpixel((0,0),(0,0,0,0));im.save(p/'transparent.png')
Image.new('RGB',(385,128)).save(p/'wrong-size.png')`,dir],{encoding:'utf8'});
  assert.equal(fixture.status,0,fixture.stderr);
  const out=join(dir,'artwork');
  const run=(file,batch)=>spawnSync(python,['demos/offworld-sandbox/split-sprite-sheet.py',join(dir,file),'--tiles','--asset','floor-room-analysis','--size','128x128','--padding','0','--batch',batch,'--out',out],{encoding:'utf8'});
  const result=run('sheet.png','good');assert.equal(result.status,0,result.stderr);
  const check=spawnSync(python,['-c',`from PIL import Image
from pathlib import Path
import sys
p=Path(sys.argv[1]);sheet=Image.open(sys.argv[2])
for i in range(3):
 runtime=Image.open(p/'sprite-prepared/good'/f'v{i+1:02d}'/'floor-room-analysis.png')
 master=Image.open(p/'sprite-sources/good'/f'floor-room-analysis__v{i+1:02d}__source.png')
 assert runtime.tobytes()==sheet.crop((128*i,0,128*(i+1),128)).tobytes()
 assert master.size==(1024,1024) and master.getchannel('A').getextrema()==(255,255)`,out,join(dir,'sheet.png')],{encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
  assert.notEqual(run('sheet.png','good').status,0);
  for(const file of ['transparent.png','wrong-size.png']){
   assert.notEqual(run(file,'bad').status,0);
   assert(!existsSync(join(out,'sprite-sources/bad')));
   assert(!existsSync(join(out,'sprite-prepared/bad')));
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});
