import {canRoomsJoin, getRoomById, loadRooms, loadRoomsFromFile} from "../shared/js/rooms.js";

const COLS=12, ROWS=10, CELL=80, PAD=8;
const CATALOG_URL="../shared/data/rooms_schema.json";

let catalog=[], placed=[], groups=[], hallways=new Set();
let selectedId=null, selectedGroupId=null, nextRoomId=1, nextGroupId=1;
let selectedJoinTarget=null, actionEntries=[];

const grid=document.getElementById("grid");
const roomSelect=document.getElementById("roomSelect");
const ctSelect=document.getElementById("ctSelect");
const status=document.getElementById("status");
const legend=document.getElementById("legend");
const roomPreview=document.getElementById("roomPreview");
const placeButton=document.getElementById("placeRoom");
const removeButton=document.getElementById("removeSelected");
const rotateButton=document.getElementById("rotateDoor");
const joinCandidate=document.getElementById("joinCandidate");
const joinButton=document.getElementById("joinSelected");
const ctButton=document.getElementById("upgradeCt");
const staffButton=document.getElementById("addStaff");
const splitButton=document.getElementById("splitSelected");
const selectionStatus=document.getElementById("selectionStatus");
const actionLog=document.getElementById("actionLog");

const PREVIEW_LABELS={joinGroup:"Join group",maxConstructionTier:"Maximum CT",supportsJoining:"Supports joining",supportsProgression:"Supports progression",supportsStaffing:"Supports staffing",supportsQueues:"Supports queues",supportsStorage:"Supports storage",supportsInventory:"Supports inventory",supportsCores:"Supports cores",supportsCapacity:"Supports capacity"};
const CATEGORY_ORDER=["Command","Operations","Personnel","Science & Technology","Storage","Other"];
const CT_BORDER_COLORS={1:"#8b949e",2:"#38bdf8",3:"#f59e0b"};

function setStatus(message){status.textContent=message}
function logAction(message){
  actionEntries.push(message);if(actionEntries.length>100)actionEntries.shift();
  actionLog.replaceChildren(...actionEntries.map(entry=>{const item=document.createElement("li");item.textContent=entry;return item}));
  actionLog.scrollTop=actionLog.scrollHeight;
}
function roomDef(id){return getRoomById(catalog,id)}
function physicalRoom(id){return placed.find(room=>room.instanceId===id) ?? null}
function groupById(id){return groups.find(group=>group.id===id) ?? null}
function isGroupRef(id){return id?.startsWith("g")}

function fieldLabel(key){
  return PREVIEW_LABELS[key] ?? key.replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/^./,character=>character.toUpperCase());
}

function valueNode(value){
  if(Array.isArray(value)){
    const list=document.createElement("ul");
    for(const item of value){const entry=document.createElement("li");entry.appendChild(valueNode(item));list.appendChild(entry)}
    return list;
  }
  if(value && typeof value==="object"){
    const list=document.createElement("dl");list.className="nested";
    for(const [key,item] of Object.entries(value)){
      const term=document.createElement("dt");term.textContent=fieldLabel(key);
      const detail=document.createElement("dd");detail.appendChild(valueNode(item));list.append(term,detail);
    }
    return list;
  }
  const text=document.createElement("span");
  text.textContent=value===null?"Unknown":typeof value==="boolean"?(value?"Yes":"No"):String(value);
  return text;
}

function childRoomIds(ref){
  if(!isGroupRef(ref))return physicalRoom(ref)?[ref]:[];
  const group=groupById(ref);return group?group.children.flatMap(childRoomIds):[];
}

function recursivePriority(group){return group.children.flatMap(child=>isGroupRef(child)?recursivePriority(groupById(child)):child)}

function topActiveGroupForRoom(roomId){
  return groups.find(group=>group.active && childRoomIds(group.id).includes(roomId)) ?? null;
}

function selectedEntityRef(){return selectedGroupId ?? selectedId}

function staffingTiers(definition){
  if(!definition?.staffed)return [];
  if(Array.isArray(definition.staffingProgression))return definition.staffingProgression;
  const fixed=definition.staffingPerPhysicalRoom??definition.staffingCapacity;
  return Number.isInteger(fixed)?[fixed]:[];
}

function entityRoomIds(ref){return isGroupRef(ref)?childRoomIds(ref):physicalRoom(ref)?[ref]:[]}

function entityBounds(ref){
  const rooms=entityRoomIds(ref).map(physicalRoom).filter(Boolean);
  if(!rooms.length)return null;
  const left=Math.min(...rooms.map(room=>room.col));
  const top=Math.min(...rooms.map(room=>room.row));
  const right=Math.max(...rooms.map(room=>room.col+room.width));
  const bottom=Math.max(...rooms.map(room=>room.row+room.height));
  return {left,top,right,bottom,width:right-left,height:bottom-top};
}

function entityLabel(ref){
  if(!isGroupRef(ref)){const room=physicalRoom(ref);return room?`${roomDef(room.roomId).name} ${room.instanceId}`:ref}
  const group=groupById(ref);return group?`Group ${group.id} (${recursivePriority(group).join(" → ")})`:ref;
}

