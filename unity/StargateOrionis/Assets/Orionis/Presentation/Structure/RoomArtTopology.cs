using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Orionis.Presentation.Structure
{
    public enum RoomArtSide { North, East, South, West }
    public enum RoomArtRole { Floor, Junction, Straight, StraightDoor, DoorLeaf }
    public readonly struct RoomArtEdge : IEquatable<RoomArtEdge>
    {
        public readonly Vector2Int Cell;
        public readonly RoomArtSide Side;
        public RoomArtEdge(Vector2Int cell, RoomArtSide side) { Cell = cell; Side = side; }
        public bool Equals(RoomArtEdge other) => Cell == other.Cell && Side == other.Side;
        public override bool Equals(object obj) => obj is RoomArtEdge edge && Equals(edge);
        public override int GetHashCode() => Cell.GetHashCode() * 397 ^ (int)Side;
        public override string ToString() => $"({Cell.x},{Cell.y}) {Side}";
    }
    public sealed class RoomArtModule
    {
        public RoomArtRole Role;
        public Vector2Int Cell;
        public RoomArtSide? Side;
        public int Segment = -1;
        public string Group;
        public Vector3 DoorSlide;
        public Vector3 Position, Size;
        public Quaternion Rotation = Quaternion.identity;
        public Vector3 PositionAt(float open) => Position + DoorSlide * Mathf.Clamp01(open);
        public override string ToString() => $"{Group} {Role} ({Cell.x},{Cell.y}) {Side} {(Segment < 0 ? "" : Segment.ToString())}";
    }
    public static class RoomArtTopology
    {
        public const float CellSize = 4, WallHeight = 2, WallDepth = .2f, JunctionSize = .24f;
        public static Vector2Int Neighbor(RoomArtSide side) => side == RoomArtSide.North ? Vector2Int.up :
            side == RoomArtSide.East ? Vector2Int.right : side == RoomArtSide.South ? Vector2Int.down : Vector2Int.left;
        public static IReadOnlyList<RoomArtEdge> Exterior(IEnumerable<Vector2Int> source)
        {
            var cells = new HashSet<Vector2Int>(source);
            return cells.OrderBy(c => c.y).ThenBy(c => c.x).SelectMany(c => Enum.GetValues(typeof(RoomArtSide))
                .Cast<RoomArtSide>().Where(side => !cells.Contains(c + Neighbor(side))).Select(side => new RoomArtEdge(c, side))).ToList();
        }
        public static IReadOnlyList<RoomArtModule> Build(IEnumerable<Vector2Int> source, IEnumerable<RoomArtEdge> doors)
        {
            var cells = new HashSet<Vector2Int>(source);
            if (cells.Count == 0) throw new ArgumentException("Select a nonempty footprint.");
            var edges = Exterior(cells); var selectedDoors = new HashSet<RoomArtEdge>(doors);
            if (selectedDoors.Any(d => !edges.Contains(d))) throw new ArgumentException("Door must be on an exterior cell edge; internal joins stay open.");
            var modules = new List<RoomArtModule>();
            foreach (var c in cells.OrderBy(c => c.y).ThenBy(c => c.x))
                modules.Add(new RoomArtModule { Role = RoomArtRole.Floor, Cell = c,
                    Position = new Vector3((c.x + .5f) * CellSize, -.08f, (c.y + .5f) * CellSize), Size = new Vector3(CellSize, .16f, CellSize) });
            var anchors = new HashSet<Vector2Int>();
            float segmentLength = (CellSize - JunctionSize) / 3;
            foreach (var e in edges)
            {
                var c = e.Cell;
                Vector2Int a, b;
                switch (e.Side) {
                    case RoomArtSide.North: a = c + Vector2Int.up; b = c + Vector2Int.one; break;
                    case RoomArtSide.East: a = c + Vector2Int.right; b = c + Vector2Int.one; break;
                    case RoomArtSide.South: a = c; b = c + Vector2Int.right; break;
                    default: a = c; b = c + Vector2Int.up; break;
                }
                anchors.Add(a); anchors.Add(b);
                var start = new Vector3(a.x * CellSize, 0, a.y * CellSize);
                var end = new Vector3(b.x * CellSize, 0, b.y * CellSize);
                var direction = (end - start).normalized;
                var rotation = Quaternion.LookRotation(Vector3.Cross(direction, Vector3.up), Vector3.up);
                for (int i = 0; i < 3; i++)
                {
                    bool door = i == 1 && selectedDoors.Contains(e);
                    modules.Add(new RoomArtModule { Role = door ? RoomArtRole.StraightDoor : RoomArtRole.Straight,
                        Cell = c, Side = e.Side, Segment = i, Rotation = rotation,
                        Position = start + direction * (JunctionSize / 2 + segmentLength * (i + .5f)) + Vector3.up * WallHeight / 2,
                        Size = new Vector3(segmentLength, WallHeight, WallDepth) });
                    if (door) foreach (int sign in new[] { -1, 1 }) {
                        float opening = segmentLength - .16f;
                        modules.Add(new RoomArtModule { Role = RoomArtRole.DoorLeaf, Cell = c, Side = e.Side,
                            Segment = 1, Rotation = rotation,
                            Position = (start + end) / 2 + Vector3.up * .85f + direction * (sign * opening / 4),
                            DoorSlide = direction * (sign * (opening / 2 + .02f)),
                            Size = new Vector3(opening / 2, 1.7f, .08f) });
                    }
                }
            }
            // Only perimeter endpoints become generic square connectors. Interior vertices never enter this set.
            foreach (var a in anchors.OrderBy(a => a.y).ThenBy(a => a.x))
                modules.Add(new RoomArtModule { Role = RoomArtRole.Junction, Cell = a,
                    Position = new Vector3(a.x * CellSize, WallHeight / 2, a.y * CellSize),
                    Size = new Vector3(JunctionSize, WallHeight, JunctionSize) });
            return modules.AsReadOnly();
        }
    }
}
