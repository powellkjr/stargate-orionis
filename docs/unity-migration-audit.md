# Unity migration: Wave 0 audit

October 17, 2026. Source baseline: `676c42f`; working branch:
`unity-migration-wave-0`. This is an implementation inventory and bootstrap plan,
not authorization of new game rules. The project had not been created at audit
time. Follow-on implementation is documented in the migration plan and Unity
project README; the inventory below records the pre-bootstrap findings.

**Timing update, October 17:** the user subsequently chose one tick per movement,
one tick per whole combat encounter regardless of visual rounds, and a 36-minute
(12-tick) Gate limit. These supersede the historical timing conflicts below and
the supplied handoff's requirement to retain 37 minutes. Unity's clock foundation
now uses these rules; the JS runtime remains a reference for its earlier rules.

## Environment and bootstrap choices

- Installed Editor: `C:/Program Files/Unity/Hub/Editor/6000.5.2f1/Editor/Unity.exe`.
  Use this installed version for the bootstrap; commit its exact project version.
  This does not claim it is an LTS release or require an upgrade.
- Installed build modules: Windows standalone and WebGL. Proposed first build
  target: Windows desktop; WebGL deployment/persistence is a later concern.
- Available local templates include 2D cross-platform `6.1.5` and 3D
  cross-platform `17.0.14`. Template/package versions differ from Editor versions.
- `dotnet` is unavailable on PATH and `C:/Program Files/dotnet/dotnet.exe` is
  absent. A standalone SDK elsewhere has not been ruled out. Begin with Unity
  EditMode tests; a separate SDK test project remains deferred, not completed.
- User selected 2D pixel art and a future tool to convert 3D renders into sprites.
  Use the available 2D template for bootstrap. The first selection/data test can
  use placeholders; camera angle, pixel density and conversion pipeline remain
  separate art decisions. See the migration plan for the proposed tool workflow.
- Editor license activation, first import, package resolution and builds have
  not been exercised. No new packages or tools were installed by this audit.

## Behavior inventory

| Category | Evidence and current behavior | Migration implication |
| --- | --- | --- |
| Implemented and tested | `demos/shared/offworld/mission.mjs`: clones and freezes definitions; resolves archetype defaults/legal overrides, typed fields, IDs, references, geometry and physical items. | Preserve compilation semantics; a successful JSON parse is insufficient validation. |
| Implemented and tested | `offworld/runtime.mjs`: up to four Units, Gate choice, movement, visibility, return routes, exact connection expiry and extraction. | Port state transitions independently of Unity scenes. |
| Implemented and tested | `offworld/field.mjs`, `equipment.mjs`, `party-tools.mjs`: qualified Actors/Tools, persistent work, completion validation, charge commitment, findings, stationing and shared inventory. | Preserve instance/Actor identity and effects; do not generalize this into an already-existing whole-base scheduler. |
| Implemented and tested | `offworld/campaign.mjs`, `dialogue.mjs`, `npc.mjs`: objectives, authored events, combat, suspicion, conversation eligibility/history and escalation. | Retain authored conditions/effects and bounded prototype assumptions. |
| Implemented and tested | `offworld/recovery.mjs`, `js/base-configuration.mjs`: selected recovery, secure routes, capacity checks, stable payloads and reservations. | Preserve validation and idempotency while integrating into one campaign transaction. |
| Implemented and tested | `js/item-instances.mjs`, `js/process-transfers.mjs`: independent Receiving arrivals, weighted capacity, custody transfer and authored process/tag exposure. | Reuse contracts; these do not establish an integrated persistent base simulation. |
| Implemented and tested | `js/rooms.js`, room sandbox: nested room validation, physical footprints and joining; saved base has room instances, Groups and recovery reservations. | Keep physical child-room identity and Core Sets separate. |
| Proposed integration | Handoff's three-minute clock, SGC continuous time, offworld committed actions advancing SGC, once-per-tick bubble eligibility and queued decisions. | New shared scheduling/application work; confirm timing semantics before implementation. |
| Proposed integration | Handoff's daily staffing schedule, permanent SG assignments, finish-first transfers, destination reservations and demolition conflict prompts. | Implement explicit state machines and contract tests when this milestone begins. |
| Unresolved | Unified campaign snapshot, postmission injury/charge merge, full automatic base process execution and coherent reload across demos. | Design and test these boundaries explicitly; exports and individual saves do not prove a working campaign save. |
| Unresolved | `mission-author/readiness.mjs` returns `NOT_FINALIZED`; executable objective mappings and runtime dependency closure are missing. | Import finalized missions directly. Do not deploy semantic Drafts. |
| Presentation only | Browser combat pacing, map/portrait rendering, installed sprite variants, room overlay composition and character rig studies. | Rebuild presentation in Unity; do not import browser timers as simulation rules. |
| Outside first slice | World-map seeds/addresses/Haven metadata are separate prototypes; full economy/faction AI is not established by them. | Audit their exact generation/save contracts when integrating the world layer. |

