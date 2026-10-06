import {portraitBustSvg,normalizeAppearance} from '../shared/portraits/portrait-bust.mjs';
import {portraitSvg} from '../shared/portraits/portrait.mjs';
import {mapToken} from '../shared/portraits/map-token.mjs';
import {editorFields,colorFields,layerGroups,randomAppearance,mixAppearance,appearanceJson,parseAppearance,describeAppearance,loadPresets,sharedRosterEntries} from './model.mjs';
import {buildPersonnelRoster,setPersonnelPortrait} from '../shared/js/personnel-roster.mjs';
import {branches,professions,toolOptions} from '../shared/offworld/equipment.mjs';
import {deploymentRoster} from '../shared/offworld/roster.mjs';
import {cachedLoadouts,personnelSaver,configuredTools,validateLoadout} from '../shared/offworld/personnel-save.mjs';
import {statsRadar} from '../shared/portraits/stats-radar.mjs';
import {statFields,characterStatsLoadout} from './character-stats.mjs';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SCALES=[1,2,3,4,6];
const state={appearance:normalizeAppearance({}),base:normalizeAppearance({}),label:'Bust preview',studies:[],roster:[],selectedUnitId:null,scale:4,hidden:new Set(),background:'#000000'};
let catalog,saveStats;
function renderStats(){
  const unit=state.roster.find(entry=>entry.id===state.selectedUnitId);
  $('characterStats').hidden=!unit;
  if(!unit)return;
  for(const [key] of statFields)$(`stat-${key}`).value=unit[key];
  $('statsPreview').innerHTML=statsRadar(unit);
  $('baseProfession').textContent=unit.profession;
  $('characterTier').value=unit.tier;
  $('characterBranch').innerHTML='<option value="">Base Profession only</option>'+professions.filter(p=>p!==unit.profession).map(p=>`<option value="cross:${p}">Cross-path: ${p}</option>`).join('')+branches[unit.profession].map(p=>`<option value="specialization:${p}">Specialization: ${p}</option>`).join('');
  $('characterBranch').value=unit.branch?`${unit.branch.kind}:${unit.branch.id}`:'';
  $('characterBranchTier').value=unit.branch?.tier??1;
  renderProgression();
  $('configuredToolRows').innerHTML='';for(const tool of configuredTools(unit))addToolRow(tool);
}
function draftProgression(){
  const unit=state.roster.find(entry=>entry.id===state.selectedUnitId),branch=$('characterBranch').value;
  return {...unit,tier:Number($('characterTier').value),branch:branch?{kind:branch.split(':')[0],id:branch.split(':')[1],tier:Number($('characterBranchTier').value)}:null};
}
function renderProgression(){
  $('characterBranch').disabled=Number($('characterTier').value)!==3;
  if($('characterBranch').disabled)$('characterBranch').value='';
  $('characterBranchTier').disabled=!$('characterBranch').value;
  const options=toolOptions(draftProgression(),catalog);
  $('statsPreview').innerHTML=statsRadar({...draftProgression(),...Object.fromEntries(statFields.map(([key])=>[key,$(`stat-${key}`).valueAsNumber]))});
  for(const select of document.querySelectorAll('[data-tool-type]')){const old=select.value;select.innerHTML='<option value="">Select Tool</option>'+options.map(t=>`<option value="${esc(t.id)}">${esc(t.label)}</option>`).join('');select.value=old;}
}
function addToolRow(tool={}){
  const row=document.createElement('div');row.className='configured-tool';
  row.innerHTML='<label>Type<select data-tool-type></select></label><label>Charges<input data-tool-charges type="number" min="0" max="99" step="1" required></label><button type="button">Remove</button>';
  $('configuredToolRows').append(row);renderProgression();row.querySelector('select').value=tool.type??'';row.querySelector('input').value=tool.charges??3;row.querySelector('button').onclick=()=>row.remove();
}
function fail(message){const box=$('error');box.textContent=message??'';box.hidden=!message;}
function studyMarkup(entry,index){
  return `<button class="card" data-study="${index}" style="--accent:${esc(entry.appearance.collarColor)}">
    <span class="thumb">${portraitBustSvg(entry.appearance)}</span>
    <span class="card-text"><strong>${esc(entry.label)}</strong><small>${esc(entry.note||entry.appearance.hairStyle)}</small></span></button>`;
}
function rosterMarkup(entry,index){
  return `<button class="card" data-roster="${index}" style="--accent:${esc(entry.color)}">
    <span class="thumb">${portraitBustSvg(entry.appearance)}</span>
    <span class="card-text"><strong>${esc(entry.name)}</strong><small>${esc(entry.profession)} · ${esc(entry.appearance.hairStyle)}</small></span></button>`;
}
function compatMarkup(a){
  const icon=portraitSvg({...a,backgroundColor:a.backgroundColor??'#162630'});
  return [['48×48 roster icon',`<span class="iconbox">${icon}</span>`],
    ['Overhead map token',`<span class="iconbox"><svg viewBox="-10 -8 20 18" width="52" height="47">${mapToken(a)}</svg></span>`],
    ['Bust at 1×',`<span class="onexbox">${portraitBustSvg(a)}</span>`]]
    .map(([label,markup])=>`<figure>${markup}<figcaption>${esc(label)}</figcaption></figure>`).join('');
}
function render(){
  const a=state.appearance,svg=portraitBustSvg(a),stage=$('stage');
  stage.innerHTML=svg;
  stage.dataset.hide=[...state.hidden].join(' ');
  stage.style.setProperty('--zoom',state.scale);
  $('studyLabel').textContent=state.label;
  for(const {key} of editorFields)$(`style-${key}`).value=a[key];
  for(const {key} of colorFields)$(`color-${key}`).value=a[key]??state.background;
  $('transparent').checked=a.backgroundColor===null;
  $('summary').textContent=describeAppearance(a);
  $('record').textContent=appearanceJson(a);
  $('groups').textContent=`Parts rendered: ${[...new Set([...svg.matchAll(/data-part="([a-zA-Z]+)"/g)].map(m=>m[1]))].join(', ')}.`;
  $('compat').innerHTML=compatMarkup(a);
  for(const button of document.querySelectorAll('[data-scale]'))button.setAttribute('aria-pressed',String(Number(button.dataset.scale)===state.scale));
}
function loadAppearance(appearance,label,keepBase){
  state.appearance=normalizeAppearance(appearance);
  if(!keepBase)state.base=state.appearance;
  state.label=label;
  if(state.appearance.backgroundColor)state.background=state.appearance.backgroundColor;
  render();
}
function selectRosterUnit(unit){state.selectedUnitId=unit.id;loadAppearance(unit.appearance,`${unit.name} · shared roster`);renderStats();$('statsStatus').textContent=`Editing ${unit.name}. Stats and appearance save separately.`;$('saveStatus').textContent=`Editing ${unit.name} (${unit.id}). Changes are local until saved.`;}
function buildControls(){
  $('styleFields').innerHTML=editorFields.map(({key,label,options})=>
    `<label>${esc(label)}<select id="style-${key}">${options.map(value=>`<option>${esc(value)}</option>`).join('')}</select></label>`).join('');
  $('colorFields').innerHTML=colorFields.map(({key,label})=>
    `<label>${esc(label)}<input type="color" id="color-${key}"></label>`).join('');
  $('layers').innerHTML=layerGroups.map(group=>
    `<label class="chip"><input type="checkbox" data-layer="${group}" checked> ${esc(group)}</label>`).join('');
  $('scales').innerHTML=SCALES.map(scale=>
    `<button data-scale="${scale}" aria-pressed="false">${scale}×</button>`).join('');
  for(const {key} of editorFields)$(`style-${key}`).onchange=event=>{
    state.appearance=mixAppearance(state.appearance,{[key]:event.target.value});render();
  };
  for(const {key} of colorFields)$(`color-${key}`).oninput=event=>{
    if(key==='backgroundColor')state.background=event.target.value;
    state.appearance=mixAppearance(state.appearance,{[key]:event.target.value});render();
  };
  $('layers').onchange=event=>{
    const group=event.target.dataset.layer;if(!group)return;
    if(event.target.checked)state.hidden.delete(group);else state.hidden.add(group);
    render();
  };
  $('scales').onclick=event=>{const scale=event.target.dataset.scale;if(!scale)return;state.scale=Number(scale);render();};
}
function buildGalleries(){
  $('studies').innerHTML=state.studies.map(studyMarkup).join('');
  $('roster').innerHTML=state.roster.map(rosterMarkup).join('');
  $('studies').onclick=event=>{
    const card=event.target.closest('[data-study]');if(!card)return;
    const study=state.studies[Number(card.dataset.study)];state.selectedUnitId=null;renderStats();loadAppearance(study.appearance,study.label);
  };
  $('roster').onclick=event=>{
    const card=event.target.closest('[data-roster]');if(!card)return;
    const unit=state.roster[Number(card.dataset.roster)];selectRosterUnit(unit);
  };
}
function bindButtons(){
  for(const id of ['characterTier','characterBranch','characterBranchTier'])$(id).onchange=renderProgression;
  $('addConfiguredTool').onclick=()=>addToolRow();
  $('saveConfiguration').onclick=async()=>{
    const unit=draftProgression();
    try{
      unit.availableTools=[...document.querySelectorAll('.configured-tool')].map(row=>({type:row.querySelector('select').value,charges:row.querySelector('input').valueAsNumber}));
      unit.toolSlots=[0,1].map(slot=>{const tool=unit.availableTools.find(t=>t.type===unit.toolSlots?.[slot]?.kitId);return slot===1&&!unit.branch?{kitId:'',charges:0}:{kitId:tool?.type??'',charges:tool?.charges??0};});
      const value=validateLoadout(unit.unitId,unit.profession,unit,catalog);
      await saveStats(unit,value);Object.assign(state.roster.find(entry=>entry.id===unit.id),value);renderStats();buildGalleries();fail();
    }catch(error){fail(error.message);}
  };
  $('statFields').innerHTML=statFields.map(([key,label,min,max])=>`<label>${label}<input id="stat-${key}" type="number" min="${min}" max="${max}" step="1" required></label>`).join('');
  const readStats=()=>Object.fromEntries(statFields.map(([key])=>[key,$(`stat-${key}`).valueAsNumber]));
  $('statFields').oninput=()=>{
    const unit=state.roster.find(entry=>entry.id===state.selectedUnitId);
    if(unit)$('statsPreview').innerHTML=statsRadar({...unit,...readStats()});
  };
  $('resetStats').onclick=renderStats;
  $('saveStats').onclick=async()=>{
    const unit=state.roster.find(entry=>entry.id===state.selectedUnitId);if(!unit)return;
    try{
      const value=characterStatsLoadout(unit,readStats(),catalog);
      await saveStats(unit,value);Object.assign(unit,value);renderStats();fail();
    }catch(error){fail(error.message);}
  };
  $('transparent').onchange=event=>loadAppearance({...state.appearance,backgroundColor:event.target.checked?'transparent':state.background},state.label,true);
  $('randomize').onclick=()=>loadAppearance(randomAppearance($('seed').value,state.appearance),`Randomized · seed ${$('seed').value}`,true);
  $('reset').onclick=()=>loadAppearance(state.base,state.label);
  $('saveRoster').onclick=async()=>{
    if(!state.selectedUnitId){$('saveStatus').textContent='Select a shared roster member first.';return;}
    const unit=state.roster.find(entry=>entry.id===state.selectedUnitId);setPersonnelPortrait(unit.id,state.appearance);
    unit.appearance=normalizeAppearance(state.appearance);
    $('saveStatus').textContent=`Saved ${unit.name} in this browser. Other demos will use it on refresh.`;
    try{
      const response=await fetch(`/api/personnel-presentation/${encodeURIComponent(unit.id)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({portrait:{renderer:'bust',appearance:unit.appearance}})});
      if(!response.ok)throw new Error('Writable presentation endpoint unavailable');
      $('saveStatus').textContent=`Saved ${unit.name} to the shared presentation JSON.`;
    }catch{$('saveStatus').textContent+=` Start node demos/serve.mjs to write the repository JSON.`;}
    buildGalleries();render();
  };
  $('copy').onclick=async()=>{
    try{await navigator.clipboard.writeText(appearanceJson(state.appearance));$('summary').textContent='Appearance record copied to the clipboard.';}
    catch{$('summary').textContent='Clipboard unavailable: select the record text instead and copy it.';}
  };
  $('download').onclick=()=>{
    const url=URL.createObjectURL(new Blob([appearanceJson(state.appearance)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='portrait-appearance.json';link.click();URL.revokeObjectURL(url);
  };
  $('load').onchange=async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{loadAppearance(parseAppearance(await file.text()),`Loaded ${file.name}`);fail();}
    catch(error){fail(error.message);}
    event.target.value='';
  };
}
const readJson=async url=>{const response=await fetch(url);if(!response.ok)throw new Error(`Could not load ${url} (${response.status}).`);return response.json();};
try{
  const [portraits,classes,names,presets,loadouts,equipment]=await Promise.all([readJson('../shared/data/portraits/portrait-presets.json'),readJson('../shared/data/base-classes.json'),readJson('../shared/data/personnel-names.json'),readJson('../shared/data/offworld/party-presets.json'),readJson('../shared/data/personnel-loadouts.json'),readJson('../shared/data/offworld/archetypes.json')]);
  catalog=equipment;loadouts.units={...loadouts.units,...cachedLoadouts()};
  const deployment=deploymentRoster(classes,names,presets,loadouts).units;
  const classMatrix=Object.fromEntries(Object.entries(branches).map(([id,list])=>[id.toLowerCase(),list]));
  state.studies=loadPresets(portraits);state.roster=sharedRosterEntries(buildPersonnelRoster(classes,names.pools,classMatrix),classes).map(entry=>({...entry,...deployment.find(unit=>unit.unitId===entry.id)}));
  saveStats=personnelSaver($('statsStatus'));
  buildControls();buildGalleries();bindButtons();
  loadAppearance(state.studies[0].appearance,state.studies[0].label);
}catch(error){fail(`${error.message} Serve the repository root over HTTP so the shared fixtures can be read.`);}

