import {condition,activeWork} from './field.mjs?v=dialogue-doors-1';
import {professionTier} from './equipment.mjs?v=dialogue-doors-1';
import {npcEffectTypes,applyNpcEffect,validateNpcEffect} from './npc.mjs?v=dialogue-doors-1';
import {localCombat,refreshCampaign,startHostileIncident} from './campaign.mjs?v=dialogue-doors-1';
const professions=['UNTRAINED','SOLDIER','SCOUT','TECHNICIAN','SCIENTIST','MEDIC','DIPLOMAT'];
const knows=(s,id)=>[...s.knowledgeState.starting,...s.knowledgeState.gained].includes(id);
export function dialogueTrigger(s,c){
  if(!c||typeof c!=='object')return false;
  if(c.all)return c.all.every(x=>dialogueTrigger(s,x));
  if(c.knowledge)return knows(s,c.knowledge);
  if(c.enteredFromStage)return s.previousStageId===c.enteredFromStage;
  if(c.stageVisitCount){const v=c.stageVisitCount,n=s.stageStates[v.stageId]?.visitCount??0;return (v.equals===undefined||n===v.equals)&&(v.minimum===undefined||n>=v.minimum);}
  if(c.npcDispositionIn)return c.npcDispositionIn.values.includes(s.instanceStates[c.npcDispositionIn.instanceId]?.npcState?.disposition);
  if(c.instanceEvacStateIn)return c.instanceEvacStateIn.values.includes(s.instanceStates[c.instanceEvacStateIn.instanceId]?.evacState);
  return false;
}
function validateTrigger(c,indexes,fail,path){
  if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).length!==1){fail(path,'trigger must have one supported operator');return;}
  if(c.all){if(!Array.isArray(c.all)||!c.all.length)fail(path,'all needs nonempty triggers');else c.all.forEach(x=>validateTrigger(x,indexes,fail,path));}
  else if(Object.hasOwn(c,'knowledge')){if(typeof c.knowledge!=='string'||!c.knowledge)fail(path,'knowledge trigger needs ID');}
  else if(Object.hasOwn(c,'enteredFromStage')){if(!indexes.stages[c.enteredFromStage])fail(path,'unknown entry Stage');}
  else if(c.stageVisitCount){
    const v=c.stageVisitCount;
    if(!indexes.stages[v.stageId]||v.equals===undefined&&v.minimum===undefined||Object.keys(v).some(k=>!['stageId','equals','minimum'].includes(k)))fail(path,'invalid Stage visit trigger');
    for(const k of ['equals','minimum'])if(v[k]!==undefined&&(!Number.isInteger(v[k])||v[k]<1))fail(path,'visit threshold must be a positive integer');
  }else if(c.npcDispositionIn||c.instanceEvacStateIn){
    const v=c.npcDispositionIn??c.instanceEvacStateIn;
    if(!indexes.instances[v.instanceId]||c.npcDispositionIn&&!indexes.instances[v.instanceId]?.npcState||!Array.isArray(v.values)||!v.values.length||v.values.some(x=>typeof x!=='string'||!x)||Object.keys(v).some(k=>!['instanceId','values'].includes(k)))fail(path,'invalid instance-state trigger');
  }else fail(path,'unsupported dialogue trigger');
}
export function validateDialogue(scenes,indexes,fail,catalog){
  const ids=new Set();
  for(const scene of scenes){
    if(!scene||typeof scene!=='object'||Array.isArray(scene)){fail('dialogueScenes','scene must be an object');continue;}
    const path=scene.dialogueSceneId;
    if(scene.startWhen!==undefined)validateTrigger(scene.startWhen,indexes,fail,path);
    if(typeof path!=='string'||!path||ids.has(path))fail('dialogueScenes','missing or duplicate scene ID');ids.add(path);
    const participants=Object.values(scene.participants??{});
    if(!scene.participants?.left||!scene.participants?.right)fail(path,'left and right participants required');
    if(participants.filter(id=>id==='ACTIVE_SGC_SPEAKER').length!==1)fail(path,'exactly one ACTIVE_SGC_SPEAKER required for this runtime slice');
    const conditions=list=>{
      if(list===undefined)return;
      if(!Array.isArray(list)){fail(path,'conditions must be an array');return;}
      for(const c of list){
        if(!c||typeof c!=='object'){fail(path,'invalid condition');continue;}
        if(['ALL','ANY'].includes(c.type)){conditions(c.conditions);if(!Array.isArray(c.conditions))fail(path,'nested conditions required');}
        else if(c.type==='KNOWLEDGE_PRESENT'){if(typeof c.factId!=='string')fail(path,'condition factId required');}
        else if(c.type==='INCIDENT_STATE'){if(!indexes.incidents[c.incidentId])fail(path,'unknown condition Incident');}
        else if(c.type==='STAGE_STATE'){if(!indexes.stages[c.stageId]||!['socialPassage','securityState'].includes(c.field)||!Object.hasOwn(c,'equals'))fail(path,'invalid Stage condition');}
        else if(c.type==='NPC_STATE'){if(!indexes.instances[c.instanceId]?.npcState)fail(path,'condition NPC state required');}
        else if(c.type==='ASSET_CUSTODY'){if(!indexes.instances[c.assetInstanceId])fail(path,'unknown condition asset');}
        else if(!indexes.instances[c.instanceId]||typeof c.field!=='string'||!Object.hasOwn(c,'equals'))fail(path,'unsupported dialogue condition');
      }
    };
    conditions(scene.conditions);
    for(const id of participants)if(id!=='ACTIVE_SGC_SPEAKER'&&!indexes.instances[id])fail(path,`unknown participant ${id}`);
    if(!Array.isArray(scene.nodes)||!scene.nodes.length){fail(path,'nodes required');continue;}
    if(scene.nodes.some(n=>!n||typeof n!=='object'||Array.isArray(n))){fail(path,'nodes must be objects');continue;}
    const nodes=new Set(),responses=new Set();
    for(const n of scene.nodes){if(typeof n.nodeId!=='string'||!n.nodeId||nodes.has(n.nodeId))fail(path,'missing or duplicate node ID');nodes.add(n.nodeId);}
    if(scene.startNodeId!==undefined&&!nodes.has(scene.startNodeId))fail(path,'unknown start node');
    if(scene.variants!==undefined){
      if(!Array.isArray(scene.variants)||!scene.variants.length)fail(path,'variants must be a nonempty array');
      else {
        const variants=new Set();
        for(const variant of scene.variants){
          if(!variant||typeof variant!=='object'){fail(path,'variant must be an object');continue;}
          if(typeof variant.variantId!=='string'||!variant.variantId||variants.has(variant.variantId))fail(path,'missing or duplicate variant ID');
          variants.add(variant.variantId);
          validateTrigger(variant.when,indexes,fail,`${path}.${variant.variantId}`);
          if(!nodes.has(variant.startNodeId))fail(path,'unknown variant start node');
        }
      }
    }
    if(scene.startNodeId===undefined&&scene.variants===undefined)fail(path,'start node or variants required');
    const effects=list=>{
      if(list!==undefined&&!Array.isArray(list)){fail(path,'effects must be an array');return;}
      for(const e of list??[]){
        if(!e||typeof e!=='object'){fail(path,'effect must be an object');continue;}
        if(e.when)conditions([e.when]);
        if(npcEffectTypes.includes(e.type))validateNpcEffect(e,indexes.instances,fail,path);
        else if(e.type==='ADD_KNOWLEDGE'){if(typeof e.knowledgeId!=='string'||!e.knowledgeId)fail(path,'knowledgeId required');}
        else if(e.type==='HAND_OVER_PARTY_ITEM'){if(!['PARTY_STORAGE','PARTY_STORAGE_WHEN_COLLECTED'].includes(indexes.instances[e.instanceId]?.recovery?.category)||!indexes.instances[e.recipientId])fail(path,'handover needs portable item and recipient');}
        else if(e.type==='EMIT_EVENT'){
          if(e.event!==undefined&&e.eventArchetypeId!==undefined&&e.event!==e.eventArchetypeId)fail(path,'conflicting dialogue event IDs');
          if(!catalog.archetypes?.event?.[e.event??e.eventArchetypeId])fail(path,'unknown dialogue event');
        }
        else if(e.type==='MARK_ROUTE_SOCIAL_PASSAGE'){if(!indexes.stages[e.stageId]||typeof e.value!=='boolean')fail(path,'social passage needs a known Stage and boolean value');}
        else if(e.type==='SET_EVAC_STATE'){if(!indexes.instances[e.instanceId]||typeof e.value!=='string'||!e.value.trim())fail(path,'evacuation state needs a known instance and nonempty value');}
        else if(e.type==='SET_DETECTION_STATE'){if(!indexes.instances[e.instanceId]||!['HIDDEN','SUSPECTED','LOCATED'].includes(e.value))fail(path,'invalid detection state');}
        else if(e.type==='START_HOSTILE_INCIDENT'){
          const i=indexes.incidents[e.incidentId];
          if(!i||!['COMBAT','CONFRONTATION'].includes(i.kind)||!i.participantIds?.length||!Number.isFinite(i.roundSeconds)||i.roundSeconds<=0||!Number.isFinite(i.hostileHealth)||i.hostileHealth<=0||!Number.isFinite(i.hostileDamage)||i.hostileDamage<0)fail(path,'hostile incident needs participants and combat configuration');
        }
        else if(e.type==='ACTIVATE_OBJECTIVE'){if(!indexes.objectives[e.objectiveId])fail(path,'unknown dialogue objective');}
        else fail(path,`unsupported dialogue effect ${e.type}`);
      }
    };
    effects(scene.onStartEffects);
    for(const n of scene.nodes){
      conditions(n.conditions);
      if(n.branchByNpcState){
        const b=n.branchByNpcState;
        if(n.speaker!=='SYSTEM'||n.side!=='NONE'||!indexes.instances[b.instanceId]?.npcState||!Array.isArray(b.cases)||!b.cases.length||n.responses||n.nextNodeId||n.endConversation||n.effects)fail(path,'invalid silent branch');
        else for(const c of b.cases){
          if(!nodes.has(c.nextNodeId)||!c.when||!Object.keys(c.when).length||Object.entries(c.when).some(([k,v])=>!['suspicionBelow','suspicionAtLeast','hostilityBelow','hostilityAtLeast'].includes(k)||!Number.isFinite(v)||v<0||v>100))fail(path,'invalid NPC branch case');
        }
        continue;
      }
      if(n.endConversation&&n.nextNodeId||n.nextNodeId&&(n.responses??[]).length)fail(path,'ambiguous node progression');
      if(!(n.responses??[]).length&&!n.nextNodeId&&!n.endConversation)fail(path,'terminal node must declare endConversation');
      if(!['LEFT','RIGHT'].includes(n.side)||n.speaker!==scene.participants?.[n.side?.toLowerCase()]||typeof n.text!=='string')fail(path,'node speaker, side and text required');
      if(n.nextNodeId&&!nodes.has(n.nextNodeId))fail(path,'unknown next node');
      if(n.responses!==undefined&&!Array.isArray(n.responses)){fail(path,'responses must be an array');continue;}
      effects(n.effects);
      for(const r of n.responses??[]){
        if(!r||typeof r!=='object'){fail(path,'response must be an object');continue;}
        conditions(r.conditions);
        if(r.endConversation&&r.nextNodeId)fail(path,'ambiguous response progression');
        if(typeof r.responseId!=='string'||!r.responseId||responses.has(r.responseId)||typeof r.text!=='string')fail(path,'invalid or duplicate response');responses.add(r.responseId);
        if(!['NEUTRAL','KNOWLEDGE',...professions].includes(r.source))fail(path,'invalid response source');
        if(!r.endConversation&&!r.nextNodeId||r.nextNodeId&&!nodes.has(r.nextNodeId))fail(path,'response needs valid next node or endConversation');
        const req=r.requirements??{};
        for(const key of Object.keys(req))if(!['profession','minimumTier','knowledge','knowledgeAll','knowledgeAny'].includes(key))fail(path,`unsupported requirement ${key}`);
        if(req.profession&&!professions.includes(req.profession)||req.minimumTier!==undefined&&(!Number.isInteger(req.minimumTier)||req.minimumTier<0||req.minimumTier>3))fail(path,'invalid Profession requirement');
        if(req.knowledge!==undefined&&(typeof req.knowledge!=='string'||!req.knowledge)||req.knowledgeAll!==undefined&&(!Array.isArray(req.knowledgeAll)||req.knowledgeAll.some(id=>typeof id!=='string'||!id)))fail(path,'invalid Knowledge requirement');
        if(req.knowledgeAny!==undefined&&(!Array.isArray(req.knowledgeAny)||!req.knowledgeAny.length||req.knowledgeAny.some(id=>typeof id!=='string'||!id)))fail(path,'knowledgeAny requires a nonempty array of Knowledge IDs');
        effects(r.effects);
      }
    }
  }
}
export const dialogueScene=(m,id)=>(m.dialogueScenes??[]).find(scene=>scene.dialogueSceneId===id);
// Authored order resolves overlapping variants; a fixed start node is an optional fallback.
function dialogueOpening(scene,s){
  const variant=(scene.variants??[]).find(v=>dialogueTrigger(s,v.when));
  return {nodeId:variant?.startNodeId??scene.startNodeId,variantId:variant?.variantId??null};
}
export function dialogueEligibility(m,s,scene,actorId,automatic=false){
  if(!scene||s.dialogue||s.status!=='ACTIVE'||s.gateState.choicePending||localCombat(m,s).length||activeWork(s).length)return false;
  if(scene.startWhen&&(!automatic||!dialogueTrigger(s,scene.startWhen)))return false;
  const opening=dialogueOpening(scene,s),node=scene.nodes.find(n=>n.nodeId===opening.nodeId);
  if(!node||(node.conditions??[]).some(c=>!condition(s,c)))return false;
  if(!(scene.conditions??[]).every(c=>condition(s,c)))return false;
  if(Object.values(scene.participants).some(id=>id!=='ACTIVE_SGC_SPEAKER'&&(!m.indexes.instances[id]||m.indexes.instances[id].stageId!==s.currentStageId||s.stageStates[s.currentStageId].visibility!=='VISIBLE'||s.instanceStates[id]?.custody!=='LOCAL'||['DOWN','CAPTURED','FLED'].includes(s.instanceStates[id]?.combatState)||!condition(s,m.indexes.instances[id].revealedWhen))))return false;
  return s.units.some(u=>(!actorId||u.unitId===actorId)&&u.currentStageId===s.currentStageId&&u.partyStatus==='ACTIVE_PARTY'&&u.activityState==='IDLE');
}
function effects(m,s,list){
  for(const e of list??[]){
    if(e.when&&!condition(s,e.when))continue;
    if(npcEffectTypes.includes(e.type))applyNpcEffect(s,e);
    else if(e.type==='HAND_OVER_PARTY_ITEM'){
      const item=s.instanceStates[e.instanceId],recipient=s.instanceStates[e.recipientId];
      if(item?.custody!=='PARTY_STORAGE'||!s.partyStorage.includes(e.instanceId)||recipient?.custody!=='LOCAL'||m.indexes.instances[e.recipientId].stageId!==s.currentStageId)throw Error('Party item or recipient unavailable.');
      item.custody='HELD_BY_NPC';item.holderId=e.recipientId;s.partyStorage=s.partyStorage.filter(id=>id!==e.instanceId);
      s.resultEvents.push({type:'PARTY_ITEM_HANDED_OVER',instanceId:e.instanceId,recipientId:e.recipientId,atSeconds:s.missionElapsedSeconds});
    }
    else if(e.type==='ADD_KNOWLEDGE'){if(!knows(s,e.knowledgeId)){s.knowledgeState.gained.push(e.knowledgeId);s.resultEvents.push({type:'KNOWLEDGE_GAINED',factId:e.knowledgeId,atSeconds:s.missionElapsedSeconds});}}
    else if(e.type==='EMIT_EVENT')s.emittedEvents.push({event:e.event??e.eventArchetypeId,stageId:s.currentStageId,atSeconds:s.missionElapsedSeconds});
    else if(e.type==='MARK_ROUTE_SOCIAL_PASSAGE'){
      if(!s.stageStates[e.stageId])throw Error('Social passage Stage unavailable.');
      s.stageStates[e.stageId].socialPassage=e.value;
    }
    else if(e.type==='SET_EVAC_STATE'){
      if(!s.instanceStates[e.instanceId])throw Error('Evacuation instance unavailable.');
      s.instanceStates[e.instanceId].evacState=e.value;
    }
    else if(e.type==='SET_DETECTION_STATE')s.instanceStates[e.instanceId].detectionState=e.value;
    else if(e.type==='START_HOSTILE_INCIDENT')startHostileIncident(m,s,e.incidentId);
    else if(e.type==='ACTIVATE_OBJECTIVE'){
      if(!s.objectiveStates[e.objectiveId])throw Error('Dialogue objective unavailable.');
      if(s.objectiveStates[e.objectiveId].state==='HIDDEN')s.objectiveStates[e.objectiveId].state='ACTIVE';
    }
    else throw Error(`Unsupported dialogue effect: ${e.type}`);
  }
}
function enter(m,s,id,visited=new Set()){
  const scene=dialogueScene(m,s.dialogue.sceneId),node=scene.nodes.find(n=>n.nodeId===id);
  if(!node||(node.conditions??[]).some(c=>!condition(s,c)))throw Error('Dialogue node is unavailable.');
  if(visited.has(id))throw Error('Silent dialogue branch cycle.');visited.add(id);
  if(node.branchByNpcState){
    const b=node.branchByNpcState,n=s.instanceStates[b.instanceId]?.npcState;
    const match=b.cases.find(c=>n&&Object.entries(c.when).every(([k,v])=>k.endsWith('Below')?n[k.replace('Below','')]<v:n[k.replace('AtLeast','')]>=v));
    if(!match)throw Error('No matching dialogue branch.');
    return enter(m,s,match.nextNodeId,visited);
  }
  s.dialogue.nodeId=id;effects(m,s,node.effects);
  s.dialogue.history.push({speaker:node.speaker,...(node.speaker==='ACTIVE_SGC_SPEAKER'?{actorId:s.dialogue.actorId}:{}),side:node.side,text:node.text});
}
function transaction(m,s,change){const draft=structuredClone(s);change(draft);refreshCampaign(m,draft);Object.assign(s,draft);}
export function startDialogue(m,s,id,actorId,automatic=false){
  const scene=dialogueScene(m,id);if(!dialogueEligibility(m,s,scene,actorId,automatic))throw Error('Conversation is unavailable.');
  const opening=dialogueOpening(scene,s);
  transaction(m,s,draft=>{
    draft.dialogue={sceneId:id,actorId:actorId??null,fixedActorId:actorId??null,nodeId:null,variantId:opening.variantId,history:[]};
    effects(m,draft,scene.onStartEffects);enter(m,draft,opening.nodeId);
  });
}
export function refreshDialogue(m,s){
  if(s.dialogue)return false;
  const visit=s.stageStates[s.currentStageId]?.visitCount??0;
  const key=scene=>`${scene.dialogueSceneId}:${s.currentStageId}:${visit}`;
  const scene=(m.dialogueScenes??[]).find(scene=>scene.startWhen&&!(s.dialogueStarts??[]).includes(key(scene))&&dialogueEligibility(m,s,scene,null,true));
  if(!scene)return false;
  // Mark only after node entry succeeds; a failed transaction must not eat its trigger.
  startDialogue(m,s,scene.dialogueSceneId,null,true);
  s.dialogueStarts??=[];s.dialogueStarts.push(key(scene));return true;
}
export function dialogueResponses(m,s,actorId){
  if(!s.dialogue)return [];
  const node=dialogueScene(m,s.dialogue.sceneId).nodes.find(n=>n.nodeId===s.dialogue.nodeId);
  const fixed=Object.hasOwn(s.dialogue,'fixedActorId')?s.dialogue.fixedActorId:s.dialogue.actorId;
  const actors=s.units.filter(u=>(!fixed||u.unitId===fixed)&&(!actorId||u.unitId===actorId)&&u.currentStageId===s.currentStageId&&u.partyStatus==='ACTIVE_PARTY'&&u.activityState==='IDLE');
  return (node.responses??[]).map(r=>{
    const req=r.requirements??{},profession=req.profession??(!['NEUTRAL','KNOWLEDGE'].includes(r.source)?r.source:null);
    const candidates=actors.filter(actor=>(!profession||profession==='UNTRAINED'||professionTier(actor,profession)>=Math.max(1,req.minimumTier??1))
      &&(!req.knowledge||knows(s,req.knowledge))&&(req.knowledgeAll??[]).every(id=>knows(s,id))
      &&(req.knowledgeAny===undefined||req.knowledgeAny.some(id=>knows(s,id)))
      &&(r.conditions??[]).every(c=>condition(s,c))).map(u=>u.unitId);
    return {...r,eligible:!!candidates.length,candidates};
  });
}
export function respondDialogue(m,s,id,actorId){
  const response=dialogueResponses(m,s,actorId).find(r=>r.responseId===id&&r.eligible);if(!response)throw Error('Dialogue response is unavailable.');
  const responder=actorId??s.dialogue.fixedActorId??response.candidates[0];
  if(!responder||!response.candidates.includes(responder))throw Error('Choose a qualified responder.');
  const node=dialogueScene(m,s.dialogue.sceneId).nodes.find(n=>n.nodeId===s.dialogue.nodeId);
  if((node.conditions??[]).some(c=>!condition(s,c)))throw Error('Dialogue node is unavailable.');
  transaction(m,s,draft=>{
    const scene=dialogueScene(m,draft.dialogue.sceneId),side=scene.participants.left==='ACTIVE_SGC_SPEAKER'?'LEFT':'RIGHT';
    draft.dialogue.actorId=responder;
    draft.dialogue.history.push({speaker:'ACTIVE_SGC_SPEAKER',actorId:responder,side,text:response.text});effects(m,draft,response.effects);
    if(response.endConversation)finish(draft);else enter(m,draft,response.nextNodeId);
  });
}
function finish(s){s.dialogueHistory??=[];s.dialogueHistory.push(structuredClone(s.dialogue));s.resultEvents.push({type:'DIALOGUE_ENDED',sceneId:s.dialogue.sceneId,atSeconds:s.missionElapsedSeconds});s.dialogue=null;}
export function continueDialogue(m,s){
  if(!s.dialogue)throw Error('No conversation.');
  const node=dialogueScene(m,s.dialogue.sceneId).nodes.find(n=>n.nodeId===s.dialogue.nodeId);
  if(node.responses?.length)throw Error('Choose a response.');
  transaction(m,s,draft=>{if(node.nextNodeId)enter(m,draft,node.nextNodeId);else finish(draft);});
}
