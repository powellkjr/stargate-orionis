# Established Theory / Pattern / Recipe Content

## Status

**PROVISIONAL SIMULATOR CONTENT SET**

## Authority Resolution

This file is an authored test fixture for the room simulator, not a new universal schema.

- Existing Theory, Knowledge, Recipe, Room Service, and Profession contracts remain authoritative.
- Technology tiers representing an approximate order-of-magnitude capability increase is a simulator calibration assumption, not a globally locked numeric rule.
- `THEORY`, `IMPLEMENTATION_PATTERN`, and `RECIPE` remain distinct as described below.
- Pattern compatibility and Discovery outputs are explicit authored relationships; the simulator must not infer them procedurally.
- Service and Core names explicitly labeled provisional are identifiers for testing only.
- Profession requirements use established ordinary Profession tiers and do not create content-specific powers.

## Purpose

This file contains the currently established content needed to exercise the Theory → Discovery → Hypothesis → Thesis → Pattern → Recipe flow in the room simulator.

This is not the full Theory authoring schema.

It contains only the content currently required to test the progression chain.

---

# 1. Governing Rules

## Technology Tiers

Technology tiers represent approximately an **order-of-magnitude increase in capability**.

A Tier II technology should be thought of as roughly a 10x capability class over Tier I, not a 2x improvement.

The increase may create new:

* material constraints;
* processing constraints;
* environmental constraints;
* safety constraints;
* control requirements;
* operator competency requirements.

Tier II operation generally builds on:

```text
Tier I Theory
+
Tier II infrastructure
+
Tier II Profession competency
```

where appropriate.

---

## Theory vs Pattern

```text
THEORY
What is true.

PATTERN
How a civilization physically realizes known Theory.

RECIPE
How specific known Patterns are physically combined into an object.
```

Patterns are Theory-like institutional Knowledge, but they describe civilization-specific implementation rather than universal scientific truth.

---

## Implicit Patterns

Ordinary civilization-specific Patterns may be implicit in broader manufacturing or construction capability.

They do not necessarily require separate Research.

Example:

```text
HUMAN_ROOM_CONSTRUCTION_II
        ↓ implicitly grants
ordinary Human Tier-II room construction Patterns
```

Likewise, ordinary material-working capability at Tier II is implicit in:

```text
Tier-II Workshop
+
appropriate Tier-II Profession curriculum
```

Do not create separate material-working Knowledge requirements for ordinary Human Tier-II materials.

---

# 2. Theory Definitions

## PULSED_POWER_I

```yaml
id: PULSED_POWER_I
name: Pulsed Power I
type: THEORY
family: PULSED_POWER
tier: 1
```

### Identity

Controlled accumulation, storage, and release of electrical energy as discrete pulses within a Tier-I operating envelope.

### Primary Path

```text
ACCUMULATE
→ STORE
→ CONTROL DISCHARGE
→ DELIVER PULSE
→ RECOVER
```

---

# 3. PULSED_POWER_II

```yaml
id: PULSED_POWER_II
name: Pulsed Power II
type: THEORY
family: PULSED_POWER
tier: 2

derivesFrom:
  - PULSED_POWER_I

supersedes:
  - PULSED_POWER_I
```

### Identity

Pulsed-power behavior at approximately the next order-of-magnitude capability class.

Tier II includes understanding required for safe and repeatable operation under substantially greater energy, power, switching, thermal, and recovery demands.

### Tier-II Concerns

Examples include:

```text
higher current density
greater conductor heating
greater electrical stress
stronger electromagnetic forces
greater switching loads
greater stored-energy hazards
thermal accumulation
repeated-pulse recovery
precise discharge timing
pulse sequencing
load-response compensation
```

### Primary Path

```text
ACCUMULATE
→ STORE
→ SHAPE / SCHEDULE DISCHARGE
→ SYNCHRONIZE
→ DELIVER CONTROLLED PULSE
→ MONITOR LOAD RESPONSE
→ RECOVER / COMPENSATE
→ repeat
```

### Provisional Processing Requirement

```yaml
roomService:
  - PULSED_POWER_PROCESSING_II
```

Exact Core implementation is not yet established.

---

# 4. ELECTROMAGNETIC_ACTUATION_II

