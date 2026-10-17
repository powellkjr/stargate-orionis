import {samplePose} from './spriter.mjs';

function normalizeAngles(timeline){
 for(const key of timeline.keys)key.transform.angle=((key.transform.angle??0)%360+360)%360;
 for(let i=0;i<timeline.keys.length;i++){
  const key=timeline.keys[i],next=timeline.keys[(i+1)%timeline.keys.length],delta=((next.transform.angle-key.transform.angle+540)%360)-180;
  key.spin=Math.abs(delta)<1e-7?0:Math.sign(delta);
 }
}

// Local preview fit for the corrected backpack-free shirt. Move shoulder roots
// and rotate the two arm segments. Fit each segment pair independently.
export function fitShirtArms(character,source){
 const animation=structuredClone(source),pose=samplePose(character,animation,0),first=animation.mainline[0];
 const sourceLengths=[3,7].map(z=>{
  const root=pose.bones.find(b=>b.id===first.objects.find(o=>o.z_index===z).parent),elbow=pose.bones.find(b=>b.parent===root.id),wrist=pose.bones.find(b=>b.parent===elbow.id);
  return [Math.hypot(elbow.x-root.x,elbow.y-root.y),Math.hypot(wrist.x-elbow.x,wrist.y-elbow.y)];
 });
 const targetLengths=[0,1].map(i=>(sourceLengths[0][i]+sourceLengths[1][i])/2);
 for(const [upperZ,lowerZ,side,x] of [[3,4,-1,.08],[7,5,1,.96]]){
  const upperRef=first.objects.find(o=>o.z_index===upperZ),lowerRef=first.objects.find(o=>o.z_index===lowerZ);
  const root=pose.bones.find(b=>b.id===upperRef.parent),elbow=pose.bones.find(b=>b.id===lowerRef.parent);
  const wrist=pose.bones.find(b=>b.parent===elbow.id),parent=pose.bones.find(b=>b.id===root.parent);
  const direction=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  const upperDirection=-90+side*15,lowerDirection=-90-side*5;
  const rootTimeline=animation.timelines[first.bones.find(b=>b.id===root.id).timeline];
  const lowerTimeline=animation.timelines[first.bones.find(b=>b.id===elbow.id).timeline];
  // Keep every piece on its original side. Fit upper arms against the paired
  // upper-arm average and forearms against the paired forearm average, so the
  // large/small corrections do not stack on the same side.
  const sideIndex=side===-1?0:1;
  const factors=[0,1].map(i=>targetLengths[i]/sourceLengths[sideIndex][i]);
  for(const [objectRef,child,factor] of [[upperRef,elbow,factors[0]],[lowerRef,wrist,factors[1]]]){
   const boneTimeline=animation.timelines[first.bones.find(b=>b.id===child.id).timeline],neutral={...boneTimeline.keys[0].transform};
   for(const key of boneTimeline.keys){key.transform.x=(neutral.x??0)*factor;key.transform.y=(neutral.y??0)*factor;}
   for(const key of animation.timelines[objectRef.timeline].keys){key.transform.x=(key.transform.x??0)*factor;key.transform.y=(key.transform.y??0)*factor;key.transform.scale_x=(key.transform.scale_x??1)*factor;key.transform.scale_y=(key.transform.scale_y??1)*factor;}
  }
  const rootTimes=[...new Set([...source.mainline.map(k=>k.time??0),...rootTimeline.keys.map(k=>k.time??0),...lowerTimeline.keys.map(k=>k.time??0)])].sort((a,b)=>a-b);
  rootTimeline.keys=rootTimes.map((time,id)=>{
   const at=samplePose(character,source,time),body=at.objects.find(o=>o.z===2),joint=at.bones.find(b=>b.id===root.id),p=at.bones.find(b=>b.id===root.parent),pr=p.angle*Math.PI/180;
   const dx=body.x+(x-body.pivot_x)*body.file.width-p.x,dy=body.y+((1-body.pivot_y)-.48)*body.file.height-p.y;
   const sign=Math.sign(p.scale_x*p.scale_y);
   return {id,time,spin:0,transform:{x:(dx*Math.cos(pr)+dy*Math.sin(pr))/p.scale_x,y:(-dx*Math.sin(pr)+dy*Math.cos(pr))/p.scale_y,angle:(root.angle-p.angle+upperDirection-direction(root,elbow))*sign,scale_x:joint.scale_x/p.scale_x,scale_y:joint.scale_y/p.scale_y}};
  });
  for(const frame of animation.mainline)frame.bones.find(b=>b.id===root.id).key=rootTimes.findLastIndex(t=>t<=(frame.time??0));
  normalizeAngles(rootTimeline);
  const upperFitted=structuredClone(animation);
  for(const key of lowerTimeline.keys){
   const at=samplePose(character,upperFitted,key.time??0),joint=at.bones.find(b=>b.id===elbow.id),end=at.bones.find(b=>b.id===wrist.id),p=at.bones.find(b=>b.id===root.id);
   key.transform.angle=(key.transform.angle??0)+(lowerDirection-direction(joint,end))*Math.sign(p.scale_x*p.scale_y);
  }
  normalizeAngles(lowerTimeline);
  if(upperZ===7){
   // Correct the right sleeve's handedness across its shoulder-to-elbow axis.
   // Reflect the image only: both joints and the downstream arm chain stay put.
   const sleeve=animation.timelines[upperRef.timeline];
   for(const key of sleeve.keys){
    const at=samplePose(character,animation,key.time??0),shoulder=at.bones.find(b=>b.id===root.id),end=at.bones.find(b=>b.id===elbow.id);
    const axis=Math.atan2(end.y-shoulder.y,end.x-shoulder.x)-shoulder.angle*Math.PI/180;
    const c=Math.cos(2*axis),s=Math.sin(2*axis),t=key.transform,x=t.x??0,y=t.y??0;
    t.x=x*c+y*s;t.y=x*s-y*c;t.angle=((2*axis*180/Math.PI-(t.angle??0)+180)%360+360)%360;t.scale_x=-(t.scale_x??1);
   }
   for(let i=0;i<sleeve.keys.length;i++){
    const key=sleeve.keys[i],next=sleeve.keys[(i+1)%sleeve.keys.length],delta=((next.transform.angle-key.transform.angle+540)%360)-180;
    key.spin=Math.abs(delta)<1e-7?0:Math.sign(delta);
   }
  }
 }
 stabilizeArmImages(character,animation);
 // Center the original skull frame on the visible shirt, retaining its Y fit.
 const headRef=first.objects.find(o=>o.z_index===8),headBone=first.bones.find(b=>b.id===headRef.parent);
 for(const key of animation.timelines[headBone.timeline].keys){
  const at=pose,head=at.objects.find(o=>o.z===8),body=at.objects.find(o=>o.z===2),parent=at.bones.find(b=>b.id===headBone.parent),pr=parent.angle*Math.PI/180,hr=head.angle*Math.PI/180;
  const headX=head.x+head.file.width*(.5-head.pivot_x)*head.scale_x*Math.cos(hr)-head.file.height*(.5-head.pivot_y)*head.scale_y*Math.sin(hr);
  const dx=body.x+(.52-body.pivot_x)*body.file.width-headX;
  key.transform.x=(key.transform.x??0)+dx*Math.cos(pr)/parent.scale_x;key.transform.y=(key.transform.y??0)-dx*Math.sin(pr)/parent.scale_y;
 }
 animation.shirtArmFit=true;
 return rebasePelvis(character,squareWalkLegs(character,animation));
}

