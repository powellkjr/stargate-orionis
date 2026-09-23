# World Map Simulator v1

Standalone strategic-map development instrument, using the existing demos’ dark
three-panel layout and plain browser modules. No install, build step, external
assets, or changes to the room simulators and shared game catalogs are required.

## Run

From the repository root:

```text
python -m http.server 8000
```

Open `http://localhost:8000/demos/world-map-simulator/` in a modern browser.
Serve over HTTP; ES modules and the analysis worker cannot run from `file://`.

1. Generate a **Geometry seed** and inspect its diagnostics. Generation settings
   are provisional and validated before generation. A seed plus the same settings
   reproduces the same geometry. **Lock geometry controls** prevents accidental
   regeneration while rerolling campaigns; it does not declare a canonical seed.
2. Drag the map to rotate it in 3D, scroll to zoom, or select Top / Side. **Fit
   galaxy** resets the camera. Enable individual debug layers to inspect discs,
   logical positions, nodes, boundaries, candidate links, and active routing links.
3. Choose an Origin Gate and inspect a destination from the dialing table or map.
   **Show me** centers a spatially correlated Gate. Table and map hover highlight
   one another. Gold Origin glyphs belong to the source, after six unique encoded
   destination glyphs. Debug address text follows logical `Q q Z r R $`; Origin is
   separate. Visible destination glyphs are not direct coordinate-value glyphs.
4. Move the live hop slider. The route panel distinguishes a disabled endpoint,
   disabled infrastructure, an inactive Edge Pair, a physical-distance constraint,
   and a hop-limit failure. Combined causes are reported as disconnected topology
   when no single relaxation restores a path. The highlighted shortest path can
   exceed the current dialing limit; its status explicitly says so.
5. Select a Gate, routing node, or Edge Pair and disable/restore it. Hidden routing
   nodes are selectable with their layer enabled; pair markers sit at bridge
   midpoints. Automated 1% / 5% node, one pair, and one critical node tests replace
   the failure overlay. **Restore all** clears failures, preserving the geometry’s
   originally inactive pairs. Disabling a Gate disables its dialable endpoint,
   independently of its routing node. Disable that node to cut transit as well.
6. Reroll the **Campaign seed** independently. Diagnostics report all faction
   counts, reachable Havens, threats, and placement validation. Switch to **SGC
   View** to test only known address records, correlated locations, and independently
   known Haven/faction/threat information. Debug controls, routes, and truth
   statistics disappear. An uncorrelated address has no usable Show me button.
7. Export a complete JSON snapshot or run a batch and export its sortable results.
   Snapshot export is a debugging artifact containing hidden truth. There is no
   persistence or snapshot-import UI; retain the seed and config to reproduce it.

Faction filtering and independent layer visibility are supported. Rendering order
is currently fixed: background geometry, routing, route highlight, Gate markers,
Havens and threat indicators. Faction identity uses marker fill colors, while
reachability uses an independent ring. `requires staging` is orange and dashed;
Moy'na remains purple, so the two states cannot be confused. Legends explain
both semantic channels.
Threats use red rings/halos. No territorial borders are assigned to factions.

Campaign Havens also carry representative P1/P4/P16 capacity, occupancy, sentient
population, Food/Supply/Material states, material quality, and one-trade-per-hour
metadata. This is UI test data only; hourly economy execution is not implemented.

## Headless seed testing

```text
node demos/world-map-simulator/batch.mjs --count 1000 --prefix candidate --out candidates.json
node demos/world-map-simulator/batch.mjs --count 10 --prefix candidate --sort recommendedHop --min-connectivity 0.9 --out shortlist.json
```

Optional `--config path.json` accepts a JSON object of generation settings, matching
`DEFAULTS` in `model.mjs`. `--no-failures` skips four resilience experiments per seed.
Results sort by any numeric summary key, including `connectivity`, `components`,
`recommendedHop`, `averageHops`, `maximumHops`, `chokepoints`, `regionalIsolation`,
`pairDependence`, and `resilience`. Connectivity/resilience sort descending; others
ascending. Progress goes to stderr. The browser batch runs in a separate worker,
supports cancellation, filtering, sorting, and selecting a candidate to regenerate.
Large runs deliberately perform real routing analysis and may take several minutes.

## Model and diagnostic definitions