```yaml
id: ELECTROMAGNETIC_ACTUATION_II
name: Electromagnetic Actuation II
type: THEORY
family: ELECTROMAGNETIC_ACTUATION
tier: 2
```

### Identity

Controlled use of electromagnetic fields to generate useful mechanical force and motion at Technology Tier II.

### Primary Path

```text
RECEIVE CONTROL INPUT
→ GENERATE FIELD
→ APPLY ELECTROMAGNETIC FORCE
→ PRODUCE CONTROLLED MOTION
→ RETURN / HOLD
```

### Output Concept

```text
CONTROLLED_ELECTROMAGNETIC_FORCE
```

### Provisional Processing Requirement

```yaml
roomService:
  - ELECTROMAGNETIC_PROCESSING_II
```

Exact Core implementation is not yet established.

---

# 5. ELECTROMAGNETIC_ACCELERATION_I

```yaml
id: ELECTROMAGNETIC_ACCELERATION_I
name: Electromagnetic Acceleration I
type: THEORY
family: ELECTROMAGNETIC_ACCELERATION
tier: 1
```

### Identity

Basic understanding that controlled electromagnetic force can be used to accelerate a physical mass.

This Theory is required before an advanced electromagnetic implementation can be interpreted as evidence for:

```text
ELECTROMAGNETIC_ACCELERATION_II
```

A recovered Tier-II object cannot teach the SGC the entire domain from nothing.

---

# 6. ELECTROMAGNETIC_ACCELERATION_II

```yaml
id: ELECTROMAGNETIC_ACCELERATION_II
name: Electromagnetic Acceleration II
type: THEORY
family: ELECTROMAGNETIC_ACCELERATION
tier: 2

derivesFrom:
  - ELECTROMAGNETIC_ACCELERATION_I
```

### Identity

Controlled electromagnetic acceleration at approximately the Tier-II capability envelope.

This includes the relationships necessary to produce predictable acceleration through coordinated electromagnetic force, pulsed-energy delivery, timing, staging, and controlled system response.

### Possible Development Routes

This Theory may be reached through more than one authored path.

#### Horizontal Development

```text
PULSED_POWER_II
+
ELECTROMAGNETIC_ACTUATION_II
        ↓
Hypothesis
        ↓
Thesis
        ↓
Research
        ↓
ELECTROMAGNETIC_ACCELERATION_II
```

#### Vertical Extraction

```text
ELECTROMAGNETIC_ACCELERATION_I
+
qualifying Tier-II physical implementation
        ↓
Analysis
        ↓
Reverse Engineering
        ↓
Hypothesis
        ↓
Thesis
        ↓
Research
        ↓
ELECTROMAGNETIC_ACCELERATION_II
```

---

# 7. HUMAN_MANUFACTURING_II

```yaml
id: HUMAN_MANUFACTURING_II
name: Human Manufacturing II
type: THEORY
family: HUMAN_MANUFACTURING
tier: 2
civilization: HUMAN
```

### Identity

Institutional Human knowledge for manufacturing and integrating ordinary Human Technology Tier-II systems.

This includes ordinary Tier-II material-working competence when used with the appropriate Tier-II Workshop and Profession curriculum.

It does not automatically provide specialized technology-specific processing environments.

---

# 8. HUMAN_ROOM_CONSTRUCTION_II

```yaml
id: HUMAN_ROOM_CONSTRUCTION_II
name: Human Room Construction II
type: THEORY
family: HUMAN_ROOM_CONSTRUCTION
tier: 2
civilization: HUMAN
```

### Identity

Human Technology Tier-II room construction capability.

### Implicit Knowledge Rule

Knowing this Theory should automatically grant ordinary Human room-construction Patterns appropriate to this capability.

Illustrative examples:

```yaml
implicitlyGrants:
  - HUMAN_WALL_PATTERN_II
  - HUMAN_DOOR_PATTERN_II
  - HUMAN_UTILITY_PATTERN_II
  - HUMAN_WORKSPACE_PATTERN_II
```

The exact Pattern list is not yet established.

---

# 9. Implementation Pattern Definitions

## HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II

```yaml
id: HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
name: Human Electromagnetic Accelerator Pattern II
type: IMPLEMENTATION_PATTERN
family: ELECTROMAGNETIC_ACCELERATOR
tier: 2
civilization: HUMAN

requiresTheories:
  - ELECTROMAGNETIC_ACCELERATION_II
  - HUMAN_MANUFACTURING_II
```

