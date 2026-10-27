# Current Task: Unity vertical slice and shared cargo reconciliation — October 25, 2026

**Status: In Progress.** Updated to include the user's active Unity migration
work and cargo handoff. The existing art workstream remains below; it has not
been completed or discarded.

## Active scope and acceptance criteria

- [ ] Repository checkpoint and push (In Progress; October27). User explicitly
  requests one commit of all current repository work and a push. Include the
  game/shared-data migration, independent labs, tools, docs and review evidence.
  Preserve established local-only vendor/cache exclusions; add missing Synty
  and Unity recovery-backup ignore entries. Inspect staged files, whitespace,
  credential patterns and relevant existing Node checks, then commit and push
  current branch unity-migration-wave-0 to origin without rewriting history.
  Progress: all725 changed files staged after preserving vendor/cache/recovery
  exclusions. No oversized repository artifacts, credential filenames or known
  credential-content patterns found. Bootstrap snapshot is current; restaged
  the Room Art Lab's stale catalog after recent shared-data changes. All35 Node
  checks across6 focused files pass. Source/data staged whitespace checks pass;
  preserved Unity-generated empty-field spaces and Markdown hard breaks. Worked
  around directory-listing restrictions for36 authored sprite files using exact
  temporary copies without changing original files/permissions. No unstaged or
  untracked source work remains. Checkpoint commit7966de9 created successfully
  with all725 files. Push remains unfinished: automatic approval review rejected
  `git push origin unity-migration-wave-0`, requiring the user's explicit approval
  of the external destination https://github.com/powellkjr/stargate-orionis.git.
  No network push completed. Next: obtain destination approval, push this branch
  (including its two earlier local commits) and verify local/remote HEAD equality.

- [x] Party-panel room-action mockup (Complete; October27). User requests a
  picture of the mission UI with party panels at the bottom and available room
  action hexes placed on the Units who can perform them. Produce a visual concept
  using the established dark mission UI/pixel portraits; this request is a mockup,
  not implementation. Show a room with differentiated Unit actions and preserve
  the mission map above. Acceptance: deliver the picture for layout review.
  Delivered one inline image using the built-in imagegen skill/tool, based on
  the existing mission screenshot. Four bottom party cards carry actor-colored
  action hexes; an active Scientist action and prerequisite-locked action show
  the proposed states, while other cards demonstrate available/empty action
  areas. Map remains above the dock with a selected-action context strip.
  Inspected the generated picture for card fit, readable labels and placement.
  Preview-only concept; illustrative action examples do not define new game
  rules. No runtime/UI implementation, campaign changes or tests needed. Image
  delivered inline and remains in the tool's generated-images location.

- [x] Authored-flow PlantUML exporter (Complete; October27). Add a repeatable
  tool that reads the shared source mission/dialogue and processing definitions
  and generates reviewable PlantUML in the repository. Preserve authored text,
  branches, conditions, effects, Actor/Tool requirements and processing links;
  distinguish declared dependencies from inferred runtime routes. Support a
  different source file and document regeneration/rendering with the user's
  local PlantUML jar. Acceptance: focused export/reference/escaping/freshness
  checks, generated diagrams and rendered PNGs where the local jar is available.
  Do not edit authored game data or operate/reset the Unity campaign for this tool.
  User requires automatic build integration. Added a generic Unity pre-build
  callback, covering Windows Slice, batch and Build Settings; generation precedes
  existing snapshot validation. Snapshot export/check also regenerates/verifies
  the diagrams. Export covers all9 authored dialogues (including variants,
  Continue and silent NPC branches), all50 resolved mission Recipes by Stage,
  passive observations/work-groups/state/Knowledge gates, base Recipe graphs and
  processing admission/tag transitions. Generated26 diagrams and26 local PNGs.
  Independent tool supports alternative mission/catalog/output paths and check
  mode. Thirteen Node checks pass; rendered layout and Unity hook verification
  remain in progress. No campaign state touched.
  Completed: tools/export-flows.mjs and its focused tests; generated index,
  source-hash manifest,26 .puml and26 PNGs in docs/generated/flows; Unity
  AuthoredFlowBuild preprocessor and WindowsSliceBuild delegation; bootstrap
  exporter/generated snapshot and REPO_MAP/Unity README/playtest guide. Diagram
  labels expand nested requirements/effects for review and preserve complete
  text/IDs. Changed definitions invalidate their old PNG; removed definitions
  clean only manifest-owned diagrams/previews and leave user notes intact.
  Final verification:13/13 Node checks pass, zero failures; freshness checks pass
  for both diagrams and bootstrap; all26 PNGs render with the user's local
  PlantUML1.2024.6 jar/Java/Graphviz. Opening dialogue render inspected. Game
  Editor compilation succeeds and the actual IPreprocessBuildWithReport callback
  completes generation, PNG rendering and snapshot validation successfully.
  Existing Play mode remains running; no Play/Stop, mission reset, campaign
  Save/Load or full player build was needed for this tool verification.
  Assumptions/limits: exports document the complete authored design, including
  unported branches. They do not infer room custody routes or institutional
  Knowledge. Build-time text export is mandatory; PNG rendering is automatic
  when a local jar is available, otherwise explicitly skipped. An available
  renderer failing is a build error. Standalone alternate sources use --mission,
  --archetypes, --items and --data-dir. No unfinished work for this exporter.

- [x] Structural presentation handoff, dialogue usability and lab actions (Complete batch;
  October27). Read docs/room-structure-game-handoff.md and integrate only its
  primitive perimeter walls/junctions, split sliding doors and CT cap lights
  into base/mission presentation, preserving floors, physical room/Group IDs,
  inputs, visibility and runtime door authority. Inspect authoritative base
  door mappings and mission CT/door anchors; report missing mappings explicitly.
  Separately fix the confusing opening dialogue and verify all currently ported
  dialogue branches through real controls, including requirements, Actor choice,
  terminal Continue, save/load and return to movement. Acceptance: focused pure
  geometry and existing UI walkthroughs, hidden exits preserved, no art-lab
  changes/vendor imports, clean ordinary Bootstrap restart; normal Load/Reset
  rather than backing up/restoring campaign position.
  User adds that lab symbols still have no actions. Extend this batch to connect
  the authored lab workflow, including its four-station parallel search, passive
  profession observations, characterization, prepared same-instance recovery,
  authored discovery question and report record. Preserve prerequisites and
  hidden identity; do not invent missing physical report/item definitions.
  Progress: connected the authored lab work-group and its four sticky station
  Actors, one-hour parallel completion, passive observations, device state
  prerequisites, discovery question and report record. Added schema34 with
  bounded schema33 mission/cargo compatibility. Added readable response/speaker
  dialogue controls and numbered map choices. Primitive structural adapters now
  project base Groups and known indoor mission perimeters; base door anchors and
  mission CT remain absent and are deliberately not inferred. Node projection
  checks7/7 pass. Initial Unity checks exposed legacy schema7 missing-field
  admission and two test-harness expectations; corrected, focused rerun underway.
  Remaining: finish lab/dialogue UI walkthroughs, validate structural rendering,
  rerun the existing cargo route, ordinary Bootstrap cleanup and normal Load/Reset.
  Validation progress: all five ported dialogue graphs' reachable responses pass
  through the readable controls, including speaker requirements, terminal replies
  and save/load. Geometry checks pass all16 door masks, joins, shared separators
  and CT fixtures. The full lab route passes search/save/load/preparation/report/
  extraction/Receiving/Containment/Analysis with unchanged physical ID/payload.
  Existing six-item safe/crate/aim/Down/confirmation UI route also passes. Field
  checks18/19 pass including new schema33 migration; pinned schema7 exposed an
  older expansion branch copying incomplete NPC/subject scope into newer data.
  Fixed that branch to add only initial definitions, preserving old Knowledge.
  Explicit gap: report/question records persist in the expedition through
  extraction and save/load; the base knowledge-cargo database handoff is not
  ported. Reset mission clears those expedition records. No physical report
  definition or institutional Theory has been invented to hide this gap.
  Follow-up: pinned schema7 migration passes after additive NPC/subject expansion;
  all19 focused field checks now pass (18 initial passes + corrected failure).
  Normal persistent Load succeeds at tick19870 under schema34. Live inspection
  found a clipped dialogue heading and no scroll affordance; fixed heading
  padding and added response count plus a visible draggable list scrollbar.
  Final validation:19 field EditMode checks pass across the focused run and
  corrected legacy rerun;4 PlayMode checks pass (all ported dialogue branches,
  structural geometry, lab-to-base device route, existing six-item cargo/aim/Down
  route);7 Node projection checks pass. Final dialogue rerun passes after the
  scrollbar fix. Exact reference geometry/light copies verified with namespace
  substitution only. Snapshot freshness and focused diff checks pass. Live
  dialogue/base/indoor-map captures inspected; heading and scroll affordance are
  visible, structural colors render, original floors/controls remain present.
  Pipeline cancelled, test controllers removed, ordinary Bootstrap Play/Stop/
  restart succeeds with zero residual controllers. Final normal Load reads
  tick19870 and3 existing cargo instances, then Reset mission succeeds. Ordinary
  Play remains running at the briefing. No campaign-position backup/restore or
  persistent save write performed.
  Files: MissionField/MissionFieldWorkflows/MissionTravel/PersonnelRecovery and
  CampaignSession; FieldReader/FieldSave/TravelSave/CampaignSaveCodec/
  MissionMapDefinition/MissionMapReader/BootstrapReader; MissionDialogueView,
  MissionMapView/MissionMapNavigation/MissionTravelPanel/OffworldCharacterPool,
  RoomMapView/PresentationArt and Presentation/Structure; snapshot exporter,
  generated bootstrap, pinned pre-lab mission/cargo, Node test, MissionFieldTests,
  LabDialogueStructureTests and the existing SpatialPlanningTests walkthrough;
  REPO_MAP, playtest guide, structural handoff and this task.
  Provisional presentation mapping: two wide mission door boundaries use the
  existing first shared edge and are explicitly flagged; base door cell anchors
  and mission CT remain unauthored. No additional connectivity or CT invented.
  Next actions outside this completed batch: base knowledge-cargo handoff for
  report/question records; authored base door anchors and mission CT; remaining
  Office/supervisor dialogue/checkpoints in the broader Offworld migration.

- [x] Room Art Lab input capture and structural game handoff (Complete;
  October 27). Fix asset-panel gestures leaking into room orbit when crossing
  the preview. Require explicit gesture ownership, preserve prop dragging and
  panel controls, and regression-check fast crossing/cancel/normal orbit.
  Prepare a game-chat handoff limited to the current primitive perimeter walls,
  split sliding doors and CT cap lights, including exact sources, dimensions,
  authority boundaries, mission handling and acceptance checks. Do not integrate
  into the game or operate its Editor. Implemented pending asset-row mouse
  capture before preview input, hot-control ownership and explicit preview
  MouseDown requirement for orbit; prop gestures own their capture too.
  Handoff written at docs/room-structure-game-handoff.md with copyable request,
  exact sources/transforms/colors, runtime adapter scope, base grouping and
  mission visibility/door/CT gaps. Node checks3/3 pass; catalog restaged against
  concurrently updated authored sources. First40-test run timed out inside an
  automated native drag; added a non-native start seam for the routing test.
  Closed/reopened only the isolated Editor normally to clear its stuck test
  request; saved user placements/assignments remain intact. Final suite:40/40
  Editor tests passed, zero failures/skips; Node3/3 passed. Regression verifies
  orphan panel-origin drag cannot orbit, fast first movement is captured before
  preview input, Escape releases capture, and a fresh preview press orbits with
  the reversed pitch. Editor restored in Edit mode with saved user props,
  clean active scene, zero test controllers, no placement errors and cleared
  test state. Handoff source references and focused whitespace checks pass.
  README/REPO_MAP updated. Handoff explicitly excludes furnishings/browser/UI/
  vendor imports; records missing base door-edge mapping, mission CT and the
  need to preserve/project transition direction/edge anchors. Those are future
  game integration decisions, not invented canonical data. Next actionable step:
  give the linked handoff/copyable request to the game chat for structural-only
  presentation integration; no game implementation performed in this workstream.

- [x] Offworld lab/safe, hex continuity and cargo audit (Complete batch; October27).
  User reports empty mission Analysis lab/hidden safe, confirmation replacing
  the wrong hex, inconsistent Actor border colors, concentrated combat damage,
  and confused/lost items along mission -> Receiving -> Containment -> Analysis.
  Inspect authored content before filling gaps; explain the existing targeting
  rule before changing combat semantics. Implement existing authored lab/safe
  coverage where the current generic runtime supports it, preserve selected hex
  position for confirmation and assigned Actor colors, and trace/fix custody and
  instance continuity across the whole cargo route including save/load.
  Acceptance: focused consolidated UI/domain walkthroughs, stable instance IDs
  and fallback reservations, accurate labels/queues, current authored projection,
  clean ordinary Bootstrap restart. Continue prior user preference: no campaign
  position backups/restoration; finish by normal Load and Reset mission in Play.
  Progress: fixed the Analysis importer to include every additional cache's
  physical items, not just the primary crate. Added generic object markers for
  empty prefab profiles; safe intel/loot now project from authored physical data
  as extraction marks, with a pinned schema32 cargo catalog for compatibility.
  Confirm occupies the selected Actor/action position; Cancel sits beside it.
  Single-candidate and active-work hexes retain the actual Actor border color.
  Added an all-cargo locator and stable non-revealing cargo references to track
  custody across queues. User approved random living opponents per attack for
  both sides. New fights persist a targeting seed (schema33); historical fights
  without seeds retain their old outcomes. Visual aim reads the actual upcoming
  shot plan. Six Node projection tests pass. Combat tests initially found two
  now-obsolete focus-fire assertions and two stale fixture/migration assumptions;
  those are updated, with direct seeded replay/legacy preservation coverage.
  Consolidated UI walkthrough now covers both safe packages, confirmation/color,
  lab bench markers and all six physical items through save/load, Receiving,
  Containment reservation, staffed Analysis and return custody. Awaiting results.
  Lab search is still explicitly outside this correction: authored four-station
  parallel one-hour search, device characterization/detachment and report cargo
  need the generic work-group/item-state/discovery adapters. No shortcut Recipe,
  fabricated loot, unlocked device identity or hidden Knowledge has been added.
  Validation now passes:12/12 combat EditMode tests, the expanded six-package
  PlayMode walkthrough, the full rescue/resource/Analysis/equipment/redeployment
  PlayMode route, and6/6 Node snapshot tests. A final presentation check found
  nearby safe targets could overlap; added generic hex collision avoidance and
  reran the combined walkthrough with actual mouse raycasts for both safe marks:
  passes. All six item IDs/payloads remain unchanged through Containment's reserved
  storage, temporary lab custody, mid-examination save/load and return to storage.
  Test uses legal CT3 Containment capacity for six simultaneous reservations;
  ordinary CT1 capacity remains two, with existing capacity rejection intact.
  Provisional timing: authored one-minute safe marks round up to one existing
  three-minute Unity tick, matching the adapter's coarse field-action clock.
  Compilation initially stopped on a test calling an internal UI helper; fixed
  the test to use ColorUtility directly and verified the new assembly was loaded.
  No production validation was relaxed. Ordinary Bootstrap Play/Stop/restart
  succeeds. Test pipeline cancelled; three residual test controllers removed,
  zero remaining. Actual normal save loaded at tick19870 with three existing
  cargo instances under the new catalog, then Reset mission succeeded; ordinary
  Play left running at the briefing. No live-position backup/restoration or
  persistent save write. Snapshot freshness and focused whitespace checks pass.
  Files changed this batch: MissionMapView/MissionMapNavigation (confirmation,
  colors, object markers, overlap), CargoPanel (locator/references),
  CargoProcessingReader (all cache instances), MissionCombat/OffworldCharacterPool
  (seeded per-attack plans and aim), CampaignSaveCodec/BootstrapReader (schema33
  and bounded cargo compatibility), CampaignState RNG comment; shared snapshot
  exporter/generated bootstrap, pinned cargo-before-safe fixture and Node test;
  combat EditMode and two existing PlayMode walkthrough files; playtest guide,
  REPO_MAP and this tracker. Final tests:12 combat checks,2 consolidated PlayMode
  routes,6 Node checks, all passing; latest safe mouse-raycast rerun also passes.
  Remaining work/next action: generic persistent parallel work-group search for
  the mission lab, then its authored observations, device preparation and report
  cargo, preserving all authored prerequisites and hidden identity. Office/
  supervisor dialogue/checkpoints remain open in the broader Offworld task.

- [x] Room Art Lab drag/drop furnishing and first-pass assignments (Complete;
  October 27). Make audited room assets visibly placeable by dragging into the
  preview, with selection, repositioning, rotation/scale and removal when they
  do not fit. Persist placements independently per base/mission target. Populate
  starter assignments for all 38 targets from the asset audit without replacing
  existing choices. Import dependencies only into the isolated lab, preserving
  vendor sources and gameplay. Acceptance: actual 3D/sprite drops, removal and
  reload persistence, populated Assigned lists, mission targeting, existing
  geometry safety and focused tests/live checks. Implemented one-time starter
  assignment merge for all38 targets (subsequent unassignments stay removed),
  staged unchanged Synty art only into the lab, and added static render-only
  prefab previews plus flat image references. Drag/drop, picking/repositioning,
  rotate/scale, fit warning, Delete/Remove and room/layout-specific save files
  are in place. Mission selection now renders normalized authored Stage cells.
  First focused validation:39/39 Editor tests and3/3 Node checks pass, including
  real table/sprite rendering, picking, floor-ray mapping, internal-seam fit,
  oversized rejection warning state, removal, persistence and source-material/
  active-scene preservation. Final validation remains39/39 Editor tests and3/3
  Node checks passed. Corrected Synty's saved _Albedo_Map fallback when its
  source shader is unavailable in this renderer; preview materials/thumbnails
  now retain the atlas without modifying vendor assets. Live DragPerform adds
  and saves a real table; object mouse drag moves it without camera orbit;
  Delete removes and persists removal. Mission Analysis shows its authored six
  cells/nine assignments, accepts an independent drop and removes it correctly.
  231 starter assignments across all38 targets use53 distinct candidates.
  Render evidence: artwork/room-art-lab-proof/placed-props.png. User-created
  placements made during review are preserved. Separate Editor is in Edit mode,
  active scene clean, zero test controllers and completed test state cleared.
  README/REPO_MAP updated; catalog freshness, helper syntax and whitespace pass.
  Provisional art assumptions: native prefab scale with bottom-center alignment,
  flat1.5-unit sprite references, advisory bounds-fit warnings, per-layout saves.
  No canonical architecture changes or unresolved architectural ambiguity.
  Remaining art work: structural module bounds mapping and detailed furnishing/
  material tuning; character/animation/raw-model sources remain reference-only.

- [x] Room Art Lab asset panel and reversed pitch (Complete; October 27).
  Reverse vertical orbit dragging. Add a right-side asset browser populated
  from the audited local inventory, with Show all / Show used / Show assigned,
  search and persistent per-room assign/unassign for base and mission rooms.
  Used means assigned anywhere; Assigned means selected room. Assignments are
  art shortlists, not physical placement or gameplay configuration. Acceptance:
  correct filters and room isolation, persistence across reload, all audited
  base/mission targets available, focused checks and clean isolated Editor.
  Implemented right-side resizable, searchable/category-filtered virtual asset
  list from all 3,766 audited sources/sprites and all 38 base/mission targets.
  Added assign/unassign with atomic automatic saving in the lab's own
  ProjectSettings/RoomArtAssignments.json; failed saves preserve prior state.
  Reversed vertical drag pitch. Node projection/coverage checks pass (2/2),
  including all source paths, disabled status and mission targets. Final Editor
  suite passes 37/37 with zero failures/skips, covering room-isolated/global
  filters, deduplication, persistence/reload, last-use removal, search/category
  intersections, invalid IDs and failed-save preservation. Live drag increases
  pitch from55 to59 for10 pixels downward; right-side panel verified and captured
  at artwork/room-art-lab-proof/asset-panel.png. Room selector synchronizes base
  geometry and clears conflicting room-search text. Both side panels resize;
  sprite images and source/type icons distinguish candidates; Source reveals
  files without import. Separate Editor left in Edit mode, clean active scene,
  cleared completed test state and zero nonpersistent test controllers.
  README and REPO_MAP updated; helper syntax/catalog freshness/whitespace pass.
  Provisional UI meaning: Used = assigned anywhere; Assigned = selected target.
  Mission assignments do not alter the labeled base geometry comparison. No
  architectural ambiguity or gameplay change. Next art work remains source
  bounds registration and actual prefab/furnishing placement.

- [x] Room and mission asset suitability audit (Complete; October 27).
  Inventory available art packs/assets and identify concrete candidates for
  every authored base room and mission location, including reusable structure,
  furnishings, characters/props and existing 2D artwork. Record exact source
  paths, suitability limits and missing coverage. Acceptance: reviewable asset
  inventory and room-by-room mapping grounded in actual files and mission data;
  no imports, canonical rule changes or operation of other Unity Editors.
  Enumerated all three Unity Assets roots, authored sprites/studies and the
  local Unity package cache. Found 495 Polygon Generic and 496 Prototype
  prefabs; Generic includes furniture, control props, medical props and extensive
  outdoor terrain. Identified all 22 base definitions and 16 authored mission
  locations across Missing Operative and Last Transmission. Cached packages
  add no separate environment pack beyond the installed Prototype bundle.
  Delivered docs/room-asset-audit.md with source roots, reusable asset shortlist,
  all 22 base-room mappings and all 16 mission-stage mappings, character/action
  recommendations, disabled/reference-only distinctions and specialist 3D gaps.
  docs/room-asset-inventory.json records 3,702 installed prefab/model/animation
  source paths across the game/character/lab projects, 64 sprite selections
  (63 enabled), artwork image-family counts and 14 cached Unity packages.
  Validation: every room/stage ID covered; every recorded source/sprite path
  exists; all 49 individually named Synty candidates and 43 existing prop-catalog
  references resolve; prefab totals verified; focused whitespace checks pass.
  No runtime tests needed for this documentation/inventory-only audit. No assets
  imported or modified and no Editor/campaign operated. Assumption: available
  means locally installed/cached art, not the user's online purchase library.
  Suitability is based on files, representative prefab hierarchies and existing
  reviews; individual visual/bounds/material approval remains future work.
  No canonical architecture conflict. Next: register shared shell bounds and
  preview the shortlisted furnishings in the isolated Room Art Lab.

- [x] Offworld playtest corrections (Complete; October27). Continue the
  existing mission: consistent travel/combat facing, persistent defeated Holding
  guard pose, accessible authored hidden-store contents, one shared action or
  response hex followed by Actor selection, Analysis lab error diagnosis, and
  one Gate hex switching between Redial and Extract. Preserve live campaign
  and saves. Acceptance: focused existing walkthroughs and live UI verification,
  clean compilation, ordinary Bootstrap restart and restored live state.
  Initial finding: live errors include a map action lookup of a door absent from
  the bounded travel projection. Inspect lab stack separately before changing
  examination rules.
  Progress: actual cause is empty catalog transition strings treated as door IDs;
  normalize those and tolerate unsupported presentation-only door references.
  Shared action/response hex now expands adjacent Actor choices; Gate shows
  Redial or Extract. Facing is applied after Animator evaluation; Down enters
  directly to avoid an outgoing Walk transition. Added consolidated live route
  checks. First run stopped on a test-only Animator hierarchy lookup, corrected.
  User steering: stop backing up/restoring campaign position. Finish by normal
  Load and Reset mission in Play; do not restore the captured live snapshot.
  Focused walkthrough now passes (1/1): shared response expands Actor hexes;
  Holding guard faces its living target after animation and visibly lowers into
  Down, retained after reload; Store crate collects through the map; Analysis
  lab entry/return renders without errors; Redial changes to Extract in the same
  position. Root guard issue: recognized travel NPC was incorrectly hidden by
  its parallel combat Field record's unused detection value. Fixed presentation
  only; hidden non-NPC subjects retain detection gating. Five snapshot tests and
  authored snapshot freshness pass. Full rescue/base Analysis walkthrough next.
  Further user clarification: crates remain at their source and are marked for
  extraction; all marked items return for now, with individual selection and
  per-item extraction constraints deferred to that wave. Existing Recipe IDs
  and completion receipts remain save-compatible marks; no crate enters party
  storage. Field resource examination state stays pinned to its source until
  extraction. Also fixed extracting after inspecting an unmarked cache: leave
  it in the field instead of attempting recovery. Updated UI/guide terminology.
  Actual aim follow-up: root-yaw assertions missed the native rifle mesh's -X
  barrel axis and camera projection/stretch. Replaced aiming with a post-animation
  barrel solve including pitch; test now compares the projected muzzle direction
  against each actual Unit/NPC target. Earlier full route passed base Analysis,
  then exposed stale test assumptions (instant progress, old20-bubble cache,
  keeping mission equipment through debug Reset); updating only those checks.
  Final validation: both focused PlayMode walkthroughs pass (2/2, zero failures)
  and the five snapshot tests pass. Exact projected barrel direction is checked
  for all four Units and the Holding guard, plus visible Down/reload, shared
  Actor selection, Store marking/source retention, lab entry/return, single Gate
  hex and extraction of all marked crates with medical work still unresolved.
  Full rescue passes Receiving, staffed Analysis/findings, save/load, equipment,
  authored Medium cache processing, resource conservation and Reset/redeployment.
  Narrowly handles the existing offline Editor account warning; gameplay logs
  remain strict. Snapshot freshness and focused whitespace checks pass.
  Ordinary Bootstrap Play/Stop/restart and final visual encounter review pass.
  Test pipeline cancelled; four residual test controllers removed, zero remain.
  Final normal Load then Reset succeeded at loaded tick19870 with22 rooms;
  left ordinary Play running at mission briefing. No captured position restored,
  no persistent save overwritten, and temporary backup/diagnostic files removed.
  Files: mission map/travel/extraction/debrief presentation, character pool/NPC
  visibility, CampaignSession/RecoveredCargo/ResourceCargo extraction adapters,
  the two existing PlayMode test files, playtest guide and this tracker.
  Provisional policy explicitly requested by user: all marked cargo extracts
  until extraction selection/constraints are implemented. No authored fixture
  or schema changed. Remaining broader Offworld work: Office/supervisor dialogue,
  checkpoint semantics and lab search/loot adapters; second mission still paused.

