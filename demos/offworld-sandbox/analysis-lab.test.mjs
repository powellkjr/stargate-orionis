import {withOpenRoomAccess} from './test-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,move,advanceTime,extract,redial} from '../shared/offworld/runtime.mjs';
import {startWork,recipeEligibility,startWorkGroup,cancelWork,workGroupEligibility} from '../shared/offworld/field.mjs';
import {createTool} from '../shared/offworld/equipment.mjs';
import {lootEntries,debriefOptions,finalizeDebrief} from '../shared/offworld/recovery.mjs';
import {missionResults} from '../shared/offworld/campaign.mjs';
import {renderMap} from './map.mjs';
import {reserveRecovery} from '../shared/js/base-configuration.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
const raw=read('offworld/missing-operative-001.finalized');
const catalog={...read('offworld/archetypes'),itemDefinitions:read('item')};
const m=compileMission({...withOpenRoomAccess(raw),dialogueScenes:[]},catalog),id='lab-mounted-rifle-01';
function fresh(search=true){
 const units=read('offworld/party-presets').units.filter(u=>['SCIENTIST','TECHNICIAN','SOLDIER'].includes(u.profession));
 for(const u of units){u.tier=2;u.tools=[createTool(u,0,{SCIENTIST:'SCT2',TECHNICIAN:'TET2',SOLDIER:'SOT2'}[u.profession],3,catalog)];}
 const s=createRuntime(m,units,'2026-09-25T12:00Z');chooseGate(m,s,true);s.instanceStates['radiation-source-01'].active=false;s.incidentStates['incident-processing-radiation'].state='RESOLVED';for(const id of ['guard-yard-01','guard-yard-02'])s.instanceStates[id].combatState='SURRENDERED';
 for(const edge of ['door-gate-to-yard','door-yard-to-mainhall','door-mainhall-to-processing','door-processing-to-lab'])move(m,s,edge);
 if(search){startWorkGroup(m,s,'search-analysis-lab');advanceTime(m,s,3600);assert.equal(s.workGroups['search-analysis-lab'].status,'COMPLETED');}
 return s;
}
function complete(s,recipe){const w=startWork(m,s,recipe);advanceTime(m,s,w.durationSeconds);assert.equal(w.status,'COMPLETED');return w;}
test('Lab is a real adjacent Stage; mounted item stays unidentified and unrecoverable on entry',()=>{
 const s=fresh(),item=s.instanceStates[id].physicalItem;
 assert.equal(s.currentStageId,'stage-analysis-lab');assert.equal(item.instanceId,id);assert.equal(item.itemId,'ASGARD_EM_RIFLE');assert.equal(item.state.constructionState,'COMPLETE');assert.equal(item.state.mountState,'MOUNTED');
 assert.equal(item.knowledge.recognizedIdentity,null);assert.equal(item.knowledge.recognizedCivilization,null);assert.deepEqual(item.knowledge.instanceFindings,[]);
 assert.equal(lootEntries(m,s).find(e=>e.instanceId===id).status,'Blocked');assert.equal(debriefOptions(m,s).loot.find(e=>e.instanceId===id).eligible,false);assert.deepEqual(s.partyStorage,[]);
 assert(!renderMap(m,s).includes('Asgard'));assert(!s.knowledgeState.gained.includes('ELECTROMAGNETIC_ACCELERATION_II'));
 assert.equal(recipeEligibility(m,s,m.indexes.recipes['detach-lab-device']).blocker,'REQUIRED_KNOWLEDGE_MISSING');
});
test('Scientist characterization requires principles and its own Actor and Tool, then produces evidence',()=>{
 const s=fresh(),r=m.indexes.recipes['characterize-lab-device'],tech=s.units.find(u=>u.profession==='TECHNICIAN');
 assert.equal(recipeEligibility(m,s,r,tech.unitId).blocker,'NO_VALID_ACTOR');
 s.knowledgeState.starting=s.knowledgeState.starting.filter(f=>f!=='PULSED_POWER_I');assert.equal(recipeEligibility(m,s,r).blocker,'REQUIRED_KNOWLEDGE_MISSING');s.knowledgeState.starting.push('PULSED_POWER_I');
 const scientist=s.units.find(u=>u.profession==='SCIENTIST'),before=scientist.tools[0].chargesRemaining;
 complete(s,'characterize-lab-device');assert.equal(scientist.tools[0].chargesRemaining,before-1);
 const item=s.instanceStates[id].physicalItem;assert.equal(item.state.mountState,'MOUNTED');assert.equal(item.knowledge.recognizedIdentity,null);assert.deepEqual(item.knowledge.instanceFindings,['LAB_DEVICE_PULSE_CHARACTERIZED']);
 assert(s.discoveries.some(d=>d.discoveryId==='discovery-lab-device-behavior'&&d.sourceInstanceIds.includes(id)));
 assert(s.knowledgeState.gained.includes('lab-device-tactical-role-known'));assert(!s.knowledgeState.gained.some(f=>f==='ELECTROMAGNETIC_ACCELERATION_II'||f.includes('ASGARD')));
 assert.equal(debriefOptions(m,s).loot.find(e=>e.instanceId===id).eligible,false);
});
test('Technician detaches the same item; exact instance and findings survive Receiving reservation',()=>{
 const s=fresh();complete(s,'characterize-lab-device');const scientist=s.units.find(u=>u.profession==='SCIENTIST');
 assert.equal(recipeEligibility(m,s,m.indexes.recipes['detach-lab-device'],scientist.unitId).blocker,'NO_VALID_ACTOR');
 const reality=structuredClone(s.instanceStates[id].physicalItem.reality);complete(s,'detach-lab-device');
 assert.equal(s.instanceStates[id].physicalItem.state.mountState,'DETACHED');assert.equal(s.instanceStates[id].custody,'LOCAL');assert.equal(s.instanceStates[id].recoveryState,'ELIGIBLE_FOR_EVAC');assert.deepEqual(s.partyStorage,[]);
 assert.equal(debriefOptions(m,s).loot.find(e=>e.instanceId===id).eligible,true);complete(s,'secure-lab-device');
 for(const edge of ['door-processing-to-lab','door-mainhall-to-processing','door-yard-to-mainhall','door-gate-to-yard'])move(m,s,edge);
 if(s.gateState.connection==='CLOSED')redial(m,s);extract(m,s);const plan=finalizeDebrief(m,s,{receivingIds:[id]});
 const request=plan.requests[0],item=request.physicalItem;assert.equal(request.instanceId,id);assert.equal(item.instanceId,id);assert.equal(item.itemId,'ASGARD_EM_RIFLE');assert.equal(request.cost,catalog.itemDefinitions.ASGARD_EM_RIFLE.storage.handlingCost);
 assert.equal(item.state.mountState,'DETACHED');assert.deepEqual(item.reality,reality);assert.deepEqual(item.knowledge.instanceFindings,['LAB_DEVICE_PULSE_CHARACTERIZED']);assert.equal(item.knowledge.recognizedIdentity,null);assert.equal(item.custody.storageId,'INCOMING_INVENTORY');
 const base=read('base-configuration');base.reservations=[];const reserved=reserveRecovery(base,read('rooms_schema'),plan.requests,'lab-test');assert.equal(reserved.reservations[0].physicalItem.instanceId,id);
 assert.equal(missionResults(m,s).recoveredAssets.filter(a=>a.instanceId===id).length,1);assert.equal(s.instanceStates[id].recoveryState,'RECOVERED');assert.throws(()=>finalizeDebrief(m,s,{receivingIds:[id]}),/already/);
});
test('failed characterization rolls back findings, Knowledge, Discovery and Tool charges',()=>{
 const s=fresh(),scientist=s.units.find(u=>u.profession==='SCIENTIST'),before=scientist.tools[0].chargesRemaining;
 const w=startWork(m,s,'characterize-lab-device');s.instanceStates[id].physicalItem.knowledge.instanceFindings=null;advanceTime(m,s,w.durationSeconds);
 assert.equal(w.status,'FAILED');assert.equal(scientist.tools[0].chargesRemaining,before);assert(!s.knowledgeState.gained.includes('lab-device-characterized'));assert(!s.discoveries.some(d=>d.discoveryId==='discovery-lab-device-behavior'));assert.equal(s.instanceStates[id].physicalItem.state.mountState,'MOUNTED');
});
test('unprepared or unselected mounted items remain at the site',()=>{
 const s=fresh();s.status='EXTRACTED';assert.throws(()=>finalizeDebrief(m,s,{receivingIds:[id]}),/Invalid debrief selection/);assert.equal(s.instanceStates[id].custody,'LOCAL');
 finalizeDebrief(m,s,{});assert.equal(s.instanceStates[id].custody,'LOCAL');assert.equal(s.instanceStates[id].physicalItem.state.mountState,'MOUNTED');
});
test('recovery rejects a changed item identity without committing custody or requests',()=>{
 const s=fresh();complete(s,'characterize-lab-device');complete(s,'detach-lab-device');s.status='EXTRACTED';s.instanceStates[id].physicalItem.instanceId='replacement-copy';
 const before=structuredClone(s);assert.throws(()=>finalizeDebrief(m,s,{receivingIds:[id]}),/Invalid recovery item state or identity/);assert.deepEqual(s,before);
});
test('an invalid item identity or quantity cannot commit a physical transition',()=>{
 for(const field of ['identity','quantity']){
  const input=structuredClone(raw);input.dialogueScenes=[];
  const r=input.recipes.find(r=>r.recipeInstanceId==='characterize-lab-device');
  if(field==='identity')r.overrides.effects.push({type:'SET_TARGET_STATE',field:'physicalItem',value:{instanceId:'advanced-component-01',itemId:'ASGARD_EM_RIFLE',state:{quantity:1},reality:{},knowledge:{instanceFindings:[]}}});
  else r.overrides.effects.push({type:'SET_ITEM_STATE',instanceId:id,field:'quantity',value:0});
  const definition=compileMission(input,catalog),s=fresh(),original=structuredClone(s.instanceStates[id].physicalItem),charges=s.units.find(u=>u.profession==='SCIENTIST').tools[0].chargesRemaining;
  const w=startWork(definition,s,'characterize-lab-device');advanceTime(definition,s,w.durationSeconds);
  assert.equal(w.status,'FAILED');assert.deepEqual(s.instanceStates[id].physicalItem,original);assert.equal(s.units.find(u=>u.profession==='SCIENTIST').tools[0].chargesRemaining,charges);assert(!s.knowledgeState.gained.includes('lab-device-characterized'));
 }
});
test('shared item compiler rejects missing definitions, identity mismatches and invalid quantities',()=>{
 const source=structuredClone(raw),snapshot=JSON.stringify(source);compileMission(source,catalog);assert.equal(JSON.stringify(source),snapshot);
 assert.throws(()=>compileMission(source,read('offworld/archetypes')),/shared item definition/);
 for(const change of [i=>i.itemId='UNKNOWN_ITEM',i=>i.physicalItem.instanceId='other-instance',i=>i.physicalItem.state.quantity=0,i=>i.physicalItem.knowledge.instanceFindings=null]){
  const candidate=structuredClone(source);change(candidate.instances.find(i=>i.instanceId===id));assert.throws(()=>compileMission(candidate,catalog),/MISSION VALIDATION ERROR/);
 }
 const bad=structuredClone(source);bad.recipes.find(r=>r.recipeInstanceId==='detach-lab-device').overrides.effects[0].field='__proto__';assert.throws(()=>compileMission(bad,catalog),/invalid physical item effect/);
});