### Identity

The reproducible Human Technology Tier-II implementation of electromagnetic acceleration.

This Pattern describes how Humans physically manufacture, assemble, integrate, calibrate, and validate an electromagnetic accelerator.

It does not redefine the underlying physics.

### Primary Implementation Path

```text
FABRICATE FIELD COMPONENTS
        ↓
FABRICATE POWER / CONTROL COMPONENTS
        ↓
ASSEMBLE ACCELERATOR STAGES
        ↓
INTEGRATE POWER + CONTROL
        ↓
ALIGN STAGES
        ↓
CALIBRATE SEQUENCING
        ↓
POWERED VALIDATION
```

### Ordinary Workshop Operations

The following remain within ordinary Human Tier-II Workshop capability:

```text
fabricate support components
assemble accelerator
integrate power and control
general mechanical/electrical integration
```

Typical requirements:

```yaml
actor:
  - TE2

toolService:
  - TET2_MODIFY

roomService:
  - HUMAN_WORKSHOP_II
```

A Tier-II Human Workshop provides the ordinary Tier-II Technician tooling required for these operations.

---

## Specialized Requirement 1

```yaml
roomService:
  - ELECTRODYNAMICS_FABRICATION_II
```

Provided by:

```yaml
core:
  id: ELECTRODYNAMICS_FABRICATION_CORE_II
  provides:
    - ELECTRODYNAMICS_FABRICATION_II
```

### Purpose

Supports fabrication of specialized electrodynamic components that exceed ordinary Human Tier-II general-purpose fabrication.

Examples may include:

```text
precision electromagnetic field components
specialized conductor forming
high-current joining
precision insulation
field-component fabrication
pulse-power assemblies
```

These are examples of the Service envelope, not separate Services.

---

## Specialized Requirement 2

```yaml
roomService:
  - SHIELDED_ELECTRODYNAMICS_TEST_II
```

Provided by:

```yaml
core:
  id: ELECTRODYNAMICS_TEST_CORE_II
  provides:
    - SHIELDED_ELECTRODYNAMICS_TEST_II
```

### Purpose

Supports powered calibration and technical validation of Tier-II electrodynamic systems.

Examples include:

```text
energized system testing
field characterization
stage timing
sequencing calibration
load measurement
controlled powered validation
```

Shielding and instrumentation are treated as one required Room Service where they must exist simultaneously for the operation.

---

## Pattern Role

```yaml
patternComposition:
  providesRoles:
    - PRIMARY_WEAPON_SYSTEM
```

Role matching alone does not automatically create Recipes.

All valid Pattern compositions remain explicitly authored.

---

# 10. HUMAN_ADVANCED_RIFLE_PATTERN

```yaml
id: HUMAN_ADVANCED_RIFLE_PATTERN
name: Human Advanced Rifle Pattern
type: IMPLEMENTATION_PATTERN
family: RIFLE
tier: 2
civilization: HUMAN
```

### Identity

Human Technology Tier-II rifle form-factor implementation knowledge.

`ADVANCED` means Technology Tier II.

It does not imply exotic or special infrastructure by itself.

### Primary Path

```text
FABRICATE STRUCTURAL COMPONENTS
        ↓
FABRICATE FEED / CONTROL COMPONENTS
        ↓
ASSEMBLE RIFLE BODY
        ↓
INTEGRATE PRIMARY WEAPON SYSTEM
        ↓
FIT / ALIGN
        ↓
FUNCTION CHECK
```

### Open Pattern Role

```yaml
patternComposition:
  requiresRoles:
    - PRIMARY_WEAPON_SYSTEM
```

The rifle Pattern does not define what the primary weapon technology is.

Possible technologies could include:

```text
chemical ballistic
electromagnetic accelerator
plasma
directed energy
other compatible systems
```

But compatibility is never inferred from role alone.

---

# 11. Pattern Compatibility Rule

Having:

```text
RIFLE_PATTERN
+
PLASMA_PATTERN
```

does not necessarily mean:

```text
PLASMA_RIFLE_RECIPE
```

and definitely does not imply:

```text
PLASMA_PISTOL_RECIPE
```

Each form factor may impose different constraints such as:

```text
power envelope
thermal envelope
volume
mass
control interface
structural interface
serviceability
```

A valid Recipe exists only where an authored Pattern-composition relationship exists.

Pattern roles and compatibility tags may validate authored relationships, but they do not procedurally create new objects.

---

# 12. Discovery Relationships

## Horizontal EM Acceleration Development

```yaml
id: DISC_EM_ACCELERATION_II_HORIZONTAL

inputs:
  - PULSED_POWER_II
  - ELECTROMAGNETIC_ACTUATION_II

output:
  type: HYPOTHESIS
  id: HYP_EM_ACCELERATION_II_HORIZONTAL
```

---

# 13. Vertical Pulsed Power Development

```yaml
id: DISC_PULSED_POWER_II_VERTICAL

inputs:
  - PULSED_POWER_I

output:
  type: HYPOTHESIS
  id: HYP_PULSED_POWER_II_VERTICAL
```

### Meaning

```text
PULSED_POWER_I
        ↓
attempt next order-of-magnitude capability
        ↓
new material / environment / safety constraints
        ↓
Research
        ↓
PULSED_POWER_II
```

This is the normal development route.

---

# 14. Human EM Accelerator Pattern Development

```yaml
id: DISC_HUMAN_EM_ACCELERATOR_PATTERN_II

inputs:
  - ELECTROMAGNETIC_ACCELERATION_II
  - HUMAN_MANUFACTURING_II

output:
  type: HYPOTHESIS
  id: HYP_HUMAN_EM_ACCELERATOR_PATTERN_II
```

Successful Research establishes:

```text
HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
```

as known.

---

# 15. Coil Rifle Pattern Composition

```yaml
id: DISC_HUMAN_ADVANCED_COIL_RIFLE

inputs:
  - HUMAN_ADVANCED_RIFLE_PATTERN
  - HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II

output:
  type: RECIPE
  id: HUMAN_ADVANCED_COIL_RIFLE_RECIPE
```

This composition requires no additional Hypothesis because no new generalized scientific or implementation principle is being established.

The known Patterns already contain the required implementation knowledge.

---

# 16. Hypothesis Definitions

## Horizontal EM Acceleration Hypothesis

```yaml
id: HYP_EM_ACCELERATION_II_HORIZONTAL
name: Electromagnetic Acceleration II
type: HYPOTHESIS

contributingKnowledge:
  - PULSED_POWER_II
  - ELECTROMAGNETIC_ACTUATION_II

targetKnowledge:
  - ELECTROMAGNETIC_ACCELERATION_II

sourceType:
  - DISCOVERY
```

### Constraint Rule

The Hypothesis inherits relevant parent constraints independently.

Example:

```yaml
roomServices:
  - PULSED_POWER_PROCESSING_II
  - ELECTROMAGNETIC_PROCESSING_II
```

Do not replace those two requirements with a combined emergent Service.

---

# 17. Vertical Pulsed Power Hypothesis

```yaml
id: HYP_PULSED_POWER_II_VERTICAL
name: Pulsed Power II
type: HYPOTHESIS

contributingKnowledge:
  - PULSED_POWER_I

targetKnowledge:
  - PULSED_POWER_II

sourceType:
  - DISCOVERY
```

### Advancement Meaning

The Hypothesis represents attempting approximately the next order-of-magnitude operating envelope.

It builds on Tier-I Theory while requiring whatever Tier-II infrastructure and Profession competency are necessary to operate safely at the target envelope.

The Tier-III bootstrap problem is intentionally unresolved.

---

# 18. Human EM Accelerator Pattern Hypothesis

```yaml
id: HYP_HUMAN_EM_ACCELERATOR_PATTERN_II
name: Human Electromagnetic Accelerator Pattern II
type: HYPOTHESIS

contributingKnowledge:
  - ELECTROMAGNETIC_ACCELERATION_II
  - HUMAN_MANUFACTURING_II

targetKnowledge:
  - HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II

sourceType:
  - DISCOVERY
```

---

# 19. Alien Extraction Hypothesis

## HYP_EM_ACCELERATION_II_EXTRACTION

```yaml
id: HYP_EM_ACCELERATION_II_EXTRACTION
name: Electromagnetic Acceleration II
type: HYPOTHESIS

contributingKnowledge:
  - ELECTROMAGNETIC_ACCELERATION_I

targetKnowledge:
  - ELECTROMAGNETIC_ACCELERATION_II

sourceType:
  - REVERSE_ENGINEERING
```

