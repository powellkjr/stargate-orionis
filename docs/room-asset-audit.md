# Available art mapped to base and mission rooms

Audited October 27, 2026. This continues the Room Art Lab workstream.

The strongest environment source is **Polygon Generic**, bundled alongside
Polygon Prototype. It supplies actual shelves, a table/chair, screens, control
props, lights, medical supplies, storage containers and extensive outdoor
terrain. Prototype is useful for modular structure and deliberate placeholders.
Existing Orionis sprites cover several specialist objects that have no dedicated
3D model in the installed packs.

These are suitability recommendations from source-file inventory, prefab
hierarchies, the existing art reviews and authored room/mission data. They are
not a claim that every model has been rendered or its bounds, materials,
overhead readability, collision or animation fit approved. Nothing was imported
or placed, and no Unity Editor or campaign state was changed by this audit.

## Inventory and exact source roots

[Machine-readable inventory](room-asset-inventory.json) records every installed
prefab/model/animation source path, per-root counts, active sprite selections,
artwork image-family counts, cached package names and authored room/stage lists.
Texture/material counts describe support files; they are not additional props.
Repeated source copies in different projects are retained with their own paths.
The scope is locally installed project art, repository artwork and the local
Unity Asset Store package cache, not an online purchase-library audit.

| Source | What is available | Best use |
| --- | --- | --- |
| `unity/StargateOrionis/Assets/Synty/PolygonGeneric/Prefabs/` | 495 prefabs: Base 72, Building 25, Characters 44, Environment 224, FX 19, Props 108, Weapons 3 | First choice for common furnishings, base shells and mission terrain |
| `unity/StargateOrionis/Assets/Synty/PolygonPrototype/Prefabs/` | 496 prefabs: Buildings 163, Characters 36, Generic 20, FX 5, Icons 159, Misc 1, Primitives 40, Props 71, Vehicle 1 | Modular shell alternatives, blocking, temporary machines, UI markers |
| `unity/OrionisArtLab/Assets/Toon_Soldiers/ToonSoldiers_2/` | Full modular soldiers, weapons/tools, loose medical/ammunition items and animation sources | Existing profession/NPC appearance; portable props and military staging |
| `unity/OrionisArtLab/Assets/Kevin Iglesias/` | Basic, crafting, soldier, melee, archer, throwing, spellcasting and skeleton animation sources; dummy, IK helpers and demo tools | Staff work/movement and mission actions; selected tools as scenery |
| `unity/OrionisArtLab/Assets/CaD_vol1/` | 182 animation FBXs, 364 demo prefabs, one model and demo scene | Conversation, reactions and selected combat studies; demo prefab count is not furniture count |
| `unity/StargateOrionis/Assets/Toon_Soldiers/`, `ToonSoldiers_demo/`, `Kevin Iglesias/` | Smaller installed subsets/copies | Reuse existing game integration; avoid treating copies as new purchases |
| `artwork/technician-proof/` and game `Assets/Orionis/Art/TechnicianProof/` | Original Blender Technician and FBX, Idle/Walk proof | Alternate staff pipeline study; not an environment kit |
| `demos/shared/sprites/active-sprites.mjs` | Current Orionis PNG choices, including room floors and specialist props | Immediate simulator presentation and visual references for 3D equivalents |
| `artwork/room-kit-studies/material-storage/` | 18 modular PNGs across three variants plus three closed door-leaf PNGs | Storage architecture/door style reference; currently a separate 2D assembly study |
| `artwork/sprite-sources/`, `sprite-prepared/`, `generated-storage-rack-b002/`, `gate-repair/`, character/rig studies | Source variants, repaired cutouts and animation proofs | Alternatives/reference with explicit registry status; not all variants are active |
| `artwork/room-layer-prompts-v1/` and other prompt directories | Authoring briefs/guides | Planned work; a prompt does not establish a finished furnishing asset |

The local cache at `C:/Users/Powel/AppData/Roaming/Unity/Asset Store-5.x/`
contains the Prototype package, Toon Soldiers/full and demo, Combat and Dialogue,
the Kevin Iglesias free motion packs, dummy and IK helper. No additional cached
hospital, laboratory, industrial machinery or military-base environment pack
was found. Polygon Generic is present on disk regardless of the package name.

## Reusable asset shortlist

