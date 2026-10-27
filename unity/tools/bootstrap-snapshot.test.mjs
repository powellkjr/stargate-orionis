import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOM_CATEGORY_ORDER} from '../../demos/shared/js/rooms.js';
import {buildSnapshot} from './bootstrap-snapshot.mjs';
import {deploymentRoster} from '../../demos/shared/offworld/roster.mjs';

test('safe packages preserve authored physical identity in the shared cargo catalog',()=>{
 const snapshot=buildSnapshot();const mission=JSON.parse(readFileSync(new URL('../../demos/shared/data/offworld/missing-operative-001.finalized.json',import.meta.url),'utf8'));
 for(const id of ['safe-intel-01','safe-loot-01']){const cache=snapshot.missionCargo.additionalCaches.find(c=>c.containerId===id);assert.equal(cache.collection.stageId,'stage-hidden-safe');assert.equal(cache.collection.id,`collect-${id}`);assert.equal(cache.items.length,1);const original=mission.instances.find(i=>i.instanceId===id);assert.equal(cache.items[0].instance.instanceId,id);assert.equal(cache.items[0].item.id,original.itemId);assert.deepEqual(cache.items[0].physicalPayload.reality,original.physicalItem.reality);}
 assert.equal(snapshot.previousSafeCargo.additionalCaches.length,1);
});

test('Unity personnel use tier 3 bases and existing tier 3 branches across all projections',()=>{
 const read=path=>JSON.parse(readFileSync(new URL(`../../demos/shared/data/${path}`,import.meta.url),'utf8'));
 const authored=deploymentRoster(read('base-classes.json'),read('personnel-names.json'),
  read('offworld/party-presets.json'),read('personnel-loadouts.json')).units;
 const snapshot=buildSnapshot();
 assert.equal(snapshot.units.length,54);
 assert.equal(authored.filter(unit=>!unit.branch).length,6);
 assert.equal(authored.filter(unit=>unit.branch?.kind==='cross').length,30);
 assert.equal(authored.filter(unit=>unit.branch?.kind==='specialization').length,18);
 for(const original of authored){
  const summary=snapshot.units.find(unit=>unit.id===original.unitId);
  const receiving=snapshot.receiving.units.find(unit=>unit.id===original.unitId);
  const mission=snapshot.mission.personnel.find(unit=>unit.id===original.unitId);
  assert.equal(summary.tier,3);
  assert.equal(summary.branch,original.branch?`${original.branch.id} 3`:'');
  assert.equal(mission.tier,3);
  assert.deepEqual(mission.branch,original.branch?{...original.branch,tier:3}:null);
  assert.deepEqual(receiving.qualifications,{[original.profession]:3,
   ...(original.branch?.kind==='cross'?{[original.branch.id]:3}:{})});
  assert.equal(summary.name,original.name);
  assert.equal(summary.profession,original.profession);
  assert.deepEqual(mission.tools.map(tool=>({kitId:tool.kitId,charges:tool.charges,tier:tool.tier})),
   original.toolSlots.filter(tool=>tool.kitId).map(tool=>({kitId:tool.kitId.replace(/\d+$/,'3'),charges:9,tier:3})));
  for(const tool of mission.tools){
   assert.deepEqual(tool.services,read('offworld/archetypes.json').tools[tool.kitId].providedServices);
   assert.equal(tool.instanceId,`${original.unitId}-tool-${tool.slot+1}`);
  }
 }
});
test('base planning projects every shared room without inventing unsupported Core counts',()=>{
 const authored=JSON.parse(readFileSync(new URL('../../demos/shared/data/rooms_schema.json',import.meta.url),'utf8'));
 const snapshot=buildSnapshot(), catalog=snapshot.roomPlanning;
 assert.equal(catalog.rooms.length,authored.length);
 assert.deepEqual(catalog.categoryOrder,ROOM_CATEGORY_ORDER);
 assert.deepEqual([catalog.columns,catalog.rows],[12,10]);
 for(const room of authored){
  const plan=catalog.rooms.find(r=>r.id===room.identity.id);
  assert.equal(plan.purpose,room.function.base);
  assert.equal(plan.category,room.identity.category);
  assert.deepEqual(plan.joinLayouts,room.rules.joining.supportedLayouts??[]);
  assert.equal(plan.constructible,room.rules.construction.supportsConstruction);
  assert.deepEqual(plan.tiers.map(t=>t.tier),room.rules.construction.progression);
  assert.deepEqual(plan.services,room.function.roomServices??[]);
  assert.deepEqual(plan.capabilities,room.function.processingCapabilities??[]);
 }
 assert.deepEqual(catalog.resourceClasses,{materials:['M1','M2','M3'],supplies:['S1','S2','S3'],rations:['Rations']});
 assert.equal(catalog.rooms.find(r=>r.id==='ready_room').tiers[0].cores,'None');
 assert.equal(catalog.rooms.find(r=>r.id==='gate_room').tiers[0].cores,'2 per physical room');
 assert.equal(catalog.rooms.find(r=>r.id==='analysis').tiers[1].cores,'4 per physical room');
 assert.equal(catalog.rooms.find(r=>r.id==='tech_platform').tiers[0].cores,'focusSlots: 1, supportSlots: 1');
});

