import {getRoomById, loadRooms, loadRoomsFromFile} from "../shared/js/rooms.js?v=room-staffing-demo-5";

const ROOM_CATALOG_URL="../shared/data/rooms_schema.json?v=room-staffing-demo-5";
const CLASS_CATALOG_URL="../shared/data/base-classes.json?v=room-staffing-demo-5";
const PERSONNEL_NAMES_URL="../shared/data/personnel-names.json";
const SPECIALIZATION_ICON_URL="../shared/data/specialization-icons.json?v=room-staffing-demo-5";
const ITEM_CATALOG_URL="../shared/data/items/asgard_vs_human_em_rifle_items.json?v=room-staffing-demo-5";
const THEORY_CATALOG_URL="../shared/data/theory/stargate_theory_simulator_import.json?v=room-staffing-demo-5";
const ITEM_ICONS={ASGARD_EM_RIFLE:"../shared/icons/items/asgard-em-rifle.svg",HUMAN_ADVANCED_COIL_RIFLE:"../shared/icons/items/human-coil-rifle.svg"};
const THEORY_ICONS={PULSED_POWER:"../shared/icons/theory/pulsed-power.svg",ELECTROMAGNETIC_ACTUATION:"../shared/icons/theory/electromagnetic-actuation.svg",ELECTROMAGNETIC_ACCELERATION:"../shared/icons/theory/electromagnetic-acceleration.svg",HUMAN_MANUFACTURING:"../shared/icons/theory/manufacturing.svg",HUMAN_ROOM_CONSTRUCTION:"../shared/icons/theory/room-construction.svg",ELECTROMAGNETIC_ACCELERATOR:"../shared/icons/theory/electromagnetic-accelerator.svg",RIFLE:"../shared/icons/theory/rifle-pattern.svg"};
const CT_BORDER_COLORS={1:"#8b949e",2:"#38bdf8",3:"#f59e0b"};
const PREVIEW_LABELS={joinGroup:"Join group",maxConstructionTier:"Maximum CT",supportsJoining:"Supports joining",supportsProgression:"Supports progression",supportsStaffing:"Supports staffing",supportsQueues:"Supports queues",supportsStorage:"Supports storage",supportsInventory:"Supports inventory",supportsCores:"Supports cores",supportsCapacity:"Supports capacity",joinedStaffingCapacity:"Joined staffing"};
const FALLBACK_MAX_VISIBLE_SLOTS=8;
const BASE_TIER_LABELS=["Untrained","Trained","Advanced","Expert","Master"];
const BRANCH_TIER_LABELS=["Untrained","Trained","Advanced","Expert"];
const CLASS_MATRIX={
  soldier:["Marksman","Guardian","Tactician"],
  scout:["Pathfinder","Tracker","Observer"],
  technician:["Demolitions","Integrations","Overdrive"],
  scientist:["Applied","Operational","Strategic"],
  medic:["Trauma","Field Medicine","Epidemiology"],
  diplomat:["Negotiator","Ambassador","Arbiter"]
};
const ROOM_CODES={analysis:"AN",research:"RS",receiving:"RC",storage:"ST",data_storage:"DS",maintenance:"MA",infirmary:"IN",holding:"HO",living_quarters:"LQ",response_room:"RR"};
const CLASS_CODES={scientist:"SC",diplomat:"DI",soldier:"SO",technician:"TE",medic:"ME",scout:"ST"};
const SECONDARY_CODES={Applied:"AP",Operational:"OP",Strategic:"SG",Negotiator:"NE",Ambassador:"AM",Arbiter:"AR",Marksman:"MK",Guardian:"GU",Tactician:"TA",Pathfinder:"PA",Tracker:"TR",Observer:"OB",Demolitions:"DE",Integrations:"IG",Overdrive:"OV",Trauma:"TU","Field Medicine":"FM",Epidemiology:"EP",scientist:"SC",diplomat:"DI",soldier:"SO",technician:"TE",medic:"ME",scout:"ST"};

let roomCatalog=[];
let classCatalog=[];
let currentRoom=null;
let currentCt=1;
let currentLayout="1x1";
let revealedSlots=0;
let assignments=[];
let dragPayload=null;
let unitRoster=[];
let specializationIcons={};
let itemCatalog=[];
let theoryCatalog=[];
let roomResources={items:[],theories:[],cores:[]};
let roomTabResources={};
let activeRoomTabId=null;
const iconMarkupCache=new Map();

const roomSelect=document.getElementById("roomSelect");
const ctSelect=document.getElementById("ctSelect");
const layoutSelect=document.getElementById("layoutSelect");
const joinButton=document.getElementById("joinSelected");
const upgradeCtButton=document.getElementById("upgradeCt");
const addStaffButton=document.getElementById("addStaff");
const resetRoomButton=document.getElementById("resetRoom");
const loadAnalysisButton=document.getElementById("loadAnalysis");
const fillScientistButton=document.getElementById("fillOpenScientist");
const clearAssignmentsButton=document.getElementById("clearAssignments");
const selectionStatus=document.getElementById("selectionStatus");
const status=document.getElementById("status");
const roomCard=document.getElementById("roomCard");
const roomPreview=document.getElementById("roomPreview");
const classPalette=document.getElementById("classPalette");
const itemPalette=document.getElementById("itemPalette");
const theoryPalette=document.getElementById("theoryPalette");
const layoutPill=document.getElementById("layoutPill");
const capacityPill=document.getElementById("capacityPill");
const staffedPill=document.getElementById("staffedPill");
const rosterBaseFilter=document.getElementById("rosterBaseFilter");
const rosterSpecializationFilter=document.getElementById("rosterSpecializationFilter");
const rosterCrossFilter=document.getElementById("rosterCrossFilter");
const rosterSort=document.getElementById("rosterSort");
const configOutput=document.getElementById("configOutput");
const classCatalogBaseUrl=new URL(CLASS_CATALOG_URL,import.meta.url);

function setStatus(message){status.textContent=message}
function setSelectionStatus(message){selectionStatus.textContent=message}
function roomDef(id){return getRoomById(roomCatalog,id)}
function classDef(id){return classCatalog.find(entry=>entry.id===id) ?? null}
function fieldLabel(key){return PREVIEW_LABELS[key] ?? key.replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/^./,char=>char.toUpperCase())}
function titleCaseWords(value){return String(value).split("_").map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(" ")}
function tileCountForLayout(layout=currentLayout){
  if(layout==="2x2")return 4;
  if(layout==="1x2")return 2;
  return 1;
}
function roomCode(roomId){return ROOM_CODES[roomId] ?? String(roomId ?? "unknown").slice(0,2).toUpperCase()}
function classCode(classId){return CLASS_CODES[classId] ?? String(classId ?? "??").slice(0,2).toUpperCase()}
function secondaryCode(value){return SECONDARY_CODES[value] ?? String(value ?? "??").replace(/[^A-Za-z0-9]/g,"").slice(0,2).toUpperCase()}
function toolCode(value){return `${secondaryCode(value)}T`}
function equippedToolsForAssignment(assignment){
  normalizeToolSelections(assignment);
  return assignmentToolTracks(assignment).map(track=>assignment.toolSelections?.[track.key] ?? "").filter(Boolean);
}
function encodeAssignment(assignment){
  const primary=`${classCode(assignment.classId)}${assignment.baseTier+1}`;
  const branch=assignment.specializationId && assignment.specializationTier>=0
    ? `/${secondaryCode(assignment.specializationId)}${assignment.specializationTier+1}`
    : assignment.crossPathId && assignment.crossPathTier>=0
      ? `/${secondaryCode(assignment.crossPathId)}${assignment.crossPathTier+1}`
      : "";
  const equipped=equippedToolsForAssignment(assignment);
  return `${primary}${branch}${equipped.length?`[${equipped.join(",")}]`:""}`;
}
function romanTier(level){return ["I","II","III","IV","V"][Math.max(0,Math.min(level,4))] ?? String(level+1)}
function resolveIconPath(path){return new URL(path,classCatalogBaseUrl).href}
function baseTierCap(){return 2}
function unique(values){return [...new Set(values)]}

