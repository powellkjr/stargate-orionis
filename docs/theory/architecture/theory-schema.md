# Universal Theory Schema

## Status

**ACTIVE ARCHITECTURE**

This document defines the common semantic shape of Theory content and how Theory composes across objects, states, environments, factions, missions, and generated content.

## Theory Is Not the Physical Object

Keep these concepts separate:

Theory
Physical Instance
Recipe Instance
Knowledge Record
Cargo
Tool
Core
Service

A Theory describes knowledge and semantic truth.

A physical generator is an instance that may reference Generator Theory.

A Theory does not itself occupy inventory space.

A written copy of a Theory may become Knowledge Cargo, which is a physical object.

## Theory Primary Graph

Every substantive Theory should have a Primary graph.

The Primary graph represents the minimum critical procedural knowledge defining that Theory.

Any Recipe claiming to implement that Theory's core technology or method must include the Primary semantic requirements.

Example:

PLASMA_II Primary
+
SHIELDS_II Primary

must both be represented in a Recipe claiming to implement a Plasma Shield system.

## Secondary Graphs

Theories may provide reusable Secondary graphs.

Examples:

- diagnostics;
- maintenance;
- manufacturing;
- calibration;
- containment;
- salvage;
- installation;
- field application;
- medical treatment;
- operating procedure;
- emergency response.

Secondary graphs are reusable semantic modules rather than mandatory parts of every Recipe.

## Cross-Theory Graphs

A Recipe combining multiple Theories may define a cross-Theory subgraph.

Example:

PLASMA_II
+
SHIELDS_II

may permit a unique:

PLASMA_SHIELD_INTEGRATION

subgraph.

However:

«A cross-Theory graph may not require a Profession, Tool Service, or Room Service capability outside the combined capability envelopes of the contributing Theories.»

If it requires higher or unrelated capability, another Theory dependency is missing.

## Theory Capability Envelopes

A Theory should define the maximum capability its own graphs may require.

Conceptually:

professionEnvelope[]
toolServiceEnvelope[]
roomServiceEnvelope[]

These are authoring constraints.

A Theory graph must not quietly require something outside its declared envelope.

This allows validation before Recipes are generated.

## Theory Composition Uses Intersection

Field/incident generation must look for compatible intersections.

Do not perform random union.

Example:

GENERATOR:
overload
heat
power

ABANDONED:
neglect
improvised repair
missing parts

valid intersection:

Improvised regulator bypass causes overheating.

The generator should seek semantic compatibility.

## State Theories Are Preferred

Prefer reusable state modifiers such as:

ABANDONED_I
SCAVENGED_I
FLOODED_I
UNPOWERED_I
DAMAGE_ELECTRICAL_I
RECENT_COMBAT_DAMAGE_I

rather than duplicating every object for every condition.

Use dedicated composite Theory only when the combination produces genuinely unique semantic behavior.

## Environment Theories Are Containers

An environment Theory should guide likely:

- objects;
- hazards;
- problems;
- sensory presentation;
- professions;
- salvage;
- state modifiers;
- encounter structure.

Examples:

HAVEN_MAINTENANCE_I
ANCIENT_CONTROL_ROOM_I
CLP_WAREHOUSE_I
MOYNA_MEDICAL_LAB_I

Objects contained in those environments contribute their own Theory guidance.

## Faction Theory Can Modify Presentation and Practice

Faction knowledge may influence:

- construction style;
- maintenance practice;
- equipment conventions;
- markings;
- documentation;
- expected safety standards;
- salvage value;
- security practice;
- cultural interpretation.

Do not automatically make faction identity a bespoke object variant if the same result can be composed.

Example:

STD_GENERATOR_I
+
CLP_INFRASTRUCTURE_I

may produce a CLP-maintained generator without requiring:

CLP_GENERATOR_I

unless CLP actually uses a semantically distinct generator design.

## Profession Flavor Should Exist for All Six Professions

Every Theory should consider:

SC — Scientist
DI — Diplomat
SO — Soldier
TE — Technician
ME — Medic
ST — Scout

Low relevance is acceptable.

Not every Profession needs a mechanical action.

But the Theory should consider whether that Profession might:

- notice something;
- ask a useful question;
- interpret context;
- recognize danger;
- interact;
- create risk;
- provide flavor.

This supports richer generated encounters.

## Profession Guidance Does Not Automatically Grant Mechanics

A Theory may say:

Scout may notice recent footprints.

That is semantic guidance.

Whether the Unit actually notices them may depend on:

- Scout Curriculum;
- Perception;
- revealed knowledge;
- difficulty;
- field state.

Theory describes what is plausible, not guaranteed.

## Unit Stats Still Matter

The game has broader Unit stats such as:

Navigation
Perception
Expertise
Influence
Endurance
Stamina

Theory guidance should not replace these systems.

Examples:

- Theory may define what clues exist.
- Perception may influence whether the clue is noticed.
- Expertise may influence outcome quality or available result band.
- Influence may modify social consequences.
- Endurance affects incoming healing/injury resistance.
- Stamina affects operational readiness.

The Theory provides content; stats resolve performance where relevant.

## Theory Can Generate Salvage Opportunities

A Theory should consider:

- what can be recovered;
- which components survive;
- what Material categories result;
- whether specialist knowledge improves recovery;
- what damage reduces yield;
- whether the object must remain intact for Analysis.

Salvage opportunities are semantic output, not guaranteed loot.

## Theory Can Generate Resource Opportunities

Field Guidance may expose:

resourceOpportunities[]

Examples:

- Material salvage;
- Supply;
- biological samples;
- rare components;
- data;
- Artifact;
- intact Core;
- recoverable equipment.

Generation should remain constrained by custody and transport rules.

## Gate / Offworld Context

The game is Stargate-themed.

Theory authoring should support environments and problems involving:

- Stargate travel;
- offworld Havens;
- alien technology;
- Ancient/Ancestor ruins;
- faction infrastructure;
- remote expeditions;
- extraction;
- limited carried equipment;
- uncertain local conditions.

A Theory should consider whether it has meaningful field/offworld use rather than being authored exclusively from a base-management perspective.

## Havens

A Haven is any meaningful population/community on the far side of a Stargate.

Theory content may apply to:

- faction-aligned Havens;
- independent Havens;
- ruined Havens;
- industrial sites;
- settlements;
- military sites;
- research sites.

Avoid assuming all offworld content is wilderness or ruins.

## Factions

The three major faction identities are:

Scions
Moy'na
CLP

Theory should support faction composition rather than forcing every faction interaction into separate handcrafted events.

Faction-specific Theory may modify:

- priorities;
- doctrine;
- equipment;
- social interpretation;
- architecture;
- medical practice;
- security practice;
- acceptable solutions.

## CLP Canon

CLP is the current canonical faction name.

Do not use "New Infinity" as:

- alternate name;
- predecessor;
- historical name;

unless explicitly reintroduced later.

CLP principles:

C — Choice
L — Logistics
P — Protection

These evolved historically rather than being a preplanned galactic doctrine.

## Scion Terminology

Scions refer to the Ancients as:

the Ancestors

Their broad cultural framing includes:

«The Ancestors provide and the Ancestors protect.»

Use this terminology when authoring Scion-facing Theory/flavor.

## Moy'na Context

Moy'na civilization is symbiote-based and medically sophisticated.

Relevant semantic domains may include:

- symbiosis;
- advanced medicine;
- pharmaceuticals;
- biological transformation;
- host/symbiote compatibility;
- cocoon/rebirth processes;
- faction-specific medical ethics.

Theory authors should not flatten Moy'na technology into generic “alien medicine.”

## Theory Types Should Share a Common Core

Potential Theory categories include:

Technology
Science
Medicine
Profession Curriculum
Room Curriculum
Operational Doctrine
Culture
Faction Practice
Environment
State
Damage
Hazard
Biology
Material
Security
Infrastructure

Avoid creating entirely unrelated schemas for each category.

Use a shared Theory foundation plus category-specific extensions.

## Room Curriculum Is Also a Theory Type

Room Curriculum Theory should describe:

- what the environment supports;
- common contents;
- common problems;
- environmental hazards;
- relevant Professions;
- likely Services;
- field equivalents.

This lets the same semantic concept support both:

- SGC base rooms;
- offworld facilities.

## Generated Content Should Produce Valid Tags

A generated encounter is not merely prose.

It should create or operate against actual instance state.

Example:

GENERATOR
POWERED
IMPROVISED_REPAIR
OVERHEATING
UNKNOWN_MODIFICATION

Text is a presentation of state.

State should remain authoritative.

## Generated Field Content Should Be Composable Across Layers

A field tile may combine:

Environment Theory
Object Theory
State Theory
Faction Theory
Population Theory
Mission Theory
Unit Profession Curriculum
Current revealed Knowledge

All of these may contribute.

The encounter should not belong exclusively to one source Theory.

## Mission Theory Can Bias Generation

Mission context may influence which valid Theory intersections are selected.

Example mission:

Find missing survey team

may bias toward:

- evidence;
- recent movement;
- communications;
- survivor clues;
- hazards related to disappearance.

It should not override physical Theory truth.

## Unique Narrative Still Exists

Not everything should be generated.

Use bespoke authored content for:

- named characters;
- major story beats;
- faction leadership;
- scripted revelations;
- unique moral choices;
- ending-critical events;
- semantically unique artifacts.

Generated systems should support these events, not eliminate authored narrative.

## Final Content Architecture

The intended content flow is approximately:

Theory Library
    ↓
semantic truth
    ↓
Theory composition
    ↓
instance state / tags
    ↓
observable clues
    ↓
Profession + Knowledge interpretation
    ↓
valid actions
    ↓
Recipe generation
    ↓
bubble resolution
    ↓
physical / knowledge consequences
    ↓
new state
    ↓
future encounters / Analysis / Research / Discovery

This creates one connected simulation rather than separate systems for:

- missions;
- profession checks;
- research;
- incidents;
- salvage;
- exploration;
- crafting;
- repair;
- environmental interaction.

Theories provide the semantic vocabulary.

Recipes provide execution.

Tags provide state.

Services provide capability.

Professions provide methods.

Knowledge controls interpretation.

The field generator composes all of them into playable situations.

# Canonical Schema Detail

This document summarizes the current universal Theory schema, Knowledge/Evidence architecture, and the architectural constraints established through the Technician and Scientist Profession passes.

The governing principle is:

> **Theory describes semantic truth and valid possibilities. Existing game systems determine how those possibilities execute.**

Theory is not an execution system.

The major authorities are:

```text
THEORY
Semantic truth and valid possibilities.

INSTANCE STATE / TAGS
What is actually true of a specific object, place, Unit, event, or situation.

KNOWLEDGE
What the SGC has observed, recorded, interpreted, or established.

RECIPE
How an executable state transition occurs.

SERVICES + PROFESSION
Whether the required execution capability exists.
```

The field generator is a composer of these authorities, not an additional authority.

## Theory Common Core

Every substantive Theory uses the same common foundation.

```yaml
Theory:
  id:
  name:

  type:
  family:
  tier:
  version:

  summary:

  identity:
    description:
    scope:
    subjectTags: []

  relationships: {}

  knowledge: {}

  tags: {}

  capabilities: {}
  capabilityEnvelope: {}

  graphs: {}
  interactions: []

  receivingGuidance: {}
  analysisGuidance: {}
  researchGuidance: {}
  discoveryGuidance: {}

  fieldGuidance: {}

  failureGuidance: {}
  damageGuidance: {}
  incidentGuidance: {}

  salvageGuidance: {}
  resourceGuidance: {}
  physicalConsequences: {}

  compositionGuidance: {}

  evidenceGuidance: {}

  narrativeGuidance: {}

  extension: {}
```

