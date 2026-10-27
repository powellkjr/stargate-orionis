using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.Rendering.Universal;
using KevinIglesias;

namespace Orionis.Editor
{
    public static class ToonSoldiersProofPreview
    {
        const string Vendor="Assets/ToonSoldiers_demo";
        const string Output="Assets/Orionis/Art/ToonSoldiersProof";
        public const string ScenePath=Output+"/ToonSoldiersProof.unity";
        static string Evidence=>Path.GetFullPath("../../artwork/toon-soldiers-proof");

        [MenuItem("Orionis/Art/Build and verify Toon Soldiers demo")]
        public static void BuildAndVerify()
        {
            Require(new DirectoryInfo(UnityEngine.Application.dataPath).Parent.Name=="OrionisArtLab","Run this generator only in the independent OrionisArtLab project.");
            if(EditorApplication.isPlayingOrWillChangePlaymode) throw new InvalidOperationException("Stop Play before building the preview.");
            var prefab=AssetDatabase.LoadAssetAtPath<GameObject>(Vendor+"/ToonSoldier_Demo_prefab.prefab");
            if(prefab==null) throw new InvalidOperationException("Import the locally acquired Toon Soldiers Demo first.");
            Directory.CreateDirectory(Output);
            Directory.CreateDirectory(Evidence);
            File.Delete(Path.Combine(Evidence,"validation.json"));
            AssetDatabase.Refresh();
            ConfigurePipeline();
            string[] names={"idle","run","shoot","shoot_burst"};
            var clips=names.Select(n=>AssetDatabase.LoadAllAssetsAtPath(Vendor+"/animation/assault_combat_"+n+".FBX")
                .OfType<AnimationClip>().Single(c=>!c.name.StartsWith("__preview__",StringComparison.Ordinal))).ToArray();
            var prior=SceneManager.GetActiveScene();
            bool reopenProof=prior.path==ScenePath;
            if(reopenProof)
            {
                if(prior.isDirty) Require(EditorSceneManager.SaveScene(prior),"Could not save the current preview.");
                string workspace=Output+"/ArtLabWorkspace.unity";
                prior=AssetDatabase.LoadAssetAtPath<SceneAsset>(workspace)!=null
                    ?EditorSceneManager.OpenScene(workspace)
                    :EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            }
            if(string.IsNullOrEmpty(prior.path))
                EditorSceneManager.SaveScene(prior,AssetDatabase.GenerateUniqueAssetPath(Output+"/ArtLabWorkspace.unity"));
            var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Additive);
            SceneManager.SetActiveScene(scene);
            var models=new GameObject[4];
            var propPrefabs=AvailablePropPrefabs();
            var priorGrips=ReadGripAuthoring();
            var propSets=new Orionis.ArtLab.PreviewSubjectProps[4];
            var weaponLabels=new[]{"None"}.Concat(propPrefabs.Select(p=>
                propPrefabs.Count(other=>PropLabel(other)==PropLabel(p))>1
                    ?PropLabel(p)+" ("+AssetDatabase.GetAssetPath(p).Split('/')[^4]+")":PropLabel(p))).ToArray();
            var report=new Report{unity=UnityEngine.Application.unityVersion,
                project=Path.GetDirectoryName(UnityEngine.Application.dataPath),clips=new ClipReport[4]};
            try
            {
                for(int i=0;i<4;i++)
                {
                    var obj=(GameObject)PrefabUtility.InstantiatePrefab(prefab,scene);
                    models[i]=obj;
                    obj.name="Toon Soldier - "+names[i];
                    obj.transform.position=new Vector3(i%2==0?1.15f:-1.15f,0,i<2?-1.6f:1.6f);
                    var animator=obj.GetComponentInChildren<Animator>();
                    Require(animator!=null&&animator.avatar!=null&&animator.avatar.isValid&&animator.avatar.isHuman,"Invalid Humanoid avatar.");
                    animator.applyRootMotion=false;
                    animator.fireEvents=false;
                    var ikSwitch=new GameObject("IKSwitch").transform;
                    ikSwitch.SetParent(animator.transform,false);
                    ikSwitch.localPosition=Vector3.zero;
                    var ikTool=animator.gameObject.AddComponent<KevinIglesias.IKHelperTool>();
                    ikTool.hand=KevinIglesias.IKHelperHand.LeftHand;
                    ikTool.iKSwitch=ikSwitch;
                    ikTool.handEffector=animator.GetBoneTransform(HumanBodyBones.LeftHand);
                    ikTool.enabled=false;
                    var props=new Orionis.ArtLab.PreviewProp[propPrefabs.Length];
                    for(int w=0;w<props.Length;w++)
                    {
                        var weaponPrefab=propPrefabs[w];
                        var hand=animator.GetBoneTransform(HumanBodyBones.RightHand);
                        Require(hand!=null,"Missing target hand for prop attachment.");
                        var cap=(GameObject)PrefabUtility.InstantiatePrefab(weaponPrefab,hand);
                        // Props are visual inspection instances, not executable vendor demos.
                        foreach(var behaviour in cap.GetComponentsInChildren<MonoBehaviour>(true))
                            if(behaviour!=null)behaviour.enabled=false;
                        cap.name=weaponLabels[w+1];
                        cap.transform.localPosition=weaponPrefab.transform.localPosition;
                        cap.transform.localRotation=weaponPrefab.transform.localRotation;
                        cap.transform.localScale=weaponPrefab.transform.localScale;
                        cap.SetActive(false);
                        // This is an editable calibration marker, not an inferred handle.
                        var grip=new GameObject("Uncalibrated support grip").transform;
                        grip.SetParent(cap.transform,false);
                        grip.localPosition=Vector3.zero;
                        grip.localRotation=Quaternion.identity;
                        props[w]=new Orionis.ArtLab.PreviewProp{instance=cap,supportGrip=grip,gripCalibrated=false};
                        if(priorGrips.TryGetValue(i+"|"+AssetDatabase.GetAssetPath(weaponPrefab),out var savedGrip))
                        {
                            grip.localPosition=savedGrip.position;grip.localRotation=savedGrip.rotation;
                            props[w].gripCalibrated=savedGrip.calibrated;
                            props[w].calibratedForLeftHold=savedGrip.leftHold;
                        }
                    }
                    propSets[i]=new Orionis.ArtLab.PreviewSubjectProps{props=props,ikSwitch=ikSwitch,ikTool=ikTool};
                    animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
                    animator.runtimeAnimatorController=Controller(names[i],clips[i]);
                    animator.Rebind();
                    animator.Update(0);
                    var skins=obj.GetComponentsInChildren<SkinnedMeshRenderer>();
                    Require(skins.Length>0,"No skinned character mesh.");
                    Require(skins.All(s=>s.sharedMesh.boneWeights.All(w=>Mathf.Abs(w.weight0+w.weight1+w.weight2+w.weight3-1)<.002f)),"Invalid skin weights.");
                    var bounds=skins[0].bounds;
                    foreach(var s in skins.Skip(1)) bounds.Encapsulate(s.bounds);
                    Require(bounds.size.y>.3f&&bounds.size.y<5,"Unexpected imported character scale.");
                    var p=obj.transform.position;
                    Pose(animator,names[i],0);
                    var first=Vertices(skins);
                    Pose(animator,names[i],.25f);
                    float motion=first.Zip(Vertices(skins),(a,b)=>Vector3.Distance(a,b)).Max();
                    Require(motion>.0001f,"Clip did not deform the Humanoid model: "+names[i]);
                    Require(Vector3.Distance(p,obj.transform.position)<.0001f,"Unexpected root movement.");
                    report.clips[i]=new ClipReport{name=names[i],seconds=clips[i].length,loop=clips[i].isLooping,
                        humanoid=clips[i].humanMotion,meshMotion=motion,bones=skins.Max(s=>s.bones.Length),
                        triangles=skins.Sum(s=>s.sharedMesh.triangles.Length/3),height=bounds.size.y};
                    Pose(animator,names[i],0);
                }
                var cam=new GameObject("Toon Soldiers overhead camera").AddComponent<Camera>();
                cam.orthographic=true;
                cam.orthographicSize=4.2f;
                cam.clearFlags=CameraClearFlags.SolidColor;
                cam.backgroundColor=new Color(.075f,.09f,.12f,1);
                cam.transform.position=new Vector3(0,9,5);
                cam.transform.LookAt(new Vector3(0,.8f,0));
                var light=new GameObject("Proof key light").AddComponent<Light>();
                light.type=LightType.Directional;
                light.intensity=1.3f;
                light.transform.rotation=Quaternion.Euler(40,-30,0);
                var available=AvailableHumanoidClips();
                var controls=new GameObject("Character preview controls").AddComponent<Orionis.ArtLab.CharacterPreviewControls>();
                controls.Configure(cam,models.Select(m=>m.GetComponentInChildren<Animator>()).ToArray(),propSets,weaponLabels,available,
                    available.Select(c=>c.name+" · "+AssetDatabase.GetAssetPath(c).Split('/')[1]).ToArray(),
                    available.Select(c=>MissingCustomPaths(c,models[0].GetComponentInChildren<Animator>()).Length>0
                        ?"Extra prop/spine curves need a matching attachment setup; preview shows Humanoid motion.":"").ToArray());
                Require(EditorSceneManager.SaveScene(scene,ScenePath),"Could not save the generated preview scene.");
                report.passed=true;
                File.WriteAllText(Path.Combine(Evidence,"validation.json"),JsonUtility.ToJson(report,true)+"\n");
                AssetDatabase.SaveAssets();
                Debug.Log("Toon Soldiers demo PASS: four Humanoid clips, skin weights, controller deformation and stationary roots. Open and Play the preview, then capture live rendering.");
            }
            finally
            {
                if(prior.IsValid()&&prior.isLoaded) SceneManager.SetActiveScene(prior);
                EditorSceneManager.CloseScene(scene,true);
                if(reopenProof) EditorSceneManager.OpenScene(ScenePath);
            }
        }

