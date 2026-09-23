import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,hex,generateGeometry,analyze,generateCampaign,emptyFailures,route,graph,sourceReachability,playerView,failureTest,glyphPath,addressCodes,report} from './model.mjs';
import {evaluateSeed} from './batch.mjs';
import {populationTotals,balanceIndicator,TRADE_RULES} from './havens.mjs';
import {DEFAULT_ADDRESS_CODEC,permutationCount,validHexCells,addressIndex,decodeAddressIndex,unrankPartialPermutation,rankPartialPermutation,encodeAddress,decodeAddress,logicalAddressCount} from './address-codec.mjs';

const g=generateGeometry(),a=analyze(g);
test('provisional address space and deterministic seed/config geometry',()=>{
  assert.equal(hex(3).length,37);assert.equal(37*37*11*16,240944);
  assert.deepEqual(generateGeometry(),g);assert.notDeepEqual(generateGeometry('another-seed'),g);
  assert.throws(()=>generateGeometry('x',{minorRadius:4,majorScale:7}),/non-overlapping/);
  assert.throws(()=>generateGeometry('x',{density:NaN}),/density/);
});
test('addresses, Origins, lattice, physical positions and boundaries remain distinct',()=>{
  assert.equal(new Set(g.gates.map(a=>JSON.stringify(a.address))).size,g.gates.length);
  assert.equal(new Set(g.gates.map(a=>a.originGlyphId)).size,g.gates.length);
  for(const gate of g.gates) {
    const node=g.nodes[gate.nodeId],ad=gate.address;
    assert.equal(node.state,'NORMAL');assert.equal(node.logical.q,7*ad.Q+ad.q);assert.equal(node.logical.r,7*ad.R+ad.r);assert.equal(node.logical.z,ad.Z);
    assert.ok(Math.abs(ad.Q+ad.R)<=3&&Math.abs(ad.q+ad.r)<=3&&Math.abs(ad.Z)<=5&&ad.endpoint<16);
    assert.ok(node.physical.every(Number.isFinite));
    assert.equal(gate.addressGlyphIds.length,6);
    assert.equal(new Set(gate.addressGlyphIds).size,6);
    assert.deepEqual(decodeAddress(gate.addressGlyphIds),gate.address);
  }
  assert.ok(g.nodes.length>g.gates.length);
  for(const edge of g.edges) {
    const x=g.nodes[edge.a],y=g.nodes[edge.b],dq=y.logical.q-x.logical.q,dr=y.logical.r-x.logical.r,dz=y.logical.z-x.logical.z;
    assert.ok((dz===0&&Math.max(Math.abs(dq),Math.abs(dr),Math.abs(dq+dr))===1)||(dq===0&&dr===0&&Math.abs(dz)===1),'only 8 lattice neighbors');
    if(x.majorId!==y.majorId) assert.notEqual(edge.pairId,null);
  }
  for(const p of g.edgePairs) assert.equal(g.nodes[p.a].kind,'EDGE');
});
test('larger scale gaps still use lattice steps and reserved infrastructure',()=>{
  const geometry=generateGeometry('gap',{majorRadius:1,majorScale:10});
  for(const p of geometry.edgePairs) assert.equal(p.edgeIds.length,4);
  for(const gate of geometry.gates) assert.equal(geometry.nodes[gate.nodeId].state,'NORMAL');
});
test('campaign reproducibility, independent geometry, populations and validation',()=>{
  const before=JSON.stringify(g),c=generateCampaign(g,'campaign-1',a.recommendedHop,{},a);
  assert.deepEqual(c,generateCampaign(g,'campaign-1',a.recommendedHop,{},a));
  assert.notDeepEqual(c,generateCampaign(g,'campaign-2',a.recommendedHop,{},a));
  assert.equal(JSON.stringify(g),before);assert.equal(c.validation.pass,true);
  assert.deepEqual(Object.values(c.validation.byFaction),[40,25,15,20]);
  assert.ok(Object.values(c.validation.factionReachability).every(n=>n>0));
  assert.equal(c.threats.length,4);assert.ok(!c.threats.some(t=>t.gateId===c.sgcGateId));
  const tiny=generateGeometry('tiny',{majorRadius:0}),ta=analyze(tiny),tc=generateCampaign(tiny,'c',80,{},ta);
  assert.equal(tc.validation.pass,false);assert.ok(tc.validation.warnings.length);
});
test('campaign Haven fixtures include population, capacity, resources and trade metadata',()=>{
  const c=generateCampaign(g,'haven-data',a.recommendedHop,{},a),summary=c.validation.havenSummary;
  assert.equal(summary.havenCount,100);
  assert.deepEqual(summary.byFaction.Scions,{P1:5,P4:31,P16:4});
  assert.deepEqual(summary.byFaction.CLP,{P1:16,P4:6,P16:3});
  assert.equal(Object.values(summary.byFaction["Moy’na"]).reduce((sum,count)=>sum+count,0),15);
  assert.ok(Object.values(summary.byFaction["Moy’na"]).every(count=>count>0));
  assert.deepEqual(summary.byFaction.Independent,{P1:12,P4:6,P16:2});
  assert.ok(summary.totalRationCapacity>0&&summary.totalRationDemand>0&&summary.totalSentientPopulation>0);
  assert.ok(summary.overallOccupancy>0&&summary.overallOccupancy<1);
  assert.equal(c.tradeRules.tradesPerHavenPerHour,1);
  assert.equal(c.tradeRules.execution,'not simulated');
  for(const haven of c.havens) {
    assert.ok(['P1','P4','P16'].includes(haven.scale));
    assert.ok(haven.rationDemand<=haven.rationCapacity);
    assert.ok(haven.sentientPopulation>0);
    for(const resource of ['Food','Supply','Material']) assert.ok(['deficit','stable','surplus'].includes(haven.resources[resource]));
  }
  assert.deepEqual(populationTotals({humans:1,unbondedMoyna:1,bondedPairs:1}),{sentientPopulation:4,rationDemand:3});
  assert.equal(balanceIndicator({Food:'stable',Supply:'stable',Material:'stable'}),'golden balance');
  assert.equal(balanceIndicator({Food:'surplus',Supply:'surplus',Material:'surplus'}),'golden surplus');
  assert.equal(TRADE_RULES.tradesPerHavenPerHour,1);
});
function chain() {
  return {seed:'chain',config:{...DEFAULTS,maxLinkDistance:2},majorNetworks:[{id:0}],minorNetworks:[{id:0}],
    nodes:Array.from({length:7},(_,id)=>({id,majorId:0,physical:[id,0,0],logical:{q:id,r:0,s:-id,z:0}})),
    edges:Array.from({length:6},(_,id)=>({id,a:id,b:id+1,distance:1,pairId:id===3?0:null})),edgePairs:[{id:0,a:3,b:4,active:true,edgeIds:[3]}],
    gates:[0,3,6].map((nodeId,id)=>({id,nodeId,active:true}))};
}
test('source-dependent reachability and staging require an actual intermediate Gate',()=>{
  const g=chain(),a=analyze(g),f=emptyFailures();
  assert.equal(route(g,0,1,3).reachable,true);assert.equal(route(g,0,2,3).reason,'hop limit exceeded');assert.equal(route(g,1,2,3).reachable,true);
  assert.equal(sourceReachability(g,a,0,3)[2],'requires staging');
  f.gates.add(1);assert.equal(sourceReachability(g,analyze(g,f),0,3,f)[2],'unreachable');
  assert.equal(route(g,0,2,6,f).reachable,true,'inactive Gate does not destroy its independent routing node');
});
test('route failure causes distinguish endpoints, disabled nodes, pair state and distance',()=>{
  const g=chain(),f=emptyFailures();f.gates.add(0);assert.equal(route(g,0,2,8,f).reason,'endpoint inactive');
  f.gates.clear();f.nodes.add(2);assert.equal(route(g,0,2,8,f).reason,'disabled routing infrastructure');
  f.nodes.clear();f.pairs.add(0);assert.equal(route(g,0,2,8,f).reason,'disabled routing infrastructure');
  f.pairs.clear();g.edgePairs[0].active=false;assert.equal(route(g,0,2,8,f).reason,'no usable Edge Pair');
  g.edgePairs[0].active=true;g.edges[2].distance=10;assert.equal(route(g,0,2,8,f).reason,'physical link-distance constraint');
  g.edges.splice(2,1);assert.match(route(g,0,2,8,f).reason,/disconnected topology/);
});
test('exact graph statistics, critical infrastructure and monotonic hop coverage',()=>{
  const g=chain(),a=analyze(g,emptyFailures(),{minHop:1,maxHop:8});
  assert.equal(a.components,1);assert.equal(a.averageHops,4);assert.equal(a.maximumHops,6);assert.equal(a.connectivity,1);
  assert.deepEqual(a.criticalNodes.sort(),[1,2,3,4,5]);assert.deepEqual(a.criticalPairs,[0]);
  assert.equal(a.hopAnalysis.find(r=>r.hop===3).reachability,2/3);assert.equal(a.recommendedHop,6);
  for(let i=1;i<a.hopAnalysis.length;i++) assert.ok(a.hopAnalysis[i].reachability>=a.hopAnalysis[i-1].reachability);
  const f=emptyFailures();f.pairs.add(0);const b=analyze(g,f);assert.equal(b.components,2);assert.equal(b.connectivity,1/3);
  assert.ok(!('runtime' in report(a)));
});
test('failure tests are seeded overlays and respect max physical link distance',()=>{
  const before=JSON.stringify(g),f=failureTest(g,'5%','same',a);
  assert.deepEqual(f,failureTest(g,'5%','same',a));assert.ok(f.nodes.size>0);
  const after=analyze(g,f);assert.ok(after.activeGates<=a.activeGates);assert.equal(JSON.stringify(g),before);
  const adjacency=graph(g,f);
  for(let i=0;i<adjacency.length;i++)for(const [j,e]of adjacency[i]){assert.ok(!f.nodes.has(i)&&!f.nodes.has(j));assert.ok(g.edges[e].distance<=g.config.maxLinkDistance);}
});
test('player projection excludes unknown positions, factions, Havens, threats and routing truth',()=>{
  const c={knowledge:{0:{address:true,spatial:false,haven:true,faction:false,threat:false},1:{address:true,spatial:true,haven:false,faction:false,threat:true}},havens:[{id:0,gateId:0,name:'Scions secret',faction:'Scions',scale:2}],threats:[{id:0,gateId:0},{id:1,gateId:1}]};
  const view=playerView(g,c);assert.equal(view.length,2);assert.equal(view[0].physical,null);assert.equal(view[0].haven.faction,null);assert.equal(view[0].haven.name,'Known Haven');assert.equal(view[0].threat,null);assert.equal(view[1].threat.id,1);
  for(const record of view)for(const hidden of ['nodeId','logical','routing','active','reality'])assert.ok(!(hidden in record));
  assert.ok(!JSON.stringify(view).includes('Scions'));
});
test('procedural glyphs are stable and unique within vocabulary and Origin code spaces',()=>{
  const codes=Array.from({length:1000},(_,i)=>i);
  assert.equal(new Set(codes.map(glyphPath)).size,1000);assert.equal(glyphPath(19),glyphPath(19));
  const address={Q:0,q:1,Z:-2,r:2,R:-1,endpoint:5},encoded=addressCodes(address);
  assert.equal(encoded.length,6);assert.equal(new Set(encoded).size,6);assert.deepEqual(decodeAddress(encoded),address);
});
test('unique glyph address codec is deterministic, bijective and capacity-safe',()=>{
  assert.equal(validHexCells(3).length,37);
  assert.equal(logicalAddressCount(),240944);
  assert.equal(permutationCount(24,6),96909120);
  assert.ok(logicalAddressCount()<=permutationCount(DEFAULT_ADDRESS_CODEC.destinationGlyphCount,DEFAULT_ADDRESS_CODEC.addressGlyphCount));
  for(const index of [0,1,37,12345,240943]) {
    const address=decodeAddressIndex(index),glyphs=encodeAddress(address);
    assert.equal(new Set(glyphs).size,6);
    assert.equal(rankPartialPermutation(glyphs),index);
    assert.deepEqual(decodeAddress(glyphs),address);
    assert.deepEqual(encodeAddress(address),glyphs);
  }
  const first=unrankPartialPermutation(0),last=unrankPartialPermutation(permutationCount(24,6)-1);
  assert.deepEqual(first,[0,1,2,3,4,5]);
  assert.deepEqual(last,[23,22,21,20,19,18]);
  assert.throws(()=>rankPartialPermutation([0,1,1,3,4,5]),/unique/);
  assert.throws(()=>decodeAddress([0,1,2,3,4,4]),/unique/);
  assert.throws(()=>encodeAddress({Q:4,q:0,Z:0,r:0,R:0,endpoint:0}),/outside/);
});
test('batch evaluation returns sortable diagnostics and failure resilience',()=>{
  const row=evaluateSeed('small',{majorRadius:0});assert.equal(row.seed,'small');assert.ok(Number.isFinite(row.averageHops));assert.ok(row.resilience>=0&&row.resilience<=1);assert.ok('pairDependence'in row);
});
