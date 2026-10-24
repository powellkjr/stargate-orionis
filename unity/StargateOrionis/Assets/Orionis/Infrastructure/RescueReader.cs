using System;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class RescueReader
    {
        public static RescueDefinition Read(JObject source, MissionDefinition mission, CareDefinition care, CombatDefinition combat)
        {
            if (source == null) return null;
            foreach (var p in source.Descendants().OfType<JProperty>())
                if (new[] { "minimumTier", "minimumPerception", "chargeCost", "ticks" }.Contains(p.Name) && p.Value.Type != JTokenType.Integer)
                    throw new FormatException("Rescue requirements need integer values.");
            var d = source.ToObject<RescueDefinition>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            var r = d.Requirements;
            if (mission?.Travel?.Field == null || care == null || combat == null || r == null || r.Id != "extract-operative" || r.Profession != "UNTRAINED" ||
                r.MinimumTier != 0 || r.MinimumPerception != 0 || r.Service != "" || r.ChargeCost != 0 || r.Ticks != 1 ||
                !mission.Travel.Field.Subjects.Any(x => x.Id == d.SubjectId && x.StageId == d.StageId) || d.Departure == null)
                throw new FormatException("Unsupported rescue definitions.");
            void Validate(RescueCondition c, int depth)
            {
                if (c == null || depth > 8) throw new FormatException("Invalid departure condition.");
                if (c.Kind == "ALL" || c.Kind == "ANY")
                { if (c.Conditions.Count == 0) throw new FormatException("Empty departure predicate."); foreach (var child in c.Conditions) Validate(child, depth + 1); return; }
                bool valid = c.Conditions.Count == 0 && (c.Kind == "KNOWLEDGE_PRESENT" ? c.Id == "operative-contacted" :
                    c.Kind == "INCIDENT_STATE" ? c.Value == "RESOLVED" && (c.Id == care.IncidentId || combat.Encounters.Any(i => i.Id == c.Id)) :
                    c.Kind == "STAGE_STATE" ? c.Id == "stage-outer-yard" && c.Field == "socialPassage" && c.Value == "true" :
                    c.Kind == "INSTANCE_STATE" && (care.Recipes.Any(p => p.SubjectId == c.Id) && c.Field == "condition" && c.Value == "STABILIZED" ||
                        c.Id == d.SubjectId && c.Field == "evacState" && c.Value == "READY_TO_EVACUATE" || c.Id == "radiation-source-01" && c.Field == "active" && c.Value == "false"));
                if (!valid) throw new FormatException("Departure condition requires a wider state adapter.");
            }
            Validate(d.Departure, 0); return d;
        }
    }
}
