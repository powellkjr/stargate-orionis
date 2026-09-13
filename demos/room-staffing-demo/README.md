# Room Staffing Demo

Focused browser prototype for experimenting with room staffing behavior without the geology/base-map layer.

## Current scope

- Reuses the shared room catalog from `../shared/data/rooms_schema.json`.
- Reuses the shared base-class manifest from `../shared/data/base-classes.json`.
- Loads prefab names from [`../shared/data/personnel-names.json`](../shared/data/personnel-names.json); see the [provenance and extension guide](../shared/data/personnel-names.md) before adding names.
- Starts with the `analysis` room loaded into a centered room mockup.
- Reuses the sandbox-style control vocabulary: join, upgrade CT, add staff, reset.
- Simulates joined-room staffing growth for Analysis using the schema's `joining.staffingByLayout` values:
  - `1x1` = 2
  - `1x2` = 4
  - `2x2` = 8
- Shows up to 8 staff-slot boxes in the center room mockup.
- Keeps the prefab unit roster in a collapsible sidebar section.
- Loads item tiles from the ID-keyed `../shared/data/item.json` table and Theory tiles from the ID-keyed `../shared/data/theories.json` table.
- Displays local SVG artwork for every item and Theory tile, with item-origin and Theory-tier color treatments.
- Uses typed drag payloads: units, items, and theories can only be dropped into their matching room slots.
- Includes placed items and theories in the runtime preview and compact configuration string.
- Clear controls remove assigned units or room resources.
- Renders room-internal functional tabs from each room's normalized `function.subordinateTabs` slot configuration.
- Keeps staffing and core slots room-wide while tab-owned item, Theory, occupant, and work slots remain isolated by function.

Third-party artwork is documented in [`../shared/icons/ATTRIBUTION.md`](../shared/icons/ATTRIBUTION.md).

## Run

Serve the repository root over HTTP:

`python -m http.server 8000`

Then open:

`http://localhost:8000/demos/room-staffing-demo/`

## Storage compatibility

Item tiles display `storage.storageClasses` and `storage.handlingCost` from the
item table. Room storage tabs declare accepted classes using the same
`storage.storageClasses` array in `rooms_schema.json`: Receiving uses `INV`,
Containment uses `CC`, and Equipment Storage uses `EQ`. A drop requires at least
one exact class match; rejection leaves the slot unchanged. Classes are uppercase
identifiers. Items without dedicated artwork use a generic item marker.

Tabs without an authored storage declaration retain their existing placement
behavior. Work slots do not imply a storage class or execution permission.
Living Quarters lockers have no authored class mapping yet. Equipment tabs share
`EQ` admission; weapon/armor filtering is not defined by storage classes.
This remains a catalog-placement prototype: handling cost is displayed, while
quantity, weighted capacity, and persistent instance custody are not simulated.

## Research and reverse engineering

Research accepts Theory tiles only; it has no physical-item slots. Theory tiles
are references in this demo, while executable Research operates on Thesis records.
Workshop's existing **Reverse Engineering** tab accepts physical item tiles and
keeps separate Theory reference slots. Placement alone does not execute a Recipe
or grant Knowledge.

## Offworld arrivals

Drop an item palette tile anywhere in Receiving Queue, including occupied slots
or the gaps between slots. Each accepted drop appends a distinct instance to the
compacted queue. Arrivals start intact and complete, quantity one, functionality
unknown, with no revealed Knowledge. The room's `arrival` configuration authors
these defaults and its custody destination. Physical Reality comes from the item
definition, independently of Knowledge.

Instances and queue order survive room switching and CT changes within the page
session. Full queues, incompatible storage classes, and insufficient handling
capacity reject arrivals before creating an instance. Capacity reductions cannot
remove occupied capacity. Queued objects cannot be cleared or overwritten through
the old catalog-tile controls. Reload the page to restart the simulation; this
prototype does not write arrivals to `instance.json` or browser storage.

Queue tiles show an unidentified object and its instance ID. The runtime preview
shows custody, Knowledge, and process state without revealing hidden Reality.
Other rooms still use the existing catalog-placement behavior.

Run Receiving checks: `node --test demos/room-staffing-demo/receiving.test.mjs`.

## Tab controls and capacity

Tab `buttons` contain presentation `name` and a loose `process` identifier. All
configured action buttons are disabled; no process execution is wired yet.
Receiving Processing is a read-only view of the first queue instance, not a
second custody slot. Analysis Process has one physical-item slot.

`progressionSource` references a room rule's numeric `progression` array and uses
CT alone. Receiving uses inventory progression; Containment and Lockers use their
inventory progression; Equipment Weapons and Armor each use storage progression.
Data Storage Theories uses 40/60/80. Fixed work/reference slots remain fixed.

M1–M3, S1–S3, and Rations each show a quantity and CT capacity 4000/6000/8000.
All tabs are visible. Session quantities initialize randomly in 1000–5000, capped
at current capacity (4000 at CT1), and persist when switching rooms. Their Increase,
Donate, and Destroy buttons are placeholders.

Core CT progression combined with physical-room scaling remains under review in
Analysis, Containment, Holding, Infirmary, Living Quarters, Research, and Workshop.
These existing Core configurations have not been changed by the tab work.

## Shared stock capacity and instance inspection

Material tiers share one Material Storage capacity; Supply tiers share one Supply
Storage capacity. Rations has its own capacity. `quantity.capacityGroup` identifies
the shared pool within a room. Initial quantities fit the total CT capacity.
Increase and Destroy change the selected tier by a random 1–1000 units, bounded by
free shared capacity or current stock. Donate remains disabled. CT reductions
that would put the room over capacity are rejected; the selected CT persists
across room switching for quantity rooms.

Resource queues append into the first empty position and compact on removal and
resize. The read-only Instance data box below the room shows the actual instance
record when the active tab has one item slot containing an instance. This is a
simulator debug view including hidden Reality, not player Knowledge. It clears
for empty or multiple-slot tabs and catalog tiles without an instance.
