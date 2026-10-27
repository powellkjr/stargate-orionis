# Receiving Cores — provisional authoring, October 25, 2026

The user authorized first-pass installation Recipes and PWR costs, and changed
this mission's Supply cache to Medium. These values are editable playtest data.
The original [approved handoff](unity-receiving-cores-approved-handoff.md) remains
verbatim; this document records the later decisions that fill its numeric gaps.

## Sources and implementation boundary

- `demos/shared/data/theory/stargate_theory_simulator_import.json`: Core IDs,
  provided Services, compatibility tags, contributions, PWR and the reversible
  `RECONFIGURE_ROOM_CORE` Recipe. Existing technical Core definitions stay here.
- `demos/shared/data/item.json` and `item.schema.json`: six physical Receiving
  equipment definitions, each one Warehouse place while uninstalled.
- `demos/shared/data/receiving-core-prototype.json` and its schema: embedded T0,
  room power table, Generator rule, per-room slots, starter identities, cargo
  capability preference and installation/storage policy. Unity imports this as
  `roomCoreSetup`, referencing the shared definitions rather than copying rules.
- `resource-cargo-playtest.json`: the ten-bubble Medium cache Recipe.
  `resource-cargo-economy.json` remains the authority for size, conversion and
  quality; its original twenty-bubble economic examples remain unchanged.

**Wave3 runtime foundation implemented:** Receiving owns the two physical starter
Cores. Core controls execute the reversible Recipe, reserving physical slots,
Warehouse places and maximum-active PWR atomically. Schema29 saves keep identities,
reservations, sticky work and history; older saves seed the stable IDs once.
Receiving resolves the authored handling/recovery hierarchy. Recovery captures
allocation when unpacking starts; later configuration never rerolls outcomes.
The historical Large cache is explicitly grandfathered through its pinned graph.

This is Receiving/resource execution coverage, not full room/Core parity.
Group Tools, eligible Response staffing, broader technical/emergent Services,
Core acquisition/manufacturing and degradation remain later work. Existing
owned-instance acquisition validation allows only the authored starter set until
an acquisition transition exists.

## First-pass equipment

| Core | Minimum CT | Supported handling / recovery | Idle PWR | Active PWR |
| --- | --- | --- | ---: | ---: |
| Medium Processing Equipment | 1 | Small, Medium | 2 | 12 |
| Large Processing Equipment | 2 | Small, Medium, Large | 3 | 20 |
| Huge Processing Equipment | 3 | Small, Medium, Large, Huge | 4 | 30 |
| Quantity Recovery Equipment | 1 | General; 25% high / 75% low | 1 | 8 |
| Balanced Recovery Equipment | 1 | General; 50% high / 50% low | 1 | 8 |
| Quality Recovery Equipment | 1 | General; 75% high / 25% low | 1 | 8 |

CT1 recovery equipment fixes 25% high and 25% low; the remaining 50% goes low,
evenly, or high for Quantity, Balanced, or Quality respectively. This matches
the existing economy's policy percentages. Single-tier cargo receives its one
eligible tier; Knowledge is not converted into physical resource tiers. Ordinary
numerical degradation trends toward Balanced without removing binary Services
or handling guarantees. Duplicate Services do not stack.

Embedded Receiving T0 handles Small cargo and basic recovery to its lowest
eligible resource tier (100% low). T0 is permanent, uses no removable slot and
has no Warehouse item. No higher-tier recovery distribution is authored.

Both pre-existing electrodynamics Core definitions have provisional 3 idle /
16 active PWR and use the same installation Recipe, with CT2 and Workshop
compatibility. This does not author their manufacturing/acquisition chain.

## Installation, storage and power

Installing or removing uses the same sequential four one-tick bubbles:
position equipment (any Actor), connect (TE1/TET1), validate (TE1/TET1), secure
(any Actor). Total: four ticks / twelve minutes. Each technical bubble uses one
Tool charge. No Supply/material consumables are charged or refunded; this makes
reverse execution physically coherent and keeps balance tuning simple.
Existing local/group/Response Actor resolution applies; no global idle search.

