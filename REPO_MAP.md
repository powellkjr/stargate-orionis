# Repository Map — start here

Authored-flow review: [generated diagram index](docs/generated/flows/README.md).
`node tools/export-flows.mjs` exports all authored dialogue/mission processing
and shared base processing graphs; `--render` uses local Java/PlantUML, `--check`
verifies freshness, `--mission`/`--out` select another source/output directory.
`node --test tools/export-flows.test.mjs` checks coverage, references and escaping.
Snapshot generation/check includes these diagrams. `Editor/AuthoredFlowBuild.cs`
regenerates them before every Unity player build and renders PNGs when the local
PlantUML jar exists (`PLANTUML_JAR` or ~/Downloads/plantuml-1.2024.6.jar). Missing
Java/render failures with an available jar fail the build with diagnostics;
without a jar the required .puml export still runs. Authored source diagrams
include unported Unity content and never imply automatic physical item routing.

Independent room presentation work: `unity/OrionisRoomArtLab/README.md`.
Separate Unity6000.5.2f1 project and Editor; **Orionis > Art > Room Art Lab**
opens an isolated Edit-mode preview. WavesA/B use primitive floor/junction/
three-segment-wall/centered-door modules and data-derived physical/joined sizes.
Joinable rooms default to `A A B / A A B / C C D` comparison; individual sizes
remain selectable. Doors have two sideways sliding leaves.
Exterior non-door wall caps show simulator-style inset CT1 amber singles,
CT2 cyan pairs and CT3 long purple lamps; visibility is independently toggleable.
Right-side Room assets browser indexes the audited art with All/Used/Assigned,
search/category filters and saved art assignments for22 base rooms/16 mission
locations (`ProjectSettings/RoomArtAssignments.json`), seeded with231 provisional
choices. Drag props/images into the preview; select/drag/rotate/scale/remove them.
`ProjectSettings/RoomArtPlacements.json` persists room/layout-specific placements.
Mission targets display authored Stage footprints. `stage-assets` copies local
Synty art unchanged into this lab only; source materials remain untouched.
Vertical orbit dragging increases pitch when dragging down.
`node unity/tools/room-art-lab.mjs stage|--check` projects the validated room
catalog and game's pure `Domain/RoomJoinGeometry.cs`; `status|refresh|open|test|cancel-tests`
targets only this lab's verified descriptor. Node projection check:
`node --test unity/tools/room-art-lab.test.mjs`; Unity tests are in this project's
`Assets/RoomArtLab/Tests/Editor/`. Structural mapping and detailed tuning follow later.
Do not operate the game or character Editor for room-art preview work.
Structure-only game handoff: `docs/room-structure-game-handoff.md` contains the
copyable game-chat request, exact wall/door/CT lamp geometry, source paths,
base/mission authority boundaries and integration acceptance checks.
Available art audit: `docs/room-asset-audit.md` maps installed/cached art to all
22 base rooms and16 mission locations, with exact candidates and missing3D
pieces. `docs/room-asset-inventory.json` records source paths and sprite status.

Unity shared art: `node unity/tools/presentation-art.mjs` copies active registered
simulator PNGs into `Assets/Orionis/Resources/OrionisArt`; `--check` verifies source
hashes and catalog freshness. `PresentationArt.cs` is visual-only, with an
Art/Schematic preference and existing-card fallbacks. Regenerate while Play is
stopped, then restart Play after changing the shared art catalog.

Unity Offworld follow-up: safe packages project into mission cargo from the shared
authored physical instances. `CargoProcessingReader.cs` imports all caches for
Analysis; `CargoPanel` has a cross-room cargo locator. Save33 persists new battle
target seeds while historical battles keep roster-order outcomes. Main focused
routes remain `SpatialPlanningTests.SharedHexesSelectActorsStoreLootIsReachableAndDefeatedGuardsStayDown`
and `DeploymentSceneTests.FullRescueReturnsToSgcAndResetAllowsReplayThroughActualControls`.
Mission lab work-group/device/report projection is in `MissionFieldWorkflows.cs`
and the snapshot exporter; schema34 adds sticky parallel assignments and bounded
schema33 compatibility. `MissionDialogueView.cs` provides readable response and
speaker controls. `Presentation/Structure/` projects the isolated lab's pure
wall/door/CT geometry onto existing canvas maps, with no vendor assets. Base
door cell anchors and mission CT are missing; see the structural handoff.

Original 3D Technician proof: `artwork/technician-proof/README.md` indexes the
Blender source/rebuild script and validation evidence. Unity assets live in
`Assets/Orionis/Art/TechnicianProof/`; **Orionis > Art > Build and verify Technician
proof** regenerates the isolated overhead scene and import/animation checks.
**Open Technician proof** opens the scene for Idle/Walk Play preview. It does not
replace Bootstrap or add a build scene. Reference-only BTD6 assets are separate.

Independent character/animation work: `unity/OrionisArtLab/README.md`. This small
Unity project runs in its own Editor alongside the game, with separate Play mode,
compilation, URP forward renderer and automation descriptor. Use its own
`Library/Pipeline/.unity-pipeline-port`; verify projectPath before commands.
Toon Soldiers Demo evaluation and captures: `artwork/toon-soldiers-proof/`.
Do not drive the main-game Editor for further animation work.
`node unity/tools/art-lab.mjs status|verify|open|play|stop` explicitly targets
Art Lab and rejects a mismatched project descriptor; `job <id>` reads results.
The default `GameActions` scene has one modular full-pack infantry character,
view/playback sliders, six profession and three NPC (Worker/Guard/Captain)
body/head/backpack/palette presets and 150
movement/combat/work/social studies. Profession-specific candidate actions and
missing-motion/prop notes are explicit; see `profession-picks.json` and the lab
README for the current choices. Equipment
switches via per-profession `equipmentSlotMap` between None and 17 weapon types (Rifle, Hammer, Pickaxe, Fishing pole, Assault Rifle B, Grenade Launcher, Heavy Machine Gun, Mini Gun, Rocket Launcher, Shot Gun, Sub Machine Gun, Flamethrower, Welder, Wrench, Medigun, Needle Gun, Crossbow, Knife, Sniper Rifle, Handgun, Revolver). See `profession-picks.json`.
Idle/transition variants, sheathe/draw pose studies, fishing and deaths are
included; one-shot studies default to no repeat. Deaths/Interacts filters expose
all 51 death and 14 interaction clips on any preset; coverage is recorded in
`death-interact-coverage.json`. Weapon-family fit limitations are shown per clip.
`verify-viewer`
checks exact clips, motion, single body/head rendering and equipment cleanup;
`capture` checks the live render. Full-library browsing is explicitly unreviewed.
The separate **Try character parts / colors** panel explores all modular bodies,
heads, backpacks, hand props and supplied body/head palettes. `verify-parts`
checks those choices and reset/cleanup; `parts-catalog.json` records the assets.
Its **Other props** tab also exposes prior crafting/melee/soldier/archer/throwing
props and Toon loose items as reviewed hand tools or staged reference displays.
Combat and Dialogue vol.1 adds a **Dialogue** shortlist filter and full-library
source variants. `cad-use-review.json` records choices/gaps; `verify-dialogue`
checks all182 new clips. Source filename labels disambiguate `Unreal Take` clips.
The older broad study uses `build-library|open-library|verify-library` instead.

