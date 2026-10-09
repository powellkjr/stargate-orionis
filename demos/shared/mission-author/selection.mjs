import {validateRequest,freeze,fail} from './contracts.mjs';
import {validateCatalogs} from './catalogs.mjs';
import {validateContext,roleCandidates} from './adapters.mjs';
import {namedRandom,chooseWeighted,compare,ALGORITHM} from './determinism.mjs';
import {candidateTrace,resultTrace} from './trace.mjs';
export function candidateReasons(row,{request,context,destination,registry,pack}){
 const reasons=[];
 if(row.support==='UNRESOLVED')reasons.push(`UNRESOLVED: ${row.unavailableReason}`);
 const availability=row.actAvailability[request.actId]??row.actAvailability['*'];
 if(availability==='FORBIDDEN')reasons.push('ACT_FORBIDDEN');
 if(availability==='RESTRICTED'&&!request.allowRestricted.includes(row.qualifiedId))reasons.push('ACT_RESTRICTED');
 const r=row.requirements;
 if(r.sourceTypes?.length&&!r.sourceTypes.includes(destination.sourceType))reasons.push(`SOURCE_TYPE: ${destination.sourceType}`);
 for(const fact of r.realityFacts??[])if(!destination.realityFacts.includes(fact))reasons.push(`REALITY_FACT_MISSING: ${fact}`);
 for(const fact of r.knownFacts??[])if(!context.knownFacts.includes(fact))reasons.push(`KNOWLEDGE_MISSING: ${fact}`);
 for(const role of r.roles??[]){const definition=pack.indexes.MISSION_ROLE_CATALOG[role],evaluation=candidateReasons({...definition,qualifiedId:`MISSION_ROLE_CATALOG:${role}`},{request,context,destination,registry,pack});if(evaluation.reasons.length||!roleCandidates(registry,destination,role,definition).length)reasons.push(`ROLE_UNAVAILABLE: ${role}${evaluation.reasons.length?' ('+evaluation.reasons.join(', ')+')':''}`);}
 const realityTheories=new Set(destination.roleBindings.flatMap(b=>{
  const instance=registry.tables.missionInstance[b.instanceId];
  const item=destination.instanceStates?.[b.instanceId]?.physicalItem??instance.initialState.physicalItem;
  return [...(item?.reality.technology??[]),...(item?.reality.theoryBindings??[]).map(t=>t.theoryId)];
 }));
 for(const id of r.realityTheories??[])if(!realityTheories.has(id))reasons.push(`REALITY_THEORY_MISSING: ${id}`);
 return {availability,reasons};
}
export function catalogCandidates(pack,family,inputs,allowedIds){
 if(!pack.indexes?.[family])throw Error(`Unknown catalog ${family}`);
 return Object.values(pack.indexes[family]).sort((a,b)=>compare(a.id,b.id)).map(row=>{
  const qualifiedId=`${family}:${row.id}`,evaluation=candidateReasons({...row,qualifiedId},inputs);
  if(allowedIds&&!allowedIds.includes(row.id))evaluation.reasons.push('INCOMPATIBLE_COMPOSITION');
  return {id:row.id,qualifiedId,version:row.version,weight:row.weight,...evaluation};
 });
}
export function selectCandidate(rows,random,pinned){
 const admitted=rows.filter(r=>!r.reasons.length);
 if(pinned!==undefined)return admitted.find(r=>r.id===pinned)??null;
 const preferred=admitted.filter(r=>r.availability==='PREFERRED');
 return chooseWeighted(preferred.length?preferred:admitted,random);
}
// Foundation output is a composition selection, never a playable Mission Draft.
export function composeFoundation(rawRequest,rawPack,rawContext,registry){
 const request=validateRequest(rawRequest),pack=validateCatalogs(rawPack,registry),context=validateContext(rawContext,registry);
 const errors=[];
 if(request.actId!==context.actId)errors.push('request Act does not match current campaign snapshot');
 for(const id of request.allowRestricted){const [family,row,...extra]=id.split(':');if(extra.length||!pack.indexes[family]?.[row])errors.push(`unknown restricted-row override ${id}`);}
 for(const [field,family] of [['hookId','MISSION_HOOK_CATALOG'],['patternId','MISSION_PATTERN_CATALOG']])if(request[field]!==undefined&&!pack.indexes[family][request[field]])errors.push(`unknown requested ${field} ${request[field]}`);
 if(request.destinationId!==undefined&&!context.destinations.some(d=>d.id===request.destinationId))errors.push(`unknown requested destination ${request.destinationId}`);
 for(const d of context.destinations)for(const b of d.roleBindings)if(!pack.indexes.MISSION_ROLE_CATALOG[b.roleId])errors.push(`unknown bound role ${b.roleId}`);
 fail(errors);
 // Sort semantically unordered arrays so JSON property/row order cannot change choices.
 const normalizedContext=structuredClone(context);normalizedContext.knownFacts.sort(compare);normalizedContext.destinations.sort((a,b)=>compare(a.id,b.id));
 for(const d of normalizedContext.destinations){d.realityFacts.sort(compare);d.roleBindings.sort((a,b)=>compare(`${a.roleId}:${a.instanceId}`,`${b.roleId}:${b.instanceId}`));if(d.stageBindings){d.stageBindings.sort((a,b)=>compare(a.stageId,b.stageId));for(const b of d.stageBindings){b.purposeIds.sort(compare);b.environmentIds.sort(compare);}}}
 const identity={algorithm:ALGORITHM,request:{...request,allowRestricted:[...request.allowRestricted].sort(compare)},context:normalizedContext,catalogVersions:{packId:pack.id,packVersion:pack.version,...Object.fromEntries(Object.entries(pack.catalogs).sort(([a],[b])=>compare(a,b)).map(([id,c])=>[id,{version:c.version,rows:c.rows.map(r=>({id:r.id,version:r.version})).sort((a,b)=>compare(a.id,b.id))}]))}};
 const random=(name,key)=>namedRandom(identity,name,key),decisions=[],warnings=[...registry.warnings];
 const destinations=[...context.destinations].sort((a,b)=>compare(a.id,b.id)).map(d=>{
  const inputs={request,context,destination:d,registry,pack},hooks=catalogCandidates(pack,'MISSION_HOOK_CATALOG',inputs);
  for(const h of hooks){const patterns=catalogCandidates(pack,'MISSION_PATTERN_CATALOG',inputs,pack.indexes.MISSION_HOOK_CATALOG[h.id].links.MISSION_PATTERN_CATALOG??[]);decisions.push(candidateTrace(`patterns@${d.id}:${h.id}`,patterns));if(!patterns.some(p=>!p.reasons.length&&(!request.patternId||p.id===request.patternId)))h.reasons.push('NO_COMPATIBLE_PATTERN');}
  const viable=hooks.some(h=>!h.reasons.length&&(!request.hookId||h.id===request.hookId));
  decisions.push(candidateTrace(`hooks@${d.id}`,hooks));
  return {id:d.id,weight:1,reasons:viable?[]:['NO_COMPATIBLE_HOOK_PATTERN'],availability:'AVAILABLE',version:d.version};
 });
 const selectedDestination=selectCandidate(destinations,random('destination'),request.destinationId);decisions.push(candidateTrace('destinations',destinations,selectedDestination?.id??null));
 const finish=(status,selection,reason=null)=>freeze({format:'mission-author-foundation-1',status,selection,reason,trace:resultTrace(identity,decisions,warnings)});
 if(!selectedDestination)return finish('UNRESOLVED',null,'No compatible destination/hook/pattern composition.');
 const destination=context.destinations.find(d=>d.id===selectedDestination.id),inputs={request,context,destination,registry,pack};
 const hooks=catalogCandidates(pack,'MISSION_HOOK_CATALOG',inputs);
 for(const h of hooks)if(!h.reasons.length&&!catalogCandidates(pack,'MISSION_PATTERN_CATALOG',inputs,pack.indexes.MISSION_HOOK_CATALOG[h.id].links.MISSION_PATTERN_CATALOG??[]).some(p=>!p.reasons.length&&(!request.patternId||p.id===request.patternId)))h.reasons.push('NO_COMPATIBLE_PATTERN');
 const hook=selectCandidate(hooks,random('hook'),request.hookId);decisions.push(candidateTrace('MISSION_HOOK_CATALOG',hooks,hook?.id??null));
 if(!hook)return finish('UNRESOLVED',null,'No compatible hook.');
 const patterns=catalogCandidates(pack,'MISSION_PATTERN_CATALOG',inputs,pack.indexes.MISSION_HOOK_CATALOG[hook.id].links.MISSION_PATTERN_CATALOG??[]),pattern=selectCandidate(patterns,random('pattern'),request.patternId);
 decisions.push(candidateTrace('MISSION_PATTERN_CATALOG',patterns,pattern?.id??null));
 if(!pattern)return finish('UNRESOLVED',null,'No compatible pattern.');
 const roles={};
 const requiredRoles=[...new Set([...(pack.indexes.MISSION_HOOK_CATALOG[hook.id].requirements.roles??[]),...(pack.indexes.MISSION_PATTERN_CATALOG[pattern.id].requirements.roles??[])])].sort(compare);
 for(const id of requiredRoles){const candidates=roleCandidates(registry,destination,id,pack.indexes.MISSION_ROLE_CATALOG[id]),selected=chooseWeighted(candidates,random('roles',id));roles[id]=selected.id;decisions.push(candidateTrace(`role:${id}`,candidates,selected.id));}
 return finish('COMPOSED',{destinationId:destination.id,hookId:hook.id,patternId:pattern.id,roleBindings:roles});
}
