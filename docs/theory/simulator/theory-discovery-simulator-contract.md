# Theory / Discovery / Hypothesis / Thesis Simulator Contract

## Status

**PROVISIONAL SIMULATOR CONTRACT**

## Authority Resolution

This document is a prototype projection of the established Theory architecture. The architecture documents under `../architecture/` remain authoritative.

For this simulator, “all canonical Knowledge exists before play” means that valid definitions and relationships are authored in data before runtime. It does not mean the SGC knows them. Runtime changes institutional Knowledge state and creates persistent Hypothesis and Thesis records.

Where this contract uses a narrower simulator representation than the universal Knowledge model, the narrower shape is an implementation subset rather than a replacement schema.

## Purpose

This simulator slice exists to test the institutional Knowledge flow:

```text
Theory / Pattern Knowledge
        ↓
Discovery
        ↓
Hypothesis Cargo
        ↓
Thesis Record
        ↓
Ready for Research
```

It must also support Hypotheses produced by other systems, such as Reverse Engineering, without requiring those systems to be implemented yet.

The simulator is **not** responsible for inventing Theories, Patterns, Hypotheses, Recipes, or scientific relationships.

All valid content already exists in authored data.

Runtime only changes Knowledge state and creates runtime records such as Hypotheses and Theses.

---

# 1. Core Rules

## 1.1 All canonical Knowledge exists before play

The database contains all:

* Theories
* Implementation Patterns
* Discovery relationships
* valid Hypothesis definitions
* Theory progression relationships
* eventual Research outcomes

Runtime never creates new canonical science.

---

## 1.2 Knowledge state is separate from database existence

A Theory may exist in the database while remaining unknown to the SGC.

Example:

```text
Database:
  ELECTROMAGNETIC_ACCELERATION_I
  ELECTROMAGNETIC_ACCELERATION_II

SGC Knowledge:
  ELECTROMAGNETIC_ACCELERATION_I = KNOWN
  ELECTROMAGNETIC_ACCELERATION_II = UNKNOWN
```

---

## 1.3 Discovery operates on Knowledge

Discovery is a tab associated with Data Storage.

It has up to three input slots.

Inputs may be:

* THEORY
* IMPLEMENTATION_PATTERN

Only `KNOWN` Knowledge may be placed into a Discovery slot.

Discovery does not require:

* Actor
* Profession
* Tool Service
* Room Service

It is an institutional database operation.

---

## 1.4 Discovery relationships are explicitly authored

Matching arbitrary Theory combinations must not generate content.

Example:

```text
PULSED_POWER_II
+
ELECTROMAGNETIC_ACTUATION_II
```

only produces something because an authored Discovery relationship exists for that combination.

---

## 1.5 Discovery may produce either a Hypothesis or a Recipe

Two broad authored results are supported.

### New Knowledge is required

```text
Theory / Pattern inputs
        ↓
Hypothesis
```

The Hypothesis can later create a Thesis.

### No new semantic Knowledge is required

```text
Pattern
+
Pattern
        ↓
Recipe
```

This second output type may be stored in the schema now even if Recipe exposure is not yet implemented in the simulator.

---

# 2. Knowledge Definition

Minimum simulator representation:

```yaml
knowledgeDefinitions:

  - id: PULSED_POWER_I
    name: Pulsed Power I
    type: THEORY
    family: PULSED_POWER
    tier: 1

  - id: PULSED_POWER_II
    name: Pulsed Power II
    type: THEORY
    family: PULSED_POWER
    tier: 2
    derivesFrom:
      - PULSED_POWER_I

  - id: ELECTROMAGNETIC_ACTUATION_II
    name: Electromagnetic Actuation II
    type: THEORY
    family: ELECTROMAGNETIC_ACTUATION
    tier: 2

  - id: ELECTROMAGNETIC_ACCELERATION_I
    name: Electromagnetic Acceleration I
    type: THEORY
    family: ELECTROMAGNETIC_ACCELERATION
    tier: 1

  - id: ELECTROMAGNETIC_ACCELERATION_II
    name: Electromagnetic Acceleration II
    type: THEORY
    family: ELECTROMAGNETIC_ACCELERATION
    tier: 2
    derivesFrom:
      - ELECTROMAGNETIC_ACCELERATION_I

  - id: HUMAN_MANUFACTURING_II
    name: Human Manufacturing II
    type: THEORY
    family: HUMAN_MANUFACTURING
    tier: 2

  - id: HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
    name: Human Electromagnetic Accelerator Pattern II
    type: IMPLEMENTATION_PATTERN
    family: ELECTROMAGNETIC_ACCELERATOR
    civilization: HUMAN
    tier: 2

  - id: HUMAN_ADVANCED_RIFLE_PATTERN
    name: Human Advanced Rifle Pattern
    type: IMPLEMENTATION_PATTERN
    family: RIFLE
    civilization: HUMAN
    tier: 2
```