Compact navigation for chats, Codex and other coding agents. Paths below are
relative to the repository root; resolve them against your checkout. This is an
index, not new game-design authority. Update pointers when moving systems.

## Minimum context / read order

1. [AGENTS.md](AGENTS.md): mandatory working rules and semantic boundaries.
2. This map: choose the subsystem relevant to the request.
3. [CURRENT_TASK.md](CURRENT_TASK.md): active Offworld work and milestone history.
   Earlier entries describe past blockers; prefer its current status and newer
   explicit user decisions. It is not a global backlog for every simulator.
4. Read the selected subsystem's README, implementation, fixture and nearest
   tests—not every document. Inspect `git status --short` before editing.

Design approval, fixture authoring and runtime implementation are separate.
[Simulator decisions](docs/simulator-decisions.md) records recent decisions,
including ones not yet implemented. Verify code/tests before claiming support.

## Run and validate

- All seven demos: `node demos/serve.mjs` from the root; open
  `http://127.0.0.1:8001/demos/`. Optional port: `node demos/serve.mjs 8000`.
- [Demo hosting/save guide](demos/README.md): local JSON writes versus static
  hosting. Static hosting does not implement the writable API.
- Plain browser JS/ES modules and Node built-in tests; no root package manifest
  or npm install/build step is required for these demos.
- All Node tests: `node --test demos/mission-authoring-simulator/*.test.mjs demos/serve.test.mjs demos/offworld-sandbox/*.test.mjs demos/portrait-simulator/*.test.mjs demos/room-sandbox/*.test.mjs demos/room-staffing-demo/*.test.mjs demos/world-map-simulator/*.test.mjs demos/sprite-viewer/*.test.mjs`
- Mission Author draft review: `node --test demos/mission-authoring-simulator/*.test.mjs`; see its [README](demos/mission-authoring-simulator/README.md). Launch `/demos/mission-authoring-simulator/` for author review/import/export.
- Mission Author playable workspace: `demos/mission-authoring-simulator/playable.mjs`
  and `playable-app.mjs`; edit/import/validate/export the existing Offworld JSON
  format. Semantic Draft finalization remains separate and unresolved.
- Ready authored mission: `demos/shared/data/offworld/last-transmission-001.finalized.json`;
  Mission Author starting-point selector → Load selected mission → Save ready
  mission JSON → Offworld Load finalized mission. Full runtime route tests in
  `demos/mission-authoring-simulator/last-transmission.test.mjs`.
- Browser checks: `node demos/offworld-sandbox/browser-smoke.mjs` and
  `node demos/portrait-simulator/browser-smoke.mjs` and
  `node demos/mission-authoring-simulator/browser-smoke.mjs`. These launch Windows Edge;
  `EDGE_PATH` overrides its executable. Read the scripts for environment details.
- Syntax/diff: `node --check <changed-js-file>` and `git diff --check`.
- Save/browser tests should use temporary files or intercepted endpoints, not
  silently change authored JSON in the real checkout.

Unity base operations: shared `base-execution.json`/schema projects Actor ordering,
Response identity and the existing Human II Workshop Group Tool mapping.
`Domain/BaseWork.cs` owns eligibility/source and configured Tool resolution;
`Domain/BaseOperations.cs` queries work and archives immutable completion snapshots
without executing Recipes. Schema31 retains completed history after routing/reset/
redeployment, with ongoing/newest-first ordering. `BaseOperationsPanel`
provides filters/navigation/pause controls; `BaseServicesView` displays configured
room/group capability. Schema30 persists Response posture. Construction Tier
never implies Technology Tier; unavailable tooling is not silently granted.

## Simulator entry points

Receiving Core first-pass authoring: [values and runtime boundary](docs/unity-receiving-cores-first-pass.md).
Core definitions/install Recipe stay in the shared theory fixture; physical
items use `item.json`; `receiving-core-prototype.json`/schema holds T0, power,
slots, starter IDs and capability preferences. Unity projects `roomCoreSetup`;
Receiving runtime ownership, installation and power now use `Domain/RoomCores.cs`,
`Infrastructure/RoomCoreReader.cs` and `Presentation/RoomCorePanel.cs`. Schema29
persists Core identities/reservations; cache recovery captures allocation at open.
Group Tools/Response/technical consumers remain Wave3. The reference cache is now
Medium (10 bubbles); started old saves retain the pinned historical graph.

