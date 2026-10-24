import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateRooms,canRoomsJoin} from '../shared/js/rooms.js';
import {roomSprites} from '../shared/sprites/room-sprite-requirements.mjs';
import {roomTilePrompts} from '../shared/sprites/room-tile-prompts.mjs';
import {validateBase} from '../shared/js/base-configuration.mjs';

const read=name=>JSON.parse(readFileSync(new URL(`../shared/data/${name}.json`,import.meta.url),'utf8'));

test('starting base includes separate material, supply, equipment and containment rooms',()=>{
 const source=read('rooms_schema'),catalog=validateRooms(source),base=validateBase(read('base-configuration'),source);
 for(const id of ['material_storage','supply_storage','equipment_storage','containment']){
  const room=base.rooms.find(r=>r.roomId===id),definition=catalog.find(r=>r.id===id);
  assert(room);assert.equal(room.width,definition.width);assert.equal(room.height,definition.height);assert.equal(room.constructionTier,1);
 }
 assert.equal(new Set(base.rooms.map(r=>`${r.col},${r.row}`)).size,base.rooms.length);
 assert.equal(catalog.find(r=>r.id==='containment').schema.function.subordinateTabs.find(t=>t.id==='cc_storage').slotConfig.item.progressionSource,'inventory');
});

test('Ready Room progresses from four to six members without cores, joining or stacking',()=>{
 const source=read('rooms_schema'),catalog=validateRooms(source),room=catalog.find(r=>r.id==='ready_room'),response=catalog.find(r=>r.id==='response_room');
 assert.equal(room.width,response.width);assert.equal(room.height,response.height);
 assert.deepEqual(room.staffingProgression,[4,5,6]);assert.equal(room.maxConstructionTier,3);assert.equal(room.supportsConstructionTierProgression,true);
 assert.equal(room.schema.rules.cores.supportsCores,false);assert.equal(canRoomsJoin(room,room),false);
 assert.deepEqual(room.schema.function.team,{memberSlots:4,teamsPerPhysicalRoom:1,supportsStacking:false,memberSlotsByConstructionTier:[4,5,6],deploymentLimit:4,experienceSharing:"ALL_ASSIGNED_MEMBERS_EQUAL"});
 assert.equal(room.schema.rules.storage.supportsStorage,false);assert.equal(room.schema.rules.inventory.supportsInventory,false);
 assert.equal(room.schema.function.roomServices,undefined);
 const base=read('base-configuration');assert.equal(validateBase(base,source).rooms.find(r=>r.instanceId==='r6').roomId,'ready_room');
 const stacked=structuredClone(base);stacked.rooms.find(r=>r.instanceId==='r6').constructionTier=2;
 assert.equal(validateBase(stacked,source).rooms.find(r=>r.instanceId==="r6").constructionTier,2);
 const overlap=structuredClone(base);overlap.rooms.find(r=>r.instanceId==='r6').col=7;
 assert.throws(()=>validateBase(overlap,source),/overlap/i);
 for(const change of [r=>r.function.team.memberSlots=5,r=>r.rules.cores.supportsCores=true,r=>r.rules.joining.supportsJoining=true,r=>r.function.team.supportsStacking=true]){
  const invalid=structuredClone(room.schema);change(invalid);assert.throws(()=>validateRooms([invalid]),/team.*(rooms|capacity)/i);
 }
});

test('Cultural Platform is a continuous 2x2 physical room with reviewed Tech Platform structure',()=>{
 const catalog=validateRooms(read('rooms_schema')),room=catalog.find(r=>r.id==='cultural_platform'),tech=catalog.find(r=>r.id==='tech_platform');
 assert.equal(room.width,2);assert.equal(room.height,2);assert.equal(room.renderMode,'continuous');
 assert.equal(room.staffed,false);assert.equal(room.joinGroup,null);
 assert.equal(room.maxConstructionTier,tech.maxConstructionTier);
 const {notes,...cores}=room.schema.rules.cores,{notes:techNotes,...techCores}=tech.schema.rules.cores;
 assert.deepEqual(cores,techCores);
 for(const key of ['queues','storage','specialization','inventory','capacity'])assert.equal(Object.values(room.schema.rules[key])[0],false);
 assert.deepEqual(roomSprites.cultural_platform.props,[]);
 const legacy=read('rooms').find(r=>r.id===room.id);
 assert.equal(legacy.renderMode,'continuous');assert.equal(legacy.width,2);assert.equal(legacy.height,2);
});