function stabilizeArmImages(character,animation){
 const source=structuredClone(animation),pose=samplePose(character,source,0),times=source.mainline.map(k=>k.time??0);
 for(const z of [3,4,5,7]){
  const ref=source.mainline[0].objects.find(o=>o.z_index===z),image=pose.objects.find(o=>o.z===z),joint=pose.bones.find(b=>b.id===ref.parent);
  const offset=[image.x-joint.x,image.y-joint.y],template=source.timelines[ref.timeline].keys[0].transform;
  animation.timelines[ref.timeline].keys=times.map((time,id)=>{
   const at=samplePose(character,source,time),parent=at.bones.find(b=>b.id===ref.parent),r=parent.angle*Math.PI/180;
   return {id,time,spin:0,transform:{...template,x:(offset[0]*Math.cos(r)+offset[1]*Math.sin(r))/parent.scale_x,y:(-offset[0]*Math.sin(r)+offset[1]*Math.cos(r))/parent.scale_y,angle:(image.angle-parent.angle)*Math.sign(parent.scale_x*parent.scale_y),scale_x:image.scale_x/parent.scale_x,scale_y:image.scale_y/parent.scale_y,pivot_x:image.pivot_x,pivot_y:image.pivot_y}};
  });
  normalizeAngles(animation.timelines[ref.timeline]);
  for(const frame of animation.mainline)frame.objects.find(o=>o.z_index===z).key=times.findLastIndex(t=>t<=(frame.time??0));
 }
 // Both fists use the same original empty-hand PNG. Register its cuff at the
 // wrist consistently; otherwise unequal old grip offsets mimic unequal arms.
 for(const [z,side] of [[9,-1],[6,1]]){
  const ref=source.mainline[0].objects.find(o=>o.z_index===z),image=pose.objects.find(o=>o.z===z),template=source.timelines[ref.timeline].keys[0].transform;
  animation.timelines[ref.timeline].keys=times.map((time,id)=>{
   const parent=samplePose(character,source,time).bones.find(b=>b.id===ref.parent);
   return {id,time,spin:0,transform:{...template,x:0,y:0,angle:(-side*5-parent.angle)*Math.sign(parent.scale_x*parent.scale_y),scale_x:image.scale_x/parent.scale_x,scale_y:image.scale_y/parent.scale_y,pivot_x:.5,pivot_y:.85}};
  });
  normalizeAngles(animation.timelines[ref.timeline]);
  for(const frame of animation.mainline)frame.objects.find(o=>o.z_index===z).key=times.findLastIndex(t=>t<=(frame.time??0));
 }
}

