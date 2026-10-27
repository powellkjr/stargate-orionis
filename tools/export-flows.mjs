import {readFileSync,writeFileSync,mkdirSync,existsSync,unlinkSync} from 'node:fs';
import {resolve,dirname,relative,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {homedir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {compileMission} from '../demos/shared/offworld/mission.mjs';

export const repository=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const defaults={mission:'demos/shared/data/offworld/missing-operative-001.finalized.json',archetypes:'demos/shared/data/offworld/archetypes.json',items:'demos/shared/data/item.json',out:'docs/generated/flows'};
const baseFiles=['receiving-prototype.json','cargo-handling-prototype.json','cargo-processing-prototype.json','resource-cargo-playtest.json','process-matrix.json','processing-contracts.json','theory/stargate_theory_simulator_import.json'];
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const pathLabel=p=>relative(repository,p).replaceAll('\\','/');
const slug=s=>String(s).replace(/[^a-zA-Z0-9_-]/g,'_');
const alias=s=>'n'+hash(s).slice(0,20);
// Quoted labels only: source text cannot close a diagram or load an image.
export function quote(value){return '"'+String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\\','<U+005C>').replaceAll('"','<U+0022>').replace(/\r\n?|\n/g,'\\n').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'')+'"';}
const wrap=text=>String(text).split('\n').flatMap(line=>{
 const lines=[];while(line.length>68){let n=line.lastIndexOf(' ',68);if(n<20)n=line.indexOf(' ',68);if(n<0)break;lines.push(line.slice(0,n));line=line.slice(n).trimStart();}lines.push(line);return lines;
}).join('\n');
function format(value,indent=0){
 const pad=' '.repeat(indent);
 if(Array.isArray(value))return value.length?value.map(v=>pad+'- '+(v!==null&&typeof v==='object'?'\n'+format(v,indent+2):String(v))).join('\n'):pad+'[]';
 if(value!==null&&typeof value==='object')return Object.entries(value).map(([k,v])=>pad+k+':'+(v!==null&&typeof v==='object'?'\n'+format(v,indent+2):' '+String(v))).join('\n');
 return pad+String(value);
}
function details(record,omit=[]){return wrap(format(Object.fromEntries(Object.entries(record??{}).filter(([key])=>!omit.includes(key)))));}
class Diagram{
 constructor(title,source,legend){this.nodes=new Map();this.edges=new Set();this.title=title;this.source=source;this.legend=legend;}
 node(id,label,color='#EAF1F8'){if(!this.nodes.has(id))this.nodes.set(id,`rectangle ${quote(wrap(label))} as ${alias(id)} ${color}`);return id;}
 edge(from,to,label='',dashed=false){if(!this.nodes.has(from)||!this.nodes.has(to))throw Error('Diagram edge has an unknown endpoint.');this.edges.add(`${alias(from)} ${dashed?'..>':'-->'} ${alias(to)}${label?' : '+quote(wrap(label)):''}`);}
 text(){return ['@startuml','skinparam shadowing false','skinparam defaultFontName Arial','skinparam defaultFontSize 12','skinparam ArrowFontSize 11','skinparam rectangleRoundCorner 8','skinparam nodesep 25','skinparam ranksep 40','skinparam dpi 110','title '+quote(this.title),'caption '+quote(this.source),'legend left',...this.legend, 'endlegend',...this.nodes.values(),...this.edges,'@enduml',''].join('\n');}
}
const authoringLegend=['Authored design, including content not yet ported to Unity.','Solid arrows: authored flow/effects. Dotted arrows: prerequisites or references.','All listed requirements apply together; a dotted edge is not an automatic route.'];
function dialogue(scene,source){
 const d=new Diagram(scene.dialogueSceneId,source,authoringLegend);
 const start=d.node('start','START\n'+details(scene,['nodes','variants']), '#FFF1CC');
 const end=d.node('end','END CONVERSATION','#D9EEDB');
 for(const node of scene.nodes){d.node('node:'+node.nodeId,node.nodeId+'\n'+details(node,['nodeId','responses']), '#EAF1F8');for(const response of node.responses??[])d.node('response:'+response.responseId,response.responseId+'\n'+details(response,['responseId']), '#E5DAF5');}
 if(scene.startNodeId)d.edge(start,'node:'+scene.startNodeId,'default start');
 for(const variant of scene.variants??[]){const id=d.node('variant:'+variant.variantId,variant.variantId+'\n'+details(variant,['variantId']), '#FFF1CC');d.edge(start,id,'authored variant order');d.edge(id,'node:'+variant.startNodeId,'when matched');}
 for(const node of scene.nodes){const id='node:'+node.nodeId;if(node.endConversation)d.edge(id,end,'Continue after reading');if(node.nextNodeId)d.edge(id,'node:'+node.nextNodeId,'Continue');for(const [index,branch]of(node.branchByNpcState?.cases??[]).entries())d.edge(id,'node:'+branch.nextNodeId,'case '+(index+1)+' / '+JSON.stringify(branch.when));
  for(const response of node.responses??[]){const rid='response:'+response.responseId;d.edge(id,rid,'choose response, then qualified Actor');if(response.endConversation)d.edge(rid,end);else if(response.nextNodeId)d.edge(rid,'node:'+response.nextNodeId);else throw Error('Response has no authored destination: '+response.responseId);}
 }
 return d.text();
}
function missionProcessing(mission,stage,source){
 const d=new Diagram(stage.stageId+' / processing',source,authoringLegend);
 const target=id=>mission.indexes.interactionTargets[id];
 const actions=mission.recipes.filter(r=>target(r.targetId)?.stageId===stage.stageId);
 const observations=mission.observations.filter(o=>o.stageId===stage.stageId);
 const facts=new Map();
 function fact(id){const key='fact:'+id;if(!facts.has(id)){facts.set(id,key);d.node(key,'Knowledge / '+id+(mission.startingKnowledge.includes(id)?'\nStarting Knowledge':''),'#FFF1CC');}return key;}
 function state(c){const key='state:'+JSON.stringify(c);return d.node(key,'State prerequisite\n'+details(c),'#FFF1CC');}
 function effects(from,list){for(const e of list??[])if(e.type==='ADD_KNOWLEDGE')d.edge(from,fact(e.factId??e.knowledgeId),'produces');}
 function gates(id,record){for(const k of record.requiresKnowledge??[])d.edge(fact(k),id,'requires',true);for(const k of record.hiddenUntilKnowledge??[])d.edge(fact(k),id,'visible when known',true);if(record.requiresState)d.edge(state(record.requiresState),id,'requires state',true);}
 for(const r of actions){const t=target(r.targetId),i=mission.indexes.instances[t.instanceId];const id=d.node('recipe:'+r.recipeInstanceId,r.recipeInstanceId+'\nTarget: '+(i?.playerLabel??t.playerLabel??t.transitionId??t.targetId)+' / '+(i?.instanceId??t.targetId)+'\n'+details(t,['recipeInstanceIds','stageId','targetId','instanceId'])+'\n'+details(r,['recipeInstanceId','targetId','archetypeId']));gates(id,r);effects(id,r.effects);
  if(i?.revealedWhen)d.edge(state(i.revealedWhen),id,'target visibility',true);
  if(r.createsDiscoveryId){const discovery=mission.indexes.discoveries[r.createsDiscoveryId];const out=d.node('discovery:'+r.createsDiscoveryId,'Discovery question\n'+details(discovery),'#D9EEDB');d.edge(id,out,'records question');}
 }
 for(const o of observations){const id=d.node('observation:'+o.observationId,o.observationId+'\nPassive observation\n'+details(o,['observationId','archetypeId']),'#DAEDEB');gates(id,o);for(const k of o.revealsFacts??[])d.edge(id,fact(k),'reveals');}
 for(const g of mission.workGroups??[])if(g.stageId===stage.stageId){const id=d.node('group:'+g.workGroupId,g.workGroupId+'\n'+details(g,['workGroupId']),'#E5DAF5');for(const rid of g.recipeInstanceIds)d.edge('recipe:'+rid,id,'parallel station completion');effects(id,g.effects);}
 // Connect exact authored state writes to matching requiresState predicates.
 for(const r of actions)for(const e of r.effects??[])if(['SET_ITEM_STATE','SET_INSTANCE_STATE','SET_TARGET_STATE'].includes(e.type))for(const other of actions){const c=other.requiresState;if(c&&c.instanceId===(e.instanceId??target(r.targetId).instanceId)&&c.field===e.field&&JSON.stringify(c.equals)===JSON.stringify(e.value))d.edge('recipe:'+r.recipeInstanceId,state(c),'sets matching state');}
 // Name out-of-room sources rather than pretending that Knowledge appears here.
 for(const [knowledge,id] of facts){for(const scene of mission.dialogueScenes??[])for(const n of scene.nodes)for(const r of n.responses??[])if(r.effects?.some(e=>e.type==='ADD_KNOWLEDGE'&&(e.knowledgeId??e.factId)===knowledge)){const ref=d.node('external:'+r.responseId,'Dialogue source\n'+scene.dialogueSceneId+'\n'+r.responseId,'#F2F2F2');d.edge(ref,id,'produces',true);}
  for(const r of mission.recipes)if(!actions.includes(r)&&r.effects?.some(e=>e.type==='ADD_KNOWLEDGE'&&(e.knowledgeId??e.factId)===knowledge)){const ref=d.node('external:'+r.recipeInstanceId,'Recipe in '+target(r.targetId).stageId+'\n'+r.recipeInstanceId,'#F2F2F2');d.edge(ref,id,'produces',true);}
 }
 if(!d.nodes.size)d.node('empty','No authored Recipes or observations in this Stage.');
 return d.text();
}
function recipeGraph(recipe,source,context={}){
 const d=new Diagram(recipe.id,source,authoringLegend);const bubbles=recipe.bubbles??recipe.steps??[recipe];
 const heading=d.node('context',details({...context,...recipe},['bubbles','steps','edges']),'#FFF1CC');
 const ids=new Set();for(const b of bubbles){if(!b.id||ids.has(b.id))throw Error('Missing/duplicate Recipe bubble ID in '+recipe.id);ids.add(b.id);d.node(b.id,details(b));}
 const edges=recipe.edges??(recipe.steps?bubbles.slice(1).map((b,i)=>[bubbles[i].id,b.id]):bubbles.flatMap(b=>(b.dependsOn??[]).map(id=>[id,b.id])));
 for(const edge of edges){if(!Array.isArray(edge)||edge.length!==2||!ids.has(edge[0])||!ids.has(edge[1]))throw Error('Invalid Recipe edge in '+recipe.id);d.edge(...edge,'authored order');}
 for(const b of bubbles.filter(b=>!edges.some(e=>e[1]===b.id)))d.edge(heading,b.id,'execution requirements',true);
 return d.text();
}
function contractsGraph(contracts,matrix,source){
 const d=new Diagram('Processing admission and tag transitions',source,authoringLegend);
 const tag=id=>d.node('tag:'+id,'Processing tag\n'+id,'#FFF1CC');
 for(const row of Object.values(matrix)){const id=d.node('admit:'+row.id,details(row),'#DAEDEB');for(const t of row.requiredProcessingTags??[])d.edge(tag(t),id,'required',true);for(const t of row.forbiddenProcessingTags??[])d.edge(tag(t),id,'must be absent',true);}
 for(const c of Object.values(contracts)){if(!matrix[c.admissionMatrixId])throw Error('Unknown processing admission '+c.admissionMatrixId);for(const t of c.transitions){const id=d.node('transition:'+t.id,c.id+'\n'+details(t));d.edge('admit:'+c.admissionMatrixId,id,'admission contract',true);for(const k of t.requiredProcessingTags??[])d.edge(tag(k),id,'required',true);for(const k of t.addProcessingTags??[])d.edge(id,tag(k),'adds');for(const k of t.removeProcessingTags??[])d.edge(id,tag(k),'removes');}}
 return d.text();
}
export function buildFlows(options={}){
 const missionPath=resolve(repository,options.mission??defaults.mission),archetypePath=resolve(repository,options.archetypes??defaults.archetypes),itemsPath=resolve(repository,options.items??defaults.items);
 const mission=compileMission(read(missionPath),{...read(archetypePath),itemDefinitions:read(itemsPath)});
 const files=new Map(),sources=[missionPath,archetypePath,itemsPath];const source=pathLabel(missionPath);
 const add=(name,text)=>{if(files.has(name))throw Error('Duplicate export filename '+name);files.set(name,text);};
 for(const scene of mission.dialogueScenes??[])add('dialogue/'+slug(scene.dialogueSceneId)+'.puml',dialogue(scene,source));
 for(const stage of mission.stages)add('mission-processing/'+slug(stage.stageId)+'.puml',missionProcessing(mission,stage,source));
 const directory=resolve(repository,options.dataDir??'demos/shared/data');
 const base=Object.fromEntries(baseFiles.map(file=>{const path=resolve(directory,file);sources.push(path);return [file,read(path)];}));
 for(const file of baseFiles){const data=base[file],label=pathLabel(resolve(directory,file));
  for(const recipe of [data.recipe,data.examination?.recipe,...(data.recipes??[])].filter(Boolean))add('base-processing/'+slug(recipe.id)+'.puml',recipeGraph(recipe,label,Object.fromEntries(Object.entries(data).filter(([key])=>!['recipe','recipes','theories','coreDefinitions','discoveryRelationships','hypothesisDefinitions','provisionalDefinitions','examination'].includes(key)))));
 }
 add('base-processing/processing-contracts.puml',contractsGraph(base['processing-contracts.json'],base['process-matrix.json'],pathLabel(resolve(directory,'processing-contracts.json'))+' + process-matrix.json'));
 const diagrams=[...files.keys()];const manifest={format:'orionis-authored-flow-export-1',sources:sources.map(path=>({path:pathLabel(path),sha256:hash(readFileSync(path))})),diagrams};
 add('manifest.json',JSON.stringify(manifest,null,2)+'\n');
 add('README.md',['# Authored dialogue and processing flows','', 'Generated by `node tools/export-flows.mjs`. Do not edit diagrams by hand.','', 'These diagrams include all authored content, including unported Unity branches.','Solid arrows show authored dialogue/order/effects; dotted arrows show prerequisites','or references. Prerequisites apply together. No automatic room routing is implied.','', 'Each dialogue response has its own box containing speaker requirements, conditions,','text and effects. Processing diagrams show resolved archetype defaults and overrides.','', '## Regenerate and render','', 'Game builds regenerate this directory. Snapshot export also regenerates it.','Run from the repository root in Git Bash:','', '```bash','node tools/export-flows.mjs','node tools/export-flows.mjs --check','node tools/export-flows.mjs --render --jar "$HOME/Downloads/plantuml-1.2024.6.jar"','```','', 'To review a different authored mission:','', '```bash','node tools/export-flows.mjs --mission path/to/mission.json --out docs/generated/other-flows','```','', 'Use `--archetypes`, `--items` or `--data-dir` for alternative source catalogs.','PNG rendering uses local Java/PlantUML; `PLANTUML_JAR` overrides jar discovery.','Builds render PNGs when that jar is available; PlantUML text generation is required.','Your `puml` alias works from a diagram subdirectory; the exporter renders all three','subdirectories in one invocation. Graphviz is needed for rectangle layouts.','', '## Diagrams','',...diagrams.map(file=>'- ['+file+']('+file+') · [PNG]('+file.replace(/\.puml$/,'.png')+')'),'', 'Source hashes are recorded in [manifest.json](manifest.json).',''].join('\n'));
 return files;
}
export function exportFlows(options={}){
 const files=buildFlows(options),out=resolve(repository,options.out??defaults.out);const manifestPath=join(out,'manifest.json');
 const previous=existsSync(manifestPath)?read(manifestPath):null;
 if(previous&&previous.format!=='orionis-authored-flow-export-1')throw Error('Output directory contains a different manifest.');
 const oldFiles=previous?.diagrams??[];for(const file of oldFiles)if(!/^(dialogue|mission-processing|base-processing)\/[a-zA-Z0-9_-]+\.puml$/.test(file))throw Error('Unsafe generated filename in manifest.');
 if(options.check){for(const [file,text]of files)if(!existsSync(join(out,file))||readFileSync(join(out,file),'utf8').replaceAll('\r\n','\n')!==text)throw Error('Flow export is stale: '+file+'. Run node tools/export-flows.mjs');for(const file of oldFiles)if(!files.has(file))throw Error('Obsolete flow export: '+file);return {out,files:[...files.keys()]};}
 for(const [file,text]of files){const path=join(out,file);mkdirSync(dirname(path),{recursive:true});if(!existsSync(path)||readFileSync(path,'utf8')!==text){if(file.endsWith('.puml')&&existsSync(path.replace(/\.puml$/,'.png')))unlinkSync(path.replace(/\.puml$/,'.png'));writeFileSync(path,text);}}
 for(const file of oldFiles)if(!files.has(file))for(const stale of [file,file.replace(/\.puml$/,'.png')])if(existsSync(join(out,stale)))unlinkSync(join(out,stale));
 return {out,files:[...files.keys()]};
}
export function renderFlows(out,{jar,optional=false}={}){
 jar=jar??process.env.PLANTUML_JAR??join(homedir(),'Downloads','plantuml-1.2024.6.jar');
 if(!existsSync(jar)){if(optional)return 'PNG rendering skipped: local PlantUML jar not found; .puml files generated.';throw Error('PlantUML jar not found: '+jar);}
 const diagrams=read(join(out,'manifest.json')).diagrams.map(file=>join(out,file));
 const result=spawnSync('java',['-Djava.awt.headless=true','-jar',resolve(jar),'-charset','UTF-8','-failfast2','-tpng',...diagrams],{encoding:'utf8',timeout:180000,windowsHide:true,env:{...process.env,PLANTUML_LIMIT_SIZE:'16384'}});
 if(result.error||result.status!==0)throw Error('PlantUML rendering failed: '+(result.error?.message??result.stderr??result.stdout));
 for(const file of diagrams)if(!existsSync(file.replace(/\.puml$/,'.png')))throw Error('PlantUML did not produce '+file);
 return 'Rendered '+diagrams.length+' PNG diagrams.';
}
export function run(args=process.argv.slice(2)){
 const options={};for(let i=0;i<args.length;i++){const key=args[i];if(['--mission','--archetypes','--items','--out','--data-dir','--jar'].includes(key)){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing value for '+key);options[key.slice(2).replace('-dir','Dir')]=args[++i];}else if(['--check','--render','--render-if-available'].includes(key))options[key.slice(2)]=true;else if(key==='--help'){console.log('node tools/export-flows.mjs [--mission FILE] [--archetypes FILE] [--items FILE] [--data-dir DIR] [--out DIR] [--check] [--render | --render-if-available] [--jar FILE]');return;}else throw Error('Unknown argument '+key);}
 if(options.check&&(options.render||options['render-if-available']))throw Error('--check does not render or modify files.');
 const result=exportFlows(options);console.log((options.check?'Verified ':'Generated ')+result.files.filter(f=>f.endsWith('.puml')).length+' PlantUML diagrams in '+pathLabel(result.out));
 if(options.render||options['render-if-available'])console.log(renderFlows(result.out,{jar:options.jar,optional:!options.render}));return result;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){try{run();}catch(error){console.error(error.message);process.exitCode=1;}}
