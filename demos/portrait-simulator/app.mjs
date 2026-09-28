import {portraitBustSvg,normalizeAppearance} from '../shared/portraits/portrait-bust.mjs';
import {portraitSvg} from '../shared/portraits/portrait.mjs';
import {mapToken} from '../shared/portraits/map-token.mjs';
import {editorFields,colorFields,layerGroups,randomAppearance,mixAppearance,appearanceJson,parseAppearance,describeAppearance,loadPresets,sharedRosterEntries} from './model.mjs';
import {buildPersonnelRoster,setPersonnelPortrait} from '../shared/js/personnel-roster.mjs';
import {branches} from '../shared/offworld/equipment.mjs';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SCALES=[1,2,3,4,6];
const state={appearance:normalizeAppearance({}),base:normalizeAppearance({}),label:'Bust preview',studies:[],roster:[],selectedUnitId:null,scale:4,hidden:new Set(),background:'#000000'};
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
function selectRosterUnit(unit){state.selectedUnitId=unit.id;loadAppearance(unit.appearance,`${unit.name} · shared roster`);$('saveStatus').textContent=`Editing ${unit.name} (${unit.id}). Changes are local until saved.`;}
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
    const study=state.studies[Number(card.dataset.study)];loadAppearance(study.appearance,study.label);
  };
  $('roster').onclick=event=>{
    const card=event.target.closest('[data-roster]');if(!card)return;
    const unit=state.roster[Number(card.dataset.roster)];selectRosterUnit(unit);
  };
}
function bindButtons(){
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
  const [portraits,classes,names]=await Promise.all([readJson('../shared/data/portraits/portrait-presets.json'),readJson('../shared/data/base-classes.json'),readJson('../shared/data/personnel-names.json')]);
  const classMatrix=Object.fromEntries(Object.entries(branches).map(([id,list])=>[id.toLowerCase(),list]));
  state.studies=loadPresets(portraits);state.roster=sharedRosterEntries(buildPersonnelRoster(classes,names.pools,classMatrix),classes);
  buildControls();buildGalleries();bindButtons();
  loadAppearance(state.studies[0].appearance,state.studies[0].label);
}catch(error){fail(`${error.message} Serve the repository root over HTTP so the shared fixtures can be read.`);}

