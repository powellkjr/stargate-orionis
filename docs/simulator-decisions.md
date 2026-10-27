# Simulator decisions — October 4, 2026

These explicit user decisions supersede conflicting historical proposals for
the simulator topics below. Recording a decision does not mean it is implemented.
Keep physical state, Knowledge, execution capability and custody separate.

## Unity personnel continuity — October 20, 2026

The bounded mission-loop continuation now separates normal **Prepare
redeployment** from the existing **Reset mission** debug action. Preparation
retains returned Unit health, stamina/endurance and existing Tool damage/charges;
new deployment snapshots starting health for deterministic combat replay. Current
weapon/armor custody and reserved storage persist independently as before.
Defaults remain the imported shared roster/loadouts/combat values. No recovery,
recharge or resupply formula is inferred. Incapacitated Units remain unavailable.
Preparation is instantaneous and does not write the save; schema 20 persists
the condition ledger and starting health. Old saves keep their actual current
expedition and gain no invented prior sorties. This replays the same authored
mission; multi-mission selection/history remains a separate migration.

## Storage transfer timing and Supply cargo clarification — October 19, 2026

Follow-up: the user directed checking `demos/shared/data/*.schema.json` and
authorized **1** as the provisional missing Supply conversion stat. The schemas
have cargo/storage fields and S1/S2/S3 tabs but no conversion or Pristine rule.
This fallback does not turn the recovered rifle's container into resource cargo.
The user identified that case as an **Unknown weapon crate**. Its shared item
definition now uses existing `nameResolution.initialName`/`processExitNames` and
the known name **Weapon crate**. The historical SIM_SUPPLY_CRATE identifier is
retained for physical-instance/save compatibility; it is not a Supply balance.
`nameResolution.previousName` records the old label for explicit compatibility.
No separate Unity label configuration or invented Supply quantities are used.
Actual resource intake/value accounting remains future work; the authorized
conversion stat is 1 until revised, with no new Pristine threshold inferred.

User decision: storage-to-storage reassignment costs one tick; custody-only
movement costs zero. Unity validates the destination before committing the
transfer and one ordinary base tick atomically. Incoming inventory is a storage
fallback, so assigning the first room storage also costs one tick. Work duration
is independent of custody movement. No retroactive costs are added to saves.

For actual Supply resource crates, the user wants an initially Large supply
crate (handling cost in the 5–10 range) identified as Large Pristine S2 supply
crate after safe inspection. Pristine denotes high conversion; S2 is the
destination Supply Storage tab. These semantics are authorized, but an exact
conversion stat/formula and confirmation that the recovered equipment container
is also resource cargo remain missing. Existing fixtures provide S1/S2/S3 tabs
and a generic handling-cost-1 SIM_SUPPLY_CRATE containing the rifle. Resource
quantity/quality must be authored Reality revealed by inspection, never invented
by inspection or inferred merely from the placeholder item name.

## Validated storage and temporary custody — October 19, 2026

Explicit user clarification: every physical instance has validated fallback
storage, independently of its current custodian. Sending an item to Containment
makes that Containment room its validated storage. Sending it onward to Analysis
changes custody to the lab and preserves the Containment assignment. Warehouse
and Equipment Storage are also storage destinations; processing rooms generally
provide temporary custody, not storage. Equipped items keep Equipment Storage
assigned while custody belongs to the Unit.

The fallback allocation remains reserved and counts against capacity while the
item is away. Returning it must therefore not require finding a new storage
place. Changing storage validates the destination before releasing the old
allocation, and all transfers preserve the physical instance ID. Having a
fallback does not by itself authorize moving unsafe items through arbitrary
rooms or bypass work admission requirements.

Further user correction: Containment is storage only. Processing remaining tags
requires a staffed Analysis lab; the previous Containment examination prototype
is superseded. Its provisional Scientist I/SCT1/two-tick tuning is now applied
in Analysis, using the existing authored CAN_ACCEPT_ANALYSIS capability and
one-item process workspace. No new scientific outcomes or Services are invented.

Implemented in Unity schema 19: StorageRoomId (legacy RoomId alias), explicit
StorageLocationId and CustodyRoomId distinguish reserved storage from work
custody; EquippedUnitId remains the alternate Unit custodian. Incoming inventory
is an explicit logical fallback while Receiving holds custody, not a new room
with invented capacity. Analysis preserves storage allocation and offers return
to it after processing. Legacy handling also preserves its Containment storage.
Older saves retain completed findings as historical evidence; unfinished work
in Containment is removed rather than continuing or inventing a lab Actor.
Assignments, item IDs and unrelated mission state remain unchanged. Automatic
failure/recovery actions remain unspecified; this batch guarantees the fallback
reservation, not an invented failure scheduler.

## Ready Room and permanent SG teams — October 18, 2026

