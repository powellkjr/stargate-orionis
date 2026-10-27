# Game chat handoff: current walls, split doors and CT lights

Prepared October 27, 2026. User request: bring **only the existing wall and
door scheme with its construction-tier lights** from the independent Room Art
Lab into the game. This handoff is ready for implementation by the game chat;
this workstream has not changed the game or operated its Editor.

## Copyable request for the game chat

> Continue the existing game task and read `REPO_MAP.md`, `CURRENT_TASK.md` and
> `docs/room-structure-game-handoff.md`. Integrate the Room Art Lab's current
> primitive perimeter walls, square junctions, centered frames, two sideways
> sliding door leaves and inset CT cap lights into the game's presentation.
> Preserve the current game controls, authored footprints, physical room IDs,
> legal Room Groups, mission visibility, transitions and door state. Use the
> exact geometry/colors described here and adapt materials to the game's URP
> renderer. Scope is structure only: no furnishings, asset assignments, prop
> placements, Synty imports, art-lab UI or new gameplay rules. Keep the Room Art
> Lab independent. Verify base and mission presentation using existing focused
> walkthroughs, then update the current task. Report any missing mapping for
> base door placement or mission CT rather than inventing canonical data.

## Sources and visual references

Paths are relative to the repository root.

| Source | Reuse |
| --- | --- |
| `unity/OrionisRoomArtLab/Assets/RoomArtLab/Editor/RoomArtTopology.cs` | `RoomArtEdge`, sides, semantic modules, `Exterior`, `Build`, `PositionAt` and door slide vectors. It uses UnityEngine/System but no UnityEditor API. Adapt/extract the pure generator into runtime presentation code; the file currently belongs to an Editor assembly. |
| `unity/OrionisRoomArtLab/Assets/RoomArtLab/Editor/RoomArtPreview.cs` | `Rebuild` primitive rendering, `StraightDoor` jamb/lintel assembly, CT fixture cubes and `Material` emission treatment. These are references to port, not a runtime dependency on this Editor preview class. |
| `unity/OrionisRoomArtLab/Assets/RoomArtLab/Editor/RoomArtTierLights.cs` | Exact CT colors, core colors, run lengths/offsets and fixture eligibility. No Editor API. |
| `unity/OrionisRoomArtLab/Assets/RoomArtLab/Tests/Editor/RoomArtLabTests.cs` | Sixteen door masks, legal/special perimeters, split-leaf motion, CT patterns, door exclusions and isolation coverage. |
| `unity/StargateOrionis/Assets/Orionis/Domain/RoomJoinGeometry.cs` | Existing game authority for legal group geometry. The lab stages this exact source; do not copy the lab's generated duplicate into the game. |
| `demos/room-sandbox/room-kit-lighting.mjs` | Original inset lamp presentation study. The Unity lab is its 3D cap adaptation. |

Visual references: [CT1 amber](../artwork/room-art-lab-proof/ct1-lights.png),
[CT2 cyan](../artwork/room-art-lab-proof/ct2-lights.png),
[CT3 purple](../artwork/room-art-lab-proof/ct3-lights.png), and
[split-door comparison](../artwork/room-art-lab-proof/join-comparison.png).
Use these structure-only captures rather than the later furnished-room study.

The A/B/C/D board, colored floors, labels and 0.4-unit gaps are lab comparison
tools. They are not the game's room arrangement or a spacing requirement.

## Integration boundaries and existing game entry points

The current game uses Canvas-based room presentation in
`Presentation/RoomMapView.cs` and `Presentation/RoomInteriorView.cs`; mission
presentation is in `Presentation/MissionMapView.cs`. The lab uses a built-in
renderer `PreviewRenderUtility`, whereas the game has URP installed. Integrate
the visual scheme through a compatible game presentation adapter/render surface;
do not reference UnityEditor types from runtime or replace game navigation with
the lab window. Keep existing inventory, work, selection, action hexes and
camera/pan input usable around/over the structural art.

Base input comes from the actual physical room instances and Room Groups,
their authored footprints and `ConstructionTier`. Build a perimeter separately
for each independent physical room or deliberately joined Group. Never union
all adjacent occupied base cells: that would erase walls between independent
rooms. Legal joined children retain identity, Core Sets, staffing and custody.
Special 2x2/3x3 physical rooms are not four/nine independent rooms.

Two independent adjacent rooms can share a boundary. Avoid coplanar duplicate
rendering there using a presentation ownership rule while retaining their
separator and identities; do not infer a join or opening from adjacency.

The lab's door checkboxes are arbitrary preview placements. Base map/interior
UI inspected for this handoff does not provide this art generator with a
canonical list of exterior door edges. The game chat must inspect existing
room/connection data for an authoritative mapping. If none exists, report that
gap and make any temporary art placement explicit. A visible opening cannot
create connectivity or a gameplay door.

