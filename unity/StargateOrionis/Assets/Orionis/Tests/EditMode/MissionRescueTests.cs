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
    public sealed class MissionRescueTests
    {
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private CampaignSession Create(bool prepare = true, bool permanentTeam = false)
        {
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(Json), new RandomState(1, 1)), null);
            var members = new[] { "unit-6", "unit-10", "unit-37", "unit-46" };
            if (permanentTeam) { s.CreateTeam("r6", "SG-1"); foreach (var id in members) s.SetTeamMember("sg-team-r6", id, true); s.DeployTeam("sg-team-r6"); }
            else s.Deploy(members);
            s.ChooseGate(false);
            if (!prepare) return s;
            s.MoveParty("door-gate-to-yard"); s.Respond("yard-ignore", "unit-6"); Fight(s, "incident-yard-guards");
            s.MoveParty("door-yard-to-mainhall"); Work(s, s.State.Base.Mission.Travel.Field.DoorRecipes.Single().Id);
            s.MoveParty("door-mainhall-to-holding"); Fight(s, "incident-holding-guards");
            s.Talk("dialogue-operative"); s.Respond("operative-ready", "unit-6");
            foreach (var r in s.State.Base.Care.Recipes) Work(s, r.Id);
            return s;
        }
        private void Fight(CampaignSession s, string id)
        { s.Engage(id); for (int i = 0; i < 100 && MissionCombat.Active(s.State) != null; i++) s.AdvanceCombatRound(); }
        private void Work(CampaignSession s, string id)
        { var c = MissionField.Candidates(s.State, MissionField.Requirements(s.State, id)).First(); s.StartFieldWork(id, c.ActorId, c.ToolId); s.AdvanceFieldWork(); }
        private CampaignSession Reload(CampaignSession s)
        { var c = new CampaignSaveCodec(Json); return new CampaignSession(c.Deserialize(c.Serialize(new SavedSession(s.State, null))).Campaign, null); }
        [Test] public void NormalRescueReturnsThroughTheGateAndPersistsAftermathWithoutRepeatedExtraction()
        {
            var s = Create(); var tick = s.State.Clock.ElapsedTicks; Assert.That(MissionRescue.CanDepart(s.State), Is.True);
            s.StartFieldWork("extract-operative", "unit-6", null); s = Reload(s);
            Assert.That(s.State.Expedition.Travel.Field.Work.ToolId, Is.Null); s.AdvanceFieldWork(); s = Reload(s);
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(tick + 1));
            var subject = s.State.Expedition.Travel.Field.Subjects.Single(x => x.Id == "operative-01");
            Assert.That(subject.StageId, Is.EqualTo(s.State.Base.Mission.GateStageId)); Assert.That(subject.Evacuation, Is.EqualTo("AT_GATE"));
            Assert.That(s.State.Expedition.StageId, Is.EqualTo("stage-holding-area"));
            Assert.That(s.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("ACTIVE"));
            Assert.Throws<InvalidOperationException>(s.ExtractMission);
            s.MoveParty("door-mainhall-to-holding"); s.MoveParty("door-yard-to-mainhall"); s.MoveParty("door-gate-to-yard");
            Assert.Throws<InvalidOperationException>(s.ExtractMission); s.RedialGate(); var end = s.State.Clock.ElapsedTicks;
            var hp = MissionCombat.Inspect(s.State).PartyHealth["unit-6"]; s.ExtractMission(); s = Reload(s);
            Assert.That(s.State.Expedition.Returned, Is.True); Assert.That(s.State.Expedition.ExtractedTick, Is.EqualTo(end)); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(end));
            Assert.That(s.State.Expedition.Travel.Field.Subjects.Single(x => x.Id == "operative-01").Evacuation, Is.EqualTo("EXTRACTED"));
            Assert.That(s.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("COMPLETED"));
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(hp)); Assert.That(hp, Is.LessThan(100));
            Assert.That(s.State.Expedition.Party.Single(x => x.UnitId == "unit-37").Tools.Single().Charges, Is.Zero);
            var before = s.State; Assert.Throws<InvalidOperationException>(s.ExtractMission); Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-gate-to-yard")); Assert.That(s.State, Is.SameAs(before));
            Assert.That(Expeditions.IsDeployed(s.State, "unit-6"), Is.False); s.AssignUnit("unit-6", "r1"); s.AdvanceOneTick(); s = Reload(s);
            Assert.That(s.State.Expedition.ExtractedTick, Is.EqualTo(end)); Assert.That(s.State.Assignments.Single().UnitId, Is.EqualTo("unit-6"));
            var charges = s.State.Expedition.Party.SelectMany(m => m.Tools).Select(t => t.InstanceId + ":" + t.Charges).ToArray();
            var preparationTick = s.State.Clock.ElapsedTicks;
            s.PrepareRedeployment(); s = Reload(s); s.AdvanceOneTick(); s.UnassignUnit("unit-6");
            Assert.That(PersonnelCondition.Health(s.State, "unit-6"), Is.EqualTo(hp));
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(preparationTick + 1), "Preparing redeployment itself spends no time.");
            s.Deploy(new[] { "unit-6", "unit-10", "unit-37", "unit-46" }); s = Reload(s);
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(hp));
            Assert.That(s.State.Expedition.Party.SelectMany(m => m.Tools).Select(t => t.InstanceId + ":" + t.Charges), Is.EqualTo(charges));
            s.ChooseGate(false); s.MoveParty("door-gate-to-yard"); s.Respond("yard-ignore", "unit-6"); s.Engage("incident-yard-guards"); s.AdvanceCombatRound();
            var damaged = MissionCombat.Inspect(s.State).PartyHealth["unit-6"]; s = Reload(s);
            Assert.That(damaged, Is.LessThan(hp)); Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(damaged));
            Assert.That(s.State.Expedition.Party.Single(m => m.UnitId == "unit-37").Tools.Single().Charges, Is.Zero);
        }
        [Test] public void PersonnelMigrationRejectsInvalidStateAndKeepsIncapacitatedUnitsUnavailable()
        {
            var s = Create(false); var codec = new CampaignSaveCodec(Json); var old = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            old["schemaVersion"] = 19; old.Property("personnel").Remove(); foreach (JObject p in old["expedition"]["party"]) p.Property("startingHealth").Remove();
            s = new CampaignSession(codec.Deserialize(old.ToString()).Campaign, null);
            Assert.That(s.State.Personnel, Is.Empty); Assert.That(MissionCombat.Inspect(s.State).PartyHealth.Values.All(h => h == s.State.Base.Combat.PartyHealth), Is.True);
            var active = s.State; Assert.Throws<InvalidOperationException>(s.PrepareRedeployment); Assert.That(s.State, Is.SameAs(active));
            s.RedialGate(); s.ExtractMission(); s.PrepareRedeployment();
            var valid = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            foreach (var bad in new[] { "float", "tool", "duplicate" })
            {
                var j = (JObject)valid.DeepClone(); var row = j["personnel"][0];
                if (bad == "float") row["health"] = 50.5;
                if (bad == "tool") row["tools"][0]["instanceId"] = "not-a-tool";
                if (bad == "duplicate") ((JArray)j["personnel"]).Add(row.DeepClone());
                Assert.Catch(() => codec.Deserialize(j.ToString()), bad);
            }
            valid["personnel"].Single(p => (string)p["unitId"] == "unit-6")["health"] = 0;
            s = new CampaignSession(codec.Deserialize(valid.ToString()).Campaign, null); var before = s.State;
            Assert.Throws<InvalidOperationException>(() => s.Deploy(new[] { "unit-6" })); Assert.Throws<InvalidOperationException>(() => s.AssignUnit("unit-6", "r1"));
            Assert.That(s.State, Is.SameAs(before)); s.ResetMission(); s.Deploy(new[] { "unit-6" });
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(s.State.Base.Combat.PartyHealth), "Debug reset remains an explicit fresh playtest.");
        }
        [Test] public void EarlyGateReturnDoesNotGrantOperativeRecovery()
        {
            var s = Create(false); s.RedialGate(); s.ExtractMission(); s = Reload(s);
            Assert.That(s.State.Expedition.Returned, Is.True);
            Assert.That(s.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("HIDDEN"));
            Assert.That(s.State.Expedition.Travel.Field.Subjects.Single(x => x.Id == "operative-01").Evacuation, Is.Null);
        }
        [Test] public void ResetClearsOnlyTheAttemptAndAllowsFreshDeploymentWithoutWritingSaves()
        {
            var s = Create(); var tick = s.State.Clock.ElapsedTicks; s.AssignUnit("unit-1", "r1"); var rng = s.State.Random.Value;
            s.ResetMission(); Assert.That(s.State.Expedition, Is.Null); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(tick));
            Assert.That(s.State.Random.Value, Is.EqualTo(rng)); Assert.That(s.State.Assignments.Single().UnitId, Is.EqualTo("unit-1"));
            s.Deploy(new[] { "unit-6", "unit-37" }); Assert.That(s.State.Expedition.GateChoicePending, Is.True);
            Assert.That(s.State.Expedition.Travel.Visits.Count, Is.EqualTo(1)); Assert.That(s.State.Expedition.Party.SelectMany(u => u.Tools).All(t => t.Charges == 3), Is.True);
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth.Values.All(h => h == 100), Is.True);
        }
        [TestCase("custody")][TestCase("objective")][TestCase("time")][TestCase("legacy")][TestCase("fingerprint")]
        public void InvalidRescueSavesCannotGrantExtraction(string problem)
        {
            var s = Create(); Work(s, "extract-operative"); var c = new CampaignSaveCodec(Json); var j = JObject.Parse(c.Serialize(new SavedSession(s.State, null)));
            if (problem == "custody") j["expedition"]["travel"]["field"]["subjects"][0]["evacuation"] = "EXTRACTED";
            if (problem == "objective") j["expedition"]["travel"]["field"]["objectives"]["extract-operative"] = "COMPLETED";
            if (problem == "time") j["expedition"]["extractedTick"] = 1000;
            if (problem == "legacy") { j["schemaVersion"] = 10; j.Property("teams").Remove(); j.Property("rescueFingerprint").Remove(); }
            if (problem == "fingerprint") j["rescueFingerprint"] = "bad";
            Assert.Catch(() => c.Deserialize(j.ToString()));
        }
        [Test] public void CompletedMissionCannotMoveItsReturnBeforeTheCommittedWork()
        {
            var s = Create(); Work(s, "extract-operative");
            s.MoveParty("door-mainhall-to-holding"); s.MoveParty("door-yard-to-mainhall"); s.MoveParty("door-gate-to-yard"); s.RedialGate(); s.ExtractMission();
            var c = new CampaignSaveCodec(Json); var j = JObject.Parse(c.Serialize(new SavedSession(s.State, null)));
            j["expedition"]["extractedTick"] = 1;
            Assert.Catch(() => c.Deserialize(j.ToString()));
        }
        [Test] public void PermanentTeamSurvivesEveryMissionCommandReturnAndReload()
        {
            var s = Create(true, true); s = Reload(s); Work(s, "extract-operative");
            s.MoveParty("door-mainhall-to-holding"); s.MoveParty("door-yard-to-mainhall"); s.MoveParty("door-gate-to-yard"); s.RedialGate(); s.ExtractMission(); s = Reload(s);
            Assert.That(s.State.Expedition.TeamId, Is.EqualTo("sg-team-r6"));
            Assert.That(s.State.Teams.Single().Members, Is.EqualTo(s.State.Expedition.Party.Select(u => u.UnitId)));
            Assert.That(s.State.Expedition.Party.Single(u => u.UnitId == "unit-37").Tools.Single().Charges, Is.Zero);
            s.AdvanceOneTick(); Assert.That(s.State.Teams.Single().Designation, Is.EqualTo("SG-1"));
            s.ResetMission(); s.DeployTeam("sg-team-r6"); Assert.That(s.State.Expedition.TeamId, Is.EqualTo("sg-team-r6"));
        }
    }
}
