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
  try{const path=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!path.startsWith(root))throw Error();const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]??'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=spawn(process.env.EDGE_PATH??'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const deadline=setTimeout(()=>{console.error('Browser smoke timed out.');browser.kill();server.close();process.exit(1);},45000);
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
  assert(await evaluate("document.getElementById('deploymentTools').textContent.includes('Signal receiver')"));
  assert.equal(await evaluate("document.querySelectorAll('option[value$=\"_SIGNAL\"]').length"),0);
  await evaluate("document.querySelector('[data-unit=\"53\"] [data-field=favorite]').click()");
  assert.equal(await evaluate("document.querySelector('[data-unit]').dataset.unit"),'53');
  await call('Page.reload');
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-unit]').length===54"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelector('[data-unit]').dataset.unit"),'53','Favorite survives reload');
  assert.equal(await evaluate("document.querySelector('[data-unit] [data-field=favorite]').checked"),true);
  await evaluate(`(()=>{const card=document.querySelector('[data-unit="18"]');const tier=card.querySelector('[data-field=tier]');tier.value=3;tier.dispatchEvent(new Event('change',{bubbles:true}));const branch=card.querySelector('[data-field=branch]');branch.value='cross:MEDIC';branch.dispatchEvent(new Event('change',{bubbles:true}));card.querySelector('[data-slot="1"]').value='MET1';card.querySelector('[data-slot="0"]').value='TET2';})()`);
  assert.equal(await evaluate("document.querySelector('[data-unit=\"18\"] [data-slot=\"1\"]').disabled"),false);
  assert.equal(await evaluate("[...document.querySelector('[data-unit=\"18\"] [data-slot=\"1\"]').options].some(o=>o.value==='MET2')"),false);
  await evaluate(`(()=>{const card=document.querySelector('[data-unit="9"]');const tier=card.querySelector('[data-field=tier]');tier.value=2;tier.dispatchEvent(new Event('change',{bubbles:true}));card.querySelector('[data-slot="0"]').value='STT2';})()`);
  await evaluate("[0,9,18,27].forEach(i=>document.querySelector('[data-unit=\"'+i+'\"] [data-field=selected]').click())");
  await evaluate(`document.querySelector('[data-unit="18"] [data-slot="0"]').dispatchEvent(new Event('change',{bubbles:true}))`);
  await delay(150);
  await call('Page.reload');
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-unit]').length===54"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelectorAll('[data-field=selected]:checked').length"),0);
  assert.equal(await evaluate(`document.querySelector('[data-unit="18"] [data-field=tier]').value`),'3');
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
  assert.equal(await evaluate("document.getElementById('mission').hidden"),false);
  assert(await evaluate("document.getElementById('partyTools').textContent.includes('Signal receiver')"));
  const door=async id=>{await evaluate(`document.querySelector('[data-transition="${id}"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);await delay(330);};
  await door('door-gate-to-yard');await door('door-yard-to-mainhall');
  assert.equal(await evaluate("document.getElementById('stageTitle').textContent"),'Main Hall');
  assert(await evaluate("document.getElementById('context').textContent.includes('operative')"),'Scout observation should be presented');
  await evaluate("document.querySelector('[data-recipe=\"hack-door-mainhall-to-security\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))");
  assert.equal(await evaluate("document.getElementById('actionDialog').open"),true);
  await evaluate("document.getElementById('requirementsDebug').open=true");
  assert(await evaluate("document.getElementById('actionRequirements').textContent.includes('TECH_SERVICE_II')"));
  assert(await evaluate("document.getElementById('actionRequirements').textContent.includes('required 6')"));
  assert.equal(await evaluate("document.querySelectorAll('#actionRequirements .requirement-unit').length"),4);

  assert.equal(await evaluate("document.getElementById('startAction').disabled"),false);
  await evaluate("document.getElementById('startAction').click()");
  await delay(1300);
  await evaluate("document.getElementById('debugView').value='runtime';document.getElementById('designerButton').click()");
  const runtime=await evaluate("JSON.parse(document.getElementById('debugContent').textContent)");
  assert.equal(runtime.transitionStates['door-mainhall-to-security'].state,'OPEN');
  assert(await evaluate("document.getElementById('actionResults').textContent.includes('Door open')"));
  assert.equal(runtime.units.find(u=>u.profession==='TECHNICIAN').tools[0].chargesRemaining,2);
  assert.equal(runtime.units.find(u=>u.profession==='TECHNICIAN').tools.length,2);
  await evaluate("document.getElementById('closeDesigner').click();document.querySelector('[data-station=\"unit-1\"]').click()");
  await door('door-yard-to-mainhall');
  await evaluate("document.getElementById('designerButton').click()");
  const stationed=await evaluate("JSON.parse(document.getElementById('debugContent').textContent).units.find(u=>u.unitId==='unit-1')");
  assert.equal(stationed.partyStatus,'STATIONED');assert.equal(stationed.currentStageId,'stage-main-hall');
  await evaluate("document.getElementById('closeDesigner').click()");await door('door-yard-to-mainhall');
  await evaluate("document.querySelector('[data-station=\"unit-1\"]').click()");
  await writeFile(join(profile,'desktop.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  assert(await evaluate("document.querySelectorAll('.door-inactive:not([data-transition])').length>0"));
  await door('door-mainhall-to-security');
  assert(await evaluate(`!!document.querySelector('#map [data-recipe="intimidate-reynolds"]')&&!!document.querySelector('#map [data-recipe="negotiate-reynolds"]')`));
  await evaluate(`document.querySelector('#map [data-engage="incident-security-guards"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  await delay(3400);
  assert(await evaluate("document.getElementById('context').textContent.includes('RESOLVED')"));
  assert(await evaluate("document.getElementById('context').textContent.includes('DOWN')"));
  await door('door-mainhall-to-security');
  await door('door-mainhall-to-processing');await door('door-processing-to-office');
  assert(await evaluate("document.querySelectorAll('.action-hex polygon').length>=3"));
  assert.equal(await evaluate("document.querySelectorAll('#context [data-recipe^=destroy-security-terminal]').length"),1,'One Destroy choice for both professions');
  await writeFile(join(profile,'office.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await door('door-processing-to-office');await door('door-mainhall-to-processing');
  await evaluate("document.getElementById('return').click()");
  assert.match(await evaluate("document.getElementById('routeText').textContent"),/2 Stage/);
  await evaluate("document.getElementById('confirmReturn').click()");await delay(800);
  assert.equal(await evaluate("document.getElementById('stageTitle').textContent"),'Gate Yard');
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate("document.getElementById('focus').click()");
  assert(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'Mobile horizontal overflow');
  await writeFile(join(profile,'mobile.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await evaluate("document.getElementById('extract').click()");await delay(250);
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
  await evaluate("document.getElementById('resetButton').click()");await delay(300);
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
