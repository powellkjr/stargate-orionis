import {assets} from './model.mjs';
import {zipFixture} from './zip-fixtures.mjs';
import {readSpriteZip} from './zip.mjs';
import {buildRegionMap,technicianRegions} from './character-colors.mjs';
const frame=document.querySelector('iframe'),delay=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(value,message)=>{if(!value)throw Error(message);};
try{
 for(let n=0;n<150;n++){if(frame.contentDocument?.querySelectorAll('.asset').length===assets.length)break;await delay(100);}
 const w=frame.contentWindow,d=frame.contentDocument,$=id=>d.getElementById(id),errors=[];
 w.addEventListener('error',event=>errors.push(event.message));w.addEventListener('unhandledrejection',event=>errors.push(String(event.reason)));
 assert(d.querySelectorAll('.asset').length===assets.length,'Manifest gallery incomplete');
 for(let n=0;n<100&&$('characterStudy').dataset.ready!=='true';n++)await delay(100);
 assert($('characterStudy').dataset.ready==='true','Technician study did not load');
 const technician=new w.Image();technician.src='/artwork/character-studies/technician-v01/source.png';await technician.decode();
 const maskSource=d.createElement('canvas');maskSource.width=maskSource.height=1024;
 const maskContext=maskSource.getContext('2d');maskContext.drawImage(technician,0,0);
 const regionMap=buildRegionMap(maskContext.getImageData(0,0,1024,1024).data,1024,1024);
 for(const [x,y,key] of [[330,457,'uniformColor'],[679,458,'uniformColor'],[470,503,'uniformColor'],[439,649,'trouserColor'],[573,647,'trouserColor'],[410,358,'harnessColor'],[577,354,'harnessColor'],[437,690,'gearColor'],[325,548,'gearColor'],[530,493,null]]){
  const actual=regionMap[y*1024+x];assert((technicianRegions[actual-1]?.key??null)===key,`Incorrect material mask at ${x},${y}`);
 }
 const studyPixels=()=>$('characterPreview').getContext('2d').getImageData(0,0,128,128).data;
 const baseline=new Uint8ClampedArray(studyPixels());
 $('character-uniformColor').value='#b03050';$('character-uniformColor').dispatchEvent(new w.Event('input'));
 assert(studyPixels().some((v,i)=>v!==baseline[i]),'Clothing color control did not recolor');
 const recoloredReview=$('characterPreview').toDataURL();
 assert(studyPixels().every((v,i)=>i%4!==3||v===baseline[i]),'Recolor changed silhouette alpha');
 $('characterMasks').click();assert($('characterStatus').textContent.includes('Mask coverage'),'Mask coverage toggle failed');
 const maskReview=$('characterPreview').toDataURL();
 $('characterReset').click();assert(studyPixels().every((v,i)=>v===baseline[i]),'Reset did not restore initial colors');
 assert(Math.round($('characterMap').getBoundingClientRect().width)===22,'Incorrect map preview size');
 await Promise.all([...d.querySelectorAll('.preview img')].map(img=>img.decode()));
 const currentGuard=d.querySelector('[data-key="guard"] img').src;
 const canvas=d.createElement('canvas');canvas.width=canvas.height=1024;canvas.getContext('2d').fillRect(0,0,1024,1024);
 const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
 // Real browser raw-deflate support, plus ZIP upload through the page control.
 const archiveEntries=await readSpriteZip(await (await fetch('/__deflate.zip')).arrayBuffer());assert(archiveEntries.length===1,'Browser deflate decoding failed');
 const archive=new w.DataTransfer();archive.items.add(new w.File([zipFixture([['loose/floor-lab__v03__source.png',new Uint8Array(await blob.arrayBuffer())]])],'any-name.zip',{type:'application/zip'}));
 $('zips').files=archive.files;$('zips').dispatchEvent(new w.Event('change'));
 for(let n=0;n<100;n++){if($('status').textContent.includes('1 imported candidates'))break;await delay(100);}
 for(let n=0;n<100;n++){if($('status').textContent.includes('Saved 1 PNGs'))break;await delay(100);}
 assert(d.querySelectorAll('[data-key="floor-lab"] .variant').length===2,'ZIP upload did not add preview');assert($('status').textContent.includes('Saved 1 PNGs'),'ZIP was not saved');
 $('clear').click();
 const transfer=new w.DataTransfer();
 for(const path of ['orionis-floor-indoor-b001/floor-indoor__v01__source.png','orionis-floor-indoor-b002/floor-indoor__v01__source.png','orionis-guard-b001/guard__v02__source.png']){
  const file=new w.File([blob],path.split('/').at(-1),{type:'image/png'});Object.defineProperty(file,'webkitRelativePath',{value:path});transfer.items.add(file);
 }
 transfer.items.add(new w.File(['bad'],'crate__v01__source.png',{type:'image/png'}));transfer.items.add(new w.File(['ignored'],'unrelated.png'));
 $('folder').files=transfer.files;$('folder').dispatchEvent(new w.Event('change'));
 for(let n=0;n<100;n++){if($('status').textContent.includes('3 imported candidates'))break;await delay(100);}
 assert($('status').textContent.includes('ignored 1')&&$('status').textContent.includes('1 unreadable'),'Import errors not summarized');
 assert(d.querySelectorAll('[data-key="floor-indoor"] .variant').length===3,'Batches with same variant were collapsed');
 assert(d.querySelector('.asset').dataset.key==='guard','Most recently loaded asset was not first');
 assert(d.querySelectorAll('[data-key="guard"] img')[1].src===currentGuard,'Import changed active art');
 assert(d.querySelector('[data-key="floor-indoor"] .variant .caption').textContent.includes('b002'),'Newest variant was not first');
 $('search').value='floor-indoor';$('search').dispatchEvent(new w.Event('input'));assert(d.querySelectorAll('.asset').length===1,'Search failed');
 $('tile').checked=true;$('tile').dispatchEvent(new w.Event('change'));assert(d.querySelectorAll('.repeat').length===3,'Repeated floor comparisons missing');
 $('background').value='light';$('background').dispatchEvent(new w.Event('change'));assert(d.querySelectorAll('.preview.light').length===3,'Background failed');
 d.querySelector('button.preview').click();assert($('detail').open,'Enlarged dialog failed');$('close').click();assert(!$('detail').open,'Close failed');
 $('search').value='guard';$('search').dispatchEvent(new w.Event('input'));$('scale').value='world';$('scale').dispatchEvent(new w.Event('change'));assert(d.querySelector('.preview img').style.width==='22px','World scale not respected');
 frame.style.width='390px';await delay(100);assert(w.innerWidth===390&&d.documentElement.scrollWidth<=390,'Mobile gallery overflow');
 d.querySelector('button.preview').click();assert(d.documentElement.scrollWidth<=390,'Mobile dialog overflow');assert($('large').querySelector('img').getBoundingClientRect().width>128,'Dialog did not enlarge sprite');$('close').click();
 $('clear').click();assert(d.querySelectorAll('[data-key="guard"] .variant').length===1,'Clear failed');
 $('search').value='';$('search').dispatchEvent(new w.Event('input'));assert(d.querySelectorAll('.asset').length===assets.length,'Clear removed active assets');assert(errors.length===0,JSON.stringify(errors));
 frame.contentWindow.location.reload();
 for(let n=0;n<150;n++){if(frame.contentDocument?.querySelectorAll('[data-key="floor-lab"] .variant').length===2)break;await delay(100);}
 assert(frame.contentDocument.querySelectorAll('[data-key="floor-lab"] .variant').length===2,'Saved source did not return after reload');
 const fresh=frame.contentWindow,doc=frame.contentDocument,realFetch=fresh.fetch.bind(fresh);
 doc.querySelector('[data-key="floor-lab"] .reject').click();
 for(let n=0;n<50;n++){if(doc.getElementById('status').textContent.startsWith('Rejected'))break;await delay(100);}
 assert(doc.querySelectorAll('[data-key="floor-lab"] .variant').length===1,'Rejected candidate still visible by default');
 const reviews=await (await fetch('/api/sprite-reviews')).json();assert(reviews.rejected.includes('any-name/floor-lab__v03__source.png'),'ZIP rejection identity was not persisted');
 doc.getElementById('retryStorage').click();await delay(200);
 assert(doc.querySelectorAll('[data-key="floor-lab"] .variant').length===1,'Saved-source reload lost rejection');
 doc.getElementById('showRejected').checked=true;doc.getElementById('showRejected').dispatchEvent(new fresh.Event('change'));
 assert(doc.querySelector('[data-key="floor-lab"] .variant.rejected'),'Show rejected did not reveal candidate');
 doc.querySelector('[data-key="floor-lab"] .reject').click();
 for(let n=0;n<50;n++){if(doc.getElementById('status').textContent.startsWith('Restored'))break;await delay(100);}
 assert(!doc.querySelector('.variant.rejected'),'Restore failed');
  const preparedCanvas=doc.createElement('canvas');preparedCanvas.width=preparedCanvas.height=128;preparedCanvas.getContext('2d').fillRect(0,0,128,128);
  const preparedBlob=await new Promise(r=>preparedCanvas.toBlob(r,'image/png')),preparedFiles=new fresh.DataTransfer();
  const preparedFile=new fresh.File([preparedBlob],'floor-lab.png',{type:'image/png'});Object.defineProperty(preparedFile,'webkitRelativePath',{value:'sprite-prepared/any-name/v03/floor-lab.png'});preparedFiles.items.add(preparedFile);
  doc.getElementById('folder').files=preparedFiles.files;doc.getElementById('folder').dispatchEvent(new fresh.Event('change'));
  for(let n=0;n<50&&!doc.querySelector('[data-key="floor-lab"] .caption strong')?.textContent.includes('Prepared v03');n++)await delay(100);
  assert(doc.querySelector('[data-key="floor-lab"] .caption strong').textContent==='Prepared v03','Prepared folder identity missing');
  assert(doc.querySelector('[data-key="floor-lab"] .install').disabled,'Unsaved prepared bytes must not install the original');
   await fetch('/__prepared-fixture',{method:'POST',body:preparedBlob});
   const batchFiles=new fresh.DataTransfer(),batchFile=new fresh.File([preparedBlob],'floor-lab.png',{type:'image/png'});
   Object.defineProperty(batchFile,'webkitRelativePath',{value:'any-name/v03/floor-lab.png'});batchFiles.items.add(batchFile);
   doc.getElementById('folder').files=batchFiles.files;doc.getElementById('folder').dispatchEvent(new fresh.Event('change'));
   for(let n=0;n<100&&!doc.querySelector('[data-key="floor-lab"] .caption p')?.textContent.startsWith('any-name/');n++)await delay(100);
   assert(doc.querySelector('[data-key="floor-lab"] .caption p').textContent==='any-name/v03/floor-lab.png','Batch-folder import did not complete');
   assert([...doc.querySelectorAll('[data-key="floor-lab"] .caption strong')].filter(node=>node.textContent==='Prepared v03').length===1,'Prepared folder aliases created duplicate cards');
  for(let n=0;n<50&&doc.querySelector('[data-key="floor-lab"] .install').disabled;n++)await delay(100);
  const install=doc.querySelector('[data-key="floor-lab"] .install');assert(!install.disabled,'Saved prepared candidate install button disabled');install.click();
 for(let n=0;n<100;n++){if(doc.getElementById('status').textContent.startsWith('Installed'))break;await delay(100);}
 assert(doc.getElementById('status').textContent.startsWith('Installed'),'Install button failed');
 assert(doc.querySelector('[data-key="floor-lab"] .install').textContent==='Installed','Installed state not shown');
  const current=[...doc.querySelectorAll('[data-key="floor-lab"] img')].at(-1);await current.decode();assert(current.src.includes('/production/installed-'),'Current art did not switch to runtime PNG');
 const roomCanvas=doc.createElement('canvas');roomCanvas.width=roomCanvas.height=128;
 const roomContext=roomCanvas.getContext('2d');roomContext.fillStyle='#788898';roomContext.fillRect(0,0,30,20);
 const roomBlob=await new Promise(resolve=>roomCanvas.toBlob(resolve));
 await fetch('/__room-fixture',{method:'POST',body:roomBlob});
 const roomFiles=new fresh.DataTransfer(),roomFile=new fresh.File([roomBlob],'floor-room-analysis.png',{type:'image/png'});
 Object.defineProperty(roomFile,'webkitRelativePath',{value:'any-name/v03/floor-room-analysis.png'});roomFiles.items.add(roomFile);
 doc.getElementById('folder').files=roomFiles.files;doc.getElementById('folder').dispatchEvent(new fresh.Event('change'));
 for(let n=0;n<100&&!doc.querySelector('[data-key="floor-room-analysis"] .install');n++)await delay(100);
 const roomInstall=doc.querySelector('[data-key="floor-room-analysis"] .install');assert(roomInstall&&!roomInstall.disabled,'Room overlay not visible/installable');roomInstall.click();
 for(let n=0;n<100&&doc.querySelector('[data-key="floor-room-analysis"] .install').textContent!=='Installed';n++)await delay(100);
 assert(doc.querySelector('[data-key="floor-room-analysis"] .install').textContent==='Installed','Room overlay install failed');
 const missing=doc.getElementById('uninstalledOnly');missing.click();
 assert(!doc.querySelector('[data-key="floor-lab"]')&&!doc.querySelector('[data-key="floor-room-analysis"]'),'Missing-install filter retained installed sprites');
 assert(doc.querySelector('[data-key="guard"]'),'Fallback-only sprite should remain visible');
 doc.getElementById('search').value='floor-lab';doc.getElementById('search').dispatchEvent(new fresh.Event('input'));
 assert(doc.querySelectorAll('.asset').length===0,'Missing-install filter did not combine with search');
 doc.getElementById('search').value='';doc.getElementById('search').dispatchEvent(new fresh.Event('input'));missing.click();
 assert(doc.querySelector('[data-key="floor-lab"]'),'Turning off missing-install filter did not restore sprites');
 doc.querySelector('[data-key="floor-lab"] .reject').click();
 for(let n=0;n<50&&!doc.getElementById('status').textContent.startsWith('Rejected');n++)await delay(100);
 missing.click();assert(doc.querySelector('[data-key="floor-lab"]'),'Sprite with only a rejected installed variant should remain visible');missing.click();
 fresh.fetch=(url,...args)=>url==='/api/sprite-sources'?Promise.resolve(new fresh.Response('{}',{status:404})):realFetch(url,...args);
 doc.getElementById('retryStorage').click();
 for(let n=0;n<50;n++){if(doc.getElementById('storageAvailability').textContent.includes('unavailable'))break;await delay(100);}
 assert(doc.getElementById('saveSources').disabled&&doc.getElementById('storageStatus').textContent.includes('Ctrl+C'),'Missing endpoint did not explain disabled saving');
 fresh.fetch=realFetch;doc.getElementById('retryStorage').click();
 for(let n=0;n<50;n++){if(!doc.getElementById('saveSources').disabled)break;await delay(100);}
 assert(!doc.getElementById('saveSources').disabled&&doc.getElementById('saveSources').checked,'Retry did not enable source saving');
 await fetch('/__smoke-result',{method:'POST',body:JSON.stringify({ok:true,reviews:[recoloredReview,maskReview],checks:`technician colors/masks/reset/alpha/map size; ${assets.length} loaded assets, persistent rejection/restoration, ZIP save/reload, newest-first multi-batch variants, corrupt/unknown files, active-art isolation, missing-install filter/search/rejection, floor repeats, backgrounds, scale, dialog, clear, 390px layout`})});
}catch(error){await fetch('/__smoke-result',{method:'POST',body:JSON.stringify({ok:false,error:error.stack??String(error)})});}
