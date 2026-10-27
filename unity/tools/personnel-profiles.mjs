// Render the existing shared profile SVGs/icons into an atlas; no new artwork.
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {deploymentRoster} from '../../demos/shared/offworld/roster.mjs';
import {toolOptions} from '../../demos/shared/offworld/equipment.mjs';
import {portraitBustSvg} from '../../demos/shared/portraits/portrait-bust.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(readFileSync(resolve(root,'demos/shared/data',p),'utf8'));
const classes=read('base-classes.json'),names=read('personnel-names.json'),equipment=read('offworld/archetypes.json');
const roster=deploymentRoster(classes,names,read('offworld/party-presets.json'),read('personnel-loadouts.json')).units;
const specIcons=read('specialization-icons.json'),entries=[],portraits={},icons={},displayNames={},toolStyles={},counts={};
const add=(svg,width,height)=>{const n=entries.length,x=n%8*128,y=Math.floor(n/8)*128;entries.push({svg,x,y,width,height});return {x,y,width,height};};
for(const u of roster){
 portraits[u.unitId]=add(portraitBustSvg(u.portrait?.appearance??u.appearance),96,128);
 const pool=names.pools[u.profession.toLowerCase()].nicknames,index=counts[u.profession]??0;counts[u.profession]=index+1;
 const nickname=pool[index%pool.length],split=u.name.indexOf(' ');
 displayNames[u.unitId]={canonical:u.name,nickname,display:u.name.slice(0,split)+' "'+nickname+'" '+u.name.slice(split+1)};
 const leveled={...u,tier:3,branch:u.branch?{...u.branch,tier:3}:null};
 for(const option of toolOptions(leveled,equipment)){
  const base=classes.find(c=>c.id.toUpperCase()===option.track)??classes.find(c=>c.id.toUpperCase()===u.profession);
  if(!icons[option.track]){const path=specIcons[option.track]??base.icon;icons[option.track]=add(readFileSync(resolve(root,'demos/shared/data',path),'utf8'),64,64);}
  toolStyles[option.id]={track:option.track,color:base.color,icon:icons[option.track]};
 }
}
const width=1024,height=Math.ceil(entries.length/8)*128;
const signature=createHash('sha256').update(JSON.stringify({entries,displayNames,toolStyles})).digest('hex');
const out=resolve(root,'unity/StargateOrionis/Assets/Orionis/Resources/OrionisArt');mkdirSync(out,{recursive:true});
const manifest={format:'orionis-personnel-profiles-1',atlas:'personnel-profiles',width,height,signature,portraits,names:displayNames,toolStyles};
if(process.argv.includes('--check')){
 const old=JSON.parse(readFileSync(join(out,'personnel-catalog.json'),'utf8'));
 if(old.signature!==signature||!existsSync(join(out,'personnel-profiles.png')))throw Error('Profile atlas is stale.');
 console.log(`Verified ${roster.length} shared profiles and ${Object.keys(icons).length} Tool icons.`);
}else{
 const temp=mkdtempSync(join(tmpdir(),'orionis-profile-render-'));
 const html='<!doctype html><style>html,body{margin:0;background:transparent}svg{width:100%;height:100%;display:block}</style>'+entries.map(e=>`<div style="position:absolute;left:${e.x}px;top:${e.y}px;width:${e.width}px;height:${e.height}px">${e.svg}</div>`).join('');
 const page=join(temp,'atlas.html');writeFileSync(page,html);
 const browser=spawn(process.env.EDGE_PATH??'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+join(temp,'browser'),'about:blank'],{windowsHide:true,stdio:'ignore'});
 let ws;const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const deadline=setTimeout(()=>{browser.kill();throw Error('Profile rendering exceeded 30 seconds.');},30000);
 try{
  let port;for(let n=0;n<100;n++){try{port=readFileSync(join(temp,'browser/DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{await delay(100);}}
  if(!port)throw Error('Profile renderer did not start.');
  const pages=await(await fetch(`http://127.0.0.1:${port}/json`)).json();ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(p)m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const serial=++id;pending.set(serial,{resolve,reject});ws.send(JSON.stringify({id:serial,method,params}));});
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:pathToFileURL(page).href});
  for(let n=0;n<50;n++){const r=await call('Runtime.evaluate',{expression:`document.readyState==='complete'&&document.querySelectorAll('svg').length===${entries.length}`,returnByValue:true});if(r.result.value)break;await delay(50);}
  const png=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height,scale:1}});
  writeFileSync(join(out,'personnel-profiles.png'),Buffer.from(png.data,'base64'));
  writeFileSync(join(out,'personnel-catalog.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Rendered ${roster.length} shared profiles and ${Object.keys(icons).length} Tool icons.`);
 }finally{clearTimeout(deadline);ws?.close();browser.kill();}
}
