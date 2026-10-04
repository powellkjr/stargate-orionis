import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,advanceTime,extract,visibility} from '../shared/offworld/runtime.mjs';
import {startWork,executionProfile,recipeEligibility} from '../shared/offworld/field.mjs';
import {lootEntries,debriefOptions,finalizeDebrief} from '../shared/offworld/recovery.mjs';
import {renderMap} from './map.mjs';
const read=n=>JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));
const m=compileMission({...read('missing-operative-001.finalized'),dialogueScenes:[]},read('archetypes'));
function state(){const s=createRuntime(m,read('party-presets').units.slice(0,4),'2026-09-25T12:00Z');chooseGate(m,s,true);return s;}
function explore(s){for(const stage of Object.values(s.stageStates))Object.assign(stage,{explored:true,knownShape:true});for(const edge of Object.values(s.transitionStates))Object.assign(edge,{state:'OPEN',known:true});}
test('recovery offers discovered assets with routes, preserves IDs and leaves unselected assets local',()=>{
 const s=state();assert.equal(lootEntries(m,s).length,0);explore(s);
 s.instanceStates['mcguffin-01'].combatState='SURRENDERED';
 assert(debriefOptions(m,s).loot.find(x=>x.instanceId==='supply-cache-01').eligible);
 extract(m,s);const item=s.instanceStates['supply-cache-01'];
 finalizeDebrief(m,s,{holdingIds:['mcguffin-01'],receivingIds:['supply-cache-01']});
 assert.equal(s.instanceStates['supply-cache-01'],item);assert.equal(item.custody,'RECOVERED_TO_SGC');
 assert.equal(s.instanceStates['mcguffin-01'].recoveryDestination,'HOLDING');
 assert.equal(s.instanceStates['evidence-archive-01'].custody,'LOCAL');
 assert(s.debrief.requests.every(r=>r.status==='AWAITING_ADMISSION'));
 assert.throws(()=>finalizeDebrief(m,s,{}),/already/);
});
test('blocked route or changed physical state rejects recovery atomically',()=>{
 const s=state();explore(s);s.instanceStates['evidence-archive-01'].securedForExtraction=true;s.instanceStates['evidence-archive-01'].evidenceState='DESTROYED';
 assert.equal(debriefOptions(m,s).loot.find(x=>x.instanceId==='evidence-archive-01').eligible,false);
 for(const edge of Object.values(s.transitionStates))edge.state='LOCKED';extract(m,s);
 assert.equal(debriefOptions(m,s).loot.find(x=>x.instanceId==='supply-cache-01').eligible,false);
 assert.throws(()=>finalizeDebrief(m,s,{receivingIds:['supply-cache-01']}),/Invalid/);
 assert.equal(s.instanceStates['supply-cache-01'].custody,'LOCAL');assert.equal(s.debrief,undefined);
});
test('securing loot leaves it on the map after leaving its stage',()=>{
 const s=state();explore(s);const stage=m.indexes.instances['supply-cache-01'].stageId;s.currentStageId=stage;for(const u of s.units)u.currentStageId=stage;visibility(m,s);
 startWork(m,s,'collect-supply-cache',s.units[0].unitId);advanceTime(m,s,180);
 assert.equal(s.instanceStates['supply-cache-01'].custody,'LOCAL');assert.equal(s.instanceStates['supply-cache-01'].securedForExtraction,true);
 s.currentStageId=m.gate.stageId;for(const u of s.units)u.currentStageId=s.currentStageId;visibility(m,s);
 assert.match(renderMap(m,s),/data-loot="supply-cache-01"/);
});
test('interviews shorten later social work without granting Profession qualification',()=>{
 const unit=read('party-presets').units.find(u=>u.profession==='DIPLOMAT');unit.tier=1;
 const s=createRuntime(m,[unit],'2026-09-25T12:00Z');chooseGate(m,s,true);s.currentStageId=unit.currentStageId='stage-outer-yard';s.units[0].currentStageId=s.currentStageId;visibility(m,s);
 const r=m.indexes.recipes['negotiate-reynolds'];assert.equal(executionProfile(s,r).durationMinutes,3);
 startWork(m,s,'question-worker-yard',unit.unitId);advanceTime(m,s,180);
 assert.equal(executionProfile(s,r).durationMinutes,1);
 s.currentStageId=s.units[0].currentStageId='stage-security-hall';s.instanceStates['reynolds-01'].combatState='ACTIVE';s.instanceStates['reynolds-01'].npcState.disposition='HOSTILE';visibility(m,s);
 assert.equal(recipeEligibility(m,s,r,unit.unitId).status,'BLOCKED');s.units[0].tier=2;
 const w=startWork(m,s,r.recipeInstanceId,unit.unitId);advanceTime(m,s,59);assert.notEqual(w.status,'COMPLETED');advanceTime(m,s,1);assert.equal(w.status,'COMPLETED');
});

test('Holding persuasion reveals authored rifle crates without exposing their hidden contents',()=>{
 const unit=read('party-presets').units.find(u=>u.profession==='DIPLOMAT');const s=createRuntime(m,[unit],'2026-09-25T12:00Z');chooseGate(m,s,true);
 explore(s);s.currentStageId=s.units[0].currentStageId='stage-holding-area';visibility(m,s);
 assert(!lootEntries(m,s).some(e=>e.instanceId==='equipment-crate-01'));s.instanceStates['guard-holding-01'].combatState='DOWN';s.knowledgeState.gained.push('holding-hidden-entrance-known');
 startWork(m,s,'persuade-epidemiologist',unit.unitId);advanceTime(m,s,180);
 assert.equal(lootEntries(m,s).filter(e=>e.instanceId.startsWith('equipment-crate')).length,2);
 assert.match(renderMap(m,s),/data-loot="equipment-crate-01"/);assert(!renderMap(m,s).includes('ASGARD'));
 s.currentStageId=s.units[0].currentStageId=m.gate.stageId;extract(m,s);finalizeDebrief(m,s,{receivingIds:['equipment-crate-01','equipment-crate-02']});
 const cargo=s.debrief.requests.flatMap(r=>r.cargo);assert.deepEqual(cargo.map(i=>i.itemId),['ASGARD_EM_RIFLE','HUMAN_ADVANCED_COIL_RIFLE']);assert.equal(new Set(cargo.map(i=>i.instanceId)).size,2);assert.deepEqual(cargo[0].knowledge.revealedTags,['PHYSICAL_OBJECT']);
});
