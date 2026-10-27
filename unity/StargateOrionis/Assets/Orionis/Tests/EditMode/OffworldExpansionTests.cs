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
    public sealed class OffworldExpansionTests
    {
        private static CampaignSession Create(string json)=>new CampaignSession(new CampaignState(BootstrapReader.Read(json),new RandomState(1,1)),null);
        private static void Work(CampaignSession s,string id){var r=MissionField.Requirements(s.State,id);var c=MissionField.Candidates(s.State,r).First();s.StartFieldWork(id,c.ActorId,c.ToolId);s.AdvanceFieldWork();}
        private static void Clear(CampaignSession s){for(int i=0;i<100&&MissionCombat.Active(s.State)!=null;i++)s.AdvanceCombatRound();Assert.That(MissionCombat.Active(s.State),Is.Null);}
        private static void MainHall(CampaignSession s){s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);s.MoveParty("door-gate-to-yard");s.Respond("yard-ignore","unit-6");s.Engage("incident-yard-guards");Clear(s);s.MoveParty("door-yard-to-mainhall");}
        [Test] public void WiderRoutesRespectKnowledgePreparationAndSaveLoad()
        {
            string json=File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");var s=Create(json);Assert.That(s.State.Base.Mission.Travel.Stages.Count,Is.EqualTo(10));MainHall(s);
            s.MoveParty("door-mainhall-to-security");s.MoveParty("door-security-to-office");Assert.Throws<InvalidOperationException>(()=>s.MoveParty("door-stage-hidden-safe"));Assert.That(s.State.Expedition.Travel.Visits.ContainsKey("stage-hidden-safe"),Is.False);
            s.MoveParty("door-processing-to-office");var inquiry=s.State.Base.Mission.Travel.Field.Actions.Single(a=>a.Id=="inquire-worker-processing");Assert.That(MissionField.ActionBlocker(s.State,inquiry),Is.Not.Null);Assert.Throws<InvalidOperationException>(()=>s.StartFieldWork(inquiry.Id,"unit-46",null));
            Work(s,"isolate-mining-power");Work(s,inquiry.Id);Assert.That(s.State.Expedition.Travel.Knowledge,Does.Contain("office-hidden-safe-known"));s.MoveParty("door-processing-to-office");s.MoveParty("door-stage-hidden-safe");
            var codec=new CampaignSaveCodec(json);s=new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State,null))).Campaign,null);Assert.That(s.State.Expedition.StageId,Is.EqualTo("stage-hidden-safe"));Assert.That(s.State.Expedition.Travel.Knowledge,Does.Contain("office-hidden-safe-known"));
            s.MoveParty("door-stage-hidden-safe");s.MoveParty("door-security-to-office");s.MoveParty("door-mainhall-to-security");Work(s,"hack-door-mainhall-to-holding");s.MoveParty("door-mainhall-to-holding");Assert.Throws<InvalidOperationException>(()=>s.MoveParty("door-stage-hidden-store"));Work(s,"small-talk-worker-holding");Clear(s);s.MoveParty("door-stage-hidden-store");Assert.That(s.State.Expedition.Travel.Visits.ContainsKey("stage-hidden-store"),Is.True);
        }
        [Test] public void ExistingExpeditionMigratesOnlyNewNpcDefinitionsWithoutChangingProgress()
        {
            string json=File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");var old=JObject.Parse(json);old["mission"]=old["previousOffworldMission"].DeepClone();old["missionCombat"]=old["previousOffworldCombat"].DeepClone();var stages=old["mission"]["travel"]["stages"].Select(s=>(string)s["id"]).ToHashSet();old["missionMap"]["stages"]=new JArray(old["missionMap"]["stages"].Where(s=>stages.Contains((string)s["id"])).Select(s=>s.DeepClone()));
            var s=Create(old.ToString());MainHall(s);long tick=s.State.Clock.ElapsedTicks;var visits=s.State.Expedition.Travel.Visits.ToDictionary(p=>p.Key,p=>p.Value);var before=s.State.Expedition.Travel.Npcs.ToDictionary(n=>n.Id,n=>n.Suspicion);
            var oldCodec=new CampaignSaveCodec(old.ToString());var codec=new CampaignSaveCodec(json);var restored=codec.Deserialize(oldCodec.Serialize(new SavedSession(s.State,null)));Assert.That(restored.Campaign.Clock.ElapsedTicks,Is.EqualTo(tick));Assert.That(restored.Campaign.Expedition.Travel.Visits,Is.EquivalentTo(visits));foreach(var pair in before)Assert.That(restored.Campaign.Expedition.Travel.Npcs.Single(n=>n.Id==pair.Key).Suspicion,Is.EqualTo(pair.Value));Assert.That(restored.Campaign.Expedition.Travel.Npcs.Count,Is.EqualTo(restored.Campaign.Base.Mission.Travel.Npcs.Count));
            var resaved=codec.Serialize(restored);Assert.That(codec.Serialize(codec.Deserialize(resaved)),Is.EqualTo(resaved));
        }
        [Test] public void WorkerConversationsPreserveExpandedSavesAndExposeOnlyAuthoredClues()
        {
            string json=File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");var old=JObject.Parse(json);old["mission"]=old["previousOffworldInteractionMission"].DeepClone();var prior=Create(old.ToString());MainHall(prior);
            var codec=new CampaignSaveCodec(json);var restored=codec.Deserialize(new CampaignSaveCodec(old.ToString()).Serialize(new SavedSession(prior.State,null)));var s=new CampaignSession(restored.Campaign,null);
            Assert.That(s.State.Expedition.Travel.Knowledge,Does.Not.Contain("holding-hidden-entrance-known"));Assert.That(s.State.Expedition.Travel.Npcs.Count,Is.EqualTo(s.State.Base.Mission.Travel.Npcs.Count));
            Work(s,"hack-door-mainhall-to-holding");s.MoveParty("door-mainhall-to-holding");s.Talk("dialogue-holding-worker");s.Respond("holding-worker-smalltalk","unit-46");Assert.That(s.State.Expedition.Travel.Knowledge,Does.Contain("holding-hidden-entrance-known"));
            var saved=codec.Serialize(new SavedSession(s.State,null));Assert.That(codec.Serialize(codec.Deserialize(saved)),Is.EqualTo(saved));
        }
    }
}
