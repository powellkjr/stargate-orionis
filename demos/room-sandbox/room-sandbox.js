import {canRoomsJoin, getRoomById, loadRooms, loadRoomsFromFile} from "../shared/js/rooms.js";

const COLS=12, ROWS=10, CELL=80, PAD=8;
const CATALOG_URL="../shared/data/rooms.json";

let catalog=[], placed=[], groups=[];
let selectedId=null, selectedGroupId=null, nextRoomId=1, nextGroupId=1;

const grid=document.getElementById("grid");
const roomSelect=document.getElementById("roomSelect");
const stackSelect=document.getElementById("stackSelect");
const status=document.getElementById("status");
const legend=document.getElementById("legend");
const roomPreview=document.getElementById("roomPreview");
const placeButton=document.getElementById("placeRoom");
const removeButton=document.getElementById("removeSelected");
const rotateButton=document.getElementById("rotateDoor");
const joinCandidate=document.getElementById("joinCandidate");
const joinButton=document.getElementById("joinSelected");
const splitButton=document.getElementById("splitSelected");
const selectionStatus=document.getElementById("selectionStatus");

const PREVIEW_LABELS={joinGroup:"Join group",maxStack:"Maximum stack",joinStatus:"Joining status",stackStatus:"Stacking status"};

function setStatus(message){status.textContent=message}
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
    const details={physicalRoomId:instance.instanceId,gridPosition:`Column ${instance.col+1}, row ${instance.row+1}`,stack:instance.stack,constructionTier:instance.constructionTier,doorSide:["North","East","South","West"][instance.doorIndex%4]};
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
  for(const room of catalog){
    const option=document.createElement("option");option.value=room.id;option.textContent=`${room.name} (${room.width}×${room.height})`;roomSelect.appendChild(option);
    const item=document.createElement("div");item.className="legend-item";
    const swatch=document.createElement("span");swatch.className="swatch";swatch.style.background=room.color;
    item.append(swatch,document.createTextNode(room.name));legend.appendChild(item);
  }
  updateRoomControls();renderPreview();
}

function updateRoomControls(){
  const definition=roomDef(roomSelect.value);
  if(!definition)return;
  for(const option of stackSelect.options)option.disabled=Number(option.value)>definition.maxStack;
  if(Number(stackSelect.value)>definition.maxStack)stackSelect.value=String(definition.maxStack);
  placeButton.textContent=`Place ${definition.name}`;
}

function overlaps(col,row,width,height){
  return placed.some(room=>col<room.col+room.width&&col+width>room.col&&row<room.row+room.height&&row+height>room.row);
}

function place(col,row,definition=roomDef(roomSelect.value)){
  if(!definition)return false;
  if(col<0||row<0||col+definition.width>COLS||row+definition.height>ROWS){setStatus("Room would extend past grid.");return false}
  if(overlaps(col,row,definition.width,definition.height)){setStatus("Room overlaps another room.");return false}
  const room={instanceId:`r${nextRoomId++}`,roomId:definition.id,col,row,width:definition.width,height:definition.height,stack:Number(stackSelect.value),doorIndex:0,constructionTier:"CT1"};
  placed.push(room);selectPhysicalRoom(room.instanceId);setStatus(`${definition.name} placed.`);return true;
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
    &&canRoomsJoin(firstDefinition,secondDefinition)&&firstRooms[0].constructionTier===secondRooms[0].constructionTier;
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
  removeButton.disabled=!room;rotateButton.disabled=!room;
  splitButton.disabled=!selectedGroupId;
  const ref=selectedEntityRef(),candidates=joinCandidatesFor(ref);
  joinCandidate.replaceChildren();
  if(candidates.length){for(const candidate of candidates){const option=document.createElement("option");option.value=candidate;option.textContent=entityLabel(candidate);joinCandidate.appendChild(option)}}
  else{const option=document.createElement("option");option.textContent="No legal join candidates";joinCandidate.appendChild(option)}
  joinCandidate.disabled=!candidates.length;joinButton.disabled=!candidates.length;
  if(!room)selectionStatus.textContent="No physical room selected.";
  else if(selectedGroupId)selectionStatus.textContent=`Physical ${room.instanceId} selected; active Group ${selectedGroupId} selected for Join/Split.`;
  else selectionStatus.textContent=`Physical ${room.instanceId} selected; it is not in an active Group.`;
}

function selectPhysicalRoom(id){
  selectedId=id;selectedGroupId=topActiveGroupForRoom(id)?.id ?? null;
  const room=physicalRoom(id);if(room){roomSelect.value=room.roomId;updateRoomControls()}
  render();
}

function createGroup(primaryChild,secondaryChild){
  if(!isLegalJoin(primaryChild,secondaryChild)){setStatus("Those rooms or Groups cannot form a legal joined footprint.");return}
  for(const child of [primaryChild,secondaryChild])if(isGroupRef(child)){const group=groupById(child);group.active=false}
  const group={id:`g${nextGroupId++}`,primaryChild,secondaryChild,children:[primaryChild,secondaryChild],active:true};
  groups.push(group);selectedGroupId=group.id;selectedId=recursivePriority(group)[0];render();setStatus(`${entityLabel(group.id)} joined.`);
}

