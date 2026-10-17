// Real browser check; only telemetry POSTs are allowed. No live base writes.
import {createServer} from 'node:http';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve,join,sep,extname} from 'node:path';
import {tmpdir} from 'node:os';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const root=resolve('.'),profile=await mkdtemp(join(tmpdir(),'room-sprites-browser-')),writes=[];
let report,reject;const reported=new Promise((r,j)=>{report=r;reject=j});
const server=createServer(async(req,res)=>{
 if(req.url==='/__room-result'&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;res.end('ok');try{report(JSON.parse(body))}catch(e){reject(e)}return}
 if(req.method!=='GET'){writes.push(req.url);res.writeHead(405).end();return}
 if(req.url==='/__room-test.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body><iframe style="width:1440px;height:1000px;border:0" src="/demos/room-sandbox/"></iframe><script type="module" src="/demos/room-sandbox/browser-test.mjs"></script></body></html>');return}
 try{
  let url=decodeURIComponent(req.url.split('?')[0]);if(url.endsWith('/'))url+='index.html';const path=resolve(root,'.'+url);if(!path.startsWith(root+sep))throw Error('Outside repository');
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[extname(path)]??'application/octet-stream');res.end(await readFile(path));
 }catch{res.writeHead(404).end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=spawn(process.env.EDGE_PATH??'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'--window-size=1440,1100',`http://127.0.0.1:${server.address().port}/__room-test.html`],{windowsHide:true,stdio:'ignore'});
browser.on('error',reject);browser.on('exit',code=>reject(Error(`Edge exited before checks (${code})`)));const deadline=setTimeout(()=>reject(Error('Room browser check timed out')),45000);
try{
 const result=await reported;assert(result.ok,result.error);assert.deepEqual(writes,[]);
 if(process.env.ROOM_SPRITE_REVIEW){
  const port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];
  const pages=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(),page=pages.find(p=>p.type==='page'&&p.url.includes('__room-test.html'));
  const socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
  const capture=new Promise((r,j)=>{socket.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id===1)msg.error?j(Error(msg.error.message)):r(msg.result.data)}});
  socket.send(JSON.stringify({id:1,method:'Page.captureScreenshot',params:{format:'png'}}));
  const path=join(profile,'room-sprites.png');await writeFile(path,Buffer.from(await capture,'base64'));socket.close();console.log(`Visual review: ${path}`);
 }
 console.log(`Room Sandbox Edge smoke passed: ${result.checks}`);
}finally{clearTimeout(deadline);browser.kill();server.close()}
