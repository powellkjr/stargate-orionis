# Knowledge and Evidence Model

## Status

**ACTIVE ARCHITECTURE**

This document defines the separation between reality, revealed information, and institutional knowledge, including how Analysis, Discovery, and Research move information between those layers.

## Reality and Knowledge Are Separate

This is one of the most important architectural rules.

The physical world may contain facts the player does not know.

Therefore distinguish:

actual state

from:

revealed state

and:

institutional knowledge

Example:

An alien device may actually possess:

PHASE_REGULATOR
UNSTABLE
THERMAL_FEEDBACK

while the player currently sees only:

UNKNOWN_DEVICE
IRREGULAR_PULSE
RISING_TEMPERATURE

Theory authors should not assume that because a tag exists in reality, the SGC automatically knows it exists.

## Analysis Reveals Reality

Analysis generally does not create properties of an object.

The object's complete semantic reality should already exist when the instance is created.

Analysis progressively reveals that reality.

A Theory may therefore need to describe:

- actual tags;
- observable clues;
- knowledge needed to interpret clues;
- Analysis discoveries;
- deeper characterization;
- Research opportunities.

The basic relationship is:

Reality exists
→ Analysis reveals
→ Research understands/generalizes
→ Theory becomes institutional knowledge

## Research Produces Theory

Research is generally about converting a sufficiently understood subject into reusable institutional knowledge.

The larger Knowledge loop is:

Theory
+
Theory
→ Discovery
→ Unknown Thesis
→ Research
→ New Theory

A Theory author should consider:

- what prerequisite Theories might lead to this Theory;
- what combinations with this Theory might create future Discoveries;
- what Research contract this Theory would imply;
- what capabilities the resulting Theory adds to downstream generation.

Do not treat Research as merely a button that unlocks a static tech-tree node.

## Discovery Combines Theories

Discovery works on Theory knowledge.

It should not substitute:

- Profession icons;
- Cores;
- Rooms;
- arbitrary item ownership;

for actual Theory prerequisites.

Example:

PLASMA_I
+
CONTAINMENT_FIELDS_I
→ Discovery opportunity
→ PLASMA_CONTAINMENT_I

The resulting Thesis is initially unknown to the player until researched.

## Analysis Is Deeper Than Receiving

Receiving might determine:

«Unknown powered device; hazardous energy signature.»

Analysis might later determine:

«Plasma regulator utilizing a modified containment geometry.»

Research might later produce:

«Generalized Plasma Regulation Theory.»

Theory authors should preserve these layers.

## Physical Effects and Knowledge Effects Are Separate

Examples of physical effects:

- close valve;
- fire suppression foam;
- heal wound;
- stabilize machine;
- cut cable;
- remove component.

These physically happened even if recording failed.

Examples of knowledge outputs:

- Analysis result;
- diagnostic record;
- Research observation;
- certification record.

These may require reconciliation after a recording outage.

Theory authors should classify outputs appropriately.

## Unknown Alien Technology Must Remain Unknown

The game should preserve the Stargate fantasy of encountering technology beyond current understanding.

Do not let high Profession tier alone collapse that uncertainty.

A TE3 looking at an unknown machine may say:

«I can identify how these physical assemblies interact.»

without being able to say:

«This is a subspace phase inversion engine.»

unless the relevant Theory knowledge exists.

## Theory Should Support Partial Interpretation

A strong Theory allows multiple knowledge layers.

Example:

Observable:
ring oscillates every 4.2 seconds

Technician interpretation:
oscillation corresponds to control feedback

Scientist interpretation:
feedback frequency matches field instability model

Known subject Theory:
identifies phase regulator instability

This creates layered Profession and knowledge interactions.

## Theory Should Support Questions, Not Only Answers

A useful Theory can generate investigation questions.

Examples:

- What failed?
- Why did it fail?
- Who modified it?
- Is it safe?
- Is it valuable?
- Can it be repaired?
- Can it be used?
- Is the failure accidental?
- Is another system responsible?
- What happened here?

Questions create content hooks without requiring bespoke missions.

## Theory Should Support Consequences

Generated actions need semantic consequences.

A Theory may describe plausible outcomes such as:

restore power
cause overload
reveal hidden system
open sealed path
destroy evidence
release contamination
improve salvage
trigger alarm
alter faction value

The Recipe/event generator chooses among valid consequences according to context.

## Theory Must Distinguish Destructive and Non-Destructive Paths

Where appropriate, author both:

- non-destructive Analysis/interaction;
- destructive Analysis/interaction.

Destructive paths may:

- reveal deeper knowledge;
- destroy future use;
- produce Material salvage;
- remove evidence;
- change faction value;
- create hazards.

Physical consequences must be represented.

