using System;
using System.Collections.Generic;
using System.Linq;
namespace Orionis.Domain
{
    public sealed class RecipeBubble
    {
        public string Id { get; }
        public int DurationTicks { get; }
        public string Profession { get; }
        public int MinimumTier { get; }
        public string ToolService { get; }
        public IReadOnlyList<string> DependsOn { get; }
        public int OutputWeight { get; }
        public IReadOnlyList<string> Reveals { get; }
        public RecipeBubble(string id,int durationTicks,string profession,int minimumTier,string toolService,IEnumerable<string> dependsOn,int outputWeight=0,IEnumerable<string> reveals=null)
        {Id=id;DurationTicks=durationTicks;Profession=profession;MinimumTier=minimumTier;ToolService=toolService;DependsOn=dependsOn.ToList().AsReadOnly();OutputWeight=outputWeight;Reveals=(reveals??Array.Empty<string>()).ToList().AsReadOnly();}
    }
    public sealed class RecipeWorkState
    {
        public IReadOnlyList<ClearingBubbleWork> Bubbles { get; }
        public IReadOnlyList<int> Committed { get; }
        public IReadOnlyDictionary<int,Dictionary<string,long>> Outcomes { get; }
        public bool Opened { get; }
        public int? AllocationHighTierPercent {get;}
        public RecipeWorkState(IEnumerable<ClearingBubbleWork> bubbles,IEnumerable<int> committed=null,IDictionary<int,Dictionary<string,long>> outcomes=null,bool opened=false,int? allocationHighTierPercent=null)
        {AllocationHighTierPercent=allocationHighTierPercent;Bubbles=bubbles.ToList().AsReadOnly();Committed=(committed??Array.Empty<int>()).ToList().AsReadOnly();Outcomes=new System.Collections.ObjectModel.ReadOnlyDictionary<int,Dictionary<string,long>>((outcomes??new Dictionary<int,Dictionary<string,long>>()).ToDictionary(p=>p.Key,p=>new Dictionary<string,long>(p.Value)));Opened=opened;}
    }
    // Shared transaction kernel called by the existing campaign tick executor.
    // It owns no clock, inventory, queue, random stream or room workflow.
    public static class BubbleExecution
    {
        public static RecipeWorkState Advance(IReadOnlyList<RecipeBubble> nodes,RecipeWorkState previous,long tick,ISet<string> busy,
            Func<int,bool> allowed,Func<int,string,string> resolveActor,Func<int,Dictionary<string,long>> calculateOutcome,Func<int,IReadOnlyDictionary<string,long>,bool> commit)
        {
            var work=previous.Bubbles.ToArray();var done=previous.Committed.ToHashSet();var outcomes=previous.Outcomes.ToDictionary(p=>p.Key,p=>new Dictionary<string,long>(p.Value));bool opened=previous.Opened;
            for(int i=0;i<nodes.Count;i++)
            {
                if(done.Contains(i)||!allowed(i))continue;
                // Dependencies observe the committed state at tick start.
                if(nodes[i].DependsOn.Any(id=>!previous.Committed.Any(n=>nodes[n].Id==id)))continue;
                var bubble=work[i];
                if(!bubble.CompletedTick.HasValue)
                {
                    var actor=resolveActor(i,bubble.ActorId);if(actor==null||busy.Contains(actor))continue;
                    busy.Add(actor);int progress=bubble.Ticks+1;
                    work[i]=bubble=new ClearingBubbleWork(actor,progress,progress==nodes[i].DurationTicks?tick:(long?)null);
                    if(nodes[i].OutputWeight>0)opened=true;
                    if(!bubble.CompletedTick.HasValue)continue;
                    outcomes[i]=calculateOutcome(i); // Calculated exactly once, before capacity validation.
                }
                if(commit(i,outcomes[i]))done.Add(i);
            }
            return new RecipeWorkState(work,done.OrderBy(i=>i),outcomes,opened,previous.AllocationHighTierPercent);
        }
    }
}
