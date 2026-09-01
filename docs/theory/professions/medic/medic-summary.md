# Medic Profession Summary

## Status

**STRUCTURALLY COMPLETE**

## Document Profile

| Field | Value |
| --- | --- |
| Profession | Medic |
| Code | `ME` |
| Tier I | ME1 — Assess, Stabilize & Treat |
| Tier II | ME2 — Diagnose & Manage |
| Tier III | ME3 — Integrate & Recover |
| Authority | Profession Curriculum Theory |

## Profession Identity

**Code:** `ME`

Medic progression is built around increasingly difficult clinical judgment, not simply stronger healing.

The core progression is:

```text
ME1 — Assess, Stabilize & Treat
"What is harming this patient right now, and what can I safely do about it?"

ME2 — Diagnose & Manage
"What condition is causing this, and how should it be managed?"

ME3 — Integrate & Recover
"How do we manage interacting, unfamiliar, or difficult conditions and restore the patient as far as possible?"
```

The Profession-wide principle is:

> Medic Curriculum supplies clinical method. Subject Theory supplies medical and biological knowledge.

A high-tier Medic does not automatically understand unknown alien physiology, diseases, drugs, parasites, implants, or biological mechanisms.

## Core Profession Boundary

Medic answers:

```text
What is happening to this patient?
What threatens their health?
What treatment is appropriate?
How is the patient responding?
What care is required next?
```

Scientist answers:

```text
What biological phenomenon is occurring?
Why does it occur?
What general mechanism explains it?
Does the finding generalize?
```

Technician answers:

```text
How do we physically provide the equipment,
environment, or implementation required for care?
```

The critical Medic principle is:

> A Medic may be able to treat consequences they do not yet understand the cause of.

Example:

```text
Reality:
UNKNOWN_PARASITIC_ORGANISM
AIRWAY_OBSTRUCTION
HYPOXIA
```

A Medic may establish:

```text
AIRWAY_COMPROMISED
HYPOXIA
IMMEDIATE_THREAT
```

and provide appropriate stabilization without identifying the organism.

## Qualification Progression

```text
ME0
↓
ME1
↓
ME2
↓
ME3
↓
Specialization or Cross-Path
```

`ME0` represents commitment to the Medic Profession without Tier I certification.

Current nominal certification durations:

```text
ME1 — 8 operational hours
ME2 — 12 operational hours
ME3 — 12 operational hours
```

Certification uses **Strenuous** Stamina.

Certification stages are semantic demonstrations, not necessarily one Recipe bubble per line.

## Tier I — ME1 — Assess, Stabilize & Treat

### Core Promise

> Determine the patient's immediate condition, recognize urgent threats, stabilize dangerous problems, and treat ordinary understood medical conditions.

Core question:

> **What is harming this patient right now, and what can I safely do about it?**

Shorthand:

```text
ASSESS / STABILIZE / TREAT
```

ME1's defining principle is:

> ME1 can keep a patient alive without knowing everything that is wrong with them.

### ME1 Certification

```text
1. Medical Foundations Examination
2. Commission Medic Tools I
3. Patient Assessment
4. Immediate Threat Recognition
5. Emergency Stabilization
6. Routine Diagnosis & Treatment
7. Injury Care
8. Patient Monitoring & Handoff

COMPLETE → ME1
```

### ME1 Competencies

```text
MEDICAL_SAFETY_I

PATIENT_ASSESSMENT_I
VITAL_ASSESSMENT_I
IMMEDIATE_THREAT_RECOGNITION_I

EMERGENCY_STABILIZATION_I
TRAUMA_CARE_I
ROUTINE_DIAGNOSIS_I
ROUTINE_TREATMENT_I

MEDICATION_ADMINISTRATION_I
PATIENT_MONITORING_I
CLINICAL_DOCUMENTATION_I
MEDICAL_HANDOFF_I
```

### MEDICAL_SAFETY_I

Supports safe ordinary clinical work including:

* known exposure precautions;
* blood and body-fluid safety;
* ordinary sterile technique;
* medication safety;
* known biological hazard recognition;
* recognizing when available care conditions are inadequate;
* recognizing when standard precautions may be insufficient.

Subject knowledge remains mandatory.

```text
MEDICAL_SAFETY_I
+
known hazard Theory
=
appropriate known precautions
```

For unknown biology, a valid result may be:

```text
Unknown biological exposure.
Standard precautions may be insufficient.
```

### PATIENT_ASSESSMENT_I

Supports systematic initial clinical assessment:

* consciousness;
* breathing;
* circulation;
* visible injuries;
* pain or distress;
* immediate history;
* obvious exposure;
* functional impairment;
* significant symptoms.

Assessment primarily creates observations.

Example:

```text
conscious but confused
rapid breathing
weak pulse
cool skin
abdominal tenderness
no visible external bleeding
```

