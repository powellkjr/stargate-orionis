import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRegionMap,recolorPixels,insidePolygon} from './character-colors.mjs';
const regions=[{key:'uniformColor',reference:'#808080',color:'#808080',kind:'neutral',polygons:[[[0,0],[512,0],[512,1024],[0,1024]]]}];
test('Mask protects transparency, outlines, colored equipment and pixels outside its region',()=>{
 const source=new Uint8ClampedArray([128,128,128,255,0,0,0,255,0,230,255,255,128,128,128,0,140,140,140,255,160,160,160,255,180,180,180,255,128,128,128,255]);
 const map=buildRegionMap(source,4,2,regions);
 assert.deepEqual([...map],[1,0,0,0,1,1,0,0]);
 const result=recolorPixels(source,map,{uniformColor:'#305070'},regions);
 for(const p of [1,2,3,6,7])assert.deepEqual(result.slice(p*4,p*4+4),source.slice(p*4,p*4+4));
 assert.equal(result[4*4]-result[0],12); // Original shading difference survives.
 assert.equal(result[5*4]-result[0],32);
 assert.equal(result[3],255);
 assert.equal(source[0],128); // Source remains untouched.
 assert.deepEqual(result,recolorPixels(source,map,{uniformColor:'#305070'},regions));
});
test('Invalid colors and mask dimensions fail explicitly',()=>{
 assert.throws(()=>recolorPixels(new Uint8ClampedArray(4),new Uint8Array([1]),{uniformColor:'bad'},regions));
 assert.throws(()=>buildRegionMap(new Uint8ClampedArray(4),2,2,regions));
 assert.throws(()=>recolorPixels(new Uint8ClampedArray(4),new Uint8Array(2),{},regions));
 assert.equal(insidePolygon(100,100,regions[0].polygons[0]),true);
 assert.equal(insidePolygon(800,100,regions[0].polygons[0]),false);
});
test('An excluded equipment panel is protected inside a clothing polygon',()=>{
 const source=new Uint8ClampedArray([160,160,160,255,170,170,170,255]);
 const regions=[{key:'uniformColor',reference:'#808080',color:'#808080',kind:'neutral',polygons:[[[0,0],[1024,0],[1024,1024],[0,1024]]],exclude:[[[512,0],[1024,0],[1024,1024],[512,1024]]]}];
 const map=buildRegionMap(source,2,1,regions);assert.deepEqual([...map],[1,0]);
 assert.deepEqual(recolorPixels(source,map,{uniformColor:'#804030'},regions).slice(4),source.slice(4));
});
