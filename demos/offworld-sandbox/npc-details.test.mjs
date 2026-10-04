import test from 'node:test';
import assert from 'node:assert/strict';
import {npcDetailsHtml,visibleNpc} from './npc-presentation.mjs';
const fixture=()=>({m:{indexes:{instances:{npc:{instanceId:'npc',stageId:'room',mapGlyph:'PERSON',playerLabel:'Security supervisor',reality:{name:'Secret name',role:'Secret role'}}}}},s:{currentStageId:'room',stageStates:{room:{visibility:'VISIBLE'}},instanceStates:{npc:{custody:'LOCAL',npcState:{disposition:'ROUTINE'},health:150}}}});
test('NPC portrait details use only player-facing identity and visible state',()=>{
  const {m,s}=fixture(),html=npcDetailsHtml(m,s,'npc');
  assert.match(html,/Security supervisor/);assert.match(html,/ROUTINE/);assert.match(html,/HP 150/);assert.match(html,/<svg/);
  assert(!html.includes('Secret'));assert.match(html,/Generic portrait/);
  m.indexes.instances.npc.playerLabel='<script>hidden</script>';assert(!npcDetailsHtml(m,s,'npc').includes('<script>'));
});
test('remote, partial, hidden, recovered and unrevealed NPC details are unavailable',()=>{
  for(const visibility of ['PARTIAL','HIDDEN']){const {m,s}=fixture();s.stageStates.room.visibility=visibility;assert.equal(npcDetailsHtml(m,s,'npc'),'');}
  const {m,s}=fixture();s.currentStageId='elsewhere';assert.equal(visibleNpc(m,s,'npc'),false);
  s.currentStageId='room';s.instanceStates.npc.custody='RECOVERED_TO_SGC';assert.equal(npcDetailsHtml(m,s,'npc'),'');
  assert.equal(npcDetailsHtml(m,s,'missing'),'');
});