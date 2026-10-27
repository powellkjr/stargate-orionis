using System;
using System.IO;
using System.Linq;
using NUnit.Framework;

namespace Orionis.RoomArtLab.Tests
{
    public sealed class RoomArtAssetTests
    {
        [Test] public void AssignmentsPersistAndUsedIsGlobalWhileAssignedIsLocal()
        {
            var catalog = RoomArtAssetCatalog.Load();
            var asset = catalog.assets.First(a => a.kind == "Props & models");
            string baseRoom = "base:analysis", mission = catalog.targets.First(t => t.id.EndsWith(":stage-analysis-lab")).id;
            string directory = Path.Combine(Path.GetTempPath(), "room-art-assignments-" + Guid.NewGuid());
            string path = Path.Combine(directory, "assignments.json");
            try {
                var store = new RoomArtAssetStore(catalog, path);
                Assert.That(store.Filter(baseRoom, RoomArtAssetFilter.Used), Is.Empty);
                store.Set(baseRoom, asset.id, true); store.Set(baseRoom, asset.id, true);
                Assert.That(store.RoomCount(asset.id), Is.EqualTo(1));
                Assert.That(store.Filter(mission, RoomArtAssetFilter.Used).Select(a => a.id), Is.EqualTo(new[] { asset.id }));
                Assert.That(store.Filter(mission, RoomArtAssetFilter.Assigned), Is.Empty);
                store.Set(mission, asset.id, true);
                var reloaded = new RoomArtAssetStore(catalog, path);
                Assert.That(reloaded.RoomCount(asset.id), Is.EqualTo(2));
                Assert.That(reloaded.Filter(mission, RoomArtAssetFilter.Assigned).Single().id, Is.EqualTo(asset.id));
                reloaded.Set(baseRoom, asset.id, false);
                Assert.That(reloaded.Assigned(mission, asset.id), Is.True);
                Assert.That(reloaded.Used(asset.id), Is.True);
                var final = new RoomArtAssetStore(catalog, path);
                final.Set(mission, asset.id, false);
                Assert.That(new RoomArtAssetStore(catalog, path).Filter(baseRoom, RoomArtAssetFilter.Used), Is.Empty);
                Assert.That(File.Exists(path + ".tmp"), Is.False);
            } finally { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
        }
        [Test] public void SearchAndCategoryIntersectAssignmentsAndInvalidIdsDoNotChangeSavedChoices()
        {
            var catalog = RoomArtAssetCatalog.Load();
            var asset = catalog.assets.Single(a => a.id == "sprite:storage-rack");
            string directory = Path.Combine(Path.GetTempPath(), "room-art-assignments-" + Guid.NewGuid());
            string path = Path.Combine(directory, "assignments.json");
            try {
                var store = new RoomArtAssetStore(catalog, path);
                store.Set("base:warehouse", asset.id, true);
                string saved = File.ReadAllText(path);
                Assert.Throws<ArgumentException>(() => store.Set("unknown room", asset.id, true));
                Assert.Throws<ArgumentException>(() => store.Set("base:warehouse", "unknown asset", true));
                Assert.That(File.ReadAllText(path), Is.EqualTo(saved));
                Assert.That(store.Filter("base:warehouse", RoomArtAssetFilter.Assigned, "STORAGE RACK", "2D sprites").Single().id, Is.EqualTo(asset.id));
                Assert.That(store.Filter("base:warehouse", RoomArtAssetFilter.Assigned, "storage rack", "Structure"), Is.Empty);
                Assert.That(store.Filter("base:warehouse", RoomArtAssetFilter.Assigned, "not an asset"), Is.Empty);
                Assert.That(store.Filter("base:analysis", RoomArtAssetFilter.Assigned), Is.Empty);
            } finally { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
        }
        [Test] public void FailedSavePreservesInMemoryAssignmentsAndInvalidFileIsNotOverwritten()
        {
            var catalog = RoomArtAssetCatalog.Load();
            string directory = Path.Combine(Path.GetTempPath(), "room-art-assignments-" + Guid.NewGuid());
            Directory.CreateDirectory(directory);
            string path = Path.Combine(directory, "assignments.json");
            try {
                File.WriteAllText(path, "invalid json");
                Assert.Throws<ArgumentException>(() => new RoomArtAssetStore(catalog, path));
                Assert.That(File.ReadAllText(path), Is.EqualTo("invalid json"));
                File.Delete(path);
                var store = new RoomArtAssetStore(catalog, path);
                Directory.CreateDirectory(path); // Force an actual destination write failure.
                Assert.Throws<IOException>(() => store.Set("base:analysis", catalog.assets[0].id, true));
                Assert.That(store.Used(catalog.assets[0].id), Is.False);
                Assert.That(File.Exists(path + ".tmp"), Is.False);
            } finally { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
        }
    }
}