Mission input comes from authored Stage cells and transitions in
`demos/shared/data/offworld/*.finalized.json` and their existing Unity projection.
The lab normalizes cell origins only for preview. Keep game/world positions and
authored shapes, including irregular outlines; do not substitute a Stage's
bounding rectangle. A Stage boundary is not automatically a physical wall:
outdoor Gate clearings, mountain trails and courtyards still need the existing
indoor/outdoor presentation distinction. Room archetype names alone are not
sufficient: Last Transmission's mountain approach uses a hallway archetype.

`Domain/MissionTravel.cs` owns `TravelDoor`, visibility through `DoorVisible`,
and `TravelState.OpenDoors`. Use those existing state/visibility decisions when
animating a known door. Hidden exits/rooms must remain hidden; interpolation is
visual only and never opens an authored locked route. The lab uses one shared
door-open slider; the game needs an amount per real visible door instance.
Authored transitions also carry `directionFrom` / `directionTo`; the inspected
`TravelDoor` class retains Stage endpoints but not those directional fields or
a cell-edge anchor. Reuse an existing spatial projection if one exists, or
project the authored orientation explicitly. For a multi-cell boundary, direction
alone does not identify one exterior cell edge: report any missing anchor
instead of placing a new door on every matching edge.

**Mission CT is not established by this art study.** The lab renders mission
footprints in CT1 as a provisional preview style. Use an authored CT if one is
actually supplied; otherwise report the mapping gap and keep any visual default
explicit. Construction Tier does not imply Technology Tier or capability.

## Exact primitive geometry

Coordinates: cells `(x,y)` map to the Unity X/Z ground plane; Y is height.
The lab's measurements are provisional art scale. Keep their proportions when
mapping to game cell size; apply one uniform scale `gameCellSize / 4`.

| Measurement | Preview units |
| --- | ---: |
| Cell side | 4 |
| Wall height / thickness | 2 / 0.2 |
| Square junction width/depth | 0.24 / 0.24 |
| Wall segment length `L = (4 - 0.24) / 3` | 1.253333333 |
| Three segments per exterior cell edge | indices 0, 1, 2 |

An exterior edge has no occupied neighbor **inside the same rendered room/group**.
Place square junctions at unique perimeter cell-edge endpoints, centered at
Y=1. Each straight segment is `(L, 2, 0.2)`, centered at Y=1, running from the
junction half-width (0.12) across the three segment centers. Only perimeter
endpoints become junctions; shared internal edges and internal posts are absent.
A joined 2x2 has no central post or cross of internal walls.

`RoomArtTopology.Build` also emits primitive floors. The floor is only a support
surface for this handoff: retain the game's existing floor treatment unless a
minimal render adapter requires the plain floor mesh. Do not import room-specific
floor artwork, comparison tints or furnishings with the structural scheme.

### Centered split doors

On an authored exterior door edge, replace segment 1 with a frame. Segments 0
and 2 stay walls. Reject internal or outside door-edge requests as the lab does.
Local X follows the wall tangent; use the module quaternion for all four sides.

| Piece | Local placement and size |
| --- | --- |
| Jambs | X=`±(L - 0.08)/2`, Y=0 relative to the frame center; each `(0.08, 2, 0.2)` |
| Lintel | Local `(0, 0.85, 0)`; size `(L - 0.16, 0.3, 0.2)` |
| Opening width `O` | `L - 0.16` = 1.093333333 |
| Each leaf | `(O/2, 1.7, 0.08)`; world/local-room Y center 0.85 |
| Closed leaf centers | Door midpoint `± tangent * O/4` |
| Leaf motion at `u` | `± tangent * (O/2 + 0.02) * Clamp01(u)` added to the closed center |

At `u=0`, leaves meet exactly at the center. At `u=1`, both clear the opening
and retract sideways into the flanking wall. Height stays fixed throughout;
there is no vertical lifting. Use `RoomArtModule.PositionAt(u)` as the geometry
reference. Leaf appearance is neutral metal, not a tier-colored solid panel.
Door animation must follow runtime state without becoming its authority.

## CT lights: exact current treatment

Keep structural geometry identical across CT1/2/3. Lights sit on the wall cap,
readable from overhead. Each eligible exterior edge has a centered 24/128-cell
metal-backed channel. Place fixtures only on the center **plain straight**
module, and exclude the entire edge if that group/cell/side has a door frame.
Corners/junctions, internal joins, door leaves and door headers stay unlit.

Let `s = 4/128 = 0.03125`. Runs below use local X along the wall.

| Tier | Colored run centers | Width per run | Lens color | Core color |
| --- | --- | --- | --- | --- |
| CT1 | 0 | `8s` = 0.25 | `#ffb52e` | `#fff4ce` |
| CT2 | `-5s`, `+5s` | `6s` = 0.1875 each | `#20cfff` | `#e4fcff` |
| CT3 | 0 | `16s` = 0.5 | `#c164ff` | `#f8e5ff` |