All paths abbreviated as `offworld/`, `js/` or `mission-author/` above are under
`demos/shared/`. Current Receiving arrivals are page-session state; ordinary
catalog placement and disabled workflow buttons are not executable Recipes.
See `demos/room-staffing-demo/README.md` for these limits.

## Exact data adapters and parity references

| Adapter | Source data | Existing authority/checks | First use |
| --- | --- | --- | --- |
| Room catalog | `demos/shared/data/rooms_schema.json` | Despite its name this is the active **19-entry catalog**, not a JSON Schema. `room.schema.json` is the entry schema; `js/rooms.js:validateRooms` normalizes runtime fields. `rooms.json` is a legacy catalog. | Bootstrap: validate catalog and project room labels/footprints. Never use the legacy catalog as a second editable source. |
| Physical base | `demos/shared/data/base-configuration.json` | `simulator-base-1`, current authored revision 8; `js/base-configuration.mjs:validateBase`, `baseCapacity`, `reserveRecovery`. | Bootstrap: import room instance IDs and coordinates; later import Groups and reservations. `staffCount` alone does not identify assigned personnel. |
| Personnel | `base-classes.json`, `personnel-names.json`, `personnel-loadouts.json`, `personnel-presentation.json`, `offworld/party-presets.json`, all under `demos/shared/data/` | `js/personnel-roster.mjs:buildPersonnelRoster`, `offworld/roster.mjs:deploymentRoster`, `personnel-save.mjs:validateLoadout`, `equipment.mjs`. | Bootstrap: same deterministic roster IDs/names; subsequent deployment preserves branch, Tool instances and charge validation. Staffing tiers are zero-based; deployment tiers are one-based. Do not conflate appearance with gameplay. |
| Mission/archetypes | `demos/shared/data/offworld/missing-operative-001.finalized.json`, `archetypes.json` | `offworld/mission.mjs:compileMission`; immutable definitions and indexes; `runtime.test.mjs`, campaign/dialogue/field/admission/recovery suites. | Validate dependencies, defaults, tunable overrides, conditions/effects and all cross-references before mission execution. |
| Physical objects | `demos/shared/data/item.json`, mission-authored `physicalItem` and `cargo` payloads | `item.schema.json`, `instance.schema.json`, `offworld/mission.mjs:validPhysicalItem`; `party-tools.mjs`, `recovery.mjs`. | Preserve definition IDs, instance IDs, Reality, Knowledge, quantities, cost and provenance. `instance.json` contains separate sample instances; do not spawn them as copies of recovered mission objects. |
| Base process contracts | `demos/shared/data/process-matrix.json`, `processing-contracts.json`, item exposure metadata | Corresponding `*.schema.json`; `js/process-transfers.mjs`; Receiving/process-transfer tests. | Later Receiving/Analysis admission and transitions. Do not infer full Recipe scheduling from UI tabs. |
| Mission result/base save | Runtime `offworld-results-wave-3`; base `simulator-base-1`; personnel loadouts `version` | `campaign.mjs:missionResults`, `base-configuration.mjs:saveBase`; `demos/serve.mjs`, `serve.test.mjs`, `personnel-save.test.mjs`. | Read compatibility records through adapters; create a separately versioned campaign save with clock, state, partial work, decisions/reservations and deterministic state. Do not call results export a restorable save. |

