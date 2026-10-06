import {dialogueScene,dialogueResponses} from '../shared/offworld/dialogue.mjs';
import {portraitBustSvg} from '../shared/portraits/portrait-bust.mjs?v=dialogue-doors-1';
import {esc} from './setup.mjs?v=dialogue-doors-1';
import {colors} from './map.mjs?v=dialogue-doors-1';
export function conversationHtml(m,s,pendingResponseId=null){
  if(!s.dialogue)return '';
  const scene=dialogueScene(m,s.dialogue.sceneId),node=scene.nodes.find(n=>n.nodeId===s.dialogue.nodeId);
  const person=(id,actorId=s.dialogue.actorId)=>id==='ACTIVE_SGC_SPEAKER'?s.units.find(u=>u.unitId===actorId):m.indexes.instances[id];
  const portrait=(id,side)=>{const p=person(id);if(!p)return `<div class="conversation-person ${side}" aria-label="No responder chosen"></div>`;return `<div class="conversation-person ${side}"><div class="portrait">${portraitBustSvg(id==='ACTIVE_SGC_SPEAKER'?p.appearance:p.portrait?.appearance??{})}</div><strong>${esc(id==='ACTIVE_SGC_SPEAKER'?p.name:p.playerLabel)}</strong></div>`;};
  const responses=dialogueResponses(m,s),pending=responses.find(r=>r.responseId===pendingResponseId&&r.eligible);
  const chooser=pending?`<div class="conversation-responder"><p>Who responds: ${esc(pending.text)}</p>${pending.candidates.map(id=>`<button data-dialogue-actor="${esc(id)}" data-response-id="${esc(pending.responseId)}">${esc(person('ACTIVE_SGC_SPEAKER',id).name)}</button>`).join('')}<button data-dialogue-back>Choose another response</button></div>`:'';
  return `<h2>Conversation</h2><div class="conversation-portraits">${portrait(scene.participants.left,'left')}${portrait(scene.participants.right,'right')}</div><div class="conversation-lines">${s.dialogue.history.slice(-4).map(line=>{const p=person(line.speaker,line.actorId??s.dialogue.actorId);return `<p class="speech ${line.side.toLowerCase()}"><strong>${esc(line.speaker==='ACTIVE_SGC_SPEAKER'?p?.name??'SGC':p.playerLabel)}</strong><br>${esc(line.text)}</p>`;}).join('')}</div><div class="conversation-responses">${chooser||responses.map(r=>`<button class="response-hex" data-dialogue-response="${esc(r.responseId)}" style="--profession:${colors[r.source]??'#899391'}" ${r.eligible?'':'disabled'}>${esc(r.text)}${r.eligible?'':'<small>No qualified responder or required Knowledge</small>'}</button>`).join('')}${!responses.length?`<button data-dialogue-continue>${node.nextNodeId?'Continue':'Finish conversation'}</button>`:''}</div>`;
}
