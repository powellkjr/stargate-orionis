# Current Task: Offworld 2D Sprite Presentation Branch

## Active request and resume checkpoint

- October 9, 2026. User requests implementing `C:/Users/Powel/Downloads/offworld_2d_sprite_branch_handoff.md` on a new branch. The attachment defines the requested experiment, not new game rules.
- Branch: `offworld-2d-sprite-renderer`, created from synchronized `main` at `45d8a6e`. Starting working tree was clean. No merge or remote push requested for this experiment.
- Scope: complete placeholder 2D presentation for the same runnable Missing Operative mission, plus a replaceable asset contract and desktop/mobile screenshots. Preserve schematic rendering, runtime, authored mission, UI interactions, Profession colors and hidden-state boundaries.
- Implementation: extend `map.mjs` with optional presentation hooks; add `sprite-renderer.mjs`, centralized `sprite-manifest.mjs`, SVG placeholder resources under `demos/shared/sprites/offworld/`, a UI renderer toggle, renderer tests and final-art specification. Reuse existing map-layout, camera, actions, observation markers, combat feedback and NPC UI. No second simulation or tactical positions.
- Compatibility: unknown identity must use generic art; known-shape fog must not expose specific Stage art/objects; departed occupants must not collapse remaining placements. Existing action/click/keyboard selectors stay unchanged. Missing art falls back to a generic placeholder.
- **Resume checkpoint: implementation complete and ready for visual review.** 272 combined Node tests pass, including five meaningful sprite tests. Full isolated Edge smoke passes sprite loading, renderer-toggle runtime parity, movement/dialogue/combat/Lab search/characterization/detachment, recovery/reset and 390px layout with no runtime errors. Changed JavaScript syntax, all 31 SVG XML resources and diff checks pass.
- Delivered: presentation hooks in `map.mjs`, sprite renderer/manifest, 31 SVG placeholders, View toggle and Stage framing, idle-DOM caching, failed-asset fallback caching, tests, `SPRITE_ASSETS.md` and four review screenshots under `demos/offworld-sandbox/sprite-review/`. Existing `map-layout.mjs` supplies stable reserved positions; no additional layout system needed.
- Runtime modules and authored mission fixtures have no changes. Art is provisional presentation only; no new game rules, Recipes, tactical positioning, animation library or hidden-Reality lookup. The original schematic renderer is retained. No architectural gap was resolved by changing gameplay; previously deferred runtime behavior stays deferred.
- Next action: review scale/camera/silhouettes, then generate polished assets externally and update the manifest using the documented contract. This experiment is on its dedicated branch; no commit, merge or push requested in this task. Historical Mission Author checkpoint follows.

---

# Current Task: Mission Author Expanded Tables — Wave Plan

## Active request and resume checkpoint

- Updated October 9, 2026. User request: break the attached Mission Author handoff into waves and persist the plan here. **Waves A–F benchmark implementation complete. General Profession-method derivation remains unsupported pending authored guidance/contracts.** The subsequent user instruction "fire at will" authorizes implementation in the planned waves; the attachment remains design input rather than a separate authority to invent missing canonical content.
- Design source: `C:\Users\Powel\Downloads\mission_author_expanded_tables_handoff.md` (SHA-256: `f74fa20223927b0a9d47855e4fd17445d5c6d701d5943c1e94f45030b0b0dcf3`). It revises an earlier Mission Author plan that was not supplied in this turn. The breakdown below follows this supplied revision; do not assume omitted earlier requirements.
- Active scope: a deterministic semantic Mission Author prototype under `demos/`, using existing shared data and architecture. It composes authored possibilities into a Mission Draft; it does not invent canonical science, equipment, NPC campaign truth, Recipes or recovery rules.
- Completed baseline: Offworld follow-up wave below; 197 automated tests, isolated Edge smoke, shared item schema, JavaScript syntax and diff checks passed. Those results describe the existing simulator, not this new authoring feature.
- Working tree already contains the completed Offworld changes, tests and documentation. Preserve them; do not reset or overwrite them when starting Mission Author work.
- **Resume checkpoint:** Waves A–F and follow-up G complete. G adds validated read-only Finalizer readiness metadata to browser review/export; imports recompute the report against current fixtures. Final combined run: 267 tests passed (66 Mission Author); isolated Edge desktop/390px smoke, module syntax and diff checks passed. No compilation/deployment, live writes or new canonical content. The next integration gap is authored semantic-objective completion/effect binding and runtime dependency closure; do not guess these or silently deploy the original mission as a generated Draft. Preserve all earlier edits and local base configuration.

## Wave sequence and completion gates

Each wave depends on the preceding wave's validated output. Keep each implementation wave reviewable; record changed files, completed behavior, tests, unresolved gaps and the next action before moving on. The handoff explicitly calls for review after Wave A before Wave B. Do not report a later wave complete because its vocabulary already exists in a table.

| Wave | Deliverable | Scope and completion gate | Status |
| --- | --- | --- | --- |
| A — Semantic foundation | Request/catalog contracts, filtering and deterministic selection | Validate all 17 catalog families below. Add only enough reference-backed sample rows to prove composition. Resolve Reality/Knowledge/Act constraints through adapters; reject incompatible candidates with reasons. Stable named sub-seeds and candidate traces must reproduce the same choices for the same request, state, catalog versions and seed. No full Mission Draft or graph generation. | Complete: 15 focused tests + 197 existing tests |
| B — Mission skeleton | First semantic Mission Draft skeleton | Resolve destination, hook and pattern separately; expand objective spine and required roles; select Stage purposes before environments; build a connected 4–8 Stage graph and place valid role fillers. Preserve persistent instance/NPC identity and world Reality. Validate required sockets, placement, reachability and deterministic output. Review Wave A first. | Complete: 27 focused tests; 228 combined tests |
| C — Facts, clues and interactions | Valid information paths and Profession opportunities | Resolve actual mission truths for Fact Roles, attach legitimate clue sources, derive Profession opportunities from Theory/curricula and instance state, and record semantic Interaction Intents. Test that hidden Reality is not exposed automatically, unsupported Knowledge chains fail clearly, and opportunities follow content rather than Profession quotas. Exact runtime Recipes remain outside this wave. | Benchmark complete: 37 focused / 238 combined tests; general methods explicitly unsupported |
| D — Incidents, events and complications | Authored dynamic mission possibilities | Add 0–2 compatible Incidents, 0–3 Events and meaningful smaller complications. Preserve Detection → Investigation → Resolution → Restoration semantics through existing contracts. Record trigger/effect intent without guessing runtime thresholds or syntax. Test invalid hazard/context rejection, Act restrictions, meaningful preconditions and stable selections. | Benchmark complete: 46 focused / 247 combined tests |
| E — Optional opportunities, recovery and consequences | Complete semantic recovery/result intent | Select optional opportunities from actual authored content; reference real/resolvable subjects; distinguish party storage, Receiving, Holding and mission evacuees. Record consequence possibilities without applying campaign changes. Test stable identity, unresolved-reference rejection, capacity/custody ownership boundaries and no automatic Theory/Pattern unlocks. Reconcile current evacuation limitations before promising executability. | Benchmark complete: 56 focused / 257 combined tests |
| F — Validation, repair and draft review UI | Reviewable/exportable Mission Draft and debug trace | Add supported story constraints, whole-draft validation and one bounded deterministic repair pass. Repairs may replace incompatible composition choices, never rewrite established Reality. Provide request/seed controls, candidate/rejection explanations, warnings and Draft + trace export. Story-beat support is optional for the first mission; use authored beats when added. Test determinism, bounded repair, unrelated-section stability, export and browser/mobile interaction. | Benchmark complete: 62 focused / 263 combined tests; isolated Edge smoke |

