using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Orionis.Editor
{
    // An isolated visual proof: never touches Bootstrap, campaign state or build scenes.
    public static class TechnicianProofPreview
    {
        const string Folder = "Assets/Orionis/Art/TechnicianProof";
        const string Model = Folder + "/Technician_Original.fbx";
        public const string ScenePath = Folder + "/TechnicianProof.unity";
        static string Evidence => Path.GetFullPath("../../artwork/technician-proof");

        [MenuItem("Orionis/Art/Build and verify Technician proof")]
        public static void BuildAndVerify()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode)
                throw new InvalidOperationException("Stop Play before generating the isolated proof.");
            Directory.CreateDirectory(Evidence);
            File.Delete(Path.Combine(Evidence,"unity-validation.json"));
            AssetDatabase.Refresh();
            var importer = (ModelImporter)AssetImporter.GetAtPath(Model);
            importer.animationType = ModelImporterAnimationType.Generic;
            importer.avatarSetup = ModelImporterAvatarSetup.CreateFromThisModel;
            importer.importAnimation = true;
            importer.materialImportMode = ModelImporterMaterialImportMode.ImportStandard;
            importer.SaveAndReimport();
            var clips = AssetDatabase.LoadAllAssetsAtPath(Model).OfType<AnimationClip>()
                .Where(c => !c.name.StartsWith("__preview__", StringComparison.Ordinal)).ToArray();
            var settings = importer.defaultClipAnimations;
            foreach (var clip in settings)
            {
                clip.name = clip.name.IndexOf("Walk", StringComparison.OrdinalIgnoreCase) >= 0 ? "Walk" : "Idle";
                clip.loopTime = true;
                clip.loopPose = true;
                clip.lockRootPositionXZ = true;
                clip.lockRootHeightY = true;
            }
            Require(settings.Length == 2, "Expected exactly two original animation takes.");
            importer.clipAnimations = settings;
            importer.SaveAndReimport();
            clips = AssetDatabase.LoadAllAssetsAtPath(Model).OfType<AnimationClip>()
                .Where(c => c.name == "Idle" || c.name == "Walk").ToArray();
            Require(clips.Length == 2 && clips.All(c => c.isLooping), "Both clips must import and loop.");
            var idle = clips.Single(c => c.name == "Idle");
            var walk = clips.Single(c => c.name == "Walk");
            Require(Mathf.Abs(idle.length - 2) < .05f && Mathf.Abs(walk.length - 1) < .05f,
                "Unexpected animation durations.");

            var previousScene = SceneManager.GetActiveScene();
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Additive);
            SceneManager.SetActiveScene(scene);
            try
            {
                var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(Model);
                var a = (GameObject)PrefabUtility.InstantiatePrefab(prefab, scene);
                a.name = "Original Technician - Idle";
                var b = (GameObject)PrefabUtility.InstantiatePrefab(prefab, scene);
                b.name = "Original Technician - Walk (in place)";
                // Camera faces -Z, so its screen-right points toward world -X.
                a.transform.position = new Vector3(.68f,0,0);
                b.transform.position = new Vector3(-.68f,0,0);
                RemapMaterials(a);
                RemapMaterials(b);
                var skin = a.GetComponentInChildren<SkinnedMeshRenderer>();
                Require(skin != null && skin.bones.Length >= 17, "Missing skeletal skin/bones.");
                // FBX/Unity split vertices at hard normals and material boundaries.
                var sourceMetrics = JsonUtility.FromJson<SourceReport>(File.ReadAllText(Path.Combine(Evidence,"blender-validation.json")));
                Require(skin.sharedMesh.triangles.Length / 3 == sourceMetrics.triangles, "Unexpected original mesh triangle count.");
                Require(skin.sharedMesh.boneWeights.All(w => Mathf.Abs(w.weight0+w.weight1+w.weight2+w.weight3-1) < .001f),
                    "Unweighted or non-normalized mesh vertices.");
                Require(skin.bounds.size.y > 1.7f && skin.bounds.size.y < 1.95f, "Model is not human scale.");
                float idleMotion = Motion(a, skin, idle);
                float walkMotion = Motion(a, skin, walk);
                Require(idleMotion > .001f && walkMotion > .05f, "Clips must deform the mesh, not just a root.");
                foreach (var clip in clips)
                {
                    var first = Vertices(a,skin,clip,0);
                    var last = Vertices(a,skin,clip,clip.length);
                    Require(MaxDelta(first,last) < .002f, clip.name + " loop has a discontinuity.");
                }
                SetupAnimator(a,Controller("Idle",idle));
                SetupAnimator(b,Controller("Walk",walk));
                float idleAnimatorMotion = AnimatorMotion(a);
                float walkAnimatorMotion = AnimatorMotion(b);
                Require(idleAnimatorMotion > .001f && walkAnimatorMotion > .05f,"Animator controllers must deform the mesh.");
                idle.SampleAnimation(a,0);
                walk.SampleAnimation(b,0);
                var cam = new GameObject("Technician overhead preview camera").AddComponent<Camera>();
                cam.orthographic = true;
                cam.orthographicSize = 1.6f;
                cam.clearFlags = CameraClearFlags.SolidColor;
                cam.backgroundColor = new Color(.075f,.09f,.12f,1);
                cam.nearClipPlane = .05f;
                cam.farClipPlane = 30;
                cam.transform.position = new Vector3(0,4,3);
                cam.transform.LookAt(new Vector3(0,.8f,0));
                var light = new GameObject("Proof key light").AddComponent<Light>();
                light.type = LightType.Directional;
                light.intensity = 1.2f;
                light.transform.rotation = Quaternion.Euler(40,-35,0);
                var fill = new GameObject("Proof fill light").AddComponent<Light>();
                fill.type = LightType.Directional;
                fill.intensity = .55f;
                fill.transform.rotation = Quaternion.Euler(30,140,0);
                EditorSceneManager.SaveScene(scene,ScenePath);
                a.GetComponent<Animator>().enabled = false;
                b.GetComponent<Animator>().enabled = false;
                for (int i=0;i<4;i++)
                {
                    idle.SampleAnimation(a,i*.25f);
                    walk.SampleAnimation(b,i*.25f);
                    Render(cam,"unity-overhead-"+i+".png",a,b);
                }
                cam.transform.position = new Vector3(0,5,0);
                cam.transform.rotation = Quaternion.Euler(90,180,0);
                cam.orthographicSize = 1.3f;
                Render(cam,"unity-direct-overhead.png",a,b);
                Require(!File.ReadAllBytes(Path.Combine(Evidence,"unity-overhead-0.png"))
                    .SequenceEqual(File.ReadAllBytes(Path.Combine(Evidence,"unity-overhead-1.png"))),"Walk render phases must differ.");
                File.WriteAllText(Path.Combine(Evidence,"unity-validation.json"),
                    JsonUtility.ToJson(new Report { unity=global::UnityEngine.Application.unityVersion, bones=skin.bones.Length,
                        vertices=skin.sharedMesh.vertexCount,idleSeconds=idle.length,walkSeconds=walk.length,
                        idleMeshMotion=idleMotion,walkMeshMotion=walkMotion,
                        idleAnimatorMotion=idleAnimatorMotion,walkAnimatorMotion=walkAnimatorMotion,passed=true },true)+"\n");
                AssetDatabase.SaveAssets();
                Debug.Log("Technician proof PASS: 2 looping skeletal clips; weights, scale, deformation, loop closure and 5 renders verified.");
            }
            finally
            {
                if (previousScene.IsValid() && previousScene.isLoaded) SceneManager.SetActiveScene(previousScene);
                EditorSceneManager.CloseScene(scene,true);
            }
        }

        [MenuItem("Orionis/Art/Open Technician proof")]
        public static void Open()
        {
            if (EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())
                EditorSceneManager.OpenScene(ScenePath);
        }

        static AnimatorController Controller(string name, AnimationClip clip)
        {
            string path = Folder+"/"+name+".controller";
            var controller = AssetDatabase.LoadAssetAtPath<AnimatorController>(path);
            if (controller == null) controller = AnimatorController.CreateAnimatorControllerAtPath(path);
            var sm = controller.layers[0].stateMachine;
            foreach (var state in sm.states) sm.RemoveState(state.state);
            var s = sm.AddState(name);
            s.motion = clip;
            sm.defaultState = s;
            return controller;
        }

        static void SetupAnimator(GameObject obj, RuntimeAnimatorController controller)
        {
            var animator = obj.GetComponent<Animator>() ?? obj.AddComponent<Animator>();
            var avatar = AssetDatabase.LoadAllAssetsAtPath(Model).OfType<Avatar>().SingleOrDefault();
            Require(avatar != null && avatar.isValid,"Missing valid Generic avatar.");
            animator.avatar = avatar;
            animator.applyRootMotion = false;
            animator.cullingMode = AnimatorCullingMode.AlwaysAnimate;
            animator.runtimeAnimatorController = controller;
        }

        static void RemapMaterials(GameObject obj)
        {
            // Explicit lit solids: source has no reference texture dependency.
            var shader = Shader.Find(UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline == null
                ? "Standard" : "Universal Render Pipeline/Lit");
            Require(shader != null,"Proof material shader missing.");
            foreach (var renderer in obj.GetComponentsInChildren<Renderer>())
                renderer.sharedMaterials = renderer.sharedMaterials.Select(source =>
                {
                    var name = source.name;
                    string path = Folder+"/"+name+".mat";
                    var mat = AssetDatabase.LoadAssetAtPath<Material>(path);
                    if (mat == null)
                    {
                        mat = new Material(shader) { name=name, color=source.color };
                        if (mat.HasProperty("_Smoothness")) mat.SetFloat("_Smoothness",.18f);
                        if (mat.HasProperty("_Glossiness")) mat.SetFloat("_Glossiness",.18f);
                        AssetDatabase.CreateAsset(mat,path);
                    }
                    return mat;
                }).ToArray();
        }

        static Vector3[] Vertices(GameObject obj, SkinnedMeshRenderer skin, AnimationClip clip, float time)
        {
            clip.SampleAnimation(obj,time);
            var mesh = new Mesh();
            skin.BakeMesh(mesh);
            var verts = mesh.vertices;
            UnityEngine.Object.DestroyImmediate(mesh);
            return verts;
        }
        static float Motion(GameObject obj, SkinnedMeshRenderer skin, AnimationClip clip) =>
            MaxDelta(Vertices(obj,skin,clip,0),Vertices(obj,skin,clip,clip.length*.25f));
        static float AnimatorMotion(GameObject obj)
        {
            var animator=obj.GetComponent<Animator>();
            var skin=obj.GetComponentInChildren<SkinnedMeshRenderer>();
            var mesh=new Mesh();
            try
            {
                animator.Rebind();
                animator.Update(0);
                skin.BakeMesh(mesh);
                var first=mesh.vertices;
                animator.Update(.25f);
                skin.BakeMesh(mesh);
                return MaxDelta(first,mesh.vertices);
            }
            finally { UnityEngine.Object.DestroyImmediate(mesh); }
        }
        static float MaxDelta(Vector3[] a, Vector3[] b) => a.Zip(b,(x,y)=>Vector3.Distance(x,y)).Max();
        static void Require(bool value, string message) { if(!value) throw new InvalidOperationException(message); }
        static void Render(Camera cam,string filename,params GameObject[] models)
        {
            var rt = RenderTexture.GetTemporary(800,800,24);
            var previous = RenderTexture.active;
            var image = new Texture2D(800,800,TextureFormat.RGB24,false);
            var skins = models.SelectMany(m=>m.GetComponentsInChildren<SkinnedMeshRenderer>()).ToArray();
            var snapshots = new System.Collections.Generic.List<GameObject>();
            var meshes = new System.Collections.Generic.List<Mesh>();
            try
            {
                // Unity caches GPU skinning within a frame. Bake the sampled pose
                // for each capture so synchronous editor renders show distinct phases.
                foreach(var skin in skins)
                {
                    var mesh=new Mesh();
                    skin.BakeMesh(mesh);
                    meshes.Add(mesh);
                    var snapshot=new GameObject("Temporary sampled pose");
                    snapshots.Add(snapshot);
                    snapshot.transform.SetParent(skin.transform,false);
                    // FBX retains a 100x transform; BakeMesh returns scaled positions.
                    var scale=skin.transform.lossyScale;
                    snapshot.transform.localScale=new Vector3(1/scale.x,1/scale.y,1/scale.z);
                    snapshot.AddComponent<MeshFilter>().sharedMesh=mesh;
                    snapshot.AddComponent<MeshRenderer>().sharedMaterials=skin.sharedMaterials;
                    skin.enabled=false;
                }
                cam.targetTexture = rt;
                cam.Render();
                RenderTexture.active = rt;
                image.ReadPixels(new Rect(0,0,800,800),0,0);
                image.Apply();
                File.WriteAllBytes(Path.Combine(Evidence,filename),image.EncodeToPNG());
                var pixels=image.GetPixels32();
                // Background-only and magenta shader-failure frames must fail.
                Require(pixels.Count(p => p.r>p.b*1.3f && p.r>90 && p.g>40) > 10,"No visible orange Technician accents in render.");
                Require(pixels.Count(p => p.r>220 && p.b>220 && p.g<35) < 50,"Magenta material failure in render.");
            }
            finally
            {
                cam.targetTexture=null;
                RenderTexture.active=previous;
                RenderTexture.ReleaseTemporary(rt);
                UnityEngine.Object.DestroyImmediate(image);
                foreach(var snapshot in snapshots) UnityEngine.Object.DestroyImmediate(snapshot);
                foreach(var mesh in meshes) UnityEngine.Object.DestroyImmediate(mesh);
                foreach(var skin in skins) skin.enabled=true;
            }
        }
        [Serializable] class Report
        {
            public string unity;
            public int bones,vertices;
            public float idleSeconds,walkSeconds,idleMeshMotion,walkMeshMotion;
            public float idleAnimatorMotion,walkAnimatorMotion;
            public bool passed;
        }
        [Serializable] class SourceReport { public int triangles; }
    }
}
