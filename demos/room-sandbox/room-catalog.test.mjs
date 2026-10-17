import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateRooms,canRoomsJoin} from '../shared/js/rooms.js';
import {roomSprites} from '../shared/sprites/room-sprite-requirements.mjs';
import {roomTilePrompts} from '../shared/sprites/room-tile-prompts.mjs';

const read=name=>JSON.parse(readFileSync(new URL(`../shared/data/${name}.json`,import.meta.url),'utf8'));

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