Finalizer execution, exact Recipe binding, deployment-aware tuning, specialization generation and Offworld runtime integration are separate future scope. This plan does not claim that exporting a semantic Draft makes it playable in Offworld.

## Follow-up G — Finalizer readiness report (complete)

- Scope: inspect a fully validated result Draft and report existing Offworld source provenance separately from missing execution bindings. Source availability does not imply executable objective completion, Actor/Tool admission, safe transport or capacity.
- Exact files: new `demos/shared/mission-author/readiness.mjs` and `demos/mission-authoring-simulator/readiness.test.mjs`; update `review.mjs`, browser `app.mjs`, `render.mjs`, `browser-test.mjs`, Mission Author README, REPO_MAP and this tracker.
- Compatibility: preserve all Draft schemas, identities, immutable Reality/Knowledge, request pins and repair semantics. Add author-report metadata to the export envelope; recompute it against current fixtures rather than trusting imported readiness. Finalizer/runtime bridge remains absent; the report must never label a Draft playable.
- Implemented read-only source inventory for Stages, roles, transitions, clues, Incidents, Event chains, complications and recovery methods. Report preserves source prerequisites/methods/costs while listing objective binding, deployment, runtime access/execution, transport/admission and consequence-application gaps. Source existence never claims execution.
- Browser display and JSON export include NOT_FINALIZED readiness; export/import recompute against current validated fixtures and ignore supplied report metadata. Nested Draft schema and existing import formats remain unchanged; this is additive author-report metadata.
- Validation: four new meaningful tests cover immutable inputs, all three patterns and source kinds, rejection of forged truth/identity/costs, deterministic report/export and ignoring forged PLAYABLE metadata. All 267 combined tests (66 authoring), all authoring syntax and diff checks pass. Isolated Edge verifies readiness display/export/import plus existing desktop/390px interaction, with no live writes or runtime errors.
- Remaining ambiguity: no canonical semantic-objective-to-runtime completion binding or dependency-closure contract exists. Report makes those gaps reviewable; it does not author a Finalizer or use source provenance to bypass admission.

## Wave F completed implementation and validation

- Exact new files: `demos/shared/mission-author/review.mjs`; `demos/mission-authoring-simulator/{fixtures,render,app}.mjs`, `index.html`, `style.css`, `review.test.mjs`, `browser-smoke.mjs`, `browser-test.mjs`. Update hub/server test navigation, READMEs, REPO_MAP and this tracker. Preserve all prior runtime/base-save changes.
- Whole-Draft validation invokes every existing semantic validator with actual authored packs/context/registry. Browser author review composes or imports a Draft; exports carry request, input versions/context, Draft, trace and repair audit. Hidden Reality is author-only context; no deployment or writable endpoint.
- Exactly one deterministic repair pass may remove invalid optional dynamic Incident/Event/complication choices and dependent Event choices. Request/pins/seed, world state, roles/objectives, Fact truth, recovery identity/cost/admission and prospective consequences remain immutable. Core/required failures stay unresolved. This bounded scope is explicit, not a fallback that rewrites Reality or silently changes a mission pattern.
- No authored story-beat pack exists; report that gap rather than inventing constraints. Add accessible request/seed/Knowledge-assumption controls, summaries, source/requirement review, rejection explanations and JSON import/export. Use isolated Edge server/profile; test export content and 390px layout with no live saves.
- Implemented whole-draft validation with all prior validators, immutable core validation before repair, deterministic optional-choice removal and mandatory final validation. Import uses current controls/fixtures; imported generation traces are explicitly unverified. Export includes request/context/versions/Draft/trace/repair audit. All author Reality stays private; no source runtime or save writes.
- Validation: 62 focused and 263 combined Node tests pass. Real Edge smoke passes composition/reproduction, control invalidation, export, import repair, invalid request reporting and expanded 390px layout with no runtime errors or live writes. Sandboxed Edge crashed during GPU startup; the same isolated test passed outside the sandbox. All three pattern exports pass nested JSON schemas; all authoring JavaScript syntax and diff checks pass.
- Architectural limits: no authored story-beat pack; general Profession methods, runtime Recipe binding, restoration, captive escort/cost/admission and Finalizer remain unresolved. Repair removal rather than replacement is the explicit benchmark scope and never alters established Reality or core result intent.

## Wave E completed implementation and validation

- Exact files: new `demos/shared/mission-author/results.mjs`, `demos/shared/data/mission-author/results.json`, `result-draft.schema.json`, and `demos/mission-authoring-simulator/results.test.mjs`. Extend adapters with compiled interaction targets; update optional-opportunity catalog bindings/versions, READMEs/navigation and this tracker. Preserve all prior changes and runtime consumers.
- Mandatory objective-role recovery intents and optional source-backed opportunities preserve original local subjects. Authored source-method references preserve exact requirements/effects for review, without choosing executable Recipes or assuming availability.
- Receiving objects use shared item definitions for handling costs and persistent physical snapshots; party cargo remains separate from base inventory. Holding references the existing captured-person debrief path but captive transport/cost/admission are unresolved. MISSION_EVACUEE refers to the operative's authored Send-to-Gate flow, not Holding intake. SAMPLE/DOCUMENT/NONE have no new invented routing adapter.
- Capacity assessments remain PENDING_SHARED_ADMISSION; no base file is read for implicit capacity tuning, no reservations/custody/transfers are applied, and no temporary over-capacity state is created. Prospective consequences reference admitted recovery, clue and NPC-method sources without applying Knowledge, NPC/campaign changes or institutional unlocks.
- Implemented `composeResults`, strict binding validation and semantic result-Draft validation. Result output nests the unchanged dynamic Draft; 0–2 optional opportunities are a benchmark selection ceiling, not a game rule. Required EVACUATE/RECOVER objectives fail if their actual subject/method/routing binding is missing. Optional recovery never duplicates a required subject.
- Catalog pack version 4 broadens RECOVERY to explicit source-backed Receiving/party/Holding bindings rather than requiring a Lab-specific role for every optional asset. No new canonical science, equipment, Recipes or custody enums were authored.
- Source methods preserve IDs, target/subject location, Profession/Tier/Tool requirements, charges/duration, Known/state/route prerequisites and conditional effects. Receiving quotes use current quantity and shared item handling metadata, including authored cargo. Persistent physical snapshots keep original custody, Reality, Knowledge and field findings.
- Prospective custody, clue Knowledge and source-method NPC consequences remain NOT_APPLIED. NPC effects refer to their actual affected NPCs; no institutional Theory/Pattern or campaign state is granted. Capacity stays PENDING_SHARED_ADMISSION; no base reservations or transfers occur.
- Validation: 56 focused Mission Author tests / 257 combined demo tests pass. Twenty generated result exports and updated catalogs pass nested JSON schemas; malformed count/admission/application/Knowledge exports fail. All authoring syntax and diff checks pass. No browser/runtime files changed or writable endpoint invoked in Wave E; no new browser smoke required.
- Architectural limits: captive escort and Holding cost/admission remain unresolved; the legacy portable Lab report lacks a shared item handling definition, so cost/party capacity are null/pending rather than fabricated. MISSION_EVACUEE is Send-to-Gate intent, not Holding intake/recruitment. SAMPLE/DOCUMENT/NONE require an explicit routing adapter. Static source methods cannot be relocated automatically with moved subjects; mismatched required routes fail clearly.
- Next Wave F audit: whole-result-Draft validation, story constraints only if authored, one bounded deterministic repair preserving Reality and explicit pins, browser request/seed controls, trace explanations and Draft/trace export. Keep author-only Reality separate from player Knowledge. Validate desktop/mobile browser interaction with isolated fixtures; do not write live saves during smoke tests.

## Wave D completed implementation and validation

