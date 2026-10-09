import {freeze} from './contracts.mjs';
import {compare} from './determinism.mjs';

// Author-report metadata only. The caller must validate the whole Draft first.
// An existing compiled source is provenance, never an execution/admission claim.
export function summarizeValidatedDraft(draft,registry){
 const {dynamic,recoveryIntents,consequences}=draft,{information,incidents,events,complications}=dynamic,s=information.skeleton,rows=[];
 const source=(kind,id)=>({kind,id,status:(kind==='gate'?id===registry.gate.instanceId:!!registry.tables[kind]?.[id])?'SOURCE_AVAILABLE':'SOURCE_MISSING'});
 const add=(section,id,sources,unresolved,requirements=null)=>rows.push({section,id,sources,unresolved,requirements});
 for(const stage of s.stages)add('STAGES',stage.stageId,[source('missionStage',stage.stageId)],['Selected Stage purposes/environments have no Draft-to-runtime mapping.']);
 for(const role of s.roles)add('ROLES',role.instanceId,[source('missionInstance',role.instanceId)],['Caller state snapshots are not deployed into a runtime mission.']);
 for(const transition of s.transitions)add('TRANSITIONS',transition.transitionId,[source('missionTransition',transition.transitionId)],['Authored adjacency does not establish traversable access or secure evacuation.']);
 for(const objective of s.objectives)add('OBJECTIVES',objective.objectiveId,[source('missionInstance',objective.instanceId)],['No authored binding from this semantic objective to runtime completion conditions/effects.'],{intent:objective.intent,after:objective.after});
 for(const clue of information.clues)add('CLUES',clue.clueId,[source(clue.source.kind,clue.source.id)],['Source access, prerequisites and Actor/Tool availability require runtime resolution.'],clue.prerequisites);
 for(const incident of incidents)add('INCIDENTS',incident.possibilityId,[source('missionIncident',incident.sourceIncidentId)],['Detection/investigation/resolution intents have no Finalizer binding; restoration remains unsupported.']);
 for(const event of events)add('EVENTS',event.possibilityId,event.triggerIntent.provenance.map(p=>source('missionEventBinding',p.bindingId)),['Selected trigger/effect chains have not been installed into a runtime mission.']);
 for(const complication of complications)add('COMPLICATIONS',complication.possibilityId,[source(complication.source.kind,complication.source.id)],['Source access/time-pressure intent has not been bound to this Draft.']);
 for(const recovery of recoveryIntents)add('RECOVERY',recovery.recoveryIntentId,[source('missionInstance',recovery.instanceId),...recovery.methods.map(m=>source('missionRecipe',m.sourceMethodId))],['Source method execution and transport remain unresolved.','Capacity/handling admission and transfer stay with the shared recovery owner.'],{recoveryRoleId:recovery.recoveryRoleId,handlingCost:recovery.handlingCost,capacity:recovery.capacity,methods:recovery.methods});
 for(const consequence of consequences)add('CONSEQUENCES',consequence.consequenceId,[],['Prospective intent is NOT_APPLIED; no Mission Result application binding exists.']);
 rows.sort((a,b)=>compare(a.section,b.section)||compare(a.id,b.id));
 const sources=rows.flatMap(r=>r.sources),unique=new Map(sources.map(r=>[`${r.kind}:${r.id}`,r]));
 return freeze({format:'mission-author-readiness-1',status:'NOT_FINALIZED',sourceMissionId:s.sourceMissionId,
  summary:{sections: new Set(rows.map(r=>r.section)).size,sourceReferences:unique.size,missingSourceReferences:[...unique.values()].filter(r=>r.status==='SOURCE_MISSING').length,unresolvedChecks:rows.reduce((n,r)=>n+r.unresolved.length,0)},
  blockers:['No Draft-to-Offworld Finalizer adapter exists. A valid semantic Draft is not a compiled, playable mission.','Executable objective bindings and runtime dependency closure must be authored/validated before deployment.'],rows});
}