## Knowledge Should Affect Presentation

When the SGC learns a Theory, future encounters involving that Theory should change.

Before knowledge:

«The device emits a pulsing blue field.»

After knowledge:

«The containment field is phase-cycling outside its normal tolerance.»

Theory unlocks vocabulary and interpretation, not merely new buttons.

## Theory Should Affect Future Generation

A new Theory should ideally expand several systems simultaneously.

Potential impacts:

- new Recipe generation;
- new Analysis interpretations;
- new Research combinations;
- new Discovery edges;
- new incident resolutions;
- new Profession observations;
- new salvage options;
- new field interactions;
- new Room/Tool Service uses;
- new flavor language.

This is one reason horizontal Theory growth is so valuable.

## Tags Describe Reality

Tags should represent reusable semantic facts.

Avoid creating tags that are merely prose fragments.

Good:

OVERHEATING
UNPOWERED
SCAVENGED
IMPROVISED_REPAIR

Weak:

LOOKS_KIND_OF_BROKEN_WITH_BLUE_SPARKS

Presentation should derive from semantic tags and Theory guidance.

## Revealed Tags Describe Knowledge

A tag may exist without being revealed.

Theory authoring should define which observations or knowledge can reveal it.

Examples:

actual:
SABOTAGED

revealed initially:
DAMAGED

after Scout observation:
RECENT_TOOL_MARKS

after Technician inspection:
DELIBERATE_BYPASS

after sufficient knowledge:
SABOTAGED

This creates investigative progression.

# Canonical Knowledge and Evidence Detail

The following sections define the shared Knowledge Record and the progression from observation and evidence through findings, requirements, theses, and institutional Theory.

## Reality, Revelation, and Institutional Knowledge

These must remain separate.

```text
REALITY
What is actually true.

REVELATION
What has become known about a specific instance.

INSTITUTIONAL KNOWLEDGE
Reusable knowledge possessed by the SGC.
```

Example:

```text
Actual state:
SABOTAGED

Initially revealed:
DAMAGED

Later revealed:
RECENT_TOOL_MARKS

Later interpreted:
DELIBERATE_BYPASS

Eventually established:
SABOTAGED
```

The hidden `SABOTAGED` state existed the entire time.

Knowledge did not create it.

## Theory Knowledge Guidance

```yaml
knowledge:
  institutionalKnowledge:
    establishes: []

  recognition:
    requirements: []
    reveals: []

  interpretation:
    requirements: []
    reveals: []

  unknownPresentation:
    clues: []

  knownPresentation:
    interpretations: []

  generalization:
    analysisMayReveal: []
    researchMayEstablish: []
```

Theory can define what knowledge allows the SGC to recognize and interpret.

Knowing a Theory does not reveal every instance-specific fact.

## Receiving Guidance

Recoverable physical content entering the SGC goes through universal Receiving.

```yaml
receivingGuidance:
  handling:
    actual: []
    observable: []
    revealRequirements: []

  itemClass:
    actual: []
    observable: []
    revealRequirements: []

  initialQuestions: []

  routingHints: []
```

Receiving answers broad questions:

```text
How must this be handled?
What broad kind of thing is it?
Where should it go next?
```

Receiving is not deep Analysis.

## Analysis Guidance

```yaml
analysisGuidance:
  nonDestructive:
    discoverableFacts: []
    possibleGraphs: []

  destructive:
    discoverableFacts: []
    possibleGraphs: []

    physicalConsequences:
      materialOutputs: []
      stateChanges: []

  analysisQuestions: []
```

Analysis generally reveals existing Reality.

It does not create preexisting physical properties.

Destructive Analysis may create Material salvage.

Physical mass does not disappear.

## Research Guidance

```yaml
researchGuidance:
  thesisRequirements: []

  prerequisiteTheories: []

  possibleOutputs: []

  generalizesInstanceFindings: []

  requiredCapabilityEnvelope:
    profession: []
    competencies: []
    toolServices: []
    roomServices: []
```

Research operates on a formal Thesis.

Research may produce:

```text
Theory
Revised Thesis
Rejected Thesis
Generalized Finding
Boundary Condition
New Question
Discovery
Evidence
```

Failed Research does not necessarily erase all useful findings.

## Discovery Guidance

```yaml
discoveryGuidance:
  combinations:
    - theories: []
      conditions: []
      possibleTheses: []

  questionsRaised: []
```

Discovery recognizes a potentially meaningful relationship.

Discovery does not directly grant Theory.

Example:

```text
PLASMA_I
+
CONTAINMENT_FIELDS_I
→ Discovery opportunity
→ PLASMA_CONTAINMENT thesis candidate
```

## Field Guidance

Every Theory must contain `fieldGuidance`, even where some arrays are empty.

