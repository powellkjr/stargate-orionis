import {condition} from './field.mjs?v=dialogue-doors-1';
import {refreshDialogue} from './dialogue.mjs';
import {initializePartyTools,movePartyTools,extractPartyTools} from './party-tools.mjs?v=dialogue-doors-1';
import {initializeCampaign,refreshCampaign,nextCampaignBoundary,combatTick,localCombat} from './campaign.mjs?v=dialogue-doors-1';
import {clone} from './mission.mjs?v=dialogue-doors-1';

import {validateEquipment} from './equipment.mjs?v=dialogue-doors-1';

import {initializeField,refreshField,activeWork,movementWork,nextWorkBoundary,tickWork} from './field.mjs?v=dialogue-doors-1';

export const MAX_PARTY_SIZE=4;

export function validateDeployment(units) {

  if(!Array.isArray(units)||!units.length) throw new Error('Select at least one Unit.');

  if(units.length>MAX_PARTY_SIZE) throw new Error(`A party can contain at most ${MAX_PARTY_SIZE} Units.`);

  const ids=new Set(), tools=new Set();

  for(const u of units) {

    if(!u.unitId||ids.has(u.unitId)) throw new Error('Duplicate or missing Unit ID.'); ids.add(u.unitId);

    if(!['SOLDIER','SCOUT','TECHNICIAN','SCIENTIST','MEDIC','DIPLOMAT'].includes(u.profession)) throw new Error('Unknown Profession.');

    for(const [key,min,max] of [['tier',1,3],['perception',0,10],['stamina',0,100],['endurance',1,10]]) if(!Number.isInteger(u[key])||u[key]<min||u[key]>max) throw new Error(`${u.name}: ${key} must be ${min}–${max}.`);

    for(const t of u.tools??[]) {

      if(!t.toolInstanceId||tools.has(t.toolInstanceId)||!Number.isInteger(t.chargesRemaining)||t.chargesRemaining<0||!Array.isArray(t.providedServices)) throw new Error('Invalid Tool instance.');

      tools.add(t.toolInstanceId);

    }

  }

}

export function createRuntime(m,units,startTime) {

  validateDeployment(units);

  for(const u of units)validateEquipment(u,m.toolCatalog);

  if(!Number.isFinite(Date.parse(startTime))) throw new Error('Choose a valid SGC start time.');

  const s={missionId:m.mission.missionId,missionElapsedSeconds:0,sgcStartTime:new Date(startTime).toISOString(),sgcCurrentTime:new Date(startTime).toISOString(),currentStageId:m.gate.stageId,

    gateState:{connection:m.gate.initialConnectionState,elapsedSeconds:0,choicePending:m.gate.requiresOpeningChoice,sgcOccupied:true},

    units:clone(units).map(u=>({...u,currentStageId:m.gate.stageId,partyStatus:'ACTIVE_PARTY',activityState:'IDLE'})),

    stageStates:{},transitionStates:{},instanceStates:{},knowledgeState:{starting:clone(m.startingKnowledge),gained:[]},actionLog:[],emittedEvents:[],resultEvents:[],dialogue:null,dialogueHistory:[],dialogueStarts:[],status:'ACTIVE',mode:'FREE_INTERACTION'};

  for(const d of m.stages) s.stageStates[d.stageId]={visibility:d.initialVisibility,knownShape:d.knownShapeAtStart||d.initialVisibility!=='HIDDEN',explored:d.stageId===s.currentStageId,visitCount:d.stageId===s.currentStageId?1:0,securityState:d.initialSecurityState};

  for(const d of m.transitions) s.transitionStates[d.transitionId]={state:d.initialState,known:d.fromStageId===s.currentStageId||d.toStageId===s.currentStageId};

  for(const d of m.instances) s.instanceStates[d.instanceId]={custody:'LOCAL',detectionState:'HIDDEN'};

  log(s,'Deployment arrived. Choose whether to maintain the Gate connection.'); visibility(m,s);initializePartyTools(m,s);initializeField(m,s);initializeCampaign(m,s);return s;

}

export function log(s,message){s.actionLog.push({atSeconds:s.missionElapsedSeconds,message});}

function emit(s,event){s.emittedEvents.push({event,atSeconds:s.missionElapsedSeconds});}

