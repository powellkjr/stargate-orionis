import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {roomConstructionQuote} from './room-construction.mjs';
const read=file=>JSON.parse(readFileSync(new URL('../data/'+file,import.meta.url),'utf8'));
const policy=read('room-construction-prototype.json'),rooms=read('rooms_schema.json');
const quote=(id,tier=1,from=null)=>roomConstructionQuote(rooms.find(r=>r.identity.id===id),tier,policy,from);
test('construction charges every physical inventory place, staff slot and Core slot once',()=>{
 const receiving=quote('receiving');
 assert.equal(receiving.hours,48); // 2*6 + 2*6 + 40*.6; processing custody is not another inventory place.
 assert.equal(receiving.supply,48);
 assert.equal(receiving.supplyClass,'S1');
 assert.deepEqual(receiving.components.map(c=>c.places),[2,2,40,0,0]);
 assert.equal(quote('warehouse').hours,24);
 assert.equal(quote('equipment_storage').hours,24); // 20 Weapons + 20 Armor, plus 2 Core slots.
 assert.equal(quote('infirmary').hours,48); // 4 patient places, no duplicated root capacity.
 assert.equal(quote('ready_room').hours,24);
});
test('upgrades charge only added capacity, with the destination Supply tier',()=>{
 for(const [id,tier] of [['receiving',2],['receiving',3],['containment',2],['analysis',2]]){
  const upgrade=quote(id,tier,tier-1),from=quote(id,tier-1),to=quote(id,tier);
  assert.ok(Math.abs(upgrade.hours-(to.hours-from.hours))<1e-8);
  assert.equal(upgrade.supply,upgrade.hours);
  assert.equal(upgrade.supplyClass,'S'+tier);
 }
 assert.equal(quote('receiving',2,1).hours,36);
 assert.throws(()=>quote('receiving',3,1),/one authored/);
});
test('missing capacity authoring blocks a complete price rather than granting free construction',()=>{
 assert.equal(quote('gate_room').hours,36);
 const unknown=structuredClone(rooms.find(r=>r.identity.id==='gate_room'));delete unknown.function.slotConfig.core;
 assert.match(roomConstructionQuote(unknown,1,policy).blockedReason,/Core slot count/);
 assert.equal(quote('supply_storage').supply,24); // 4000 shared resource capacity counted once, plus 2 Core slots.
 assert.equal(quote('supply_storage',2,1).supply,24);
 for(const room of rooms){const ct1=quote(room.identity.id);assert.ok(ct1.hours>=24&&ct1.hours<=48,room.identity.id+' outside 24-48h');}
 const original=JSON.stringify(rooms);
 for(const room of rooms)for(const tier of room.rules.construction.progression)quote(room.identity.id,tier);
 assert.equal(JSON.stringify(rooms),original);
});
