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
    public sealed class MissionCombatTests
    {
        private const string Yard = "incident-yard-guards", Holding = "incident-holding-guards";
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private CampaignSession Create(bool solo = false)
        {
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(Json), new RandomState(1, 1)), null);
            s.Deploy(solo ? new[] { "unit-6" } : new[] { "unit-6", "unit-10", "unit-37", "unit-46" }); s.ChooseGate(true);
            s.MoveParty("door-gate-to-yard"); s.Respond("yard-ignore", "unit-6"); return s;
        }
        private CampaignSession Reload(CampaignSession s)
        { var c = new CampaignSaveCodec(Json); return new CampaignSession(c.Deserialize(c.Serialize(new SavedSession(s.State, null))).Campaign, null); }
        private void Finish(CampaignSession s) { for (int n = 0; n < 100 && MissionCombat.Active(s.State) != null; n++) s.AdvanceCombatRound(); }
        [Test] public void AuthoredRoundsCommitOneTickAndNeverSpendProfessionToolChargesOrRng()
        {
            var s = Create(); s.Engage(Yard); var tick = s.State.Clock.ElapsedTicks;
            s.AdvanceCombatRound(); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(tick));
            Assert.That(MissionCombat.Inspect(s.State).GuardHealth["guard-yard-01"], Is.EqualTo(78));
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(90));
            s = Reload(s); Finish(s);
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(tick + 1));
            Assert.That(s.State.Expedition.Combat.Battles.Single().Rounds, Is.EqualTo(5));
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(70));
            Assert.That(MissionCombat.GuardsClear(s.State, "stage-outer-yard"), Is.True);
            Assert.That(s.State.Random.Value, Is.EqualTo(1)); Assert.That(s.State.Expedition.Party.SelectMany(u => u.Tools).All(t => t.Charges == 3), Is.True);
            var original = s.State; Assert.Throws<InvalidOperationException>(() => s.Engage(Yard)); Assert.Throws<InvalidOperationException>(s.AdvanceCombatRound); Assert.That(s.State, Is.SameAs(original));
            s = Reload(s); Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(70));
        }
        [Test] public void DisengagementPreservesBothSidesAndReengagementDoesNotHealOrTeleport()
        {
            var s = Create(); s.Engage(Yard); s.AdvanceCombatRound(); s.DisengageCombat(); s = Reload(s);
            Assert.That(s.State.Expedition.StageId, Is.EqualTo("stage-outer-yard")); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(2));
            Assert.That(MissionCombat.Inspect(s.State).GuardHealth["guard-yard-01"], Is.EqualTo(78));
            Assert.That(MissionCombat.HostilesPresent(s.State), Is.True);
            s.MoveParty("door-gate-to-yard"); s.MoveParty("door-gate-to-yard"); s.Engage(Yard);
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(90));
            Finish(s); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(5));
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(70));
        }
        [Test] public void IncapacitationEndsEncounterOnceAndCannotBeErasedByReloadOrMovement()
        {
            var s = Create(true); s.Engage(Yard); Finish(s); s = Reload(s);
            Assert.That(MissionCombat.Inspect(s.State).Incapacitated, Is.True); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(2));
            Assert.That(s.State.Expedition.Combat.Battles.Last().Outcome, Is.EqualTo("DEFEATED"));
            Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-gate-to-yard"));
            Assert.Throws<InvalidOperationException>(() => s.Engage(Yard));
        }
        [Test] public void ActiveFightBlocksMovementAndOtherIncidentsAtomically()
        {
            var s = Create(); var before = s.State; Assert.Throws<InvalidOperationException>(() => s.Engage(Holding)); Assert.That(s.State, Is.SameAs(before));
            s.Engage(Yard); before = s.State;
            Assert.Throws<InvalidOperationException>(() => s.MoveParty("door-yard-to-mainhall")); Assert.Throws<InvalidOperationException>(() => s.Engage(Yard)); Assert.That(s.State, Is.SameAs(before));
        }
        [Test] public void DownedHoldingGuardDoesNotReceiveTheNeutralOnlyContactEffect()
        {
            var s = Create(); s.MoveParty("door-yard-to-mainhall"); var r = s.State.Base.Mission.Travel.Field.DoorRecipes.Single();
            var candidate = MissionField.Candidates(s.State, r).First(); s.StartFieldWork(r.Id, candidate.ActorId, candidate.ToolId); s.AdvanceFieldWork(); s.MoveParty("door-mainhall-to-holding");
            s.Engage(Holding); Finish(s); s = Reload(s); s.Talk("dialogue-operative");
            Assert.That(s.State.Expedition.Travel.Npcs.Single(n => n.Id == "guard-holding-01").Suspicion, Is.EqualTo(20));
            Assert.That(s.State.Expedition.Travel.Field.Subjects.Single(x => x.Id == "guard-holding-01").Combat, Is.EqualTo("DOWN"));
            Assert.That(s.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("ACTIVE"));
        }
        [TestCase("rounds")][TestCase("result")][TestCase("time")][TestCase("incident")][TestCase("fingerprint")]
        public void InvalidBattleHistoryCannotCreateVictoryOrChangeTheSaveDefinition(string problem)
        {
            var s = Create(); s.Engage(Yard); s.AdvanceCombatRound(); var c = new CampaignSaveCodec(Json);
            var j = JObject.Parse(c.Serialize(new SavedSession(s.State, null))); var b = j["expedition"]["combat"][0];
            if (problem == "rounds") b["rounds"] = 999;
            if (problem == "result") b["outcome"] = "WON";
            if (problem == "time") b["endedTick"] = 99;
            if (problem == "incident") b["incidentId"] = "unknown";
            if (problem == "fingerprint") j["combatFingerprint"] = "changed";
            Assert.Catch(() => c.Deserialize(j.ToString()));
        }
        [Test] public void SchemaEightMigrationAddsNoBattlesOrGuardClearance()
        {
            var s = Create(); var c = new CampaignSaveCodec(Json); var j = JObject.Parse(c.Serialize(new SavedSession(s.State, null)));
            j["schemaVersion"] = 8; j.Property("teams").Remove(); j.Property("combatFingerprint").Remove(); j.Property("careFingerprint").Remove(); j.Property("rescueFingerprint").Remove(); ((JObject)j["expedition"]).Property("combat").Remove();
            var restored = c.Deserialize(j.ToString()).Campaign;
            Assert.That(restored.Expedition.Combat.Battles, Is.Empty); Assert.That(MissionCombat.Inspect(restored).PartyHealth.Values.All(h => h == 100), Is.True);
            Assert.That(MissionCombat.GuardsClear(restored, "stage-outer-yard"), Is.False);
        }
    }
}