### Required Previous Theory

This Hypothesis cannot be created unless:

```text
ELECTROMAGNETIC_ACCELERATION_I = KNOWN
```

A Tier-II implementation does not teach the SGC an entire unknown domain from nothing.

---

# 20. Asgard Electromagnetic Rifle Extraction Example

Assume an Asgard rifle physically operates using:

```text
ELECTROMAGNETIC_ACCELERATION_II
```

The Asgard rifle itself does not grant an Asgard implementation Pattern.

Ordinary Asgard implementation Patterns are implicit in the appropriate Asgard fabrication capability.

The recovered rifle instead provides a possible route to the underlying universal Theory.

### Analysis Result

Given:

```text
ELECTROMAGNETIC_ACCELERATION_I = KNOWN
```

Analysis may establish:

```text
This device uses electromagnetic acceleration
beyond the known Tier-I operating envelope.
```

Analysis then identifies the requirement for a safe Tier-II environment before further physical investigation.

Example conceptual requirement:

```text
SAFE_ELECTROMAGNETIC_ENVIRONMENT_II
```

The exact final Service name is not yet established.

---

# 21. Safe Environment Resolution

The required safe environment may itself be an emergent Room Service.

Conceptual example:

```text
SHIELDING_II
+
HIGH_ENERGY_INSTRUMENTATION_II
        ↓
SAFE_ELECTROMAGNETIC_ENVIRONMENT_II
```

If the appropriate Cores physically exist together under the Core composition rules, the Service exists.

If the required supporting Theories/Cores are not yet available, the object may remain blocked indefinitely.

Example state:

```text
Asgard EM Rifle

Analysis:
COMPLETE

Further Work:
BLOCKED

Reason:
Required safe Tier-II electromagnetic environment unavailable.
```

---

# 22. Reverse Engineering

Reverse Engineering is a physical Workshop process.

It is not Research.

The flow is:

```text
Analyzed physical implementation
+
previous-tier Theory
+
safe environment
+
qualified operator
        ↓
REVERSE ENGINEERING
        ↓
SALVAGE
+
HYPOTHESIS CARGO
```

For the Asgard rifle:

```text
ASGARD EM RIFLE
+
ELECTROMAGNETIC_ACCELERATION_I
+
safe Tier-II EM environment
+
TE2
        ↓
REVERSE ENGINEER
        ↓
HYP_EM_ACCELERATION_II_EXTRACTION
+
salvage material
```

The physical rifle is destructively dismantled.

Mass does not disappear.

The resulting salvage must obey normal storage/custody validation.

---

# 23. Asgard Pattern Rule

Do not create:

```text
ASGARD_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
```

as Knowledge extracted from the rifle merely because the rifle was reverse engineered.

Asgard ordinary implementation Patterns are implicit in the relevant Asgard fabrication capability.

Conceptually:

```text
ASGARD_FABRICATION_CORE_II
+
required operator / knowledge
        ↓
ASGARD_FABRICATION_II available
        ↓
implicit Asgard Tier-II implementation Patterns available
```

A finished Asgard object may provide Evidence about universal Theory without granting the manufacturing ecosystem that produced it.

---

# 24. HUMAN_ADVANCED_COIL_RIFLE_RECIPE

```yaml
id: HUMAN_ADVANCED_COIL_RIFLE_RECIPE
name: Human Advanced Coil Rifle
type: RECIPE

knowledgeRequirements:
  - HUMAN_ADVANCED_RIFLE_PATTERN
  - HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II

output:
  object:
    - HUMAN_ADVANCED_COIL_RIFLE
```

---

# 25. Coil Rifle Recipe Graph

## Bubble 1: Fabricate Rifle Components

```yaml
id: FABRICATE_RIFLE_COMPONENTS

actor:
  profession: TE2

toolService:
  - TET2_MODIFY

roomService:
  - HUMAN_WORKSHOP_II
```

---

## Bubble 2: Fabricate Accelerator Components

```yaml
id: FABRICATE_ACCELERATOR_COMPONENTS

actor:
  profession: TE2

toolService:
  - TET2_MODIFY

roomService:
  - ELECTRODYNAMICS_FABRICATION_II
```

