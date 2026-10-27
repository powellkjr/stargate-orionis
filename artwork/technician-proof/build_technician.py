"""Original, mesh-authored Technician pipeline proof. Run in Blender's Python.

No imported geometry, images, generators or reference mesh data are used.
Rebuilds only its own named scene; leaves other scenes and objects intact.
"""
import bpy
import bmesh
import math
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'unity/StargateOrionis/Assets/Orionis/Art/TechnicianProof'
SOURCE = ROOT / 'artwork/technician-proof'
OUT.mkdir(parents=True, exist_ok=True)
SCENE = 'Orionis_Technician_Original_Proof'
if bpy.data.scenes.get(SCENE):
    raise RuntimeError('Proof scene already exists; inspect/save it before rebuilding.')
scene = bpy.data.scenes.new(SCENE)
bpy.context.window.scene = scene
scene.render.fps = 30
scene.frame_start, scene.frame_end = 1, 61
scene.unit_settings.system = 'METRIC'
scene.world = bpy.data.worlds.new('TechnicianProof_World')
scene.world.use_nodes = True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value = (.12,.15,.2,1)

palette = {
    'Suit': (.085,.18,.24,1), 'Armor': (.18,.29,.32,1),
    'Boots': (.032,.045,.06,1), 'Skin': (.55,.31,.18,1),
    'Accent': (.95,.40,.045,1), 'Visor': (.035,.28,.37,1),
    'Metal': (.48,.56,.57,1), 'Lamp': (.88,.92,.68,1),
}
mats = {}
for name, color in palette.items():
    m = bpy.data.materials.new('TechProof_' + name)
    m.use_nodes = True
    shader = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = color
    shader.inputs['Roughness'].default_value = .78
    m.diffuse_color = color
    mats[name] = m

# Human-sized, stylized proportions; front is -Y, Z is up.
bones = {
    'root': ((0,0,0),(0,0,.20),None),
    'pelvis': ((0,0,.87),(0,0,1.02),'root'),
    'spine': ((0,0,1.02),(0,0,1.25),'pelvis'),
    'chest': ((0,0,1.25),(0,0,1.46),'spine'),
    'neck': ((0,0,1.46),(0,0,1.53),'chest'),
    'head': ((0,0,1.53),(0,0,1.77),'neck'),
}
for side, s in [('L',1),('R',-1)]:
    bones.update({
        'upper_arm.'+side: ((s*.27,0,1.42),(s*.40,0,1.16),'chest'),
        'forearm.'+side: ((s*.40,0,1.16),(s*.44,-.02,.94),'upper_arm.'+side),
        'hand.'+side: ((s*.44,-.02,.94),(s*.45,-.04,.82),'forearm.'+side),
        'thigh.'+side: ((s*.145,0,.91),(s*.16,0,.52),'pelvis'),
        'shin.'+side: ((s*.16,0,.52),(s*.16,0,.15),'thigh.'+side),
        'foot.'+side: ((s*.16,0,.15),(s*.16,-.19,.09),'shin.'+side),
    })
arm = bpy.data.armatures.new('TechnicianProof_Skeleton')
rig = bpy.data.objects.new('Technician_Original',arm)
scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
for name,(head,tail,parent) in bones.items():
    b = arm.edit_bones.new(name)
    b.head,b.tail = head,tail
    if parent:
        b.parent = arm.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
rig.show_in_front = True
parts = []

def finish(obj, name, material, bone):
    obj.name = name
    obj.data.materials.append(mats[material])
    group = obj.vertex_groups.new(name=bone)
    group.add(list(range(len(obj.data.vertices))),1,'REPLACE')
    parts.append(obj)
    return obj

def box(name, center, size, material, bone, bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod = o.modifiers.new('Soft fabricated edges','BEVEL')
        mod.width = bevel
        mod.segments = 1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,material,bone)

def ellipsoid(name, center, size, material, bone):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=center)
    o=bpy.context.object
    o.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,material,bone)