- `model.mjs`: seeded geometry, routing, diagnostics, campaign placement, player
  projection, and glyph integration; works in browser and Node.
- `address-codec.mjs`: deterministic logical-address indexing and reversible unique
  six-glyph destination encoding. The default vocabulary has 24 shared glyph IDs.
- `app.mjs`, `index.html`, `style.css`: three-panel interface and Canvas 3D camera.
- `worker.mjs`: off-main-thread generation, analysis, and browser batches.
- `batch.mjs`: reusable seed evaluation and headless CLI.
- `model.test.mjs`: deterministic geometry, lattice, knowledge, routing, staging,
  campaign, failure, and batch regression checks.

Address, logical position, physical position, node, edge, Gate, Haven, threat,
faction, and knowledge records remain separate. Failure overlays use independent
sets of node, Gate, and Edge Pair IDs and do not mutate seeded geometry.

Analysis uses exact breadth-first shortest routes from **every active Gate**,
not a source sample. Hops count routing edges, not intermediate dialable Gates.
Average/maximum distances exclude disconnected pairs and self-pairs. Connectivity
is the fraction of unordered active Gate pairs connected without a hop limit.
Components count active routing nodes, including components without Gates; both
node and Gate component metrics are shown. Isolated Gates have no other active
Gate in their topology component. At each hop, locally isolated Gates have no
other Gate within that limit. Critical nodes are graph articulation points; a
critical Edge Pair contains a graph bridge. These include hidden infrastructure,
so they are diagnostics rather than arbitrary strategic-value scores.

The hop sweep is 4–80. The recommendation is the first limit covering **90% of
already connected Gate pairs**, not 90% of the entire galaxy. This is a tunable
analysis heuristic (`analyze` options), not a final game threshold. No recommendation
is returned if the target is not met within the sweep. In the default geometry
`orionis-1`, the baseline is 446 Gates, 5,825 nodes, one component, and a recommended
43 hops. Values change with generation settings.

The sweep’s over-limit pair count means connected destinations beyond one dial’s
hop limit. It does **not** guarantee that staging is possible. Selected-source
reachability separately traverses a graph of usable Gate-to-Gate dials: every
staging stop must be an active Gate and every leg must satisfy the hop limit.
Disabling that intermediate Gate can remove staging without cutting hidden transit.
There are no directed edges in v1; A→B and B→A are symmetric at a fixed limit,
while C→B can differ because C is a different source.

Batch resilience is the lowest remaining largest-Gate-component fraction across
four seeded failure experiments, measured against the baseline total Gate count.
Pair dependence is the drop in that fraction after the sampled pair failure.
The exported per-experiment records retain counts and connectivity for inspection.
This is not an exhaustive worst-case failure search. Regional isolation in batch
summaries is the connected over-limit pair count at the recommended hop limit
(or 20 if none), rather than a territorial score.

## Provisional generation choices and remaining design questions

The brief leaves the probability distributions and campaign thresholds open. The
following are explicit simulator assumptions, not canonical game content:

- One independently oriented minor disc per major hex cell. Radius 3 gives 37 of
  each. Each disc uses uniform seeded tilt, axis, physical scale, and capacity
  distributions. Adding multiple minor networks within one major needs a clearer
  address-to-network assignment rule.
- Normal nodes occupy a three-layer band around a tilt-derived logical Z center,
  clipped to the addressable range. Density adds optional outer-band routing nodes;
  it does not delete the backbone. Physical points use a rotated round hex disc,
  local scale, thickness, and small seeded displacement. Logical and rendered
  positions are therefore distinct. Changing tilt affects both logical Z routing
  structure and physical disc orientation.
- Neighbor-facing minor hex boundaries are reserved. A boundary has one pair or
  a seeded choice of one/two pairs. Pair sides use reserved vertical corridors;
  larger major-scale gaps add hidden lattice-step corridors. Only explicit pair
  links cross majors. Candidate adjacency is always one of the eight stacked-hex
  directions. Distance limits and pair state determine which candidates are active.
- Capacity requests approximately `10 × capacity factor` useful Gates per region,
  capped by normal center-band candidates. There is currently at most one Gate
  per spatial address cell. `$` is a seeded endpoint discriminator in its configured
  range, never a lore checksum. Multiple endpoints in a cell remain possible in
  the address grammar but are not generated in this first placement model.
