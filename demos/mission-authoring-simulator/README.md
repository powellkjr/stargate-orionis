# Mission Author draft review

Wave A provides validated semantic tables and deterministic filtering/composition.
Wave B adds a **semantic Mission Draft skeleton** with objectives, Stage purposes,
environments, routes and original role identities. Wave C adds private Fact truths,
source-backed learning paths and benchmark Interaction Intents. Wave D adds
source-backed dynamic possibilities. Wave E adds optional recovery opportunities
and prospective result intent. Wave F adds whole-draft validation, bounded repair
and browser review/export. Completion checkpoints are tracked in
[CURRENT_TASK.md](../../CURRENT_TASK.md).

From the repository root:

```powershell
node --test demos/mission-authoring-simulator/*.test.mjs
```

No installation is needed. Tests load actual shared fixtures; no save files change.

Launch `node demos/serve.mjs` and open
`http://127.0.0.1:8001/demos/mission-authoring-simulator/`, or choose Mission Author
from the demo hub. Static hosting also works; this screen uses no writable API.
Run `node demos/mission-authoring-simulator/browser-smoke.mjs` for isolated Windows
Edge checks (`EDGE_PATH` overrides the executable). The smoke uses a temporary
profile and read-only server with in-memory test telemetry, including a 390px
iframe viewport. Edge must be able to start its renderer/GPU processes.

## Data and authority

- `../shared/data/mission-author/catalogs.json` is one simulator proof pack
  containing all 17 catalog families from the expanded-tables handoff. Starter
  rows are structural authoring vocabulary or references to existing benchmark
  content. Unsupported medical/general objective composition is explicitly
  marked `UNRESOLVED`; entries do not invent executable domain behavior.
- `context.json` explicitly binds roles to existing Missing Operative instance
  IDs at their existing destination. `BENCHMARK_CONTEXT` is a caller-supplied
  test Act identity, not a newly authored canonical campaign Act. Context Reality
  facts and SGC Known facts stay separate.
- `catalogs.schema.json` describes the structural JSON contract. Runtime
  validation additionally checks IDs, versions, duplicate rows, cross-catalog
  links and authority references. Each family may contain additional authored
  rows without changing selection code.
- The authority registry receives the Theory import, base classes, shared items,
  physical instances, Offworld archetypes and an already compiled mission.
  `compileMission` retains ownership of archetype/override resolution. Adapters
  clone/freeze their inputs; they do not alter world Reality or grant Knowledge.

## Contracts and modules

Modules live in `../shared/mission-author/`:

| Module | Responsibility |
| --- | --- |
| `contracts.mjs` | Request contract, catalog family names and common validation |
| `catalogs.mjs` | Authored table validation and immutable indexes |
| `adapters.mjs` | Read-only fixture projections, versioned context validation and local role candidates |
| `determinism.mjs` | Canonical serialization, stable named streams and weighted selection |
| `selection.mjs` | Semantic candidate rejection and foundation composition |
| `trace.mjs` | Immutable candidate/selection/warning output |
| `skeleton.mjs` | Purpose-first objective, environment and role skeleton composition |
| `graph.mjs` | Connected subset of authored physical topology and route diagnostics |
| `draft.mjs` | Structural template and semantic skeleton validation |
| `information.mjs` | Authored truth resolvers, legitimate clue references, interaction requirements and Known-only projection |
| `dynamics.mjs` | Source Incident/Event/complication admission, deterministic selection and lifecycle separation |
| `results.mjs` | Optional opportunities, objective recovery intent, shared item cost provenance and unapplied consequences |
| `review.mjs` | Whole-draft validation, one bounded optional-choice repair pass, validated readiness assessment and versioned Draft/trace export |
| `readiness.mjs` | Read-only source inventory and unresolved Finalizer/runtime binding report |

`composeFoundation(request, pack, context, registry)` validates all inputs and
returns `COMPOSED` with destination, hook, pattern and original role-instance IDs,
or `UNRESOLVED` with a reason and trace. Hook and pattern are separate. Composition
checks that a hook has a valid compatible pattern before choosing its destination.
Pinned incompatible choices remain unresolved rather than silently switching.

The request requires positive integer `version`, a string or safe integer `seed`,
and explicit `actId`. Optional `destinationId`, `hookId` and `patternId` pin choices.
`allowRestricted` contains qualified IDs such as
`MISSION_HOOK_CATALOG:MISSING_PERSON` and cannot admit forbidden content.

The versioned context requires `actId`, `knownFacts` and `destinations`. Each
destination records its version, source type, explicit Reality facts and role
bindings. Optional `instanceStates` supplies current snapshots by original ID;
physical payload identity/state must remain valid. This first adapter supports
the supplied compiled mission's destination; an unrelated world destination is
reported as unsupported, not populated with copied people or guessed Reality.

