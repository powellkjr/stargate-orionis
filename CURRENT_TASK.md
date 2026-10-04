# Current Task: Offworld Simulator Runtime Update

## Status

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
