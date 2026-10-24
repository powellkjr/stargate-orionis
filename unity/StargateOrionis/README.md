Windows build: use **Orionis > Build Windows Slice** in Edit mode, then launch
`Builds/Windows/StargateOrionis.exe`. See the [playtest guide](../../docs/unity-playtest-guide.md).
Debug defaults off in the player and on in the Editor; use the header toggle.
The player saves to a separate `campaign-save.json` slot.

Equipment Storage now supports issuing/returning physical weapons and armor, with storage allocation retained and personal custody tracked separately. See [equipment guide](../../docs/unity-equipment-storage.md).

Current cargo routing: see [storage and staffed Analysis](../../docs/unity-cargo-routing.md).
Save schema 20 adds personnel continuity. Choose **Prepare redeployment** in the
debrief to retain injuries, stamina and Tool charges for the next attempt;
**Reset mission** remains a debug reset. See the [migration plan](../../docs/unity-migration-plan.md).

# Stargate Orionis — Unity bootstrap

Unity Editor **6000.5.2f1**, Universal 2D. This first scene supports room/roster
inspection, manual staffing, a Receiving work loop, mission deployment and the route through Holding/operative contact, with prototype save/load and schematic placeholders before the
pixel-art pipeline.

## Open and run

The starting base now also includes **Material Storage, Supply Storage,
Equipment Storage and Containment** below the work rooms. Select them to view
authored configured limits: bulk materials/supplies, EQ Weapons/Armor tabs and
CC storage. Containment takes two staff; the other storage rooms are automated.
These room instances and configuration do not yet implement occupied cargo
inventory or transfer offworld items. See [the storage scope and remaining
integration](../../docs/unity-storage-rooms.md).

Open this directory in Unity Hub. Let packages resolve and scripts compile.
Choose **Orionis > Open Bootstrap**, then press **Play**. The first successful
import creates `Assets/Orionis/Scenes/Bootstrap.unity` without replacing your
currently open scene. The menu can also create it if necessary.

- Select one of the five saved physical room footprints to inspect it.
- Scroll the 54-entry personnel list and select a Unit to inspect their stats.
- A gold outline marks the inspected room or Unit; selection preserves its fill
  color and does not depend on keyboard/mouse focus.
- Selection changes the details panel only. Explicit Assign/Unassign controls
  change staffing. Receiving work advances on the clock; the mission entry route supports movement and its guard conversation.
- The room grid is the existing 12-by-10 base layout. Art, fonts and layout are
  provisional; these screen-space placeholders do not establish gameplay scale.
  The view frames occupied cells with a one-cell margin to keep room controls
  readable beside the inspection panel; authored positions remain unchanged.

To regenerate the scene, close Bootstrap and use **Orionis > Rebuild Bootstrap
Scene**. This rebuilds that generated scene only; it does not change SampleScene.
Bootstrap is not automatically substituted into your build profile.

## Mission briefing and deployment

Create a permanent team through **Base -> Ready Room** (the new room beside
Workshop). Enter its designation, **Create team**, then select up to four members
with the checkboxes. Assigned/deployed Units are gray and unavailable; explicitly
release ordinary room staff before recruiting them. Ready Rooms have one team,
four fixed slots and no Cores, stacking, joining, processing Services or custody.
This slice uses the Response Room's 1×1 footprint and CT1 only.

Use **Back to base -> Mission briefing**, select the SG team, then **Assign SG
team to mission**. The whole team deploys in saved order with actual equipment.
Membership/designation locks offworld and stays assigned to the home room after
return. Save/Load and Reset mission preserve team configuration. Ordinary room
staffing is separate; members must leave their SG team before taking a base job.
The individual-Unit prototype selection remains only when no team exists.

Schema 16 retains teams and the mission Team ID. Exact older-fixture validation
adds missing Ready/storage rooms without inferring a team or changing an active
mission, partial Receiving work or player save file.

