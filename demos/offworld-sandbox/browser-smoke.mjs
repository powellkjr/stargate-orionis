// Optional real-browser check, no npm dependencies. EDGE_PATH may override Windows Edge.
import {createServer} from 'node:http';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve,extname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve('.'),profile=await mkdtemp(join(tmpdir(),'offworld-browser-'));
let testBase=JSON.parse(await readFile(join(root,'demos/shared/data/base-configuration.json'),'utf8'));testBase.reservations=[];
let failNextBaseSave=true;
const server=createServer(async(req,res)=>{
  if(req.url==='/api/base-configuration'&&req.method==='PUT'){if(failNextBaseSave){failNextBaseSave=false;res.writeHead(501,{'Content-Type':'text/html'});res.end('<html>Unsupported method PUT</html>');return;}let body='';for await(const chunk of req)body+=chunk;testBase=JSON.parse(body);testBase.revision++;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(testBase));return;}
  if(req.url.split('?')[0].endsWith('/base-configuration.json')){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(testBase));return;}
  try{const path=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!path.startsWith(root))throw Error();const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[extname(path)]??'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=spawn(process.env.EDGE_PATH??'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const deadline=setTimeout(()=>{console.error('Browser smoke timed out.');browser.kill();server.close();process.exit(1);},90000);
