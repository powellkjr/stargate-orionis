using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    public sealed class RoomArtAssetPanel : IDisposable
    {
        private RoomArtAssetCatalog catalog;
        private RoomArtAssetStore store;
        private string error, search = "", targetId;
        private int filter = 2, category;
        private Vector2 scroll;
        private readonly Dictionary<string, Texture2D> images = new Dictionary<string, Texture2D>();
        private string[] categories;
        private const float RowHeight = 84;
        public Action<string> SelectBaseRoom;
        public Action TargetChanged, PlacementsChanged;
        public const string DragKey = "Orionis.RoomArtAsset";
        private string dragCandidate;
        private Vector2 dragStart;
        private int dragControl;
        private Action<string> startNativeDrag = DragAndDrop.StartDrag;
        public bool BlocksPreview => dragCandidate != null || DragAndDrop.GetGenericData(DragKey) != null;
        public RoomArtAssetCatalog Catalog => catalog;
        public RoomArtAssetStore Assignments => store;
        public RoomArtPlacementStore Placements { get; private set; }
        public string TargetId => targetId;
        public RoomArtAssetTarget Target => catalog?.targets.FirstOrDefault(t => t.id == targetId);
        public string LayoutKey = "comparison", SelectedPlacement;
        public Func<string, bool> PlacementFits;
        public RoomArtAssetPanel() { Reload(); }
        private void Reload()
        {
            try {
                var next = RoomArtAssetCatalog.Load();
                var nextStore = new RoomArtAssetStore(next);
                catalog = next; store = nextStore;
                Placements = new RoomArtPlacementStore(next);
                categories = new[] { "All categories" }.Concat(catalog.assets.Select(a => a.kind).Distinct().OrderBy(k => k)).ToArray();
                error = null;
            } catch (Exception e) { error = e.Message; }
        }
        public void FollowBase(string room)
        {
            targetId = "base:" + room;
        }
        // Runs at window coordinates before preview input, even when a fast drag
        // has already crossed out of the row/scrollview into the room.
        public void HandleCapturedInput(int control)
        {
            dragControl = control;
            var ev = Event.current;
            if (ev.type == EventType.DragExited || ev.type == EventType.Ignore ||
                (ev.type == EventType.KeyDown && ev.keyCode == KeyCode.Escape)) {
                bool captured = BlocksPreview; CancelDrag();
                if (captured && ev.type == EventType.KeyDown) ev.Use();
                return;
            }
            if (dragCandidate == null) return;
            if (ev.type == EventType.MouseUp) { CancelDrag(); ev.Use(); return; }
            if (ev.type != EventType.MouseDrag) return;
            if ((GUIUtility.GUIToScreenPoint(ev.mousePosition) - dragStart).sqrMagnitude > 9) {
                var asset = catalog.assets.Single(a => a.id == dragCandidate);
                DragAndDrop.PrepareStartDrag(); DragAndDrop.objectReferences = Array.Empty<UnityEngine.Object>();
                DragAndDrop.SetGenericData(DragKey, asset.id);
                if (GUIUtility.hotControl == dragControl) GUIUtility.hotControl = 0;
                startNativeDrag(asset.label); dragCandidate = null;
            }
            ev.Use();
        }
        private void CancelDrag()
        {
            dragCandidate = null; DragAndDrop.SetGenericData(DragKey, null);
            if (GUIUtility.hotControl == dragControl) GUIUtility.hotControl = 0;
        }
        public void Draw(Rect area, string previewRoom)
        {
            GUI.Box(area, GUIContent.none);
            GUILayout.BeginArea(new Rect(area.x + 8, area.y + 8, area.width - 16, area.height - 16));
            EditorGUILayout.LabelField("ROOM ASSETS", EditorStyles.boldLabel);
            if (error != null) {
                EditorGUILayout.HelpBox(error, MessageType.Error);
                if (GUILayout.Button("Reload assets / assignments")) Reload();
            }
            if (catalog == null || store == null) { GUILayout.EndArea(); return; }
            int current = Array.FindIndex(catalog.targets, t => t.id == targetId);
            EditorGUI.BeginChangeCheck();
            int next = EditorGUILayout.Popup("Assign to", Mathf.Max(0, current), catalog.targets.Select(t => t.label).ToArray());
            if (EditorGUI.EndChangeCheck() || current < 0) {
                targetId = catalog.targets[next].id; scroll = Vector2.zero;
                SelectedPlacement = null;
                if (targetId.StartsWith("base:", StringComparison.Ordinal)) SelectBaseRoom?.Invoke(targetId.Substring(5));
                else TargetChanged?.Invoke();
            }
            EditorGUILayout.LabelField(catalog.targets[next].label, EditorStyles.wordWrappedMiniLabel);
            EditorGUILayout.LabelField("Geometry preview: " + (targetId.StartsWith("mission:", StringComparison.Ordinal) ? "Authored mission footprint" : previewRoom), EditorStyles.miniLabel);
            DrawPlacements();
            EditorGUI.BeginChangeCheck();
            filter = GUILayout.Toolbar(filter, new[] { "Show all", "Show used", "Show assigned" });
            search = EditorGUILayout.TextField("Find asset", search);
            category = EditorGUILayout.Popup("Category", Mathf.Clamp(category, 0, categories.Length - 1), categories);
            if (EditorGUI.EndChangeCheck()) scroll = Vector2.zero;
            EditorGUILayout.LabelField("Used: assigned to any room. Assigned: this room.", EditorStyles.wordWrappedMiniLabel);
            EditorGUILayout.LabelField("Drag a prop/image into the room. Click a placed item to move or remove it.", EditorStyles.wordWrappedMiniLabel);
            var filtered = store.Filter(targetId, (RoomArtAssetFilter)filter, search, categories[category]);
            int assigned = catalog.assets.Count(a => store.Assigned(targetId, a.id));
            EditorGUILayout.LabelField($"{filtered.Length} shown · {assigned} assigned here", EditorStyles.miniLabel);
            var list = GUILayoutUtility.GetRect(1, 1, GUILayout.ExpandWidth(true), GUILayout.ExpandHeight(true));
            var content = new Rect(0, 0, Mathf.Max(1, list.width - 17), Mathf.Max(list.height, filtered.Length * RowHeight));
            scroll.y = Mathf.Clamp(scroll.y, 0, Mathf.Max(0, content.height - list.height));
            scroll = GUI.BeginScrollView(list, scroll, content);
            int first = Mathf.Max(0, Mathf.FloorToInt(scroll.y / RowHeight));
            int last = Mathf.Min(filtered.Length, Mathf.CeilToInt((scroll.y + list.height) / RowHeight) + 1);
            for (int i = first; i < last; i++) DrawAsset(filtered[i], new Rect(0, i * RowHeight, content.width, RowHeight - 3));
            if (filtered.Length == 0) GUI.Label(new Rect(8, 8, content.width - 16, 48), "No matching assets. Try Show all or clear the search.", EditorStyles.wordWrappedLabel);
            GUI.EndScrollView(); GUILayout.EndArea();
        }
        private void DrawAsset(RoomArtAsset asset, Rect row)
        {
            bool assigned = store.Assigned(targetId, asset.id);
            GUI.Box(row, GUIContent.none);
            var icon = new Rect(row.x + 5, row.y + 8, 38, 38);
            Texture texture = null;
            bool canPlace = RoomArtPropLibrary.CanPlace(asset);
            if (canPlace && !asset.image) {
                if (!images.TryGetValue(asset.id, out var image)) {
                    try { image = Thumbnail(asset); } catch { image = null; }
                    images[asset.id] = image;
                }
                texture = image;
            }
            if (asset.image) {
                if (!images.TryGetValue(asset.id, out var image)) {
                    string path = SourcePath(asset);
                    if (File.Exists(path)) {
                        image = new Texture2D(2, 2) { hideFlags = HideFlags.HideAndDontSave };
                        if (!image.LoadImage(File.ReadAllBytes(path))) { UnityEngine.Object.DestroyImmediate(image); image = null; }
                    }
                    images[asset.id] = image;
                }
                texture = image;
            }
            if (texture) GUI.DrawTexture(icon, texture, ScaleMode.ScaleToFit, true);
            else GUI.Label(icon, EditorGUIUtility.IconContent(asset.extension == ".prefab" ? "Prefab Icon" : "Mesh Icon"));
            GUI.Label(new Rect(48, row.y + 5, row.width - 127, 34), new GUIContent(asset.label, asset.path), EditorStyles.wordWrappedLabel);
            GUI.Label(new Rect(48, row.y + 41, row.width - 53, 16), new GUIContent(asset.pack + " · " + asset.kind + " · " + asset.extension, asset.path), EditorStyles.miniLabel);
            string status = asset.disabled ? "Disabled sprite candidate" : canPlace ? "Drag to place" : "Reference source";
            GUI.Label(new Rect(48, row.y + 60, row.width - 130, 16), status, EditorStyles.miniLabel);
            if (GUI.Button(new Rect(row.width - 76, row.y + 7, 71, 24), assigned ? "Unassign" : "Assign")) {
                try { store.Set(targetId, asset.id, !assigned); error = null; }
                catch (Exception e) { error = "Assignment was not saved: " + e.Message; }
            }
            if (GUI.Button(new Rect(row.width - 76, row.y + 57, 71, 20), new GUIContent("Source", asset.path)))
                EditorUtility.RevealInFinder(SourcePath(asset));
            var handle = new Rect(row.x, row.y, row.width - 80, row.height);
            if (canPlace && Event.current.type == EventType.MouseDown && Event.current.button == 0 && handle.Contains(Event.current.mousePosition)) {
                dragCandidate = asset.id; dragStart = GUIUtility.GUIToScreenPoint(Event.current.mousePosition);
                GUIUtility.hotControl = dragControl; Event.current.Use();
            }
        }
        private static Texture2D Thumbnail(RoomArtAsset asset)
        {
            var utility = new PreviewRenderUtility();
            using (var library = new RoomArtPropLibrary()) {
                try {
                    var owner = new GameObject("Asset thumbnail") { hideFlags = HideFlags.HideAndDontSave }; utility.AddSingleGO(owner);
                    var prop = library.Build(asset, owner.transform); var bounds = RoomArtPropLibrary.Bounds(prop);
                    float radius = Mathf.Max(bounds.size.x, bounds.size.y, bounds.size.z, .2f);
                    utility.camera.orthographic = true; utility.camera.orthographicSize = radius * .7f;
                    utility.camera.nearClipPlane = .01f; utility.camera.farClipPlane = radius * 20 + 10;
                    utility.camera.transform.position = bounds.center + new Vector3(2, 1.5f, 2) * radius;
                    utility.camera.transform.LookAt(bounds.center);
                    utility.lights[0].intensity = 1; utility.lights[0].transform.rotation = Quaternion.Euler(35, 25, 0);
                    utility.ambientColor = new Color(.5f, .5f, .5f);
                    utility.BeginStaticPreview(new Rect(0, 0, 80, 80)); utility.Render(true);
                    var image = utility.EndStaticPreview(); image.hideFlags = HideFlags.HideAndDontSave; return image;
                } finally { utility.Cleanup(); }
            }
        }
        private void DrawPlacements()
        {
            var entries = Placements.For(targetId, LayoutKey);
            int selected = Array.FindIndex(entries, p => p.id == SelectedPlacement) + 1;
            int next = EditorGUILayout.Popup("Placed items", selected, new[] { $"None · {entries.Length} placed" }.Concat(entries.Select(p => catalog.assets.First(a => a.id == p.assetId).label + " · " + p.id.Substring(0, 4))).ToArray());
            if (next != selected) { SelectedPlacement = next == 0 ? null : entries[next - 1].id; PlacementsChanged?.Invoke(); }
            var entry = entries.FirstOrDefault(p => p.id == SelectedPlacement);
            if (entry == null) return;
            if (PlacementFits != null && !PlacementFits(entry.id)) EditorGUILayout.HelpBox("Overhangs this room/group. Move, resize or remove it.", MessageType.Warning);
            EditorGUI.BeginChangeCheck();
            var xz = EditorGUILayout.Vector2Field("Position X / Z", new Vector2(entry.position.x, entry.position.z));
            entry.position = new Vector3(xz.x, 0, xz.y);
            entry.yaw = EditorGUILayout.FloatField("Rotation", entry.yaw);
            entry.scale = EditorGUILayout.Slider("Scale", entry.scale, .05f, 4);
            if (EditorGUI.EndChangeCheck()) { try { Placements.Put(entry); PlacementsChanged?.Invoke(); } catch (Exception e) { error = e.Message; } }
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("Rotate 90°")) { entry.yaw += 90; Placements.Put(entry); PlacementsChanged?.Invoke(); }
            if (GUILayout.Button("Remove item")) RemoveSelected();
            EditorGUILayout.EndHorizontal();
        }
        public void RemoveSelected()
        {
            if (SelectedPlacement == null) return;
            try { Placements.Remove(targetId, LayoutKey, SelectedPlacement); SelectedPlacement = null; PlacementsChanged?.Invoke(); }
            catch (Exception e) { error = e.Message; }
        }
        private static string SourcePath(RoomArtAsset asset) => Path.GetFullPath(Path.Combine(Application.dataPath, "../../..", asset.path));
        public void Dispose()
        {
            CancelDrag();
            foreach (var texture in images.Values) if (texture) UnityEngine.Object.DestroyImmediate(texture);
            images.Clear();
        }
    }
}