Prefixes below expand to exact repository paths. Unless a range is shown,
the named file was verified individually. Add `.prefab` to Synty names.

| Code / root | Concrete candidates | Useful rooms and limits |
| --- | --- | --- |
| **G** = `unity/StargateOrionis/Assets/Synty/PolygonGeneric/Prefabs/Props/` | `SM_Gen_Prop_Shelf_01`, `_02`, `_03`; `SM_Gen_Prop_Crate_01`, `_02`, `_03`, `_Preset_01`; `SM_Gen_Prop_Cardboard_Box_01`–`_05`, `_Preset_01` | Warehouse, storage, Receiving, mission stores and lab shelves. Containers are visual representations, not new inventory/capacity rules. |
| **G** | `SM_Gen_Prop_Table_01`, `SM_Gen_Prop_Chair_01`, `SM_Gen_Prop_Papers_01`–`_06`, `SM_Gen_Prop_Mug_01`, `SM_Gen_Prop_Clock_01` | Research, office, Communications, briefing and break areas; table is a basic bench substitute, not scientific apparatus. |
| **G** | `SM_Gen_Prop_Screen_01`, `SM_Gen_Prop_Keypad_01`, `SM_Gen_Prop_Button_01`, `_02`, `SM_Gen_Prop_Switch_01`, `SM_Gen_Prop_Lever_01`, `_02` | Terminals, security, communications, generator controls, Workshop and mission lab control points. Build a console from these only as an art composition. |
| **G** | `SM_Gen_Prop_Medkit_01`, `SM_Gen_Prop_Bottle_01`–`_05` | Infirmary, medical Holding, medical kits and sample dressing. Bottles need role-specific visual treatment; do not imply authored sample findings. |
| **G** | `SM_Gen_Prop_Light_Roof_01`–`_03`, `SM_Gen_Prop_Light_Wall_01`, `SM_Gen_Prop_Aircon_01`, `_02`, `_Roof_01`–`_03` | Common base/mission lighting and ventilation. Aircon units are not generators, analysis instruments or containment capability. CT cap lamps remain the separate lab treatment. |
| **G** | `SM_Gen_Prop_Barrel_Metal_01`–`_03`, `SM_Gen_Prop_Sack_01`–`_05`, `_Stack_01`, `_Stack_02`; food bread/meat/vegetable families; `SM_Gen_Prop_Plate_01` | Ration/Supply/Material Storage, Warehouse, mission yard and stores. Sacks/barrels do not identify hidden contents. Fresh food is optional dressing, not the representation of every ration. |
| **G** | `SM_Gen_Prop_Plinth_01`, `_02`, `SM_Gen_Prop_Statue_01`–`_05`, `SM_Gen_Prop_Pot_01`–`_05` | Cultural display placeholders and mission ruins, when authored. Supplied statues are not automatically canonical alien artifacts. |
| **G** | `SM_Gen_Prop_Chest_01`, `_02`, `SM_Gen_Prop_Chain_01`–`_03`, `_Anchor_01`, `SM_Gen_Prop_Hook_01` | Offworld stores, utility clutter and industrial areas. Chest is a placeholder for a secure container, not a proper safe/cabinet model. |
| **GB** = `unity/StargateOrionis/Assets/Synty/PolygonGeneric/Prefabs/Base/` | `SM_Bld_Base_Floor_01`, `_Floor_Half_01`, `_Floor_Quarter_Combined_01`; `SM_Bld_Base_Wall_01`, `_Wall_Half_01`, `_Wall_Quarter_01`, `_Wall_Corner_01`; `SM_Bld_Base_Pillar_01`–`_05`; `_Wall_Door_01`, `_Door_01` | Shared base and indoor mission shell. Bounds/pivots must be registered to the existing four-unit cell and three-segment wall contract; pack door is not verified as the requested split sliding door. |
| **GB** | `SM_Bld_Base_Wall_Destroyed_01`, `_02`, `SM_Bld_Base_Stairs_01`, `_02`, `_Ceiling_01`, roof/trim families | Damaged mission structures and contextual room shell details. Stairs are decorative unless mission geometry actually includes elevation. Roofs need overhead occlusion handling. |
| **B** = `unity/StargateOrionis/Assets/Synty/PolygonGeneric/Prefabs/Building/` | `SM_Gen_Bld_Pipe_Straight_01`–`_03`, `_Corner_01`, `_02`, `_T_01`, `_Cross_01`, `_Valve_01`, `_Cap_01`, `_02`; `SM_Gen_Bld_Beam_01`–`_03`; `SM_Gen_Bld_Ladder_01` | Generator, Maintenance, Workshop, Processing and damaged mission utility rooms. No dedicated mining machine or reactor in this family. |
| **E** = `unity/StargateOrionis/Assets/Synty/PolygonGeneric/Prefabs/Environment/` | `SM_Gen_Env_Rock_01`–`_10`, `_Rock_Pebbles_01`–`_05`; cliff, dirt-cliff, hill, mountain, dirt/grass ground families | Base rock perimeter and offworld Gate clearing, approach, courtyard and mining context. Collision/mineable rock remains authored separately. |
| **E** | Tree/pine/dead-tree, bush, fern, grass, ivy/vine, root, log, water-plane/river/waterfall families | Offworld landscape and ruined relay exterior. Use only where the mission's environment allows it; clear routes and interactions. |
| **P** = `unity/StargateOrionis/Assets/Synty/PolygonPrototype/Prefabs/Props/` | `SM_Prop_Barrier_01`, `SM_Prop_Cone_01`, `SM_Prop_Crate_01`–`_03`, `SM_Prop_MetalPlate_01`, `_02`, `SM_Prop_Window_Bar_01`, `SM_Prop_Pipe_01`–`_04` and curve variants | Receiving lanes, yard/checkpoints, construction staging, Holding bars and temporary machinery dressing. |
| **P** | `SM_Prop_Rifle_01`, `SM_Prop_Pistol_01`, `SM_Prop_Knife_01`, `SM_Prop_Target_01`–`_03`, `_Target_Stand_01` | Equipment/Response/Ready Room dressing and authored armed mission actors. Targets are optional decoration, not a new training Service. Generic rifle is not the authored alien rifle identity. |
| **P** | `SM_Prop_Microphone_01`, `_Microphone_Stand_01`, `_Microphone_Stand_Empty_01`, `SM_Prop_FlagPole_01`, `SM_Prop_Vase_01` | Cultural Platform, briefing/communications composition, office or exterior dressing. Microphone does not replace radios/antennae or canonical room equipment. |
| **PP** = `unity/StargateOrionis/Assets/Synty/PolygonPrototype/Prefabs/Primitives/` | Cube, cylinder (vendor spelling `SM_Primitive_Cylander_*`), tube, torus, wedge families | Explicit blockouts for machines, safe, gate ring or laboratory apparatus while bespoke models are missing. Not finished equivalents. |
| **T** = `unity/OrionisArtLab/Assets/Toon_Soldiers/ToonSoldiers_2/models/` | `extra_models/item_medikit.FBX`, `item_ammo_box.FBX`, `item_ammo_crate.FBX`; `weapons/weapon_welder.FBX`, `weapon_wrench.FBX` | Medical kit, equipment crates, Workshop/Maintenance tools and mission technicians. Source loose-item files remain hand-fit/rest-pose candidates. |
| **K** = `unity/OrionisArtLab/Assets/Kevin Iglesias/Human Animations/Unity Demo Scenes/Human Crafting Animations/Prefabs/Tools/` | `Human_Hammer.prefab`, `Human_Pickaxe.prefab`, `Human_Axe.prefab`, `Human_Basket.prefab`, `Human_Bucket.prefab`, `Human_FishingPole.prefab`, `Human_Plow.prefab`, `Human_WateringCan.prefab` | Maintenance/Workshop/construction and offworld industrial or rural dressing. Hammer/Pickaxe/FishingPole have reviewed hand attachment studies; other grips remain unreviewed. |

