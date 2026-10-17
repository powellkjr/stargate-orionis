# Profession Specializations — Mentor Tools and Story Concepts

## Status and Authority

Authored design content: 18 specialization concepts and 36 approved mentor Tool
skills. This catalog records methods, targets, limits, mentor concepts and story
hooks; it does not claim simulator, schema, fixture or prompt support.

Source: the supplied `stargate-orionis-profession-specializations-handoff.md`,
incorporated as documentation on October 13, 2026. Its requests for repository
comparison, implementation plans, schema changes and tests are outside this
update's scope and are not instructions to implement the catalog.

Use with the [base curricula and progression rules](README.md),
[Profession boundaries](profession-boundaries.md),
[fixed story origins](specialization-haven-assignment-supplement.md) and
[decision checklist](specializations-and-haven-decisions.md). Detailed base
curricula, Theory/Knowledge architecture, Recipe bubble contracts and Haven
population/economy authority retain their existing responsibilities.

All 18 names, Profession associations, Tier III labels and story-origin
assignments match the existing documentation. Story origin is distinct from
mentor affiliation: a Scion-origin story may include a CLP or Concord mentor.
Mentor A/B identify concepts within each specialization, not new canonical NPC IDs.
Skill names below are approved design labels, not authored runtime skill IDs or
Tool Service identifiers. Dedicated certification curricula and executable
opportunities remain to be authored.

## System Boundaries

