using System;
using System.Collections.Generic;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Orionis.Presentation
{
    // Presentation-only render pool. The 2D mission's actions, time and stage state
    // remain authoritative; motion between committed locations is cosmetic.
    [DefaultExecutionOrder(1000)]
    public sealed class OffworldCharacterPool : MonoBehaviour
    {
        public sealed class Motion
        {
            public string Expedition,Stage;public Vector2 From,Target;public float Start,Duration,Yaw;public readonly List<Vector2> Route=new List<Vector2>();
            private float Distance=>Route.Zip(Route.Skip(1),(a,b)=>Vector2.Distance(a,b)).Sum();
            public Vector2 Position(float now)
            {
                if(Route.Count<2)return Target;float left=Mathf.Clamp01(Duration<=0?1:(now-Start)/Duration)*Distance;
                for(int i=1;i<Route.Count;i++){float length=Vector2.Distance(Route[i-1],Route[i]);if(left<=length){var delta=Route[i]-Route[i-1];if(delta.sqrMagnitude>.00001f)Yaw=Mathf.Atan2(-delta.x,delta.y)*Mathf.Rad2Deg;return Vector2.Lerp(Route[i-1],Route[i],length==0?1:left/length);}left-=length;}return Target;
            }
            public bool Walking(float now)=>Duration>0&&now<Start+Duration;
            public void Move(string expedition,Vector2 point,float now,CampaignState state)
            {
                string stage=state.Expedition.StageId;
                if(Expedition!=expedition){Expedition=expedition;Stage=stage;From=Target=point;Duration=0;Yaw=0;Route.Clear();Route.Add(point);return;}
                if((point-Target).sqrMagnitude<.0001f)return;
                var current=Position(now);var tail=new List<Vector2>();
                if(Walking(now)){float consumed=Mathf.Clamp01((now-Start)/Duration)*Distance;for(int i=1;i<Route.Count;i++){float length=Vector2.Distance(Route[i-1],Route[i]);if(consumed<length)tail.Add(Route[i]);consumed-=length;}}
                var next=OffworldRoute.ThroughRooms(state.Base.MissionMap,Stage,stage,Target,point);Route.Clear();Route.Add(current);Route.AddRange(tail);Route.AddRange(next.Skip(1));From=current;Target=Route.Last();Stage=stage;Start=now;Duration=Distance*.25f;
            }
        }
        private sealed class Rig
        {
            public string Pose;public GameObject[] Weapons;public GameObject Root,Model;public Animator Actor;public Camera Camera;public Transform Aim;public RenderTexture Texture;public Motion Motion;public float LastVisible,Yaw;public Vector2? AimDelta;public readonly List<OffworldMapUnit> Views=new List<OffworldMapUnit>();
        }
        private OffworldCharacterCatalog catalog;private CampaignSession owner;private readonly Dictionary<string,Rig> rigs=new Dictionary<string,Rig>();private readonly Dictionary<string,Motion> motions=new Dictionary<string,Motion>();private int nextSlot;
        public int RigCount=>rigs.Count;
        public static OffworldCharacterPool For(PrototypeBootstrap root,CampaignSession session)
        {
            var pool=root.GetComponent<OffworldCharacterPool>();if(pool==null)pool=root.gameObject.AddComponent<OffworldCharacterPool>();
            if(pool.owner!=session){pool.Clear();pool.owner=session;pool.catalog=Resources.Load<OffworldCharacterCatalog>("OffworldCharacters/catalog");}return pool;
        }
        public bool Attach(OffworldMapUnit view,string unit,string profession,Vector2 target,string expedition)
        {
            var profile=catalog?.profiles.FirstOrDefault(p=>p.profession==profession);if(profile?.prefab==null)return false;
            if(!motions.TryGetValue(unit,out var motion))motions[unit]=motion=new Motion();motion.Move(expedition,target,Time.unscaledTime,owner.State);
            if(!rigs.TryGetValue(unit,out var rig))
            {
                rig=new Rig{Root=new GameObject("Offworld render "+unit),Motion=motion,LastVisible=Time.unscaledTime};rig.Root.transform.SetParent(transform,false);rig.Root.transform.position=new Vector3(1000+nextSlot++*10,-1000,1000);
                rig.Model=Instantiate(profile.prefab,rig.Root.transform,false);rig.Actor=rig.Model.GetComponentInChildren<Animator>();rig.Actor.keepAnimatorStateOnDisable=true;rig.Actor.applyRootMotion=false;rig.Actor.fireEvents=false;rig.Actor.cullingMode=AnimatorCullingMode.AlwaysAnimate;
                foreach(var t in rig.Root.GetComponentsInChildren<Transform>(true))t.gameObject.layer=catalog.renderLayer;
                var cameraObject=new GameObject("Offworld portrait camera",typeof(Camera));cameraObject.transform.SetParent(rig.Root.transform,false);rig.Camera=cameraObject.GetComponent<Camera>();rig.Camera.enabled=false;rig.Camera.orthographic=true;rig.Camera.orthographicSize=1.65f;rig.Camera.clearFlags=CameraClearFlags.SolidColor;rig.Camera.backgroundColor=Color.clear;rig.Camera.cullingMask=1<<catalog.renderLayer;rig.Camera.nearClipPlane=.1f;rig.Camera.farClipPlane=30;rig.Camera.allowHDR=false;rig.Camera.allowMSAA=false;
                var center=rig.Root.transform.position+new Vector3(0,1.15f,0);float pitch=60*Mathf.Deg2Rad;cameraObject.transform.position=center+new Vector3(0,Mathf.Sin(pitch)*8.485281f,Mathf.Cos(pitch)*8.485281f);cameraObject.transform.rotation=Quaternion.Euler(60,180,0);rig.Camera.GetUniversalAdditionalCameraData().SetRenderer(catalog.rendererIndex);
                rig.Texture=new RenderTexture(96,128,24,RenderTextureFormat.ARGB32){name="Offworld "+unit,filterMode=FilterMode.Point,antiAliasing=1};rig.Texture.Create();rig.Camera.targetTexture=rig.Texture;rigs[unit]=rig;
            }
            rig.Weapons=rig.Model.GetComponentsInChildren<Transform>(true).Where(t=>t.name=="weapon_assault_rifle_A").Select(t=>t.gameObject).ToArray();
            // The selected Toon Soldiers rifle mesh runs towards local -X.
            rig.Aim=rig.Weapons.SelectMany(w=>w.GetComponentsInChildren<MeshFilter>(true)).FirstOrDefault()?.transform;
            rig.Views.Add(view);view.Texture=rig.Texture;return true;
        }
        public bool TryPosition(string unit,out Vector2 position)
        {
            if(unit!=null&&motions.TryGetValue(unit,out var motion)){position=motion.Position(Time.unscaledTime);return true;}
            position=default;return false;
        }
        public string CombatTarget(string unit)=>MissionCombat.TargetFor(owner.State,unit.StartsWith("npc/")?unit.Substring(4):unit);
        public bool Walking(string unit)=>motions.TryGetValue(unit,out var motion)&&motion.Walking(Time.unscaledTime);
        private void Update()
        {
            foreach(var pair in rigs.ToArray())
            {
                var rig=pair.Value;rig.Views.RemoveAll(v=>v==null);bool visible=rig.Views.Any(v=>v.isActiveAndEnabled&&v.gameObject.activeInHierarchy);
                rig.Model.SetActive(visible);if(visible){rig.LastVisible=Time.unscaledTime;rig.Motion.Position(Time.unscaledTime);var pose=Pose(pair.Key,rig.Motion.Walking(Time.unscaledTime));
                    float yaw=rig.Motion.Yaw;rig.AimDelta=null;var target=CombatTarget(pair.Key);string key=target!=null&&owner.State.Expedition.Party.Any(p=>p.UnitId==target)?target:"npc/"+target;
                    if(pose=="Fire"&&target!=null&&motions.TryGetValue(key,out var other)){var delta=other.Position(Time.unscaledTime)-rig.Motion.Position(Time.unscaledTime);rig.AimDelta=delta;yaw=Mathf.Atan2(-delta.x,delta.y)*Mathf.Rad2Deg;}
                    rig.Yaw=yaw;
                    rig.Actor.SetBool("Moving",pose=="Walk");
                    // Enter death directly so an outgoing Walk -> Idle transition cannot
                    // interrupt it. A reused/re-enabled rig must retain the final pose.
                    if(pose=="Down"){if(rig.Pose!=pose)rig.Actor.Play("Down",0,0);else if(!rig.Actor.GetCurrentAnimatorStateInfo(0).IsName("Down"))rig.Actor.Play("Down",0,.99f);}
                    else if(rig.Pose!=pose)rig.Actor.CrossFadeInFixedTime(pose,.12f);
                    rig.Pose=pose;foreach(var weapon in rig.Weapons)weapon.SetActive(pose=="Fire");}
                else if(Time.unscaledTime-rig.LastVisible>10){Dispose(rig);rigs.Remove(pair.Key);}
            }
        }
        private string Pose(string id,bool walking)
        {
            var state=owner?.State;if(state?.Expedition==null)return walking?"Walk":"Idle";
            bool npc=id.StartsWith("npc/");string instance=npc?id.Substring(4):id;
            var combat=MissionCombat.Inspect(state);
            if((npc&&combat.GuardHealth.TryGetValue(instance,out var guard)&&guard==0)||(!npc&&combat.PartyHealth.TryGetValue(instance,out var hp)&&hp==0))return "Down";
            if(walking)return "Walk";
            if(MissionCombat.Active(state)!=null&&MissionCombat.TargetFor(state,instance)!=null)return "Fire";
            var travel=state.Expedition.Travel;
            if(travel.SceneId!=null){var scene=state.Base.Mission.Travel.Conversations.Single(s=>s.Id==travel.SceneId);if(!npc||scene.NpcId==instance)return "Talk";}
            var work=travel.Field.Work;
            if(work!=null&&(work.ActorId==instance||work.Assignments.Any(a=>a.ActorId==instance))){var recipe=MissionField.Requirements(state,work.RecipeId);if(recipe.Profession=="DIPLOMAT")return "Talk";if(MissionCare.Recipe(state,work.RecipeId)!=null)return "LowReach";return "Work";}
            return "Idle";
        }
        private void LateUpdate(){foreach(var rig in rigs.Values)if(rig.Model.activeInHierarchy){
            // Humanoid evaluation can write the model root after Update. Apply map
            // facing after animation, immediately before rendering the portrait.
            rig.Model.transform.localRotation=Quaternion.Euler(0,rig.Yaw,0);
            if(rig.AimDelta.HasValue&&rig.Aim!=null){
                // Match the actual animated barrel, not the model's forward axis.
                // Portraits are projected by a pitched camera then stretched into
                // square map markers; invert that projection before matching yaw.
                var delta=rig.AimDelta.Value;var right=rig.Camera.transform.right;right.y=0;var up=rig.Camera.transform.up;up.y=0;
                var desired=right*(delta.x*rig.Camera.aspect/right.sqrMagnitude)-up*(delta.y/up.sqrMagnitude);
                var barrel=rig.Aim.TransformDirection(Vector3.left);
                // Retain the clip's slight barrel pitch while solving the
                // horizontal angle that projects onto the target exactly.
                var offset=-up*(barrel.y*rig.Camera.transform.up.y/up.sqrMagnitude);
                float a=desired.sqrMagnitude,b=Vector3.Dot(desired,offset),c=offset.sqrMagnitude-(barrel.x*barrel.x+barrel.z*barrel.z);
                if(a>.000001f)desired=desired*((-b+Mathf.Sqrt(Mathf.Max(0,b*b-a*c)))/a)+offset;
                float correction=Mathf.DeltaAngle(Mathf.Atan2(barrel.x,barrel.z)*Mathf.Rad2Deg,Mathf.Atan2(desired.x,desired.z)*Mathf.Rad2Deg);
                rig.Model.transform.Rotate(0,correction,0,Space.World);
            }
            RenderPipeline.SubmitRenderRequest(rig.Camera,new UniversalRenderPipeline.SingleCameraRequest{destination=rig.Texture});}}
        private static void Dispose(Rig rig){if(rig.Texture!=null){rig.Texture.Release();Destroy(rig.Texture);}if(rig.Root!=null)Destroy(rig.Root);}
        private void Clear(){foreach(var rig in rigs.Values){foreach(var view in rig.Views)if(view!=null)view.Detach();Dispose(rig);}rigs.Clear();motions.Clear();nextSlot=0;}
        private void OnDestroy()=>Clear();
    }
}