- Origin IDs include the geometry seed and Gate ID. Procedural SVG glyphs are
  placeholders with a continuous connected spine and asymmetric anchor, independent
  of Milky Way artwork. IDs produce unique branch patterns; final visual-distance,
  equal-complexity, and aesthetic quality constraints are deferred.
- Campaigns choose a start reaching at least eight Gates at the current hop limit.
  All Haven placements stay in its topology component, and each faction gets a
  directly reachable first placement when possible. Requested counts are 40 Scions,
  25 CLP, 15 Moy’na, and 20 Independent. Capacity shortfalls or stranded starts
  return visible FAIL/warnings rather than invented Gates or silent success.
- CLP uses address-distance hub/satellite placement. Scions follow a branching
  address-neighbor walk with periodic gaps and a higher placeholder Ancient-site
  association. Moy’na uses irregular placements and larger carrying capacities; biological
  suitability has no authored world dataset yet. Independents have no future
  allegiance. These are visual distribution experiments, not faction AI or discovery
  simulation. Haven scales measure ration-support capacity, not population counts.
- Initial address, spatial, Haven, faction and threat knowledge are separate seeded
  flags. No discovered routing records are seeded in v1, so SGC View makes no
  claims about hidden reachability. This is presentation separation in a developer
  instrument, not client-side data security.
- Threats attach to Gates (default 4, configurable from 0–20), exclude the SGC, and
  never propagate or block routes. Campaign diagnostics count threatened Havens.
  Threatened Edge Pair semantics, detailed suitability, Ancient-site distribution,
  and infection effects require later rules. All economies, missions, combat,
  diplomacy, Haven rooms and faction AI remain out of scope.

## Checks

```text
node --test demos/world-map-simulator/model.test.mjs
node --test demos/world-map-simulator/address-codec.test.mjs
node --test demos/world-map-simulator/model.test.mjs demos/world-map-simulator/havens.test.mjs demos/room-staffing-demo/receiving.test.mjs demos/room-staffing-demo/process-transfers.test.mjs
```

## Unique destination glyph encoding

`address-codec.mjs` implements the [encoding update](../../docs/world-map/unique-glyph-address-encoding.md).
Logical `Q q Z r R $` and visible glyph IDs are separate. Major/minor cells enumerate
only valid hex positions, ascending q then r. The canonical index packs major,
minor, Z, and endpoint indices in that order. Direct partial-permutation unranking
turns it into six distinct IDs; ranking and unpacking recover the exact address.
No hash or scrambling is applied. Common prefixes across addresses are expected;
glyph repetition within an address is impossible. Unassigned permutations reject
on decode rather than wrapping into the logical domain.

The shared alphabet defaults to 24 (`24P6 = 96,909,120`), and is configurable under
Generation settings → **Shared destination glyphs**, or with `destinationGlyphCount`
in codec/generation options. Six positions are fixed for normal destinations. V1
accepts alphabets up to 64 and rejects inadequate capacity or unsafe numeric ranges.
Encoding depends on the configured address ranges and alphabet, not a campaign seed.
Keep that configuration with saved visible addresses; changing it changes encoding.

Generation validates six unique glyphs, global uniqueness among Gates, and every
round trip, before returning its result. Exports retain logical `address` and derived
`addressGlyphIds`. Changing the alphabet preserves logical addresses, endpoint `$`,
Origins, physical positions, and routing. Rendering uses the generated configuration
in both God and SGC views. The DHD vocabulary panel shows all shared glyphs plus the
selected source's local Origin; it is a vocabulary preview, not a new dialing engine.

`address-codec.test.mjs` exhaustively checks all 240,944 default logical addresses
for collisions, six-glyph distinctness, determinism, and exact decode round trips.
It also checks invalid hexes/IDs, unassigned permutations, capacity guards, other
alphabets and ranges, and unchanged geometry when switching alphabets. Reversible
scrambling is deferred, as allowed by the update; there are no unresolved encoding
rules for the current normal six-glyph format.

## Havens, population, resources and potential trade

Implements the [strategic-data supplement](../../docs/world-map/havens-population-resources-trade.md)
in `havens.mjs`, with regressions in `havens.test.mjs`. Campaign metadata uses its own
seeded stream, leaving geometry, Gate placements, and existing campaign placements
unchanged. Exported campaign snapshots include the enriched records and summary.

