// Subsystem tests not exercising access admission use routine doors explicitly.
// Mission integration tests must use the unmodified authored fixture instead.
export function withOpenRoomAccess(input){
  const m=structuredClone(input);
  for(const t of m.transitions)if(['door-mainhall-to-processing','door-processing-to-lab','door-mainhall-to-holding'].includes(t.transitionId)){t.archetypeId='door_routine';t.overrides={...t.overrides,initialState:t.transitionId==='door-mainhall-to-holding'?'CLOSED':'OPEN',routine:true};};
  return m;
}