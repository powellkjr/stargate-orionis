# Independent Room Art Lab — Waves A/B

Verified October 27, 2026, in Unity 6000.5.2f1.

- Separate project: `unity/OrionisRoomArtLab`.
- Final EditMode run: **24 passed, 0 failed, 0 skipped** (0.41 seconds).
- Node catalog/provenance test: **1 passed, 0 failed**.
- Catalog freshness, helper syntax and focused diff whitespace checks pass.
- Live Editor descriptor resolves to the Room Art Lab, with Play stopped.
- Active scene remains clean; no nonpersistent PlaymodeTestsController exists.
- [Joined 2×2 preview](joined-2x2.png): Analysis, four physical rooms, CT1,
  two centered exterior doors, continuous floor, no internal wall or center post.

The tests cover the authored catalog and special footprints; legal single,
horizontal/vertical pair and square joined layouts; illegal long/L shapes;
all sixteen 1×1 door masks; pair/square/special perimeters; invalid internal or
outside doors; CT-independent structural geometry; active-scene safety and
preview-scene cleanup. The game delegates its existing structural join check
to `RoomJoinGeometry`; that same source is staged into the independent lab.

This evidence covers primitive topology, not Synty mapping, final dimensions,
materials, furnishings or production integration. Placeholder scale is an art
assumption only. Neither the game nor character Editor was operated for testing.

Follow-up: join comparison and split sliding doors, October27.

- Final Editor suite: **30 passed, 0 failed, 0 skipped** (0.42 seconds).
- [Combined comparison](join-comparison.png) shows the requested
  `A A B / A A B / C C D` board, independent colored/labelled groups and
  four doors at65% open. Unsupported joins remain absent.
- Added coverage verifies the exact board, each group's original perimeter,
  unsupported/special configurations, two leaves meeting in the center,
  fixed height and full opening clearance for all four wall directions.
- Live state: separate Editor in Edit mode, clean active scene, zero residual
  test runs/controllers. No game or character Editor operation.

Construction tier lights, October 27:

- **34 Editor tests passed, 0 failed, 0 skipped**; Node projection 1/1 passed.
- Direct isolated renders: [CT1 amber single](ct1-lights.png),
  [CT2 cyan pair](ct2-lights.png), [CT3 purple long](ct3-lights.png).
- Simulator inset-study colors/run widths, fitted housings and bright emissive
  cores sit on neutral wall caps. Door edges, corners and internal joins stay
  clear. The visibility toggle removes fixtures without changing structure.
- Coverage checks run placement/coverage, comparison group perimeters, all-door
  exclusion, actual fixture materials/counts, toggle and isolated scene cleanup.
- Editor left on CT3 comparison with four doors 65% open, Play stopped, active
  scene clean and zero test controllers. Completed test state cleared.
- Cap placement is a provisional overhead art choice; no bloom, dynamic lamp
  lighting, game-rule changes or Synty mapping included.

Asset assignments and camera drag, October 27:

- **37 Editor tests passed, 0 failed, 0 skipped**; Node projection 2/2 passed.
- [Right-side asset panel](asset-panel.png) shows searchable, categorized source
  entries, All/Used/Assigned filters and per-target Assign/Unassign controls.
- 3,766 audited sources/sprites; 22 base room types and 16 mission locations.
- Assignments persist separately in the lab's ProjectSettings. Tests cover
  global Used versus room-local Assigned, repeated assignment, cross-room
  preservation/removal, reload, search/categories and save failure handling.
- Live downward drag of10 pixels changes pitch55→59. Separate Editor remains
  in Edit mode with clean active scene, no test run and zero test controllers.
- External 3D sources use file-type icons; sprites show images. Assigning is an
  art shortlist operation, not an import or placement into the room preview.

Drag/drop furnishing and initial room choices, October 27:

- **39 Editor tests passed, 0 failed, 0 skipped**; Node projection 3/3 passed.
- [Textured table placed in the room comparison](placed-props.png), rendered
  directly in the isolated PreviewScene. Static vendor renderers use disposable
  atlas materials; original assets/materials remain unchanged.
- 231 starter assignments cover all 22 base types and 16 mission locations,
  using 53 different assets. Defaults merge once; user removals persist.
- Live event checks: DragPerform places/saves a table, click-drag repositions it
  without orbiting, Delete removes it and reload confirms removal. Mission lab
  renders six authored cells, has nine candidates and independent placements.
- Tests cover static mesh plus sprite rendering, picking/floor projection,
  internal-seam fit, oversized fit warning state, edit/remove persistence across
  rooms/layouts, unchanged source materials and clean preview-scene disposal.
- Separate Editor: Play stopped, clean active scene, zero test controllers,
  completed run cleared. User-created placements during review preserved.
- Props use native prefab size; sprites are flat 1.5-unit references. Detailed
  structural registration and composition tuning remain future art work.

Input capture and structural handoff, October 27:

- **40 Editor tests passed, 0 failed, 0 skipped**; Node projection 3/3 passed.
- Asset rows claim the press and process a pending drag before preview input.
  Orbit requires its own empty-preview press; prop movement owns its capture.
- Regression reproduces a fast first movement from the sidebar into the room,
  checks no camera motion, cancellation/release and subsequent normal orbit.
  Its native drag-start callback is replaced only in the test to avoid the OS
  drag loop. The initial native run timed out; the isolated Editor was closed
  normally/reopened, then the corrected suite passed.
- Saved user placements/assignments retained; Edit mode, clean active scene,
  zero test controllers, no placement errors and completed run cleared.
- Game integration brief: [structural handoff](../../docs/room-structure-game-handoff.md).
  Scope: current primitive walls, junctions, split doors and CT cap lights only.
