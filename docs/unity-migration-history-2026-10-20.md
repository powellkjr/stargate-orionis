> Archived October 20, 2026. This preserves the previous plan and chronological
> checkpoints. Follow the [active roadmap](unity-migration-plan.md); historical
> “next” entries below are not the current work order.

# Unity migration plan

## Active priority: complete the playable mission loop

Current batch — October 20 personnel continuity and redeployment:

1. Added campaign personnel condition separate from authored shared loadouts.
   Preparing another sortie preserves health, stamina/endurance and existing
   Tool IDs, damage and charges. Deployment snapshots starting health; combat
   and mid-round reload use it rather than restoring template health. Downed
   Units remain unavailable. Campaign copy/work paths preserve these records.
2. Added **Prepare redeployment** to the debrief and saved condition to briefing/
   personnel details. It starts a fresh attempt of the same authored mission
   while retaining personnel condition and issued equipment. **Reset mission**
   remains a debug reset; neither action writes a save automatically.

Schema 20 persists personnel and starting health. Versions 1–19 retain existing
expedition state and gain no invented prior sorties. No healing, Tool recharge,
resource consumption or recovery-rate rules were added. Multi-mission selection
and a full campaign mission-history system remain future work.

Validation: 11 focused rescue/condition/migration EditMode checks and the extended
full-rescue/equipment/redeployment PlayMode walkthrough pass. Clean compilation,
snapshot freshness and changed-source whitespace pass. Unity was closed; tests
used a hidden editor and temporary saves, without overwriting the player slot.

Next: actual Supply cargo recognition/value exposure and Supply Storage allocation
using shared schema/data. The conversion stat fallback is user-authorized as 1.
The recovered weapon container is not Supply cargo; keep resource instances
distinct and do not treat construction baseCost as a cargo conversion formula.

The entries below describe earlier batches.

Current batch — October 19 storage/custody and Analysis correction:

1. Implemented persistent validated storage separately from temporary room or
   Unit custody. Incoming inventory remains fallback during Receiving; room
   storage places stay reserved during Analysis. Schema 19 migrates old saves.
2. Implemented staffed Analysis processing for remaining instance properties.
   Containment is storage only, with no automatic examination. Send custody to
   Analysis, use a local Scientist with SCT1, then return to reserved storage or
   explicitly route the identified item. The lab has its authored one-item
   workspace; processing retains the provisional two-tick tuning.

Validation: all 21 focused cargo EditMode checks passed; the amended Analysis
admission walkthrough passed its additional one-item/full-destination assertion.
Clean compile, snapshot freshness, source syntax and live UI review passed.
The original live campaign was restored, with no player-slot writes or residual
test controllers. No automatic failure scheduler was added.

October 19 follow-up batch — transfer timing and vertical-slice gate:

- Implemented one campaign tick for each successful storage reassignment,
  including incoming inventory to room storage. Admission/capacity validates
  before the tick; failures and UI previews spend no time. The tick advances
  ordinary base work as usual. Analysis admission, custody return and Unit
  equipment issue/return remain zero ticks. Existing saves gain no retroactive
  transfer charges.
- Extended the existing full-rescue PlayMode walkthrough through staffed Analysis,
  equipment issue, saved aftermath and redeployment with the same rifle. Combat
  rounds now use the UI controls too. The one focused PlayMode route and one
  focused EditMode timing/reservation route pass, using temporary saves only.
- Save/Load retains returned injuries and Tool charges. Debug Reset mission
  clears the expedition and restores template personnel stats/Tool charges;
  persistent personnel across distinct missions remains an implementation gap,
  not a recovery mechanic proven by this replay test.

Supply conversion authoring gap: Supply Storage has authored S1/S2/S3 tabs, but
the recovered SIM_SUPPLY_CRATE is a handling-cost-1 equipment container holding
the rifle. No Pristine quality/conversion stat or supply-value formula was found.
The user requested Large/Pristine/S2 identification and handling cost 5–10 for
actual resource cargo. A question is pending for the missing rule/file and
whether the recovered rifle container should also contain convertible supplies.
Do not reinterpret packaging as resources or invent a conversion rate. Next
Supply implementation is (1) authored safe identification/value exposure and
(2) validated S2 storage allocation/UI after those facts are provided.

Completed vertical-slice checks in this batch:

1. Walk the normal-input SG-team rescue through extraction, cargo recovery,
   Receiving, storage, Analysis and equipment issue. Fix concrete interaction
   blockers found on that route rather than expanding unrelated base systems.
2. Verify Save/Load of the complete aftermath and redeployment with the same
   team/items, preserved damage, Tool charges, storage reservations and combat
   equipment. Keep validation bounded and report totals/failures only.

The entries below are historical where they conflict with this correction.

Latest equipment batch: user authorized one weapon and one armor slot per Unit,
separate from profession Tools, with provisional data-driven combat values.
Equipment Storage now supports browsing, issuing and returning physical items.
Storage assignment/allocation stays in Equipment Storage; personal custody goes
to the Unit. Deployment snapshots gear IDs/stats so later base changes cannot
rewrite archived combat. Schema 18 persists both layers; older saves gain no
equipment or changed combat. See [equipment guide](unity-equipment-storage.md).

