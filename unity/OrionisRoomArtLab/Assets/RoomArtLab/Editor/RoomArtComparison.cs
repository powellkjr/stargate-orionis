using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    public sealed class RoomArtGroupPreview
    {
        public string Label;
        public RoomArtLayout Layout;
        public Vector2Int Origin;
        public Vector3 Offset;
        public Vector2Int[] Cells => RoomArtLayouts.Cells(Layout.Width, Layout.Height).Select(c => c + Origin).ToArray();
        public Vector3 Center => Offset + new Vector3(Layout.Width * RoomArtTopology.CellSize / 2, .05f, Layout.Height * RoomArtTopology.CellSize / 2);
    }
    public static class RoomArtComparison
    {
        // Presentation spacing separates independent groups without treating the 3x3 board as one legal room.
        public const float Gap = .4f;
        public static bool Available(RoomArtDefinition room) => RoomArtLayouts.For(room).Any(l => l.Joined);
        public static IReadOnlyList<RoomArtGroupPreview> Groups(RoomArtDefinition room, int tier)
        {
            if (!room.tiers.Contains(tier)) throw new ArgumentException("Unsupported construction tier.");
            if (!Available(room)) return Array.Empty<RoomArtGroupPreview>();
            var layouts = RoomArtLayouts.For(room);
            var result = new List<RoomArtGroupPreview>();
            void Add(string label, int width, int height, int x, int y, bool joined)
            {
                var layout = layouts.SingleOrDefault(l => l.Joined == joined && l.Width == width && l.Height == height);
                if (layout == null) return;
                var blocker = RoomArtLayouts.Blocker(room, RoomArtLayouts.Cells(width, height), tier);
                if (blocker != null) throw new InvalidOperationException(blocker);
                result.Add(new RoomArtGroupPreview { Label = label, Layout = layout, Origin = new Vector2Int(x, y),
                    Offset = new Vector3(x * RoomArtTopology.CellSize + (x > 0 ? Gap : 0), 0, y * RoomArtTopology.CellSize + (y > 0 ? Gap : 0)) });
            }
            Add("A", 2, 2, 0, 1, true);
            Add("B", 1, 2, 2, 1, true);
            Add("C", 2, 1, 0, 0, true);
            Add("D", 1, 1, 2, 0, false);
            return result.AsReadOnly();
        }
        public static IReadOnlyList<RoomArtEdge> Edges(IReadOnlyList<RoomArtGroupPreview> groups) =>
            groups.SelectMany(g => RoomArtTopology.Exterior(g.Cells)).ToList();
        public static IReadOnlyList<RoomArtModule> Build(IReadOnlyList<RoomArtGroupPreview> groups, IEnumerable<RoomArtEdge> doors)
        {
            var selected = new HashSet<RoomArtEdge>(doors);
            if (selected.Any(d => !Edges(groups).Contains(d))) throw new ArgumentException("Door must be on a group's exterior edge.");
            var modules = new List<RoomArtModule>();
            foreach (var group in groups) {
                var exterior = RoomArtTopology.Exterior(group.Cells);
                var localDoors = selected.Where(exterior.Contains).Select(d => new RoomArtEdge(d.Cell - group.Origin, d.Side));
                foreach (var module in RoomArtTopology.Build(RoomArtLayouts.Cells(group.Layout.Width, group.Layout.Height), localDoors)) {
                    module.Group = group.Label; module.Cell += group.Origin; module.Position += group.Offset;
                    modules.Add(module);
                }
            }
            return modules.AsReadOnly();
        }
    }
}
