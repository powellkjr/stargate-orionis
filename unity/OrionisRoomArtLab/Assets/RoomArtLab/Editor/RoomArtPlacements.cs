using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    [Serializable] public sealed class RoomArtPlacement
    {
        public string id, roomId, layout, assetId;
        public Vector3 position;
        public float yaw, scale = 1;
        public RoomArtPlacement Copy() => (RoomArtPlacement)MemberwiseClone();
    }
    [Serializable] public sealed class RoomArtPlacementData { public List<RoomArtPlacement> placements = new List<RoomArtPlacement>(); }
    public sealed class RoomArtPlacementStore
    {
        public const string DefaultPath = "ProjectSettings/RoomArtPlacements.json";
        private readonly string path;
        private readonly RoomArtAssetCatalog catalog;
        private RoomArtPlacementData data;
        public RoomArtPlacementStore(RoomArtAssetCatalog catalog, string path = DefaultPath)
        {
            this.path = path; this.catalog = catalog;
            data = File.Exists(path) ? JsonUtility.FromJson<RoomArtPlacementData>(File.ReadAllText(path)) : new RoomArtPlacementData();
            if (data?.placements == null || data.placements.Any(p => p == null || string.IsNullOrEmpty(p.id)) || data.placements.Select(p => p.id).Distinct().Count() != data.placements.Count)
                throw new InvalidDataException("Invalid placement file; existing file preserved.");
        }
        public RoomArtPlacement[] For(string room, string layout) => data.placements.Where(p => p.roomId == room && p.layout == layout).Select(p => p.Copy()).ToArray();
        public RoomArtPlacement Add(string room, string layout, string asset, Vector3 position)
        {
            var entry = new RoomArtPlacement { id = Guid.NewGuid().ToString("N"), roomId = room, layout = layout, assetId = asset, position = position };
            Put(entry); return entry;
        }
        public void Put(RoomArtPlacement entry)
        {
            if (!catalog.targets.Any(t => t.id == entry.roomId) || !catalog.assets.Any(a => a.id == entry.assetId) || string.IsNullOrEmpty(entry.layout) || string.IsNullOrEmpty(entry.id) ||
                !Finite(entry.position.x) || !Finite(entry.position.y) || !Finite(entry.position.z) || !Finite(entry.yaw) || !Finite(entry.scale) || entry.scale < .05f || entry.scale > 10)
                throw new ArgumentException("Invalid art placement.");
            var old = data.placements.FirstOrDefault(p => p.id == entry.id);
            if (old != null && (old.roomId != entry.roomId || old.layout != entry.layout || old.assetId != entry.assetId)) throw new ArgumentException("Placement identity cannot move between rooms/layouts/assets.");
            Save(data.placements.Where(p => p.id != entry.id).Concat(new[] { entry.Copy() }).ToList());
        }
        public void Remove(string room, string layout, string id) => Save(data.placements.Where(p => !(p.roomId == room && p.layout == layout && p.id == id)).ToList());
        private static bool Finite(float value) => !float.IsNaN(value) && !float.IsInfinity(value);
        private void Save(List<RoomArtPlacement> placements)
        {
            var draft = new RoomArtPlacementData { placements = placements };
            Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(path)));
            string temp = path + ".tmp";
            try {
                File.WriteAllText(temp, JsonUtility.ToJson(draft, true) + "\n");
                if (File.Exists(path)) File.Replace(temp, path, null); else File.Move(temp, path);
                data = draft;
            } finally { if (File.Exists(temp)) File.Delete(temp); }
        }
    }
}
