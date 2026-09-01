# Profession Curricula

## Status

**STRUCTURALLY COMPLETE — implementation names and supporting Services may still change**

Profession Curricula are Theory definitions describing trained method.

They do not grant subject knowledge.

A valid Profession action requires the relevant combination of:

```text
Subject Theory
+ Profession competency
+ Tool Service where required
+ Room Service or field context where required
+ valid current state
```

Profession competency never substitutes for missing subject Theory.

## Base Professions

* [Compact Context Handoff](./profession-context-handoff.md)
* [Profession Boundaries](./profession-boundaries.md)
* [Technician](./technician/technician-summary.md)
* [Scientist](./scientist/scientist-summary.md)
* [Medic](./medic/medic-summary.md)
* [Scout](./scout/scout-summary.md)
* [Soldier](./soldier/soldier-summary.md)
* [Diplomat](./diplomat/diplomat-summary.md)

## Progression Pattern

Base Profession progression uses:

```text
Profession0
↓
Tier I
↓
Tier II
↓
Tier III
↓
Specialization or Cross-Path
```

Tier III remains ordinary senior Profession competency.

Specializations must retain distinct exceptional territory and should not simply duplicate base Tier III.

## Profession Curriculum Is a Theory Type

Profession Curriculum should not be a separate disconnected progression data format.

It belongs inside the Theory architecture.

Its unique additions include:

- Profession identity;
- tier;
- qualification graph;
- competency subgraphs;
- certification guidance;
- field role guidance;
- Resolution support.

It still receives normal:

fieldGuidance
professionInteractions
incidentGuidance
composition data

where applicable.

## Curriculum Certification Is Not Training Simulation

Study/practice occurs outside the certification Recipe.

Certification demonstrates readiness.

Do not add:

- mandatory repeated failure;
- hidden random competency rolls;
- dozens of tiny training tasks;
- separate training inventory;
- special Curriculum-only interruption systems.

Use ordinary Recipe mechanics.

## Profession I–III Certification Benchmarks

Current working authoring budgets:

Tier I:
8 nominal operational hours

Tier II:
12 nominal operational hours

Tier III:
12 nominal operational hours currently

Tier III should not automatically become 16 hours merely because it is higher tier.

Difficulty should come through more advanced demonstrations and capability requirements, not necessarily longer duration.

## Profession Tier III Branch Point

At base Profession III, Unit may choose:

- specialization;
- cross-training.

Branch selection creates a Branch0 state before Tier I certification.

Example:

TE3
→ TE3/OV0
→ TE3/OV1

Cross-training uses the target Profession's ordinary Curriculum.

Example:

TE3/SC0

takes the same Scientist I qualification standard as another Scientist candidate.

There is no special Technician-to-Scientist Curriculum unless later explicitly required.

## Theory Authoring Should Preserve Specialization Territory

When writing base Profession or subject Theories, ask:

«Does this capability erase the purpose of a specialization?»

If yes, narrow it.

Specializations should remain qualitatively meaningful.

## Theory Should Not Author Cross-Path Powers

Cross-training emerges from a Unit possessing multiple standard Profession Curricula.

Do not define bespoke powers like:

Technician + Scientist special hidden interaction

unless the semantic intersection genuinely warrants a dedicated Theory or specialization.

The field generator can combine both Profession Theory sets.

# Cross-Profession Knowledge Contract

These sections define the method-versus-domain boundary and summarize the current reference Profession families.

## Profession Curriculum and Subject Theory

Universal rule:

```text
Profession Curriculum
=
METHOD

Subject Theory
=
DOMAIN KNOWLEDGE
```

Neither replaces the other.

Examples:

```text
SC3 + no relevant Theory
does not automatically understand unknown alien physics.

TE3 + no relevant Theory
does not automatically reconstruct unknown scientific function.

ME3 + no relevant biological knowledge
will not automatically understand every alien organism.
```

Unknown science remains unknown until the Knowledge system establishes it.

## Current Profession Reference Families

### Technician

```text
TE1 — Diagnose & Restore
Locate ordinary faults, service, repair, stabilize, restore.

TE2 — Adapt
Characterize, fabricate, modify, integrate, reroute, calibrate.

TE3 — Implement
Design physical implementation from known requirements and principles.
```

Technician progression shorthand:

```text
TE1:
Use the right part.

TE2:
Make or modify the part.

TE3:
Determine what the part or system needs to be.
```

### Scientist

```text
SC1 — Observe & Analyze
What does the evidence show?

SC2 — Model & Test
Why is it behaving this way?

SC3 — Explain & Generalize
What broader principle explains it, and what follows from it?
```

Scientist and Technician together establish the first major cross-Profession handoff:

```text
SC3
Scientific Requirements
↓
TE3
Implementation Design
↓
Recipe
↓
Physical System
```

# Technician-Derived Curriculum Rules

These universal progression, certification, and method-versus-domain rules were established during Technician authoring.

## Unit Progression

Current progression grammar:
 `UT0 ↓ choose Technician  TE0 ↓ Technician XP  TE1 Certification ↓ TE1  ↓ XP + Certification TE2  ↓ XP + Certification TE3  ↓ choose Specialization or Cross-Path  Branch 0 ↓ Branch XP + Certification  Branch I ... `
`TE0` means:


The Unit has committed to the Technician curriculum but is not yet certified as Technician I.


`TE0` does not satisfy `TE1` Profession requirements.

Later branch progression uses the same structural model.

Example:
 `TE3 → TE3/OV0 → TE3/OV1 `
or:
 `TE3 → TE3/SC0 → TE3/SC1 `

## Certification Model

Profession certification represents **certification**, not the full period of education and training.

The Unit is assumed to have:


- studied;

- practiced;

- prepared;

- gained sufficient XP/exposure.



The certification Recipe is the formal demonstration that the Unit can perform at the claimed tier.

Do not simulate coursework through dozens of additional bubbles.

Flavor/log generation may describe richer testing than the bubble system literally executes.

## Nominal Certification Budgets

Current benchmark:
 `Profession I   = 8 nominal hours Profession II  = 12 nominal hours Profession III = 12 nominal hours currently `
These are authoring/work budgets, not guaranteed wall-clock duration.

Actual elapsed time may be reduced by:


- Room bonuses;

- staff bonuses;

- Core effects;

- work-rate modifiers.



Promotion/certification work uses the same **Strenuous** Stamina level as Endurance Training.

Curriculum bubbles do not need special Stamina rules.

## Profession Competency vs Subject Theory

Profession Curriculum provides **method**.

Subject Theory provides **domain knowledge**.

Example:
 `SYSTEM_INTEGRATION_II + SHIELD_THEORY_I `
might justify integrating a known shield system with another understood system.

`SYSTEM_INTEGRATION_II` alone does not tell the Technician how shield physics works.

`SHIELD_THEORY_I` alone does not mean the Unit has the engineering competency to perform the integration.

A valid action emerges from the intersection.

Conceptually:
 `Profession competency + subject Theory + Tool Service + Room Service/context = valid action `
