# Instance, Item, and Theory Tables

## Status

**SIMULATOR WORKING MODEL**

This document describes a small, standalone JSON database model for working
through physical item instances and the theories they implement. It is an
authoring experiment for the simulator and is intentionally separate from the
existing room-sandbox fixture packs.

## Three Tables

The initial tables live in:

```text
demos/shared/data/instance.json
demos/shared/data/item.json
demos/shared/data/theories.json
```

Each file is a JSON object keyed by its stable identifier. This supports direct
lookup such as:

```js
const physicalRifle = instance["ITEM_HUMAN_COIL_RIFLE_0001"];
const definition = item[physicalRifle.itemId];
const theory = theories[definition.theoryBindings[0].theoryId];
```

The files are standalone examples. They do not import or reference the
existing `asgard_vs_human_em_rifle_items.json` or
`stargate_theory_simulator_import.json` files at runtime. The instance table is
validated by `demos/shared/data/instance.schema.json`.

### `item`

An item is a reusable definition or kind of thing. It is not a physical
object. The item table contains canonical tags, storage and handling rules,
process compatibility, and theory bindings that describe the item's
implementation. Instances inherit these item properties unless an instance
records an explicit runtime fact or binding of its own.

`theoryBindings` connects an item to a theory by `theoryId`. Each binding has
two separate parts:

```json
{
  "theoryId": "PULSED_POWER_II",
  "implementedProperties": ["SYNCHRONIZE", "MONITOR_LOAD_RESPONSE"],
  "implementationTags": ["PULSED_POWER_II_IMPLEMENTATION"]
}
```

`implementedProperties` selects authored node/property identifiers exposed by
the theory's graph. It does not copy the theory into the item and does not say
that the SGC knows the theory.

### `instance`

An instance is one persistent physical object. Its `instanceId` remains stable
when custody changes or a process operates on it. An instance points to its
definition through `itemId` and owns changing state, reality, knowledge,
custody, process state, and compact history. An optional `displayName` can give
one instance a UI-specific name without creating another item definition.

Reality describes what the object actually is. Knowledge describes what the SGC
has recognized about this particular object. Hidden reality must not be
automatically exposed as knowledge.

### `theories`

A theory is authored semantic truth. A record contains a primary graph and zero
or more secondary graphs. The primary graph is the minimum critical graph for
the theory. Secondary graphs are reusable optional modules such as diagnostics,
calibration, manufacturing, or salvage.

Graph nodes expose stable identifiers that an item binding may select. Graphs are
semantic guidance and are not themselves a room workflow or an executable
recipe. Recipe, profession, tool-service, room-service, discovery, and research
systems remain responsible for execution and institutional knowledge.

## Item Storage and Handling

An item’s `storage` section defines where it may be stored and how much basic
handling capacity it represents:

```json
{
  "storage": {
    "storageClasses": ["INV", "CC", "EQ"],
    "handlingCost": 1,
    "isUnique": false,
    "isStackable": false,
    "isCargo": true
  }
}
```

`storageClasses` lists valid storage capacity classes. Most transportable items
should include both `INV` and `CC`: `INV` is required for gate, Receiving, and
map handling, while `CC` provides the safe containment fallback for items whose
properties are unknown or not yet suitable for a more specific class. Add
specialized classes such as `EQ` or `CORE` when the item qualifies for those
storage services. The actual storage service is selected by an instance’s
`custody.storageId`. `handlingCost` is a generalized per-unit value:
`1 INV = 1 EQ = 1 CC` numerically. The active storage or transport context
supplies the unit. Effective cost is calculated as
`handlingCost * instance.state.quantity`; extended cost is not stored.

`isUnique`, `isStackable`, and `isCargo` remain item-level handling rules.
`isStackable` means identical units may be represented by one inseparable
instance; it does not make the units independently processable.

The item table intentionally does not separately store civilization, form
factor, wearable/tool/core flags, source, or source Recipe. Identity is
represented by item tags, and physical form is derived from the bound Patterns.

## Item Process Compatibility

`processCompatibility` uses the same six process names as instance process
records: `receiving`, `analysis`, `construction`, `repair`,
`reverseEngineering`, and `salvage`. The item stores whether a process is
valid for the item kind; the instance stores that process’s current state.

## Instance State

`state.condition` and `state.functionalState` are separate. `state.quantity` is
the number of identical objects represented by one inseparable stack instance;
it is not permission to process the members independently. A Recipe must
explicitly split a stack. `state.percentOfWhole` uses an integer scale from `0`
to `1000`: `125` means `12.5%`, and `1000` means `100%`. Construction is process
state and belongs in `processes.construction.state`.

## Reality and Knowledge

Reality stores instance-specific theory bindings and self-authored tags. The
effective Reality tags are derived from the item bindings, instance bindings,
and authored tags; the instance does not store a duplicate aggregate
`reality.tags` list. Knowledge stores the revealed subset of those Reality tags
and does not duplicate institutional Theory Knowledge.

