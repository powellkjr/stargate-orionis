import {freeze,fail,object} from './contracts.mjs';
import {compare} from './determinism.mjs';
import {validateCatalogs} from './catalogs.mjs';
import {validateContext} from './adapters.mjs';
import {composeFoundation} from './selection.mjs';
import {validateDraft,validateSkeletons} from './draft.mjs';
import {validateInformation,validateInformationDraft} from './information.mjs';
import {validateDynamics,validateDynamicDraft} from './dynamics.mjs';
import {composeResults,validateResults,validateResultDraft} from './results.mjs';
import {summarizeValidatedDraft} from './readiness.mjs';
function inputs(request,bundle){
 const {registry}=bundle,pack=validateCatalogs(bundle.pack,registry),context=validateContext(bundle.context,registry),templates=validateSkeletons(bundle.templates,pack),information=validateInformation(bundle.information,pack,registry),dynamics=validateDynamics(bundle.dynamics,pack,registry),results=validateResults(bundle.results,pack,registry),foundation=composeFoundation(request,bundle.pack,bundle.context,registry);
 if(foundation.status!=='COMPOSED')fail([foundation.reason]);
 return {registry,pack,context,templates,information,dynamics,results,foundation,request:foundation.trace.identity.request};
}
function validateCore(draft,i){
 if(!object(draft)||!object(draft.dynamic)||!object(draft.dynamic.information))fail(['Complete nested result Draft required']);
 const information=draft.dynamic.information,skeleton=validateDraft(information.skeleton,i);
 validateInformationDraft(information,{...i,skeleton});
 // This verifies recovery payloads/consequences before attempting any dynamic repair.
 validateResultDraft(draft,{...i,dynamic:draft.dynamic});
 return information;
}
export function validateWholeDraft(draft,request,bundle){
 const i=inputs(request,bundle),information=validateCore(draft,i);
 validateDynamicDraft(draft.dynamic,{...i,information});return freeze(structuredClone(draft));
}
export function reviewDraft(draft,request,bundle,{repair=true}={}){
 const audit=[],finish=(status,value,reason=null)=>freeze({format:'mission-author-review-1',status,draft:value,reason,repair:{passes:audit.length?1:0,changes:audit}});
 try{return finish('VALID',validateWholeDraft(draft,request,bundle));}catch(error){
  if(!repair)return finish('INVALID',null,error.message);
 }
 try{
  const i=inputs(request,bundle),information=validateCore(draft,i),copy=structuredClone(draft),dynamic=copy.dynamic;
  if(Object.keys(dynamic).some(k=>!['format','status','information','incidents','events','complications'].includes(k))||dynamic.format!=='mission-author-dynamic-draft-1'||dynamic.status!=='DYNAMICS')fail(['Unsupported dynamic identity/fields cannot be repaired']);
  for(const key of ['incidents','events','complications'])if(!Array.isArray(dynamic[key]))fail([`Malformed ${key} array cannot be repaired`]);
  const source=Object.fromEntries(['incidents','events','complications'].map(k=>[k,dynamic[k]]));dynamic.incidents=[];dynamic.events=[];dynamic.complications=[];
  for(const key of ['incidents','events','complications'])for(const row of [...source[key]].sort((a,b)=>compare(String(a?.possibilityId??''),String(b?.possibilityId??'')))){
   dynamic[key].push(row);
   try{validateDynamicDraft(dynamic,{...i,information});}catch(error){dynamic[key].pop();audit.push({path:`dynamic.${key}`,possibilityId:row?.possibilityId??null,action:'REMOVE_OPTIONAL_CHOICE',reason:error.message});}
  }
  // Validation is mandatory after the one bounded pass; no further retries.
  return finish('REPAIRED',validateWholeDraft(copy,request,bundle));
 }catch(error){return finish('INVALID',null,error.message);}
}
export function composeReview(request,bundle){
 const {pack,context,registry,templates,information,dynamics,results}=bundle;
 const composition=structuredClone(composeResults(request,pack,context,registry,templates,information,dynamics,results));
 composition.trace.warnings.push('No authored story-beat pack is registered; story-beat constraints remain unsupported.');
 if(composition.status!=='COMPOSED')return freeze({format:'mission-author-review-result-1',status:'UNRESOLVED',draft:null,reason:composition.reason,trace:composition.trace,repair:{passes:0,changes:[]}});
 const review=reviewDraft(composition.draft,request,bundle);
 return freeze({format:'mission-author-review-result-1',status:review.status,draft:review.draft,reason:review.reason,trace:composition.trace,repair:review.repair});
}
export function exportReview(result,request,bundle){
 if(!result.draft)fail(['No validated Draft to export']);
 const draft=validateWholeDraft(result.draft,request,bundle);
 return freeze({format:'mission-author-review-export-1',request:structuredClone(request),context:structuredClone(bundle.context),versions:{catalogPack:bundle.pack.version,templates:bundle.templates.version,information:bundle.information.version,dynamics:bundle.dynamics.version,results:bundle.results.version},draft,trace:result.trace??null,repair:result.repair,readiness:summarizeValidatedDraft(draft,bundle.registry)});
}
export function assessReadiness(draft,request,bundle){return summarizeValidatedDraft(validateWholeDraft(draft,request,bundle),bundle.registry);}
export function exportText(result,request,bundle){return JSON.stringify(exportReview(result,request,bundle),null,2)+'\n';}
