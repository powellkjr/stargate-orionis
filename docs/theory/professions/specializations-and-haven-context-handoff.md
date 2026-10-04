# Specializations and Haven Context Handoff

## Purpose and Authority

This handoff captures specialization and Haven/faction context that is not yet
represented cleanly in the authoritative documents. It is design context, not a
replacement for detailed Profession curricula or World Map specifications.

- **Base capability and boundaries:** the [Profession context handoff](profession-context-handoff.md)
  summarizes the [detailed curricula](README.md); detailed curricula take precedence.
- **Population, capacity, resources, trade and simulator rules:**
  [Havens, Population, Resources & Trade](../../world-map/havens-population-resources-trade.md)
  takes precedence.
- **This document:** specialization labels/status, faction-specific Haven context,
  local identity principles, and unresolved authoring work.
- **Demo data/code:** evidence of presentation or prototype behavior, not proof
  that a canonical specialization curriculum has been authored.

Labels below distinguish **repo-backed facts**, **current design context**, and
**open items**. See the [decision checklist](specializations-and-haven-decisions.md)
for conflicts requiring explicit decisions. This handoff should eventually become
a compact pointer to dedicated specialization and faction/Haven documents.

## 1. Base Profession Progression — Repo-Backed

| Profession | Tier I | Tier II | Tier III |
| --- | --- | --- | --- |
| Soldier | SO1 — Fight & Protect | SO2 — Control & Maneuver | SO3 — Assess & Direct |
| Scout | ST1 — Observe, Navigate & Locate | ST2 — Track & Predict | ST3 — Recon & Exploit |
| Technician | TE1 — Diagnose & Restore | TE2 — Adapt | TE3 — Implement |
| Scientist | SC1 — Observe & Analyze | SC2 — Model & Test | SC3 — Explain & Generalize |
| Medic | ME1 — Assess, Stabilize & Treat | ME2 — Diagnose & Manage | ME3 — Integrate & Recover |
| Diplomat | DI1 — Communicate & Influence | DI2 — Negotiate & Resolve | DI3 — Align & Represent |

Base Tier III is senior generalist competency, not specialization competency.
At Tier III a Unit may choose a Specialization or a Cross-Path into another
Profession. These choices are permanently mutually exclusive. There is no
switching after selection, including to another Cross-Path or Specialization.

Selecting either branch at T0 (untrained) unlocks the second equipment slot.
Base Tier III without a selected branch does not unlock it. Slot availability
does not grant equipment or branch competency; Tool eligibility remains separate.

Specialization onboarding is expected to use supervised multi-mission field
practice with an experienced mentor. This is not automatic competency or subject
Theory transfer and is separate from Curriculum certification. Mentor eligibility,
mission count, completion conditions and final onboarding state remain open.

## 2. Specialization Labels — Repo Evidence, Not Curricula

The [icon registry](../../../demos/shared/data/specialization-icons.json) contains
15 labels but does not encode Profession ownership. The
[runtime branch registry](../../../demos/shared/offworld/equipment.mjs) supplies
a complete prototype roster. These sources must not be conflated.

| Profession | Confirmed specialization labels | Icon-registry coverage |
| --- | --- | --- |
| Soldier | Marksman, Guardian, Tactician | All three |
| Scout | Pathfinder, Tracker, Observer | Pathfinder and Observer; no Tracker |
| Technician | Demolitions, Integrations, Overdrive | All three |
| Scientist | Applied, Operational, Strategic | Operational and Strategic; no Applied |
| Medic | Field Medicine, Trauma, Epidemiology | Trauma and Epidemiology; no Field Medicine |
| Diplomat | Negotiator, Ambassador, Arbiter | All three |

The confirmed Scout roster is Pathfinder, Tracker and Observer; Scientist is
Applied, Operational and Strategic; Medic is Field Medicine, Trauma and Epidemiology.
These decisions supersede the original handoff's Scout assignment of Operational
and its unidentified names. Runtime already uses the preferred Medic label Field Medicine;
aligning that label and any persisted references is separate implementation work.

Most labels do not yet have dedicated specialization curricula defining
capabilities, boundaries, tools or progression. Do not infer those from names.

## 3. Specialization Design Context — Not Fully Authored

Original direction:

- Six base Professions, three specializations per Profession.
- A specialist is stronger within its focused domain than an equal-level
  cross-trained Unit; the exact mechanical comparison remains unauthored.
- Cross-training broadens capability as the alternative to specialization.
  Branch choices are permanent and exclusive; there is no switch-and-retain path.
- At base Tier III, selecting either branch at untrained T0 unlocks a second
  equipment slot for eligible base Profession Tools. Trained branch Tool
  eligibility remains separate; T0 grants no branch competency. The demo runtime
  now follows this rule. Final-game T0-to-T1 promotion includes making specialist
  Tools; that Promotion Room workflow is not simulated here.

Known role intent:

- **Marksman:** exceptional precision and ranged engagement beyond ordinary
  Soldier weapon employment, not simply higher accuracy on every attack.
