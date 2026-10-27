using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using Orionis.ArtLab;

namespace Orionis.Editor
{
    public static class AdditionalAnimationReview
    {
        const string Root="Assets/CaD_vol1/Animations";
        static string Evidence=>Path.GetFullPath("../../artwork/toon-soldiers-proof");
        static readonly string[] Social={"Hi1","Hi2","Nod1","Nod2","ShakeHead","Why1","Why2",
            "GuideWithRightHand01","GuideWithLeftHand01","GuideWithBothHands01","Warning","Stop",
            "CallSomeoneByRightHand","Salut1","Salut2","LookingAround","Waiting1","Waiting2",
            "PickUp01","PickUp02","Applaud","Bow1","ScratchHead","OMG1","BackPain1","TouchTheBelly"};
        static readonly string[] Combat={"DodgeDown01","DodgeRight01","DualHandHeadGuard01","LightHit01","KnockDown01"};
        public static AnimationClip[] Clips()=>ToonSoldiersProofPreview.AvailableHumanoidClips()
            .Where(c=>AssetDatabase.GetAssetPath(c).StartsWith(Root+"/",StringComparison.Ordinal)).ToArray();
        public static string Label(AnimationClip clip)=>clip.name=="Unreal Take"?Path.GetFileNameWithoutExtension(AssetDatabase.GetAssetPath(clip)):clip.name;
        static bool Recommended(string name)=>Social.Contains(name.Replace("CA_",""))||Combat.Contains(name.Replace("BA_",""));
        static string Reason(string name)
        {
            if(name.Contains("Salut"))return "Guard / Soldier / Captain greeting or acknowledgement study.";
            if(name.Contains("PickUp"))return "Worker / Technician / Scientist pickup study; target placement still needed.";
            if(name.Contains("BackPain")||name.Contains("Belly"))return "Visible discomfort study; does not represent medical treatment.";
            if(name.Contains("Guide")||name.Contains("Warning")||name.Contains("Stop")||name.Contains("CallSomeone"))return "Directions / warning / briefing gesture for party and NPC communication.";
            if(name.StartsWith("BA_",StringComparison.Ordinal))return Recommended(name)?"Unarmed defensive/reaction study; no combat rule or root-motion travel added.":"Not shortlisted: weapon fit, fantasy magic or elaborate melee choreography outside the current game-art needs.";
            if(new[]{"Chair","SitOn","SitIn","Lean","Cane","Board","Phone","Drinking","Smoking"}.Any(name.Contains))return "Needs a fitted prop or scene surface; no matching prop is supplied by this pack.";
            if(new[]{"Kiss","Dogeza","Beg","Taming"}.Any(name.Contains))return "Optional tone-specific social motion; not selected for the initial game shortlist.";
            return Recommended(name)?"Shared conversation / acknowledgement / ambient NPC gesture study.":"Optional source variation; available in the full library for review.";
        }
        public static void Append(List<PreviewGameAction> actions)
        {
            var clips=Clips();
            foreach(string name in Social.Select(s=>"CA_"+s).Concat(Combat.Select(s=>"BA_"+s)))
            {
                var clip=clips.SingleOrDefault(c=>Label(c)==name);
                if(clip==null)throw new InvalidOperationException("Missing new-pack clip: "+name);
                actions.Add(new PreviewGameAction{clip=clip,label=name,group=name.StartsWith("CA_",StringComparison.Ordinal)?"Dialogue · gestures":"New combat · defensive studies",
                    oneShot=!clip.isLooping,auxiliaryRig=false,equipment=0,notes=Reason(name)});
            }
            File.WriteAllText(Path.Combine(Evidence,"cad-use-review.json"),JsonUtility.ToJson(new Review{clips=clips.Select(c=>new Row{
                label=Label(c),path=AssetDatabase.GetAssetPath(c),recommended=Recommended(Label(c)),reason=Reason(Label(c))}).ToArray()},true));
        }
        public static void Verify()
        {
            if(!EditorApplication.isPlaying)throw new InvalidOperationException("Play Art Lab first.");
            var view=UnityEngine.Object.FindFirstObjectByType<GameActionPreview>();
            var skin=view.sourceRenderers.OfType<SkinnedMeshRenderer>().Single(r=>r.name==view.bodyName);
            var rows=new List<Sample>();
            foreach(var clip in Clips())
            {
                int index=Array.IndexOf(view.library,clip);if(index<0)throw new InvalidOperationException("New source missing from library.");
                view.SelectLibraryClip(index);view.Sample(.15f);var a=Bake(skin);view.Sample(.75f);var b=Bake(skin);
                if(b.Any(p=>!float.IsFinite(p.x)||!float.IsFinite(p.y)||!float.IsFinite(p.z)))throw new InvalidOperationException("Invalid pose: "+Label(clip));
                if(view.EquipmentIndex!=0||view.parts.WeaponIndex!=0||view.parts.ReferenceIndex!=0)throw new InvalidOperationException("Props leaked into new clip.");
                rows.Add(new Sample{label=Label(clip),motion=a.Zip(b,Vector3.Distance).Max()});
            }
            view.SelectProfession(5);
            File.WriteAllText(Path.Combine(Evidence,"cad-motion-validation.json"),JsonUtility.ToJson(new Validation{passed=true,count=rows.Count,moving=rows.Count(r=>r.motion>.0001f),samples=rows.ToArray()},true));
        }
        static Vector3[] Bake(SkinnedMeshRenderer skin){var mesh=new Mesh();try{skin.BakeMesh(mesh);return mesh.vertices;}finally{UnityEngine.Object.DestroyImmediate(mesh);}}
        [Serializable] class Review{public Row[] clips;}
        [Serializable] class Row{public string label,path,reason;public bool recommended;}
        [Serializable] class Sample{public string label;public float motion;}
        [Serializable] class Validation{public bool passed;public int count,moving;public Sample[] samples;}
    }
}
