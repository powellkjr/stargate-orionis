// Staffing demo progression adapted from zero-based UI tiers to actual I–III tiers.
export const professions=['SOLDIER','SCOUT','TECHNICIAN','SCIENTIST','MEDIC','DIPLOMAT'];
export const branches={SOLDIER:['Marksman','Guardian','Tactician'],SCOUT:['Pathfinder','Tracker','Observer'],TECHNICIAN:['Demolitions','Integrations','Overdrive'],SCIENTIST:['Applied','Operational','Strategic'],MEDIC:['Trauma','Field Medicine','Epidemiology'],DIPLOMAT:['Negotiator','Ambassador','Arbiter']};
const codes={SOLDIER:'SO',SCOUT:'ST',TECHNICIAN:'TE',SCIENTIST:'SC',MEDIC:'ME',DIPLOMAT:'DI',Marksman:'MK',Guardian:'GU',Tactician:'TA',Pathfinder:'PA',Tracker:'TR',Observer:'OB',Demolitions:'DE',Integrations:'IG',Overdrive:'OV',Applied:'AP',Operational:'OP',Strategic:'SG',Trauma:'TU','Field Medicine':'FM',Epidemiology:'EP',Negotiator:'NE',Ambassador:'AM',Arbiter:'AR'};
export function professionTier(unit,profession){
  if(profession==='UNTRAINED')return 0;
  if(unit.profession===profession)return unit.tier;
  return unit.branch?.kind==='cross'&&unit.branch.id===profession?unit.branch.tier:0;
}
export function toolTracks(unit){
  const tracks=[{id:unit.profession,tier:unit.tier}];
  if(unit.tier===3&&unit.branch&&unit.branch.tier>0)tracks.push({id:unit.branch.id,tier:unit.branch.tier});
  return tracks;
}
export function secondToolSlotUnlocked(unit){return unit.tier===3&&!!unit.branch&&['cross','specialization'].includes(unit.branch.kind)&&Number.isInteger(unit.branch.tier)&&unit.branch.tier>=0&&unit.branch.tier<=3&&(unit.branch.kind==='cross'?professions.includes(unit.branch.id)&&unit.branch.id!==unit.profession:branches[unit.profession]?.includes(unit.branch.id));}
export function toolOptions(unit,catalog={}){return toolTracks(unit).flatMap(track=>[
  ...Array.from({length:track.tier},(_,i)=>({id:`${codes[track.id]}T${i+1}`,track:track.id,tier:i+1,label:`${track.id} Tools ${i+1}`})),
  ...Object.entries(catalog.tools??{}).filter(([,t])=>t.variant&&t.track===track.id&&t.tier<=track.tier).map(([id,t])=>({id,track:t.track,tier:t.tier,label:t.label})),
]);}
export function createTool(unit,slot,kitId,charges,catalog){
  if(!kitId)return null;
  const option=toolOptions(unit,catalog).find(o=>o.id===kitId),definition=catalog.tools?.[kitId];
  if(!option||!definition||slot<0||slot>1||(slot===1&&!secondToolSlotUnlocked(unit)))throw new Error('Tool is not eligible for this progression/slot.');
  return {toolInstanceId:`${unit.unitId}-tool-${slot+1}`,slot,kitId,label:definition.label,tier:option.tier,providedServices:[...definition.providedServices],chargesRemaining:charges,damaged:false};
}
export function validateEquipment(unit,catalog){
  const b=unit.branch;
  if(b){
    if(unit.tier!==3||!Number.isInteger(b.tier)||b.tier<0||b.tier>3)throw new Error(`${unit.name}: branches require base Tier III and a valid branch tier.`);
    if(b.kind==='cross'?(!professions.includes(b.id)||b.id===unit.profession):b.kind!=='specialization'||!branches[unit.profession]?.includes(b.id))throw new Error('Invalid branch.');
  }
  if((unit.tools??[]).length>2)throw new Error('Only two Tool slots are available.');
  const occupied=new Set();
  for(const t of unit.tools??[]){
    if(occupied.has(t.slot))throw new Error('Duplicate Tool slot.');occupied.add(t.slot);
    const expected=createTool(unit,t.slot,t.kitId,t.chargesRemaining,catalog);
    if(!expected||JSON.stringify(t.providedServices)!==JSON.stringify(expected.providedServices)||t.tier!==expected.tier)throw new Error('Tool Services must match the authored kit.');
  }
}
