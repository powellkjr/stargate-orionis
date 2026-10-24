using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class TravelStage
    {
        public string Id { get; }
        public string Name { get; }
        public bool Known { get; }
        public TravelStage(string id, string name, bool known) { Id = id; Name = name; Known = known; }
    }
    public sealed class TravelDoor
    {
        public string Id { get; }
        public string From { get; }
        public string To { get; }
        public string InitialState { get; }
        public TravelDoor(string id, string from, string to, string initialState)
        { Id = id; From = from; To = to; InitialState = initialState; }
        public string Destination(string stage) => From == stage ? To : To == stage ? From : null;
    }
    public sealed class MissionNpc
    {
        public string Id { get; }
        public string StageId { get; }
        public string Label { get; }
        public string Disposition { get; }
        public int Suspicion { get; }
        public int Hostility { get; }
        public MissionNpc(string id, string stageId, string label, string disposition, int suspicion, int hostility)
        { Id = id; StageId = stageId; Label = label; Disposition = disposition; Suspicion = suspicion; Hostility = hostility; }
    }
    public sealed class ConversationEffect
    {
        public string Type { get; }
        public string InstanceId { get; }
        public string KnowledgeId { get; }
        public string Value { get; }
        public int Delta { get; }
        public string ConditionInstanceId { get; }
        public string ConditionField { get; }
        public string ConditionEquals { get; }
        public ConversationEffect(string type, string instanceId, string knowledgeId, string value, int delta, string conditionInstanceId = null, string conditionField = null, string conditionEquals = null)
        { Type = type; InstanceId = instanceId; KnowledgeId = knowledgeId; Value = value; Delta = delta;
          ConditionInstanceId = conditionInstanceId; ConditionField = conditionField; ConditionEquals = conditionEquals; }
    }
    public sealed class ConversationResponse
    {
        public string Id { get; }
        public string Text { get; }
        public string Profession { get; }
        public int MinimumTier { get; }
        public string NextNodeId { get; }
        public bool End { get; }
        public IReadOnlyList<ConversationEffect> Effects { get; }
        public ConversationResponse(string id, string text, string profession, int minimumTier, string nextNodeId, bool end, IEnumerable<ConversationEffect> effects)
        { Id = id; Text = text; Profession = profession; MinimumTier = minimumTier; NextNodeId = nextNodeId; End = end; Effects = effects.ToList().AsReadOnly(); }
    }
    public sealed class ConversationNode
    {
        public string Id { get; }
        public string Text { get; }
        public bool End { get; }
        public IReadOnlyList<ConversationResponse> Responses { get; }
        public IReadOnlyList<ConversationEffect> Effects { get; }
        public ConversationNode(string id, string text, bool end, IEnumerable<ConversationResponse> responses, IEnumerable<ConversationEffect> effects)
        { Id = id; Text = text; End = end; Responses = responses.ToList().AsReadOnly(); Effects = effects.ToList().AsReadOnly(); }
    }
    public sealed class ConversationDefinition
    {
        public string Id { get; }
        public string StageId { get; }
        public string NpcId { get; }
        public string StartNodeId { get; }
        public int FirstVisit { get; }
        public IReadOnlyList<string> Dispositions { get; }
        public IReadOnlyList<ConversationNode> Nodes { get; }
        public IReadOnlyList<ConversationEffect> OnStartEffects { get; }
        public ConversationDefinition(string id, string stageId, string npcId, string startNodeId, int firstVisit, IEnumerable<string> dispositions, IEnumerable<ConversationNode> nodes, IEnumerable<ConversationEffect> onStartEffects = null)
        { Id = id; StageId = stageId; NpcId = npcId; StartNodeId = startNodeId; FirstVisit = firstVisit;
          Dispositions = dispositions.ToList().AsReadOnly(); Nodes = nodes.ToList().AsReadOnly(); OnStartEffects = (onStartEffects ?? Array.Empty<ConversationEffect>()).ToList().AsReadOnly(); }
    }
    public sealed class TravelDefinition
    {
        public IReadOnlyList<TravelStage> Stages { get; }
        public IReadOnlyList<TravelDoor> Transitions { get; }
        public IReadOnlyList<MissionNpc> Npcs { get; }
        public IReadOnlyList<string> StartingKnowledge { get; }
        public IReadOnlyList<ConversationDefinition> Conversations { get; }
        public MissionFieldDefinition Field { get; }
        public TravelDefinition(IEnumerable<TravelStage> stages, IEnumerable<TravelDoor> transitions, IEnumerable<MissionNpc> npcs,
            IEnumerable<string> startingKnowledge, IEnumerable<ConversationDefinition> conversations, MissionFieldDefinition field = null)
        { Stages = stages.ToList().AsReadOnly(); Transitions = transitions.ToList().AsReadOnly(); Npcs = npcs.ToList().AsReadOnly();
          StartingKnowledge = startingKnowledge.ToList().AsReadOnly(); Conversations = conversations.ToList().AsReadOnly(); Field = field; }
    }
    public sealed class ConversationLine
    {
        public string SceneId { get; }
        public string EntryId { get; }
        public string ActorId { get; }
        public ConversationLine(string sceneId, string entryId, string actorId) { SceneId = sceneId; EntryId = entryId; ActorId = actorId; }
    }
    public sealed class TravelState
    {
        public IReadOnlyDictionary<string, int> Visits { get; }
        public IReadOnlyList<string> OpenDoors { get; }
        public IReadOnlyList<string> Knowledge { get; }
        public IReadOnlyList<MissionNpc> Npcs { get; }
        public IReadOnlyList<string> StartedConversations { get; }
        public string SceneId { get; }
        public string NodeId { get; }
        public IReadOnlyList<ConversationLine> History { get; }
        public MissionFieldState Field { get; }
        public TravelState(IDictionary<string, int> visits, IEnumerable<string> openDoors, IEnumerable<string> knowledge,
            IEnumerable<MissionNpc> npcs, IEnumerable<string> startedConversations, string sceneId, string nodeId, IEnumerable<ConversationLine> history, MissionFieldState field = null)
        { Visits = new ReadOnlyDictionary<string, int>(new Dictionary<string, int>(visits)); OpenDoors = openDoors.ToList().AsReadOnly();
          Knowledge = knowledge.ToList().AsReadOnly(); Npcs = npcs.ToList().AsReadOnly(); StartedConversations = startedConversations.ToList().AsReadOnly();
          SceneId = sceneId; NodeId = nodeId; History = history.ToList().AsReadOnly(); Field = field; }
    }
    public static class MissionTravel
    {
        public static TravelState Initial(MissionDefinition mission) => mission.Travel == null ? null : new TravelState(
            new Dictionary<string, int> { [mission.GateStageId] = 1 }, mission.Travel.Transitions.Where(t => t.InitialState == "OPEN").Select(t => t.Id),
            mission.Travel.StartingKnowledge, mission.Travel.Npcs, Array.Empty<string>(), null, null, Array.Empty<ConversationLine>(), MissionField.Initial(mission.Travel.Field));
        public static TravelState Current(CampaignState state) => state.Expedition?.Travel ?? Initial(state.Base.Mission);
        public static IEnumerable<string> EligibleActors(CampaignState state, ConversationResponse response, bool requireAvailable = true) =>
            state.Expedition.Party.Where(member =>
            {
                var u = state.Base.Mission.Personnel.Single(p => p.UnitId == member.UnitId);
                var tier = u.Profession == response.Profession ? u.Tier : u.BranchKind == "cross" && u.BranchId == response.Profession ? u.BranchTier : 0;
                return (!requireAvailable || MissionCombat.CanAct(state, member.UnitId)) && (response.Profession == null || tier >= Math.Max(1, response.MinimumTier));
            }).Select(member => member.UnitId);
        public static CampaignState Move(CampaignState state, string doorId)
        {
            MissionCombat.RequireFree(state);
            var e = state.Expedition ?? throw new InvalidOperationException("No team is offworld.");
            var travel = Current(state) ?? throw new InvalidOperationException("Stage travel is unavailable.");
            if (e.GateChoicePending || travel.SceneId != null || travel.Field?.Work != null) throw new InvalidOperationException("Finish the Gate choice, conversation or field work before moving.");
            var door = state.Base.Mission.Travel.Transitions.SingleOrDefault(t => t.Id == doorId);
            var destination = door?.Destination(e.StageId);
            if (destination == null) throw new InvalidOperationException("Doorway is not adjacent or not implemented.");
            if (door.InitialState == "LOCKED" && !travel.OpenDoors.Contains(door.Id)) throw new InvalidOperationException("Locked doorway requires its authored interaction.");
            var visits = travel.Visits.ToDictionary(p => p.Key, p => p.Value);
            visits[destination] = checked((visits.TryGetValue(destination, out var count) ? count : 0) + 1);
            var opened = travel.OpenDoors.Concat(new[] { doorId }).Distinct();
            var updated = new TravelState(visits, opened, travel.Knowledge, travel.Npcs, travel.StartedConversations, null, null, travel.History, travel.Field);
            var scene = state.Base.Mission.Travel.Conversations.FirstOrDefault(c => c.StageId == destination &&
                visits[destination] == c.FirstVisit && !travel.StartedConversations.Contains(c.Id) &&
                c.Dispositions.Contains(travel.Npcs.Single(n => n.Id == c.NpcId).Disposition));
            if (scene != null)
            {
                updated = new TravelState(visits, updated.OpenDoors, updated.Knowledge, updated.Npcs,
                    updated.StartedConversations.Concat(new[] { scene.Id }), scene.Id, scene.StartNodeId, updated.History, updated.Field);
                updated = Enter(state.Base.Mission, updated, scene, scene.StartNodeId);
            }
            // The existing campaign transaction advances base work and Gate expiry once.
            var candidate = ReceivingWork.AdvanceTick(state);
            return Replace(candidate, destination, MissionField.Refresh(candidate, destination, updated));
        }
        public static CampaignState Talk(CampaignState state, string sceneId)
        {
            MissionCombat.RequireFree(state, true);
            var t = Current(state); var scene = state.Base.Mission.Travel.Conversations.SingleOrDefault(c => c.Id == sceneId && c.FirstVisit == 0);
            if (scene == null || state.Expedition.GateChoicePending || t.SceneId != null || t.Field?.Work != null || scene.StageId != state.Expedition.StageId)
                throw new InvalidOperationException("Conversation is not available here.");
            // First contact is ported. Repeating it can activate hostile incidents,
            // which must be implemented before that continuation is offered.
            if (t.StartedConversations.Contains(scene.Id)) throw new InvalidOperationException("Repeat contact and its possible escalation are not implemented yet.");
            var next = new TravelState(t.Visits.ToDictionary(p => p.Key, p => p.Value), t.OpenDoors, t.Knowledge, t.Npcs,
                t.StartedConversations.Concat(new[] { scene.Id }).Distinct(), scene.Id, scene.StartNodeId, t.History, t.Field);
            next = Apply(next, scene.OnStartEffects); next = Enter(state.Base.Mission, next, scene, scene.StartNodeId);
            return Replace(state, state.Expedition.StageId, MissionField.Refresh(state, state.Expedition.StageId, next));
        }
        public static CampaignState Respond(CampaignState state, string responseId, string actorId)
        {
            var travel = Current(state);
            var scene = state.Base.Mission.Travel.Conversations.SingleOrDefault(c => c.Id == travel?.SceneId)
                ?? throw new InvalidOperationException("No active conversation.");
            var node = scene.Nodes.Single(n => n.Id == travel.NodeId);
            var response = node.Responses.SingleOrDefault(r => r.Id == responseId);
            if (response == null || !EligibleActors(state, response).Contains(actorId)) throw new InvalidOperationException("Choose a qualified responder.");
            var next = new TravelState(travel.Visits.ToDictionary(p => p.Key, p => p.Value), travel.OpenDoors, travel.Knowledge, travel.Npcs,
                travel.StartedConversations, response.End ? null : scene.Id, response.End ? null : response.NextNodeId,
                travel.History.Concat(new[] { new ConversationLine(scene.Id, response.Id, actorId) }), travel.Field);
            next = Apply(next, response.Effects);
            if (!response.End) next = Enter(state.Base.Mission, next, scene, response.NextNodeId);
            return Replace(state, state.Expedition.StageId, next);
        }
        public static CampaignState Continue(CampaignState state)
        {
            var travel = Current(state);
            var scene = state.Base.Mission.Travel.Conversations.SingleOrDefault(c => c.Id == travel?.SceneId)
                ?? throw new InvalidOperationException("No active conversation.");
            if (!scene.Nodes.Single(n => n.Id == travel.NodeId).End) throw new InvalidOperationException("Choose a response first.");
            return Replace(state, state.Expedition.StageId, new TravelState(travel.Visits.ToDictionary(p => p.Key, p => p.Value),
                travel.OpenDoors, travel.Knowledge, travel.Npcs, travel.StartedConversations, null, null, travel.History, travel.Field));
        }
        private static TravelState Enter(MissionDefinition mission, TravelState travel, ConversationDefinition scene, string nodeId)
        {
            var node = scene.Nodes.Single(n => n.Id == nodeId);
            return Apply(new TravelState(travel.Visits.ToDictionary(p => p.Key, p => p.Value), travel.OpenDoors, travel.Knowledge,
                travel.Npcs, travel.StartedConversations, scene.Id, nodeId,
                travel.History.Concat(new[] { new ConversationLine(scene.Id, nodeId, null) }), travel.Field), node.Effects);
        }
        private static TravelState Apply(TravelState travel, IEnumerable<ConversationEffect> effects)
        {
            var knowledge = travel.Knowledge.ToList(); var npcs = travel.Npcs.ToList(); var field = travel.Field;
            foreach (var effect in effects)
            {
                if (!MissionField.EffectAllowed(travel, effect)) continue;
                if (effect.Type == "ADD_KNOWLEDGE") { if (!knowledge.Contains(effect.KnowledgeId)) knowledge.Add(effect.KnowledgeId); continue; }
                if (new[] { "SET_DETECTION_STATE", "SET_EVAC_STATE", "ACTIVATE_OBJECTIVE" }.Contains(effect.Type)) { field = MissionField.Apply(field, effect); continue; }
                var npc = npcs.Single(n => n.Id == effect.InstanceId);
                if (effect.Type != "CHANGE_NPC_SUSPICION" && effect.Type != "SET_NPC_DISPOSITION") throw new InvalidOperationException("Unsupported conversation effect.");
                npcs[npcs.IndexOf(npc)] = new MissionNpc(npc.Id, npc.StageId, npc.Label,
                    effect.Type == "SET_NPC_DISPOSITION" ? effect.Value : npc.Disposition,
                    effect.Type == "CHANGE_NPC_SUSPICION" ? Math.Max(0, Math.Min(100, npc.Suspicion + effect.Delta)) : npc.Suspicion, npc.Hostility);
            }
            return new TravelState(travel.Visits.ToDictionary(p => p.Key, p => p.Value), travel.OpenDoors, knowledge, npcs,
                travel.StartedConversations, travel.SceneId, travel.NodeId, travel.History, field);
        }
        private static CampaignState Replace(CampaignState state, string stageId, TravelState travel)
        {
            var e = state.Expedition;
            return new CampaignState(state.Base, state.Random, state.Clock, state.Assignments, state.Receiving, state.Transfers,
                new ExpeditionState(e.MissionId, stageId, e.StartedTick, e.GateChoicePending, e.GateOpen, e.ConnectionOpenedTick, e.Party, travel, e.Combat, e.ExtractedTick, teamId: e.TeamId), teams: state.Teams, cargo: state.Cargo, personnel: state.Personnel, construction: state.Construction);
        }
        public static void Validate(CampaignState state)
        {
            var e = state.Expedition; var travel = e.Travel; var definition = state.Base.Mission.Travel;
            if (travel == null) { if (e.StageId != state.Base.Mission.GateStageId) throw new InvalidOperationException("Missing travel state."); return; }
            if (definition == null || !definition.Stages.Any(s => s.Id == e.StageId) || !travel.Visits.ContainsKey(e.StageId) ||
                !travel.Visits.ContainsKey(state.Base.Mission.GateStageId) || travel.Visits.Any(p => p.Value < 1 || !definition.Stages.Any(s => s.Id == p.Key)) ||
                travel.Visits.Sum(p => (long)p.Value) - 1 > state.Clock.ElapsedTicks - e.StartedTick ||
                e.GateChoicePending && (e.StageId != state.Base.Mission.GateStageId || travel.Visits.Count != 1))
                throw new InvalidOperationException("Invalid explored Stages/visit counts.");
            var effects = definition.Conversations.SelectMany(c => c.OnStartEffects.Concat(c.Nodes.SelectMany(n => n.Effects.Concat(n.Responses.SelectMany(r => r.Effects))))).ToList();
            if (travel.OpenDoors.Distinct().Count() != travel.OpenDoors.Count || travel.OpenDoors.Any(id => !definition.Transitions.Any(t => t.Id == id)) ||
                travel.Knowledge.Distinct().Count() != travel.Knowledge.Count || !definition.StartingKnowledge.All(travel.Knowledge.Contains) ||
                travel.Knowledge.Any(k => !definition.StartingKnowledge.Contains(k) && !effects.Any(x => x.KnowledgeId == k) && definition.Field?.Observations.Any(o => o.RevealsFacts.Contains(k)) != true) ||
                !travel.Npcs.Select(n => n.Id).OrderBy(id => id).SequenceEqual(definition.Npcs.Select(n => n.Id).OrderBy(id => id)))
                throw new InvalidOperationException("Invalid mission Knowledge, NPCs or doors.");
            foreach (var npc in travel.Npcs)
            {
                var original = definition.Npcs.Single(n => n.Id == npc.Id);
                if (npc.StageId != original.StageId || npc.Suspicion < 0 || npc.Suspicion > 100 || npc.Hostility != original.Hostility ||
                    npc.Disposition != original.Disposition && !effects.Any(x => x.InstanceId == npc.Id && x.Type == "SET_NPC_DISPOSITION" && x.Value == npc.Disposition) &&
                    !(npc.Disposition == "HOSTILE" && MissionCombat.GuardState(state, npc.Id, "NEUTRAL") != "NEUTRAL"))
                    throw new InvalidOperationException("Invalid NPC state.");
            }
            if (travel.StartedConversations.Distinct().Count() != travel.StartedConversations.Count ||
                travel.StartedConversations.Any(id => !definition.Conversations.Any(c => c.Id == id && travel.Visits.TryGetValue(c.StageId, out var visits) && visits >= c.FirstVisit)))
                throw new InvalidOperationException("Invalid conversation starts.");
            if (travel.SceneId == null != (travel.NodeId == null)) throw new InvalidOperationException("Incomplete conversation reference.");
            if (travel.SceneId != null && (!travel.StartedConversations.Contains(travel.SceneId) ||
                !definition.Conversations.Any(c => c.Id == travel.SceneId && c.StageId == e.StageId && c.Nodes.Any(n => n.Id == travel.NodeId))))
                throw new InvalidOperationException("Invalid active conversation.");
            foreach (var line in travel.History)
            {
                var scene = definition.Conversations.SingleOrDefault(c => c.Id == line.SceneId);
                var response = scene?.Nodes.SelectMany(n => n.Responses).SingleOrDefault(r => r.Id == line.EntryId);
                if (scene == null || !travel.StartedConversations.Contains(scene.Id) ||
                    (line.ActorId == null ? !scene.Nodes.Any(n => n.Id == line.EntryId) : response == null || !EligibleActors(state, response, false).Contains(line.ActorId)))
                    throw new InvalidOperationException("Invalid conversation history/responder.");
            }
            MissionField.Validate(state);
        }
    }
}