- [x] Room Art Lab construction tier lights (Complete; October 27).
  Continue the existing isolated room-art work with the simulator's inset CT
  lamps: CT1 one amber 8-unit run, CT2 two cyan 6-unit runs, CT3 one purple
  16-unit run within a centered 24-unit channel. Keep close-fitting housings,
  bright cores, neutral corners and clear door edges/internal joins. Reuse
  existing room/tier choices and A/B/C/D comparison; no gameplay rule changes.
  Acceptance: tier lights visible in the separate preview, correct placement
  and tier pattern, unchanged structural geometry, focused tests and clean
  isolated Editor state. Implemented cap fixtures with close-fitting bezels,
  emissive colors/cores and a visibility toggle. Doors now use neutral material;
  the fixtures carry the CT signal. Added pattern/placement/render coverage.
  Final validation: 34/34 Editor tests pass, zero failures/skips; Node projection
  test passes (1/1), catalog remains current, focused whitespace check passes.
  Rendered CT1/2/3 evidence saved in artwork/room-art-lab-proof/ct*-lights.png.
  Separate Editor left on CT3 comparison, four doors 65% open, active scene
  clean, Play stopped, completed test state cleared and zero nonpersistent test
  controllers. No other Editor operated. Provisional presentation assumption:
  fixtures sit on wall caps for overhead visibility and use emission without
  bloom or cast light. Final visual correction uses pure emission to retain
  amber/cyan/purple under preview lighting; all 34 tests pass after that change
  and all three evidence renders were refreshed. Simulator art dimensions/colors are presentation values;
  no canonical rules changed or architectural ambiguity found. Remaining room
  art work: Synty prefab mapping/bounds, material/geometry tuning, furnishings.

- [x] Room Art Lab join comparison and split sliding doors (Complete;
  October27). User requests a combined `A A B / A A B / C C D` preview for
  joinable rooms: square group, vertical pair, horizontal pair and single.
  Keep group identity, legal-size checks and open internal joins. Show only
  authored supported joins. Replace vertical door lifting with two leaves
  sliding apart horizontally along each wall. Verify comparison topology,
  split-door geometry at closed/partial/open amounts and isolated-scene safety.
  Implemented: joinable rooms default to an A/B/C/D comparison with separate
  colored floors and labels. Each group uses the existing legal-layout validator
  and perimeter assembler; unsupported groups are omitted. Preview-only0.4-unit
  spacing distinguishes separate perimeters. Single-layout preview remains
  available by disabling Show all joins together. Two half-width door leaves
  now meet at center when closed and slide oppositely along the wall into its
  sides, with fixed height. Final Editor suite:30 passed,0 failures/skips,
  including exact requested board, unsupported joins, all four door orientations
  at closed/partial/open positions and scene cleanup. Rendered comparison and
  sideways leaf opening verified in the separate Editor; evidence saved to
  artwork/room-art-lab-proof/join-comparison.png. Active scene remains clean,
  Play stopped, completed test state cleared, zero test controllers. Node
  catalog freshness and focused whitespace checks pass. Assumption: user's
  diagram means four independent groups shown together, not one3x3 room.
  No canonical rule changes. Next work remains Synty prefab mapping/bounds
  registration, then wider geometry/material/furnishing tuning.

- [x] Room Art Lab Waves A/B (Complete; October27). Use the supplied
  `unity_room_art_lab_handoff.md` as the design brief, with the user's permission
  to reuse good code and remove unsuitable code within this work. Reuse the
  canonical Unity catalog and actual join validation. Deliver an isolated
  Edit-mode window, data-derived footprint/CT choices, primitive modular floors,
  square junctions, three wall segments per exterior cell edge and centered
  preview doors. Acceptance: all room definitions appear; authored special
  footprints remain distinct from joined physical rooms; illegal joins/shapes
  are rejected; shared walls/center posts are absent; active scenes stay clean;
  focused Editor tests pass. Later prefab mapping/tuning/furnishing waves remain
  outside this first batch. Inspection found no existing Room Art Lab to delete.
  Preserve existing character Art Lab and unrelated in-progress work.
  User clarification: this must be a separate Unity project, `unity/OrionisRoomArtLab`,
  with independent Editor, caches and preview state. Never operate the game or
  character Editor for this work. Consume a generated presentation-only catalog;
  share the existing pure join-geometry rule rather than copy gameplay systems.
  Progress: separate project/package/settings created; catalog staging and freshness
  helper projects all room definitions from the existing validated snapshot builder.
  Extracted the existing pure structural join check; game RoomGroups delegates
  to it and lab stages that exact source. Added isolated PreviewRenderUtility
  window, physical/joined selector, CT selector, perimeter assembler, exterior
  door controls/all16 single-cell combinations, module-list selection and camera.
  Final validation: 24/24 Editor tests pass, zero failures/skips; Node projection
  test1/1, freshness, helper syntax and focused diff checks pass. Separate Editor
  opened and rendered successfully, with22 room types. Fixed the empty-string
  non-joinable label discovered in visual review. Confirmed clean active scene,
  stopped Play, no residual test run and zero nonpersistent test controllers.
  Evidence: artwork/room-art-lab-proof/README.md and joined-2x2.png. Editor left
  on Analysis joined2x2 with two exterior doors; no game/character Editor operated.
  Provisional presentation assumption:4-unit cells and2-unit walls, built-in
  neutral renderer/primitive modules; no canonical scale/material changed.
  No data conflict: self-large authored footprints and joined physical-room
  groups are distinct. Next batch is WaveC prefab mapping/bounds registration,
  then WaveD tuning/debug overlays; furnishings and preset save/apply follow.

- [x] Fix mission Reset / loot extraction and overlapping Offworld UI (Complete; October27).
  Follow-up: user still cannot extract loot and reports stale character lookups
  after loading/resetting. Inspect extraction modal/input isolation and character
  view lifetime; verify extraction through the actual UI into Receiving, plus
  session replacement without missing-character exceptions. Editor is currently
  closed, so no live state is available to inspect.
  Reproduce the construction-balance failure on loaded state. Preserve deposited
  resources and their accounting when reset removes mission cargo/processing.
  Acceptance: processed-cache -> save/load -> Reset -> save/load succeeds with
  unchanged stock, staffing and rooms; no balance validation bypass or duplicate
  resource credits. Verify the real save and one focused regression only.
  Cause: Reset removed resource-cargo transaction receipts while preserving the
  deposited stock, breaking the existing conservation equation. Added a separate
  archived cargo-credit ledger to ConstructionState; Reset transfers only removed
  instances' committed credits, and normal construction/clearing/resource updates
  preserve that ledger. Save schema32 persists it; schemas1–31 start with an empty
  archive. Stock balance validation stays strict. Preserved live tick19870 backup.
  Added one processed-cache -> load/reset/save -> further tick/repeated reset test,
  including unchanged staffing/stock and rejection of stock-only tampering.
  Prior reset validation: zero compile errors/warnings; both focused checks pass,
  including the actual loaded campaign. Ordinary Bootstrap restart had zero test
  controllers; restored the original live campaign exactly at tick19870 without
  applying Reset to it or writing the persistent save.
  Follow-up delivered: character-pool replacement explicitly detaches old views;
  stale marker lookups safely stop instead of indexing missing dictionary keys.
  Extraction covers the workspace with a separately sorted, raycast-blocking
  modal; cancel disables it immediately. Debrief supports every collected cache
  and offers direct navigation to Receiving, with non-overlapping action rows.
  Validation: zero compile errors/warnings. One focused UI walkthrough passes
  load/reload, pool invalidation, modal hit testing/cancel/confirm, all four
  crate/rifle instances arriving and appearing in Receiving, and no gameplay
  errors. The standalone harness first needed Unity's log scope for its final
  assertion; corrected harness rerun passes. No persistent player save written.
  Ordinary Bootstrap Stop/restart verified with zero test controllers. Editor
  was closed before this follow-up; reopened only the main project for checks.
  No new game rules or provisional gameplay assumptions. Next: user rechecks
  their saved mission's extraction; remaining Office/lab scope stays below.


- [x] Offworld spatial actions / extraction, contextual planning and mission polish
  (Complete; October26). Continued after the user's stop with the explicitly
  requested reset/hex/loot/rock/combat batch. Existing Office/lab runtime work
  remains the separate active item below; no second mission was started.
  Delivered: spatial action symbols with descriptions below, cardinal visual
  routes, combat target facing, Gate expiry/redial gating, extraction manifest
  and automatic eligible cargo arrival. Contextual planning inspects room/rock/
  empty cells; valid room actions sit under details, then carousel -> placement
  -> Build. Data Storage is in Storage. Communications has a provisional shared
  Command envelope, but mission-acquisition Core definitions remain unauthored.
  Latest polish: explicit Reset mission clears its cargo, Receiving work and
  dependent transfers while preserving staffing/teams/base. Store's authored
  second crate and Human coil rifle collect/extract into Receiving with original
  IDs. Same-target hexes touch; each eligible Actor has a direct work/response
  hex, and travel uses a direction-aware vector arrow. Combat has start/cancel
  confirmation then automatic rounds. Downed rig state survives disabling.
  Rock plans are deterministic by seed/cell: 8–12 bubbles mixing 1/20 ticks,
  at least one Technician-I bubble; legacy fixed-eight orders retain their graph.
  Previews show expected work/yield, and category buttons jump the carousel.
  Provisional choices: 40% long-bubble selection, guaranteed short/long bubbles,
  one Technician-I requirement; existing 10 S1 yield retained. No new Tools,
  hidden Knowledge or technology granted. Recipe policy is in shared data/schema.
  Fixed a real save gap: Communications lacked a Receiving admission profile
  after construction. New room types now receive explicit schema-derived profiles
  with exact legacy fingerprint compatibility. Additional cargo caches likewise
  use bounded compatibility; physical payloads/old jobs remain unchanged.
  Validation: eight focused Node checks; two consolidated domain routes (Store
  collection/Receiving/reset and mixed rock eligibility/save/yield) plus actual
  campaign migration/roundtrip pass. Live checks cover north arrows, direct Actor
  actions, combat confirmation/automatic completion, two guards staying Down,
  touching hex spacing, all five category jumps, rock time/yield and specialist.
  Final compilation: zero errors/warnings. Ordinary Stop/restart with zero test
  controllers. Restored the latest tick22551 campaign exactly: 23 rooms, existing
  cargo, assignments, selection/view, paused 8x clock. No persistent save written.
  User should click Reset mission once to refresh existing mission loot.


- [ ] Finish the current offworld mission presentation and interaction coverage
  (In Progress; October26). User pauses second-mission work. Add a minimap and
  readable zoom/pan, halve unit-to-tile size, restore accessible stage interactions,
  NPC presence and loot from the authored Missing Operative mission. Integrate
  appropriate existing Art Lab action animations without inventing gameplay or
  claiming unsupported motion studies as finished treatment/carrying. Preserve
  saves, hidden Knowledge and live campaign. Validate representative navigation,
  interaction/loot, zoom/minimap and action-animation paths together. Next mission
  remains the authored last-transmission-001.finalized.json, deferred by request.
  Progress: backed up current campaign at tick26556 (returned at Gate). Replaced
  auto-fit-only map with persistent per-session zoom/pan, center/fit controls and
  a known-area minimap; units now use 0.2 instead of 0.4 tile markers. Removed
  action-list hiding, retaining readable full actions beside spatial door hexes.
  Added authored-position NPC/cargo markers with hidden-subject checks. Extended
  local Art Lab staging to 63 hashed asset/meta files and nine outfits; importing
  Talk, gathering/low-reach work studies, rifle fire and down animations. No
  second mission or Art Lab scene/playback changes. Added the three authored
  non-variant Holding worker/guard and Processing worker conversations, including
  their actual node/response effects. Pinned the first expanded mission projection
  so saves retain progress while only newly authored NPC definitions initialize.
  Five snapshot tests pass; nine prefabs/seven clips compile and build. Live
  Gate-to-Yard confirms four NPCs, 0.2 tile units and conversation. Visual review
  found default label padding hid short map labels and a custom minimap needed an
  explicit CanvasRenderer; fixed both before final route checks. Full Office /
  supervisor dialogue variants, checkpoint semantics and lab parallel-search /
  additional loot adapters remain current-mission work; next mission stays paused.
  Root-cause discovery: Holding panel used Npcs.Single for the detected operative,
  whose identity belongs to Field.Subjects. That exception aborted patient/loot
  controls. Fixed a shared speaker-label fallback with detection gating; added
  one direct panel regression. Three traversal/conversation/migration regressions
  and the actual tick26556 backup roundtrip pass. Live fire/weapon props and
  post-arrival work motion pass. Repaired live Holding panel exposes all five
  expected conversation/patient/loot controls, eight NPCs and a 56-vertex minimap.
  Equipment discovery starts through actual buttons. A separate full route clears
  guards and stabilizes patients, returns to Gate and recovers crate/rifle with
  original IDs; save roundtrip passes. Unresolved medical work correctly blocks
  cargo recovery until cleared. User changed the live session to Office; captured
  a separate latest backup at tick21870 and must preserve that session instead of
  restoring the earlier returned tick26556. User requests 60-degree downward
  character cameras; changed both orbit position and pitch to retain the same
  framing target and distance. Map remains flat/orthographic. Final verification /
  latest Office restoration complete: exact tick21870 state, selection and view,
  original paused 1x clock, persistent save untouched.
  Delivered this batch: zoom/pan/Team/Fit, known-area minimap and viewport frame;
  half-size units; NPC/object markers using authored positions and visibility;
  nine profession/NPC outfits and seven motion states; readable action sidebar;
  operative speaker/detection fix; three authored worker/guard conversations and
  expanded-save compatibility. Removed overlapping map subject captions in favor
  of hover/click details, fixed hex label padding, and shortened the clipped
  explored-room list. All five live character cameras verified orthographic at
  60 degrees with unchanged aim target; actual wheel/drag/minimap handlers change
  only view state. Five snapshot tests, four domain/backup checks, the specific
  Holding panel regression and a full medically-cleared loot-return/save route
  pass. Final compile zero errors/warnings; 63 vendor hashes and shared snapshot
  freshness pass. Ordinary Bootstrap Stop/restart passes with zero test controllers.
  Remaining acceptance scope is still In Progress: Office/supervisor dialogue
  variants, checkpoint effects, lab parallel searches and additional authored
  loot/work transitions. Next actionable step is the Office dialogue/interaction
  adapter, followed by lab search/loot; do not start the second mission yet.


- [x] Offworld-priority batch: authored exploration and idle/walk integration
  (Complete; October26). User prioritizes offworld waves ahead of Workshop /
  Research and authorizes importing Art Lab idle/walk only. First playable package:
  expand the reference mission's remaining authored Stage/door and clue-discovery coverage;
  show the SG team's approved profession outfits with idle and walking, movement
  continuity and existing hex actions/fog. Keep animations cosmetic, reuse shared
  mission data, preserve campaign/saves and retain Art Lab independence/vendor
  exclusions. Validate normal rescue/cache routes, new travel/knowledge behavior,
  animation loop/render/transition, and source/save integrity in a consolidated
  route. Second-mission/campaign selection remains the next Wave5 adapter package;
  do not pretend missing care/rescue/effect contracts work or grant hidden state.
  Progress: live campaign backed up at tick23653. Copied/hashed 44 selected local
  vendor asset/meta dependencies (only two animation clip files); six outfit
  prefabs and idle/walk controller built in the main project. Vendor/generated
  resources are ignored, and Art Lab was queried read-only without scene changes.
  Main 2D renderer retained; portrait cameras use an additional Forward renderer.
  Animated map markers share pooled models and cosmetic stage-motion state across
  UI rebuilds. Shared mission import now projects all ten stages/ten doors/four
  encounters, two authored gated clue actions and concealed-route predicates.
  Pinned mission/combat projections support old saves and initialize only new NPC
  definitions. Broader lab search/cargo recipes and second-mission adapters remain
  explicit future coverage. Complete: 14 focused Node checks pass; two traversal /
  old-expedition migration cases, three existing resource-processing cases and
  the actual user-backup migration/roundtrip pass (six checks). An initial backup
  failure exposed a shared action-array alias; cloning before expansion preserves
  the resource fingerprint, and the real backup now passes. Four rendered team
  members switch to Walk through the actual map hex, deform their rigs, then
  return to Idle; exactly one travel tick elapses. Each controller has only two
  looping clips, with root motion disabled. Final compile: zero errors/warnings;
  44 original dependency hashes verified. Rebuilt six final outfit prefabs after
  removing unused renderer/mesh references. Ordinary Bootstrap restart passes,
  zero test controllers remain. Restored latest backup tick23653 exactly and
  resumed its original running 8x clock; no persistent save overwritten.
  Next: another authored mission and selection/world-map adapter package, with
  unsupported care/search/effect contracts reported rather than guessed.


- [x] Receiving animation and Operations journal (Complete; October26; started October25).
  Interpolate committed bubble fill across ticks even when room/queue UI rebuilds.
  Keep completed work as persistent history after routing/reset/redeployment;
  ongoing first, newest completions next, with an explicit Completed filter.
  Preserve actual tick/Recipe state, knowledge boundaries and live campaign.
  Validate history ordering/save migration and visual interpolation; report the
  next migration package without silently inventing missing technology rules.
  Implemented: per-session interpolation retained across rebuilt Receiving/cargo/
  Core views; immutable completed-work journal in schema31; stable repeat-run IDs;
  Receiving start/completion timestamps; ongoing/newest-first ordering and a
  Completed filter (All default). Older saves import extant completion records
  and explicitly retain unknown times. Ten focused domain/save checks pass;
  half-tick interpolation and rebuilt-view continuity checks pass; compile/diff
  checks pass. October25 automatic review hit its usage limit before the final
  restoration/docs command; that command did not run. Continued October26:
  verified backup schema30/tick20768, found main Unity closed, reopened only the
  main project (PID7732), but its Pipeline connection has not initialized. Asked
  the user to finish any startup/recovery/license dialog; no Art Lab processes
  were changed. Persistent save is older (tick19870) than the preserved interrupted
  session backup (tick20768), so restoration must use operations-journal-backup.json.
  October26 user opened Bootstrap and Pipeline connected. Final restoration
  exposed a real legacy Receiving edge: unknown startedTick serialized as null
  collided with the strict integer validator. Fixed by omitting unknown nullable
  timestamps; added regression for timestamp-free schema30 Receiving and retained
  explicit unknown journal dates. Compile passes with zero errors/warnings.
  Complete: three journal regressions (including unknown legacy timestamps) and
  the real user-backup roundtrip pass; 11 unique focused domain cases pass across
  the batch, plus interpolation/rebuild checks. Final compile: zero errors/warnings.
  Restored tick20768 exactly with 19 archived entries. Verified Completed/All
  filters, first-row visibility, newest-first dates and an actual Receiving widget
  destroyed/rebuilt mid-fill without snapping. Visually reviewed the journal.
  Original 8x running clock resumed; zero test controllers; no persistent save
  file overwritten. Task acceptance criteria are satisfied. Next migration work:
  Wave4 Workshop/reverse engineering and evidence handoff, then Discovery/
  Thesis/Research. Human Technology-II Workshop installation remains an explicit
  authoring dependency; construction upgrades do not grant that technology.


- [x] Larger Wave3 base-operations batch (Complete; October25). User requests
  substantially more implementation per manual test. Complete shared local / Group /
  deliberate Response Actor resolution across base jobs, Base Response availability
  controls and persistence, configured Group Tool / Core Room Service resolution,
  and an operations view that exposes active/blocked queues with room navigation.
  One consolidated acceptance route covers the set. Preserve live campaign and
  independent Art Lab. No implicit Technology Tier from construction upgrades:
  the authored Human II Workshop Tool rule may resolve configured capability,
  but its missing installation/acquisition path must not be invented.
  Acceptance: permanent local/Group staff precede eligible Local Response; Base
  Response/away/busy staff do not work; sticky Actors resume without substitution;
  no stored-tool/global-idle borrowing; Services stay within the destination Group;
  readiness/UI match execution; posture/save migration and existing cargo/Core
  routes pass focused checks. Current task and migration notes reflect real scope.
  Progress: backed up the live schema29 campaign at tick17396. Shared execution
  rules now import from base-execution.json and canonical Human Manufacturing II
  capability references. Unified base Actor/Tool resolution and Core Room Services
  compile; Base Response posture persists in schema30. Operations view lists all
  base job types with filters, readiness, progress, pause/resume and room navigation.
  Response posture controls and room Services inspection are implemented. Thirteen
  focused Node checks pass. Final integrated domain/UI checks are in progress;
  no additional scope is being added after the user's request to finish.
  Validation: 11 focused domain/save checks pass (eight initial passes plus only
  the three corrected cases rerun); 13 Node checks and shared-rule/schema checks
  pass. Test fixtures now use actual crosspath qualifications and joinable room
  types; the construction continuity check waits for authored security duration.
  Fixed the Operations route and filter scroll reset found during UI verification.
  Compile has zero errors/warnings. Latest campaign restored exactly at tick17396;
  Final visible verification passed: Operations/All renders 13 saved work records
  with its first row visible; Open work reaches real Core controls; Services
  inspection opens; no unauthored TET2 capability is granted. Complete migrated
  campaign compares exactly with the latest backup at tick17396. Restored original
  selection/view and running4x clock; zero test controllers. Real save files were
  not overwritten. No broad suite or player rebuild was needed. All acceptance
  criteria for this larger implementation batch are satisfied; the separate Art
  Lab workstream remains untouched.
  Remaining authored gaps: installation/acquisition for Human Technology-II
  Workshop tooling and the numeric interruption-reset window. Existing sticky
  work freezes/resumes; no unauthored reset discards progress. Broader technical
  consumers/manufacturing remain future migration work. Next user check is the
  single consolidated route in docs/unity-playtest-guide.md.



