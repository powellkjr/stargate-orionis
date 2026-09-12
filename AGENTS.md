# AGENTS.md

## Project

This repository contains a simulator/prototype for a Stargate-themed strategy and base-management game.

The simulator is used to prove architecture before production implementation. Prefer small, explicit changes that preserve the established semantic boundaries below.

## Working Rules

- Do not redesign established systems unless the task explicitly asks for architecture work.
- Do not invent new canonical Theories, Patterns, Recipes, Services, Cores, Professions, tags, or game rules to make an implementation convenient.
- If required data or behavior is missing, report the gap instead of silently creating a new rule.
- Treat JSON fixture content as authored game data, not suggestions to reinterpret.
- Prefer generic reusable systems over item-specific, room-specific, or story-specific code.
- Keep Reality, Knowledge, physical state, execution requirements, and UI presentation separate.
- Do not encode prose-specific logic when a tag, state, Recipe, Service, or existing generic mechanism can represent the behavior.
- Make the smallest change needed for the requested task.
- Preserve existing working behavior unless the task explicitly changes it.
- Run relevant existing tests after implementation.

## Repository Data

Simulator fixture data currently lives under:

```text
room-sandbox/data/
├── theory/
│   └── stargate_theory_simulator_import.json
└── items/
    └── asgard_vs_human_em_rifle_items.json
```

Treat these as simulator fixture packs for now. Do not split them into production content files unless explicitly requested.

## Authority Model

Use these boundaries when deciding where behavior belongs:

```text
THEORY
Semantic truth and valid possibilities.

TAGS / INSTANCE STATE
What is actually true of a specific object or situation.

KNOWLEDGE
What the SGC currently recognizes or understands.

RECIPE
How a valid state transition executes.

SERVICES + PROFESSION
Whether the required execution capability exists.

CUSTODY
Where a physical object currently exists.
```

Do not collapse these layers together.

## Theory Database Rule

All canonical Theories, Implementation Patterns, Recipes, valid Discovery relationships, Research paths, Core definitions, Services, and emergent Service rules exist in authored data before play.

Runtime may change whether the SGC:

- knows something;
- owns something;
- has exposed something;
- has instantiated something;
- can execute something.

Runtime does not procedurally invent canonical science or technology.

## Theory and Pattern

A Theory describes reusable semantic truth.

An `IMPLEMENTATION_PATTERN` describes how a civilization or fabrication ecosystem physically realizes a technology or form factor.

Do not create a Pattern for every Theory.

Do not treat recovering an alien object as automatically granting its civilization's manufacturing Pattern.

## Reality vs Knowledge

Reality exists independently of player knowledge.

An item's `reality` may contain facts that are not present in its `knowledge`.

Analysis normally reveals or interprets existing Reality. It does not create the physical properties being analyzed.

Example:

```text
Asgard rifle Reality:
ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION

SGC Knowledge on initial recovery:
may know none of that yet
```

Never expose hidden Reality merely because data exists in the item definition.

## Physical Items

Physical items are persistent instances.

The same `instanceId` should survive transfer between rooms and processes.

An item may store:

- physical state;
- Reality;
- instance Knowledge;
- custody;
- persistent process state;
- relationships/provenance;
- history for debugging.

Rooms and Recipes operate on the item. The item does not contain room workflow logic.

Do not hard-code:

```text
Asgard Rifle -> Receiving -> Analysis -> Workshop
```

The universal room/process systems should determine whether those operations are valid.

## Custody and Transfer

Transferring an item changes custody. It does not create a new object.

Example:

```text
INCOMING INVENTORY
-> RECEIVING
-> ANALYSIS
-> WORKSHOP
```

must preserve the same physical item instance unless a Recipe explicitly transforms, consumes, splits, or destroys it.

Storage and custody capacity must remain valid. Do not temporarily exceed capacity and fix it later.

## Room Responsibilities

Physical rooms never merge.

Joined rooms form ordered Room Groups, but physical child-room identity remains.

Core Sets remain attached to physical rooms and do not merge when rooms join.

Room types define the category of work performed there.

### Receiving

Subject: physical objects entering SGC custody.

