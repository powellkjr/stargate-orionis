using System;
using System.Collections.Generic;
using System.Linq;
namespace Orionis.Domain
{
    public sealed class ResourceProcessingCatalog
    {
        public string InstanceId,ItemId,RecipeId,StageId,RoomDefinitionId,Payload,Family,Policy,InitialName,HazardInstanceId,HazardField;
        public int ConversionStat;
        public bool LegacyHandling;
        public int[] Tiers;
        public IncomingItem Incoming;
        public IReadOnlyList<RecipeBubble> Bubbles;
    }
    public static class ResourceCargo
    {
        public static bool IsResource(CampaignState s,RecoveredItem item)=>s.Base.ResourceProcessing?.InstanceId==item.Id;
        public static bool Consumed(CampaignState s,RecoveredItem item)=>IsResource(s,item)&&item.ResourceWork?.Committed.Count==s.Base.ResourceProcessing.Bubbles.Count;
        public static bool Known(CampaignState s,RecoveredItem item,string fact)=>item.ResourceWork!=null&&item.ResourceWork.Committed.Any(i=>s.Base.ResourceProcessing.Bubbles[i].Reveals.Contains(fact));
        public static string Name(CampaignState s,RecoveredItem item)
        {
            var d=s.Base.ResourceProcessing;
            if(!Known(s,item,"QUALITY"))return d.InitialName;
            return ResourceCargoEconomy.Band(s.Base.CargoEconomy.SizeBands,d.Bubbles.Count).Id+" "+ResourceCargoEconomy.Band(s.Base.CargoEconomy.QualityBands,d.ConversionStat).Id+" "+string.Join("/",d.Tiers.OrderByDescending(t=>t).Select(t=>"S"+t))+" Supply cache";
        }
        public static bool StageSafe(CampaignState s,string stage)
        {
            var d=s.Base.ResourceProcessing;if(d==null||d.StageId!=stage)return true;
            return s.Expedition?.Travel?.Field?.Completed.Any(w=>s.Base.Mission.Travel.Field.Actions.Any(a=>a.Id==w.RecipeId&&a.Effects.Any(e=>e.Type=="SET_INSTANCE_STATE"&&e.InstanceId==d.HazardInstanceId&&e.Field==d.HazardField&&!e.Value)))==true;
        }
        private static RecoveredItem Create(CampaignState s)=>new RecoveredItem(s.Base.ResourceProcessing.InstanceId,s.Base.ResourceProcessing.InstanceId,s.Base.Mission.Id,s.Clock.ElapsedTicks,s.Base.ResourceProcessing.Payload,null,resourceWork:new RecipeWorkState(s.Base.ResourceProcessing.Bubbles.Select(_=>new ClearingBubbleWork())),fieldStageId:s.Base.ResourceProcessing.StageId);
        public static CampaignState ApplyFieldAction(CampaignState s,FieldActionRecipe action)
        {
            if(action==null||s.Base.ResourceProcessing==null||!action.Effects.Any(e=>e.Type=="CARRY_TARGET"&&e.InstanceId==s.Base.ResourceProcessing.InstanceId))return s;
            return s.Cargo.Any(i=>i.Id==s.Base.ResourceProcessing.InstanceId)?s:RecoveredCargo.Replace(s,s.Cargo.Append(Create(s)));
        }
        public static bool Collected(CampaignState s)=>s.Expedition?.Travel?.Field?.Completed.Any(w=>s.Base.Mission.Travel.Field.Actions.Any(a=>a.Id==w.RecipeId&&a.Effects.Any(e=>e.Type=="CARRY_TARGET"&&e.InstanceId==s.Base.ResourceProcessing.InstanceId)))==true;
        public static CampaignState Recover(CampaignState s)
        {
            var item=s.Cargo.Single(i=>IsResource(s,i));
            if(item.FieldStageId==null||s.Expedition?.Returned!=true||!Collected(s))throw new InvalidOperationException("Mark the cache for extraction and return to SGC.");
            return RecoveredCargo.Replace(s,s.Cargo.Select(i=>i==item?i.WithResource(i.ResourceWork,null):i));
        }
        public static CampaignState InspectField(CampaignState s)
        {
            MissionCombat.RequireFree(s,true);
            if(s.Expedition==null||s.Expedition.Returned||s.Expedition.StageId!=s.Base.ResourceProcessing.StageId||s.Expedition.GateChoicePending||s.Expedition.Travel.SceneId!=null||s.Expedition.Travel.Field.Work!=null)throw new InvalidOperationException("Inspect the local cache outside other mission work.");
            var item=s.Cargo.SingleOrDefault(i=>IsResource(s,i))??Create(s);
            if(item.FieldStageId==null||Consumed(s,item))throw new InvalidOperationException("This cache has already left the field.");
            int index=Enumerable.Range(0,s.Base.ResourceProcessing.Bubbles.Count).FirstOrDefault(i=>!item.ResourceWork.Committed.Contains(i));
            if(s.Base.ResourceProcessing.Bubbles[index].OutputWeight!=0)throw new InvalidOperationException("Field inspection is complete. Collect the physical cache.");
            var node=s.Base.ResourceProcessing.Bubbles[index];
            var req=new FieldRequirements(node.Id,node.Profession,node.MinimumTier,0,node.ToolService,0,node.DurationTicks);
            var candidate=MissionField.Candidates(s,req).FirstOrDefault();
            if(candidate.ActorId==null)throw new InvalidOperationException("Needs a qualified "+node.Profession+" with equipped "+node.ToolService+".");
            // Validate first, advance the shared campaign transaction, then commit
            // the same physical instance's work. Exceptions publish no state.
            var next=ReceivingWork.AdvanceTick(s);var process=BubbleExecution.Advance(s.Base.ResourceProcessing.Bubbles,item.ResourceWork,next.Clock.ElapsedTicks,new HashSet<string>(),i=>i==index,(i,sticky)=>candidate.ActorId,i=>new Dictionary<string,long>(),(i,result)=>true);
            var updated=item.WithResource(process,item.FieldStageId);
            return RecoveredCargo.Replace(next,next.Cargo.Where(i=>i.Id!=item.Id).Append(updated));
        }
        public static CampaignState Admit(CampaignState s,string id,string roomId)
        {
            var item=s.Cargo.Single(i=>i.Id==id);
            if(!IsResource(s,item)||Consumed(s,item)||item.FieldStageId!=null||item.CustodyRoomId!=null||s.Base.Rooms.Single(r=>r.Id==roomId).Definition.Id!=s.Base.ResourceProcessing.RoomDefinitionId)throw new InvalidOperationException("Choose incoming resource cargo and a Receiving room.");
            return RecoveredCargo.Replace(s,s.Cargo.Select(i=>i==item?i.InCustody(roomId):i));
        }
        private static string Actor(CampaignState s,string room,RecipeBubble node,string sticky,ISet<string> busy)=>BaseWork.Workers(s,room,node.Profession,node.MinimumTier,sticky).Where(w=>!RoomConstruction.ReservesActor(s,w.UnitId)&&!busy.Contains(w.UnitId)&&BaseWork.HasTool(s,room,w.UnitId,node.ToolService)).Select(w=>w.UnitId).FirstOrDefault();
        private static int SelectedAllocation(CampaignState s,RecoveredItem item)
        {
            if(item.ResourceWork?.AllocationHighTierPercent is int allocation)return allocation;
            // Legacy work that already opened retains its original Balanced outcomes.
            if(s.Cores==null||item.ResourceWork?.Opened==true||item.FieldStageId!=null||item.CustodyRoomId==null)return s.Base.CargoEconomy.PolicyShare(s.Base.ResourceProcessing.Policy);
            var core=RoomCores.Provider(s,item.CustodyRoomId,s.Base.ResourceProcessing.ItemId,"RECOVERY");
            return core==null?s.Base.Cores.T0HighTierPercent:RoomCores.Definition(s,core).HighTierPercent;
        }
        public static IReadOnlyDictionary<string,long> Totals(CampaignState s,RecoveredItem item)
        {var d=s.Base.ResourceProcessing;return s.Base.CargoEconomy.WildYield(d.Bubbles.Count,d.ConversionStat,d.Family,d.Tiers,SelectedAllocation(s,item));}
        public static string AllocationLabel(CampaignState s,RecoveredItem item)=>s.Cores==null?"BALANCED (provisional default; no Core)":SelectedAllocation(s,item)+"% high-tier / "+(100-SelectedAllocation(s,item))+"% low-tier";
        public static string BlockedReason(CampaignState s,RecoveredItem item)
        {
            if(Consumed(s,item))return "Complete";
            if(item.FieldStageId!=null)return "Recover this cache to base first.";
            if(item.CustodyRoomId==null)return "Waiting for admission to Receiving.";
            if(item.ResourceWork.Outcomes.Keys.Any(i=>!item.ResourceWork.Committed.Contains(i)))return "Waiting for free Supply Storage capacity; deposits are preserved.";
            if(RoomCores.HoldsNewWork(s,item.CustodyRoomId))return "Waiting for Core reconfiguration.";
            var equipment=RoomCores.HandlingBlocker(s,item.CustodyRoomId);if(equipment!=null)return equipment;
            if(!BaseWork.Workers(s,item.CustodyRoomId,"UNTRAINED",0).Any())return "Waiting for Receiving staff (any profession).";
            var busy=new HashSet<string>();
            var eligible=Enumerable.Range(0,s.Base.ResourceProcessing.Bubbles.Count).Where(i=>!item.ResourceWork.Committed.Contains(i)&&s.Base.ResourceProcessing.Bubbles[i].DependsOn.All(id=>item.ResourceWork.Committed.Any(n=>s.Base.ResourceProcessing.Bubbles[n].Id==id))).ToArray();
            if(eligible.Any(i=>Actor(s,item.CustodyRoomId,s.Base.ResourceProcessing.Bubbles[i],item.ResourceWork.Bubbles[i].ActorId,busy)!=null))return "Working: staff advance available bubbles each tick.";
            var node=s.Base.ResourceProcessing.Bubbles[eligible.First()];
            return node.Profession=="UNTRAINED"?"Waiting for available local staff; assigned workers are busy or away.":"Waiting for available "+node.Profession+" with equipped "+node.ToolService+".";
        }
        internal static IReadOnlyList<RecoveredItem> Advance(CampaignState s,CampaignClock clock,ISet<string> busy,IReadOnlyList<RecoveredItem> cargo,out ConstructionState construction,bool retryOnly=false)
        {
            construction=s.Construction;if(s.Base.ResourceProcessing==null||s.Construction==null)return cargo;
            var setup=s.Base.ResourceProcessing;var supply=s.Construction.Supply.ToDictionary(p=>p.Key,p=>p.Value);
            long capacity=s.Base.Rooms.Where(r=>r.Definition.Id==s.Base.Construction.SupplyStorageDefinitionId).Sum(r=>(long)s.Base.Storage.Find(r.Definition.Id).CapacityByTier[r.ConstructionTier]);
            double reserved=s.Construction.Clearings.Where(o=>!o.Completed).Sum(o=>s.Base.Construction.RockSupply-o.CreditedSupply);
            var result=cargo.Select(item=>
            {
                if(!IsResource(s,item)||Consumed(s,item)||item.FieldStageId!=null||item.CustodyRoomId==null)return item;
                if(!retryOnly&&(RoomCores.HoldsNewWork(s,item.CustodyRoomId)||RoomCores.HandlingBlocker(s,item.CustodyRoomId)!=null))return item;
                bool anotherOpen=cargo.Any(i=>i!=item&&IsResource(s,i)&&i.ResourceWork?.Opened==true&&!Consumed(s,i)&&i.CustodyRoomId==item.CustodyRoomId);
                var totals=Totals(s,item);
                var work=BubbleExecution.Advance(setup.Bubbles,item.ResourceWork,clock.ElapsedTicks,busy,i=>!anotherOpen||setup.Bubbles[i].OutputWeight==0,
                    (i,sticky)=>retryOnly?null:Actor(s,item.CustodyRoomId,setup.Bubbles[i],sticky,busy),
                    i=>setup.Bubbles[i].OutputWeight==0?new Dictionary<string,long>():ResourceCargoEconomy.BubbleShare(totals,setup.Bubbles.Select(n=>n.OutputWeight).ToArray(),i).ToDictionary(p=>p.Key,p=>p.Value),
                    (i,outputs)=>{if(outputs.Keys.Any(k=>!supply.ContainsKey(k))||supply.Values.Sum()+outputs.Values.Sum()+reserved>capacity+.000001)return false;foreach(var output in outputs)supply[output.Key]+=output.Value;return true;});
                if(work.Opened&&!work.AllocationHighTierPercent.HasValue)work=new RecipeWorkState(work.Bubbles,work.Committed,work.Outcomes.ToDictionary(p=>p.Key,p=>p.Value),work.Opened,SelectedAllocation(s,item));
                var updated=item.WithResource(work,null);return work.Committed.Count==setup.Bubbles.Count?updated.InCustody(null):updated;
            }).ToList();
            construction=new ConstructionState(supply,s.Construction.Sites,s.Construction.Excavated,s.Construction.Groups,s.Construction.Clearings,s.Construction.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value));return result.AsReadOnly();
        }
        public static CampaignState Retry(CampaignState s)
        {
            var cargo=Advance(s,s.Clock,new HashSet<string>(),s.Cargo,out var construction,true);
            return new CampaignState(s.Base,s.Random,s.Clock,s.Assignments,s.Receiving,s.Transfers,s.Expedition,s.Teams,cargo,s.Personnel,construction, cores: s.Cores, workforce: s.Workforce, completedWork: s.CompletedWork);
        }
        public static long CommittedSupply(CampaignState s,string resource,ISet<string> instances=null)=>s.Cargo.Where(i=>(instances==null||instances.Contains(i.Id))&&IsResource(s,i)&&i.ResourceWork!=null).Sum(i=>i.ResourceWork.Committed.Sum(n=>i.ResourceWork.Outcomes.TryGetValue(n,out var output)&&output.TryGetValue(resource,out long value)?value:0));
        public static void Validate(CampaignState s,RecoveredItem item)
        {
            var d=s.Base.ResourceProcessing;var work=item.ResourceWork;
            if(item.Payload!=d.Payload||item.SourceContainerId!=d.InstanceId||item.SourceMissionId!=s.Base.Mission.Id||work==null||work.Bubbles.Count!=d.Bubbles.Count||work.Committed.Distinct().Count()!=work.Committed.Count||work.Committed.Any(i=>i<0||i>=d.Bubbles.Count)||item.RecoveredTick<0||item.RecoveredTick>s.Clock.ElapsedTicks||item.EquippedUnitId!=null||item.Examination!=null||item.Handling!=null||item.RoomId!=null||item.FieldStageId!=null&&item.FieldStageId!=d.StageId||item.CustodyRoomId!=null&&s.Base.Rooms.Single(r=>r.Id==item.CustodyRoomId).Definition.Id!=d.RoomDefinitionId)throw new InvalidOperationException("Invalid physical resource cargo, work or custody.");
            var expected=Totals(s,item);var actors=new HashSet<string>();
            if(work.AllocationHighTierPercent.HasValue&&(work.AllocationHighTierPercent<0||work.AllocationHighTierPercent>100||!work.Opened))throw new InvalidOperationException("Invalid persisted recovery allocation.");
            if(work.Outcomes.Keys.Any(i=>i<0||i>=d.Bubbles.Count||!work.Bubbles[i].CompletedTick.HasValue)||work.Opened!=work.Bubbles.Where((b,i)=>d.Bubbles[i].OutputWeight>0).Any(b=>b.Ticks>0))throw new InvalidOperationException("Invalid resource outcome history.");
            if(item.CustodyRoomId!=null)
            {
                var room=s.Base.Rooms.Single(r=>r.Id==item.CustodyRoomId);var catalog=RecoveredCargo.Catalog(s);
                var capacity=catalog.Rooms.Single(r=>r.DefinitionId==room.Definition.Id).CapacityByTier[room.ConstructionTier];
                var occupied=s.Cargo.Where(i=>i.CustodyRoomId==room.Id).Sum(i=>(long)catalog.Incoming.Single(t=>t.Id==i.Id).HandlingCost*catalog.Incoming.Single(t=>t.Id==i.Id).Quantity)
                    +s.Receiving.Where(o=>o.RoomId==room.Id&&!s.Cargo.Any(i=>i.Id==o.InstanceId)).Sum(o=>(long)catalog.Incoming.Single(t=>t.Id==o.InstanceId).HandlingCost*catalog.Incoming.Single(t=>t.Id==o.InstanceId).Quantity);
                if(occupied>capacity)throw new InvalidOperationException("Receiving custody capacity is full; source custody retained.");
            }
            for(int i=0;i<work.Bubbles.Count;i++)
            {
                var b=work.Bubbles[i];var node=d.Bubbles[i];
                if(b.Ticks<0||b.Ticks>node.DurationTicks||(b.ActorId==null)!=(b.Ticks==0)||b.CompletedTick.HasValue!=(b.Ticks==node.DurationTicks)||b.CompletedTick>s.Clock.ElapsedTicks||b.ActorId!=null&&!s.Base.Units.Any(u=>u.Id==b.ActorId)||work.Committed.Contains(i)&&!b.CompletedTick.HasValue||b.Ticks>0&&node.DependsOn.Any(id=>!work.Committed.Any(n=>d.Bubbles[n].Id==id)))throw new InvalidOperationException("Invalid resource bubble work/dependency.");
                if(b.CompletedTick.HasValue&&!actors.Add(b.ActorId+"/"+b.CompletedTick))throw new InvalidOperationException("Resource Actor worked twice in one tick.");
                if(b.ActorId!=null)
                {
                    var worker=s.Base.Receiving.Workers.Single(w=>w.UnitId==b.ActorId);
                    if(node.Profession!="UNTRAINED"&&(!worker.Qualifications.TryGetValue(node.Profession,out var tier)||tier<node.MinimumTier)||b.CompletedTick.HasValue&&b.CompletedTick.Value<item.RecoveredTick||b.CompletedTick.HasValue&&node.DependsOn.Any(id=>work.Bubbles[d.Bubbles.ToList().FindIndex(n=>n.Id==id)].CompletedTick>=b.CompletedTick))throw new InvalidOperationException("Invalid resource Actor qualification or work chronology.");
                    if(item.FieldStageId!=null&&node.OutputWeight>0)throw new InvalidOperationException("Resource recovery requires base Receiving custody.");
                }
                if(b.CompletedTick.HasValue){if(!work.Outcomes.TryGetValue(i,out var outcome))throw new InvalidOperationException("Finished work must retain its calculated outcome.");var allocation=node.OutputWeight==0?new Dictionary<string,long>():ResourceCargoEconomy.BubbleShare(expected,d.Bubbles.Select(n=>n.OutputWeight).ToArray(),i);if(outcome.Count!=allocation.Count||outcome.Any(p=>!allocation.TryGetValue(p.Key,out long n)||p.Value!=n))throw new InvalidOperationException("Resource output changed or rerolled.");}
            }
        }
    }
}