Possible Theory types include:

```text
Technology
Science
Medicine
ProfessionCurriculum
RoomCurriculum
OperationalDoctrine
Culture
FactionPractice
Environment
State
Damage
Hazard
Biology
Material
Security
Infrastructure
```

Theory types may add extensions, but they should not create unrelated private schemas unless genuinely necessary.

## Identity

```yaml
identity:
  description:
  scope:
  subjectTags: []
```

Identity describes what the Theory is about.

It does not describe executable requirements.

## Theory Relationships

```yaml
relationships:
  derivesFrom: []
  requiresTheories: []
  supersedes: []

  commonlyAssociatedWith: []
  compatibleWith: []
  incompatibleWith: []

  discoveryPartners: []
```

Meanings:

* `requiresTheories` is a strong semantic dependency.
* `commonlyAssociatedWith` influences generation weighting.
* `compatibleWith` means the combination is semantically valid.
* `incompatibleWith` prevents invalid combinations.
* `discoveryPartners` identifies Theory combinations that may create Discovery opportunities.
* `supersedes` allows later Theory to revise or replace earlier institutional knowledge.

A relationship never automatically grants a missing Theory.

## Semantic Tags

```yaml
tags:
  inherent: []
  possible: []
  implied: []

  incompatible: []

  hiddenByDefault: []

  revealRules: []
```

Tag roles:

* `inherent` describes facts necessarily associated with the Theory.
* `possible` describes states compatible with it.
* `implied` describes semantic consequences that follow when the relevant condition is true.
* `incompatible` prevents invalid combinations.
* `hiddenByDefault` identifies facts normally not initially revealed.

Tags should be semantic facts.

Good:

```text
OVERHEATING
UNPOWERED
SCAVENGED
IMPROVISED_REPAIR
SABOTAGED
```

Bad:

```text
LOOKS_KIND_OF_BROKEN_WITH_BLUE_SPARKS
```

Presentation belongs elsewhere.

## Semantic Capabilities

```yaml
capabilities:
  provides: []
  supportsProcesses: []
  supportsInteractions: []
```

These describe what the Theory makes semantically possible.

They are not executable Recipe requirements.

## Capability Envelope

Each substantive Theory may define the maximum execution capabilities that its own graphs and interactions are allowed to reference.

```yaml
capabilityEnvelope:
  profession:
    allowedTiers: []

  competencies: []

  toolServices: []

  roomServices: []
```

The envelope is an authoring validator.

It is not itself an interaction requirement.

A generator must never interpret the entire envelope as required execution capability.

## Theory Graphs

Every substantive Theory should have a Primary semantic graph.

```yaml
graphs:
  primary:
    nodes: []
    edges: []

  secondary:
    - id:
      purpose:
      nodes: []
      edges: []

  crossTheoryHooks: []
```

### Primary Graph

Represents the minimum critical procedural knowledge defining the Theory.

Any Recipe claiming to implement the core technology or method must contain the relevant Primary semantic requirements.

### Secondary Graphs

Reusable semantic modules such as:

```text
Diagnostics
Maintenance
Manufacturing
Calibration
Containment
Salvage
Installation
Field Application
Medical Treatment
Emergency Response
Operating Procedure
```

Not every Recipe needs every Secondary graph.

### Cross-Theory Graphs

Cross-Theory graphs may combine knowledge from multiple Theories.

They may not exceed the combined capability envelopes of the contributing Theories unless an additional Theory dependency is explicitly declared.

They also may not manufacture missing semantic knowledge.

## Graph Nodes

Theory graph nodes are semantic procedural guidance.

They are not necessarily executable Recipe bubbles.

```yaml
node:
  id:
  process:

  semanticRequirements:
    theories: []
    tagsRequired: []
    tagsForbidden: []

  executionGuidance:
    professionRequirements: []
    competencyRequirements: []
    toolServiceOptions: []
    roomServiceOptions: []

  consequences:
    addTags: []
    removeTags: []
    revealTags: []
    physicalOutputs: []
    knowledgeOutputs: []
```

Recipe generation contextualizes graph nodes into executable work.

## Interactions

Theory may define valid interactions.

```yaml
interactions:
  - id:
    role:

    requires:
      theories: []
      tags: []
      revealedTags: []

    forbiddenBy:
      tags: []

    methodOptions: []

    consequences: []

    executionClass:
```

Possible execution classes may include:

```text
FIELD
ACTION
OPERATIONAL
INCIDENT_INVESTIGATION
INCIDENT_RESOLUTION
RECIPE
```

Theory does not need to choose an execution class when the universal gameplay system should decide it.

## Method Options

```yaml
methodOptions:
  - method:

    profession:
      tier:

    competencyRequirements: []

    toolServices: []

    roomServices: []

    additionalTheoryRequirements: []
```

The target Theory must expose the interaction.

Profession competency does not create universal permission.

For example:

```text
TECHNICAL_REPAIR_I
```

does not mean:

```text
TE1 can repair every object in the game.
```

The object's Theory must establish that technical repair is semantically valid.

## Composition Guidance

```yaml
compositionGuidance:
  preferredIntersections: []

  preferredContextTags: []

  validModifiers: []
  invalidModifiers: []

  weightingRules: []

  propagationRules: []
```

Field generation uses semantic intersection, not random union.

Example:

```text
GENERATOR
+
ABANDONED
```

may yield:

```text
missing access panels
improvised regulator bypass
neglected cooling
salvage opportunity
```

because those meanings intersect coherently.

## Propagation Rules

