import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveKitLayout,rectangleCells,edgeKey} from './room-kit-layout.mjs';

test('1×1 resolves every exterior door combination without changing corner geometry',()=>{
 const sides=['north','east','south','west'];
 for(let mask=0;mask<16;mask++){
  const doors=sides.filter((_,i)=>mask&(1<<i)).map(s=>edgeKey(0,0,s));
  const result=resolveKitLayout(rectangleCells(1,1),doors);
  assert.equal(result.modules.filter(m=>m.piece==='corner').length,4);
  assert.equal(result.modules.filter(m=>m.piece==='edge-door').length,doors.length);
  assert.equal(result.modules.filter(m=>m.piece==='edge-normal').length,4-doors.length);
  assert.equal(result.modules.length,9);
 }
});
test('horizontal and vertical 1×2 joins use open edges and both SHARED handednesses',()=>{
 for(const [w,h] of [[2,1],[1,2]]){
  const {modules,boundary}=resolveKitLayout(rectangleCells(w,h));
  assert.equal(boundary.length,6);
  assert.equal(modules.filter(m=>m.piece==='edge-open').length,2);
  assert.equal(modules.filter(m=>m.piece==='corner').length,4);
  const shared=modules.filter(m=>m.piece==='shared');
  assert.equal(shared.length,4);assert.equal(shared.filter(m=>m.reflect).length,2);
 }
 // Top join: left cell NE needs reflected SHARED (north wall, east open);
 // right cell NW needs canonical SHARED (north wall, west open).
 const {modules}=resolveKitLayout(rectangleCells(2,1));
 assert(modules.some(m=>m.x===0&&m.piece==='shared'&&m.rotation===90&&m.reflect));
 assert(modules.some(m=>m.x===1&&m.piece==='shared'&&m.rotation===0&&!m.reflect));
});
test('2×2 leaves the center free of posts and preserves every exact exterior door edge',()=>{
 const cells=rectangleCells(2,2),base=resolveKitLayout(cells);
 const result=resolveKitLayout(cells,base.boundary.map(e=>e.key));
 assert.equal(result.modules.filter(m=>m.piece==='edge-open').length,8);
 assert.equal(result.modules.filter(m=>m.piece==='corner').length,4);
 assert.equal(result.modules.filter(m=>m.piece==='shared').length,8);
 assert.equal(result.modules.filter(m=>m.piece==='edge-door').length,8);
 // Each cell has exactly three corner-region pieces, never its center-facing corner.
 for(const c of cells){
  const corners=result.modules.filter(m=>m.x===c.x&&m.y===c.y&&['corner','shared'].includes(m.piece));
  assert.equal(corners.length,3);
  const inwardRotation=c.x===0?(c.y===0?180:90):(c.y===0?270:0);
  assert(!corners.some(m=>m.rotation===inwardRotation));
 }
 assert.deepEqual(cells,rectangleCells(2,2));
});
test('invalid topology and internal-edge doors are rejected',()=>{
 assert.throws(()=>resolveKitLayout([{x:0,y:0},{x:0,y:0}]),/unique/);
 assert.throws(()=>resolveKitLayout(rectangleCells(2,1),[edgeKey(0,0,'east')]),/exterior/);
 assert.throws(()=>resolveKitLayout([{x:.5,y:0}]),/integer/);
});
