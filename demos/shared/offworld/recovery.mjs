import {returnRoute} from './runtime.mjs?v=dialogue-doors-1';
import {refreshCampaign} from './campaign.mjs?v=dialogue-doors-1';
import {condition} from './field.mjs?v=dialogue-doors-1';
import {validPhysicalItem} from './mission.mjs?v=dialogue-doors-1';
export function lootEntries(m,s){
  const byInstance=new Map();
  for(const r of m.recipes){
    const t=m.indexes.interactionTargets[r.targetId],d=m.indexes.instances[t.instanceId];
    if(!d||d.mapGlyph==='PERSON'||!(r.effects??[]).some(e=>e.type==='CARRY_TARGET'))continue;
    if(d.itemId&&d.recovery?.category!=='RECEIVING')continue;
    const state=s.instanceStates[d.instanceId],known=s.stageStates[d.stageId].explored||state.detectionState!=='HIDDEN'||state.custody!=='LOCAL';
    if(!known||!condition(s,d.revealedWhen))continue;
    const collected=['CARRIED_OFFWORLD','RECOVERED_TO_SGC'].includes(state.custody);
    const itemReady=!d.recovery?.requiresPreparation||state.recoveryState==='ELIGIBLE_FOR_EVAC'||state.custody==='RECOVERED_TO_SGC';
    byInstance.set(d.instanceId,{instanceId:d.instanceId,label:d.playerLabel,stageId:d.stageId,quantity:state.physicalItem?.state.quantity??d.quantity??1,cost:(d.itemId?d.itemDefinition.storage.handlingCost*state.physicalItem.state.quantity:0)+(d.cargo?.reduce((sum,item)=>sum+item.custody.cost.extendedCost,0)??0)||d.quantity||1,collected:collected||!!state.securedForExtraction,status:state.custody==='RECOVERED_TO_SGC'?'Recovered':!itemReady||!condition(s,r.requiresState)?'Blocked':state.securedForExtraction?'Secured':collected?'Collected':'Available',recipeId:r.recipeInstanceId});
  }
  return [...byInstance.values()];
}
export function debriefOptions(m,s){
  const route=id=>returnRoute(m,{...s,currentStageId:id},{secure:true})!==null;
  const delivered=id=>['AT_GATE','RECOVERED_TO_SGC'].includes(s.instanceStates[id]?.custody);
  return {loot:lootEntries(m,s).map(e=>({...e,eligible:e.status!=='Blocked'&&(delivered(e.instanceId)||route(e.stageId)),reason:e.status==='Blocked'?'Recovery requirements not met':!delivered(e.instanceId)&&!route(e.stageId)?'No secure route to Gate':null})),people:m.instances.filter(d=>d.mapGlyph==='PERSON'&&s.stageStates[d.stageId].explored&&['CAPTURED','SURRENDERED'].includes(s.instanceStates[d.instanceId].combatState)).map(d=>({instanceId:d.instanceId,label:d.playerLabel,stageId:d.stageId,state:s.instanceStates[d.instanceId].combatState,eligible:delivered(d.instanceId)||route(d.stageId),reason:!delivered(d.instanceId)&&!route(d.stageId)?'No secure route to Gate':null}))};
}
// Debrief recovery follows a valid known path to the Gate. Physical IDs persist.
// Room destinations remain admission requests until room capacity is validated.
export function finalizeDebrief(m,s,{holdingIds=[],receivingIds=[]}){
  if(s.status!=='EXTRACTED')throw new Error('Extract before finalizing the debrief.');
  if(s.debrief?.confirmed)throw new Error('This debrief has already been confirmed.');
  const options=debriefOptions(m,s);
  for(const [ids,rows] of [[holdingIds,options.people],[receivingIds,options.loot]])if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!rows.some(row=>row.instanceId===id&&row.eligible)))throw new Error('Invalid debrief selection.');
  for(const id of receivingIds){const d=m.indexes.instances[id];if(d.itemId&&!validPhysicalItem(s.instanceStates[id].physicalItem,id,d.itemId))throw Error('Invalid recovery item state or identity.');}
  const requests=[...holdingIds.map(instanceId=>({instanceId,destination:'HOLDING',status:'AWAITING_ADMISSION',cost:1})),...receivingIds.map(instanceId=>({instanceId,destination:'RECEIVING',status:'AWAITING_ADMISSION',cost:options.loot.find(e=>e.instanceId===instanceId).cost,cargo:structuredClone(m.indexes.instances[instanceId].cargo??[])}))];
  for(const request of requests){
    request.source={simulator:'offworld-sandbox',missionId:m.mission.missionId};
    const item=s.instanceStates[request.instanceId].physicalItem;
    if(!item)continue;
    // One stable instance payload, including field findings, survives the admission request.
    const recovered=structuredClone(item);
    recovered.custody={...recovered.custody,storageId:'INCOMING_INVENTORY',containerId:'INCOMING_INVENTORY',state:'STANDBY',status:'STORED'};
    recovered.custody.cost={unitCost:m.indexes.instances[request.instanceId].itemDefinition.storage.handlingCost,extendedCost:request.cost};
    recovered.history??=[];recovered.history.push({event:'RECOVERED',source:'OFFWORLD',atSeconds:s.missionElapsedSeconds});
    request.physicalItem=recovered;
  }
  for(const request of requests){const item=s.instanceStates[request.instanceId];item.custody='RECOVERED_TO_SGC';item.recoveryDestination=request.destination;if(request.destination==='HOLDING')item.partyStatus='EXTRACTED';s.resultEvents.push({type:'ASSET_RECOVERED',instanceId:request.instanceId,atSeconds:s.missionElapsedSeconds});}
  for(const request of requests)if(request.physicalItem){s.instanceStates[request.instanceId].physicalItem=structuredClone(request.physicalItem);s.instanceStates[request.instanceId].recoveryState='RECOVERED';}
  refreshCampaign(m,s);
  s.debrief={confirmed:true,holdingIds:[...holdingIds],receivingIds:[...receivingIds],requests};
  s.resultEvents.push({type:'RECOVERY_PLAN_CONFIRMED',atSeconds:s.missionElapsedSeconds,requests:structuredClone(requests)});
  return s.debrief;
}
