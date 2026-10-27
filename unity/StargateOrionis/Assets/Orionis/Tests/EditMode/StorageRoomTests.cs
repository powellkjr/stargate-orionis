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
    public sealed class StorageRoomTests
    {
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        [Test] public void BaseIncludesAuthoredStorageDestinationsWithoutInventingInventoryOrReceivingCapacity()
        {
            var data = BootstrapReader.Read(Json);
            Assert.That(data.Rooms.Count, Is.EqualTo(11));
            foreach (var id in new[] { "material_storage", "supply_storage", "equipment_storage", "containment", "warehouse" })
            {
                var room = data.Rooms.Single(r => r.Definition.Id == id);
                Assert.That(room.Definition.Width, Is.EqualTo(1)); Assert.That(room.Definition.Height, Is.EqualTo(1));
                Assert.That(room.StaffingCapacity, Is.EqualTo(id == "containment" ? 2 : 0));
                Assert.That(data.Receiving.Rooms.Single(r => r.DefinitionId == id).CapacityByTier[1], Is.Zero, "Storage is not automatically Receiving intake.");
            }
            Assert.That(data.Storage.Find("material_storage").CapacityByTier[1], Is.EqualTo(4000));
            Assert.That(data.Storage.Find("supply_storage").CapacityByTier[1], Is.EqualTo(4000));
            var containment = data.Storage.Find("containment");
            Assert.That(containment.CapacityByTier[1], Is.EqualTo(2), "Keep the separate authored storage rule.");
            Assert.That(containment.Tabs.Single().CapacityByTier[1], Is.EqualTo(20), "CC item storage uses the authored inventory progression.");
            Assert.That(containment.Tabs.Single().Classes, Is.EqualTo(new[] { "CC" }));
            Assert.That(data.Storage.Find("equipment_storage").Tabs.Select(t => t.Id), Is.EqualTo(new[] { "weapons", "armor" }));
            Assert.That(data.Storage.Find("equipment_storage").Tabs.All(t => t.CapacityByTier[1] == 20 && t.Classes.SequenceEqual(new[] { "EQ" })), Is.True);
        }
        [TestCase(false)][TestCase(true)] public void SchemaThirteenAddsWarehouseWithoutLosingFourMemberTeamOrReceiving(bool conflict)
        {
            var old = File.ReadAllText("../tools/fixtures/bootstrap-before-warehouse.json");
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(old), new RandomState(1, 1)), null);
            s.CreateTeam("r6", "SG-1");
            foreach (var id in new[] { "unit-6", "unit-10", "unit-37", "unit-46" }) s.SetTeamMember("sg-team-r6", id, true);
            s.AssignUnit("unit-19", "r2"); s.AdmitIncoming("ITEM_ASGARD_RIFLE_0001", "r2"); s.AdvanceOneTick(); s.DeployTeam("sg-team-r6");
            var j = JObject.Parse(new CampaignSaveCodec(old).Serialize(new SavedSession(s.State, new SelectionReference(SelectionKind.Room, "r9")))); j["schemaVersion"] = 13;j.Property("archivedCargoSupply")?.Remove();
            if (conflict) { var room = j["rooms"].Single(r => (string)r["id"] == "r10"); room["col"] = 8; }
            var codec = new CampaignSaveCodec(Json);
            if (conflict) { Assert.Catch(() => codec.Deserialize(j.ToString())); return; }
            var restored = codec.Deserialize(j.ToString());
            Assert.That(restored.Campaign.Teams.Single().Members, Is.EqualTo(s.State.Teams.Single().Members));
            Assert.That(restored.Campaign.Expedition.Party.Select(u => u.UnitId), Is.EqualTo(s.State.Expedition.Party.Select(u => u.UnitId)));
            Assert.That(restored.Campaign.Receiving.Single().Progress[0].ActorId, Is.EqualTo("unit-19"));
            Assert.That(restored.Campaign.Clock.ElapsedTicks, Is.EqualTo(1)); Assert.That(restored.Selection.Id, Is.EqualTo("r9"));
            Assert.That(restored.Campaign.Base.Storage.Find("warehouse").CapacityByTier[1], Is.EqualTo(20));
            Assert.That(restored.Campaign.Base.Rooms.Count, Is.EqualTo(11));
        }
        [TestCase("fraction")][TestCase("reference")][TestCase("negative")][TestCase("tier")]
        public void InvalidStorageProfilesFailBeforeUse(string problem)
        {
            var j = JObject.Parse(Json); var p = j["roomStorage"]["profiles"][0];
            if (problem == "fraction") p["capacityByTier"]["1"] = 2.5;
            if (problem == "reference") p["definitionId"] = "unknown";
            if (problem == "negative") p["capacityByTier"]["1"] = -1;
            if (problem == "tier") ((JObject)p["capacityByTier"]).Property("3").Remove();
            Assert.Throws<FormatException>(() => BootstrapReader.Read(j.ToString()));
        }
        [TestCase(false)][TestCase(true)] public void SchemaTwelveMigrationPreservesTeamsActiveMissionAndPartialReceiving(bool conflict)
        {
            var old = File.ReadAllText("../tools/fixtures/bootstrap-before-storage-rooms.json");
            var s = new CampaignSession(new CampaignState(BootstrapReader.Read(old), new RandomState(1, 1)), null);
            s.CreateTeam("r6", "SG-1"); s.SetTeamMember("sg-team-r6", "unit-6", true); s.SetTeamMember("sg-team-r6", "unit-10", true);
            s.AssignUnit("unit-19", "r2"); s.AdmitIncoming("ITEM_ASGARD_RIFLE_0001", "r2"); s.AdvanceOneTick(); s.DeployTeam("sg-team-r6"); s.ChooseGate(false);
            var j = JObject.Parse(new CampaignSaveCodec(old).Serialize(new SavedSession(s.State, null))); j["schemaVersion"] = 12;j.Property("archivedCargoSupply")?.Remove();
            if (conflict) { var ready = j["rooms"].Single(r => (string)r["id"] == "r6"); ready["col"] = 4; ready["row"] = 4; }
            var codec = new CampaignSaveCodec(Json);
            if (conflict) { Assert.Catch(() => codec.Deserialize(j.ToString())); return; }
            var restored = codec.Deserialize(j.ToString()).Campaign;
            Assert.That(restored.Teams.Single().Designation, Is.EqualTo("SG-1")); Assert.That(restored.Teams.Single().Members, Is.EqualTo(new[] { "unit-6", "unit-10" }));
            Assert.That(restored.Expedition.TeamId, Is.EqualTo("sg-team-r6")); Assert.That(restored.Expedition.StageId, Is.EqualTo("stage-gate-yard"));
            Assert.That(restored.Receiving.Single().Progress[0].Ticks, Is.EqualTo(1)); Assert.That(restored.Receiving.Single().Progress[0].ActorId, Is.EqualTo("unit-19"));
            Assert.That(restored.Receiving.Single().RoomId, Is.EqualTo("r2")); Assert.That(restored.Clock.ElapsedTicks, Is.EqualTo(1));
            Assert.That(restored.Base.Rooms.Count, Is.EqualTo(11));
            var again = codec.Deserialize(codec.Serialize(new SavedSession(restored, null))).Campaign;
            Assert.That(again.Teams.Single().Members, Is.EqualTo(restored.Teams.Single().Members)); Assert.That(again.Base.Storage.Find("containment").Tabs.Single().CapacityByTier[1], Is.EqualTo(20));
        }
    }
}
