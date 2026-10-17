# Gate b003 regeneration

User requested regeneration rather than alignment of old art, then explicitly
corrected the camera: retain stairs, standing Gate, north-up steep tactical
view and a less exposed recessed portal. User accepted the corrected v01
camera with “much better!”; v02/v03 follow it. This direction supersedes the
older production contract's flat overhead-ring appearance for this batch.

Art generated using the built-in imagegen tool. Final prompts are in `prompts/`;
the selected raw generated pair sheets are in `generated-sheets/`.
Earlier rejected camera experiments were not applied to prepared or active art.

`prepare-generated-pairs.py` extracts the generated cells, removes low-alpha
generation speckle, registers the energy donor to the closed master, prepares
256×256 canvases and locks the closed master frame/stairs for both states.
Only the enclosed transparent aperture receives generated energy. This is
batch-specific asset preparation, not a change to validator requirements.
`preparation-report.json` records bounds, energy coverage and pixel equality.

Final pairs are in `validated-candidates/v01` through `v03` and copied to
`artwork/sprite-prepared/orionis-gate-b003/vNN/`. Each of the six runtime PNGs
passed the existing CLI validator with its companion; every originally occupied
frame/stair pixel is exactly identical between the two final states.
All canvases are RGBA 256×256 with more than the required 16px transparent border.

Original prepared files are preserved byte-for-byte under
`original-prepared-backup/vNN/`. Downloaded sources and installed art/registry
were not changed. Refresh the viewer and use Install variant to activate a pair.
