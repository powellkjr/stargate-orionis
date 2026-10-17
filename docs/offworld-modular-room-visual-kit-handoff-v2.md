# Offworld Room Visual Kit Handoff for Codex

## Purpose

Update the `offworld-2d-sprite-renderer` room-art approach so authored room visuals are no longer single baked room sprites with a fixed doorway.

The simulator must support:

- arbitrary door placement
- rooms with multiple doors
- horizontally/vertically joined rooms
- 2x2 joined rooms
- authored perimeter content such as conveyors, shelving, cabinets, machinery, piping, storage racks, etc.
- visual variety without generating every possible room/door combination

Codex should use this handoff to update the room visual contract and generate the new image-generation prompts.

This is a presentation-system change only. Do not change Offworld gameplay semantics.

## 1. Core Decision

A room visual kit is composed from a **3x3 presentation grid**:

```text
┌──────────┬──────────┬──────────┐
│ CORNER   │ EDGE     │ CORNER   │
├──────────┼──────────┼──────────┤
│ EDGE     │ CENTER   │ EDGE     │
├──────────┼──────────┼──────────┤
│ CORNER   │ EDGE     │ CORNER   │
└──────────┴──────────┴──────────┘
```

The simulator does not use a complete room image with a pre-baked doorway.

Instead it assembles the room from six semantic asset types:

```text
CENTER
CORNER
SHARED
EDGE_NORMAL
EDGE_DOOR
EDGE_OPEN
```

Every piece must be rotatable so the same source asset can serve all four cardinal orientations where appropriate.

## 2. Meaning of the Six Pieces

### CENTER

The middle of one logical room cell.

May contain authored floor treatment or room-specific central visual detail.

It must not depend on door placement or neighboring room topology.

Examples:

```text
receiving floor
material-storage floor
lab floor
security floor
```

### CORNER

Used when both edges meeting at a corner are room perimeter/boundary edges.

Example:

```text
north edge = boundary
west edge = boundary
→ northwest slot = CORNER
```

CORNER may contain authored corner furniture such as:

```text
conveyor turn
storage rack bend
cabinet cluster
pipe elbow
wall machinery
```

But it must remain inside the corner zone and may not obstruct the center of either adjacent edge slot.

### SHARED

Used when one edge meeting at a corner is an exterior/perimeter edge and the other is an internal joined/open edge.

Example:

```text
north edge = boundary
east edge = shared with adjacent room cell
→ northeast slot = SHARED
```

SHARED is effectively a wall/end treatment that allows the room to continue through the joined side without placing two CORNER pieces back-to-back.

It must visually terminate or continue the authored perimeter content cleanly.

### OPEN CORNER CONDITION

If both edges meeting at a corner are shared/open internal joins:

```text
east = shared
south = shared
```

then no CORNER or SHARED artwork is drawn.

This is an empty/open corner condition and should visually become continuous floor.

No dedicated asset is required unless implementation proves otherwise.

### EDGE_NORMAL

Used on a perimeter edge with no doorway.

This is where authored wall-adjacent content may live.

Examples:

```text
conveyor run
storage shelving
wall console bank
pipe run
plain wall
```

### EDGE_DOOR

Used on a perimeter edge containing an actual authored Transition/door.

This asset must preserve a clear doorway/access opening in the center of the edge.

Examples:

```text
conveyor split around doorway
storage racks with central aisle
plain wall with door frame
```

Door access is authored into the visual kit rather than punched destructively through arbitrary furniture.

### EDGE_OPEN

Used when this edge is shared with another cell in the same joined Stage/room.

Examples:

```text
joined 1x2 room
joined 2x2 room
larger irregular Stage footprint
```

This piece must not visually block movement between the cells.

It may contain:

```text
floor trim
conveyor termination
edge termination detail
small nonblocking continuation detail
```

or may be visually empty.

It must never create a wall or obstruct the shared opening.

## 3. Corner Resolution Rules

For each corner slot, inspect the two edges meeting there.

Use:

```text
BOUNDARY + BOUNDARY
→ CORNER

BOUNDARY + SHARED
→ SHARED

SHARED + BOUNDARY
→ SHARED, rotated appropriately

SHARED + SHARED
→ OPEN / draw nothing
```

A doorway is still considered a boundary edge for corner classification.

