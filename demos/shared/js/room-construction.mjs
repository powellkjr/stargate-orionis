// Read-only pricing projection. Execution/admission remain a separate Recipe contract.
const atTier=(values,tier)=>values?.[Math.min(tier-1,values.length-1)];
const count=value=>Number.isInteger(value)&&value>=0;
export function validateConstructionPolicy(policy){
 if(policy?.format!=='orionis-room-construction-1'||policy.contentStatus!=='PROVISIONAL_PLAYTEST'||
  policy.upgradeBasis!=='ADDITIONAL_CAPACITY'||policy.inventoryBasis!=='PHYSICAL_ITEM_AND_OCCUPANT_PLACES'||!['UNAUTHORED','PROVISIONAL_EXECUTABLE'].includes(policy.executionStatus)||!policy.additionalInventorySources||
  !['hoursPerCoreSlot','hoursPerStaffSlot','hoursPerInventoryPlace','hoursPerResourceUnit','hoursPerOccupantPlace','supplyPerWorkHour','minimumNewRoomHours'].every(k=>Number.isFinite(policy[k])&&policy[k]>0)||
  ![1,2,3].every(t=>policy.supplyClassByConstructionTier?.[t]===`S${t}`))throw Error('Invalid room construction policy.');
 const clearing=policy.terrain?.clearingRecipe;
 if(clearing&&(!clearing.id||clearing.bubbles?.length!==8||new Set(clearing.bubbles.map(b=>b.id)).size!==8||clearing.bubbles.some(b=>!b.id||![1,20].includes(b.durationTicks)||b.actor!=='UNTRAINED'||b.toolService!==null||b.roomService!==null)))throw Error('Clearing requires eight untrained-Actor bubbles.');
 return policy;
}
export function roomConstructionCapacity(room,tier,policy){
 const rules=room.rules,fn=room.function;
 if(!rules.construction.progression.includes(tier))throw Error('Unsupported construction tier.');
 const coreConfig=fn.slotConfig?.core,cores=rules.cores;
 let coreSlots=0;
 if(cores.supportsCores){
  if(cores.fixedLayout)coreSlots=Object.values(cores.fixedLayout).concat(Object.values(atTier(cores.progressionLayout,tier)??{})).reduce((a,b)=>a+b,0);
  else coreSlots=coreConfig?.fixed??atTier(coreConfig?.byConstructionTier??cores.slotProgression,tier)??null;
 }
 const staff=fn.slotConfig?.staff;
 const staffSlots=!rules.staffing.supportsStaffing?0:staff?.byLayout?.['1x1']??rules.joining.staffingByLayout?.['1x1']??
  rules.staffing.joinedCapacity?.['1x1']??atTier(staff?.byConstructionTier??rules.staffing.progression,tier);
 const resolveSlot=slot=>{
  const source=rules[slot.progressionSource];
  const value=slot.fixed??slot.perPhysicalRoom??atTier(slot.byConstructionTier??source?.progression,tier);
  if(!count(value))throw Error('Missing numeric physical inventory capacity: '+room.identity.id);
  if(slot.perResident){
   const residents=atTier(rules[slot.residentCapacitySource]?.progression,tier);
   if(!count(residents))throw Error('Missing resident capacity.');
   return value*residents;
  }
  return value;
 };
 let inventoryPlaces=0,occupantPlaces=0;
 const sharedItemGroups=new Map();
 // Process/queue item places are temporary custody, not inventory infrastructure.
 for(const tab of fn.subordinateTabs??[]){
  const item=tab.slotConfig?.item;
  if(item&&(tab.storage||tab.arrival||['inventory','storage'].includes(item.progressionSource))){
   const places=resolveSlot(item);
   if(fn.sharedItemCapacity&&tab.storage){const group=item.progressionSource??tab.id;if(sharedItemGroups.has(group)&&sharedItemGroups.get(group)!==places)throw Error('Conflicting item capacity group.');sharedItemGroups.set(group,places);}
   else inventoryPlaces+=places;
  }
  if(tab.slotConfig?.unit)occupantPlaces+=resolveSlot(tab.slotConfig.unit);
 }
 inventoryPlaces+=[...sharedItemGroups.values()].reduce((a,b)=>a+b,0);
 // Explicit data bindings cover physical storage without a subordinate inventory tab.
 for(const source of policy.additionalInventorySources[room.identity.id]??[])inventoryPlaces+=resolveSlot({progressionSource:source});
 if(!count(staffSlots)||!count(inventoryPlaces)||coreSlots!==null&&!count(coreSlots))throw Error('Invalid construction capacity.');
  const bulkGroups=new Map();
 for(const tab of fn.subordinateTabs??[]){
  if(!tab.quantity?.capacity)continue;
  const group=tab.quantity.capacityGroup??tab.id,capacity=resolveSlot(tab.quantity.capacity);
  if(bulkGroups.has(group)&&bulkGroups.get(group)!==capacity)throw Error('Conflicting bulk capacity group.');
  bulkGroups.set(group,capacity);
 }
 return {coreSlots,staffSlots,inventoryPlaces,occupantPlaces,resourceUnits:[...bulkGroups.values()].reduce((a,b)=>a+b,0)};
}
export function roomConstructionQuote(room,tier,policy,fromTier=null){
 validateConstructionPolicy(policy);
 const tiers=room.rules.construction.progression;
 if(fromTier!==null&&(tiers.indexOf(tier)!==tiers.indexOf(fromTier)+1||!tiers.includes(fromTier)))throw Error('Upgrades must advance one authored construction tier.');
 const target=roomConstructionCapacity(room,tier,policy),previous=fromTier===null?{coreSlots:0,staffSlots:0,inventoryPlaces:0,resourceUnits:0,occupantPlaces:0}:roomConstructionCapacity(room,fromTier,policy);
 const blockedReason=target.coreSlots===null||previous.coreSlots===null?'Core slot count is not authored.':null;
 if(blockedReason)return {fromTier,toTier:tier,blockedReason,hours:null,supply:null,supplyClass:policy.supplyClassByConstructionTier[tier],components:[]};
 const components=[['coreSlots',policy.hoursPerCoreSlot],['staffSlots',policy.hoursPerStaffSlot],['inventoryPlaces',policy.hoursPerInventoryPlace],['resourceUnits',policy.hoursPerResourceUnit],['occupantPlaces',policy.hoursPerOccupantPlace]].map(([kind,hoursPerPlace])=>{
  const places=target[kind]-previous[kind];
  if(places<0)throw Error('Construction upgrade reduces capacity.');
  return {kind,places,hoursPerPlace,hours:Math.round(places*hoursPerPlace*1e9)/1e9};
 });
 const rawHours=components.reduce((n,c)=>n+c.hours,0);
 if(fromTier===null&&rawHours<policy.minimumNewRoomHours){const hours=Math.round((policy.minimumNewRoomHours-rawHours)*1e9)/1e9;components.push({kind:'shellWork',places:1,hoursPerPlace:hours,hours});}
 const hours=Math.round(components.reduce((n,c)=>n+c.hours,0)*1e9)/1e9,supply=Math.round(hours*policy.supplyPerWorkHour*1e9)/1e9;
 if(!Number.isFinite(hours)||!Number.isFinite(supply)||hours>Number.MAX_SAFE_INTEGER||supply>Number.MAX_SAFE_INTEGER)throw Error('Construction estimate overflow.');
 return {fromTier,toTier:tier,blockedReason:null,hours,supply,supplyClass:policy.supplyClassByConstructionTier[tier],components};
}
