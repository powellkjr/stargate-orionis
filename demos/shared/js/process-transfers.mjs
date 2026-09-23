function clone(value){
  return structuredClone(value);
}

function values(value){
  return new Set(Array.isArray(value)?value:[]);
}

function hasAll(actual,required){
  const set=values(actual);
  return (required??[]).every(value=>set.has(value));
}

function hasNone(actual,forbidden){
  const set=values(actual);
  return !(forbidden??[]).some(value=>set.has(value));
}

function addUnique(list,value){
  if(!list.includes(value))list.push(value);
}

function knowledgeFor(instance){
  const knowledge=clone(instance.knowledge??{});
  knowledge.revealedTags??=[];
  knowledge.identityTags??=[];
  knowledge.conditionTags??=[];
  knowledge.functionalityTags??=[];
  knowledge.instanceFindings??=[];
  return knowledge;
}

function exposeTags(instance,tags,category){
  const result=clone(instance);
  const knowledge=knowledgeFor(result);
  const reality=new Set(result.reality?.authoredTags??[]);
  for(const tag of tags??[]){
    if(!reality.has(tag))continue;
    addUnique(knowledge.revealedTags,tag);
    addUnique(knowledge[category],tag);
  }
  result.knowledge=knowledge;
  return result;
}

function applicableAnalysisTags(instance,item){
  const reality=new Set(instance.reality?.authoredTags??[]);
  return (item.processingExposure?.analysis?.orderedFunctionalityTags??[]).filter(tag=>reality.has(tag));
}

function applicableReceivingTags(instance,item){
  const reality=new Set(instance.reality?.authoredTags??[]);
  const exposure=item.processingExposure?.receiving??{};
  return [...(exposure.identityTags??[]),...(exposure.conditionTags??[])].filter(tag=>reality.has(tag));
}

function processHasCompleted(instance,process){
  return instance.processes?.[process]?.state==="COMPLETE";
}

export function resolveDisplayName(instance,item){
  if(!instance || !item)return instance?.displayName??"Unknown object";
  const names=item.nameResolution?.processExitNames??{};
  if(processHasCompleted(instance,"analysis") && names.analysis)return names.analysis;
  if(processHasCompleted(instance,"receiving") && names.receiving)return names.receiving;
  if(instance.knowledge?.recognizedIdentity)return item.name;
  return instance.displayName??item.nameResolution?.initialName??"Unknown object";
}

export function exposeReceiving(instance,item){
  const exposure=item?.processingExposure?.receiving??{};
  let result=exposeTags(instance,exposure.identityTags,"identityTags");
  result=exposeTags(result,exposure.conditionTags,"conditionTags");
  const condition=result.knowledge.conditionTags;
  if(condition.includes("DAMAGED"))result.state={...result.state,condition:"DAMAGED"};
  else if(condition.includes("FUNCTIONAL"))result.state={...result.state,condition:"INTACT",functionalState:"FUNCTIONAL"};
  result.processingTags=[...(result.processingTags??[])].filter(tag=>tag!=="IDENTITY_UNKNOWN");
  if(result.knowledge.identityTags.length) addUnique(result.processingTags,"IDENTITY_ESTABLISHED");
  if(applicableAnalysisTags(result,item).some(tag=>!result.knowledge.functionalityTags.includes(tag)))addUnique(result.processingTags,"ANALYSIS_REQUIRED");
  return result;
}

export function revealNextReceivingTag(instance,item,contracts){
  let result=clone(instance);
  if(result.processingTags?.includes("RECEIVING_REQUIRED") && !result.processingTags.includes("RECEIVING_AUTHORIZED")){
    const transition=Object.values(contracts??{}).flatMap(contract=>contract.transitions??[]).find(value=>value.id==="RECEIVING_AUTHORIZE");
    result.processingTags=applyProcessingTransition(result,transition).processingTags;
  }
  if(!result.processingTags?.includes("RECEIVING_AUTHORIZED"))throw new Error("Receiving authorization requirements are not satisfied.");
  const knowledge=knowledgeFor(result);
  const next=applicableReceivingTags(result,item).find(tag=>!knowledge.revealedTags.includes(tag));
  if(!next)throw new Error("All authored Receiving tags are already known.");
  const category=(item.processingExposure?.receiving?.identityTags??[]).includes(next)?"identityTags":"conditionTags";
  addUnique(knowledge.revealedTags,next);
  addUnique(knowledge[category],next);
  result.knowledge=knowledge;
  const allKnown=applicableReceivingTags(result,item).every(tag=>knowledge.revealedTags.includes(tag));
  if(allKnown){
    const transition=Object.values(contracts??{}).flatMap(contract=>contract.transitions??[]).find(value=>value.id==="RECEIVING_COMPLETE");
    result=applyProcessingTransition(result,transition);
    result.processes={...result.processes,receiving:{...result.processes?.receiving,state:"COMPLETE"}};
    result=exposeReceiving(result,item);
    result.displayName=resolveDisplayName(result,item);
  }
  return result;
}

