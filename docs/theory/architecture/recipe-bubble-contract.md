# Recipe Bubble Contract

## Status

**LOCKED**

This document defines executable Recipe bubbles, requirement resolution, physical-instance persistence, custody, material handling, Services, and operational timing.

## Persistent Physical Instances

Physical objects with Recipes are persistent instances.

Their Recipe state belongs to the object itself.

The Recipe is not just an ephemeral task.

An instance may record:

- complete Recipe graph;
- completed bubbles;
- current bubble;
- partial progress;
- current physical tags;
- revealed tags;
- custody;
- damage;
- Material state;
- Knowledge relationships.

Canceling work does not erase completed physical progress.

Theory authors should assume objects can be:

- partially constructed;
- partially analyzed;
- partially repaired;
- moved;
- stored;
- resumed later.

## Universal Recipe Bubble Contract

Every executable Recipe bubble represents:

«One discrete action performed by one Actor, with at most one Tool Service, in at most one Room Service environment.»

A bubble has three typed requirement slots:

Actor / Profession Requirement: 0–1
Tool Service Requirement:       0–1
Room Service Requirement:       0–1

A Theory graph must not imply bubbles that require:

- multiple Actors in one bubble;
- multiple Tools in one bubble;
- multiple independent Room Services in one bubble.

If multiple Actors are required, author multiple dependent bubbles.

If multiple environmental capabilities must simultaneously exist, they must resolve into one emergent Room Service.

Example:

Plasma Shielding II
+
Sterile Environment II
→ Shielded Sterile Workspace II

Then the bubble requires:

Shielded Sterile Workspace II

not two Room Services.

## Tools Are Services, Not Recipe Identities

Recipes should require Tool Service tags.

Do not require physical tool product names.

Example:

Correct:

requires Tool Service:
PS2

Not:

requires:
Plasma Tools II

A physical Tool may expose:

TET1
TET2
TET3
PS1
PS2
CNC1
INSPECTION1

The resolver cares about the exposed Services, not the object's branded identity.

## Personal Tools and Group Tools

Automatic Tool resolution currently searches:

1. Actor's equipped personal Tools;
2. available Tool Services belonging to the joined Room Group.

Locker equipment does not automatically satisfy a Recipe.

Storage equipment does not automatically satisfy a Recipe.

Those may appear as player suggestions.

Theory authors should not assume:

«“The SGC owns this tool somewhere, therefore the Recipe can automatically use it.”»

## Room Services Are Environments

Recipes should require Room Services rather than physical Core identity.

Correct:

STERILE_ENVIRONMENT_II

Not:

Medical Core II

A Core exists physically.

The Room/Core Set exposes Services.

The Recipe requires the Service.

## Room Services Do Not Borrow Across Groups

Room Service resolution is confined to the joined Room Group.

Automatic search:

1. current child room;
2. another child room within the same Group.

A Service in another unrelated Room Group does not automatically satisfy the bubble.

The system may suggest moving the project or reconfiguring infrastructure.

Theory authors should not assume arbitrary base-wide environmental capability sharing.

## Joined Room Rules Relevant to Theory

Physical rooms never merge into a single physical record.

Joined rooms form a persistent Group.

Valid standard footprints:

1×1
1×2
2×2

Invalid finished joins include:

1×3
L-shaped 3-room group
arbitrary shapes

Each physical room retains its own Core Set.

Joining shares:

- Actors;
- Group Tool Services;
- operational room grouping.

Joining does not merge Room Services across Core Sets into one giant Core Set.

Emergent Services only arise from Cores within the same Core Set unless specifically defined otherwise by universal rules.

## Services Are Binary Configuration Facts

Ordinary damage does not degrade a Service into fractional capability.

If a Core is installed and provides a Service, that Service remains present unless the provider is actually:

- removed;
- destroyed;
- stolen;
- otherwise no longer configured.

Damage may degrade:

- bonuses;
- efficiency;
- work rate;
- reliability;
- other modifiers;

but not the existence of the Service itself.

Theory authors should not create states such as:

STERILE_ENVIRONMENT_II at 63%

