# World Map Simulator v1

## Status

**Design specification / implementation handoff.**

This document defines a standalone simulator for evaluating the strategic Stargate world map. It is not a production-game rules rewrite and it is not an economy, mission, Haven-base, or faction-AI simulator.

The simulator exists to select and validate a stable seeded galaxy geometry, evaluate routing, and test the player-facing map interface against that geometry.

## Scope

The simulator must support:

1. Reproducible generation of candidate 3D Stargate-network geometries.
2. God View visualization of the complete hidden network.
3. SGC View visualization of player-known information only.
4. Source-dependent route and reachability analysis.
5. Hop-limit analysis and recommendation.
6. Batch comparison of Geometry Seeds.
7. Failure testing for routing infrastructure.
8. Campaign randomization over one fixed Geometry Seed.
9. Lightweight Haven, faction, and threat data for map evaluation.
10. A three-panel world-map UI prototype.

The simulator must not implement trade, resource production, combat, diplomacy simulation, detailed threat expansion, mission generation, or final glyph artwork.

## Governing Design Principle

An address identifies an intended endpoint. It does not guarantee that every other Gate can establish a usable route to that endpoint.

```text
Address        -> intended endpoint
Geometry       -> physical relationship
Routing graph  -> possible paths
Hop limit      -> usable paths
Origin         -> dialing source
Campaign state -> player knowledge and strategic context
```

## Seed Separation

### Geometry Seed

The Geometry Seed deterministically generates the permanent underlying galaxy/network:

- major and minor network layout;
- minor-network orientation, scale, packing, capacity, and thickness;
- logical lattice positions;
- physical XYZ positions;
- hidden routing nodes and links;
- boundary reservations and Edge Pairs;
- Gate endpoint positions and addresses;
- Point-of-Origin identifiers.

The same Geometry Seed and the same generation parameters must produce the same serialized geometry. If generation parameters are changed, the parameter set is part of the geometry identity and must be recorded with the seed.

### Campaign Seed

The Campaign Seed generates mutable state over an already-generated geometry:

- SGC starting Gate;
- Haven locations and factions;
- initial known addresses and spatial knowledge;
- starting faction patterns;
- infected/threat zones;
- other campaign-specific metadata.

Campaign generation must never move, resize, or regenerate the fixed geometry. It may only select and annotate valid geometry objects.

## Simulator-Only Address Convention

For v1, a normal same-galaxy logical destination address contains six fields followed by a local Point-of-Origin glyph during dialing:

```text
LogicalAddress      = Q q Z r R $
VisibleDestination  = G1 G2 G3 G4 G5 G6
DialingSequence     = G1 G2 G3 G4 G5 G6 O
```

`O` identifies the Gate initiating the dial and is not part of the destination address.

The six positions have provisional semantics:

```text
Q = major planar Q component
q = minor planar q component
Z = vertical/depth component
r = minor planar r component
R = major planar R component
$ = endpoint/validation component
```

Derived cube coordinates are:

```text
S = -(Q + R)
s = -(q + r)
```

The visible destination glyphs are a reversible encoding of the complete logical address. A glyph is not a direct visual representation of one coordinate value. The six destination glyph IDs must always be distinct. The local Origin glyph is separate and belongs to the originating Gate.

This address grammar is a simulator convention, not a replacement for the production document's human-readable examples such as `P3X-65`. The implementation must keep the logical address, visible glyph encoding, and display label separate so a later production-format adapter is possible.

Provisional ranges:

```text
Major radius: 3                 -> 37 valid major cells
Minor radius: 3                 -> 37 minor cells per major region
Z: -5 through +5               -> 11 normal values
$: 0 through 15                -> 16 provisional values
```

The resulting structural space is `37 × 37 × 11 × 16 = 240,944` possible endpoint combinations. This is an address space, not a Gate count. Most combinations may have no endpoint, an inactive endpoint, or no known physical placement.

## Unique Glyph Address Encoding

The address pipeline is:

```text
Logical Address
Q q Z r R $
        ↓
Canonical logical address index
        ↓
Permutation rank
        ↓
Six unique destination glyph IDs
```

