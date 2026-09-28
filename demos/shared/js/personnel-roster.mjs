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
export function buildPersonnelRoster(classCatalog,namePools,classMatrix){
  let serial=1;
  const roster=[];
  for(const base of classCatalog){
    let index=0;
    const add=(kind,branch=null)=>{
      const pool=namePools[base.id];
      const first=pool.first[index%pool.first.length],last=pool.last[Math.floor(index/pool.first.length)%pool.last.length];index++;
      roster.push({id:`unit-${serial++}`,name:`${first} ${last}${kind==='specialization'?' Sr.':kind==='cross'?' V.':''}`,classId:base.id,
        baseTier:kind==='base'?0:2,specializationId:kind==='specialization'?branch:null,specializationTier:kind==='specialization'?0:-1,
        crossPathId:kind==='cross'?branch:null,crossPathTier:kind==='cross'?0:-1,sortGroup:kind,...personnelPresentation(`unit-${serial-1}`)});
    };
    add('base');for(const id of classMatrix[base.id]??[])add('specialization',id);
    for(const other of classCatalog)if(other.id!==base.id)add('cross',other.id);
  }
  return roster;
}