Latest October 19 cargo revision: Receiving -> Warehouse or Containment;
Warehouse -> Containment only; local Containment examination reveals authored
instance properties; fully examined intact equipment can be accepted into
Equipment Storage. This replaces the redundant Receiving review and earlier
unknown-condition Warehouse prohibition. The two implementation steps are
Containment work/persistence and the Equipment Storage handoff; also fix crate
routing, actionable blocked labels and duplicated room-name suffixes. See
[current cargo flow](unity-cargo-routing.md). Unit equipment issuing and broader
Analysis/Workshop work remain subsequent migrations.

October 19 workflow: implement two concrete steps per batch; use focused existing
tests and report totals/failures only. Current presentation batch adds deployment
readiness (current health, stamina, equipped Tool charges and real deployment
blockers) and a visible objective tracker above the map. Team details no longer
hide objectives; HIDDEN objectives remain excluded. These are read-only views of
existing rules and saved state; no new equipment clearance rules or save version.
Validation: five existing deployment/rescue PlayMode walkthroughs passed with
focused assertions for readiness, hidden objectives and tracker visibility after
reload/team-view changes. No additional test cases or full-suite rerun.

October 18 user correction: staffing transfer controls were not priority work.
This section supersedes the earlier foundation-first implementation sequence.
Existing base prototypes are sufficient support for now. Do not expand staffing,
room processes, names, art tooling or general scheduling before the mission loop
is playable unless a concrete mission blocker requires it.

Later October 18 request explicitly adds a prototype **Reset mission** control
and persistent SG teams/Ready Rooms. The team work is now requested scope;
see [Ready Room notes and integration plan](unity-ready-room-plan.md) for the
four-member/one-team contract and the missing physical-room fixture details.

The later clarification establishes a Response-like 1×1 Ready Room with four
fixed members and no Cores, stacking or joining. This is now implemented as r6
in the test base, persistent SG team creation/editing and team-based mission
assignment. Save schema 12 migrates the previous five-room fixture explicitly;
old expeditions retain their ad hoc identity until completed/reset, without
fabricated teams. Reset retains configured SG teams. See the Ready Room guide
for the workflow and bounded scope.

The vertical slice is **SGC -> deploy -> Missing Operative -> recover the
operative -> extract/debrief -> saved SGC aftermath**. A selectable map or a
successful retreat alone is not the finished slice.

| Order | Deliverable | Acceptance |
| --- | --- | --- |
| 1a — implemented and validated | Mission briefing, selection/deployment of 1–4 existing available Units, equipped Tools, Gate arrival/choice/redial and saved deployment. | Party/Tool identity and charges survive reload. No base availability duplication, automatic equipment grants or elapsed time while choosing. |
| 1b — implemented and validated | Stage movement and the authored yard entry conversation in Unity. | Reach Main Hall through normal authored play. Movement commits one campaign tick; conversations/menus do not run the base clock. Save/reload restores position, Gate state, conversation and progress. |
| 2a — implemented and validated | Authored Main Hall-to-Holding door hack, passive operative identity, Locate objective and first contact dialogue. | Qualified Actor/Tool, one tick/charge on completion, cancellation and sticky work reload; identity/contact effects and readiness persist without extracting the operative. |
| 2b — guard encounters implemented | Yard/Holding fights with authored combatants/stats, persistent damage, disengagement and downed outcomes. | Entire encounter costs one tick; visual rounds/menus are free. Mid-fight reload and retreat retain both sides; map badges report guard clearance only. |
| 2c — medical work and secure-route checks implemented | Three authored stabilization Recipes, medical Incident resolution and a known, traversable, clear route to the Gate. Operative departure predicates remain next. | Medic/Tool, one tick/charge per patient, sticky work reload, conditional suspicion/escalation; neutral guards and active medical Incidents block secure evacuation. |
| 3 — implemented | Operative departure, Gate return/redial, extraction and debrief through the supported care/guard route. | Sending the operative costs one tick and leaves them at the Gate. The party must physically return and redial before SGC extraction. |
| 4 — bounded aftermath implemented | Preserve the completed expedition as a returned mission record in the campaign. | Save/reload retains objectives, operative recovery, party injuries and Tool charges. Returned Units are released for base assignment, incapacitated Units remain unavailable, and repeated extraction is rejected. |
| 5 — first bounded recovery implemented | Reveal the existing Holding crate, choose debrief recovery and inspect its unknown rifle in Receiving before explicit Containment transfer. | Same package/content IDs and physical evidence persist; hidden Reality stays hidden; capacity failures leave state unchanged. Warehouse safety/retention and Equipment issuing remain pending. |

Use `demos/shared/data/offworld/missing-operative-001.finalized.json` and
`archetypes.json` through the existing mission compiler as the reference. Its
normal entry path is Gate Yard -> Outer Yard -> authored yard conversation ->
Main Hall. Do not remove dialogue, force guards down, unlock doors, expose hidden
Stages or assign operative custody directly to make a test pass. Several unit
tests intentionally simplify these conditions; they are isolated subsystem
references, not an end-to-end route. The browser smoke provides normal-entry
examples with the original mission.