def limb(name, start, end, radii, material, bone, parent=None):
    a,b = Vector(start),Vector(end)
    axis=(b-a).normalized()
    u=axis.cross(Vector((0,1,0))).normalized()
    v=axis.cross(u).normalized()
    verts=[]
    for t,r in zip([0,.18,.48,.82,1],radii):
        c=a.lerp(b,t)
        verts += [c+r*(math.cos(i*math.tau/8)*u+math.sin(i*math.tau/8)*v) for i in range(8)]
    faces=[tuple(reversed(range(8))),tuple(range(32,40))]
    for row in range(4):
        for i in range(8):
            faces.append((row*8+i,row*8+(i+1)%8,(row+1)*8+(i+1)%8,(row+1)*8+i))
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    o=bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(o)
    finish(o,name,material,bone)
    if parent:
        # Blend the joint into its parent for actual skeletal deformation.
        g=o.vertex_groups.new(name=parent)
        for row,w in [(0,.45),(1,.18)]:
            ids=list(range(row*8,(row+1)*8))
            g.add(ids,w,'REPLACE')
            o.vertex_groups[bone].add(ids,1-w,'REPLACE')
    return o

box('Pelvis',(0,0,.94),(.40,.26,.22),'Suit','pelvis')
box('Torso',(0,0,1.23),(.48,.29,.43),'Suit','spine',.065)
box('Chest plate',(0,-.16,1.31),(.36,.065,.23),'Armor','chest')
box('Collar',(0,0,1.46),(.28,.26,.075),'Boots','neck')
ellipsoid('Human head',(0,-.018,1.625),(.137,.126,.162),'Skin','head')
ellipsoid('Helmet shell',(0,.006,1.712),(.165,.155,.104),'Armor','head')
box('Helmet brim',(0,-.035,1.69),(.35,.34,.032),'Armor','head',.016)
box('Helmet crown stripe',(0,.002,1.799),(.065,.18,.018),'Accent','head',.007)
box('Goggle gasket',(0,-.134,1.65),(.255,.035,.083),'Boots','head',.015)
box('Goggle lens',(0,-.156,1.651),(.217,.012,.052),'Visor','head',.008)
box('Lens bridge',(0,-.166,1.65),(.018,.012,.057),'Metal','head',.004)
box('Helmet lamp',(.13,-.13,1.737),(.064,.055,.045),'Lamp','head',.008)
box('Backpack',(0,.225,1.25),(.34,.20,.39),'Armor','chest',.045)
box('Backpack orange spine',(0,.333,1.28),(.09,.025,.29),'Accent','chest',.009)
box('Pack lower pocket',(0,.33,1.1),(.25,.07,.12),'Boots','chest',.02)
box('Utility belt',(0,0,1.04),(.435,.31,.065),'Boots','pelvis',.01)
box('Buckle',(0,-.171,1.04),(.075,.025,.054),'Metal','pelvis',.006)
for side,s in [('L',1),('R',-1)]:
    limb('Sleeve '+side,*bones['upper_arm.'+side][:2],[.10,.12,.105,.086,.08],'Suit','upper_arm.'+side,'chest')
    limb('Forearm '+side,*bones['forearm.'+side][:2],[.078,.085,.078,.066,.065],'Suit','forearm.'+side,'upper_arm.'+side)
    ellipsoid('Shoulder '+side,(s*.29,0,1.42),(.125,.15,.105),'Armor','upper_arm.'+side)
    box('Shoulder accent '+side,(s*.29,-.112,1.45),(.13,.052,.065),'Accent','upper_arm.'+side,.01)
    ellipsoid('Glove '+side,(s*.45,-.03,.87),(.07,.075,.092),'Boots','hand.'+side)
    limb('Trouser '+side,*bones['thigh.'+side][:2],[.108,.116,.103,.087,.083],'Suit','thigh.'+side,'pelvis')
    limb('Shin '+side,*bones['shin.'+side][:2],[.082,.089,.078,.068,.065],'Suit','shin.'+side,'thigh.'+side)
    box('Knee pad '+side,(s*.16,-.075,.53),(.145,.065,.13),'Armor','shin.'+side,.022)
    box('Boot '+side,(s*.16,-.064,.095),(.18,.31,.19),'Boots','foot.'+side,.03)
    box('Sole '+side,(s*.16,-.07,.025),(.19,.32,.045),'Armor','foot.'+side,.01)
    box('Belt pouch '+side,(s*.245,-.01,1.02),(.12,.17,.16),'Armor','pelvis',.015)
    box('Harness '+side,(s*.15,-.161,1.3),(.045,.035,.32),'Boots','chest',.007)

