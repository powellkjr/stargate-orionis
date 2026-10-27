using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;
using Orionis.ArtLab;

namespace Orionis.Editor
{
    public static class AdditionalPropBuilder
    {
        public static void Build(CharacterPartsPanel panel,string pack)
        {
            string human="Assets/Kevin Iglesias/Human Animations";
            var paths=AssetDatabase.FindAssets("t:Prefab",new[]{human}).Select(AssetDatabase.GUIDToAssetPath)
                .Where(p=>p.Contains("/Prefabs/Weapons/")||p.Contains("/Prefabs/Tools/")||p.Contains("/Prefabs/Props/")||Path.GetFileName(p).StartsWith("HumanArcher_",StringComparison.Ordinal))
                .Concat(AssetDatabase.FindAssets("t:Model",new[]{pack+"/models/extra_models"}).Select(AssetDatabase.GUIDToAssetPath).Where(p=>!p.Contains("/animation/")))
                .Distinct().OrderBy(p=>p).ToArray();
            var root=new GameObject("Additional prop references").transform;
            panel.referenceProps=paths.Select(p=>
            {
                var asset=AssetDatabase.LoadAssetAtPath<GameObject>(p);
                if(asset==null||asset.GetComponentsInChildren<Animator>(true).Any(a=>a.avatar!=null&&a.avatar.isHuman)||!asset.GetComponentsInChildren<Renderer>(true).Any())return null;
                string stem=Path.GetFileNameWithoutExtension(p);
                int reviewed=p.Contains("/Human Crafting Animations/")?(stem=="Human_Hammer"?2:stem=="Human_Pickaxe"?3:stem=="Human_FishingPole"?4:0):0;
                string category=p.Contains("/Human Crafting")?"Crafting":p.Contains("/Human Melee")?"Melee":p.Contains("/Human Soldier")?"Soldier":p.Contains("/Human Archer")?"Archer":p.Contains("/Human Throwing")?"Throwing":"Toon items";
                GameObject instance;
                if(reviewed>0)instance=panel.preview.equipment[reviewed-1];
                else
                {
                    instance=(GameObject)PrefabUtility.InstantiatePrefab(asset,root);
                    instance.name=category+" / "+stem;
                    // Animated scenery (for example the ammo crate) is shown in its rest pose.
                    foreach(var animator in instance.GetComponentsInChildren<Animator>(true))UnityEngine.Object.DestroyImmediate(animator);
                    foreach(var behaviour in instance.GetComponentsInChildren<MonoBehaviour>(true))if(behaviour!=null)behaviour.enabled=false;
                    foreach(var renderer in instance.GetComponentsInChildren<Renderer>(true))
                        renderer.sharedMaterials=renderer.sharedMaterials.Select(PreviewMaterial).ToArray();
                    var renderers=instance.GetComponentsInChildren<Renderer>();var bounds=renderers[0].bounds;
                    foreach(var r in renderers.Skip(1))bounds.Encapsulate(r.bounds);
                    float scale=.75f/Mathf.Max(bounds.size.x,Mathf.Max(bounds.size.y,bounds.size.z));
                    instance.transform.localScale*=scale;
                    bounds=renderers[0].bounds;foreach(var r in renderers.Skip(1))bounds.Encapsulate(r.bounds);
                    instance.transform.position+=new Vector3(.85f-bounds.center.x,-bounds.min.y,-bounds.center.z);
                    instance.SetActive(false);
                }
                return new PreviewReferenceProp{label=category+" / "+stem.Replace("Human_","").Replace("HumanArcher_",""),path=p,instance=instance,reviewedEquipment=reviewed,stageRotation=instance.transform.rotation};
            }).Where(p=>p!=null).ToArray();
            File.WriteAllText("../../artwork/toon-soldiers-proof/additional-props-catalog.json",JsonUtility.ToJson(new Catalog{props=panel.referenceProps.Select(p=>new Row{label=p.label,path=p.path,reviewedHandFit=p.reviewedEquipment>0}).ToArray()},true));
        }
        static Material PreviewMaterial(Material source)
        {
            if(source==null||source.shader==null||source.shader.name.StartsWith("Universal Render Pipeline/",StringComparison.Ordinal))return source;
            const string output="Assets/Orionis/Art/GameActions/PropMaterials";
            Directory.CreateDirectory(output);AssetDatabase.Refresh();
            string path=output+"/"+AssetDatabase.AssetPathToGUID(AssetDatabase.GetAssetPath(source))+".mat";
            var material=AssetDatabase.LoadAssetAtPath<Material>(path);
            if(material==null)
            {
                material=new Material(Shader.Find("Universal Render Pipeline/Lit"));
                if(source.HasProperty("_MainTex"))material.SetTexture("_BaseMap",source.GetTexture("_MainTex"));
                if(source.HasProperty("_Color"))material.SetColor("_BaseColor",source.GetColor("_Color"));
                AssetDatabase.CreateAsset(material,path);
            }
            return material;
        }
        [Serializable] class Catalog{public Row[] props;}
        [Serializable] class Row{public string label,path;public bool reviewedHandFit;}
    }
}
