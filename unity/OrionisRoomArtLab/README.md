# Orionis Room Art Lab

Independent Unity **6000.5.2f1** project for room presentation. Open this directory
in Unity Hub, then **Orionis > Art > Room Art Lab**. No Play mode is needed.
The game and character Art Lab can remain open in their own Editors.

Joinable rooms now default to **Show all joins together**, arranged as
`A A B / A A B / C C D`: A is a 2×2 group, B a vertical pair, C a horizontal
pair and D a single room. Colors and labels distinguish their independent
perimeters. A small preview-only gap separates groups; it adds no gameplay
spacing rule. Only authored supported joins appear. Disable the toggle to
inspect one footprint at a time. Non-joinable/special rooms retain their own
authored footprint.

This first batch implements handoff Waves A/B with primitive modules. Select any
canonical room, an authored physical footprint or supported joined layout, and
an authored construction tier. Toggle exterior cell-edge doors; the 1×1 matrix
slider covers all sixteen combinations. Drag the preview to orbit, scroll to
zoom, or use the camera sliders. Vertical drag direction is reversed: dragging
down increases camera pitch. Select a semantic module from the dropdown to
highlight it and inspect its registration. Asset rows capture their mouse press
and start dragging before preview input, even when the first movement crosses
the divider. Orbit requires a press in empty preview space; sidebar drags cannot
start orbit underneath. Escape cancels pending asset/preview gestures.
Clear hides the preview; Regenerate
restores it; Reset restores the current room's single footprint and camera.

Doors split into two half-width leaves. **Door open amount** slides them sideways
in opposite directions into the wall; height stays fixed. At zero the leaves
meet at the center, and at one both clear the opening.

The right-side **Room assets** panel lists the audited local models, prefabs,
animations and registered sprites. Both side panels resize by dragging their
inner divider. Search matches names, packs and source paths; Category narrows
the list. Placeable Synty prefabs show textured 3D thumbnails; sprites show
their image. Animation/character/raw-model sources remain labeled references.
**Source** reveals the exact original file.
The extension distinguishes prefab and source-model entries with the same name.

**Assign to** contains all 22 base room types and 16 mission locations. Choosing
a base target also selects its room preview. Mission locations render their
actual authored Stage footprint and retain independent art choices.
**Show all** lists every candidate, **Show used** lists assets
assigned to any room, and **Show assigned** lists the selected target's choices.
Search and Category apply to each filter. **Assign / Unassign** saves immediately
to this lab's `ProjectSettings/RoomArtAssignments.json`, surviving window/Editor
reloads. A first pass of 231 assignments covers all 38 targets using the audit's
53 candidate assets. Initial choices merge once with existing assignments;
later unassignments stay removed. **Show assigned** is the default filter.
These are provisional art choices and grant no game capabilities.

Drag an entry labeled **Drag to place** onto the room floor to instantiate its
static art. Synty prefab models use their native scale and bottom-center
registration; 2D specialist sprites place as flat reference images. Click a
placed item and drag it to reposition; dragging empty space orbits the camera.
The **Placed items** selector also finds props that are obscured or outside the
camera view. Adjust Position X/Z, Rotation and Scale, or use **Rotate 90°**.
**Remove item** or Delete/Backspace removes the selected placement. Its asset
stays assigned for another attempt. Overhanging a room/group shows a fit warning;
this is a visual fit study, not gameplay placement validation.

Placements save immediately to `ProjectSettings/RoomArtPlacements.json`,
separately per room and layout (single size, A/B/C/D comparison or mission).
Switching target or restarting the Editor restores that layout's props.
Render-only instances contain no vendor scripts or physics. Their disposable
materials map the source atlas to this lab's built-in renderer; originals stay
unchanged. Disabled sprite candidates stay labeled and cannot be placed.

Floors, square junctions, three straight segments per exterior cell edge, centered
door frames and split sliding leaves are disposable PreviewScene objects. Joined
edges have no walls or internal posts. Each cell retains its coordinate. The
layout selector explicitly distinguishes one self-large physical room from a
group of 2/4 physical rooms. No gameplay state or normal scene is saved.

The lab reads a presentation projection of the same validated snapshot builder
used by Unity. It stages the game's pure `RoomJoinGeometry` source unchanged;
the game `RoomGroups` delegates its structural check to that source. Staff,
construction state and persistent grouping remain game responsibilities.

From the repository root in Git Bash:

```bash
node unity/tools/room-art-lab.mjs stage
node unity/tools/room-art-lab.mjs stage-assets
node unity/tools/room-art-lab.mjs --check
node --test unity/tools/room-art-lab.test.mjs
```

After staging, refresh this Editor. `status`, `refresh`, `open`, `test` and
`cancel-tests` on that helper
verify this project's automation descriptor before contacting its own Editor.
Run **Window > General > Test Runner > EditMode > Orionis.RoomArtLab.Tests**
for catalog/layout, all sixteen single-cell door masks, joined/special topology,
invalid-door and active-scene/preview-cleanup checks.
`stage-assets` copies the existing Synty Models/Materials/Textures/Shaders/Prefabs
into this lab's ignored `Assets/Synty/` tree, without scenes or vendor C# scripts.
It operates only on files, not either other Editor. Refresh this lab afterward.
Run it before the placement tests on a fresh checkout.

Verified: 40 Editor checks and three Node projection checks pass. Preview evidence
is in `../../artwork/room-art-lab-proof/`.

Preview dimensions (4-unit cells, 2-unit walls) are provisional art measurements.
Construction tier lights default on; the toggle hides fixtures for structure
review. Exterior non-door wall caps carry the simulator's inset reference study:
CT1 one amber 8-unit lamp, CT2 two cyan 6-unit lamps, CT3 one purple 16-unit
lamp, centered within a neutral 24-unit channel. The simulator's 128-unit tile
maps to the lab's four-unit cell. Each lamp has a fitted dark bezel, colored
emissive lens and bright core. Neutral corners, internal joins and entire door
edges stay clear. The cap placement makes the lamps visible overhead; emissive
materials do not cast light or require bloom. Door leaves are neutral metal;
structural geometry is identical across tiers. No canonical material or scale
has been established by these placeholder measurements.

Later waves remain: structural-module/Synty bounds registration, full geometry
and lighting tuning, debug overlays, detailed furnishing presets and authoring
validation. Asset shortlists and free prop placement already persist.
Synty source assets currently live in `../StargateOrionis/Assets/Synty/`;
unchanged copies are staged into this lab only. The lab uses the built-in
renderer with preview-only atlas materials. This does not migrate game art.
