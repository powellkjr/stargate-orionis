import {test} from 'node:test';
import assert from 'node:assert/strict';
import {materialPixels} from './material-colors.mjs';
test('material channels change independently while preserving fixed pixels, alpha and shading',()=>{
 const source=new Uint8ClampedArray([10,12,14,255,100,100,100,128,50,50,50,255,90,80,70,0]);
 const materials={shirt:{id:1,color:'#804020'},gear:{id:2,color:'#123456'}};
 const out=materialPixels(source,new Uint8Array([0,1,1,2]),materials,{shirt:100,gear:50},{});
 assert.deepEqual([...out.slice(0,4)],[10,12,14,255]);
 assert.deepEqual([...out.slice(4,8)],[128,64,32,128]);
 assert.deepEqual([...out.slice(8,12)],[64,32,16,255]);
 assert.deepEqual([...out.slice(12)],[90,80,70,0]);
 assert.throws(()=>materialPixels(source,new Uint8Array(3),materials,{},{}),/dimensions/);
});
