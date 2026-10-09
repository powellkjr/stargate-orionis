import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createAuthorityRegistry,validateContext} from '../shared/mission-author/adapters.mjs';
import {validateCatalogs} from '../shared/mission-author/catalogs.mjs';
import {composeFoundation} from '../shared/mission-author/selection.mjs';
import {composeSkeleton} from '../shared/mission-author/skeleton.mjs';
import {validateSkeletons,validateDraft} from '../shared/mission-author/draft.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
const offworld=read('offworld/archetypes'),items=read('item'),mission=compileMission(read('offworld/missing-operative-001.finalized'),{...offworld,itemDefinitions:items});
const registry=createAuthorityRegistry({theoryPack:read('theory/stargate_theory_simulator_import'),professions:read('base-classes'),items,physicalInstances:read('instance'),mission,offworld});
const request={version:1,seed:104729,actId:'BENCHMARK_CONTEXT',patternId:'LOCATE_EVACUATE'};
const fresh=()=>({pack:read('mission-author/catalogs'),context:read('mission-author/context'),templates:read('mission-author/skeletons')});
const run=(data,r=request)=>composeSkeleton(r,data.pack,data.context,registry,data.templates);
function validator(data,r=request){const pack=validateCatalogs(data.pack,registry),context=validateContext(data.context,registry),templates=validateSkeletons(data.templates,pack),foundation=composeFoundation(r,data.pack,data.context,registry);return draft=>validateDraft(draft,{foundation,pack,context,templates,registry});}
test('skeleton connects a 4–8 Stage graph and preserves real role identities and locations',()=>{
 const data=fresh(),before=structuredClone(data),result=run(data);assert.equal(result.status,'COMPOSED');const d=result.draft;
 assert(d.stages.length>=4&&d.stages.length<=8);assert.equal(d.entryStageId,'stage-gate-yard');assert.equal(d.exitStageId,d.entryStageId);assert.deepEqual(d.roles,[{roleId:'SUBJECT',instanceId:'operative-01',stageId:'stage-holding-area'}]);
 assert(d.stages.find(s=>s.stageId==='stage-holding-area').purposeIds.includes('PRIMARY_SUBJECT'));assert(d.stages.every(s=>s.sourceStageId===s.stageId));assert(d.transitions.every(e=>e.accessStatus==='UNRESOLVED'));assert.equal(d.objectives[1].intent,'EVACUATE');assert.deepEqual(d.objectives[1].after,['locate-subject']);assert(d.factSockets.every(f=>f.truth===null&&f.status==='UNRESOLVED'));
 assert.deepEqual(validator(data)(d),d);assert.deepEqual(data,before);assert(Object.isFrozen(d.stages));assert.equal(d.recipes,undefined);assert.equal(d.dialogueScenes,undefined);assert.equal(d.knowledge,undefined);
});
test('all supported structural patterns produce purpose-first objective skeletons',()=>{
 for(const patternId of ['LOCATE_EVACUATE','INVESTIGATE','RECOVER']){
  const data=fresh(),r={...request,patternId};if(patternId==='RECOVER'){r.hookId='ARTIFACT_REPORT';data.context.knownFacts.push('lab-device-characterized');}
  const result=run(data,r);assert.equal(result.status,'COMPOSED',result.reason);assert.deepEqual(validator(data,r)(result.draft),result.draft);
  if(patternId==='INVESTIGATE')assert(result.draft.roles.some(r=>r.instanceId==='evidence-archive-01'&&r.stageId==='stage-overseer-office'));
  if(patternId==='RECOVER'){assert.equal(result.draft.roles[0].instanceId,'lab-mounted-rifle-01');assert.equal(result.draft.stages.find(s=>s.stageId==='stage-analysis-lab').environmentId,'LABORATORY');assert(!data.context.knownFacts.includes('ELECTROMAGNETIC_ACCELERATION_II'));}
 }
});
test('seeded graph varies valid selections without changing required identities or mutating Reality',()=>{
 const data=fresh(),graphs=new Set();
 for(let seed=0;seed<30;seed++){const r={...request,seed},result=run(data,r);assert.equal(result.status,'COMPOSED',result.reason);validator(data,r)(result.draft);assert.equal(result.draft.roles[0].instanceId,'operative-01');graphs.add(result.draft.stages.map(s=>s.stageId).join(','));}
 assert(graphs.size>1);assert.equal(registry.tables.missionInstance['operative-01'].stageId,'stage-holding-area');
});
test('catalog/context order does not alter the full Draft or trace',()=>{
 const data=fresh(),before=run(data);for(const c of Object.values(data.pack.catalogs))c.rows.reverse();data.context.knownFacts.reverse();data.context.destinations[0].roleBindings.reverse();data.context.destinations[0].stageBindings.reverse();for(const b of data.context.destinations[0].stageBindings){b.purposeIds.reverse();b.environmentIds.reverse();}data.templates.patterns.reverse();
 assert.deepEqual(run(data),before);
});
test('missing templates or Stage bindings produce useful unresolved output without creating content',()=>{
 for(const mutate of [d=>d.templates.patterns=[],d=>delete d.context.destinations[0].stageBindings,d=>d.context.destinations[0].stageBindings=d.context.destinations[0].stageBindings.filter(b=>b.stageId!=='stage-holding-area')]){
  const data=fresh();mutate(data);const before=structuredClone(data),result=run(data);assert.equal(result.status,'UNRESOLVED');assert.equal(result.draft,null);assert(result.reason);assert.deepEqual(data,before);
 }
});
test('purpose/environment Act incompatibility rejects required rooms rather than relocating the subject',()=>{
 for(const mutate of [d=>d.context.destinations[0].stageBindings.find(b=>b.stageId==='stage-holding-area').environmentIds=['LABORATORY'],d=>d.pack.catalogs.ENVIRONMENT_ROLE_CATALOG.rows.find(r=>r.id==='MEDICAL').actAvailability['*']='FORBIDDEN',d=>d.pack.catalogs.STAGE_PURPOSE_CATALOG.rows.find(r=>r.id==='PRIMARY_SUBJECT').actAvailability['*']='FORBIDDEN']){
  const data=fresh();mutate(data);const result=run(data);assert.equal(result.status,'UNRESOLVED');assert.equal(result.draft,null);assert(result.trace.decisions.some(d=>d.candidates?.some(c=>c.reasons?.length)));
 }
});
test('filler purposes require an admitted compatible environment before selection',()=>{
 const data=fresh();const binding=data.context.destinations[0].stageBindings.find(b=>b.stageId==='stage-main-hall');binding.purposeIds=['TRANSIT','SUPPORTING_CLUE'];
 const env=data.pack.catalogs.ENVIRONMENT_ROLE_CATALOG.rows.find(r=>r.id==='ADMINISTRATIVE');env.links.STAGE_PURPOSE_CATALOG=env.links.STAGE_PURPOSE_CATALOG.filter(id=>id!=='SUPPORTING_CLUE');
 for(let seed=0;seed<8;seed++){const result=run(data,{...request,seed});assert.equal(result.status,'COMPOSED',result.reason);assert.deepEqual(result.draft.stages.find(s=>s.stageId==='stage-main-hall').purposeIds,['TRANSIT']);}
});
test('disconnected or oversized required source routes fail with explicit graph diagnostics',()=>{
 const data=fresh();data.context.destinations[0].stageBindings=data.context.destinations[0].stageBindings.filter(b=>!['stage-processing','stage-security-hall'].includes(b.stageId));const result=run(data,{...request,patternId:'INVESTIGATE'});assert.equal(result.status,'UNRESOLVED');assert.match(result.reason,/No authored route/);
 const bounded=fresh();bounded.templates.patterns.find(p=>p.patternId==='INVESTIGATE').stageRange={min:4,max:4};const tooLarge=run(bounded,{...request,patternId:'INVESTIGATE'});assert.equal(tooLarge.status,'UNRESOLVED');assert.match(tooLarge.reason,/maximum/);
});
test('a supplied current Stage is preserved instead of resetting the NPC to its initial room',()=>{
 const data=fresh();data.context.destinations[0].instanceStates={'operative-01':{currentStageId:'stage-processing',custody:'LOCAL'}};const result=run(data);assert.equal(result.status,'COMPOSED');assert.equal(result.draft.roles[0].stageId,'stage-processing');assert.equal(registry.tables.missionInstance['operative-01'].stageId,'stage-holding-area');
 data.context.destinations[0].instanceStates['operative-01'].currentStageId='not-a-stage';assert.throws(()=>run(data),/unknown current Stage/);
});
test('unresolved foundations never continue into graph or objective generation',()=>{
 const data=fresh();data.context.knownFacts=[];const result=run(data);assert.equal(result.status,'UNRESOLVED');assert.equal(result.draft,null);assert(!result.trace.decisions.some(d=>d.family.startsWith('graph-route:')));
});
test('template validation rejects malformed sockets, cycles, stage ranges and exact-room overrides',()=>{
 for(const mutate of [d=>d.templates.patterns=[null],d=>d.templates.patterns[0].stageRange.max=9,d=>d.templates.patterns[0].requiredPurposeIds={},d=>delete d.templates.patterns[0].rolePurposes.SUBJECT,d=>d.templates.patterns[0].objectives[0].after=['evacuate-subject'],d=>d.templates.patterns[0].objectives[0].factRoleId='MADE_UP',d=>d.templates.patterns[0].roomId='stage-holding-area',d=>d.templates.patterns[0].objectives[0].effects=[{type:'GRANT_THEORY'}],d=>d.templates.patterns.push(d.templates.patterns[0])]){
  const data=fresh();mutate(data);assert.throws(()=>run(data),/MISSION AUTHOR VALIDATION ERROR/);
 }
});
test('Draft validation rejects forged locations, identities, links, objectives, facts and execution fields',()=>{
 const data=fresh(),draft=run(data).draft,validate=validator(data);
 for(const mutate of [d=>d.roles[0].stageId='stage-outer-yard',d=>d.roles[0].instanceId='worker-yard-01',d=>d.roles=[],d=>d.stages.push(d.stages[0]),d=>d.stages[0].sourceStageId='different-room',d=>d.stages[0].environmentId='invented-environment',d=>d.stages[0].purposeIds={},d=>d.transitions=[],d=>d.transitions[0].toStageId='stage-hidden-safe',d=>d.objectives[1].after=[],d=>d.factSockets[0].truth='SECRET_IDENTITY',d=>d.recipes=[]]){
  const modified=structuredClone(draft);mutate(modified);assert.throws(()=>validate(modified),/MISSION AUTHOR VALIDATION ERROR/);
 }
 const malformed=structuredClone(draft);malformed.stages.find(s=>s.stageId===malformed.roles[0].stageId).purposeIds={};assert.throws(()=>validate(malformed),/MISSION AUTHOR VALIDATION ERROR/);
});
