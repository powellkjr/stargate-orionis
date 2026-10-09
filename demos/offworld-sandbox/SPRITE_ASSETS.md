# Offworld sprite asset specification — placeholder review

Branch: `offworld-2d-sprite-renderer`. This is a presentation experiment for the
unchanged Missing Operative benchmark. Its runtime owns movement, visibility,
work, combat, conversations and recovery. Sprites never own collision or position
rules. The Schematic option preserves the original renderer for comparison.

## Renderer and scale

The existing SVG camera contains external image sprites plus the existing HTML
and SVG gameplay UI. `map.mjs` accepts optional presentation hooks from
`sprite-renderer.mjs`; both views share the same visibility gates, map layout,
action admission and event selectors. No runtime is duplicated. Asset lookup is
centralized in `sprite-manifest.mjs`. Static resources are in
`../shared/sprites/offworld/`. Failed resource paths are remembered per session,
and unchanged map markup does not replace the SVG DOM on idle ticks. No build/dependency installation is needed.

One logical cell is 100 SVG world units. It has no pixel-collision meaning.
Placeholder square sources use a 128×128 viewBox. Floor images occupy 100×100
world units; people 22×22, small objects 24–26, machines/test rigs 30×30 and Gate
56×56. Wall strips use a 128×12 viewBox and occupy 100×10 world units. Corners
occupy 8×8. Asset entries declare source path, size and normalized center pivot
(0.5, 0.5). The renderer sets world size; source pixel dimensions do not change
mission cells or footprints.

Center fits the active Stage footprint with 100 world units of framing margin
and a minimum height of 240 world units. Existing drag, pinch, wheel and +/-
controls use SVG viewBox scaling; width is bounded to 180–1800 world units.
Image sizes scale with the camera. Action hexes retain their existing screen-size
adjustment. Mobile can zoom into occupants and pan around large rooms. There is
no second movement simulation or motion tween that changes physical state.

## Art convention and output

Use direct overhead, chunky silhouettes, simple color blocks and mature human
proportions. Avoid perspective/isometric faces, photorealistic textures and tiny
pixel details. Floors face north and tile without seams; walls show their top
surface rather than a tall interior face. Props and characters are centered on
the declared pivot, facing north at rest. Keep silhouettes inside the square
bounds with small transparent margins. State overlays must remain readable.

For polished raster replacement, supply transparent PNGs at 128×128 for people,
props and corners; Gate can use 256×256 while keeping its world size. Floors are
opaque seamless 128×128 tiles; walls are horizontal 128×12 strips. SVG resources
may also be replaced directly. Paths change only in the manifest, not gameplay
code. Assets must be same-origin relative URLs, with no embedded labels, scripts,
external references or UI. Source paths resolve relative to the Offworld page.
No atlas is required for this proof; atlas cropping needs an explicit later
extension rather than silently treating a sheet as a single sprite.

## Required library and current placeholders

| Category | Asset keys | Treatment |
| --- | --- | --- |
| Floors | `floor-indoor`, `floor-lab`, `floor-outdoor`, `floor-fog` | One tile per authored cell, no new room geometry |
| Boundaries | `wall`, `corner`, `door`, `door-open` | Only exposed cell edges; no wall through joined Stage cells; doors at existing transition points |
| People | `soldier`, `scout`, `technician`, `scientist`, `medic`, `diplomat`, `civilian`, `worker`, `guard` | Static overhead silhouette; muted profession-associated uniforms, unchanged UI colors |
| Gate | `gate`, `gate-open` | Closed ring or active blue center from existing connection state |
| Technical props | `console`, `generator`, `test-rig`, `terminal` | Public shape only; never depicts hidden Theory or item Reality |
| Other props | `crate`, `bed`, `evidence`, `medical`, `security` | Presentation category, no new interactable objects |
| Outdoor decoration | `rock`, `vegetation` | Available resource placeholders; not injected as new mission instances |
| Fallback | `unknown` | Explicit question-mark prop; neutral civilian for unknown people |

All 31 assets above are placeholders, not approved final art. Rock/vegetation and
security resources are available for future authored presentation; the renderer
does not invent decorative mission objects just to display every resource.
Stage archetypes map to floor types; explicit presentation-only overrides supply
outdoor art for Outer Yard and lab art for Analysis Lab. Prop and NPC category
lookup uses public labels/archetypes with conservative unknown-identity fallback.
Missing mappings use the unknown prop or civilian. An image load failure replaces
the resource once with the unknown asset; failure of that fallback leaves the
existing interactive overlays usable without a retry loop.

## Placement and visibility

Reuse `map-layout.mjs`: authored `mapPosition` first, deterministic reserved slots
otherwise, with door/label clearance. All original instance slots remain reserved
when occupants leave or concealed objects appear, keeping remaining positions
stable. Active Units use existing Stage/work slots. Sprite sizes do not introduce
tactical blocking or pathfinding. Compact props deliberately fit these existing
slots; oversized final art needs presentation review rather than runtime changes.

Existing Stage visibility, known footprint, revealed conditions, custody and
partial-visibility rules decide which sprites can exist in the player DOM.
Partial/known-shape rooms use neutral fog tiles rather than room-specific art.
The undercover operative and explicitly unknown identities use neutral art.
Physical Reality tags and institutional Theory are never used to choose artwork.
Designer data remains in its existing debug dialog, not the player world.

## States, effects and UI

Idle uses the base sprite. Down/dead uses a 90-degree rotation; inactive machinery
uses a small X overlay. Stationed Units use a gold ring; surrendered/captured NPCs
use a dashed gold ring; hostility uses the runtime NPC hostility helper and a red
ring. Active dialogue adds an attention dot to its actual NPC participants.
Suspicion/confrontation bars reuse `npcAlertSvg`. Combat tracers and damage text,
Profession observation rings, action hexes, door arrows/locks, loot status,
portraits, team cards, dialogue, timer and objectives remain SVG/HTML/CSS UI.
There is no separate selected-Unit runtime state, so no invented selection rule.
No character animation frames are required for this proof. Existing bounded combat
feedback remains; there is no sprite-loading animation loop or 3D rendering.

## Run and review

Run `node demos/serve.mjs`; open `/demos/offworld-sandbox/`, deploy and select
Sprites or Schematic in the map toolbar. This branch defaults to Sprites.

Run `node --test demos/offworld-sandbox/*.test.mjs` and
`node demos/offworld-sandbox/browser-smoke.mjs`. The browser smoke runs the real
mission through movement, dialogue, combat, Lab group search/characterization/
detachment and recovery using intercepted saves. It checks sprite image loading,
toggle/runtime parity and 390px overflow. It prints the temporary screenshot
directory, including `desktop.png`, `mobile.png`, `sprite-lab-desktop.png` and
`sprite-lab-mobile.png`. Final-art production follows visual approval; replacing
the placeholders should require manifest changes and visual QA only.

## Captured visual review

The checked-in working-copy review images show the same authored mission:

- [Analysis Lab desktop](sprite-review/lab-desktop.png)
- [Analysis Lab at 390px](sprite-review/lab-mobile.png)
- [Facility desktop](sprite-review/facility-desktop.png)
- [Gate at 390px](sprite-review/gate-mobile.png)

All current world images still need polished art after visual approval: the four
floor tiles, wall/corner/door set, nine character silhouettes, Gate states, nine
prop categories and optional rock/vegetation resources. Keep the same manifest
keys, footprint sizes and center pivots when replacing them. Animation libraries
and additional variants are deferred until this static presentation is approved.