test('the whole local party searches separate stations for one hour before revealing the device',()=>{
 const s=fresh(false),before=s.missionElapsedSeconds;
 assert(!lootEntries(m,s).some(e=>e.instanceId===id));assert(!renderMap(m,s).includes('data-recipe="characterize-lab-device"'));
 assert.throws(()=>startWork(m,s,'search-lab-station-1'),/group search/);
 startWorkGroup(m,s,'search-analysis-lab');
 const jobs=s.activeWork.filter(w=>w.status==='MOVING_TO_TARGET');assert.equal(jobs.length,s.units.length);assert.equal(new Set(jobs.map(w=>w.actorId)).size,s.units.length);assert.equal(new Set(jobs.map(w=>w.targetId)).size,s.units.length);
 assert(jobs.every(w=>w.durationSeconds===3600&&w.chargeCost===0));
 advanceTime(m,s,3599);assert(!s.knowledgeState.gained.includes('lab-search-completed'));assert(!renderMap(m,s).includes('data-recipe="characterize-lab-device"'));
 advanceTime(m,s,1);assert.equal(s.missionElapsedSeconds-before,3600);assert.equal(s.workGroups['search-analysis-lab'].status,'COMPLETED');assert(s.knowledgeState.gained.includes('lab-search-completed'));assert(renderMap(m,s).includes('data-recipe="characterize-lab-device"'));assert.equal(s.instanceStates[id].physicalItem.knowledge.recognizedIdentity,null);
 assert.equal(missionResults(m,s).workGroups['search-analysis-lab'].status,'COMPLETED');
});
test('group search admission is atomic and interrupted assignments retain their Actor identity',()=>{
 const s=fresh(false);s.units[0].activityState='EXECUTING';const before=structuredClone(s);
 assert.throws(()=>startWorkGroup(m,s,'search-analysis-lab'),/available/);assert.deepEqual(s,before);
 s.units[0].activityState='IDLE';startWorkGroup(m,s,'search-analysis-lab');const assigned=structuredClone(s.workGroups['search-analysis-lab'].assignments);
 for(const w of s.activeWork)cancelWork(s,w.workId);assert.equal(s.workGroups['search-analysis-lab'].status,'PARTIAL');
 s.units[0].partyStatus='STATIONED';s.units[0].currentStageId=m.gate.stageId;
 assert.equal(workGroupEligibility(m,s,'search-analysis-lab').status,'BLOCKED');assert(!s.knowledgeState.gained.includes('lab-search-completed'));
 s.units[0].partyStatus='ACTIVE_PARTY';s.units[0].currentStageId=s.currentStageId;startWorkGroup(m,s,'search-analysis-lab');assert.deepEqual(s.workGroups['search-analysis-lab'].assignments.map(a=>a.actorId),assigned.map(a=>a.actorId));
 advanceTime(m,s,3600);assert.equal(s.workGroups['search-analysis-lab'].status,'COMPLETED');
});

test('group definitions reject malformed outcomes and nonlocal or duplicate search jobs',()=>{
 for(const mutate of [r=>r.workGroups=[null],r=>r.workGroups[0].effects={},r=>r.workGroups[0].effects=[{type:'ADD_KNOWLEDGE',factId:''}],r=>r.workGroups[0].recipeInstanceIds.push(r.workGroups[0].recipeInstanceIds[0]),r=>r.workGroups[0].stageId='stage-main-hall',r=>r.recipes.find(r=>r.workGroupId).workGroupId='missing-group']){
  const input=structuredClone(raw);mutate(input);assert.throws(()=>compileMission(input,catalog),/MISSION VALIDATION ERROR/);
 }
});