**Reset mission**, next to Save/Load, clears the current prototype attempt and
returns to the briefing for a fresh run. Base time, staffing and Receiving work
stay intact. The saved slot stays unchanged until Save, so Load can restore it.
This replay control resets mission injuries/Tool use; it is not an in-game recall
or healing process.

Click **Mission briefing** at the top of the Game view. Review the authored
Missing Operative briefing, select one to four available Units, then **Deploy**.
Checkboxes select Units and selected rows have a gold outline. Entries show
`Name: <name>` followed by `PROFESSION<tier>/<branch><tier>` when a branch exists.
Assigned Units have gray, disabled checkboxes. The deployed team shows actual
equipped Tools and charges. A Unit assigned to a physical room
must be explicitly unassigned in the Base view before deployment; no staffing
assignment is silently removed. This is mission party selection, not a complete
permanent SG Team/Ready Room system.

Deployment retains Unit IDs, stats, structured branch configuration and equipped
Tool identities, Services, charges and damage. Empty slots grant no Tools.
Specialist kits without authored Service mappings stay equipped with no invented
capabilities. Once deployed, Units are unavailable for base staffing/work.

The team arrives at the authored Gate Stage. **Maintain connection** and **Close
connection** resolve the arrival choice without advancing time. At a closed Gate,
**Redial SGC** costs the authored three minutes, one campaign tick, and advances
eligible base work through the same clock. Connection expiry uses the approved
12-tick/36-minute Unity limit. Base Run/Step/Speed controls are disabled while
offworld; menus and real-world time do not advance the mission. **Base** previews
the base without returning the team from its expedition.

The right side now shows a simple grid map using the mission's authored cells.
Known room footprints appear as boxes; visited rooms are brighter, and a gold
outline/marker shows the team. Green door markers are open; amber markers are
locked. Hidden room shapes/names stay hidden. Click an adjacent open room to use
the same one-tick Stage move as the text controls. Conversations, Gate choices
and active field work block map movement too. **Team & equipment** switches the
right-hand panel to the scrollable team details; **Show map** switches back.

`missionMap` is separate presentation geometry in the bootstrap projection. It
does not change the mission-definition save fingerprint, reveal Knowledge or
introduce movement within a Stage; existing saves gain the map on load.

After choosing the Gate policy, **Move: Outer Yard** commits one tick and starts
the original guard conversation. Scroll the response list for all five choices.
Profession choices require a qualified deployed Unit, including a qualifying
crosspath. If several Units qualify, choose the responder. Responses and
**Continue** do not advance time or consume Tool charges. Finish the conversation,
then move through the unexplored doorway to reach **Main Hall** in a second tick.
Visited Stage names become known; hidden Stage names are not shown in advance.
You can backtrack to the Gate; the entry conversation does not restart on revisits.

At Main Hall, the current Holding route uses the authored **Hack** interaction.
It needs Technician I (primary or crosspath) and an undamaged equipped Tool
providing `TECH_SERVICE_I` with one available charge. Choose the Actor if needed.
Starting work reserves that Actor/Tool without advancing time or spending the
charge. **Complete work** commits one three-minute tick and spends the charge;
**Cancel** spends neither time nor charge. Active work blocks movement and
survives Save/Load with the same Actor/Tool. An opened door cannot spend another
charge through the same Recipe.

Move through the unlocked doorway to **Holding Area**. The original passive
transmitter-code observation identifies the operative when its Knowledge and
Actor conditions are met, completing Locate and activating Extract. **Talk:
Injured person** opens the authored contact conversation. Its effects preserve
Knowledge, detection, evacuation readiness and the Holding guard's suspicion;
talking takes no time or charge. Readiness does not send the operative anywhere.
Only first contact is supported: repeating it could trigger a hostile Incident,
so repeat contact remains unavailable until that Incident continuation is ported.
The alternative door-code route and other facility branches remain unimplemented.

### Patient care and evacuation readiness

