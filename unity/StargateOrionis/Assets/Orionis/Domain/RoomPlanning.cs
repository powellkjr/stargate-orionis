using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class ConstructionWorkComponent
    {
        public string Kind { get; }
        public int Places { get; }
        public double HoursPerPlace { get; }
        public double Hours { get; }
        public ConstructionWorkComponent(string kind, int places, double rate, double hours)
        { Kind = kind; Places = places; HoursPerPlace = rate; Hours = hours; }
    }
    public sealed class RoomConstructionEstimate
    {
        public int? FromTier { get; }
        public int ToTier { get; }
        public double? Hours { get; }
        public double? Supply { get; }
        public string SupplyClass { get; }
        public string BlockedReason { get; }
        public IReadOnlyList<ConstructionWorkComponent> Components { get; }
        public RoomConstructionEstimate(int? from, int to, double? hours, double? supply, string supplyClass, string blocked, IEnumerable<ConstructionWorkComponent> components)
        { FromTier = from; ToTier = to; Hours = hours; Supply = supply; SupplyClass = supplyClass; BlockedReason = blocked; Components = components.ToList().AsReadOnly(); }
    }
    public sealed class RoomPlanDefinition
    {
        public RoomDefinition Room { get; }
        public string Category { get; }
        public bool Constructible { get; }
        public bool Unique { get; }
        public string Purpose { get; }
        public string JoinGroup { get; }
        public IReadOnlyList<string> JoinLayouts { get; }
        public IReadOnlyDictionary<int, string> CoresByTier { get; }
        public IReadOnlyList<string> Services { get; }
        public IReadOnlyList<string> Capabilities { get; }
        public IReadOnlyDictionary<int, RoomConstructionEstimate> Construction { get; }
        public IReadOnlyDictionary<int, RoomConstructionEstimate> Upgrades { get; }
        public RoomPlanDefinition(RoomDefinition room, bool constructible, bool unique, string purpose,
            string joinGroup, IDictionary<int, string> cores, IEnumerable<string> services, IEnumerable<string> capabilities,
            IDictionary<int, RoomConstructionEstimate> construction = null, IDictionary<int, RoomConstructionEstimate> upgrades = null, string category = "Other", IEnumerable<string> joinLayouts = null)
        {
            JoinLayouts = (joinLayouts ?? Enumerable.Empty<string>()).ToList().AsReadOnly(); Room = room; Category = category; Constructible = constructible; Unique = unique; Purpose = purpose; JoinGroup = joinGroup;
            CoresByTier = new System.Collections.ObjectModel.ReadOnlyDictionary<int, string>(new Dictionary<int, string>(cores));
            Services = services.ToList().AsReadOnly(); Capabilities = capabilities.ToList().AsReadOnly();
            Construction = new System.Collections.ObjectModel.ReadOnlyDictionary<int, RoomConstructionEstimate>(new Dictionary<int, RoomConstructionEstimate>(construction ?? new Dictionary<int, RoomConstructionEstimate>()));
            Upgrades = new System.Collections.ObjectModel.ReadOnlyDictionary<int, RoomConstructionEstimate>(new Dictionary<int, RoomConstructionEstimate>(upgrades ?? new Dictionary<int, RoomConstructionEstimate>()));
        }
    }
    public sealed class RoomPlanningCatalog
    {
        public IReadOnlyList<string> CategoryOrder { get; }
        public IReadOnlyDictionary<string, string[]> ResourceClasses { get; }
        public int Columns { get; }
        public int Rows { get; }
        public IReadOnlyList<RoomPlanDefinition> Rooms { get; }
        public RoomPlanningCatalog(int columns, int rows, IEnumerable<RoomPlanDefinition> rooms, IEnumerable<string> categoryOrder = null, IDictionary<string, string[]> resourceClasses = null)
        { ResourceClasses = new System.Collections.ObjectModel.ReadOnlyDictionary<string, string[]>(new Dictionary<string, string[]>(resourceClasses ?? new Dictionary<string, string[]>())); Columns = columns; Rows = rows; Rooms = rooms.ToList().AsReadOnly(); CategoryOrder = (categoryOrder ?? Rooms.Select(r => r.Category).Distinct()).ToList().AsReadOnly(); }

        // Geometry only: a legal preview grants no resources, Services or completed construction.
        public string PlacementBlocker(BootstrapData data, string definitionId, int tier, int col, int row)
        {
            var entry = Rooms.SingleOrDefault(r => r.Room.Id == definitionId);
            if (entry == null) return "Unknown room type.";
            if (!entry.Constructible) return "This room does not support construction.";
            if (!entry.CoresByTier.ContainsKey(tier)) return "Unsupported construction tier.";
            if (entry.Unique && data.Rooms.Any(r => r.Definition.Id == definitionId)) return "The unique room already exists.";
            var d = entry.Room;
            if (col < 0 || row < 0 || col + d.Width > Columns || row + d.Height > Rows) return "Footprint extends outside the base grid.";
            var overlap = data.Rooms.FirstOrDefault(r => col < r.Col + r.Definition.Width && col + d.Width > r.Col &&
                row < r.Row + r.Definition.Height && row + d.Height > r.Row);
            return overlap == null ? null : "Footprint overlaps " + overlap.Definition.Name + " " + overlap.Id + ".";
        }
    }
}
