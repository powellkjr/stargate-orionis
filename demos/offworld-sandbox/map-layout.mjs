import {surfaceGeometry,tileSlots} from '../shared/map/renderer.mjs?v=dialogue-doors-1';
export const stageEdges=cells=>surfaceGeometry(cells).flatMap(t=>t.edges);
export const stageSlots=cells=>tileSlots(cells);
export function mapLayout(m,s){
  const points={},obstacles=[];
  for(const stage of m.stages){
    const slots=stageSlots(stage.cells),occupied=[];
    const label=stage.cells[0];
    occupied.push({x:label.x*100+50,y:label.y*100+12,halfWidth:50,halfHeight:12});
    const vectors={NORTH:[0,-1],EAST:[1,0],SOUTH:[0,1],WEST:[-1,0]};
    for(const t of m.transitions.filter(t=>(t.fromStageId===stage.stageId||t.toStageId===stage.stageId))){
      const [dx,dy]=vectors[t.directionFrom],cell=m.indexes.stages[t.fromStageId].cells.find(c=>m.indexes.stages[t.toStageId].cells.some(b=>b.x===c.x+dx&&b.y===c.y+dy));
      const x=(cell.x+.5+dx*.5)*100,y=(cell.y+.5+dy*.5)*100;
      occupied.push({x,y,halfWidth:27,halfHeight:27});
    }
    const collides=(p,radius)=>occupied.some(o=>o.radius!==undefined?Math.hypot(o.x-p.x,o.y-p.y)<o.radius+radius+3:Math.abs(o.x-p.x)<o.halfWidth+radius+2&&Math.abs(o.y-p.y)<o.halfHeight+radius+2);
    const reserve=(id,desired,radius)=>{
      const candidates=slots.filter(p=>!collides(p,radius));
      candidates.sort((a,b)=>Math.hypot(a.x-desired.x,a.y-desired.y)-Math.hypot(b.x-desired.x,b.y-desired.y)||a.y-b.y||a.x-b.x);
      // Never wrap around to an occupied slot; dense authored stages can use a
      // finer search while maintaining the same collision clearance.
      if(!candidates.length)for(const c of stage.cells)for(let y=10;y<100;y+=5)for(let x=10;x<100;x+=5){const p={x:c.x*100+x,y:c.y*100+y};if(!collides(p,radius))candidates.push(p);}
      const point=candidates[0];if(!point)throw new Error(`No free map position in ${stage.stageId}`);
      points[id]=point;occupied.push({...point,radius});obstacles.push({...point,halfWidth:radius+3,halfHeight:radius+3});
    };
    const instances=m.instances.filter(i=>i.stageId===stage.stageId);
    for(const [index,d] of instances.entries()){
      const c=stage.cells[index%stage.cells.length];
      if(d.instanceId===m.gate.instanceId){const p={x:c.x*100+50,y:c.y*100+50};points[d.instanceId]=p;occupied.push({...p,radius:28});obstacles.push({...p,halfWidth:30,halfHeight:30});}
      else reserve(d.instanceId,d.mapPosition?{x:d.mapPosition.x*100,y:d.mapPosition.y*100}:{x:c.x*100+25+(Math.floor(index/stage.cells.length)%2)*50,y:c.y*100+40+(Math.floor(index/(stage.cells.length*2))%2)*35},d.mapGlyph==='PERSON'?8:10);
    }
    for(const u of s.units.filter(u=>u.currentStageId===stage.stageId&&['ACTIVE_PARTY','STATIONED'].includes(u.partyStatus))){
      const work=s.activeWork.find(w=>w.actorId===u.unitId&&['MOVING_TO_TARGET','EXECUTING'].includes(w.status));
      const target=work?m.indexes.interactionTargets[work.targetId]:null;
      const desired=points[target?.instanceId]??{x:stage.cells[0].x*100+62.5,y:stage.cells[0].y*100+87.5};
      reserve(u.unitId,desired,8);
    }
  }
  return {points,obstacles};
}
