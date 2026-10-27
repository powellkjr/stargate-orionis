using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Presentation;
using UnityEditor;
using UnityEditor.Animations;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Orionis.Editor
{
    public static class OffworldCharacterImporter
    {
        const string Pack="Assets/Toon_Soldiers/ToonSoldiers_2";
        const string Human="Assets/Kevin Iglesias/Human Animations";
        const string Output="Assets/Orionis/Resources/OffworldCharacters";
        [MenuItem("Orionis/Art/Rebuild offworld characters and motions")]
        public static void Build()
        {
            if(EditorApplication.isPlaying)throw new InvalidOperationException("Stop Play before rebuilding character assets.");
            Directory.CreateDirectory(Output);AssetDatabase.Refresh();
            var source=AssetDatabase.LoadAssetAtPath<GameObject>(Pack+"/prefabs/ToonSoldiers_infantry.prefab");if(source==null)throw new Exception("Stage the selected Art Lab dependencies first.");
            var humanoid=AssetDatabase.LoadAssetAtPath<GameObject>(Human+"/Models/HumanM_Model.fbx");
            AnimationClip Clip(string inputPath,string name,string output,bool loop=true)
            {
                var imported=AssetDatabase.LoadAllAssetsAtPath(inputPath).OfType<AnimationClip>().Single(c=>c.name==name);
                var clip=UnityEngine.Object.Instantiate(imported);clip.name=output;clip.events=Array.Empty<AnimationEvent>();var settings=AnimationUtility.GetAnimationClipSettings(clip);settings.loopTime=loop;AnimationUtility.SetAnimationClipSettings(clip,settings);clip.wrapMode=loop?WrapMode.Loop:WrapMode.ClampForever;
                string path=Output+"/"+output+".anim";var existing=AssetDatabase.LoadAssetAtPath<AnimationClip>(path);if(existing!=null){EditorUtility.CopySerialized(clip,existing);UnityEngine.Object.DestroyImmediate(clip);return existing;}AssetDatabase.CreateAsset(clip,path);return clip;
            }
            var idle=Clip(Human+"/Animations/Male/Idles/HumanM@Idle01.fbx","HumanM@Idle01","Idle");var walk=Clip(Human+"/Animations/Male/Movement/Walk/HumanM@Walk01_Forward.fbx","HumanM@Walk01_Forward","Walk");
            var motions=JObject.Parse(File.ReadAllText("../../artwork/toon-soldiers-proof/offworld-motion-picks.json")).Properties().ToDictionary(p=>p.Name,p=>Clip((string)p.Value["path"],(string)p.Value["clip"],p.Name,(bool)p.Value["loop"]));
            var controller=AssetDatabase.LoadAssetAtPath<AnimatorController>(Output+"/IdleWalk.controller");
            if(controller==null){controller=AnimatorController.CreateAnimatorControllerAtPath(Output+"/IdleWalk.controller");controller.AddParameter("Moving",AnimatorControllerParameterType.Bool);var machine=controller.layers[0].stateMachine;var still=machine.AddState("Idle");still.motion=idle;var moving=machine.AddState("Walk");moving.motion=walk;machine.defaultState=still;var begin=still.AddTransition(moving);begin.hasExitTime=false;begin.duration=.12f;begin.AddCondition(AnimatorConditionMode.If,0,"Moving");var stop=moving.AddTransition(still);stop.hasExitTime=false;stop.duration=.12f;stop.AddCondition(AnimatorConditionMode.IfNot,0,"Moving");}
            else foreach(var state in controller.layers[0].stateMachine.states)state.state.motion=state.state.name=="Walk"?walk:idle;
            var catalog=AssetDatabase.LoadAssetAtPath<OffworldCharacterCatalog>(Output+"/catalog.asset");if(catalog==null){catalog=ScriptableObject.CreateInstance<OffworldCharacterCatalog>();AssetDatabase.CreateAsset(catalog,Output+"/catalog.asset");}
            foreach(var pair in motions){var machine=controller.layers[0].stateMachine;var state=machine.states.FirstOrDefault(s=>s.state.name==pair.Key).state??machine.AddState(pair.Key);state.motion=pair.Value;}
            catalog.controller=controller;
            var mission=JObject.Parse(File.ReadAllText("../../demos/shared/data/offworld/missing-operative-001.finalized.json"));
            var archetypes=JObject.Parse(File.ReadAllText("../../demos/shared/data/offworld/archetypes.json"))["archetypes"]["instance"];
            var recipeArchetypes=JObject.Parse(File.ReadAllText("../../demos/shared/data/offworld/archetypes.json"))["archetypes"]["recipe"];
            catalog.actions=mission["recipes"].Select(r=>{var target=mission["interactionTargets"].Single(t=>(string)t["targetId"]==(string)r["targetId"]);var settings=(JObject)recipeArchetypes[(string)r["archetypeId"]]["defaults"].DeepClone();settings.Merge(r["overrides"]);return new OffworldActionPlacement{id=(string)r["recipeInstanceId"],target=(string)target["instanceId"],transition=(string)target["transitionId"],kind=(string)settings["actionType"]};}).ToArray();
            catalog.sceneActors=mission["instances"].Where(i=>i["mapPosition"]!=null).Select(i=>{
                string archetype=(string)i["archetypeId"];var defaults=archetypes[archetype]?["defaults"] as JObject??new JObject();var settings=(JObject)defaults.DeepClone();settings.Merge(i["overrides"],new JsonMergeSettings{MergeArrayHandling=MergeArrayHandling.Replace});
                string profile=archetype.StartsWith("npc_guard")?"GUARD":archetype=="npc_overseer"||archetype=="npc_security_supervisor"?"CAPTAIN":archetype.StartsWith("npc_")||archetype.StartsWith("patient_")?"WORKER":null;
                var condition=i["revealedWhen"];return new OffworldSceneActor{id=(string)i["instanceId"],stage=(string)i["stageId"],label=(string)settings["playerLabel"]??archetype.Replace('_',' '),profile=profile,point=new Vector2((float)i["mapPosition"]["x"],(float)i["mapPosition"]["y"]),conditional=condition!=null,requiredKnowledge=(string)condition?["factId"],conditionInstance=(string)condition?["instanceId"],conditionField=(string)condition?["field"],conditionValue=condition?["equals"]?.Type==JTokenType.Boolean&&(bool)condition["equals"]};
            }).ToArray();
            var layers=new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);var list=layers.FindProperty("layers");int layer=Enumerable.Range(8,24).Reverse().First(i=>string.IsNullOrEmpty(list.GetArrayElementAtIndex(i).stringValue)||list.GetArrayElementAtIndex(i).stringValue=="OffworldCharacters");list.GetArrayElementAtIndex(layer).stringValue="OffworldCharacters";layers.ApplyModifiedPropertiesWithoutUndo();catalog.renderLayer=layer;
            var pipeline=(UniversalRenderPipelineAsset)(QualitySettings.renderPipeline??GraphicsSettings.defaultRenderPipeline);if(pipeline==null)throw new Exception("Main URP asset missing.");
            var forward=AssetDatabase.LoadAssetAtPath<UniversalRendererData>(Output+"/OffworldForwardRenderer.asset");if(forward==null){forward=ScriptableObject.CreateInstance<UniversalRendererData>();AssetDatabase.CreateAsset(forward,Output+"/OffworldForwardRenderer.asset");}
            var pipelineData=new SerializedObject(pipeline);var renderers=pipelineData.FindProperty("m_RendererDataList");int rendererIndex=Enumerable.Range(0,renderers.arraySize).Where(i=>renderers.GetArrayElementAtIndex(i).objectReferenceValue==forward).DefaultIfEmpty(-1).First();if(rendererIndex<0){rendererIndex=renderers.arraySize;renderers.InsertArrayElementAtIndex(rendererIndex);renderers.GetArrayElementAtIndex(rendererIndex).objectReferenceValue=forward;pipelineData.ApplyModifiedPropertiesWithoutUndo();EditorUtility.SetDirty(pipeline);}catalog.rendererIndex=rendererIndex;
            var profiles=JObject.Parse(File.ReadAllText("../../artwork/toon-soldiers-proof/profession-picks.json"))["professions"].ToArray();
            catalog.profiles=profiles.Select(profile=>
            {
                string label=(string)profile["label"],profession=label=="Medical"?"MEDIC":label.ToUpperInvariant();string body=(string)profile["body"],head=(string)profile["head"],backpack=(string)profile["backpack"],palette=(string)profile["palette"];
                var obj=UnityEngine.Object.Instantiate(source);obj.name=profession;obj.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);
                try{
                    foreach(var behaviour in obj.GetComponentsInChildren<MonoBehaviour>(true))UnityEngine.Object.DestroyImmediate(behaviour);
                    var actor=obj.GetComponentInChildren<Animator>();if(actor==null||actor.avatar==null||!actor.avatar.isHuman)throw new Exception("Invalid modular Humanoid avatar.");actor.runtimeAnimatorController=controller;actor.applyRootMotion=false;actor.fireEvents=false;actor.cullingMode=AnimatorCullingMode.AlwaysAnimate;
                    var texture=AssetDatabase.LoadAssetAtPath<Texture2D>(Pack+"/models/Materials/textures/ToonSoldiers_texture_"+palette+".tga");if(texture==null)throw new Exception("Missing selected palette "+palette);
                    string matPath=Output+"/"+palette+".mat";var material=AssetDatabase.LoadAssetAtPath<Material>(matPath);if(material==null){material=new Material(Shader.Find("Universal Render Pipeline/Unlit"));AssetDatabase.CreateAsset(material,matPath);}material.SetTexture("_BaseMap",texture);material.SetColor("_BaseColor",Color.white);
                    bool Ancestor(Transform t,string name){while(t!=null&&t!=obj.transform){if(t.name==name)return true;t=t.parent;}return false;}
                    var chosen=obj.GetComponentsInChildren<Renderer>(true).Where(r=>r.name==body||r.name==head||Ancestor(r.transform,"weapon_assault_rifle_A")||!string.IsNullOrEmpty(backpack)&&Ancestor(r.transform,backpack)).ToArray();
                    if(!chosen.Any(r=>r.name==body)||!chosen.Any(r=>r.name==head))throw new Exception("Outfit mesh missing for "+label);
                    foreach(var renderer in obj.GetComponentsInChildren<Renderer>(true))if(!chosen.Contains(renderer)){var filter=renderer.GetComponent<MeshFilter>();if(filter!=null)UnityEngine.Object.DestroyImmediate(filter);UnityEngine.Object.DestroyImmediate(renderer);}
                    foreach(var renderer in chosen){for(var t=renderer.transform;t!=null&&t!=obj.transform.parent;t=t.parent)t.gameObject.SetActive(true);renderer.enabled=true;renderer.sharedMaterials=Enumerable.Repeat(material,renderer.sharedMaterials.Length).ToArray();if(renderer is SkinnedMeshRenderer skin){skin.updateWhenOffscreen=true;skin.forceMatrixRecalculationPerRender=true;}}
                    foreach(var renderer in chosen.Where(r=>Ancestor(r.transform,"weapon_assault_rifle_A")))renderer.gameObject.SetActive(false);
                    var proxy=humanoid.GetComponentsInChildren<Transform>(true).Single(t=>t.name=="B-spineProxy");var target=actor.transform;var reference=humanoid.transform;foreach(string part in AnimationUtility.CalculateTransformPath(proxy,humanoid.transform).Split('/')){reference=reference.Find(part);var child=target.Find(part);if(child==null){child=new GameObject(part).transform;child.SetParent(target,false);child.localPosition=reference.localPosition;child.localRotation=reference.localRotation;child.localScale=reference.localScale;}target=child;}
                    var binding=obj.AddComponent<OffworldRigBindings>();binding.nativeSpine=actor.GetBoneTransform(HumanBodyBones.Spine);binding.spineProxy=target;binding.spineRestOffset=Quaternion.Inverse(target.rotation)*binding.nativeSpine.rotation;
                    foreach(var t in obj.GetComponentsInChildren<Transform>(true))t.gameObject.layer=layer;
                    string path=Output+"/"+profession+".prefab";var prefab=PrefabUtility.SaveAsPrefabAsset(obj,path);return new OffworldCharacterProfile{profession=profession,prefab=prefab};
                }finally{UnityEngine.Object.DestroyImmediate(obj);}
            }).ToArray();
            EditorUtility.SetDirty(catalog);AssetDatabase.SaveAssets();
            File.WriteAllText("Logs/offworld-character-import.json",Newtonsoft.Json.JsonConvert.SerializeObject(new{profiles=catalog.profiles.Select(p=>p.profession),clips=new[]{idle.name,walk.name}.Concat(motions.Keys),layer,rendererIndex}));
        }
    }
}