export function visibility(m,s) {

  for(const d of m.stages) s.stageStates[d.stageId].visibility=d.stageId===s.currentStageId?'VISIBLE':'HIDDEN';

  for(const t of m.transitions) {

    if(!condition(s,t.revealedWhen)||(t.fromStageId!==s.currentStageId&&t.toStageId!==s.currentStageId)) continue;

    s.transitionStates[t.transitionId].known=true;

    if(s.transitionStates[t.transitionId].state==='OPEN') {

      const other=t.fromStageId===s.currentStageId?t.toStageId:t.fromStageId;

      s.stageStates[other].visibility='PARTIAL';s.stageStates[other].knownShape=true;

    }

  }

}

function advanceClock(m,s,seconds) {

  if(s.status!=='ACTIVE'||s.gateState.choicePending) throw new Error('Mission is not ready to advance.');

  if(!Number.isFinite(seconds)||seconds<0) throw new Error('Invalid time increment.');

  const g=s.gateState, limit=m.gate.maxContinuousConnectionMinutes*60;

  if(g.connection==='OPEN_TO_SGC'&&g.elapsedSeconds+seconds>=limit) {

    const expiry=s.missionElapsedSeconds+limit-g.elapsedSeconds;

    g.elapsedSeconds=limit;g.connection='CLOSED';g.sgcOccupied=false;

    s.emittedEvents.push({event:m.gate.onMaxDurationEvent,atSeconds:expiry},{event:'event_gate_closed',atSeconds:expiry});

    s.actionLog.push({atSeconds:expiry,message:'37-minute connection expired. Gate released; mission continues.'});

  } else if(g.connection==='OPEN_TO_SGC') g.elapsedSeconds+=seconds;

  s.missionElapsedSeconds+=seconds;

  s.sgcCurrentTime=new Date(Date.parse(s.sgcStartTime)+s.missionElapsedSeconds*1000).toISOString();

}

export function advanceTime(m,s,seconds) {
  if(s.dialogue)throw new Error('Resolve the conversation before advancing time.');

  if(!Number.isFinite(seconds)||seconds<0)throw new Error('Invalid time increment.');

  if(s.status!=='ACTIVE'||s.gateState.choicePending)throw new Error('Mission is not ready to advance.');

  let remaining=seconds;

  refreshCampaign(m,s);
  while(remaining>0&&s.status==='ACTIVE'&&!s.dialogue){const step=Math.min(remaining,nextWorkBoundary(s),nextCampaignBoundary(m,s));advanceClock(m,s,step);tickWork(m,s,step);combatTick(m,s);refreshCampaign(m,s);remaining-=step;refreshDialogue(m,s);}

  visibility(m,s);refreshField(m,s);
  refreshDialogue(m,s);

}

export function chooseGate(m,s,keepOpen) {
  if(s.dialogue)throw new Error('Resolve the conversation before changing Gate context.');

  if(s.status!=='ACTIVE') throw new Error('Mission has ended.');

  if(keepOpen && s.gateState.connection!=='OPEN_TO_SGC') throw new Error('Return to the Gate to redial.');

  s.gateState.choicePending=false;

  if(!keepOpen&&s.gateState.connection!=='CLOSED') {s.gateState.connection='CLOSED';s.gateState.sgcOccupied=false;emit(s,'event_gate_closed');}

  log(s,keepOpen?'Connection maintained; SGC Gate remains occupied.':'Connection closed; SGC Gate released.');
  refreshDialogue(m,s);

}

export function exits(m,s,stage=s.currentStageId) {

  return m.transitions.filter(t=>condition(s,t.revealedWhen)&&(t.fromStageId===stage||t.toStageId===stage)).map(t=>({transitionId:t.transitionId,toStageId:t.fromStageId===stage?t.toStageId:t.fromStageId,direction:t.fromStageId===stage?t.directionFrom:t.directionTo,state:s.transitionStates[t.transitionId].state,routine:t.routine,known:s.transitionStates[t.transitionId].known}));

}

