import {object,identifier,version,freeze,fail} from './contracts.mjs';
import {validateCatalogs} from './catalogs.mjs';
import {validateContext,instanceStage} from './adapters.mjs';
import {composeSkeleton} from './skeleton.mjs';
import {catalogCandidates,selectCandidate} from './selection.mjs';
import {canonical,namedRandom,compare} from './determinism.mjs';
import {candidateTrace,resultTrace} from './trace.mjs';

const same=(a,b)=>{try{return canonical(a)===canonical(b);}catch{return false;}};
function fields(row,allowed,path,errors){for(const k of Object.keys(row))if(!allowed.includes(k))errors.push(`${path}: unsupported field ${k}`);}
export function validateInformation(input,pack,registry){
 const errors=[];
 if(!object(input))fail(['information bindings must be an object']);
 fields(input,['format','version','facts'],'information',errors);
 if(input.format!=='mission-author-information-1'||!version(input.version)||!Array.isArray(input.facts))errors.push('information format, version and facts required');
 const index=Object.create(null),clueIds=new Set();
 for(const f of Array.isArray(input.facts)?input.facts:[]){
  if(!object(f)){errors.push('Fact binding must be an object');continue;}
  fields(f,['factRoleId','subjectRoleId','truth','clues'],f.factRoleId,errors);
  if(!pack.indexes.FACT_ROLE_CATALOG[f.factRoleId]||index[f.factRoleId]||!pack.indexes.MISSION_ROLE_CATALOG[f.subjectRoleId])errors.push(`Invalid/duplicate Fact binding ${f.factRoleId}`);else index[f.factRoleId]=f;
  if(!object(f.truth))errors.push(`${f.factRoleId}: truth resolver required`);
  else {fields(f.truth,['kind','tag'],f.factRoleId,errors);if(!['CURRENT_STAGE','REALITY_TAG'].includes(f.truth.kind)||f.truth.kind==='REALITY_TAG'&&!identifier(f.truth.tag)||f.truth.kind==='CURRENT_STAGE'&&f.truth.tag!==undefined)errors.push(`${f.factRoleId}: unsupported truth resolver`);}
  if(!Array.isArray(f.clues)||!f.clues.length)errors.push(`${f.factRoleId}: authored learning paths required`);
  for(const c of Array.isArray(f.clues)?f.clues:[]){
   if(!object(c)){errors.push('Clue binding must be an object');continue;}
   fields(c,['id','clueSourceId','intentId','source','knowledgeId'],c.id,errors);
   const family=pack.indexes.CLUE_SOURCE_CATALOG[c.clueSourceId];
   if(!identifier(c.id)||clueIds.has(c.id)||!family?.links.FACT_ROLE_CATALOG?.includes(f.factRoleId)||!pack.indexes.INTERACTION_INTENT_CATALOG[c.intentId]||!identifier(c.knowledgeId))errors.push(`Invalid/duplicate clue binding ${c.id}`);clueIds.add(c.id);
   if(!object(c.source))errors.push(`${c.id}: source reference required`);
   else {fields(c.source,['kind','id'],c.id,errors);if(!['missionObservation','missionDialogue'].includes(c.source.kind)||!registry.tables[c.source.kind]?.[c.source.id])errors.push(`${c.id}: unknown authored learning source`);}
  }
 }
 fail(errors);return freeze(structuredClone({...input,index}));
}