So:

```text
DOOR + NORMAL
→ CORNER
```

unless a later visual kit explicitly requires a special doorway-corner treatment.

Do not create doorway-specific corner assets in v1.

## 4. Edge Resolution Rules

For each cardinal edge of each Stage cell:

```text
neighbor cell belongs to same Stage
→ EDGE_OPEN

no same-Stage neighbor AND Transition exists on this exact cell edge
→ EDGE_DOOR

no same-Stage neighbor AND no Transition
→ EDGE_NORMAL
```

This requires transitions to resolve to a specific Stage-cell boundary edge when a Stage spans multiple cells.

If current mission data only stores direction and becomes ambiguous for multi-cell Stages, Codex should identify the smallest presentation/geometry addition needed to resolve:

```text
fromCell
toCell
or equivalent boundary-edge identity
```

Do not guess between two possible north edges of a 2x2 room.

## 5. Joined Room Behavior

### 1x2 Example

```text
┌──────────┬──────────┐
│    A          B     │
└──────────┴──────────┘
```

Internal relationship:

```text
A.east = EDGE_OPEN
B.west = EDGE_OPEN
```

The two corner slots around the join become SHARED rather than CORNER.

There must not be two full corners or two wall ends facing one another.

### 2x2 Example

```text
┌──────────┬──────────┐
│    A          B     │
│                     │
│    C          D     │
└──────────┴──────────┘
```

Internal edges:

```text
A.east  = OPEN
A.south = OPEN

B.west  = OPEN
B.south = OPEN

C.north = OPEN
C.east  = OPEN

D.north = OPEN
D.west  = OPEN
```

At the exact middle where all four cells meet:

```text
SHARED + SHARED
→ draw no corner piece
```

The interior should read as one continuous room.

## 6. Visual-Kit Contract

Each room style/archetype should point to one visual kit.

Conceptual example:

```json
{
  "visualKit": "receiving",
  "pieces": {
    "center": "receiving-center",
    "corner": "receiving-corner",
    "shared": "receiving-shared",
    "edgeNormal": "receiving-edge-normal",
    "edgeDoor": "receiving-edge-door",
    "edgeOpen": "receiving-edge-open"
  }
}
```

Material Storage example:

```json
{
  "visualKit": "material-storage",
  "pieces": {
    "center": "material-storage-center",
    "corner": "material-storage-corner",
    "shared": "material-storage-shared",
    "edgeNormal": "material-storage-edge-normal",
    "edgeDoor": "material-storage-edge-door",
    "edgeOpen": "material-storage-edge-open"
  }
}
```

A simple room may still use the same system with mostly plain assets.

## 7. Authored-Content Boundary Rule

This is the key art rule:

> No authored visual element may cross a module boundary in a way that prevents an EDGE slot from independently becoming NORMAL, DOOR, or OPEN.

Examples:

Allowed:

```text
conveyor bend fully contained in CORNER
conveyor run fully contained in EDGE_NORMAL
conveyor split around clear doorway in EDGE_DOOR
conveyor termination fully contained in EDGE_OPEN
```

Not allowed:

```text
conveyor from CORNER extending through the middle of EDGE_DOOR
rack spanning CORNER + EDGE as one indivisible object
machine crossing from CENTER into EDGE_OPEN
```

The module seams should be visually designed to join cleanly.

## 8. Coordinated Room-Kit Variants

Generate **three complete coordinated visual-kit variants** for every room archetype/style.

Do not independently randomize semantic pieces.

Example for Receiving:

```text
RECEIVING v01
  center
  corner
  shared
  edge_normal
  edge_door
  edge_open

RECEIVING v02
  center
  corner
  shared
  edge_normal
  edge_door
  edge_open

RECEIVING v03
  center
  corner
  shared
  edge_normal
  edge_door
  edge_open
```

That is still:

```text
6 semantic pieces × 3 coordinated variants = 18 source assets per visual kit
```

But the simulator selects **one room-kit variant for the entire Stage**.

If a Receiving Stage selects `v02`, every modular piece used by that Stage comes from `RECEIVING.v02`.

Do not mix:

```text
corner v01
edge_normal v03
shared v02
```

inside one room.

