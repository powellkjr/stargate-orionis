# Cargo conversion authoring handoff

Prepared October 20, 2026. Purpose: settle the shared cargo definitions needed
for Unity migration Wave 1, using the same schemas/data as the simulators.
This is an authoring brief, not an approved formula or a runtime implementation.

## Request to take to the other chat

Define conversion behavior for **all cargo categories**, including explicit
nonconvertible/process-only cases. Prefer shared conversion ranges where the
semantics actually match. Evaluate **four cargo quality levels and four size
levels**, then author the agreed names, ranges, formulas and examples in shared
schema/data. Keep resource tier, physical condition, quantity, handling cost,
remaining whole, safety and player Knowledge separate. Return a concrete data
contract that Unity and the existing JS simulators can both consume.

Read AGENTS.md and the source references below first. Do not create a second
Unity-only set of conversion definitions or reinterpret construction costs as
cargo yields. If a definition is still missing, identify it instead of hiding
the choice in implementation code.

## What is decided, proposed and missing

| Status | Decision or observation |
| --- | --- |
| User requirement | Define every cargo conversion, not just the first Supply example. Explicitly classify cases with no direct conversion. |
| User proposal | Four quality levels and four sizes; probably common conversion ranges across cargo families. These are proposals to resolve, not already approved numeric tables. |
| User example | Initial name “Large supply crate”; after safe identification, “Large Pristine S2 supply crate.” Large handling cost in the 5–10 range; Pristine means high conversion; S2 means Supply Storage's S2 tab. |
| Temporary authorization | Use conversion stat **1** until the formula is authored. Its exact role, unit and eventual replacement still need definition. It is not an approved rule that every crate awards one Supply. |
| Confirmed timing | Storage reassignment costs one campaign tick; custody-only movement costs zero. Work duration is separate. |
| Confirmed custody | Assigned storage remains valid and reserved while Analysis or a Unit has custody. Containment is storage only; staffed Analysis processes remaining properties. |
| Existing weapon fixture | The rifle's container is Unknown weapon crate, becoming Weapon crate when identified. Its legacy definition ID is SIM_SUPPLY_CRATE; that ID does not authorize granting Supply. |
| Search result | No four-quality/four-size conversion table, Pristine threshold or cargo-yield formula was found in the inspected schemas/data/contracts. A targeted reachable-history search for Pristine/conversion field names also found none. This does not prove an earlier chat or external document never specified it. |

Four-by-four is a reasonable proposed starting point: 16 shared quality/size
combinations, referenced by resource profiles rather than copied into unrelated
per-item rules. It must not introduce a fourth resource tier or collapse distinct
resource families into a universal exchange currency.

## Authoritative schemas and existing fields

Paths are relative to the repository root. JSON pointers identify the relevant
definitions; these fields are present now, not suggested new field names.

| Schema | Existing contract to reuse |
| --- | --- |
| [item.schema.json](../demos/shared/data/item.schema.json) | `#/$defs/item`, `#/$defs/storage`, `#/$defs/materials`, `#/$defs/nameResolution`. Storage has `storageClasses`, `handlingCost`, `isUnique`, `isStackable`, `isCargo`. Naming has `initialName`, `processExitNames`, `previousName`. Item processing exposure/compatibility separates what can be learned from where work is valid. |
| [instance.schema.json](../demos/shared/data/instance.schema.json) | `#/$defs/physicalState`, `#/$defs/reality`, `#/$defs/knowledge`, `#/$defs/custody`, `#/$defs/cost`. Physical state has `quantity`, `percentOfWhole`, `condition`, `functionalState`; Reality and Knowledge are distinct. Custody has `storageId`, `containerId`, reservation/transfer fields and `cost.unitCost`/`extendedCost`. |
| [room.schema.json](../demos/shared/data/room.schema.json) | Validates each nested room entry in rooms_schema.json. Relevant fields are `rules.storage`, `rules.inventory`, and `function.subordinateTabs` with quantity/slot capacity and storage-class declarations. |
| [process-matrix.schema.json](../demos/shared/data/process-matrix.schema.json) | Admission by authored processing tags and room processing capabilities. Category admission is not a substitute for technical Tool/Room Services. |
| [processing-contracts.schema.json](../demos/shared/data/processing-contracts.schema.json) | Existing process-state/tag transitions. Do not assume the current transition schema already implements arbitrary numeric resource outputs. |
| [technical-requirements.schema.json](../demos/shared/data/technical-requirements.schema.json) | Technical Service requirements for actual Recipe work; separate from room processing capabilities. |

