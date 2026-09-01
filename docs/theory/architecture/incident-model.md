# Incident Model

## Status

**ACTIVE ARCHITECTURE**

This document defines how incidents use the shared semantic vocabulary, how detection and resolution work, and how player attention is managed.

## Incidents Use the Same Semantic Vocabulary

Incidents are not a completely separate interaction system.

They may draw from Theory guidance for:

- causes;
- symptoms;
- spread;
- detection;
- Resolution Types;
- escalation;
- aftermath;
- damage;
- field presentation.

The Theory should help answer:

«What kind of incident could this create?»

and:

«What general methods could stop it?»

## Incident Resolution Is Not Repair

Resolving an active Incident may stop the immediate problem without restoring the affected object.

Example:

Incident:
Electrical fire

Resolution:
POWER_ISOLATION_I

After resolution the object may remain:

DAMAGED
INOPERABLE
REQUIRES_REPAIR

Theory authors should distinguish:

stop active hazard

from:

restore underlying system

## Incident Detection States

Current general incident detection model includes:

Hidden
→ Suspected
→ Located

Theory guidance may describe:

- what clues exist while Hidden;
- what makes something Suspected;
- what reveals exact location;
- what Profession can improve detection;
- what sensors or Theory knowledge may help.

## Incident Resolution Types Should Be General Methods

Prefer reusable Resolution Types such as:

POWER_ISOLATION_I
LEAK_ISOLATION_I
TECHNICAL_CONTAINMENT_I

rather than overly domain-specific entries such as:

PLASMA_REACTOR_PIPE_4_SHUTOFF

Subject Theory contextualizes the general method.

This greatly increases composability.

## Theory Should Provide Failure Guidance

Every applicable Theory should describe plausible:

- failure modes;
- damage types;
- leak types;
- escalation patterns;
- symptoms;
- aftermath.

This keeps generated failures grounded in the domain.

Example Generator Theory might include:

failureModes:
- bearing failure
- regulator failure
- fuel interruption
- overheating
- control failure

A Plasma Theory would expose very different failures.

## Damage Guidance Should Be Domain-Reasonable

Theory should prevent generators from creating nonsense damage.

Example:

A mechanical pump might plausibly suffer:

- seizure;
- bearing damage;
- seal failure;
- housing crack.

It should not randomly generate:

- neural trauma;
- cultural contamination;
- cryptographic corruption;

unless another Theory provides the relevant semantic intersection.

## Theory Can Generate Complications

A generated field or base action may expose a complication such as:

- unstable power;
- toxic leak;
- hidden security lock;
- biological contamination;
- structural failure;
- faction ownership dispute.

The complication itself should be grounded in the Theory set.

Exposed complications may interrupt otherwise automatic flow and require player judgment.

## Routine Automation vs Player Judgment

Routine valid actions should generally automate.

The game should interrupt the player when:

- a complication is exposed;
- multiple meaningful alternatives exist;
- irreversible/risky choice exists;
- faction consequence exists;
- custody/safety problem requires decision;
- automatic doctrine does not authorize a solution.

Theory should help generate those meaningful decision points without turning every routine action into a manual choice.

## Do Not Overload the Player

Generated content should respect information pacing.

The player should not receive every possible Theory detail simultaneously.

Theory may contain rich internal semantic truth while presentation reveals only what matters now.

This supports:

- staged Analysis;
- chapter-based story releases;
- progressive Profession understanding;
- increasing Theory knowledge.

# Incident Schema Detail

These sections define the incident lifecycle and the Theory guidance used to generate valid incidents, resolutions, and damage.

## Incident Architecture

Scientist exposed that Incident work needs more structure than a single Resolution category.

The current model is:

```text
DETECTION
↓
INVESTIGATION
↓
RESOLUTION
↓
RESTORATION
```

These are distinct semantic operations.

### Detection

Answers:

```text
Is something wrong?
Where is it?
```

General incident visibility may progress:

```text
Hidden
→ Suspected
→ Located
```

### Investigation

Answers:

```text
What is happening?
What caused it?
What kind of hazard is this?
```

Scientist often contributes strongly here.

### Resolution

Stops or contains the active Incident.

Examples:

```text
POWER_ISOLATION_I
LEAK_ISOLATION_I
TECHNICAL_CONTAINMENT_I
```

### Restoration

Repairs or restores the resulting damaged system.

Stopping an Incident is not the same as repairing its aftermath.

## Incident Guidance

```yaml
incidentGuidance:
  incidentSeeds: []

  detection:
    hiddenClues: []
    suspectedClues: []
    locatingMethods: []

  investigationMethods: []

  supportedResolutionTypes: []

  escalation: []

  aftermath: []

  restorationGuidance: []
```