---

## Bubble 3: Assemble Rifle Body

```yaml
id: ASSEMBLE_RIFLE_BODY

actor:
  profession: TE2

toolService:
  - TET2_MODIFY

roomService:
  - HUMAN_WORKSHOP_II
```

---

## Bubble 4: Assemble Accelerator

```yaml
id: ASSEMBLE_ACCELERATOR

actor:
  profession: TE2

toolService:
  - TET2_MODIFY

roomService:
  - HUMAN_WORKSHOP_II
```

---

## Bubble 5: Integrate Accelerator

```yaml
id: INTEGRATE_ACCELERATOR

actor:
  profession: TE2

toolService:
  - TET2_MODIFY

roomService:
  - HUMAN_WORKSHOP_II
```

---

## Bubble 6: Calibrate Accelerator

```yaml
id: CALIBRATE_ACCELERATOR

actor:
  profession: TE2

toolService:
  - TET2_MODIFY

roomService:
  - SHIELDED_ELECTRODYNAMICS_TEST_II
```

---

## Bubble 7: Technical Validation

```yaml
id: TECHNICAL_VALIDATION

actor:
  profession: SC2

toolService:
  - SCT2

roomService:
  - SHIELDED_ELECTRODYNAMICS_TEST_II
```

---

## Bubble 8: Field Test

```yaml
id: FIELD_TEST

actor:
  profession: SO1

toolService: null

roomService: null
```

### Purpose

Test the completed rifle under representative ordinary combat use.

This is not advanced tactical doctrine.

Therefore:

```text
SO1
```

is sufficient.

---

# 26. Coil Rifle Recipe Flow

```text
FABRICATE RIFLE COMPONENTS
        ↓
FABRICATE ACCELERATOR COMPONENTS
        ↓
ASSEMBLE RIFLE BODY
        ↓
ASSEMBLE ACCELERATOR
        ↓
INTEGRATE ACCELERATOR
        ↓
CALIBRATE ACCELERATOR
        ↓
TECHNICAL VALIDATION
        ↓
FIELD TEST
        ↓
HUMAN ADVANCED COIL RIFLE
```

---

# 27. Physical Instance Rule

The Recipe creates one persistent physical coil-rifle instance.

The accelerator is not automatically a separate inventory object.

Example partial state:

```yaml
object:
  id: HUMAN_ADVANCED_COIL_RIFLE_INSTANCE_001

recipe:
  HUMAN_ADVANCED_COIL_RIFLE_RECIPE

completedBubbles:
  - FABRICATE_RIFLE_COMPONENTS
  - FABRICATE_ACCELERATOR_COMPONENTS
  - ASSEMBLE_RIFLE_BODY

currentBubble:
  INTEGRATE_ACCELERATOR

progress:
  43
```

Stopping construction does not erase completed progress.

The partial object may be:

```text
stored
moved
damaged
resumed
salvaged
```

under the universal physical-instance rules.

---

# 28. Workshop Tool Rule

A Human Tier-II Workshop provides the ordinary Profession-II Technician Tool Service needed for Workshop operations.

Conceptually:

```text
Tier-II Human Workshop
        ↓
unlimited Group Tool Service:
TET2_MODIFY
```

The Recipe still requires:

```text
TET2_MODIFY
```

The Recipe does not know or care whether the Tool Service comes from:

```text
Actor-equipped tools
or
Workshop Group Tool Service
```

Normal resolution order still applies.

---

# 29. Specialized Coil-Rifle Cores

The Human electromagnetic accelerator Pattern currently derives exactly two specialized Core requirements.

## Electrodynamics Fabrication Core II

```yaml
id: ELECTRODYNAMICS_FABRICATION_CORE_II
tier: 2

provides:
  - ELECTRODYNAMICS_FABRICATION_II
```

## Electrodynamics Test Core II

```yaml
id: ELECTRODYNAMICS_TEST_CORE_II
tier: 2

provides:
  - SHIELDED_ELECTRODYNAMICS_TEST_II
```

These requirements come from the accelerator Pattern, not from arbitrary rifle-specific balancing.

---

# 30. Complete Development Chain

