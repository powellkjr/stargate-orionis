# Theory Authoring Contract

## Status

**LOCKED**

This document contains the gameplay rules a future Theory author must understand before creating the rest of the Theory library.`r`n`r`nThe guiding rule is:`r`n`r`n> Theory describes semantic truth and valid possibilities. Existing game systems determine how those possibilities execute.`r`n`r`nA Theory should enrich the universal systems rather than create a private subsystem for itself.

## Universal Design Principle

Do not create a bespoke system when the same behavior can be represented through:

- Theory;
- tags;
- Recipe bubbles;
- Services;
- Profession competency;
- Tool Services;
- Room Services;
- state;
- custody;
- Knowledge;
- incidents;
- field-generation composition.

Prefer reusable semantic definitions.

A Theory should describe:

- what exists;
- what it means;
- what states are possible;
- what knowledge is required;
- what actions are plausible;
- what failures are plausible;
- what other Theories it intersects with.

It should not directly implement special-case gameplay machinery unless no universal system can represent the behavior.

## Theory Graph Nodes Are Semantic Guidance

A Theory's Primary and Secondary graphs are not necessarily literal executable bubble lists.

They describe required semantic processes.

A downstream Recipe may contextualize and package those processes into actual bubbles.

Therefore:

«Competency or Theory subgraph nodes should describe what must happen, not force one node = one bubble.»

This is particularly important for Profession Curriculum Theory.

## Profession Requirements

Recipes require ordinary Profession tiers.

Examples:

TE1
TE2
SC3
ME1

A bubble may never directly require:

TE3/SC1

Cross-training is Unit state, not an authorable requirement.

A cross-trained Unit may satisfy an ordinary Profession requirement if their current progression state qualifies.

## Profession Curriculum Provides Method

Profession knowledge and subject Theory must remain separate.

Example:

TE2
SYSTEM_INTEGRATION_II

provides the engineering method.

SHIELD_THEORY_I

provides knowledge of shields.

Together they may permit shield integration.

Neither alone grants universal permission.

The general relationship is:

Profession competency
+
subject Theory
+
Tool Service
+
Room Service/context
→ valid action

## Profession Curriculum Must Justify Field Capability

If a Profession tier can:

- notice something;
- perform a field action;
- resolve an incident;
- expose a special interaction;

its Curriculum should contain a competency that reasonably supports that capability.

Do not grant unexplained Profession powers through field tables alone.

Example:

If TE1 may use:

LEAK_ISOLATION_I

then TE1 Curriculum must demonstrate Fluid Systems competency.

## Subject Theory Limits Profession Capability

Profession progression does not allow Units to understand unknown domains automatically.

Examples:

A TE3 cannot automatically understand:

- unknown alien physics;
- unknown biological processes;
- unknown computer architecture;
- unknown cultural systems.

A Scientist cannot automatically understand every scientific phenomenon.

A Medic cannot automatically treat every alien organism.

The relevant subject Theory must exist where domain knowledge matters.

## Theory Authoring Order

The library should grow horizontally.

Before authoring many missions, establish broad reusable vocabulary.

Useful early families likely include:

Profession Curricula
basic environments
basic state Theories
basic damage Theories
common infrastructure
common tools/services
basic materials
basic hazards
basic medical states
basic security/control
common power systems
common transport/logistics
faction infrastructure
Ancient/Ancestor technology foundations
alien biological foundations

The goal is enough semantic coverage that early missions can mostly compose existing Theory truth.

## Recommended Authoring Test for Every New Theory

Before considering a Theory complete, ask:

Identity

- What is this?
- Why is it its own Theory rather than tags on another Theory?

Knowledge

- What does the SGC know when this Theory is learned?
- What remains instance-specific?

Tags

- What real tags can it create or imply?
- Which are guaranteed?
- Which are conditional?
- Which can remain hidden?

Composition

- What other Theories naturally combine with it?
- What combinations should be invalid?

Field