Port mission state/commands alongside visible Unity interactions. Keep a clear
list of route requirements still unsupported; do not present missing interactions
as completed gameplay. Existing unit tests remain useful, but the release gate
is a normal-input Unity walkthrough plus reload of the completed aftermath.

Deferred until that gate: further staffing policy/reservations, sleep schedules,
additional room workflows, Research/Discovery, full inventory/economy, additional
missions, rendering-tool work, final sprites and broad UI polish. Maintain the
existing working prototype without using those systems as prerequisites for
deployment. Authored rules and Reality/Knowledge/custody boundaries still apply.

## Implemented foundation and history

### Starting-base storage — October 18

The user's basic-base correction adds existing authored Material Storage,
Supply Storage, Equipment Storage and Containment instances (r7–r10), with
configured bulk/EQ/CC limits in the selection view. These are separate physical
rooms with their original staffing and room rules. The exact previous six-room
projection supports schema-13 migration, retaining SG teams, active mission
identity and partial Receiving work. No cargo is inferred or moved by the room
addition. [Storage scope and remaining work](unity-storage-rooms.md) records
the distinct authored capacity quantities and the missing offworld recovery ->
Receiving -> validated storage-custody integration for milestone 5.

### Operative return, debrief and prototype replay — October 18

The separately fingerprinted `missionRescue` definition carries the original
departure predicate tree. On the supported route, contact plus a clear medical/
guard route permits the authored untrained, no-Tool, one-tick SEND_TARGET_TO_GATE
work. The same operative subject ID moves to the Gate with AT_GATE state;
the active party remains in Holding. Source containment/social-passage alternatives
are not granted by this bounded adapter.

Returning through actual doors and redialing permits extraction to SGC, which
costs no additional tick in the source runtime. The operative becomes EXTRACTED
and only then completes Extract. Returning early without the operative is also
represented faithfully as an unsuccessful rescue. The Gate closes, the returned
mission remains as an immutable debrief/archive, and base time/assignment resumes.
Health and charges remain in that returned record; there is no automatic healing,
restocking, recovered-item grant or new recovery process. Multi-mission campaign
history and general medical recovery remain future integration work.

Save schema 11 preserves the return tick and operative location with separate
rescue-definition compatibility. Older saves gain no departure or extraction.
**Reset mission** beside Save/Load discards the current prototype attempt,
restores fresh mission deployment/loadouts and keeps base time, RNG, staffing,
Receiving and transfer state. It is a testing/replay control, not a canonical
recall/healing action. It does not change the saved slot until Save is pressed;
Load can recover the previous saved attempt/debrief.

Validation: 183 EditMode, 10 PlayMode and 26 relevant Node tests pass; compilation,
snapshot freshness and diff checks pass. The normal-input UI walkthrough covers
the complete rescue, mid-work reload, SGC return/debrief, base health inspection,
reset/replay and loading the unchanged saved result. Debrief/toolbar were visually
reviewed using a separate test campaign. The player's actual Holding/tick-21
mission was restored without extraction, reset or a player-slot write.

### Patient care and secure route — October 18

The Holding view now offers **Patients & evacuation**, with each patient's
condition, stabilization control and route blockers. The three original Recipes
reuse the field-work Actor/Tool transaction: Medic I, equipped MET1, one charge
and one tick per completion. Start/cancel are free, and reserved Actor/Tool plus
completed patient work survive reload. All three stabilized patients resolve
the original medical Incident; neither treatment nor a clear route completes
Extract or changes operative custody.

The original neutral-only +20 guard suspicion is preserved. After contact,
the second treatment can reach the authored 100 threshold and start the Holding
guard encounter at round zero. Down guards receive no such effect. This supports
treatment-triggered escalation, not every remaining mission trigger/dialogue.

Secure-route queries follow known Stage/door connectivity and require each Stage
to be clear. Neutral/dormant guards and an unresolved active medical Incident
block evacuation. Guard clearance alone is insufficient. A separately
fingerprinted `missionCare` projection and schema 10 retain earlier battle/party
saves without inventing patient progress. Completed work also validates its
Tool-charge spend and nonoverlapping work intervals.

Next: port the authored operative-departure predicates and SEND_TARGET_TO_GATE
effect, then actual Gate extraction/debrief and saved SGC aftermath. Source
containment, alternative care paths and other facility branches are deferred.

Validation: 174 EditMode, 10 PlayMode and 16 relevant existing Node tests pass;
compilation, snapshot freshness and diff checks pass. The actual patient panel
was visually reviewed. The player's Holding/tick-8 session, team, injuries and
guard victories were restored without treating patients or writing the save slot.

### Patient care and secure route — October 18

