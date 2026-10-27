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
    public sealed class CampaignSaveTests
    {
        private string directory, path, fixture;
        private CampaignSaveCodec codec;
        private CampaignSession session;
        [SetUp] public void Setup()
        {
            directory = Path.Combine(Path.GetTempPath(), "orionis-save-tests-" + Guid.NewGuid().ToString("N"));
            path = Path.Combine(directory, "save.json");
            fixture = File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
            codec = new CampaignSaveCodec(fixture);
            session = new CampaignSession(new CampaignState(BootstrapReader.Read(fixture), new RandomState(1, 1)),
                new FileCampaignSaveStore(path, codec));
        }
        [TearDown] public void Cleanup()
        {
            if (!Directory.Exists(directory)) return;
            foreach (var file in Directory.GetFiles(directory)) File.Delete(file);
            Directory.Delete(directory);
        }
        [Test] public void DiskSaveSurvivesFreshSessionAndRestoresSelectionAndIdentities()
        {
            session.Selection.SelectUnit("unit-54"); session.Save();
            var fresh = new CampaignSession(new CampaignState(BootstrapReader.Read(fixture), new RandomState(9, 9)),
                new FileCampaignSaveStore(path, new CampaignSaveCodec(fixture)));
            fresh.Selection.SelectRoom("r1"); fresh.Load();
            Assert.That(fresh.Selection.Current.Id, Is.EqualTo("unit-54"));
            Assert.That(fresh.Selection.Current.Kind, Is.EqualTo(SelectionKind.Unit));
            Assert.That(fresh.State.Base.Rooms.Select(r => r.Id), Is.EqualTo(session.State.Base.Rooms.Select(r => r.Id)));
            Assert.That(fresh.State.Base.Units.Select(u => u.Id), Is.EqualTo(session.State.Base.Units.Select(u => u.Id)));
            Assert.That(fresh.State.Random.Seed, Is.EqualTo(1u));
            Assert.That(fresh.State.Random.Value, Is.EqualTo(1u));
            Assert.That(File.ReadAllText(path), Does.Not.Contain("roomDefinitions").And.Not.Contain("sources"));
        }
        [Test] public void SavePreservesCurrentStateRatherThanReimportingDefaults()
        {
            var data = session.State.Base;
            var moved = data.Rooms.Select(r => r.Id == "r2" ? new RoomInstance(r.Id, r.Definition, 4, 6, r.ConstructionTier) : r);
            var units = data.Units.Select(u => u.Id == "unit-1" ? new UnitSummary(u.Id, u.Name, u.Profession,
                u.Tier, u.Branch, u.Color, u.Perception, 62, u.Endurance) : u);
            var random = new RandomState(uint.MaxValue, uint.MaxValue);
            for (int i = 0; i < 12; i++) random = random.Advance();
            var current = new SavedSession(new CampaignState(new BootstrapData(data.BaseName, moved, units), random), null);
            var restored = codec.Deserialize(codec.Serialize(current));
            Assert.That(restored.Campaign.Base.Rooms.Single(r => r.Id == "r2").Row, Is.EqualTo(6));
            Assert.That(restored.Campaign.Base.Units[0].Stamina, Is.EqualTo(62));
            Assert.That(restored.Selection, Is.Null);
            Assert.That(restored.Campaign.Random.Seed, Is.EqualTo(uint.MaxValue));
            for (int i = 0; i < 20; i++)
            {
                random = random.Advance();
                var next = restored.Campaign.Random;
                for (int j = 0; j <= i; j++) next = next.Advance();
                Assert.That(next.Value, Is.EqualTo(random.Value));
            }
        }
        [Test] public void RandomStreamHasStableKnownSequenceIncludingOverflow()
        {
            var random = new RandomState(1, 1).Advance();
            Assert.That(random.Value, Is.EqualTo(1015568748u));
            Assert.That(random.Advance().Value, Is.EqualTo(1586005467u));
            Assert.That(new RandomState(0, uint.MaxValue).Advance().Value, Is.EqualTo(1012239698u));
        }
        [TestCase("truncated")]
        [TestCase("version")]
        [TestCase("fingerprint")]
        [TestCase("algorithm")]
        [TestCase("missing-unit")]
        [TestCase("duplicate-unit")]
        [TestCase("room-reference")]
        [TestCase("overlap")]
        [TestCase("stats")]
        [TestCase("fraction")]
        [TestCase("missing-state")]
        [TestCase("null-room")]
        [TestCase("unknown-selection")]
        [TestCase("selection-kind")]
        [TestCase("unknown-field")]
        [TestCase("negative-ticks")]
        [TestCase("overflow-ticks")]
        [TestCase("missing-ticks")]
        [TestCase("fractional-ticks")]
        [TestCase("v1-with-clock")]
        public void InvalidLoadLeavesCurrentSessionAndSaveBytesUntouched(string corruption)
        {
            session.Selection.SelectRoom("r1"); session.Save();
            var value = JObject.Parse(File.ReadAllText(path));
            switch (corruption)
            {
                case "version": value["schemaVersion"] = 23;value.Property("archivedCargoSupply")?.Remove(); break;
                case "fingerprint": value["fixtureFingerprint"] = "different"; break;
                case "algorithm": value["randomAlgorithm"] = "different"; break;
                case "missing-unit": value["units"][0].Remove(); break;
                case "duplicate-unit": value["units"][1]["id"] = "unit-1"; break;
                case "room-reference": value["rooms"][0]["definitionId"] = "missing"; break;
                case "overlap": value["rooms"][1]["col"] = 1; break;
                case "stats": value["units"][0]["stamina"] = 101; break;
                case "fraction": value["randomState"] = 1.5; break;
                case "missing-state": value.Property("randomState").Remove(); break;
                case "null-room": value["rooms"][0] = JValue.CreateNull(); break;
                case "unknown-selection": value["selection"]["id"] = "missing"; break;
                case "selection-kind": value["selection"]["kind"] = "0"; break;
                case "unknown-field": value["invented"] = true; break;
                case "negative-ticks": value["elapsedTicks"] = -1; break;
                case "overflow-ticks": value["elapsedTicks"] = long.MaxValue; break;
                case "missing-ticks": value.Property("elapsedTicks").Remove(); break;
                case "fractional-ticks": value["elapsedTicks"] = 1.5; break;
                case "v1-with-clock": value["schemaVersion"] = 1;value.Property("archivedCargoSupply")?.Remove(); value.Property("teams").Remove(); break;
            }
            var invalid = corruption == "truncated" ? "{\"schemaVersion\":" : value.ToString();
            File.WriteAllText(path, invalid);
            var current = session.State; var selection = session.Selection;
            Assert.Catch(() => session.Load());
            Assert.That(session.State, Is.SameAs(current));
            Assert.That(session.Selection, Is.SameAs(selection));
            Assert.That(session.Selection.Current.Id, Is.EqualTo("r1"));
            Assert.That(File.ReadAllText(path), Is.EqualTo(invalid));
        }
        [Test] public void MissingSaveLeavesCurrentStateUntouched()
        {
            var current = session.State;
            Assert.Catch<IOException>(() => session.Load());
            Assert.That(session.State, Is.SameAs(current));
            Assert.That(File.Exists(path), Is.False);
        }
        [Test] public void InvalidSaveCandidateDoesNotOverwriteExistingFile()
        {
            session.Save(); var previous = File.ReadAllText(path);
            var store = new FileCampaignSaveStore(path, codec);
            Assert.Catch(() => store.Save(new SavedSession(session.State, new SelectionReference(SelectionKind.Room, "missing"))));
            Assert.That(File.ReadAllText(path), Is.EqualTo(previous));
            Assert.That(Directory.GetFiles(directory, "*.tmp"), Is.Empty);
        }
        [Test] public void RepeatedSaveAtomicallyReplacesSlot()
        {
            session.Selection.SelectRoom("r1"); session.Save();
            session.Selection.SelectRoom("r2"); session.Save();
            Assert.That(new FileCampaignSaveStore(path, codec).Load().Selection.Id, Is.EqualTo("r2"));
            Assert.That(Directory.GetFiles(directory, "*.tmp"), Is.Empty);
        }
        [Test, Platform("Win")] public void FailedReplacementKeepsPreviousSaveAndRemovesTemporaryFile()
        {
            session.Selection.SelectRoom("r1"); session.Save(); var previous = File.ReadAllText(path);
            using (var locked = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                session.Selection.SelectRoom("r2");
                Assert.Catch<IOException>(() => session.Save());
            }
            Assert.That(File.ReadAllText(path), Is.EqualTo(previous));
            Assert.That(Directory.GetFiles(directory, "*.tmp"), Is.Empty);
        }
        [Test] public void ChangedAuthoredFixtureIsRejectedRatherThanSilentlyReinterpreted()
        {
            session.Save(); var changed = JObject.Parse(fixture);
            changed["roomDefinitions"][0]["name"] = "Different authored name";
            var newCodec = new CampaignSaveCodec(changed.ToString());
            Assert.Throws<FormatException>(() => newCodec.Deserialize(File.ReadAllText(path)));
        }
        [Test] public void SavedClockRestoresExactlyRatherThanAdvancingOrResetting()
        {
            session.Selection.SelectRoom("r5");
            for (int i = 0; i < 7; i++) session.AdvanceOneTick();
            session.Save(); session.AdvanceOneTick(); session.Load();
            Assert.That(session.State.Clock.ElapsedTicks, Is.EqualTo(7));
            Assert.That(session.State.Clock.ElapsedMinutes, Is.EqualTo(21));
            Assert.That(session.Selection.Current.Id, Is.EqualTo("r5"));
        }
        [Test] public void LegacyVersionOneMigratesAtTickZeroWithoutRewritingFileOnLoad()
        {
            session.Selection.SelectRoom("r5"); session.Save();
            var value = JObject.Parse(File.ReadAllText(path));
            value["schemaVersion"] = 1;value.Property("archivedCargoSupply")?.Remove(); value.Property("teams").Remove(); value.Property("elapsedTicks").Remove(); value.Property("assignments").Remove();
            value.Property("receiving").Remove(); value.Property("receivingFingerprint").Remove();
            value.Property("transfers").Remove();
            value.Property("expedition").Remove(); value.Property("missionFingerprint").Remove(); value.Property("combatFingerprint").Remove(); value.Property("careFingerprint").Remove(); value.Property("rescueFingerprint").Remove();
            var legacy = value.ToString(); File.WriteAllText(path, legacy);
            session.AdvanceOneTick(); session.Load();
            Assert.That(session.State.Clock.ElapsedTicks, Is.Zero);
            Assert.That(session.Selection.Current.Id, Is.EqualTo("r5"));
            Assert.That(session.State.Random.Value, Is.EqualTo(1u));
            Assert.That(File.ReadAllText(path), Is.EqualTo(legacy));
            session.Save();
            Assert.That(JObject.Parse(File.ReadAllText(path))["schemaVersion"].Value<int>(), Is.EqualTo(22));
        }
        [Test] public void LoadingEarlierSaveClearsSelectionOfRoomThatHasNotBeenBuiltYet()
        {
            session=new CampaignSession(RoomConstruction.SeedStaff(session.State),new FileCampaignSaveStore(path,codec));session.Save();
            session.BuildRoom("ready_room",1,0,2,"unit-22");for(int i=0;i<480;i++)session.AdvanceOneTick();
            session.Selection.SelectRoom(session.State.Construction.Sites.Single().RoomId);
            session.Load();
            Assert.That(session.State.Base.Rooms.Count,Is.EqualTo(16));Assert.That(session.Selection.Current,Is.Null);
            Assert.That(session.State.Construction.Sites,Is.Empty);Assert.That(session.State.Construction.Supply["S1"],Is.EqualTo(500));
        }
    }
}