unless a separate universal mechanic is explicitly introduced.

## Admission and Runtime Availability Are Different

A Recipe may be admitted because the organization possesses the required capability even if that capability is temporarily unavailable.

Actor admission may count a qualified Unit who is:

- elsewhere;
- resting;
- committed;
- on Base Response;
- offworld.

Tool/Room Service admission requires configured capability.

An item sitting unused in Storage does not count as configured Service capability.

Theory authors should distinguish:

This operation is impossible with current configuration.

from:

This operation is valid but currently waiting for an available Actor/Tool.

## Automatic Resolution vs Suggestions

There are two conceptual searches:

Authorized Resolution

May allocate resources automatically according to doctrine.

Known Solution

May identify a solution but never changes SGC state.

Suggestions may say:

- a qualified Unit is currently offworld;
- a suitable Tool is in a locker;
- another Room Group contains the required Service;
- a stored Core could provide the Service;
- a different configuration could solve the problem.

Suggestions never automatically:

- recall Units;
- move permanent staff;
- install Cores;
- retrieve locker equipment;
- move the project;
- split/join rooms;
- override Base Response.

Theory authors should not encode automatic behavior that bypasses this distinction.

## Actor Resolution

Automatic Actor resolution currently favors:

1. qualifying permanent staff already local;
2. other available permanent staff in the Room Group;
3. deliberate Local Response personnel.

There is no universal automatic search of every idle Unit in the SGC.

Local Response Units must deliberately be assigned to Response Rooms.

Base Response is not an Actor source.

## Base Response

Base Response removes Units from ordinary availability.

If Base Response claims an executing Unit:

- current bubble freezes;
- Unit may return within the reset window;
- same Actor must return to preserve actor continuity;
- otherwise partial bubble progress resets.

Theory authoring should not assume Base Response supplies emergency labor to ordinary Recipes.

## Actor Continuity Is Sticky Once Work Begins

Before execution begins, Actor assignment is provisional.

A better/local Actor may replace the provisional assignment.

Once the bubble starts:

«Actor identity becomes sticky.»

If the Actor is interrupted, partial work can resume only if the same Actor returns before reset expiry.

Another qualified Actor cannot inherit partially completed personal work.

Completed bubbles remain complete.

## Tools and Room Service Sources Are Replaceable

Unlike Actor identity, the specific Tool or Room Service provider does not need to remain identical.

If the required Tool/Service is temporarily lost, the system may substitute another qualifying source during the reset window.

The capability matters; the physical identity usually does not.

## Whole-Bubble Resolution Before Dispatch

All requirements should resolve before the system dispatches the Actor.

Do not create situations where:

1. Technician walks across the base;
2. arrives;
3. only then game discovers required Tool or Room Service cannot resolve.

Bubble requirement validation happens before operational dispatch.

## Recipe Transaction Model

A bubble is a validated transaction:

Resolve requirements
→ validate transaction
→ execute
→ commit transaction

A bubble may contain transaction data such as:

- inputs consumed;
- outputs produced;
- "% of whole" changed;
- tags added/removed;
- revealed tags;
- Knowledge produced;
- physical instance created;
- custody changed.

Nothing commits unless the resulting state is valid.

## Custody Is Not a Fourth Bubble Requirement

Inventory/custody validation remains separate from:

- Actor;
- Tool Service;
- Room Service.

A bubble may need to produce physical Material.

The system must validate storage/custody capacity before committing that transition.

Do not add:

Storage Requirement

as a fourth bubble slot.

## Material Never Disappears Through “Consume”

Destructive work does not make physical mass vanish.

Examples:

- destructive Analysis;
- disassembly;
- demolition;
- salvage;
- failed manufacturing;

may convert physical state into Material/salvage.

Theory authors must account for resulting physical outputs where appropriate.

## Destructive Analysis Needs Capacity

A destructive Analysis transition that consumes part of an Artifact may generate Material salvage.

The game must ensure capacity exists before the destructive transition commits.

Architecturally this may be handled through:

- reserved expected Material capacity;
- or validation before each destructive transition.

Theory authors should specify expected physical outcomes so custody validation can occur.