Catalog rows record ID/version, description, positive weight, support status,
authority references, cross-catalog links, requirements and explicit Act policies.
Requirements can constrain source types, Reality facts, Known facts, available
roles and actual physical Theory bindings. Role fillers must match their authored
archetype and remain locally available. `catalogCandidates` exposes the same
filtering for other catalog families with already validated inputs; it does not
create Incidents, events, clues or Recipes.

## Skeleton composition

`composeSkeleton(request, pack, context, registry, templates)` returns `COMPOSED`
with an immutable `mission-author-draft-1` skeleton, or `UNRESOLVED` with diagnostics
and no partial Draft. `skeletons.json` authors the LOCATE_EVACUATE, INVESTIGATE and
RECOVER objective spines, dependency order, role-purpose bindings and Fact Role
sockets. Templates contain semantic intents, without exact rooms or execution
conditions. `draft.schema.json` defines the structural export contract;
`validateDraft` additionally checks authority references and composition semantics.

Destination `stageBindings` explicitly allow purposes and environments for real
source Stages. Composition assigns required purposes, rejects filler purposes
without a compatible environment, chooses environments, then joins required
locations through authored routes. Named graph streams select route ties and
additional adjacent Stages within the authored 4–8 range. The Gate Stage retains
arrival/exit purposes. This proof adapter selects a connected subset of existing
topology; it does not generate new physical rooms or change door geometry.

Roles keep original instance IDs and locations. Optional `instanceStates` can
supply `currentStageId`; validation rejects unknown Stages instead of resetting
the person to their initial position. Missing templates, incompatible purposes,
disconnected routes and route unions exceeding the Stage limit stay unresolved.
Paths use individually shortest authored routes; bounded alternative-choice repair
belongs to Wave F. Connectivity represents potential adjacency: every transition
retains its source ID and unresolved access, rather than claiming a secure route.
Skeleton Fact sockets retain `truth: null`; Wave C resolves them in a separate
information Draft. Objectives do not grant Knowledge
or apply runtime state changes, and this Draft cannot be passed to `compileMission`.

## Facts, clues and interactions

`composeInformation(request, pack, context, registry, templates, information)`
builds on the unchanged skeleton API. `information.json` authors Fact subject roles,
truth resolvers and learning paths. SUBJECT_LOCATION resolves the original subject's
current Stage. DEVICE_PURPOSE checks the physical instance's existing WEAPON Reality
tag; its authored tactical-role observation supplies a bounded inference about use,
without revealing maker, complete identity, advanced Theory or manufacturing Pattern.
This relationship is explicit benchmark authoring, not inferred from arbitrary prose.

The `mission-author-information-draft-1` output retains its original skeleton and
adds `facts`, `clues`, `interactions` and `opportunityDerivation`. Every Fact requires
one admitted source-backed clue. Inspection references must match the observation's
subject, current location, output Knowledge and authored archetype. Testimony must
match the starting speaker and unconditional authored opening Knowledge effect;
unavailable speakers reject that path. The operative's own contact/identity paths
are legitimate for INVESTIGATE too; the presence of an evidence archive does not
make it evidence of the operative's current location.

Requirements preserve source Known prerequisites, state/visibility conditions,
minimum Tier and Perception. Missing explicit Known prerequisites require authored
producer references, including group-search completion. These references establish
authored provenance, not an executable dependency chain: producer availability,
alternative/opaque conditions, actor availability, access and runtime fulfillment
remain unresolved. The composer does not select or run those Recipes, assume Tool
admission, or grant their outputs. Unsupported explicit Knowledge with no authored
producer fails composition with a rejection reason.

Interaction professions come from the actual source observation, never a quota or
the intent catalog's illustrative Profession reference. Existing benchmark sources
receive `BENCHMARK_REFERENCE`; `deriveProfessionOpportunities` explicitly reports
UNRESOLVED because no executable field-method adapter/curriculum is supplied.
General scientific or Profession opportunity generation requires additional authored
guidance/contracts; base-class identity cannot substitute for them.

`validateInformationDraft` checks truth, learning-source provenance, interaction
requirements, coverage and immutability against validated composition inputs.
`information-draft.schema.json` describes export structure and references the
adjacent `draft.schema.json`. The author Draft and trace contain private Reality.
`projectInformationKnowledge(draft, knownFacts)` returns only the clue Knowledge IDs
explicitly present in the caller's Known snapshot. Even a Known broad observation
does not expose the truth object's hidden tags or underlying item identity.

## Incidents, Events and complications

