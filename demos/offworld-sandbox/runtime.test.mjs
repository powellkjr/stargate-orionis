import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission,clone} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,advanceTime,move,returnRoute,redial,extract} from '../shared/offworld/runtime.mjs';
import {portraitSvg} from '../shared/portraits/portrait.mjs';
const read=name=>JSON.parse(readFileSync(new URL(`../shared/data/offworld/${name}.json`,import.meta.url)));
const raw=read('missing-operative-001.finalized'),catalog=read('archetypes'),party=read('party-presets').units.slice(0,4);
const m=compileMission(raw,catalog),start='2026-09-24T14:00:00Z';
const fresh=()=>createRuntime(m,party,start);
test('resolves once, deep freezes definitions, and preserves input',()=>{
  const snapshot=JSON.stringify(raw);compileMission(raw,catalog);assert.equal(JSON.stringify(raw),snapshot);
  assert.throws(()=>m.stages[0].cells.push({x:0,y:0}),TypeError);
  assert.equal(m.indexes.transitions['door-mainhall-to-security'].requiredToolService,'TECH_SERVICE_II');
});
test('rejects missing references, illegal overrides, bad types, and invalid geometry',()=>{
  for(const change of [
    r=>r.transitions[0].archetypeId='absent',r=>r.recipes[0].targetId='absent',
    r=>r.instances[0].overrides={invented:true},r=>r.transitions[0].overrides={routine:'yes'},
    r=>r.stages[5].cells.pop(),r=>r.stages[0].cells.push({x:4,y:5}),
    r=>r.observations[0].overrides.supportsObservationIds=['absent'],
    r=>r.eventBindings[0].effects[1].eventArchetypeId='absent',
    r=>r.resultBindings[0].watch.instanceId='absent',
  ]) {const r=clone(raw);change(r);assert.throws(()=>compileMission(r,catalog),/MISSION VALIDATION ERROR/);}
});
test('deployment requires actual Units and stays separate from definitions',()=>{
  assert.throws(()=>createRuntime(m,read('party-presets').units,start),/at most 4/);
  assert.throws(()=>createRuntime(m,[],start),/at least one/);
  assert.throws(()=>createRuntime(m,[party[0],party[0]],start),/Duplicate/);
  const p=clone(party);p[0].perception=11;assert.throws(()=>createRuntime(m,p,start),/perception/);
  const s=fresh();s.units[0].stamina=1;assert.notEqual(party[0].stamina,1);assert.equal(m.deployment.mode,'EXTERNAL_BINDING');
});
test('Gate choice required, atomic whole-party moves and closed routine doors',()=>{
  const s=fresh();assert.throws(()=>move(m,s,'door-gate-to-yard'),/Gate/);
  chooseGate(m,s,true);move(m,s,'door-gate-to-yard');move(m,s,'door-yard-to-mainhall');
  assert.equal(s.stageStates['stage-holding-area'].visibility,'HIDDEN');
  const before=JSON.stringify(s);assert.throws(()=>move(m,s,'door-mainhall-to-security'),/interaction/);assert.equal(JSON.stringify(s),before);
  move(m,s,'door-mainhall-to-holding');assert(s.units.every(u=>u.currentStageId==='stage-holding-area'));
  assert.equal(s.transitionStates['door-mainhall-to-holding'].state,'OPEN');assert.equal(s.sgcCurrentTime,'2026-09-24T14:03:00.000Z');
});
test('visibility, exploration and last-known security are independent',()=>{
  const s=fresh();assert.equal(s.stageStates['stage-outer-yard'].visibility,'PARTIAL');
  assert.equal(s.stageStates['stage-holding-area'].knownShape,false);
  chooseGate(m,s,true);move(m,s,'door-gate-to-yard');move(m,s,'door-yard-to-mainhall');
  assert.equal(s.stageStates['stage-gate-yard'].visibility,'HIDDEN');assert.equal(s.stageStates['stage-gate-yard'].securityState,'SECURE');
  assert.equal(s.stageStates['stage-processing'].visibility,'PARTIAL');assert(!s.knowledgeState.gained.includes('advanced-mining-technology-confirmed'));
});
test('37 minute limit closes connection exactly once without ending mission',()=>{
  const s=fresh();chooseGate(m,s,true);advanceTime(m,s,2219);assert.equal(s.gateState.connection,'OPEN_TO_SGC');
  advanceTime(m,s,2);assert.equal(s.gateState.connection,'CLOSED');assert.equal(s.status,'ACTIVE');assert.equal(s.gateState.sgcOccupied,false);
  advanceTime(m,s,3600);const events=s.emittedEvents.filter(e=>e.event==='event_wormhole_expired');assert.equal(events.length,1);assert.equal(events[0].atSeconds,2220);
});
test('return uses known graph rather than breadcrumbs and does not teleport',()=>{
  const s=fresh();chooseGate(m,s,true);
  for(const id of ['door-gate-to-yard','door-yard-to-mainhall','door-mainhall-to-holding','door-mainhall-to-holding','door-mainhall-to-processing','door-processing-to-office'])move(m,s,id);
  const route=returnRoute(m,s);assert.equal(route.length,4);assert.equal(s.currentStageId,'stage-overseer-office');
  for(const id of route)move(m,s,id);assert.equal(s.currentStageId,m.gate.stageId);
  assert.equal(s.missionElapsedSeconds,600);assert.equal(s.transitionStates['door-security-to-office'].state,'LOCKED');
});
test('extraction requires physical Gate and redial after closing',()=>{
  const s=fresh();chooseGate(m,s,false);assert.throws(()=>extract(m,s),/Redial/);
  move(m,s,'door-gate-to-yard');assert.throws(()=>redial(m,s),/Gate/);assert.throws(()=>extract(m,s),/Gate/);
  move(m,s,'door-gate-to-yard');redial(m,s);assert.equal(s.gateState.elapsedSeconds,0);extract(m,s);
  assert.equal(s.status,'EXTRACTED');assert(s.units.every(u=>u.partyStatus==='EXTRACTED'));assert.equal(s.resultEvents.filter(e=>e.type==='PARTY_EXTRACTED').length,1);
});
test('identical actions reproduce exactly and reset retains original input',()=>{
  const run=()=>{const s=fresh();chooseGate(m,s,true);move(m,s,'door-gate-to-yard');advanceTime(m,s,180);return s;};
  assert.deepEqual(run(),run());assert.equal(fresh().missionElapsedSeconds,0);assert.equal(fresh().units[0].stamina,party[0].stamina);
});
test('portrait layers can change independently without changing Unit data',()=>{
  const before=JSON.stringify(party[0]),a=portraitSvg(party[0].appearance),b=portraitSvg({...party[0].appearance,collarColor:'#ff0000'});
  assert.notEqual(a,b);for(const part of ['face','hair','uniform','collar'])assert(a.includes(`data-part="${part}"`));
  assert.equal(JSON.stringify(party[0]),before);assert(!portraitSvg({skinColor:'"><script>'}).includes('<script>'));
});
