import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeAddress,decodeAddress,addressIndex,decodeAddressIndex,logicalAddressCount,unrankPartialPermutation,rankPartialPermutation,permutationCount} from './address-codec.mjs';
import {generateGeometry} from './model.mjs';

test('all 240,944 structural addresses have six unique glyphs, no collisions, and exact round trips',()=>{
  const count=logicalAddressCount(),sequences=new Set();assert.equal(count,240944);
  for(let i=0;i<count;i++) {
    const address=decodeAddressIndex(i),ids=encodeAddress(address);
    assert.equal(addressIndex(address),i);assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);
    assert.ok(ids.every(id=>Number.isInteger(id)&&id>=0&&id<24));
    const key=ids.join(',');assert.ok(!sequences.has(key));sequences.add(key);
    assert.deepEqual(decodeAddress(ids),address);assert.deepEqual(encodeAddress(address),ids);
  }
  assert.equal(sequences.size,count);
});
test('invalid hexes, fractional coordinates, unused permutations and unsafe capacities are rejected',()=>{
  const a={Q:0,R:0,q:0,r:0,Z:0,endpoint:0};
  for(const invalid of [{Q:3,R:3},{q:-3,r:-3},{Z:.5},{Z:NaN},{endpoint:16}])assert.throws(()=>encodeAddress({...a,...invalid}));
  assert.throws(()=>decodeAddress(unrankPartialPermutation(240944)),/outside/);
  assert.throws(()=>decodeAddress([0,1,2,3,4,4]),/unique/);
  assert.throws(()=>decodeAddress([0,1,2,3,4,24]),/Invalid/);
  assert.throws(()=>decodeAddress([0,1,2,3,4,5,100]),/exactly/);
  assert.throws(()=>logicalAddressCount({destinationGlyphCount:8}),/capacity/);
  assert.throws(()=>generateGeometry('invalid',{destinationGlyphCount:8}),/capacity/);
  assert.throws(()=>permutationCount(64,64),/precision/);
  assert.throws(()=>rankPartialPermutation([0,1],Infinity));
});
test('alternate alphabets and coordinate ranges preserve round trips and underlying geometry',()=>{
  const config={majorRadius:1,minorRadius:2,majorScale:7,zRange:2,endpointRange:4},g=generateGeometry('same',config),other=generateGeometry('same',{...config,destinationGlyphCount:16});
  assert.deepEqual(other.nodes,g.nodes);assert.deepEqual(other.edges,g.edges);assert.deepEqual(other.edgePairs,g.edgePairs);assert.deepEqual(other.minorNetworks,g.minorNetworks);
  assert.deepEqual(other.gates.map(({addressGlyphIds,...rest})=>rest),g.gates.map(({addressGlyphIds,...rest})=>rest));
  for(const gate of other.gates){assert.deepEqual(decodeAddress(gate.addressGlyphIds,other.config),gate.address);assert.ok(gate.addressGlyphIds.every(id=>id<16));}
  for(const size of [12,16,24,32])for(const i of [0,1,logicalAddressCount({...config,destinationGlyphCount:size})-1]) {
    const options={...config,destinationGlyphCount:size},address=decodeAddressIndex(i,options);
    assert.deepEqual(decodeAddress(encodeAddress(address,options),options),address);
  }
});
