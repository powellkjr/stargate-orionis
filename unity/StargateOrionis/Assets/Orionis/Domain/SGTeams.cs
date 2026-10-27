using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class SGTeam
    {
        public string Id { get; }
        public string Designation { get; }
        public string RoomId { get; }
        public IReadOnlyList<string> Members { get; }
        public SGTeam(string id, string designation, string roomId, IEnumerable<string> members)
        { Id = id; Designation = designation; RoomId = roomId; Members = members.ToList().AsReadOnly(); }
    }
    public static class SGTeams
    {
        public static SGTeam ForUnit(CampaignState s, string unitId) => s.Teams.SingleOrDefault(t => t.Members.Contains(unitId));
        public static bool Offworld(CampaignState s, string teamId) => s.Expedition?.Returned == false && s.Expedition.TeamId == teamId;
        public static void Validate(CampaignState s)
        {
            var members = new HashSet<string>(); var rooms = new HashSet<string>(); var ids = new HashSet<string>(); var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var t in s.Teams)
            {
                var room = s.Base.Rooms.SingleOrDefault(r => r.Id == t?.RoomId);
                if (t == null || room?.Definition.TeamSlots != 4 || !rooms.Add(t.RoomId) || t.Id != "sg-team-" + t.RoomId || !ids.Add(t.Id) ||
                    string.IsNullOrWhiteSpace(t.Designation) || t.Designation != t.Designation.Trim() || t.Designation.Length > 40 || !names.Add(t.Designation) || t.Members.Count > room.TeamCapacity ||
                    t.Members.Any(id => !s.Base.Units.Any(u => u.Id == id) || !members.Add(id) || s.Assignments.Any(a => a.UnitId == id) || s.Transfers.Any(a => a.UnitId == id)))
                    throw new InvalidOperationException("Invalid SG team identity, Ready Room, designation or permanent member assignment.");
            }
        }
        public static IReadOnlyDictionary<string, double> ExperienceShares(CampaignState state, string teamId, double totalExperience)
        {
            var team = state.Teams.Single(t => t.Id == teamId);
            var room = state.Base.Rooms.Single(r => r.Id == team.RoomId);
            if (room.Definition.TeamExperienceSharing != "ALL_ASSIGNED_MEMBERS_EQUAL" || team.Members.Count == 0 || double.IsNaN(totalExperience) || double.IsInfinity(totalExperience) || totalExperience < 0)
                throw new InvalidOperationException("Invalid team experience allocation.");
            return new System.Collections.ObjectModel.ReadOnlyDictionary<string, double>(team.Members.ToDictionary(id => id, id => totalExperience / team.Members.Count));
        }
        private static void Editable(CampaignState s, SGTeam t)
        { if (Offworld(s, t.Id)) throw new InvalidOperationException("This SG team is offworld. Return or reset its mission before editing it."); }
        public static CampaignState Create(CampaignState s, string roomId, string designation)
        {
            if (s.Teams.Any(t => t.RoomId == roomId)) throw new InvalidOperationException("This Ready Room already has an SG team.");
            return Replace(s, s.Teams.Append(new SGTeam("sg-team-" + roomId, designation?.Trim(), roomId, Array.Empty<string>())));
        }
        public static CampaignState Rename(CampaignState s, string teamId, string designation)
        {
            var t = s.Teams.Single(x => x.Id == teamId); Editable(s, t);
            return Replace(s, s.Teams.Select(x => x == t ? new SGTeam(t.Id, designation?.Trim(), t.RoomId, t.Members) : x));
        }
        public static CampaignState SetMember(CampaignState s, string teamId, string unitId, bool assigned)
        {
            var t = s.Teams.Single(x => x.Id == teamId); Editable(s, t);
            if (assigned && !t.Members.Contains(unitId) && (Expeditions.IsDeployed(s, unitId) || Expeditions.IsIncapacitated(s, unitId)))
                throw new InvalidOperationException("This Unit is deployed or incapacitated.");
            var members = assigned ? t.Members.Concat(new[] { unitId }).Distinct() : t.Members.Where(id => id != unitId);
            return Replace(s, s.Teams.Select(x => x == t ? new SGTeam(t.Id, t.Designation, t.RoomId, members) : x));
        }
        private static CampaignState Replace(CampaignState s, IEnumerable<SGTeam> teams) =>
            new CampaignState(s.Base, s.Random, s.Clock, s.Assignments, s.Receiving, s.Transfers, s.Expedition, teams, s.Cargo, s.Personnel, construction: s.Construction, cores: s.Cores, workforce: s.Workforce, completedWork: s.CompletedWork);
    }
}
