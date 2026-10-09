import {object,identifier,strings,version,freeze,fail} from './contracts.mjs';
import {compare} from './determinism.mjs';
import {validPhysicalItem} from '../offworld/mission.mjs';
// Explicit inputs, no roster search, campaign inference, or mutation of fixtures.
export function createAuthorityRegistry({theoryPack,professions,items,physicalInstances,mission,offworld}){
 const errors=[],tables=Object.create(null);
 const add=(kind,rows,key='id')=>{
  tables[kind]=Object.create(null);
  if(!Array.isArray(rows)){errors.push(`${kind}: authority table required`);return;}
  for(const row of rows){const id=row?.[key];if(!identifier(id)||tables[kind][id])errors.push(`${kind}: invalid or duplicate ${id}`);else tables[kind][id]=structuredClone(row);}
 };
 add('theory',theoryPack?.theories);add('profession',professions);add('item',Object.values(items??{}));
 add('physicalInstance',Object.values(physicalInstances??{}),'instanceId');
 add('missionInstance',mission?.instances,'instanceId');
 add('missionStage',mission?.stages,'stageId');add('missionTransition',mission?.transitions,'transitionId');
 add('missionObservation',mission?.observations,'observationId');add('missionDialogue',mission?.dialogueScenes,'dialogueSceneId');
 add('missionRecipe',mission?.recipes,'recipeInstanceId');
 add('missionWorkGroup',mission?.workGroups??[],'workGroupId');
 add('missionIncident',mission?.incidents,'incidentId');add('missionEventBinding',mission?.eventBindings,'bindingId');
 add('missionTarget',mission?.interactionTargets,'targetId');
 for(const [kind,group] of Object.entries({stageArchetype:'stage',instanceArchetype:'instance',incidentArchetype:'incident',eventArchetype:'event',recipeArchetype:'recipe',observationArchetype:'observation'}))add(kind,Object.entries(offworld?.archetypes?.[group]??{}).map(([id,row])=>({id,...row})));
 if(!identifier(mission?.mission?.destinationId)||!identifier(mission?.mission?.missionId))errors.push('compiled mission with destination identity required');
 fail(errors);
 const warnings=[];
 if(!Object.values(tables.theory).some(t=>object(t.fieldGuidance)&&Object.keys(t.fieldGuidance).length))warnings.push('Theory fieldGuidance is absent/empty; domain opportunity derivation is unresolved.');
 if(!Object.values(tables.theory).some(t=>t.type==='PROFESSION_CURRICULUM'))warnings.push('Executable Profession curricula are absent; base-class identity does not establish field method.');
 warnings.push('Campaign/Act, Haven/faction, named NPC profiles and mission history require explicit caller snapshots; no live campaign adapter is supplied.');
 return freeze({tables,warnings,missionId:mission.mission.missionId,destinationId:mission.mission.destinationId,sourceType:mission.mission.source.type,entryStageId:mission.gate.stageId,gate:structuredClone(mission.gate)});
}
export function validateContext(input,registry){
 const errors=[];
 if(!object(input))fail(['context must be an object']);
 if(!version(input.version)||!identifier(input.actId)||!strings(input.knownFacts)||!Array.isArray(input.destinations))errors.push('context: version, Act, knownFacts and destinations required');
 const ids=new Set();
 for(const d of Array.isArray(input.destinations)?input.destinations:[]){
  if(!object(d)){errors.push('destination must be an object');continue;}
  if(!identifier(d.id)||ids.has(d.id)||!version(d.version)||!identifier(d.sourceType)||!strings(d.realityFacts)||!Array.isArray(d.roleBindings))errors.push(`${d.id}: invalid destination snapshot`);ids.add(d.id);
  if(d.id!==registry.destinationId||d.sourceType!==registry.sourceType)errors.push(`${d.id}: no registered mission Reality/source adapter for this destination`);
  const bindings=new Set();
  for(const b of Array.isArray(d.roleBindings)?d.roleBindings:[]){
   if(!object(b)){errors.push(`${d.id}: role binding must be an object`);continue;}
   const key=`${b.roleId}:${b.instanceId}`;
   if(!identifier(b.roleId)||!registry.tables.missionInstance[b.instanceId]||bindings.has(key))errors.push(`${d.id}: invalid/duplicate role binding ${key}`);bindings.add(key);
  }
  if(d.instanceStates!==undefined){
   if(!object(d.instanceStates))errors.push(`${d.id}: instanceStates must be an object`);
   else for(const [id,state] of Object.entries(d.instanceStates)){
    const instance=registry.tables.missionInstance[id];
    if(!instance||!object(state))errors.push(`${d.id}: invalid instance snapshot ${id}`);
    else if(state.physicalItem!==undefined&&!validPhysicalItem(state.physicalItem,id,instance.itemId))errors.push(`${d.id}: invalid physical instance identity/state ${id}`);
    if(state?.currentStageId!==undefined&&!registry.tables.missionStage[state.currentStageId])errors.push(`${d.id}: unknown current Stage for ${id}`);
   }
  }
  if(d.stageBindings!==undefined){
   if(!Array.isArray(d.stageBindings))errors.push(`${d.id}: Stage bindings must be an array`);
   else {const stages=new Set();for(const b of d.stageBindings){
    if(!object(b)||!registry.tables.missionStage[b.stageId]||stages.has(b.stageId)||!strings(b.purposeIds)||!strings(b.environmentIds))errors.push(`${d.id}: invalid or duplicate Stage binding`);
    else stages.add(b.stageId);
   }}
  }
  for(const [key,table,states] of [['incidentStates','missionIncident',['DORMANT','ACTIVE','RESOLVED']],['transitionStates','missionTransition',['OPEN','CLOSED','LOCKED']]])if(d[key]!==undefined){
   if(!object(d[key]))errors.push(`${d.id}: ${key} must be an object`);
   else for(const [id,state] of Object.entries(d[key]))if(!registry.tables[table][id]||!object(state)||!states.includes(state.state))errors.push(`${d.id}: invalid ${key} snapshot ${id}`);
  }
  if(d.gateState!==undefined&&(!object(d.gateState)||!['OPEN_TO_SGC','CLOSED'].includes(d.gateState.connection)||!Number.isFinite(d.gateState.elapsedSeconds)||d.gateState.elapsedSeconds<0))errors.push(`${d.id}: invalid Gate snapshot`);
 }
 fail(errors);return freeze(structuredClone(input));
}
export function roleCandidates(registry,destination,roleId,roleDefinition){
 return destination.roleBindings.filter(b=>b.roleId===roleId).filter(b=>{
  const def=registry.tables.missionInstance[b.instanceId],s={...def.initialState,...destination.instanceStates?.[b.instanceId]};
  const archetypes=(roleDefinition?.refs??[]).filter(r=>r.kind==='instanceArchetype');
  if(archetypes.length&&!archetypes.some(r=>r.id===def.archetypeId))return false;
  return (!s.custody||s.custody==='LOCAL')&&!['FLED','DEAD'].includes(s.combatState)&&s.alive!==false;
 }).map(b=>({id:b.instanceId,weight:1,stageId:instanceStage(registry,destination,b.instanceId)})).sort((a,b)=>compare(a.id,b.id));
}
export const instanceStage=(registry,destination,id)=>destination.instanceStates?.[id]?.currentStageId??registry.tables.missionInstance[id].stageId;
export function theoryGuidance(registry,id){
 const t=registry.tables.theory[id];if(!t)return {status:'UNRESOLVED',reason:`Unknown Theory ${id}`};
 return t.fieldGuidance&&Object.keys(t.fieldGuidance).length?{status:'AVAILABLE',guidance:t.fieldGuidance}:{status:'UNRESOLVED',reason:`No authored fieldGuidance for ${id}`};
}