- Exact files: new `demos/shared/mission-author/dynamics.mjs`, `demos/shared/data/mission-author/dynamics.json`, `dynamic-draft.schema.json`, and `demos/mission-authoring-simulator/dynamics.test.mjs`. Extend read-only adapters with compiled Incidents/Event bindings/Gate configuration and validated caller state snapshots. Update READMEs, navigation and this tracker; preserve prior Draft APIs and Offworld runtime.
- Select 0–2 compatible source Incidents, 0–3 source-backed Event possibilities and meaningful authored lock/Gate-time complications. Bind original subjects only at their current source locations; reject inactive/resolved hazards and absent/moved participants or targets. Selection never creates hazards, locks or timers.
- Detection/investigation/resolution/restoration are distinct semantic slots. Source observations and Incident contracts provide benchmark references; unavailable restoration methods remain UNRESOLVED. Runtime DORMANT/ACTIVE/RESOLVED states are snapshots, not replacements for the lifecycle.
- Event provenance references original bindings and origin Incident possibilities; preserve authored conditions/effects/delays without guessing thresholds or applying them. External/unselected follow-ups remain unresolved Finalizer dependencies. Complications describe actual locked transitions and existing Gate limit rather than authoring new restrictions.
- Implemented `composeDynamics`, strict dynamic binding/context validation and semantic Draft validation. Output nests the unchanged information Draft, preserving earlier truth/clue/role identity. Compiled Incidents/Event bindings and Gate data are read-only registry projections; no Offworld runtime/UI changes in this wave.
- Tests: 46 focused Mission Author tests / 247 combined demo tests pass. Twenty generated Drafts across seeds pass nested JSON schemas; malformed count/restoration/execution/Knowledge exports fail. All authoring syntax and diff checks pass. No new browser UI, so no browser smoke needed.
- Coverage: zero/multiple selections, all three Incident families, both Event families, source conditions/delays, restoration separation, inactive/resolved hazards, stabilized patients, cleared combat, moved participants, absent trigger origins, broken Event chains, opened doors, closed Gates, Act rejection, forged source/state/lifecycle claims, reordered bindings and upstream/Event-stream isolation.
- Benchmark authoring policy caps smaller complications at 2; this is a proof selection/pacing choice, not a canonical game rule. The pack has two Event families, so it need not fill the three-Event ceiling. Strict full-group subject admission rejects absent original participants rather than silently recreating/dropping people.
- Architectural limits: existing combat can produce gunfire but ranged Actor execution is not guaranteed by structural admission. Event follow-ups outside the chosen set remain explicit unresolved Finalizer dependencies. No restoration method adapter exists; nonempty restoration bindings fail instead of claiming that Incident resolution repairs a subject. Detection/investigation references preserve authored provenance, not general Theory-valid methods.
- Next Wave E audit: optional opportunities must point to actual local instances and legitimate authored methods; recovery intent must distinguish party storage, Receiving, Holding and evacuees without reserving capacity or changing custody. Consequences remain prospective and must not apply campaign state or institutional unlocks.

## Wave C completed implementation and validation

- Exact files: new `demos/shared/mission-author/information.mjs`, `demos/shared/data/mission-author/information.json`, `information-draft.schema.json`, and `demos/mission-authoring-simulator/information.test.mjs`. Update registry adapters, catalog proof pack/versions, Mission Author and demos READMEs, REPO_MAP and this tracker. Keep Wave B draft/schema/API intact.
- Resolve SUBJECT_LOCATION from the selected original subject's current Stage; DEVICE_PURPOSE from an authored Reality tag, never recognized identity or institutional Theory. Explicit information bindings point to compiled source observations/dialogue, their actual subjects, Knowledge outputs and requirements. Reject source/subject mismatches, incompatible current locations, missing Reality and absent legitimate learning paths.
- Existing observations/dialogue justify bounded benchmark Interaction Intents and Profession references. General domain opportunity derivation remains UNRESOLVED: fieldGuidance and executable curricula are missing. No quotas, new powers, executable Recipes or finalization bridge.
- Preserve source preconditions rather than guessing their runtime fulfillment. Missing Known prerequisites can describe future clue work; they must not become automatic Knowledge grants. Author trace/Draft contains private truth; a separate player projection exposes only supplied Known facts, never hidden Reality.
- Implemented `composeInformation`, strict authored binding validation, semantic information-Draft validation and `projectInformationKnowledge`. The information Draft nests the unchanged Wave B skeleton; its resolved author Facts do not mutate skeleton sockets or player Knowledge. Explicit INSPECT/TALK catalog rows reference existing sources; no canonical technology/content was invented.
- Adapter additions: compiled observations, dialogue, Recipes (read-only provenance), work groups and observation archetypes. Missing explicit Knowledge prerequisites require authored producer references; alternative/opaque conditions and full producer-chain executability remain unresolved. These references never select or execute a Recipe.
- Validated all three supported patterns. INVESTIGATE uses the operative's real identity/contact sources rather than claiming the archive establishes location. The Lab tactical observation preserves its Soldier requirement and group-search/characterization prerequisites; no generic Scientist capability is fabricated.
- Validation: 37 focused authoring tests and 238 combined demo tests pass; actual operative/device information exports and the catalog pass JSON schemas; malformed export negatives, all authoring JS syntax and diff checks pass. Tests cover reordering, separate information-version streams, original identity/current location, incapacitated speakers, missing Reality/Knowledge paths, Act restrictions and forged truth/source/method grants. No browser/runtime files changed this wave; no new browser smoke required.
- Architectural limitation: `deriveProfessionOpportunities` reports UNRESOLVED with missing fieldGuidance/curricula/adapter diagnostics. Interaction professions are explicitly BENCHMARK_REFERENCE projections of authored observations. This completes the supported proof wave, not general domain method derivation or executable dependency-chain validation.
- Next Wave D audit: inspect existing Incident/Event archetypes, compiled participants and authored lifecycle/trigger/effect semantics. Compose bounded compatible possibilities without retrofitting Offworld states or guessing thresholds. Keep Fact learning requirements and source identity intact.

## Wave B completed implementation and validation

- New files: `demos/shared/mission-author/{graph,draft,skeleton}.mjs`; `demos/shared/data/mission-author/skeletons.json`, `draft.schema.json`; `demos/mission-authoring-simulator/skeleton.test.mjs`. Update existing adapters/selection, catalog/context proof packs and catalog versions, Mission Author README, demos README, REPO_MAP and this tracker.
- Structural templates describe objective intent/dependencies, Fact Role sockets, required Stage purposes and role-to-purpose bindings; they contain no exact rooms/NPCs/thresholds/runtime Recipes.
- Adapter exposes compiled source Stages/transitions and entry Stage. Context authors explicit Stage-purpose/environment compatibility. Choose purposes before environments, then build a connected 4–8 Stage subgraph of authored physical topology. Preserve rooms and original role instance locations, including supplied current Stage snapshots; never teleport or duplicate persistent NPCs.
- Graph connectivity means potential authored adjacency, not resolved locked/concealed-door access or a secure evacuation route. Source transition references remain separate from future execution requirements. Generated objectives are semantic intent, not executable completion conditions.
- Bounded benchmark templates cover existing supported LOCATE_EVACUATE, INVESTIGATE and RECOVER patterns. Fact sockets remain explicitly unresolved for Wave C; no hidden Knowledge or institutional Theory is granted.
- Validate Stage count/connectivity/reachability, source identity, purpose/environment compatibility, complete role placement, objective dependencies and deterministic output. Fail missing/incompatible sockets/topology with author-facing diagnostics, without repairing Reality.
- Implemented deterministic route ties, required-purpose sockets, compatible filler selection and adjacent graph expansion. Context ordering does not alter output or trace; current Stage snapshots preserve moved NPC locations. Templates and Drafts reject forged identities, incompatible environments, cycles/dependency changes, known Fact truth and execution fields.
- Validation: 27 focused Mission Author tests and the combined demo command pass (228 total); actual generated Draft and catalog validate against JSON schemas; malformed Draft schema negatives, all authoring JavaScript syntax and diff checks pass. An initial combined run failed the existing dialogue evacuation test with NO_SECURE_GATE_ROUTE; it passed in isolation and the full rerun without changes to Offworld code.
- Provisional proof assumption: graphs select existing destination topology, not newly created rooms. Required routes use individually shortest paths; a union exceeding the Stage limit is unresolved even if a future repair might find a smaller alternative. Access/secure evacuation remains unresolved independently of adjacency. No browser UI changed, so this wave adds no browser smoke requirement.
- Next Wave C audit: resolve Fact Role truth from authored source state, attach legitimate information paths and Interaction Intents. Empty fieldGuidance and absent executable curricula still prohibit inventing Profession methods; use explicit unsupported diagnostics wherever authored capability data is missing.