This does not automatically establish the hidden cause.

### VITAL_ASSESSMENT_I

Supports ordinary physiological measurements where relevant Theory establishes meaning:

```text
HEART_RATE
RESPIRATORY_RATE
TEMPERATURE
BLOOD_PRESSURE
OXYGENATION
CONSCIOUSNESS
```

Measurement is separate from interpretation.

```text
Measurement
≠
Clinical meaning
```

For known human physiology:

```text
measurement
+
HUMAN_PHYSIOLOGY_I
+
VITAL_ASSESSMENT_I
→
clinical interpretation
```

For an unfamiliar species, the game may only justify:

```text
Rapid rhythmic internal contraction detected.
```

rather than declaring the value medically abnormal.

### IMMEDIATE_THREAT_RECOGNITION_I

Supports recognition of known immediate threats such as:

```text
AIRWAY_COMPROMISE
RESPIRATORY_COMPROMISE
CIRCULATORY_COMPROMISE
SEVERE_BLEEDING
SHOCK
SEVERE_TRAUMA
LOSS_OF_CONSCIOUSNESS
ACUTE_TOXIC_EXPOSURE
```

where Evidence and biological knowledge support the conclusion.

Critical principle:

> Stabilization can precede diagnosis.

### EMERGENCY_STABILIZATION_I

Supports known stabilization methods such as:

```text
AIRWAY_STABILIZATION_I
RESPIRATORY_SUPPORT_I
HEMORRHAGE_CONTROL_I
CIRCULATORY_STABILIZATION_I
IMMOBILIZATION_I
ACUTE_DECONTAMINATION_I
```

Exact Resolution Type IDs remain subject to later authoring.

Example:

```text
Reality:
UNKNOWN_TOXIN
RESPIRATORY_FAILURE

Known:
RESPIRATORY_COMPROMISE

ME1:
RESPIRATORY_SUPPORT_I
```

The cause remains unknown.

### TRAUMA_CARE_I

Supports ordinary understood injury management including:

* wound care;
* bleeding control;
* burns;
* simple fractures;
* sprains;
* uncomplicated soft-tissue injury;
* blunt trauma;
* penetrating injury management;
* dressing;
* immobilization;
* post-treatment reassessment.

Anatomy and physiology remain subject-Theory dependent.

### ROUTINE_DIAGNOSIS_I

Supports ordinary pattern-based diagnosis when established medical knowledge is sufficient.

Conceptually:

```text
symptoms
+
signs
+
measurements
+
known Medical/Biology Theory
→
clinical diagnosis
```

Examples may include:

```text
DEHYDRATION
MINOR_INFECTION
SIMPLE_FRACTURE
KNOWN_ALLERGIC_REACTION
HEAT_EXHAUSTION
KNOWN_POISONING
```

Hard boundary:

> ME1 identifies ordinary known conditions. It does not explain genuinely unfamiliar disease mechanisms.

### ROUTINE_TREATMENT_I

Supports established treatment of ordinary known conditions.

Conceptually:

```text
Known condition
+
known treatment relationship
+
ME1 competency
+
required Tool Service
+
required Room Service
+
patient state permits
=
valid treatment
```

ME1 does not gain universal treatment permission.

The subject Theory must expose the interaction.

### MEDICATION_ADMINISTRATION_I

Supports:

* verify known medication;
* verify route;
* verify ordinary dose;
* identify known contraindications;
* identify known allergy conflict;
* administer medication;
* monitor immediate response;
* document administration.

Medication remains a physical resource where appropriate.

```text
Known medication
+
known indication
→
ME1 may administer
```

Unknown alien compounds are not automatically valid treatments.

### PATIENT_MONITORING_I

Supports monitoring for:

```text
IMPROVING
STABLE
DETERIORATING
NO_RESPONSE
ADVERSE_RESPONSE
```

as appropriate clinical interpretations.

Treatment response can create Evidence.

Example:

```text
Known antidote administered
↓
blood pressure improves
respiratory distress decreases
↓
positive treatment response Evidence
↓
known toxin diagnosis strengthened
```

### CLINICAL_DOCUMENTATION_I

Supports recording:

* assessment;
* vital measurements;
* symptoms;
* injuries;
* diagnosis;
* treatment;
* medication;
* treatment response;
* unresolved concerns;
* follow-up requirements.

Database Read/Write rules remain universal.

Physical treatment can occur during a recording outage, with institutional records reconciled later where permitted.

### MEDICAL_HANDOFF_I

Supports continuity of care during transfer.

Relevant information includes:

```text
Current condition
Known injuries
Known diagnosis
Unresolved problems
Treatments performed
Medication administered
Treatment response
Immediate risks
Required follow-up
```

This supports transitions such as:

```text
Field Medic
→
Gate transport
→
Infirmary
→
higher-level care
```

without resetting patient Knowledge.

### ME1 Knowledge Authority

ME1 normally originates:

```text
OBSERVATION
EVIDENCE
INTERPRETATION
QUESTION
INSTANCE_FINDING
```

Medical semantic classes may include:

```text
Clinical Observation
Clinical Evidence
Diagnosis
Treatment Response
Patient Status Finding
```

These remain within the shared Knowledge architecture.

ME1 does not normally originate:

```text
HYPOTHESIS
PREDICTION
WORKING_MODEL
GENERALIZED_FINDING
SCIENTIFIC_REQUIREMENTS
THESIS
THEORY
```

unless those records are supplied by another process.

### ME1 Unknown Condition Example

Reality:

```text
UNKNOWN_NEURAL_PARASITE
NEURAL_INFLAMMATION
ELEVATED_INTRACRANIAL_PRESSURE
```

ME1 observes:

```text
confusion
headache
unequal pupil response
declining consciousness
```

ME1 may establish:

```text
NEUROLOGICAL_EMERGENCY
CAUSE_UNKNOWN
FURTHER_DIAGNOSIS_REQUIRED
```

and provide appropriate stabilization.

The parasite remains hidden.

### ME1 Field Role

ME1 commonly serves as:

```text
patient assessor
emergency responder
stabilizer
trauma caregiver
routine clinician
biological safety advisor
```

Common questions include:

```text
WHAT_IS_HARMING_THE_PATIENT?
IS_THE_PATIENT_STABLE?
WHAT_THREAT_REQUIRES_IMMEDIATE_ACTION?
IS_THIS_A_KNOWN_CONDITION?
WHAT_TREATMENT_IS_SAFE?
IS_THE_PATIENT_RESPONDING?
DOES_THE_PATIENT_REQUIRE_EVACUATION?
WHAT_REMAINS_UNDIAGNOSED?
```

## Tier II — ME2 — Diagnose & Manage

### Core Promise

> Determine which known condition best explains an ambiguous presentation, distinguish competing diagnoses, develop an appropriate treatment plan, and manage that treatment as the patient's condition changes.

Core question:

> **What condition is causing this, and how should it be managed?**

Shorthand:

```text
DIAGNOSE / MANAGE
```

ME2's defining change is:

> ME2 can reason across ambiguous clinical Evidence and manage a condition over time.

### ME2 Certification

```text
1. Advanced Medical Examination
2. Commission Medic Tools II
3. Develop Differential Diagnosis
4. Perform Targeted Clinical Examination
5. Select Diagnostic Investigation
6. Interpret Diagnostic Results
7. Establish Clinical Diagnosis
8. Develop Treatment Plan
9. Manage Treatment Course
10. Identify & Manage Complication
11. Evaluate Prognosis & Escalation
12. Validate Clinical Outcome

COMPLETE → ME2
```

### ME2 Competencies

```text
DIFFERENTIAL_DIAGNOSIS_II
TARGETED_CLINICAL_EXAMINATION_II
DIAGNOSTIC_INVESTIGATION_II
DIAGNOSTIC_RESULT_INTERPRETATION_II

CLINICAL_DIAGNOSIS_II
TREATMENT_PLANNING_II
THERAPEUTIC_MANAGEMENT_II

COMPLICATION_RECOGNITION_II
COMPLICATION_MANAGEMENT_II

CLINICAL_PROGNOSIS_II
CARE_ESCALATION_II
OUTCOME_EVALUATION_II
```

### DIFFERENTIAL_DIAGNOSIS_II

Supports generating and evaluating multiple plausible known clinical explanations.

Example:

```text
Patient:
fever
confusion
rapid heart rate
low blood pressure
recent offworld mission

Candidates:
A. bacterial infection
B. toxin exposure
C. inflammatory reaction
D. environmental exposure
E. unknown biological agent
```

A differential should not become a separate truth system.

Conceptually it uses:

```text
QUESTION
+
multiple INTERPRETATIONS
+
supporting/conflicting EVIDENCE
```

### TARGETED_CLINICAL_EXAMINATION_II

Supports deliberately selecting the next examination needed to distinguish plausible diagnoses.

Examples include:

* neurological examination;
* respiratory assessment;
* cardiovascular assessment;
* targeted trauma assessment;
* exposure assessment;
* regional comparison;
* diagnostic sign search.

ME1 broadly assesses.

ME2 asks:

> What should I examine next to reduce diagnostic uncertainty?

### DIAGNOSTIC_INVESTIGATION_II

Supports selecting established diagnostic methods such as:

* laboratory testing;
* imaging;
* biological sample analysis;
* monitoring;
* functional testing;
* exposure testing;
* known pathogen tests;
* known toxin tests.