- Six base Professions, each with three specializations; each specialization has two mentors (A and B) and one distinctive Tool skill from each.
- A character enters the specialization storyline after attaining base Profession Tier III and selecting the specialization at untrained Tier 0. Existing permanent branch exclusivity and second-slot rules still apply; selection grants neither equipment nor trained capability. Mentors can progress independently of the player. Story participation does not transfer mentor competency or replace certification.
- Base tiers: Soldier SO3 **Assess & Direct**; Scout ST3 **Recon & Exploit**; Technician TE3 **Implement**; Scientist SC3 **Explain & Generalize**; Medic ME3 **Integrate & Recover**; Diplomat DI3 **Align & Represent**.
- Curriculum provides trained method; Subject Theory provides domain knowledge. Tool use can also require Tool Service, Room/Field Service, valid target state, resources, evidence, custody, authority, and authored opportunities.
- Tool skills are exceptional methods, not universal buffs, guaranteed outcomes, or substitutes for base training. They must exceed what base Tier III already does.
- One action bubble represents one Actor, at most one Tool Service, and at most one Room Service environment or applicable field context. Coordinated multi-Actor actions use connected single-Actor bubbles; Chain Attack does not permit multiple Actors in one bubble. Tool charges are finite and used on authored opportunities, frequently involving NPCs, not automatically on party members.
- Offworld local map is **top-down with cardinal N/S/E/W adjacency**. Paths, passages, vertical bypasses, and shortcuts are authored graph changes; do not introduce a separate tactical movement grid. Combat is encounter-based; precombat Tools resolve against authored combat opportunities.
- Immediate actions ~3 minutes, operational work ~1 hour; Gate extraction window 37 minutes where applicable. These are existing timing conventions, not locked per-skill durations or costs. Preserve interrupted work/partial progress under existing simulator contracts.
- Destination Reality, Mission, Knowledge, Deployment, Theories, and Campaign Context are inputs; resulting changes to missions, NPCs, Havens, relationships, assets, and persistent local state are outputs.
- Factions: Concord (human and voluntary Moy'na symbiotes), Scions (Ancient tradition/technology and Ancestor gene), CLP (Choice/Logistics/Protection). Independent Havens A/B/C are distinct.

## Skill Catalog — 36 Approved Skills

### SOLDIER

#### Marksman — Concord
**Mentor A:** Rapid, accurate combat shooter; excels at hitting several targets under pressure.  
**Tool A — Rapid Engagement:** At an authored **combat-start** opportunity, attack **every eligible enemy once**. Eligibility, damage, resource cost, and ordering are encounter-authored; not a perpetual multiattack buff.  
**Mentor B:** Deliberate extreme-precision shooter; tiny, distant, or fleeting targets.  
**Tool B — Precision Shot:** At an authored precision opportunity, hit an unusually difficult target or component with **any capable equipped weapon**, not only a sniper rifle. Precision target and resulting state change are authored.  
**Story:** Friendly shooting contest: A initially mocks B for no visible near hits; B reveals an impossibly tight distant grouping. A tests B's method in combat. Theme: “Hit the freaking target.”

#### Guardian — Scions
**Mentor A:** CLP security executive specializing in walls, barriers, doors, decoys, and protecting people behind defenses.  
**Tool A — Draw Fire:** **Party-facing precombat** authored intervention; redirect enemy opening fire toward a decoy, false target, projection, or other plausible distraction to protect deployed party members. Exact diversion and consequences are authored.  
**Mentor B:** Former Scion special-forces soldier; married a CLP woman and has a daughter without the Ancestor gene. Builds portable protection because Scion systems exclude his family.  
**Tool B — Interpose:** **VIP-facing precombat** authored intervention; shield, intercept, redirect, or otherwise prevent an imminent attack on a protected NPC, escort target, or civilian. Method varies with encounter; not limited to literal grid positioning.  
**Story/theme:** A initially objects to company resources being used for B's research, gradually supports it. “A wall only protects people behind it. Be the barrier.”

#### Tactician — CLP
**Mentor A:** Brilliant commander exploiting enemy vulnerabilities, including organizational and emotional weaknesses.  
**Tool A — Exploit Weakness:** **Enemy-facing precombat** authored ambush/disruption opportunity; exploit a known vulnerability to disadvantage the enemy's opening response, coordination, or reinforcements. Not an automatic universal ambush.  
**Mentor B:** Beloved CLP CEO, parent of eight, youth sports coach; understands teammates' strengths and motivates teams even when losing.  
**Tool B — Chain Attack:** **Party-facing precombat** opportunity; coordinate eligible deployed actors into an authored sequence in which each action opens an opportunity for the next, producing an offensive chain. Avoid hardcoding exact Profession combinations; use authored capability requirements.  
**Theme:** A makes enemy weaknesses matter; B makes allied strengths matter. Tactician is the offensive inverse of Guardian's defensive precombat pairing.

### SCOUT

#### Pathfinder — Independent Haven B
**Mentor A:** Scion scientist and excavator who understands Ancient technology and learned to bypass collapsed or sealed passages during digs.  
**Tool A — Unorthodox Passages:** At an authored passage opportunity, move the **whole party** briefly **overhead or underground** to bypass an obstacle or blocked passage, emerging at another local location. Represent as authored connection between map nodes; passing over/under a location does not imply entering or revealing it. No automatic new explorable 3D floor.  
**Mentor B:** Haven native with Ancestor gene; ceremonial/martial practices preserve Ancient traversal techniques, including a kinetic-energy staff used for vaulting.  
**Tool B — Traverse Obstacle:** At an authored physical obstacle, perform extraordinary traversal and establish a usable route for the **whole party**, e.g., crossing a gap and setting a rope/anchor.  
**Theme:** A finds a way around; B finds a way across. Distinguish both from routine Technician repair and ordinary Scout navigation.

#### Tracker — Independent Haven C
**Mentor A:** Bounty hunter who predicts unknown quarry's needs, routes, and destinations, working backward from food, water, shelter, injuries, habits.  
**Tool A — View Vista:** At an authored observation/vantage opportunity (not necessarily elevated), reveal **likely locations to investigate**, based on behavioral/environmental inference; do not confirm quarry location automatically.  
**Mentor B:** Assassin and concealed observer; approaches a known location without alerting the quarry or changing its behavior.  
**Tool B — Stealth Approach:** At an authored concealed approach, Scout temporarily observes nearby locations **alone** without normal party entry or its encounter/state changes, then returns. Knowledge only; no automatic assassination, extraction, or whole-party bypass.  
**Story:** Both hired for dangerous beast hunt; A finds it, B approaches it. Complementary collaborators, not rivals.

#### Observer — Scions
**Mentor A:** Scion security/trap designer who anticipates intruder behavior and conceals alarms and defenses.  
**Tool A — Inspect for Hazards:** Before entry, inspect an authored adjacent location/entrance for concealed traps, alarms, and hazards; reveals danger, does **not** disarm it.  
**Mentor B:** Master thief; knows how valuables, secret passages, decoys, and compartments are hidden.  
**Tool B — Inspect for Concealment:** After securing an authored location, reveal hidden caches, passages, compartments, or valuables; does **not** automatically open, collect, or retrieve them.  
**Story:** Player initially serves as an inside security consultant, discovers contract conceals wrongdoing, and can choose whether to assist thief's heist. Heist participation is not automatic.

### TECHNICIAN

#### Demolitions — Concord
**Mentor A:** Controlled-collapse expert who can place flags and drop a structure's corners exactly on them, even near neighbors. Controls **where destruction goes**.  
**Tool A — Precision Drop:** At authored collapsible structure, direct collapse toward a selected authored target/location, e.g., block a route, create crossing, strike target. Outcome and collateral authored.  
**Mentor B:** Infrastructure blasting specialist in tunnels and around sensitive equipment. Controls **where destruction stops**.  
**Tool B — Controlled Breach:** At authored sensitive obstruction, breach with exceptional limits on vibration, noise, or collateral effects; not necessarily silent or harmless.  
**Boundary:** Beyond routine TE3 demolition by exceptional spatial control.

#### Integrations — Scions
**Mentor A:** Salvage inventor combining parts from unrelated machines to create a new physical capability.  
**Tool A — Improvised Assembly:** At authored component/salvage opportunity, physically combine available equipment into an unconventional functional assembly. Explicitly track consumed, recoverable, or temporarily committed parts.  
**Mentor B:** Systems/data integration expert linking independent machines through controllers, translation, or timing interfaces.  
**Tool B — Systems Interface:** At authored incompatible/disconnected systems, build an interface to coordinate them **without fundamentally rebuilding either**.  
**Boundary:** Specialization reveals non-obvious capability, not just routine TE3 integration.

#### Overdrive — CLP
**Mentor A:** Talented racing star, son of league organizer, expert at extracting peak performance.  
**Tool A — Push the Limit:** At authored machine, achieve a brief burst beyond rated performance, accepting authored strain, wear, overheating, or damage risk.  
**Mentor B:** Driver-mechanic who understands hidden mechanical characteristics, operating configurations, lubricants, and indirect performance effects.  
**Tool B — Unlock Hidden Performance:** At authored machine, recognize overlooked characteristic/configuration permitting exceptional performance **without simply forcing higher load**.  
**Story:** Recurring CLP racing league across Acts. A mysterious acceleration additive escapes fuel tests because it is actually in the **oil**; no corrupt inspectors. Detailed mentor arc remains to be developed.

### SCIENTIST

#### Applied — Concord
**Mentor A:** Photographic memory for published science/patents, synthesizes documented principles, loves photographing practical demonstrations.  
**Tool A — Applied Principles:** At authored scientific opportunity, recognize a non-obvious practical application of **established** knowledge and unlock an unconventional approach. Requires appropriate knowledge; not merely remembering a fact.  
**Mentor B:** Retired laboratory maintenance specialist with 40 years of undocumented empirical knowledge, recognizing sound, vibration, smell, and anomalous behavior.  
**Tool B — Empirical Solution:** At authored testable unknown phenomenon, use controlled observation/experimentation to discover a **repeatable practical operating method**. Does not establish a comprehensive Theory or automatically implement machinery.  
**Boundary:** Scientist finds justified approach; Technician may still need to implement it; institutional Research creates Theory.

#### Operational — CLP
**Mentor A:** Optimizer of complex known processes with multiple inputs, outputs, and controls; pursues highest feasible production.  
**Tool A — Maximize Output:** At authored operating system, determine configuration that maximizes output given fixed available inputs/resources; tradeoffs explicitly authored.  
**Mentor B:** Efficiency expert who starts with minimum acceptable output and minimizes resources, time, or hazardous exposure.  
**Tool B — Minimize Inputs:** At authored operating system with **defined required result**, determine least-cost input/time/exposure configuration; may sacrifice surplus output.  
**Boundary:** Optimize a defined process, not broad strategic externalities.

#### Strategic — Scions
**Mentor A:** Concord Moy'na Nest Planner overseeing population, health, and growth on 10–20-year horizons; inherits past planners' decisions and sees delayed cross-system effects.  
**Tool A — Trace Consequences:** At authored intervention, reveal indirect, systemic, inherited, or delayed consequences of proposed action/inaction. Knowledge, not forced decision.  
**Mentor B:** Scion Oscillation Master operating intricate chemical process; controls which variables safely absorb disturbances and when. “If you don't provide a place for the chaos to accumulate, one will be provided for you.”  
**Tool B — Redirect Instability:** At authored unstable system, identify accumulating disturbance and unlock controlled redistribution/alternative cycle; not random chaos or universal stabilization.  
**Boundary:** Distinct from Operational optimization; addresses system-wide consequence and instability.

### MEDIC

#### Field Medicine — Concord
**Mentor A:** Scion diagnostic expert with Ancient scanning technology and exceptional unaided clinical judgment.  
**Tool A — Diagnostic Breakthrough:** **Postcombat/post-exposure** authored opportunity: rapidly eliminate unlikely causes, prioritize plausible mechanisms, and unlock a targeted immediate countermeasure to **reduce short-term lingering effects** (e.g., poisoning after an encounter). Does not guarantee cure or replace ordinary diagnosis.  
**Mentor B:** Concord pharmaceutical improviser, skilled with local compounds and Moy'na-compatible customized formulations.  
**Tool B — Field Formulation:** **Pre-exposure** authored opportunity: prepare a limited-duration protective cocktail/countermeasure against likely effects of an impending hazard (e.g., strange gas), using available ingredients and charges. Not universal immunity.  
**Important:** Tools apply to authored patients/hazards and NPCs as appropriate; do not assume charges exclusively buff party members.

#### Trauma — Scions
**Mentor A:** Moy'na regenerative surgeon who can stabilize and establish long-term biological regrowth, possibly 6–12 months for limb restoration.  
**Tool A — Regenerative Stabilization:** At authored catastrophic NPC injury, preserve viability and initiate a **long-term regeneration pathway** that might otherwise be impossible; requires facilities/resources/biological compatibility; no instant recovery.  
**Mentor B:** Reconstruction surgeon who preserves severed limbs and bridges damaged/missing arteries, nerves, and bones. “Why grow an arm? We have the arm.”  
**Tool B — Surgical Reconstruction:** At authored catastrophic NPC injury with viable tissue/anatomy, perform extraordinary reconstruction/reattachment, potentially preserving function with a different recovery path.  
**Important:** These are often NPC-facing mission interventions. Not every specialization must be equally useful in routine offworld combat. A mission at a malfunctioning industrial site with many injured workers is exactly where Trauma is valuable. Base Medic handles ordinary assessment/stabilization/treatment; specialization Tools change exceptional recovery possibilities.

#### Epidemiology — CLP
**Mentor A:** Forensic epidemiologist reconstructing exposure from bodies, records, and environmental evidence after harm occurs.  
**Tool A — Trace Exposure:** At authored outbreak investigation, establish causal source/pathway and unlock targeted containment or remediation; does not automatically cure or resolve outbreak.  
**Mentor B:** Antisocial insurance-claims analyst with no medical training, detects early population signals in absences, claims, purchases, and other records.  
**Tool B — Detect Outbreak:** At authored population-data opportunity, reveal emerging health threat or affected group **before recognized outbreak**, without proving cause or guaranteeing prediction.  
**Theme:** Haven is the patient; causal reconstruction versus early warning.

### DIPLOMAT

#### Negotiator — Independent Haven A
**Mentor A:** Humanitarian treaty architect who helped establish civilization-wide humane treatment of surrendered/downed/wounded and authored universal Material/Supply/Rations trade agreement full of necessary compromises and loopholes.  
**Tool A — Construct Agreement:** At authored negotiation, identify workable terms, safeguards, concessions, or exceptions to make an agreement possible; parties still must accept.  
**Mentor B:** Leader of largest independent Haven; self-sufficient, fair, recognizes multi-party trades and future commitments that make deals mutually beneficial.  
**Tool B — Expand the Bargain:** At authored negotiation, introduce additional parties/resources/commitments to open a viable multi-party agreement; creates no resources or consent.  
**Theme:** A designs acceptable rules; B expands the negotiating table.

#### Ambassador — Scions
**Mentor A:** CLP Grand Host, executive with diplomatic title and dossier team; tailors cultural hospitality to specific influential people.  
**Tool A — Personalize Approach:** At authored social/diplomatic opportunity, identify personal/cultural detail and unlock tailored engagement or reception; does not guarantee agreement.  
**Mentor B:** Scion Kingmaker who identifies **actual** decision-makers and informal influence, rather than formal title alone.  
**Tool B — Identify Power Broker:** At authored political/hostile encounter, recognize insignia/authority or social clues to unlock access to real power broker; may bypass combat **through audience**, not automatically win negotiation.  
**Canonical example:** Pirate tattoos signal allegiance. Ambassador requests parlay with Dread Pirate Roberts; pirates escort party to captain, who demands **300 Rations** to leave locals alone.

#### Arbiter — CLP
**Mentor A:** Former legendary CLP corporate defense lawyer. After industrial catastrophe and evidence that corporation knowingly relied on his ability to evade responsibility, switches to aggressive prosecution while retaining due-process principles.  
**Tool A — Establish Liability:** At authored legal/accountability opportunity, identify enforceable responsibility through evidence, contracts, authority, jurisdiction, and procedure; opens legal remedies, not automatic conviction.  
**Mentor B:** Unorthodox judge who tailors sentencing to offender's motivations so they will not want/need to reoffend; restitution, supervision, rehabilitation, or constraints as appropriate.  
**Tool B — Determine Motivation:** At authored custody/judicial/disciplinary opportunity, identify behavior-driving motive and unlock tailored enforceable disposition; requires legal authority and does not automatically forgive.  
**Illustrative, not locked as canon:** Pirate captain assigned supervised humanitarian supply deliveries rather than conventional imprisonment.

## Opportunity Authoring Guidance — Not an Existing Schema

Future authored opportunities should specify the following semantic information.
The field names are conceptual examples from the handoff, not a locked schema
or a requirement to add fields to the simulator:

- `opportunityId`, `skillId`, `mentorSource`, `locationId`/`encounterId`, `timingWindow` (precombat, exploration, postcombat, operational, judicial, etc.).
- Preconditions: base Profession/Tier III, specialization/skill access, actor availability, Tool charges, applicable Subject Theory, Tool Service, field/room context, custody/authority, evidence, equipment, available resources, valid target state.
- Authored eligibility: target actors, NPCs, machines, passages, nodes, parties, hazards, adversaries; required tags/capabilities; constraints and limits.
- Preview: what is observable before commitment, possible costs, uncertainties, and explicit risk; no omniscient revelation beyond skill contract.
- Resolution: validated authored state transitions, resource and charge consumption, elapsed time, interruptibility, partial progress, and possible failure or limited success as supported by existing simulator rules.
- Outputs: knowledge gained; encounter opening changes; graph connections; NPC injury/recovery states; persistent destination/Haven/faction/relationship changes; resource and asset changes; follow-up mission seeds.
- Provenance: actor, mentor skill, opportunity, evidence, and resolved effects for UI and save/debug traceability.

### Timing and targeting rules

1. **Soldier precombat:** Rapid Engagement, Draw Fire, Interpose, Exploit Weakness, Chain Attack are explicitly precombat/combat-start; Precision Shot applies at an authored precision opening. Do not generalize into arbitrary combat buffs.
2. **Party vs VIP:** Guardian Draw Fire protects the **party**; Interpose protects the **VIP/escort/civilian**. Tactician Chain Attack targets party coordination; Exploit Weakness targets enemy vulnerability.
3. **Map:** Pathfinder authored vertical bypass can connect nodes without entering intervening nodes. Scout observation should distinguish suspected/located/confirmed knowledge and should not remove fog globally.
4. **Medical:** Distinguish stabilization, treatment, reconstruction/regeneration eligibility, and long-term recovery. Specialization charges can resolve NPC-facing opportunities; do not implement as party-only consumables.
5. **Social/legal:** Access is not consent; leverage is not automatic agreement; liability is not guilt; motivation is not absolution. Honor authority, custody, evidence, and persistence.
6. **Engineering/science:** Preserve Technician vs Scientist division. Specialization can reveal/enable an exceptional approach but cannot bypass missing knowledge, materials, or valid context.

## Remaining Story and Rules Authoring

Mentor concepts exist for all 18 specializations. Some stories have defined hooks (Marksman contest; Guardian family/barrier R&D; Tracker beast hunt; Observer security-contract/heist choice; Overdrive racing/additive mystery; Arbiter corporate turncoat). Most full mentor arcs, recruitment beats, independent mentor progress, and exact specialization certification requirements remain to be authored. Do not infer that approving a Tool skill approves a complete story or unlock sequence.

Exact charges, costs, damage, probabilities, cooldowns, Tool Service requirements,
applicable Subject Theories, equipment relationships, opportunity bindings and
specialization tier/certification requirements remain unauthored. Do not infer
these from skill names, mentor backgrounds or illustrative examples. The
proposed opportunity field sketch above does not settle schema ownership or
implementation support.
