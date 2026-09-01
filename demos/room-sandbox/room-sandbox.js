import {canRoomsJoin, getRoomById, loadRooms, loadRoomsFromFile} from "../shared/js/rooms.js?v=continuous-room-1";

const COLS=12, ROWS=10, CELL=80, PAD=8;
const CATALOG_URL="../shared/data/rooms_schema.json?v=continuous-room-1";
const BASE_TILE_URL="../shared/data/base_tiles.json";

let catalog=[], placed=[], groups=[];
let baseCatalog=[], baseMap=[];
let selectedId=null, selectedGroupId=null, nextRoomId=1, nextGroupId=1;
let selectedJoinTarget=null, actionEntries=[];
let lastGenerationSeed=null;
let showRooms=true;
let interactionMode="interact";
let excavationProgress=new Map();
let selectedBaseCell=null;
let activeExcavationTimers=new Map();
let placementProgress=new Map();
let activePlacementTimers=new Map();

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
const toggleBaseButton=document.getElementById("toggleBase");
const toggleModeButton=document.getElementById("toggleMode");

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
function baseTileDef(id){return baseCatalog.find(tile=>tile.identity.id===id) ?? null}
function physicalRoom(id){return placed.find(room=>room.instanceId===id) ?? null}
function groupById(id){return groups.find(group=>group.id===id) ?? null}
function isGroupRef(id){return id?.startsWith("g")}
function baseTileId(tile){return tile?.identity?.id ?? null}
function baseTilesWhere(predicate){return baseCatalog.filter(tile=>predicate(tile))}
function firstBaseTileId(predicate,fallback=null){return baseTileId(baseTilesWhere(predicate)[0]) ?? fallback}
function roomCategoryZone(category){return category==="Science & Technology"?"science":category==="Storage"?"storage":category==="Personnel"?"personnel":"operations"}
function roomShape(definition){
  const shape=[];
  for(let row=0;row<definition.height;row++)for(let col=0;col<definition.width;col++)shape.push([col,row]);
  return shape;
}
function roomPlacementPriority(definition){
  const area=definition.width*definition.height;
  return (definition.id==="gate_room"?1000:0)+(definition.unique?200:0)+(definition.joinGroup?100:0)+area;
}
function defaultShapeForDefinition(definition){
  if(definition.width===2&&definition.height===2)return [[0,0],[1,0],[0,1],[1,1]];
  if(definition.width===2&&definition.height===1)return [[0,0],[1,0]];
  if(definition.width===1&&definition.height===2)return [[0,0],[0,1]];
  return roomShape(definition);
}
function baseTileBadge(id){
  return String(id ?? "")
    .split("_")
    .filter(Boolean)
    .slice(0,3)
    .map(part=>part[0])
    .join("")
    .toUpperCase() || "?";
}

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

function createSeededRandom(seed){
  let state=seed>>>0;
  return ()=>{
    state=(state+0x6D2B79F5)>>>0;
    let temp=Math.imul(state^(state>>>15),1|state);
    temp^=temp+Math.imul(temp^(temp>>>7),61|temp);
    return ((temp^(temp>>>14))>>>0)/4294967296;
  };
}

function randomInt(random,max){return Math.floor(random()*max)}

async function loadBaseTiles(url){
  const response=await fetch(url);
  if(!response.ok)throw new Error(`Could not load base tile catalog (${response.status}).`);
  return await response.json();
}

async function refreshCatalogs(){
  const [rooms,tiles]=await Promise.all([loadRooms(CATALOG_URL),loadBaseTiles(BASE_TILE_URL)]);
  catalog=rooms;
  baseCatalog=tiles;
  populate();
  return {rooms,tiles};
}

function emptyBaseMap(fill="excavated_empty"){
  return Array.from({length:ROWS},()=>Array.from({length:COLS},()=>fill));
}

function setBaseTile(col,row,id){
  if(row<0||row>=ROWS||col<0||col>=COLS)return;
  baseMap[row][col]=id;
}

function baseProgress(col,row){return excavationProgress.get(cellKey(col,row)) ?? 0}
function roomPlacementProgress(col,row){return placementProgress.get(cellKey(col,row)) ?? 0}

function clearBaseProgress(col,row){excavationProgress.delete(cellKey(col,row));const key=cellKey(col,row),timer=activeExcavationTimers.get(key);if(timer){clearTimeout(timer);activeExcavationTimers.delete(key)}}
function clearPlacementProgress(col,row){placementProgress.delete(cellKey(col,row));const key=cellKey(col,row),timer=activePlacementTimers.get(key);if(timer){clearTimeout(timer);activePlacementTimers.delete(key)}}

function selectBaseCell(col,row){
  selectedBaseCell={col,row};
  selectedId=null;selectedGroupId=null;selectedJoinTarget=null;
}

