# Toon Soldiers animation evaluation

## Combat and Dialogue / extra-prop integration — October26

Imported the full Combat and Dialogue vol.1 package into Art Lab only after
auditing771 entries: all vendor-scoped art, no scripts/DLLs/project settings.
`cad-package-audit.json` records the archive; `cad-import-audit.json` records all
182 Humanoid clips and their actual bindings. They share the clip name
`Unreal Take`, so filename labels and exact source references disambiguate them.
`cad-use-review.json` records the31 selected motions and reasons for leaving
the other151 in the full library. The shortlist now has150 unique clips.

Selected: greetings, nods/no/question, directions, warning/stop/call, salutes,
waiting/look-around, pickup, applause/bow/puzzlement/surprise, discomfort, and
five unarmed defensive/reaction studies. A Dialogue filter exposes the26 social
studies. Chair/wall/cane/board/phone/drink clips require fitted scene props;
the new pack contains no separate props for those actions. Magic/elaborate sword
choreography is not selected. Facial/finger animation is not supported by this
Toon rig; these are body motions, not a new dialogue system.

Other props now exposes43 entries:28 Kevin Iglesias crafting/melee/soldier/
archer/throwing prefabs plus15 Toon loose items, including the animated ammo
crate in its rest pose. `additional-props-catalog.json` records source paths.
Hammer/Pickaxe/Fishing pole reuse reviewed attachments;40 remaining entries
are normalized staged references beside the actor, with their own rotation
slider. Demo behaviours are disabled; generic prop Animators are removed on
preview copies only. Non-URP prop materials get generated URP copies. Vendor
materials and files stay unchanged. Picking an action or resetting the outfit
clears staged props. New-source and prop validation results are recorded in
`cad-motion-validation.json` and `parts-validation.json`.

Reviewed renders: `cad-diplomat-question.png`, `cad-diplomat-direction.png`,
`cad-captain-salute.png`, `cad-worker-pickup.png`, `cad-guard-defense.png`,
`props-bucket.png`, `props-Bow.png`, `props-ThrowingAxe.png`. Older study entries
and counts below are historical.

## Current focused game-action preview — October 25

Latest expansion: all51 installed compatible death clips and all14 interactions
are included once, with Deaths/Interacts filters on every preset. This includes
all seven Toon Soldiers weapon families/prone variants, male/female human deaths,
and three Humanoid skeleton-death variants. `death-interact-coverage.json` records
complete source coverage and119 total unique actions. `game-actions-validation.json`
passed all119 motions/equipment checks; `profession-validation.json` passed all
nine presets (six professions plus three NPC studies), and parts regression passed.

New provisional NPC visuals: Worker plain grey clothes/hardhat, Guard grey
infantry/helmet and Captain blue general/peaked cap, all without backpacks.
Captures: `npc-worker.png`, `npc-guard.png`, `npc-captain.png`. Worker shares work
motions, Guard adds native guard idle, Captain uses conversation. Original six
user-selected outfits are retained. Representative added-source render review
covered infantry/heavy interactions, prone death, female death and skeleton
death (`full-actions-*.png`). No NPC game rules were created.
`npc-interactions-ui.png` shows the nine preset buttons and Deaths/Interacts
filters after reopening the saved preview in normal Play on October26.

Non-infantry weapon clips remain body-motion studies with weapon-fit notices;
skeleton extra bindings are unmapped. Interact clips have no staged target or
game operation. All these motions default to one-shot playback. Earlier counts
below describe prior batches.

Latest user-selected presets are now saved in `profession-picks.json`: Diplomat
general/beret/no pack; Scientist trench/glasses/no pack; Soldier infantry/gunner
head/ammobox; Technician engineer/engineer/engineer pack; Medical medic/medic A/
medic pack; Scout sniper/scout/standard pack. Supplied palettes approximate
existing profession colors: red, yellow, blue, blue, green, yellow respectively
in Soldier/Technician/Scientist/Medical/Scout/Diplomat order. Purple/cyan/teal
variants are absent. The lab README records the mapping and color reference.
`profession-*.png` now show these updated presets in idle.