- [ ] Art Lab view controls and additional animation retargeting (In Progress;
  October26; reopened for new dialogue/animation assets). Inspect the newly
  acquired Combat and Dialogue vol1 pack, retain vendor sources, and integrate
  useful dialogue/social/movement variants into the focused Art Lab. Review
  actual clip content and compatibility, select sensible role uses, clearly
  label target/prop/rig gaps and verify playback/preset cleanup and renders.
  Scope addition from user: include supplied props from the new pack and expose
  missing props from previously installed packs in the main parts panel; use
  authored attachments where known and clearly separate staged reference props
  from fitted hand tools. Do not guess grip fit or alter vendor files.
  Progress: audited771 package entries, all under Assets/CaD_vol1, no scripts /
  DLLs / project settings. Only101 dialogue clips were initially imported; full
  art import requested after stopping Art Lab (first request hit a Play-mode
  import restriction and made no import). New source clips share the name
  Unreal Take, so library labels now use source filenames and explicit auxiliary
  binding flags. Implemented26 useful social/reaction/pickup gestures plus five
  unarmed defensive reactions, a Dialogue filter, and source-use review notes.
  Other-props panel now discovers prior crafting/melee/soldier/archer/throwing
  prefabs and Toon loose items. Three reviewed tools use hand attachments;
  others are scaled staged references with vendor demo behaviours disabled.
  New CaD art supplies a demo character, not the chairs/canes/phones implied by
  some clip names. Compile/build passed; all150 focused actions, nine preset
  resets,182 new clips (all moving), and42 added props passed mechanical checks.
  Visually reviewed question/direction/salute/pickup/defense and staged bucket,
  bow and throwing axe. Found an animated ammo crate omitted by the initial
  generic-Animator exclusion; adding its rest-pose reference without an Animator,
  plus a staged-prop rotation control for thin/edge-on meshes. Final verification
  and UI/docs remain.
  Previous scope: full death/interaction catalog and NPC presets.
  Add all installed compatible death and interaction clips, preserving source
  variants and marking weapon-fit limits; add Worker, Guard and Captain as NPC
  visual presets alongside the six selected professions. Verify unique clip
  discovery, playback, equipment cleanup, preset restoration and representative
  renders in isolated Art Lab. No new NPC gameplay rules or main-game changes.
  Progress: asset audit found65 compatible death/interaction clips across all
  installed sources, including female Humanoid and skeleton-retarget variants.
  Catalog now adds every source clip once, exposes Deaths/Interacts filters and
  preserves one-shot playback. Non-infantry weapon families are explicitly
  body-motion studies; skeleton extra bindings remain unmapped. Added provisional
  NPC visuals: Worker plain body/hardhat/grey, Guard infantry/helmet/grey,
  Captain general/peaked cap/blue, all without backpacks. Guard idle added;
  Worker shares work clips and Guard/Captain share rifle studies. Build/compile,
  complete coverage, playback/preset regression and visual checks passed:
  119 unique action clips, all51 deaths/all14 interacts included; nine preset
  resets and full parts checks pass. Captured/visually reviewed all three NPCs,
  infantry/heavy interacts, prone death, female death and skeleton-retarget death.
  Usage/navigation docs updated. Final UI capture remains. Resumed October26:
  previous session's UI command was stopped by approval-review usage limits;
  all implementation/regression evidence is present. Art Lab had since closed;
  reopened only that project and confirmed normal Play with119 saved clips and
  nine saved presets, without rebuilding. Final npc-interactions-ui.png captured
  and visually reviewed; all nine preset buttons and Deaths/Interacts controls
  are visible and the Guard renders correctly. Helper syntax and focused diff
  checks pass. Existing full119-motion/nine-preset/parts/coverage checks remain
  passed; no code changes or redundant test reruns were needed on resume.
  Updated usage/navigation/evidence docs. Art Lab remains in Play on Guard /
  Interacts. Main game and vendor sources untouched; no test runner started.
  All requested work for this batch is complete. Remaining visual-study limits:
  non-infantry weapon fitting, skeleton extra bindings and interact target props;
  Worker/Guard/Captain appearance choices remain provisional NPC art presets.
  Previous scope: selected profession outfits and extra actions.
  Apply the user's exact body/head/backpack selections for all six professions,
  choose closest supplied palettes to established profession colors, and add
  idle, sheathe, fishing and death clips to the focused preview. Verify reset
  preserves these new defaults, switching clears hand props, and fishing uses
  its supplied prop/bindings. Keep game Editor and vendor sources unchanged.
  Progress: exact six body/head choices and four backpacks configured, with
  reset restoring palette/backpack defaults. Color reference is the established
  Offworld presentation palette in demos/offworld-sandbox/map.mjs: closest
  supplied red/yellow/blue/green approximations (purple/cyan/teal absent).
  Added all supplied13 idle clips (one already present), ten sheathe/draw pose
  studies, nine fishing clips with supplied pole, four unarmed and five rifle
  deaths:62 total unique actions. One-shot motions default to no repeat.
  Compile/build passed, all62 action checks passed, six exact preset resets and
  full parts regression passed. Visually reviewed all six updated idle outfits,
  pole grip from front/side, casting, sheathe and unarmed death. Native rifle
  death moves hips beyond standing framing; adding death-camera bounds tracking
  before final capture. Sheathe remains explicitly pose-only without a fitted
  holster; supplied fishing pole has no line/lure/effects.
  Completed: final death-camera tracking keeps the displaced native rifle death
  fully framed. Normal playback check passed: death holds its final pose with
  Repeat off. Updated builder/runtime/parts restoration checks, generated scene,
  profession/action catalogs, six outfit captures, fishing/sheathe/death captures,
  preview UI and usage/navigation docs. Compile, helper syntax and focused diff
  checks pass. Main game and source assets untouched; no Unity test suite started.
  Art Lab remains in Play on Scout fishing with the shortlist filtered to Fishing;
  clear the search to see the rest. User-selected parts and palette defaults
  persist in the generated scene. Optional next work remains fitted holstering,
  richer fishing prop/effects and exact profession-color atlas variants.
  Prior scope: add a separate parts browser for the
  full Toon Soldiers pack, with interchangeable character parts and available
  color variants. Inspect materials before recommending recoloring; preserve
  source assets, profession presets and the isolated game-action preview.
  Acceptance: parts can be combined without stacking bodies/heads, original
  profession appearance can be restored, color swaps affect preview instances
  only, and material/recoloring limitations are documented and verified.
  Progress: implemented a separate right-side parts panel, body/head selection,
  exclusive pack backpack/hand-prop selection and independent body/head palette
  swaps. Catalog comes from installed pack assets; source materials stay shared
  and unchanged. Profession restore clears experiments. Pack audit found nine
  supplied atlas color variants, so no duplicate colored meshes are needed.
  Compile/build passed. Focused parts checks passed for all9 bodies,15 heads,
  5 backpacks,19 hand props and9 palettes, including exclusive visibility,
  body mesh validity, unchanged source materials, retained animation and
  profession restore. Existing22-action/six-profession regression also passed.
  Live render passed; reviewed red body / blue helmet with backpack and rifle,
  and captured the two-panel UI. Updated runtime/builder, generated scene,
  catalog/validation/captures, helper command and usage/navigation docs.
  Art Lab remains in Play with the parts/color panel open. Main game and vendor
  source assets untouched. Syntax/compile/focused diff checks passed; no Unity
  test-runner suite started. Remaining optional work is custom region-based
  recoloring and per-weapon animation fit; session choices are not saved presets.
  User accepted the focused
  preview as the general animation workspace. Extend the same single-character
  lab with selectable visual parts and action shortlists for Scientist, Medical,
  Scout and Diplomat alongside Technician and Soldier. Inspect installed assets,
  retain explicit gaps where suitable motion/props are absent, verify profession
  switching and representative renders. Choices are provisional presentation,
  not new canonical equipment or rules.
  Progress: six profession presets implemented on the existing modular rig,
  with body/head selections, role-filtered actions, shared travel/conversation,
  and a staged medical-kit reference (no guessed hand grip). Added six source
  clips, for 22 unique actions. Scientist sample pickup and Medical low reach
  are explicitly candidate studies; treatment/scanning/console and carrying
  remain missing. Build/compile and 22-action/six-profession checks passed;
  rendered all six and visually checked role parts/props. UI capture exposed
  stale sidebar pixels outside the camera viewport; added explicit GUI and
  background-camera clearing. Final controls capture is clean after a normal
  player-frame repaint. Final 22-action/six-profession regression passed; helper
  syntax and focused diff checks passed. Updated builder/runtime, generated lab
  scene, profession picks/validation/captures, README and repository map.
  Art Lab remains in Play on Scientist. Main game and vendor sources untouched;
  no test-runner suite launched. Next animation batch should source or author
  actual treatment/carrying, analysis/console and tracking/scanner/binocular
  interactions; candidate gathering motions do not satisfy those missing roles.
  Earlier scope: add interactive camera-elevation and character-yaw sliders in the
  independent Art Lab, with animation selection/playback. Locate the user's new
  animation downloads, validate compatible Humanoid clips on the existing
  soldier avatar, and report unsupported/missing files explicitly. Keep the
  game Editor and original vendor content untouched. Acceptance: controls work
  in the lab preview, available new clips are selectable and verified on the
  soldier, or any unavailable package is documented with its next action.
  Progress: runtime sliders and single-character/searchable animation viewer
  added in Art Lab. User identified Human Basic Motions FREE and Human Soldier
  Animations FREE; both packages are now downloaded. Audited their contents:
  vendor-scoped art and demo scripts only, no project settings/startup actions.
  Added the vendor demo's UGUI dependency in Art Lab; Basic Motions import
  requested. Vendor content stays unmodified and ignored. Main Editor untouched.
  Both packs imported and compile cleanly. Catalog discovers 182 Humanoid clips
  (four original +178 added). Added searchable clip selection via an Animator
  Override Controller on the existing Toon Soldier avatar, with per-clip notices
  for unmatched custom prop/spine bindings. Standard body retargeting and view
  controls implemented. All-clip runtime sampling passed: 182 clips sampled on
  the Toon Soldier avatar, 174 produced animated poses, all preserved the target
  Humanoid avatar and stationary root. View controls verified: elevation
  (25/90°), yaw (137°), solo toggle, zoom, playback speed, pause/restart,
  one-shot repeat. Live render capture passed (no magenta shader failure,
  visible blue soldier texture).
  Weapon dropdown added: CharacterPreviewControls exposes a per-subject
  weapon array (placeholder capsule weapons: None/Rifle/Assault Rifle/Gun/
  Bazooka) with a SelectionGrid dropdown in OnGUI. Selecting an animation clip
  auto-matches the weapon by clip-name keyword (rifle→Rifle,
  assaultrifle→Assault Rifle, gun→Gun, bazooka→Bazooka). Manual override via
  dropdown persists across clip changes. Build script creates one weapon set
  per Toon Soldier instance, positioned near the right hand, colored by type.
  IK Helper Tool integration: each soldier has an IKHelperTool component on its
  Animator with an iKSwitch transform and per-weapon grip transforms. When a
  weapon is selected, the IK system drives the right hand to grip the weapon's
  grip transform; selecting "None" disables IK. Fixed IndexOutOfRangeException
  in ApplyIk() guard check. Real weapon prefabs from the Human Soldier Animations
  pack are now loaded instead of placeholder capsules: Human_Rifle, Human_AssaultRifle,
  Human_Gun, Human_Bazooka (prefabs at .../Human Soldier Animations/Prefabs/Weapons/).
  Grip transforms are positioned at each weapon's bounds center. The pack also
  contains additional model categories: Archer (Bow, Arrow, Quiver), Crafting tools
  (Axe, Hammer, Knife, Pickaxe, Plow, WateringCan, FishingPole, Bucket, Basket),
  Melee (Dagger, Greatsword, Polearm, Shield, Sword, Warhammer), plus human character
  models (HumanF_Model, HumanM_Model). Weapon models match the animation clip categories
  for auto-selection by keyword.
  - Continued October25 after the updated goals: inspect/validate the recorded
    weapon and IK implementation; import the newly downloaded Archer, Crafting,
    Melee, Spellcasting, Throwing, Skeleton and human-dummy packs into Art Lab.
    Refresh compatible animation/prop catalogs and verify selection, saved-scene
    persistence, retargeting and live rendering. Preserve vendor sources and
    main-game isolation. Acceptance includes explicit reports for incompatible
    rigs, missing authored grip data and any remaining visual-fit limitations.
    Progress: all new packs were already imported; AssetDatabase reports 423
    compatible Humanoid clips. Replaced nonserialized jagged prop arrays with
    serializable per-subject prop records and expanded discovery to vendor
    weapon/tool/archer prefabs. Manual prop choice now persists until automatic
    matching is re-enabled. Props attach to a chosen hand; support-hand IK has
    valid references and an enabled Animator IK pass, gated on explicit grip
    calibration. Removed guessed bounds-center grips and capsule fallbacks.
    Toon Soldier has one mesh containing its original rifle; None can hide only
    added props. This limitation is shown in the viewer. Compile and focused
    verification of persistence, catalog, prop choices and actual IK are next.
    Build/compile passed. Scene reload retains prop sets; temporary calibration
    test passed for saved position, rotation, calibrated flag and holding-hand
    flag across regeneration, then restored original authoring. Actual IK moved
    the support hand to its reachable test goal. Combined test initially failed
    because cleanup re-enabled automatic matching before asserting None; fixed
    that test order and removed stale success reports before reruns. Final
    combined catalog/prop test and live visual review remain.
    Combined test passed 423 clips (398 moving), 23 prop choices, manual/automatic
    matching, serialization, hand switching and actual support-hand IK. Visual
    review of HammeringGround with Hammer confirmed UI/selection and the known
    embedded-rifle/uncalibrated-fit limitation. A later behaviour audit found the
    vendor arrow's launch/destroy script; disabling vendor demo behaviours on
    preview prop instances only, then rechecking persistence after playback.
    Final verification passed after that fix: all 423 clips and 23 prop choices,
    calibrated IK movement, saved-grip regeneration and 92 surviving prop
    instances after normal playback. Compile flag is clear; helper syntax and
    focused diff checks pass. The two generic FBX rigs are archer Bow/Hat assets,
    excluded from Humanoid clip discovery. 399 clips retain extra custom-transform
    compatibility notices; finger-only detail is unsupported on the Toon rig.
    Source/scene files changed only in Art Lab, plus tracking/navigation and
    evidence docs. No broad test suite or main-game Editor commands were needed.
    Art Lab remains in Play; remaining work is per-prop calibration and any
    desired mesh/rig adaptation for clean unarmed poses, fingers or spine curves.
  - Latest user correction: the preview still carries its original rifle, some
    comparable motions/prop orientations are wrong, and characters appear stacked.
    Focus on game-relevant movement, rifle combat and base-work actions rather
    than correcting every library clip/tool. Inspect the newly acquired full
    Toon Soldiers pack, use its supported model/weapon setup, remove unintended
    duplicate geometry, and provide a small reviewed game-actions shortlist with
    explicit unsupported-action gaps. Verify clean equipment switching and
    representative animation/prop fit in isolated Art Lab. Keep full-library
    browsing available separately; main game and vendor sources stay untouched.
    Full Toon Soldiers imported after auditing669 art-only entries (no scripts /
    project settings). Its infantry prefab has modular body/head renderers and a
    separate rifle on an authored WeaponContainer, unlike the demo's combined
    mesh. Implemented a separate one-character GameActions scene and16 explicit
    movement/rifle/work studies, with exact clip playback through Playables,
    exclusive equipment, and only one body/head variant visible. Hammer/Pickaxe
    reuse supplied hand-prop curves through transform-only auxiliary bindings;
    no source human mesh or rig replacement is instantiated. Compilation/build,
    focused equipment/motion checks and visual fit review pending.
    Focused mechanical checks passed all16 actions and clean equipment clearing.
    Visual inspection then found skin matrices lagging the procedurally updated
    hand/spine transforms (floating tools despite correct bone positions). Normal
    animation-update playback plus per-render matrix refresh corrected the
    reviewed Hammer pose: the visible hand now grasps the tool and no rifle or
    duplicate body remains. Persisting that fix and rechecking Rifle/Pickaxe.
    Final normal-update/per-render-refresh code passed the16-action regression
    again. Rendered native rifle-fire now uses both hands; reviewed Hammer and
    Pickaxe move with the actual visible hand, with the rifle absent. Widening
    the stable default camera framing to include raised tool heads.
    Completed: final 16-action verification passed after the framing adjustment,
    with one Animator, exactly one body/head pair, exact clip selection, finite
    moving poses, exclusive equipment and Rifle→Hammer→None cleanup. Final live
    captures passed; visually reviewed rifle ready/fire, hammer work and pickaxe
    wall with full raised tool visible. Controls/UI capture and navigation/docs
    updated. Helper syntax check passed. Art Lab remains in normal Play on the
    focused scene; main game untouched. No Unity test-runner suite was started.
    Medical treatment, casualty carrying and detailed console/analysis actions
    remain unreviewed gaps for a later animation batch; other library tools and
    clips are explicitly unreviewed. No production promotion or game-rule change.
    Equipment display mapping fixed: GameActionPreviewBuilder now exposes the full
    20-prop class-level equipment array (None + Rifle/Hammer/Pickaxe/Fishing pole
    + 14 weapon types) and each PreviewProfession carries an equipmentSlotMap array
    translating grid position to class-level index. SetEquipment bounds check
    (index > equipment.Length) is correct for the 1-based selectedEquipment scheme.
    Catalog regenerated: profession-picks.json has equipmentSlotMap entries,
    game-actions-catalog.json has correct equipment indices, and both validation
    files passed (passed:true, 9 presets, 3 NPC). All 8 profession equipment grids
    verified correct in Unity.

- [x] Wave3 Core lifecycle and power batch (Complete; October25).
  Step1: persistent physical starter Cores, reversible authored installation /
  removal with Warehouse/physical-slot reservations, queued work and save/load.
  Step2: power reservations and selected Receiving capability enforcement using
  shared authoring, with visible blocked reasons (including missing cache staff).
  Acceptance: Receiving Core controls execute the four-tick Recipe; no duplicate
  instances/capacity overflow; maximum-active reservations gate installation;
  starter/legacy saves remain usable; focused existing cargo checks plus targeted
  Core transaction checks pass. Preserve the user's live campaign and art work.
  Progress: live campaign backed up at tick16978. Shared Core authoring now reads
  into typed runtime data; starter identities persist through all immutable
  campaign transitions and schema29 saves. Core install/remove requests reserve
  Warehouse places, physical slots and maximum-active PWR, wait on active items,
  and execute the shared four-bubble Recipe with local staff/equipped Tool costs.
  Receiving Core controls/progress and explicit cache blockers are implemented.
  Selected recovery allocation persists once unpacking begins; legacy started
  graphs remain supported. Compile currently passes with zero errors/warnings.
  Validation complete: all five focused Core/cargo/save assertion cases pass
  directly in Editor; 12 Node checks, data schemas, import/art freshness and
  focused diff checks pass. The NUnit runner stalled (combined filter also
  matched zero tests); cancelled it and its residual framework jobs rather than
  repeat a broad suite. Final compile: zero errors/warnings. Verified ordinary
  Play/Stop/restart and zero test controllers. Exact backed-up campaign restored
  at tick16978; no real save overwritten. Actual Receiving Cores control opens
  the panel and both starter removal buttons fit its viewport (compact layout).
  Automatic review rejected the first indirect restore script as potentially
  using an older backup; no action ran. Verified the latest backup tick/path and
  restored with explicit Wave3 paths successfully. No approval remains blocked.
  All criteria for this two-step batch are satisfied; the wider migration stays
  In Progress. Next: Group Tools/eligible Response staffing and technical Service
  consumers; Core manufacturing/degradation/higher-tier recovery remain deferred.



- [x] Toon Soldiers asset evaluation and independent Art Lab (Complete; October 25). User reports
  the package is now in My Assets. Locate the available local package/import,
  inspect its actual rig and clips, and validate one character in a separate
  overhead Unity preview. Preserve Bootstrap, existing original Technician proof,
  campaign saves and build scenes. Report any download/import availability gap;
  account ownership alone does not establish that package files are local.
  Progress: repository search and connected Unity AssetDatabase both find no
  Soldier assets; default local Asset Store package cache has no package to
  import. Bootstrap is currently in user-started Play mode; preserved it. Opened
  Package Manager for the user's My Assets download/import. No art files,
  campaign state or package settings changed. Rig/clip/render checks remain
  pending until the package is local. Next: user downloads/imports their acquired
  Toon Soldiers or Demo package, then inspect actual imported assets.
  - Download recheck: Toon Soldiers Demo.unitypackage is now present in the
    default Unity Asset Store cache; not yet imported (AssetDatabase search has
    zero Soldier matches). Evaluation remains In Progress. Inspecting package
    paths before scoped import; user Bootstrap remains live and untouched.
  - Import complete after Unity rejected package import during Play. Preserved
    the live campaign, selection, view, clock and normal-save hash in ignored
    `unity/.validation-toon-soldiers/` before stopping Play. Package contains no
    scripts or project settings. Actual imports: valid Humanoid model and four
    Humanoid clips: Idle 2s / Run .833s (looping), Shoot 1s / Burst 1.3s (one-shot).
    Vendor demo files remain local and are excluded from Git. Building a separate
    preview; normal save untouched. Live-session restoration is required next.
  - User steering: isolate animation work from the main-game Editor. Same-Editor
    scenes share Play/compilation, so moving the evaluation to a minimal separate
    `unity/OrionisArtLab/` project and Editor process. Restoring the backed-up
    main campaign first; do not run further art checks in the game Editor.
  - Main session restored and validated at tick16978 against the backup's
    codec round-trip, with original selection/view/clock and unchanged normal
    save hash (`artwork/toon-soldiers-proof/session-restoration.json`). A shared
    script reload had cleared the first restored runtime; removed the new art
    editor code from the game project, refreshed, restarted and restored again.
    Art Lab now has its own project/package manifest, local vendor content,
    preview script/controllers/scene and explicit automation isolation rules.
    Launched a separate Unity Editor; initial import/preview verification pending.
  - Independent Editor verified: `unity/OrionisArtLab/` imports and compiles
    cleanly with no campaign code. Uses its own URP forward renderer and local
    demo files, copied with original GUIDs and excluded from Git. Four Humanoid
    clips pass normalized-weight, valid-avatar, Animator deformation and
    stationary-root checks (20 skin bones / 1,174 triangles). Live Play preview
    renders correctly with 3D lighting. Replaced blank synchronous static-pose
    captures with actual Play-frame capture; evidence is in
    `artwork/toon-soldiers-proof/validation.json` and `live-preview.png`.
    `unity/tools/art-lab.mjs` verifies the descriptor's project path and targets
    only Art Lab. Separate chat/work instructions live in its README/AGENTS.md.
    Main session restored at tick16978 with original view/clock/selection and
    unchanged normal-save hash; no further art commands use the game Editor.
    No broad test suite or build needed for this isolated art batch. Remaining
    product choice: demo covers armed movement/combat only; unarmed/work actions
    and retargeting our custom Technician remain unevaluated, not assumed.

- [x] Medium cache and Receiving Core first-pass authoring (Complete; October 25).
  User authorizes provisional Recipes and PWR costs. Acceptance: reference cache
  uses a Medium graph; existing started recovery retains its authored work/output;
  shared data defines T0, removable handling/recovery Cores, reversible install
  Recipes, room/Core power and starter identities. Validate focused cargo/import
  checks, document tuneable values and distinguish authoring from Wave3 runtime.
  Existing Wave2 and Blender workstreams remain intact.
  Progress: cache graph reduced to ten bubbles (two inspections/eight recovery);
  pinned historical graph and save selection preserve started legacy work. Shared
  theory fixture now has six provisional Receiving Cores and reversible four-tick
  installation/removal Recipe, with physical item definitions and a shared power
  policy. Unity projection includes authoring for Wave3; not runtime enforcement.
  Validation: 12 focused Node checks pass; cache/Core/item JSON schemas pass;
  generated bootstrap and presentation-art freshness pass; focused diff check
  passes. Unity compiled the updated DTO/save code. Two existing cargo tests
  pass; the new legacy-save assertion case passes directly in the Editor (data
  only), after Pipeline timeout/shared-runner cancellation interrupted NUnit's
  run. No broad suite or Windows build repeated. Initial strict-DTO failure was
  fixed; a namespace qualification fixed the concurrent Technician preview's
  compile blocker. Editor remains outside Play with zero residual test
  controllers; no live campaign or real save was changed. All acceptance
  criteria for this authoring batch are satisfied. See
  `docs/unity-receiving-cores-first-pass.md` for sources, numbers and boundaries.
  Next: Wave3 physical Core ownership/installation and Warehouse/slot/PWR
  transactions, then selected-Service resolution using the shared package.
  Higher-tier recovery distributions and Core manufacturing remain deferred.


