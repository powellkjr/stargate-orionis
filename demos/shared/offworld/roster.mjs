import {migrateLoadout} from './personnel-save.mjs?v=dialogue-doors-1';
import {buildPersonnelRoster} from '../js/personnel-roster.mjs?v=dialogue-doors-1';
import {branches} from './equipment.mjs?v=dialogue-doors-1';
import {normalizeAppearance} from '../portraits/portrait-bust.mjs?v=dialogue-doors-1';
export function deploymentRoster(classes,names,presets,loadouts={units:{}}){
  const matrix=Object.fromEntries(Object.entries(branches).map(([id,list])=>[id.toLowerCase(),list]));
  const units=buildPersonnelRoster(classes,names.pools,matrix).map((row,i)=>{
    const base=presets.units.find(u=>u.profession===row.classId.toUpperCase()),cl=classes.find(c=>c.id===row.classId);
    const branch=row.sortGroup==='specialization'?{kind:'specialization',id:row.specializationId,tier:row.specializationTier+1}:row.sortGroup==='cross'?{kind:'cross',id:row.crossPathId.toUpperCase(),tier:row.crossPathTier+1}:null;
    const appearance=normalizeAppearance(row.portrait.appearance);
    return {unitId:row.id,name:row.name,profession:row.classId.toUpperCase(),tier:row.baseTier+1,branch,
      perception:base?.perception??5,stamina:base?.stamina??80,endurance:base?.endurance??6,color:cl.color,appearance,portrait:row.portrait,favorite:row.favorite,tools:[],rosterGroup:row.sortGroup,...migrateLoadout(loadouts.units[row.id])};
  });
  return {units,defaultUnitIds:[]};
}
