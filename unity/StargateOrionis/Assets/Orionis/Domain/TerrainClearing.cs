using System;
using System.Collections.Generic;
using System.Linq;
namespace Orionis.Domain
{
    public sealed class ClearingVariation
    {public string Id;public int MinBubbles,MaxBubbles,LongPercent;public int[] Durations;public ClearingSpecialist Specialist;}
    public sealed class ClearingSpecialist{public string Profession;public int MinimumTier;}
    public sealed class ClearingBubbleWork
    {
        public string ActorId { get; }
        public int Ticks { get; }
        public long? CompletedTick { get; }
        public ClearingBubbleWork(string actorId=null,int ticks=0,long? completedTick=null)
        {ActorId=actorId;Ticks=ticks;CompletedTick=completedTick;}
    }
    public sealed class TerrainClearingOrder
    {
        public string Cell => Col+","+Row;
        public string RecipeId { get; }
        public int Col { get; }
        public int Row { get; }
        public long StartedTick { get; }
        public IReadOnlyList<ClearingBubbleWork> Bubbles { get; }
        public long? CompletedTick { get; }
        public bool Completed => CompletedTick.HasValue;
        public double CreditedSupply { get; }
        public TerrainClearingOrder(string recipeId,int col,int row,long startedTick,IEnumerable<ClearingBubbleWork> bubbles,long? completedTick=null,double creditedSupply=0)
        {RecipeId=recipeId;Col=col;Row=row;StartedTick=startedTick;Bubbles=bubbles.ToList().AsReadOnly();CompletedTick=completedTick;CreditedSupply=creditedSupply;}
    }
    public static class TerrainClearing
    {
        public static IReadOnlyList<RecipeBubble> Plan(CampaignState s,int col,int row,bool legacy=false)
        {
            var setup=s.Base.Construction;var variation=legacy?null:setup.ClearingVariation;
            if(variation==null)return setup.ClearingBubbles.Select((duration,i)=>new RecipeBubble("CLEAR_"+i,duration,"UNTRAINED",0,null,Array.Empty<string>())).ToArray();
            uint seed=unchecked(s.Random.Seed^(uint)(col*73856093)^(uint)(row*19349663)^0x9e3779b9u);uint Next(){seed^=seed<<13;seed^=seed>>17;seed^=seed<<5;return seed;}
            int count=variation.MinBubbles+(int)(Next()%(uint)(variation.MaxBubbles-variation.MinBubbles+1)),specialist=(int)(Next()%(uint)count);
            return Enumerable.Range(0,count).Select(i=>new RecipeBubble("CLEAR_"+i,i==0?1:i==1?20:variation.Durations[Next()%100<variation.LongPercent?1:0],i==specialist?variation.Specialist.Profession:"UNTRAINED",i==specialist?variation.Specialist.MinimumTier:0,null,Array.Empty<string>())).ToArray();
        }
        public static IReadOnlyList<RecipeBubble> WorkBubbles(CampaignState s,TerrainClearingOrder o)=>Plan(s,o.Col,o.Row,o.RecipeId==s.Base.Construction.ClearingRecipeId);
        public static bool ReservesActor(CampaignState s,string actor) => s.Construction?.Clearings.Any(o=>o.Bubbles.Any(b=>b.ActorId==actor&&!b.CompletedTick.HasValue))==true;
        public static IEnumerable<string> AvailableActors(CampaignState s,string sticky=null) => s.Assignments.Where(a=>RoomConstruction.MaintenanceFor(s,a.UnitId)!=null&&(sticky==null||sticky==a.UnitId)&&!s.Transfers.Any(t=>t.UnitId==a.UnitId)&&SGTeams.ForUnit(s,a.UnitId)==null&&!BaseWork.OnBaseResponse(s,a.UnitId)&&!Expeditions.IsDeployed(s,a.UnitId)&&!Expeditions.IsIncapacitated(s,a.UnitId)&&!PersonnelRecovery.InBed(s,a.UnitId)&&(!RoomConstruction.ReservesActor(s,a.UnitId)||sticky==a.UnitId)).OrderBy(a=>BaseWork.Priority(s,RoomConstruction.MaintenanceFor(s,a.UnitId),a.UnitId)).ThenBy(a=>a.UnitId,StringComparer.Ordinal).Select(a=>a.UnitId);
        public static CampaignState Start(CampaignState s,int col,int row)
        {
            var setup=s.Base.Construction;
            if(s.Construction==null||setup.ClearingBubbles.Count==0)throw new InvalidOperationException("Rock-clearing Recipe is not configured.");
            if(col<0||row<0||col>=s.Base.Planning.Columns||row>=s.Base.Planning.Rows||RoomConstruction.IsClear(s,col,row))throw new InvalidOperationException("Choose a rock cell within the base grid.");
            if(s.Construction.Clearings.Any(o=>o.Col==col&&o.Row==row))throw new InvalidOperationException("Clearing is already scheduled for this cell.");
            if(s.Base.Rooms.Any(r=>col>=r.Col&&col<r.Col+r.Definition.Width&&row>=r.Row&&row<r.Row+r.Definition.Height))throw new InvalidOperationException("A room occupies this cell.");
            var w=s.Construction;
            return RoomConstruction.Replace(s,s.Base,new ConstructionState(w.Supply.ToDictionary(p=>p.Key,p=>p.Value),w.Sites,w.Excavated,w.Groups,w.Clearings.Append(new TerrainClearingOrder(setup.ClearingVariation?.Id??setup.ClearingRecipeId,col,row,s.Clock.ElapsedTicks,Plan(s,col,row).Select(_=>new ClearingBubbleWork()))),w.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value)));
        }
        internal static CampaignState Advance(CampaignState s,ISet<string> busy,CampaignState actorContext)
        {
            var work=s.Construction;if(work==null||work.Clearings.All(o=>o.Completed))return s;
            var supply=work.Supply.ToDictionary(p=>p.Key,p=>p.Value);var excavated=work.Excavated.ToList();
            var orders=work.Clearings.OrderBy(o=>o.StartedTick).ThenBy(o=>o.Cell,StringComparer.Ordinal).Select(o=>
            {
                if(o.Completed)return o;
                var nodes=WorkBubbles(s,o);
                var previous=new RecipeWorkState(o.Bubbles,Enumerable.Range(0,o.Bubbles.Count).Where(i=>o.Bubbles[i].CompletedTick.HasValue));
                var execution=BubbleExecution.Advance(nodes,previous,s.Clock.ElapsedTicks,busy,i=>true,(i,sticky)=>AvailableActors(actorContext,sticky).FirstOrDefault(id=>!busy.Contains(id)&&MissionField.ProfessionTier(actorContext,id,nodes[i].Profession)>=nodes[i].MinimumTier),i=>new Dictionary<string,long>(),(i,result)=>true);
                var bubbles=execution.Bubbles;
                bool complete=bubbles.All(b=>b.CompletedTick.HasValue);
                // Cumulative shares preserve integer rounding and the exact total.
                double earned=Math.Floor(s.Base.Construction.RockSupply*bubbles.Count(b=>b.CompletedTick.HasValue)/bubbles.Count);
                supply[s.Base.Construction.RockSupplyClass]+=earned-o.CreditedSupply;
                if(complete)excavated.Add(o.Cell);
                return new TerrainClearingOrder(o.RecipeId,o.Col,o.Row,o.StartedTick,bubbles,complete?s.Clock.ElapsedTicks:(long?)null,earned);
            }).ToList();
            return RoomConstruction.Replace(s,s.Base,new ConstructionState(supply,work.Sites,excavated,work.Groups,orders,work.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value)));
        }
        internal static void Validate(CampaignState s)
        {
            var w=s.Construction;var setup=s.Base.Construction;
            if(w.Clearings.Any(o=>o==null)||w.Clearings.Select(o=>o.Cell).Distinct().Count()!=w.Clearings.Count)throw new InvalidOperationException("Duplicate or null clearing order.");
            var completions=new HashSet<string>();var active=new HashSet<string>();
            foreach(var o in w.Clearings)
            {
                double earned=Math.Floor(setup.RockSupply*o.Bubbles.Count(b=>b?.CompletedTick.HasValue==true)/o.Bubbles.Count);
                if(double.IsNaN(o.CreditedSupply)||double.IsInfinity(o.CreditedSupply)||o.CreditedSupply<0||o.CreditedSupply>earned||o.Completed&&o.CreditedSupply!=setup.RockSupply)throw new InvalidOperationException("Invalid clearing Supply credits.");
                if((o.RecipeId!=setup.ClearingRecipeId&&o.RecipeId!=setup.ClearingVariation?.Id)||o.Bubbles.Count!=WorkBubbles(s,o).Count||o.Bubbles.Count==0||o.Col<0||o.Row<0||o.Col>=s.Base.Planning.Columns||o.Row>=s.Base.Planning.Rows||o.StartedTick<0||o.StartedTick>s.Clock.ElapsedTicks||o.Completed!=o.Bubbles.All(b=>b?.CompletedTick!=null)||w.Excavated.Contains(o.Cell)!=o.Completed||!o.Completed&&RoomConstruction.IsClear(s,o.Col,o.Row)||o.CompletedTick>s.Clock.ElapsedTicks||o.CompletedTick<=o.StartedTick)throw new InvalidOperationException("Invalid clearing Recipe, completion or cell.");
                for(int i=0;i<o.Bubbles.Count;i++)
                {
                    var b=o.Bubbles[i];int duration=WorkBubbles(s,o)[i].DurationTicks;
                    if(b==null||b.Ticks<0||b.Ticks>duration||b.Ticks>s.Clock.ElapsedTicks-o.StartedTick||(b.ActorId==null)!=(b.Ticks==0)||b.CompletedTick.HasValue!=(b.Ticks==duration)||b.CompletedTick>s.Clock.ElapsedTicks||b.CompletedTick<o.StartedTick+b.Ticks||b.ActorId!=null&&!s.Base.Units.Any(u=>u.Id==b.ActorId)||o.CompletedTick.HasValue&&b.CompletedTick>o.CompletedTick)throw new InvalidOperationException("Invalid clearing bubble Actor or progress.");
                    if(b.CompletedTick.HasValue&&!completions.Add(b.ActorId+"/"+b.CompletedTick))throw new InvalidOperationException("A Unit cannot complete two clearing bubbles in one tick.");
                    if(b.ActorId!=null&&MissionField.ProfessionTier(s,b.ActorId,WorkBubbles(s,o)[i].Profession)<WorkBubbles(s,o)[i].MinimumTier)throw new InvalidOperationException("Clearing bubble Actor lacks its required Profession.");
                    if(b.ActorId!=null&&!b.CompletedTick.HasValue&&!active.Add(b.ActorId))throw new InvalidOperationException("A Unit cannot own two active clearing bubbles.");
                }
            }
            long capacity=s.Base.Rooms.Where(r=>r.Definition.Id==setup.SupplyStorageDefinitionId).Sum(r=>(long)s.Base.Storage.Find(r.Definition.Id).CapacityByTier[r.ConstructionTier]);
            if(w.Supply.Values.Sum()+w.Clearings.Where(o=>!o.Completed).Sum(o=>setup.RockSupply-o.CreditedSupply)>capacity+.000001)throw new InvalidOperationException("Supply Storage cannot reserve the clearing outputs.");
        }
    }
}
