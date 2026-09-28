import {recipeEligibility,executionProfile,condition,activeWork,targetLocal} from '../shared/offworld/field.mjs?v=dialogue-doors-1';
import {professionTier} from '../shared/offworld/equipment.mjs?v=dialogue-doors-1';
import {toolReserved} from '../shared/offworld/party-tools.mjs?v=dialogue-doors-1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const blockerText={ACTOR_TIER_OR_PERCEPTION_TOO_LOW:'No local unit meets both the required Profession tier and Perception.',NO_VALID_ACTOR:'No available local unit has the required Profession.',TOOL_SERVICE_MISSING:'No usable Tool provides the required Service.',TOOL_CHARGES_DEPLETED:'The required Tool has insufficient available charges.',TOOL_BUSY:'The required Tool is reserved by other work.',ACTOR_BUSY:'Qualified units are already working.',TARGET_BUSY:'Other work is using this target.',REQUIRED_KNOWLEDGE_MISSING:'Required Knowledge is missing.',INVALID_TARGET_STATE:'The target does not meet the required state.',MISSION_NOT_READY:'The mission is not ready for work.',AUTHORED_OUTCOME_REQUIRED:'This action has no executable authored outcome.'};
export function requirementReport(m,s,r){
  const target=m.indexes.interactionTargets[r.targetId],work=activeWork(s);
  const checks=[
    {label:'Executable outcome',pass:!!r.implemented},
    {label:'Mission active and Gate choice made',pass:s.status==='ACTIVE'&&!s.gateState.choicePending},
    {label:'Target local',pass:targetLocal(m,s,target)},
    {label:'Target not busy',pass:!work.some(w=>w.targetId===r.targetId)},
    {label:'Action not already completed',pass:s.interactionStates[r.recipeInstanceId]!=='COMPLETED'},
    ...(r.requiresKnowledge??[]).map(f=>({label:`Knowledge: ${f}`,pass:[...s.knowledgeState.starting,...s.knowledgeState.gained].includes(f)})),
    ...(r.requiresState?[{label:`Target condition: ${JSON.stringify(r.requiresState)}`,pass:condition(s,r.requiresState)}]:[]),
    ...(r.requiresLocated?[{label:'Target located',pass:s.instanceStates[target.instanceId]?.detectionState==='LOCATED'}]:[]),
    ...(target.transitionId?[{label:'Door is not already open',pass:s.transitionStates[target.transitionId].state!=='OPEN'}]:[]),
  ];
  const units=s.units.map(u=>{
    const tier=professionTier(u,r.profession),local=u.currentStageId===s.currentStageId&&['ACTIVE_PARTY','STATIONED'].includes(u.partyStatus),standing=u.activityState!=='DOWN',idle=!work.some(w=>w.actorId===u.unitId);
    const tools=[...u.tools.map(t=>({...t,source:'Personal',local:true})),...(s.partyTools??[]).map(t=>({...t,source:'Party',local:t.custody==='PARTY'&&t.currentStageId===u.currentStageId}))].filter(t=>t.providedServices.includes(r.requiredToolService)).map(t=>{
      const reserved=work.filter(w=>w.toolInstanceId===t.toolInstanceId).reduce((sum,w)=>sum+w.chargeCost,0),charges=t.chargesRemaining===null?null:t.chargesRemaining-reserved,busy=t.source==='Party'&&toolReserved(s,t.toolInstanceId);
      return {...t,charges,busy,pass:!t.damaged&&t.local&&!busy&&(charges===null||charges>=(r.chargeCost??0))};
    });
    return {name:u.name,unitId:u.unitId,tier,perception:u.perception,professionPass:(r.profession==='UNTRAINED'||tier>0)&&tier>=r.minimumTier,perceptionPass:u.perception>=(r.minimumPerception??0),local,standing,idle,tools,toolPass:!r.requiredToolService||tools.some(t=>t.pass),eligibility:recipeEligibility(m,s,r,u.unitId)};
  });
  return {checks,units};
}
const mark=(pass,text)=>`<span class="requirement-${pass?'pass':'fail'}">${pass?'✓':'✗'} ${esc(text)}</span>`;
export function requirementsHtml(m,s,r){
  const report=requirementReport(m,s,r);
  return `<p class="muted">One Actor must satisfy every Actor requirement. Base and cross-path tiers count; having each class somewhere in the party is not enough.</p><dl class="requirements-spec"><dt>Profession</dt><dd>${esc(r.profession)} · tier ${r.minimumTier??0}+</dd><dt>Perception</dt><dd>${r.minimumPerception??0}+</dd><dt>Tool Service</dt><dd>${esc(r.requiredToolService??'None')}</dd><dt>Charge cost</dt><dd>${r.chargeCost??0}</dd><dt>Duration</dt><dd>${executionProfile(s,r).durationMinutes} simulated minutes${executionProfile(s,r).preparation?` · ${esc(executionProfile(s,r).preparation)}`:''}</dd></dl><h3>Party checks</h3>${report.units.map(u=>`<section class="requirement-unit"><strong>${esc(u.name)} — ${u.eligibility.status==='AVAILABLE'?'Eligible':'Not eligible'}</strong><div class="requirement-checks">${mark(u.professionPass,`${r.profession} ${u.tier} / required ${r.minimumTier??0}`)}${mark(u.perceptionPass,`PER ${u.perception} / required ${r.minimumPerception??0}`)}${mark(u.local,'At this Stage')}${mark(u.standing,'Not downed')}${mark(u.idle,'Not already working')}${mark(u.toolPass,r.requiredToolService?'Required Tool usable':'No Tool required')}</div>${r.requiredToolService?(u.tools.length?u.tools.map(t=>`<small>${mark(t.pass,`${t.source}: ${t.label} · ${t.charges===null?'unlimited':t.charges+' available'} charges${t.damaged?' · damaged':''}${!t.local?' · not local':''}${t.busy?' · reserved':''}`)}</small>`).join(''):'<small>No personal or party Tool provides this Service.</small>'):''}</section>`).join('')}<h3>Mission and target checks · debug</h3><div class="requirement-checks">${report.checks.map(c=>mark(c.pass,c.label)).join('')}</div>`;
}
