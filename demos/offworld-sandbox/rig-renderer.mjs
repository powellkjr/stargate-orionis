import {validateRig,rigParts,rigPose,rigPartMatrix} from '../shared/sprites/character-rig.mjs';
import {esc} from './setup.mjs';
export function rigImage(key,rig,x,y,{size=22,angle=0,state='IDLE',timeMs=0,identity='default',jointAngles={}}={}){
 validateRig(rig);if(![x,y,size,angle].every(Number.isFinite)||size<=0)throw Error('Invalid rig placement');
 for(const [part,angle] of Object.entries(jointAngles))if(!rigParts.includes(part)||!Number.isFinite(angle))throw Error('Invalid joint angle');
 const pose={...rigPose(state,timeMs),...jointAngles},partMarkup=part=>{
  const p=rig.parts[part],matrix=rigPartMatrix(rig,pose,part);
  return `<g data-rig-part="${part}" data-rig-parent="${p.parent}" transform="matrix(${matrix.join(' ')})"><image class="world-sprite" href="${esc(p.src)}" x="0" y="0" width="128" height="128" pointer-events="none"/></g>`;
 };
 // Flatten draw order; composed matrices preserve every shoulder/elbow/hip/knee chain.
 return `<g data-character-rig="${esc(key)}" data-rig-x="${x}" data-rig-y="${y}" data-rig-size="${size}" data-rig-angle="${angle+pose.rootAngle}" data-rig-identity="${esc(identity)}" pointer-events="none" transform="translate(${x} ${y}) rotate(${angle+pose.rootAngle}) scale(${size/128}) translate(-64 -64)">${[...rigParts].sort((a,b)=>rig.parts[a].z-rig.parts[b].z).map(partMarkup).join('')}</g>`;
}