ME2 determines which clinical question needs answering and which known method can answer it.

It does not automatically possess the required Tool or Room Service.

### DIAGNOSTIC_RESULT_INTERPRETATION_II

Supports:

* interpreting established lab results;
* interpreting known imaging findings;
* combining test results with presentation;
* identifying contradiction;
* recognizing known false or misleading results;
* recognizing inconclusive testing.

Critical principle:

```text
Test result
≠
Diagnosis
```

### CLINICAL_DIAGNOSIS_II

Supports defensible diagnosis from sufficiently discriminating Evidence.

Existing Knowledge statuses should remain preferred:

```text
SUPPORTED
WEAKLY_SUPPORTED
INCONCLUSIVE
CONTRADICTED
```

Medical presentation may translate those into terms like suspected or probable without creating duplicate epistemic systems.

A valid ME2 conclusion may be:

```text
Known causes excluded.
Presentation does not match established conditions.
Etiology unresolved.
```

That can create:

```text
QUESTION
UNKNOWN_CONDITION
SAMPLE_REQUIREMENT
ANALYSIS_REQUIREMENT
SCIENTIFIC_INVESTIGATION_OPPORTUNITY
```

### Medic to Scientist Handoff

Example:

```text
Patient presents with recurring neural disruption.
↓
ME2 excludes known neurological conditions.
↓
UNKNOWN_NEUROLOGICAL_CONDITION
↓
samples collected
↓
SC1 characterizes abnormal tissue
↓
SC2 investigates mechanism
↓
SC3 generalizes if justified
↓
Research
↓
new Theory
↓
future Medics can diagnose the condition normally
```

### TREATMENT_PLANNING_II

Supports coordinated treatment planning based on:

* diagnosis;
* patient state;
* treatment priorities;
* contraindications;
* treatment interactions;
* resources;
* sequence;
* duration;
* monitoring;
* escalation conditions;
* recovery expectations.

Conceptually:

```text
Diagnosis
+
Patient State
+
Known Treatment Theory
+
Available Capability
↓
Treatment Plan
```

### THERAPEUTIC_MANAGEMENT_II

Supports modifying ongoing care based on patient response:

```text
continue treatment
modify treatment
stop treatment
change medication
adjust established dose
add supportive care
remove unnecessary intervention
escalate care
```

This is a major ME2 progression.

Medicine becomes a stateful process rather than a one-click action.

### COMPLICATION_RECOGNITION_II

Supports recognizing deviation from the expected treatment or recovery course.

Examples may include:

```text
SECONDARY_INFECTION
TREATMENT_REACTION
MEDICATION_ADVERSE_EFFECT
REBLEEDING
DEHYDRATION
RESPIRATORY_DECLINE
WOUND_BREAKDOWN
NEW_NEUROLOGICAL_DEFICIT
```

where subject Theory permits.

Complications are normally actual patient states.

### COMPLICATION_MANAGEMENT_II

Supports:

* stabilizing known complication;
* identifying offending treatment where known;
* suspending contraindicated treatment;
* adding established treatment;
* changing care priorities;
* increasing monitoring;
* escalating care.

Condition interactions remain semantic, not arbitrary random failure.

### CLINICAL_PROGNOSIS_II

Supports near-term outcome prediction from established medical knowledge.

Examples:

```text
Likely to recover with continued treatment.

High risk of deterioration without intervention.

Expected recovery will require prolonged care.

Current treatment response suggests favorable course.
```

Critical rule:

```text
PROGNOSIS
≠
FUTURE REALITY
```

A prognosis interprets current Reality and known risk relationships.

It does not pre-roll what must happen.

### CARE_ESCALATION_II

Supports determining when current field or clinical capability is insufficient.

Possible conclusions include:

```text
FIELD_CARE_SUFFICIENT
OBSERVATION_REQUIRED
INFIRMARY_REQUIRED
SPECIALIST_CARE_REQUIRED
SURGICAL_CAPABILITY_REQUIRED
BIOLOGICAL_CONTAINMENT_REQUIRED
UNKNOWN_CONDITION_REQUIRES_ANALYSIS
```

A key field outcome is:

> We can keep them stable here, but we cannot fix this here.

### OUTCOME_EVALUATION_II

Supports determining whether treatment achieved the intended clinical objective.

Potential interpretations:

```text
RESOLVED
IMPROVED
STABLE
PARTIALLY_RESOLVED
PERSISTENT
RECURRENT
WORSENED
```

These should be grounded in actual patient state.

### ME2 Knowledge Authority

ME2 normally originates:

```text
OBSERVATION
EVIDENCE
INTERPRETATION
QUESTION
INSTANCE_FINDING
```

Advanced medical semantic classes may include:

```text
DIAGNOSIS
COMPLICATION
TREATMENT_RESPONSE
CLINICAL_OUTCOME
PROGNOSIS
CARE_REQUIREMENT
```

ME2 does not normally originate:

```text
GENERALIZED_FINDING
scientific HYPOTHESIS
WORKING_MODEL
THESIS
THEORY
```

### ME2 Field Role

ME2 commonly serves as:

```text
diagnostician
clinical investigator
treatment planner
care manager
complication manager
evacuation advisor
```

Common questions include:

```text
WHAT_CONDITION_BEST_EXPLAINS_THIS?
WHAT_DIAGNOSIS_SHOULD_BE_EXCLUDED_FIRST?
WHAT_TEST_WILL_DISTINGUISH_THESE_CONDITIONS?
IS_THE_CURRENT_TREATMENT_WORKING?
HAS_A_COMPLICATION_DEVELOPED?
SHOULD_THE_TREATMENT_PLAN_CHANGE?
WHAT_IS_THE_EXPECTED_CLINICAL_COURSE?
DOES_THIS_PATIENT_REQUIRE_HIGHER_LEVEL_CARE?
IS_THIS_A_KNOWN_MEDICAL_CONDITION?
```

## Tier III — ME3 — Integrate & Recover

### Core Promise

> Manage complex, interacting, or unfamiliar clinical problems; reconcile competing treatment priorities; define advanced care requirements; and guide the patient toward the best achievable recovery state.

Core question:

> **How do we manage the whole patient when the problem is no longer one condition with one straightforward treatment?**

Shorthand:

```text
INTEGRATE / RECOVER
```

ME3's defining change is:

> ME3 manages conflicts between conditions, treatments, physiology, resources, and recovery goals.

### ME3 Certification

```text
1. Senior Medical Examination
2. Commission Medic Tools III
3. Integrate Complex Clinical Evidence
4. Manage Multiple Concurrent Conditions
5. Resolve Treatment Conflict
6. Assess Unfamiliar Physiology
7. Define Advanced Care Requirements
8. Plan Complex Intervention
9. Manage Critical Care
10. Develop Recovery Strategy
11. Evaluate Residual Impairment
12. Validate Long-Term Clinical Outcome

COMPLETE → ME3
```

### ME3 Competencies

```text
COMPLEX_CLINICAL_SYNTHESIS_III
MULTI_CONDITION_MANAGEMENT_III
THERAPEUTIC_CONFLICT_ANALYSIS_III

UNFAMILIAR_PHYSIOLOGY_ASSESSMENT_III
ADVANCED_DIAGNOSTIC_SYNTHESIS_III

ADVANCED_CARE_REQUIREMENTS_III
COMPLEX_INTERVENTION_PLANNING_III
CRITICAL_CARE_MANAGEMENT_III

RECOVERY_PLANNING_III
FUNCTIONAL_PROGNOSIS_III
RESIDUAL_IMPAIRMENT_ASSESSMENT_III
LONG_TERM_OUTCOME_VALIDATION_III
```

### COMPLEX_CLINICAL_SYNTHESIS_III

Supports combining:

* several diagnoses;
* multiple Evidence sources;
* treatment responses;
* physiological disturbance;
* patient-specific constraints;
* prior conditions;
* competing priorities.

Example:

```text
SEVERE_BLOOD_LOSS
RENAL_INJURY
CARDIAC_STRESS
KNOWN_DRUG_REACTION
```

ME3 reasons across the whole state rather than treating each item independently.

### Dynamic Medical Priority

Clinical priority can change over time.

Example:

```text
Initial priority:
HEMORRHAGE

After control:
CIRCULATORY_INSTABILITY

After stabilization:
RENAL_PERFUSION

Later:
TREATMENT_REACTION
```

Earlier conditions do not necessarily disappear when another becomes more urgent.

Priority should emerge from state, not a fixed medical phase ladder.

### MULTI_CONDITION_MANAGEMENT_III

Supports:

* prioritizing concurrent conditions;
* identifying treatment dependencies;
* sequencing interventions;
* deciding what can safely wait;
* coordinating parallel care;
* monitoring several objectives;
* revising care as one condition changes another.

Complex Treatment Plans may therefore form dependency graphs.

Example:

```yaml
treatmentPlan:
  patient: UNIT_042

  objectives:
    - RESTORE_CIRCULATION
    - CONTROL_INFECTION
    - PRESERVE_RENAL_FUNCTION

  interventions:

    - id: FLUID_SUPPORT
      addresses:
        - CIRCULATORY_COMPROMISE

    - id: ANTIMICROBIAL_THERAPY
      addresses:
        - INFECTION
      dependsOn:
        - RENAL_DOSE_ASSESSMENT

    - id: RENAL_MONITORING
      addresses:
        - RENAL_INJURY

  conflicts:
    - intervention:
        ANTIMICROBIAL_THERAPY
      concern:
        RENAL_TOXICITY
```

