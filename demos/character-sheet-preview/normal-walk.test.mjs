import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {normalWalk,fitShirtArms} from './normal-walk.mjs';
import {samplePose} from './spriter.mjs';
const pack=new URL('../../artwork/zombie-tds-main-characters/preview-data.json',import.meta.url);

test('shirt shoulder fit retains source sides and fits each arm segment pair independently',{skip:!existsSync(pack)},()=>{
 for(const c of JSON.parse(readFileSync(pack)).characters){
  const original=normalWalk(c),before=JSON.stringify(original),fitted=fitShirtArms(c,original);assert.equal(JSON.stringify(original),before);
  const registered=samplePose(c,fitted,0);
  const frame=original.mainline[0],rootIds=[3,7].map(z=>frame.objects.find(o=>o.z_index===z).parent);
  const native=samplePose(c,original,0);
  const localPoint=(image,point)=>{const r=image.angle*Math.PI/180,dx=point.x-image.x,dy=point.y-image.y;return [(dx*Math.cos(r)+dy*Math.sin(r))/image.scale_x,(-dx*Math.sin(r)+dy*Math.cos(r))/image.scale_y];};
  const worldPoint=(image,[x,y])=>{const r=image.angle*Math.PI/180;return [image.x+x*image.scale_x*Math.cos(r)-y*image.scale_y*Math.sin(r),image.y+x*image.scale_x*Math.sin(r)+y*image.scale_y*Math.cos(r)];};
  for(const [z,otherZ] of [[3,3],[7,7]]){
   const from=native.objects.find(o=>o.z===otherZ),to=registered.objects.find(o=>o.z===z);
   const fromRoot=native.bones.find(b=>b.id===frame.objects.find(o=>o.z_index===otherZ).parent),toRoot=registered.bones.find(b=>b.id===frame.objects.find(o=>o.z_index===z).parent);
   const fromElbow=native.bones.find(b=>b.parent===fromRoot.id),toElbow=registered.bones.find(b=>b.parent===toRoot.id);
   for(const [fromJoint,toJoint] of [[fromRoot,toRoot],[fromElbow,toElbow]]){
    const point=worldPoint(to,localPoint(from,fromJoint));
    assert(Math.hypot(point[0]-toJoint.x,point[1]-toJoint.y)<1e-5,'Scaled shoulder and elbow landmarks must register to their original bone chain');
   }
  }
  for(let time=0;time<800;time+=25){
   const source=samplePose(c,original,time),actual=samplePose(c,fitted,time);
   const chains=p=>rootIds.map(id=>{const root=p.bones.find(b=>b.id===id),elbow=p.bones.find(b=>b.parent===id),wrist=p.bones.find(b=>b.parent===elbow.id);return [Math.hypot(elbow.x-root.x,elbow.y-root.y),Math.hypot(wrist.x-elbow.x,wrist.y-elbow.y)];});
   const neutral=chains(samplePose(c,original,0)),target=[0,1].map(i=>(neutral[0][i]+neutral[1][i])/2),lengths=chains(actual);
   for(const [side,pair] of lengths.entries()){
    assert(Math.abs(pair[0]-target[0])<1e-5,'Left/right upper-arm lengths must match');
    assert(Math.abs(pair[1]-target[1])<1e-5,'Left/right forearm lengths must match');
   }
   for(const o of actual.objects.filter(o=>o.z>=2)){
    const s=source.objects.find(s=>s.z===o.z);assert(Math.abs(Math.abs(o.scale_x)-Math.abs(o.scale_y))<1e-7,'Arm art must retain its aspect ratio');assert.equal(o.file.src,s.file.src,'Arm pieces must retain original sides');
    if([3,7].includes(o.z)){const side=o.z===3?0:1,factor=target[0]/neutral[side][0];assert(Math.abs(Math.abs(o.scale_x)-Math.abs(s.scale_x)*factor)<1e-7,'Upper-arm image must use its paired-length scale factor');}
    if([3,4,5,7].includes(o.z)){assert.equal(o.pivot_x,s.pivot_x);assert.equal(o.pivot_y,s.pivot_y);}
    if([3,4,5,7].includes(o.z)){
     const ref=fitted.mainline[0].objects.find(r=>r.z_index===o.z),joint=actual.bones.find(b=>b.id===ref.parent),restJoint=registered.bones.find(b=>b.id===ref.parent),rest=registered.objects.find(r=>r.z===o.z);
     assert(Math.abs(o.x-joint.x-(rest.x-restJoint.x))<1e-5&&Math.abs(o.y-joint.y-(rest.y-restJoint.y))<1e-5,'Arm image must not drift relative to its joint');
     assert(Math.abs(((o.angle-rest.angle+540)%360)-180)<1e-5,'Arm image must not wobble independently');
    }
    if([6,9].includes(o.z)){assert.equal(o.pivot_x,.5);assert.equal(o.pivot_y,.85);}
   }
   for(const o of actual.objects.filter(o=>o.z===2)){const s=source.objects.find(s=>s.z===o.z);assert(Math.abs(o.x-s.x)<1e-7);assert(Math.abs(o.y-s.y)<1e-7);}
   const head=actual.objects.find(o=>o.z===8),torso=actual.objects.find(o=>o.z===2),r=head.angle*Math.PI/180;
   const headCenter=head.x+head.file.width*(.5-head.pivot_x)*Math.cos(r)-head.file.height*(.5-head.pivot_y)*Math.sin(r);
   assert(Math.abs(headCenter-(torso.x+(.52-torso.pivot_x)*torso.file.width))<torso.file.width*.04,'Head should retain its small authored sway around shirt center');
   const shoulders=rootIds.map(id=>actual.bones.find(b=>b.id===id));
   assert(Math.abs(shoulders[0].y-shoulders[1].y)<1e-5,'Shoulder joints must stay level');
   assert(Math.abs((shoulders[0].x+shoulders[1].x)/2-(torso.x+(.52-torso.pivot_x)*torso.file.width))<1e-5,'Shoulder joints must bracket shirt center');
   assert(Math.abs(shoulders[1].x-shoulders[0].x-torso.file.width*.88)<1e-5,'Shoulder pivots must reach the outer shirt edges');
   const direction=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
   for(const [i,id] of rootIds.entries()){
    const shoulder=actual.bones.find(b=>b.id===id),elbow=actual.bones.find(b=>b.parent===id),wrist=actual.bones.find(b=>b.parent===elbow.id),side=i===0?-1:1;
    assert(Math.abs(direction(shoulder,elbow)-(-90+side*15))<.05,'Upper arms must share mirrored inward posture');
    assert(Math.abs(direction(elbow,wrist)-(-90-side*5))<.05,'Elbow bends must match on both sides');
   }
  }
  const first=samplePose(c,fitted,0);
  const seam=samplePose(c,fitted,800-1e-5);
  for(const o of first.objects){const s=seam.objects.find(s=>s.z===o.z);for(const key of ['x','y','angle'])assert(Math.abs(o[key]-s[key])<.001,`${c.name}/${o.z}/${key} fitted seam`);}
  for(const id of rootIds){const elbow=first.bones.find(b=>b.parent===id),wrist=first.bones.find(b=>b.parent===elbow.id);assert(wrist.y<elbow.y,'Forearm must face down');}
 }
});

