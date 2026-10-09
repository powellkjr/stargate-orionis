// Shared persistent physical-room configuration. Capacities come only from room data.
export function baseCapacity(base,schemas){
 const result={HOLDING:{total:0,used:0},RECEIVING:{total:0,used:0}};
 for(const room of base.rooms){
  const def=schemas.find(d=>d.identity.id===room.roomId);if(!def)throw Error(`Unknown room ${room.roomId}`);
  const tier=def.rules.construction.progression.indexOf(room.constructionTier);if(tier<0)throw Error('Invalid construction tier.');
  for(const tab of def.function?.subordinateTabs??[]){
   const kind=tab.custodyId==='RECEIVING_INTAKE'?'RECEIVING':tab.id==='captives'?'HOLDING':null;if(!kind)continue;
   const slot=tab.slotConfig?.[kind==='HOLDING'?'unit':'item'];if(!slot)throw Error('Missing capacity definition.');
   const source=def.rules[slot.progressionSource];const capacity=slot.perPhysicalRoom??source?.progression?.[source.supportsProgression?tier:0];
   if(!Number.isInteger(capacity)||capacity<0)throw Error('Invalid room capacity.');result[kind].total+=capacity;
  }
 }
 for(const entry of base.reservations??[]){if(!result[entry.destination]||!Number.isInteger(entry.cost)||entry.cost<1)throw Error('Invalid reservation.');result[entry.destination].used+=entry.cost;}
 for(const value of Object.values(result))value.free=value.total-value.used;
 return result;
}
export function validateBase(base,schemas){
 if(base?.format!=='simulator-base-1'||!Array.isArray(base.rooms)||!Array.isArray(base.groups)||!Array.isArray(base.reservations)||!Number.isInteger(base.revision)||base.revision<0)throw Error('Invalid base configuration.');
 const ids=new Set(),cells=new Set();
 for(const r of base.rooms){
  const d=schemas.find(d=>d.identity.id===r.roomId);if(!d||!/^r[1-9][0-9]*$/.test(r.instanceId)||ids.has(r.instanceId))throw Error('Invalid physical room.');ids.add(r.instanceId);
  if(!Number.isInteger(r.col)||!Number.isInteger(r.row)||r.col<0||r.row<0||r.width!==d.form.footprint.width||r.height!==d.form.footprint.height||r.col+r.width>12||r.row+r.height>10)throw Error('Invalid room footprint.');
  for(let x=r.col;x<r.col+r.width;x++)for(let y=r.row;y<r.row+r.height;y++){const cell=`${x},${y}`;if(cells.has(cell))throw Error('Overlapping rooms.');cells.add(cell);}
  if(d.rules.construction.constructionLimit==='unique'&&base.rooms.filter(v=>v.roomId===r.roomId).length>1)throw Error('Duplicate unique room.');
 }
 const groupIds=new Set();for(const g of base.groups){if(!/^g[1-9][0-9]*$/.test(g.id)||groupIds.has(g.id)||!Array.isArray(g.children)||g.children.length!==2)throw Error('Invalid room group.');groupIds.add(g.id);}
 const visit=(id,seen)=>{if(ids.has(id))return;const g=base.groups.find(g=>g.id===id);if(!g||seen.has(id))throw Error('Invalid room group references.');for(const child of g.children)visit(child,new Set([...seen,id]));};for(const g of base.groups.filter(g=>g.active))visit(g.id,new Set());
 const cap=baseCapacity(base,schemas);if(Object.values(cap).some(c=>c.free<0))throw Error('Base capacity is already reserved; cannot remove or downgrade these rooms.');
 const keys=new Set();for(const r of base.reservations){if(typeof r.key!=='string'||keys.has(r.key))throw Error('Duplicate recovery reservation.');keys.add(r.key);}
 return structuredClone(base);
}
export function reserveRecovery(base,schemas,requests,runId){
 const draft=structuredClone(base);for(const request of requests){const key=`${runId}:${request.instanceId}`;if(draft.reservations.some(r=>r.key===key))throw Error('Recovery already reserved.');draft.reservations.push({...structuredClone(request),key,cost:request.cost??1});}
 return validateBase(draft,schemas);
}
export async function loadBase(){const response=await fetch('../shared/data/base-configuration.json',{cache:'no-store'});if(!response.ok)throw Error('Could not load shared base configuration.');return response.json();}
const saveHelp='Start or restart the writable server with node demos/serve.mjs, and open the simulator on that server (default http://127.0.0.1:8001/demos/offworld-sandbox/).';
export async function saveBase(base,fetcher=fetch){
 let response;
 try{response=await fetcher('/api/base-configuration',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(base)});}
 catch{throw Error(`Could not reach the base save service. ${saveHelp} Your current selection is unchanged; retry confirmation once the server is available.`);}
 // Static servers and older demo servers can return HTML, including a 200 fallback page.
 // Never treat that as a successful reservation or leak an opaque JSON parser error.
 let result;try{result=JSON.parse(await response.text());}catch{
  throw Error(`Base save service returned a non-JSON response (HTTP ${response.status}). ${saveHelp} Your current selection is unchanged; recovery has not been confirmed.`);
 }
 if(!response.ok)throw Error(result?.error??`Base save failed (HTTP ${response.status}). ${saveHelp}`);
 if(result?.format!=='simulator-base-1'||result.revision!==base.revision+1||!Array.isArray(result.rooms)||!Array.isArray(result.reservations))throw Error(`The server did not acknowledge the saved base configuration. ${saveHelp} Recovery has not been confirmed.`);
 return result;
}

// Reset this simulator mission across browser reloads and repeated deployments.
export function releaseMissionRecovery(base,missionId,instanceIds){
 const ids=new Set(instanceIds),draft=structuredClone(base);
 draft.reservations=draft.reservations.filter(r=>r.source?r.source.simulator!=='offworld-sandbox'||r.source.missionId!==missionId:!ids.has(r.instanceId));
 return draft;
}