function renderPreview(){
  const instance=physicalRoom(selectedId);
  const definition=instance?roomDef(instance.roomId):roomDef(roomSelect.value);
  const previewData=definition?.schema ?? definition;
  roomPreview.replaceChildren();
  if(!definition){const message=document.createElement("p");message.className="muted";message.textContent="Select a room to inspect its current design data.";roomPreview.appendChild(message);return}

  const heading=document.createElement("h2");
  const swatch=document.createElement("span");swatch.className="swatch";swatch.style.background=definition.color;
  heading.append(swatch,document.createTextNode(definition.name));roomPreview.appendChild(heading);
  const fields=document.createElement("dl");
  const hidden=new Set(["id","name","color","schema"]);
  if(instance){
    const details={physicalRoomId:instance.instanceId,gridPosition:`Column ${instance.col+1}, row ${instance.row+1}`,constructionTier:`CT${instance.constructionTier}`,staff:instance.staffCount,doors:instance.doors?instance.doors.map(door=>`${fieldLabel(door.side)} slot ${door.slot}`):["North","East","South","West"][instance.doorIndex%4]};
    for(const [key,value] of Object.entries(details)){const term=document.createElement("dt");term.textContent=fieldLabel(key);const detail=document.createElement("dd");detail.textContent=value;fields.append(term,detail)}
  }
  if(selectedGroupId){
    const group=groupById(selectedGroupId);
    const groupData={groupId:group.id,primaryChild:group.primaryChild,secondaryChild:group.secondaryChild,recursivePriority:recursivePriority(group),active:group.active};
    for(const [key,value] of Object.entries(groupData)){const term=document.createElement("dt");term.textContent=fieldLabel(key);const detail=document.createElement("dd");detail.appendChild(valueNode(value));fields.append(term,detail)}
  }
  for(const [key,value] of Object.entries(previewData)){
    if(hidden.has(key))continue;
    const term=document.createElement("dt");term.textContent=fieldLabel(key);
    const detail=document.createElement("dd");detail.appendChild(valueNode(value));fields.append(term,detail);
  }
  roomPreview.appendChild(fields);
}

function populate(){
  roomSelect.replaceChildren();legend.replaceChildren();
  const grouped=Map.groupBy(catalog,room=>room.category??"Other");
  for(const category of CATEGORY_ORDER){
    const rooms=grouped.get(category);if(!rooms?.length)continue;
    const optionGroup=document.createElement("optgroup");optionGroup.label=category;
    const legendHeading=document.createElement("div");legendHeading.className="legend-group";legendHeading.textContent=category;legend.appendChild(legendHeading);
    for(const room of [...rooms].sort((first,second)=>first.name.localeCompare(second.name))){
      const option=document.createElement("option");option.value=room.id;option.textContent=`${room.name} (${room.width}×${room.height})`;optionGroup.appendChild(option);
      const item=document.createElement("div");item.className="legend-item";
      const swatch=document.createElement("span");swatch.className="swatch";swatch.style.background=room.color;
      item.append(swatch,document.createTextNode(room.name));legend.appendChild(item);
    }
    roomSelect.appendChild(optionGroup);
  }
  updateRoomControls();renderPreview();
}

function updateRoomControls(){
  const definition=roomDef(roomSelect.value);
  if(!definition)return;
  for(const option of ctSelect.options)option.disabled=Number(option.value)>definition.maxConstructionTier;
  if(Number(ctSelect.value)>definition.maxConstructionTier)ctSelect.value=String(definition.maxConstructionTier);
  placeButton.textContent=`Place ${definition.name}`;
}

function overlaps(col,row,width,height){
  return placed.some(room=>col<room.col+room.width&&col+width>room.col&&row<room.row+room.height&&row+height>room.row);
}

function cellKey(col,row){return `${col},${row}`}
function overlapsHallway(col,row,width,height){
  for(let y=row;y<row+height;y++)for(let x=col;x<col+width;x++)if(hallways.has(cellKey(x,y)))return true;
  return false;
}

function createPhysicalRoom(definition,col,row,constructionTier=Number(ctSelect.value),staffTierIndex=0){
  const tiers=staffingTiers(definition),safeStaffTier=Math.min(staffTierIndex,Math.max(0,tiers.length-1));
  const room={instanceId:`r${nextRoomId++}`,roomId:definition.id,col,row,width:definition.width,height:definition.height,constructionTier,doorIndex:0,staffTierIndex:safeStaffTier,staffCount:tiers[safeStaffTier]??0};
  if(definition.id==="gate_room")room.doors=randomGateDoors();
  placed.push(room);return room;
}

function randomGateDoors(){
  const sides=["north","east","south","west"];
  const doors=sides.map(side=>({side,slot:1+Math.floor(Math.random()*3)}));
  const used=new Set(doors.map(door=>`${door.side}:${door.slot}`));
  const available=sides.flatMap(side=>[1,2,3].map(slot=>({side,slot}))).filter(door=>!used.has(`${door.side}:${door.slot}`));
  doors.push(available[Math.floor(Math.random()*available.length)]);return doors;
}

function shuffled(values){
  const result=[...values];
  for(let index=result.length-1;index>0;index--){const target=Math.floor(Math.random()*(index+1));[result[index],result[target]]=[result[target],result[index]]}
  return result;
}

function forceGateDoor(room,side,slot){
  const target=room.doors.find(door=>door.side===side);target.slot=slot;
  const used=new Set();
  for(const door of room.doors){
    const key=`${door.side}:${door.slot}`;
    if(!used.has(key)){used.add(key);continue}
    const replacement=["north","east","south","west"].flatMap(candidateSide=>[1,2,3].map(candidateSlot=>({side:candidateSide,slot:candidateSlot}))).find(candidate=>!used.has(`${candidate.side}:${candidate.slot}`));
    door.side=replacement.side;door.slot=replacement.slot;used.add(`${door.side}:${door.slot}`);
  }
}