Important existing representations:

- `item.materials.materialClass` allows **M1, M2, M3, S1, S2, S3, RATION,
  KNOWLEDGE**. These are existing classification identifiers, not proof that each
  supports direct numeric conversion.
- `item.materials.baseCost` is a **construction cost**, integer 0–1000; its schema
  says 123 represents 12.3 cost units. It is not a cargo conversion stat.
- `instance.state.percentOfWhole` is integer 0–1000, where 1000 is the original
  whole. It is not the same scale as the construction-cost example above.
- Physical condition is **UNKNOWN / INTACT / DAMAGED / DESTROYED**. These four
  values are not an existing four-level cargo-quality table. UNKNOWN represents
  lack of established condition, not the lowest cargo quality.
- Functional state is **FUNCTIONAL / DEGRADED / NONFUNCTIONAL / UNKNOWN**,
  another separate axis.
- No dedicated cargo size, cargo conversion quality, conversion stat or complete
  yield formula is currently defined in these item/instance schemas. They use
  closed objects in several relevant places; add explicit schema fields rather
  than placing undeclared properties into fixtures.

## Data, runtime and contract references

| Reference | Why it matters |
| --- | --- |
| [item.json](../demos/shared/data/item.json), [instance.json](../demos/shared/data/instance.json) | Current shared item definitions and physical-instance fixtures. Keep the existing weapon-container alias and physical IDs compatible. |
| [rooms_schema.json](../demos/shared/data/rooms_schema.json) | Active nested room data: resource storage tabs, capacities, intake and work spaces. Despite the filename, this is authored room data; room.schema.json is its schema. |
| [rooms.json](../demos/shared/data/rooms.json) | Older/flat room catalog view. Do not establish a conflicting rule here instead of the active nested data. |
| [process-matrix.json](../demos/shared/data/process-matrix.json), [processing-contracts.json](../demos/shared/data/processing-contracts.json) | Existing admission and state-transition definitions; extend shared rules only where needed. |
| [recipes.json](../demos/shared/data/recipes.json) | An existing authored fabrication graph, useful for the Recipe/bubble pattern. It does not currently supply all cargo conversion or salvage recipes. |
| [Recipe bubble contract](theory/architecture/recipe-bubble-contract.md) | “Receiving Is Universal Intake,” “Handling and Item Class,” “Physical Consequences,” “Custody and Storage,” and destructive/salvage rules. Conversion must not silently erase physical mass or invent scientific Knowledge. |
| [Haven resources/trade](world-map/havens-population-resources-trade.md) | Sections 11 and 14 describe Food/Supply/Material and physical trade; they refer to normal cargo conversion without defining the formula. Food versus RATION naming needs an explicit mapping. Its reference to M1/M2/M3 as “quality tiers” must be distinguished from proposed cargo quality such as Pristine. |
| [Shared process transfers](../demos/shared/js/process-transfers.mjs) | `transferInstance` already preserves primary `custody.storageId` while changing current `containerId` for work custody; checks reserved capacity before commit. `resolveDisplayName` uses authored process names and recognition. |
| [Shared arrivals](../demos/shared/js/item-instances.mjs), [offworld recovery](../demos/shared/offworld/recovery.mjs) | Persistent arrival instances, handling capacity and recovered container/content costs. Quantities and contained cargo must not be double-counted. |
| [Current Unity flow](unity-cargo-routing.md), [migration roadmap](unity-migration-plan.md) | Implemented boundaries and the next Supply intake/storage batch. |

Older theory/item fixture packs under `demos/shared/data/theory/` and `items/`
remain authored simulator references; do not split/reorganize them into production
content files as a side effect of this task.

## Existing destinations and coverage to define

Every family needs an explicit rule: direct resource conversion, process-only,
ordinary storage, or nonconvertible. Do not apply the provisional stat of 1 as a
universal fallback for unrecognized cargo.

