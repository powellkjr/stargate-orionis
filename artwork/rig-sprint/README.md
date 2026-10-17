# Technician rig sprint review artifacts

October 9, 2026. None of these masters is approved; no rig is installed.
Checkpoint: [sprint status](../../docs/character-rig-sprint-status.md).

`candidate-review/originals/` holds byte-preserved copies of the three Downloads
references and first candidate ZIP. Copies are verified against original bytes
on rerun; different bytes at an existing destination are refused. SHA-256,
dimensions, transparency, alpha bounds, CRC and actual RGB membership are in
`candidate-review/inspection.json`. Shared JS modules supply the palette/pivots.

Overlay PNGs and the comparison sheet are **review diagrams**, with labels,
checkerboard and the locked template. They are not source masters. For 1254
inputs the whole canvas is scaled to 1024 for comparison. This does not fix
registration or satisfy source validation. `--native-pivot-overlay.png` companions
retain the original canvas size and unchanged source pixels, with template
points proportionally mapped from 1024; labels explicitly report native coordinates.
These are still diagnostic points, not approved source pivots for a 1254 rig.
No independent parts are cropped.

## Generated attempts

Both used built-in imagegen with transparent background requested. Unmodified
tool PNGs are preserved in the corresponding directories and in Codex's default
generated_images location; neither was cleaned, recolored, decomposed or installed.

| Attempt | Actual prompt | Input | Outcome |
| --- | --- | --- | --- |
| b001 | `stage-a-correction-prompt.txt` | preferred camera original as outfit/style reference | retained shoulder mismatch; wrong size and unrestricted palette |
| b002 | `stage-a-new-master-prompt.txt` | no reference | more crown, side case; missed shoulder/neck registration; wrong size and unrestricted palette |

Both artifacts are named `generated-master.png` for provenance, not an assertion
that they meet the master contract. Palette conversion should follow accepted
anatomy and reviewed material regions; nearest-palette mapping would not fix
these anatomical failures.

## Reproduce this review

Run from the repository root with Node, Python and Pillow available:

```bash
python artwork/rig-sprint/inspect-candidates.py \
  --extra artwork/rig-sprint/stage-a-correction-b001/generated-master.png \
  --extra artwork/rig-sprint/stage-a-new-master-b002/generated-master.png
```

The three external input filenames are documented in the handoff and read from
the user's Downloads directory. Generated candidates remain in the workspace.
The script rewrites only diagnostic outputs; it never alters source images.
Running without `--extra` creates just the original three-candidate inventory.
The older `stage-a-correction--pivot-overlay.png` is the same b001 diagnostic
created before multiple-attempt naming; current names are `stage-a-attempt-01`
and `stage-a-attempt-02`.