User clarification: Ready Room follows Response Room, with four Units and no
Cores, stacking or joining. The implemented first slice uses the Response 1×1
footprint, fixed four member slots, one team per physical room and CT1 only.
No processing Room Services or item custody are supplied. Permanent SG team
membership excludes ordinary room staffing; deployment assigns the saved team
as a whole. Membership/designation locks while offworld and survives return,
Save/Load and prototype Reset mission. No new doctrine, sleep/recovery policy,
construction cost or automatic composition was selected.
See [the Ready Room contract](unity-ready-room-plan.md).

## Unity campaign timing — October 17, 2026

Explicit user decisions for the Unity migration supersede prior timing proposals:

- One campaign tick is three game minutes.
- Stage movement now costs one tick, replacing the JS prototype's 60 seconds.
- A whole combat encounter costs one tick regardless of how many visual shooting
  rounds it takes. Shooting/animation rounds may be faster than a tick and do not
  each advance campaign time.
- The Gate connection limit is now 36 minutes, or 12 ticks, replacing 37 minutes.

These are intentional parity changes, not rounding approximations. The Unity
clock foundation uses these constants; movement/combat/Gate runtime ports remain
future work. The JavaScript fixtures/runtime still preserve the prior benchmark.
Interrupted combat/retreat/re-entry and the exact point at which an encounter's
single tick is committed remain to be specified when combat integration begins;
do not charge one tick per animation round or silently double-charge on reload.

## Unity Receiving playtest choices — October 17, 2026

The user authorized choosing provisional rules to make the first work loop
interesting and exercise the needed features. The bounded authored recipe is
`demos/shared/data/receiving-prototype.json`:

- Determine handling: Technician I, equipped `TET1`, two ticks.
- Determine item class: Scientist I, equipped `SCT1`, two ticks, after handling.
- No additional technical Room Service or expendable charges for this baseline
  inspection. Receiving admission capability and compatible custody capacity
  remain required. These choices are playtest tuning, not universal rules for
  hazardous, biological or advanced investigation work.
- Each completed step exposes only its existing item-authored category of facts
  that are actually present in Reality. No origin/advanced physics identification,
  institutional Knowledge, automatic Analysis requirement or automatic transfer.
- Use the existing incoming Asgard instance and current standalone `item.json`
  storage compatibility. Preserve retained packs with their historical flags.

The Unity slice evaluates work once per tick, retains sticky Actors and committed
progress through pause/reassignment/save/load, and prevents dependent work from
starting in its predecessor's completion tick. General Doctrine, sleep/medical
availability, reservations, active transfer policies and output routing remain
later integrations. Existing JS manual simulation behavior remains unchanged.

## Unity staffing transfer slice — October 18, 2026

Under the user's authorization to make provisional choices and proceed, the
current slice provides immediate, after-next-tick and finish-current-step moves.
Scheduled moves reserve destination staffing capacity, and validate before
replacing an old order. Work advances from tick-start assignments, then due
transfers join the same atomic tick commit. New destinations supply no work
within that tick. A paused/blocked finish-step order waits with its reservation.

For this bounded UI, finish-first means the captured, already-started personal
step. Idle staff move immediately. General contiguous-task policy across Recipes,
sleep/medical availability and Response/SG Team orders remain deferred. Reservation
conflicts reject the new request; the player can explicitly cancel the owner's
planned move before retrying. A dedicated release/abort dialog remains future UI.

The user also requested fewer `Sr.`/`V.` names. Those were automatic progression
markers, not authored family suffixes; they are removed. Name-only migration
cleans exact generated names and preserves custom names and work state.

## Evacuation, extraction and admission

- A secure route has no active or potential obstacles. An enemy remaining in
  the outer yard blocks evacuation through it. Secured, surrendered, withdrawn
  or otherwise resolved enemies need not block evacuation.
- Party withdrawal is separate: the party may pass back through an unsecured
  yard and extract, but cannot evacuate the operative or loot through that yard.
  This does not remove ordinary movement/connection requirements.
- Before the evacuation screen, selection only marks a subject for extraction;
  it does not commit a transfer or change custody.
- Validate storage/admission contracts only for selected subjects when the
  extraction plan is committed. Reject invalid plans before custody changes.
- The demo Reset button must clear Holding and Receiving capacity usage. Its
  current release of only the current run's reservations is not sufficient.
  Implementation must identify occupancy versus reservations and preserve room
  configuration and unrelated capacity; this is a sandbox reset, not a general
  production rule for deleting prisoners/items.
- Application of the unsecured-route rule to already-collected portable party
  inventory still needs clarification against automatic-return behavior.

## Bypasses and restoration

- A bypass persists during the offworld visit unless deliberately restored.
  Party Gate departure is expected to restore the map for a later visit; exact
  persistence boundaries must be reconciled before implementing a global reset.
