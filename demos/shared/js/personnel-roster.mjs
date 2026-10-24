import presentation from '../data/personnel-presentation.json?v=personnel-20260925-2' with {type:'json'};
export const PERSONNEL_STORAGE_KEY='sgc-personnel-presentation-v1';
export function personnelPresentation(id,storage=globalThis.localStorage){
  const base=structuredClone(presentation.units[id]??{favorite:false});
  try {const saved=JSON.parse(storage?.getItem(PERSONNEL_STORAGE_KEY)??'{}')[id];if(typeof saved?.favorite==='boolean')base.favorite=saved.favorite;if(saved?.portrait?.appearance)base.portrait={renderer:'bust',...base.portrait,...saved.portrait,appearance:{...base.portrait?.appearance,...saved.portrait.appearance}};}catch{}
  return base;
}
export function setPersonnelFavorite(id,favorite,storage=globalThis.localStorage){
  const saved=JSON.parse(storage?.getItem(PERSONNEL_STORAGE_KEY)??'{}');
  saved[id]={...saved[id],favorite:!!favorite};storage?.setItem(PERSONNEL_STORAGE_KEY,JSON.stringify(saved));
}
export function setPersonnelPortrait(id,appearance,storage=globalThis.localStorage){
  const saved=JSON.parse(storage?.getItem(PERSONNEL_STORAGE_KEY)??'{}');
  saved[id]={...saved[id],portrait:{renderer:'bust',appearance:structuredClone(appearance)}};
  storage?.setItem(PERSONNEL_STORAGE_KEY,JSON.stringify(saved));
}
// Shared staffing/deployment roster. Tiers here retain staffing's zero-based encoding.
function shuffledNames(values,key){
  let state=2166136261;
  for(const character of `personnel-names-v2:${key}`)state=Math.imul(state^character.charCodeAt(0),16777619)>>>0;
  const result=[...values];
  for(let i=result.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function buildPersonnelRoster(classCatalog,namePools,classMatrix){
  let serial=1;
  const roster=[];
  for(const base of classCatalog){
    let index=0;
    const firstNames=shuffledNames(namePools[base.id].first,`${base.id}:first`);
    const lastNames=shuffledNames(namePools[base.id].last,`${base.id}:last`);
    const add=(kind,branch=null)=>{
      const first=firstNames[index%firstNames.length],last=lastNames[index%lastNames.length];index++;
      roster.push({id:`unit-${serial++}`,name:`${first} ${last}`,classId:base.id,
        baseTier:kind==='base'?0:2,specializationId:kind==='specialization'?branch:null,specializationTier:kind==='specialization'?0:-1,
        crossPathId:kind==='cross'?branch:null,crossPathTier:kind==='cross'?0:-1,sortGroup:kind,...personnelPresentation(`unit-${serial-1}`)});
    };
    add('base');for(const id of classMatrix[base.id]??[])add('specialization',id);
    for(const other of classCatalog)if(other.id!==base.id)add('cross',other.id);
  }
  return roster;
}