function place(col,row,definition=roomDef(roomSelect.value)){
  if(!definition)return false;
  if(definition.constructionLimit==="unique"&&placed.some(room=>room.roomId===definition.id)){setStatus(`${definition.name} is unique and has already been placed.`);return false}
  if(col<0||row<0||col+definition.width>COLS||row+definition.height>ROWS){setStatus("Room would extend past grid.");return false}
  if(overlapsHallway(col,row,definition.width,definition.height)){setStatus("That footprint is reserved as a hallway.");return false}
  if(overlaps(col,row,definition.width,definition.height)){setStatus("Room overlaps another room.");return false}
  const room=createPhysicalRoom(definition,col,row);
  logAction(`Placed ${definition.name} ${room.instanceId} at column ${col+1}, row ${row+1}; CT${room.constructionTier}; staff ${room.staffCount}.`);
  selectPhysicalRoom(room.instanceId,false);setStatus(`${definition.name} placed.`);return true;
}

function firstOpenPosition(definition){
  if(definition.id==="gate_room"){
    const centered={col:Math.floor((COLS-definition.width)/2),row:Math.floor((ROWS-definition.height)/2)};
    if(!overlaps(centered.col,centered.row,definition.width,definition.height))return centered;
  }
  for(let row=0;row<=ROWS-definition.height;row++)for(let col=0;col<=COLS-definition.width;col++)if(!overlaps(col,row,definition.width,definition.height))return {col,row};
  return null;
}

function cellOccupant(col,row){return placed.find(room=>col>=room.col&&col<room.col+room.width&&row>=room.row&&row<room.row+room.height)}

function roomsShareActiveGroup(first,second){
  if(!first||!second||first.instanceId===second.instanceId)return false;
  const group=topActiveGroupForRoom(first.instanceId);
  return Boolean(group && childRoomIds(group.id).includes(second.instanceId));
}

function joinedSides(room,localCol,localRow){
  const col=room.col+localCol,row=room.row+localRow;
  const joins={north:localRow>0,south:localRow<room.height-1,west:localCol>0,east:localCol<room.width-1};
  if(localRow===0)joins.north=roomsShareActiveGroup(room,cellOccupant(col,row-1));
  if(localRow===room.height-1)joins.south=roomsShareActiveGroup(room,cellOccupant(col,row+1));
  if(localCol===0)joins.west=roomsShareActiveGroup(room,cellOccupant(col-1,row));
  if(localCol===room.width-1)joins.east=roomsShareActiveGroup(room,cellOccupant(col+1,row));
  return joins;
}

function entitiesTouch(firstRef,secondRef){
  const first=entityRoomIds(firstRef).map(physicalRoom),second=entityRoomIds(secondRef).map(physicalRoom);
  return first.some(a=>second.some(b=>(a.col+a.width===b.col||b.col+b.width===a.col)&&a.row<b.row+b.height&&a.row+a.height>b.row||(a.row+a.height===b.row||b.row+b.height===a.row)&&a.col<b.col+b.width&&a.col+a.width>b.col));
}

function matchingJoinProperties(firstRef,secondRef){
  const firstRooms=entityRoomIds(firstRef).map(physicalRoom),secondRooms=entityRoomIds(secondRef).map(physicalRoom);
  if(!firstRooms.length||!secondRooms.length)return false;
  const firstDefinition=roomDef(firstRooms[0].roomId),secondDefinition=roomDef(secondRooms[0].roomId);
  return firstRooms.every(room=>room.roomId===firstRooms[0].roomId&&room.constructionTier===firstRooms[0].constructionTier)
    &&secondRooms.every(room=>room.roomId===secondRooms[0].roomId&&room.constructionTier===secondRooms[0].constructionTier)
    &&canRoomsJoin(firstDefinition,secondDefinition)
    &&firstRooms[0].constructionTier===secondRooms[0].constructionTier;
}

function isLegalJoin(firstRef,secondRef){
  if(!firstRef||!secondRef||firstRef===secondRef||!matchingJoinProperties(firstRef,secondRef)||!entitiesTouch(firstRef,secondRef))return false;
  const firstCount=entityRoomIds(firstRef).length,secondCount=entityRoomIds(secondRef).length;
  const bounds=entityBoundsForRefs([firstRef,secondRef]);
  if(firstCount===1&&secondCount===1)return bounds.width*bounds.height===2;
  if(firstCount===2&&secondCount===2){
    const firstBounds=entityBounds(firstRef),secondBounds=entityBounds(secondRef);
    const bothPairsAreStraight=[firstBounds,secondBounds].every(box=>box.width*box.height===2);
    return bothPairsAreStraight&&bounds.width===2&&bounds.height===2&&new Set([...entityRoomIds(firstRef),...entityRoomIds(secondRef)]).size===4;
  }
  return false;
}

function entityBoundsForRefs(refs){
  const rooms=refs.flatMap(entityRoomIds).map(physicalRoom);
  const left=Math.min(...rooms.map(room=>room.col)),top=Math.min(...rooms.map(room=>room.row));
  const right=Math.max(...rooms.map(room=>room.col+room.width)),bottom=Math.max(...rooms.map(room=>room.row+room.height));
  return {left,top,right,bottom,width:right-left,height:bottom-top};
}

function joinCandidatesFor(ref){
  if(!ref)return [];
  const count=entityRoomIds(ref).length;
  const candidates=count===1
    ?placed.filter(room=>!topActiveGroupForRoom(room.instanceId)).map(room=>room.instanceId)
    :groups.filter(group=>group.active&&!groups.some(parent=>parent.active&&parent.children.includes(group.id))).map(group=>group.id);
  return candidates.filter(candidate=>isLegalJoin(ref,candidate));
}

