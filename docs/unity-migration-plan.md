# Unity migration plan

Updated October 26, 2026. This is the active roadmap. The [previous plan and chronology](unity-migration-history-2026-10-20.md) are preserved as history; their old “next” entries no longer set the work order.

## Active priority: complete the playable mission loop

**Three wider implementation waves remain (3–5).** The supported repeat-sortie loop is implemented. This batch closes the playable UI/build implementation wave; its release acceptance still requires the user’s standalone playthrough and relaunch/resume. Final art and full simulator parity are not claimed.

The technical loop already works: SGC -> SG team -> Missing Operative rescue -> extraction -> recovered equipment -> saved personnel condition -> redeployment. Finish the decisions that make repeated play useful and deliver a build before expanding the full simulation.

## Already implemented

| Area | Current capability |
| --- | --- |
| Foundation | Domain/application/data/presentation boundaries, stable IDs, seeded state and saves through schema 32. |
| Base support | Room/roster selection, four-member SG teams, staffing/transfers, shared clock and bounded Receiving/Analysis work. |
| Mission | Supported Missing Operative entry, movement, dialogue, work, guard combat, patient care, evacuation, Gate return and debrief. |
| Cargo/equipment | Same-instance recovery, Warehouse/Containment storage, staffed Analysis, reserved fallback storage, separate custody and weapon/armor issue/return. The current route supplies a rifle, not physical armor. |
| Personnel | Injuries, stamina/endurance and Tool condition/charges survive Prepare redeployment. Reset mission is a debug reset. |
| Verification | The supported rescue-to-equipment/redeployment route passes through actual controls and temporary saves. This does not establish every mission branch or full simulator parity. |

## Wave status

| Wave | Player-visible outcome | Two main work packages | Completion gate |
| --- | --- | --- | --- |
| **1 — Repeat-sortie loop: implemented** | Recover supplies, make recovery/rearm decisions and send the team out again with real consequences. | **A:** Actual Supply cargo identification/value and S1/S2/S3 storage accounting from shared schema/data. **B:** Passive personnel recovery, automatic Tool refill on return, and equipment preparation for another sortie. | Fresh game -> rescue -> recover/store resources -> prepare personnel/equipment -> redeploy. Save/Load preserves costs, condition, balances and instance IDs; debug reset is unnecessary. |
| **2 — Playable UI/build: delivered; user acceptance pending** | Play the supported slice coherently without the Unity Editor or debug controls. | **A:** Clear base/mission navigation, readable 2D map/unit states, actionable blockers and accessible rosters. **B:** Windows build, reliable save/resume and a short player-facing route/checklist; fix interruptions on that route. | The user completes and repeats the supported loop in the standalone build and resumes after relaunch without lost progress, duplicate cargo or reset personnel. Final art is not required. |
| **3 — Make base expansion matter** | Spend resources to change the base and enable additional work capability or capacity. | **A:** Authored room construction/configuration, physical child rooms, Room Groups and Core/Service configuration. **B:** Local/Group/Response staffing, queues/reservations and interruptions needed to operate that configuration. | An authored base change enables previously blocked work. Resource use, capacity, sticky Actors and Save/Load remain valid; room category never replaces a missing technical Service. |
| **4 — Turn alien recovery into usable technology** | Recover evidence, establish justified knowledge, then fabricate equipment the team can use. | **A:** Object Analysis/Workshop/reverse engineering with persistent physical consequences and explicit outputs. **B:** Authored Discovery -> Hypothesis -> Thesis -> Research -> Theory/Pattern -> Recipe -> fabrication -> issue. | Demonstrate the authored Asgard/Human electromagnetic-rifle chain through one usable fabricated result without granting alien Patterns or Theory merely by recovering an object. |
| **5 — Broaden the campaign** | Choose another actual mission/location and carry the same SGC's consequences forward. | **A:** Shared runtime coverage for another authored scenario, mission selection and persistent mission results/history. **B:** Existing world-map geometry, player knowledge and travel/reachability connected to campaign state. | Play two distinct authored missions in one saved campaign with consistent personnel, inventory, knowledge and map state. Haven/trade/faction features require executable contracts; design notes alone do not establish parity. |