| Cargo family / case | Existing destination or classification | Definition needed |
| --- | --- | --- |
| Material cargo | Material Storage `m1`, `m2`, `m3`; M1/M2/M3 | Recognized tier, payload quantity, quality/size profile, yield and deposit/consumption behavior. |
| Supply cargo | Supply Storage `s1`, `s2`, `s3`; S1/S2/S3 | Same coverage as Material; define what conversion stat 1 means. |
| Food/rations | Ration Storage `rations`; RATION | Food-to-RATION naming/units, quality/size applicability and spoilage/safety policy if any. Do not invent spoilage rules merely to complete the table. |
| Weapons, armor and Tools | Equipment Storage `weapons`/`armor`; EQ compatibility | Remain usable persistent instances. No automatic resource conversion; any salvage is a separate authored operation. Tools/other equipment routing must be explicit where existing tabs do not cover them. |
| Kits, components, Cores and other artifacts | Item/Recipe-specific compatibility and storage | Specify direct-use/storage versus authored salvage/conversion. Do not invent universal yields or science unlocks. |
| Hazardous, biological, unknown or unsafe objects | Containment `cc_storage`; CC | Holding and safe-release requirements; any conversion remains blocked or process-specific until justified. Containment itself does not reveal properties. |
| Knowledge/data cargo, records and Hypotheses | Data Storage / knowledge_cargo; KNOWLEDGE classification | Explicit non-resource handling unless an authored operation says otherwise. Do not turn a Hypothesis into spendable currency or consume it to create a Thesis. |
| Empty packaging and nested containers | Warehouse/other valid storage; item-specific disposition | Whether packaging persists, returns, is unpacked or is salvaged; how contents are accounted for. Never convert both a full crate and its contents for duplicate value. |
| People/patients/detainees | Holding/Infirmary and personnel custody systems | Excluded from bulk resource conversion. |
| Unknown/future categories | Valid fallback storage | Default to unsupported/blocked conversion with a useful reason, not free Supply. |

Material, Supply and Ration storage currently have raw CT1/2/3 capacities
**4000 / 6000 / 8000**. Material/Supply tier tabs share `capacityGroup: storage`;
do not give each tab an independent full capacity. Define the numeric resource
unit/fixed-point scale before interpreting these values or comparing yields.

Equipment item-place capacities and Containment handling capacities are different
from bulk resource balances. Containment's active `cc_storage` tab points to
`rules.inventory` progression **20 / 40 / 80**; a separate legacy `rules.storage`
progression **2 / 4 / 8** also exists. Preserve the tab's authored source rather
than flattening these into one guessed capacity. Warehouse is provisionally 20
item places. Resource-storage initial ranges also need to respect actual capacity.
Receiving uses weighted handling/intake capacity **40 / 60 / 80** by construction
tier; the current Unity projection matches those values. Analysis has a one-item
process workspace. Define how size affects each kind of capacity instead of
assuming every room measures the same thing.

The nested Containment data still has historical processing-tab controls; the
later explicit user rule says storage only. Flag/reconcile that discrepancy in
shared authoring rather than reviving Containment examination.

## Decisions the authoring chat must return

1. **Coverage:** the full supported family/tier list, direct conversions,
   process-only cases, exclusions and unsupported mappings. State whether tier
   changes or cross-family conversions exist; do not assume M1 -> M2 or Material
   -> Supply is a simple numeric exchange.
2. **Four quality levels:** final IDs/names, ordered conversion ranges or factors,
   and whether one shared table is valid for Material, Supply and Rations.
   Pristine is the user's high-conversion example; the other labels/numbers
   remain open. Keep actual quality distinct from its current recognition.
3. **Four size levels:** final IDs/names, handling-cost ranges and the relationship
   to payload volume/base units. Small/Medium/Large/Extra-large is a possible
   naming proposal, not approved canon. Large must address the requested 5–10
   handling anchor. Avoid S1–S4 size IDs that collide with Supply tiers.
4. **Stat meanings and exact formula:** base payload amount, quality conversion
   stat, size effect, quantity effect and remaining-whole effect. Specify units,
   rounding, minimum/maximum values and whether quality or damage would otherwise
   reduce yield twice. Clarify the temporary value 1's role.
