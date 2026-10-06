import {outcomeLines} from './outcomes.mjs';
import {renderMap} from './map.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,advanceTime,move,extract,visibility} from '../shared/offworld/runtime.mjs';
import {engage,retreat,refreshCampaign,missionResults} from '../shared/offworld/campaign.mjs';
import {startWork,recipeEligibility} from '../shared/offworld/field.mjs';
import {createTool} from '../shared/offworld/equipment.mjs';
const read=n=>{const data=JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));return n.endsWith('archetypes')?{...data,itemDefinitions:JSON.parse(readFileSync(new URL('../shared/data/item.json',import.meta.url)))}:data;};
const m=compileMission({...read('missing-operative-001.finalized'),dialogueScenes:[]},read('archetypes'));
function state(){const s=createRuntime(m,read('party-presets').units.slice(0,4),'2026-09-25T12:00Z');chooseGate(m,s,true);return s;}
function place(s,stage){s.currentStageId=stage;for(const u of s.units)u.currentStageId=stage;for(const i of m.instances.filter(i=>i.stageId===stage&&i.npcState)){s.instanceStates[i.instanceId].combatState='ACTIVE';s.instanceStates[i.instanceId].npcState.disposition='HOSTILE';}visibility(m,s);refreshCampaign(m,s);}
test('medical and radiation resolution require physical conditions; objectives follow authored watchers',()=>{
  const s=state();s.knowledgeState.gained.push('multiple-ill-patients-present');place(s,'stage-holding-area');
  s.instanceStates['patient-01'].condition='STABILIZED';s.instanceStates['patient-02'].condition='STABILIZED';refreshCampaign(m,s);
  assert.equal(s.incidentStates['incident-holding-medical'].state,'ACTIVE');
  s.instanceStates['patient-03'].condition='STABILIZED';refreshCampaign(m,s);
  assert.equal(s.objectiveStates['stabilize-medical-crisis'].state,'COMPLETED');
  assert.equal(s.stageStates[s.currentStageId].securityState,'UNSECURE','guard remains active');
  s.instanceStates['radiation-source-01'].active=false;refreshCampaign(m,s);
  assert.equal(s.incidentStates['incident-processing-radiation'].state,'RESOLVED');
  assert.equal(s.instanceStates['mining-system-01'].repairIncomplete,true,'containment does not repair machinery');
});
test('automatic combat is deterministic across time slices, preserves downed identities and resolves security',()=>{
  const a=state(),b=state();for(const s of [a,b]){place(s,'stage-security-hall');engage(m,s,'incident-security-guards');}
  advanceTime(m,a,300);for(let i=0;i<100;i++)advanceTime(m,b,3);
  assert.deepEqual(a,b);assert.equal(a.incidentStates['incident-security-guards'].state,'RESOLVED');
  for(const id of ['guard-security-01','guard-security-02','reynolds-01']){assert.equal(a.instanceStates[id].combatState,'DOWN');assert.equal(a.instanceStates[id].custody,'LOCAL');}
  assert.equal(a.stageStates['stage-security-hall'].securityState,'SECURE');
  assert.equal(a.instanceStates['mcguffin-01'].awareness,'ALERTED');
});
test('disengagement allows a real retreat and preserves hostile health',()=>{
  const s=state();place(s,'stage-security-hall');engage(m,s,'incident-security-guards');
  assert.throws(()=>move(m,s,'door-mainhall-to-security'),/Disengage/);
  advanceTime(m,s,30);const hp=s.instanceStates['guard-security-02'].health;
  retreat(m,s,'incident-security-guards');assert.equal(s.currentStageId,'stage-security-hall');
  engage(m,s,'incident-security-guards');assert.equal(s.instanceStates['guard-security-02'].health,hp);
});
test('authored escalation executes once at exact clock boundaries and cannot purge recovered evidence',()=>{
  const s=state();s.emittedEvents.push({event:'event_gunfire_occurred',stageId:'stage-security-hall',atSeconds:0});refreshCampaign(m,s);
  advanceTime(m,s,179);assert.equal(s.instanceStates['evidence-archive-01'].evidenceState,'INTACT');
  advanceTime(m,s,1);assert.equal(s.instanceStates['evidence-archive-01'].evidenceState,'PURGING');
  advanceTime(m,s,180);assert.equal(s.instanceStates['evidence-archive-01'].evidenceState,'DESTROYED');
  assert.equal(s.firedBindings.filter(x=>x==='begin-evidence-purge').length,1);
  const b=state();b.instanceStates['evidence-archive-01'].custody='CARRIED_OFFWORLD';b.emittedEvents.push({event:'event_mcguffin_alerted',atSeconds:0});advanceTime(m,b,600);
  assert.equal(b.instanceStates['evidence-archive-01'].evidenceState,'INTACT');
});
test('locating activates extraction but only physical extraction completes it; results remain snapshots',()=>{
  const s=state();s.instanceStates['operative-01'].detectionState='LOCATED';refreshCampaign(m,s);
  assert.equal(s.objectiveStates['locate-operative'].state,'COMPLETED');assert.equal(s.objectiveStates['extract-operative'].state,'ACTIVE');
  s.carriedAssets.push('operative-01');Object.assign(s.instanceStates['operative-01'],{custody:'CARRIED_OFFWORLD',partyStatus:'ESCORTED'});extract(m,s);
  assert.equal(s.objectiveStates['extract-operative'].state,'COMPLETED');const result=missionResults(m,s);
  assert.equal(result.recoveredAssets[0].instanceId,'operative-01');result.persistentInstances['operative-01'].custody='ALTERED';assert.equal(s.instanceStates['operative-01'].custody,'RECOVERED_TO_SGC');
});
test('provisional negotiation surrenders active guards without reviving downed participants',()=>{
  const units=read('party-presets').units;const diplomat=units.find(u=>u.profession==='DIPLOMAT');diplomat.tier=2;
  const s=createRuntime(m,[diplomat],'2026-09-25T12:00Z');chooseGate(m,s,true);place(s,'stage-security-hall');s.instanceStates['guard-security-01'].combatState='DOWN';
  startWork(m,s,'negotiate-reynolds',diplomat.unitId);advanceTime(m,s,180);
  assert.equal(s.instanceStates['reynolds-01'].combatState,'SURRENDERED');assert.equal(s.instanceStates['guard-security-02'].combatState,'SURRENDERED');assert.equal(s.instanceStates['guard-security-01'].combatState,'DOWN');
  assert.equal(s.incidentStates['incident-security-guards'].state,'RESOLVED');
});
test('terminal destruction preserves recoverable physical instance and blocks subsequent hacking',()=>{
  const unit=read('party-presets').units[0];unit.tools=[createTool(unit,0,'SOT1',3,m.toolCatalog)];
  const s=createRuntime(m,[unit],'2026-09-25T12:00Z');chooseGate(m,s,true);place(s,'stage-overseer-office');s.instanceStates['mcguffin-01'].combatState='DOWN';
  startWork(m,s,'destroy-security-terminal-soldier',unit.unitId);advanceTime(m,s,180);
  assert.equal(s.instanceStates['security-terminal-01'].condition,'WRECKAGE');assert.equal(s.instanceStates['security-terminal-01'].custody,'LOCAL');
  assert.equal(s.instanceStates['evidence-archive-01'].evidenceState,'INTACT');
  assert.equal(recipeEligibility(m,s,m.indexes.recipes['hack-security-terminal']).blocker,'INVALID_TARGET_STATE');
  startWork(m,s,'recover-terminal-wreckage',unit.unitId);advanceTime(m,s,180);
  assert.equal(s.instanceStates['security-terminal-01'].securedForExtraction,true);assert.equal(s.instanceStates['security-terminal-01'].custody,'LOCAL');assert.equal(s.instanceStates['security-terminal-01'].condition,'WRECKAGE');
});