function updatePreviewForBaseCell(col,row){
  selectBaseCell(col,row);
  const tileId=baseMap[row]?.[col],tile=tileId&&baseTileDef(tileId);
  renderPreview();
  setStatus(tile?`Inspecting ${tile.identity.name} at column ${col+1}, row ${row+1}.`:`No base tile found at column ${col+1}, row ${row+1}.`);
}

function advanceExcavation(col,row,step=5){
  const tileId=baseMap[row]?.[col];
  const tile=tileId&&baseTileDef(tileId);
  if(!tile){setStatus("No base tile found there.");return}
  if(!tile.rules?.excavation?.supportsExcavation){setStatus(`${tile.identity.name} cannot currently be excavated.`);return}
  const next=Math.min(100,baseProgress(col,row)+step);
  excavationProgress.set(cellKey(col,row),next);
  selectBaseCell(col,row);
  logAction(`Excavation progress at column ${col+1}, row ${row+1} (${tile.identity.name}) advanced to ${next}%.`);
  if(next>=100){
    const replacement=tile.function?.transitionOnExcavate ?? "excavated_empty";
    setBaseTile(col,row,replacement);
    clearBaseProgress(col,row);
    logAction(`Cleared ${tile.identity.name} at column ${col+1}, row ${row+1}; tile is now ${baseTileDef(replacement)?.identity.name ?? replacement}.`);
    setStatus(`${tile.identity.name} cleared at column ${col+1}, row ${row+1}.`);
  }else setStatus(`Excavating ${tile.identity.name}: ${next}%.`);
  render();
}

function startExcavation(col,row){
  const tileId=baseMap[row]?.[col],tile=tileId&&baseTileDef(tileId),key=cellKey(col,row);
  if(!tile){setStatus("No base tile found there.");return}
  if(!tile.rules?.excavation?.supportsExcavation){setStatus(`${tile.identity.name} cannot currently be excavated.`);return}
  if(activeExcavationTimers.has(key))return;
  const tick=()=>{
    advanceExcavation(col,row);
    if(baseProgress(col,row)>0){
      const timer=setTimeout(tick,180);
      activeExcavationTimers.set(key,timer);
    }else activeExcavationTimers.delete(key);
  };
  tick();
}

function advancePlacement(col,row,definition,step=10){
  const next=Math.min(100,roomPlacementProgress(col,row)+step);
  placementProgress.set(cellKey(col,row),next);
  setStatus(`Preparing ${definition.name} at column ${col+1}, row ${row+1}: ${next}%.`);
  render();
  if(next>=100){
    clearPlacementProgress(col,row);
    place(col,row,definition);
  }
}

function startPlacement(col,row,definition=roomDef(roomSelect.value)){
  const key=cellKey(col,row);
  if(!definition||activePlacementTimers.has(key))return;
  const tick=()=>{
    advancePlacement(col,row,definition);
    if(roomPlacementProgress(col,row)>0){
      const timer=setTimeout(tick,120);
      activePlacementTimers.set(key,timer);
    }else activePlacementTimers.delete(key);
  };
  tick();
}

function supportsRoomConstructionAt(col,row,width,height){
  for(let currentRow=row;currentRow<row+height;currentRow++)for(let currentCol=col;currentCol<col+width;currentCol++){
    const tileId=baseMap[currentRow]?.[currentCol];
    const tile=tileId&&baseTileDef(tileId);
    if(!tile?.rules?.construction?.supportsRoomConstruction)return false;
  }
  return true;
}

function handleGridClick(col,row){
  if(interactionMode==="inspect"){
    updatePreviewForBaseCell(col,row);
    return;
  }
  const tileId=baseMap[row]?.[col],tile=tileId&&baseTileDef(tileId);
  if(tile?.rules?.construction?.supportsRoomConstruction){startPlacement(col,row);return}
  if(tile?.rules?.excavation?.supportsExcavation){startExcavation(col,row);return}
  setStatus(tile?`${tile.identity.name} cannot be excavated or built on right now.`:"No base tile found there.");
}

function growBaseCluster(random,startCol,startRow,tileId,size){
  const queue=[[startCol,startRow]],seen=new Set([cellKey(startCol,startRow)]);
  for(let index=0;index<queue.length&&index<size;index++){
    const [col,row]=queue[index];
    setBaseTile(col,row,tileId);
    for(const [dx,dy] of shuffled([[0,-1],[1,0],[0,1],[-1,0]],random)){
      const nextCol=col+dx,nextRow=row+dy,key=cellKey(nextCol,nextRow);
      if(nextCol<0||nextCol>=COLS||nextRow<0||nextRow>=ROWS||seen.has(key))continue;
      seen.add(key);
      if(random()<.7)queue.push([nextCol,nextRow]);
    }
  }
}

