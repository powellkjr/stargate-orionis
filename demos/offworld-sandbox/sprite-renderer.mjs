import {spriteManifest as manifest} from './sprite-manifest.mjs';
import {surfaceGeometry} from '../shared/map/renderer.mjs';
import {esc} from './setup.mjs';
import {npcHostile} from '../shared/offworld/npc.mjs';
const failedSources=new Set();
const sourcePath=key=>failedSources.has(manifest.assets[key].src)?manifest.assets[manifest.fallback].src:manifest.assets[key].src;
export function spriteImage(key,x,y,{size,angle=0}={}){
 const assetKey=manifest.assets[key]?key:manifest.fallback,entry=manifest.assets[assetKey],width=size??entry.size;
 return `<image class="world-sprite" data-sprite="${esc(failedSources.has(entry.src)?manifest.fallback:assetKey)}" href="${esc(sourcePath(assetKey))}" x="${x-width*entry.pivot[0]}" y="${y-width*entry.pivot[1]}" width="${width}" height="${width}" ${angle?`transform="rotate(${angle} ${x} ${y})"`:''} pointer-events="none"/>`;
}
export function instanceSpriteKey(d){
 // Unknown identities use a neutral silhouette; no Reality tags are inspected.
 if(d.identityKnownAtStart===false||d.archetypeId==='npc_undercover_operative')return d.mapGlyph==='PERSON'?'civilian':manifest.fallback;
 return manifest.publicLabels[d.playerLabel]??manifest.instanceArchetypes[d.archetypeId]??(d.mapGlyph==='PERSON'?'civilian':manifest.fallback);
}
const down=state=>['DOWN','DEAD'].includes(state.combatState)||state.health===0;
function treatment(state,x,y){
 const combat=state.combatState,hostile=npcHostile(state);
 return `${hostile?`<circle class="sprite-hostile" cx="${x}" cy="${y}" r="13" fill="none" stroke="#df5762" stroke-width="2"/>`:''}${['SURRENDERED','CAPTURED'].includes(combat)?`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#d1ac47" stroke-width="2" stroke-dasharray="3 2"/>`:''}`;
}
export const spritePresentation={
 background:'<rect x="-2000" y="-2000" width="5000" height="5000" fill="#bdcfc8"/>',
 stage(stage,state){
  const visible=state.visibility==='VISIBLE',key=visible?(manifest.stageOverrides[stage.stageId]??manifest.stageArchetypes[stage.archetypeId]??'floor-indoor'):'floor-fog';
  let html=stage.cells.map(c=>spriteImage(key,(c.x+.5)*100,(c.y+.5)*100)).join('');
  // Exposed cell edges only: no seams through multi-cell rooms.
  for(const edge of surfaceGeometry(stage.cells).flatMap(t=>t.edges)){
   const x=(edge.x1+edge.x2)/2,y=(edge.y1+edge.y2)/2,vertical=edge.x1===edge.x2;
   html+=`<image class="sprite-boundary" href="${esc(sourcePath('wall'))}" x="${x-50}" y="${y-5}" width="100" height="10" ${vertical?`transform="rotate(90 ${x} ${y})"`:''} pointer-events="none" opacity="${visible?1:.4}"/>`;
  }
  const corners=new Map();for(const e of surfaceGeometry(stage.cells).flatMap(t=>t.edges))for(const [x,y] of [[e.x1,e.y1],[e.x2,e.y2]]){const key=`${x}:${y}`,v=corners.get(key)??{x,y,axes:new Set()};v.axes.add(e.x1===e.x2?'vertical':'horizontal');corners.set(key,v);}
  for(const {x,y,axes} of corners.values())if(axes.size===2)html+=spriteImage('corner',x,y,{size:8});
  if(state.securityState==='SECURE'&&state.explored)html+=`<path d="${surfaceGeometry(stage.cells).flatMap(t=>t.edges).map(e=>`M${e.x1} ${e.y1}L${e.x2} ${e.y2}`).join(' ')}" fill="none" stroke="#6f984d" stroke-width="3" stroke-dasharray="8 4"/>`;
  return html;
 },
 instance(d,state,{x,y},runtime,mission){
  const gate=d.instanceId===runtime.gateState.instanceId||d.archetypeId==='stargate_standard';
  const key=gate?(runtime.gateState.connection==='OPEN_TO_SGC'?'gate-open':'gate'):instanceSpriteKey(d);
  const scene=runtime.dialogue&&mission?.dialogueScenes.find(d=>d.dialogueSceneId===runtime.dialogue.sceneId),talking=scene&&Object.values(scene.participants).includes(d.instanceId);
  return `<g class="sprite-instance" data-sprite-instance="${esc(d.instanceId)}"><title>${esc(d.playerLabel)} · ${esc(state.combatState??'Present')}</title>${treatment(state,x,y)}${spriteImage(key,x,y,{angle:down(state)?90:0})}${state.operational===false?`<path d="M${x-6} ${y-6}l12 12m-12 0l12-12" stroke="#da6a52" stroke-width="2"/>`:''}${talking?`<circle class="sprite-talking" cx="${x+10}" cy="${y-12}" r="4" fill="#fff"/>`:''}</g>`;
 },
 unit(unit,{x,y}){return `<g class="sprite-unit" data-sprite-unit="${esc(unit.unitId)}"><title>${esc(unit.name)} · ${esc(unit.partyStatus)}</title>${unit.partyStatus==='STATIONED'?`<circle cx="${x}" cy="${y}" r="13" stroke="#c6a74a" stroke-width="2" fill="none"/>`:''}${spriteImage(manifest.professions[unit.profession]??'civilian',x,y,{angle:down(unit)?90:0})}</g>`;},
 door(transition,state,{x,y}){return spriteImage(state.state==='OPEN'?'door-open':'door',x,y,{angle:['EAST','WEST'].includes(transition.directionFrom)?90:0});}
};
// Call from the map's capture-phase image error listener. Missing final art
// recovers once; if the fallback itself is absent, leave the UI overlays usable.
export function replaceMissingSprite(image){
 if(image?.tagName?.toLowerCase()!=='image'||image.dataset.fallbackApplied)return;
 const original=image.getAttribute?.('href');if(original)failedSources.add(original);
 image.dataset.fallbackApplied='true';image.setAttribute('href',manifest.assets[manifest.fallback].src);
}
