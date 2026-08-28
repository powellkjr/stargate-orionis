import {canRoomsJoin, getRoomById, loadRooms, loadRoomsFromFile} from "../shared/js/rooms.js";

const COLS=12, ROWS=10, CELL=80, PAD=8;
const CATALOG_URL="../shared/data/rooms.json";

  let catalog=[], placed=[], selectedId=null, nextId=1;

  const grid=document.getElementById("grid");
  const roomSelect=document.getElementById("roomSelect");
  const stackSelect=document.getElementById("stackSelect");
  const status=document.getElementById("status");
  const legend=document.getElementById("legend");

  function setStatus(s){status.textContent=s}

  function roomDef(id){return getRoomById(catalog,id)}

  function populate(){
    roomSelect.innerHTML=""; legend.innerHTML="";
    for(const r of catalog){
      const o=document.createElement("option");
      o.value=r.id; o.textContent=`${r.name} (${r.width}×${r.height})`;
      roomSelect.appendChild(o);

      const li=document.createElement("div");
      li.className="legend-item";
      li.innerHTML=`<span class="swatch" style="background:${r.color}"></span><span>${r.name}</span>`;
      legend.appendChild(li);
    }
    updateStack();
  }

  function updateStack(){
    const r=roomDef(roomSelect.value); if(!r)return;
    [...stackSelect.options].forEach(o=>o.disabled=Number(o.value)>r.maxStack);
    if(Number(stackSelect.value)>r.maxStack) stackSelect.value=String(r.maxStack);
  }

  function overlaps(col,row,w,h){
    return placed.some(p=>col<p.col+p.width&&col+w>p.col&&row<p.row+p.height&&row+h>p.row);
  }

  function place(col,row,def=roomDef(roomSelect.value)){
    if(!def)return;
    if(col+def.width>COLS||row+def.height>ROWS){setStatus("Room would extend past grid.");return}
    if(overlaps(col,row,def.width,def.height)){setStatus("Room overlaps another room.");return}
    const p={instanceId:"r"+nextId++,roomId:def.id,col,row,width:def.width,height:def.height,stack:Number(stackSelect.value),doorIndex:0};
    placed.push(p);selectedId=p.instanceId;render();
    setStatus(`${def.name} placed.`);
  }

  function cellOccupant(c,r){
    return placed.find(p=>c>=p.col&&c<p.col+p.width&&r>=p.row&&r<p.row+p.height);
  }

  function compatible(a,b){
    if(!a||!b||a.instanceId===b.instanceId)return false;
    const da=roomDef(a.roomId), db=roomDef(b.roomId);
    return canRoomsJoin(da,db);
  }

  function joinedSides(p,localCol,localRow){
    const globalCol=p.col+localCol, globalRow=p.row+localRow;
    const joins={north:false,south:false,west:false,east:false};

    // interior cells of same multi-cell room are always joined
    if(localRow>0) joins.north=true;
    if(localRow<p.height-1) joins.south=true;
    if(localCol>0) joins.west=true;
    if(localCol<p.width-1) joins.east=true;

    const n=cellOccupant(globalCol,globalRow-1);
    const s=cellOccupant(globalCol,globalRow+1);
    const w=cellOccupant(globalCol-1,globalRow);
    const e=cellOccupant(globalCol+1,globalRow);

    if(localRow===0 && compatible(p,n)) joins.north=true;
    if(localRow===p.height-1 && compatible(p,s)) joins.south=true;
    if(localCol===0 && compatible(p,w)) joins.west=true;
    if(localCol===p.width-1 && compatible(p,e)) joins.east=true;
    return joins;
  }

  function doorPositions(p){
    // perimeter positions in clockwise order, one middle slot per exposed side
    return ["north","east","south","west"];
  }

  function addEdgeSlots(el,joins,doorSide){
    const sides=["north","east","south","west"];
    for(const side of sides){
      if(joins[side]) continue;
      const prefix=side[0];
      for(let i=1;i<=3;i++){
        const d=document.createElement("div");
        d.className=`edge-slot ${prefix}${i}`;
        if(i===2 && side===doorSide) d.classList.add("door");
        el.appendChild(d);
      }
    }
  }

  function render(){
    grid.innerHTML="";
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const cell=document.createElement("button");
        cell.type="button";cell.className="cell";
        cell.addEventListener("click",()=>place(c,r));
        grid.appendChild(cell);
      }
    }

    for(const p of placed){
      const def=roomDef(p.roomId);
      const doorSide=doorPositions(p)[p.doorIndex%4];

      for(let lr=0;lr<p.height;lr++){
        for(let lc=0;lc<p.width;lc++){
          const joins=joinedSides(p,lc,lr);
          const el=document.createElement("div");
          el.className="room-cell"+(p.instanceId===selectedId?" selected":"");
          el.style.left=`${(p.col+lc)*CELL}px`;
          el.style.top=`${(p.row+lr)*CELL}px`;
          el.style.setProperty("--room-color",def.color);

          const fill=document.createElement("div");
          fill.className="room-fill";
          const top=joins.north?0:PAD, right=joins.east?0:PAD, bottom=joins.south?0:PAD, left=joins.west?0:PAD;
          fill.style.top=top+"px";fill.style.right=right+"px";fill.style.bottom=bottom+"px";fill.style.left=left+"px";
          fill.style.borderTopWidth=joins.north?"0":"2px";
          fill.style.borderRightWidth=joins.east?"0":"2px";
          fill.style.borderBottomWidth=joins.south?"0":"2px";
          fill.style.borderLeftWidth=joins.west?"0":"2px";
          if(p.stack===2) fill.style.borderWidth="5px";
          if(p.stack===3) fill.style.borderWidth="8px";
          // Restore joined sides after stack width
          if(joins.north) fill.style.borderTopWidth="0";
          if(joins.east) fill.style.borderRightWidth="0";
          if(joins.south) fill.style.borderBottomWidth="0";
          if(joins.west) fill.style.borderLeftWidth="0";

          // Label only first cell
          if(lc===0&&lr===0) fill.textContent=`${def.name}${p.stack>1?" ×"+p.stack:""}`;
          el.appendChild(fill);

          // Door only appears on the specific perimeter side of the whole room, on a cell touching that side.
          const wholeSideEligible =
            (doorSide==="north"&&lr===0)||
            (doorSide==="south"&&lr===p.height-1)||
            (doorSide==="west"&&lc===0)||
            (doorSide==="east"&&lc===p.width-1);

          addEdgeSlots(el,joins,wholeSideEligible?doorSide:null);

          el.addEventListener("click",e=>{
            e.stopPropagation();selectedId=p.instanceId;render();setStatus(def.name+" selected.");
          });
          grid.appendChild(el);
        }
      }
    }
  }

  document.getElementById("rotateDoor").addEventListener("click",()=>{
    const p=placed.find(x=>x.instanceId===selectedId);
    if(!p){setStatus("Select a room first.");return}
    p.doorIndex=(p.doorIndex+1)%4;render();
    setStatus("Door rotated clockwise.");
  });

  document.getElementById("removeSelected").addEventListener("click",()=>{
    if(!selectedId){setStatus("No room selected.");return}
    placed=placed.filter(p=>p.instanceId!==selectedId);selectedId=null;render();setStatus("Room removed.");
  });

  document.getElementById("resetGrid").addEventListener("click",()=>{
    placed=[];selectedId=null;render();setStatus("Grid cleared.");
  });

  document.getElementById("placeGate").addEventListener("click",()=>{
    const g=roomDef("gate_room");
    if(!g){setStatus("No gate_room in catalog.");return}
    const c=Math.floor((COLS-g.width)/2),r=Math.floor((ROWS-g.height)/2);
    place(c,r,g);
  });

  roomSelect.addEventListener("change",updateStack);

  document.getElementById("jsonFile").addEventListener("change",async e=>{
    const f=e.target.files?.[0]; if(!f)return;
    try{
      catalog=await loadRoomsFromFile(f);
      placed=[];selectedId=null;populate();render();setStatus(`Loaded ${catalog.length} rooms from ${f.name}.`);
    }catch(err){setStatus("Could not load JSON: "+err.message)}
  });

  async function initialize(){
    try{
      catalog=await loadRooms(CATALOG_URL);
      populate();render();
      setStatus(`Loaded ${catalog.length} rooms from the shared catalog.`);
    }catch(err){
      roomSelect.disabled=true;
      stackSelect.disabled=true;
      setStatus("Could not load the shared room catalog: "+err.message);
    }
  }

  initialize();
