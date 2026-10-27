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
    public sealed class MissionFieldTests
    {
        private const string Recipe = "hack-door-mainhall-to-holding", Door = "door-mainhall-to-holding";
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private CampaignSession Hall(string actor = "unit-19", Action<JObject> edit = null)
        {
            var j = JObject.Parse(Json); edit?.Invoke(j);
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(j.ToString()), new RandomState(1, 1)), null);
            s.Deploy(new[] { actor }); s.ChooseGate(true); s.MoveParty("door-gate-to-yard"); s.Respond("yard-ignore", actor); s.MoveParty("door-yard-to-mainhall"); return s;
        }
        private string Tool(CampaignSession s) => MissionField.Candidates(s.State, s.State.Base.Mission.Travel.Field.DoorRecipes.Single(r=>r.DoorId==Door)).First().ToolId;
        private CampaignSession Reload(CampaignSession s)
        { var c = new CampaignSaveCodec(Json); return new CampaignSession(c.Deserialize(c.Serialize(new SavedSession(s.State, null))).Campaign, null); }
        [Test] public void Schema33MigrationAddsOnlyUnobservedLabDefinitions()
        {
            var old=JObject.Parse(Json);old["mission"]=JObject.Parse(File.ReadAllText("../tools/fixtures/mission-before-lab.json"));old["missionCargo"]=JObject.Parse(File.ReadAllText("../tools/fixtures/cargo-before-lab.json"));
            var s=new CampaignSession(new CampaignState(BootstrapReader.Read(old.ToString()),new RandomState(1,1)),null);s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);s.MoveParty("door-gate-to-yard");
            var save=JObject.Parse(new CampaignSaveCodec(old.ToString()).Serialize(new SavedSession(s.State,null)));save["schemaVersion"]=33;var restored=new CampaignSaveCodec(Json).Deserialize(save.ToString()).Campaign;
            Assert.That(restored.Clock.ElapsedTicks,Is.EqualTo(s.State.Clock.ElapsedTicks));Assert.That(restored.Expedition.Travel.SceneId,Is.EqualTo(s.State.Expedition.Travel.SceneId));Assert.That(restored.Expedition.Travel.Knowledge,Is.EquivalentTo(s.State.Expedition.Travel.Knowledge));Assert.That(restored.Expedition.Travel.Field.Subjects.Single(x=>x.Id=="lab-mounted-rifle-01").Detection,Is.EqualTo("HIDDEN"));Assert.That(restored.Expedition.Travel.Field.Completed,Is.Empty);Assert.That(restored.Cargo,Is.Empty);
        }
        [TestCase("unit-19")][TestCase("unit-6")]
        public void DoorWorkReservesWithoutSpendingCancelsReloadsAndCommitsOnce(string actor)
        {
            var s = Hall(actor); var original = s.State; Assert.Throws<InvalidOperationException>(() => s.MoveParty(Door)); Assert.That(s.State, Is.SameAs(original));
            var tool = Tool(s); s.StartFieldWork(Recipe, actor, tool);
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(2)); Assert.That(s.State.Expedition.Party.Single().Tools.Single(t => t.InstanceId == tool).Charges, Is.EqualTo(9));
            original = s.State; Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-yard-to-mainhall")); Assert.That(s.State, Is.SameAs(original));
            s.CancelFieldWork(); Assert.That(s.State.Expedition.Travel.Field.Completed, Is.Empty);
            s.StartFieldWork(Recipe, actor, tool); s = Reload(s);
            Assert.That(s.State.Expedition.Travel.Field.Work.ActorId, Is.EqualTo(actor)); Assert.That(s.State.Expedition.Travel.Field.Work.ToolId, Is.EqualTo(tool));
            s.AdvanceFieldWork(); s = Reload(s);
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(3)); Assert.That(s.State.Expedition.Party.Single().Tools.Single(t => t.InstanceId == tool).Charges, Is.EqualTo(8));
            Assert.That(s.State.Expedition.Travel.OpenDoors, Does.Contain(Door)); Assert.That(s.State.Expedition.Travel.Field.Work, Is.Null);
            original = s.State; Assert.Throws<InvalidOperationException>(s.AdvanceFieldWork); Assert.Throws<InvalidOperationException>(() => s.StartFieldWork(Recipe, actor, tool)); Assert.That(s.State, Is.SameAs(original));
            var refillCodec=new CampaignSaveCodec(Json);var refill=JObject.Parse(refillCodec.Serialize(new SavedSession(s.State,null)));
            refill["expedition"]["party"][0]["tools"].Single(t=>(string)t["instanceId"]==tool)["charges"]=9;
            refill["expedition"]["travel"]["field"]["completed"][0]["toolChargesRestored"]=true;
            s=new CampaignSession(refillCodec.Deserialize(refill.ToString()).Campaign,null);s=Reload(s);
            Assert.That(s.State.Expedition.Party.Single().Tools.Single(t=>t.InstanceId==tool).Charges,Is.EqualTo(9));
            s.MoveParty(Door); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(4));
            Assert.That(s.State.Expedition.Travel.Knowledge, Does.Contain("operative-located"));
            Assert.That(s.State.Expedition.Travel.Field.Objectives["locate-operative"], Is.EqualTo("COMPLETED"));
            Assert.That(s.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("ACTIVE"));
            Assert.That(s.State.Random.Value, Is.EqualTo(1));
        }
        [Test] public void ContactIsLocalFreeAndReloadDoesNotReplayGuardOrKnowledgeEffects()
        {
            var s = Hall(); Assert.Throws<InvalidOperationException>(() => s.Talk("dialogue-operative"));
            s.StartFieldWork(Recipe, "unit-19", Tool(s)); s.AdvanceFieldWork(); s.MoveParty(Door); s.Talk("dialogue-operative");
            s = Reload(s); s = Reload(s);
            Assert.That(s.State.Expedition.Travel.SceneId, Is.EqualTo("dialogue-operative"));
            Assert.That(s.State.Expedition.Travel.Npcs.Single(n => n.Id == "guard-holding-01").Suspicion, Is.EqualTo(65));
            Assert.That(s.State.Expedition.Travel.Knowledge.Count(k => k == "operative-located"), Is.EqualTo(1));
            s.Respond("operative-ready", "unit-19"); s = Reload(s);
            Assert.That(s.State.Expedition.Travel.Knowledge, Does.Contain("operative-contacted"));
            Assert.That(s.State.Expedition.Travel.Field.Subjects.Single(x => x.Id == "operative-01").Evacuation, Is.EqualTo("READY_TO_EVACUATE"));
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(4)); Assert.That(s.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("ACTIVE"));
            var original = s.State; Assert.Throws<InvalidOperationException>(() => s.Talk("dialogue-operative")); Assert.That(s.State, Is.SameAs(original));
        }
        [TestCase("profession")][TestCase("service")][TestCase("charges")][TestCase("damage")]
        public void MissingExecutionCapabilityNeverOpensDoorOrSpendsTime(string problem)
        {
            var actor = problem == "profession" ? "unit-1" : "unit-19";
            var s = Hall(actor, j =>
            {
                var tool = j["mission"]["personnel"].Single(p => (string)p["id"] == actor)["tools"][0];
                if (problem == "service") tool["services"] = new JArray();
                if (problem == "charges") tool["charges"] = 0;
                if (problem == "damage") tool["damaged"] = true;
            });
            Assert.That(MissionField.Candidates(s.State, s.State.Base.Mission.Travel.Field.DoorRecipes.Single(r=>r.DoorId==Door)), Is.Empty);
            var before = s.State; Assert.Throws<InvalidOperationException>(() => s.StartFieldWork(Recipe, actor, s.State.Expedition.Party[0].Tools[0].InstanceId)); Assert.That(s.State, Is.SameAs(before));
        }
        [Test] public void DoorCompletionUsesCampaignTickAndClosesExpiringGate()
        {
            var s = Hall(); var state = s.State;
            for (int i = 0; i < 9; i++) state = ReceivingWork.AdvanceTick(state);
            s = new CampaignSession(state, null); s.StartFieldWork(Recipe, "unit-19", Tool(s)); s.AdvanceFieldWork();
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(12)); Assert.That(s.State.Expedition.GateOpen, Is.False);
        }
        [TestCase("actor")][TestCase("tool")][TestCase("time")][TestCase("open")][TestCase("extracted")][TestCase("objective")][TestCase("missing")]
        public void CorruptFieldReferencesAndInventedExtractionAreRejected(string problem)
        {
            var s = Hall(); s.StartFieldWork(Recipe, "unit-19", Tool(s)); var c = new CampaignSaveCodec(Json);
            var j = JObject.Parse(c.Serialize(new SavedSession(s.State, null))); var t = j["expedition"]["travel"]; var f = t["field"];
            if (problem == "actor") f["work"]["actorId"] = "unit-1";
            if (problem == "tool") f["work"]["toolId"] = "borrowed-tool";
            if (problem == "time") f["work"]["startedTick"] = 99;
            if (problem == "open") ((JArray)t["openDoors"]).Add(Door);
            if (problem == "extracted") f["subjects"][0]["evacuation"] = "EXTRACTED";
            if (problem == "objective") f["objectives"]["extract-operative"] = "COMPLETED";
            if (problem == "missing") ((JObject)t).Property("field").Remove();
            Assert.Catch(() => c.Deserialize(j.ToString()));
        }
        [Test] public void PinnedVersionSevenMigrationPreservesConversationWithoutNewExplorationOrFacts()
        {
            var json = File.ReadAllText("../tools/fixtures/bootstrap-before-holding-route.json");
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(json), new RandomState(1, 1)), null);
            s.Deploy(new[] { "unit-6" }); s.ChooseGate(false); s.MoveParty("door-gate-to-yard"); s.Respond("yard-soldier-press-policy", "unit-6");
            var j = JObject.Parse(new CampaignSaveCodec(json).Serialize(new SavedSession(s.State, null))); j["schemaVersion"] = 7;j.Property("archivedCargoSupply")?.Remove(); j.Property("teams").Remove();
            ((JObject)j["expedition"]["travel"]).Property("field").Remove();
            var restored = new CampaignSaveCodec(Json).Deserialize(j.ToString()).Campaign;
            Assert.That(restored.Expedition.Travel.NodeId, Is.EqualTo("yard-policy-answer"));
            Assert.That(restored.Expedition.Travel.Npcs.Single(n => n.Id == "guard-yard-01").Suspicion, Is.EqualTo(45));
            Assert.That(restored.Expedition.Travel.Npcs.Single(n => n.Id == "guard-holding-01").Suspicion, Is.EqualTo(20));
            Assert.That(restored.Expedition.Travel.Knowledge, Does.Not.Contain("operative-located"));
            Assert.That(restored.Expedition.Travel.Visits.Keys, Does.Not.Contain("stage-holding-area"));
        }
        [TestCase("fact")][TestCase("stage")]
        public void LegacyMigrationCannotIntroduceFutureRouteState(string problem)
        {
            var json = File.ReadAllText("../tools/fixtures/bootstrap-before-holding-route.json");
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(json), new RandomState(1, 1)), null);
            s.Deploy(new[] { "unit-6" }); s.ChooseGate(false); s.MoveParty("door-gate-to-yard");
            var j = JObject.Parse(new CampaignSaveCodec(json).Serialize(new SavedSession(s.State, null))); j["schemaVersion"] = 7;j.Property("archivedCargoSupply")?.Remove(); j.Property("teams").Remove();
            var t = j["expedition"]["travel"]; ((JObject)t).Property("field").Remove();
            if (problem == "fact") ((JArray)t["knowledge"]).Add("operative-located");
            else { j["expedition"]["stageId"] = "stage-holding-area"; ((JArray)t["visits"]).Add(new JObject { ["stageId"] = "stage-holding-area", ["count"] = 1 }); }
            Assert.Catch(() => new CampaignSaveCodec(Json).Deserialize(j.ToString()));
        }
    }
}