Generic FX supplies dust, smoke, fire, fog, rain, snow, blood, leaves and water
effects. Prototype adds explosions and glow rings. These suit existing authored
damage/incident/weather states; use no smoke/radiation or glow to disclose hidden
Reality. Prototype Icons (159) are UI/debug candidates, not room furnishings.
Sports equipment, joke crates/notes, the sports car, skeleton/magic and fantasy
weapons have low priority for the current rooms. Retain them for an explicitly
authored setting rather than forcing them into SGC.

## All 22 authored base rooms

Every room can share the GB shell, G lights/ventilation and the lab's CT lamps.
Below, **sprite keys** refer to the current registry, not new file names.

| Authored room ID | Recommended available 3D candidates | Existing 2D support / remaining gap |
| --- | --- | --- |
| `analysis` | G table + screen + shelves, bottles, papers; T wrench only as appropriate dressing | `test-rig`, `workbench`, `terminal`, `floor-lab`, `floor-room-analysis`. Dedicated measurement instruments, sample rack and rifle mounting jig still need 3D work. |
| `containment` | GB enclosed shell, G keypad/switch; restrained closed crate as temporary storage proxy | `floor-room-containment`; `containment-cabinet` is **disabled**, so it is an unapproved candidate, not an active solution. Proper secure cabinet/chamber missing in 3D. No scientific examination dressing implied. |
| `cultural_platform` | G plinths/statues/pots, table/chair; P microphone/flagpole if suitable | `floor-room-cultural-platform`, `diplomat`. Exhibit composition needs authored subject selection; avoid inventing alien exhibits. |
| `data_storage` | G screen, keypad, shelves, papers and table | `terminal`, `console`, `evidence`, `floor-room-data-storage`. Dedicated server/archive racks missing; shelving is only a visual proxy. |
| `equipment_storage` | G shelves/crates, T ammo box/crate; P rifle/pistol/knife as generic display | `storage-rack`, `crate`, `floor-room-equipment-storage`. Weapon rack/locker model missing; do not duplicate actual equipped items as physical inventory. |
| `gate_room` | GB floor/pillars, P barrier, G screen/keypad for peripheral control points | `gate`, `gate-open`, `console`, `floor-room-gate-room`. No finished 3D Stargate, chevrons, event horizon or matching ramp; torus is blockout only. |
| `generator` | B pipes/valves/beams, G switches/screens/ventilation | `generator`, `floor-room-generator`. Dedicated generator/reactor remains a 3D gap; aircon is not a substitute. |
| `holding` | GB walls/door + P window bars, G chair/table; G keypad | `holding-bench`, `security`, `floor-room-holding`. Bench/cell-door/restraint fixtures missing as dedicated 3D models. Do not assume every Holding layout is a barred prison. |
| `infirmary` | G medkit/bottles/table/shelves; T medikit, existing Medical actor | `bed`, `medical`, `floor-room-infirmary`. No dedicated 3D hospital bed, cot, monitor or treatment station found. |
| `living_quarters` | G chair/table/mug/clock, shelves and personal boxes | `bunk`, `bed`, `floor-room-living-quarters`. Beds, bunks and wardrobes remain 3D gaps. |
| `maintenance` | K hammer/pickaxe/bucket; T wrench/welder; G table/shelves; B pipes | `workbench`, `storage-rack`, `floor-room-maintenance`. Toolboard and maintenance bench need composition or a new model. |
| `material_storage` | G shelves, crates, sacks and metal barrels; P metal plates | `storage-rack`, `crate`, `floor-room-material-storage`; existing modular storage PNG/door study. Distinguish materials through authorized presentation, not invented resources. |
| `ration_storage` | G shelves/boxes/sacks; food/bottles only as selected dressing | `storage-rack`, `floor-room-ration-storage`. No dedicated cold-store/MRE pack found. |
| `ready_room` | G table/chairs, screen/papers, shelves; T equipment crate; existing team actors | `console`, `crate`. No active `floor-room-ready-room` key found; briefing display, lockers and room-specific layout need composition. |
| `receiving` | G table/screen/crates; P cones/barrier; G medkit for handling context | `workbench`, `terminal`, `crate`, `floor-room-receiving`. Receiving inspection/scanning station absent in 3D; keep presentation to intake/handling rather than Analysis. |
| `research` | G table/chair/screen/papers/shelves; Scientist actor | `research-desk`, `terminal`, `floor-room-research`. Good basic office composition; specialist desk model missing. Research works on Thesis records, not a specimen placed on a bench. |
| `response_room` | G screen/chairs/shelves; T ammo crate and existing Soldier actors | `security`, `floor-room-response-room`. Ready seating/lockers missing; prop weapons do not grant configured Tool Services. |
| `supply_storage` | G boxes/crates/sacks/shelves; T ammo crate only for an equipment-appropriate visual | `crate`, `storage-rack`, `floor-room-supply-storage`. No pallets/trolley/forklift found. |
| `tech_platform` | G table/screens/keypad, B pipes, T tools, generic plinth | `test-rig`, `console`, `floor-room-tech-platform`. Platform-specific apparatus lacks a dedicated 3D model; visual hardware cannot define new capability. |
| `warehouse` | G shelf/crate/box/barrel presets; P barrier/cone for staging | `storage-rack`, `crate`. No active dedicated Warehouse floor key or pallet-handling equipment found. Preserve legal access/storage clearances. |
| `workshop` | G table/shelves/screen, K hammer, T wrench/welder, B pipes, P metal plates | `workbench`, `test-rig`, `floor-room-workshop`. No dedicated machine tools or shielded electrodynamics station found. Generic tools do not supply specialized Services. |
| `communications` | G screen/table/chair/keypad, P microphone/stand; existing seated/talking actor studies | `terminal`, `console`. No active dedicated Communications floor key, radio rack or antenna model found. |

