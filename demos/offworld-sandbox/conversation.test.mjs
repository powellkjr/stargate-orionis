import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,advanceTime,move} from '../shared/offworld/runtime.mjs';
import {startDialogue,dialogueResponses,respondDialogue,continueDialogue,dialogueEligibility,refreshDialogue,dialogueTrigger} from '../shared/offworld/dialogue.mjs';
import {conversationHtml} from './conversation.mjs';
const read=n=>{const data=JSON.parse(readFileSync(new URL(`../shared/data/offworld/${n}.json`,import.meta.url)));return n.endsWith('archetypes')?{...data,itemDefinitions:JSON.parse(readFileSync(new URL('../shared/data/item.json',import.meta.url)))}:data;};
test('playable mission starts authored outer-yard dialogue and preserves normal travel after response',()=>{
  const m=compileMission(read('missing-operative-001.finalized'),read('archetypes'));
  const s=createRuntime(m,read('party-presets').units.slice(0,4),'2026-09-25T12:00Z');chooseGate(m,s,true);
  move(m,s,'door-gate-to-yard');
  assert.equal(s.dialogue.sceneId,'dialogue-yard-entry');
  assert.equal(s.dialogue.history[0].text,'Visitors check in with Reynolds inside.');
  assert.equal(s.instanceStates['guard-yard-01'].combatState,'NEUTRAL');
  assert.throws(()=>move(m,s,'door-yard-to-mainhall'),/conversation/);
  respondDialogue(m,s,'yard-ignore');move(m,s,'door-yard-to-mainhall');move(m,s,'door-yard-to-mainhall');
  assert.equal(s.dialogue,null,'entry scene does not restart on revisit');
});
test('explicit hostile dialogue escalation converts confrontation without instant damage or definition mutation',async()=>{
  const {raw,catalog,s,actor}=fixture();
  const incident=raw.incidents.find(i=>i.incidentId==='incident-security-guards');
  assert(incident);incident.overrides={...incident.overrides};
  const c=structuredClone(catalog);c.archetypes.incident[incident.archetypeId].defaults.kind='CONFRONTATION';
  raw.dialogueScenes[0].nodes[0].responses[1].effects=[{type:'START_HOSTILE_INCIDENT',incidentId:incident.incidentId}];
  s.currentStageId=incident.stageId;
  s.stageStates[incident.stageId].visibility='VISIBLE';
  for(const u of s.units)u.currentStageId=incident.stageId;
  const scene=raw.dialogueScenes[0];scene.participants.right=incident.overrides.participantIds[0];
  for(const n of scene.nodes)if(n.speaker==='worker-yard-01')n.speaker=scene.participants.right;
  const definition=compileMission(raw,c),health=s.units.map(u=>u.health);
  startDialogue(definition,s,'test-scene',actor.unitId);respondDialogue(definition,s,'quiet');
  const {localCombat}=await import('../shared/offworld/campaign.mjs');
  assert.equal(localCombat(definition,s).length,1);assert.equal(definition.indexes.incidents[incident.incidentId].kind,'CONFRONTATION');
  assert.deepEqual(s.units.map(u=>u.health),health);assert.equal(s.incidentStates[incident.incidentId].nextRoundAt,s.missionElapsedSeconds+definition.indexes.incidents[incident.incidentId].roundSeconds);
});
function fixture(){
  const raw=read('missing-operative-001.finalized'),catalog=read('archetypes');
  raw.instances.find(i=>i.instanceId==='worker-yard-01').npcState={disposition:'ROUTINE',suspicion:0,hostility:0};
  raw.dialogueScenes=[{dialogueSceneId:'test-scene',participants:{left:'ACTIVE_SGC_SPEAKER',right:'worker-yard-01'},startNodeId:'opening',nodes:[
    {nodeId:'opening',speaker:'worker-yard-01',side:'RIGHT',text:'What do you know?',responses:[
      {responseId:'disclose',source:'DIPLOMAT',text:'A sensitive truth.',requirements:{profession:'DIPLOMAT',minimumTier:1,knowledge:'secret'},effects:[{type:'CHANGE_NPC_SUSPICION',instanceId:'worker-yard-01',delta:25},{type:'ADD_KNOWLEDGE',knowledgeId:'disclosed'}],nextNodeId:'answer'},
      {responseId:'quiet',source:'NEUTRAL',text:'Nothing to add.',endConversation:true}]},
    {nodeId:'answer',speaker:'worker-yard-01',side:'RIGHT',text:'How would you know that?',endConversation:true}]}];
  const m=compileMission(raw,catalog),s=createRuntime(m,read('party-presets').units.filter(u=>['DIPLOMAT','SOLDIER','MEDIC','TECHNICIAN'].includes(u.profession)),'2026-09-25T12:00Z');chooseGate(m,s,true);
  s.currentStageId='stage-outer-yard';s.stageStates[s.currentStageId].visibility='VISIBLE';for(const u of s.units)u.currentStageId=s.currentStageId;
  return {raw,catalog,m,s,actor:s.units.find(u=>u.profession==='DIPLOMAT')};
}
test('knowledgeAny accepts either known fact without bypassing other speaker requirements',()=>{
  for(const fact of ['first-fact','second-fact']){
    const {raw,catalog,s,actor}=fixture();
    raw.dialogueScenes[0].nodes[0].responses[0].requirements={profession:'DIPLOMAT',minimumTier:1,knowledge:'secret',knowledgeAll:['required-fact'],knowledgeAny:['first-fact','second-fact']};
    const m=compileMission(raw,catalog);startDialogue(m,s,'test-scene',actor.unitId);
    s.knowledgeState.gained.push('secret','required-fact');
    assert.equal(dialogueResponses(m,s)[0].eligible,false);
    s.knowledgeState.gained.push(fact);assert.equal(dialogueResponses(m,s)[0].eligible,true);
    respondDialogue(m,s,'disclose');assert(s.knowledgeState.gained.includes('disclosed'));
    continueDialogue(m,s);
    startDialogue(m,s,'test-scene',s.units.find(u=>u.profession==='SOLDIER').unitId);
    assert.equal(dialogueResponses(m,s)[0].eligible,false);
  }
});
test('knowledgeAny rejects empty lists, scalar values and invalid IDs',()=>{
  for(const value of [[],null,'fact',[null],[''],[7]]){
    const {raw,catalog}=fixture();raw.dialogueScenes[0].nodes[0].responses[0].requirements.knowledgeAny=value;
    assert.throws(()=>compileMission(raw,catalog),/knowledgeAny requires a nonempty array/);
  }
});
test('authored disclosure requires selected speaker and Knowledge; graph preserves outcomes and portraits',()=>{
  const {m,s,actor}=fixture();startDialogue(m,s,'test-scene',actor.unitId);
  assert.equal(dialogueResponses(m,s).find(r=>r.responseId==='disclose').eligible,false);
  const before=structuredClone(s);assert.throws(()=>respondDialogue(m,s,'disclose'),/unavailable/);assert.deepEqual(s,before);
  s.knowledgeState.gained.push('secret');assert.equal(dialogueResponses(m,s)[0].eligible,true);
  respondDialogue(m,s,'disclose');assert.equal(s.instanceStates['worker-yard-01'].npcState.suspicion,25);assert(s.knowledgeState.gained.includes('disclosed'));
  const html=conversationHtml(m,s);assert.match(html,/speech right/);assert.match(html,/speech left/);assert.match(html,/<svg/);assert.match(html,/Worker/);
  continueDialogue(m,s);assert.equal(s.dialogue,null);assert.equal(s.dialogueHistory[0].history.length,3);
  startDialogue(m,s,'test-scene',actor.unitId);respondDialogue(m,s,'quiet');assert.equal(s.instanceStates['worker-yard-01'].npcState.suspicion,25);
});
test('Profession source does not borrow another Unit and knowing a fact does not force disclosure',()=>{
  const {m,s}=fixture();s.knowledgeState.gained.push('secret');startDialogue(m,s,'test-scene',s.units.find(u=>u.profession==='SOLDIER').unitId);
  assert.equal(dialogueResponses(m,s)[0].eligible,false);assert.equal(dialogueResponses(m,s)[1].eligible,true);
  respondDialogue(m,s,'quiet');assert(!s.knowledgeState.gained.includes('disclosed'));
});
test('conversation blocks unrelated execution and automatic scenes cannot start manually',()=>{
  const {m,s,actor}=fixture();startDialogue(m,s,'test-scene',actor.unitId);
  assert.throws(()=>advanceTime(m,s,30),/conversation/);assert.throws(()=>move(m,s,'door-gate-to-yard'),/conversation/);
  assert.throws(()=>startDialogue(m,s,'test-scene',actor.unitId),/unavailable/);
  const {raw,catalog}=fixture();raw.dialogueScenes[0].startWhen={stageVisitCount:{stageId:'stage-outer-yard',equals:1}};
  const automatic=compileMission(raw,catalog);const other=fixture().s;
  assert.equal(dialogueEligibility(automatic,other,automatic.dialogueScenes[0],actor.unitId),false);
});
test('actual Stage entries count once; failed movement and refreshes do not increment visits',()=>{
  const {m}=fixture(),s=createRuntime(m,read('party-presets').units.slice(0,4),'2026-09-25T12:00Z');
  assert.equal(s.stageStates[m.gate.stageId].visitCount,1);assert.equal(s.stageStates['stage-outer-yard'].visitCount,0);
  assert.throws(()=>move(m,s,'door-gate-to-yard'));chooseGate(m,s,true);
  move(m,s,'door-gate-to-yard');assert.equal(s.stageStates['stage-outer-yard'].visitCount,1);
  refreshDialogue(m,s);assert.equal(s.stageStates['stage-outer-yard'].visitCount,1);
  move(m,s,'door-gate-to-yard');move(m,s,'door-gate-to-yard');assert.equal(s.stageStates['stage-outer-yard'].visitCount,2);
});
test('first-entry and return triggers preserve NPC state and start only once per visit',()=>{
  const {raw,catalog}=fixture(),entry=raw.dialogueScenes[0];
  entry.startWhen={all:[{stageVisitCount:{stageId:'stage-outer-yard',equals:1}},{npcDispositionIn:{instanceId:'worker-yard-01',values:['ROUTINE']}}]};
  const returned=structuredClone(entry);returned.dialogueSceneId='return-scene';returned.startWhen={all:[{stageVisitCount:{stageId:'stage-outer-yard',minimum:2}},{instanceEvacStateIn:{instanceId:'operative-01',values:['READY_TO_EVACUATE']}}]};
  raw.dialogueScenes.push(returned);
  const m=compileMission(raw,catalog),s=createRuntime(m,read('party-presets').units.slice(0,4),'2026-09-25T12:00Z');chooseGate(m,s,true);
  move(m,s,'door-gate-to-yard');assert.equal(s.dialogue.sceneId,'test-scene');respondDialogue(m,s,'quiet');
  assert.equal(refreshDialogue(m,s),false);
  s.instanceStates['worker-yard-01'].npcState.suspicion=37;s.instanceStates['operative-01'].evacState='READY_TO_EVACUATE';
  move(m,s,'door-gate-to-yard');move(m,s,'door-gate-to-yard');assert.equal(s.dialogue.sceneId,'return-scene');
  assert.equal(s.instanceStates['worker-yard-01'].npcState.suspicion,37);respondDialogue(m,s,'quiet');assert.equal(refreshDialogue(m,s),false);
});
test('Knowledge trigger re-evaluates after state changes and authored order breaks ties',()=>{
  const {raw,catalog,s}=fixture();raw.dialogueScenes[0].startWhen={knowledge:'new-fact'};
  const second=structuredClone(raw.dialogueScenes[0]);second.dialogueSceneId='second';raw.dialogueScenes.push(second);
  const m=compileMission(raw,catalog);assert.equal(refreshDialogue(m,s),false);
  s.knowledgeState.gained.push('new-fact');assert.equal(refreshDialogue(m,s),true);assert.equal(s.dialogue.sceneId,'test-scene');
  respondDialogue(m,s,'quiet');assert.equal(refreshDialogue(m,s),true);assert.equal(s.dialogue.sceneId,'second');
  respondDialogue(m,s,'quiet');assert.equal(refreshDialogue(m,s),false);assert.equal(dialogueTrigger(s,{unknown:true}),false);
});
test('malformed automatic trigger definitions fail compilation instead of becoming unconditional',()=>{
  for(const trigger of [{unknown:true},{all:[]},{stageVisitCount:{stageId:'stage-outer-yard',minimum:-1}},{npcDispositionIn:{instanceId:'worker-yard-01',values:[]}},null]){
    const {raw,catalog}=fixture();raw.dialogueScenes[0].startWhen=trigger;assert.throws(()=>compileMission(raw,catalog),/MISSION VALIDATION/);
  }
});
test('invalid graph references, duplicate IDs, malformed requirements and unsupported effects fail compilation',()=>{
  for(const mutate of [scene=>scene.startNodeId='missing',scene=>scene.nodes[0].side='LEFT',scene=>scene.nodes[0].responses[0].nextNodeId='missing',scene=>scene.nodes[0].responses[0].effects=[{type:'INVENT_THEORY'}],scene=>scene.nodes[0].responses[0].requirements={knowledgeAll:'secret'}]){
    const {raw,catalog}=fixture();mutate(raw.dialogueScenes[0]);assert.throws(()=>compileMission(raw,catalog),/MISSION VALIDATION/);
  }
});
test('effect failure rolls back node entry and response atomically',()=>{
  const {m,s,actor}=fixture();s.knowledgeState.gained.push('secret');startDialogue(m,s,'test-scene',actor.unitId);
  delete s.instanceStates['worker-yard-01'].npcState;const before=structuredClone(s);
  assert.throws(()=>respondDialogue(m,s,'disclose'),/NPC state unavailable/);assert.deepEqual(s,before);
});
test('authored dialogue records social passage and evacuation without moving or securing anything',()=>{
  const {raw,catalog,s,actor}=fixture(),objective=raw.objectives[0].objectiveId;
  raw.dialogueScenes[0].nodes[0].responses[1].effects=[
    {type:'MARK_ROUTE_SOCIAL_PASSAGE',stageId:'stage-outer-yard',value:true},
    {type:'SET_EVAC_STATE',instanceId:'operative-01',value:'READY_TO_EVACUATE'},
    {type:'ACTIVATE_OBJECTIVE',objectiveId:objective}];
  const m=compileMission(raw,catalog),before=structuredClone(s.instanceStates['operative-01']);
  s.objectiveStates[objective].state='HIDDEN';startDialogue(m,s,'test-scene',actor.unitId);
  const security=s.stageStates['stage-outer-yard'].securityState;respondDialogue(m,s,'quiet');
  assert.equal(s.stageStates['stage-outer-yard'].socialPassage,true);
  assert.equal(s.stageStates['stage-outer-yard'].securityState,security);
  assert.deepEqual(s.instanceStates['operative-01'],{...before,evacState:'READY_TO_EVACUATE'});
  assert.equal(s.objectiveStates[objective].state,'ACTIVE');
  assert.equal(m.indexes.instances['operative-01'].stageId,raw.instances.find(i=>i.instanceId==='operative-01').stageId);
});
test('new outcome validation rejects missing references and malformed values',()=>{
  for(const effect of [
    {type:'MARK_ROUTE_SOCIAL_PASSAGE',stageId:'missing',value:true},
    {type:'MARK_ROUTE_SOCIAL_PASSAGE',stageId:'stage-outer-yard',value:1},
    {type:'SET_EVAC_STATE',instanceId:'missing',value:'READY_TO_EVACUATE'},
    {type:'SET_EVAC_STATE',instanceId:'operative-01',value:''},
    {type:'ACTIVATE_OBJECTIVE',objectiveId:'missing'}]){
    const {raw,catalog}=fixture();raw.dialogueScenes[0].nodes[0].responses[1].effects=[effect];
    assert.throws(()=>compileMission(raw,catalog),/MISSION VALIDATION ERROR/);
  }
});
test('later outcome failure rolls back earlier social passage mutation',()=>{
  const {raw,catalog,s,actor}=fixture();raw.dialogueScenes[0].nodes[0].responses[1].effects=[
    {type:'MARK_ROUTE_SOCIAL_PASSAGE',stageId:'stage-outer-yard',value:true},
    {type:'SET_EVAC_STATE',instanceId:'operative-01',value:'READY_TO_EVACUATE'}];
  const m=compileMission(raw,catalog);startDialogue(m,s,'test-scene',actor.unitId);delete s.instanceStates['operative-01'];
  const before=structuredClone(s);assert.throws(()=>respondDialogue(m,s,'quiet'),/Evacuation instance unavailable/);assert.deepEqual(s,before);
});
test('missing scheduledEvents reports schema errors rather than throwing an iteration TypeError',()=>{
  const {raw,catalog}=fixture();delete raw.scheduledEvents;
  assert.throws(()=>compileMission(raw,catalog),/MISSION VALIDATION ERROR[\s\S]*scheduledEvents: required array/);
});
test('authored event field and legacy eventArchetypeId both emit, but conflicting IDs are rejected',()=>{
  for(const field of ['event','eventArchetypeId']){
    const {raw,catalog,s,actor}=fixture(),event=Object.keys(catalog.archetypes.event)[0];
    raw.eventBindings=[];raw.dialogueScenes[0].nodes[0].responses[1].effects=[{type:'EMIT_EVENT',[field]:event}];
    const m=compileMission(raw,catalog);startDialogue(m,s,'test-scene',actor.unitId);respondDialogue(m,s,'quiet');
    assert(s.emittedEvents.some(e=>e.event===event&&e.stageId==='stage-outer-yard'));
  }
  const {raw,catalog}=fixture(),event=Object.keys(catalog.archetypes.event)[0];
  raw.dialogueScenes[0].nodes[0].responses[1].effects=[{type:'EMIT_EVENT',event,eventArchetypeId:'different'}];
  assert.throws(()=>compileMission(raw,catalog),/conflicting dialogue event IDs/);
});
test('authored variants select an opening from persistent state before start effects execute',()=>{
  const {raw,catalog,s,actor}=fixture(),scene=raw.dialogueScenes[0];delete scene.startNodeId;
  scene.variants=[
    {variantId:'routine',when:{npcDispositionIn:{instanceId:'worker-yard-01',values:['ROUTINE']}},startNodeId:'opening'},
    {variantId:'suspicious',when:{npcDispositionIn:{instanceId:'worker-yard-01',values:['SUSPICIOUS']}},startNodeId:'answer'}];
  scene.onStartEffects=[{type:'SET_NPC_DISPOSITION',instanceId:'worker-yard-01',value:'SUSPICIOUS'}];
  const m=compileMission(raw,catalog);startDialogue(m,s,'test-scene',actor.unitId);
  assert.equal(s.dialogue.variantId,'routine');assert.equal(s.dialogue.nodeId,'opening');
  assert.equal(s.instanceStates['worker-yard-01'].npcState.disposition,'SUSPICIOUS');
  respondDialogue(m,s,'quiet');startDialogue(m,s,'test-scene',actor.unitId);
  assert.equal(s.dialogue.variantId,'suspicious');assert.equal(s.dialogue.nodeId,'answer');continueDialogue(m,s);
  assert.equal(s.dialogueHistory[1].variantId,'suspicious');
});
test('unmatched variants do not start or consume an automatic trigger',()=>{
  const {raw,catalog,s}=fixture(),scene=raw.dialogueScenes[0];delete scene.startNodeId;
  scene.startWhen={knowledge:'trigger'};scene.variants=[{variantId:'unknown',when:{knowledge:'missing'},startNodeId:'opening'}];
  const m=compileMission(raw,catalog);s.knowledgeState.gained.push('trigger');
  assert.equal(refreshDialogue(m,s),false);assert.equal(s.dialogue,null);assert.deepEqual(s.dialogueStarts,[]);
  s.knowledgeState.gained.push('missing');assert.equal(refreshDialogue(m,s),true);assert.equal(s.dialogue.variantId,'unknown');
});
test('variant order breaks ties and a fixed opening is a fallback',()=>{
  const {raw,catalog,s,actor}=fixture(),scene=raw.dialogueScenes[0];
  scene.variants=[{variantId:'first',when:{knowledge:'fact'},startNodeId:'answer'},{variantId:'second',when:{knowledge:'fact'},startNodeId:'opening'}];
  const m=compileMission(raw,catalog);startDialogue(m,s,'test-scene',actor.unitId);assert.equal(s.dialogue.variantId,null);
  respondDialogue(m,s,'quiet');s.knowledgeState.gained.push('fact');startDialogue(m,s,'test-scene',actor.unitId);
  assert.equal(s.dialogue.variantId,'first');assert.equal(s.dialogue.nodeId,'answer');
});
test('invalid variants and start effects fail compilation rather than being ignored',()=>{
  for(const mutate of [
    scene=>scene.variants=[],scene=>scene.variants=[null],
    scene=>scene.variants=[{variantId:'bad',when:{unknown:true},startNodeId:'opening'}],
    scene=>scene.variants=[{variantId:'bad',when:{knowledge:'fact'},startNodeId:'missing'}],
    scene=>scene.onStartEffects=[{type:'UNKNOWN'}]]){
    const {raw,catalog}=fixture();mutate(raw.dialogueScenes[0]);assert.throws(()=>compileMission(raw,catalog),/MISSION VALIDATION ERROR/);
  }
});
test('failed start effects leave state and automatic-start ledger untouched',()=>{
  const {raw,catalog,s}=fixture(),scene=raw.dialogueScenes[0];scene.startWhen={knowledge:'trigger'};
  scene.onStartEffects=[{type:'ADD_KNOWLEDGE',knowledgeId:'partial'},{type:'SET_EVAC_STATE',instanceId:'operative-01',value:'READY_TO_EVACUATE'}];
  const m=compileMission(raw,catalog);s.knowledgeState.gained.push('trigger');delete s.instanceStates['operative-01'];const before=structuredClone(s);
  assert.throws(()=>refreshDialogue(m,s),/Evacuation instance unavailable/);assert.deepEqual(s,before);
});test('response switching retains each Unit identity in player and authored SGC history lines',()=>{
 const {raw,catalog,s}=fixture();s.knowledgeState.gained.push('secret');
 const scene=raw.dialogueScenes[0];scene.nodes[0].responses[0].nextNodeId='sgc-echo';
 scene.nodes.push({nodeId:'sgc-echo',speaker:'ACTIVE_SGC_SPEAKER',side:'LEFT',text:'We can follow up.',nextNodeId:'answer'},{nodeId:'bye',speaker:'worker-yard-01',side:'RIGHT',text:'Go ahead.',endConversation:true});
 const answer=scene.nodes.find(n=>n.nodeId==='answer');delete answer.endConversation;answer.responses=[{responseId:'soldier-followup',source:'SOLDIER',text:'We will check the route.',nextNodeId:'bye'}];
 const definition=compileMission(raw,catalog),diplomat=s.units.find(u=>u.profession==='DIPLOMAT'),soldier=s.units.find(u=>u.profession==='SOLDIER');
 startDialogue(definition,s,'test-scene');assert.equal(s.dialogue.actorId,null);respondDialogue(definition,s,'disclose',diplomat.unitId);continueDialogue(definition,s);respondDialogue(definition,s,'soldier-followup',soldier.unitId);
 assert.equal(s.dialogue.history.find(line=>line.text==='A sensitive truth.').actorId,diplomat.unitId);assert.equal(s.dialogue.history.find(line=>line.text==='We can follow up.').actorId,diplomat.unitId);assert.equal(s.dialogue.history.find(line=>line.text==='We will check the route.').actorId,soldier.unitId);
 const html=conversationHtml(definition,s);assert(html.includes(diplomat.name));assert(html.includes(soldier.name));
});
