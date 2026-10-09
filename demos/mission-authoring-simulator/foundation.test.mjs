import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {FAMILIES,STREAMS,validateRequest} from '../shared/mission-author/contracts.mjs';
import {validateCatalogs} from '../shared/mission-author/catalogs.mjs';
import {createAuthorityRegistry,validateContext,theoryGuidance} from '../shared/mission-author/adapters.mjs';
import {composeFoundation,catalogCandidates} from '../shared/mission-author/selection.mjs';
import {namedRandom,chooseWeighted,canonical} from '../shared/mission-author/determinism.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
const offworld=read('offworld/archetypes'),items=read('item');
const mission=compileMission(read('offworld/missing-operative-001.finalized'),{...offworld,itemDefinitions:items});
const registry=createAuthorityRegistry({theoryPack:read('theory/stargate_theory_simulator_import'),professions:read('base-classes'),items,physicalInstances:read('instance'),mission,offworld});
const request={version:1,seed:104729,actId:'BENCHMARK_CONTEXT'};
const fresh=()=>({pack:read('mission-author/catalogs'),context:read('mission-author/context')});
const row=(p,f,id)=>p.catalogs[f].rows.find(r=>r.id===id);
const run=(p,c,r=request)=>composeFoundation(r,p,c,registry);
test('all 17 authored catalog families validate against actual shared references',()=>{
 const {pack}=fresh(),validated=validateCatalogs(pack,registry);
 assert.equal(Object.keys(validated.catalogs).length,17);assert.deepEqual(Object.keys(validated.catalogs),FAMILIES);assert(Object.values(validated.catalogs).every(c=>c.rows.length));assert(Object.isFrozen(validated.indexes.MISSION_HOOK_CATALOG.MISSING_PERSON));
});
test('foundation composes hook, pattern and actual local roles without writing a mission or granting Knowledge',()=>{
 const {pack,context}=fresh(),before=structuredClone({pack,context}),result=run(pack,context);
 assert.equal(result.status,'COMPOSED');assert.equal(result.selection.destinationId,mission.mission.destinationId);assert.equal(result.selection.hookId,'MISSING_PERSON');assert(['LOCATE_EVACUATE','INVESTIGATE'].includes(result.selection.patternId));assert.equal(result.selection.roleBindings.SUBJECT,'operative-01');
 assert.equal(result.stages,undefined);assert.equal(result.recipes,undefined);assert.deepEqual({pack,context},before);assert(!context.knownFacts.includes('ELECTROMAGNETIC_ACCELERATION_II'));assert(Object.isFrozen(result));assert(result.trace.warnings.some(w=>w.includes('curricula')));
});
test('same seed/state/versions produces identical output, independent of JSON and catalog ordering',()=>{
 const {pack,context}=fresh(),first=run(pack,context);assert.deepEqual(run(pack,context),first);
 const reordered=JSON.parse(JSON.stringify(pack,(key,value)=>value));
 for(const c of Object.values(reordered.catalogs))c.rows.reverse();reordered.catalogs=Object.fromEntries(Object.entries(reordered.catalogs).reverse());context.knownFacts.reverse();context.destinations[0].roleBindings.reverse();
 assert.deepEqual(run(reordered,context),first);assert.equal(canonical({b:1,a:2}),canonical({a:2,b:1}));
});
test('named random streams isolate draw counts and keys; changed seeds produce multiple valid choices',()=>{
 const identity={seed:42},expected=namedRandom(identity,'pattern')(),other=namedRandom(identity,'hook');for(let i=0;i<100;i++)other();assert.equal(namedRandom(identity,'pattern')(),expected);
 assert.equal(new Set(STREAMS.map(s=>namedRandom(identity,s)())).size,STREAMS.length);assert.notEqual(namedRandom(identity,'roles','SUBJECT')(),namedRandom(identity,'roles','GUARD')());
 const {pack,context}=fresh();assert.equal(new Set(Array.from({length:30},(_,seed)=>run(pack,context,{...request,seed}).selection.patternId)).size,2);
 assert.throws(()=>chooseWeighted([{id:'bad',weight:0}],()=>0),/positive/);assert.throws(()=>canonical({missing:undefined}),/JSON/);
});
test('Reality, Knowledge, actual role availability and archetype compatibility reject candidates',()=>{
 for(const mutate of [c=>c.destinations[0].realityFacts=[],c=>c.knownFacts=[],c=>c.destinations[0].roleBindings=c.destinations[0].roleBindings.filter(b=>b.roleId!=='SUBJECT'),c=>c.destinations[0].instanceStates={'operative-01':{custody:'RECOVERED_TO_SGC'}},c=>c.destinations[0].instanceStates={'operative-01':{combatState:'DEAD'}},c=>c.destinations[0].roleBindings.find(b=>b.roleId==='SUBJECT').instanceId='guard-yard-01']){
  const {pack,context}=fresh();mutate(context);const result=run(pack,context);assert.equal(result.status,'UNRESOLVED');assert.equal(result.selection,null);assert(result.trace.decisions.some(d=>d.candidates.some(r=>r.reasons?.length)));
 }
});
test('preferred rows never override semantic rejection; forbidden and restricted policies are explicit',()=>{
 const {pack,context}=fresh(),hook=row(pack,'MISSION_HOOK_CATALOG','MISSING_PERSON'),locate=row(pack,'MISSION_PATTERN_CATALOG','LOCATE_EVACUATE');
 locate.actAvailability['*']='PREFERRED';assert.equal(run(pack,context).selection.patternId,'LOCATE_EVACUATE');
 locate.requirements.knownFacts=['unknown-condition'];assert.equal(run(pack,context).selection.patternId,'INVESTIGATE');delete locate.requirements.knownFacts;
 hook.actAvailability['*']='RESTRICTED';assert.equal(run(pack,context).status,'UNRESOLVED');assert.equal(run(pack,context,{...request,allowRestricted:['MISSION_HOOK_CATALOG:MISSING_PERSON']}).status,'COMPOSED');
 hook.actAvailability['*']='FORBIDDEN';assert.equal(run(pack,context,{...request,allowRestricted:['MISSION_HOOK_CATALOG:MISSING_PERSON']}).status,'UNRESOLVED');
});
test('Act changes cannot override reality and role policies apply before assigning an Actor',()=>{
 const {pack,context}=fresh();assert.throws(()=>run(pack,context,{...request,actId:'OTHER_ACT'}),/does not match/);
 row(pack,'MISSION_ROLE_CATALOG','SUBJECT').actAvailability['*']='FORBIDDEN';const result=run(pack,context);assert.equal(result.status,'UNRESOLVED');assert(result.trace.decisions.some(d=>d.candidates.some(c=>c.reasons?.some(r=>r.includes('ACT_FORBIDDEN')))));
});
test('pinned selections reject incompatible composition instead of silently switching or repairing Reality',()=>{
 const {pack,context}=fresh(),before=structuredClone(context);const result=run(pack,context,{...request,hookId:'MISSING_PERSON',patternId:'RECOVER'});
 assert.equal(result.status,'UNRESOLVED');assert.deepEqual(context,before);assert(result.trace.decisions.some(d=>d.family.startsWith('patterns@')&&d.candidates.some(c=>c.reasons.includes('INCOMPATIBLE_COMPOSITION'))));
});
test('hidden item Reality permits an authoring constraint but does not create Known identity',()=>{
 const {pack,context}=fresh(),hook=row(pack,'MISSION_HOOK_CATALOG','ARTIFACT_REPORT');context.knownFacts.push('lab-device-characterized');hook.requirements.realityTheories=['ELECTROMAGNETIC_ACCELERATION_II'];
 const result=run(pack,context,{...request,hookId:'ARTIFACT_REPORT'});assert.equal(result.status,'COMPOSED');assert.equal(result.selection.roleBindings.RECOVERY_OBJECT,'lab-mounted-rifle-01');assert.equal(registry.tables.missionInstance['lab-mounted-rifle-01'].initialState.physicalItem.knowledge.recognizedIdentity,null);
 assert(!context.knownFacts.includes('ELECTROMAGNETIC_ACCELERATION_II'));hook.requirements.realityTheories=['PULSED_POWER_II'];assert.equal(run(pack,context,{...request,hookId:'ARTIFACT_REPORT'}).status,'UNRESOLVED');
});
test('missing Theory guidance stays unresolved and base Profession identity is not a curriculum',()=>{
 assert.equal(theoryGuidance(registry,'PULSED_POWER_I').status,'UNRESOLVED');assert.equal(theoryGuidance(registry,'not-authored').status,'UNRESOLVED');assert(registry.tables.profession.scientist);assert(registry.warnings.some(w=>w.includes('campaign')));assert.equal(registry.tables.theory.SC1,undefined);
});
test('malformed rows and unknown authority/catalog links report validation errors',()=>{
 for(const mutate of [p=>delete p.catalogs.EVENT_CATALOG,p=>p.catalogs.EXTRA={version:1,rows:[]},p=>p.catalogs.MISSION_HOOK_CATALOG.rows.push(p.catalogs.MISSION_HOOK_CATALOG.rows[0]),p=>p.catalogs.MISSION_HOOK_CATALOG.rows[0]=null,p=>row(p,'MISSION_HOOK_CATALOG','MISSING_PERSON').weight=NaN,p=>row(p,'MISSION_HOOK_CATALOG','MISSING_PERSON').refs=[{kind:'item',id:'MADE_UP'}],p=>row(p,'MISSION_HOOK_CATALOG','MISSING_PERSON').refs=[{kind:'constructor',id:'prototype'}],p=>row(p,'MISSION_HOOK_CATALOG','MISSING_PERSON').links.MISSION_PATTERN_CATALOG=['MADE_UP'],p=>row(p,'MISSION_HOOK_CATALOG','MISSING_PERSON').requirements.roles={},p=>row(p,'MISSION_HOOK_CATALOG','MISSING_PERSON').requirements.realityTheories=['MADE_UP'],p=>row(p,'MISSION_HOOK_CATALOG','MISSING_PERSON').actAvailability={'*':'MAYBE'},p=>row(p,'MISSION_HOOK_CATALOG','MEDICAL_OUTBREAK').unavailableReason='',p=>row(p,'MISSION_ROLE_CATALOG','SUBJECT').requirements.roles=['SUBJECT']]){
  const {pack}=fresh();mutate(pack);assert.throws(()=>validateCatalogs(pack,registry),/MISSION AUTHOR VALIDATION ERROR/);
 }
});
test('malformed requests/contexts and unsupported destinations fail before selection',()=>{
 for(const r of [null,{...request,version:0},{...request,seed:undefined},{...request,unexpected:true},{...request,allowRestricted:['invented']}]){const {pack,context}=fresh();assert.throws(()=>run(pack,context,r),/VALIDATION/);}
 for(const mutate of [c=>c.actId='',c=>c.destinations[0].id='unregistered-destination',c=>c.destinations[0].roleBindings[0].instanceId='unregistered-instance',c=>c.destinations[0].roleBindings[0]=null,c=>c.destinations[0].roleBindings.push(c.destinations[0].roleBindings[0]),c=>c.destinations[0].instanceStates={'unknown':{}},c=>c.destinations[0].roleBindings[0].roleId='NOT_A_ROLE']){
  const {pack,context}=fresh();mutate(context);assert.throws(()=>run(pack,context),/MISSION AUTHOR VALIDATION ERROR/);
 }
 assert.equal(validateRequest({...request,patternId:'unknown'}).patternId,'unknown');const {pack,context}=fresh();assert.throws(()=>run(pack,context,{...request,patternId:'unknown'}),/unknown requested/);
});

