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
    public sealed class DeploymentTests
    {
        private string json;
        private CampaignSession Create(Action<JObject> edit = null)
        {
            var value = JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json")); edit?.Invoke(value); json = value.ToString();
            return new CampaignSession(new CampaignState(BootstrapReader.Read(json), new RandomState(1, 1)), null);
        }
        [Test] public void DeploymentKeepsRosterIdentityProgressionAndEquippedToolsWithoutTimeOrRandomDraws()
        {
            var s = Create(); var original = s.State;
            s.Deploy(new[] { "unit-6", "unit-37", "unit-19", "unit-46" });
            Assert.That(s.State.Expedition.Party.Select(p => p.UnitId), Is.EqualTo(new[] { "unit-6", "unit-37", "unit-19", "unit-46" }));
            Assert.That(s.State.Expedition.StageId, Is.EqualTo("stage-gate-yard"));
            Assert.That(s.State.Expedition.GateChoicePending && s.State.Expedition.GateOpen, Is.True);
            var source = s.State.Base.Mission.Personnel.Single(u => u.UnitId == "unit-6");
            Assert.That(source.BranchKind, Is.EqualTo("cross")); Assert.That(source.BranchId, Is.EqualTo("TECHNICIAN"));
            Assert.That(s.State.Expedition.Party[0].Tools.Select(t => t.InstanceId), Is.EqualTo(source.Tools.Select(t => t.InstanceId)));
            Assert.That(s.State.Expedition.Party[0].Tools[1].Services, Does.Contain("TET1"));
            Assert.That(s.State.Clock.ElapsedTicks, Is.Zero); Assert.That(s.State.Random, Is.SameAs(original.Random));
            Assert.That(s.State.Base, Is.SameAs(original.Base));
        }
        [TestCase("empty")][TestCase("duplicate")][TestCase("unknown")][TestCase("too-many")][TestCase("assigned")]
        public void InvalidDeploymentDoesNotChangeStateOrEmitAnArrival(string problem)
        {
            var s = Create(); var ids = new[] { "unit-1" };
            if (problem == "empty") ids = Array.Empty<string>();
            if (problem == "duplicate") ids = new[] { "unit-1", "unit-1" };
            if (problem == "unknown") ids = new[] { "unknown" };
            if (problem == "too-many") ids = new[] { "unit-1", "unit-2", "unit-3", "unit-4", "unit-5" };
            if (problem == "assigned") s.AssignUnit("unit-1", "r2");
            var original = s.State; int events = 0; s.MissionChanged += () => events++;
            Assert.Catch(() => s.Deploy(ids)); Assert.That(s.State, Is.SameAs(original)); Assert.That(events, Is.Zero);
        }
        [Test] public void ArrivalChoicesDoNotSpendTimeAndRedialCommitsOneSharedTick()
        {
            var s = Create(); s.AssignUnit("unit-19", "r2"); s.AdmitIncoming("ITEM_ASGARD_RIFLE_0001", "r2"); s.Deploy(new[] { "unit-1" });
            Assert.Throws<InvalidOperationException>(() => s.RedialGate());
            s.ChooseGate(false); Assert.That(s.State.Clock.ElapsedTicks, Is.Zero);
            s.RedialGate(); Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(1)); Assert.That(s.State.Expedition.GateOpen, Is.True);
            Assert.That(s.State.Receiving.Single().Progress[0].Ticks, Is.EqualTo(1));
            Assert.That(s.State.Expedition.ConnectionOpenedTick, Is.EqualTo(1));
            Assert.Throws<InvalidOperationException>(() => s.RedialGate());
        }
        [Test] public void DeployedStaffCannotSimultaneouslyWorkInTheBaseAndClockPlaybackStops()
        {
            var s = Create(); var controller = new CampaignClockController(s); controller.SetPaused(false); controller.Update(1);
            s.Deploy(new[] { "unit-19" }); var original = s.State;
            controller.Update(100); Assert.That(controller.Paused, Is.True);
            Assert.Throws<InvalidOperationException>(() => controller.SetPaused(false));
            Assert.Throws<InvalidOperationException>(() => controller.SetSpeed(4));
            Assert.Throws<InvalidOperationException>(() => s.AdvanceOneTick());
            Assert.Throws<InvalidOperationException>(() => s.AssignUnit("unit-19", "r2"));
            Assert.That(s.State, Is.SameAs(original));
        }
        [Test] public void EmptyEquippedSlotsNeverGrantAutomaticToolsAndSecondDeploymentIsRejected()
        {
            var s = Create(root => root["mission"]["personnel"][0]["tools"] = new JArray());
            s.Deploy(new[] { "unit-1", "unit-2" }); Assert.That(s.State.Expedition.Party[0].Tools, Is.Empty);
            Assert.That(s.State.Expedition.Party[1].Tools.Single(t => t.KitId == "MKT1").Services, Is.Empty);
            var before = s.State; Assert.Throws<InvalidOperationException>(() => s.Deploy(new[] { "unit-2" })); Assert.That(s.State, Is.SameAs(before));
        }
        [Test] public void OpenConnectionExpiresAtExactlyTwelveCommittedTicks()
        {
            var s = Create(); s.Deploy(new[] { "unit-1" }); s.ChooseGate(true);
            var state = s.State;
            // The shared tick primitive is used by future committed movement/work actions, never a live base timer.
            for (int i = 0; i < 11; i++) state = ReceivingWork.AdvanceTick(state);
            Assert.That(state.Expedition.GateOpen, Is.True);
            state = ReceivingWork.AdvanceTick(state); Assert.That(state.Expedition.GateOpen, Is.False);
            Assert.That(state.Clock.ElapsedMinutes, Is.EqualTo(36));
        }
        [Test] public void DeployedTeamAndGateChoiceRoundtripWithExactToolIdentitiesAndCharges()
        {
            var s = Create(); s.Deploy(new[] { "unit-6", "unit-19" }); s.ChooseGate(false); s.RedialGate();
            var codec = new CampaignSaveCodec(json); var restored = codec.Deserialize(codec.Serialize(new SavedSession(s.State, null))).Campaign;
            Assert.That(restored.Expedition.StageId, Is.EqualTo(s.State.Expedition.StageId));
            Assert.That(restored.Expedition.StartedTick, Is.Zero); Assert.That(restored.Expedition.ConnectionOpenedTick, Is.EqualTo(1));
            Assert.That(restored.Expedition.GateChoicePending, Is.False); Assert.That(restored.Expedition.GateOpen, Is.True);
            Assert.That(restored.Expedition.Party[0].Tools.Select(t => t.InstanceId + ":" + t.Charges), Is.EqualTo(s.State.Expedition.Party[0].Tools.Select(t => t.InstanceId + ":" + t.Charges)));
        }
        [TestCase("member")][TestCase("duplicate")][TestCase("too-many")][TestCase("stage")][TestCase("charges")]
        [TestCase("tool")][TestCase("assigned")][TestCase("fingerprint")][TestCase("fraction")][TestCase("boolean")]
        public void CorruptMissionSavesAreRejected(string problem)
        {
            var s = Create(); s.Deploy(new[] { "unit-1" });
            var codec = new CampaignSaveCodec(json); var value = JObject.Parse(codec.Serialize(new SavedSession(s.State, null))); var e = value["expedition"];
            switch (problem)
            {
                case "member": e["party"][0]["unitId"] = "unknown"; break;
                case "duplicate": ((JArray)e["party"]).Add(e["party"][0].DeepClone()); break;
                case "too-many": for (int i = 0; i < 4; i++) ((JArray)e["party"]).Add(e["party"][0].DeepClone()); break;
                case "stage": e["stageId"] = "stage-holding-area"; break;
                case "charges": e["party"][0]["tools"][0]["charges"] = 100; break;
                case "tool": e["party"][0]["tools"][0]["kitId"] = "TET3"; break;
                case "assigned": ((JArray)value["assignments"]).Add(new JObject { ["unitId"] = "unit-1", ["roomInstanceId"] = "r2" }); break;
                case "fingerprint": value["missionFingerprint"] = "changed"; break;
                case "fraction": e["startedTick"] = 0.5; break;
                case "boolean": e["gateOpen"] = "true"; break;
            }
            Assert.Catch(() => codec.Deserialize(value.ToString()));
        }
        [Test] public void VersionFiveMigratesWithoutInventingADeployment()
        {
            var s = Create(); s.AssignUnit("unit-19", "r2"); s.AdvanceOneTick();
            var codec = new CampaignSaveCodec(json); var value = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            value["schemaVersion"] = 5;value.Property("archivedCargoSupply")?.Remove(); value.Property("teams").Remove(); value.Property("expedition").Remove(); value.Property("missionFingerprint").Remove(); value.Property("combatFingerprint").Remove(); value.Property("careFingerprint").Remove(); value.Property("rescueFingerprint").Remove();
            var restored = codec.Deserialize(value.ToString()).Campaign;
            Assert.That(restored.Expedition, Is.Null); Assert.That(restored.Clock.ElapsedTicks, Is.EqualTo(1));
            Assert.That(restored.Assignments.Single().UnitId, Is.EqualTo("unit-19"));
        }
    }
}
