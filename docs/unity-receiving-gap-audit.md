# Receiving and worked-item migration audit

October 17, 2026. Read-only investigation of the existing item work before
implementing Unity work execution. This records existing contracts and gaps;
it does not approve new gameplay rules or alter authored fixtures.

Follow-up, October 18: the user subsequently authorized provisional choices.
The first two-step Receiving loop is now implemented from the references below;
see [the historical implementation update](unity-migration-history-2026-10-20.md#implementation-update--october-18)
and [playtest instructions](../unity/StargateOrionis/README.md#try-receiving).
The gaps below describe the pre-implementation audit; broad routing, general
inventory and full scheduling policy remain outside the bounded slice.

## The existing starting point

The three worked items the user recalled are present in the standalone tables.
The staffing demo loads `item.json` and `theories.json`; it creates fresh arrivals
in memory rather than loading `instance.json`. These tables are separate from
the older retained rifle/Theory packs, not runtime aliases for them.

| Worked item | Definition and bindings | Existing persistent example |
| --- | --- | --- |
| `ASGARD_EM_RIFLE` | Receiving identity/condition exposure; Analysis electromagnetic implementation exposure; unknown-object/rifle names; storage/handling/material metadata | `ITEM_ASGARD_RIFLE_0001`: incoming custody, Receiving required, only `PHYSICAL_OBJECT` revealed. Physical functionality and charge exist independently of Knowledge. |
| `HUMAN_ADVANCED_COIL_RIFLE` | Six Theory/Pattern bindings, exposure and names, source fabrication Recipe | `ITEM_HUMAN_COIL_RIFLE_0001`: recognized, Receiving/Analysis complete, all eight construction bubbles recorded complete. Also carries `WORKSHOP_REQUIRED`; do not assume this is a fresh recovered object. |
| `HUMAN_EM_IMPACT_VEST` | Five bindings including vest form, active protection, kinetic dissipation, electromagnetic actuation and pulsed power; exposure and material metadata | `ITEM_HUMAN_EM_IMPACT_VEST_0001`: intact/functional, Receiving/Analysis complete, Workshop required. This is not the fresh known-vest intake scenario described by the handoff. |

Four additional `SIM_*` items support the Missing Operative benchmark: supply
crate, intel archive, mining component and security terminal. Their provisional
handling metadata is useful for recovery, but they have no Theory bindings or
authored Receiving exposure. They are not four additional complete work recipes.

## Reusable sources and their limits

| Source | Reuse | Limit |
| --- | --- | --- |
| [Item table](../demos/shared/data/item.json) | Seven definitions, including the three worked equipment examples | Compatibility and exposure do not define execution. |
| [Instance table](../demos/shared/data/instance.json) | Three stable instances; separate Reality, Knowledge, custody and process state | Authored process snapshots are not running jobs. No Actor binding or completed-work tick history. |
| [Theory table](../demos/shared/data/theories.json) | Twelve Theory/Pattern records, property graphs and binding mappings | Semantic graphs are not executable bubbles; some graphs are explicitly empty. |
| [Recipe table](../demos/shared/data/recipes.json) | One coil-rifle fabrication Recipe: eight connected bubbles, TE2/SC2/SO1 Actors, Tool and Room Service requirements | No Receiving Recipe or concrete durations; fabrication needs configured specialized Services. |
| [Technical requirements](../demos/shared/data/technical-requirements.json) | Seven per-bubble fabrication Room Service requirements and two separate Research constraints | No Receiving entry; Research constraints must not become one bubble requiring two Room Services. |
| [Process matrix](../demos/shared/data/process-matrix.json), [transitions](../demos/shared/data/processing-contracts.json) | Admission categories and explicit processing-tag changes | No Actor, Tool, elapsed-work or scheduling requirements. |
| [Arrival store](../demos/shared/js/item-instances.mjs), [transfer/reveal functions](../demos/shared/js/process-transfers.mjs) | Capacity checks, stable IDs, atomic transfer, allowed tag reveals and process exits | Manual simulation; no worker feasibility or campaign ticks. Fresh arrivals do not copy every possible physical condition tag into Reality. |
| [Known-vest handoff](theory/simulator/receiving-equipment-storage-handoff.md) | Successful direct Equipment Storage exit; Analysis is conditional | Explicitly defers concrete recognition/handling evidence and Item Base Model boundary resolution. |
| [Asgard paper test](theory/simulator/item-processing-room-flow.md) | Target handling/classification, evidence, admission, custody and unresolved-object path | Explicitly excludes Actor/Tool/Room Service execution in that pass. Paper-test tags and runtime fixture tags are not interchangeable. |

The [Recipe/bubble contract](theory/architecture/recipe-bubble-contract.md#receiving-is-universal-intake)
already supplies the starting method: determine handling with Technician
involvement and determine item class with Scientist involvement. The Human coil
rifle's completed steps preserve those exact two step IDs. Their existence does
not establish minimum tiers, duration or Service requirements.

## Gaps to close, in dependency order

1. **Choose a consistent fixture projection.** Use the standalone tables as the
   current browser behavior reference and retain the old packs unchanged. The
   retained Asgard definition permits CC but denies INV/EQ; active `item.json`
   permits all three. The retained Human rifle denies CC while the active table
   permits it. Document this adapter choice explicitly instead of merging flags.
   Decide which incoming scenario is being exercised; completed Human examples
   must not be silently reset into fresh recoveries.
2. **Bind the existing Receiving steps to work.** Author or recover concrete
   minimum Actor tiers, Tool/Room Service requirements (or explicit absence),
   durations and dependencies. Bind each step to its allowed findings. The
   current per-tag simulator button is not evidence that each tag costs a tick
   or that the two conceptual steps are already implemented.
3. **Define the selected exit's evidence requirements.** Keep unknown Asgard
   origin/physics hidden. For the known vest, author only the Knowledge and
   observations needed for safe identification/handling/routing. Existing
   `simulateBoundary` controls assert outcomes; they do not implement the Item
   Base Model. The manual reveal helper uses remaining Analysis exposure as a
   routing shortcut, so copying it would not implement the general boundary.
4. **Import execution capability into Unity.** The current snapshot contains
   rooms and Unit summaries, with no physical items, institutional Knowledge,
   structured Tool loadouts or technical Service configuration. No active room
   catalog entry currently has a nonempty `function.roomServices` list. A
   process-category capability cannot supply a missing technical Service.
5. **Implement and persist work transactions.** Add instance/custody import,
   capacity validation, worker availability, sticky Actor identity, partial work,
   interruption/resume and versioned saves. Establish tick/dependency ordering
   before exposing automatic work. Staffing assignment alone does not prove
   execution is possible.

Destructive Reverse Engineering adds separate output/yield, capacity and
Hypothesis/Rediscovery requirements. It should follow the first nondestructive
Receiving loop; material class and base cost alone do not supply a salvage yield.

## Recommended next deliverable

Use the existing incoming Asgard instance as the first **Receiving** reference,
preserving its unknown Knowledge and physical identity. First finish the work
bindings for the two existing steps and agree which observations complete this
bounded intake. Then import and execute that slice in Unity. Keep the known-vest
direct-storage route as the second boundary case, since it additionally needs
path-specific recognition/handling evidence. Coil-rifle fabrication remains a
valuable later scheduler/Service test with an already authored work graph.

This recommendation selects references and implementation order. It does not
select missing tiers, durations, Services or an automatic custody destination.

## Verification

- All 15 existing Receiving/process-transfer Node tests pass.
- Read-only integrity checks pass for seven item IDs, three instance references
  and custody costs, twelve Theory/Pattern records, twelve item bindings and their
  selected graph properties, the Recipe edges and its technical requirement
  mappings. These are not full JSON Schema or executable-work validation.
- Only migration documentation changes in this audit. No authored data, Unity
  runtime or player saves were changed.