Theory declares which general methods are semantically applicable.

It does not own the Profession.

## Resolution Types

Resolution Types should be reusable universal methods.

```yaml
resolutionType:
  id:

  methodTags: []

  acceptableCompetencies: []

  requiredContextTags: []

  consequences: []
```

Curriculum grants competencies.

Resolution Type declares acceptable competencies.

Subject Theory declares whether the Resolution Type applies.

Current encounter state determines whether it is useful now.

## Damage Guidance

```yaml
damageGuidance:
  plausibleDamage: []

  damageEffects: []

  revealGuidance: []

  repairImplications: []
```

Damage should usually be represented by reusable Damage or State Theories rather than object-specific duplicated variants.

# Scientist Incident Participation

This section defines Scientist contributions to detection, investigation, resolution, and post-incident knowledge without conflating resolution with repair.

## Scientist and Incidents

Scientist exposed an important universal Incident distinction:

```text
DETECTION
↓
INVESTIGATION
↓
RESOLUTION
↓
RESTORATION
```

Scientist is especially strong in **Investigation**.

Scientist actions may:

* classify a hazard;
* determine causal source;
* characterize an anomaly;
* identify contamination pathways;
* locate the actual mechanism;
* reveal which Resolution Type is appropriate.

Scientist does not need to physically stop every Incident to contribute meaningfully.

Example:

```text
Hidden anomaly
↓
SC1 classification
↓
Hazard category known
↓
SC2 causal investigation
↓
Source established
↓
TE / ME / other Profession resolves active hazard
↓
System or patient restored
```

# Medical Incident Boundaries

These rules separate patient Reality from environmental Incident state and distinguish immediate resolution from treatment and recovery.

## Medic Incident Role

Medic interacts naturally with the universal Incident structure:

```text
DETECTION
↓
INVESTIGATION
↓
RESOLUTION
↓
RESTORATION
```

Example:

```text
Crew member collapses.
↓
Detection:
patient down
↓
Investigation:
medical assessment
↓
Resolution:
immediate stabilization
↓
Restoration:
definitive treatment and recovery
```

These roles may overlap, but they remain semantically distinct.

## Patient State vs Incident State

Patient conditions and environmental Incident state must remain separate.

Example:

```text
Room Reality:
TOXIC_GAS_LEAK

Patient Reality:
TOXIN_EXPOSURE
RESPIRATORY_DISTRESS
```

Medic may:

```text
treat exposure
support respiration
stabilize patient
```

Technician may:

```text
isolate leak
repair system
restore ventilation
```

Treating the patient does not remove:

```text
TOXIC_GAS_LEAK
```

Repairing the leak does not remove:

```text
TOXIN_EXPOSURE
```

This is a universal generation rule.

## Incident Resolution vs Patient Recovery

Likewise:

```text
Incident resolved
≠
all patient consequences resolved
```

Persistent patient Reality may continue after the environmental or hostile Incident is over.

## Multi-Patient Events

Medical events involving several patients should use existing state, Actor allocation, doctrine, and resource systems.

Triage should not become a private medical scheduler.

Conceptually it emerges from:

```text
patient severity
+
available medical capability
+
response doctrine
+
Medic competency
+
time/resources
```

A later reusable triage competency or doctrine interaction may be justified, but not a separate allocation engine.

## Treatment Failure

Treatment outcomes should be semantically grounded.

Potential outcomes include:

```text
EXPECTED_RESPONSE
PARTIAL_RESPONSE
NO_RESPONSE
ADVERSE_RESPONSE
COMPLICATION
CONDITION_WORSENED
```

Outcome should depend on factors such as:

```text
actual condition
treatment relationship
patient state
known contraindications
environment
execution quality
```

rather than arbitrary random failure.

# Scout Incident Participation

This section defines Scout contributions to detecting, investigating, and navigating incidents through the universal Incident model.

## Scout and Incidents

Scout is strongest in:

```text
DETECTION
INVESTIGATION
```

especially when Incident state leaves spatial or movement clues.

Example:

```text
Equipment keeps disappearing.
↓
ST1 finds repeated access signs.
↓
ST2 reconstructs movement.
↓
ST3 identifies systematic counter-recon or route use.
↓
another Profession resolves the underlying Incident.
```

Scout does not need to resolve the root cause to be mechanically important.

# Soldier Incident Participation

These sections define Soldier participation across immediate response, tactical direction, and the universal Incident lifecycle.

## SO1 Incident Role

SO1 is strongest in:

```text
DETECTION
RESOLUTION
```

for violent or security incidents.

Example:

```text
Unknown armed intruder
↓
identify immediate threat
↓
contain / disarm / defeat / force withdrawal
↓
active Incident resolved
↓
cause or identity may still require Investigation
```