## Mission locations: Missing Operative

Source: `demos/shared/data/offworld/missing-operative-001.finalized.json`.
These suggestions follow actual Stage/instance IDs, including the recently
authored lab and hidden areas. Hidden assets appear only when existing
visibility/detection permits; scenery must not advertise hidden rooms or loot.

| Stage ID | Useful assets | Mission-specific limits / missing asset |
| --- | --- | --- |
| `stage-gate-yard` | E ground/rock/vegetation, GB platform; P barrier if consistent with yard; `gate`/`gate-open` sprites | `gate-01` needs the same missing 3D Gate solution as the base. Outdoor use does not imply new cover or obstacles. |
| `stage-outer-yard` | G crates/barrels, P barrier/cones, E ground; Toon Worker/Guard outfits | Supports the four authored workers/guards. Keep their identities, disposition and access routes driven by mission data. |
| `stage-main-hall` | GB straight/corner/door shell; G wall lights/keypads; `door`, `security`, indoor floor sprites | Three authored controlled exits must stay distinct and readable. Props cannot create new doors. |
| `stage-holding-area` | G medkit/bottles/chair, T medikit and equipment crate; Medical/Worker/Guard actors; `bed`, `medical`, `holding-bench`, `crate` | Three patients, operative, epidemiologist and other authored people/items remain separate. Beds/cots and medical devices lack 3D models. A generic patient appearance must not reveal the undercover operative. |
| `stage-processing` | B pipe/valve/beam families, G control screen/switch, metal barrels; K pickaxe, T wrench; `generator`/`test-rig` | `mining-system-01` has no dedicated 3D counterpart. Radiation and recoverable component visuals must respect current detection/Knowledge and state. No new mining machine semantics. |
| `stage-security-hall` | GB shell, G wall light/keypad; P barrier only without blocking travel; Toon Guard/Captain | Two guards and Reynolds are distinct authored actors. Existing guard/defeat animation studies are relevant; do not infer state from decorative weapons. |
| `stage-overseer-office` | G table/chair/screen/papers/shelves/chest; Captain appearance; `terminal`, `evidence`, `security` | Map `security-terminal-01` and `evidence-archive-01` separately. McGuffin remains a person, not a desk prop. Evidence destruction requires authored runtime state. |
| `stage-hidden-store` | G shelves/crates/boxes, T ammo crate if styled as generic sealed equipment | `equipment-crate-02` is the authored recoverable container; extra dressing must not become extra loot. Keep room and contents hidden until permitted. |
| `stage-hidden-safe` | G chest + keypad as temporary secure-container composition; `evidence`/`crate` sprites | No actual 3D safe found. Preserve distinct `safe-intel-01` and `safe-loot-01`; exterior depiction must not reveal contents. |
| `stage-analysis-lab` | G table/screen/papers/shelves/bottles; P generic rifle only as explicit proxy; `test-rig`, `workbench`, `terminal`, `storage-rack`, `evidence` | Compose distinct instrument bench, test-log cabinet, rig-parts shelf, sample rack and report terminal. Missing: real cabinet, sample rack, instrument rig and mounted alien rifle. Keep `lab-mounted-rifle-01` distinct from generic gun dressing and `lab-report-01` distinct from its terminal. |

