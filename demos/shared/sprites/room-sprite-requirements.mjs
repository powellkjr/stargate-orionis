// Presentation plan for existing room/geology catalog IDs, not room behavior.
// Furnishings are provisional visual categories, never configured Services/Cores.
const geology={
 unexcavated_rock:'Ordinary muted mountain rock with subtle geological variation.',
 hard_rock:'Dense darker mountain rock with restrained fracture lines.',
 bedrock:'Massive dense geological material with broad quiet banding.',
 excavated_empty:'Rough pale excavated chamber ground ready for construction.',
 void:'Dark natural cavity material with subtle depth texture; no directional shadows.',
 collapsed_prefab:'Damaged prefabricated chamber ground with sparse low-profile rubble and exposed flat structural fragments.',
 outside_edge:'Muted mountain boundary material with a subtle natural cliff-top texture.',
 mineral_zone:'Natural rock with restrained mineral veins and unusual coloration; no glow.',
 unstable_rock:'Splintered natural rock with restrained unstable-looking seams.',
 metal_vein:'Natural rock containing dull metal bands and subtle reflective ore.',
 anomalous_geology:'Natural rock with unusual non-glowing banding and quiet geological variation.',
 flooded_void:'Dark breached-cavity ground covered by quiet pooled water; no foam, strong reflections or directional gradient.',
 reinforced_excavated:'Pale excavated ground with subtle flat reinforced lining seams.'
};
export const baseTileSprites=Object.fromEntries(Object.keys(geology).map(id=>[id,`floor-base-${id.replaceAll('_','-')}`]));
const furnishings={
 'containment-cabinet':[30,'One closed compact containment cabinet, directly overhead, with a plain sealed lid and no visible contents or scientific identity.'],
 'storage-rack':[30,'One compact storage rack viewed directly overhead, with simple closed neutral bins; no contents or readable labels.'],
 'research-desk':[30,'One compact research desk viewed directly overhead with a small generic top control surface; no readable papers, screens or findings.'],
 workbench:[30,'One sturdy workshop workbench viewed directly overhead with simple generic bench tooling; no specific Recipe, technology or item being worked on.'],
 bunk:[26,'One compact living-quarters bunk viewed directly overhead, a plain mattress within a simple frame; no person, backdrop or room shell.'],
 'holding-bench':[26,'One simple sturdy holding-area bench viewed directly overhead; no captive, restraints, backdrop or room shell.']
};
export const roomSpriteSubjects=Object.fromEntries([
 ...Object.entries(geology).map(([id,subject])=>[baseTileSprites[id],`A seamless direct-overhead opaque terrain material swatch. ${subject} Keep visual noise low. No room shell, tall front face, props, labels, warning markings or baked cast shadows. Match opposite edges in color, pattern and brightness.`]),
 ...Object.entries(furnishings).map(([key,[,subject]])=>[key,subject])
]);
export const roomSpriteAssets=[...Object.values(baseTileSprites).map(key=>[key,100]),...Object.entries(furnishings).map(([key,[size]])=>[key,size])];
export const roomSprites={
 analysis:{floor:'floor-lab',props:['test-rig','console']},
 containment:{floor:'floor-lab',props:['containment-cabinet']},
 data_storage:{floor:'floor-indoor',props:['terminal','storage-rack']},
 equipment_storage:{floor:'floor-indoor',props:['storage-rack','crate']},
 gate_room:{floor:'floor-indoor',props:['gate','gate-open','console']},
 generator:{floor:'floor-indoor',props:['generator']},
 cultural_platform:{floor:'floor-indoor',props:[],subject:'Cultural Platform: one complete 2×2 room spanning four simulator cells, not four repeated miniature rooms. Confine all neutral fixed seating and table forms to the perimeter, leaving one continuous open center entirely free of furniture. No central table, chairs or planters. No cultural symbols, artifacts, exhibits or readable text. No cultural bonuses or new Core capabilities are implied.'},
 holding:{floor:'floor-indoor',props:['holding-bench','security']},
 infirmary:{floor:'floor-lab',props:['bed','medical']},
 living_quarters:{floor:'floor-indoor',props:['bunk']},
 maintenance:{floor:'floor-indoor',props:['workbench','generator']},
 material_storage:{floor:'floor-indoor',props:['storage-rack','crate']},
 ration_storage:{floor:'floor-indoor',props:['storage-rack','crate']},
 receiving:{floor:'floor-indoor',props:['crate','console']},
 research:{floor:'floor-lab',props:['research-desk','terminal']},
 response_room:{floor:'floor-indoor',props:['storage-rack','security']},
 supply_storage:{floor:'floor-indoor',props:['storage-rack','crate']},
 tech_platform:{floor:'floor-lab',props:['test-rig','console']},
 workshop:{floor:'floor-indoor',props:['workbench']}
};
for(const entry of Object.values(roomSprites))Object.freeze(entry.props),Object.freeze(entry);
for(const entry of roomSpriteAssets)Object.freeze(entry);
Object.freeze(roomSpriteAssets);Object.freeze(roomSpriteSubjects);Object.freeze(baseTileSprites);Object.freeze(roomSprites);