Containers may influence contained objects.

```yaml
propagationRules:
  - sourceTag:
    targetRole:
    mayImply: []
    probabilityModifier:
```

Example:

```text
FLOODED room
→ contained object may become WET
```

But:

```text
ABANDONED room
```

should not automatically make every object `ABANDONED`.

Some state relationships are deterministic physical propagation.

Others merely change probability.

## State Theory Extension

```yaml
state:
  applicableToTags: []

  incompatibleWithTags: []

  probabilityModifiers: []

  presentationModifiers: []

  capabilityEffects: []

  interactionModifiers: []

  propagationRules: []
```

Examples:

```text
ABANDONED_I
SCAVENGED_I
FLOODED_I
UNPOWERED_I
RECENT_COMBAT_DAMAGE_I
```

Prefer reusable State Theories over duplicated object variants.

## Environment Theory Extension

```yaml
environment:
  commonContents: []

  commonProcesses: []

  commonProblems: []

  likelyHazards: []

  likelyStates: []

  professionRelevance: {}

  objectRoleWeights: {}

  sensoryProfile: []
```

Examples:

```text
HAVEN_MAINTENANCE_I
ANCIENT_CONTROL_ROOM_I
CLP_WAREHOUSE_I
MOYNA_MEDICAL_LAB_I
```

Environment Theories act as semantic containers and generation context.

## Faction Practice Extension

```yaml
factionPractice:
  faction:

  constructionModifiers: []
  maintenanceModifiers: []
  safetyModifiers: []
  documentationModifiers: []
  securityModifiers: []
  ownershipModifiers: []
  presentationModifiers: []
  culturalInterpretations: []
```

Faction Practice modifies context.

Prefer:

```text
STD_GENERATOR_I
+
CLP_INFRASTRUCTURE_I
```

over creating:

```text
CLP_GENERATOR_I
```

unless the CLP design is semantically distinct technology.

## Profession Curriculum Theory Extension

Profession Curriculum is itself a Theory type.

```yaml
professionCurriculum:
  profession:
  tier:

  progression:
    entryState:
    completionState:

  certification:
    nominalHours:
    staminaClass:
    qualificationGraph: []

  competencies: []

  toolCommissioning: {}

  curriculumGuidance:
    commonFieldProblems: []
    commonApproaches: []
    likelyObservations: []
    inappropriateActions: []
    knowledgeBoundaries: []
```

Certification proves competency.

It does not simulate the entire educational process.

## Profession Competencies

Competencies should be reusable semantic method definitions.

```yaml
competency:
  id:

  profession:
  tier:

  methodTags: []

  supports: []

  doesNotGrant: []

  compatibleResolutionTypes: []
```

Competency defines method.

Subject Theory defines domain knowledge.

Neither can replace the other.

## Room Curriculum Extension

```yaml
roomCurriculum:
  commonContents: []
  commonProcesses: []
  commonProblems: []
  likelyHazards: []

  likelyServices: []

  professionRelevance: {}

  fieldEquivalentRoles: []
```

Room Curriculum describes the semantic environment.

Physical Room configuration remains an instance/system concern.

## Narrative Guidance

```yaml
narrativeGuidance:
  vocabulary: []
  tone: []

  knownTerminology: []
  unknownTerminology: []

  avoidClaims: []

  presentationExamples: []
```

Narrative guidance cannot reveal information the SGC does not know.

If Reality contains:

```text
SUBSPACE_PHASE_INVERTER
```

but the SGC does not understand subspace phase inversion, generated text must describe observable behavior rather than naming the mechanism.

## Knowledge Graph vs Theory Graph

These are different systems.

### Theory Graph

Reusable semantic procedural definition.

```text
What can happen?
What relationships are valid?
What procedural knowledge exists?
```

### Knowledge Graph

Runtime epistemic provenance.

```text
What was observed?
What supports what?
What was concluded?
What remains uncertain?
```

Do not merge them.

## Generated Content Standard

Generated content must establish actual semantic Reality before presentation.

Recommended generation sequence:

```text
1. Assemble Theory set.
2. Establish Reality.
3. Validate compatibility.
4. Select semantic intersections.
5. Assert actual tags/state.
6. Establish hidden state.
7. Determine observable clues.
8. Evaluate Unit Profession, stats, and Knowledge.
9. Produce observations and interpretations.
10. Expose valid interactions.
11. Route interactions through established execution systems.
12. Apply physical and Knowledge consequences.
13. Update persistent state.
14. Generate presentation from currently justified Knowledge.
```

The generator must never invent domain behavior outside the active Theory composition.

## Presentation Standard

Presentation is downstream from Reality and Knowledge.

Example:

```text
No useful knowledge:
"The device pulses irregularly."

Observation:
"The pulse repeats roughly every four seconds."

Interpretation:
"The pulse appears tied to a feedback cycle."

Instance Finding:
"The regulator is being destabilized by external field feedback."

Theory known:
"The regulator is showing an external-field coupling instability."
```

Knowledge changes language and interpretation.

It does not retroactively change Reality.

## Current Architectural Standard

The design target remains:

> **A Theory should contain enough truth that generators choose among valid possibilities rather than inventing domain behavior.**

The full gameplay flow is now:

```text
Theory Library
↓
Semantic Truth
↓
Theory Composition
↓
Instance Reality / Tags
↓
Observable Clues
↓
Observation
↓
Profession + Knowledge Interpretation
↓
Candidate Interactions
↓
Universal Gameplay Validation
↓
Appropriate Execution Mechanism
↓
Physical and Knowledge Consequences
↓
New Persistent State
↓
Future Field Encounters / Analysis / Research / Discovery
```

Theory defines what is possible.

Reality defines what is actually happening.

Knowledge defines what the SGC understands.

Recipes and universal gameplay systems determine what the player can actually do about it.

