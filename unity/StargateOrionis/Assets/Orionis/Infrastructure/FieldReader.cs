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
                !Unique(d.Actions.Select(a=>a.Id)) || d.Actions.Any(a=>!stages.Contains(a.StageId)||a.Ticks<1||a.Ticks>20||a.MinimumTier<0||a.ChargeCost<0||a.Effects.Any(e=>!new[]{"SET_INSTANCE_STATE","CARRY_TARGET","SET_ITEM_STATE","ADD_INSTANCE_FINDING","CREATE_DISCOVERY","ADD_TO_PARTY_STORAGE"}.Contains(e.Type))||a.SocialEffects.Any(e=>!new[]{"ADD_KNOWLEDGE","CHANGE_NPC_SUSPICION"}.Contains(e.Type)||e.Type=="ADD_KNOWLEDGE"&&string.IsNullOrWhiteSpace(e.KnowledgeId))) ||
                d.Subjects.Any(s => !stages.Contains(s.StageId) || string.IsNullOrWhiteSpace(s.Label) || s.Detection != "HIDDEN" || s.Evacuation != null || s.Combat != null && s.Combat != "NEUTRAL") ||
                d.DoorRecipes.Any(r => !doors.Contains(r.DoorId) || r.Profession != "TECHNICIAN" || r.MinimumTier < 1 || r.MinimumTier > 3 || r.MinimumPerception < 0 || r.MinimumPerception > 10 ||
                    string.IsNullOrWhiteSpace(r.Service) || r.ChargeCost < 1 || r.ChargeCost > 99 || r.Ticks != 1) ||
                d.Observations.Any(o => !d.Subjects.Any(s => s.Id == o.SubjectId && s.StageId == o.StageId) || o.Text == null || o.Detection != "LOCATED" || !new[]{"UNTRAINED","SCIENTIST","TECHNICIAN","SOLDIER"}.Contains(o.Profession) ||
                    o.MinimumPerception < 0 || o.MinimumPerception > 10 || o.RequiresKnowledge.Any(string.IsNullOrWhiteSpace) || o.RevealsFacts.Any(string.IsNullOrWhiteSpace)) ||
                d.Objectives.Any(o => !new[] { "ACTIVE", "HIDDEN" }.Contains(o.InitialState) || o.Text == null ||
                    o.DetectionSubjectId != null && !d.Subjects.Any(s => s.Id == o.DetectionSubjectId) || o.ActivateOnComplete != null && !d.Objectives.Any(x => x.Id == o.ActivateOnComplete)))
                throw new FormatException("Unsupported field definitions.");
            if(!Unique(d.Workflows.Groups.Select(g=>g.Id))||d.Workflows.Groups.Any(g=>!stages.Contains(g.StageId)||g.RecipeIds==null||g.RecipeIds.Length==0||g.Effects==null||g.RecipeIds.Any(id=>!d.Actions.Any(a=>a.Id==id&&a.WorkGroupId==g.Id&&a.StageId==g.StageId&&a.Profession=="UNTRAINED"&&a.Ticks==20&&a.Service==null&&a.ChargeCost==0))||g.Effects.Any(e=>e.Type!="ADD_KNOWLEDGE"&&e.Type!="SET_DETECTION_STATE")))throw new FormatException("Unsupported authored field work group.");
            if(!Unique(d.Workflows.Records.Select(r=>r.Id))||!Unique(d.Workflows.Discoveries.Select(r=>r.Id))||d.Actions.Any(a=>a.RequiresKnowledge.Any(string.IsNullOrWhiteSpace)||a.HiddenUntilKnowledge.Any(string.IsNullOrWhiteSpace)||a.WorkGroupId!=null&&!d.Workflows.Groups.Any(g=>g.Id==a.WorkGroupId&&g.RecipeIds.Contains(a.Id))||a.Condition!=null&&(!d.Workflows.InitialStates.TryGetValue(a.Condition.InstanceId,out var values)||!values.ContainsKey(a.Condition.Field)||a.Condition.Value==null)||a.Effects.Any(e=>e.Type=="SET_ITEM_STATE"&&(string.IsNullOrWhiteSpace(e.InstanceId)||string.IsNullOrWhiteSpace(e.Field)||e.StateValue==null)||e.Type=="CREATE_DISCOVERY"&&!d.Workflows.Discoveries.Any(r=>r.Id==e.InstanceId)||e.Type=="ADD_TO_PARTY_STORAGE"&&!d.Workflows.Records.Any(r=>r.Id==e.InstanceId))))throw new FormatException("Invalid authored field workflow references.");
            return d;
        }
    }
}
