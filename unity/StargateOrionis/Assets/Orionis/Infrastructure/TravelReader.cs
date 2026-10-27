using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class TravelReader
    {
        private sealed class Record
        {
            [JsonRequired] public List<Stage> stages;
            [JsonRequired] public List<Door> transitions;
            [JsonRequired] public List<Npc> npcs;
            [JsonRequired] public List<string> startingKnowledge;
            [JsonRequired] public List<Scene> conversations;
            public JObject field;
        }
        private sealed class Stage { [JsonRequired] public string id, name; [JsonRequired] public bool known; }
        private sealed class Door { [JsonRequired] public string id, from, to, initialState; public string requiredKnowledge; }
        private sealed class Npc { [JsonRequired] public string id, stageId, label; [JsonProperty(Required=Required.AllowNull)] public string disposition; [JsonRequired] public int suspicion, hostility; }
        private sealed class Scene
        {
            [JsonRequired] public string id, stageId, npcId, startNodeId;
            [JsonRequired] public int firstVisit;
            [JsonRequired] public List<string> dispositions;
            [JsonRequired] public List<Node> nodes;
            public List<Effect> onStartEffects;
        }
        private sealed class Node
        {
            [JsonRequired] public string id, text;
            [JsonRequired] public bool end;
            [JsonRequired] public List<Effect> effects;
            [JsonRequired] public List<Response> responses;
        }
        private sealed class Response
        {
            [JsonRequired] public string id, text, source;
            [JsonProperty(Required = Required.AllowNull)] public string profession, nextNodeId;
            [JsonRequired] public int minimumTier;
            [JsonRequired] public bool end;
            [JsonRequired] public List<Effect> effects;
        }
        private sealed class Effect { [JsonRequired] public string type; public string instanceId, knowledgeId, value; public int delta; public Condition when; }
        private sealed class Condition { [JsonRequired] public string instanceId, field, equals; }
        private static void Require(bool ok) { if (!ok) throw new FormatException("Unsupported or invalid entry-route content."); }
        private static IEnumerable<ConversationEffect> Effects(IEnumerable<Effect> effects) => effects.Select(e =>
            new ConversationEffect(e.type, e.instanceId, e.knowledgeId, e.value, e.delta, e.when?.instanceId, e.when?.field, e.when?.equals));
        public static TravelDefinition Read(JObject source, string gateStageId)
        {
            if (source == null) return null;
            foreach (var p in source.Descendants().OfType<JProperty>())
            {
                if (new[] { "minimumTier", "firstVisit", "suspicion", "hostility", "delta", "minimumPerception", "chargeCost", "ticks" }.Contains(p.Name)) Require(p.Value.Type == JTokenType.Integer);
                if (new[] { "known", "end" }.Contains(p.Name)) Require(p.Value.Type == JTokenType.Boolean);
            }
            var r = source.ToObject<Record>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            Require(r.stages != null && r.transitions != null && r.npcs != null && r.conversations != null && r.startingKnowledge != null);
            Require(r.stages.All(s => s != null && !string.IsNullOrWhiteSpace(s.id) && !string.IsNullOrWhiteSpace(s.name)) &&
                r.stages.Select(s => s.id).Distinct().Count() == r.stages.Count && r.stages.Any(s => s.id == gateStageId && s.known));
            Require(r.transitions.All(t => t != null && !string.IsNullOrWhiteSpace(t.id) && t.from != t.to && r.stages.Any(s => s.id == t.from) &&
                r.stages.Any(s => s.id == t.to) && new[] { "OPEN", "CLOSED", "LOCKED" }.Contains(t.initialState)) && r.transitions.Select(t => t.id).Distinct().Count() == r.transitions.Count);
            Require(r.npcs.All(n => n != null && !string.IsNullOrWhiteSpace(n.id) && r.stages.Any(s => s.id == n.stageId) &&
                (n.disposition==null||!string.IsNullOrWhiteSpace(n.disposition)) && n.suspicion >= 0 && n.suspicion <= 100 && n.hostility >= 0 && n.hostility < 100) &&
                r.npcs.Select(n => n.id).Distinct().Count() == r.npcs.Count);
            Require(r.startingKnowledge.All(k => !string.IsNullOrWhiteSpace(k)) && r.startingKnowledge.Distinct().Count() == r.startingKnowledge.Count);
            Require(r.conversations.All(c => c != null) && r.conversations.Select(c => c.id).Distinct().Count() == r.conversations.Count);
            var field = FieldReader.Read(r.field, r.stages.Select(s => s.id).ToArray(), r.transitions.Select(t => t.id).ToArray());
            void ValidateEffect(Effect e)
            {
                Require(e != null);
                Require(e.when == null || e.when.field == "combatState" && e.when.equals == "NEUTRAL" && field?.Subjects.Any(s => s.Id == e.when.instanceId) == true);
                Require(e.type == "ADD_KNOWLEDGE" ? !string.IsNullOrWhiteSpace(e.knowledgeId) :
                    e.type == "ACTIVATE_OBJECTIVE" ? field?.Objectives.Any(o => o.Id == e.value) == true :
                    new[] { "SET_DETECTION_STATE", "SET_EVAC_STATE" }.Contains(e.type) ? field?.Subjects.Any(s => s.Id == e.instanceId) == true &&
                        (e.type == "SET_DETECTION_STATE" ? e.value == "LOCATED" : e.value == "READY_TO_EVACUATE") :
                    r.npcs.Any(n => n.id == e.instanceId) && (e.type == "CHANGE_NPC_SUSPICION" || e.type == "SET_NPC_DISPOSITION" && !string.IsNullOrWhiteSpace(e.value)));
            }
            foreach (var scene in r.conversations)
            {
                Require(!string.IsNullOrWhiteSpace(scene.id) && scene.firstVisit >= 0 && scene.dispositions != null && (scene.firstVisit == 0 || scene.dispositions.Count > 0) &&
                    scene.nodes != null && scene.nodes.All(n => n != null) && (r.npcs.Any(n => n.id == scene.npcId && n.stageId == scene.stageId) || field?.Subjects.Any(s => s.Id == scene.npcId && s.StageId == scene.stageId) == true));
                foreach (var effect in scene.onStartEffects ?? new List<Effect>()) ValidateEffect(effect);
                Require(scene.nodes.Select(n => n.id).Distinct().Count() == scene.nodes.Count && scene.nodes.Any(n => n.id == scene.startNodeId));
                var ids = new HashSet<string>(scene.nodes.Select(n => n.id));
                foreach (var node in scene.nodes)
                {
                    Require(!string.IsNullOrWhiteSpace(node.id) && node.text != null && node.effects != null && node.responses != null && node.end == (node.responses.Count == 0));
                    foreach (var response in node.responses)
                    {
                        Require(response != null && !string.IsNullOrWhiteSpace(response.id) && ids.Add(response.id) && response.text != null && response.effects != null &&
                            (response.end ? response.nextNodeId == null : scene.nodes.Any(n => n.id == response.nextNodeId)) && response.minimumTier >= 0 && response.minimumTier <= 3 &&
                            (response.profession == null ? response.source == "NEUTRAL" : response.profession == response.source &&
                                new[] { "SOLDIER", "SCOUT", "TECHNICIAN", "SCIENTIST", "MEDIC", "DIPLOMAT" }.Contains(response.profession)));
                    }
                    foreach (var effect in node.effects.Concat(node.responses.SelectMany(x => x.effects)))
                        ValidateEffect(effect);
                }
            }
            return new TravelDefinition(r.stages.Select(s => new TravelStage(s.id, s.name, s.known)), r.transitions.Select(t => new TravelDoor(t.id, t.from, t.to, t.initialState,t.requiredKnowledge)),
                r.npcs.Select(n => new MissionNpc(n.id, n.stageId, n.label, n.disposition, n.suspicion, n.hostility)), r.startingKnowledge,
                r.conversations.Select(c => new ConversationDefinition(c.id, c.stageId, c.npcId, c.startNodeId, c.firstVisit, c.dispositions,
                    c.nodes.Select(n => new ConversationNode(n.id, n.text, n.end, n.responses.Select(x => new ConversationResponse(x.id, x.text, x.profession, x.minimumTier, x.nextNodeId, x.end, Effects(x.effects))), Effects(n.effects))), Effects(c.onStartEffects ?? new List<Effect>()))), field);
        }
    }
}
