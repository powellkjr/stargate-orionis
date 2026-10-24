using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Orionis.Domain
{
    // Authored configuration only. Item admission, occupied capacity and custody
    // transfers remain separate from the presence of a storage room.
    public sealed class StorageTab
    {
        public string Id { get; }
        public string Label { get; }
        public IReadOnlyList<string> Classes { get; }
        public IReadOnlyDictionary<int, int> CapacityByTier { get; }
        public StorageTab(string id, string label, IEnumerable<string> classes, IDictionary<int, int> capacityByTier)
        { Id = id; Label = label; Classes = classes.ToList().AsReadOnly(); CapacityByTier = new ReadOnlyDictionary<int, int>(new Dictionary<int, int>(capacityByTier)); }
    }
    public sealed class RoomStorageProfile
    {
        public string DefinitionId { get; }
        public IReadOnlyList<string> Categories { get; }
        public IReadOnlyDictionary<int, int> CapacityByTier { get; }
        public IReadOnlyList<StorageTab> Tabs { get; }
        public bool SharedItemCapacity { get; }
        public RoomStorageProfile(string definitionId, IEnumerable<string> categories, IDictionary<int, int> capacityByTier, IEnumerable<StorageTab> tabs, bool sharedItemCapacity = false)
        { DefinitionId = definitionId; Categories = categories.ToList().AsReadOnly(); CapacityByTier = new ReadOnlyDictionary<int, int>(new Dictionary<int, int>(capacityByTier)); Tabs = tabs.ToList().AsReadOnly(); SharedItemCapacity = sharedItemCapacity; }
    }
    public sealed class RoomStorageCatalog
    {
        public IReadOnlyList<RoomStorageProfile> Profiles { get; }
        public RoomStorageCatalog(IEnumerable<RoomStorageProfile> profiles) { Profiles = profiles.ToList().AsReadOnly(); }
        public RoomStorageProfile Find(string definitionId) => Profiles.SingleOrDefault(p => p.DefinitionId == definitionId);
    }
}
