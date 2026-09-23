import {matchesProcessMatrix,transferInstance,simulateBoundary,resolveDisplayName,revealNextReceivingTag} from "../shared/js/process-transfers.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createArrivalStore} from '../shared/js/item-instances.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../shared/data/'+name,import.meta.url)));
const item=read('item.json').ASGARD_EM_RIFLE;
const tab=read('rooms_schema.json').find(r=>r.identity.id==='receiving').function.subordinateTabs.find(t=>t.arrival);
const config={...tab.arrival,storageClasses:tab.storage.storageClasses};
const contracts=read('processing-contracts.json');
test('Receiving reveals authored identity and condition tags one at a time before completing',()=>{
 const instance={instanceId:'RECEIVING_TEST',itemId:item.id,reality:{authoredTags:['WEAPON','RANGED_WEAPON','RIFLE','ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION','FUNCTIONAL','CHARGED']},knowledge:{revealedTags:['PHYSICAL_OBJECT'],identityTags:[],conditionTags:[],functionalityTags:[]},processingTags:['RECEIVING_REQUIRED','IDENTITY_UNKNOWN'],processes:{receiving:{state:'NOT_STARTED'}}};
 let result=revealNextReceivingTag(instance,item,contracts);
 assert.deepEqual(result.knowledge.identityTags,['WEAPON']);
 assert.equal(result.processes.receiving.state,'NOT_STARTED');
 result=revealNextReceivingTag(result,item,contracts);
 result=revealNextReceivingTag(result,item,contracts);
 result=revealNextReceivingTag(result,item,contracts);
 result=revealNextReceivingTag(result,item,contracts);
 assert.equal(result.processes.receiving.state,'COMPLETE');
 assert.equal(result.displayName,'Unknown rifle');
 assert(!result.knowledge.functionalityTags.includes('ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION'));
});
test('each arrival creates an independent unknown object, preserving authored data',()=>{
 const store=createArrivalStore();store.resize(4);const before=JSON.stringify(item);
 const first=store.receive(item,config),second=store.receive(item,config);
 assert.notEqual(first.instanceId,second.instanceId);
 assert.equal(first.itemId,item.id);assert.equal(first.state.quantity,1);
  assert.equal(first.state.percentOfWhole,1000);assert.equal(first.state.condition,'UNKNOWN');assert.equal(first.state.functionalState,'UNKNOWN');
  assert.deepEqual(first.knowledge,{revealedTags:['PHYSICAL_OBJECT'],identityTags:[],conditionTags:[],functionalityTags:[],instanceFindings:[]});
  assert.deepEqual(first.processingTags,['RECEIVING_REQUIRED','IDENTITY_UNKNOWN']);
 assert.equal(first.custody.containerId,config.storageId);
 assert.equal(first.processes.receiving.state,'NOT_STARTED');
 first.reality.authoredTags.push('TEST');assert(!second.reality.authoredTags.includes('TEST'));
 assert.equal(JSON.stringify(item),before);
 assert.deepEqual(store.queue,[first.instanceId,second.instanceId,null,null]);
});
test('queue compacts before append and survives resize without changing instance identity',()=>{
 const store=createArrivalStore();store.resize(4);const first=store.receive(item,config);
 store.queue.splice(0,4,null,null,first.instanceId,null);
 const second=store.receive(item,config);assert.deepEqual(store.queue,[first.instanceId,second.instanceId,null,null]);
 const queue=store.queue;store.resize(8);store.resize(2);
 assert.equal(store.queue,queue);assert.equal(store.instances[first.instanceId],first);
 assert.deepEqual(store.queue,[first.instanceId,second.instanceId]);
});
test('full queues, invalid classes and weighted capacity fail without mutation',()=>{
 const store=createArrivalStore();store.resize(2);
 const incompatible=structuredClone(item);incompatible.storage.storageClasses=['EQ'];
 assert.throws(()=>store.receive(incompatible,config),/incompatible/);
 assert.equal(Object.keys(store.instances).length,0);
 const heavy=structuredClone(item);heavy.storage.handlingCost=2;store.receive(heavy,config);
 const before=JSON.stringify(store);
 assert.throws(()=>store.receive(item,config),/capacity/);assert.equal(JSON.stringify(store),before);
 assert.throws(()=>store.resize(1),/occupied/);assert.equal(JSON.stringify(store),before);
 const full=createArrivalStore();full.resize(1);full.receive(item,config);
 assert.throws(()=>full.receive(item,config),/full/);
});

