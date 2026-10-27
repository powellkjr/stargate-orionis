using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class RoomCoreDefinition
    {
        public string Id,Name,Kind,Policy;
        public int MinimumCT,IdlePower,ActivePower,HighTierPercent;
        public string[] Tags,Services,Sizes;
    }
    public sealed class RoomCoreCatalog
    {
        public IReadOnlyList<RoomCoreDefinition> Definitions;
        public IReadOnlyList<RecipeBubble> Installation;
        public IReadOnlyList<CoreInstance> Starters;
        public IReadOnlyDictionary<string,double> RoomPower;
        public IReadOnlyDictionary<int,double> TierPower;
        public IReadOnlyDictionary<int,int> ReceivingSlots;
        public IReadOnlyDictionary<string,string[]> RecoveryPreferences,HandlingPreferences;
        public int GeneratorOutput,T0HighTierPercent;
        public string GeneratorDefinitionId;
        public IReadOnlyDictionary<string,string[]> RoomTags;
        public IReadOnlyDictionary<string,int> ToolCharges;
    }
    // Physical Core instances use the approved installed-equipment storage exception.
    // An installed instance has a physical-room slot; an uninstalled one has a Warehouse place.
    public sealed class CoreInstance
    {
        public string Id {get;}
        public string DefinitionId {get;}
        public string RoomId {get;}
        public int? Slot {get;}
        public string WarehouseId {get;}
        public CoreInstance(string id,string definitionId,string roomId,int? slot,string warehouseId)
        {Id=id;DefinitionId=definitionId;RoomId=roomId;Slot=slot;WarehouseId=warehouseId;}
    }
    public sealed class CoreOrder
    {
        public string CoreId {get;}
        public string RoomId {get;}
        public int Slot {get;}
        public string WarehouseId {get;}
        public bool Installing {get;}
        public long StartedTick {get;}
        public long? CompletedTick {get;}
        public RecipeWorkState Work {get;}
        public CoreOrder(string coreId,string roomId,int slot,string warehouseId,bool installing,long startedTick,RecipeWorkState work,long? completedTick=null)
        {CoreId=coreId;RoomId=roomId;Slot=slot;WarehouseId=warehouseId;Installing=installing;StartedTick=startedTick;Work=work;CompletedTick=completedTick;}
    }
    public sealed class RoomCoreState
    {
        public IReadOnlyList<CoreInstance> Instances {get;}
        public IReadOnlyList<CoreOrder> Orders {get;}
        public RoomCoreState(IEnumerable<CoreInstance> instances,IEnumerable<CoreOrder> orders)
        {Instances=(instances??throw new ArgumentNullException(nameof(instances))).ToList().AsReadOnly();Orders=(orders??throw new ArgumentNullException(nameof(orders))).ToList().AsReadOnly();}
    }
    public static class RoomCores
    {
        public static RoomCoreState Seed(BootstrapData data)=>data.Cores==null?null:new RoomCoreState(data.Cores.Starters.Where(c=>data.Rooms.Any(r=>r.Id==c.RoomId)),Array.Empty<CoreOrder>());
        public static RoomCoreDefinition Definition(CampaignState s,CoreInstance c)=>s.Base.Cores.Definitions.Single(d=>d.Id==c.DefinitionId);
        public static int Capacity(CampaignState s,string room)
        {
            var r=s.Base.Rooms.Single(x=>x.Id==room);
            return r.Definition.Id=="receiving"?s.Base.Cores.ReceivingSlots[r.ConstructionTier]:s.Base.Planning?.Rooms.SingleOrDefault(p=>p.Room.Id==r.Definition.Id)?.Construction[r.ConstructionTier].Components.Where(c=>c.Kind=="coreSlots").Sum(c=>c.Places)??0;
        }
        public static bool Compatible(CampaignState s,CoreInstance c,string room)
        {
            var r=s.Base.Rooms.Single(x=>x.Id==room);var d=Definition(s,c);
            return r.ConstructionTier>=d.MinimumCT && s.Base.Cores.RoomTags.TryGetValue(r.Definition.Id,out var tags)&&d.Tags.Any(tags.Contains);
        }
        public static double RoomPower(BootstrapData data,string id,int tier)=>data.Cores.RoomPower[id]*data.Cores.TierPower[tier];
        public static double Generated(CampaignState s)=>s.Base.Cores==null?0:s.Base.Rooms.Count(r=>r.Definition.Id==s.Base.Cores.GeneratorDefinitionId)*s.Base.Cores.GeneratorOutput;
        public static double BasePower(CampaignState s)=>s.Base.Cores==null?0:s.Base.Rooms.Sum(r=>RoomPower(s.Base,r.Definition.Id,r.ConstructionTier))+(s.Construction?.Sites.Where(o=>!o.Completed).Sum(o=>RoomPower(s.Base,o.DefinitionId,o.Tier)-(o.FromTier.HasValue?RoomPower(s.Base,o.DefinitionId,o.FromTier.Value):0))??0);
        public static double Reserved(CampaignState s)=>s.Cores==null?0:BasePower(s)+s.Cores.Instances.Where(c=>c.RoomId!=null).Sum(c=>Definition(s,c).ActivePower)+s.Cores.Orders.Where(o=>!o.CompletedTick.HasValue&&o.Installing).Sum(o=>Definition(s,s.Cores.Instances.Single(c=>c.Id==o.CoreId)).ActivePower);
        public static int WarehouseReserved(CampaignState s,string room)=>s.Cores==null?0:s.Cores.Instances.Count(c=>c.WarehouseId==room)+s.Cores.Orders.Count(o=>!o.CompletedTick.HasValue&&!o.Installing&&o.WarehouseId==room);
        public static long WarehouseUsed(CampaignState s,string room)=>WarehouseReserved(s,room)+s.Cargo.Where(i=>i.RoomId==room).Sum(i=>(long)s.Base.Cargo.Items.Single(d=>d.Id==i.Id).Quantity);
        public static bool Reconfiguring(CampaignState s,string room)=>s.Cores?.Orders.Any(o=>!o.CompletedTick.HasValue&&o.RoomId==room)==true;
        public static bool ActiveItem(CampaignState s,string room)=>s.Cargo.Any(i=>i.CustodyRoomId==room&&ResourceCargo.IsResource(s,i)&&i.ResourceWork?.Opened==true&&!ResourceCargo.Consumed(s,i))||s.Receiving.Any(o=>o.RoomId==room&&o.Progress.Any(p=>p.Ticks>0)&&!ReceivingWork.IsComplete(RecoveredCargo.Catalog(s),o));
        public static bool HoldsNewWork(CampaignState s,string room)=>Reconfiguring(s,room)&&!ActiveItem(s,room);
        private static CampaignState Replace(CampaignState s,RoomCoreState cores,IEnumerable<PersonnelRecord> people=null)=>new CampaignState(s.Base,s.Random,s.Clock,s.Assignments,s.Receiving,s.Transfers,s.Expedition,s.Teams,s.Cargo,people??s.Personnel,s.Construction,cores, workforce: s.Workforce, completedWork: s.CompletedWork);
        public static CampaignState Request(CampaignState s,string coreId,string roomId=null)
        {
            var c=s.Cores?.Instances.SingleOrDefault(x=>x.Id==coreId)??throw new InvalidOperationException("Choose owned equipment.");
            if(s.Cores.Orders.Any(o=>!o.CompletedTick.HasValue&&(o.CoreId==coreId||o.RoomId==(roomId??c.RoomId))))throw new InvalidOperationException("This Core or physical room already has queued reconfiguration.");
            bool install=c.RoomId==null;string room=install?roomId:c.RoomId;
            if(room==null||!Compatible(s,c,room))throw new InvalidOperationException("Core is incompatible with this room or construction tier.");
            int slot=install?Enumerable.Range(0,Capacity(s,room)).Where(i=>!s.Cores.Instances.Any(x=>x.RoomId==room&&x.Slot==i)).DefaultIfEmpty(-1).First():c.Slot.Value;
            if(slot<0)throw new InvalidOperationException("No removable Core slot available in this physical room.");
            string warehouse=install?c.WarehouseId:s.Base.Rooms.Where(r=>r.Definition.Id==s.Base.Handling.OrdinaryStorageDefinitionId).Where(r=>WarehouseUsed(s,r.Id)<s.Base.Storage.Find(r.Definition.Id).CapacityByTier[r.ConstructionTier]).Select(r=>r.Id).FirstOrDefault();
            if(warehouse==null)throw new InvalidOperationException("Uninstall needs a free Warehouse place; installed equipment is retained.");
            var empty=new RecipeWorkState(s.Base.Cores.Installation.Select(_=>new ClearingBubbleWork(null,0,null)));
            var order=new CoreOrder(c.Id,room,slot,warehouse,install,s.Clock.ElapsedTicks,empty);
            return Replace(s,new RoomCoreState(s.Cores.Instances,s.Cores.Orders.Append(order)));
        }
        private static IEnumerable<InspectionWorker> Candidates(CampaignState s,string room,RecipeBubble node,string sticky=null)=>BaseWork.Workers(s,room,node.Profession,node.MinimumTier,sticky).Where(w=>!RoomConstruction.ReservesActor(s,w.UnitId));
        private static bool Tool(CampaignState s,string room,string unit,RecipeBubble node)=>BaseWork.HasTool(s,room,unit,node.ToolService,s.Base.Cores.ToolCharges[node.Id]);
        public static string BlockedReason(CampaignState s,CoreOrder o)
        {
            if(o.CompletedTick.HasValue)return "Complete";
            if(ActiveItem(s,o.RoomId))return "Queued: waiting for the active item to finish.";
            int i=Enumerable.Range(0,s.Base.Cores.Installation.Count).First(n=>!o.Work.Committed.Contains(n));var node=s.Base.Cores.Installation[i];var candidates=Candidates(s,o.RoomId,node,o.Work.Bubbles[i].ActorId).ToList();
            if(candidates.Count==0)return node.Profession=="UNTRAINED"?"Waiting for local staff (any profession).":"Waiting for local "+node.Profession+" staff.";
            if(!candidates.Any(w=>Tool(s,o.RoomId,w.UnitId,node)))return "Waiting for charged equipped "+node.ToolService+".";
            return "Working: "+node.Id+" / next tick";
        }
        public static CampaignState Advance(CampaignState s,ISet<string> busy)
        {
            if(s.Cores==null)return s;var instances=s.Cores.Instances.ToList();var orders=s.Cores.Orders.ToList();var people=s.Personnel.ToList();bool changed=false;
            foreach(var o in s.Cores.Orders.Where(o=>!o.CompletedTick.HasValue))
            {
                if(ActiveItem(s,o.RoomId))continue;
                var work=BubbleExecution.Advance(s.Base.Cores.Installation,o.Work,s.Clock.ElapsedTicks,busy,i=>true,(i,sticky)=>Candidates(s,o.RoomId,s.Base.Cores.Installation[i],sticky).Where(w=>!busy.Contains(w.UnitId)&&Tool(s,o.RoomId,w.UnitId,s.Base.Cores.Installation[i])).Select(w=>w.UnitId).FirstOrDefault(),i=>new Dictionary<string,long>(),(i,outputs)=>true);
                if(work.Committed.Count==o.Work.Committed.Count)continue;
                changed=true;
                foreach(int i in work.Committed.Except(o.Work.Committed).Where(i=>s.Base.Cores.Installation[i].ToolService!=null))
                {
                    string actor=work.Bubbles[i].ActorId,service=s.Base.Cores.Installation[i].ToolService;if(!BaseWork.PersonalTool(s,actor,service,s.Base.Cores.ToolCharges[s.Base.Cores.Installation[i].Id]))continue;var tool=PersonnelCondition.Tools(s,actor).First(t=>!t.Damaged&&t.Services.Contains(service)&&t.Charges>=s.Base.Cores.ToolCharges[s.Base.Cores.Installation[i].Id]);
                    var record=new PersonnelRecord(actor,PersonnelCondition.Health(s,actor),PersonnelCondition.Stamina(s,actor),PersonnelCondition.Endurance(s,actor),PersonnelCondition.Tools(s,actor).Select(t=>t.InstanceId==tool.InstanceId?new ExpeditionTool(t.InstanceId,t.KitId,t.Slot,t.Charges-s.Base.Cores.ToolCharges[s.Base.Cores.Installation[i].Id],t.Damaged,t.Label,t.Tier,t.Services):t),PersonnelRecovery.Bed(s,actor));
                    people.RemoveAll(p=>p.UnitId==actor);people.Add(record);
                }
                bool complete=work.Committed.Count==s.Base.Cores.Installation.Count;
                orders[orders.IndexOf(o)]=new CoreOrder(o.CoreId,o.RoomId,o.Slot,o.WarehouseId,o.Installing,o.StartedTick,work,complete?s.Clock.ElapsedTicks:(long?)null);
                if(complete){var c=instances.Single(c=>c.Id==o.CoreId);instances[instances.IndexOf(c)]=new CoreInstance(c.Id,c.DefinitionId,o.Installing?o.RoomId:null,o.Installing?o.Slot:(int?)null,o.Installing?null:o.WarehouseId);}
            }
            return changed?Replace(s,new RoomCoreState(instances,orders),people):s;
        }
        public static CoreInstance Provider(CampaignState s,string room,string item,string kind)
        {
            if(s.Cores==null)return null;var prefs=kind=="HANDLING"?s.Base.Cores.HandlingPreferences:s.Base.Cores.RecoveryPreferences;
            if(!prefs.TryGetValue(item,out var services))return null;
            foreach(var service in services)foreach(var child in RoomGroups.Members(s,room))
            {var provider=s.Cores.Instances.Where(c=>c.RoomId==child&&Definition(s,c).Services.Contains(service)).OrderBy(c=>c.Slot).FirstOrDefault();if(provider!=null)return provider;}
            return null;
        }
        public static string HandlingBlocker(CampaignState s,string room)
        {
            if(s.Cores==null||s.Base.ResourceProcessing.LegacyHandling)return null;
            string size=ResourceCargoEconomy.Band(s.Base.CargoEconomy.SizeBands,s.Base.ResourceProcessing.Bubbles.Count).Id;
            if(size=="SMALL")return null;
            var provider=Provider(s,room,s.Base.ResourceProcessing.ItemId,"HANDLING");
            return provider!=null&&Definition(s,provider).Sizes.Contains(size)?null:"Waiting for installed "+size+" handling equipment.";
        }
        public static double ActualPower(CampaignState s)
        {
            if(s.Cores==null)return 0;var active=new HashSet<string>();
            foreach(var item in s.Cargo.Where(i=>ResourceCargo.IsResource(s,i)&&i.CustodyRoomId!=null&&i.ResourceWork!=null))
            {
                var indices=Enumerable.Range(0,item.ResourceWork.Bubbles.Count).Where(i=>item.ResourceWork.Bubbles[i].CompletedTick==s.Clock.ElapsedTicks).ToArray();
                if(indices.Length==0)continue;
                var handling=Provider(s,item.CustodyRoomId,s.Base.ResourceProcessing.ItemId,"HANDLING");if(handling!=null)active.Add(handling.Id);
                if(indices.Any(i=>s.Base.ResourceProcessing.Bubbles[i].OutputWeight>0)){var recovery=Provider(s,item.CustodyRoomId,s.Base.ResourceProcessing.ItemId,"RECOVERY");if(recovery!=null)active.Add(recovery.Id);}
            }
            return s.Base.Rooms.Sum(r=>RoomPower(s.Base,r.Definition.Id,r.ConstructionTier))+s.Cores.Instances.Where(c=>c.RoomId!=null).Sum(c=>active.Contains(c.Id)?Definition(s,c).ActivePower:Definition(s,c).IdlePower);
        }
        public static void Validate(CampaignState s)
        {
            if(s.Base.Cores==null){if(s.Cores!=null)throw new InvalidOperationException("Missing Core definitions.");return;}
            if(s.Cores==null||s.Cores.Instances.Any(c=>c==null)||s.Cores.Instances.Select(c=>c.Id).Distinct().Count()!=s.Cores.Instances.Count)throw new InvalidOperationException("Invalid physical Core identities.");
            var owned=s.Base.Cores.Starters.Where(c=>s.Base.Rooms.Any(r=>r.Id==c.RoomId)).OrderBy(c=>c.Id).ToArray();
            if(!s.Cores.Instances.OrderBy(c=>c.Id).Select(c=>c.Id+"/"+c.DefinitionId).SequenceEqual(owned.Select(c=>c.Id+"/"+c.DefinitionId)))throw new InvalidOperationException("Core ownership changed without an authored acquisition transition.");
            var occupied=new HashSet<string>();
            foreach(var c in s.Cores.Instances)
            {
                if(string.IsNullOrWhiteSpace(c.Id)||!s.Base.Cores.Definitions.Any(d=>d.Id==c.DefinitionId))throw new InvalidOperationException("Unknown physical Core definition.");
                if(c.RoomId!=null){if(c.WarehouseId!=null||!c.Slot.HasValue||c.Slot<0||c.Slot>=Capacity(s,c.RoomId)||!Compatible(s,c,c.RoomId)||!occupied.Add(c.RoomId+"/"+c.Slot))throw new InvalidOperationException("Invalid physical Core slot or compatibility.");}
                else if(c.Slot.HasValue||!s.Base.Rooms.Any(r=>r.Id==c.WarehouseId&&r.Definition.Id==s.Base.Handling.OrdinaryStorageDefinitionId))throw new InvalidOperationException("Uninstalled Core requires validated Warehouse storage.");
            }
            var active=new HashSet<string>();var rooms=new HashSet<string>();
            foreach(var o in s.Cores.Orders)
            {
                var c=s.Cores.Instances.SingleOrDefault(c=>c.Id==o.CoreId);
                if(c==null||o.Work==null||o.Work.Bubbles.Count!=s.Base.Cores.Installation.Count||o.StartedTick<0||o.StartedTick>s.Clock.ElapsedTicks||o.CompletedTick>s.Clock.ElapsedTicks||o.Work.Committed.Distinct().Count()!=o.Work.Committed.Count||o.Work.Outcomes.Any(p=>p.Value.Count>0)||o.Work.Committed.Any(i=>i<0||i>=o.Work.Bubbles.Count))throw new InvalidOperationException("Invalid Core Recipe record.");
                for(int i=0;i<o.Work.Bubbles.Count;i++){var b=o.Work.Bubbles[i];var node=s.Base.Cores.Installation[i];bool done=o.Work.Committed.Contains(i);if(b==null||b.Ticks<0||b.Ticks>node.DurationTicks||(b.Ticks==0)!=(b.ActorId==null)||done!=(b.Ticks==node.DurationTicks)||done!=b.CompletedTick.HasValue||b.CompletedTick>s.Clock.ElapsedTicks||b.CompletedTick<=o.StartedTick||b.ActorId!=null&&!s.Base.Units.Any(u=>u.Id==b.ActorId)||node.DependsOn.Any(id=>!o.Work.Committed.Contains(s.Base.Cores.Installation.ToList().FindIndex(n=>n.Id==id)))&&b.Ticks>0)throw new InvalidOperationException("Invalid Core bubble work/dependencies.");}
                if(o.CompletedTick.HasValue!=(o.Work.Committed.Count==s.Base.Cores.Installation.Count))throw new InvalidOperationException("Core completion state disagrees with Recipe.");
                if(o.CompletedTick.HasValue)continue;
                if(!active.Add(o.CoreId)||!rooms.Add(o.RoomId)||o.Slot<0||o.Slot>=Capacity(s,o.RoomId)||!Compatible(s,c,o.RoomId)||o.Installing&&(c.RoomId!=null||c.WarehouseId!=o.WarehouseId||!occupied.Add(o.RoomId+"/"+o.Slot))||!o.Installing&&(c.RoomId!=o.RoomId||c.Slot!=o.Slot))throw new InvalidOperationException("Invalid Core reconfiguration reservation.");
            }
            foreach(var r in s.Base.Rooms.Where(r=>r.Definition.Id==s.Base.Handling?.OrdinaryStorageDefinitionId))if(WarehouseUsed(s,r.Id)>s.Base.Storage.Find(r.Definition.Id).CapacityByTier[r.ConstructionTier])throw new InvalidOperationException("Warehouse item places are full (including Core reservations).");
            if(Reserved(s)>Generated(s)+.000001)throw new InvalidOperationException("Insufficient PWR: maximum active equipment/room capacity must be reserved before admission.");
        }
    }
}
