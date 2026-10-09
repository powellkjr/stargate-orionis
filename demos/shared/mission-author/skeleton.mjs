import {validateCatalogs} from './catalogs.mjs';
import {validateContext,instanceStage} from './adapters.mjs';
import {composeFoundation,catalogCandidates,selectCandidate} from './selection.mjs';
import {namedRandom,compare} from './determinism.mjs';
import {validateSkeletons,validateDraft,sourceArchetypeMatches} from './draft.mjs';
import {buildStageGraph} from './graph.mjs';
import {candidateTrace,resultTrace} from './trace.mjs';
import {freeze} from './contracts.mjs';
export function composeSkeleton(request,rawPack,rawContext,registry,rawTemplates){
 const pack=validateCatalogs(rawPack,registry),context=validateContext(rawContext,registry),templates=validateSkeletons(rawTemplates,pack),foundation=composeFoundation(request,rawPack,rawContext,registry);
 const decisions=[...foundation.trace.decisions],warnings=[...foundation.trace.warnings,'Stage graph represents authored adjacency only; door access and secure evacuation remain unresolved.'];
 const identity={...foundation.trace.identity,skeletonVersion:templates.version},finish=(draft,reason=null)=>freeze({format:'mission-author-skeleton-result-1',status:draft?'COMPOSED':'UNRESOLVED',draft,reason,trace:resultTrace(identity,decisions,warnings)});
 if(foundation.status!=='COMPOSED')return finish(null,foundation.reason);
 const selection=foundation.selection,template=templates.index[selection.patternId];
 if(!template)return finish(null,`No authored skeleton template for ${selection.patternId}.`);
 identity.templateVersion=template.version;
 const destination=context.destinations.find(d=>d.id===selection.destinationId),inputs={request:foundation.trace.identity.request,pack,context,destination,registry};
 if(!destination.stageBindings?.length)return finish(null,'Destination lacks authored Stage-purpose/environment bindings.');
 for(const b of destination.stageBindings)if(b.purposeIds.some(id=>!pack.indexes.STAGE_PURPOSE_CATALOG[id])||b.environmentIds.some(id=>!pack.indexes.ENVIRONMENT_ROLE_CATALOG[id]))return finish(null,`Unknown Stage purpose/environment binding at ${b.stageId}.`);
 const anchors=new Map([[registry.entryStageId,new Set(['ARRIVAL','EXIT_ROUTE'])]]);
 const roles=Object.entries(selection.roleBindings).sort(([a],[b])=>compare(a,b)).map(([roleId,instanceId])=>({roleId,instanceId,stageId:instanceStage(registry,destination,instanceId)}));
 for(const r of roles){const purpose=template.rolePurposes[r.roleId];if(!purpose)return finish(null,`No authored Stage-purpose socket for required role ${r.roleId}.`);if(!anchors.has(r.stageId))anchors.set(r.stageId,new Set());anchors.get(r.stageId).add(purpose);}
 const bindings=[...destination.stageBindings].sort((a,b)=>compare(a.stageId,b.stageId));
 function stageOption(binding,forced=[]){
  const source=registry.tables.missionStage[binding.stageId];
  const purposes=catalogCandidates(pack,'STAGE_PURPOSE_CATALOG',inputs,binding.purposeIds);
  for(const c of purposes)if(!sourceArchetypeMatches(pack.indexes.STAGE_PURPOSE_CATALOG[c.id],source.archetypeId))c.reasons.push('SOURCE_ARCHETYPE_MISMATCH');
  const environments=catalogCandidates(pack,'ENVIRONMENT_ROLE_CATALOG',inputs,binding.environmentIds);
  for(const c of environments)if(!sourceArchetypeMatches(pack.indexes.ENVIRONMENT_ROLE_CATALOG[c.id],source.archetypeId))c.reasons.push('SOURCE_ARCHETYPE_MISMATCH');
  for(const c of purposes)if(!environments.some(e=>!e.reasons.length&&pack.indexes.ENVIRONMENT_ROLE_CATALOG[e.id].links.STAGE_PURPOSE_CATALOG?.includes(c.id)))c.reasons.push('NO_COMPATIBLE_ENVIRONMENT');
  let purposeIds=[...forced].sort(compare);
  if(!purposeIds.length){const filler=purposes.map(c=>({...c,reasons:template.fillerPurposeIds.includes(c.id)?c.reasons:[...c.reasons,'NOT_A_FILLER_PURPOSE']})),chosen=selectCandidate(filler,namedRandom(identity,'graph',`${binding.stageId}:purpose`));if(chosen)purposeIds=[chosen.id];}
  const invalid=purposeIds.length===0||purposeIds.some(id=>!purposes.some(c=>c.id===id&&!c.reasons.length));
  for(const c of environments){const row=pack.indexes.ENVIRONMENT_ROLE_CATALOG[c.id];if(invalid||purposeIds.some(id=>!row.links.STAGE_PURPOSE_CATALOG?.includes(id)))c.reasons.push('PURPOSE_ENVIRONMENT_MISMATCH');}
  const environment=selectCandidate(environments,namedRandom(identity,'graph',`${binding.stageId}:environment`));
  return {stage:!invalid&&environment?{stageId:binding.stageId,sourceStageId:binding.stageId,archetypeId:source.archetypeId,purposeIds,environmentId:environment.id}:null,purposes,environments};
 }
 // Required unbound purposes (e.g. transit) get a valid structural socket first.
 for(const purpose of template.requiredPurposeIds.filter(p=>![...anchors.values()].some(ids=>ids.has(p)))){
  const candidates=bindings.map(b=>({id:b.stageId,weight:1,reasons:stageOption(b,[...(anchors.get(b.stageId)??[]),purpose]).stage?[]:['INCOMPATIBLE_STAGE_SOCKET']}));
  const chosen=selectCandidate(candidates,namedRandom(identity,'graph',`purpose-socket:${purpose}`));decisions.push(candidateTrace(`purpose-socket:${purpose}`,candidates,chosen?.id??null));
  if(!chosen)return finish(null,`No compatible physical Stage can host required purpose ${purpose}.`);
  if(!anchors.has(chosen.id))anchors.set(chosen.id,new Set());anchors.get(chosen.id).add(purpose);
 }
 const nodes=[];
 for(const binding of bindings){const option=stageOption(binding,[...(anchors.get(binding.stageId)??[])]);decisions.push(candidateTrace(`stage-purpose:${binding.stageId}`,option.purposes,option.stage?.purposeIds.join('+')??null));decisions.push(candidateTrace(`stage-environment:${binding.stageId}`,option.environments,option.stage?.environmentId??null));if(option.stage)nodes.push(option.stage);}
 const graph=buildStageGraph({entryStageId:registry.entryStageId,requiredStageIds:[...anchors.keys()],range:template.stageRange,nodes,transitions:Object.values(registry.tables.missionTransition),identity});decisions.push(...graph.decisions);
 if(graph.status!=='COMPOSED')return finish(null,graph.reason);
 const objectives=template.objectives.map(o=>{const role=roles.find(r=>r.roleId===o.roleId);return {...o,instanceId:role.instanceId,stageId:role.stageId};});
 const factSockets=[...new Set(objectives.map(o=>o.factRoleId).filter(Boolean))].sort(compare).map(factRoleId=>({factRoleId,status:'UNRESOLVED',truth:null}));
 const draft={format:'mission-author-draft-1',status:'SKELETON',destinationId:selection.destinationId,hookId:selection.hookId,patternId:selection.patternId,sourceMissionId:registry.missionId,entryStageId:registry.entryStageId,exitStageId:registry.entryStageId,stages:nodes.filter(n=>graph.stageIds.includes(n.stageId)),transitions:graph.transitions.map(e=>({transitionId:e.transitionId,sourceTransitionId:e.transitionId,fromStageId:e.fromStageId,toStageId:e.toStageId,accessStatus:'UNRESOLVED'})),roles,objectives,factSockets};
 return finish(validateDraft(draft,{foundation,pack,context,registry,templates}));
}
