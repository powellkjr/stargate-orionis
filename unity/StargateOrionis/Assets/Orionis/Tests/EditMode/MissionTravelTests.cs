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
    public sealed class MissionTravelTests
    {
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private CampaignSession Create(params string[] units)
        {
            var session = new CampaignSession(new CampaignState(BootstrapReader.Read(Json), new RandomState(1, 1)), null);
            session.Deploy(units.Length == 0 ? new[] { "unit-1" } : units); return session;
        }
        private CampaignState Roundtrip(CampaignState state)
        { var codec = new CampaignSaveCodec(Json); return codec.Deserialize(codec.Serialize(new SavedSession(state, null))).Campaign; }
        [Test] public void NormalEntryRequiresGateChoiceAndConversationAndCommitsExactlyOneTickPerMove()
        {
            var s = Create(); var original = s.State;
            Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-gate-to-yard")); Assert.That(s.State, Is.SameAs(original));
            s.ChooseGate(true); s.MoveParty("door-gate-to-yard");
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(1)); Assert.That(s.State.Expedition.StageId, Is.EqualTo("stage-outer-yard"));
            Assert.That(s.State.Expedition.Travel.SceneId, Is.EqualTo("dialogue-yard-entry"));
            original = s.State; Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-yard-to-mainhall")); Assert.That(s.State, Is.SameAs(original));
            s.Respond("yard-ignore", "unit-1"); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(1));
            s.MoveParty("door-yard-to-mainhall"); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(2));
            Assert.That(s.State.Expedition.StageId, Is.EqualTo("stage-main-hall"));
            Assert.That(s.State.Expedition.Travel.Visits["stage-main-hall"], Is.EqualTo(1));
            Assert.That(s.State.Random.Value, Is.EqualTo(1));
            Assert.That(s.State.Expedition.Party[0].Tools.Select(t => t.Charges), Is.EqualTo(new[] { 3 }));
            s.MoveParty("door-yard-to-mainhall"); Assert.That(s.State.Expedition.Travel.SceneId, Is.Null);
            s.MoveParty("door-gate-to-yard"); Assert.That(s.State.Expedition.StageId, Is.EqualTo("stage-gate-yard"));
        }
        [TestCase("unit-46")][TestCase("unit-9")]
        public void DiplomatAndQualifiedCrosspathApplyAuthoredKnowledgeOnceAcrossReload(string actor)
        {
            var s = Create(actor); s.ChooseGate(false); s.MoveParty("door-gate-to-yard");
            s = new CampaignSession(Roundtrip(s.State), null);
            s.Respond("yard-diplomat-smalltalk", actor);
            var restored = Roundtrip(s.State);
            Assert.That(restored.Expedition.Travel.Knowledge, Does.Contain("reynolds-is-security-supervisor"));
            Assert.That(restored.Expedition.Travel.Knowledge.Count(k => k == "reynolds-is-security-supervisor"), Is.EqualTo(1));
            Assert.That(restored.Expedition.Travel.NodeId, Is.EqualTo("yard-smalltalk-answer"));
            Assert.That(restored.Expedition.Travel.History.Last().ActorId, Is.Null);
            Assert.That(restored.Expedition.Travel.History.Single(l => l.EntryId == "yard-diplomat-smalltalk").ActorId, Is.EqualTo(actor));
            s = new CampaignSession(restored, null); s.ContinueConversation(); s.MoveParty("door-yard-to-mainhall");
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(2)); Assert.That(s.State.Expedition.GateOpen, Is.False);
        }
        [Test] public void UnqualifiedResponderAndNonAdjacentOrUnportedDoorRejectWithoutStateChange()
        {
            var s = Create(); s.ChooseGate(true); s.MoveParty("door-gate-to-yard"); var original = s.State;
            Assert.Throws<InvalidOperationException>(() => s.Respond("yard-diplomat-smalltalk", "unit-1"));
            Assert.Throws<InvalidOperationException>(() => s.Respond("yard-ignore", "unit-46"));
            Assert.That(s.State, Is.SameAs(original)); s.Respond("yard-ignore", "unit-1"); original = s.State;
            Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-mainhall-to-holding")); Assert.That(s.State, Is.SameAs(original));
            s.MoveParty("door-yard-to-mainhall"); original = s.State;
            Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-mainhall-to-holding")); Assert.That(s.State, Is.SameAs(original));
            Assert.Throws<InvalidOperationException>(s.RedialGate);
        }
        [Test] public void SuspicionAndDispositionSurviveReloadWithoutReplayingNodeEffects()
        {
            var s = Create("unit-6"); s.ChooseGate(true); s.MoveParty("door-gate-to-yard"); s.Respond("yard-soldier-press-policy", "unit-6");
            for (int i = 0; i < 3; i++) s = new CampaignSession(Roundtrip(s.State), null);
            var guard = s.State.Expedition.Travel.Npcs.Single(n => n.Id == "guard-yard-01"); Assert.That(guard.Suspicion, Is.EqualTo(45)); Assert.That(guard.Disposition, Is.EqualTo("SUSPICIOUS"));
            s.ContinueConversation(); s.MoveParty("door-yard-to-mainhall"); s.MoveParty("door-yard-to-mainhall");
            Assert.That(s.State.Expedition.Travel.SceneId, Is.Null); Assert.That(s.State.Expedition.Travel.StartedConversations.Count, Is.EqualTo(1));
        }
        [Test] public void TwelveMovesExpireGateAndOnlyRedialAtGateReopensIt()
        {
            var s = Create(); s.ChooseGate(true); s.MoveParty("door-gate-to-yard"); s.Respond("yard-ignore", "unit-1");
            for (int i = 0; i < 11; i++) s.MoveParty("door-gate-to-yard");
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(12)); Assert.That(s.State.Expedition.GateOpen, Is.False);
            s = new CampaignSession(Roundtrip(s.State), null); s.RedialGate();
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(13)); Assert.That(s.State.Expedition.GateOpen, Is.True);
        }
        [TestCase("node")][TestCase("actor")][TestCase("visits")][TestCase("knowledge")][TestCase("npc")][TestCase("missing")]
        public void MalformedTravelSaveIsRejected(string problem)
        {
            var s = Create(); s.ChooseGate(true); s.MoveParty("door-gate-to-yard"); var codec = new CampaignSaveCodec(Json);
            var saved = JObject.Parse(codec.Serialize(new SavedSession(s.State, null))); var t = saved["expedition"]["travel"];
            if (problem == "node") t["nodeId"] = "unknown";
            if (problem == "actor") t["history"][0]["actorId"] = "not-deployed";
            if (problem == "visits") t["visits"][0]["count"] = 900;
            if (problem == "knowledge") ((JArray)t["knowledge"]).Add("invented-technology");
            if (problem == "npc") t["npcs"][0]["suspicion"] = 101;
            if (problem == "missing") ((JObject)saved["expedition"]).Property("travel").Remove();
            Assert.Catch(() => codec.Deserialize(saved.ToString()));
        }
        [Test] public void RealVersionSixSnapshotMigratesGatePartyWithoutInventedExploration()
        {
            var old = JObject.Parse(Json); ((JObject)old["mission"]).Property("travel").Remove();
            old.Property("cargoHandling").Remove(); old.Property("missionCargo").Remove(); old.Property("missionCare").Remove(); old.Property("missionRescue").Remove();
            ((JObject)old["mission"]).Property("previousTravelFingerprint")?.Remove(); ((JObject)old["mission"]).Property("previousTravelNpcIds")?.Remove();
            ((JObject)old["mission"]).Property("previousTravelDefinition")?.Remove();
            var oldJson = old.ToString(); var initial = new CampaignState(BootstrapReader.Read(oldJson), new RandomState(1, 1));
            var deployed = Expeditions.ChooseGate(Expeditions.Deploy(initial, new[] { "unit-6" }), true);
            var saved = JObject.Parse(new CampaignSaveCodec(oldJson).Serialize(new SavedSession(deployed, null)));
            saved["schemaVersion"] = 6;saved.Property("archivedCargoSupply")?.Remove(); saved.Property("teams").Remove(); saved.Property("combatFingerprint").Remove(); saved.Property("careFingerprint").Remove(); saved.Property("rescueFingerprint").Remove(); ((JObject)saved["expedition"]).Property("travel").Remove();
            var restored = new CampaignSaveCodec(Json).Deserialize(saved.ToString()).Campaign;
            Assert.That(restored.Expedition.Travel.Visits.Keys, Is.EqualTo(new[] { "stage-gate-yard" }));
            Assert.That(restored.Expedition.Travel.History, Is.Empty); Assert.That(restored.Expedition.Party[0].UnitId, Is.EqualTo("unit-6"));
            Assert.That(restored.Expedition.GateOpen, Is.True);
        }
    }
}
