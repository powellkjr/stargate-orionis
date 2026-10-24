using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    // Campaign state, separate from authored loadouts and an expedition's replay history.
    public sealed class PersonnelRecord
    {
        public string UnitId { get; }
        public int Health { get; }
        public int Stamina { get; }
        public int Endurance { get; }
        public IReadOnlyList<ExpeditionTool> Tools { get; }
        public PersonnelRecord(string unitId, int health, int stamina, int endurance, IEnumerable<ExpeditionTool> tools)
        { UnitId = unitId; Health = health; Stamina = stamina; Endurance = endurance; Tools = tools.ToList().AsReadOnly(); }
    }
    public static class PersonnelCondition
    {
        public static int MaximumHealth(CampaignState s) => s.Base.Combat?.PartyHealth ?? 100;
        private static ExpeditionMember Current(CampaignState s, string id) => s.Expedition?.Party.SingleOrDefault(p => p.UnitId == id);
        private static PersonnelRecord Stored(CampaignState s, string id) => s.Personnel.SingleOrDefault(p => p.UnitId == id);
        public static int BaselineHealth(CampaignState s, string id) => Stored(s, id)?.Health ?? MaximumHealth(s);
        public static int Health(CampaignState s, string id) => Current(s, id) != null ? MissionCombat.Inspect(s).PartyHealth[id] : Stored(s, id)?.Health ?? MaximumHealth(s);
        public static int Stamina(CampaignState s, string id) => Current(s, id)?.Stamina ?? Stored(s, id)?.Stamina ?? s.Base.Units.Single(u => u.Id == id).Stamina;
        public static int Endurance(CampaignState s, string id) => Current(s, id)?.Endurance ?? Stored(s, id)?.Endurance ?? s.Base.Units.Single(u => u.Id == id).Endurance;
        public static IReadOnlyList<ExpeditionTool> Tools(CampaignState s, string id) => Current(s, id)?.Tools ?? Stored(s, id)?.Tools ?? s.Base.Mission.Personnel.Single(p => p.UnitId == id).Tools;
        public static bool HasToolService(CampaignState s, string id, string service) => service == null ||
            (s.Base.Mission == null ? s.Base.Receiving.Workers.Single(w => w.UnitId == id).ToolServices.Contains(service) : Tools(s, id).Any(t => !t.Damaged && t.Services.Contains(service)));
        public static CampaignState PrepareRedeployment(CampaignState s)
        {
            if (s.Expedition?.Returned != true) throw new InvalidOperationException("Finish and extract the current mission before preparing redeployment.");
            var records = s.Personnel.Where(p => !s.Expedition.Party.Any(m => m.UnitId == p.UnitId)).Concat(
                s.Expedition.Party.Select(m => new PersonnelRecord(m.UnitId, Health(s, m.UnitId), m.Stamina, m.Endurance, m.Tools)));
            return new CampaignState(s.Base, s.Random, s.Clock, s.Assignments, s.Receiving, s.Transfers, teams: s.Teams, cargo: s.Cargo, personnel: records, construction: s.Construction);
        }
        internal static void Validate(CampaignState s)
        {
            if (s.Personnel.Any(p => p == null) || s.Personnel.Select(p => p.UnitId).Distinct().Count() != s.Personnel.Count)
                throw new InvalidOperationException("Personnel condition records must be distinct physical Units.");
            foreach (var p in s.Personnel)
            {
                var loadout = s.Base.Mission?.Personnel.SingleOrDefault(u => u.UnitId == p.UnitId);
                if (loadout == null || !s.Base.Units.Any(u => u.Id == p.UnitId) || p.Health < 0 || p.Health > MaximumHealth(s) || p.Stamina < 0 || p.Stamina > 100 || p.Endurance < 1 || p.Endurance > 10 ||
                    p.Tools.Any(t => t == null) || p.Tools.Count != loadout.Tools.Count || p.Tools.Select(t => t.InstanceId).Distinct().Count() != p.Tools.Count)
                    throw new InvalidOperationException("Invalid saved personnel condition or Tool configuration.");
                foreach (var tool in p.Tools)
                {
                    var expected = loadout.Tools.SingleOrDefault(t => t.InstanceId == tool.InstanceId);
                    if (expected == null || tool.KitId != expected.KitId || tool.Slot != expected.Slot || tool.Charges < 0 || tool.Charges > expected.Charges || tool.Tier != expected.Tier || !tool.Services.SequenceEqual(expected.Services))
                        throw new InvalidOperationException("Personnel Tool identity, capability or charges changed without an authored transition.");
                }
            }
        }
    }
}
