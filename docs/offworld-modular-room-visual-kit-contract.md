# Modular room visual-kit art contract — provisional v1

October 13, 2026. User authorized correcting CT arithmetic and choosing dimensions/registration for a first pass, with later visual tuning allowed. This working contract supersedes the conflicting numbers in the [preserved original handoff](offworld-modular-room-visual-kit-handoff-v2.md). The [plan](offworld-modular-room-visual-kit-plan.md) tracks remaining adoption work.

Implemented now: reusable six-piece prompt templates, base-room kit catalog, export command, expected source metadata and a measured SVG guide. Renderer composition, preparation profiles, ZIP ingestion, deterministic Stage-wide family selection and Offworld archetype mappings remain pending. No final images, gameplay data or installed assets change.

## CT patterns

| Tier | Pattern runs, alternating wall-color / tier-color | Total | Colored coverage |
| --- | --- | --- | --- |
| CT1 amber | 8 / 8 / 8 | 24 | 8 |
| CT2 blue | 4 / 6 / 4 / 6 / 4 | 24 | 12 |
| CT3 purple | 4 / 16 / 4 | 24 | 16 |

CT2 has two balanced blue openings; CT3 has one wider purple opening. The colors are underlay presentation, not wall recolors or gameplay modifiers. All tiers use identical geometry.

The 5×24 running-slot treatment is provisionally interpreted as a continuous 5-unit-thick transparent channel revealing a repeating 24-unit underlay. The repeat period is independent of module width. A future renderer tracks pattern phase along each perimeter loop rather than restarting it at every module; a 128-unit side is not divisible by 24. Where a door interrupts the wall, clip the channel/underlay away from the opening and resume the accumulated phase on surviving wall. Close-loop phase discontinuity may need a quiet seam at a door or a documented starting vertex; do not distort the specified pattern to hide it. This repeat interpretation and loop seam are provisional presentation choices to review during assembly.

## Exact registration

The user's subsequent CT1/CT2/CT3 reference illustration clarifies the material/form target: pale neutral corner armor, dark graphite inset wall panels, chunky seams and restrained bevels. Its one short amber, two blue and one long purple opening agrees with the corrected pattern proportions. It is a visual reference, not source art or a geometry authority: retain transparency for the slot, common tier geometry, direct-overhead camera and restrained shading. The pictured OPEN wall-end is closest to SHARED; it does not replace the clear EDGE_OPEN cell join. Illustrated 1×1/1×2/2×2 examples do not bind room size to CT. Floors/grates, labels, glow and perspective are not baked into these modules. The reference currently lives in chat; attach it again when generating art in a separate session if needed.

One logical cell is 128×128 design units. Origin is northwest; x runs east, y south. Both axes split at 32 and 96, giving 32/64/32 bands. Each module uses a full **1024×1024 RGBA source frame**, 8 source pixels per design unit. Planned normalized frame is **128×128 RGBA**, one pixel per unit, without alpha-bound cropping, centering or padding. A cell may display at the existing 100 SVG units by uniform scaling; 128 is texture registration, not a gameplay grid change.

All modules rotate around the full-cell pivot **(64,64)**, source **(512,512)**. Quarter turns transform both occupied slot and content; never rotate about visible content bounds. Only the listed rectangle may contain visible pixels. Right/bottom endpoints are exclusive.

| Piece | Canonical rectangle [x,y,width,height] | Source rectangle | Orientation |
| --- | --- | --- | --- |
| CENTER | [32,32,64,64] | [256,256,512,512] | North up |
| CORNER | [0,0,32,32] | [0,0,256,256] | Northwest; north and west perimeter |
| SHARED | [0,0,32,32] | [0,0,256,256] | Northwest; north perimeter, west open |
| EDGE_NORMAL | [32,0,64,32] | [256,0,512,256] | North |
| EDGE_DOOR | [32,0,64,32] | [256,0,512,256] | North |
| EDGE_OPEN | [32,0,64,32] | [256,0,512,256] | North |

Rotate CORNER four times and EDGE four times around the cell pivot, plus CENTER, to fill a cell without overlapping slot interiors. Module source files remain square full frames; the rectangles are placement bounds, not cropped file sizes.

