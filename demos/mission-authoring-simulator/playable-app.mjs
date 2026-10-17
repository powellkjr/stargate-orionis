import {authorMission,validatePlayable,playableText} from './playable.mjs';
const $=id=>document.getElementById(id);
let catalog,templates;
const message=$('playableStatus');
function invalidate(){ $('playableExport').disabled=true;message.textContent='Changes pending. Validate before exporting.'; }
function source(){return JSON.parse($('playableJson').value);}
function populate(raw){
 $('playableId').value=raw.mission?.missionId??'';$('playableTitle').value=raw.mission?.title??'';
 $('playableBriefing').value=raw.mission?.briefing?.playerText??'';
 $('playableJson').value=JSON.stringify(raw,null,2);invalidate();
}
function current(){return authorMission(source(),{missionId:$('playableId').value,title:$('playableTitle').value,briefing:$('playableBriefing').value});}
function fail(error){$('playableExport').disabled=true;message.textContent=`Validation error: ${error.message}`;}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
for(const id of ['playableId','playableTitle','playableBriefing'])$(id).addEventListener('input',invalidate);
$('playableJson').addEventListener('input',()=>{invalidate();try{const raw=source();$('playableId').value=raw.mission?.missionId??'';$('playableTitle').value=raw.mission?.title??'';$('playableBriefing').value=raw.mission?.briefing?.playerText??'';}catch{/* Keep incomplete JSON editable. */}});
$('playableTemplate').onclick=()=>{
 const selected=$('playableScenario').value,template=templates[selected];
 populate(selected==='last-transmission'?template:authorMission(template,{missionId:'new-mission-001',title:'New mission',briefing:template.mission.briefing.playerText}));
 $('playableForm').requestSubmit();
};
$('playableImport').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;const raw=JSON.parse(await file.text());validatePlayable(raw,catalog);populate(raw);}catch(error){fail(error);}finally{event.target.value='';}};
$('playableForm').onsubmit=event=>{event.preventDefault();try{const raw=current(),{summary}=validatePlayable(raw,catalog);$('playableJson').value=JSON.stringify(raw,null,2);$('playableExport').disabled=false;message.textContent=`Validated for Offworld · ${summary.stages} Stages · ${summary.objectives} objectives · ${summary.recipes} Recipes. Import the exported JSON in Offworld to playtest; completion and access still need playtesting.`;}catch(error){fail(error);}};
$('playableExport').onclick=()=>{try{const raw=current();download(playableText(raw,catalog),`${raw.mission.missionId}.json`);}catch(error){fail(error);}};
try{
 const read=async path=>{const response=await fetch(`../shared/data/${path}.json`);if(!response.ok)throw Error(`Could not load ${path}: ${response.status}`);return response.json();};
 const [archetypes,items,rescue,relay]=await Promise.all([read('offworld/archetypes'),read('item'),read('offworld/missing-operative-001.finalized'),read('offworld/last-transmission-001.finalized')]);
 catalog={...archetypes,itemDefinitions:items};templates={'last-transmission':relay,'rescue-variant':rescue};
 for(const id of ['playableTemplate','playableScenario','playableImport','playableValidate'])$(id).disabled=false;
 message.textContent='Load The Last Transmission, start a rescue variant, or import a playable Offworld mission JSON.';
}catch(error){fail(error);}