## "% of Whole" Is Authored Against the Original Whole

Physical progress may use "% of whole".

This percentage is always relative to the authored whole.

Do not compound percentages against remaining material.

Example:

bubble A consumes 20% of whole
bubble B consumes 30% of whole

means 50% total, not:

20%
then 30% of the remaining 80%

## INV Is Independent of "% of Whole"

Inventory footprint does not necessarily shrink proportionally with physical completion or destruction.

Construction may reserve full required INV until complete.

Salvage objects may retain their INV until remaining physical value reaches zero.

Theory authors should not assume:

50% object remaining = 50% INV

unless that specific container type defines it.

## Construction Is Not Reversible

Before work begins, a Construction Kit may be unpacked back into Materials.

Once work has begun:

«Worked construction cannot simply be reversed into pristine inputs.»

The player must Salvage the partial object.

Theory authors should distinguish:

- unused Material;
- reserved Kit;
- partially worked construction;
- salvage output.

## Salvage Is a Forward Process

Salvage is not inverse construction.

It is its own work path.

Salvage may depend on:

- known Recipe/Theory;
- Profession;
- Tool Service;
- Room Service;
- physical condition;
- revealed knowledge.

Yield can vary.

Salvage never reveals hidden Recipe information merely because something is dismantled.

If the Unit reaches the boundary of known knowledge, salvage may continue under disadvantage or stop depending on the authored situation.

## Storage and Custody Capacity Cannot Be Exceeded

No transition may create an invalid custody state.

The system should reject or wait rather than allowing temporary over-capacity.

Theory authors should ensure physical outputs are explicit enough to allow validation.

## Receiving Is Universal Intake

Recoverable physical objects entering the SGC generally pass through Receiving.

Universal early Receiving work includes:

Determine Handling
Determine Item Class

Typical baseline:

- Handling → Technician involvement;
- Item Class → Scientist involvement.

Receiving answers broad questions:

- Can we safely handle this?
- What broad category is it?
- Where should it go next?

Receiving is not deep Analysis.

A Theory author should provide enough broad semantic information for Receiving to classify the object without revealing deep secrets.

## Handling and Item Class Are Important Tags

Recoverable Recipe/content should expose eventual values for:

HANDLING
ITEM_CLASS

These may initially be unknown.

Examples of Handling implications might include:

- ordinary;
- fragile;
- hazardous;
- biological;
- containment required;
- powered;
- unstable.

Item Class is broad classification, not final identity.

## Data Storage and Recording

Institutional Knowledge depends on database Read/Write Services.

Some work can physically continue during database outages.

If so, work performed while recording is unavailable becomes unrecorded work.

When database capability returns, reconciliation/re-entry is required.

Do not automatically undo physical progress because the database was unavailable.

## Stamina Is a Universal Operational Resource

Current baseline:

100 Stamina ≈ 16 hours active duty
8 hours rest restores normal cycle

Low Stamina increases accident risk.

Theory-specific work should not invent arbitrary Stamina systems where existing room/work intensity already handles it.

Profession certification uses Strenuous work because of the environment, not because every Curriculum bubble carries its own special Stamina cost.

## Action vs Operational Bubble Timescales

Current baseline timescales:

Operational bubble:
~1 hour

Action bubble:
~3 minutes

Operational examples:

- construction;
- fabrication;
- Analysis;
- Research;
- major repair;
- certification.

Action examples:

- Incident Resolution;
- immediate stabilization;
- combat-like intervention;
- inspection under emergency conditions.

Theory graph guidance should be capable of being contextualized onto either timescale where appropriate.

## Do Not Encode Times Everywhere Unless Needed

Theory generally describes semantic work.

Recipe generation determines bubble duration.

Only encode duration-specific guidance where the subject genuinely requires it.

Avoid making every Theory node say:

takes 1 hour

if that duration actually belongs to Recipe generation rules.

## Physical Cores and Services

Cores are physical capability providers.

A Core may expose one or more Services depending on:

- Core identity;
- Core Set;
- room context;
- interactions with other Cores in the same Core Set.

Theory should generally care about the resulting Service, not which physical Core provides it.