Canonical Theory fixture packs under `demos/shared/data/theory/` and `items/`
remain authored authorities. Existing demo item tables are the executable slice's
immediate inputs. Do not split or silently reconcile these packs during import.
For first bootstrap, load only room/base/roster data; mission and process adapters
are subsequent bounded ports, not all required for the first selectable room.

## Timing and transaction conflicts

### Existing time semantics

- Missing Operative authors movement at **60 seconds** and redial at **180
  seconds** in `simulatorArtifact`. Basic combat inherits **30 seconds per round**
  from `archetypes.json`; the mission explicitly describes these as provisional.
- `combat-feedback.mjs:combatPacer` displays a round after **3,000 milliseconds**
  and advances to the next authored round boundary. Browser `app.mjs` polls at
  100 milliseconds and also advances active work automatically. These are
  presentation drivers, not a three-minute campaign rule.
- `runtime.mjs:advanceTime` splits simulation advancement at work/campaign
  boundaries. Current order is clock/Gate expiry -> work -> combat -> campaign
  refresh -> dialogue refresh. Gate expiry emits its exact timestamp even if the
  caller's step ends later. Preserve this observed ordering in parity tests;
  it is not automatically the ordering for a new campaign coordinator.
- The Gate closes at `elapsed + step >= 37 * 60`. Extraction requires the active
  party physically at an open Gate, with stationed Units recalled and work ended.

### Decisions required before the clock milestone

1. **Action quantization:** rounding every 60-second movement or 30-second combat
   round to a three-minute tick changes gameplay. Decide whether offworld keeps
   fine-grained time and accumulates shared base ticks, or intentionally changes
   action costs. Record the decision and parity exceptions; do not round silently.
2. **Gate deadline:** proposed representation is an absolute deadline at **2,220
   seconds**, separate from base work evaluation at 180-second boundaries.
   A connection can expire between base ticks. Define simultaneous event ordering
   and action completion/extraction checks; do not replace 37 with 36 or 39.
3. **Unified transaction:** `app.mjs` currently finalizes a cloned debrief, reloads
   base capacity, reserves/saves, then replaces mission state. `extract` already
   marks some assets recovered before debrief admission. This is not one durable
   campaign commit. Integrate selection, route/capacity checks, reservations,
   custody/personnel updates and mission completion atomically and prevent replay
   duplication. Define any allowed intermediate custody state rather than invent
   one during the port.
4. **Scheduling/decisions:** once-per-tick bubbles, shared sleep/readiness,
   sticky work/transfer orders and base decisions during offworld need new tests.
   Keep these out of the selection/bootstrap milestone.

## Proposed step-1 files

Create `unity/StargateOrionis/` using the available 2D template and Editor
`6000.5.2f1`; start with Windows as a provisional development target.