// Authored presentation data; provenance and extension guide: ../shared/data/personnel-names.md
let classNamePools={};

function valueNode(value){
  if(Array.isArray(value)){
    const list=document.createElement("ul");
    for(const item of value){const entry=document.createElement("li");entry.appendChild(valueNode(item));list.appendChild(entry)}
    return list;
  }
  if(value && typeof value==="object"){
    const list=document.createElement("dl");
    for(const [key,item] of Object.entries(value)){
      const term=document.createElement("dt");term.textContent=fieldLabel(key);
      const detail=document.createElement("dd");detail.appendChild(valueNode(item));
      list.append(term,detail);
    }
    return list;
  }
  const text=document.createElement("span");
  text.textContent=value===null?"Unknown":typeof value==="boolean"?(value?"Yes":"No"):String(value);
  return text;
}

async function loadClassCatalog(){
  const response=await fetch(CLASS_CATALOG_URL,{cache:"no-store"});
  if(!response.ok)throw new Error(`Could not load base class catalog (${response.status}).`);
  return await response.json();
}

async function loadPersonnelNames(){
  const response=await fetch(PERSONNEL_NAMES_URL,{cache:"no-store"});
  if(!response.ok)throw new Error(`Could not load personnel names (${response.status}).`);
  const {pools}=await response.json();
  for(const classId of Object.keys(CLASS_MATRIX)){
    for(const part of ["first","last"]){
      const names=pools?.[classId]?.[part];
      if(!Array.isArray(names) || !names.length || names.some(name=>typeof name!=="string" || !name.trim()))throw new Error(`Personnel names missing valid ${classId}.${part} pool.`);
    }
  }
  return pools;
}

async function loadSpecializationIcons(){
  const response=await fetch(SPECIALIZATION_ICON_URL,{cache:"no-store"});
  if(!response.ok)throw new Error(`Could not load specialization icon catalog (${response.status}).`);
  return await response.json();
}

async function loadCatalogCollection(url,key,label){
  const response=await fetch(url,{cache:"no-store"});
  if(!response.ok)throw new Error(`Could not load ${label} catalog (${response.status}).`);
  const document=await response.json();
  if(!Array.isArray(document[key]))throw new Error(`${label} catalog is missing ${key}.`);
  return document[key];
}

function beginDrag(event,payload,node){
  dragPayload=payload;
  event.dataTransfer.effectAllowed="copy";
  event.dataTransfer.setData("application/x-stargate-resource",JSON.stringify(payload));
  event.dataTransfer.setData("text/plain",`${payload.type}:${payload.id}`);
  node.classList.add("dragging");
}

function endDrag(node){
  dragPayload=null;
  node.classList.remove("dragging");
}

function droppedPayload(event){
  try{
    return JSON.parse(event.dataTransfer.getData("application/x-stargate-resource")) || dragPayload;
  }catch{
    return dragPayload;
  }
}

async function iconMarkup(path){
  const resolved=resolveIconPath(path);
  if(iconMarkupCache.has(resolved))return iconMarkupCache.get(resolved);
  const response=await fetch(resolved);
  if(!response.ok)throw new Error(`Could not load icon (${response.status}).`);
  const text=await response.text();
  iconMarkupCache.set(resolved,text);
  return text;
}

function setIconContent(container,markupPromise){
  container.textContent="";
  markupPromise.then(markup=>{container.innerHTML=markup}).catch(()=>{container.textContent="?"});
}

function baseTierLabel(level){return BASE_TIER_LABELS[Math.min(level,BASE_TIER_LABELS.length-1)] ?? `Tier ${level}`}
function branchTierLabel(level){return level<0?"Locked":BRANCH_TIER_LABELS[Math.min(level,BRANCH_TIER_LABELS.length-1)] ?? `Tier ${level+1}`}

function availableLayouts(definition){
  return definition?.schema?.rules?.joining?.supportedLayouts ?? ["1x1"];
}

function staffingByLayout(definition){
  return definition?.joinedStaffingCapacity ?? definition?.schema?.rules?.joining?.staffingByLayout ?? null;
}

function slotConfigFor(type,definition=currentRoom){
  return definition?.schema?.function?.slotConfig?.[type] ?? null;
}

function slotCountFromConfig(config,{layout=currentLayout,ct=currentCt}={}){
  if(!config)return 0;
  if(config.byLayout && Number.isInteger(config.byLayout[layout]))return config.byLayout[layout];
  let count=0;
  if(Array.isArray(config.byConstructionTier) && config.byConstructionTier.length){
    const tierIndex=Math.max(0,Math.min((ct ?? 1)-1,config.byConstructionTier.length-1));
    count=Number(config.byConstructionTier[tierIndex] ?? 0);
  }else if(Number.isInteger(config.fixed))count=config.fixed;
  else if(Number.isInteger(config.perPhysicalRoom))count=config.perPhysicalRoom;
  if(config.scaleWithLayout && !config.byLayout)count*=tileCountForLayout(layout);
  return Math.max(0,count || 0);
}

function maxStaffSlotsFor(definition=currentRoom){
  const config=slotConfigFor('staff',definition);
  if(!config && !definition?.staffed)return 0;
  if(config?.byLayout)return Math.max(...Object.values(config.byLayout));
  if(config)return slotCountFromConfig(config,{layout:'2x2',ct:definition?.maxConstructionTier ?? currentCt});
  const joined=staffingByLayout(definition);
  if(joined)return Math.max(...Object.values(joined).filter(value=>Number.isInteger(value)));
  if(Number.isInteger(definition?.staffingPerPhysicalRoom))return definition.staffingPerPhysicalRoom;
  return FALLBACK_MAX_VISIBLE_SLOTS;
}

function roomCapacity(definition=currentRoom,layout=currentLayout){
  const configured=slotCountFromConfig(slotConfigFor('staff',definition),{layout,ct:currentCt});
  if(configured>0 || slotConfigFor('staff',definition))return configured;
  const joined=staffingByLayout(definition);
  if(joined && Number.isInteger(joined[layout]))return joined[layout];
  if(Number.isInteger(definition?.staffingPerPhysicalRoom))return definition.staffingPerPhysicalRoom;
  return 0;
}

function assignedCount(){return assignments.filter(Boolean).length}

function openSlotCount(){return Math.max(0,Math.min(revealedSlots,roomCapacity())-assignedCount())}

