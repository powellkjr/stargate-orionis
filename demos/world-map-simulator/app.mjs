import {DEFAULTS,FACTIONS,generateCampaign,validateCampaign,emptyFailures,failureTest,route,sourceReachability,playerView,report,glyphPath,addressCodes,discPoint} from './model.mjs';
import {RESOURCES,TRADE_RULES,balanceIndicator,matchesResource,tradeRelationships,havenSummary} from './havens.mjs';
import {encodeAddress,DEFAULT_ADDRESS_CODEC} from './address-codec.mjs';
const $=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors={'reachable':'#34d399','near limit':'#facc15','requires staging':'#f97316','unreachable':'#64748b','inactive':'#475569','unknown':'#94a3b8',Scions:'#14b8a6',CLP:'#38bdf8','Moy’na':'#c084fc',Independent:'#f472b6'};
let geometry,analysis,campaign,failures=emptyFailures(),source=0,selected=null,hovered=null,records=[],reach=[],currentRoute=null,trades=[];
let worker,job=0,batchWorker,batchRows=[],busy=false,hitTargets=[],yaw=.3,pitch=.65,zoom=1,focus=[0,0,0];
const canvas=$('map'),ctx=canvas.getContext('2d');
const layerSpecs=[['plane','Z=0 plane',false,true],['regions','Major boundaries',true,true],['discs','Minor discs',true,true],['normals','Disc normals / thickness',false,true],['logical','Logical lattice',false,true],['reserved','Boundary reserved',false,true],['candidates','Candidate links',false,true],['routing','Active routing links',false,true],['nodes','Hidden routing nodes',false,true],['pairs','Edge Pairs',true,true],['gates','Gate locations',true,false],['factions','Faction colors',true,false],['havens','Havens',true,false],['threat','Threat / infection',true,false],['addresses','Address labels',false,true],['reach','Reachability',true,true],['route','Shortest route',true,true]];
const layers=Object.fromEntries(layerSpecs.map(([id,,on])=>[id,on]));
layerSpecs.push(['populationScale','Show Haven Population Scale',false,false],['capacityScale','Show Haven Capacity Scale',false,false],['resources','Resource balance',false,false],['trade','Potential trade',false,false]);
Object.assign(layers,{populationScale:false,capacityScale:false,resources:false,trade:false});
const resourceColors={deficit:'#fb7185',stable:'#94a3b8',surplus:'#34d399'},arrows={deficit:'↓',stable:'→',surplus:'↑'};
const MAX_HAVEN_POPULATION=16e6,MAX_POPULATION_RADIUS=18;
const millions=n=>Number.isFinite(n)?`${(n/1e6).toFixed(2)} million`:'Unknown';
const settings={majorRadius:['Major radius',0,5,1],minorRadius:['Minor radius',1,5,1],majorScale:['Major scale',3,20,1],zRange:['Z ± range',1,10,1],endpointRange:['$ values',1,32,1],tiltMax:['Tilt max °',0,89,1],scaleMin:['Scale min',.2,3,.1],scaleMax:['Scale max',.2,3,.1],capacityMin:['Capacity min',.1,4,.1],capacityMax:['Capacity max',.1,4,.1],thickness:['Disc thickness',.1,2,.1],density:['Extra node density',0,1,.05],maxLinkDistance:['Max physical link',.1,100,.1],edgePairs:['Max pairs / boundary',1,2,1],edgeActive:['Active pair fraction',0,1,.01]};
settings.destinationGlyphCount=['Shared destination glyphs',6,64,1];
for(const [id,[label,min,max,step]] of Object.entries(settings)) $('settings').insertAdjacentHTML('beforeend',`<label>${label}<input data-config="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${DEFAULTS[id]??DEFAULT_ADDRESS_CODEC[id]}"></label>`);
for(const [id,label,on,debug] of layerSpecs) $('layers').insertAdjacentHTML('beforeend',`<label class="${debug?'developer':''}"><input type="checkbox" data-layer="${id}" ${on?'checked':''}>${label}</label>`);
const god=()=>$('mode').value==='god',hop=()=>Number($('hop').value),pct=n=>`${(100*n).toFixed(1)}%`;
const configuration=()=>Object.fromEntries([...document.querySelectorAll('[data-config]')].map(input=>[input.dataset.config,Number(input.value)]));
const status=message=>$('status').textContent=message;
function setBusy(value) {
  busy=value;
  for(const id of ['generate','randomGeometry','campaign','randomCampaign','failure','restore','export']) $(id).disabled=value;
  $('hop').disabled=value;$('toggleFailure').disabled=value||!selected||selected.type==='region';
  $('campaignSeed').disabled=$('threatCount').disabled=value;
  updateLock();
}
function updateLock() {
  const locked=$('lock').checked;
  $('geometrySeed').disabled=locked||busy;
  for(const el of document.querySelectorAll('[data-config]')) el.disabled=locked||busy;
  $('generate').disabled=$('randomGeometry').disabled=locked||busy;
}
function requestAnalysis(regenerate=false) {
  if(busy) return;
  if(regenerate&&!$('threatCount').checkValidity()) {status('Infected zones must be an integer from 0 to 20.');return;}
  setBusy(true);status(regenerate?'Generating geometry and analyzing routes…':'Recalculating failures and routing…');
  worker?.terminate();worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});
  worker.onerror=e=>{setBusy(false);status(`Worker error: ${e.message}`);};
  worker.onmessage=({data})=>{
    if(data.type==='error') {setBusy(false);status(data.message);return;}
    if(data.id!==job) return;
    geometry=data.geometry;analysis=data.analysis;
    if(regenerate) {
      failures=emptyFailures();$('hop').value=analysis.recommendedHop??20;focus=[0,0,0];zoom=1;
      try {makeCampaign();} catch(e) {setBusy(false);status(e.message);return;}
    } else campaign.validation=validateCampaign(geometry,campaign,hop(),analysis,failures);
    setBusy(false);refresh();status(god()?`${geometry.seed} · ${geometry.gates.length} Gates · analysis complete`:'SGC records loaded');
  };
  worker.postMessage({id:++job,type:'analyze',...(regenerate?{seed:$('geometrySeed').value,config:configuration()}:{geometry,failures})});
}
function makeCampaign() {
  campaign=generateCampaign(geometry,$('campaignSeed').value,hop(),{threatCount:Number($('threatCount').value)},analysis,failures);
  source=campaign.sgcGateId??geometry.gates[0]?.id??0;selected={type:'gate',id:source};hovered=null;
}
function godRecords() {return geometry.gates.map(a=>({...a,physical:geometry.nodes[a.nodeId].physical,haven:campaign.havens.find(h=>h.gateId===a.id),threat:campaign.threats.find(t=>t.gateId===a.id)}));}
const svg=(code,origin=false)=>`<svg ${origin?'class="origin"':''} data-glyph-id="${code}" viewBox="0 0 17 40" aria-hidden="true"><path d="${glyphPath(code)}" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;
function glyphs(address,origin=null) {
  const ids=encodeAddress(address,geometry.config);
  return `<div class="glyphs" role="img" aria-label="${ids.map(id=>`G${id}`).join(' ')}${origin!==null?', then local Origin':''}">${ids.map(c=>svg(c)).join('')}${origin!==null?svg(origin+100,true):''}</div>`;
}
function addressText(a) {return `Q${a.Q} q${a.q} Z${a.Z} r${a.r} R${a.R} $${a.endpoint}`;}
function refresh() {
  if(!geometry||!campaign)return;
  document.body.classList.toggle('sgc',!god());
  records=god()?godRecords():playerView(geometry,campaign);
  if(!records.some(a=>a.id===source)) source=campaign.sgcGateId??records[0]?.id;
  if(selected&&(selected.type!=='gate'&&!god()||selected.type==='gate'&&!records.some(a=>a.id===selected.id))) selected=null;
  hovered=null;
  $('source').innerHTML=records.map(a=>`<option value="${a.id}">Gate ${a.id}${a.id===campaign.sgcGateId?' · SGC':''}</option>`).join('');$('source').value=source;
  $('hopValue').value=hop();$('gateCount').textContent=`(${records.length})`;
  const sourceRecord=records.find(a=>a.id===source),alphabetSize=geometry.config.destinationGlyphCount??DEFAULT_ADDRESS_CODEC.destinationGlyphCount;
  $('glyphVocabulary').innerHTML=`<p>${alphabetSize} shared destination glyphs</p><div class="glyphs" style="flex-wrap:wrap">${Array.from({length:alphabetSize},(_,id)=>`<span title="G${id}" aria-label="G${id}">${svg(id)}</span>`).join('')}</div>${sourceRecord?`<p>Gate ${source} · local Point of Origin</p><div class="glyphs">${svg(sourceRecord.originCode+100,true)}</div>`:''}`;
  reach=god()?sourceReachability(geometry,analysis,source,hop(),failures):[];
  currentRoute=god()&&selected?.type==='gate'?route(geometry,source,selected.id,hop(),failures):null;
  const tradeSource=selected?.type==='gate'?records.find(a=>a.id===selected.id)?.haven:null;
  trades=tradeSource?tradeRelationships(records.filter(a=>a.haven).map(a=>a.haven),tradeSource.id,god()?(a,b)=>route(geometry,a,b,hop(),failures):null):[];
  $('mapBadge').textContent=god()?'GOD VIEW · hidden truth':'SGC VIEW · known records only';
  renderDialing();renderDetails();renderDiagnostics();renderTrade();renderLegend();draw();
}
function resourceMarkup(h) {
  const special=balanceIndicator(h.resources);
  return `<div class="resource-states">${RESOURCES.map(r=>`<span>${r} <b style="color:${resourceColors[h.resources?.[r]]??'#9ca3af'}">${arrows[h.resources?.[r]]??'?'} ${esc(h.resources?.[r]??'unknown')}</b></span>`).join('')}</div>${special?`<p class="gold">${special==='golden balance'?'● All resources balanced':'↑ All resources in surplus'}</p>`:''}`;
}
function havenDetails(a) {
  const h=a.haven;if(!h)return '';
  return `<h2>${esc(h.name)}</h2><p>Faction: ${esc(h.faction??'Unknown')} · ${h.scale??'Capacity unknown'}</p>
    <dl class="haven-stats"><dt>Sentient population</dt><dd>${millions(h.sentientPopulation)} individuals</dd><dt>Resident ration capacity</dt><dd>${millions(h.rationCapacity)} adult-equivalent / day</dd><dt>Resident ration demand</dt><dd>${millions(h.rationDemand)} adult-equivalent / day</dd><dt>Occupancy</dt><dd>${h.occupancy===undefined?'Unknown':pct(h.occupancy)}</dd></dl>
    <h2>Local resources</h2>${resourceMarkup(h)}<p>Material capability: ${h.materialQuality??'Unknown'}</p>
    <p>Gate status from Gate ${source}: ${god()?reach[a.id]:'Not yet known'}</p>
    <p class="muted">One trade per Haven per hour. Resource states describe local balance; imports are not assumed to resolve deficits.</p>
    ${god()?`<details><summary>Population cohorts & history</summary><pre>${esc(JSON.stringify({populationCohorts:h.populationCohorts,nestHistory:h.nestHistory,ancientSite:h.ancientSite},null,2))}</pre></details>`:''}`;
}
function renderDialing() {
  const query=$('search').value.toLowerCase(),list=records.filter(a=>`${a.id} ${addressText(a.address)} ${a.haven?.name??''} ${a.haven?.faction??''}`.toLowerCase().includes(query));
  $('dialing').innerHTML=list.map(a=>`<div class="gate-row ${selected?.type==='gate'&&selected.id===a.id?'selected':''}" data-gate="${a.id}"><div class="gate-title"><b>Gate ${a.id}${a.id===campaign.sgcGateId?' · SGC':''}</b><span>${god()?reach[a.id]:'Known address'}</span></div>${glyphs(a.address)}${a.haven?`<span class="muted">${esc(a.haven.name)}</span>`:''}<div class="row"><button data-select="${a.id}">Inspect</button><button data-show="${a.id}" ${a.physical?'':'disabled'}>${a.physical?'Show me':'Uncorrelated'}</button></div></div>`).join('')||'<p class="muted">No known matching addresses.</p>';
}
function renderDetails() {
  const object=hovered??selected,record=object?.type==='gate'?records.find(a=>a.id===object.id):null;
  if(record) {
    const a=record;
    $('details').innerHTML=`<h2>Gate ${a.id}</h2>${glyphs(a.address)}<p>${a.physical?'Spatially correlated':'Address known · physical location uncorrelated'}</p>${havenDetails(a)}${god()?`<details><summary>Gate debug coordinates</summary><pre>${esc(JSON.stringify({address:a.address,originGlyphId:a.originGlyphId,logical:geometry.nodes[a.nodeId].logical,physical:a.physical,routingNode:a.nodeId},null,2))}</pre></details>`:''}${a.threat?'<p class="bad">● Known infected zone</p>':''}`;
  } else if(object&&god()) {
    const value=object.type==='node'?geometry.nodes[object.id]:object.type==='pair'?geometry.edgePairs[object.id]:{major:geometry.majorNetworks[object.id],minor:geometry.minorNetworks[object.id]};
    $('details').innerHTML=`<h2>${object.type==='region'?'Major / minor network':object.type==='pair'?'Edge Pair':'Routing node'} ${object.id}</h2><pre>${esc(JSON.stringify(value,null,2))}</pre>`;
  } else $('details').textContent='Select a Gate or map object to inspect it.';
  const target=selected?.type==='gate'?records.find(a=>a.id===selected.id):null,origin=records.find(a=>a.id===source);
  $('route').innerHTML=target&&origin?`<p>Gate ${source} → Gate ${target.id}</p>${glyphs(target.address,origin.originCode)}<p class="muted">Destination’s six glyphs + Gate ${source} Origin</p>${god()?`<p class="${currentRoute?.reachable?'good':'bad'}">${esc(currentRoute?.reason)}</p>${currentRoute?.hops!==undefined?`<p>${currentRoute.hops} hops / limit ${hop()}<br>Physical route length ${currentRoute.physicalLength.toFixed(1)}<br>Majors: ${currentRoute.majorNetworks.join(' → ')}<br>Edge Pairs: ${currentRoute.edgePairs.join(', ')||'none'}</p><details><summary>Shortest hidden path</summary><pre>${currentRoute.nodes.join(' → ')}</pre></details>`:''}`:'<p class="muted">Routing infrastructure and reachability have not been discovered in these starting records.</p>'}`:'Select a destination Gate.';
  const group=selected?.type==='gate'?failures.gates:selected?.type==='node'?failures.nodes:failures.pairs;
  $('toggleFailure').disabled=busy||!selected||selected.type==='region';
  $('toggleFailure').textContent=`${selected&&group.has(selected.id)?'Restore':'Disable'} selected ${selected?.type??'infrastructure'}`;
}
function renderDiagnostics() {
  if(!god()) {for(const id of ['metrics','hopRows','campaignReport','recommendation','failureSummary','populationSummary']) $(id).replaceChildren();return;}
  const a=analysis,statusCounts=Object.fromEntries(['reachable','near limit','requires staging','unreachable','inactive'].map(s=>[s,reach.filter(r=>r===s).length]));
  const metrics=[['Major / minor networks',`${a.totalMajorNetworks} / ${a.totalMinorNetworks}`],['Routing nodes',a.totalNodes],['Gate endpoints',a.totalGates],['Edge Pairs',a.totalEdgePairs],['Components / with Gates',`${a.components} / ${a.gateComponents}`],['Largest component (nodes)',a.largestComponent],['Largest component (Gates)',a.largestGateComponent],['Connected Gate pairs',pct(a.connectivity)],['Average / max hops',`${a.averageHops.toFixed(1)} / ${a.maximumHops}`],['Isolated active Gates',a.isolatedGates],['Critical nodes / pairs',`${a.criticalNodes.length} / ${a.criticalPairs.length}`],['Source: reachable',statusCounts.reachable+statusCounts['near limit']],['Source: needs staging',statusCounts['requires staging']],['Source: unreachable',statusCounts.unreachable],['Source: inactive',statusCounts.inactive]];
  $('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><b>${value}</b><span>${label}</span></div>`).join('');
  const row=a.hopAnalysis.find(r=>r.hop===hop()),recommended=a.recommendedHop;
  $('recommendation').textContent=`Recommended minimum: ${recommended??'none within 4–80'} hops, targeting ${pct(a.recommendationTarget)} of connected Gate pairs (provisional). ${row?`At ${hop()} hops: ${pct(row.reachability)} of all active pairs are directly reachable.`:''} This does not repair disconnected components.`;
  $('hopRows').innerHTML=a.hopAnalysis.map(r=>`<tr class="${r.hop===hop()?'current':''}"><td>${r.hop}</td><td>${pct(r.reachability)}</td><td>${pct(r.connectedCoverage)}</td><td>${r.stagingPairs}</td><td>${r.isolatedGates}</td></tr>`).join('');
  const v=campaign.validation;
  const totals=havenSummary(campaign.havens);
  $('populationSummary').innerHTML=`<div class="metrics">${[['Ration capacity / day',millions(totals.totalRationCapacity)],['Ration demand / day',millions(totals.totalRationDemand)],['Sentient individuals',millions(totals.totalSentientPopulation)],['Overall occupancy',pct(totals.overallOccupancy)]].map(([label,value])=>`<div class="metric"><b>${value}</b><span>${label}</span></div>`).join('')}</div><p class="muted">Paper-test reference: ~460 million ration capacity and ~243–246 million sentients. Comparison targets, not validation requirements.</p><table><thead><tr><th>Faction</th><th>P1</th><th>P4</th><th>P16</th></tr></thead><tbody>${Object.entries(totals.byFaction).map(([f,s])=>`<tr><td>${esc(f)}</td><td>${s.P1}</td><td>${s.P4}</td><td>${s.P16}</td></tr>`).join('')}</tbody></table>`;
  $('campaignReport').innerHTML=`<p class="${v.pass?'good':'bad'}">${v.pass?'PASS':'FAIL'} · ${esc(campaign.seed)}</p><p>SGC: ${campaign.sgcGateId===null?'no valid start':`Gate ${campaign.sgcGateId}`}</p><pre>${esc(JSON.stringify(v,null,2))}</pre>`;
  $('failureSummary').textContent=`Disabled: ${failures.nodes.size} nodes · ${failures.pairs.size} Edge Pairs · ${failures.gates.size} Gates. Seeded inactive pairs: ${geometry.edgePairs.filter(p=>!p.active).length}.`;
}
function renderTrade() {
  $('tradePanel').hidden=!layers.trade;
  const origin=selected?.type==='gate'?records.find(a=>a.id===selected.id):null;
  $('tradeDetails').innerHTML=!origin?.haven?'<p>Select a Haven to inspect potential resource partners.</p>':
    `<p>Potential partners for ${esc(origin.haven.name)}. ${TRADE_RULES.tradesPerHavenPerHour} trade per Haven per hour; no cargo is scheduled.</p><div class="scroll">${trades.map(t=>{const other=records.find(a=>a.id===t.gateId)?.haven;return `<div class="trade-partner"><b>${esc(other?.name??'Known Haven')} · Gate ${t.gateId}</b><p>${t.exchanges.map(e=>`${e.from===origin.haven.id?'Export':'Import'} ${e.resource}`).join(' · ')}</p><span class="${t.route?.reachable?'good':'muted'}">${t.route?`${esc(t.route.reason)}${t.route.hops!==undefined?` · ${t.route.hops} hops`:''}`:'Route availability unknown'}</span></div>`;}).join('')||'<p>No complementary resource profiles in the available records.</p>'}</div>`;
}
function renderLegend() {
  const entries=god()&&layers.reach?Object.entries(colors).slice(0,5):[['Known location','#94a3b8']];
  if(layers.factions) entries.push(...FACTIONS.map(f=>[f,colors[f]]));
  if(god()&&layers.reach&&layers.factions) entries.push(['Reachability ring = staging','#f97316']);
  if(layers.threat) entries.push(['Infected','#ef4444']);
  if(layers.populationScale) entries.push(['Haven population scale: larger dot = more sentients','#cbd5e1']);
  if(layers.capacityScale) entries.push(['Haven capacity scale: P1 < P4 < P16','#a78bfa']);
  if(layers.resources) {entries.push(...Object.entries(resourceColors).map(([s,c])=>[`${arrows[s]} ${$('resourceFilter').value}: ${s}`,c]));entries.push(['Gold ● balanced / ↑ all surplus','#fbbf24']);}
  if(layers.trade) entries.push([god()?'Dashed cyan: reachable potential Haven trade':'Trade routing unknown in SGC records','#67e8f9']);
  $('legend').innerHTML=entries.map(([label,color])=>`<span><i class="legend-dot" style="background:${color}"></i>${label}</span>`).join('');
}
function project(point) {
  let [x,y,z]=point.map((v,i)=>v-focus[i]);
  if($('projection').value==='side') [y,z]=[z,y];
  else if($('projection').value==='3d') {const xx=x*Math.cos(yaw)-y*Math.sin(yaw),yy=x*Math.sin(yaw)+y*Math.cos(yaw);x=xx;y=yy*Math.cos(pitch)-z*Math.sin(pitch);z=yy*Math.sin(pitch)+z*Math.cos(pitch);}
  const scale=Math.min(canvas.clientWidth,canvas.clientHeight)/(geometry.config.majorScale*Math.sqrt(3)*(geometry.config.majorRadius+1)*2.2)*zoom;
  return [canvas.clientWidth/2+x*scale,canvas.clientHeight/2-y*scale,z];
}
function stroke(points,color,width=1,dashed=false) {
  ctx.beginPath();points.forEach((p,i)=>{const [x,y]=project(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dashed?[4,4]:[]);ctx.stroke();ctx.setLineDash([]);
}
function dot(point,r,color,type,id,ring=false) {
  const [x,y,z]=project(point);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.strokeStyle=color;ring?ctx.stroke():ctx.fill();
  if(type) hitTargets.push({x,y,z,r:Math.max(7,r),type,id});return [x,y];
}
function draw() {
  if(!geometry)return;
  const dpr=window.devicePixelRatio||1,w=canvas.clientWidth,h=canvas.clientHeight;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);hitTargets=[];
  if(god()) {
    const radius=geometry.config.minorRadius*Math.sqrt(3);
    if(layers.plane) {const r=geometry.config.majorScale*(geometry.config.majorRadius+1)*2;stroke([[-r,-r,0],[r,-r,0],[r,r,0],[-r,r,0],[-r,-r,0]],'#173249');}
    for(const region of geometry.minorNetworks) {
      if(layers.regions) {const pts=Array.from({length:7},(_,i)=>{const a=(i*60+30)*Math.PI/180,r=geometry.config.majorScale;return [region.center[0]+Math.cos(a)*r,region.center[1]+Math.sin(a)*r,0];});stroke(pts,'#203142');}
      if(layers.discs) {
        const pts=Array.from({length:41},(_,i)=>discPoint(region,Math.cos(i*Math.PI/20)*radius,Math.sin(i*Math.PI/20)*radius));
        stroke(pts,'#47709188');dot(region.center,3,'#477091','region',region.id,true);
        const [x,y]=project(region.center);ctx.fillStyle='#6b879a';ctx.font='10px system-ui';ctx.fillText(`M${region.id}`,x+5,y-5);
      }
      if(layers.normals) {stroke([discPoint(region,0,0),discPoint(region,0,0,3)],'#38bdf8');for(const z of [-region.thickness,region.thickness])stroke(Array.from({length:25},(_,i)=>discPoint(region,Math.cos(i*Math.PI/12)*radius,Math.sin(i*Math.PI/12)*radius,z)),'#38bdf833');}
    }
    if(layers.candidates||layers.routing) {
      const activeEdges=new Set(analysis.runtime.adjacency.flatMap(list=>list.map(([,id])=>id)));
      for(const e of geometry.edges) if(layers.candidates||activeEdges.has(e.id)) stroke([geometry.nodes[e.a].physical,geometry.nodes[e.b].physical],activeEdges.has(e.id)?'#38536780':'#813c4540',.7);
    }
    if(layers.logical) for(const n of geometry.nodes) {const p=[Math.sqrt(3)*(n.logical.q+n.logical.r/2),1.5*n.logical.r,n.logical.z];dot(p,1,'#4f677055');}
    if(layers.nodes||layers.reserved) for(const n of geometry.nodes) if(layers.nodes||n.state!=='NORMAL') dot(n.physical,n.kind==='EDGE'?3:1.6,failures.nodes.has(n.id)?'#ef4444':n.state!=='NORMAL'?'#b68e55':'#658196','node',n.id);
    if(layers.pairs) for(const p of geometry.edgePairs) {
      const usable=!failures.pairs.has(p.id)&&p.active&&p.edgeIds.every(id=>{const e=geometry.edges[id];return e.distance<=geometry.config.maxLinkDistance&&!failures.nodes.has(e.a)&&!failures.nodes.has(e.b);});
      for(const id of p.edgeIds) {const e=geometry.edges[id];stroke([geometry.nodes[e.a].physical,geometry.nodes[e.b].physical],usable?'#e9b55d99':'#ef444477',1.5,!usable);}
      const midpoint=geometry.nodes[p.a].physical.map((v,i)=>(v+geometry.nodes[p.b].physical[i])/2);dot(midpoint,3,usable?'#e9b55d':'#ef4444','pair',p.id,true);
    }
    if(layers.route&&currentRoute?.nodes.length) stroke(currentRoute.nodes.map(id=>geometry.nodes[id].physical),'#f8fafc',2.5);
  }
  const shown=records.filter(a=>a.physical&&(!$('factionFilter').value||a.haven?.faction===$('factionFilter').value)&&(!layers.resources||matchesResource(a.haven,$('resourceFilter').value,$('resourceState').value))).sort((a,b)=>project(a.physical)[2]-project(b.physical)[2]);
  if(layers.trade&&god()) {
    const origin=shown.find(a=>a.id===selected?.id&&selected.type==='gate');
    if(origin)for(const t of trades) {const dest=shown.find(a=>a.id===t.gateId);if(dest&&t.route?.reachable)stroke([origin.physical,dest.physical],'#67e8f980',1.5,true);}
  }
  for(const a of shown) {
    if(layers.threat&&a.threat) {dot(a.physical,16,'#ef44442e');dot(a.physical,12,'#ef4444','gate',a.id,true);}
    let color=god()&&layers.reach?colors[reach[a.id]]:'#94a3b8';
    if(layers.factions&&a.haven?.faction)color=colors[a.haven.faction];
    const showPopulation=layers.populationScale&&a.haven&&Number.isFinite(a.haven.sentientPopulation);
    const populationRadius=showPopulation
      ?3.5+(MAX_POPULATION_RADIUS-3.5)*Math.sqrt(Math.min(MAX_HAVEN_POPULATION,Math.max(0,a.haven.sentientPopulation))/MAX_HAVEN_POPULATION)
      :a.id===source?5:3.5;
    if(layers.gates||showPopulation) dot(a.physical,populationRadius,color,'gate',a.id);
    if(layers.havens&&a.haven) {const [x,y]=project(a.physical);ctx.strokeStyle=layers.factions&&a.haven.faction?colors[a.haven.faction]:'#d1d5db';ctx.lineWidth=1;const size=6;ctx.strokeRect(x-size,y-size,size*2,size*2);hitTargets.push({x,y,r:size+3,type:'gate',id:a.id});}
    if(layers.capacityScale&&a.haven?.scale) {
      const capacityRadius={P1:9,P4:13,P16:18}[a.haven.scale]??9;
      ctx.lineWidth=4;
      const [x,y]=dot(a.physical,capacityRadius,'#ffffff18','gate',a.id,true);
      if(Number.isFinite(a.haven.occupancy)) {ctx.beginPath();ctx.arc(x,y,capacityRadius,-Math.PI/2,-Math.PI/2+2*Math.PI*a.haven.occupancy);ctx.strokeStyle='#f8fafc';ctx.lineWidth=2;ctx.stroke();}
      ctx.lineWidth=1;
    }
    if(layers.resources&&a.haven?.resources) {
      const state=a.haven.resources[$('resourceFilter').value],special=balanceIndicator(a.haven.resources),[x,y]=project(a.physical);
      ctx.font='bold 15px system-ui';ctx.fillStyle=special?'#fbbf24':resourceColors[state];ctx.fillText(special==='golden balance'?'●':special==='golden surplus'?'↑':arrows[state],x+9,y+4);
    }
    if(god()&&layers.reach&&layers.factions&&a.haven?.faction) {
      const staging=reach[a.id]==='requires staging';
      const [x,y]=project(a.physical);ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.strokeStyle=colors[reach[a.id]];ctx.lineWidth=staging?2.5:2;ctx.setLineDash(staging?[4,3]:[]);ctx.stroke();ctx.setLineDash([]);
    }
    if(selected?.type==='gate'&&selected.id===a.id||hovered?.type==='gate'&&hovered.id===a.id) {const [x,y]=dot(a.physical,10,'#ffffff',null,null,true);ctx.font='11px system-ui';ctx.fillStyle='#ffffff';ctx.fillText(`Gate ${a.id}`,x+13,y-8);}
    if(god()&&layers.addresses) {const [x,y]=project(a.physical);ctx.font='9px system-ui';ctx.fillStyle='#9ca3af';ctx.fillText(addressText(a.address),x+5,y+10);}
  }
  if(god()&&selected&&selected.type!=='gate') {const p=selected.type==='node'?geometry.nodes[selected.id].physical:selected.type==='region'?geometry.minorNetworks[selected.id].center:geometry.nodes[geometry.edgePairs[selected.id].a].physical;dot(p,10,'#fff',null,null,true);}
}
function select(object,show=false) {
  selected=object;hovered=null;
  if(show&&object.type==='gate') {const record=records.find(a=>a.id===object.id);if(record?.physical){focus=[...record.physical];zoom=2.4;}}
  refresh();
}
$('dialing').onclick=e=>{const button=e.target.closest('[data-select],[data-show]');if(button&&!button.disabled)select({type:'gate',id:Number(button.dataset.select??button.dataset.show)},'show'in button.dataset);};
$('dialing').onpointerover=e=>{const row=e.target.closest('[data-gate]');if(row){hovered={type:'gate',id:Number(row.dataset.gate)};renderDetails();draw();}};
$('dialing').onpointerleave=()=>{hovered=null;renderDetails();draw();};
$('search').oninput=renderDialing;
$('source').onchange=()=>{source=Number($('source').value);refresh();};
$('hop').oninput=()=>{if(!geometry)return;campaign.validation=validateCampaign(geometry,campaign,hop(),analysis,failures);refresh();};
$('mode').onchange=()=>{focus=[0,0,0];zoom=1;refresh();status(god()?'God View · development diagnostics':'SGC View · known records only');};
$('projection').onchange=draw;
$('resetCamera').onclick=()=>{yaw=.3;pitch=.65;zoom=1;focus=[0,0,0];draw();};
$('layers').onchange=e=>{if(e.target.dataset.layer){layers[e.target.dataset.layer]=e.target.checked;renderTrade();renderLegend();draw();}};
$('resourceFilter').onchange=$('resourceState').onchange=()=>{renderLegend();draw();};
$('factionFilter').onchange=draw;
$('lock').onchange=()=>{updateLock();renderBatch();};
$('generate').onclick=()=>requestAnalysis(true);
const randomSeed=prefix=>`${prefix}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
$('randomGeometry').onclick=()=>{$('geometrySeed').value=randomSeed('geometry');requestAnalysis(true);};
function campaignAction(randomize=false) {
  if(busy||!geometry)return;
  if(randomize)$('campaignSeed').value=randomSeed('campaign');
  try {makeCampaign();refresh();status(`Campaign ${campaign.seed}: ${campaign.validation.pass?'PASS':'FAIL · see validation warnings'}`);}catch(e){status(e.message);}
}
$('campaign').onclick=()=>campaignAction();$('randomCampaign').onclick=()=>campaignAction(true);
$('toggleFailure').onclick=()=>{
  if(busy||!selected||selected.type==='region')return;
  const set=selected.type==='gate'?failures.gates:selected.type==='node'?failures.nodes:failures.pairs;
  set.has(selected.id)?set.delete(selected.id):set.add(selected.id);requestAnalysis();
};
$('failure').onclick=()=>{if(busy)return;failures=failureTest(geometry,$('failureType').value,$('failureSeed').value,analysis);requestAnalysis();};
$('restore').onclick=()=>{if(busy)return;failures=emptyFailures();requestAnalysis();};
function download(name,data) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('export').onclick=()=>download('world-map-snapshot.json',{version:1,geometry,campaign,hopLimit:hop(),failures:Object.fromEntries(Object.entries(failures).map(([k,v])=>[k,[...v]])),analysis:report(analysis)});
function renderBatch() {
  const sort=$('batchSort').value,direction=['connectivity','resilience'].includes(sort)?-1:1;
  const rows=batchRows.filter(r=>r.connectivity>=Number($('batchMin').value)/100).sort((a,b)=>((a[sort]??Infinity)-(b[sort]??Infinity))*direction);
  $('batchResults').innerHTML=rows.map(r=>`<button class="batch-row" data-seed="${esc(r.seed)}" ${$('lock').checked?'disabled':''}>${esc(r.seed)} · ${pct(r.connectivity)} · ${r.components} components · ${r.recommendedHop??'—'} hops<br>Mean ${r.averageHops.toFixed(1)} / max ${r.maximumHops} · ${r.chokepoints} critical nodes · resilience ${pct(r.resilience)}</button>`).join('');
}
$('batch').onclick=()=>{
  const count=Number($('batchCount').value);if(!Number.isInteger(count)||count<1||count>10000){status('Batch count must be 1–10000.');return;}
  batchRows=[];$('batch').disabled=true;$('cancelBatch').disabled=false;$('exportBatch').disabled=true;
  batchWorker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});
  batchWorker.onmessage=({data})=>{
    if(data.type==='batch-row'){batchRows.push(data.row);if(god())status(`Batch: ${data.index}/${data.count}`);$('exportBatch').disabled=false;renderBatch();}
    else {batchWorker.terminate();$('batch').disabled=false;$('cancelBatch').disabled=true;if(god())status(data.type==='error'?data.message:`Batch complete: ${batchRows.length} seeds`);}
  };
  batchWorker.onerror=e=>{status(`Batch error: ${e.message}`);batchWorker.terminate();$('batch').disabled=false;$('cancelBatch').disabled=true;};
  batchWorker.postMessage({type:'batch',count,prefix:$('batchPrefix').value,config:configuration()});
};
$('cancelBatch').onclick=()=>{batchWorker?.terminate();$('batch').disabled=false;$('cancelBatch').disabled=true;status(`Batch stopped · ${batchRows.length} completed rows retained`);};
$('batchSort').onchange=$('batchMin').oninput=renderBatch;
$('batchResults').onclick=e=>{const row=e.target.closest('[data-seed]');if(row&&!busy&&!$('lock').checked){const candidate=batchRows.find(r=>r.seed===row.dataset.seed);for(const input of document.querySelectorAll('[data-config]'))input.value=candidate.config[input.dataset.config]??DEFAULT_ADDRESS_CODEC[input.dataset.config];$('geometrySeed').value=row.dataset.seed;requestAnalysis(true);}};
$('exportBatch').onclick=()=>download('world-map-batch.json',batchRows);
let drag=null;
function hit(e) {const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;return [...hitTargets].reverse().find(p=>Math.hypot(x-p.x,y-p.y)<=p.r)??null;}
canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);};
canvas.onpointermove=e=>{
  if(drag) {if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4)drag.moved=true;if($('projection').value==='3d'){yaw+=(e.clientX-drag.x)*.008;pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch+(e.clientY-drag.y)*.008));}drag.x=e.clientX;drag.y=e.clientY;draw();}
  else {const target=hit(e);if(target?.type!==hovered?.type||target?.id!==hovered?.id){hovered=target?{type:target.type,id:target.id}:null;renderDetails();document.querySelectorAll('.gate-row.hover').forEach(el=>el.classList.remove('hover'));if(hovered?.type==='gate')document.querySelector(`[data-gate="${hovered.id}"]`)?.classList.add('hover');draw();}}
};
canvas.onpointerup=e=>{if(drag&&!drag.moved){const target=hit(e);if(target)select({type:target.type,id:target.id});}drag=null;};
canvas.onpointercancel=()=>{drag=null;};
canvas.onpointerleave=()=>{if(!drag){hovered=null;renderDetails();draw();}};
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(8,zoom*Math.exp(-e.deltaY*.001)));draw();},{passive:false});
new ResizeObserver(draw).observe($('mapFrame'));
if(location.protocol==='file:')status('Serve the repository over HTTP: python -m http.server 8000');else requestAnalysis(true);