Wave 1 supplies the resource/preparation foundation for Wave 3; Wave 3 supplies configured execution capability for Wave 4. The standalone slice ships at Wave 2, before the entire campaign migration. Usability and save integrity are acceptance requirements in every wave.

October26 follow-through: Operations retains immutable completed work in a
schema31 journal independent of live queues. Ongoing jobs precede newest
completions; unknown legacy times remain explicit. Receiving/cargo/Core rails
animate committed progress across ticks and panel rebuilds.

User priority (October26): advance **Wave5 offworld work before Wave4**.
The first offworld package is delivered: Missing Operative projects all ten
shared authored stages, ten doors and four guard encounters. Two authored worker
clues reveal concealed routes only after their prerequisites and completed work.
Six approved Art Lab profession outfits now render the team on the mission map,
with idle and walking only. Movement is cosmetic; travel still commits one tick.
Original 2D rendering, shared cargo rules and existing saves remain supported.
See [character integration](../artwork/toon-soldiers-proof/OFFWORLD-INTEGRATION.md).

For a fresh-mission check, explore Main Hall -> Security -> Office -> Processing.
Isolate the processing power, then Inquire for the concealed Safe route; small
talk in Holding exposes the Store route. Lab entry requires its authored hack.
The original rescue and Supply-cache route remains available. Old completed
missions retain their progress; reset/redeploy deliberately to explore afresh.

**Current priority, revised by the user:** finish this Missing Operative mission
before starting another. Main-map zoom/pan and a known-area minimap are delivered;
unit markers are half their previous tile size. Nine Art Lab outfits (including
Worker/Guard/Captain) and seven idle/move/social/work/fire/down clips are integrated.
Readable actions coexist with door hexes. Fixed the detected-operative speaker
lookup that aborted Holding's patient and loot controls. Added three authored
Holding/Processing conversations and preserved both older mission projections.
The original crate/rifle recovery still requires the secure, medically cleared
route; its instance IDs and save roundtrip are verified.

**Remaining current-mission adapters:** Office/supervisor dialogue variants,
checkpoint effects, lab parallel search and additional authored loot/work
transitions. Keep these ahead of mission selection. The following scenario will
be the existing authored `last-transmission-001.finalized.json`, not a new story;
then mission selection, persistent results and world-map reachability/knowledge. Wave5 is not complete until two distinct
missions work in one campaign; this batch does not claim that acceptance gate.
Wave4 Workshop/evidence and Discovery/Thesis/Research remain queued. The Human
Technology-II Workshop installation/acquisition contract is still an authoring
dependency; construction upgrades must not silently grant it.

## Wave 2 release delivery

October27 reset-accounting fix: schema32 keeps archived cargo Supply credits
separate from resettable item/process state. Explicit mission Reset preserves
stock and its conservation ledger when a processed cache is removed. Schemas1–31
load with an empty archive; balance validation and duplicate-credit checks remain.


October26 mission-polish follow-through: same-object hexes touch, work/response
hexes carry an eligible Actor, travel has directional vector arrows, and combat
uses start/cancel followed by automatic playback. Downed rig poses survive
re-enabling. Hidden Store now supplies its authored second equipment crate and
Human coil rifle through collection -> extraction -> Receiving. Explicit debug
Reset removes the mission's item/process state so that route can be tested
again; it preserves base staffing/teams and does not retract already deposited
resources. Rock work now varies deterministically between 8–12 mixed 3/60-minute
bubbles, with a required Technician-I bubble; old queued work keeps its graph.
Rock previews show work/yield; construction has category-jump buttons.


Current October26 follow-through remains Wave2 usability/mission-loop work:
spatial symbol actions at their authored subjects, lower-panel descriptions,
cardinal visual movement, combat facing, explicit extraction review and automatic
arrival of eligible cargo in Receiving. Extraction belongs in this wave; it is
not postponed to a second mission. The manifest distinguishes undiscovered,
blocked, already recovered and already converted cargo. Base planning now uses
room/rock/free-cell contexts and explicit placement before Build. Communications
has a shared Command room envelope; mission-acquisition Cores remain unauthored.


