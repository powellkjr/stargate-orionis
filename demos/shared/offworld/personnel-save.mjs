import {createTool,validateEquipment} from './equipment.mjs?v=dialogue-doors-1';
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