## Mission locations: Last Transmission

Source: `demos/shared/data/offworld/last-transmission-001.finalized.json`.
Use the authored player labels and scenario meaning, not the borrowed archetype
name alone: the maintenance shelter uses `stage_medical_holding`, for example.

| Stage ID / label | Useful assets | Mission-specific limits / missing asset |
| --- | --- | --- |
| `relay-gate-clearing` / Gate clearing | E dirt/grass/rocks/bushes; Gate sprite | No finished 3D Gate. Preserve clearing and deployment access. |
| `relay-approach-trail` / Mountain approach | E dirt ground, gravel roads, hills, cliffs, mountain/background-mountain, rocks and vegetation | Outdoor trail, not an indoor corridor despite `stage_hallway_basic`. No climb/elevation mechanic inferred from a cliff prop. |
| `relay-courtyard` / Relay courtyard | GB exterior walls, E ground/ivy, G crates/barrels, P barrier; Toon Guard/Captain studies for salvagers | Rhel and two salvagers are the authored actors. Do not make neutral armed salvagers visibly hostile by default. |
| `relay-control-room` / Control room | G screen/keypad/table/chair/papers; `terminal`, `console`, `evidence` | Transmission log is authored; consoles/screens are dressing unless bound to an existing interaction. Dedicated relay/radio hardware missing. |
| `relay-maintenance-shelter` / Maintenance shelter | GB shelter shell, G table/crates, K bucket, T wrench/medikit; injured-person pose; `bed` sprite if required for presentation | Taren is the authored injured operator. No dedicated cot in 3D; do not populate a medical ward just because the Stage archetype is medical Holding. |
| `relay-generator-room` / Generator room | B pipes/valves/beams, G switches/screen, T wrench, controlled damaged-shell/smoke presentation; `generator` sprite | Vessa is the authored trapped engineer. Dedicated generator remains missing; fire/smoke only where supported by incident/state, without obscuring the rescue interaction. |

