# Run all demos

From the repository root, use one command:

```bash
node demos/serve.mjs
```

Open `http://127.0.0.1:8001/demos/` and choose any demo. Keep the terminal
running; Ctrl+C stops it. No package installation or build step is required.
The demo hub detects whether shared JSON saves are available.

To use port 8000 instead, stop any Python/static server occupying that port:

```bash
node demos/serve.mjs 8000
```

Then open `http://127.0.0.1:8000/demos/`. All demos use the same server and
shared files. Choose one consistent hostname and port for browser-local data.

## What writable means

Configure character stats, base tier, cross-path/specialization and available
Tools in the Character & Portrait Editor. Base Profession remains the authored
roster identity. Save progression & Tools separately from stats and appearance.
Offworld deployment shows its radar charts directly on the cards and offers
only configured Tools in its two equipment dropdowns; charges are edited in the
character editor. The second slot still requires a qualified branch.

Personnel loadouts may include `availableTools: [{type: "SOT1", charges: 3}]`.
The existing `toolSlots` array records equipped selection. Legacy records derive
available choices from equipped Tools until explicitly configured in the editor.
This is character configuration, not a new physical inventory/custody system.

The server serves all demo assets and implements the existing validated save
endpoints for shared base configuration, personnel loadouts and portrait
presentation. Those saves update the working-copy JSON files. They do not
automatically commit, push or publish changes, and this does not add persistence
to every simulator control. Base saves enforce revisions and capacity; known
personnel saves remain validated. The server listens on loopback only.

`python -m http.server` is not the supported writable launcher: it serves files
but does not implement these save endpoints, so Confirm recovery cannot reserve
shared base capacity through it.

## GitLab Pages / static hosting

The browser demos remain static HTML/CSS/JavaScript and can still be published
on GitLab Pages with their shared assets and relative paths intact. Node is only
the local development/save server; it is not needed by the browser.

Pages does not execute this server or allow writing published repository JSON.
Browser-only persistence and exports continue where already implemented; shared
base saves and recovery confirmation requiring those saves need the local Node
server. Remote shared writes would require a separately hosted authenticated
backend; no backend or credentials are added here.

After local authored JSON edits, review and commit/push them through the normal
repository workflow to publish updated static fixtures.
## Offworld benchmark updates

The [Offworld guide](offworld-sandbox/README.md) documents automatic NPC openings,
response-based speaker selection, checkpoint evacuation alternatives and the
Analysis Lab Scientist/Technician handoff. Direct shared items preserve their
instance IDs and field findings in Receiving reservation payloads. Lab action
requirements are explicitly provisional benchmark content.