import vm from 'node:vm';
test('UI drops append once on occupied slots and queue background; room switching retains instances',()=>{
 const elements=new Map();
 function node(){return {style:{},dataset:{},classList:{add(){},remove(){}},handlers:{},children:[],addEventListener(k,f){this.handlers[k]=f},append(...v){this.children.push(...v)},appendChild(v){this.children.push(v)},replaceChildren(...v){this.children=v},setAttribute(){}};}
 const document={getElementById(id){if(!elements.has(id))elements.set(id,node());return elements.get(id)},createElement:node};
  const ctx=vm.createContext({document,URL,structuredClone,createArrivalStore,matchesProcessMatrix,transferInstance,simulateBoundary,resolveDisplayName,console});
 vm.runInContext(readFileSync(new URL('../shared/js/rooms.js',import.meta.url),'utf8').replaceAll('export ',''),ctx);
 let source=readFileSync(new URL('./room-staffing-demo.js',import.meta.url),'utf8');
 source=source.replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.url',JSON.stringify(new URL('./room-staffing-demo.js',import.meta.url).href)).replace(/initialize\(\);\s*$/,'');
 vm.runInContext(source,ctx);
 ctx.rooms=read('rooms_schema.json');ctx.items=read('item.json');
 vm.runInContext('roomCatalog=validateRooms(rooms);itemCatalog=Object.values(items);render=()=>{};loadRoom("receiving");',ctx);
 const event={preventDefault(){},stopPropagation(){},dataTransfer:{getData(){return JSON.stringify({type:'item',id:item.id})}}};
 let slot=vm.runInContext('createResourceSlot("item",35,roomTabResources.intake.item,["INV"])',ctx);
 slot.handlers.drop(event);
 slot=vm.runInContext('createResourceSlot("item",0,roomTabResources.intake.item,["INV"])',ctx);
 slot.handlers.drop(event);
 const group=vm.runInContext('createResourceGroup("item","Queue",roomTabResources.intake.item,["INV"])',ctx);
 group.handlers.drop(event);
 assert.equal(vm.runInContext('Object.keys(arrivals.instances).length',ctx),3);
 assert.equal(vm.runInContext('arrivals.queue.slice(0,3).every(Boolean) && arrivals.queue.slice(3).every(id=>id===null)',ctx),true);
 const before=vm.runInContext('JSON.stringify(arrivals)',ctx);
 vm.runInContext('loadRoom("workshop");loadRoom("receiving");',ctx);
 assert.equal(vm.runInContext('JSON.stringify(arrivals)',ctx),before);
 assert.equal(vm.runInContext('roomTabResources.intake.item===arrivals.queue',ctx),true);
 ctx.matrixFixture=read('process-matrix.json');ctx.contractFixture=read('processing-contracts.json');
 vm.runInContext('processMatrix=matrixFixture;processingContracts=contractFixture;arrivals.instances[arrivals.queue[0]].processingTags=["ANALYSIS_REQUIRED"]',ctx);
 const movingId=vm.runInContext('arrivals.queue[0]',ctx);
 const transfers=vm.runInContext('transferControls(roomTabs().find(t=>t.id==="processing"))',ctx);
 const send=transfers.children.find(n=>n.textContent==='Send to Analysis / Queue');
 assert(send && !send.disabled);send.handlers.click();
 assert.equal(vm.runInContext('arrivals.queue.includes('+JSON.stringify(movingId)+')',ctx),false);
 vm.runInContext('loadRoom("analysis")',ctx);
 assert.equal(vm.runInContext('roomTabResources.queue.item[0]',ctx),movingId);
 assert.equal(vm.runInContext('arrivals.instances[roomTabResources.queue.item[0]].custody.containerId',ctx),'ANALYSIS_QUEUE');
 vm.runInContext('loadRoom("workshop");loadRoom("analysis")',ctx);
 assert.equal(vm.runInContext('roomTabResources.queue.item[0]',ctx),movingId);

 const compacted=vm.runInContext('compactQueue([null,"A",null,"B"])',ctx);
 assert.equal(JSON.stringify(compacted),JSON.stringify(["A","B",null,null]));
 function descendants(n){return [n,...(n.children??[]).flatMap(descendants)];}
 vm.runInContext('loadRoom("receiving");activeRoomTabId="processing"',ctx);
 const processing=vm.runInContext('renderRoomResources()',ctx);
 const nodes=descendants(processing);
  assert.equal(nodes.filter(n=>n.dataset?.process).length,4);
 assert(nodes.filter(n=>n.dataset?.process).some(n=>!n.disabled));
 const first=vm.runInContext('arrivals.queue[0]',ctx);
 vm.runInContext('renderInstanceInspector()',ctx);
 assert.equal(JSON.parse(elements.get('instanceInspector').value).instanceId,first);
 vm.runInContext('activeRoomTabId="intake";renderInstanceInspector()',ctx);
 assert.equal(elements.get('instanceInspector').value,"");

 assert(nodes.some(n=>n.textContent===first));
 assert(!nodes.some(n=>n.handlers?.drop));
 for(const [room,tab,type,expected] of [['equipment_storage','weapons','item',80],['equipment_storage','armor','item',80],['data_storage','theories','theory',80],['containment','cc_storage','item',80],['living_quarters','lockers','item',6]]){
  ctx.selectedRoom=room;ctx.selectedTab=tab;ctx.selectedType=type;
  vm.runInContext('loadRoom(selectedRoom);currentCt=3;currentLayout="2x2";resetRoomResources()',ctx);
  assert.equal(vm.runInContext('roomTabResources[selectedTab][selectedType].length',ctx),expected);
 }
 vm.runInContext('loadRoom("analysis")',ctx);
 assert.equal(vm.runInContext('roomTabs().find(t=>t.id==="process").slotConfig.item.fixed',ctx),1);
 assert.equal(vm.runInContext('roomTabResources.process.theory',ctx),undefined);
 for(const room of ['material_storage','supply_storage','ration_storage']){
  ctx.selectedRoom=room;vm.runInContext('loadRoom(selectedRoom)',ctx);
  const quantities=vm.runInContext('roomTabs().map(tab=>tabQuantity(tab))',ctx);
  assert(quantities.every(value=>value>=1000 && value<=4000));
  assert(quantities.reduce((sum,n)=>sum+n,0)<=4000);
  vm.runInContext('for(let i=0;i<100;i++)adjustQuantity(roomTabs()[0],"increase")',ctx);
  assert(vm.runInContext('quantityTotal(roomTabs()[0])<=4000',ctx));
  vm.runInContext('for(let i=0;i<100;i++)adjustQuantity(roomTabs()[0],"destroy")',ctx);
  assert(vm.runInContext('tabQuantity(roomTabs()[0])>=0',ctx));
  quantities.splice(0,quantities.length,...vm.runInContext('roomTabs().map(tab=>tabQuantity(tab))',ctx));

  vm.runInContext('currentCt=3;currentLayout="2x2"',ctx);
  assert(vm.runInContext('roomTabs().every(tab=>slotCountFromConfig(tab.quantity.capacity)===8000)',ctx));
  vm.runInContext('loadRoom("analysis");loadRoom(selectedRoom)',ctx);
  assert.equal(JSON.stringify(vm.runInContext('roomTabs().map(tab=>tabQuantity(tab))',ctx)),JSON.stringify(quantities));
 }

});
