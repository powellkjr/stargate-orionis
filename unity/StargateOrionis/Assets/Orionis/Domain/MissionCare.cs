using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class CareRecipe
    {
        public string Id { get; }
        public string StageId { get; }
        public string SubjectId { get; }
        public string Label { get; }
        public string InitialCondition { get; }
        public FieldRequirements Requirements { get; }
        public string GuardId { get; }
        public int SuspicionDelta { get; }
        public CareRecipe(string id, string stageId, string subjectId, string label, string initialCondition, FieldRequirements requirements, string guardId, int suspicionDelta)
        { Id = id; StageId = stageId; SubjectId = subjectId; Label = label; InitialCondition = initialCondition; Requirements = requirements; GuardId = guardId; SuspicionDelta = suspicionDelta; }
    }
    public sealed class CareDefinition
    {
        public string IncidentId { get; }
        public string StageId { get; }
        public string EscalationIncidentId { get; }
        public int SuspicionThreshold { get; }
        public IReadOnlyList<CareRecipe> Recipes { get; }
        public CareDefinition(string incidentId, string stageId, string escalationIncidentId, int suspicionThreshold, IEnumerable<CareRecipe> recipes)
        { IncidentId = incidentId; StageId = stageId; EscalationIncidentId = escalationIncidentId; SuspicionThreshold = suspicionThreshold; Recipes = recipes.ToList().AsReadOnly(); }
    }
    public static class MissionCare
    {
        public static CareRecipe Recipe(CampaignState s, string id) => s.Base.Care?.Recipes.SingleOrDefault(r => r.Id == id);
        public static bool Completed(CampaignState s, string recipeId) => s.Expedition?.Travel?.Field?.Completed.Any(w => w.RecipeId == recipeId) == true;
        public static bool Resolved(CampaignState s) => s.Base.Care != null && s.Base.Care.Recipes.All(r => Completed(s, r.Id));
        public static string Condition(CampaignState s, CareRecipe r) => Completed(s, r.Id) ? "STABILIZED" : r.InitialCondition;
        public static CampaignState Escalate(CampaignState s)
        {
            var d = s.Base.Care;
            if (d != null && d.StageId == s.Expedition.StageId && MissionCombat.Active(s) == null && !MissionCombat.GuardsClear(s, d.StageId) &&
                d.Recipes.Any(r => s.Expedition.Travel.Npcs.Any(n => n.Id == r.GuardId && n.Suspicion >= d.SuspicionThreshold)))
                return MissionCombat.Engage(s, d.EscalationIncidentId);
            return s;
        }
    }
    public static class MissionEvacuation
    {
        // Bounded projection of runtime.mjs evacuationStageClear/returnRoute.
        // Ordinary travel can pass neutral guards; secure evacuation cannot.
        public static bool StageClear(CampaignState s, string stageId) =>
            s.Base.Care != null && s.Base.Combat != null && MissionCombat.GuardsClear(s, stageId) && ResourceCargo.StageSafe(s,stageId) &&
            (s.Base.Care.StageId != stageId || MissionCare.Resolved(s));
        public static IReadOnlyList<string> SecureRoute(CampaignState s, string fromStageId = null)
        {
            if (s.Expedition == null) return null;
            var start = fromStageId ?? s.Expedition.StageId;
            if (!StageClear(s, start)) return null;
            var d = s.Base.Mission.Travel; var t = s.Expedition.Travel;
            var queue = new Queue<(string Stage, List<string> Path)>(); var seen = new HashSet<string> { start };
            queue.Enqueue((start, new List<string>()));
            while (queue.Count > 0)
            {
                var current = queue.Dequeue(); if (current.Stage == s.Base.Mission.GateStageId) return current.Path.AsReadOnly();
                foreach (var door in d.Transitions.Where(x => x.Destination(current.Stage) != null&&MissionTravel.DoorVisible(s,x)))
                {
                    var next = door.Destination(current.Stage); var stage = d.Stages.Single(x => x.Id == next);
                    // Every projected nonlocked CLOSED transition is authored routine.
                    if (door.InitialState == "LOCKED" && !t.OpenDoors.Contains(door.Id) ||
                        !stage.Known && !t.Visits.ContainsKey(next) || !StageClear(s, next) || !seen.Add(next)) continue;
                    queue.Enqueue((next, current.Path.Concat(new[] { door.Id }).ToList()));
                }
            }
            return null;
        }
        public static string Status(CampaignState s)
        {
            var d = s.Base.Mission.Travel; var visited = s.Expedition.Travel.Visits;
            var blocked = d.Stages.Where(x => (x.Known || visited.ContainsKey(x.Id)) && !StageClear(s, x.Id)).Select(x => x.Name +
                (s.Base.Care?.StageId == x.Id && !MissionCare.Resolved(s) ? ": patients need care" : ": guards remain"));
            return SecureRoute(s) != null ? "Secure route to Gate available." : "Evacuation blocked: " + string.Join("; ", blocked);
        }
    }
}
