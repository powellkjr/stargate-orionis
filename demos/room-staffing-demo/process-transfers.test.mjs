import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesProcessMatrix,applyProcessingTransition,transferInstance,resolveDisplayName} from '../shared/js/process-transfers.mjs';

const instance={
  instanceId:'ITEM_OFFWORLD_000001',
  processingTags:['RECEIVING_COMPLETE','IDENTITY_ESTABLISHED','ANALYSIS_REQUIRED'],
  custody:{containerId:'RECEIVING_QUEUE',storageId:'RECEIVING_QUEUE',cost:{extendedCost:1}}
};
const matrix={id:'ANALYSIS_ADMISSION',requiredProcessingTags:['ANALYSIS_REQUIRED'],requiredRoomCapabilities:['CAN_ACCEPT_ANALYSIS']};
const authorization={id:'ANALYSIS_AUTHORIZE',requiredProcessingTags:['ANALYSIS_REQUIRED'],addProcessingTags:['ANALYSIS_AUTHORIZED']};

test('matrix matching requires all tags and room capabilities',()=>{
  assert.equal(matchesProcessMatrix(instance,['CAN_ACCEPT_ANALYSIS'],matrix),true);
  assert.equal(matchesProcessMatrix(instance,[],matrix),false);
  assert.equal(matchesProcessMatrix({...instance,processingTags:['RECEIVING_COMPLETE']},['CAN_ACCEPT_ANALYSIS'],matrix),false);
});

test('transition application explicitly removes and adds tags',()=>{
  const result=applyProcessingTransition(instance,authorization);
  assert.deepEqual(result.processingTags,['RECEIVING_COMPLETE','IDENTITY_ESTABLISHED','ANALYSIS_REQUIRED','ANALYSIS_AUTHORIZED']);
  assert.deepEqual(instance.processingTags,['RECEIVING_COMPLETE','IDENTITY_ESTABLISHED','ANALYSIS_REQUIRED']);
});

test('display names advance only at authored process exits',()=>{
  const item=JSON.parse(readFileSync(new URL('../shared/data/item.json',import.meta.url))).ASGARD_EM_RIFLE;
  const instance={instanceId:'NAME_TEST',itemId:item.id,displayName:'Unknown object',knowledge:{revealedTags:['PHYSICAL_OBJECT'],identityTags:[],conditionTags:[],functionalityTags:[]},processes:{receiving:{state:'NOT_STARTED'},analysis:{state:'NOT_STARTED'}}};
  assert.equal(resolveDisplayName(instance,item),'Unknown object');
  instance.processes.receiving.state='COMPLETE';
  assert.equal(resolveDisplayName(instance,item),'Unknown rifle');
  instance.processes.analysis.state='COMPLETE';
  assert.equal(resolveDisplayName(instance,item),'Unknown electromagnetic rifle');
});

test('transfer preserves instance identity and changes custody atomically',()=>{
  const source=[instance.instanceId,null];
  const destination=[null,null];
  const instances={[instance.instanceId]:instance};
  const result=transferInstance({instance,sourceQueue:source,destinationQueue:destination,destination:{containerId:'ANALYSIS_QUEUE',processingCapabilities:['CAN_ACCEPT_ANALYSIS'],capacity:2},matrixEntry:matrix,authorizationTransition:authorization,instances});
  assert.equal(result.instanceId,instance.instanceId);
  assert.equal(result.custody.containerId,'ANALYSIS_QUEUE');
  assert(result.processingTags.includes('ANALYSIS_AUTHORIZED'));
  assert.deepEqual(source,[null,null]);
  assert.deepEqual(destination,[instance.instanceId,null]);
  assert.equal(instance.custody.containerId,'RECEIVING_QUEUE');
});