- [x] Original 3D Technician pipeline proof (Complete; October 25):
  incremental reference inspection, original model, rig, idle/walk and isolated
  Unity overhead preview. Existing visual/gameplay systems are not replaced;
  other active work below remains intact.
  - Continued October 25: native Blender tools now connected; current live file
    contains only the default Cube/Light/Camera. Building a separate original
    Technician proof with skeletal idle/walk, followed by isolated Unity import
    and overhead preview verification. Reference assets remain reference-only.
  - Original mesh/rig/animation batch complete: authored geometry and eight solid
    materials, 18 bones, 1,484 vertices / 2,804 triangles; zero invalid vertex
    weight totals. Idle (2s) and Walk (1s) are skeletal clips, with stationary
    root. Source/rebuild script and Blender validation live in
    `artwork/technician-proof/`; original FBX in `Assets/Orionis/Art/TechnicianProof/`.
    Blender front/three-quarter/overhead inspection passed for this provisional
    low-poly proof. Costume/colors/topology are presentation studies, not canon.
    Next: Unity import/deformation/loop/render verification and isolated preview.
  - Unity continuation: both animation takes import. Cross-import checks exposed
    hard-normal vertex splitting and 32 degenerate source triangles; cleaned the
    source explicitly and re-exported (now 1,468 vertices / 2,772 triangles,
    zero degenerate triangles and invalid weight totals). Unity checks compare
    source triangle metrics rather than raw vertex counts. Cancelled shared
    test-runner state that restarted across compilation; another workstream
    subsequently recorded its interrupted cargo check separately. Bootstrap was
    clean and stopped before art verification. No broad suite requested here.
  - Pipeline proof verified in Unity 6000.5.2f1: 18-bone Generic avatar,
    2,772 triangles / 6,018 imported vertices (normal splits), normalized skin
    weights and human scale. Both skeletal clips loop continuously and deform
    through direct sampling AND Animator controllers. Four distinct overhead
    phase captures plus direct overhead passed render checks and visual review.
    Synchronous captures bake sampled poses to avoid Unity's same-frame skinning
    cache; the saved scene retains real skin/Animator playback. Actual Play mode
    confirmed Idle (2s) / Walk (1s), multiple loops and stationary roots (1.36m
    separation). Isolated scene has zero reference-model-folder dependencies;
    no Bootstrap/build-scene/gameplay replacement. Source, evidence and repeatable
    menu commands: `artwork/technician-proof/README.md`. Costume/colors, final
    topology, locomotion/foot locking and lighting remain provisional art work;
    the current 2D renderer produces flat shading. No semantic ambiguity or
    canonical game-data changes in this art batch. Bootstrap ordinary Play/Stop/
    restart passed; restored clean Bootstrap in Edit mode, compile flag clear,
    zero nonpersistent PlaymodeTestsController objects. Final state evidence:
    `artwork/technician-proof/unity-cleanup-validation.json`. Python syntax and
    focused whitespace/diff checks pass. Original campaign saves were not written.
  - Connection check complete: installed Blender MCP add-on 1.8 responds on
    127.0.0.1:9876. Direct add-on protocol ping, get_scene_info and read-only
    execute_code all succeeded; Blender reports 5.2.3 LTS, an unsaved Scene,
    Cube/Light/Camera, Object mode and frame 1. No scene edits/imports/saves.
  - Native Blender MCP tools are not exposed in this agent session. Existing
    C:\Users\Powel\.codex\config.toml has no mcp_servers.blender entry;
    uvx is not on this shell's PATH and was absent at .local/bin/uvx.exe.
    No configuration changes or installations made. Direct add-on transport
    success does not establish the Codex-to-MCP stdio connection.
  - Connection recheck: user added the correct blender MCP configuration.
    Located uvx.exe at C:\Users\Powel\AppData\Local\Microsoft\WinGet\Links;
    this session's inherited PATH does not resolve it, although User PATH includes
    that directory. Launched the cached server offline via its absolute path:
    MCP initialize succeeded (MCP for Blender 1.30.0), tools/list exposed 9 tools,
    and tools/call get_scene_info succeeded with Cube/Light/Camera, Object mode.
    No scene modifications, downloads or configuration edits. Native host tool
    attachment still requires a refreshed/restarted host environment.
  - Reference files located under the user-supplied Downloads folder:
    PC _ Computer - Bloons TD 6 - Towers - Elite Defender\Elite Defender.
    Read-only XML inspection found one geometry/scene node, 1,046 triangles,
    UV/color/normal inputs, one material referencing the supplied 2048x2048 PNG,
    identity node transform, meter units and Z-up. No controller, animation or
    animation-clip libraries. These are source-file findings, not a completed
    Blender visual/deformation inspection; connected components remain unchecked.
  - Import blocker: Blender 5.2.3 LTS has no registered WM_OT_collada_import
    (get_rna_type lookup raises KeyError). hasattr on bpy.ops was misleading.
    No import, scene modification, installation or source-file changes made.
  - Next: choose a supported conversion route or a narrowly scoped, validated
    reference-only DAE reader; then inspect topology/materials visually in a
    separate reference workspace before modeling. Reference geometry/textures
    must remain separate from production assets.
  - Reference inspection completed October 25, superseding the import blocker:
    installed official-listing Collada Support 1.2.2 via Blender extension
    manager after checking package hash and declared bundled wheels (pycollada,
    python-dateutil, six); import_scene.collada registered and import finished.
    Isolated reference scene/collection preserves the original Cube/Light/Camera
    scene. Imported 888 vertices/1,046 triangles, UVMap, one material, 44
    vertex-connected components, 650 boundary edges, zero loose vertices;
    seams can inflate component counts. No rig/weights/shape keys/animation.
    Fixed imported //textures/ path by linking and packing the supplied PNG.
    Inspection roughness .85 is provisional shading, not source material truth.
    Reviewed front/side/three-quarter/direct-overhead renders: useful chunky
    shape/color guidance, but helmet occludes torso overhead and rifle dominates
    silhouette; original human Technician needs free hands, moderate head size,
    readable shoulders/backpack and riggable topology. No Technician work begun.
    Saved outside repository: C:\Users\Powel\Documents\Orionis-Reference-Inspections\Elite-Defender\Elite-Defender-REFERENCE-ONLY.blend,
    alongside four renders, inspection.json and inspection-notes.txt. Readback
    through a temporary copy passed (Blender rejects library-loading the active
    file itself); temporary copy removed. Both source SHA-256 hashes unchanged.
    Next: user review of inspection, then original Technician proof; never ship
    reference geometry/textures with Unity production assets.
  - Helmet-focused reference cleanup complete:
    Saved Helmet-Study-REFERENCE-ONLY.blend plus front/three-quarter/overhead
    renders. Verified removal: tail, between-leg bullet, rifle gone; helmet,
    mask, goggles and body retained. Source DAE/PNG SHA-256 unchanged.
    Original 888 verts/1046 tris reduced to 696 verts/832 tris.
    No Technician modeling or rigging has begun.
   - Unity reference export complete (mockup for pipeline check, not production):
    Exported Helmet-Study-Animated-REFERENCE-ONLY.blend (60-frame idle bob + sway
    animation on root empty) as Technician_Reference.fbx and the source PNG into
    unity/StargateOrionis/Assets/Orionis/Resources/OrionisArt/Models/. Saved the
    animated Blender file alongside the reference inspection. No armature/rig yet;
    animation is root-object transform only. Reference-only: do not ship BTD6
    geometry/texture in Unity production assets.

- [x] Wave2 implementation/release checks complete: preserve/audit the supplied
  Receiving Core handoff without treating proposals/open values as canonical;
  finish remaining supported-slice usability and release documentation; update
  the existing control-driven walkthrough for current UI; build Windows and
  verify launch/save/resume where supported. Preserve live campaign and real
  saves, clean test state, and distinguish automated completion from user
  standalone acceptance. Core runtime belongs to Wave3 and needs missing
  installation/power/identity authoring before an end-to-end claim.
  Handoff preserved verbatim in `docs/unity-receiving-cores-approved-handoff.md`;
  source-backed audit records missing data and the starter Medium vs Large cache
  conflict. Updated existing walkthrough for cards, spatial actions, explicit
  room following and storage reservations; refreshed the playtest guide.
  Added opt-in two-launch player Save/Load verification with a temporary path;
  normal launches retain their existing save locations. Gated debug intake in
  the standalone base view and restored stable roster control IDs. Compile clean.
  First test launch was invalid because UTF tried saving scenes while leaving
  existing Play mode; cancelled it, preserved the dirty scene as
  `Assets/__Recovery/Wave2BeforeTests.unity`, reopened Bootstrap in Edit mode and
  started the single walkthrough correctly. Build and player checks remain.
  Walkthrough updates also account for additional eligible tierIII crosspath
  Actors and room-local navigation after Load; legacy prose/location-tab
  expectations were removed. The test reached Analysis Save/Load before finding
  its stale generic-inventory navigation. Replaced that with physical-room clicks
  and removed irrelevant item actions from non-storage/non-processing rooms.
  Final supported-route walkthrough passed1/1 in20.01s: rescue/cache recovery,
  room processing, reserved storage, equipment issue, Save/Load and redeployment.
  An exact Editor AI Account API timeout warning is expected only if emitted;
  gameplay warnings/errors remain strict. Documentation now matches the current
  room-local flow. Test pipeline cancelled; exiting Play before Windows build.
  Windows build succeeded (145,143,078 bytes;39.3s), with packaged PLAYTEST.md
  matching the current guide. The synchronous pipeline reply timed out after5s
  while Unity continued building; actual Build Successful/Success output and
  guide hash confirm completion, so no duplicate build was launched.
  Both separate headless Windows player launches passed Save/Load, complete
  state/selection equality at tick3 and debug-off checks using temporary saves.
  Ordinary Play/Stop/restart succeeded with0 test controllers; original campaign
  matched tick15724 backup, and its view/running clock were restored. Release
  proof is `docs/unity-wave2-release-checks.md` and build RELEASE-CHECKS.json.
- [ ] User standalone acceptance remains: complete/repeat the supported route
  and relaunch/resume using the packaged guide. This requires the user's own
  playthrough and is not marked satisfied by automated checks.

- [x] Mission/room usability batch complete: shared personnel cards in
  briefing/debrief with mission/team split; target-positioned map actions without
  duplicate text buttons; Gate-only redial; readable status layouts; Tool use/
  save validation diagnosis; Holding cell places parallel to patient beds;
  conflict-only staffing controls; room-scoped queues and routing/follow UI.
  Preserve live state and authorized return-to-base refill semantics. Debrief
  usability is Wave2; broader campaign history remains Wave5.
  Implementation compiled cleanly. Focused isolated check passed briefing and
  debrief cards, all7 recorded mission Tool charges shown at extraction, new
  hack charge preserved through Save/Load, four authored Holding cells,
  idle transfer controls hidden, two distinct doorway hack targets and Gate-only
  Redial. Live and real save both deserialize successfully; original Tool error
  not reproduced, validation remains strict with Unit/Tool diagnostics added.
  Preserve automatic refill on return; debrief derives extraction charges from
  existing committed work history rather than changing physical current stock.
  Room-follow check passed using the older cargo-bearing backup: source queue
  stays open until explicit Follow opens actual custody. Visual review confirmed
  extraction values (60HP Soldier,5/9 Technician,6/9 Medic) and two-column briefing;
  final fit adjustments enlarge the known map and avoid cramped hex labels.
  Final compile0 errors/warnings. Ordinary Stop/Play completed; exact user
  campaign restored at tick15696. No real save-slot writes or Windows rebuild.
  Holding displays its four authored captive places and existing cargo/storage
  reservations; a complete prisoner intake/assignment workflow remains unauthored
  and was not replaced with roster Units or an automatic captive transfer rule.
  Earlier save error remains unreproduced; current, existing and spent-charge
  Save/Load checks pass. Validation is strict with clearer per-Tool diagnostics.

- [x] Manage/construction/Offworld batch complete: show per-target valid
  join/split actions only in Manage mode; author 80% general construction work
  runnable by local Maintenance staff with persistent sticky bubble Actors;
  begin Offworld presentation using existing art and preserve action hexes.
  Keep shared data authoritative, old saves/progress intact, and coordinate
  around the separate Core configuration workstream.
  Implementation: Manage-only per-target actions with horizontal scrolling;
  shared generalWorkShare=0.8, parallel persistent construction bubbles and
  save28 (legacy orders remain serial); Offworld floors from shared stage
  archetypes/overrides and team sprites from the existing unit catalog. Node
  construction/bootstrap tests passed5/5; Unity compile0 errors/warnings.
  Focused verification passed: 480 work ticks completed by two Actors in256
  elapsed ticks; exactly80% general work, partial and completed Save/Load valid.
  Isolated UI buttons actually joined/split adjacent rooms and hid outside
  Manage. Offworld check rendered3 known floor cells and4 team sprites without
  drawing hidden Stages. User campaign restored exactly at tick7577.
  Final compile0 errors/warnings; Manage-to-Clear transition now also verified
  to hide all group actions. Shared bootstrap/art freshness checks passed.
  No full mission replay or standalone rebuild; no real save slots written.
  Provisional detail: the remaining20% includes the existing20-tick Soldier
  security bubble plus Technician/TET1 work. Existing orders retain their old
  serial schedule; new builds/upgrades use the shared0.8 policy. The Offworld
  wave is started, not full room/prop/wall or campaign parity; next work is
  source-backed room framing/props and readable unit/action states.

- [x] Personnel/planning polish complete: smooth HP with a reliable heart
  graphic and current/max; both Tools on one row; interpolate visual fills;
  separate planning status from the progress viewport; mark joinable physical
  rooms with simulator-style dashed outlines and valid join targets clearly.
  Verify live UI after clean reload and preserve campaign state. Core work stays
  with the parallel chat; identify the next executable visual migration step.
  Replaced glyph heart with an explicit mesh; removed HP segments; placed both
  icon/tier/charge tracks side by side. Personnel and Recipe rails ease toward
  committed values using unscaled frame time, without predicting work. Planning
  status and progress viewport no longer overlap. Dashed physical-room borders
  follow shared JoinGroup authoring; gold identifies selection, green uses the
  existing JoinBlocker predicate for valid destinations.
  Verification: clean Unity compile (0 errors/warnings), ordinary Stop/Play,
  exact campaign restore at tick571, live screenshot review; 56 cards present,
  heart mesh11 vertices, smooth HP4 vertices, Tool rows side by side; all12
  authored joinable rooms outlined, layout separation and interpolation passed.
  No mission replay, new canonical rules, save-slot writes or Windows rebuild.
  Next executable visual batch: use existing room/unit art in MissionMapView
  while preserving current Stage action hexes, knowledge and click behavior.

- [x] Personnel follow-up complete: segment HP by maximum health, keep
  current/max visible at the right end, move Roman Tool tier next to its icon,
  and diagnose/fix the reported redeployment regression. Verify live resources
  and focused behavior; avoid broad mission replays.
  User clarified redeployment meant reloading the app, not mission redeployment.
  Fixed list filtering to resize each card rather than its content parent;
  removed excessive label padding, placed Roman Tool tiers beside icons and
  charge counts at row ends. HP segments use one mesh, one segment per max HP;
  current/max scales to narrow cards. Sprite caches reload destroyed references.
  Final compile: zero errors/warnings. Ordinary Stop/Play refreshed stale UI;
  live visual review confirmed portraits/icons/nicknames/HP/Tool rows. Campaign
  restored exactly to the tick58 backup; original clock settings retained.
  Real save slots untouched; no mission walkthrough or Windows rebuild needed.

- [x] Personnel reference-layout implementation complete: large left portrait,
  prominent nickname above actual name/profession/assignment, health and two
  icon-led charge tracks below the details. Preserve selection and assignment
  behavior; verify compilation and the live layout without mission replays.
  Added separate prominent quoted nickname, canonical name/details, right-side
  health with numeric HP, and two icon/pip rows. Fixed roster button creation
  while retaining selection. Final Unity compile: zero errors/warnings.
  Live visual acceptance remains pending: after script reload the prototype
  retained Session but its private clockController was null. Refresh was skipped
  to preserve campaign data; next action is ordinary Stop/Play and review cards.
  No mission tests, save-slot writes or standalone build were performed.

- Core configuration handoff complete: documented current Wave3 gaps, shared
  authorities and implementation entry points for the user's parallel chat.
  This hands off Core authoring/configuration only; the visual workstream remains.
  See `docs/unity-core-configuration-handoff.md`. Verified the two authored
  technical Core definitions and current migration gates; documentation only,
  no runtime changes or tests required.

- [x] Current personnel correction batch complete: all configured base/
  branch Tools are tierIII with9 charges, including save migration preserving
  Tool instance IDs and work history. Do not invent branches for base-only Units.
- [x] Replace overhead sprites on personnel cards with shared profile portraits;
  display existing-pool nicknames without "Name:"; add red/yellow/green HP and
  two icon-led charge rows below it. Use shared profession/specialization icons.
- UI HP thresholds: red<=25%, yellow<=50%, green above50%; presentation only.
  Next visual-wave priority remains construction/offworld appearance parity;
  wider Core mechanics still require authored ownership/install rules.
- Verification: Unity compiled with zero errors/warnings; existing bootstrap
  tests passed 2/2; profile atlas freshness passed (54 profiles, 24 icons).
  Actual save26 migrated to27 at tick6121 with all102 configured Tools tierIII
  and9 charges; IDs/history preserved. Save27 preserves spent charges on reload.
  Live HP checks passed at20/40/80HP (red/yellow/green); visual review confirmed
  profile busts, nicknames, two icon/pip rows and readable staff cards. Six
  base-only Units retain an empty second row rather than invented branches.
  No full mission replay or standalone rebuild was needed for this correction.
  Live campaign restored and matched the migrated backup at tick6121; original
  running4x clock resumed, zero test controllers remained. Real save slots were
  untouched; use Save to retain the migrated live state.
  Next: construction-view art, then Offworld room/unit presentation using
  available authored assets; wider wave3 Core installation remains gated.

- [x] Current visual migration batch complete: import existing validated
  room art into the base presentation and existing personnel imagery into roster/
  Ready Room cards, with readable schematic fallbacks. Follow shared catalogs,
  preserve live campaign state and use focused visual/compile verification.
- Scope follows the user's standing visual priority. Wider wave3 Core ownership/
  installation and Response doctrine authoring remain separate gates; do not
  invent those rules to unblock this presentation batch. Inspect asset readiness
  before claiming either visual step is available.

- [x] Current UI-wave completion batch complete: scrollable cargo intake
  and action layouts for3+ items, shared inspection bubble trackers using actual
  authored work steps/Actors, reversed yellow hazard stripes, and final roster/
  Ready Room presentation pass. Verify the supported standalone slice, restore
  live state and record wave completion gates accurately.

- [x] Current batch complete, revised by user: passive recovery at2HP/tick
  in an assigned Infirmary bed,1HP/tick elsewhere in base; Tools refill on return
  to base. No treatment/replenishment Recipes, staff requirements or Supply costs.
- [x] Main presentation batch: make the Unity base resemble the room/layout
  and staffing simulators, with a visible floor grid and room staff/bed slot cards.
  Preserve existing assignment, inventory, Ready Room and construction controls.
- Scope audit complete: Infirmary has four patient places per physical room
  separate from its two staff, with passive recovery described but no rate or
  executable treatment Recipe. Workshop exists, but no Tool replenishment cost,
  duration or Recipe is authored. Current personnel condition and refill history
  provide persistence foundations, not those missing rules. No gameplay/source
  changes or tests were made in that planning checkpoint. User subsequently
  replaced the proposed Recipes with automatic recovery/refill and explicitly
  prioritized simulator-like presentation. Unity was closed at work start; there
  is no live session to back up. Preserve real save files and verify migration.

- [x] Current follow-up complete: give both configured Tools nine charges
  for every Unit, including the live campaign; deposit rock-clearing Supply per
  completed bubble with save-safe accounting; show active construction ahead of
  completed clearing history. Verify focused regressions and restore live work.

- [x] Current batch: open the reference mission's existing Processing Room,
  recover its Supply cache as a persistent physical instance, and finish the
  executable cargo-wave route through inspection, recovery, storage-limited
  progressive outputs and Save/Load. Preserve the weapon route and current saves.
- Status confirmed **In Progress** for this batch. The Processing Room/cache
  already exist in the authored mission; inspect and project that content rather
  than adding another mission or silently replacing authored cache behavior.
- [x] Add the user's mandatory task-tracking requirement near the top of AGENTS.md.
- [x] Preserve the supplied cargo handoff verbatim in docs and reconcile it with
  current shared schemas, fixtures, Recipe/custody contracts and Unity saves.
- [x] Implement the source-backed cargo foundation needed by the two handoff
  scenarios, preserving legacy rifle/crate behavior. Distinguish locked design
  from proposed implementation; record any missing authoring explicitly.
- [x] Rock clearing schedules eight one-tick UNTRAINED bubbles; available
  permanent Maintenance staff work independent bubbles in parallel. No idle
  roster search or automatic Tool requirement; committed work records Actors.
- [x] Save/Load retains partial clearing work and credited Supply. Rock remains
  blocked until final completion; each bubble deposits its share once within
  valid storage capacity.
- [x] Finish visual verification of the single-mesh progress rail and rebuild
  the Windows player; restore the backed-up user campaign and clock settings.
- [x] Record focused verification results, remaining cargo gaps and a concrete
  next implementation step before this session ends.
- [ ] Complete the handoff's Offworld Supply Cache scenario: same-instance field
  inspection/extraction, authored recovery graph, single open container, Core
  policy, progressive deposits, special work and capacity-blocked exact-once retry.
- [ ] Complete the handoff's shared fixed Rock Formation scenario: physical
  obstruction Instance, authored mixed-duration graph, progressive outputs and
  transactional final removal. Keep the user's existing eight-bubble prototype
  and saved work intact until its explicit migration is implemented.

## Progress, decisions and current blockers

- Personnel correction: tierIII branch labels previously coexisted with tierI
  secondary kits. The Unity loadout projection now creates every configured Tool
  from its authored tierIII definition at9 charges; receiving capability metadata
  follows the actual services. Save27 accepts pinned prior definitions, upgrades
  existing Tool slots/charges and preserves IDs, damage and paid-work history.
- Profile cards now use an atlas rendered directly from the shared profile-bust
  SVG renderer and each Unit's appearance, plus24 existing profession/specialty
  icons. No overhead character sprite is used as a card portrait. Nicknames come
  from the existing profession pools; canonical saved names remain unchanged.
- Removed Name: from shared card labels; added HP colors at25/50% cutoffs and
  two icon-led nine-charge rows below HP. Card heights grew to keep the rows
  separate. Six authored base-only Units have no branch/second Tool; their empty
  slot remains explicit rather than inventing a specialization.
- Two existing projection checks and atlas freshness checks pass. Compilation
  has zero errors/warnings. Live backup is Logs/before-personnel-cards.json,
  tick6121; next verification is actual-save migration and visual/HP-color checks.

- Current visual batch: imported39 existing active PNGs from the simulator
  catalog, covering19 registered room overlays and54 personnel entries. New
  unity/tools/presentation-art.mjs projects shared mappings/variant selection,
  records source hashes and copies PNGs unchanged; --check verifies reproducibility.
- Added room art to the floor plan and selected-room preview, plus a persistent
  Art/Schematic preference. Shared personnel-card styling now displays the
  existing profession sprites in roster, team slots and room staff/bed slots.
  Labels, class colors, CT outlines, health bars and fallback schematics remain.
- Compilation passes with zero errors/warnings. The existing room adapter suite
  now passes7/7; its first test assumed every room had a prop mapping, unlike
  the renderer's existing floor-indoor/no-props fallback. Updated that assertion
  to verify the actual fallback instead of failing on newer room definitions.
  Import freshness/hash checks pass; no full mission walkthrough or Windows
  rebuild was run for these reversible presentation changes.
- Live backup: Logs/before-room-art-wave.json, tick1888, running4x construction
  view. Restored and matched its normalized data exactly, then paused only for
  visual review. Final step: restore original selection, resume4x, document and
  show the art overview for user review. No game/save schema changes.
- Visual batch finished: room overlays, thumbnails and personnel sprites were
  inspected in Unity. Art/Schematic switching and four Ready Room member images
  passed a direct UI smoke check with the same campaign-state reference. Restored
  original Unit selection and matched the full normalized backup at tick1888,
  then resumed running4x. Left the base art overview open for review instead of
  the construction screen. Real save slots untouched. Preview: Logs/room-art-base.png.
- Next actionable visual work: carry the shared art presentation into the
  construction and offworld views after feedback. Wider Core/configuration wave3
  remains gated on missing ownership/install/doctrine authoring; this visual
  batch does not mark those mechanics complete.

- Current UI wave: cargo rows were positioned by decreasing anchors without a
  viewport, so the third item crossed retention controls. Item and action lists
  now have independent masked scroll areas; item/action/detail scroll positions
  survive tick refreshes. Detail, tracker, policy and status regions do not share
  space. The compact Receiving work text is scrollable too.
- Added shared InspectionProgressView, projecting legacy step counters into
  existing one/20-tick work chunks: baseline Receiving4, Analysis2, resource
  recovery20. Actual saved Actor work drives progress/colors; no timers, Recipes,
  knowledge reveals or transactions were changed. Reversed only yellow backing
  stripe direction; bubble seams and completed fill are unchanged.
- Completed planned roster/Ready Room presentation: searchable roster, reusable
  profession/health cards and4/5/6 permanent member slots, keeping existing
  membership/assignment commands and four-person deployment cap.
- Compilation passes with zero errors/warnings. Extended the existing full UI
  walkthrough with three-item scrolling, receiving/Analysis/resource counts and
  all six Ready Room slots; that focused walkthrough is running. Current user
  backup is Logs/before-inspection-ui-wave.json (tick914, three cargo objects,
  two Receiving records), with running4x base view settings in the matching file.
- The focused walkthrough passed after fixing work-room following: all3 items
  scroll, receiving bubbles advance1/4 through4/4, Analysis uses2, resource uses20,
  all6 permanent team slots exist, and the rescue/rifle/redeployment route works.
  Ten shared/export tests and snapshot freshness pass. No simulation rules or
  save-schema changes were needed in this UI wave.
- Visual review caught clipped small captions; removed their excessive padding
  and added visible cargo/action scrollbars. Final screenshot confirms the count,
  selected-item details,1/4 tracker and reversed yellow stripes are readable and
  separated from controls: Logs/inspection-ui-three-items-final.png. Also reviewed
  class-colored Ready Room member slots in Logs/inspection-ui-ready-room.png.
  Base roster search successfully narrowed54 rows to one matching name.
- Ordinary Play/Stop/restart verified with zero residual test controllers.
  Windows build is running; remaining session work is startup smoke, exact live
  campaign restore and final wave/status updates. The supported wave1 loop is
  implemented; wave2 is implementation-complete pending user standalone acceptance.
- Final Windows build succeeded; hidden player startup logged campaign UI ready
  with debug controls hidden, and its owned process was stopped. Restored the
  exact normalized campaign backup at tick914 with3 cargo objects, original
  Unit selection, running4x and base view. Zero residual test controllers; no
  real save slot writes. Temporary visual-preview items/team were discarded.
