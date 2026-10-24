// Presentation topology only. Cells retain their own identity; no game state is written.
export const sides = ['north', 'east', 'south', 'west'];
const steps = [[0,-1],[1,0],[0,1],[-1,0]];
export const edgeKey = (x,y,side) => `${x},${y},${side}`;

export function resolveKitLayout(cells, doors = []) {
 const occupied = new Set(cells.map(({x,y}) => `${x},${y}`));
 if (!cells.length || occupied.size !== cells.length || cells.some(c => !Number.isInteger(c.x) || !Number.isInteger(c.y))) throw Error('Expected unique integer cells');
 const boundary = [];
 for (const {x,y} of cells) for (let i=0;i<4;i++) {
  if (!occupied.has(`${x+steps[i][0]},${y+steps[i][1]}`)) boundary.push({x,y,side:sides[i],rotation:i*90,key:edgeKey(x,y,sides[i])});
 }
 const external = new Set(boundary.map(e=>e.key)), doorSet = new Set(doors);
 for (const key of doorSet) if (!external.has(key)) throw Error(`Door must be on an exterior edge: ${key}`);
 const modules = [];
 for (const {x,y} of cells) {
  const outer = sides.map(s=>external.has(edgeKey(x,y,s)));
  modules.push({x,y,piece:'center',rotation:0,reflect:false});
  for (let i=0;i<4;i++) {
   modules.push({x,y,piece:outer[i] ? (doorSet.has(edgeKey(x,y,sides[i]))?'edge-door':'edge-normal') : 'edge-open',rotation:i*90,reflect:false});
   const previous=(i+3)%4;
   if (outer[i] || outer[previous]) modules.push({x,y,piece:outer[i]&&outer[previous]?'corner':'shared',rotation:i*90,reflect:!outer[i]});
  }
 }
 return {modules,boundary:boundary.map(e=>({...e,door:doorSet.has(e.key)}))};
}

export function rectangleCells(width,height) {
 return Array.from({length:width*height},(_,i)=>({x:i%width,y:Math.floor(i/width)}));
}
