// Campaign-only strategic samples, not an inventory, production, or hourly economy.
export const RATION_CAPACITY = Object.freeze({P1:1_000_000,P4:4_000_000,P16:16_000_000});
export const SCALE_TARGETS = Object.freeze({Scions:[5,31,4],CLP:[16,6,3],'Moy’na':[3,7,5],Independent:[12,6,2]});
export const RESOURCES = ['Food','Supply','Material'];
export const TRADE_RULES = Object.freeze({tradesPerHavenPerHour:1,execution:'not simulated'});

export function populationTotals({humans=0,unbondedMoyna=0,bondedPairs=0}) {
  for(const n of [humans,unbondedMoyna,bondedPairs]) if(!Number.isSafeInteger(n)||n<0) throw Error('Population cohorts must contain nonnegative integer counts.');
  return {sentientPopulation:humans+unbondedMoyna+2*bondedPairs,
    rationDemand:humans+.75*unbondedMoyna+1.25*bondedPairs};
}
export function balanceIndicator(resources) {
  const states=RESOURCES.map(r=>resources?.[r]);
  return states.every(s=>s==='stable')?'golden balance':states.every(s=>s==='surplus')?'golden surplus':null;
}
export function enrichHavens(havens,rng) {
  const shuffled=values=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const scales=Object.fromEntries(Object.entries(SCALE_TARGETS).map(([f,counts])=>[f,shuffled(counts.flatMap((n,i)=>Array(n).fill(['P1','P4','P16'][i])))]));
  return havens.map(h=>{
    const moyna=h.faction==='Moy’na',between=(a,b)=>a+(b-a)*rng();
    // Relative history index: no invented dates or nest-growth simulation.
    const nestAgeIndex=moyna?rng():null;
    const scale=moyna?(nestAgeIndex<.2?'P1':nestAgeIndex<2/3?'P4':'P16'):scales[h.faction].pop();
    const recentlyExpanded=moyna&&rng()<.35;
    const occupancyTarget=moyna?(recentlyExpanded?between(.2,.4):rng()<.12?between(.85,.95):between(.35,.65)):
      h.faction==='Scions'?between(.2,.6):h.faction==='CLP'?between(.45,.85):between(.25,.85);
    const rationCapacity=RATION_CAPACITY[scale],target=Math.floor(rationCapacity*occupancyTarget);
    // These are representative cohort mixes, not species rules derived from affiliation.
    const mixed=moyna||(h.faction==='Independent'&&rng()<.5);
    const bondedShare=mixed?between(moyna ? .4 : .05,moyna ? .75 : .3):0;
    const unbondedShare=mixed?between(.05,.15):0;
    const bondedPairs=Math.floor(target*bondedShare/5)*4,unbondedMoyna=Math.floor(target*unbondedShare/3)*4;
    const populationCohorts={humans:target-1.25*bondedPairs-.75*unbondedMoyna,bondedPairs,unbondedMoyna};
    const totals=populationTotals(populationCohorts);
    const specialization={Scions:'Supply',CLP:'Material','Moy’na':'Food'}[h.faction];
    const resources=Object.fromEntries(RESOURCES.map(r=>{const x=rng();return [r,x<(r===specialization ? .12 : .35)?'deficit':x<(r===specialization ? .3 : .7)?'stable':'surplus'];}));
    const quality=rng(),materialQuality=h.faction==='CLP'?(quality<.2?'M1':quality<.7?'M2':'M3'):(quality<.65?'M1':quality<.95?'M2':'M3');
    return {...h,scale,rationCapacity,occupancy:totals.rationDemand/rationCapacity,...totals,populationCohorts,
      nestHistory:moyna?{relativeAge:nestAgeIndex,recentlyExpanded}:null,resources,materialQuality};
  });
}
export function havenSummary(havens) {
  const sum=field=>havens.reduce((s,h)=>s+h[field],0),rationCapacity=sum('rationCapacity'),rationDemand=sum('rationDemand');
  return {havenCount:havens.length,totalRationCapacity:rationCapacity,totalRationDemand:rationDemand,
    totalSentientPopulation:sum('sentientPopulation'),overallOccupancy:rationCapacity?rationDemand/rationCapacity:0,
    byFaction:Object.fromEntries(Object.keys(SCALE_TARGETS).map(f=>[f,Object.fromEntries(Object.keys(RATION_CAPACITY).map(s=>[s,havens.filter(h=>h.faction===f&&h.scale===s).length]))])),
    resourceStates:Object.fromEntries(RESOURCES.map(r=>[r,Object.fromEntries(['deficit','stable','surplus'].map(s=>[s,havens.filter(h=>h.resources[r]===s).length]))]))};
}
export function knownHaven(h,k) {
  if(!h||!k.haven)return null;
  return {id:h.id,gateId:h.gateId,name:k.faction?h.name:'Known Haven',faction:k.faction?h.faction:null,
    ...(k.population?{scale:h.scale,rationCapacity:h.rationCapacity,occupancy:h.occupancy,rationDemand:h.rationDemand,sentientPopulation:h.sentientPopulation}:{}),
    ...(k.resources?{resources:{...h.resources},materialQuality:h.materialQuality}:{})};
}
export function matchesResource(h,resource,state='') {
  return Boolean(h?.resources?.[resource])&&(!state||h.resources[resource]===state);
}
// Potential complementary relationships, never scheduled/executed trades. Route callback
// is deliberately omitted for SGC records without discovered routing information.
export function tradeRelationships(havens,sourceId,getRoute=null) {
  const source=havens.find(h=>h.id===sourceId);if(!source)return [];
  return havens.filter(h=>h.id!==sourceId).flatMap(h=>{
    const exchanges=RESOURCES.flatMap(resource=>source.resources?.[resource]==='surplus'&&h.resources?.[resource]==='deficit'?
      [{resource,from:source.id,to:h.id}]:source.resources?.[resource]==='deficit'&&h.resources?.[resource]==='surplus'?[{resource,from:h.id,to:source.id}]:[]);
    return exchanges.length?[{havenId:h.id,gateId:h.gateId,exchanges,route:getRoute?getRoute(source.gateId,h.gateId):null}]:[];
  });
}