function generateBaseMap(random){
  const boundaryTileId=firstBaseTileId(tile=>tile.identity.category==="Boundary");
  const buildableTileId=firstBaseTileId(tile=>tile.rules?.construction?.supportsRoomConstruction,"excavated_empty");
  const defaultRockTileId=firstBaseTileId(tile=>tile.rules?.excavation?.supportsExcavation && tile.function?.transitionOnExcavate===buildableTileId,baseTileId(baseCatalog[0]) ?? buildableTileId);
  const excavatableTiles=baseTilesWhere(tile=>tile.rules?.excavation?.supportsExcavation && baseTileId(tile)!==defaultRockTileId);
  const specialTiles=baseTilesWhere(tile=>!tile.rules?.excavation?.supportsExcavation && !tile.rules?.construction?.supportsRoomConstruction && baseTileId(tile)!==boundaryTileId);
  baseMap=emptyBaseMap(defaultRockTileId);
  for(const tile of excavatableTiles){
    const tileId=baseTileId(tile);
    const hardness=tile.rules?.geology?.hardnessTier ?? 1;
    const clusters=Math.max(1,Math.round((tile.identity.category==="Geology"?3:1)/(hardness||1)));
    for(let i=0;i<clusters;i++)growBaseCluster(random,1+randomInt(random,Math.max(1,COLS-2)),1+randomInt(random,Math.max(1,ROWS-2)),tileId,3+randomInt(random,4+Math.max(1,2-hardness)));
  }
  for(let i=0;i<Math.max(2,Math.floor((COLS*ROWS)/24));i++){
    const col=1+randomInt(random,Math.max(1,COLS-2)),row=1+randomInt(random,Math.max(1,ROWS-2));
    setBaseTile(col,row,buildableTileId);
  }
  for(const tile of specialTiles){
    const tileId=baseTileId(tile);
    const count=tile.identity.category==="Hazard"?2:1;
    for(let i=0;i<count;i++)setBaseTile(randomInt(random,COLS),randomInt(random,ROWS),tileId);
  }
  for(let col=0;col<COLS;col++){
    if(boundaryTileId){
      setBaseTile(col,0,boundaryTileId);
      setBaseTile(col,ROWS-1,boundaryTileId);
    }
  }
  for(let row=0;row<ROWS;row++){
    if(boundaryTileId){
      setBaseTile(0,row,boundaryTileId);
      setBaseTile(COLS-1,row,boundaryTileId);
    }
  }
  const requiredTiles=baseCatalog.map(tile=>baseTileId(tile)).filter(Boolean);
  const candidates=[];
  for(let row=1;row<ROWS-1;row++)for(let col=1;col<COLS-1;col++)candidates.push([col,row]);
  const shuffledCandidates=shuffled(candidates,random);
  for(const tileId of requiredTiles){
    if(baseMap.some(row=>row.includes(tileId)))continue;
    const candidate=shuffledCandidates.find(([col,row])=>baseMap[row][col]!==boundaryTileId);
    if(candidate)setBaseTile(candidate[0],candidate[1],tileId);
  }
}

function ensureVisibleBaseTileCoverage(random){
  const requiredTiles=baseCatalog.map(tile=>baseTileId(tile)).filter(Boolean);
  const uncoveredCells=[];
  for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++)if(!cellOccupant(col,row))uncoveredCells.push([col,row]);
  const shuffledCells=shuffled(uncoveredCells,random);
  for(const tileId of requiredTiles){
    const alreadyVisible=uncoveredCells.some(([col,row])=>baseMap[row]?.[col]===tileId);
    if(alreadyVisible)continue;
    const candidate=shuffledCells.find(([col,row])=>{
      const current=baseMap[row]?.[col];
      return current!==tileId && current!==undefined;
    });
    if(candidate){
      setBaseTile(candidate[0],candidate[1],tileId);
      logAction(`Adjusted visible geology coverage so ${baseTileDef(tileId)?.identity.name ?? tileId} appears on an uncovered tile at column ${candidate[0]+1}, row ${candidate[1]+1}.`);
    }
  }
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
  const baseTile=selectedBaseCell?baseTileDef(baseMap[selectedBaseCell.row]?.[selectedBaseCell.col]):null;
  const previewData=definition?.schema ?? definition;
  roomPreview.replaceChildren();
  if(!definition&&!baseTile){const message=document.createElement("p");message.className="muted";message.textContent="Select a room or base tile to inspect its current design data.";roomPreview.appendChild(message);return}
  if(baseTile&&!instance&&!selectedGroupId){
    const heading=document.createElement("h2");
    heading.textContent=baseTile.identity.name;
    roomPreview.appendChild(heading);
    const fields=document.createElement("dl");
    const baseData={...baseTile,selectedCell:{column:selectedBaseCell.col+1,row:selectedBaseCell.row+1},excavationProgress:baseProgress(selectedBaseCell.col,selectedBaseCell.row)};
    for(const [key,value] of Object.entries(baseData)){
      const term=document.createElement("dt");term.textContent=fieldLabel(key);
      const detail=document.createElement("dd");detail.appendChild(valueNode(value));fields.append(term,detail);
    }
    roomPreview.appendChild(fields);
    return;
  }

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

