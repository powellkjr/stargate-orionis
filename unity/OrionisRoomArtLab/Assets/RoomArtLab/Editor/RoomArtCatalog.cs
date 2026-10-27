using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Orionis.Domain;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    [Serializable] public sealed class RoomArtDefinition
    {
        public string id, name, color, category, joinGroup;
        public int width, height;
        public string[] joinLayouts;
        public int[] tiers;
    }
    [Serializable] public sealed class RoomArtCatalog
    {
        public RoomArtDefinition[] rooms;
        public const string Path = "Assets/RoomArtLab/Editor/Generated/room-catalog.json";
        public static RoomArtCatalog Load()
        {
            var result = JsonUtility.FromJson<RoomArtCatalog>(File.ReadAllText(Path));
            if (result?.rooms == null || result.rooms.Length == 0 || result.rooms.Select(r => r.id).Distinct().Count() != result.rooms.Length)
                throw new InvalidDataException("Room catalog missing or duplicated. Run node unity/tools/room-art-lab.mjs stage.");
            return result;
        }
    }
    public sealed class RoomArtLayout
    {
        public readonly string Label;
        public readonly int Width, Height;
        public readonly bool Joined;
        public RoomArtLayout(string label, int width, int height, bool joined)
        { Label = label; Width = width; Height = height; Joined = joined; }
    }
    public static class RoomArtLayouts
    {
        public static string Blocker(RoomArtDefinition room, IReadOnlyList<Vector2Int> cells, int tier)
        {
            if (cells.Count == 0 || cells.Distinct().Count() != cells.Count) return "Empty or duplicated physical rooms.";
            if (!room.tiers.Contains(tier)) return "Unsupported construction tier.";
            if (cells.Count == 1) return null; // One physical room keeps its own authored footprint.
            RoomJoinFootprint Project(Vector2Int c) => new RoomJoinFootprint {
                Id = c.ToString(), X = c.x, Y = c.y, Width = room.width, Height = room.height,
                Tier = tier, JoinGroup = room.joinGroup, Layouts = room.joinLayouts };
            var ordered = cells.OrderBy(c => c.y).ThenBy(c => c.x).Select(Project).ToList();
            if (cells.Count == 4) {
                var first = ordered.Take(2).ToList(); var second = ordered.Skip(2).ToList();
                var pairBlocker = RoomJoinGeometry.Blocker(first.Take(1).ToList(), first.Skip(1).ToList()) ??
                    RoomJoinGeometry.Blocker(second.Take(1).ToList(), second.Skip(1).ToList());
                if (pairBlocker != null) return pairBlocker;
                return RoomJoinGeometry.Blocker(first, second);
            }
            return RoomJoinGeometry.Blocker(ordered.Take(1).ToList(), ordered.Skip(1).ToList());
        }
        public static Vector2Int[] Cells(int width, int height) => Enumerable.Range(0, height)
            .SelectMany(y => Enumerable.Range(0, width).Select(x => new Vector2Int(x, y))).ToArray();
        public static IReadOnlyList<RoomArtLayout> For(RoomArtDefinition room)
        {
            var result = new List<RoomArtLayout> { new RoomArtLayout($"Single / self-large {room.width}×{room.height}", room.width, room.height, false) };
            foreach (var size in new[] { new Vector2Int(2, 1), new Vector2Int(1, 2), new Vector2Int(2, 2) })
                if (Blocker(room, Cells(size.x, size.y), room.tiers[0]) == null)
                    result.Add(new RoomArtLayout($"Joined {size.x}×{size.y} ({size.x * size.y} physical rooms)", size.x, size.y, true));
            return result.AsReadOnly();
        }
    }
}