Windows build, full control walkthrough and two-launch player Save/Load checks
passed. See [release evidence](unity-wave2-release-checks.md). The remaining gate
is the user's own standalone playthrough; it has not been inferred from automation.

The supported slice uses shared personnel cards in briefing, offworld team view
and debrief. Mission information is separate from team information. Debrief shows
extraction HP/Tool expenditure; base recovery/refill remains separate. Door hexes
sit at their mapped targets, duplicate action text is hidden, the known map is
framed legibly and Redial appears only at the Gate.

Room clicks open local item queues. Routing retains the source queue with
explicit Follow to the destination. Items/details/actions scroll independently;
inspection rails show actual work. Custody and fallback reservations stay
separate. Transfer timing controls require relevant unfinished work, and cancel
requires a plan. Holding exposes four captive places without inventing intake.

The existing control-driven rescue/cache/rifle/equipment/redeployment walkthrough
passes with temporary saves. A Windows build with current guide and explicit
isolated-path two-launch player Save/Load verification completes release checks.
User acceptance still requires the standalone playthrough/relaunch checklist;
automated checks do not substitute for the player's judgment.

Save28 retains new80%-general parallel construction and older serial orders.
Manage shows valid Join/Split targets only when enabled. Stage floors and team
sprites are present; final wall/prop and full simulator visual parity are not
requirements of this slice.

The [Receiving Core handoff](unity-receiving-cores-approved-handoff.md) and
[audit](unity-receiving-cores-audit.md) distinguish approved rules from proposals
and missing authoring. Core installation/power remains Wave3, including starter
Medium handling versus the Large reference cache. Full prisoner workflows,
mission XP, technology progression and another mission remain separate gaps.

## Implemented Wave 3 work: executable base construction

Two connected steps now cover (1) Supply-funded construction with staffed
Maintenance and persistent physical sites, and (2) rock clearance plus readable,
profession-colored progress. The catalog uses the simulator's category order.
**Build** commits the selected room/tier/cleared footprint after validation.

The starter base includes Maintenance, Infirmary, Living Quarters, Generator and
Ration Storage. Explicit free starter staff are assigned to Maintenance; save
migration never displaces existing room/team assignments. Other starter rooms
provide their authored footprint/capacity, not new healing, residents or power
simulation. Maintenance requires a local Soldier (SO1) for security, followed by
a local Technician with an equipped TET1 Tool. These are two sequential bubbles;
the progress rail uses 20-tick work bubbles (with one-tick remainder bubbles where
needed to retain an existing quote), rather than an arbitrary 20 display boxes.

Rock clearance now starts the shared eight-bubble CLEAR_ROCK Recipe. Each
one-tick UNTRAINED bubble needs an available permanent Maintenance Unit, with no
Tool requirement. Different staff work separate bubbles in parallel, each Unit
at most once per tick. White unworked requirements become the actual worker's
profession color. Actor/progress history survives Save/Load. Rock blocks building
until all eight bubbles complete; completed bubbles progressively credit shares
of the existing 10 S1. Save25 tracks credited amounts and migrates old work.
Pending output reserves Supply Storage capacity. Schema23 reads schema21/22
construction/cleared cells without retroactively scheduling or re-awarding work.

Provisional shared data starts Supply Storage with 500 S1 / 200 S2 / 100 S3,
awards 10 S1 once per cleared rock cell, and assigns the first hour of a quote to
security. Quotes remain 24–48 hours at CT1, one Supply/hour. Construction spends
Supply once, reserves the footprint and sticky Actors, and completes under the
same physical room ID. Save schema 21 retains stock, cleared cells, site progress
and completion. Completed rooms provide their existing authored capacities.

The approved [capacity chart](room-capacity-standardization-checklist.md) and
Ready Room 4/5/6 membership/four-deployee limit remain in force. Equal XP sharing
includes reserves; mission reward/level-up authoring is still outstanding.

