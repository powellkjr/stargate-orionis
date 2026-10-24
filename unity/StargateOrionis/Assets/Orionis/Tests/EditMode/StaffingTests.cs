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
    public sealed class StaffingTests
    {
        private string json;
        private CampaignSession Create()
        {
            json = File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
            return new CampaignSession(new CampaignState(BootstrapReader.Read(json), new RandomState(1, 1)), null);
        }
        [Test] public void CapacitiesComeFromAuthoredPhysicalRoomConfiguration()
        {
            var session = Create();
            Assert.That(session.State.Base.Rooms.Single(r => r.Id == "r1").StaffingCapacity, Is.EqualTo(6));
            foreach (var room in session.State.Base.Rooms.Where(r => r.Id != "r1" && r.Definition.TeamSlots == 0 && r.StaffingCapacity > 0)) Assert.That(room.StaffingCapacity, Is.EqualTo(2));
            Assert.That(session.State.Base.Rooms.Single(r => r.Id == "r2").Definition.StaffingCapacity(3), Is.EqualTo(6));
        }
        [Test] public void FailedTransferToFullRoomKeepsOriginalAssignmentAndDoesNotEmitChange()
        {
            var session = Create();
            session.AssignUnit("unit-1", "r2"); session.AssignUnit("unit-2", "r2"); session.AssignUnit("unit-3", "r5");
            var original = session.State; int changes = 0; session.StaffingChanged += () => changes++;
            Assert.Throws<InvalidOperationException>(() => session.AssignUnit("unit-3", "r2"));
            Assert.That(session.State, Is.SameAs(original)); Assert.That(changes, Is.Zero);
            Assert.That(session.State.Assignments.Single(a => a.UnitId == "unit-3").RoomInstanceId, Is.EqualTo("r5"));
        }
        [Test] public void AssignReassignAndUnassignPreserveSingleIdentityWithoutAdvancingTime()
        {
            var session = Create(); var data = session.State.Base; var random = session.State.Random;
            session.AssignUnit("unit-1", "r1"); session.AssignUnit("unit-1", "r5"); session.AssignUnit("unit-1", "r5");
            Assert.That(session.State.Assignments.Count, Is.EqualTo(1));
            session.AdvanceOneTick();
            Assert.That(session.State.Assignments.Single().RoomInstanceId, Is.EqualTo("r5"));
            session.UnassignUnit("unit-1");
            Assert.That(session.State.Assignments, Is.Empty);
            Assert.That(session.State.Clock.ElapsedTicks, Is.EqualTo(1));
            Assert.That(session.State.Base, Is.SameAs(data)); Assert.That(session.State.Random, Is.SameAs(random));
        }
        [Test] public void UnknownUnitOrRoomFailsWithoutMutation()
        {
            var session = Create(); var original = session.State;
            Assert.Throws<ArgumentException>(() => session.AssignUnit("missing", "r1"));
            Assert.Throws<ArgumentException>(() => session.AssignUnit("unit-1", "missing"));
            Assert.Throws<ArgumentException>(() => session.UnassignUnit("missing"));
            Assert.That(session.State, Is.SameAs(original));
        }
        [Test] public void AssignmentsRoundtripWithClockAndSavedNames()
        {
            var session = Create(); session.AssignUnit("unit-1", "r5"); session.AssignUnit("unit-10", "r4"); session.AdvanceOneTick();
            var codec = new CampaignSaveCodec(json);
            var saved = codec.Deserialize(codec.Serialize(new SavedSession(session.State, null)));
            Assert.That(saved.Campaign.Assignments.Select(a => a.UnitId + ":" + a.RoomInstanceId), Is.EqualTo(new[] { "unit-1:r5", "unit-10:r4" }));
            Assert.That(saved.Campaign.Clock.ElapsedTicks, Is.EqualTo(1));
            Assert.That(saved.Campaign.Base.Units[0].Name, Is.EqualTo(session.State.Base.Units[0].Name));
        }
        [TestCase("unknown-unit")]
        [TestCase("unknown-room")]
        [TestCase("duplicate")]
        [TestCase("overcapacity")]
        [TestCase("missing")]
        public void InvalidSavedAssignmentsCannotCreateInvalidState(string problem)
        {
            var session = Create(); var codec = new CampaignSaveCodec(json);
            var value = JObject.Parse(codec.Serialize(new SavedSession(session.State, null)));
            var entries = new JArray(new JObject { ["unitId"] = "unit-1", ["roomInstanceId"] = "r2" });
            if (problem == "unknown-unit") entries[0]["unitId"] = "missing";
            if (problem == "unknown-room") entries[0]["roomInstanceId"] = "missing";
            if (problem == "duplicate") entries.Add(entries[0].DeepClone());
            if (problem == "overcapacity") foreach (var id in new[] { "unit-2", "unit-3" }) entries.Add(new JObject { ["unitId"] = id, ["roomInstanceId"] = "r2" });
            value["assignments"] = entries;
            if (problem == "missing") value.Property("assignments").Remove();
            Assert.Catch(() => codec.Deserialize(value.ToString()));
            Assert.That(session.State.Assignments, Is.Empty);
        }
        [Test] public void PreStaffingSaveMigratesWithOriginalNamesAndNoInferredAssignments()
        {
            var session = Create(); var codec = new CampaignSaveCodec(json);
            var previousJson = File.ReadAllText("../tools/fixtures/bootstrap-before-ready-room.json");
            var fixture = BootstrapReader.Parse(previousJson);
            var previous = new CampaignState(BootstrapReader.Read(previousJson), new RandomState(1, 1));
            var value = JObject.Parse(new CampaignSaveCodec(previousJson).Serialize(new SavedSession(previous, new SelectionReference(SelectionKind.Room, "r5"))));
            Assert.That(fixture.saveCompatibility[0].toFingerprint, Is.EqualTo(value["fixtureFingerprint"].Value<string>()));
            value["schemaVersion"] = 2; value.Property("teams").Remove(); value.Property("assignments").Remove();
            value.Property("receiving").Remove(); value.Property("receivingFingerprint").Remove();
            value.Property("transfers").Remove();
            value.Property("expedition").Remove(); value.Property("missionFingerprint").Remove(); value.Property("combatFingerprint").Remove(); value.Property("careFingerprint").Remove(); value.Property("rescueFingerprint").Remove();
            value["fixtureFingerprint"] = fixture.saveCompatibility[0].fromFingerprint;
            var legacy = JObject.Parse(File.ReadAllText("../tools/fixtures/bootstrap-before-staffing.json"));
            value["units"] = legacy["units"].DeepClone();
            foreach (var unit in value["units"].OfType<JObject>()) unit.Property("color").Remove();
            value["elapsedTicks"] = 7;
            var saved = codec.Deserialize(value.ToString());
            Assert.That(saved.Campaign.Base.Units[0].Name, Is.EqualTo("Brett Holt"));
            Assert.That(saved.Campaign.Assignments, Is.Empty);
            Assert.That(saved.Campaign.Clock.ElapsedTicks, Is.EqualTo(7));
            Assert.That(saved.Selection.Id, Is.EqualTo("r5"));
        }
    }
}