function resetAssignmentsToCapacity(){
  const size=Math.max(0,maxStaffSlotsFor());
  assignments=Array.from({length:size},(_,index)=>index<roomCapacity()?(assignments[index] ?? null):null);
  revealedSlots=Math.min(roomCapacity(),size);
}

function createAssignment(classId){
  return {
    classId,
    name:"",
    baseTier:0,
    specializationId:(CLASS_MATRIX[classId] ?? [])[0] ?? null,
    specializationTier:-1,
    crossPathId:classCatalog.find(entry=>entry.id!==classId)?.id ?? null,
    crossPathTier:-1,
    toolSelections:{base:"",secondary:""}
  };
}

function createAssignmentFromUnit(unit){
  return {
    classId:unit.classId,
    name:unit.name,
    baseTier:unit.baseTier,
    specializationId:unit.specializationId,
    specializationTier:unit.specializationTier,
    crossPathId:unit.crossPathId,
    crossPathTier:unit.crossPathTier,
    branchMode:unit.sortGroup==="specialization"?"specialization":unit.sortGroup==="cross"?"cross":null,
    toolSelections:{base:"",secondary:""}
  };
}

function iconPathForAssignment(assignment){
  if(assignment.specializationId && specializationIcons[assignment.specializationId])return specializationIcons[assignment.specializationId];
  return classDef(assignment.classId)?.icon ?? "../icons/base-classes/scientist.svg";
}

function iconPathForRosterUnit(unit){
  if(unit.specializationId && specializationIcons[unit.specializationId])return specializationIcons[unit.specializationId];
  return classDef(unit.classId)?.icon ?? "../icons/base-classes/scientist.svg";
}

function iconBackground(baseClassId,crossPathId=null){
  const baseColor=classDef(baseClassId)?.color ?? "#64748b";
  if(!crossPathId)return baseColor;
  const crossColor=classDef(crossPathId)?.color ?? baseColor;
  return `linear-gradient(90deg, ${baseColor} 0 50%, ${crossColor} 50% 100%)`;
}

function assignmentLabel(assignment){
  if(assignment.specializationId)return `${assignment.specializationId} ${romanTier(Math.max(0,assignment.specializationTier))}`;
  if(assignment.crossPathId)return `${classDef(assignment.classId)?.name ?? assignment.classId}/${titleCaseWords(assignment.crossPathId)} ${romanTier(Math.max(0,assignment.crossPathTier))}`;
  return `${classDef(assignment.classId)?.name ?? assignment.classId} ${romanTier(assignment.baseTier)}`;
}
function toolOptionsForTrack(code,maxTier){return Array.from({length:Math.max(0,maxTier+1)},(_,index)=>`${code}${index+1}`)}
function displayCodeForTrack(value){return classDef(value)?.shortName ?? secondaryCode(value)}
function assignmentToolTracks(assignment){
  const tracks=[{
    key:"base",
    slotLabel:"tool1",
    label:`${toolCode(assignment.classId)} tools`,
    displayCode:displayCodeForTrack(assignment.classId),
    options:toolOptionsForTrack(toolCode(assignment.classId),assignment.baseTier)
  }];
  if(assignment.specializationId && assignment.specializationTier>=0){
    tracks.push({
      key:"secondary",
      slotLabel:"tool2",
      label:`${toolCode(assignment.specializationId)} tools`,
      displayCode:displayCodeForTrack(assignment.specializationId),
      options:toolOptionsForTrack(toolCode(assignment.specializationId),assignment.specializationTier)
    });
  }else if(assignment.crossPathId && assignment.crossPathTier>=0){
    tracks.push({
      key:"secondary",
      slotLabel:"tool2",
      label:`${toolCode(assignment.crossPathId)} tools`,
      displayCode:displayCodeForTrack(assignment.crossPathId),
      options:toolOptionsForTrack(toolCode(assignment.crossPathId),assignment.crossPathTier)
    });
  }
  const eligibleOptions=unique(tracks.flatMap(track=>track.options));
  return tracks.map(track=>({
    ...track,
    eligibleOptions
  }));
}
function normalizeToolSelections(assignment){
  assignment.toolSelections ??= {base:"",secondary:""};
  const tracks=assignmentToolTracks(assignment);
  for(const track of tracks){
    if(assignment.toolSelections[track.key] && !track.eligibleOptions.includes(assignment.toolSelections[track.key]))assignment.toolSelections[track.key]="";
  }
  if(!tracks.some(track=>track.key==="secondary"))assignment.toolSelections.secondary="";
}

function rosterUnit(id){return unitRoster.find(unit=>unit.id===id) ?? null}

function generatedPersonName(classId,index,variant="base"){
  const pool=classNamePools[classId] ?? classNamePools.scientist;
  const first=pool.first[index % pool.first.length];
  const last=pool.last[Math.floor(index / pool.first.length) % pool.last.length];
  const suffix=variant==="specialization"?" Sr.":variant==="cross"?" V.":"";
  return `${first} ${last}${suffix}`;
}

function buildUnitRoster(){
  const roster=[];
  let serial=1;
  const classCounters=Object.fromEntries(classCatalog.map(entry=>[entry.id,0]));
  for(const baseClass of classCatalog){
    roster.push({
      id:`unit-${serial++}`,
      name:generatedPersonName(baseClass.id,classCounters[baseClass.id]++,"base"),
      classId:baseClass.id,
      baseTier:0,
      specializationId:null,
      specializationTier:-1,
      crossPathId:null,
      crossPathTier:-1,
      sortGroup:"base"
    });
    for(const specializationId of CLASS_MATRIX[baseClass.id] ?? []){
      roster.push({
        id:`unit-${serial++}`,
        name:generatedPersonName(baseClass.id,classCounters[baseClass.id]++,"specialization"),
        classId:baseClass.id,
        baseTier:2,
        specializationId,
        specializationTier:0,
        crossPathId:null,
        crossPathTier:-1,
        sortGroup:"specialization"
      });
    }
    for(const crossClass of classCatalog.filter(entry=>entry.id!==baseClass.id)){
      roster.push({
        id:`unit-${serial++}`,
        name:generatedPersonName(baseClass.id,classCounters[baseClass.id]++,"cross"),
        classId:baseClass.id,
        baseTier:2,
        specializationId:null,
        specializationTier:-1,
        crossPathId:crossClass.id,
        crossPathTier:0,
        sortGroup:"cross"
      });
    }
  }
  return roster;
}

function populateRosterControls(){
  const specializations=[...new Set(Object.values(CLASS_MATRIX).flat())].sort((a,b)=>a.localeCompare(b));
  const crossClasses=classCatalog.map(entry=>entry.id);
  const fill=(select,options)=>select.replaceChildren(...options.map(({value,label})=>{const option=document.createElement("option");option.value=value;option.textContent=label;return option}));
  fill(rosterBaseFilter,[{value:"all",label:"All base classes"},...classCatalog.map(entry=>({value:entry.id,label:entry.name}))]);
  fill(rosterSpecializationFilter,[{value:"all",label:"All specializations"},...specializations.map(value=>({value,label:value}))]);
  fill(rosterCrossFilter,[{value:"all",label:"All cross paths"},...crossClasses.map(value=>({value,label:titleCaseWords(value)}))]);
  fill(rosterSort,[
    {value:"name",label:"Name"},
    {value:"base",label:"Base class"},
    {value:"tier",label:"Base tier"},
    {value:"specialization",label:"Specialization"},
    {value:"cross",label:"Cross path"}
  ]);
}

