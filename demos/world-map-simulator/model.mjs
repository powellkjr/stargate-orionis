import {enrichHavens,knownHaven,havenSummary,TRADE_RULES} from './havens.mjs';
import {encodeAddress,decodeAddress,addressIndex,logicalAddressCount} from './address-codec.mjs';
// Standalone, deterministic simulator data. No game catalogs or runtime state are modified.
export const DEFAULTS = Object.freeze({majorRadius:3, minorRadius:3, majorScale:7, zRange:5,
  endpointRange:16, tiltMax:80, scaleMin:.7, scaleMax:1.3, capacityMin:.5, capacityMax:2,
  thickness:.7, density:.55, maxLinkDistance:9, edgePairs:2, edgeActive:.94});
export const DIRECTIONS = [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
export function random(seed) {
  let h=2166136261;
  for(const c of String(seed)) h=Math.imul(h^c.charCodeAt(0),16777619);
  return () => { h+=0x6D2B79F5; let t=Math.imul(h^(h>>>15),1|h); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; };
}
export function hex(radius) {
  const out=[];
  for(let q=-radius;q<=radius;q++) for(let r=-radius;r<=radius;r++) if(Math.abs(q+r)<=radius) out.push({q,r,s:-q-r});
  return out;
}
const key=(q,r,z=0)=>`${q},${r},${z}`;
const plane=(q,r)=>[Math.sqrt(3)*(q+r/2),1.5*r];
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export function shuffle(values,rng) {
  const a=[...values]; for(let i=a.length-1;i>0;i--) {const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a;
}
function config(input) {
  const c={...DEFAULTS,...input};
  const bounds={majorRadius:[0,5],minorRadius:[1,5],majorScale:[3,20],zRange:[1,10],endpointRange:[1,32],tiltMax:[0,89],scaleMin:[.2,3],scaleMax:[.2,3],capacityMin:[.1,4],capacityMax:[.1,4],thickness:[.1,2],density:[0,1],maxLinkDistance:[.1,100],edgePairs:[1,2],edgeActive:[0,1]};
  for(const [k,[lo,hi]] of Object.entries(bounds)) if(!Number.isFinite(c[k])||c[k]<lo||c[k]>hi) throw Error(`${k} must be between ${lo} and ${hi}`);
  for(const k of ['majorRadius','minorRadius','majorScale','zRange','endpointRange','edgePairs']) if(!Number.isInteger(c[k])) throw Error(`${k} must be an integer`);
  if(c.majorScale<2*c.minorRadius+1) throw Error('Major scale must be at least 2 × minor radius + 1 (non-overlapping regions).');
  if(c.scaleMin>c.scaleMax||c.capacityMin>c.capacityMax) throw Error('Distribution minimum must not exceed maximum.');
  return c;
}
export function discPoint(region,x,y,z=0) {
  const a=region.tiltAxis, t=region.tilt, u=Math.cos(a)*x+Math.sin(a)*y, v=-Math.sin(a)*x+Math.cos(a)*y;
  const w=v*Math.cos(t)-z*Math.sin(t), depth=v*Math.sin(t)+z*Math.cos(t);
  return [region.center[0]+(u*Math.cos(a)-w*Math.sin(a))*region.scale,
    region.center[1]+(u*Math.sin(a)+w*Math.cos(a))*region.scale,depth*region.scale];
}
export function generateGeometry(seed='orionis-1', input={}) {
  const c=config(input), rng=random(seed), between=(a,b)=>a+(b-a)*rng();
  logicalAddressCount(c); // Capacity guard before generating any infrastructure.
  const g={version:1,seed:String(seed),config:c,majorNetworks:[],minorNetworks:[],nodes:[],edges:[],edgePairs:[],gates:[],positions:[]};
  const major=hex(c.majorRadius), majorIndex=new Map(major.map((p,i)=>[key(p.q,p.r),i]));
  const maps=[], heights=[];
  for(const [id,p] of major.entries()) {
    const center=[...plane(c.majorScale*p.q,c.majorScale*p.r),0];
    g.majorNetworks.push({id,Q:p.q,R:p.r,S:p.s,minorNetworkId:id,center});
    const region={id,majorId:id,center,tilt:between(0,c.tiltMax)*Math.PI/180,tiltAxis:between(0,2*Math.PI),scale:between(c.scaleMin,c.scaleMax),capacity:between(c.capacityMin,c.capacityMax),thickness:c.thickness};
    g.minorNetworks.push(region); maps.push(new Map()); heights.push(new Map());
    for(const local of hex(c.minorRadius)) {
      const [x,y]=plane(local.q,local.r);
      const h=Math.max(-c.zRange+1,Math.min(c.zRange-1,Math.round((-Math.sin(region.tiltAxis)*x+Math.cos(region.tiltAxis)*y)*Math.sin(region.tilt))));
      heights[id].set(key(local.q,local.r),h);
      const reserved=DIRECTIONS.some(([dq,dr])=>majorIndex.has(key(p.q+dq,p.r+dr)) && local.q*dq+local.r*dr+local.s*(-dq-dr)>=2*c.minorRadius-1);
      const position={majorId:id,...local,state:reserved?'BOUNDARY_RESERVED':'NORMAL'};
      g.positions.push(position);
      for(let z=Math.max(-c.zRange,h-2);z<=Math.min(c.zRange,h+2);z++) {
        if(Math.abs(z-h)>1&&rng()>c.density) continue;
        addNode(id,local.q,local.r,z,position.state);
      }
    }
  }
  function addNode(majorId,q,r,z,state='BOUNDARY_RESERVED') {
    const k=key(q,r,z); if(maps[majorId].has(k)) return maps[majorId].get(k);
    const m=g.majorNetworks[majorId], region=g.minorNetworks[majorId], [x,y]=plane(q,r);
    const h=heights[majorId].get(key(q,r))??0;
    const physical=discPoint(region,x+between(-.08,.08),y+between(-.08,.08),(z-h)*region.thickness);
    const id=g.nodes.length;
    g.nodes.push({id,majorId,local:{q,r,s:-q-r,z},logical:{q:c.majorScale*m.Q+q,r:c.majorScale*m.R+r,s:c.majorScale*m.S-q-r,z},physical,state,kind:'ROUTING'});
    maps[majorId].set(k,id); return id;
  }
  function edge(a,b,pairId=null) {
    const id=g.edges.length;
    g.edges.push({id,a,b,pairId,distance:distance(g.nodes[a].physical,g.nodes[b].physical)}); return id;
  }
  // Boundary corridors use only the eight lattice directions, including vertical steps.
  // Additional scale gaps receive reserved hidden infrastructure, never ordinary endpoints.
  for(const m of g.majorNetworks) for(const [dq,dr] of DIRECTIONS) {
    const other=majorIndex.get(key(m.Q+dq,m.R+dr)); if(other===undefined||other<=m.id) continue;
    const count=c.edgePairs===1?1:1+Math.floor(rng()*2);
    for(let n=0;n<count;n++) {
      const z=n===0?0:Math.min(2,c.zRange), aQ=dq*c.minorRadius,aR=dr*c.minorRadius,bQ=-aQ,bR=-aR;
      for(const [mid,q,r] of [[m.id,aQ,aR],[other,bQ,bR]]) {
        const h=heights[mid].get(key(q,r));
        for(let zz=Math.min(z,h);zz<=Math.max(z,h);zz++) addNode(mid,q,r,zz);
      }
      const a=addNode(m.id,aQ,aR,z), b=addNode(other,bQ,bR,z), id=g.edgePairs.length;
      g.nodes[a].kind=g.nodes[b].kind='EDGE'; g.nodes[a].state=g.nodes[b].state='EDGE_NODE';
      const pair={id,a,b,majorA:m.id,majorB:other,active:rng()<c.edgeActive,edgeIds:[]};
      let prev=a;
      const gap=c.majorScale-2*c.minorRadius;
      for(let step=1;step<gap;step++) {
        const next=addNode(m.id,aQ+dq*step,aR+dr*step,z,'EDGE_NODE');
        g.nodes[next].kind='EDGE'; pair.edgeIds.push(edge(prev,next,id)); prev=next;
      }
      pair.edgeIds.push(edge(prev,b,id)); g.edgePairs.push(pair);
    }
  }
  // No automatic cross-major adjacency: only explicit Edge Pair corridors cross boundaries.
  const pairEdges=new Set(g.edges.map(e=>`${Math.min(e.a,e.b)},${Math.max(e.a,e.b)}`));
  for(const node of g.nodes) {
    const {q,r,z}=node.local;
    for(const [dq,dr,dz] of [[1,0,0],[0,1,0],[-1,1,0],[0,0,1]]) {
      const b=maps[node.majorId].get(key(q+dq,r+dr,z+dz));
      if(b!==undefined&&!pairEdges.has(`${Math.min(node.id,b)},${Math.max(node.id,b)}`)) edge(node.id,b);
    }
  }
  for(const m of g.majorNetworks) {
    const candidates=g.nodes.filter(n=>n.majorId===m.id&&n.state==='NORMAL'&&n.local.z===heights[m.id].get(key(n.local.q,n.local.r)));
    const count=Math.min(candidates.length,Math.max(1,Math.round(10*g.minorNetworks[m.id].capacity)));
    for(const node of shuffle(candidates,rng).slice(0,count)) {
      const id=g.gates.length, {q,r,z}=node.local;
      const address={Q:m.Q,q,Z:z,r,R:m.R,endpoint:Math.floor(rng()*c.endpointRange)};
      g.gates.push({id,nodeId:node.id,address,addressGlyphIds:encodeAddress(address,c),originGlyphId:`${g.seed}:origin:${id}`,originCode:id,active:true});
    }
  }
  const encoded=new Set();
  for(const gate of g.gates) {
    const ids=gate.addressGlyphIds,key=ids.join(',');
    if(ids.length!==6||new Set(ids).size!==6||encoded.has(key)||addressIndex(decodeAddress(ids,c),c)!==addressIndex(gate.address,c))throw Error(`Invalid encoded address at Gate ${gate.id}.`);
    encoded.add(key);
  }
  return g;
}
export function emptyFailures() {return {nodes:new Set(),pairs:new Set(),gates:new Set()};}
export function graph(g, failures=emptyFailures(), options={}) {
  const adjacency=Array.from({length:g.nodes.length},()=>[]);
  for(const e of g.edges) {
    if(!options.ignoreFailures&&(failures.nodes.has(e.a)||failures.nodes.has(e.b)||failures.pairs.has(e.pairId))) continue;
    if(!options.ignorePairs&&e.pairId!==null&&!g.edgePairs[e.pairId].active) continue;
    if(!options.ignoreDistance&&e.distance>(options.maxLinkDistance??g.config.maxLinkDistance)) continue;
    adjacency[e.a].push([e.b,e.id]); adjacency[e.b].push([e.a,e.id]);
  }
  return adjacency;
}
export function bfs(adjacency,source) {
  const dist=new Int32Array(adjacency.length).fill(-1), parent=new Int32Array(adjacency.length).fill(-1), parentEdge=new Int32Array(adjacency.length).fill(-1);
  const queue=new Int32Array(adjacency.length); let head=0,tail=0;
  dist[source]=0; queue[tail++]=source;
  while(head<tail) {const a=queue[head++]; for(const [b,e] of adjacency[a]) if(dist[b]<0) {dist[b]=dist[a]+1;parent[b]=a;parentEdge[b]=e;queue[tail++]=b;}}
  return {dist,parent,parentEdge};
}
export function gateActive(g,gate,f) {return gate.active&&!f.gates.has(gate.id)&&!f.nodes.has(gate.nodeId);}
export function route(g,sourceId,destinationId,hopLimit,failures=emptyFailures()) {
  const a=g.gates[sourceId], b=g.gates[destinationId];
  if(!a||!b) return {reachable:false,reason:'Select two Gate endpoints',nodes:[],edges:[]};
  if(!gateActive(g,a,failures)||!gateActive(g,b,failures)) return {reachable:false,reason:'endpoint inactive',nodes:[],edges:[]};
  const result=bfs(graph(g,failures),a.nodeId), hops=result.dist[b.nodeId];
  if(hops<0) {
    const connects=options=>bfs(graph(g,failures,options),a.nodeId).dist[b.nodeId]>=0;
    const reason=connects({ignoreFailures:true})?'disabled routing infrastructure':connects({ignoreDistance:true})?'physical link-distance constraint':connects({ignorePairs:true})?'no usable Edge Pair':'disconnected topology (possibly combined constraints)';
    return {reachable:false,reason,nodes:[],edges:[]};
  }
  const nodes=[],edges=[]; let current=b.nodeId;
  while(current!==a.nodeId) {nodes.push(current);edges.push(result.parentEdge[current]);current=result.parent[current];} nodes.push(a.nodeId); nodes.reverse();edges.reverse();
  return {reachable:hops<=hopLimit,reason:hops<=hopLimit?'route established':'hop limit exceeded',hops,nodes,edges,
    physicalLength:edges.reduce((sum,id)=>sum+g.edges[id].distance,0),majorNetworks:[...new Set(nodes.map(id=>g.nodes[id].majorId))],edgePairs:[...new Set(edges.map(id=>g.edges[id].pairId).filter(id=>id!==null))]};
}
// Iterative Tarjan traversal avoids recursion limits for larger seed sweeps.
function critical(adjacency) {
  const n=adjacency.length, discovery=new Int32Array(n).fill(-1),low=new Int32Array(n),parent=new Int32Array(n).fill(-1),parentEdge=new Int32Array(n).fill(-1),children=new Int32Array(n);
  const nodes=new Set(),bridges=[]; let time=0;
  for(let root=0;root<n;root++) if(discovery[root]<0) {
    discovery[root]=low[root]=time++; const stack=[[root,0]];
    while(stack.length) {
      const frame=stack[stack.length-1],u=frame[0];
      if(frame[1]<adjacency[u].length) {
        const [v,e]=adjacency[u][frame[1]++]; if(e===parentEdge[u]) continue;
        if(discovery[v]<0) {parent[v]=u;parentEdge[v]=e;children[u]++;discovery[v]=low[v]=time++;stack.push([v,0]);}
        else low[u]=Math.min(low[u],discovery[v]);
      } else {
        stack.pop(); const p=parent[u];
        if(p<0) {if(children[u]>1) nodes.add(u);}
        else {low[p]=Math.min(low[p],low[u]);if(parent[p]>=0&&low[u]>=discovery[p]) nodes.add(p);if(low[u]>discovery[p]) bridges.push(parentEdge[u]);}
      }
    }
  }
  return {nodes:[...nodes],bridges};
}
export function analyze(g,failures=emptyFailures(),{minHop=4,maxHop=80,target=.9}={}) {
  const adjacency=graph(g,failures), active=g.gates.filter(a=>gateActive(g,a,failures));
  const component=new Int32Array(g.nodes.length).fill(-1),sizes=[],gateSizes=[];
  for(const n of g.nodes) if(!failures.nodes.has(n.id)&&component[n.id]<0) {
    const id=sizes.length,queue=[n.id];component[n.id]=id;
    for(let i=0;i<queue.length;i++) for(const [b] of adjacency[queue[i]]) if(component[b]<0) {component[b]=id;queue.push(b);}
    sizes.push(queue.length);gateSizes.push(0);
  }
  for(const a of active) gateSizes[component[a.nodeId]]++;
  const distances=active.map(a=>bfs(adjacency,a.nodeId).dist);
  const histogram=[],pairDistances=active.map((a,i)=>active.map(b=>distances[i][b.nodeId]));
  let connectedPairs=0,totalHops=0,maximumHops=0;
  for(let i=0;i<active.length;i++) for(let j=i+1;j<active.length;j++) {
    const d=pairDistances[i][j]; if(d<0) continue; histogram[d]=(histogram[d]??0)+1;connectedPairs++;totalHops+=d;maximumHops=Math.max(maximumHops,d);
  }
  const pairs=active.length*(active.length-1)/2,criticality=critical(adjacency),hopAnalysis=[];
  let reachablePairs=0;
  for(let h=0;h<=maxHop;h++) {
    reachablePairs+=histogram[h]??0;
    if(h<minHop) continue;
    hopAnalysis.push({hop:h,reachability:pairs?reachablePairs/pairs:0,connectedCoverage:connectedPairs?reachablePairs/connectedPairs:0,stagingPairs:connectedPairs-reachablePairs,
      isolatedGates:active.filter((a,i)=>!pairDistances[i].some((d,j)=>i!==j&&d>=0&&d<=h)).length});
  }
  const recommended=hopAnalysis.find(row=>row.connectedCoverage>=target)?.hop??null;
  const criticalPairs=[...new Set(criticality.bridges.map(id=>g.edges[id].pairId).filter(id=>id!==null))];
  return {seed:g.seed,totalMajorNetworks:g.majorNetworks.length,totalMinorNetworks:g.minorNetworks.length,totalNodes:g.nodes.length,totalGates:g.gates.length,activeGates:active.length,totalEdgePairs:g.edgePairs.length,
    components:sizes.length,gateComponents:gateSizes.filter(n=>n>0).length,largestComponent:Math.max(0,...sizes),largestGateComponent:Math.max(0,...gateSizes),
    averageHops:connectedPairs?totalHops/connectedPairs:0,maximumHops,connectivity:pairs?connectedPairs/pairs:0,isolatedGates:gateSizes.filter(n=>n===1).length,
    criticalNodes:criticality.nodes,criticalPairs,recommendedHop:recommended,recommendationTarget:target,hopAnalysis,
    // Runtime indices are deliberately excluded from exported reports.
    runtime:{adjacency,active,distances,pairDistances,component}};
}
export function sourceReachability(g,analysis,sourceId,hop,failures=emptyFailures()) {
  const source=g.gates[sourceId]; if(!source||!gateActive(g,source,failures)) return g.gates.map(a=>gateActive(g,a,failures)?'unreachable':'inactive');
  const {active,pairDistances}=analysis.runtime, index=active.findIndex(a=>a.id===sourceId);
  if(index<0) return g.gates.map(()=> 'unreachable');
  // A staging path must have actual usable Gate endpoints at every stop.
  const staged=new Set([index]),queue=[index];
  for(let k=0;k<queue.length;k++) for(let j=0;j<active.length;j++) if(!staged.has(j)&&pairDistances[queue[k]][j]>=0&&pairDistances[queue[k]][j]<=hop) {staged.add(j);queue.push(j);}
  const activeIndex=new Map(active.map((a,i)=>[a.id,i]));
  return g.gates.map(gate=>{
    if(!gateActive(g,gate,failures)) return 'inactive';
    const i=activeIndex.get(gate.id),d=pairDistances[index][i];
    if(d>=0&&d<=hop) return d>=hop-2?'near limit':'reachable';
    return staged.has(i)?'requires staging':'unreachable';
  });
}
export function failureTest(g,type,seed='failure-1',analysis=null) {
  const f=emptyFailures(),rng=random(seed);
  if(type==='1%'||type==='5%') {
    const candidates=g.nodes.filter(n=>!g.gates.some(a=>a.nodeId===n.id));
    for(const n of shuffle(candidates,rng).slice(0,Math.max(1,Math.round(candidates.length*(type==='1%'?.01:.05))))) f.nodes.add(n.id);
  } else if(type==='pair'&&g.edgePairs.length) f.pairs.add(shuffle(g.edgePairs,rng)[0].id);
  else if(type==='critical') {const ids=(analysis??analyze(g)).criticalNodes; if(ids.length) f.nodes.add(ids[0]);}
  return f;
}
export const FACTIONS=['Scions','CLP',"Moy’na",'Independent'];
export function generateCampaign(g,seed='campaign-1',hop=20,{threatCount=4,minAccess=8}={},analysis=analyze(g),failures=emptyFailures()) {
  if(!Number.isInteger(threatCount)||threatCount<0||threatCount>20) throw Error('Threat count must be an integer from 0 to 20.');
  const rng=random(seed),{active,pairDistances}=analysis.runtime;
  const eligible=active.map((a,i)=>({gate:a,index:i,count:pairDistances[i].filter(d=>d>=0&&d<=hop).length})).filter(x=>x.count>=minAccess);
  const start=shuffle(eligible,rng)[0];
  const campaign={seed:String(seed),sgcGateId:start?.gate.id??null,havens:[],threats:[],knowledge:{},validation:{pass:false,warnings:[]}};
  if(!start) {campaign.validation.warnings.push(`No usable SGC Gate reaches ${minAccess} endpoints at hop ${hop}.`);return campaign;}
  const reachable=active.filter((a,i)=>a.id!==start.gate.id&&pairDistances[start.index][i]>=0&&pairDistances[start.index][i]<=hop);
  const pool=shuffle(active.filter(a=>a.id!==start.gate.id&&analysis.runtime.component[a.nodeId]===analysis.runtime.component[start.gate.nodeId]),rng);
  const used=new Set(),counts=[40,25,15,20];
  // Placeholder discovery character operates in address/topology space, never territorial borders.
  const hubs=shuffle(pool,rng).slice(0,3); let scionLead=start.gate;
  const addressDistance=(a,b)=>Math.abs(a.address.Q-b.address.Q)+Math.abs(a.address.R-b.address.R)+Math.abs(a.address.q-b.address.q)+Math.abs(a.address.r-b.address.r)+Math.abs(a.address.Z-b.address.Z);
  for(let fi=0;fi<FACTIONS.length;fi++) {
    for(let i=0;i<counts[fi];i++) {
      let candidates=(i===0?shuffle(reachable,rng):shuffle(pool,rng)).filter(a=>!used.has(a.id));
      if(fi===1&&i>0) candidates.sort((a,b)=>Math.min(...hubs.map(h=>addressDistance(a,h)))-Math.min(...hubs.map(h=>addressDistance(b,h))));
      if(fi===0&&i>0&&i%5!==0) candidates.sort((a,b)=>addressDistance(a,scionLead)-addressDistance(b,scionLead));
      const gate=candidates[0]; if(!gate) break; used.add(gate.id);if(fi===0) scionLead=gate;
      campaign.havens.push({id:campaign.havens.length,gateId:gate.id,faction:FACTIONS[fi],scale:fi===2?3+Math.floor(rng()*3):1+Math.floor(rng()*3),name:`${FACTIONS[fi]} Haven ${i+1}`,ancientSite:fi===0?rng()<.7:rng()<.15});
    }
  }
  const threatPool=shuffle(pool.filter(a=>!reachable.slice(0,4).some(b=>a.id===b.id)),rng);
  campaign.threats=threatPool.slice(0,threatCount).map((a,id)=>({id,gateId:a.id,kind:'infected'}));
  const known=new Set([start.gate.id,...shuffle(reachable,rng).slice(0,18).map(a=>a.id),...shuffle(pool,rng).slice(0,8).map(a=>a.id)]);
  for(const id of known) campaign.knowledge[id]={address:true,spatial:id===start.gate.id||rng()<.7,haven:rng()<.75,faction:rng()<.7,threat:rng()<.65};
  // Separate random stream preserves existing placements and initial address knowledge.
  campaign.havens=enrichHavens(campaign.havens,random(`${seed}:haven-metadata-v1`));
  const knowledgeRng=random(`${seed}:haven-knowledge-v1`);
  for(const k of Object.values(campaign.knowledge)) {k.population=knowledgeRng()<.8;k.resources=knowledgeRng()<.8;}
  campaign.tradeRules={...TRADE_RULES};
  campaign.validation=validateCampaign(g,campaign,hop,analysis,failures,{minAccess}); return campaign;
}
export function validateCampaign(g,c,hop,analysis,failures=emptyFailures(),{minAccess=8}={}) {
  const warnings=[],start=g.gates[c.sgcGateId],active=start&&gateActive(g,start,failures),dist=active?bfs(analysis.runtime.adjacency,start.nodeId).dist:[];
  const can=id=>active&&gateActive(g,g.gates[id],failures)&&dist[g.gates[id].nodeId]>=0&&dist[g.gates[id].nodeId]<=hop;
  if(!active) warnings.push('SGC endpoint is inactive or missing.');
  if(g.gates.filter(a=>can(a.id)).length<minAccess) warnings.push(`SGC must reach at least ${minAccess} useful endpoints.`);
  const byFaction=Object.fromEntries(FACTIONS.map(f=>[f,c.havens.filter(h=>h.faction===f).length]));
  const factionReachability=Object.fromEntries(FACTIONS.map(f=>[f,c.havens.filter(h=>h.faction===f&&can(h.gateId)).length]));
  for(const f of FACTIONS) if(!factionReachability[f]) warnings.push(`No ${f} Haven is directly reachable from SGC.`);
  if(c.havens.length<100) warnings.push(`Only ${c.havens.length}/100 requested Havens fit in the SGC topology component.`);
  if(new Set(c.havens.map(h=>h.gateId)).size!==c.havens.length) warnings.push('Duplicate Haven placement.');
  const statuses=sourceReachability(g,analysis,c.sgcGateId,hop,failures);
  const stranded=c.havens.filter(h=>!['reachable','near limit','requires staging'].includes(statuses[h.gateId])).length;
  if(stranded) warnings.push(`${stranded} Havens cannot be reached even by Gate staging.`);
  if(c.threats.some(t=>t.gateId===c.sgcGateId)) warnings.push('SGC begins in an infected zone.');
  return {pass:!warnings.length,warnings,byFaction,factionReachability,havenSummary:havenSummary(c.havens),reachableHavens:c.havens.filter(h=>can(h.gateId)).length,
    initiallyUnreachableHavens:c.havens.filter(h=>!can(h.gateId)).length,strandedHavens:stranded,threatCount:c.threats.length,threatenedHavens:c.havens.filter(h=>c.threats.some(t=>t.gateId===h.gateId)).length};
}
// This projection is the only source of Gate/Haven/threat records for the player UI.
export function playerView(g,c) {
  return g.gates.filter(a=>c.knowledge[a.id]?.address).map(a=>{
    const k=c.knowledge[a.id],h=c.havens.find(h=>h.gateId===a.id);
    return {id:a.id,address:a.address,originGlyphId:a.originGlyphId,originCode:a.originCode,
      physical:k.spatial?g.nodes[a.nodeId].physical:null,
      haven:knownHaven(h,k),
      threat:k.threat?c.threats.find(t=>t.gateId===a.id)??null:null};
  });
}
export function report(analysis) {const {runtime,...out}=analysis;return out;}
// Placeholder family: asymmetric anchor prevents rotations/mirrors from matching.
// A connected spine with 16 optional branches provides stable, extensible vector IDs.
export function glyphPath(code) {
  let d='M 3 3 L 8 3 L 8 37 L 12 37';
  for(let i=0;i<16;i++) {const y=5+i*1.8;if((code>>>i)&1)d+=` M 8 ${y} L ${i%2?14:2} ${y+1}`;}
  return d;
}
export function addressCodes(a,options={}) {return encodeAddress(a,options);}
