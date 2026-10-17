// Loaded only by the isolated smoke server's wrapper page.
const frame=document.querySelector('iframe'),delay=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(value,message)=>{if(!value)throw Error(message);};
try{
 for(let n=0;n<150;n++){if(frame.contentDocument?.getElementById('status')?.textContent.startsWith('VALID'))break;await delay(100);}
 const w=frame.contentWindow,d=frame.contentDocument,$=id=>d.getElementById(id),exceptions=[];w.addEventListener('error',e=>exceptions.push(e.message));w.addEventListener('unhandledrejection',e=>exceptions.push(String(e.reason)));
 assert($('status').textContent.startsWith('VALID'),`Initial composition failed: ${$('status').textContent}`);
 for(let n=0;n<50&&$('playableTemplate').disabled;n++)await delay(100);
 $('playableScenario').value='rescue-variant';$('playableTemplate').click();$('playableTitle').value='Browser rescue variant';$('playableTitle').dispatchEvent(new w.Event('input'));$('playableForm').requestSubmit();
 assert($('playableStatus').textContent.startsWith('Validated for Offworld'),'Playable validation failed');
 const exports=[],downloadNames=[],OriginalBlob=w.Blob;w.Blob=class extends OriginalBlob{constructor(parts,options){super(parts,options);if(options?.type==='application/json')exports.push(parts.join(''));}};w.HTMLAnchorElement.prototype.click=function(){downloadNames.push(this.download);};
 $('playableExport').click();const playable=JSON.parse(exports.pop());assert(playable.mission.title==='Browser rescue variant'&&playable.mission.missionId==='new-mission-001','Playable export missing edits');
 $('playableTitle').dispatchEvent(new w.Event('input'));assert($('playableExport').disabled,'Stale playable export enabled');
 const broken=JSON.parse($('playableJson').value);broken.objectives[0].completionCondition.instanceId='missing';$('playableJson').value=JSON.stringify(broken);$('playableJson').dispatchEvent(new w.Event('input'));$('playableForm').requestSubmit();assert($('playableExport').disabled&&$('playableStatus').textContent.includes('unknown instances reference'),'Broken playable reference accepted');
 $('playableTemplate').click();$('playableForm').requestSubmit();
 $('playableScenario').value='last-transmission';$('playableTemplate').click();assert(!$('playableExport').disabled,'Ready mission did not validate on load');$('playableExport').click();
 const relay=JSON.parse(exports.pop());assert(relay.mission.missionId==='last-transmission-001'&&relay.stages.length===6&&relay.dialogueScenes.length===4,'Complete relay mission not saved');
 assert(downloadNames.at(-1)==='last-transmission-001.json','Ready save filename incorrect');
 // Pass the actual saved payload through Offworld's file importer and deployment UI.
 const playFrame=document.createElement('iframe');playFrame.title='Saved mission playtest';playFrame.style.width='1440px';playFrame.src='/demos/offworld-sandbox/index.html';document.body.append(playFrame);
 for(let n=0;n<150;n++){if(playFrame.contentDocument?.querySelector('#roster [data-unit]'))break;await delay(100);}
 const pw=playFrame.contentWindow,pd=playFrame.contentDocument,playExceptions=[];
 pw.addEventListener('error',e=>playExceptions.push(e.message));pw.addEventListener('unhandledrejection',e=>playExceptions.push(String(e.reason)));
 assert(pd.querySelector('#roster [data-unit]'),'Offworld roster did not load');
 const readyTransfer=new pw.DataTransfer();readyTransfer.items.add(new pw.File([JSON.stringify(relay)],'last-transmission-001.json',{type:'application/json'}));pd.getElementById('missionFile').files=readyTransfer.files;pd.getElementById('missionFile').dispatchEvent(new pw.Event('change'));
 for(let n=0;n<50;n++){if(pd.querySelector('h1').textContent==='The Last Transmission')break;await delay(100);}
 assert(pd.querySelector('h1').textContent==='The Last Transmission','Saved JSON was not accepted by Offworld');
 for(const card of [...pd.querySelectorAll('#roster [data-unit]')].slice(0,4)){const input=card.querySelector('[data-field=selected]');input.checked=true;input.dispatchEvent(new pw.Event('change',{bubbles:true}));}
 assert(!pd.getElementById('deploy').disabled,'Saved mission cannot deploy');pd.getElementById('deploy').click();await delay(150);
 assert(pd.getElementById('error').hidden,'Saved mission deployment error: '+pd.getElementById('error').textContent);assert(pd.getElementById('map').innerHTML.includes('relay-gate-clearing'),'Saved mission Gate did not render');
 pd.getElementById('keepGate').click();
 for(const id of ['relay-door-gate-trail','relay-door-trail-courtyard']){const door=pd.querySelector(`[data-transition="${id}"]`);assert(door,'Saved mission route missing: '+id);door.dispatchEvent(new pw.MouseEvent('click',{bubbles:true}));await delay(400);}
 assert(pd.getElementById('error').hidden,'Saved mission travel error: '+pd.getElementById('error').textContent);
 assert(!pd.getElementById('conversation').hidden&&pd.getElementById('conversation').textContent.includes('Commander Rhel'),'New mission courtyard/dialogue did not render');
 assert(playExceptions.length===0,JSON.stringify(playExceptions));playFrame.remove();
 $('export').click();const first=JSON.parse(exports[0]);assert(first.format==='mission-author-review-export-1'&&first.trace.decisions.length,'Draft/trace export missing');assert(first.readiness.status==='NOT_FINALIZED'&&first.readiness.summary.missingSourceReferences===0,'Readiness export missing or incorrect');assert($('review').textContent.includes('Finalizer readiness'),'Readiness not visible');
 $('requestForm').requestSubmit();$('export').click();assert(exports[0]===exports[1],'Repeat composition differs');
 $('seed').value='another-seed';$('seed').dispatchEvent(new w.Event('input'));assert($('export').disabled,'Stale export remained enabled');$('requestForm').requestSubmit();assert($('status').textContent.startsWith('VALID'),'Seed change failed');
 $('pattern').value='RECOVER';$('characterized').checked=true;$('requestForm').requestSubmit();assert($('status').textContent.startsWith('VALID'),'Recovery benchmark failed');assert($('review').textContent.includes('primary-device-recovery'),'Recovery intent missing');
 frame.style.width='390px';await delay(100);assert(w.innerWidth===390,'Mobile frame width wrong');assert(d.documentElement.scrollWidth<=390,'Mobile overflow');d.querySelector('details').open=true;assert(d.documentElement.scrollWidth<=390,'Expanded review overflows');
 $('export').click();const imported=JSON.parse(exports.at(-1)),originalCore=JSON.stringify(imported.draft.dynamic.information);imported.readiness={status:'PLAYABLE'};imported.draft.dynamic.events.push({possibilityId:'not-authored'});const transfer=new w.DataTransfer();transfer.items.add(new w.File([JSON.stringify(imported)],'draft.json',{type:'application/json'}));$('import').files=transfer.files;$('import').dispatchEvent(new w.Event('change'));
 for(let n=0;n<50;n++){if($('status').textContent.startsWith('REPAIRED'))break;await delay(100);}assert($('status').textContent.startsWith('REPAIRED'),'Imported optional choice not repaired');$('export').click();const repaired=JSON.parse(exports.at(-1));assert(repaired.repair.passes===1,'Repair pass count wrong');assert(JSON.stringify(repaired.draft.dynamic.information)===originalCore,'Repair changed core');
 assert(repaired.readiness.status==='NOT_FINALIZED','Imported readiness metadata trusted');$('seed').value='';$('requestForm').dispatchEvent(new w.Event('submit',{cancelable:true}));assert($('status').textContent.includes('nonempty seed')&&$('export').disabled,'Invalid request was not reported');assert(exceptions.length===0,JSON.stringify(exceptions));
 document.getElementById('outcome').textContent='Browser smoke passed';await fetch('/__smoke-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ok:true,checks:'playable save, Offworld file import/deployment/travel/dialogue, compose, determinism, controls, export, import/repair, validation errors, 390px expanded layout',exceptions})});
}catch(error){document.getElementById('outcome').textContent=error.stack;await fetch('/__smoke-result',{method:'POST',body:JSON.stringify({ok:false,error:error.stack})});}
