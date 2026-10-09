import {loadFixtures} from './fixtures.mjs';
import {composeReview,reviewDraft,exportText,assessReadiness} from '../shared/mission-author/review.mjs';
import {renderReview} from './render.mjs';
const byId=id=>document.getElementById(id),status=byId('status');let fixtures,bundle,request,result;
function currentInputs(){
 const seed=byId('seed').value.trim();if(!seed)throw Error('Enter a nonempty seed.');
 bundle={...fixtures,context:structuredClone(fixtures.context)};
 if(byId('characterized').checked)bundle.context.knownFacts.push('lab-device-characterized');
 request={version:1,seed,actId:byId('act').value,destinationId:byId('destination').value};for(const id of ['hook','pattern'])if(byId(id).value)request[`${id}Id`]=byId(id).value;
}
function display(){if(result.draft)result={...result,readiness:assessReadiness(result.draft,request,bundle)};byId('review').innerHTML=renderReview(result);byId('export').disabled=!result.draft;status.textContent=result.draft?`${result.status} · author Draft ready to review`:`${result.status} · ${result.reason}`;}
function report(error){result=null;byId('export').disabled=true;byId('review').replaceChildren();status.textContent=`Validation error: ${error.message}`;}
byId('requestForm').addEventListener('submit',event=>{event.preventDefault();try{currentInputs();result=composeReview(request,bundle);display();}catch(error){report(error);}});
// A changed control invalidates the displayed export until a fresh review.
for(const id of ['seed','act','destination','hook','pattern','characterized'])byId(id).addEventListener('input',()=>{result=null;byId('export').disabled=true;status.textContent='Inputs changed. Compose or review a Draft with these settings.';byId('review').replaceChildren();});
byId('export').addEventListener('click',()=>{try{const blob=new Blob([exportText(result,request,bundle)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mission-author-draft-and-trace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){report(error);}});
byId('import').addEventListener('change',async event=>{try{const file=event.target.files[0];if(!file)return;currentInputs();const imported=JSON.parse(await file.text()),draft=imported.format==='mission-author-review-export-1'?imported.draft:imported;result=reviewDraft(draft,request,bundle,{repair:byId('repair').checked});result={...result,trace:{format:'mission-author-import-review-trace-1',identity:{request,context:bundle.context},decisions:[],warnings:['Imported Draft validated against current controls and authored fixtures. Its original generation trace is not verified.','Author-only Reality. Runtime execution, capacity and consequence application remain unresolved.']}};display();}catch(error){report(error);}finally{event.target.value='';}});
try{
 fixtures=await loadFixtures(async path=>{const response=await fetch(`../shared/data/${path}.json`);if(!response.ok)throw Error(`Could not load ${path}: HTTP ${response.status}`);return response.json();});
 byId('destination').add(new Option(fixtures.registry.destinationId,fixtures.registry.destinationId));
 for(const [id,family] of [['hook','MISSION_HOOK_CATALOG'],['pattern','MISSION_PATTERN_CATALOG']]){byId(id).add(new Option('Automatic authored selection',''));for(const row of fixtures.pack.catalogs[family].rows)byId(id).add(new Option(`${row.label}${row.support==='UNRESOLVED'?' (unsupported)':''}`,row.id));}
 byId('generate').disabled=false;byId('import').disabled=false;byId('requestForm').requestSubmit();
}catch(error){report(error);}