The Holding view now offers **Patients & evacuation**, with each patient's
condition, stabilization control and route blockers. The three original Recipes
reuse the field-work Actor/Tool transaction: Medic I, equipped MET1, one charge
and one tick per completion. Start/cancel are free, and reserved Actor/Tool plus
completed patient work survive reload. All three stabilized patients resolve
the original medical Incident; neither treatment nor a clear route completes
Extract or changes operative custody.

The original neutral-only +20 guard suspicion is preserved. After contact,
the second treatment can reach the authored 100 threshold and start the Holding
guard encounter at round zero. Down guards receive no such effect. This supports
treatment-triggered escalation, not every remaining mission trigger/dialogue.

Secure-route queries follow known Stage/door connectivity and require each Stage
to be clear. Neutral/dormant guards and an unresolved active medical Incident
block evacuation. Guard clearance alone is insufficient. A separately
fingerprinted `missionCare` projection and schema 10 retain earlier battle/party
saves without inventing patient progress. Completed work also validates its
Tool-charge spend and nonoverlapping work intervals.

Next: port the authored operative-departure predicates and SEND_TARGET_TO_GATE
effect, then actual Gate extraction/debrief and saved SGC aftermath. Source
containment, alternative care paths and other facility branches are deferred.

### Guard encounters — October 18

Added the authored Yard/Holding combatants and stats as separately fingerprinted
`missionCombat` data. Immutable battle records replay the existing party-first
targeting, damage and Down outcomes. Per-user timing, an encounter commits exactly
one campaign tick at victory, defeat or disengagement, independent of round count.
The same transaction advances base work/transfers and Gate expiry. Playback is
presentation-only (provisional 0.75 seconds/round), with manual stepping and pause.
Reload restores exact rounds/health and starts paused. Retreat is not a teleport
or heal. The UI blocks movement/work during combat and preserves incapacitation.

Schema 9 records battles/outcomes with a combat-definition fingerprint; earlier
saves gain no battle outcomes or cleared guards. The map marks active combat and
guard clearance on visited rooms without exposing hidden areas. This is guard
clearance only: the active medical Incident, operative departure and real secure
Gate route still need implementation before evacuation/extraction can succeed.
Surrender, automatic suspicion escalation, repeat contact and recovery remain
unsupported. No new canonical rules/data were authored; source combat assumptions
and the already-approved Unity timing override are retained.

Validation: 164 EditMode, 9 PlayMode and 16 relevant existing Node tests pass;
compile and snapshot freshness checks pass. Tests include persistent injury,
mid-fight saves, retreat/re-engagement, defeat, corrupt ledgers and old saves.

### Schematic mission grid — October 18

User requested spatial feedback before continuing with a text-only interface.
Added a box map from authored Stage cells, showing known/visited rooms, the gold
team marker and open/locked doors. Adjacent open-room clicks call the existing
Stage move command; no tactical cell movement or new layout is invented. Hidden
room shapes/names stay hidden. A toggle switches the full right-hand panel
between the map and scrollable team/equipment details.
Geometry is a separate presentation projection and does not invalidate saves.
Validation: 153 EditMode and 8 PlayMode tests passed, including map visibility,
room clicks, the details toggle and the Holding/contact walkthrough.

### Holding access and operative contact — October 18

The authored Technician door hack now starts/reserves, cancels, reloads with
sticky Actor/Tool and commits its three minutes as one tick/Tool charge. Locked
movement is rejected until completion evidence exists. Entering Holding runs
the original passive identity observation and updates Locate/Extract objectives.
First contact uses the original dialogue and effects, including the conditional
+45 suspicion on the neutral Holding guard. Evacuation readiness remains local;
it grants no extraction, custody transfer, secure route or completed Extract.

Schema 8 persists work, observations, subject detection/readiness and objective
state. Pinned schema-7 migration validates against the exact previous entry
projection before adding initial new state; it preserves active old dialogue and
does not grant new exploration/Knowledge. Validation: 148 EditMode, 8 PlayMode
and 25 relevant existing Node tests passed, plus compile/snapshot checks.

Bounded continuation: first contact only. Repetition can push Holding suspicion
to the authored 100 threshold and activate its hostile Incident; that repeat is
not offered until incident/escalation handling exists. Other observations,
door-code access, treatment/source work, guard clearance and extraction remain
unsupported. The next step must implement those conditions rather than equate
neutral guards, an open door or readiness with a safe evacuation route.

### Mission entry route — October 18

Gate Yard -> Outer Yard -> original guard conversation -> Main Hall is now
implemented in Unity. Every move commits one campaign tick through the existing
base-work/transfer transaction; Gate expiry remains 12 ticks. All five authored
entry responses retain their profession/crosspath checks and Knowledge/NPC
effects. Conversations use no time or Tool charges. Revisit counts prevent the
first-visit conversation replaying. Hidden Stage names remain hidden until entry.

Schema 7 persists visits, open doors, conversation/node references, responder
history, Knowledge and NPC state. Version-6 deployment saves migrate from the
matching prior mission/loadout projection, retaining their Gate/party and
initializing only the Gate visit. Later doors, observations, rescue and debrief
remain unsupported; the Main Hall view explicitly identifies this boundary.