## Emergent Services

Multiple Cores within a Core Set may combine into an emergent Service.

This is the correct way to represent an environment requiring multiple simultaneous capabilities.

Example:

Sterility Core
+
Containment Core
→ Sterile Containment Workspace II

A Recipe then requires:

STERILE_CONTAINMENT_WORKSPACE_II

not two environment requirements.

## Theory May Define Relevant Services Without Owning Them

A Plasma Theory might define:

toolServiceEnvelope:
- PS1
- PS2

roomServiceEnvelope:
- PLASMA_SHIELDING_I
- PLASMA_SHIELDING_II

This does not mean the Theory itself creates those Services.

Physical infrastructure does.

The Theory defines when those capabilities are semantically relevant.

## Construction Tier and Core Tier Are Separate

Room Construction Tier and Core Tier are independent concepts.

Theory authors should not assume:

Tier II Theory
requires Construction Tier II

unless actual Room Service requirements imply it.

Capability should flow through Services rather than arbitrary tier matching.

## Thesis Contracts Must Remain Valid

Mounted Research Theses can require a normalized capability envelope.

The player cannot intentionally remove a Service that would invalidate an active contract.

No transactional loophole should allow:

1. remove required Core;
2. briefly invalidate project;
3. install replacement.

If the active Thesis would become invalid even momentarily, the removal is rejected.

Theory authors should define Research requirements clearly enough for this validation.

## Maintenance Uses Universal Recipes

Core installation/removal, construction, major repair, etc. use the same Recipe system.

Theory authors should not create separate maintenance mini-games.

Maintenance queues and priority systems determine when work occurs.

## Maintenance Priority Context

Current broad priority philosophy:

1. current executing/blocked critical work;
2. restore functional damage;
3. queued maintenance;
4. cosmetic work.

Theory may describe what failure means and what repair is required.

It should not invent an independent repair scheduler.

# Schema-Level Execution Constraints

These schema fields constrain how semantic possibilities resolve through Recipes, Services, physical instances, construction, destructive work, custody, and salvage.

## Universal Bubble Contract

One executable Recipe bubble represents:

```text
One discrete action
performed by one Actor
with at most one Tool Service
in at most one Room Service environment.
```

Requirement slots:

```text
Actor Requirement:        0–1
Tool Service Requirement: 0–1
Room Service Requirement: 0–1
```

A bubble may not directly require:

* multiple Actors;
* multiple Tools;
* multiple independent Room Services.

Multiple environmental capabilities must resolve into one emergent Room Service.

Multi-Actor work is represented by connected or dependent bubbles.

## Profession Requirements

Recipe bubbles require ordinary Profession tiers only.

Examples:

```text
TE1
TE2
SC3
ME1
```

Invalid:

```text
TE3/SC1
```

Cross-training is Unit state.

A cross-trained Unit may satisfy either ordinary requirement if qualified.

## Tool and Room Requirements

Recipes require Services, not physical product identities.

Correct:

```text
TET2
STERILE_ENVIRONMENT_II
```

Incorrect:

```text
Advanced Technician Toolkit Model 4
Medical Core II
```

Physical Tools and Cores expose Services.

Theory cares primarily about resulting capability.

## Salvage Guidance

```yaml
salvageGuidance:
  recoverableResources: []

  recoverableComponents: []

  knowledgeModifiers: []

  conditionModifiers: []

  destructiveConsequences: []

  unknownKnowledgeBoundary: []
```

Salvage is a forward process.

It is not reverse construction.

Salvage may depend on:

```text
Known Recipe
Known Theory
Profession
Tool Service
Room Service
Physical condition
Revealed knowledge
```

Salvage does not automatically reveal unknown technology.

## Physical Consequences

```yaml
physicalConsequences:
  possibleTransitions:
    - trigger:

      addTags: []
      removeTags: []

      percentOfWhole:
        consumed:
        converted:

      outputs: []

      custodyValidationRequired:
```

`% of whole` is always authored against the original whole.

It is not compounded against the remaining amount.

`INV` is separate from `% of whole` unless the physical container explicitly defines otherwise.

## Custody and Storage

