using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;
using Orionis.ArtLab;

namespace Orionis.Editor
{
    public static class CharacterPartsBuilder
    {
        static string Evidence=>Path.GetFullPath("../../artwork/toon-soldiers-proof");
        public static void Build(GameActionPreview view,string pack)
        {
            var panel=view.gameObject.AddComponent<CharacterPartsPanel>();panel.preview=view;view.parts=panel;
            panel.bodies=view.sourceRenderers.Where(r=>r.name.StartsWith("TS_Body_",StringComparison.Ordinal)).Select(r=>r.name).OrderBy(n=>n).ToArray();
            panel.heads=view.sourceRenderers.Where(r=>r.name.StartsWith("TS_Head_",StringComparison.Ordinal)).Select(r=>r.name).OrderBy(n=>n).ToArray();
            GameObject[] Attach(string folder,string prefix,string socketName)
            {
                var socket=view.actor.GetComponentsInChildren<Transform>(true).Single(t=>t.name==socketName);
                return AssetDatabase.FindAssets("t:Model",new[]{pack+"/models/"+folder}).Select(AssetDatabase.GUIDToAssetPath).OrderBy(p=>p)
                    .Where(p=>Path.GetFileNameWithoutExtension(p).StartsWith(prefix,StringComparison.Ordinal)).Select(p=>
                    {
                        var source=AssetDatabase.LoadAssetAtPath<GameObject>(p);
                        var obj=(GameObject)PrefabUtility.InstantiatePrefab(source,socket);
                        obj.name=Path.GetFileNameWithoutExtension(p);obj.transform.localPosition=Vector3.zero;
                        obj.transform.localRotation=Quaternion.identity;obj.transform.localScale=Vector3.one;
                        obj.SetActive(false);return obj;
                    }).ToArray();
            }
            panel.backpacks=Attach("backpacks","backpack_","Backpack_container");
            panel.weapons=Attach("weapons","weapon_","WeaponContainer");
            panel.colors=AssetDatabase.FindAssets("t:Material",new[]{pack+"/models/Materials/Color"})
                .Select(AssetDatabase.GUIDToAssetPath).OrderBy(p=>p).Select(AssetDatabase.LoadAssetAtPath<Material>).ToArray();
            AdditionalPropBuilder.Build(panel,pack);
            File.WriteAllText(Path.Combine(Evidence,"parts-catalog.json"),JsonUtility.ToJson(new Catalog{
                bodies=panel.bodies,heads=panel.heads,backpacks=panel.backpacks.Select(o=>o.name).ToArray(),
                handProps=panel.weapons.Select(o=>o.name).ToArray(),colors=panel.colors.Select(AssetDatabase.GetAssetPath).ToArray()},true));
        }
        public static void Verify()
        {
            Require(EditorApplication.isPlaying,"Play the Art Lab preview first.");
            var view=UnityEngine.Object.FindFirstObjectByType<GameActionPreview>();var panel=view.parts;
            var originalColors=panel.colors.Select(m=>EditorJsonUtility.ToJson(m)).ToArray();
            var clip=view.CurrentClip;int profession=view.ProfessionIndex;
            foreach(int i in Enumerable.Range(0,panel.bodies.Length))
            {
                panel.SelectBody(i);view.Sample(.35f);
                Require(view.sourceRenderers.Count(r=>r.enabled&&r.gameObject.activeInHierarchy)==2,"Body parts stacked.");
                var skin=view.sourceRenderers.OfType<SkinnedMeshRenderer>().Single(r=>r.name==panel.bodies[i]);
                var mesh=new Mesh();try{skin.BakeMesh(mesh);Require(mesh.vertexCount>0&&mesh.vertices.All(v=>float.IsFinite(v.x)&&float.IsFinite(v.y)&&float.IsFinite(v.z)),"Invalid part mesh.");}finally{UnityEngine.Object.DestroyImmediate(mesh);}
            }
            for(int i=0;i<panel.heads.Length;i++){panel.SelectHead(i);view.Sample(.35f);Require(view.sourceRenderers.Count(r=>r.enabled&&r.gameObject.activeInHierarchy)==2,"Head parts stacked.");}
            for(int i=0;i<=panel.backpacks.Length;i++){panel.SelectBackpack(i);Require(panel.backpacks.Count(o=>o.activeSelf)==(i==0?0:1),"Backpacks stacked.");}
            view.SetEquipment(1);
            for(int i=1;i<=panel.weapons.Length;i++){panel.SelectWeapon(i);Require(view.EquipmentIndex==0&&panel.weapons.Count(o=>o.activeSelf)==1,"Weapons stacked.");}
            view.SetEquipment(2);Require(panel.weapons.All(o=>!o.activeSelf),"Action equipment did not replace inspection prop.");
            for(int i=1;i<=panel.colors.Length;i++)
            {
                panel.SetColors(i,0);
                Require(view.sourceRenderers.Where(r=>r.name.StartsWith("TS_Body_",StringComparison.Ordinal)).All(r=>r.sharedMaterials.All(m=>m==panel.colors[i-1])),"Body color not assigned.");
                panel.SetColors(0,i);
                Require(view.sourceRenderers.Where(r=>r.name.StartsWith("TS_Head_",StringComparison.Ordinal)).All(r=>r.sharedMaterials.All(m=>m==panel.colors[i-1])),"Head color not assigned.");
            }
            Require(panel.colors.Select(m=>EditorJsonUtility.ToJson(m)).SequenceEqual(originalColors),"Vendor materials changed.");
            Require(view.CurrentClip==clip,"Parts changed the current animation.");
            for(int i=1;i<=panel.referenceProps.Length;i++)
            {
                panel.SelectReferenceProp(i);var prop=panel.referenceProps[i-1];
                Require(prop.instance.activeInHierarchy,"Reference prop missing.");
                Require(panel.weapons.All(o=>!o.activeSelf),"Inspection hand prop leaked into reference display.");
                Require(panel.referenceProps.Where(p=>p.reviewedEquipment==0).Count(p=>p.instance.activeSelf)==(prop.reviewedEquipment==0?1:0),"Reference props stacked.");
                Require(prop.instance.GetComponentsInChildren<MonoBehaviour>(true).All(b=>b==null||!b.enabled),"Vendor demo behaviour is active.");
                if(prop.reviewedEquipment==0)
                {
                    panel.SetPropRotation(90);
                    Require(prop.instance.GetComponentsInChildren<Renderer>().All(r=>float.IsFinite(r.bounds.center.x)&&float.IsFinite(r.bounds.center.y)&&float.IsFinite(r.bounds.center.z)),"Staged rotation produced invalid bounds.");
                    panel.SetPropRotation(0);
                }
            }
            view.SelectAction(0);Require(panel.ReferenceIndex==0&&panel.referenceProps.Where(p=>p.reviewedEquipment==0).All(p=>!p.instance.activeSelf),"Action did not clear staged prop.");
            panel.RestoreProfession();var profile=view.professions[profession];
            int expectedColor=Array.FindIndex(panel.colors,m=>m.name=="ToonSoldiers_"+profile.palette)+1;
            int expectedPack=Array.FindIndex(panel.backpacks,o=>o.name==profile.backpack)+1;
            Require(view.bodyName==profile.body&&view.headName==profile.head&&panel.BodyColor==expectedColor&&panel.HeadColor==expectedColor&&panel.BackpackIndex==expectedPack&&panel.WeaponIndex==0,"Profession appearance did not restore.");
            File.WriteAllText(Path.Combine(Evidence,"parts-validation.json"),JsonUtility.ToJson(new Result{passed=true,bodies=panel.bodies.Length,heads=panel.heads.Length,backpacks=panel.backpacks.Length,handProps=panel.weapons.Length,colors=panel.colors.Length,additionalProps=panel.referenceProps.Length},true));
        }
        static void Require(bool ok,string message){if(!ok)throw new InvalidOperationException(message);}
        [Serializable] class Catalog{public string[] bodies,heads,backpacks,handProps,colors;}
        [Serializable] class Result{public bool passed;public int bodies,heads,backpacks,handProps,colors,additionalProps;}
    }
}
