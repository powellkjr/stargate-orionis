import {roomKitPieces,roomKitGeometry as geometry,roomKitVariants} from '../shared/sprites/room-kit-prompts.mjs';
import {resolveKitLayout,rectangleCells,edgeKey,sides} from './room-kit-layout.mjs';
import {insetRoomLights} from './room-kit-lighting.mjs';
import {roomDoorLeaves,doorLeafName} from './room-kit-doors.mjs';
import {RoomLayerStudy} from './room-layer-study.mjs';

const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const batch='../../artwork/room-kit-studies/material-storage/b001/';
const leafBatch='../../artwork/room-kit-studies/material-storage/door-leaves-b001/';
let kitId='material-storage',sources={},ownedUrls=[],vertical=false,fixtures=[],loading=false;
let doorState='open',leafSources={},leafUrls=[],loadingLeaves=false;
const layerStudy=new RoomLayerStudy();
const layered=()=>$('composition').value==='layers';
const currentDoorKit=()=>layered()?'material-storage':kitId;
const currentFamily=()=>layered()?$('wallFamily').value:$('family').value;
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const sourceName=(kit,piece,family)=>`${kit}-${piece}__${family}__source.png`;

function resetFixtures() {
 fixtures=[[1,1],[vertical?1:2,vertical?2:1],[2,2]].map(([width,height],i)=>({id:`layout-${i}`,width,height,doors:new Set()}));
 applyPreset();
}
function applyPreset() {
 const mode=$('doors').value;
 for(const f of fixtures){
  const candidates={north:edgeKey(0,0,'north'),east:edgeKey(f.width-1,0,'east'),south:edgeKey(0,f.height-1,'south'),west:edgeKey(0,0,'west')};
  f.doors=new Set(mode==='all'?resolveKitLayout(rectangleCells(f.width,f.height)).boundary.map(e=>e.key):
   (mode==='none'?[]:mode==='adjacent'?['north','east']:mode==='opposite'?['north','south']:['south']).map(s=>candidates[s]));
 }
 render();
}

// Underlay phase follows one clockwise perimeter loop. Door gaps clip visibility
// without restarting the pattern. The unavoidable closing seam is at northwest.
function underlay(f,edges,tier) {
 const W=f.width*128,H=f.height*128,id=`ct-${f.id}`;
 const clips=edges.flatMap(e=>{
  const segments=e.door?[[0,48],[80,128]]:[[0,128]];
  return segments.map(([a,b])=>`<rect transform="translate(${e.x*128} ${e.y*128}) rotate(${e.rotation} 64 64)" x="${a}" y="4" width="${b-a}" height="5"/>`);
 }).join('');
 const pattern={1:['#f5b942','8 16',-8],2:['#38bdf8','6 4 6 8',-4],3:['#c084fc','16 8',-4]}[tier];
 const path=`M6.5 6.5 H${W-6.5} V${H-6.5} H6.5 Z`;
 const inset=$('lighting').value==='inset';
 // Neutral metal fills unused channel space, rotating with each wall edge.
 if(inset)return `<defs><linearGradient id="${id}-metal" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="9"><stop offset="0" stop-color="#a0adb5"/><stop offset=".25" stop-color="#81929e"/><stop offset=".75" stop-color="#788b98"/><stop offset="1" stop-color="#576b79"/></linearGradient></defs><g data-channel-infill="metal" fill="url(#${id}-metal)">${clips}</g>`;
 return `<defs><clipPath id="${id}">${clips}</clipPath></defs><g clip-path="url(#${id})" fill="none" stroke-width="5" stroke-linejoin="miter"><path d="${path}" stroke="${inset?'#53616b':'#63707a'}"/>${inset?'':`<path d="${path}" stroke="${pattern[0]}" stroke-dasharray="${pattern[1]}" stroke-dashoffset="${pattern[2]}"/>`}</g>`;
}

