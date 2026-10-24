using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class TravelSave
    {
        private sealed class Record
        {
            [JsonRequired] public List<Visit> visits;
            [JsonRequired] public List<string> openDoors, knowledge, startedConversations;
            [JsonRequired] public List<Npc> npcs;
            [JsonProperty(Required = Required.AllowNull)] public string sceneId, nodeId;
            [JsonRequired] public List<Line> history;
            public JObject field;
        }
        private sealed class Visit { [JsonRequired] public string stageId; [JsonRequired] public int count; }
        private sealed class Npc { [JsonRequired] public string id, disposition; [JsonRequired] public int suspicion, hostility; }
        private sealed class Line
        {
            [JsonRequired] public string sceneId, entryId;
            [JsonProperty(Required = Required.AllowNull)] public string actorId;
        }
        public static JObject Write(TravelState t) => t == null ? null : JObject.FromObject(new Record
        {
            visits = t.Visits.Select(p => new Visit { stageId = p.Key, count = p.Value }).ToList(), openDoors = t.OpenDoors.ToList(), knowledge = t.Knowledge.ToList(),
            npcs = t.Npcs.Select(n => new Npc { id = n.Id, disposition = n.Disposition, suspicion = n.Suspicion, hostility = n.Hostility }).ToList(),
            startedConversations = t.StartedConversations.ToList(), sceneId = t.SceneId, nodeId = t.NodeId,
            history = t.History.Select(l => new Line { sceneId = l.SceneId, entryId = l.EntryId, actorId = l.ActorId }).ToList(), field = FieldSave.Write(t.Field)
        });
        public static TravelState Read(JObject token, MissionDefinition mission, string[] legacyNpcIds = null)
        {
            if (mission.Travel == null && token == null) return null;
            if (mission.Travel == null || token == null) throw new FormatException("Missing mission travel state or definition.");
            var r = token.ToObject<Record>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            if (legacyNpcIds != null)
            {
                if (token.Property("field") != null || r.npcs == null || !r.npcs.Select(n => n.id).OrderBy(x => x).SequenceEqual(legacyNpcIds.OrderBy(x => x))) throw new FormatException("Invalid legacy mission state.");
                r.npcs.AddRange(mission.Travel.Npcs.Where(n => !legacyNpcIds.Contains(n.Id)).Select(n => new Npc { id = n.Id, disposition = n.Disposition, suspicion = n.Suspicion, hostility = n.Hostility }));
            }
            else if (token.Property("field") == null) throw new FormatException("Missing field record.");
            if (r.visits == null || r.visits.Any(v => v == null) || r.openDoors == null || r.knowledge == null || r.startedConversations == null ||
                r.npcs == null || r.npcs.Any(n => n == null) || r.history == null || r.history.Any(l => l == null)) throw new FormatException("Incomplete travel state.");
            var npcs = r.npcs.Select(n =>
            {
                var d = mission.Travel.Npcs.SingleOrDefault(x => x.Id == n.id) ?? throw new FormatException("Unknown NPC.");
                return new MissionNpc(n.id, d.StageId, d.Label, n.disposition, n.suspicion, n.hostility);
            });
            return new TravelState(r.visits.ToDictionary(v => v.stageId, v => v.count), r.openDoors, r.knowledge, npcs, r.startedConversations,
                r.sceneId, r.nodeId, r.history.Select(l => new ConversationLine(l.sceneId, l.entryId, l.actorId)),
                legacyNpcIds == null ? FieldSave.Read(r.field, mission.Travel.Field) : MissionField.Initial(mission.Travel.Field));
        }
    }
}