- Completion evidence: one extended full UI walkthrough plus ten shared/export
  tests passed, snapshot/scoped diff checks passed, final compilation has zero
  errors/warnings, and cargo/Ready Room visuals and roster search were checked.
  Current UI-wave implementation is finished. Next action: user standalone
  Save/relaunch/Load acceptance using docs/unity-playtest-guide.md. Continue UI
  appearance feedback before expanding wider waves3–5; do not silently mark the
  separate critical/special cargo or fixed physical rock scenarios complete.

- Simulator presentation batch: imported the user's passive1/2HP rules and
  automatic Tool refill as shared personnel-recovery data/schema. Save26 stores
  separate patient bed assignments and rule provenance. Beds reserve patient
  capacity rather than staff slots; bed occupants cannot deploy or work as staff.
  Returned condition lives separately from historical combat wounds; Tool refill
  preserves IDs, damage and committed work history.
- Implemented a scrollable floor grid and room borders matching simulator CT
  colors, plus a selected-room panel with colored staff cards, Core-slot and
  patient-bed tabs. Existing roster assignment and inventory commands remain.
- Initial recovery checks passed the return/refill/redeployment route. The bed
  test used a prohibited offworld debug tick; corrected it to advance through
  an actual Gate redial action. Compilation and ten shared/export checks pass;
  recovery schema validates. Next: rerun focused recovery checks and the existing
  full mission/control walkthrough, visually inspect the new base screen and build.
- Recovery checks now pass2/2, including capacity, Save/Load, offworld exclusion,
  return refill without repair, and healed-health redeployment. The full existing
  rescue/cache/rifle/deployment UI walkthrough passes1/1. Its initial base clock
  is now explicitly paused during setup, preventing machine-speed-dependent
  extra ticks. Ten shared/export checks and the new recovery schema pass.
- Visual review confirms visible simulator CT borders, scrollable floor cells
  and profession-colored staff cards. Reduced room-label padding/font after the
  screenshot exposed broken word wrapping. Final compilation has zero errors/
  warnings. Existing save25 migrated at tick411 with its construction site intact.
  Windows rebuild is running; remaining work is bed-button smoke/visual check,
  clean player startup, task completion and leaving ordinary Play ready.
- Final UI bed-button smoke passed: selected a Unit, assigned an actual Infirmary
  bed, advanced one real base tick for2HP, round-tripped save26, then released it.
  Temporary in-memory patient state was restored; no real save slot was written.
  Final screenshot: Logs/base-room-overview-final.png. Ordinary Play/Stop/restart
  and zero nonpersistent test controllers verified. Windows final build succeeded;
  hidden player startup logged campaign UI ready with debug controls hidden,
  then its owned process was stopped. Unity is left in ordinary Play with
  Maintenance selected and its staff cards visible. Final verification totals:
  ten shared/export tests, two recovery domain tests and one full UI walkthrough
  passed, plus the bed-control smoke, schema and visual checks.
- Next actionable priority is simulator-style roster cards and Ready Room slot
  presentation using existing shared data/art. Do not resume the rejected paid
  medical/replenishment Recipe work. Wider Core/cargo/technology gates stay open.

- Charges/bar follow-up: live snapshot captured at tick411 with Generator r17
  at82/480 ticks, Supply cache already consumed and its outputs recorded across
  ticks131–139. User confirmed the lump payout concerned rock clearing.
- Root cause of missing construction bar: completed clearing history preceded
  construction cards, and the viewport was shorter than one card. Active work
  now sorts first across both types; the viewport fits a full progress card.
- Rock clearing now deposits cumulative integer shares (ten total across eight
  bubbles) immediately. Save25 records credited Supply; old completed orders
  migrate as already paid, old partial orders as unpaid. Remaining capacity
  reservations shrink by the amount credited. Cell removal still waits for all
  eight bubbles. The display shows deposited Supply alongside bubble progress.
- Shared personnel loadouts now give both configured slots nine charges.
  Historical mission projections retain their pinned charge values for save
  compatibility. The live refill remains to be applied during campaign restore.
  Compilation and ten shared/export checks pass; focused construction verification
  is running. Current backup: Logs/before-charges-bars.json and matching UI file
  (running4x, planning view).
- Final clearing/construction checks pass8/8; ten shared/export checks pass.
  Tool cancel/spend checks pass2/2. Refilling the actual expedition additionally
  exposed its completed-work charge audit; an explicit per-work refill marker
  now preserves that history instead of bypassing charge validation. Its focused
  round-trip verification is running before the live refill/build.
- Follow-up complete: refill/save round-trip checks pass2/2 with completed-work
  charge history intact; final compilation has zero errors/warnings. Windows
  build and hidden player startup succeeded. Scoped diff/freshness checks pass.
  Restored the exact campaign at tick411 with Generator82/480 and all102 equipped
  Tools at9 charges; verified its progress rail is fully inside the visible
  viewport. Restored running4x and planning view. Only charges/refill audit and
  save-format migration changed; assignments, cargo and work progress matched
  the prepared backup. Real save slots were not written; Save retains the refill.

- Processing Room batch: projected the existing locked door, radiation-source
  isolation and cache collection actions. Added a distinct shared Supply cache
  Item/Reality and a provisional twenty-bubble recovery graph; the weapon crate
  remains unchanged. Field inspection, recovery, Receiving work, progressive
  output commits and capacity-pending retries now have implementation and UI.
- User approved Balanced Supply and Material recovery defaults in lieu of Core
  configuration. This batch uses those defaults; it does not install Cores.
- New cargo and eight-bubble clearing share a bubble-execution kernel. Save24
  retains Actor work/outcomes and accepts the previous mission fingerprint for
  existing saves. Focused integration tests are in progress: the first run found
  a missing Receiving adapter initialization, corrected before the next run.
- Current user state is backed up in Logs/before-processing-wave.json and
  before-processing-ui.json (tick2463, speed1); do not restore the older backup.
- Focused resource transaction tests pass2/2; construction/clearing regression
  passes8/8; shared economy/export tests pass10/10 and the two new shared schemas
  validate. The extended rescue UI walkthrough has reached rifle acceptance;
  remaining corrections so far are its expected extra seven mission ticks and
  navigation/Actor choices for the new branch, not weakened game requirements.
- The full handoff requests critical/special-property examples without authored
  probabilities or magnitudes, and a larger fixed rock graph separate from the
  user's eight-bubble clearing. Those criteria remain open; do not mark the
  entire migration wave complete on the strength of the ordinary cache route.
- Final resource tests pass2/2, including migration from save23, field inspection
  persistence, same-instance recovery, Balanced deposits, full-capacity pending
  outcomes, zero-time retry and tamper rejection. Construction/clearing passes8/8.
  The existing full rescue UI walkthrough, extended through the Processing Room,
  cache collection/debrief/recovery, progressive deposits, rifle issue and repeat
  deployment, passes1/1. Final capacity/provenance validation compiles with zero
  errors/warnings. Shared/export checks pass10/10; four shared schema/table checks
  pass and bootstrap freshness/scoped diff checks pass.
- Windows rebuild is running. Remaining session work: verify build/smoke result,
  clear test framework state, confirm ordinary Play/Stop/restart, migrate/compare
  the current campaign backup and restore its paused/speed settings. Only then
  mark this bounded Processing Room/cache batch complete.
- Processing Room/cache batch complete. Windows build succeeded; hidden player
  smoke logged campaign UI ready with debug controls hidden, and its owned
  process was stopped. Ordinary Bootstrap Play/Stop/restart was verified with
  zero residual nonpersistent test controllers. The real campaign migrated and
  matched its normalized backup exactly: tick2463, eight assignments, two cargo
  objects, existing offworld Holding Area expedition; paused/speed1 preserved.
  Real save slots were not written. Unity is left in ordinary Play, Base planning.
- Next actionable migration work: author/implement personnel recovery and Tool
  replenishment costs/work for a repeatable sortie, plus the remaining fixed-rock
  and optional critical/special cargo definitions. The ordinary cache path and
  standalone build are ready for user playtest; wider wave gates remain open.

- Handoff copied verbatim to docs/orionis-cargo-shared-schema-handoff-unity-migration-wave-0.md.
  Reconciliation found no existing cargo economics/manifest/placement/pending-output
  fields. Existing schemas are strict Item/Instance tables with reusable $defs;
  their physical and Knowledge models remain authoritative. Existing processes
  can be extended; no new cargo Recipe runner or resource ledger will be added.
- Locked handoff rules supersede the earlier provisional conversion stat1 and
  Pristine-as-richness terminology for new resource cargo: Poor/Standard/Rich/
  Exceptional, INV-count Small/Medium/Large/Huge, 100x conversion units and
  within-family tier weights1:4:16. Existing weapon crate stays non-resource.
- This eight-bubble clearing request remains Medium by the new size ranges.
  The handoff's larger inspected/demolition rock scenario is a separate authored
  Recipe; do not rename eight bubbles Huge or silently replace saved clearing.
- Scope for the cargo implementation step: shared validated economics and
  instance-schema extensions, projection into Unity and cross-runtime numeric
  examples. Progressive Recipe transactions, fixed physical obstruction instances
  and Core configuration must then integrate into existing execution contracts.
- Shared economics/query implementation and strict schema extensions are now
  written. Twelve focused Node checks and nine schema/legacy-fixture checks pass.
  Unity imports the same catalog; C# parity checks also pass.
- Unity cargo parity checks now pass (2/2), using the same authored examples and
  progressive-share totals as JS. Compilation has zero errors/warnings. A stale
  test-framework Play-mode restore state initially prevented execution; cleared
  it through normal cancellation/Stop/reopening Bootstrap, then verified the run.
  The existing full rescue/equipment UI walkthrough passed as the legacy
  regression check. No source/fixture edits were made during test execution.
- Found an unfinished RecoveredCargo storage-routing path that credited
  handlingCost*quantity as Supply, consumed the object, and referenced undefined
  variable d. Removed that conflicting conversion; routing cannot generate value.
  No existing physical weapon crate is made into resource cargo.
- User clarified eight bubbles per rock cell, one tick (three minutes) each.
  UNTRAINED still means a real Unit assigned to Maintenance; each available Unit
  works at most one bubble per tick. Unworked requirements are white, completed
  work uses the actual Actor's profession color. Bubble duration classes are
  one tick or twenty ticks; construction display now uses those work chunks.
- Implemented shared CLEAR_ROCK authoring, parallel Maintenance work, output
  reservation, schema23 migration from schema21/22, and clearing cards/cell state.
- Replaced overlapping hazard/track/fill layers with RecipeProgressGraphic;
  corrected endpoint coverage after a 0/50/100% visual review. Final renderer
  compilation passed with zero errors/warnings; final review/build still pending.
- Verification so far: 5 shared/export checks, 8 construction/clearing domain
  tests and 1 integrated UI/save-load walkthrough passed. The walkthrough first
  exposed a missing CanvasRenderer requirement; fixed and rerun successfully.
- User campaign backup: unity/StargateOrionis/Logs/before-clearing-wave.json,
  with clock/UI settings in before-clearing-ui.json (tick1797, running at4x).
  Ordinary Play/Stop/restart and test-controller cleanup were verified before
  visual review. Editor was subsequently stopped for final compilation.
- The earlier approval-review usage limit is resolved on the resumed turn.
  The final Windows build succeeded through the normal approval mechanism and
  its hidden smoke-test player logged campaign UI ready with debug off.
- Final verification: 12 Node tests, 9 schema/legacy-fixture checks, 8 Unity
  construction/clearing domain tests, 1 construction UI/save-load walkthrough,
  2 Unity cargo parity checks and 1 full rescue/equipment UI walkthrough passed.
  Shared snapshot freshness and scoped diff checks pass; compilation has zero
  errors/warnings. The handoff copy is byte-for-byte identical to the supplied file.
- Final bar visual check on the restored Cultural Platform confirms a solid
  100% fill with slanted seams and no hazard leaking at its endpoints; preview:
  unity/StargateOrionis/Logs/clearing-final-bar.png. The completed campaign was
  normalized/compared against its backup and is unchanged (tick1797 at restore).
  Original running4x clock restored; UI left in Base planning. Ordinary
  Play/Stop/restart verified, zero residual nonpersistent test controllers,
  and the owned player smoke process was stopped. Real save slots were not written.
- Next actionable implementation: author one resource Item/Instance and explicit
  recovery Recipe/output distribution, then wire generic pending-outcome commit
  and retry into the existing process/storage transaction authority. See
  docs/shared-cargo-reconciliation.md. No critical probabilities, special-property
  outcomes, owned Receiving Cores or final fixed-instance placement rules were
  invented; the two new integrated scenarios remain unfinished.
- The new handoff adds progressive resource recovery and atomic pending outputs,
  beyond the bounded eight-bubble/one-final-award clearing prototype. Reconcile
  before expanding that implementation; do not present the new scenarios as done.

## Existing art workstream: Shared wall families + Infirmary furniture trial — October 18, 2026

- User authorized separating reusable architecture from room-specific furnishings.
  Three four-piece wall families (angular/rounded/utilitarian) and three matching
  four-piece Infirmary furnishing sets are in `artwork/room-layer-prompts-v1/`.
- Generate the wall corners first and coordinate the rest of each family; then
  generate Infirmary furniture with matching walls as references. Every prompt
  starts and ends with a mandatory clickable download link/exact filename instruction.
- Modular preview offers independent wall/furniture imports, masks and visibility.
  Missing artwork is labeled schematic. Existing combined art stays available;
  no new generated assets or canonical medical capability are implied by the trial.
- Reuse existing door leaves only as a labeled visual comparison. Structure masks
  use the established 12-unit depth/channel; furniture has separate inset masks.
  Furnishing dimensions and circulation are illustrative presentation, not rules.

---

# Historical checkpoint: Modular room-kit prompt generation — October 13, 2026

- User authorized correcting CT arithmetic and choosing provisional dimensions/registration. CT1 remains 8/8/8 amber; CT2 is now 4/6/4/6/4 blue; CT3 is 4/16/4 purple. All total 24, with colored coverage 8/12/16. Original handoff is preserved verbatim; [working art contract](docs/offworld-modular-room-visual-kit-contract.md) supersedes its arithmetic.
- Chosen registration: 128-unit logical cell; 32/64/32 grid bands; full 1024×1024 RGBA source for every piece; planned 128×128 registered runtime frame; rotation at cell center (64,64), source (512,512). Walls are 12 units deep with a 5-unit transparent channel at offset 4; the underlay repeats every 24 units. Centered doorway is 32 units wide. SHARED permits diagonal reflection plus rotation. Separate base floor supplies all coverage; CENTER/EDGE_OPEN are empty v1 members. These are provisional art choices, not gameplay dimensions.
- Added `demos/shared/sprites/room-kit-prompts.mjs` and `prepare-sprite.mjs room-kit-prompts --kit <id> --out <fresh-directory>`. Omit --kit for all 19 base-room types. Six reusable roles × three coordinated families; exact geometry and expected 18-file kit schema are exported with a measured SVG guide. Existing full-room overlay/outstanding modes remain compatible with installed keys.
- Ready example queue: [artwork/room-kit-prompts-v1/README.md](artwork/room-kit-prompts-v1/README.md), 36 Receiving/Material Storage requests plus `room-kits.json` and `registration-guide.svg`. No final images generated. Empty CENTER/EDGE_OPEN sources should be created deterministically when preparing a kit, not sent to image generation.
- User's CT reference image guides pale corner armor/dark inset panels and short amber/two blue/long purple openings. Its OPEN wall-end maps to SHARED; room size is independent of CT. No baked tier color, floor grate, labels or glow. Reference currently lives in chat, not a portable source file.
- Validation: all eight focused modular/legacy/outstanding prompt tests pass; syntax and scoped diff checks pass. Broader preparation run: 17/18 pass, existing ZIP-unpack path fails `spawnSync python ENAMETOOLONG` on Windows; no claim of full-suite success. New tests cover 24-unit arithmetic, slot partition/rotation, family metadata, subject constraints and export/no-overwrite behavior.
- Resume: validate registered art in assembled previews, add registered preparation and complete-family ingestion, exact Transition edge binding, Stage-wide persisted family selection and renderer composition. Reconcile Offworld archetype kits separately (outdoor Gate/no-wall subjects). Keep physical rooms/Core Sets and gameplay unchanged. Underlay repeat interpretation/perimeter loop seam and dimensions remain explicitly provisional. See [updated plan](docs/offworld-modular-room-visual-kit-plan.md).

---

# Historical checkpoint: Modular room visual-kit documentation and prompt plan — October 13, 2026

- Latest request: incorporate the new v2 handoff, identify conflicts and leave a resumable plan. This pass changes documentation only; implementation directives inside the handoff are subsequent design deliverables, not the scope of this pass.
- Portable source: [verbatim v2 handoff](docs/offworld-modular-room-visual-kit-handoff-v2.md). Working reconciliation and ordered plan: [modular room visual-kit plan](docs/offworld-modular-room-visual-kit-plan.md).
- New target: six rotatable semantic pieces on a per-cell 3×3 grid; three coordinated complete kit families (18 source assets); one deterministic family per Stage; neutral wall art exposing an amber/blue/purple CT underlay through a registered 5×24-unit slot. Preserve authored topology, fog, hidden Reality and separate mission instances.
- Conflicts: locked CT2 and CT3 patterns total 20 rather than 24 units; module geometry/registration is unspecified; current prompts bake fixed bottom-center clearance; ordinary crop/recenter and three-source ZIP ingestion do not support registered complete kits; current per-key variant picker/random reset seed does not guarantee kit-wide or reload coherence; Transition layout picks the first candidate edge; SHARED handedness and door-frame ownership need proof.
- Resume with geometry/CT clarification, then a dedicated modular prompt generator/export queue and Receiving/Material Storage examples. Preserve old queues/art. No final image generation. Renderer/manifest/ingestion adoption and composition tests follow separately: no gameplay-rule change is indicated, but eventual rendering cannot use the new pieces without presentation changes.
- Documentation validation: imported handoff checked against its original; local links and scoped whitespace diff checked. No simulator tests run because no executable files changed. No canonical rules invented; unresolved locked values remain explicit.

---

# Mission Author: The Last Transmission — October 12, 2026

- User approved a complete new setting/cast and requested ready mission JSON
  plus a save action. Authored `demos/shared/data/offworld/last-transmission-001.finalized.json`:
  six connected 2×2 Stages, distinct relay-prefixed physical instances, Rhel/Taren/
  Vessa dialogue, four primary objectives, two optional objectives, signal-log
  verification, medical stabilization, service code/Technician II hack, explicit
  combat, peaceful withdrawal, two Send-to-Gate evacuations and log Receiving.
- Mission Author now offers a starting-point selector, loads/validates this mission,
  and **Save ready mission JSON** downloads direct compiler-checked Offworld JSON.
  Original rescue-variant option and semantic composer remain available. No save
  endpoint or base writes added. Shipped authored JSON is itself ready to load.
- Extended existing instance archetypes with legal playerLabel overrides and the
  inspect Recipe with outcomeText presentation. No new archetypes, Theories,
  Patterns, Services or runtime effects. Source data retains authored Reality and
  Knowledge boundaries; no original benchmark instances are reused in this cast.
- Added `last-transmission.test.mjs`; updated author app/index/browser-test/README,
  Offworld README and REPO_MAP. Runtime tests traverse actual doors and complete
  diplomacy, evidence (without Diplomat), and combat/hack routes; rendering checked
  at each action/movement. Enlarged crowded room footprints after map layout caught
  a placement failure that compiler validation alone could not detect.
- Validation: 140 focused Mission Author/Offworld tests passed; final four mission
  route/render tests passed after geometry changes. Isolated Edge passed save filename,
  exported JSON import/deployment, travel/courtyard dialogue, existing semantic review
  and 390px expanded layout; no live writes. Syntax/diff checks passed.
- Explicit scenario assumptions: peaceful withdrawal uses existing FLED state with
  authored visibility conditions; civilians use existing Send-to-Gate abstraction,
  not physical escorts. Log uses SIM_INTEL_ARCHIVE and shared capacity-owned admission.
  Semantic Draft Finalizer and campaign-world persistence remain separate gaps;
  this mission is authored executable content, not an automatic Finalizer output.

# Current Task: Room Sprite Requirements

- **Windows installation activation retry:** screenshot showed EPERM replacing active-sprites.mjs. Local file has no read-only attribute and inherited Modify/Full permissions; exact lock/security cause unconfirmed. Added shared atomic replacement helper with bounded Windows EPERM/EACCES/EBUSY retries for installation and review/migration registry writes, keeping existing registry on persistent failure and reporting recovery steps. No unlink/in-place fallback or live install. Six focused retry/install tests pass; isolated Edge room installation smoke passes; syntax/diff checks pass. Restart local demo server for fix, then retry selected room variants. Persistent external denial still requires releasing the lock or correcting security policy.

- **Room overlays recognized by Sprite Viewer:** registered 25 explicit floor-room presentation keys (18 catalog rooms, Cultural Platform study, six Offworld stages) with transparent 128px/no-padding/full-frame profiles and a blank shared fallback. Saved discovery now finds all 96 existing room source/prepared candidates; square sources resize without centering, prepared installs preserve bytes. Ordinary splitter excludes these profiles; ordinary prompt queue remains separate. No live art installed and simulator overlay rendering remains pending. Restart demo server and hard-refresh viewer for new manifest. Focused model/install/ZIP/preparation tests: 21 pass.

- **Pending room-art queue refreshed:** `artwork/room-tile-prompts-v3/` contains 10 prompts: Generator, Cultural Platform (art-only recorded 2×2 concept), Holding, Research, and six existing Offworld stage archetypes. Fifteen extracted room sheets are omitted from active generation, not marked visually approved/installed; v2 acquisition checklist and older prompts/art preserved. Offworld prompts exclude separately rendered instances and hidden facts, with transparent ground and open connections. Arena Control Rings remains excluded; Lab/Command Bay files unassigned. No room JSON, runtime mapping or installed art changes. All 14 focused prompt/preparation/catalog tests pass; syntax checked.

## Active request and resume checkpoint

- **Distribute arm scaling by segment (October 13):** user observed both enlarged segments landed on screen-left and both reduced segments on screen-right. Kept all pieces on their original physical sides, but restored independent paired-average fitting per segment: Man left upper shrinks/right upper grows while left forearm grows/right forearm shrinks (same relationship for Girl). Image offsets and elbow/wrist spans scale with their own pieces; legs unchanged. Updated normal-walk/tests/README. Eighteen unit tests pass, one historical skip; isolated Edge passed and final bone capture reviewed. Visual fit remains provisional pending user review. Refresh only.

- **Restore arm sides and exchange size factors (October 13):** user corrected the last interpretation: restore physical upper-arm pieces to original sides and swap prior scaling, not pieces. Removed source exchange and tile remapping. Upper scale uses opposite side's former paired-length factor (Man screen-left1.189/right.863; Girl1.099/.917); matching offset/elbow-span scaling keeps native shoulder/elbow landmarks registered. Forearms and approved legs unchanged. Changed normal-walk/app/tests/README; eighteen unit tests pass, one historical skip. Isolated Edge passed; final bone capture reviewed. Fit remains a visual study pending user review. Refresh only.

- **Exchange upper-arm pieces (October 13):** user clarified “backwards” means upper-arm sources are swapped, rather than sizing. Fitted shirt walk now exchanges the two native upper PNGs for Man/Girl, reflecting shoulder registration and carrying each replacement's native joint span without resizing its cap. Forearms/hands retain their existing sides; approved legs unchanged. Tile thumbnails and sleeve variants follow the exchanged source mapping. Authored comparison unchanged. Changed normal-walk/app/tests/README; eighteen unit tests pass, one historical skip, isolated Edge passes and bone capture reviewed. Fit remains provisional pending user visual review. Refresh only.

- **Undo upper-arm size imbalance (October 13):** latest screenshot followed paired-length fitting that enlarged the right shoulder cap and shrank the left. Restored native upper-arm image scales and corresponding shoulder-to-elbow spans for both characters, retaining matched forearm lengths, stable image registration and approved leg timing. Source-to-side mapping still matches the original rig; no filename swap. Changed normal-walk/tests/README. Eighteen unit tests pass, one historical skip; isolated Edge passes and bone capture reviewed. Native projected upper spans remain unequal, so complete arm symmetry is still provisional. Refresh preview; no restart needed.

- **Matched arm proportions / remove independent image drift (October 13):** user noted one upper arm moves differently and forearm length/scale mismatch. Source Man upper lengths132.8/96.4 and forearms68.7/95.6 (Girl also unequal) were inherited projected bat poses. Fitted neutral rig now uses paired average segment lengths, uniform per-segment image scaling plus matching attachment-offset scaling; freezes projected elbow/wrist translations at neutral values, preserving aspect ratio. Arm images register to shoulder/elbow at consistent world offsets/angles over all mainline times. Both original empty-hand PNGs get matching cuff-at-wrist pivots (.5,.85) and mirrored orientations, preserving hand sizes. Original authored comparison and all approved leg timing/hip placement/camera unchanged. Changed normal-walk/tests/README. Eighteen unit checks pass, one historical skip; Edge passed and Man/Girl bone/art captures reviewed. Stronger drift/length tests pass across the loop; syntax checked. Proportions and cuff placement provisional. Refresh preview; no restart.