At Holding, **Patients & evacuation** lists the three authored patients. Each
**Stabilize** action needs Medic I (primary or crosspath) and a charged,
undamaged equipped MET1 Tool. Starting reserves the Actor/Tool; **Complete work**
spends one charge and one tick. Cancel spends neither. Save/Load retains the
reservation and completed patient work. Stabilized patients cannot spend another
charge through the same Recipe.

The medical Incident resolves only after all three patients are stabilized.
Treating patients raises the Holding guard's suspicion by 20 while neutral;
reaching 100 starts the authored encounter. A Down guard receives no increase.
The panel reports secure-route blockers: surviving neutral/dormant guards also
block evacuation, and clearing guards does not resolve the medical Incident.
The route checks known traversable doors and every Stage back to the Gate.
After contact, **Send operative to Gate** starts the authored untrained work:
choose an Actor, then **Complete work** for one tick and no Tool/charge. The
operative waits at the Gate while the party remains in Holding. Return through
the rooms, **Redial SGC** if closed, then **Extract to SGC**. Only physical SGC
extraction completes Extract. The debrief preserves the recovered operative,
returned personnel health and Tool charges through Save/Load, without replaying
rewards. Extracting before sending the operative returns the team without them.
Use **Base** for SGC; returned Units can be assigned, while incapacitated Units
remain unavailable. General healing and multi-mission history remain pending.

Schema 12 retains separate care/rescue-definition fingerprints and the return
record. Earlier saves retain their party/battles and gain no completed care or
extraction. Source containment and alternative
mission branches remain outside the current bounded route.

### Guard encounters

Visited Outer Yard and Holding rooms now offer **Engage guards**. The authored
party weapons are separate from Profession Tools: 100 initial health and 18
ranged damage per active Unit; each guard has 150 health and deals 5 damage.
The party fires in roster order, followed by surviving guards. Zero health is
**DOWN**, not death. Damage persists across encounters and reloads; downed Units
cannot perform field work or respond to conversations.

**Next round** advances one shooting round; **Play rounds** presents rounds every
0.75 real seconds (provisional visual pacing). Both leave campaign time unchanged
until victory, defeat or **Disengage** ends the encounter, committing exactly one
three-minute tick including eligible base work and Gate expiry. Movement and
ordinary work are blocked during a fight. Disengagement ends the engagement
without moving the team, healing either side or clearing guards; a doorway move
still costs its own tick. Surviving hostiles continue to block ordinary work.

Save/Load preserves the exact battle/round history and derived health, starting
playback paused. The battle display shows HP and last-round damage; the map marks
the current fight red. Badges on visited rooms show guard clearance only:
amber guards remain, green guards are down. **This is not the complete secure
evacuation-route check**: medical/departure conditions still matter. A fully
incapacitated party remains incapacitated on reload; recovery is not implemented.
Surrender, automatic escalation beyond treatment's authored suspicion threshold,
and repeat contact remain outside this bounded path. Guards in other facility
branches are not exposed.

Save/Load retains the expedition, party/Tool identities, Gate choice, connection
start, elapsed ticks, visits, open doors, active conversation, responder history,
authored Knowledge gains, guard social state, door work and contact/objective
state. Old saves migrate with no invented deployment or new mission findings. The
generator validates the unmodified finalized mission and archetypes through the
existing JS compiler, then imports the bounded deployment and entry-route projection.

Current supported loop: **deployment -> authored entry -> Holding access/contact
-> guards/patient stabilization -> operative departure -> Gate return/redial ->
SGC extraction/debrief -> saved aftermath**. Other branches, general recovery and
multi-mission campaign history remain outside the slice. No doors, guards,
Knowledge, objectives or custody outcomes are bypassed to simulate completion.
Persistent SG team/Ready Room creation and mission assignment are now supported;
see [the room/team contract](../../docs/unity-ready-room-plan.md).

## Manual staffing and names

Select a Unit, choose a destination in **Room assignment**, then **Assign**.
Alternatively, select a room first, then a Unit: that room becomes the destination.
**Unassign** removes the selected Unit's staffing assignment. Room tiles show
occupancy/capacity, personnel cards show their current room, and the details panel
lists staff or the selected Unit's assignment.