export function move(m,s,id) {
  if(s.dialogue)throw new Error('Resolve the conversation before moving.');

  if(s.status!=='ACTIVE'||s.gateState.choicePending) throw new Error('Choose the Gate connection first.');

  if(movementWork(s).length)throw new Error('WORK_IN_PROGRESS: wait or cancel work before moving.');

  if(localCombat(m,s).length)throw new Error('Disengage before moving.');
  const edge=exits(m,s).find(t=>t.transitionId===id);

  if(!edge) throw new Error('Transition is not adjacent.');

  if(edge.state!=='OPEN' && !(edge.routine&&edge.state==='CLOSED')) throw new Error('Requires an interaction. Select the doorway action.');

  advanceTime(m,s,m.simulatorArtifact?.movementSeconds??60);
  if(s.dialogue)return;

  if(s.status!=='ACTIVE')return;
  s.transitionStates[id].state='OPEN';s.previousStageId=s.currentStageId;s.currentStageId=edge.toStageId;

  s.stageStates[edge.toStageId].explored=true;s.stageStates[edge.toStageId].knownShape=true;
  s.stageStates[edge.toStageId].visitCount=(s.stageStates[edge.toStageId].visitCount??0)+1;

  for(const u of s.units) if(u.partyStatus==='ACTIVE_PARTY') u.currentStageId=edge.toStageId;

  movePartyTools(s,edge.toStageId);visibility(m,s);refreshField(m,s);emit(s,'event_stage_entered');refreshCampaign(m,s);log(s,`Party moved ${edge.direction.toLowerCase()}.`);
  refreshDialogue(m,s);

}

export function returnRoute(m,s) {

  const queue=[{stage:s.currentStageId,path:[]}],seen=new Set([s.currentStageId]);

  for(let i=0;i<queue.length;i++) {

    const {stage,path}=queue[i];if(stage===m.gate.stageId)return path;

    for(const e of exits(m,s,stage)) if(e.known&&(e.state==='OPEN'||(e.routine&&e.state==='CLOSED'))&&s.stageStates[e.toStageId].knownShape&&!seen.has(e.toStageId)) {

      seen.add(e.toStageId);queue.push({stage:e.toStageId,path:[...path,e.transitionId]});

    }

  }

  return null;

}

export function redial(m,s) {
  if(s.dialogue)throw new Error('Resolve the conversation before redialing.');

  if(s.currentStageId!==m.gate.stageId||s.gateState.connection!=='CLOSED') throw new Error('Redial requires the party at the closed Gate.');

  const seconds=m.simulatorArtifact?.redialSeconds;

  if(!(seconds>0))throw new Error('No authored redial duration.');

  advanceTime(m,s,seconds);s.gateState.connection='OPEN_TO_SGC';s.gateState.elapsedSeconds=0;s.gateState.sgcOccupied=true;

  log(s,'Outgoing connection to SGC established.');

}

export function extract(m,s) {
  if(s.dialogue)throw new Error('Resolve the conversation before extracting.');

  if(s.status!=='ACTIVE'||s.currentStageId!==m.gate.stageId||s.gateState.choicePending) throw new Error('Extraction requires the active party at the Gate.');

  if(s.gateState.connection!=='OPEN_TO_SGC') throw new Error('Redial SGC before extraction.');

  if(activeWork(s).length)throw new Error('Finish or cancel active work first.');

  if(s.units.some(u=>u.partyStatus==='STATIONED'))throw new Error('Recall stationed Units before extraction.');

  if(new Set(s.partyStorage).size!==s.partyStorage.length||s.partyStorage.some(id=>!m.indexes.instances[id]||s.instanceStates[id]?.custody!=='PARTY_STORAGE'))throw new Error('Invalid party storage custody.');

  extractPartyTools(s);s.status='EXTRACTED';for(const u of s.units)u.partyStatus='EXTRACTED';

  for(const id of new Set([...s.partyStorage,...s.carriedAssets,...Object.keys(s.instanceStates).filter(id=>s.instanceStates[id].custody==='AT_GATE')])){s.instanceStates[id].custody='RECOVERED_TO_SGC';if(['ESCORTED','AT_GATE'].includes(s.instanceStates[id].partyStatus))s.instanceStates[id].partyStatus='EXTRACTED';s.resultEvents.push({type:'ASSET_RECOVERED',instanceId:id,atSeconds:s.missionElapsedSeconds});}

  s.gateState.connection='CLOSED';s.gateState.sgcOccupied=false;

  refreshCampaign(m,s);log(s,'Party extracted. Mission results recorded.');

  s.resultEvents.push({type:'PARTY_EXTRACTED',unitIds:s.units.map(u=>u.unitId),atSeconds:s.missionElapsedSeconds});

}