function createPhysicalRoom(definition,col,row,constructionTier=Number(ctSelect.value),staffTierIndex=0){
  const tiers=staffingTiers(definition),safeStaffTier=Math.min(staffTierIndex,Math.max(0,tiers.length-1));
  const room={instanceId:`r${nextRoomId++}`,roomId:definition.id,col,row,width:definition.width,height:definition.height,constructionTier,doorIndex:0,staffTierIndex:safeStaffTier,staffCount:tiers[safeStaffTier]??0};
  if(definition.id==="gate_room")room.doors=randomGateDoors();
  placed.push(room);return room;
}

function randomGateDoors(random=Math.random){
  const sides=["north","east","south","west"];
  const doors=sides.map(side=>({side,slot:1+randomInt(random,3)}));
  const used=new Set(doors.map(door=>`${door.side}:${door.slot}`));
  const available=sides.flatMap(side=>[1,2,3].map(slot=>({side,slot}))).filter(door=>!used.has(`${door.side}:${door.slot}`));
  doors.push(available[randomInt(random,available.length)]);return doors;
}

function shuffled(values,random=Math.random){
  const result=[...values];
  for(let index=result.length-1;index>0;index--){const target=randomInt(random,index+1);[result[index],result[target]]=[result[target],result[index]]}
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
  if(!supportsRoomConstructionAt(col,row,definition.width,definition.height)){setStatus("Rooms can only be placed on cleared/excavated tiles.");return false}
  if(overlaps(col,row,definition.width,definition.height)){setStatus("Room overlaps another room.");return false}
  const room=createPhysicalRoom(definition,col,row);
  clearPlacementProgress(col,row);
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

function addDoorSlots(element,joins,doors=[]){
  const grouped=Map.groupBy(doors,door=>door.side);
  for(const side of ["north","east","south","west"]){
    if(joins[side])continue;
    const sideDoors=grouped.get(side)??[];
    for(let index=1;index<=3;index++){
      const slot=document.createElement("div");slot.className=`edge-slot ${side[0]}${index}`;
      if(sideDoors.some(door=>door.slot===index))slot.classList.add("door");
      element.appendChild(slot);
    }
  }
}

function addContinuousDoors(element,doors,width,height){
  const totalWidth=width*CELL,totalHeight=height*CELL;
  for(const door of doors){
    const marker=document.createElement("div");
    marker.className=`continuous-door ${door.side}`;
    if(door.side==="north"||door.side==="south"){
      const segmentWidth=totalWidth/3;
      const left=(door.slot-1)*segmentWidth+(segmentWidth-24)/2;
      marker.style.left=`${left}px`;
      marker.style[door.side]="0";
    }else{
      const segmentHeight=totalHeight/3;
      const top=(door.slot-1)*segmentHeight+(segmentHeight-24)/2;
      marker.style.top=`${top}px`;
      marker.style[door.side]="0";
    }
    element.appendChild(marker);
  }
}

function renderContinuousRoom(room,definition,selectedGroupRooms,destinationRooms){
  const element=document.createElement("div");
  element.className="room-cell continuous-room"+(room.instanceId===selectedId?" selected":"")+(selectedGroupRooms.has(room.instanceId)?" group-selected":"")+(destinationRooms.has(room.instanceId)?" join-destination":"")+(definition.joinGroup?" joinable":"");
  element.style.left=`${room.col*CELL}px`;
  element.style.top=`${room.row*CELL}px`;
  element.style.width=`${room.width*CELL}px`;
  element.style.height=`${room.height*CELL}px`;
  element.style.setProperty("--room-color",definition.color);
  element.style.setProperty("--ct-border",CT_BORDER_COLORS[room.constructionTier]);
  const fill=document.createElement("div");
  fill.className="room-fill";
  Object.assign(fill.style,{top:`${PAD}px`,right:`${PAD}px`,bottom:`${PAD}px`,left:`${PAD}px`});
  fill.textContent=`${definition.name}${room.constructionTier>1?` CT${room.constructionTier}`:""}`;
  element.appendChild(fill);
  addContinuousDoors(element,room.doors??[],room.width,room.height);
  addStaffDots(element,room);
  addRoomNumber(element,room);
  element.addEventListener("click",event=>{event.stopPropagation();if(interactionMode==="inspect"){setStatus(`Inspecting ${definition.name} ${room.instanceId}.`);return}handleRoomClick(room.instanceId)});
  grid.appendChild(element);
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

function render(){
  grid.replaceChildren();
  for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
    const cell=document.createElement("button");cell.type="button";cell.className="cell";cell.setAttribute("aria-label",`Grid column ${col+1}, row ${row+1}`);
    const baseId=baseMap[row]?.[col];
    if(baseId){
      const definition=baseTileDef(baseId),base=document.createElement("span");
      base.className=`base-tile ${baseId}`;
      base.title=definition?`${definition.identity.name} (${baseId})`:baseId;
      const label=document.createElement("span");
      label.className="base-label";
      label.textContent=baseTileBadge(baseId);
      label.title=base.title;
      base.appendChild(label);
      cell.setAttribute("aria-label",`Grid column ${col+1}, row ${row+1}, ${definition?.identity?.name ?? baseId}`);
      cell.appendChild(base);
    }
    const progress=baseProgress(col,row);
    if(progress>0){const bar=document.createElement("span");bar.className="base-progress";const fill=document.createElement("span");fill.className="base-progress-fill";fill.style.width=`${progress}%`;bar.appendChild(fill);cell.appendChild(bar)}
    const placement=roomPlacementProgress(col,row);
    if(placement>0){const bar=document.createElement("span");bar.className="placement-progress";const fill=document.createElement("span");fill.className="placement-progress-fill";fill.style.width=`${placement}%`;bar.appendChild(fill);cell.appendChild(bar)}
    cell.addEventListener("click",()=>handleGridClick(col,row));grid.appendChild(cell);
  }
  if(!showRooms){updateSelectionControls();renderPreview();return}
  const selectedGroupRooms=selectedGroupId?new Set(childRoomIds(selectedGroupId)):new Set();
  const destinationRooms=selectedJoinTarget?new Set(entityRoomIds(selectedJoinTarget)):new Set();
  for(const room of placed){
    const definition=roomDef(room.roomId),doorSide=["north","east","south","west"][room.doorIndex%4];
    if(definition.renderMode==="continuous"){
      renderContinuousRoom(room,definition,selectedGroupRooms,destinationRooms);
      continue;
    }
    for(let localRow=0;localRow<room.height;localRow++)for(let localCol=0;localCol<room.width;localCol++){
      const joins=joinedSides(room,localCol,localRow),element=document.createElement("div");
      element.className="room-cell"+(room.instanceId===selectedId?" selected":"")+(selectedGroupRooms.has(room.instanceId)?" group-selected":"")+(destinationRooms.has(room.instanceId)?" join-destination":"")+(definition.joinGroup?" joinable":"");
      element.style.left=`${(room.col+localCol)*CELL}px`;element.style.top=`${(room.row+localRow)*CELL}px`;element.style.setProperty("--room-color",definition.color);element.style.setProperty("--ct-border",CT_BORDER_COLORS[room.constructionTier]);
      const fill=document.createElement("div");fill.className="room-fill";
      const top=joins.north?0:PAD,right=joins.east?0:PAD,bottom=joins.south?0:PAD,left=joins.west?0:PAD;
      Object.assign(fill.style,{top:`${top}px`,right:`${right}px`,bottom:`${bottom}px`,left:`${left}px`});
      if(joins.north)fill.style.borderTopWidth="0";if(joins.east)fill.style.borderRightWidth="0";if(joins.south)fill.style.borderBottomWidth="0";if(joins.west)fill.style.borderLeftWidth="0";
      if(localCol===Math.floor(room.width/2)&&localRow===Math.floor(room.height/2))fill.textContent=`${definition.name}${room.constructionTier>1?` CT${room.constructionTier}`:""}`;
      element.appendChild(fill);
      const cellDoors=(room.doors??[]).filter(door=>(door.side==="north"&&localRow===0&&localCol===door.slot-1)||(door.side==="south"&&localRow===room.height-1&&localCol===door.slot-1)||(door.side==="west"&&localCol===0&&localRow===door.slot-1)||(door.side==="east"&&localCol===room.width-1&&localRow===door.slot-1));
      const eligible=(doorSide==="north"&&localRow===0)||(doorSide==="south"&&localRow===room.height-1)||(doorSide==="west"&&localCol===0)||(doorSide==="east"&&localCol===room.width-1);
      if(room.doors?.length)addDoorSlots(element,joins,cellDoors);
      else addEdgeSlots(element,joins,eligible?doorSide:null);
      if(localCol===0&&localRow===0){addStaffDots(element,room);addRoomNumber(element,room)}
      element.addEventListener("click",event=>{event.stopPropagation();if(interactionMode==="inspect"){setStatus(`Inspecting ${definition.name} ${room.instanceId}.`);return}handleRoomClick(room.instanceId)});grid.appendChild(element);
    }
  }
  updateSelectionControls();renderPreview();
}

function resetSandbox(){
  placed=[];groups=[];selectedId=null;selectedGroupId=null;selectedJoinTarget=null;nextRoomId=1;nextGroupId=1;
}

function orientDoorToOpenSide(room,preferredSide=null){
  const sides=[];
  const canUseSide={
    north:()=>room.row>0,
    east:()=>room.col+room.width<COLS,
    south:()=>room.row+room.height<ROWS,
    west:()=>room.col>0
  };
  for(const side of ["north","east","south","west"])if(canUseSide[side]())sides.push(side);
  const side=sides.includes(preferredSide)?preferredSide:sides[0]??preferredSide??"north";
  room.doorIndex=["north","east","south","west"].indexOf(side);
  return side;
}

function oppositeSide(side){
  return side==="north"?"south":side==="south"?"north":side==="east"?"west":"east";
}

function cellsForShape(originCol,originRow,shape){
  return shape.map(([dx,dy])=>[originCol+dx,originRow+dy]);
}

function canPlaceCells(cells){
  return cells.every(([col,row])=>col>=0&&row>=0&&col<COLS&&row<ROWS&&!overlaps(col,row,1,1));
}

function edgeContactDirection(candidateCells,anchorCells){
  for(const [col,row] of candidateCells){
    for(const [anchorCol,anchorRow] of anchorCells){
      if(col===anchorCol&&row===anchorRow-1)return "south";
      if(col===anchorCol&&row===anchorRow+1)return "north";
      if(col===anchorCol-1&&row===anchorRow)return "east";
      if(col===anchorCol+1&&row===anchorRow)return "west";
    }
  }
  return null;
}

function candidatePlacementsNearAnchor(shape,anchor,zoneBias){
  const anchorRoom=physicalRoom(anchor.roomId);
  const anchorCells=[];
  for(let row=0;row<anchorRoom.height;row++)for(let col=0;col<anchorRoom.width;col++)anchorCells.push([anchorRoom.col+col,anchorRoom.row+row]);
  const seen=new Set(),results=[];
  for(const [anchorCol,anchorRow] of anchorCells){
    for(const [shapeCol,shapeRow] of shape){
      for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
        const originCol=anchorCol+dx-shapeCol,originRow=anchorRow+dy-shapeRow,key=cellKey(originCol,originRow);
        if(seen.has(key))continue;
        seen.add(key);
        const cells=cellsForShape(originCol,originRow,shape);
        if(!canPlaceCells(cells))continue;
        const contactSide=edgeContactDirection(cells,anchorCells);
        if(!contactSide)continue;
        const left=Math.min(...cells.map(([col])=>col)),top=Math.min(...cells.map(([,row])=>row));
        const score=Math.abs(left-zoneBias.col)+Math.abs(top-zoneBias.row)+Math.random()*3;
        results.push({cells,contactSide,score});
      }
    }
  }
  return results.sort((first,second)=>first.score-second.score);
}