5. **What ranges mean:** fixed per profile, authored per instance, or sampled at
   creation. If sampled, define distribution, seed/stream and persistence. Do not
   reroll when inspecting, transferring, displaying or reloading an item.
6. **Recognition versus conversion:** which facts Receiving can recognize, what
   requires Analysis, what is visible while unknown, and whether inspection only
   reveals potential value. Decide the exact action that commits resource value.
7. **Physical/accounting consequence:** does storage reserve balance against a
   still-existing crate, or does an explicit unpack/convert process consume or
   transform it into outputs? Specify source disposition, packaging/waste where
   applicable, repeat prevention and partial conversion. A display rename is not
   a physical transformation.
8. **Execution:** destination/capability, Actor/Tool/Room Service requirements
   and duration for actual work, or an explicit absence of work. Each Recipe
   bubble has at most one Actor, one Tool Service and one Room Service. Separate
   storage-transfer timing from custody movement and process duration.
9. **Capacity and failure:** units consumed in each source/process/destination,
   shared tier-tab accounting, reservation behavior, and atomic rejection when
   full. Unknown/unsafe/failed work must retain valid fallback storage.
10. **Schema placement and migration:** final fields/types/defaults, definition
    versus instance ownership, known-value representation and any shared lookup
    catalog. Update shared schemas and data together; avoid duplicated JS/Unity
    tables. State migration for existing instances, old placeholder values,
    recognized names, reserved capacity and saved conversions.

Schema/data design should keep these axes independent:

| Axis | Example |
| --- | --- |
| Family and resource tier | Supply, S2 |
| Cargo quality | Pristine (proposed four-level model) |
| Cargo size | Large (proposed four-level model) |
| Physical condition | INTACT |
| Functional state | FUNCTIONAL / not applicable as authored |
| Quantity / remaining original whole | Crate count and percentOfWhole, separately |
| Handling allocation | 5–10 example, not automatically resource yield |
| Safety / institutional Knowledge / instance recognition | Separate requirements and revealed facts |
| Validated storage / current custodian | Supply Storage allocation versus temporary Analysis custody |

## Required examples and checks

Return a worked **Large Pristine S2 supply crate** example from initial recovery
through safe recognition, storage allocation, any actual conversion, and reload.
Include the exact input fields, arithmetic, units, known/hidden values and final
physical/ledger state. Also provide Material and Ration examples; a damaged or
partial-whole example; quantity greater than one; unknown/unsafe blocking; full
shared storage rejection; repeat conversion rejection; and a weapon container
whose rifle/packaging never generates an accidental Supply credit.

Validate all lookup entries and the agreed 4×4 coverage without writing a full
end-to-end scenario for every combination. Prefer a few meaningful integrated
checks of arithmetic, recognition, capacity, identity, repeat prevention and
save/reload. Report totals/failures, not huge passing logs.

## Return package for the Unity implementation chat

- Approved decision table and exact formula/units, with remaining questions named.
- Updated shared schema paths/JSON pointers and authored lookup/data definitions.
- At least one valid actual Supply-resource definition/instance and worked examples.
- Processing/output/accounting and migration contracts, including explicit no-conversion cases.
- Validation results and exact affected simulator/importer paths.

Unity currently consumes a generated, validated snapshot from
`unity/tools/bootstrap-snapshot.mjs`; relevant adapters are ReceivingReader,
CargoReader, CargoProcessingReader and RoomStorageReader under
`unity/StargateOrionis/Assets/Orionis/Infrastructure/`. RecoveredCargo,
CargoExamination and the cargo/storage panels implement the bounded workflow.
The resource tabs are not yet fully imported: the exporter currently projects
tabs with `storage` item classes, while Material/Supply/Ration tabs use `quantity`.
Do not interpret their absence in Unity as absence from the shared definitions.

Campaign saves are schema **20**. Preserve original-roster campaigns, physical
IDs, payload provenance, staff/SG-team assignments, known properties, equipped
custody and reserved storage. Do not overwrite the player's prototype save,
reset known objects or retcon weapon packaging into a Supply resource to make a
conversion demo pass. No Unity runtime changes are requested by this handoff.