function updateSelectionControls(){
  const room=physicalRoom(selectedId);
  const definition=room&&roomDef(room.roomId);
  const ctRooms=entityRoomIds(selectedEntityRef()).map(physicalRoom).filter(Boolean);
  const tiers=staffingTiers(definition);
  removeButton.disabled=!room;rotateButton.disabled=!room;
  ctButton.disabled=!ctRooms.length||ctRooms.some(member=>member.constructionTier>=roomDef(member.roomId).maxConstructionTier);
  ctButton.textContent=ctRooms.length>1?`Upgrade Group CT (CT${ctRooms[0].constructionTier}/CT${definition.maxConstructionTier})`:room&&definition.maxConstructionTier>1?`Upgrade CT (CT${room.constructionTier}/CT${definition.maxConstructionTier})`:"Max CT";
  staffButton.disabled=!room||!tiers.length||room.staffTierIndex>=tiers.length-1;
  staffButton.textContent=room&&tiers.length&&room.staffTierIndex>=tiers.length-1?"Max Staff":"Add Staff";
  splitButton.disabled=!selectedGroupId;
  const ref=selectedEntityRef(),candidates=joinCandidatesFor(ref);
  if(!candidates.includes(selectedJoinTarget))selectedJoinTarget=candidates[0]??null;
  joinCandidate.replaceChildren();
  if(candidates.length){for(const candidate of candidates){const option=document.createElement("option");option.value=candidate;option.textContent=entityLabel(candidate);joinCandidate.appendChild(option)}}
  else{const option=document.createElement("option");option.textContent="No legal join candidates";joinCandidate.appendChild(option)}
  if(selectedJoinTarget)joinCandidate.value=selectedJoinTarget;
  joinCandidate.disabled=!candidates.length;joinButton.disabled=!candidates.length;
  joinButton.textContent=selectedJoinTarget?`Join with ${entityLabel(selectedJoinTarget)}`:"Join";
  if(!room)selectionStatus.textContent="No physical room selected.";
  else if(selectedGroupId)selectionStatus.textContent=`Source: Group ${selectedGroupId} (physical ${room.instanceId}).${selectedJoinTarget?` Destination: ${entityLabel(selectedJoinTarget)}.`:" No legal destination."}`;
  else selectionStatus.textContent=`Source: ${entityLabel(room.instanceId)}.${selectedJoinTarget?` Destination: ${entityLabel(selectedJoinTarget)}.`:" No legal destination."}`;
}

function selectPhysicalRoom(id,writeLog=true){
  selectedId=id;selectedGroupId=topActiveGroupForRoom(id)?.id ?? null;
  selectedJoinTarget=null;
  const room=physicalRoom(id);if(room){roomSelect.value=room.roomId;updateRoomControls()}
  if(writeLog&&room)logAction(`Selected ${entityLabel(selectedEntityRef())} using physical room ${room.instanceId}.`);
  render();
}

function handleRoomClick(roomId){
  const candidate=topActiveGroupForRoom(roomId)?.id??roomId;
  const source=selectedEntityRef();
  if(source&&candidate!==source&&isLegalJoin(source,candidate)){
    if(candidate===selectedJoinTarget){selectPhysicalRoom(roomId);setStatus(`${entityLabel(candidate)} promoted from destination to join source.`);return}
    selectedJoinTarget=candidate;logAction(`Set join destination to ${entityLabel(candidate)} for source ${entityLabel(source)}.`);setStatus(`${entityLabel(candidate)} selected as join destination.`);render();return;
  }
  selectPhysicalRoom(roomId);setStatus(`${entityLabel(roomId)} selected as source.`);
}

function createGroup(primaryChild,secondaryChild,{renderAfter=true,writeLog=true}={}){
  if(!isLegalJoin(primaryChild,secondaryChild)){setStatus("Those rooms or Groups cannot form a legal joined footprint.");return}
  for(const child of [primaryChild,secondaryChild])if(isGroupRef(child)){const group=groupById(child);group.active=false}
  const group={id:`g${nextGroupId++}`,primaryChild,secondaryChild,children:[primaryChild,secondaryChild],active:true};
  groups.push(group);selectedGroupId=group.id;selectedId=recursivePriority(group)[0];selectedJoinTarget=null;
  if(writeLog)logAction(`Joined ${entityLabel(primaryChild)} (primary) with ${entityLabel(secondaryChild)} (secondary) as Group ${group.id}; priority ${recursivePriority(group).join(" > ")}.`);
  if(renderAfter)render();setStatus(`${entityLabel(group.id)} joined.`);return group;
}

function splitGroup(groupId){
  const group=groupById(groupId);if(!group?.active)return;
  group.active=false;
  for(const child of group.children)if(isGroupRef(child)){const childGroup=groupById(child);if(childGroup)childGroup.active=true}
  selectedGroupId=topActiveGroupForRoom(selectedId)?.id ?? null;selectedJoinTarget=null;
  logAction(`Split Group ${group.id}; restored ${entityLabel(group.primaryChild)} and ${entityLabel(group.secondaryChild)}.`);render();setStatus(`Group ${group.id} split into its original children.`);
}

function removePhysicalRoom(roomId){
  const activeParents=groups.filter(group=>group.active&&childRoomIds(group.id).includes(roomId));
  for(const parent of activeParents)deactivateDependency(parent,roomId);
  for(const group of groups)if(childRoomIds(group.id).includes(roomId))group.active=false;
  const label=entityLabel(roomId);placed=placed.filter(room=>room.instanceId!==roomId);selectedId=null;selectedGroupId=null;selectedJoinTarget=null;
  logAction(`Removed ${label}; dependent active Groups were deactivated.`);render();setStatus(`Physical room ${roomId} removed.`);
}