## Wave A completed implementation and validation

- Implemented all 17 versioned catalog families with reference-backed Missing Operative samples, common JSON schema and semantic validation. Reserved unsupported hooks/patterns carry explicit unresolved reasons.
- Added validated request and caller context, cloned/frozen authority adapters, finite positive weighted selection, `canonical-fnv1a-mulberry32-v1` named streams, candidate filtering and immutable rejection/choice traces. Output is `mission-author-foundation-1`, not a playable Mission Draft.
- Foundation selects a valid destination → hook → compatible pattern → original local role IDs. Pins fail with diagnostics instead of switching. Hidden physical Reality can constrain authoring without granting Known identity or Theory. Incapacitated local subjects remain structurally present; Actor/conversation eligibility is separate.
- Reviewed compatibility: `compileMission` owns archetype/override resolution; physical snapshots preserve item/instance identity. The first adapter accepts only the explicitly registered compiled mission destination. Adding general world destinations and persistent named NPC profiles requires an additional adapter, not cloning current mission people.
- Tests: `node --test demos/mission-authoring-simulator/*.test.mjs` (15 pass); combined command including all existing demo suites (212 pass). Catalog JSON Schema positive validation and malformed-reference/unresolved-row negative checks pass. JavaScript syntax and diff checks pass. No new browser UI or writable endpoint in Wave A, so no new browser smoke was needed.
- Files added: six shared authoring modules; three proof-pack/schema files; `foundation.test.mjs` and Mission Author README. Navigation/docs changed: `REPO_MAP.md`, `demos/README.md`, this tracker. Existing Offworld/runtime fixtures were preserved in this wave.
- Unresolved architecture/data: empty Theory fieldGuidance, absent executable Profession curricula, no live campaign/Act/Haven/faction/NPC-profile/history adapter, and no Draft-to-Finalizer bridge. Benchmark Act identity and preferred-tier selection policy are explicitly documented authoring assumptions.
- Wave B is now complete above; Finalizer/runtime integration remains unimplemented; Wave C benchmark support is complete above. The earlier plan remains below for resumability.

## Wave A implementation decisions

- Exact new files: `demos/shared/mission-author/{contracts,catalogs,determinism,adapters,selection,trace}.mjs`; `demos/shared/data/mission-author/{catalogs,context}.json`, `catalogs.schema.json`; `demos/mission-authoring-simulator/{foundation.test.mjs,README.md}`. Update `demos/README.md`, `REPO_MAP.md` and this tracker. No runtime/UI deployment bridge in this wave.
- Context comes from explicit versioned caller snapshots; proof role bindings reference actual mission instances at their existing destination. Offworld compilation remains the authority for archetype/override resolution. Do not infer global persistent NPC profiles from local mission NPCs.
- Act selection policy for the benchmark: FORBIDDEN always rejects; RESTRICTED rejects unless that row is explicitly listed in the request; PREFERRED chooses from the admitted preferred tier before ordinary weighted rows. Preference never overrides Reality/Knowledge/role rejection. Policy is authoring behavior, not a campaign rule.
- Named deterministic streams use canonical sorted input and an explicit algorithm version; failed selections return diagnostics without changing source Reality or Knowledge. Full Draft, graph and runtime Recipes remain future waves.

## Wave A contracts and proof cases

`MissionAuthoringRequest` is a request contract, not an extra catalog. Catalog families from the handoff:

1. `MISSION_HOOK_CATALOG`
2. `MISSION_PATTERN_CATALOG`
3. `STAGE_PURPOSE_CATALOG`
4. `ENVIRONMENT_ROLE_CATALOG`
5. `MISSION_ROLE_CATALOG`
6. `GENERIC_NPC_ROLE_CATALOG`
7. `INSTANCE_ROLE_CATALOG`
8. `INCIDENT_CATALOG`
9. `EVENT_CATALOG`
10. `FACT_ROLE_CATALOG`
11. `CLUE_SOURCE_CATALOG`
12. `INTERACTION_INTENT_CATALOG`
13. `COMPLICATION_CATALOG`
14. `OPTIONAL_OPPORTUNITY_CATALOG`
15. `RECOVERY_ROLE_CATALOG`
16. `CONSEQUENCE_TYPE_CATALOG`
17. `ACT_AVAILABILITY`

Contracts must retain row/catalog IDs and versions, explicit compatibility constraints and references to existing semantic authorities. Exact fields follow inspected repo contracts; the handoff's suggested fields are not an existing JSON schema. Starter names are authoring vocabulary, not permission to invent executable behavior for every starter row. Unsupported content must remain explicitly unavailable/unresolved with a reason.

Act availability uses `AVAILABLE`, `PREFERRED`, `RESTRICTED`, `FORBIDDEN`; establish their selection behavior explicitly before implementing weights. Never use Act to overwrite campaign truth. Distinguish hook from pattern, mission role from role filler, Stage purpose from room/environment, and fact truth from a legitimate path to learn it.

Required named random streams: destination, hook, pattern, roles, graph, NPC, instances, facts, clues, Incident, Event and optional opportunities. Use stable IDs/order and catalog versions in reproducibility tests; partial regeneration should not reshuffle unrelated sections. No concrete RNG/hash algorithm is selected by this planning update.

Wave A tests should cover malformed/duplicate rows, cross-catalog references, unknown authority IDs, Reality/Knowledge/Act rejection, valid hook-pattern-role composition, exhausted candidate pools with useful diagnostics, input immutability, reproducibility and named-stream isolation. Prove the foundation with existing authored content, not a fully generated mission.

## Proposed file boundaries and compatibility audit

These are proposed paths, not existing modules or finalized architecture. Confirm them during Wave A inspection and record adjustments here before editing implementation.

| Area | Proposed files / existing authorities | Responsibility |
| --- | --- | --- |
| Shared authoring contracts | `demos/shared/mission-author/contracts.mjs`, `catalogs.mjs` | Request/row validation, references and semantic catalog lookup; separate from the Offworld compiler. |
| Deterministic selection | `demos/shared/mission-author/determinism.mjs`, `selection.mjs`, `trace.mjs` | Named sub-seeds, compatible candidate selection and explainable choices. |
| Existing-system adapters | `demos/shared/mission-author/adapters.mjs` | Read-only projections of existing Reality, Knowledge, campaign/Act, Theory, Professions, items, instances and Offworld archetypes. Missing systems get explicit unresolved inputs, not fabricated defaults. |
| Authored proof pack | `demos/shared/data/mission-author/catalogs.json` and corresponding schema | One simulator catalog pack covering the 17 families, with reference-backed sample rows. Keep existing Theory/item fixture packs intact. |
| Prototype/tests | `demos/mission-authoring-simulator/README.md`, adjacent `*.test.mjs`; later `index.html`, `app.mjs`, `style.css` | Document/test Wave A first; add the browser authoring surface in F. Follow the existing Node built-in test and static ES-module conventions. |
| Later composition | Modules under `demos/shared/mission-author/`, chosen per wave | Add skeleton, facts/opportunities, dynamic content, recovery/consequences and draft validation incrementally. Avoid a single procedural-storytelling module. |