A Unit can belong to at most one physical room. A reassignment validates the
destination before changing either assignment; a full room leaves the original
assignment intact. Initial authored capacities: Gate Room 6, other four rooms 2
each at CT1. Capacity is imported from room slot/rule data, not inferred from
Profession or hard-coded into the C# UI. Room assignment grants no execution
qualification. Commands do not themselves advance time.

Moving a Receiving worker immediately preserves committed personal progress and
waits for that same worker to return. Planned transfers reserve a destination
place without moving the Unit early; see the controls below. SG Team/Base Response
assignments and joined Room Group staffing remain future integrations. Import rejects active Groups
or anonymous nonzero saved staff counts rather than guessing Unit identities.

The original roster used the first surname for all nine Units of a profession,
despite having sixteen surnames available. The shared roster now independently
shuffles both existing pools with repeatable presentation seeds, giving nine
distinct surnames per profession. No name pools, Unit IDs, tiers or capabilities
were changed. Automatic `Sr.`/`V.` progression decorations were removed on
October 18. Exact known generated names in older saves are migrated to remove
those suffixes; custom names and their genuine suffixes remain unchanged.

## Planned staffing moves

Choose a Unit and destination using **Room assignment**:

- **Assign now** moves immediately and cancels that Unit's existing planned move
  only after the replacement assignment validates. Committed work remains.
- **Move after next tick** leaves the Unit in place for one more work evaluation,
  then transfers at that tick's boundary.
- **Finish step, then move** binds to the Unit's unfinished local personal step.
  Inspection pause or unavailable capability preserves both the order and its
  reservation. The Unit transfers when that step commits completion. With no
  unfinished local step, the assignment happens immediately.
- **Cancel planned move** releases the reserved place and keeps the Unit at its
  current room. **Unassign** explicitly cancels that Unit's pending move too.

The destination dropdown and room/details views show reservations. Occupancy plus
reservations cannot exceed staffing capacity. A conflicting request is rejected
without changing either Unit or cancelling the existing order; select its owner
and explicitly cancel that planned move before retrying. Invalid replacement
orders retain the original reservation. No occupied Unit is evicted automatically.

For a fresh test, assign a Technician to Receiving, admit the object and advance
one tick. Select that Technician, choose Workshop, then **Finish step, then move**.
Try pausing inspection and saving/loading: the Unit stays in Receiving, with a
Workshop place reserved. Resume and step once; handling completes and the Unit
moves. The Scientist's dependent classification can start on a later tick.

These orders cover physical-room staffing only. Finish-step means the captured
personal work step, not every step of a multi-Actor Recipe. Full contiguous-task
policy, sleep/medical scheduling, Response/SG Team orders and conflict dialogs
remain later integrations. Current-tick work is not authoritative until committed;
the prototype has no separately stored fractional personal work to discard.

## Campaign clock

The prototype starts paused at elapsed `00:00`, tick zero. **+1 tick** advances
three game minutes. **Run/Pause** starts/stops continuous SGC clock playback;
**1x/4x** changes presentation pacing only. The provisional rate is one tick per
three real seconds at 1x. Step is disabled while running. Selection itself costs
no ticks. There is no offline-time catch-up.

The user's October 17 timing rules for the Unity port are:

- Movement: one tick.
- Entire combat encounter: one tick regardless of visual shooting rounds.
- Gate connection limit: twelve ticks, or 36 minutes.

The clock stores integer elapsed ticks; each transition validates before commit
and publishes a tick event afterward. Room/Unit data and RNG state do not change
merely because a tick passes. Receiving eligibility/progress is evaluated once per
tick, with dependent work starting no earlier than the following tick. Full base
scheduling policy, base decisions, durable event
journal and offworld execution are future integrations. In particular, these
constants do not yet provide a live movement/combat/Gate runtime in Unity.

## Prototype save/load