```yaml
fieldGuidance:
  encounterRoles: []

  observableClues: []
  sensoryPresentation: []

  interactionOpportunities: []

  professionInteractions:
    SC: {}
    DI: {}
    SO: {}
    TE: {}
    ME: {}
    ST: {}

  hazards: []
  complications: []
  discoveries: []
  resourceOpportunities: []

  escalationPatterns: []
  resolutionApproaches: []

  environmentalInteractions: []
  stateModifiers: []

  fieldEventSeeds: []
  questionsThisTheoryCanCreate: []

  compositionGuidance: {}

  narrativeGuidance: {}
```

Field Guidance describes how Theory truth can participate in generated situations.

It cannot independently create new semantic truth.

## Profession Field Interaction Guidance

A Profession interaction may contain:

```yaml
professionInteraction:
  relevance:

  observations: []
  possibleActions: []

  advantages: []
  risks: []

  requiredCompetencies: []
  supportingCompetencies: []

  subjectKnowledgeRequired: []

  failureFlavor: []
  successFlavor: []

  questionsThisProfessionCanAnswer: []
```

All six Professions should be considered.

Low relevance is valid.

A Profession may sometimes contribute only observation, interpretation, or flavor rather than a mechanical action.

## Observable Clues

A clue is possible observable content generated from Reality.

```yaml
observableClue:
  id:

  clueTags: []

  presentation:
    unknown:

  detection:
    professionAdvantages: []
    perceptionDifficulty:

  interpretation:
    requirements: []

    reveals: []
```

Important distinction:

```text
Clue
= something potentially observable.

Observation
= a runtime record that someone actually observed it.
```

Perception can determine whether a clue is noticed.

Theory knowledge and Profession competency determine whether it is understood.

## Questions

Questions are first-class semantic objects.

```yaml
question:
  id:

  subject:

  questionType:

  asks:

  raisedBy: []

  possibleAnswerSources: []

  status:
```

Possible statuses:

```text
OPEN
PARTIALLY_ANSWERED
ANSWERED
SUPERSEDED
UNANSWERABLE_CURRENTLY
```

Theory can generate questions such as:

```text
WHAT_FAILED?
WHY_DID_IT_FAIL?
IS_IT_SAFE?
WHO_MODIFIED_THIS?
IS_THE_DAMAGE_INTENTIONAL?
WHAT_IS_DIFFERENT?
WHAT_REMAINS_UNEXPLAINED?
```

Questions can generate gameplay without requiring the answer to be immediately known.

## Failure Guidance

```yaml
failureGuidance:
  failureModes: []

  symptoms: []

  causes: []

  escalationPatterns: []

  aftermathStates: []

  validDamageTheories: []

  invalidDamageTheories: []
```

Failures must be domain-reasonable.

A mechanical pump can suffer:

```text
BEARING_FAILURE
SEAL_FAILURE
HOUSING_CRACK
CAVITATION
```

It should not randomly receive biological or cryptographic failure states unless another Theory intersection justifies them.

## Universal Knowledge Pipeline

Scientist established the runtime Knowledge architecture.

The complete conceptual pipeline is:

```text
REALITY
↓
OBSERVATION
↓
EVIDENCE
↓
INTERPRETATION
↓
QUESTION
↓
HYPOTHESIS
↓
PREDICTION
↓
TEST
↓
NEW EVIDENCE
↓
WORKING MODEL
↓
INSTANCE FINDING
↓
GENERALIZED FINDING
↓
THESIS CANDIDATE
↓
THESIS
↓
RESEARCH
↓
THEORY
```

This is not a mandatory linear progression.

Known problems may take shorter paths.

Example:

```text
Reality
→ Observation
→ Interpretation
→ Instance Finding
```

## Shared Knowledge Record

Knowledge objects may share a common runtime foundation.

```yaml
knowledgeRecord:
  id:

  type:

  subjectRefs: []

  scope:

  createdFrom: []

  supportingEvidence: []
  conflictingEvidence: []

  requiredKnowledge: []

  status:

  recordedState:

  createdBy:
  createdAt:

  supersedes: []
  supersededBy: []

  presentation:
    summary:
    detailed:
```

Type-specific data extends this common record.

## Knowledge Scope

Claims must have explicit scope.

Possible scopes include:

```text
INSTANCE
INSTANCE_GROUP
OBJECT_FAMILY
SPECIES
FACTION_PRACTICE
ENVIRONMENT_CLASS
PHENOMENON_CLASS
GENERAL
```

Example:

```text
INSTANCE:
DEVICE_042 uses field coupling.

OBJECT_FAMILY:
Known devices of FAMILY_03 use field coupling.

GENERAL:
Field coupling follows this scientific relationship under these conditions.
```

