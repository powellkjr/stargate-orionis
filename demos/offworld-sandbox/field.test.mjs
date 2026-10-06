import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission,clone} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,move,advanceTime,extract} from '../shared/offworld/runtime.mjs';
import {createTool,toolOptions,validateEquipment,professionTier} from '../shared/offworld/equipment.mjs';
import {activeWork,recipeEligibility,startWork,cancelWork,stationUnit,observationEligibility,refreshField} from '../shared/offworld/field.mjs';
const read=n=>{const data=JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));return n.endsWith('archetypes')?{...data,itemDefinitions:JSON.parse(readFileSync(new URL('../shared/data/item.json',import.meta.url)))}:data;};
const raw={...read('missing-operative-001.finalized'),dialogueScenes:[]},catalog=read('archetypes'),presets=read('party-presets').units,m=compileMission({...raw,transitions:raw.transitions.map(t=>t.transitionId==='door-mainhall-to-security'?{...t,overrides:{...t.overrides,initialState:'LOCKED',routine:false}}:t)},catalog);
function unit(role,kit,tier=2){const u=clone(presets.find(u=>u.profession===role));u.tier=tier;u.tools=kit?[createTool(u,0,kit,3,catalog)]:[];return u;}
function fresh(units=[unit('TECHNICIAN','TET2'),unit('MEDIC','MET2'),unit('SCOUT','STT2'),unit('SCIENTIST','SCT2')],mission=m){const s=createRuntime(mission,units,'2026-09-24T14:00:00Z');chooseGate(mission,s,true);return s;}
function hall(s,mission=m){move(mission,s,'door-gate-to-yard');move(mission,s,'door-yard-to-mainhall');}
const eligible=(s,id,mission=m)=>recipeEligibility(mission,s,mission.indexes.recipes[id]);
function portableFixture(effects){
  const r=clone(raw),asset=r.instances.find(i=>i.instanceId==='mining-system-01');
  asset.recovery={category:'PARTY_STORAGE_WHEN_COLLECTED'};
  r.recipes.find(r=>r.recipeInstanceId==='inspect-mining-system').overrides.effects=effects??[{type:'ADD_TO_PARTY_STORAGE',instanceId:asset.instanceId}];
  const mission=compileMission(r,catalog),s=fresh(undefined,mission);hall(s,mission);move(mission,s,'door-mainhall-to-processing');
  return {r,mission,s};
}
test('portable collection preserves instance state and identity through movement and extraction',()=>{
  const {mission,s}=portableFixture(),before=clone(s.instanceStates['mining-system-01']);
  const w=startWork(mission,s,'inspect-mining-system');advanceTime(mission,s,180);
  assert.equal(w.status,'COMPLETED');assert.deepEqual(s.partyStorage,['mining-system-01']);
  assert.deepEqual(s.instanceStates['mining-system-01'],{...before,custody:'PARTY_STORAGE'});
  assert.equal(eligible(s,'inspect-mining-system',mission).status,'HIDDEN');
  for(const id of ['door-mainhall-to-processing','door-yard-to-mainhall','door-gate-to-yard'])move(mission,s,id);
  assert.equal(s.instanceStates['mining-system-01'].custody,'PARTY_STORAGE');extract(mission,s);
  assert.equal(s.instanceStates['mining-system-01'].custody,'RECOVERED_TO_SGC');
  assert.equal(s.resultEvents.filter(e=>e.type==='ASSET_RECOVERED'&&e.instanceId==='mining-system-01').length,1);
  assert.equal(s.instanceStates['supply-cache-01'].custody,'LOCAL');
});
test('duplicate collection rolls back inventory, custody, ledger and charges',()=>{
  const effect={type:'ADD_TO_PARTY_STORAGE',instanceId:'mining-system-01'}, {mission,s}=portableFixture([effect,effect]);
  const before=clone(s.instanceStates['mining-system-01']),w=startWork(mission,s,'inspect-mining-system');advanceTime(mission,s,180);
  assert.equal(w.status,'FAILED');assert.deepEqual(s.partyStorage,[]);assert.deepEqual(s.instanceStates['mining-system-01'],before);
  assert.equal(s.units[0].tools[0].chargesRemaining,3);assert(!s.resultEvents.some(e=>e.type==='ASSET_COLLECTED'));
});
test('collection rejects unauthored portability and remote assets; extraction validates storage before mutation',()=>{
  const r=clone(raw);r.recipes.find(r=>r.recipeInstanceId==='inspect-mining-system').overrides.effects=[{type:'ADD_TO_PARTY_STORAGE',instanceId:'mining-system-01'}];
  assert.throws(()=>compileMission(r,catalog),/authored portable recovery category/);
  const fixture=portableFixture();fixture.r.instances.find(i=>i.instanceId==='operative-01').recovery={category:'PARTY_STORAGE'};
  fixture.r.recipes.find(r=>r.recipeInstanceId==='inspect-mining-system').overrides.effects=[{type:'ADD_TO_PARTY_STORAGE',instanceId:'operative-01'}];
  const mission=compileMission(fixture.r,catalog),s=fresh(undefined,mission);hall(s,mission);move(mission,s,'door-mainhall-to-processing');
  const w=startWork(mission,s,'inspect-mining-system');advanceTime(mission,s,180);assert.equal(w.status,'FAILED');assert.deepEqual(s.partyStorage,[]);
  const atGate=fresh();atGate.partyStorage.push('missing');const before=clone(atGate);assert.throws(()=>extract(m,atGate),/storage custody/);assert.deepEqual(atGate,before);
});
test('authored detection and recovery effects change state without changing custody or moving assets',()=>{
  const r=clone(raw),recipe=r.recipes.find(r=>r.recipeInstanceId==='inspect-mining-system');
  recipe.overrides.effects=[{type:'SET_DETECTION_STATE',instanceId:'supply-cache-01',value:'LOCATED'},{type:'SET_RECOVERY_STATE',instanceId:'supply-cache-01',value:'SECURED'}];
  const mission=compileMission(r,catalog),s=fresh(undefined,mission);hall(s,mission);move(mission,s,'door-mainhall-to-processing');
  const before=clone(s.instanceStates['supply-cache-01']),w=startWork(mission,s,recipe.recipeInstanceId);
  advanceTime(mission,s,180);assert.equal(w.status,'COMPLETED');
  assert.deepEqual(s.instanceStates['supply-cache-01'],{...before,detectionState:'LOCATED',recoveryState:'SECURED'});
  assert.equal(s.carriedAssets.includes('supply-cache-01'),false);
  assert(w.outcome.changes.some(e=>e.field==='recoveryState'&&e.instanceId==='supply-cache-01'));
});
test('field state effects reject invalid states and roll back prior mutations if the instance disappears',()=>{
  for(const type of ['SET_DETECTION_STATE','SET_RECOVERY_STATE']){
    for(const value of ['invented',null,7]){
      const r=clone(raw);r.recipes.find(r=>r.recipeInstanceId==='inspect-mining-system').overrides.effects=[{type,instanceId:'supply-cache-01',value}];
      assert.throws(()=>compileMission(r,catalog),new RegExp(`invalid ${type}`));
    }
    const r=clone(raw),recipe=r.recipes.find(r=>r.recipeInstanceId==='inspect-mining-system');
    recipe.overrides.effects=[{type:'SET_TARGET_STATE',field:'inspected',value:true},{type,instanceId:'supply-cache-01',value:type==='SET_DETECTION_STATE'?'LOCATED':'SECURED'}];
    const mission=compileMission(r,catalog),s=fresh(undefined,mission);hall(s,mission);move(mission,s,'door-mainhall-to-processing');
    const w=startWork(mission,s,recipe.recipeInstanceId);delete s.instanceStates['supply-cache-01'];advanceTime(mission,s,180);
    assert.equal(w.status,'FAILED');assert.equal(s.instanceStates['mining-system-01'].inspected,undefined);assert.equal(s.units[0].tools[0].chargesRemaining,3);
  }
});
test('exactly two slots follow base/branch tiers, and either unlocked slot can use either track',()=>{
  const u=unit('TECHNICIAN','TET2',3);assert.throws(()=>createTool(u,1,'TET1',2,catalog),/eligible/);
  u.branch={kind:'cross',id:'MEDIC',tier:1};u.tools=[createTool(u,0,'MET1',2,catalog),createTool(u,1,'TET2',2,catalog)];validateEquipment(u,catalog);
  assert.equal(professionTier(u,'MEDIC'),1);assert(!toolOptions(u).some(t=>t.id==='MET2'));
  u.tools.push(clone(u.tools[0]));assert.throws(()=>validateEquipment(u,catalog),/two/);
});
test('T0 branches unlock a base-tool second slot without trained branch competency',()=>{
  const u=unit('TECHNICIAN','TET2',3);u.branch={kind:'cross',id:'MEDIC',tier:0};assert.equal(professionTier(u,'MEDIC'),0);assert.throws(()=>createTool(u,1,'MET1',3,catalog));
  u.tools.push(createTool(u,1,'TET1',3,catalog));validateEquipment(u,catalog);u.tools.pop();
  u.branch={kind:'specialization',id:'Overdrive',tier:0};u.tools.push(createTool(u,1,'TET1',3,catalog));validateEquipment(u,catalog);assert.throws(()=>createTool(u,1,'OVT1',3,catalog));u.tools.pop();
  u.branch={kind:'specialization',id:'Overdrive',tier:1};u.tools.push(createTool(u,1,'OVT1',3,catalog));validateEquipment(u,catalog);assert.deepEqual(u.tools[1].providedServices,[]);assert.equal(professionTier(u,'SCIENTIST'),0);
});
test('rejects fabricated Tool capabilities and above-tier kits',()=>{
  const u=unit('TECHNICIAN','TET2');assert.throws(()=>createTool(u,0,'TET3',3,catalog));u.tools[0].providedServices.push('ALIEN_PHYSICS');assert.throws(()=>validateEquipment(u,catalog),/authored/);
});
test('observations use competency, perception, and actual equipment without revealing hidden Reality',()=>{
  const s=fresh();hall(s);assert(s.knowledgeState.gained.includes('operative-signal-west'));assert(s.knowledgeState.gained.includes('multiple-ill-patients-present'));assert.equal(s.stageStates['stage-holding-area'].visibility,'HIDDEN');
  move(m,s,'door-mainhall-to-holding');assert.equal(s.instanceStates['operative-01'].detectionState,'LOCATED');assert.equal(s.observationStates['obs-holding-outbreak-pattern'].status,'HIDDEN');
  assert.equal(s.instanceStates['mining-system-01'].powerFeedIsolated,false);assert(!s.knowledgeState.gained.includes('advanced-mining-technology-confirmed'));
});
test('supporting clues do not implicitly become prerequisites',()=>{
  const s=fresh();hall(s);move(m,s,'door-mainhall-to-holding');s.units.find(u=>u.profession==='MEDIC').perception=8;refreshField(m,s);
  assert.equal(s.observationStates['obs-holding-outbreak-pattern'].status,'PRESENTED');
  const o={...m.indexes.observations['obs-holding-outbreak-pattern'],supportsObservationIds:['unseen-support']};assert(observationEligibility(m,s,o).eligible);
});
test('blocked vs hidden actions, Tool depletion, and minimum sufficient Tool selection',()=>{
  const u=unit('TECHNICIAN','TET3',3);u.branch={kind:'cross',id:'MEDIC',tier:1};u.tools.push(createTool(u,1,'TET2',1,catalog));
  const s=fresh([u]);hall(s);const r=m.indexes.recipes['hack-door-mainhall-to-security'];
  const e=recipeEligibility(m,s,r);assert.equal(e.status,'AVAILABLE');assert.equal(e.candidates[0].toolInstanceId,u.tools[1].toolInstanceId);
  s.units[0].tools.forEach(t=>t.chargesRemaining=0);assert.equal(eligible(s,r.recipeInstanceId).blocker,'TOOL_CHARGES_DEPLETED');
  assert.equal(recipeEligibility(m,s,{...r,hiddenUntilKnowledge:['unknown']}).status,'HIDDEN');
  assert.equal(recipeEligibility(m,s,{...r,requiresKnowledge:['unknown']}).blocker,'REQUIRED_KNOWLEDGE_MISSING');
});
test('work locks Actor and target, reserves charge, and commits exactly once',()=>{
  const s=fresh();hall(s);const w=startWork(m,s,'hack-door-mainhall-to-security');const actor=s.units.find(u=>u.unitId===w.actorId);
  assert.equal(actor.tools[0].chargesRemaining,3);assert.equal(eligible(s,w.recipeId).blocker,'TARGET_BUSY');assert.throws(()=>move(m,s,'door-mainhall-to-processing'),/WORK_IN_PROGRESS/);
  advanceTime(m,s,90);assert.equal(s.transitionStates['door-mainhall-to-security'].state,'LOCKED');advanceTime(m,s,90);
  assert.equal(w.status,'COMPLETED');assert.equal(s.transitionStates['door-mainhall-to-security'].state,'OPEN');assert.equal(actor.tools[0].chargesRemaining,2);
  advanceTime(m,s,180);assert.equal(actor.tools[0].chargesRemaining,2);
});
test('cancellation releases Actor and reservation without completing effects',()=>{
  const s=fresh();hall(s);const w=startWork(m,s,'hack-door-mainhall-to-security');advanceTime(m,s,30);cancelWork(s,w.workId);
  assert.equal(w.status,'CANCELLED');assert.equal(s.units[0].tools[0].chargesRemaining,3);assert.equal(s.transitionStates['door-mainhall-to-security'].state,'LOCKED');move(m,s,'door-mainhall-to-processing');
});
test('two independent Actors work concurrently on different targets against one clock',()=>{
  const a=unit('MEDIC','MET2'),b=unit('MEDIC','MET1');b.unitId='second-medic';b.tools=[createTool(b,0,'MET1',3,catalog)];
  const s=fresh([a,b]);hall(s);move(m,s,'door-mainhall-to-holding');s.instanceStates['guard-holding-01'].combatState='DOWN';const before=s.missionElapsedSeconds;
  startWork(m,s,'stabilize-patient-01',a.unitId);startWork(m,s,'stabilize-patient-02',b.unitId);assert.equal(activeWork(s).length,2);advanceTime(m,s,180);
  assert.equal(s.missionElapsedSeconds-before,180);assert.equal(s.instanceStates['patient-01'].condition,'STABILIZED');assert.equal(s.instanceStates['patient-02'].condition,'STABILIZED');assert.equal(s.stageStates[s.currentStageId].securityState,'UNSECURE');
});
test('failed commit rolls back effects and charge; another Actor cannot inherit work',()=>{
  const r=clone(raw),recipe=r.recipes.find(r=>r.recipeInstanceId==='inspect-mining-system');recipe.overrides.effects=[{type:'SET_TARGET_STATE',field:'inspected',value:true},{type:'SET_INSTANCE_STATE',instanceId:'supply-cache-01',field:'inspected',value:true}];
  const altered=compileMission(r,catalog),s=fresh(undefined,altered);hall(s,altered);move(altered,s,'door-mainhall-to-processing');const w=startWork(altered,s,recipe.recipeInstanceId);delete s.instanceStates['supply-cache-01'];advanceTime(altered,s,180);
  assert.equal(w.status,'FAILED');assert.equal(s.instanceStates['mining-system-01'].inspected,undefined);assert.equal(s.units[0].tools[0].chargesRemaining,3);
  const w2=startWork(m,s,'inspect-mining-system');s.units[0].activityState='DOWN';advanceTime(m,s,180);assert.equal(w2.status,'FAILED');assert.equal(s.units[0].activityState,'DOWN');
});
test('unknown or unsafe implemented effects fail validation before deployment',()=>{
  const r=clone(raw);r.recipes[0].overrides.effects=[{type:'UNSUPPORTED'}];assert.throws(()=>compileMission(r,catalog),/unsupported field effect/);
});
test('stationing is deliberate, local, secure, and never creates a second moving party',()=>{
  const s=fresh();const id=s.units[1].unitId;stationUnit(m,s,id);move(m,s,'door-gate-to-yard');assert.equal(s.units[1].currentStageId,m.gate.stageId);assert.equal(s.units[1].partyStatus,'STATIONED');assert.throws(()=>stationUnit(m,s,id),/local/);
  move(m,s,'door-gate-to-yard');assert.throws(()=>extract(m,s),/Recall/);stationUnit(m,s,id);assert.equal(s.units[1].partyStatus,'ACTIVE_PARTY');
  const one=fresh([unit('MEDIC','MET1')]);assert.throws(()=>stationUnit(m,one,one.units[0].unitId),/at least one/);
});
test('physical recovery preserves instance ID and changes custody at extraction',()=>{
  const s=fresh();hall(s);move(m,s,'door-mainhall-to-holding');s.instanceStates['guard-holding-01'].combatState='DOWN';s.instanceStates['radiation-source-01'].active=false;startWork(m,s,'extract-operative');advanceTime(m,s,180);assert.equal(s.instanceStates['operative-01'].custody,'AT_GATE');
  for(const id of ['door-mainhall-to-holding','door-yard-to-mainhall','door-gate-to-yard'])move(m,s,id);extract(m,s);assert.equal(s.instanceStates['operative-01'].custody,'RECOVERED_TO_SGC');assert.equal(s.instanceStates['operative-01'].partyStatus,'EXTRACTED');
});