The simulator does not yet need the full Theory definition.

It only needs identity and relationship information necessary for Knowledge progression.

---

# 3. SGC Knowledge State

Runtime Knowledge state is stored separately from definitions.

Example:

```yaml
knowledgeState:

  PULSED_POWER_I:
    state: KNOWN

  PULSED_POWER_II:
    state: KNOWN

  ELECTROMAGNETIC_ACTUATION_II:
    state: KNOWN

  ELECTROMAGNETIC_ACCELERATION_I:
    state: KNOWN

  ELECTROMAGNETIC_ACCELERATION_II:
    state: UNKNOWN

  HUMAN_MANUFACTURING_II:
    state: KNOWN

  HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II:
    state: UNKNOWN

  HUMAN_ADVANCED_RIFLE_PATTERN:
    state: KNOWN
```

Minimum states:

```text
UNKNOWN
KNOWN
```

Do not add partial Knowledge states until a concrete system requires them.

---

# 4. Implicit Knowledge Grants

Some Knowledge automatically grants other Knowledge because the granted information is inherent in the capability already learned.

Example:

```yaml
knowledgeDefinitions:

  - id: HUMAN_ROOM_CONSTRUCTION_II
    name: Human Room Construction II
    type: THEORY
    family: HUMAN_CONSTRUCTION
    tier: 2

    implicitlyGrants:
      - HUMAN_WALL_PATTERN_II
      - HUMAN_DOOR_PATTERN_II
      - HUMAN_UTILITY_PATTERN_II
      - HUMAN_WORKSPACE_PATTERN_II
```

When:

```text
HUMAN_ROOM_CONSTRUCTION_II
UNKNOWN → KNOWN
```

the simulator recursively resolves:

```text
HUMAN_WALL_PATTERN_II → KNOWN
HUMAN_DOOR_PATTERN_II → KNOWN
HUMAN_UTILITY_PATTERN_II → KNOWN
HUMAN_WORKSPACE_PATTERN_II → KNOWN
```

Rules:

* implicit grants require no Discovery;
* implicit grants require no Hypothesis;
* implicit grants require no Thesis;
* implicit grants require no Research;
* circular grant chains must be rejected during data validation.

Civilization-specific ordinary manufacturing Patterns should generally enter Knowledge through implicit grants rather than being extracted from individual finished objects.

---

# 5. Discovery Relationships

A Discovery relationship is authored database content.

Minimum schema:

```yaml
discoveryRelationships:

  - id: DISC_EM_ACCELERATION_II_HORIZONTAL

    inputs:
      - PULSED_POWER_II
      - ELECTROMAGNETIC_ACTUATION_II

    output:
      type: HYPOTHESIS
      id: HYP_EM_ACCELERATION_II_HORIZONTAL
```

Input order should not matter unless explicitly authored otherwise.

Therefore:

```text
PULSED_POWER_II + ELECTROMAGNETIC_ACTUATION_II
```

and:

```text
ELECTROMAGNETIC_ACTUATION_II + PULSED_POWER_II
```

are the same lookup.

---

# 6. Horizontal Theory Development

Example:

```yaml
- id: DISC_EM_ACCELERATION_II_HORIZONTAL

  inputs:
    - PULSED_POWER_II
    - ELECTROMAGNETIC_ACTUATION_II

  output:
    type: HYPOTHESIS
    id: HYP_EM_ACCELERATION_II_HORIZONTAL
```

