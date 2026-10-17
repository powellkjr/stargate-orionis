import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync,existsSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {rigParts,rigTemplate,rigParents,rigOrder,rigPose,validateRig,rigPartMatrix} from '../shared/sprites/character-rig.mjs';
import {rigSourceMetadata,characterRigPrompts} from '../shared/sprites/character-rig-prompts.mjs';
import {rigImage} from './rig-renderer.mjs';
import {spritePresentation} from './sprite-renderer.mjs';
const rig={version:2,id:'technician_v01',sourceCanvas:1024,canvas:128,parts:Object.fromEntries(rigParts.map(p=>[p,{src:`../shared/sprites/offworld/rigs/proof/${p}.png`,pivot:rigTemplate[p].map(v=>v/8),parent:rigParents[p],z:rigOrder[p]}]))};
test('Layer rendering preserves input, joints, draw order and repeated-frame determinism',()=>{
 const before=JSON.stringify(rig),html=rigImage('technician',rig,100,200,{state:'WALK',timeMs:0});
 assert.equal(JSON.stringify(rig),before);assert.equal(html,rigImage('technician',rig,100,200,{state:'WALK',timeMs:0}));
 assert.equal([...html.matchAll(/data-rig-part=/g)].length,11);
 assert(html.indexOf('data-rig-part="left_upper_arm"')<html.indexOf('data-rig-part="torso"'));
 assert(html.indexOf('data-rig-part="head"')<html.indexOf('data-rig-part="torso"'),'Torso collar must cover head-owned neck overlap');
 assert.match(html,/data-rig-parent="left_upper_arm"/);assert.match(html,/transform="matrix\(/);
 assert.match(rigImage('technician',rig,100,200,{state:'DOWN'}),/rotate\(90\)/);
 assert.throws(()=>validateRig({...rig,parts:{}}));
 const invalid=structuredClone(rig);invalid.parts.head.src='javascript:bad';assert.throws(()=>validateRig(invalid));
 invalid.parts.head=rig.parts.head;invalid.parts.torso={...rig.parts.torso,parent:'head'};assert.throws(()=>validateRig(invalid));
});
test('Four-phase walk is bounded, periodic and independent of simulation state',()=>{
 assert.equal(rigPose('WALK',0).scaleY.left_upper_leg,.92);assert.equal(rigPose('WALK',150).scaleY.left_upper_leg,1);assert.equal(rigPose('WALK',300).scaleY.left_upper_leg,1.08);
 assert.deepEqual(rigPose('WALK',600),rigPose('WALK',0));
 assert.equal(rigPose('WALK',75).scaleY.left_upper_leg,.96);
 for(let t=0;t<1000;t+=7){const pose=rigPose('WALK',t);assert(Math.abs(pose.torsoY)<=.25);for(const part of rigParts){const m=rigPartMatrix(rig,pose,part);assert.equal(m[0],1);assert.equal(m[1],0);assert.equal(m[2],0);assert.equal(m[4],0);}}
 const unit={unitId:'proof',name:'Proof',profession:'TECHNICIAN',health:100,partyStatus:'STATIONED'},before=JSON.stringify(unit);
 spritePresentation.unit(unit,{x:10,y:20});assert.equal(JSON.stringify(unit),before);
 assert.deepEqual(rigPose('IDLE',0),rigPose('IDLE',999));assert.deepEqual(rigPose('STATIONED'),rigPose('IDLE'));
});
test('Rig prompts provide one master, eleven registered parts and exact template coordinates',()=>{
 assert.equal(characterRigPrompts.length,12);
 for(const p of characterRigPrompts){assert.match(p.text,/STRICT RGB SOURCE PALETTE/);assert.match(p.text,/No per-part alpha-bounds crop/);assert.match(p.text,/Anatomical left/);}
 const dir=join(mkdtempSync(join(tmpdir(),'rig-prompts-')),'queue');
 const run=()=>spawnSync(process.execPath,['demos/offworld-sandbox/prepare-sprite.mjs','rig-prompts','--out',dir],{encoding:'utf8'});
 let r=run();assert.equal(r.status,0,r.stderr);assert.equal(readdirSync(dir).length,14);
 assert.deepEqual(JSON.parse(readFileSync(join(dir,'rig.json'))),rigSourceMetadata);assert.notEqual(run().status,0);
});
test('Elbows and knees follow their parent while bending around their own attachment',()=>{
 const point=(m,[x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
 for(const [child,parent] of [['left_forearm','left_upper_arm'],['right_forearm','right_upper_arm'],['left_lower_leg','left_upper_leg'],['right_lower_leg','right_upper_leg']]){
  const pose={...rigPose('WALK',75),[parent]:12,[child]:-15};
  const expected=point(rigPartMatrix(rig,pose,parent),rig.parts[child].pivot),actual=point(rigPartMatrix(rig,pose,child),rig.parts[child].pivot);
  actual.forEach((value,i)=>assert(Math.abs(value-expected[i])<1e-10));
 }
 const bent=rigImage('technician',rig,0,0,{jointAngles:{left_forearm:15}});
 assert.notEqual(bent,rigImage('technician',rig,0,0));
 assert.throws(()=>rigImage('technician',rig,0,0,{jointAngles:{torsoY:12}}));
 assert.throws(()=>rigImage('technician',rig,0,0,{jointAngles:{left_forearm:NaN}}));
 assert.throws(()=>validateRig({...rig,version:1}),'Historical seven-part rigs need explicit conversion');
});
test('Shared-canvas preparation preserves registration and rejects invalid sets before writes',()=>{
 const dir=mkdtempSync(join(tmpdir(),'rig-source-')),out=join(dir,'prepared'),python=process.env.SPRITE_PYTHON??'python';
 writeFileSync(join(dir,'rig.json'),JSON.stringify(rigSourceMetadata));
 let r=spawnSync(python,['-c',`from PIL import Image, ImageDraw
import json,sys
from pathlib import Path
p=Path(sys.argv[1]);data=json.loads((p/'rig.json').read_text())
for key,part in data['parts'].items():
 im=Image.new('RGBA',(1024,1024));d=ImageDraw.Draw(im);x,y=part['pivot']
 if key!='equipment': d.rectangle((x-24,y-24,x+24,y+48),fill=(146,147,148,255))
 im.save(p/part['file'])
`,dir],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 const contract=JSON.stringify({parts:rigParts,pivots:rigTemplate,parents:rigParents,order:rigOrder});
 const run=target=>spawnSync(python,['demos/offworld-sandbox/prepare-character-rig.py',dir,target,contract],{encoding:'utf8'});
 r=run(out);assert.equal(r.status,0,r.stderr);const prepared=JSON.parse(readFileSync(join(out,'rig.json')));validateRig(prepared);
 assert.equal(readdirSync(out).length,12);assert.deepEqual(prepared.parts.head.pivot,[64,50]);
 r=spawnSync(python,['-c',`from PIL import Image
import sys
from pathlib import Path
p=Path(sys.argv[1]);im=Image.open(p/'char_technician_v01__head.png')
assert im.size==(128,128) and im.mode=='RGBA'
assert im.getpixel((64,50))[3]>=250
assert im.getpixel((64,90))[3]==0
assert Image.open(p/'char_technician_v01__equipment.png').getchannel('A').getbbox() is None
`,out],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 assert.notEqual(run(out).status,0);
 const bad=structuredClone(rigSourceMetadata);bad.parts.head.pivot=[0,0];writeFileSync(join(dir,'rig.json'),JSON.stringify(bad));
 const badOut=join(dir,'bad');assert.notEqual(run(badOut).status,0);assert(!existsSync(badOut));
 writeFileSync(join(dir,'rig.json'),JSON.stringify(rigSourceMetadata));
 r=spawnSync(python,['-c',`from PIL import Image
import sys
Image.new('RGB',(1024,1024),(146,147,148)).save(sys.argv[1])
`,join(dir,rigSourceMetadata.parts.head.file)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 assert.notEqual(run(badOut).status,0);assert(!existsSync(badOut),'Bad PNG must not produce a partial output directory');
});