```text
PULSED_POWER_II
+
ELECTROMAGNETIC_ACTUATION_II
        ↓
DISC_EM_ACCELERATION_II_HORIZONTAL
        ↓
HYP_EM_ACCELERATION_II_HORIZONTAL
        ↓
THESIS
        ↓
RESEARCH
        ↓
ELECTROMAGNETIC_ACCELERATION_II
        ↓


ELECTROMAGNETIC_ACCELERATION_II
+
HUMAN_MANUFACTURING_II
        ↓
DISC_HUMAN_EM_ACCELERATOR_PATTERN_II
        ↓
HYP_HUMAN_EM_ACCELERATOR_PATTERN_II
        ↓
THESIS
        ↓
RESEARCH
        ↓
HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
        ↓


HUMAN_ADVANCED_RIFLE_PATTERN
+
HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
        ↓
DISC_HUMAN_ADVANCED_COIL_RIFLE
        ↓
HUMAN_ADVANCED_COIL_RIFLE_RECIPE
        ↓
CONSTRUCTION / VALIDATION
        ↓
HUMAN_ADVANCED_COIL_RIFLE
```

---

# 31. Alternate Vertical Extraction Chain

```text
ELECTROMAGNETIC_ACCELERATION_I
        +
CAPTURED ASGARD EM RIFLE
        ↓
RECEIVING
        ↓
ANALYSIS
        ↓
"Exceeds known EM Acceleration I envelope"
        ↓
SAFE TIER-II ENVIRONMENT REQUIRED
        ↓
REVERSE ENGINEERING
        ↓
HYP_EM_ACCELERATION_II_EXTRACTION
        +
SALVAGE
        ↓
THESIS
        ↓
RESEARCH
        ↓
ELECTROMAGNETIC_ACCELERATION_II
```

Both routes establish the same:

```text
ELECTROMAGNETIC_ACCELERATION_II
```

There is no separate Human or Asgard version of the universal Theory.

---

# 32. Room Responsibility Summary

```text
DATA STORAGE / DISCOVERY
Known Theory / Pattern combinations
→ authored Hypothesis or Recipe relationship

RESEARCH
Hypothesis
→ Thesis
→ generalized institutional Theory / Pattern Knowledge

RECEIVING
Physical object
→ safe handling + broad classification

ANALYSIS
Physical object
→ observations + interpretation + further-work requirements

WORKSHOP
Physical object
→ manufacture / modify / repair / reverse engineer / salvage
```

Cores and Services expand what a Room can do within its category.

They do not change the Room into another Room type.

---

# 33. Simulator Content IDs

## Theories

```text
PULSED_POWER_I
PULSED_POWER_II
ELECTROMAGNETIC_ACTUATION_II
ELECTROMAGNETIC_ACCELERATION_I
ELECTROMAGNETIC_ACCELERATION_II
HUMAN_MANUFACTURING_II
HUMAN_ROOM_CONSTRUCTION_II
```

## Patterns

```text
HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
HUMAN_ADVANCED_RIFLE_PATTERN
```

## Hypotheses

```text
HYP_PULSED_POWER_II_VERTICAL
HYP_EM_ACCELERATION_II_HORIZONTAL
HYP_EM_ACCELERATION_II_EXTRACTION
HYP_HUMAN_EM_ACCELERATOR_PATTERN_II
```

## Discovery Relationships

```text
DISC_PULSED_POWER_II_VERTICAL
DISC_EM_ACCELERATION_II_HORIZONTAL
DISC_HUMAN_EM_ACCELERATOR_PATTERN_II
DISC_HUMAN_ADVANCED_COIL_RIFLE
```

## Recipe

```text
HUMAN_ADVANCED_COIL_RIFLE_RECIPE
```

## Specialized Cores

```text
ELECTRODYNAMICS_FABRICATION_CORE_II
ELECTRODYNAMICS_TEST_CORE_II
```

## Specialized Room Services

```text
ELECTRODYNAMICS_FABRICATION_II
SHIELDED_ELECTRODYNAMICS_TEST_II
```

## Provisional Services Not Yet Fully Authored

```text
PULSED_POWER_PROCESSING_II
ELECTROMAGNETIC_PROCESSING_II
SAFE_ELECTROMAGNETIC_ENVIRONMENT_II
HUMAN_WORKSHOP_II
```

These names are sufficient for simulator testing but should not yet be treated as final production vocabulary unless separately locked.
