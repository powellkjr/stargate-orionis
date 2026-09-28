# Offworld sandbox - Wave 3

Start the writable local server from the repository root:

```powershell
node demos/serve.mjs
```

Open `http://127.0.0.1:8001/demos/offworld-sandbox/`. It serves assets without caching and writes validated deployment edits atomically to `demos/shared/data/personnel-loadouts.json`. An optional port argument selects another port. The server listens only on loopback and accepts writes only to known personnel records.

Deployment always begins with **0/4 selected**. All 54 shared personnel remain available, with shared portraits and favorites. Stats, progression, two Tool selections and charge counts save on change. In read-only hosting, the same edits persist in this browser and the UI explicitly reports that JSON writing needs the writable server. Pending browser edits retry when the writable server becomes available on that origin. Mission damage and spent charges never overwrite deployment defaults.

## Field play

1. Choose stats, progression and equipment, then deploy.
2. Keep or close the Gate connection. Move through map doorways.
3. Profession-colored observations appear when local competency, Perception,
   Knowledge, state, visibility and any instrument requirements are satisfied.
   Tap markers or observation cards for the observer and finding.
4. Tap an action hex or a context-panel action. Blocked actions explain why;
   hidden actions are omitted. Select an eligible Actor and start work.
5. Different Actors may work on different targets concurrently. An Actor and
   target each permit one job. Personal Tool identity is reserved with the job;
   the lowest sufficient charged kit is selected. Charges are spent on commit.
6. Moving with working party members offers Wait or Cancel work and move.
   Cancel releases reservations without applying effects or consuming a charge.
7. Station an idle Unit explicitly in a secure Stage. Rejoin requires returning
   to that Stage. Stationed Units stay put; there is only one advancing party.
8. Return follows the shortest known traversable route. Extraction requires the
   physical Gate, no active work, and recalling stationed Units. Carried instance
   IDs survive extraction and custody changes to RECOVERED_TO_SGC.

Three simulated minutes take about one second during work; hour-long work takes
about ten seconds. Time stops during idle decision-making. Reset recreates the
same mission, deployment, and SGC start time. Party setup discards the current run
and lets you change the deployment. Export records field state and its ledger;
Wave 3 exports objective outcomes, recovered IDs, personnel/instance state, Knowledge deltas, discoveries, scheduled events and the event ledger. Result-binding categories include observed snapshots; unauthored faction rewards, addresses and mission-lead contents are not fabricated.

## Portraits and map controls

Deployment and party cards use the portrait simulator's shared 48x64 bust renderer.
Appearance remains composed of independently configurable parts; overhead tokens
stay small. Appearance comes from `personnel-presentation.json` and never changes competency. Loadouts live in `personnel-loadouts.json`; the full roster is built through `../shared/js/personnel-roster.mjs` and
adapted by `../shared/offworld/roster.mjs`.

Selectable exits are bright mint with arrows pointing out of the current Stage.
Adjacent locked doors are amber; other known transitions are small muted markers
without click or keyboard targets. During movement or the opening Gate choice,
transitions are inactive. Action icons occupy a shared regular hexagonal lattice:
six equal sides, common edges and no interior overlap, even across nearby targets.
Leader lines connect displaced hexes to their target; doorway controls reserve space.

## Two Tool slots and progression

Both slots are visible. Slot 1 uses the base Profession track. Slot 2 unlocks at
base Tier III with a certified specialization or cross-path (branch Tier I or
higher). Branch Tier 0 grants neither competency nor a second usable slot.
As in `room-staffing-demo.js`'s `assignmentToolTracks`, either unlocked slot can
hold any kit from the Unit's eligible tracks, up to that track's tier. Duplicate
kit types are separate physical Tool instances with independent charges.

Offworld stores actual tiers I/II/III as 1/2/3; staffing internally stores these
as 0/1/2. Cross-training uses the target Profession's normal competency.
Specializations unlock their equipment track without inventing specialist powers.
Their kit codes come from staffing, but unauthored specialized Service mappings
remain empty. A specialized Unit may still put an eligible base kit in slot 2.

Authority: [Profession handoff](../../docs/theory/professions/profession-context-handoff.md),
[boundaries](../../docs/theory/professions/profession-boundaries.md), and each linked
curriculum's Tool section. Kit codes use staffing's TET/SCT/MET/STT/SOT/DIT families.
Outside Technician these generic Service identifiers remain provisional simulator
mappings, not newly canonical technologies. TECH_SERVICE_II is provider-independent:
Technician Tools II explicitly provide it; a future authored room could also
provide it. Equipment capability never supplies missing competency or Theory.

Scout transmitter observations require SIGNAL_DIRECTION_FINDING, supplied by the mission-issued **Signal receiver** in the Party equipment panel. Standard Scout Tools I/II/III remain the only generic Scout kits; there are no receiver variants. The receiver is an independent physical Tool with stable instance ID, custody, location, condition, Services and optional charges. It occupies neither personal slot. Missing Operative issues it through `deployment.partyTools`; the definition lives in `archetypes.json`'s `partyTools` catalog.

