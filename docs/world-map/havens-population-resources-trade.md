# World Map Simulator Supplement: Havens, Population, Resources & Trade

Append this to the existing World Map Simulator v1 specification.

The simulator does **not** need to run the full economy yet, but it should generate enough Haven population, capacity, resource, and trade data to test the world-map UI and campaign distribution.

---

# 1. Starting Haven Distribution

Generate approximately **100 starting Havens** from the Campaign Seed:

| Faction     |  Havens |
| ----------- | ------: |
| Scions      |      40 |
| CLP         |      25 |
| Moy'na      |      15 |
| Independent |      20 |
| **Total**   | **100** |

These are Campaign Seed placements over the fixed Geometry Seed.

The full campaign may eventually reveal additional previously unknown/recovered Havens, potentially bringing the known total toward roughly 120, while other Havens may also be lost.

Simulator v1 only needs the starting distribution.

---

# 2. Haven Scale

Havens use three population-support classes:

```text
P1
P4
P16
```

These represent **sustainable resident ration-support capacity**, not literal population.

## P1

```text
1,000,000 adult-equivalent daily ration capacity
```

## P4

```text
4,000,000 adult-equivalent daily ration capacity
```

## P16

```text
16,000,000 adult-equivalent daily ration capacity
```

Therefore:

```text
P-scale = sustainable resident ration-supported carrying capacity
```

P-scale does **not** directly measure:

* physical settlement size;
* cultural significance;
* political importance;
* technological importance;
* military power;
* visitor throughput;
* actual sentient headcount.

A physically enormous or culturally important location can still be P1 if its sustainable resident support capacity is low.

---

# 3. Occupancy

Each Haven has an occupancy value.

For basic capacity calculations:

```text
ResidentRationDemand = RationCapacity × Occupancy
```

Example:

```text
Haven Scale: P4
Capacity: 4,000,000
Occupancy: 60%

Resident ration demand:
2,400,000 adult-equivalent rations/day
```

For Simulator v1, occupancy can be generated from the Campaign Seed rather than dynamically simulated.

Avoid making every Haven nearly full. Many Havens should have substantial unused capacity.

---

# 4. Sentient Population Is Separate From Ration Demand

Do not assume:

```text
Population = Capacity × Occupancy
```

Population counts **sentient individuals**.

Capacity/occupancy measures **adult-equivalent ration demand**.

Different biological forms can have different ration requirements.

Maintain these as conceptually separate values:

```text
SentientPopulation
RationCapacity
RationDemand
Occupancy
```

For baseline humans:

```text
1 adult human ≈ 1 effective ration/day
```

Therefore human-heavy Havens will often have population and ration-demand numbers that are similar, but this is not a universal rule.

---

# 5. Moy'na Population/Ration Rules

Use the following provisional biological equivalents when representative population data is needed.

## Human

```text
1 sentient individual
≈ 1.0 effective ration/day
```

## Mature Unbonded Moy'na

```text
1 sentient individual
≈ 0.75 effective long-term ration/day
```

Mature unbonded Moy'na are poor independent feeders and can gorge/hibernate, so this is a long-term effective load rather than necessarily daily feeding behavior.

## Bonded Host + Moy'na

```text
2 sentient individuals
≈ 1.25 effective rations/day combined
```

The host remains one person and the Moy'na is another person.

Do not count a bonded pair as one person.

---

# 6. Moy'na Haven Generation

Moy'na should generally have:

* fewer Havens;
* larger Havens;
* significant unused capacity;
* scale strongly influenced by nest age/history;
* expansion from P1 to P4 to P16 over time.

Do **not** force a permanent fixed P1/P4/P16 quota on Moy'na.

For initial simulator generation, a reasonable paper-test distribution is approximately:

```text
P1:  3
P4:  7
P16: 5
```

for the 15 starting Moy'na Havens.

Treat this as a generation target/tendency rather than an immutable rule.

Nest age should influence capacity.

A recently expanded nest may have substantial headroom.

Only a few Moy'na Havens should begin close to capacity.

The number of active Moy'na nests changes relatively rarely and should eventually be meaningful when it does.

---

# 7. CLP Haven Scale Tendency

For the 25 starting CLP Havens, use approximately:

```text
P1:  16
P4:   6
P16:  3
```

CLP should have many P1 Havens because it readily incorporates existing local/indigenous populations into its economic network rather than requiring every affiliated Haven to be a purpose-built CLP settlement.

