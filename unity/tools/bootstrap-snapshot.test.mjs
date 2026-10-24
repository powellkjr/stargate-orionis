import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOM_CATEGORY_ORDER} from '../../demos/shared/js/rooms.js';
import {buildSnapshot} from './bootstrap-snapshot.mjs';
import {deploymentRoster} from '../../demos/shared/offworld/roster.mjs';

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
  assert.deepEqual(mission.tools.map(tool=>({kitId:tool.kitId,charges:tool.charges})),
   original.toolSlots.filter(tool=>tool.kitId).map(tool=>({kitId:tool.kitId,charges:tool.charges})));
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