Use **Save** and **Load** at the top of the Game view. To try it, select a room,
Save, select another room, then Load: the saved details and outline return.
You can also stop/restart Play mode, or reopen the Editor, then choose Load.
Startup uses the imported snapshot until you explicitly Load; it never
automatically overwrites an existing save.

There is one local slot: `prototype-save.json` under Unity's
`Application.persistentDataPath`. It is outside the repository and authored JSON.
Save replaces the slot after validating and flushing a temporary file; if atomic
replacement fails, it reports the failure and keeps the old save. Load parses
and validates a candidate before replacing the current session.

Version 9 (`orionis-prototype-save`) covers only the implemented slice:

- Stable room/Unit IDs, room definition references, positions and construction
  tiers, plus the currently imported personnel display/stat fields.
- A versioned deterministic random stream, seed and current state. Initial seed
  `1` is a provisional technical default; gameplay does not consume this stream yet.
- The inspected entity, stored separately from simulation state.
- Elapsed campaign ticks. Loading starts paused with fresh real-time playback
  pacing; authoritative ticks are preserved exactly.
- Identified Unit-to-physical-room assignments, validated for reference integrity,
  uniqueness and authored capacity before loading or saving.
- Admitted Receiving instance IDs, physical-room custody, pause state and
  per-step committed ticks/Actor IDs. Completed steps are retained as evidence;
  allowed Known Tags, recorded condition and processing tags are reconstructed
  from that evidence against fingerprint-pinned definitions. Hidden Reality is
  never promoted merely by loading a save.
- Pending staffing transfer destinations/reservations, timing, request tick and
  captured work references. The full tick commits work and due moves together.
- Nullable expedition state: mission/Gate Stage references, deployment tick,
  arrival choice, connection timing, party IDs/stats and equipped Tool instance
  IDs, kits, slots, charges and damage. A separate mission-definition fingerprint
  prevents reinterpreting an expedition after mission/loadout changes.
- Entry-route visits, open door IDs, active conversation/node, chosen responder
  history, authored Knowledge and NPC suspicion/disposition. Loading validates
  references and does not replay effects or advance time.
- Active/completed door Recipe references, sticky Actor/Tool, start tick,
  observation records, subject detection/readiness and Locate/Extract status.
  Completed work is required evidence for the locked door opening. Extract
  cannot be marked completed in this version.
- Combat encounter/round history and outcomes, validated by replaying authored
  damage and targeting. Party/guard health is derived from that evidence, so
  reload cannot heal, replay charges, invent victory or advance time twice.
  Combat definitions have their own fingerprint; no extra campaign RNG draws.

Versions 1 through 8 remain readable. Version 1 starts at tick zero;
versions 1 and 2 migrate with no staffing assignments because neither stored them. The
specific pre-staffing fixture pack has a fingerprint-pinned compatibility path
that preserves its old names/IDs and other state while adding staffing metadata.
The exporter checks the archived pack against the new content before declaring
that compatibility. Other changed packs still fail explicitly. Load does not
rewrite the file; the next Save writes version 9. Versions 1–3 migrate with no
admitted items or inferred work. Version 4 retains Receiving progress. Older
saves before version 5 have no pending transfers. Saves before version 6 have
no deployed team. The specific name-only snapshot compatibility
path preserves partial work while cleaning known generated suffixes.
Version 6 deployments retain their party, Tools, Gate state and timing while
initializing only the Gate visit. Their old mission/loadout fingerprint must
match the current deployment projection; no dialogue or exploration is inferred.
Version 7 fingerprints the entry-route content too and persists travel/dialogue.
Its pinned previous projection is archived in
`../tools/fixtures/bootstrap-before-holding-route.json`. Migration first validates
against that exact old scope, then adds only initial Holding subject/guard/work
state. Existing visits, active conversations, Knowledge, Tools and Gate timing
remain intact; future location IDs/findings cannot be smuggled into an old save.
Version 8 preserves all field/contact progress and gains an empty combat history
with the authored initial health; no completed battles or cleared guards are
inferred. Health remains expedition state until return/aftermath is implemented.