test('failed transfer does not mutate custody, tags, or queues',()=>{
  const source=[instance.instanceId,null];
  const destination=[null];
  const before=JSON.stringify({source,destination,instance});
  assert.throws(()=>transferInstance({instance,sourceQueue:source,destinationQueue:destination,destination:{containerId:'ANALYSIS_QUEUE',processingCapabilities:[],capacity:1},matrixEntry:matrix,authorizationTransition:authorization,instances:{[instance.instanceId]:instance}}),/capabilities/);
  assert.equal(JSON.stringify({source,destination,instance}),before);
});
// Receiving completion does not decide item-specific routing.
import {readFileSync} from 'node:fs';
const contracts=JSON.parse(readFileSync(new URL('../shared/data/processing-contracts.json',import.meta.url)));
const receivingComplete=contracts.RECEIVING_PROCESS.transitions.find(t=>t.id==='RECEIVING_COMPLETE');
test('known vest Receiving completion does not impose Analysis or Workshop',()=>{
 const vest={instanceId:'TEST_VEST',itemId:'HUMAN_EM_IMPACT_VEST',state:{condition:'INTACT',functionalState:'FUNCTIONAL',quantity:1},processingTags:['RECEIVING_REQUIRED','RECEIVING_AUTHORIZED','IDENTITY_UNKNOWN'],custody:{containerId:'RECEIVING_QUEUE'}};
 const before=structuredClone(vest);
 const result=applyProcessingTransition(vest,receivingComplete);
 assert.deepEqual(result.processingTags,['RECEIVING_COMPLETE','IDENTITY_ESTABLISHED']);
 assert.deepEqual(result.state,vest.state);
 assert.deepEqual(result.custody,vest.custody);
 assert.deepEqual(vest,before);
});
test('Receiving completion preserves intervention requirements established by the Item Base Model',()=>{
 for(const requirement of ['ANALYSIS_REQUIRED','WORKSHOP_REQUIRED']){
  const result=applyProcessingTransition({processingTags:['RECEIVING_REQUIRED','RECEIVING_AUTHORIZED',requirement]},receivingComplete);
  assert(result.processingTags.includes(requirement));
 }
});

import {simulateBoundary} from '../shared/js/process-transfers.mjs';
import {createArrivalStore} from '../shared/js/item-instances.mjs';
const readData=name=>JSON.parse(readFileSync(new URL('../shared/data/'+name,import.meta.url)));
test('unexposed functionality prevents a fresh vest from entering Equipment Storage',()=>{
 const item=readData('item.json').HUMAN_EM_IMPACT_VEST;
 const rooms=readData('rooms_schema.json');const intake=rooms.find(r=>r.identity.id==='receiving').function.subordinateTabs.find(t=>t.arrival);
 const store=createArrivalStore();store.resize(4);
 const original=store.receive(item,{...intake.arrival,storageClasses:intake.storage.storageClasses});
  assert.throws(()=>simulateBoundary(original,item,'simulate_known_equipment',contracts),/Resolve Analysis\/Workshop requirements/);
  assert.equal(original.state.condition,'UNKNOWN');
});
test('manual analysis path authorizes Workshop only after Analysis admission and completion',()=>{
 const item=readData('item.json').ASGARD_EM_RIFLE;
  const start={instanceId:'TEST_RIFLE',itemId:item.id,state:{condition:'UNKNOWN'},reality:{authoredTags:item.possibleReality.inherentTags},knowledge:{revealedTags:[],identityTags:[],conditionTags:[],functionalityTags:[]},processes:{receiving:{state:'NOT_STARTED'},analysis:{state:'NOT_STARTED'}},processingTags:['RECEIVING_REQUIRED','IDENTITY_UNKNOWN']};
 const next=simulateBoundary(start,item,'simulate_analysis_required',contracts);
 assert(next.processingTags.includes('ANALYSIS_REQUIRED'));
 assert(next.processingTags.includes('CONTAINMENT_REQUIRED'));
 assert(!matchesProcessMatrix(next,['CAN_ACCEPT_ANALYSIS'],readData('process-matrix.json').ANALYSIS_ADMISSION));
 assert.throws(()=>simulateBoundary(next,item,'simulate_analysis_complete',contracts),/requirements/);
 const authorized=applyProcessingTransition(next,contracts.ANALYSIS_PROCESS.transitions.find(t=>t.id==='ANALYSIS_AUTHORIZE'));
 let revealed=authorized;
  const reality=new Set(revealed.reality.authoredTags);
  for(const tag of item.processingExposure.analysis.orderedFunctionalityTags){
   if(reality.has(tag))revealed=simulateBoundary(revealed,item,'simulate_next_tag_reveal',contracts);
  }
 const completed=simulateBoundary(revealed,item,'simulate_analysis_complete',contracts);
 assert(matchesProcessMatrix(completed,['CAN_ACCEPT_WORKSHOP','CAN_REVERSE_ENGINEER'],readData('process-matrix.json').REVERSE_ENGINEERING_ADMISSION));
  assert.deepEqual(completed.knowledge.functionalityTags,['ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION']);
 assert.equal(completed.knowledge.recognizedIdentity,item.id);
 assert(!completed.processingTags.includes('WORKSHOP_REQUIRED'));
 assert(completed.processingTags.includes('RECEIVING_TO_EQUIPMENT_STORAGE'));
});