### THERAPEUTIC_CONFLICT_ANALYSIS_III

Supports recognizing and resolving treatment conflicts.

Examples:

```text
Treatment A improves condition X
but worsens condition Y.

Medication A is indicated
but interacts with medication B.

Procedure is corrective
but patient cannot currently tolerate it.
```

ME3 can determine:

* which conflict matters most;
* treatment priority;
* whether intensity should change;
* whether another known treatment exists;
* whether a condition must be stabilized first;
* whether current capability is insufficient.

ME3 optimizes within known medicine.

It does not invent new therapy.

### UNFAMILIAR_PHYSIOLOGY_ASSESSMENT_III

Supports cautious clinical reasoning when physiology is partially understood but not completely familiar.

Conceptually:

```text
Partial Biology Theory
+
clinical Evidence
+
known functional relationships
+
ME3
→
bounded clinical reasoning
```

Example known facts:

```text
dual circulatory organs
oxygen-carrying protein X
known normal pressure range
known drug metabolism pathway
```

ME3 may reason about:

* perfusion;
* respiratory adequacy;
* tissue injury;
* metabolic stress;
* treatment tolerance.

The exact disease mechanism may remain unknown.

Valid conclusions include:

```text
Known treatment relationship cannot be assumed for this species.

Available physiology knowledge supports supportive care only.

Response to standard human medication is not established.

Required biological relationship remains unknown.
```

### ADVANCED_DIAGNOSTIC_SYNTHESIS_III

Supports integrating:

* advanced imaging;
* lab data;
* physiological monitoring;
* treatment response;
* prior records;
* known pathology;
* specialist findings;
* repeated diagnostic investigations.

ME2 asks:

> Which diagnosis best fits?

ME3 may ask:

> How do these several diagnoses and physiological disturbances relate?

Example:

```text
Direct injury
↓
organ dysfunction
↓
metabolic imbalance
↓
cardiac instability
```

This remains patient-level clinical reasoning unless generalized through Research.

### ADVANCED_CARE_REQUIREMENTS_III

Supports defining the conditions and capabilities required for advanced care.

Example:

```text
continuous respiratory support
sterile surgical environment
real-time cardiac monitoring
blood replacement capability
neural imaging
specific medication availability
post-procedure critical care
```

This should produce:

```text
CLINICAL CARE REQUIREMENTS
```

rather than a blueprint or Recipe.

### Medic to Technician Handoff

Example:

```text
ME3:
Patient requires continuous sterile negative-pressure respiratory support.

TE3:
Given known technical requirements, determine how to configure or implement equipment/environment that provides it.
```

Therefore:

```text
CLINICAL REQUIREMENT
≠
ENGINEERING DESIGN
```

### COMPLEX_INTERVENTION_PLANNING_III

Supports:

* procedural sequence;
* prerequisites;
* required capabilities;
* required supplies;
* monitoring requirements;
* interruption conditions;
* contingency care;
* post-intervention management.

Possible domains include:

```text
major trauma care
complex toxin management
multi-stage infection treatment
advanced surgery
alien-host stabilization
post-exposure treatment
```

Actual procedures remain subject-Theory and Recipe bound.

ME3 does not receive universal surgery permission.

### CRITICAL_CARE_MANAGEMENT_III

Supports:

* managing several unstable physiological systems;
* frequent priority reassessment;
* adjusting known support;
* recognizing impending failure;
* advanced monitoring;
* prolonged stabilization;
* delayed definitive care;
* stabilization through transport.

Critical care may require:

```text
Room Service
+
Tool Service
+
ongoing staffing
```

Routine care should normally automate.

Player decisions should appear when complication, scarcity, risk, or conflicting objectives matter.

### RECOVERY_PLANNING_III

Supports defining what must happen after immediate treatment to restore health and function.

Possible requirements include:

* activity restrictions;
* monitoring;
* rehabilitation;
* ongoing medication;
* follow-up evaluation;
* recovery milestones;
* recurrence monitoring.

Example:

```text
Compound fracture repaired.

Immediate threat:
resolved.

Condition:
treated.

Recovery:
limited weight bearing
infection monitoring
progressive rehabilitation
repeat structural assessment
```

### FUNCTIONAL_PROGNOSIS_III

Supports estimating future patient capability, not simply survival.

Examples:

```text
Likely full recovery.

Likely survival with prolonged impairment.

Expected permanent loss of fine motor control.

Recovery uncertain until neural inflammation resolves.

Patient likely fit for base duty before offworld duty.
```

Important distinction:

```text
Health
≠
Function
```

A Unit may be medically stable while still unable to perform certain duties.

### RESIDUAL_IMPAIRMENT_ASSESSMENT_III

