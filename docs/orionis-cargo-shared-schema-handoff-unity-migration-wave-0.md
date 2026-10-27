# Stargate Orionis — Shared Cargo / Environmental Recovery Handoff

**Target branch:** `unity-migration-wave-0` in `powellkjr/stargate-orionis`  
**Purpose:** Codex-ready design and repository reconciliation, **not authorization to replace existing systems**.  
**Audit basis:** Read directly from the branch's Item and Instance schemas, Recipe contract, processing matrix/contracts, cargo and Receiving prototypes, room catalog, shared receiving helper, and Unity bootstrap snapshot.  
**Status:** Game design decisions locked where indicated; implementation details marked `TO VERIFY` / `PROPOSED` require reconciliation before code changes.

## Priority mandate

Deliver **two** integrated acceptance scenarios using **the existing shared Item, persistent Instance, Knowledge, Recipe, custody, Room/Services, and validated-transaction architecture**:

1. **Offworld Supply Cache:** unidentified movable wild cargo, inspection, field extraction, Receiving, progressive S1/S2 recovery, special property bubbles, storage-capacity blocking, final container disposition.
2. **Base Rock Formation:** unidentified **fixed** environmental resource-bearing instance, Maintenance Recipe with variable-duration bubbles, S1 recovery, optional profession work, persistent clearing of occupied base space.

Do **not** create a stand-alone cargo inventory, another Recipe runner, or a second resource ledger. Physical non-cargo items such as weapon crates, sarcophagi, artifacts, and equipment are not automatically yield-generating Supply containers. `SIM_SUPPLY_CRATE` was an old rifle-container name, **not** a resource yield specification.

## Verified existing branch contracts

- `demos/shared/data/item.schema.json`: Item identity, `physical.isContainer`, `identity.formFactor`, `possibleReality`, `storage.handlingCost/isCargo`, `processCompatibility`, `processingExposure`, `nameResolution`, `materials`. It has `additionalProperties:false`; new fields require schema changes.
- `demos/shared/data/instance.schema.json`: persistent ID, `state.condition/quantity/percentOfWhole`, `reality.authoredTags`, `knowledge.revealedTags`, `custody` with storage reservation and `cost`, `processes.*` with completed/current bubbles and partial progress, `history`, `relationships`, `processingTags`. It also forbids unrecognized fields. It has **no dedicated cargo authoring-origin, conversion economics, exact manifest, fixed-map placement, or pending resource-output fields** in the inspected schema.
- `docs/theory/architecture/recipe-bubble-contract.md`: executable bubble = one Actor + optional Tool Service + optional Room Service; Recipe progress persists on physical instance; Actor continuity on interrupted partial bubbles; Room/Tool Service eligibility; validated transactional outputs; storage constraints; ability to carry physical/tag/Knowledge effects; operational hour versus action three-minute scales. This remains normative.
- `demos/shared/data/process-matrix.schema.json` & `.json`: admission is Processing Tags × Room Processing Capabilities; available entries include Receiving, Analysis, Reverse Engineering, Equipment Storage, Containment; **no Maintenance-processing admission entry yet**.
- `demos/shared/data/processing-contracts.schema.json` & `.json`: tag-state transitions, not yet resource-output or world-geometry transaction declarations.
- `demos/shared/data/rooms_schema.json`: `maintenance` exists with queue four jobs / one active job, `receiving` exists with processing capability `CAN_ACCEPT_RECEIVING` and a one-item processing workspace, Supply and Material Storage have three resource tabs **sharing their capacity group**; Containment is storage-only. Do not mistake resource-tier tabs for independent storage capacity pools.
- `demos/shared/data/receiving-prototype.json`, `cargo-handling-prototype.json`, `cargo-processing-prototype.json`: **PROVISIONAL_PLAYTEST** rifle-specific inspection/Analysis behavior (e.g. two ticks, TET1/SCT1), not the final universal cargo generation/economics. Preserve their legacy fixture behavior unless explicitly migrated.
- `demos/shared/js/item-instances.mjs`: `createArrivalStore().receive` constructs items in Receiving, uses **item-defined** `storage.handlingCost` for current custody cost and fixed `RECEIVING_REQUIRED` tags. This currently cannot represent arbitrary per-instance wild cargo from field or fixed environmental obstructions without extension. Do not call `receive` on a rock.
- `unity/tools/bootstrap-snapshot.mjs`: imports `item.json`, `instance.json`, cargo and Receiving prototypes, room definitions, and builds an existing Unity Receiving snapshot using the old prototype and one incoming rifle. **Preserve snapshot format/fingerprints/save compatibility**; extend with explicit source changes/migrations, not by silently rewriting fixture identities.