```text
unity/StargateOrionis/
  Assets/Orionis/
    Domain/
      Orionis.Domain.asmdef
      Rooms/RoomDefinition.cs
      Rooms/RoomInstance.cs
      Personnel/UnitSummary.cs
    Application/
      Orionis.Application.asmdef
      Selection/SelectionService.cs
      Selection/SelectionDetails.cs
    Infrastructure/
      Orionis.Infrastructure.asmdef
      Data/RoomCatalogReader.cs
      Data/BaseConfigurationReader.cs
      Data/PersonnelRosterReader.cs
      Data/FixtureValidationException.cs
    Presentation/
      Orionis.Presentation.asmdef
      Bootstrap/PrototypeBootstrap.cs
      Selection/SelectableView.cs
      Selection/SelectionPanel.cs
      Camera/PrototypeCamera.cs
    Editor/
      Orionis.Editor.asmdef
      FixtureSnapshotBuilder.cs
    Tests/EditMode/
      Orionis.Tests.EditMode.asmdef
      RoomImportTests.cs
      RosterImportTests.cs
      SelectionTests.cs
    Tests/PlayMode/
      Orionis.Tests.PlayMode.asmdef
      BootstrapSceneTests.cs
    Scenes/Bootstrap.unity
    Data/Generated/             # copied, validated fixtures plus source hashes
  Packages/manifest.json
  Packages/packages-lock.json
  ProjectSettings/ProjectVersion.txt
  README.md
```

Also extend root `.gitignore` for this project's Library, Temp, Obj, Logs,
UserSettings, build outputs and generated IDE files. Keep Unity `.meta` files.
Update REPO_MAP with actual launch/test commands once those entry points exist.

- Domain has no Unity or JSON dependency. Application references Domain;
  Infrastructure references Domain and the JSON parser. Presentation composes
  these at bootstrap. Editor fixture tooling is Editor-only. Set
  `noEngineReferences` for engine-free assemblies and test that boundary.
- Proposed parser: Unity's `com.unity.nuget.newtonsoft-json`, with a compatible
  version pinned after package resolution. The current data has top-level arrays
  and ID-keyed dictionaries, which do not fit direct `JsonUtility` serialization.
  Keep DTO/import validation separate from domain objects.
- Copy fixtures from the repository through one explicit editor import step.
  Record source paths/hashes and reject stale snapshots; generated copies are
  not independently authored definitions. The build must not depend on arbitrary
  paths outside the project or writable authored JSON.
- First scene: placeholder room footprints and an unassigned roster list. Select
  a room or Unit and display a projection; selection does not assign staff,
  grant capabilities or mutate saved state. Do not invent placement for Units.
- Do not create save/clock/Recipe interfaces before their concrete milestone
  needs them. A standalone headless .NET test project can reuse domain sources
  after SDK installation and compatibility verification.

Relevant Unity references: [assembly definition fields](https://docs.unity.com/en-us/engine/6000.0/manual/scripting/compilation-and-code-reload/script-compilation/assembly-definition-files/file-format),
[Unity 6000.5 JSON limitations](https://docs.unity.com/en-us/engine/6000.5/manual/scripting/compilation-and-code-reload/script-serialization/json-serialization),
[Unity Newtonsoft package](https://docs.unity3d.com/Packages/com.unity.nuget.newtonsoft-json@3.2/manual/index.html),
[Unity Test Framework](https://docs.unity3d.com/Packages/com.unity.test-framework@1.4/manual/index.html).
Verify installed package compatibility at bootstrap; these references are not a
claim that packages have already resolved or tests have run in this Editor.

## Validation and exit status

Focused checks run for this audit:

```bash
node --test --test-reporter=spec demos/offworld-sandbox/runtime.test.mjs demos/offworld-sandbox/campaign.test.mjs demos/offworld-sandbox/recovery.test.mjs demos/offworld-sandbox/personnel-save.test.mjs demos/room-sandbox/room-catalog.test.mjs demos/room-staffing-demo/receiving.test.mjs demos/room-staffing-demo/process-transfers.test.mjs
```

Result: **50 passed, zero failed/skipped**. The prior checkpoint's broader
358-pass/one-skip run and five browser checks remain historical baseline evidence;
no browser or Unity tests were rerun for these documentation changes.

Inventory, known conflicts and step-1 file plan are documented. The user selected
2D pixel art, settling the template direction. Proposed clock/staffing rules need
explicit reconciliation before their later milestone. No canonical data or runtime
behavior changed.
