---
name: split-sprite-sheet
description: Split a generated horizontal sheet of three isolated Stargate Orionis sprite variants into canonical transparent source PNGs and prepared runtime PNGs. Use when the user supplies a three-object image or wants to extract and prepare variants instead of asking the image generator to export individual files.
---

# Split and prepare three sprite variants

Use Git Bash only. Work from this repository root. Read REPO_MAP.md and the
production sprite contract before processing art. Do not edit live installed art,
reviews or unrelated rig-sprint work.

## Input and inspection

1. Get the actual downloaded single-frame PNG path, existing manifest asset key
   and a new batch name such as `orionis-console-b002`. Ask for missing input,
   rather than inventing a file or asset. Keep the original sheet untouched.
2. Inspect the image: exactly three complete variants in one horizontal row,
   left-to-right v01/v02/v03, with clear gutters and outer margins. No labels,
   contact-sheet frames, clipped subjects or fourth object. Disconnected parts
   belonging to one subject must remain in that subject's column.
3. Use only isolated whole sprites. Floors, Door/Gate state pairs, portraits and
   registered rig/head-kit parts are NOT supported by this splitter. Never split
   or recenter these using the ordinary workflow.
4. Transparent RGBA is preferred. For an actual solid backdrop, determine and
   explicitly specify its RGB hex color. Never guess white or automatically key
   out subject colors. Checkerboards/textures/gradients require manual cleanup.

## Run

```bash
command python.exe demos/offworld-sandbox/split-sprite-sheet.py \
  '/c/Users/Powel/Downloads/console-sheet.png' --asset console \
  --size 128x128 --padding 8 --batch orionis-console-b002
```

Replace key/path/batch with the actual inspected input. Optional flags:
Read runtime dimensions/padding from the manifest/contract: ordinary isolated
sprites use 128x128 with 8px padding; wall uses 128x12 with 0px padding. Supply
these explicitly so the Python script does not maintain a second asset catalog.
The custom script uses Python/Pillow only; Node is not required to process art.
`--background '#ffffff' --tolerance 5`. Removal affects only matching
border-connected pixels; enclosed backdrop holes and edge halos require review.
`--out <artwork-root>` can target an isolated temporary directory for tests.

The tool searches transparent cuts near the image thirds, refuses unsafe cuts or
edge-touching art, and refuses any batch already present in sources OR prepared.
It validates all three outputs before publishing. Do not bypass failure checks;
request a corrected sheet when spacing/clipping/background is unsuitable.

## Output and review

- `artwork/sprite-sources/<batch>/<key>__v01__source.png` (and v02/v03):
  centered transparent 1024x1024 masters with 64px padding.
- `artwork/sprite-prepared/<batch>/v01/<key>.png` (and v02/v03):
  centered runtime files using manifest dimensions/padding, prepared from the
  exact saved masters, preserving proportions.

Inspect all outputs at runtime size and enlarged. Check complete silhouettes,
no neighbor fragments/text, alpha/background, three distinct shape styles, and
material palette where applicable. The automated gutter check cannot establish
object count, semantic correctness or visual acceptance. Never claim otherwise.

Report actual paths, checks and limitations. Nothing is automatically installed.
Have the user refresh the Sprite Viewer, review variants and explicitly select
Install variant. Prepared variants have independent review/install identities.

## Generation shortcut

For compatible assets, ask the image chat for one PNG containing three distinctly
designed variants in evenly spaced horizontal columns, large transparent gutters,
transparent outer margins, fixed overhead camera/scale/palette and no text. The
local splitter handles extraction, canonical filenames and preparation; the image
chat need not produce a ZIP. Keep original technical/subject constraints from the
asset prompt. Do not use this shortcut for floors, paired states or rig layers.

## Validation

```bash
SPRITE_PYTHON=python.exe command node.exe --test demos/offworld-sandbox/split-sprite-sheet.test.mjs
```