Cargo conversion authoring: [cross-chat handoff](docs/cargo-conversion-authoring-handoff.md)
indexes exact shared schemas, current resource/storage categories, missing
quality/size/yield definitions, required examples and Unity migration dependencies.
Four quality/four size levels and common ranges are proposed, not numeric canon.
The newer [supplied cargo handoff](docs/orionis-cargo-shared-schema-handoff-unity-migration-wave-0.md)
locks the ranges and formulas; [implementation/reconciliation](docs/shared-cargo-reconciliation.md)
supersedes those older proposals. Shared authority is `resource-cargo-economy.json`
and its schema; pure calculations/tests are `demos/shared/js/resource-cargo.mjs`
and `resource-cargo.test.mjs`. Unity imports the same catalog. This is the
economic/schema foundation. The Processing Room route additionally uses shared
`resource-cargo-playtest.json`/schema for the provisional recovery graph, and
Unity `Domain/ResourceCargo.cs` with the shared `BubbleExecution` transaction
kernel for field findings, progressive Supply deposits and pending-output retry.
Save25 additionally persists progressive rock-clearing credits and explicit Tool
refill history; older saves migrate without duplicate payouts. Shared personnel
loadouts provide nine charges per configured Tool slot. See the
playtest guide for the cache branch; critical/special and fixed-rock scenarios
remain unfinished.

Unity personnel continuity: `Domain/PersonnelCondition.cs` stores per-Unit health,
stamina/endurance and existing Tool IDs/condition/charges between sorties.
Debrief **Prepare redeployment** starts a fresh attempt using those records and
current issued equipment. **Reset mission** remains a debug reset. Schema 20
persists the records and member starting health; versions 1–19 retain their
current expedition without invented prior sorties. See the migration plan.

Unity [Equipment Storage browser](docs/unity-equipment-storage.md): click the
Equipment Storage room footprint for tabbed physical inventory and capacity.
Weapon/armor slots, provisional stats, personal custody and deployment snapshots:
`Domain/UnitEquipment.cs`, `Infrastructure/UnitEquipmentReader.cs` and
`demos/shared/data/unit-equipment-prototype.json`. Save schema 19 preserves
validated Equipment Storage assignments while custody belongs to a Unit.

Current Unity cargo flow: [validated storage, staffed Analysis and Equipment
Storage](docs/unity-cargo-routing.md), save schema 19. Containment is storage
only. Analysis holds temporary custody and preserves reserved fallback storage;
`Domain/CargoExamination.cs` owns the bounded instance-property work.
`Presentation/CargoPanel.cs` provides Base inventory and physical-room custody
tabs; select a room -> Open room inventory. Completed Analysis remains in lab
custody until returned to storage. `MissionMapView.cs` / `MapActionHex.cs` expose
Stage action hexes using the existing detailed mission controls and commands.