## Locked core distinctions

### Universal Item/Instance/Recipe integration

- Cargo is a physical Item/Instance representing recoverable finite resources, either movable or fixed in the environment. `isCargo` must not by itself cause resource payout; **the authored Recipe outputs resources**.
- Reality is generated/established once, separate from what SGC Knows; inspection uncovers facts supported by evidence, never rerolls Reality. Instantiated work progress follows the same physical ID across movement, interruption, save/load.
- **INV = total number of executable processing bubbles in the authored Recipe**. Each bubble contributes exactly one INV, even if one lasts 3 minutes and another 60 minutes. Recipe edges control dependencies and concurrency. Optional profession stages are part of the total if included in the instantiated Recipe. Storage/transport footprint remains a distinct concern.
- A four-bubble stage can run parallel with enough qualified Actors and independent graph nodes, or sequentially if dependencies demand it. One Actor per bubble. Preserve Actor continuity for partial work according to existing Recipe contract.
- A **16-bubble** recipe qualifies as **Large** (11–20 INV), not Huge. A **Huge** rock has 21–40 actual bubbles. The discussed sample sequence (1×3min inspect, 4×60min demo, 1×3min inspect, 4×60min demo, 1×60min soldier inspect, 4×60min room prep, 1×60min cleanup) totals **16**, so it is an illustrative Large recipe unless more stages are authored. Do not relabel it Huge without adding actual bubbles.
- Fixed placement must be represented independently from movable storage custody, with a transactional `clear/remove obstruction` world-state effect after the authored completion conditions. Never fabricate free transportability for base rock or conflate removal of obstruction with disposal of resources.

### Cargo families and economics

- Families: Supply S1/S2/S3 (building), Material M1/M2/M3 (crafting), Rations single-tier R1, and Knowledge as discrete meaningful objects/data transfer (not fungible Knowledge currency). **No exchange formula between Supply and Material families**.
- **Size by Recipe INV:** Small 1–5; Medium 6–10; Large 11–20; Huge 21–40.
- **Quality/richness** (different from physical condition), fixed-point conversion stat 100×: Poor 1.00–4.99 / 100–499; Standard 5.00–9.99 / 500–999; Rich 10.00–14.99 / 1000–1499; Exceptional 15.00–20.00 / 1500–2000.
- Unallocated wild potential value = `INV × conversionStat / 100`. Inside a family, T1:T2:T3 weights = 1:4:16. Mixed-tier pool allocates baseline 25% value to high, 25% to low, remaining 50% according to a **room-wide Receiving Core**: Quantity -> 25% high/75% low; Balanced -> 50/50; Quality -> 75% high/25% low. Floor each tier's resource result independently; no phantom minimum supplementation.
- Size/tier minimum higher-tier units **evaluated for Quantity policy** during generation: Small T2≥2/T3≥2; Medium T2≥4/T3≥3; Large T2≥8/T3≥5; Huge T2≥12/T3≥10. Reject invalid random candidates or choose lower/single-tier option rather than compensating value after generation.
- Example wild 20-INV Rich S2/S1, conversion 1230: value=246; Quantity → 15 S2 +184 S1; Balanced →30 S2+123 S1; Quality →46 S2+61 S1. Other classes not universally exchangeable.
- `WILD`: contents are fixed unallocated potential; core policy allocates actual yield when processed. `MANIFESTED`: exact packed S/M/R or intact Knowledge manifest, packaged from storage without generating value, and unpacked in identical quantity without fresh core conversion or ordinary recovery-critical multiplication. Partially filled packages valid.
- Resource progress deposits **per committed bubble**, allocating totals by differences of cumulative shares so rounding does not compound per bubble. A legitimate authored bubble can emit no resources, for example an inspection or preparation bubble; total generated resource payout follows the defined Recipe output distribution.

### Processing/transactions