# Clinical State Extensions

These reusable semantic distinctions were exposed by Medic authoring and belong to the universal schema rather than the Medic curriculum alone.

## Treatment State Distinctions

The following are explicitly different:

```text
STABILIZED
≠
TREATED
≠
RECOVERING
≠
RECOVERED
```

Also:

```text
TREATMENT
≠
RECOVERY
```

Example:

```text
INTERNAL_BLEEDING
↓
CIRCULATORY_STABILIZATION
↓
STABILIZED
```

The bleeding may still exist.

Likewise:

```text
FRACTURE
↓
definitive treatment
↓
STABILIZED_FRACTURE
↓
HEALING
↓
HEALED
```

Medical actions should not automatically erase semantically meaningful injuries.

## Functional State

Potential semantic states include:

```text
LIMITED_MOBILITY
REDUCED_FINE_MOTOR_CONTROL
IMPAIRED_VISION
REDUCED_ENDURANCE
COGNITIVE_IMPAIRMENT
DUTY_RESTRICTED
```

These should affect existing Unit systems rather than creating a completely separate disability framework.

## Permanent Consequences

The architecture should permit semantically justified consequences such as:

```text
scar
reduced function
prosthetic requirement
chronic treatment
permanent limitation
```

These can interact compositionally with later technology.

Example:

```text
PERMANENT_LOWER_LIMB_IMPAIRMENT
+
PROSTHETICS_I
→
new treatment options
```

## Architectural Findings From Medic

### 1. Diagnosis Uses the Shared Knowledge System

Diagnosis should remain a medical Interpretation or Instance Finding.

It is not a second truth system.

```text
Reality
≠
Observation
≠
Diagnosis
```

---

### 2. Treatment Can Generate Evidence

Patient response may strengthen, weaken, or complicate a diagnosis.

```text
Treatment
↓
Patient Response
↓
Observation / Evidence
↓
Updated Interpretation
```

---

### 3. Stabilization, Treatment, and Recovery Are Different

```text
STABILIZED
≠
TREATED
≠
RECOVERING
≠
RECOVERED
```

This distinction should remain universal throughout patient gameplay.

---

### 4. Treatment Plan Is a Non-Executing Semantic Object

```text
Treatment Plan
→ organizes valid clinical work
→ individual Recipes execute transitions
```

The plan itself does not allocate Actors or perform actions.

---

### 5. Clinical Care Requirements Are First-Class Knowledge

ME3 may determine what care conditions must exist.

```text
Clinical Care Requirements
≠
Blueprint
≠
Recipe
```

This creates a clean Medic-to-Technician handoff.

---

### 6. Medical and Environmental State Remain Independent

```text
Treat patient
≠
resolve source Incident

Resolve source Incident
≠
cure patient
```

Both may require separate state transitions.

---

### 7. Recovery Is a Real Semantic Process

Treatment may control or correct a condition while healing and functional restoration continue over time.

Recovery should use existing Unit state, Stamina, Health, restrictions, Services, and Recipes rather than becoming a separate medical minigame.

---

### 8. Health and Function Are Not Identical

```text
Health
≠
Function
```

A Unit may survive and recover medically while retaining temporary or permanent functional limitations.

---

### 9. Medic Tier Never Replaces Subject Knowledge

Even ME3 cannot automatically understand:

```text
unknown alien physiology
unknown disease mechanism
unknown pharmacology
unknown parasite
unknown implant
unknown symbiotic interaction
```

Where sufficient knowledge is absent, the correct medical result may be:

```text
supportive care only
unknown etiology
treatment relationship not established
additional Analysis required
scientific investigation required
```

# Reconnaissance Generation and Fog of War

These reusable rules govern how Scout knowledge affects offworld generation, mission bias, operational views, and fog of war without inventing hidden truth.

## ST1 and Existing Offworld Grid

ST1 naturally supports:

```text
current tile understanding
adjacent route assessment
return path verification
local hazard detection
immediate clue state
vertical connection identification
searched-area knowledge
```

ST1 should improve information at the edge of known space.

It should not remove fog of war.

## ST2 and the Offworld Grid

ST2 can enrich grid information with:

```text
likely target tile
likely next route
possible intercept tile
trail confidence
last known movement direction
likely route continuation
```

It should not remove fog of war.

Useful qualitative presentation may be:

```text
North: likely
East: possible
West: unlikely
```

rather than fake numeric certainty.

## ST3 and Mission Generation

ST3 should expose procedural mission approaches from known spatial and operational relationships.

Example Reality:

```text
HOSTAGE_LOCATION
MAIN_ENTRANCE
MAINTENANCE_ACCESS
PATROL_ROUTE
POWER_CONDUIT
ROOFTOP_ACCESS
```

Depending on acquired Knowledge, ST3 may expose options such as:

```text
Approach through maintenance access.
Observe patrol before entry.
Intercept courier away from facility.
Wait for patrol gap.
Use rooftop access.
Search power route for secondary entrance.
```

These should emerge from Reality and Knowledge composition rather than bespoke scripted mission buttons.

## ST3 and the Offworld Grid

Useful overlays may include:

```text
confirmed route
predicted route
last known position
search priority
observation point
likely intercept
volatile hazard
unverified route
information gap
```

The Scout improves the map as an operational decision tool.

The Scout does not reveal the entire map.

## Fog of War Rule

The universal Scout rule should remain:

> Scout modifies the boundary and quality of Knowledge, not the existence of fog of war.

Remote observation reveals what a valid method can physically observe.

Prediction suggests what may exist beyond that boundary.

Neither automatically reveals hidden Reality.

## Architectural Findings From Scout

### 1. Search Coverage Must Be Method-Specific

A location should not simply become globally:

```text
SEARCHED
```

The system must preserve what kind of search was performed.

