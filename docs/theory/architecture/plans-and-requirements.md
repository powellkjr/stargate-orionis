# Plans and Requirements

## Status

**EMERGING UNIVERSAL PATTERN**

This document captures cross-Profession semantic patterns exposed during Profession authoring.

Full content will be supplied separately.

Current known Requirements forms include:

```text
SCIENTIFIC_REQUIREMENTS
CLINICAL_CARE_REQUIREMENTS
TACTICAL_REQUIREMENTS
DIPLOMATIC_REQUIREMENTS
```

A Requirement defines conditions that must be true for an objective to remain viable.

```text
Requirement
≠
Recipe
≠
Order
≠
Blueprint
```

Current known non-executing planning structures include:

```text
Experiment
Treatment Plan
Reconnaissance Plan
Diplomatic Framework
```

These organize intent, dependencies, methods, or requirements but do not execute themselves.

Do not create a universal `Plan` runtime schema yet.

# Clinical Plans and Requirements

These non-executing semantic structures organize clinical intent and required conditions. Individual state transitions still execute through universal Recipes.

## Treatment Plan

Treatment Plan should likely be a semantic runtime object.

It may span multiple Recipes and time periods.

Conceptually:

```yaml
treatmentPlan:
  patient:
    UNIT_042

  addresses:
    - BACTERIAL_INFECTION
    - DEHYDRATION

  objectives:
    - CONTROL_INFECTION
    - RESTORE_FLUID_BALANCE

  interventions:
    - ANTIBIOTIC_THERAPY
    - FLUID_REPLACEMENT

  monitoring:
    - TEMPERATURE
    - BLOOD_PRESSURE
    - TREATMENT_RESPONSE

  escalationConditions:
    - RESPIRATORY_DECLINE
    - PERSISTENT_HYPOTENSION
```

The plan does not execute itself.

Individual actions still use universal Recipes/interactions.

This parallels:

```text
Experiment Definition ≠ Recipe
Scientific Requirements ≠ Recipe
Treatment Plan ≠ Recipe
```

## Clinical Care Requirements

Conceptually:

```yaml
clinicalCareRequirements:
  patient: UNIT_042

  objective:
    CORRECT_INTERNAL_INJURY

  requirements:
    - STERILE_SURGICAL_ENVIRONMENT
    - CONTINUOUS_MONITORING
    - BLOOD_REPLACEMENT
    - POST_PROCEDURE_CRITICAL_CARE

  derivedFrom:
    - DIAGNOSIS_042
    - PATIENT_STATE_FINDING_104

  contraindications:
    - UNCONTROLLED_COAGULATION_FAILURE
```

Clinical Care Requirements establish:

```text
What clinical conditions and capabilities must exist
```

not:

```text
How to physically construct them
```

## Recovery Plan

A separate top-level Recovery Plan is probably unnecessary.

Preferred structure:

```text
Treatment Plan
```

with phases such as:

```text
ACUTE
DEFINITIVE
RECOVERY
```

Example:

```yaml
treatmentPlan:
  phase: RECOVERY

  objectives:
    - RESTORE_MOBILITY

  requirements:
    - LIMITED_LOAD
    - PHYSICAL_REHABILITATION
    - FOLLOW_UP_ASSESSMENT
```

# Reconnaissance Plans

A Reconnaissance Plan organizes objectives, information gaps, routes, methods, and contingencies but does not execute itself.

## Reconnaissance Plan

Conceptually:

```yaml
reconnaissancePlan:
  objective:
    DETERMINE_NORTHERN_ACCESS_STATUS

  questions:
    - IS_NORTH_TUNNEL_PASSABLE
    - IS_NORTH_TUNNEL_OCCUPIED

  methods:
    - REMOTE_OPTICAL_OBSERVATION
    - APPROACH_FROM_EAST_RIDGE

  priorities:
    - route_condition
    - hostile_presence

  avoid:
    - known_sensor_zone
```

Reconnaissance Plan joins Treatment Plan and Experiment Definition as a non-executing semantic plan.

Individual work still uses universal Recipes and interactions.

# Tactical Requirements and Handoffs

Tactical Requirements describe conditions necessary for an objective to remain viable. They are operational Knowledge, not orders or self-executing actions.

## Tactical Requirements Are Not Orders

Critical distinction:

```text
TACTICAL_REQUIREMENTS
≠
UNIT ORDERS
≠
RECIPE
```

They state:

> What must be true for the objective to succeed.

Example:

```text
Requirement:
enemy cannot maintain fire on east crossing
```

Possible valid solutions may include:

```text
suppression
destroy weapon
break line of fire
alternate route
disable power
create obstruction
```

The requirement describes the need.

Other systems determine execution.

## Cross-Profession Tactical Handoff

Example:

```text
TACTICAL_REQUIREMENT:
turret must stop covering Gate approach
```

Possible methods:

```text
SO:
suppress or destroy turret

TE:
disable power feed

ST:
find alternate route outside firing arc

DI:
secure stand-down from controlling party

SC:
identify known exploitable vulnerability
```

Soldier establishes the tactical need.

Other Professions may provide valid methods.

# Diplomatic Frameworks and Requirements

Diplomatic Requirements state viability conditions, while a Diplomatic Framework organizes alignment across issues and possible agreements without executing itself.

## Requirements Family

The senior Profession pattern now includes:

```text
SC3 → SCIENTIFIC_REQUIREMENTS
ME3 → CLINICAL_CARE_REQUIREMENTS
SO3 → TACTICAL_REQUIREMENTS
DI3 → DIPLOMATIC_REQUIREMENTS
```

Each answers:

> What conditions must be true for this objective to work?

None is itself:

```text
Recipe
order
blueprint
automatic execution
```

## Diplomatic Requirements vs Agreement

Important distinction:

```text
DIPLOMATIC_REQUIREMENTS
≠
AGREEMENT
```

Requirements say:

> What must be achieved or preserved.

Agreement says:

> What the parties actually committed to do.

Example:

```text
Requirement:
Haven must remain confident SGC will not permanently occupy Gate facility.
```

Possible agreement implementation:

```text
SGC personnel may remain no longer than 48 hours.
```

Multiple agreements may satisfy the same requirement.

## Framework Is Not One Giant Agreement

A framework may contain:

```text
multiple agreements
shared requirements
dependency relationships
common review conditions
```

Conceptually:

```yaml
diplomaticFramework:
  objective: REGIONAL_MEDICAL_NETWORK

  parties:
    - SGC
    - HAVEN_A
    - MOYNA_MEDICAL_DELEGATION
    - CLP_TRANSPORT

  agreements:
    - AGREEMENT_A
    - AGREEMENT_B
    - AGREEMENT_C

  sharedRequirements:
    - GATE_ACCESS_AVAILABLE
    - MEDICAL_NEUTRALITY_RESPECTED
    - TRANSPORT_CORRIDOR_OPEN
```

This is semantic coordination, not a new execution authority.

## Diplomatic Framework as a Plan Object

DI3 introduces another non-executing planning structure:

```text
DIPLOMATIC_FRAMEWORK
```

It:

```text
organizes parties
coordinates agreements
identifies dependencies
defines requirements
```

It does not execute itself.

Individual negotiations, commitments, transfers, and actions still use existing interaction and Recipe systems.

## Plan Family Pattern

The Profession pass now shows several non-executing semantic planning objects:

```text
Experiment
Treatment Plan
Reconnaissance Plan
Diplomatic Framework
```

All of them:

```text
organize intent
define dependencies
identify methods or requirements
do not execute themselves
```

This suggests a possible universal `Plan` family later, but no shared schema needs to be forced yet.
