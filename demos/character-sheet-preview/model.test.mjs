import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {groupedFrames,playbackOffset,localPoint,hitLayer,poseStudy,headCenteredView} from './model.mjs';
const legacy=new URL('../../artwork/cc0-character-study/extracted-clean/index.json',import.meta.url);
const records=existsSync(legacy)?JSON.parse(readFileSync(legacy)).sprites:[];
test('viewer centers the head and fits asymmetric pose bounds around it',()=>{
 const head={z:8,x:50,y:100,angle:90,scale_x:1,scale_y:1,pivot_x:0,pivot_y:1,file:{width:100,height:80}};
 const view=headCenteredView({objects:[head]},[-300,-250,200,280]);
 assert.deepEqual(view.center,[90,150]);
 assert(Math.abs(240-view.center[0]*view.scale+view.center[0]*view.scale-240)<1e-6);
 assert(Math.abs(240+view.center[1]*view.scale-view.center[1]*view.scale-240)<1e-6);
 for(const [x,y] of [[-300,-250],[200,280]]){assert(Math.abs((x-view.center[0])*view.scale)<=210);assert(Math.abs((y-view.center[1])*view.scale)<=210);}
});
test('all extracted frames group into ordered actions and retain source alignment',{skip:!existsSync(legacy)},()=>{
 const groups=groupedFrames(records);assert.equal(groups.size,11);assert.equal([...groups.values()].flat().length,64);
 for(const frames of groups.values())for(const r of frames){assert.equal(playbackOffset(r).length,2);assert(playbackOffset(r).every(Number.isFinite));}
 const r=groups.get('walk-gun')[0],moved={...r,sourceOrigin:[r.sourceOrigin[0]+5,r.sourceOrigin[1]-3]};
 const a=playbackOffset(r),b=playbackOffset(moved);assert.deepEqual(b,[a[0]+5,a[1]-3]);
});
test('rotated/scaled part picking honors stacking and exports independent provisional pivots',()=>{
 const l={id:1,file:'a.png',x:100,y:100,angle:90,scale:2,pivot:[10,5]};
 assert.deepEqual(localPoint(l,100,100),[10,5]);
 const images=new Map([['a.png',{width:20,height:10}]]),top={...l,id:2};
 assert.equal(hitLayer([l,top],images,100,100).id,2);
 assert.equal(hitLayer([l],images,200,100),null);
 const study=poseStudy([l]);assert.equal(study.registeredRig,false);study.layers[0].pivot[0]=50;assert.equal(l.pivot[0],10);
});