function filteredRoster(){
  const baseValue=rosterBaseFilter.value || "all";
  const specValue=rosterSpecializationFilter.value || "all";
  const crossValue=rosterCrossFilter.value || "all";
  const sortValue=rosterSort.value || "name";
  const items=unitRoster.filter(unit=>(baseValue==="all"||unit.classId===baseValue)&&(specValue==="all"||unit.specializationId===specValue)&&(crossValue==="all"||unit.crossPathId===crossValue));
  const sorters={
    name:(a,b)=>a.name.localeCompare(b.name),
    base:(a,b)=>a.classId.localeCompare(b.classId)||a.baseTier-b.baseTier||a.name.localeCompare(b.name),
    tier:(a,b)=>a.baseTier-b.baseTier||a.classId.localeCompare(b.classId)||a.name.localeCompare(b.name),
    specialization:(a,b)=>(a.specializationId??"zzz").localeCompare(b.specializationId??"zzz")||a.name.localeCompare(b.name),
    cross:(a,b)=>(a.crossPathId??"zzz").localeCompare(b.crossPathId??"zzz")||a.name.localeCompare(b.name)
  };
  return items.sort(sorters[sortValue] ?? sorters.name);
}

function coreSlotCapacity(definition=currentRoom,ct=currentCt,layout=currentLayout){
  const config=slotConfigFor('core',definition);
  const configured=slotCountFromConfig(config,{layout,ct});
  if(configured>0 || config)return configured;
  const progression=definition?.schema?.rules?.cores?.slotProgression;
  if(Array.isArray(progression) && progression.length){
    const tierIndex=Math.max(0,Math.min((ct ?? 1)-1,progression.length-1));
    const count=Number(progression[tierIndex] ?? 0);
    return definition?.schema?.rules?.joining?.supportsJoining ? count*tileCountForLayout(layout) : count;
  }
  if(definition?.schema?.rules?.cores?.supportsCores)return 2*tileCountForLayout(layout);
  return 0;
}

function itemSlotCapacity(definition=currentRoom,ct=currentCt,layout=currentLayout){
  return slotCountFromConfig(slotConfigFor('item',definition),{layout,ct});
}

function theorySlotCapacity(definition=currentRoom,ct=currentCt,layout=currentLayout){
  return slotCountFromConfig(slotConfigFor('theory',definition),{layout,ct});
}

function resizeCollection(collection,size){
  return Array.from({length:Math.max(0,size)},(_,index)=>collection?.[index] ?? null);
}

function configurationString(){
  const staff=assignments.filter(Boolean).map(encodeAssignment).join(",");
  const coreSets=roomResources.cores.length?roomResources.cores.map(value=>value || "_").join(",") : "_";
  const items=roomResources.items.filter(Boolean).join(",") || "_";
  const theories=roomResources.theories.filter(Boolean).join(",") || "_";
  const tabs=Object.entries(roomTabResources).map(([tab,types])=>`${tab}(${Object.entries(types).map(([type,values])=>`${type}:${values.map(value=>value||"_").join(",")}`).join(";")})`).join("|");
  return `${roomCode(currentRoom?.id)}[${currentLayout}]{${staff}|${coreSets}|I:${items}|T:${theories}${tabs?`|${tabs}`:""}}`;
}

function resetRoomResources(){
  roomResources={
    items:resizeCollection(roomResources.items,itemSlotCapacity()),
    theories:resizeCollection(roomResources.theories,theorySlotCapacity()),
    cores:resizeCollection(roomResources.cores,coreSlotCapacity())
  };
  const tabs=roomTabs();
  const next={};
  for(const tab of tabs){
    next[tab.id]={};
    for(const [type,config] of Object.entries(tab.slotConfig ?? {})){
      const old=roomTabResources[tab.id]?.[type] ?? [];
      next[tab.id][type]=resizeCollection(old,slotCountFromConfig(config,{layout:currentLayout,ct:currentCt}));
    }
  }
  roomTabResources=next;
  if(!tabs.some(tab=>tab.id===activeRoomTabId))activeRoomTabId=tabs[0]?.id ?? null;
}

function roomTabs(definition=currentRoom){
  const configured=definition?.schema?.function?.subordinateTabs;
  if(Array.isArray(configured)&&configured.length)return configured;
  const slotConfig=definition?.schema?.function?.slotConfig ?? {};
  const functional=Object.fromEntries(Object.entries(slotConfig).filter(([type])=>["item","theory","unit","job"].includes(type)));
  return Object.keys(functional).length?[{id:"room",name:"Room",notes:"Primary room functions.",slotConfig:functional}]:[];
}

function loadRoom(id){
  const definition=roomDef(id);
  if(!definition)return;
  currentRoom=definition;
  roomSelect.value=definition.id;
  currentCt=1;
  ctSelect.value=String(currentCt);
  currentLayout=availableLayouts(definition)[0] ?? "1x1";
  activeRoomTabId=null;
  roomTabResources={};
  populateLayoutOptions();
  assignments=Array.from({length:Math.max(0,maxStaffSlotsFor(definition))},()=>null);
  resetRoomResources();
  resetAssignmentsToCapacity();
  setSelectionStatus(`Loaded ${definition.name}. Current layout ${currentLayout}, staffing capacity ${roomCapacity()}.`);
  setStatus(`${definition.name} ready for staffing experiments.`);
  render();
}

function populateRooms(){
  roomSelect.replaceChildren(...roomCatalog.map(definition=>{
    const option=document.createElement("option");
    option.value=definition.id;
    option.textContent=definition.name;
    return option;
  }));
}

function populateLayoutOptions(){
  const layouts=availableLayouts(currentRoom);
  layoutSelect.replaceChildren(...layouts.map(layout=>{
    const option=document.createElement("option");
    option.value=layout;
    option.textContent=layout;
    return option;
  }));
  layoutSelect.value=currentLayout;
}

function createClassChip(definition){
  const chip=document.createElement("div");
  chip.className="class-chip";
  chip.draggable=true;
  chip.dataset.unitId=definition.id;
  chip.addEventListener("dragstart",event=>beginDrag(event,{type:"unit",id:definition.id},chip));
  chip.addEventListener("dragend",()=>endDrag(chip));

  const icon=document.createElement("span");
  icon.className="class-icon";
  icon.style.background=iconBackground(definition.classId,definition.crossPathId);
  setIconContent(icon,iconMarkup(iconPathForRosterUnit(definition)));

  const copy=document.createElement("div");
  copy.className="class-copy";
  const name=document.createElement("div");
  name.className="class-name";
  name.textContent=definition.name;
  const short=document.createElement("div");
  short.className="class-short";
  short.textContent=`${titleCaseWords(definition.classId)} · ${baseTierLabel(definition.baseTier)}`;
  const meta=document.createElement("div");
  meta.className="class-meta";
  meta.textContent=definition.specializationId?`Spec: ${definition.specializationId}`:definition.crossPathId?`Cross: ${titleCaseWords(definition.crossPathId)}`:"Base path";
  copy.append(name,short,meta);
  chip.append(icon,copy);
  return chip;
}

