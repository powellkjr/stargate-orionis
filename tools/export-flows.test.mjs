import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {buildFlows,exportFlows,quote,repository,defaults,run} from './export-flows.mjs';

const mission=JSON.parse(readFileSync(resolve(repository,defaults.mission),'utf8'));
const files=buildFlows();
test('every authored dialogue node and response is exported, including unported scenes and variants',()=>{
 assert.equal([...files.keys()].filter(f=>f.startsWith('dialogue/')).length,mission.dialogueScenes.length);
 for(const scene of mission.dialogueScenes){const text=files.get('dialogue/'+scene.dialogueSceneId+'.puml');for(const node of scene.nodes){assert.ok(text.includes(node.nodeId),node.nodeId);for(const response of node.responses??[]){assert.ok(text.includes(response.responseId),response.responseId);assert.ok(text.includes(response.nextNodeId??'END CONVERSATION'));}}for(const variant of scene.variants??[])assert.ok(text.includes(variant.variantId));}
});
test('stage processing resolves archetypes and includes all Recipes, parallel work, observations and state gates',()=>{
 for(const recipe of mission.recipes)assert.ok([...files].some(([key,text])=>key.startsWith('mission-processing/')&&text.includes(recipe.recipeInstanceId)),recipe.recipeInstanceId);
 for(const observation of mission.observations)assert.ok([...files].some(([key,text])=>key.startsWith('mission-processing/')&&text.includes(observation.observationId)),observation.observationId);
 const lab=files.get('mission-processing/stage-analysis-lab.puml');for(const value of ['search-analysis-lab','durationMinutes: 60','TECH_SERVICE_II','DETACHED','lab-search-completed','lab-report-01','discovery-lab-device-behavior','parallel station completion','sets matching state'])assert.ok(lab.includes(value),value);
 assert.ok(files.get('mission-processing/stage-outer-yard.puml').includes('minimumPerception: 5'));
});
test('base graphs retain exact authored dependency edges and separate admission from tag transitions',()=>{
 const theory=JSON.parse(readFileSync(resolve(repository,'demos/shared/data/theory/stargate_theory_simulator_import.json'),'utf8'));
 for(const recipe of theory.recipes){const text=files.get('base-processing/'+recipe.id+'.puml');assert.equal(text.split('\n').filter(line=>line.includes(' --> ')).length,recipe.edges.length);for(const bubble of recipe.bubbles)assert.ok(text.includes(bubble.id));}
 const contracts=files.get('base-processing/processing-contracts.puml');for(const value of ['CONTAINMENT_ADMISSION','CAN_ACCEPT_CONTAINMENT','ANALYSIS_PROCESS','ANALYSIS_REQUIRED','must be absent','removes'])assert.ok(contracts.includes(value));assert.ok(!contracts.includes('CONTAINMENT_PROCESS'));
});
test('alternate sources preserve Continue and silent NPC branch edges and escape diagram syntax',()=>{
 const dir=mkdtempSync(join(tmpdir(),'orionis-flow-source-'));
 try{const alternate=structuredClone(mission),scene=alternate.dialogueScenes[0],start=scene.startNodeId;
  scene.nodes.push({nodeId:'review-prelude',speaker:scene.participants.right,side:'RIGHT',text:'"quoted" <img:secret> C:\\review\n@enduml',nextNodeId:'review-branch'});
  scene.nodes.push({nodeId:'review-branch',speaker:'SYSTEM',side:'NONE',branchByNpcState:{instanceId:scene.participants.right,cases:[{when:{suspicionBelow:50},nextNodeId:start},{when:{suspicionAtLeast:50},nextNodeId:start}]}});scene.startNodeId='review-prelude';
  const path=join(dir,'another-mission.json');writeFileSync(path,JSON.stringify(alternate));const text=buildFlows({mission:path}).get('dialogue/'+scene.dialogueSceneId+'.puml');assert.ok(text.includes(' : "Continue"'));assert.ok(text.includes('case 1'));assert.ok(text.includes('case 2'));assert.equal(text.split('\n').filter(line=>line==='@enduml').length,1);assert.ok(text.includes('&lt;img:secret&gt;'));assert.ok(text.includes('<U+0022>quoted<U+0022>'));assert.ok(text.includes('<U+005C>review'));assert.ok(text.includes('caption "'));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('exports are deterministic, check mode catches stale output without rewriting, and removed graphs are cleaned safely',()=>{
 const dir=mkdtempSync(join(tmpdir(),'orionis-flow-output-'));
 try{assert.deepEqual(buildFlows(),files);exportFlows({out:dir});exportFlows({out:dir,check:true});const path=join(dir,'dialogue/dialogue-yard-entry.puml');writeFileSync(path,'stale');writeFileSync(path.replace('.puml','.png'),'obsolete PNG');assert.throws(()=>exportFlows({out:dir,check:true}),/stale/);assert.equal(readFileSync(path,'utf8'),'stale');exportFlows({out:dir});assert.equal(existsSync(path.replace('.puml','.png')),false);
  const custom=join(dir,'custom-notes.txt');writeFileSync(custom,'keep');const reduced=structuredClone(mission);reduced.dialogueScenes.pop();const source=join(dir,'reduced.json');writeFileSync(source,JSON.stringify(reduced));exportFlows({out:dir,mission:source});assert.equal(existsSync(join(dir,'dialogue/'+mission.dialogueScenes.at(-1).dialogueSceneId+'.puml')),false);assert.equal(readFileSync(custom,'utf8'),'keep');
  const manifest=JSON.parse(readFileSync(join(dir,'manifest.json'),'utf8'));manifest.diagrams.push('../outside.puml');writeFileSync(join(dir,'manifest.json'),JSON.stringify(manifest));assert.throws(()=>exportFlows({out:dir}),/Unsafe generated filename/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('invalid source references and CLI options fail explicitly',()=>{
 assert.throws(()=>run(['--mission']),/Missing value/);assert.throws(()=>run(['--typo']),/Unknown argument/);assert.throws(()=>run(['--check','--render']),/does not render/);assert.equal(quote('line\n@enduml').split('\n').length,1);
 const dir=mkdtempSync(join(tmpdir(),'orionis-flow-invalid-'));try{const broken=structuredClone(mission);broken.dialogueScenes[0].nodes[0].responses[0].endConversation=false;broken.dialogueScenes[0].nodes[0].responses[0].nextNodeId='missing';const path=join(dir,'invalid.json');writeFileSync(path,JSON.stringify(broken));assert.throws(()=>exportFlows({mission:path,out:join(dir,'out')}),/MISSION VALIDATION ERROR/);assert.equal(existsSync(join(dir,'out')),false);}finally{rmSync(dir,{recursive:true,force:true});}
});