Party equipment moves with the advancing party and returns to SGC on extraction. A qualified local Actor can use it; it does not grant Scout competency. Passive signal observation consumes no charge. Recipes resolve personal Tools first, then a local shared Tool, reserving one physical instance per job and revalidating it on completion. Shared equipment in use blocks party movement until work finishes or is cancelled. Stationed Actors cannot use a receiver that has left their Stage. Mission exports include party equipment separately from personal loadouts and recovered assets.

Legacy saved STT1_SIGNAL/STT2_SIGNAL/STT3_SIGNAL selections migrate to the matching normal kit, preserving stats, branch and charges. This is a compatibility migration, not an additional equipment variant.

## Implemented and deferred

Implemented: immutable catalog resolution, typed legal overrides, reference and
geometry validation; responsive top-down map; cardinal transitions; fog and known
shape; four-Unit party; modular portraits; two-slot deployment; observations,
Perception and supporting clues; instance detection and Knowledge; contextual
hexes and action explanations; Actor choice and Tool reservations; concurrent
work, cancellation, transactional effects; door hacking; bounded inspection,
patient assessment/stabilization, sample-collection state, component/evidence/
Supply recovery and escort; discovery records; stationing; Gate lifecycle;
standalone SGC time; shortest-route return; reset; debug and field snapshot export.

The full action list is in the context panel; two primary actions appear at each
world target. Designer includes all observation candidates and unmet checks,
including hidden Reality that ordinary rendering does not expose.

Wave 3 now executes medical/radiation Incident conditions, explicit combat engagement, automatic rounds, disengagement, objective activation/completion, authored event bindings and scheduled evidence purge. Combat takes place on the existing map; health and Down states persist. Baseline combat uses a provisional separate ranged weapon per Unit (100 health, 18 damage each 30-second round), independent of the two Profession Tool slots. Guards use 45 health / 5 damage. No Profession is required for basic firing. These numbers are authored simulator tuning, not production balance.

User-authorized provisional outcomes: Diplomat II negotiation surrenders Reynolds and his still-active guards, or McGuffin individually. Downed people are never revived by surrender. Technician I or Soldier I can destroy the terminal with a Tool charge; its same instance remains as WRECKAGE and can be recovered. The separate archive is not erased/restored by terminal destruction. Existing prisoner restraint requires a Down or Surrendered subject; capture is not automatic extraction.

The artifact adds missing patient-03 medical targets and explicit holding/office combat Incidents. Hazard containment does not repair machinery or cure the outbreak. Evidence-purge bindings require local custody, so already-carried evidence cannot be destroyed remotely. Event time advances during actions, work, waits and combat; idle decisions remain paused. Scheduled events remain in the exported result at extraction, rather than silently advancing a campaign outside this standalone simulator.

Wave 4 adds Auto and expanded presentation/Designer polish.

## Files and data

- `app.mjs`: startup, controls, camera, work presentation and UI orchestration.
- `setup.mjs`, `map.mjs`: deployment and world presentation.
- `../shared/offworld/mission.mjs`: immutable definition compiler/validation.
- `../shared/offworld/runtime.mjs`: mission clock, party, Gate and movement.
- `../shared/offworld/field.mjs`: observations, work, effects and stationing.
- `../shared/offworld/equipment.mjs`: progression and physical kit eligibility.
- `../shared/offworld/campaign.mjs`: Incidents, combat, authored event/condition execution and results.
- `../shared/offworld/personnel-save.mjs`, `../serve.mjs`: validated personnel persistence.
- `../shared/data/offworld/`: basic archetypes, Tool definitions, personnel
  presets and the repository-owned Missing Operative mission artifact.
- `../shared/portraits/`: independent portrait and overhead token composition.

Mission geometry extends the security hall to (5,3) and office access to (6,2).
Wave 2 adds authored door targets and hack Recipes, explicit initial instance
state, security conditions and observation instrument requirements. No encounter
is regenerated from the chosen party. Small assumptions are recorded under
`simulatorArtifact`: 60 seconds per transition, 180 seconds to redial, no dialing
interference yet, charge consumption on commit, and mission-issued receiver equipment.

Player-facing labels, Knowledge and mutable physical state remain separate.
No objective completes merely because a room is entered. Work and recovery are
recorded continuously; event escalation executes from authored bindings.

## Validation

```powershell
node --test demos/offworld-sandbox/runtime.test.mjs demos/offworld-sandbox/field.test.mjs demos/offworld-sandbox/presentation.test.mjs demos/offworld-sandbox/campaign.test.mjs demos/offworld-sandbox/personnel-save.test.mjs demos/offworld-sandbox/party-tools.test.mjs
node --test demos/room-staffing-demo/receiving.test.mjs demos/room-staffing-demo/process-transfers.test.mjs
node demos/offworld-sandbox/browser-smoke.mjs
```

The browser smoke test uses installed Edge with an isolated temporary profile
and no npm dependencies. EDGE_PATH can select another Chromium executable.
It checks the roster, party cap, both Tool slots, cross-path eligibility,
observation presentation, hacking, charge consumption, station/rejoin, return,
reset, browser exceptions and a 390px mobile layout. It writes screenshots in
its temporary profile. Edge rendering may require running outside the Codex
filesystem sandbox; no user browser profile is opened or modified.