## Custody

Custody separates valid storage from current physical location and assignment:

```json
{
  "storageId": "SGC_EQUIPMENT_INVENTORY",
  "containerId": "MAP_CELL_0142",
  "leaseId": "CARTER_UNIT_01",
  "state": "DROPPED",
  "nextStorageId": null,
  "status": "STORED",
  "reservedBy": null,
  "committedBy": null,
  "cost": {"unitCost": 1, "extendedCost": 1}
}
```

`storageId` is the valid storage service and fallback location. That service
determines whether the numeric cost is interpreted as `INV`, `CC`, `EQ`, or
another storage unit. `containerId` is where the instance physically is now.
`leaseId` identifies the unit or service currently assigned to it and may remain
unchanged when an item is dropped, lost, or separated from its lease holder.

Custody `state` describes the current container/lease relationship:
`ACTIVE`, `INACTIVE`, `DROPPED`, `LOST`, `EQUIPPED`, or `STANDBY`.
`nextStorageId` and `status` separately describe movement between storage
services. `reservedBy` and `committedBy` identify who or what holds those
claims; null means no current reservation or commitment.

`cost.extendedCost` is the capacity cost of the whole instance and should equal
`cost.unitCost * state.quantity`. The schema validates both numbers, while a
cross-record validator must enforce the arithmetic invariant.

## Compact History

History is an append-only array of encoded positional records:

```text
[when, who, what, where]
```

The encoder/decoder owns the meaning of each position. The schema only checks
that each record has four values and that identifier values use the canonical
uppercase format.

## Relationships

```text
instance[instanceId].itemId
    -> item[itemId]

item[itemId].theoryBindings[].theoryId
    -> theories[theoryId]

item[itemId].theoryBindings[].implementedProperties
    -> properties declared by the referenced theory graphs
```

The reverse relationship is deliberately not duplicated in this first model:
theories do not need to list every item that implements them. A query can build
that index when needed.

## Initial Rifle Slice

The first examples cover the existing simulator comparison:

- `ASGARD_EM_RIFLE` is a recovered alien item. Its instance reality contains
  `ELECTROMAGNETIC_ACCELERATION_II`, but its initial SGC knowledge is empty.
- `HUMAN_ADVANCED_COIL_RIFLE` is an SGC-manufactured item. Its definition
  references the known Human theories and pattern used by its source recipe.

This model does not infer an Asgard manufacturing pattern from possession of
the rifle. It also does not turn an item binding into institutional Theory
Knowledge.

## Composed Item Example: Human EM Impact Vest

`HUMAN_EM_IMPACT_VEST` demonstrates a small multi-theory item package. Its
definition references:

```text
HUMAN_ARMOR_VEST_PATTERN_II
+ HUMAN_EM_IMPACT_ARMOR_PATTERN_II
```

The active implementation pattern composes the general scientific and
implementation dependencies:

```text
KINETIC_IMPACT_DISSIPATION_II
+ ELECTROMAGNETIC_ACTUATION_II
+ PULSED_POWER_II
```

The item’s `composition` object provides a compact index of those relationships;
the detailed `theoryBindings` still record which graph nodes are implemented.
The `bindingMappings` on `HUMAN_EM_IMPACT_ARMOR_PATTERN_II` connect general
kinetic-dissipation properties to implementation choices such as a
load-distribution structure, protective array alignment, active field elements,
and impact-response calibration. Sensing, timing, and reset behavior therefore
remain implementation concerns rather than properties of the general kinetic
Theory.

`HUMAN_ARMOR_VEST_PATTERN_II` supplies the wearable form factor: body interface,
protective structure, retention, and fit. The active pattern does not replace
that ordinary vest construction knowledge.

## Authoring Rules for This Slice

1. Keep identifiers stable and use references rather than embedding duplicate
   records.
2. Add a theory binding only when the item actually implements the selected
   properties.
3. Keep implementation facts on the definition/instance side and recognition
   facts on the instance `knowledge` side.
4. Keep changing physical state on `instance`, never on `item` or `theories`.
5. Treat these tables as a working model; validation and runtime loaders can be
   added after the shape is exercised by simulator flows.

## Current simulator integration and metadata migration

The staffing demo reads item.json and theories.json for its palettes. Approved
item, Theory, and instance metadata has been migrated. Item and instance schemas
accept the imported fields. Authored history may contain event objects without
timestamps; runtime history retains its four-value tuple format. Historical
locations remain historical rather than being rewritten to current custody.

PULSED_POWER_I, ELECTROMAGNETIC_ACCELERATION_I, and HUMAN_ROOM_CONSTRUCTION_II
are metadata-only additions. Existing graphs and bindings were preserved. Graphs,
profession envelopes, Discovery, Hypotheses, Recipes, and Core migration remain
deferred; old packs are retained for the pending definitions.