If both inputs are `KNOWN`, Discovery exposes the authored relationship.

Selecting it creates Hypothesis Cargo.

---

# 7. Vertical Theory Development

Vertical advancement may use a single known Theory.

Example:

```yaml
- id: DISC_PULSED_POWER_II_VERTICAL

  inputs:
    - PULSED_POWER_I

  output:
    type: HYPOTHESIS
    id: HYP_PULSED_POWER_II_VERTICAL
```

This represents:

```text
PULSED_POWER_I
        ↓
next order-of-magnitude development
        ↓
PULSED_POWER_II
```

Technology tier progression should be treated as approximately an **order-of-magnitude capability increase**, not a doubling.

The detailed physical requirements belong to the Hypothesis/Research contract and later Room Service resolution.

---

# 8. Pattern Development

Patterns use the same Hypothesis → Thesis → Research grammar when genuinely new civilization-specific implementation Knowledge is required.

Example:

```yaml
- id: DISC_HUMAN_EM_ACCELERATOR_PATTERN_II

  inputs:
    - ELECTROMAGNETIC_ACCELERATION_II
    - HUMAN_MANUFACTURING_II

  output:
    type: HYPOTHESIS
    id: HYP_HUMAN_EM_ACCELERATOR_PATTERN_II
```

Eventually successful Research would change:

```text
HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
UNKNOWN → KNOWN
```

---

# 9. Pattern Composition Into Recipe

Some Pattern combinations require no additional Theory.

Example:

```yaml
- id: DISC_HUMAN_ADVANCED_COIL_RIFLE

  inputs:
    - HUMAN_ADVANCED_RIFLE_PATTERN
    - HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II

  output:
    type: RECIPE
    id: HUMAN_ADVANCED_COIL_RIFLE_RECIPE
```

This does **not** create a Hypothesis or Thesis.

The Recipe is exposed because the database already contains a valid authored composition.

Pattern possession alone never procedurally generates Recipes.

---

# 10. Hypothesis Definitions

Hypothesis definitions are canonical authored data.

A runtime Hypothesis Cargo record references one of these definitions.

Example:

```yaml
hypothesisDefinitions:

  - id: HYP_EM_ACCELERATION_II_HORIZONTAL
    name: Electromagnetic Acceleration II

    contributingKnowledge:
      - PULSED_POWER_II
      - ELECTROMAGNETIC_ACTUATION_II

    targetKnowledge:
      ELECTROMAGNETIC_ACCELERATION_II

  - id: HYP_PULSED_POWER_II_VERTICAL
    name: Pulsed Power II

    contributingKnowledge:
      - PULSED_POWER_I

    targetKnowledge:
      PULSED_POWER_II

  - id: HYP_HUMAN_EM_ACCELERATOR_PATTERN_II
    name: Human Electromagnetic Accelerator Pattern II

    contributingKnowledge:
      - ELECTROMAGNETIC_ACCELERATION_II
      - HUMAN_MANUFACTURING_II

    targetKnowledge:
      HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
```

The UI does not necessarily need to display `targetKnowledge` to the player if doing so would reveal information intended to remain unknown.

The simulator may display it in a debug/details panel.

---

# 11. Hypothesis Cargo

Hypothesis is Knowledge Cargo.

It is persistent.

It may sit unused indefinitely.

It is **not** an active Research project.

Runtime schema:

```yaml
hypotheses:

  - instanceId: HYP_INSTANCE_001

    definitionId:
      HYP_EM_ACCELERATION_II_HORIZONTAL

    source:
      type: DISCOVERY
      sourceId: DISC_EM_ACCELERATION_II_HORIZONTAL

    createdAt:
      12345

    state:
      AVAILABLE
```

Minimum states:

```text
AVAILABLE
```

Do not mark it consumed when Research begins.

---

# 12. Hypothesis Constraints

A Hypothesis may carry or derive requirements necessary to investigate it.

These requirements must come from authored parent Theory progression and may not be invented at runtime.

Example conceptual result:

```yaml
requirements:

  knowledge:
    - PULSED_POWER_II
    - ELECTROMAGNETIC_ACTUATION_II

  professions:
    - SC2

  roomServices:
    - PULSED_POWER_PROCESSING_II
    - ELECTROMAGNETIC_PROCESSING_II
```