Validation: 130 EditMode, 7 PlayMode and 25 existing Node checks passed. The UI
walkthrough uses the original conversation and saves/reloads at the prompt,
answer and Main Hall without bypassing guards or unlocking later doors.

### Mission deployment foundation — October 18

Implemented the briefing/team-selection and Gate-arrival part of step 1. The
exporter validates the original finalized Missing Operative through its JS
compiler, then projects mission/arrival metadata and the existing roster's
structured branches and equipped Tool instances. It does not port the complete
mission runtime merely by validating that source.

The UI accepts 1–4 available Units, preserves IDs/stats/Tools and presents the
arrival Gate choice. Deployment and that choice take no time. Redial uses the
authored 180 seconds as one campaign tick and advances eligible base work.
Deployed Units cannot also staff the base, and base playback controls are
disabled offworld. Only explicitly unassigned Units may deploy; permanent SG
Team/Ready Room configuration remains out of scope rather than silently
overriding base assignments.

Save schema 6 adds a nullable expedition and fingerprint-pinned mission/Tool
configuration. Earlier saves gain no fabricated expedition. Tool instances,
slots, charges/damage, Unit stats, current Gate Stage and connection timing
roundtrip. Empty slots and specialist kits with unauthored Services grant no
capability. Movement, yard conversation, rescue and extraction remain the next
critical-path ports; arrival alone is not a playable mission or completed slice.

Status: October 18, 2026. Universal 2D project created by the user; first
room/roster selection, manual physical-room staffing, clock and versioned save/load implemented.
Receiving implementation now adds a provisional two-step inspection loop; see
the project README and current verification below. This supersedes the pending
Receiving-rule questions in the historical readiness review.
The local slot preserves current room/Unit identities and state, deterministic
random seed/state and selection. Current scope and limitations are documented
in the project README. Full campaign execution/persistence and player builds
remain later milestones. The user approved the consistent selection outline.
Deployment/Receiving/transfers/staffing/clock/save validation: 117 EditMode and 6 PlayMode checks passed in the live Editor;
compilation and snapshot freshness checks passed. Timing follows the explicit
user decision below. Initial RNG seed `1` remains a provisional technical choice
for this bounded slice; save schema 6 reads earlier prototype saves with explicit
clock/staffing/Receiving/transfer migration and no invented expedition. The 12
existing Offworld runtime/personnel-save Node checks also passed. A fixed shared presentation shuffle improves surname
variety; automatic progression suffixes are removed through a name-only migration
for known generated names, preserving custom saved names. The 26 focused
Node name-selector/portrait/Offworld-presentation checks passed.

Manual staffing uses authored per-physical-room capacity and one assignment per
Unit, with validation before commit. It does not implement execution admission,
SG Team/Base Response or Room Group scheduling. Transfer orders are a separate
application/domain system that validates destination reservations before commit.

Bootstrap instructions: [Unity project README](../unity/StargateOrionis/README.md).

## Staffing transfer orders — October 18

User confirmed the Receiving loop and requested the next implementation plus
less repetitive name suffixes. Removed automatic `Sr.`/`V.` decorations from
specialization/cross-path names; qualifications remain in structured fields.
An archived snapshot pins the specific name-only compatibility path so existing
Receiving work survives the change. Only exact known generated names are cleaned.

`Domain/StaffTransfers.cs` now provides immediate, after-next-tick and
finish-current-step moves. Pending moves reserve destination staffing capacity
while the Unit remains assigned at its source. Cancellation releases the place
without losing work; invalid replacements retain the old order. Explicit Unassign
also cancels that Unit's pending transfer. Conflicts are rejected and can be
resolved by selecting the reservation owner and cancelling its planned move.

Tick ordering for this slice is work eligibility/progress from tick-start state,
then due staffing moves, then validation and one campaign-state commit. Actors
cannot work in the new room during the same tick. Finish-step binds to an already
started personal step and waits through inspection pause or unavailable capability.
Idle staff have no step to finish and move immediately under that option.

Save schema 5 persists transfer references and reservations. Earlier saves
migrate without invented pending orders; schema-4 Receiving state is preserved.
The first UI exposes the three timings and explicit cancellation. General
contiguous-task interpretation, sleep/medical availability, Response/SG Team
orders, conflict dialogs and Room Group scheduling remain later integrations.
The bounded rule is finish the captured personal step, not a whole multi-Actor
Recipe. There is no persisted fractional current-tick personal work to lose.

## Next slice: Receiving execution readiness

### Implementation update — October 18

The user authorized provisional design choices. Implemented the two existing
Receiving steps as a linear work recipe in
`demos/shared/data/receiving-prototype.json`: Technician I with equipped `TET1`
for two ticks, then Scientist I with equipped `SCT1` for two ticks. Neither
requires an additional technical Room Service or consumes expendable charges.
These are bounded playtest rules, not universal hazardous-item handling rules.

Unity imports the existing incoming Asgard instance, permitted exposure, authored
admission/transitions/capacity, structured worker qualifications (including
cross-path ranks), and equipped Tool Services. The standalone item table is the
explicit storage source; retained fixture packs remain unchanged. Work checks
destination Room Services when required, without borrowing from remote rooms.

