# Unity migration plan

Updated October 23, 2026. This is the active roadmap. The [previous plan and chronology](unity-migration-history-2026-10-20.md) are preserved as history; their old “next” entries no longer set the work order.

## Active priority: complete the playable mission loop

**Five implementation waves remain: two to finish a repeatable, presentable vertical slice, then three to migrate the wider base, technology and campaign systems.** These are outcome-sized waves, not five commits or five chat turns. Each can contain several two-step implementation batches. Missing authoring can change the estimate.

The technical loop already works: SGC -> SG team -> Missing Operative rescue -> extraction -> recovered equipment -> saved personnel condition -> redeployment. Finish the decisions that make repeated play useful and deliver a build before expanding the full simulation.

## Already implemented

| Area | Current capability |
| --- | --- |
| Foundation | Domain/application/data/presentation boundaries, stable IDs, seeded state and saves through schema 23. |
| Base support | Room/roster selection, four-member SG teams, staffing/transfers, shared clock and bounded Receiving/Analysis work. |
| Mission | Supported Missing Operative entry, movement, dialogue, work, guard combat, patient care, evacuation, Gate return and debrief. |
| Cargo/equipment | Same-instance recovery, Warehouse/Containment storage, staffed Analysis, reserved fallback storage, separate custody and weapon/armor issue/return. The current route supplies a rifle, not physical armor. |
| Personnel | Injuries, stamina/endurance and Tool condition/charges survive Prepare redeployment. Reset mission is a debug reset. |
| Verification | The supported rescue-to-equipment/redeployment route passes through actual controls and temporary saves. This does not establish every mission branch or full simulator parity. |

## Remaining waves

| Wave | Player-visible outcome | Two main work packages | Completion gate |
| --- | --- | --- | --- |
| **1 — Complete the repeat-sortie loop** | Recover supplies, make recovery/rearm decisions and send the team out again with real consequences. | **A:** Actual Supply cargo identification/value and S1/S2/S3 storage accounting from shared schema/data. **B:** Minimum authored personnel recovery and Tool replenishment/equipment preparation for another sortie, with explicit costs/work. | Fresh game -> rescue -> recover/store resources -> prepare personnel/equipment -> redeploy. Save/Load preserves costs, condition, balances and instance IDs; debug reset is unnecessary. |
| **2 — Deliver the first playable build** | Play the supported slice coherently without the Unity Editor or debug controls. | **A:** Clear base/mission navigation, readable 2D map/unit states, actionable blockers and accessible rosters. **B:** Windows build, reliable save/resume and a short player-facing route/checklist; fix interruptions on that route. | The user completes and repeats the supported loop in the standalone build and resumes after relaunch without lost progress, duplicate cargo or reset personnel. Final art is not required. |
| **3 — Make base expansion matter** | Spend resources to change the base and enable additional work capability or capacity. | **A:** Authored room construction/configuration, physical child rooms, Room Groups and Core/Service configuration. **B:** Local/Group/Response staffing, queues/reservations and interruptions needed to operate that configuration. | An authored base change enables previously blocked work. Resource use, capacity, sticky Actors and Save/Load remain valid; room category never replaces a missing technical Service. |
| **4 — Turn alien recovery into usable technology** | Recover evidence, establish justified knowledge, then fabricate equipment the team can use. | **A:** Object Analysis/Workshop/reverse engineering with persistent physical consequences and explicit outputs. **B:** Authored Discovery -> Hypothesis -> Thesis -> Research -> Theory/Pattern -> Recipe -> fabrication -> issue. | Demonstrate the authored Asgard/Human electromagnetic-rifle chain through one usable fabricated result without granting alien Patterns or Theory merely by recovering an object. |
| **5 — Broaden the campaign** | Choose another actual mission/location and carry the same SGC's consequences forward. | **A:** Shared runtime coverage for another authored scenario, mission selection and persistent mission results/history. **B:** Existing world-map geometry, player knowledge and travel/reachability connected to campaign state. | Play two distinct authored missions in one saved campaign with consistent personnel, inventory, knowledge and map state. Haven/trade/faction features require executable contracts; design notes alone do not establish parity. |

Wave 1 supplies the resource/preparation foundation for Wave 3; Wave 3 supplies configured execution capability for Wave 4. The standalone slice ships at Wave 2, before the entire campaign migration. Usability and save integrity are acceptance requirements in every wave.

## Current priority: Wave 2, coherent navigation and map choices

Finish the supported route's navigation before further base configuration work.
Base inventory now provides current-custody tabs for Incoming, Receiving,
Warehouse, Containment, Analysis and Equipment Storage, with reserved fallback
storage shown separately. Selecting a room exposes its inventory without losing
staffing controls. Receiving no longer presents routed cargo as current work.
Intake completion, unresolved identity and completed Analysis are explicit,
including the return-to-storage step that releases Analysis capacity.

Offworld Stage action hexes now forward to the existing movement, hacking,
dialogue, encounter, care and cargo controls. The same commands, eligibility and
Actor choices apply. Detailed controls remain available. This is the first
Stage-level interaction presentation; exact object-position/action-leader parity
with the browser map and unported mission branches remain outside this batch.

Wave 2's release gate still requires the user's standalone playthrough/resume.
The repeat-sortie gate also depends on Wave 1's missing recovery/replenishment
and cargo-conversion authoring; a UI/build batch does not complete those rules.

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
until all eight bubbles complete; completion credits the existing 10 S1 once.
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
Tools or change mission state; recovery/replenishment authoring is still open.

Still needed within Wave3: owned Core instances, install/configuration Recipes,
Group Tool configuration and eligible Response-room resolution. The theory pack
has two authored technical Core definitions, but no initial owned instances or
complete installation path. These are an authoring gate, not free capabilities.
There is no instant upgrade from the tier selector, cancellation/refund or
salvage execution until its forward outputs are authored. Wave 1's cargo
conversion and personnel/Tool recovery work remains outstanding. See the
[playtest guide](unity-playtest-guide.md#base-construction).

## Awaiting authoring: Wave 1, Supply intake and storage

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
- Recovery/healing rates, Tool replenishment costs, resource yield/quality calculations and some technical Services need concrete authored rules. Prior prototype authorization does not fill every missing field.
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

