# Orionis Art Lab

**Try character parts / colors** opens a separate panel on the right while the
animation controls remain on the left. It offers all 9 modular bodies, 15 heads,
5 backpacks, 19 pack weapon/tool models, and the 9 supplied color variants.
Body and head color choices are independent. **Restore profession appearance**
clears the experiments; selecting another profession also restores its preset.
Choices are session-only. Hand props replace existing equipment, but their grip
against arbitrary clips is unreviewed; some heads are designed for a specific
body (for example, gunner-only). Extra scenery/projectiles are not character parts.

Color variants reuse the same rig/meshes with different atlas materials. This
is the simplest current route; duplicate colored models are unnecessary. The
pack supplies black, blue, brown, green, grey, olive, red, white and yellow.
Swapping a whole atlas preserves its authored skin/armor details. Free choice
of separate cloth, armor and skin colors would need an authored region mask
and shader, or additional edited atlas textures; a whole-material tint would
also tint the skin/other details. The panel never edits source materials.
`verify-parts` checks each part category, palette assignment, exclusive props,
unchanged source material state, ongoing animation and profession restoration.
Catalog/results/captures: `artwork/toon-soldiers-proof/parts-*`.

**Other props** now includes the previously omitted Kevin Iglesias crafting,
melee, soldier, archery and throwing props, plus Toon loose items/projectiles.
Hammer, Pickaxe and Fishing pole reuse the reviewed hand attachments. Other
entries are scaled reference displays beside the actor, with their own rotation
slider; their dimensions and placement are inspection aids, not game scale or
grip calibration. Animated scenery such as the ammo crate is shown in its rest
pose. Preview instances disable vendor demo scripts. Selecting an action clears
these experiments; Restore also returns to the chosen outfit. Source assets and
materials stay unchanged. `additional-props-catalog.json` records exact sources.

The default preview is now **Orionis > Art > Open game action shortlist**:
one full-pack modular Toon Soldier, six profession presets, three NPC presets and 150 selected
movement, combat, work and social clips. Profession buttons select body/head
parts and filter the action shortlist; movement, travel and conversation are
shared. These are provisional visual studies, with missing role actions stated
in the preview. The Game view switches equipment exclusively; unarmed
actions remove the rifle. Only one body and head variant render. Native rifle
clips use the pack's authored weapon socket; Hammer/Pickaxe use the source
hand-prop transforms and curves through transform-only auxiliary bindings.
No source human mesh is copied into the character.

| Profession | Body / head | Backpack | Supplied palette |
| --- | --- | --- | --- |
| Soldier | 01 infantry / 15 gunner only | Ammobox | Red |
| Technician | 05 engineer / 05 engineer | Engineer | Yellow |
| Scientist | 08 trench / 10 glasses | None | Blue |
| Medical | 06 medic / 06 medic A | Medic | Blue |
| Scout | 04 sniper / 02 scout | Standard | Green |
| Diplomat | 09 general / 08 beret | None | Yellow |
| Worker (NPC study) | 07 unequipped / 05 engineer | None | Grey |
| Guard (NPC study) | 01 infantry / 01 infantry | None | Grey |
| Captain (NPC study) | 09 general / 09 general | None | Blue |

NPC outfits are provisional visual choices. Worker shares the work clips;
Guard has a native guard-idle default; Captain defaults to conversation. Guard
and Captain can inspect rifle actions. They introduce no NPC behavior or new
canonical Profession. The original six user-selected profession outfits remain.

The first six are the user's selected defaults. Restore now restores backpacks and
palettes as well as body/head. Closest supplied colors approximate the existing
Offworld profession presentation colors (`demos/offworld-sandbox/map.mjs`);
purple for Scientist, cyan for Medical and teal for Scout are not supplied.
Yellow approximates Technician orange and Diplomat gold. Colors apply to body
and head; backpack textures keep their supplied equipment palette.

