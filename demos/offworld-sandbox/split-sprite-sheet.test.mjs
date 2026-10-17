import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,existsSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const python=process.env.SPRITE_PYTHON??'python';
const run=(...args)=>spawnSync(process.execPath,['demos/offworld-sandbox/prepare-sprite.mjs',...args],{encoding:'utf8'});
test('three-column sheets publish reproducible masters and runtime variants without overwriting',()=>{
 const dir=mkdtempSync(join(tmpdir(),'sprite-sheet-'));
 try{
  const sheet=join(dir,'sheet.png'),out=join(dir,'artwork');
  const fixture=spawnSync(python,['-c',`from PIL import Image,ImageDraw
import sys
im=Image.new('RGBA',(900,300));d=ImageDraw.Draw(im)
for x,color in [(25,(180,30,40,255)),(355,(30,180,40,255)),(715,(30,40,180,255))]:
 d.rectangle((x,80,x+90,230),fill=color)
im.save(sys.argv[1])`,sheet],{encoding:'utf8'});
  assert.equal(fixture.status,0,fixture.stderr);const original=readFileSync(sheet);
  const result=run('split-sheet','crate',sheet,'--batch','orionis-crate-b009','--out',out);assert.equal(result.status,0,result.stderr);
  const check=spawnSync(python,['-c',`from PIL import Image
from pathlib import Path
import sys
p=Path(sys.argv[1])
for i in range(1,4):
 a=Image.open(p/'sprite-sources/orionis-crate-b009'/f'crate__v{i:02d}__source.png')
 b=Image.open(p/'sprite-prepared/orionis-crate-b009'/f'v{i:02d}'/'crate.png')
 assert a.size==(1024,1024) and b.size==(128,128) and a.mode==b.mode=='RGBA'
 for im,padding in [(a,64),(b,8)]:
  l,t,r,bottom=im.getchannel('A').getbbox();w,h=im.size
  assert l>=padding and t>=padding and r<=w-padding and bottom<=h-padding
  assert abs(l+r-w)<=1 and abs(t+bottom-h)<=1
 assert b.getpixel((64,64))[i-1]>150`,out],{encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
  const master=join(out,'sprite-sources/orionis-crate-b009/crate__v01__source.png'),runtime=join(out,'sprite-prepared/orionis-crate-b009/v01/crate.png'),reproduced=join(dir,'crate.png');
  assert.equal(run('prepare','crate',master,'--out',reproduced).status,0);
  assert.deepEqual(readFileSync(runtime),readFileSync(reproduced));
  const direct=spawnSync(python,['demos/offworld-sandbox/split-sprite-sheet.py',sheet,'--asset','crate','--size','128x128','--padding','8','--batch','python-only','--out',out],{encoding:'utf8'});
  assert.equal(direct.status,0,direct.stderr);
  assert.deepEqual(readFileSync(join(out,'sprite-prepared/python-only/v01/crate.png')),readFileSync(runtime));
  assert.notEqual(run('split-sheet','crate',sheet,'--batch','orionis-crate-b009','--out',out).status,0);
  assert.deepEqual(readFileSync(sheet),original);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('explicit background cleanup succeeds; unsafe layouts and unsupported assets write no batches',()=>{
 const dir=mkdtempSync(join(tmpdir(),'sprite-sheet-bad-'));
 try{
  const fixture=spawnSync(python,['-c',`from PIL import Image,ImageDraw
from pathlib import Path
import sys
p=Path(sys.argv[1]);im=Image.new('RGB',(900,300),'white');d=ImageDraw.Draw(im)
for x in [30,340,680]: d.rectangle((x,50,x+80,240),fill=(30,80,130))
im.save(p/'opaque.png')
im=Image.new('RGBA',(900,300));ImageDraw.Draw(im).rectangle((20,20,880,280),fill=(30,80,130,255));im.save(p/'connected.png')
im=Image.new('RGBA',(900,300));d=ImageDraw.Draw(im)
for x in [0,340,680]: d.rectangle((x,50,x+80,240),fill=(30,80,130,255))
im.save(p/'clipped.png')
Image.new('RGBA',(900,300)).save(p/'blank.png')
im=Image.new('RGBA',(900,300));d=ImageDraw.Draw(im)
for x in [30,680]: d.rectangle((x,50,x+80,240),fill=(30,80,130,255))
im.save(p/'missing.png')`,dir],{encoding:'utf8'});
  assert.equal(fixture.status,0,fixture.stderr);
  const out=join(dir,'artwork');
  assert.equal(run('split-sheet','wall',join(dir,'opaque.png'),'--batch','clean','--out',out,'--background','#ffffff').status,0);
  for(const [key,file,options] of [['crate','opaque.png',[]],['crate','connected.png',[]],['crate','clipped.png',[]],['crate','blank.png',[]],['crate','missing.png',[]],['floor-indoor','opaque.png',[]],['gate','opaque.png',[]],['unknown-key','opaque.png',[]],['crate','opaque.png',['--background','oops']]]){
   const result=run('split-sheet',key,join(dir,file),'--batch','invalid','--out',out,...options);
   assert.notEqual(result.status,0,`${key}/${file}`);
   assert(!existsSync(join(out,'sprite-sources/invalid')));assert(!existsSync(join(out,'sprite-prepared/invalid')));
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});