# One skinned mesh, with explicit normalized vertex groups.
bpy.ops.object.select_all(action='DESELECT')
for obj in parts: obj.select_set(True)
bpy.context.view_layer.objects.active=parts[0]
bpy.ops.object.join()
body=bpy.context.object
body.name='TechnicianProof_SkinnedMesh'
bm=bmesh.new()
bm.from_mesh(body.data)
bmesh.ops.triangulate(bm,faces=list(bm.faces))
bmesh.ops.dissolve_degenerate(bm,dist=1e-7,edges=list(bm.edges))
bm.to_mesh(body.data)
bm.free()
body.data.update()
body.parent=rig
mod=body.modifiers.new('Technician skeleton','ARMATURE')
mod.object=rig
rig.animation_data_create()
for pb in rig.pose.bones: pb.rotation_mode='XYZ'

def animate(name, end):
    action=bpy.data.actions.new(name)
    action.use_fake_user=True
    rig.animation_data.action=action
    for f in range(1,end+1):
        phase=(f-1)/(end-1)*math.tau
        for pb in rig.pose.bones:
            pb.rotation_euler=(0,0,0)
            pb.location=(0,0,0)
        if name=='Idle':
            rig.pose.bones['chest'].rotation_euler.x=.018*math.sin(phase)
            rig.pose.bones['head'].rotation_euler.z=.025*math.sin(phase)
            rig.pose.bones['pelvis'].location.y=.007*(1-math.cos(phase))
        else:
            rig.pose.bones['pelvis'].location.y=.018*(1-math.cos(phase*2))
            rig.pose.bones['chest'].rotation_euler.y=.045*math.sin(phase)
            for side,offset in [('L',0),('R',math.pi)]:
                p=phase+offset
                rig.pose.bones['thigh.'+side].rotation_euler.x=.43*math.sin(p)
                rig.pose.bones['shin.'+side].rotation_euler.x=-.62*max(0,-math.sin(p))
                rig.pose.bones['foot.'+side].rotation_euler.x=.15*math.sin(p)
                rig.pose.bones['upper_arm.'+side].rotation_euler.x=-.30*math.sin(p)
                rig.pose.bones['forearm.'+side].rotation_euler.x=-.12-.10*max(0,math.sin(p))
        for pb in rig.pose.bones:
            pb.keyframe_insert('rotation_euler',frame=f,group=pb.name)
            pb.keyframe_insert('location',frame=f,group=pb.name)
    return action

idle=animate('Idle',61)
walk=animate('Walk',31)
rig.animation_data.action=idle
scene.frame_set(1)
scene['proof_only']='Original mesh and materials; provisional presentation, no gameplay rules.'
rig['origin']='Original authored geometry; no reference geometry or texture reused.'
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True)
body.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.fbx(filepath=str(OUT/'Technician_Original.fbx'),use_selection=True,
    object_types={'ARMATURE','MESH'},add_leaf_bones=False,bake_anim=True,
    bake_anim_use_all_actions=True,bake_anim_use_nla_strips=False,
    bake_anim_simplify_factor=0,axis_forward='-Z',axis_up='Y',apply_unit_scale=True)

unweighted=sum(not v.groups or abs(sum(g.weight for g in v.groups)-1)>.0001 for v in body.data.vertices)
assert unweighted==0,unweighted
report={'original':True,'bones':len(arm.bones),'vertices':len(body.data.vertices),
    'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),
    'degenerate_triangles':sum(p.area<1e-10 for p in body.data.polygons),
    'invalid_weight_vertices':unweighted,'actions':{'Idle':[1,61],'Walk':[1,31]},
    'fps':30,'palette':palette,'note':'Segmented low-poly proof, not final production topology or approved costume.'}
assert report['degenerate_triangles']==0
(SOURCE/'blender-validation.json').write_text(json.dumps(report,indent=2)+'\n')
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'Technician-Original-Proof.blend'))
print(json.dumps(report))
