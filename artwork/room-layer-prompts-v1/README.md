# Shared walls + Infirmary furniture trial

## Start a new image-generation chat

**Art-direction checkpoint:** the first registered corner attempt was too flat.
Use [CORNER-STYLE-STUDY-PROMPT.txt](CORNER-STYLE-STUDY-PROMPT.txt) with the original
illustrated reference to approve a chunky armored corner first. This deliberately
enlarged study overrides the old production-mask instructions for that image only;
it is not importable artwork. Its solid wall backing and broader corner armor
will require a revised structural mask before runtime adoption. Do not run the
remaining registered wall prompts until that fit is resolved. Existing source
coordinates and viewer masks have not been silently changed.

Paste [NEW-CHAT-HANDOFF.txt](NEW-CHAT-HANDOFF.txt) first. It is self-contained;
the image generator cannot read local project paths unless you attach the files.
Then attach both SVG guides and send one individual asset prompt at a time.
For an assembled style reference, use [INFIRMARY-REFERENCE-PROMPT.txt](INFIRMARY-REFERENCE-PROMPT.txt).
That reference is a finished-room illustration, not an importable asset or mask
authority. Attach approved v01 walls if available, then use the resulting image
as a style reference when generating the separate Infirmary furniture pieces.
The prompts request real PNG download links and do not claim that wording alone
can force a generator to perform exact pixel validation or file export.

Three reusable architectural families: v01 angular, v02 rounded, v03 utilitarian.
There are 12 shared-wall prompts (four pieces per family), followed by 12 separate
Infirmary furniture prompts. Generate one image per prompt. No empty CENTER or
EDGE_OPEN files are required for this trial: the renderer draws no layer there.

Every prompt starts AND ends with a mandatory clickable-download instruction
and the exact PNG filename. Require an actual attached PNG/download link from
the image generator, not just an inline preview or a filename written as text.

## Generate in this order

1. Start with shared-wall-corner__v01-prompt.txt. Attach both SVG guides and the
   architectural reference illustration. Approve its exact NW L and seam exits.
2. Generate that family's EDGE_NORMAL, SHARED and EDGE_DOOR with the approved
   corner attached. No room furnishings belong in ANY shared-wall image.
3. Repeat for v02/v03. These are architecture families, independent of room type
   and CT. Keep identical masks, channels and opening in all three.
4. Then generate the four infirmary-furniture prompts for one matching family.
   Attach its approved walls for scale/material reference, but generate furniture
   ONLY. Empty medical beds/cots and closed supply cases are the current subject.
5. Repeat furniture for the remaining families to compare their finishes.

The existing Material Storage leaf images can be used as an explicitly labeled
shared-door comparison in this preview; they are not evidence of a matching new
architectural finish. New door styles may need their own leaf art later.

## Preview and import

Open /demos/room-sandbox/room-kit.html and select **Shared walls + Infirmary**.
Use **Load shared walls** and **Load Infirmary furniture** independently. Each
import needs all four named pieces for at least one complete family. Pickers
validate architecture/furniture masks, not just overall alpha bounds. Family
selectors are independent so you can compare reuse; no per-piece mixing occurs.
Use the furniture visibility checkbox for wall-only review. Missing layers use
clearly labeled schematic placeholders, never generated/approved artwork.

All sources are full 1024-square RGBA, with pivot (512,512). Structure occupies
only the 12-unit wall bands, excluding the 5-unit channel and doorway. Furniture
uses the exact rectangles in layers.json; it cannot cover wall bands, seams or
door openings. See the guides; their colors/labels are not output artwork.

Layer order: floor → channel backing → shared structure → furniture → door
leaves / CT lights → guides and interaction controls. One cell remains one
physical child; no gameplay rooms, Services, capacity or save data changes.

This is a new presentation trial alongside the existing combined-room preview.
No existing downloaded originals, historical prompts or production art are replaced.
Clinical reach, circulation and furniture dimensions are illustrative; no medical
capability or canonical equipment is implied by the art.
