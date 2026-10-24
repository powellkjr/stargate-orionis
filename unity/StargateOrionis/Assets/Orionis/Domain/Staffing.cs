using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class StaffAssignment
    {
        public string UnitId { get; }
        public string RoomInstanceId { get; }
        public StaffAssignment(string unitId, string roomInstanceId) { UnitId = unitId; RoomInstanceId = roomInstanceId; }
    }
    public static class Staffing
    {
        public static void Validate(BootstrapData data, IEnumerable<StaffAssignment> assignments)
        {
            var units = new HashSet<string>(data.Units.Select(u => u.Id));
            var rooms = data.Rooms.ToDictionary(r => r.Id);
            var assigned = new HashSet<string>();
            var counts = new Dictionary<string, int>();
            foreach (var entry in assignments)
            {
                if (entry == null || entry.UnitId == null || !units.Contains(entry.UnitId) || !assigned.Add(entry.UnitId))
                    throw new InvalidOperationException("Assignment has a missing, unknown or duplicate Unit.");
                if (entry.RoomInstanceId == null || !rooms.TryGetValue(entry.RoomInstanceId, out var room))
                    throw new InvalidOperationException("Assignment refers to an unknown physical room.");
                if (room.Definition.TeamSlots > 0) throw new InvalidOperationException("Assign an SG team through the Ready Room, not ordinary room staffing.");
                counts.TryGetValue(room.Id, out var count);
                if (count >= room.StaffingCapacity) throw new InvalidOperationException(room.Definition.Name + " has no free staffing places.");
                counts[room.Id] = count + 1;
            }
        }
        public static CampaignState Assign(CampaignState state, string unitId, string roomId)
        {
            return StaffTransfers.Request(state, unitId, roomId, StaffTransferTiming.Now);
        }
        public static CampaignState Unassign(CampaignState state, string unitId)
        {
            if (!state.Base.Units.Any(u => u.Id == unitId)) throw new ArgumentException("Unknown Unit.");
            return new CampaignState(state.Base, state.Random, state.Clock, state.Assignments.Where(a => a.UnitId != unitId), state.Receiving,
                state.Transfers.Where(t => t.UnitId != unitId), state.Expedition, teams: state.Teams, cargo: state.Cargo, personnel: state.Personnel, construction: state.Construction);
        }
    }
}
