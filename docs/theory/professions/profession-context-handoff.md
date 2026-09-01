# Profession Context Handoff

## Purpose

Use this document to reorient another contributor or chat to the current Profession definitions without loading the full curricula.

The detailed documents under `docs/theory/professions/` remain authoritative.

## Universal Profession Contract

Profession Curriculum provides trained method. Subject Theory provides domain knowledge.

A valid action may also require:

- the appropriate Tool Service;
- the appropriate Room Service or field context;
- valid current state;
- available resources, custody, evidence, or authority.

Higher Profession tiers do not reveal unknown truth, replace missing subject Theory, or automatically grant specialized equipment.

Tier III is ordinary senior base-Profession competency. It must not absorb specialization territory.

## Current Profession Tiers

### Technician — `TE`

- **TE1 — Diagnose & Restore:** Operate, inspect, diagnose, service, repair, stabilize, recover, and verify understood equipment.
- **TE2 — Adapt:** Characterize, fabricate, modify, integrate, reroute, bypass, align, calibrate, and adapt understood systems.
- **TE3 — Implement:** Turn known principles, requirements, and constraints into a buildable physical implementation.

Boundary: Technician can reconstruct missing implementation, but not missing knowledge.

### Scientist — `SC`

- **SC1 — Observe & Analyze:** Gather evidence, measure, classify, use known models, identify anomalies, and establish bounded findings.
- **SC2 — Model & Test:** Form hypotheses, make predictions, design tests, analyze causes, discriminate models, and assess reproducibility.
- **SC3 — Explain & Generalize:** Synthesize evidence, derive general models and boundary conditions, produce scientific requirements, identify knowledge gaps, and form Thesis Candidates.

Boundary: Scientists establish justified findings and models. Institutional Research creates Theory.

### Medic — `ME`

- **ME1 — Assess, Stabilize & Treat:** Assess patients, recognize immediate threats, stabilize, provide routine diagnosis and treatment, monitor, document, and hand off.
- **ME2 — Diagnose & Manage:** Perform differential diagnosis, targeted investigation, treatment planning, therapeutic management, prognosis, and escalation.
- **ME3 — Integrate & Recover:** Synthesize complex conditions, manage conflicting treatments, define advanced-care requirements, plan complex intervention and recovery, and assess long-term outcomes.

Boundary: Stabilization, treatment, recovery, and restored function are distinct states.

### Scout — `ST`

- **ST1 — Observe, Navigate & Locate:** Observe environments, orient, assess routes, navigate, recognize clues and hazards, search, document, and verify.
- **ST2 — Track & Predict:** Interpret field signs, reconstruct movement, discriminate trails, estimate direction and timing, recognize deception, and prioritize searches.
- **ST3 — Recon & Exploit:** Synthesize reconnaissance, develop operational pictures, identify information gaps, plan reconnaissance, analyze route networks, identify opportunities, and validate conclusions.

Boundary: Observation, inference, and prediction are not revelation. Scout does not remove fog of war.

### Soldier — `SO`

- **SO1 — Fight & Protect:** Employ weapons safely, assess immediate threats, move and defend, protect others, maintain engagement discipline, and secure aftermaths.
- **SO2 — Control & Maneuver:** Understand engagement geometry, coordinate fire and movement, suppress, channel, withdraw, counter-maneuver, and manage multiple threats.
- **SO3 — Assess & Direct:** Synthesize the tactical picture, identify decisive factors, define tactical requirements, coordinate multiple elements, manage reserves and escalation, adapt forces, and validate tactical outcomes.

Boundary: Tactical Requirements are not orders, and tactical outcomes are not necessarily mission outcomes.

### Diplomat — `DI`

- **DI1 — Communicate & Influence:** Communicate, observe social context, assess stated intent and disposition, recognize authority and interests, persuade, frame, de-escalate, negotiate basic terms, and confirm agreements.
- **DI2 — Negotiate & Resolve:** Map interests, positions, constraints, leverage, and alternatives; structure negotiations; and manage concessions, mediation, obligations, commitments, disputes, and breakdowns.
- **DI3 — Align & Represent:** Synthesize political relationships, analyze strategic interests, define diplomatic requirements, construct multi-party frameworks, represent institutions, reconcile commitments, manage coalitions, and assess treaty risk and relationship stability.

Boundary: Influence changes beliefs and decisions; it is not mind control and does not rewrite Reality.

## Pairwise Boundaries

- **Technician / Scientist:** Scientist determines what is true and required; Technician determines how to realize those known conditions physically.
- **Technician / Medic:** Medic defines patient needs and Clinical Care Requirements; Technician implements or restores the supporting equipment and environment.
- **Technician / Scout:** Scout identifies field conditions, routes, clues, and needs; Technician evaluates or changes the relevant physical systems.
- **Technician / Soldier:** Soldier owns the tactical need; Technician supports physical capability without becoming the tactical decision-maker.
- **Technician / Diplomat:** Diplomat establishes authorized commitments; Technician determines whether and how their physical provisions can be implemented.
- **Scientist / Medic:** Medic establishes patient-level clinical findings and care; Scientist generalizes evidence into broader biological or medical knowledge.
- **Scientist / Scout:** Scout gathers contextual field evidence; Scientist tests explanations and establishes justified models.
- **Scientist / Soldier:** Soldier recognizes and responds to threats; Scientist explains their underlying phenomena without directing the engagement.
- **Scientist / Diplomat:** Scientist establishes facts and uncertainty; Diplomat communicates, frames, negotiates, or represents them without changing their truth.
- **Medic / Scout:** Scout locates patients, hazards, routes, and contextual evidence; Medic determines clinical significance and care.
- **Medic / Soldier:** Soldier addresses active hostile threats; Medic triages and treats patients. Resolving either side does not automatically resolve the other.
- **Medic / Diplomat:** Medic establishes clinical needs and constraints; Diplomat negotiates access, consent, resources, or commitments.
- **Scout / Soldier:** Scout develops the operational picture; Soldier converts it into tactical priorities, maneuver, engagement, or disengagement.
- **Scout / Diplomat:** Scout gathers observable context; Diplomat interprets interests, authority, commitments, and negotiation possibilities without treating inference as truth.
- **Soldier / Diplomat:** Soldier manages physical threat and tactical force; Diplomat manages communication, de-escalation, agreements, and legitimacy.

## Major Handoffs

```text
SC3 Scientific Requirements
→ TE3 Implementation Design
→ Recipe
→ Physical System
```

```text
ME3 Clinical Care Requirements
→ TE3 equipment or environment implementation where needed
```

```text
ST3 Operational Picture
→ SO3 Tactical Assessment and Requirements
```

```text
DI3 Diplomatic Requirements or Framework
→ individual Agreements, commitments, and executable actions
```

A handoff passes a finding, Requirement, plan, constraint, or state. It does not transfer competency.

```text
Profession A output
+ Profession B competency
+ required Theory and Services
→ valid Profession B action
```

## Authority Pointers

- [Profession boundaries](./profession-boundaries.md)
- [Technician curriculum](./technician/technician-summary.md)
- [Scientist curriculum](./scientist/scientist-summary.md)
- [Medic curriculum](./medic/medic-summary.md)
- [Scout curriculum](./scout/scout-summary.md)
- [Soldier curriculum](./soldier/soldier-summary.md)
- [Diplomat curriculum](./diplomat/diplomat-summary.md)
- [Theory architecture](../README.md)

When this handoff conflicts with a detailed curriculum or architecture document, the detailed document is authoritative.