function renderClassPalette(){
  classPalette.replaceChildren(...filteredRoster().map(createClassChip));
}

function createResourceChip(definition,type){
  const chip=document.createElement("div");
  chip.className=`resource-chip ${type}`;
  chip.draggable=true;
  chip.dataset.resourceId=definition.id;
  chip.addEventListener("dragstart",event=>beginDrag(event,{type,id:definition.id},chip));
  chip.addEventListener("dragend",()=>endDrag(chip));
  const glyph=document.createElement("span");
  glyph.className="resource-glyph";
  glyph.style.background=resourceColor(definition,type);
  const image=document.createElement("img");
  image.src=resourceIcon(definition,type);
  image.alt="";
  glyph.appendChild(image);
  const copy=document.createElement("div");
  const name=document.createElement("div");
  name.className="resource-name";
  name.textContent=definition.name;
  const meta=document.createElement("div");
  meta.className="resource-meta";
  meta.textContent=type==="item"
    ? `${titleCaseWords(definition.identity?.civilization ?? "unknown")} · ${titleCaseWords(definition.family ?? "item")} · ${Object.entries(definition.storageCompatibility ?? {}).filter(([,allowed])=>allowed).map(([key])=>key.toUpperCase()).join("/") || "Unclassified"}`
    : `${titleCaseWords(definition.family ?? "theory")} · Tier ${definition.tier ?? "?"}`;
  copy.append(name,meta);
  chip.append(glyph,copy);
  return chip;
}

function resourceIcon(definition,type){return type==="item"?ITEM_ICONS[definition.id]:THEORY_ICONS[definition.family]}
function resourceColor(definition,type){
  if(type==="item")return definition.id==="ASGARD_EM_RIFLE"?"#0e7490":"#b45309";
  return Number(definition.tier)>=2?"#7c3aed":"#4338ca";
}

function renderResourcePalettes(){
  itemPalette.replaceChildren(...itemCatalog.map(definition=>createResourceChip(definition,"item")));
  theoryPalette.replaceChildren(...theoryCatalog.map(definition=>createResourceChip(definition,"theory")));
}

function roomShapeName(){
  if(currentLayout==="1x2")return "Joined pair";
  if(currentLayout==="2x2")return "Joined quad";
  return "Single room";
}

function resourceDefinition(type,id){
  const catalog=type==="item"?itemCatalog:theoryCatalog;
  return catalog.find(definition=>definition.id===id) ?? null;
}

function resourceCollection(type){
  if(type==="item")return roomResources.items;
  if(type==="theory")return roomResources.theories;
  return roomResources.cores;
}

function createResourceSlot(type,index,providedCollection=null,acceptsItemClasses=[]){
  const collection=providedCollection ?? resourceCollection(type);
  const definition=type==="unit"?rosterUnit(collection[index]):(["item","theory"].includes(type)?resourceDefinition(type,collection[index]):null);
  const slot=document.createElement("div");
  slot.className=`resource-slot ${definition||collection[index]?"filled":""}`.trim();
  if(["item","theory","unit"].includes(type)){
    slot.addEventListener("dragover",event=>{
      if(dragPayload?.type!==type)return;
      event.preventDefault();
      event.dataTransfer.dropEffect="copy";
      slot.classList.add("over");
    });
    slot.addEventListener("dragleave",()=>slot.classList.remove("over"));
    slot.addEventListener("drop",event=>{
      event.preventDefault();
      slot.classList.remove("over");
      const payload=droppedPayload(event);
      const valid=type==="unit"?rosterUnit(payload?.id):resourceDefinition(type,payload?.id);
      if(payload?.type!==type || !valid)return;
      if(type==="item" && acceptsItemClasses.length && !acceptsItemClasses.some(itemClass=>valid.storageCompatibility?.[itemClass])){
        setStatus(`${valid.name} is not compatible with ${acceptsItemClasses.map(value=>value.toUpperCase()).join("/")} storage.`);
        return;
      }
      collection[index]=payload.id;
      setStatus(`${valid.name} placed in ${type} slot ${index+1}.`);
      render();
    });
  }
  if(type==="core"){
    slot.textContent=`Empty core slot ${index+1}`;
    return slot;
  }
  if(type==="job"){
    slot.textContent=`Empty job slot ${index+1}`;
    return slot;
  }
  if(!definition){
    slot.textContent=`Drop ${type} here`;
    return slot;
  }
  const glyph=document.createElement("span");
  glyph.className="resource-slot-icon";
  if(type==="unit"){
    glyph.style.background=iconBackground(definition.classId,definition.crossPathId);
    setIconContent(glyph,iconMarkup(iconPathForRosterUnit(definition)));
  }else{
    glyph.style.background=resourceColor(definition,type);
    const image=document.createElement("img");
    image.src=resourceIcon(definition,type);
    image.alt="";
    glyph.appendChild(image);
  }
  const copy=document.createElement("div");
  const name=document.createElement("div");
  name.className="resource-slot-name";
  name.textContent=definition.name;
  const meta=document.createElement("div");
  meta.className="resource-slot-meta";
  meta.textContent=definition.id;
  copy.append(name,meta);
  const clear=document.createElement("button");
  clear.type="button";
  clear.className="resource-slot-clear";
  clear.textContent="Clear";
  clear.title=`Clear ${type} slot`;
  clear.addEventListener("click",()=>{
    collection[index]=null;
    setStatus(`Cleared ${type} slot ${index+1}.`);
    render();
  });
  slot.append(glyph,copy,clear);
  return slot;
}

function createResourceGroup(type,title,providedCollection=null,acceptsItemClasses=[]){
  const collection=providedCollection ?? resourceCollection(type);
  if(!collection.length)return null;
  const group=document.createElement("section");
  group.className="resource-group";
  const heading=document.createElement("h3");
  heading.className="resource-group-title";
  heading.textContent=title;
  const grid=document.createElement("div");
  grid.className="resource-slot-grid";
  if(collection.length>8)grid.classList.add("dense");
  grid.append(...collection.map((_,index)=>createResourceSlot(type,index,collection,acceptsItemClasses)));
  group.append(heading,grid);
  return group;
}

function renderRoomResources(){
  const resources=document.createElement("div");
  resources.className="room-resources";
  const coreGroup=createResourceGroup("core","Core slots");
  if(coreGroup)resources.append(coreGroup);
  const tabs=roomTabs();
  if(tabs.length){
    const tabArea=document.createElement("section");
    tabArea.className="room-tab-area";
    const tabList=document.createElement("div");
    tabList.className="room-tabs";
    tabList.setAttribute("role","tablist");
    for(const tab of tabs){
      const button=document.createElement("button");
      button.type="button";
      button.className=`room-tab ${tab.id===activeRoomTabId?"active":""}`.trim();
      button.textContent=tab.name;
      button.setAttribute("role","tab");
      button.setAttribute("aria-selected",String(tab.id===activeRoomTabId));
      button.addEventListener("click",()=>{activeRoomTabId=tab.id;render()});
      tabList.appendChild(button);
    }
    const active=tabs.find(tab=>tab.id===activeRoomTabId) ?? tabs[0];
    const panel=document.createElement("div");
    panel.className="room-tab-panel";
    panel.setAttribute("role","tabpanel");
    if(active?.notes){const note=document.createElement("p");note.className="room-tab-note";note.textContent=active.notes;panel.appendChild(note)}
    const labels={item:"Item slots",theory:"Theory slots",unit:"Occupant slots",job:"Work slots"};
    for(const type of ["item","theory","unit","job"]){
      const collection=roomTabResources[active?.id]?.[type];
      if(collection?.length)panel.appendChild(createResourceGroup(type,labels[type],collection,active.acceptsItemClasses ?? []));
    }
    tabArea.append(tabList,panel);
    resources.append(tabArea);
  }
  return resources;
}