export function revealNextAnalysisTag(instance,item){
  if(!instance?.processingTags?.includes("ANALYSIS_AUTHORIZED"))throw new Error("Analysis admission is required.");
  const result=clone(instance);
  const knowledge=knowledgeFor(result);
  const next=applicableAnalysisTags(result,item).find(tag=>!knowledge.functionalityTags.includes(tag));
  if(!next)throw new Error("All authored Analysis functionality tags are already known.");
  addUnique(knowledge.revealedTags,next);
  addUnique(knowledge.functionalityTags,next);
  result.knowledge=knowledge;
  return result;
}

export function matchesProcessMatrix(instance,roomCapabilities,matrixEntry){
  if(!matrixEntry) return false;
  return hasAll(instance.processingTags,matrixEntry.requiredProcessingTags)
    && hasNone(instance.processingTags,matrixEntry.forbiddenProcessingTags)
    && hasAll(roomCapabilities,matrixEntry.requiredRoomCapabilities);
}

export function applyProcessingTransition(instance,transition){
  if(!transition) throw new Error("Processing transition is missing.");
  if(!hasAll(instance.processingTags,transition.requiredProcessingTags)){
    throw new Error(`Processing transition requirements are not satisfied: ${transition.id}.`);
  }
  if(!hasNone(instance.processingTags,transition.forbiddenProcessingTags)){
    throw new Error(`Processing transition is forbidden by the current tags: ${transition.id}.`);
  }
  const tags=values(instance.processingTags);
  for(const tag of transition.removeProcessingTags??[]) tags.delete(tag);
  for(const tag of transition.addProcessingTags??[]) tags.add(tag);
  return {...clone(instance),processingTags:[...tags]};
}

function queueCost(queue,instances){
  return queue.reduce((total,instanceId)=>{
    if(!instanceId) return total;
    const instance=instances[instanceId];
    return total+(instance?.custody?.cost?.extendedCost??0);
  },0);
}

function firstEmptySlot(queue){
  return queue.findIndex(value=>value===null || value===undefined);
}

/**
 * Resolve, validate, and commit one physical-instance transfer.
 * The source/destination queues are mutated only after every check succeeds.
 */
