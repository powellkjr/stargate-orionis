import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,move,advanceTime,extract} from '../shared/offworld/runtime.mjs';
import {observationEligibility,recipeEligibility,startWork} from '../shared/offworld/field.mjs';
import {toolOptions} from '../shared/offworld/equipment.mjs';
import {migrateLoadout} from '../shared/offworld/personnel-save.mjs';
import {missionResults} from '../shared/offworld/campaign.mjs';
const read=n=>JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));
const catalog=read('archetypes'),raw={...read('missing-operative-001.finalized'),dialogueScenes:[]},m=compileMission(raw,catalog);
function fresh(profession='SCOUT',mission=m){const u=read('party-presets').units.find(u=>u.profession===profession);u.tier=2;u.perception=9;u.tools=[];const s=createRuntime(mission,[u],'2026-09-25T12:00Z');chooseGate(mission,s,true);return s;}
test('mission receiver is a separate physical instance; standard Scout kits have no variants',()=>{
  const s=fresh();assert.equal(s.units[0].tools.length,0);assert.equal(s.partyTools.length,1);
  assert.equal(s.partyTools[0].toolInstanceId,'mission-signal-receiver-01');
  assert.deepEqual(toolOptions(s.units[0],catalog).map(t=>t.id),['STT1','STT2']);
  assert(!catalog.tools.STT2.providedServices.includes('SIGNAL_DIRECTION_FINDING'));
  assert.notEqual(s.partyTools,m.partyTools);s.partyTools[0].damaged=true;assert.equal(m.partyTools[0].damaged,false);
});
test('signal observations require a qualified observer and a present, usable receiver',()=>{
  const s=fresh();move(m,s,'door-gate-to-yard');move(m,s,'door-yard-to-mainhall');
  const o=m.observations.find(o=>o.stageId===s.currentStageId&&o.requiredToolService==='SIGNAL_DIRECTION_FINDING');assert(o);
  assert.equal(observationEligibility(m,s,o).eligible,true);
  s.partyTools[0].damaged=true;assert.equal(observationEligibility(m,s,o).reason,'TOOL_SERVICE_MISSING');
  s.partyTools[0].damaged=false;s.partyTools[0].currentStageId=m.gate.stageId;assert.equal(observationEligibility(m,s,o).eligible,false);
  s.partyTools[0].currentStageId=s.currentStageId;s.units[0].profession='SOLDIER';assert.equal(observationEligibility(m,s,o).reason,'NO_VALID_ACTOR');
});
test('party Tool identity survives movement and extraction and appears in results',()=>{
  const s=fresh(),id=s.partyTools[0].toolInstanceId;move(m,s,'door-gate-to-yard');assert.equal(s.partyTools[0].currentStageId,s.currentStageId);
  move(m,s,'door-gate-to-yard');extract(m,s);assert.equal(s.partyTools[0].custody,'SGC');assert.equal(s.partyTools[0].currentStageId,null);
  assert.equal(missionResults(m,s).partyTools[0].toolInstanceId,id);
});
test('shared Tool work reserves an actual instance, blocks movement and commits charges',()=>{
  const c=structuredClone(catalog),r=structuredClone(raw);c.partyTools.TEST_KIT={label:'Test mission kit',providedServices:['TECH_SERVICE_II'],chargesRemaining:2};r.deployment.partyTools.push({toolInstanceId:'test-kit-01',toolId:'TEST_KIT'});
  const mission=compileMission(r,c),s=fresh('TECHNICIAN',mission);move(mission,s,'door-gate-to-yard');move(mission,s,'door-yard-to-mainhall');
  const recipe=mission.indexes.recipes['hack-door-mainhall-to-security'];const candidate=recipeEligibility(mission,s,recipe).candidates[0];assert.equal(candidate.toolSource,'PARTY');assert.equal(candidate.toolInstanceId,'test-kit-01');
  startWork(mission,s,recipe.recipeInstanceId,s.units[0].unitId);assert.throws(()=>move(mission,s,'door-yard-to-mainhall'),/WORK_IN_PROGRESS/);
  assert.equal(s.partyTools[1].chargesRemaining,2);advanceTime(mission,s,recipe.durationMinutes*60);assert.equal(s.partyTools[1].chargesRemaining,1);assert.equal(s.transitionStates['door-mainhall-to-security'].state,'OPEN');
});
test('missing or damaged shared Tool fails work without spending charges or applying effects',()=>{
  const c=structuredClone(catalog),r=structuredClone(raw);c.partyTools.TEST_KIT={label:'Test mission kit',providedServices:['TECH_SERVICE_II'],chargesRemaining:2};r.deployment.partyTools.push({toolInstanceId:'test-kit-01',toolId:'TEST_KIT'});
  const mission=compileMission(r,c),s=fresh('TECHNICIAN',mission);move(mission,s,'door-gate-to-yard');move(mission,s,'door-yard-to-mainhall');
  const w=startWork(mission,s,'hack-door-mainhall-to-security',s.units[0].unitId);s.partyTools[1].damaged=true;advanceTime(mission,s,w.durationSeconds);
  assert.equal(w.status,'FAILED');assert.equal(s.partyTools[1].chargesRemaining,2);assert.equal(s.transitionStates['door-mainhall-to-security'].state,'LOCKED');
});
test('legacy loadouts migrate only receiver kit IDs and retain edited stats and charges',()=>{
  const old={tier:3,stamina:82,toolSlots:[{kitId:'STT3_SIGNAL',charges:9},{kitId:'MET3',charges:6}]},next=migrateLoadout(old);
  assert.deepEqual(next,{...old,toolSlots:[{kitId:'STT3',charges:9},{kitId:'MET3',charges:6}]});assert.equal(old.toolSlots[0].kitId,'STT3_SIGNAL');
  const bad=structuredClone(raw);bad.deployment.partyTools.push({...bad.deployment.partyTools[0]});assert.throws(()=>compileMission(bad,catalog),/duplicate/);
});