        [MenuItem("Orionis/Art/Open Toon Soldiers demo preview")]
        public static void Open()
        {
            if(EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) EditorSceneManager.OpenScene(ScenePath);
        }
        public static AnimationClip[] AvailableHumanoidClips()
        {
            return AssetDatabase.FindAssets("t:Model",new[]{"Assets"})
                .Concat(AssetDatabase.FindAssets("t:AnimationClip",new[]{"Assets"}))
                .Select(AssetDatabase.GUIDToAssetPath).Distinct()
                .SelectMany(AssetDatabase.LoadAllAssetsAtPath).OfType<AnimationClip>()
                .Where(c=>c.humanMotion&&c.length>0&&!c.name.StartsWith("__preview__",StringComparison.Ordinal))
                .Distinct().OrderBy(c=>AssetDatabase.GetAssetPath(c),StringComparer.OrdinalIgnoreCase)
                .ThenBy(c=>c.name,StringComparer.OrdinalIgnoreCase).ToArray();
        }
        public static GameObject[] AvailablePropPrefabs()
        {
            return AssetDatabase.FindAssets("t:Prefab",new[]{"Assets/Kevin Iglesias/Human Animations"})
                .Select(AssetDatabase.GUIDToAssetPath)
                .Where(p=>p.Contains("/Prefabs/Weapons/")||p.Contains("/Prefabs/Tools/")
                    ||Path.GetFileName(p).StartsWith("HumanArcher_",StringComparison.Ordinal))
                .Select(AssetDatabase.LoadAssetAtPath<GameObject>)
                .Where(p=>p!=null&&!p.GetComponentsInChildren<Animator>(true).Any())
                .OrderBy(PropLabel,StringComparer.OrdinalIgnoreCase)
                .ThenBy(AssetDatabase.GetAssetPath,StringComparer.OrdinalIgnoreCase).ToArray();
        }
        static System.Collections.Generic.Dictionary<string,GripAuthoring> ReadGripAuthoring()
        {
            var result=new System.Collections.Generic.Dictionary<string,GripAuthoring>();
            if(!File.Exists(ScenePath))return result;
            var scene=EditorSceneManager.OpenPreviewScene(ScenePath);
            try
            {
                var viewer=scene.GetRootGameObjects().SelectMany(o=>o.GetComponentsInChildren<Orionis.ArtLab.CharacterPreviewControls>(true)).FirstOrDefault();
                if(viewer==null)return result;
                for(int i=0;i<viewer.PropSets.Length;i++)
                    foreach(var prop in viewer.PropSets[i].props)
                    {
                        if(prop?.instance==null||prop.supportGrip==null)continue;
                        string path=PrefabUtility.GetPrefabAssetPathOfNearestInstanceRoot(prop.instance);
                        if(string.IsNullOrEmpty(path))continue;
                        result[i+"|"+path]=new GripAuthoring{position=prop.supportGrip.localPosition,rotation=prop.supportGrip.localRotation,
                            calibrated=prop.gripCalibrated,leftHold=prop.calibratedForLeftHold};
                    }
            }
            finally{EditorSceneManager.ClosePreviewScene(scene);}
            return result;
        }
        static string PropLabel(GameObject prefab)
        {
            var name=Path.GetFileNameWithoutExtension(AssetDatabase.GetAssetPath(prefab));
            return name.StartsWith("HumanArcher_",StringComparison.Ordinal)?name.Substring(12)
                :name.StartsWith("Human_",StringComparison.Ordinal)?name.Substring(6):name;
        }
        static string[] MissingCustomPaths(AnimationClip clip,Animator animator)
        {
            return AnimationUtility.GetCurveBindings(clip).Where(b=>b.type==typeof(Transform)&&!string.IsNullOrEmpty(b.path)
                &&animator.transform.Find(b.path)==null).Select(b=>b.path).Distinct().ToArray();
        }
        public static void VerifyViewer()
        {
            Require(EditorApplication.isPlaying,"Play the Art Lab viewer before verification.");
            File.Delete(Path.Combine(Evidence,"viewer-validation.json"));
            var viewer=UnityEngine.Object.FindFirstObjectByType<Orionis.ArtLab.CharacterPreviewControls>();
            var cam=GameObject.Find("Toon Soldiers overhead camera").GetComponent<Camera>();
            var actor=GameObject.Find("Toon Soldier - idle").GetComponent<Animator>();
            var avatar=actor.avatar;
            var available=AvailableHumanoidClips();
            Require(viewer!=null&&viewer.ClipCount==available.Length,"Viewer catalog is stale.");
            viewer.SetSolo(true);viewer.SetElevation(25);viewer.SetYaw(137);
            Require(Mathf.Abs(Vector3.Angle(cam.transform.forward,Vector3.down)-65)<.1f,"Camera angle slider did not change elevation.");
            Require(Quaternion.Angle(actor.transform.rotation,Quaternion.Euler(0,137,0))<.1f,"Character rotation slider did not rotate the rig.");
            viewer.SetElevation(90);
            Require(Vector3.Dot(cam.transform.forward,Vector3.down)>.999f,"Direct overhead view failed.");
            viewer.SetSolo(false);
            Require(UnityEngine.Object.FindObjectsByType<Animator>(FindObjectsSortMode.None).Length==4,"Comparison view did not restore all subjects.");
            viewer.SetSolo(true);
            VerifyProps(viewer,actor,available);
            var skins=actor.GetComponentsInChildren<SkinnedMeshRenderer>();
            var records=new System.Collections.Generic.List<RetargetClip>();
            int moving=0;
            for(int i=0;i<available.Length;i++)
            {
                viewer.SelectClip(i);
                var root=actor.transform.position;
                actor.Play(0,0,.17f);actor.Update(0);var first=Vertices(skins);
                actor.Play(0,0,.61f);actor.Update(0);var second=Vertices(skins);
                Require(second.All(v=>float.IsFinite(v.x)&&float.IsFinite(v.y)&&float.IsFinite(v.z)),"Nonfinite retarget pose: "+available[i].name);
                Require(actor.avatar==avatar&&actor.isHuman,"Retargeting replaced the target avatar.");
                Require(Vector3.Distance(root,actor.transform.position)<.0001f,"Retargeting moved the preview root.");
                float motion=first.Zip(second,(a,b)=>Vector3.Distance(a,b)).Max();
                if(motion>.0001f)moving++;
                records.Add(new RetargetClip{name=available[i].name,path=AssetDatabase.GetAssetPath(available[i]),
                    meshMotion=motion,missingCustomPaths=MissingCustomPaths(available[i],actor)});
            }
            Require(moving>1,"Catalog did not produce animated poses.");
            int walk=Array.FindIndex(available,c=>c.name.IndexOf("Walk",StringComparison.OrdinalIgnoreCase)>=0);
            viewer.SelectClip(walk>=0?walk:0);viewer.SetElevation(60);viewer.SetYaw(0);viewer.SetZoom(1.9f);
            File.WriteAllText(Path.Combine(Evidence,"viewer-validation.json"),JsonUtility.ToJson(new ViewerReport{
                project=Path.GetDirectoryName(UnityEngine.Application.dataPath),passed=true,clipCount=available.Length,
                propCount=viewer.PropCount-1,propChecksPassed=true,movingClips=moving,clips=records.ToArray()},true)+"\n");
        }
        static void VerifyProps(Orionis.ArtLab.CharacterPreviewControls viewer,Animator actor,AnimationClip[] clips)
        {
            var expected=AvailablePropPrefabs();
            Require(viewer.PropCount==expected.Length+1,"Prop catalog is stale.");
            Require(viewer.PropSets.Length==4&&viewer.PropSets.All(s=>s.props.Length==expected.Length),"Prop sets did not survive scene serialization.");
            var set=viewer.PropSets[0];
            viewer.SetSupportIk(false);
            for(int i=1;i<viewer.PropCount;i++)
            {
                viewer.SetWeapon(i);
                Require(set.props.Count(p=>p.instance.activeSelf)==1&&set.props[i-1].instance.activeSelf,"Prop selection did not show exactly one prop.");
                Require(set.props[i-1].instance.GetComponentsInChildren<MonoBehaviour>(true).All(b=>b==null||!b.enabled),
                    "Executable demo behaviour remains on a preview prop.");
                Require(set.props[i-1].instance.transform.parent==actor.GetBoneTransform(HumanBodyBones.RightHand),"Prop is not attached to the holding hand.");
                Require(set.ikTool.handEffector!=null&&set.ikSwitch.localPosition==Vector3.zero,"Uncalibrated prop activated IK.");
            }
            viewer.SetWeapon(1);
            viewer.SelectClip(0);
            Require(viewer.SelectedWeapon==1&&!viewer.AutomaticProp,"Manual prop choice did not survive a clip change.");
            var prop=set.props[0];
            viewer.SetHoldInLeftHand(true);
            Require(prop.instance.transform.parent==actor.GetBoneTransform(HumanBodyBones.LeftHand),"Left-hand attachment failed.");
            viewer.SetHoldInLeftHand(false);
            viewer.SetAutomaticProp(true);
            int match=Array.FindIndex(clips,c=>c.name.IndexOf("AssaultRifle",StringComparison.OrdinalIgnoreCase)>=0);
            Require(match>=0,"Missing known rifle clip for automatic-prop check.");
            viewer.SelectClip(match);
            Require(viewer.CurrentPropLabel=="AssaultRifle","Automatic prop matching did not prefer the specific rifle.");
            viewer.SetWeapon(1);
            prop=set.props[0];
            // A temporary reachable test calibration proves IK; it is not saved as grip authoring.
            var hand=actor.GetBoneTransform(HumanBodyBones.LeftHand);
            Vector3 priorPosition=prop.supportGrip.localPosition;
            Quaternion priorRotation=prop.supportGrip.localRotation;
            bool priorCalibrated=prop.gripCalibrated,priorLeftHold=prop.calibratedForLeftHold;
            try
            {
                var originalHand=hand.position;
                var goal=originalHand+Vector3.up*.02f;
                prop.supportGrip.position=goal;prop.supportGrip.rotation=hand.rotation;
                prop.gripCalibrated=true;prop.calibratedForLeftHold=false;viewer.SetSupportIk(true);
                set.ikTool.SendMessage("Update",SendMessageOptions.RequireReceiver);
                actor.Update(0);
                Require(Vector3.Distance(hand.position,goal)<.008f&&Vector3.Distance(hand.position,originalHand)>.008f,
                    "Calibrated support-hand IK did not move to its test goal.");
                Require(set.ikTool.hand==IKHelperHand.LeftHand,"IK affected the holding hand instead of the support hand.");
            }
            finally
            {
                prop.gripCalibrated=priorCalibrated;prop.calibratedForLeftHold=priorLeftHold;
                prop.supportGrip.localPosition=priorPosition;prop.supportGrip.localRotation=priorRotation;
                viewer.SetSupportIk(false);viewer.SetWeapon(0);
                set.ikTool.SendMessage("Update",SendMessageOptions.RequireReceiver);
            }
            Require(set.props.All(p=>!p.instance.activeSelf)&&set.ikSwitch.localPosition==Vector3.zero,"None did not clear props/IK.");
            viewer.SetAutomaticProp(true);
        }
        [MenuItem("Orionis/Art/Capture live Toon Soldiers preview")]
        public static void CaptureLive()
        {
            Require(EditorApplication.isPlaying,"Run the Art Lab preview before capturing.");
            Require(SceneManager.GetActiveScene().path==ScenePath,"Open the Toon Soldiers preview first.");
            var animators=UnityEngine.Object.FindObjectsByType<Animator>(FindObjectsSortMode.None);
            Require(animators.Length>0&&animators.All(a=>a.GetCurrentAnimatorStateInfo(0).normalizedTime>0),"Visible preview controllers must be playing.");
            Capture(GameObject.Find("Toon Soldiers overhead camera").GetComponent<Camera>(),"live-preview.png");
            var report=JsonUtility.FromJson<Report>(File.ReadAllText(Path.Combine(Evidence,"validation.json")));
            report.liveRenderPassed=true;
            File.WriteAllText(Path.Combine(Evidence,"validation.json"),JsonUtility.ToJson(report,true)+"\n");
        }
        static void ConfigurePipeline()
        {
            const string pipelinePath="Assets/Orionis/Art/ToonSoldiersProof/ArtLabPipeline.asset";
            var pipeline=AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(pipelinePath);
            if(pipeline==null)
            {
                var renderer=ScriptableObject.CreateInstance<UniversalRendererData>();
                renderer.name="ArtLabForwardRenderer";
                AssetDatabase.CreateAsset(renderer,Output+"/ArtLabForwardRenderer.asset");
                pipeline=UniversalRenderPipelineAsset.Create(renderer);
                AssetDatabase.CreateAsset(pipeline,pipelinePath);
            }
            UnityEngine.Rendering.GraphicsSettings.defaultRenderPipeline=pipeline;
            QualitySettings.renderPipeline=pipeline;
            PlayerSettings.productName="Orionis Art Lab";
        }
        static AnimatorController Controller(string name,AnimationClip clip)
        {
            string path=Output+"/"+name+".controller";
            var c=AssetDatabase.LoadAssetAtPath<AnimatorController>(path)??AnimatorController.CreateAnimatorControllerAtPath(path);
            var sm=c.layers[0].stateMachine;
            var layers=c.layers;layers[0].iKPass=true;c.layers=layers;
            foreach(var s in sm.states) sm.RemoveState(s.state);
            var state=sm.AddState(name);
            state.motion=clip;
            sm.defaultState=state;
            // Repeat one-shot firing solely for this visual evaluation scene.
            if(!clip.isLooping)
            {
                var repeat=state.AddTransition(state);
                repeat.hasExitTime=true;
                repeat.exitTime=1;
                repeat.duration=0;
            }
            return c;
        }
        static void Pose(Animator animator,string state,float phase)
        { animator.Play(state,0,phase); animator.Update(0); }
        static Vector3[] Vertices(SkinnedMeshRenderer[] skins)
        {
            var vertices=new System.Collections.Generic.List<Vector3>();
            foreach(var skin in skins)
            {
                var mesh=new Mesh();
                try {skin.BakeMesh(mesh);vertices.AddRange(mesh.vertices);}
                finally {UnityEngine.Object.DestroyImmediate(mesh);}
            }
            return vertices.ToArray();
        }
        static void Capture(Camera cam,string filename)
        {
            var target=RenderTexture.GetTemporary(900,900,24);
            var previous=RenderTexture.active;
            var image=new Texture2D(900,900,TextureFormat.RGB24,false);
            try
            {
                cam.targetTexture=target;cam.Render();RenderTexture.active=target;
                image.ReadPixels(new Rect(0,0,900,900),0,0);image.Apply();
                File.WriteAllBytes(Path.Combine(Evidence,filename),image.EncodeToPNG());
                var pixels=image.GetPixels32();
                Require(pixels.Count(p=>p.r>220&&p.b>220&&p.g<35)<30,"Magenta shader failure.");
                Require(pixels.Count(p=>p.b>90&&p.b>p.r*1.3f)>500,"No visible blue soldier texture.");
            }
            finally
            {
                cam.targetTexture=null;RenderTexture.active=previous;RenderTexture.ReleaseTemporary(target);
                UnityEngine.Object.DestroyImmediate(image);
            }
        }
        static void Require(bool value,string message){if(!value)throw new InvalidOperationException(message);}
        [Serializable] class Report {public string unity,project;public ClipReport[] clips;public bool passed,liveRenderPassed;}
        sealed class GripAuthoring {public Vector3 position;public Quaternion rotation;public bool calibrated,leftHold;}
        [Serializable] class ViewerReport {public string project;public bool passed,propChecksPassed;public int clipCount,movingClips,propCount;public RetargetClip[] clips;}
        [Serializable] class RetargetClip {public string name,path;public float meshMotion;public string[] missingCustomPaths;}
        [Serializable] class ClipReport {public string name;public float seconds,meshMotion,height;public bool loop,humanoid;public int bones,triangles;}
    }
}