function deactivateDependency(group,removedRoomId){
  group.active=false;
  for(const child of group.children){
    if(!isGroupRef(child))continue;
    const childGroup=groupById(child);
    if(childRoomIds(child).includes(removedRoomId))deactivateDependency(childGroup,removedRoomId);
    else childGroup.active=true;
  }
}

function addEdgeSlots(element,joins,doorSide){
  for(const side of ["north","east","south","west"]){
    if(joins[side])continue;
    for(let index=1;index<=3;index++){
      const slot=document.createElement("div");slot.className=`edge-slot ${side[0]}${index}`;
      if(index===2&&side===doorSide)slot.classList.add("door");element.appendChild(slot);
    }
  }
}

function addGateEdgeSlots(element,doors){
  for(const side of ["north","east","south","west"])for(let slotNumber=1;slotNumber<=3;slotNumber++){
    const slot=document.createElement("div");slot.className=`edge-slot ${side[0]}${slotNumber}`;
    if(doors.some(door=>door.side===side&&door.slot===slotNumber))slot.classList.add("door");element.appendChild(slot);
  }
}

function addStaffDots(element,room){
  if(!room.staffCount)return;
  const dots=document.createElement("div");dots.className="staff-dots";
  const group=topActiveGroupForRoom(room.instanceId),bounds=group&&entityBounds(group.id);
  let left=50,top=74;
  if(bounds){
    const groupCenterX=(bounds.left+bounds.right)/2,groupCenterY=(bounds.top+bounds.bottom)/2;
    const roomCenterX=room.col+room.width/2,roomCenterY=room.row+room.height/2;
    left=roomCenterX<groupCenterX?82:roomCenterX>groupCenterX?18:50;
    top=roomCenterY<groupCenterY?82:roomCenterY>groupCenterY?18:50;
  }
  dots.style.left=`${left}%`;dots.style.top=`${top}%`;
  for(let index=0;index<room.staffCount;index++){const dot=document.createElement("span");dot.className="staff-dot";dots.appendChild(dot)}
  element.appendChild(dots);
}

function addRoomNumber(element,room){
  const number=document.createElement("span");number.className="room-number";number.textContent=`#${room.instanceId.slice(1)}`;
  const group=topActiveGroupForRoom(room.instanceId),bounds=group&&entityBounds(group.id);
  let horizontal="left",vertical="top";
  if(bounds){
    const groupCenterX=(bounds.left+bounds.right)/2,groupCenterY=(bounds.top+bounds.bottom)/2;
    horizontal=room.col+room.width/2<groupCenterX?"left":"right";
    vertical=room.row+room.height/2<groupCenterY?"top":"bottom";
  }
  number.style[horizontal]="3px";number.style[vertical]="3px";element.appendChild(number);
}

function renderGateRoom(room,definition){
  const element=document.createElement("div");element.className=`room-cell gate-room${room.instanceId===selectedId?" selected":""}`;
  element.style.left=`${room.col*CELL}px`;element.style.top=`${room.row*CELL}px`;element.style.width=`${room.width*CELL}px`;element.style.height=`${room.height*CELL}px`;element.style.setProperty("--room-color",definition.color);element.style.setProperty("--ct-border",CT_BORDER_COLORS[room.constructionTier]);
  const fill=document.createElement("div");fill.className="room-fill";Object.assign(fill.style,{top:`${PAD}px`,right:`${PAD}px`,bottom:`${PAD}px`,left:`${PAD}px`});fill.textContent=`${definition.name}${room.constructionTier>1?` CT${room.constructionTier}`:""}`;element.appendChild(fill);
  addGateEdgeSlots(element,room.doors);addRoomNumber(element,room);
  element.addEventListener("click",event=>{event.stopPropagation();handleRoomClick(room.instanceId)});grid.appendChild(element);
}

function buildDoorTargetMap(){
  const targets=new Map(),add=(col,row,direction)=>{
    const key=cellKey(col,row);if(!targets.has(key))targets.set(key,new Set());targets.get(key).add(direction);
  };
  for(const room of placed){
    const doors=room.doors??[{side:["north","east","south","west"][room.doorIndex%4],slot:2}];
    for(const door of doors){
      const offset=room.doors?door.slot-1:0;
      if(door.side==="north")add(room.col+offset,room.row-1,"south");
      if(door.side==="east")add(room.col+room.width,room.row+offset,"west");
      if(door.side==="south")add(room.col+offset,room.row+room.height,"north");
      if(door.side==="west")add(room.col-1,room.row+offset,"east");
    }
  }
  return targets;
}