```text
FIELD_SEARCH_I
SUBSURFACE_SCAN
TECHNICAL_INSPECTION
BIOLOGICAL_SAMPLING
REMOTE_SENSOR_SWEEP
```

may all reveal different layers of the same location.

---

### 2. Observation Does Not Equal Interpretation

```text
Observation
≠
Interpretation
≠
Authoritative hidden Reality
```

Scout should reveal clues progressively without jumping directly to the hidden answer.

---

### 3. Track Identity Is Not Actor Identity

```text
Same trail
≠
known person
```

Movement can be linked across a scene without identifying who caused it.

This is essential for procedural investigations.

---

### 4. Prediction Is Not Revelation

```text
PREDICTION
≠
REALITY
```

Scout predictions are justified operational expectations based on known Evidence and constraints.

They do not force the future or reveal hidden state.

---

### 5. Operational Picture Is a View Over Knowledge

ST3 should not create a second authority layer.

```text
Reality
→
Knowledge Records
→
Operational Picture
```

The picture organizes useful Knowledge.

It does not replace Reality or Knowledge.

---

### 6. Knowledge Freshness Matters

Stable and volatile field Knowledge cannot be treated identically.

```text
Tunnel exists
```

may remain useful indefinitely.

```text
Patrol is in western corridor
```

may become stale almost immediately.

The Knowledge model should support enough metadata to reason about freshness without introducing a large intelligence-decay system.

---

### 7. Reconnaissance Plan Is Non-Executing

```text
Reconnaissance Plan
→
organizes what information should be gathered
→
normal actions and Recipes perform the work
```

It does not allocate Actors or execute actions itself.

---

### 8. Mission Theory May Bias, Not Override

Mission context may influence which valid interpretations or locations are most relevant.

It cannot contradict physical Evidence.

```text
Mission intent
+
Reality
+
Knowledge
=
weighted valid options
```

not:

```text
Mission intent
→
forced answer
```

---

### 9. Scout Improves Decision Quality, Not Omniscience

Scout progression should create richer player choices such as:

```text
which route to take
where to search
whether to trust a trail
where to intercept
whether to spend time gathering more information
which route appears safest
which approach is least observed
which information gap matters most
```

The Profession should not simply expose the correct answer.

---

### 10. Scout Does Not Replace Fog of War

The governing rule is:

> Scout changes the quality and reach of justified Knowledge at the edge of the unknown.

It does not simply remove hidden tiles.

Remote observation requires valid physical capability.

Search requires valid method.

Prediction remains uncertain.

# Combat State Extensions

These reusable semantic distinctions were exposed by Soldier authoring and belong to the shared state and generation vocabulary.

## Engagement State

Combat should preserve meaningful distinctions such as:

```text
ACTIVE
DISENGAGING
INCAPACITATED
SURRENDERED
SECURED
DETAINED
DEAD
```

Exact implementation labels can vary.

The semantic distinctions matter for:

* combat AI;
* custody;
* medical treatment;
* faction consequences;
* mission objectives;
* surrender;
* post-engagement handling.

## Architectural Findings From Soldier

### 1. Weapon and Profession Tool Must Remain Separate

Especially for Soldier:

```text
Weapon
≠
Profession Tool
```

Profession Tools support combat method.

They do not replace physical weapons.

---

### 2. Threat Is an Interpretation

```text
ARMED
≠
HOSTILE
≠
IMMEDIATE_THREAT
```

Threat depends on behavior, context, Knowledge, and state.

This matters for civilians, surrender, Havens, prisoners, and ambiguous encounters.

---

### 3. Combat Produces Evidence

Combat observations should survive the encounter and contribute to later:

```text
Analysis
Investigation
Research
Receiving
enemy understanding
```

Combat is not epistemically disposable.

---

### 4. Engagement State Has Semantic Meaning

The system needs meaningful distinctions between concepts such as:

```text
actively threatening
disengaging
incapacitated
surrendered
secured
detained
dead
```

These states affect combat, custody, medicine, diplomacy, and faction consequence.

---

### 5. Coordinated Combat Still Uses Single-Actor Bubbles

Multi-Unit maneuver must emerge from connected actions and state.

```text
Actor A suppresses
↓
suppression state exists
↓
Actor B moves
```

No executable bubble requires multiple Actors.

---

### 6. Suppression Is Capability and Target Dependent

```text
SUPPRESSION_II
```

does not automatically impose a universal status.

Weapon capability and target Theory determine whether and how suppression matters.

---

### 7. Tactical Control Should Be Semantic

Prefer:

```text
ROUTE_CONTESTED
WITHDRAWAL_ROUTE_THREATENED
OBJECTIVE_ACCESS_CONTROLLED
```

over vague combat-control modifiers.

Semantic state gives generators reusable facts.

---

### 8. Soldier Can Influence Enemy Options Without Controlling Enemy AI

Soldier may make actions:

```text
dangerous
costly
exposed
unattractive
```

without directly selecting the enemy's action.

---

### 9. Tactical Knowledge Is Highly Volatile

Combat findings may become invalid very quickly.

This strengthens the need for Knowledge validity conditions tied to underlying state.

---

### 10. Tactical Requirements Are First-Class Operational Knowledge

SO3 adds:

```text
TACTICAL_REQUIREMENTS
```

to the growing Requirements family.

```text
SC3 → SCIENTIFIC_REQUIREMENTS
ME3 → CLINICAL_CARE_REQUIREMENTS
SO3 → TACTICAL_REQUIREMENTS
```

Each answers:

> What must be true?

None answers:

> How exactly do we execute it?

---

### 11. Tactical Priority, Orders, and Execution Are Separate

```text
Priority
≠
Order
≠
Execution
```

SO3 may determine what matters without bypassing Actor allocation, doctrine, AI, or player control.

---

### 12. Combat Must Be Objective-Centered

