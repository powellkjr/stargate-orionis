using System.Collections.Generic;
using System.Collections.ObjectModel;
using System;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class RoomDefinition
    {
        public string Id { get; }
        public string Name { get; }
        public string Color { get; }
        public int Width { get; }
        public int Height { get; }
        public IReadOnlyDictionary<int, int> StaffingByTier { get; }
        public int TeamSlots { get; }
        public string TeamExperienceSharing { get; }
        public RoomDefinition(string id, string name, string color, int width, int height, IDictionary<int, int> staffingByTier = null, int teamSlots = 0, string teamExperienceSharing = null)
        { Id = id; Name = name; Color = color; Width = width; Height = height;
          StaffingByTier = new ReadOnlyDictionary<int, int>(new Dictionary<int, int>(staffingByTier ?? new Dictionary<int, int>())); TeamSlots = teamSlots; TeamExperienceSharing = teamExperienceSharing; }
        public int StaffingCapacity(int constructionTier)
        {
            if (!StaffingByTier.TryGetValue(constructionTier, out var capacity)) throw new InvalidOperationException("Missing authored staffing capacity.");
            return capacity;
        }
    }

    public sealed class RoomInstance
    {
        public string Id { get; }
        public RoomDefinition Definition { get; }
        public int Col { get; }
        public int Row { get; }
        public int ConstructionTier { get; }
        public int TeamCapacity => Definition.TeamSlots > 0 ? StaffingCapacity : 0;
        public int StaffingCapacity => Definition.StaffingCapacity(ConstructionTier);
        public RoomInstance(string id, RoomDefinition definition, int col, int row, int constructionTier)
        { Id = id; Definition = definition; Col = col; Row = row; ConstructionTier = constructionTier; }
    }

    public sealed class UnitSummary
    {
        public string Id { get; }
        public string Name { get; }
        public string Profession { get; }
        public int Tier { get; }
        public string Branch { get; }
        public string Color { get; }
        public int Perception { get; }
        public int Stamina { get; }
        public int Endurance { get; }
        public UnitSummary(string id, string name, string profession, int tier, string branch,
            string color, int perception, int stamina, int endurance)
        { Id = id; Name = name; Profession = profession; Tier = tier; Branch = branch;
          Color = color; Perception = perception; Stamina = stamina; Endurance = endurance; }
    }

    public sealed class BootstrapData
    {
        public ConstructionSetup Construction { get; }
        public ResourceCargoEconomy CargoEconomy { get; }
        public ResourceProcessingCatalog ResourceProcessing { get; }
        public RoomCoreCatalog Cores {get;}
        public BaseExecutionCatalog Execution {get;}
        public RoomPlanningCatalog Planning { get; }
        public string BaseName { get; }
        public PersonnelRecoveryRules PersonnelRecovery { get; }
        public IReadOnlyList<RoomInstance> Rooms { get; }
        public IReadOnlyList<UnitSummary> Units { get; }
        public ReceivingCatalog Receiving { get; }
        public MissionDefinition Mission { get; }
        public MissionMapDefinition MissionMap { get; }
        public CombatDefinition Combat { get; }
        public CareDefinition Care { get; }
        public RescueDefinition Rescue { get; }
        public RoomStorageCatalog Storage { get; }
        public CargoDefinition Cargo { get; }
        public HandlingCatalog Handling { get; }
        public CargoProcessingCatalog Processing { get; }
        public UnitEquipmentCatalog Equipment { get; }
        public BootstrapData(string baseName, IEnumerable<RoomInstance> rooms, IEnumerable<UnitSummary> units, ReceivingCatalog receiving = null, MissionDefinition mission = null, MissionMapDefinition missionMap = null, CombatDefinition combat = null, CareDefinition care = null, RescueDefinition rescue = null, RoomStorageCatalog storage = null, CargoDefinition cargo = null, HandlingCatalog handling = null, CargoProcessingCatalog processing = null, UnitEquipmentCatalog equipment = null, RoomPlanningCatalog planning = null, ConstructionSetup construction = null, ResourceCargoEconomy cargoEconomy = null, ResourceProcessingCatalog resourceProcessing = null, PersonnelRecoveryRules personnelRecovery = null, RoomCoreCatalog cores = null, BaseExecutionCatalog execution = null)
        { BaseName = baseName; Rooms = rooms.ToList().AsReadOnly(); Units = units.ToList().AsReadOnly(); Receiving = receiving; Mission = mission; MissionMap = missionMap; Combat = combat; Care = care; Rescue = rescue; Storage = storage; Cargo = cargo; Handling = handling; Processing = processing; Equipment = equipment; Planning = planning; Construction = construction; CargoEconomy = cargoEconomy; ResourceProcessing = resourceProcessing; PersonnelRecovery = personnelRecovery; Cores=cores; Execution=execution; }
    }
}