`composeDynamics(request, pack, context, registry, templates, information, dynamics)`
adds a `mission-author-dynamic-draft-1` wrapper around the unchanged information
Draft. `dynamics.json` binds semantic catalog rows to original compiled Incidents,
Event bindings and complication sources. Its instance-field predicates filter
authoring candidates; they do not become new runtime rules or change physical state.

Incident admission preserves all source subjects and requires them locally present
in the source Stage, inside the selected graph. Resolved Incident snapshots,
inactive radiation sources, fully stabilized patients and cleared combat groups
reject their candidates. Detection and investigation have separate source-reference
slots; resolution retains the source condition/mode. Restoration remains unresolved:
stopping the hazard does not restore equipment or patients. Nonempty restoration
bindings require a future method adapter and are rejected by this proof contract.
Runtime DORMANT/ACTIVE/RESOLVED snapshots are independent of these lifecycle slots.

Events require a selected Incident trigger origin and a coherent chain of authored
emitted/scheduled Events. Guard escape uses the source Incident's escape event;
gunfire uses an existing combat possibility, with ranged execution still unresolved.
The evidence-purge chain retains its original stage/custody conditions and delays.
Affected instances must remain locally present inside the Draft. Trigger provenance
and effect intent are references/copies for author review, never applied transitions.
Follow-ups outside the selected Event set remain unresolved Finalizer dependencies;
this output is not a standalone executable Event graph.

Source transition snapshots admit access restriction only for actual LOCKED doors.
The Gate complication uses the existing continuous-connection limit only while
open to SGC and below that limit. Optional destination `incidentStates`,
`transitionStates` and `gateState` snapshots override source initial state after
validation; Gate snapshots provide `connection` and nonnegative `elapsedSeconds`.
No lock, hazard, timer, restoration method or campaign consequence is created.

The benchmark authoring policy selects 0–2 Incidents, 0–3 Events and 0–2 smaller
complications. The current proof pack has two supported Event families, so it
does not guarantee three Events or impose a quota. Candidate pools, Act policies,
source conditions and stable named streams determine eligible selections. Changing
only dynamic bindings does not regenerate upstream information or Stage structure;
changing the Event candidate pool does not advance Incident/complication streams.
The dynamic schema references the adjacent information and skeleton schemas;
semantic validation also rejects forged subjects, triggers, lifecycle claims and
effects. Dynamic Drafts and traces contain author-only world context.

## Optional opportunities and result intent

`composeResults(request, pack, context, registry, templates, information, dynamics,
results)` wraps the unchanged dynamic Draft in `mission-author-result-draft-1`.
`results.json` authors required objective-role recovery and optional source-backed
opportunities. Every EVACUATE/RECOVER objective needs a matching recovery binding;
missing required subject/method/routing fails composition. Optional opportunities
select 0–2 admitted existing subjects, without duplicating required recovery.
This ceiling is benchmark authoring policy, not a game rule or Profession quota.

Source methods retain IDs, targets, Profession/Tier/Tool requirements, charges,
duration, Known/state/location requirements and conditional effects. Their targets
must match the actual subject or explicitly produce that party-cargo instance.
Methods are provenance for future work, not executable Recipe choices. The Lab
device retains both detachment and securing prerequisites; composition does not
detach it, complete any work or assume Tool/Actor availability.

Recovery routes are deliberately separate:

- RECEIVING: existing item category and persistent physical payload; quotes use
  shared item definitions and current quantity, including authored cargo costs.
- PARTY_STORAGE: existing portable asset category and explicit authored collection
  output. The Lab report is a legacy portable mission instance without a shared
  item handling definition; cost/capacity remain unresolved rather than defaulting
  to zero or treating it as base inventory.
- HOLDING: an existing person and capture method. Capture remains conditional;
  captive escort, Holding cost and shared admission are unresolved.
- MISSION_EVACUEE: the operative's source Send-to-Gate flow. It does not become a
  Holding request or an SGC roster recruit.

Original IDs, custody, quantity, findings, hidden Reality and item Knowledge survive
in the author-only intent payload. `PENDING_SHARED_ADMISSION`, unresolved transport
and `NOT_APPLIED` prevent these records from claiming capacity, route security or
transfer completion. Shared party storage, base recovery/capacity and mission
evacuation retain their respective authority. Composition never reserves capacity,
reads a base save for implicit tuning, changes custody or temporarily exceeds room
capacity. SAMPLE/DOCUMENT/NONE need explicit future routing adapters; a semantic
label alone does not make them transferable.

Consequence possibilities derive from selected recovery intents, legitimate clue
Knowledge outputs and selected source-method NPC effects. Source conditions remain
intact and affected NPC IDs stay exact. CUSTODY, KNOWLEDGE and NPC_STATE policies
obey Act availability. All consequences remain NOT_APPLIED; clue completion cannot
automatically grant institutional Theory, manufacturing Patterns or campaign state.
Live Mission Result application, faction/relationship/recruitment semantics and
the Finalizer remain future scope. `result-draft.schema.json` references the dynamic
schema; semantic validation additionally protects cost, identity, ownership and
source provenance.

