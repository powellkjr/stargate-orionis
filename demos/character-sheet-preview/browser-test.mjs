const frame=document.querySelector('iframe'),delay=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(ok,message)=>{if(!ok)throw Error(message);};
async function until(check){for(let i=0;i<150;i++){if(check())return;await delay(100);}throw Error('Preview failed to load');}
try{
 await until(()=>frame.contentDocument?.getElementById('status')?.textContent.startsWith('Ready:'));
 const d=frame.contentDocument,$=id=>d.getElementById(id),sleeveReviews={};
 const timeline=d.querySelector('.timeline'),viewer=$('animation');
 assert(viewer.parentElement===timeline.parentElement,'Timeline must be in the viewer column');
 assert(viewer.dataset.headCenter==='240,240','Head must be centered in the playback frame');
 assert(timeline.getBoundingClientRect().top-viewer.getBoundingClientRect().bottom<20,'Timeline is too far below viewer');
 assert(!$('limbSet').disabled&&$('limbSet').value==='plain','Plain limbs not available');
 const plainImage=$('animation').toDataURL();$('limbSet').value='original';$('limbSet').dispatchEvent(new Event('change'));assert($('animation').toDataURL()!==plainImage,'Plain limbs do not change normal walk');$('limbSet').value='plain';$('limbSet').dispatchEvent(new Event('change'));
 assert([...$('part').options].some(o=>o.textContent.includes('Plain limbs/Man/left-upper-arm'))&&[...$('part').options].some(o=>o.textContent.includes('Plain limbs/Man/right-upper-arm')),'Separate side parts missing');
 for(const char of ['Man','Girl']){
  $('character').value=char;$('character').dispatchEvent(new Event('change'));
  $('time').value=0;$('time').dispatchEvent(new Event('input'));
  const tile=(slot,variant)=>d.querySelector(`.limb-tile[data-slot="${slot}"][data-variant="${variant}"]`);
  assert(d.querySelectorAll('.limb-tile').length===30,`${char} limb tiles missing`);
  const shirt=$('animation').toDataURL();tile('center-torso','original').click();assert($('animation').toDataURL()!==shirt,`${char} backpack comparison unchanged`);
  assert(tile('left-forearm','plain').getAttribute('aria-pressed')==='true','Torso swap changed forearm');
  tile('center-torso','plain').click();assert($('animation').toDataURL()===shirt,`${char} clean torso failed to restore`);
  tile('left-leg','compact').click();assert(tile('right-leg','plain').getAttribute('aria-pressed')==='true','Compact left leg changed right leg');
  tile('right-leg','compact').click();
  const camera=[$('animation').dataset.viewScale,$('animation').dataset.viewCenter];
  for(const time of [0,200,400,600]){$('time').value=time;$('time').dispatchEvent(new Event('input'));assert($('animation').dataset.viewScale===camera[0]&&$('animation').dataset.viewCenter===camera[1],'Camera must not rescale or track the moving head');sleeveReviews[`${char}-compact-legs-${time}`]=$('animation').toDataURL();}
  $('time').value=0;$('time').dispatchEvent(new Event('input'));
  const designs=new Set();
  for(const style of ['technician','scientist','medic','scout','soldier','diplomat']){
   tile('center-torso',style).click();const rendered=$('animation').toDataURL();designs.add(rendered);sleeveReviews[`${char}-${style}-top`]=rendered;
   assert(tile('left-forearm','plain').getAttribute('aria-pressed')==='true','Clothing choice changed forearm');
  }
  assert(designs.size===6,`${char} profession tops must have different visible designs`);tile('center-torso','plain').click();
  const before=$('animation').toDataURL();tile('left-upper-arm','short').click();assert($('animation').toDataURL()!==before,`${char} short sleeve not rendered`);
  assert(tile('left-forearm','plain').getAttribute('aria-pressed')==='true','Upper arm swap changed forearm');
  tile('left-forearm','short').click();assert(tile('left-upper-arm','short').getAttribute('aria-pressed')==='true','Forearm swap changed upper arm');
  tile('right-forearm','long').click();assert(tile('left-forearm','short').getAttribute('aria-pressed')==='true','Right forearm changed left');
  const short=$('animation').toDataURL();tile('right-upper-arm','long').click();assert($('animation').toDataURL()!==short,`${char} long sleeve not rendered`);
  assert(tile('left-upper-arm','short').getAttribute('aria-pressed')==='true'&&tile('right-upper-arm','long').getAttribute('aria-pressed')==='true','Side selections not independent');
  tile('left-upper-arm','original').click();assert(tile('right-upper-arm','long').getAttribute('aria-pressed')==='true','Left swap changed right arm');
  for(const slot of ['left-leg','right-leg']){tile(slot,'original').click();assert(tile(slot,'original').getAttribute('aria-pressed')==='true','Leg tile not selected');}
  for(const variant of ['short','long']){tile('left-upper-arm',variant).click();tile('right-upper-arm',variant).click();tile('left-forearm',variant).click();tile('right-forearm',variant).click();sleeveReviews[`${char}-${variant}-sleeves`]= $('animation').toDataURL();}
  $('action').value='Walk_riffle';$('action').dispatchEvent(new Event('change'));assert([...d.querySelectorAll('.limb-tile')].every(b=>b.disabled),'Tiles should not replace authored weapon actions');
  $('action').value='Walk_normal';$('action').dispatchEvent(new Event('change'));$('limbSet').value='plain';$('limbSet').dispatchEvent(new Event('change'));
 }
 $('character').value='Man';$('character').dispatchEvent(new Event('change'));
 assert(!$('headVariant').disabled&&$('headVariant').value==='original','Original head not selected');
 assert($('headVariant').options.length===8,'Prepared Man heads missing');
 $('headVariant').dispatchEvent(new Event('change'));assert($('animation').dataset.head==='original','Head selector does not update playback');
 const headBase=$('animation').toDataURL();
 for(const entry of [...$('headVariant').options].filter(o=>o.value!=='original')){
  $('headVariant').value=entry.value;$('headVariant').dispatchEvent(new Event('change'));
  assert($('animation').dataset.head===entry.value&&$('animation').toDataURL()!==headBase,`Head not rendered: ${entry.value}`);
 }
 $('headVariant').value='man-technician-goggles-v03';$('headVariant').dispatchEvent(new Event('change'));
 $('headColorsEnabled').checked=true;$('headColorsEnabled').dispatchEvent(new Event('input'));
 for(const material of ['skin','hair','accessories']){
  const before=$('animation').toDataURL(),control=$(material==='accessories'?'headColor-accessories':`color-${material}`),value=control.value;
  control.value='#ff00ee';control.dispatchEvent(new Event('input'));assert($('animation').toDataURL()!==before,`Head ${material} mask has no effect`);
  control.value=value;control.dispatchEvent(new Event('input'));
 }
 $('headColorsEnabled').checked=false;$('headColorsEnabled').dispatchEvent(new Event('input'));
 $('headVariant').value='original';$('headVariant').dispatchEvent(new Event('change'));
 assert($('skin').value==='technician'&&$('skin').options.length===2,'Technician skin failed to load');
 assert(!$('materialControls').hidden&&$('color-shirt')&&$('color-hair'),'Material controls missing');
 const baseColor=$('animation').toDataURL(),shirt=$('color-shirt').value;
 $('color-shirt').value='#ff0088';$('color-shirt').dispatchEvent(new Event('input'));
 assert($('animation').toDataURL()!==baseColor,'Material color did not affect rendering');
 $('color-shirt').value=shirt;$('color-shirt').dispatchEvent(new Event('input'));
 $('maskReview').checked=true;$('maskReview').dispatchEvent(new Event('input'));
 assert($('animation').toDataURL()!==baseColor,'Mask review did not affect rendering');
 $('maskReview').checked=false;$('maskReview').dispatchEvent(new Event('input'));
 const technician=$('animation').toDataURL();$('skin').value='original';$('skin').dispatchEvent(new Event('change'));
 assert($('animation').toDataURL()!==technician,'Skin does not change rendered artwork');
 assert($('action').options.length===12&&$('part').options.length>=196&&[...$('part').options].some(o=>o.textContent.includes('bat_0009_man'))&&$('character').options.length===2,'Missing rig/part options');
 assert($('action').value==='Walk_normal'&&$('crop').disabled,'Normal walk not default or comparison incorrectly available');
 $('play').click();const before=$('animation').dataset.frame;$('step').click();assert($('animation').dataset.frame!==before,'Step did not advance');
 $('action').value='Knife';$('action').dispatchEvent(new Event('change'));assert($('animation').dataset.frame==='Man/Knife/0','Action switch failed');
 $('bones').click();assert(Number($('animation').dataset.bones)>0&&Number($('animation').dataset.objects)>5,'Missing authored bones/parts');
 $('time').value=400;$('time').dispatchEvent(new Event('input'));assert($('frameStatus').textContent.includes(`400 / ${$('time').max}`),'Scrub failed');
 $('crop').click();assert($('animation').dataset.frame.endsWith('.png'),'Exported frame comparison failed');$('crop').click();
 $('part').selectedIndex=0;$('add').click();$('part').selectedIndex=1;$('add').click();assert($('assembly').dataset.layers==='2','Parts not added');
 $('rotation').value=45;$('rotation').dispatchEvent(new Event('input'));$('forward').click();assert($('rotation').value==='45','Rotation/stack selection lost');
 $('remove').click();assert($('assembly').dataset.layers==='1','Remove failed');$('reset').click();assert($('assembly').dataset.layers==='0','Clear failed');
 $('character').value='Girl';$('character').dispatchEvent(new Event('change'));assert($('status').textContent.includes('Girl')&&$('animation').dataset.frame==='Girl/Walk_normal/0','Character change failed');
 assert($('headVariant').options.length===8&&$('headVariant').value==='original','Girl heads missing or head selection not reset');
 const girlHeadBase=$('animation').toDataURL();
 for(const entry of [...$('headVariant').options].filter(o=>o.value!=='original')){
  $('headVariant').value=entry.value;$('headVariant').dispatchEvent(new Event('change'));
  assert($('animation').toDataURL()!==girlHeadBase,`Girl head not rendered: ${entry.value}`);
 }
 $('headVariant').value='original';$('headVariant').dispatchEvent(new Event('change'));
 $('action').value='Walk_gun';$('action').dispatchEvent(new Event('change'));
 $('time').value=$('time').max;$('time').dispatchEvent(new Event('input'));$('play').click();await delay(100);assert($('animation').dataset.frame!=='Girl/Walk_gun/800','One-shot replay failed');$('play').click();
 for(const name of [...$('action').options].map(o=>o.value).filter(name=>name!=='Death')){$('action').value=name;$('action').dispatchEvent(new Event('change'));assert(Number($('animation').dataset.objects)>0,`Empty rig ${name}`);}
 frame.style.width='390px';await delay(100);assert(d.documentElement.scrollWidth<=d.documentElement.clientWidth+2,'Mobile overflow');
 $('character').value='Man';$('character').dispatchEvent(new Event('change'));$('bones').checked=false;$('bones').dispatchEvent(new Event('input'));
 const review={};for(const t of [...Array.from({length:16},(_,i)=>i*50),197,198,199,499,500,501,593,594,595]){$('time').value=t;$('time').dispatchEvent(new Event('input'));review[`normal-${t}`]=$('animation').toDataURL();}
 $('bones').checked=true;$('bones').dispatchEvent(new Event('input'));review['normal-bones-595']=$('animation').toDataURL();$('bones').checked=false;$('bones').dispatchEvent(new Event('input'));
 $('action').value='Walk_gun';$('action').dispatchEvent(new Event('change'));
 const rig=$('animation').toDataURL();$('crop').checked=true;$('crop').dispatchEvent(new Event('input'));const png=$('animation').toDataURL();
 $('skin').value='technician';$('skin').dispatchEvent(new Event('change'));
 assert($('crop').disabled&&!$('crop').checked&&$('animation').dataset.skin==='technician','Technician shows original baked frames');
 const technicianRig=$('animation').toDataURL();assert(technicianRig!==rig,'Authored rig skin unchanged');
 const heads={};for(const entry of [...$('headVariant').options].filter(o=>o.value!=='original')){$('headVariant').value=entry.value;$('headVariant').dispatchEvent(new Event('change'));heads[entry.value]=$('animation').toDataURL();}
 $('headVariant').value='original';$('headVariant').dispatchEvent(new Event('change'));
 $('part').value=[...$('part').options].find(o=>o.value.endsWith('man_gun1_0006_Layer-10.png')).value;$('add').click();const workbench=$('assembly').toDataURL();$('skin').value='original';$('skin').dispatchEvent(new Event('change'));
 assert($('assembly').toDataURL()!==workbench,'Workbench skin unchanged');$('reset').click();
 for(const char of ['Man','Girl']){
  $('skin').value='technician';$('skin').dispatchEvent(new Event('change'));$('character').value=char;$('character').dispatchEvent(new Event('change'));
  for(const name of [...$('action').options].map(o=>o.value).filter(name=>name!=='Death')){$('action').value=name;$('action').dispatchEvent(new Event('change'));assert(Number($('animation').dataset.objects)>0,`Empty technician rig ${char}/${name}`);}
 }
 await fetch('/__character-result',{method:'POST',body:JSON.stringify({ok:true,review:{...review,...sleeveReviews,rig,png,technicianRig,...heads},checks:'compact legs across four walk phases, six forward-facing profession tops per character, independent torso/upper/lower limb tiles and clean Man/Girl forearm swaps, 14 skull-scaled heads/default reset, skin/hair/accessory colors, material mask review, both skins/non-death actions/workbench/PNG comparison/mobile'})});
}catch(error){await fetch('/__character-result',{method:'POST',body:JSON.stringify({ok:false,error:error.message})});}