Installation reserves a physical-room slot and maximum active PWR before work,
then releases its Warehouse place at commit. Removal reserves a Warehouse place
before work, then releases the Core slot/power at commit. Same instance throughout;
no direct swap or recreation. Partial work keeps progress, sticky Actors and
reservations. Reconfiguration waits for the active item; queued items do not
block it and new work waits. Core slots are 2/4/6 by Receiving CT, never pooled.

Each Generator supplies 100 PWR. Each room type has an explicit CT1 base cost;
CT2 uses 1.5 times and CT3 twice that base. Generator output stays 100 at each CT.
All 21 CT1 room types together cost 61 PWR before removable equipment. Receiving
is 4 PWR; with its starter Medium/Balanced Cores it uses 7 idle or up to 24 active,
reserving 24 total. Room base includes T0 and environment. Active is total Core
cost, not an addition to idle, and follows selected Service provision. No fuel,
outages, load shedding or power-priority simulation is introduced.

Starter instance IDs are `starter-receiving-medium-core-01` and
`starter-receiving-balanced-core-01`, installed in r2 slots 0/1. Future legacy
seeding must run once only when Core records are absent. Installed Cores release
Warehouse capacity without a fallback shelf reservation: this is the explicit
Core lifecycle exception, not a change to ordinary item custody/storage.

The cache authors its Service hierarchy: Medium handling before higher-capacity
providers, Balanced recovery before Quantity/Quality alternatives. Capability
selection follows this list. Only equivalent duplicate providers use physical
room order to break ties; slot order never chooses different capabilities.

## Medium cache and saves

The same `supply-cache-01` instance and `SUPPLY_CACHE_RECOVERY` Recipe IDs remain.
Two inspection bubbles plus eight recovery bubbles give size Medium, with 61 S1
and 15 S2 deposited progressively at Balanced. Quality/conversion stay unchanged.

The immutable previous twenty-bubble projection is pinned under
`unity/tools/fixtures/resource-processing-before-medium-cache.json` solely for
save compatibility. Unstarted old saves adopt Medium. Any saved process retains
the historical graph, Actors, pending outputs and committed deposits, including
on subsequent saves. Its original full yield remains 123 S1 + 30 S2. There is no
clawback, graph truncation or replay payout. This historical projection is not a
second current gameplay definition.

Next executable step: extend configuration to Group Tools and eligible local
Response Actors, followed by authored technical/emergent Service consumers.
Do not add free equipment or bypass the existing room/group authority.


Validation: 12 focused Node tests pass; cache, Core policy and item JSON-schema
checks pass; generated bootstrap/art freshness and focused diff checks pass.
The two existing Unity cargo tests passed. The new migration assertions passed
as a data-only Editor verification after Pipeline timeout/shared-runner
cancellation interrupted its NUnit run. No player rebuild or broad suite was
needed. Editor was verified outside Play with zero residual test controllers.


## Testing the runtime controls

Back to base → Receiving → **Cores**. Assign an available Technician with a charged
TET Tool to Receiving. Remove either Core: four sequential bubbles complete,
spending two Tool charges and keeping its identity in Warehouse storage. Install
it again to release the shelf place at completion. Save/Load midway retains work.
A full Warehouse or insufficient maximum-active power rejects the request without
changing custody. An active cache finishes before queued reconfiguration starts.

The Core panel reports actual / reserved / generated PWR. All installed equipment
reserves its active cost even when idle. Construction/upgrade commitments also
reserve their future room base load. A removed Medium Core blocks admission to
Medium handling until reinstalled; T0 remains permanently available for Small.
The cache tracker now names missing staff, equipment, reconfiguration or blocked
deposits instead of showing apparently stalled bubbles.

Wave3 validation: 12 Node checks; three data/schema validations plus the instance
schema definition; five focused pure domain/save assertion cases passed directly
in Editor after cancelling a stalled NUnit runner. Compile has zero errors or
warnings. Verified ordinary Play/Stop/restart, zero test controllers, exact live
campaign restoration at tick16978 and the actual Receiving Core controls. No
real save file was overwritten and no broad suite/player build was repeated.
