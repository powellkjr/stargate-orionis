import {resolvePartyTools} from './party-tools.mjs?v=dialogue-doors-1';
import {validateDialogue} from './dialogue.mjs';
import {validNpcState,npcEffectTypes,validateNpcEffect} from './npc.mjs?v=dialogue-doors-1';
export const clone = value => structuredClone(value);
export function validPhysicalItem(item,id,itemId){
  return !!item&&item.instanceId===id&&item.itemId===itemId&&[item.state,item.reality,item.knowledge].every(v=>v&&typeof v==='object'&&!Array.isArray(v))&&Number.isInteger(item.state.quantity)&&item.state.quantity>0&&Array.isArray(item.knowledge.instanceFindings);
}
export function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
export const groups = {
  stages:['stage','stageId'], transitions:['transition','transitionId'], instances:['instance','instanceId'],
  observations:['observation','observationId'], interactionTargets:['interactionTarget','targetId'], recipes:['recipe','recipeInstanceId'],
  incidents:['incident','incidentId'], objectives:[null,'objectiveId'], discoveries:[null,'discoveryId'],
  eventBindings:[null,'bindingId'], resultBindings:[null,'bindingId']
};
export const directions={NORTH:[0,-1],EAST:[1,0],SOUTH:[0,1],WEST:[-1,0]};
export const opposite={NORTH:'SOUTH',SOUTH:'NORTH',EAST:'WEST',WEST:'EAST'};
export const fieldStateEffects={
  SET_DETECTION_STATE:{field:'detectionState',values:['HIDDEN','SUSPECTED','LOCATED']},
  SET_RECOVERY_STATE:{field:'recoveryState',values:['UNKNOWN','LOCATED','SECURED','ELIGIBLE_FOR_EVAC','SELECTED_FOR_EVAC','RECOVERED','LEFT_BEHIND']}
};
const typeOf=v=>Array.isArray(v)?'array':v===null?'null':typeof v;
export function compileMission(input,catalog) {
  const m=clone(input),errors=[],indexes={};
  const fail=(p,msg)=>errors.push(`${p}: ${msg}`);
  for(const key of ['startingKnowledge','scheduledEvents'])if(!Array.isArray(m[key])){fail(key,'required array');m[key]=[];}
  for(const [group,[kind,idKey]] of Object.entries(groups)) {
    indexes[group]=Object.create(null);
    if(!Array.isArray(m[group])) {fail(group,'required array');m[group]=[];}
    m[group]=m[group].map(row=>{
      const path=`${group}.${row[idKey]}`;let result=clone(row);
      if(kind) {
        const base=catalog.archetypes?.[kind]?.[row.archetypeId];
        if(!base) fail(`${path}.archetypeId`,`unknown ${row.archetypeId}`);
        else {
          result={...clone(base.defaults),...result};
          for(const key of new Set([...Object.keys(base.defaults),...Object.keys(base.tunableFields)])) if(Object.hasOwn(row,key))fail(`${path}.${key}`,'use legal overrides');
          for(const [key,value] of Object.entries(row.overrides??{})) {
            if(!Object.hasOwn(base.tunableFields,key))fail(`${path}.overrides.${key}`,'not tunable');
            else if(typeOf(value)!==base.tunableFields[key]||(typeof value==='number'&&!Number.isFinite(value)))fail(`${path}.overrides.${key}`,`expected ${base.tunableFields[key]}`);
            else result[key]=clone(value);
          }
          delete result.overrides;
        }
      }
      if(typeof row[idKey]!=='string'||!row[idKey]||indexes[group][row[idKey]])fail(path,'missing or duplicate ID');
      indexes[group][row[idKey]]=result;return result;
    });
  }
  // Shared item definitions supply stable metadata; the mission authors one physical instance.
  for(const i of m.instances)if(i.itemId!==undefined){
    const item=catalog.itemDefinitions?.[i.itemId],physical=i.physicalItem;
    if(!item||item.id!==i.itemId||!Number.isInteger(item.storage?.handlingCost)||item.storage.handlingCost<0||i.recovery?.category==='RECEIVING'&&(item.storage.handlingCost<1||item.processCompatibility?.receiving!==true)){fail(i.instanceId,'shared item definition with compatible handling metadata required');continue;}
    if(!validPhysicalItem({instanceId:i.instanceId,itemId:i.itemId,...physical},i.instanceId,i.itemId)){fail(i.instanceId,'authored physical item state, Reality and Knowledge required');continue;}
    i.itemDefinition=clone(item);
    i.initialState={...i.initialState,physicalItem:{...clone(physical),instanceId:i.instanceId,itemId:i.itemId,custody:{storageId:i.stageId,containerId:i.stageId,state:'STANDBY',status:'STORED',cost:{unitCost:item.storage.handlingCost,extendedCost:item.storage.handlingCost*(physical.state.quantity??1)}}}};
  }
  const ref=(g,id,p)=>{if(!Object.hasOwn(indexes[g],id))fail(p,`unknown ${g} reference ${id}`);};
  const eventRef=(id,p)=>{if(!Object.hasOwn(catalog.archetypes?.event??{},id))fail(p,`unknown event ${id}`);};
  for(const [kind,ids] of Object.entries(m.archetypeDependencies??{}))for(const id of ids)if(!Object.hasOwn(catalog.archetypes?.[kind]??{},id))fail(`archetypeDependencies.${kind}`,`missing ${id}`);
  if(!m.mission?.missionId||!m.mission?.title)fail('mission','ID and title required');
  if(!Number.isInteger(m.map?.width)||!Number.isInteger(m.map?.height)||m.map.width<1||m.map.height<1)fail('map','positive integer dimensions required');
  const occupied=new Set();
  for(const s of m.stages) {
    if(!Array.isArray(s.cells)||!s.cells.length){fail(s.stageId,'nonempty cells required');continue;}
    const local=new Set(s.cells.map(c=>`${c.x},${c.y}`)),seen=new Set(),queue=[s.cells[0]];
    for(let i=0;i<queue.length;i++) {
      const c=queue[i],key=`${c.x},${c.y}`;if(seen.has(key))continue;seen.add(key);
      for(const [dx,dy]of Object.values(directions))if(local.has(`${c.x+dx},${c.y+dy}`)&&!seen.has(`${c.x+dx},${c.y+dy}`))queue.push({x:c.x+dx,y:c.y+dy});
    }
    if(seen.size!==local.size)fail(s.stageId,'footprint must be connected');
    for(const c of s.cells) {
      const key=`${c.x},${c.y}`;
      if(!Number.isInteger(c.x)||!Number.isInteger(c.y)||c.x<0||c.y<0||c.x>=m.map.width||c.y>=m.map.height||occupied.has(key))fail(`${s.stageId}.cells`,'invalid, outside map, or overlapping cell');
      occupied.add(key);
    }
    if(!['HIDDEN','PARTIAL','VISIBLE'].includes(s.initialVisibility))fail(s.stageId,'invalid initial visibility');
    if(!['UNKNOWN','UNSECURE','SECURE'].includes(s.initialSecurityState))fail(s.stageId,'invalid security');
    for(const [field,g]of Object.entries({instanceIds:'instances',observationIds:'observations',interactionTargetIds:'interactionTargets',incidentIds:'incidents'}))for(const id of s[field]??[]) {
      ref(g,id,`${s.stageId}.${field}`);if(indexes[g][id]?.stageId!==s.stageId)fail(`${s.stageId}.${field}`,`${id} belongs to another stage`);
    }
  }
  for(const t of m.transitions) {
    ref('stages',t.fromStageId,`${t.transitionId}.fromStageId`);ref('stages',t.toStageId,`${t.transitionId}.toStageId`);
    const d=directions[t.directionFrom];
    if(!d||opposite[t.directionFrom]!==t.directionTo)fail(t.transitionId,'invalid cardinal directions');
    else if(!indexes.stages[t.fromStageId]?.cells?.some(a=>indexes.stages[t.toStageId]?.cells?.some(b=>b.x===a.x+d[0]&&b.y===a.y+d[1])))fail(t.transitionId,'stages do not touch in declared direction');
    if(!['OPEN','CLOSED','LOCKED'].includes(t.initialState)||typeof t.routine!=='boolean')fail(t.transitionId,'invalid transition state');
  }
  const singles={stageId:'stages',fromStageId:'stages',toStageId:'stages',instanceId:'instances',subjectInstanceId:'instances',sourceInstanceId:'instances',assetInstanceId:'instances',boundPersonId:'instances',linkedSystemId:'instances',targetId:'interactionTargets',objectiveId:'objectives',incidentId:'incidents',createsDiscoveryId:'discoveries',transitionId:'transitions'};
  const plural={stageIds:'stages',fromStageIds:'stages',instanceIds:'instances',sourceInstanceIds:'instances',participantIds:'instances',observationIds:'observations',supportsObservationIds:'observations',interactionTargetIds:'interactionTargets',revealsInteractionIds:'interactionTargets',recipeInstanceIds:'recipes',incidentIds:'incidents'};
  for(const i of m.instances)if(i.mapPosition){const p=i.mapPosition;if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||!indexes.stages[i.stageId]?.cells.some(c=>Math.floor(p.x)===c.x&&Math.floor(p.y)===c.y))fail(i.instanceId,'mapPosition must lie inside its Stage');}
  const cargoIds=new Set(m.instances.map(i=>i.instanceId));
  for(const container of m.instances)for(const item of container.cargo??[]){
    if(typeof item.instanceId!=='string'||cargoIds.has(item.instanceId)||!item.itemId||!item.reality||!item.knowledge||item.custody?.containerId!==container.instanceId||!Number.isInteger(item.custody?.cost?.extendedCost)||item.custody.cost.extendedCost<1)fail(container.instanceId,'invalid or duplicate cargo instance');
    if(catalog.itemDefinitions){const def=catalog.itemDefinitions[item.itemId],quantity=item.state?.quantity??1;if(!def||!Number.isInteger(def.storage?.handlingCost)||def.storage.handlingCost<1||!Number.isInteger(quantity)||quantity<1)fail(container.instanceId,'shared cargo handling definition required');else item.custody.cost={unitCost:def.storage.handlingCost,extendedCost:def.storage.handlingCost*quantity};}
    cargoIds.add(item.instanceId);
  }
  function walk(value,path) {
    if(!value||typeof value!=='object')return;
    for(const [key,item]of Object.entries(value)) {
      if(['__proto__','constructor','prototype'].includes(key))fail(path,'unsafe key');
      if(singles[key]&&!(key==='instanceId'&&/\.cargo\.\d+$/.test(path)))ref(singles[key],item,`${path}.${key}`);
      if(plural[key]){if(!Array.isArray(item))fail(`${path}.${key}`,'expected array');else item.forEach(id=>ref(plural[key],id,`${path}.${key}`));}
      if(['eventArchetypeId','onEscapeEvent','onMaxDurationEvent'].includes(key))eventRef(item,`${path}.${key}`);
      walk(item,`${path}.${key}`);
    }
  }
  walk(m,'mission');
  for(const i of m.instances)if(Object.hasOwn(i,'npcState')&&!validNpcState(i.npcState))fail(`${i.instanceId}.npcState`,'expected disposition and suspicion/hostility in 0..100');
  function validateNpcConditions(value,path){
    if(!value||typeof value!=='object')return;
    if(value.type==='STAGE_STATE'&&(!indexes.stages[value.stageId]||!['socialPassage','securityState'].includes(value.field)||!Object.hasOwn(value,'equals')))fail(path,'invalid Stage condition');
    if(value.type==='ITEM_STATE'&&(!indexes.instances[value.instanceId]?.itemId||typeof value.field!=='string'||!Object.hasOwn(value,'equals')))fail(path,'invalid physical item condition');
    if(value.type==='TRANSITION_STATE'&&(!indexes.transitions[value.transitionId]||!['OPEN','CLOSED','LOCKED'].includes(value.equals)))fail(path,'invalid transition condition');
    if(value.type==='NPC_STATE'){
      if(!indexes.instances[value.instanceId]?.npcState)fail(path,'NPC state required');
      const keys=['type','instanceId','disposition','suspicionAtLeast','suspicionBelow','hostilityAtLeast','hostilityBelow'];
      for(const key of Object.keys(value))if(!keys.includes(key))fail(path,`unsupported NPC condition ${key}`);
      if(Object.hasOwn(value,'disposition')&&(typeof value.disposition!=='string'||!value.disposition.trim()))fail(path,'invalid disposition condition');
      for(const key of keys.slice(3))if(Object.hasOwn(value,key)&&(!Number.isFinite(value[key])||value[key]<0||value[key]>100))fail(path,'NPC threshold must be in 0..100');
    }
    for(const [key,item] of Object.entries(value))validateNpcConditions(item,`${path}.${key}`);
  }
  validateNpcConditions(m,'mission');
  for(const i of m.incidents)if(i.activationCondition&&i.kind!=='COMBAT')fail(i.incidentId,'automatic hostile activation requires a combat Incident');
  for(const i of m.incidents)if(i.implemented&&i.kind==='COMBAT'){
    if(!Array.isArray(i.participantIds)||!i.participantIds.length)fail(i.incidentId,'combat needs participants');
    for(const key of ['roundSeconds','hostileHealth','hostileDamage'])if(!(i[key]>0))fail(i.incidentId,`invalid ${key}`);
  }
  if(m.incidents.some(i=>i.implemented&&i.kind==='COMBAT')){
    const combat=m.simulatorArtifact?.combat;
    if(!(combat?.partyHealth>0)||!(combat?.partyWeapon?.damage>0)||!['RANGED','MELEE'].includes(combat?.partyWeapon?.mode))fail('combat','authored prototype weapon and health required');
  }
  function campaignEffects(list,path){for(const e of list??[]){
    if(npcEffectTypes.includes(e.type))validateNpcEffect(e,indexes.instances,fail,path);
    else if(!['SET_INSTANCE_STATE','EMIT_EVENT','SCHEDULE_EVENT','ACTIVATE_OBJECTIVE'].includes(e.type))fail(path,`unsupported campaign effect ${e.type}`);
    if(e.type==='SET_INSTANCE_STATE'&&(!e.field||['__proto__','constructor','prototype'].includes(e.field)))fail(path,'invalid state field');
    if(e.type==='SCHEDULE_EVENT'&&!(e.delayMinutes>0))fail(path,'scheduled delay must be positive');
  }}
  for(const b of m.eventBindings)campaignEffects(b.effects,b.bindingId);
  for(const o of m.objectives)campaignEffects(o.onComplete,o.objectiveId);
  for(const e of m.scheduledEvents){eventRef(e.event,'scheduledEvents');if(!Number.isFinite(e.atSeconds)||e.atSeconds<0)fail('scheduledEvents','invalid event time');}
  for(const r of m.recipes){
    if(Object.hasOwn(r,'availabilityContext')){
      const c=r.availabilityContext,path=`${r.recipeInstanceId}.availabilityContext`;
      if(!c||typeOf(c)!=='object')fail(path,'expected object');
      else {
        for(const key of Object.keys(c))if(!['normal','activeIncidentKinds','requiresSecureStage'].includes(key))fail(`${path}.${key}`,'unsupported context field');
        for(const key of ['normal','requiresSecureStage'])if(Object.hasOwn(c,key)&&typeof c[key]!=='boolean')fail(`${path}.${key}`,'expected boolean');
        if(Object.hasOwn(c,'activeIncidentKinds')&&(!Array.isArray(c.activeIncidentKinds)||c.activeIncidentKinds.some(k=>typeof k!=='string'||!k.trim())))fail(`${path}.activeIncidentKinds`,'expected nonempty Incident kind strings');
      }
    }
    if(!indexes.interactionTargets[r.targetId]?.recipeInstanceIds?.includes(r.recipeInstanceId))fail(r.recipeInstanceId,'target must list recipe');
    if(!(r.durationMinutes>0)||!(r.minimumTier>=0))fail(r.recipeInstanceId,'invalid duration or tier');
    for(const mod of r.durationModifiers??[])if(!mod.when||!(mod.durationMinutes>0)||typeof mod.label!=='string')fail(r.recipeInstanceId,'invalid duration modifier');
    if(r.implemented){
      if(!['UNTRAINED','SOLDIER','SCOUT','TECHNICIAN','SCIENTIST','MEDIC','DIPLOMAT'].includes(r.profession)||!Number.isInteger(r.chargeCost)||r.chargeCost<0)fail(r.recipeInstanceId,'invalid Profession or charge cost');
      if(r.onCompleteEffects!==undefined&&!Array.isArray(r.onCompleteEffects))fail(r.recipeInstanceId,'onCompleteEffects must be an array');
      for(const e of [...r.effects??[],...Array.isArray(r.onCompleteEffects)?r.onCompleteEffects:[]]){
        if(npcEffectTypes.includes(e.type))validateNpcEffect(e,indexes.instances,fail,r.recipeInstanceId);
        else if(['SET_ITEM_STATE','ADD_INSTANCE_FINDING'].includes(e.type)){
          const item=indexes.instances[e.instanceId];
          if(!item?.itemId||e.type==='SET_ITEM_STATE'&&(!e.field||['__proto__','constructor','prototype'].includes(e.field)||!Object.hasOwn(e,'value'))||e.type==='ADD_INSTANCE_FINDING'&&(typeof e.findingId!=='string'||!e.findingId))fail(r.recipeInstanceId,'invalid physical item effect');
        }
        else if(Object.hasOwn(fieldStateEffects,e.type)){
          if(!indexes.instances[e.instanceId]||!fieldStateEffects[e.type].values.includes(e.value))fail(r.recipeInstanceId,`invalid ${e.type} instance or value`);
        }
        else if(e.type==='ADD_TO_PARTY_STORAGE'){
          if(!['PARTY_STORAGE','PARTY_STORAGE_WHEN_COLLECTED'].includes(indexes.instances[e.instanceId]?.recovery?.category))fail(r.recipeInstanceId,'party storage requires an authored portable recovery category');
        }
        else if(!['SET_TARGET_STATE','SET_INSTANCE_STATE','OPEN_TARGET_TRANSITION','CARRY_TARGET','ADD_KNOWLEDGE','SEND_TARGET_TO_GATE'].includes(e.type))fail(r.recipeInstanceId,`unsupported field effect ${e.type}`);
        if(['SET_TARGET_STATE','SET_INSTANCE_STATE'].includes(e.type)&&(!e.field||['__proto__','constructor','prototype'].includes(e.field)))fail(r.recipeInstanceId,'invalid state field');
        if(e.type==='OPEN_TARGET_TRANSITION'&&!indexes.interactionTargets[r.targetId]?.transitionId)fail(r.recipeInstanceId,'transition effect needs a transition target');
      }
    }
  }
  for(const t of m.interactionTargets){
    if(t.transitionId){const edge=indexes.transitions[t.transitionId];if(edge&&edge.fromStageId!==t.stageId&&edge.toStageId!==t.stageId)fail(t.targetId,'target is not beside transition');}
    else if(indexes.instances[t.instanceId]?.stageId!==t.stageId)fail(t.targetId,'target and instance stages differ');
  }
  const workGroupIds=new Set();
  if(m.workGroups!==undefined&&!Array.isArray(m.workGroups))fail('workGroups','expected array');
  else for(const g of m.workGroups??[]){
    if(!g||typeOf(g)!=='object'){fail('workGroups','expected group object');continue;}
    if(typeof g.workGroupId!=='string'||!g.workGroupId||workGroupIds.has(g.workGroupId)||!indexes.stages[g.stageId]||!Array.isArray(g.recipeInstanceIds)||!g.recipeInstanceIds.length||new Set(g.recipeInstanceIds).size!==g.recipeInstanceIds.length)fail('workGroups','invalid group definition');
    workGroupIds.add(g.workGroupId);
    for(const id of Array.isArray(g.recipeInstanceIds)?g.recipeInstanceIds:[]){const r=indexes.recipes[id];if(!r||r.workGroupId!==g.workGroupId||indexes.interactionTargets[r.targetId]?.stageId!==g.stageId)fail(g.workGroupId,'group Recipes must be local and bound to the group');}
    if(!Array.isArray(g.effects))fail(g.workGroupId,'group outcomes must be an array');
    else for(const e of g.effects)if(!e||(e.type==='ADD_KNOWLEDGE'?typeof e.factId!=='string'||!e.factId:e.type==='SET_DETECTION_STATE'?!indexes.instances[e.instanceId]||!fieldStateEffects.SET_DETECTION_STATE.values.includes(e.value):true))fail(g.workGroupId,'unsupported group outcome');
  }
  for(const r of m.recipes)if(r.workGroupId&&!workGroupIds.has(r.workGroupId))fail(r.recipeInstanceId,'unknown work group');
  if(indexes.instances[m.gate?.instanceId]?.stageId!==m.gate?.stageId)fail('gate','instance must be on Gate stage');
  if(m.stages.filter(s=>s.initialVisibility==='VISIBLE').length!==1||indexes.stages[m.gate?.stageId]?.initialVisibility!=='VISIBLE')fail('stages','Wave 1 starts with exactly the Gate stage visible');
  if(m.gate?.maxContinuousConnectionMinutes!==37)fail('gate','expected 37 minute connection limit');
  if(!Array.isArray(m.startingKnowledge)||!Array.isArray(m.scheduledEvents))fail('mission','startingKnowledge and scheduledEvents arrays required');
  if(m.dialogueScenes!==undefined&&!Array.isArray(m.dialogueScenes))fail('dialogueScenes','expected array');
  else validateDialogue(m.dialogueScenes??[],indexes,fail,catalog);
  if(errors.length)throw new Error(`MISSION VALIDATION ERROR\n${errors.join('\n')}`);
  return freeze({...m,partyTools:resolvePartyTools(m,catalog),indexes,toolCatalog:clone(catalog)});
}