This prevents authored-content seams from becoming incoherent, such as one module ending with a refrigerator while the adjacent module expects an oven, conveyor, shelf run, cabinet bank, pipe run, or another authored continuation.

The pieces inside a kit variant are a coordinated family.

Where authored perimeter content visually reaches a module seam, all pieces in that room-kit variant must use the same standardized seam/socket positions.

The three complete room variants may vary:

```text
surface panel details
perimeter equipment layout
small clutter
restrained accents
minor wear
nonfunctional decoration
```

They must not vary:

```text
camera
module dimensions
registration
door opening position
join geometry
footprint
functional clearance
construction-tier slot geometry
```

## 9. Room-Kit Variant Selection Must Be Deterministic

The Stage chooses one visual-kit variant.

Do **not** choose a new variant every render.

Recommended conceptual rule:

```text
roomVariant =
hash(
  missionSeed,
  stageId,
  visualKitId
) % 3
```

The exact hash implementation should follow existing repo conventions.

The same Stage must retain the same room-kit variant when:

```text
the UI rerenders
the player leaves and returns
the mission reloads
the camera changes
```

All cells belonging to the same multi-cell Stage use the same selected room-kit variant.

The intent is that different rooms of the same archetype can look different on the map, while each individual room remains internally coherent.

## 10. Shared Joins Stay Inside the Selected Kit

Once a Stage selects a coordinated room-kit variant, every `CENTER`, `CORNER`, `SHARED`, `EDGE_NORMAL`, `EDGE_DOOR`, and `EDGE_OPEN` piece comes from that same variant.

Example:

```text
MATERIAL_STORAGE v02
```

A 2x2 Material Storage Stage uses:

```text
material-storage-v02-center
material-storage-v02-corner
material-storage-v02-shared
material-storage-v02-edge-normal
material-storage-v02-edge-door
material-storage-v02-edge-open
```

throughout the whole Stage.

No per-boundary random variant selection is needed.

Rotation and topology determine which semantic piece is placed, not which variant family it comes from.

## 11. Asymmetric SHARED Treatment

Default v1 should use one rotatable `SHARED` asset per coordinated kit variant.

If actual art proves that the perimeter treatment cannot be rotated cleanly, Codex may propose a paired treatment such as:

```text
SHARED_LEFT
SHARED_RIGHT
```

Do not add paired SHARED assets preemptively.

If paired SHARED assets are introduced, both remain members of the same coordinated room-kit variant and must use the same standardized seam/socket positions.

## 12. CENTER Behavior

All cells of a multi-cell Stage use the selected room-kit variant.

CENTER art may repeat across cells or use deterministic subvariation only if that subvariation is guaranteed seam-safe and cannot break authored content.

Default v1 should prefer the same CENTER family for all cells in the Stage rather than introducing independent per-cell visual randomness.

Topology safety and visual coherence are more important than micro-variation.

## 13. Rotation

The six semantic assets should be generated in one canonical orientation wherever practical.

Codex should define one canonical orientation for every prompt.

Recommended:

```text
CORNER:
northwest

SHARED:
north edge + west/open or another single documented canonical orientation

EDGE_NORMAL:
north edge

EDGE_DOOR:
north edge

EDGE_OPEN:
north edge

CENTER:
north up
```

The simulator may rotate assets to EAST/SOUTH/WEST.

Because rotation is required, artwork must use rotation-tolerant lighting.

Avoid strong baked directional shadows or highlights that look wrong after 90-degree rotation.

## 13A. LOCKED Construction-Tier Wall System

Construction tier does **not** use a different wall model.

CT1, CT2, and CT3 use the same base wall/corner/door family and the same modular geometry.

Tier identity is expressed by a continuous pattern running around the room perimeter underneath the wall art.

### Base principle

The wall body remains mostly neutral/light-colored.

The construction-tier treatment is rendered underneath a narrow transparent slot in the wall border.

Conceptually:

```text
room / floor
→ construction-tier pattern underlay
→ neutral modular wall body with transparent slot
→ optional door/frame detail
```

The colored section visible through the slot is the wall opening exposing the underlying tier pattern.

Do not recolor the entire wall body by construction tier.

Do not create separate CT1, CT2, and CT3 architectural wall models.

### Running-slot geometry

Each perimeter wall module contains a continuous:

```text
5 × 24 unit running slot
```

