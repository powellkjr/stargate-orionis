using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    // Pure structural rule shared with the independent room-art tool.
    // Availability, construction and persistent group identity remain in RoomGroups.
    public sealed class RoomJoinFootprint
    {
        public string Id, JoinGroup;
        public int X, Y, Width, Height, Tier;
        public IEnumerable<string> Layouts;
    }

    public static class RoomJoinGeometry
    {
        public static string Blocker(IReadOnlyList<RoomJoinFootprint> first, IReadOnlyList<RoomJoinFootprint> second)
        {
            var rooms = first.Concat(second).ToList();
            if (first.Count != second.Count || first.Count != 1 && first.Count != 2 || rooms.Select(r => r.Id).Distinct().Count() != rooms.Count)
                return "Join two physical rooms, or two straight pairs.";
            string layout = rooms.Count == 2 ? "1x2" : "2x2";
            if (rooms.Any(r => r.Width != 1 || r.Height != 1 || r.JoinGroup == null || r.JoinGroup != rooms[0].JoinGroup ||
                r.Layouts == null || !r.Layouts.Contains(layout) || r.Tier != rooms[0].Tier))
                return "Room types, joining rules and construction tiers must match.";
            int width = rooms.Max(r => r.X + r.Width) - rooms.Min(r => r.X);
            int height = rooms.Max(r => r.Y + r.Height) - rooms.Min(r => r.Y);
            if (rooms.Count == 2 ? width * height != 2 : width != 2 || height != 2)
                return "Join adjacent rooms into 1x2 or two pairs into 2x2.";
            return null;
        }
    }
}