The three P16 Havens are good candidates for major CLP population centers and eventual important faction locations.

---

# 8. Scion Haven Scale Tendency

For the 40 starting Scion Havens, use approximately:

```text
P1:   5
P4:  31
P16:  4
```

Scions disproportionately occupy/restore significant Ancient/Ancestor sites, producing many P4 locations.

They should generally have relatively low occupancy compared with their inherited capacity.

A large Ancient complex may have enormous infrastructure while supporting relatively few current inhabitants.

The four starting P16 Scion Havens can represent surviving/restored great Ancient cities.

There may historically have been approximately eight such great cities, with others lost, unknown, or rediscovered during the campaign. Simulator v1 does not need to implement that campaign progression.

---

# 9. Independent Haven Scale Tendency

For the 20 starting Independent Havens, use approximately:

```text
P1:  12
P4:   6
P16:  2
```

Independent means politically unaffiliated.

It does **not** mean a common culture, species, technology level, or civilization type.

Independent Havens should therefore have substantial variation.

---

# 10. Approximate Starting Civilization Scale

Using the provisional faction/scale distributions above, the starting network has roughly:

```text
460 million adult-equivalent daily ration capacity
```

Actual sentient population should be substantially lower because many Havens are below full occupancy.

Previous paper testing placed starting sentient population roughly in the:

```text
~243–246 million
```

range.

Treat this as a useful sanity-check target, not a hard requirement.

The simulator should report:

```text
Total Ration Capacity
Total Ration Demand
Total Sentient Population
Overall Occupancy
```

so generated campaigns can be compared against this rough target.

---

# 11. Core Strategic Resources

Every Haven eventually participates in the same three-resource economy:

```text
Food
Supply
Material
```

Material additionally has quality tiers:

```text
M1
M2
M3
```

Simulator v1 does **not** need to simulate inventories or detailed production chains.

It should, however, generate representative production/demand relationships for the map UI.

---

# 12. Haven Resource Balance

Each Haven conceptually has:

```text
Production
Demand
```

for each major resource.

Underlying relationship:

```text
BalanceRatio = LocalProduction / LocalDemand
```

The player-facing map should eventually simplify this to:

```text
↓  deficit
→  stable
↑  surplus
```

for each resource.

For Simulator v1, these states can be generated directly rather than derived from a full economy.

Example:

```text
Food      ↑
Supply    ↓
Material  →
```

This is enough to test the map/details UI.

---

# 13. Special Resource-Balance Indicators

If all three resources are approximately balanced:

```text
Food      →
Supply    →
Material  →
```

the Haven can display a special **golden balance indicator**.

If all three are in surplus:

```text
Food      ↑
Supply    ↑
Material  ↑
```

the Haven can display a special **golden surplus/up indicator**.

Exact final iconography is not required for the simulator.

---

# 14. Faction Economic Tendencies

Faction affiliation should influence generated resource profiles.

## Moy'na

Primary tendency:

```text
FOOD
```

Moy'na expertise and settlement selection make them the network's strongest food producers.

Their Havens should disproportionately generate Food surpluses.

## CLP

Primary tendency:

```text
MATERIAL
```

CLP should disproportionately generate Material surpluses, including access to higher-quality M1/M2/M3 material.

## Scions

Primary tendency:

```text
SUPPLY
```

Scions use inherited Ancestor extraction/processing infrastructure that can produce large amounts of Supply.

Their methods may be environmentally destructive or unconcerned with long-term ecological consequences, but Simulator v1 does not need to model those consequences.

## Independents

No universal specialization.

Generate varied resource profiles based on individual Haven characteristics.

---

# 15. Trade System Rules to Preserve

All Havens use the **same trade system**.

Do not implement invisible faction-wide resource pooling.

Resources physically move between Havens through the Stargate network.

Current core rule:

```text
Each Haven can make 1 trade per hour.
```

Trade uses normal cargo conversion and receiving-capacity rules.

The detailed math is deliberately outside World Map Simulator v1.

For now, preserve these architectural assumptions:

* trade occurs Haven-to-Haven;
* Gate connectivity matters;
* unreachable Havens cannot simply participate in an invisible global market;
* faction membership does not teleport resources;
* local production and local demand remain meaningful;
* trade prices eventually correlate with local production/demand ratios.

The simulator may display representative trade/resource relationships without actually advancing hourly trades.