The shared destination alphabet is configurable and defaults to 24 glyph IDs. The destination sequence length is six. Its capacity is:

```text
24P6 = 96,909,120
```

This exceeds the default 240,944 logical address indices, so uniqueness does not reduce the current structural address space. Every valid logical address must map deterministically to one ordered six-glyph permutation, and decoding must reconstruct the original logical address.

The codec must provide stable valid-cell enumeration, canonical index packing/unpacking, partial-permutation rank/unrank, capacity validation, and round-trip validation. A reversible scrambler may be added later; direct canonical-index-to-permutation mapping is acceptable for v1.

The DHD uses the shared destination vocabulary plus one separate local Point-of-Origin glyph. It does not need to expose the meanings of `Q`, `q`, `Z`, `r`, `R`, and `$` as separate visual button categories.

## Coordinate and Geometry Model

The logical lattice uses stacked hex coordinates:

```text
(q, r, s, z), where q + r + s = 0
```

Each lattice node has six planar candidate neighbors and two vertical candidate neighbors. A candidate neighbor is not automatically an active routing link.

Major and minor coordinates are combined provisionally with scale factor `7`:

```text
GlobalQ = 7Q + q
GlobalR = 7R + r
GlobalS = 7S + s
GlobalZ = Z
```

The scale factor is configurable. It must not be used as a substitute for routing topology.

Each minor network is a roughly disc-shaped 3D cluster with independent parameters:

- orientation (`Tilt`, `TiltAxis` or equivalent rotation representation);
- physical/local scale or node spacing;
- useful Gate capacity;
- disc thickness;
- deterministic seeded displacement.

“Tall” means a strongly tilted disc, not a vertical column. Physical positions are rendered positions; logical positions remain the authority for lattice structure.

## Boundary Reservations and Edge Pairs

Minor positions near shared borders between neighboring major cells have one of these states:

```text
NORMAL
BOUNDARY_RESERVED
EDGE_NODE
```

`BOUNDARY_RESERVED` prevents ordinary Gate generation but may contain hidden routing infrastructure.

For each neighboring major-cell pair, generate approximately one or two `EdgePair` objects. An Edge Pair contains two major-side Edge Nodes and their cross-boundary routing connection.

Edge Pair state is mutable campaign/infrastructure state, not geometry identity:

```text
active | inactive | damaged | blocked | infected | restored
```

V1 only needs active/inactive behavior, but the data model should not prevent the later states.

## Required Data Separation

The implementation must keep these as separate concepts and records:

```text
DestinationAddress
LogicalPosition
PhysicalPosition
RoutingNode
RoutingEdge
GateEndpoint
Haven
FactionAssignment
PlayerKnowledge
ThreatZone
```

A GateEndpoint is a dialable endpoint attached to a RoutingNode. A hidden RoutingNode or EdgeNode may participate in paths without being a dialable Gate. A Haven occupies or references a GateEndpoint; it is not the Gate itself.

## Routing Contract

V1 routing edges are **undirected by default**. Source-dependent reachability does not require directed edges:

- a route may exceed the current hop limit from one source but not another;
- disabled nodes or Edge Pairs may separate regions;
- endpoint activation state may differ;
- physical link constraints may prevent candidate links;
- different sources may belong to different connected components.

The simulator must not silently treat every valid active address as reachable from every source.

Directed or source-specific link rules are deferred until a concrete requirement demonstrates that an undirected graph cannot represent the desired behavior.

The route resolver must distinguish at least:

```text
disconnected topology
no usable Edge Pair
physical link-distance constraint
hop limit exceeded
disabled routing infrastructure
endpoint inactive
```

For a selected source and destination, report reachability, shortest route, hop count, physical route length where useful, major networks crossed, Edge Pairs crossed, and failure reason.

## Hop-Limit Analysis

For a generated Geometry Seed, analyze a configurable range of hop limits, initially `4` through `20`.

For every candidate limit, report:

