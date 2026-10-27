using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class FieldSubject
    {
        public string Id { get; }
        public string StageId { get; }
        public string Label { get; }
        public string Detection { get; }
        public string Evacuation { get; }
        public string Combat { get; }
        public FieldSubject(string id, string stageId, string label, string detection, string evacuation, string combat)
        { Id = id; StageId = stageId; Label = label; Detection = detection; Evacuation = evacuation; Combat = combat; }
    }
    public class FieldRequirements
    {
        public string Id { get; }
        public string Profession { get; }
        public int MinimumTier { get; }
        public int MinimumPerception { get; }
        public string Service { get; }
        public int ChargeCost { get; }
        public int Ticks { get; }
        public FieldRequirements(string id, string profession, int minimumTier, int minimumPerception, string service, int chargeCost, int ticks)
        { Id = id; Profession = profession; MinimumTier = minimumTier; MinimumPerception = minimumPerception; Service = service; ChargeCost = chargeCost; Ticks = ticks; }
    }
    public sealed class DoorRecipe : FieldRequirements
    {
        public string DoorId { get; }
        public DoorRecipe(string id, string doorId, string profession, int minimumTier, int minimumPerception, string service, int chargeCost, int ticks)
            : base(id, profession, minimumTier, minimumPerception, service, chargeCost, ticks) { DoorId = doorId; }
    }
    public sealed class FieldActionEffect
    {
        public string Type { get; }
        public string InstanceId { get; }
        public string Field { get; }
        public bool Value { get; }
        public string StateValue {get;}
        public FieldActionEffect(string type,string instanceId,string field=null,bool value=false,string stateValue=null){Type=type;InstanceId=instanceId;Field=field;Value=value;StateValue=stateValue;}
    }
    public sealed class FieldActionGate
    {public string InstanceId {get;}public string Field {get;}public bool Value {get;}public bool InitialValue {get;}public FieldActionGate(string instanceId,string field,bool value,bool initialValue){InstanceId=instanceId;Field=field;Value=value;InitialValue=initialValue;}}
    public sealed class FieldActionRecipe : FieldRequirements
    {
        public string StageId { get; }
        public string Label { get; }
        public string OutcomeText {get;}
        public FieldActionGate Gate {get;}
        public IReadOnlyList<ConversationEffect> SocialEffects {get;}
        public IReadOnlyList<FieldActionEffect> Effects { get; }
        public IReadOnlyList<string> RequiresKnowledge {get;}public IReadOnlyList<string> HiddenUntilKnowledge {get;}
        public string WorkGroupId {get;}public FieldValueCondition Condition {get;}
        public FieldActionRecipe(string id,string stageId,string label,string profession,int minimumTier,int minimumPerception,string service,int chargeCost,int ticks,IEnumerable<FieldActionEffect> effects,IEnumerable<ConversationEffect> socialEffects=null,FieldActionGate gate=null,string outcomeText=null,IEnumerable<string> requiresKnowledge=null,IEnumerable<string> hiddenUntilKnowledge=null,string workGroupId=null,FieldValueCondition condition=null):base(id,profession,minimumTier,minimumPerception,service,chargeCost,ticks)
        {StageId=stageId;Label=label;Effects=effects.ToList().AsReadOnly();SocialEffects=(socialEffects??Array.Empty<ConversationEffect>()).ToArray();Gate=gate;OutcomeText=outcomeText;RequiresKnowledge=(requiresKnowledge??Array.Empty<string>()).ToArray();HiddenUntilKnowledge=(hiddenUntilKnowledge??Array.Empty<string>()).ToArray();WorkGroupId=workGroupId;Condition=condition;}
    }
    public sealed class FieldObservation
    {
        public string Id { get; }
        public string StageId { get; }
        public string SubjectId { get; }
        public string Text { get; }
        public string Profession { get; }
        public int MinimumTier { get; }
        public int MinimumPerception { get; }
        public IReadOnlyList<string> RequiresKnowledge { get; }
        public IReadOnlyList<string> RevealsFacts { get; }
        public string Detection { get; }
        public FieldObservation(string id, string stageId, string subjectId, string text, string profession, int minimumTier, int minimumPerception,
            IEnumerable<string> requiresKnowledge, IEnumerable<string> revealsFacts, string detection)
        { Id = id; StageId = stageId; SubjectId = subjectId; Text = text; Profession = profession; MinimumTier = minimumTier; MinimumPerception = minimumPerception;
          RequiresKnowledge = requiresKnowledge.ToList().AsReadOnly(); RevealsFacts = revealsFacts.ToList().AsReadOnly(); Detection = detection; }
    }
    public sealed class FieldObjective
    {
        public string Id { get; }
        public string InitialState { get; }
        public string Text { get; }
        public string DetectionSubjectId { get; }
        public string ActivateOnComplete { get; }
        public FieldObjective(string id, string initialState, string text, string detectionSubjectId, string activateOnComplete)
        { Id = id; InitialState = initialState; Text = text; DetectionSubjectId = detectionSubjectId; ActivateOnComplete = activateOnComplete; }
    }
    public sealed class MissionFieldDefinition
    {
        public IReadOnlyList<FieldActionRecipe> Actions { get; }
        public IReadOnlyList<FieldSubject> Subjects { get; }
        public IReadOnlyList<DoorRecipe> DoorRecipes { get; }
        public IReadOnlyList<FieldObservation> Observations { get; }
        public IReadOnlyList<FieldObjective> Objectives { get; }
        public FieldWorkflows Workflows {get;}
        public MissionFieldDefinition(IEnumerable<FieldSubject> subjects, IEnumerable<DoorRecipe> doorRecipes, IEnumerable<FieldObservation> observations, IEnumerable<FieldObjective> objectives,IEnumerable<FieldActionRecipe> actions=null,FieldWorkflows workflows=null)
        { Actions=(actions??Array.Empty<FieldActionRecipe>()).ToList().AsReadOnly();Subjects = subjects.ToList().AsReadOnly(); DoorRecipes = doorRecipes.ToList().AsReadOnly(); Observations = observations.ToList().AsReadOnly(); Objectives = objectives.ToList().AsReadOnly(); Workflows=workflows??new FieldWorkflows();}
    }
    public sealed class FieldWork
    {
        public string RecipeId { get; }
        public string StageId { get; }
        public string ActorId { get; }
        public string ToolId { get; }
        public long StartedTick { get; }
        public bool ToolChargesRestored { get; }
        public string GroupId {get;}public IReadOnlyList<FieldAssignment> Assignments {get;}
        public FieldWork(string recipeId, string stageId, string actorId, string toolId, long startedTick, bool toolChargesRestored=false,string groupId=null,IEnumerable<FieldAssignment> assignments=null)
        { RecipeId = recipeId; StageId = stageId; ActorId = actorId; ToolId = toolId; StartedTick = startedTick; ToolChargesRestored=toolChargesRestored;GroupId=groupId;Assignments=(assignments??Array.Empty<FieldAssignment>()).ToArray(); }
    }
    public sealed class MissionFieldState
    {
        public IReadOnlyList<FieldSubject> Subjects { get; }
        public IReadOnlyDictionary<string, string> Objectives { get; }
        public IReadOnlyList<string> Observed { get; }
        public FieldWork Work { get; }
        public IReadOnlyList<FieldWork> Completed { get; }
        public MissionFieldState(IEnumerable<FieldSubject> subjects, IDictionary<string, string> objectives, IEnumerable<string> observed, FieldWork work, IEnumerable<FieldWork> completed)
        { Subjects = subjects.ToList().AsReadOnly(); Objectives = new ReadOnlyDictionary<string, string>(new Dictionary<string, string>(objectives));
          Observed = observed.ToList().AsReadOnly(); Work = work; Completed = completed.ToList().AsReadOnly(); }
    }
    public static partial class MissionField
    {
        public static MissionFieldState Initial(MissionFieldDefinition d) => d == null ? null :
            new MissionFieldState(d.Subjects, d.Objectives.ToDictionary(o => o.Id, o => o.InitialState), Array.Empty<string>(), null, Array.Empty<FieldWork>());
        public static int ProfessionTier(CampaignState state, string actorId, string profession)
        {
            var u = state.Base.Mission.Personnel.Single(p => p.UnitId == actorId);
            return profession == "UNTRAINED" ? 0 : u.Profession == profession ? u.Tier : u.BranchKind == "cross" && u.BranchId == profession ? u.BranchTier : 0;
        }
        public static IEnumerable<(string ActorId, string ToolId)> Candidates(CampaignState state, FieldRequirements recipe)
        {
            foreach (var member in state.Expedition.Party)
                if (MissionCombat.CanAct(state, member.UnitId) && ProfessionTier(state, member.UnitId, recipe.Profession) >= recipe.MinimumTier && member.Perception >= recipe.MinimumPerception)
                {
                    if (string.IsNullOrEmpty(recipe.Service) && recipe.ChargeCost == 0) { yield return (member.UnitId, null); continue; }
                    foreach (var tool in member.Tools.Where(t => !t.Damaged && t.Services.Contains(recipe.Service) && t.Charges >= recipe.ChargeCost))
                        yield return (member.UnitId, tool.InstanceId);
                }
        }
        // Capability diagnostics use the same equipped Tools and Actor rules as execution.
        public static string CapabilityBlocker(CampaignState state, FieldRequirements recipe)
        {
            if (state.Expedition == null) return "MISSION_NOT_READY";
            var qualified = state.Expedition.Party.Where(m => ProfessionTier(state, m.UnitId, recipe.Profession) >= recipe.MinimumTier && m.Perception >= recipe.MinimumPerception).ToList();
            if (qualified.Count == 0) return "NO_VALID_ACTOR";
            var available = qualified.Where(m => MissionCombat.CanAct(state, m.UnitId)).ToList();
            if (available.Count == 0) return "ACTOR_UNAVAILABLE";
            if (Candidates(state, recipe).Any()) return null;
            var tools = available.SelectMany(m => m.Tools).Where(t => t.Services.Contains(recipe.Service)).ToList();
            if (tools.Count == 0) return "TOOL_SERVICE_MISSING";
            if (tools.All(t => t.Damaged)) return "TOOL_DAMAGED";
            return "TOOL_CHARGES_DEPLETED";
        }
        private static void Ready(CampaignState state)
        { MissionCombat.RequireFree(state, true); if (state.Expedition == null || state.Expedition.GateChoicePending || state.Expedition.Travel?.SceneId != null) throw new InvalidOperationException("Finish the Gate choice/conversation first."); }
        public static FieldRequirements Requirements(CampaignState state, string recipeId) =>
            (FieldRequirements)state.Base.Mission.Travel.Field.DoorRecipes.SingleOrDefault(x => x.Id == recipeId) ?? state.Base.Mission.Travel.Field.Actions.SingleOrDefault(x=>x.Id==recipeId) ?? state.Base.Cargo?.Caches.Select(c=>c.Recipe).OfType<FieldActionRecipe>().SingleOrDefault(r=>r.Id==recipeId) ?? MissionCare.Recipe(state, recipeId)?.Requirements ??
            (MissionRescue.IsRecipe(state, recipeId) ? state.Base.Rescue.Requirements : state.Base.Cargo?.Reveal.Id == recipeId ? state.Base.Cargo.Reveal : null);
        public static string ActionBlocker(CampaignState s,FieldActionRecipe action)
        {
            if(!ActionVisible(s,action))return "HIDDEN";
            if(!action.RequiresKnowledge.All(s.Expedition.Travel.Knowledge.Contains))return "KNOWLEDGE_REQUIRED";
            if(action.Condition!=null&&InstanceValue(s,action.Condition.InstanceId,action.Condition.Field)!=action.Condition.Value)return "PREPARATION_REQUIRED";
            if(action.Gate==null)return null;
            var value=s.Expedition.Travel.Field.Completed.Select(w=>s.Base.Mission.Travel.Field.Actions.SingleOrDefault(a=>a.Id==w.RecipeId)).Where(a=>a!=null).SelectMany(a=>a.Effects).LastOrDefault(e=>e.Type=="SET_INSTANCE_STATE"&&e.InstanceId==action.Gate.InstanceId&&e.Field==action.Gate.Field)?.Value??action.Gate.InitialValue;
            return value==action.Gate.Value?null:"Complete the required local preparation first.";
        }
        public static CampaignState Start(CampaignState state, string recipeId, string actorId, string toolId)
        {
            Ready(state); var t = state.Expedition.Travel; var f = t.Field;
            var r = Requirements(state, recipeId) ?? throw new InvalidOperationException("Unknown field Recipe.");
            if(r is FieldActionRecipe groupMember&&groupMember.WorkGroupId!=null)throw new InvalidOperationException("Start this Recipe through its authored work group.");
            var care = MissionCare.Recipe(state, recipeId);
            var rescue = MissionRescue.IsRecipe(state, recipeId);
            var cargo = state.Base.Cargo?.Reveal.Id == recipeId;
            var door = state.Base.Mission.Travel.Transitions.SingleOrDefault(x => x.Id == (r as DoorRecipe)?.DoorId);
            if (f.Work != null || f.Completed.Any(w => w.RecipeId == recipeId) ||
                (r is FieldActionRecipe action ? action.StageId!=state.Expedition.StageId||ActionBlocker(state,action)!=null : cargo ? state.Expedition.StageId != state.Base.Cargo.StageId : rescue ? !MissionRescue.CanDepart(state) : care != null ? care.StageId != state.Expedition.StageId : door == null || t.OpenDoors.Contains(door.Id) || door.Destination(state.Expedition.StageId) == null) ||
                !Candidates(state, r).Contains((actorId, toolId)))
                throw new InvalidOperationException("Field work requires a local unfinished target, qualified Actor and charged, undamaged equipped Tool.");
            return Replace(state, With(t, new MissionFieldState(f.Subjects, f.Objectives.ToDictionary(p => p.Key, p => p.Value), f.Observed,
                new FieldWork(recipeId, state.Expedition.StageId, actorId, toolId, state.Clock.ElapsedTicks), f.Completed)));
        }
        public static CampaignState Cancel(CampaignState state)
        {
            Ready(state); var t = state.Expedition.Travel; var f = t.Field;
            if (f.Work == null) throw new InvalidOperationException("No field work is active.");
            return Replace(state, With(t, new MissionFieldState(f.Subjects, f.Objectives.ToDictionary(p => p.Key, p => p.Value), f.Observed, null, f.Completed)));
        }
        public static CampaignState Advance(CampaignState state)
        {
            Ready(state); var t = state.Expedition.Travel; var f = t.Field; var w = f.Work ?? throw new InvalidOperationException("No field work is active.");
            var r = Requirements(state, w.RecipeId);
            if(r is FieldActionRecipe checkedAction&&ActionBlocker(state,checkedAction)!=null)throw new InvalidOperationException("Field work prerequisites changed.");
            if(w.GroupId!=null)ValidateGroup(state,w);
            if (w.StageId != state.Expedition.StageId || !Candidates(state, r).Contains((w.ActorId, w.ToolId))) throw new InvalidOperationException("Sticky Actor or reserved Tool is unavailable.");
            var candidate = state;
            for (int i = 0; i < r.Ticks; i++) candidate = ReceivingWork.AdvanceTick(candidate);
            var party = candidate.Expedition.Party.Select(member => new ExpeditionMember(member.UnitId, member.Perception, member.Stamina, member.Endurance,
                member.Tools.Select(tool => tool.InstanceId == w.ToolId ? new ExpeditionTool(tool.InstanceId, tool.KitId, tool.Slot, tool.Charges - r.ChargeCost,
                    tool.Damaged, tool.Label, tool.Tier, tool.Services) : tool), member.Equipment, member.StartingHealth));
            var care = MissionCare.Recipe(state, w.RecipeId);
            var rescue = MissionRescue.IsRecipe(state, w.RecipeId);
            var cargo = state.Base.Cargo?.Reveal.Id == w.RecipeId;
            if (rescue && !MissionRescue.CanDepart(state)) throw new InvalidOperationException("Operative departure requires contact, care and a secure Gate route.");
            var guardId = cargo ? state.Base.Cargo.GuardId : care?.GuardId;
            var delta = cargo ? state.Base.Cargo.SuspicionDelta : care?.SuspicionDelta ?? 0;
            var npcs = t.Npcs.Select(n => n.Id == guardId && MissionCombat.GuardState(state, n.Id, "NEUTRAL") == "NEUTRAL" ?
                new MissionNpc(n.Id, n.StageId, n.Label, n.Disposition, Math.Min(100, n.Suspicion + delta), n.Hostility) : n);
            var finished=w.Assignments.Count==0?new[]{w}:w.Assignments.Select((a,i)=>new FieldWork(a.RecipeId,w.StageId,a.ActorId,null,w.StartedTick,groupId:w.GroupId,assignments:i==0?w.Assignments:null));
            var next = new TravelState(t.Visits.ToDictionary(p => p.Key, p => p.Value), r is DoorRecipe doorRecipe ? t.OpenDoors.Concat(new[] { doorRecipe.DoorId }).Distinct() : t.OpenDoors, t.Knowledge, npcs,
                t.StartedConversations, t.SceneId, t.NodeId, t.History, new MissionFieldState(rescue ? f.Subjects.Select(x => MissionRescue.SendToGate(state, x)) : f.Subjects, f.Objectives.ToDictionary(p => p.Key, p => p.Value), f.Observed, null, f.Completed.Concat(finished)));
            var updated=Replace(candidate,next,party);var actionRecipe=r as FieldActionRecipe;
            if(actionRecipe!=null&&actionRecipe.SocialEffects.Count>0)updated=Replace(updated,MissionTravel.Apply(updated.Expedition.Travel,actionRecipe.SocialEffects));
            if(w.GroupId!=null)updated=Replace(updated,MissionTravel.Apply(updated.Expedition.Travel,state.Base.Mission.Travel.Field.Workflows.Groups.Single(g=>g.Id==w.GroupId).Effects));
            updated=Replace(updated,Refresh(updated,updated.Expedition.StageId,updated.Expedition.Travel));
            return ResourceCargo.ApplyFieldAction(MissionCare.Escalate(updated),actionRecipe);
        }
        public static bool EffectAllowed(TravelState travel, ConversationEffect effect) => effect.ConditionInstanceId == null ||
            travel.Field?.Subjects.Any(s => s.Id == effect.ConditionInstanceId && effect.ConditionField == "combatState" && s.Combat == effect.ConditionEquals) == true;
        public static MissionFieldState Apply(MissionFieldState f, ConversationEffect effect)
        {
            var subjects = f.Subjects.ToList(); var objectives = f.Objectives.ToDictionary(p => p.Key, p => p.Value);
            if (effect.Type == "ACTIVATE_OBJECTIVE") { if (objectives[effect.Value] == "HIDDEN") objectives[effect.Value] = "ACTIVE"; }
            else
            {
                var old = subjects.Single(s => s.Id == effect.InstanceId);
                if (effect.Type != "SET_DETECTION_STATE" && effect.Type != "SET_EVAC_STATE") throw new InvalidOperationException("Unsupported field effect.");
                subjects[subjects.IndexOf(old)] = new FieldSubject(old.Id, old.StageId, old.Label,
                    effect.Type == "SET_DETECTION_STATE" ? effect.Value : old.Detection, effect.Type == "SET_EVAC_STATE" ? effect.Value : old.Evacuation, old.Combat);
            }
            return new MissionFieldState(subjects, objectives, f.Observed, f.Work, f.Completed);
        }
        public static TravelState Refresh(CampaignState state, string stageId, TravelState t)
        {
            var d = state.Base.Mission.Travel.Field; if (d == null) return t;
            var f = t.Field; var knowledge = t.Knowledge.ToList(); var observed = f.Observed.ToList(); var subjects = f.Subjects.ToList();
            foreach (var o in d.Observations.Where(o => o.StageId == stageId && !observed.Contains(o.Id)))
                if (o.RequiresKnowledge.All(knowledge.Contains) && state.Expedition.Party.Any(u => MissionCombat.CanAct(state, u.UnitId) && u.Perception >= o.MinimumPerception &&
                    (o.Profession == "UNTRAINED" || ProfessionTier(state, u.UnitId, o.Profession) >= o.MinimumTier)))
                {
                    observed.Add(o.Id); foreach (var k in o.RevealsFacts) if (!knowledge.Contains(k)) knowledge.Add(k);
                    var subject = subjects.Single(s => s.Id == o.SubjectId);
                    subjects[subjects.IndexOf(subject)] = new FieldSubject(subject.Id, subject.StageId, subject.Label, o.Detection, subject.Evacuation, subject.Combat);
                }
            var objectives = f.Objectives.ToDictionary(p => p.Key, p => p.Value);
            foreach (var o in d.Objectives.Where(o => o.DetectionSubjectId != null))
                if (subjects.Any(s => s.Id == o.DetectionSubjectId && s.Detection == "LOCATED"))
                { objectives[o.Id] = "COMPLETED"; if (o.ActivateOnComplete != null && objectives[o.ActivateOnComplete] == "HIDDEN") objectives[o.ActivateOnComplete] = "ACTIVE"; }
            return new TravelState(t.Visits.ToDictionary(p => p.Key, p => p.Value), t.OpenDoors, knowledge, t.Npcs, t.StartedConversations, t.SceneId, t.NodeId, t.History,
                new MissionFieldState(subjects, objectives, observed, f.Work, f.Completed));
        }
        public static TravelState With(TravelState t, MissionFieldState field) => new TravelState(t.Visits.ToDictionary(p => p.Key, p => p.Value),
            t.OpenDoors, t.Knowledge, t.Npcs, t.StartedConversations, t.SceneId, t.NodeId, t.History, field);
        public static CampaignState Replace(CampaignState state, TravelState t, IEnumerable<ExpeditionMember> party = null)
        {
            var e = state.Expedition;
            return new CampaignState(state.Base, state.Random, state.Clock, state.Assignments, state.Receiving, state.Transfers,
                new ExpeditionState(e.MissionId, e.StageId, e.StartedTick, e.GateChoicePending, e.GateOpen, e.ConnectionOpenedTick, party ?? e.Party, t, e.Combat, e.ExtractedTick, teamId: e.TeamId), teams: state.Teams, cargo: state.Cargo, personnel: state.Personnel, construction: state.Construction, cores: state.Cores, workforce: state.Workforce, completedWork: state.CompletedWork);
        }
        public static void Validate(CampaignState state)
        {
            var t = state.Expedition.Travel; var f = t?.Field; var d = state.Base.Mission.Travel?.Field;
            if (d == null && f == null) return;
            if (d == null || f == null || !f.Subjects.Select(s => s.Id).OrderBy(x => x).SequenceEqual(d.Subjects.Select(s => s.Id).OrderBy(x => x)) ||
                !f.Objectives.Keys.OrderBy(x => x).SequenceEqual(d.Objectives.Select(o => o.Id).OrderBy(x => x)) ||
                f.Objectives.Values.Any(v => !new[] { "HIDDEN", "ACTIVE", "COMPLETED" }.Contains(v)) || f.Observed.Distinct().Count() != f.Observed.Count ||
                f.Observed.Any(id => !d.Observations.Any(o => o.Id == id && t.Visits.ContainsKey(o.StageId)))) throw new InvalidOperationException("Invalid mission field state.");
            foreach (var s in f.Subjects)
            {
                var original = d.Subjects.Single(x => x.Id == s.Id);
                var sent = state.Base.Rescue?.SubjectId == s.Id && f.Completed.Any(w => w.RecipeId == state.Base.Rescue.Requirements.Id);
                if (s.StageId != (sent ? state.Base.Mission.GateStageId : original.StageId) || s.Combat != MissionCombat.GuardState(state, s.Id, original.Combat) || !new[] { "HIDDEN", "LOCATED" }.Contains(s.Detection) ||
                    (sent ? s.Evacuation != (state.Expedition.Returned ? "EXTRACTED" : "AT_GATE") : s.Evacuation != null && s.Evacuation != "READY_TO_EVACUATE") ||
                    (s.Detection != "HIDDEN" || s.Evacuation != null) && !t.Visits.ContainsKey(original.StageId))
                    throw new InvalidOperationException("Invalid subject location or evacuation evidence.");
            }
            foreach (var o in d.Objectives)
            {
                var detected = o.DetectionSubjectId != null && f.Subjects.Any(s => s.Id == o.DetectionSubjectId && s.Detection == "LOCATED");
                var activated = d.Objectives.Any(other => other.ActivateOnComplete == o.Id && f.Objectives[other.Id] == "COMPLETED");
                var extracted = state.Base.Rescue?.Requirements.Id == o.Id && f.Subjects.Any(x => x.Id == state.Base.Rescue.SubjectId && x.Evacuation == "EXTRACTED");
                var expected = detected || extracted ? "COMPLETED" : activated ? "ACTIVE" : o.InitialState;
                if (f.Objectives[o.Id] != expected) throw new InvalidOperationException("Objective state lacks its authored condition.");
            }
            foreach (var id in f.Observed)
            {
                var observation = d.Observations.Single(o => o.Id == id);
                if (!observation.RevealsFacts.All(t.Knowledge.Contains) || f.Subjects.Single(s => s.Id == observation.SubjectId).Detection != observation.Detection)
                    throw new InvalidOperationException("Observation evidence is inconsistent.");
            }
            if (f.Completed.Select(w => w.RecipeId).Distinct().Count() != f.Completed.Count) throw new InvalidOperationException("Duplicate completed field work.");
            foreach (var w in f.Completed.Concat(f.Work == null ? Array.Empty<FieldWork>() : new[] { f.Work }))
            {
                if(w.GroupId!=null)ValidateGroup(state,w);
                else if(w.Assignments.Count!=0)throw new InvalidOperationException("Assignments require an authored work group.");
                var r = Requirements(state, w.RecipeId);
                if(r is FieldActionRecipe member&&member.WorkGroupId!=w.GroupId)throw new InvalidOperationException("Work group identity does not match its authored bubble.");
                var care = MissionCare.Recipe(state, w.RecipeId);
                var rescue = MissionRescue.IsRecipe(state, w.RecipeId);
            var cargo = state.Base.Cargo?.Reveal.Id == w.RecipeId;
                var actor = state.Expedition.Party.SingleOrDefault(u => u.UnitId == w.ActorId);
                var tool = actor?.Tools.SingleOrDefault(x => x.InstanceId == w.ToolId);
                var door = state.Base.Mission.Travel.Transitions.SingleOrDefault(x => x.Id == (r as DoorRecipe)?.DoorId);
                if (r == null || actor == null || (string.IsNullOrEmpty(r.Service) ? w.ToolId != null : tool == null || tool.Damaged || !tool.Services.Contains(r.Service)) || ProfessionTier(state, w.ActorId, r.Profession) < r.MinimumTier ||
                    actor.Perception < r.MinimumPerception || (r is FieldActionRecipe action ? action.StageId!=w.StageId : cargo ? state.Base.Cargo.StageId != w.StageId : rescue ? state.Base.Rescue.StageId != w.StageId || !t.Knowledge.Contains("operative-contacted") || !MissionCare.Resolved(state) || MissionEvacuation.SecureRoute(state, w.StageId) == null : care != null ? care.StageId != w.StageId : door == null || door.Destination(w.StageId) == null) || !t.Visits.ContainsKey(w.StageId) ||
                    w.StartedTick < state.Expedition.StartedTick || w.StartedTick > state.Clock.ElapsedTicks ||
                    (ReferenceEquals(w, f.Work) ? w.StageId != state.Expedition.StageId || t.SceneId != null || !MissionCombat.CanAct(state, w.ActorId) ||
                        f.Completed.Any(done => done.RecipeId == w.RecipeId) || r is DoorRecipe && t.OpenDoors.Contains(door.Id) || tool!=null && tool.Charges < r.ChargeCost :
                        r is DoorRecipe && !t.OpenDoors.Contains(door.Id) || w.StartedTick + r.Ticks > state.Clock.ElapsedTicks)) throw new InvalidOperationException("Invalid field Actor/Tool/work reference.");
            }
            foreach (var door in state.Base.Mission.Travel.Transitions.Where(x => x.InitialState == "LOCKED"))
                if (t.OpenDoors.Contains(door.Id) != f.Completed.Any(w => d.DoorRecipes.Any(r => r.Id == w.RecipeId && r.DoorId == door.Id)))
                    throw new InvalidOperationException("Locked doorway lacks committed Recipe evidence.");
            long availableTick = state.Expedition.StartedTick;string cohort=null;long cohortStarted=-1;
            foreach (var w in f.Completed)
            {
                if (w.StartedTick < availableTick&&!(w.GroupId!=null&&w.GroupId==cohort&&w.StartedTick==cohortStarted)) throw new InvalidOperationException("Completed field work overlaps earlier work.");
                cohort=w.GroupId;cohortStarted=w.StartedTick;
                availableTick = checked(w.StartedTick + Requirements(state, w.RecipeId).Ticks);
            }
            if (f.Work != null && f.Work.StartedTick < availableTick) throw new InvalidOperationException("Active work overlaps committed work.");
            foreach (var member in state.Expedition.Party)
                foreach (var tool in member.Tools)
                {
                    var initial = state.Base.Mission.Personnel.Single(u => u.UnitId == member.UnitId).Tools.Single(t => t.InstanceId == tool.InstanceId);
                    if (f.Work?.ToolChargesRestored==true||f.Completed.Any(w=>w.ToolChargesRestored&&(w.ToolId==null||Requirements(state,w.RecipeId).ChargeCost==0)))throw new InvalidOperationException("Refill history requires completed Tool-consuming work.");
                    if (f.Completed.Where(w => w.ToolId == tool.InstanceId&&!w.ToolChargesRestored).Sum(w => Requirements(state, w.RecipeId).ChargeCost) > initial.Charges - tool.Charges)
                        throw new InvalidOperationException("Completed work lacks its committed Tool charges.");
                }
        }
    }
}