function render(){
  grid.replaceChildren();
  const doorTargets=buildDoorTargetMap();
  for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
    const hallway=hallways.has(cellKey(col,row));
    const cell=document.createElement("button");cell.type="button";cell.className=`cell${hallway?" hallway":""}`;cell.disabled=hallway;cell.setAttribute("aria-label",hallway?`Hallway column ${col+1}, row ${row+1}`:`Grid column ${col+1}, row ${row+1}`);cell.addEventListener("click",()=>place(col,row));grid.appendChild(cell);
    if(hallway){
      const directions=new Set(doorTargets.get(cellKey(col,row))??[]);
      for(const [direction,dx,dy] of [["north",0,-1],["east",1,0],["south",0,1],["west",-1,0]])if(hallways.has(cellKey(col+dx,row+dy)))directions.add(direction);
      const activeBlocks=new Set([4]);
      if(directions.has("north"))activeBlocks.add(1);if(directions.has("east"))activeBlocks.add(5);if(directions.has("south"))activeBlocks.add(7);if(directions.has("west"))activeBlocks.add(3);
      const pathGrid=document.createElement("span");pathGrid.className="hallway-path-grid";
      for(let index=0;index<9;index++){const block=document.createElement("span");block.className=`hallway-block${activeBlocks.has(index)?" active":""}`;pathGrid.appendChild(block)}
      cell.appendChild(pathGrid);
    }
  }
  const selectedGroupRooms=selectedGroupId?new Set(childRoomIds(selectedGroupId)):new Set();
  const destinationRooms=selectedJoinTarget?new Set(entityRoomIds(selectedJoinTarget)):new Set();
  for(const room of placed){
    const definition=roomDef(room.roomId),doorSide=["north","east","south","west"][room.doorIndex%4];
    if(definition.id==="gate_room"){renderGateRoom(room,definition);continue}
    for(let localRow=0;localRow<room.height;localRow++)for(let localCol=0;localCol<room.width;localCol++){
      const joins=joinedSides(room,localCol,localRow),element=document.createElement("div");
      element.className="room-cell"+(room.instanceId===selectedId?" selected":"")+(selectedGroupRooms.has(room.instanceId)?" group-selected":"")+(destinationRooms.has(room.instanceId)?" join-destination":"")+(definition.joinGroup?" joinable":"");
      element.style.left=`${(room.col+localCol)*CELL}px`;element.style.top=`${(room.row+localRow)*CELL}px`;element.style.setProperty("--room-color",definition.color);element.style.setProperty("--ct-border",CT_BORDER_COLORS[room.constructionTier]);
      const fill=document.createElement("div");fill.className="room-fill";
      const top=joins.north?0:PAD,right=joins.east?0:PAD,bottom=joins.south?0:PAD,left=joins.west?0:PAD;
      Object.assign(fill.style,{top:`${top}px`,right:`${right}px`,bottom:`${bottom}px`,left:`${left}px`});
      if(joins.north)fill.style.borderTopWidth="0";if(joins.east)fill.style.borderRightWidth="0";if(joins.south)fill.style.borderBottomWidth="0";if(joins.west)fill.style.borderLeftWidth="0";
      if(localCol===0&&localRow===0)fill.textContent=`${definition.name}${room.constructionTier>1?` CT${room.constructionTier}`:""}`;
      element.appendChild(fill);
      const eligible=(doorSide==="north"&&localRow===0)||(doorSide==="south"&&localRow===room.height-1)||(doorSide==="west"&&localCol===0)||(doorSide==="east"&&localCol===room.width-1);
      addEdgeSlots(element,joins,eligible?doorSide:null);
      if(localCol===0&&localRow===0){addStaffDots(element,room);addRoomNumber(element,room)}
      element.addEventListener("click",event=>{event.stopPropagation();handleRoomClick(room.instanceId)});grid.appendChild(element);
    }
  }
  updateSelectionControls();renderPreview();
}

function resetSandbox(){
  placed=[];groups=[];hallways=new Set();selectedId=null;selectedGroupId=null;selectedJoinTarget=null;nextRoomId=1;nextGroupId=1;
}

function orientDoorTowardHallway(room,preferredSide=null){
  const checks=[
    ["north",()=>Array.from({length:room.width},(_,offset)=>cellKey(room.col+offset,room.row-1))],
    ["east",()=>Array.from({length:room.height},(_,offset)=>cellKey(room.col+room.width,room.row+offset))],
    ["south",()=>Array.from({length:room.width},(_,offset)=>cellKey(room.col+offset,room.row+room.height))],
    ["west",()=>Array.from({length:room.height},(_,offset)=>cellKey(room.col-1,room.row+offset))]
  ];
  const available=checks.filter(([,keys])=>keys().some(key=>hallways.has(key))).map(([side])=>side);
  const side=available.includes(preferredSide)?preferredSide:available[0];
  if(side)room.doorIndex=["north","east","south","west"].indexOf(side);
  return side??null;
}