## Processing contract field mapping

| Layer | JSON path | Meaning |
| --- | --- | --- |
| Reality Tags | Item tags; instance reality.authoredTags and bindings | Authored physical truth, independent of recognition |
| Known Tags | Instance knowledge.revealedTags | What the SGC currently recognizes or understands |
| Processing Tags | Instance processingTags | Required, allowed, authorized, active, complete processing |
| Physical State | state.condition, state.functionalState, state.quantity | Physical condition, functionality and amount |
| Custody | custody, especially containerId | Current physical location and custody claims |
| Room Services | function.roomServices | Configured functional Service IDs |
| Room Processing Capabilities | function.processingCapabilities | Authored contracts supported by configured Services |

Existing physical fields such as percentOfWhole remain supported. No duplicate
realityTags, knownTags, or physicalState aliases are introduced.

`processingTags` is an optional flat array of unique uppercase authored tag IDs:

```json
{
  "processingTags": ["RECEIVING_REQUIRED", "IDENTITY_UNKNOWN"]
}
```

There are no required/allowed/authorized/active/complete subgroups. Tags can express
identity, availability, selection, authorization, requirements, or results without
being forced into a lifecycle category. Authored contracts define required tags,
forbidden combinations, additions, and removals; code must not infer transitions
from tag suffixes alone. For example, selection is not authorization.

Detailed execution progress remains in `processes`; location remains in `custody`.
Omission or an empty array does not grant unrestricted permission. Item
`processCompatibility` remains kind-level compatibility, not instance approval.
Agreement between tags and process records must be checked by contract logic.
The schema validates identifier format and uniqueness, not canonical membership
or contract transitions. No instance records are populated by this schema change.

function.roomServices lists configured Service IDs. Each processingCapabilities
record contains processingContractId and requiredRoomServices. These references
do not define new contracts, mount Cores, create Services, imply current resource
availability, or authorize processing an instance. Service resolution remains
within the destination Room Group while physical child rooms retain configuration.
Actor and Tool requirements remain separate. Contract-level Service lists do not
change the single-Actor, at-most-one-Tool-Service, at-most-one-Room-Service bubble
rule. Simultaneous environmental requirements require the appropriate authored
emergent Service or separate bubbles.

Schemas validate structure, identifier syntax, and unique entries. Future
cross-record validation must check that referenced tags, Services, and contracts
exist and agree with configuration and execution state. Actual exit conditions,
destination admission, authorization policy, and tag transitions remain unauthored.
UI button process strings remain loose hooks, not canonical contract IDs.

## Salvage Class

salvageClass is a typed property directly on the authored Item Definition. Its
single value is M1, M2, M3, S1, S2, S3, RATION, or KNOWLEDGE. It is not a Reality,
Known, or Processing Tag and is not an instance override.

storage.storageClasses lists valid storage systems for intact instances.
salvageClass identifies the resource classification produced by destructive
salvage. Never derive either from the other. In the current table shape:

```json
{
  "storage": {
    "storageClasses": ["WEAPON_RACK", "SECURE_EQUIPMENT_STORAGE"]
  },
  "salvageClass": "M3"
}
```

This is an illustrative fragment, not a complete record or newly configured
storage Service. Existing items are not assigned values by this change. The field
remains optional during migration, but destructive salvage must validate an
authored salvageClass before execution. Missing values are a content gap, not a
reason to infer a class from tags, storage, civilization, or Theory.

### Destructive Reverse Engineering

1. Reverse Engineering reaches completion.
2. The instance becomes condition DESTROYED and functionalState NONFUNCTIONAL.
3. The Item Definition's salvageClass determines the single salvage resource class.
4. Consume/remove the destroyed physical instance only after outputs successfully
   commit. Retain provenance/history as required by the existing process model.

Use resolve -> validate -> execute -> commit. Validate output capacity and
resulting-state constraints before commit. Failure must not lose the input or
leave partially committed outputs. Yield and quantity require authored Recipe
outputs; the class alone does not specify them. Preserve mass where applicable.

Knowledge exposure is independent of the salvage result. An Asgard rifle may
produce M3 while its authored Reverse Engineering path separately exposes a
pre-authored Hypothesis or triggers Rediscovery. This example assigns no value
to the current rifle data. Even KNOWLEDGE as a salvage resource classification
does not automatically grant institutional Theory, a Hypothesis, or Rediscovery.

## Room-flow target contract

See [Item Processing / Room Flow](./item-processing-room-flow.md) for the authored
Asgard rifle paper test, admission/exit ordering, Known Tag re-evaluation, and
destructive Reverse Engineering completion. It specifies target processing
semantics beyond the earlier schema preparation; runtime behavior and fixture
records are not changed by documenting it. Processing Tags use the agreed flat array. Concrete Service mappings remain
an explicit integration decision.