Inspect these existing authorities before Wave A code:

- `docs/theory/architecture/theory-authoring-contract.md`, `theory-schema.md`, `knowledge-evidence-model.md`, `incident-model.md` and `recipe-bubble-contract.md`.
- `docs/theory/professions/README.md`, `profession-boundaries.md` and the relevant Profession curricula/summaries.
- `demos/shared/data/theory/stargate_theory_simulator_import.json`, `theories.json`, `base-classes.json`, `item.json`, `item.schema.json`, `instance.json`, `instance.schema.json`, `recipes.json` and `discovery.json` as needed for actual adapter references.
- `demos/shared/data/offworld/archetypes.json`, the current Missing Operative fixture, and `demos/shared/offworld/mission.mjs`, `field.mjs`, `campaign.mjs`, `recovery.mjs` for consumer boundaries. Read the Offworld README for current supported behavior.
- World/campaign/Haven/faction/NPC/Act/history sources located through `REPO_MAP.md`; establish whether executable data/contracts exist before promising adapters. Do not treat design prose as a live campaign database.

Compatibility issues to resolve and report before implementation:

- This handoff describes semantic authoring tables, not the current archetype-plus-overrides Offworld mission format. A Draft must not be passed directly to `compileMission` without a separately defined Finalizer bridge.
- Design Incident lifecycle and current Offworld prototype states are not equivalent. Preserve the design meanings without retrofitting Offworld runtime during Wave A.
- Recovery role names are semantic categories, not a new set of runtime custody enums. Capacity and transfers remain owned by shared systems.
- Named NPC core/Act profiles and campaign history may lack callable repository adapters. Generic NPC fallback cannot resurrect, move or clone a persistent named NPC.
- Theory/Profession guidance coverage, valid table references, and sample content completeness are unverified. Missing semantic data is a reported gap; never repair it with invented canonical rules.
- Existing Missing Operative Recipes and item costs include explicitly authorized provisional benchmark values. They are not universal authoring defaults or new production rules.
- Current Offworld evacuation still has benchmark abstractions; draft recovery intent must not silently present those abstractions as a complete secure-route/manifest implementation.

## Validation and context-reset protocol

- For each wave, update its status to in progress/complete, record exact modified files, test commands/results, remaining gaps and a concrete next action. Keep the active checkpoint at the top of this file current before a context reset.
- Run focused new Node tests after implementation; run existing affected suites when shared adapters/data change. Full existing baseline command: `node --test demos/serve.test.mjs demos/offworld-sandbox/*.test.mjs demos/portrait-simulator/*.test.mjs demos/room-staffing-demo/*.test.mjs demos/world-map-simulator/*.test.mjs`.
- Add the new test entry point to `REPO_MAP.md` and demo navigation only when it exists. Update relevant demos READMEs alongside supported behavior, and add an isolated browser smoke for the authoring UI in F. Save tests must use temporary/intercepted data.
- Original planning-only update read the supplied handoff and recorded this sequence. The subsequent user authorization started Wave A; completed implementation/test evidence is recorded above.

## Completed Offworld work and historical milestones

### Door access, report and overseer follow-up

- Holding, Processing and Lab doors offer charged Technician hacking or charge-free entry with the overseer's room codes. The Security Hall approach gives the mercenary briefing and codes; Processing entry raises suspicion and offers Diplomat/Soldier cover explanations before reporting questions.
- Scientist terminal work compiles a persistent party report from characterized Lab findings. Handing it to the overseer transfers the same instance out of party storage and adds 45 suspicion, with a spoken explanation that it is too detailed for mercenaries. Processing worker now supplies a closing explanation.
- Authored office work adds substantial suspicion. Send-to-Gate admission and completion, plus field recovery, use secure-route checks including unresolved potential opponents, not just traversability. Party withdrawal remains independent. Loot heading shows only the secured count, not the hidden total.
- Validation: 201 server/editor/Offworld/staffing/world-map tests and 27 mission-authoring tests passed. Expanded Edge browser regression passed after obtaining room codes, exercising both office approaches, isolating the Processing hazard and resolving yard guards before recovery; no runtime exceptions, recovery/reset and 390px layout passed. Syntax and diff checks passed. Report transfer and suspicion consequences also covered by four focused mission-flow tests.

The entries below preserve prior work. Their older blockers, wave letters and scope describe Offworld runtime milestones; they do not supersede the active Mission Author plan above.

### Holding, group search and recovery follow-up wave

- Talk is available beside the operative and in Holding room actions before signal detection; Send to Gate requires completed contact. Watched medical work adds 20 suspicion, other Holding work 30, conversation starts 45; authored Holding combat activates at 100.
- Main Hall → Security Hall → Overseer office is a routine visitor path. Generic locked-door hack/code Recipes remain compatible, but disappear when the door is not locked.
- Enlarged Lab to six tiles, with four search stations. Group search starts separate 60-minute one-Actor jobs for local active party members; only joint completion reveals the mounted device and Scientist focus. Resuming preserves assigned Actor identity and ordinary cancellation behavior.
- Shared provisional Supply crate, intel archive, mining component and terminal definitions use user-approved one-unit costs. Existing mission objects are persistent physical item instances. Direct/cargo recovery costs resolve from item.json; crates count their own cost plus contents. Null material economics are allowed only with construction/salvage disabled.
- Extraction omits blocked candidates. Recovery requests carry simulator/mission provenance; Reset releases this mission's reservations across runs/reloads and from setup. Legacy unmarked matching instance IDs are assumed to be prior demo recoveries; explicit other-mission reservations remain.
- Stable authored NPC/object positions reserve their places across visibility/custody changes and spread occupants across room tiles.
- Validation: all 197 automated tests passed across server, Offworld, portrait/editor, staffing and world map. Isolated Edge smoke passed four concurrent Lab searches, device reveal/work, terminal hacking, combat, debrief filtering, older Holding/Receiving reservation reset from setup and 390px layout. Shared item schema positive/negative checks, JavaScript syntax and diff checks passed. Provisional balance/material metadata and legacy reset attribution are documented in the Offworld README.


### Interaction wave and Analysis Lab benchmark wave

- User authorized phased implementation, then explicitly authorized provisional Lab Recipes using existing requirements.
- Interaction wave: removed redundant yard Question and timed operative Talk; operative contact is manual; office and directional Security Hall greetings are automatic. NPC openings leave the SGC responder empty; choices resolve a qualified local Unit and retain per-line identity. Honest office responses support parties without a Diplomat.
- Holding contact and specified nonmedical work have authored suspicion effects. Added a real yard combat Incident and diplomatic/Soldier checkpoint passage. Readiness plus checkpoint clearance or defeated guards permits early operative departure; social passage remains separate from physical security. Main Hall corridor is routine. Codes have authored sources and visible terminal acceptance.
- Lab wave: real Stage north of Processing at (4,0)/(5,0), preserving existing geometry. One complete mounted ASGARD_EM_RIFLE instance resolves stable metadata from shared item.json. Scientist characterization creates field evidence and a Research question; Technician II detaches the same device; Soldier interpretation follows the finding. No item identity, Asgard Pattern or Tier-II Theory is automatically granted.
- Provisional content: Scientist I/SCT1/3m/1 charge; Technician II/TECH_SERVICE_II/60m/1 charge; ordinary securing 3m/no charge; tier-I profession observations use PER 0. Existing Pulsed Power I and EM Acceleration I are starting benchmark principles, explicitly required for characterization.
- Generic item-state/finding transactions and Receiving recovery preserve identity, hidden Reality, instance Knowledge and physical state in physicalItem reservation payloads. Crate cargo remains compatible. Recovery reserves capacity before browser runtime commit; base room admission and institutional Research remain separate.
- Updated demos READMEs to remove historical claims that dialogue and character stat editing are absent. Full replacement-schema integration and evacuation manifests remain pending.
- Validation: all 188 automated tests passed across server, Offworld, portrait/editor, staffing and world map. Expanded Offworld Edge smoke passed with Lab work, dialogue responder selection, combat, debrief and 390px layout; no browser exceptions. Syntax and diff checks passed. Added rollback tests for invalid physical transitions and changed recovery identity.


