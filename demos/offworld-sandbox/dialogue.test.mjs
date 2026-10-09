import {refreshCampaign} from '../shared/offworld/campaign.mjs';
import {withOpenRoomAccess} from './test-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,advanceTime,visibility,exits,move} from '../shared/offworld/runtime.mjs';
import {startWork,recipeEligibility} from '../shared/offworld/field.mjs';
import {renderMap} from './map.mjs';
const read=n=>{const data=JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));return n.endsWith('archetypes')?{...data,itemDefinitions:JSON.parse(readFileSync(new URL('../shared/data/item.json',import.meta.url)))}:data;};
const m=compileMission({...read('missing-operative-001.finalized'),dialogueScenes:[],transitions:withOpenRoomAccess(read('missing-operative-001.finalized')).transitions},read('archetypes'));
function setup(){const units=read('party-presets').units.filter(u=>['DIPLOMAT','SOLDIER','MEDIC','TECHNICIAN'].includes(u.profession));const s=createRuntime(m,units,'2026-09-25T12:00Z');chooseGate(m,s,true);s.instanceStates['guard-holding-01'].combatState='SURRENDERED';for(const id of ['guard-yard-01','guard-yard-02'])s.instanceStates[id].combatState='SURRENDERED';return s;}
function place(s,id){s.currentStageId=id;for(const u of s.units)u.currentStageId=id;s.stageStates[id].explored=true;s.stageStates[id].knownShape=true;visibility(m,s);}
test('hostiles hide civilian actions, social resolution stays available, and invalid hexes disappear',()=>{
 const s=setup();place(s,'stage-overseer-office');s.instanceStates['mcguffin-01'].combatState='ACTIVE';s.instanceStates['mcguffin-01'].npcState.disposition='HOSTILE';assert.equal(recipeEligibility(m,s,m.indexes.recipes['hack-security-terminal']).status,'HIDDEN');assert.throws(()=>startWork(m,s,'hack-security-terminal'),/HIDDEN/);
 assert(!renderMap(m,s).includes('data-recipe="hack-security-terminal"'));
 assert.notEqual(recipeEligibility(m,s,m.indexes.recipes['negotiate-mcguffin']).status,'HIDDEN');
 s.instanceStates['mcguffin-01'].combatState='DOWN';assert(!renderMap(m,s).includes('data-recipe="negotiate-mcguffin"'));
 s.instanceStates['security-terminal-01'].powered=false;assert(!renderMap(m,s).includes('data-recipe="destroy-security-terminal'));
});
test('Small talk and Inquire reveal only their authored doors and rooms',()=>{
 const s=setup();place(s,'stage-holding-area');s.instanceStates['guard-holding-01'].combatState='DOWN';
 assert(!exits(m,s).some(e=>e.toStageId==='stage-hidden-store'));assert.throws(()=>move(m,s,'door-stage-hidden-store'),/not adjacent/);
 startWork(m,s,'small-talk-worker-holding');advanceTime(m,s,60);
 assert(s.knowledgeState.gained.includes('holding-hidden-entrance-known'));assert(exits(m,s).some(e=>e.toStageId==='stage-hidden-store'));move(m,s,'door-stage-hidden-store');
 assert.match(renderMap(m,s),/data-loot="equipment-crate-02"/);
 place(s,'stage-processing');assert.equal(recipeEligibility(m,s,m.indexes.recipes['inquire-worker-processing']).blocker,'INVALID_TARGET_STATE');s.instanceStates['radiation-source-01'].active=false;
 startWork(m,s,'inquire-worker-processing');advanceTime(m,s,60);place(s,'stage-overseer-office');assert(exits(m,s).some(e=>e.toStageId==='stage-hidden-safe'));move(m,s,'door-stage-hidden-safe');assert.match(renderMap(m,s),/data-loot="safe-intel-01"/);
});
test('operative departure needs care or source resolution plus a Gate route; Talk explains it',()=>{
 const s=setup();place(s,'stage-holding-area');s.instanceStates['guard-holding-01'].combatState='DOWN';s.knowledgeState.gained.push('operative-located','operative-contacted');s.instanceStates['operative-01'].detectionState='LOCATED';
 for(const stage of Object.values(s.stageStates))stage.knownShape=true;for(const edge of Object.values(s.transitionStates))Object.assign(edge,{known:true,state:'OPEN'});
 assert.equal(recipeEligibility(m,s,m.indexes.recipes['extract-operative']).blocker,'NO_SECURE_GATE_ROUTE');assert.equal(m.indexes.recipes['talk-operative'],undefined);
 for(const id of ['patient-01','patient-02','patient-03'])s.instanceStates[id].condition='STABILIZED';refreshCampaign(m,s);startWork(m,s,'extract-operative');advanceTime(m,s,180);assert.equal(s.instanceStates['operative-01'].custody,'AT_GATE');assert.equal(s.instanceStates['operative-01'].currentStageId,m.gate.stageId);
});
test('downed supervisor gives door code and opening it spends no Tool charges',()=>{
 const s=setup();place(s,'stage-security-hall');for(const id of ['reynolds-01','guard-security-01','guard-security-02'])s.instanceStates[id].combatState='DOWN';
 startWork(m,s,'question-reynolds');advanceTime(m,s,180);assert(s.knowledgeState.gained.includes('security-office-door-code-known'));
 s.transitionStates['door-security-to-office'].state='LOCKED';const before=s.units.map(u=>u.tools);const w=startWork(m,s,'enter-security-office-door-code');advanceTime(m,s,60);assert.equal(w.outcome.chargesSpent,0);assert.equal(s.transitionStates['door-security-to-office'].state,'OPEN');assert.deepEqual(s.units.map(u=>u.tools),before);
});
test('Gate map choices follow initial choice, open connection, and redial states',()=>{
 const s=createRuntime(m,read('party-presets').units.filter(u=>['DIPLOMAT','SOLDIER','MEDIC','TECHNICIAN'].includes(u.profession)),'2026-09-25T12:00Z');assert.match(renderMap(m,s),/data-gate-action="keepGate"/);assert.match(renderMap(m,s),/data-gate-action="closeGate"/);chooseGate(m,s,false);assert.match(renderMap(m,s),/data-gate-action="redial"/);
});
