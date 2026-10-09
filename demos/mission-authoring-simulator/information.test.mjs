import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createAuthorityRegistry,validateContext} from '../shared/mission-author/adapters.mjs';
import {validateCatalogs} from '../shared/mission-author/catalogs.mjs';
import {composeSkeleton} from '../shared/mission-author/skeleton.mjs';
import {composeInformation,validateInformation,validateInformationDraft,projectInformationKnowledge} from '../shared/mission-author/information.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
function registryFor(mutate=()=>{}){
 const offworld=read('offworld/archetypes'),items=read('item'),mission=compileMission(read('offworld/missing-operative-001.finalized'),{...offworld,itemDefinitions:items});
 const registry=structuredClone(createAuthorityRegistry({theoryPack:read('theory/stargate_theory_simulator_import'),professions:read('base-classes'),items,physicalInstances:read('instance'),mission,offworld}));mutate(registry);return registry;
}
const registry=registryFor(),request={version:1,seed:104729,actId:'BENCHMARK_CONTEXT',patternId:'LOCATE_EVACUATE'};
const fresh=()=>({pack:read('mission-author/catalogs'),context:read('mission-author/context'),templates:read('mission-author/skeletons'),information:read('mission-author/information')});
const run=(d,r=request,reg=registry)=>composeInformation(r,d.pack,d.context,reg,d.templates,d.information);
const recover=d=>{d.context.knownFacts.push('lab-device-characterized');return {...request,patternId:'RECOVER',hookId:'ARTIFACT_REPORT'};};
function validator(d,r=request,reg=registry){
 const pack=validateCatalogs(d.pack,reg),context=validateContext(d.context,reg),information=validateInformation(d.information,pack,reg),skeleton=composeSkeleton(r,d.pack,d.context,reg,d.templates).draft;
 return draft=>validateInformationDraft(draft,{skeleton,pack,context,registry:reg,request:{...r,allowRestricted:r.allowRestricted??[]},information});
}
test('Fact truth and learning path preserve identity and remain separate from Known state',()=>{
 const d=fresh(),before=structuredClone(d),result=run(d);assert.equal(result.status,'COMPOSED',result.reason);const draft=result.draft;
 assert.deepEqual(draft.facts[0].truth,{kind:'CURRENT_STAGE',instanceId:'operative-01',stageId:'stage-holding-area'});assert.equal(draft.facts[0].visibility,'AUTHOR_ONLY');
 assert.equal(draft.clues[0].instanceId,'operative-01');assert.equal(draft.clues[0].knowledgeId,'operative-located');assert.equal(draft.interactions[0].executionStatus,'UNRESOLVED');assert.equal(draft.skeleton.factSockets[0].truth,null);assert.deepEqual(validator(d)(draft),draft);assert.deepEqual(d,before);assert(Object.isFrozen(draft.clues[0]));
 assert.deepEqual(projectInformationKnowledge(draft,d.context.knownFacts).knownClues,[]);
 assert.deepEqual(projectInformationKnowledge(draft,['operative-located']).knownClues,[{knowledgeId:'operative-located'}]);
});
test('all benchmark patterns have genuine source-backed paths without inventing an archive clue',()=>{
 for(const patternId of ['LOCATE_EVACUATE','INVESTIGATE','RECOVER']){
  const d=fresh(),r=patternId==='RECOVER'?recover(d):{...request,patternId},result=run(d,r);assert.equal(result.status,'COMPOSED',result.reason);validator(d,r)(result.draft);
  if(patternId==='INVESTIGATE')assert.equal(result.draft.clues[0].instanceId,'operative-01');
  if(patternId==='RECOVER'){
   const f=result.draft.facts[0];assert.deepEqual(f.truth,{kind:'REALITY_TAG',instanceId:'lab-mounted-rifle-01',tag:'WEAPON'});
   assert.equal(result.draft.interactions[0].professionId,'soldier');assert.equal(result.draft.clues[0].source.id,'obs-lab-tactical-role');
   assert(result.draft.interactions[0].missingKnownPrerequisites.includes('lab-search-completed'));assert(result.draft.interactions[0].prerequisiteSources[0].producers.length);
   assert.equal(result.draft.clues[0].prerequisites.sourceStateRequirement.factId,'lab-search-completed');
   const projection=JSON.stringify(projectInformationKnowledge(result.draft,['lab-device-tactical-role-known']));for(const hidden of ['ASGARD','WEAPON','ELECTROMAGNETIC_ACCELERATION_II','lab-mounted-rifle-01'])assert(!projection.includes(hidden));
  }
 }
});
test('missing guidance/curricula yields explicit unsupported derivation rather than Profession quotas',()=>{
 const d=fresh(),r=recover(d),draft=run(d,r).draft;assert.equal(draft.opportunityDerivation.status,'UNRESOLVED');assert(draft.opportunityDerivation.reasons.some(r=>r.includes('curricula')));assert(draft.opportunityDerivation.reasons.some(r=>r.includes('fieldGuidance')));
 assert.deepEqual(draft.interactions.map(i=>i.professionId),['soldier']);assert.equal(draft.interactions[0].status,'BENCHMARK_REFERENCE');assert(!d.context.knownFacts.includes('ELECTROMAGNETIC_ACCELERATION_II'));
});
test('reordered information/catalog inputs preserve Draft/trace and information revisions leave skeleton unchanged',()=>{
 const d=fresh(),before=run(d);d.information.facts.reverse();for(const f of d.information.facts)f.clues.reverse();for(const c of Object.values(d.pack.catalogs))c.rows.reverse();assert.deepEqual(run(d),before);
 d.information.version++;const next=run(d);assert.deepEqual(next.draft.skeleton,before.draft.skeleton);assert.notDeepEqual(next.trace.identity,before.trace.identity);
});
test('multiple seeds select only legitimate paths, and unreachable testimony falls back to observation',()=>{
 const d=fresh(),choices=new Set();for(let seed=0;seed<16;seed++){const result=run(d,{...request,seed});assert.equal(result.status,'COMPOSED');choices.add(result.draft.clues[0].clueId);}assert.equal(choices.size,2);
 d.context.destinations[0].instanceStates={'operative-01':{combatState:'DOWN'}};const result=run(d);assert.equal(result.status,'COMPOSED');assert.equal(result.draft.clues[0].source.kind,'missionObservation');
});
test('moved subjects retain Reality while fixed observations become invalid',()=>{
 const d=fresh();d.context.destinations[0].instanceStates={'operative-01':{currentStageId:'stage-processing'}};const result=run(d);assert.equal(result.status,'COMPOSED',result.reason);assert.equal(result.draft.facts[0].truth.stageId,'stage-processing');assert.equal(result.draft.clues[0].source.kind,'missionDialogue');
 d.information.facts[0].clues=d.information.facts[0].clues.filter(c=>c.source.kind==='missionObservation');const blocked=run(d);assert.equal(blocked.status,'UNRESOLVED');assert.match(blocked.reason,/learning path/);assert(blocked.trace.decisions.at(-1).candidates[0].reasons.includes('SOURCE_LOCATION_MISMATCH'));
});
test('missing bindings, absent Reality tags and invalid source facts reject composition',()=>{
 for(const mutate of [d=>d.information.facts=[],d=>d.information.facts[0].clues.forEach(c=>c.knowledgeId='made-up-knowledge'),d=>d.information.facts[0].subjectRoleId='WITNESS']){const d=fresh();mutate(d);assert.equal(run(d).status,'UNRESOLVED');}
 const d=fresh(),r=recover(d),reg=registryFor(reg=>{reg.tables.missionInstance['lab-mounted-rifle-01'].initialState.physicalItem.reality.authoredTags=[];});assert.equal(run(d,r,reg).status,'UNRESOLVED');
});
test('Act restrictions and unsupported Knowledge sources reject clues with clear explanations',()=>{
 const d=fresh();for(const row of d.pack.catalogs.CLUE_SOURCE_CATALOG.rows)row.actAvailability['*']='FORBIDDEN';assert.equal(run(d).status,'UNRESOLVED');assert(run(d).trace.decisions.at(-1).candidates.every(c=>c.reasons.includes('ACT_FORBIDDEN')));
 const other=fresh(),r=recover(other),reg=registryFor(reg=>reg.tables.missionObservation['obs-lab-tactical-role'].requiresKnowledge.push('unknown-scientific-principle'));const result=run(other,r,reg);assert.equal(result.status,'UNRESOLVED');assert(result.trace.decisions.at(-1).candidates[0].reasons.includes('UNSUPPORTED_KNOWLEDGE_PATH: unknown-scientific-principle'));
});
test('unrelated subjects, unsupported intents and source locations cannot masquerade as a clue',()=>{
 for(const mutate of [reg=>reg.tables.missionObservation['obs-operative-identity'].subjectInstanceId='worker-yard-01',reg=>reg.tables.missionObservation['obs-operative-identity'].stageId='stage-outer-yard']){
  const d=fresh();d.information.facts[0].clues=d.information.facts[0].clues.filter(c=>c.source.kind==='missionObservation');assert.equal(run(d,request,registryFor(mutate)).status,'UNRESOLVED');
 }
 const d=fresh();d.information.facts[0].clues.forEach(c=>c.intentId='RECOVER');assert.equal(run(d).status,'UNRESOLVED');
});
test('malformed information and forged Draft truth/method/Knowledge grant fail validation',()=>{
 for(const mutate of [d=>d.information.facts=[null],d=>d.information.facts[0].truth.kind='INVENT_THEORY',d=>d.information.facts[0].clues[0].source.id='unknown-source',d=>d.information.facts[0].clues[0].effects=[],d=>d.information.facts.push(d.information.facts[0])]){const d=fresh();mutate(d);assert.throws(()=>run(d),/MISSION AUTHOR VALIDATION ERROR/);}
 const d=fresh(),draft=run(d).draft,validate=validator(d);for(const mutate of [d=>d.facts[0].truth.stageId='stage-gate-yard',d=>d.facts=[],d=>d.clues[0].knowledgeId='advanced-theory',d=>d.interactions[0].professionId='scientist',d=>d.opportunityDerivation.status='DERIVED',d=>d.knowledge=['WEAPON'],d=>d.skeleton.roles[0].instanceId='clone']){const bad=structuredClone(draft);mutate(bad);assert.throws(()=>validate(bad),/MISSION AUTHOR VALIDATION ERROR/);}
 assert.throws(()=>projectInformationKnowledge(draft,null),/MISSION AUTHOR VALIDATION ERROR/);
});