test('CC reservation survives Analysis custody and is released only on validated EQ transfer',()=>{
 const matrix=readData('process-matrix.json');const item=readData('item.json').ASGARD_EM_RIFLE;
  let object={instanceId:'TEST_CC_OBJECT',itemId:item.id,state:{condition:'INTACT',functionalState:'UNKNOWN'},reality:{authoredTags:item.possibleReality.inherentTags},knowledge:{revealedTags:[],identityTags:[],conditionTags:[],functionalityTags:[]},processes:{analysis:{state:'NOT_STARTED'}},processingTags:['RECEIVING_COMPLETE','IDENTITY_ESTABLISHED','ANALYSIS_REQUIRED'],custody:{storageId:'CC',containerId:'CC',cost:{extendedCost:1}}};
 const instances={[object.instanceId]:object};const cc=[object.instanceId,null],analysis=[null],eq=[null];
 const options={instance:object,sourceQueue:cc,destinationQueue:analysis,destination:{containerId:'ANALYSIS',capacity:1,preservePrimaryStorage:true,processingCapabilities:['CAN_ACCEPT_ANALYSIS']},matrixEntry:matrix.ANALYSIS_ADMISSION,authorizationTransition:contracts.ANALYSIS_PROCESS.transitions[0],instances,itemDefinition:item};
 const before=JSON.stringify({object,cc,analysis});
 assert.throws(()=>transferInstance({...options,primaryStorage:{containerId:'CC',capacity:0,storageClasses:['CC']}}),/reserved capacity/);
 assert.equal(JSON.stringify({object,cc,analysis}),before);
 object=transferInstance({...options,primaryStorage:{containerId:'CC',capacity:2,storageClasses:['CC']}});instances[object.instanceId]=object;
 assert.equal(object.custody.storageId,'CC');assert.equal(object.custody.containerId,'ANALYSIS');assert(cc.every(id=>id===null));
  for(const tag of item.processingExposure.analysis.orderedFunctionalityTags)object=simulateBoundary(object,item,'simulate_next_tag_reveal',contracts);
 object=simulateBoundary(object,item,'simulate_analysis_complete',contracts);instances[object.instanceId]=object;
 const other={instanceId:'OTHER',custody:{storageId:'EQ',cost:{extendedCost:1}}};instances.OTHER=other;
 const move={instance:object,sourceQueue:analysis,destinationQueue:eq,destination:{containerId:'EQ',capacity:1,storageClasses:['EQ'],processingCapabilities:['CAN_ACCEPT_EQUIPMENT_STORAGE']},matrixEntry:matrix.EQUIPMENT_STORAGE_ADMISSION,instances,itemDefinition:item};
 assert.throws(()=>transferInstance(move),/reserved capacity/);assert.equal(object.custody.storageId,'CC');assert.equal(analysis[0],object.instanceId);
 delete instances.OTHER;const stored=transferInstance(move);assert.equal(stored.custody.storageId,'EQ');assert.equal(stored.custody.containerId,'EQ');
});
