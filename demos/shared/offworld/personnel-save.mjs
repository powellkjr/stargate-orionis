import {createTool,validateEquipment,toolOptions} from './equipment.mjs?v=dialogue-doors-1';
export function configuredTools(unit){return unit.availableTools??[...new Map((unit.toolSlots??[]).filter(t=>t.kitId).map(t=>[t.kitId,{type:t.kitId,charges:t.charges}])).values()];}
export function migrateLoadout(value){if(!value?.toolSlots)return value;return {...value,toolSlots:value.toolSlots.map(t=>({...t,kitId:typeof t.kitId==='string'?t.kitId.replace(/^STT([123])_SIGNAL$/,'STT$1'):t.kitId}))};}
export const LOADOUT_KEY='sgc-personnel-loadouts-v1';
export function validateLoadout(id,profession,value,catalog){
  value=migrateLoadout(value);
  const out={};
  for(const [key,min,max] of [['tier',1,3],['perception',0,10],['stamina',0,100],['endurance',1,10]]){
    if(!Number.isInteger(value[key])||value[key]<min||value[key]>max)throw new Error(`${key} must be ${min}–${max}.`);
    out[key]=value[key];
  }
  out.branch=value.branch?{kind:value.branch.kind,id:value.branch.id,tier:value.branch.tier}:null;
  if(!Array.isArray(value.toolSlots)||value.toolSlots.length!==2)throw new Error('Two Tool slots required.');
  out.toolSlots=value.toolSlots.map(t=>{if(typeof t.kitId!=='string'||!Number.isInteger(t.charges)||t.charges<0||t.charges>99)throw new Error('Invalid Tool slot.');return {kitId:t.kitId,charges:t.charges};});
  const unit={unitId:id,profession,...out};unit.tools=out.toolSlots.map((t,i)=>createTool(unit,i,t.kitId,t.charges,catalog)).filter(Boolean);validateEquipment(unit,catalog);
  if(value.availableTools!==undefined){
    if(!Array.isArray(value.availableTools)||value.availableTools.length>50)throw Error('Invalid configured Tool list.');
    const eligible=new Set(toolOptions(unit,catalog).map(t=>t.id)),seen=new Set();
    out.availableTools=value.availableTools.map(t=>{
      if(!eligible.has(t.type)||!catalog.tools[t.type]||seen.has(t.type)||!Number.isInteger(t.charges)||t.charges<0||t.charges>99)throw Error('Configured Tools require unique eligible types and charges 0–99.');
      seen.add(t.type);return {type:t.type,charges:t.charges};
    });
    for(const slot of out.toolSlots)if(slot.kitId&&!out.availableTools.some(t=>t.type===slot.kitId&&t.charges===slot.charges))throw Error('Equipped Tool must match the configured list.');
  }
  return out;
}
export function cachedLoadouts(storage=globalThis.localStorage){try{return Object.fromEntries(Object.entries(JSON.parse(storage?.getItem(LOADOUT_KEY)??'{}')).map(([id,v])=>[id,migrateLoadout(v)]));}catch{return {};}}
export function personnelSaver(status,fetcher=fetch,storage=globalThis.localStorage){
  let queue=Promise.resolve();
  return (unit,value)=>{
    const saved=cachedLoadouts(storage);saved[unit.unitId]=value;storage?.setItem(LOADOUT_KEY,JSON.stringify(saved));
    status.textContent='Saving personnel…';
    queue=queue.then(async()=>{
      try{
        const response=await fetcher(`/api/personnel/${encodeURIComponent(unit.unitId)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
        if(!response.ok)throw new Error('Save endpoint unavailable');
        const latest=cachedLoadouts(storage);if(JSON.stringify(latest[unit.unitId])===JSON.stringify(value))delete latest[unit.unitId];storage?.setItem(LOADOUT_KEY,JSON.stringify(latest));
        status.textContent='Saved to shared personnel JSON.';
      }catch{status.textContent='Saved in this browser. Start the writable demo server to save to shared JSON: node demos/serve.mjs';}
    });
    return queue;
  };
}