These are different claims.

## Observation

An Observation records something actually perceived or measured.

```yaml
observation:
  id:

  subject:

  source:
    actor:
    method:

  observations: []

  conditions: {}

  recordingState:

  quality:
```

Observation says:

> This was observed.

Observation does not inherently say what it means.

## Evidence

Evidence is a preserved observation, sample, record, measurement, or test result that can support reasoning.

```yaml
evidence:
  id:

  subject:

  evidenceType:

  derivedFrom: []

  provenance: {}

  integrity:
    state:
    contaminationRisk:
    chainOfCustody:

  supportsQuestions: []

  knownLimitations: []
```

Possible Evidence types:

```text
OBSERVATION
MEASUREMENT
SAMPLE
IMAGE
LOG
DOCUMENT
TEST_RESULT
DAMAGE_PATTERN
WITNESS_REPORT
RECOVERED_COMPONENT
BIOLOGICAL_SPECIMEN
```

Evidence is not automatically truth.

## Evidence Integrity

Possible integrity states:

```text
VALID
QUESTIONABLE
CONTAMINATED
INCOMPLETE
COMPROMISED
FABRICATED
UNKNOWN
```

Evidence itself can have hidden Reality.

For example:

```text
Actual:
COMPROMISED

Initially believed:
VALID
```

Later Analysis may reveal the compromise.

## Physical Sample vs Evidence

A physical sample and its Evidence record are different things.

Example:

```text
BIOLOGICAL_SAMPLE_042
```

is a physical object with custody and storage requirements.

Analysis may generate:

```text
EVIDENCE_115
```

from it.

Destroying the physical sample removes future physical analysis opportunities.

Already recorded Evidence can remain.

## Interpretation

Interpretation attaches meaning to Evidence using existing knowledge and method.

```yaml
interpretation:
  id:

  evidence: []

  appliedKnowledge: []

  competency: []

  conclusion:

  status:

  scope:
```

Useful semantic states include:

```text
SUPPORTED
WEAKLY_SUPPORTED
INCONCLUSIVE
CONTRADICTED
DISPROVEN
SUPERSEDED
```

Interpretation may change as institutional knowledge improves.

## Hypothesis

A Hypothesis is a falsifiable candidate explanation.

```yaml
hypothesis:
  id:

  question: []

  claim: {}

  basedOn:
    evidence: []
    theories: []

  predicts: []

  competingWith: []

  status:
```

Hypotheses are Knowledge objects.

They do not assert Reality tags.

Multiple competing Hypotheses may coexist.

## Prediction

A Prediction describes an expected observable consequence of a Hypothesis or Model.

```yaml
prediction:
  id:

  derivedFrom:

  condition:

  expectedResult:

  discriminatesAgainst: []
```

Predictions connect reasoning to gameplay.

They may generate:

* Analysis;
* experiment;
* field action;
* mission objective;
* sample request;
* Technician requirement.

## Test

A Test is a semantic experimental definition.

```yaml
test:
  id:

  question: []

  predictionsExamined: []

  semanticProcedure: []

  executionContract:
    generatedRecipe:
```

A Test is not a Recipe.

The Test defines what must be scientifically examined.

The Recipe system determines how execution occurs.

## Working Model

A Working Model is a developed provisional explanation.

```yaml
workingModel:
  id:

  subjectScope:

  explains: []

  supportedBy: []

  conflictsWith: []

  assumptions: []

  boundaryConditions: []

  predictions: []

  status:
```

Working Model is not Theory.

It may be incomplete, provisional, instance-specific, or later disproven.

## Instance Finding

An Instance Finding is an established conclusion about a specific subject or event.

```yaml
instanceFinding:
  id:

  subject:

  conclusion: []

  support:
    evidence: []

  confidence:

  revealsInstanceTags: []
```

An Instance Finding may reveal existing hidden instance tags.

It does not create those Reality tags.

Instance Findings can exist even when the general Theory remains unknown.

## Generalized Finding

A Generalized Finding extends supported knowledge beyond one specific instance.

```yaml
generalizedFinding:
  id:

  claim: []

  generalizedFrom: []

  applicableScope: {}

  boundaryConditions: []

  status:
```

Generalization is not automatic.

Evidence must justify the broader scope.

## Scientific Requirements

Scientific Requirements define the conditions that must be true to produce a desired phenomenon or capability.

```yaml
scientificRequirements:
  id:

  desiredCapability:

  derivedFrom: []

  conditions: []

  knownBoundaries: []
```

This is the primary Scientist III to Technician III handoff.

```text
SCIENTIST III
determines what conditions must be true.

TECHNICIAN III
determines how to physically make those conditions true.
```

Scientific Requirements are not blueprints.

