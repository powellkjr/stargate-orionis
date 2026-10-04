import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {combatPacer,damageFeedback} from './combat-feedback.mjs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,advanceTime,visibility} from '../shared/offworld/runtime.mjs';
import {engage,localCombat,refreshCampaign} from '../shared/offworld/campaign.mjs';
import {renderMap} from './map.mjs';
const read=n=>JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));
const m=compileMission({...read('missing-operative-001.finalized'),dialogueScenes:[]},read('archetypes'));
function encounter(){
  const s=createRuntime(m,read('party-presets').units.slice(0,4),'2026-09-25T12:00Z');chooseGate(m,s,true);
  s.currentStageId='stage-security-hall';for(const u of s.units)u.currentStageId=s.currentStageId;
  visibility(m,s);refreshCampaign(m,s);engage(m,s,'incident-security-guards');return s;
}
test('each authored combat round waits three real seconds without tab-resume catch-up',()=>{
  const s=encounter(),pace=combatPacer(),incidents=localCombat(m,s),round=m.indexes.incidents['incident-security-guards'].roundSeconds;
  assert.equal(pace(m,s,incidents,0),0);
  assert.equal(pace(m,s,incidents,2999),0);
  const step=pace(m,s,incidents,3000);assert.equal(step,round);
  advanceTime(m,s,step);assert.equal(s.incidentStates['incident-security-guards'].round,1);
  assert.equal(pace(m,s,incidents,3000),0);
  assert.equal(pace(m,s,incidents,5999),0);
  assert.equal(pace(m,s,incidents,6000),round);
  assert.equal(pace(m,s,incidents,60000),round,'Long pause still allows only the next round');
  assert.equal(pace(m,s,incidents,60001),0);
});
test('reset, pause and re-engagement discard pacing from the previous context',()=>{
  const pace=combatPacer(),s=encounter(),incidents=localCombat(m,s);
  pace(m,s,incidents,0);assert.equal(pace(m,s,[],2900),0);
  assert.equal(pace(m,s,incidents,3000),0);assert.equal(pace(m,s,incidents,5999),0);
  const next=encounter();assert.equal(pace(m,next,localCombat(m,next),6000),0);
});
test('damage floats for NPCs and Units, expires in real time and never replays on redraw',()=>{
  const s=encounter(),feedback=damageFeedback();assert.deepEqual(feedback(s,0),[]);
  advanceTime(m,s,m.indexes.incidents['incident-security-guards'].roundSeconds);
  assert.equal(feedback(s,10).length,1,'Shots start individually');
  const frames=feedback(s,1010);assert(frames.some(f=>m.indexes.instances[f.targetId]));assert(frames.some(f=>s.units.some(u=>u.unitId===f.targetId)));
  const html=renderMap(m,s,22,true,frames);
  for(const frame of frames)assert(html.includes(`data-damage-target="${frame.targetId}"`));
  assert.match(html,/class="floating-damage"/);assert.match(html,/class="combat-shot"/);
  assert(frames.some(f=>f.progress>0));assert(frames.some(f=>f.shotVisible));assert.deepEqual(feedback(s,2810),[]);
  assert.deepEqual(feedback(s,3000),[]);assert(!renderMap(m,s,22,true,feedback(s,3000)).includes('floating-damage'));
  assert.deepEqual(feedback(encounter(),3001),[]);
});
test('combat hit ledger reports actual health lost, including lethal overkill',()=>{
  const s=encounter(),npc='guard-security-01',unit=s.units[0];
  s.instanceStates[npc].health=1;unit.health=1;
  advanceTime(m,s,m.indexes.incidents['incident-security-guards'].roundSeconds);
  const hits=s.resultEvents.filter(e=>e.type==='COMBAT_HIT');
  assert.equal(hits.find(e=>e.targetId===npc).damage,1);
  assert.equal(hits.find(e=>e.targetId===unit.unitId).damage,1);
});
test('lone NPC lasts three rounds against the four-person prototype party',()=>{
  const s=encounter();
  s.incidentStates['incident-security-guards'].state='DORMANT';
  s.currentStageId='stage-overseer-office';for(const u of s.units)u.currentStageId=s.currentStageId;
  engage(m,s,'incident-office-guards');
  const round=m.indexes.incidents['incident-office-guards'].roundSeconds;
  advanceTime(m,s,round*2);assert.equal(s.instanceStates['mcguffin-01'].health,6);
  advanceTime(m,s,round);assert.equal(s.instanceStates['mcguffin-01'].combatState,'DOWN');
  assert.equal(s.incidentStates['incident-office-guards'].round,3);
});