// Isolated Edge DOM checks; only test telemetry is posted, never live saves.
import {createServer} from 'node:http';
import {readFile,mkdtemp,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,join,sep} from 'node:path';
import {tmpdir} from 'node:os';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
import {deflateRawSync} from 'node:zlib';import {zipFixture} from './zip-fixtures.mjs';
import {saveSpriteSources,listSpriteSources,readSpriteReviews,setSpriteRejected} from './sources-server.mjs';
import {installSpriteVariant,readActiveSprites} from './install-server.mjs';
const root=resolve('.'),profile=await mkdtemp(join(tmpdir(),'sprite-viewer-browser-')),saveRoot=await mkdtemp(join(tmpdir(),'sprite-viewer-sources-')),writes=[];
let report,reject;const reported=new Promise((r,j)=>{report=r;reject=j;});
const server=createServer(async(req,res)=>{
 if(['/__prepared-fixture','/__room-fixture'].includes(req.url)&&req.method==='POST'){
  const folder=join(saveRoot,'artwork/sprite-prepared/any-name/v03');await mkdir(folder,{recursive:true});const chunks=[];for await(const chunk of req)chunks.push(chunk);await writeFile(join(folder,req.url==='/__room-fixture'?'floor-room-analysis.png':'floor-lab.png'),Buffer.concat(chunks));res.end('saved isolated fixture');return;
 }
 // Keep the test manifest independent of art installed in the live checkout.
 if(req.url==='/demos/shared/sprites/active-sprites.mjs'){res.setHeader('Content-Type','text/javascript');res.end('export const activeSprites = {};');return;}
 if(req.url==='/api/sprite-install'){
  try{
   if(req.method==='GET'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({service:'sprite-install',active:await readActiveSprites(saveRoot)}));return;}
   let body='';for await(const chunk of req)body+=chunk;const result=await installSpriteVariant(saveRoot,JSON.parse(body).id);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));
  }catch(error){res.writeHead(400,{'Content-Type':'application/json'}).end(JSON.stringify({error:error.message}));}return;
 }
 if(req.url==='/api/sprite-reviews'){
  try{
   if(req.method==='GET'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({service:'sprite-reviews',rejected:await readSpriteReviews(saveRoot)}));return;}
   let body='';for await(const chunk of req)body+=chunk;const data=JSON.parse(body),result=await setSpriteRejected(saveRoot,data.id,data.rejected);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));
  }catch(error){res.writeHead(400,{'Content-Type':'application/json'}).end(JSON.stringify({error:error.message}));}return;
 }
 if(req.url.startsWith('/api/sprite-sources')){
  try{
   if(req.method==='GET'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({service:'sprite-sources',writable:true,files:await listSpriteSources(saveRoot)}));return;}
   const chunks=[];for await(const chunk of req)chunks.push(chunk);const result=await saveSpriteSources(saveRoot,new URL(req.url,'http://localhost').searchParams.get('name'),Buffer.concat(chunks));res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));
  }catch(error){res.writeHead(400,{'Content-Type':'application/json'}).end(JSON.stringify({error:error.message}));}return;
 }
 if(req.url==='/__deflate.zip'){res.end(zipFixture([['floor-indoor.png',new TextEncoder().encode('test data')]],{compress:deflateRawSync}));return;}
 if(req.url==='/__smoke-result'&&req.method==='POST'){let body='';for await(const chunk of req)body+=chunk;res.end('ok');try{report(JSON.parse(body));}catch(error){reject(error);}return;}
 if(req.method!=='GET'){writes.push(req.url);res.writeHead(405).end();return;}
 if(req.url==='/__smoke.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body><iframe title="Sprite viewer checks" style="width:1440px;height:950px;border:0" src="/demos/sprite-viewer/"></iframe><script type="module" src="/demos/sprite-viewer/browser-test.mjs"></script></body></html>');return;}
  try{let pathname=decodeURIComponent(req.url.split('?')[0]);if(pathname.endsWith('/'))pathname+='index.html';const base=pathname.startsWith('/artwork/sprite-sources/')||pathname.startsWith('/artwork/sprite-prepared/')||pathname.startsWith('/demos/shared/sprites/offworld/production/')?saveRoot:root,path=resolve(base,'.'+pathname);if(!path.startsWith(base+sep))throw Error('Outside root');res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[extname(path)]??'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=spawn(process.env.EDGE_PATH??'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${profile}`,'--window-size=1440,1100',`http://127.0.0.1:${server.address().port}/__smoke.html`],{windowsHide:true,stdio:'ignore'});
browser.on('error',reject);browser.on('exit',code=>reject(Error(`Edge exited before checks (code ${code})`)));const deadline=setTimeout(()=>reject(Error('Browser smoke timed out')),45000);
try{const result=await reported;assert(result.ok,result.error);assert.deepEqual(writes,[]);assert.equal((await listSpriteSources(saveRoot)).length,3);if(process.env.SPRITE_STUDY_REVIEW){for(const [i,url] of result.reviews.entries())await writeFile(join(profile,`study-${i}.png`),Buffer.from(url.split(',')[1],'base64'));console.log(`Study review images: ${profile}`);}console.log(`Sprite viewer Edge smoke passed: ${result.checks}; ZIP saved only to isolated temporary source directory; no live writes.`);}finally{clearTimeout(deadline);browser.kill();server.close();}
