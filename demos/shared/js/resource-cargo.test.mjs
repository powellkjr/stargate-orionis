import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cargoBand,wildCargoYield,wildCandidateEligibility,manifestedCargoContents,bubbleResourceShare,validateCargoEconomy,validateCargoRecipe} from './resource-cargo.mjs';
const economy=JSON.parse(readFileSync(new URL('../data/resource-cargo-economy.json',import.meta.url)));
const recipe=inv=>({bubbles:Array.from({length:inv},(_,i)=>({id:'BUBBLE_'+i}))});
const cargo=(conversionStat=1230,tiers=[1,2],family='SUPPLY')=>({mode:'WILD',conversionStat,tiers,family});

test('shared cache graph validates dependencies and conserves progressive Balanced output',()=>{
 const config=validateCargoRecipe(JSON.parse(readFileSync(new URL('../data/resource-cargo-playtest.json',import.meta.url))));
 const total=wildCargoYield(economy,config.recipe,cargo(),config.defaultPolicies.SUPPLY);
 assert.equal(cargoBand(economy.sizeBands,config.recipe.bubbles.length).id,'MEDIUM');
 assert.deepEqual(total,{S1:61,S2:15});
 const bad=structuredClone(config);bad.recipe.bubbles[0].dependsOn=[bad.recipe.bubbles.at(-1).id];assert.throws(()=>validateCargoRecipe(bad));
 const duration=structuredClone(config);duration.recipe.bubbles[2].durationTicks=2;assert.throws(()=>validateCargoRecipe(duration));
});
test('locked handoff examples floor each tier separately',()=>{
 for(const sample of economy.examples)assert.deepEqual(wildCargoYield(economy,recipe(sample.inv),cargo(sample.conversionStat,sample.tiers,sample.family),sample.policy),sample.outputs);
});
test('size counts all actual bubbles, including zero-output inspection and long work',()=>{
 assert.equal(cargoBand(economy.sizeBands,8).id,'MEDIUM');assert.equal(cargoBand(economy.sizeBands,16).id,'LARGE');assert.equal(cargoBand(economy.sizeBands,21).id,'HUGE');
 assert.equal(cargoBand(economy.qualityBands,499).id,'POOR');assert.equal(cargoBand(economy.qualityBands,500).id,'STANDARD');assert.equal(cargoBand(economy.qualityBands,1500).id,'EXCEPTIONAL');
 const r=recipe(20),before=structuredClone(r);r.bubbles[0].durationTicks=20;r.bubbles[1].durationTicks=1;
 assert.deepEqual(wildCargoYield(economy,r,cargo(),'BALANCED'),wildCargoYield(economy,before,cargo(),'BALANCED'));
});
test('family-local allocation supports Materials and single-tier Rations without exchanges',()=>{
 assert.deepEqual(wildCargoYield(economy,recipe(20),cargo(1230,[1,2],'MATERIAL'),'QUANTITY'),{M1:184,M2:15});
 assert.deepEqual(wildCargoYield(economy,recipe(8),cargo(100,[1],'RATIONS'),'QUALITY'),{R1:8});
 assert.throws(()=>wildCargoYield(economy,recipe(8),cargo(100,[1,2],'RATIONS'),'QUALITY'));
 assert.throws(()=>wildCargoYield(economy,recipe(8),cargo(100,[1],'KNOWLEDGE'),'QUALITY'));
});
test('quality-filter eligibility rejects weak random candidates without topping up authored reality',()=>{
 const c=cargo(100),original=structuredClone(c),result=wildCandidateEligibility(economy,recipe(20),c);
 assert.equal(result.accepted,false);assert.equal(result.minimum,8);assert.equal(result.outputs.S2,1);assert.deepEqual(c,original);
 assert.equal(wildCandidateEligibility(economy,recipe(20),cargo()).accepted,true);
});
test('cumulative output shares conserve the floored total and inspections can emit zero',()=>{
 const weights=[0,0,...Array(18).fill(1)],total=economy.examples[0].outputs,parts=weights.map((_,i)=>bubbleResourceShare(total,weights,i));
 assert.deepEqual(parts[0],{S1:0,S2:0});assert.deepEqual(parts[1],{S1:0,S2:0});
 assert.deepEqual(Object.fromEntries(Object.keys(total).map(k=>[k,parts.reduce((n,p)=>n+p[k],0)])),total);
 assert.throws(()=>bubbleResourceShare(total,[0,0],0));
});
test('manifested resources and Knowledge retain exact contents and cannot enter wild allocation',()=>{
 const manifest={mode:'MANIFESTED',resources:{S1:3,S2:1,M1:2,R1:4}},copy=manifestedCargoContents(economy,manifest);copy.resources.S1=99;
 assert.equal(manifest.resources.S1,3);assert.deepEqual(manifestedCargoContents(economy,{mode:'MANIFESTED',knowledgeInstanceIds:['HYPOTHESIS_01']}),{knowledgeInstanceIds:['HYPOTHESIS_01']});
 assert.throws(()=>wildCargoYield(economy,recipe(20),manifest,'QUALITY'));
 assert.throws(()=>manifestedCargoContents(economy,{mode:'MANIFESTED',resources:{KNOWLEDGE:1}}));
});
test('invalid recipe identity, ranges and negative distributions are rejected',()=>{
 assert.throws(()=>wildCargoYield(economy,{bubbles:[{id:'X'},{id:'X'}]},cargo(),'QUANTITY'));
 assert.throws(()=>wildCargoYield(economy,recipe(41),cargo(),'QUANTITY'));
 assert.throws(()=>wildCargoYield(economy,recipe(20),cargo(99),'QUANTITY'));
 assert.throws(()=>bubbleResourceShare({S1:2},[1,-1],0));
 const bad=structuredClone(economy);bad.sizeBands[1].min=7;assert.throws(()=>validateCargoEconomy(bad));
});