Enable **Show Haven Population Scale** to make larger sentient populations use larger
filled dots, including differences below one million sentients. Dot radius is
`3.5 + 2 × sqrt(population / 1,000,000)` pixels; these dots remain visible even when
the generic Gate locations layer is off. Enable **Show Haven Capacity Scale** to draw the existing P1/P4/P16
capacity rings; the white arc around each ring shows its percentage full. If both are
enabled, the population dot and capacity ring are rendered independently. These
symbols represent sustainable ration capacity and representative sentient population,
never physical settlement footprint or military strength. **Resource balance** filters
the map by
Food/Supply/Material and deficit/stable/surplus. Unknown profiles are excluded from
resource filters. Arrows show local states, with gold markers for all-stable or
all-surplus Havens. Select a Haven to see population, ration capacity and demand,
occupancy, resources, material quality, and Gate status in Details.

Enable **Potential trade** and select a Haven as the trade origin. Complementary
surplus/deficit Havens appear as possible partners, independently of faction.
Dashed cyan lines connect directly reachable partners in God View; the list retains
blocked or over-limit partners and their failure reasons. Changing hops or disabling
infrastructure recalculates availability. A line establishes routing availability
only: cargo conversion, receiving capacity, pricing, scheduling and throughput are
not implemented. The common one-trade-per-Haven-per-hour rule is retained as metadata.
No imports are applied, no resource pooling occurs, and no deficit is balanced away.
Staged transport is not assumed to be a direct trade route.

SGC knowledge separately gates population/capacity and resource/material data, in
addition to the existing Haven and faction flags. Population cohorts and nest history
remain God View diagnostics. SGC trade previews use only known complementary resource
profiles and label routing availability unknown; they never query hidden routing.

Provisional generation choices, rather than additional biological or economy rules:

- P1/P4/P16 capacity is exactly 1/4/16 million adult-equivalent rations per day.
  Scion, CLP and Independent initial scale bags use the supplement's respective
  5/31/4, 16/6/3 and 12/6/2 counts, randomly assigned to their Havens.
- Moy’na nests have a uniform relative-age index. Its lower 20% produce P1, next
  46.7% P4, and upper 33.3% P16: expected counts 3/7/5, not a fixed quota. No real
  dates, nest creation, or capacity-growth ticks are invented. A 35% recently-expanded
  sample starts at 20–40% occupancy. Other nests normally occupy 35–65%; a 12% chance
  in that group samples 85–95%. These history flags are static paper-test metadata.
- Occupancy samples are 20–60% for Scions, 45–85% for CLP, and 25–85% for Independents.
  Human baseline is used for Scion/CLP samples. Moy’na samples allocate 40–75% of
  ration load to bonded pairs, 5–15% to mature unbonded Moy’na, and the rest to humans.
  Half the Independent samples instead use varied mixed cohorts (5–30% bonded-load
  share and 5–15% unbonded). These are representative population mixes, not faction
  species definitions or mandatory biology for politically Independent Havens.
- Cohort headcounts are integers. A bonded pair counts as two sentients at 1.25
  rations; an unbonded Moy’na as one at .75; a human as one at 1. Cohort sizes are
  rounded before deriving ration demand and occupancy, so the accounting reconciles.
- A faction's favored resource has a 70% surplus / 18% stable / 12% deficit sample;
  other resources use 30% / 35% / 35%. Independents use the latter for all three.
  Material quality M1/M2/M3 weights are 20/50/30 for CLP and 65/30/5 elsewhere.
  These directly generated states do not imply stockpiles or numeric production rates.
- The four population totals and faction scale counts are displayed in God View
  and exported under campaign validation. The ~460 million capacity and ~243–246
  million population references are comparisons, not rejection thresholds. Default
  `campaign-1` has 496 million capacity, 221,117,643 ration demand, 244,111,566 sentients,
  and 44.58% weighted occupancy. Its Moy’na count is 3/4/8, illustrating variation.

The supplement supplies biological ration equivalents but leaves actual demographic
mixes, age distributions, resource probabilities, cargo conversion and receiving
rules open. The first four are explicit UI-testing samples above; the last two
remain deferred. No Defense/Offense/MilitaryStrength values, Haven-specific rooms,
economic balancing, or dynamic population systems were introduced.
