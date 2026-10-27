using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Reflection;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;
using UnityEngine.TestTools;

namespace Orionis.RoomArtLab.Tests
{
    public sealed class RoomArtInputTests
    {
        [UnityTest] public IEnumerator OnlyGesturesStartedInThePreviewCanOrbitAndAssetCrossingIsCapturedFirst()
        {
            var flags = BindingFlags.Instance | BindingFlags.NonPublic;
            string directory = Path.Combine(Path.GetTempPath(), "room-art-input-" + Guid.NewGuid());
            var window = ScriptableObject.CreateInstance<RoomArtLabWindow>();
            try {
                window.ShowUtility(); window.position = new Rect(30, 30, 1320, 800);
                var type = window.GetType();
                var panel = (RoomArtAssetPanel)type.GetField("assetPanel", flags).GetValue(window);
                // Test input routing without entering the OS native drag loop.
                typeof(RoomArtAssetPanel).GetField("startNativeDrag", flags).SetValue(panel, new Action<string>(_ => { }));
                typeof(RoomArtAssetPanel).GetProperty("Placements").SetValue(panel, new RoomArtPlacementStore(panel.Catalog, Path.Combine(directory, "placements.json")));
                typeof(RoomArtAssetPanel).GetField("search", flags).SetValue(panel, "SM_Gen_Prop_Table_01.prefab");
                typeof(RoomArtAssetPanel).GetField("filter", flags).SetValue(panel, 0);
                type.GetMethod("Regenerate", flags).Invoke(window, null);
                yield return null;
                var preview = (RoomArtPreview)type.GetField("preview", flags).GetValue(window);
                var pointer = new Vector2(550, 250);
                float yaw = preview.Yaw, pitch = preview.Pitch;
                // A drag that enters from either sidebar without a preview press
                // must never start orbit, even before a native asset drag exists.
                window.SendEvent(new Event { type = EventType.MouseDrag, button = 0, mousePosition = pointer, delta = new Vector2(20, 10) });
                Assert.That(preview.Yaw, Is.EqualTo(yaw)); Assert.That(preview.Pitch, Is.EqualTo(pitch));
                // Reproduce a fast first movement crossing the row and divider
                // in one event. Pending row capture must win before preview input.
                var asset = panel.Catalog.assets.Single(a => a.path.EndsWith("/Prefabs/Props/SM_Gen_Prop_Table_01.prefab"));
                typeof(RoomArtAssetPanel).GetField("dragCandidate", flags).SetValue(panel, asset.id);
                typeof(RoomArtAssetPanel).GetField("dragStart", flags).SetValue(panel, new Vector2(-2000, -2000));
                window.SendEvent(new Event { type = EventType.MouseDrag, button = 0, mousePosition = pointer, delta = new Vector2(-500, 0) });
                Assert.That(DragAndDrop.GetGenericData(RoomArtAssetPanel.DragKey), Is.EqualTo(asset.id));
                Assert.That(preview.Yaw, Is.EqualTo(yaw)); Assert.That(preview.Pitch, Is.EqualTo(pitch));
                window.SendEvent(new Event { type = EventType.KeyDown, keyCode = KeyCode.Escape });
                Assert.That(panel.BlocksPreview, Is.False); Assert.That(GUIUtility.hotControl, Is.Zero);
                // Native drag cancellation must leave ordinary orbit available.
                window.SendEvent(new Event { type = EventType.MouseDown, button = 0, mousePosition = pointer });
                window.SendEvent(new Event { type = EventType.MouseDrag, button = 0, mousePosition = pointer + new Vector2(20, 10), delta = new Vector2(20, 10) });
                Assert.That(preview.Yaw, Is.EqualTo(yaw + 8).Within(.001f));
                Assert.That(preview.Pitch, Is.EqualTo(pitch + 4).Within(.001f));
                window.SendEvent(new Event { type = EventType.MouseUp, button = 0, mousePosition = new Vector2(1200, 300) });
                Assert.That(GUIUtility.hotControl, Is.Zero);
                Assert.That(panel.Placements.For(panel.TargetId, panel.LayoutKey), Is.Empty);
            } finally {
                DragAndDrop.SetGenericData(RoomArtAssetPanel.DragKey, null);
                window.Close();
                if (Directory.Exists(directory)) Directory.Delete(directory, true);
            }
        }
    }
}
