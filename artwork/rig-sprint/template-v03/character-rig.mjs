// Presentation coordinates only. Never used as positions, hitboxes or capabilities.
export const rigParts=Object.freeze(['torso','head','left_arm','right_arm','left_leg','right_leg','equipment']);
// Technician v01 preferred master, approved October 9, 2026. Full 1254 canvas
// normalized to 1024; attachment centers fitted to its illustrated anatomy.
// Hidden joint centers remain art estimates, verified by the rotation proof.
export const rigTemplate=Object.freeze({torso:[512,512],head:[512,400],left_arm:[672,384],right_arm:[352,384],left_leg:[560,584],right_leg:[464,584],equipment:[512,536]});
export const rigOrder=Object.freeze({left_leg:10,right_leg:11,left_arm:20,right_arm:21,head:25,torso:30,equipment:60});
export const rigParents=Object.freeze({torso:'root',head:'torso',left_arm:'torso',right_arm:'torso',left_leg:'root',right_leg:'root',equipment:'torso'});
export const rigAnimation=Object.freeze({phaseMs:150,armDegrees:10,legDegrees:12,torsoBobPixels:2});
export function validateRig(rig){
 if(!rig||rig.version!==1||rig.canvas!==128||rig.sourceCanvas!==1024||!rig.parts||typeof rig.id!=='string')throw Error('Invalid character rig header');
 if(Object.keys(rig.parts).length!==7||rigParts.some(key=>!rig.parts[key]))throw Error('A rig requires exactly seven parts');
 for(const key of rigParts){const p=rig.parts[key];
  if(!/^\.\.\/shared\/sprites\/offworld\/rigs\/[a-zA-Z0-9_/-]+\.png$/.test(p.src)||p.src.includes('..',3))throw Error(`Invalid rig resource: ${key}`);
  if(!Array.isArray(p.pivot)||p.pivot.length!==2||p.pivot.some(n=>!Number.isFinite(n)||n<0||n>128))throw Error(`Invalid pivot: ${key}`);
  if(p.parent!==rigParents[key]||!Number.isFinite(p.z))throw Error(`Invalid hierarchy/order: ${key}`);
 }
 return rig;
}
export function rigPose(state='IDLE',timeMs=0){
 if(!['IDLE','WALK','DOWN','STATIONED'].includes(state)||!Number.isFinite(timeMs))throw Error('Invalid rig pose');
 const phase=((timeMs/rigAnimation.phaseMs)%4+4)%4,i=Math.floor(phase),f=phase-i,keys=[1,0,-1,0];
 const swing=state==='WALK'?keys[i]*(1-f)+keys[(i+1)%4]*f:0;
 return {left_arm:-swing*rigAnimation.armDegrees,right_arm:swing*rigAnimation.armDegrees,left_leg:swing*rigAnimation.legDegrees,right_leg:-swing*rigAnimation.legDegrees,torsoY:state==='WALK'?-Math.abs(swing)*rigAnimation.torsoBobPixels/8:0,rootAngle:state==='DOWN'?90:0};
}
