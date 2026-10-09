import {object,identifier,strings,version,freeze,fail} from './contracts.mjs';
import {instanceStage,roleCandidates} from './adapters.mjs';
import {catalogCandidates} from './selection.mjs';
export function validateSkeletons(input,pack){
 const errors=[];
 if(!object(input))fail(['skeleton templates must be an object']);
 for(const key of Object.keys(input))if(!['format','version','patterns'].includes(key))errors.push(`unsupported skeleton pack field ${key}`);
 if(input.format!=='mission-author-skeletons-1'||!version(input.version)||!Array.isArray(input.patterns))errors.push('skeleton template format, version and patterns required');
 const index=Object.create(null);
 for(const t of Array.isArray(input.patterns)?input.patterns:[]){
  if(!object(t)){errors.push('pattern template must be an object');continue;}
  for(const key of Object.keys(t))if(!['patternId','version','stageRange','requiredPurposeIds','fillerPurposeIds','rolePurposes','objectives'].includes(key))errors.push(`${t.patternId}: unsupported template field ${key}`);
  const pattern=pack.indexes.MISSION_PATTERN_CATALOG[t.patternId];
  if(!pattern||index[t.patternId]||!version(t.version))errors.push(`${t.patternId}: invalid/duplicate template identity`);else index[t.patternId]=t;
  if(!object(t.stageRange)||!Number.isInteger(t.stageRange.min)||!Number.isInteger(t.stageRange.max)||t.stageRange.min<4||t.stageRange.max>8||t.stageRange.min>t.stageRange.max)errors.push(`${t.patternId}: Stage range must be within 4–8`);
  for(const field of ['requiredPurposeIds','fillerPurposeIds']){
   if(!strings(t[field])||!t[field].length)errors.push(`${t.patternId}: ${field} must be unique purpose IDs`);
   else for(const id of t[field])if(!pack.indexes.STAGE_PURPOSE_CATALOG[id])errors.push(`${t.patternId}: unknown purpose ${id}`);
  }
  const required=Array.isArray(t.requiredPurposeIds)?t.requiredPurposeIds:[];
  if(!required.includes('ARRIVAL')||!required.includes('EXIT_ROUTE'))errors.push(`${t.patternId}: arrival/exit purposes required`);
  if(!object(t.rolePurposes))errors.push(`${t.patternId}: role purposes required`);
  else for(const [role,purpose] of Object.entries(t.rolePurposes))if(!pack.indexes.MISSION_ROLE_CATALOG[role]||!pack.indexes.STAGE_PURPOSE_CATALOG[purpose]||!required.includes(purpose))errors.push(`${t.patternId}: invalid role/purpose socket ${role}`);
  for(const role of pattern?.requirements.roles??[])if(!t.rolePurposes?.[role])errors.push(`${t.patternId}: missing required role purpose ${role}`);
  const prior=new Set();
  if(!Array.isArray(t.objectives)||!t.objectives.length)errors.push(`${t.patternId}: objective spine required`);
  else for(const o of t.objectives){
   if(!object(o)){errors.push(`${t.patternId}: objective must be an object`);continue;}
   for(const key of Object.keys(o))if(!['objectiveId','intent','roleId','factRoleId','after'].includes(key))errors.push(`${t.patternId}: unsupported objective field ${key}`);
   if(!identifier(o.objectiveId)||prior.has(o.objectiveId)||!['LOCATE','EVACUATE','INVESTIGATE','RECOVER'].includes(o.intent)||!t.rolePurposes?.[o.roleId]||!strings(o.after)||o.after.some(id=>!prior.has(id)))errors.push(`${t.patternId}: invalid objective/dependency ${o.objectiveId}`);
   if(o.factRoleId!==undefined&&(!pack.indexes.FACT_ROLE_CATALOG[o.factRoleId]||!pattern?.links.FACT_ROLE_CATALOG?.includes(o.factRoleId)))errors.push(`${t.patternId}: unsupported Fact Role ${o.factRoleId}`);
   prior.add(o.objectiveId);
  }
 }
 fail(errors);return freeze(structuredClone({...input,index}));
}
export function sourceArchetypeMatches(row,archetypeId){return !!row?.refs.some(r=>r.kind==='stageArchetype'&&r.id===archetypeId);}
export function validateDraft(draft,{foundation,pack,context,registry,templates}){
 const errors=[],selection=foundation.selection,template=templates.index[selection.patternId],destination=context.destinations.find(d=>d.id===selection.destinationId);
 if(!object(draft))fail(['Draft must be an object']);
 const fields=(row,allowed,path)=>{for(const key of Object.keys(row))if(!allowed.includes(key))errors.push(`${path}: unsupported field ${key}`);};
 fields(draft,['format','status','destinationId','hookId','patternId','sourceMissionId','entryStageId','exitStageId','stages','transitions','roles','objectives','factSockets'],'Draft');
 if(draft.format!=='mission-author-draft-1'||draft.status!=='SKELETON'||draft.destinationId!==selection.destinationId||draft.hookId!==selection.hookId||draft.patternId!==selection.patternId||draft.sourceMissionId!==registry.missionId)errors.push('Draft identity/status does not match composition');
 const inputs={request:foundation.trace.identity.request,pack,context,destination,registry};
 const stageIds=new Set(),stages=Array.isArray(draft.stages)?draft.stages:[];
 if(stages.length<template.stageRange.min||stages.length>template.stageRange.max)errors.push('Draft Stage count outside authored range');
 const purposes=new Set();
 for(const s of stages){
  if(!object(s)){errors.push('Draft Stage must be an object');continue;}
  fields(s,['stageId','sourceStageId','archetypeId','purposeIds','environmentId'],s.stageId);
  const source=registry.tables.missionStage[s.stageId],binding=destination.stageBindings?.find(b=>b.stageId===s.stageId);
  if(!source||!binding||s.sourceStageId!==s.stageId||s.archetypeId!==source.archetypeId||stageIds.has(s.stageId)||!strings(s.purposeIds)||!s.purposeIds.length)errors.push(`Invalid source Stage/purposes ${s.stageId}`);stageIds.add(s.stageId);
  for(const id of Array.isArray(s.purposeIds)?s.purposeIds:[]){
   const candidate=catalogCandidates(pack,'STAGE_PURPOSE_CATALOG',inputs,binding?.purposeIds??[]).find(r=>r.id===id),row=pack.indexes.STAGE_PURPOSE_CATALOG[id];
   if(!candidate||candidate.reasons.length||!sourceArchetypeMatches(row,s.archetypeId))errors.push(`${s.stageId}: incompatible purpose ${id}`);purposes.add(id);
  }
  const candidate=catalogCandidates(pack,'ENVIRONMENT_ROLE_CATALOG',inputs,binding?.environmentIds??[]).find(r=>r.id===s.environmentId),env=pack.indexes.ENVIRONMENT_ROLE_CATALOG[s.environmentId];
  if(!candidate||candidate.reasons.length||!sourceArchetypeMatches(env,s.archetypeId)||(Array.isArray(s.purposeIds)?s.purposeIds:[]).some(id=>!env.links.STAGE_PURPOSE_CATALOG?.includes(id)))errors.push(`${s.stageId}: incompatible environment`);
 }
 for(const id of template.requiredPurposeIds)if(!purposes.has(id))errors.push(`Missing required purpose ${id}`);
 if(draft.entryStageId!==registry.entryStageId||draft.exitStageId!==registry.entryStageId||!stageIds.has(draft.entryStageId))errors.push('Draft entry/exit must preserve the source Gate Stage');
 const edges=Array.isArray(draft.transitions)?draft.transitions:[],edgeIds=new Set();
 for(const e of edges){
  if(!object(e)){errors.push('Draft transition must be an object');continue;}
  fields(e,['transitionId','sourceTransitionId','fromStageId','toStageId','accessStatus'],e.transitionId);
  const source=registry.tables.missionTransition[e.transitionId];
  if(!source||edgeIds.has(e.transitionId)||e.sourceTransitionId!==e.transitionId||e.fromStageId!==source.fromStageId||e.toStageId!==source.toStageId||!stageIds.has(e.fromStageId)||!stageIds.has(e.toStageId)||e.accessStatus!=='UNRESOLVED')errors.push(`Invalid source transition ${e.transitionId}`);edgeIds.add(e.transitionId);
 }
 const reached=new Set([draft.entryStageId]);let changed=true;
 while(changed){changed=false;for(const e of edges.filter(object))if(reached.has(e.fromStageId)!==reached.has(e.toStageId)){reached.add(e.fromStageId);reached.add(e.toStageId);changed=true;}}
 if([...stageIds].some(id=>!reached.has(id)))errors.push('Draft graph is disconnected');
 const roles=Array.isArray(draft.roles)?draft.roles:[],seenRoles=new Set();
 for(const r of roles){
  if(!object(r)){errors.push('Draft role must be an object');continue;}
  fields(r,['roleId','instanceId','stageId'],r.roleId);
  if(seenRoles.has(r.roleId)||selection.roleBindings[r.roleId]!==r.instanceId||!registry.tables.missionInstance[r.instanceId]){errors.push(`Invalid role identity ${r.roleId}`);continue;}
  seenRoles.add(r.roleId);
  if(r.stageId!==instanceStage(registry,destination,r.instanceId)||!stageIds.has(r.stageId)||!stages.some(s=>s?.stageId===r.stageId&&Array.isArray(s.purposeIds)&&s.purposeIds.includes(template.rolePurposes[r.roleId]))||!roleCandidates(registry,destination,r.roleId,pack.indexes.MISSION_ROLE_CATALOG[r.roleId]).some(c=>c.id===r.instanceId))errors.push(`Invalid role placement ${r.roleId}`);
 }
 if(Object.keys(selection.roleBindings).some(id=>!seenRoles.has(id)))errors.push('Missing required role placement');
 const objectives=Array.isArray(draft.objectives)?draft.objectives:[];
 if(objectives.length!==template.objectives.length)errors.push('Missing objective spine');
 for(const [i,expected] of template.objectives.entries()){
  const actual=objectives[i],role=roles.find(r=>r?.roleId===expected.roleId);
  if(object(actual))fields(actual,['objectiveId','intent','roleId','instanceId','stageId','after','factRoleId'],actual.objectiveId);
  if(!object(actual)||actual.objectiveId!==expected.objectiveId||actual.intent!==expected.intent||actual.roleId!==expected.roleId||actual.instanceId!==role?.instanceId||actual.stageId!==role?.stageId||actual.factRoleId!==expected.factRoleId||!strings(actual.after)||actual.after.join('\0')!==expected.after.join('\0'))errors.push(`Invalid objective intent/dependencies ${expected.objectiveId}`);
 }
 const factIds=[...new Set(template.objectives.map(o=>o.factRoleId).filter(Boolean))].sort(),facts=Array.isArray(draft.factSockets)?draft.factSockets:[];
 for(const f of facts)if(object(f))fields(f,['factRoleId','status','truth'],f.factRoleId);
 if(facts.length!==factIds.length||facts.some((f,i)=>!object(f)||f.factRoleId!==factIds[i]||f.status!=='UNRESOLVED'||f.truth!==null))errors.push('Fact sockets must remain unresolved in Wave B');
 fail(errors);return freeze(structuredClone(draft));
}