Authored definitions remain in the imported fixture snapshot. A fingerprint binds
the save to its normalized starting content, rejecting changed fixture packs
instead of silently reinterpreting saves. The current format requires the same initial
room/roster identities; construction/recruitment and further schema migrations are future
work. Corrupt saves, missing fields, unknown versions/IDs and invalid geometry or
stats fail without changing the current session. A failed Load does not repair
or rewrite the file.

This is not a complete campaign save. General inventory transfers, loadout editing,
personnel progression and mission movement/story/debrief state remain outside
this slice. Expedition Tool charges/damage are persisted but no field action
consumes them yet. Receiving imports structured qualifications and equipped Tool
Services as fixed configuration; it does not consume charges or borrow stored
equipment. Changed Receiving content/configuration rejects version-4 saves until
an explicit migration exists; prototype balancing is not silently applied to
partial work.

## Try Receiving

1. Select **Receiving**, then **Admit test object** in the inspection panel.
2. Assign a Technician and a Scientist to Receiving using the existing staffing
   controls. The first ordinary Technician and Scientist have suitable equipped
   Tools; cross-trained staff can also qualify through their imported ranks.
3. Use **+1 tick**, or **Run**. Handling takes two ticks with Technician I and
   `TET1`; classification then takes two ticks with Scientist I and `SCT1`.
4. Try **Pause inspection**, Save/Load, or move the active worker away. Committed
   progress remains; another worker cannot inherit it. Return the original
   worker and resume. Clock pause and inspection pause are separate controls.

The incoming object is the existing Asgard rifle fixture. The player sees an
unknown object, permitted condition findings, then an unknown rifle. Origin and
electromagnetic implementation stay hidden; IDs that encode origin are omitted
from the panel. Completion grants no institutional Knowledge and does not
automatically route to Analysis or another custody destination.

These are user-authorized provisional playtest choices in
`demos/shared/data/receiving-prototype.json`, projected alongside the existing
item/instance data. No expendables are used and no additional technical Room
Service is required for this ordinary inspection. Room admission, compatible
storage and authored CT capacity still apply. The Service resolver also checks
an authored Room Service when present; tests cover missing/local/remote cases.
The template packs remain unchanged, and the active standalone item table is
the explicit storage-compatibility source. Only one existing test arrival is
exposed by this UI; duplicate admission is rejected.

## Authored data

Run from the repository root in Git Bash:

```bash
node unity/tools/bootstrap-snapshot.mjs
node unity/tools/bootstrap-snapshot.mjs --check
```

The generator uses the simulator's room validation, base validation and roster
projection and validates the finalized mission through the existing compiler.
The Unity prototype sets all personnel base Professions to tier 3 and all
existing crosspaths/specializations to tier 3 (base-only `3`, branched `3/3`).
This Unity-only projection preserves branch identities and equipped Tools;
the browser roster and shared authored loadouts are unchanged. Display,
Receiving qualifications and mission deployment use the same projected tiers.
Existing saves with a different roster fingerprint require a fresh campaign.
Validate this projection with `node --test unity/tools/bootstrap-snapshot.test.mjs`.
It writes bounded display, Receiving and deployment data to
`Assets/Orionis/Data/Generated/bootstrap.json`, with source file hashes.
The Editor menu rejects stale source hashes and invalid snapshot references.
Do not edit the generated JSON as a second content source.

The C# importer separately rejects unknown formats, broken references, duplicate
identities, invalid stats and overlapping/invalid footprints. This is a bootstrap
projection importer, not a complete mission or canonical fixture compiler.

## Code boundaries

- **Domain:** immutable room/Unit data, bounded campaign state and deterministic
  random state; no Unity or JSON dependency.
- **Application:** selection projections and session/save-store boundary;
  candidate validation precedes session replacement.
- **Infrastructure:** fixture and save codecs, validation and atomic disk writes.
- **Presentation:** runtime uGUI components, using the installed Input System.
- **Editor:** provenance validation and additive scene generation.

