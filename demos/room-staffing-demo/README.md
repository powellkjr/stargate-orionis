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
- Loads representative rifle tiles from the shared item data and Theory tiles from the shared simulator import.
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
