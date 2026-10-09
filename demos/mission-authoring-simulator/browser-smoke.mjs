// Isolated real-Edge DOM smoke; read-only app fixtures, in-memory test telemetry.
import {createServer} from 'node:http';
import {readFile,mkdtemp} from 'node:fs/promises';
import {resolve,extname,join,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve('.'),profile=await mkdtemp(join(tmpdir(),'mission-author-browser-')),writes=[];
let report,failReport;const reported=new Promise((r,j)=>{report=r;failReport=j;});
const server=createServer(async(req,res)=>{
 if(req.url==='/__smoke-result'&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;res.end('ok');try{report(JSON.parse(body));}catch(error){failReport(error);}return;}
 if(req.method!=='GET'){writes.push(req.url);res.writeHead(405);res.end();return;}
 if(req.url==='/__smoke.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body style="margin:0;background:#0c121c;color:white"><p id="outcome">Checking Mission Author…</p><iframe title="Mission Author smoke" style="width:1440px;height:950px;border:0" src="/demos/mission-authoring-simulator/index.html"></iframe><script type="module" src="/demos/mission-authoring-simulator/browser-test.mjs"></script></body></html>');return;}
 try{const path=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!path.startsWith(root+sep))throw Error('Outside root');res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]??'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=spawn(process.env.EDGE_PATH??'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${profile}`,'--window-size=1440,1100',`http://127.0.0.1:${server.address().port}/__smoke.html`],{windowsHide:true,stdio:'ignore'});
browser.on('error',failReport);browser.on('exit',code=>failReport(Error(`Edge exited before reporting browser checks (code ${code})`)));const deadline=setTimeout(()=>failReport(Error('Browser smoke timed out')),45000);
try{const result=await reported;assert(result.ok,result.error);assert.deepEqual(writes,[]);console.log(`Mission Author Edge smoke passed: ${result.checks}; no live writes/runtime errors.`);}finally{clearTimeout(deadline);browser.kill();server.close();}