Receiving determines:
- safe handling;
- broad item classification;
- appropriate next routing.

Receiving does not perform deep scientific Analysis.

### Analysis

Subject: physical objects.

Analysis produces:
- observations;
- measurements;
- instance findings;
- further-work requirements.

Analysis does not turn arbitrary physical inventory into institutional Theory.

### Workshop

Subject: physical objects.

Workshop performs:
- construction;
- modification;
- repair;
- fabrication;
- disassembly;
- reverse engineering;
- salvage where appropriate.

Having sophisticated instrumentation does not turn a Workshop into Analysis or Research.

### Research

Subject: a Thesis database record.

Research generalizes or establishes institutional Knowledge.

Do not feed arbitrary physical inventory directly into Research.

### Discovery

Discovery is a Data Storage UI/database operation, not a physical room.

Discovery accepts up to three KNOWN Theory or Pattern inputs and looks up authored relationships.

It may expose:
- a Hypothesis; or
- a concrete Recipe.

It does not procedurally invent relationships.

## Bubble Execution Contract

One executable Recipe bubble represents:

```text
one Actor
with at most one Tool Service
in at most one Room Service environment
```

Each bubble has at most:
- 1 Actor/Profession requirement;
- 1 Tool Service requirement;
- 1 Room Service requirement.

Do not author one bubble requiring multiple Actors, Tools, or independent Room Services.

If multiple Actors are required, use multiple connected bubbles.

If several environmental capabilities must exist simultaneously, they must resolve as one authored/emergent Room Service.

## Admission vs Runtime Resolution

Admission asks whether required capability exists.

Runtime asks whether it is currently available.

Actor admission may count a qualifying Unit that is currently unavailable.

Tool admission requires configured capability, not equipment merely sitting in storage.

Room Service admission requires the Service to exist in the destination Room Group configuration.

## Actor Resolution

Automatic Actor resolution is limited to:
1. qualifying permanent staff local to the destination;
2. other available permanent staff in the same Room Group;
3. eligible Local Response Units assigned to Response Rooms.

Do not automatically search the entire idle roster.

Base Response removes a Unit from ordinary availability.

Once execution starts, Actor identity is sticky. Another Actor cannot inherit that Actor's partial personal work.

## Tool Resolution

Resolve Tool Service from:
1. Actor-equipped personal Tool Service;
2. available Group Tool Service.

Stored locker equipment may be suggested but is not automatically retrieved.

For a Technology Tier-II Workshop, embedded workshop tooling may provide relevant Profession-II Tool Services as unlimited Group Tool Service when authored/configured.

Do not replace a Tool Service requirement with a generic Workshop requirement.

## Room Service Resolution

Room Service resolution stays within the destination Room Group.

Search order:
1. current child room;
2. another qualifying child in the same Group.

Do not borrow Room Services across Room Groups automatically.

Another Room Group may be suggested as a solution.

## Bubble Transactions

Use:

```text
resolve
-> validate
-> execute
-> commit
```

A bubble may:
- consume inputs;
- produce outputs;
- change physical state;
- change percent-of-whole;
- add/remove/reveal tags;
- produce Knowledge;
- create a physical instance;
- change custody.

Do not commit a transition if the resulting state is invalid.

## Construction and Salvage

Construction progress belongs to the persistent physical object.

Completed bubbles remain completed.

Once construction work begins, cancellation does not restore the original Kit automatically.

A partially constructed object must be salvaged through a forward Salvage process.

Salvage is not construction played backward.

Destructive work must preserve physical mass through authored salvage/material outputs where applicable.

## Knowledge Flow

Use this general separation:

```text
Reality exists
-> Analysis reveals evidence/findings
-> Research understands/generalizes
-> Theory becomes institutional Knowledge
```

Observation is not interpretation.

Interpretation is not Theory.

A recovered object is Evidence about a Theory. It does not contain a Theory to extract.

## Hypothesis and Thesis

A Hypothesis is Knowledge Cargo.

It remains available after Research begins.

Starting Research creates a persistent Thesis record referencing the Hypothesis.

The Thesis is the thing operated on by Research.

Do not transform or consume the Hypothesis into the Thesis.

