import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const python=process.env.SPRITE_PYTHON??'python';
const worker=fileURLToPath(new URL('./prepare-sprite.py',import.meta.url));
const run=(...args)=>spawnSync(python,[worker,'center',...args],{encoding:'utf8'});

test('standalone centers off-center artwork, preserves proportions/alpha, and protects originals',()=>{
 const dir=mkdtempSync(join(tmpdir(),'center-sprite-'));
 try{
  const source=join(dir,'source.png'),output=join(dir,'output.png');
  const fixture=spawnSync(python,['-c',`from PIL import Image,ImageDraw
import sys
im=Image.new('RGBA',(300,200));ImageDraw.Draw(im).rectangle((10,20,89,59),fill=(40,80,120,180));im.save(sys.argv[1])`,source],{encoding:'utf8'});
  assert.equal(fixture.status,0,fixture.stderr);
  const original=readFileSync(source);
  let result=run(source,'--out',output);assert.equal(result.status,0,result.stderr);
  const check=spawnSync(python,['-c',`from PIL import Image
import sys
im=Image.open(sys.argv[1]);assert im.mode=='RGBA' and im.size==(128,128)
box=im.getchannel('A').getbbox();assert box==(8,36,120,92),box
assert im.getpixel((64,64))[3]==180
assert im.getpixel((0,0))[3]==0`,output],{encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
  const first=readFileSync(output);
  assert.notEqual(run(source,'--out',output).status,0);
  assert.equal(run(source,'--out',output,'--overwrite').status,0);
  assert.deepEqual(readFileSync(output),first);
  assert.deepEqual(readFileSync(source),original);
  assert.notEqual(run(source,'--out',source,'--overwrite').status,0);
  result=run(source,'--out',join(dir,'wall.png'),'--size','128x12','--padding','0');
  assert.equal(result.status,0,result.stderr);
  const faint=spawnSync(python,['-c',`from PIL import Image,ImageDraw
import sys
im=Image.new('RGBA',(1024,1024));d=ImageDraw.Draw(im)
d.rectangle((100,200,700,650),fill=(40,80,120,255))
im.putpixel((0,0),(40,80,120,1));im.putpixel((1023,1023),(40,80,120,1));im.save(sys.argv[1])`,source],{encoding:'utf8'});
  assert.equal(faint.status,0,faint.stderr);
  result=run(source,'--out',output,'--overwrite');assert.equal(result.status,0,result.stderr);
  const centered=spawnSync(python,['-c',`from PIL import Image
import sys
box=Image.open(sys.argv[1]).getchannel('A').getbbox()
assert abs(box[0]+box[2]-128)<=1 and abs(box[1]+box[3]-128)<=1,box`,output],{encoding:'utf8'});
  assert.equal(centered.status,0,centered.stderr);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('explicit background removal preserves enclosed matching-color details and fails safely',()=>{
 const dir=mkdtempSync(join(tmpdir(),'center-background-'));
 try{
  const source=join(dir,'source.png'),output=join(dir,'output.png');
  const fixture=spawnSync(python,['-c',`from PIL import Image,ImageDraw
import sys
im=Image.new('RGB',(100,100),(250,250,250));d=ImageDraw.Draw(im)
d.rectangle((10,20,49,59),fill=(20,60,100));d.rectangle((20,30,29,39),fill=(250,250,250));im.save(sys.argv[1])
Image.new('RGBA',(10,10)).save(sys.argv[2])`,source,join(dir,'blank.png')],{encoding:'utf8'});
  assert.equal(fixture.status,0,fixture.stderr);
  assert.notEqual(run(source,'--out',output).status,0);
  assert(!existsSync(output));
  const result=run(source,'--out',output,'--background','#ffffff','--tolerance','5','--size','64x64','--padding','4');
  assert.equal(result.status,0,result.stderr);
  const check=spawnSync(python,['-c',`from PIL import Image
import sys
im=Image.open(sys.argv[1]);assert im.size==(64,64) and im.mode=='RGBA'
assert im.getchannel('A').getbbox()==(4,4,60,60)
assert im.getpixel((24,24))==(250,250,250,255)
assert im.getpixel((0,0))[3]==0`,output],{encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
  const first=readFileSync(output);
  for(const options of [['--size','bad'],['--size','0x128'],['--padding','64'],['--background','oops'],['--tolerance','256'],['--tolerance','2']]){
   assert.notEqual(run(source,'--out',output,'--overwrite',...options).status,0);
   assert.deepEqual(readFileSync(output),first);
  }
  assert.notEqual(run(join(dir,'blank.png'),'--out',output,'--overwrite').status,0);
  assert.notEqual(run(source,'--out',output,'--overwrite','--background','#fafafa','--tolerance','255').status,0);
  assert.deepEqual(readFileSync(output),first);
 }finally{rmSync(dir,{recursive:true,force:true});}
});