- Ordinary resource payout and profession-critical **true bonus** can share a bubble's single atomic transaction. Crit chance/bonus parameters deliberately **not yet balanced**. On full storage, retain finished work and its pre-rolled pending result; do not rework, reroll, partially deposit, or duplicate it. Check capacity of the entire transaction before committing.
- Special closed-box properties block unsafe opening until an executable Recipe/decision resolves them; open-box properties may allow ordinary work to continue but must be resolved or explicitly dispositioned before completing the container. Tags, evidenced Knowledge, and prescribed Recipe requirements are **different** concepts.
- **At most one container open in Receiving**. Closed containers can queue and may be inspected per their authored Recipe while closed; never move an unresolved open container aside merely to open the next one.
- Final container consumption occurs **only** after all processing bubbles, pending deposits and mandatory special/disposition requirements are committed, and any independently persistent special item/evidence is recorded. Empty wrapper cleanup is not arbitrary physical destruction.
- Universal Core reconfiguration requires **no active work in the room**. Queue Core change behind active work; prevent starting next work until change completes. Queue backlog alone does not block reconfiguration. Do not add a separate cargo-core locking mechanism.
- Actors/tool services/room or field services are resolved by the existing Recipe contract; do not infer profession from a tag, or assume any TET/SOT service name is canonical without checking tool/service catalogs. The designer's shorthand `TET inspect`, `SOT inspect` is a request to author proper profession/tool-service requirements, **not authorization to invent those IDs**.

### Field inspection, authoring, and placement

- Inspection uses the **same authored Recipe** in field and Receiving, when valid Actor/Tool/Service context is available. Two *linked* 3-minute inspection bubbles were agreed as the basic cargo assessment: first quality and tier eligibility, second precise conversion rate and additional evidence when supported. Persist per-bubble progress and revealed evidence; no repeated inspection merely because cargo moves.
- Cargo Form Matrix: e.g. box, crate, cache, bale, pallet, freight, shipment, construction kit, haul, disk, archive; profiles constrain/weight sizes, families, environmental contexts and plausible optional properties. `Shipment`/`Freight`/`Haul` may be descriptions of multiple physical units as one instance. Civilization/faction appearance layered separately rather than four copies of forms. Forms do not set value or intrinsic bubble duration.
- An object's source (`STORY`, `WORLD`, `RANDOM`) is independent of generation policy (`PRESERVE`, `CONSTRAINED`, `QUALITY_FILTERED`). Story intent protected; world-established facts not rewritten; random generation can reject miserable low-return/penalty combinations. If yield valid but optional properties poor, reroll properties within context. Do not automatically top-up resources for penalties. Deterministic and bounded candidate rerolls, with authored fallback. Accepted Reality cannot reroll on inspection/save/load. Source metadata may influence Doctrine selection but should not automatically reveal plot significance to the player.
- Ensure a plausible environment/physical placement before accepting generic world cargo; a pallet in wilderness needs actual pre-existing reason (crash, route, camp) or should be rejected, not given an invented justification. An Ancient sarcophagus is an Item, not necessarily generic cargo.
- Provenance (stolen/abandoned/owned) is separate from condition (intact/damaged) and Knowledge (suspected/known). Doctrine can prioritize provenance, class, source and explicit dispositions but never bypass physical safety.

## Schema extension mapping: what to add versus reuse

| Concept | Reuse / extend | Status in audited branch |
|---|---|---|
| Physical item & ID | `item.schema.json` and `instance.schema.json` | EXISTS |
| Physical condition | `instance.state.condition/percentOfWhole` | EXISTS; don't confuse with richness |
| Truth and learned facts | `reality.authoredTags`, `knowledge.revealedTags`, findings | EXISTS; structured cargo knowledge needs extension |
| Work state | `processes`, completed/current bubbles, progress | EXISTS; must support multiple generic Recipe types including Maintenance |
| Tool/Actor/Room work | universal Recipe contract | EXISTS contract; authored payload mapping to verify |
| Movement & reservations | `custody`, transfer code | EXISTS; fixed placement and progressive resource outputs need extension |
| Cargo economic payload | proposed `reality.cargo` nested value | PROPOSED; no duplicate `materials.baseCost` (construction economics) |
| Exact manifests | cargo payload variant WILD/MANIFESTED | PROPOSED; resource manifest must be immutable for outbound |
| Form matrix | new shared authored catalog | PROPOSED |
| Creation provenance | proposed `authoring` instance context | PROPOSED; don't overload `history.source` |
| Generator validation/reroll | new shared generator constraints | PROPOSED |
| Pending atomic outcomes | extend generic Recipe execution transaction | PROPOSED; should not be standalone cargo ledger |
| Fixed world placement/effects | extend existing world/placeable contract if any | TO VERIFY in broader Unity schema before authoring field |
| Maintenance admission | extend process matrix & room capability | GAP on inspected branch; maintenance room exists but no generic entry |
| Room reconfiguration scheduling | universal room/Core orchestration | CONTRACT TO IMPLEMENT/VERIFY, not cargo-only |
| Exact actual values seen by player | derive from `knowledge`/evidence | PROPOSED structured recognition, no Reality leaks |

