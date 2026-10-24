using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class ExpeditionTool
    {
        public string InstanceId { get; }
        public string KitId { get; }
        public int Slot { get; }
        public int Charges { get; }
        public bool Damaged { get; }
        public string Label { get; }
        public int Tier { get; }
        public IReadOnlyList<string> Services { get; }
        public ExpeditionTool(string instanceId, string kitId, int slot, int charges, bool damaged, string label, int tier, IEnumerable<string> services)
        { InstanceId = instanceId; KitId = kitId; Slot = slot; Charges = charges; Damaged = damaged;
          Label = label; Tier = tier; Services = services.ToList().AsReadOnly(); }
    }
    public sealed class DeploymentLoadout
    {
        public string UnitId { get; }
        public string Profession { get; }
        public int Tier { get; }
        public string BranchKind { get; }
        public string BranchId { get; }
        public int BranchTier { get; }
        public IReadOnlyList<ExpeditionTool> Tools { get; }
        public DeploymentLoadout(string id, string profession, int tier, string branchKind, string branchId, int branchTier, IEnumerable<ExpeditionTool> tools)
        { UnitId = id; Profession = profession; Tier = tier; BranchKind = branchKind; BranchId = branchId; BranchTier = branchTier; Tools = tools.ToList().AsReadOnly(); }
    }
    public sealed class MissionDefinition
    {
        public string Id { get; }
        public string Title { get; }
        public string Briefing { get; }
        public string GateStageId { get; }
        public int MaxPartySize { get; }
        public int RedialTicks { get; }
        public IReadOnlyList<DeploymentLoadout> Personnel { get; }
        public TravelDefinition Travel { get; }
        public MissionDefinition(string id, string title, string briefing, string gateStageId, int maxPartySize, int redialTicks, IEnumerable<DeploymentLoadout> personnel, TravelDefinition travel = null)
        { Id = id; Title = title; Briefing = briefing; GateStageId = gateStageId; MaxPartySize = maxPartySize; RedialTicks = redialTicks; Personnel = personnel.ToList().AsReadOnly(); Travel = travel; }
    }
    public sealed class ExpeditionMember
    {
        public string UnitId { get; }
        public int Perception { get; }
        public int Stamina { get; }
        public int Endurance { get; }
        public IReadOnlyList<ExpeditionTool> Tools { get; }
        public IReadOnlyList<MissionEquipment> Equipment { get; }
        public int? StartingHealth { get; }
        public ExpeditionMember(string id, int perception, int stamina, int endurance, IEnumerable<ExpeditionTool> tools, IEnumerable<MissionEquipment> equipment = null, int? startingHealth = null)
        { UnitId = id; Perception = perception; Stamina = stamina; Endurance = endurance; Tools = tools.ToList().AsReadOnly(); Equipment = (equipment ?? Array.Empty<MissionEquipment>()).ToList().AsReadOnly(); StartingHealth = startingHealth; }
    }
    public sealed class ExpeditionState
    {
        public string MissionId { get; }
        public string StageId { get; }
        public long StartedTick { get; }
        public bool GateChoicePending { get; }
        public bool GateOpen { get; }
        public long ConnectionOpenedTick { get; }
        public IReadOnlyList<ExpeditionMember> Party { get; }
        public TravelState Travel { get; }
        public CombatState Combat { get; }
        public long? ExtractedTick { get; }
        public string TeamId { get; }
        public bool Returned => ExtractedTick.HasValue;
        public ExpeditionState(string missionId, string stageId, long startedTick, bool gateChoicePending, bool gateOpen,
            long connectionOpenedTick, IEnumerable<ExpeditionMember> party, TravelState travel = null, CombatState combat = null, long? extractedTick = null, string teamId = null)
        { MissionId = missionId; StageId = stageId; StartedTick = startedTick; GateChoicePending = gateChoicePending;
          GateOpen = gateOpen; ConnectionOpenedTick = connectionOpenedTick; Party = party.ToList().AsReadOnly(); Travel = travel; Combat = combat; ExtractedTick = extractedTick; TeamId = teamId; }
    }
    public static class Expeditions
    {
        public static bool IsDeployed(CampaignState state, string unitId) => state.Expedition?.Returned == false && state.Expedition.Party.Any(u => u.UnitId == unitId);
        public static bool IsIncapacitated(CampaignState state, string unitId) => PersonnelCondition.Health(state, unitId) == 0;
        public static void Validate(CampaignState state)
        {
            var expedition = state.Expedition;
            if (expedition == null) return;
            var definition = state.Base.Mission;
            if (definition == null || expedition.MissionId != definition.Id ||
                expedition.StartedTick < 0 || expedition.StartedTick > state.Clock.ElapsedTicks ||
                expedition.ConnectionOpenedTick < expedition.StartedTick || expedition.ConnectionOpenedTick > state.Clock.ElapsedTicks ||
                expedition.GateChoicePending && (!expedition.GateOpen || expedition.ConnectionOpenedTick != expedition.StartedTick || state.Clock.ElapsedTicks != expedition.StartedTick) ||
                expedition.GateOpen && state.Clock.ElapsedTicks - expedition.ConnectionOpenedTick >= CampaignTiming.GateConnectionTicks)
                throw new InvalidOperationException("Invalid mission, location or Gate state.");
            if (expedition.Returned && (expedition.ExtractedTick < expedition.StartedTick || expedition.ExtractedTick > state.Clock.ElapsedTicks || expedition.GateOpen || expedition.GateChoicePending || expedition.StageId != definition.GateStageId || expedition.Travel.SceneId != null || expedition.Travel.Field.Work != null || MissionCombat.Active(state) != null))
                throw new InvalidOperationException("Invalid completed mission.");
            if (expedition.TeamId != null)
            {
                var team = state.Teams.SingleOrDefault(t => t.Id == expedition.TeamId);
                if (team == null || !expedition.Returned && expedition.Party.Any(u => !team.Members.Contains(u.UnitId)))
                    throw new InvalidOperationException("Mission party does not match its permanent SG team.");
            }
            else if (!expedition.Returned && expedition.Party.Any(u => SGTeams.ForUnit(state, u.UnitId) != null)) throw new InvalidOperationException("Deploy permanent team members through their SG team.");
            MissionTravel.Validate(state);
            MissionCombat.Validate(state);
            if (expedition.Returned && (expedition.ConnectionOpenedTick > expedition.ExtractedTick ||
                expedition.Travel.Visits.Sum(p => (long)p.Value) - 1 > expedition.ExtractedTick - expedition.StartedTick ||
                expedition.Travel.Field.Completed.Any(w => w.StartedTick + MissionField.Requirements(state, w.RecipeId).Ticks > expedition.ExtractedTick) ||
                expedition.Combat?.Battles.Any(b => b.EndedTick > expedition.ExtractedTick) == true))
                throw new InvalidOperationException("Mission work, travel or combat occurs after its recorded return.");
            if (expedition.Party.Count < 1 || expedition.Party.Count > definition.MaxPartySize ||
                expedition.Party.Any(p => p == null) || expedition.Party.Select(p => p.UnitId).Distinct().Count() != expedition.Party.Count)
                throw new InvalidOperationException("Select one to " + definition.MaxPartySize + " distinct Units.");
            var tools = new HashSet<string>();
            foreach (var member in expedition.Party)
            {
                var unit = state.Base.Units.SingleOrDefault(u => u.Id == member.UnitId);
                var loadout = definition.Personnel.SingleOrDefault(u => u.UnitId == member.UnitId);
                if (unit == null || loadout == null || !expedition.Returned && (state.Assignments.Any(a => a.UnitId == member.UnitId) || state.Transfers.Any(t => t.UnitId == member.UnitId)))
                    throw new InvalidOperationException("Deployed Units must be known and released from base staffing first.");
                if (unit.Profession != loadout.Profession || unit.Tier != loadout.Tier ||
                    member.Perception < 0 || member.Perception > 10 || member.Stamina < 0 || member.Stamina > 100 || member.Endurance < 1 || member.Endurance > 10 ||
                    (member.StartingHealth ?? PersonnelCondition.MaximumHealth(state)) < 1 || member.StartingHealth > PersonnelCondition.MaximumHealth(state))
                    throw new InvalidOperationException("Invalid deployed progression or stats.");
                UnitEquipment.ValidateMember(state, member);
                if (!expedition.Returned && (member.StartingHealth ?? PersonnelCondition.MaximumHealth(state)) != PersonnelCondition.BaselineHealth(state, member.UnitId))
                    throw new InvalidOperationException("Active deployment must retain its saved starting health.");
                if (member.Tools.Count != loadout.Tools.Count) throw new InvalidOperationException("Deployed Tool configuration changed.");
                foreach (var tool in member.Tools)
                {
                    var expected = loadout.Tools.SingleOrDefault(t => t.InstanceId == tool?.InstanceId);
                    if (expected == null || !tools.Add(tool.InstanceId) || tool.KitId != expected.KitId || tool.Slot != expected.Slot ||
                        tool.Charges < 0 || tool.Charges > expected.Charges || tool.Tier != expected.Tier || !tool.Services.SequenceEqual(expected.Services))
                        throw new InvalidOperationException("Invalid deployed Tool identity, kit, slot or charges.");
                }
            }
        }
        public static CampaignState Deploy(CampaignState state, IEnumerable<string> unitIds, string teamId = null)
        {
            if (state.Expedition != null) throw new InvalidOperationException("A team is already offworld.");
            var definition = state.Base.Mission ?? throw new InvalidOperationException("No mission is available.");
            var ids = unitIds?.ToList() ?? throw new ArgumentException("Select a team.");
            if (ids.Any(id => id == null) || ids.Distinct().Count() != ids.Count || ids.Count < 1 || ids.Count > definition.MaxPartySize)
                throw new InvalidOperationException("Select one to " + definition.MaxPartySize + " distinct Units.");
            var team = teamId == null ? null : state.Teams.SingleOrDefault(t => t.Id == teamId);
            if (teamId != null && (team == null || ids.Any(id => !team.Members.Contains(id))) || ids.Any(id => SGTeams.ForUnit(state, id) is SGTeam owner && owner.Id != teamId))
                throw new InvalidOperationException("Choose up to four members of the saved SG team.");
            var party = ids.Select(id =>
            {
                var unit = state.Base.Units.SingleOrDefault(u => u.Id == id) ?? throw new ArgumentException("Unknown Unit.");
                var loadout = definition.Personnel.Single(u => u.UnitId == id);
                if (IsIncapacitated(state, id)) throw new InvalidOperationException("An incapacitated Unit cannot deploy.");
                return new ExpeditionMember(id, unit.Perception, PersonnelCondition.Stamina(state, id), PersonnelCondition.Endurance(state, id), PersonnelCondition.Tools(state, id), UnitEquipment.Loadout(state, id), PersonnelCondition.Health(state, id));
            });
            return Copy(state, new ExpeditionState(definition.Id, definition.GateStageId, state.Clock.ElapsedTicks, true, true, state.Clock.ElapsedTicks, party, MissionTravel.Initial(definition), teamId: teamId));
        }
        public static CampaignState ChooseGate(CampaignState state, bool keepOpen)
        {
            var expedition = state.Expedition ?? throw new InvalidOperationException("No team is offworld.");
            if (!expedition.GateChoicePending) throw new InvalidOperationException("The arrival Gate choice has already been made.");
            return Copy(state, new ExpeditionState(expedition.MissionId, expedition.StageId, expedition.StartedTick, false, keepOpen,
                expedition.ConnectionOpenedTick, expedition.Party, expedition.Travel, expedition.Combat, expedition.ExtractedTick, teamId: expedition.TeamId));
        }
        public static CampaignState Redial(CampaignState state)
        {
            MissionCombat.RequireFree(state);
            var expedition = state.Expedition ?? throw new InvalidOperationException("No team is offworld.");
            if (expedition.GateChoicePending || expedition.GateOpen || expedition.StageId != state.Base.Mission.GateStageId)
                throw new InvalidOperationException("Redial requires the team at a closed Gate after the arrival choice.");
            var candidate = state;
            for (int i = 0; i < state.Base.Mission.RedialTicks; i++) candidate = ReceivingWork.AdvanceTick(candidate);
            return Copy(candidate, new ExpeditionState(expedition.MissionId, expedition.StageId, expedition.StartedTick, false, true,
                candidate.Clock.ElapsedTicks, expedition.Party, expedition.Travel, expedition.Combat, expedition.ExtractedTick, teamId: expedition.TeamId));
        }
        internal static ExpeditionState AtTick(ExpeditionState expedition, CampaignClock clock)
        {
            if (expedition == null || !expedition.GateOpen || clock.ElapsedTicks - expedition.ConnectionOpenedTick < CampaignTiming.GateConnectionTicks) return expedition;
            return new ExpeditionState(expedition.MissionId, expedition.StageId, expedition.StartedTick, expedition.GateChoicePending,
                false, expedition.ConnectionOpenedTick, expedition.Party, expedition.Travel, expedition.Combat, expedition.ExtractedTick, teamId: expedition.TeamId);
        }
        private static CampaignState Copy(CampaignState state, ExpeditionState expedition) =>
            new CampaignState(state.Base, state.Random, state.Clock, state.Assignments, state.Receiving, state.Transfers, expedition, teams: state.Teams, cargo: state.Cargo, personnel: state.Personnel, construction: state.Construction);
    }
}
