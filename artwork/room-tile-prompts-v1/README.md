# Room interior tile prompt queue

Upload each numbered prompt separately. Analysis is first. Each requests ONE opaque 3:1 image with three equal square tiles side by side, without gutters or labels. Existing furniture/geology prompts remain separate.

Split a downloaded Analysis sheet from Git Bash:

```bash
python demos/offworld-sandbox/split-sprite-sheet.py "path/to/sheet.png" --tiles --asset floor-room-analysis --size 128x128 --padding 0 --batch orionis-room-analysis-b001
```

For other rooms use the floor-room key in that prompt's filename and a new batch name. The tool saves three 1024px sources and three runtime previews under artwork/sprite-sources and artwork/sprite-prepared, preserves full tile edges, and refuses existing batches. Review camera and layout manually. These are presentation studies: room tile keys are not yet registered for installation or rendered by Room Sandbox. Integration must replace the corresponding baked furnishings to avoid drawing them twice. No authored room configuration changes.

Regenerate text into a fresh folder:

```bash
node demos/offworld-sandbox/prepare-sprite.mjs room-tile-prompts --out artwork/room-tile-prompts-v2
```