function orphanedRoomIds(){
  const gate=placed.find(room=>room.roomId==="gate_room");
  if(!gate)return placed.map(room=>room.instanceId);
  const visited=new Set([gate.instanceId]);
  const queue=[gate.instanceId];
  while(queue.length){
    const current=physicalRoom(queue.shift());
    const neighbors=placed.filter(other=>other.instanceId!==current.instanceId&&entitiesTouch(current.instanceId,other.instanceId));
    for(const neighbor of neighbors)if(!visited.has(neighbor.instanceId)){visited.add(neighbor.instanceId);queue.push(neighbor.instanceId)}
  }
  return placed.filter(room=>!visited.has(room.instanceId)).map(room=>room.instanceId);
}

async function generateLayout(seed=Math.floor(Math.random()*0xFFFFFFFF),attempt=0){
  if(attempt===0){
    try{
      const {rooms,tiles}=await refreshCatalogs();
      logAction(`Reloaded ${rooms.length} rooms and ${tiles.length} base tile definitions before generation.`);
    }catch(error){
      setStatus(`Could not refresh catalogs for generation: ${error.message}`);
      return;
    }
  }
  const random=createSeededRandom((seed+attempt)>>>0);
  const gateDefinition=roomDef("gate_room");
  const buildableTileId=firstBaseTileId(tile=>tile.rules?.construction?.supportsRoomConstruction,"excavated_empty");
  const accessRooms=catalog
    .filter(definition=>definition.id!=="gate_room"&&definition.width===1&&definition.height===1)
    .sort((first,second)=>roomPlacementPriority(second)-roomPlacementPriority(first));
  const prioritizedDefinitions=shuffled(catalog.filter(definition=>definition.id!=="gate_room"),random)
    .sort((first,second)=>roomPlacementPriority(second)-roomPlacementPriority(first));
  lastGenerationSeed=seed>>>0;
  resetSandbox();generateBaseMap(random);actionEntries=[];logAction("Started generated layout from a central Gate Room.");
  const add=(roomId,col,row,ct=1,staffTier=0,preferredDoor=null)=>{
    const definition=roomDef(roomId),room=createPhysicalRoom(definition,col,row,ct,staffTier);
    if(definition.id==="gate_room")room.doors=randomGateDoors(random);
    const doorSide=definition.id==="gate_room"?"five perimeter doors":orientDoorToOpenSide(room,preferredDoor);
    logAction(`Generated ${definition.name} ${room.instanceId} at column ${col+1}, row ${row+1}; CT${ct}; staff ${room.staffCount}; door ${doorSide??"unassigned"}.`);return room.instanceId;
  };
  const pair=(first,second)=>createGroup(first,second,{renderAfter:false}).id;
  const quad=(first,second,third,fourth)=>{
    const primary=pair(first,second),secondary=pair(third,fourth);return createGroup(primary,secondary,{renderAfter:false}).id;
  };
  const randomCt=roomId=>1+randomInt(random,roomDef(roomId).maxConstructionTier);
  const randomStaffTier=roomId=>{const tiers=staffingTiers(roomDef(roomId));return tiers.length?randomInt(random,tiers.length):0};
  const addVaried=(roomId,col,row,preferredDoor=null)=>add(roomId,col,row,randomCt(roomId),randomStaffTier(roomId),preferredDoor);
  const directions=shuffled([
    {side:"north",dx:0,dy:-1},{side:"east",dx:1,dy:0},{side:"south",dx:0,dy:1},{side:"west",dx:-1,dy:0}
  ],random),gateCol=2+randomInt(random,5),gateRow=2+randomInt(random,3),gate=add(gateDefinition.id,gateCol,gateRow,1);
  for(let row=gateRow-1;row<gateRow+gateDefinition.height+1;row++)for(let col=gateCol-1;col<gateCol+gateDefinition.width+1;col++)if(row>0&&row<ROWS-1&&col>0&&col<COLS-1)setBaseTile(col,row,buildableTileId);
  const frontier=[{roomId:gate,zone:"operations"}];
  accessRooms.slice(0,Math.min(2,directions.length)).forEach((definition,index)=>{
    const direction=directions[index];
    const slot=randomInt(random,3),col=direction.side==="west"?gateCol-1:direction.side==="east"?gateCol+3:gateCol+slot,row=direction.side==="north"?gateRow-1:direction.side==="south"?gateRow+3:gateRow+slot;
    setBaseTile(col,row,buildableTileId);
    forceGateDoor(physicalRoom(gate),direction.side,slot+1);
    const roomId=addVaried(definition.id,col,row,oppositeSide(direction.side));
    frontier.push({roomId,zone:roomCategoryZone(definition.category)});
  });
  logAction(`Generation seed: ${lastGenerationSeed}${attempt?` (attempt ${attempt+1})`:""}.`);
  logAction("Placed Gate-adjacent access rooms without dedicated hallway tiles; circulation is implied around room footprints.");
  const anchors={
    science:{col:random()<.5?0:COLS-1,row:random()<.5?0:ROWS-1},
    storage:{col:random()<.5?0:COLS-1,row:random()<.5?0:ROWS-1},
    personnel:{col:random()<.5?0:COLS-1,row:random()<.5?0:ROWS-1},
    operations:{col:gateCol+1,row:gateRow+1}
  };
  let skippedRooms=0;
  const pickFrontierAnchor=zone=>{
    const scored=frontier.map(entry=>({entry,score:(entry.zone===zone?0:2)+random()*3})).sort((first,second)=>first.score-second.score);
    return scored[0]?.entry??null;
  };
  const placeShape=(roomId,shape,zone)=>{
    const zoneBias=anchors[zone]??anchors.operations;
    const tried=new Set();
    let placement=null,anchor=null;
    for(let attempts=0;attempts<Math.max(12,frontier.length*2)&&!placement;attempts++){
      const candidateAnchor=pickFrontierAnchor(zone);if(!candidateAnchor)break;
      const key=`${candidateAnchor.roomId}:${candidateAnchor.zone}`;
      if(tried.has(key)&&tried.size<frontier.length)continue;
      tried.add(key);
      const candidates=candidatePlacementsNearAnchor(shape,candidateAnchor,zoneBias);
      if(candidates.length){placement=candidates[0];anchor=candidateAnchor}
    }
    if(!placement){
      const fallback=[];
      for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
        const cells=cellsForShape(col,row,shape);
        if(!canPlaceCells(cells))continue;
        const left=Math.min(...cells.map(([cellCol])=>cellCol)),top=Math.min(...cells.map(([,cellRow])=>cellRow));
        fallback.push({cells,score:Math.abs(left-zoneBias.col)+Math.abs(top-zoneBias.row)+random()*5});
      }
      const picked=fallback.sort((first,second)=>first.score-second.score)[0];
      if(!picked){skippedRooms+=1;return null}
      placement={...picked,contactSide:null};
    }
    for(const [col,row] of placement.cells)setBaseTile(col,row,buildableTileId);
    const ct=randomCt(roomId),ids=placement.cells.map(([col,row])=>add(roomId,col,row,ct,randomStaffTier(roomId),placement.contactSide));
    const ref=ids.length===4?quad(...ids):ids.length===2?pair(...ids):ids[0];
    frontier.push({roomId:isGroupRef(ref)?recursivePriority(groupById(ref))[0]:ref,zone});
    if(anchor)logAction(`Connected ${roomDef(roomId).name} to ${entityLabel(anchor.roomId)} as part of the generated room tree.`);
    return ref;
  };
  for(const definition of prioritizedDefinitions){
    if(placed.some(room=>room.roomId===definition.id))continue;
    placeShape(definition.id,defaultShapeForDefinition(definition),roomCategoryZone(definition.category));
  }
  ensureVisibleBaseTileCoverage(random);
  const missingRoomIds=catalog.filter(definition=>!placed.some(room=>room.roomId===definition.id)).map(definition=>definition.id);
  const orphanIds=orphanedRoomIds();
  if((skippedRooms||missingRoomIds.length||orphanIds.length)&&attempt<100)return await generateLayout(seed,attempt+1);
  if(missingRoomIds.length){setStatus(`Could not generate a complete layout; missing ${missingRoomIds.join(", ")}.`);logAction(`Generation stopped after 100 attempts; missing room definitions: ${missingRoomIds.join(", ")}.`);render();return}
  logAction(`Orphaned rooms: ${orphanIds.length}${orphanIds.length?` (${orphanIds.join(", ")})`:"."}`);
  selectedId=gate;selectedGroupId=null;selectedJoinTarget=null;roomSelect.value="gate_room";updateRoomControls();
  logAction(`Verified catalog coverage: all ${catalog.length} room definitions are present.`);
  logAction(`Finished a new procedural base from scratch using seed ${lastGenerationSeed}${attempt?` after ${attempt+1} layout attempts`:""}; no mirror or rotation template was used.`);render();setStatus(`Generated a new base layout using all ${catalog.length} room types; seed ${lastGenerationSeed}; orphaned rooms ${orphanIds.length}.`);
}

