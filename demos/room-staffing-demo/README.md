# Room Staffing Demo

Focused browser prototype for experimenting with room staffing behavior without the geology/base-map layer.

## Current scope

- Reuses the shared room catalog from `../shared/data/rooms_schema.json`.
- Reuses the shared base-class manifest from `../shared/data/base-classes.json`.
- Starts with the `analysis` room loaded into a centered room mockup.
- Reuses the sandbox-style control vocabulary: join, upgrade CT, add staff, reset.
- Simulates joined-room staffing growth for Analysis using the schema's `joining.staffingByLayout` values:
  - `1x1` = 2
  - `1x2` = 4
  - `2x2` = 8
- Shows up to 8 staff-slot boxes in the center room mockup.
- Drag a base-class icon into an open visible slot to assign it.
- Click a filled slot to clear it.

## Run

Serve the repository root over HTTP:

`python -m http.server 8000`

Then open:

`http://localhost:8000/demos/room-staffing-demo/`