export function transferInstance({
  instance,
  sourceQueue,
  destinationQueue,
  destination,
  matrixEntry,
  authorizationTransition,
  instances={},
  itemDefinition,
  primaryStorage
}){
  if(!instance?.instanceId) throw new Error("A persistent item instance is required.");
  if(!Array.isArray(sourceQueue) || !Array.isArray(destinationQueue)) throw new Error("Source and destination queues are required.");
  if(!destination?.containerId) throw new Error("A destination custody container is required.");
  if(sourceQueue.filter(value=>value===instance.instanceId).length!==1) throw new Error("Source custody does not contain the item instance.");
  if(!matchesProcessMatrix(instance,destination.processingCapabilities,matrixEntry)) throw new Error("Item Processing Tags do not match destination room capabilities.");
  if(destinationQueue===sourceQueue) throw new Error("Source and destination queues must be different.");
  if(destinationQueue.includes(instance.instanceId))throw new Error("Destination already contains the instance.");
  if(destination.storageClasses?.length && !destination.storageClasses.some(value=>itemDefinition?.storage?.storageClasses?.includes(value)))throw new Error("Item is incompatible with destination storage.");
  const slot=firstEmptySlot(destinationQueue);
  if(slot<0) throw new Error("Destination queue is full.");
  const cost=instance.custody?.cost?.extendedCost??0;
  if(!Number.isInteger(cost) || cost<0) throw new Error("Invalid item custody cost.");
  if(Number.isInteger(destination.capacity) && queueCost(destinationQueue,instances)+cost>destination.capacity) throw new Error("Destination has insufficient handling capacity.");
  const primaryId=destination.preservePrimaryStorage?instance.custody.storageId:destination.containerId;
  const store=destination.preservePrimaryStorage?primaryStorage:destination;
  if(destination.preservePrimaryStorage && (!store || store.containerId!==primaryId))throw new Error("A valid primary storage reservation is required before process custody transfer.");
  if(store?.storageClasses?.length && !store.storageClasses.some(c=>itemDefinition?.storage?.storageClasses?.includes(c)))throw new Error("Item is incompatible with primary storage.");
  const reserved=Object.values(instances).filter(i=>i.instanceId!==instance.instanceId && i.custody?.storageId===primaryId).reduce((sum,i)=>sum+(i.custody.cost?.extendedCost??0),0);
  if(Number.isInteger(store?.capacity) && reserved+cost>store.capacity)throw new Error("Primary storage has insufficient reserved capacity.");
  const authorized=authorizationTransition?applyProcessingTransition(instance,authorizationTransition):clone(instance);
  authorized.custody={...authorized.custody,storageId:primaryId,containerId:destination.containerId,nextStorageId:null,state:"STANDBY",status:"STORED",reservedBy:null,committedBy:null};
  if(destination.storageClasses?.includes("CC"))authorized.processingTags=(authorized.processingTags??[]).filter(t=>t!=="CONTAINMENT_REQUIRED");
  const sourceIndex=sourceQueue.indexOf(instance.instanceId);
  sourceQueue[sourceIndex]=null;
  destinationQueue[slot]=instance.instanceId;
  for(const queue of [sourceQueue,destinationQueue]){
    const occupied=queue.filter(Boolean);
    queue.splice(0,queue.length,...occupied,...Array(queue.length-occupied.length).fill(null));
  }
  return authorized;
}
/** Explicit simulator override: these results are asserted by the user, not inferred. */
export function simulateBoundary(instance,item,action,contracts){
  if(!instance || !item || instance.itemId!==item.id)throw new Error("Select a physical item instance.");
  if(instance.state?.condition==="DESTROYED")throw new Error("A destroyed object cannot be cleared for this route.");
  let result=clone(instance);
  const transition=id=>{
    const definition=Object.values(contracts).flatMap(c=>c.transitions).find(t=>t.id===id);
    result=applyProcessingTransition(result,definition);
  };
  if(!["simulate_known_equipment","simulate_analysis_required","simulate_containment_required","simulate_analysis_complete","simulate_next_tag_reveal","simulate_next_receiving_reveal"].includes(action))throw new Error("Unknown simulator boundary.");
  if(action==="simulate_known_equipment" && !item.storage?.storageClasses?.includes("EQ"))throw new Error("This item is not compatible with Equipment Storage.");
  if(action==="simulate_next_receiving_reveal"){
    result=revealNextReceivingTag(result,item,contracts);
    result.displayName=resolveDisplayName(result,item);
  }else if(action==="simulate_next_tag_reveal"){
    result=revealNextAnalysisTag(result,item);
  }else if(action==="simulate_analysis_complete"){
    if(!result.processingTags?.includes("ANALYSIS_AUTHORIZED"))throw new Error("Analysis authorization requirements are not satisfied.");
    const analysisTags=applicableAnalysisTags(result,item);
    if(!analysisTags.every(tag=>result.knowledge.functionalityTags?.includes(tag)))throw new Error("Reveal the remaining Analysis functionality tags before completing Analysis.");
    transition("ANALYSIS_COMPLETE");
    result.processes.analysis={...result.processes.analysis,state:"COMPLETE"};
    result.knowledge.recognizedIdentity=item.id;
    result.displayName=resolveDisplayName(result,item);
    if(item.storage?.storageClasses?.includes("EQ"))result.processingTags.push("RECEIVING_TO_EQUIPMENT_STORAGE");
  }else{
    if(result.processingTags?.includes("RECEIVING_REQUIRED")){
      transition("RECEIVING_AUTHORIZE");transition("RECEIVING_COMPLETE");
      result.processes.receiving={...result.processes.receiving,state:"COMPLETE"};
      result=exposeReceiving(result,item);
      result.displayName=resolveDisplayName(result,item);
    }
    const tags=new Set(result.processingTags??[]);
    if(action==="simulate_containment_required")tags.add("CONTAINMENT_REQUIRED");
    if(action==="simulate_analysis_required"){
      tags.delete("RECEIVING_TO_EQUIPMENT_STORAGE");tags.add("CONTAINMENT_REQUIRED");tags.add("ANALYSIS_REQUIRED");
    }
    if(action==="simulate_known_equipment"){
      if(["ANALYSIS_REQUIRED","WORKSHOP_REQUIRED"].some(tag=>tags.has(tag)))throw new Error("Resolve Analysis/Workshop requirements before clearing equipment.");
      tags.delete("CONTAINMENT_REQUIRED");
      tags.add("RECEIVING_COMPLETE");tags.add("IDENTITY_ESTABLISHED");tags.add("RECEIVING_TO_EQUIPMENT_STORAGE");
      if(result.knowledge.conditionTags?.includes("DAMAGED"))throw new Error("Damaged objects are not eligible for Equipment Storage.");
      result.knowledge.recognizedIdentity=item.id;
    }
    result.processingTags=[...tags];
  }
  result.history??=[];
  result.history.push({event:"SIMULATOR_BOUNDARY_ASSERTED",source:action.toUpperCase()});
  return result;
}