function copiedLogText(){
  const steps=actionEntries.map((entry,index)=>`${index+1}. ${entry}`).join("\n");
  const state=JSON.stringify({lastGenerationSeed,showRooms,interactionMode,baseMap,excavationProgress:[...excavationProgress.entries()],selectedId,selectedGroupId,selectedJoinTarget,placed,groups},null,2);
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
document.getElementById("generateLayout").addEventListener("click",()=>{generateLayout().catch(error=>setStatus(`Could not generate layout: ${error.message}`))});
toggleBaseButton.addEventListener("click",()=>{showRooms=!showRooms;toggleBaseButton.textContent=showRooms?"Hide Rooms":"Show Rooms";render();setStatus(showRooms?"Room layer shown.":"Room layer hidden; geology visible.")});
toggleModeButton.addEventListener("click",()=>{interactionMode=interactionMode==="interact"?"inspect":"interact";toggleModeButton.textContent=`Mode: ${interactionMode==="interact"?"Interact":"Inspect"}`;toggleModeButton.classList.toggle("active",interactionMode==="inspect");setStatus(interactionMode==="inspect"?"Inspect mode: click rooms or geology to inspect them without changing state.":"Interact mode: click geology to excavate or cleared tiles to place/select rooms.");render()});
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
  try{const {rooms,tiles}=await refreshCatalogs();baseMap=emptyBaseMap();logAction(`Loaded ${rooms.length} rooms and ${tiles.length} base tile definitions from the shared catalogs.`);render();setStatus(`Loaded ${rooms.length} rooms and ${tiles.length} base tile definitions.`)}
  catch(error){roomSelect.disabled=true;ctSelect.disabled=true;placeButton.disabled=true;setStatus(`Could not load the shared room catalog: ${error.message}`)}
}

initialize();