- **Outer-edge shoulder pivots (October 13):** user clarified the pivot line is too close to the center, not the sprite scale or seam. Moved fitted shoulder roots substantially outward from .18/.86 to .08/.96x at same .48y (about25pixels per side Man), translating each arm chain without scale/angle changes. Measured shirt alpha bounds at joint row approximately18..245px Man,26..232px Girl; new roots lie near those outer edges. Chest/head/leg code untouched. Added outer-span regression; four focused walk tests pass, isolated Edge passed, wider pivot-line overlay reviewed. Approved leg phase/timing preserved. Refresh preview; no restart.

- **Reverse shoulder attachment nudge (October 13):** user approved legs but found upper-arm movement direction wrong. Reverted only the last inward/down shoulder translation: roots return to .18/.86x,.48y (outward/up from .21/.83,.50). Matched shoulder/elbow angles, source scales and all approved leg timing/hip placements preserved. Changed normal-walk/README; all four focused walk tests pass, isolated Edge passes, bone overlay reviewed. Refresh preview; no restart.

- **Stride-side synchronization / shoulder chest attachment (October 13):** user reported foot appearing on opposite side to advancing leg at198ms. Synthetic sine stride was opposite the authored extended-image timing. Reversed motion phases (screen-left pi, screen-right0) so left advances/extends at198 and right at594; original image side/timing and vertical lanes preserved. Shoulder roots moved slightly inward/down to provisional .21/.83x,.50y, keeping symmetry and matched angles. Changed normal-walk/regression/browser captures/README. Eighteen unit checks pass, one historical skip; explicit198/594 tests assert extended image and forward stride same side. Edge passed; reviewed both transition captures and bone overlay. Fixed camera preserved. Refresh preview; no restart.

- **Inward mirrored shoulder/elbow posture (October 13):** user requested shoulders closer to walking posture and matching elbow angles. Fitted upper arms now target mirrored15-degree directions from vertical; forearms angle5degrees inward (matching20-degree elbow bends). Resamples shoulder keys at union of source mainline/shoulder/elbow times to remove right-side angular mismatch around198ms; normalizes angles/shortest spins and samples immutable upper-fit snapshot for lower correction to preserve seam. Arm lengths/scales/pivots/right-sleeve handedness preserved; hips/knee frame timing and fixed camera unchanged. Changed normal-walk/regression/README. Eighteen unit checks pass, one historical skip; new mirrored-angle checks across loop plus existing continuity/seam/lane checks. Isolated Edge passed; reviewed assembled Man/Girl and final bone overlay. Original authored comparison remains available. Posture angles provisional; refresh preview only.

- **Restore knee raise / move hips back (October 13):** user clarified intentional lower-leg image appearance with knee extension was lost. Fitted walk again follows authored rifle raised/extended source-image timing per side, including594ms; keeps upright orientation/top-center attachment/fixed vertical lanes and fixed camera. Bone lengths and image-local offsets share key times to hold hip anchoring through frame changes. Hip/pelvis landmark moved from .72/.70 to shirt midpoint .50y, farther back inside torso. Changed normal-walk/regression/README. Eighteen unit checks pass, one historical skip; source frame timing tested every millisecond alongside lane/anchor/shoulder continuity. Edge constant-camera checks pass; reviewed500/593/594 and595bone captures showing lower leg restoration. Proportions remain provisional. Original authored walks/source art unchanged; refresh preview only.

- **Stable camera and verified leg orientation (October 13):** user reported apparent body scaling and remaining leg issue. Camera had recomputed bounds fit around moving head every frame; now uses rest pose anchor and fixed scale/offset per loop, preserving natural bob/small authored head sway. Source extended Girl leg proves thigh/top and boot/bottom; previous 180-degree rotation was incorrect. Fitted walk now uses source orientation0, top-center hip attachment, and selects the tallest authored leg image (_0002 extended frame) once per side so lower-leg details remain visible without popping. Compact variants regenerated with top-center padding; tile thumbnails show extended source. Updated app/normal-walk/exporter/unit+browser tests/README. Eighteen tests pass, one historical skip; isolated Edge constant-camera check passed; reviewed extended upright legs, bone overlay and compact Girl leg fit. Syntax checked. Original purchased assets/weapon actions unchanged. Refresh preview; no restart.

- **Frame-centered head / pelvis and leg-marker correction (October 13):** clarified previous change shifted the head relative to shirt; new headCenteredView centers original head frame at canvas240,240 and fits asymmetric bounds around it. Fitted shoulder roots now stay level and symmetric around shirt center each key (provisional .18/.86x,.48y); right sleeve reflection remains image-only. Rebased body control as pelvis with compensating child/image offsets, preserving rendered torso/head placement. Leg markers now named hip/knee/ankle with positive forward/down segment extents, avoiding reversed stride marker at zero crossing; hips move to .72y. Leg image orientation retained; it is one whole-leg PNG, not separately articulated upper/lower leg art. Changed model/app/normal-walk/unit+browser tests/README. Eighteen unit checks pass, one historical skip; isolated Edge passed, including frame-center check; inspected corrected bone overlay at595ms and both character renders. Syntax checked. Original authored comparison/weapon animations/purchased source unchanged. Anatomical proportions remain provisional. Refresh preview; no restart.

- **Centered head + explicit hip/stride bones (October 12):** user noted offset head and misleading leg bones. Fitted shirt walk now centers original skull frame horizontally on provisional shirt center (.52 frame width) at every head key, retaining Y bob. Legs attach via explicit left/right hip+stride bones parented to body; source leg PNG bottom-center pivot with 180-degree orientation extends boots forward/down, avoiding rear toes above shirt. Lane offsets .32/.72; reduced continuous stride amplitude. Removes all unreferenced old bat/rifle leg bones from fitted mainline overlay. Source artwork, original comparison, weapon animations and appearance options preserved. Changed normal-walk/tests/README; seventeen unit checks pass, one historical skip, testing per-frame centering, leg pivots/named bones/lanes and continuity. Isolated Edge passed; reviewed full-size forward boots and compact-leg/head renders for both characters. Head center, hip locations and stride remain provisional; no canonical/game data changes. Refresh preview; no restart.

- **Continuous square-shoulder walk (October 12):** investigated user-reported 500/594ms movement. Rifle source switches long/short leg image at594 and crosses leg lanes; reflected right sleeve inherited spin0 which froze its newly differing angles until that key. Fitted shirt walk now reparents legs to body, uses fixed separate lane offsets/opposing smooth periodic forward-back strides and one source image per leg. Removes unused duplicated rifle bones from fitted pose. Mirrored sleeve interpolates shortest angular path instead of held angle. Original authored torso comparison/weapon walks remain intact. Changed normal-walk/tests/browser captures/README/map. Seventeen unit checks pass, one historical skip; regression samples every millisecond for lane positions/file stability/sleeve+leg continuity. Edge passed; reviewed 500/593/594 captures. Foot motion/stride magnitude remain provisional preview fitting; existing Plain/Compact options preserved. Refresh preview; no restart.

- **Right upper-arm handedness correction (October 12):** user identified right upper arm specifically. Fitted shirt walk now reflects only z7 sleeve image across its shoulder-to-elbow axis, including image-local translation/angle, negative X scale and reversed interpolation spin. Both joints and downstream forearm/hand bones stay in place; original source selection and scale magnitude retained. Applies to Man/Girl backpack-free torso normal walk, not authored comparison or weapon actions. Updated normal-walk/regression/README; isolated Edge passed and both assembled images reviewed. Sixteen unit checks pass, one historical skip, including fitted loop seam and original side sources. Skin patch remains removed. Refresh preview; no restart.

- **Remove misplaced neck patch / arm sidedness audit (October 12):** removed locally invented neck patch from plain/profession torsos and regenerated 54 entries; torso masks again contain no skin ID5. Arm source audit at 0/200/400/600ms shows z3/z4 remain screen-left and z7/z5 screen-right with original positive image scales; no accidental mirroring or side crossover found. Native upper-arm images are different poses/shapes, so source mapping alone does not establish visual correctness. Asked user which segment looks reversed (shoulder panels/forearms/hands); arm geometry unchanged pending that clarification. Sixteen unit checks pass, one historical skip; isolated Edge passed after patch removal. Clothing surfaces/exporter tests/README updated. Refresh preview; no restart.

- **Shirt shoulder fit (October 12):** user approved torso orientation and requested arm adjustment. Added fitShirtArms derived normal-walk variant: translates shoulder roots to provisional torso-side landmarks, rotates upper/lower arm chains into neutral downward pose, retains segment lengths/image scales/pivots and authored motion. App selects fitted variant for backpack-free/profession torso choices; Authored torso restores original bat arm placement. No source SCML, head/torso/leg bone transforms, weapon actions or Death changes. Changed normal-walk/app/unit regression/README. Isolated Edge passed and assembled Man/Girl renders reviewed; sixteen unit checks pass, one historical skip; syntax checked. Refresh preview; no restart.

- **Torso quarter-turn correction (October 12):** user identified previous silhouette as 90 degrees out. Corrected rotation sign: plain torso is now 45 degrees counterclockwise from its original local artwork (90 degrees from the previous preview). Neck and profession details remain forward-facing; rig registration, timeline layout and compact leg options preserved. Updated clothing_surfaces.py/README and regenerated ignored local pack. Fifteen unit checks pass, one historical skip; isolated Edge passed and assembled Man/Girl captures reviewed. Refresh character preview; no restart.

- **Actual torso rotation + viewer timeline placement (October 12):** previous correction rotated only clothing detail coordinates; user correctly noted torso shape remained diagonal. Now rotates the underlying plain shirt image/mask 45 degrees clockwise in its source frame with a small rightward local registration shift, then paints forward neck and profession details. No bone/pivot changes or extra back extension. Preview wraps canvas/Time/frame status in their own playback-viewer column so tall sidebar cannot push timeline down. Changed clothing_surfaces.py, preview index/style/browser test and README. Regenerated local pack; fifteen unit checks pass, one historical skip; isolated Edge verifies same-column timeline within 20px of canvas and all clothing/compact-leg controls. Reviewed assembled Man/Girl captures showing changed torso orientation. Visual registration remains provisional. Refresh character preview; no restart.

- **Forward chest/neck + compact legs (October 12):** user superseded back enlargement with an optional smaller leg image. Restored the previous garment-hull back silhouette; added skin ID5 neck patch within existing alpha, oriented profession chest details forward (removed 45-degree overlay rotation). Compact left/right leg tiles use 40% image size anchored lower-center in unchanged frames; both stride source alternatives get matching copies. Native rig transforms/pivots/source art unchanged. Pack has 54 PNG/mask entries, sidebar 30 tiles. Changed clothing_surfaces/exporter/app/asset+browser tests/README. Fifteen unit checks pass, one historical skip; isolated Edge passed; inspected compact-leg frames across the walk cycle and corrected forward chest/neck renders for both characters. Simplified chest/neck and compact scale are provisional visual tuning. No Death/live simulator changes; refresh preview only.

- **Profession clothing studies (October 12):** added six torso studies per Man/Girl: technician utility shirt, scientist lab jacket, medic tunic, scout field jacket, soldier vest, diplomat tailored jacket. Local clothing_surfaces.py creates editable vector collars/seams/pockets/panels/accents over the registered backpack-free base, retaining alpha/frame/pivots/source SHA. Shared shirt/gear/harness/accent masks enable recoloring; no profession equipment/game rules authored. Exporter creates 46 entries; preview dynamically adds torso variants (28 tiles), independent of sleeves/head/legs, normal walk only. Updated exporter/app/tests/README/map. Edge checks six visibly distinct options for each character and existing controls/mobile; corrected RGBA unpremultiplication overflow before final assembled capture review. Detailed chest art is partly occluded by top-down heads. Simplified prototypes remain provisional; ignored purchased artwork and original source preserved. Refresh character preview; no restart. Fourteen unit checks pass, one historical skip; JS syntax checked.

- **Sprite Viewer missing-install filter (October 11):** added Only sprites with no installed variant checkbox. Filters whole sprite groups by enabled/non-rejected installed pool entries, combines with search; fallback and preview-only art do not count. Uses shipped active registry for static hosting and existing installer API refresh after install/review. Changed viewer app/index/README/browser check. Isolated Edge smoke passed: hides installed types, retains fallback-only types, combines with search, restores groups when unchecked, includes a type whose only installed variant is rejected. Syntax checked. Refresh viewer; no restart required.

- **Backpack-free torso study (October 11):** local native Illustrator exporter now retains Man/Girl garment paths while excluding backpacks/straps. Bridges strap gaps using a smoothed hull of retained garment contours, producing provisional shirt bases with editable SVGs, shirt-only ID1 masks and source dimensions/pivots. Pack now has 34 PNG/mask entries. Preview adds independent Torso Authored/No backpack tiles (22 tiles total); Plain defaults to no backpack, normal walk only. Original source art/SCML, bones and other segment choices preserved. Updated exporter/app/asset and browser tests/README/map. Thirteen tests pass, one historical skip; isolated Edge verifies both torso comparisons and existing controls/mobile; assembled Man/Girl captures reviewed. Clothing seam/collar detail remains future work, no canonical game data or live simulator changes. Local purchased derivatives remain ignored. Refresh preview; no restart.

- **Independent upper/lower arm tiles and clean forearms (October 11):** split sidebar into left/right upper-arm, forearm and leg groups (20 tiles). Each segment switches independently; lower-arm choices are Authored/Plain/Bare/Sleeved. Native local exporter produces 32 PNG/mask entries, including 12 accessory-free forearm surfaces with editable SVGs. Smoothed source alpha outlines retain source frame dimensions and pivots; forearm masks contain only skin/shirt, with no wrist-wrap/pouch channels. Raster alpha uses a solid SVG silhouette to avoid the local PDF converter ignoring clip paths. Original PNGs/SCML stay unchanged; no Death or live simulator changes. Updated preview app/browser and asset tests/exporter/README/map. Unit checks: 12 pass, one historical skip; isolated Edge checks independent segment swaps, both characters, colors, playback, workbench and mobile. Final assembled Man/Girl captures reviewed without rectangular alpha artifacts. Shading/outline smoothing remain provisional. Derived art stays in ignored purchased pack. Refresh character preview; no server restart required.

- **Limb-option tiles + sleeve variants (October 11):** character preview now has thumbnail tiles to the right of playback (below on mobile), independent left/right arm/leg selections. Arm choices Authored/Plain/Short sleeve/Long sleeve; leg choice includes both stride frames. Global preset resets current character's choices; mixed choices show Custom; authored weapon actions disable tiles. Material/Appearance changes refresh thumbnails. Native exporter now produces 32 local independent assets/masks: original 16 plain limbs plus 16 long/short sleeve upper-arm/forearm parts for Man/Girl. Shirt ID1 vs exposed skin ID5; long sleeves have no skin mask, wrist gear retained. Sleeve hems use provisional halfway upper-arm masks; no new canonical game data, original sources/rig transforms intact. Updated preview app/index/style/exporter/browser/unit tests/README/map. Eleven unit checks pass, one legacy skip; Edge checks independent side swaps, sleeve rendering both characters, original actions unchanged, mobile no overflow. Local artwork remains ignored. Refresh character preview; no restart.


- **Separate left/right plain limbs (October 11):** added prepare-plain-limbs.py native Illustrator vector exporter (reviewed path ranges + source SHA guard), producing 16 independent PNG/mask assets under ignored artwork/zombie-tds-main-characters/plain-limbs-v01: each Man/Girl has left/right upper-arm, forearm, long/short leg frames. Removed upper-arm pouch/tattoo vector paths and Man leg pouch paths; native upper-arm colors normalized for shirt ID1 shading. Upper-arm bands interpreted as cloth shading; Girl forearm wraps/skin preserved; vector crop registration remains provisional. All original PNGs/SCML untouched; source dimensions/pivots preserved. Optional Normal walk limbs selector defaults Plain and supports Authored comparison; image substitution is only normal walk, preserving bone transforms/scales. Workbench lists independent plain parts alongside originals, uses existing material controls. Changed preview app/index/browser test, added asset regression test/exporter, updated README/map. Ten unit checks pass, one legacy skip; isolated Edge validates plain/authored switching, left/right workbench parts, colors, playback, mobile. Before-after.png available in local output folder. Final outline-cleanup exports and browser check pass; no restart, refresh only. No live simulator integration or Death edits.


- **Authored arm geometry correction (October 11):** supersedes estimated normal-walk IK and prior shoulder fitting. Rebuilt normal-walk.mjs from complete Walk_bat upper-body bones and image transforms: native forearms, correct source handedness, untouched scales/pivots/local transforms; replace only bat-containing hand with empty fist at authored wrist. Preserve Walk_riffle legs and image switches. Existing asymmetric bat arm pose retained; neutral swing requires separate pose authoring, replacement fist registration provisional. Unit regression compares every arm world transform/scale/pivot to authored bat; nine checks pass, one legacy skip. Isolated Edge and rendered-frame review pass. Updated normal-walk/tests/README; refresh only, no restart.


- **Bat-walk shoulder correction (October 11):** supersedes bat_0009_man selection below. Normal walk now resolves each character's actual Walk_bat shoulder images (z3/z7), Man Knife1 knife1_0002_man2/knife1_0005_man5 and Girl knife1_0008_girl2/knife1_0011_girl5; preserves authored 1× scales, adjusts constant upper-arm lengths to native image attachment spacing. Rifle legs remain intact. Attachment landmarks remain provisional. Updated normal-walk module/tests/README; nine unit checks pass, one legacy skip; isolated Edge smoke passes. Browser refresh only, no restart.

- **Character preview controls + authored rifle legs (October 11):** removed duplicate head skin/hair inputs; selected-head recoloring now uses existing bottom material inputs (keep Color selected head checkbox and separate head accessories input). Workbench lists all 196 imported SCML files, including unused bat parts for both characters. Neutral Man shoulders use bat_0009_man; Girl arm selection unchanged. Normal walk legs reuse Walk_riffle bone hierarchy, original key times/interpolation, pivots and leg_0002 image switches with a constant torso registration offset; sources remain untouched. Changed preview app/index, normal-walk, browser/unit checks and README. Nine unit checks pass, one legacy extraction test skipped; isolated Edge smoke passes shared head colors/all parts/playback/workbench/mobile. Limb attachment landmarks remain provisional visual tuning; Death untouched. Static changes need browser refresh only.


- **Generator room authored:** added `generator` to active `rooms_schema.json` and legacy `rooms.json`, following user-selected Ration Storage structural baseline: 1×1, own join group with 1×1/1×2/2×2 layouts, unstaffed, CT 1–3, two fixed Core slots per physical room. Removed ration storage/inventory/quantities/actions; power output, fuel, Services and processes remain explicitly undefined. Uses existing generator prop/floor presentation; catalog-driven simulator now includes it without a seeded base save change. Twelve focused tests and isolated Edge generation/rendering smoke pass. Cultural Platform is absent from both catalogs; recorded 2×2 Tech Platform-based design still requires capability review and was not implemented. Existing exported 17-room prompt queues remain historical; future exports include Generator. Unique color is presentation-only. Corrected map's active-vs-legacy room catalog pointer.

- **Skull-normalized seven-style heads + color masks (October 11):** user authorizes correcting scale by underlying skull, adding missing spiky/cropped/fringe styles, and separating skin/hair/accessories for coloring. Existing four + worker v01/v03 + diplomat v03 now seven styles per character (14 entries). Local prepare-heads.py uses authored estimated crown/temple bounds at 118px Man/122px Girl skull width, neck anchor alignment and explicit padded frames (64 left/112 top/64 right/32 bottom) instead of fitting whole hair silhouette. Registry/renderer validate sourceSize and offset and retain original rig pivot units; workbench draw/picking handle padding. Each head has exclusive ID mask/diagnostic and luminance references: fixed ink0/accessories3/skin5/hair6; goggles/ties spatially masked and lens pixels preserved during cutout cleanup. Added Color selected head and skin/hair/accessory controls plus existing mask-review support. Source colors remain until enabled; changes tab-local, original default, death excluded, no source/SCML/live rig changes. Build asserts normalized skull width, bounds, map IDs/transparent pixels; eight focused tests pass, one legacy skip. Isolated Edge passes all14 choices, all3 head color channels, default reset and existing masks/skin/workbench/mobile; visually reviewed enlarged bun in gun pose and goggles mask. Source-specific landmarks/skin-hair boundary cleanup provisional. No restart; refresh preview. Final isolated Edge check after lens preservation also passed.

- **Prepared head choices populated (October 11):** user reports dropdown only Original and requests actual new heads. Extracted four existing profession sources (technician v02 short hair, v01 brown bun, v03 blond goggles, scientist v02 tousled hair) using local source-specific polygons/gear color exclusions; uniformly fit each to the original Man 137x146 and Girl 148x207 canvases with estimated neck alignment. Eight PNGs/registry entries now under ignored head-variants/ with reproducible prepare-heads.py, registration review and contact sheet. Original stays selected on load; both characters show four additional choices. Death excluded, source PNGs/pivots/SCML unchanged, no live activation. Isolated Edge verifies all eight choices change rendered heads, default reset, existing masks/skin/workbench/actions/mobile; visually inspected Man short/goggles authored gun poses. Head registry unit test passes and diff whitespace check passes. Edge/neck fits remain provisional; bun/ponytail silhouettes fit smaller on Man to avoid clipping. No restart: refresh preview for populated Head dropdown. Prior empty-library status superseded.

- **Head variant library/dropdown ready (October 11):** user requests a place for multiple future heads and preview selection, explicitly no immediate swap. Added ignored `artwork/zombie-tds-main-characters/head-variants/` with empty index registry, Man/Girl folders and registration README. Head dropdown loads valid per-character entries, defaults/resets to Original, substitutes only explicitly registered file paths in playback/workbench, retains source pivots/metadata and unregistered view fallback. Exact canvas sizes checked; missing/invalid variants skipped with note. Death replacements rejected/render original; original PNG comparison disabled while a variant is selected. Variant colors remain unchanged instead of applying unrelated source masks. Pose-study export records variant ID. No new heads generated/isolated or original overwritten; no live rig change/restart. Registry/fallback tests plus existing tests: seven pass, one legacy skip. Isolated Edge passes the Original-head dropdown plus existing mask/animation/workbench/mobile checks; refresh preview to see the Head dropdown.

- **Material masks + head selection (October 11):** user wants reusable masks instead of repeated recolors, and then explicitly excludes all death poses. Added ignored local `material-masks-v01/` build script, manifest, 111 non-death source-sized exclusive ID maps/diagnostics, README and head comparison. IDs: fixed, shirt, gear, harness, accents, skin, hair, trousers. Death entries explicitly fixed: original art rendered, no mask processing/visualization; historical prior death artifacts may remain unused. Verified processed source hashes, dimensions and transparent IDs. Added optional mask-driven Technician color controls and mask-review toggle to character-sheet preview, shared playback/workbench; original alpha/pivots/source maintained, colors tab-local. Reviewed 24 profession character variants; selected technician v02 as easiest compact short-haired overhead head candidate for original 137x146 Man head, scientist v02 second. Context comparison saved; no head cutout/registration/swap performed. Six focused tests pass, one legacy cutout test skipped; final isolated Edge passes color changes/mask review, both skins/non-death actions/workbench/controls/mobile. First-pass fine hair/ink/material boundaries remain provisional. No live rig activation or restart: refresh preview. Prior claims about processing death poses are superseded by user's exclusion.

- **Complete technician skin loaded (October 11):** user requested loading the exact-source reskin into character-sheet preview and finishing the set. Mirrored the full purchased Bodyparts tree under ignored `technician-reskin-v01/bodyparts/`: 205 PNGs, 80 recolored, 125 unchanged, covering all 196 unique SCML-referenced files for both characters. Manually reviewed a local source catalog to select clothing/gear across knife/gun/bat/rifle/flamethrower/death poses; skin, heads, weapons and effects preserved where appropriate. Every source hash, output dimensions and alpha checked. Added local reproducible `skin.json`; optional Appearance selector defaults to Technician when complete, switches animation/workbench together without altering pivots/timing/SCML, falls back to Original if absent/incomplete. Original baked PNG comparison disabled for Technician. Six focused tests: five pass, one legacy cutout test skipped; isolated Edge passes skin changes, workbench, authored actions, controls/mobile. Inspected technician gun pose. README/report updated; diff whitespace check passed. No live rig activation or server restart; refresh character-sheet preview. Continuous color shading/material selection provisional; amber patches only the initial Gun_1 pair, no guessed new geometry. Normal-walk visuals remain rejected and were not retuned.

