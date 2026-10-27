#if UNITY_EDITOR
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NUnit.Framework;
using Orionis.Application;
using Orionis.Domain;
using Orionis.Infrastructure;
using Orionis.Presentation;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.TestTools;
namespace Orionis.Tests
{
    public sealed class SpatialPlanningTests
    {
        private static void EditorAccountWarning(string message,string stack,LogType type)
        {if(type==LogType.Warning&&message=="Account API did not become accessible within 30 seconds. This may be due to network issues or editor focus.")LogAssert.Expect(LogType.Warning,message);}
        [SetUp] public void ObserveEditorAccountWarning()=>UnityEngine.Application.logMessageReceived+=EditorAccountWarning;
        [TearDown] public void StopObservingEditorAccountWarning()=>UnityEngine.Application.logMessageReceived-=EditorAccountWarning;
        private static CampaignSession Create()=>new CampaignSession(new CampaignState(BootstrapReader.Read(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json")),new RandomState(1,1)),null);
        [UnityTest] public IEnumerator SharedHexesSelectActorsStoreLootIsReachableAndDefeatedGuardsStayDown()
        {
            var source=Newtonsoft.Json.Linq.JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));source["rooms"].Single(r=>(string)r["id"]=="r10")["constructionTier"]=3;
            var s=new CampaignSession(new CampaignState(BootstrapReader.Read(source.ToString()),new RandomState(1,1)),null);s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);s.MoveParty("door-gate-to-yard");
            string path=Path.Combine(Path.GetTempPath(),"orionis-hexes-"+Guid.NewGuid().ToString("N")+".json");
            var asset=new TextAsset(source.ToString());var store=new FileCampaignSaveStore(path,new CampaignSaveCodec(asset.text));store.Save(new SavedSession(s.State,null));
            var root=new GameObject("Shared action UI regression");var b=root.AddComponent<PrototypeBootstrap>();b.Configure(asset,store);
            Button Button(string name)=>root.GetComponentsInChildren<Button>().Single(x=>x.name==name);
            void Work(string id){var r=MissionField.Requirements(b.Session.State,id);var a=MissionField.Candidates(b.Session.State,r).First();b.Session.StartFieldWork(id,a.ActorId,a.ToolId);b.Session.AdvanceFieldWork();}
            void Fight(string id){b.Session.Engage(id);while(MissionCombat.Active(b.Session.State)!=null)b.Session.AdvanceCombatRound();}
            Animator Guard(){var all=root.GetComponentsInChildren<Animator>(true);var found=all.SingleOrDefault(a=>a.GetComponentsInParent<Transform>(true).Any(t=>t.name=="Offworld render npc/guard-holding-01"));Assert.That(found,Is.Not.Null,"Stage="+b.Session.State.Expedition.StageId+"; visible="+string.Join(",",OffworldSceneActors.Visible(b.Session.State).Select(a=>a.id))+"; rigs="+string.Join(",",all.Select(a=>string.Join("/",a.GetComponentsInParent<Transform>(true).Select(t=>t.name)))));return found;}
            try
            {
                yield return null;Button("Load prototype").onClick.Invoke();yield return null;yield return null;
                Assert.That(root.GetComponentsInChildren<Button>().Count(x=>x.name=="map-action-response-yard-ignore"),Is.EqualTo(1));
                Assert.That(root.GetComponentsInChildren<Button>().Any(x=>x.name.StartsWith("map-action-response-yard-ignore-actor-")),Is.False);
                Button("map-action-response-yard-ignore").onClick.Invoke();yield return null;
                Assert.That(b.Session.State.Expedition.Travel.SceneId,Is.Not.Null,"Selecting a shared response must not commit it.");
                Button("map-action-response-yard-ignore-actor-unit-6").onClick.Invoke();yield return null;
                Fight("incident-yard-guards");b.Session.MoveParty("door-yard-to-mainhall");Work("hack-door-mainhall-to-holding");b.Session.MoveParty("door-mainhall-to-holding");
                yield return null;yield return null;yield return new WaitForSecondsRealtime(1);
                float standing=Guard().GetBoneTransform(HumanBodyBones.Head).position.y;
                b.Session.Engage("incident-holding-guards");yield return null;yield return null;yield return new WaitForSecondsRealtime(.3f);
                var guard=Guard();var pool=OffworldCharacterPool.For(b,b.Session);string target=pool.CombatTarget("npc/guard-holding-01");
                Assert.That(pool.TryPosition(target,out var targetPoint),Is.True);Assert.That(pool.TryPosition("npc/guard-holding-01",out var guardPoint),Is.True);
                foreach(var id in b.Session.State.Expedition.Party.Select(p=>p.UnitId).Append("npc/guard-holding-01"))
                {
                    var render=root.GetComponentsInChildren<Transform>().Single(t=>t.name=="Offworld render "+id);
                    var camera=render.GetComponentInChildren<Camera>();var weapon=render.GetComponentsInChildren<Transform>().First(t=>t.name=="weapon_assault_rifle_A").GetComponentInChildren<MeshFilter>().transform;
                    var origin=camera.WorldToViewportPoint(weapon.position);var muzzle=camera.WorldToViewportPoint(weapon.position+weapon.TransformDirection(Vector3.left));
                    Assert.That(pool.TryPosition(pool.CombatTarget(id).StartsWith("unit-")?pool.CombatTarget(id):"npc/"+pool.CombatTarget(id),out var aimAt),Is.True);
                    Assert.That(pool.TryPosition(id,out var from),Is.True);var delta=aimAt-from;
                    Assert.That(Vector2.Angle(new Vector2(muzzle.x-origin.x,muzzle.y-origin.y),new Vector2(delta.x,-delta.y)),Is.LessThan(2),id+": the rendered rifle barrel must point at its actual target on the map.");
                }
                while(MissionCombat.Active(b.Session.State)!=null)b.Session.AdvanceCombatRound();
                yield return null;yield return null;yield return new WaitForSecondsRealtime(1);
                Assert.That(Guard().GetCurrentAnimatorStateInfo(0).IsName("Down"),Is.True);
                Assert.That(Guard().GetBoneTransform(HumanBodyBones.Head).position.y,Is.LessThan(standing-.4f),"Down must visibly lower the guard, not merely select an Animator state.");
                Button("Save prototype").onClick.Invoke();Button("Load prototype").onClick.Invoke();yield return null;yield return null;yield return new WaitForSecondsRealtime(1);
                Assert.That(Guard().GetCurrentAnimatorStateInfo(0).IsName("Down"),Is.True,"Down survives pool replacement.");
                Work("small-talk-worker-holding");Work(b.Session.State.Base.Cargo.Reveal.Id);b.Session.MoveParty("door-stage-hidden-store");yield return null;yield return null;
                Assert.That(root.GetComponentsInChildren<Transform>().Any(t=>t.name=="Map NPC equipment-crate-02"),Is.True);
                Button("map-action-action-collect-equipment-crate-02").onClick.Invoke();yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Work,Is.Null);
                var choice=Button("map-action-action-collect-equipment-crate-02-actor-unit-6");var chosenPoint=choice.transform.localPosition;Assert.That(ColorUtility.TryParseHtmlString(b.Session.State.Base.Units.Single(u=>u.Id=="unit-6").Color,out var actorColor),Is.True);
                Assert.That(choice.GetComponent<MapActionHex>().BorderColor,Is.EqualTo(actorColor));choice.onClick.Invoke();yield return null;
                Assert.That(Button("map-action-Complete field work").transform.localPosition,Is.EqualTo(chosenPoint));Assert.That(Button("map-action-Cancel field work").transform.localPosition,Is.Not.EqualTo(chosenPoint));
                Assert.That(Button("map-action-Complete field work").GetComponent<MapActionHex>().BorderColor,Is.EqualTo(actorColor));
                Button("map-action-Complete field work").onClick.Invoke();yield return null;yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Completed.Any(w=>w.RecipeId=="collect-equipment-crate-02"),Is.True);
                Assert.That(b.Session.State.Cargo,Is.Empty,"Marking a crate must not place its contents in SGC or party storage.");
                Assert.That(root.GetComponentsInChildren<Transform>().Any(t=>t.name=="Map NPC equipment-crate-02"),Is.True,"Marked crates remain at their source.");
                Assert.That(root.GetComponentsInChildren<Button>().Any(x=>x.name=="map-action-action-collect-equipment-crate-02"),Is.False);
                b.Session.MoveParty("door-stage-hidden-store");b.Session.MoveParty("door-mainhall-to-holding");
                Work("hack-door-mainhall-to-processing");b.Session.MoveParty("door-mainhall-to-processing");Work("isolate-mining-power");Work("hack-door-processing-to-lab");b.Session.MoveParty("door-processing-to-lab");yield return null;yield return null;
                Assert.That(Button("map-action-move-door-processing-to-lab"),Is.Not.Null,"Analysis lab must render its return route without lookup errors.");
                Assert.That(root.GetComponentsInChildren<Transform>().Single(t=>t.name=="Map NPC lab-search-station-1").GetComponent<Image>(),Is.Not.Null,"A blank prefab profile must render a generic object marker.");
                b.Session.MoveParty("door-processing-to-lab");Work("inquire-worker-processing");b.Session.MoveParty("door-processing-to-office");b.Session.MoveParty("door-stage-hidden-safe");yield return null;yield return null;
                foreach(var id in new[]{"safe-intel-01","safe-loot-01"}){Assert.That(root.GetComponentsInChildren<Transform>().Single(t=>t.name=="Map NPC "+id).GetComponent<Image>(),Is.Not.Null);var mark=Button("map-action-action-collect-"+id);Canvas.ForceUpdateCanvases();var rect=(RectTransform)mark.transform;var hits=new List<RaycastResult>();EventSystem.current.RaycastAll(new PointerEventData(EventSystem.current){position=RectTransformUtility.WorldToScreenPoint(null,rect.TransformPoint(rect.rect.center))},hits);Assert.That(hits.FirstOrDefault().gameObject?.GetComponentInParent<Button>(),Is.SameAs(mark),"Safe package action must receive mouse input: "+id);mark.onClick.Invoke();yield return null;Button("map-action-action-collect-"+id+"-actor-unit-6").onClick.Invoke();yield return null;Button("map-action-Complete field work").onClick.Invoke();yield return null;yield return null;}
                b.Session.MoveParty("door-stage-hidden-safe");b.Session.MoveParty("door-processing-to-office");b.Session.MoveParty("door-mainhall-to-processing");b.Session.MoveParty("door-yard-to-mainhall");b.Session.MoveParty("door-gate-to-yard");yield return null;yield return null;
                var dial=Button("map-action-Redial Gate");var position=dial.transform.localPosition;
                Assert.That(root.GetComponentsInChildren<Button>().Any(x=>x.name=="map-action-Extract to SGC"),Is.False);
                dial.onClick.Invoke();yield return null;yield return null;
                Assert.That(root.GetComponentsInChildren<Button>().Any(x=>x.name=="map-action-Redial Gate"),Is.False);
                Assert.That(Button("map-action-Extract to SGC").transform.localPosition,Is.EqualTo(position));
                Assert.That(MissionCare.Resolved(b.Session.State),Is.False);
                Button("map-action-Extract to SGC").onClick.Invoke();yield return null;Button("Confirm extraction to SGC").onClick.Invoke();yield return null;
                Assert.That(b.Session.State.Cargo.Select(i=>i.Id),Is.EquivalentTo(b.Session.State.Base.Cargo.Caches.Where(c=>RecoveredCargo.CacheRevealed(b.Session.State,c)).SelectMany(c=>c.Items).Select(i=>i.Id)),"For now all marked crates extract, without the later per-item selection/route wave.");
                if(Button("Pause clock").GetComponentInChildren<Text>().text=="Pause")Button("Pause clock").onClick.Invoke();
                var workers=b.Session.State.Base.Receiving.Workers;var technician=workers.First(w=>w.Qualifications.ContainsKey("TECHNICIAN")&&w.ToolServices.Contains("TET1"));var scientists=workers.Where(w=>w.Qualifications.ContainsKey("SCIENTIST")&&w.ToolServices.Contains("SCT1")).Take(2).ToArray();
                b.Session.AssignUnit(technician.UnitId,"r2");b.Session.AssignUnit(scientists[0].UnitId,"r2");b.Session.AssignUnit(scientists[1].UnitId,"r4");
                var originals=b.Session.State.Cargo.ToDictionary(i=>i.Id,i=>i.Payload);
                foreach(var id in originals.Keys){
                    b.Session.AdmitIncoming(id,"r2");for(int tick=0;tick<4;tick++)b.Session.AdvanceOneTick();b.Session.MoveCargo(id,"r10");b.Session.StartCargoExamination(id,"r4");
                    Assert.That(b.Session.State.Cargo.Single(i=>i.Id==id).RoomId,Is.EqualTo("r10"));
                    Button("Save prototype").onClick.Invoke();Button("Load prototype").onClick.Invoke();yield return null;b.OpenReceiving();yield return null;Button("Locate all cargo").onClick.Invoke();yield return null;root.GetComponentInChildren<CargoPanel>().FocusItem(id);yield return null;
                    Assert.That(Button("cargo-"+id).GetComponentInChildren<Text>().text,Does.Contain("Cargo #").And.Contain("Analysis"));Assert.That(b.Session.State.Cargo.Single(i=>i.Id==id).CustodyRoomId,Is.EqualTo("r4"));
                    b.Session.AdvanceOneTick();b.Session.AdvanceOneTick();Assert.That(CargoExamination.Completed(b.Session.State.Cargo.Single(i=>i.Id==id)),Is.True,id);b.Session.ReturnCargoToStorage(id);
                    Assert.That(b.Session.State.Cargo.Single(i=>i.Id==id).Payload,Is.EqualTo(originals[id]));Assert.That(b.Session.State.Cargo.Single(i=>i.Id==id).RoomId,Is.EqualTo("r10"));Assert.That(b.Session.State.Cargo.Single(i=>i.Id==id).CustodyRoomId,Is.EqualTo("r10"));Assert.That(b.Session.State.Cargo.Count,Is.EqualTo(6));
                }
                LogAssert.NoUnexpectedReceived();
            }
            finally{UnityEngine.Object.DestroyImmediate(root);UnityEngine.Object.DestroyImmediate(asset);if(File.Exists(path))File.Delete(path);}
        }
        [UnityTest] public IEnumerator LoadedLootExtractsThroughIsolatedModalIntoReceivingWithoutStaleMarkers()
        {
            var s=Create();
            void Work(string id){var recipe=MissionField.Requirements(s.State,id);var actor=MissionField.Candidates(s.State,recipe).First();s.StartFieldWork(id,actor.ActorId,actor.ToolId);s.AdvanceFieldWork();}
            void Fight(string id){s.Engage(id);while(MissionCombat.Active(s.State)!=null)s.AdvanceCombatRound();}
            s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);s.MoveParty("door-gate-to-yard");s.Respond("yard-ignore","unit-6");Fight("incident-yard-guards");s.MoveParty("door-yard-to-mainhall");Work("hack-door-mainhall-to-holding");s.MoveParty("door-mainhall-to-holding");Fight("incident-holding-guards");Work("small-talk-worker-holding");foreach(var care in s.State.Base.Care.Recipes)Work(care.Id);Work(s.State.Base.Cargo.Reveal.Id);s.MoveParty("door-stage-hidden-store");Work("collect-equipment-crate-02");s.MoveParty("door-stage-hidden-store");s.MoveParty("door-mainhall-to-holding");s.MoveParty("door-yard-to-mainhall");s.MoveParty("door-gate-to-yard");s.RedialGate();
            string path=Path.Combine(Path.GetTempPath(),"orionis-extraction-"+Guid.NewGuid().ToString("N")+".json");
            var asset=new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));var store=new FileCampaignSaveStore(path,new CampaignSaveCodec(asset.text));store.Save(new SavedSession(s.State,null));
            var root=new GameObject("Extraction UI regression");var b=root.AddComponent<PrototypeBootstrap>();b.Configure(asset,store);
            Button Button(string name)=>root.GetComponentsInChildren<Button>().Single(x=>x.name==name);
            try
            {
                yield return null;Button("Load prototype").onClick.Invoke();yield return null;yield return null;
                var markers=root.GetComponentsInChildren<OffworldMapUnit>();Assert.That(markers.Length,Is.GreaterThan(0));
                var pool=OffworldCharacterPool.For(b,Create());Assert.That(pool.TryPosition("unit-25",out _),Is.False);
                foreach(var marker in markers){marker.SendMessage("LateUpdate");Assert.That(marker.GetComponent<RawImage>().texture,Is.Null);}
                Button("Load prototype").onClick.Invoke();yield return null;yield return null;
                Assert.That(root.GetComponentsInChildren<Canvas>().Count(c=>c.name=="Orionis UI"),Is.EqualTo(1));
                Button("map-action-Extract to SGC").onClick.Invoke();yield return null;
                var modal=root.GetComponentInChildren<MissionExtractionPanel>();Assert.That(modal,Is.Not.Null);Assert.That(modal.GetComponent<Canvas>().overrideSorting,Is.True);
                Canvas.ForceUpdateCanvases();var hits=new List<RaycastResult>();var pointer=new PointerEventData(EventSystem.current){position=RectTransformUtility.WorldToScreenPoint(null,modal.GetComponent<RectTransform>().position)};EventSystem.current.RaycastAll(pointer,hits);
                Assert.That(hits.Count,Is.GreaterThan(0));Assert.That(hits[0].gameObject.transform.IsChildOf(modal.transform)||hits[0].gameObject==modal.gameObject,Is.True,"Extraction must receive input above the map.");
                Button("Cancel extraction").onClick.Invoke();Assert.That(modal.gameObject.activeSelf,Is.False);yield return null;
                Button("map-action-Extract to SGC").onClick.Invoke();yield return null;Button("Confirm extraction to SGC").onClick.Invoke();yield return null;
                Assert.That(b.Session.State.Expedition.Returned,Is.True);Assert.That(root.GetComponentInChildren<MissionExtractionPanel>(),Is.Null);
                Assert.That(b.Session.State.Cargo.Select(i=>i.Id),Is.EquivalentTo(s.State.Base.Cargo.Caches.Where(c=>RecoveredCargo.CacheRevealed(s.State,c)).SelectMany(c=>c.Items).Select(i=>i.Id)));
                Button("Open Receiving queue").onClick.Invoke();yield return null;
                Assert.That(root.GetComponentInChildren<MissionPanel>(),Is.Null);Assert.That(root.GetComponentInChildren<CargoPanel>(),Is.Not.Null);
                foreach(var item in b.Session.State.Cargo)Assert.That(Button("cargo-"+item.Id),Is.Not.Null);
                LogAssert.NoUnexpectedReceived();
            }
            finally{UnityEngine.Object.DestroyImmediate(root);UnityEngine.Object.DestroyImmediate(asset);if(File.Exists(path))File.Delete(path);}
        }
        [Test] public void EveryDoorHasACardinalVisualRouteAndCombatAimsAtLivingTargets()
        {
            var s=Create();var map=s.State.Base.MissionMap;
            foreach(var door in s.State.Base.Mission.Travel.Transitions)
            {
                var a=map.Stages.Single(r=>r.Id==door.From).Cells.First();var b=map.Stages.Single(r=>r.Id==door.To).Cells.First();var path=OffworldRoute.ThroughRooms(map,door.From,door.To,new Vector2(a.X+.2f,a.Y+.4f),new Vector2(b.X+.2f,b.Y+.4f));Assert.That(Vector2.Distance(path.Last(),new Vector2(b.X+.2f,b.Y+.4f)),Is.LessThan(.0001f),door.Id);
                for(int i=1;i<path.Count;i++){var delta=path[i]-path[i-1];Assert.That(Mathf.Abs(delta.x)<.001f||Mathf.Abs(delta.y)<.001f,Is.True,"Diagonal segment: "+door.Id);Assert.That(Mathf.Abs(delta.x)+Mathf.Abs(delta.y),Is.LessThanOrEqualTo(1.001f));}
            }
            s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);s.MoveParty("door-gate-to-yard");s.Respond("yard-ignore","unit-6");s.Engage("incident-yard-guards");Assert.That(MissionCombat.TargetFor(s.State,"unit-6"),Is.EqualTo("guard-yard-01"));Assert.That(s.State.Expedition.Party.Any(p=>p.UnitId==MissionCombat.TargetFor(s.State,"guard-yard-01")),Is.True);s.AdvanceCombatRound();var target=MissionCombat.TargetFor(s.State,"unit-6");if(target!=null)Assert.That(MissionCombat.Inspect(s.State).GuardHealth[target],Is.GreaterThan(0));
        }
        [Test] public void PlanningShowsRoomRockAndFreeCellActionsBeforeExplicitPlacement()
        {
            var s=Create();Assert.That(s.State.Base.Planning.Rooms.Single(r=>r.Room.Id=="data_storage").Category,Is.EqualTo("Storage"));Assert.That(s.State.Base.Planning.Rooms.Single(r=>r.Room.Id=="communications").Construction[1].Hours,Is.EqualTo(24));
            var maintenance=s.State.Base.Rooms.Single(r=>r.Definition.Id=="maintenance");s.AssignUnit("unit-25",maintenance.Id);s.AssignUnit("unit-6",maintenance.Id);
            var root=new GameObject("Planning context regression",typeof(RectTransform));((RectTransform)root.transform).sizeDelta=new Vector2(1200,700);
            try
            {
                root.AddComponent<BasePlanningPanel>().Bind(s,()=>{});
                Button Button(string name)=>root.GetComponentsInChildren<Button>(true).Single(b=>b.name==name);
                void Cell(int x,int y)=>Button("Plan cell "+x+" "+y).onClick.Invoke();
                var room=s.State.Base.Rooms.First();Cell(room.Col,room.Row);Assert.That(root.GetComponentsInChildren<Text>().Any(t=>t.text.Contains(room.Definition.Name)),Is.True);Assert.That(Button("Clear selected rock").gameObject.activeSelf,Is.False);
                bool Occupied(int x,int y)=>s.State.Base.Rooms.Any(r=>x>=r.Col&&x<r.Col+r.Definition.Width&&y>=r.Row&&y<r.Row+r.Definition.Height);
                var cells=(from y in Enumerable.Range(0,s.State.Base.Planning.Rows) from x in Enumerable.Range(0,s.State.Base.Planning.Columns) where !Occupied(x,y) select new{x,y}).ToArray();var rock=cells.First(c=>!RoomConstruction.IsClear(s.State,c.x,c.y));Cell(rock.x,rock.y);Assert.That(Button("Clear selected rock").gameObject.activeSelf,Is.True);Assert.That(root.transform.Find("Construction carousel").gameObject.activeSelf,Is.False);Button("Clear selected rock").onClick.Invoke();Assert.That(s.State.Construction.Clearings.Count,Is.EqualTo(1));Assert.That(Button("Clear selected rock").interactable,Is.False);
                var free=cells.First(c=>RoomConstruction.IsClear(s.State,c.x,c.y));Cell(free.x,free.y);Assert.That(root.transform.Find("Construction carousel").gameObject.activeSelf,Is.True);Assert.That(Button("Build room").gameObject.activeSelf,Is.False);Button("Plan room communications").onClick.Invoke();Assert.That(Button("Build room").gameObject.activeSelf,Is.False);Cell(free.x,free.y);Assert.That(Button("Build room").gameObject.activeSelf,Is.True);Assert.That(Button("Build room").interactable,Is.True);double stock=s.State.Construction.Supply["S1"];Button("Build room").onClick.Invoke();Assert.That(s.State.Construction.Sites.Count,Is.EqualTo(1),root.transform.Find("Placement status").GetComponentInChildren<Text>().text);Assert.That(s.State.Construction.Supply["S1"],Is.EqualTo(stock-24));Assert.That(Button("Build room").gameObject.activeSelf,Is.False);
            }
            finally{UnityEngine.Object.DestroyImmediate(root);}
        }
        [Test] public void ClosedAndExpiredGateRejectExtractionUntilRedialWithoutInventingLoot()
        {
            var s=Create();s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);var before=s.State;Assert.Throws<InvalidOperationException>(s.ExtractMission);Assert.That(s.State,Is.SameAs(before));s.RedialGate();Assert.That(MissionRescue.ExtractionBlocker(s.State),Is.Null);
            var expired=s.State;for(int i=0;i<CampaignTiming.GateConnectionTicks;i++)expired=ReceivingWork.AdvanceTick(expired);s=new CampaignSession(expired,null);Assert.That(s.State.Expedition.GateOpen,Is.False);Assert.Throws<InvalidOperationException>(s.ExtractMission);s.RedialGate();s.ExtractMission();Assert.That(s.State.Expedition.Returned,Is.True);Assert.That(s.State.Cargo,Is.Empty);
        }
    }
}
#endif