test('Medium cache projection retains the exact legacy graph and shared Core authoring',()=>{
 const snapshot=buildSnapshot();
 const old=JSON.parse(readFileSync(new URL('./fixtures/resource-processing-before-medium-cache.json',import.meta.url),'utf8'));
 assert.equal(snapshot.resourceProcessing.recipe.bubbles.length,10);
 assert.equal(old.recipe.bubbles.length,20);
 assert.deepEqual(snapshot.previousResourceProcessing,old);
 assert.equal(snapshot.resourceProcessing.instanceId,old.instanceId);
 assert.equal(snapshot.resourceProcessing.recipe.id,old.recipe.id);
 assert.deepEqual(snapshot.resourceProcessing.recipe.bubbles,old.recipe.bubbles.slice(0,10));
 assert.equal(snapshot.roomCoreSetup.runtimeStatus,'PROVISIONAL_EXECUTABLE');
 assert.equal(snapshot.roomCoreSetup.starterInstances.length,2);
 for(const core of snapshot.roomCoreSetup.starterInstances)assert.ok(snapshot.roomCoreSetup.items[core.coreDefinitionId]);
 assert.ok(snapshot.roomCoreSetup.recipes.some(r=>r.id===snapshot.roomCoreSetup.installationRecipeId));
});

test('base execution imports only authored Response and Group Tool capabilities',()=>{
 const snapshot=buildSnapshot(),execution=snapshot.baseExecution;
 const data=file=>JSON.parse(readFileSync(new URL('../../demos/shared/data/'+file,import.meta.url),'utf8'));
 assert.ok(data('rooms_schema.json').some(r=>r.identity.id===execution.responseRoomDefinitionId));
 assert.deepEqual(execution.actorOrder,['DESTINATION_STAFF','GROUP_STAFF','LOCAL_RESPONSE']);
 assert.deepEqual(execution.toolOrder,['EQUIPPED_PERSONAL','CONFIGURED_GROUP']);
 const theory=data('theory/stargate_theory_simulator_import.json');
 for(const provider of execution.groupToolProviders){const source=theory.theories.find(t=>t.id===provider.sourceTheoryId);assert.ok(source.capabilityEnvelope.roomServices.includes(provider.roomService));assert.ok(source.capabilityEnvelope.toolServices.includes(provider.toolService));assert.equal(provider.unlimited,true);}
});

test('offworld expansion preserves authored hidden-route gates and pinned legacy mission',()=>{
 const snapshot=buildSnapshot();const authored=JSON.parse(readFileSync(new URL('../../demos/shared/data/offworld/missing-operative-001.finalized.json',import.meta.url),'utf8'));
 assert.equal(snapshot.mission.travel.stages.length,authored.stages.length);assert.equal(snapshot.missionMap.stages.length,authored.stages.length);assert.equal(snapshot.mission.travel.transitions.length,authored.transitions.length);
 for(const source of authored.transitions.filter(t=>t.revealedWhen))assert.equal(snapshot.mission.travel.transitions.find(t=>t.id===source.transitionId).requiredKnowledge,source.revealedWhen.factId);
 assert.equal(snapshot.missionCombat.encounters.length,4);
 assert.deepEqual(snapshot.resourceProcessing.actions.map(a=>a.id),['inspect-mining-system','isolate-mining-power','collect-supply-cache']);
 for(const action of snapshot.mission.travel.field.actions.filter(a=>a.socialEffects&&!a.workGroupId)){assert.ok([1,20].includes(action.ticks));assert.ok(!action.label.includes('hidden'));assert.ok(action.outcomeText.length>0);}
 const pin=JSON.parse(readFileSync(new URL('./fixtures/mission-before-offworld-expansion.json',import.meta.url),'utf8'));assert.deepEqual(snapshot.previousOffworldMission,pin.mission);assert.deepEqual(snapshot.previousOffworldCombat,pin.combat);
});

test('lab work and door geometry project authored requirements without granting identity',()=>{
 const s=buildSnapshot(),f=s.mission.travel.field;
 const group=f.workflows.groups.find(g=>g.id==='search-analysis-lab');assert.equal(group.recipeIds.length,4);
 for(const id of group.recipeIds){const a=f.actions.find(a=>a.id===id);assert.equal(a.ticks,20);assert.equal(a.profession,'UNTRAINED');assert.equal(a.workGroupId,group.id);}
 const inspect=f.actions.find(a=>a.id==='characterize-lab-device');assert.deepEqual(inspect.hiddenUntilKnowledge,['lab-search-completed']);assert.ok(inspect.requiresKnowledge.includes('ELECTROMAGNETIC_ACCELERATION_I'));
 const detach=f.actions.find(a=>a.id==='detach-lab-device');assert.equal(detach.condition.value,'MOUNTED');assert.equal(detach.service,'TECH_SERVICE_II');assert.equal(detach.ticks,20);
 const cache=s.missionCargo.additionalCaches.find(c=>c.collection.id==='secure-lab-device');assert.equal(cache.items[0].instance.instanceId,'lab-mounted-rifle-01');assert.equal(cache.collection.condition.value,'DETACHED');
 assert.equal(s.previousLabCargo.additionalCaches.some(c=>c.collection.id==='secure-lab-device'),false);
 assert.equal(s.missionMap.doors.length,s.mission.travel.transitions.length);assert.equal(s.missionMap.doors.filter(d=>d.provisional).length,2);
});