Important:

If two parent Theories independently require two Room Services:

```text
PULSED_POWER_PROCESSING_II
ELECTROMAGNETIC_PROCESSING_II
```

the Hypothesis retains those requirements independently.

Do **not** replace them with an emergent combined Service.

Emergent capability belongs to physical Reality.

---

# 13. Thesis Records

A Thesis is the persistent database record Research operates on.

A player creates a Thesis by selecting an available Hypothesis and choosing:

```text
START RESEARCH
```

Runtime schema:

```yaml
theses:

  - thesisId: THESIS_001

    hypothesisInstanceId:
      HYP_INSTANCE_001

    hypothesisDefinitionId:
      HYP_EM_ACCELERATION_II_HORIZONTAL

    state:
      READY

    progress:
      completedStages: []

    evidence: []

    findings: []
```

Minimum Thesis states for this simulator:

```text
READY
ACTIVE
COMPLETE
```

If Research execution is not implemented yet, `READY` is sufficient.

---

# 14. Starting a Thesis Does Not Consume the Hypothesis

This is required.

Before:

```text
Hypothesis:
  AVAILABLE
```

After starting Research:

```text
Hypothesis:
  AVAILABLE

Thesis:
  READY
  references Hypothesis
```

The Hypothesis remains institutional Knowledge Cargo.

There is no Hypothesis → Thesis conversion.

There is no transfer operation.

---

# 15. Multiple Theses

For the first simulator implementation, prevent duplicate active Theses from the same Hypothesis unless explicitly enabled later.

Suggested rule:

```text
If an ACTIVE or READY Thesis already references a Hypothesis instance:
    disable START RESEARCH
```

Do not delete the Hypothesis.

---

# 16. External Hypothesis Sources

Discovery is not the only possible source of Hypothesis Cargo.

The simulator should therefore allow a Hypothesis to be instantiated by another system.

Supported source types:

```text
DISCOVERY
REVERSE_ENGINEERING
STORY
MISSION
OTHER
```

Example:

```yaml
hypotheses:

  - instanceId: HYP_INSTANCE_002

    definitionId:
      HYP_EM_ACCELERATION_II_EXTRACTION

    source:
      type: REVERSE_ENGINEERING
      sourceId: ASGARD_EM_RIFLE_INSTANCE_004

    state:
      AVAILABLE
```

The simulator does not need to implement Reverse Engineering yet.

It only needs to prove that an externally created Hypothesis can enter the same Thesis flow.

---

# 17. Alien Technology Extraction Hypothesis

A second vertical route exists for higher-tier Theory.

Example:

```text
Known:
ELECTROMAGNETIC_ACCELERATION_I

Recovered physical object:
Asgard rifle operating using ELECTROMAGNETIC_ACCELERATION_II

Analysis:
"This device exceeds the known
 ELECTROMAGNETIC_ACCELERATION_I envelope."

Safe environment becomes required.

Reverse Engineering:
physical object
→ destructive investigation
→ salvage
→ Hypothesis Cargo
```

The Hypothesis definition might be:

```yaml
- id: HYP_EM_ACCELERATION_II_EXTRACTION
  name: Electromagnetic Acceleration II

  contributingKnowledge:
    - ELECTROMAGNETIC_ACCELERATION_I

  targetKnowledge:
    ELECTROMAGNETIC_ACCELERATION_II

  sourceRequirements:
    type: REVERSE_ENGINEERING
    evidenceClass:
      ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION
```

This tests that two different Hypotheses may ultimately target the same Theory:

```text
HYP_EM_ACCELERATION_II_HORIZONTAL
        ↓

ELECTROMAGNETIC_ACCELERATION_II

        ↑
HYP_EM_ACCELERATION_II_EXTRACTION
```

The resulting Theory is identical.

Only the provenance and eventual Research path differ.

---

# 18. Previous-Tier Requirement for Extraction

A Tier-II physical implementation cannot teach the SGC the entire domain from nothing.

Example:

```text
Captured Asgard EM II rifle
+
ELECTROMAGNETIC_ACCELERATION_I UNKNOWN
        ↓
cannot produce EM II extraction Hypothesis
```

