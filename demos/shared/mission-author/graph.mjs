import {namedRandom,chooseWeighted,compare} from './determinism.mjs';
import {candidateTrace} from './trace.mjs';
// Select authored adjacency; this never creates doors or changes physical rooms.
export function buildStageGraph({entryStageId,requiredStageIds,range,nodes,transitions,identity}){
 const decisions=[],ids=new Set(nodes.map(n=>n.stageId)),required=[...new Set([entryStageId,...requiredStageIds])].sort(compare);
 const unresolved=reason=>({status:'UNRESOLVED',reason,decisions});
 if(required.some(id=>!ids.has(id)))return unresolved('A required Stage has no compatible purpose/environment.');
 const edges=[...transitions].filter(t=>ids.has(t.fromStageId)&&ids.has(t.toStageId)).sort((a,b)=>compare(a.transitionId,b.transitionId));
 const selected=new Set([entryStageId]);
 for(const target of required){
  const parents=new Map([[entryStageId,null]]),queue=[entryStageId];
  for(let i=0;i<queue.length&&!parents.has(target);i++){
   const current=queue[i],neighbors=edges.filter(e=>e.fromStageId===current||e.toStageId===current).map(e=>({id:e.fromStageId===current?e.toStageId:e.fromStageId,rank:namedRandom(identity,'graph',`route:${target}:${e.transitionId}`)()})).sort((a,b)=>a.rank-b.rank||compare(a.id,b.id));
   for(const n of neighbors)if(!parents.has(n.id)){parents.set(n.id,current);queue.push(n.id);}
  }
  if(!parents.has(target))return unresolved(`No authored route from ${entryStageId} to required Stage ${target}.`);
  const path=[];for(let id=target;id!==null;id=parents.get(id))path.unshift(id);
  path.forEach(id=>selected.add(id));decisions.push({family:`graph-route:${target}`,path});
 }
 if(selected.size>range.max)return unresolved(`Required routes need ${selected.size} Stages; authored maximum is ${range.max}.`);
 // Only count Stages reachable through compatible nodes, not isolated optional rooms.
 const reachable=new Set([entryStageId]);let changed=true;
 while(changed){changed=false;for(const e of edges)if(reachable.has(e.fromStageId)!==reachable.has(e.toStageId)){reachable.add(e.fromStageId);reachable.add(e.toStageId);changed=true;}}
 if(reachable.size<range.min)return unresolved(`Only ${reachable.size} compatible Stages are reachable; authored minimum is ${range.min}.`);
 const minimum=Math.max(range.min,selected.size),maximum=Math.min(range.max,reachable.size);
 const count=minimum+Math.floor(namedRandom(identity,'graph','stage-count')()*(maximum-minimum+1));
 while(selected.size<count){
  const frontier=[...new Set(edges.flatMap(e=>selected.has(e.fromStageId)&&!selected.has(e.toStageId)?[e.toStageId]:selected.has(e.toStageId)&&!selected.has(e.fromStageId)?[e.fromStageId]:[]))].sort(compare).map(id=>({id,weight:1,reasons:[]}));
  const chosen=chooseWeighted(frontier,namedRandom(identity,'graph',`fill:${selected.size}`));
  if(!chosen)return unresolved('No connected authored Stage can fill the requested graph.');
  decisions.push(candidateTrace(`graph-fill:${selected.size}`,frontier,chosen.id));selected.add(chosen.id);
 }
 return {status:'COMPOSED',stageIds:[...selected].sort(compare),transitions:edges.filter(e=>selected.has(e.fromStageId)&&selected.has(e.toStageId)),decisions};
}
