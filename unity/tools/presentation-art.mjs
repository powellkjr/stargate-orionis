// Project the simulators' active, registered art without changing game data.
import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spriteManifest} from '../../demos/offworld-sandbox/sprite-manifest.mjs';
import {createVariantPicker} from '../../demos/shared/sprites/variant-selection.mjs';
import {roomInteriorKey} from '../../demos/room-sandbox/sprite-presentation.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const destination=resolve(root,'unity/StargateOrionis/Assets/Orionis/Resources/OrionisArt');
const check=process.argv.includes('--check'),pick=createVariantPicker(spriteManifest.installed,'unity-presentation-1');
const snapshot=JSON.parse(readFileSync(resolve(root,'unity/StargateOrionis/Assets/Orionis/Data/Generated/bootstrap.json')));
const files={};
function project(key,identity){
 const entry=pick(key,identity);if(!entry?.src)return null;
 const source=resolve(root,'demos/offworld-sandbox',entry.src);
 if(!source.endsWith('.png')||!existsSync(source))return null;
 const hash=createHash('sha256').update(readFileSync(source)).digest('hex');
 const name='art-'+hash.slice(0,20),target=resolve(destination,name+'.png');
 files[name]={source:source.slice(root.length+1).replaceAll('\\','/'),sha256:hash,key,sourceId:entry.sourceId};
 if(check){if(!existsSync(target)||createHash('sha256').update(readFileSync(target)).digest('hex')!==hash)throw Error('Missing/stale art: '+key);}
 else{mkdirSync(destination,{recursive:true});if(!existsSync(target))copyFileSync(source,target);}
 return name;
}
const rooms=Object.fromEntries(snapshot.roomDefinitions.map(r=>{
 const interior=roomInteriorKey(r.id);
 return [r.id,{floor:project(spriteManifest.roomTypes[r.id]?.floor??'floor-indoor',r.id),overlay:interior?project(interior,r.id):null}];
}));
const professions=Object.fromEntries(Object.entries(spriteManifest.professions).map(([profession,key])=>[profession,project(key,profession)]));
const units=Object.fromEntries(snapshot.units.map(u=>[u.id,project(spriteManifest.professions[u.profession],u.id)]));
const mission=JSON.parse(readFileSync(resolve(root,'demos/shared/data/offworld/missing-operative-001.finalized.json')));
const stages=Object.fromEntries(mission.stages.filter(s=>snapshot.missionMap.stages.some(p=>p.id===s.stageId)).map(s=>[s.stageId,{floor:project(spriteManifest.stageOverrides[s.stageId]??spriteManifest.stageArchetypes[s.archetypeId],s.stageId)}]));
const manifest={format:'orionis-presentation-art-1',variantSeed:'unity-presentation-1',rooms,professions,units,stages,files};
const text=JSON.stringify(manifest,null,2)+'\n',path=resolve(destination,'catalog.json');
if(check){if(readFileSync(path,'utf8').replaceAll('\r\n','\n')!==text)throw Error('Presentation catalog is stale.');}
else writeFileSync(path,text);
console.log(`${check?'Verified':'Imported'} ${Object.keys(files).length} shared PNGs; ${Object.values(rooms).filter(r=>r.overlay).length} room overlays; ${Object.values(units).filter(Boolean).length} personnel images.`);