### Expertise radar and Stamina resource presentation

- Replaced STA radar axis with EXP (0–8), including entered untrained rank 0 for base and branch paths. No Profession contributes 0. Existing I–III loadout validation and execution requirements are unchanged.
- Added HP and white Stamina meters to active-party cards; HP maximum comes from configured starting combat health. Stamina retains its existing 0–100 resource range; its editor label now says Starting Stamina resource.
- Editor progression changes update expertise preview without saving. No personnel values, movement costs, evacuation behavior or reset capacity changed in this slice.
- Validation: all 149 automated tests passed; character-editor and Offworld Edge browser smoke passed, including expertise radar assertions, white Stamina meters, existing gameplay regressions and mobile layout. Syntax and diff checks passed.

**Wave A foundation and combat feedback implemented. Wave B NPC details, dialogue runtime/UI, and automatic/revisit triggers implemented. The playable default mission now includes all eight authored conversations, displayed over the map. Explicit confrontation-to-combat escalation is supported. Full replacement mission integration, Recipe integration and repeat-policy reconciliation remain pending. Historical notes below describe earlier milestones and their then-current blockers.**

### All authored conversations / map overlay

- Integrated yard entry/return, holding worker/guard, operative, processing worker, Reynolds and McGuffin conversations into the existing mission. Added the authored holding worker and neutral NPC setup; no separate dialogue mission.
- Active dialogue is a scrollable map overlay, including at 390px width. Profession-gated responses check the selected speaker.
- Added generic NEUTRAL/KNOWLEDGE responses, silent SYSTEM NPC-state branches, bounded branch traversal and transactional node-entry effects.
- McGuffin escalation references existing incidents. Cover events are declared; existing evidence-purge behavior is retained. Operative readiness enables the authored return-yard trigger; full evacuation/manifest systems remain unfinished.
- Validation: 147 automated tests passed. Edge browser smoke passed with yard dialogue, desktop/mobile overlay, McGuffin branching, combat, recovery and no runtime exceptions. Browser setup uses a Diplomat cross-path on its selected Soldier to exercise authored diplomatic choices without bypassing eligibility. Syntax and diff checks passed.

### Playable outer-yard dialogue and explicit combat escalation

- Integrated the replacement's authored `dialogue-yard-entry` into the existing mission, with its two authored routine yard guards. No separate preview mission or invented conversation. Guards begin neutral, not automatically hostile.
- Entry scene starts on the first outer-yard visit; Profession-gated responses and authored Knowledge/suspicion outcomes are retained. The return scene is not integrated yet because its READY_TO_EVACUATE trigger relies on the replacement evacuation lifecycle, which the legacy mission does not implement.
- User authorized explicit `START_HOSTILE_INCIDENT`: converts a local confrontation to runtime COMBAT, preserving authored participants and inherited combat settings. No instant damage, health reset or mutation of frozen definitions; first round is scheduled normally. Invalid/locality/resolved checks participate in dialogue transaction rollback.
- Runtime combat resolution and Recipe context admission use the effective runtime incident kind. Escalation does not occur merely because a conversation begins or suspicion rises.
- Validation: 147 server/editor/offworld/staffing tests passed. Expanded Edge browser smoke passed, including the real authored yard greeting during normal mission travel, response dismissal, remaining combat/recovery flow and 390px layout. Syntax and diff checks passed.

### Resumed replacement-dialogue integration prerequisites

#### Conditional openings and start effects

- Added authored dialogue `variants`: the first matching `when` selects its start node; a fixed `startNodeId`, when present, is a fallback. No matching opening means unavailable, without consuming an automatic trigger.
- Added validated, transactional `onStartEffects`. Variant selection uses pre-start state, then start effects and initial node entry commit together. Failed starts leave state and the start ledger untouched. Selected variant IDs survive in conversation history.
- Added regression tests for alternate openings, authored-order precedence, fallback, malformed variants/effects, unmatched triggers and rollback.
- Provisional variant tie rule: first matching authored variant wins. Automatic starts still use the existing once-per-Stage-visit rule; the replacement specifies no explicit repeat policy.
- Shared-item integration is blocked by authored `AUTHORED_ITEM_PLACEHOLDER` with no definition, plus missing instance archetypes (`concealed_transition_marker`, `scientific_analysis_rig`, `concealed_safe_basic`). No replacement item or archetype was invented. Default mission remains unchanged and has no dialogue scenes.
- Validation: 138 tests passed across server, character editor, Offworld and room-staffing; Offworld Edge browser regression passed with no runtime exceptions and 390px layout; syntax and diff checks passed.

- Added validated transactional dialogue outcomes: `MARK_ROUTE_SOCIAL_PASSAGE`, `SET_EVAC_STATE`, and `ACTIVATE_OBJECTIVE`. Social passage records a Stage fact only, not physical security or evacuation route eligibility. Evacuation state changes do not move an instance or change custody.
- Dialogue `EMIT_EVENT` accepts the replacement's authored `event` field and legacy `eventArchetypeId`, rejecting conflicting IDs.
- Missing required starting-Knowledge/scheduled-event arrays now produce explicit compiler validation errors instead of an iteration TypeError.
- Replacement compilation also exposes incompatible direct archetype fields, missing archetypes/shared-item resolution and other schema gaps. No mission fixture has been copied, rewritten or enabled by this slice; authored conversations are not yet visible in normal gameplay.
- `START_HOSTILE_INCIDENT` targeting a `CONFRONTATION` remains deferred: the conversion contract must not be guessed. Next integration work is explicit next-schema/shared-item compatibility and repeat-policy reconciliation.
- Validation: 133 tests passed across server, character editor, Offworld and room-staffing; Offworld Edge browser smoke passed with no runtime exceptions and 390px layout; syntax and diff checks passed.

## User Request (Controlling Scope)

- Prepare for an offworld simulator update.
- Keep future changes focused in `demos/`.
- Track progress in this root-level file and update it as work proceeds.
- The mission will arrive in a separate handoff.
- Do not begin implementation before that handoff arrives.

The mission handoff arrived initially without an accompanying implementation request. The subsequent user request to find work to start implementing is the authorization for the bounded first slice recorded below.

## Reference Handoff Reviewed

Reviewed `C:\Users\Powel\Downloads\offworld_runtime_update_handoff.md`.

The document supplies design and implementation guidance; implementation authorization comes from the user's request. Its intended implementation areas are:

- `demos/offworld-sandbox/`
- `demos/shared/offworld/`

The handoff explicitly says not to rewrite `missing-operative-001.finalized.json` as part of the runtime work and not to hard-code the Missing Operative mission. A replacement/finalized mission is expected separately.

## Mission Handoff Reviewed

Reviewed together:

- `C:\Users\Powel\Downloads\missing-operative-001.finalized.next-copy.json`
- `C:\Users\Powel\Downloads\missing-operative-001-notes.md`

Authority distinction:

- The JSON is authoritative mission content targeting the proposed next Offworld runtime schema.
- The Markdown provides design intent and interpretation guidance; it does not override the JSON's authored mission content.
- The earlier runtime handoff remains the architectural guide for generic implementation waves.
- The user's request controls whether work begins and limits repository changes to `demos/` apart from this root tracker.