- **Guardian:** exceptional protection and interception; base Soldier still
  owns ordinary protection.
- **Tactician:** advanced tactical coordination beyond SO3; SO3 remains a
  complete senior Soldier without requiring Tactician.
- **Epidemiology:** population-level disease/outbreak investigation and management,
  rather than ordinary single-patient care.

Other capability packages must be authored rather than inferred. Any narrower
boundary already specified by a detailed curriculum remains authoritative.

## 4. Haven Definition and Relationships — Current Design Context

A Haven is any persistent population or community on the far side of a Stargate.
It need not be a city, planet, single species, faction capital or technologically
advanced settlement.

Each Haven may have local leadership, goals, cultural/technical specialties,
relationships with the SGC and its faction, and reputation toward specific SGC
personnel or leaders. Keep these separable:

```text
SGC ↔ Faction
SGC ↔ Haven
SGC ↔ Haven Leader
```

Faction affiliation does not erase local identity. Independents are a minority
of total population, not a shared culture; the population constraint is distinct
from the number of Independent Havens.

## 5. Population and Scale — Repo-Backed

P-scale is sustainable resident ration-support capacity, not literal population.

| Scale | Adult-equivalent daily ration capacity |
| --- | ---: |
| P1 | 1,000,000 |
| P4 | 4,000,000 |
| P16 | 16,000,000 |

Keep `SentientPopulation`, `RationCapacity`, `RationDemand` and `Occupancy`
separate. Scale does not imply physical size, cultural importance, military
strength, technology or visitor throughput.

Approximate starting generation targets, not immutable lore quotas:

| Faction | Havens | P1 | P4 | P16 |
| --- | ---: | ---: | ---: | ---: |
| Scions | 40 | 5 | 31 | 4 |
| CLP | 25 | 16 | 6 | 3 |
| Concord / simulator Moy'na | 15 | 3 | 7 | 5 |
| Independent | 20 | 12 | 6 | 2 |
| **Total** | **100** | | | |

The World Map supplement governs occupancy, provisional ration equivalents and
generation details, including nest-age influence rather than permanent quotas.

## 6. Economy and Infrastructure — Repo-Backed

Core resources are **Food, Supply and Material**; Material has M1/M2/M3 quality.
Faction generation tendencies are Concord → Food, CLP → Material,
Scions → Supply, Independents → varied.

- All Havens use the same trade system; no invisible faction-wide pooling.
- Resources move physically through the Stargate network; routing matters.
- Current core limit: one trade per Haven per hour.
- Ordinary trade should not automatically erase structural deficits.
- Do not use generic `MilitaryStrength` or `Offense` as Haven military strength.
  Defense should derive from actual Rooms, Cores and defensive infrastructure.
- Havens use the same Room/Core architecture available to the player.
- Faction identity primarily comes from layout, skins, installed technology and
  potentially Cultural Platforms/Cores.

## 7. Scions — Current Design Context

Scions call the Ancients **the Ancestors** and see themselves as descendants,
heirs and scions. They occupy and restore Ancestral sites, treating inherited
technology and places as responsibility as well as inheritance.

They have near-universal Ancestor-gene compatibility and can operate/maintain
some inherited technology, but cannot manufacture genuine Ancient technology
at scale.

Many P4 Havens reflect inherited facilities with substantial support capacity
and relatively low occupancy. P16 Havens can be restored great Ancient cities.
Local cultural practices can differ within the faction.

> The Ancestors provide. The Ancestors protect.

Temples or equivalent cultural structures may exist. Substantial functionality
must be represented by a real Room, Platform or Core rather than hidden inside
a cosmetic cultural object.

## 8. Concord Faction and Moy'na Species — Current Design Context

**Concord** is the confirmed faction name. **Moy'na** is the species name:
a sapient domesticated symbiote species. Older simulator labels use Moy'na for
the faction and need presentation alignment. Whether compatibility identifiers
are migrated is a separate technical decision, not a naming-design ambiguity.

### Governance

- Each Haven has one Moy'na **Princess**, representing the local Moy'na
  population, and one human **Governor**, representing human civic administration.
- The faction has one Moy'na **Queen** total and a permanent human Senate.
- Governors send Senators; a human **President** represents the human political
  position.
- Major faction decisions require **President + Queen** agreement: deliberative
  human political authority alongside long-lived biological continuity.

Local government variation around this structure remains to be authored.

### Princess Nests

A mature nest is a dense multilayer biological ecosystem: multiple developing
broods, specialized nurseries, controlled chemistry/temperature, nutrients,
microorganisms, waste processing and supporting biological communities.

It is effectively immovable, not a structure that can be packed onto a ship or
quickly recreated elsewhere. Establishing a new nest may take decades or
generations and is not ordinary evacuation. This matters for evacuation, Gate
isolation, network fragmentation and CLP Logistics conflicts.

A bonded human and Moy'na count as **two sentient individuals**. Use the World
Map supplement's provisional ration equivalents, not a one-person shortcut.

## 9. CLP — Current Design Context

CLP grew from a commercial/logistics organization into a civilization and faction.
Its modern principles are **Choice, Logistics, Protection**.

