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

- All five demos: `node demos/serve.mjs` from the root; open
  `http://127.0.0.1:8001/demos/`. Optional port: `node demos/serve.mjs 8000`.
- [Demo hosting/save guide](demos/README.md): local JSON writes versus static
  hosting. Static hosting does not implement the writable API.
- Plain browser JS/ES modules and Node built-in tests; no root package manifest
  or npm install/build step is required for these demos.
- All existing Node tests: `node --test demos/serve.test.mjs demos/offworld-sandbox/*.test.mjs demos/portrait-simulator/*.test.mjs demos/room-staffing-demo/*.test.mjs demos/world-map-simulator/*.test.mjs`
- Browser checks: `node demos/offworld-sandbox/browser-smoke.mjs` and
  `node demos/portrait-simulator/browser-smoke.mjs`. These launch Windows Edge;
  `EDGE_PATH` overrides its executable. Read the scripts for environment details.
- Syntax/diff: `node --check <changed-js-file>` and `git diff --check`.
- Save/browser tests should use temporary files or intercepted endpoints, not
  silently change authored JSON in the real checkout.

## Simulator entry points

| Area | Start here | Implementation / purpose |
| --- | --- | --- |
| Demo hub/server | [demos/README.md](demos/README.md) | `demos/index.html`, `demos/serve.mjs`, `demos/hosting-status.mjs`; shared writable endpoints and static assets |
| Offworld | [README](demos/offworld-sandbox/README.md) | `demos/offworld-sandbox/app.mjs`; mission UI, deployment, movement, work, combat, dialogue and extraction |
| Character & portrait editor | [HTML](demos/portrait-simulator/index.html) | `demos/portrait-simulator/app.mjs`, `model.mjs`, `character-stats.mjs`; appearance, stats, progression and configured Tools |
| Room layout sandbox | [README](demos/room-sandbox/README.md) | `demos/room-sandbox/room-sandbox.js`; physical layout, joins, CT and shared base saves |
| Room staffing/process demo | [README](demos/room-staffing-demo/README.md) | `demos/room-staffing-demo/room-staffing-demo.js`; personnel, room processes and transfers |
| World map | [README](demos/world-map-simulator/README.md) | `app.mjs` UI; `model.mjs` geometry/network; `havens.mjs` population/economy; `address-codec.mjs` glyph addresses; `worker.mjs`/`batch.mjs` generation |

Each demo's HTML/CSS live beside its entry point. Tests are adjacent `*.test.mjs`.

## Offworld: where to change what

All runtime modules below are in **`demos/shared/offworld/`**:

| Module | Responsibility |
| --- | --- |
| `mission.mjs` | Compile/validate authored mission and archetypes; freeze definitions and build indexes |
| `runtime.mjs` | Deployment, clock, Gate connection, movement, visibility, return route and extraction |
| `field.mjs` | Observations, Recipe admission/execution, persistent work, effects and stationing |
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

Do not implement semantic game behavior only in UI markup.

## Shared systems and authored data

| Location | Contents |
| --- | --- |
| `demos/shared/js/base-configuration.mjs` | Base validation, capacity, recovery reservations and save/revision handling |
| `demos/shared/js/personnel-roster.mjs` / `personnel-panel.mjs` | Shared personnel identity, favorites, portrait overrides and presentation |
| `demos/shared/js/item-instances.mjs` / `process-transfers.mjs` | Persistent physical items, custody/process transfers |
| `demos/shared/js/rooms.js` | Shared room helpers |
| `demos/shared/map/renderer.mjs` | Reusable map surface rendering |
| `demos/shared/portraits/` | Bust/icon/token renderers, palette and `stats-radar.mjs` expertise presentation |
| `demos/shared/data/offworld/` | `missing-operative-001.finalized.json` playable mission; `archetypes.json`, party presets and encounter data |
| `demos/shared/data/personnel-*.json` | Names, presentation and loadouts (`personnel-loadouts.json` owns stats/progression/Tool configuration) |
| `demos/shared/data/base-configuration.json` | Shared writable base room configuration and reservations |
| `demos/shared/data/rooms.json`, `base_tiles.json`, `base-classes.json` | Shared authored room/tile/Profession catalogs |
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