- **Exact-source technician reskin (October 11):** user rejected independently generated limb shapes and explicitly directed starting from `main_bodyparts` and `gun_shot/Gun_1` purchased models. Created ignored local `artwork/zombie-tds-main-characters/technician-reskin-v01/` with matching `bodyparts/` directory/filenames, local deterministic recolor script, comparison, report and README. 22 PNGs total, 14 recolored and 8 unchanged copies: gray male sleeves/both torsos, darker gear/backpack, amber male shoulder patches, subtle boot tint. Heads, Girl exposed arms and gun hands preserved. Verified exact original dimensions/alpha for every output and unchanged source hashes. No crop/resize/geometry/pivot/SCML changes, no purchased art uploaded to imagegen. Visual material assignments/patch placement provisional, continuous shading retained rather than strict mask ramps. Other action folders not yet reskinned; preview/live activation unchanged. This supersedes the rejected eight-part generated atlas as the active approach. No server restart needed.

- **Technician limb artwork study (October 11):** user rejected the second normal-walk presentation and changed direction to modified limbs matching technician sprites. Stop walk tuning. Created `artwork/character-studies/technician-limbs-v01/` with eight-part atlas (paired upper sleeves, forearms, gloves, boots), original prompt, alternate alpha-cleanup attempt and README. Built-in imagegen used only the project's generated technician v01 as style reference; no purchased assets supplied. Inspected both outputs and checked PNG dimensions/alpha/material colors. All eight cells contain foreground, but faint halos remain, opacity tops out at 254 and exact RGB palette compliance failed. These are independent style candidates, not registered replacements: no separate exports/pivots/masks, animation, live installation or code changes. Original artwork/purchased SCML and separate rig sprint preserved. No code tests needed for this artwork-only change; no server restart. Next step is visual selection, then geometry-preserving fitting/cleanup, not another walking algorithm.

- **Normal walk correction for user rejection (October 11):** user rejected the mirrored/foreshortened knife-pose silhouette as terrible. Replaced normal-walk.mjs with a new neutral presentation rig using original distinct gun-pose upper/forearm parts, empty fists, torso/head and boots. Aligned torso, manually estimated image attachment anchors, two-bone arms with constant lengths/uniform scales, opposite arm/foot phases and modest body sway. This is a simulator-authored 800ms/16-key loop, not a purchased SCML animation. Original animations/files remain untouched. Six focused tests pass including no weapon/source mutation, seam, limb length and uniform scale; isolated Edge passes both characters/default walk and prior controls/actions/mobile. Reviewed new 0/200ms images and all 16 frames captured; local animated review and contact sheet saved under ignored `artwork/zombie-tds-main-characters/normal-walk-review/`. Visual approval belongs to user, not test results. No server restart or live simulator activation; refresh preview. Prior milestone's claims about retaining knife-walk motion are superseded by this replacement. Separate rig sprint untouched.

- **Room furnishing prompts revised (October 10):** current generator and new `artwork/room-tile-prompts-v2/` queue (17 prompts, Analysis first) request transparent RGBA ground/empty space so the tile system supplies floors, plus an unobstructed bottom-center door area and approach in every variant. Full square frames and shared entrance position are preserved; no door/frame is drawn. Historical v1 prompts and existing images remain untouched. Updated navigation/room requirements and regression coverage; all 15 room prompt/preparation/character prompt tests pass, and diff whitespace checks pass. Current opaque `--tiles` splitter rejects these new transparent overlays and ordinary sprite mode crops/recenters; dedicated transparent full-frame splitting remains a follow-up, explicitly documented. Existing study keys retained; no renderer, installer or canonical data changes. Door clearance is qualitative because no pixel dimensions were requested.

- **Normal unarmed walk preview complete:** user asks to generate an ordinary walk using purchased rigs. Added `demos/character-sheet-preview/normal-walk.mjs`, a presentation-only derived Walk_normal for Man/Girl, default in preview. Reuses knife-walk body/head/foot motion, closes tracks into an 800ms loop, replaces knife hand with the existing empty fist, mirrors left arm chain/skins onto right to avoid weapon-pose pivot offsets, and authors alternating relaxed foreshortened arm swing. Source SCML/PNGs and original 22 animations remain unchanged; derived action has no exported PNG comparison and the control disables accordingly. Provisional posture/projection amplitudes are visual tuning, not gameplay or canonical data. Seam/no-weapon/movement/source-immutability test passes for both characters; six focused tests pass before final arm correction, derived test re-run passes after; isolated Edge passes both normal-walk defaults plus original actions/controls/mobile. Visually reviewed 0/200ms poses after correcting initial asymmetric right-arm reach. No live simulator integration, disk image generation, registry changes or server restart; refresh same preview URL. Separate rig sprint untouched.

- **Purchased SCML rig preview complete (October 10):** user purchased `artwork/zombie-tds-main-characters/` and authorized replacing approximate cutout preview with original PNG/SCML data. Added generic stdlib `import-pack.py` producing ignored pack-local preview-data.json; both characters import with 22 animations/158 frame exports, all image references present. Added pure Spriter sampler (mainline refs/parent hierarchy, key time, spin, linear/instant interpolation, file/key pivots, z-order, alpha/scale) and authored rig rendering with stable per-action camera, character selector, timing/scrub/speed/step, optional review repeat, bone overlay and original PNG comparison. Non-looping authored endings preserved. Static parts workbench now uses each character's original referenced PNGs/file pivots; no source skeleton editing/live registry integration. Girl's literal Walk_FireThrhrower export folder mismatch explicitly handled; no source files renamed. `.gitignore` excludes purchased pack/generated data and prior publisher-preview derived study; local-asset tests skip when absent. Five model/rig tests pass including all actual local poses; isolated Edge passes both characters/22 actions/decoded PNGs/controls/mobile. Visually compared rendered Man Walk_gun at t=0 with original PNG: composition matches. PNG comparison timestamps approximated uniformly; camera range uses 40 samples plus mainline keys. No AI vector/mask customization yet, no source changes, no server restart needed, no commit/push. Separate rig sprint files untouched.

- **Character sheet preview ready (October 10):** user chose separate rig/animation preview before live simulator use. Added `demos/character-sheet-preview/` with 11 action sequences/64 frames, play/pause/step/FPS/zoom/original-crop comparison, and 61-part workbench (add/drag/rotate/scale/edit provisional pivot/select layer/bring forward/remove/clear/download pose JSON). Workbench remains tab-local; no base writes or live registry changes. Visual animation centers are hand-estimated, not bone registration; static workbench is not an animated rig, and source sheets depict different characters. Hub and Sprite Viewer link to preview. Two model tests pass (source alignment and transformed layer picking/provisional export), isolated Edge smoke passes decoded images and all tested controls/mobile width. Actual pointer dragging not exercised by smoke; model checks cover picking transforms. No server endpoints changed or restart required. Earlier JPEG/provenance limitations remain in extraction README. Separate rig-session files untouched.

- **Linked character sheets extracted (October 10):** downloaded user's two itch JPEG URLs into `artwork/cc0-character-study/originals/`, preserving originals. Local Pillow/numpy/OpenCV script `extract.py` now produces `extracted-clean/`: 64 action frames, 61 hand-bounded part cutouts, untouched decoded comparison crops, contact sheets and source-rectangle/hash provenance. Visually checked frame/part contact sheets and corrected neighboring barrels, dark head/boots and effects; fine edges/small hands/touching bats remain approximate. Pivots are null/unmeasured; these previews are not production/rig-ready. Animation and parts sheets show different characters, not a matching rig. Matching publisher page is `free-game-assets.itch.io/top-down-shooter-main-characters`, a paid pack with original PNG/SCML parts; user's CC0 description is unverified and recorded as such. No purchase, install, registry, game data or separate rig-session changes. Next useful step is original pack PNG/SCML for source-quality rig work. User can review both contact sheets via study README. Room tile prompt work remains complete.

- **Room-interior sheet prompts ready (October 10):** user requests three room tiles in one image, split locally. Added presentation-only `room-tile-prompts.mjs` for all 17 existing room types, Analysis first, and `prepare-sprite.mjs room-tile-prompts [--out directory]`. Ready queue: `artwork/room-tile-prompts-v1/`. Each prompt requires one opaque exact 3:1 sheet with three square cells, strict orthographic overhead camera, fixed decorative furnishings and open walking space; no walls/doors/people/movable props. Existing furniture/geology queues preserved. Python splitter `--tiles --asset floor-room-analysis --size 128x128 --padding 0 --batch <new-name>` preserves full cells and writes 1024px masters/runtime previews without sprite centering. Fourteen relevant tests pass, including edge preservation, invalid dimensions/transparency and no overwrite. No images generated or installed, no canonical data changes. These floor-room keys are not runtime-registered yet; next wave after visual approval is renderer/installer integration that replaces baked furnishings rather than double-drawing them. No server restart needed; rig sprint untouched.

- **Prepared civilian install availability fixed:** folder/file imports now refresh saved repository candidates before loading previews; direct `<batch>/vNN/<key>.png` folder paths retain prepared identity, and canonical-ID deduplication prevents duplicate cards across folder/server reloads. All 17 viewer/server tests and isolated Edge smoke pass, including batch-folder import refresh/dedup/install. Existing production validator passes civilian b001 v01–v03. No live sprites, registry or reviews changed. Refresh viewer to reload saved candidates; server restart is unnecessary for this client-only fix.

- **Custom Python sheet skill:** added project `.cline/skills/split-sprite-sheet/SKILL.md` and Python/Pillow splitter. Direct Python command splits three horizontal isolated variants using safe transparent gutters, centers 1024px source masters and prepares runtime PNGs from those exact masters. Explicit size/padding avoids a second manifest catalog; optional existing Node CLI wrapper supplies manifest settings. Solid-background cleanup is opt-in. Existing batches, edge-clipped art, unsafe cuts and floors/state pairs are refused. All 14 initial split/center/preparation tests passed; two splitter tests re-run pass including Python-only byte-equivalent outputs. No supplied real sheet processed, installed art changed or visual acceptance claimed. Rig/head-kit work untouched.

- Room prompt queue verification: all 13 preparation/character-prompt tests pass, including focused queue coverage and existing full-queue compatibility. CLI syntax and diff checks pass. Upload the numbered files in `artwork/room-sprite-prompts-v1/` individually; no demo restart needed.

- **Room prompt queue ready:** additional six furnishings/13 geology keys were already registered and included in full generation, so no new asset/game IDs added. Added focused `room-prompts [--out directory]` CLI mode using the same current per-asset/three-design/ZIP instructions, furnishings first, without portraits/rigs. Wrote 19 requests plus checklist to `artwork/room-sprite-prompts-v1/`; existing prompt folders untouched. Room docs/map point there. Queue regression verifies exact additional-key coverage, transparency/tiling, canonical ZIP names, no profiles and refusal to overwrite. No art generated or installed in this wave; separate rig-session files untouched.

- **Room Sandbox sprite integration complete:** default Sprites / optional Schematic toggle; shared manifest and exact Offworld spriteImage/variant/fallback code, plus rectangular surface primitive for floors/walls/geology. Existing padded physical-room geometry drives exposed walls/corners; furnishings are per physical room, continuous Gate remains one 3×3 room, static inactive Gate avoids inventing connection state. Doors/anonymous staff-count markers use shared art; CT/selection/join-destination labels/outlines and click controls persist. Choices stable on redraw; reset/generation/base reload refresh seed. No authored data or gameplay/save model changes. All 14 focused room/renderer/selection/server tests pass, isolated real Edge smoke passes controls/toggle/state parity/variant stability/geology/Gate/fallback/390px and blocks live saves; temporary screenshot visually reviewed. Docs/map updated with test commands. Existing installed assets and incomplete art still fall back normally; identity-specific roster staff is not inferred from staffCount. Rig sprint files untouched.

- **Gate b003 repair complete:** user chose regenerating matching Gate art, then corrected missing stairs/excess portal and camera. User approved steeper north-up camera candidate; generated three variants using built-in imagegen and prepared them with locked identical frame/stair pixels, energy confined to the aperture. Replaced six PNGs under `artwork/sprite-prepared/orionis-gate-b003/vNN/` after all six existing paired CLI validations passed. Byte-for-byte originals, selected generated sheets, final prompts, batch-specific preparation script and pixel report are preserved under `artwork/gate-repair/orionis-gate-b003/`. User direction supersedes older flat-overhead Gate appearance for this batch. No downloaded sources, installed art, registry or reviews changed. Refresh viewer to see replacements and install chosen pair; server restart unnecessary for PNG-only updates. Rig sprint remains another session's work.

- **Shape/design variant prompts:** replaced color-accent/secondary-detail variation instructions with explicit v01 angular, v02 rounded and v03 chunky layered/utilitarian geometry briefs, with character/natural/floor-specific wording. Fixed palette, three major shape differences and grayscale/runtime review requested; semantic inventory, footprint, source colors and pair registration preserved. Matching portrait prompts retain each overhead design. New `artwork/sprite-prompts-v5/` queue has 48 numbered requests covering 50 assets plus nine profiles; previous queues, rig/head-kit prompts and raster art untouched. All 16 focused preparation/prompt/rig tests, module syntax and diff checks pass. Generated-art visual compliance remains pending actual new PNGs; featureless subjects explicitly may limit variation.

- **Prepared variants are independent (supersedes earlier source-linking entries):** user confirms prepared PNGs are deliberately rescaled/centered alternatives. Review/install IDs now preserve `sprite-prepared/<batch>/vNN/<key>.png`, distinct from originals. Saved prepared folders reload through the local listing API. Install validates and copies exact prepared bytes, without re-preparing originals; pair installs copy both prepared states and run existing runtime pair validation. Source reviews/old installations retain their IDs and are not silently migrated. Browser-only prepared previews cannot install a different saved original. All 18 focused viewer/server/selection tests and isolated Edge viewer smoke pass; no live reviews, registry or art changed. Original chat owns viewer debugging; rig sprint handoff is `docs/character-rig-sprint-handoff.md` with separate checkpoint requested.

- **Rejection identity clarification:** screenshot shows prepared wall b002/v03 and its saved original, which intentionally share canonical source identity and Reject/Restore. Different batch filenames remain independent. Added explicit shared-original identity on prepared cards and README explanation; regression assertions cover same-source linkage and different-batch independence. All six viewer model tests, app syntax and diff checks pass. No review records or installed art changed.

- **Prepared-folder installation fix:** bulk outputs under `artwork/sprite-prepared/<batch>/vNN/<key>.png` now resolve to the canonical saved source batch/variant rather than `vNN/<key>.png`. Prepared cards show their variant and explain that installation re-prepares the saved original; unavailable install buttons have visible guidance. Load the whole sprite-prepared folder so batch identity survives. Originals/active selections unchanged. All 16 viewer/server tests, isolated Edge smoke including prepared-folder install, syntax and diff checks pass. Prepared edits are not installed; this remains a saved-original-source workflow.

- **Installed random-variant wave complete:** all 26 focused viewer/renderer/preparation tests and four server tests pass; nine rig/renderer checks re-run pass after preserving identity/down-angle through rig fallback. Isolated Sprite Viewer and full Offworld Edge smoke both pass without runtime errors, including reset and 390px layout. Current task changes are presentation selection, pool migration/retention and review eligibility; no gameplay state changed. Existing downloaded art was preserved, legacy installed PNGs recovered into source-identified pools, and latest reference images retained. User next step: restartdemo, refresh Offworld and deploy/reset for a fresh per-object selection. Future installs append/replace their source candidate inside the pool; rejected candidates stay excluded after refresh.

- **Installed random-variant wave:** user requests selecting any installed variants on map load. Installer now preserves per-key variants instead of remembering only the latest; viewer Installed labels reflect all enabled installed candidates and its reference card says Latest installed/fallback. Added seed-based presentation-only variant picker with stable Unit/NPC/object identity, Stage-level surfaces and paired Door/Gate families. Page load/deployment/reset gives fresh seed; movement/redraw keeps appearance. No mission state or rules changed. Reject/Restore synchronizes disabled flags to registry for next reload. Added read-only Python pixel matcher using the SAME extracted normalization function; variants-refresh recovers earlier version folders by canonical source identity. Ran recovery on actual existing art (authorized by this request): 16 asset pools recovered, most with three variants, preserving latest-reference selections and existing review exclusions. No new preview sources installed. Tests: 26 focused viewer/renderer/preparation tests plus four server tests pass; isolated viewer Edge passes. Offworld Edge regression is running. Next: record browser result, then user restartdemo and reload to use random pools.

- **Rig handoff wave complete:** 21 focused rig/renderer/prompt/preparation tests pass; four rig tests re-run pass after adding bad-PNG/no-partial-output coverage. Node/Python syntax and diff checks pass. Full isolated Offworld Edge smoke passes deployment, Tools, observations/work/Lab, interactions, station/rejoin, recovery/reset, existing sprite behavior and 390px layout without runtime errors. No live art or gameplay writes. Eight prompts and exact source metadata are reviewable in rig-proof/. Visual acceptance (neutral seams, max-angle gap checks, walk readability) remains pending real generated parts, not claimed by automated fixture tests. Next user step: upload 00-technician-master-prompt.txt, approve its new locked-template master, then use each 01-07 prompt with that SAME master. Current art still renders normally because the active rig registry is empty.

- **Rig handoff wave — implementation checkpoint:** user explicitly authorizes all handoff deliverables. Added `CHARACTER_RIG_CONTRACT.md`, shared seven-part pivots/hierarchy/z-order and pure four-phase pose sampler, optional SVG rig renderer and empty `active-character-rigs.mjs` registry. Sprite renderer uses reviewed opt-in rigs with single-art fallback on invalid metadata/failed part loads. Added full-canvas seven-part Python normalization and `rig-prepare`/`rig-prompts` CLI modes; eight technician proof prompts plus source rig.json are ready under `artwork/sprite-prompts-v4/rig-proof/`. Source pivots are a locked provisional new-master template, not guessed from old art; head owns neck overlap, requiring conversion from old head-kit templates. Full-canvas 1024->128 resizing preserves joints; normal preparation must never crop parts independently. Walking is exposed as presentation-time sampling; room movement is currently instant and no runtime WALK state, timer or gameplay behavior was introduced. No art generated or activated; no rig ZIP installer. Initial tests found a fixture assertion requiring exact alpha255 after Lanczos; corrected to permit expected interpolation while verifying position and transparent regions. Next: complete focused/browser verification, then have user generate/approve master before decomposing all seven parts; seams/extreme rotations/readability require actual supplied art.

- Strict RGB verification: all 12 prompt/preparation tests pass, including exact ramp arithmetic, matched-view/source-channel wording, batch exports, no-overwrite and existing PNG/ZIP preparation. Changed module syntax and diff checks pass. Actual generated PNG RGB compliance remains unverified until new art is supplied.

- **Strict RGB prompt update:** user requests numeric RGB values for profession sprites, profiles and head variants to support masks/shading. Shared prompt palette now lists exact integer sRGB bases and five fixed shades per matte channel (-32/-16/0/+16/+32, clamped), including fixed source skin/hair/beard colors. Outlines and separate translucent lens pixels have explicit RGB/alpha. Updated nine character and nine profile files in both v3/v4 plus six v4 head-kit files; regenerated source templates remain geometry/identity matched but normalize both new views to the source palette, preserving downloaded originals. This replaces earlier reference-color precedence. Prompts require pixel inspection/quantization before claiming exact compliance; no raster art or masks changed. Generator/checklists/contract updated. These are presentation-only source channels, not new game data or automatic final person colors.

- Head-kit verification: both focused prompt tests pass, covering matched views/material channels, six-file queue, template registration and overwrite refusal. CLI syntax and diff checks pass. No claim of generated-art alignment; that requires reviewing the supplied results.

- **Head-kit prompt wave complete:** user requests the proposed head/accessory prompts. Added presentation-only `head-kit-prompts.mjs` and CLI `head-prompts`; wrote six ready prompts plus checklist under `artwork/sprite-prompts-v4/head-kit/`. Foundation requests head-free bodies, bald heads and measured registration for matching overhead/portrait views; subsequent requests cover three optional head shapes, cropped/swept hair, short beard, separate goggles frames/lenses and optional glasses. All layers stay on full reference canvases; skin/hair/gear channels retain shared semantics, lenses are separate. Generation requires approved reference/templates; base-head overlays are not assumed compatible with additional head shapes. No images generated, active selections changed, importer, compositor or masks implemented. Next action: upload prompt 00 with one approved overhead/profile pair, review templates, then 02/03/04 for the small proof. Earlier work remains uncommitted.

- Prompt-wave verification: all 10 character-prompt/preparation tests pass, including palette/reference matching, complete batch queue, no overwrite and existing normalization/ZIP validation. Diff check passes. Profile rendering/ingestion is future work, not tested or claimed here.

- **Character/profile prompt wave complete:** user requests updating character prompts with consistent material colors and matching profile pictures. Added shared presentation-only `character-art-prompts.mjs`, applied palette instructions to all nine person keys, added CLI `profile-prompt` and nine reference-required front-facing portrait requests to batch `prompts` under profiles/. Generated complete `artwork/sprite-prompts-v4/` (48 overhead requests + nine portraits); refreshed v3's nine character requests and added profiles, preserving non-character text and older queues. Profile variants match overhead source IDs, appearance and palette; existing downloaded reference colors take priority. Portraits use separate 1024 RGBA source ZIPs with explicit profile filenames and overhead batch number. No manifest keys, portrait ingestion/masks, personnel writes or active art changes are claimed. Next wave: review one new paired character/portrait batch, then build matching source masks and portrait ingestion if requested.

- **Character mask correction complete:** user review identified large missed fabric regions. Expanded sleeves/cuffs, torso and lower trouser bands; added polygon exclusions protecting equipment panels and separate Harness and Gear/boots masks/controls. Reviewed the updated mask/recolor browser captures. Real-source browser regression checks cover both cuffs, torso, both shin bands, both straps, glove/boot and unchanged cyan display; prior study tests remain. No active art or personnel changes; the source remains untouched.

- **October 9 — Character variation wave 1 complete:** user authorizes the proposed one-technician mask/color study. Added `character-colors.mjs` (source-specific polygons/material gates and shading-preserving recolor), `character-study.mjs`, five viewer color controls, untouched-source comparison, mask toggle, reset and 22-world-unit preview. Exact source copy under `artwork/character-studies/technician-v01/` has matching SHA-256 to the supplied Downloads v01. No active registry/personnel/runtime changes. Masks are conservative provisional presentation data; they do not apply to v02/v03. Trousers use a study-only color field; existing portrait color names are reused for the other controls.
- Verification: seven focused color/model tests, module syntax and diff checks pass. Isolated Edge smoke passes color changes, alpha preservation, masks/reset/map scale and existing ZIP/save/reject/install/gallery/mobile checks. Visually reviewed temporary recolored/mask canvas images. Browser harness now isolates its module registry from the user's live installed art; tests never change those selections. Next wave: review colors at map size, then add masks for other sources or author registered head/body layers before runtime integration. Preserve all earlier uncommitted work; no commit/push requested.

