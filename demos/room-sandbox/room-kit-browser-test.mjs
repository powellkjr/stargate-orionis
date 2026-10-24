const frame=document.querySelector('iframe'),delay=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(ok,message)=>{if(!ok)throw Error(message)};
async function until(check,message){for(let i=0;i<180;i++){if(check())return;await delay(100)}throw Error(message)}
try{
 await until(()=>frame.contentDocument?.querySelectorAll('.fixture').length===3,'Kit failed to load');
 const d=frame.contentDocument,w=frame.contentWindow,$=id=>d.getElementById(id),errors=[];
 w.addEventListener('error',e=>errors.push(e.message));w.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 const change=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('change'))};
 assert($('status').textContent.includes('3 complete families loaded. 0 source warnings'),'Unexpected source report: '+$('status').textContent);
 for(const family of ['v01','v02','v03'])for(const tier of ['1','2','3']){
  change('family',family);change('tier',tier);
  const images=[...d.querySelectorAll('svg image')];
  assert(images.length>0&&images.every(i=>i.dataset.family===family&&i.getAttribute('href').includes(`__${family}__source.png`)),'Family mixing');
  assert(d.querySelectorAll('.fixture').length===3,'Layouts missing');
  for(const fixture of d.querySelectorAll('.fixture')){
   const exterior=fixture.querySelectorAll('[data-edge]').length;
   const doors=fixture.querySelectorAll('[data-piece="edge-door"]').length;
   const lamps=fixture.querySelectorAll('[data-light-edge]');
   assert(fixture.querySelector('[data-channel-infill="metal"]'),'Unused light channels lack solid backing');
   assert(lamps.length===exterior-doors,'Inset lights missing or occupying a door/open join');
   for(const lamp of lamps){
    const runs=[...lamp.querySelectorAll('[data-light-run]')].map(r=>Number(r.dataset.lightRun));
    assert(runs.join(',')===({1:'8',2:'6,6',3:'16'})[tier],'Incorrect CT lamp proportions');
    for(const run of lamp.querySelectorAll('[data-light-run]')){
     const housing=run.querySelector('[data-light-housing]');
     assert(housing&&Math.abs(Number(housing.getAttribute('width'))-Number(run.dataset.lightRun)-2.4)<.001,'Oversized recess around inset lamp');
    }
    assert(fixture.querySelector(`[data-edge="${lamp.dataset.lightEdge}"]`)?.getAttribute('aria-pressed')==='false','Light covers a doorway');
   }
  }
 }
 const doorCount=d.querySelectorAll('[data-piece="edge-door"]').length;
 $('doorState').click();
 for(const family of ['v01','v02','v03']){
  change('family',family);
  const leaves=[...d.querySelectorAll('[data-door-leaf-art="closed"]')];
  assert(leaves.length===doorCount,'Bundled door leaves missing');
  assert(leaves.every(leaf=>leaf.dataset.family===family&&leaf.getAttribute('href').includes(`__${family}__source.png`)),'Bundled door family mismatch');
  assert(!d.querySelector('[data-door-placeholder]'),'Bundled art fell back to placeholder');
 }
 $('doorState').click();
 change('lighting','continuous');assert(!d.querySelector('[data-lighting="inset"]'),'Original lighting toggle failed');
 assert(d.querySelectorAll('[data-piece="edge-door"]').length===doorCount,'Lighting changed topology');
 change('lighting','inset');assert(d.querySelector('[data-lighting="inset"]'),'Inset lighting toggle failed');
 const urls=new Set();for(const f of ['v01','v02','v03']){change('family',f);d.querySelectorAll('image').forEach(i=>urls.add(i.getAttribute('href')))}
 await Promise.all([...urls].map(async src=>{const image=new w.Image();image.src=new URL(src,d.baseURI);await image.decode();assert(image.naturalWidth===1024,'Frame changed')}));
 for(const preset of ['none','south','adjacent','opposite','all']){
  change('doors',preset);
  const expected={none:[0,0,0],south:[1,1,1],adjacent:[2,2,2],opposite:[2,2,2],all:[4,6,8]}[preset];
  [...d.querySelectorAll('.fixture')].forEach((f,i)=>assert(f.querySelectorAll('[data-piece="edge-door"]').length===expected[i],`Wrong door count ${preset} ${i}`));
 }
 const before=d.querySelectorAll('[data-piece="edge-door"]').length;
 $('rotate').click();assert(d.querySelectorAll('[data-piece="edge-door"]').length===before,'Rotation lost doors');
 const edge=d.querySelector('[data-edge]');edge.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
 assert(d.querySelectorAll('[data-piece="edge-door"]').length===before-1,'Keyboard door toggle failed');
 $('orientation').click();assert(d.querySelectorAll('.fixture')[1].querySelector('h2').textContent.startsWith('1×2'),'Vertical pair failed');
 $('guides').checked=true;$('guides').dispatchEvent(new w.Event('change'));assert(d.querySelectorAll('.guides').length===3,'Guides missing');
 // Exercise the actual file picker with one complete family, then reject an
 // incomplete family without losing the already usable preview.
 const files=new w.DataTransfer();
 for(const src of [...urls].filter(src=>src.includes('__v02__'))){
  const blob=await (await fetch(new URL(src,d.baseURI))).blob();
  files.items.add(new w.File([blob],src.split('/').at(-1),{type:'image/png'}));
 }
 $('files').files=files.files;$('files').dispatchEvent(new w.Event('change'));
 await until(()=>$('status').textContent.includes('1 complete families loaded'),'Custom family import failed');
 assert($('family').options[0].disabled&&!$('family').options[1].disabled,'Incomplete families remain selectable');
 assert([...d.querySelectorAll('svg image')].every(i=>i.getAttribute('href').startsWith('blob:')),'File picker sources not used');
 const incomplete=new w.DataTransfer();incomplete.items.add(files.files[0]);
 $('files').files=incomplete.files;$('files').dispatchEvent(new w.Event('change'));
 await until(()=>$('status').textContent.includes('Could not load kit'),'Incomplete import not rejected');
 assert(d.querySelectorAll('.fixture').length===3,'Failed import discarded previous preview');
 // Door state changes presentation only, retaining exact exterior door edges.
 change('doors','all');
 const doorEdges=()=>d.querySelectorAll('[data-piece="edge-door"]').length;
 const topology=doorEdges();
 assert(!d.querySelector('[data-door-placeholder]'),'Open doors obstruct the passage');
 $('doorState').click();
 assert($('doorState').getAttribute('aria-pressed')==='true','Closed toggle state missing');
 assert(d.querySelectorAll('[data-door-leaf-art="closed"]').length===topology,'Bundled closed leaves missing');
 assert($('doorStatus').textContent.includes('Matching leaf artwork loaded'),'Bundled leaf art not recognized');
 $('rotate').click();
 for(const leaf of d.querySelectorAll('[data-door-edge]')){
  const edge=leaf.closest('.fixture').querySelector(`[data-edge="${leaf.dataset.doorEdge}"]`);
  assert(edge?.getAttribute('aria-pressed')==='true','Leaf detached from exact exterior doorway');
  assert(leaf.getAttribute('transform')===edge.parentElement.getAttribute('transform'),'Leaf did not rotate with frame');
 }
 // Exercise the artwork picker with a synthetic registered closed-leaf PNG.
 const canvas=d.createElement('canvas');canvas.width=canvas.height=1024;
 const context=canvas.getContext('2d');context.fillStyle='#718090';context.fillRect(384,0,256,96);
 const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
 const leafFiles=new w.DataTransfer();leafFiles.items.add(new w.File([blob],'material-storage-door-leaf-closed__v02__source.png',{type:'image/png'}));
 $('leafFiles').files=leafFiles.files;$('leafFiles').dispatchEvent(new w.Event('change'));
 await until(()=>$('doorStatus').textContent.includes('Matching leaf artwork loaded'),'Door art import failed');
 assert(d.querySelectorAll('[data-door-leaf-art="closed"]').length===topology,'Imported leaves not rendered');
 assert(!d.querySelector('[data-door-placeholder]'),'Placeholder remains under real art');
 $('doorState').click();assert(!d.querySelector('[data-door-leaf-art], [data-door-placeholder]'),'Open state did not retract leaves');
 assert(doorEdges()===topology,'Door state changed layout');
 $('doorState').click();context.fillRect(0,0,1,1);
 const invalidBlob=await new Promise(r=>canvas.toBlob(r,'image/png'));
 const invalidFiles=new w.DataTransfer();invalidFiles.items.add(new w.File([invalidBlob],'material-storage-door-leaf-closed__v02__source.png',{type:'image/png'}));
 $('leafFiles').files=invalidFiles.files;$('leafFiles').dispatchEvent(new w.Event('change'));
 await until(()=>$('doorStatus').textContent.includes('Could not load door leaves'),'Out-of-bounds leaf art accepted');
 assert(d.querySelectorAll('[data-door-leaf-art="closed"]').length===topology,'Rejected leaf import discarded working art');
 // Separate architecture and furniture must compose independently without
 // importing any legacy room furnishing or occupying an internal join.
 change('composition','layers');change('doors','south');
 assert(d.querySelectorAll('[data-room-layer="structure"]').length===3,'Shared structure missing');
 assert(d.querySelectorAll('[data-room-layer="furniture"]').length===3,'Separate furniture missing');
 assert($('layerStatus').textContent.includes('SCHEMATIC PLACEHOLDERS'),'Unprovided art not labeled');
 assert(!d.querySelector('[data-piece]'),'Combined room tiles leaked into layered mode');
 $('showFurniture').checked=false;$('showFurniture').dispatchEvent(new w.Event('change'));
 assert(!d.querySelector('[data-room-layer="furniture"]'),'Furniture hiding removed separation');
 assert(d.querySelector('[data-room-layer="structure"]'),'Furniture hiding removed walls');
 $('showFurniture').checked=true;$('showFurniture').dispatchEvent(new w.Event('change'));
 const {layerPieces,layerName,layerPixelAllowed}=await import('../shared/sprites/room-layer-contract.mjs');
 for(const [layer,input,family] of [['structure','wallFiles','v01'],['furniture','furnitureFiles','v02']]){
  const selected=new w.DataTransfer();
  for(const piece of layerPieces){
   context.clearRect(0,0,1024,1024);context.fillStyle=layer==='structure'?'#8e9eaa':'#afc5bf';
   // Draw exact masks at the logical-cell scale, preserving the source frame.
   for(let y=0;y<128;y++)for(let x=0;x<128;x++)if(layerPixelAllowed(layer,piece,x+.5,y+.5))context.fillRect(x*8,y*8,8,8);
   const art=await new Promise(r=>canvas.toBlob(r,'image/png'));
   selected.items.add(new w.File([art],layerName(layer,piece,family),{type:'image/png'}));
  }
  $(input).files=selected.files;$(input).dispatchEvent(new w.Event('change'));
  await until(()=>$('layerStatus').textContent.includes(layer==='structure'?'Walls v01: imported artwork':'Infirmary v02: imported artwork'),`${layer} picker failed`);
 }
 assert(!d.querySelector('[data-layer-placeholder]'),'Complete layered import still shows placeholders');
 const wallSources=()=>[...d.querySelectorAll('[data-room-layer="structure"] image')].map(e=>e.getAttribute('href')).join('|');
 const stableWalls=wallSources();
 $('showFurniture').checked=false;$('showFurniture').dispatchEvent(new w.Event('change'));
 assert(wallSources()===stableWalls,'Furniture visibility changed structural artwork');
 // Reject a wall painted into the furniture layer and retain the working art.
 context.clearRect(0,0,1024,1024);context.fillRect(0,0,8,8);
 const badFurnitureBlob=await new Promise(r=>canvas.toBlob(r,'image/png'));
 const badFurniture=new w.DataTransfer();badFurniture.items.add(new w.File([badFurnitureBlob],layerName('furniture','corner','v02'),{type:'image/png'}));
 $('furnitureFiles').files=badFurniture.files;$('furnitureFiles').dispatchEvent(new w.Event('change'));
 await until(()=>$('layerStatus').textContent.includes('Could not load furniture'),'Furniture wall pixels accepted');
 assert(wallSources()===stableWalls,'Rejected furniture changed shared walls');
 change('composition','combined');assert(d.querySelector('[data-piece="corner"]'),'Combined presentation not preserved');
 // Restore bundled sources for the review screenshot.
 frame.src=frame.src;await until(()=>frame.contentDocument?.querySelector('#status')?.textContent.includes('3 complete families loaded'),'Reload failed');
 const restored=frame.contentDocument;
 restored.getElementById('family').value='v02';restored.getElementById('family').dispatchEvent(new frame.contentWindow.Event('change'));
 restored.getElementById('tier').value='3';restored.getElementById('tier').dispatchEvent(new frame.contentWindow.Event('change'));
 restored.getElementById('doorState').click();
 restored.getElementById('composition').value='layers';restored.getElementById('composition').dispatchEvent(new frame.contentWindow.Event('change'));
 frame.style.width='390px';await delay(100);
 assert(restored.documentElement.scrollWidth<=390,'Page overflows mobile viewport');
 frame.style.width='1440px';await delay(100);
 assert(!errors.length,errors.join('; '));
 await fetch('/__room-result',{method:'POST',body:JSON.stringify({ok:true,checks:'combined art preserved; shared walls + Infirmary layer imports/masks/visibility; invalid furniture rejection; family independence; door states/rotation; CT tiers; mobile layout; no writes'})});
}catch(error){await fetch('/__room-result',{method:'POST',body:JSON.stringify({ok:false,error:error.stack})})}