test('square walk legs keep separate lanes and sleeve/leg transitions stay continuous at 500 and 594 ms',{skip:!existsSync(pack)},()=>{
 for(const c of JSON.parse(readFileSync(pack)).characters){
  const a=fitShirtArms(c,normalWalk(c)),initial=samplePose(c,a,0);
  const legs=p=>p.objects.filter(o=>o.z<2);
  const lanes=legs(initial).map(o=>o.x-initial.objects.find(o=>o.z===2).x),authored=normalWalk(c),seen=[new Set(),new Set()];
  for(let t=0;t<800;t++){
   const p=samplePose(c,a,t),next=samplePose(c,a,t+1),torso=p.objects.find(o=>o.z===2);
   for(const o of legs(p)){assert.equal(o.file.src,legs(samplePose(c,authored,t)).find(s=>s.z===o.z).file.src,'Raised/extended frame timing must remain authored');seen[o.z].add(o.file.src);assert(Math.abs(o.x-torso.x-lanes[o.z])<1e-6,'Leg crossed its lane');assert(Math.abs(o.angle)<1e-5,'Source thighs must remain above their boots');assert.equal(o.pivot_x,.5);assert.equal(o.pivot_y,1);}
   assert(p.bones.some(b=>b.name==='left_hip')&&p.bones.some(b=>b.name==='right_hip'),'Separate hip bones missing');
   for(const side of ['left','right']){
    const hip=p.bones.find(b=>b.name===`${side}_hip`),knee=p.bones.find(b=>b.name===`${side}_knee`),ankle=p.bones.find(b=>b.name===`${side}_ankle`);
    assert(knee&&ankle,'Separate knee/ankle bones missing');assert.equal(knee.parent,hip.id);assert.equal(ankle.parent,knee.id);
    assert(knee.y<hip.y&&ankle.y<knee.y,'Leg bone chain must extend forward, not invert');
    assert(Math.abs(hip.y-(torso.y+((1-torso.pivot_y)-.50)*torso.file.height))<1e-5,'Hip must sit back inside the torso');
   }
   for(const o of p.objects.filter(o=>[0,1,7].includes(o.z))){const n=next.objects.find(n=>n.z===o.z);assert(Math.hypot(o.x-n.x,o.y-n.y)<2,`${c.name}/${o.z}/${t} position pop`);const rotation=((n.angle-o.angle+540)%360)-180;assert(Math.abs(rotation)<2,`${c.name}/${o.z}/${t} angle pop`);}
  }
  assert(seen.every(files=>files.size===2),'Both raised-knee and extended leg images must appear');
  for(const [time,advancing] of [[198,0],[594,1]]){
   const p=samplePose(c,a,time),front=legs(p).find(o=>o.z===advancing),rear=legs(p).find(o=>o.z!==advancing);
   assert(front.file.name.includes('_leg_0002'),'Advancing leg must use its extended image');
   assert(rear.file.name.includes('_leg_0001'),'Other leg must use its raised image');
   assert(front.y<rear.y,'Foot appearance and forward stride must be on the same side');
  }
 }
});
test('normal walk is unarmed, animated, seamless and leaves purchased animations untouched',{skip:!existsSync(pack)},()=>{
 const data=JSON.parse(readFileSync(pack));
 for(const c of data.characters){
  const original=JSON.stringify(c),a=normalWalk(c);assert.equal(JSON.stringify(c),original);
  assert(a.looping&&a.derived);assert.equal(a.frames.length,0);
  const start=samplePose(c,a,0),middle=samplePose(c,a,a.length/4),seam=samplePose(c,a,a.length-1e-5);
  assert.notDeepEqual(start.bones.map(b=>[b.x,b.y]),middle.bones.map(b=>[b.x,b.y]));
  const hands=start.objects.filter(o=>/knife1_000[39]_(man3|girl3)/.test(o.file.name));assert.equal(hands.length,2);
  assert(start.objects.every(o=>!o.file.name.includes('_knife')));
  for(let i=0;i<start.objects.length;i++)for(const key of ['x','y','angle','scale_x','scale_y'])assert(Math.abs(start.objects[i][key]-seam.objects[i][key])<.001,`${c.name}/${i}/${key} seam`);
  for(let time=0;time<a.length;time+=25){
   const pose=samplePose(c,a,time);
   const authored=samplePose(c,c.animations.find(a=>a.name==='Walk_bat'),time);
   for(const bone of authored.bones.filter(b=>b.parent!==undefined)){
    const originalParent=authored.bones.find(b=>b.id===bone.parent);
    const actual=pose.bones.find(b=>b.id===bone.id),parent=pose.bones.find(b=>b.id===bone.parent);
    assert(Math.abs(Math.hypot(actual.x-parent.x,actual.y-parent.y)-Math.hypot(bone.x-originalParent.x,bone.y-originalParent.y))<1e-6,'Authored bone length changed');
   }
   for(const original of authored.objects.filter(o=>[3,4,5,7].includes(o.z))){
    const actual=pose.objects.find(o=>o.file.src===original.file.src);
    for(const key of ['x','y','angle','scale_x','scale_y','pivot_x','pivot_y'])assert.equal(actual[key],original[key],`${c.name}/${original.file.name}/${key}`);
   }
   for(const o of pose.objects)assert.equal(o.scale_x<0?-o.scale_x:o.scale_x,o.scale_y,'Nonuniform image compression');
  }
 }
});

