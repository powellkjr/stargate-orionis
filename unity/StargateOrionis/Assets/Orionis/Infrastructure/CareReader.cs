using System;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class CareReader
    {
        public static CareDefinition Read(JObject source, MissionDefinition mission, CombatDefinition combat)
        {
            if (source == null) return null;
            foreach (var p in source.Descendants().OfType<JProperty>())
                if (new[] { "minimumTier", "minimumPerception", "chargeCost", "ticks", "suspicionDelta", "suspicionThreshold" }.Contains(p.Name) && p.Value.Type != JTokenType.Integer)
                    throw new FormatException("Care definitions require integer capability/timing values.");
            var d = source.ToObject<CareDefinition>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            if (string.IsNullOrWhiteSpace(d.IncidentId) || mission?.Travel == null || !mission.Travel.Stages.Any(s => s.Id == d.StageId) || d.SuspicionThreshold != 100 ||
                combat?.Encounters.Any(i => i.Id == d.EscalationIncidentId && i.StageId == d.StageId) != true || d.Recipes.Count == 0 ||
                d.Recipes.Select(r => r.Id).Distinct().Count() != d.Recipes.Count || d.Recipes.Select(r => r.SubjectId).Distinct().Count() != d.Recipes.Count ||
                d.Recipes.Any(r => string.IsNullOrWhiteSpace(r.Id) || string.IsNullOrWhiteSpace(r.SubjectId) || string.IsNullOrWhiteSpace(r.Label) || r.StageId != d.StageId ||
                    r.InitialCondition != "DOWN" || r.Requirements == null || r.Requirements.Id != r.Id || r.Requirements.Profession != "MEDIC" ||
                    r.Requirements.MinimumTier < 1 || r.Requirements.MinimumTier > 3 || r.Requirements.MinimumPerception < 0 || r.Requirements.MinimumPerception > 10 ||
                    string.IsNullOrWhiteSpace(r.Requirements.Service) || r.Requirements.ChargeCost < 1 || r.Requirements.ChargeCost > 99 || r.Requirements.Ticks != 1 ||
                    r.SuspicionDelta < 0 || r.SuspicionDelta > 100 || !mission.Travel.Npcs.Any(n => n.Id == r.GuardId && n.StageId == r.StageId)))
                throw new FormatException("Unsupported care/medical Incident definitions.");
            return d;
        }
    }
}