Custody and storage validation are universal transaction rules.

They are not fourth bubble requirements.

A state transition cannot commit if the resulting state would exceed valid storage or custody capacity.

Destructive transitions that produce Material must either:

* reserve expected Material capacity in advance; or
* validate available capacity before the destructive transition commits.

Temporary overcapacity is not allowed.

## Tool Services

Generic Profession Tools expose Services.

They do not represent every specialist instrument.

Technician progression:

```text
TET1
TET2
TET3
```

Scientist currently has a conceptual progression:

```text
SCT1 — basic observation and measurement
SCT2 — experimental manipulation and multi-channel testing
SCT3 — advanced characterization and critical-test instrumentation
```

The exact Scientist Tool Service names are not yet locked.

Specialized Services may exist independently:

```text
GENETIC_ANALYSIS
SUBSPACE_ANALYSIS
HIGH_ENERGY_SPECTROMETRY
EXOTIC_MATERIAL_CHARACTERIZATION
NEURAL_IMAGING
CNC
ASGARD_FAB
INSPECTION
```

Generic high-tier Profession Tools are not universal capability devices.

## Room Services

Profession Curriculum does not imply a universal room capable of every task.

Different Theory interactions may require different Room Services.

Examples:

```text
GENERAL_ANALYSIS_WORKSPACE_I
STERILE_ANALYSIS_I
ENERGY_ANALYSIS_I
BIOLOGICAL_CONTAINMENT_I
CONTROLLED_TEST_ENVIRONMENT_I
PLASMA_SHIELDING_II
```

Physical Cores expose Room Services.

Recipes require Services, not Core identities.

## Physical Instances

Theory, physical instance, Recipe instance, Knowledge Record, Tool, Cargo, Core, and Service are distinct concepts.

A physical object may contain:

```text
complete Recipe graph
completed bubbles
current bubble
partial bubble progress
actual tags
revealed tags
custody
damage
Material state
Knowledge relationships
```

Canceling work does not erase completed physical progress.

## Construction

Construction is not reversible once work begins.

Before work:

```text
Construction Kit
→ may unpack to Materials
```

After physical construction begins:

```text
Partial object
→ must use Salvage if dismantled
```

Salvage is not inverse construction.

## Destructive Work

Destructive work does not make physical mass disappear.

Examples:

```text
Destructive Analysis
Disassembly
Demolition
Salvage
Failed manufacturing
```

may produce:

```text
Material
Components
Waste
Destroyed physical value
```

Storage/custody rules must validate the output before the transition commits.

# Combat Execution Constraints

These rules preserve the distinction between weapons and Profession Tools and keep coordinated combat compatible with the single-Actor bubble contract.

## Weapon and Profession Tool Separation

Soldier exposes an important equipment distinction:

```text
Weapon
≠
Soldier Tool Service
```

Weapons remain physical equipment with their own capabilities.

A Soldier Tool kit supports combat method and coordination.

It should not abstract away:

```text
rifle
pistol
staff weapon
energy weapon
grenade launcher
alien weapon
melee weapon
```

The equipped weapon determines what attacks or combat effects are physically possible.

Soldier competency determines how the Unit can use those capabilities.

## Coordinated Combat and Bubble Rules

Multi-Unit actions must still respect:

> One executable bubble = one Actor.

A coordinated maneuver may use:

```text
Bubble A:
Soldier suppresses route.

Bubble B:
Second Unit moves while suppression state exists.
```

Never:

```text
Bubble:
Soldier A + Soldier B + Soldier C maneuver together.
```

Coordination exists at the Recipe or encounter level through connected actions and temporary state.

# Multi-Party Negotiation Execution

Multi-party negotiation remains compatible with the one-Actor bubble contract by representing contributions as separate dependent actions.

## Multi-Party Negotiation and Bubble Rules

A negotiation may involve many social participants.

The executable bubble rule still remains:

> One executable bubble has at most one required Actor.

A bubble might represent:

```text
Diplomat presents proposal.
```

Other parties exist as encounter context or through separate interactions.

Do not author one bubble requiring the entire negotiating table as multiple Actors.
