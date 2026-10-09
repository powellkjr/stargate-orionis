import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createAuthorityRegistry,validateContext} from '../shared/mission-author/adapters.mjs';
import {validateCatalogs} from '../shared/mission-author/catalogs.mjs';
import {composeDynamics,validateDynamics,validateDynamicDraft} from '../shared/mission-author/dynamics.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
const offworld=read('offworld/archetypes'),items=read('item'),mission=compileMission(read('offworld/missing-operative-001.finalized'),{...offworld,itemDefinitions:items});
const registry=createAuthorityRegistry({theoryPack:read('theory/stargate_theory_simulator_import'),professions:read('base-classes'),items,physicalInstances:read('instance'),mission,offworld});
const request={version:1,seed:104729,actId:'BENCHMARK_CONTEXT',patternId:'INVESTIGATE'};
const fresh=()=>({pack:read('mission-author/catalogs'),context:read('mission-author/context'),templates:read('mission-author/skeletons'),information:read('mission-author/information'),dynamics:read('mission-author/dynamics')});
const run=(d,r=request)=>composeDynamics(r,d.pack,d.context,registry,d.templates,d.information,d.dynamics);
function validator(d,base,r=request){const pack=validateCatalogs(d.pack,registry),context=validateContext(d.context,registry),dynamics=validateDynamics(d.dynamics,pack,registry);return draft=>validateDynamicDraft(draft,{information:base.information,pack,context,registry,request:{...r,allowRestricted:r.allowRestricted??[]},dynamics});}
const candidateRows=(result,group)=>result.trace.decisions.find(d=>d.family===`${group}:candidates`).candidates;
test('dynamic possibilities preserve source identity, information, bounds and lifecycle separation',()=>{
 const d=fresh(),before=structuredClone(d),result=run(d);assert.equal(result.status,'COMPOSED',result.reason);const draft=result.draft;
 assert(draft.incidents.length<=2);assert(draft.events.length<=3);assert(draft.complications.length<=2);assert.deepEqual(validator(d,draft)(draft),draft);assert.deepEqual(d,before);assert(Object.isFrozen(draft.information));
 for(const i of draft.incidents){const source=registry.tables.missionIncident[i.sourceIncidentId];assert.equal(i.stageId,source.stageId);assert.equal(i.executionStatus,'UNRESOLVED');assert.equal(i.lifecycle.restoration.status,'UNRESOLVED');assert.deepEqual(i.lifecycle.restoration.sources,[]);assert.equal(i.lifecycle.resolution.sourceIncidentId,i.sourceIncidentId);}
 assert(!d.context.knownFacts.includes('processing-radiation-hazard-confirmed'));assert.equal(draft.runtimeState,undefined);
});
test('seeded selection covers zero/multiple Incidents, both Events and actual complications',()=>{
 const d=fresh(),counts=new Set(),incidents=new Set(),events=new Set(),complications=new Set();
 for(let seed=0;seed<50;seed++){const r={...request,seed},result=run(d,r);assert.equal(result.status,'COMPOSED',result.reason);const draft=result.draft;validator(d,draft,r)(draft);counts.add(draft.incidents.length);for(const i of draft.incidents)incidents.add(i.catalogId);for(const e of draft.events){events.add(e.catalogId);assert(e.originIncidentIds.every(id=>draft.incidents.some(i=>i.sourceIncidentId===id)));}for(const c of draft.complications)complications.add(c.intent.kind);}
 assert.deepEqual([...counts].sort(),[0,1,2]);assert(incidents.has('MEDICAL_DETERIORATION'));assert(incidents.has('RADIATION_LEAK'));assert(incidents.has('HOSTILE_CHECKPOINT'));assert(events.has('GUARD_RAISES_ALARM'));assert(events.has('EVIDENCE_PURGE_BEGINS'));assert(complications.has('ACCESS_RESTRICTION'));assert(complications.has('TIME_PRESSURE'));
});
test('reordering bindings and lifecycle refs preserves output; Event pool changes leave other sections stable',()=>{
 const d=fresh(),before=run(d);for(const key of ['incidents','events','complications'])d.dynamics[key].reverse();for(const i of d.dynamics.incidents)for(const key of ['detectionRefs','investigationRefs','restorationRefs'])i[key].reverse();assert.deepEqual(run(d),before);
 d.dynamics.events=[];const next=run(d);assert.deepEqual(next.draft.incidents,before.draft.incidents);assert.deepEqual(next.draft.complications,before.draft.complications);assert.deepEqual(next.draft.information,before.draft.information);
 d.dynamics.version++;assert.deepEqual(run(d).draft.information,before.draft.information);
});
test('resolved/inactive hazards and absent or moved participants reject source Incidents',()=>{
 const d=fresh(),dest=d.context.destinations[0];dest.incidentStates={'incident-holding-medical':{state:'RESOLVED'}};dest.instanceStates={'radiation-source-01':{active:false},'guard-yard-01':{currentStageId:'stage-processing'}};
 const result=run(d),rows=candidateRows(result,'Incident');assert(rows.find(c=>c.id==='incident-holding-medical').reasons.includes('INCIDENT_ALREADY_RESOLVED'));assert(rows.find(c=>c.id==='incident-processing-radiation').reasons.includes('INCIDENT_STATE_REQUIREMENT_FAILED'));assert(rows.find(c=>c.id==='incident-yard-guards').reasons.some(r=>r.startsWith('SUBJECT_LOCATION_MISMATCH')));
 dest.instanceStates['guard-yard-01']={custody:'AT_GATE'};assert(candidateRows(run(d),'Incident').find(c=>c.id==='incident-yard-guards').reasons.some(r=>r.startsWith('SUBJECT_UNAVAILABLE')));
});
test('stabilized patients, cleared combat and unlocked doors are not invented again',()=>{
 const d=fresh(),dest=d.context.destinations[0];dest.instanceStates={};for(const id of ['patient-01','patient-02','patient-03'])dest.instanceStates[id]={condition:'STABILIZED'};
 for(const i of Object.values(registry.tables.missionIncident))if(i.kind==='COMBAT')for(const id of i.participantIds)dest.instanceStates[id]={combatState:'SURRENDERED'};
 dest.transitionStates=Object.fromEntries(d.dynamics.complications.filter(c=>c.sourceKind==='missionTransition').map(c=>[c.sourceId,{state:'OPEN'}]));dest.gateState={connection:'CLOSED',elapsedSeconds:0};
 const result=run(d);assert(candidateRows(result,'Incident').filter(c=>c.id!=='incident-processing-radiation').every(c=>c.reasons.length));assert.equal(result.draft.events.length,0);assert.equal(result.draft.complications.length,0);
});
test('Events preserve original conditions, effects and delay provenance without applying them',()=>{
 const d=fresh();let result;for(let seed=0;seed<50;seed++){const r=run(d,{...request,seed});if(r.draft.events.some(e=>e.catalogId==='EVIDENCE_PURGE_BEGINS')){result=r;break;}}assert(result);
 const e=result.draft.events.find(e=>e.catalogId==='EVIDENCE_PURGE_BEGINS');assert.equal(e.triggerIntent.provenance.length,3);assert.equal(e.triggerIntent.provenance[1].effects[0].delayMinutes,3);assert.equal(e.triggerIntent.provenance[0].conditions[0].type,'EVENT_STAGE_IN');assert.deepEqual(e.effectIntent,registry.tables.missionEventBinding[e.sourceBindingId].effects);assert.equal(registry.tables.missionInstance['evidence-archive-01'].initialState.evidenceState,'INTACT');assert.equal(e.executionStatus,'UNRESOLVED');
});
test('missing Event origins, out-of-map targets and impossible trigger chains report rejection',()=>{
 const d=fresh();d.dynamics.incidents=[];assert(candidateRows(run(d),'Event').every(c=>c.reasons.includes('NO_SELECTED_TRIGGER_ORIGIN')));
 const broken=fresh();broken.dynamics.events[1].prerequisiteBindingIds.reverse();assert(candidateRows(run(broken),'Event').find(c=>c.id==='evidence-purge-start').reasons.includes('BROKEN_TRIGGER_CHAIN'));
 const moved=fresh();moved.context.destinations[0].instanceStates={'evidence-archive-01':{currentStageId:'stage-gate-yard',custody:'AT_GATE'}};assert(candidateRows(run(moved,{...request,patternId:'LOCATE_EVACUATE'}),'Event').find(c=>c.id==='evidence-purge-start').reasons.some(r=>r.startsWith('SUBJECT_UNAVAILABLE')));
});
test('Act restrictions reject all dynamic families and lifecycle references must fit the subject',()=>{
 const d=fresh();for(const family of ['INCIDENT_CATALOG','EVENT_CATALOG','COMPLICATION_CATALOG'])for(const row of d.pack.catalogs[family].rows)row.actAvailability['*']='FORBIDDEN';const result=run(d);assert.equal(result.status,'COMPOSED');assert.deepEqual([result.draft.incidents,result.draft.events,result.draft.complications],[[],[],[]]);for(const name of ['Incident','Event','optional opportunities'])assert(candidateRows(result,name).every(c=>c.reasons.includes('ACT_FORBIDDEN')));
 const wrong=fresh();wrong.dynamics.incidents[0].detectionRefs=[{kind:'missionObservation',id:'obs-processing-radiation'}];assert(candidateRows(run(wrong),'Incident').find(c=>c.id==='incident-holding-medical').reasons.includes('LIFECYCLE_SOURCE_MISMATCH'));
});
test('malformed bindings/snapshots and forged dynamics cannot invent hazards, timers or restoration',()=>{
 for(const mutate of [d=>d.dynamics.incidents=[null],d=>d.dynamics.events[0].sourceBindingId='unknown',d=>d.dynamics.incidents[0].stateRequirement.field='made-up',d=>d.dynamics.incidents[0].restorationRefs=[{kind:'theory',id:'PULSED_POWER_I'}],d=>d.dynamics.complications[0].sourceId='new-door',d=>d.dynamics.events[0].effects=[],d=>d.context.destinations[0].incidentStates={'new-incident':{state:'ACTIVE'}},d=>d.context.destinations[0].transitionStates={'door-mainhall-to-holding':{state:'DESTROYED'}},d=>d.context.destinations[0].gateState={connection:'CLOSED',elapsedSeconds:-1}]){const d=fresh();mutate(d);assert.throws(()=>run(d),/MISSION AUTHOR VALIDATION ERROR/);}
 const d=fresh();let draft;for(let seed=0;seed<30;seed++){const r=run(d,{...request,seed});if(r.draft.incidents.length&&r.draft.complications.length){draft=r.draft;break;}}assert(draft);const validate=validator(d,draft);
 for(const mutate of [d=>d.incidents[0].subjectInstanceIds=['clone'],d=>d.incidents[0].lifecycle.restoration.status='COMPLETE',d=>d.incidents.push(d.incidents[0]),d=>d.complications[0].intent.kind='INVENTED',d=>d.information.facts[0].truth.stageId='stage-gate-yard',d=>d.runtimeState={}]){const bad=structuredClone(draft);mutate(bad);assert.throws(()=>validate(bad),/MISSION AUTHOR VALIDATION ERROR/);}
});
