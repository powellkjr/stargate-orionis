import {npcHostile} from '../shared/offworld/npc.mjs?v=dialogue-doors-1';
import {condition} from '../shared/offworld/field.mjs?v=dialogue-doors-1';
import {portraitBustSvg} from '../shared/portraits/portrait-bust.mjs?v=dialogue-doors-1';
import {esc} from './setup.mjs?v=dialogue-doors-1';
export function visibleNpc(m,s,id){
  const d=m.indexes.instances[id];
  return !!d&&d.mapGlyph==='PERSON'&&d.stageId===s.currentStageId&&s.stageStates[d.stageId].visibility==='VISIBLE'
    &&s.instanceStates[id]?.custody==='LOCAL'&&condition(s,d.revealedWhen);
}
export function npcDetailsHtml(m,s,id){
  if(!visibleNpc(m,s,id))return '';
  const d=m.indexes.instances[id],state=s.instanceStates[id];
  // playerLabel is authored player-facing identity, not hidden Reality.
  const status=state.npcState?.disposition??state.combatState??state.condition??'Present';
  return `<div class="npc-details-identity"><div class="portrait">${portraitBustSvg(d.portrait?.appearance??{})}</div><div><h3>${esc(d.playerLabel)}</h3><p>${esc(status)}</p>${state.health!==undefined?`<small>HP ${esc(state.health)}</small>`:''}<small>${d.portrait?.appearance?'':'Generic portrait · no authored appearance'}</small></div></div><button id="closeNpcDetails">Close details</button>`;
}
// Call only for a visible instance; neither identity nor hidden Reality is read.
export function npcAlertSvg(state){
  const n=state?.npcState;if(!n)return '';
  const hostile=npcHostile(state),escalating=hostile||n.hostility>0||n.suspicion===100;
  const symbol=hostile?'☹':escalating?'!':'?',label=hostile?'Hostile':escalating?'Alert':'Watching';
  const fill=hostile?100:escalating?n.hostility:n.suspicion;
  const base=escalating?'#efd174':'#ffffff',color=escalating?'#e35555':'#efd174';
  return `<g class="npc-alert" role="img" aria-label="${label}" transform="translate(0,-23)"><title>${label}</title><rect x="-7" y="-7" width="14" height="14" rx="3" fill="${base}"/><rect x="-7" y="${7-fill*.14}" width="14" height="${fill*.14}" fill="${color}"/><text y="4" text-anchor="middle" fill="#18262e" font-size="12" font-weight="bold">${symbol}</text></g>`;
}