// Presentation coordinates only. Never used as positions, hitboxes or capabilities.
export const rigParts=Object.freeze(['torso','head','left_upper_arm','right_upper_arm','left_forearm','right_forearm','left_upper_leg','right_upper_leg','left_lower_leg','right_lower_leg','equipment']);
// Technician v01 preferred master, approved October 9, 2026. Full 1254 canvas
// normalized to 1024; attachment centers fitted to its illustrated anatomy.
// Hidden joint centers remain art estimates, verified by the rotation proof.
export const rigTemplate=Object.freeze({torso:[512,512],head:[512,400],left_upper_arm:[672,384],right_upper_arm:[352,384],left_forearm:[716,512],right_forearm:[308,512],left_upper_leg:[560,584],right_upper_leg:[464,584],left_lower_leg:[600,712],right_lower_leg:[424,712],equipment:[512,536]});
export const rigOrder=Object.freeze({left_lower_leg:10,right_lower_leg:11,left_upper_leg:12,right_upper_leg:13,left_forearm:20,right_forearm:21,left_upper_arm:22,right_upper_arm:23,head:25,torso:30,equipment:60});
export const rigParents=Object.freeze({torso:'root',head:'torso',left_upper_arm:'torso',right_upper_arm:'torso',left_forearm:'left_upper_arm',right_forearm:'right_upper_arm',left_upper_leg:'root',right_upper_leg:'root',left_lower_leg:'left_upper_leg',right_lower_leg:'right_upper_leg',equipment:'torso'});
export const rigAnimation=Object.freeze({phaseMs:150,armForeshortening:.075,legForeshortening:.08,torsoBobPixels:2});
export function validateRig(rig){
 if(!rig||rig.version!==2||rig.canvas!==128||rig.sourceCanvas!==1024||!rig.parts||typeof rig.id!=='string')throw Error('Invalid character rig header');
 if(Object.keys(rig.parts).length!==rigParts.length||rigParts.some(key=>!rig.parts[key]))throw Error('A rig requires all eleven jointed parts');
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
 const scaleY=Object.fromEntries(rigParts.map(part=>[part,1]));
 scaleY.left_upper_arm=1+swing*rigAnimation.armForeshortening;
 scaleY.right_upper_arm=1-swing*rigAnimation.armForeshortening;
 scaleY.left_upper_leg=1-swing*rigAnimation.legForeshortening;
 scaleY.right_upper_leg=1+swing*rigAnimation.legForeshortening;
 return {scaleY,torsoY:state==='WALK'?-Math.abs(swing)*rigAnimation.torsoBobPixels/8:0,rootAngle:state==='DOWN'?90:0};
}
// Full-canvas affine transforms, composed through the anatomical parent chain.
// The elbow/knee attachment stays at the transformed end of its parent segment.
const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
export function rigPartMatrix(rig,pose,part){
 const p=rig.parts[part];if(!p)throw Error('Unknown rig part');
 const angle=pose[part]??0,sy=pose.scaleY?.[part]??1;
 if(!Number.isFinite(angle)||!Number.isFinite(sy)||sy<=0||!Number.isFinite(pose.torsoY??0))throw Error('Invalid joint pose');
 const radians=angle*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians),[x,y]=p.pivot;
 const local=[c,s,-s*sy,c*sy,x-c*x+s*sy*y,y-s*x-c*sy*y];
 const parent=p.parent==='root'?[1,0,0,1,0,0]:rigPartMatrix(rig,pose,p.parent);
 if(part==='torso')local[5]+=pose.torsoY??0;
 return multiply(parent,local);
}
