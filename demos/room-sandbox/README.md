# Room Sandbox

Browser prototype for testing Stargate base room footprints.

## Structure

- `../shared/data/rooms.json`: shared room catalog for this and later demos.
- `../shared/js/rooms.js`: reusable room validation, lookup, loading, and joining rules.
- `room-sandbox.js`: sandbox-only placement/rendering behavior.

## Current rules

- 80x80 px grid cells.
- Same non-null `joinGroup` means adjacent rooms can join.
- Joined rooms consume only shared padding.
- Exposed edges are split visually into three sections.
- Doors occupy the middle edge section.
- Rotate moves the selected door clockwise: North -> East -> South -> West.
- Stack level is represented by border thickness.

## Run

The sandbox uses an ES module and loads the shared room catalog with `fetch`, so
opening `index.html` directly from the filesystem will not work. Serve the
repository root with a simple web server instead:

`python -m http.server 8000`

Then open:

`http://localhost:8000/demos/room-sandbox/`