function rebasePelvis(character,source){
 const animation=structuredClone(source),frame=source.mainline[0],pose=samplePose(character,source,0),torso=pose.objects.find(o=>o.z===2);
 const bodyId=frame.objects.find(o=>o.z_index===2).parent,ref=frame.bones.find(b=>b.id===bodyId),body=pose.bones.find(b=>b.id===bodyId),parent=pose.bones.find(b=>b.id===ref.parent);
 const dx=torso.x+(.52-torso.pivot_x)*torso.file.width-body.x,dy=torso.y+((1-torso.pivot_y)-.50)*torso.file.height-body.y;
 const pr=parent.angle*Math.PI/180,br=body.angle*Math.PI/180;
 const px=(dx*Math.cos(pr)+dy*Math.sin(pr))/parent.scale_x,py=(-dx*Math.sin(pr)+dy*Math.cos(pr))/parent.scale_y;
 const bx=(dx*Math.cos(br)+dy*Math.sin(br))/body.scale_x,by=(-dx*Math.sin(br)+dy*Math.cos(br))/body.scale_y;
 for(const key of animation.timelines[ref.timeline].keys){key.transform.x=(key.transform.x??0)+px;key.transform.y=(key.transform.y??0)+py;}
 animation.timelines[ref.timeline].name='pelvis';
 for(const child of [...frame.bones,...frame.objects].filter(r=>r.parent===bodyId))for(const key of animation.timelines[child.timeline].keys){key.transform.x=(key.transform.x??0)-bx;key.transform.y=(key.transform.y??0)-by;}
 return animation;
}