function generateLayout(attempt=0){
  resetSandbox();actionEntries=[];logAction("Started generated layout from a central Gate Room.");
  const add=(roomId,col,row,ct=1,staffTier=0,preferredDoor=null)=>{
    const definition=roomDef(roomId),room=createPhysicalRoom(definition,col,row,ct,staffTier);
    const doorSide=definition.id==="gate_room"?"five perimeter doors":orientDoorTowardHallway(room,preferredDoor);
    logAction(`Generated ${definition.name} ${room.instanceId} at column ${col+1}, row ${row+1}; CT${ct}; staff ${room.staffCount}; door ${doorSide??"unassigned"}.`);return room.instanceId;
  };
  const pair=(first,second)=>createGroup(first,second,{renderAfter:false}).id;
  const quad=(first,second,third,fourth)=>{
    const primary=pair(first,second),secondary=pair(third,fourth);return createGroup(primary,secondary,{renderAfter:false}).id;
  };
  const randomCt=roomId=>1+Math.floor(Math.random()*roomDef(roomId).maxConstructionTier);
  const randomStaffTier=roomId=>{const tiers=staffingTiers(roomDef(roomId));return tiers.length?Math.floor(Math.random()*tiers.length):0};
  const addVaried=(roomId,col,row,preferredDoor=null)=>add(roomId,col,row,randomCt(roomId),randomStaffTier(roomId),preferredDoor);
  const directions=shuffled([
    {side:"north",dx:0,dy:-1},{side:"east",dx:1,dy:0},{side:"south",dx:0,dy:1},{side:"west",dx:-1,dy:0}
  ]),gateCol=2+Math.floor(Math.random()*5),gateRow=2+Math.floor(Math.random()*3),gate=add("gate_room",gateCol,gateRow,1);
  const reserved=new Set();
  for(let row=gateRow;row<gateRow+3;row++)for(let col=gateCol;col<gateCol+3;col++)reserved.add(cellKey(col,row));
  const accessRooms=["infirmary","receiving"];
  directions.slice(0,2).forEach((direction,index)=>{
    const slot=Math.floor(Math.random()*3),col=direction.side==="west"?gateCol-1:direction.side==="east"?gateCol+3:gateCol+slot,row=direction.side==="north"?gateRow-1:direction.side==="south"?gateRow+3:gateRow+slot;
    reserved.add(cellKey(col,row));hallways.add(cellKey(col+direction.dx,row+direction.dy));
    forceGateDoor(physicalRoom(gate),direction.side,slot+1);addVaried(accessRooms[index],col,row,direction.side);
  });
  for(const door of physicalRoom(gate).doors){
    const offset=door.slot-1,col=door.side==="west"?gateCol-1:door.side==="east"?gateCol+3:gateCol+offset,row=door.side==="north"?gateRow-1:door.side==="south"?gateRow+3:gateRow+offset;
    if(!reserved.has(cellKey(col,row)))hallways.add(cellKey(col,row));
  }
  logAction("Connected every Gate door to an access room or a hallway branch.");
  const inBounds=(col,row)=>col>=0&&row>=0&&col<COLS&&row<ROWS;
  const blocked=(col,row)=>reserved.has(cellKey(col,row));
  const hallwayNeighbors=(col,row)=>[[0,-1],[1,0],[0,1],[-1,0]].filter(([dx,dy])=>hallways.has(cellKey(col+dx,row+dy))).length;
  const walkers=[...hallways].map(key=>key.split(",").map(Number));
  for(let step=0;step<220&&hallways.size<24;step++){
    const walker=walkers[Math.floor(Math.random()*walkers.length)],moves=shuffled([[0,-1],[1,0],[0,1],[-1,0]]);let moved=false;
    for(const [dx,dy] of moves){const col=walker[0]+dx,row=walker[1]+dy;if(!inBounds(col,row)||blocked(col,row)||hallways.has(cellKey(col,row))||hallwayNeighbors(col,row)!==1)continue;walker[0]=col;walker[1]=row;hallways.add(cellKey(col,row));moved=true;break}
    if(!moved)walkers.push([...walkers[Math.floor(Math.random()*walkers.length)]]);
    if(step%18===0)walkers.push([...walker]);
  }
  logAction(`Procedurally carved ${hallways.size} loop-free hallway cells from ${walkers.length} growing branches.`);
  const anchors={
    science:{col:Math.random()<.5?0:COLS-1,row:Math.random()<.5?0:ROWS-1},
    storage:{col:Math.random()<.5?0:COLS-1,row:Math.random()<.5?0:ROWS-1},
    personnel:{col:Math.random()<.5?0:COLS-1,row:Math.random()<.5?0:ROWS-1},
    operations:{col:gateCol+1,row:gateRow+1}
  };
  const besideHallway=(col,row)=>[[0,-1],[1,0],[0,1],[-1,0]].some(([dx,dy])=>hallways.has(cellKey(col+dx,row+dy)));
  const findShape=(shape,zone)=>{
    const candidates=[];
    for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
      const cells=shape.map(([dx,dy])=>[col+dx,row+dy]);
      if(cells.some(([x,y])=>!inBounds(x,y)||blocked(x,y)||hallways.has(cellKey(x,y))||overlaps(x,y,1,1))||!cells.some(([x,y])=>besideHallway(x,y)))continue;
      const anchor=anchors[zone],distance=Math.abs(col-anchor.col)+Math.abs(row-anchor.row);candidates.push({cells,score:distance+Math.random()*5});
    }
    return candidates.sort((first,second)=>first.score-second.score)[0]?.cells??null;
  };
  let skippedRooms=0;
  const placeShape=(roomId,shape,zone)=>{
    const cells=findShape(shape,zone);if(!cells){skippedRooms+=1;return null}
    const ct=randomCt(roomId),ids=cells.map(([col,row])=>add(roomId,col,row,ct,randomStaffTier(roomId)));
    return ids.length===4?quad(...ids):ids.length===2?pair(...ids):ids[0];
  };
  const pairShapes=[[[0,0],[1,0]],[[0,0],[0,1]]],quadShape=[[0,0],[1,0],[0,1],[1,1]];
  for(const roomId of shuffled(["analysis","research","tech_platform","data_storage","discovery"]))placeShape(roomId,[[0,0]],"science");
  placeShape("response_room",[[0,0]],"operations");placeShape("maintenance",shuffled(pairShapes)[0],"operations");
  for(const roomId of shuffled(["holding","living_quarters"]))placeShape(roomId,shuffled(pairShapes)[0],"personnel");
  for(const roomId of shuffled(["supply_storage","armor_storage","material_storage","containment"]))placeShape(roomId,shuffled(pairShapes)[0],"storage");
  for(const roomId of shuffled(["ration_storage","equipment_storage"]))placeShape(roomId,quadShape,"storage");
  const zoneForCategory=category=>category==="Science & Technology"?"science":category==="Storage"?"storage":category==="Personnel"?"personnel":"operations";
  for(const definition of catalog.filter(definition=>!placed.some(room=>room.roomId===definition.id))){
    const shape=[];for(let row=0;row<definition.height;row++)for(let col=0;col<definition.width;col++)shape.push([col,row]);
    placeShape(definition.id,shape,zoneForCategory(definition.category));
  }
  const missingRoomIds=catalog.filter(definition=>!placed.some(room=>room.roomId===definition.id)).map(definition=>definition.id);
  if((skippedRooms||missingRoomIds.length)&&attempt<100)return generateLayout(attempt+1);
  if(missingRoomIds.length){setStatus(`Could not generate a complete layout; missing ${missingRoomIds.join(", ")}.`);logAction(`Generation stopped after 100 attempts; missing room definitions: ${missingRoomIds.join(", ")}.`);render();return}
  selectedId=gate;selectedGroupId=null;selectedJoinTarget=null;roomSelect.value="gate_room";updateRoomControls();
  logAction(`Verified catalog coverage: all ${catalog.length} room definitions are present.`);
  logAction(`Finished a new procedural base from scratch${attempt?` after ${attempt+1} layout attempts`:""}; no mirror or rotation template was used.`);render();setStatus(`Generated a new base layout using all ${catalog.length} room types.`);
}

