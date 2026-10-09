import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadFixtures} from './fixtures.mjs';
import {composeReview,assessReadiness,exportReview} from '../shared/mission-author/review.mjs';
import {renderReview} from './render.mjs';
const bundle=await loadFixtures(p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url))));
const request={version:1,seed:104729,actId:'BENCHMARK_CONTEXT',patternId:'LOCATE_EVACUATE'};

test('readiness keeps source coverage separate from executable bindings and admission',()=>{
 const result=composeReview(request,bundle),before=JSON.stringify({draft:result.draft,bundle}),r=assessReadiness(result.draft,request,bundle);
 assert.equal(r.status,'NOT_FINALIZED');assert.equal(r.summary.missingSourceReferences,0);assert(r.summary.unresolvedChecks>0);assert(r.blockers.some(b=>b.includes('Finalizer')));
 assert(r.rows.filter(row=>row.section==='OBJECTIVES').every(row=>row.unresolved.some(s=>s.includes('completion conditions'))));
 const recovery=result.draft.recoveryIntents[0],row=r.rows.find(row=>row.section==='RECOVERY'&&row.id===recovery.recoveryIntentId);
 assert.deepEqual(row.requirements.methods,recovery.methods);assert.equal(row.requirements.capacity.status,'PENDING_SHARED_ADMISSION');
 assert(Object.isFrozen(r.rows));assert.equal(JSON.stringify({draft:result.draft,bundle}),before);assert.deepEqual(assessReadiness(result.draft,request,bundle),r);
});
test('readiness rejects forged Facts, objective identities and recovery costs before reporting',()=>{
 const result=composeReview(request,bundle);
 for(const change of [d=>d.dynamic.information.facts[0].truth.stageId='fake-stage',d=>d.dynamic.information.skeleton.objectives[0].instanceId='fake-person',d=>d.recoveryIntents[0].handlingCost.value=999]){
  const draft=structuredClone(result.draft);change(draft);assert.throws(()=>assessReadiness(draft,request,bundle));
 }
 assert.throws(()=>assessReadiness(null,request,bundle));
});
test('export recomputes readiness and does not trust imported report metadata',()=>{
 const result=composeReview(request,bundle),first=exportReview(result,request,bundle);
 const forged={...result,readiness:{status:'PLAYABLE',blockers:[]}};
 assert.deepEqual(exportReview(forged,request,bundle),first);assert.equal(first.readiness.status,'NOT_FINALIZED');assert.deepEqual(first.draft,result.draft);
 assert.deepEqual(first.readiness,assessReadiness(result.draft,request,bundle));
 const html=renderReview({...result,readiness:first.readiness});assert(html.includes('Finalizer readiness'));assert(html.includes('NOT_FINALIZED'));assert(html.includes('completion conditions'));
});
test('all benchmark patterns retain available Gate/Event/Incident provenance and clue prerequisites',()=>{
 const b={...bundle,context:structuredClone(bundle.context)};b.context.knownFacts.push('lab-device-characterized');
 const covered=new Set();
 for(const patternId of ['LOCATE_EVACUATE','INVESTIGATE','RECOVER'])for(let seed=0;seed<8;seed++){
  const req={...request,patternId,seed},result=composeReview(req,b),r=assessReadiness(result.draft,req,b);assert.equal(r.summary.missingSourceReferences,0);
  for(const row of r.rows){for(const source of row.sources)covered.add(source.kind);if(row.section==='CLUES')assert.deepEqual(row.requirements,result.draft.dynamic.information.clues.find(c=>c.clueId===row.id).prerequisites);}
 }
 for(const kind of ['gate','missionEventBinding','missionIncident','missionObservation','missionDialogue'])assert(covered.has(kind),`Uncovered source ${kind}`);
});
