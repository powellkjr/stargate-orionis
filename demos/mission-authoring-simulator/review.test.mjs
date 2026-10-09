import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadFixtures} from './fixtures.mjs';
import {composeReview,reviewDraft,validateWholeDraft,exportText} from '../shared/mission-author/review.mjs';
import {renderReview} from './render.mjs';
const bundle=await loadFixtures(p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url))));
const request={version:1,seed:104729,actId:'BENCHMARK_CONTEXT',patternId:'INVESTIGATE'};
function withIncident(){for(let seed=0;seed<30;seed++){const r={...request,seed},result=composeReview(r,bundle);if(result.draft?.dynamic.incidents.length)return {request:r,result};}throw Error('No Incident fixture');}
test('whole review validates every layer and exports deterministic versioned Draft/trace/context',()=>{
 const first=composeReview(request,bundle);assert.equal(first.status,'VALID');assert.equal(first.repair.passes,0);assert.deepEqual(composeReview(request,bundle),first);assert.deepEqual(validateWholeDraft(first.draft,request,bundle),first.draft);
 const text=exportText(first,request,bundle),parsed=JSON.parse(text);assert.equal(parsed.format,'mission-author-review-export-1');assert.deepEqual(parsed.request,request);assert.deepEqual(parsed.context,bundle.context);assert.deepEqual(parsed.draft,first.draft);assert.deepEqual(parsed.trace,first.trace);assert.equal(exportText(first,request,bundle),text);
});
test('one repair pass removes invalid optional choices while preserving core and request pins',()=>{
 const {request:r,result}=withIncident(),draft=structuredClone(result.draft),before=JSON.stringify(bundle),pins=structuredClone(r);draft.dynamic.incidents[0].subjectInstanceIds=['forged-person'];
 assert.equal(reviewDraft(draft,r,bundle,{repair:false}).status,'INVALID');const repaired=reviewDraft(draft,r,bundle);assert.equal(repaired.status,'REPAIRED');assert.equal(repaired.repair.passes,1);assert(repaired.repair.changes.length);validateWholeDraft(repaired.draft,r,bundle);
 assert.deepEqual(repaired.draft.dynamic.information,result.draft.dynamic.information);assert.deepEqual(repaired.draft.recoveryIntents,result.draft.recoveryIntents);assert.deepEqual(repaired.draft.consequences,result.draft.consequences);assert.deepEqual(r,pins);assert.equal(JSON.stringify(bundle),before);assert.deepEqual(reviewDraft(draft,r,bundle),repaired);assert.equal(reviewDraft(repaired.draft,r,bundle).repair.passes,0);
});
test('repair removes forged/dependent Events and over-limit duplicates in a single bounded pass',()=>{
 const {request:r,result}=withIncident(),draft=structuredClone(result.draft);draft.dynamic.events.push({possibilityId:'unbound-event'});draft.dynamic.incidents.push(draft.dynamic.incidents[0],draft.dynamic.incidents[0]);const repaired=reviewDraft(draft,r,bundle);assert.equal(repaired.status,'REPAIRED');assert.equal(repaired.repair.passes,1);assert(repaired.draft.dynamic.incidents.length<=2);assert(!repaired.draft.dynamic.events.some(e=>e.possibilityId==='unbound-event'));
});
test('Fact truth, identity, objectives, costs and institutional grants cannot be repaired',()=>{
 const result=composeReview(request,bundle);for(const mutate of [d=>d.dynamic.information.facts[0].truth.stageId='stage-gate-yard',d=>d.dynamic.information.skeleton.objectives[0].instanceId='clone',d=>d.recoveryIntents.push({instanceId:'clone'}),d=>d.knowledge=['ADVANCED_THEORY'],d=>d.dynamic.knowledge=['secret']]){const draft=structuredClone(result.draft);mutate(draft);assert.equal(reviewDraft(draft,request,bundle).status,'INVALID');}
 const other={...request,patternId:'LOCATE_EVACUATE'};assert.equal(reviewDraft(result.draft,other,bundle).status,'INVALID');
});
test('required composition gaps remain unresolved and unusable Drafts cannot export',()=>{
 const d={...bundle,results:{...bundle.results,requiredRecovery:[]}},r={...request,patternId:'LOCATE_EVACUATE'},result=composeReview(r,d);assert.equal(result.status,'UNRESOLVED');assert.equal(result.draft,null);assert.equal(result.repair.passes,0);assert.throws(()=>exportText(result,r,d),/No validated Draft/);
});
test('review presentation escapes authored text and shows source/requirements/trace independently',()=>{
 const result=composeReview({...request,patternId:'LOCATE_EVACUATE'},bundle),html=renderReview(result);assert(html.includes('Mission spine'));assert(html.includes('Selection trace'));assert(html.includes('Shared admission pending'));assert(html.includes('Author-only truth'));assert(!renderReview({status:'INVALID',reason:'<img src=x onerror=alert(1)>',trace:{warnings:['<script>bad</script>']}}).includes('<script>'));assert(renderReview({status:'INVALID',reason:'<img src=x>'}).includes('&lt;img'));
});
