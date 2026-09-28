// A shared point-up hex lattice: neighboring regular hexagons share full edges.
// Radius is center-to-vertex; width is sqrt(3) * radius, row pitch 1.5 * radius.
export function hexVertices(x,y,radius){return Array.from({length:6},(_,i)=>{const angle=(i*60-90)*Math.PI/180;return {x:x+radius*Math.cos(angle),y:y+radius*Math.sin(angle)};});}
export function layoutActionHexes(actions,radius,obstacles=[]){
  const used=new Set(),width=Math.sqrt(3)*radius;
  return actions.map(action=>{
    const desired={x:action.anchor.x,y:action.anchor.y+34};
    const nearR=Math.round(desired.y/(1.5*radius)),nearQ=Math.round(desired.x/width-nearR/2),candidates=[];
    for(let dr=-12;dr<=12;dr++)for(let dq=-12;dq<=12;dq++){
      const q=nearQ+dq,r=nearR+dr,key=`${q},${r}`,x=width*(q+r/2),y=1.5*radius*r;
      if(used.has(key)||obstacles.some(o=>x+width/2>o.x-o.halfWidth&&x-width/2<o.x+o.halfWidth&&y+radius>o.y-o.halfHeight&&y-radius<o.y+o.halfHeight))continue;
      candidates.push({key,x,y,distance:(x-desired.x)**2+(y-desired.y)**2});
    }
    candidates.sort((a,b)=>a.distance-b.distance||a.y-b.y||a.x-b.x);
    const slot=candidates[0];if(!slot)throw new Error('No room for action hexagons.');used.add(slot.key);
    return {...action,x:slot.x,y:slot.y,vertices:hexVertices(slot.x,slot.y,radius)};
  });
}