function renderRoomCard(){
  roomCard.replaceChildren();
  roomCard.style.setProperty("--room-color",currentRoom.color);
  roomCard.style.setProperty("--ct-border",CT_BORDER_COLORS[currentCt]);

  if(currentLayout!=="1x1"){
    const badge=document.createElement("div");
    badge.className="join-badge";
    badge.textContent=`Joined ${currentLayout}`;
    roomCard.appendChild(badge);
  }

  const title=document.createElement("div");
  title.className="room-title";
  const heading=document.createElement("h2");
  heading.textContent=currentRoom.name;
  const meta=document.createElement("div");
  meta.className="room-meta";
  meta.textContent=`${roomShapeName()} · CT${currentCt}`;
  title.append(heading,meta);

  const intro=document.createElement("p");
  intro.className="muted";
  intro.style.color="rgba(7,16,24,.76)";
  intro.textContent=`Drag class icons into visible staff slots. Add Staff Slot reveals one more slot up to the current configured staff capacity of ${roomCapacity()}.`;

  const slotGrid=document.createElement("div");
  slotGrid.className="slot-grid";

  for(let index=0;index<Math.max(0,maxStaffSlotsFor());index++){
    const slot=document.createElement("div");
    const isUnlocked=index<revealedSlots;
    const isAvailable=index<roomCapacity();
    const assignment=assignments[index] ?? null;
    const assigned=assignment?classDef(assignment.classId):null;
    slot.className=`staff-slot ${isUnlocked?"":"locked"} ${isAvailable?"available":""} ${assigned?"filled":""}`.trim();
    slot.dataset.index=String(index);
    const indexLabel=document.createElement("div");
    indexLabel.className="slot-index";
    indexLabel.textContent=`${index+1}`;
    slot.appendChild(indexLabel);

    if(isUnlocked&&isAvailable){
      slot.addEventListener("dragover",event=>{
        if(dragPayload?.type!=="unit")return;
        event.preventDefault();
        slot.classList.add("over");
      });
      slot.addEventListener("dragleave",()=>slot.classList.remove("over"));
      slot.addEventListener("drop",event=>{
        event.preventDefault();
        slot.classList.remove("over");
        const payload=droppedPayload(event);
        if(payload?.type!=="unit")return;
        const unit=rosterUnit(payload.id);
        if(!unit)return;
        assignments[index]=createAssignmentFromUnit(unit);
        setStatus(`${unit.name} assigned to slot ${index+1}.`);
        render();
      });
    }

    if(assigned && isUnlocked && isAvailable){
      normalizeToolSelections(assignment);
      const card=document.createElement("div");
      card.className="slot-card";
      const icon=document.createElement("span");
      icon.className="class-icon";
      icon.style.background=iconBackground(assignment.classId,assignment.crossPathId);
      setIconContent(icon,iconMarkup(iconPathForAssignment(assignment)));
      const name=document.createElement("div");
      name.className="slot-name";
      name.textContent=assignmentLabel(assignment);
      const role=document.createElement("div");
      role.className="slot-role";
      role.textContent=assigned.shortName;

      const nameInput=document.createElement("input");
      nameInput.className="slot-name-input";
      nameInput.type="text";
      nameInput.placeholder="Unit name";
      nameInput.value=assignment.name;
      nameInput.addEventListener("click",event=>event.stopPropagation());
      nameInput.addEventListener("input",event=>{assignment.name=event.target.value});

      const tier=document.createElement("div");
      tier.className="slot-tier";
      tier.textContent=`Base tier: ${baseTierLabel(assignment.baseTier)}`;

      const toolTracks=assignmentToolTracks(assignment);
      const toolRows=[];
      for(const track of toolTracks){
        const toolSelect=document.createElement("select");
        toolSelect.className="slot-control";
        toolSelect.addEventListener("click",event=>event.stopPropagation());
        const emptyOption=document.createElement("option");
        emptyOption.value="";
        emptyOption.textContent=`unequipped ${track.slotLabel}`;
        toolSelect.appendChild(emptyOption);
        toolSelect.append(...track.eligibleOptions.map(option=>{
          const node=document.createElement("option");
          node.value=option;
          const optionCode=option.replace(/\d+$/,"");
          const tierIndex=Math.max(0,Number(option.match(/(\d+)$/)?.[1] ?? 1)-1);
          node.textContent=`${optionCode} ${romanTier(tierIndex)}`;
          return node;
        }));
        toolSelect.value=assignment.toolSelections[track.key] || "";
        toolSelect.addEventListener("change",event=>{
          assignment.toolSelections[track.key]=event.target.value;
          setStatus(`Slot ${index+1} ${track.label} ${event.target.value?`set to ${event.target.value}`:"cleared"}.`);
          renderPreview();
        });
        toolRows.push(toolSelect);
      }

      const actions=document.createElement("div");
      actions.className="slot-actions";
      const clearRow=document.createElement("div");
      clearRow.className="slot-clear-row";
      const clearButton=document.createElement("button");
      clearButton.type="button";
      clearButton.className="slot-control";
      clearButton.textContent="Clear";
      clearButton.addEventListener("click",event=>{
        event.stopPropagation();
        assignments[index]=null;
        setStatus(`Cleared slot ${index+1}.`);
        render();
      });
      const isSpecializationMode=assignment.branchMode==="specialization" || Boolean(assignment.specializationId);
      const isCrossMode=assignment.branchMode==="cross" || Boolean(assignment.crossPathId);
      const hasBranch=isSpecializationMode || isCrossMode;
      if(!hasBranch && assignment.baseTier<baseTierCap()){
        const addTier=document.createElement("button");
        addTier.type="button";
        addTier.className="slot-control";
        addTier.textContent="Add Tier";
        addTier.disabled=false;
        addTier.addEventListener("click",event=>{
          event.stopPropagation();
          if(assignment.baseTier>=baseTierCap())return;
          assignment.baseTier+=1;
          setStatus(`${assignmentLabel(assignment)} advanced to ${baseTierLabel(assignment.baseTier)}.`);
          render();
        });
        actions.append(addTier);
      }
      clearRow.append(clearButton);

      card.append(icon,name,role,nameInput,tier,...toolRows,actions);

      if(assignment.baseTier>=2 || assignment.specializationId || assignment.crossPathId){
        const branchControls=document.createElement("div");
        branchControls.className="slot-branch-controls";
        const isUnbranchedBaseThree=assignment.baseTier>=2 && !isSpecializationMode && !isCrossMode;

        if(isUnbranchedBaseThree){
          const specializationSelect=document.createElement("select");
          specializationSelect.className="slot-control";
          specializationSelect.addEventListener("click",event=>event.stopPropagation());
          const specializationPlaceholder=document.createElement("option");
          specializationPlaceholder.value="__placeholder__";
          specializationPlaceholder.textContent="Select specialization";
          specializationPlaceholder.selected=!assignment.specializationId;
          specializationSelect.appendChild(specializationPlaceholder);
          specializationSelect.append(...(CLASS_MATRIX[assignment.classId] ?? []).map(value=>{
            const option=document.createElement("option");
            option.value=value;
            option.textContent=value;
            return option;
          }));
          specializationSelect.value=assignment.specializationId ?? "__placeholder__";
          specializationSelect.addEventListener("change",event=>{
            if(event.target.value==="__placeholder__")return;
            assignment.specializationId=event.target.value;
            assignment.specializationTier=0;
            assignment.branchMode="specialization";
            assignment.crossPathId=null;
            assignment.crossPathTier=-1;
            setStatus(`Slot ${index+1} specialization set to ${assignment.specializationId} I.`);
            render();
          });
          branchControls.append(specializationSelect);

          const crossSelect=document.createElement("select");
          crossSelect.className="slot-control";
          crossSelect.addEventListener("click",event=>event.stopPropagation());
          const crossClasses=classCatalog.filter(entry=>entry.id!==assignment.classId);
          const crossPlaceholder=document.createElement("option");
          crossPlaceholder.value="__placeholder__";
          crossPlaceholder.textContent="Select cross path";
          crossPlaceholder.selected=!assignment.crossPathId;
          crossSelect.appendChild(crossPlaceholder);
          crossSelect.append(...crossClasses.map(entry=>{
            const option=document.createElement("option");
            option.value=entry.id;
            option.textContent=entry.name;
            return option;
          }));
          crossSelect.value=assignment.crossPathId ?? "__placeholder__";
          crossSelect.addEventListener("change",event=>{
            if(event.target.value==="__placeholder__")return;
            assignment.crossPathId=event.target.value;
            assignment.crossPathTier=0;
            assignment.branchMode="cross";
            assignment.specializationId=null;
            assignment.specializationTier=-1;
            setStatus(`Slot ${index+1} cross path set to ${titleCaseWords(assignment.crossPathId)} I.`);
            render();
          });
          branchControls.append(crossSelect);
        }

        if(isSpecializationMode){
          if(assignment.specializationId && assignment.specializationTier<2){
            const specializationButton=document.createElement("button");
            specializationButton.type="button";
            specializationButton.className="slot-control";
            specializationButton.textContent="Add Specialization";
            specializationButton.addEventListener("click",event=>{
              event.stopPropagation();
              assignment.branchMode="specialization";
              assignment.specializationTier+=1;
              setStatus(`Slot ${index+1} specialization ${assignment.specializationId} advanced to ${branchTierLabel(assignment.specializationTier)}.`);
              render();
            });
            branchControls.append(specializationButton);
          }
        }

        if(isCrossMode){
          if(assignment.crossPathId && assignment.crossPathTier<2){
            const crossButton=document.createElement("button");
            crossButton.type="button";
            crossButton.className="slot-control";
            crossButton.textContent="Add Cross Path";
            crossButton.addEventListener("click",event=>{
              event.stopPropagation();
              assignment.branchMode="cross";
              assignment.crossPathTier+=1;
              setStatus(`Slot ${index+1} cross path ${titleCaseWords(assignment.crossPathId)} advanced to ${branchTierLabel(assignment.crossPathTier)}.`);
              render();
            });
            branchControls.append(crossButton);
          }
        }

        card.appendChild(branchControls);
      }

      card.appendChild(clearRow);

      slot.appendChild(card);
    }else if(isUnlocked&&isAvailable){
      const empty=document.createElement("div");
      empty.className="slot-empty";
      empty.textContent="Open slot";
      const hint=document.createElement("div");
      hint.className="slot-hint";
      hint.textContent="Drop class here";
      slot.append(empty,hint);
    }else if(isAvailable){
      const empty=document.createElement("div");
      empty.className="slot-empty";
      empty.textContent="Hidden slot";
      const hint=document.createElement("div");
      hint.className="slot-hint";
      hint.textContent="Use Add Staff Slot";
      slot.append(empty,hint);
    }else{
      const empty=document.createElement("div");
      empty.className="slot-empty";
      empty.textContent="Not active";
      const hint=document.createElement("div");
      hint.className="slot-hint";
      hint.textContent="Requires larger joined layout";
      slot.append(empty,hint);
    }
    slotGrid.appendChild(slot);
  }

  roomCard.append(title,intro,slotGrid,renderRoomResources());
}

