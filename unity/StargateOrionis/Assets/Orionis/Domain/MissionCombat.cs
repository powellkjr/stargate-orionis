using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class GuardParticipant
    {
        public string Id { get; }
        public string Label { get; }
        public GuardParticipant(string id, string label) { Id = id; Label = label; }
    }
    public sealed class GuardEncounter
    {
        public string Id { get; }
        public string StageId { get; }
        public int HostileHealth { get; }
        public int HostileDamage { get; }
        public IReadOnlyList<GuardParticipant> Participants { get; }
        public GuardEncounter(string id, string stageId, int hostileHealth, int hostileDamage, IEnumerable<GuardParticipant> participants)
        { Id = id; StageId = stageId; HostileHealth = hostileHealth; HostileDamage = hostileDamage; Participants = participants.ToList().AsReadOnly(); }
    }
    public sealed class CombatDefinition
    {
        public int PartyHealth { get; }
        public int PartyDamage { get; }
        public IReadOnlyList<GuardEncounter> Encounters { get; }
        public CombatDefinition(int partyHealth, int partyDamage, IEnumerable<GuardEncounter> encounters)
        { PartyHealth = partyHealth; PartyDamage = partyDamage; Encounters = encounters.ToList().AsReadOnly(); }
    }
    public sealed class BattleRecord
    {
        public string IncidentId { get; }
        public long StartedTick { get; }
        public long? EndedTick { get; }
        public int Rounds { get; }
        public string Outcome { get; }
        public BattleRecord(string incidentId, long startedTick, long? endedTick, int rounds, string outcome)
        { IncidentId = incidentId; StartedTick = startedTick; EndedTick = endedTick; Rounds = rounds; Outcome = outcome; }
    }
    public sealed class CombatState
    {
        public IReadOnlyList<BattleRecord> Battles { get; }
        public CombatState(IEnumerable<BattleRecord> battles) { Battles = battles.ToList().AsReadOnly(); }
    }
    public sealed class CombatSnapshot
    {
        public IReadOnlyDictionary<string, int> PartyHealth { get; }
        public IReadOnlyDictionary<string, int> GuardHealth { get; }
        public BattleRecord Active { get; }
        public bool Incapacitated => PartyHealth.Count > 0 && PartyHealth.Values.All(h => h == 0);
        public CombatSnapshot(IDictionary<string, int> party, IDictionary<string, int> guards, BattleRecord active)
        { PartyHealth = new System.Collections.ObjectModel.ReadOnlyDictionary<string, int>(party); GuardHealth = new System.Collections.ObjectModel.ReadOnlyDictionary<string, int>(guards); Active = active; }
    }
    public static class MissionCombat
    {
        public static BattleRecord Active(CampaignState s) => s.Expedition?.Combat?.Battles.LastOrDefault(b => b.Outcome == "ACTIVE");
        public static CombatSnapshot Inspect(CampaignState s) => Replay(s, s.Expedition?.Combat?.Battles ?? Array.Empty<BattleRecord>(), true);
        private static CombatSnapshot Replay(CampaignState s, IEnumerable<BattleRecord> records, bool validate)
        {
            var d = s.Base.Combat; var party = s.Expedition.Party.ToDictionary(u => u.UnitId, u => u.StartingHealth ?? d?.PartyHealth ?? 100);
            var guards = d?.Encounters.SelectMany(i => i.Participants.Select(p => (p.Id, i.HostileHealth))).ToDictionary(p => p.Id, p => p.HostileHealth) ?? new Dictionary<string, int>();
            var ended = s.Expedition.StartedTick; BattleRecord active = null; var resolved = new HashSet<string>();
            foreach (var b in records)
            {
                var i = d?.Encounters.SingleOrDefault(x => x.Id == b?.IncidentId);
                if (i == null || active != null || resolved.Contains(i.Id) || b.Rounds < 0 || b.Rounds > 10000 || b.StartedTick < ended ||
                    b.StartedTick > s.Clock.ElapsedTicks || !s.Expedition.Travel.Visits.ContainsKey(i.StageId) || party.Values.All(h => h == 0)) throw new InvalidOperationException("Invalid combat history.");
                for (int round = 0; round < b.Rounds; round++)
                {
                    if (party.Values.All(h => h == 0) || i.Participants.All(p => guards[p.Id] == 0)) throw new InvalidOperationException("Combat rounds continue after the encounter ended.");
                    // Match the authored simulator: living party fires in roster order;
                    // surviving hostiles then target the first living party member.
                    foreach (var actor in s.Expedition.Party.Where(u => party[u.UnitId] > 0))
                    {
                        var target = i.Participants.FirstOrDefault(p => guards[p.Id] > 0); if (target == null) break;
                        var damage = actor.Equipment.SingleOrDefault(g => g.Slot == "weapon")?.Damage ?? d.PartyDamage;
                        guards[target.Id] = Math.Max(0, guards[target.Id] - damage);
                    }
                    foreach (var guard in i.Participants.Where(p => guards[p.Id] > 0))
                    {
                        var target = s.Expedition.Party.FirstOrDefault(u => party[u.UnitId] > 0); if (target == null) break;
                        var protection = target.Equipment.SingleOrDefault(g => g.Slot == "armor")?.Protection ?? 0;
                        party[target.UnitId] = Math.Max(0, party[target.UnitId] - Math.Max(1, i.HostileDamage - protection));
                    }
                }
                var won = i.Participants.All(p => guards[p.Id] == 0); var defeated = party.Values.All(h => h == 0);
                var validOutcome = b.Outcome == "ACTIVE" || b.Outcome == "RETREATED" ? !won && !defeated : b.Outcome == "WON" ? won : b.Outcome == "DEFEATED" && defeated;
                var validTime = b.Outcome == "ACTIVE" ? b.EndedTick == null && b.StartedTick == s.Clock.ElapsedTicks && i.StageId == s.Expedition.StageId :
                    b.EndedTick == b.StartedTick + 1 && b.EndedTick <= s.Clock.ElapsedTicks;
                if (validate && (!validOutcome || !validTime)) throw new InvalidOperationException("Combat result or one-tick timing is invalid.");
                if (b.Outcome == "ACTIVE") active = b;
                else { ended = b.EndedTick ?? ended; if (b.Outcome == "WON") resolved.Add(i.Id); }
            }
            return new CombatSnapshot(party, guards, active);
        }
        public static bool CanAct(CampaignState s, string actorId) => s.Base.Combat == null || Inspect(s).PartyHealth.TryGetValue(actorId, out var health) && health > 0;
        public static string GuardState(CampaignState s, string id, string fallback)
        {
            if (s.Base.Combat == null) return fallback;
            var view = Inspect(s); if (!view.GuardHealth.ContainsKey(id)) return fallback;
            return view.GuardHealth[id] == 0 ? "DOWN" : s.Expedition.Combat?.Battles.Any(b => s.Base.Combat.Encounters.Any(i => i.Id == b.IncidentId && i.Participants.Any(p => p.Id == id))) == true ? "ACTIVE" : fallback;
        }
        public static bool GuardsClear(CampaignState s, string stageId) => s.Base.Combat != null && s.Base.Combat.Encounters.Where(i => i.StageId == stageId).All(i => i.Participants.All(p => Inspect(s).GuardHealth[p.Id] == 0));
        public static bool HostilesPresent(CampaignState s) => s.Expedition?.Combat?.Battles.Any(b => s.Base.Combat.Encounters.Any(i => i.Id == b.IncidentId && i.StageId == s.Expedition.StageId && i.Participants.Any(p => Inspect(s).GuardHealth[p.Id] > 0))) == true;
        public static void RequireFree(CampaignState s, bool ordinaryWork = false)
        {
            if (s.Expedition?.Returned == true) throw new InvalidOperationException("This mission has returned to SGC. Reset mission to replay it.");
            if (s.Expedition != null && s.Base.Combat != null && (Active(s) != null || Inspect(s).Incapacitated || ordinaryWork && HostilesPresent(s)))
                throw new InvalidOperationException("Resolve or disengage combat first; active hostiles block ordinary work.");
        }
        public static CampaignState Engage(CampaignState s, string incidentId)
        {
            RequireFree(s); var i = s.Base.Combat?.Encounters.SingleOrDefault(x => x.Id == incidentId);
            if (i == null || s.Expedition.GateChoicePending || s.Expedition.Travel.SceneId != null || s.Expedition.Travel.Field?.Work != null ||
                i.StageId != s.Expedition.StageId || GuardsClear(s, i.StageId)) throw new InvalidOperationException("Encounter is unavailable.");
            return Publish(s, Records(s).Concat(new[] { new BattleRecord(i.Id, s.Clock.ElapsedTicks, null, 0, "ACTIVE") }), false);
        }
        public static CampaignState Round(CampaignState s)
        {
            var active = Active(s) ?? throw new InvalidOperationException("No active encounter.");
            var records = Records(s).ToList(); var next = new BattleRecord(active.IncidentId, active.StartedTick, null, checked(active.Rounds + 1), "ACTIVE"); records[records.Count - 1] = next;
            var view = Replay(s, records, false); var i = s.Base.Combat.Encounters.Single(x => x.Id == active.IncidentId);
            var outcome = view.Incapacitated ? "DEFEATED" : i.Participants.All(p => view.GuardHealth[p.Id] == 0) ? "WON" : "ACTIVE";
            if (outcome != "ACTIVE") records[records.Count - 1] = new BattleRecord(next.IncidentId, next.StartedTick, s.Clock.AdvanceOneTick().ElapsedTicks, next.Rounds, outcome);
            return Publish(s, records, outcome != "ACTIVE");
        }
        public static CampaignState Disengage(CampaignState s)
        {
            var active = Active(s) ?? throw new InvalidOperationException("No active encounter."); var records = Records(s).ToList();
            records[records.Count - 1] = new BattleRecord(active.IncidentId, active.StartedTick, s.Clock.AdvanceOneTick().ElapsedTicks, active.Rounds, "RETREATED");
            return Publish(s, records, true);
        }
        private static IEnumerable<BattleRecord> Records(CampaignState s) => s.Expedition.Combat?.Battles ?? Array.Empty<BattleRecord>();
        private static CampaignState Publish(CampaignState s, IEnumerable<BattleRecord> records, bool tick)
        {
            var list = records.ToList(); var view = Replay(s, list, false); var t = s.Expedition.Travel;
            string GuardState(string id) => view.GuardHealth[id] == 0 ? "DOWN" : list.Any(b => s.Base.Combat.Encounters.Any(i => i.Id == b.IncidentId && i.Participants.Any(p => p.Id == id))) ? "ACTIVE" : "NEUTRAL";
            var field = t.Field;
            if (field != null) field = new MissionFieldState(field.Subjects.Select(subject => view.GuardHealth.ContainsKey(subject.Id) ?
                new FieldSubject(subject.Id, subject.StageId, subject.Label, subject.Detection, subject.Evacuation, GuardState(subject.Id)) : subject),
                field.Objectives.ToDictionary(p => p.Key, p => p.Value), field.Observed, field.Work, field.Completed);
            var npcs = t.Npcs.Select(n => view.GuardHealth.ContainsKey(n.Id) && GuardState(n.Id) != "NEUTRAL" ?
                new MissionNpc(n.Id, n.StageId, n.Label, "HOSTILE", n.Suspicion, n.Hostility) : n);
            var travel = new TravelState(t.Visits.ToDictionary(p => p.Key, p => p.Value), t.OpenDoors, t.Knowledge, npcs, t.StartedConversations, t.SceneId, t.NodeId, t.History, field);
            var e = s.Expedition;
            var replacement = new ExpeditionState(e.MissionId, e.StageId, e.StartedTick, e.GateChoicePending, e.GateOpen, e.ConnectionOpenedTick, e.Party, travel, new CombatState(list), teamId: e.TeamId);
            return tick ? ReceivingWork.AdvanceTick(s, replacement) : new CampaignState(s.Base, s.Random, s.Clock, s.Assignments, s.Receiving, s.Transfers, replacement, teams: s.Teams, cargo: s.Cargo, personnel: s.Personnel, construction: s.Construction);
        }
        public static void Validate(CampaignState s)
        {
            if (s.Expedition.Combat == null) return;
            if (s.Base.Combat == null) throw new InvalidOperationException("Missing combat definitions.");
            var view = Inspect(s);
            if (view.Active != null && (s.Expedition.GateChoicePending || s.Expedition.Travel.SceneId != null || s.Expedition.Travel.Field?.Work != null)) throw new InvalidOperationException("Combat overlaps another action.");
        }
    }
}