// Cross-file acceptance: starter hardware can process the actual authored cache,
// its numeric recovery matches the economy, and a Generator can power the base.
test('provisional Receiving equipment references executable authoring and fits starter power',()=>{
 const read=file=>JSON.parse(readFileSync(new URL('../data/'+file,import.meta.url)));
 const setup=read('receiving-core-prototype.json'),theory=read(setup.definitionSource),items=read(setup.itemSource);
 const base=read('base-configuration.json'),rooms=read('rooms_schema.json'),cache=read('resource-cargo-playtest.json');
 const cores=new Map(theory.coreDefinitions.map(c=>[c.id,c]));
 assert.equal(new Set(setup.starterInstances.map(i=>i.instanceId)).size,2);
 const installed=setup.starterInstances.map(instance=>{
  const core=cores.get(instance.coreDefinitionId),room=base.rooms.find(r=>r.instanceId===instance.roomInstanceId);
  assert.ok(core&&items[core.id]&&room);
  assert.equal(room.roomId,'receiving');
  assert.ok(core.minimumConstructionTier<=room.constructionTier);
  assert.ok(instance.slotIndex<setup.receiving.coreSlotsByConstructionTier[room.constructionTier]);
  assert.ok(core.power.active>=core.power.idle);
  return core;
 });
 const size=cargoBand(economy.sizeBands,cache.recipe.bubbles.length).id;
 assert.equal(size,'MEDIUM');
 assert.ok(installed.some(c=>c.contribution.supportedSizes?.includes(size)));
 for(const [mode,high] of Object.entries(economy.policies)){
  const core=theory.coreDefinitions.find(c=>c.id===`RECEIVING_${mode}_RECOVERY_CORE_1`),c=core.contribution;
  assert.equal(c.highTierFixedPercent+c.lowTierFixedPercent+c.flexiblePercent,100);
  assert.equal(c.highTierFixedPercent+c.flexiblePercent*c.flexibleHighTierShare,high);
 }
 for(const prefs of Object.values(setup.cargoCapabilityPreferences))for(const service of [...prefs.handling,...prefs.recovery])assert.ok(theory.coreDefinitions.some(c=>c.providesServices.includes(service)));
 assert.deepEqual(Object.keys(setup.power.roomBaseByDefinition).sort(),rooms.map(r=>r.identity.id).sort());
 // Even one CT1 room of every type plus starter hardware stays below 100 PWR.
 assert.ok(Object.values(setup.power.roomBaseByDefinition).reduce((a,b)=>a+b,0)+installed.reduce((a,c)=>a+c.power.active,0)<=setup.power.generatorOutput);
 const recipe=theory.recipes.find(r=>r.id===setup.installationRecipeId);
 assert.ok(recipe.reversible);assert.deepEqual(recipe.inputs,[]);assert.deepEqual(recipe.outputs,[]);
 assert.equal(recipe.bubbles.reduce((t,b)=>t+b.durationTicks,0),4);
 for(const b of recipe.bubbles){assert.ok([1,20].includes(b.durationTicks));assert.ok(!Array.isArray(b.actorRequirement)&&!Array.isArray(b.toolRequirement)&&!Array.isArray(b.roomServiceRequirement));}
 assert.equal(recipe.directions.INSTALL.releaseWarehousePlaceOnCommit,true);
 assert.equal(recipe.directions.REMOVE.reserveWarehousePlaceBeforeStart,true);
});