function fixtureSvg(f) {
 const {modules,boundary}=resolveKitLayout(rectangleCells(f.width,f.height),[...f.doors]);
 const family=currentFamily(),W=f.width*128,H=f.height*128,zoom=Number($('zoom').value),tier=Number($('tier').value);
 const images=modules.map(m=>`<g transform="translate(${m.x*128} ${m.y*128}) rotate(${m.rotation} 64 64)"><image data-piece="${m.piece}" data-family="${family}" width="128" height="128" href="${escape(sources[sourceName(kitId,m.piece,family)])}"${m.reflect?' transform="matrix(0 1 1 0 0 0)"':''}/></g>`).join('');
 const guides=$('guides').checked?`<g class="guides" fill="none" stroke="#7dd3fc" stroke-width=".4" stroke-dasharray="2 2">${rectangleCells(f.width,f.height).map(c=>`<path transform="translate(${c.x*128} ${c.y*128})" d="M0 0H128V128H0Z M32 0V128 M96 0V128 M0 32H128 M0 96H128"/>`).join('')}</g>`:'';
 const hits=boundary.map(e=>`<g transform="translate(${e.x*128} ${e.y*128}) rotate(${e.rotation} 64 64)"><rect class="edge-hit" data-edge="${e.key}" role="button" tabindex="0" aria-label="${e.door?'Remove':'Add'} ${e.side} door at cell ${e.x+1},${e.y+1}" aria-pressed="${e.door}" x="32" y="0" width="64" height="32"><title>${e.door?'Remove':'Add'} ${e.side} door</title></rect></g>`).join('');
 const lights=$('lighting').value==='inset'?insetRoomLights(boundary,tier,f.id):'';
 const leaves=roomDoorLeaves(boundary,{kit:currentDoorKit(),family,state:doorState,sources:leafSources});
 const surfaces=layered()?layerStudy.render(modules,{wallFamily:family,furnitureFamily:$('furnitureFamily').value,showFurniture:$('showFurniture').checked}):images;
 return `<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" width="${f.width*zoom}" height="${f.height*zoom}" aria-label="${f.width} by ${f.height} ${family} CT${tier}"><defs><pattern id="floor-${f.id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#303b43"/><path d="M16 0H0V16" fill="none" stroke="#414d56" stroke-width=".5"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#floor-${f.id})"/>${underlay(f,boundary,tier)}${surfaces}${leaves}${lights}${guides}${hits}</svg>`;
}
function render() {
 if(!Object.keys(sources).length)return;
 $('doorState').textContent=`Doors: ${doorState}`;
 $('doorState').setAttribute('aria-pressed',String(doorState==='closed'));
 const hasArt=Boolean(leafSources[doorLeafName(currentDoorKit(),currentFamily(),doorState)]);
 $('doorStatus').textContent=`Doors ${doorState}. ${hasArt?'Matching leaf artwork loaded.':doorState==='closed'?'Schematic placeholder — load matching door leaf artwork to replace it.':'Clear passage; retracted leaves are hidden behind the fixed frame.'}`;
 if(layered()&&hasArt)$('doorStatus').textContent+=' Shared-door comparison uses the existing Material Storage leaves.';
 document.querySelectorAll('[data-layer-control]').forEach(el=>el.hidden=!layered());
 // Existing combined controls retain their values and source pool for comparison.
 $('family').closest('label').hidden=layered();$('files').closest('label').hidden=layered();
 $('layerStatus').hidden=!layered();
 $('status').hidden=layered();$('report').closest('details').hidden=layered();
 if(layered())$('layerStatus').textContent=`Walls ${currentFamily()}: ${layerStudy.status('structure',currentFamily())}. Infirmary ${$('furnitureFamily').value}: ${$('showFurniture').checked?layerStudy.status('furniture',$('furnitureFamily').value):'hidden'}.`;
 $('previews').innerHTML=fixtures.map(f=>`<section class="fixture" data-layout="${f.id}"><h2>${f.width}×${f.height} · ${f.width*f.height} physical cell${f.width*f.height>1?'s':''}</h2><div class="viewport">${fixtureSvg(f)}</div><p>${f.doors.size} outer door${f.doors.size===1?'':'s'} · ${currentFamily()} · CT${$('tier').value}</p></section>`).join('');
}

