using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Orionis.Application;
using Orionis.Domain;
using Orionis.Infrastructure;
namespace Orionis.Tests
{
    public sealed class BaseOperationsTests
    {
        private static JObject Source()=>JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
        private static void Add(JObject source,string id,string definition,int col,int row)=>((JArray)source["rooms"]).Add(new JObject{["id"]=id,["definitionId"]=definition,["col"]=col,["row"]=row,["width"]=1,["height"]=1,["constructionTier"]=1});
        [Test] public void LocalStaffPrecedeResponseAndStickyWorkSurvivesBaseResponseSaveLoad()
        {
            var source=Source();Add(source,"response-test","response_room",0,0);var json=source.ToString();var s=new CampaignSession(new CampaignState(BootstrapReader.Read(json),new RandomState(1,1)),null);
            s.AssignUnit("unit-26","response-test");s.AssignUnit("unit-28","response-test");s.AssignUnit("unit-27","r2");
            var id=s.State.Base.Receiving.Incoming.First().Id;s.AdmitIncoming(id,"r2");s.AdvanceOneTick();Assert.That(s.State.Receiving.Single().Progress[0].ActorId,Is.EqualTo("unit-27"));
            s.UnassignUnit("unit-27");s.AdvanceOneTick();Assert.That(s.State.Receiving.Single().Progress[0].Ticks,Is.EqualTo(1),"Response cannot inherit an Actor's partial bubble.");
            s.AssignUnit("unit-27","r2");s.AdvanceOneTick();s.AdvanceOneTick();Assert.That(s.State.Receiving.Single().Progress[1].ActorId,Is.EqualTo("unit-28"));
            s.SetBaseResponse("response-test",true);var codec=new CampaignSaveCodec(json);s=new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State,null))).Campaign,null);s.AdvanceOneTick();Assert.That(s.State.Receiving.Single().Progress[1].Ticks,Is.EqualTo(1));
            s.SetBaseResponse("response-test",false);s.AdvanceOneTick();Assert.That(ReceivingWork.IsComplete(s.State.Base.Receiving,s.State.Receiving.Single()),Is.True);Assert.That(s.State.Receiving.Single().Progress[1].ActorId,Is.EqualTo("unit-28"));
            Assert.That(BaseWork.Source(s.State,"r2","unit-28"),Does.Contain("Local Response"));
            Assert.That(BaseWork.Workers(s.State,"r2","UNTRAINED",0).Any(w=>w.UnitId=="unit-1"),Is.False,"Unassigned idle roster is not an Actor pool.");
        }
        [Test] public void ConfiguredGroupToolsAndCoreServicesStayWithinPhysicalRoomGroups()
        {
            var source=Source();source["receiving"]["rooms"].Single(r=>(string)r["definitionId"]=="workshop")["services"]=new JArray("HUMAN_WORKSHOP_II");
            Add(source,"workshop-test","workshop",7,2);
            // Alternate authored test configuration: same physical Core/Service,
            // installed in a compatible Workshop to exercise joined-child scope.
            var core=source["roomCoreSetup"]["coreDefinitions"].Single(c=>(string)c["contribution"]["kind"]=="HANDLING"&&(int)c["minimumConstructionTier"]==1);((JArray)core["compatibleRoomTags"]).Add("WORKSHOP_EQUIPMENT_BAY");
            source["roomCoreSetup"]["starterInstances"][0]["roomInstanceId"]="r5";
            var s=new CampaignState(BootstrapReader.Read(source.ToString()),new RandomState(1,1));
            Assert.That(BaseWork.PersonalTool(s,"unit-25","TET2_MODIFY"),Is.False);Assert.That(BaseWork.HasTool(s,"r5","unit-25","TET2_MODIFY"),Is.True);Assert.That(BaseWork.GroupTool(s,"r4","TET2_MODIFY"),Is.False);
            s=RoomGroups.Join(s,"r5","workshop-test");Assert.That(RoomGroups.HasService(s,"workshop-test","RECEIVING_HANDLING_MEDIUM"),Is.True);Assert.That(RoomGroups.HasService(s,"r4","RECEIVING_HANDLING_MEDIUM"),Is.False);
            Assert.That(RoomCores.Provider(s,"workshop-test",s.Base.ResourceProcessing.ItemId,"HANDLING").RoomId,Is.EqualTo("r5"));
            s=RoomGroups.Split(s,"r5");Assert.That(RoomGroups.HasService(s,"workshop-test","RECEIVING_HANDLING_MEDIUM"),Is.False);
            Assert.That(BaseWork.HasTool(s,"r4","unit-25","TET2_MODIFY"),Is.False,"Owning tooling somewhere in the base does not grant global access.");
        }
        [Test] public void OperationsReflectPausedReceivingConstructionClearingAndCoreQueues()
        {
            var json=Source().ToString();var s=new CampaignSession(RoomConstruction.SeedStaff(new CampaignState(BootstrapReader.Read(json),new RandomState(1,1))),null);
            var incoming=s.State.Base.Receiving.Incoming.First().Id;s.AdmitIncoming(incoming,"r2");s.PauseInspection(incoming,true);s.ExcavateCell(0,0);s.BuildRoom("ready_room",1,0,2);s.ReconfigureCore(s.State.Cores.Instances[0].Id);
            var jobs=BaseOperations.Jobs(s.State);Assert.That(jobs.Select(j=>j.Kind),Does.Contain("receiving"));Assert.That(jobs.Select(j=>j.Kind),Does.Contain("clearing"));Assert.That(jobs.Select(j=>j.Kind),Does.Contain("construction"));Assert.That(jobs.Select(j=>j.Kind),Does.Contain("core"));
            Assert.That(jobs.Single(j=>j.Kind=="receiving").Paused,Is.True);Assert.That(jobs.Single(j=>j.Kind=="core").Status,Does.Contain("staff"));
            s.PauseInspection(incoming,false);Assert.That(BaseOperations.Jobs(s.State).Single(j=>j.Kind=="receiving").Paused,Is.False);
            var codec=new CampaignSaveCodec(json);var record=JObject.Parse(codec.Serialize(new SavedSession(s.State,null)));record["schemaVersion"]=29;record.Property("archivedCargoSupply")?.Remove();record.Property("completedWork").Remove();record.Property("workforce").Remove();record.Property("baseExecutionFingerprint").Remove();
            var upgraded=codec.Deserialize(record.ToString()).Campaign;Assert.That(upgraded.Workforce.BaseResponseRooms,Is.Empty);Assert.That(upgraded.Cores.Instances.Count,Is.EqualTo(2));Assert.That(BaseOperations.Jobs(upgraded).Count,Is.EqualTo(BaseOperations.Jobs(s.State).Count));
        }
    }
}