**Schema implementation strategy:** do not copy this handoff's prose keys as canonical code fields. First inspect existing concrete Service, Recipe, location/obstruction and Unity C# save APIs; extend their types and schema validation using the least duplicative field names. Maintain migration and fixtures.

## Acceptance scenario A — Offworld Supply Cache

1. Source-specific generator accepts plausible **Large Rich S2/S1 Cache** with 20 INV and 1230 fixed-point conversion, adds optional valid properties and accepted seed/source metadata.
2. Player initially sees only grounded observations, then two linked inspection bubbles progressively reveal quality/tier and precise rate; persistent evidence survives offworld extraction.
3. The cache moves with same instance identity and prior work progress through custody into Receiving. Closed-box blockers resolve before opening, with one open container maximum.
4. Receiving Core policy determines the appropriate 20-bubble recovery outputs; Actor availability and independent graph work determine concurrency (four independent three-minute bubbles may execute in parallel).
5. At least one bubble generates a critical bonus, a full-storage failure holds the entire calculated outcome as pending; after space is created it commits exactly once without reroll/rework.
6. Open special property must be resolved/dispositioned before the object is consumed. All resultant resource tiers, findings and spawned objects persist; next item then starts.
7. Save/reload and moving the object cannot duplicate yield or reveal unauthored properties.

## Acceptance scenario B — Base Rock Formation

1. Generate/author a **fixed** base obstruction with initial visible name `Unknown Base Obstruction`, Reality establishing `S1 Rock Formation`; it blocks a grounded base space.
2. Give it a full Recipe of exactly N bubbles, with N in the **Huge range 21–40** if displaying `Huge`. The designer's illustrative 16-bubble sequence is **Large** unless extended.
3. Include linked 3-minute inspections, independently parallelizable or sequential 60-minute demolition/prep work as authored, and optional specialized profession-specific Recipe bubbles. Count **every executable processing bubble** as one INV, regardless of duration.
4. Qualified/eligible untrained Actors with no special Tool Service handle relevant bubbles. Other authored bubbles properly require their Profession/Tool/Room/Field Services. **Maintenance** processes the rock directly; do not route it to Receiving.
5. Validated authored bubbles release progressive S1 to shared Supply storage, with atomic pending outputs and capacity checks.
6. Final approved work/disposition atomically consumes/removes fixed obstruction and updates base occupancy; no premature clearing on a blocked last transaction. Work/save/visual state remain consistent across reload.

## Handoff constraints / non-goals

- Unity must consume shared authority rather than invent private formula or independent balances. Audit the C# save codec and bootstrap projection first. Maintain legacy rifle Receiving and Analysis fixture semantics through explicit migration/adapters.
- This document does not claim the current branch passes new cargo scenarios. It lists required extensions and acceptance criteria.
- Leave Profession critical probabilities/magnitudes, subclass bonuses and additional property/effect catalogs authored and configurable for later balancing; do not silently choose defaults.
- World-driven negative cargo and intentionally authored low-yield cases are valid. Random quality filtering must not change established game state.
- Inspect any newer or conflicting repository files before implementation and report conflicts rather than quietly deciding them.

## Branch references (inspected)

- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/data/item.schema.json
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/data/instance.schema.json
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/docs/theory/architecture/recipe-bubble-contract.md
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/data/process-matrix.json
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/data/processing-contracts.json
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/data/rooms_schema.json
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/data/receiving-prototype.json
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/data/cargo-handling-prototype.json
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/data/cargo-processing-prototype.json
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/demos/shared/js/item-instances.mjs
- https://github.com/powellkjr/stargate-orionis/blob/unity-migration-wave-0/unity/tools/bootstrap-snapshot.mjs
