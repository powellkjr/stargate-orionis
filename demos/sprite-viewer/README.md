# Sprite viewer

Check **Only sprites with no installed variant** to focus on sprite types still
needing art. It hides the entire group when any enabled, non-rejected variant is
installed. Fallback art and preview-only candidates do not count as installed.
The filter combines with search and updates after installation or rejection.

## Room furnishing overlays

Registered `floor-room-*` keys now appear in the gallery and saved candidate list.
Import the already-split source batch or prepared batch folder, not the original
three-cell sheet. Room overlays are transparent 128×128 runtime assets with no
sprite padding; source installation resizes the complete square frame without
cropping or recentering. Despite their historical filenames, these are furnishing
overlays, not opaque floor tiles. Ordinary sheet splitting is not supported for them.
Installing saves a validated variant pool; automatic simulator room-overlay layering
is not implemented yet. Existing floor/prop rendering remains unchanged.
After this server-side catalog update, restart the local demo server and hard-refresh
the viewer so discovery and installation use the new manifest.

On Windows, registry activation retries temporary EPERM/EACCES/EBUSY rename
failures for up to roughly 2.6 seconds. A persistent denial leaves the previous
registry intact and reports recovery steps; it never deletes the registry or
overwrites it in place. Close programs holding active-sprites.mjs, check security
software/folder permissions, and retry. Restart the server to load this fix.

For the purchased local Spriter pack, use the linked
[Character sheet preview](../character-sheet-preview/README.md) at
`/demos/character-sheet-preview/`: authored SCML animation playback, bones and
original transparent parts workbench. Its tab-local studies do not install sprites.

The **Technician color study · v01** above the gallery provides seven color
controls, original/recolored comparison, a 22-world-unit preview, **Show masks**
and **Reset colors**. It uses the supplied v01 source with conservative
source-specific masks, including separate harness and gear/boots controls.
Dark outlines and the chest display retain their colors. Controls
reuse shared portrait color field names where available. Trousers have a separate
study-only color. This first wave is a browser preview: no personnel save,
installation, head swaps or gameplay changes. Reopening resets the study.

New character generation requests use consistent material colors; find ready
prompts in `artwork/sprite-prompts-v4/` and matching front-facing portrait
requests in its `profiles/` folder. Upload the three overhead variants with the
portrait request so faces, hair, clothing and variant IDs match. Profile ZIPs
are a separate source-art delivery and are not accepted by this viewer/installer
yet. These updated prompts do not replace existing downloaded art or its masks.

Run `node demos/serve.mjs` from the repository root, then open
`http://127.0.0.1:8001/demos/sprite-viewer/` or use the demo hub.

All 50 shared manifest sprites appear immediately, including room-simulator
placeholders. Room Sandbox now uses these shared sprites by default. Use **Load ZIP files**
to select one or more archives directly. With the local server, **Save ZIP contents
to sprite-sources** is enabled by default: recognized PNGs are uploaded to your
loopback demo server and saved in `artwork/sprite-sources/<ZIP-name-without-extension>/`.
Saved sources load automatically when you reopen or refresh the viewer. Clear
imported variants clears the current view; it does not delete saved files.

Uncheck saving to preview only. Static hosting supports previews but cannot save
repository files. Any archive filename and partial batches are accepted for preview;
saved ZIP filenames must contain only letters, numbers, hyphens and underscores.
PNG filenames still need
to identify a known asset. Dimensions can differ; the viewer displays a warning.

You can also load candidates with **Load variants folder** or **Load PNG files**. Select `artwork/sprite-sources`
to compare all extracted batches in one view. Canonical names are
`<key>__v01__source.png` through `v03`, or `<key>.png` for prepared candidates.
Nested paths distinguish batches. Re-selecting the same path replaces its preview.
For bulk-prepared art, select the whole `artwork/sprite-prepared` folder, not an
individual `v01` folder or loose PNGs. The layout `<batch>/v01/<key>.png` identifies
an independent prepared variant. Files already saved under
`artwork/sprite-prepared/<batch>/vNN/` reload automatically with saved sources.
Install validates and copies the prepared PNG itself, preserving its exact bytes,
scale and centering. It does not re-prepare the original source. Browser-only
previews must be saved in that repository folder before they can be installed.
Assets with recent imports move to the top; their newest variants appear first,
followed by the current manifest image. Reloading a file updates its position.
Manual imports show browser-session load time. Saved sources initially load in
file modification order, newest first.
Unrecognized filenames are counted and ignored. If you want files extracted onto
disk, the existing strict production-batch command is still available:

