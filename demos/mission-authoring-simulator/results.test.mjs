import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createAuthorityRegistry,validateContext} from '../shared/mission-author/adapters.mjs';
import {validateCatalogs} from '../shared/mission-author/catalogs.mjs';
import {composeResults,validateResults,validateResultDraft} from '../shared/mission-author/results.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
const offworld=read('offworld/archetypes'),items=read('item'),mission=compileMission(read('offworld/missing-operative-001.finalized'),{...offworld,itemDefinitions:items});
const registry=createAuthorityRegistry({theoryPack:read('theory/stargate_theory_simulator_import'),professions:read('base-classes'),items,physicalInstances:read('instance'),mission,offworld});
const request={version:1,seed:104729,actId:'BENCHMARK_CONTEXT',patternId:'LOCATE_EVACUATE'};
const fresh=()=>Object.fromEntries(['catalogs','context','skeletons','information','dynamics','results'].map(k=>[{catalogs:'pack',skeletons:'templates'}[k]??k,read(`mission-author/${k}`)]));
const run=(d,r=request,reg=registry)=>composeResults(r,d.pack,d.context,reg,d.templates,d.information,d.dynamics,d.results);
const recover=d=>{d.context.knownFacts.push('lab-device-characterized');return {...request,patternId:'RECOVER',hookId:'ARTIFACT_REPORT'};};
function validator(d,draft,r=request,reg=registry){const pack=validateCatalogs(d.pack,reg),context=validateContext(d.context,reg),results=validateResults(d.results,pack,reg);return result=>validateResultDraft(result,{dynamic:draft.dynamic,pack,context,registry:reg,request:{...r,allowRestricted:r.allowRestricted??[]},results});}
const candidates=result=>result.trace.decisions.find(d=>d.family==='opportunities:candidates').candidates;
test('operative is a mission evacuee with original identity, not a Holding admission',()=>{
 const d=fresh(),before=structuredClone(d),regBefore=JSON.stringify(registry),result=run(d);assert.equal(result.status,'COMPOSED',result.reason);const r=result.draft.recoveryIntents.find(r=>r.instanceId==='operative-01');
 assert.equal(r.recoveryRoleId,'MISSION_EVACUEE');assert.equal(r.destination,'GATE');assert.equal(r.capacity.owner,'MISSION_EVACUATION');assert.equal(r.transportStatus,'UNRESOLVED');assert.equal(r.capacity.status,'PENDING_SHARED_ADMISSION');assert.equal(r.methods[0].requiresGateRoute,true);assert.equal(r.methods[0].sourceMethodId,'extract-operative');assert.equal(r.physicalItem,null);
 assert.deepEqual(d,before);assert.equal(JSON.stringify(registry),regBefore);assert.deepEqual(validator(d,result.draft)(result.draft),result.draft);assert(Object.isFrozen(result.draft));
});
test('primary device uses authored preparation and item costs without exposing institutional Knowledge',()=>{
 const d=fresh(),request=recover(d),result=run(d,request);assert.equal(result.status,'COMPOSED',result.reason);const r=result.draft.recoveryIntents.find(r=>r.instanceId==='lab-mounted-rifle-01');
 assert.equal(r.destination,'RECEIVING');assert.equal(r.preparationRequired,true);assert.equal(r.handlingCost.value,items.ASGARD_EM_RIFLE.storage.handlingCost);assert.equal(r.handlingCost.source,'SHARED_ITEM_DEFINITIONS');assert.deepEqual(r.methods.map(m=>m.sourceMethodId),['detach-lab-device','secure-lab-device']);assert.equal(r.physicalItem.instanceId,r.instanceId);assert.equal(r.physicalItem.state.mountState,'MOUNTED');assert.equal(r.physicalItem.knowledge.recognizedIdentity,null);
 assert(!result.draft.opportunities.some(o=>o.instanceId===r.instanceId));assert(!d.context.knownFacts.includes('ELECTROMAGNETIC_ACCELERATION_II'));assert(result.draft.consequences.filter(c=>c.catalogId==='KNOWLEDGE').every(c=>c.intent.institutionalUnlock===false));validator(d,result.draft,request)(result.draft);
});
test('current physical quantity and findings survive into cost intent without changing custody',()=>{
 const d=fresh(),r=recover(d),item=structuredClone(registry.tables.missionInstance['lab-mounted-rifle-01'].initialState.physicalItem);item.state.quantity=2;item.knowledge.instanceFindings.push('LAB_DEVICE_PULSE_CHARACTERIZED');d.context.destinations[0].instanceStates={'lab-mounted-rifle-01':{physicalItem:item}};
 const result=run(d,r);assert.equal(result.status,'COMPOSED',result.reason);const intent=result.draft.recoveryIntents.find(r=>r.instanceId===item.instanceId);assert.equal(intent.handlingCost.value,2*items.ASGARD_EM_RIFLE.storage.handlingCost);assert.deepEqual(intent.physicalItem,item);assert.equal(intent.physicalItem.custody.storageId,'stage-analysis-lab');assert.equal(intent.capacity.status,'PENDING_SHARED_ADMISSION');
});
test('optional selections cover Receiving, portable party cargo and Holding with separate owners',()=>{
 const d=fresh(),request=recover(d),roles=new Set(),seen=new Set();
 for(let seed=0;seed<35;seed++){const r={...request,seed},result=run(d,r);assert.equal(result.status,'COMPOSED',result.reason);assert(result.draft.opportunities.length<=2);validator(d,result.draft,r)(result.draft);
  for(const intent of result.draft.recoveryIntents){assert(!seen.has(`${seed}:${intent.instanceId}`));seen.add(`${seed}:${intent.instanceId}`);roles.add(intent.recoveryRoleId);assert.equal(intent.applicationStatus,'NOT_APPLIED');assert.equal(intent.capacity.status,'PENDING_SHARED_ADMISSION');if(intent.recoveryRoleId==='PARTY_STORAGE'){assert.equal(intent.destination,'PARTY_STORAGE');assert.equal(intent.capacity.owner,'SHARED_PARTY_STORAGE');assert.equal(intent.handlingCost.value,null);}if(intent.recoveryRoleId==='HOLDING'){assert.equal(intent.destination,'HOLDING');assert.equal(intent.physicalItem,null);assert.equal(intent.handlingCost.value,null);}}
 }assert(roles.has('RECEIVING'));assert(roles.has('HOLDING'));assert(roles.has('PARTY_STORAGE'));
});
test('reordering result bindings preserves Draft/trace; result revisions and pools leave upstream stable',()=>{
 const d=fresh(),before=run(d);for(const key of ['requiredRecovery','opportunities','consequences'])d.results[key].reverse();assert.deepEqual(run(d),before);
 d.results.opportunities=[];assert.deepEqual(run(d).draft.dynamic,before.draft.dynamic);assert.equal(run(d).draft.opportunities.length,0);d.results.version++;assert.deepEqual(run(d).draft.dynamic,before.draft.dynamic);
});
test('unavailable subjects, mismatched methods and unsupported recovery roles reject candidate paths',()=>{
 const d=fresh();d.context.destinations[0].instanceStates={'lab-report-01':{custody:'PARTY_STORAGE'},'supply-cache-01':{custody:'RECOVERED_TO_SGC'}};const result=run(d);assert(candidates(result).filter(c=>['lab-report-cargo','supply-recovery'].includes(c.id)).every(c=>c.reasons.includes('SUBJECT_UNAVAILABLE')));
 const wrong=fresh();wrong.results.opportunities.find(o=>o.id==='archive-recovery').methodIds=['collect-supply-cache'];assert(candidates(run(wrong)).find(c=>c.id==='archive-recovery').reasons.some(r=>r.startsWith('METHOD_SUBJECT_MISMATCH')));
 const missing=fresh();missing.results.requiredRecovery=[];assert.equal(run(missing).status,'UNRESOLVED');
});
test('missing physical state/handling metadata and incompatible capacity routing cannot be papered over',()=>{
 const d=fresh(),r=recover(d),reg=structuredClone(registry);delete reg.tables.item.ASGARD_EM_RIFLE.storage.handlingCost;const result=run(d,r,reg);assert.equal(result.status,'UNRESOLVED');assert(result.trace.decisions.at(-1).candidates.some(c=>c.reasons.includes('AUTHORED_ITEM_HANDLING_COST_MISSING')));
 const wrong=fresh();wrong.results.requiredRecovery[0].recoveryRoleId='HOLDING';assert.equal(run(wrong).status,'UNRESOLVED');
 const unsupported=fresh();unsupported.results.requiredRecovery[0].recoveryRoleId='DOCUMENT';assert.equal(run(unsupported).status,'UNRESOLVED');
});
test('Act policy covers optional opportunities, required recovery and prospective consequences',()=>{
 const d=fresh();d.pack.catalogs.OPTIONAL_OPPORTUNITY_CATALOG.rows[0].actAvailability['*']='FORBIDDEN';const result=run(d);assert.equal(result.draft.opportunities.length,0);assert(candidates(result).every(c=>c.reasons.includes('ACT_FORBIDDEN')));
 d.pack.catalogs.RECOVERY_ROLE_CATALOG.rows.find(r=>r.id==='MISSION_EVACUEE').actAvailability['*']='FORBIDDEN';assert.equal(run(d).status,'UNRESOLVED');
 const noConsequences=fresh();for(const c of noConsequences.pack.catalogs.CONSEQUENCE_TYPE_CATALOG.rows)c.actAvailability['*']='FORBIDDEN';assert.deepEqual(run(noConsequences).draft.consequences,[]);
});
test('consequences preserve real subjects and conditional source effects; no state is applied',()=>{
 const d=fresh();let draft;for(let seed=0;seed<40;seed++){const result=run(d,{...request,seed});if(result.draft.consequences.some(c=>c.catalogId==='NPC_STATE')){draft=result.draft;break;}}assert(draft);
 for(const c of draft.consequences){assert.equal(c.applicationStatus,'NOT_APPLIED');assert(registry.tables.missionInstance[c.instanceId]);if(c.catalogId==='NPC_STATE'){assert.equal(registry.tables.missionInstance[c.instanceId].mapGlyph,'PERSON');assert(c.intent.effects.length);assert.equal(c.intent.requiresSourceCompletion,true);}}
 assert.equal(registry.tables.missionInstance['mcguffin-01'].initialState.combatState,mission.instances.find(i=>i.instanceId==='mcguffin-01').initialState.combatState);
});
test('malformed/forged result bindings and Draft identity, cost, admission or unlocks fail',()=>{
 for(const mutate of [d=>d.results.opportunities=[null],d=>d.results.opportunities[0].instanceId='imaginary-item',d=>d.results.requiredRecovery[0].methodIds=['new-recipe'],d=>d.results.opportunities.push(d.results.opportunities[0]),d=>d.results.consequences[0].from='APPLY_KNOWLEDGE',d=>d.results.requiredRecovery[0].effects=[]]){const d=fresh();mutate(d);assert.throws(()=>run(d),/MISSION AUTHOR VALIDATION ERROR/);}
 const d=fresh(),r=recover(d),draft=run(d,r).draft,validate=validator(d,draft,r);for(const mutate of [d=>d.recoveryIntents[0].instanceId='clone',d=>d.recoveryIntents[0].handlingCost.value=0,d=>d.recoveryIntents[0].capacity.status='ADMITTED',d=>d.recoveryIntents.find(r=>r.physicalItem).physicalItem.knowledge.recognizedIdentity='ASGARD_EM_RIFLE',d=>d.consequences[0].applicationStatus='APPLIED',d=>d.knowledge=['ELECTROMAGNETIC_ACCELERATION_II'],d=>d.dynamic.information.facts=[]]){const bad=structuredClone(draft);mutate(bad);assert.throws(()=>validate(bad),/MISSION AUTHOR VALIDATION ERROR/);}
});
