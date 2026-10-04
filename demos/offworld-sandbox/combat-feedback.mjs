// Browser pacing is separate from authored simulation time. Never catch up
// several rounds at once after a background-tab pause.
export function combatPacer(){
  let runtime=null,key='',startedAt=null;
  return (definition,state,incidents,now)=>{
    const nextKey=incidents.map(i=>`${i.incidentId}:${state.incidentStates[i.incidentId].nextRoundAt}`).join('|');
    if(runtime!==state||key!==nextKey){runtime=state;key=nextKey;startedAt=now;return 0;}
    if(!incidents.length||now-startedAt<3000)return 0;
    startedAt=now;
    return Math.max(0,Math.min(...incidents.map(i=>state.incidentStates[i.incidentId].nextRoundAt-state.missionElapsedSeconds)));
  };
}
export function damageFeedback(){
  let runtime=null,cursor=0,hits=[];
  return (state,now)=>{
    if(runtime!==state){runtime=state;cursor=0;hits=[];}
    const events=state.resultEvents??[];
    const batch=events.slice(cursor).filter(e=>e.type==='COMBAT_HIT'&&e.damage>0);
    let shot=0;
    for(let index=cursor;index<events.length;index++){
      const event=events[index];
      if(event.type==='COMBAT_HIT'&&event.damage>0)hits.push({...event,id:index,startedAt:now+shot++*Math.min(220,1000/Math.max(1,batch.length-1))});
    }
    cursor=events.length;hits=hits.filter(hit=>now-hit.startedAt<1800);
    return hits.filter(hit=>now>=hit.startedAt).map(hit=>({...hit,progress:(now-hit.startedAt)/1800,shotVisible:now-hit.startedAt<220}));
  };
}