- endpoint reachability percentage from representative sources;
- mutual reachability percentage;
- connected component count;
- largest component;
- isolated endpoints;
- average and maximum shortest-path hops;
- destinations requiring staging;
- major-network accessibility;
- Edge Pair utilization;
- critical routing nodes and Edge Pairs.

Return diagnostic guidance:

```text
recommended hop limit
recommended range, if useful
trade-offs at nearby limits
```

The recommendation must not be hard-coded as a final game rule. It is seed-and-parameter analysis intended to help select a canonical geometry.

## Geometry Evaluation and Batch Testing

Headless batch analysis must support many Geometry Seeds, including runs such as 1,000 candidates. Each result should be sortable/filterable by:

- connectivity and component count;
- recommended hop limit;
- average and maximum route length;
- regional isolation;
- critical-node and critical-Edge-Pair count;
- failure resilience;
- Edge Pair dependence.

The initial simulator reports metrics rather than applying final pass/fail thresholds. Thresholds are a later design decision.

## Failure Testing

The simulator must allow interactive and automated disabling of:

- Gate endpoints;
- hidden routing nodes;
- Edge Nodes;
- Edge Pairs.

After every failure, recalculate routes, reachability, visual overlays, and statistics. Automated tests should include random 1% and 5% routing-node failures, one Edge Pair failure, and one critical-node failure.

## God View and SGC View

### God View

God View may expose all generated truth:

- Gates, addresses, origins, and positions;
- major/minor networks and discs;
- hidden routing nodes and edges;
- Edge Nodes and Edge Pairs;
- factions, Havens, and threats;
- actual routes and failure causes.

### SGC View

SGC View exposes only campaign knowledge. A known address may lack a known physical position. `Show Me` is unavailable until the campaign has enough spatial correlation to place the destination.

Hidden routing topology must not leak into SGC View merely because it exists in the generated Geometry object.

## Map UI Prototype

The UI uses three primary panels:

```text
+----------------+---------------------------+----------------+
| Dialing Table  | Galactic / Network Map    | Details        |
+----------------+---------------------------+----------------+
```

The Dialing Table lists known addresses, supports hover cross-highlighting, and should use generated glyphs when practical. Debug coordinate text may be shown in development mode.

The map supports true 3D rotation, top/side projections, selection, hover, layer toggles, and debug overlays.

The Details panel displays information for the selected Gate, Haven, network, Edge Pair, threat zone, faction, or other map object.

At minimum, layer infrastructure must support Havens, factions, threats, known Gate locations, hidden-routing debug geometry, and major/minor network geometry. Layers should have visibility, filtering, ordering/priority, and legends where practical.

## Campaign Fixtures

V1 may generate approximately 100 lightweight Havens per Campaign Seed:

```text
Scions:       40
CLP:          25
Moy'na:       15
Independent:  20
```

These are placement fixtures, not economy simulation. A Haven may contain:

```text
HavenID
GateID
Faction
Scale
Name
KnowledgeState
```

Faction distributions should be visually characteristic rather than territorially contiguous:

- CLP: address-space hubs and nearby successful-address satellites;
- Scions: chains, branches, and Ancient-site concentrations;
- Moy'na: fewer, larger Havens with suitability-constrained irregularity;
- Independent: scattered and not precommitted to future faction alignment.

Generate three to six configurable infected/threat zones. Use an obvious red treatment. God View may show threatened hidden infrastructure; SGC View shows only known threat information.

Campaign validation must confirm:

- SGC starts at a usable Gate;
- SGC reaches a reasonable portion of the network;
- all three major factions appear in reachable campaign space;
- Independents occupy useful positions;
- infection does not automatically invalidate the start;
- Haven placement does not exceed available useful Gate endpoints;
- required campaign populations are not wholly stranded.

Exact numerical thresholds remain provisional and must be reported as warnings rather than invented silently.

## Debug Overlays and Controls

Recommended independent overlays:

```text
logical lattice; major boundaries; minor discs; disc normals;
disc thickness; capacity candidates; physical nodes;
hidden routing nodes; candidate links; active links;
boundary reservations; Edge Nodes; Edge Pairs; Gate endpoints;
addresses; Z=0 plane; reachability; shortest route;
factions; Havens; threats; SGC knowledge
```