The mission fixture exercises the generic runtime requirements described by the runtime handoff, including neutral NPC state, suspicion/hostility, dialogue, revisit behavior, concealment, exact-instance recovery, evacuation categories, secure routes, Gate context, and extraction handoff. It must remain benchmark data rather than become a runtime special case.

## Future Work Described by the Handoff

The proposed work is divided into these reviewable waves:

1. Contextual action admission and NPC state foundation.
2. Dialogue runtime and portrait UI.
3. Shared party inventory and field recovery.
4. Extraction manifest and base handoff.
5. Gate traffic/context system.
6. Concealment and shared authored-item integration.
7. Schema/compiler validation, migration behavior, tests, and documentation.

All future runtime work must remain generic and preserve the separation between authored mission data, resolved mission definition, runtime state, and mission result.

## Work Completed This Session

- Read the runtime update handoff.
- Recorded its intended scope and constraints.
- Created this task tracker.
- Reviewed the replacement mission JSON and its companion notes.
- Confirmed their authority relationship and alignment with the runtime handoff.
- Initial review made no runtime changes; the subsequent implementation request started the work below.

### First implementation slice: contextual Recipe admission

- Added pure `recipeAdmission` in `demos/shared/offworld/field.mjs`, evaluated before ordinary Recipe eligibility. Non-admitted actions return `HIDDEN`, so existing map and context rendering omit them and `startWork` rejects them without mutation.
- Added compiler validation for optional Recipe `availabilityContext`: `normal`, `activeIncidentKinds`, and `requiresSecureStage`.
- Admission uses active local Incident kinds, not action names. Dormant Combat Incidents do not themselves suppress ordinary actions. Legacy active hostile instances count as combat context; legacy `allowHostiles: true` remains the compatibility opt-in. Explicit context supersedes this flag.
- Explicit context requires every simultaneous active Incident kind to be admitted. Omitted `normal` defaults to true; omitted active kinds admit none. Legacy noncombat admission remains unchanged.
- Added six regression tests in `demos/offworld-sandbox/admission.test.mjs`; updated the existing dialogue and browser tests to expect omitted ordinary actions during hostility; documented implemented semantics in the sandbox README.
- Validation: all 82 Offworld and room-staffing tests passed. Edge browser smoke passed, including ordinary-action omission, existing interactions, no runtime errors, and 390px layout. `git diff --check` passed.
- No mission JSON or shared archetype data changed. No mission-specific branches added. `.migration-preview/` left untouched.
- Provisional semantics for review: every simultaneous active kind must be allowed; legacy hostile-instance state remains supported until NPC-state migration. This is only a Wave A slice, not full next-schema support.

## Next Action

### Second implementation slice: NPC state foundation

- Added `demos/shared/offworld/npc.mjs`: persistent authored NPC state, clamped suspicion/hostility changes, disposition changes, atomic multi-NPC confrontation effects, and reusable NPC conditions.
- Integrated initialization, Recipe/campaign effects, compiler validation, contextual confrontation admission, and commit-time admission revalidation.
- Neutral armed NPCs opt in through authored `npcState`; legacy fixtures retain their existing behavior. Neutral participants no longer automatically resolve a dormant Combat Incident. Explicit engagement activates neutral combat participants.
- Added `demos/offworld-sandbox/npc-presentation.mjs` and map integration for visible current-Stage alert indicators. No hidden identity or numeric labels are exposed; remote/hidden Stages do not show alert state.
- Added eight NPC regression tests and browser checks for symbolic alert progression and damage-free confrontation. All 90 Offworld/room-staffing tests passed; expanded Edge browser smoke passed, including 390px layout and no runtime errors.
- No mission JSON or archetype catalog rewritten. The current mission has no authored NPC state, so new indicators are exercised by synthetic tests rather than forced into legacy content.
- Architectural gap: proposed `START_HOSTILE_INCIDENT` references a `CONFRONTATION` Incident without defining conversion into the existing Combat execution schema. Deferred rather than silently converting kind or inventing an Incident. Alert values never automatically start combat.
- Remaining UI work: known-identity NPC portrait/details and mobile tap interaction; dialogue remains Wave B.

Resolve the authored confrontation-to-combat schema gap, then continue known-identity NPC presentation and Wave B dialogue. Do not migrate or rewrite the benchmark mission as a shortcut. The replacement next-schema JSON is not yet loadable as a complete mission.

## Repository Note

### User priority update: unified writable launcher

- Standardized all demo launch documentation and the hub on `node demos/serve.mjs`; default port stays 8001, with an optional port argument.
- Server startup now points at `/demos/`, validates ports, and reports occupied ports clearly. Added read-only capability endpoint and hub detection for writable/static mode.
- Added `demos/README.md` covering all demos, existing save scope, local JSON versus browser storage, and GitLab Pages limitations. Static browser demos remain deployable; shared JSON writes require the local server or a future authenticated backend.
- Added `demos/serve.test.mjs` for all five demo entry points and static-host detection.
- Validation: all 92 server/offworld/staffing tests passed; Edge browser smoke passed including 390px layout; syntax and diff checks passed. The all-demo test exposed a Windows drive-letter casing rejection in static serving; canonicalizing the server root fixed it without weakening the containment check.
- Wave B has not been implemented. Combat feedback was addressed in the priority slice below rather than folded into the launcher change.

### User priority slice: combat feedback and pacing

- Added browser-only `combat-feedback.mjs` for three-real-second pacing per authored combat round, no background-tab multi-round catch-up, and transient damage frames independent of simulation time.
- Integrated rising/fading damage above visible NPC and Unit map tokens; simultaneous hits stack. Damage frames expire after 1.8 real seconds even when simulation is idle. Bulk Wait is disabled during combat.
- Combat hit ledger now records actual health lost, capped at remaining health; authored damage rules, simulation round durations and mission fixture JSON remain unchanged.
- Added deterministic pacing/reset/expiry/rendering/overkill regression tests and live browser checks for round 0 before three seconds, round 1 with damage, and damage expiry.
- Validation: all 96 server/offworld/staffing tests passed. Expanded Edge browser smoke passed including combat timing/damage expiry, recovery, return/reset, no runtime errors and 390px layout. Syntax and diff checks passed.
- Presentation choice: combat time advances to the next authored round boundary after each three-real-second wait; ordinary non-combat work keeps its existing accelerated timer. This does not change runtime API semantics or authored simulation durations.
- Next planned work remains known-identity NPC presentation and Wave B dialogue. The confrontation-to-combat schema gap is still unresolved and has not been silently reconciled.

### Combat tuning and next-wave NPC presentation

- User explicitly requested more NPC HP: raised authored guard-combat archetype HP from 45 to 150. A lone NPC lasts exactly three rounds against four 18-damage party members; concentrated-fire multi-NPC encounters last longer. No party-size scaling, random targeting or death mechanic introduced.
- Updated only the legacy mission's descriptive combat note to match the authored HP tuning; no mission structural migration or next-copy rewrite.
- Staggered individual shot tracers/damage popups over up to one second per round, with short individual tracers; runtime outcomes stay deterministic.
- Started Wave B presentation: visible current-Stage NPC tokens support mouse hover, keyboard focus and mobile tap details. Panel uses playerLabel and visible state, reuses shared portrait renderer, and labels generic portraits when appearance is absent. Hidden Reality names/roles are never read.
- Added visibility/identity safety tests, three-round durability regression, staggered-frame checks and browser portrait interaction coverage. All 99 automated tests passed; syntax/diff checks passed. Extended Edge browser smoke passed, including known-label portrait interaction, three-second round pacing, staggered damage expiry, completed longer encounter, recovery, reset and 390px layout. Expiry assertion polls for the quiet gap rather than assuming simultaneous shots.
- Remaining authored-data gap: current fixtures have no NPC appearance records or generic knowledge-backed known-name/role projection. Those are not fabricated. Dialogue runtime is the next implementation slice; confrontation-to-combat conversion remains unresolved.

