import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {roomSpriteSurface,roomInteriorKey,geologySprite,roomDoorSprite,staffCountSprite} from './sprite-presentation.mjs';
import {resetSpriteVariants,spriteRectangle} from '../offworld-sandbox/sprite-renderer.mjs';
import {spriteManifest} from '../offworld-sandbox/sprite-manifest.mjs';

test('room catalog uses mapped floors and props without modifying physical rooms or exposing new state',()=>{
 const rooms=JSON.parse(readFileSync(new URL('../shared/data/rooms_schema.json',import.meta.url),'utf8'));
 for(const definition of rooms){
  const room={roomId:definition.identity.id,instanceId:'r1',staffCount:3,constructionTier:2},before=JSON.stringify(room);
  const html=roomSpriteSurface(room,[{x:0,y:0}],{stroke:'#38bdf8',showInterior:false}),mapping=spriteManifest.roomTypes[room.roomId];
  assert(html.includes(`data-sprite="${mapping.floor}"`));assert(html.includes('stroke="#38bdf8"'));assert.equal(JSON.stringify(room),before);
  for(const prop of mapping.props.filter(p=>p!=='gate-open'))assert(html.includes(`data-sprite="${prop}"`));
  assert(!html.includes('data-sprite="gate-open"'));assert(!html.includes('data-sprite="worker"'),'staff counts are rendered separately');
 }
});

test('installed registered interiors replace props above separate floors and below physical walls',()=>{
 resetSpriteVariants('room-interiors');
 for(const roomId of Object.keys(spriteManifest.roomTypes)){
  const room={roomId,instanceId:`interior:${roomId}`,doorIndex:2},before=JSON.stringify(room);
  const html=roomSpriteSurface(room,[{x:0,y:0}]),key=roomInteriorKey(roomId),mapping=spriteManifest.roomTypes[roomId];
  if(key){
   assert.equal((html.match(new RegExp(`data-sprite="${key}"`,'g'))??[]).length,1);
   assert(html.indexOf(`data-sprite="${mapping.floor}"`)<html.indexOf(`data-sprite="${key}"`));
   assert(html.indexOf(`data-sprite="${key}"`)<html.indexOf('data-sprite="wall"'));
   for(const prop of mapping.props)assert(!html.includes(`data-sprite="${prop}"`),'Baked furnishings duplicated');
   const image=html.match(new RegExp(`<image[^>]*data-sprite="${key}"[^>]*>`))[0];
   assert(image.includes('x="8" y="8" width="64" height="64"'));
   assert(!image.includes('transform='));
   assert.equal(html,roomSpriteSurface(room,[{x:0,y:0}]));
  }else for(const prop of mapping.props.filter(p=>p!=='gate-open'))assert(html.includes(`data-sprite="${prop}"`));
  assert.equal(JSON.stringify(room),before);
 }
});

test('interior eligibility excludes missing/rejected variants and unauthored room IDs',()=>{
 const key='floor-room-analysis',variant={src:'registered.png'};
 assert.equal(roomInteriorKey('analysis',{}),null);
 assert.equal(roomInteriorKey('analysis',{[key]:{...variant,disabled:true}}),null);
 assert.equal(roomInteriorKey('analysis',{[key]:{...variant,variants:[{...variant,disabled:true}]}}),null);
 assert.equal(roomInteriorKey('analysis',{[key]:{variants:[{...variant,disabled:true},variant]}}),key);
 assert.equal(roomInteriorKey('unmapped',{'floor-room-unmapped':variant}),null);
});

test('continuous Gate has one interior over nine floors and single-door clearance follows rotation',()=>{
 if(roomInteriorKey('gate_room')){
  const cells=Array.from({length:9},(_,i)=>({x:i%3,y:Math.floor(i/3)}));
  const html=roomSpriteSurface({roomId:'gate_room',instanceId:'gate',doors:[{side:'north'}]},cells);
  assert.equal((html.match(/data-sprite="floor-room-gate-room"/g)??[]).length,1);
  assert.equal((html.match(/data-sprite="floor-indoor"/g)??[]).length,9);
  assert(html.includes('x="8" y="8" width="224" height="224"'));
 }
 if(roomInteriorKey('analysis'))for(const [doorIndex,angle] of [[0,180],[1,270],[2,0],[3,90]]){
  const html=roomSpriteSurface({roomId:'analysis',instanceId:'a',doorIndex},[{x:0,y:0}]);
  const image=html.match(/<image[^>]*data-sprite="floor-room-analysis"[^>]*>/)[0];
  assert.equal(image.includes('transform='),angle!==0);
  if(angle)assert(image.includes(`rotate(${angle} 40 40)`));
 }
});

test('full-room overlay bounds work for arbitrary multi-cell footprints without repeated furnishings',()=>{
 const roomId=Object.keys(spriteManifest.roomTypes).find(id=>roomInteriorKey(id));
 assert(roomId,'Expected an installed interior to exercise the generic renderer');
 const key=roomInteriorKey(roomId),cells=[{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}];
 const html=roomSpriteSurface({roomId,instanceId:'generic-2x2',doorIndex:2},cells);
 assert.equal((html.match(new RegExp(`data-sprite="${key}"`,'g'))??[]).length,1);
 const image=html.match(new RegExp(`<image[^>]*data-sprite="${key}"[^>]*>`))[0];
 assert(image.includes('x="8" y="8" width="144" height="144"'));
 assert.equal((html.match(new RegExp(`data-sprite="${spriteManifest.roomTypes[roomId].floor}"`,'g'))??[]).length,4);
});
test('walls follow padded physical child geometry and omit joined sides, keeping overlays and stable variants',()=>{
 resetSpriteVariants('room-test');const room={roomId:'analysis',instanceId:'r8'};
 const cells=[{x:0,y:0},{x:1,y:0}],before=JSON.stringify(cells);
 const html=roomSpriteSurface(room,cells,{showProps:false,dashed:true});
 assert.equal((html.match(/data-sprite="wall"/g)??[]).length,6);
 assert.equal((html.match(/data-sprite="floor-lab"/g)??[]).length,2);
 assert(html.includes('stroke-dasharray="2 3"'));assert(!html.includes('data-sprite="test-rig"'));
 assert.equal(html,roomSpriteSurface(room,cells,{showProps:false,dashed:true}));assert.equal(JSON.stringify(cells),before);
 const open=roomSpriteSurface(room,[{x:0,y:0}],{joinedSides:()=>({east:true}),showProps:false});
 assert.equal((open.match(/data-sprite="wall"/g)??[]).length,3);
});
test('visible geology only, generic count markers, door orientation and rectangular aspect ratio',()=>{
 for(const [tile,key] of Object.entries(spriteManifest.baseTiles))assert(geologySprite(tile,'tile').includes(`data-sprite="${key}"`));
 assert.equal(geologySprite(null,'unknown'), '');assert.equal(geologySprite('not-visible','unknown'),'');
 assert(staffCountSprite('r1:staff:0').includes('data-sprite="worker"'));
 assert(roomDoorSprite('east','r1:door').includes('rotate(90 16 16)'));assert(!roomDoorSprite('north','r1:door').includes('rotate('));
 const strip=spriteRectangle('wall',40,8,{width:80,height:8});assert(strip.includes('width="80" height="8"'));assert(strip.includes('preserveAspectRatio="none"'));
 const fallback=roomSpriteSurface({roomId:'unmapped',instanceId:'r9'},[{x:0,y:0}]);assert(fallback.includes('data-sprite="floor-indoor"'));
});
