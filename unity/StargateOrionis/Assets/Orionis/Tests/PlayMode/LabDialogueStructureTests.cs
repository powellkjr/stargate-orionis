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
using Orionis.Presentation.Structure;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.TestTools;
namespace Orionis.Tests
{
    public sealed class LabDialogueStructureTests
    {
        private static string Json=>File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private static CampaignSession Start(){var s=new CampaignSession(new CampaignState(BootstrapReader.Read(Json),new RandomState(1,1)),null);s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);s.MoveParty("door-gate-to-yard");return s;}
        private static void Work(CampaignSession s,string id){var a=MissionField.Candidates(s.State,MissionField.Requirements(s.State,id)).First();s.StartFieldWork(id,a.ActorId,a.ToolId);s.AdvanceFieldWork();}
        private static void Hall(CampaignSession s){s.Respond("yard-ignore","unit-6");s.MoveParty("door-yard-to-mainhall");}
        private static CampaignSession Reload(CampaignSession s){var c=new CampaignSaveCodec(Json);return new CampaignSession(c.Deserialize(c.Serialize(new SavedSession(s.State,null))).Campaign,null);}
        [Test] public void StructuralModulesPreserveDoorsJoinsSeparatorsAndTierLights()
        {
            for(int mask=0;mask<16;mask++){
                var doors=Enum.GetValues(typeof(RoomArtSide)).Cast<RoomArtSide>().Where(s=>(mask&(1<<(int)s))!=0).Select(s=>new RoomArtEdge(Vector2Int.zero,s)).ToArray();
                var m=RoomArtTopology.Build(new[]{Vector2Int.zero},doors);Assert.That(m.Count(x=>x.Role==RoomArtRole.DoorLeaf),Is.EqualTo(doors.Length*2));
                foreach(var leaf in m.Where(x=>x.Role==RoomArtRole.DoorLeaf)){Assert.That(leaf.Size.y,Is.EqualTo(1.7f));Assert.That(leaf.PositionAt(.5f),Is.EqualTo((leaf.PositionAt(0)+leaf.PositionAt(1))/2));Assert.That(leaf.DoorSlide.magnitude,Is.GreaterThan(leaf.Size.x));}
            }
            var joined=RoomArtTopology.Build(new[]{Vector2Int.zero,Vector2Int.right,Vector2Int.up,Vector2Int.one},Array.Empty<RoomArtEdge>());
            Assert.That(joined.Any(x=>x.Role==RoomArtRole.Junction&&x.Position.x==4&&x.Position.z==4),Is.False);
            var independent=RoomStructureModel.Build(new[]{new RoomStructureGroup{Id="a",Cells=new[]{Vector2Int.zero},Tier=1},new RoomStructureGroup{Id="b",Cells=new[]{Vector2Int.right},Tier=1}});
            Assert.That(independent.Boxes.Count(x=>x.Role=="Straight"),Is.EqualTo(21),"Seven distinct boundaries, each with three wall segments.");
            foreach(int tier in new[]{1,2,3}){var model=RoomStructureModel.Build(new[]{new RoomStructureGroup{Id="a",Cells=new[]{Vector2Int.zero},Tier=tier}});Assert.That(model.Boxes.Count(x=>x.Role=="CT lens"),Is.EqualTo(tier==2?8:4));}
            var s=Start();var mission=RoomStructureAdapter.Mission(s.State);Assert.That(mission.Boxes.Any(x=>x.Role.StartsWith("CT")),Is.False);Assert.That(mission.DoorOpen.ContainsKey("door-stage-hidden-safe"),Is.False);
        }
        [UnityTest] public IEnumerator LabSearchActionsSurviveReloadAndRecoverTheSamePreparedDevice()
        {
            var s=Start();Hall(s);Work(s,"hack-door-mainhall-to-processing");s.MoveParty("door-mainhall-to-processing");Work(s,"isolate-mining-power");Work(s,"hack-door-processing-to-lab");s.MoveParty("door-processing-to-lab");
            var path=Path.Combine(Path.GetTempPath(),"orionis-lab-"+Guid.NewGuid().ToString("N")+".json");var asset=new TextAsset(Json);var store=new FileCampaignSaveStore(path,new CampaignSaveCodec(Json));store.Save(new SavedSession(s.State,null));var root=new GameObject("Lab actions regression");var b=root.AddComponent<PrototypeBootstrap>();b.Configure(asset,store);
            Button Button(string name)=>root.GetComponentsInChildren<Button>().Single(x=>x.name==name);
            try{
                yield return null;Button("Load prototype").onClick.Invoke();yield return null;yield return null;
                Assert.That(root.GetComponentsInChildren<Button>().Any(x=>x.name=="map-action-action-characterize-lab-device"),Is.False);
                Assert.That(root.GetComponentsInChildren<Transform>().Any(x=>x.name=="Map NPC lab-mounted-rifle-01"),Is.False);
                Assert.Throws<InvalidOperationException>(()=>Work(b.Session,"secure-lab-device"));
                Button("map-action-group-search-analysis-lab").onClick.Invoke();yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Work.Assignments.Count,Is.EqualTo(4));var start=b.Session.State.Clock.ElapsedTicks;
                Button("Save prototype").onClick.Invoke();Button("Load prototype").onClick.Invoke();yield return null;yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Work.Assignments.Select(a=>a.ActorId),Is.EquivalentTo(new[]{"unit-6","unit-25","unit-37","unit-46"}));
                Button("map-action-Complete field work").onClick.Invoke();Assert.That(b.Session.State.Expedition.Travel.Field.Work,Is.Null,string.Join(" / ",root.GetComponentsInChildren<Text>().Where(t=>t.name=="Travel status").Select(t=>t.text)));yield return null;yield return null;
                Assert.That(b.Session.State.Clock.ElapsedTicks,Is.EqualTo(start+20));Assert.That(b.Session.State.Expedition.Travel.Field.Completed.Count(w=>w.GroupId=="search-analysis-lab"),Is.EqualTo(4));
                Assert.That(b.Session.State.Expedition.Travel.Knowledge,Does.Contain("lab-test-observations-known"));Assert.That(Button("map-action-action-characterize-lab-device").interactable,Is.True);
                Button("map-action-action-characterize-lab-device").onClick.Invoke();yield return null;
                Button("map-action-action-characterize-lab-device-actor-unit-25").onClick.Invoke();yield return null;
                Button("map-action-Complete field work").onClick.Invoke();yield return null;yield return null;
                Assert.That(MissionField.Records(b.Session.State,true).Count(),Is.EqualTo(1));Assert.Throws<InvalidOperationException>(()=>Work(b.Session,"secure-lab-device"));
                Work(b.Session,"create-lab-report");Assert.That(MissionField.Records(b.Session.State),Does.Contain("Scientific analysis report"));
                Work(b.Session,"detach-lab-device");Assert.That(MissionField.InstanceValue(b.Session.State,"lab-mounted-rifle-01","mountState"),Is.EqualTo("DETACHED"));Work(b.Session,"secure-lab-device");
                s=Reload(b.Session);Assert.That(s.State.Cargo,Is.Empty);Assert.That(s.State.Expedition.Travel.Knowledge,Does.Not.Contain("ELECTROMAGNETIC_ACCELERATION_II"));
                s.MoveParty("door-processing-to-lab");s.MoveParty("door-mainhall-to-processing");s.MoveParty("door-yard-to-mainhall");s.MoveParty("door-gate-to-yard");s.RedialGate();s.ExtractMission();s=Reload(s);
                Assert.That(s.State.Cargo.Select(i=>i.Id),Is.EquivalentTo(new[]{"lab-mounted-rifle-01"}));Assert.That(MissionField.Records(s.State).Count(),Is.EqualTo(1));
                var payload=Newtonsoft.Json.Linq.JObject.Parse(s.State.Cargo.Single().Payload);Assert.That((string)payload["state"]["mountState"],Is.EqualTo("DETACHED"));Assert.That(payload["knowledge"]["instanceFindings"].ToString(),Does.Contain("LAB_DEVICE_PULSE_CHARACTERIZED"));
                string original=s.State.Cargo.Single().Payload;var workers=s.State.Base.Receiving.Workers;var technician=workers.First(w=>w.Qualifications.ContainsKey("TECHNICIAN")&&w.ToolServices.Contains("TET1"));var scientists=workers.Where(w=>w.Qualifications.ContainsKey("SCIENTIST")&&w.ToolServices.Contains("SCT1")).Take(2).ToArray();s.AssignUnit(technician.UnitId,"r2");s.AssignUnit(scientists[0].UnitId,"r2");s.AssignUnit(scientists[1].UnitId,"r4");s.AdmitIncoming("lab-mounted-rifle-01","r2");for(int i=0;i<4;i++)s.AdvanceOneTick();s.MoveCargo("lab-mounted-rifle-01","r10");s.StartCargoExamination("lab-mounted-rifle-01","r4");s=Reload(s);Assert.That(s.State.Cargo.Single().StorageRoomId,Is.EqualTo("r10"));Assert.That(s.State.Cargo.Single().CustodyRoomId,Is.EqualTo("r4"));for(int i=0;i<4&&!CargoExamination.Completed(s.State.Cargo.Single());i++)s.AdvanceOneTick();Assert.That(CargoExamination.Completed(s.State.Cargo.Single()),Is.True);s.ReturnCargoToStorage("lab-mounted-rifle-01");Assert.That(s.State.Cargo.Single().Payload,Is.EqualTo(original));Assert.That(s.State.Cargo.Single().CustodyRoomId,Is.EqualTo("r10"));
            }finally{UnityEngine.Object.Destroy(root);UnityEngine.Object.Destroy(asset);if(File.Exists(path))File.Delete(path);}
        }
        [UnityTest] public IEnumerator AllPortedDialogueResponsesUseReadableChoicesAndReturnToMovement()
        {
            var initial=Start();var baselines=new List<CampaignSession>{initial};
            var holding=Reload(initial);Hall(holding);Work(holding,"hack-door-mainhall-to-holding");holding.MoveParty("door-mainhall-to-holding");
            foreach(var id in new[]{"dialogue-operative","dialogue-holding-worker","dialogue-holding-guard"}){var s=Reload(holding);s.Talk(id);baselines.Add(s);}
            var processing=Reload(initial);Hall(processing);Work(processing,"hack-door-mainhall-to-processing");processing.MoveParty("door-mainhall-to-processing");processing.Talk("dialogue-processing-worker");baselines.Add(processing);
            int visited=0;var queue=new Queue<CampaignSession>(baselines);var seen=new HashSet<string>();
            while(queue.Count>0){var s=queue.Dequeue();var t=s.State.Expedition.Travel;var scene=s.State.Base.Mission.Travel.Conversations.Single(c=>c.Id==t.SceneId);var node=scene.Nodes.Single(n=>n.Id==t.NodeId);if(!seen.Add(scene.Id+"/"+node.Id))continue;
                foreach(var response in node.Responses){var branch=Reload(s);string selected=null;var root=new GameObject("Readable dialogue test",typeof(RectTransform));var view=root.AddComponent<MissionDialogueView>();var tick=branch.State.Clock.ElapsedTicks;
                    try{view.Show(branch,null,id=>selected=id,(r,a)=>branch.Respond(r,a),()=>branch.ContinueConversation(),null);yield return null;var choice=root.GetComponentsInChildren<Button>().Single(b=>b.name=="Choose response "+response.Id);var actors=MissionTravel.EligibleActors(branch.State,response).ToArray();Assert.That(choice.interactable,Is.EqualTo(actors.Length>0));if(actors.Length==0)continue;
                        var before=branch.State;choice.onClick.Invoke();Assert.That(selected,Is.EqualTo(response.Id));Assert.That(branch.State,Is.SameAs(before));foreach(Transform child in root.transform)UnityEngine.Object.Destroy(child.gameObject);yield return null;
                        view.Show(branch,selected,id=>selected=id,(r,a)=>branch.Respond(r,a),()=>branch.ContinueConversation(),null);yield return null;var speaker=root.GetComponentsInChildren<Button>().Single(b=>b.name=="Choose speaker "+actors[0]);Assert.That(speaker.GetComponentInChildren<Text>().text,Does.Contain(branch.State.Base.Units.Single(u=>u.Id==actors[0]).Name));speaker.onClick.Invoke();branch=Reload(branch);visited++;
                        if(branch.State.Expedition.Travel.SceneId!=null){var next=scene.Nodes.Single(n=>n.Id==branch.State.Expedition.Travel.NodeId);if(next.End){foreach(Transform child in root.transform)UnityEngine.Object.Destroy(child.gameObject);yield return null;view.Show(branch,null,id=>{},(r,a)=>{},()=>branch.ContinueConversation(),null);yield return null;root.GetComponentsInChildren<Button>().Single(b=>b.name=="Read conversation continue").onClick.Invoke();Assert.That(branch.State.Expedition.Travel.SceneId,Is.Null);}else queue.Enqueue(branch);}
                        Assert.That(branch.State.Clock.ElapsedTicks,Is.EqualTo(tick));
                    }finally{UnityEngine.Object.Destroy(root);}
                }
            }
            Assert.That(seen.Select(k=>k.Split('/')[0]).Distinct().Count(),Is.EqualTo(5));Assert.That(visited,Is.GreaterThanOrEqualTo(10));
        }
    }
}
#endif