```bash
node demos/offworld-sandbox/prepare-sprite.mjs unpack /c/Users/Powel/Downloads/orionis-floor-indoor-b001.zip
```

Search by asset key, switch checker/light/dark backgrounds, compare runtime pixel
size or world dimensions, and enable 3×3 floor repeats. Click an image to enlarge
it; Escape or Close dismisses the preview. Dimensions that differ from the contract
produce a warning but remain viewable for review.

## Rejecting and installing variants

Each imported candidate has **👎 Reject variant**. Rejected variants are hidden
by default. Enable **Show rejected variants** to inspect them and use **Restore
variant** to undo a rejection. Source PNGs are kept. With the local server, reviews
are saved in `artwork/sprite-sources/sprite-review.json`; the preparation command
refuses rejected saved sources. Reviews identify both batch and filename, so a
different batch's v01 is not rejected accidentally. Static-hosting reviews are
stored in that browser only and cannot constrain the local preparation tool.
Prepared variants have their own `sprite-prepared/<batch>/vNN/<key>.png` identity.
Reject/Restore is independent from the original source, even for the same batch
and variant. Existing source rejections stay attached to sources; prepared cards
are no longer marked rejected or installed merely because their source is.

To activate a keeper, click **Install variant** next to Reject. It is enabled for
saved, unrejected sources when the local installer is available.
Unavailable installation now has a visible explanation on the candidate card,
not just a disabled button tooltip.
Source installation converts to runtime size and validates it; prepared installation
validates existing runtime dimensions and copies unchanged bytes. Door/Gate installs include
both matching states from the same batch and variant, verify shared source frames
and validate both outputs. Prepared pairs must coexist in the same batch/variant
folder and pass runtime pair validation. Failures appear on the card and preserve current art.
Successful cards show **Installed** and update the latest-installed reference preview. All
enabled installed candidates show Installed, not only the latest one. Refresh the
Offworld or Room Sandbox simulator to load the updated variant pool.

Runtime PNGs are saved in versioned folders under
`demos/shared/sprites/offworld/production/`. A single atomic update to
`demos/shared/sprites/active-sprites.mjs` selects the validated outputs through the
shared manifest, retaining every installed candidate in its asset's variant pool.
Offworld picks variants independently by Unit/NPC/object identity when the map
loads, deploys or resets. Picks stay stable during movement/redraws; floors/walls
vary by Stage, and Door/Gate states stay matched to one batch/variant.
Source masters and prior installed versions are retained.
Installation uses the existing Python/Pillow preparation worker; missing Pillow
or invalid art is reported on the card. No automatic art regeneration occurs.
Rejecting a candidate excludes it from random selection on the next simulator
reload without deleting its PNG; Restore re-enables an already installed candidate.
Already open maps keep their choices until reload. The reference card shows the
latest installed image, not the only image the simulator can use.

Older installed PNGs can be recovered with
`node demos/offworld-sandbox/prepare-sprite.mjs variants-refresh`. It matches
their pixel content against deterministically prepared saved sources, retaining
source identity/rejection and ignoring unmatched files. No new sources are installed.

Active simulator art remains unchanged when sources are saved. ZIPs support stored or deflate compression; encrypted,
corrupt, duplicate-path and unsafe-path archives are rejected. Preview limits are
128 MiB/archive, 32 MiB/member, 192 MiB expanded total and 256 entries. No dependencies
are added. The local server's `/api/sprite-sources` lists saved sources (GET) and
saves supplied ZIP contents (POST). Recognized PNGs are checked before writing;
unknown members are ignored. Duplicate member basenames are rejected. Identical
reimports succeed without overwriting; an existing batch with different contents
is kept and produces an error. The original ZIP remains wherever you downloaded it.
Preview-only imports disappear on reload; saved source files persist on disk.
Installation requires preparation/validation and an explicit manifest update. The viewer checks
PNG signatures and dimensions, but does not certify alpha, state-pair registration or seam quality;
use the [production tool and contract](../offworld-sandbox/SPRITE_PRODUCTION_CONTRACT.md)
before installing anything. Restart `node demos/serve.mjs` after updating its code.

If the save checkbox is disabled, the message beside it explains the missing
connection. An older running server needs a restart: press Ctrl+C in its terminal,
then run `node demos/serve.mjs` with the same port (for example
`node demos/serve.mjs 8000`). Refresh the viewer or click **Check source saving again**.
A failure to reload one saved preview does not disable an available save service.

Checks:

```bash
node --test demos/sprite-viewer/*.test.mjs demos/serve.test.mjs
node demos/sprite-viewer/browser-smoke.mjs
```