Recommended controls:

```text
Geometry Seed / Generate / Randomize
Campaign Seed / Generate / Randomize
Major radius, minor radius, major scale, Z range, $ range
Tilt, scale, capacity, packing, thickness distributions
Hidden-node density, link-distance limit, Edge Pairs per boundary
Current hop limit / Analyze hop limits
God View / SGC View
3D / top / side projection
Layer toggles
Failure test
Batch seed analysis
```

## Required Analysis Output

### Geometry

```text
Geometry Seed
Total major networks
Total minor networks
Total routing nodes
Total Gate endpoints
Total Edge Pairs
Connected components
Largest connected component
Average shortest-path hops
Maximum shortest-path hops
Reachability percentage
Regionally constrained endpoints
Isolated endpoints
Critical routing nodes
Critical Edge Pairs
Recommended hop limit/range
```

### Campaign

```text
Campaign Seed
SGC Gate
Starting Havens by faction
Reachable Havens from SGC
Initially unreachable Havens
Faction reachability
Independent Haven count
Threat-zone count
Threatened Havens
Threatened Edge Pairs, when known
PASS / FAIL
Validation warnings
```

## Conflict Resolutions

### Production address examples

The production document uses display examples such as `P3X-65`; this simulator uses a generated positional address grammar for geometry experiments. They are separate presentation/encoding layers. No production lore is changed by this document.

### Physical proximity versus routing

Physical distance influences candidate-link validation and route-length reporting, but does not itself create adjacency. Logical topology, active routing state, and physical constraints remain separate.

### Source asymmetry

V1 models source-dependent reachability through an undirected graph, route length, hop limits, endpoint state, and failures. Do not add directed edges or arbitrary source permissions without an authored requirement.

### “Strategic value”

Do not assign arbitrary strategic scores to nodes. Strategic importance should emerge from topology, chokepoints, route dependence, Haven placement, and failures.

### Glyphs

V1 may use deterministic placeholder procedural glyphs. Final artwork, lore, and derivation of the Point-of-Origin glyph from destination glyphs are deferred.

### Campaign thresholds

The specification requires validation and reporting but does not yet establish exact thresholds for “reasonable access,” “meaningful isolation,” or “resilience.” Implementers must expose warnings and metrics rather than inventing canonical pass/fail rules.

## Haven Strategic Data Supplement

The [Havens, Population, Resources & Trade supplement](havens-population-resources-trade.md)
extends v1 with P1/P4/P16 ration-support capacity, separate sentient population,
representative resource profiles, and population/resource/trade map layers. These
are Campaign Seed data. Its limited strategic metadata supersedes the earlier
abstract Haven-scale placeholder; inventories, hourly trade execution, full economy,
and Haven base generation remain outside this simulator.

## Visible Address Encoding Update

The [unique glyph address encoding update](unique-glyph-address-encoding.md) separates
logical `Q q Z r R $` from six distinct shared destination glyph IDs. A canonical
valid-hex address index maps reversibly to an ordered partial permutation. Origin
remains separate and belongs to the source Gate. Logical coordinates and routing
are unchanged; visible glyph positions no longer individually represent coordinates.

## Success Criteria

The simulator is successful when it can answer:

1. Whether stacked hexes and tilted discs produce believable 3D structure.
2. Whether source-dependent routing emerges without arbitrary accessibility scores.
3. Whether nearby-looking addresses can require different routes.
4. Whether Edge Pairs create meaningful major-network topology.
5. Whether some destinations are naturally regional or directionally constrained.
6. Which hop limits preserve navigation without making topology irrelevant.
7. Whether a candidate Geometry Seed is resilient enough for a campaign.
8. Whether infrastructure failures create interesting rather than always-catastrophic changes.
9. Whether the three-panel map is understandable.
10. Whether SGC View hides topology without becoming confusing.
11. Whether faction patterns remain readable without territorial borders.
12. Whether a small number of red threat zones are immediately legible.
13. Whether Campaign Seeds vary starts over one fixed galaxy.
14. Whether the generated glyph system reads as one coherent network.