## Current Rifle Test

The current end-to-end simulator test compares:

```text
ASGARD_EM_RIFLE
HUMAN_ADVANCED_COIL_RIFLE
```

Both may physically use:

```text
ELECTROMAGNETIC_ACCELERATION_II
```

but their Knowledge state is deliberately different.

### Asgard Rifle

The recovered Asgard rifle begins as a physical object whose advanced Reality may be largely unknown to the SGC.

It should be suitable for testing:

```text
Incoming Inventory
-> Receiving
-> Analysis
-> Workshop
-> Reverse Engineering
-> Hypothesis
-> Thesis
-> Research
```

Do not automatically grant:

```text
ASGARD implementation Patterns
ELECTROMAGNETIC_ACCELERATION_II Knowledge
```

when the rifle enters inventory.

### Human Coil Rifle

The Human coil rifle is an SGC-manufactured object built from known Human Patterns and known Theory.

Its identity and implementation may therefore already be recognized.

Its current source Recipe is:

```text
HUMAN_ADVANCED_COIL_RIFLE_RECIPE
```

## Coil Rifle Knowledge Chain

Current intended development chain:

```text
PULSED_POWER_II
+
ELECTROMAGNETIC_ACTUATION_II
-> authored Discovery relationship
-> EM Acceleration II Hypothesis
-> Thesis
-> Research
-> ELECTROMAGNETIC_ACCELERATION_II
```

Then:

```text
ELECTROMAGNETIC_ACCELERATION_II
+
HUMAN_MANUFACTURING_II
-> Pattern Hypothesis
-> Thesis
-> Research
-> HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
```

Then:

```text
HUMAN_ADVANCED_RIFLE_PATTERN
+
HUMAN_ELECTROMAGNETIC_ACCELERATOR_PATTERN_II
-> authored Pattern composition
-> HUMAN_ADVANCED_COIL_RIFLE_RECIPE
```

Do not bypass these authored semantic boundaries for implementation convenience.

## Specialized Workshop Services

The current Human electromagnetic accelerator path uses two specialized workshop capabilities:

```text
ELECTRODYNAMICS_FABRICATION_II
SHIELDED_ELECTRODYNAMICS_TEST_II
```

These are separate from ordinary Tier-II Human workshop tooling.

Do not invent additional generic Tier-II material or metalworking Theories merely to support routine Human Tier-II fabrication.

Special/exotic materials may justify separate authored capability.

## Technology Tier

For technological capability, Tier I -> Tier II represents approximately an order-of-magnitude capability-class increase, not a simple +1 or literal stat multiplier.

Higher tiers may therefore introduce new:
- material constraints;
- safety constraints;
- processing constraints;
- precision requirements;
- environmental requirements.

Do not interpret Tier II as simply "better Tier I."

## Profession Boundaries

Current base Profession tiers:

```text
TE1 Diagnose & Restore
TE2 Adapt
TE3 Implement

SC1 Observe & Analyze
SC2 Model & Test
SC3 Explain & Generalize

ME1 Assess, Stabilize & Treat
ME2 Diagnose & Manage
ME3 Integrate & Recover

ST1 Observe, Navigate & Locate
ST2 Track & Predict
ST3 Recon & Exploit

SO1 Fight & Protect
SO2 Control & Maneuver
SO3 Assess & Direct

DI1 Communicate & Influence
DI2 Negotiate & Resolve
DI3 Align & Represent
```

Profession competency does not replace missing subject Theory.

Technician can reconstruct missing implementation when relevant principles are known. Technician does not invent missing scientific knowledge.

Scientists establish justified findings/models. Institutional Research establishes Theory Knowledge.

## When Something Is Unclear

If implementation encounters a conflict or missing rule:

1. inspect the relevant authored fixture or existing code;
2. preserve the authority boundaries above;
3. avoid inventing new canonical behavior;
4. report the ambiguity in the completion summary.

Do not silently reconcile conflicting architecture.

## Completion Reports

For implementation tasks, report:
- files changed;
- behavior added or changed;
- tests run and results;
- any architectural ambiguity encountered;
- any provisional assumption made.

Keep completion reports concise.
