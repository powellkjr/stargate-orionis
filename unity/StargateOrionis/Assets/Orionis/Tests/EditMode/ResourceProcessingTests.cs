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
    public sealed class ResourceProcessingTests
    {
        private string json;
        private CampaignSession Create(bool almostFull=false,bool historical=false)
        {
            var source=JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            if(historical)source["resourceProcessing"]=source["previousResourceProcessing"].DeepClone();
            if(almostFull){source["roomConstruction"]["startingSupply"]=JObject.FromObject(new{S1=1900,S2=50,S3=49});}
            json=source.ToString();var s=new CampaignSession(RoomConstruction.SeedStaff(new CampaignState(BootstrapReader.Read(json),new RandomState(1,1))),null);
            var migrationCodec=new CampaignSaveCodec(json);var legacy=JObject.Parse(migrationCodec.Serialize(new SavedSession(s.State,null)));legacy["schemaVersion"]=23;legacy.Property("archivedCargoSupply")?.Remove();legacy.Property("completedWork").Remove();legacy.Property("workforce").Remove();legacy.Property("baseExecutionFingerprint").Remove();legacy.Property("roomCores").Remove();legacy.Property("roomCoreFingerprint").Remove();legacy.Property("resourceProcessingFingerprint").Remove();legacy.Property("personnelRecoveryFingerprint").Remove();
            using(var hash=System.Security.Cryptography.SHA256.Create())legacy["missionFingerprint"]=BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(source["previousProcessingMission"].ToString(Newtonsoft.Json.Formatting.None)))).Replace("-","").ToLowerInvariant();
            s=new CampaignSession(migrationCodec.Deserialize(legacy.ToString()).Campaign,null);
            s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);s.MoveParty("door-gate-to-yard");s.Respond("yard-ignore","unit-6");s.Engage("incident-yard-guards");for(int i=0;i<100&&MissionCombat.Active(s.State)!=null;i++)s.AdvanceCombatRound();s.MoveParty("door-yard-to-mainhall");Work(s,"hack-door-mainhall-to-processing");s.MoveParty("door-mainhall-to-processing");
            Assert.That(ResourceCargo.StageSafe(s.State,"stage-processing"),Is.False);Work(s,"isolate-mining-power");Assert.That(ResourceCargo.StageSafe(s.State,"stage-processing"),Is.True);
            return s;
        }
        private void Work(CampaignSession s,string recipe){var c=MissionField.Candidates(s.State,MissionField.Requirements(s.State,recipe)).First();s.StartFieldWork(recipe,c.ActorId,c.ToolId);s.AdvanceFieldWork();}
        private CampaignSession Reload(CampaignSession s){var codec=new CampaignSaveCodec(json);return new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State,null))).Campaign,null);}
        private CampaignSession Return(CampaignSession s)
        {
            s.InspectResourceCache();Assert.That(ResourceCargo.Known(s.State,s.State.Cargo.Single(),"QUALITY"),Is.True);Assert.That(ResourceCargo.Known(s.State,s.State.Cargo.Single(),"CONVERSION"),Is.False);s=Reload(s);s.InspectResourceCache();Work(s,"collect-supply-cache");
            var id=s.State.Cargo.Single().Id;s.MoveParty("door-mainhall-to-processing");s.MoveParty("door-yard-to-mainhall");s.MoveParty("door-gate-to-yard");s.RedialGate();s.ExtractMission();s=Reload(s);Assert.That(s.State.Cargo.Single().Id,Is.EqualTo(id));Assert.That(s.State.Cargo.Single().ResourceWork.Committed.Count,Is.EqualTo(2));
            s.AssignUnit("unit-25","r2");s.AssignUnit("unit-37","r2");s.AdmitResourceCache(id,"r2");return s;
        }
        [Test] public void LoadThenResetKeepsDepositsAndArchivesCreditsAcrossFurtherWork()
        {
            var s=Return(Create());for(int i=0;i<12;i++)s.AdvanceOneTick();Assert.That(ResourceCargo.Consumed(s.State,s.State.Cargo.Single()),Is.True);s=Reload(s);
            var stock=s.State.Construction.Supply.ToDictionary(p=>p.Key,p=>p.Value);var staff=s.State.Assignments.Select(a=>a.UnitId+"/"+a.RoomInstanceId).ToArray();long credit=ResourceCargo.CommittedSupply(s.State,"S1");Assert.That(credit,Is.GreaterThan(0));s.ResetMission();
            Assert.That(s.State.Cargo,Is.Empty);Assert.That(s.State.Construction.Supply,Is.EquivalentTo(stock));Assert.That(s.State.Assignments.Select(a=>a.UnitId+"/"+a.RoomInstanceId),Is.EqualTo(staff));Assert.That(s.State.Construction.ArchivedCargoSupply["S1"],Is.EqualTo(credit));
            s=Reload(s);s.AdvanceOneTick();s.ResetMission();s=Reload(s);Assert.That(s.State.Construction.Supply,Is.EquivalentTo(stock));Assert.That(s.State.Construction.ArchivedCargoSupply["S1"],Is.EqualTo(credit));
            var codec=new CampaignSaveCodec(json);var tampered=JObject.Parse(codec.Serialize(new SavedSession(s.State,null)));tampered["supplyStock"]["S1"]=(double)tampered["supplyStock"]["S1"]+1;Assert.Throws<InvalidOperationException>(()=>codec.Deserialize(tampered.ToString()));
        }
        [Test] public void ProcessingRoomCacheRetainsFieldInspectionAndDepositsBalancedSupplyExactlyOnce()
        {
            var s=Return(Create());var initial=s.State.Construction.Supply.ToDictionary(p=>p.Key,p=>p.Value);
            s.UnassignUnit("unit-25");s.UnassignUnit("unit-37");
            Assert.That(ResourceCargo.BlockedReason(s.State,s.State.Cargo.Single()),Does.Contain("Receiving staff"));
            s.AdvanceOneTick();Assert.That(s.State.Cargo.Single().ResourceWork.Committed.Count,Is.EqualTo(2));
            s.AssignUnit("unit-25","r2");s.AssignUnit("unit-37","r2");
            s.AdvanceOneTick();var medium=s.State.Cores.Instances.Single(c=>RoomCores.Definition(s.State,c).Kind=="HANDLING");s.ReconfigureCore(medium.Id);
            s.AdvanceOneTick();Assert.That(s.State.Cores.Orders.Single().Work.Committed.Count,Is.Zero);
            for(int i=0;i<7;i++)s.AdvanceOneTick();
            var item=s.State.Cargo.Single();Assert.That(ResourceCargo.Consumed(s.State,item),Is.True);Assert.That(s.State.Construction.Supply["S1"],Is.EqualTo(initial["S1"]+61));Assert.That(s.State.Construction.Supply["S2"],Is.EqualTo(initial["S2"]+15));Assert.That(item.CustodyRoomId,Is.Null);
            s=Reload(s);s.RetryResourceOutputs();s.AdvanceOneTick();Assert.That(s.State.Construction.Supply["S1"],Is.EqualTo(initial["S1"]+61));Assert.Throws<InvalidOperationException>(s.RecoverResourceCache);
        }
        [Test] public void MediumAuthoringUpgradesUnstartedSavesButPreservesStartedLegacyTransactions()
        {
            var current=File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
            var currentCodec=new CampaignSaveCodec(current);
            var oldSource=JObject.Parse(current);oldSource["resourceProcessing"]=oldSource["previousResourceProcessing"].DeepClone();
            var oldCodec=new CampaignSaveCodec(oldSource.ToString());
            var fresh=new CampaignState(BootstrapReader.Read(oldSource.ToString()),new RandomState(1,1));
            var upgraded=currentCodec.Deserialize(oldCodec.Serialize(new SavedSession(fresh,null)));
            Assert.That(upgraded.Campaign.Base.ResourceProcessing.Bubbles.Count,Is.EqualTo(10));
            Assert.That(currentCodec.Deserialize(currentCodec.Serialize(upgraded)).Campaign.Base.ResourceProcessing.Bubbles.Count,Is.EqualTo(10));

            var legacy=Return(Create(historical:true));var initial=legacy.State.Construction.Supply.ToDictionary(p=>p.Key,p=>p.Value);
            legacy.AdvanceOneTick();var before=JObject.Parse(oldCodec.Serialize(new SavedSession(legacy.State,null)));
            var restored=currentCodec.Deserialize(before.ToString());
            Assert.That(restored.Campaign.Base.ResourceProcessing.Bubbles.Count,Is.EqualTo(20));
            var resaved=JObject.Parse(currentCodec.Serialize(restored));
            Assert.That(JToken.DeepEquals(before["cargo"][0]["resourceProcess"],resaved["cargo"][0]["resourceProcess"]),Is.True);
            Assert.That(JToken.DeepEquals(before["supplyStock"],resaved["supplyStock"]),Is.True);
            var resumed=new CampaignSession(currentCodec.Deserialize(resaved.ToString()).Campaign,null);
            for(int i=0;i<9;i++)resumed.AdvanceOneTick();
            Assert.That(ResourceCargo.Consumed(resumed.State,resumed.State.Cargo.Single()),Is.True);
            Assert.That(resumed.State.Construction.Supply["S1"],Is.EqualTo(initial["S1"]+123));
            Assert.That(resumed.State.Construction.Supply["S2"],Is.EqualTo(initial["S2"]+30));
        }
        [Test] public void FinishedOutcomesSurviveFullStorageAndRetryWithoutWorkTimeOrReroll()
        {
            var s=Return(Create(true));s.AdvanceOneTick();var item=s.State.Cargo.Single();Assert.That(item.ResourceWork.Bubbles.Count(b=>b.CompletedTick.HasValue),Is.EqualTo(4));Assert.That(item.ResourceWork.Committed.Count,Is.EqualTo(2));Assert.That(s.State.Construction.Supply.Values.Sum(),Is.EqualTo(1999));s=Reload(s);
            var tick=s.State.Clock.ElapsedTicks;var actor=s.State.Cargo.Single().ResourceWork.Bubbles[2].ActorId;s.BuildRoom("ready_room",1,0,2);s.RetryResourceOutputs();Assert.That(s.State.Clock.ElapsedTicks,Is.EqualTo(tick));Assert.That(s.State.Cargo.Single().ResourceWork.Committed.Count,Is.EqualTo(4));Assert.That(s.State.Cargo.Single().ResourceWork.Bubbles[2].ActorId,Is.EqualTo(actor));var codec=new CampaignSaveCodec(json);var before=codec.Serialize(new SavedSession(s.State,null));s.RetryResourceOutputs();Assert.That(codec.Serialize(new SavedSession(s.State,null)),Is.EqualTo(before));
            var bad=JObject.Parse(before);bad["cargo"][0]["resourceProcess"]["resourceOutcomes"][2]["resources"]["S1"]=999;Assert.Catch(()=>codec.Deserialize(bad.ToString()));
        }
    }
}