The shortlist includes all 13 male idle clips/transitions, five sheathe and five
unsheathe motions, nine fishing variants with the supplied pole, all 51 installed
compatible death clips and all 14 interact clips, alongside movement/work/social
studies. Death/interaction source variants include seven Toon Soldiers weapon
families (including prone deaths), HumanM/HumanF deaths and three Humanoid
skeleton-death variants. **Deaths** and **Interacts** filters expose the complete
sets on every preset. `death-interact-coverage.json` records completeness against
the installed Humanoid catalog and verifies no duplicate source clips.
Non-infantry weapon families preview body motion without auto-attaching an
unreviewed weapon; skeleton-specific extra bindings remain unmapped. Interaction
clips are motion studies without a staged object or gameplay operation.
Sheathe/draw are **pose only**, without a fitted weapon or
holster transition. Fishing uses the supplied simple pole mesh; line/lure/water
effects are not implemented. Death, sheathe/draw, idle transitions and fishing
begin/end/cast default to one-shot playback; Repeat remains an inspection option.
These are animation studies, not new gameplay systems or profession capabilities.
Sample pickup/medical handwork remain candidates; scanner, console, treatment,
carrying and tracking interactions remain gaps.

Medical's medikit is a reference prop, not a fitted hand attachment. The vendor
medigun is not used as a treatment substitute. Parts/picks are recorded in
`artwork/toon-soldiers-proof/profession-picks.json`; per-profession captures and
`profession-validation.json` accompany the existing action validation.

The newly imported **Combat and Dialogue vol. 1** adds 182 compatible Humanoid
clips. The source animations are all called `Unreal Take`, so the library uses
their filenames as labels and retains exact clip references. All182 passed
finite-pose, movement and equipment-cleanup checks (`cad-motion-validation.json`).
**Dialogue** filters the 26 selected social/pickup/reaction gestures. Five
unarmed defensive reactions are also in All. The rest remain in the full library.

| Useful starting point | Likely presentation use |
| --- | --- |
| Greetings, nods, head shake, questions, applause and surprise | Dialogue responses and ambient NPC reactions |
| Guide/point, call, stop and warning gestures | Diplomat directions, Captain briefings, Guard warnings |
| Salutes | Soldier / Guard / Captain acknowledgement studies |
| Looking around and waiting | Scout observation and shared NPC ambience |
| Pickup variants | Worker / Technician / Scientist handling studies; target placement still needed |
| Pain and belly gestures | Visible discomfort; no medical treatment implied |
| Dodge, head guard, hit and knockdown | Optional unarmed defensive/reaction studies |

`cad-use-review.json` lists every new source and the recommendation/reason.
Chair, wall-leaning, cane, board, phone, drinking and smoking motions need fitted
surfaces or props. This new pack supplies a demo character but **no separate
chair/cane/phone/board/drink props**. Magic and elaborate sword choreography are
not selected for the current game-art shortlist. These are body gestures, not
written dialogue, lip sync or finger animation (the Toon rig lacks finger bones).
`verify-dialogue` samples all new clips without copying the vendor controller or
executing its animation events. New-pack motion uses ordinary Humanoid bindings;
it does not receive the Kevin Iglesias auxiliary spine/prop mapping.

`node unity/tools/art-lab.mjs verify` builds this focused scene, `open` opens it,
`play` starts it, `verify-viewer` checks its actions/equipment and `capture`
checks its live render. Explicit aliases are `build-actions`, `open-actions`
and `verify-actions`. The **Browse full library (unreviewed)** toggle keeps
the wider collection accessible on the same single character; it clears
equipment rather than guessing a fit for every clip. Medical treatment,
casualty carrying and detailed console/analysis work remain unreviewed gaps.

The earlier four-character study remains available through `build-library`,
`open-library` and `verify-library`. Its combined demo-rifle limitation and broad
prop guesses are historical studies, not the default game-action route. The
sections below preserve its usage and earlier compatibility findings.

Independent Unity 6000.5.2f1 project for character rigs, retargeting, animation and
overhead presentation. Open this folder as a separate project in Unity Hub. It
can run alongside ../StargateOrionis: each Editor has independent Play mode,
script compilation, imported assets, caches, graphics settings and automation.
The lab contains no campaign code or normal game save paths.

Use a separate chat targeting this lab for animation work. Keep the game chat
targeting StargateOrionis. Both projects can remain in the same repository.
Point automation at each project's own Library/Pipeline/.unity-pipeline-port,
and verify the descriptor's projectPath before executing commands.

