# Offworld sandbox

The playable Missing Operative benchmark combines field observations, persistent
work, dialogue, explicit combat, Gate travel and selected recovery into one demo.
Runtime systems live in `../shared/offworld/`; mission content lives in
`../shared/data/offworld/missing-operative-001.finalized.json`.

## Run and validate

From the repository root:

```powershell
node demos/serve.mjs
```

Open `http://127.0.0.1:8001/demos/offworld-sandbox/`, select up to four Units,
and deploy. Choose whether to keep the Gate connection open. See
[the demo hosting guide](../README.md) for shared saves and static hosting.

```powershell
node --test demos/offworld-sandbox/*.test.mjs
node --test demos/room-staffing-demo/receiving.test.mjs demos/room-staffing-demo/process-transfers.test.mjs
node demos/offworld-sandbox/browser-smoke.mjs
```

The browser smoke uses Edge with an isolated temporary profile and intercepted
save endpoints. `EDGE_PATH` can select another Chromium executable. It checks
normal travel, dialogue and responder selection, restricted-door hacking,
Scientist characterization, Technician detachment, combat pacing, recovery,
station/rejoin, reset and a 390px layout. It never saves into the real fixtures.

## Conversations and checkpoint travel

The mission has nine conversation scenes: yard entry/return/checkpoint,
Holding worker/guard, operative, Processing worker, Reynolds and McGuffin.
NPC openings appear on the right; the SGC side stays empty until a response is
chosen. Choose a response first. If several local active-party Units qualify,
choose who delivers it; a sole qualifying Unit answers directly. Each historical
line retains its actual speaker. Profession responses use that responder's own
base or cross-path competency, with Knowledge checked separately.

Yard entry, the first office visit and each eligible Security Hall visit start
automatically. From Main Hall, Reynolds reminds visitors to go straight to the
overseer; from the office, he asks where they are going and offers authored
Diplomat/Soldier responses. Downed, captured or absent participants do not start
conversations. Main Hall to Security Hall is a routine doorway. Reynolds can
supply the restricted office-door code; hacking remains an alternative there.

Finding the operative does not start speech. Use **Talk** in Holding to contact
them and establish readiness. Repeated operative contact or Holding worker
questioning increases the watching guard's persistent suspicion. Specific
nonmedical work also has explicit suspicion effects; ordinary medical treatment
has no general suspicion penalty. The redundant yard Question work action and
operative timed Talk action have been removed in favor of conversation controls.

On return to the yard, the guard checks departure. The checkpoint conversation
also remains available manually after backing off. Authored diplomacy or
Soldier II pressure can grant social passage; explicit force starts the real yard
combat Incident. Social passage is permission, and does not set physical security.

The operative can depart once all patients are stabilized, the medical Incident
is resolved, or the radiation source is contained. An early departure is also
possible after Talk establishes readiness and the yard grants social passage or
its guards are defeated. Every departure still needs a known traversable Gate
route. The same operative waits at the Gate and returns with the extracting team.
This is the current benchmark departure abstraction, not a full escort/manifest
or universal secure-route system.

Questioning McGuffin supplies the separate security-terminal code. **Enter code**
unlocks the powered, locked terminal without a Tool charge and reports acceptance.
An unlocked terminal cannot subsequently be destroyed as an alternate solution.

## Analysis Lab benchmark wave

The Lab is a real Stage north of Processing, at `(4,0)` and `(5,0)`. The
supplement's proposed `(4,1)` and `(5,1)` are occupied by the existing Processing
footprint, so its allowed geometry normalization preserves all existing rooms.

`lab-mounted-rifle-01` is one complete physical `ASGARD_EM_RIFLE` instance from
mission start. The player sees **Mounted device**. Its identity, civilization,
advanced Reality and manufacturing Patterns are not revealed on entry.

The profession handoff is:

1. Scientist observations notice local test logs and repeatable anomalies.
2. Scientist characterization compares measurements against known basic
   principles, records an instance finding and a field Discovery/Research question.
3. Technician observations identify separable rig interfaces. Technician work
   uses the characterization to isolate connections and detach the same item.
4. A Soldier can interpret likely tactical significance after characterization.
5. The detached item becomes a Receiving candidate. Optional securing leaves it
   at the site; it never becomes ordinary party storage.

User-authorized provisional requirements reuse existing benchmark actions:

| Work | Profession | Tool Service | Time | Charges |
| --- | --- | --- | --- | --- |
| Characterize device | Scientist I | SCT1 | 3 minutes | 1 |
| Isolate and detach | Technician II | TECH_SERVICE_II | 60 minutes | 1 |
| Secure detached device | Untrained | None | 3 minutes | 0 |

Profession observations use tier I and Perception 0. The benchmark starts with
existing `PULSED_POWER_I` and `ELECTROMAGNETIC_ACCELERATION_I` Knowledge; the
Scientist Recipe explicitly requires them. These are provisional mission
assumptions, not new canonical science or production balance. No Tier-II Theory,
Asgard Pattern, institutional Hypothesis or Thesis is granted by field work.
The field Discovery remains evidence about a Research question, separate from
the authored institutional relationships in `../shared/data/discovery.json`.