A violent Incident can be operationally resolved before it is fully understood.

## SO3 Incident Role

SO3 becomes especially useful when violent Incidents spread across several areas.

Example:

```text
Gate incursion
↓
hostiles enter Gate Room
↓
second group reaches power corridor
↓
staff trapped in medical wing
```

SO1:

```text
fight immediate threats
```

SO2:

```text
control routes and maneuver
```

SO3:

```text
identify decisive problem
set priorities
protect evacuation
direct available combat effort
decide escalation or disengagement
```

## Soldier and Incidents

Soldier commonly contributes to the universal Incident structure:

```text
DETECTION
↓
INVESTIGATION
↓
RESOLUTION
↓
RESTORATION
```

Soldier is especially strong in:

```text
DETECTION
RESOLUTION
```

for active hostile Incidents.

Example:

```text
Unknown defensive machine attacks
↓
Soldier detects and contains threat
↓
active danger ends
↓
Technician or Scientist later determines mechanism
↓
restoration follows
```

Incident resolution does not require complete understanding.

# Diplomatic Incident Participation

These sections define diplomatic de-escalation and participation across the universal Incident lifecycle without erasing unresolved physical threats.

## Deescalation Does Not Remove Physical Threat

Example:

```text
Reality:
armed standoff
```

Diplomat achieves:

```text
TEMPORARY_PAUSE
```

The weapons still exist.

The opposing force may still be dangerous.

Soldier remains relevant.

## DI1 Incident Role

Diplomat may participate in:

```text
DETECTION
INVESTIGATION
RESOLUTION
```

depending on Incident type.

Example:

```text
Two Haven groups enter armed confrontation
↓
communication established
↓
immediate demands identified
↓
temporary ceasefire negotiated
↓
active danger resolves
↓
underlying dispute remains
```

Immediate Incident Resolution does not mean the deeper political cause is gone.

## DI2 Incident Role

DI2 is especially strong in social Incident:

```text
INVESTIGATION
RESOLUTION
```

Example:

```text
Two Havens prepare for armed conflict
↓
DI1 establishes communication
↓
DI2 identifies:
- disputed water access
- debt
- security concern
- treaty conflict
↓
temporary arrangement negotiated
↓
armed Incident resolves
```

The deeper historical dispute may remain.

## DI3 Incident Role

Diplomat III is especially relevant when one Incident threatens broader political relationships.

Example:

```text
SGC damages Scion religious site
↓
TE assesses physical damage
↓
DI1 prevents immediate violence
↓
DI2 negotiates compensation and repair access
↓
DI3 assesses:
- neighboring Haven response
- treaty implications
- faction leadership concerns
- public acknowledgment requirements
- SGC long-term position
```

One event can therefore scale naturally through all three Diplomat tiers.

## Diplomat and Incidents

Diplomat can contribute across the universal Incident structure:

```text
DETECTION
↓
INVESTIGATION
↓
RESOLUTION
↓
RESTORATION
```

Diplomat is especially useful in:

```text
INVESTIGATION
RESOLUTION
```

for social and political Incidents.

Immediate danger can be resolved while deeper disagreement remains unresolved.

# Technician Incident Resolution

These sections define Technician resolution vocabulary and preserve the distinction between resolving an Incident and restoring the underlying object.

## TE1 Incident / Complication Resolution Vocabulary

Current general technical Resolution vocabulary:
 `TECHNICAL_SHUTDOWN_I POWER_ISOLATION_I MECHANICAL_STABILIZATION_I ELECTRICAL_STABILIZATION_I LEAK_ISOLATION_I TECHNICAL_CONTAINMENT_I CONTROL_RECOVERY_I TECHNICAL_BYPASS_I EMERGENCY_REPAIR_I TECHNICAL_ASSESSMENT_I `
These are general technical **methods**.

The relevant subject Theory determines whether those methods apply to a particular incident.

Example:

A TE1 may understand `LEAK_ISOLATION_I`.

That does not automatically mean they can safely isolate a plasma containment leak unless the relevant subject knowledge makes that action valid.

## Technician Curriculum and Incident Resolution

Any Resolution Type attributed to Technician should be justified by a competency present in the relevant Curriculum tier.

Profession Curriculum supplies the **method**.

Subject Theory supplies the **domain applicability**.

Incident Resolution may stop the active problem without permanently repairing the underlying object.

Example:

A TE1 may use:
 `POWER_ISOLATION_I `
to stop an active electrical hazard.

The affected equipment may remain:
 `DAMAGED INOPERABLE REQUIRES_REPAIR `
after the Incident resolves.

Stopping the Incident and repairing the underlying equipment are separate outcomes.
