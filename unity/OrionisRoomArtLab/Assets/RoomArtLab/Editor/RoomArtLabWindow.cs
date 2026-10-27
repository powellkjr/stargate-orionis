using System;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    public sealed class RoomArtLabWindow : EditorWindow
    {
        private RoomArtCatalog catalog;
        private RoomArtPreview preview;
        private RoomArtAssetPanel assetPanel;
        private int roomIndex, layoutIndex, tierIndex, selected = -1;
        private string search = "", error;
        private Vector2 scroll;
        private readonly HashSet<RoomArtEdge> doors = new HashSet<RoomArtEdge>();
        private IReadOnlyList<RoomArtModule> modules;
        private IReadOnlyList<RoomArtEdge> edges;
        private bool visible = true;
        private bool showAllJoins = true;
        private float panelWidth = 340;
        private bool resizing;
        private float assetPanelWidth = 350;
        private bool resizingAssets;
        private RoomArtPlacement movingPlacement;
        private Vector3 moveOffset;
        private bool orbitDragging;
        private int orbitControl, propControl;
        private bool Mission => assetPanel?.TargetId?.StartsWith("mission:", StringComparison.Ordinal) == true;
        private bool Comparing => !Mission && catalog != null && showAllJoins && RoomArtComparison.Available(catalog.rooms[roomIndex]);
        [MenuItem("Orionis/Art/Room Art Lab")]
        public static void Open() => GetWindow<RoomArtLabWindow>("Room Art Lab");
        private void OnEnable()
        {
            minSize = new Vector2(1060, 540);
            assetPanel = new RoomArtAssetPanel();
            assetPanel.SelectBaseRoom = id => {
                int index = Array.FindIndex(catalog.rooms, room => room.id == id);
                if (index >= 0 && index != roomIndex) { search = ""; roomIndex = index; ResetRoom(); }
            };
            assetPanel.TargetChanged = () => { doors.Clear(); selected = -1; CancelPreviewGesture(); Regenerate(); };
            assetPanel.PlacementsChanged = RefreshPlacements;
            assetPanel.PlacementFits = id => preview != null && preview.Fits(id);
            preview = new RoomArtPreview(); Reload();
        }
        private void OnDisable() { CancelPreviewGesture(); preview?.Dispose(); preview = null; assetPanel?.Dispose(); assetPanel = null; }
        private void Reload()
        {
            try { catalog = RoomArtCatalog.Load(); error = null; roomIndex = Mathf.Clamp(roomIndex, 0, catalog.rooms.Length - 1); ResetRoom(); }
            catch (Exception e) { error = e.Message; }
        }
        private void ResetRoom() { CancelPreviewGesture(); layoutIndex = tierIndex = 0; doors.Clear(); selected = -1; assetPanel?.FollowBase(catalog.rooms[roomIndex].id); Regenerate(); }
        private void CancelPreviewGesture()
        {
            movingPlacement = null; orbitDragging = false;
            if (GUIUtility.hotControl == orbitControl || GUIUtility.hotControl == propControl) GUIUtility.hotControl = 0;
        }
        private void Regenerate()
        {
            try {
                var room = catalog.rooms[roomIndex]; var layouts = RoomArtLayouts.For(room);
                layoutIndex = Mathf.Clamp(layoutIndex, 0, layouts.Count - 1);
                tierIndex = Mathf.Clamp(tierIndex, 0, room.tiers.Length - 1);
                var layout = layouts[layoutIndex]; var cells = Mission ? assetPanel.Target.cells : RoomArtLayouts.Cells(layout.Width, layout.Height);
                if (!Mission && layout.Joined) {
                    var blocker = RoomArtLayouts.Blocker(room, cells, room.tiers[tierIndex]);
                    if (blocker != null) throw new InvalidOperationException(blocker);
                }
                preview.Groups = Comparing ? RoomArtComparison.Groups(room, room.tiers[tierIndex]) : Array.Empty<RoomArtGroupPreview>();
                edges = Comparing ? RoomArtComparison.Edges(preview.Groups) : RoomArtTopology.Exterior(cells);
                doors.RemoveWhere(d => !edges.Contains(d));
                modules = Comparing ? RoomArtComparison.Build(preview.Groups, doors) : RoomArtTopology.Build(cells, doors); error = null;
                selected = Mathf.Clamp(selected, -1, modules.Count - 1);
                preview.Rebuild(modules, Mission ? 1 : room.tiers[tierIndex], selected);
                assetPanel.LayoutKey = Mission ? "mission" : Comparing ? "comparison" : $"single:{layout.Width}x{layout.Height}";
                RefreshPlacements(); Repaint();
            } catch (Exception e) { error = e.Message; }
        }
        private void RefreshPlacements()
        {
            if (preview == null || assetPanel?.Placements == null || modules == null) return;
            preview.SelectedPlacement = assetPanel.SelectedPlacement;
            preview.SetPlacements(assetPanel.Placements.For(assetPanel.TargetId, assetPanel.LayoutKey), assetPanel.Catalog);
            Repaint();
        }
        private void HandlePlacementInput(Rect rect)
        {
            var ev = Event.current;
            if (movingPlacement != null && (ev.type == EventType.Ignore || (ev.type == EventType.KeyDown && ev.keyCode == KeyCode.Escape))) {
                CancelPreviewGesture(); RefreshPlacements(); if (ev.type == EventType.KeyDown) ev.Use(); return;
            }
            if (movingPlacement != null && ev.type == EventType.MouseUp) {
                try { assetPanel.Placements.Put(movingPlacement); error = null; }
                catch (Exception e) { error = e.Message; }
                movingPlacement = null; if (GUIUtility.hotControl == propControl) GUIUtility.hotControl = 0;
                RefreshPlacements(); ev.Use(); return;
            }
            if (ev.type == EventType.KeyDown && (ev.keyCode == KeyCode.Delete || ev.keyCode == KeyCode.Backspace) && !EditorGUIUtility.editingTextField) {
                assetPanel.RemoveSelected(); ev.Use(); return;
            }
            if (assetPanel.BlocksPreview && ev.type != EventType.DragUpdated && ev.type != EventType.DragPerform) return;
            if (!rect.Contains(ev.mousePosition) || !visible) return;
            if (ev.type == EventType.DragUpdated || ev.type == EventType.DragPerform) {
                var assetId = DragAndDrop.GetGenericData(RoomArtAssetPanel.DragKey) as string;
                var asset = assetPanel.Catalog.assets.FirstOrDefault(a => a.id == assetId);
                bool valid = asset != null && RoomArtPropLibrary.CanPlace(asset) && preview.TryFloor(rect, ev.mousePosition, out _);
                DragAndDrop.visualMode = valid ? DragAndDropVisualMode.Copy : DragAndDropVisualMode.Rejected;
                if (ev.type == EventType.DragPerform && valid) {
                    DragAndDrop.AcceptDrag();
                    try {
                        preview.TryFloor(rect, ev.mousePosition, out var position);
                        assetPanel.Assignments.Set(assetPanel.TargetId, assetId, true);
                        var placed = assetPanel.Placements.Add(assetPanel.TargetId, assetPanel.LayoutKey, assetId, position);
                        assetPanel.SelectedPlacement = placed.id; error = null; RefreshPlacements();
                    } catch (Exception e) { error = e.Message; }
                    DragAndDrop.SetGenericData(RoomArtAssetPanel.DragKey, null);
                }
                ev.Use(); return;
            }
            if (ev.type == EventType.MouseDown && ev.button == 0) {
                string id = preview.Pick(rect, ev.mousePosition);
                assetPanel.SelectedPlacement = id; preview.SelectedPlacement = id;
                if (id != null && preview.TryFloor(rect, ev.mousePosition, out var floor)) {
                    movingPlacement = assetPanel.Placements.For(assetPanel.TargetId, assetPanel.LayoutKey).Single(p => p.id == id);
                    moveOffset = movingPlacement.position - floor;
                    GUIUtility.hotControl = propControl;
                    ev.Use();
                }
                Repaint();
            }
            if (ev.type == EventType.MouseDrag && movingPlacement != null) {
                if (preview.TryFloor(rect, ev.mousePosition, out var position)) {
                    movingPlacement.position = position + moveOffset; movingPlacement.position.y = 0; preview.MovePlacement(movingPlacement);
                }
                Repaint(); ev.Use();
            }
        }
        private void HandleCameraInput(Rect rect)
        {
            var ev = Event.current;
            if (orbitDragging && (ev.type == EventType.MouseUp || ev.type == EventType.Ignore ||
                (ev.type == EventType.KeyDown && ev.keyCode == KeyCode.Escape))) {
                orbitDragging = false;
                if (GUIUtility.hotControl == orbitControl) GUIUtility.hotControl = 0;
                if (ev.type == EventType.MouseUp) ev.Use();
            }
            if (!visible || assetPanel.BlocksPreview || !rect.Contains(ev.mousePosition) ||
                (GUIUtility.hotControl != 0 && GUIUtility.hotControl != orbitControl)) return;
            if (ev.type == EventType.MouseDown && ev.button == 0) {
                orbitDragging = true; GUIUtility.hotControl = orbitControl; ev.Use();
            }
            if (ev.type == EventType.MouseDrag && ev.button == 0 && orbitDragging && GUIUtility.hotControl == orbitControl) {
                preview.Yaw += ev.delta.x * .4f; preview.Pitch = Mathf.Clamp(preview.Pitch + ev.delta.y * .4f, 15, 90); Repaint(); ev.Use();
            }
            if (ev.type == EventType.ScrollWheel) { preview.Zoom = Mathf.Clamp(preview.Zoom + ev.delta.y * .04f, .35f, 3); Repaint(); ev.Use(); }
        }
        private void OnGUI()
        {
            orbitControl = GUIUtility.GetControlID("RoomArtOrbit".GetHashCode(), FocusType.Passive);
            propControl = GUIUtility.GetControlID("RoomArtPropMove".GetHashCode(), FocusType.Passive);
            int assetControl = GUIUtility.GetControlID("RoomArtAssetDrag".GetHashCode(), FocusType.Passive);
            assetPanel?.HandleCapturedInput(assetControl);
            panelWidth = Mathf.Clamp(panelWidth, 280, position.width - 680);
            assetPanelWidth = Mathf.Clamp(assetPanelWidth, 310, position.width - panelWidth - 365);
            var split = new Rect(panelWidth, 0, 5, position.height);
            var assetSplit = new Rect(position.width - assetPanelWidth - 5, 0, 5, position.height);
            EditorGUIUtility.AddCursorRect(assetSplit, MouseCursor.ResizeHorizontal);
            if (Event.current.type == EventType.MouseDown && assetSplit.Contains(Event.current.mousePosition)) { resizingAssets = true; Event.current.Use(); }
            EditorGUIUtility.AddCursorRect(split, MouseCursor.ResizeHorizontal);
            if (Event.current.type == EventType.MouseDown && split.Contains(Event.current.mousePosition)) { resizing = true; Event.current.Use(); }
            if (Event.current.type == EventType.MouseUp) { resizing = false; resizingAssets = false; }
            if (resizing && Event.current.type == EventType.MouseDrag) { panelWidth = Mathf.Clamp(Event.current.mousePosition.x, 280, position.width - assetPanelWidth - 365); Repaint(); Event.current.Use(); }
            if (resizingAssets && Event.current.type == EventType.MouseDrag) { assetPanelWidth = Mathf.Clamp(position.width - Event.current.mousePosition.x, 310, position.width - panelWidth - 365); Repaint(); Event.current.Use(); }
            GUILayout.BeginArea(new Rect(0, 0, panelWidth, position.height));
            scroll = EditorGUILayout.BeginScrollView(scroll);
            EditorGUILayout.LabelField("ROOM ART LAB", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox("Independent presentation preview. Doors are art test placements; no gameplay connectivity is changed.", MessageType.Info);
            if (GUILayout.Button("Reload canonical catalog")) Reload();
            if (catalog != null) DrawControls();
            if (error != null) EditorGUILayout.HelpBox(error, MessageType.Error);
            EditorGUILayout.EndScrollView(); GUILayout.EndArea();
            var rect = new Rect(panelWidth + 5, 0, position.width - panelWidth - assetPanelWidth - 10, position.height - 58);
            if (visible) preview?.Draw(rect);
            else GUI.Box(rect, "Preview cleared. Use Regenerate.");
            if (catalog != null) HandlePlacementInput(rect);
            if (catalog != null) HandleCameraInput(rect);
            GUILayout.BeginArea(new Rect(panelWidth + 15, position.height - 54, rect.width - 20, 50));
            if (catalog != null) {
                var room = catalog.rooms[roomIndex]; var layout = RoomArtLayouts.For(room)[layoutIndex];
                GUILayout.Label(Mission ? assetPanel.Target.label : Comparing ? "A A B / A A B / C C D · separate legal groups · spacing is preview-only" :
                    $"{layout.Width * RoomArtTopology.CellSize:0.##} × {layout.Height * RoomArtTopology.CellSize:0.##} preview units · wall {RoomArtTopology.WallHeight} · {edges?.Count ?? 0} exterior edges");
                GUILayout.Label($"{preview.PlacedCount} props · {doors.Count} doors · drag props to move · empty space to orbit");
            }
            GUILayout.EndArea();
            if (catalog != null) assetPanel?.Draw(new Rect(position.width - assetPanelWidth, 0, assetPanelWidth, position.height), catalog.rooms[roomIndex].name);
            if (!string.IsNullOrEmpty(preview?.PlacementErrors)) GUI.Label(new Rect(rect.x + 10, rect.y + 10, rect.width - 20, 60), preview.PlacementErrors, EditorStyles.wordWrappedLabel);
        }
        private void DrawControls()
        {
            search = EditorGUILayout.TextField("Find room", search);
            var indices = Enumerable.Range(0, catalog.rooms.Length).Where(i =>
                (catalog.rooms[i].name + " " + catalog.rooms[i].id).IndexOf(search, StringComparison.OrdinalIgnoreCase) >= 0).ToArray();
            if (indices.Length > 0) {
                int current = Array.IndexOf(indices, roomIndex);
                int next = EditorGUILayout.Popup("Room type", Mathf.Max(0, current), indices.Select(i => catalog.rooms[i].name).ToArray());
                if (current < 0 || indices[next] != roomIndex) { roomIndex = indices[next]; ResetRoom(); }
            } else EditorGUILayout.HelpBox("No matching room types.", MessageType.Info);
            var room = catalog.rooms[roomIndex];
            EditorGUILayout.LabelField(room.id + " · " + room.category, EditorStyles.wordWrappedMiniLabel);
            EditorGUILayout.LabelField(string.IsNullOrEmpty(room.joinGroup) ? "Non-joinable physical room" : "Join group: " + room.joinGroup);
            var layouts = RoomArtLayouts.For(room);
            if (Mission) EditorGUILayout.HelpBox(assetPanel.Target.label + "\nAuthored mission footprint · CT1 art style", MessageType.Info);
            EditorGUI.BeginChangeCheck();
            EditorGUI.BeginDisabledGroup(Mission);
            if (RoomArtComparison.Available(room)) showAllJoins = EditorGUILayout.Toggle("Show all joins together", showAllJoins);
            using (new EditorGUI.DisabledScope(Comparing))
                layoutIndex = EditorGUILayout.Popup("Footprint / join", layoutIndex, layouts.Select(l => l.Label).ToArray());
            tierIndex = EditorGUILayout.Popup("Construction tier", tierIndex, room.tiers.Select(t => "CT" + t).ToArray());
            EditorGUI.EndDisabledGroup();
            if (EditorGUI.EndChangeCheck()) { doors.Clear(); selected = -1; visible = true; Regenerate(); }
            if (Comparing) EditorGUILayout.HelpBox("A: 2×2 · B: vertical pair\nC: horizontal pair · D: single\nEach colored area is a separate room/group.", MessageType.None);
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("Regenerate")) { visible = true; Regenerate(); }
            if (GUILayout.Button("Clear")) { visible = false; }
            if (GUILayout.Button("Reset")) { visible = true; preview.Yaw = 25; preview.Pitch = 60; preview.Zoom = 1; ResetRoom(); }
            EditorGUILayout.EndHorizontal();
            EditorGUI.BeginChangeCheck();
            preview.Grid = EditorGUILayout.Toggle("Logical cell grid", preview.Grid);
            preview.TierLights = EditorGUILayout.Toggle("Construction tier lights", preview.TierLights);
            preview.DoorOpen = EditorGUILayout.Slider("Door open amount", preview.DoorOpen, 0, 1);
            if (EditorGUI.EndChangeCheck()) Regenerate();
            EditorGUILayout.LabelField("CT1: amber single · CT2: cyan pair · CT3: purple long\nInset wall caps; door edges stay clear.", EditorStyles.wordWrappedMiniLabel);
            preview.Yaw = EditorGUILayout.Slider("Camera yaw", preview.Yaw, -180, 180);
            preview.Pitch = EditorGUILayout.Slider("Camera pitch", preview.Pitch, 15, 90);
            preview.Zoom = EditorGUILayout.Slider("Camera zoom", preview.Zoom, .35f, 3);
            if (GUILayout.Button("Frame room")) preview.Zoom = 1;
            EditorGUILayout.Space(); EditorGUILayout.LabelField("Exterior door test edges", EditorStyles.boldLabel);
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("No doors")) { doors.Clear(); Regenerate(); }
            if (GUILayout.Button("All doors")) { doors.UnionWith(edges); Regenerate(); }
            EditorGUILayout.EndHorizontal();
            var layout = layouts[layoutIndex];
            if (!Comparing && layout.Width == 1 && layout.Height == 1) {
                int mask = doors.Aggregate(0, (m, d) => m | 1 << (int)d.Side);
                int nextMask = EditorGUILayout.IntSlider("1×1 door matrix", mask, 0, 15);
                if (nextMask != mask) { doors.Clear(); foreach (var e in edges) if ((nextMask & 1 << (int)e.Side) != 0) doors.Add(e); Regenerate(); }
                if (GUILayout.Button("Rotate doors N → E → S → W")) {
                    var rotated = doors.Select(d => new RoomArtEdge(d.Cell, (RoomArtSide)(((int)d.Side + 1) % 4))).ToArray();
                    doors.Clear(); doors.UnionWith(rotated); Regenerate();
                }
            }
            foreach (var edge in edges) {
                var group = preview.Groups.FirstOrDefault(g => g.Cells.Contains(edge.Cell));
                bool value = EditorGUILayout.ToggleLeft((group == null ? "" : group.Label + " · ") + edge, doors.Contains(edge));
                if (value != doors.Contains(edge)) { if (value) doors.Add(edge); else doors.Remove(edge); Regenerate(); }
            }
            EditorGUILayout.Space(); EditorGUILayout.LabelField("Select semantic module", EditorStyles.boldLabel);
            int choice = EditorGUILayout.Popup(selected + 1, new[] { "None" }.Concat(modules.Select(m => m.ToString())).ToArray()) - 1;
            if (choice != selected) { selected = choice; Regenerate(); }
            if (selected >= 0 && selected < modules.Count) {
                var module = modules[selected];
                EditorGUILayout.LabelField($"Group: {module.Group}\nRole: {module.Role}\nSource: primitive placeholder\nCell/anchor: {module.Cell}\nEdge: {module.Side}\nSegment: {module.Segment}\nPosition: {module.PositionAt(preview.DoorOpen)}\nRotation: {module.Rotation.eulerAngles}\nSize: {module.Size}\nTier: CT{room.tiers[tierIndex]}\nPerimeter: {module.Side.HasValue}", EditorStyles.wordWrappedLabel);
            }
        }
    }
}
