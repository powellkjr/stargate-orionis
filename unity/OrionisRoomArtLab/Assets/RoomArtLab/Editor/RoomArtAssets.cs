using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    [Serializable] public sealed class RoomArtAsset
    {
        public string id, path, label, pack, kind, extension;
        public bool disabled, image;
    }
    [Serializable] public sealed class RoomArtAssetTarget { public string id, label; public Vector2Int[] cells; }
    [Serializable] public sealed class RoomArtAssetCatalog
    {
        public RoomArtAsset[] assets;
        public RoomArtAssetTarget[] targets;
        public static RoomArtAssetCatalog Load() => JsonUtility.FromJson<RoomArtAssetCatalog>(
            File.ReadAllText("Assets/RoomArtLab/Editor/Generated/asset-browser.json"));
    }
    public enum RoomArtAssetFilter { All, Used, Assigned }
    [Serializable] public sealed class RoomArtAssetAssignment { public string roomId, assetId; }
    [Serializable] public sealed class RoomArtAssetAssignments
    {
        public int starterVersion;
        public List<RoomArtAssetAssignment> assignments = new List<RoomArtAssetAssignment>();
    }
    // Separate art metadata, never written into shared game fixtures or campaign saves.
    public sealed class RoomArtAssetStore
    {
        public const string DefaultPath = "ProjectSettings/RoomArtAssignments.json";
        private readonly string path;
        private readonly RoomArtAssetCatalog catalog;
        private RoomArtAssetAssignments data;
        public RoomArtAssetStore(RoomArtAssetCatalog catalog, string path = DefaultPath)
        {
            this.catalog = catalog; this.path = path;
            data = File.Exists(path) ? JsonUtility.FromJson<RoomArtAssetAssignments>(File.ReadAllText(path)) : new RoomArtAssetAssignments();
            if (data?.assignments == null || data.assignments.Any(a => a == null || string.IsNullOrEmpty(a.roomId) || string.IsNullOrEmpty(a.assetId)))
                throw new InvalidDataException("Invalid room art assignments. Existing file was preserved.");
            if (path == DefaultPath && data.starterVersion < 1) {
                var starters = JsonUtility.FromJson<RoomArtAssetAssignments>(File.ReadAllText("Assets/RoomArtLab/Editor/Generated/starter-assignments.json"));
                var draft = new RoomArtAssetAssignments { starterVersion = 1, assignments = data.assignments.ToList() };
                foreach (var entry in starters.assignments)
                    if (!draft.assignments.Any(a => a.roomId == entry.roomId && a.assetId == entry.assetId)) draft.assignments.Add(entry);
                Save(draft);
            }
        }
        public bool Assigned(string room, string asset) => data.assignments.Any(a => a.roomId == room && a.assetId == asset);
        public bool Used(string asset) => data.assignments.Any(a => a.assetId == asset);
        public int RoomCount(string asset) => data.assignments.Where(a => a.assetId == asset).Select(a => a.roomId).Distinct().Count();
        public void Set(string room, string asset, bool assigned)
        {
            if (!catalog.targets.Any(t => t.id == room) || !catalog.assets.Any(a => a.id == asset))
                throw new ArgumentException("Choose a catalog room and asset.");
            if (Assigned(room, asset) == assigned) return;
            var draft = new RoomArtAssetAssignments { starterVersion = data.starterVersion, assignments = data.assignments.Where(a => a.roomId != room || a.assetId != asset).ToList() };
            if (assigned) draft.assignments.Add(new RoomArtAssetAssignment { roomId = room, assetId = asset });
            Save(draft);
        }
        private void Save(RoomArtAssetAssignments draft)
        {
            draft.assignments = draft.assignments.OrderBy(a => a.roomId).ThenBy(a => a.assetId).ToList();
            Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(path)));
            string temp = path + ".tmp";
            try {
                File.WriteAllText(temp, JsonUtility.ToJson(draft, true) + "\n");
                if (File.Exists(path)) File.Replace(temp, path, null); else File.Move(temp, path);
                data = draft;
            } finally { if (File.Exists(temp)) File.Delete(temp); }
        }
        public RoomArtAsset[] Filter(string room, RoomArtAssetFilter filter, string search = "", string kind = "All categories") =>
            catalog.assets.Where(a => (filter == RoomArtAssetFilter.All || (filter == RoomArtAssetFilter.Used ? Used(a.id) : Assigned(room, a.id))) &&
                (kind == "All categories" || a.kind == kind) &&
                (string.IsNullOrWhiteSpace(search) || (a.label + " " + a.path + " " + a.pack).IndexOf(search.Trim(), StringComparison.OrdinalIgnoreCase) >= 0)).ToArray();
    }
}
