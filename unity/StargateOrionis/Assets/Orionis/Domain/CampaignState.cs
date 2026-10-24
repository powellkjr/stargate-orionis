using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    // Technical random stream for future simulation callers; no gameplay draws yet.
    public sealed class RandomState
    {
        public const string Algorithm = "lcg32-v1";
        public uint Seed { get; }
        public uint Value { get; }
        public RandomState(uint seed, uint value) { Seed = seed; Value = value; }
        public RandomState Advance()
        { return new RandomState(Seed, unchecked(Value * 1664525u + 1013904223u)); }
    }

    // Contains only the implemented bootstrap slice. Future systems need schema migrations.
    public sealed class CampaignState
    {
        public ConstructionState Construction { get; }
        public BootstrapData Base { get; }
        public RandomState Random { get; }
        public CampaignClock Clock { get; }
        public IReadOnlyList<StaffAssignment> Assignments { get; }
        public IReadOnlyList<ReceivingOrder> Receiving { get; }
        public IReadOnlyList<StaffTransfer> Transfers { get; }
        public ExpeditionState Expedition { get; }
        public IReadOnlyList<RecoveredItem> Cargo { get; }
        public IReadOnlyList<SGTeam> Teams { get; }
        public IReadOnlyList<PersonnelRecord> Personnel { get; }
        public CampaignState(BootstrapData data, RandomState random, CampaignClock clock = null, IEnumerable<StaffAssignment> assignments = null,
            IEnumerable<ReceivingOrder> receiving = null, IEnumerable<StaffTransfer> transfers = null, ExpeditionState expedition = null, IEnumerable<SGTeam> teams = null, IEnumerable<RecoveredItem> cargo = null, IEnumerable<PersonnelRecord> personnel = null, ConstructionState construction = null)
        {
            Base = data; Construction = construction ?? (data.Construction == null ? null : new ConstructionState(data.Construction.StartingSupply.ToDictionary(p => p.Key, p => p.Value), Enumerable.Empty<RoomConstructionSite>())); Random = random; Clock = clock ?? new CampaignClock();
            Personnel = (personnel ?? Enumerable.Empty<PersonnelRecord>()).ToList().AsReadOnly();
            PersonnelCondition.Validate(this);
            var entries = (assignments ?? Enumerable.Empty<StaffAssignment>()).ToList();
            Staffing.Validate(data, entries);
            Assignments = entries.AsReadOnly();
            Receiving = (receiving ?? Enumerable.Empty<ReceivingOrder>()).ToList().AsReadOnly();
            Cargo = (cargo ?? Enumerable.Empty<RecoveredItem>()).ToList().AsReadOnly();
            ReceivingWork.Validate(this);
            Transfers = (transfers ?? Enumerable.Empty<StaffTransfer>()).ToList().AsReadOnly();
            StaffTransfers.Validate(this);
            Expedition = expedition;
            Teams = (teams ?? Enumerable.Empty<SGTeam>()).ToList().AsReadOnly();
            SGTeams.Validate(this);
            Expeditions.Validate(this);
            RecoveredCargo.Validate(this);
            RoomGroups.Validate(this);
            RoomConstruction.Validate(this);
        }
    }
}