- **Latest request complete — Install variant button:** user explicitly asks installation beside Reject. Added install-server.mjs, GET/POST /api/sprite-install, install button/status/error per saved unrejected candidate, versioned runtime PNG directories and shared active-sprites.mjs activation registry consumed by the existing manifest. Selected door/Gate counterpart is resolved from same batch/variant; new Pillow pair-source mode checks matching frames and open-door aperture before preparing and validating both outputs. Validated outputs commit via one registry rename; failures retain prior selection and clean staging. UI updates Current and says to refresh simulator. No selected real variant has been installed automatically; all install checks used temporary roots.
- Verification: 12 viewer/server Node tests passed before the final HTTP routing assertions; focused install test re-run passes HTTP install/read/origin protection, rejection/missing/invalid/pair-mismatch preservation and paired success. Isolated Edge install click prepares a real fixture, updates Current, and passes existing reject/save/reload/mobile checks. Syntax/diff pass. User interrupted to request smaller steps; resume without restarting completed work. Docs/navigation updated. Room rendering remains pending, and installer does not certify visual camera/tiling. Restart local demo server and refresh viewer to expose endpoint/buttons. No commit/push requested.
- **Latest request complete — thumbs-down variant review and installation guidance:** imported candidate cards have Reject variant; default hides rejected candidates, Show rejected reveals them, Restore reverses the decision. Local review API GET/POST writes artwork/sprite-sources/sprite-review.json, keyed by batch + member filename across ZIP/folder/saved-source imports. No PNG deletion or active-art change. Browser-only fallback stores local review preferences and explicitly reports they are not shared. Preparation refuses rejected saved sources via reusable assertSpriteCandidateAllowed; existing validate/unpack/manifest behavior preserved.
- Exact changes: viewer model/app/HTML/CSS, sources-server, shared demo server, prepare-sprite guard, tests/browser smoke, READMEs/production contract/navigation. 20 relevant Node tests pass (review persistence/restore/preparation refusal, identity across import types, all preparation tests); isolated Edge passes real rejection/hide/show/restore and persistence across source reload plus existing gallery behavior using temporary storage. Syntax/diff checks pass. Installation remains an explicit prepare → validate → manifest selection step; user should identify keeper asset/batch/variant, with door/Gate partners selected together. No installer button or particular installation was requested/selected. Restart local server for review endpoint; no commit/push requested.
- Latest fix complete: user reports disabled source-saving checkbox. Read-only probe found running server on port8000 returns404 for /api/sprite-sources; port8001 has no server, consistent with an older server process. Added adjacent availability text, explicit Ctrl+C/restart command for current local port, tooltip and Check source saving again button. Separate service detection from saved-preview loading so a preview fetch failure does not disable saving. Retry enables/checks saving once service returns. Nine relevant tests, syntax/diff and isolated browser checks pass, including simulated old-server404 and reconnect. User must restart their existing server terminal; no process was killed or real sources changed.
- **Latest request complete — persistent ZIP source saving:** user authorizes saving ZIP uploads. Added `sources-server.mjs` and `/api/sprite-sources` GET/POST to existing local server. Viewer saving checkbox is on by default when this service is available; recognized PNGs save under artwork/sprite-sources/<archive-stem> and reload automatically (sorted by file modification time). Original ZIP stays in Downloads. Preview-only/static-hosting fallback remains; Clear removes session previews, not disk files. No normalization, active-art installation, mission/base state changes or canonical additions.
- Saves validate ZIP paths/CRC/limits, known member names and bounded PNG header dimensions before writing; stage within checked source root, keep conflicting existing batches, allow byte-identical reimports, reject duplicate PNG basenames and cross-origin requests. Nine viewer/server tests pass, including temp-root upload/idempotence/preservation/listing and failures; isolated Edge verifies real PNG save and reload plus all existing gallery interactions using temporary source storage only. Syntax/diff checks and all 288 combined Node tests pass. Restart local server for the new endpoint; no commit/push requested.
- Latest follow-up complete: newest-first viewer ordering. Imported asset groups rank by their latest successful load; newest candidates appear before Current art. Reimporting updates order, unloaded groups retain manifest order, and load times appear on cards. Added prominent UI wording that ZIP imports are browser-memory previews, disappear on reload, and do not download/save to sprite-sources/install. Pure ordering test and real-browser ordering assertions added; eight viewer/server tests, isolated Edge smoke, syntax and diff checks pass. No persistence or installation requested by this clarification; CLI unpack remains disk extraction.
- **Latest follow-up complete — direct ZIP preview:** user asks code to unzip supplied ZIPs. Added Sprite Viewer **Load ZIP files** (multiple archives), dependency-free browser `zip.mjs` stored/deflate reader with path/CRC/bounded-size checks. PNGs open in memory; arbitrary archive names/partial batches allowed, canonical member asset names still needed. No disk extraction, uploads or installation. Strict CLI `unpack` remains for production batches. Seven viewer/server Node tests and isolated Edge smoke pass (including native raw-deflate and ZIP upload); real Downloads floor b002 (3 PNGs) and door b001 (6 PNGs) both decode through the preview reader. Syntax/diff checks pass. Refresh `/demos/sprite-viewer/` and select ZIPs directly. No commit/push requested.
- User asks to add room-simulator sprites to the shared list and generation queue, anticipating reuse of the same sprite code. Inspected actual `rooms_schema.json` (17 room IDs), `base_tiles.json` (13 tile IDs), Room Sandbox rendering and shared sprite registry. This wave covers the asset plan, registry, placeholders, prompts and viewer; room renderer integration is explicitly the next wave, not claimed complete.
- Added `demos/shared/sprites/room-sprite-requirements.mjs` and Room Sandbox `SPRITE_REQUIREMENTS.md`: reuse existing floors/walls/doors/Gate/people/props; six provisional furnishings plus 13 opaque geology material tiles. Mappings do not configure Services/Cores/items or change room rules. CT/staffing/join/selection visuals remain overlays; 80px room grid scales shared 100-unit art. No new canonical data or hidden-Reality lookup.
- Shared existing manifest has 50 assets; added 19 code-native SVG placeholders. Generated complete `artwork/sprite-prompts-v2/` (48 requests): original numbered 01–29 unchanged (byte comparison verified), additions 30–48. Original prompt folder is preserved. Same tooling/ZIP contract and viewer cover the new keys. **Asset-list wave complete:** 18 relevant Node tests pass, including exact authored catalog coverage and all 50 resource paths; isolated Edge loads all 50 assets and passes variant/scale/tiling/dialog/mobile checks. Syntax/diff checks pass. Furniture appearance is explicitly provisional; no missing canonical rule was invented. Next wave: connect room rendering to shared presentation assets while preserving physical room identity, joins, visible geology and overlays. No commit/push requested. Preserve prior uncommitted changes.

---

# Current Task: Sprite Viewer

## Active request and resume checkpoint

- **Limb-option tiles + sleeve variants (October 11):** character preview now has thumbnail tiles to the right of playback (below on mobile), independent left/right arm/leg selections. Arm choices Authored/Plain/Short sleeve/Long sleeve; leg choice includes both stride frames. Global preset resets current character's choices; mixed choices show Custom; authored weapon actions disable tiles. Material/Appearance changes refresh thumbnails. Native exporter now produces 32 local independent assets/masks: original 16 plain limbs plus 16 long/short sleeve upper-arm/forearm parts for Man/Girl. Shirt ID1 vs exposed skin ID5; long sleeves have no skin mask, wrist gear retained. Sleeve hems use provisional halfway upper-arm masks; no new canonical game data, original sources/rig transforms intact. Updated preview app/index/style/exporter/browser/unit tests/README/map. Eleven unit checks pass, one legacy skip; Edge checks independent side swaps, sleeve rendering both characters, original actions unchanged, mobile no overflow. Local artwork remains ignored. Refresh character preview; no restart.


- **Separate left/right plain limbs (October 11):** added prepare-plain-limbs.py native Illustrator vector exporter (reviewed path ranges + source SHA guard), producing 16 independent PNG/mask assets under ignored artwork/zombie-tds-main-characters/plain-limbs-v01: each Man/Girl has left/right upper-arm, forearm, long/short leg frames. Removed upper-arm pouch/tattoo vector paths and Man leg pouch paths; native upper-arm colors normalized for shirt ID1 shading. Upper-arm bands interpreted as cloth shading; Girl forearm wraps/skin preserved; vector crop registration remains provisional. All original PNGs/SCML untouched; source dimensions/pivots preserved. Optional Normal walk limbs selector defaults Plain and supports Authored comparison; image substitution is only normal walk, preserving bone transforms/scales. Workbench lists independent plain parts alongside originals, uses existing material controls. Changed preview app/index/browser test, added asset regression test/exporter, updated README/map. Ten unit checks pass, one legacy skip; isolated Edge validates plain/authored switching, left/right workbench parts, colors, playback, mobile. Before-after.png available in local output folder. Final outline-cleanup exports and browser check pass; no restart, refresh only. No live simulator integration or Death edits.


- **Authored arm geometry correction (October 11):** supersedes estimated normal-walk IK and prior shoulder fitting. Rebuilt normal-walk.mjs from complete Walk_bat upper-body bones and image transforms: native forearms, correct source handedness, untouched scales/pivots/local transforms; replace only bat-containing hand with empty fist at authored wrist. Preserve Walk_riffle legs and image switches. Existing asymmetric bat arm pose retained; neutral swing requires separate pose authoring, replacement fist registration provisional. Unit regression compares every arm world transform/scale/pivot to authored bat; nine checks pass, one legacy skip. Isolated Edge and rendered-frame review pass. Updated normal-walk/tests/README; refresh only, no restart.


- **Bat-walk shoulder correction (October 11):** supersedes bat_0009_man selection below. Normal walk now resolves each character's actual Walk_bat shoulder images (z3/z7), Man Knife1 knife1_0002_man2/knife1_0005_man5 and Girl knife1_0008_girl2/knife1_0011_girl5; preserves authored 1× scales, adjusts constant upper-arm lengths to native image attachment spacing. Rifle legs remain intact. Attachment landmarks remain provisional. Updated normal-walk module/tests/README; nine unit checks pass, one legacy skip; isolated Edge smoke passes. Browser refresh only, no restart.

- User requests a demos simulator for viewing all sprites and variants while external art generates. Implemented `demos/sprite-viewer/` as a static read-only gallery of all 31 manifest entries, folder/multiple-PNG imports grouped by key and batch path, checker/light/dark backgrounds, runtime/world size, floor 3×3 repeat, enlarged dialog, search and clearing imports. No installation, new server API, mission/runtime changes or hidden-Reality lookup. Canonical variant/prepared names only; previews warn on dimensions but do not certify production validity.
- Exact files: viewer index/style/app/model/tests/README and isolated browser smoke; hub and server launcher tests, demo and Offworld READMEs, REPO_MAP, sprite/production contracts and tracker. Inputs are session-only local object URLs; no uploads or filesystem writes. No art has been generated or installed. **Complete:** all 282 combined Node tests pass, JavaScript syntax/diff checks pass, isolated Edge smoke verifies all 31 images load, folder/multi-batch variants, corrupt/unknown imports, unchanged active art, search, repeats, backgrounds, scale, actual enlarged dialog, clear and 390px layout. Edge crashed at sandboxed startup; temporary-profile read-only smoke passed outside sandbox with no live writes. Launch `/demos/sprite-viewer/`; select extracted `artwork/sprite-sources` or canonical named individual PNGs. No new architecture ambiguities; appearance remains provisional and viewer is not production validation. Preserve existing uncommitted production tools/prompts below; no commit/push requested.

---

# Current Task: Sprite Production-Art Ingestion Contract

## Active request and resume checkpoint

- **Limb-option tiles + sleeve variants (October 11):** character preview now has thumbnail tiles to the right of playback (below on mobile), independent left/right arm/leg selections. Arm choices Authored/Plain/Short sleeve/Long sleeve; leg choice includes both stride frames. Global preset resets current character's choices; mixed choices show Custom; authored weapon actions disable tiles. Material/Appearance changes refresh thumbnails. Native exporter now produces 32 local independent assets/masks: original 16 plain limbs plus 16 long/short sleeve upper-arm/forearm parts for Man/Girl. Shirt ID1 vs exposed skin ID5; long sleeves have no skin mask, wrist gear retained. Sleeve hems use provisional halfway upper-arm masks; no new canonical game data, original sources/rig transforms intact. Updated preview app/index/style/exporter/browser/unit tests/README/map. Eleven unit checks pass, one legacy skip; Edge checks independent side swaps, sleeve rendering both characters, original actions unchanged, mobile no overflow. Local artwork remains ignored. Refresh character preview; no restart.


- **Separate left/right plain limbs (October 11):** added prepare-plain-limbs.py native Illustrator vector exporter (reviewed path ranges + source SHA guard), producing 16 independent PNG/mask assets under ignored artwork/zombie-tds-main-characters/plain-limbs-v01: each Man/Girl has left/right upper-arm, forearm, long/short leg frames. Removed upper-arm pouch/tattoo vector paths and Man leg pouch paths; native upper-arm colors normalized for shirt ID1 shading. Upper-arm bands interpreted as cloth shading; Girl forearm wraps/skin preserved; vector crop registration remains provisional. All original PNGs/SCML untouched; source dimensions/pivots preserved. Optional Normal walk limbs selector defaults Plain and supports Authored comparison; image substitution is only normal walk, preserving bone transforms/scales. Workbench lists independent plain parts alongside originals, uses existing material controls. Changed preview app/index/browser test, added asset regression test/exporter, updated README/map. Ten unit checks pass, one legacy skip; isolated Edge validates plain/authored switching, left/right workbench parts, colors, playback, mobile. Before-after.png available in local output folder. Final outline-cleanup exports and browser check pass; no restart, refresh only. No live simulator integration or Death edits.


- **Authored arm geometry correction (October 11):** supersedes estimated normal-walk IK and prior shoulder fitting. Rebuilt normal-walk.mjs from complete Walk_bat upper-body bones and image transforms: native forearms, correct source handedness, untouched scales/pivots/local transforms; replace only bat-containing hand with empty fist at authored wrist. Preserve Walk_riffle legs and image switches. Existing asymmetric bat arm pose retained; neutral swing requires separate pose authoring, replacement fist registration provisional. Unit regression compares every arm world transform/scale/pivot to authored bat; nine checks pass, one legacy skip. Isolated Edge and rendered-frame review pass. Updated normal-walk/tests/README; refresh only, no restart.


- **Bat-walk shoulder correction (October 11):** supersedes bat_0009_man selection below. Normal walk now resolves each character's actual Walk_bat shoulder images (z3/z7), Man Knife1 knife1_0002_man2/knife1_0005_man5 and Girl knife1_0008_girl2/knife1_0011_girl5; preserves authored 1× scales, adjusts constant upper-arm lengths to native image attachment spacing. Rifle legs remain intact. Attachment landmarks remain provisional. Updated normal-walk module/tests/README; nine unit checks pass, one legacy skip; isolated Edge smoke passes. Browser refresh only, no restart.

- **Latest request complete: generated all external prompt files.** Added `prepare-sprite.mjs prompts [--out directory]`: 29 numbered requests cover all 31 existing manifest assets, with door/open-door and Gate/open-Gate consolidated into matching-state batches. Generated default output `artwork/sprite-prompts/` with ordered README checklist. All subjects now have provisional public appearance descriptions; no hidden Reality/gameplay changes. Batch refuses existing filenames. All eight offline-tool tests and diff check pass. Next: upload numbered requests individually, review returned art and ingest only validated candidates. No commit/push requested.
- Git Bash reported `stdout is not a tty` on redirected prompt output, consistent with a terminal wrapper; exact local alias not verified. Added `prompt <key> --out <file.txt>` to write UTF-8 directly without redirection (replaces specified file). Regression verifies byte-identical terminal/file prompts, paths with spaces and missing argument rejection. Generated the requested root `floor-indoor-prompt.txt`; runtime/art unchanged.
- **Latest checkpoint — first external floor batch needs regeneration:** inspected the three user-supplied October 9 PNGs in Downloads. All are opaque RGB 1254×1254; RGB is valid for floors and standalone preparation can resize square sources, but strict ZIP ingestion requires 1024×1024 plus canonical names/archive. No delivered ZIP. Art has prominent panel fixtures/wear and broad directional lighting inconsistent with quiet seamless flooring; edge continuity still requires manual visual QA. No supplied image was installed or edited.
- Corrected `prepare-sprite.mjs prompt floor-indoor` with a concrete light neutral matte-floor subject, no fixture-like lights/vents/heavy grunge, uniform diffuse lighting, full opaque canvas and a 3×3 repeat check. All opaque floor prompts now avoid upper-left gradients and misleading transparent-padding instructions. Updated production contract and existing prompt regression test; all seven offline-tool tests pass. Existing runtime and SVG sources remain unchanged. Next: regenerate the external floor batch using the revised prompt, visually review tiling, then validate/unpack/prepare candidates before any manifest switch. No commit/push requested.
- Branch `offworld-2d-sprite-renderer`, starting clean at pushed `8af9dec`. User explicitly supplied the pasted request as their instructions: formalize exact external-art requirements, add deterministic preparation/validation if appropriate, do not generate art or change gameplay.
- Verified: 100 world units/cell; center pivot; 128-square ordinary placeholders; Gate placeholders are 128-square SVG but production PNG is 256-square; wall viewBox128x12/display100x10; actual corner display8x8 (old nominal manifest10). Other sizes unchanged.
- Implemented: authoritative `SPRITE_PRODUCTION_CONTRACT.md`; small production metadata in `sprite-manifest.mjs`, corrected nominal corner size to8; Node/Pillow prepare/validate/validate-manifest/prompt tool (`prepare-sprite.mjs`, `.py`), tests. Existing `src` paths remain SVG; no art generation or automatic installation. Renderer logic/runtime/mission data unchanged.
- Source workflow: 1024x1024 RGBA masters, opaque square floor exception, normalize isolated alpha bounds; preserve shared whole-canvas door/Gate registration. Runtime128x128, Gate256x256, wall128x12; minimum alpha borders8px ordinary/16pxGate/zero floors and walls. No directional variants; soft rotation-tolerant shading.
- **Resume checkpoint: production contract plus three-variant ZIP workflow complete.** User requested multiple variants and strict ZIP delivery. Added archive/root/member naming, paired six-file batches and validated extraction (`unpack-sprites.py` via `prepare-sprite.mjs unpack`). All seven offline-tool tests pass, including unsafe/incomplete/wrong-size batch rejection before extraction and refusing overwrite. Prompt output includes packaging rules and truthful ZIP capability fallback. Source candidates do not introduce runtime randomization or new gameplay state. All 279 combined tests, Node/Python syntax and diff checks pass; runtime/rendering and active art remain unchanged.
- Production manifest metadata is additive: runtimeFile/runtimePixels/displaySize/opaque/padding/pair; removed misleading generic sourcePixels128 and aligned nominal corner size8 with its already-existing explicit render size8. Read-only runtime/mission state and visibility behavior remain unchanged.
- No blocking art question remains. Manual visual QA still checks direct overhead camera, seam quality, soft rotation-tolerant lighting and identical painted frame pixels; alpha-bound validation cannot prove semantic visual registration. Pair preparation can report PENDING until the companion is prepared; validate both before switching src entries together.
- Pillow11.3.0 is an explicit optional offline dependency, already installed here; no dependencies were installed and no polished art was generated. No commit/push requested for this contract task. Historical sprite and Mission Author checkpoints follow.

---

# Current Task: Offworld 2D Sprite Presentation Branch

## Active request and resume checkpoint

- **Limb-option tiles + sleeve variants (October 11):** character preview now has thumbnail tiles to the right of playback (below on mobile), independent left/right arm/leg selections. Arm choices Authored/Plain/Short sleeve/Long sleeve; leg choice includes both stride frames. Global preset resets current character's choices; mixed choices show Custom; authored weapon actions disable tiles. Material/Appearance changes refresh thumbnails. Native exporter now produces 32 local independent assets/masks: original 16 plain limbs plus 16 long/short sleeve upper-arm/forearm parts for Man/Girl. Shirt ID1 vs exposed skin ID5; long sleeves have no skin mask, wrist gear retained. Sleeve hems use provisional halfway upper-arm masks; no new canonical game data, original sources/rig transforms intact. Updated preview app/index/style/exporter/browser/unit tests/README/map. Eleven unit checks pass, one legacy skip; Edge checks independent side swaps, sleeve rendering both characters, original actions unchanged, mobile no overflow. Local artwork remains ignored. Refresh character preview; no restart.


- **Separate left/right plain limbs (October 11):** added prepare-plain-limbs.py native Illustrator vector exporter (reviewed path ranges + source SHA guard), producing 16 independent PNG/mask assets under ignored artwork/zombie-tds-main-characters/plain-limbs-v01: each Man/Girl has left/right upper-arm, forearm, long/short leg frames. Removed upper-arm pouch/tattoo vector paths and Man leg pouch paths; native upper-arm colors normalized for shirt ID1 shading. Upper-arm bands interpreted as cloth shading; Girl forearm wraps/skin preserved; vector crop registration remains provisional. All original PNGs/SCML untouched; source dimensions/pivots preserved. Optional Normal walk limbs selector defaults Plain and supports Authored comparison; image substitution is only normal walk, preserving bone transforms/scales. Workbench lists independent plain parts alongside originals, uses existing material controls. Changed preview app/index/browser test, added asset regression test/exporter, updated README/map. Ten unit checks pass, one legacy skip; isolated Edge validates plain/authored switching, left/right workbench parts, colors, playback, mobile. Before-after.png available in local output folder. Final outline-cleanup exports and browser check pass; no restart, refresh only. No live simulator integration or Death edits.


- **Authored arm geometry correction (October 11):** supersedes estimated normal-walk IK and prior shoulder fitting. Rebuilt normal-walk.mjs from complete Walk_bat upper-body bones and image transforms: native forearms, correct source handedness, untouched scales/pivots/local transforms; replace only bat-containing hand with empty fist at authored wrist. Preserve Walk_riffle legs and image switches. Existing asymmetric bat arm pose retained; neutral swing requires separate pose authoring, replacement fist registration provisional. Unit regression compares every arm world transform/scale/pivot to authored bat; nine checks pass, one legacy skip. Isolated Edge and rendered-frame review pass. Updated normal-walk/tests/README; refresh only, no restart.


- **Bat-walk shoulder correction (October 11):** supersedes bat_0009_man selection below. Normal walk now resolves each character's actual Walk_bat shoulder images (z3/z7), Man Knife1 knife1_0002_man2/knife1_0005_man5 and Girl knife1_0008_girl2/knife1_0011_girl5; preserves authored 1× scales, adjusts constant upper-arm lengths to native image attachment spacing. Rifle legs remain intact. Attachment landmarks remain provisional. Updated normal-walk module/tests/README; nine unit checks pass, one legacy skip; isolated Edge smoke passes. Browser refresh only, no restart.

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

# Mission Author playable authoring follow-up — October 12, 2026

- Added a separate playable JSON workspace at the top of Mission Author:
  rescue-variant template, mission ID/title/briefing, full JSON editing,
  validated import and compiler-checked export for Offworld's existing
  **Load finalized mission** control. Edits invalidate export. No fixture/base
  writes or invented canonical content. Preserves source physical instance IDs.
- Files: `demos/mission-authoring-simulator/playable.mjs`, `playable-app.mjs`,
  `playable.test.mjs`, `index.html`, `style.css`, `browser-test.mjs`, README;
  navigation updated in REPO_MAP.
- Validation: all 68 Mission Author tests passed, including exported mission
  runtime initialization and broken-reference rejection. Isolated Edge smoke
  passed playable editing/export/invalid-reference checks plus existing semantic
  review and 390px layout. Syntax and diff checks passed. Edge required execution
  outside the sandbox to start its renderer.
- This is direct editing of authored Offworld JSON, not semantic Draft
  finalization. Automatic Finalizer bindings/dependency closure and visual map/
  dialogue editors remain unresolved. New mission content is pending the user's
  setting/objective choice; no scenario-specific rules have been assumed.

# Current Task: Mission Author Expanded Tables — Wave Plan

## Active request and resume checkpoint

- **Limb-option tiles + sleeve variants (October 11):** character preview now has thumbnail tiles to the right of playback (below on mobile), independent left/right arm/leg selections. Arm choices Authored/Plain/Short sleeve/Long sleeve; leg choice includes both stride frames. Global preset resets current character's choices; mixed choices show Custom; authored weapon actions disable tiles. Material/Appearance changes refresh thumbnails. Native exporter now produces 32 local independent assets/masks: original 16 plain limbs plus 16 long/short sleeve upper-arm/forearm parts for Man/Girl. Shirt ID1 vs exposed skin ID5; long sleeves have no skin mask, wrist gear retained. Sleeve hems use provisional halfway upper-arm masks; no new canonical game data, original sources/rig transforms intact. Updated preview app/index/style/exporter/browser/unit tests/README/map. Eleven unit checks pass, one legacy skip; Edge checks independent side swaps, sleeve rendering both characters, original actions unchanged, mobile no overflow. Local artwork remains ignored. Refresh character preview; no restart.


- **Separate left/right plain limbs (October 11):** added prepare-plain-limbs.py native Illustrator vector exporter (reviewed path ranges + source SHA guard), producing 16 independent PNG/mask assets under ignored artwork/zombie-tds-main-characters/plain-limbs-v01: each Man/Girl has left/right upper-arm, forearm, long/short leg frames. Removed upper-arm pouch/tattoo vector paths and Man leg pouch paths; native upper-arm colors normalized for shirt ID1 shading. Upper-arm bands interpreted as cloth shading; Girl forearm wraps/skin preserved; vector crop registration remains provisional. All original PNGs/SCML untouched; source dimensions/pivots preserved. Optional Normal walk limbs selector defaults Plain and supports Authored comparison; image substitution is only normal walk, preserving bone transforms/scales. Workbench lists independent plain parts alongside originals, uses existing material controls. Changed preview app/index/browser test, added asset regression test/exporter, updated README/map. Ten unit checks pass, one legacy skip; isolated Edge validates plain/authored switching, left/right workbench parts, colors, playback, mobile. Before-after.png available in local output folder. Final outline-cleanup exports and browser check pass; no restart, refresh only. No live simulator integration or Death edits.


- **Authored arm geometry correction (October 11):** supersedes estimated normal-walk IK and prior shoulder fitting. Rebuilt normal-walk.mjs from complete Walk_bat upper-body bones and image transforms: native forearms, correct source handedness, untouched scales/pivots/local transforms; replace only bat-containing hand with empty fist at authored wrist. Preserve Walk_riffle legs and image switches. Existing asymmetric bat arm pose retained; neutral swing requires separate pose authoring, replacement fist registration provisional. Unit regression compares every arm world transform/scale/pivot to authored bat; nine checks pass, one legacy skip. Isolated Edge and rendered-frame review pass. Updated normal-walk/tests/README; refresh only, no restart.


- **Bat-walk shoulder correction (October 11):** supersedes bat_0009_man selection below. Normal walk now resolves each character's actual Walk_bat shoulder images (z3/z7), Man Knife1 knife1_0002_man2/knife1_0005_man5 and Girl knife1_0008_girl2/knife1_0011_girl5; preserves authored 1× scales, adjusts constant upper-arm lengths to native image attachment spacing. Rifle legs remain intact. Attachment landmarks remain provisional. Updated normal-walk module/tests/README; nine unit checks pass, one legacy skip; isolated Edge smoke passes. Browser refresh only, no restart.

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
