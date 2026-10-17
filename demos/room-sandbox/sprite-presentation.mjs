// Visual adapter only; no rooms, staffing assignments, Services or geology are inferred.
import {spriteManifest} from '../offworld-sandbox/sprite-manifest.mjs';
import {spriteImage,spriteRectangle} from '../offworld-sandbox/sprite-renderer.mjs';
import {surfaceGeometry,renderMapSurface} from '../shared/map/renderer.mjs';

export function roomInteriorKey(roomId,installed=spriteManifest.installed){
 const key=`floor-room-${String(roomId).replaceAll('_','-')}`,entry=installed[key];
 return spriteManifest.assets[key]?.preserveFrame&&entry&&(entry.variants??[entry]).some(v=>!v.disabled&&v.src)?key:null;
}

export function roomSpriteSurface(room,cells,{cellSize=80,padding=8,joinedSides,stroke='#8b949e',dashed=false,showProps=true,showInterior=true}={}){
 const mapping=spriteManifest.roomTypes[room.roomId];
 const geometry={cellSize,padding,joinedSides},tiles=surfaceGeometry(cells,geometry);
 let html=tiles.map(t=>spriteRectangle(mapping?.floor??'floor-indoor',t.left+t.width/2,t.top+t.height/2,{width:t.width,height:t.height,identity:room.instanceId})).join('');
 const interior=showProps&&showInterior?roomInteriorKey(room.roomId):null;
 if(interior){
  // Registered transparent frame: one furnishing layout per physical room,
  // including the continuous 3x3 Gate; never repeat it in each floor cell.
  const left=Math.min(...tiles.map(t=>t.left)),top=Math.min(...tiles.map(t=>t.top));
  const width=Math.max(...tiles.map(t=>t.left+t.width))-left,height=Math.max(...tiles.map(t=>t.top+t.height))-top;
  // Authored clearance faces south. Single-door rooms rotate art with their
  // existing door; multi-door Gate rooms retain the authored orientation.
  const angle=room.doors?.length||!Number.isInteger(room.doorIndex)?0:((room.doorIndex+2)%4)*90;
  html+=spriteRectangle(interior,left+width/2,top+height/2,{width,height,angle,identity:room.instanceId});
 }
 const corners=new Map();
 for(const edge of tiles.flatMap(t=>t.edges)){
  const vertical=edge.x1===edge.x2,x=(edge.x1+edge.x2)/2,y=(edge.y1+edge.y2)/2;
  html+=spriteRectangle('wall',x,y,{width:Math.hypot(edge.x2-edge.x1,edge.y2-edge.y1),height:cellSize*.1,angle:vertical?90:0,identity:room.instanceId});
  for(const [cx,cy] of [[edge.x1,edge.y1],[edge.x2,edge.y2]]){
   const key=`${cx}:${cy}`,c=corners.get(key)??{x:cx,y:cy,axes:new Set()};c.axes.add(vertical?'v':'h');corners.set(key,c);
  }
 }
 for(const c of corners.values())if(c.axes.size===2)html+=spriteImage('corner',c.x,c.y,{size:cellSize*.08,identity:room.instanceId});
 if(showProps&&mapping&&!interior){
  // No connection state is authored here: the static Gate is inactive.
  const props=mapping.props.filter(key=>key!=='gate-open'),left=Math.min(...tiles.map(t=>t.left)),top=Math.min(...tiles.map(t=>t.top));
  const width=Math.max(...tiles.map(t=>t.left+t.width))-left,height=Math.max(...tiles.map(t=>t.top+t.height))-top;
  for(const [i,key] of props.entries()){
   const gate=key==='gate';
   const x=gate?left+width/2:left+width*(props.length===1?.5:(i+.5)/props.length);
   const y=top+height*(room.roomId==='gate_room'&&!gate ? .82 : .52);
   const size=gate?Math.min(width,height)*.65:spriteManifest.assets[key].size*cellSize/100;
   html+=spriteImage(key,x,y,{size,identity:`${room.instanceId}:prop:${key}:${i}`});
  }
 }
 // Existing CT/selection/joinability treatment stays above the art.
 return html+renderMapSurface(cells,{...geometry,fill:'none',stroke,strokeWidth:3,dashed});
}
export function geologySprite(tileId,identity){
 const key=spriteManifest.baseTiles[tileId];
 return key?spriteRectangle(key,50,50,{width:100,height:100,identity}):'';
}
export function roomDoorSprite(side,identity){return spriteImage('door',16,16,{size:32,angle:['east','west'].includes(side)?90:0,identity});}
export function staffCountSprite(identity){return spriteImage('worker',50,50,{size:100,identity});}
