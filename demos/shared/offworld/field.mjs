import {returnRoute} from './runtime.mjs?v=dialogue-doors-1';
import {availableTools,toolReserved,resolvedWorkTool} from './party-tools.mjs?v=dialogue-doors-1';
import {clone} from './mission.mjs?v=dialogue-doors-1';
import {professionTier} from './equipment.mjs?v=dialogue-doors-1';
const running=w=>['MOVING_TO_TARGET','EXECUTING'].includes(w.status);
export const activeWork=s=>s.activeWork.filter(running);
export const movementWork=s=>activeWork(s).filter(w=>s.units.find(u=>u.unitId===w.actorId)?.partyStatus==='ACTIVE_PARTY'||w.toolSource==='PARTY');
const localUnits=s=>s.units.filter(u=>u.currentStageId===s.currentStageId&&['ACTIVE_PARTY','STATIONED'].includes(u.partyStatus)&&u.activityState!=='DOWN');
const knows=(s,f)=>s.knowledgeState.starting.includes(f)||s.knowledgeState.gained.includes(f);
const stamp=(s,type,data)=>s.resultEvents.push({type,...data,atSeconds:s.missionElapsedSeconds});
export function condition(s,c){
  if(!c)return true;
  if(c.type==='INCIDENT_STATE')return s.incidentStates?.[c.incidentId]?.state===c.equals;
  if(c.type==='ANY')return c.conditions.some(v=>condition(s,v));
  if(c.type==='ALL')return c.conditions.every(v=>condition(s,v));
  if(c.type==='KNOWLEDGE_PRESENT')return knows(s,c.factId);
  if(c.type==='ASSET_CUSTODY')return s.instanceStates[c.assetInstanceId]?.custody===c.equals;
  if(c.instanceId)return s.instanceStates[c.instanceId]?.[c.field]===c.equals;
  return false;
}
function addKnowledge(s,f){if(!knows(s,f)){s.knowledgeState.gained.push(f);stamp(s,'KNOWLEDGE_GAINED',{factId:f});}}
function addDiscovery(m,s,id){
  const d=m.indexes.discoveries[id];
  if(d&&!s.discoveries.some(x=>x.discoveryId===id)&&(d.evidenceRequirements??[]).every(c=>condition(s,c))){s.discoveries.push(clone(d));stamp(s,'DISCOVERY_CREATED',{discoveryId:id});}
}
export function initializeField(m,s){
  s.activeWork=[];s.observationStates={};s.interactionStates={};s.discoveries=[];s.carriedAssets=[];
  for(const d of m.instances)Object.assign(s.instanceStates[d.instanceId],clone(d.initialState??{}));
  for(const o of m.observations)s.observationStates[o.observationId]={status:'HIDDEN',observedByUnitId:null};
  refreshField(m,s);
}
export function observationEligibility(m,s,o){
  const stage=s.stageStates[o.stageId];
  if(!o.implemented)return {eligible:false,reason:'NOT_IMPLEMENTED'};
  if(!(o.visibleIn??['VISIBLE']).includes(stage.visibility)&&!(o.fromStageIds??[]).includes(s.currentStageId))return {eligible:false,reason:'NO_OBSERVATION_ACCESS'};
  if(!(o.requiresKnowledge??[]).every(f=>knows(s,f)))return {eligible:false,reason:'REQUIRED_KNOWLEDGE_MISSING'};
  if(!condition(s,o.requiresState))return {eligible:false,reason:'INVALID_SUBJECT_STATE'};
  const eligible=localUnits(s).filter(u=>o.profession==='UNTRAINED'||professionTier(u,o.profession)>0&&professionTier(u,o.profession)>=o.minimumTier);
  const maxPerception=Math.max(0,...eligible.map(u=>u.perception));
  const actor=eligible.find(u=>u.perception>=o.minimumPerception&&(!o.requiredToolService||availableTools(s,u).some(t=>t.providedServices.includes(o.requiredToolService)&&!toolReserved(s,t.toolInstanceId))));
  return {eligible:!!actor,actor,maxPerception,reason:!eligible.length?'NO_VALID_ACTOR':maxPerception<o.minimumPerception?'PERCEPTION_TOO_LOW':!actor?'TOOL_SERVICE_MISSING':null};
}
export function refreshField(m,s){
  // Stable authored order plus fixed-point evaluation permits knowledge-gated clues.
  for(let pass=0;pass<=m.observations.length;pass++){
    let changed=false;
    for(const o of m.observations){
      const state=s.observationStates[o.observationId];if(state.status==='PRESENTED')continue;
      const e=observationEligibility(m,s,o);if(!e.eligible)continue;
      state.status='PRESENTED';state.observedByUnitId=e.actor.unitId;state.atSeconds=s.missionElapsedSeconds;
      for(const f of o.revealsFacts??[])addKnowledge(s,f);
      if(o.setsDetectionState){const {instanceId,value}=o.setsDetectionState;s.instanceStates[instanceId].detectionState=value;}
      if(o.createsDiscoveryId)addDiscovery(m,s,o.createsDiscoveryId);
      s.actionLog.push({atSeconds:s.missionElapsedSeconds,message:`${e.actor.name}: ${o.text}`});changed=true;
    }
    if(!changed)break;
  }
  for(const stage of m.stages){
    if(stage.stageId!==s.currentStageId)continue;
    const rules=stage.securityConditions;if(!rules)continue;
    const hazards=m.incidents.some(i=>i.stageId===stage.stageId&&(s.incidentStates?.[i.incidentId]?.state??i.initialState)==='ACTIVE');
    const hostiles=m.instances.some(i=>i.stageId===stage.stageId&&s.instanceStates[i.instanceId]&&['ACTIVE'].includes(s.instanceStates[i.instanceId]?.combatState));
    s.stageStates[stage.stageId].securityState=(!rules.noActiveIncidents||!hazards)&&(!rules.noActiveHostiles||!hostiles)?'SECURE':'UNSECURE';
  }
}
export function targetLocal(m,s,t){
  if(t.transitionId){const edge=m.indexes.transitions[t.transitionId];return edge.fromStageId===s.currentStageId||edge.toStageId===s.currentStageId;}
  return t.stageId===s.currentStageId&&condition(s,m.indexes.instances[t.instanceId]?.revealedWhen)&&s.instanceStates[t.instanceId].custody==='LOCAL';
}
export const roomHasHostiles=(m,s,stage=s.currentStageId)=>m.instances.some(i=>i.stageId===stage&&s.instanceStates[i.instanceId]?.combatState==='ACTIVE');
export function recipeEligibility(m,s,r,actorId=null){
  const t=m.indexes.interactionTargets[r.targetId];
  const result=(status,blocker,candidates=[])=>({status,blocker,candidates});
  if(!targetLocal(m,s,t)||(r.hiddenUntilKnowledge??[]).some(f=>!knows(s,f)))return result('HIDDEN',null);
  if(roomHasHostiles(m,s)&&!r.allowHostiles)return result('BLOCKED','HOSTILES_PRESENT');
  if(r.requiresGateRoute&&returnRoute(m,s)===null)return result('BLOCKED','NO_GATE_ROUTE');
  if(!r.implemented)return result('BLOCKED','AUTHORED_OUTCOME_REQUIRED');
  if(s.interactionStates[r.recipeInstanceId]==='COMPLETED')return result('COMPLETED',null);
  if(activeWork(s).some(w=>w.targetId===r.targetId))return result('BUSY','TARGET_BUSY');
  if(s.status!=='ACTIVE'||s.gateState.choicePending)return result('BLOCKED','MISSION_NOT_READY');
  if(!(r.requiresKnowledge??[]).every(f=>knows(s,f)))return result('BLOCKED','REQUIRED_KNOWLEDGE_MISSING');
  if(!condition(s,r.requiresState)||(r.requiresLocated&&s.instanceStates[t.instanceId]?.detectionState!=='LOCATED')||(t.transitionId&&s.transitionStates[t.transitionId].state==='OPEN'))return result('BLOCKED','INVALID_TARGET_STATE');
  const local=localUnits(s).filter(u=>!actorId||u.unitId===actorId);
  const skilled=local.filter(u=>r.profession==='UNTRAINED'||professionTier(u,r.profession)>0);
  if(!skilled.length)return result('BLOCKED','NO_VALID_ACTOR');
  const qualified=skilled.filter(u=>professionTier(u,r.profession)>=r.minimumTier&&u.perception>=(r.minimumPerception??0));
  if(!qualified.length)return result('BLOCKED','ACTOR_TIER_OR_PERCEPTION_TOO_LOW');
  const idle=qualified.filter(u=>!activeWork(s).some(w=>w.actorId===u.unitId));
  if(!idle.length)return result('BUSY','ACTOR_BUSY');
  const candidates=[];let hasService=false,hasCharges=false;
  for(const actor of idle){
    if(!r.requiredToolService){candidates.push({actorId:actor.unitId,toolInstanceId:null,actorTier:professionTier(actor,r.profession),toolTier:0});continue;}
    const tools=availableTools(s,actor).filter(t=>t.providedServices.includes(r.requiredToolService));
    hasService||=!!tools.length;
    for(const tool of tools){
      const reserved=activeWork(s).filter(w=>w.toolInstanceId===tool.toolInstanceId).reduce((n,w)=>n+w.chargeCost,0);
      if(tool.chargesRemaining!==null&&tool.chargesRemaining-reserved<r.chargeCost)continue;hasCharges=true;
      if(tool.source==='PARTY'&&toolReserved(s,tool.toolInstanceId))continue;
      candidates.push({actorId:actor.unitId,toolInstanceId:tool.toolInstanceId,toolSource:tool.source,actorTier:professionTier(actor,r.profession),toolTier:tool.tier});
    }
  }
  candidates.sort((a,b)=>(a.toolSource==='PARTY')-(b.toolSource==='PARTY')||a.actorTier-b.actorTier||a.toolTier-b.toolTier||a.actorId.localeCompare(b.actorId)||String(a.toolInstanceId).localeCompare(String(b.toolInstanceId)));
  if(!candidates.length)return result('BLOCKED',!hasService?'TOOL_SERVICE_MISSING':!hasCharges?'TOOL_CHARGES_DEPLETED':'TOOL_BUSY');
  return result('AVAILABLE',null,candidates);
}
export function executionProfile(s,r){const modifier=(r.durationModifiers??[]).find(mod=>condition(s,mod.when));return {durationMinutes:modifier?.durationMinutes??r.durationMinutes,preparation:modifier?.label??null};}
export function startWork(m,s,recipeId,actorId){
  const r=m.indexes.recipes[recipeId];if(!r)throw new Error('Unknown Recipe.');
  const e=recipeEligibility(m,s,r,actorId);if(e.status!=='AVAILABLE')throw new Error(e.blocker??e.status);
  const candidate=e.candidates[0],actor=s.units.find(u=>u.unitId===candidate.actorId);
  const w={workId:`work-${s.activeWork.length+1}`,recipeId,targetId:r.targetId,...candidate,chargeCost:r.chargeCost??0,stageId:s.currentStageId,status:'MOVING_TO_TARGET',elapsedSeconds:0,durationSeconds:executionProfile(s,r).durationMinutes*60};
  s.activeWork.push(w);actor.activityState='MOVING_TO_TARGET';actor.activeWorkId=w.workId;
  s.actionLog.push({atSeconds:s.missionElapsedSeconds,message:`${actor.name} started ${r.actionType}.`});return w;
}
export function cancelWork(s,id){
  const w=s.activeWork.find(w=>w.workId===id&&running(w));if(!w)return;
  w.status='CANCELLED';const actor=s.units.find(u=>u.unitId===w.actorId);actor.activityState='IDLE';actor.activeWorkId=null;
  s.actionLog.push({atSeconds:s.missionElapsedSeconds,message:`Cancelled ${w.recipeId}; reserved charge released.`});
}
function applyEffects(m,s,r,t){
  for(const effect of r.effects??[]){
    const e=effect;
    if(e.when&&!condition(s,e.when))continue;
    if(e.type==='SET_TARGET_STATE'||e.type==='SET_INSTANCE_STATE'){
      const id=e.type==='SET_TARGET_STATE'?t.instanceId:e.instanceId;
      if(!s.instanceStates[id]||!e.field||['__proto__','constructor','prototype'].includes(e.field))throw new Error('Invalid authored state effect.');
      s.instanceStates[id][e.field]=clone(e.value);stamp(s,'INSTANCE_CHANGED',{instanceId:id,field:e.field,value:e.value});
    }else if(e.type==='OPEN_TARGET_TRANSITION'){
      if(!s.transitionStates[t.transitionId])throw new Error('Invalid transition effect.');
      s.transitionStates[t.transitionId].state='OPEN';stamp(s,'TRANSITION_CHANGED',{transitionId:t.transitionId,state:'OPEN'});
    }else if(e.type==='ADD_KNOWLEDGE'){addKnowledge(s,e.factId);
    }else if(e.type==='SEND_TARGET_TO_GATE'){if(returnRoute(m,s)===null)throw Error('No clear route to Gate.');Object.assign(s.instanceStates[t.instanceId],{custody:'AT_GATE',partyStatus:'AT_GATE',currentStageId:m.gate.stageId});stamp(s,'ASSET_SENT_TO_GATE',{instanceId:t.instanceId});
    }else if(e.type==='CARRY_TARGET'){
      const instance=s.instanceStates[t.instanceId];if(!instance||instance.custody!=='LOCAL')throw new Error('Asset no longer local.');
      if(r.setsPartyEscort){instance.custody='CARRIED_OFFWORLD';instance.partyStatus='ESCORTED';s.carriedAssets.push(t.instanceId);stamp(s,'ASSET_CARRIED',{instanceId:t.instanceId});}
      else{instance.securedForExtraction=true;stamp(s,'ASSET_SECURED',{instanceId:t.instanceId});}
    }else throw new Error(`Unsupported effect ${e.type}`);
  }
  if(r.createsDiscoveryId)addDiscovery(m,s,r.createsDiscoveryId);
}
export function nextWorkBoundary(s){return Math.min(Infinity,...activeWork(s).map(w=>w.durationSeconds-w.elapsedSeconds));}
export function tickWork(m,s,seconds){
  for(const w of activeWork(s)){
    w.elapsedSeconds=Math.min(w.durationSeconds,w.elapsedSeconds+seconds);w.status='EXECUTING';
    const actor=s.units.find(u=>u.unitId===w.actorId);
    if(actor.activityState!=='DOWN')actor.activityState='WORKING';
    if(w.elapsedSeconds<w.durationSeconds)continue;
    const r=m.indexes.recipes[w.recipeId],t=m.indexes.interactionTargets[r.targetId];
    try{
      if((roomHasHostiles(m,s,w.stageId)&&!r.allowHostiles)||actor.currentStageId!==w.stageId||actor.activityState==='DOWN'||!['ACTIVE_PARTY','STATIONED'].includes(actor.partyStatus)||professionTier(actor,r.profession)<r.minimumTier||!targetLocal(m,{...s,currentStageId:w.stageId},t)||!condition(s,r.requiresState)||(r.requiresKnowledge??[]).some(f=>!knows(s,f)))throw new Error('Work requirements changed.');
      const tool=resolvedWorkTool(s,actor,w);
      if(w.toolInstanceId&&(!tool||tool.damaged||(tool.chargesRemaining!==null&&tool.chargesRemaining<w.chargeCost)||!tool.providedServices.includes(r.requiredToolService)))throw new Error('Reserved Tool unavailable.');
      const eventStart=s.resultEvents.length,draft=clone(s);applyEffects(m,draft,r,t);
      // Commit only the validated transaction. Work/Actor identities never transfer.
      for(const key of ['instanceStates','transitionStates','carriedAssets','discoveries','resultEvents','knowledgeState'])s[key]=draft[key];
      if(tool&&tool.chargesRemaining!==null)tool.chargesRemaining-=w.chargeCost;
      s.interactionStates[w.recipeId]='COMPLETED';w.status='COMPLETED';
      w.completedAt=s.missionElapsedSeconds;w.outcome={text:r.outcomeText??null,changes:clone(s.resultEvents.slice(eventStart)),chargesSpent:tool&&tool.chargesRemaining!==null?w.chargeCost:0};
      stamp(s,'ACTION_COMPLETED',{workId:w.workId,recipeId:w.recipeId,actorId:w.actorId,outcome:clone(w.outcome)});
      s.actionLog.push({atSeconds:s.missionElapsedSeconds,message:`${actor.name} completed ${r.actionType}.`});
    }catch(e){w.status='FAILED';w.failure=e.message;w.completedAt=s.missionElapsedSeconds;}
    if(actor.activityState!=='DOWN')actor.activityState='IDLE';actor.activeWorkId=null;
  }
  refreshField(m,s);
}
export function stationUnit(m,s,id){
  const u=s.units.find(u=>u.unitId===id);
  if(!u||s.status!=='ACTIVE'||s.gateState.choicePending||u.currentStageId!==s.currentStageId||s.stageStates[s.currentStageId].securityState!=='SECURE'||activeWork(s).some(w=>w.actorId===id))throw new Error('Stationing requires an idle local Unit in a secure Stage.');
  if(u.partyStatus==='ACTIVE_PARTY'){
    if(s.units.filter(u=>u.partyStatus==='ACTIVE_PARTY').length<=1)throw new Error('Keep at least one Unit in the advancing party.');u.partyStatus='STATIONED';
  }else if(u.partyStatus==='STATIONED')u.partyStatus='ACTIVE_PARTY';
  refreshField(m,s);
}

// Present authored alternatives once; retain distinct one-Actor execution recipes.
export function recipeChoices(m,s,recipes){const groups=new Map();for(const r of recipes){const key=r.choiceGroup??r.recipeInstanceId;const old=groups.get(key);if(!old||recipeEligibility(m,s,r).status==='AVAILABLE')groups.set(key,r);}return [...groups.values()];}
export function recipeAlternatives(m,r){return r.choiceGroup?m.recipes.filter(v=>v.targetId===r.targetId&&v.choiceGroup===r.choiceGroup):[r];}
