// Presentation only. Callers supply cells and any externally joined sides;
// room-group membership, fog, doors and mission state stay with each simulator.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function joinedCellSides(cells,cell){
  const has=(dx,dy)=>cells.some(c=>c.x===cell.x+dx&&c.y===cell.y+dy);
  return {north:has(0,-1),east:has(1,0),south:has(0,1),west:has(-1,0)};
}
export function tileGeometry(cell,joins,cellSize=100,padding=0){
  const left=cell.x*cellSize+(joins.west?0:padding),right=(cell.x+1)*cellSize-(joins.east?0:padding);
  const top=cell.y*cellSize+(joins.north?0:padding),bottom=(cell.y+1)*cellSize-(joins.south?0:padding);
  const edges=[];
  if(!joins.north)edges.push({x1:left,y1:top,x2:right,y2:top});
  if(!joins.east)edges.push({x1:right,y1:top,x2:right,y2:bottom});
  if(!joins.south)edges.push({x1:right,y1:bottom,x2:left,y2:bottom});
  if(!joins.west)edges.push({x1:left,y1:bottom,x2:left,y2:top});
  return {left,top,width:right-left,height:bottom-top,edges};
}
export function surfaceGeometry(cells,{cellSize=100,padding=0,joinedSides=c=>joinedCellSides(cells,c)}={}){
  return cells.map(c=>tileGeometry(c,joinedSides(c),cellSize,padding));
}
export function renderMapSurface(cells,{fill='#344e57',stroke='#93d8c4',strokeWidth=2,dashed=false,...geometry}={}){
  const tiles=surfaceGeometry(cells,geometry);
  return `<g class="shared-map-surface">${tiles.map(t=>`<rect x="${t.left}" y="${t.top}" width="${t.width}" height="${t.height}" fill="${esc(fill)}"/>`).join('')}<path class="shared-map-outline" d="${tiles.flatMap(t=>t.edges).map(e=>`M${e.x1},${e.y1}L${e.x2},${e.y2}`).join(' ')}" fill="none" stroke="${esc(stroke)}" stroke-width="${strokeWidth}" stroke-linejoin="round" ${dashed?'stroke-dasharray="2 3"':''}/></g>`;
}
export function tileSlots(cells,{cellSize=100,columns=4}={}){
  const pitch=cellSize/columns;
  return cells.flatMap(c=>Array.from({length:columns*columns},(_,i)=>({x:c.x*cellSize+(i%columns+.5)*pitch,y:c.y*cellSize+(Math.floor(i/columns)+.5)*pitch})));
}