The same slot dimensions and registration apply anywhere the room perimeter remains visible, including the relevant portions of:

```text
EDGE_NORMAL
EDGE_DOOR
CORNER
SHARED
```

The slot must line up continuously when modules are assembled and rotated.

The tier pattern is defined across the 24-unit run.

### CT1 pattern

```text
8 wall-color
8 amber
8 wall-color
```

Conceptually:

```text
[########][AAAAAAAA][########]
    8          8         8
```

CT1 reads as one small centered amber opening.

### CT2 pattern

```text
3 wall-color
5 blue
4 wall-color
5 blue
3 wall-color
```

Conceptually:

```text
[###][BBBBB][####][BBBBB][###]
  3     5      4      5     3
```

CT2 reads as two evenly spaced blue openings.

### CT3 pattern

```text
4 wall-color
12 purple
4 wall-color
```

Conceptually:

```text
[####][PPPPPPPPPPPP][####]
   4        12         4
```

CT3 reads as one large centered purple opening.

### Door interaction

The tier pattern runs continuously around the room border.

The door frame does **not** need special top-versus-bottom tier-light logic.

Depending on the exact module composition, the running slot may appear:

```text
above the door
below the door
through a door-frame border channel
```

The only requirement is preservation of the same continuous slot registration.

Do not create separate `door-top-light` and `door-bottom-light` variants.

### Corner interaction

CORNER uses the same construction-tier slot language as EDGE modules.

A CT3 corner is not a new architectural corner model. It is the same structural corner family with the CT3 underlay visible through the standardized slot.

### SHARED / joined-room interaction

Internal joined edges do not create walls.

Where a perimeter wall terminates beside an internal shared/open join, SHARED artwork must terminate the tier-slot treatment cleanly.

Do not place back-to-back tier-lit corners across a joined internal edge.

### Recommended renderer layering

Prefer:

```text
construction-tier pattern underlay
neutral wall sprite with transparent running slot
door/frame sprite where applicable
```

The wall sprite should use real transparency in the running-slot region where the tier pattern must show through.

Do not add a broad wall recolor mask unless implementation review proves one is actually required.

### Construction-tier visual language

For the current presentation contract:

```text
CT1 = amber
CT2 = blue
CT3 = purple
```

Static treatment is sufficient for the browser prototype.

The same underlay may later be animated or enhanced without changing the wall sprite contract.

### Tier compatibility requirement

All tiers preserve identical:

```text
wall thickness
corner footprint
door opening width
door registration
module dimensions
rotation pivot
shared-edge geometry
seam/socket positions
5 × 24 running-slot position
```

A room must be able to change construction tier without changing topology or requiring a different room-layout sprite.

**This construction-tier wall rule is LOCKED.**

## 14. Image-Generation Prompt Requirements

Codex should generate a reusable prompt template for each semantic piece:

```text
CENTER
CORNER
SHARED
EDGE_NORMAL
EDGE_DOOR
EDGE_OPEN
```

Each prompt must state:

- exact visual-kit name
- coordinated room-kit variant (`v01`, `v02`, or `v03`)
- semantic role
- canonical orientation
- exact source canvas requirements
- transparent/opaque background requirement
- module registration
- what content is allowed in the module
- what content is forbidden from crossing module boundaries
- rotation requirement
- three-variant packaging requirement
- direct-overhead camera
- north-up canonical orientation
- rotation-tolerant lighting
- no text/UI/watermark

Prompts should use the existing sprite production contract for file format and source-art normalization.

Do not invent a second incompatible art pipeline.

## 15. Door Prompt Requirement

EDGE_DOOR is especially important.

The image-generation prompt must explicitly require:

```text
door/access opening centered in the edge slot
opening width identical across v01/v02/v03
clear passage through the module
no furniture crossing the opening
same module footprint as EDGE_NORMAL and EDGE_OPEN
```

Visual furniture may route around the opening.

Examples:

```text
conveyor splits around doorway
storage shelves stop before aisle
pipe run rises/terminates around access
```

The access path itself must remain visually clear.

## 16. Open-Edge Prompt Requirement

EDGE_OPEN must depict a joined-room boundary, not a doorway.

It should communicate:

```text
this room continues directly into the adjacent room cell
```

It must contain:

```text
no wall
no closed doorway
no threshold that implies a separate room unless desired by the visual kit
no blocking furniture
```

It may use subtle continuation/termination graphics.

## 17. Shared-Corner Prompt Requirement

SHARED must not look like a complete room corner.

It represents:

```text
one exterior/perimeter edge
+
one internal/open joined edge
```

The authored perimeter content should terminate or transition cleanly toward the open side.

It must not visually create a post or wall blocking the join.

## 18. Center Prompt Requirement

CENTER variants must be mutually compatible.

All three CENTER variants for one visual kit must:

```text
share exact module dimensions
share exact floor-edge registration
tile against one another
contain no mandatory wall or doorway
avoid content that blocks arbitrary joins
```

Large authored central machinery should remain a separate room-specific prop unless it can safely exist regardless of room topology.

## 19. Current Authored Furniture vs Runtime Furniture

This system applies to **art baked into the room visual kit**, such as:

```text
conveyors
storage shelving
wall cabinets
fixed industrial trim
fixed perimeter machinery
built-in room architecture
```

It is not the same as runtime/additional furniture or mission instances.

Do not merge these concepts.

Room-kit authored content is presentation art.

Mission instances remain separate runtime objects.

## 20. Compatibility With Existing Offworld Runtime

The room visual kit must remain downstream of:

```text
Stage cells
Stage topology
Transitions
visibility
runtime state
```

Sprites do not determine topology.

The renderer asks topology which module to draw.

Never infer gameplay connectivity from the artwork.

## 21. Hidden Information

The existing hidden/partial-visibility rules remain authoritative.

Do not use a specialized room kit in fog/partial knowledge if doing so would expose hidden Reality the current renderer intentionally conceals.

Keep the current neutral fog behavior where appropriate.

## 22. Codex Implementation Review

Before writing prompts, Codex should inspect the current branch and answer:

1. Can the existing `surfaceGeometry(stage.cells)` boundary calculation be reused?
2. What is the cleanest representation of the 3x3 room modules in the current SVG renderer?
3. Does a Transition currently identify a unique cell edge for multi-cell Stages?
4. If not, what minimal data addition is required?
5. Should EDGE_OPEN be rendered once per shared boundary or once per adjoining cell?
6. What exact source/runtime dimensions should each module use?
7. What exact rotation origin should each module use?
8. How should variants be represented in `sprite-manifest.mjs`?
9. What deterministic variant-selection helper should be added?
10. How do we test 1x1, 1x2 and 2x2 room assembly?

## 23. Required Test Fixtures

Add presentation tests for at least:

### 1x1 room

```text
0 doors
1 door north
2 doors opposite
2 doors adjacent
3 doors
4 doors
```

No new mission content is required; these may be presentation/unit fixtures.

### 1x2 joined room

Test:

```text
shared internal edge
no back-to-back corners
SHARED corner resolution around join
door on outer perimeter
```

### 2x2 joined room

Test:

```text
all four internal edges open
center meeting point has no corner posts
multiple outer doors
doors on different outer cell edges
normal wall-authored content remains on non-door perimeter
```

The test should confirm topology selection, not art beauty.

## 24. Requested Codex Deliverables

Codex should return:

1. recommended implementation changes
2. exact six-piece visual-kit schema
3. exact coordinated room-kit variant schema
4. deterministic Stage-level variant-selection rule
5. any required transition-edge data change
6. source/runtime dimensions for every module type
7. exact implementation contract for the LOCKED CT1/CT2/CT3 5×24 running-slot underlay system
8. six reusable image-generation prompt templates
9. prompt rules ensuring all six pieces in one variant are authored as a coordinated family
10. one complete example prompt set for `receiving`
11. one complete example prompt set for `material-storage`
12. filename/ZIP convention for the 18 assets per visual kit
13. tests for 1x1, 1x2, and 2x2 composition
14. tests proving one coordinated room-kit variant is used across an entire Stage
15. tests proving CT1/CT2/CT3 preserve identical wall geometry and differ only in the locked slot pattern/treatment
16. any conflict with the current sprite production contract

Do not generate final room art in Codex.

The purpose of this task is to make the renderer and image-generation prompts agree on a topology-safe modular room-kit contract with coherent Stage-level variation and a reusable construction-tier wall system.