async function inspect(src,piece,name) {
 const image=new Image();image.src=src;await image.decode();
 if(image.naturalWidth!==1024 || image.naturalHeight!==1024)throw Error(`${name}: expected 1024×1024 registered frame`);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
 const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
 const pixels=context.getImageData(0,0,1024,1024).data;
 const leaf=piece.startsWith('door-leaf-');
 const [left,top,width,height]=(leaf?[48,0,32,12]:geometry.rectangles[piece]).map(n=>n*8);
 let visible=false,door=false,channel=false;
 for(let y=0;y<1024;y++)for(let x=0;x<1024;x++)if(pixels[(y*1024+x)*4+3]){
  visible=true;
  if(x<left||y<top||x>=left+width||y>=top+height)throw Error(`${name}: pixels outside registered rectangle`);
  if(piece==='edge-door'&&x>=384&&x<640&&y<256)door=true;
  if(y>=32&&y<72)channel=true;
 }
 const empty=['center','edge-open','door-leaf-open'].includes(piece);
 if(empty&&visible)throw Error(`${name}: requires an empty transparent frame`);
 if(!empty&&!visible)throw Error(`${name}: required architecture is empty`);
 if(leaf)return [];
 return [door?`${name}: pixels intrude into clear doorway`:null,channel?`${name}: CT channel contains opaque/partial pixels; inspect underlay visibility`:null].filter(Boolean);
}

async function load(candidate,kit,urls=[]) {
 if(loading){urls.forEach(URL.revokeObjectURL);return}
 loading=true;$('status').textContent='Checking registered source frames…';
 try{
  const complete=Object.keys(roomKitVariants).filter(f=>roomKitPieces.every(p=>candidate[sourceName(kit,p,f)]));
  if(!complete.length)throw Error('Select all six named pieces for at least one complete family.');
  const warnings=[];
  for(const family of complete)for(const piece of roomKitPieces){const name=sourceName(kit,piece,family);warnings.push(...await inspect(candidate[name],piece,name))}
  ownedUrls.forEach(URL.revokeObjectURL);ownedUrls=urls;sources=candidate;kitId=kit;
  for(const option of $('family').options)option.disabled=!complete.includes(option.value);
  if(!complete.includes($('family').value))$('family').value=complete[0];
  $('report').textContent=`Registration: 1024×1024 full frames; no cropping or recentering.\nComplete families: ${complete.join(', ')}\n${warnings.length?warnings.join('\n'):'No registration, doorway or CT-channel warnings.'}\nPerimeter CT repeat closes at the northwest corner; its phase seam remains provisional.`;
  $('status').textContent=`${kit}: ${complete.length} complete families loaded. ${warnings.length} source warning${warnings.length===1?'':'s'} — see Source checks.`;
  resetFixtures();
 }catch(error){urls.forEach(URL.revokeObjectURL);$('status').textContent=`Could not load kit: ${error.message}`}
 finally{loading=false}
}