---

# World Map Simulator Supplement: Havens, Population, Resources & Trade

The simulator does not run the full economy yet. It generates representative Haven population, capacity, resource, and trade metadata so the world-map UI and campaign distribution can be evaluated.

## Starting Haven Distribution

Campaign generation creates approximately 100 starting Havens over the fixed Geometry Seed:

| Faction | Havens |
| --- | ---: |
| Scions | 40 |
| CLP | 25 |
| Moy'na | 15 |
| Independent | 20 |
| **Total** | **100** |

The full campaign may later reveal additional Havens, but Simulator v1 only needs this starting distribution.

## Haven Scale and Occupancy

Haven scale uses:

```text
P1 = 1,000,000 adult-equivalent daily ration capacity
P4 = 4,000,000 adult-equivalent daily ration capacity
P16 = 16,000,000 adult-equivalent daily ration capacity
```

P-scale is sustainable resident ration-support capacity. It is not a direct measure of physical settlement size, cultural importance, political importance, technology, military power, visitor throughput, or literal sentient headcount.

Each Haven has seeded occupancy:

```text
RationDemand = RationCapacity × Occupancy
```

Many Havens should have substantial unused capacity; the generator must not make every Haven nearly full.

Sentient population and ration demand remain separate fields:

```text
SentientPopulation
RationCapacity
RationDemand
Occupancy
```

For baseline humans, one adult human is approximately one effective ration/day. This is not universal across biological forms.

## Provisional Moy'na Biological Equivalents

```text
Human:                 1 sentient ≈ 1.0 effective ration/day
Mature unbonded Moy'na: 1 sentient ≈ 0.75 effective long-term ration/day
Bonded host + Moy'na:   2 sentients ≈ 1.25 effective rations/day combined
```

A bonded host and Moy'na remain two sentient individuals. The combined ration value is not a population count.

## Faction Haven Scale Tendencies

These are generation targets, not immutable future rules.

### Moy'na

Moy'na should generally have fewer, larger Havens with significant unused capacity. Nest age/history influences capacity, and expansion may progress from P1 to P4 to P16. A provisional starting tendency for 15 Havens is:

```text
P1:  3
P4:  7
P16: 5
```

Only a few should begin close to capacity. The number of active nests changes relatively rarely and is not simulated in v1.

### CLP

For 25 starting CLP Havens:

```text
P1:  16
P4:   6
P16:  3
```

CLP has many P1 Havens because affiliated economic networks can incorporate existing local populations rather than requiring purpose-built settlements.

### Scions

For 40 starting Scion Havens:

```text
P1:   5
P4:  31
P16:  4
```

Scions disproportionately occupy or restore significant Ancient/Ancestor sites. Their P4 Havens may have substantial inherited infrastructure and relatively low occupancy. Historical great-city loss and rediscovery are deferred.

### Independent

For 20 starting Independent Havens:

```text
P1:  12
P4:   6
P16:  2
```

Independent means politically unaffiliated, not a shared culture, species, technology level, or civilization type.

## Population Sanity Checks

The provisional scale distribution implies approximately 460 million adult-equivalent daily ration capacity across the starting network. Actual sentient population should usually be lower because many Havens are below full occupancy. A prior paper-test range of approximately 243–246 million sentients is a sanity-check target, not a hard requirement.

Campaign diagnostics should report:

```text
Total Ration Capacity
Total Ration Demand
Total Sentient Population
Overall Occupancy
```

## Representative Resources

Every Haven conceptually participates in:

```text
Food
Supply
Material
```

Material may additionally expose representative quality:

```text
M1 | M2 | M3
```

V1 does not simulate inventories or detailed production chains. It generates `Production`/`Demand`-compatible resource states for UI testing:

```text
deficit | stable | surplus
```

The map may present these as:

```text
↓ deficit
→ stable
↑ surplus
```