North wall depth is 12 units (y=0..12); channel is y=4..9, source y=32..72. West wall is its transpose. CORNER has both runs and their L-shaped channel. SHARED has one run and no wall on the open side. SHARED may be diagonally reflected `(x,y) -> (y,x)` before rotation to cover both handed arrangements; art must tolerate this. No preemptive left/right asset pairs. The neutral cross-section at every surviving perimeter seam is wall depth 12, channel offset 4, thickness 5; furnishings stay at least 2 units away from module seams.

North doorway is x=48..80, y=0..32: a **32-unit / 256-source-pixel** clear opening centered on the edge. Keep it alpha 0 through the entire edge band; no furniture, leaf, overhead bridge, threshold or shadow. EDGE_DOOR owns static frame sides, matching EDGE_NORMAL's wall cross-section. Future runtime door art owns only the leaf/state detail so frames are not duplicated. Existing framed Door/Open sprites must not be composited unchanged into this opening.

All modules are transparent overlays; a separate continuous base floor supplies coverage underneath. In v1 CENTER and EDGE_OPEN are entirely empty RGBA masters, made deterministically with Pillow rather than requested from image generation. This avoids inventing central machinery or arbitrary seam-blocking detail. An open/open corner draws nothing and leaves the base floor visible. Architecture appears only on exterior boundaries; repeated centers never become miniature complete rooms. Cultural Platform keeps its 2×2 open center and existing subject exclusions.

## Prompt export and coordinated families

Authoritative prompt/metadata source: `demos/shared/sprites/room-kit-prompts.mjs`. It supports all 19 existing base-room catalog types. Initial example queue: `artwork/room-kit-prompts-v1/` (Receiving and Material Storage, 36 prompts plus metadata/guide/README). This is a catalog selection, not a claim that all requests are missing art or should be regenerated now.

```bash
node demos/offworld-sandbox/prepare-sprite.mjs room-kit-prompts --kit receiving --kit material-storage --out artwork/room-kit-prompts-next
```

Repeat `--kit` for other hyphenated base-room IDs; omit it to export the full base-room catalog. Output directory is required; existing prompt files are protected from overwrite. Legacy `room-tile-prompts` and `outstanding-prompts` continue producing full-room overlays compatible with currently installed keys. Modules must not be substituted into `floor-room-*` assets. Offworld archetype mapping/subjects need separate reconciliation, especially open-air Gate areas and older hallway no-wall wording.

Each kit has v01 angular, v02 rounded and v03 utilitarian families. Six templates are parameterized by kit, role and family. Generate/review CORNER first, then reuse the guide and approved same-family source references for other pieces. Camera, dimensions, pivot, openings, wall cross-section and seam sockets are invariant. Family differences affect fixed furnishing forms and restrained surface detail, never geometry or hidden facts.

Exported `room-kits.json` has a `geometry` record and a `kits` array. Each kit has `kitId`, `subject`, and `variants`; each variant maps all six piece names to expected source filenames. A complete kit has 18 unique source paths. This is source registration metadata, not an active sprite manifest or proof that files exist. All six pieces of the selected family must be eligible together before future rendering; no per-piece variant mixing.

Archive: `orionis-room-kit-<kit-id>-bNNN.zip`, matching root folder, exactly 18 PNGs named `<kit-id>-<piece>__vNN__source.png`. Pieces use center, corner, shared, edge-normal, edge-door and edge-open; variants v01/v02/v03. Include deterministic empty CENTER/EDGE_OPEN members. Keep guide, metadata, prompts and previews outside the ZIP. Increment batch numbers and preserve originals. The existing ordinary three-variant ZIP installer does not yet support this family packaging.

## Remaining work

Add registered preparation and family-aware ingestion, pure topology-to-module selection, exact Transition cell-edge binding, SVG layer composition and persisted family selection. Test 1×1 door combinations, 1×2 and 2×2 joins, SHARED handedness, fog, no central posts, complete-family stability and CT slot registration. Review generated art in assembled previews before approval. Existing gameplay semantics, physical room identities and Core Set ownership remain authoritative.
