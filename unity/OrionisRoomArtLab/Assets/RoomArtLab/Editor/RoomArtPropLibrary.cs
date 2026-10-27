using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    public sealed class RoomArtPropLibrary : IDisposable
    {
        private readonly List<UnityEngine.Object> owned = new List<UnityEngine.Object>();
        public static string ImportPath(RoomArtAsset asset)
        {
            int offset = asset.path.IndexOf("/Assets/Synty/", StringComparison.Ordinal);
            return offset < 0 ? null : "Assets/Synty/" + asset.path.Substring(offset + "/Assets/Synty/".Length);
        }
        public static bool CanPlace(RoomArtAsset asset) => !asset.disabled && (asset.image ||
            (asset.extension == ".prefab" && ImportPath(asset) != null && asset.kind != "Characters" && asset.kind != "Effects" && asset.kind != "Icons"));
        public static string SourcePath(RoomArtAsset asset) => Path.GetFullPath(Path.Combine(Application.dataPath, "../../..", asset.path));
        public GameObject Build(RoomArtAsset asset, Transform parent = null)
        {
            if (!CanPlace(asset)) throw new InvalidOperationException("This is a reference/animation source. Choose a prop prefab or sprite.");
            var root = new GameObject(asset.label) { hideFlags = HideFlags.HideAndDontSave };
            if (parent) root.transform.SetParent(parent, false);
            try {
                if (asset.image) {
                    var texture = new Texture2D(2, 2) { hideFlags = HideFlags.HideAndDontSave }; owned.Add(texture);
                    if (!texture.LoadImage(File.ReadAllBytes(SourcePath(asset)))) throw new InvalidDataException("Cannot read sprite.");
                    var material = new Material(Shader.Find("Unlit/Transparent")) { hideFlags = HideFlags.HideAndDontSave, mainTexture = texture }; owned.Add(material);
                    var quad = GameObject.CreatePrimitive(PrimitiveType.Quad); quad.hideFlags = HideFlags.HideAndDontSave;
                    quad.transform.SetParent(root.transform, false); quad.transform.localRotation = Quaternion.Euler(90, 0, 0);
                    quad.transform.localScale = new Vector3(1.5f, 1.5f * texture.height / texture.width, 1);
                    quad.GetComponent<Renderer>().sharedMaterial = material;
                    UnityEngine.Object.DestroyImmediate(quad.GetComponent<Collider>());
                } else {
                    var source = AssetDatabase.LoadAssetAtPath<GameObject>(ImportPath(asset));
                    if (!source) throw new InvalidOperationException("Asset not imported yet. Run node unity/tools/room-art-lab.mjs stage-assets and refresh this Editor.");
                    // Renderers only: no vendor scripts, physics or gameplay callbacks.
                    foreach (var filter in source.GetComponentsInChildren<MeshFilter>(true)) {
                        var renderer = filter.GetComponent<MeshRenderer>();
                        if (!renderer || !filter.sharedMesh || !renderer.enabled) continue;
                        var child = new GameObject(filter.name) { hideFlags = HideFlags.HideAndDontSave };
                        child.transform.SetParent(root.transform, false);
                        var matrix = source.transform.worldToLocalMatrix * filter.transform.localToWorldMatrix;
                        child.transform.localPosition = matrix.GetColumn(3); child.transform.localRotation = matrix.rotation; child.transform.localScale = matrix.lossyScale;
                        child.AddComponent<MeshFilter>().sharedMesh = filter.sharedMesh;
                        child.AddComponent<MeshRenderer>().sharedMaterials = renderer.sharedMaterials.Select(Material).ToArray();
                    }
                }
                var bounds = Bounds(root);
                foreach (Transform child in root.transform) child.localPosition -= new Vector3(bounds.center.x, bounds.min.y, bounds.center.z);
                return root;
            } catch { UnityEngine.Object.DestroyImmediate(root); throw; }
        }
        private Material Material(Material source)
        {
            var result = new Material(Shader.Find("Standard")) { hideFlags = HideFlags.HideAndDontSave }; owned.Add(result);
            if (source) {
                foreach (string property in new[] { "_Albedo_Map", "_BaseMap", "_MainTex" })
                    if (source.GetTexturePropertyNames().Contains(property) && source.GetTexture(property)) {
                        result.mainTexture = source.GetTexture(property);
                        result.mainTextureScale = source.GetTextureScale(property); result.mainTextureOffset = source.GetTextureOffset(property); break;
                    }
                result.color = source.HasProperty("_BaseColor") ? source.GetColor("_BaseColor") : source.HasProperty("_Color") ? source.GetColor("_Color") : Color.white;
            }
            result.SetFloat("_Glossiness", .15f); return result;
        }
        public static Bounds Bounds(GameObject root)
        {
            var renderers = root.GetComponentsInChildren<Renderer>();
            if (renderers.Length == 0) throw new InvalidDataException("This asset has no static renderable mesh.");
            var bounds = renderers[0].bounds; foreach (var renderer in renderers.Skip(1)) bounds.Encapsulate(renderer.bounds); return bounds;
        }
        public void Dispose() { foreach (var item in owned) if (item) UnityEngine.Object.DestroyImmediate(item); owned.Clear(); }
    }
}