### Wave B: first dialogue graph/runtime/UI slice

- Added optional `dialogueScenes` compiler validation and generic dialogue runtime using the handoff's scene/node/response field names. Nodes preserve speaker side, transcript, conditions and authored effects; responses validate selected-speaker Profession/tier/Knowledge. Effects support NPC state, Knowledge and mission events, with draft/commit rollback on failure.
- Added explicit eligible Talk scene controls and SGC speaker selection; dedicated lower-screen portrait/speech/response UI. Either portrait side can be SGC. Knowledge enables disclosure but does not force it; authored consequences, including suspicion increases for true answers, are preserved.
- Active dialogue pauses browser work/combat progression, makes unrelated controls inert and blocks runtime time/movement/extraction/Gate/work/station/engagement execution. Continue advances next-node lines explicitly; terminal speech stays readable until Finish. No global Leave response invented.
- Added runtime conversation state/history and export support. No mission JSON modified for this slice; legacy Recipe-result conversations remain unchanged.
- Scope gaps retained explicitly: `startWhen` scenes are not admitted until automatic trigger/revisit support exists; Recipe START_DIALOGUE, visit counts, repeat policy and proposed untyped next-schema conditions remain pending. Exactly one ACTIVE_SGC_SPEAKER is supported. Confrontation-to-combat conversion and knowledge-backed name/role projections are still unresolved.
- Added graph/reference/requirement validation, speaker-specific eligibility, optional disclosure, persistent history, atomic rollback and execution-blocking regressions. All 104 automated tests passed. Expanded Edge browser smoke passed including two portraits, reversed SGC side, selected response/terminal Finish, no runtime errors, 390px dialogue layout, and existing combat/recovery/return/reset. Syntax and diff checks passed.
- Next slice: authored start triggers/revisit counters and Recipe dialogue integration, after reconciling trigger semantics with the replacement fixture. This is not complete next-schema mission support.

### Automatic dialogue starts/revisits and user-requested stat radar

- Added persistent Stage visit counts: Gate deployment starts at one; actual movement entries increment once, failed movement/refresh does not. Automatic dialogue checks first-entry/return predicates without resetting NPC state.
- Added validated authored startWhen operators: all, knowledge, stageVisitCount equals/minimum, npcDispositionIn, instanceEvacStateIn. Existing evacState is read only; SET_EVAC_STATE and full evacuation behavior remain missing.
- Re-evaluate starts at movement, Gate choice, time boundaries and browser render. Return-route traversal stops when a conversation starts. Provisional repeat behavior is once per scene/current Stage visit; authored scene order breaks ties. No repeat field is supplied by the handoff fixture.
- Recipe integration deferred: the supplied next-copy authors no Recipe dialogue field/effect, so no START_DIALOGUE schema was invented.
- User asked for read-only radar stats: added shared stats-radar.mjs for PER/STA/END using existing maxima 10/100/10; deployment and active-party cards use it. Removed deployment numeric editing for those stats; Tier/branch/equipment remain configuration controls.
- Existing portrait/character editor edits appearance only, not gameplay stats. Stat editing there remains a reported gap rather than falsely linking to a working editor.
- Remaining scope: unfinished Wave B trigger/repeat/Recipe/effect integration and Wave A confrontation conversion, then five full Waves C–G. No replacement mission migration performed.
- Validation: all 111 server/offworld/staffing tests passed, including visit tracking, authored entry/return/Knowledge triggers, repeat suppression, persistent NPC state and radar normalization/read-only rendering. Expanded Edge browser smoke passed with 54 deployment charts, four active-party charts, no stat inputs, existing dialogue/combat/recovery checks, no runtime errors and 390px layout. Syntax and diff checks passed.

An existing untracked `.migration-preview/` directory was present when this task began. It was not inspected or changed as part of this work.

### Character editor stat access

### Replacement dialogue Knowledge alternatives

### Field detection and recovery effects

### Shared portable party storage runtime

- Added persistent `partyStorage` instance-ID list and transactional `ADD_TO_PARTY_STORAGE`. Requires explicit PARTY_STORAGE or PARTY_STORAGE_WHEN_COLLECTED recovery category, local Stage and LOCAL custody; duplicate collection fails without committing state or charges.
- Portable objects retain their existing instance state/identity, leave local custody and automatically return with the team at extraction. Results export the storage list and persistent instance states. Extraction checks storage integrity before mutation.
- No inferred portability, carrying limit, per-Unit backpack, bulky movement or automatic knowledge reveal. Authored definitions remain in the immutable mission database; instance IDs reference them rather than cloning new items.
- Validation: 145 server/editor/offworld/staffing tests passed; syntax and diff checks passed. Browser smoke not rerun; no UI or mission fixture changed.
- Pending: visible inventory UI, shared-item definition integration, evacuation eligibility and manifest/base handoff. Default mission still has no authored dialogue scenes; replacement remains blocked by schema/content defects and confrontation conversion.

- Implemented validated Recipe `SET_DETECTION_STATE` and `SET_RECOVERY_STATE` effects using the handoff's named state vocabularies.
- Effects change only persistent instance state and produce instance-change ledger entries. They do not move assets, change custody, add party inventory or imply extraction eligibility.
- Existing bubble transaction rollback preserves prior state and charges when an effect cannot commit.
- Validation: 142 server/editor/offworld/staffing tests passed; syntax and diff checks passed. Browser smoke not rerun for this runtime-only slice.
- No mission fixture changed. Shared party inventory, evacuation eligibility/manifest, replacement schema/content blockers and confrontation conversion remain pending.

- Added `requirements.knowledgeAny`: at least one authored Knowledge ID must be known; existing Knowledge, knowledgeAll, Profession and selected-speaker requirements still apply.
- Rejects empty/malformed alternative lists. Tests cover either alternative, missing Knowledge, combined requirements and wrong selected Profession.
- Validation: 140 server/editor/offworld/staffing tests passed; syntax and diff checks passed. No browser smoke rerun for this runtime-only slice.
- Replacement remains unloaded. Direct archetype fields versus legacy overrides need an explicit schema contract; missing archetypes/items, geometry/reference defects and confrontation conversion remain blockers. No fixture edits or invented content made.

- Follow-up: moved radar charts out of collapsed deployment details onto main roster cards. Deployment now exposes only configured Tool dropdowns; no Tier/branch/charge editing there.
- Character editor owns base Tier, cross-path/specialization and availableTools type/charges configuration. Base Profession stays authored roster identity. Preserves the two equipped-slot/qualified-second-slot contract; no automatic tooling grants.
- Added optional validated availableTools array alongside toolSlots; legacy choices derive from equipped Tools. This is configuration, not physical inventory/custody. Saves validate eligibility, unique types, charges and equipped/list consistency.
- Validation: 128 tests passed including configured-list validation and atomic server persistence. Character-editor and Offworld Edge browser smoke passed, including progression/Tools saves, restricted deployment dropdowns, radar cards, mission flow and 390px layout. Syntax and diff checks passed.

- Added separate PER/STA/END editing and live radar preview in the existing portrait editor for selected shared roster members. Part studies cannot edit character stats.
- Loads the same deployment defaults, shared loadouts and browser overrides as Offworld. Reuses validated personnel save endpoint/browser fallback; preserves Tier, branch and Tool slots. Appearance remains separately saved presentation data.
- Refresh other demos to pick up saved stats; an already-running mission is not modified. Reset stats discards only unsaved stat edits.
- Added character-stat regression tests and expanded Edge portrait browser smoke for invalid values, reset, browser save/reload and mobile layout. No authored fixture values changed by this slice.
