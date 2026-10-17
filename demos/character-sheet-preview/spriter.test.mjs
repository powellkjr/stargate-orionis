import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {compose,interpolate,samplePose,animationBounds} from './spriter.mjs';
const transform=(extra={})=>({x:0,y:0,angle:0,scale_x:1,scale_y:1,a:1,...extra});
test('authored angular spin and mirrored parent transforms retain direction',()=>{
 assert.equal(interpolate(transform({angle:350}),transform({angle:10}),.5,1).angle,360);
 assert.equal(interpolate(transform({angle:10}),transform({angle:350}),.5,-1).angle,0);
 assert.equal(interpolate(transform({angle:10}),transform({angle:90}),.5,0).angle,10);
 const world=compose(transform({x:10,y:20,angle:90,scale_x:-2,scale_y:3,a:.5}),transform({x:4,y:2,angle:30,a:.5}));
 assert(Math.abs(world.x-4)<1e-9);assert(Math.abs(world.y-12)<1e-9);assert.equal(world.angle,60);assert.equal(world.a,.25);
});
test('mainline parent references, pivots, z-order, interpolation and one-shot ending resolve',()=>{
 const file={width:20,height:30,pivot_x:.5,pivot_y:.2};
 const animation={length:100,looping:false,mainline:[{bones:[{id:2,timeline:0,key:0},{id:9,parent:2,timeline:1,key:0}],objects:[{id:0,parent:9,timeline:2,key:0,z_index:3},{id:1,timeline:3,key:0,z_index:1}]}],timelines:{
  0:{keys:[{id:0,transform:{x:10,angle:90}},{id:1,time:100,transform:{x:30,angle:90}}]},
  1:{keys:[{id:0,transform:{x:5}}]},
  2:{keys:[{id:0,transform:{folder:0,file:0,pivot_x:.25}}]},
  3:{keys:[{id:0,transform:{folder:0,file:0}}]}
 }};
 const c={files:{'0:0':file}},pose=samplePose(c,animation,50);
 assert(Math.abs(pose.objects[1].x-20)<1e-9);assert(Math.abs(pose.objects[1].y-5)<1e-9);
 assert.equal(pose.objects[1].pivot_x,.25);assert.equal(pose.objects[1].pivot_y,.2);assert.equal(pose.objects[0].z,1);
 assert.equal(samplePose(c,animation,500).time,100);assert.equal(samplePose(c,{...animation,looping:true},150).time,50);
 assert(animationBounds(c,animation).every(Number.isFinite));
});
const pack=new URL('../../artwork/zombie-tds-main-characters/preview-data.json',import.meta.url);
test('local purchased pack resolves every authored pose without missing parent/file references',{skip:!existsSync(pack)},()=>{
 const data=JSON.parse(readFileSync(pack));assert.equal(data.characters.length,2);
 for(const c of data.characters){assert.equal(c.animations.length,11);for(const a of c.animations){
  assert.equal(a.looping,false);assert(a.frames.length);
  for(const time of [0,a.length/2,a.length,...a.mainline.map(k=>k.time??0)]){
   const pose=samplePose(c,a,time);assert(pose.bones.length&&pose.objects.length);
   for(const o of pose.objects)for(const key of ['x','y','angle','scale_x','scale_y','a','pivot_x','pivot_y'])assert(Number.isFinite(o[key]),`${c.name}/${a.name}/${key}`);
  }
  assert(animationBounds(c,a).every(Number.isFinite));
 }}
});