From the repository root in Git Bash, `node unity/tools/art-lab.mjs status`
checks only this Editor. Commands `refresh`, `verify`, `open`, `play`, `stop`, `capture` and
`job <id>` also target only Art Lab; the helper rejects a mismatched project
descriptor. `verify` returns a job ID so long captures do not block the chat.

Locally acquired full Toon Soldiers lives in Assets/Toon_Soldiers; the earlier
Demo lives in Assets/ToonSoldiers_demo. The Human
Basic, Soldier, Archer, Crafting, Melee, Spellcasting and Throwing animation
packs, Skeleton Animations, Human Character Dummy and IK Helper Tool live under
Assets/Kevin Iglesias. Original vendor files/GUIDs are retained and excluded from Git. On
another machine, download/import these packages from Unity My Assets. No
purchased/vendor source is committed. UGUI is included for the vendor demo
scripts, which are not attached to our preview characters.

**Orionis > Art > Build and verify Toon Soldiers demo** creates an isolated
preview of Idle, Run, Shoot and Burst, using the supplied Humanoid model and clips.
**Orionis > Art > Open Toon Soldiers demo preview**, then Play, runs the four
controllers. The Game view has sliders for camera elevation (5–90 degrees),
character yaw (0–360 degrees), zoom and playback speed, plus pause/restart and
one-shot repeat controls. Single-character view is the default; uncheck it to
show the original comparison grid (Idle / Run above Shoot / Burst).

The searchable animation list discovers imported Humanoid clips automatically.
Selecting one overrides the first soldier's motion while preserving its existing
Toon Soldier avatar and vendor model. Rebuild the preview after importing more
clips to refresh its serialized catalog. Weapon attachments and custom spine
curves are not standard Humanoid motion: clips needing additional binding setup
show a warning. Their base Humanoid motion can be inspected, but full prop/grip/
torso compatibility is not assumed. No vendor clip events execute in this viewer.
The lab uses its own URP forward renderer for 3D lighting.

The collapsible, searchable Prop picker discovers supplied weapon/tool/archer
prefabs. It keeps distinct vendor variants. Automatic matching uses the prop
names in animation names, preferring the longest match; otherwise it selects
None. Manual selection turns automatic matching off until **Match prop to
animation** is enabled again. Props follow the selected holding hand. None
hides added props; the original Toon Soldier's rifle is part of its single
skinned mesh and cannot be switched off separately in this preview.

Props retain their supplied local transform and scale; this is an initial
attachment study, not a final grip fit. No capsule stand-ins or inferred
bounds-center grips are generated. Vendor demo behaviours (including the arrow's
launch/destruction script) are disabled on preview instances; source assets
remain unchanged. Support-hand IK is available only for a
calibrated grip, and targets the hand opposite the holding hand to avoid a
cyclic dependency. The Animator's IK pass is enabled, and zero-weight fallback
targets stay valid when no prop is selected.

To author a grip in Edit mode, move/rotate the prop's **Uncalibrated support
grip** marker and set its record under **Character preview controls > Prop
Sets** to **Grip Calibrated**, specifying **Calibrated For Left Hold** when
appropriate. Save the scene. In Play, select that prop and enable **Calibrated
support-hand IK**. Rebuild preserves saved per-subject/prefab grip authoring.
Calibration for one holding hand is not silently reused for the other hand.
The Toon rig also has no articulated finger bones. Finger-only clips and some
gripping poses therefore cannot be judged as complete retargets on this model.
The imported human-dummy models remain available as assets for future rig work;
the active preview still targets the existing Toon Soldier avatar.
**Capture live Toon Soldiers preview** validates and saves a screenshot during
Play; `verify` checks mesh/rig/controller deformation in Edit mode. It does not
stop or start the main game's Editor.

`node unity/tools/art-lab.mjs verify-viewer` checks the view-control effects and
samples every catalog clip on the Toon Soldier avatar during Play, writing
`artwork/toon-soldiers-proof/viewer-validation.json` with motion and missing
custom-transform bindings. The rig/clip check is separate from final visual
approval of individual animations and weapon grips.
It also verifies serialized prop sets, one visible added prop, manual override,
automatic matching, left/right attachment, None cleanup and actual support-hand
movement to a temporary reachable calibration target. That test target is never
saved as prop authoring.

Evidence and session-preservation notes live in ../../artwork/toon-soldiers-proof.
The original Technician proof remains in the main project and is not replaced.