## People, actions and other asset families

Keep the already selected six profession outfits and Worker/Guard/Captain
studies in `artwork/toon-soldiers-proof/profession-picks.json`. Their common
movement, work and conversation shortlist is more useful now than adding a
second character system. Generic business/jumpsuit/peasant/prisoner characters
are possible future civilian variants, but require style/rig review and must
not reveal hidden identity or role. Toon demo models and full-pack models are
alternatives, not bodies to render together.

Kevin crafting clips fit Maintenance, Workshop and authored industrial work;
soldier clips fit Response/Ready Room and mission security; common idle/walk/
turn/talk clips fit every staffed room. CaD dialogue/reaction studies suit the
office, yard, Holding and relay conversations. Existing death/interact reviews
are relevant to persistent defeated guards and prop interaction. They do not
establish carrying, treatment, terminal-use or rifle-jig animations that have
not actually been reviewed. Consult `game-actions-catalog.json`,
`additional-props-catalog.json`, `death-interact-coverage.json` and
`cad-use-review.json` in `artwork/toon-soldiers-proof/` for exact sources/limits.

The original Technician is an alternative pipeline proof. Zombie TDS art and
older jointed sprite rigs are alternative 2D character sources, not room kits.
The Bloons reference material is reference-only and is excluded from reuse.
Existing generated/registered PNGs can guide model shape or remain in the 2D
simulator; a sprite is not a ready mesh, and historic/disabled variants are not
silently re-enabled.

## Suggested next art batch

1. Register GB floor/wall/pillar/door bounds in the isolated Room Art Lab and
   compare against the current topology, split doors and CT caps.
2. Preview G shelves/crates/table/chair/screen/keypad/medkit together. Start
   with Material Storage/Receiving, Research/Communications and the mission
   office/lab so the same reviewed components serve several locations.
3. Preview E ground/rock/cliff/vegetation with a simple exterior shell for the
   two Gate clearings, outer yard, relay courtyard and mountain approach.
4. Author or source the actual missing focal pieces: Gate, bed/bunk/cot,
   containment cabinet, generator/mining system, laboratory rig/sample rack,
   safe, equipment lockers and communications hardware. Existing 2D shapes
   provide project-specific reference for most of these.

This is a presentation plan. Furniture does not grant Services, Theory,
inventory, storage capacity, encounter cover or mission interactions. No
architectural rule conflict was found; specialist 3D asset coverage and
registration/visual verification remain the concrete gaps.
