# Central Threat Handoff — Reconciliation and Decision Checklist

## Status and authority

The incoming **Central Threat Design Handoff** describes strong current direction,
not a locked complete threat design. This document preserves that direction and
compares it with repository architecture and confirmed campaign decisions.
Checked items below record reconciliation guidance or accepted constraints, not
completed implementation. Unchecked items require authoring or explicit decisions.

Prefer established repository rules where they preserve coherent systems. Prefer
richer, more engaging concrete design alternatives where no established rule is
overridden. Neither preference permits silently inventing canonical mechanics.
Demo behavior is not authority for final threat biology or campaign outcomes.

Sources compared:

- The user-supplied **Central Threat Design Handoff**, sections 1–33.
- [Workspace authority and authored-data rules](../AGENTS.md).
- [Campaign context reconciliation](campaign-context-reconciliation.md).
- [Design consistency audit](design-consistency-audit.md).
- [Theory authoring contract](theory/architecture/theory-authoring-contract.md).
- [Reality, evidence and Knowledge](theory/architecture/knowledge-evidence-model.md).
- [Persistent item/instance boundaries](theory/simulator/instance-item-theory-tables.md).
- [Haven population, resources and trade](world-map/havens-population-resources-trade.md).
- [World-map prototype scope and routing](world-map/world-map-simulator-v1.md).
- [Historical SGC / Eclipse story proposal](../story_notes.md).

No detailed central-threat specification was found in those existing sources.
Most incoming ecology is therefore **new compatible direction**, not a conflict
with an already authored plant-threat model. The story proposal remains a proposal;
recovering it does not settle the starting premise or Eclipse Protocol.

## Conflict / tension checklist — repository preference and rationale

