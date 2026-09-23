import test from 'node:test';
import assert from 'node:assert/strict';
import {random,generateGeometry,generateCampaign,analyze,emptyFailures,route} from './model.mjs';
import {RATION_CAPACITY,SCALE_TARGETS,enrichHavens,populationTotals,havenSummary,knownHaven,balanceIndicator,matchesResource,tradeRelationships} from './havens.mjs';
const base=Object.entries(SCALE_TARGETS).flatMap(([f,counts])=>Array.from({length:counts.reduce((a,b)=>a+b)},()=>({faction:f}))).map((h,id)=>({...h,id,gateId:id,name:`Haven ${id}`}));
test('ration accounting counts bonded partners as two people and supports distinct biological loads',()=>{
  assert.deepEqual(populationTotals({humans:1}),{sentientPopulation:1,rationDemand:1});
  assert.deepEqual(populationTotals({unbondedMoyna:1}),{sentientPopulation:1,rationDemand:.75});
  assert.deepEqual(populationTotals({bondedPairs:1}),{sentientPopulation:2,rationDemand:1.25});
  assert.throws(()=>populationTotals({humans:-1}),/nonnegative/);
});
test('seeded metadata preserves input, exact capacities, cohort accounting and weighted occupancy',()=>{
  const before=JSON.stringify(base),havens=enrichHavens(base,random('metadata'));
  assert.equal(JSON.stringify(base),before);assert.deepEqual(havens,enrichHavens(base,random('metadata')));
  assert.notDeepEqual(havens,enrichHavens(base,random('different')));
  for(const h of havens){assert.equal(h.rationCapacity,RATION_CAPACITY[h.scale]);assert.equal(h.sentientPopulation,populationTotals(h.populationCohorts).sentientPopulation);assert.equal(h.rationDemand,populationTotals(h.populationCohorts).rationDemand);assert.ok(Math.abs(h.rationCapacity*h.occupancy-h.rationDemand)<1e-7);assert.ok(h.occupancy>0&&h.occupancy<1);}
  const s=havenSummary(havens);assert.equal(s.overallOccupancy,s.totalRationDemand/s.totalRationCapacity);assert.ok(s.totalSentientPopulation>s.totalRationDemand);assert.ok(havens.filter(h=>h.occupancy<.65).length>50);
  for(const f of ['Scions','CLP','Independent']) assert.deepEqual(Object.values(s.byFaction[f]),SCALE_TARGETS[f]);
});
test('Moy’na scales follow age with variable campaign distributions; factions bias resources without quotas',()=>{
  const samples=Array.from({length:60},(_,i)=>enrichHavens(base,random(`sample-${i}`))),counts=new Set(samples.map(h=>JSON.stringify(havenSummary(h).byFaction['Moy’na'])));
  assert.ok(counts.size>5,'nest counts are not fixed');
  const all=samples.flat();
  for(const h of all.filter(h=>h.faction==='Moy’na')){assert.equal(h.scale,h.nestHistory.relativeAge<.2?'P1':h.nestHistory.relativeAge<2/3?'P4':'P16');if(h.nestHistory.recentlyExpanded)assert.ok(h.occupancy<=.4);}
  for(const [f,r] of [['Scions','Supply'],['CLP','Material'],['Moy’na','Food']]){const own=all.filter(h=>h.faction===f);assert.ok(own.filter(h=>h.resources[r]==='surplus').length/own.length>.6);}
  assert.ok(all.some(h=>balanceIndicator(h.resources)==='golden balance'));assert.ok(all.some(h=>balanceIndicator(h.resources)==='golden surplus'));
});
test('unknown population and resources cannot leak through filtering, balance indicators or trade',()=>{
  const h=enrichHavens(base,random('known'))[0],k={haven:true,faction:false,population:false,resources:false};
  const view=knownHaven(h,k);assert.equal(view.faction,null);
  for(const field of ['scale','rationCapacity','occupancy','sentientPopulation','resources','materialQuality','populationCohorts','nestHistory'])assert.ok(!(field in view));
  assert.equal(matchesResource(view,'Food'),false);assert.equal(balanceIndicator(view.resources),null);
  assert.deepEqual(tradeRelationships([view,{id:999,resources:{Food:'surplus'}}],view.id),[]);
  const resourceView=knownHaven(h,{...k,resources:true});assert.deepEqual(resourceView.resources,h.resources);assert.ok(!('sentientPopulation'in resourceView));assert.equal(knownHaven(h,{...k,haven:false}),null);
});
test('trade candidates remain local and routing-dependent, do not mutate resources, and hide unknown routes',()=>{
  const g=generateGeometry('trade',{majorRadius:0}),a=analyze(g),f=emptyFailures();
  const havens=[{id:0,gateId:0,faction:'CLP',resources:{Food:'surplus',Supply:'stable',Material:'deficit'}},{id:1,gateId:1,faction:'CLP',resources:{Food:'deficit',Supply:'stable',Material:'surplus'}}];
  const before=JSON.stringify(havens),get=()=>tradeRelationships(havens,0,(s,d)=>route(g,s,d,80,f));
  assert.equal(get()[0].route.reachable,true);assert.equal(get()[0].exchanges.length,2);
  f.gates.add(1);assert.equal(get()[0].route.reachable,false);assert.equal(get()[0].route.reason,'endpoint inactive');
  assert.equal(tradeRelationships(havens,0)[0].route,null);assert.equal(JSON.stringify(havens),before);
  assert.equal(a.activeGates,g.gates.length);
});
test('new campaign metadata leaves geometry immutable and reports the four comparison totals',()=>{
  const g=generateGeometry(),a=analyze(g),before=JSON.stringify(g),c=generateCampaign(g,'campaign-1',a.recommendedHop,{},a);
  assert.equal(JSON.stringify(g),before);assert.deepEqual(c.validation.havenSummary,havenSummary(c.havens));assert.equal(c.tradeRules.tradesPerHavenPerHour,1);
  assert.equal(c.havens.length,100);assert.equal(c.validation.pass,true);
});
