import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission,clone} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,move,advanceTime,visibility} from '../shared/offworld/runtime.mjs';
import {condition,recipeAdmission,startWork} from '../shared/offworld/field.mjs';
import {engage,localCombat,refreshCampaign} from '../shared/offworld/campaign.mjs';
import {applyNpcEffect} from '../shared/offworld/npc.mjs';
import {npcAlertSvg} from './npc-presentation.mjs';
import {renderMap} from './map.mjs';
import {createTool} from '../shared/offworld/equipment.mjs';
const read=n=>JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));
const raw={...read('missing-operative-001.finalized'),dialogueScenes:[]},catalog=read('archetypes'),party=read('party-presets').units.slice(0,4);
function fixture(){
  const input=clone(raw),guard=input.instances.find(i=>i.instanceId==='guard-holding-01');
  guard.npcState={disposition:'WATCHING',suspicion:20,hostility:0};
  const m=compileMission(input,catalog),s=createRuntime(m,party,'2026-09-29T12:00Z');chooseGate(m,s,true);
  for(const id of ['door-gate-to-yard','door-yard-to-mainhall','door-mainhall-to-holding'])move(m,s,id);
  return {m,s,id:guard.instanceId};
}
test('neutral armed NPC preserves dormant combat and ordinary action admission across revisits',()=>{
  const {m,s,id}=fixture(),npc=s.instanceStates[id];assert.equal(npc.combatState,'NEUTRAL');
  const incident=m.incidents.find(i=>i.kind==='COMBAT'&&i.stageId===s.currentStageId);
  assert.equal(s.incidentStates[incident.incidentId].state,'DORMANT');assert(recipeAdmission(m,s,{}));
  applyNpcEffect(s,{type:'CHANGE_NPC_SUSPICION',instanceId:id,delta:45});
  move(m,s,'door-mainhall-to-holding');move(m,s,'door-mainhall-to-holding');
  assert.equal(s.instanceStates[id].npcState.suspicion,65);assert.equal(m.indexes.instances[id].npcState.suspicion,20);
  assert.match(renderMap(m,s),/class="npc-alert"/);
  engage(m,s,incident.incidentId);assert.equal(npc.combatState,'ACTIVE');assert.equal(localCombat(m,s).length,1);
});
test('authored confrontation blocks ordinary actions without combat or damage',()=>{
  const {m,s,id}=fixture(),health=s.units.map(u=>u.health);
  applyNpcEffect(s,{type:'START_CONFRONTATION',instanceIds:[id]});refreshCampaign(m,s);
  const kinds=m.incidents.filter(i=>i.stageId===s.currentStageId&&s.incidentStates[i.incidentId].state==='ACTIVE').map(i=>i.kind);
  assert(!recipeAdmission(m,s,{}));assert(recipeAdmission(m,s,{availabilityContext:{activeIncidentKinds:['CONFRONTATION',...kinds]}}));
  advanceTime(m,s,30);assert.deepEqual(s.units.map(u=>u.health),health);assert.equal(localCombat(m,s).length,0);
  assert(condition(s,{type:'NPC_STATE',instanceId:id,disposition:'CONFRONTING',suspicionAtLeast:20,hostilityBelow:100}));
  applyNpcEffect(s,{type:'SET_NPC_DISPOSITION',instanceId:id,value:'ROUTINE'});assert(recipeAdmission(m,s,{}));
});
test('NPC effects clamp both directions and multi-participant failure is atomic',()=>{
  const {s,id}=fixture();applyNpcEffect(s,{type:'CHANGE_NPC_SUSPICION',instanceId:id,delta:500});assert.equal(s.instanceStates[id].npcState.suspicion,100);
  applyNpcEffect(s,{type:'CHANGE_NPC_HOSTILITY',instanceId:id,delta:100});assert.match(npcAlertSvg(s.instanceStates[id]),/Hostile/);
  applyNpcEffect(s,{type:'CHANGE_NPC_HOSTILITY',instanceId:id,delta:-500});assert.equal(s.instanceStates[id].npcState.hostility,0);
  const before=clone(s);assert.throws(()=>applyNpcEffect(s,{type:'START_CONFRONTATION',instanceIds:[id,'missing']}),/unavailable/);assert.deepEqual(s,before);
});
test('alerts show symbolic progression, suppress numeric labels, and never render on hidden stages',()=>{
  assert.match(npcAlertSvg({npcState:{disposition:'HOSTILE',suspicion:0,hostility:0}}),/fill="#e35555"/);
  for(const [suspicion,hostility,symbol] of [[0,0,'?'],[50,0,'?'],[100,0,'!'],[100,50,'!'],[100,100,'☹']]){
    const html=npcAlertSvg({npcState:{disposition:'ROUTINE',suspicion,hostility}});assert(html.includes(`>${symbol}</text>`));assert(!html.includes('suspicion'));assert(!html.includes('hostility'));
  }
  const {m,s}=fixture();s.currentStageId=m.gate.stageId;visibility(m,s);assert(!renderMap(m,s).includes('class="npc-alert"'));
});
test('compiler rejects invalid NPC state, effects, and conditions',()=>{
  for(const mutate of [
    r=>r.instances[0].npcState={disposition:'ROUTINE',suspicion:101,hostility:0},
    r=>r.recipes[0].overrides.effects=[{type:'CHANGE_NPC_SUSPICION',instanceId:'gate-01',delta:1}],
    r=>r.recipes[0].overrides.requiresState={type:'NPC_STATE',instanceId:'gate-01',suspicionAtLeast:10},
  ]){const input=clone(raw);mutate(input);assert.throws(()=>compileMission(input,catalog),/NPC|npcState/);}
});
test('field transactions apply authored NPC effects',()=>{
  const input=clone(raw);input.instances.find(i=>i.instanceId==='mining-system-01').npcState={disposition:'ROUTINE',suspicion:0,hostility:0};
  const recipe=input.recipes.find(r=>r.recipeInstanceId==='inspect-mining-system');recipe.overrides.effects=[{type:'CHANGE_NPC_SUSPICION',instanceId:'mining-system-01',delta:25},{type:'SET_NPC_DISPOSITION',instanceId:'mining-system-01',value:'WATCHING'}];
  const units=clone(party),tech=units.find(u=>u.profession==='TECHNICIAN');tech.tier=2;tech.tools=[createTool(tech,0,'TET2',3,catalog)];
  const m=compileMission(input,catalog),s=createRuntime(m,units,'2026-09-29T12:00Z');chooseGate(m,s,true);
  for(const id of ['door-gate-to-yard','door-yard-to-mainhall','door-mainhall-to-processing'])move(m,s,id);
  const w=startWork(m,s,recipe.recipeInstanceId);advanceTime(m,s,180);assert.equal(w.status,'COMPLETED');assert.equal(s.instanceStates['mining-system-01'].npcState.suspicion,25);
  assert.equal(s.instanceStates['mining-system-01'].npcState.disposition,'WATCHING');
});
test('campaign events apply NPC effects without inventing combat',()=>{
  const input=clone(raw);input.instances[0].npcState={disposition:'ROUTINE',suspicion:0,hostility:0};
  const binding=input.eventBindings[0];binding.conditions=[];binding.effects=[{type:'CHANGE_NPC_SUSPICION',instanceId:input.instances[0].instanceId,delta:30}];
  const m=compileMission(input,catalog),s=createRuntime(m,party,'2026-09-29T12:00Z');
  s.emittedEvents.push({event:binding.eventArchetypeId,atSeconds:0});refreshCampaign(m,s);
  assert.equal(s.instanceStates[input.instances[0].instanceId].npcState.suspicion,30);assert.equal(localCombat(m,s).length,0);
});
test('context changes during work prevent commit without effects or spent charges',()=>{
  const input=clone(raw),subject=input.instances.find(i=>i.instanceId==='mining-system-01');subject.npcState={disposition:'ROUTINE',suspicion:0,hostility:0};
  const units=clone(party),tech=units.find(u=>u.profession==='TECHNICIAN');tech.tier=2;tech.tools=[createTool(tech,0,'TET2',3,catalog)];
  const m=compileMission(input,catalog),s=createRuntime(m,units,'2026-09-29T12:00Z');chooseGate(m,s,true);
  for(const id of ['door-gate-to-yard','door-yard-to-mainhall','door-mainhall-to-processing'])move(m,s,id);
  const w=startWork(m,s,'inspect-mining-system');applyNpcEffect(s,{type:'START_CONFRONTATION',instanceIds:[subject.instanceId]});advanceTime(m,s,180);
  assert.equal(w.status,'FAILED');assert.equal(s.units.find(u=>u.profession==='TECHNICIAN').tools[0].chargesRemaining,3);assert.equal(s.interactionStates['inspect-mining-system'],undefined);
});