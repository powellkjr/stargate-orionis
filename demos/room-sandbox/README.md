# Room Sandbox

Browser prototype for testing Stargate base room footprints.

## Structure

- `../shared/data/rooms.json`: shared room catalog for this and later demos.
- `../shared/js/rooms.js`: reusable room validation, lookup, loading, and joining rules.
- `room-sandbox.js`: sandbox-only placement/rendering behavior.

## Current rules

- 80x80 px grid cells.
- Same non-null `joinGroup` and matching Construction Tier (CT) make adjacent rooms compatible candidates for a deliberate join.
- Rooms marked `unique` can only be placed once and cannot join.
- Legal joined Groups are 1x2 pairs or 2x2 Groups built from two existing 1x2 Groups.
- Joined rooms consume only shared padding while unjoined adjacent rooms retain their separation.
- Splitting reverses the stored Group hierarchy without recreating physical rooms.
- Exposed edges are split visually into three sections.
- Doors occupy the middle edge section.
- Rotate moves the selected door clockwise: North -> East -> South -> West.
- The Gate Room renders as one continuous 3x3 room with a centered label and five randomized perimeter doors.
- Gate door markers are compact and centered on their 80px perimeter segment.
- The Upgrade CT action advances a selected physical room by one Construction Tier, up to `maxConstructionTier`.
- Upgrading a selected Group advances every physical child together, and joining requires matching CTs.
- CT uses a consistent wall thickness and is represented by border color: CT1 steel, CT2 blue, and CT3 amber/gold.
- Staff dots show the current staffing tier and shift toward the common interior of joined Groups.
- Joinable rooms use dotted walls; category palettes visually group related room types.
- The join destination has its own highlight and can be changed from the grid or candidate dropdown.
- Generate Layout builds a central-Gate base with connected reserved hallways, mixed legal Groups, CTs, and staffing tiers. Infirmary directly borders the Gate's north side and exits north; Receiving directly borders its east side and exits east, creating pass-through circulation from the Gate.
- Each hallway cell uses a 3x3 internal block grid, enabling only its center and required directional arms; the 24px paths match the room door openings.
- The rolling action log can copy both recent steps and the full current sandbox state for debugging.

## Run

The sandbox uses an ES module and loads the shared room catalog with `fetch`, so
opening `index.html` directly from the filesystem will not work. Serve the
repository root with a simple web server instead:

`python -m http.server 8000`

Then open:

`http://localhost:8000/demos/room-sandbox/`