- Restoration can provide security/social value, spends a Tool charge, and does
  not refund earlier charges. It may remove the access gained by the bypass.
- Example: hacking a panel establishes tampered state and access; repair removes
  tampering but can remove access. Alerts and later combat consequences must be
  authored, not inferred from prose or applied to every panel automatically.
- Represent these as forward Recipe transitions, not reversing completed work.

## Stats and movement resources

- Stamina is a resource, not a radar stat. Present it as a white resource bar
  below HP; replace its radar axis with expertise.
- Exploration of a new tile costs 3 Stamina; movement through an explored tile
  costs 1. Return estimate is distance to the Gate at cost 1 per travel tile.
- Reconcile tile distance with current multi-cell Stage movement before charging
  per tile; do not silently treat a Stage as one tile.
- Expertise counts progression ranks, including each entered path's untrained
  rank 0. An absent path contributes nothing; rank 0 is not an absent path.

  | Expertise | Progression milestone |
  | --- | --- |
  | 0 | No Profession: civilian or unspecialized recruit |
  | 1 | Base Profession untrained rank 0 |
  | 2–4 | Base Profession ranks I, II, III |
  | 5 | After base III, enter a cross-path or specialization at untrained rank 0 |
  | 6–8 | Branch ranks I, II, III after base III |

- Calculate expertise as base rank + 1 when a base Profession path exists, plus
  branch rank + 1 when a cross-path or specialization exists. Thus Tech II = 3;
  Tech III + Scout II = 7; Tech III + Overdrive II = 7. Radar maximum is 8.
- This settles expertise presentation, not execution qualification: untrained
  rank 0 must not satisfy a rank-I Profession requirement. Current simulator
  loadout validation supports tiers I–III; representing absent/rank-0 paths
  requires explicit schema support rather than reinterpreting those records.

## Communications and strategic map — deferred implementation

October26 Unity follow-through: the user requests a Command room named
**Communications**, whose Core places will receive missions. Shared room schema
and catalog now contain a provisional Response-derived 1x1 envelope: CT1 two
staff and two Core places (24 hours / 24 S1 under current construction rules),
no joining or storage. Staffing progression reuses 2/3/4; Core places remain two.
This authors the room envelope only. No mission-acquisition Core definitions,
input/output Recipes, selection policy or generation timing were found; these
remain an explicit authoring gap. Do not invent mission drops, frequencies or
political permission. Data Storage is categorized under Storage at user request.


- Knowing an address permits dialing subject to physical connection rules;
  unfamiliarity is not political permission to dial. The destination might not
  open its Iris.
- Familiarity may provide known communication channels/frequencies, potentially
  an array including general, trade, defense and local. These examples are not
  yet a validated enum or invented frequency data.
- Defer world-map simulator changes for now.

## Unusual creatures and receiving contracts

- Unusual creatures still require receiving/storage contracts. Do not admit a
  large creature whose requirements exceed SGC capability.
- A collect-sample or observation process is a one-hour work bubble to establish
  enough information for SGC containment assessment through the Gate.
- If containment is feasible, extraction offers Send to containment. Otherwise
  offer non-destructive or destructive harvest paths.
- Actor, Tool, Room Service, sampling outputs, destruction/salvage outputs and
  contract data still require authored definitions. Do not grant Knowledge of
  hidden Reality or invent new Recipes to implement these choices.

## Cultural Platform

- Clone the Tech Platform definition as the starting point; default footprint
  is 2×2. Review copied identifiers and capabilities against room/Core authority
  before implementation. This does not authorize hidden cultural stat bonuses.

## Deferred

Dialogue/repeat/recognition design and world-map changes are deferred. Biological
history and campaign ending questions remain on their existing review lists.


## October 20 - Provisional room construction pricing and CT1 review

- Construction costs Supply only, at one Supply per work hour; upgrades use
  the destination tier's Supply and charge additional capacity.
- Initial rates were 6h/Core, 12h/staff and 3h/INV. User subsequently requested
  roughly equivalent construction work for one staff place, ten INV places
  and 1,000 resource units. Current provisional pricing is therefore 6h/Core,
  12h/staff, 1.2h/item INV, 0.012h/bulk resource unit. The later equivalence
  supersedes the initial three-hour per-INV rate.
- Shared policy/schema: room-construction-prototype.json and
  room-construction.schema.json. Shared evaluator: room-construction.mjs.
  Unity projects complete quotes/breakdowns; shared bulk groups count once.
- User requested CT1 standardization around 4 staff / 4 Cores / 40 INV /
  4,000 resources with few exceptions. They requested a chart/checklist before
  resolving those exceptions: docs/room-capacity-standardization-checklist.md.
  No room capacities have changed yet. Upper-tier progression and save migration
  remain part of applying the approved capacity profile.