## Shared map renderer and simplified status

Both Room Sandbox and Offworld call `shared/map/renderer.mjs` for their floor and exposed-edge rendering. The room sandbox supplies its existing `joinedSides` decisions (including Room Groups), construction colors and padding; Offworld supplies authored Stage cells and fog colors. Internal cell boundaries are omitted in both. Room identity, joining legality, mission transitions and all gameplay rules remain in their own simulators.

Offworld uses a 4×4 placement grid per tile, reduced overhead tokens, and visual clearance around people, objects, labels and doors. Action hexes avoid occupied positions. This is presentation layout, not movement capacity or new game rules.

Combatants remain ACTIVE while health is above zero; defeat sets DOWN. Accepted surrender sets SURRENDERED. Restraint accepts either. Patient treatment records the separate STABILIZED clinical outcome.

## Encounter choices and visible outcomes

Engage now appears as a map hex alongside the authored social options. Engage starts baseline combat; Soldier II Intimidate demands surrender, while Diplomat II Negotiate handles negotiated surrender. Intimidation is a user-requested provisional Recipe for these authored encounters, not a universal Soldier power or substitute for Diplomat competency. Both accepted-surrender outcomes set SURRENDERED, while combat incapacitation remains DOWN. Restraint accepts either state. The restored SURRENDERED state supersedes the earlier single-Down simplification above.

The context panel lists completed actions with Actor, completion time, actual committed changes and Tool charge costs. Earlier results remain expandable. Incident resolutions also list participant outcomes. Question actions record interview preparation: subsequent authored negotiation and intimidation take one simulated minute instead of three. Profession requirements remain unchanged. This is provisional simulator tuning; no hidden Knowledge is granted. Result-ledger ACTION_COMPLETED records contain immutable snapshots of each action's actual output.


## Extraction and recovery

Discovered loot remains visible at its site until extraction. Collection secures it locally; it does not move it into party inventory. The debrief offers discovered recoverable loot and captured/surrendered people with known traversable paths to the Gate, without requiring earlier collection. Selection preserves physical instance IDs; unselected assets stay local. Recovery requirements are checked again at confirmation. Main and subordinate objectives appear together once.

No carrying limit is authored yet. Recovery destinations are Holding/Receiving admission requests exported with mission results. The shared base configuration supplies capacity, and confirmation persists reservations before committing recovery. Physical room processing remains a separate step. Retrieval does not advance the clock, following the requested end-of-mission recovery abstraction.


## Shared base configuration and authored test crates

Room Simulator loads `shared/data/base-configuration.json`: a small editable default with Gate, Receiving, Holding, Analysis and Workshop. Use **Save shared base** after layout/tier edits; **Reload shared base** discards unsaved edits. `node demos/serve.mjs` provides atomic JSON saves with revision checks. Offworld reloads the base at extraction and confirmation, uses `rooms_schema.json` captive/inventory slot definitions, and reserves selected capacity persistently. Default CT1 capacity is four captives and 40 Receiving inventory units. Existing reservations prevent invalid capacity reductions. Reservations are pending room admission; this does not automatically execute staffing simulator Receiving workflows. There is still no separately authored party carrying limit.

The Holding-area Diplomat now persuades the epidemiologist to reveal two hidden equipment crates. Each contains one authored physical rifle instance, respectively ASGARD_EM_RIFLE and HUMAN_ADVANCED_COIL_RIFLE from the staffing item catalog. IDs, hidden Reality, Knowledge and handling costs survive in recovery payloads and saved reservations. Revealing a crate does not identify or analyze its contents. This is an explicitly authored simulator fixture, not generated loot.

The terminal exposes Hack or Destroy as alternate resolutions. Technician and Soldier destruction recipes share one visible choice and resolve against the selected Actor's actual capability. Successful hacking leaves it unlocked and intact; destruction is no longer offered as a valid follow-up. Destruction leaves recoverable wreckage. Persuasion, like other completed actions, reports its outcome.


## Dialogue, concealed doors, and Gate actions

Gate connection choices, redial and extraction also appear as map hexes. Ordinary work is blocked while an active hostile remains in the current Stage, both at start and commit; authored negotiation/intimidation remain encounter alternatives. Invalid-target and completed action hexes are removed on render.

A Holding worker's Diplomat Small talk reveals a side store containing the second rifle crate. Holding persuasion reveals the first crate. After the Processing radiation source is contained, its worker's Diplomat Inquire reveals a safe room north of the Overseer office, with an additional intel package and Supply crate. Hidden transitions are excluded from movement and visibility until their authored Knowledge conditions are met.

The operative's untrained Talk explains departure conditions. Send to Gate requires all patients stabilized, the medical incident resolved, or the existing radiation source contained, plus a known traversable Gate route. The operative waits physically at the Gate and is recovered when the party extracts. Questioning the downed security supervisor grants the office-door code; Enter code spends no Tool charges.

Deployment shows free Holding/Receiving capacity. Reset releases only reservations keyed to this run, preserving other runs' reservations and the physical base configuration.
