// Mission-issued physical equipment travels with the advancing party. It is not
// a Profession kit and occupies neither personal Tool slot.
export function resolvePartyTools(mission,catalog){
  const entries=mission.deployment?.partyTools??[],ids=new Set();
  if(!Array.isArray(entries))throw new Error('Mission partyTools must be an array.');
  return entries.map(entry=>{
    const def=catalog.partyTools?.[entry.toolId];
    if(!def||typeof entry.toolInstanceId!=='string'||!entry.toolInstanceId||ids.has(entry.toolInstanceId))throw new Error('Unknown or duplicate mission party Tool.');
    ids.add(entry.toolInstanceId);
    if(!Array.isArray(def.providedServices)||def.providedServices.some(s=>typeof s!=='string')||typeof def.label!=='string')throw new Error('Invalid party Tool definition.');
    if(entry.damaged!==undefined&&typeof entry.damaged!=='boolean')throw new Error('Invalid party Tool condition.');
    const charges=entry.chargesRemaining??def.chargesRemaining??null;
    if(charges!==null&&(!Number.isInteger(charges)||charges<0))throw new Error('Invalid party Tool charges.');
    return {toolInstanceId:entry.toolInstanceId,toolId:entry.toolId,label:def.label,providedServices:[...def.providedServices],chargesRemaining:charges,damaged:entry.damaged??false,tier:def.tier??0};
  });
}
export function initializePartyTools(m,s){
  s.partyTools=structuredClone(m.partyTools??[]).map(t=>({...t,custody:'PARTY',currentStageId:s.currentStageId}));
  const personalIds=new Set(s.units.flatMap(u=>u.tools.map(t=>t.toolInstanceId)));
  if(s.partyTools.some(t=>personalIds.has(t.toolInstanceId)))throw new Error('Party and personal Tools must have distinct instance IDs.');
}
export function availableTools(s,actor){
  return [...actor.tools.map(t=>({...t,source:'PERSONAL'})),...(s.partyTools??[]).filter(t=>t.custody==='PARTY'&&t.currentStageId===actor.currentStageId).map(t=>({...t,source:'PARTY'}))].filter(t=>!t.damaged);
}
export function toolReserved(s,id,exceptWorkId=null){return (s.activeWork??[]).some(w=>w.workId!==exceptWorkId&&w.toolInstanceId===id&&['MOVING_TO_TARGET','EXECUTING'].includes(w.status));}
export function resolvedWorkTool(s,actor,w){
  const tool=w.toolSource==='PARTY'?(s.partyTools??[]).find(t=>t.toolInstanceId===w.toolInstanceId&&t.custody==='PARTY'&&t.currentStageId===w.stageId):actor.tools.find(t=>t.toolInstanceId===w.toolInstanceId);
  return tool;
}
export function movePartyTools(s,stageId){for(const t of s.partyTools??[])if(t.custody==='PARTY')t.currentStageId=stageId;}
export function extractPartyTools(s){for(const t of s.partyTools??[])if(t.custody==='PARTY'){t.custody='SGC';t.currentStageId=null;}}