### Choice

> Don't leave people with only one option.

This supports portability, common standards, common/interoperable currency,
portable credentials, contracts/property rights, migration rights, courts,
civil rights, elections and federal political structures.

### Logistics

> If you depend on someone else's supply chain, they control what you can do.

This drives warehouses, manufacturing, shipping, spacecraft, orbital
infrastructure, asteroid mining, shipyards, habitats, terraforming, closed-loop
colonies and generation ships. The ultimate goal is human civilization able to
function without dependence on the Stargate network.

### Protection

> Protect what you've built.

Commercial protection develops into warranties, insurance, security, fire
suppression, drones, Haven defense and military capability.

CLP tends toward many smaller P1 Havens, incorporation of existing local or
indigenous populations, material/industrial production, several major P16
centers, and practical civic identity rather than sacred inheritance or
symbiosis. Political structure below faction-wide ideology is underdesigned.
**Do not invent a uniform CLP Haven government.**

## 10. Independents — Current Design Context

Independent means politically unaffiliated, not shared culture, technology,
species or government, and not primitive development. Havens may be isolated
settlements, advanced powers, unusual communities, powerful local states or
civilizations whose goals do not align with major factions.

Independent population remains a minority overall. Small Havens may nevertheless
be strategically or politically important.

## 11. Naming — Repo-Backed Presentation References

See [population naming references](../../../demos/shared/data/personnel-names.md).
These are editorial/name-generation influences, not ethnicity, ancestry or
species rules.

| Population | References |
| --- | --- |
| Scions | Hellenic / Byzantine / Roman |
| Concord | Persian/Iranian / Sanskrit / Swahili |
| CLP | English (American) / German / Dutch |
| Independent A | Mongolian |
| Independent B | Akan |
| Independent C | Polynesian/Samoan |

Faction provides broad weighted naming families; individual Haven culture
determines the local convention. Independent A/B/C are placeholders, not canon
faction names.

## 12. Local Identity and Specialties — Current Design Context

Two Havens can be recognizably of one faction without identical layouts,
governments, priorities, religion, technology or attitudes toward the SGC.

```text
Faction Identity + Local Culture + Local Leadership + Local Economy
+ Local History + Local Problems + Local Relationship with SGC
```

Specialties may arise from environment, inherited infrastructure, resources,
expertise, culture, faction investment, history, unique technology, biology or
network position. Examples include medical/food production, material processing,
research, Gate logistics, shipbuilding, Ancestral technology, manufacturing,
training, trade, diplomacy and biological research.

A specialty need not match its faction's economic tendency. Generation weights
should influence Havens rather than dictate every Haven's output.

## 13. Access and Missions — Current Design Context

Relationships and physical access are separate. Contemplated access labels:

```text
WELCOMED  PERMITTED  RESTRICTED  NEGOTIATED  REFUSED  HOSTILE
```

These are conceptual labels, not implemented or locked mechanics. Friendly
faction relations do not automatically grant unrestricted local access; poor
faction relations do not preclude local cooperation.

Havens are major mission sources: leadership/population requests, faction
requests, shortages, infrastructure failures, research, political disputes,
missing personnel, security, threats, trade disruption, nearby exploration and
consequences of earlier SGC actions. Chains may be authored when a situation is
created, for example:

```text
Investigate uprising → Determine cause → Sabotage / Negotiate / Support / Withdraw
```

Mission results change persistent Haven state; do not reset it to a faction
baseline.

## 14. Open Authoring Work

The [Haven assignment supplement](specialization-haven-assignment-supplement.md)
fixes the story origins for all 18 specializations. Use its confirmed names and
faction assignments; individual Haven identities and NPCs still need recovery
or authoring. Origin assignments do not grant faction-exclusive capability.

The [decision checklist](specializations-and-haven-decisions.md) tracks the
complete specialization and Haven/faction authoring backlog as well as conflicts.
Do not infer missing rules from labels or use this context to invent canonical
Theories, Services, Cores or game rules.

## 15. Conceptual Haven Schema — Not Locked

```text
Haven {
    HavenID, GateID, Name
    Faction, LocalCulture, Leader, Government
    Scale, RationCapacity, Occupancy, RationDemand, SentientPopulation
    FoodState, SupplyState, MaterialState, MaterialQuality
    LocalSpecialties[]
    SGCRelationship, FactionRelationship, LeaderRelationship, AccessState
    LocalGoals[], LocalProblems[], UniqueInfrastructure[], PersistentStates[]
    KnowledgeState, MissionSources[]
}
```

Do not force all identity into one object if Theory/Instance architecture
provides cleaner ownership. Reality, Knowledge, physical state, execution and
presentation remain separate.

## 16. Current Design Boundary

```text
Faction → broad civilization identity and tendencies
Haven → local culture, leadership, economy, history, specialties,
        relationships, access and problems
Individual → Profession, progression, specialization, traits,
             equipment, relationships and history
```

A label is not a designed capability. Faction affiliation is not a complete
Haven definition. Preserve meaningful variation at all three levels.