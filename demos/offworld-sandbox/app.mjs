import {baseCapacity,loadBase,saveBase,reserveRecovery} from '../shared/js/base-configuration.mjs?v=dialogue-doors-1';
import {recipeChoices,recipeAlternatives} from '../shared/offworld/field.mjs?v=dialogue-doors-1';
let baseConfig,roomSchemas;
import {finalizeDebrief} from '../shared/offworld/recovery.mjs?v=dialogue-doors-1';
import {lootHtml,debriefHtml} from './recovery-ui.mjs?v=dialogue-doors-1';
import {outcomesHtml} from './outcomes.mjs?v=dialogue-doors-1';
import {requirementsHtml,blockerText} from './requirements.mjs?v=dialogue-doors-1';
import {engage,retreat,localCombat,missionResults} from '../shared/offworld/campaign.mjs?v=dialogue-doors-1';
import {cachedLoadouts,personnelSaver} from '../shared/offworld/personnel-save.mjs?v=dialogue-doors-1';
import {deploymentRoster} from '../shared/offworld/roster.mjs?v=dialogue-doors-1';
import {compileMission} from '../shared/offworld/mission.mjs?v=dialogue-doors-1';
import {createRuntime,chooseGate,advanceTime,exits,move,returnRoute,redial,extract,log} from '../shared/offworld/runtime.mjs?v=dialogue-doors-1';
import {activeWork,executionProfile,movementWork,recipeEligibility,startWork,cancelWork,stationUnit,observationEligibility,targetLocal} from '../shared/offworld/field.mjs?v=dialogue-doors-1';
import {setupRoster,esc} from './setup.mjs?v=dialogue-doors-1';
import {renderMap,partyCard,title,colors,icons} from './map.mjs?v=dialogue-doors-1';
const $=id=>document.getElementById(id);
const savePersonnel=personnelSaver($('personnelSaveStatus'));
const clock=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;
let raw,catalog,definition,presets,state,deployment,startTime,selectedParty,busy=false,epoch=0,selectedRecipe=null,pendingMove=null;
let camera={x:0,y:0,w:700,h:550},dragged=false;
const pointers=new Map();let gesture;
const load=async path=>{const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error(`Could not load ${path}: ${response.status}`);return response.json();};
function error(e){$('error').textContent=e.message??String(e);$('error').hidden=false;}
function guard(fn){return async(...args)=>{if($('error'))$('error').hidden=true;try{return await fn(...args);}catch(e){error(e);}};}
function renderSetup(){
  $('briefing').textContent=definition.mission.briefing.playerText;document.querySelector('h1').textContent=definition.mission.title;
  $('deploymentTools').innerHTML=partyToolPanel(definition.partyTools);
  let summary=$('deploymentCapacity');if(!summary){summary=document.createElement('p');summary.id='deploymentCapacity';$('deploymentTools').before(summary);}const capacity=baseCapacity(baseConfig,roomSchemas);summary.textContent=`Base capacity available: Holding ${capacity.HOLDING.free}/${capacity.HOLDING.total} · Receiving ${capacity.RECEIVING.free}/${capacity.RECEIVING.total}`;
  selectedParty=setupRoster($('roster'),presets,catalog,$('deploy'),savePersonnel);
}
function partyToolPanel(tools){return `<h3>Party equipment</h3>${tools.length?tools.map(t=>`<div class="party-tool"><strong>${esc(t.label)}</strong><small>${esc(t.custody??'Mission-issued')} · ${t.damaged?'Damaged':t.chargesRemaining===null?'Ready · reusable':`${t.chargesRemaining} charges`}${state?.activeWork.some(w=>w.toolInstanceId===t.toolInstanceId&&['MOVING_TO_TARGET','EXECUTING'].includes(w.status))?' · In use':''}</small></div>`).join(''):'<p class="muted">No mission-issued equipment.</p>'}<small>Shared by the party; separate from personal Tool slots.</small>`;}
function applyCamera(){$('map').setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.w} ${camera.h}`);}
function focus(){
  if(!state)return;const cells=definition.indexes.stages[state.currentStageId].cells;
  const cx=(Math.min(...cells.map(c=>c.x))+Math.max(...cells.map(c=>c.x))+1)*50,cy=(Math.min(...cells.map(c=>c.y))+Math.max(...cells.map(c=>c.y))+1)*50;
  const aspect=Math.max(.6,$('map').clientWidth/Math.max(1,$('map').clientHeight)),h=480;
  camera={x:cx-h*aspect/2,y:cy-h/2,w:h*aspect,h};applyCamera();drawMap();
}
function zoom(f){const w=Math.max(180,Math.min(1800,camera.w*f));f=w/camera.w;camera.x+=(camera.w-w)/2;camera.y+=(camera.h-camera.h*f)/2;camera.w=w;camera.h*=f;applyCamera();if(!pointers.size)drawMap();}
function drawMap(){if(!state||pointers.size)return;$('map').innerHTML=renderMap(definition,state,Math.max(13,26*camera.w/Math.max(1,$('map').clientWidth)),!busy);applyCamera();}
function visibleObservations(){return definition.observations.filter(o=>state.observationStates[o.observationId].status==='PRESENTED'&&(o.stageId===state.currentStageId||(o.fromStageIds??[]).includes(state.currentStageId)));}
function recipeButton(r){const e=recipeEligibility(definition,state,r);if(e.status==='HIDDEN'||e.status==='COMPLETED'||e.blocker==='INVALID_TARGET_STATE')return '';return `<button data-recipe="${esc(r.recipeInstanceId)}" class="recipe-button" style="--profession:${colors[r.profession]??'#879b9b'}" aria-disabled="${e.status!=='AVAILABLE'}"><b>${icons[r.actionType]??'…'} ${esc(title(r.actionType??r.archetypeId.replace('recipe_','').replaceAll('_',' ')))}</b><small>${esc(r.profession??'Deferred')} ${r.minimumTier??''} · ${esc(e.blocker??e.status)}</small></button>`;}
function renderContext(){
  const stage=definition.indexes.stages[state.currentStageId],st=state.stageStates[state.currentStageId];
  $('context').innerHTML=definition.incidents.filter(i=>i.stageId===state.currentStageId).map(i=>{const st=state.incidentStates[i.incidentId];return `<section class="incident-card"><strong>${esc(title(i.incidentId.replace('incident-','')))}</strong><p>${esc(st.state)}${i.kind==='COMBAT'?` · round ${st.round}`:''}</p>${i.kind==='COMBAT'&&st.state==='DORMANT'?`<button data-engage="${i.incidentId}">Engage hostiles</button>`:''}${i.kind==='COMBAT'&&st.state==='ACTIVE'&&i.allowRetreat?`<button data-retreat="${i.incidentId}">Disengage</button>`:''}${i.kind==='COMBAT'?i.participantIds.map(id=>`<small>${esc(definition.indexes.instances[id].playerLabel)} · ${esc(state.instanceStates[id].combatState)}</small>`).join('<br>'):''}</section>`;}).join('')+`<p>${esc(title(stage.stageId))}<br><small>${st.visibility} · ${st.securityState}</small></p>`+
    visibleObservations().map(o=>`<button class="observation-card" data-observation="${esc(o.observationId)}" style="--profession:${colors[o.profession]}"><small>${esc(o.profession)} OBSERVATION</small>${esc(o.text)}</button>`).join('')+
    definition.interactionTargets.filter(t=>targetLocal(definition,state,t)).map(t=>{
      const recipes=t.recipeInstanceIds.map(id=>definition.indexes.recipes[id]).filter(r=>recipeEligibility(definition,state,r).status!=='HIDDEN');
      if(!recipes.length)return '';return `<section class="target-actions"><h3>${esc(t.transitionId?'Door controls':definition.indexes.instances[t.instanceId].playerLabel)}</h3>${recipeChoices(definition,state,recipes).map(recipeButton).join('')}</section>`;
    }).join('')+`<p class="muted">${exits(definition,state).map(e=>`${e.direction}: ${e.state==='LOCKED'?'locked':e.state==='CLOSED'?'closed routine door':'open passage'}`).join('<br>')}</p>`;
}
function renderDebug(){
  if(!definition)return;
  const data={runtime:state,definitions:definition,log:state?.actionLog,events:state?.emittedEvents,ledger:state?.resultEvents,appearance:(state?.units??presets.units).map(u=>({unitId:u.unitId,appearance:u.appearance})),observations:state?definition.observations.map(o=>({...o,detection:state.observationStates[o.observationId],eligibility:observationEligibility(definition,state,o)})):[]};
  $('debugContent').textContent=JSON.stringify(data[$('debugView').value]??{},null,2);
}
function render(){
  $('setup').hidden=!!state;$('mission').hidden=!state;if(!state)return;
  const primary=definition.objectives.find(o=>o.priority==='PRIMARY'&&state.objectiveStates[o.objectiveId].state==='ACTIVE')??definition.objectives.filter(o=>o.priority==='PRIMARY'&&state.objectiveStates[o.objectiveId].state!=='HIDDEN').at(-1);
  $('objective').textContent=primary?`${primary.playerText} — ${state.objectiveStates[primary.objectiveId].state}`:'Explore';
  $('gateClock').textContent=state.gateState.connection==='CLOSED'?'CLOSED':`${clock(state.gateState.elapsedSeconds)} / 37:00`;
  $('gateOccupancy').textContent=state.gateState.sgcOccupied?'SGC Gate occupied':'SGC Gate available';$('sgcClock').textContent=state.sgcCurrentTime.slice(11,19);$('elapsed').textContent=`Mission elapsed ${clock(state.missionElapsedSeconds)}`;
  const ended=state.status==='EXTRACTED';$('debrief').hidden=!ended;document.querySelector('.workspace').hidden=ended;$('mission').classList.toggle('mission-ended',ended);if(ended)$('debrief').innerHTML=debriefHtml(definition,state,baseCapacity(baseConfig,roomSchemas));
  $('lootTracker').innerHTML=lootHtml(definition,state);
  $('partyTools').innerHTML=partyToolPanel(state.partyTools);
  $('stageTitle').textContent=title(state.currentStageId);$('party').innerHTML=state.units.map(partyCard).join('');
  for(const button of $('party').querySelectorAll('[data-station]')){const u=state.units.find(u=>u.unitId===button.dataset.station);button.disabled=state.status!=='ACTIVE'||state.gateState.choicePending||u.currentStageId!==state.currentStageId||state.stageStates[state.currentStageId].securityState!=='SECURE'||activeWork(state).some(w=>w.actorId===u.unitId);}
  $('objectives').innerHTML=definition.objectives.filter(o=>o.objectiveId!==primary?.objectiveId&&state.objectiveStates[o.objectiveId].state!=='HIDDEN').map(o=>`<li>${esc(o.playerText)} — ${state.objectiveStates[o.objectiveId].state}</li>`).join('');
  $('actionResults').innerHTML=outcomesHtml(definition,state);
  renderContext();$('gateChoice').hidden=!state.gateState.choicePending;
  const inactive=state.status!=='ACTIVE'||busy||state.gateState.choicePending;
  for(const id of ['return','wait','closeLater','redial','extract'])$(id).disabled=inactive;
  $('return').disabled||=state.currentStageId===definition.gate.stageId;
  $('closeLater').disabled||=state.gateState.connection==='CLOSED';$('redial').disabled||=state.currentStageId!==definition.gate.stageId||state.gateState.connection!=='CLOSED';$('extract').disabled||=state.currentStageId!==definition.gate.stageId||state.gateState.connection!=='OPEN_TO_SGC';
  $('work').innerHTML=activeWork(state).map(w=>`<div class="work-card"><span>${esc(state.units.find(u=>u.unitId===w.actorId).name)} · ${esc(definition.indexes.recipes[w.recipeId].actionType)}</span><progress max="${w.durationSeconds}" value="${w.elapsedSeconds}"></progress><button data-cancel-work="${w.workId}">Cancel</button></div>`).join('');
  if($('actionDialog').open&&selectedRecipe)inspectRecipe(selectedRecipe);
  drawMap();if($('designer').open)renderDebug();
}
function inspectRecipe(id){
  if(busy||state?.status!=='ACTIVE')return;
  selectedRecipe=id;const r=definition.indexes.recipes[id],e=recipeEligibility(definition,state,r);if(e.status==='HIDDEN')return;
  $('actionTitle').textContent=title(r.actionType??'Deferred action');$('actionReason').textContent=blockerText[e.blocker]??e.blocker??`${r.profession} ${r.minimumTier||''} · ${executionProfile(state,r).durationMinutes} simulated minutes · ${r.chargeCost??0} Tool charge(s)`;
  $('actionOutcomePreview').textContent=(r.outcomeText??'')+(executionProfile(state,r).preparation?' Interview preparation active: 1 minute instead of 3.':'');
  $('actionRequirements').innerHTML=recipeAlternatives(definition,r).map(v=>requirementsHtml(definition,state,v)).join('');
  const previousActor=$('actor').value;
  const alternatives=recipeAlternatives(definition,r);const ids=[...new Set(alternatives.flatMap(v=>recipeEligibility(definition,state,v).candidates.map(c=>c.actorId)))];$('actor').innerHTML=ids.map(id=>`<option value="${esc(id)}">${esc(state.units.find(u=>u.unitId===id).name)}</option>`).join('');
  if(ids.includes(previousActor))$('actor').value=previousActor;
  $('actor').disabled=!ids.length;$('startAction').disabled=!ids.length;if(!$('actionDialog').open)$('actionDialog').showModal();
}
async function moveAnimated(id){
  if(busy)return;
  if(movementWork(state).length){pendingMove=id;$('leaveDialog').showModal();return false;}
  const mine=epoch;busy=true;render();$('activity').textContent='Party moving…';
  try{move(definition,state,id);render();focus();await new Promise(r=>setTimeout(r,280));return true;}
  finally{if(mine===epoch){busy=false;$('activity').textContent='';render();}}
}
function closeDialogs(){for(const d of document.querySelectorAll('dialog'))d.close();selectedRecipe=null;pendingMove=null;}
$('debrief').onchange=()=>{const cap=baseCapacity(baseConfig,roomSchemas),cost=kind=>[...$('debrief').querySelectorAll(`[data-recovery="${kind}"]:checked`)].reduce((n,input)=>n+Number(input.dataset.cost),0);const holding=cost('holding'),receiving=cost('receiving');$('recoveryCapacity').textContent=`Selected: ${holding}/${cap.HOLDING.free} Holding slots; ${receiving}/${cap.RECEIVING.free} Receiving capacity.`;$('confirmRecovery').disabled=holding>cap.HOLDING.free||receiving>cap.RECEIVING.free;};
$('debrief').onclick=guard(async event=>{if(event.target.id!=='confirmRecovery')return;const selected=kind=>[...$('debrief').querySelectorAll(`[data-recovery="${kind}"]:checked`)].map(input=>input.value);const draft=structuredClone(state);finalizeDebrief(definition,draft,{holdingIds:selected('holding'),receivingIds:selected('receiving')});baseConfig=await loadBase();const reserved=reserveRecovery(baseConfig,roomSchemas,draft.debrief.requests,state.runId);baseConfig=await saveBase(reserved);state=draft;render();});
$('deploy').onclick=guard(()=>{deployment=selectedParty();startTime=$('startTime').value+'Z';state=createRuntime(definition,deployment,startTime);state.runId=crypto.randomUUID();epoch++;render();focus();});
$('keepGate').onclick=guard(()=>{chooseGate(definition,state,true);render();});
$('closeGate').onclick=$('closeLater').onclick=guard(()=>{chooseGate(definition,state,false);render();});
$('wait').onclick=guard(()=>{advanceTime(definition,state,180);log(state,'Waited 3 simulated minutes.');render();});
$('redial').onclick=guard(()=>{redial(definition,state);render();});$('extract').onclick=guard(async()=>{baseConfig=await loadBase();extract(definition,state);render();});
$('resetButton').onclick=guard(async()=>{if(state?.runId){const current=await loadBase();const reservations=current.reservations.filter(r=>!r.key.startsWith(state.runId+':'));baseConfig=reservations.length===current.reservations.length?current:await saveBase({...current,reservations});}epoch++;busy=false;closeDialogs();$('activity').textContent='';if(state){state=createRuntime(definition,deployment,startTime);state.runId=crypto.randomUUID();render();focus();}else renderSetup();});
$('setupButton').onclick=guard(()=>{epoch++;busy=false;state=null;closeDialogs();$('activity').textContent='';renderSetup();render();});
$('return').onclick=guard(()=>{const route=returnRoute(definition,state);$('routeText').textContent=route===null?'No known traversable route.':`Shortest known route: ${route.length} Stage transitions. Stationed Units remain where assigned.`;$('confirmReturn').disabled=!route?.length;$('routeDialog').showModal();});
$('cancelReturn').onclick=()=>$('routeDialog').close();
$('confirmReturn').onclick=guard(async()=>{const route=returnRoute(definition,state),mine=epoch;$('routeDialog').close();for(const id of route??[]){if(mine!==epoch||state.status!=='ACTIVE'||!await moveAnimated(id))break;}});
$('cancelLeave').onclick=()=>$('leaveDialog').close();
$('cancelWorkMove').onclick=guard(async()=>{for(const w of movementWork(state))cancelWork(state,w.workId);$('leaveDialog').close();await moveAnimated(pendingMove);});
$('waitWorkMove').onclick=guard(async()=>{const work=movementWork(state);advanceTime(definition,state,Math.max(0,...work.map(w=>w.durationSeconds-w.elapsedSeconds)));$('leaveDialog').close();await moveAnimated(pendingMove);});
$('startAction').onclick=guard(()=>{const actor=$('actor').value;const recipe=recipeAlternatives(definition,definition.indexes.recipes[selectedRecipe]).find(r=>recipeEligibility(definition,state,r,actor).status==='AVAILABLE');if(!recipe)throw Error('No eligible action for this Actor.');startWork(definition,state,recipe.recipeInstanceId,actor);$('actionDialog').close();render();});$('cancelAction').onclick=()=>$('actionDialog').close();
function delegated(event){
  if(dragged&&event.currentTarget===$('map'))return;
  const gateAction=event.target.closest('[data-gate-action]');if(gateAction){if(gateAction.getAttribute('aria-disabled')==='true')return;$(gateAction.dataset.gateAction).click();return;}
  const engagement=event.target.closest('[data-engage]');if(engagement){engage(definition,state,engagement.dataset.engage);render();return;}
  const withdrawal=event.target.closest('[data-retreat]');if(withdrawal){retreat(definition,state,withdrawal.dataset.retreat);render();return;}
  const recipe=event.target.closest('[data-recipe]');if(recipe){if(recipeEligibility(definition,state,definition.indexes.recipes[recipe.dataset.recipe]).blocker==='HOSTILES_PRESENT')return;inspectRecipe(recipe.dataset.recipe);return;}
  const obs=event.target.closest('[data-observation]');if(obs){const o=definition.indexes.observations[obs.dataset.observation],u=state.units.find(u=>u.unitId===state.observationStates[o.observationId].observedByUnitId);$('observationText').textContent=`${o.profession}: ${o.text}\nObserved by ${u.name}.`; $('observationDialog').showModal();return;}
  const station=event.target.closest('[data-station]');if(station){stationUnit(definition,state,station.dataset.station);render();return;}
  const cancel=event.target.closest('[data-cancel-work]');if(cancel){cancelWork(state,cancel.dataset.cancelWork);render();return;}
  const door=event.target.closest('[data-transition]');if(door&&!busy){const id=door.dataset.transition;if(state.transitionStates[id].state==='LOCKED'){const t=definition.interactionTargets.find(t=>t.transitionId===id);if(t)inspectRecipe(t.recipeInstanceIds[0]);}else return moveAnimated(id);}
}
for(const id of ['map','party','context','work'])$(id).addEventListener('click',guard(delegated));
$('map').addEventListener('keydown',guard(e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dragged=false;return delegated(e);}}));
$('closeObservation').onclick=()=>$('observationDialog').close();
$('focus').onclick=focus;$('zoomIn').onclick=()=>zoom(.8);$('zoomOut').onclick=()=>zoom(1.25);
$('map').addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.1:.9);},{passive:false});
function snapshot(){const pts=[...pointers.values()];return {x:pts.reduce((a,p)=>a+p.x,0)/pts.length,y:pts.reduce((a,p)=>a+p.y,0)/pts.length,d:pts.length>1?Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y):0};}
$('map').addEventListener('pointerdown',e=>{if(!pointers.size)dragged=false;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});gesture=snapshot();});
$('map').addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=snapshot(),dx=next.x-gesture.x,dy=next.y-gesture.y;if(Math.abs(dx)+Math.abs(dy)>2||next.d){dragged=true;$('map').setPointerCapture(e.pointerId);}if(gesture.d&&next.d)zoom(gesture.d/next.d);camera.x-=dx*camera.w/$('map').clientWidth;camera.y-=dy*camera.h/$('map').clientHeight;gesture=next;applyCamera();});
for(const name of ['pointerup','pointercancel'])$('map').addEventListener(name,e=>{pointers.delete(e.pointerId);if(pointers.size)gesture=snapshot();});
$('designerButton').onclick=()=>{renderDebug();$('designer').showModal();};$('closeDesigner').onclick=()=>$('designer').close();$('debugView').onchange=renderDebug;
$('export').onclick=()=>{const data=missionResults(definition,state);const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='offworld-mission-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('missionFile').onchange=guard(async()=>{const file=$('missionFile').files[0];if(!file)return;const next=JSON.parse(await file.text()),compiled=compileMission(next,catalog);raw=next;definition=compiled;state=null;renderSetup();render();});
// Fixed simulation increments: browser frame rate cannot alter outcomes.
setInterval(()=>{if(!state||busy||state.status!=='ACTIVE'||state.gateState.choicePending||(!activeWork(state).length&&!localCombat(definition,state).length))return;try{const work=activeWork(state),step=localCombat(definition,state).length?3:work.some(w=>w.durationSeconds>=3600)?36:18;advanceTime(definition,state,Math.min(step,...work.map(w=>w.durationSeconds-w.elapsedSeconds)));render();}catch(e){error(e);}},100);
try{baseConfig=await loadBase();roomSchemas=await load('../shared/data/rooms_schema.json');const [c,r,p,classes,names,loadouts]=await Promise.all([load('../shared/data/offworld/archetypes.json'),load('../shared/data/offworld/missing-operative-001.finalized.json'),load('../shared/data/offworld/party-presets.json'),load('../shared/data/base-classes.json'),load('../shared/data/personnel-names.json'),load('../shared/data/personnel-loadouts.json')]);loadouts.units={...loadouts.units,...cachedLoadouts()};catalog=c;raw=r;presets=deploymentRoster(classes,names,p,loadouts);definition=compileMission(raw,catalog);renderSetup();for(const [id,value] of Object.entries(cachedLoadouts())){const unit=presets.units.find(u=>u.unitId===id);if(unit)savePersonnel(unit,value);}}catch(e){error(e);$('deploy').disabled=true;}
