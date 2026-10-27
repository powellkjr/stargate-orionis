using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class FieldSave
    {
        private sealed class Record
        {
            [JsonRequired] public List<Subject> subjects;
            [JsonRequired] public Dictionary<string, string> objectives;
            [JsonRequired] public List<string> observed;
            [JsonProperty(Required = Required.AllowNull)] public Work work;
            [JsonRequired] public List<Work> completed;
        }
        private sealed class Subject
        {
            [JsonRequired] public string id, detection;
            [JsonProperty(Required = Required.AllowNull)] public string evacuation;
            public string combat;
            public string stageId;
        }
        private sealed class Work
        {
            [JsonRequired] public string recipeId, stageId, actorId;
            [JsonProperty(Required = Required.AllowNull)] public string toolId;
            [JsonRequired] public long startedTick;
            public bool toolChargesRestored;
            public string groupId;public List<FieldAssignment> assignments;
        }
        private static Work WriteWork(FieldWork w) => w == null ? null : new Work { recipeId = w.RecipeId, stageId = w.StageId, actorId = w.ActorId, toolId = w.ToolId, startedTick = w.StartedTick, toolChargesRestored=w.ToolChargesRestored,groupId=w.GroupId,assignments=w.Assignments.ToList() };
        private static FieldWork ReadWork(Work w) => w == null ? null : new FieldWork(w.recipeId, w.stageId, w.actorId, w.toolId, w.startedTick,w.toolChargesRestored,w.groupId,w.assignments);
        public static JObject Write(MissionFieldState f) => f == null ? null : JObject.FromObject(new Record
        {
            subjects = f.Subjects.Select(s => new Subject { id = s.Id, detection = s.Detection, evacuation = s.Evacuation, combat = s.Combat, stageId = s.StageId }).ToList(),
            objectives = f.Objectives.ToDictionary(p => p.Key, p => p.Value), observed = f.Observed.ToList(), work = WriteWork(f.Work), completed = f.Completed.Select(WriteWork).ToList()
        });
        public static MissionFieldState Read(JObject token, MissionFieldDefinition d,string[] priorSubjects=null)
        {
            if (d == null && token == null) return null;
            if (d == null || token == null) throw new FormatException("Missing field state or definition.");
            var r = token.ToObject<Record>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            if (r.subjects == null || r.subjects.Any(s => s == null) || r.objectives == null || r.observed == null || r.completed == null || r.completed.Any(w => w == null))
                throw new FormatException("Incomplete field state.");
            if(priorSubjects!=null&&!r.subjects.Select(s=>s.id).OrderBy(id=>id).SequenceEqual(priorSubjects.OrderBy(id=>id)))throw new FormatException("Invalid pre-workflow subject records.");
            var subjects = r.subjects.Select(s =>
            {
                var original = d.Subjects.SingleOrDefault(x => x.Id == s.id) ?? throw new FormatException("Unknown subject.");
                return new FieldSubject(s.id, s.stageId ?? original.StageId, original.Label, s.detection, s.evacuation, s.combat ?? original.Combat);
            }).Concat(priorSubjects==null?Enumerable.Empty<FieldSubject>():d.Subjects.Where(s=>!priorSubjects.Contains(s.Id)));
            return new MissionFieldState(subjects, r.objectives, r.observed, ReadWork(r.work), r.completed.Select(ReadWork));
        }
    }
}