test('shared filtering applies to Incident families and invalid physical snapshots cannot replace Reality',()=>{
 const {pack,context}=fresh(),validated=validateCatalogs(pack,registry),validatedRequest=validateRequest(request);
 context.destinations[0].roleBindings=context.destinations[0].roleBindings.filter(b=>b.roleId!=='HAZARD_SOURCE');const snapshot=validateContext(context,registry),inputs={request:validatedRequest,context:snapshot,destination:snapshot.destinations[0],registry,pack:validated};
 const candidates=catalogCandidates(validated,'INCIDENT_CATALOG',inputs);assert(candidates.find(c=>c.id==='RADIATION_LEAK').reasons.some(r=>r.includes('HAZARD_SOURCE')));assert.equal(candidates.find(c=>c.id==='HOSTILE_CHECKPOINT').reasons.length,0);
 context.destinations[0].instanceStates={'lab-mounted-rifle-01':{physicalItem:{reality:{technology:['PULSED_POWER_II']}}}};assert.throws(()=>run(pack,context),/physical instance identity/);
});
test('empty candidate pools return an explicit diagnostic and authority identity collisions fail',()=>{
 const {pack,context}=fresh();context.destinations=[];const result=run(pack,context);assert.equal(result.status,'UNRESOLVED');assert.equal(result.trace.decisions.at(-1).family,'destinations');assert.deepEqual(result.trace.decisions.at(-1).candidates,[]);
 assert.throws(()=>createAuthorityRegistry({theoryPack:{theories:[{id:'DUP'},{id:'DUP'}]},professions:[],items:{},physicalInstances:{},mission,offworld}),/duplicate/);
});

test('incapacitation does not erase a physically present mission subject',()=>{
 const {pack,context}=fresh();context.destinations[0].instanceStates={'operative-01':{combatState:'DOWN',custody:'LOCAL'}};const result=run(pack,context,{...request,patternId:'LOCATE_EVACUATE'});assert.equal(result.status,'COMPOSED');assert.equal(result.selection.roleBindings.SUBJECT,'operative-01');
 // Structural role presence is separate from eligibility to act or converse.
});
