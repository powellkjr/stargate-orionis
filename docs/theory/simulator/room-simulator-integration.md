# Room Simulator Integration

## Status

**PROVISIONAL INTEGRATION PLAN**

This document records how the provisional simulator contracts should enter the room simulator without collapsing established Room, Service, Recipe, Knowledge, or Profession boundaries.

## Resolved Design Position

The imported contracts are compatible with the established architecture under these interpretations:

- Canonical definitions exist in authored data before play; SGC Knowledge state remains runtime state.
- Discovery exposes only authored relationships among `KNOWN` Theory or Pattern Knowledge.
- Discovery may output a Hypothesis definition or a Recipe relationship, but never invents either.
- A Hypothesis is persistent Knowledge Cargo. A Thesis is a persistent institutional record referencing a Hypothesis.
- Research acts on the Thesis and establishes institutional Knowledge; it does not rewrite prior instance history.
- Physical Reality exists before Receiving or Analysis reveals it.
- Rooms perform processes on persistent items. Items store results but do not own room behavior.
- Profession competency supplies method and never substitutes for missing Theory or Services.

## Prototype Collections

Keep these conceptual collections separate even if the first implementation stores them in one JSON file:

```text
knowledgeDefinitions
knowledgeState
discoveryRelationships
hypothesisDefinitions
hypothesisInstances
thesisRecords
recipeDefinitions
itemDefinitions
itemInstances
```

Do not merge definition records with runtime state.

## Room Responsibilities

| Room context | Simulator responsibility |
| --- | --- |
| Data Storage / Discovery | Select known Theory or Patterns and expose authored Hypothesis or Recipe relationships |
| Research | Turn a Hypothesis reference into a persistent Thesis and later operate Research on that record |
| Receiving | Establish handling, broad classification, custody intake, and safe next-step information |
| Analysis | Reveal observations, findings, knowledge gaps, and safe further-work requirements |
| Workshop | Manufacture, modify, repair, reverse engineer, dismantle, and salvage physical items |

Cores expose Services within a Room category. They do not convert one Room category into another.

## Profession Resolution

Use the [Profession context handoff](../professions/profession-context-handoff.md) for the initial method boundaries.

Important simulator handoffs include:

```text
SC3 Scientific Requirements
→ TE3 physical implementation
```

```text
Analysis finding
→ known process requirements
→ qualified Workshop action
```

Discovery itself is an institutional database operation in this prototype and does not resolve an Actor, Tool Service, or Room Service bubble. Physical and Research work continues to use the universal execution contracts.

## Minimum UI Slice

Implement the smallest observable state transitions first:

1. **Knowledge panel** — show known and unknown definitions without leaking unknown semantic detail.
2. **Discovery panel** — accept up to three known Theory or Pattern inputs and show only authored matches.
3. **Hypothesis shelf** — show persistent Hypothesis Cargo, provenance, requirements, and blocked state.
4. **Thesis panel** — create and retain Thesis records referencing Hypotheses without consuming them.
5. **Item panel** — show custody, physical condition, revealed tags, findings, known process requirements, and process progress.
6. **Room process panel** — show why Receiving, Analysis, Research, or Workshop work is valid, blocked, or unavailable.

## Implementation Order

### Phase 1 — Institutional Knowledge

- Load authored definitions and starting Knowledge state.
- Apply implicit Pattern grants.
- Match explicit Discovery relationships.
- Create persistent Hypothesis and Thesis records.
- Pass the contract test cases before adding physical-item work.

### Phase 2 — Persistent Items

- Load Item Definitions and create Item Instances with complete hidden Reality.
- Track custody and room transfer.
- Record Receiving and Analysis state without altering preexisting Reality.
- Display only revealed tags and established findings.

### Phase 3 — Physical Development

- Resolve safe-environment requirements through Room Services.
- Add Workshop manufacture and Recipe graphs.
- Add Reverse Engineering as destructive physical work.
- Produce authored Hypotheses and declared salvage outputs.

### Phase 4 — Broader Simulation

- Connect Research execution.
- Connect damage, maintenance, and recovery.
- Expand beyond the provisional electromagnetic test chain.

## Explicit Deferrals

Do not implement in the first slice:

- procedural scientific inference;
- generated canonical Theory, Hypothesis, Pattern, or Recipe definitions;
- full Evidence simulation;
- procedural Pattern compatibility;
- complete Research execution;
- production-final Core or Service vocabulary;
- a second private staffing, custody, or room scheduler.

## Validation Targets

The first implementation is ready to expand only when it demonstrates:

- unknown definitions do not leak semantic details;
- unauthored Discovery combinations produce nothing;
- implicit grants do not create Hypotheses;
- Hypotheses persist after Thesis creation;
- multiple Theses may reference the same valid Hypothesis when allowed;
- blocked requirements explain why work cannot proceed;
- room transfer preserves the same Item Instance;
- Analysis reveals Reality rather than manufacturing it;
- destructive work records physical and salvage consequences;
- Room Service and Profession requirements resolve through existing contracts.

## Processing contract schema preparation

The [processing contract field mapping](./instance-item-theory-tables.md#processing-contract-field-mapping)
separates Reality Tags, Known Tags, Processing Tags, physical state, custody,
configured Room Services, and supported processing contracts. These fields prepare
the data model; they do not yet implement room exit or transfer rules.

Room configuration may declare `function.roomServices` and
`function.processingCapabilities`. Instance `processingTags` is a flat array of unique authored tag IDs covering
requirements, identity, availability, selection, authorization, and completion. Keep these separate from runtime
Service availability and detailed `processes` execution state. No existing fixture
records are populated automatically by the schema change.
