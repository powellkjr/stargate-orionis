using System;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    // PreviewRenderUtility owns an isolated PreviewScene; no generated objects enter the active scene.
    public sealed class RoomArtPreview : IDisposable
    {
        private readonly PreviewRenderUtility preview = new PreviewRenderUtility();
        private readonly List<Material> materials = new List<Material>();
        private GameObject root;
        private Vector3 target;
        private float radius;
        public float Yaw = 25, Pitch = 60, Zoom = 1, DoorOpen = 1;
        public bool Grid = true, TierLights = true;
        public IReadOnlyList<RoomArtGroupPreview> Groups = Array.Empty<RoomArtGroupPreview>();
        private IReadOnlyList<RoomArtModule> modules;
        private GameObject furnitureRoot;
        private RoomArtPropLibrary props = new RoomArtPropLibrary();
        private readonly Dictionary<string, GameObject> placed = new Dictionary<string, GameObject>();
        public string SelectedPlacement;
        public string PlacementErrors { get; private set; }
        public int PlacedCount => placed.Count;
        public RoomArtPreview()
        {
            preview.camera.orthographic = true;
            preview.camera.nearClipPlane = .01f; preview.camera.farClipPlane = 500;
            preview.camera.backgroundColor = new Color(.10f, .12f, .16f);
            preview.camera.clearFlags = CameraClearFlags.SolidColor;
            preview.lights[0].intensity = 1.2f;
            preview.lights[0].transform.rotation = Quaternion.Euler(45, 25, 0);
            preview.lights[1].intensity = .6f;
            preview.ambientColor = new Color(.4f, .4f, .4f);
        }
        private Material Material(Color color, bool emissive = false)
        {
            var material = new Material(Shader.Find("Standard")) { hideFlags = HideFlags.HideAndDontSave, color = color };
            if (emissive) {
                // Pure emission preserves the reference hue under bright preview
                // lighting instead of adding diffuse light until it washes white.
                material.color = Color.black;
                material.EnableKeyword("_EMISSION");
                material.SetColor("_EmissionColor", color.linear);
            }
            materials.Add(material); return material;
        }
        private static void Cube(Transform parent, string name, Vector3 position, Vector3 size, Material material)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.hideFlags = HideFlags.HideAndDontSave;
            go.name = name; go.transform.SetParent(parent, false);
            go.transform.localPosition = position; go.transform.localScale = size;
            go.GetComponent<Renderer>().sharedMaterial = material;
            UnityEngine.Object.DestroyImmediate(go.GetComponent<Collider>());
        }
        public void Rebuild(IReadOnlyList<RoomArtModule> source, int tier, int selected = -1)
        {
            placed.Clear(); props.Dispose();
            if (root) UnityEngine.Object.DestroyImmediate(root);
            foreach (var material in materials) UnityEngine.Object.DestroyImmediate(material);
            materials.Clear(); modules = source;
            root = new GameObject("Disposable Room Art Preview") { hideFlags = HideFlags.HideAndDontSave };
            preview.AddSingleGO(root);
            var floor = Material(new Color(.25f, .30f, .35f));
            var wall = Material(new Color(.66f, .70f, .73f));
            var junction = Material(new Color(.42f, .48f, .54f));
            var door = Material(new Color(.28f, .35f, .41f));
            var metal = Material(new Color(.48f, .55f, .60f));
            var bezel = Material(new Color(.16f, .20f, .24f));
            var recess = Material(new Color(.035f, .05f, .075f));
            var lamp = Material(RoomArtTierLights.Color(tier), true);
            var core = Material(RoomArtTierLights.CoreColor(tier), true);
            var highlight = Material(new Color(.3f, 1, .55f));
            var grid = Material(new Color(.08f, .12f, .16f));
            var groupFloors = new Dictionary<string, Material> {
                { "A", Material(new Color(.28f, .40f, .49f)) }, { "B", Material(new Color(.34f, .43f, .31f)) },
                { "C", Material(new Color(.46f, .36f, .28f)) }, { "D", Material(new Color(.42f, .32f, .45f)) }
            };
            Bounds bounds = new Bounds(source[0].Position, Vector3.zero);
            for (int i = 0; i < source.Count; i++)
            {
                var module = source[i];
                var go = new GameObject(module.ToString()) { hideFlags = HideFlags.HideAndDontSave };
                go.transform.SetParent(root.transform, false);
                go.transform.localPosition = module.PositionAt(DoorOpen); go.transform.localRotation = module.Rotation;
                var mat = i == selected ? highlight : module.Role == RoomArtRole.Floor ? floor : module.Role == RoomArtRole.Junction ? junction : module.Role == RoomArtRole.DoorLeaf ? door : wall;
                if (i != selected && module.Role == RoomArtRole.Floor && module.Group != null && groupFloors.TryGetValue(module.Group, out var groupFloor)) mat = groupFloor;
                if (module.Role == RoomArtRole.StraightDoor) {
                    // A frame occupies the center segment and keeps a clear opening below its lintel.
                    Cube(go.transform, "Left jamb", new Vector3(-(module.Size.x - .08f) / 2, 0, 0), new Vector3(.08f, module.Size.y, module.Size.z), mat);
                    Cube(go.transform, "Right jamb", new Vector3((module.Size.x - .08f) / 2, 0, 0), new Vector3(.08f, module.Size.y, module.Size.z), mat);
                    Cube(go.transform, "Lintel", new Vector3(0, .85f, 0), new Vector3(module.Size.x - .16f, .3f, module.Size.z), mat);
                } else {
                    Cube(go.transform, module.Role.ToString(), Vector3.zero, module.Size, mat);
                }
                if (TierLights && RoomArtTierLights.HasFixture(module, source)) {
                    // Inset cap fixtures remain visible from the lab's overhead camera.
                    // Each lamp has its own fitted bezel; the unused channel stays metal.
                    float s = RoomArtTierLights.Scale, top = module.Size.y / 2;
                    Cube(go.transform, "CT channel metal", new Vector3(0, top + .006f, 0), new Vector3(24 * s, .012f, 6 * s), metal);
                    foreach (var run in RoomArtTierLights.Runs(tier)) {
                        Cube(go.transform, "CT lamp housing", new Vector3(run.x, top + .016f, 0), new Vector3(run.y + 2.4f * s, .012f, 5.4f * s), bezel);
                        Cube(go.transform, "CT lamp recess", new Vector3(run.x, top + .023f, 0), new Vector3(run.y + .8f * s, .006f, 4.6f * s), recess);
                        Cube(go.transform, "CT lamp color", new Vector3(run.x, top + .027f, 0), new Vector3(run.y, .006f, 3.4f * s), lamp);
                        Cube(go.transform, "CT lamp core", new Vector3(run.x, top + .031f, 0), new Vector3(run.y - s, .003f, 1.1f * s), core);
                    }
                }
                if (Grid && module.Role == RoomArtRole.Floor) {
                    float half = RoomArtTopology.CellSize / 2;
                    Cube(go.transform, "Cell X", new Vector3(0, .085f, -half), new Vector3(half * 2, .012f, .025f), grid);
                    Cube(go.transform, "Cell Z", new Vector3(-half, .085f, 0), new Vector3(.025f, .012f, half * 2), grid);
                }
                bounds.Encapsulate(module.Position + Vector3.Scale(module.Rotation * module.Size, Vector3.one) / 2);
                bounds.Encapsulate(module.Position - (module.Rotation * module.Size) / 2);
            }
            target = new Vector3(bounds.center.x, .3f, bounds.center.z);
            radius = Mathf.Max(bounds.size.x, bounds.size.z) * .75f + 1;
        }
        public void SetPlacements(IEnumerable<RoomArtPlacement> placements, RoomArtAssetCatalog catalog)
        {
            if (furnitureRoot) UnityEngine.Object.DestroyImmediate(furnitureRoot);
            props.Dispose(); placed.Clear(); PlacementErrors = null;
            furnitureRoot = new GameObject("Room furnishings") { hideFlags = HideFlags.HideAndDontSave };
            furnitureRoot.transform.SetParent(root.transform, false);
            foreach (var entry in placements) {
                try {
                    var asset = catalog.assets.Single(a => a.id == entry.assetId);
                    var go = props.Build(asset, furnitureRoot.transform); placed.Add(entry.id, go);
                    MovePlacement(entry);
                } catch (Exception e) { PlacementErrors += e.Message + "\n"; }
            }
        }
        public void MovePlacement(RoomArtPlacement entry)
        {
            if (!placed.TryGetValue(entry.id, out var go)) return;
            go.transform.localPosition = entry.position + Vector3.up * .015f;
            go.transform.localRotation = Quaternion.Euler(0, entry.yaw, 0);
            go.transform.localScale = Vector3.one * entry.scale;
        }
        private void ConfigureCamera(Rect rect)
        {
            preview.camera.orthographicSize = radius * Zoom * Mathf.Max(1, rect.height / rect.width);
            preview.camera.aspect = rect.width / rect.height;
            preview.camera.transform.rotation = Quaternion.Euler(Pitch, Yaw, 0);
            preview.camera.transform.position = target - preview.camera.transform.forward * (radius * 4);
        }
        public Ray PointerRay(Rect rect, Vector2 point)
        {
            ConfigureCamera(rect);
            return preview.camera.ViewportPointToRay(new Vector3((point.x - rect.x) / rect.width, 1 - (point.y - rect.y) / rect.height, 0));
        }
        public Vector2 ProjectPoint(Rect rect, Vector3 point)
        {
            ConfigureCamera(rect); var viewport = preview.camera.WorldToViewportPoint(point);
            return new Vector2(rect.x + viewport.x * rect.width, rect.y + (1 - viewport.y) * rect.height);
        }
        public bool TryFloor(Rect rect, Vector2 point, out Vector3 position)
        {
            var ray = PointerRay(rect, point); position = Vector3.zero;
            if (!new Plane(Vector3.up, Vector3.zero).Raycast(ray, out var distance)) return false;
            position = ray.GetPoint(distance); position.y = 0;
            return FloorAt(position) != null;
        }
        private RoomArtModule FloorAt(Vector3 point) => modules?.FirstOrDefault(m => m.Role == RoomArtRole.Floor &&
            Mathf.Abs(point.x - m.Position.x) <= m.Size.x / 2 + .001f && Mathf.Abs(point.z - m.Position.z) <= m.Size.z / 2 + .001f);
        public string Pick(Rect rect, Vector2 point)
        {
            var ray = PointerRay(rect, point); string id = null; float nearest = float.MaxValue;
            foreach (var pair in placed) {
                var bounds = RoomArtPropLibrary.Bounds(pair.Value); bounds.Expand(.025f);
                if (bounds.IntersectRay(ray, out float distance) && distance < nearest) { nearest = distance; id = pair.Key; }
            }
            return id;
        }
        public bool Fits(string id)
        {
            if (!placed.TryGetValue(id, out var go)) return false;
            var bounds = RoomArtPropLibrary.Bounds(go); var floor = FloorAt(go.transform.position);
            if (floor == null) return false;
            // Test the horizontal bounding box against this independent group.
            for (int x = 0; x <= 8; x++)
                for (int z = 0; z <= 8; z++) {
                    var hit = FloorAt(new Vector3(Mathf.Lerp(bounds.min.x, bounds.max.x, x / 8f), 0, Mathf.Lerp(bounds.min.z, bounds.max.z, z / 8f)));
                    if (hit == null || hit.Group != floor.Group) return false;
                }
            return true;
        }
        public void Draw(Rect rect)
        {
            if (!root || rect.width < 1 || rect.height < 1 || Event.current.type != EventType.Repaint) return;
            preview.BeginPreview(rect, GUIStyle.none);
            ConfigureCamera(rect);
            preview.Render(true);
            GUI.DrawTexture(rect, preview.EndPreview(), ScaleMode.StretchToFill, false);
            if (SelectedPlacement != null && placed.TryGetValue(SelectedPlacement, out var chosen)) {
                var point = preview.camera.WorldToViewportPoint(RoomArtPropLibrary.Bounds(chosen).center);
                var label = new Rect(rect.x + point.x * rect.width - 85, rect.y + (1 - point.y) * rect.height - 24, 170, 24);
                GUI.Label(label, "◆ " + chosen.name, EditorStyles.whiteBoldLabel);
            }
            foreach (var group in Groups) {
                var point = preview.camera.WorldToViewportPoint(group.Center);
                var label = new Rect(rect.x + point.x * rect.width - 62, rect.y + (1 - point.y) * rect.height - 18, 124, 36);
                GUI.Label(label, $"{group.Label} · {group.Layout.Width}×{group.Layout.Height}", new GUIStyle(EditorStyles.whiteBoldLabel) { alignment = TextAnchor.MiddleCenter, fontSize = 17 });
            }
        }
        public void Dispose()
        {
            props.Dispose(); placed.Clear();
            if (root) UnityEngine.Object.DestroyImmediate(root);
            foreach (var material in materials) UnityEngine.Object.DestroyImmediate(material);
            materials.Clear(); preview.Cleanup();
        }
    }
}