function subjectState(registry,destination,id){const def=registry.tables.missionInstance[id];return {...def.initialState,...destination.instanceStates?.[id]};}
function conditionKnowledge(condition){
 if(condition?.type==='KNOWLEDGE_PRESENT')return [condition.factId];
 if(condition?.type==='ALL')return (condition.conditions??[]).flatMap(conditionKnowledge);
 return []; // Opaque/alternative conditions stay intact for later execution resolution.
}
function knowledgeProducers(registry,knowledgeId){
 const found=[];
 for(const kind of ['missionObservation','missionDialogue','missionRecipe','missionWorkGroup'])for(const [id,row] of Object.entries(registry.tables[kind])){
  const effects=kind==='missionDialogue'?row.onStartEffects??[]:[...(row.effects??[]),...(row.onCompleteEffects??[])];
  if(row.revealsFacts?.includes(knowledgeId)||effects.some(e=>e.type==='ADD_KNOWLEDGE'&&(e.factId??e.knowledgeId)===knowledgeId))found.push({kind,id});
 }
 return found.sort((a,b)=>compare(`${a.kind}:${a.id}`,`${b.kind}:${b.id}`));
}
function resolveFact(binding,skeleton,destination,registry){
 const role=skeleton.roles.find(r=>r.roleId===binding.subjectRoleId);
 if(!role)return {reason:`Required Fact subject role ${binding.subjectRoleId} is not bound.`};
 const state=subjectState(registry,destination,role.instanceId);
 if(state.alive===false||['FLED','DEAD'].includes(state.combatState)||state.custody&&state.custody!=='LOCAL')return {reason:'Fact subject is no longer locally present.'};
 let truth;
 if(binding.truth.kind==='CURRENT_STAGE')truth={kind:'CURRENT_STAGE',instanceId:role.instanceId,stageId:instanceStage(registry,destination,role.instanceId)};
 else {
  if(!state.physicalItem?.reality.authoredTags?.includes(binding.truth.tag))return {reason:`Authored Reality tag ${binding.truth.tag} is absent from ${role.instanceId}.`};
  truth={kind:'REALITY_TAG',instanceId:role.instanceId,tag:binding.truth.tag};
 }
 return {fact:{factRoleId:binding.factRoleId,subjectRoleId:binding.subjectRoleId,status:'RESOLVED',truth,visibility:'AUTHOR_ONLY'}};
}
function evaluateClue(c,fact,{pack,context,destination,registry,skeleton,request}){
 const inputs={pack,context,destination,registry,request},family=pack.indexes.CLUE_SOURCE_CATALOG[c.clueSourceId],intent=pack.indexes.INTERACTION_INTENT_CATALOG[c.intentId];
 const source=registry.tables[c.source.kind][c.source.id],id=fact.truth.instanceId,def=registry.tables.missionInstance[id],stageId=instanceStage(registry,destination,id),state=subjectState(registry,destination,id);
 const familyEvaluation=catalogCandidates(pack,'CLUE_SOURCE_CATALOG',inputs).find(r=>r.id===c.clueSourceId),intentEvaluation=catalogCandidates(pack,'INTERACTION_INTENT_CATALOG',inputs).find(r=>r.id===c.intentId);
 const reasons=[...familyEvaluation.reasons,...intentEvaluation.reasons];
 const archetypes=family.refs.filter(r=>r.kind==='instanceArchetype');if(archetypes.length&&!archetypes.some(r=>r.id===def.archetypeId))reasons.push('CLUE_SUBJECT_ARCHETYPE_MISMATCH');
 if(!skeleton.stages.some(s=>s.stageId===stageId))reasons.push('SOURCE_OUTSIDE_DRAFT');
 let profession=null,knowledgeIds=[],sourceStateRequirement=null,minimumTier=0,minimumPerception=0,sourceConditions=[];
 if(c.source.kind==='missionObservation'){
  if(source.subjectInstanceId!==id)reasons.push('SOURCE_SUBJECT_MISMATCH');
  if(source.stageId!==stageId)reasons.push('SOURCE_LOCATION_MISMATCH');
  if(!source.implemented||!source.revealsFacts?.includes(c.knowledgeId))reasons.push('SOURCE_DOES_NOT_REVEAL_FACT');
  profession=source.profession==='UNTRAINED'?null:source.profession.toLowerCase();knowledgeIds=[...(source.requiresKnowledge??[])];sourceStateRequirement=source.requiresState??null;minimumTier=source.minimumTier??0;minimumPerception=source.minimumPerception??0;
  if(!intent.refs.some(r=>r.kind==='observationArchetype'&&r.id===source.archetypeId))reasons.push('INTENT_SOURCE_MISMATCH');
 }else{
  if(source.participants.right!==id)reasons.push('SOURCE_SUBJECT_MISMATCH');
  const start=source.nodes.find(n=>n.nodeId===source.startNodeId);
  if(start?.speaker!==id||!(source.onStartEffects??[]).some(e=>e.type==='ADD_KNOWLEDGE'&&(e.knowledgeId??e.factId)===c.knowledgeId&&!e.when))reasons.push('SOURCE_DOES_NOT_REVEAL_FACT');
  if(!intent.refs.some(r=>r.kind==='missionDialogue'&&r.id===c.source.id))reasons.push('INTENT_SOURCE_MISMATCH');
  if(['DOWN','DEAD','FLED','CAPTURED'].includes(state.combatState))reasons.push('SPEAKER_UNAVAILABLE');
  sourceConditions=[...(source.conditions??[]),...(source.startWhen?[source.startWhen]:[])];
 }
 if(profession&&!registry.tables.profession[profession])reasons.push('UNKNOWN_SOURCE_PROFESSION');
 knowledgeIds=[...new Set([...knowledgeIds,...conditionKnowledge(sourceStateRequirement),...sourceConditions.flatMap(conditionKnowledge),...conditionKnowledge(def.revealedWhen)])].sort(compare);
 const prerequisites={knowledgeIds,sourceStateRequirement,sourceConditions,subjectVisibilityRequirement:def.revealedWhen??null,minimumTier,minimumPerception};
 const missingKnown=knowledgeIds.filter(k=>!context.knownFacts.includes(k));
 const prerequisiteSources=missingKnown.map(knowledgeId=>({knowledgeId,producers:knowledgeProducers(registry,knowledgeId)}));
 for(const p of prerequisiteSources)if(!p.producers.length)reasons.push(`UNSUPPORTED_KNOWLEDGE_PATH: ${p.knowledgeId}`);
 const clue={clueId:c.id,factRoleId:fact.factRoleId,clueSourceId:c.clueSourceId,source:c.source,instanceId:id,stageId,knowledgeId:c.knowledgeId,prerequisites,accessStatus:'UNRESOLVED',visibility:'AUTHOR_ONLY'};
 const interaction={interactionId:c.id,intentId:c.intentId,clueId:c.id,instanceId:id,stageId,professionId:profession,status:'BENCHMARK_REFERENCE',missingKnownPrerequisites:missingKnown,prerequisiteSources,executionStatus:'UNRESOLVED'};
 return {id:c.id,weight:family.weight,availability:familyEvaluation.availability==='PREFERRED'||intentEvaluation.availability==='PREFERRED'?'PREFERRED':'AVAILABLE',reasons,clue,interaction};
}
export function deriveProfessionOpportunities(registry){
 // No method contract exists in the current import: do not reinterpret prose as powers.
 return freeze({status:'UNRESOLVED',reasons:[...registry.warnings.filter(w=>w.includes('fieldGuidance')||w.includes('curricula')),'No executable field-method adapter is supplied; source Profession references do not establish general domain methods.']});
}
function inputsFor(skeleton,pack,context,registry,request){return {skeleton,pack,context,registry,request,destination:context.destinations.find(d=>d.id===skeleton.destinationId)};}
export function validateInformationDraft(draft,{skeleton,pack,context,registry,request,information}){
 const errors=[];
 if(!object(draft))fail(['Information Draft must be an object']);
 fields(draft,['format','status','skeleton','facts','clues','interactions','opportunityDerivation'],'Information Draft',errors);
 if(draft.format!=='mission-author-information-draft-1'||draft.status!=='INFORMATION'||!same(draft.skeleton,skeleton))errors.push('Information Draft identity/skeleton mismatch');
 const inputs=inputsFor(skeleton,pack,context,registry,request),facts=Array.isArray(draft.facts)?draft.facts:[],clues=Array.isArray(draft.clues)?draft.clues:[],interactions=Array.isArray(draft.interactions)?draft.interactions:[];
 if(facts.length!==skeleton.factSockets.length||clues.length!==facts.length||interactions.length!==facts.length)errors.push('Required Fact/path/interaction coverage missing');
 for(const [i,socket] of skeleton.factSockets.entries()){
  const policy=catalogCandidates(pack,'FACT_ROLE_CATALOG',inputs).find(r=>r.id===socket.factRoleId);
  if(!policy||policy.reasons.length)errors.push(`Unavailable Fact Role ${socket.factRoleId}`);
  const binding=information.index[socket.factRoleId],resolved=binding&&resolveFact(binding,skeleton,inputs.destination,registry);
  if(!resolved?.fact||!same(facts[i],resolved.fact)){errors.push(`Invalid Reality truth ${socket.factRoleId}`);continue;}
  const candidate=binding.clues.map(c=>evaluateClue(c,resolved.fact,inputs)).find(c=>c.id===clues[i]?.clueId);
  if(!candidate||candidate.reasons.length||!same(clues[i],candidate.clue)||!same(interactions[i],candidate.interaction))errors.push(`Invalid learning path/interaction ${socket.factRoleId}`);
 }
 if(!same(draft.opportunityDerivation,deriveProfessionOpportunities(registry)))errors.push('Unsupported domain opportunity derivation');
 fail(errors);return freeze(structuredClone(draft));
}
export function composeInformation(request,rawPack,rawContext,registry,templates,rawInformation){
 const pack=validateCatalogs(rawPack,registry),context=validateContext(rawContext,registry),information=validateInformation(rawInformation,pack,registry),base=composeSkeleton(request,rawPack,rawContext,registry,templates);
 const identity={...base.trace.identity,informationVersion:information.version},decisions=[...base.trace.decisions],warnings=[...base.trace.warnings];
 const finish=(draft,reason=null)=>freeze({format:'mission-author-information-result-1',status:draft?'COMPOSED':'UNRESOLVED',draft,reason,trace:resultTrace(identity,decisions,warnings)});
 if(base.status!=='COMPOSED')return finish(null,base.reason);
 const skeleton=base.draft,inputs=inputsFor(skeleton,pack,context,registry,base.trace.identity.request),facts=[],clues=[],interactions=[];
 for(const socket of skeleton.factSockets){
  const binding=information.index[socket.factRoleId];if(!binding)return finish(null,`No authored truth/learning binding for ${socket.factRoleId}.`);
  const policy=catalogCandidates(pack,'FACT_ROLE_CATALOG',inputs).find(r=>r.id===socket.factRoleId);decisions.push(candidateTrace(`fact:${socket.factRoleId}`,[policy],policy.reasons.length?null:policy.id));
  if(policy.reasons.length)return finish(null,`Fact Role ${socket.factRoleId} is unavailable: ${policy.reasons.join(', ')}.`);
  const resolved=resolveFact(binding,skeleton,inputs.destination,registry);if(resolved.reason)return finish(null,resolved.reason);
  const candidates=binding.clues.map(c=>evaluateClue(c,resolved.fact,inputs)).sort((a,b)=>compare(a.id,b.id));
  const chosen=selectCandidate(candidates,namedRandom(identity,'clues',socket.factRoleId));
  decisions.push(candidateTrace(`clues:${socket.factRoleId}`,candidates,chosen?.id??null));
  if(!chosen)return finish(null,`No legitimate learning path for ${socket.factRoleId}.`);
  facts.push(resolved.fact);clues.push(chosen.clue);interactions.push(chosen.interaction);
 }
 const draft={format:'mission-author-information-draft-1',status:'INFORMATION',skeleton,facts,clues,interactions,opportunityDerivation:deriveProfessionOpportunities(registry)};
 warnings.push(...draft.opportunityDerivation.reasons);
 return finish(validateInformationDraft(draft,{...inputs,information}));
}
// Explicit caller Known state is the only player-facing information authority.
// Truth values stay private even when a broad observation is already Known.
export function projectInformationKnowledge(draft,knownFacts){
 if(!Array.isArray(knownFacts)||knownFacts.some(k=>!identifier(k)))fail(['Known facts must be strings']);
 return freeze({format:'mission-author-known-information-1',knownClues:draft.clues.filter(c=>knownFacts.includes(c.knowledgeId)).map(c=>({knowledgeId:c.knowledgeId}))});
}
