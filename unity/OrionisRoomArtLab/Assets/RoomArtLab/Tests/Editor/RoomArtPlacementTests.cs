using System;
using System.IO;
using System.Linq;
using NUnit.Framework;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Orionis.RoomArtLab.Tests
{
    public sealed class RoomArtPlacementTests
    {
        private static RoomArtAsset Table(RoomArtAssetCatalog catalog) => catalog.assets.Single(a => a.path.EndsWith("/Prefabs/Props/SM_Gen_Prop_Table_01.prefab"));
        [Test] public void PlacementAddMoveRotateResizeRemovePersistsWithoutCrossRoomOrLayoutChanges()
        {
            var catalog = RoomArtAssetCatalog.Load(); var asset = Table(catalog);
            string directory = Path.Combine(Path.GetTempPath(), "room-art-placement-" + Guid.NewGuid());
            string path = Path.Combine(directory, "placements.json");
            string mission = catalog.targets.First(t => t.id.EndsWith(":stage-analysis-lab")).id;
            try {
                var store = new RoomArtPlacementStore(catalog, path);
                var a = store.Add("base:analysis", "single:1x1", asset.id, new Vector3(2, 0, 2));
                var b = store.Add(mission, "mission", asset.id, new Vector3(3, 0, 1));
                var c = store.Add("base:analysis", "comparison", asset.id, new Vector3(6, 0, 6));
                a.position = new Vector3(1, 0, 3); a.yaw = 90; a.scale = .75f; store.Put(a);
                var reloaded = new RoomArtPlacementStore(catalog, path);
                var restored = reloaded.For(a.roomId, a.layout).Single();
                Assert.That(restored.position, Is.EqualTo(a.position)); Assert.That(restored.yaw, Is.EqualTo(90)); Assert.That(restored.scale, Is.EqualTo(.75f));
                restored.scale = float.NaN;
                Assert.Throws<ArgumentException>(() => reloaded.Put(restored));
                Assert.That(reloaded.For(a.roomId, a.layout).Single().scale, Is.EqualTo(.75f));
                reloaded.Remove(a.roomId, a.layout, a.id);
                var final = new RoomArtPlacementStore(catalog, path);
                Assert.That(final.For(a.roomId, a.layout), Is.Empty);
                Assert.That(final.For(b.roomId, b.layout).Single().id, Is.EqualTo(b.id));
                Assert.That(final.For(c.roomId, c.layout).Single().id, Is.EqualTo(c.id));
            } finally { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
        }
        [Test] public void ActualMeshesAndSpriteRenderPickMoveFitAndRemoveInIsolatedPreview()
        {
            var catalog = RoomArtAssetCatalog.Load(); var table = Table(catalog);
            var source = AssetDatabase.LoadAssetAtPath<GameObject>(RoomArtPropLibrary.ImportPath(table));
            Assert.That(source, Is.Not.Null, "Stage room assets before running the lab suite.");
            var sourceMaterial = source.GetComponentInChildren<Renderer>().sharedMaterial;
            var shader = sourceMaterial.shader; var materialJson = EditorJsonUtility.ToJson(sourceMaterial);
            var scene = SceneManager.GetActiveScene(); bool dirty = scene.isDirty;
            int roots = scene.GetRootGameObjects().Length, previews = EditorSceneManager.previewSceneCount;
            var entry = new RoomArtPlacement { id = "table", roomId = "base:analysis", layout = "single:1x1", assetId = table.id, position = new Vector3(2, 0, 2) };
            var sprite = new RoomArtPlacement { id = "sprite", roomId = entry.roomId, layout = entry.layout, assetId = "sprite:bed", position = new Vector3(5.5f, 0, 2) };
            var rect = new Rect(10, 20, 900, 700);
            using (var preview = new RoomArtPreview()) {
                preview.Rebuild(RoomArtTopology.Build(RoomArtLayouts.Cells(2, 1), Array.Empty<RoomArtEdge>()), 1);
                preview.SetPlacements(new[] { entry, sprite }, catalog);
                Assert.That(preview.PlacementErrors, Is.Null); Assert.That(preview.PlacedCount, Is.EqualTo(2)); Assert.That(preview.Fits(entry.id), Is.True);
                Assert.That(Resources.FindObjectsOfTypeAll<GameObject>().Where(g => g.name == "Room furnishings")
                    .SelectMany(g => g.GetComponentsInChildren<MeshRenderer>()).Any(r => r.sharedMaterial.mainTexture == sourceMaterial.GetTexture("_Albedo_Map")), Is.True);
                var screen = preview.ProjectPoint(rect, new Vector3(2, .4f, 2));
                Assert.That(preview.Pick(rect, screen), Is.EqualTo(entry.id));
                var floorPoint = preview.ProjectPoint(rect, new Vector3(6, 0, 2));
                Assert.That(preview.TryFloor(rect, floorPoint, out var floor), Is.True);
                Assert.That(Vector3.Distance(floor, new Vector3(6, 0, 2)), Is.LessThan(.001f));
                entry.position.x = 4; preview.MovePlacement(entry); Assert.That(preview.Fits(entry.id), Is.True, "Internal cell seam is open floor.");
                entry.scale = 10; preview.MovePlacement(entry); Assert.That(preview.Fits(entry.id), Is.False);
                preview.SetPlacements(Array.Empty<RoomArtPlacement>(), catalog); Assert.That(preview.PlacedCount, Is.Zero);
                Assert.That(scene.isDirty, Is.EqualTo(dirty)); Assert.That(scene.GetRootGameObjects().Length, Is.EqualTo(roots));
            }
            Assert.That(EditorSceneManager.previewSceneCount, Is.EqualTo(previews));
            Assert.That(sourceMaterial.shader, Is.EqualTo(shader)); Assert.That(EditorJsonUtility.ToJson(sourceMaterial), Is.EqualTo(materialJson));
        }
    }
}
