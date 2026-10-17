# Repository Map — start here

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

## Simulator entry points

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
Legacy room-tile/outstanding overlay queues remain compatible with installed keys;
modular preparation/ingestion, Offworld archetype mappings and renderer adoption are pending.

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
