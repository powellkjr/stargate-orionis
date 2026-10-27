# Core configuration handoff — October 24, 2026

User request: work out Core configuration in a separate chat while the original
chat continues Unity visual migration. Read `AGENTS.md`, `REPO_MAP.md` and the
active section of `CURRENT_TASK.md` first. Update the existing task during work;
preserve its visual and art workstreams rather than replacing it.

## Objective

Close the Core authoring/configuration gate in migration Wave 3: owned Core
instances, physical-room installation/configuration, resulting Room Services,
and persistence. First establish the missing rules with the user, then implement
two concrete connected steps per batch where feasible. This is not authorization
to invent canonical Core definitions, Recipes, costs or acquisition rules.

## Current implementation

- Construction, paid CT upgrades and ordered Room Groups work. Physical rooms
  retain IDs and capacities; Groups share eligible permanent staff.
- Visible Core slots currently show capacity, not installed working Cores.
- Two technical Core definitions exist in the shared theory fixture:
  `ELECTRODYNAMICS_FABRICATION_CORE_II` provides
  `ELECTRODYNAMICS_FABRICATION_II`; `ELECTRODYNAMICS_TEST_CORE_II` provides
  `SHIELDED_ELECTRODYNAMICS_TEST_II`. Both are tier II.
- No complete owned-instance/acquisition/install path is currently established
  for these definitions. Inspect the simulator before deciding which parts are
  reusable and which require authoring.
- Receiving resource recovery currently uses user-approved Balanced Supply and
  Material defaults without installed Cores. Do not imply those are installed
  provisional Core instances.
- Group Tools and eligible Response-room resolution are additional Wave3 gaps;
  they are not automatically supplied by implementing Core slots.
- Current Unity save schema is27. Preserve existing saves and stable identities.

## Read these authorities and entry points

| Purpose | Files |
| --- | --- |
| Roadmap / open gates | `docs/unity-migration-plan.md`, particularly Wave3 |
| Canonical technical definitions / Recipes | `demos/shared/data/theory/stargate_theory_simulator_import.json` (`coreDefinitions`, related Recipe and Service references) |
| Physical room capacities / restrictions | `demos/shared/data/rooms_schema.json`; `docs/room-capacity-standardization-checklist.md` |
| Existing simulator Core UI/configuration | `demos/room-staffing-demo/room-staffing-demo.js` (`roomResources.cores`, Core slots); `demos/shared/js/rooms.js` |
| Execution authority | `docs/theory/architecture/recipe-bubble-contract.md`, `docs/theory/architecture/plans-and-requirements.md`, `AGENTS.md` |
| Cargo allocation context | `docs/shared-cargo-reconciliation.md`; `demos/shared/data/resource-cargo-economy.json` and matching schema |
| Unity shared-data projection | `unity/tools/bootstrap-snapshot.mjs`, `Assets/Orionis/Infrastructure/BootstrapReader.cs` under the Unity project |
| Unity room/configuration/runtime | `Assets/Orionis/Domain/RoomGroups.cs`, `RoomPlanning.cs`, `BubbleExecution.cs` |
| Configuration presentation | `Assets/Orionis/Presentation/BasePlanningPanel.cs`, `RoomInteriorView.cs` |
| Persistence | `Assets/Orionis/Infrastructure/CampaignSaveCodec.cs` |

Unity project root: `unity/StargateOrionis/`. The `Assets/...` entries above are
relative to that directory. Shared schemas/data must remain authoritative for
both simulators and Unity; generated imports must not become parallel rules.

## Decisions to resolve with the user

Check existing authoring first; ask only for rules that are actually missing:

1. Which initial Core configurations should be playable? Are the two technical
   Cores the first target, or should Receiving allocation be authored first?
2. How are Core instances acquired, stored and initially owned? What is their
   identity/lifecycle model in the existing schema?
3. Which physical rooms accept each Core, how many slots does it occupy, and
   what tier/knowledge/compatibility restrictions apply?
4. What Recipes govern installation, removal and configuration changes: Actors,
   Tools, environment, time, inputs and outputs?
5. What happens to active work, reserved capability and partial bubbles when a
   Core is removed, reconfigured or unavailable? Do changes queue until safe?
6. Which Services emerge from combinations, and what authored rule defines
   those combinations? Keep technical Room Services distinct from allocation
   policy settings and Group Tool Services.

## Boundaries and acceptance

- Physical rooms never merge. Core Sets stay attached to physical children;
  joining a Group does not pool Core slots or erase ownership.
- Room Service search stays within the destination Group, destination child
  first. A room category alone must not grant a technical Service.
- Each executable bubble has at most one Actor, one Tool Service and one Room
  Service requirement. Admission capability and runtime availability differ.
- Preserve sticky Actor identity, capacity reservations, custody/fallback storage,
  partial progress and committed outputs. No idle-roster/global Service search.
- Demonstrate an authored Core configuration enabling previously blocked work,
  with an explicit blocker before configuration and valid execution afterward.
- Save/Load must preserve ownership, physical-room attachment and configuration
  without duplicating Cores, granting free Services or resetting active work.
- Use focused existing tests, print totals/failures, and avoid repeated full
  mission walkthroughs or Windows builds for configuration-only changes.
- Preserve the live Unity campaign before automation. If PlayMode tests are
  necessary, follow AGENTS cleanup rules before restoring ordinary Play.

## Coordination

The other workstream owns personnel portraits/cards, construction artwork and
Offworld room/unit visuals. Avoid those presentation files unless integration
requires them; coordinate shared bootstrap/save/task edits. The working tree
contains ongoing changes: do not reset, broadly stage or commit unrelated work.

Start by reporting the source-backed configuration model and a short list of
missing decisions. Then author shared definitions and implement the smallest
end-to-end configuration path the user approves. Keep remaining Wave3 gaps
explicit rather than declaring all of base expansion complete.
