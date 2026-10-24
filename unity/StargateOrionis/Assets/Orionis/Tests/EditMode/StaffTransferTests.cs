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
    public sealed class StaffTransferTests
    {
        private string json;
        private const string Tech = "unit-19", Item = "ITEM_ASGARD_RIFLE_0001";
        private CampaignSession Create()
        {
            var root = JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            // Longer synthetic work separates next-tick and finish-step behavior in contract tests.
            root["receiving"]["recipe"]["steps"][0]["durationTicks"] = 4;
            json = root.ToString();
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(json), new RandomState(1, 1)), null);
            s.AssignUnit(Tech, "r2"); s.AdmitIncoming(Item, "r2"); s.AdvanceOneTick(); return s;
        }
        private static string Room(CampaignSession s) => s.State.Assignments.Single(a => a.UnitId == Tech).RoomInstanceId;
        private static int Work(CampaignSession s) => s.State.Receiving.Single().Progress[0].Ticks;
        [Test] public void ImmediateMoveKeepsCommittedPersonalWorkAndDoesNotAdvanceClock()
        {
            var s = Create(); s.PlanTransfer(Tech, "r5", StaffTransferTiming.Now);
            Assert.That(Room(s), Is.EqualTo("r5")); Assert.That(Work(s), Is.EqualTo(1));
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(1)); Assert.That(s.State.Transfers, Is.Empty);
            s.AdvanceOneTick(); Assert.That(Work(s), Is.EqualTo(1));
        }
        [Test] public void NextTickWorksOnceThenMovesAtTheBoundaryAndNotifiesAfterAtomicCommit()
        {
            var s = Create(); s.PlanTransfer(Tech, "r5", StaffTransferTiming.NextTick);
            Assert.That(Room(s), Is.EqualTo("r2")); Assert.That(s.State.Transfers.Single().DestinationRoomId, Is.EqualTo("r5"));
            int notifications = 0;
            s.StaffingChanged += () => { notifications++; Assert.That(Room(s), Is.EqualTo("r5")); Assert.That(Work(s), Is.EqualTo(2)); };
            s.AdvanceOneTick();
            Assert.That(Room(s), Is.EqualTo("r5")); Assert.That(Work(s), Is.EqualTo(2));
            Assert.That(s.State.Transfers, Is.Empty); Assert.That(notifications, Is.EqualTo(1));
        }
        [Test] public void FinishStepWaitsThroughPauseThenMovesBeforeAnyDependentWork()
        {
            var s = Create(); s.PlanTransfer(Tech, "r5", StaffTransferTiming.FinishStep);
            s.PauseInspection(Item, true); s.AdvanceOneTick(); s.AdvanceOneTick();
            Assert.That(Room(s), Is.EqualTo("r2")); Assert.That(Work(s), Is.EqualTo(1)); Assert.That(s.State.Transfers, Has.Count.EqualTo(1));
            s.PauseInspection(Item, false); s.AdvanceOneTick(); s.AdvanceOneTick();
            Assert.That(Room(s), Is.EqualTo("r2")); s.AdvanceOneTick();
            Assert.That(Room(s), Is.EqualTo("r5")); Assert.That(Work(s), Is.EqualTo(4));
            Assert.That(s.State.Receiving.Single().Progress[1].Ticks, Is.Zero); Assert.That(s.State.Transfers, Is.Empty);
        }
        [Test] public void ReservedCapacityRejectsAnotherAssignmentUntilExplicitlyCancelled()
        {
            var s = Create(); s.AssignUnit("unit-1", "r5"); s.PlanTransfer(Tech, "r5", StaffTransferTiming.FinishStep);
            var before = s.State;
            Assert.Throws<InvalidOperationException>(() => s.AssignUnit("unit-2", "r5"));
            Assert.That(s.State, Is.SameAs(before)); Assert.That(Room(s), Is.EqualTo("r2"));
            s.CancelTransfer(Tech); s.AssignUnit("unit-2", "r5");
            Assert.That(s.State.Assignments.Count(a => a.RoomInstanceId == "r5"), Is.EqualTo(2));
            Assert.That(Work(s), Is.EqualTo(1));
        }
        [Test] public void InvalidReplacementRetainsTheOriginalReservationAndOrder()
        {
            var s = Create(); s.PlanTransfer(Tech, "r5", StaffTransferTiming.FinishStep);
            s.AssignUnit("unit-1", "r4"); s.AssignUnit("unit-2", "r4"); var before = s.State;
            Assert.Throws<InvalidOperationException>(() => s.PlanTransfer(Tech, "r4", StaffTransferTiming.NextTick));
            Assert.That(s.State, Is.SameAs(before)); Assert.That(s.State.Transfers.Single().DestinationRoomId, Is.EqualTo("r5"));
        }
        [Test] public void ExplicitUnassignCancelsTheMoveWithoutDeletingPartialWork()
        {
            var s = Create(); s.PlanTransfer(Tech, "r5", StaffTransferTiming.FinishStep); s.UnassignUnit(Tech);
            Assert.That(s.State.Transfers, Is.Empty); Assert.That(s.State.Assignments.Any(a => a.UnitId == Tech), Is.False);
            Assert.That(Work(s), Is.EqualTo(1)); Assert.That(s.State.Receiving.Single().Progress[0].ActorId, Is.EqualTo(Tech));
        }
        [Test] public void FinishStepForIdleStaffMovesImmediatelyWithoutCreatingAnUnfulfillableReservation()
        {
            var s = Create(); s.AssignUnit("unit-1", "r1"); s.PlanTransfer("unit-1", "r5", StaffTransferTiming.FinishStep);
            Assert.That(s.State.Assignments.Single(a => a.UnitId == "unit-1").RoomInstanceId, Is.EqualTo("r5"));
            Assert.That(s.State.Transfers, Is.Empty);
        }
        [Test] public void PausedWorkAndReservedTransferRoundtripThenFinishWithTheOriginalActor()
        {
            var s = Create(); s.PlanTransfer(Tech, "r5", StaffTransferTiming.FinishStep); s.PauseInspection(Item, true);
            var codec = new CampaignSaveCodec(json); var restored = new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State, null))).Campaign, null);
            Assert.That(restored.State.Transfers.Single().WorkStepId, Is.EqualTo("DETERMINE_HANDLING"));
            restored.AdvanceOneTick(); Assert.That(Room(restored), Is.EqualTo("r2"));
            restored.PauseInspection(Item, false); restored.AdvanceOneTick(); restored.AdvanceOneTick(); restored.AdvanceOneTick();
            Assert.That(Room(restored), Is.EqualTo("r5")); Assert.That(Work(restored), Is.EqualTo(4));
            Assert.That(restored.State.Random.Value, Is.EqualTo(1u));
        }
        [TestCase("missing")][TestCase("duplicate")][TestCase("source")][TestCase("destination")]
        [TestCase("timing")][TestCase("fraction")][TestCase("future")][TestCase("work")][TestCase("capacity")]
        public void InvalidPendingTransfersCannotBeLoaded(string problem)
        {
            var s = Create(); s.AssignUnit("unit-20", "r2"); s.AssignUnit("unit-1", "r5"); s.PlanTransfer(Tech, "r5", StaffTransferTiming.NextTick);
            var codec = new CampaignSaveCodec(json); var value = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            var transfer = value["transfers"][0];
            switch (problem)
            {
                case "missing": value.Property("transfers").Remove(); break;
                case "duplicate": ((JArray)value["transfers"]).Add(transfer.DeepClone()); break;
                case "source": transfer["sourceRoomId"] = "r1"; break;
                case "destination": transfer["destinationRoomId"] = "unknown"; break;
                case "timing": transfer["timing"] = "Now"; break;
                case "fraction": transfer["requestedTick"] = 1.5; break;
                case "future": transfer["requestedTick"] = 7; break;
                case "work": transfer["timing"] = "FinishStep"; transfer["workInstanceId"] = Item; transfer["workStepId"] = "UNKNOWN"; break;
                case "capacity": var second = transfer.DeepClone(); second["unitId"] = "unit-20"; ((JArray)value["transfers"]).Add(second); break;
            }
            Assert.Catch(() => codec.Deserialize(value.ToString()));
        }
        [Test] public void VersionFourNameOnlyMigrationKeepsWorkAndCustomNames()
        {
            // Use the real provisional duration so the archived work fingerprint remains compatible.
            var currentJson = File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
            json = File.ReadAllText("../tools/fixtures/bootstrap-before-ready-room.json");
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(json), new RandomState(1, 1)), null);
            s.AssignUnit(Tech, "r2"); s.AdmitIncoming(Item, "r2"); s.AdvanceOneTick();
            var codec = new CampaignSaveCodec(json); var value = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            var archived = JObject.Parse(File.ReadAllText("../tools/fixtures/bootstrap-before-suffix-cleanup.json"));
            value["schemaVersion"] = 4; value.Property("teams").Remove(); value.Property("transfers").Remove();
            value.Property("expedition").Remove(); value.Property("missionFingerprint").Remove(); value.Property("combatFingerprint").Remove(); value.Property("careFingerprint").Remove(); value.Property("rescueFingerprint").Remove();
            value["fixtureFingerprint"] = BootstrapReader.Parse(json).saveCompatibility.Single(c => c.maxSaveVersion == 4).fromFingerprint;
            var oldName = archived["units"].Single(u => u["id"].Value<string>() == "unit-2")["name"].Value<string>();
            value["units"].Single(u => u["id"].Value<string>() == "unit-2")["name"] = oldName;
            value["units"].Single(u => u["id"].Value<string>() == "unit-3")["name"] = "Custom Family Sr.";
            var restored = new CampaignSaveCodec(currentJson).Deserialize(value.ToString()).Campaign;
            Assert.That(restored.Base.Units.Single(u => u.Id == "unit-2").Name, Is.EqualTo(oldName.Substring(0, oldName.Length - 4)));
            Assert.That(restored.Base.Units.Single(u => u.Id == "unit-3").Name, Is.EqualTo("Custom Family Sr."));
            Assert.That(restored.Receiving.Single().Progress[0].Ticks, Is.EqualTo(1));
            Assert.That(restored.Receiving.Single().Progress[0].ActorId, Is.EqualTo(Tech));
            Assert.That(restored.Transfers, Is.Empty); Assert.That(restored.Clock.ElapsedTicks, Is.EqualTo(1));
        }
    }
}
