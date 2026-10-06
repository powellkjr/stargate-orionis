import {condition,recipeChoices} from '../shared/offworld/field.mjs?v=dialogue-doors-1';
import {statsRadar} from '../shared/portraits/stats-radar.mjs';
import {lootEntries} from '../shared/offworld/recovery.mjs?v=dialogue-doors-1';
import {renderMapSurface} from '../shared/map/renderer.mjs?v=dialogue-doors-1';
import {mapLayout} from './map-layout.mjs?v=dialogue-doors-1';
import {localCombat,engagementEligibility} from '../shared/offworld/campaign.mjs?v=dialogue-doors-1';
import {layoutActionHexes} from './hex-layout.mjs?v=dialogue-doors-1';
import {directions} from '../shared/offworld/mission.mjs?v=dialogue-doors-1';
import {portraitBustSvg} from '../shared/portraits/portrait-bust.mjs?v=dialogue-doors-1';
import {mapToken,formationSlot} from '../shared/portraits/map-token.mjs?v=dialogue-doors-1';
import {recipeEligibility,targetLocal,activeWork} from '../shared/offworld/field.mjs?v=dialogue-doors-1';
import {esc} from './setup.mjs?v=dialogue-doors-1';
import {npcAlertSvg,visibleNpc} from './npc-presentation.mjs?v=dialogue-doors-1';
export const title=id=>id.replace(/^stage-/,'').replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase());
export const colors={SOLDIER:'#d1495b',SCOUT:'#2a9d8f',TECHNICIAN:'#f4a261',SCIENTIST:'#7b6ef6',MEDIC:'#4cc9f0',DIPLOMAT:'#b8a14f',UNTRAINED:'#acb8b8'};
export const icons={KEEP_OPEN:'↔',CLOSE_GATE:'⊘',REDIAL:'◎',EXTRACT:'↑',SEND_TO_GATE:'⇧',TALK:'?',SMALL_TALK:'☷',INQUIRE:'?',COLLECT_SAFE:'↓',ENTER_DOOR_CODE:'#',ENGAGE:'⚔',INTIMIDATE:'!',NEGOTIATE:'☷',DESTROY:'×',RECOVER_WRECKAGE:'↓',HACK:'⌘',INSPECT:'⌕',COLLECT:'↓',SAMPLE:'◇',STABILIZE:'+',PROTECT:'◈',QUESTION:'?',REPAIR:'⚒',ENTER_CODE:'#',SECURE:'▣'};
export function transitionPoint(m,t){
  const d=directions[t.directionFrom],a=m.indexes.stages[t.fromStageId].cells.find(a=>m.indexes.stages[t.toStageId].cells.some(b=>b.x===a.x+d[0]&&b.y===a.y+d[1]));
  return {x:(a.x+.5+d[0]*.5)*100,y:(a.y+.5+d[1]*.5)*100};
}
export function instancePoint(m,id){
  const instance=m.indexes.instances[id],stage=m.indexes.stages[instance.stageId],local=m.instances.filter(i=>i.stageId===stage.stageId),index=local.indexOf(instance);
  const cell=stage.cells[Math.floor(index/3)%stage.cells.length];return {x:cell.x*100+22+(index%3)*27,y:cell.y*100+38};
}
export function targetPoint(m,t){return t.transitionId?transitionPoint(m,m.indexes.transitions[t.transitionId]):instancePoint(m,t.instanceId);}
export function renderMap(m,s,hexSize=22,interactionEnabled=true,damageFrames=[]){
  const knownLoot=new Map(s.status==='ACTIVE'?lootEntries(m,s).map(r=>[r.instanceId,r]):[]);
  const layout=mapLayout(m,s),point=id=>layout.points[id]??instancePoint(m,id),targetPosition=t=>t.transitionId?transitionPoint(m,m.indexes.transitions[t.transitionId]):point(t.instanceId);
  const html=['<defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#1c2931"/></pattern><pattern id="secure" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#283438"/><rect width="6" height="12" fill="#635e39"/></pattern></defs><rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#grid)"/>'];
  for(const stage of m.stages){
    const st=s.stageStates[stage.stageId];if(st.visibility==='HIDDEN'&&!st.knownShape)continue;
    const fill=st.visibility==='VISIBLE'?'#344e57':st.visibility==='PARTIAL'?'#233b43':st.securityState==='SECURE'&&st.explored?'url(#secure)':'#202b32';
    html.push(`<g class="stage-floor" data-stage="${esc(stage.stageId)}">${renderMapSurface(stage.cells,{fill,stroke:st.visibility==='VISIBLE'?'#93d8c4':'#4d6670'})}</g>`);
    const anchor=stage.cells[0];html.push(`<text x="${anchor.x*100+9}" y="${anchor.y*100+17}" fill="#bdd0d3" font-size="10">${esc(title(stage.stageId))}</text>`);
    for(const d of m.instances.filter(d=>d.stageId===stage.stageId&&condition(s,d.revealedWhen)&&(knownLoot.has(d.instanceId)||s.instanceStates[d.instanceId].custody==='LOCAL'&&(st.visibility==='VISIBLE'||st.visibility==='PARTIAL'&&d.visibleWhenPartial)))){
      const {x,y}=point(d.instanceId),isGate=d.instanceId===m.gate.instanceId;
      if(visibleNpc(m,s,d.instanceId))html.push(`<g class="npc-token" data-npc="${esc(d.instanceId)}" role="button" tabindex="0" aria-label="Inspect ${esc(d.playerLabel)}">`);
      const loot=knownLoot.get(d.instanceId);if(loot)html.push(`<g class="loot-marker" data-loot="${esc(d.instanceId)}"><title>${esc(loot.label)} · ${loot.status}</title><rect x="${x-11}" y="${y-11}" width="22" height="22" rx="3" fill="none" stroke="${loot.collected?'#8ad1ba':'#efd174'}" ${loot.collected?'stroke-dasharray="3 2"':''}/><text x="${x}" y="${y+20}" font-size="7" fill="#e5dcae" text-anchor="middle">${loot.status}</text></g>`);
      if(!isGate&&st.visibility==='VISIBLE')html.push(`<g transform="translate(${x},${y})">${npcAlertSvg(s.instanceStates[d.instanceId])}</g>`);
      html.push(isGate?`<circle cx="${x}" cy="${y}" r="22" fill="${s.gateState.connection==='OPEN_TO_SGC'?'#4ca0b5':'#18262e'}" stroke="#83bccd" stroke-width="7"/>`:`<g transform="translate(${x},${y})"><title>${esc(d.playerLabel)} ${esc(s.instanceStates[d.instanceId].combatState??'')}</title>${s.instanceStates[d.instanceId].combatState?`<circle r="10" fill="none" stroke="${['ACTIVE'].includes(s.instanceStates[d.instanceId].combatState)?'#ff817e':'#8ad1ba'}"/>`:''}${d.mapGlyph==='PERSON'?`<g transform="scale(.85)">${mapToken()}</g>`:`<rect x="-6" y="-6" width="12" height="12" rx="2" fill="${s.instanceStates[d.instanceId].operational===false?'#48514b':'#71878a'}" stroke="#a0b0b0"/>`}</g>`);
      if(visibleNpc(m,s,d.instanceId))html.push(`<circle cx="${x}" cy="${y}" r="15" fill="transparent"/></g>`);
    }
  }
  const doorObstacles=[];
  for(const t of m.transitions){
    if(!s.transitionStates[t.transitionId].known)continue;
    const {x,y}=transitionPoint(m,t),adjacent=t.fromStageId===s.currentStageId||t.toStageId===s.currentStageId,locked=s.transitionStates[t.transitionId].state==='LOCKED';
    const selectable=adjacent&&!localCombat(m,s).length&&interactionEnabled&&s.status==='ACTIVE'&&!s.gateState.choicePending;
    const mode=selectable?(locked?'locked':'selectable'):'inactive',size=selectable?46:24;
    const fill=selectable?(locked?'#aa7139':'#94e1c0'):'#19282e',stroke=selectable?(locked?'#ffd08b':'#e4fff4'):'#40565d';
    const dir=t.fromStageId===s.currentStageId?t.directionFrom:t.directionTo,arrow={NORTH:'↑',SOUTH:'↓',EAST:'→',WEST:'←'}[dir];
    doorObstacles.push({x,y,halfWidth:size/2+4,halfHeight:size/2+4});
    html.push(`<g class="door door-${mode}" data-transition-state="${mode}" ${selectable?`data-transition="${esc(t.transitionId)}" role="button" tabindex="0" aria-label="${locked?'Inspect locked doorway':'Move '+dir.toLowerCase()} ${esc(t.transitionId)}"`:''}><title>${selectable?(locked?'Locked · inspect requirements':'Move '+dir.toLowerCase()):'Inactive passage'}</title>${selectable?`<rect x="${x-27}" y="${y-27}" width="54" height="54" rx="12" fill="none" stroke="${stroke}" opacity=".35"/>`:''}<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" rx="${selectable?9:4}" fill="${fill}" stroke="${stroke}" stroke-width="${selectable?3:1}"/>${selectable?`<text x="${x}" y="${y+7}" text-anchor="middle" fill="#122f2b" font-weight="bold" font-size="23">${locked?'▣':arrow}</text>`:`<path d="M${x-4},${y}h8" stroke="#60747a"/>`}</g>`);
  }
  for(const o of m.observations){
    if(s.observationStates[o.observationId].status!=='PRESENTED'||(o.stageId!==s.currentStageId&&!(o.fromStageIds??[]).includes(s.currentStageId)))continue;
    const cell=m.indexes.stages[o.stageId].cells[0],pos=o.subjectInstanceId?point(o.subjectInstanceId):{x:cell.x*100+50,y:cell.y*100+50};
    html.push(`<g data-observation="${esc(o.observationId)}" class="observation-marker" role="button" tabindex="0" aria-label="${esc(o.profession)} observation"><title>${esc(o.text)}</title><circle cx="${pos.x}" cy="${pos.y}" r="12" fill="none" stroke="${colors[o.profession]}" stroke-width="2"/><circle cx="${pos.x}" cy="${pos.y}" r="${hexSize}" fill="transparent"/></g>`);
  }
  for(const stage of m.stages){
    if(s.stageStates[stage.stageId].visibility==='HIDDEN')continue;
    s.units.filter(u=>u.currentStageId===stage.stageId&&['ACTIVE_PARTY','STATIONED'].includes(u.partyStatus)).forEach((u,i)=>{
      const {x,y}=point(u.unitId);
      html.push(`<g transform="translate(${x},${y})"><title>${esc(u.name)} · ${u.partyStatus}</title>${u.partyStatus==='STATIONED'?'<circle r="10" fill="none" stroke="#dfcf88"/>':''}<g transform="scale(.85)">${mapToken(u.appearance)}</g></g>`);
    });
  }
  const actions=[];
  for(const t of m.interactionTargets){
    if(!targetLocal(m,s,t))continue;
    const recipes=t.recipeInstanceIds.map(id=>m.indexes.recipes[id]).filter(r=>!['HIDDEN','COMPLETED'].includes(recipeEligibility(m,s,r).status)&&recipeEligibility(m,s,r).blocker!=='INVALID_TARGET_STATE');
    for(const r of recipeChoices(m,s,recipes))actions.push({recipe:r,target:t,anchor:targetPosition(t)});
  }
  for(const incident of m.incidents.filter(i=>i.kind==='COMBAT'&&i.stageId===s.currentStageId&&s.incidentStates[i.incidentId].state==='DORMANT')){
    const id=incident.participantIds.findLast(id=>['ACTIVE','NEUTRAL'].includes(s.instanceStates[id].combatState));if(!id)continue;
    actions.push({incident,recipe:{actionType:'ENGAGE',profession:'SOLDIER'},target:{instanceId:id},anchor:point(id)});
  }
  if(s.status==='ACTIVE'&&s.currentStageId===m.gate.stageId){
    const gate=m.instances.find(i=>i.stageId===m.gate.stageId&&i.archetypeId==='stargate_standard');
    const choices=s.gateState.choicePending?[['keepGate','KEEP_OPEN'],['closeGate','CLOSE_GATE']]:s.gateState.connection==='CLOSED'?[['redial','REDIAL']]:[['closeLater','CLOSE_GATE'],['extract','EXTRACT']];
    if(gate)for(const [gateAction,actionType] of choices)actions.push({gateAction,recipe:{actionType,profession:'UNTRAINED'},target:{instanceId:gate.instanceId},anchor:point(gate.instanceId)});
  }
  const hexes=layoutActionHexes(actions,hexSize,[...doorObstacles,...layout.obstacles]);
  for(const h of hexes)html.push(`<path class="action-leader" d="M${h.anchor.x},${h.anchor.y} L${h.x},${h.y}" stroke="#789198" stroke-width="1" opacity=".55" fill="none" pointer-events="none"/>`);
  for(const {recipe:r,target:t,incident,gateAction,x,y,vertices} of hexes){
    const e=gateAction?{status:(['redial','extract'].includes(gateAction)&&s.activeWork.some(w=>['MOVING_TO_TARGET','EXECUTING'].includes(w.status)))||(gateAction==='extract'&&s.units.some(u=>u.partyStatus==='STATIONED'))?'BLOCKED':'AVAILABLE'}:incident?engagementEligibility(m,s,incident.incidentId):recipeEligibility(m,s,r),fill=colors[r.profession]??'#899391',label=t.transitionId?'Door controls':m.indexes.instances[t.instanceId].playerLabel;
    html.push(`<g class="action-hex" ${gateAction?`data-gate-action="${gateAction}"`:incident?`data-engage="${esc(incident.incidentId)}"`:`data-recipe="${esc(r.recipeInstanceId)}"`} tabindex="0" role="button" aria-label="${esc(label)}: ${esc(r.actionType??'Deferred action')} ${e.status}" aria-disabled="${e.status!=='AVAILABLE'}"><title>${esc(label)} · ${esc(r.actionType)} · ${esc(e.blocker??e.status)}</title><polygon points="${vertices.map(p=>`${p.x},${p.y}`).join(' ')}" fill="${e.status==='AVAILABLE'?fill:'#24353b'}" stroke="${fill}" stroke-width="1.5" stroke-linejoin="round"/><text x="${x}" y="${y+5}" text-anchor="middle" fill="${e.status==='AVAILABLE'?'#13232a':fill}" font-size="16">${icons[r.actionType]??'…'}</text></g>`);
  }
  for(const hit of damageFrames){
    const a=layout.points[hit.actorId],b=layout.points[hit.targetId];if(a&&b&&hit.shotVisible!==false)html.push(`<line class="combat-shot" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#ffd88d" stroke-width="2" pointer-events="none"/>`);
    if(b)html.push(`<text class="floating-damage" data-damage-target="${esc(hit.targetId)}" x="${b.x}" y="${b.y-17-hit.progress*30-(damageFrames.filter(h=>h.targetId===hit.targetId&&h.id<hit.id).length*12)}" opacity="${1-hit.progress}" text-anchor="middle" fill="#ffb099" stroke="#10191e" stroke-width="3" paint-order="stroke" font-size="14" font-weight="700" pointer-events="none">−${esc(hit.damage)}</text>`);
  }
  return html.join('');
}
export function resourceBars(u){
  return [['health','HP',u.maxHealth??100],['stamina','Stamina',100]].map(([key,label,max])=>{
    const value=Number.isFinite(u[key])?Math.max(0,u[key]):0,percent=Math.max(0,Math.min(100,value/max*100));
    return `<div class="unit-resource ${key}" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><span>${label} ${value}/${max}</span><div class="resource-track"><div class="resource-fill" style="width:${percent}%"></div></div></div>`;
  }).join('');
}
export function partyCard(u){return `<div class="party-unit" style="--profession:${esc(u.color)}"><div class="portrait">${portraitBustSvg(u.appearance)}</div><div><strong>${esc(u.name)}</strong><span class="profession">${esc(u.profession)} ${u.tier}${u.branch?` / ${esc(u.branch.id)} ${u.branch.tier}`:''}</span><br>${resourceBars(u)}<small>${u.partyStatus==='STATIONED'?`Stationed · ${esc(title(u.currentStageId))}`:esc(u.activityState)}</small>${statsRadar(u)}${[0,1].map(slot=>{const t=u.tools.find(t=>t.slot===slot);return `<small class="tool-line">${slot+1}: ${t?`${esc(t.label)} · ${t.chargesRemaining} charges`:'empty'}</small>`;}).join('')}<button class="station-button" data-station="${esc(u.unitId)}">${u.partyStatus==='STATIONED'?'Rejoin party':'Station here'}</button></div></div>`;}
