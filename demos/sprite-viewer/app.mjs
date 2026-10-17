import {assets,identifySprite,previewSize,newestAssetsFirst,spriteSourceId} from './model.mjs';
import {readSpriteZip} from './zip.mjs';
import {startCharacterStudy} from './character-study.mjs';
import {activeSprites} from '../shared/sprites/active-sprites.mjs';
startCharacterStudy();
const $=id=>document.getElementById(id),imported=new Map();let selected=null,loadedOrder=0;
let rejected=new Set(),reviewService=false;
let installService=false,installing=false,activeSelections=activeSprites;const savedSourceIds=new Set(),installMessages=new Map();
try{const local=JSON.parse(localStorage.getItem('sprite-rejected')??'[]');if(Array.isArray(local))rejected=new Set(local.filter(id=>typeof id==='string'));}catch{}
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
function preview(asset,candidate,large=false){
 const node=el(large?'div':'button',undefined,`preview ${$('background').value}`);
 if(!large){node.type='button';node.setAttribute('aria-label',`Enlarge ${asset.key} ${candidate.label}`);node.onclick=()=>{selected={asset,candidate};showDetail();$('detail').showModal();};}
 const [width,height]=previewSize(asset,$('scale').value);
 if(asset.opaque&&$('tile').checked){const repeat=el('div',undefined,'repeat');repeat.style.width=width*3+'px';repeat.style.height=height*3+'px';repeat.style.backgroundImage=`url("${candidate.url}")`;repeat.style.backgroundSize=`${width}px ${height}px`;node.append(repeat);}
 else {const img=el('img');img.src=candidate.url;img.alt=`${asset.key} ${candidate.label}`;img.style.width=width+'px';img.style.height=height+'px';node.append(img);}
 return node;
}
function showDetail(){if(!selected)return;const {asset,candidate}=selected;$('detailTitle').textContent=`${asset.key} · ${candidate.label}`;$('large').replaceChildren(preview(asset,candidate,true));$('detailInfo').textContent=candidate.path??'Current manifest asset';}
function draw(){
 const query=$('search').value.trim().toLowerCase();$('gallery').replaceChildren();
 for(const asset of newestAssetsFirst(assets,imported.values()).filter(a=>a.key.includes(query)&&(!$('uninstalledOnly').checked||!(activeSelections[a.key]?.variants??(activeSelections[a.key]?[activeSelections[a.key]]:[])).some(v=>!v.disabled&&!rejected.has(v.sourceId))))){
  const group=el('section',undefined,'asset');group.dataset.key=asset.key;group.append(el('h2',asset.key),el('p',`${asset.runtimePixels.join('×')} runtime pixels · ${asset.displaySize.join('×')} world units${asset.pair?` · paired with ${asset.pair}`:''}`,'metadata'));
  const excluded=[...imported.values()].filter(c=>c.key===asset.key&&rejected.has(c.sourceId)).length;
  const variants=el('div',undefined,'variants'),candidates=[...[...imported.values()].filter(c=>c.key===asset.key&&($('showRejected').checked||!rejected.has(c.sourceId))).sort((a,b)=>b.loadedOrder-a.loadedOrder),{url:asset.url,label:'Latest installed / fallback',path:asset.src}];
  for(const candidate of candidates){const isRejected=rejected.has(candidate.sourceId),card=el('article',undefined,`variant${isRejected?' rejected':''}`),caption=el('div',undefined,'caption');caption.append(el('strong',candidate.label),el('p',candidate.path));
   if(candidate.dimensions)caption.append(el('p',candidate.dimensions));if(candidate.warning)caption.append(el('p',candidate.warning,'warning'));
   if(candidate.loadedAt)caption.append(el('p',`Loaded ${new Date(candidate.loadedAt).toLocaleTimeString()}`));
   if(candidate.sourceId){
    const reject=el('button',isRejected?'Restore variant':'👎 Reject variant');reject.type='button';reject.className='reject';reject.setAttribute('aria-label',`${isRejected?'Restore':'Reject'} ${asset.key} ${candidate.label}`);reject.onclick=()=>setRejected(candidate,!isRejected);caption.append(reject);
    if(isRejected)caption.append(el('p','Rejected — excluded from installation and simulator selection.','warning'));
    const installed=(activeSelections[asset.key]?.variants??(activeSelections[asset.key]?[activeSelections[asset.key]]:[])).some(v=>v.sourceId===candidate.sourceId&&!v.disabled);
    const install=el('button',installed?'Installed':installing?'Installing…':'Install variant');install.type='button';install.className='install';
    install.disabled=installed||installing||isRejected||!installService||!savedSourceIds.has(candidate.sourceId);
    install.title=!installService?'Restart the local demo server to enable installation.':!savedSourceIds.has(candidate.sourceId)?'Save this candidate in the repository and click Check source saving again.':asset.pair?'Installs both matching states from this batch and variant.':candidate.sourceId.startsWith('sprite-prepared/')?'Validate and install this prepared PNG unchanged.':'Prepare, validate and activate this variant.';
    install.onclick=()=>installCandidate(candidate);caption.append(install);
     if(!installed&&!installing&&!isRejected&&(!installService||!savedSourceIds.has(candidate.sourceId)))caption.append(el('p',!installService?'Installation unavailable — restart the local demo server and click Check source saving again.':`Preview only — ${candidate.sourceId} is not saved in the repository. Save prepared files under artwork/sprite-prepared/<batch>/vNN/ or load a source ZIP with saving enabled.`,'warning'));
    if(installMessages.has(candidate.sourceId))caption.append(el('p',installMessages.get(candidate.sourceId),'warning'));
   }
   card.append(preview(asset,candidate),caption);variants.append(card);
  }
  group.append(variants);if(excluded)group.append(el('p',`${excluded} rejected variant${excluded===1?'':'s'} excluded.`,'empty'));else if(candidates.length===1)group.append(el('p','No imported variants yet.','empty'));$('gallery').append(group);
 }
 showDetail();
}
async function load(files){
 let accepted=0,ignored=0,failed=0;
 for(const file of files){const info=identifySprite(file.name);if(!info){ignored++;continue;}
  if(file.size>32*1024*1024){failed++;continue;}
  const url=URL.createObjectURL(file);
  try{
   const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());if(bytes.join(',')!=='137,80,78,71,13,10,26,10')throw Error('Not PNG');
   const image=new Image();image.src=url;await image.decode();
   const path=file.webkitRelativePath||file.name,asset=assets.find(a=>a.key===info.key),expected=info.source?[1024,1024]:asset.runtimePixels;
   const valid=image.naturalWidth===expected[0]&&image.naturalHeight===expected[1];
   const sourceId=spriteSourceId(path),prepared=sourceId?.startsWith('sprite-prepared/');
   const identity=sourceId??path;if(imported.has(identity))URL.revokeObjectURL(imported.get(identity).url);
   imported.set(identity,{...info,url,path,sourceId,label:prepared?`Prepared ${sourceId.split('/')[2]}`:info.variant,loadedOrder:++loadedOrder,loadedAt:file.sourceSavedAt??Date.now(),dimensions:`${image.naturalWidth}×${image.naturalHeight} PNG`,warning:valid?prepared?'Independent prepared variant; installation validates and copies this saved PNG without resizing or recentering.':'Visual review only; not validated for installation.':`Expected ${expected.join('×')}; preview allowed, contract dimensions differ.`});accepted++;
  }catch{URL.revokeObjectURL(url);failed++;}
 }
 $('status').textContent=`${assets.length} assets · ${imported.size} imported candidates. Added ${accepted}; ignored ${ignored} unrecognized files; ${failed} unreadable or oversized PNGs.`;draw();
}
async function setRejected(candidate,value){
 try{
  if(reviewService){
   const response=await fetch('/api/sprite-reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:candidate.sourceId,rejected:value})});const result=await response.json();
   if(!response.ok||!result.saved)throw Error(result.error??'Review save failed.');rejected=new Set(result.rejected);
  }else{if(value)rejected.add(candidate.sourceId);else rejected.delete(candidate.sourceId);}
  try{localStorage.setItem('sprite-rejected',JSON.stringify([...rejected]));}catch{}
  if(reviewService&&installService)await loadInstaller();
  if(value&&selected?.candidate===candidate){selected=null;$('detail').close();}
  $('status').textContent=`${value?'Rejected':'Restored'} ${candidate.key} ${candidate.label}. ${reviewService?'Saved to sprite-sources/sprite-review.json.':'Saved in this browser only; restart the local server to share reviews.'}`;draw();
 }catch(error){$('status').textContent=`Could not save review: ${error.message}`;}
}
async function loadReviews(){
 try{const response=await fetch('/api/sprite-reviews');if(!response.ok)return;const result=await response.json();if(result.service!=='sprite-reviews'||!Array.isArray(result.rejected))return;reviewService=true;rejected=new Set(result.rejected);draw();}catch{}
}
function applyActive(active){
 activeSelections=active;
 for(const asset of assets)if(active[asset.key]){asset.src=active[asset.key].src;asset.url=new URL(asset.src,new URL('../offworld-sandbox/sprite-manifest.mjs',import.meta.url)).href;}
 draw();
}
async function loadInstaller(){
 try{const response=await fetch('/api/sprite-install');if(!response.ok)return;const result=await response.json();if(result.service!=='sprite-install')return;installService=true;applyActive(result.active);}catch{}
}
async function installCandidate(candidate){
 installing=true;installMessages.set(candidate.sourceId,'Preparing and validating…');draw();
 try{
  const response=await fetch('/api/sprite-install',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:candidate.sourceId})});const result=await response.json();
  if(!response.ok||!result.installed)throw Error(result.error??'Installation failed.');
  applyActive(result.active);installMessages.set(candidate.sourceId,`Installed ${result.keys.join(' + ')}. Refresh the simulator to use this art.`);
  $('status').textContent=`Installed ${result.keys.join(' + ')}. Refresh the simulator to load the new art.`;
 }catch(error){installMessages.set(candidate.sourceId,`Install failed: ${error.message}`);$('status').textContent=`Install failed: ${error.message}`;}
 finally{installing=false;draw();}
}
for(const id of ['search','background','scale','tile','showRejected','uninstalledOnly'])$(id).addEventListener(id==='search'?'input':'change',draw);
for(const id of ['folder','files'])$(id).addEventListener('change',async event=>{const files=[...event.target.files];await loadSavedSources();await load(files);event.target.value='';});
$('zips').addEventListener('change',async event=>{
 const archives=[...event.target.files];event.target.value='';
 for(const archive of archives){
  $('status').textContent=`Opening ${archive.name}…`;
  try{
   if(archive.size>128*1024*1024)throw Error('ZIP exceeds 128 MiB.');
   const zipBytes=await archive.arrayBuffer(),entries=await readSpriteZip(zipBytes);
   const files=entries.map(entry=>{const file=new File([entry.bytes],entry.name,{type:'image/png'});Object.defineProperty(file,'webkitRelativePath',{value:`${archive.name}/${entry.path}`});return file;});
   if(!files.length)throw Error('No PNG files found in this ZIP.');
   await load(files);
   if($('saveSources').checked&&!$('saveSources').disabled){
    try{
     const response=await fetch(`/api/sprite-sources?name=${encodeURIComponent(archive.name)}`,{method:'POST',headers:{'Content-Type':'application/zip'},body:zipBytes});
     const result=await response.json();if(!response.ok||!result.saved)throw Error(result.error??'Source save failed.');
     $('status').textContent+=` ${result.alreadySaved?'Already saved':'Saved'} ${result.count} PNGs to ${result.path}.`;
     for(const file of files){const id=spriteSourceId(file.webkitRelativePath);if(id)savedSourceIds.add(id);}draw();
    }catch(error){$('status').textContent+=` Preview loaded; save failed: ${error.message}`;}
   }
  }catch(error){$('status').textContent=`Could not open ${archive.name}: ${error.message}`;}
 }
});
$('clear').onclick=()=>{for(const candidate of imported.values())URL.revokeObjectURL(candidate.url);imported.clear();selected=null;$('detail').close();$('status').textContent=`${assets.length} assets · imported variants cleared.`;draw();};
$('close').onclick=()=>$('detail').close();
window.addEventListener('pagehide',()=>{for(const candidate of imported.values())URL.revokeObjectURL(candidate.url);});
$('status').textContent=`${assets.length} assets · current manifest sprites. Load PNGs or a folder to compare variants.`;draw();
async function loadSavedSources(){
 $('retryStorage').disabled=true;
 let result;
 try{
  const response=await fetch('/api/sprite-sources');if(!response.ok)throw Error(`Source saving returned HTTP ${response.status}.`);
  result=await response.json();if(result.service!=='sprite-sources'||result.writable!==true||!Array.isArray(result.files))throw Error('This server does not provide source saving.');
 }catch(error){
  const port=['localhost','127.0.0.1'].includes(location.hostname)?location.port||'8001':'8001';
  $('saveSources').checked=false;$('saveSources').disabled=true;
  $('storageAvailability').textContent='Saving unavailable — restart local demo server';
  $('saveSources').title='Disabled because the local source-saving service is unavailable.';
  $('storageStatus').textContent=`${error.message} In the server terminal press Ctrl+C, then run node demos/serve.mjs ${port}. Refresh this page or click Check source saving again. Until connected, ZIPs are previews only.`;
  $('retryStorage').disabled=false;return;
 }
 const wasUnavailable=$('saveSources').disabled;
 $('saveSources').disabled=false;if(wasUnavailable)$('saveSources').checked=true;
 $('saveSources').title='Save recognized PNGs to artwork/sprite-sources when loading ZIPs.';
 $('storageAvailability').textContent='Source saving available';
 $('storageStatus').textContent='ZIP saving enabled: PNGs are saved to artwork/sprite-sources on this local server and reloaded automatically. Saving does not install active sprites. Uncheck to preview only.';
 try{
   savedSourceIds.clear();
   const files=[];for(const entry of [...result.files].sort((a,b)=>a.savedAt-b.savedAt)){
   savedSourceIds.add(spriteSourceId(entry.path));
   const source=await fetch(entry.url);if(!source.ok)continue;
   const file=new File([await source.blob()],entry.name,{type:'image/png'});Object.defineProperty(file,'webkitRelativePath',{value:entry.path});file.sourceSavedAt=entry.savedAt;files.push(file);
  }
  if(files.length)await load(files);
 }catch(error){$('storageStatus').textContent=`Source saving is available, but saved previews could not reload: ${error.message}`;}
 finally{$('retryStorage').disabled=false;}
}
$('retryStorage').onclick=async()=>{await loadReviews();await loadInstaller();await loadSavedSources();};
await loadReviews();await loadInstaller();loadSavedSources();
