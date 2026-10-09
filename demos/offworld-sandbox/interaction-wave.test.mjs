import {createTool} from '../shared/offworld/equipment.mjs';
import {renderMap} from './map.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,move,advanceTime,visibility} from '../shared/offworld/runtime.mjs';
import {startDialogue,respondDialogue,continueDialogue,refreshDialogue,dialogueResponses} from '../shared/offworld/dialogue.mjs';
import {startWork,recipeEligibility} from '../shared/offworld/field.mjs';
import {engage,refreshCampaign} from '../shared/offworld/campaign.mjs';
import {conversationHtml} from './conversation.mjs';
const read=n=>{const data=JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));return n.endsWith('archetypes')?{...data,itemDefinitions:JSON.parse(readFileSync(new URL('../shared/data/item.json',import.meta.url)))}:data;};
const m=compileMission(read('missing-operative-001.finalized'),read('archetypes'));
function fresh(){const units=read('party-presets').units.filter(u=>['DIPLOMAT','SOLDIER','MEDIC','TECHNICIAN'].includes(u.profession));units.find(u=>u.profession==='SOLDIER').tier=2;const s=createRuntime(m,units,'2026-09-25T12:00Z');chooseGate(m,s,true);return s;}
function place(s,id){s.currentStageId=id;for(const u of s.units)u.currentStageId=id;visibility(m,s);refreshCampaign(m,s);}
function located(s){s.knowledgeState.gained.push('operative-located','operative-contacted');s.instanceStates['operative-01'].detectionState='LOCATED';}
function route(s){s.incidentStates['incident-holding-medical'].state='RESOLVED';s.instanceStates['guard-holding-01'].combatState='SURRENDERED';for(const st of Object.values(s.stageStates))st.knownShape=true;for(const t of Object.values(s.transitionStates))Object.assign(t,{known:true,state:'OPEN'});}
test('NPC opening has no responder and response admission considers local qualified Units',()=>{
 const s=fresh();move(m,s,'door-gate-to-yard');assert.equal(s.dialogue.actorId,null);assert.equal((conversationHtml(m,s).match(/class="portrait"/g)||[]).length,1);
 const r=dialogueResponses(m,s).find(r=>r.responseId==='yard-diplomat-smalltalk');assert(r.eligible);const soldier=s.units.find(u=>u.profession==='SOLDIER');
 const before=structuredClone(s);assert.throws(()=>respondDialogue(m,s,r.responseId,soldier.unitId),/unavailable/);assert.deepEqual(s,before);
 respondDialogue(m,s,r.responseId,r.candidates[0]);assert.equal(s.dialogue.history[1].actorId,r.candidates[0]);assert.equal((conversationHtml(m,s).match(/class="portrait"/g)||[]).length,2);
 assert.equal(m.indexes.recipes['question-worker-yard'],undefined);
});
test('operative waits for Talk; repeated contact and worker questioning accumulate holding suspicion',()=>{
 const s=fresh();place(s,'stage-holding-area');located(s);assert.equal(refreshDialogue(m,s),false);const initial=s.instanceStates['guard-holding-01'].npcState.suspicion;
 for(let i=0;i<2;i++){startDialogue(m,s,'dialogue-operative');respondDialogue(m,s,'operative-ready');}
 assert.equal(s.instanceStates['guard-holding-01'].npcState.suspicion,Math.min(100,initial+90));
 assert.equal(s.incidentStates['incident-holding-guards'].state,'ACTIVE');
 const second=fresh();place(second,'stage-holding-area');
 s.instanceStates['guard-holding-01'].npcState.suspicion=0;
 for(let i=0;i<2;i++){startDialogue(m,second,'dialogue-holding-worker');respondDialogue(m,second,'holding-worker-leave');}
 assert.equal(second.instanceStates['guard-holding-01'].npcState.suspicion,100);assert.equal(second.incidentStates['incident-holding-guards'].state,'ACTIVE');
});
test('routine security corridor starts directional dialogue and supplies free office access',()=>{
 const s=fresh();move(m,s,'door-gate-to-yard');respondDialogue(m,s,'yard-ignore');move(m,s,'door-yard-to-mainhall');move(m,s,'door-mainhall-to-security');
 assert.equal(s.dialogue.sceneId,'dialogue-reynolds');assert.match(s.dialogue.history[0].text,/Don't wander/);respondDialogue(m,s,'reynolds-routine');
 const charges=structuredClone(s.units.map(u=>u.tools));assert.equal(s.transitionStates['door-security-to-office'].state,'CLOSED');assert.equal(recipeEligibility(m,s,m.indexes.recipes['hack-door-security-to-office']).blocker,'INVALID_TARGET_STATE');assert.deepEqual(s.units.map(u=>u.tools),charges);
 move(m,s,'door-security-to-office');assert.equal(s.dialogue.sceneId,'dialogue-mcguffin-cover');
 s.dialogue=null;move(m,s,'door-security-to-office');assert.equal(s.dialogue.variantId,'return-from-office');assert(dialogueResponses(m,s).some(r=>r.source==='SOLDIER'&&r.eligible));
});
test('social checkpoint clearance permits party passage but does not secure evacuation',()=>{
 for(const id of ['yard-clear-diplomat','yard-clear-soldier']){
  const s=fresh();located(s);s.instanceStates['operative-01'].evacState='READY_TO_EVACUATE';route(s);place(s,'stage-outer-yard');s.instanceStates['guard-yard-01'].npcState.disposition='CONFRONTING';
  startDialogue(m,s,'dialogue-yard-checkpoint');respondDialogue(m,s,id);assert.equal(s.stageStates['stage-outer-yard'].socialPassage,true);assert.equal(s.stageStates['stage-outer-yard'].securityState,'UNSECURE');
  place(s,'stage-holding-area');assert.equal(recipeEligibility(m,s,m.indexes.recipes['extract-operative']).blocker,'NO_SECURE_GATE_ROUTE');assert.equal(s.instanceStates['operative-01'].custody,'LOCAL');
 }
});
test('yard combat resolves a real encounter and permits early evacuation of the same operative',()=>{
 const s=fresh();located(s);s.instanceStates['operative-01'].evacState='READY_TO_EVACUATE';route(s);place(s,'stage-outer-yard');engage(m,s,'incident-yard-guards');advanceTime(m,s,300);
 assert.equal(s.incidentStates['incident-yard-guards'].state,'RESOLVED');assert.equal(refreshDialogue(m,s),false);place(s,'stage-holding-area');assert.equal(recipeEligibility(m,s,m.indexes.recipes['extract-operative']).status,'AVAILABLE');
});
test('terminal code has an authored source, unlocks once and spends no Tool charges',()=>{
 const s=fresh();place(s,'stage-overseer-office');const charges=structuredClone(s.units.map(u=>u.tools));
 assert.equal(recipeEligibility(m,s,m.indexes.recipes['enter-security-code']).blocker,'REQUIRED_KNOWLEDGE_MISSING');startWork(m,s,'question-mcguffin');advanceTime(m,s,180);s.dialogue=null;
 const w=startWork(m,s,'enter-security-code');advanceTime(m,s,180);assert.equal(w.status,'COMPLETED');assert.equal(s.instanceStates['security-terminal-01'].locked,false);assert.match(w.outcome.text,/code is accepted/);assert.equal(w.outcome.chargesSpent,0);assert.deepEqual(s.units.map(u=>u.tools),charges);
 assert.equal(recipeEligibility(m,s,m.indexes.recipes['destroy-security-terminal-tech']).blocker,'INVALID_TARGET_STATE');
});
test('unknown directional dialogue trigger fails compiler validation',()=>{
 const raw=read('missing-operative-001.finalized');raw.dialogueScenes[0].startWhen={enteredFromStage:'missing-stage'};assert.throws(()=>compileMission(raw,read('archetypes')),/unknown entry Stage/);
});

test('Holding exposes Talk without prior detection and withholds Send to Gate until contact',()=>{
 const s=fresh();place(s,'stage-holding-area');
 assert.equal(s.dialogue,null);assert(renderMap(m,s).includes('data-dialogue-start="dialogue-operative"'));assert(!renderMap(m,s).includes('data-recipe="extract-operative"'));
 s.instanceStates['radiation-source-01'].active=false;assert.equal(recipeEligibility(m,s,m.indexes.recipes['extract-operative']).status,'HIDDEN');
 startDialogue(m,s,'dialogue-operative');assert.equal(s.dialogue.actorId,null);respondDialogue(m,s,'operative-ready');assert(s.knowledgeState.gained.includes('operative-contacted'));assert.equal(s.instanceStates['operative-01'].detectionState,'LOCATED');for(const id of ['guard-yard-01','guard-yard-02'])s.instanceStates[id].combatState='SURRENDERED';route(s);assert.equal(recipeEligibility(m,s,m.indexes.recipes['extract-operative']).status,'AVAILABLE');
});
test('watched medical and collection actions push Holding suspicion into combat',()=>{
 const s=fresh();place(s,'stage-holding-area');const initial=s.instanceStates['guard-holding-01'].npcState.suspicion;const medic=s.units.find(u=>u.profession==='MEDIC');medic.tools=[createTool(medic,0,'MET2',10,read('archetypes'))];
 for(const recipe of ['assess-patient-01','stabilize-patient-01','assess-patient-02','stabilize-patient-02']){const w=startWork(m,s,recipe);advanceTime(m,s,w.durationSeconds);assert.equal(w.status,'COMPLETED');}
 assert.equal(s.instanceStates['guard-holding-01'].npcState.suspicion,Math.min(100,initial+80));assert.equal(s.incidentStates['incident-holding-guards'].state,'ACTIVE');assert.equal(recipeEligibility(m,s,m.indexes.recipes['collect-equipment-crate-01']).status,'HIDDEN');
});
