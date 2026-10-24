using System;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class FieldReader
    {
        public static MissionFieldDefinition Read(JObject source, string[] stages, string[] doors)
        {
            if (source == null) return null;
            foreach (var array in new[] { "subjects", "doorRecipes", "observations", "objectives" })
                if (!(source[array] is JArray)) throw new FormatException("Missing field definition list.");
            var d = source.ToObject<MissionFieldDefinition>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            bool Unique(System.Collections.Generic.IEnumerable<string> ids) => ids.All(id => !string.IsNullOrWhiteSpace(id)) && ids.Distinct().Count() == ids.Count();
            if (!Unique(d.Subjects.Select(s => s.Id)) || !Unique(d.DoorRecipes.Select(r => r.Id)) || !Unique(d.Observations.Select(o => o.Id)) || !Unique(d.Objectives.Select(o => o.Id)) ||
                d.Subjects.Any(s => !stages.Contains(s.StageId) || string.IsNullOrWhiteSpace(s.Label) || s.Detection != "HIDDEN" || s.Evacuation != null || s.Combat != null && s.Combat != "NEUTRAL") ||
                d.DoorRecipes.Any(r => !doors.Contains(r.DoorId) || r.Profession != "TECHNICIAN" || r.MinimumTier < 1 || r.MinimumTier > 3 || r.MinimumPerception < 0 || r.MinimumPerception > 10 ||
                    string.IsNullOrWhiteSpace(r.Service) || r.ChargeCost < 1 || r.ChargeCost > 99 || r.Ticks != 1) ||
                d.Observations.Any(o => !d.Subjects.Any(s => s.Id == o.SubjectId && s.StageId == o.StageId) || o.Text == null || o.Detection != "LOCATED" || o.Profession != "UNTRAINED" ||
                    o.MinimumPerception < 0 || o.MinimumPerception > 10 || o.RequiresKnowledge.Any(string.IsNullOrWhiteSpace) || o.RevealsFacts.Any(string.IsNullOrWhiteSpace)) ||
                d.Objectives.Any(o => !new[] { "ACTIVE", "HIDDEN" }.Contains(o.InitialState) || o.Text == null ||
                    o.DetectionSubjectId != null && !d.Subjects.Any(s => s.Id == o.DetectionSubjectId) || o.ActivateOnComplete != null && !d.Objectives.Any(x => x.Id == o.ActivateOnComplete)))
                throw new FormatException("Unsupported field definitions.");
            return d;
        }
    }
}