Supports distinguishing:

```text
ACTIVE_CONDITION
RECOVERING_CONDITION
RESIDUAL_IMPAIRMENT
PERMANENT_IMPAIRMENT
```

Example:

```text
Neural injury:
treated.

Inflammation:
resolved.

Residual:
left-hand weakness.

Expected:
partial recovery over time.
```

Later, persistent impairment may support:

```text
PERMANENT_FUNCTIONAL_IMPAIRMENT
```

where established medical knowledge justifies it.

### LONG_TERM_OUTCOME_VALIDATION_III

Supports:

* confirming resolution;
* recognizing recurrence;
* establishing residual impairment;
* comparing recovery against expected course;
* determining whether additional treatment remains useful;
* establishing long-term care requirements;
* closing or revising treatment plans.

Potential outcomes include:

```text
FULL_RECOVERY
FUNCTIONAL_RECOVERY
PARTIAL_RECOVERY
CHRONIC_CONDITION
PERMANENT_IMPAIRMENT
RECURRENT_CONDITION
ONGOING_CARE_REQUIRED
```

These remain grounded in actual patient state.

### ME3 Knowledge Authority

ME3 normally originates:

```text
OBSERVATION
EVIDENCE
INTERPRETATION
QUESTION
INSTANCE_FINDING
```

with advanced medical semantic classes such as:

```text
COMPLEX_DIAGNOSIS
CONDITION_RELATIONSHIP
TREATMENT_CONFLICT
CLINICAL_REQUIREMENT
FUNCTIONAL_PROGNOSIS
RESIDUAL_IMPAIRMENT
LONG_TERM_OUTCOME
```

It may also create operational/planning objects:

```text
TREATMENT_PLAN
CLINICAL_CARE_REQUIREMENTS
```

These are not Theory.

### ME3 Generalization Boundary

ME3 does not normally create generalized medical knowledge.

Example:

```text
Every exposed patient develops the same neural syndrome.
```

ME3 may raise:

```text
GENERALIZATION_QUESTION
```

or contribute Evidence.

It does not directly establish:

```text
ALIEN_PARASITE_NEUROPATHOLOGY_I
```

That remains Scientist/Research territory.

### Medic III vs Scientist III

```text
ME3:
How do we safely care for this patient with what we currently know?

SC3:
What broader biological truth explains what is happening?
```

Example:

```text
Three infected Units show identical neurological progression.
```

ME3 may establish:

```text
All three require the same respiratory monitoring.

Drug A is contraindicated after stage two.

Early intervention improves clinical outcome.
```

SC3 may establish:

```text
The organism alters neural ion transport through mechanism X.

The effect generalizes across exposed human hosts.
```

The first is advanced clinical practice.

The second is generalized scientific knowledge.

## Tools and Room Services

Exact Tool Service names remain provisional.

Conceptual progression:

```text
Medic Tools I
Assessment / stabilization / routine treatment

Medic Tools II
Advanced clinical assessment / diagnostic investigation /
treatment management

Medic Tools III
Advanced monitoring / complex intervention support /
critical care / precision clinical assessment
```

### Medic Tools I

May generally support:

* patient assessment;
* ordinary vital measurement;
* wound care;
* bleeding control;
* dressing;
* immobilization;
* ordinary medication administration;
* emergency stabilization;
* ordinary diagnostic examination;
* basic biological sample collection;
* routine infection-control equipment.

### Medic Tools II

May generally support:

* advanced vital monitoring;
* broader sample collection;
* point-of-care diagnostics;
* targeted examination;
* treatment delivery;
* medication management;
* fluid administration;
* enhanced trauma management;
* basic diagnostic instrumentation.

### Medic Tools III

May generally support:

* advanced multi-system monitoring;
* precision medication delivery;
* advanced trauma support;
* critical-care support;
* advanced biological sampling;
* procedural assistance;
* enhanced physiological assessment;
* prolonged stabilization.

Specialized Tool Services remain separate where appropriate:

```text
ADVANCED_IMAGING
SURGICAL_SUPPORT
GENETIC_ANALYSIS
NEURAL_MONITORING
CARDIOPULMONARY_SUPPORT
DIALYSIS
PROSTHETIC_FABRICATION
PHARMACEUTICAL_SYNTHESIS
ALIEN_BIOLOGY_ANALYSIS
```

Medic tier does not provide these automatically.

### Room Services

Many ME1 field actions should require no Room Service.

Example:

```text
ME1
+
Medic Tools I
+
no Room Service
→
HEMORRHAGE_CONTROL_I
```

More advanced care may require Services such as:

