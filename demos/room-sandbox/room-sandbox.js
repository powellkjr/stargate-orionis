import {canRoomsJoin, getRoomById, loadRooms, loadRoomsFromFile} from "../shared/js/rooms.js";

const COLS=12, ROWS=10, CELL=80, PAD=8;
const CATALOG_URL="../shared/data/rooms.json";

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

const PREVIEW_LABELS={joinGroup:"Join group",maxConstructionTier:"Maximum CT",joinStatus:"Joining status",constructionTierStatus:"CT status"};
const CATEGORY_ORDER=["Command","Operations","Personnel","Science & Technology","Storage","Other"];

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
  roomPreview.replaceChildren();
  if(!definition){const message=document.createElement("p");message.className="muted";message.textContent="Select a room to inspect its current design data.";roomPreview.appendChild(message);return}

  const heading=document.createElement("h2");
  const swatch=document.createElement("span");swatch.className="swatch";swatch.style.background=definition.color;
  heading.append(swatch,document.createTextNode(definition.name));roomPreview.appendChild(heading);
  const fields=document.createElement("dl");
  const hidden=new Set(["id","name","color","openQuestions"]);
  if(instance){
    const details={physicalRoomId:instance.instanceId,gridPosition:`Column ${instance.col+1}, row ${instance.row+1}`,constructionTier:`CT${instance.constructionTier}`,staff:instance.staffCount,doors:instance.doors?instance.doors.map(door=>`${fieldLabel(door.side)} slot ${door.slot}`):["North","East","South","West"][instance.doorIndex%4]};
    for(const [key,value] of Object.entries(details)){const term=document.createElement("dt");term.textContent=fieldLabel(key);const detail=document.createElement("dd");detail.textContent=value;fields.append(term,detail)}
  }
  if(selectedGroupId){
    const group=groupById(selectedGroupId);
    const groupData={groupId:group.id,primaryChild:group.primaryChild,secondaryChild:group.secondaryChild,recursivePriority:recursivePriority(group),active:group.active};
    for(const [key,value] of Object.entries(groupData)){const term=document.createElement("dt");term.textContent=fieldLabel(key);const detail=document.createElement("dd");detail.appendChild(valueNode(value));fields.append(term,detail)}
  }
  for(const [key,value] of Object.entries(definition)){
    if(hidden.has(key))continue;
    const term=document.createElement("dt");term.textContent=fieldLabel(key);
    const detail=document.createElement("dd");detail.appendChild(valueNode(value));fields.append(term,detail);
  }
  if(definition.openQuestions?.length){
    const questions=document.createElement("div");questions.className="questions";
    const label=document.createElement("strong");label.textContent="Open questions";
    questions.append(label,valueNode(definition.openQuestions));fields.appendChild(questions);
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
  if(definition.unique&&placed.some(room=>room.roomId===definition.id)){setStatus(`${definition.name} is unique and has already been placed.`);return false}
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
  const element=document.createElement("div");element.className=`room-cell${room.instanceId===selectedId?" selected":""}`;
  element.style.left=`${room.col*CELL}px`;element.style.top=`${room.row*CELL}px`;element.style.width=`${room.width*CELL}px`;element.style.height=`${room.height*CELL}px`;element.style.setProperty("--room-color",definition.color);
  const fill=document.createElement("div");fill.className="room-fill";Object.assign(fill.style,{top:`${PAD}px`,right:`${PAD}px`,bottom:`${PAD}px`,left:`${PAD}px`,borderWidth:room.constructionTier===3?"8px":room.constructionTier===2?"5px":"2px"});fill.textContent=`${definition.name}${room.constructionTier>1?` CT${room.constructionTier}`:""}`;element.appendChild(fill);
  addGateEdgeSlots(element,room.doors);addRoomNumber(element,room);
  element.addEventListener("click",event=>{event.stopPropagation();handleRoomClick(room.instanceId)});grid.appendChild(element);
}