test('neutral walk preserves authored rifle leg transforms and alternate images',{skip:!existsSync(pack)},()=>{
 for(const c of JSON.parse(readFileSync(pack)).characters){
  const source=c.animations.find(a=>a.name==='Walk_riffle'),normal=normalWalk(c);
  const feet=pose=>pose.objects.filter(o=>o.file.name.includes('_leg_'));
  const initial=feet(samplePose(c,source,0)),derived=feet(samplePose(c,normal,0));
  const shift=[initial[0].x-derived[0].x,initial[0].y-derived[0].y];
  const images=new Set();
  for(let time=0;time<800;time+=7){
   const expected=feet(samplePose(c,source,time)),actual=feet(samplePose(c,normal,time));
   for(let i=0;i<2;i++){
    assert.equal(actual[i].file.src,expected[i].file.src);images.add(actual[i].file.name);
    for(const key of ['angle','scale_x','scale_y','pivot_x','pivot_y'])assert(Math.abs(actual[i][key]-expected[i][key])<1e-6,`${c.name}/${time}/${key}`);
    assert(Math.abs(actual[i].x+shift[0]-expected[i].x)<1e-6);
    assert(Math.abs(actual[i].y+shift[1]-expected[i].y)<1e-6);
   }
  }
  assert([...images].some(name=>name.includes('_leg_0002')));
  const bat=c.animations.find(a=>a.name==='Walk_bat');
  const expectedShoulders=samplePose(c,bat,0).objects.filter(o=>o.z===3||o.z===7);
  for(let t=0;t<800;t+=25){
   const actualShoulders=samplePose(c,normal,t).objects.filter(o=>expectedShoulders.some(s=>s.file.src===o.file.src));
   assert.equal(actualShoulders.length,2);
   for(const o of actualShoulders){const authored=expectedShoulders.find(s=>s.file.src===o.file.src);assert.equal(o.scale_x,authored.scale_x);assert.equal(o.scale_y,authored.scale_y);}
  }
 }
});