The system should support combat objectives such as:

```text
hold
delay
protect
extract
capture
deny
escort
disable
survive
withdraw
```

Enemy elimination is only one possible objective or method.

---

### 13. Tactical Outcome and Mission Outcome Are Different

```text
TACTICAL_OUTCOME
≠
MISSION_OUTCOME
```

A team may lose control of a location but successfully rescue the hostage.

A team may defeat every hostile but destroy the objective.

Both distinctions must survive mission resolution.

---

### 14. Command Depends on Communication and Role

SO3 does not create map-wide command authority.

Direction may depend on:

```text
communication
presence
role
doctrine
organizational assignment
```

Communication and institutional recording remain separate systems.

---

### 15. Tactical Reserve Is Not Base Response

```text
TACTICAL RESERVE
≠
BASE RESPONSE
```

One is part of the current operation.

The other is a dedicated base-level assignment governed by existing availability rules.

---

### 16. Soldier Can Resolve Without Understanding

```text
Unknown threat
↓
Soldier defeats / contains threat
↓
active Incident resolved
↓
mechanism or cause may remain unknown
```

This continues to validate the shared Incident architecture.

---

### 17. Base Soldier Must Preserve Specialization Territory

The ordinary progression is:

```text
SO1:
competent combatant

SO2:
competent engagement controller

SO3:
competent senior tactical leader
```

The specializations remain exceptional:

```text
Marksman:
superior offensive exploitation

Tactician:
superior initiative, coordination, and tempo

Guardian:
superior protection and interception
```

# Agreement and Relationship Extensions

These sections define reusable agreement, negotiation, relationship, breach, dispute, and coalition semantics exposed by Diplomat authoring.

## Agreement as a Semantic Object

A useful conceptual shape is:

```yaml
agreement:
  parties:
    - SGC
    - HAVEN_042

  terms:
    - SGC_MAY_ENTER_FACILITY
    - HAVEN_ENGINEER_MUST_ESCORT
    - HEAVY_WEAPONS_PROHIBITED

  obligations:
    SGC:
      - PROVIDE_REPLACEMENT_POWER_CELLS

    HAVEN_042:
      - PROVIDE_ACCESS

  duration:
    TEMPORARY

  status:
    ACTIVE
```

The exact runtime schema can be finalized later.

The semantic concept is required.

## Negotiation as a Semantic Object

A possible conceptual shape:

```yaml
negotiation:
  parties:
    - SGC
    - HAVEN_042

  issues:
    - id: ACCESS
      status: OPEN

    - id: ARTIFACT_CUSTODY
      status: OPEN

    - id: SECURITY_ESCORT
      status: OPEN

    - id: COMPENSATION
      status: OPEN
```

Each issue may resolve differently.

## Partial Agreements

DI2 should support:

```text
FULL_AGREEMENT
PARTIAL_AGREEMENT
TEMPORARY_AGREEMENT
ISSUE_DEFERRED
NEGOTIATION_FAILED
```

Example:

```text
Agreed:
SGC may inspect artifact on-site.

Not agreed:
SGC may not remove artifact.

Unresolved:
ownership of future Research results.
```

This is much richer than simple success or failure.

## Agreement Preconditions and Performance

Agreements may contain:

```text
conditions
restrictions
durations
termination conditions
```

Later gameplay should be able to evaluate:

```text
FULFILLED
PARTIALLY_FULFILLED
BREACHED
EXPIRED
SUSPENDED
DISPUTED
```

These states derive from actual behavior.

## Breach vs Dispute

Critical distinction:

```text
BREACH
=
agreement term actually not fulfilled

DISPUTE
=
parties disagree whether the obligation was met or what the term meant
```

Example:

```text
Agreement:
Deliver 100 units of Material by sunset.

SGC delivers 100 units.

Haven claims quality is unacceptable.
```

This may be:

```text
PERFORMANCE_DISPUTED
```

rather than automatically:

```text
BREACH
```

## Agreement vs Relationship

Important distinction:

```text
AGREEMENT
≠
TRUST
≠
RELATIONSHIP
```

Hostile parties can reach agreements.

Friendly parties can fail to agree.

Faction reputation should influence context without becoming the whole diplomatic model.

## Relationship vs Reputation

Critical distinction:

```text
RELATIONSHIP
≠
REPUTATION
```

Reputation may summarize perceived past behavior.

A political relationship may include:

```text
interests
dependencies
agreements
obligations
authority
trust
grievances
shared risks
strategic alignment
```

Two Havens with the same reputation score can behave differently because their circumstances differ.

## Coalition Does Not Mean Faction Merger

```text
COALITION
≠
PERMANENT_ALLIANCE
≠
SAME_FACTION
```

Political rivals may cooperate temporarily against a shared problem.

Their ideology remains intact.

## Architectural Findings From Diplomat

### 1. Statements Need Provenance

```text
"Governor says X"
≠
"X is true"
```

Testimony belongs in the shared Evidence architecture.

Diplomat does not require a separate social truth system.

---

### 2. Influence Must Never Become Mind Control

A valid social outcome requires semantic grounds.

```text
Persuasion
+
interest
+
credibility
+
disposition
+
Influence
→
possible voluntary decision change
```

Generic Influence cannot override impossible or hard-constrained requests.

---

### 3. Translation and Cultural Understanding Are Different

```text
Words understood
≠
meaning understood
```

Language capability does not automatically grant Culture Theory.

---

### 4. Authority Needs Scope

Authority should answer:

```text
Who granted it?
Over what?
Where?
For how long?
Under what jurisdiction?
```

Authority is therefore contextual rather than a universal boolean.

---

### 5. Agreements Need Real Terms

Diplomacy becomes systemic when agreements produce actual:

```text
permissions
obligations
restrictions
conditions
durations
```

rather than only reputation change.

