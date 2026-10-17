import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,move,advanceTime,extract,redial,returnRoute} from '../shared/offworld/runtime.mjs';
import {startWork,recipeEligibility} from '../shared/offworld/field.mjs';
import {startDialogue,respondDialogue,continueDialogue,dialogueResponses} from '../shared/offworld/dialogue.mjs';
import {createTool} from '../shared/offworld/equipment.mjs';
import {finalizeDebrief,debriefOptions} from '../shared/offworld/recovery.mjs';
import {playableText} from './playable.mjs';
import {renderMap} from '../offworld-sandbox/map.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
const raw=read('offworld/last-transmission-001.finalized'),catalog={...read('offworld/archetypes'),itemDefinitions:read('item')};
const m=compileMission(JSON.parse(playableText(raw,catalog)),catalog);
function fresh({diplomat=true,techTier=1}={}){
 const roles=diplomat?['SOLDIER','TECHNICIAN','MEDIC','DIPLOMAT']:['SOLDIER','TECHNICIAN','MEDIC','SCOUT'];
 const units=roles.map(role=>structuredClone(read('offworld/party-presets').units.find(u=>u.profession===role)));
 for(const u of units){u.tier=u.profession==='TECHNICIAN'?techTier:1;u.tools=[createTool(u,0,({SOLDIER:'SOT1',TECHNICIAN:techTier===2?'TET2':'TET1',MEDIC:'MET1',DIPLOMAT:'DIT1',SCOUT:'STT1'})[u.profession],8,catalog)];}
 const s=createRuntime(m,units,'2026-10-12T12:00:00Z');chooseGate(m,s,true);return s;
}
function go(s,edge){move(m,s,'relay-door-'+edge);assert(renderMap(m,s).includes('data-stage='));}
function work(s,id){const w=startWork(m,s,'relay-'+id);renderMap(m,s);advanceTime(m,s,w.durationSeconds);const done=s.activeWork.find(row=>row.workId===w.workId);assert.equal(done.status,'COMPLETED',done.failure);renderMap(m,s);return done;}
function talk(s,person,response){if(!s.dialogue)startDialogue(m,s,'relay-dialogue-'+person);respondDialogue(m,s,response);continueDialogue(m,s);assert.equal(s.dialogue,null);renderMap(m,s);}
function arrive(s){go(s,'gate-trail');go(s,'trail-courtyard');assert.equal(s.dialogue.sceneId,'relay-dialogue-arrival');respondDialogue(m,s,'arrival-acknowledge');startDialogue(m,s,'relay-dialogue-rhel');}
function contactTaren(s){go(s,'courtyard-shelter');talk(s,'taren','taren-plan');}
function reachVessa(s,{hack=false}={}){go(s,'courtyard-control');work(s,hack?'hack-service-door':'enter-service-code');go(s,'control-generator');talk(s,'vessa','vessa-plan');}
function finishRescue(s){
 work(s,'evacuate-vessa');assert.equal(s.instanceStates['relay-vessa-01'].custody,'AT_GATE');
 go(s,'control-generator');go(s,'courtyard-control');go(s,'courtyard-shelter');work(s,'evacuate-taren');
 for(const id of ['relay-taren-01','relay-vessa-01'])assert.equal(s.instanceStates[id].partyStatus,'AT_GATE');
 go(s,'courtyard-shelter');go(s,'trail-courtyard');go(s,'gate-trail');
 if(s.gateState.connection!=='OPEN_TO_SGC')redial(m,s);
 extract(m,s);assert.equal(s.status,'EXTRACTED');
 for(const id of ['relay-taren-01','relay-vessa-01']){assert.equal(s.instanceStates[id].partyStatus,'EXTRACTED');assert.equal(s.instanceStates[id].custody,'RECOVERED_TO_SGC');}
 for(const o of m.objectives.filter(o=>o.priority==='PRIMARY'))assert.equal(s.objectiveStates[o.objectiveId].state,'COMPLETED',o.objectiveId);
}
test('new mission has distinct cast and hidden starting evidence, with no benchmark physical instances',()=>{
 const s=fresh();assert.equal(m.stages.length,6);assert.equal(new Set(m.instances.map(i=>i.instanceId)).size,m.instances.length);
 const benchmark=read('offworld/missing-operative-001.finalized');assert(m.instances.every(i=>!benchmark.instances.some(b=>b.instanceId===i.instanceId)));
 assert(!s.knowledgeState.starting.includes('relay-signal-authenticated'));assert.equal(s.stageStates['relay-generator-room'].visibility,'HIDDEN');
 assert.equal(s.instanceStates['relay-taren-01'].custody,'LOCAL');assert.equal(m.indexes.instances['relay-taren-01'].playerLabel,'Injured relay operator');
});
test('diplomatic route completes both rescues and physically recovers the log through Receiving',()=>{
 const s=fresh();arrive(s);talk(s,'rhel','rhel-negotiate');
 for(const id of ['relay-rhel-01','relay-salvager-01','relay-salvager-02'])assert.equal(s.instanceStates[id].combatState,'FLED');
 assert(!renderMap(m,s).includes('data-npc="relay-rhel-01"'),'Withdrawn crew remained visible');
 contactTaren(s);assert.equal(recipeEligibility(m,s,m.indexes.recipes['relay-evacuate-taren']).blocker,'INVALID_TARGET_STATE');
 const medic=s.units.find(u=>u.profession==='MEDIC'),before=medic.tools[0].chargesRemaining;work(s,'stabilize-taren');assert.equal(medic.tools[0].chargesRemaining,before-1);
 go(s,'courtyard-shelter');go(s,'courtyard-control');work(s,'verify-log');work(s,'secure-log');
 assert.equal(s.instanceStates['relay-transmission-log-01'].custody,'LOCAL');assert.equal(s.instanceStates['relay-transmission-log-01'].securedForExtraction,true);
 const tech=s.units.find(u=>u.profession==='TECHNICIAN'),charge=tech.tools[0].chargesRemaining;work(s,'enter-service-code');assert.equal(tech.tools[0].chargesRemaining,charge);
 go(s,'control-generator');talk(s,'vessa','vessa-plan');finishRescue(s);
 assert.equal(debriefOptions(m,s).loot.find(x=>x.instanceId==='relay-transmission-log-01').eligible,true);
 const plan=finalizeDebrief(m,s,{receivingIds:['relay-transmission-log-01']});
 assert.equal(plan.requests[0].physicalItem.instanceId,'relay-transmission-log-01');assert.equal(plan.requests[0].cost,catalog.itemDefinitions.SIM_INTEL_ARCHIVE.storage.handlingCost);
 assert(plan.requests[0].physicalItem.knowledge.instanceFindings.includes('relay-distress-code-and-service-lock-sequence'));
 assert.equal(s.objectiveStates['relay-recover-log'].state,'COMPLETED');assert.equal(plan.requests[0].destination,'RECEIVING');
});
test('evidence route needs no Diplomat and blocks evacuation until the crew actually withdraws',()=>{
 const s=fresh({diplomat:false});arrive(s);assert(!dialogueResponses(m,s).find(r=>r.responseId==='rhel-negotiate').eligible);talk(s,'rhel','rhel-investigate');
 contactTaren(s);work(s,'stabilize-taren');go(s,'courtyard-shelter');reachVessa(s);
 assert.equal(recipeEligibility(m,s,m.indexes.recipes['relay-evacuate-vessa']).blocker,'NO_SECURE_GATE_ROUTE');assert.equal(returnRoute(m,s,{secure:true}),null);
 go(s,'control-generator');work(s,'verify-log');go(s,'courtyard-control');talk(s,'rhel','rhel-evidence');
 go(s,'courtyard-control');go(s,'control-generator');finishRescue(s);
 assert.equal(s.instanceStates['relay-transmission-log-01'].custody,'LOCAL');assert.equal(s.objectiveStates['relay-recover-log'].state,'ACTIVE');
});
test('explicit combat and Technician II hacking provide the alternate full rescue route',()=>{
 const s=fresh({diplomat:false,techTier:2});arrive(s);talk(s,'rhel','rhel-force');assert.equal(s.incidentStates['relay-crew-combat'].state,'ACTIVE');
 advanceTime(m,s,600);assert.equal(s.incidentStates['relay-crew-combat'].state,'RESOLVED');
 for(const id of ['relay-rhel-01','relay-salvager-01','relay-salvager-02'])assert.equal(s.instanceStates[id].combatState,'DOWN');
 go(s,'courtyard-control');const tech=s.units.find(u=>u.profession==='TECHNICIAN'),before=tech.tools[0].chargesRemaining;work(s,'hack-service-door');assert.equal(tech.tools[0].chargesRemaining,before-1);work(s,'verify-log');
 go(s,'courtyard-control');contactTaren(s);work(s,'stabilize-taren');go(s,'courtyard-shelter');go(s,'courtyard-control');go(s,'control-generator');talk(s,'vessa','vessa-plan');finishRescue(s);
 assert.equal(s.objectiveStates['relay-arrange-withdrawal'].state,'ACTIVE');
});
