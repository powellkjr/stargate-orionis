import {compileMission} from '../shared/offworld/mission.mjs';
import {createAuthorityRegistry} from '../shared/mission-author/adapters.mjs';
export async function loadFixtures(read){
 const paths=['offworld/archetypes','item','offworld/missing-operative-001.finalized','theory/stargate_theory_simulator_import','base-classes','instance','mission-author/catalogs','mission-author/context','mission-author/skeletons','mission-author/information','mission-author/dynamics','mission-author/results'];
 const data=await Promise.all(paths.map(read)),[offworld,items,rawMission,theoryPack,professions,physicalInstances,pack,context,templates,information,dynamics,results]=data;
 const mission=compileMission(rawMission,{...offworld,itemDefinitions:items}),registry=createAuthorityRegistry({theoryPack,professions,items,physicalInstances,mission,offworld});return {pack,context,templates,information,dynamics,results,registry};
}