function renderPreview(){
  roomPreview.replaceChildren();
  const heading=document.createElement("h2");
  heading.innerHTML=`<span class="swatch" style="background:${currentRoom.color}"></span>${currentRoom.name}`;
  roomPreview.appendChild(heading);

  const runtime=document.createElement("dl");
  const runtimeData={
    selectedLayout:currentLayout,
    layoutKind:roomShapeName(),
    constructionTier:`CT${currentCt}`,
    visibleSlots:revealedSlots,
    joinedStaffingCapacity:currentRoom.joinedStaffingCapacity ?? currentRoom.schema?.rules?.joining?.staffingByLayout ?? null,
    activeCapacity:roomCapacity(),
    coreSlotCapacity:coreSlotCapacity(),
    itemSlotCapacity:itemSlotCapacity(),
    theorySlotCapacity:theorySlotCapacity(),
    assignedCount:assignedCount(),
    openSlots:openSlotCount(),
    items:roomResources.items.filter(Boolean),
    theories:roomResources.theories.filter(Boolean),
    coreSlots:roomResources.cores.map(value=>value || "_"),
    activeRoomTab:activeRoomTabId,
    roomTabs:roomTabResources,
    assignedClasses:assignments.filter(Boolean).map(entry=>({
      class:entry.classId,
      label:assignmentLabel(entry),
      name:entry.name,
      specialization:entry.specializationId?`${entry.specializationId} (${branchTierLabel(entry.specializationTier)})`:null,
      crossPath:entry.crossPathId?`${titleCaseWords(entry.crossPathId)} (${branchTierLabel(entry.crossPathTier)})`:null,
      toolSlots:assignmentToolTracks(entry).map(track=>({track:track.label,available:track.eligibleOptions,selected:(entry.toolSelections ?? {})[track.key] ?? ""}))
    }))
  };
  for(const [key,value] of Object.entries(runtimeData)){
    const term=document.createElement("dt");term.textContent=fieldLabel(key);
    const detail=document.createElement("dd");detail.appendChild(valueNode(value));
    runtime.append(term,detail);
  }
  roomPreview.appendChild(runtime);

  const configHeading=document.createElement("h2");
  configHeading.textContent="Configuration string";
  const output=document.createElement("div");
  output.id="configOutput";
  output.className="config-output";
  output.textContent=configurationString();
  roomPreview.append(configHeading,output);

  const schemaHeading=document.createElement("h2");
  schemaHeading.textContent="Schema data";
  roomPreview.appendChild(schemaHeading);
  const schemaFields=document.createElement("dl");
  for(const [key,value] of Object.entries(currentRoom.schema)){
    const term=document.createElement("dt");term.textContent=fieldLabel(key);
    const detail=document.createElement("dd");detail.appendChild(valueNode(value));
    schemaFields.append(term,detail);
  }
  roomPreview.appendChild(schemaFields);
}

