using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    // Authored presentation geometry; movement still resolves at Stage level.
    public sealed class MapCell
    {
        public int X { get; }
        public int Y { get; }
        public MapCell(int x, int y) { X = x; Y = y; }
    }
    public sealed class StageFootprint
    {
        public string Id { get; }
        public IReadOnlyList<MapCell> Cells { get; }
        public StageFootprint(string id, IEnumerable<MapCell> cells) { Id = id; Cells = cells.ToList().AsReadOnly(); }
    }
    public sealed class MissionMapDefinition
    {
        public int Width { get; }
        public int Height { get; }
        public IReadOnlyList<StageFootprint> Stages { get; }
        public IReadOnlyList<MissionDoorAnchor> Doors {get;}
        public MissionMapDefinition(int width, int height, IEnumerable<StageFootprint> stages,IEnumerable<MissionDoorAnchor> doors=null)
        { Width = width; Height = height; Stages = stages.ToList().AsReadOnly();Doors=(doors??Enumerable.Empty<MissionDoorAnchor>()).ToList().AsReadOnly(); }
    }
    public sealed class MissionDoorAnchor
    {
        public string Id,From,To,FromDirection,ToDirection;public MapCell FromCell,ToCell;public bool Provisional;
    }
}
