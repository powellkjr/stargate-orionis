import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, dirname} from 'node:path';
import {validateRooms,ROOM_CATEGORY_ORDER} from '../../demos/shared/js/rooms.js';
import {roomConstructionQuote} from '../../demos/shared/js/room-construction.mjs';
import {validateCargoEconomy,validateCargoRecipe} from '../../demos/shared/js/resource-cargo.mjs';
import {validateBase} from '../../demos/shared/js/base-configuration.mjs';
import {deploymentRoster} from '../../demos/shared/offworld/roster.mjs';
import {createTool,validateEquipment} from '../../demos/shared/offworld/equipment.mjs';
import {compileMission} from '../../demos/shared/offworld/mission.mjs';
import {MAX_PARTY_SIZE} from '../../demos/shared/offworld/runtime.mjs';
import {exportFlows} from '../../tools/export-flows.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const inputs=['base-execution.schema.json','base-execution.json','receiving-core-prototype.json','receiving-core-prototype.schema.json','theory/stargate_theory_simulator_import.json','rooms_schema.json','room-construction-prototype.json','room-construction.schema.json','resource-cargo-economy.json','resource-cargo-economy.schema.json','resource-cargo-playtest.json','instance.schema.json','item.schema.json','base-configuration.json','base-classes.json',
 'personnel-recovery.json','personnel-recovery.schema.json','personnel-names.json','personnel-loadouts.json','personnel-presentation.json','offworld/party-presets.json',
 'item.json','instance.json','cargo-handling-prototype.json','cargo-processing-prototype.json','unit-equipment-prototype.json','receiving-prototype.json','process-matrix.json','processing-contracts.json','offworld/archetypes.json',
 'offworld/missing-operative-001.finalized.json'];
// Projection behavior is part of the snapshot provenance too.
const code=['unity/tools/fixtures/receiving-before-communications.json','unity/tools/fixtures/core-setup-before-communications.json','unity/tools/fixtures/room-definitions-before-communications.json','unity/tools/fixtures/mission-before-offworld-interactions.json','unity/tools/fixtures/mission-before-offworld-expansion.json','unity/tools/fixtures/resource-processing-before-medium-cache.json','unity/tools/bootstrap-snapshot.mjs','demos/shared/js/rooms.js','demos/shared/js/resource-cargo.mjs',
 'demos/shared/js/base-configuration.mjs','demos/shared/js/room-construction.mjs','demos/shared/js/personnel-roster.mjs',
 'demos/shared/offworld/roster.mjs','demos/shared/offworld/personnel-save.mjs',
 'demos/shared/offworld/equipment.mjs','demos/shared/portraits/portrait-bust.mjs',
 'demos/shared/offworld/mission.mjs','demos/shared/offworld/runtime.mjs','demos/shared/offworld/dialogue.mjs',
 'demos/shared/offworld/npc.mjs','demos/shared/offworld/field.mjs','demos/shared/offworld/campaign.mjs','demos/shared/offworld/party-tools.mjs',
 'unity/tools/fixtures/base-before-construction-start.json','unity/tools/fixtures/rooms-before-ct1-balance.json','unity/tools/fixtures/bootstrap-before-staffing.json','unity/tools/fixtures/bootstrap-before-suffix-cleanup.json','unity/tools/fixtures/bootstrap-before-holding-route.json','unity/tools/fixtures/bootstrap-before-ready-room.json','unity/tools/fixtures/bootstrap-before-storage-rooms.json','unity/tools/fixtures/bootstrap-before-warehouse.json'];