Unity migration: [active critical path](docs/unity-migration-plan.md#active-priority-complete-the-playable-mission-loop).
The technical rescue/equipment/redeployment loop is implemented. Five remaining
outcome-based waves cover repeat-sortie resources/preparation, a standalone
playable build, base expansion, technology progression and the wider campaign.
The first two complete the playable slice; the active plan supersedes old “next”
entries in [preserved migration history](docs/unity-migration-history-2026-10-20.md).
The existing demos remain behavior references; the Wave 0 audit is historical.
For base work, the [Receiving/item gap audit](docs/unity-receiving-gap-audit.md)
maps the existing rifle/vest definitions, bindings, process snapshots and Recipe
requirements to the remaining authoring and Unity integration work.

CT1 balancing: [approved capacities and construction estimates](docs/room-capacity-standardization-checklist.md).
Shared room data now uses the corrected two-staff/two-Core baseline plus explicit
exceptions. New-room quotes are 24-48h; existing saves have a capacity migration.
Ready Room rosters are 4/5/6 by CT; mission checkboxes select at most four, with
reserves retained. Mission XP awards remain pending. Construction now executes through staffed Maintenance.

Construction pricing: shared `demos/shared/data/room-construction-prototype.json`
with `room-construction.schema.json`; `demos/shared/js/room-construction.mjs`
computes per-slot work/Supply and additional-capacity upgrade estimates.
Focused check: `node --test demos/shared/js/room-construction.test.mjs unity/tools/bootstrap-snapshot.test.mjs`.
Unity imports pricing and provisional execution. `Domain/RoomConstruction.cs` owns
Supply, cleared rock cells and persistent sites. `Domain/TerrainClearing.cs`
executes eight one-tick UNTRAINED bubbles through available Maintenance staff
in parallel, awarding Supply only on completion. Save schema23 retains bubble
Actor history and reads schema21/22 construction without repeating old outputs.
Maintenance resolves eligible permanent staff automatically (no Technician
chooser), using separate Soldier security and Technician/TET1 bubbles;
`BasePlanningPanel` shows profession-colored progress and simulator categories.

Unity base expansion: `Domain/RoomPlanning.cs`,
`Infrastructure/RoomPlanningReader.cs` and `Presentation/BasePlanningPanel.cs`.
`bootstrap-snapshot.mjs` projects all shared room profiles into a separate
read-only `roomPlanning` catalog without changing campaign save fingerprints.
Base map -> **Base planning** shows tier/staff/Core envelopes and validates a
proposed footprint. Build executes Supply-funded work; previewing alone makes no
state change. Manage mode upgrades physical rooms and joins/splits ordered Groups.
`Domain/RoomGroups.cs` keeps child identity and destination-first Group staffing.
Core installation, Group Tools, Response resolution and salvage remain pending.
New construction/upgrade orders use the shared `execution.generalWorkShare`
policy:80% general work,20% specialists including security. `RoomConstruction`
uses `BubbleExecution`; save28 persists sticky Actors and parallel bubble work.
Older serial orders retain their original schedule. Manage shows valid per-target
Join/Split actions only while enabled.
Global resource totals: `Presentation/ResourceHeader.cs`; reusable animated
construction/clearing cards: `ConstructionProgressView.cs`,
`TerrainClearingProgressView.cs`, and the single-mesh `RecipeProgressGraphic.cs`;
base speeds1x/4x/8x/16x.

Windows playtest: **Orionis > Build Windows Slice** (Edit mode) invokes
`Assets/Orionis/Editor/WindowsSliceBuild.cs`, which builds Bootstrap into
`unity/StargateOrionis/Builds/Windows/`. Its shared pre-build callback generates
flow diagrams, then validates snapshot freshness; stale game data still blocks
the player build while leaving newly generated diagrams available for review.
`Presentation/PlayerSaveVerification.cs` is an opt-in player
check: `--verify-session` selects a temporary save, and `--verify-phase save`
then `load` verifies two separate launches without using the normal slot.
The existing `DeploymentSceneTests.FullRescueReturnsToSgcAndResetAllowsReplayThroughActualControls`
is the supported rescue/cache/rifle/equipment/redeployment control walkthrough.
[Player guide](docs/unity-playtest-guide.md) covers the supported route and saves.
Standalone debug controls default off; its `campaign-save.json` is separate from
the Editor's `prototype-save.json`. Both retain explicit Save/Load.

Unity bootstrap: [project instructions](unity/StargateOrionis/README.md), Editor
`6000.5.2f1`, Universal 2D. Open the project in Hub, then **Orionis > Open
Bootstrap** and Play. `node unity/tools/bootstrap-snapshot.mjs` exports validated
room/roster display data; `--check` detects stale output. C# selection/import
checks use Unity Test Runner (EditMode/PlayMode). The top Save/Load controls
persist the current room/roster slice, RNG state and selection to a versioned
local prototype slot. Schema 16 persists SG teams, mission Team ID, manual Unit-to-room assignments,
Receiving inspection progress/Actor/custody references, planned staffing moves
and nullable expedition party/Tool/Gate/travel/conversation/field-work/combat state,
with explicit migrations
from earlier prototype saves. Staffing controls
use authored capacities; see `Domain/Staffing.cs` and `Presentation/StaffingPanel.cs`.
`Domain/StaffTransfers.cs` reserves destination places for after-next-tick or
finish-step moves; cancellation and invalid replacement checks preserve work.
Run/Pause, +1 tick and 1x/4x controls
exercise the three-minute clock and Receiving work. `Domain/ReceivingWork.cs`
owns the bounded tick transactions; provisional tuning lives in
`demos/shared/data/receiving-prototype.json`. Full scheduling policy, inventory
routing and later mission field work/rescue remain pending. **Mission briefing**
opens team selection; deploying 1–4 available Units shows the Gate-arrival view.
`Domain/Expedition.cs` owns deployment and Gate choice/redial; `MissionReader.cs`
imports the bounded mission projection after the JS compiler validates the full
source mission. `Domain/MissionTravel.cs` and `Presentation/MissionTravelPanel.cs`
provide the original entry route/conversation. `Domain/MissionField.cs` adds the
authored Holding door hack, passive identity and first contact/objective state;
`FieldReader.cs` and `FieldSave.cs` import/persist that bounded four-Stage route.
`TravelReader.cs` and `TravelSave.cs` validate travel/dialogue. The exporter pins
the old entry projection in `unity/tools/fixtures/bootstrap-before-holding-route.json`
for schema-7 migration. Other branches remain unimplemented. First contact cannot repeat
until its possible guard escalation is supported.
`Presentation/MissionMapView.cs` draws known authored Stage footprints, the team
marker and doors on a simple grid. Adjacent open-room clicks use the same
application move command. `MissionMapReader.cs` validates the separate
`missionMap` geometry projection, which stays outside simulation/save fingerprints.
`Domain/MissionCombat.cs` provides bounded Yard/Holding guard encounters using
authored stats and deterministic round replay. `CombatPanel.cs` presents rounds;
the entire encounter (including disengagement/defeat) commits one tick through
the shared base-work/transfer transaction. `CombatReader.cs` imports separately
fingerprinted `missionCombat` definitions. Map badges show guard clearance, not
full medical/evacuation readiness. Surrender, automatic escalation and recovery
remain pending; the supported rescue/extraction path is described below.
`Domain/MissionCare.cs` derives patient conditions/medical Incident resolution
from the shared field-work ledger and checks secure evacuation routes. The
Holding **Patients & evacuation** panel offers the three authored Medic/MET1
stabilizations and route blockers. Treatment can trigger the authored suspicion
threshold encounter; other automatic escalation is still pending.
`Infrastructure/CareReader.cs` imports separately fingerprinted `missionCare`.
`Domain/MissionRescue.cs` / `Infrastructure/RescueReader.cs` add the supported
operative departure, AT_GATE/EXTRACTED state and persistent returned-mission
debrief. The party must physically return and redial to extract. **Reset mission**
beside Save/Load clears the prototype attempt without writing the saved slot.
SG team/Ready Room integration: [contract and workflow](docs/unity-ready-room-plan.md).
`Domain/SGTeams.cs` and `Presentation/ReadyRoomPanel.cs` implement permanent,
exclusive four-slot teams, physical Ready Room r6, saved designations/member order
and team-based mission assignment. Membership locks offworld and survives return
and Reset mission. The room is 1×1/CT1 with no Cores, stacking or joining.
`unity/tools/fixtures/bootstrap-before-ready-room.json` pins migration from the
old five-room base without inferring teams or changing its active expedition.
Starting-base storage: [room definitions, limits and remaining cargo work](docs/unity-storage-rooms.md).
Material Storage r7, Supply Storage r8, Equipment Storage r9 and Containment r10
are added below the work rooms; Warehouse r11 provides provisional 20-place
temporary holding, separate from accepting equipment for SGC use. `Domain/RoomStorage.cs` and
`Infrastructure/RoomStorageReader.cs` import their read-only configured limits;
selection shows EQ/CC tabs and bulk capacity. Occupied inventory/admission and
general offworld-item custody transfers remain pending. The first bounded crate/rifle
recovery is now implemented; see [cargo playtest and limits](docs/unity-cargo-recovery.md),
`Domain/RecoveredCargo.cs`, `Infrastructure/CargoReader.cs` and `Presentation/CargoPanel.cs`.
The same source IDs move through debrief, incoming inventory, Receiving and compatible
Containment, with a separately fingerprinted cargo ledger.
[Handling review and Warehouse](docs/unity-warehouse-clearance.md) now add
`Domain/CargoHandling.cs` / `Infrastructure/HandlingReader.cs`: authored safe/intact
findings, temporary Receiving custody with primary CC reservation, Warehouse
capacity and separate retention intent. Equipment clearance/issuing remains pending. The exact previous six-room
fixture is pinned in `unity/tools/fixtures/bootstrap-before-storage-rooms.json`;
schema-12 migration retains SG teams and active mission identity.
`bootstrap-before-warehouse.json` pins the ten-room schema-13 migration.
`previousProgressionSnapshot` retains original-roster save compatibility while
fresh Unity playtests use the separate all-tier-III override.
Clock/save/session boundaries are in `Assets/Orionis/{Domain,Application,Infrastructure}`.
Roster name selection is shared in `demos/shared/js/personnel-roster.mjs`; its
deterministic shuffle uses the existing pools without repeating the first surname
for a whole Profession. Automatic `Sr.`/`V.` progression suffixes are removed;
name-only save compatibility is pinned to `unity/tools/fixtures/bootstrap-before-suffix-cleanup.json`.
Checks: `node --test demos/portrait-simulator/personnel-roster.test.mjs`.

Separate character cutout study: [Character sheet preview](demos/character-sheet-preview/README.md),
now authored SCML rigs and original transparent parts workbench at `/demos/character-sheet-preview/`.
Local purchased pack is Git-ignored; import with `python demos/character-sheet-preview/import-pack.py`.
Sampler: `spriter.mjs`; browser UI: `app.mjs`. No live character registry changes.
`normal-walk.mjs` derives the default unarmed loop from purchased rig parts,
with authored bat upper-body geometry and rifle legs; source animations preserved.
Backpack-free shirt fitting uses separate vertical leg lanes with continuous strides and corrected sleeve interpolation.
Optional side-specific plain limbs: `python demos/character-sheet-preview/prepare-plain-limbs.py`
exports local native-vector cleanup, short/long sleeves, masks and a before/after sheet into the ignored purchased pack.
Preview sidebar tiles choose each left/right upper arm, forearm and leg independently; styles preserve authored rig registration.
Torso tiles compare authored backpacks with local recolorable shirt surfaces for both characters.
Six profession clothing studies per character add editable vector details via `clothing_surfaces.py`, with existing material masks.
Checks: `node --test demos/character-sheet-preview/*.test.mjs` and
`node demos/character-sheet-preview/browser-smoke.mjs`. Does not activate a rig.

| Area | Start here | Implementation / purpose |
| --- | --- | --- |
| Demo hub/server | [demos/README.md](demos/README.md) | `demos/index.html`, `demos/serve.mjs`, `demos/hosting-status.mjs`; shared writable endpoints and static assets |
| Mission Author draft review | [README](demos/mission-authoring-simulator/README.md) | `demos/shared/mission-author/`; catalog validation, read-only adapters, deterministic selection, connected Stage/objective skeletons, source-backed Fact/clue/interaction drafts, dynamic possibilities, prospective recovery/result intent composition trace, whole-draft review/repair and Finalizer readiness report; browser UI in `demos/mission-authoring-simulator/` |
| Offworld | [README](demos/offworld-sandbox/README.md) | `demos/offworld-sandbox/app.mjs`; mission UI, deployment, movement, work, combat, dialogue and extraction |
| Sprite viewer | [README](demos/sprite-viewer/README.md) | `demos/sprite-viewer/`; manifest gallery, ZIP/folder/PNG comparison; local source saving/listing (`sources-server.mjs`, `/api/sprite-sources`), persistent rejections (`/api/sprite-reviews`, `artwork/sprite-sources/sprite-review.json`) enforced by `prepare`, automatic source reload and preview controls. Sources do not install active art. Browser check: `node demos/sprite-viewer/browser-smoke.mjs` |
| Character & portrait editor | [HTML](demos/portrait-simulator/index.html) | `demos/portrait-simulator/app.mjs`, `model.mjs`, `character-stats.mjs`; appearance, stats, progression and configured Tools |
| Room layout sandbox | [README](demos/room-sandbox/README.md) | `demos/room-sandbox/room-sandbox.js`; physical layout, joins, CT and shared base saves; `sprite-presentation.mjs` reuses Offworld image/variant/fallback primitives with schematic toggle. Checks: `node --test demos/room-sandbox/*.test.mjs` and `node demos/room-sandbox/browser-smoke.mjs` |
| Room staffing/process demo | [README](demos/room-staffing-demo/README.md) | `demos/room-staffing-demo/room-staffing-demo.js`; personnel, room processes and transfers |
| World map | [README](demos/world-map-simulator/README.md) | `app.mjs` UI; `model.mjs` geometry/network; `havens.mjs` population/economy; `address-codec.mjs` glyph addresses; `worker.mjs`/`batch.mjs` generation |

Each demo's HTML/CSS live beside its entry point. Tests are adjacent `*.test.mjs`.

## Unity offworld characters and expanded mission

Save schema32: `ConstructionState.ArchivedCargoSupply` preserves deposited
resource credits when mission Reset clears cargo. `RoomConstruction.Validate`
continues balancing stock against sites, clearing outputs and live/archived
cargo credits. Focused regression: `ResourceProcessingTests.LoadThenResetKeepsDepositsAndArchivesCreditsAcrossFurtherWork`.

Mission controls now use touching, profession-colored Actor hexes and a vector
`TravelArrowGraphic`; no second Actor picker is needed for those hexes. Combat
uses start/cancel confirmation and automatic rounds (`CombatPanel`). Inactive
character rigs retain Animator state so downed NPCs stay down. Explicit Reset
mission clears that mission's physical cargo/Receiving state, preserving base
assignments; Prepare redeployment remains the normal persistent progression path.

Hidden Store's second crate/Human coil rifle use the generic `CargoCache` groups
in `RecoveredCargo` and `CargoReader`, projected from shared mission instances.
Rock variability is authored in `room-construction-prototype.json` / its schema;
`TerrainClearing.Plan` deterministically selects 8–12 mixed 1/20-tick bubbles per
seed/cell with a Technician-I requirement. Legacy CLEAR_ROCK jobs keep their
fixed graph. Preview, progress and Operations read the same graph. Carousel
category jumps live in `BasePlanningPanel`. Focused regression:
`Tests/EditMode/MissionPolishTests.cs`.


- Shared mission projection: `unity/tools/bootstrap-snapshot.mjs`; pinned previous
  mission/combat in `unity/tools/fixtures/mission-before-offworld-expansion.json`
  supports migration. Main mission now includes ten authored stages/doors,
  four encounters and two gated worker clues; second-mission adapters remain pending.
- Art Lab idle/walk staging: `node unity/tools/offworld-characters.mjs`, or
  `--check` for the 63-file dependency manifest. Original vendor assets and
  generated Resources are excluded from Git. Rebuild main-project prefabs in
  Edit mode with **Orionis > Art > Rebuild offworld characters and motions**.
- Runtime: `OffworldCharacterPool`, `OffworldMapUnit`, `OffworldRigBindings` and
  `MissionMapView` under `unity/StargateOrionis/Assets/Orionis/Presentation/`.
  Editor importer: `Editor/OffworldCharacterImporter.cs`. Six professions plus
  Worker/Guard/Captain; seven idle/walk/social/work/fire/down states. Fixed 60-degree
  orthographic character renders preserve the 2D renderer. Map navigation:
  `MissionMapNavigation` and `MissionMiniMap`; subjects: `OffworldSceneActors` and
  `MissionMapSubjectHint`. Full sidebar actions remain visible beside door hexes.
- Setup/source presets/validation: [integration notes](artwork/toon-soldiers-proof/OFFWORLD-INTEGRATION.md).
  Focused domain coverage: `Tests/EditMode/OffworldExpansionTests.cs`.

## Offworld: where to change what

All runtime modules below are in **`demos/shared/offworld/`**:

| Module | Responsibility |
| --- | --- |
| `mission.mjs` | Compile/validate authored mission and archetypes; freeze definitions and build indexes |
| `runtime.mjs` | Deployment, clock, Gate connection, movement, visibility, return route and extraction |
| `field.mjs` | Observations, Recipe admission/execution, persistent work, one-Actor group-search jobs, effects and stationing |
| `campaign.mjs` | Objectives, incidents, combat, explicit hostile escalation and campaign refresh |
| `dialogue.mjs` / `npc.mjs` | Conversation graph/triggers/eligibility/effects; NPC disposition/suspicion/hostility |
| `recovery.mjs` | Loot/debrief eligibility and selected recovery requests; inspect before changing evacuation |
| `equipment.mjs` / `party-tools.mjs` | Profession/branch qualification, personal Tools and mission-issued party Tools |
| `personnel-save.mjs` / `roster.mjs` | Loadout validation, browser fallback/shared saves and deployment roster projection |

Presentation is in **`demos/offworld-sandbox/`**:
`setup.mjs` roster/deployment; `map.mjs` map and active-party cards;
`map-layout.mjs`/`hex-layout.mjs` layout; `conversation.mjs` dialogue markup;
`npc-presentation.mjs` visible NPC details; `combat-feedback.mjs` pacing/damage;
`recovery-ui.mjs` extraction UI; `outcomes.mjs` outcome presentation.
`app.mjs` connects these to the runtime and base-save service.

On the sprite experiment branch, `sprite-renderer.mjs` supplies optional world
presentation hooks to the same map renderer; `sprite-manifest.mjs` owns lookup
and `demos/shared/sprites/offworld/` contains placeholders.
[Sprite asset contract](demos/offworld-sandbox/SPRITE_ASSETS.md) defines final-art
requirements. [Production PNG contract](demos/offworld-sandbox/SPRITE_PRODUCTION_CONTRACT.md)
supersedes provisional ingestion advice; `prepare-sprite.mjs` / `prepare-sprite.py`
provide deterministic offline preparation/validation (optional Python/Pillow);
the Python worker's `center <input.png> --out <output.png>` command handles isolated
sprite centering/sizing, with explicit solid-color background removal. Its focused
tests are `node --test demos/offworld-sandbox/center-sprite.test.mjs`.
`unpack-sprites.py` validates strict three-variant source ZIPs before extraction.
Custom project skill: `.cline/skills/split-sprite-sheet/SKILL.md`, backed by
`split-sprite-sheet.py` for Python/Pillow-only three-column extraction and source/runtime
preparation. Direct use requires explicit asset, runtime size and padding; the optional
`prepare-sprite.mjs split-sheet` wrapper supplies manifest configuration. Test with
`node --test demos/offworld-sandbox/split-sprite-sheet.test.mjs`.
The View selector retains the schematic renderer.
Outstanding artwork queue: `prepare-sprite.mjs outstanding-prompts --out <fresh-directory>`
exports missing enabled production PNGs and confirmed regeneration requests from
`demos/shared/sprites/outstanding-sprite-prompts.mjs`. Review flags are explicit,
not automatically cleared by installation. Test with
`node --test demos/offworld-sandbox/outstanding-sprite-prompts.test.mjs`.
The viewer's `install-server.mjs` / `/api/sprite-install` prepares and validates
saved selections (including registered state pairs) and atomically updates
`demos/shared/sprites/active-sprites.mjs`. The same manifest reads that registry;
production PNG versions live under `demos/shared/sprites/offworld/production/`.
Folder imports refresh saved candidates; prepared batch-folder paths keep canonical
prepared identity and deduplicate against server-loaded previews.
The registry also retains installed variant pools; `variant-selection.mjs` picks
stable per-identity art at map load/deployment/reset, keeping state pairs matched.
Review rejection updates pool eligibility. `prepare-sprite.mjs variants-refresh`
recovers legacy installations by source/runtime pixel matching (`match-installed.py`).

The viewer's `character-study.mjs` / `character-colors.mjs` provide a presentation-only
technician v01 mask/color study. Its untouched source is under
`artwork/character-studies/technician-v01/`; controls do not install art or save
personnel. Additional source masks and registered head layers are separate work.
`demos/shared/sprites/character-art-prompts.mjs` owns the material-palette prompt
text and matched portrait requests. The latest whole-sprite queue is `artwork/sprite-prompts-v5/`,
including `profiles/`; `sprite-variant-prompts.mjs` defines shape/design style briefs
and grayscale/runtime-size review, not colorways. Older queues are preserved. Portrait import
and runtime masks are not implemented by this prompt update.
Registered head-kit prompts live in `artwork/sprite-prompts-v4/head-kit/`, generated
by `prepare-sprite.mjs head-prompts` from `demos/shared/sprites/head-kit-prompts.mjs`.
Templates, head shapes, hair, beard and eyewear request matching overhead/portrait
layers; no head-layer importer or compositor is implemented yet.
Jointed character rig proof: [rig contract](demos/offworld-sandbox/CHARACTER_RIG_CONTRACT.md),
`demos/shared/sprites/character-rig.mjs` (eleven parts, shoulder/elbow/hip/knee
hierarchy, affine pose sampler), `demos/offworld-sandbox/rig-renderer.mjs` (SVG),
`prepare-character-rig.py` (full-canvas normalization) and
`artwork/sprite-prompts-v4/rig-proof-jointed/` (master + eleven part prompts).
Review artifacts: `artwork/rig-sprint/jointed-proof-v04/` (walk/joints) and
`artwork/rig-sprint/holding-proof-v05/` (offline pistol/rifle grips and bends;
rebuild with `artwork/rig-sprint/preview-holding-proof.py`); resume checkpoint:
[rig sprint status](docs/character-rig-sprint-status.md). Earlier seven-part
sources remain historical. `active-character-rigs.mjs` stays empty; no live
rig art, movement interpolation or holding gameplay is active.

Modular room-art prompts (October 13): [provisional art contract](docs/offworld-modular-room-visual-kit-contract.md),
[plan](docs/offworld-modular-room-visual-kit-plan.md) and [preserved handoff](docs/offworld-modular-room-visual-kit-handoff-v2.md).
`demos/shared/sprites/room-kit-prompts.mjs` defines six registered pieces, three
coordinated families and exact provisional geometry (128-unit cell, 32/64/32 bands,
1024-square source, 128-square runtime frame). CT2/CT3 arithmetic is corrected.
Export via `prepare-sprite.mjs room-kit-prompts --kit receiving --out <fresh-directory>`;
omit --kit for all 19 base-room types. Initial Receiving/Material Storage example:
`artwork/room-kit-prompts-v1/`. Test: `node --test demos/offworld-sandbox/room-kit-prompts.test.mjs`.
Fresh Receiving queue (October 18): `artwork/room-kit-prompts-v2-receiving/`.
Strengthened NW corner geometry gates and role-specific perimeter conveyors /
inspection stations come from `room-kit-prompts.mjs`; original v1 prompts remain historical.
Shared-architecture trial: `artwork/room-layer-prompts-v1/` has three four-piece
wall families plus separately registered Infirmary furnishings. Export with
`node demos/room-sandbox/export-room-layers.mjs --out <fresh-directory>`.
`room-layer-contract.mjs` owns masks/prompts; `room-layer-study.mjs` supplies
independent imports and labeled schematic fallbacks in Room Sandbox's modular
preview (Composition → Shared walls + Infirmary). All prompt deliveries require
the exact PNG filename and clickable download link at both beginning and end.
Legacy room-tile/outstanding overlay queues remain compatible with installed keys;
modular preparation/ingestion, Offworld archetype mappings and renderer adoption are pending.

Modular assembly preview (October 17): `/demos/room-sandbox/room-kit.html`, linked
from Room Sandbox, loads `artwork/room-kit-studies/material-storage/b001/` (18
unchanged Downloads sources). `room-kit-layout.mjs` resolves cell boundaries,
open joins and reflected SHARED pieces; `room-kit-preview.mjs` compares 1×1,
1×2/2×1 and 2×2 with family/CT/door controls and source-frame validation.
`import-room-kit.py` validates and copies complete kits to fresh study batches.
Checks: `node --test demos/room-sandbox/*.test.mjs` and
`node demos/room-sandbox/browser-smoke.mjs --kit`. This preview does not activate
art in saved bases or Offworld; production preparation/installation remains pending.
The same preview has an open/closed door toggle and separate registered-leaf
file picker (`room-kit-doors.mjs`); unprovided closed art uses a labeled schematic
placeholder. Material Storage prompts are in `artwork/room-kit-door-prompts-v1/material-storage/`.

Room art coverage: `demos/shared/sprites/room-sprite-requirements.mjs` maps the
authored room/geology IDs to this same manifest. See
[room sprite list](demos/room-sandbox/SPRITE_REQUIREMENTS.md). Its additional
placeholders/prompts are visible in the Sprite Viewer. Room Sandbox now renders
the shared installed variants by default through `sprite-presentation.mjs`,
with a schematic toggle and existing CT/selection/staff-count overlays. Installed
`floor-room-*` transparent interiors replace individual props over separate floors;
`form.renderMode: "continuous"` gives any physical room one full-footprint
surface/overlay (Gate 3×3 and Cultural Platform 2×2); default `"tiled"` retains
per-cell surfaces. Continuous rooms support explicit doors or a rotating single
door. Generated multi-cell footprints remain one physical instance. Rooms without eligible
installed interiors retain props. Single-door interiors rotate with the door.
The refreshed complete prompt queue is `artwork/sprite-prompts-v4/`.
Room-only additions: `artwork/room-sprite-prompts-v1/` (19 requests).
Export a fresh focused queue with `node demos/offworld-sandbox/prepare-sprite.mjs room-prompts --out <new-directory>`.

Active pending whole-room interior studies: `artwork/room-tile-prompts-v3/` (10 requests:
Generator, Cultural Platform, Holding, Research and six authored Offworld stage archetypes).
The 15 settled room studies are excluded from generation; acquisition history remains
in `artwork/room-tile-prompts-v2/README.md`. Generated by `prepare-sprite.mjs room-tile-prompts` using
`demos/shared/sprites/room-tile-prompts.mjs`. Each produces one transparent three-cell
furnishing sheet with bottom-center door clearance; floors come from the tile system.
Current splitter modes are unsuitable for transparent full-frame overlays (see queue README).
Historical opaque v1 and transparent v2 prompts are preserved. Cultural Platform
now has a 2×2 Tech Platform-based structural catalog entry without cultural bonuses
or new Services. Offworld additions remain presentation studies, not room catalog
definitions. These keys are now registered for viewer discovery/installation
as transparent frame-preserving overlays. Room Sandbox consumes installed base-room
interiors through `sprite-presentation.mjs`; Offworld stage overlay layering remains
pending. Uninstalled room types retain existing furnishings. Test:
`node --test demos/offworld-sandbox/room-tile-prompts.test.mjs`.

Do not implement semantic game behavior only in UI markup.

Downloaded character-sheet reference extraction: `artwork/cc0-character-study/README.md`;
64 frames/61 part cutouts with JPEG limitations, source provenance and unmeasured
pivots. Independent of the active character rig sprint and runtime registry.

## Shared systems and authored data

| Location | Contents |
| --- | --- |
| `demos/shared/js/base-configuration.mjs` | Base validation, capacity, recovery reservations, mission reset cleanup and save/revision handling |
| `demos/shared/js/personnel-roster.mjs` / `personnel-panel.mjs` | Shared personnel identity, favorites, portrait overrides and presentation |
| `demos/shared/js/item-instances.mjs` / `process-transfers.mjs` | Persistent physical items, custody/process transfers |
| `demos/shared/js/rooms.js` | Shared room helpers |
| `demos/shared/map/renderer.mjs` | Reusable map surface rendering |
| `demos/shared/portraits/` | Bust/icon/token renderers, palette and `stats-radar.mjs` expertise presentation |
| `demos/shared/data/mission-author/` | Semantic authoring proof pack, catalog/draft schemas, structural/information/dynamic/result bindings and explicit Missing Operative context; unsupported guidance remains unresolved |
| `demos/shared/data/offworld/` | `missing-operative-001.finalized.json` playable mission; `archetypes.json`, party presets and encounter data |
| `demos/shared/data/personnel-*.json` | Names, presentation and loadouts (`personnel-loadouts.json` owns stats/progression/Tool configuration) |
| `demos/shared/data/base-configuration.json` | Shared writable base room configuration and reservations |
| `demos/shared/data/rooms_schema.json`, `room.schema.json` | Active nested room catalog and authoring schema; Room Sandbox normalizes via `demos/shared/js/rooms.js` |
| `demos/shared/data/rooms.json`, `base_tiles.json`, `base-classes.json` | Legacy flat room catalog and shared tile/Profession catalogs |
| `demos/shared/data/theory/` / `items/` | Simulator Theory import and Human/Asgard rifle fixture packs |
| Other `demos/shared/data/` JSON/schema files | Recipes, processes, contracts, requirements, instances, items, discoveries and hypotheses |

Read the actual fixture/schema before changing it. Keep authored packs intact;
do not split them into production content without an explicit request.

## Design authority and reconciliation

- [Theory library index](docs/theory/README.md): architecture read order and
  Profession curriculum navigation.
- `docs/theory/architecture/`: Theory authoring/schema, Knowledge/evidence,
  Recipe bubbles, incidents and execution plans/requirements.
- `docs/theory/professions/`: current Profession/branch definitions and origins.
- [Theory simulator index](docs/theory/simulator/README.md): room prototype
  contracts and test-content documentation.
- [World-map index](docs/world-map/README.md): simulator specification, Haven
  population/resources/trade and glyph-address encoding.
- [Design consistency audit](docs/design-consistency-audit.md): design/demo
  alignment and remaining discrepancies.
- [Campaign reconciliation](docs/campaign-context-reconciliation.md),
  [nine endings](docs/faction-campaign-nine-endings-reconciliation.md),
  [central threat](docs/central-threat-reconciliation.md),
  [historical checklist](docs/historical-context-reconciliation.md): accepted,
  superseded and open context. Checked does not mean implemented.
- [Simulator decisions](docs/simulator-decisions.md): recent extraction,
  bypass, expertise/Stamina, containment and Cultural Platform decisions;
  dialogue/world-map work deferred there. Do not infer missing Recipes/content.

## Historical/reference material and handoffs

`Stargate_Orionis.md`, `memory.md`, `story_notes.md`, `reference_notes.md` and
the root comparison-game documents are broader/older context, not mandatory
first reads. Prefer specific current contracts and reconciliations for conflicts.

`CURRENT_TASK.md` references external Downloads handoffs. Those files are not
portable repository dependencies and may not exist in another agent's checkout.
Ask for missing handoff content rather than invent it. The playable mission is
the repository fixture above; do not assume an external replacement is enabled.

## Keep this useful

Update this map when moving/adding major modules or changing launch/test commands.
Put progress in the task log, rules in AGENTS, design in docs, and implementation
in the relevant subsystem. Avoid duplicating large design passages or transient
test counts here. Read targeted sections and tests after using the map to navigate.

Unity base presentation/recovery (October24): `Presentation/RoomInteriorView.cs`
shows physical-room staff/Core/bed slots below `RoomMapView`'s scrollable floor
grid. `Domain/PersonnelRecovery.cs` uses shared `personnel-recovery.json`/schema;
bed capacity projects the Infirmary patient tab in `rooms_schema.json`. Save26
persists separate bed assignments and passive recovery rule provenance. No
medical/replenishment work queues or new resource costs are implied.

UI-wave completion: `InspectionProgressView` projects existing work into the
shared bubble graphic for Receiving, Analysis and resource recovery. CargoPanel
uses independent item/action/detail scroll regions scoped to the selected room;
routing keeps the source queue and offers explicit Follow. `PersonnelCardView`
is shared by searchable roster, briefing/debrief and Ready Room
permanent slots. These are presentation adapters, not new execution systems.

Personnel profiles: `unity/tools/personnel-profiles.mjs` renders the existing
shared portrait busts and profession/specialization icons into the Unity atlas;
run with `--check` to verify freshness without rendering. `PresentationArt`
uses that atlas and existing nickname pools for display-only names.
`PersonnelCardView` shows health colors and two Tool-charge rows. Bootstrap
projection supplies the existing tierIII playtest override to configured Tools;
save27 migrates older loadouts without changing Tool instance identity.

Inspection animation: `Presentation/InspectionProgressAnimation.cs` retains a
per-session timeline across rebuilt trackers. It interpolates committed fractions
using observed tick intervals without predicting or changing simulation. Receiving
start/completion times distinguish repeated journal runs.
