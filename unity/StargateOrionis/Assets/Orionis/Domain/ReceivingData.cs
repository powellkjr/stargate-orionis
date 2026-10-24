using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Orionis.Domain
{
    // Bounded authored inspection data, separate from mutable work and presentation.
    public sealed class InspectionStep
    {
        public string Id { get; }
        public string Name { get; }
        public string Profession { get; }
        public int MinimumTier { get; }
        public int DurationTicks { get; }
        public string ToolService { get; }
        public string RoomService { get; }
        public string ExposureCategory { get; }
        public InspectionStep(string id, string name, string profession, int minimumTier, int durationTicks,
            string toolService, string roomService, string exposureCategory)
        { Id = id; Name = name; Profession = profession; MinimumTier = minimumTier; DurationTicks = durationTicks;
          ToolService = toolService; RoomService = roomService; ExposureCategory = exposureCategory; }
    }
    public sealed class IncomingItem
    {
        public string Id { get; }
        public string DefinitionId { get; }
        public string InitialName { get; }
        public string ReceivingName { get; }
        public string Condition { get; }
        public string FunctionalState { get; }
        public int Quantity { get; }
        public int PercentOfWhole { get; }
        public int HandlingCost { get; }
        public IReadOnlyList<string> Reality { get; }
        public IReadOnlyList<string> InitialKnown { get; }
        public IReadOnlyList<string> InitialProcessingTags { get; }
        public IReadOnlyList<string> StorageClasses { get; }
        public IReadOnlyList<string> IdentityExposure { get; }
        public IReadOnlyList<string> ConditionExposure { get; }
        public IncomingItem(string id, string definitionId, string initialName, string receivingName, string condition,
            string functionalState, int quantity, int percentOfWhole, int handlingCost, IEnumerable<string> reality,
            IEnumerable<string> known, IEnumerable<string> processing, IEnumerable<string> storage,
            IEnumerable<string> identityExposure, IEnumerable<string> conditionExposure)
        {
            Id = id; DefinitionId = definitionId; InitialName = initialName; ReceivingName = receivingName;
            Condition = condition; FunctionalState = functionalState; Quantity = quantity;
            PercentOfWhole = percentOfWhole; HandlingCost = handlingCost;
            Reality = reality.ToList().AsReadOnly(); InitialKnown = known.ToList().AsReadOnly();
            InitialProcessingTags = processing.ToList().AsReadOnly(); StorageClasses = storage.ToList().AsReadOnly();
            IdentityExposure = identityExposure.ToList().AsReadOnly(); ConditionExposure = conditionExposure.ToList().AsReadOnly();
        }
    }
    public sealed class InspectionRoom
    {
        public string DefinitionId { get; }
        public IReadOnlyDictionary<int, int> CapacityByTier { get; }
        public IReadOnlyList<string> StorageClasses { get; }
        public IReadOnlyList<string> Capabilities { get; }
        public IReadOnlyList<string> Services { get; }
        public InspectionRoom(string definitionId, IDictionary<int, int> capacity, IEnumerable<string> storage,
            IEnumerable<string> capabilities, IEnumerable<string> services)
        { DefinitionId = definitionId; CapacityByTier = new ReadOnlyDictionary<int, int>(new Dictionary<int, int>(capacity));
          StorageClasses = storage.ToList().AsReadOnly(); Capabilities = capabilities.ToList().AsReadOnly(); Services = services.ToList().AsReadOnly(); }
    }
    public sealed class InspectionWorker
    {
        public string UnitId { get; }
        public IReadOnlyDictionary<string, int> Qualifications { get; }
        public IReadOnlyList<string> ToolServices { get; }
        public InspectionWorker(string id, IDictionary<string, int> qualifications, IEnumerable<string> tools)
        { UnitId = id; Qualifications = new ReadOnlyDictionary<string, int>(new Dictionary<string, int>(qualifications));
          ToolServices = tools.ToList().AsReadOnly(); }
    }
    public sealed class ProcessingTransition
    {
        public IReadOnlyList<string> Required { get; }
        public IReadOnlyList<string> Added { get; }
        public IReadOnlyList<string> Removed { get; }
        public ProcessingTransition(IEnumerable<string> required, IEnumerable<string> added, IEnumerable<string> removed)
        { Required = required.ToList().AsReadOnly(); Added = added.ToList().AsReadOnly(); Removed = removed.ToList().AsReadOnly(); }
        public IReadOnlyList<string> Apply(IEnumerable<string> tags)
        {
            var result = tags.ToList();
            if (!Required.All(result.Contains)) throw new InvalidOperationException("Processing transition prerequisites are missing.");
            result.RemoveAll(t => Removed.Contains(t));
            foreach (var tag in Added) if (!result.Contains(tag)) result.Add(tag);
            return result.AsReadOnly();
        }
    }
    public sealed class ReceivingCatalog
    {
        public string RecipeId { get; }
        public string RequiredCapability { get; }
        public string StorageClass { get; }
        public IReadOnlyList<InspectionStep> Steps { get; }
        public IReadOnlyList<IncomingItem> Incoming { get; }
        public IReadOnlyList<InspectionRoom> Rooms { get; }
        public IReadOnlyList<InspectionWorker> Workers { get; }
        public IReadOnlyList<string> RequiredTags { get; }
        public ProcessingTransition Authorize { get; }
        public ProcessingTransition Complete { get; }
        public ReceivingCatalog(string recipeId, string capability, string storageClass, IEnumerable<InspectionStep> steps,
            IEnumerable<IncomingItem> incoming, IEnumerable<InspectionRoom> rooms, IEnumerable<InspectionWorker> workers,
            IEnumerable<string> requiredTags, ProcessingTransition authorize, ProcessingTransition complete)
        {
            RecipeId = recipeId; RequiredCapability = capability; StorageClass = storageClass;
            Steps = steps.ToList().AsReadOnly(); Incoming = incoming.ToList().AsReadOnly();
            Rooms = rooms.ToList().AsReadOnly(); Workers = workers.ToList().AsReadOnly();
            RequiredTags = requiredTags.ToList().AsReadOnly(); Authorize = authorize; Complete = complete;
        }
    }
}
