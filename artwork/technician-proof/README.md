# Original Technician pipeline proof

Original low-poly geometry, solid materials, 18-bone generic rig and two skeletal
animation takes. No Bloons reference geometry or textures are used by this model.
Costume, colors and animation timing are provisional presentation choices. This
proves the asset pipeline; it does not establish game rules or final art approval.

`Technician-Original-Proof.blend` is the editable source. `build_technician.py`
recreates its own isolated scene in Blender and exports the selected original
mesh/armature to `Assets/Orionis/Art/TechnicianProof/Technician_Original.fbx`.
Run the script in Blender with `__file__` set to its full path. It refuses to
overwrite an existing proof scene. The source includes the untouched default
scene from the connected Blender session, but only the Technician is exported.

Idle is 60 intervals at 30fps (2 seconds), Walk 30 intervals (1 second). Both
loop, use skeletal deformation and keep the root stationary. Walk is an in-place
visual study; foot locking, locomotion blending, humanoid retargeting, LODs and
production topology are future art work.

Unity: **Orionis > Art > Build and verify Technician proof** imports both takes,
sets looping, checks skin weights/scale/deformation/loop closure and generates
an isolated scene and overhead PNG evidence here. **Orionis > Art > Open
Technician proof**, then Play, shows Idle on the left and Walk on the right.
The scene is separate from Bootstrap and is not added to build settings. The
generator restores the previously active scene and never accesses campaign saves.
It creates material assets explicitly, with no reference-image dependency.

Blender's vertex count differs from Unity's because FBX import splits vertices
at hard normals and material boundaries. Triangle count, deformation and weight
checks are the useful checks across that boundary.

`blender-validation.json` records source metrics. `unity-validation.json` records
successful Unity verification; `unity-overhead-*.png` show captured poses.

Verified in Unity 6000.5.2f1: 18 bones, 2,772 triangles, 6,018 imported vertices
(hard-normal splits), normalized weights, human scale, continuous loops and
mesh deformation through both direct clip sampling and Animator controllers.
Four overhead walk phases differ; a fifth image checks direct overhead. Synchronous
captures bake each sampled pose to avoid Unity's within-frame GPU skinning cache;
the saved scene uses the actual SkinnedMeshRenderer and Animator controllers.
`unity-play-validation.json` records actual Play-mode Idle/Walk state, elapsed
loops and unchanged 1.36m separation between roots. The preview scene has zero
dependencies on the reference-only Resources/Models folder. The current 2D
renderer gives a fairly flat material appearance; lighting polish remains future
presentation work. Images can be written for diagnosis on failure; the JSON
success report is removed at the start of verification and written only on pass.