The focused catalog is now 62 clips, adding all idle variants/transitions,
sheathe/unsheathe pose studies, fishing with its supplied pole and unarmed/native
rifle death variants. All62 and six presets passed regression; parts restoration
checks now include authored backpack/palette defaults. Representative captures:
`fishing-side.png`, `fishing-loop.png`, `action-HumanM-FishingThrow01.png`,
`action-HumanM-SheatheBack01_R.png`, `action-HumanM-Death01.png`,
`action-infantry_death_A.png`. Sheathe remains motion-only without holster logic;
fishing uses a simple supplied pole without line/lure/effects. Death/sheathe and
transition clips default to one-shot playback. Historical counts below reflect
earlier study batches.

The separate **Try character parts / colors** panel adds 9 bodies, 15 heads,
5 backpacks, 19 pack hand props and 9 supplied material palettes. It keeps the
same actor and animation controls. Body/head palettes can differ; profession
restore resets all experimental choices. Catalog and checks are
`parts-catalog.json` / `parts-validation.json`; all passed, along with the
existing 22-action/six-profession regression. `parts-colors.png` and `parts-ui.png`
show a red outfit, blue helmet, authored backpack and rifle socket alignment.
The preview only assigns materials to scene instances; vendor materials are
unchanged. Other weapon/clip fits remain unreviewed. Colors reuse meshes and
swap supplied atlas materials; arbitrary independent cloth/armor/skin colors
would require region masks/shader work or edited texture variants. See the lab
README for the full usage and limitations. Extra scenery/projectiles are outside
the character-parts panel.

The user accepted Art Lab as the general animation workspace. It now has six
profession buttons and 22 unique selected actions. `profession-picks.json`
records exact modular body/head choices and default actions; the lab README
tabulates parts, clips and missing assets. All six use the same single actor.
`profession-validation.json` checks exclusive body/head, default equipment and
medical-kit cleanup across role switching. `game-actions-validation.json`
now covers all 22 actions. All checks passed, as did six live render captures.
`profession-{soldier,technician,scientist,medical,scout,diplomat}.png` show the
selected roles; `professions-ui.png` shows the current profession controls.

Scout uses its authored body/cap, Scientist the unequipped body/glasses, Medical
the medic body/helmet A, Diplomat the unequipped body/beret, and Technician the
engineer body/hardhat. Scientist Gathering02 and Medical Gathering01 are labeled
candidate studies, not reviewed analysis/treatment. The medical kit is staged
on the ground, not attached to an uncalibrated hand. No medigun-based treatment
or new profession capability is introduced. Civilian/lab clothes, medical
treatment, carrying, scanner/console work and binoculars remain asset gaps.

Use **Orionis > Art > Open game action shortlist** in the independent Art Lab,
then Play. `node unity/tools/art-lab.mjs open` and `play` target this scene.
The full Toon Soldiers infantry prefab supplies one modular body/head and a
separate removable rifle. Switching to None, Hammer or Pickaxe hides the rifle;
no extra body/head variants or source human meshes are rendered.

The 16-action shortlist covers unarmed idle/walk/run; rifle ready/walk/run,
single fire/burst/reload/crouch ready/crouch fire; hammer begin/work/finish;
and pickaxe ground/wall. Native rifle clips use the authored weapon socket.
Kevin Iglesias tools follow their authored auxiliary hand-prop curves, with
spine mapping and final skin-matrix refresh. Vendor assets remain unchanged.

`game-actions-catalog.json` records exact source clips. The focused verification
passed all 16 moving, finite poses, exact clip selection, one Animator, two
active body/head renderers, exclusive equipment and Rifle→Hammer→None cleanup
(`game-actions-validation.json`). Live render checks passed without magenta
shader failures (`game-actions-render.json`). Visual review covered rifle fire,
rifle ready, hammer work and raised pickaxe; captures are `game-actions-fire.png`,
`game-actions-rifle.png`, `game-actions-hammer.png`, `game-actions-pickaxe.png`.
`game-actions-ui.png` shows the active controls and angle/rotation sliders.