- Current quoted people places provisionally count with physical inventory;
  the checklist explicitly asks whether they should instead use staff-place
  pricing. Unknown Core counts block a complete estimate.
- Prices are read-only estimates. Actor/Tool/Room Service requirements,
  Supply reservation and persistent construction execution remain to implement.


## October 20 - Corrected CT1 baseline and Ready Room progression

This later user decision supersedes the four-staff/four-Core proposal and the
initial three-hour-per-INV pricing discussion.

- Ordinary supported staffing/Core baseline: two each. Gate Room starts with
  four staff/two Cores. Response Room has two Cores; Cultural/Tech Platforms
  have two (one Focus + one Support). Existing automated/no-Core capabilities
  remain absent; no new Services are granted.
- Containment starts with 40 INV. Equipment Storage/Warehouse retain 20;
  Equipment Storage's two tabs share that physical capacity. Bulk Material,
  Ration and Supply Storage start with 2,000 resource capacity.
- Ready Room membership progresses 4/5/6 with CT. Missions deploy at most four
  selected members. Experience splits equally among all assigned team members,
  including reserves. Equal-share allocation is implemented; mission XP reward
  amounts and persistent award/progression execution remain unauthored.
- Lockers are per resident: two Tool places per CT1 resident. Four resident
  places and eight maximum locker places are not twelve item INV places.
- Provisional tuning: six hours per staff/Core/occupant place, per ten INV or
  per 1,000 bulk capacity. New-room shell/commissioning minimum 24h. One Supply
  per work hour; additional-capacity upgrades use destination-tier Supply.
- All 21 CT1 quotes are 24-48 hours. Other upper-tier counts remain unchanged
  unless explicitly revised above; do not silently invent a new progression.
- Current approved chart: docs/room-capacity-standardization-checklist.md.
  Room data and JSON authoring schema, Unity projection, capacity migration,
  roster/deployment UI and shared storage allocation reflect these decisions.

## October 23, 2026 — Staffed Maintenance construction playtest

The starter base includes its essential support rooms; expansion adds capability
rather than requiring an idle-roster shortcut to bootstrap Maintenance. Shared
room-construction-prototype.json now authors local Maintenance Technician1/TET1
and a separate Soldier1 security bubble. User's “SOL1” is interpreted as the
existing SO1 Profession requirement, not a new Tool or Service. The provisional
security hour is included in the existing quoted duration/cost. Twenty display
segments represent these two actual sequential bubbles and use profession colors.

Provisional stock is 500 S1 / 200 S2 / 100 S3, reserved in Supply Storage. Clicking
uncleared rock in clearance mode awards 10 S1 once and leaves a persistent empty
cell; no additional excavation duration/Recipe is invented for this click test.
Supply capacity and build inputs validate before commit. Construction sites own
progress and their future physical room ID; no cancel refund is implemented.
Existing saves gain the additional starter rooms without losing old room IDs,
assignments, teams, personnel or progress. Starter Maintenance staff are seeded
only when their explicit Units are free. Support-room presence does not implement
healing, resident lockers, generators or ration consumption by itself.

## October 23 — Physical upgrades, ordered Groups and faster base pacing

Base speeds now support1x,4x,8x,16x without changing committed tick semantics.
A global resource header reads current stock; missing Materials/Rations entries
are zero, not random stock from the simulator UI's illustrative initial ranges.
The resource-class labels and Group layouts are projected from rooms_schema.json.

Physical upgrades use shared additional-capacity quotes and destination CT Supply.
The existing physical room stays valid at its old capacity during work, then
changes tier under the same ID. Assignments, item custody and fallback storage
are preserved. The provisional construction Soldier/TET1-Technician execution
also applies to upgrades. Zero-delta quotes do not create free capability.

Groups use the existing simulator's ordered primary/secondary child references:
two matching adjacent rooms ->1x2, two pairs ->2x2. Physical rooms do not merge;
Core ownership remains physical. Split before a child upgrade and rejoin matching
CTs. Runtime searches destination staff first, then other Group children in their
recursive order. Tool checks remain actor-equipped; idle roster and other Groups
are not automatic sources. Sticky Actor work and finish-step transfers retain
the actual work reference even when the permanent staff home is another child.

Schema22 adds upgrade source tiers and Group records; schema21 construction
remains readable. Original roster progression now serializes under current
content scope, preserving its actual personnel tier and construction together.

Group Core installation is not complete: the theory fixture defines two technical
Cores, but does not supply owned instances and a complete installation Recipe
path for this campaign. No automatic grant or substitute Service was added.
The reusable construction visual is passive: fills interpolate only up to
committed work, active segments pulse in profession color, and active jobs sort
above completed history. It does not rebuild the bar hierarchy every tick.