function splitGroup(groupId){
  const group=groupById(groupId);if(!group?.active)return;
  group.active=false;
  for(const child of group.children)if(isGroupRef(child)){const childGroup=groupById(child);if(childGroup)childGroup.active=true}
  selectedGroupId=topActiveGroupForRoom(selectedId)?.id ?? null;render();setStatus(`Group ${group.id} split into its original children.`);
}

function removePhysicalRoom(roomId){
  const activeParents=groups.filter(group=>group.active&&childRoomIds(group.id).includes(roomId));
  for(const parent of activeParents)deactivateDependency(parent,roomId);
  for(const group of groups)if(childRoomIds(group.id).includes(roomId))group.active=false;
  placed=placed.filter(room=>room.instanceId!==roomId);selectedId=null;selectedGroupId=null;render();setStatus(`Physical room ${roomId} removed.`);
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

function render(){
  grid.replaceChildren();
  for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
    const cell=document.createElement("button");cell.type="button";cell.className="cell";cell.addEventListener("click",()=>place(col,row));grid.appendChild(cell);
  }
  const selectedGroupRooms=selectedGroupId?new Set(childRoomIds(selectedGroupId)):new Set();
  for(const room of placed){
    const definition=roomDef(room.roomId),doorSide=["north","east","south","west"][room.doorIndex%4];
    for(let localRow=0;localRow<room.height;localRow++)for(let localCol=0;localCol<room.width;localCol++){
      const joins=joinedSides(room,localCol,localRow),element=document.createElement("div");
      element.className="room-cell"+(room.instanceId===selectedId?" selected":"")+(selectedGroupRooms.has(room.instanceId)?" group-selected":"");
      element.style.left=`${(room.col+localCol)*CELL}px`;element.style.top=`${(room.row+localRow)*CELL}px`;element.style.setProperty("--room-color",definition.color);
      const fill=document.createElement("div");fill.className="room-fill";
      const top=joins.north?0:PAD,right=joins.east?0:PAD,bottom=joins.south?0:PAD,left=joins.west?0:PAD;
      Object.assign(fill.style,{top:`${top}px`,right:`${right}px`,bottom:`${bottom}px`,left:`${left}px`});
      const borderWidth=room.stack===3?"8px":room.stack===2?"5px":"2px";
      fill.style.borderWidth=borderWidth;
      if(joins.north)fill.style.borderTopWidth="0";if(joins.east)fill.style.borderRightWidth="0";if(joins.south)fill.style.borderBottomWidth="0";if(joins.west)fill.style.borderLeftWidth="0";
      if(localCol===0&&localRow===0)fill.textContent=`${definition.name}${room.stack>1?` ×${room.stack}`:""}`;
      element.appendChild(fill);
      const eligible=(doorSide==="north"&&localRow===0)||(doorSide==="south"&&localRow===room.height-1)||(doorSide==="west"&&localCol===0)||(doorSide==="east"&&localCol===room.width-1);
      addEdgeSlots(element,joins,eligible?doorSide:null);
      element.addEventListener("click",event=>{event.stopPropagation();selectPhysicalRoom(room.instanceId);setStatus(`${definition.name} ${room.instanceId} selected.`)});grid.appendChild(element);
    }
  }
  updateSelectionControls();renderPreview();
}

rotateButton.addEventListener("click",()=>{
  const room=physicalRoom(selectedId);if(!room)return;
  room.doorIndex=(room.doorIndex+1)%4;render();setStatus("Door rotated clockwise.");
});

removeButton.addEventListener("click",()=>{if(selectedId)removePhysicalRoom(selectedId)});
joinButton.addEventListener("click",()=>createGroup(selectedEntityRef(),joinCandidate.value));
splitButton.addEventListener("click",()=>{if(selectedGroupId)splitGroup(selectedGroupId)});

document.getElementById("resetGrid").addEventListener("click",()=>{
  placed=[];groups=[];selectedId=null;selectedGroupId=null;nextRoomId=1;nextGroupId=1;render();setStatus("Grid cleared.");
});

placeButton.addEventListener("click",()=>{
  const definition=roomDef(roomSelect.value),position=definition&&firstOpenPosition(definition);
  if(!position){setStatus("No open grid position can fit that room.");return}
  place(position.col,position.row,definition);
});

roomSelect.addEventListener("change",()=>{selectedId=null;selectedGroupId=null;updateRoomControls();render()});

document.getElementById("jsonFile").addEventListener("change",async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{catalog=await loadRoomsFromFile(file);placed=[];groups=[];selectedId=null;selectedGroupId=null;nextRoomId=1;nextGroupId=1;populate();render();setStatus(`Loaded ${catalog.length} rooms from ${file.name}.`)}
  catch(error){setStatus(`Could not load JSON: ${error.message}`)}
});

async function initialize(){
  try{catalog=await loadRooms(CATALOG_URL);populate();render();setStatus(`Loaded ${catalog.length} rooms from the shared catalog.`)}
  catch(error){roomSelect.disabled=true;stackSelect.disabled=true;placeButton.disabled=true;setStatus(`Could not load the shared room catalog: ${error.message}`)}
}

initialize();