Analysis may still produce observations, but Reverse Engineering cannot produce:

```text
HYP_EM_ACCELERATION_II_EXTRACTION
```

until:

```text
ELECTROMAGNETIC_ACCELERATION_I = KNOWN
```

General rule:

> Extracting Technology Tier N from a physical implementation requires institutional Knowledge of Technology Tier N-1.

---

# 19. Blocked Hypotheses

Hypothesis Cargo may exist even when its Research requirements cannot currently be satisfied.

Example:

```text
HYP_EM_ACCELERATION_II_EXTRACTION

Requires:
  safe Tier-II electromagnetic environment
  appropriate Tier-II operator

Base currently lacks:
  required Room Service
```

The Hypothesis remains:

```text
AVAILABLE
```

The UI should show:

```text
Research unavailable

Missing:
  SAFE_ELECTROMAGNETIC_ENVIRONMENT_II
```

Do not destroy or hide the Hypothesis.

The player may satisfy the requirement later.

---

# 20. Room Service Resolution

For the room simulator, requirements should resolve through existing Room Service rules.

Example:

```text
SHIELDING_II
+
HIGH_ENERGY_INSTRUMENTATION_II
        ↓
SAFE_ELECTROMAGNETIC_ENVIRONMENT_II
```

If the required Cores physically exist in a valid configuration, the emergent Service exists.

Knowledge does not create the Service.

Knowledge determines whether its meaning/use is recognized.

A Hypothesis may therefore sit blocked until the appropriate Cores are installed and the required Service resolves.

---

# 21. Simulator UI

## Knowledge Panel

Show all Knowledge definitions with state:

```text
✓ Pulsed Power I
✓ Pulsed Power II
✓ Electromagnetic Actuation II
✓ Electromagnetic Acceleration I
? Electromagnetic Acceleration II
✓ Human Manufacturing II
? Human EM Accelerator Pattern II
✓ Human Advanced Rifle Pattern
```

For testing, provide a debug control to toggle `KNOWN` / `UNKNOWN`.

This is simulator-only behavior.

---

## Discovery Tab

Three slots:

```text
[ Input 1 ]
[ Input 2 ]
[ Input 3 ]
```

Only known THEORY or IMPLEMENTATION_PATTERN records may be selected.

After selection:

```text
CHECK DISCOVERY
```

Results:

### Valid Hypothesis relationship

```text
Valid relationship found

Create Hypothesis
```

### Valid Recipe relationship

```text
Valid implementation combination found

Recipe:
HUMAN_ADVANCED_COIL_RIFLE_RECIPE
```

### No authored relationship

```text
No known relationship
```

Do not procedurally infer one.

---

## Hypothesis Shelf

Show all runtime Hypothesis Cargo.

Example:

```text
Electromagnetic Acceleration II
Source: Discovery
Inputs:
  Pulsed Power II
  Electromagnetic Actuation II

Status:
Ready for Thesis
```

or:

```text
Electromagnetic Acceleration II
Source: Reverse Engineering

Status:
Blocked

Missing:
  SAFE_ELECTROMAGNETIC_ENVIRONMENT_II
  SC2
```

Button:

```text
START THESIS
```

Enabled only when the admission requirements for starting Research are met.

---

## Thesis Panel

Show persistent Thesis records.

Example:

```text
Electromagnetic Acceleration II

Thesis ID:
THESIS_001

Source Hypothesis:
HYP_INSTANCE_001

State:
READY

Research execution:
Not implemented
```

The important simulator test is that the Thesis is a new persistent record referencing the still-existing Hypothesis.

---

# 22. Required Test Cases

## Test A: Horizontal Discovery

Known:

```text
PULSED_POWER_II
ELECTROMAGNETIC_ACTUATION_II
```

Expected:

```text
Discovery exposes
HYP_EM_ACCELERATION_II_HORIZONTAL
```

---

## Test B: Missing Theory

Known:

```text
PULSED_POWER_II
```

Unknown:

```text
ELECTROMAGNETIC_ACTUATION_II
```

Expected:

```text
Horizontal EM Acceleration relationship cannot be completed.
```

