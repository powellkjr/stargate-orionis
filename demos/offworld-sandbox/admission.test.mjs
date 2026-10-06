import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission,clone} from '../shared/offworld/mission.mjs';
import {recipeAdmission,recipeEligibility,startWork} from '../shared/offworld/field.mjs';

function fixture(){
  const r={recipeInstanceId:'inspect',targetId:'target',implemented:true,profession:'SCIENTIST',minimumTier:1,requiresKnowledge:['measurement-known']};
  const m={instances:[{instanceId:'npc',stageId:'room'}],incidents:[{incidentId:'encounter',stageId:'room',kind:'COMBAT'}],indexes:{instances:{npc:{instanceId:'npc',stageId:'room'}},interactionTargets:{target:{targetId:'target',instanceId:'npc',stageId:'room'}},recipes:{inspect:r}}};
  const s={currentStageId:'room',status:'ACTIVE',gateState:{choicePending:false},stageStates:{room:{securityState:'SECURE'}},instanceStates:{npc:{custody:'LOCAL',detectionState:'LOCATED',combatState:'NEUTRAL'}},incidentStates:{encounter:{state:'DORMANT'}},knowledgeState:{starting:[],gained:[]},interactionStates:{},activeWork:[],units:[]};
  return {m,s,r};
}
test('dormant combat and neutral armed subjects do not hide ordinary actions',()=>{
  const {m,s,r}=fixture();assert(recipeAdmission(m,s,r));
  assert.equal(recipeEligibility(m,s,r).blocker,'REQUIRED_KNOWLEDGE_MISSING');
});
test('active combat hides ordinary actions before requirement checks and prevents starting work',()=>{
  const {m,s,r}=fixture();s.incidentStates.encounter.state='ACTIVE';
  assert.deepEqual(recipeEligibility(m,s,r),{status:'HIDDEN',blocker:null,candidates:[]});
  const before=clone(s);assert.throws(()=>startWork(m,s,r.recipeInstanceId),/HIDDEN/);assert.deepEqual(s,before);
  r.availabilityContext={normal:true,activeIncidentKinds:['COMBAT']};
  assert.equal(recipeEligibility(m,s,r).blocker,'REQUIRED_KNOWLEDGE_MISSING');
});
test('legacy hostile instances hide ordinary actions but allowHostiles remains an explicit opt-in',()=>{
  const {m,s,r}=fixture();s.instanceStates.npc.combatState='ACTIVE';
  assert(!recipeAdmission(m,s,r));r.allowHostiles=true;assert(recipeAdmission(m,s,r));
  r.availabilityContext={activeIncidentKinds:[]};assert(!recipeAdmission(m,s,r));
});
test('authored context handles noncombat incidents, simultaneous kinds, secure stages and revisits',()=>{
  const {m,s,r}=fixture();m.incidents[0].kind='CONFRONTATION';s.incidentStates.encounter.state='ACTIVE';
  r.availabilityContext={normal:false,activeIncidentKinds:['CONFRONTATION'],requiresSecureStage:true};
  assert(recipeAdmission(m,s,r));s.stageStates.room.securityState='UNSECURE';assert(!recipeAdmission(m,s,r));
  s.stageStates.room.securityState='SECURE';s.instanceStates.npc.combatState='ACTIVE';assert(!recipeAdmission(m,s,r));
  r.availabilityContext.activeIncidentKinds.push('COMBAT');assert(recipeAdmission(m,s,r));
  s.currentStageId='other';assert(!recipeAdmission(m,s,r));s.currentStageId='room';assert(recipeAdmission(m,s,r));
  s.incidentStates.encounter.state='RESOLVED';s.instanceStates.npc.combatState='NEUTRAL';assert(!recipeAdmission(m,s,r));
  r.availabilityContext.normal=true;assert(recipeAdmission(m,s,r));
});
test('legacy noncombat incidents preserve ordinary action admission',()=>{
  const {m,s,r}=fixture();m.incidents[0].kind='MEDICAL';s.incidentStates.encounter.state='ACTIVE';assert(recipeAdmission(m,s,r));
});
test('compiler validates contextual admission without modifying authored input',()=>{
  const read=n=>{const data=JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));return n.endsWith('archetypes')?{...data,itemDefinitions:JSON.parse(readFileSync(new URL('../shared/data/item.json',import.meta.url)))}:data;};
  const raw=read('missing-operative-001.finalized'),catalog=read('archetypes');
  const context={normal:true,activeIncidentKinds:['COMBAT'],requiresSecureStage:false};
  const valid=clone(raw);valid.recipes[0].availabilityContext=context;const before=clone(valid);
  const m=compileMission(valid,catalog);assert.deepEqual(m.recipes[0].availabilityContext,context);assert.deepEqual(valid,before);assert(Object.isFrozen(m.recipes[0].availabilityContext));
  for(const bad of [null,[],true,{normal:'yes'},{requiresSecureStage:1},{activeIncidentKinds:'COMBAT'},{activeIncidentKinds:[null]},{activeIncidentKinds:['']},{unknown:true}]){
    const input=clone(raw);input.recipes[0].availabilityContext=bad;assert.throws(()=>compileMission(input,catalog),/availabilityContext/);
  }
});