for(const id of ['family','tier','zoom','guides','lighting','composition','wallFamily','furnitureFamily','showFurniture'])$(id).addEventListener('change',render);
for(const [input,layer,select] of [['wallFiles','structure','wallFamily'],['furnitureFiles','furniture','furnitureFamily']])$(input).addEventListener('change',async()=>{
 try{
  $('layerStatus').textContent=`Checking ${layer} masks…`;
  const families=await layerStudy.import(layer,$(input).files);
  for(const option of $(select).options)option.disabled=!families.includes(option.value);
  if(!families.includes($(select).value))$(select).value=families[0];render();
 }catch(error){$('layerStatus').textContent=`Could not load ${layer}: ${error.message}`}
});
$('doorState').addEventListener('click',()=>{doorState=doorState==='open'?'closed':'open';render()});
$('doors').addEventListener('change',applyPreset);
$('orientation').addEventListener('click',()=>{vertical=!vertical;resetFixtures()});
$('rotate').addEventListener('click',()=>{
 for(const f of fixtures){
  const oldHeight=f.height;
  f.doors=new Set([...f.doors].map(key=>{
   const [x,y,side]=key.split(','),next=sides[(sides.indexOf(side)+1)%4];
   return edgeKey(oldHeight-1-Number(y),Number(x),next);
  }));
  [f.width,f.height]=[f.height,f.width];
 }
 render();
});
function toggleEdge(event){
 const target=event.target.closest('[data-edge]');if(!target)return;
 const f=fixtures.find(f=>f.id===target.closest('[data-layout]').dataset.layout),key=target.dataset.edge;
 f.doors.has(key)?f.doors.delete(key):f.doors.add(key);render();
 // Keep keyboard interaction on the same boundary control after rebuilding SVG.
 $('previews').querySelector(`[data-layout="${f.id}"] [data-edge="${key}"]`)?.focus({preventScroll:true});
}
$('previews').addEventListener('click',toggleEdge);
$('previews').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleEdge(e)}});
$('files').addEventListener('change',async()=>{
 const candidate={},urls=[],kits=new Set();
 for(const file of $('files').files){
  const match=/^([a-z0-9-]+)-(center|corner|shared|edge-normal|edge-door|edge-open)__(v0[123])__source\.png$/.exec(file.name);
  if(!match)continue;kits.add(match[1]);const url=URL.createObjectURL(file);urls.push(url);candidate[file.name]=url;
 }
 if(kits.size!==1){urls.forEach(URL.revokeObjectURL);$('status').textContent='Select source PNGs from exactly one kit.';return}
 await load(candidate,[...kits][0],urls);
});
const defaults=Object.fromEntries(Object.keys(roomKitVariants).flatMap(f=>roomKitPieces.map(p=>{const name=sourceName(kitId,p,f);return [name,batch+name]})));
$('leafFiles').addEventListener('change',async()=>{
 if(loadingLeaves)return;
 loadingLeaves=true;const candidate={},urls=[],selectedKit=currentDoorKit();
 $('doorStatus').textContent='Checking door leaf artwork…';
 try{
  for(const file of $('leafFiles').files){
   const match=/^([a-z0-9-]+)-door-leaf-(open|closed)__(v0[123])__source\.png$/.exec(file.name);
   if(!match||match[1]!==selectedKit)throw Error(`Expected ${selectedKit}-door-leaf-open/closed__vNN__source.png`);
   const url=URL.createObjectURL(file);urls.push(url);
   await inspect(url,`door-leaf-${match[2]}`,file.name);candidate[file.name]=url;
  }
  if(!urls.length)throw Error('Select at least one door leaf PNG.');
  if(selectedKit!==currentDoorKit())throw Error('Kit changed during import; select the leaf files again.');
  leafUrls.forEach(URL.revokeObjectURL);leafUrls=urls;leafSources=candidate;render();
 }catch(error){urls.forEach(URL.revokeObjectURL);$('doorStatus').textContent=`Could not load door leaves: ${error.message}`}
 finally{loadingLeaves=false}
});
let bundledLeafError;
try{
 const candidate={};
 for(const family of Object.keys(roomKitVariants)){
  const name=doorLeafName('material-storage',family,'closed'),src=leafBatch+name;
  await inspect(src,'door-leaf-closed',name);candidate[name]=src;
 }
 leafSources=candidate;
}catch(error){bundledLeafError=error}
await load(defaults,kitId);
if(bundledLeafError)$('doorStatus').textContent=`Bundled door artwork unavailable; using schematic placeholders. ${bundledLeafError.message}`;
