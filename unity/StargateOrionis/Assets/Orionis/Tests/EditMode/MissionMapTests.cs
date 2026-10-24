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
    public sealed class MissionMapTests
    {
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        [Test] public void ImportsAuthoredGridAndPhysicalStageFootprints()
        {
            var map = BootstrapReader.Read(Json).MissionMap;
            Assert.That(map.Width, Is.EqualTo(9)); Assert.That(map.Height, Is.EqualTo(7));
            Assert.That(map.Stages.Single(s => s.Id == "stage-holding-area").Cells.Select(c => (c.X, c.Y)),
                Is.EquivalentTo(new[] { (2, 3), (3, 3), (2, 2), (3, 2) }));
            Assert.That(map.Stages.Single(s => s.Id == "stage-gate-yard").Cells.Single().Y, Is.EqualTo(6));
        }
        [TestCase("overlap")][TestCase("bounds")][TestCase("reference")]
        public void InvalidGeometryIsRejected(string problem)
        {
            var j = JObject.Parse(Json);
            if (problem == "overlap") j["missionMap"]["stages"][1]["cells"][0] = j["missionMap"]["stages"][0]["cells"][0].DeepClone();
            if (problem == "bounds") j["missionMap"]["stages"][0]["cells"][0]["x"] = 9;
            if (problem == "reference") j["missionMap"]["stages"][0]["id"] = "unknown";
            Assert.Throws<FormatException>(() => BootstrapReader.Read(j.ToString()));
        }
        [Test] public void VisualGeometryDoesNotChangeMissionSaveFingerprintOrGrantExploration()
        {
            var before = JObject.Parse(Json); before.Property("missionMap").Remove();
            var data = BootstrapReader.Read(before.ToString());
            var state = Expeditions.ChooseGate(Expeditions.Deploy(new CampaignState(data, new RandomState(1, 1)), new[] { "unit-6" }), true);
            var saved = new CampaignSaveCodec(before.ToString()).Serialize(new SavedSession(state, null));
            var restored = new CampaignSaveCodec(Json).Deserialize(saved).Campaign;
            Assert.That(restored.Base.MissionMap, Is.Not.Null); Assert.That(restored.Clock.ElapsedTicks, Is.Zero);
            Assert.That(restored.Expedition.Travel.Visits.Keys, Is.EqualTo(new[] { "stage-gate-yard" }));
            Assert.That(restored.Expedition.Travel.Knowledge, Does.Not.Contain("operative-located"));
        }
    }
}