The panel admits that single test arrival, shows permitted findings and progress,
and pauses/resumes inspection independently of the clock. Tick commits advance
at most one step per Actor, permit independent workers concurrently and defer
dependent steps until the following tick. Moving staff preserves committed work
and waits for its original Actor. Save schema 4 persists custody references,
pause/progress/Actor state and pins the work definitions; older saves gain no
inferred items or work. Step completion evidence reconstructs permitted Knowledge
without exposing the hidden origin/physics or granting institutional Knowledge.

General inventory transfers, Item Base Model routing, sleep/medical availability,
Doctrine, transfer reservations/policies and destructive outputs remain later
work. The first loop ends at Receiving complete and routing review.

### Historical readiness review — October 17

The [worked-item gap audit](unity-receiving-gap-audit.md) locates the three
existing rifle/vest examples, their bindings and process snapshots, the separate
technical requirements, and the specific data/runtime gaps. Reuse that work;
do not ask the user to reconstruct definitions already in the repository.

October 17 review: Receiving is the candidate first base-work loop, but its
current authored data does not yet define an executable Recipe. No Receiving
scheduler or work duration has been added to Unity by this review.

The existing sources establish these separate contracts:

| Source | Established behavior | Missing execution data |
| --- | --- | --- |
| `rooms_schema.json`, Receiving | Intake custody, INV storage admission, CT inventory capacity 40/60/80, staffing 2/4/6, `CAN_ACCEPT_RECEIVING` | Configured technical Room Services; this admission capability is not a substitute for a Room Service. |
| `process-matrix.json`, `processing-contracts.json` | Required processing tags and authorization/completion tag transitions | Actor, Tool Service, Room Service, duration and work graph. |
| `item.json`, rifle fixture pack | Existing Reality and allowed Receiving identity/condition exposure | Binding those observations to executable work steps. |
| `js/process-transfers.mjs` | Manual next-tag reveal; completion after applicable tags are known; validated custody transfers | Staff resolution, elapsed work, sticky Actors and scheduling. One simulator click is not an authored tick cost. |
| [Recipe/bubble contract](theory/architecture/recipe-bubble-contract.md#receiving-is-universal-intake) | Typical handling involves a Technician; broad item classification involves a Scientist | Exact minimum tiers, per-step duration, required Services and concrete Recipe binding. |

The existing coil-rifle fabrication Recipe is not a ready Receiving alternative:
it describes different work, specialized Workshop Services and no concrete bubble
durations. The known-vest exit also explicitly defers its Item Base Model evidence
and boundary requirements; do not implement it as automatic identification.

Before scheduling Receiving, settle the two steps' minimum tiers, durations and
Tool/Room Service requirements, including explicit absence where appropriate.
Then author the bounded Recipe and its item-exposure bindings without inventing
new science, deep identification or automatic routing. The general operational
and action timescales are guidance, not a selected Receiving duration.

Implementation order once those requirements are established:

1. Import the relevant existing item definitions and persistent instances, keeping
   Reality separate from player-visible Knowledge. Preserve IDs and custody in
   versioned saves; reject invalid admission/capacity before mutation.
2. Import structured Actor qualifications, required equipped/configured Tool
   Services and physical-room Service configuration for this Recipe. Resolve
   eligible staff locally and retain Actor identity after personal work starts.
3. Advance the work through validated campaign tick commits; persist completed
   steps, partial progress and the chosen Actor. Define dependency ordering and
   interruption behavior explicitly before adding scheduling policy.
4. Show requirements, progress and permitted findings in Receiving. Verify
   completion, unavailable capabilities, interruption/resume, save/load and
   unchanged hidden Reality. Do not claim full Doctrine, Room Group or transfer
   scheduling from this bounded implementation.

Baseline verification: all 15 existing Receiving/process-transfer Node tests pass.
This review changes the migration plan only; authored fixtures, Unity runtime
and player saves remain unchanged. Execution-rule questions are pending; no
provisional Profession tier, Service or duration has been selected.

## Approved Unity timing — October 17

The user's latest decisions resolve the earlier time conflicts: one tick is
three game minutes; movement costs one tick; an entire combat encounter costs
one tick regardless of its visual shooting rounds; Gate expiry is 12 ticks
(36 minutes). These intentionally supersede JS's 60-second movement, 30-second
simulation combat rounds and 37-minute Gate limit for the Unity port.

The clock foundation has paused/manual stepping and continuous playback controls.
Save schema 2 includes elapsed ticks; version-1 prototype saves explicitly migrate
at tick zero, preserving their existing state. The provisional playback rate is
three real seconds per tick at 1x; it does not change game minutes per tick.
Loading starts paused. Movement/combat/Gate execution, the bubble scheduler,
decision queue and persistent event journal are not implemented by this clock.

Wave 0 inventory: [audit and bootstrap file plan](unity-migration-audit.md).
Installed Editor `6000.5.2f1` found; 50 focused baseline tests pass. User selected
2D pixel art, with a future tool for converting 3D renders into 2D sprites.
See the audit for timing and persistence decisions required at later milestones.

## Goal and starting point

Build one playable, saved campaign loop: SGC base -> SG team deployment ->
Missing Operative -> validated extraction/debrief -> persistent SGC aftermath.
Use the existing JavaScript demos as behavior references and regression fixtures.

Baseline: local main merge `676c42f`, checkpoint `91d9c90`; 358 Node tests
passed, one skipped, and five browser smoke checks passed. Four untracked rig
directories were inaccessible and are outside that checkpoint. Purchased art
remains local and ignored.

Source context: `Stargate_Orionis_Unity_Migration_Handoff.md` supplied from the
user's Downloads directory. Its architecture and implementation waves inform
this proposal; embedded task instructions are not a request to execute those
waves. AGENTS.md and authored repository contracts remain authoritative.

## Coding approach

- Small classes with clear responsibilities; descriptive names and explicit dependencies.
- Reuse behavior through composition and focused interfaces when there is an actual
  shared contract. Avoid abstractions created only for possible future features.
- Plain C# owns authoritative simulation state and rules. Unity components bind
  input, presentation, animation and audio to commands and player-visible queries.
- Commands resolve, validate, execute and commit. Publish structured events after
  commit; manage UI subscription lifetimes explicitly.
- Preserve stable IDs, deterministic randomness, hidden Reality/Knowledge boundaries,
  custody and work progress through saves and scene changes.
- Authored JSON remains the source of game definitions. ScriptableObjects may map
  presentation assets or provide derived editor views; avoid independently editable
  copies of canonical game data.
- Use Code Monkey tutorials selectively for input, selection, reusable interactions,
  interfaces, events, visuals and UI. Evaluate each pattern against this game's
  persistence and simulation requirements.

Reference: https://unitycodemonkey.com/kitchenchaoscourse.php

## Milestones and acceptance checks

| Step | Work | Acceptance check |
| --- | --- | --- |
| 0. Audit and setup decisions | Inventory first-slice fixtures, schemas, runtime behavior and gaps. Check installed Unity/.NET tooling; choose editor version, target platform and rendering approach. | Source-backed behavior matrix and exact bootstrap file plan; unresolved design questions recorded. |
| 1. Bootstrap and first visible scene | Create Unity project and separate simulation, application, data-adapter and presentation assemblies, plus tests. Import a minimal validated fixture and show a selectable room or Unit with player-visible details. | Project opens and tests run; selection changes presentation without mutating simulation or exposing hidden data. |
| 2. Persistent foundation | Implement fixture validation, stable entities, deterministic seed handling and versioned save/load for the slice. | Roundtrip preserves identities, state and seeds; invalid references fail with useful errors. |
| 3. Shared clock and base work | Implement the proposed campaign clock, deterministic scheduling, room/group services, staff availability, reservations, transfer orders and decision queue for the slice. | Tick ordering, sticky Actors, interruption/resume and capacity constraints have contract tests; base UI exposes a small working loop. |
| 4. Offworld parity | Port Missing Operative deployment, movement, observations, work, dialogue, combat, Gate timing and extraction. Add Unity views incrementally with each interaction. | Existing mission routes work; committed actions advance shared time correctly; identical input and seeds reproduce authoritative results. |
| 5. Return and consequences | Apply extraction through validated custody/personnel/base transactions; persist charges, injuries, recovered objects and pending decisions as supported. | Complete SGC -> mission -> SGC loop survives reload without duplicated rewards or lost identity/progress. |
| 6. Presentation and expansion | Improve camera, map readability, UI, animation and art integration; extend systems individually after the loop is reliable. | Playable slice works from a fresh save and tolerates scene changes and interrupted operations. |

Presentation begins in step 1 and grows alongside the simulation. Final artwork
and a finished UI are not prerequisites for proving the game loop.

## Wave 0 deliverables: the next implementation task

1. Write `docs/unity-migration-audit.md` with four behavior categories: implemented
   and tested, proposed integration behavior, unresolved rules, presentation only.
2. Identify exact Missing Operative, room, roster, equipment, item/custody and save
   fixtures and their validators. Distinguish executable mission JSON from
   Mission Author semantic drafts and their unfinished Finalizer.
3. Inspect clock/action/combat code and document timing parity. The handoff's
   three-minute unified clock and staffing design describe integration targets,
   not behavior already implemented across the JS demos.
4. Historical timing conflicts were resolved by the October 17 user decisions
   above. Preserve the new 12-tick Gate limit and one-tick movement/encounter
   costs when porting; animation pacing remains separate from simulation time.
5. Check local tool versions and propose a compatible Unity/C# layout, initial
   assembly references, fixture import strategy, test commands and first scene.
6. Report the exact step-1 file plan and any decisions requiring user input before
   creating the Unity project. Reuse the baseline results unless inspection or
   changes justify additional focused checks.

## Proposed dependency direction

Unity presentation -> application commands/queries -> simulation domain.
Data and save adapters implement the boundaries needed by the application/domain.
The domain has no dependency on Unity scenes, GameObjects or MonoBehaviours.
Actual paths and package choices are settled in Wave 0 after checking tooling.

## Visual direction and future sprite tool

User decision, October 17: the game uses **2D pixel art**. Use the available 2D
template for the Unity bootstrap, with placeholders sufficient to prove selection
and data loading. Camera angle, pixel density and final sprite dimensions remain
art decisions; do not silently equate pixel art with the current overhead studies.

Plan a separate tool that accepts 3D renders and produces reusable 2D sprites.
Initial proposed workflow:

1. Import rendered images or frame sequences, preserving the originals.
2. Set a consistent output size, camera/view convention, pivot and scale profile.
3. Preview pixel reduction, transparency, palette/shading options and animation
   frame registration against the intended in-game display size.
4. Export PNG frames or sprite sheets with frame/pivot metadata and an import
   preview in Unity. Preserve registered alignment rather than independently
   centering every animation frame.

Decide later whether the tool also controls a 3D renderer or only processes its
outputs. Source renderer, supported views, animation workflow, palette treatment
and export contract are not selected. Prototype one static asset before expanding
to animation. Existing sprite contracts remain references; adopt or revise them
explicitly rather than assuming they already define this new pipeline.

This is a planning item, not tool implementation. Keep it independent of simulation
rules and the first playable loop; importing art must not change authored game data.

## Scope boundaries and open decisions

- Installed Editor and 2D pixel-art direction are established. Windows is the
  proposed first build target. Exact camera, pixel-art rendering configuration
  and future render-to-sprite tool details remain to be established.
- Clock rules are confirmed by the October 17 user decision. Confirm the
  handoff's remaining staffing/transfer details before their implementation;
  do not infer approval solely from the document labeling them approved.
- Combat interruption/retreat/re-entry and the point of the encounter's single
  tick commit remain separate questions for the offworld integration milestone.
- Missing Operative is the initial parity benchmark. Last Transmission can become
  a second regression scenario once the shared runtime works.
- Defer full economy, faction AI, automatic Mission Author finalization and broad
  content expansion until their contracts are ready.
- Preserve existing JS demos and authored data. Make migration work on a dedicated
  branch; no automatic publication, remote push or deletion of prototype systems.

### Warehouse clarification and member-list fix — October 18

Warehouse r11 now supplies the approved provisional 20-place/1×1 temporary
holding room (no staff, Cores, joining or stacking). Its purpose is safe holding
before deciding retention, distinct from Equipment Storage for accepted equipment
and Containment for unsafe/insufficiently classified hazards. Physical location
and retention must remain separate when implementing cargo. Schema 14 preserves
existing state. Full offworld item recovery -> Receiving -> capacity/safety-checked
storage and disposition is still the next cargo integration gap.

Four-member summaries now scroll in the Ready Room and mission briefing;
all ordered member names remain available at short viewport heights.
Validation: 204 EditMode, 11 PlayMode and 22 focused Node checks passed.

### First physical recovery loop — October 18

The existing medical-worker persuasion reveals the authored Holding equipment
crate. Optional debrief recovery retains both the package and its unknown rifle.
Base > Recovered cargo admits the same rifle to Receiving, reuses the two-step
inspection and permits compatible Containment after completion. Schema 15
preserves original physical evidence, current location, recovery provenance and
work history; reset/replay cannot duplicate the fixed IDs. Ordinary-storage
clearance, retention and issuing are not yet implemented. See
[cargo walkthrough and limits](unity-cargo-recovery.md).

Validation: 215 EditMode, 11 PlayMode and 23 focused Node tests passed. After the final crate-label/percentage adjustment, all 11 cargo EditMode checks and the full rescue/cargo UI walkthrough passed again. Clean compilation, snapshot freshness, syntax and diff checks passed. The cargo panel was visually reviewed. The original tick-40 Gate Yard campaign (no cargo) was restored without writing the player save slot.

### Warehouse clearance and retention — October 18

The user chose the recovered rifle as intact and safe for ordinary storage, with
unfamiliar technology. Data-driven Receiving handling review reveals those facts
without changing the original physical snapshot or granting use/technology
Knowledge. It reserves primary Containment during process custody, shares the
Actor tick budget with intake and retains sticky work across pause/reload.
Warehouse transfer validates capacity, and retention intent is separately saved.
Schema 16 extends the cargo ledger. Equipment certification/issuing remains next.
See [workflow and limits](unity-warehouse-clearance.md). The separate tier-III
playtest roster is preserved for fresh games; explicit original-progression
compatibility now retains existing campaigns without inferring new qualifications.

Validation completed October 19: 228 EditMode, 11 PlayMode and 30 focused Node
tests passed. Compilation, snapshot freshness, exporter syntax and diff checks
passed. Visual review covered active primary Containment reservation and completed
Warehouse storage with independent retention. Both original and fresh playtest
rosters validate. The latest saved tick-0 session was restored after isolated
review; the player save file is unchanged (SHA-256 verified). The older tick-30
campaign backup remains available in the Unity project Logs directory.
