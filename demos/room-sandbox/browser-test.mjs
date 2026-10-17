const frame=document.querySelector('iframe'),delay=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(ok,message)=>{if(!ok)throw Error(message)};
async function until(check,message){for(let i=0;i<180;i++){if(check())return;await delay(100)}throw Error(message)}
try{
 await until(()=>frame.contentDocument?.querySelectorAll('.room-cell').length,'Rooms failed to load');
 const w=frame.contentWindow,d=frame.contentDocument,$=id=>d.getElementById(id),errors=[];
 w.addEventListener('error',e=>{if(e.message)errors.push(e.message)});w.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 assert($('grid').classList.contains('sprites-mode'),'Sprites not default');
 assert(d.querySelector('.room-map-surface image[data-sprite="wall"]'),'Missing shared wall sprites');
 const count=d.querySelectorAll('.room-number').length,summary=$('baseSummary').textContent,log=$('actionLog').textContent;
 $('toggleSprites').click();assert(!d.querySelector('.room-map-surface image'),'Schematic toggle did not remove room art');
 assert(d.querySelectorAll('.room-number').length===count&&$('baseSummary').textContent===summary&&$('actionLog').textContent===log,'Toggle changed physical state');
 $('toggleSprites').click();assert(d.querySelector('.room-map-surface image'),'Toggle did not restore sprites');
 $('generateLayout').click();
 try{await until(()=>$('status').textContent.includes('Generated'),'Layout generation failed')}
 catch(error){throw Error(`${error.message}: ${$('status').textContent}; ${errors.join('; ')}`)}
  assert(d.querySelector('.room-map-surface [data-sprite="generator"], .room-map-surface [data-sprite="floor-room-generator"]'),'Generated Generator presentation missing');
 assert([...d.querySelectorAll('.room-cell')].some(cell=>cell.textContent.includes('Generator')||cell.title.includes('Generator')),'Generator room missing from generated layout');
 const cultural=[...d.querySelectorAll('.room-cell')].filter(cell=>cell.textContent.includes('Cultural Platform'));
 assert(cultural.length===1&&cultural[0].classList.contains('continuous-room'),'Cultural Platform must use one continuous physical room');
 const bounds=cultural[0].getBoundingClientRect();
 for(const other of d.querySelectorAll('.room-cell')){
  if(other===cultural[0])continue;
  const b=other.getBoundingClientRect();
  assert(!(bounds.left<b.right&&bounds.right>b.left&&bounds.top<b.bottom&&bounds.bottom>b.top),'Generated physical rooms overlap Cultural Platform');
 }
 const surface=cultural[0].querySelector('.room-map-surface');
 assert(surface.querySelectorAll('[data-sprite="floor-indoor"]').length===4,'2x2 room must retain four floor cells');
 const culturalDoor=cultural[0].querySelector('.continuous-door');
 assert(culturalDoor,'Continuous single-door room is missing its door');
 cultural[0].click();$('rotateDoor').click();
 assert([...d.querySelectorAll('.room-cell')].find(cell=>cell.textContent.includes('Cultural Platform')).querySelector('.continuous-door').className!==culturalDoor.className,'Continuous single door did not rotate');
 const {roomInteriorKey}=await import('./sprite-presentation.mjs');
 const {spriteManifest}=await import('../offworld-sandbox/sprite-manifest.mjs');
 for(const roomId of Object.keys(spriteManifest.roomTypes)){
  const key=roomInteriorKey(roomId);if(!key)continue;
  const images=[...d.querySelectorAll(`.room-map-surface [data-sprite="${key}"]`)];
  assert(images.length,`Installed interior not rendered: ${key}`);
  for(const image of images){
   assert(image.getAttribute('href').includes('/production/'),`Interior uses placeholder: ${key}`);
   for(const prop of spriteManifest.roomTypes[roomId].props)assert(!image.parentElement.querySelector(`[data-sprite="${prop}"]`),`Duplicate prop ${prop}`);
  }
 }
 if(roomInteriorKey('gate_room'))assert(d.querySelectorAll('[data-sprite="floor-room-gate-room"]').length===1,'Continuous Gate repeats interior');
 else assert(d.querySelector('[data-sprite="gate"]'),'Generated Gate sprite missing');
 assert(!d.querySelector('[data-sprite="gate-open"]'),'Unspecified Gate state rendered active');
 assert(d.querySelector('.sprite-staff [data-sprite="worker"]'),'Staff count sprite missing');assert(d.querySelector('.sprite-door [data-sprite="door"]'),'Door sprite missing');
 const sources=new Set([...d.querySelectorAll('#grid image')].map(i=>new URL(i.getAttribute('href'),d.baseURI).href));
 await Promise.all([...sources].map(async src=>{const image=new w.Image();image.src=src;await image.decode();assert(image.naturalWidth>0,`Image failed to decode: ${src}`)}));
 const stable=()=>[...d.querySelectorAll('.room-map-surface image')].map(i=>i.getAttribute('href')).join('|');const before=stable();
 $('toggleSprites').click();$('toggleSprites').click();assert(stable()===before,'Redraw changed installed variant choices');
 $('toggleBase').click();assert(!d.querySelector('.room-cell'),'Hide Rooms failed');assert(d.querySelector('.base-tile image'),'Geology sprites missing');
 $('toggleBase').click();assert(d.querySelector('.room-cell'),'Show Rooms failed');
 const first=d.querySelector('.room-cell');first.click();assert(!$('rotateDoor').disabled,'Room selection lost rotate control');$('rotateDoor').click();assert($('status').textContent.includes('rotated'),'Door rotation failed');
 // Missing images recover once through the exact shared fallback listener.
 const missing=d.querySelector('.room-map-surface image');missing.dispatchEvent(new w.Event('error'));
 assert(missing.dataset.fallbackApplied==='true','Shared missing-art fallback failed');
 assert(missing.getAttribute('href').includes('unknown'),'Fallback does not use public generic art');
 frame.style.width='390px';await delay(400);assert(d.documentElement.scrollWidth<=390,'390px layout overflows');assert($('grid').querySelector('image'),'Responsive grid lost art');
 assert(errors.length===0,errors.join('\n'));
 frame.style.width='1440px';await delay(400);
 await fetch('/__room-result',{method:'POST',body:JSON.stringify({ok:true,checks:'installed room interiors without duplicate props; continuous Gate overlay; shared floors/walls/doors/staff/geology; schematic parity; generated layout; stable variants; selection/rotate; missing-art fallback; 390px layout; no save writes'})});
}catch(error){await fetch('/__room-result',{method:'POST',body:JSON.stringify({ok:false,error:error.stack??String(error)})})}
