using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Orionis.RoomArtLab
{
    // Presentation projection of demos/room-sandbox/room-kit-lighting.mjs.
    // Its 128-unit tile corresponds to the lab's four-unit cell. These are art
    // measurements, not construction capability or Technology Tier rules.
    public static class RoomArtTierLights
    {
        public static float Scale => RoomArtTopology.CellSize / 128;
        public static Color Color(int tier) => tier == 1 ? new Color32(255, 181, 46, 255) :
            tier == 2 ? new Color32(32, 207, 255, 255) :
            tier == 3 ? new Color32(193, 100, 255, 255) : throw new ArgumentOutOfRangeException(nameof(tier));
        public static Color CoreColor(int tier) => tier == 1 ? new Color32(255, 244, 206, 255) :
            tier == 2 ? new Color32(228, 252, 255, 255) :
            tier == 3 ? new Color32(248, 229, 255, 255) : throw new ArgumentOutOfRangeException(nameof(tier));

        // x = center offset along wall, y = colored run width, in preview units.
        public static Vector2[] Runs(int tier)
        {
            switch (tier) {
                case 1: return new[] { new Vector2(0, 8 * Scale) };
                case 2: return new[] { new Vector2(-5 * Scale, 6 * Scale), new Vector2(5 * Scale, 6 * Scale) };
                case 3: return new[] { new Vector2(0, 16 * Scale) };
                default: throw new ArgumentOutOfRangeException(nameof(tier));
            }
        }
        public static bool HasFixture(RoomArtModule module, IReadOnlyList<RoomArtModule> modules) =>
            module.Role == RoomArtRole.Straight && module.Segment == 1 &&
            !modules.Any(m => m.Role == RoomArtRole.StraightDoor && m.Group == module.Group &&
                m.Cell == module.Cell && m.Side == module.Side);
    }
}
