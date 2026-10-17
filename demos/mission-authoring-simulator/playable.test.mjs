import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {authorMission,validatePlayable,playableText} from './playable.mjs';
import {createRuntime,chooseGate} from '../shared/offworld/runtime.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
const source=read('offworld/missing-operative-001.finalized'),catalog={...read('offworld/archetypes'),itemDefinitions:read('item')};
const details={missionId:'rescue-002',title:'Rescue variant',briefing:'Find the operative and return to the Gate.'};
test('authoring preserves physical identities and executable content without modifying the template',()=>{
 const before=structuredClone(source),raw=authorMission(source,details);
 assert.deepEqual(source,before);assert.equal(raw.mission.missionId,details.missionId);
 for(const key of ['instances','recipes','stages','objectives','startingKnowledge'])assert.deepEqual(raw[key],source[key]);
 const exported=JSON.parse(playableText(raw,catalog));assert.deepEqual(exported,raw);
 const {definition,summary}=validatePlayable(exported,catalog);assert.equal(summary.startStageId,source.gate.stageId);
 const runtime=createRuntime(definition,[read('offworld/party-presets').units[0]],'2000-01-01T00:00:00Z');
 chooseGate(definition,runtime,true);assert.equal(runtime.currentStageId,source.gate.stageId);
});
test('invalid references and semantic Drafts cannot be exported as playable missions',()=>{
 const raw=authorMission(source,details);raw.objectives[0].completionCondition.instanceId='missing';
 assert.throws(()=>playableText(raw,catalog),/unknown instances reference/);
 assert.throws(()=>authorMission({format:'mission-author-review-export-1'},details),/Semantic Drafts need a Finalizer/);
 assert.throws(()=>authorMission(source,{...details,missionId:'../bad'}),/Mission ID/);
});
