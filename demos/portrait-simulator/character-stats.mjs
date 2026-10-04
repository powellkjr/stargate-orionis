import {validateLoadout} from '../shared/offworld/personnel-save.mjs';
export const statFields=[['perception','Perception (PER)',0,10],['stamina','Stamina (STA)',0,100],['endurance','Endurance (END)',1,10]];
export function characterStatsLoadout(unit,stats,catalog){
  return validateLoadout(unit.unitId,unit.profession,{
    tier:unit.tier,branch:unit.branch,
    ...(unit.availableTools!==undefined?{availableTools:unit.availableTools}:{}),
    toolSlots:unit.toolSlots?.map(slot=>({...slot}))??[{kitId:'',charges:0},{kitId:'',charges:0}],
    ...Object.fromEntries(statFields.map(([key])=>[key,stats[key]]))
  },catalog);
}