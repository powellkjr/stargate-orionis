using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;
using Orionis.ArtLab;

namespace Orionis.Editor
{
    public static class GameActionPreviewBuilder
    {
        const string Pack="Assets/Toon_Soldiers/ToonSoldiers_2";
        const string Human="Assets/Kevin Iglesias/Human Animations";
        const string Output="Assets/Orionis/Art/GameActions";
        public const string ScenePath=Output+"/GameActions.unity";
        static string Evidence=>Path.GetFullPath("../../artwork/toon-soldiers-proof");
        [MenuItem("Orionis/Art/Build game action shortlist")]
        public static void Build()
        {
            Require(new DirectoryInfo(Application.dataPath).Parent.Name=="OrionisArtLab","Wrong Unity project.");
            Require(!EditorApplication.isPlayingOrWillChangePlaymode,"Stop Art Lab Play before rebuilding.");
            var prefab=AssetDatabase.LoadAssetAtPath<GameObject>(Pack+"/prefabs/ToonSoldiers_infantry.prefab");
            Require(prefab!=null,"Import the full Toon Soldiers pack first.");
            Directory.CreateDirectory(Output);AssetDatabase.Refresh();
            var previous=SceneManager.GetActiveScene();
            if(previous.isDirty&&!string.IsNullOrEmpty(previous.path))Require(EditorSceneManager.SaveScene(previous),"Could not preserve the current scene.");
            var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var obj=(GameObject)PrefabUtility.InstantiatePrefab(prefab,scene);obj.name="Orionis character";
            obj.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);
            var actor=obj.GetComponentInChildren<Animator>();
            Require(actor!=null&&actor.avatar!=null&&actor.avatar.isValid&&actor.avatar.isHuman,"Invalid full-pack avatar.");
            actor.runtimeAnimatorController=null;actor.applyRootMotion=false;actor.fireEvents=false;
            actor.Rebind();
            var sourceRenderers=obj.GetComponentsInChildren<Renderer>(true);
            var stock=sourceRenderers.Single(r=>r.name=="weapon_assault_rifle_A");
            var socket=stock.transform.parent;
            var rifle=UnityEngine.Object.Instantiate(stock.gameObject,socket,false);rifle.name="Preview rifle";
            stock.enabled=false;
            var sourceRig=AssetDatabase.LoadAssetAtPath<GameObject>(Human+"/Models/HumanM_Model.fbx");
            Require(sourceRig!=null,"Missing supplied HumanM source rig.");
            var rightPath=sourceRig.GetComponentsInChildren<Transform>(true).Single(t=>t.name=="B-handProp.R");
            var leftPath=sourceRig.GetComponentsInChildren<Transform>(true).Single(t=>t.name=="B-handProp.L");
            var proxyPath=sourceRig.GetComponentsInChildren<Transform>(true).Single(t=>t.name=="B-spineProxy");
            Transform ClonePath(Transform source)
            {
                string path=AnimationUtility.CalculateTransformPath(source,sourceRig.transform);
                var target=actor.transform;var reference=sourceRig.transform;
                foreach(string part in path.Split('/'))
                {
                    reference=reference.Find(part);
                    var child=target.Find(part);
                    if(child==null)
                    {
                        child=new GameObject(part).transform;child.SetParent(target,false);
                        child.localPosition=reference.localPosition;child.localRotation=reference.localRotation;child.localScale=reference.localScale;
                    }
                    target=child;
                }
                return target;
            }
            var right=ClonePath(rightPath);var left=ClonePath(leftPath);var spine=ClonePath(proxyPath);
            PreviewHandBridge Bridge(Transform source,Transform target,HumanBodyBones bone)
            {
                var hand=actor.GetBoneTransform(bone);
                return new PreviewHandBridge{nativeHand=hand,auxiliaryParent=target.parent,
                    restRotationOffset=Quaternion.Inverse(hand.rotation)*source.parent.rotation};
            }
            GameObject Tool(string name)
            {
                var asset=AssetDatabase.LoadAssetAtPath<GameObject>(Human+"/Unity Demo Scenes/Human Crafting Animations/Prefabs/Tools/Human_"+name+".prefab");
                Require(asset!=null,"Missing supplied "+name+" prop.");
                var tool=(GameObject)PrefabUtility.InstantiatePrefab(asset,right);tool.name="Preview "+name;
                tool.transform.localPosition=asset.transform.localPosition;tool.transform.localRotation=asset.transform.localRotation;tool.transform.localScale=asset.transform.localScale;
                foreach(var behaviour in tool.GetComponentsInChildren<MonoBehaviour>(true))if(behaviour!=null)behaviour.enabled=false;
                return tool;
            }
            GameObject WeaponProp(string assetName)
            {
                var asset=AssetDatabase.LoadAssetAtPath<GameObject>(Pack+"/models/weapons/"+assetName+".FBX");
                Require(asset!=null,"Missing weapon prop: "+assetName);
                var prop=(GameObject)PrefabUtility.InstantiatePrefab(asset,socket);
                prop.name="Preview "+assetName;
                var rifleT=rifle.transform;
                prop.transform.SetLocalPositionAndRotation(rifleT.localPosition,rifleT.localRotation);
                prop.transform.localScale=rifleT.localScale;
                foreach(var behaviour in prop.GetComponentsInChildren<MonoBehaviour>(true))if(behaviour!=null)behaviour.enabled=false;
                return prop;
            }
            var hammer=Tool("Hammer");var pickaxe=Tool("Pickaxe");var fishingPole=Tool("FishingPole");
            var rifleB=WeaponProp("weapon_assault_rifle_B");
            var grenadeLauncher=WeaponProp("weapon_grenade_launcher");
            var heavyMG=WeaponProp("weapon_heavy_machinegun");
            var miniGun=WeaponProp("weapon_minigun");
            var rocketLauncher=WeaponProp("weapon_rocket_launcher");
            var shotGun=WeaponProp("weapon_shotgun");
            var subMachineGun=WeaponProp("weapon_submachinegun");
            var flamethrower=WeaponProp("weapon_flamethrower");
            var welder=WeaponProp("weapon_welder");
            var wrench=WeaponProp("weapon_wrench");
            var medigun=WeaponProp("weapon_medigun");
            var needleGun=WeaponProp("weapon_needle_gun");
            var crossbow=WeaponProp("weapon_crossbow");
            var knife=WeaponProp("weapon_knife");
            var sniperRifle=WeaponProp("weapon_sniper_rifle");
            var handgun=WeaponProp("weapon_handgun");
            var revolver=WeaponProp("weapon_revolver");
            var background=new GameObject("Preview background clear").AddComponent<Camera>();
            background.cullingMask=0;background.depth=-10;background.clearFlags=CameraClearFlags.SolidColor;background.backgroundColor=Color.black;
            var camera=new GameObject("Game action camera").AddComponent<Camera>();
            camera.orthographic=true;camera.clearFlags=CameraClearFlags.SolidColor;camera.backgroundColor=new Color(.075f,.09f,.12f,1);
            var key=new GameObject("Art key light").AddComponent<Light>();key.type=LightType.Directional;key.intensity=1.3f;key.transform.rotation=Quaternion.Euler(40,-30,0);
            var fill=new GameObject("Art fill light").AddComponent<Light>();fill.type=LightType.Directional;fill.intensity=.35f;fill.transform.rotation=Quaternion.Euler(25,150,0);
            var view=new GameObject("Game action controls").AddComponent<GameActionPreview>();
            view.actor=actor;view.previewCamera=camera;view.sourceRenderers=sourceRenderers;
            view.equipment=new[]{rifle,hammer,pickaxe,fishingPole,rifleB,grenadeLauncher,heavyMG,miniGun,rocketLauncher,shotGun,subMachineGun,flamethrower,welder,wrench,medigun,needleGun,crossbow,knife,sniperRifle,handgun,revolver};view.equipmentNames=new[]{"None","Rifle","Hammer","Pickaxe","Fishing pole","Assault Rifle B","Grenade Launcher","Heavy Machine Gun","Mini Gun","Rocket Launcher","Shot Gun","Sub Machine Gun","Flamethrower","Welder","Wrench","Medigun","Needle Gun","Crossbow","Knife","Sniper Rifle","Handgun","Revolver"};
            view.auxiliaryRoot=actor.transform.Find("Rig");view.spineProxy=spine;view.nativeSpine=actor.GetBoneTransform(HumanBodyBones.Spine);
            view.spineRestOffset=Quaternion.Inverse(spine.rotation)*view.nativeSpine.rotation;
            view.handBridges=new[]{Bridge(rightPath,right,HumanBodyBones.RightHand),Bridge(leftPath,left,HumanBodyBones.LeftHand)};
            view.actions=Actions();view.library=ToonSoldiersProofPreview.AvailableHumanoidClips();
            view.libraryLabels=view.library.Select(AdditionalAnimationReview.Label).ToArray();
            view.libraryAuxiliary=view.library.Select(c=>AssetDatabase.GetAssetPath(c).StartsWith(Human+"/",StringComparison.Ordinal)).ToArray();
            view.professions=new[]{
                new PreviewProfession{label="Soldier",body="TS_Body_01_infantry",head="TS_Head_15_gunner_only",backpack="backpack_ammobox",palette="red",professionColor="#d1495b",defaultAction=3,notes="Rifle ready, movement, fire, reload and crouch.", equipmentNames=new[]{"None","Assault Rifle A","Assault Rifle B","Grenade Launcher","Heavy Machine Gun","Mini Gun","Rocket Launcher","Shot Gun","Sub Machine Gun"},equipmentSlotMap=new[]{0,1,5,6,7,8,9,10,11}},
                new PreviewProfession{label="Technician",body="TS_Body_05_engineer",head="TS_Head_05_engineer",backpack="backpack_engineer",palette="yellow",professionColor="#f4a261",defaultAction=12,notes="Hammer / pickaxe work. Fine repair and console clips missing.", equipmentNames=new[]{"None","Flamethrower","Welder","Wrench"},equipmentSlotMap=new[]{0,12,13,14}},
                new PreviewProfession{label="Scientist",body="TS_Body_08_trench",head="TS_Head_10_glasses",palette="blue",professionColor="#7b6ef6",defaultAction=16,notes="Blue approximates purple; no purple atlas supplied. Sample-pickup study; scanner/console missing.", equipmentNames=new[]{"None"},equipmentSlotMap=new[]{0}},
                new PreviewProfession{label="Medical",body="TS_Body_06_medic",head="TS_Head_06_medic_A",backpack="backpack_medic",palette="blue",professionColor="#4cc9f0",defaultAction=17,notes="Blue approximates cyan. Low-reach study only; treatment/carrying missing.", equipmentNames=new[]{"None","Medigun","Needle Gun"},equipmentSlotMap=new[]{0,15,16}},
                new PreviewProfession{label="Scout",body="TS_Body_04_sniper",head="TS_Head_02_Scout",backpack="backpack_standard",palette="green",professionColor="#2a9d8f",defaultAction=19,notes="Green approximates teal. Travel / turning; tracking/binoculars missing.", equipmentNames=new[]{"None","Crossbow","Knife","Sniper Rifle"},equipmentSlotMap=new[]{0,17,18,19}},
                new PreviewProfession{label="Diplomat",body="TS_Body_09_general",head="TS_Head_08_beret",palette="yellow",professionColor="#b8a14f",defaultAction=18,notes="Yellow approximates gold. Conversation study; listening/negotiation variants missing.", equipmentNames=new[]{"None","Handgun","Revolver"},equipmentSlotMap=new[]{0,20,21}},
                new PreviewProfession{label="Worker",npc=true,body="TS_Body_07_unequipped",head="TS_Head_05_engineer",palette="grey",defaultAction=12,notes="NPC visual study: plain work clothes / hardhat; shared work and travel.", equipmentNames=new[]{"None"},equipmentSlotMap=new[]{0}},
                new PreviewProfession{label="Guard",npc=true,body="TS_Body_01_infantry",head="TS_Head_01_infantry",palette="grey",defaultAction=Array.FindIndex(view.actions,a=>a.clip.name=="infantry_guard_idle"),notes="NPC visual study: grey infantry / helmet, no backpack; rifle guard stance.", equipmentNames=new[]{"None"},equipmentSlotMap=new[]{0}},
                new PreviewProfession{label="Captain",npc=true,body="TS_Body_09_general",head="TS_Head_09_general",palette="blue",defaultAction=18,notes="NPC visual study: blue officer coat / peaked cap, no backpack; conversation.", equipmentNames=new[]{"None"},equipmentSlotMap=new[]{0}}
            };
            // The medical kit is a staged reference prop, not an uncalibrated hand attachment.
            var kitAsset=AssetDatabase.LoadAssetAtPath<GameObject>(Pack+"/models/extra_models/item_medikit.FBX");
            Require(kitAsset!=null,"Missing medical kit reference prop.");
            view.medicalKit=(GameObject)PrefabUtility.InstantiatePrefab(kitAsset,scene);
            view.medicalKit.name="Medical kit · staged reference";
            var kitBounds=view.medicalKit.GetComponentsInChildren<Renderer>().First().bounds;
            view.medicalKit.transform.position=new Vector3(1.0f,-kitBounds.min.y,0);
            foreach(var profile in view.professions)
            {Require(sourceRenderers.Count(r=>r.name==profile.body)==1,"Missing body: "+profile.body);Require(sourceRenderers.Count(r=>r.name==profile.head)==1,"Missing head: "+profile.head);}
            view.bodyName=view.professions[0].body;view.headName=view.professions[0].head;
            foreach(var r in sourceRenderers)
            {
                bool selected=r.name==view.bodyName||r.name==view.headName;
                if(selected)r.gameObject.SetActive(true);r.enabled=selected;
            }
            foreach(var item in view.equipment)item.SetActive(false);
            camera.transform.position=new Vector3(0,8,8);camera.transform.LookAt(new Vector3(0,1.3f,0));camera.orthographicSize=2.5f;
            var pipeline=AssetDatabase.LoadAssetAtPath<RenderPipelineAsset>("Assets/Orionis/Art/ToonSoldiersProof/ArtLabPipeline.asset");
            CharacterPartsBuilder.Build(view,Pack);
            foreach(var profile in view.professions)
            {
                Require(view.parts.colors.Any(m=>m.name=="ToonSoldiers_"+profile.palette),"Missing profession palette.");
                Require(string.IsNullOrEmpty(profile.backpack)||view.parts.backpacks.Any(p=>p.name==profile.backpack),"Missing profession backpack.");
            }
            Require(pipeline!=null,"Art Lab render pipeline missing.");GraphicsSettings.defaultRenderPipeline=pipeline;QualitySettings.renderPipeline=pipeline;
            Require(EditorSceneManager.SaveScene(scene,ScenePath),"Could not save the focused preview.");AssetDatabase.SaveAssets();
            Directory.CreateDirectory(Evidence);
            File.WriteAllText(Path.Combine(Evidence,"game-actions-catalog.json"),JsonUtility.ToJson(new Catalog{actions=view.actions.Select(a=>new ActionRecord{label=a.label,clip=a.clip.name,path=AssetDatabase.GetAssetPath(a.clip),equipment=a.equipment}).ToArray()},true));
            File.WriteAllText(Path.Combine(Evidence,"profession-picks.json"),JsonUtility.ToJson(new ProfessionCatalog{professions=view.professions},true));
            Debug.Log("Game actions preview built: one modular character, "+view.professions.Length+" visual presets and "+view.actions.Length+" focused actions.");
        }
        static AnimationClip Clip(string path,string name)
        {
            var clip=AssetDatabase.LoadAllAssetsAtPath(path).OfType<AnimationClip>().SingleOrDefault(c=>c.name==name);
            Require(clip!=null&&clip.humanMotion,"Missing compatible authored clip: "+name);return clip;
        }
        static PreviewGameAction[] Actions()
        {
            PreviewGameAction HumanAction(string label,string group,string folder,string clip,int item=0)
                =>new PreviewGameAction{label=label,group=group,clip=Clip(Human+"/Animations/Male/"+folder+"/"+clip+".fbx",clip),equipment=item,auxiliaryRig=true,professions=group=="Technician work"?"Technician,Worker":group=="Scientist study"?"Scientist":group=="Medical study"?"Medical":""};
            PreviewGameAction RifleAction(string label,string folder,string clip)
                =>new PreviewGameAction{label=label,group="Rifle combat",clip=Clip(Pack+"/animation/Infantry/"+folder+clip+".FBX",clip),equipment=1,professions="Soldier,Scout,Guard,Captain"};
            var actions=new System.Collections.Generic.List<PreviewGameAction>{
                HumanAction("Idle · unarmed","Movement","Idles","HumanM@Idle01"),
                HumanAction("Walk · unarmed","Movement","Movement/Walk","HumanM@Walk01_Forward"),
                HumanAction("Run · unarmed","Movement","Movement/Run","HumanM@Run01_Forward"),
                RifleAction("Rifle ready","","infantry_combat_idle"),
                RifleAction("Walk with rifle","guard/","infantry_guard_walk"),
                RifleAction("Run with rifle","guard/","infantry_guard_run"),
                RifleAction("Fire · single","","infantry_combat_shoot"),
                RifleAction("Fire · burst","","infantry_combat_shoot_burst"),
                RifleAction("Reload","","infantry_combat_reload"),
                RifleAction("Crouch · ready","crouch/","infantry_crouch_idle"),
                RifleAction("Crouch · fire","crouch/","infantry_crouch_shoot"),
                HumanAction("Hammer · begin","Technician work","Work/Hammering","HumanM@HammeringGround01_R - Begin",2),
                HumanAction("Hammer · work","Technician work","Work/Hammering","HumanM@HammeringGround01_R - Loop",2),
                HumanAction("Hammer · finish","Technician work","Work/Hammering","HumanM@HammeringGround01_R - Stop",2),
                HumanAction("Pickaxe · ground","Technician work","Work/Mining","HumanM@MiningOneHand01_R - Ground",3),
                HumanAction("Pickaxe · wall","Technician work","Work/Mining","HumanM@MiningOneHand01_R - Wall",3),
                HumanAction("Sample pickup · candidate","Scientist study","Work/Gathering","HumanM@Gathering02"),
                HumanAction("Low reach · candidate, no treatment","Medical study","Work/Gathering","HumanM@Gathering01"),
                HumanAction("Conversation","Social","Social/Conversation","HumanM@Talk01"),
                HumanAction("Sprint","Travel","Movement/Sprint","HumanM@Sprint01_Forward"),
                HumanAction("Turn · left","Travel","Movement/Turn","HumanM@Turn01_Left"),
                HumanAction("Turn · right","Travel","Movement/Turn","HumanM@Turn01_Right")
            };
            // Preserve source variants explicitly; these are art studies, not new gameplay actions.
            foreach(var path in Directory.GetFiles(Human+"/Animations/Male/Idles","*.fbx").OrderBy(p=>p))
            {
                string name=Path.GetFileNameWithoutExtension(path);if(name=="HumanM@Idle01")continue;
                var action=HumanAction(name.Replace("HumanM@",""),"Idle variants","Idles",name);action.oneShot=name.Contains("-");actions.Add(action);
            }
            foreach(var path in Directory.GetFiles(Human+"/Animations/Male/Misc/Unsheathe","*.fbx").OrderBy(p=>p))
            {
                string name=Path.GetFileNameWithoutExtension(path);
                var action=HumanAction(name.Replace("HumanM@","")+" · pose only","Sheathe / draw studies","Misc/Unsheathe",name);action.oneShot=true;actions.Add(action);
            }
            foreach(var path in Directory.GetFiles(Human+"/Animations/Male/Work/Fishing","*.fbx").OrderBy(p=>p))
            {
                string name=Path.GetFileNameWithoutExtension(path);
                var action=HumanAction(name.Replace("HumanM@",""),"Fishing","Work/Fishing",name,4);action.oneShot=name.Contains("Begin")||name.Contains("Stop")||name.Contains("Throw")||name.EndsWith("PullOut01",StringComparison.Ordinal);actions.Add(action);
            }
            foreach(string name in new[]{"Death01","Death02","Death03","CombatDeath01"})
            {var action=HumanAction(name,"Death · unarmed","Combat","HumanM@"+name);action.oneShot=true;actions.Add(action);}
            foreach(string suffix in new[]{"A","B","C","D","E"})
            {
                var action=RifleAction("Rifle death · "+suffix,"","infantry_death_"+suffix);action.group="Death · rifle";action.oneShot=true;action.professions="";actions.Add(action);
            }
            actions.Add(RifleAction("Guard · rifle idle","guard/","infantry_guard_idle"));
            foreach(var clip in AllDeathAndInteractClips())
            {
                if(actions.Any(a=>a.clip==clip))continue;
                string path=AssetDatabase.GetAssetPath(clip);
                bool native=path.StartsWith(Pack+"/",StringComparison.Ordinal);
                bool infantry=native&&clip.name.StartsWith("infantry_",StringComparison.Ordinal);
                bool death=clip.name.IndexOf("death",StringComparison.OrdinalIgnoreCase)>=0;
                string family=native?clip.name.Split('_')[0]:clip.name.Split('@')[0];
                actions.Add(new PreviewGameAction{
                    label=clip.name,group=(death?"Death · ":"Interact · ")+family,clip=clip,
                    oneShot=true,equipment=infantry?1:0,
                    auxiliaryRig=path.StartsWith(Human+"/",StringComparison.Ordinal),
                    notes=infantry?"Native rifle motion.":native?"Body motion only; source weapon family fit is unreviewed.":
                        family=="Skeleton"?"Humanoid retarget study; skeleton-specific extra bindings are not mapped.":"Humanoid body retarget; source variant retained."
                });
            }
            AdditionalAnimationReview.Append(actions);
            return actions.ToArray();
        }
        static AnimationClip[] AllDeathAndInteractClips()=>ToonSoldiersProofPreview.AvailableHumanoidClips()
            .Where(c=>c.name.IndexOf("death",StringComparison.OrdinalIgnoreCase)>=0||c.name.IndexOf("interact",StringComparison.OrdinalIgnoreCase)>=0).ToArray();
        [MenuItem("Orionis/Art/Open game action shortlist")]
        public static void Open(){if(EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())EditorSceneManager.OpenScene(ScenePath);}
        public static void Verify()
        {
            Require(EditorApplication.isPlaying,"Run the focused preview first.");
            File.Delete(Path.Combine(Evidence,"game-actions-validation.json"));
            var view=UnityEngine.Object.FindFirstObjectByType<GameActionPreview>();Require(view!=null,"Focused preview not loaded.");
            Require(UnityEngine.Object.FindObjectsByType<Animator>(FindObjectsSortMode.None).Length==1,"Preview has extra characters.");
            var skin=view.actor.GetComponentsInChildren<SkinnedMeshRenderer>().First(s=>s.name==view.bodyName);
            Require(skin.forceMatrixRecalculationPerRender&&skin.updateWhenOffscreen,"Final procedural bone poses are not refreshed for rendering.");
            var samples=new System.Collections.Generic.List<ActionRecord>();
            Require(view.actions.Select(a=>a.clip).Distinct().Count()==view.actions.Length,"Duplicate source clips in action catalog.");
            var required=AllDeathAndInteractClips();
            Require(required.All(c=>view.actions.Any(a=>a.clip==c)),"An installed death/interact clip is missing.");
            for(int i=0;i<view.actions.Length;i++)
            {
                view.SelectAction(i);Require(view.CurrentClip==view.actions[i].clip,"Wrong clip selected.");
                view.Sample(.17f);var a=Bake(skin);view.Sample(.63f);var b=Bake(skin);
                Require(b.All(v=>float.IsFinite(v.x)&&float.IsFinite(v.y)&&float.IsFinite(v.z)),"Invalid pose.");
                Require(view.sourceRenderers.Count(r=>r.enabled&&r.gameObject.activeInHierarchy)==2,"Body/head variants are stacking.");
                Require(view.sourceRenderers.Where(r=>r.name.StartsWith("weapon_",StringComparison.Ordinal)).All(r=>!r.enabled),"Original rifle is still visible.");
                Require(view.equipment.Count(e=>e.activeSelf)==(view.actions[i].equipment==0?0:1),"Equipment did not replace the previous item.");
                float movement=a.Zip(b,Vector3.Distance).Max();Require(movement>.0001f,"Action did not animate: "+view.actions[i].label);
                samples.Add(new ActionRecord{label=view.actions[i].label,clip=view.CurrentClip.name,path=AssetDatabase.GetAssetPath(view.CurrentClip),equipment=view.EquipmentIndex,motion=movement});
            }
            view.SelectAction(3);view.SetEquipment(2);Require(!view.equipment[0].activeSelf&&view.equipment[1].activeSelf,"Rifle did not disappear when Hammer selected.");
            view.SetEquipment(0);Require(view.equipment.All(e=>!e.activeSelf),"None did not clear equipment.");
            view.SelectAction(0);view.SetView(45,0);
            foreach(var profile in view.professions.Select((p,i)=>new{p,i}))
            {
                view.SelectProfession(profile.i);view.Sample(.35f);
                Require(view.bodyName==profile.p.body&&view.headName==profile.p.head,"Wrong profession parts.");
                Require(view.sourceRenderers.Count(r=>r.enabled&&r.gameObject.activeInHierarchy)==2,"Profession parts stacking.");
                var profileSkin=view.sourceRenderers.OfType<SkinnedMeshRenderer>().Single(r=>r.name==profile.p.body);
                Require(Bake(profileSkin).All(v=>float.IsFinite(v.x)&&float.IsFinite(v.y)&&float.IsFinite(v.z)),"Invalid profession skin.");
                Require(view.EquipmentIndex==view.actions[profile.p.defaultAction].equipment,"Profession equipment leaked.");
                Require(view.medicalKit.activeSelf==(profile.p.label=="Medical"),"Medical kit leaked.");
                int backpack=Array.FindIndex(view.parts.backpacks,o=>o.name==profile.p.backpack)+1;
                int palette=Array.FindIndex(view.parts.colors,m=>m.name=="ToonSoldiers_"+profile.p.palette)+1;
                Require(view.parts.BackpackIndex==backpack&&view.parts.BodyColor==palette&&view.parts.HeadColor==palette,"Profession backpack/palette did not restore.");
            }
            view.SelectProfession(0);
            File.WriteAllText(Path.Combine(Evidence,"game-actions-validation.json"),JsonUtility.ToJson(new Validation{passed=true,actions=samples.ToArray()},true));
            File.WriteAllText(Path.Combine(Evidence,"profession-validation.json"),"{\"passed\":true,\"presets\":"+view.professions.Length+",\"npcPresets\":"+view.professions.Count(p=>p.npc)+",\"singleActor\":true,\"exclusiveBodyHead\":true,\"equipmentCleanup\":true}");
            File.WriteAllText(Path.Combine(Evidence,"death-interact-coverage.json"),JsonUtility.ToJson(new Coverage{
                passed=true,deaths=required.Count(c=>c.name.IndexOf("death",StringComparison.OrdinalIgnoreCase)>=0),
                interacts=required.Count(c=>c.name.IndexOf("interact",StringComparison.OrdinalIgnoreCase)>=0),
                allIncluded=true,uniqueActions=view.actions.Length},true));
        }
        public static void Capture()
        {
            Require(EditorApplication.isPlaying&&SceneManager.GetActiveScene().path==ScenePath,"Play the focused GameActions scene first.");
            var view=UnityEngine.Object.FindFirstObjectByType<GameActionPreview>();
            var camera=view.previewCamera;var previous=RenderTexture.active;
            var texture=RenderTexture.GetTemporary(1000,900,24);var image=new Texture2D(1000,900,TextureFormat.RGB24,false);
            try
            {
                camera.targetTexture=texture;camera.Render();RenderTexture.active=texture;
                image.ReadPixels(new Rect(0,0,1000,900),0,0);image.Apply();
                File.WriteAllBytes(Path.Combine(Evidence,"game-actions-live.png"),image.EncodeToPNG());
                var pixels=image.GetPixels32();Require(pixels.Count(p=>p.r>220&&p.b>220&&p.g<35)<30,"Magenta shader failure.");
                Require(pixels.Count(p=>Math.Max(p.r,Math.Max(p.g,p.b))>70)>400,"Character texture not visible.");
                File.WriteAllText(Path.Combine(Evidence,"game-actions-render.json"),"{\"passed\":true,\"singleCharacter\":true}");
            }
            finally{camera.targetTexture=null;RenderTexture.active=previous;RenderTexture.ReleaseTemporary(texture);UnityEngine.Object.DestroyImmediate(image);}
        }
        static Vector3[] Bake(SkinnedMeshRenderer skin){var mesh=new Mesh();try{skin.BakeMesh(mesh);return mesh.vertices;}finally{UnityEngine.Object.DestroyImmediate(mesh);}}
        static void Require(bool value,string message){if(!value)throw new InvalidOperationException(message);}
        [Serializable] class Catalog{public ActionRecord[] actions;}
        [Serializable] class Coverage{public bool passed,allIncluded;public int deaths,interacts,uniqueActions;}
        [Serializable] class ProfessionCatalog{public PreviewProfession[] professions;}
        [Serializable] class Validation{public bool passed;public ActionRecord[] actions;}
        [Serializable] class ActionRecord{public string label,clip,path;public int equipment;public float motion;}
    }
}