The next two Wave 3 steps now execute: **paid physical-room upgrades** and
**ordered Room Groups with shared local staffing**. Manage mode selects an
existing room for its incremental, destination-tier Supply quote. Capacity
changes only on completion; IDs, assignments, custody and storage remain intact.
Ready Room CT1->2 therefore unlocks its fifth roster place through actual work.
Groups follow the shared simulator's 1+1 -> 1x2 and pair+pair -> 2x2 rules, retain
ordered physical children, and can split back into those same children. Runtime
Actor search is destination first, then ordered Group staff; sticky identity,
equipped Tools, busy reservations and storage remain valid. A Group can unlock
Analysis at one child using the Scientist permanently assigned to another.
Schema22 stores upgrade source tiers and ordered Groups and reads schema21 work.

Construction staffing now resolves automatically from permanent Maintenance
staff; the UI has no Technician chooser and displays current readiness. While
a team is offworld, the header names the Gate decision/action that owns time.

The global resource header shows current Supply, Materials and Rations (zero
where no stock exists); base speeds now cycle 1x/4x/8x/16x. Construction cards
reuse passive animated views, profession colors and active-step highlighting.
The rail now uses one uGUI mesh for hazard backing, fill and slanted seams, retaining
the same committed work and profession colors. Field action readiness separates
gray personnel/context blockers from amber missing/damaged/depleted Tools, with
explicit reasons on patient care and door hacking. Readiness does not replenish
Tools or change mission state. Automatic base recovery and return refill now follow the user's October24 rules.

Receiving Core lifecycle and PWR now execute from the shared
[first-pass package](unity-receiving-cores-first-pass.md): physical starter Cores,
reversible four-bubble installation/removal, Warehouse/slot reservations, active
item queuing, selected resource handling/recovery and maximum-active power admission.
Schema29 persists the configuration and partial work; old saves seed stable IDs.
Cache progress reports explicit blockers and captures its recovery allocation.
The larger operations batch now supplies shared local/Group/Local Response Actor
resolution for Receiving, handling, Analysis, resources, Core work and Maintenance.
Response Rooms switch between Local Response and Base Response availability;
schema30 saves the posture and preserves sticky work. Personal Tools precede
configured Group Tool providers. The existing Human II Workshop TET2_MODIFY rule
is imported without granting a Technology Tier from CT. Core Room Services are
resolved within physical Room Groups. Operations exposes all job types, filters,
readiness, progress, pause/resume and room navigation; room Services are inspectable.