| Status | Incoming statement / tension | Recommended reconciliation |
| --- | --- | --- |
| [x] | Growers deliberately experiment, manufacture variants, and create biological systems as needed (sections 3–4). Runtime must not invent canonical technology. | **Prefer repo authority:** author valid forms, transitions, capabilities and tradeoffs before play. Runtime may select, expose and manufacture authored variants. Enemy experimentation is an in-world process, not permission to generate new canonical Theories, Patterns, Recipes or Services. The selection/learning mechanism still needs design. |
| [x] | An infestation functions as a civilization with living infrastructure (sections 1, 32). This could become a private plant-only execution system. | **Prefer reusable repo boundaries:** represent physical organisms, state, production, custody, execution and Knowledge separately. Biological presentation does not require a new authority model. Exact actor-versus-item-versus-infrastructure representation remains open. |
| [x] | Killing leadership makes organisms feral (section 6). A command target could become an encounter-wide kill switch. | Preserve the handoff's richer behavior: leadership supplies coordination, not animation. Persistent survivors remain alive and capable of authored jobs. Defeating command, ending immediate combat and clearing infestation are distinct outcomes. No current repo rule requires an instant wipe. |
| [x] | Destroy biomass, growers or supply networks (sections 11, 20). Simplified objectives could erase inventory or restore infrastructure for free. | **Prefer repo physical continuity:** use forward state transitions and authored destruction/salvage outputs where applicable. Avoid duplicate instances, disappearing mass and automatic custody changes. Biological growth still requires defined resource sources; preservation is not free matter creation. |
| [x] | Threat intelligence intentionally dials and redials destinations (sections 6–8, 27). Knowing a destination might be mistaken for universal accessibility. | **Prefer repo network separation:** address Knowledge, physical endpoints, routing viability, occupation, permission and current connection state are independent. Intelligent organisms do not bypass routing or failed connections. How they learn/store addresses remains unresolved. |
| [ ] | Thick roots cross an open Gate, feed the beachhead and reconnect after closure (section 8). | **Define Gate transit semantics first:** how continuous living structures cross, whether nutrient flow is possible during connection, what closure severs, and how surviving roots reconnect. Do not assume permanent cross-world plumbing, bidirectional transport, extra Gate uptime or Eclipse-buffer behavior. The repo does not currently settle this biological transport case. |
| [ ] | Acid eventually threatens an Iris (section 23). A closed Iris prevents ordinary hostile arrival. | Define where corrosive material or siege organisms can physically act and how exposure accumulates. Keep the Iris useful and siege general-purpose, but do not infer an ability to materialize attackers through a closed defense. This is a mechanics gap, not a confirmed contradiction. |
| [x] | Repeated dialing for about a week and roughly weekly information updates (sections 8, 25). | **Keep both provisional:** neither is a schedule, deadline or universal cadence. Author connection and strategic events later, without silently changing ordinary Gate closure behavior. |
| [x] | Gate isolation stops reinforcements but established infestations survive locally (section 15). CLP approaches must remain viable (section 31). | Keep the richer local-sustainability breakpoint **and** the confirmed CLP direction. Isolation can hinder spread without clearing existing worlds. Author complementary suppression/defense and explicit victory conditions; do not weaken biology merely to make shutting a Gate an automatic win. |
| [x] | Scion systems can clear planets, yet reservoirs can reinfect them (sections 24, 31). | Preserve genuine anti-threat capability and distinguish local clearance from durable campaign victory. Off-world reservoirs are a strong hypothesis, not a locked explanation. Do not make every Scion victory inevitably fail or require lunar travel without authoring it. |
| [x] | Concord biology offers survival advantages; threat is not intended to be related to Moy'na or Krek (sections 1, 31). | Keep the no-relation direction. **Prefer repo Knowledge discipline:** faction programs do not imply immunity, kinship, mind control or vulnerability. Specific adaptations and limitations need authoring; Concord is the faction and Moy'na the species. |
| [x] | Humans, Moy'na and wounded organisms may be collected as biomass; living captives support rescue (sections 5, 11, 21). | **Prefer persistent-person and custody rules:** capture, treatment, biological testing, processing and death are separate explicit transitions. Biomass targeting does not automatically convert a living person to an item, corpse or resource. Rescue is not automatic recruitment. |
| [x] | Infected Havens retain recoverable assets and new missions (sections 18–22). | Retain Haven identity, physical infrastructure and separate political/access state. Infestation is not deletion or a faction recolor. Archives and equipment remain persistent objects; recovering an archive does not automatically grant Theory or manufacturing Knowledge. |
| [x] | A threat Gate Guardian echoes Ancient Sentinels (section 17). | Preserve thematic symmetry, **not identifier equivalence**. Historical Ancients/Ancestors are not an active faction. Biological guardians, Ancestral defense systems and map routing objects remain distinct unless explicitly authored otherwise. |
| [x] | Civilization-scale conventional military victory remains possible (section 31). | **Prefer repo infrastructure authority:** capability derives from actual personnel, Rooms, Cores, equipment, resources and logistics—not a new authoritative MilitaryStrength/Offense score. Exact victory conditions and remaining reservoirs still need design. |
| [x] | Nine endings must accommodate threat biology (section 31). | Keep exactly nine major endings, three per faction, arising from accumulated commitments. Do not equate each listed faction approach with an already defined ending or insert arbitrary weaknesses to guarantee one. Stress-test both threat and endgames before finalizing either. |
| [x] | Full infestation spread, production and strategic AI could be added to the existing map prototype. | **Prefer repo scope:** v1 explicitly excludes detailed threat expansion, combat, production and mission generation. Threat overlays can represent information; the handoff is not authorization to implement a complete ecology there. |
| [ ] | Threat incursions might explain the SGC opening or Eclipse interruption/resurgence. | Keep these separate until explicitly reconciled. `story_notes.md` proposes a buffered SG-12 return after nearly 500 years and a deliberately open Iris in a sealed facility; that special starting circumstance is not a general defense rule. Do not assert the threat caused the delay or current resurgence. |

## Compatible strong direction to retain

These are the handoff's design direction, not final organism names, quantitative
balance or executable definitions:

- Intelligent invasive **plant-based colonial ecology / biological civilization**;
  organisms perform equipment functions rather than carrying human weapons.
- Purpose-built carriers, sensors, armored/projectile forms, rooters, processors,
  seeders, siege forms and leadership. Some strategically important organisms are
  weak in direct combat.
- Grower-driven variant manufacturing with resource costs and tradeoffs; older
  useful forms remain available. No automatic perfect counter to the player's
  last action.
- Distinct **energy** and **biological matter** inputs. Sunlight is preferred;
  electrical exploitation can threaten underground sites. No production rates,
  conversion ratios or electrical extraction method are defined yet.
- Readable fruits that develop into organisms, with color/size/shape/growth stage
  potentially communicating future production. Carrier transport can move fruits
  to useful positions before emergence.
- Biomass recovery, storage and processing; managed fungi/microbes preserve and
  prepare material. Roots and nutrient slime/biofilm make logistics visible.