// Square-shoulder preview walk: fixed left/right lanes with the authored
// raised/extended image timing. Original weapon walks are never edited.
function squareWalkLegs(character,source){
 const animation=structuredClone(source),first=source.mainline[0],length=source.length;
 const times=[...new Set([...Array.from({length:17},(_,i)=>i*length/16),...first.objects.filter(o=>o.z_index<2).flatMap(o=>source.timelines[o.timeline].keys.map(k=>k.time??0))])].sort((a,b)=>a-b),bodyRef=first.objects.find(o=>o.z_index===2);
 let nextTimeline=Math.max(...Object.keys(animation.timelines).map(Number))+1;
 let nextBone=Math.max(...first.bones.filter(b=>b.id<100).map(b=>b.id))+1;
 const attachments=[];
 for(const [z,lane,phase,side] of [[0,.32,Math.PI,'left'],[1,.72,0,'right']]){
  const ref=first.objects.find(o=>o.z_index===z);
  const sourceKeys=source.timelines[ref.timeline].keys;
  const frames=times.map(time=>{const fileKey=sourceKeys.filter(k=>(k.time??0)<=time).at(-1).transform;return {fileKey,file:character.files[`${fileKey.folder??0}:${fileKey.file}`]};});
  const strideHeight=Math.max(...frames.map(f=>f.file.height));
  const initial=samplePose(character,source,0).objects.find(o=>o.z===z);
  const hipId=nextBone++,strideId=nextBone++,ankleId=nextBone++,hipTimeline=nextTimeline++,strideTimeline=nextTimeline++,ankleTimeline=nextTimeline++;
  const hipKeys=times.map((time,id)=>{
   const pose=samplePose(character,source,time),torso=pose.objects.find(o=>o.z===2),parent=pose.bones.find(b=>b.id===bodyRef.parent);
   const x=torso.x+(lane-torso.pivot_x)*torso.file.width;
   const y=torso.y+((1-torso.pivot_y)-.50)*torso.file.height;
   const dx=x-parent.x,dy=y-parent.y,r=parent.angle*Math.PI/180;
   return {id,time,spin:0,transform:{x:(dx*Math.cos(r)+dy*Math.sin(r))/parent.scale_x,y:(-dx*Math.sin(r)+dy*Math.cos(r))/parent.scale_y,angle:-parent.angle*Math.sign(parent.scale_x*parent.scale_y),scale_x:1/parent.scale_x,scale_y:1/parent.scale_y}};
  });
  animation.timelines[hipTimeline]={name:`${side}_hip`,keys:hipKeys};
  animation.timelines[strideTimeline]={name:`${side}_knee`,keys:times.map((time,id)=>({id,time,spin:0,transform:{x:0,y:-frames[id].file.height*.35+Math.sin(time/length*2*Math.PI+phase)*strideHeight*.10,angle:0}}))};
  animation.timelines[ankleTimeline]={name:`${side}_ankle`,keys:times.map((time,id)=>({id,time,spin:0,transform:{x:0,y:-frames[id].file.height*.35,angle:0}}))};
  // Extended source PNGs run from thigh at the top to boot at the bottom.
  // The top-center attaches at the hip; the ankle offset registers the same
  // image without reversing the thigh and boot ends.
  animation.timelines[ref.timeline].keys=times.map((time,id)=>({id,time,spin:0,transform:{folder:frames[id].fileKey.folder??0,file:frames[id].fileKey.file,x:0,y:frames[id].file.height*.70,angle:0,scale_x:initial.scale_x,scale_y:initial.scale_y,pivot_x:.5,pivot_y:1}}));
  attachments.push({z,hipId,strideId,ankleId,hipTimeline,strideTimeline,ankleTimeline});
 }
 const allTimes=[...new Set([...times,...source.mainline.map(k=>k.time??0)])].sort((a,b)=>a-b);
 animation.mainline=allTimes.map((time,id)=>{
  const frame=structuredClone(source.mainline.filter(k=>(k.time??0)<=time).at(-1));frame.id=id;frame.time=time;
  frame.bones=frame.bones.filter(b=>b.id<100);const key=times.findLastIndex(t=>t<=time);
  for(const a of attachments){
   frame.bones.push({id:a.hipId,parent:bodyRef.parent,timeline:a.hipTimeline,key},{id:a.strideId,parent:a.hipId,timeline:a.strideTimeline,key},{id:a.ankleId,parent:a.strideId,timeline:a.ankleTimeline,key});
   const ref=frame.objects.find(o=>o.z_index===a.z);ref.parent=a.ankleId;ref.key=key;
  }
  // Remove the old bat-leg bones too: they no longer drive a visible part and
  // their dangling overlay lines made the new leg attachments misleading.
  const used=new Set();
  for(const object of frame.objects){let id=object.parent;while(id!==undefined&&!used.has(id)){used.add(id);id=frame.bones.find(b=>b.id===id)?.parent;}}
  frame.bones=frame.bones.filter(b=>used.has(b.id));
  return frame;
 });
 animation.squareLegLanes=true;
 return animation;
}