## Determinism and selection policy

The versioned algorithm is `canonical-fnv1a-mulberry32-v1`: canonical JSON encoded
as UTF-8, FNV-1a stream seed, then Mulberry32 draws. Candidate order is stable by
ID, independent of locale and source row/property order. Catalog and row versions,
request and normalized context are recorded in the trace identity. Authors must
bump versions when semantic content changes.

Named streams are destination, hook, pattern, roles, graph, NPC, instances, facts,
clues, Incident, Event and optional opportunities. Each required role also uses
its own key. Drawing more values from one stream cannot advance another stream.
Streams reserved for later waves are available without generating those sections.

The benchmark Act policy is:

- `FORBIDDEN`: always reject.
- `RESTRICTED`: reject unless that qualified row is explicitly requested as allowed.
- `PREFERRED`: choose among admitted preferred rows before ordinary rows.
- `AVAILABLE`: ordinary weighted selection.

Preference never repairs a failed Reality, Knowledge or role requirement. Explicit
compatible pins choose their row rather than applying automatic preference.
These are authoring selection policies, not new world/game rules.

The author-facing trace includes all evaluated destinations, hooks and patterns,
weights, Act availability, semantic rejection reasons, original role candidates,
selected IDs and unresolved adapter warnings. It contains authoring context,
including hidden Reality; it is not a player-facing Knowledge presentation.

## Review, repair and export

Compose with an explicit seed, benchmark Act, destination and optional hook/pattern
pins. The Lab-characterized checkbox supplies a caller Known snapshot; it does not
perform Analysis or grant Knowledge in a mission. Review Stage/role placement,
private truths, legitimate clue requirements, dynamic source effects, recovery
cost provenance, pending admission and candidate rejection reasons.

`validateWholeDraft` combines all existing semantic validators. `reviewDraft`
allows at most one deterministic repair pass that removes incompatible optional
Incident/Event/complication choices, including Events whose Incident was removed.
It never rerolls a seed or changes request pins, world state, required objectives,
roles, Facts, recovery costs/identity or prospective consequences. Core failures
remain INVALID; missing required composition bindings remain UNRESOLVED. Disable
repair to inspect the original validation failure.

Import a result Draft or exported envelope to validate against **current controls
and fixtures**. Imported request/context does not silently replace those controls.
The original generation trace is unverified and is not reused as a fresh trace.
Export includes the validated Draft, request, context, pack versions, review trace
repair audit and readiness report; repeated composition/export with identical inputs is identical.
Exports contain author-only Reality and are unsuitable as a player Knowledge view.

## Finalizer readiness report

The review and export now include `mission-author-readiness-1` metadata with
status `NOT_FINALIZED`. `assessReadiness(draft, request, bundle)` validates the
entire Draft first. The report inventories selected Stage, role, transition,
clue, Incident, Event-chain, complication and recovery-method sources, then
lists missing bindings separately. Existing sources have `SOURCE_AVAILABLE`;
that means a compiled source record exists, not that this Draft can execute it.

Semantic objectives have no authored runtime completion/effect binding. Stage
purpose/environment mappings, caller state deployment, executable dependency
closure, clue access/Actor/Tool resolution, dynamic installation, transport,
shared recovery admission and Mission Result application remain unresolved.
The report preserves authored clue prerequisites and recovery methods/costs;
it does not infer availability, transfer items, grant Knowledge or apply effects.

Readiness is additive author metadata in the existing review export envelope;
the nested Draft schemas and existing import formats are unchanged. Imports
ignore supplied readiness metadata. The display and export recompute it using
current controls and fixtures, including after a repair. No playable mission,
Finalizer adapter or new canonical rule is introduced by this follow-up.

## Known gaps

The current Theory import has empty `fieldGuidance` and no executable Profession
curriculum records. Base-class identity alone cannot justify field methods.
`theoryGuidance` therefore reports those subjects as unresolved. Existing Incident
references prove benchmark vocabulary, not full Theory-valid domain generation.

Live campaign Act, Haven/faction, persistent named NPC profiles and mission history
are not inferred from world-map samples or design documents. They require explicit
future adapters. This wave neither creates generic NPCs nor duplicates named ones.
Its role bindings refer to already authored local mission instances.

No authored story-beat pack is registered, so story-beat constraints remain
unsupported. General derived methods remain unsupported pending authored guidance.
The Finalizer bridge, execution Recipes and Offworld deployment
are outside this semantic authoring prototype.