- What encounter roles can it play?
- What does each Profession notice?
- What can each Profession plausibly attempt?
- What clues exist before interpretation?

Failure

- How can it fail?
- What damage states make sense?
- What incidents can it create?
- How can those incidents be stopped?

Profession

- What Profession methods apply?
- Does any claimed capability require a Curriculum competency?

Tools

- Which Tool Services are relevant?
- Are these actual Services rather than physical Tool names?

Rooms

- Which Room Services are relevant?
- Does the Theory accidentally require multiple simultaneous Room Services instead of an emergent Service?

Recipes

- What Primary graph defines critical implementation?
- What Secondary graphs are reusable?
- Can its operations be expressed with the universal one-Actor/one-Tool/one-Room-Service bubble model?

Knowledge Progression

- What can Receiving determine?
- What can Analysis reveal?
- What requires Research?
- What future Discoveries might use this Theory?

Physical Consequences

- What is consumed?
- What remains?
- What Material/salvage is produced?
- Could custody capacity block the transition?

Salvage

- What can be recovered?
- What knowledge improves recovery?
- What remains unknown during salvage?

Presentation

- What does it look like?
- What does it sound like?
- What does it smell or feel like?
- How does presentation change once the SGC understands it?

If several of these answers repeatedly have to be invented by downstream generators, the Theory probably needs more semantic guidance.

## Recommended Theory Authoring Principle

The final standard is:

«A Theory should contain enough truth that generators choose among valid possibilities rather than inventing domain behavior.»

The Theory does not need to contain every sentence, Recipe, incident, or mission that can ever involve it.

It should contain the reusable semantic rules from which those things can be produced.

## Immediate Development Sequence

Current intended order:

1. Preserve Technician I–III as the reference Profession Curriculum family.

2. Update/solidify the universal Theory schema from the lessons learned
   while building Technician.

3. Author Scientist I–III.

4. Use Scientist to detect assumptions in the Theory schema that were
   accidentally biased toward physical engineering.

5. Continue the remaining base Professions:
   Medic
   Scout
   Soldier
   Diplomat

6. Build foundational non-Profession Theory families.

7. Build enough reusable Theory vocabulary that the first real Recipe
   can be derived from established semantic definitions.

8. Only then begin scaling bespoke mission/event content.

There are deliberately many Theories to establish before the first Recipe becomes the primary design focus.

The goal is:

«The first Recipe should test the Theory architecture, not define it by accident.»

# Authoring Validation and Player-Attention Rules

These rules constrain when generated content should interrupt the player and define the minimum validation expected of the schema.

## Routine Automation vs Player Judgment

Routine valid actions should generally automate.

Player interruption is appropriate when there is:

```text
Meaningful alternative
Complication
Irreversible consequence
Destructive action
Substantial risk
Faction consequence
Custody decision
Safety decision
Doctrine exception
```

Theory supplies possibilities.

Universal systems determine whether the situation warrants player input.

## Core Validation Rules

The schema should eventually support automated validation for at least the following:

* Theory graphs do not exceed their capability envelope.
* Cross-Theory graphs remain within the combined contributing envelopes unless another Theory is required.
* Cross-Theory composition does not manufacture missing semantic knowledge.
* Profession interactions reference valid Curriculum competencies.
* Profession requirements use ordinary tiers only.
* Tool requirements reference Tool Services.
* Room requirements reference Room Services.
* No Recipe bubble requires more than one Actor, one Tool Service, or one Room Service.
* Revealed tags correspond to actual Reality or valid semantic interpretations.
* Analysis does not create preexisting physical properties.
* Research creates institutional Knowledge rather than silently rewriting instance history.
* Destructive transitions declare physical consequences.
* Material-producing transitions are custody-validatable.
* `% of whole` is based on original whole.
* Salvage does not reveal unknown Theory for free.
* Base Profession capability does not consume specialization territory without explicit intent.
* Generated presentation does not leak unrevealed knowledge.
