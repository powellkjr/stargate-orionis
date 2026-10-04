// Authored social state is independent of combat participation and hidden identity.
export const npcEffectTypes=['CHANGE_NPC_SUSPICION','CHANGE_NPC_HOSTILITY','SET_NPC_DISPOSITION','START_CONFRONTATION'];
export const validNpcState=n=>!!n&&typeof n==='object'&&!Array.isArray(n)&&typeof n.disposition==='string'&&!!n.disposition.trim()&&['suspicion','hostility'].every(k=>Number.isFinite(n[k])&&n[k]>=0&&n[k]<=100);
export function initializeNpc(d,state){
  if(!d.npcState)return;
  state.npcState=structuredClone(d.npcState);
  // An armed participant is not an active opponent solely because its archetype is.
  if(state.combatState==='ACTIVE'&&state.npcState.disposition!=='HOSTILE'&&state.npcState.hostility<100)state.combatState='NEUTRAL';
}
export function npcHostile(state){
  if(['DOWN','SURRENDERED','CAPTURED','FLED'].includes(state?.combatState))return false;
  return state?.combatState==='ACTIVE'||state?.npcState?.disposition==='HOSTILE'||state?.npcState?.hostility===100;
}
export const npcConfronting=state=>!['DOWN','SURRENDERED','CAPTURED','FLED'].includes(state?.combatState)&&state?.npcState?.disposition==='CONFRONTING';
export function npcCondition(s,c){
  const n=s.instanceStates[c.instanceId]?.npcState;if(!n)return false;
  return (!Object.hasOwn(c,'disposition')||n.disposition===c.disposition)&&
    ['suspicion','hostility'].every(k=>(!Object.hasOwn(c,`${k}AtLeast`)||n[k]>=c[`${k}AtLeast`])&&(!Object.hasOwn(c,`${k}Below`)||n[k]<c[`${k}Below`]));
}
export function validateNpcEffect(e,instances,fail,path){
  if(e.type==='START_CONFRONTATION'){
    if(!Array.isArray(e.instanceIds)||!e.instanceIds.length)fail(path,'confrontation needs NPC instanceIds');
    else for(const id of e.instanceIds)if(!instances[id]?.npcState)fail(path,`NPC state required on ${id}`);
  }else {
    if(!instances[e.instanceId]?.npcState)fail(path,`NPC state required on ${e.instanceId}`);
    if(e.type==='SET_NPC_DISPOSITION'){
      if(typeof e.value!=='string'||!e.value.trim())fail(path,'disposition must be a nonempty string');
    }else if(!Number.isFinite(e.delta))fail(path,'NPC delta must be finite');
  }
}
export function applyNpcEffect(s,e){
  const ids=e.type==='START_CONFRONTATION'?e.instanceIds:[e.instanceId];
  if(!Array.isArray(ids)||!ids.length)throw new Error('Confrontation needs NPC participants.');
  const changes=ids.map(id=>{
    const old=s.instanceStates[id]?.npcState;if(!validNpcState(old))throw new Error(`NPC state unavailable: ${id}`);
    const value=structuredClone(old);
    if(e.type==='START_CONFRONTATION')value.disposition='CONFRONTING';
    else if(e.type==='SET_NPC_DISPOSITION')value.disposition=e.value;
    else if(['CHANGE_NPC_SUSPICION','CHANGE_NPC_HOSTILITY'].includes(e.type)){
      if(!Number.isFinite(e.delta))throw new Error('NPC delta must be finite.');
      const key=e.type==='CHANGE_NPC_SUSPICION'?'suspicion':'hostility';value[key]=Math.max(0,Math.min(100,value[key]+e.delta));
    }else throw new Error(`Unsupported NPC effect: ${e.type}`);
    if(!validNpcState(value))throw new Error('Invalid NPC state.');return {id,value};
  });
  for(const {id,value} of changes){s.instanceStates[id].npcState=value;s.resultEvents.push({type:'NPC_STATE_CHANGED',instanceId:id,npcState:structuredClone(value),atSeconds:s.missionElapsedSeconds});}
}