test('continuous rendering is a validated generic form property, not a room ID exception',()=>{
 const definition=structuredClone(read('rooms_schema')[0]);
 definition.identity.id='future_room';definition.form.renderMode='continuous';
 assert.equal(validateRooms([definition])[0].renderMode,'continuous');
 delete definition.form.renderMode;assert.equal(validateRooms([definition])[0].renderMode,'tiled');
 definition.form.renderMode='unknown';assert.throws(()=>validateRooms([definition]),/form.renderMode/);
});

test('Generator loads with Ration Storage structure but no inherited resource behavior',()=>{
 const catalog=validateRooms(read('rooms_schema'));
 const generator=catalog.find(room=>room.id==='generator'),ration=catalog.find(room=>room.id==='ration_storage');
 assert(generator);
 assert.equal(generator.name,'Generator');
 assert.equal(generator.category,'Operations');
 assert.equal(generator.width,ration.width);assert.equal(generator.height,ration.height);
 assert.equal(generator.staffed,false);
 assert.equal(generator.maxConstructionTier,3);
 assert.equal(generator.supportsConstructionTierProgression,true);
 assert(canRoomsJoin(generator,generator));assert(!canRoomsJoin(generator,ration));
 const rules=generator.schema.rules;
 assert.deepEqual(rules.joining.supportedLayouts,ration.schema.rules.joining.supportedLayouts);
 assert.deepEqual(rules.construction.progression,ration.schema.rules.construction.progression);
 assert.deepEqual(rules.cores.slotProgression,[2]);assert.equal(rules.cores.supportsProgression,false);
 for(const key of ['storage','inventory','queues','capacity'])assert.equal(rules[key][`supports${key[0].toUpperCase()+key.slice(1)}`],false);
 assert.deepEqual(generator.schema.function.subordinateTabs,[]);
 assert(!JSON.stringify(generator.schema).includes('ration_cargo'));
 assert.equal(ration.schema.rules.storage.supportsStorage,true);
 assert.deepEqual(roomSprites.generator,{floor:'floor-indoor',props:['generator']});
 assert(roomTilePrompts.some(prompt=>prompt.key==='floor-room-generator'));
});

test('legacy and active room catalogs retain matching identities and Generator structure',()=>{
 const nested=validateRooms(read('rooms_schema')),legacy=read('rooms');
 assert.deepEqual(legacy.map(room=>room.id),nested.map(room=>room.id));
 const generator=legacy.find(room=>room.id==='generator');
 assert.equal(generator.coreSlots,2);assert.equal(generator.joinGroup,'generator');
 assert.equal(generator.staffed,false);assert.equal(generator.maxConstructionTier,3);
 assert.equal(generator.inventoryType,undefined);assert.equal(generator.cargoHandled,undefined);
});

test('Warehouse provides provisional safe temporary holding without staffing, Cores, joining or stacking',()=>{
 const source=read('rooms_schema'),room=validateRooms(source).find(r=>r.id==='warehouse');
 assert.equal(room.name,'Warehouse');assert.equal(room.width,1);assert.equal(room.height,1);
 assert.equal(room.staffed,false);assert.equal(room.joinGroup,null);assert.equal(room.maxConstructionTier,1);
 assert.equal(room.schema.rules.cores.supportsCores,false);assert.deepEqual(room.schema.rules.storage.progression,[20]);
 assert.equal(room.schema.rules.inventory.supportsInventory,false);
 assert.equal(validateBase(read('base-configuration'),source).rooms.find(r=>r.instanceId==='r11').roomId,'warehouse');
});
