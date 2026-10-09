import {object,identifier,strings,version,freeze,fail} from './contracts.mjs';
import {validateCatalogs} from './catalogs.mjs';
import {validateContext,instanceStage} from './adapters.mjs';
import {composeDynamics} from './dynamics.mjs';
import {catalogCandidates,selectCandidate} from './selection.mjs';
import {canonical,namedRandom,compare} from './determinism.mjs';
import {candidateTrace,resultTrace} from './trace.mjs';
import {npcEffectTypes} from '../offworld/npc.mjs';
const same=(a,b)=>{try{return canonical(a)===canonical(b);}catch{return false;}};
function fields(row,allowed,path,errors){for(const k of Object.keys(row))if(!allowed.includes(k))errors.push(`${path}: unsupported field ${k}`);}
export function validateResults(input,pack,registry){
 const errors=[];if(!object(input))fail(['result bindings must be an object']);
 fields(input,['format','version','requiredRecovery','opportunities','consequences'],'results',errors);
 if(input.format!=='mission-author-results-1'||!version(input.version))errors.push('result format/version required');
 const ids=new Set();
 for(const group of ['requiredRecovery','opportunities']){
  if(!Array.isArray(input[group])){errors.push(`${group}: bindings required`);continue;}
  const subjects=new Set();
  for(const r of input[group]){
   if(!object(r)){errors.push('recovery binding must be an object');continue;}
   fields(r,group==='requiredRecovery'?['id','recoveryRoleId','methodIds','patternId','objectiveId','subjectRoleId']:['id','recoveryRoleId','methodIds','instanceId','catalogId','patternIds'],r.id,errors);
   if(!identifier(r.id)||ids.has(r.id)||!pack.indexes.RECOVERY_ROLE_CATALOG[r.recoveryRoleId]||!strings(r.methodIds)||!r.methodIds.length)errors.push(`invalid/duplicate recovery binding ${r.id}`);ids.add(r.id);
   for(const id of Array.isArray(r.methodIds)?r.methodIds:[])if(!registry.tables.missionRecipe[id])errors.push(`${r.id}: unknown source method ${id}`);
   if(group==='requiredRecovery'){
    if(!pack.indexes.MISSION_PATTERN_CATALOG[r.patternId]||!pack.indexes.MISSION_ROLE_CATALOG[r.subjectRoleId]||!identifier(r.objectiveId))errors.push(`${r.id}: objective role binding required`);
    const key=`${r.patternId}:${r.objectiveId}`;if(subjects.has(key))errors.push(`${r.id}: duplicate objective binding`);subjects.add(key);
   }else{
    const catalog=pack.indexes.OPTIONAL_OPPORTUNITY_CATALOG[r.catalogId];
    if(!registry.tables.missionInstance[r.instanceId]||subjects.has(r.instanceId)||!catalog?.links.RECOVERY_ROLE_CATALOG?.includes(r.recoveryRoleId)||!strings(r.patternIds)||!r.patternIds.length||r.patternIds.some(id=>!pack.indexes.MISSION_PATTERN_CATALOG[id]))errors.push(`${r.id}: invalid opportunity subject/pattern/recovery role`);subjects.add(r.instanceId);
   }
  }
 }
 const seen=new Set();if(!Array.isArray(input.consequences))errors.push('consequence policies required');
 else for(const c of input.consequences){
  if(!object(c)){errors.push('consequence policy must be an object');continue;}
  fields(c,['catalogId','from'],'consequence',errors);
  if(!pack.indexes.CONSEQUENCE_TYPE_CATALOG[c.catalogId]||seen.has(c.catalogId)||!({CUSTODY:'RECOVERY',KNOWLEDGE:'CLUES',NPC_STATE:'OPPORTUNITY_METHODS'}[c.catalogId]===c.from))errors.push('unsupported/duplicate consequence policy');seen.add(c.catalogId);
 }
 fail(errors);return freeze(structuredClone(input));
}
const state=(inputs,id)=>({...inputs.registry.tables.missionInstance[id].initialState,...inputs.destination.instanceStates?.[id]});
function policy(inputs,family,id){return catalogCandidates(inputs.pack,family,inputs).find(c=>c.id===id);}
function methodReference(id,instanceId,inputs,reasons){
 const method=inputs.registry.tables.missionRecipe[id],target=inputs.registry.tables.missionTarget[method.targetId],stageId=instanceStage(inputs.registry,inputs.destination,instanceId);
 const producesSubject=(method.effects??[]).some(e=>e.type==='ADD_TO_PARTY_STORAGE'&&e.instanceId===instanceId);
 if(!method.implemented||!target?.implemented||target.instanceId!==instanceId&&!producesSubject)reasons.push(`METHOD_SUBJECT_MISMATCH: ${id}`);
 if(target?.stageId!==stageId||!inputs.stageIds.has(target?.stageId))reasons.push(`METHOD_LOCATION_MISMATCH: ${id}`);
 return {sourceMethodId:id,targetId:method.targetId,profession:method.profession,minimumTier:method.minimumTier,requiredToolService:method.requiredToolService,chargeCost:method.chargeCost,durationMinutes:method.durationMinutes,requiresKnowledge:method.requiresKnowledge??[],hiddenUntilKnowledge:method.hiddenUntilKnowledge??[],requiresState:method.requiresState??null,requiresLocated:method.requiresLocated??false,requiresGateRoute:method.requiresGateRoute??false,effects:method.effects??[],onCompleteEffects:method.onCompleteEffects??[],executionStatus:'UNRESOLVED'};
}
function itemCost(item,inputs){const def=inputs.registry.tables.item[item.itemId];if(!def||!Number.isSafeInteger(def.storage?.handlingCost)||def.storage.handlingCost<0||!Number.isSafeInteger(item.state.quantity)||item.state.quantity<1)return null;const cost=def.storage.handlingCost*item.state.quantity;return Number.isSafeInteger(cost)?cost:null;}
function recoveryCandidate(binding,instanceId,inputs){
 const p=policy(inputs,'RECOVERY_ROLE_CATALOG',binding.recoveryRoleId),reasons=[...p.reasons],definition=inputs.registry.tables.missionInstance[instanceId],s=state(inputs,instanceId),stageId=instanceStage(inputs.registry,inputs.destination,instanceId),person=definition.mapGlyph==='PERSON';
 if(!inputs.stageIds.has(stageId))reasons.push('SUBJECT_OUTSIDE_DRAFT');
 if(s.custody&&s.custody!=='LOCAL'||s.alive===false||['DEAD','FLED'].includes(s.combatState))reasons.push('SUBJECT_UNAVAILABLE');
 const methods=binding.methodIds.map(id=>methodReference(id,instanceId,inputs,reasons)),effects=methods.flatMap(m=>m.effects);
 let destination=null,cost=null,costSource=null,capacityOwner=null;
 if(binding.recoveryRoleId==='RECEIVING'){
  destination='RECEIVING';capacityOwner='SHARED_BASE_RECOVERY';
  if(person||definition.recovery?.category!=='RECEIVING'||!s.physicalItem||!effects.some(e=>e.type==='CARRY_TARGET'))reasons.push('RECEIVING_SUBJECT_OR_METHOD_MISMATCH');
  if(s.physicalItem){cost=itemCost(s.physicalItem,inputs);costSource='SHARED_ITEM_DEFINITIONS';for(const cargo of definition.cargo??[]){const cargoCost=itemCost(cargo,inputs);if(cargoCost===null){cost=null;break;}if(cost!==null){cost+=cargoCost;if(!Number.isSafeInteger(cost))cost=null;}}if(cost===null||cost<1)reasons.push('AUTHORED_ITEM_HANDLING_COST_MISSING');}
 }else if(binding.recoveryRoleId==='PARTY_STORAGE'){
  destination='PARTY_STORAGE';capacityOwner='SHARED_PARTY_STORAGE';
  if(person||!['PARTY_STORAGE','PARTY_STORAGE_WHEN_COLLECTED'].includes(definition.recovery?.category)||!effects.some(e=>e.type==='ADD_TO_PARTY_STORAGE'&&e.instanceId===instanceId))reasons.push('PARTY_CARGO_SUBJECT_OR_METHOD_MISMATCH');
 }else if(binding.recoveryRoleId==='HOLDING'){
  destination='HOLDING';capacityOwner='SHARED_BASE_RECOVERY';
  if(!person||!effects.some(e=>e.type==='SET_TARGET_STATE'&&e.field==='combatState'&&e.value==='CAPTURED'))reasons.push('HOLDING_SUBJECT_OR_METHOD_MISMATCH');
 }else if(binding.recoveryRoleId==='MISSION_EVACUEE'){
  destination='GATE';capacityOwner='MISSION_EVACUATION';
  if(!person||!effects.some(e=>e.type==='SEND_TARGET_TO_GATE'))reasons.push('EVACUEE_SUBJECT_OR_METHOD_MISMATCH');
 }else reasons.push('RECOVERY_ROUTING_ADAPTER_UNSUPPORTED');
 const value={recoveryIntentId:binding.id,instanceId,stageId,recoveryRoleId:binding.recoveryRoleId,destination,sourceCustody:s.custody??'LOCAL',physicalItem:s.physicalItem??null,cargo:definition.cargo??[],preparationRequired:definition.recovery?.requiresPreparation??false,subjectVisibilityRequirement:definition.revealedWhen??null,methods,handlingCost:{value:cost,source:costSource},capacity:{owner:capacityOwner,status:'PENDING_SHARED_ADMISSION'},transportStatus:'UNRESOLVED',applicationStatus:'NOT_APPLIED'};
 return {id:binding.id,weight:p.weight,availability:p.availability,reasons,value};
}
function optionalCandidate(row,inputs,required){
 const c=recoveryCandidate(row,row.instanceId,inputs),p=policy(inputs,'OPTIONAL_OPPORTUNITY_CATALOG',row.catalogId);c.reasons.push(...p.reasons);c.weight*=p.weight;if(p.availability==='PREFERRED')c.availability='PREFERRED';
 if(!row.patternIds.includes(inputs.skeleton.patternId))c.reasons.push('PATTERN_OPPORTUNITY_MISMATCH');if(required.some(r=>r.instanceId===row.instanceId))c.reasons.push('ALREADY_REQUIRED_RECOVERY');
 c.opportunity={opportunityId:row.id,catalogId:row.catalogId,instanceId:row.instanceId,recoveryIntentId:row.id,status:'BENCHMARK_REFERENCE'};return c;
}
function consequencePossibilities(results,recovery,opportunities,inputs,decisions){
 const output=[];
 for(const row of [...results.consequences].sort((a,b)=>compare(a.catalogId,b.catalogId))){
  const p=policy(inputs,'CONSEQUENCE_TYPE_CATALOG',row.catalogId);if(decisions)decisions.push(candidateTrace(`consequence:${row.catalogId}`,[p],p.reasons.length?null:p.id));if(p.reasons.length)continue;
  if(row.from==='RECOVERY')for(const r of recovery)output.push({consequenceId:`custody:${r.recoveryIntentId}`,catalogId:row.catalogId,source:{kind:'RECOVERY_INTENT',id:r.recoveryIntentId},instanceId:r.instanceId,intent:{destination:r.destination,requiresSharedAdmission:true},applicationStatus:'NOT_APPLIED'});
  if(row.from==='CLUES')for(const c of inputs.dynamic.information.clues)output.push({consequenceId:`knowledge:${c.clueId}`,catalogId:row.catalogId,source:{kind:'CLUE',id:c.clueId},instanceId:c.instanceId,intent:{knowledgeId:c.knowledgeId,requiresSourceCompletion:true,institutionalUnlock:false},applicationStatus:'NOT_APPLIED'});
  if(row.from==='OPPORTUNITY_METHODS')for(const o of opportunities){const r=recovery.find(r=>r.recoveryIntentId===o.recoveryIntentId);for(const m of r.methods){const effects=[...m.effects,...m.onCompleteEffects].filter(e=>npcEffectTypes.includes(e.type)||inputs.registry.tables.missionInstance[r.instanceId].mapGlyph==='PERSON'&&e.type==='SET_TARGET_STATE');for(const instanceId of [...new Set(effects.map(e=>e.instanceId??r.instanceId))].sort(compare)){if(inputs.registry.tables.missionInstance[instanceId]?.mapGlyph!=='PERSON')continue;output.push({consequenceId:`npc:${o.opportunityId}:${m.sourceMethodId}:${instanceId}`,catalogId:row.catalogId,source:{kind:'SOURCE_METHOD',id:m.sourceMethodId},instanceId,intent:{effects:effects.filter(e=>(e.instanceId??r.instanceId)===instanceId),requiresSourceCompletion:true},applicationStatus:'NOT_APPLIED'});}}}
 }
 return output.sort((a,b)=>compare(a.consequenceId,b.consequenceId));
}
function inputsFor(dynamic,pack,context,registry,request){const skeleton=dynamic.information.skeleton;return {dynamic,skeleton,pack,context,registry,request,destination:context.destinations.find(d=>d.id===skeleton.destinationId),stageIds:new Set(skeleton.stages.map(s=>s.stageId))};}
function requiredCandidates(results,inputs){
 return inputs.skeleton.objectives.filter(o=>['EVACUATE','RECOVER'].includes(o.intent)).map(o=>{
  const binding=results.requiredRecovery.find(r=>r.patternId===inputs.skeleton.patternId&&r.objectiveId===o.objectiveId&&r.subjectRoleId===o.roleId);
  return binding?recoveryCandidate(binding,o.instanceId,inputs):{id:o.objectiveId,weight:1,availability:'AVAILABLE',reasons:['REQUIRED_RECOVERY_BINDING_MISSING']};
 });
}
export function validateResultDraft(draft,{dynamic,pack,context,registry,request,results}){
 const errors=[];if(!object(draft))fail(['Result Draft must be an object']);fields(draft,['format','status','dynamic','opportunities','recoveryIntents','consequences'],'Result Draft',errors);
 if(draft.format!=='mission-author-result-draft-1'||draft.status!=='RESULT_INTENT'||!same(draft.dynamic,dynamic))errors.push('Result Draft identity/dynamic mismatch');
 const inputs=inputsFor(dynamic,pack,context,registry,request),required=requiredCandidates(results,inputs),opportunities=Array.isArray(draft.opportunities)?draft.opportunities:[],recovery=Array.isArray(draft.recoveryIntents)?draft.recoveryIntents:[],expected=[];
 if(!Array.isArray(draft.opportunities)||opportunities.length>2||!Array.isArray(draft.recoveryIntents))errors.push('Invalid opportunity/recovery arrays');
 for(const c of required)if(c.reasons.length)errors.push(`Invalid required recovery ${c.id}`);else expected.push(c.value);
 const seen=new Set();for(const o of opportunities){const binding=results.opportunities.find(r=>r.id===o?.opportunityId),c=binding&&optionalCandidate(binding,inputs,expected);if(!c||c.reasons.length||!same(o,c.opportunity)||seen.has(o.instanceId))errors.push(`Invalid optional opportunity ${o?.opportunityId}`);else expected.push(c.value);seen.add(o?.instanceId);}
 expected.sort((a,b)=>compare(a.recoveryIntentId,b.recoveryIntentId));if(!same(recovery,expected))errors.push('Forged/missing recovery identity, cost, requirements or capacity admission');
 if(!same(draft.consequences,consequencePossibilities(results,expected,opportunities.filter(o=>expected.some(r=>r.recoveryIntentId===o?.recoveryIntentId)),inputs)))errors.push('Forged consequence/Knowledge/NPC grant');
 fail(errors);return freeze(structuredClone(draft));
}
export function composeResults(request,rawPack,rawContext,registry,templates,information,dynamics,rawResults){
 const pack=validateCatalogs(rawPack,registry),context=validateContext(rawContext,registry),results=validateResults(rawResults,pack,registry),base=composeDynamics(request,rawPack,rawContext,registry,templates,information,dynamics);
 const identity={...base.trace.identity,resultsVersion:results.version},decisions=[...base.trace.decisions],warnings=[...base.trace.warnings,'Recovery intent does not admit capacity, establish secure transport, change custody, or apply consequences. Captive transport and general party-cargo capacity require shared-system resolution.'];
 const finish=(draft,reason=null)=>freeze({format:'mission-author-result-1',status:draft?'COMPOSED':'UNRESOLVED',draft,reason,trace:resultTrace(identity,decisions,warnings)});if(base.status!=='COMPOSED')return finish(null,base.reason);
 const dynamic=base.draft,inputs=inputsFor(dynamic,pack,context,registry,base.trace.identity.request),required=requiredCandidates(results,inputs),recovery=required.filter(c=>!c.reasons.length).map(c=>c.value);
 decisions.push(candidateTrace('required-recovery',required));if(required.some(c=>c.reasons.length))return finish(null,'Required recovery subject, source method or routing is unresolved.');
 const candidates=results.opportunities.map(r=>optionalCandidate(r,inputs,recovery)).sort((a,b)=>compare(a.id,b.id));decisions.push(candidateTrace('opportunities:candidates',candidates));
 const admitted=candidates.filter(c=>!c.reasons.length),count=Math.floor(namedRandom(identity,'optional opportunities','recovery-count')()*(Math.min(2,admitted.length)+1)),selected=[];
 for(let n=0;n<count;n++){const rows=admitted.filter(c=>!selected.includes(c)),chosen=selectCandidate(rows,namedRandom(identity,'optional opportunities',`recovery-choice:${n}`));selected.push(chosen);decisions.push(candidateTrace(`opportunity:${n}`,rows,chosen.id));recovery.push(chosen.value);}
 recovery.sort((a,b)=>compare(a.recoveryIntentId,b.recoveryIntentId));const opportunities=selected.map(c=>c.opportunity).sort((a,b)=>compare(a.opportunityId,b.opportunityId)),consequences=consequencePossibilities(results,recovery,opportunities,inputs,decisions);
 const draft={format:'mission-author-result-draft-1',status:'RESULT_INTENT',dynamic,opportunities,recoveryIntents:recovery,consequences};return finish(validateResultDraft(draft,{...inputs,results}));
}
