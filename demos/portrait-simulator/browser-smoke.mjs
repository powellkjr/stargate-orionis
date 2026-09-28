// Optional real-browser check, no npm dependencies. EDGE_PATH may override Windows Edge.
import {createServer} from 'node:http';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve,extname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve('.'),profile=await mkdtemp(join(tmpdir(),'portrait-browser-'));
const server=createServer(async(req,res)=>{
  try{const path=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!path.startsWith(root))throw Error();const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]??'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=spawn(process.env.EDGE_PATH??'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const deadline=setTimeout(()=>{console.error('Browser smoke timed out.');browser.kill();server.close();process.exit(1);},45000);
let ws;
try {
  let port;for(let n=0;n<100;n++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await delay(100);}}
  assert(port,'Browser did not start');
  const pages=await (await fetch(`http://127.0.0.1:${port}/json`,{signal:AbortSignal.timeout(5000)})).json();
  ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  let serial=0;const pending=new Map(),exceptions=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(p){clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails);});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;const timer=setTimeout(()=>reject(Error(`CDP timeout: ${method}`)),5000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await call('Runtime.enable');await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  const origin=`http://127.0.0.1:${server.address().port}`;
  await call('Page.navigate',{url:`${origin}/demos/portrait-simulator/index.html`});
  for(let i=0;i<100;i++){if(await evaluate("document.querySelectorAll('[data-study]').length===6"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelectorAll('[data-study]').length"),6);
  assert.equal(await evaluate("document.querySelectorAll('[data-roster]').length"),54);
  assert.equal(await evaluate("document.querySelectorAll('#compat figure').length"),3);
  assert.equal(await evaluate("document.getElementById('error').hidden"),true);
  assert(await evaluate("document.querySelector('#stage [data-part=background]')!==null"));
  await writeFile(join(profile,'portrait.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  const before=await evaluate("document.getElementById('record').textContent");
  await evaluate("(()=>{const s=document.getElementById('style-hairStyle');s.value='curls';s.dispatchEvent(new Event('change',{bubbles:true}));})()");
  assert.notEqual(await evaluate("document.getElementById('record').textContent"),before,'hair change must update the record');
  await evaluate("(()=>{const c=document.querySelector('[data-layer=hair]');c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}));})()");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#stage [data-part=hair]')).display"),'none','hidden layer must not paint');
  await evaluate("(()=>{const c=document.querySelector('[data-layer=hair]');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));})()");
  const styled=await evaluate("document.getElementById('record').textContent");
  await evaluate("document.getElementById('randomize').click();");
  assert.notEqual(await evaluate("document.getElementById('record').textContent"),styled,'randomize must change the record');
  assert(await evaluate("document.getElementById('stage').innerHTML.includes(document.getElementById('color-collarColor').value)"),'accent colour must reach the bust');
  await evaluate("document.querySelector('[data-scale=\"2\"]').click();");
  assert.equal(await evaluate("document.querySelector('[data-scale=\"2\"]').getAttribute('aria-pressed')"),'true');
  await evaluate("document.querySelector('[data-roster]').click();");
  assert.match(await evaluate("document.getElementById('studyLabel').textContent"),/shared roster/);
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  assert(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'Mobile horizontal overflow');
  await writeFile(join(profile,'mobile.png'),Buffer.from((await call('Page.captureScreenshot')).data,'base64'));
  await call('Page.navigate',{url:`${origin}/demos/index.html`});
  for(let i=0;i<50;i++){if(await evaluate("document.querySelectorAll('.demo-card').length===5"))break;await delay(100);}
  assert.equal(await evaluate("document.querySelectorAll('.demo-card').length"),5,'demo index must list the portrait simulator');
  assert.equal(exceptions.length,0,JSON.stringify(exceptions));
  console.log(`Browser smoke passed: studies, roster, layers, randomization, scaling, mobile layout, demo index. Screenshots: ${profile}`);
  ws.send(JSON.stringify({id:++serial,method:'Browser.close'}));
} finally {clearTimeout(deadline);ws?.close();browser.kill();server.close();}