---

### 6. Agreement Should Be a Runtime Object

By DI2, Agreement becomes unavoidable as a real semantic object.

It needs enough structure to represent:

```text
parties
terms
permissions
obligations
conditions
duration
authority
status
```

---

### 7. Negotiation Should Support Partial Resolution

Useful outcomes include:

```text
FULL_AGREEMENT
PARTIAL_AGREEMENT
TEMPORARY_AGREEMENT
ISSUE_DEFERRED
```

Not every negotiation should resolve as binary success or failure.

---

### 8. Position and Interest Are Different

```text
POSITION
≠
INTEREST
```

This is a central reason Diplomat competency creates better social options than a raw Influence stat.

---

### 9. Hard Constraints Remain Real

A valid negotiation cannot bargain away:

```text
physical impossibility
legal restriction
faction doctrine
cultural prohibition
authority limit
existing obligation
```

unless another valid action changes the underlying constraint.

---

### 10. Leverage Must Be Grounded in Reality

Diplomatic leverage comes from actual:

```text
resources
capabilities
information
relationships
authority
alternatives
timing
```

not an abstract Diplomat currency.

---

### 11. Bluff Changes Belief, Not Reality

```text
successful Bluff
=
target belief changes
```

The underlying claim does not become true.

This keeps deception compatible with the Reality / Knowledge architecture.

---

### 12. Reputation Should Usually Be Downstream

Prefer primary outputs such as:

```text
agreement
permission
refusal
obligation
commitment
access
temporary pause
breach
fulfilled promise
```

Relationship and reputation consequences should follow from those events.

---

### 13. Agreement and Relationship Are Independent

```text
AGREEMENT
≠
RELATIONSHIP
```

Friendly parties may disagree.

Hostile parties may cooperate where interests align.

---

### 14. Breach and Dispute Are Different

```text
BREACH
≠
DISPUTE
```

Breach concerns actual performance.

Dispute concerns interpretation or Knowledge about performance.

This fits the shared Reality / Knowledge architecture cleanly.

---

### 15. Mediation Does Not Grant Decision Authority

Diplomat may help parties agree.

Binding arbitration requires actual authority.

---

### 16. Diplomatic Requirements Join the Requirements Pattern

The senior Profession pattern now includes:

```text
SC3 → SCIENTIFIC_REQUIREMENTS
ME3 → CLINICAL_CARE_REQUIREMENTS
SO3 → TACTICAL_REQUIREMENTS
DI3 → DIPLOMATIC_REQUIREMENTS
```

A Requirement says:

> What must be true.

It does not say:

> Which exact action must execute.

---

### 17. Agreement and Diplomatic Framework Are Different

```text
AGREEMENT
≠
DIPLOMATIC_FRAMEWORK
```

Agreement binds specific parties to terms.

Framework coordinates multiple agreements and requirements toward a larger objective.

---

### 18. Relationships Need Structure Beyond Reputation

Political behavior may depend on:

```text
dependency
strategic alignment
conflicting interests
treaty obligations
leadership relationships
coalition participation
resource flow
shared threats
```

Reputation may remain useful, but it cannot be the sole authority.

---

### 19. Alignment Should Be Issue-Specific

A faction may simultaneously be:

```text
aligned on defense
conflicted on Gate policy
cooperative on medicine
hostile on artifact custody
```

This should be normal rather than exceptional.

---

### 20. Commitment Conflict Needs Pre-Commit Validation

Preferred behavior:

```text
new proposed agreement
↓
existing obligations checked
↓
conflicts identified
↓
player decides
↓
transaction commits only if valid
```

This mirrors validation used elsewhere in the game architecture.

---

### 21. Agreement Parties Need Institutional Identity

Agreements may bind:

```text
individual
office
Haven
faction
organization
coalition
```

Leadership change should therefore not automatically erase institutional agreements.

---

### 22. Coalition Is Not Faction Conversion

```text
COALITION
≠
FACTION_ALIGNMENT
```

Parties can cooperate without surrendering ideology or identity.

This is especially important for the three-faction campaign architecture.

---

### 23. Diplomatic Position Is Knowledge, Not Guaranteed Future Reality

Political predictions remain:

```text
INTERPRETATION
PREDICTION
OPERATIONAL_KNOWLEDGE
```

They do not pre-roll future faction behavior.

---

### 24. Plans Are Becoming a Cross-Domain Pattern

The Profession pass now shows multiple non-executing semantic planning structures:

```text
Experiment
Treatment Plan
Reconnaissance Plan
Diplomatic Framework
```

They all:

```text
organize intent
define dependencies
identify methods or requirements
do not execute themselves
```

This suggests a shared `Plan` family may eventually be appropriate.

It should not be forced until the broader architecture pass confirms it.

# Technician Curriculum Generation Guidance

This section defines how Technician Curriculum Theory contributes semantic field guidance in addition to certification progression.

## Technician Curriculum as Theory Content

Technician Curriculum Theory is not merely a promotion definition.

It is also a content-generation source.

A Technician Curriculum Theory should provide field guidance describing what a Technician of that tier plausibly:


- notices;

- understands;

- attempts;

- resolves;

- questions;

- recognizes as unsafe;

- recognizes as beyond their competency.



Example TE1 field profile:
 `commonFieldProblems: - damaged machinery - broken power connections - mechanical obstruction - unsafe equipment - fluid leaks - failed controls - improvised systems  commonApproaches: - inspect - diagnose - isolate - repair - bypass - disassemble - stabilize - verify  likelyObservations: - wear - tool marks - incorrect installation - failed components - power routing - abnormal pressure - obvious control faults  inappropriateActions: - advanced scientific interpretation - unknown alien-function deduction - medical diagnosis - sophisticated cryptanalysis `
Higher Technician tiers expand the semantic methods available to the field generator.