function updateControls(){
  const layouts=availableLayouts(currentRoom);
  const layoutIndex=Math.max(0,layouts.indexOf(currentLayout));
  joinButton.disabled=layoutIndex>=layouts.length-1;
  joinButton.textContent=joinButton.disabled?"Max Joined":"Join Room";
  upgradeCtButton.disabled=currentCt>=currentRoom.maxConstructionTier;
  upgradeCtButton.textContent=upgradeCtButton.disabled?`CT${currentCt} Max`:`Upgrade CT`;
  addStaffButton.disabled=revealedSlots>=roomCapacity() || roomCapacity()===0;
  addStaffButton.textContent=addStaffButton.disabled?`Staff ${revealedSlots}/${roomCapacity()}`:`Add Staff Slot`;
  layoutPill.textContent=`Layout: ${currentLayout}`;
  capacityPill.textContent=`Capacity: ${roomCapacity()}`;
  staffedPill.textContent=`Assigned: ${assignedCount()}/${roomCapacity()}`;
}

function render(){
  updateControls();
  renderRoomCard();
  renderPreview();
}

function advanceJoin(){
  const layouts=availableLayouts(currentRoom);
  const index=layouts.indexOf(currentLayout);
  if(index<0 || index>=layouts.length-1)return;
  currentLayout=layouts[index+1];
  populateLayoutOptions();
  resetAssignmentsToCapacity();
  resetRoomResources();
  setSelectionStatus(`${currentRoom.name} joined to ${currentLayout}; capacity is now ${roomCapacity()}.`);
  setStatus(`Simulated joining ${currentRoom.name}; staffing capacity increased to ${roomCapacity()} and all newly gained slots were revealed.`);
  render();
}

function revealNextSlot(){
  if(revealedSlots>=roomCapacity())return;
  revealedSlots+=1;
  setStatus(`Revealed staff slot ${revealedSlots} of ${roomCapacity()}.`);
  render();
}

function clearAssignments(){
  assignments=Array.from({length:Math.max(0,maxStaffSlotsFor())},()=>null);
  setStatus("Cleared all staff assignments.");
  render();
}

function resetRoomState(){
  roomResources={items:[],theories:[],cores:[]};
  roomTabResources={};
  currentCt=1;
  currentLayout="1x1";
  revealedSlots=Math.min(roomCapacity(currentRoom,"1x1"),Math.max(0,maxStaffSlotsFor(currentRoom)));
  assignments=Array.from({length:Math.max(0,maxStaffSlotsFor(currentRoom))},()=>null);
  resetRoomResources();
  ctSelect.value="1";
  populateLayoutOptions();
  setSelectionStatus(`${currentRoom.name} reset to single-room staffing state.`);
  setStatus(`${currentRoom.name} reset.`);
  render();
}

joinButton.addEventListener("click",advanceJoin);
upgradeCtButton.addEventListener("click",()=>{
  if(currentCt>=currentRoom.maxConstructionTier)return;
  currentCt+=1;
  ctSelect.value=String(currentCt);
  resetRoomResources();
  setStatus(`${currentRoom.name} upgraded to CT${currentCt}.`);
  render();
});
addStaffButton.addEventListener("click",revealNextSlot);
resetRoomButton.addEventListener("click",resetRoomState);
loadAnalysisButton.addEventListener("click",()=>loadRoom("analysis"));
fillScientistButton.addEventListener("click",()=>{
  const scientistUnit=unitRoster.find(unit=>unit.classId==="scientist"&&unit.sortGroup==="base"&&unit.baseTier===0) ?? null;
  for(let index=0;index<roomCapacity();index++)if(index<revealedSlots&&!assignments[index]&&scientistUnit)assignments[index]=createAssignmentFromUnit(scientistUnit);
  setStatus("Filled open visible slots with prefab Scientist units.");
  render();
});
clearAssignmentsButton.addEventListener("click",clearAssignments);
roomSelect.addEventListener("change",()=>{currentLayout="1x1";revealedSlots=0;assignments=[];loadRoom(roomSelect.value)});
ctSelect.addEventListener("change",()=>{currentCt=Math.min(Number(ctSelect.value),currentRoom.maxConstructionTier);ctSelect.value=String(currentCt);resetRoomResources();render()});
layoutSelect.addEventListener("change",()=>{currentLayout=layoutSelect.value;resetAssignmentsToCapacity();resetRoomResources();setStatus(`Changed layout to ${currentLayout}; capacity ${roomCapacity()}.`);render()});
for(const control of [rosterBaseFilter,rosterSpecializationFilter,rosterCrossFilter,rosterSort])control.addEventListener("change",renderClassPalette);
document.getElementById("jsonFile").addEventListener("change",async event=>{
  const file=event.target.files?.[0];
  if(!file)return;
  try{
    roomCatalog=await loadRoomsFromFile(file);
    unitRoster=buildUnitRoster();
    populateRooms();
    populateRosterControls();
    renderClassPalette();
    currentLayout="1x1";
    loadRoom(roomCatalog.some(room=>room.id==="analysis")?"analysis":roomCatalog[0]?.id);
    setStatus(`Loaded ${roomCatalog.length} rooms from ${file.name}.`);
  }catch(error){setStatus(`Could not load JSON: ${error.message}`)}
});

async function initialize(){
  try{
    const [rooms,classes,specializationIconMap,items,theories,names]=await Promise.all([
      loadRooms(ROOM_CATALOG_URL),
      loadClassCatalog(),
      loadSpecializationIcons(),
      loadCatalogCollection(ITEM_CATALOG_URL,"itemDefinitions","item"),
      loadCatalogCollection(THEORY_CATALOG_URL,"theories","theory"),
      loadPersonnelNames()
    ]);
    roomCatalog=rooms;
    classCatalog=classes;
    classNamePools=names;
    specializationIcons=specializationIconMap;
    itemCatalog=items;
    theoryCatalog=theories;
    unitRoster=buildUnitRoster();
    populateRooms();
    populateRosterControls();
    renderClassPalette();
    renderResourcePalettes();
    currentRoom=roomDef("analysis") ?? roomCatalog[0] ?? null;
    if(!currentRoom)throw new Error("No room definitions loaded.");
    loadRoom(currentRoom.id);
    setSelectionStatus(`Loaded ${currentRoom.name}. Starting capacity ${roomCapacity()} with ${revealedSlots} visible staff slots and ${unitRoster.length} prefab units.`);
    setStatus(`Loaded ${roomCatalog.length} rooms, ${classCatalog.length} base classes, ${itemCatalog.length} items, and ${theoryCatalog.length} theories.`);
  }catch(error){
    roomSelect.disabled=true;
    ctSelect.disabled=true;
    layoutSelect.disabled=true;
    joinButton.disabled=true;
    upgradeCtButton.disabled=true;
    addStaffButton.disabled=true;
    setStatus(`Could not load demo data: ${error.message}`);
  }
}

initialize();
