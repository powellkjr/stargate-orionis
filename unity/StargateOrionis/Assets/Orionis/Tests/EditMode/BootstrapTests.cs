using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Orionis.Application;
using Orionis.Infrastructure;

namespace Orionis.Tests
{
    public sealed class BootstrapTests
    {
        private string json;
        [SetUp] public void Load() { json = File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"); }
        [Test] public void ImportsStableRoomAndRosterIdentities()
        {
            var data = BootstrapReader.Read(json);
            Assert.That(data.Rooms.Count, Is.EqualTo(11));
            Assert.That(data.Rooms[0].Id, Is.EqualTo("r1"));
            Assert.That(data.Rooms[0].Definition.Id, Is.EqualTo("gate_room"));
            Assert.That(data.Units.Count, Is.EqualTo(54));
            Assert.That(data.Units.Select(u => u.Id).Distinct().Count(), Is.EqualTo(54));
        }
        [TestCase("reference")]
        [TestCase("duplicate")]
        [TestCase("overlap")]
        [TestCase("footprint")]
        [TestCase("stats")]
        [TestCase("version")]
        public void RejectsInvalidSnapshotsBeforeProjection(string problem)
        {
            var value = JObject.Parse(json);
            switch (problem)
            {
                case "reference": value["rooms"][0]["definitionId"] = "absent"; break;
                case "duplicate": value["units"][1]["id"] = value["units"][0]["id"].ToString(); break;
                case "overlap": value["rooms"][1]["col"] = value["rooms"][0]["col"].Value<int>(); break;
                case "footprint": value["rooms"][0]["width"] = 1; break;
                case "stats": value["units"][0]["stamina"] = 101; break;
                case "version": value["format"] = "future"; break;
            }
            Assert.Throws<FormatException>(() => BootstrapReader.Read(value.ToString()));
        }
        [Test] public void SelectionHasNoEffectOnDataAndUnknownIdsPreserveSelection()
        {
            var data = BootstrapReader.Read(json);
            var selection = new SelectionService(data);
            int events = 0; selection.Changed += _ => events++;
            selection.SelectRoom("r1"); var selected = selection.Current;
            selection.SelectRoom("r1"); Assert.That(events, Is.EqualTo(1));
            Assert.Throws<ArgumentException>(() => selection.SelectRoom("missing"));
            Assert.That(selection.Current, Is.SameAs(selected));
            selection.SelectUnit(data.Units[0].Id);
            Assert.That(selection.Current.Title, Is.EqualTo(data.Units[0].Name));
            Assert.That(data.Rooms[0].Id, Is.EqualTo("r1"));
            Assert.That(events, Is.EqualTo(2));
        }
        [Test] public void ExportSeparatesDisplayProjectionFromAuthoredWorkDefinitions()
        {
            var value = JObject.Parse(json);
            Assert.That(value.Properties().Select(p => p.Name), Is.EquivalentTo(new[]
                { "format", "baseName", "sources", "roomDefinitions", "rooms", "units", "saveCompatibility", "receiving", "nameMigrations", "mission", "missionMap", "missionCombat", "missionCare", "missionRescue", "previousBaseSnapshot", "previousBaseMaxVersion", "roomStorage", "missionCargo", "cargoHandling", "cargoProcessing", "unitEquipment", "previousProgressionSnapshot" }));
            Assert.That(value["units"].ToString() + value["roomDefinitions"].ToString(), Does.Not.Contain("reality").IgnoreCase);
            Assert.That(value["receiving"]["items"][0]["instance"]["knowledge"]["revealedTags"].Values<string>(), Is.EqualTo(new[] { "PHYSICAL_OBJECT" }));
            Assert.That(json, Does.Not.Contain("physicalItem"));
        }
    }
}
