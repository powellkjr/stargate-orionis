using System;
using System.Collections.Generic;
using System.Linq;
namespace Orionis.Domain
{
    public sealed class FieldValueCondition{public string InstanceId,Field,Value;}
    public sealed class FieldAssignment{public string RecipeId,ActorId;}
    public sealed class FieldWorkGroup{public string Id,StageId,Label;public string[] RecipeIds;public ConversationEffect[] Effects;}
    public sealed class FieldRecord{public string Id,Label;}
    public sealed class FieldWorkflows
    {public FieldWorkGroup[] Groups=Array.Empty<FieldWorkGroup>();public Dictionary<string,Dictionary<string,string>> InitialStates=new Dictionary<string,Dictionary<string,string>>();public FieldRecord[] Records=Array.Empty<FieldRecord>();public FieldRecord[] Discoveries=Array.Empty<FieldRecord>();}
    public static partial class MissionField
    {
        public static bool ActionVisible(CampaignState s,FieldActionRecipe action)=>action.HiddenUntilKnowledge.All(s.Expedition.Travel.Knowledge.Contains);
        public static string InstanceValue(CampaignState s,string id,string field)
        {
            var effect=s.Expedition.Travel.Field.Completed.Select(w=>Requirements(s,w.RecipeId)).OfType<FieldActionRecipe>().SelectMany(r=>r.Effects).LastOrDefault(e=>e.InstanceId==id&&e.Field==field&&e.Type=="SET_ITEM_STATE");
            if(effect!=null)return effect.StateValue;
            var values=s.Base.Mission.Travel.Field.Workflows.InitialStates;return values.TryGetValue(id,out var state)&&state.TryGetValue(field,out var value)?value:null;
        }
        public static IEnumerable<string> Records(CampaignState s,bool discoveries=false)
        {
            var workflow=s.Base.Mission.Travel.Field.Workflows;var ids=s.Expedition.Travel.Field.Completed.Select(w=>Requirements(s,w.RecipeId)).OfType<FieldActionRecipe>().SelectMany(r=>r.Effects).Where(e=>e.Type==(discoveries?"CREATE_DISCOVERY":"ADD_TO_PARTY_STORAGE")).Select(e=>e.InstanceId).ToArray();
            return (discoveries?workflow.Discoveries:workflow.Records).Where(r=>ids.Contains(r.Id)).Select(r=>r.Label);
        }
        public static bool GroupCompleted(CampaignState s,string id)=>s.Expedition.Travel.Field.Completed.Any(w=>w.GroupId==id);
        public static CampaignState StartGroup(CampaignState s,string id)
        {
            Ready(s);var group=s.Base.Mission.Travel.Field.Workflows.Groups.Single(g=>g.Id==id);
            var actors=s.Expedition.Party.Where(p=>MissionCombat.CanAct(s,p.UnitId)).ToArray();
            if(group.StageId!=s.Expedition.StageId||s.Expedition.Travel.Field.Work!=null||GroupCompleted(s,id)||actors.Length==0||actors.Length>group.RecipeIds.Length)throw new InvalidOperationException("Work group is unavailable.");
            var assignments=actors.Select((a,i)=>new FieldAssignment{RecipeId=group.RecipeIds[i],ActorId=a.UnitId}).ToArray();
            foreach(var a in assignments)if(!Candidates(s,Requirements(s,a.RecipeId)).Contains((a.ActorId,(string)null)))throw new InvalidOperationException("Every group Actor must qualify for their own bubble.");
            var f=s.Expedition.Travel.Field;
            return Replace(s,With(s.Expedition.Travel,new MissionFieldState(f.Subjects,f.Objectives.ToDictionary(p=>p.Key,p=>p.Value),f.Observed,new FieldWork(assignments[0].RecipeId,group.StageId,assignments[0].ActorId,null,s.Clock.ElapsedTicks,groupId:id,assignments:assignments),f.Completed)));
        }
        private static void ValidateGroup(CampaignState s,FieldWork w)
        {
            var group=s.Base.Mission.Travel.Field.Workflows.Groups.SingleOrDefault(g=>g.Id==w.GroupId);
            if(group==null||group.StageId!=w.StageId||!group.RecipeIds.Contains(w.RecipeId))throw new InvalidOperationException("Unknown authored work-group bubble.");
            var head=w.Assignments.Count>0?w:s.Expedition.Travel.Field.Completed.SingleOrDefault(a=>a.GroupId==w.GroupId&&a.Assignments.Count>0);
            if(head==null||head.Assignments.Count==0||head.Assignments.Count>group.RecipeIds.Length||head.Assignments.Select(a=>a.ActorId).Distinct().Count()!=head.Assignments.Count||!head.Assignments.Select(a=>a.RecipeId).SequenceEqual(group.RecipeIds.Take(head.Assignments.Count))||head.RecipeId!=head.Assignments[0].RecipeId||head.ActorId!=head.Assignments[0].ActorId||!head.Assignments.Any(a=>a.RecipeId==w.RecipeId&&a.ActorId==w.ActorId))throw new InvalidOperationException("Invalid sticky group assignments.");
            foreach(var a in head.Assignments)if(!s.Expedition.Party.Any(p=>p.UnitId==a.ActorId)||Requirements(s,a.RecipeId).Profession!="UNTRAINED"||ReferenceEquals(w,s.Expedition.Travel.Field.Work)&&!MissionCombat.CanAct(s,a.ActorId))throw new InvalidOperationException("Invalid group Actor.");
            if(!ReferenceEquals(w,s.Expedition.Travel.Field.Work)&&head.Assignments.Any(a=>!s.Expedition.Travel.Field.Completed.Any(c=>c.GroupId==head.GroupId&&c.StartedTick==head.StartedTick&&c.RecipeId==a.RecipeId&&c.ActorId==a.ActorId)))throw new InvalidOperationException("Incomplete group completion receipt.");
        }
    }
}
