import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,visibility,advanceTime,returnRoute,extract} from '../shared/offworld/runtime.mjs';
import {startWork,recipeEligibility} from '../shared/offworld/field.mjs';
import {startDialogue,respondDialogue,continueDialogue} from '../shared/offworld/dialogue.mjs';
import {createTool} from '../shared/offworld/equipment.mjs';
import {debriefOptions} from '../shared/offworld/recovery.mjs';
import {lootHtml} from './recovery-ui.mjs';
const read=n=>JSON.parse(readFileSync(new URL(`../shared/data/${n}.json`,import.meta.url)));
const catalog={...read('offworld/archetypes'),itemDefinitions:read('item')};
const m=compileMission(read('offworld/missing-operative-001.finalized'),catalog);
function fresh(){
  const party=read('offworld/party-presets').units.filter(u=>['TECHNICIAN','SCIENTIST','DIPLOMAT','SOLDIER'].includes(u.profession));
  for(const u of party){u.tier=2;u.tools=[createTool(u,0,{TECHNICIAN:'TET2',SCIENTIST:'SCT2',DIPLOMAT:'DIT2',SOLDIER:'SOT2'}[u.profession],10,catalog)];}
  const s=createRuntime(m,party,'2026-10-05T12:00Z');chooseGate(m,s,true);return s;
}
function place(s,id){s.currentStageId=id;for(const u of s.units)u.currentStageId=id;s.stageStates[id].explored=true;s.stageStates[id].visitCount=1;visibility(m,s);}
function complete(s,id){const w=startWork(m,s,id);advanceTime(m,s,w.durationSeconds);assert.equal(w.status,'COMPLETED',w.failure);return w;}
test('three room locks accept hacking or overseer codes without spending charges for codes',()=>{
  for(const id of ['door-mainhall-to-processing','door-processing-to-lab','door-mainhall-to-holding']){
    const s=fresh(),t=m.indexes.transitions[id];place(s,t.fromStageId);assert.equal(s.transitionStates[id].state,'LOCKED');
    assert.equal(recipeEligibility(m,s,m.indexes.recipes['enter-code-'+id]).status,'BLOCKED');
    const w=complete(s,'hack-'+id);assert.equal(w.outcome.chargesSpent,1);assert.equal(s.transitionStates[id].state,'OPEN');
    const coded=fresh();place(coded,'stage-overseer-office');coded.previousStageId='stage-security-hall';startDialogue(m,coded,'dialogue-mcguffin-cover',null,true);
    assert.match(coded.dialogue.history[0].text,/mercenary crew/);respondDialogue(m,coded,'mcguffin-mercenary-yes');continueDialogue(m,coded);
    assert(coded.knowledgeState.gained.includes('facility-room-codes-known'));place(coded,t.fromStageId);
    assert.equal(complete(coded,'enter-code-'+id).outcome.chargesSpent,0);
  }
});
test('Scientist creates persistent party report; handing it over removes it and raises suspicion with a reason',()=>{
  const s=fresh();place(s,'stage-analysis-lab');assert.equal(recipeEligibility(m,s,m.indexes.recipes['create-lab-report']).blocker,'REQUIRED_KNOWLEDGE_MISSING');
  s.knowledgeState.gained.push('lab-device-characterized');complete(s,'create-lab-report');assert.deepEqual(s.partyStorage,['lab-report-01']);
  const report=s.instanceStates['lab-report-01'];place(s,'stage-overseer-office');s.previousStageId='stage-processing';startDialogue(m,s,'dialogue-mcguffin-cover',null,true);
  assert.match(s.dialogue.history[0].text,/how did you get access/);const opening=s.instanceStates['mcguffin-01'].npcState.suspicion;assert(opening>=30);
  respondDialogue(m,s,'mcguffin-entry-diplomat');respondDialogue(m,s,'mcguffin-containment-play-dumb');respondDialogue(m,s,'mcguffin-processing-vague');
  const before=s.instanceStates['mcguffin-01'].npcState.suspicion;respondDialogue(m,s,'mcguffin-hand-report');
  assert.equal(s.instanceStates['mcguffin-01'].npcState.suspicion,Math.min(100,before+45));assert.match(s.dialogue.history.at(-1).text,/too detailed/);
  assert.equal(s.instanceStates['lab-report-01'].custody,'HELD_BY_NPC');assert.equal(s.partyStorage.length,0);assert.equal(s.instanceStates['lab-report-01'].holderId,'mcguffin-01');assert.equal(report.instanceId,s.instanceStates['lab-report-01'].instanceId);
});
test('office work applies authored suspicion and processing worker gives a closing explanation',()=>{
  const s=fresh();place(s,'stage-overseer-office');s.stageStates[s.currentStageId].visitCount=0;
  const before=s.instanceStates['mcguffin-01'].npcState.suspicion;complete(s,'question-mcguffin');assert.equal(s.instanceStates['mcguffin-01'].npcState.suspicion,before+35);
  place(s,'stage-processing');startDialogue(m,s,'dialogue-processing-worker');respondDialogue(m,s,'processing-worker-diplomat');assert.match(s.dialogue.history.at(-1).text,/overseer/);assert(s.dialogue);continueDialogue(m,s);assert.equal(s.dialogue,null);
});
test('potential yard enemies block evacuation but never block party withdrawal or already delivered objects',()=>{
  const s=fresh();for(const st of Object.values(s.stageStates))Object.assign(st,{knownShape:true,explored:true});for(const t of Object.values(s.transitionStates))Object.assign(t,{known:true,state:'OPEN'});
  place(s,'stage-holding-area');s.incidentStates['incident-holding-medical'].state='RESOLVED';s.instanceStates['guard-holding-01'].combatState='SURRENDERED';s.instanceStates['operative-01'].detectionState='LOCATED';s.knowledgeState.gained.push('operative-contacted');s.instanceStates['radiation-source-01'].active=false;s.incidentStates['incident-processing-radiation'].state='RESOLVED';
  assert(returnRoute(m,s));assert.equal(returnRoute(m,s,{secure:true}),null);assert.equal(recipeEligibility(m,s,m.indexes.recipes['extract-operative']).blocker,'NO_SECURE_GATE_ROUTE');
  for(const id of ['guard-yard-01','guard-yard-02'])s.instanceStates[id].combatState='SURRENDERED';assert(returnRoute(m,s,{secure:true}));
  const w=startWork(m,s,'extract-operative');s.instanceStates['guard-yard-01'].combatState='NEUTRAL';advanceTime(m,s,w.durationSeconds);assert.equal(w.status,'FAILED');assert.equal(s.instanceStates['operative-01'].custody,'LOCAL');
  place(s,m.gate.stageId);extract(m,s);assert.equal(s.status,'EXTRACTED');assert.equal(debriefOptions(m,s).loot.find(x=>x.instanceId==='supply-cache-01').eligible,false);
  s.instanceStates['supply-cache-01'].custody='RECOVERED_TO_SGC';assert.equal(debriefOptions(m,s).loot.find(x=>x.instanceId==='supply-cache-01').eligible,true);
  assert.doesNotMatch(lootHtml(m,s),/\d+\/\d+ secured/);
});