```text
GENERAL_MEDICAL_CARE_I
STERILE_TREATMENT_I
PATIENT_MONITORING_I
DIAGNOSTIC_WORKSPACE_I
BIOLOGICAL_CONTAINMENT_I
CRITICAL_CARE_I
STERILE_SURGICAL_ENVIRONMENT_I
CONTINUOUS_PATIENT_MONITORING_I
ADVANCED_DIAGNOSTIC_WORKSPACE_I
RECOVERY_CARE_I
```

Exact requirements belong to the specific treatment or diagnostic method, not the Medic tier globally.

## Medic and Physical Resources

Medical work may consume physical resources such as:

```text
Medication
Dressings
Blood products
Antidotes
Disposable medical supplies
Specialized biological material
```

Treatment follows the universal transaction model:

```text
validate inputs
↓
execute treatment
↓
consume resources
↓
change patient state
↓
record Knowledge outputs
↓
commit valid result
```

Nothing should temporarily produce impossible resource or custody states.

## Medic and Receiving

Medic may contribute to Receiving when recovered content is biological or potentially biological.

Potential questions include:

```text
Is it living?
Is it biological?
Is there obvious contamination?
Does it require biological containment?
Is handling likely to harm it?
Does it present a known exposure hazard?
```

Medic does not replace Scientist classification.

Example:

```text
ME1:
Living tissue. Currently viable. Standard handling may damage it.

SC1:
Sample composition does not match known terrestrial tissue classes.
```

## Medic and Samples

Biological samples remain physical objects under custody rules.

Analysis may create Evidence from them.

Destroying or consuming the sample does not erase previously recorded Evidence.

It removes future analysis opportunities.

Medic and Scientist may both generate different Knowledge from the same physical sample.

## Field Medicine and Mission Gameplay

Medic actions should frequently change the mission without erasing injury.

Example:

```text
Reality:
COMPOUND_LEG_FRACTURE
BLOOD_LOSS

ME1:
HEMORRHAGE_CONTROL_I
IMMOBILIZATION_I

Result:
STABILIZED
BLEEDING_CONTROLLED
LEG_IMMOBILIZED
```

But:

```text
COMPOUND_LEG_FRACTURE
```

still exists.

Possible consequences:

* reduced movement;
* assistance requirement;
* increased Stamina cost;
* restricted actions;
* evacuation need;
* definitive treatment requirement.

The Medic changes the situation rather than resetting the Unit.

## Cross-Profession Boundaries

Cross-profession handoffs and limits are documented in the relevant tier sections and core Profession boundary.

## Specialization Boundary

Base Tier III remains ordinary senior Profession competency. Specialization territory remains distinct and must not be absorbed into the base curriculum.

## Progression Summary

### ME1 — Assess, Stabilize & Treat

```text
Patient
↓
Assessment
↓
Immediate threat
↓
Stabilization
↓
Routine diagnosis / treatment
↓
Monitoring
↓
Handoff
```

Core statement:

> **Find the immediate problem, keep the patient alive, and treat ordinary understood conditions.**

---

### ME2 — Diagnose & Manage

```text
Clinical Evidence
↓
Differential
↓
Targeted investigation
↓
Diagnosis
↓
Treatment Plan
↓
Response
↓
Adjustment
↓
Outcome
```

Core statement:

> **Determine which known condition best explains the presentation and manage treatment as the situation changes.**

---

### ME3 — Integrate & Recover

```text
Multiple Conditions
+
Treatments
+
Patient Constraints
+
Clinical Evidence
↓
Clinical Synthesis
↓
Integrated Treatment Plan
↓
Advanced Care Requirements
↓
Complex / Critical Care
↓
Recovery
↓
Functional Outcome
```

Core statement:

> **Manage the whole patient when conditions, treatments, and recovery goals interfere with one another.**

## Reference Summary

```text
ME1
Assess.
Recognize.
Stabilize.
Treat.
Monitor.
Handoff.

ME2
Differentiate.
Investigate.
Diagnose.
Plan.
Manage.
Adjust.
Evaluate.

ME3
Synthesize.
Prioritize.
Reconcile.
Define care requirements.
Manage complexity.
Plan recovery.
Assess function.
```

The full Medic promise is:

> **ME1 keeps the patient alive and treats ordinary understood problems. ME2 determines which known condition is responsible and manages the treatment course. ME3 manages interacting conditions and advanced care to achieve the best recovery the SGC's current medical knowledge can support.**

## Final Profession Standard

A Medic should never function as a generic healing number.

The Profession should create gameplay by answering progressively harder clinical questions:

```text
ME1:
What is immediately wrong and what can we safely do now?

ME2:
Which known condition explains this and how should we manage it?

ME3:
How do we manage the whole patient when multiple problems,
treatments, capabilities, and recovery goals interact?
```

The Medic's power is therefore not:

```text
more healing
```

It is:

```text
better clinical decisions
+
safer intervention
+
more complete care
+
better use of existing medical knowledge
```