Remaining configuration gaps are the authored installation/acquisition path for
a Human Technology-II Workshop, broader technical/emergent Service consumers,
and a numeric Base Response interruption reset window. Current interruptions
retain existing sticky progress; no unauthored timeout discards player work. Core
manufacturing and higher-tier recovery remain unauthored/deferred.
There is no instant upgrade from the tier selector, cancellation/refund or
salvage execution until its forward outputs are authored. Wave 1's cargo
special cargo authoring remains outstanding; passive personnel recovery and automatic return refill are now implemented. See the
[playtest guide](unity-playtest-guide.md#base-construction).

## Wave 1: Supply cache intake and remaining authoring

The returned [cargo handoff](orionis-cargo-shared-schema-handoff-unity-migration-wave-0.md)
now supplies the locked ranges and allocation formula. Shared JSON/schema,
instance payload/process extensions, JS queries and Unity economic imports are
implemented; see [reconciliation and remaining execution gaps](shared-cargo-reconciliation.md).
The reference mission's Processing Room now supplies a separate physical cache.
Shared playtest authoring now defines two inspections and eight recovery bubbles
(Medium, 61 S1 + 15 S2 at Balanced); started legacy saves retain their old graph;
field findings survive extraction, and Receiving progressively deposits Balanced
Supply into the existing stock. Completed outputs blocked by storage retain
their calculated amounts through Save/Load and retry without work or duplicate
credit. The user accepted Balanced Supply/Material defaults without Cores.
The full handoff scenarios still require critical/special outcome authoring,
the larger fixed physical rock graph, owned/queued Core configuration and
Material/Ration stock integration. The cache route does not finish those gates
or the remaining wider campaign systems. Personnel recovery/refill now uses the user-authorized passive rules.
The older authoring instructions below are historical where superseded by this
returned contract. No legacy weapon crate is silently made into resource cargo.

Conversion definitions are being developed in another chat. Use the
[cargo-conversion authoring handoff](cargo-conversion-authoring-handoff.md) as
the return contract for all cargo families, shared quality/size ranges and schema
updates. Do not fill missing authoring with Unity-only assumptions; conversion
implementation depends on that package. Independent usability/build work can
proceed without redefining the cargo model.

1. Author/import an actual Supply-resource instance, distinct from the weapon container. Reuse shared item/instance schemas and Receiving semantics to reveal resource class, handling/safety and known value. Preserve authored Reality and physical identity.
2. Connect recognized cargo to its Supply Storage tab, capacity accounting/UI and save/load. Storage reassignment costs one tick; custody-only changes are free. Recognition must not duplicate a balance or erase a physical item through an unspecified conversion.

The user authorized **1** as the provisional Supply conversion stat because no formula exists. Large supply cargo uses the requested handling range 5–10; Pristine means high conversion and S2 identifies the storage tier. Do not infer an unprovided quality threshold, yield formula or replenishment cost.

The current container is **Unknown weapon crate**, becoming **Weapon crate** when identified. Its historical SIM_SUPPLY_CRATE identifier does not make it Supply resources. Keep resource cargo, rifle and packaging distinct.

## Authoring gates and boundaries

- Shared `demos/shared/data/*.schema.json` and authored fixtures are authoritative for Unity and the simulators. Unity imports are validated projections, not parallel editable definitions.
- Existing `materials.materialClass` includes S1/S2/S3. Its `baseCost` describes construction economics, not a cargo-conversion rate.
- User decision October24: Units in base heal1HP/tick, assigned Infirmary beds heal2HP/tick, and Tools refill immediately on return. No treatment/replenishment Recipes or Supply costs apply. Remaining technical Services and special cargo outcomes still need authored rules.
- Doctrine/sleep policy, alternate mission branches and campaign history are not implied by the bounded staffing, rescue route or same-scenario replay already implemented.
- Analysis findings are not institutional Theory; Research operates on a Thesis. Construction/salvage must account for physical outputs and valid capacity.

## Working and acceptance rules

- Implement two concrete connected steps per batch where feasible, advancing the current wave's playable outcome. Maintenance fixes are not additional completed migration waves.
- Keep clear responsibilities, composition and explicit dependencies. Plain C# owns simulation; Unity binds input/presentation/animation to commands and visible queries. Use Code Monkey patterns where they fit persistence and simulation.
- Preserve timing: three game minutes/tick; one tick per Stage movement or complete combat encounter; Gate limit 36 minutes/12 ticks. Storage reassignment is one tick, custody-only movement is free. Base clock starts running; offworld time advances through committed actions.
- Preserve source-backed Actor/Tool/Room Service resolution, sticky work, reserved storage, stable IDs, hidden Reality and original-roster migration.
- Prefer an existing integrated walkthrough plus targeted domain/migration checks. Print totals/failures; broaden testing only for changes or unresolved concerns.
- Use temporary saves and back up live campaigns before disruptive Unity work. After PlayMode tests, clear test state/controllers and verify normal Bootstrap Play/Stop/restart before restoring user state.

## Outside this five-wave count

Final production artwork, the planned 3D-render-to-pixel-sprite tool, replacing every browser authoring utility with a Unity editor, new canonical science, unimplemented faction/economy design, multiplayer and additional platforms are separate projects. The game remains 2D pixel art; readable placeholders and approved sprites can support the first slice.

## References

- [Implementation history](unity-migration-history-2026-10-20.md) and [current checkpoint](unity-chat-handoff.md).
- [Original audit](unity-migration-audit.md) and [item/work gap audit](unity-receiving-gap-audit.md): historical inventories, not current completion lists.
- [Cargo routing](unity-cargo-routing.md), [equipment](unity-equipment-storage.md), [simulator decisions](simulator-decisions.md).
- [Recipe bubble contract](theory/architecture/recipe-bubble-contract.md) and [world-map specification](world-map/world-map-simulator-v1.md).

