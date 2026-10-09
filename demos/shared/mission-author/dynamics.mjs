import {object,identifier,strings,version,freeze,fail} from './contracts.mjs';
import {validateCatalogs} from './catalogs.mjs';
import {validateContext,instanceStage} from './adapters.mjs';
import {composeInformation} from './information.mjs';
import {catalogCandidates,selectCandidate} from './selection.mjs';
import {canonical,namedRandom,compare} from './determinism.mjs';
import {candidateTrace,resultTrace} from './trace.mjs';
const same=(a,b)=>{try{return canonical(a)===canonical(b);}catch{return false;}};
function fields(row,allowed,path,errors){for(const k of Object.keys(row))if(!allowed.includes(k))errors.push(`${path}: unsupported field ${k}`);}
function validateStateCondition(c,registry,errors){
 if(!object(c)){errors.push('state constraint must be an object');return;}
 if(['ALL','ANY'].includes(c.type)){
  fields(c,['type','conditions'],'state constraint',errors);if(!Array.isArray(c.conditions)||!c.conditions.length)errors.push('nonempty state constraints required');else c.conditions.forEach(x=>validateStateCondition(x,registry,errors));return;
 }
 fields(c,['instanceId','field','equals','notEquals'],'state constraint',errors);
 const source=registry.tables.missionInstance[c.instanceId];
 if(!source||!identifier(c.field)||!Object.hasOwn(source.initialState,c.field)||Object.hasOwn(c,'equals')===Object.hasOwn(c,'notEquals'))errors.push('invalid instance field constraint');
 const value=Object.hasOwn(c,'equals')?c.equals:c.notEquals;if(!['string','boolean','number'].includes(typeof value)&&value!==null||typeof value==='number'&&!Number.isFinite(value))errors.push('state constraint requires a scalar');
}
export function validateDynamics(input,pack,registry){
 const errors=[];
 if(!object(input))fail(['dynamic bindings must be an object']);
 fields(input,['format','version','incidents','events','complications'],'dynamics',errors);
 if(input.format!=='mission-author-dynamics-1'||!version(input.version))errors.push('dynamic format/version required');
 const families={incidents:'INCIDENT_CATALOG',events:'EVENT_CATALOG',complications:'COMPLICATION_CATALOG'};
 for(const [group,family] of Object.entries(families)){
  if(!Array.isArray(input[group])){errors.push(`${group}: bindings required`);continue;}
  const seen=new Set(),sources=new Set();
  for(const row of input[group]){
   if(!object(row)){errors.push(`${group}: binding must be an object`);continue;}
   const allowed=group==='incidents'?['id','catalogId','sourceIncidentId','stateRequirement','detectionRefs','investigationRefs','restorationRefs']:group==='events'?['id','catalogId','sourceBindingId','prerequisiteBindingIds','originIncidentIds','stateRequirement']:['id','catalogId','sourceKind','sourceId'];
   fields(row,allowed,row.id,errors);
   if(!identifier(row.id)||seen.has(row.id)||!pack.indexes[family][row.catalogId])errors.push(`invalid/duplicate ${group} binding ${row.id}`);seen.add(row.id);
   const sourceId=row.sourceIncidentId??row.sourceBindingId??`${row.sourceKind}:${row.sourceId}`;
   if(sources.has(sourceId))errors.push(`duplicate ${group} source ${sourceId}`);sources.add(sourceId);
   if(row.stateRequirement!==undefined)validateStateCondition(row.stateRequirement,registry,errors);
   if(group==='incidents'){
    const source=registry.tables.missionIncident[row.sourceIncidentId],catalog=pack.indexes[family][row.catalogId];
    if(!source||!catalog?.refs.some(r=>r.kind==='incidentArchetype'&&r.id===source.archetypeId))errors.push(`${row.id}: source Incident/archetype mismatch`);
    for(const key of ['detectionRefs','investigationRefs','restorationRefs']){
     if(!Array.isArray(row[key]))errors.push(`${row.id}: lifecycle references required`);
     else for(const ref of row[key])if(!object(ref)||Object.keys(ref).some(k=>!['kind','id'].includes(k))||!['missionObservation','missionInstance','missionRecipe'].includes(ref.kind)||!registry.tables[ref.kind]?.[ref.id])errors.push(`${row.id}: unknown lifecycle reference`);
     if(key==='restorationRefs'&&row[key]?.length)errors.push(`${row.id}: no supported restoration-method adapter; leave restoration unresolved`);
    }
   }else if(group==='events'){
    const source=registry.tables.missionEventBinding[row.sourceBindingId],catalog=pack.indexes[family][row.catalogId];
    if(!source||!catalog?.refs.some(r=>r.kind==='eventArchetype'&&r.id===source.eventArchetypeId)||!strings(row.prerequisiteBindingIds)||!strings(row.originIncidentIds)||!row.originIncidentIds.length)errors.push(`${row.id}: Event source/trigger provenance required`);
    for(const id of Array.isArray(row.prerequisiteBindingIds)?row.prerequisiteBindingIds:[])if(!registry.tables.missionEventBinding[id])errors.push(`${row.id}: unknown prerequisite binding ${id}`);
    for(const id of Array.isArray(row.originIncidentIds)?row.originIncidentIds:[])if(!registry.tables.missionIncident[id])errors.push(`${row.id}: unknown origin Incident ${id}`);
   }else if(!['missionTransition','gate'].includes(row.sourceKind)||row.sourceKind==='gate'&&row.sourceId!==registry.gate.instanceId||row.sourceKind==='missionTransition'&&!registry.tables.missionTransition[row.sourceId])errors.push(`${row.id}: unknown complication source`);
  }
 }
 fail(errors);return freeze(structuredClone(input));
}
const state=(inputs,id)=>({...inputs.registry.tables.missionInstance[id].initialState,...inputs.destination.instanceStates?.[id]});
function stateMatches(c,inputs){
 if(c.type==='ALL')return c.conditions.every(x=>stateMatches(x,inputs));if(c.type==='ANY')return c.conditions.some(x=>stateMatches(x,inputs));
 const value=state(inputs,c.instanceId)[c.field];return value!==undefined&&(Object.hasOwn(c,'equals')?same(value,c.equals):!same(value,c.notEquals));
}
function localReasons(inputs,ids,stageId){
 const reasons=[];
 for(const id of ids){const s=state(inputs,id),stage=instanceStage(inputs.registry,inputs.destination,id);
  if(!inputs.stageIds.has(stage)||stageId!==undefined&&stage!==stageId)reasons.push(`SUBJECT_LOCATION_MISMATCH: ${id}`);
  if(s.alive===false||['DEAD','FLED'].includes(s.combatState)||s.custody&&s.custody!=='LOCAL')reasons.push(`SUBJECT_UNAVAILABLE: ${id}`);
 }return reasons;
}
function candidate(row,family,inputs){const p=catalogCandidates(inputs.pack,family,inputs).find(c=>c.id===row.catalogId);return {id:row.id,weight:p.weight,availability:p.availability,reasons:[...p.reasons]};}
function incidentCandidate(row,inputs){
 const c=candidate(row,'INCIDENT_CATALOG',inputs),source=inputs.registry.tables.missionIncident[row.sourceIncidentId],ids=[...new Set([...(source.participantIds??[]),...(source.sourceInstanceId?[source.sourceInstanceId]:[])])].sort(compare);
 if(!source.implemented||!ids.length)c.reasons.push('UNSUPPORTED_INCIDENT_SUBJECTS');
 if(!inputs.stageIds.has(source.stageId))c.reasons.push('INCIDENT_OUTSIDE_DRAFT');c.reasons.push(...localReasons(inputs,ids,source.stageId));
 const snapshot=inputs.destination.incidentStates?.[source.incidentId]?.state??source.initialState;
 if(snapshot==='RESOLVED')c.reasons.push('INCIDENT_ALREADY_RESOLVED');
 if(row.stateRequirement&&!stateMatches(row.stateRequirement,inputs))c.reasons.push('INCIDENT_STATE_REQUIREMENT_FAILED');
 for(const key of ['detectionRefs','investigationRefs','restorationRefs'])for(const ref of row[key]){
  const target=inputs.registry.tables[ref.kind][ref.id];
  if(ref.kind==='missionObservation'&&!target.implemented)c.reasons.push('LIFECYCLE_SOURCE_UNIMPLEMENTED');
  if(ref.kind==='missionObservation'&&(target.stageId!==source.stageId||target.subjectInstanceId&&!ids.includes(target.subjectInstanceId)))c.reasons.push('LIFECYCLE_SOURCE_MISMATCH');
  if(ref.kind==='missionInstance'&&!ids.includes(ref.id))c.reasons.push('LIFECYCLE_SOURCE_MISMATCH');
  if(ref.kind==='missionRecipe')c.reasons.push('LIFECYCLE_RECIPE_BINDING_UNSUPPORTED');
 }
 const phase=refs=>({status:refs.length?'BENCHMARK_REFERENCE':'UNRESOLVED',sources:[...refs].sort((a,b)=>compare(`${a.kind}:${a.id}`,`${b.kind}:${b.id}`))});
 c.value={possibilityId:row.id,catalogId:row.catalogId,sourceIncidentId:source.incidentId,stageId:source.stageId,subjectInstanceIds:ids,sourceState:snapshot,activation:{mode:source.activationMode??null,condition:source.activationCondition??null},lifecycle:{detection:phase(row.detectionRefs),investigation:phase(row.investigationRefs),resolution:{status:'BENCHMARK_REFERENCE',sourceIncidentId:source.incidentId,mode:source.resolutionMode??null,condition:source.resolutionCondition??null},restoration:phase(row.restorationRefs)},executionStatus:'UNRESOLVED'};
 return c;
}
function eventCandidate(row,inputs,selectedIncidents){
 const c=candidate(row,'EVENT_CATALOG',inputs),source=inputs.registry.tables.missionEventBinding[row.sourceBindingId],chain=[...row.prerequisiteBindingIds,row.sourceBindingId].map(id=>inputs.registry.tables.missionEventBinding[id]);
 const origins=selectedIncidents.filter(object).filter(i=>row.originIncidentIds.includes(i.sourceIncidentId));if(!origins.length)c.reasons.push('NO_SELECTED_TRIGGER_ORIGIN');
 const first=chain[0];
 const matchingOrigins=origins.filter(i=>{const incident=inputs.registry.tables.missionIncident[i.sourceIncidentId];return incident&&(incident.onEscapeEvent===first.eventArchetypeId||first.eventArchetypeId==='event_gunfire_occurred'&&incident.kind==='COMBAT');});
 if(!matchingOrigins.length)c.reasons.push('TRIGGER_ORIGIN_MISMATCH');
 const subjects=new Set();
 for(const [n,binding] of chain.entries()){
  if(n&&!(chain[n-1].effects??[]).some(e=>['EMIT_EVENT','SCHEDULE_EVENT'].includes(e.type)&&e.eventArchetypeId===binding.eventArchetypeId))c.reasons.push('BROKEN_TRIGGER_CHAIN');
  for(const condition of binding.conditions??[]){
   if(condition.type==='EVENT_STAGE_IN'&&!matchingOrigins.some(i=>condition.stageIds.includes(i.stageId)))c.reasons.push('TRIGGER_STAGE_MISMATCH');
   if(condition.instanceId)subjects.add(condition.instanceId);if(condition.assetInstanceId)subjects.add(condition.assetInstanceId);
  }
  for(const effect of binding.effects??[])if(effect.instanceId)subjects.add(effect.instanceId);
 }
 c.reasons.push(...localReasons(inputs,[...subjects]));if(row.stateRequirement&&!stateMatches(row.stateRequirement,inputs))c.reasons.push('EVENT_STATE_REQUIREMENT_FAILED');
 c.value={possibilityId:row.id,catalogId:row.catalogId,sourceBindingId:source.bindingId,originIncidentIds:matchingOrigins.map(i=>i.sourceIncidentId).sort(compare),subjectInstanceIds:[...subjects].sort(compare),triggerIntent:{eventArchetypeId:source.eventArchetypeId,provenance:chain.map(b=>({bindingId:b.bindingId,eventArchetypeId:b.eventArchetypeId,conditions:b.conditions??[],effects:b.effects??[],once:b.once??false}))},effectIntent:source.effects??[],executionStatus:'UNRESOLVED'};
 return c;
}
function complicationCandidate(row,inputs){
 const c=candidate(row,'COMPLICATION_CATALOG',inputs);
 if(row.sourceKind==='missionTransition'){
  const source=inputs.registry.tables.missionTransition[row.sourceId],snapshot=inputs.destination.transitionStates?.[row.sourceId]?.state??source.initialState;
  if(!inputs.transitions.has(row.sourceId))c.reasons.push('TRANSITION_OUTSIDE_DRAFT');if(snapshot!=='LOCKED')c.reasons.push('NO_ACCESS_RESTRICTION');
  if(!inputs.pack.indexes.COMPLICATION_CATALOG[row.catalogId].refs.some(r=>r.kind==='recipeArchetype'&&r.id==='recipe_hack_transition'))c.reasons.push('COMPLICATION_SOURCE_MISMATCH');
  c.value={possibilityId:row.id,catalogId:row.catalogId,source:{kind:row.sourceKind,id:row.sourceId},intent:{kind:'ACCESS_RESTRICTION',state:snapshot},executionStatus:'UNRESOLVED'};
 }else{
  const gate=inputs.registry.gate,snapshot=inputs.destination.gateState??{connection:gate.initialConnectionState,elapsedSeconds:0};
  if(snapshot.connection!=='OPEN_TO_SGC'||!Number.isFinite(gate.maxContinuousConnectionMinutes)||gate.maxContinuousConnectionMinutes<=0||snapshot.elapsedSeconds>=gate.maxContinuousConnectionMinutes*60)c.reasons.push('NO_ACTIVE_GATE_TIME_PRESSURE');
  if(!inputs.pack.indexes.COMPLICATION_CATALOG[row.catalogId].refs.some(r=>r.kind==='eventArchetype'&&r.id===gate.onMaxDurationEvent))c.reasons.push('COMPLICATION_SOURCE_MISMATCH');
  c.value={possibilityId:row.id,catalogId:row.catalogId,source:{kind:'gate',id:row.sourceId},intent:{kind:'TIME_PRESSURE',maxContinuousConnectionMinutes:gate.maxContinuousConnectionMinutes,elapsedSeconds:snapshot.elapsedSeconds,onMaxDurationEvent:gate.onMaxDurationEvent},executionStatus:'UNRESOLVED'};
 }return c;
}
function inputsFor(information,pack,context,registry,request){const skeleton=information.skeleton;return {pack,context,registry,request,destination:context.destinations.find(d=>d.id===skeleton.destinationId),stageIds:new Set(skeleton.stages.map(s=>s.stageId)),transitions:new Set(skeleton.transitions.map(t=>t.transitionId))};}
function selectMany(rows,max,identity,stream,decisions){
 decisions.push(candidateTrace(`${stream}:candidates`,rows));
 const available=rows.filter(c=>!c.reasons.length),count=Math.floor(namedRandom(identity,stream,'count')()*(Math.min(max,available.length)+1)),selected=[];
 for(let i=0;i<count;i++){const remaining=available.filter(c=>!selected.includes(c)),chosen=selectCandidate(remaining,namedRandom(identity,stream,`choice:${i}`));selected.push(chosen);decisions.push(candidateTrace(`${stream}:choice:${i}`,remaining,chosen.id));}
 return selected.map(c=>c.value).sort((a,b)=>compare(a.possibilityId,b.possibilityId));
}
export function validateDynamicDraft(draft,{information,pack,context,registry,request,dynamics}){
 const errors=[];if(!object(draft))fail(['Dynamic Draft must be an object']);
 fields(draft,['format','status','information','incidents','events','complications'],'Dynamic Draft',errors);
 if(draft.format!=='mission-author-dynamic-draft-1'||draft.status!=='DYNAMICS'||!same(draft.information,information))errors.push('Dynamic Draft identity/information mismatch');
 const inputs=inputsFor(information,pack,context,registry,request),selected=Array.isArray(draft.incidents)?draft.incidents:[];
 for(const [group,max,build] of [['incidents',2,row=>incidentCandidate(row,inputs)],['events',3,row=>eventCandidate(row,inputs,selected)],['complications',2,row=>complicationCandidate(row,inputs)]]){
  const rows=Array.isArray(draft[group])?draft[group]:[],ids=new Set();if(!Array.isArray(draft[group])||rows.length>max)errors.push(`Invalid ${group} count`);
  for(const row of rows){const binding=dynamics[group].find(b=>b.id===row?.possibilityId),candidate=binding&&build(binding);if(!object(row)||ids.has(row.possibilityId)||!candidate||candidate.reasons.length||!same(row,candidate.value))errors.push(`Invalid ${group} possibility ${row?.possibilityId}`);ids.add(row?.possibilityId);}
 }
 fail(errors);return freeze(structuredClone(draft));
}
export function composeDynamics(request,rawPack,rawContext,registry,templates,rawInformation,rawDynamics){
 const pack=validateCatalogs(rawPack,registry),context=validateContext(rawContext,registry),dynamics=validateDynamics(rawDynamics,pack,registry),base=composeInformation(request,rawPack,rawContext,registry,templates,rawInformation);
 const identity={...base.trace.identity,dynamicsVersion:dynamics.version},decisions=[...base.trace.decisions],warnings=[...base.trace.warnings,'Dynamic possibilities are author-only source references; unselected Event follow-ups and executable lifecycle methods require Finalizer resolution.'];
 const finish=(draft,reason=null)=>freeze({format:'mission-author-dynamic-result-1',status:draft?'COMPOSED':'UNRESOLVED',draft,reason,trace:resultTrace(identity,decisions,warnings)});
 if(base.status!=='COMPOSED')return finish(null,base.reason);
 const information=base.draft,inputs=inputsFor(information,pack,context,registry,base.trace.identity.request);
 const incidents=selectMany(dynamics.incidents.map(r=>incidentCandidate(r,inputs)).sort((a,b)=>compare(a.id,b.id)),2,identity,'Incident',decisions);
 const events=selectMany(dynamics.events.map(r=>eventCandidate(r,inputs,incidents)).sort((a,b)=>compare(a.id,b.id)),3,identity,'Event',decisions);
 const complications=selectMany(dynamics.complications.map(r=>complicationCandidate(r,inputs)).sort((a,b)=>compare(a.id,b.id)),2,identity,'optional opportunities',decisions);
 const draft={format:'mission-author-dynamic-draft-1',status:'DYNAMICS',information,incidents,events,complications};
 return finish(validateDynamicDraft(draft,{...inputs,information,dynamics}));
}
