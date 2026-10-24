# Material Storage door leaves — first prompt queue

Generate the three numbered CLOSED leaf prompts individually. Attach each prompt's matching EDGE_DOOR and CORNER source PNGs from `artwork/room-kit-studies/material-storage/b001/`. Do not use a different family's frame.

Also attach [registration-guide.svg](registration-guide.svg). It preserves the
full 1024-square source coordinates: green marks the passage in the fixed frame;
orange marks the CLOSED leaves in a separate overlay. The diagram superimposes
these layers only to explain their registration. **Never fill the frame's clear
passage when generating EDGE_DOOR, and never copy guide colors, labels or grid.**
For a closed-leaf prompt, output only the two orange-region halves with the
neutral material finish from the attached family references; everything outside
that region is transparent. Both states retain the full-cell pivot (512,512).

The three prompts request:

- `material-storage-door-leaf-closed__v01__source.png`
- `material-storage-door-leaf-closed__v02__source.png`
- `material-storage-door-leaf-closed__v03__source.png`

Full source canvas: 1024×1024 RGBA. Allowed closed-leaf bounds: x=384..640, y=0..96 (exclusive endpoints). No image cropping. Canonical north opening remains x=384..640, y=0..256. The thinner leaf depth is a provisional visual fit to the existing 12-unit wall; review in all four rotations before production acceptance.

OPEN requires no generation: leaves retract out of sight behind the existing frame, so the viewer uses a transparent baseline. Optional explicit open files must be empty 1024×1024 RGBA PNGs named `material-storage-door-leaf-open__vNN__source.png`. Do not request these empty images from a generator.

## Test in the viewer

1. Open `http://127.0.0.1:8001/demos/room-sandbox/room-kit.html`.
2. Use **Load door leaf artwork** to select the generated closed PNGs together (one family is enough to start; other families retain a labeled schematic placeholder).
3. Choose the matching **Family**, then click **Doors: open** to switch to **Doors: closed**.
4. Check the 1×1, 1×2/2×1 and 2×2 layouts. Rotate layouts; try every outer door edge. Switch families to check matching.
5. Open state must leave the passage fully clear. Closed state adds only the moving leaves, with no duplicated frame, lights, offset or art on joined internal edges.

Files load locally for the current page session; refresh discards file selections. No active sprite installation or door gameplay is added. If artwork is missing, the viewer explicitly labels its schematic closed-leaf placeholder.

