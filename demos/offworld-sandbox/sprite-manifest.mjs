// Presentation resources only; these mappings grant no identity or gameplay facts.
import {roomSpriteAssets,roomSprites,baseTileSprites} from '../shared/sprites/room-sprite-requirements.mjs';
import {activeSprites} from '../shared/sprites/active-sprites.mjs';
import {activeCharacterRigs} from '../shared/sprites/active-character-rigs.mjs';
import {offworldRoomTileSubjects} from '../shared/sprites/room-tile-prompts.mjs';
export const roomOverlayKeys=Object.freeze([...Object.keys(roomSprites),...Object.keys(offworldRoomTileSubjects)].map(id=>`floor-room-${id.replaceAll('_','-')}`));
const root='../shared/sprites/offworld/';
const asset=(name,size=24)=>({src:activeSprites[name]?.src??`${root}${name}.svg`,fallbackSrc:`${root}${name}.svg`,installedSourceId:activeSprites[name]?.sourceId??null,size,pivot:[.5,.5],
 runtimeFile:`${name}.png`,runtimePixels:name==='wall'?[128,12]:name.startsWith('gate')?[256,256]:[128,128],
 displaySize:name==='wall'?[100,10]:name==='corner'?[8,8]:[size,size],
 opaque:name.startsWith('floor-'),padding:name.startsWith('floor-')||name==='wall'?0:name.startsWith('gate')?16:8,
 pair:({door:'door-open','door-open':'door',gate:'gate-open','gate-open':'gate'})[name]??null});
export const spriteManifest={version:1,cellSize:100,fallback:'unknown',installed:activeSprites,rigs:activeCharacterRigs,assets:Object.fromEntries([
 ['floor-indoor',100],['floor-lab',100],['floor-outdoor',100],['floor-fog',100],['wall',100],['corner',8],['door',32],['door-open',32],
 ['unknown',24],['civilian',22],['worker',22],['guard',22],['soldier',22],['scout',22],['technician',22],['scientist',22],['medic',22],['diplomat',22],
 ['gate',56],['gate-open',56],['console',26],['generator',30],['test-rig',30],['crate',24],['bed',26],['terminal',24],['evidence',24],['medical',26],['security',24],['rock',18],['vegetation',18],...roomSpriteAssets
 ].map(([name,size])=>[name,asset(name,size)]).concat(roomOverlayKeys.map(key=>[key,{...asset(key,100),src:activeSprites[key]?.src??`${root}room-overlay.svg`,fallbackSrc:`${root}room-overlay.svg`,opaque:false,padding:0,preserveFrame:true}]))),
 stageArchetypes:{stage_gate_area:'floor-outdoor',stage_medical_holding:'floor-lab',stage_processing_room:'floor-indoor',stage_hallway_basic:'floor-indoor',stage_security_room:'floor-indoor',stage_room_basic:'floor-indoor'},
 stageOverrides:{'stage-outer-yard':'floor-outdoor','stage-analysis-lab':'floor-lab'},
 instanceArchetypes:{stargate_standard:'gate',npc_worker_basic:'worker',npc_guard_poorly_trained:'guard',npc_security_supervisor:'guard',npc_overseer:'civilian',npc_expert_medic_epidemiologist:'medic',patient_outbreak_basic:'bed',supply_cache_basic:'crate',advanced_mining_system:'generator',security_terminal_basic:'terminal',evidence_archive_basic:'evidence',hidden_evidence_archive_basic:'evidence',hidden_supply_cache_basic:'crate',equipment_crate:'crate',medical_sample_source:'medical',mounted_item:'test-rig',search_station:'console',recoverable_advanced_component:'generator'},
 // Public labels allow visual category without depicting hidden Reality/identity.
 publicLabels:{'Mining control terminal':'terminal','Mining console':'console','Terminal wreckage':'evidence','Recovered terminal wreckage':'evidence','Supply crates':'crate','Supply storage':'crate','Analysis equipment':'test-rig','Test rig':'test-rig','Experimental mining component':'generator'},
 professions:{SOLDIER:'soldier',SCOUT:'scout',TECHNICIAN:'technician',SCIENTIST:'scientist',MEDIC:'medic',DIPLOMAT:'diplomat'},
 roomTypes:roomSprites,baseTiles:baseTileSprites
};
for(const value of Object.values(spriteManifest.assets))Object.freeze(value.pivot),Object.freeze(value.runtimePixels),Object.freeze(value.displaySize),Object.freeze(value);
for(const value of Object.values(spriteManifest))if(typeof value==='object')Object.freeze(value);
Object.freeze(spriteManifest);
