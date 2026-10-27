// Provisional art choices from docs/room-asset-audit.md, not gameplay equipment.
const g = name => `unity/StargateOrionis/Assets/Synty/PolygonGeneric/Prefabs/Props/SM_Gen_Prop_${name}.prefab`;
const b = name => `unity/StargateOrionis/Assets/Synty/PolygonGeneric/Prefabs/Building/SM_Gen_Bld_${name}.prefab`;
const e = name => `unity/StargateOrionis/Assets/Synty/PolygonGeneric/Prefabs/Environment/SM_Gen_Env_${name}.prefab`;
const p = name => `unity/StargateOrionis/Assets/Synty/PolygonPrototype/Prefabs/Props/SM_Prop_${name}.prefab`;
const sprite = name => 'sprite:' + name;
const study = {
  storage: [g('Shelf_01'), g('Shelf_02'), g('Crate_01'), g('Cardboard_Box_01'), sprite('storage-rack')],
  lab: [g('Table_01'), g('Screen_01'), g('Shelf_01'), g('Bottle_01'), g('Papers_01'), sprite('test-rig'), sprite('workbench')],
  office: [g('Table_01'), g('Chair_01'), g('Screen_01'), g('Papers_01'), sprite('terminal'), sprite('evidence')],
  medical: [g('Medkit_01'), g('Bottle_01'), g('Table_01'), g('Shelf_01'), sprite('bed'), sprite('medical')],
  utility: [b('Pipe_Straight_01'), b('Pipe_Corner_01'), b('Pipe_Valve_01'), g('Switch_01'), g('Screen_01'), sprite('generator')],
  yard: [e('Ground_Dirt_01'), e('Rock_01'), e('Bush_01'), g('Crate_01'), p('Barrier_01')],
  gate: [sprite('gate'), sprite('gate-open'), e('Rock_01'), p('Barrier_01'), sprite('console')],
  holding: [g('Chair_01'), g('Medkit_01'), p('Window_Bar_01'), sprite('holding-bench'), sprite('medical')],
};
const base = {
  analysis: study.lab, containment: [g('Keypad_01'), g('Crate_01'), sprite('floor-room-containment')],
  cultural_platform: [g('Plinth_01'), g('Statue_01'), g('Pot_01'), g('Chair_01'), p('Microphone_01')],
  data_storage: [...study.office, g('Shelf_01')], equipment_storage: [...study.storage, p('Rifle_01')],
  gate_room: study.gate, holding: study.holding, infirmary: study.medical,
  living_quarters: [g('Table_01'), g('Chair_01'), g('Mug_01'), sprite('bunk'), sprite('bed')],
  maintenance: [...study.utility, g('Table_01'), sprite('workbench')], material_storage: [...study.storage, g('Barrel_Metal_01'), p('MetalPlate_01')],
  generator: study.utility, ration_storage: [...study.storage, g('Sack_01'), g('Food_Bread_01')],
  receiving: [g('Table_01'), g('Screen_01'), g('Crate_01'), p('Cone_01'), p('Barrier_01'), sprite('workbench')],
  research: [...study.office, sprite('research-desk')], response_room: [g('Chair_01'), g('Screen_01'), g('Shelf_01'), p('Rifle_01'), sprite('security')],
  supply_storage: study.storage, tech_platform: [...study.lab, g('Keypad_01')],
  workshop: [...study.utility, g('Table_01'), g('Shelf_01'), p('MetalPlate_01'), sprite('workbench'), sprite('test-rig')],
  ready_room: [...study.office, g('Crate_01')], warehouse: [...study.storage, g('Barrel_Metal_01'), p('Cone_01')], communications: [...study.office, p('Microphone_01')],
};
const mission = {
  'stage-gate-yard': study.gate, 'stage-outer-yard': study.yard,
  'stage-main-hall': [g('Light_Wall_01'), g('Keypad_01'), sprite('door'), sprite('security')],
  'stage-holding-area': [...study.medical, sprite('holding-bench'), g('Crate_01')],
  'stage-processing': [...study.utility, g('Barrel_Metal_01'), sprite('test-rig')],
  'stage-security-hall': [g('Light_Wall_01'), g('Keypad_01'), p('Barrier_01'), sprite('security')],
  'stage-overseer-office': [...study.office, g('Shelf_01')], 'stage-hidden-store': study.storage,
  'stage-hidden-safe': [g('Chest_01'), g('Keypad_01'), sprite('evidence'), sprite('crate')],
  'stage-analysis-lab': [...study.lab, sprite('terminal'), sprite('evidence')],
  'relay-gate-clearing': study.gate,
  'relay-approach-trail': [e('Ground_Dirt_01'), e('Rock_01'), e('Cliff_01'), e('Bush_01'), e('Mountain_01')],
  'relay-courtyard': study.yard, 'relay-control-room': study.office,
  'relay-maintenance-shelter': [g('Table_01'), g('Crate_01'), g('Medkit_01'), sprite('bed'), sprite('workbench')],
  'relay-generator-room': study.utility,
};
export function starterAssignments(catalog) {
  const assignments = [];
  for (const target of catalog.targets) {
    const key = target.id.split(':').at(-1);
    const ids = target.id.startsWith('base:') ? base[key] : mission[key];
    if (!ids?.length) throw Error('Missing starter art choices: ' + target.id);
    for (const assetId of new Set(ids)) {
      const asset = catalog.assets.find(a => a.id === assetId);
      if (!asset || asset.disabled) throw Error('Unavailable starter asset: ' + assetId);
      assignments.push({ roomId: target.id, assetId });
    }
  }
  return { assignments };
}