---

## Test C: Vertical Discovery

Known:

```text
PULSED_POWER_I
```

Expected:

```text
Discovery exposes
HYP_PULSED_POWER_II_VERTICAL
```

---

## Test D: Pattern Hypothesis

Known:

```text
ELECTROMAGNETIC_ACCELERATION_II
HUMAN_MANUFACTURING_II
```

Expected:

```text
Discovery exposes
HYP_HUMAN_EM_ACCELERATOR_PATTERN_II
```

---

## Test E: Pattern → Recipe

Known:

```text
HUMAN_ADVANCED_RIFLE_PATTERN
HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
```

Expected:

```text
HUMAN_ADVANCED_COIL_RIFLE_RECIPE exposed
```

No Hypothesis created.

No Thesis created.

---

## Test F: Hypothesis → Thesis

Given:

```text
HYP_INSTANCE_001
state = AVAILABLE
```

When:

```text
START THESIS
```

Expected:

```text
HYP_INSTANCE_001 still exists

THESIS_001 created

THESIS_001.hypothesisInstanceId
=
HYP_INSTANCE_001
```

---

## Test G: External Hypothesis

Inject:

```text
HYP_EM_ACCELERATION_II_EXTRACTION
source = REVERSE_ENGINEERING
```

Expected:

It appears on the same Hypothesis Shelf as Discovery-created Hypotheses and can create a Thesis using the same flow.

---

## Test H: Extraction Requires Previous Tier

Unknown:

```text
ELECTROMAGNETIC_ACCELERATION_I
```

Expected:

Reverse Engineering source is not permitted to instantiate:

```text
HYP_EM_ACCELERATION_II_EXTRACTION
```

Once:

```text
ELECTROMAGNETIC_ACCELERATION_I = KNOWN
```

the authored extraction relationship becomes valid.

---

## Test I: Blocked Requirement

Hypothesis exists.

Required Room Service does not exist.

Expected:

```text
Hypothesis remains AVAILABLE
START THESIS disabled

Reason:
Missing required Room Service
```

When required Core configuration causes the Service to exist:

```text
START THESIS enabled
```

No Hypothesis recreation required.

---

## Test J: Implicit Pattern Grant

When:

```text
HUMAN_ROOM_CONSTRUCTION_II
UNKNOWN → KNOWN
```

Expected:

all authored `implicitlyGrants` Patterns automatically become `KNOWN`.

No Hypotheses or Theses are generated.

---

# 23. Suggested JSON Shape

The Markdown files may be converted directly into data resembling:

```json
{
  "knowledgeDefinitions": [],
  "knowledgeState": {},
  "discoveryRelationships": [],
  "hypothesisDefinitions": [],
  "hypotheses": [],
  "theses": []
}
```

These should remain separate conceptual collections even if the prototype stores them in one JSON file.

---

# 24. Non-Goals

Do not implement yet:

* full Research execution;
* Research bubble graphs;
* detailed Evidence system;
* Analysis execution;
* Reverse Engineering execution;
* salvage calculations;
* partial Knowledge;
* generated Theories;
* generated Hypotheses;
* generated Recipes;
* alien Pattern extraction;
* procedural Pattern compatibility;
* automatic scientific inference;
* full Theory field guidance.

The purpose of this slice is only to prove:

```text
KNOWN KNOWLEDGE
      ↓
AUTHORED RELATIONSHIP
      ↓
HYPOTHESIS CARGO
      ↓
PERSISTENT THESIS
```

while supporting both:

```text
Discovery-created Hypotheses
```

and:

```text
externally-created Hypotheses
```

through the same downstream system.

---

# Governing Principle

> The database determines which Knowledge relationships are valid. Discovery exposes authored relationships between known Knowledge. Hypothesis is persistent Knowledge Cargo. Thesis is a persistent institutional record that references a Hypothesis and is the thing Research operates on.

And for physical technology extraction:

> Analysis determines that an object exceeds known Theory and identifies the safe conditions required for further work. Reverse Engineering physically consumes or dismantles the implementation and can produce salvage plus an authored Hypothesis. Research then operates on that Hypothesis through a Thesis to establish generalized Theory.