Scientific Requirements are not Recipes.

## Thesis Candidate and Thesis

Scientist III may create a Thesis Candidate.

```yaml
thesisCandidate:
  proposedSubject:

  basedOn: []

  prerequisiteTheories: []

  unresolvedQuestions: []

  validationState:
```

Research admission formalizes:

```text
THESIS_CANDIDATE
→ THESIS
```

Then:

```text
THESIS
→ RESEARCH
→ THEORY
```

This prevents Scientist III from becoming a portable Research system.

## Discovery

Discovery is better treated as an event or relationship-recognition mechanism than as a rung in the Knowledge hierarchy.

Examples:

```text
Theory A
+
Theory B
→ Discovery
→ Thesis Candidate
```

or:

```text
Unexpected Evidence
+
Existing Theory Conflict
→ Discovery
→ New Question
```

Discovery does not grant Theory.

## Theory Knowledge vs Instance Knowledge

These are always distinct.

```text
Theory Knowledge:
What generally happens.

Instance Knowledge:
What happened here.
```

Example:

Knowing:

```text
STD_GENERATOR_I
```

does not tell the SGC:

```text
who sabotaged GENERATOR_042
```

Likewise, analyzing one Artifact may establish:

```text
This Artifact uses phase regulation.
```

without granting:

```text
PHASE_REGULATION_I
```

as institutional Theory.

## Recording and Database Availability

Physical events and Knowledge recording are separate.

A physical test may occur while database recording is unavailable.

Physical consequences still occur.

Knowledge output may remain uncommitted until reconciliation.

Conceptually:

```text
Test happens
↓
Observation produced
↓
Database unavailable
↓
Knowledge commit pending
↓
Recording restored
↓
Reconciliation
↓
Institutional Knowledge committed
```

# Scientist Knowledge Authority

These curriculum-derived boundaries clarify which Knowledge products Scientists may establish at each tier and which products remain institutional Research outputs.

## Thesis Boundary

The intended progression is:

```text
SC3
↓
THESIS_CANDIDATE
↓
Research Admission
↓
THESIS
↓
RESEARCH
↓
THEORY
```

Scientist III can produce research-ready scientific knowledge.

Research remains the institutional process that establishes Theory.

This prevents SC3 from becoming a portable Research room.

## Scientist Knowledge Progression

The Scientist tiers align to the universal Knowledge architecture.

### SC1

```text
Reality
↓
Observation
↓
Evidence
↓
Interpretation
↓
Bounded Instance Finding
```

### SC2

```text
Evidence
↓
Question
↓
Hypothesis
↓
Prediction
↓
Test
↓
New Evidence
↓
Working Model
```

### SC3

```text
Multiple Findings
+
Working Models
+
Evidence
↓
Synthesis
↓
Generalized Model
↓
Boundary Conditions
↓
Novel Predictions
↓
Generalized Findings
↓
Scientific Requirements
↓
Thesis Candidate
```

Then:

```text
Thesis Candidate
↓
Research
↓
Theory
```

# Clinical Knowledge Semantics

These sections map clinical observation, diagnosis, investigation, and practice knowledge onto the shared Knowledge and Evidence architecture.

## Medical Reality and Knowledge

Medical Reality exists independently of diagnosis.

Example:

```yaml
actualState:
  - INTERNAL_BLEEDING
  - BLOOD_LOSS
  - SHOCK
  - ABDOMINAL_TRAUMA
```

The Medic may initially know only:

```text
PALE
RAPID_PULSE
LOW_BLOOD_PRESSURE
ABDOMINAL_PAIN
```

Assessment may establish:

```text
CIRCULATORY_COMPROMISE
```

Further diagnosis may later establish:

```text
INTERNAL_BLEEDING
```

The existing Reality/Knowledge architecture remains authoritative.

There is no separate medical fog-of-war system.

## Observation, Diagnosis, and Treatment

Medical information should reuse the shared Knowledge architecture.

Conceptually:

```text
Clinical Observation
= OBSERVATION

Clinical measurement
= OBSERVATION / EVIDENCE

Diagnostic result
= EVIDENCE

Uncertain diagnosis
= INTERPRETATION

Established diagnosis
= INSTANCE_FINDING

Treatment response
= EVIDENCE

Unresolved diagnostic issue
= QUESTION
```

Diagnosis does not rewrite Reality.

Example:

```text
Reality:
DISEASE_X

Observed:
FEVER
COUGH
LOW_OXYGENATION

Initial interpretation:
RESPIRATORY_INFECTION

Later finding:
DISEASE_X
```

An earlier diagnosis may have been reasonable and supported without being complete.

## Symptoms, Signs, Measurements, and Findings

Useful semantic distinctions are:

```text
SYMPTOM
Patient-reported experience.

SIGN
Observed clinical feature.

MEASUREMENT
Instrument-derived value.

DIAGNOSTIC FINDING
Clinical interpretation based on Evidence.
```

These do not require separate top-level systems unless implementation later demands them.

They can remain Evidence and Knowledge semantics.

## Clinical Candidate vs Scientific Hypothesis

This distinction is important.

```text
CLINICAL CANDIDATE
"Which known condition does this patient have?"

SCIENTIFIC HYPOTHESIS
"What unknown mechanism explains this phenomenon?"
```

A clinical candidate resolves toward:

```text
INSTANCE FINDING
```

A scientific Hypothesis resolves toward:

```text
WORKING MODEL
→
potential generalization
```

Medical differential reasoning should not accidentally enter the Research pipeline.

## Diagnostic Investigation vs Scientific Experiment

```text
ME2:
"Which known diagnostic test distinguishes these clinical conditions?"

SC2:
"What experiment distinguishes these explanatory biological models?"
```

The same sample can support both.

Example:

```text
Blood sample
```

ME2:

```text
Does this contain a known pathogen?
```

SC2:

```text
How does this organism metabolize iron?
```

Different question, method, and Knowledge output.

## Clinical Practice Knowledge

Repeated successful treatment may eventually support reusable Medical Practice Theory even before every biological mechanism is fully understood.

However:

```text
Repeated clinical findings
↓
Generalization / Thesis Candidate
↓
Research
↓
Medical Practice Theory
```

ME3 does not directly create Theory.

# Reconnaissance Knowledge Semantics

These sections define reusable distinctions among observation, interpretation, inference, prediction, evidence integrity, context, and Knowledge freshness.

## Scout and the Shared Knowledge Architecture

Scout should reuse the shared Knowledge system.

Typical Scout outputs may include:

```text
OBSERVATION
EVIDENCE
INTERPRETATION
QUESTION
INSTANCE_FINDING
PREDICTION
```

Scout-flavored semantic findings may include:

```text
ROUTE_FINDING
LOCATION_FINDING
FIELD_HAZARD_FINDING
MOVEMENT_FINDING
TRACK_IDENTITY
MOVEMENT_SEQUENCE
DESTINATION_INFERENCE
LIKELY_ROUTE
LIKELY_LOCATION
COUNTER_RECON_FINDING
OPERATIONAL_OPPORTUNITY
```

These should remain semantic classes or uses of shared Knowledge Records rather than a separate Scout-only intelligence database.

## Observation vs Interpretation

Scout reinforces the universal Knowledge rule:

```text
OBSERVATION
≠
INTERPRETATION
```

Example:

```text
Observation:
Three parallel grooves cross the floor.

Interpretation:
Something heavy was dragged through here.

Further Interpretation:
A prisoner was dragged toward the eastern room.
```

Each step requires additional Evidence or subject knowledge.

The generator must not jump directly from a clue to hidden authoritative truth.

## Route Assessment Does Not Reveal Destination Truth

Important boundary:

```text
Route assessment
=
what can be inferred about the route

Not:
complete knowledge of what lies beyond it
```

ST1 may say:

```text
"This passage appears to continue upward."
```

not:

```text
"This leads to the control room."
```

unless map or other Knowledge already establishes that.

## Scout Clues and Theory

Observable clues should use the shared clue architecture.

Example:

```yaml
observableClue:
  id: FRESH_FOOTPRINTS

  clueTags:
    - RECENT_MOVEMENT

  detection:
    professionAdvantages:
      - ST

    perceptionDifficulty: NORMAL

  interpretation:
    requirements:
      - FIELD_SIGN_INTERPRETATION_I

    reveals:
      - RECENT_PASSAGE
```

Clues originate from actual Reality.

Scout changes detection and interpretation capability, not the underlying truth.

## Search Is Method-Bounded

A successful search does not mean:

```text
Reveal everything on the tile.
```

It means:

```text
Reveal things detectable by this search method
under current conditions
with current competency, stats, tools, and knowledge.
```

Example:

```text
Hidden hatch:
ST1 field search may reveal it.

Encrypted transmitter:
ST1 may locate it.
TE or SC may be needed to understand it.

Airborne pathogen:
ST1 may notice dead animals.
ME or SC may be needed to identify the cause.
```

## Track Identity Is Not Actor Identity

Critical distinction:

```text
TRACK_IDENTITY
≠
ACTOR_IDENTITY
```

ST2 may establish:

```text
"The same individual passed through all three rooms."
```

without knowing who the individual was.

Identity requires separate Evidence.

## Evidence Gaps Remain Gaps

ST2 should be able to conclude:

```text
Trail lost between these points.
```

or:

```text
Movement through this section cannot be reconstructed.
```

A partial reconstruction is valid Knowledge.

The system should never invent the missing path just to complete a story.

## Timing Estimate Is Knowledge, Not Hidden Truth

Example:

```text
Reality:
target passed 51 minutes ago

Evidence:
fresh mud
warm engine
recent disturbed foliage

Interpretation:
likely within 30–90 minutes
```

The player receives the justified estimate, not the hidden timestamp.

## Mission Context and Inference

Mission Theory may bias plausible destinations when physically valid.

It cannot override actual Evidence.

Example:

```text
Mission:
Locate kidnapped technician.

Evidence:
tracks lead toward industrial district.

Known destinations:
warehouse
water station
clinic
```

Mission context may weight the warehouse higher.

But if the evidence clearly leads toward the clinic, the mission cannot simply force the warehouse answer.

## Operational Prediction

Scout can reuse the universal `PREDICTION` Knowledge type where useful.

Conceptually:

```yaml
knowledgeRecord:
  type: PREDICTION

  subjectRefs:
    - TRACK_GROUP_A

  expectedResult:
    MOST_LIKELY_NEXT_LOCATION = BRIDGE_TILE_08

  scope:
    INSTANCE
```

This is operational prediction, not necessarily scientific prediction.

## False Evidence and Integrity

Some field Evidence may be:

```text
VALID
QUESTIONABLE
FABRICATED
COMPROMISED
```

A false trail is physical Evidence intentionally produced to mislead.

That is different from an incorrect interpretation of otherwise valid Evidence.

## Confirmed, Inferred, Predicted, Unknown

Example:

```text
CONFIRMED:
west gate is blocked

INFERRED:
hostiles are using the lower service route

PREDICTED:
patrol likely returns through junction C

UNKNOWN:
whether northern tunnel remains passable
```

These states should remain distinguishable in presentation.

They should not be flattened into generic `INTEL`.

## Knowledge Freshness

Some field Knowledge is structurally stable:

```text
Hidden tunnel exists.
```

Some is volatile:

```text
Patrol currently occupies western corridor.
```

The Knowledge system should support enough metadata to distinguish them.

Likely useful concepts include:

```text
observedAt
validityConditions
stalenessRisk
```

Potential semantic categories may eventually include:

```text
STRUCTURAL
PERSISTENT
VOLATILE
EVENT_BOUND
```

Exact labels need not be locked yet.

The important rule is:

> Historical Knowledge should not become retroactively false just because Reality later changes.

Example:

```text
10:00
South bridge confirmed passable.

11:00
Bridge collapses.
```

The 10:00 record remains valid as a historical observation.

Its current operational usefulness has changed.

## Context Is Evidence

Field context can be as important as the recovered object.

Example:

```text
Recovered weapon
```

Technical Analysis may establish:

```text
weapon model
damage
modification
```

Scout field context may establish:

```text
found under loose soil
beside two sets of recent tracks
cache recently disturbed
oriented toward road
```

These are separate Evidence streams.

Removing the object from the scene does not erase properly recorded context.

# Combat Knowledge Semantics

These sections define threat as a contextual interpretation and combat observations as Evidence rather than automatic truth.

## Threat Is Contextual

Critical distinction:

```text
ARMED
≠
HOSTILE
≠
IMMEDIATE_THREAT
```

Example:

```text
Observation:
Person holding rifle.

Additional Evidence:
Rifle lowered.
Person moving away.
No hostile action observed.
```

SO1 should not automatically establish:

```text
HOSTILE
```

from weapon possession alone.

## Combat Can Generate Evidence

Example:

```text
Unknown enemy shield
↓
Soldier observes repeated collapse after sustained impacts
↓
Combat Observation
↓
Technician later examines captured emitter
↓
Scientist investigates field behavior
```

Soldier does not need to understand the mechanism for the observation to matter.

## Soldier and Evidence

Combat should produce durable Evidence when recorded.

Potential sources include:

```text
attack pattern
weapon behavior
shield behavior
retreat behavior
surrender behavior
formation behavior
damage effect
target reaction
reload cycle
defensive-system response
```

Other Professions can later interpret those observations through their own methods.

# Diplomatic Knowledge Semantics

These sections distinguish statements, testimony, intent, authority, signaling, bluff, and cultural understanding from established Reality.

## Social Observation vs Scout Observation

Scout may establish:

```text
Two guards repositioned toward the west entrance.
```

Diplomat may establish:

```text
The governor stopped speaking after the guards moved.
```

The first is spatial behavior.

The second is socially relevant behavior.

Both may become Evidence.

## Stated Intent vs Actual Intent

The Knowledge system should preserve distinctions between:

```text
STATED_INTENT
```

and:

```text
INTERPRETED_INTENT
```

and hidden Reality.

Example:

```text
Statement:
"We only want medical supplies."

Observation:
speaker repeatedly asks about Gate access

Interpretation:
stated purpose may not explain full interest

Reality:
unknown
```

DI1 may raise a Question.

It should not reveal the hidden agenda automatically.

## Formal Authority vs Practical Influence

Diplomat may recognize:

```text
FORMAL_AUTHORITY
```

and:

```text
PRACTICAL_INFLUENCE
```

as different concepts.

Example:

```text
Governor officially decides.

Senior engineer has enough local credibility
that workers will not cooperate without them.
```

## Testimony as Evidence

Witness statements should preserve:

```text
speaker
claim
time
conditions
direct vs reported statement
later contradiction
```

The universal `WITNESS_REPORT` Evidence source is sufficient.

No diplomacy-only truth system is needed.

## Statement Is Not Truth

Universal rule:

```text
STATEMENT
≠
REALITY
```

Example:

```text
Leader says:
"The prisoners were released yesterday."
```

DI1 correctly records:

```text
LEADER_CLAIMS_PRISONERS_RELEASED
```

not:

```text
PRISONERS_RELEASED
```

unless independently established.

## Deception Detection Boundary

DI1 may notice inconsistency.

It should generally not establish:

```text
LYING
```

from body language or one suspicious clue.

More valid outcomes include:

```text
STATEMENT_CONTRADICTED
ACCOUNT_INCONSISTENT
CLAIM_UNVERIFIED
MOTIVE_UNCLEAR
ADDITIONAL_EVIDENCE_REQUIRED
```

Diplomat is not a magical lie detector.

## Bluff

Bluff is part of the Diplomat identity.

DI1 supports simple credible misrepresentation where a plausible social cover exists.

Examples:

```text
"We're contracted maintenance personnel."

"We were told to inspect this section."

"Our team is expected inside."
```

A Bluff requires semantic plausibility.

Conceptually:

```text
BLUFF
+
plausible cover
+
target uncertainty
+
known context
+
Influence
=
bluff attempt
```

## Bluff Does Not Rewrite Reality

If the Bluff succeeds:

```text
TARGET_BELIEVES_COVER_STORY
```

may become part of the target's interpreted state.

Reality remains unchanged.

The SGC does not become:

```text
AUTHORIZED_MAINTENANCE_TEAM
```

merely because the target believes the claim.

## Bluff vs Forgery

Diplomat may construct social cover.

Creating or altering a physical credential belongs elsewhere.

Possible composition:

```text
DI:
construct believable cover

TE:
modify or fabricate physical credential where technically valid

SC:
analyze authentication mechanism

ST:
identify access pattern

SO:
handle failure consequences
```

## Strategic Interests Are Not Hidden Motives

DI3 still requires Evidence.

Strategic interests should derive from:

```text
doctrine
documented policy
repeated behavior
formal agreements
resource dependencies
leadership statements
known faction practice
credible Evidence
```

Valid:

```text
CLP strongly values independent logistics.
```

Invalid without Evidence:

```text
This governor secretly intends to betray CLP.
```

## Diplomatic Signaling

DI3 may interpret or use actions whose political meaning exceeds their direct mechanical effect.

Examples:

```text
sending senior representative
sharing limited intelligence
returning captured personnel
publicly recognizing Haven ownership
attending ceremony
declining military escort
```

The meaning comes from Culture or Faction Practice Theory.

Avoid generic diplomatic-gesture bonuses as the primary semantic result.

## Diplomatic Intelligence Boundary

DI3 may consume intelligence from other Professions.

It does not own all collection methods.

Example:

```text
Scout:
CLP convoy activity increased near Haven.

Diplomat:
Haven's bargaining position may be changing because
its dependence on SGC transport is decreasing.
```

DI3 integrates Knowledge.

It does not automatically gather every underlying fact.

## Translation and Cultural Understanding

Translation and culture must remain separate.

```text
Words understood
≠
meaning understood
```

Potential specialized Services may include:

```text
LINGUISTIC_TRANSLATION
ANCIENT_LANGUAGE_TRANSLATION
UNKNOWN_LANGUAGE_ANALYSIS
SECURE_DIPLOMATIC_COMMS
IDENTITY_VERIFICATION
DOCUMENT_AUTHENTICATION
```

Diplomat tier should not imply fluency in every language.

## Diplomat and Evidence

Diplomat strongly uses social Evidence such as:

```text
WITNESS_REPORT
DOCUMENT
RECORDED_STATEMENT
AGREEMENT
AUTHORITY_RECORD
```

The key rule is:

```text
Statement
≠
Reality
```

Diplomatic Knowledge must preserve provenance.
