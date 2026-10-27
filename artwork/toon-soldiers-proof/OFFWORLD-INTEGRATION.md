# Offworld character and motion integration

The main game reuses the six approved profession outfits and the Worker, Guard
and Captain presets from `profession-picks.json`. Guard parts are provisional;
the user permits mixing compatible heads/bodies. The independent Art Lab scene
and playback are not changed by main-game integration.

Selected clips are recorded in `offworld-motion-picks.json`: Idle/Walk plus Talk,
Work (gathering study), LowReach (handwork study), Fire and Down. Conversation,
active field work, combat and incapacitation choose presentation states from
existing gameplay; they do not spend time or charges. Work/treatment use existing
motion studies, not finished bespoke scanner/console/treatment/carrying clips.
Weapon props appear for the rifle-fire pose and disappear for other actions.
Death/Down holds its final pose; other selected clips loop. Root motion and
animation events are disabled. Animation never invents a gameplay result.

The fixed character camera is **orthographic, pitched downward 60 degrees**
(`Quaternion.Euler(60,180,0)` in `OffworldCharacterPool`). Characters render into
transparent 96x128 point-filtered textures on the flat 2D map. This is not a
perspective tilt applied to the map. The main URP renderer remains 2D; character
cameras use an additional Forward renderer on a dedicated layer.

The main map has persistent per-session zoom/pan, Team/ Fit controls and a
known-area minimap with a viewport frame; clicking/dragging the minimap relocates
the main view without gameplay movement. Unit markers are 0.2 tile across,
half the previous 0.4. Full interaction text stays readable in the sidebar;
door hexes remain spatial shortcuts. NPCs/objects use authored mapPosition and
recognized visibility, with hover/click labels rather than overlapping captions.

`offworld-import-manifest.json` records 63 selected original asset/meta hashes.
Vendor content and generated character resources remain local/ignored. Stage
from a locally acquired Art Lab installation in Git Bash:

```bash
node unity/tools/offworld-characters.mjs
node unity/tools/offworld-characters.mjs --check
```

With main-game Play stopped, use **Orionis > Art > Rebuild offworld characters
and motions**. Restart Play after rebuilding. On a new machine, acquire the
corresponding Toon Soldiers/Human animation packages first. Static markers remain
a fallback when generated resources are absent. No vendor scripts are retained.
The native spine proxy follows the existing Art Lab rig setup. Inactive render
rigs are released after use; pooled motion survives rebuilt UI canvases.

Evidence: main-project `Logs/offworld-detail-*` includes compile, nine profiles /
seven clips, 0.2 tile sizing, visible minimap mesh and labels, authored NPCs,
Holding controls, conversations and saved loot identities. Four focused domain /
real-backup checks pass, plus the specific Holding panel regression. Earlier
`offworld-walk-check.json` records actual move-hex Walk/deformation with exactly
one committed tick. Office dialogue variants, checkpoint effects and lab group
search/additional loot still need gameplay adapters; this visual integration is
not a claim of full scenario parity.