function copiedLogText(){
  const steps=actionEntries.map((entry,index)=>`${index+1}. ${entry}`).join("\n");
  const state=JSON.stringify({selectedId,selectedGroupId,selectedJoinTarget,hallways:[...hallways],placed,groups},null,2);
  return `Stargate Room Sandbox action log\n${steps}\n\nCurrent sandbox state\n${state}`;
}

async function copyLog(){
  const text=copiedLogText();
  try{await navigator.clipboard.writeText(text);setStatus("Action log and current state copied.")}
  catch{
    const field=document.createElement("textarea");field.value=text;document.body.appendChild(field);field.select();document.execCommand("copy");field.remove();setStatus("Action log and current state copied.");
  }
}

rotateButton.addEventListener("click",()=>{
  const room=physicalRoom(selectedId);if(!room)return;
  if(room.doors){
    const sides=["north","east","south","west"];
    for(const door of room.doors)door.side=sides[(sides.indexOf(door.side)+1)%4];
    logAction(`Rotated all five ${entityLabel(room.instanceId)} doors clockwise.`);render();setStatus("Gate doors rotated clockwise.");return;
  }
  room.doorIndex=(room.doorIndex+1)%4;logAction(`Rotated ${entityLabel(room.instanceId)} door to ${["north","east","south","west"][room.doorIndex]}.`);render();setStatus("Door rotated clockwise.");
});

removeButton.addEventListener("click",()=>{if(selectedId)removePhysicalRoom(selectedId)});
joinCandidate.addEventListener("change",()=>{selectedJoinTarget=joinCandidate.value;logAction(`Set join destination to ${entityLabel(selectedJoinTarget)} for source ${entityLabel(selectedEntityRef())}.`);render()});
joinButton.addEventListener("click",()=>createGroup(selectedEntityRef(),selectedJoinTarget));
ctButton.addEventListener("click",()=>{
  const members=entityRoomIds(selectedEntityRef()).map(physicalRoom).filter(Boolean);
  if(!members.length||members.some(room=>room.constructionTier>=roomDef(room.roomId).maxConstructionTier))return;
  for(const room of members)room.constructionTier+=1;
  logAction(`Upgraded ${members.length>1?`Group ${selectedGroupId}`:entityLabel(members[0].instanceId)} to CT${members[0].constructionTier}.`);render();setStatus(`${members.length>1?`Group ${selectedGroupId}`:entityLabel(members[0].instanceId)} upgraded to CT${members[0].constructionTier}.`);
});
staffButton.addEventListener("click",()=>{
  const room=physicalRoom(selectedId),definition=room&&roomDef(room.roomId),tiers=staffingTiers(definition);
  if(!room||room.staffTierIndex>=tiers.length-1)return;
  room.staffTierIndex+=1;room.staffCount=tiers[room.staffTierIndex];logAction(`Increased ${entityLabel(room.instanceId)} staffing to ${room.staffCount}.`);render();setStatus(`${definition.name} ${room.instanceId} advanced to ${room.staffCount} staff.`);
});
splitButton.addEventListener("click",()=>{if(selectedGroupId)splitGroup(selectedGroupId)});

document.getElementById("resetGrid").addEventListener("click",()=>{
  resetSandbox();logAction("Cleared the grid and reset physical room and Group numbering.");render();setStatus("Grid cleared.");
});
document.getElementById("generateLayout").addEventListener("click",()=>generateLayout());
document.getElementById("copyLog").addEventListener("click",copyLog);
document.getElementById("clearLog").addEventListener("click",()=>{actionEntries=[];actionLog.replaceChildren();setStatus("Action log cleared.")});

placeButton.addEventListener("click",()=>{
  const definition=roomDef(roomSelect.value),position=definition&&firstOpenPosition(definition);
  if(!position){setStatus("No open grid position can fit that room.");return}
  place(position.col,position.row,definition);
});

roomSelect.addEventListener("change",()=>{selectedId=null;selectedGroupId=null;selectedJoinTarget=null;updateRoomControls();logAction(`Changed placement room type to ${roomDef(roomSelect.value).name}.`);render()});

document.getElementById("jsonFile").addEventListener("change",async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{catalog=await loadRoomsFromFile(file);resetSandbox();populate();logAction(`Loaded ${catalog.length} rooms from ${file.name} and reset the sandbox.`);render();setStatus(`Loaded ${catalog.length} rooms from ${file.name}.`)}
  catch(error){setStatus(`Could not load JSON: ${error.message}`)}
});

async function initialize(){
  try{catalog=await loadRooms(CATALOG_URL);populate();logAction(`Loaded ${catalog.length} rooms from the shared catalog.`);render();setStatus(`Loaded ${catalog.length} rooms from the shared catalog.`)}
  catch(error){roomSelect.disabled=true;ctSelect.disabled=true;placeButton.disabled=true;setStatus(`Could not load the shared room catalog: ${error.message}`)}
}

initialize();
