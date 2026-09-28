import {condition,activeWork,cancelWork,refreshField} from './field.mjs?v=dialogue-doors-1';
const active=p=>['ACTIVE'].includes(p.combatState);
const emit=(s,event,data={})=>s.emittedEvents.push({event,atSeconds:s.missionElapsedSeconds,...data});
export function initializeCampaign(m,s){
  s.incidentStates=Object.fromEntries(m.incidents.map(i=>[i.incidentId,{state:i.initialState,round:0,nextRoundAt:null}]));
  s.objectiveStates=Object.fromEntries(m.objectives.map(o=>[o.objectiveId,{state:o.initialState}]));
  s.scheduledEvents=structuredClone(m.scheduledEvents);s.processedEventCount=0;s.firedBindings=[];
  for(const u of s.units){u.health=m.simulatorArtifact.combat?.partyHealth??100;u.combatState='ACTIVE';}
  refreshCampaign(m,s);
}
export function campaignCondition(s,c,event={}){
  if(c.type==='EVENT_STAGE_IN')return c.stageIds.includes(event.stageId);
  if(c.type==='INSTANCE_DETECTION_STATE')return s.instanceStates[c.instanceId]?.detectionState===c.equals;
  if(c.type==='INCIDENT_STATE')return s.incidentStates[c.incidentId]?.state===c.equals;
  if(c.type==='ALL')return c.conditions.every(x=>campaignCondition(s,x,event));
  if(c.type==='ANY')return c.conditions.some(x=>campaignCondition(s,x,event));
  return condition(s,c);
}
function effects(m,s,list,event){
  for(const e of list??[]){
    if(e.type==='SET_INSTANCE_STATE')s.instanceStates[e.instanceId][e.field]=structuredClone(e.value);
    else if(e.type==='EMIT_EVENT')emit(s,e.eventArchetypeId,{stageId:event.stageId});
    else if(e.type==='SCHEDULE_EVENT')s.scheduledEvents.push({event:e.eventArchetypeId,atSeconds:s.missionElapsedSeconds+e.delayMinutes*60,stageId:event.stageId});
    else if(e.type==='ACTIVATE_OBJECTIVE'){if(s.objectiveStates[e.objectiveId].state==='HIDDEN')s.objectiveStates[e.objectiveId].state='ACTIVE';}
    else throw new Error(`Unsupported campaign effect: ${e.type}`);
  }
}
export function processEvents(m,s){
  for(const e of s.scheduledEvents.filter(e=>!e.fired&&e.atSeconds<=s.missionElapsedSeconds)){e.fired=true;s.emittedEvents.push({event:e.event,atSeconds:e.atSeconds,stageId:e.stageId});}
  let guard=0;
  while(s.processedEventCount<s.emittedEvents.length){
    if(++guard>1000)throw new Error('Event cycle exceeds execution limit.');
    const e=s.emittedEvents[s.processedEventCount++];
    for(const b of m.eventBindings){
      if(b.eventArchetypeId!==e.event||b.once&&s.firedBindings.includes(b.bindingId)||!(b.conditions??[]).every(c=>campaignCondition(s,c,e)))continue;
      effects(m,s,b.effects,e);s.firedBindings.push(b.bindingId);
      s.resultEvents.push({type:'EVENT_BINDING_APPLIED',bindingId:b.bindingId,atSeconds:s.missionElapsedSeconds});
    }
  }
}
export function localCombat(m,s){return m.incidents.filter(i=>i.kind==='COMBAT'&&i.stageId===s.currentStageId&&s.incidentStates[i.incidentId]?.state==='ACTIVE');}
export function engagementEligibility(m,s,id){
  const i=m.indexes.incidents[id];
  if(!i||i.kind!=='COMBAT'||i.stageId!==s.currentStageId||s.status!=='ACTIVE'||s.gateState.choicePending||s.incidentStates[id]?.state!=='DORMANT')return {status:'BLOCKED',blocker:'Encounter is not available.'};
  if(!s.units.some(u=>u.currentStageId===i.stageId&&active(u)))return {status:'BLOCKED',blocker:'No local unit can fight.'};
  if(activeWork(s).some(w=>w.stageId===i.stageId))return {status:'BLOCKED',blocker:'Finish or cancel local work before engaging.'};
  return {status:'AVAILABLE',blocker:null};
}
export function engage(m,s,id){
  const eligibility=engagementEligibility(m,s,id);if(eligibility.status!=='AVAILABLE')throw new Error(eligibility.blocker);
  const i=m.indexes.incidents[id],state=s.incidentStates[id];
  if(!i||i.kind!=='COMBAT'||i.stageId!==s.currentStageId||s.status!=='ACTIVE'||s.gateState.choicePending||state.state!=='DORMANT')throw new Error('Encounter is not available.');
  if(activeWork(s).some(w=>w.stageId===i.stageId))throw new Error('Finish or cancel local work before engaging.');
  state.state='ACTIVE';state.nextRoundAt=s.missionElapsedSeconds+i.roundSeconds;
  for(const id of i.participantIds){const p=s.instanceStates[id];p.health??=i.hostileHealth;}
  s.mode='ACTIVE_INCIDENT';s.actionLog.push({atSeconds:s.missionElapsedSeconds,message:'Hostile engagement started.'});
}
export function retreat(m,s,id){
  const i=m.indexes.incidents[id];if(!i?.allowRetreat||!localCombat(m,s).includes(i))throw new Error('Retreat is unavailable.');
  // End the engagement, preserving surviving opponents; movement still follows a real doorway.
  s.incidentStates[id].state='DORMANT';s.incidentStates[id].nextRoundAt=null;
  for(const u of s.units)if(u.activityState.startsWith('COMBAT_'))u.activityState='IDLE';
  s.actionLog.push({atSeconds:s.missionElapsedSeconds,message:'Party disengaged. Surviving hostiles remain.'});refreshCampaign(m,s);
}
export function nextCampaignBoundary(m,s){return Math.min(Infinity,...s.scheduledEvents.filter(e=>!e.fired).map(e=>Math.max(0,e.atSeconds-s.missionElapsedSeconds)),...localCombat(m,s).map(i=>Math.max(0,s.incidentStates[i.incidentId].nextRoundAt-s.missionElapsedSeconds)));}
export function combatTick(m,s){
  for(const i of localCombat(m,s)){
    const state=s.incidentStates[i.incidentId];if(state.nextRoundAt>s.missionElapsedSeconds)continue;
    state.round++;state.nextRoundAt+=i.roundSeconds;
    const targets=s.units.filter(u=>u.currentStageId===i.stageId&&active(u));
    const units=targets.filter(u=>!activeWork(s).some(w=>w.actorId===u.unitId));
    const hostiles=i.participantIds.map(id=>({id,p:s.instanceStates[id]})).filter(({p})=>active(p));
    const weapon=m.simulatorArtifact.combat.partyWeapon;
    for(const u of units){
      const target=hostiles.find(({p})=>active(p));if(!target)break;
      u.activityState=weapon.mode==='MELEE'?'COMBAT_MELEE':'COMBAT_RANGED';
      target.p.health=Math.max(0,target.p.health-weapon.damage);
      if(!target.p.health)target.p.combatState='DOWN';else target.p.combatState='ACTIVE';
      s.resultEvents.push({type:'COMBAT_HIT',actorId:u.unitId,targetId:target.id,damage:weapon.damage,atSeconds:s.missionElapsedSeconds});
    }
    if(units.length&&weapon.mode==='RANGED')emit(s,'event_gunfire_occurred',{stageId:i.stageId});
    for(const {id,p} of hostiles.filter(({p})=>active(p))){
      const target=targets.find(active);if(!target)break;
      target.health=Math.max(0,target.health-i.hostileDamage);
      if(!target.health){target.combatState='DOWN';target.activityState='DOWN';for(const w of activeWork(s).filter(w=>w.actorId===target.unitId))cancelWork(s,w.workId);target.activityState='DOWN';}
      else target.combatState='ACTIVE';
      s.resultEvents.push({type:'COMBAT_HIT',actorId:id,targetId:target.unitId,damage:i.hostileDamage,atSeconds:s.missionElapsedSeconds});
    }
    if(!s.units.some(u=>u.partyStatus==='ACTIVE_PARTY'&&active(u))){s.status='INCAPACITATED';s.actionLog.push({atSeconds:s.missionElapsedSeconds,message:'The advancing party is incapacitated.'});}
  }
}
export function refreshCampaign(m,s){
  processEvents(m,s);
  for(const i of m.incidents){
    const state=s.incidentStates[i.incidentId];if(!i.implemented||state.state==='RESOLVED')continue;
    const resolved=i.kind==='COMBAT'?i.participantIds.every(id=>!active(s.instanceStates[id])):i.resolutionCondition?campaignCondition(s,i.resolutionCondition):i.resolutionMode==='STABILIZE_IMMEDIATE_DETERIORATION'&&i.participantIds.every(id=>s.instanceStates[id].condition==='STABILIZED');
    if(resolved){state.state='RESOLVED';state.resolvedAt=s.missionElapsedSeconds;state.nextRoundAt=null;emit(s,'event_incident_resolved',{incidentId:i.incidentId,stageId:i.stageId});s.resultEvents.push({type:'INCIDENT_RESOLVED',incidentId:i.incidentId,participants:(i.participantIds??[]).map(id=>({instanceId:id,state:s.instanceStates[id].combatState??s.instanceStates[id].condition})),atSeconds:s.missionElapsedSeconds});}
  }
  refreshField(m,s);
  for(let pass=0;pass<=m.objectives.length;pass++)for(const o of m.objectives){
    const state=s.objectiveStates[o.objectiveId];if(state.state==='COMPLETED')continue;
    if(state.state==='HIDDEN'&&o.revealCondition&&campaignCondition(s,o.revealCondition))state.state='ACTIVE';
    if(state.state==='ACTIVE'&&campaignCondition(s,o.completionCondition)){state.state='COMPLETED';state.completedAt=s.missionElapsedSeconds;effects(m,s,o.onComplete,{});emit(s,'event_objective_completed',{objectiveId:o.objectiveId});s.resultEvents.push({type:'OBJECTIVE_COMPLETED',objectiveId:o.objectiveId,atSeconds:s.missionElapsedSeconds});}
  }
  processEvents(m,s);refreshField(m,s);
  s.mode=m.incidents.some(i=>i.stageId===s.currentStageId&&s.incidentStates[i.incidentId].state==='ACTIVE')?'ACTIVE_INCIDENT':'FREE_INTERACTION';
  if(!localCombat(m,s).length)for(const u of s.units)if(u.activityState.startsWith('COMBAT_'))u.activityState='IDLE';
}
export function missionResults(m,s){
  return {format:'offworld-results-wave-3',missionId:m.mission.missionId,status:s.status,sgcStartTime:s.sgcStartTime,sgcEndTime:s.sgcCurrentTime,elapsedSeconds:s.missionElapsedSeconds,
    recoveryPlan:structuredClone(s.debrief??null),objectives:structuredClone(s.objectiveStates),incidents:structuredClone(s.incidentStates),personnel:structuredClone(s.units),knowledge:structuredClone(s.knowledgeState.gained),discoveries:structuredClone(s.discoveries),
    recoveredAssets:Object.entries(s.instanceStates).filter(([,v])=>v.custody==='RECOVERED_TO_SGC').map(([instanceId,state])=>({instanceId,state:structuredClone(state)})),
    partyTools:structuredClone(s.partyTools),persistentInstances:structuredClone(s.instanceStates),events:structuredClone(s.emittedEvents),scheduledEvents:structuredClone(s.scheduledEvents),ledger:structuredClone(s.resultEvents),
    bindings:m.resultBindings.map(b=>({bindingId:b.bindingId,declaredCategories:b.emit,watch:b.watch,snapshot:structuredClone(b.watch.instanceId?s.instanceStates[b.watch.instanceId]:s.incidentStates[b.watch.incidentId]),note:'Observed state only; no unauthored campaign rewards, addresses or faction deltas are invented.'}))};
}
