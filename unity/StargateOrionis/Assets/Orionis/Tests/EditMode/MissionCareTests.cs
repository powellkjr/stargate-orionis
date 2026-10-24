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
    public sealed class MissionCareTests
    {
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private CampaignSession Create(bool clearGuards = true)
        {
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(Json), new RandomState(1, 1)), null);
            s.Deploy(new[] { "unit-6", "unit-10", "unit-37", "unit-46" }); s.ChooseGate(true);
            s.MoveParty("door-gate-to-yard"); s.Respond("yard-ignore", "unit-6");
            if (clearGuards) Fight(s, "incident-yard-guards");
            s.MoveParty("door-yard-to-mainhall"); var r = s.State.Base.Mission.Travel.Field.DoorRecipes.Single();
            var c = MissionField.Candidates(s.State, r).First(); s.StartFieldWork(r.Id, c.ActorId, c.ToolId); s.AdvanceFieldWork();
            s.MoveParty("door-mainhall-to-holding");
            if (clearGuards) Fight(s, "incident-holding-guards");
            return s;
        }
        private void Fight(CampaignSession s, string id)
        { s.Engage(id); for (int n = 0; n < 100 && MissionCombat.Active(s.State) != null; n++) s.AdvanceCombatRound(); }
        private void Start(CampaignSession s, int index)
        {
            var r = s.State.Base.Care.Recipes[index]; var c = MissionField.Candidates(s.State, r.Requirements).First();
            s.StartFieldWork(r.Id, c.ActorId, c.ToolId);
        }
        private CampaignSession Reload(CampaignSession s)
        { var c = new CampaignSaveCodec(Json); return new CampaignSession(c.Deserialize(c.Serialize(new SavedSession(s.State, null))).Campaign, null); }
        [Test] public void ThreeTreatmentsSpendThreeTicksAndChargesAndResolveTheMedicalIncident()
        {
            var s = Create(); var tick = s.State.Clock.ElapsedTicks;
            Assert.That(MissionField.CapabilityBlocker(s.State, s.State.Base.Care.Recipes[0].Requirements), Is.Null);
            Assert.That(MissionField.CapabilityBlocker(s.State, new FieldRequirements("diagnostic", "NO_SUCH_PROFESSION", 1, 0, "MET1", 1, 1)), Is.EqualTo("NO_VALID_ACTOR"));
            Assert.That(MissionField.CapabilityBlocker(s.State, new FieldRequirements("diagnostic", "MEDIC", 1, 0, "NO_SUCH_SERVICE", 1, 1)), Is.EqualTo("TOOL_SERVICE_MISSING"));
            Assert.That(MissionEvacuation.SecureRoute(s.State), Is.Null);
            for (int n = 0; n < 3; n++)
            {
                Start(s, n); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(tick + n));
                s = Reload(s); Assert.That(s.State.Expedition.Travel.Field.Work.ActorId, Is.EqualTo("unit-37"));
                s.AdvanceFieldWork(); Assert.That(MissionCare.Resolved(s.State), Is.EqualTo(n == 2)); s = Reload(s);
            }
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(tick + 3));
            Assert.That(s.State.Expedition.Party.Single(u => u.UnitId == "unit-37").Tools.Single().Charges, Is.Zero);
            var exhausted = s.State;
            Assert.That(MissionField.CapabilityBlocker(s.State, s.State.Base.Care.Recipes[0].Requirements), Is.EqualTo("TOOL_CHARGES_DEPLETED"));
            Assert.That(MissionField.Candidates(s.State, s.State.Base.Care.Recipes[0].Requirements), Is.Empty);
            Assert.That(s.State, Is.SameAs(exhausted), "Readiness never spends time or changes charges.");
            Assert.That(s.State.Expedition.Travel.Npcs.Single(n => n.Id == "guard-holding-01").Suspicion, Is.EqualTo(20));
            Assert.That(MissionEvacuation.SecureRoute(s.State), Is.EqualTo(new[] { "door-mainhall-to-holding", "door-yard-to-mainhall", "door-gate-to-yard" }));
            Assert.That(s.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("ACTIVE"));
            Assert.That(s.State.Expedition.StageId, Is.EqualTo("stage-holding-area"));
            Assert.That(s.State.Random.Value, Is.EqualTo(1));
            var before = s.State; Assert.Throws<InvalidOperationException>(() => Start(s, 0)); Assert.That(s.State, Is.SameAs(before));
        }
        [Test] public void CancelAndInvalidActorOrToolCannotSpendTimeOrCharges()
        {
            var s = Create(); var r = s.State.Base.Care.Recipes.First(); var before = s.State;
            Assert.Throws<InvalidOperationException>(() => s.StartFieldWork(r.Id, "unit-6", s.State.Expedition.Party[0].Tools[0].InstanceId));
            Assert.That(s.State, Is.SameAs(before)); Start(s, 0); var w = s.State.Expedition.Travel.Field.Work;
            Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-mainhall-to-holding"));
            s.CancelFieldWork(); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(before.Clock.ElapsedTicks));
            Assert.That(s.State.Expedition.Party.Single(u => u.UnitId == w.ActorId).Tools.Single(t => t.InstanceId == w.ToolId).Charges, Is.EqualTo(3));
        }
        [Test] public void PatientCareSuspicionStartsTheAuthoredGuardEncounterAtOneHundred()
        {
            var s = Create(false); s.Talk("dialogue-operative"); s.Respond("operative-ready", "unit-6");
            Start(s, 0); s.AdvanceFieldWork(); Assert.That(MissionCombat.Active(s.State), Is.Null);
            Assert.That(s.State.Expedition.Travel.Npcs.Single(n => n.Id == "guard-holding-01").Suspicion, Is.EqualTo(85));
            var tick = s.State.Clock.ElapsedTicks; Start(s, 1); s.AdvanceFieldWork(); s = Reload(s);
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(tick + 1));
            Assert.That(MissionCombat.Active(s.State).IncidentId, Is.EqualTo("incident-holding-guards"));
            Assert.That(MissionCombat.Active(s.State).Rounds, Is.Zero); Assert.That(s.State.Expedition.Travel.Field.Work, Is.Null);
            Assert.Throws<InvalidOperationException>(() => Start(s, 2));
            for (int n = 0; n < 100 && MissionCombat.Active(s.State) != null; n++) s.AdvanceCombatRound();
            Start(s, 2); s.AdvanceFieldWork(); Assert.That(MissionCare.Resolved(s.State), Is.True);
            Assert.That(MissionEvacuation.SecureRoute(s.State), Is.Null, "Neutral Yard guards still block evacuation.");
            s.MoveParty("door-mainhall-to-holding"); s.MoveParty("door-yard-to-mainhall"); Fight(s, "incident-yard-guards");
            s.MoveParty("door-yard-to-mainhall"); s.MoveParty("door-mainhall-to-holding");
            Assert.That(MissionEvacuation.SecureRoute(s.State), Is.Not.Null);
            Assert.That(s.State.Expedition.GateOpen, Is.False, "Medical work and travel must still advance Gate expiry.");
        }
        [TestCase("definition")][TestCase("duplicate")][TestCase("actor")][TestCase("legacy")][TestCase("charges")][TestCase("overlap")]
        public void InvalidCareSavesDoNotGrantStabilization(string problem)
        {
            var s = Create(); Start(s, 0); s.AdvanceFieldWork(); var c = new CampaignSaveCodec(Json); var j = JObject.Parse(c.Serialize(new SavedSession(s.State, null)));
            var completed = (JArray)j["expedition"]["travel"]["field"]["completed"];
            if (problem == "definition") j["careFingerprint"] = "wrong";
            if (problem == "duplicate") completed.Add(completed.Last.DeepClone());
            if (problem == "actor") completed.Last["actorId"] = "unit-6";
            if (problem == "charges") j["expedition"]["party"][2]["tools"][0]["charges"] = 3;
            if (problem == "overlap") completed.Last["startedTick"] = completed.First["startedTick"].DeepClone();
            if (problem == "legacy") { j["schemaVersion"] = 9; j.Property("teams").Remove(); j.Property("careFingerprint").Remove(); j.Property("rescueFingerprint").Remove(); }
            Assert.Catch(() => c.Deserialize(j.ToString()));
        }
        [Test] public void SchemaNineMigrationKeepsBattlesAndAddsNoCompletedMedicalCare()
        {
            var s = Create(); var c = new CampaignSaveCodec(Json); var j = JObject.Parse(c.Serialize(new SavedSession(s.State, null)));
            j["schemaVersion"] = 9; j.Property("teams").Remove(); j.Property("careFingerprint").Remove(); j.Property("rescueFingerprint").Remove(); var restored = c.Deserialize(j.ToString()).Campaign;
            Assert.That(restored.Expedition.Combat.Battles.Count, Is.EqualTo(2)); Assert.That(MissionCare.Resolved(restored), Is.False);
            Assert.That(MissionEvacuation.SecureRoute(restored), Is.Null); Assert.That(restored.Expedition.StageId, Is.EqualTo(s.State.Expedition.StageId));
        }
    }
}