test('restraint accepts the unified Down state after either defeat or surrender',()=>{
  const unit=read('party-presets').units[0];unit.tools=[createTool(unit,0,'SOT1',3,m.toolCatalog)];
  const s=createRuntime(m,[unit],'2026-09-25T12:00Z');chooseGate(m,s,true);place(s,'stage-overseer-office');s.instanceStates['mcguffin-01'].combatState='DOWN';
  s.instanceStates['mcguffin-01'].combatState='DOWN';refreshCampaign(m,s);
  assert.equal(recipeEligibility(m,s,m.indexes.recipes['restrain-mcguffin']).status,'AVAILABLE');
  startWork(m,s,'restrain-mcguffin',unit.unitId);advanceTime(m,s,180);
  assert.equal(s.instanceStates['mcguffin-01'].combatState,'CAPTURED');
});

test('Soldier intimidation and Diplomat negotiation are separate choices beside Engage',()=>{
  const units=read('party-presets').units.filter(u=>['SOLDIER','DIPLOMAT'].includes(u.profession));units.forEach(u=>u.tier=2);
  const s=createRuntime(m,units,'2026-09-25T12:00Z');chooseGate(m,s,true);place(s,'stage-security-hall');
  const html=renderMap(m,s);assert.match(html,/data-engage="incident-security-guards"/);assert.match(html,/data-recipe="negotiate-reynolds"/);assert.match(html,/data-recipe="intimidate-reynolds"/);
  const recipe=m.indexes.recipes['intimidate-reynolds'];assert.equal(recipeEligibility(m,s,recipe,units.find(u=>u.profession==='DIPLOMAT').unitId).status,'BLOCKED');
  const w=startWork(m,s,recipe.recipeInstanceId,units.find(u=>u.profession==='SOLDIER').unitId);advanceTime(m,s,180);
  assert.equal(s.instanceStates['reynolds-01'].combatState,'SURRENDERED');assert.equal(s.incidentStates['incident-security-guards'].state,'RESOLVED');
  assert(outcomeLines(m,w).some(line=>line.includes('demand for surrender')));assert(!renderMap(m,s).includes('data-engage="incident-security-guards"'));
});
test('questioning reports its interview result and authored terminal code',()=>{
  const unit=read('party-presets').units.find(u=>u.profession==='DIPLOMAT');const s=createRuntime(m,[unit],'2026-09-25T12:00Z');chooseGate(m,s,true);place(s,'stage-outer-yard');
  for(const id of ['guard-yard-01','guard-yard-02']){s.instanceStates[id].npcState.disposition='ROUTINE';s.instanceStates[id].combatState='NEUTRAL';}
  place(s,'stage-overseer-office');s.instanceStates['mcguffin-01'].combatState='NEUTRAL';s.instanceStates['mcguffin-01'].npcState.disposition='ROUTINE';const w=startWork(m,s,'question-mcguffin',unit.unitId);advanceTime(m,s,180);
  assert.equal(w.status,'COMPLETED');assert(s.knowledgeState.gained.includes('security-terminal-code-known'));assert(outcomeLines(m,w).some(line=>line.includes('terminal access code')));
  assert(w.outcome.changes.some(e=>e.type==='INSTANCE_CHANGED'&&e.field==='interviewed'&&e.value===true));
  const saved=JSON.stringify(w.outcome);advanceTime(m,s,60);assert.equal(JSON.stringify(w.outcome),saved);
});

test('terminal choices present destruction once and hacking rules out subsequent destruction',async()=>{
 const {recipeChoices}=await import('../shared/offworld/field.mjs');const unit=read('party-presets').units.find(u=>u.profession==='TECHNICIAN');unit.tier=2;unit.perception=9;unit.tools=[createTool(unit,0,'TET2',3,m.toolCatalog)];
 const s=createRuntime(m,[unit],'2026-09-25T12:00Z');chooseGate(m,s,true);place(s,'stage-overseer-office');s.instanceStates['mcguffin-01'].combatState='DOWN';
 const choices=recipeChoices(m,s,m.recipes.filter(r=>r.targetId==='target-security-terminal-01'));assert.equal(choices.filter(r=>r.actionType==='DESTROY').length,1);
 startWork(m,s,'hack-security-terminal',unit.unitId);advanceTime(m,s,180);assert.equal(s.instanceStates['security-terminal-01'].locked,false);
 for(const id of ['destroy-security-terminal-tech','destroy-security-terminal-soldier'])assert.equal(recipeEligibility(m,s,m.indexes.recipes[id]).blocker,'INVALID_TARGET_STATE');
});