- Early external dependence progressing toward local sustainability. Mature local
  production can create organisms too large to pass through a Gate.
- Locally rooted Gate guardians primarily defend invasion infrastructure rather
  than pursue teams everywhere. Maximum size and ancient-world extremes are open.
- Infected Havens remain playable. Rescue, recovery, infiltration, research,
  infrastructure disruption, partial reclamation and political consequences can
  provide new missions.
- Suppression matters before eradication. Destroying stockpiles, cutting energy,
  severing logistics or killing command has a real but not automatically final
  effect. Regrowth must be possible only under authored resource/state conditions.
- Some recognizable humans remain alive for practical biological purposes;
  testing is a strong possibility, not a universal captive fate.
- Rescue changes recruitment circumstances without guaranteeing enlistment;
  surviving leaders can remain leaders, refugees or reclamation advocates.
- General-purpose corrosive siege adaptation can eventually pressure defenses
  without rendering an Iris suddenly worthless.
- Leadership-dependent coordination, mature-world outbound incursions and possible
  off-world reservoirs form strong direction; mechanisms remain to be authored.

The inspirations (Plants vs. Zombies, Phoenix Point, Tyranids, Mordrem and the
listed secondary references) are design analogies, not imported lore or mechanics.
This reconciliation does not independently validate their game behavior.

## Unresolved design checklist — do not silently implement

These questions are deliberately deferred at the user's request while more design
handoffs are collected. Keep them visible; they are not prerequisites to recording
the [nine faction victory paths](faction-campaign-nine-endings-reconciliation.md)
or subsequent handoffs. That campaign direction does not settle their mechanics.

- [ ] **Intelligence:** choose centralized, hierarchical or distributed control;
  define tactical versus strategic authority and what disruption actually changes.
  Hierarchical is promising in the handoff, not selected.
- [ ] **Address acquisition/storage:** define discovery, database access, memory,
  failed dialing, destination selection and knowledge transfer.
- [ ] **Incursion transport:** resolve root transit, resource supply, reconnection,
  Gate defense and Iris exposure before authoring the establishment cycle.
- [ ] **Biological updates:** define independently learned versus shared forms,
  template storage, physical/chemical transfer and costs. No weekly rule yet.
- [ ] **Adaptation execution:** author available variants, production requirements,
  selection/experimentation rules, evidence available to the player and tradeoffs.
- [ ] **Economy:** define energy/biomass accounting, preservation, recycling,
  production, regrowth and supply interruption through established execution rules.
- [ ] **Maturity:** define actual states and transition requirements; the ten
  qualitative steps are not ten canonical tiers or an automatic timer.
- [ ] **Planetary spread:** choose roots, seeds, spores, mobile forms, waterways or
  combinations, with routes, constraints and observable progression.
- [ ] **Off-world reservoirs:** decide whether moons/satellites are the historical
  explanation, how organisms reach/survive there, and what can detect/remove them.
- [ ] **Eradication:** define remaining roots/seeds/microbes/biomass and the evidence
  needed to distinguish visible suppression from inability to regenerate.
- [ ] **Captive ecology:** define when/why people remain alive, how rescue works,
  and what testing changes without granting arbitrary automatic transformations.
- [ ] **Motivation and resurgence:** define strategic imperative and why the threat
  returns now; do not assume ordinary conquest or connect it to Eclipse by default.
- [ ] **Faction endgames:** stress-test Scion clearing, Concord survival, CLP
  logistics, protection and coordination against concrete biology and reservoirs.
  Author all nine outcomes and their viability, not just broad approach names.
- [ ] **Presentation and Knowledge:** define observations of fruits, tracks, slime,
  command and logistics separately from scientific interpretation and institutional
  Knowledge. Oversized tracks can support a finding; UI must not expose hidden
  Reality just because the author knows local production occurred.

## Recommended design order

For later reconciliation, not the current work queue while handoffs are arriving:

1. Resolve **intelligence + Stargate operation + root/Iris interaction** together.
2. Author one complete local ecology: energy, biomass, production, command and
   suppression, with meaningful tradeoffs and readable field evidence.
3. Define sustainability, regrowth, spread and durable clearance/reservoirs.
4. Stress-test faction strategies and campaign endings against that concrete model.

This is documentation only. It adds no canonical Theory, Pattern, Recipe,
Service, organism definition, event, numerical rule or simulator behavior.