The Newtonsoft JSON package is pinned to the already installed `3.2.2`.
Unity Test Framework and other packages come from the user's 2D template.
Assembly definitions enforce explicit project dependencies; engine-free
assemblies have `noEngineReferences` enabled.

## Checks

Use **Window > General > Test Runner** to run EditMode and PlayMode tests.
EditMode covers fixture identities, malformed references/state, selection
isolation, disk save roundtrips, RNG replay, atomic replacement and rejected
loads. Editor PlayMode checks cover room colors/outlines and Save/Load buttons,
including session recreation and missing/corrupt files. Tests inject isolated
temporary save stores and never write to the player's slot.

October 18 deployment and base validation in the live Editor `6000.5.2f1`:
**164 EditMode tests passed; 9 PlayMode tests passed**, with no skips or failures.
Deployment checks cover party availability, equipped Tool identity/charges,
Gate choice/redial/expiry, schema-6 reload, malformed saves and legacy migration.
The actual deployment UI was exercised in PlayMode and visually reviewed.
All 25 existing JS Offworld runtime/personnel-save/dialogue/NPC tests passed.
Entry-route checks cover the original conversation, primary/crosspath eligibility,
atomic invalid actions, Knowledge/suspicion/disposition, reload during both prompt
and answer, revisits, movement timing, Gate expiry and version-6 migration.
Holding checks cover admission blockers, cancellation, reserved work reload,
one-time charge spending, Gate expiry during work, passive identity, contact
effects without replay, malformed work/objectives and exact version-7 migration.
The PlayMode route uses actual UI controls through contact and readiness reload.
Map checks cover authored footprints, invalid geometry, geometry-independent
save fingerprints, hidden-room labels, one-tick room clicks and the details toggle.
Combat checks cover authored targeting/damage, one-tick results, disengagement,
re-engagement without healing, downed Actors, defeat, malformed history,
mid-fight UI reload and schema-8 migration. All 16 existing JS campaign/combat
feedback checks pass; the Unity encounter-time override remains intentional.
All 15 existing JS Receiving/process-transfer tests also passed. Receiving checks
cover missing/local/remote Services, no global roster fallback, custody capacity,
sticky Actors, pause/resume, per-tick concurrency/dependencies, malformed work,
older saves and partial-work reload. PlayMode uses the actual UI controls and
asserts hidden origin/technology never appear in the inspection panel.
The earlier shared name-selector/portrait/Offworld-presentation checks passed
(26 Node tests), and were rerun successfully after the suffix cleanup. Transfer
checks cover timing, reservations/cancellation, invalid replacement rollback,
paused finish-first work, save integrity and the name-only migration.
Compilation and snapshot freshness checks passed. The user approved the
selection outline; final pixel art and a Windows player build remain outstanding.

Do not launch a second Editor against this same project while it is open. Batch
validation can use a separate ignored `unity/.validation-*` copy with the same
Assets, Packages and ProjectSettings. Keep its path at that depth so repository
provenance checks resolve the source root correctly.

See [migration plan](../../docs/unity-migration-plan.md) and
[Wave 0 audit](../../docs/unity-migration-audit.md) for later timing, persistence
and render-to-sprite work.

Warehouse r11 provides provisional 20-place safe temporary holding before retention decisions; actual item inventory and transfers remain pending. See `docs/unity-storage-rooms.md` at the repository root. Four-member Ready Room/briefing summaries scroll when needed.

The first physical recovery loop now supports the authored Holding crate and its unknown rifle: medical-worker persuasion -> debrief recovery -> Base > Recovered cargo -> Receiving -> compatible Containment. See `docs/unity-cargo-recovery.md` at the repo root for the walkthrough and remaining safety/retention limits.

From Containment, Recovered cargo now offers a two-tick Technician/TET1 handling review in Receiving. Containment remains reserved; completed findings clear Warehouse storage. Keep for SGC records separate retention intent. Equipment use remains uncleared. See `docs/unity-warehouse-clearance.md` at the repo root.