---

# 16. Trade Is Not Intended to Solve Everything

Normal Stargate trade should **not** provide enough throughput to make every Haven perfectly self-sufficient through imports.

That limitation is intentional.

As the campaign progresses, civilization-scale logistics eventually require **Incursion** or equivalent high-throughput infrastructure.

Therefore do not design the placeholder resource generation around an assumption that ordinary trade automatically balances every deficit.

Some Havens should remain structurally dependent, vulnerable, or specialized.

---

# 17. Relationship Between Routing and Trade

Even though detailed trade simulation is out of scope, the World Map Simulator should preserve the fact that network topology affects trade.

A Haven that is:

* poorly connected;
* near the hop limit;
* dependent on a specific Edge Pair;
* only reachable through another region;
* temporarily cut off;

should eventually experience different logistics than a highly connected Haven.

Simulator v1 does not need to calculate the economic consequence.

It only needs to keep the data model compatible with that future behavior.

---

# 18. Haven Defense Note

Do not create a generic strategic:

```text
MilitaryStrength
```

or:

```text
Offense
```

value for Havens.

Haven strategic military capability is primarily **Defense**, derived later from actual installed Rooms, Cores, and defensive infrastructure around the Gate complex.

Inter-Gate warfare is not conventional planetary army movement.

Offensive actions generally involve small SGC-like teams moving through Gates.

For Simulator v1, Haven Defense may be omitted or represented by a temporary placeholder if needed for UI testing.

Do not treat that placeholder as authoritative game-state architecture.

---

# 19. Haven Room/Core Note

There is no special Haven-only base architecture.

Havens eventually use the **same Rooms and Cores available to the player**.

Faction/cultural identity primarily comes from:

* layout;
* skins;
* installed technology;
* potentially Cultural Platforms/Cores.

A possible future **Cultural Platform** is a 2x2 structure analogous to the Tech Platform and can hold culturally specific structures such as a Scion temple.

If a cultural structure provides substantial mechanical functionality, that functionality should generally become a Tech Platform/Core rather than hiding gameplay systems inside a cosmetic cultural object.

Simulator v1 does not need to generate Haven bases.

---

# 20. Suggested Haven Simulator Data

A Haven record for World Map Simulator v1 should contain enough information for strategic-map testing.

Conceptually:

```text
Haven
{
    HavenID
    GateID

    Name
    Faction

    Scale              // P1, P4, P16

    RationCapacity
    Occupancy
    RationDemand

    SentientPopulation

    FoodState          // deficit, stable, surplus
    SupplyState        // deficit, stable, surplus
    MaterialState      // deficit, stable, surplus

    MaterialQuality    // optional representative M1/M2/M3 capability

    KnowledgeState
}
```

Do not over-engineer these fields into the final economy model yet.

They primarily exist so the strategic map can display representative real game information.

---

# 21. Haven Details Panel

Selecting a known Haven should be able to display something approximately like:

```text
KALDARA

Faction: CLP
Scale: P4

Population:
2.7 million sentients

Capacity:
4.0 million adult-equivalent

Occupancy:
64%

Resources:
Food       ↓
Supply     →
Material   ↑

Material Capability:
M2

Gate Status:
Reachable

Route:
8 hops
```

Exact formatting is not locked.

The simulator's purpose is to determine whether this information is understandable and useful in the right-side details panel.

---

# 22. Relevant Map Layers

The Haven metadata should support testing at least these strategic layers:

```text
Havens
Factions
Population
Resources
Trade
Threat
```

Examples:

**Population layer**

* visually distinguish P1/P4/P16;
* optionally indicate occupancy.

**Resource layer**

* filter Food/Supply/Material;
* identify surplus/deficit Havens.

**Faction layer**

* show political affiliation independent of physical territory.

**Trade layer**

* initially may simply show resource states and routing/reachability rather than simulated cargo flows.

**Threat layer**

* show infected zones in red and allow visual comparison with populated/trade-important areas.

---

# 23. Important Simulator Boundary

World Map Simulator v1 should answer:

> Can we represent population, capacity, specialization, trade dependency, faction distribution, threat, and Gate connectivity clearly on the strategic map?

It does **not** need to answer:

> Does the final hourly inter-Haven economy mathematically balance?

That belongs in a later dedicated economy/trade simulator.

Generate representative strategic data now, preserve the architectural rules above, and avoid prematurely implementing the final economic simulation.
