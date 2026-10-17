const family=key=>({'door-open':'door','gate-open':'gate'})[key]??key;
const sourceFamily=id=>id.replace(/(door|gate)-open(?=__|\.png$)/,'$1');
const hash=text=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
export function createVariantPicker(active,seed=Math.random().toString()){
 const pools={};
 for(const [key,entry] of Object.entries(active))pools[key]=(entry.variants??[entry]).filter(v=>!v.disabled);
 return (key,identity='default')=>{
  const group=family(key),paired=group==='door'||group==='gate';
  let pool=pools[group]??[];
  if(paired)pool=pool.filter(v=>(pools[`${group}-open`]??[]).some(other=>sourceFamily(other.sourceId)===sourceFamily(v.sourceId)));
  if(!pool.length)return null;
  const selected=pool[hash(`${seed}:${group}:${identity}`)%pool.length];
  return key===group?selected:(pools[key]??[]).find(v=>sourceFamily(v.sourceId)===sourceFamily(selected.sourceId))??null;
 };
}
