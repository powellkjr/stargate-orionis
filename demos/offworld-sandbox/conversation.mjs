import {dialogueScene,dialogueResponses} from '../shared/offworld/dialogue.mjs';
import {portraitBustSvg} from '../shared/portraits/portrait-bust.mjs?v=dialogue-doors-1';
import {esc} from './setup.mjs?v=dialogue-doors-1';
import {colors} from './map.mjs?v=dialogue-doors-1';
export function conversationHtml(m,s){
  if(!s.dialogue)return '';
  const scene=dialogueScene(m,s.dialogue.sceneId),node=scene.nodes.find(n=>n.nodeId===s.dialogue.nodeId);
  const person=id=>id==='ACTIVE_SGC_SPEAKER'?s.units.find(u=>u.unitId===s.dialogue.actorId):m.indexes.instances[id];
  const portrait=(id,side)=>{const p=person(id);return `<div class="conversation-person ${side}"><div class="portrait">${portraitBustSvg(id==='ACTIVE_SGC_SPEAKER'?p.appearance:p.portrait?.appearance??{})}</div><strong>${esc(id==='ACTIVE_SGC_SPEAKER'?p.name:p.playerLabel)}</strong></div>`;};
  const responses=dialogueResponses(m,s);
  return `<h2>Conversation</h2><div class="conversation-portraits">${portrait(scene.participants.left,'left')}${portrait(scene.participants.right,'right')}</div><div class="conversation-lines">${s.dialogue.history.slice(-4).map(line=>`<p class="speech ${line.side.toLowerCase()}"><strong>${esc(line.speaker==='ACTIVE_SGC_SPEAKER'?person(line.speaker).name:person(line.speaker).playerLabel)}</strong><br>${esc(line.text)}</p>`).join('')}</div><div class="conversation-responses">${responses.map(r=>`<button class="response-hex" data-dialogue-response="${esc(r.responseId)}" style="--profession:${colors[r.source]??'#899391'}" ${r.eligible?'':'disabled'}>${esc(r.text)}${r.eligible?'':'<small>Requirements not met by this speaker</small>'}</button>`).join('')}${!responses.length?`<button data-dialogue-continue>${node.nextNodeId?'Continue':'Finish conversation'}</button>`:''}</div>`;
}