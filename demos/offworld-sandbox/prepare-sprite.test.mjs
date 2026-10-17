import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spriteManifest} from './sprite-manifest.mjs';
import {roomSpriteAssets} from '../shared/sprites/room-sprite-requirements.mjs';
const dir=mkdtempSync(join(tmpdir(),'sprite-preparation-')),python=process.env.SPRITE_PYTHON??'python',cli=fileURLToPath(new URL('./prepare-sprite.mjs',import.meta.url));
const fixture=spawnSync(python,['-c',`from PIL import Image, ImageDraw
from pathlib import Path
import sys
p=Path(sys.argv[1])
im=Image.new('RGBA',(1024,1024));d=ImageDraw.Draw(im);d.rectangle((180,270,820,740),fill=(60,170,200,255));im.save(p/'source.png')
Image.new('RGB',(1024,1024),(120,170,190)).save(p/'floor.png')
Image.new('RGBA',(1024,1024)).save(p/'blank.png')
im=Image.new('RGBA',(1024,1024));d=ImageDraw.Draw(im);d.rectangle((112,320,911,703),fill=(80,90,100,255));im.save(p/'door-source.png')
im=Image.new('RGBA',(1024,1024));d=ImageDraw.Draw(im);d.rectangle((112,320,911,703),outline=(80,90,100,255),width=30);im.save(p/'open-source.png')
Image.new('RGBA',(128,128),(255,255,255,255)).save(p/'bad.png')
(p/'not-png.png').write_text('not PNG')
(p/'oversized.png').write_bytes(b'0'*1048577)
`,dir],{encoding:'utf8'});assert.equal(fixture.status,0,fixture.stderr);
const run=(...args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});
const output=key=>join(dir,key+'.png');
test('room prompt queue covers additional mapped furnishings/geology without portraits or overwriting files',()=>{
 const folder=join(dir,'room-queue'),result=run('room-prompts','--out',folder);assert.equal(result.status,0,result.stderr);
 const files=readdirSync(folder).filter(f=>f.endsWith('-prompt.txt'));assert.equal(files.length,roomSpriteAssets.length);
 assert.equal(files.length,19);assert(!existsSync(join(folder,'profiles')));
 for(const [key] of roomSpriteAssets){
  const file=files.find(f=>f.endsWith(`-${key}-prompt.txt`));assert(file,key);
  const prompt=readFileSync(join(folder,file),'utf8');assert(prompt.includes(`ASSET ID: ${key}`));assert(prompt.includes(`orionis-${key}-b001.zip`));
  assert(prompt.includes('shape/design'));assert(prompt.includes('Direct overhead'));
  if(key.startsWith('floor-')){assert(prompt.includes('Fully opaque seamless tile'));assert(prompt.includes('3x3 repeat'));}
  else assert(prompt.includes('True RGBA transparency'));
 }
 assert.match(files.sort()[0],/containment-cabinet/);
 const before=readFileSync(join(folder,'README.md'));assert.notEqual(run('room-prompts','--out',folder).status,0);assert.deepEqual(readFileSync(join(folder,'README.md')),before);
 assert.notEqual(run('room-prompts','--unknown',folder).status,0);
});
test('normalization yields deterministic exact-sized centered RGBA with safe padding',()=>{
 let r=run('prepare','crate',join(dir,'source.png'),'--out',output('crate'));assert.equal(r.status,0,r.stderr);const first=readFileSync(output('crate'));
 r=run('prepare','crate',join(dir,'source.png'),'--out',output('crate'),'--overwrite');assert.equal(r.status,0,r.stderr);assert.deepEqual(readFileSync(output('crate')),first);assert.equal(run('validate','crate',output('crate')).status,0);
 assert.notEqual(run('prepare','crate',join(dir,'source.png'),'--out',output('crate')).status,0,'overwrite requires explicit flag');
});
test('floors, thin walls and 256px Gate profiles produce their distinct runtime dimensions',()=>{
 for(const [key,source] of [['floor-lab','floor.png'],['wall','source.png'],['gate','door-source.png']]){const r=run('prepare',key,join(dir,source),'--out',output(key));assert.equal(r.status,0,r.stderr);}
 const r=run('prepare','gate-open',join(dir,'door-source.png'),'--out',output('gate-open'));assert.equal(r.status,0,r.stderr);assert.equal(run('validate','gate',output('gate')).status,0);
 assert.equal(run('validate','wall',output('wall')).status,0);assert.equal(run('validate','floor-lab',output('floor-lab')).status,0);
});
test('bad file types, missing/blank sources, absent alpha and incorrect dimensions/padding are rejected',()=>{
 for(const source of ['floor.png','blank.png','not-png.png','missing.png'])assert.notEqual(run('prepare','worker',join(dir,source),'--out',output('worker')).status,0,source);
 assert.notEqual(run('validate','crate',join(dir,'oversized.png')).status,0);
 assert.notEqual(run('validate','crate',join(dir,'bad.png')).status,0);assert.notEqual(run('validate','gate',output('crate')).status,0);assert.notEqual(run('prepare','unknown',join(dir,'source.png'),'--out',output('wrong-name')).status,0);
});
test('door pairs preserve shared canvas and must validate together before ingestion',()=>{
 let r=run('prepare','door',join(dir,'door-source.png'),'--out',output('door'));assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/PAIR PENDING/);assert.notEqual(run('validate','door',output('door')).status,0);
 r=run('prepare','door-open',join(dir,'open-source.png'),'--out',output('door-open'));assert.equal(r.status,0,r.stderr);assert.equal(run('validate','door',output('door')).status,0);
 const shifted=spawnSync(python,['-c',`from PIL import Image
import sys
im=Image.open(sys.argv[1]);out=Image.new('RGBA',im.size);out.paste(im,(1,0));out.save(sys.argv[1])`,output('door-open')],{encoding:'utf8'});assert.equal(shifted.status,0,shifted.stderr);assert.notEqual(run('validate','door',output('door')).status,0,'pair drift must fail');
});
test('all current manifest paths and unchanged SVG placeholders validate',()=>{
 const result=run('validate-manifest');assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.split('Manifest path OK:').length-1,Object.keys(spriteManifest.assets).length);
});
test('external prompts contain exact manifest production dimensions and pair registration',()=>{
 for(const key of ['door','gate-open','wall','corner']){const r=run('prompt',key);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/1024x1024/);assert(r.stdout.includes(`${key}.png`));assert.match(r.stdout,/PIVOT: \[0.5, 0.5\]/);}
 assert.match(run('prompt','gate-open').stdout,/256x256 pixels; 56x56 SVG world units/);
 assert.match(run('prompt','corner').stdout,/128x128 pixels; 8x8 SVG world units/);
 assert.match(run('prompt','door-open').stdout,/orionis-door-b001.zip/);assert.match(run('prompt','crate').stdout,/exactly three visual variants/);
 const floor=run('prompt','floor-indoor').stdout;
 assert.match(floor,/light neutral cool-gray sci-fi facility floor/);
 assert.match(floor,/Uniform diffuse illumination/);assert.match(floor,/Inspect a 3x3 repeat/);
 assert.match(floor,/No outer frame.*light strips/);assert.match(floor,/None; material fills every pixel/);
 assert.doesNotMatch(floor,/Soft upper-left|supply the public visual subject|minimum transparent runtime border/);
 const promptPath=join(dir,'floor prompt.txt');
 const saved=run('prompt','floor-indoor','--out',promptPath);
 assert.equal(saved.status,0,saved.stderr);assert.equal(readFileSync(promptPath,'utf8'),floor);
 assert.match(saved.stdout,/Prompt written:/);
 assert.notEqual(run('prompt','floor-indoor','--out').status,0);
});
test('reference-sheet workflow applies only to ordinary transparent assets',()=>{
 for(const [key,entry] of Object.entries(spriteManifest.assets)){
  const result=run('prompt',key);assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/VARIANT DESIGN BRIEF/);
  for(const variant of ['v01','v02','v03'])assert.match(result.stdout,new RegExp(`${variant} — `));
  assert.match(result.stdout,/at least three major visible shape features/);
  assert.match(result.stdout,/in grayscale/);
  assert.match(result.stdout,/Keep the same palette across all three/);
  assert.doesNotMatch(result.stdout,/VARIATION: Change surface details|Vary only secondary visual details/);
  if(entry.pair)assert.match(result.stdout,/Design may differ BETWEEN.*within each pair/);
  if(entry.opaque)assert.match(result.stdout,/do not invent visible features to force variety/);
  if(entry.opaque||entry.pair){
   assert.match(result.stdout,/ASSET-SPECIFIC PRODUCTION WORKFLOW/);
   assert.doesNotMatch(result.stdout,/Generate one reference image|Center each subject on its own/);
   assert.match(result.stdout,entry.opaque?/three separate full-canvas opaque seamless floor sources/:/three registered matching-state pairs/);
  }else{
   assert.match(result.stdout,/exactly three variations.*horizontally in three clearly separated columns/);
   assert.match(result.stdout,/intermediate production sheet, not the delivered asset/);
   assert.match(result.stdout,/1024×1024 transparent canvas/);
   assert.match(result.stdout,/Preserve proportions without stretching/);
   assert.match(result.stdout,/Verify the ZIP and provide a clickable download link/);
   assert.match(result.stdout,/Do not include the intermediate sheet, previews/);
   for(const variant of ['01','02','03'])assert(result.stdout.includes(`${key}__v${variant}__source.png`));
   assert(result.stdout.includes(`orionis-${key}-bNNN.zip`));
  }
 }
});
test('batch prompts cover every asset with filled subjects, paired states and no overwrite',()=>{
 const out=join(dir,'all prompts');const result=run('prompts','--out',out);
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/48 prompts covering all 50 assets/);
 const files=readdirSync(out).filter(file=>file.endsWith('.txt'));assert.equal(files.length,48);
 assert.equal(files[0],'01-floor-indoor-prompt.txt');
 assert.equal(readdirSync(join(out,'profiles')).filter(file=>file.endsWith('.txt')).length,9);
 assert.match(readFileSync(join(out,'profiles','technician-profile-prompt.txt'),'utf8'),/technician__v01__profile-source.png/);
 for(const file of files)assert.doesNotMatch(readFileSync(join(out,file),'utf8'),/\[supply the public visual subject/);
 assert.match(readFileSync(join(out,'05-door-prompt.txt'),'utf8'),/door-open__vNN__source.png/);
 assert.match(readFileSync(join(out,'06-gate-prompt.txt'),'utf8'),/gate-open__vNN__source.png/);
 assert.match(readFileSync(join(out,'README.md'),'utf8'),/do not generate their open states independently/);
  assert.match(readFileSync(join(out,'README.md'),'utf8'),/three different shape\/design styles, not colorways/);
 assert.notEqual(run('prompts','--out',out).status,0);
 assert.notEqual(run('prompts','--out').status,0);
});
test('strict variant ZIPs unpack only after complete validation; unsafe/incomplete/bad batches write nothing',()=>{
 const make=(group,batch,kind)=>{
  const path=join(dir,`orionis-${group}-b${batch}.zip`);
  const r=spawnSync(python,['-c',`from pathlib import Path
import sys,zipfile
p=Path(sys.argv[1]);out=Path(sys.argv[2]);group=sys.argv[3];kind=sys.argv[4];root=out.stem
keys=[group]+(['door-open'] if group=='door' and kind!='missing-pair' else [])
with zipfile.ZipFile(out,'w') as z:
 for key in keys:
  for v in range(1,4): z.write(p/('bad.png' if kind=='bad-size' else 'source.png'),f'{root}/{key}__v{v:02d}__source.png')
 if kind=='unsafe': z.writestr('../escape.png',b'bad')
`,dir,path,group,kind],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return path;
 };
 const out=join(dir,'unpacked');let result=run('unpack',make('crate','001','valid'),'--out',out);assert.equal(result.status,0,result.stderr);assert.equal(readdirSync(join(out,'orionis-crate-b001')).length,3);
 assert.notEqual(run('unpack',join(dir,'orionis-crate-b001.zip'),'--out',out).status,0,'must not overwrite extracted batch');
 result=run('unpack',make('door','001','valid'),'--out',out);assert.equal(result.status,0,result.stderr);assert.equal(readdirSync(join(out,'orionis-door-b001')).length,6);
 for(const [group,batch,kind] of [['crate','002','unsafe'],['crate','003','bad-size'],['door','002','missing-pair']]){
  assert.notEqual(run('unpack',make(group,batch,kind),'--out',out).status,0);assert(!existsSync(join(out,`orionis-${group}-b${batch}`)),'invalid ZIP must leave no extracted folder');
 }
 assert(!existsSync(join(dir,'escape.png')));
});