If all three resources are stable, expose a golden balance indicator. If all three are surplus, expose a golden surplus indicator. Exact iconography is provisional.

## Faction Economic Tendencies

Faction affiliation influences representative resource profiles:

- **Moy'na:** Food specialization and disproportionate Food surplus.
- **CLP:** Material specialization, including representative M1/M2/M3 capability.
- **Scions:** Supply specialization through inherited extraction/processing infrastructure.
- **Independent:** varied profiles without a universal specialization.

Environmental consequences, full production, and detailed resource chains are out of scope.

## Trade Boundary

All Havens use the same trade system. Do not implement invisible faction-wide pooling. Resources conceptually move Haven-to-Haven through the Stargate network.

The preserved architectural rules are:

- each Haven can make one trade per hour;
- trade uses normal cargo conversion and receiving-capacity rules;
- Gate connectivity matters;
- unreachable Havens do not participate in an invisible global market;
- faction membership does not teleport resources;
- local production and demand remain meaningful;
- prices may later correlate with local production/demand ratios.

Simulator v1 stores the one-trade-per-hour rule and may display representative trade/resource relationships, but does not advance hourly trades.

Ordinary Stargate trade is not assumed to make every Haven self-sufficient. Civilization-scale logistics may later require Incursion or equivalent high-throughput infrastructure.

## Routing and Trade Compatibility

The data model must remain compatible with topology-dependent logistics. A Haven that is poorly connected, near the hop limit, dependent on an Edge Pair, reachable only through staging, or temporarily cut off should be able to receive different future logistics treatment from a highly connected Haven.

V1 does not calculate the economic consequence; it only preserves the route and Haven relationships required by a later economy simulator.

## Defense and Rooms

Do not add generic authoritative `MilitaryStrength` or `Offense` fields. Haven military capability is eventually derived from installed Rooms, Cores, and defensive infrastructure around the Gate complex. For v1, Defense may be omitted or represented only by a clearly provisional UI placeholder.

Havens eventually use the same Rooms and Cores available to the player. Cultural identity comes from layout, skins, installed technology, and potentially Cultural Platforms/Cores. Simulator v1 does not generate Haven bases.

## Haven Data Contract

A v1 Haven record should support:

```text
HavenID
GateID
Name
Faction
Scale                 // P1, P4, P16
RationCapacity
Occupancy
RationDemand
SentientPopulation
PopulationCohorts     // optional representative data
FoodState             // deficit, stable, surplus
SupplyState           // deficit, stable, surplus
MaterialState         // deficit, stable, surplus
MaterialQuality       // optional M1/M2/M3
KnowledgeState
```

The implementation must not treat these fields as the final economy model.

## Haven Details and Map Layers

Selecting a known Haven should be able to show its faction, scale, population, ration capacity, occupancy, resource states, material capability, Gate status, and route information where known.

Haven metadata must support these map layers:

```text
Havens
Factions
Population
Population Scale
Capacity Scale
Resources
Trade
Threat
```

Population Scale must make larger sentient populations render as larger filled Haven dots. The maximum population dot is capped at the P16 population reference and uses the same radius as the P16 capacity ring. Capacity Scale must preserve the P1/P4/P16 capacity-ring sizes and use a visibly thicker translucent backing ring. The white arc around a capacity ring represents percentage full/occupancy. These are independent toggles and must not replace faction fill or routing-state rings. If both are enabled, the population dot and capacity ring are rendered independently; do not collapse them into one maximum radius. Resource layers may filter Food, Supply, and Material deficits/surpluses. Faction affiliation remains independent of physical territory. Trade may initially show representative resource relationships and reachability rather than cargo flows. Threat remains an obvious red overlay.

## Simulator Boundary

The World Map Simulator must answer:

> Can population, capacity, specialization, trade dependency, faction distribution, threat, and Gate connectivity be represented clearly on the strategic map?

It does not answer:

> Does the final hourly inter-Haven economy mathematically balance?

Generate representative strategic data now, preserve the future architectural boundaries, and defer the full economy/trade simulation to a dedicated simulator.