## Shared physical items and recovery

The browser supplies `../shared/data/item.json` as `catalog.itemDefinitions` when
compiling missions. Instances with `itemId` must also author `physicalItem.state`,
`.reality` and `.knowledge`. The compiler resolves stable handling metadata and
preserves a unique instance ID; it never infers known identity from the catalog.
Missions without shared item references remain compatible with the older catalog.

`ITEM_STATE` conditions read a physical item's state. Transactional
`SET_ITEM_STATE` and `ADD_INSTANCE_FINDING` effects update its persistent state
and instance Knowledge. Neither changes institutional Theory. The Lab uses
`SET_RECOVERY_STATE` to make its detached item `ELIGIBLE_FOR_EVAC` and explicitly
authors recovery category `RECEIVING`.

Discovered recoverable loot stays at its site until extraction. Ordinary
collection secures it locally. Recovery options require valid physical conditions
and known traversable paths to the Gate; the mounted Lab item is blocked until
prepared. Unselected assets remain local. No carrying limit is authored.

Debrief confirmation creates Holding/Receiving admission requests and reserves
shared base capacity before committing recovery. Direct shared items include a
`physicalItem` payload with their original ID, physical state, Reality, instance
findings, process state and history. Receiving cost comes from the shared item
definition and current quantity. Crate recovery retains the existing `cargo`
payload format. The two rifle crates and Lab device are distinct authored
instances; no postmission reward copy is spawned.

These reservations await room admission. They do not automatically run the
staffing simulator's Receiving, Analysis or Research processes. `node demos/serve.mjs`
is required for writable confirmation; static hosting cannot save shared capacity.
Reset releases only reservations belonging to this run.

## Work, combat and Gate behavior

Recipes resolve one qualifying local Actor and one sufficient usable Tool.
Actor and target reservations prevent concurrent conflicts. Effects and charges
commit only after requirements are revalidated; cancellation releases reservations.
Failed effects roll back item changes, Knowledge and discoveries. Completed work
records actual outcomes in **Action results**.

NPC suspicion/hostility persist and clamp to 0-100. Suspicion alone does not start
combat. Explicit engagement or `START_HOSTILE_INCIDENT` schedules combat normally,
preserving participant health. Neutral armed NPCs are not automatically opponents.
Combat advances one round every three real seconds in the browser, with staggered
hit feedback. Bulk Wait is disabled during combat. Benchmark guards have 150 HP;
Units start with 100 HP and a separate provisional 18-damage weapon. Down means
incapacitation. Surrender remains distinct; restraint accepts Down or Surrendered.

Dialogue pauses time, work and combat, and blocks unrelated execution. Terminal
NPC speech remains until Finish. Only authored responses can leave a graph.
Automatic scenes start at most once per Stage visit, in authored scene order.
Variants use the first matching authored condition, with a fixed opening as
fallback. `enteredFromStage` reads the last successful movement's origin. Trigger
refreshes and failed movement do not increment visits.

Movement uses cardinal doorways and one advancing party. Stationing requires a
secure Stage; stationed Units stay behind until recalled. Return follows the
shortest known traversable route. Extraction requires the physical Gate, no
active work and all stationed Units recalled. An open connection expires after
37 simulated minutes; redial at the Gate before extracting if necessary.

## Personnel, equipment and presentation

Character & Portrait Editor owns stats, tiers, branches and configured Tools.
Offworld deployment starts with 0/4 selected and offers only configured Tool
choices. Its radar uses PER, END and EXP; HP and white Stamina meters are separate
resources. Deployment does not edit stats, tiers or charges. Mission damage and
spent charges never overwrite personnel defaults.

Two personal Tool slots follow the existing progression contract: slot 2 requires
base tier III and a configured branch. An untrained branch permits an eligible
second base Tool, but grants no branch competency or specialist Tool. Profession
and subject Knowledge remain separate. See the
[Profession boundaries](../../docs/theory/professions/profession-boundaries.md).

The mission-issued Signal receiver is a separate shared party Tool. It supplies
`SIGNAL_DIRECTION_FINDING` without granting Scout competency or occupying a
personal slot. Personal Tools resolve before shared Tools, and reserved shared
equipment blocks party movement. Legacy receiver-kit loadouts migrate to the
matching ordinary Scout kit without changing stats or charges.

Portraits use shared authored presentation data and do not change competency.
NPC details show only known local information. Hidden doors require authored
Knowledge: Holding worker conversation can reveal the side store; Processing
inquiry after containment reveals the office safe. Map action placement and the
shared floor renderer are presentation, independent of execution semantics.

## Implementation boundaries

`mission.mjs` compiles immutable authored definitions; `runtime.mjs` owns travel
and time; `field.mjs` owns observations and work; `campaign.mjs` owns Incidents and
objectives; `dialogue.mjs` owns conversation transactions; `recovery.mjs` owns
selected recovery. UI modules render those results rather than inventing rules.

Full replacement-mission schema migration, institutional Discovery/Research
handoff, physical base admission and a full evacuation manifest remain separate
work. This benchmark does not implement every proposed next-schema field.
