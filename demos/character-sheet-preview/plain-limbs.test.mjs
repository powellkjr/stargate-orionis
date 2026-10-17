import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const root=new URL('../../artwork/zombie-tds-main-characters/',import.meta.url);
const manifest=new URL('plain-limbs-v01/index.json',root);
test('plain side-specific parts retain source frames, pivots and untouched original files',{skip:!existsSync(manifest)},()=>{
 const parts=JSON.parse(readFileSync(manifest)).parts,characters=JSON.parse(readFileSync(new URL('preview-data.json',root))).characters;
 assert.equal(parts.length,54);assert.equal(new Set(parts.map(p=>p.src)).size,54);
 const dimensions=path=>{const png=readFileSync(new URL(path,root));assert.equal(png.subarray(1,4).toString(),'PNG');return [png.readUInt32BE(16),png.readUInt32BE(20)];};
 for(const c of characters){
  const entries=parts.filter(p=>p.character===c.name);assert.equal(entries.length,27);
  for(const side of ['left','right'])assert.deepEqual(entries.filter(p=>p.side===side&&(p.variant??'plain')==='plain').map(p=>p.part).sort(),['forearm','leg-long','leg-short','upper-arm']);
  for(const side of ['left','right'])for(const variant of ['long','short'])assert.deepEqual(entries.filter(p=>p.side===side&&p.variant===variant).map(p=>p.part).sort(),['forearm','upper-arm']);
  for(const p of entries){
   const original=Object.values(c.files).find(f=>f.src===p.source);assert(original);
   assert.deepEqual(dimensions(p.src),[original.width,original.height]);assert.deepEqual(dimensions(p.map),dimensions(p.src));
   assert.equal(p.pivot_x,original.pivot_x??0);assert.equal(p.pivot_y,original.pivot_y??1);
   assert.equal(createHash('sha256').update(readFileSync(new URL(p.source,root))).digest('hex'),p.sha256);
   assert(!p.source.includes('Death/'));
  }
 }
});

// Decode Pillow's 8-bit grayscale ID maps to check sleeve/skin separation.
function maskPixels(path){
 const png=readFileSync(new URL(path,root)),width=png.readUInt32BE(16),height=png.readUInt32BE(20),chunks=[];
 assert.equal(png[24],8);assert.equal(png[25],0);
 for(let i=8;i<png.length;){const length=png.readUInt32BE(i);if(png.subarray(i+4,i+8).toString()==='IDAT')chunks.push(png.subarray(i+8,i+8+length));i+=length+12;}
 const raw=inflateSync(Buffer.concat(chunks)),ids=new Uint8Array(width*height);
 for(let y=0;y<height;y++){const filter=raw[y*(width+1)];for(let x=0;x<width;x++){
  const i=y*width+x,a=x?ids[i-1]:0,b=y?ids[i-width]:0,c=x&&y?ids[i-width-1]:0;
  const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
  const predictor=[0,a,b,Math.floor((a+b)/2),pa<=pb&&pa<=pc?a:pb<=pc?b:c][filter];
  assert(predictor!==undefined);ids[i]=(raw[y*(width+1)+x+1]+predictor)&255;
 }}return ids;
}
function maskIds(path){return new Set(maskPixels(path));}
test('profession tops provide distinct shirt, gear and accent channels without changing rig registration',{skip:!existsSync(manifest)},()=>{
 const parts=JSON.parse(readFileSync(manifest)).parts;
 const expected={technician:[0,1,4],scientist:[0,1],medic:[0,1,4],scout:[0,1,3],soldier:[0,1,2,3],diplomat:[0,1,3,4]};
 for(const character of ['Man','Girl']){
  const tops=parts.filter(p=>p.character===character&&p.part==='torso'&&p.variant!=='plain');assert.equal(tops.length,6);
  assert.equal(new Set(tops.map(p=>createHash('sha256').update(readFileSync(new URL(p.src,root))).digest('hex'))).size,6);
  for(const top of tops){assert.deepEqual([...maskIds(top.map)].sort(),expected[top.variant]);assert(top.label);}
 }
});
test('backpack-free torso surfaces retain authored frames without an invented neck patch',{skip:!existsSync(manifest)},()=>{
 const torsos=JSON.parse(readFileSync(manifest)).parts.filter(p=>p.part==='torso'&&p.variant==='plain');assert.equal(torsos.length,2);
 for(const p of torsos){
  assert.equal(p.z,2);assert.equal(p.side,'center');assert.deepEqual([...maskIds(p.map)].sort(),[0,1]);
  assert(existsSync(new URL(p.src.replace(/\.png$/,'.svg'),root)));
  const pixels=maskPixels(p.map);assert(pixels.filter(v=>v===1).length>pixels.length*.25,'Shirt surface must cover the removed strap gaps');
 }
});
test('compact legs retain the top hip anchor and preserve both authored stride alternatives',{skip:!existsSync(manifest)},()=>{
 const compact=JSON.parse(readFileSync(manifest)).parts.filter(p=>p.variant==='compact');assert.equal(compact.length,8);
 for(const p of compact){assert(p.part.startsWith('leg-'));const ids=maskPixels(p.map);assert(ids.slice(p.width*Math.ceil(p.height*.41)).every(v=>v===0));assert(ids.some(v=>v!==0));}
});
test('short sleeves expose skin and long sleeves cover it on each independent arm',{skip:!existsSync(manifest)},()=>{
 const parts=JSON.parse(readFileSync(manifest)).parts;
 for(const c of ['Man','Girl'])for(const side of ['left','right']){
  const ids=(variant,part)=>maskIds(parts.find(p=>p.character===c&&p.side===side&&p.variant===variant&&p.part===part).map);
  assert(ids('short','upper-arm').has(1)&&ids('short','upper-arm').has(5),'Short sleeve needs cloth and skin');
  assert(ids('short','forearm').has(5),'Short forearm must expose skin');
  for(const part of ['upper-arm','forearm']){assert(ids('long',part).has(1),'Long sleeve needs cloth');assert(!ids('long',part).has(5),'Long sleeve exposes skin');}
 }
});

test('derived lower arms have no accessory masks and separate editable side surfaces',{skip:!existsSync(manifest)},()=>{
 const parts=JSON.parse(readFileSync(manifest)).parts.filter(p=>p.part==='forearm');
 assert.equal(parts.length,12);
 for(const part of parts){
  const pixels=maskPixels(part.map);assert(pixels.filter(id=>id===1||id===5).length>pixels.length*.2,'Clean forearm surface missing');
  const ids=new Set(pixels);assert(!ids.has(2)&&!ids.has(3)&&!ids.has(4),'Accessory channel remains on cleaned forearm');
  const svg=new URL(part.src.replace(/\.png$/,'.svg'),root);assert(existsSync(svg),'Editable forearm vector missing');
 }
});