code.push('unity/tools/fixtures/cargo-before-safe.json');
code.push('unity/tools/fixtures/mission-before-lab.json','unity/tools/fixtures/cargo-before-lab.json');
function staffingByTier(room){
 const schema=room.schema,staff=schema.rules.staffing,config=schema.function?.slotConfig?.staff;
 return Object.fromEntries(schema.rules.construction.progression.map(tier=>{
  let capacity=0;
  if(staff?.supportsStaffing){
   if(config?.byLayout)capacity=config.byLayout['1x1'];
   else if(config?.progressionSource){const values=schema.rules[config.progressionSource]?.progression;capacity=values?.[Math.min(tier-1,values.length-1)];}
   else if(config?.byConstructionTier)capacity=config.byConstructionTier[Math.min(tier-1,config.byConstructionTier.length-1)];
   else if(config?.fixed!==undefined)capacity=config.fixed;
   else if(config?.perPhysicalRoom!==undefined)capacity=config.perPhysicalRoom;
   else capacity=staff.progression?.[staff.supportsProgression?Math.min(tier-1,staff.progression.length-1):0];
  }
  if(!Number.isInteger(capacity)||capacity<0)throw Error(`Missing authored staffing capacity: ${room.id}, CT${tier}`);
  return [tier,capacity];
 }));
}
// Explicit field order matches the save codec's normalized fixture fingerprint.
function saveContent(data,staffing){
 return {baseName:data.baseName,roomDefinitions:data.roomDefinitions.map(d=>({id:d.id,name:d.name,color:d.color,width:d.width,height:d.height,...(staffing?{staffingByTier:d.staffingByTier}:{}),...(d.teamSlots?{teamSlots:d.teamSlots}:{})})),rooms:data.rooms,
  units:data.units.map(u=>({id:u.id,name:u.name,profession:u.profession,branch:u.branch,color:u.color,tier:u.tier,perception:u.perception,stamina:u.stamina,endurance:u.endurance}))};
}
const fingerprint=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
export function buildSnapshot(){
 const read=p=>JSON.parse(readFileSync(resolve(root,'demos/shared/data',p),'utf8'));
 const constructionPolicy=read('room-construction-prototype.json');
 const currentCatalog=read('rooms_schema.json'), currentRooms=validateRooms(currentCatalog);
 // Pinned historical catalog validates exact old snapshots; current data is applied below.
 const catalog=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/rooms-before-ct1-balance.json'),'utf8')), rooms=validateRooms(catalog);
 const base=validateBase(JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/base-before-construction-start.json'),'utf8')),catalog);
 const expandedBase=validateBase(read('base-configuration.json'),currentCatalog);
 if(base.groups.some(group=>group.active))throw Error('Joined-room staffing requires a Room Group adapter before bootstrap import.');
 if(base.rooms.some(room=>room.staffCount!==0))throw Error('Anonymous saved staff counts need identified Unit assignments before bootstrap import.');
 const authoredLoadouts=read('personnel-loadouts.json');
 const historicalLoadouts=structuredClone(authoredLoadouts);
 const historicalPersonnel=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/bootstrap-before-holding-route.json'),'utf8')).mission.personnel;
 for(const [id,unit] of Object.entries(historicalLoadouts.units))
  for(const [slot,tool] of unit.toolSlots.entries())tool.charges=historicalPersonnel.find(u=>u.id===id)?.tools.find(t=>t.slot===slot)?.charges??3;
 const roster=deploymentRoster(read('base-classes.json'),read('personnel-names.json'),
  read('offworld/party-presets.json'),historicalLoadouts).units;
 const equipment=read('offworld/archetypes.json'), items=read('item.json'), instances=read('instance.json');
 const receiving=read('receiving-prototype.json');
 const receivingData={recipe:receiving.recipe,
  items:receiving.incomingInstanceIds.map(id=>{
   const instance=instances[id],item=items[instance?.itemId];
   if(!item || instance.processes.receiving.state!=='NOT_STARTED')throw Error('Receiving prototype needs an existing unprocessed incoming instance: '+id);
   return {instance,item};
  }),
  rooms:rooms.map(r=>({definitionId:r.id,capacityByTier:Object.fromEntries(r.schema.rules.construction.progression.map(t=>{
   const intake=r.schema.function?.subordinateTabs?.find(tab=>tab.arrival);
   const source=intake?.slotConfig?.item?.progressionSource;
   const capacity=intake?r.schema.rules[source]?.progression?.[t-1]:0;
   if(!Number.isInteger(capacity)||capacity<0)throw Error('Missing Receiving inventory capacity: '+r.id);
   return [t,capacity];
  })),
   storageClasses:r.schema.function?.subordinateTabs?.find(t=>t.arrival)?.storage?.storageClasses??[],
   capabilities:r.schema.function?.processingCapabilities??[],services:r.schema.function?.roomServices??[]})),
  units:roster.map(u=>{
   const tools=(u.toolSlots??[]).map((t,i)=>createTool(u,i,t.kitId,t.charges,equipment)).filter(Boolean);
   validateEquipment({...u,tools},equipment);
   return {id:u.unitId,qualifications:{[u.profession]:u.tier,...(u.branch?.kind==='cross'?{[u.branch.id]:u.branch.tier}:{})},
    toolServices:[...new Set(tools.filter(t=>!t.damaged).flatMap(t=>t.providedServices))]};
  }),
  admission:read('process-matrix.json').RECEIVING_ADMISSION,
  transitions:read('processing-contracts.json').RECEIVING_PROCESS.transitions};
 const snapshot={format:'orionis-bootstrap-1',baseName:base.name,
  sources:[...inputs.map(p=>'demos/shared/data/'+p),...code].map(path=>({path,
   sha256:createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')})),
  roomDefinitions:rooms.map(r=>({id:r.id,name:r.name,color:r.color,width:r.width,height:r.height,staffingByTier:staffingByTier(r),...(r.schema.function?.team?{teamSlots:r.schema.function.team.memberSlots}:{})})),
  rooms:base.rooms.map(r=>({id:r.instanceId,definitionId:r.roomId,col:r.col,row:r.row,
   width:r.width,height:r.height,constructionTier:r.constructionTier})),
  units:roster.map(u=>({id:u.unitId,name:u.name,profession:u.profession,tier:u.tier,
   branch:u.branch?`${u.branch.id} ${u.branch.tier}`:'',color:u.color,
   perception:u.perception,stamina:u.stamina,endurance:u.endurance}))};
 // Admit the specific pre-staffing pack only when changes are confined to names and new staffing metadata.
 const legacy=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/bootstrap-before-staffing.json'),'utf8'));
 const withoutNames=data=>{const value=saveContent(data,false);value.units=value.units.map(({name,...unit})=>unit);return value;};
 snapshot.saveCompatibility=JSON.stringify(withoutNames(legacy))===JSON.stringify(withoutNames(snapshot))
  ?[{fromFingerprint:fingerprint(saveContent(legacy,false)),toFingerprint:fingerprint(saveContent(snapshot,true)),maxSaveVersion:2}]:[];
 snapshot.receiving=receivingData;
 const beforeSuffixCleanup=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/bootstrap-before-suffix-cleanup.json'),'utf8'));
 // Only this name-only projection change may retain existing staffing/work saves.
 if(JSON.stringify(withoutNames(beforeSuffixCleanup))===JSON.stringify(withoutNames(snapshot)) &&
    JSON.stringify(beforeSuffixCleanup.receiving)===JSON.stringify(receivingData)){
  snapshot.saveCompatibility.push({fromFingerprint:fingerprint(saveContent(beforeSuffixCleanup,true)),toFingerprint:fingerprint(saveContent(snapshot,true)),maxSaveVersion:4});
 }
 snapshot.nameMigrations=[legacy,beforeSuffixCleanup].flatMap(data=>data.units.filter(u=>/(?: Sr\.| V\.)$/.test(u.name))
  .map(u=>({unitId:u.id,fromName:u.name,toName:u.name.replace(/ (?:Sr\.|V\.)$/,'')})));
 const mission=compileMission(read('offworld/missing-operative-001.finalized.json'),{...equipment,itemDefinitions:items});
 if(mission.gate.initialConnectionState!=='OPEN_TO_SGC'||!mission.gate.requiresOpeningChoice)throw Error('Unsupported initial Gate contract.');
 if(mission.simulatorArtifact.redialSeconds%180!==0)throw Error('Redial requires an explicit tick conversion.');
 snapshot.mission={id:mission.mission.missionId,title:mission.mission.title,briefing:mission.mission.briefing.playerText,
  gateStageId:mission.gate.stageId,maxPartySize:MAX_PARTY_SIZE,redialTicks:mission.simulatorArtifact.redialSeconds/180,
  personnel:roster.map(u=>{
   const tools=(u.toolSlots??[]).map((t,i)=>createTool(u,i,t.kitId,t.charges,equipment)).filter(Boolean);
   validateEquipment({...u,tools},equipment);
   return {id:u.unitId,profession:u.profession,tier:u.tier,branch:u.branch,
    tools:tools.map(t=>({instanceId:t.toolInstanceId,kitId:t.kitId,slot:t.slot,tier:t.tier,label:t.label,
     services:t.providedServices,charges:t.chargesRemaining,damaged:t.damaged}))};
  })};
 // Explicit migration scope: the normal entry route, with its original conversation.
 // Other Stages/doors are not silently unlocked or treated as implemented.
 const stageIds=['stage-gate-yard','stage-outer-yard','stage-main-hall','stage-holding-area'];
 const scenes=mission.dialogueScenes.filter(s=>s.dialogueSceneId==='dialogue-yard-entry');
 if(scenes.length!==1)throw Error('Missing authored entry conversation.');
 const only=(value,keys)=>{if(Object.keys(value).some(key=>!keys.includes(key)))throw Error('Entry adapter needs support for new authored fields.');};
 for(const scene of scenes){
  only(scene,['dialogueSceneId','participants','startWhen','startNodeId','nodes']);
  if(scene.participants.left!=='ACTIVE_SGC_SPEAKER'||Object.keys(scene.participants).length!==2||
   Object.keys(scene.startWhen).length!==1||scene.startWhen.all.length!==2)throw Error('Unsupported entry trigger/participants.');
  const visit=scene.startWhen.all.find(c=>c.stageVisitCount),npc=scene.startWhen.all.find(c=>c.npcDispositionIn);
  if(!visit||!npc)throw Error('Unsupported entry trigger.');
  only(visit,['stageVisitCount']);only(visit.stageVisitCount,['stageId','equals']);
  only(npc,['npcDispositionIn']);only(npc.npcDispositionIn,['instanceId','values']);
  if(visit.stageVisitCount.stageId!==mission.indexes.instances[scene.participants.right].stageId||npc.npcDispositionIn.instanceId!==scene.participants.right)
   throw Error('Entry trigger targets need an adapter.');
  for(const node of scene.nodes){
   only(node,['nodeId','speaker','side','text','responses','effects','endConversation']);
   if(node.speaker!==scene.participants.right||node.side!=='RIGHT')throw Error('Entry node speaker needs an adapter.');
   for(const response of node.responses??[]){
    only(response,['responseId','text','source','requirements','effects','nextNodeId','endConversation']);
    only(response.requirements??{},['profession','minimumTier']);
   }
   for(const effect of [...node.effects??[],...(node.responses??[]).flatMap(r=>r.effects??[])]){
    const keys={ADD_KNOWLEDGE:['type','knowledgeId'],CHANGE_NPC_SUSPICION:['type','instanceId','delta'],SET_NPC_DISPOSITION:['type','instanceId','value']}[effect.type];
    if(!keys)throw Error('Entry conversation effect needs an adapter.');only(effect,keys);
   }
  }
 }
 snapshot.mission.travel={
  stages:stageIds.map(id=>{const s=mission.indexes.stages[id];if(!s)throw Error('Missing entry Stage: '+id);
   return {id,name:id.replace(/^stage-/,'').split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '),known:s.knownShapeAtStart};}),
  transitions:mission.transitions.filter(t=>stageIds.includes(t.fromStageId)&&stageIds.includes(t.toStageId)).map(t=>{
   if(t.revealedWhen||(!t.routine&&t.transitionId!=='door-mainhall-to-holding')||!['OPEN','CLOSED','LOCKED'].includes(t.initialState))throw Error('Doorway needs an interaction adapter.');
   return {id:t.transitionId,from:t.fromStageId,to:t.toStageId,initialState:t.initialState};}),
  npcs:[...new Set(scenes.flatMap(s=>Object.values(s.participants).filter(id=>id!=='ACTIVE_SGC_SPEAKER')))].map(id=>{
   const n=mission.indexes.instances[id];return {id,stageId:n.stageId,label:n.playerLabel,...n.npcState};}),
  startingKnowledge:mission.startingKnowledge,
  conversations:scenes.map(s=>({id:s.dialogueSceneId,stageId:mission.indexes.instances[s.participants.right].stageId,
   npcId:s.participants.right,startNodeId:s.startNodeId,
   firstVisit:s.startWhen.all.find(c=>c.stageVisitCount)?.stageVisitCount.equals,
   dispositions:s.startWhen.all.find(c=>c.npcDispositionIn)?.npcDispositionIn.values,
   nodes:s.nodes.map(n=>({id:n.nodeId,text:n.text,end:n.endConversation??false,effects:n.effects??[],
    responses:(n.responses??[]).map(r=>({id:r.responseId,text:r.text,source:r.source,
     profession:r.requirements?.profession??null,minimumTier:r.requirements?.minimumTier??1,
     nextNodeId:r.nextNodeId??null,end:r.endConversation??false,effects:r.effects??[]}))}))}))};
 const travel=snapshot.mission.travel;
 const hack=mission.indexes.recipes['hack-door-mainhall-to-holding'];
 if(!hack||hack.durationMinutes!==3||hack.effects.length!==1||hack.effects[0].type!=='OPEN_TARGET_TRANSITION'||
  hack.requiresState.type!=='TRANSITION_STATE'||hack.requiresState.transitionId!=='door-mainhall-to-holding'||hack.requiresState.equals!=='LOCKED'||
  hack.requiresKnowledge.length||hack.hiddenUntilKnowledge?.length||hack.availabilityContext||hack.requiresGateRoute||hack.requiresLocated||hack.workGroupId)
  throw Error('Door Recipe requires a wider adapter.');
 const observation=mission.indexes.observations['obs-operative-identity'];
 if(observation.requiredToolService||observation.requiresState||observation.createsDiscoveryId||observation.fromStageIds||
  observation.visibleIn.join()!=='VISIBLE'||observation.setsDetectionState?.value!=='LOCATED')throw Error('Identity observation needs a wider adapter.');
 const contact=mission.dialogueScenes.find(s=>s.dialogueSceneId==='dialogue-operative');
 only(contact,['dialogueSceneId','participants','startNodeId','onStartEffects','nodes']);
 if(contact.participants.left!=='ACTIVE_SGC_SPEAKER'||Object.keys(contact.participants).length!==2)throw Error('Unsupported contact participants.');
 for(const node of contact.nodes){
  only(node,['nodeId','speaker','side','text','responses','effects','endConversation']);
  if(node.speaker!==contact.participants.right||node.side!=='RIGHT')throw Error('Unsupported contact speaker.');
  for(const response of node.responses??[]){only(response,['responseId','text','source','effects','nextNodeId','endConversation']);if(response.source!=='NEUTRAL')throw Error('Contact requirements need an adapter.');}
 }
 const subjectIds=[...new Set([contact.participants.right,...contact.onStartEffects.filter(e=>e.when).map(e=>e.when.instanceId)])];
 const normalizeEffect=e=>{
  const keys={ADD_KNOWLEDGE:['type','knowledgeId'],CHANGE_NPC_SUSPICION:['type','instanceId','delta','when'],SET_DETECTION_STATE:['type','instanceId','value'],
   SET_EVAC_STATE:['type','instanceId','value'],ACTIVATE_OBJECTIVE:['type','objectiveId']}[e.type];
  if(!keys)throw Error('Contact effect needs an adapter.');only(e,keys);
  if(e.when){only(e.when,['instanceId','field','equals']);if(e.when.field!=='combatState'||e.when.equals!=='NEUTRAL')throw Error('Effect condition needs an adapter.');}
  return {type:e.type,...(e.instanceId?{instanceId:e.instanceId}:{}),...(e.knowledgeId?{knowledgeId:e.knowledgeId}:{}),
   ...(e.value?{value:e.value}:{}),...(e.objectiveId?{value:e.objectiveId}:{}),...(e.delta!==undefined?{delta:e.delta}:{}),...(e.when?{when:e.when}:{})};
 };
 const entry={id:contact.dialogueSceneId,stageId:mission.indexes.instances[contact.participants.right].stageId,npcId:contact.participants.right,
  startNodeId:contact.startNodeId,firstVisit:0,dispositions:[],onStartEffects:contact.onStartEffects.map(normalizeEffect),
  nodes:contact.nodes.map(n=>({id:n.nodeId,text:n.text,end:n.endConversation??false,effects:(n.effects??[]).map(normalizeEffect),
   responses:(n.responses??[]).map(r=>({id:r.responseId,text:r.text,source:r.source,profession:null,minimumTier:1,nextNodeId:r.nextNodeId??null,end:r.endConversation??false,effects:r.effects.map(normalizeEffect)}))}))};
 travel.conversations.push(entry);
 for(const id of subjectIds){const n=mission.indexes.instances[id];if(n.npcState&&!travel.npcs.some(x=>x.id===id))travel.npcs.push({id,stageId:n.stageId,label:n.playerLabel,...n.npcState});}
 const locate=mission.indexes.objectives['locate-operative'],extract=mission.indexes.objectives['extract-operative'];
 if(locate.completionCondition.type!=='INSTANCE_DETECTION_STATE'||locate.completionCondition.equals!=='LOCATED'||locate.onComplete.length!==1||locate.onComplete[0].type!=='ACTIVATE_OBJECTIVE')throw Error('Locate objective needs an adapter.');
 travel.field={subjects:subjectIds.map(id=>{const n=mission.indexes.instances[id];let combat=n.initialState?.combatState??null;
  if(combat==='ACTIVE'&&n.npcState&&n.npcState.disposition!=='HOSTILE'&&n.npcState.hostility<100)combat='NEUTRAL';
  return {id,stageId:n.stageId,label:n.playerLabel,detection:'HIDDEN',evacuation:null,combat};}),
  doorRecipes:[{id:hack.recipeInstanceId,doorId:mission.indexes.interactionTargets[hack.targetId].transitionId,profession:hack.profession,minimumTier:hack.minimumTier,
   minimumPerception:hack.minimumPerception,service:hack.requiredToolService,chargeCost:hack.chargeCost,ticks:hack.durationMinutes/3}],
  observations:[{id:observation.observationId,stageId:observation.stageId,subjectId:observation.subjectInstanceId,text:observation.text,profession:observation.profession,
   minimumTier:observation.minimumTier,minimumPerception:observation.minimumPerception,requiresKnowledge:observation.requiresKnowledge,revealsFacts:observation.revealsFacts,detection:observation.setsDetectionState.value}],
  objectives:[{id:locate.objectiveId,initialState:locate.initialState,text:locate.playerText,detectionSubjectId:locate.completionCondition.instanceId,activateOnComplete:locate.onComplete[0].objectiveId},
   {id:extract.objectiveId,initialState:extract.initialState,text:extract.playerText,detectionSubjectId:null,activateOnComplete:null}]};
 // A pinned previous projection permits additive schema-7 migration, never a
 // changed interpretation of old mission/loadout/entry-conversation content.
 const previous=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/bootstrap-before-holding-route.json'),'utf8')).mission;
 const baseProjection=m=>Object.fromEntries(Object.entries(m).filter(([key])=>key!=='travel'));
 if(JSON.stringify(baseProjection(previous))!==JSON.stringify(baseProjection(snapshot.mission))||
  ['stages','transitions','npcs','conversations'].some(key=>JSON.stringify(previous.travel[key])!==JSON.stringify(travel[key].filter(v=>previous.travel[key].some(old=>old.id===v.id)))))
  throw Error('Old entry-route content changed; explicit save migration needed.');
 snapshot.mission.previousTravelFingerprint=fingerprint(previous);
 snapshot.mission.previousTravelNpcIds=previous.travel.npcs.map(n=>n.id);
 snapshot.mission.previousTravelDefinition=previous.travel;
 // Presentation geometry is separate from mutable mission state and its save
 // fingerprint. Drawing authored cells must not invalidate a working campaign.
 snapshot.missionMap={width:mission.map.width,height:mission.map.height,
  stages:stageIds.map(id=>({id,cells:mission.indexes.stages[id].cells.map(c=>({x:c.x,y:c.y}))}))};
 const encounters=mission.incidents.filter(i=>['incident-holding-guards','incident-yard-guards'].includes(i.incidentId));
 if(encounters.length!==2||mission.simulatorArtifact.combat.partyWeapon.mode!=='RANGED')throw Error('Guard encounters need an explicit combat adapter.');
 snapshot.missionCombat={partyHealth:mission.simulatorArtifact.combat.partyHealth,partyDamage:mission.simulatorArtifact.combat.partyWeapon.damage,
  encounters:encounters.map(i=>{
   if(!i.implemented||i.kind!=='COMBAT'||i.initialState!=='DORMANT'||!i.allowRetreat)throw Error('Unsupported guard encounter.');
   return {id:i.incidentId,stageId:i.stageId,hostileHealth:i.hostileHealth,hostileDamage:i.hostileDamage,
    participants:i.participantIds.map(id=>({id,label:mission.indexes.instances[id].playerLabel}))};})};
 // Medical work remains separate from the already shipped mission fingerprint.
 const medical=mission.incidents.find(i=>i.incidentId==='incident-holding-medical');
 const escalation=encounters.find(i=>i.stageId===medical?.stageId);
 if(!medical?.implemented||medical.kind!=='HAZARD'||medical.initialState!=='ACTIVE'||medical.resolutionMode!=='STABILIZE_IMMEDIATE_DETERIORATION'||
  medical.resolutionCondition||escalation.activationCondition?.type!=='NPC_STATE'||escalation.activationCondition.suspicionAtLeast!==100)
  throw Error('Medical Incident needs a wider adapter.');
 snapshot.missionCare={incidentId:medical.incidentId,stageId:medical.stageId,escalationIncidentId:escalation.incidentId,
  suspicionThreshold:escalation.activationCondition.suspicionAtLeast,
  recipes:medical.participantIds.map(id=>{
   const patient=mission.indexes.instances[id],r=Object.values(mission.indexes.recipes).find(r=>r.actionType==='STABILIZE'&&mission.indexes.interactionTargets[r.targetId]?.instanceId===id);
   if(!r||r.profession!=='MEDIC'||r.durationMinutes!==3||r.effects.length!==2||r.requiresKnowledge.length||r.hiddenUntilKnowledge.length||r.requiresState||
    r.requiresGateRoute||r.requiresLocated||r.workGroupId||r.availabilityContext||patient.initialState.condition!=='DOWN'||
    JSON.stringify(r.effects[0])!==JSON.stringify({type:'SET_TARGET_STATE',field:'condition',value:'STABILIZED'})||
    r.effects[1].type!=='CHANGE_NPC_SUSPICION'||r.effects[1].when?.instanceId!==r.effects[1].instanceId||r.effects[1].when.field!=='combatState'||r.effects[1].when.equals!=='NEUTRAL'||
    escalation.activationCondition.instanceId!==r.effects[1].instanceId)throw Error('Patient care needs a wider adapter: '+id);
   return {id:r.recipeInstanceId,stageId:patient.stageId,subjectId:id,label:patient.playerLabel,initialCondition:patient.initialState.condition,
    requirements:{id:r.recipeInstanceId,profession:r.profession,minimumTier:r.minimumTier,minimumPerception:r.minimumPerception??0,
     service:r.requiredToolService,chargeCost:r.chargeCost,ticks:r.durationMinutes/3},guardId:r.effects[1].instanceId,suspicionDelta:r.effects[1].delta};
  })};
 const supportedIncidents=new Set([...encounters.map(i=>i.incidentId),medical.incidentId]);
 if(mission.incidents.some(i=>stageIds.includes(i.stageId)&&!supportedIncidents.has(i.incidentId)))throw Error('Secure route needs additional Incident support.');
 const rescue=mission.indexes.recipes['extract-operative'];
 if(rescue.actionType!=='SEND_TO_GATE'||rescue.durationMinutes!==3||rescue.profession!=='UNTRAINED'||rescue.minimumTier!==0||rescue.requiredToolService!==''||rescue.chargeCost!==0||
  !rescue.requiresLocated||!rescue.requiresGateRoute||rescue.hiddenUntilKnowledge.join()!=='operative-contacted'||rescue.requiresKnowledge.length||
  JSON.stringify(rescue.effects)!==JSON.stringify([{type:'SEND_TARGET_TO_GATE'}]))throw Error('Rescue Recipe requires a wider adapter.');
 const normalizeCondition=c=>({kind:c.type??'INSTANCE_STATE',id:c.instanceId??c.incidentId??c.stageId??c.factId??null,field:c.field??null,
  value:c.equals===undefined?null:String(c.equals),conditions:(c.conditions??[]).map(normalizeCondition)});
 const rescueTarget=mission.indexes.interactionTargets[rescue.targetId];
 snapshot.missionRescue={subjectId:rescueTarget.instanceId,stageId:rescueTarget.stageId,
  requirements:{id:rescue.recipeInstanceId,profession:rescue.profession,minimumTier:rescue.minimumTier,minimumPerception:rescue.minimumPerception??0,service:rescue.requiredToolService,chargeCost:rescue.chargeCost,ticks:rescue.durationMinutes/3},
  departure:normalizeCondition(rescue.requiresState)};
 const ready=rooms.find(r=>r.id==='ready_room');
 if(ready.width!==1||ready.height!==1||ready.maxConstructionTier!==1||ready.schema.rules.joining.supportsJoining||ready.schema.rules.cores.supportsCores||
  ready.schema.function.team.memberSlots!==4||ready.schema.function.team.teamsPerPhysicalRoom!==1||ready.schema.function.team.supportsStacking!==false||
  ready.schema.rules.storage.supportsStorage||ready.schema.rules.inventory.supportsInventory||ready.schema.function.roomServices?.length)throw Error('Ready Room contract changed.');
 const previousBase=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/bootstrap-before-ready-room.json'),'utf8'));
 const storageIds=['material_storage','supply_storage','equipment_storage','containment','warehouse'];
 const oldShape=structuredClone(snapshot);oldShape.rooms=oldShape.rooms.filter(r=>!['ready_room',...storageIds].includes(r.definitionId));oldShape.roomDefinitions=oldShape.roomDefinitions.filter(r=>!['ready_room','warehouse'].includes(r.id));
 const oldReceiving={...snapshot.receiving,rooms:snapshot.receiving.rooms.filter(r=>!['ready_room','warehouse'].includes(r.definitionId))};
 if(JSON.stringify(saveContent(oldShape,true))!==JSON.stringify(saveContent(previousBase,true))||
  JSON.stringify(oldReceiving)!==JSON.stringify(previousBase.receiving)||
  ['mission','missionCombat','missionCare','missionRescue'].some(k=>JSON.stringify(snapshot[k])!==JSON.stringify(previousBase[k])))throw Error('Ready Room migration requires unchanged previous entities/mission.');
 const beforeStorage=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/bootstrap-before-storage-rooms.json'),'utf8'));
 const previousShape={...snapshot,roomDefinitions:snapshot.roomDefinitions.filter(r=>r.id!=='warehouse'),rooms:snapshot.rooms.filter(r=>!storageIds.includes(r.definitionId))};
 const previousReceiving={...snapshot.receiving,rooms:snapshot.receiving.rooms.filter(r=>r.definitionId!=='warehouse')};
 if(JSON.stringify(saveContent(previousShape,true))!==JSON.stringify(saveContent(beforeStorage,true))||
  ['receiving','mission','missionCombat','missionCare','missionRescue'].some(k=>JSON.stringify(k==='receiving'?previousReceiving:snapshot[k])!==JSON.stringify(beforeStorage[k])))throw Error('Storage-room migration requires unchanged previous entities/work/mission.');
 const beforeWarehouse=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/bootstrap-before-warehouse.json'),'utf8'));
 const warehouseShape={...snapshot,roomDefinitions:snapshot.roomDefinitions.filter(r=>r.id!=='warehouse'),rooms:snapshot.rooms.filter(r=>r.definitionId!=='warehouse')};
 if(JSON.stringify(saveContent(warehouseShape,true))!==JSON.stringify(saveContent(beforeWarehouse,true))||
  ['receiving','mission','missionCombat','missionCare','missionRescue'].some(k=>JSON.stringify(k==='receiving'?previousReceiving:snapshot[k])!==JSON.stringify(beforeWarehouse[k])))throw Error('Warehouse migration requires unchanged previous entities/work/mission.');
 snapshot.previousBaseSnapshot=beforeWarehouse;
 snapshot.previousBaseMaxVersion=13;
 snapshot.roomStorage={profiles:rooms.filter(r=>storageIds.includes(r.id)).map(r=>{
  const tiers=r.schema.rules.construction.progression;
  const capacity=source=>Object.fromEntries(tiers.map(t=>{
   const value=r.schema.rules[source]?.progression?.[t-1];if(!Number.isInteger(value)||value<0)throw Error('Missing authored storage capacity: '+r.id+'/'+source);
   return [t,value];}));
  return {definitionId:r.id,categories:r.schema.rules.storage.storageTypes,capacityByTier:capacity('storage'),
   tabs:(r.schema.function?.subordinateTabs??[]).filter(t=>t.storage).map(t=>({id:t.id,label:t.name??t.id,classes:t.storage.storageClasses,
    capacityByTier:capacity(t.slotConfig.item.progressionSource)}))};
 })};
 const crate=mission.indexes.instances['equipment-crate-01'], reveal=mission.recipes.find(r=>r.recipeInstanceId==='persuade-epidemiologist');
 const revealTarget=mission.indexes.interactionTargets[reveal?.targetId];
 if(!crate||crate.stageId!=='stage-holding-area'||crate.revealedWhen?.instanceId!==revealTarget?.instanceId||crate.revealedWhen?.field!=='cacheRevealed'||crate.revealedWhen?.equals!==true||
  reveal.durationMinutes!==3||reveal.profession!=='DIPLOMAT'||reveal.minimumTier!==1||reveal.requiredToolService||reveal.chargeCost||reveal.requiresKnowledge.length||reveal.requiresState||
  reveal.effects.length!==2||reveal.effects[0].type!=='SET_TARGET_STATE'||reveal.effects[0].field!=='cacheRevealed'||reveal.effects[0].value!==true||
  reveal.effects[1].type!=='CHANGE_NPC_SUSPICION'||reveal.effects[1].when?.field!=='combatState'||reveal.effects[1].when?.equals!=='NEUTRAL'||crate.recovery?.category!=='RECEIVING'||crate.cargo.length!==1)
  throw Error('Cargo reveal/recovery adapter needs review.');
 const physicals=[crate.initialState.physicalItem,...crate.cargo];
 snapshot.missionCargo={containerId:crate.instanceId,label:crate.playerLabel,stageId:crate.stageId,
  reveal:{id:reveal.recipeInstanceId,profession:reveal.profession,minimumTier:reveal.minimumTier,ticks:reveal.durationMinutes/3},
  guardId:reveal.effects[1].instanceId,suspicionDelta:reveal.effects[1].delta,
  items:physicals.map(p=>{const instance=structuredClone(p);instance.processes={...instance.processes,receiving:{state:'NOT_STARTED'}};
   instance.processingTags??=['RECEIVING_REQUIRED'];
   if(p.instanceId===crate.instanceId)instance.displayName=crate.playerLabel;
   return {instance,item:items[p.itemId],physicalPayload:p};})};
 snapshot.cargoHandling=read('cargo-handling-prototype.json');
 snapshot.cargoProcessing=read('cargo-processing-prototype.json');
 const examinationRoom=rooms.find(r=>r.id===snapshot.cargoProcessing.examination.roomDefinitionId);
 if(!examinationRoom?.schema.function.processingCapabilities.includes(snapshot.cargoProcessing.examination.requiredCapability))throw Error('Analysis capability missing');
 snapshot.cargoProcessing.examination.itemCapacity=examinationRoom.schema.function.subordinateTabs.find(t=>t.id==="process").slotConfig.item.fixed;
 if(!Number.isInteger(snapshot.cargoProcessing.examination.itemCapacity)||snapshot.cargoProcessing.examination.itemCapacity<1)throw Error('Analysis item capacity missing');
 snapshot.unitEquipment=read('unit-equipment-prototype.json');
 snapshot.previousProgressionSnapshot=structuredClone(snapshot);
 // Unity-only playtest progression. Apply after validating historical migration
 // fixtures so those pinned definitions retain their original qualifications.
 for(const unit of snapshot.units){
  unit.tier=3;
  const source=roster.find(u=>u.unitId===unit.id);
  unit.branch=source.branch?`${source.branch.id} 3`:'';
 }
 for(const unit of snapshot.receiving.units){
  unit.qualifications=Object.fromEntries(Object.keys(unit.qualifications).map(id=>[id,3]));
 }
 for(const unit of snapshot.mission.personnel){
  unit.tier=3;
  if(unit.branch)unit.branch={...unit.branch,tier:3};
 }
 // Capture exact old capacities before applying the authored balance update.
 snapshot.previousCapacitySnapshot=structuredClone(snapshot);
 snapshot.previousRoomDefinitions=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/room-definitions-before-communications.json'),'utf8'));
 snapshot.roomDefinitions=currentRooms.map(r=>({id:r.id,name:r.name,color:r.color,width:r.width,height:r.height,staffingByTier:staffingByTier(r),...(r.schema.function?.team?{teamSlots:r.schema.function.team.memberSlots,teamExperienceSharing:r.schema.function.team.experienceSharing}:{} )}));
 for(const profile of snapshot.receiving.rooms){
  const room=currentRooms.find(r=>r.id===profile.definitionId);
  const intake=room.schema.function.subordinateTabs?.find(tab=>tab.arrival);
  profile.capacityByTier=Object.fromEntries(room.schema.rules.construction.progression.map(t=>[t,intake?room.schema.rules[intake.slotConfig.item.progressionSource].progression[t-1]:0]));
 }
 snapshot.roomStorage={profiles:currentRooms.filter(r=>storageIds.includes(r.id)).map(r=>{
  const capacity=source=>Object.fromEntries(r.schema.rules.construction.progression.map(t=>[t,r.schema.rules[source].progression[t-1]]));
  return {definitionId:r.id,categories:r.schema.rules.storage.storageTypes,capacityByTier:capacity('storage'),
   ...(r.schema.function.sharedItemCapacity?{sharedItemCapacity:true}:{}),
   tabs:(r.schema.function.subordinateTabs??[]).filter(t=>t.storage).map(t=>({id:t.id,label:t.name??t.id,classes:t.storage.storageClasses,capacityByTier:capacity(t.slotConfig.item.progressionSource)}))};
 })};
 // Every physical room needs an explicit admission profile, including new room types.
 for(const room of currentRooms)if(!snapshot.receiving.rooms.some(p=>p.definitionId===room.id))snapshot.receiving.rooms.push({definitionId:room.id,capacityByTier:{1:0},storageClasses:[],capabilities:room.schema.function.processingCapabilities??[],services:room.schema.function.roomServices??[]});
 // Planning is a read-only projection, excluded from campaign/save fingerprints.
 snapshot.roomPlanning={columns:12,rows:10,categoryOrder:ROOM_CATEGORY_ORDER,resourceClasses:Object.fromEntries(currentRooms.filter(r=>["supply_storage","material_storage","ration_storage"].includes(r.id)).map(r=>[r.schema.rules.storage.storageTypes[0],r.schema.function.subordinateTabs.filter(t=>t.quantity).map(t=>t.name)])),rooms:currentRooms.map(r=>{
  const rules=r.schema.rules, fn=r.schema.function, cores=rules.cores;
  const coreDescription=t=>{
   if(!cores.supportsCores)return 'None';
   if(cores.fixedLayout)return Object.entries(cores.fixedLayout).concat(Object.entries(cores.progressionLayout?.[t-1]??{})).map(([k,v])=>`${k}: ${v}`).join(', ');
   const config=fn.slotConfig?.core;
   const progression=config?.byConstructionTier??cores.slotProgression;
   const slots=config?.fixed??progression?.[Math.min(t-1,progression.length-1)];
   return slots===undefined?'Supported; slot count not authored':`${slots} per physical room`;
  };
  return {id:r.id,category:r.category,constructible:!!rules.construction.supportsConstruction,unique:r.unique,
   purpose:fn.base??'',joinGroup:r.joinGroup,joinLayouts:rules.joining.supportedLayouts??[],
   tiers:rules.construction.progression.map((t,index)=>({tier:t,cores:coreDescription(t),
    construction:roomConstructionQuote(r.schema,t,constructionPolicy),
    upgrade:index===0?null:roomConstructionQuote(r.schema,t,constructionPolicy,rules.construction.progression[index-1])})),
   services:fn.roomServices??[],capabilities:fn.processingCapabilities??[]};
 })};
 snapshot.previousExpansionSnapshot=structuredClone(snapshot);
 snapshot.rooms=expandedBase.rooms.map(r=>({id:r.instanceId,definitionId:r.roomId,col:r.col,row:r.row,width:r.width,height:r.height,constructionTier:r.constructionTier}));
 snapshot.roomConstruction=constructionPolicy;
 snapshot.resourceCargoEconomy=validateCargoEconomy(read('resource-cargo-economy.json'));
 // Preserve the precise previous mission scope for schema<=23 saves.
 snapshot.previousProcessingMission=structuredClone(snapshot.mission);
 const processingStage=mission.indexes.stages['stage-processing'];
 const processingDoor=mission.transitions.find(t=>t.transitionId==='door-mainhall-to-processing');
 snapshot.mission.travel.stages.push({id:processingStage.stageId,name:'Processing Room',known:processingStage.knownShapeAtStart});
 snapshot.mission.travel.transitions.push({id:processingDoor.transitionId,from:processingDoor.fromStageId,to:processingDoor.toStageId,initialState:processingDoor.initialState});
 const processingHack=mission.indexes.recipes['hack-door-mainhall-to-processing'];
 snapshot.mission.travel.field.doorRecipes.push({id:processingHack.recipeInstanceId,doorId:processingDoor.transitionId,profession:processingHack.profession,minimumTier:processingHack.minimumTier,minimumPerception:processingHack.minimumPerception??0,service:processingHack.requiredToolService,chargeCost:processingHack.chargeCost,ticks:processingHack.durationMinutes/3});
 snapshot.missionMap.stages.push({id:processingStage.stageId,cells:processingStage.cells.map(c=>({x:c.x,y:c.y}))});
 const resourcePolicy=validateCargoRecipe(read('resource-cargo-playtest.json'));
 const resource=mission.indexes.instances[resourcePolicy.instanceId];
 const actions=['inspect-mining-system','isolate-mining-power','collect-supply-cache'].map(id=>{
  const r=mission.indexes.recipes[id];if(!r||r.durationMinutes!==3)throw Error('Processing action needs a supported tick adapter.');
  return {id:r.recipeInstanceId,stageId:processingStage.stageId,label:r.actionType==='COLLECT'?'Collect Supply cache':r.actionType==='REPAIR'?'Isolate mining power':'Inspect mining system',profession:r.profession,minimumTier:r.minimumTier,minimumPerception:r.minimumPerception??0,service:r.requiredToolService||null,chargeCost:r.chargeCost,ticks:1,effects:r.effects.map(e=>e.type==='SET_TARGET_STATE'?{...e,type:'SET_INSTANCE_STATE',instanceId:mission.indexes.interactionTargets[r.targetId].instanceId}:e.type==='CARRY_TARGET'?{...e,instanceId:resource.instanceId}:e)};
 });
 const coreSetup=JSON.parse(readFileSync(resolve(root,'demos/shared/data/receiving-core-prototype.json'),'utf8'));
 const coreTheory=JSON.parse(readFileSync(resolve(root,'demos/shared/data/'+coreSetup.definitionSource),'utf8'));
 snapshot.baseExecution=JSON.parse(readFileSync(resolve(root,'demos/shared/data/base-execution.json'),'utf8'));
 snapshot.previousRoomCoreSetup=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/core-setup-before-communications.json'),'utf8'));
 snapshot.roomCoreSetup={...coreSetup,coreDefinitions:coreTheory.coreDefinitions,items:Object.fromEntries(coreTheory.coreDefinitions.filter(core=>items[core.id]).map(core=>[core.id,items[core.id]])),recipes:coreTheory.recipes.filter(recipe=>recipe.id===coreSetup.installationRecipeId)};
 snapshot.previousResourceProcessing=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/resource-processing-before-medium-cache.json'),'utf8'));
 snapshot.resourceProcessing={...resourcePolicy,stageId:resource.stageId,item:items[resource.itemId],physicalPayload:structuredClone(resource.physicalItem),actions,hazard:mission.incidents.find(i=>i.incidentId==='incident-processing-radiation')};
 snapshot.resourceProcessing.physicalPayload.instanceId=resource.instanceId;snapshot.resourceProcessing.physicalPayload.itemId=resource.itemId;
 snapshot.mission.travel.field.actions=actions;
 // Charge-only compatibility preserves existing campaigns without refilling
 // their Tools implicitly. The requested live refill is an explicit operation.
 snapshot.previousToolChargeMission=structuredClone(snapshot.mission);
 for(const unit of snapshot.mission.personnel)
  for(const tool of unit.tools)tool.charges=authoredLoadouts.units[unit.id].toolSlots[tool.slot].charges;
 snapshot.previousToolTierMission=structuredClone(snapshot.mission);
 snapshot.previousToolTierReceiving=structuredClone(snapshot.receiving);
 for(const unit of snapshot.mission.personnel){
  const source=roster.find(u=>u.unitId===unit.id);
  const leveled={...source,tier:3,branch:source.branch?{...source.branch,tier:3}:null};
  unit.tools=unit.tools.map(old=>{const t=createTool(leveled,old.slot,old.kitId.replace(/\d+$/,'3'),9,equipment);return {instanceId:t.toolInstanceId,kitId:t.kitId,slot:t.slot,tier:t.tier,label:t.label,services:t.providedServices,charges:t.chargesRemaining,damaged:t.damaged};});
  snapshot.receiving.units.find(w=>w.id===unit.id).toolServices=[...new Set(unit.tools.flatMap(t=>t.services))];
 }
 const recovery=read('personnel-recovery.json');
 const infirmary=currentRooms.find(r=>r.id===recovery.infirmaryRoomId);
 snapshot.personnelRecovery={...recovery,bedsPerRoom:infirmary.schema.function.subordinateTabs.find(t=>t.id==='patients').slotConfig.unit.perPhysicalRoom};
 // The new roster is not a name-only, fingerprint-compatible save change.
 snapshot.saveCompatibility=[];
 // Wider offworld traversal is additive; pinned projections accept existing saves.
 const beforeOffworld=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/mission-before-offworld-expansion.json'),'utf8'));
 snapshot.previousOffworldMission=beforeOffworld.mission;snapshot.previousOffworldCombat=beforeOffworld.combat;
 for(const stage of mission.stages)if(!snapshot.mission.travel.stages.some(s=>s.id===stage.stageId)){
  snapshot.mission.travel.stages.push({id:stage.stageId,name:stage.stageId.replace(/^stage-/,'').split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '),known:stage.knownShapeAtStart});
  snapshot.missionMap.stages.push({id:stage.stageId,cells:stage.cells.map(c=>({x:c.x,y:c.y}))});
 }
 for(const door of mission.transitions)if(!snapshot.mission.travel.transitions.some(d=>d.id===door.transitionId)){
  if(door.revealedWhen&&door.revealedWhen.type!=='KNOWLEDGE_PRESENT')throw Error('Unsupported doorway revelation predicate.');
  if(door.initialState==='CLOSED'&&!door.routine)throw Error('Non-routine closed doorway requires an interaction.');
  snapshot.mission.travel.transitions.push({id:door.transitionId,from:door.fromStageId,to:door.toStageId,initialState:door.initialState,...(door.revealedWhen?{requiredKnowledge:door.revealedWhen.factId}:{})});
  const hack=mission.recipes.find(r=>r.archetypeId==='recipe_hack_transition'&&mission.indexes.interactionTargets[r.targetId]?.transitionId===door.transitionId);
  if(door.initialState==='LOCKED'&&hack&&!snapshot.mission.travel.field.doorRecipes.some(r=>r.id===hack.recipeInstanceId))snapshot.mission.travel.field.doorRecipes.push({id:hack.recipeInstanceId,doorId:door.transitionId,profession:hack.profession,minimumTier:hack.minimumTier,minimumPerception:hack.minimumPerception??0,service:hack.requiredToolService,chargeCost:hack.chargeCost,ticks:hack.durationMinutes/3});
 }
 for(const encounter of mission.incidents.filter(i=>i.kind==='COMBAT')){
  if(!encounter.implemented||encounter.initialState!=='DORMANT'||!encounter.allowRetreat)throw Error('Unsupported additional guard encounter.');
  if(!snapshot.missionCombat.encounters.some(i=>i.id===encounter.incidentId))snapshot.missionCombat.encounters.push({id:encounter.incidentId,stageId:encounter.stageId,hostileHealth:encounter.hostileHealth,hostileDamage:encounter.hostileDamage,participants:encounter.participantIds.map(id=>({id,label:mission.indexes.instances[id].playerLabel}))});
  for(const id of encounter.participantIds)if(!snapshot.mission.travel.npcs.some(n=>n.id===id)){const n=mission.indexes.instances[id];snapshot.mission.travel.npcs.push({id,stageId:n.stageId,label:n.playerLabel,...n.npcState});}
 }
 // Preserve saves from the first expanded mission as NPC conversations are connected.
 snapshot.previousOffworldInteractionMission=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/mission-before-offworld-interactions.json'),'utf8'));
 for(const id of ['dialogue-holding-worker','dialogue-holding-guard','dialogue-processing-worker']){
  const scene=mission.dialogueScenes.find(s=>s.dialogueSceneId===id);
  if(!scene||scene.startWhen||scene.conditions||scene.variants)throw Error('Conversation trigger requires an explicit adapter.');
  const npc=mission.indexes.instances[scene.participants.right];
  if(!snapshot.mission.travel.npcs.some(n=>n.id===npc.instanceId))snapshot.mission.travel.npcs.push({id:npc.instanceId,stageId:npc.stageId,label:npc.playerLabel,disposition:npc.npcState?.disposition??null,suspicion:npc.npcState?.suspicion??0,hostility:npc.npcState?.hostility??0});
  const effects=values=>(values??[]).map(e=>{if(!['ADD_KNOWLEDGE','CHANGE_NPC_SUSPICION','SET_NPC_DISPOSITION'].includes(e.type))throw Error('Unsupported authored conversation effect.');return e;});
  snapshot.mission.travel.conversations.push({id,stageId:npc.stageId,npcId:npc.instanceId,startNodeId:scene.startNodeId,firstVisit:0,dispositions:[],onStartEffects:effects(scene.onStartEffects),nodes:scene.nodes.map(n=>({id:n.nodeId,text:n.text,end:n.endConversation??false,effects:effects(n.effects),responses:(n.responses??[]).map(r=>({id:r.responseId,text:r.text,source:r.source,profession:r.requirements?.profession??null,minimumTier:r.requirements?.minimumTier??1,nextNodeId:r.nextNodeId??null,end:r.endConversation??false,effects:effects(r.effects)}))}))});
 }
 // Resource processing owns its original action projection; exploration appends separately.
 snapshot.mission.travel.field.actions=[...snapshot.mission.travel.field.actions];
 for(const id of ['small-talk-worker-holding','inquire-worker-processing']){
  const recipe=mission.indexes.recipes[id],target=mission.indexes.interactionTargets[recipe.targetId];
  const socialEffects=recipe.effects.map(effect=>{
   if(!['ADD_KNOWLEDGE','CHANGE_NPC_SUSPICION'].includes(effect.type))throw Error('Unsupported exploration effect.');
   if(effect.when&&(effect.when.field!=='combatState'||effect.when.equals!=='NEUTRAL'))throw Error('Unsupported exploration effect condition.');
   return {type:effect.type,instanceId:effect.instanceId??null,knowledgeId:effect.factId??null,value:null,delta:effect.delta??0,...(effect.when?{conditionInstanceId:effect.when.instanceId,conditionField:effect.when.field,conditionEquals:effect.when.equals}:{})};
  });
  const gate=recipe.requiresState;
  if(gate&&(typeof gate.equals!=='boolean'||typeof mission.indexes.instances[gate.instanceId].initialState[gate.field]!=='boolean'))throw Error('Unsupported exploration preparation predicate.');
  snapshot.mission.travel.field.actions.push({id,stageId:target.stageId,label:recipe.actionType.toLowerCase().replaceAll('_',' '),outcomeText:recipe.outcomeText,profession:recipe.profession,minimumTier:recipe.minimumTier,minimumPerception:recipe.minimumPerception??0,service:recipe.requiredToolService||null,chargeCost:recipe.chargeCost,ticks:Math.ceil(recipe.durationMinutes/3),effects:[],socialEffects,...(gate?{gate:{instanceId:gate.instanceId,field:gate.field,value:gate.equals,initialValue:mission.indexes.instances[gate.instanceId].initialState[gate.field]}}:{})});
 }

 snapshot.previousRoomReceiving=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/receiving-before-communications.json'),'utf8'));
 snapshot.previousMissionCargo=structuredClone(snapshot.missionCargo);
 snapshot.missionCargo.additionalCaches=mission.instances.filter(c=>c.cargo?.length&&c.instanceId!==crate.instanceId).map(c=>{
  const target=mission.interactionTargets.find(t=>t.instanceId===c.instanceId),r=mission.recipes.find(r=>r.targetId===target?.targetId&&r.actionType==='COLLECT');
  if(!r||r.durationMinutes!==3||r.requiredToolService||r.chargeCost||r.requiresState||r.requiresKnowledge.length)throw Error('Additional cargo needs a supported collection contract.');
  return {containerId:c.instanceId,label:c.playerLabel,collection:{id:r.recipeInstanceId,stageId:c.stageId,label:'Collect '+c.playerLabel,profession:r.profession,minimumTier:r.profession==='UNTRAINED'?0:r.minimumTier,minimumPerception:r.minimumPerception??0,service:null,chargeCost:0,ticks:1,effects:[]},items:[c.initialState.physicalItem,...c.cargo].map(p=>{const instance=structuredClone(p);instance.processes={...instance.processes,receiving:{state:'NOT_STARTED'}};instance.processingTags??=['RECEIVING_REQUIRED'];return {instance,item:items[p.itemId],physicalPayload:p};})};
 });
 snapshot.previousSafeCargo=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/cargo-before-safe.json'),'utf8'));
 for(const c of mission.instances.filter(i=>i.recovery?.category==='RECEIVING'&&!i.cargo?.length)){
  const target=mission.interactionTargets.find(t=>t.instanceId===c.instanceId);
  const r=mission.recipes.find(r=>r.targetId===target?.targetId&&r.actionType==='COLLECT_SAFE');
  if(!r)continue; // Mounted/prepared items need their complete authored workflow.
  if(r.requiredToolService||r.chargeCost||r.requiresState||r.requiresKnowledge.length||r.effects.some(e=>e.type!=='CARRY_TARGET'))throw Error('Unsupported standalone extraction mark.');
  const p=structuredClone(c.initialState.physicalItem);if(!p)throw Error('Missing standalone physical payload.');
  const instance=structuredClone(p);instance.processes={...instance.processes,receiving:{state:'NOT_STARTED'}};instance.processingTags??=['RECEIVING_REQUIRED'];
  snapshot.missionCargo.additionalCaches.push({containerId:c.instanceId,label:c.playerLabel,collection:{id:r.recipeInstanceId,stageId:c.stageId,label:'Mark for extraction: '+c.playerLabel,profession:r.profession,minimumTier:r.minimumTier,minimumPerception:r.minimumPerception??0,service:null,chargeCost:0,ticks:Math.ceil(r.durationMinutes/3),effects:[]},items:[{instance,item:items[p.itemId],physicalPayload:p}]});
 }
 snapshot.previousLabMission=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/mission-before-lab.json'),'utf8'));
 snapshot.previousLabCargo=JSON.parse(readFileSync(resolve(root,'unity/tools/fixtures/cargo-before-lab.json'),'utf8'));
 const workflow={groups:[],initialStates:{},records:[],discoveries:[]};snapshot.mission.travel.field.workflows=workflow;
 const scalar=v=>typeof v==='string'?v:JSON.stringify(v);
 for(const instance of mission.instances){const values={...instance.initialState?.physicalItem?.state,...instance.initialState};workflow.initialStates[instance.instanceId]=Object.fromEntries(Object.entries(values).filter(([,v])=>['string','boolean','number'].includes(typeof v)).map(([k,v])=>[k,scalar(v)]));}
 const recipeProjection=r=>{
  const target=mission.indexes.interactionTargets[r.targetId],instance=mission.indexes.instances[target.instanceId],condition=r.requiresState;
  if(condition&&!['ITEM_STATE','INSTANCE_STATE'].includes(condition.type))throw Error('Unsupported lab state condition.');
  const socialEffects=[],effects=[];
  for(const e of r.effects){if(e.type==='ADD_KNOWLEDGE')socialEffects.push({type:e.type,instanceId:null,knowledgeId:e.factId??e.knowledgeId,value:null,delta:0});
   else if(e.type==='CARRY_TARGET')continue;
   else if(['SET_ITEM_STATE','SET_TARGET_STATE'].includes(e.type))effects.push({type:'SET_ITEM_STATE',instanceId:e.instanceId??instance.instanceId,field:e.field,stateValue:scalar(e.value)});
   else if(e.type==='SET_RECOVERY_STATE')effects.push({type:'SET_ITEM_STATE',instanceId:e.instanceId??instance.instanceId,field:'recoveryState',stateValue:e.value});
   else if(e.type==='ADD_INSTANCE_FINDING')effects.push({type:e.type,instanceId:e.instanceId,stateValue:e.findingId});
   else if(e.type==='ADD_TO_PARTY_STORAGE')effects.push({type:e.type,instanceId:e.instanceId});
   else throw Error('Unsupported lab Recipe effect '+e.type);
  }
  if(r.createsDiscoveryId)effects.push({type:'CREATE_DISCOVERY',instanceId:r.createsDiscoveryId});
  return {id:r.recipeInstanceId,stageId:target.stageId,label:r.actionType.toLowerCase().replaceAll('_',' ')+': '+instance.playerLabel,profession:r.profession,minimumTier:r.minimumTier,minimumPerception:r.minimumPerception??0,service:r.requiredToolService||null,chargeCost:r.chargeCost,ticks:Math.ceil(r.durationMinutes/3),effects,socialEffects,outcomeText:r.outcomeText??null,requiresKnowledge:r.requiresKnowledge,hiddenUntilKnowledge:[...new Set([...(r.hiddenUntilKnowledge??[]),...(instance.revealedWhen?.factId?[instance.revealedWhen.factId]:[])])],workGroupId:r.workGroupId??null,...(condition?{condition:{instanceId:condition.instanceId,field:condition.field,value:scalar(condition.equals)}}:{})};
 };
 for(const group of mission.workGroups??[]){if(group.recipeInstanceIds.some(id=>mission.indexes.recipes[id]?.durationMinutes!==60))throw Error('Work-group duration needs another adapter.');workflow.groups.push({id:group.workGroupId,stageId:group.stageId,label:group.playerLabel,recipeIds:group.recipeInstanceIds,effects:group.effects.map(e=>({type:e.type,instanceId:e.instanceId??null,knowledgeId:e.factId??null,value:e.value??null,delta:0}))});}
 const labActions=mission.recipes.filter(r=>mission.indexes.interactionTargets[r.targetId]?.stageId==='stage-analysis-lab');
 for(const r of labActions){
  const projection=recipeProjection(r),target=mission.indexes.interactionTargets[r.targetId],instance=mission.indexes.instances[target.instanceId];
  if(!r.effects.some(e=>e.type==='CARRY_TARGET')){snapshot.mission.travel.field.actions.push(projection);continue;}
  if(!instance.initialState.physicalItem||!r.requiresState)throw Error('Prepared recovery requires an authored physical item/state.');
  // The prepared payload is projected from the exact authored predecessor
  // transitions. Admission proves those transitions before marking the item.
  const payload=structuredClone(instance.initialState.physicalItem);
  for(const predecessor of labActions.filter(a=>mission.indexes.interactionTargets[a.targetId]?.instanceId===instance.instanceId))for(const effect of predecessor.effects){if(effect.type==='SET_ITEM_STATE')payload.state[effect.field]=effect.value;if(effect.type==='ADD_INSTANCE_FINDING')payload.knowledge.instanceFindings.push(effect.findingId);}
  const incoming=structuredClone(payload);incoming.processes={...incoming.processes,receiving:{state:'NOT_STARTED'}};
  snapshot.missionCargo.additionalCaches.push({containerId:instance.instanceId,label:instance.playerLabel,collection:projection,items:[{instance:incoming,item:items[payload.itemId],physicalPayload:payload}]});
 }
 for(const o of mission.observations.filter(o=>o.stageId==='stage-analysis-lab')){
  if(o.requiresState?.type!=='KNOWLEDGE_PRESENT')throw Error('Lab observation needs another predicate adapter.');
  if(!snapshot.mission.travel.field.subjects.some(s=>s.id===o.subjectInstanceId)){const i=mission.indexes.instances[o.subjectInstanceId];snapshot.mission.travel.field.subjects.push({id:i.instanceId,stageId:i.stageId,label:i.playerLabel,detection:'HIDDEN',evacuation:null,combat:null});}
  snapshot.mission.travel.field.observations.push({id:o.observationId,stageId:o.stageId,subjectId:o.subjectInstanceId,text:o.text,profession:o.profession,minimumTier:o.minimumTier,minimumPerception:o.minimumPerception,requiresKnowledge:[...o.requiresKnowledge,o.requiresState.factId],revealsFacts:o.revealsFacts,detection:o.setsDetectionState?.value??'LOCATED'});
 }
 workflow.records=mission.instances.filter(i=>i.recovery?.category==='PARTY_STORAGE_WHEN_COLLECTED').map(i=>({id:i.instanceId,label:i.playerLabel}));
 workflow.discoveries=(mission.discoveries??[]).map(d=>({id:d.discoveryId,label:d.question}));
 // Door orientation/anchors are presentation only, outside mission save truth.
 const steps={NORTH:[0,-1],EAST:[1,0],SOUTH:[0,1],WEST:[-1,0]};
 snapshot.missionMap.doors=mission.transitions.map(t=>{
  const a=mission.indexes.stages[t.fromStageId],b=mission.indexes.stages[t.toStageId],step=steps[t.directionFrom],back=steps[t.directionTo];
  if(!step||!back||step[0]!==-back[0]||step[1]!==-back[1])throw Error('Door presentation needs authored opposite directions.');
  const matches=a.cells.flatMap(fromCell=>b.cells.filter(c=>c.x-fromCell.x===step[0]&&c.y-fromCell.y===step[1]).map(toCell=>({fromCell,toCell})));
  if(!matches.length)throw Error('No matching exterior cell edge for '+t.transitionId);
  // Match the existing action-hex first-shared-edge anchor; mark ambiguity.
  return {id:t.transitionId,from:t.fromStageId,to:t.toStageId,fromDirection:t.directionFrom,toDirection:t.directionTo,...matches[0],provisional:matches.length>1};
 });
 return snapshot;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const output=resolve(root,'unity/StargateOrionis/Assets/Orionis/Data/Generated/bootstrap.json');
 const text=JSON.stringify(buildSnapshot(),null,2)+'\n';
 exportFlows({check:process.argv.includes('--check')});
 if(process.argv.includes('--check')){
  if(readFileSync(output,'utf8').replaceAll('\r\n','\n')!==text)throw Error('Bootstrap snapshot is stale. Run node unity/tools/bootstrap-snapshot.mjs');
  console.log('Bootstrap snapshot matches authored sources.');
 }else{mkdirSync(dirname(output),{recursive:true});writeFileSync(output,text);console.log('Updated '+output);}
}