This is an art shortlist, with no gameplay integration or new game rules.
Medical treatment, casualty carrying and detailed console/analysis actions
remain unreviewed gaps. **Browse full library (unreviewed)** retains access to
other imported clips and clears equipment instead of guessing tool fit.
The full Toon Soldiers package must be installed locally on another machine.

## Historical demo and broad-library studies

The active animation workspace is ../../unity/OrionisArtLab. It is a separate
Unity 6000.5.2f1 project and Editor process. Do not use the main game's Editor
or automation port for further animation work. See the lab's README and AGENTS.

The acquired local demo supplies one blue soldier, a Humanoid avatar and four
Humanoid clips: combat idle (2s, loop), run (0.833s, loop), shoot (1s, one-shot)
and burst (1.3s, one-shot). It does not demonstrate unarmed locomotion, repair,
console operation, medical treatment or carrying. The local readme's description
of the full pack is marketing for that pack, not additional demo content.

The original vendor content is excluded from Git. Install Toon Soldiers Demo
from Unity My Assets on another machine; original GUIDs are used by the preview.
The preview uses the vendor prefab, texture/material and skeletal clips, with
original evaluation controllers and a separate URP forward renderer. Firing
controllers repeat one-shot clips for evaluation without modifying the clips.

`validation.json` records the executing Unity project, rig/mesh totals, clip
durations, loop settings, normalized-weight checks, Animator deformation and
stationary-root checks. `live-preview.png` shows Idle / Run on the top row and
Shoot / Burst on the bottom row. Capture actual Play-mode rendering with
**Orionis > Art > Capture live Toon Soldiers preview** (or the helper's `capture`
command); it verifies controller playback, visible blue texture and absence of
magenta shader failures, then records `liveRenderPassed`. Initial synchronous
static-mesh captures were blank in the forward renderer, so they were replaced
by capture of the real skinned characters after ordinary player-frame updates.

Historical session helpers `preserve-session.cs` and `restore-session.cs` were
used once to protect the main campaign when Unity blocked package import during
Play. They are not art-lab launch scripts. The ignored temporary backup is in
unity/.validation-toon-soldiers. `session-restoration.json` confirms restored
campaign/selection/view/clock and unchanged normal-save hash at tick 16978.
The preview source was moved out of the main game after a concurrent script
reload interrupted restoration. All subsequent art work belongs in Art Lab.

Latest expanded evaluation: 423 Humanoid clips, with 398 showing movement between
sampled poses, and 23 supplied weapon/tool/archery prop prefabs. Source variants
are retained; generic/non-Humanoid motion is not forced onto this avatar.
`viewer-validation.json` checks finite poses, unchanged target avatar, anchored
roots, camera/yaw controls, serialized prop sets, manual selection persistence,
automatic matching, hand switching, None cleanup and actual calibrated IK hand
movement. The 25 nonmoving samples include held poses and finger-only/grip
animations; this Toon rig has no finger bones. 399 clips have extra transform
curves not mapped by the base Humanoid avatar, which remain flagged in the UI.

Props follow the chosen holding hand; the supporting hand can use IK only after
explicit grip calibration. No mesh-bounds center is claimed as a grip. Saved
per-subject/prefab marker position, rotation, calibration and holding-hand choice
survive regeneration; `grip-persistence-validation.json` records that check with
the original authoring restored afterward. Preview instances disable vendor demo
behaviours, including the self-launching/self-deleting arrow. All 92 instances
remain present after normal playback (`prop-playback-validation.json`). Vendor
sources are unchanged. `expanded-viewer.png` shows a crafting clip and Hammer.

The Toon Soldier's original rifle is part of its single skinned mesh; None hides
only additional props. Prop placement, weapon fit, custom spine curves and finger
detail are not production-approved by these mechanical checks. Human-dummy
models are imported assets, not an automatic replacement for this rig. The two
generic FBX rigs excluded from Humanoid discovery belong to the archer's Bow
and BycocketHat models, not missing character-animation imports.