let ws;
try {
  let port;for(let n=0;n<100;n++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await delay(100);}}
  assert(port,'Browser did not start');
  console.log('Browser started; connecting to CDP.');
  const target=await (await fetch(`http://127.0.0.1:${port}/json/new?http://127.0.0.1:${server.address().port}/demos/offworld-sandbox/index.html`,{method:'PUT',signal:AbortSignal.timeout(5000)})).json();
  console.log('CDP page list received.');
  ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  console.log('CDP socket opened.');
  let serial=0;const pending=new Map(),exceptions=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(p){clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails);});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;const timer=setTimeout(()=>reject(Error(`CDP timeout: ${method}`)),5000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await call('Runtime.enable');await call('Page.enable');
  console.log('CDP connected; loading simulator.');
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/demos/offworld-sandbox/index.html`});
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-unit]').length===54"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelectorAll('[data-unit]').length"),54);
  assert.equal(await evaluate("document.querySelectorAll('[data-field=selected]:checked').length"),0);
  assert.equal(await evaluate("document.querySelectorAll('[data-field=selected]:disabled').length"),0);
  assert.equal(await evaluate("document.querySelectorAll('[data-slot]').length"),108);
  assert.equal(await evaluate("document.querySelectorAll('#roster .stats-radar').length"),54);
  assert.equal(await evaluate("document.querySelectorAll('[data-field=perception],[data-field=stamina],[data-field=endurance]').length"),0);
  assert(await evaluate("document.getElementById('deploymentTools').textContent.includes('Signal receiver')"));
  assert.equal(await evaluate("document.querySelectorAll('option[value$=\"_SIGNAL\"]').length"),0);
  await evaluate("document.querySelector('[data-unit=\"53\"] [data-field=favorite]').click()");
  assert.equal(await evaluate("document.querySelector('[data-unit]').dataset.unit"),'53');
  await call('Page.reload');
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-unit]').length===54"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelector('[data-unit]').dataset.unit"),'53','Favorite survives reload');
  assert.equal(await evaluate("document.querySelector('[data-unit] [data-field=favorite]').checked"),true);
  assert.equal(await evaluate("document.querySelectorAll('[data-field=tier],[data-field=branch],[data-charges]').length"),0,'configuration belongs in character editor');
  await evaluate(`(async()=>{const data=await (await fetch('../shared/data/personnel-loadouts.json')).json();const cached={};cached['unit-1']={...data.units['unit-1'],tier:3,branch:{kind:'cross',id:'DIPLOMAT',tier:1}};cached['unit-19']={...data.units['unit-19'],perception:9,tier:3,branch:{kind:'cross',id:'MEDIC',tier:1},availableTools:[{type:'TET2',charges:3},{type:'MET1',charges:3}],toolSlots:[{kitId:'TET2',charges:3},{kitId:'MET1',charges:3}]};cached['unit-10']={...data.units['unit-10'],tier:2,availableTools:[{type:'STT2',charges:3}],toolSlots:[{kitId:'STT2',charges:3},{kitId:'',charges:0}]};localStorage.setItem('sgc-personnel-loadouts-v1',JSON.stringify(cached));})()`);
  await call('Page.reload');
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-unit]').length===54"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelector('[data-unit=\"18\"] [data-slot=\"1\"]').disabled"),false);
  assert.equal(await evaluate("[...document.querySelector('[data-unit=\"18\"] [data-slot=\"1\"]').options].some(o=>o.value==='MET2')"),false);
  await evaluate("[0,9,18,27].forEach(i=>document.querySelector('[data-unit=\"'+i+'\"] [data-field=selected]').click())");
  await evaluate(`document.querySelector('[data-unit="18"] [data-slot="0"]').dispatchEvent(new Event('change',{bubbles:true}))`);
  await delay(150);
  await call('Page.reload');
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-unit]').length===54"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelectorAll('[data-field=selected]:checked').length"),0);
  assert(await evaluate(`document.querySelector('[data-unit="18"] .profession').textContent.includes('3')`));
  assert.equal(await evaluate(`document.querySelector('[data-unit="18"] [data-slot="0"]').value`),'TET2');
  assert.equal(await evaluate(`document.querySelector('[data-unit="18"] [data-slot="1"]').value`),'MET1');
  await evaluate(`document.querySelector('[data-unit="9"] [data-slot="0"]').value='STT2'`);
  await evaluate("[0,9,18,27].forEach(i=>document.querySelector('[data-unit=\"'+i+'\"] [data-field=selected]').click())");
  console.log('Party setup loaded.');
  assert.equal(await evaluate("document.querySelectorAll('#roster svg[viewBox=\"0 0 48 64\"]').length"),54);
  await evaluate("(()=>{const search=document.querySelector('[data-roster-filter=search]');search.value='Overdrive';search.dispatchEvent(new Event('input',{bubbles:true}));})()");
  assert.equal(await evaluate("document.querySelectorAll('[data-unit]:not([hidden])').length"),1);
  await evaluate("(()=>{const search=document.querySelector('[data-roster-filter=search]');search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));})()");
  await writeFile(join(profile,'setup.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await evaluate("document.getElementById('deploy').click();document.getElementById('keepGate').click()");
  assert.equal(await evaluate("document.getElementById('rendererMode').value"),'sprites');
  assert(await evaluate("document.querySelectorAll('#map .world-sprite').length>0"));
  const assetLoads=await evaluate(`Promise.all([...new Set([...document.querySelectorAll('#map image')].map(i=>i.getAttribute('href')))].map(src=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(src);image.src=src;})))`);
  assert(assetLoads.every(v=>v===true),JSON.stringify(assetLoads));
  await evaluate("document.getElementById('debugView').value='runtime';document.getElementById('designerButton').click()");
  const beforeToggle=await evaluate("document.getElementById('debugContent').textContent");
  await evaluate("document.getElementById('closeDesigner').click();document.getElementById('rendererMode').value='schematic';document.getElementById('rendererMode').dispatchEvent(new Event('change'))");
  assert(await evaluate("!!document.querySelector('#map .shared-map-surface')&&!document.querySelector('#map .world-sprite')"));
  await evaluate("document.getElementById('rendererMode').value='sprites';document.getElementById('rendererMode').dispatchEvent(new Event('change'));document.getElementById('designerButton').click()");
  assert.equal(await evaluate("document.getElementById('debugContent').textContent"),beforeToggle,'Renderer toggle does not mutate runtime');
  await evaluate("document.getElementById('closeDesigner').click()");
  assert.equal(await evaluate("document.getElementById('mission').hidden"),false);
  assert.equal(await evaluate("document.querySelectorAll('#party .stats-radar').length"),4);
  assert.equal(await evaluate("document.querySelectorAll('#party .unit-resource.stamina').length"),4);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#party .stamina .resource-fill')).backgroundColor"),'rgb(255, 255, 255)');
  assert(await evaluate("[...document.querySelectorAll('#party .stats-radar')].every(svg=>svg.getAttribute('aria-label').includes('EXP')&&!svg.getAttribute('aria-label').includes('STA'))"));
  assert(await evaluate("document.getElementById('partyTools').textContent.includes('Signal receiver')"));
  const door=async id=>{
    await evaluate(`document.querySelector('[data-transition="${id}"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
    if(await evaluate("document.getElementById('actionDialog').open")){
      await evaluate("document.getElementById('cancelAction').click()");
      assert(await evaluate(`!!document.querySelector('[data-recipe="enter-code-${id}"]')`),'Room code action is available');
      await evaluate(`document.querySelector('[data-recipe="enter-code-${id}"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));document.getElementById('startAction').click()`);
      await delay(1500);
      await evaluate(`document.querySelector('[data-transition="${id}"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
    }
    await delay(330);
  };
  const reply=async(id,actorId)=>{await evaluate(`document.querySelector('[data-dialogue-response="${id}"]').click()`);if(await evaluate("!!document.querySelector('[data-dialogue-actor]')"))await evaluate(actorId?`document.querySelector('[data-dialogue-actor="${actorId}"]').click()`:"document.querySelector('[data-dialogue-actor]').click()");};
  await door('door-gate-to-yard');
  assert(await evaluate("document.getElementById('mission').textContent.includes('Visitors check in with Reynolds inside.')"),'Authored yard dialogue appears during normal play');
  assert(await evaluate("document.querySelector('#conversation').parentElement.classList.contains('map-panel')&&getComputedStyle(document.querySelector('#conversation')).position==='absolute'"),'Conversation overlays map');
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  assert(await evaluate("document.querySelector('#conversation').getBoundingClientRect().width<=document.querySelector('.map-panel').getBoundingClientRect().width&&document.documentElement.scrollWidth<=innerWidth"),'Conversation overlay fits mobile map');
  await writeFile(join(profile,'dialogue-mobile.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  assert.equal(await evaluate("document.querySelectorAll('#conversation .portrait svg').length"),1,'NPC opens without an SGC responder');
  await reply('yard-ignore');
  await door('door-yard-to-mainhall');
  assert.equal(await evaluate("document.getElementById('stageTitle').textContent"),'Main Hall');
  assert(await evaluate("document.getElementById('context').textContent.includes('operative')"),'Scout observation should be presented');
  assert(await evaluate("!!document.querySelector('[data-transition=\"door-mainhall-to-security\"]')"),'Normal corridor needs no hack');
  await evaluate("document.querySelector('[data-station=\"unit-1\"]').click()");
  await door('door-yard-to-mainhall');
  await evaluate("document.getElementById('designerButton').click()");
  await evaluate("document.getElementById('debugView').value='runtime';document.getElementById('debugView').dispatchEvent(new Event('change'))");
  const stationed=await evaluate("JSON.parse(document.getElementById('debugContent').textContent).units.find(u=>u.unitId==='unit-1')");
  assert.equal(stationed.partyStatus,'STATIONED');assert.equal(stationed.currentStageId,'stage-main-hall');
  await evaluate("document.getElementById('closeDesigner').click()");await door('door-yard-to-mainhall');
  await evaluate("document.querySelector('[data-station=\"unit-1\"]').click()");
  await writeFile(join(profile,'desktop.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  assert(await evaluate("document.querySelectorAll('.door-inactive:not([data-transition])').length>0"));
  await door('door-mainhall-to-security');
  assert(await evaluate("document.getElementById('conversation').textContent.includes(\"Don't wander\")"));
  await reply('reynolds-routine');
  await evaluate(`document.querySelector('[data-npc="reynolds-01"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  assert(await evaluate("document.getElementById('npcDetails').textContent.includes('Security supervisor')"));
  assert(await evaluate("!!document.querySelector('#npcDetails .portrait svg')"));
  await evaluate("document.getElementById('closeNpcDetails').click()");

  assert(await evaluate("document.getElementById('conversation').hidden"),'Reynolds conversation completes');
  assert(!await evaluate("!!document.querySelector('[data-recipe=\"hack-door-security-to-office\"]')"),'Routine visitor door has no hack action');
  await evaluate(`document.querySelector('#map [data-engage="incident-security-guards"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  assert.equal(await evaluate("document.getElementById('wait').disabled"),true);
  await delay(2200);
  assert(await evaluate("document.getElementById('context').textContent.includes('round 0')"),'No round before three real seconds');
  await delay(1300);
  assert(await evaluate("document.getElementById('context').textContent.includes('round 1')"));
  assert(await evaluate("document.querySelectorAll('.floating-damage').length>0"),'Damage is shown over tokens');
  await writeFile(join(profile,'combat-damage.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await delay(1600);
  for(let i=0;i<15;i++){if(await evaluate("document.querySelectorAll('.floating-damage').length===0"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelectorAll('.floating-damage').length"),0,'Damage expires while waiting for next round');
  for(let i=0;i<300;i++){if(await evaluate("!document.querySelector('[data-retreat=\"incident-security-guards\"]')"))break;await delay(100);}
  assert(await evaluate("document.getElementById('context').textContent.includes('RESOLVED')"));
  assert(await evaluate("document.getElementById('context').textContent.includes('DOWN')"));
  await door('door-security-to-office');
  assert(await evaluate("document.getElementById('conversation').textContent.includes('mercenary crew')"),'Security approach receives the contractor briefing');
  await reply('mcguffin-mercenary-yes');
  assert(await evaluate("document.getElementById('conversation').textContent.includes('access codes')"));
  await evaluate("document.querySelector('[data-dialogue-continue]').click()");
  await door('door-security-to-office');await door('door-mainhall-to-security');
  await door('door-mainhall-to-processing');
  await evaluate("document.querySelector('[data-recipe=\"isolate-mining-power\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));document.getElementById('startAction').click()");
  await delay(1500);
  await door('door-processing-to-lab');
  assert.equal(await evaluate("document.getElementById('stageTitle').textContent"),'Analysis Lab');
  assert(!await evaluate("document.getElementById('context').textContent.includes('Asgard')"),'Lab entry does not identify the item');
  assert(!await evaluate("!!document.querySelector('[data-recipe=\"characterize-lab-device\"]')"),'Device work is hidden until the group search');
  await evaluate("document.querySelector('#map [data-work-group=\"search-analysis-lab\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))");
  assert.equal(await evaluate("document.querySelectorAll('#work [data-cancel-work]').length"),4,'Everybody has a separate search job');
  for(let i=0;i<140;i++){if(await evaluate("document.getElementById('work').textContent===''"))break;await delay(100);}
  assert(await evaluate("!!document.querySelector('[data-recipe=\"characterize-lab-device\"]')"),'Search reveals the Scientist focus');
  console.log('Group Lab search completed.');
  await evaluate("document.getElementById('focus').click()");await delay(150);
  await writeFile(join(profile,'sprite-lab-desktop.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate("document.getElementById('focus').click()");await delay(150);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Sprite toolbar and world fit mobile');
  await writeFile(join(profile,'sprite-lab-mobile.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await evaluate("document.getElementById('focus').click()");
  for(const id of ['characterize-lab-device','detach-lab-device']){
    await evaluate(`document.querySelector('[data-recipe="${id}"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
    assert.equal(await evaluate("document.getElementById('startAction').disabled"),false);
    await evaluate("document.getElementById('startAction').click()");
    for(let i=0;i<140;i++){if(await evaluate("document.getElementById('work').textContent===''"))break;await delay(100);}
    assert(await evaluate("document.getElementById('actionResults').textContent.includes('COMPLETED')"));
  }
  await evaluate("document.getElementById('debugView').value='runtime';document.getElementById('designerButton').click()");
  const lab=await evaluate("JSON.parse(document.getElementById('debugContent').textContent)");
  assert.equal(lab.instanceStates['lab-mounted-rifle-01'].physicalItem.state.mountState,'DETACHED');
  assert.deepEqual(lab.instanceStates['lab-mounted-rifle-01'].physicalItem.knowledge.instanceFindings,['LAB_DEVICE_PULSE_CHARACTERIZED']);
  assert(lab.discoveries.some(d=>d.discoveryId==='discovery-lab-device-behavior'));
  assert(!lab.knowledgeState.gained.includes('ELECTROMAGNETIC_ACCELERATION_II'));
  await evaluate("document.getElementById('closeDesigner').click()");
  await door('door-processing-to-lab');await door('door-processing-to-office');
  assert(await evaluate("document.querySelectorAll('.action-hex polygon').length>=3"));
  assert(await evaluate("document.getElementById('conversation').textContent.includes('how did you get access')"),'Processing approach receives the suspicious greeting');
  await reply('mcguffin-entry-diplomat','unit-1');
  for(const id of ['mcguffin-containment-play-dumb','mcguffin-processing-vague','mcguffin-lab-deflect','mcguffin-neutral-no']){assert(await evaluate(`document.querySelector('[data-dialogue-response=${id}]')?.disabled===false`),'Authored response eligible');await reply(id,'unit-1');}
  assert(await evaluate("!document.getElementById('conversation').hidden&&document.querySelector('[data-dialogue-continue]')!==null"),'McGuffin silent branch resolves to spoken terminal node');
  await evaluate("document.querySelector('[data-dialogue-continue]').click()");
  assert(!await evaluate("!!document.querySelector('[data-recipe=\"hack-door-security-to-office\"]')"));
  await evaluate("document.querySelector('[data-recipe=\"hack-security-terminal\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('actionDialog').open"),true);
  await evaluate("document.getElementById('requirementsDebug').open=true");
  assert(await evaluate("document.getElementById('actionRequirements').textContent.includes('TECH_SERVICE_II')"));
  await evaluate("document.getElementById('startAction').click()");await delay(1500);
  await writeFile(join(profile,'office.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await door('door-processing-to-office');await door('door-mainhall-to-processing');
  await door('door-yard-to-mainhall');
  await evaluate("document.querySelector('#map [data-engage=\"incident-yard-guards\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))");
  for(let i=0;i<300;i++){if(await evaluate("!document.querySelector('[data-retreat=\"incident-yard-guards\"]')"))break;await delay(100);}
  assert(await evaluate("document.getElementById('context').textContent.includes('RESOLVED')"),'Yard guards must be resolved before field evacuation');
  await evaluate("document.getElementById('return').click()");
  assert.match(await evaluate("document.getElementById('routeText').textContent"),/1 Stage/);
  await evaluate("document.getElementById('confirmReturn').click()");await delay(800);
  assert.equal(await evaluate("document.getElementById('stageTitle').textContent"),'Gate Yard');
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate("document.getElementById('focus').click()");
  assert(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'Mobile horizontal overflow');
  await writeFile(join(profile,'mobile.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  const npcChecks=await evaluate(`(async()=>{
    const {npcAlertSvg}=await import('./npc-presentation.mjs');
    const {applyNpcEffect}=await import('../shared/offworld/npc.mjs');
    const fixture={instanceStates:{neutral:{npcState:{disposition:'ROUTINE',suspicion:0,hostility:0}}},resultEvents:[],missionElapsedSeconds:0};
    const panel=document.createElement('div');panel.id='npc-smoke';document.body.append(panel);
    const symbols=[];
    for(const [suspicion,hostility] of [[0,0],[50,0],[100,0],[100,50],[100,100]]){
      fixture.instanceStates.neutral.npcState.suspicion=suspicion;fixture.instanceStates.neutral.npcState.hostility=hostility;
      panel.innerHTML='<svg viewBox="-20 -40 40 60" width="40" height="60">'+npcAlertSvg(fixture.instanceStates.neutral)+'</svg>';
      symbols.push(panel.querySelector('text').textContent);
    }
    applyNpcEffect(fixture,{type:'START_CONFRONTATION',instanceIds:['neutral']});
    const result={symbols,disposition:fixture.instanceStates.neutral.npcState.disposition,combatState:fixture.instanceStates.neutral.combatState??null};panel.remove();return result;
  })()`);
  assert.deepEqual(npcChecks,{symbols:['?','?','!','!','☹'],disposition:'CONFRONTING',combatState:null});
  const conversationChecks=await evaluate(`(async()=>{
    const {conversationHtml}=await import('./conversation.mjs');
    const {startDialogue,respondDialogue,continueDialogue}=await import('../shared/offworld/dialogue.mjs');
    const {compileMission}=await import('../shared/offworld/mission.mjs');
    const {createRuntime,chooseGate}=await import('../shared/offworld/runtime.mjs');
    const get=async p=>(await fetch(p)).json();
    const raw=await get('../shared/data/offworld/missing-operative-001.finalized.json');
    raw.dialogueScenes=[{dialogueSceneId:'smoke',participants:{left:'worker-yard-01',right:'ACTIVE_SGC_SPEAKER'},startNodeId:'hello',nodes:[
      {nodeId:'hello',speaker:'worker-yard-01',side:'LEFT',text:'Authored greeting.',responses:[{responseId:'reply',text:'Authored reply.',source:'NEUTRAL',nextNodeId:'bye'}]},
      {nodeId:'bye',speaker:'worker-yard-01',side:'LEFT',text:'Authored farewell.',endConversation:true}]}];
    const m=compileMission(raw,{...await get('../shared/data/offworld/archetypes.json'),itemDefinitions:await get('../shared/data/item.json')});
    const units=(await get('../shared/data/offworld/party-presets.json')).units.slice(0,4);
    const s=createRuntime(m,units,'2026-09-25T12:00Z');chooseGate(m,s,true);s.currentStageId='stage-outer-yard';
    s.stageStates[s.currentStageId].visibility='VISIBLE';s.units.forEach(u=>u.currentStageId=s.currentStageId);
    startDialogue(m,s,'smoke',s.units[0].unitId);
    const panel=document.createElement('section');panel.className='conversation';document.body.append(panel);panel.innerHTML=conversationHtml(m,s);
    const portraits=panel.querySelectorAll('.portrait svg').length;const left=!!panel.querySelector('.speech.left');
    panel.querySelector('[data-dialogue-response]').onclick=()=>{respondDialogue(m,s,'reply');panel.innerHTML=conversationHtml(m,s);};
    panel.querySelector('[data-dialogue-response]').click();const right=!!panel.querySelector('.speech.right');
    const overflow=document.documentElement.scrollWidth>window.innerWidth;
    continueDialogue(m,s);panel.remove();return {portraits,left,right,overflow,ended:s.dialogue===null};
  })()`);
  assert.deepEqual(conversationChecks,{portraits:2,left:true,right:true,overflow:false,ended:true});
  if(await evaluate("!document.getElementById('redial').disabled"))await evaluate("document.getElementById('redial').click()");
  await evaluate("document.getElementById('extract').click()");await delay(250);
  assert(await evaluate("!!document.querySelector('[data-recovery=receiving][value=\"lab-mounted-rifle-01\"]:not(:disabled)')"),'Detached lab instance is a Receiving candidate');
  assert(!await evaluate("document.getElementById('debrief').textContent.includes('Recovery requirements not met')"),'Unavailable assets stay off extraction');
  assert.equal(await evaluate("document.getElementById('debrief').hidden"),false);
  assert.equal(await evaluate("document.querySelectorAll('#objectives').length"),1);
  assert(await evaluate("!!document.querySelector('[data-recovery=receiving][value=\"supply-cache-01\"]:not(:disabled)')"));
  await evaluate("document.querySelector('[data-recovery=receiving][value=\"supply-cache-01\"]').click();document.getElementById('confirmRecovery').click()");
  await delay(300);
  assert(await evaluate("document.getElementById('error').textContent.includes('non-JSON response')"));
  assert.equal(await evaluate("document.querySelectorAll('[data-recovery=receiving]:checked').length"),1,'Failed save keeps selection');
  assert.equal(testBase.reservations.length,0,'Failed save does not reserve capacity');
  await evaluate("document.getElementById('confirmRecovery').click()");
  await delay(300);assert(await evaluate("document.getElementById('debrief').textContent.includes('Recovery plan confirmed')"));
  assert(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'Debrief mobile horizontal overflow');
  testBase.reservations.push({key:'previous-browser-run:mcguffin-01',instanceId:'mcguffin-01',destination:'HOLDING',cost:1},{key:'previous-browser-run:safe-intel-01',instanceId:'safe-intel-01',destination:'RECEIVING',cost:1});
  await evaluate("document.getElementById('setupButton').click();document.getElementById('resetButton').click()");await delay(300);
  assert.equal(testBase.reservations.length,0,'Reset clears Holding and Receiving across previous runs, even from setup');
  assert(await evaluate("document.getElementById('deploymentCapacity').textContent.includes('Holding 4/4')&&document.getElementById('deploymentCapacity').textContent.includes('Receiving 40/40')"));
  await evaluate("document.querySelectorAll('[data-field=selected]').forEach((input,i)=>{if([0,9,18,27].includes(i)&&!input.checked)input.click()});document.getElementById('deploy').click()");
  assert.equal(await evaluate("document.getElementById('gateChoice').hidden"),false);
  assert.equal(await evaluate("document.getElementById('error').hidden"),true);
  await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/demos/room-staffing-demo/index.html`});
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-unit-id]').length===54"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelectorAll('[data-unit-id]').length"),54,'Staffing still loads its original 54 personnel');
  assert.equal(await evaluate("document.querySelector('[data-unit-id]').dataset.unitId"),'unit-54','Favorites shared with staffing');
  assert.equal(await evaluate("document.querySelectorAll('.personnel-panel svg[viewBox=\"0 0 48 64\"]').length"),54);
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/demos/room-sandbox/index.html`});
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('#roomSelect option').length>0"))break;await delay(100);}
  assert(await evaluate("document.getElementById('baseSummary').textContent.includes('Receiving 40/40')"));
  await evaluate("document.getElementById('saveBase').click()");await delay(200);
  assert(await evaluate("document.getElementById('status').textContent.includes('Shared base saved')"));
  await evaluate("document.getElementById('loadBase').click()");await delay(200);
  await evaluate("document.getElementById('resetGrid').click();document.getElementById('placeRoom').click()");
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('.room-map-surface .shared-map-surface').length>0"))break;await delay(100);}
  assert(await evaluate("document.querySelectorAll('.room-map-surface .shared-map-surface').length>0"),'Room simulator uses the shared renderer');
  await evaluate("document.getElementById('roomSelect').value='analysis';document.getElementById('roomSelect').dispatchEvent(new Event('change'));document.getElementById('placeRoom').click()");
  assert(await evaluate("document.querySelectorAll('.room-map-surface .shared-map-surface').length>1"),'Both continuous and tiled rooms use the shared renderer');
  await writeFile(join(profile,'room-shared.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  assert.equal(exceptions.length,0,JSON.stringify(exceptions));
  console.log(`Browser smoke passed: roster, four-Unit deployment, two Tool slots, cross-path eligibility, observation, hacking and charges, station/rejoin, return, reset, no runtime errors, 390px layout. Screenshots: ${profile}`);
  ws.send(JSON.stringify({id:++serial,method:'Browser.close'}));
} finally {clearTimeout(deadline);ws?.close();browser.kill();server.close();}