Dimensions below are **local to a wall module**, with `top = wallHeight/2 = 1`.
The module itself is centered at world/local-room Y=1.

| Piece | Center local Y | Size X / Y / Z |
| --- | --- | --- |
| Channel metal | `top + .006` | `24s / .012 / 6s` |
| Each fitted dark housing | `top + .016` | `(runWidth + 2.4s) / .012 / 5.4s` |
| Each recess | `top + .023` | `(runWidth + .8s) / .006 / 4.6s` |
| Each colored lens | `top + .027` | `runWidth / .006 / 3.4s` |
| Each bright core | `top + .031` | `(runWidth - s) / .003 / 1.1s` |

Every lamp gets its own close-fitting housing, with neutral metal left between
or around runs. Do not replace this with a continuous glowing perimeter or one
oversized recess. Lamp and core use pure emission so the preview light does not
wash their hue toward white: black diffuse color, emission=`color.linear` in
the current Standard material. Adapt that intent to URP without changing global
renderer settings. Bloom and cast light are not part of the current treatment.

Current neutral colors, as Unity float RGB: walls `(0.66,0.70,0.73)`, junctions
`(0.42,0.48,0.54)`, leaves `(0.28,0.35,0.41)`, channel metal `(0.48,0.55,0.60)`,
housing `(0.16,0.20,0.24)`, recess `(0.035,0.05,0.075)`.

## Suggested implementation batches and acceptance

1. Add/adapt the pure perimeter/module generator and a runtime render adapter.
   Connect base physical rooms/actual Groups and visible indoor mission geometry;
   verify single, horizontal/vertical pairs, joined 2x2 and authored special
   sizes without changing physical identity or mission paths. Keep independent
   room separators and existing interaction/input surfaces.
2. Add known exterior doors and CT cap fixtures using the exact transforms
   above. Drive each leaf pair from existing door state, and CT from existing
   authored/instance data. Keep unresolved base-door/mission-tier mappings
   explicit. Verify materials in the game renderer and complete relevant existing
   walkthroughs before describing the game-side integration as complete.

Acceptance checks:

- All 16 single-cell door combinations; all four orientations at `u=0,.5,1`.
  Leaf centers stay symmetric, fixed in height, and clear the opening at 1.
- Single, 1x2, 2x1, 2x2 and authored special/mission perimeters. No illegal joins,
  missing separators, internal walls/posts or duplicate coplanar boundary art.
- CT1 one amber, CT2 two cyan, CT3 long purple; exact widths/offsets, fitted
  housings, neutral corners and no lamps on door edges. CT changes no geometry.
- Existing base selection/pan, room work/inventory controls and mission hexes
  remain usable. Panel gestures capture input; pointer entry alone cannot start
  camera movement underneath a UI drag.
- Hidden/locked mission transitions preserve visibility and admission. No new
  Knowledge, capability, travel, room IDs, custody or save semantics from art.
- Use existing focused game tests/walkthroughs. Follow the game's required
  PlayMode cleanup/ordinary Bootstrap restart rules if those tests are run.

Room Art Lab reference checks from Git Bash, repository root:

```bash
node unity/tools/room-art-lab.mjs --check
node --test unity/tools/room-art-lab.test.mjs
node unity/tools/room-art-lab.mjs test
node unity/tools/room-art-lab.mjs cancel-tests
```

Those commands target **only the separate lab** and validate the reference,
not the game integration. See `artwork/room-art-lab-proof/README.md` for evidence.
Synty assets, asset-browser/drag UI, starter assignments, placement files,
characters and furnishing presets are outside this structural handoff. No
Asset Store download or `stage-assets` import is needed for primitive structure.

Game integration, October27: `StargateOrionis/Assets/Orionis/Presentation/Structure/`
copies the two pure geometry/light builders into the game namespace and projects
their boxes onto the existing canvas maps using unlit vertex colors. Floors,
input surfaces, physical identities and actual Room Groups remain authoritative.
Only known indoor mission Stages receive walls; hidden exits do not cut openings.
Door leaves use travel's existing OpenDoors state and preserve animation amounts
across map rebuilds. Mission CT is unknown, so no mission CT lamps are invented.

Base saves retain no cell-edge door anchor; the legacy side-only doorIndex is
ambiguous for multi-cell footprints. Base perimeters/CT fixtures are supported,
but base door openings remain pending an authored mapping. Mission direction data
is projected outside mission save truth. Two wide boundaries (Security/Office and
Processing/Lab) have multiple possible adjacent edges; presentation explicitly
marks its existing first-shared-edge choice provisional. This does not change
travel or introduce new connectivity. No isolated lab files or vendor assets
are changed by the game adapter.