// Derive an unarmed pose from the purchased rig; never resize limb images or
// replace its joint/pivot geometry with estimated canvas attachment points.
export function normalWalk(character){
 const bat=character.animations.find(a=>a.name==='Walk_bat');
 const rifle=character.animations.find(a=>a.name==='Walk_riffle');
 if(!bat||!rifle)throw Error('Missing authored walking rig.');
 const animation=structuredClone(bat);
 Object.assign(animation,{name:'Walk_normal',looping:true,derived:true,frames:[],sourceAnimation:'Walk_bat arm geometry + Walk_riffle legs'});
 const first=bat.mainline[0];
 // The bat is painted into its hand image. Replace only that image, retaining
 // the authored wrist bone. The opposite empty hand remains entirely authored.
 const weaponRef=first.objects.find(r=>r.z_index===9);
 const emptyRef=first.objects.find(r=>r.z_index===6);
 const empty=animation.timelines[emptyRef.timeline].keys[0].transform;
 const replacement=animation.timelines[weaponRef.timeline];
 replacement.name='left_empty_hand';
 const neutralWrist=samplePose(character,animation,0).bones.find(b=>b.id===weaponRef.parent);
 for(const key of replacement.keys)key.transform={folder:empty.folder,file:empty.file,x:0,y:0,angle:-neutralWrist.angle,scale_x:-1,scale_y:1,pivot_x:.5,pivot_y:.75};
 // Copy rifle leg timelines and their ancestor bones exactly. Both authored
 // walks use the same torso registration, so no inferred centering is needed.
 const feet=rifle.mainline[0].objects.filter(r=>r.z_index<2),ancestors=new Set();
 for(const foot of feet){let id=foot.parent;while(id!==undefined&&!ancestors.has(id)){
  ancestors.add(id);id=rifle.mainline[0].bones.find(r=>r.id===id).parent;
 }}
 for(const ref of rifle.mainline[0].bones.filter(r=>ancestors.has(r.id)))animation.timelines[100+ref.timeline]=structuredClone(rifle.timelines[ref.timeline]);
 for(const ref of feet)animation.timelines[100+ref.timeline]=structuredClone(rifle.timelines[ref.timeline]);
 const times=[...new Set([...bat.mainline,...rifle.mainline].map(k=>k.time??0))].sort((a,b)=>a-b);
 animation.mainline=times.map((time,id)=>{
  const frame=structuredClone(bat.mainline.filter(k=>(k.time??0)<=time).at(-1));
  const authored=rifle.mainline.filter(k=>(k.time??0)<=time).at(-1);
  frame.id=id;frame.time=time;
  frame.objects=frame.objects.filter(r=>r.z_index>=2).concat(authored.objects.filter(r=>r.z_index<2).map(r=>({...r,parent:r.parent+100,timeline:r.timeline+100})));
  frame.bones=frame.bones.concat(authored.bones.filter(r=>ancestors.has(r.id)).map(r=>({...r,id:r.id+100,timeline:r.timeline+100,...(r.parent!==undefined?{parent:r.parent+100}:{})})));
  return frame;
 });
 return animation;
}