function render(){
  grid.replaceChildren();
  for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
    const hallway=hallways.has(cellKey(col,row));
    const cell=document.createElement("button");cell.type="button";cell.className=`cell${hallway?" hallway":""}`;cell.disabled=hallway;cell.setAttribute("aria-label",hallway?`Hallway column ${col+1}, row ${row+1}`:`Grid column ${col+1}, row ${row+1}`);cell.addEventListener("click",()=>place(col,row));grid.appendChild(cell);
  }
  const selectedGroupRooms=selectedGroupId?new Set(childRoomIds(selectedGroupId)):new Set();
  const destinationRooms=selectedJoinTarget?new Set(entityRoomIds(selectedJoinTarget)):new Set();
  for(const room of placed){
    const definition=roomDef(room.roomId),doorSide=["north","east","south","west"][room.doorIndex%4];
    if(definition.id==="gate_room"){renderGateRoom(room,definition);continue}
    for(let localRow=0;localRow<room.height;localRow++)for(let localCol=0;localCol<room.width;localCol++){
      const joins=joinedSides(room,localCol,localRow),element=document.createElement("div");
      element.className="room-cell"+(room.instanceId===selectedId?" selected":"")+(selectedGroupRooms.has(room.instanceId)?" group-selected":"")+(destinationRooms.has(room.instanceId)?" join-destination":"")+(definition.joinGroup?" joinable":"");
      element.style.left=`${(room.col+localCol)*CELL}px`;element.style.top=`${(room.row+localRow)*CELL}px`;element.style.setProperty("--room-color",definition.color);
      const fill=document.createElement("div");fill.className="room-fill";
      const top=joins.north?0:PAD,right=joins.east?0:PAD,bottom=joins.south?0:PAD,left=joins.west?0:PAD;
      Object.assign(fill.style,{top:`${top}px`,right:`${right}px`,bottom:`${bottom}px`,left:`${left}px`});
      const borderWidth=room.constructionTier===3?"8px":room.constructionTier===2?"5px":"2px";
      fill.style.borderWidth=borderWidth;
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

function generateLayout(){
  resetSandbox();actionEntries=[];logAction("Started generated layout from a central Gate Room.");
  for(let col=3;col<=7;col++)hallways.add(cellKey(col,2));
  for(let row=2;row<=6;row++){hallways.add(cellKey(3,row));hallways.add(cellKey(7,row))}
  for(let row=0;row<=2;row++)hallways.add(cellKey(5,row));
  for(let col=0;col<=3;col++)hallways.add(cellKey(col,4));
  for(let col=7;col<COLS;col++)hallways.add(cellKey(col,4));
  for(let col=0;col<COLS;col++){hallways.add(cellKey(col,6));hallways.add(cellKey(col,9))}
  for(const col of [2,5,8,11])for(let row=6;row<=9;row++)hallways.add(cellKey(col,row));
  logAction(`Generated ${hallways.size} connected hallway cells around the Gate and room wings.`);
  const add=(roomId,col,row,ct=1,staffTier=0,preferredDoor=null)=>{
    const definition=roomDef(roomId),room=createPhysicalRoom(definition,col,row,ct,staffTier);
    const doorSide=definition.id==="gate_room"?"five perimeter doors":orientDoorTowardHallway(room,preferredDoor);
    logAction(`Generated ${definition.name} ${room.instanceId} at column ${col+1}, row ${row+1}; CT${ct}; staff ${room.staffCount}; door ${doorSide??"unassigned"}.`);return room.instanceId;
  };
  const pair=(first,second)=>createGroup(first,second,{renderAfter:false}).id;
  const quad=(first,second,third,fourth)=>{
    const primary=pair(first,second),secondary=pair(third,fourth);return createGroup(primary,secondary,{renderAfter:false}).id;
  };

  const gate=add("gate_room",4,3,1);
  forceGateDoor(physicalRoom(gate),"east",1);
  add("analysis",4,0,2,1);add("research",6,0,3,2);add("tech_platform",4,1,2);add("data_storage",6,1,3);add("discovery",7,1,1);
  pair(add("maintenance",0,3,2),add("maintenance",1,3,2));
  pair(add("supply_storage",0,5,3),add("supply_storage",1,5,3));
  add("receiving",8,3,2,0,"west");add("response_room",9,3,2,1);pair(add("holding",10,3,1),add("holding",11,3,1));
  pair(add("infirmary",8,5,2),add("infirmary",9,5,2));pair(add("living_quarters",10,5,3),add("living_quarters",11,5,3));
  quad(add("ration_storage",0,7,1),add("ration_storage",1,7,1),add("ration_storage",0,8,1),add("ration_storage",1,8,1));
  pair(add("armor_storage",3,7,1),add("armor_storage",3,8,1));pair(add("material_storage",4,7,2),add("material_storage",4,8,2));
  pair(add("supply_storage",6,7,3),add("supply_storage",6,8,3));pair(add("containment",7,7,3),add("containment",7,8,3));
  quad(add("equipment_storage",9,7,2),add("equipment_storage",10,7,2),add("equipment_storage",9,8,2),add("equipment_storage",10,8,2));
  selectedId=gate;selectedGroupId=null;selectedJoinTarget=null;roomSelect.value="gate_room";updateRoomControls();
  logAction("Finished connected generated layout; every room door faces an adjacent hallway.");render();setStatus("Generated a connected central-Gate base with hallway-facing doors.");
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
document.getElementById("generateLayout").addEventListener("click",generateLayout);
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
