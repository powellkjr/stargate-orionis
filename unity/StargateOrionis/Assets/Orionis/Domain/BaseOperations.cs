using System;
using System.Collections.Generic;
using System.Linq;
namespace Orionis.Domain
{
    public sealed class BaseOperation
    {
        public string Kind,Id,RoomId,Name,Status,Actors,RunId;
        public long? StartedTick,CompletedTick;
        public bool Historical;
        public long Progress,Total;
        public bool Complete,Paused,CanPause;
    }
    public sealed class CompletedOperation
    {
        public string Key {get;} public string Kind {get;} public string Id {get;} public string RunId {get;} public string RoomId {get;} public string Name {get;} public string Actors {get;} public long? StartedTick {get;} public long? CompletedTick {get;} public long Total {get;}
        public CompletedOperation(string key,string kind,string id,string runId,string roomId,string name,string actors,long? startedTick,long? completedTick,long total){Key=key;Kind=kind;Id=id;RunId=runId;RoomId=roomId;Name=name;Actors=actors;StartedTick=startedTick;CompletedTick=completedTick;Total=total;}
        public BaseOperation Operation()=>new BaseOperation{Kind=Kind,Id=Id,RunId=RunId,RoomId=RoomId,Name=Name,Actors=Actors,StartedTick=StartedTick,CompletedTick=CompletedTick,Total=Total,Progress=Total,Complete=true,Historical=true,Status=CompletedTick.HasValue?"Completed at tick "+CompletedTick.Value:"Completed / imported history; time unavailable"};
    }
    public static class BaseOperations
    {
        private static string Actors(CampaignState s,string room,IEnumerable<string> ids,bool complete=false)=>string.Join("; ",ids.Where(id=>id!=null).Distinct().Select(id=>s.Base.Units.Single(u=>u.Id==id).Name+(complete?"":" / "+BaseWork.Source(s,room,id))));
        public static string Key(BaseOperation job)=>job.Kind+"/"+job.Id+"/"+job.RunId;
        public static IReadOnlyList<CompletedOperation> Capture(CampaignState s,IEnumerable<CompletedOperation> previous)
        {
            var history=previous.ToList();var keys=history.Select(h=>h.Key).ToHashSet();
            foreach(var job in LiveJobs(s).Where(j=>j.Complete))if(keys.Add(Key(job)))history.Add(new CompletedOperation(Key(job),job.Kind,job.Id,job.RunId,job.RoomId,job.Name,job.Actors,job.StartedTick,job.CompletedTick,job.Total));
            return history.AsReadOnly();
        }
        public static IReadOnlyList<BaseOperation> Jobs(CampaignState s)=>LiveJobs(s).Where(j=>!j.Complete).Concat(s.CompletedWork.Select(h=>h.Operation())).OrderBy(j=>j.Complete).ThenByDescending(j=>j.Complete?j.CompletedTick:j.StartedTick).ThenBy(j=>j.Kind,StringComparer.Ordinal).ThenBy(j=>j.Id,StringComparer.Ordinal).ToArray();
        public static void ValidateHistory(CampaignState s)
        {
            if(s.CompletedWork.Any(h=>h==null)||s.CompletedWork.Select(h=>h.Key).Distinct().Count()!=s.CompletedWork.Count)throw new InvalidOperationException("Duplicate completed-work journal entry.");
            foreach(var h in s.CompletedWork)if(string.IsNullOrEmpty(h.Id)||string.IsNullOrEmpty(h.RunId)||string.IsNullOrEmpty(h.Name)||h.Key!=h.Kind+"/"+h.Id+"/"+h.RunId||!new[]{"receiving","resource","handling","analysis","construction","clearing","core"}.Contains(h.Kind)||h.Total<0||h.StartedTick<0||h.StartedTick>s.Clock.ElapsedTicks||h.CompletedTick<0||h.CompletedTick>s.Clock.ElapsedTicks||h.CompletedTick<h.StartedTick)throw new InvalidOperationException("Invalid completed-work journal record.");
        }
        private static IReadOnlyList<BaseOperation> LiveJobs(CampaignState s)
        {
            var jobs=new List<BaseOperation>();
            foreach(var o in s.Receiving)
            {bool complete=ReceivingWork.IsComplete(RecoveredCargo.Catalog(s),o);jobs.Add(new BaseOperation{Kind="receiving",Id=o.InstanceId,RunId=o.StartedTick?.ToString()??"legacy",StartedTick=o.StartedTick,CompletedTick=o.CompletedTick,RoomId=o.RoomId,Name="Receiving / "+(complete?RecoveredCargo.Catalog(s).Incoming.Single(i=>i.Id==o.InstanceId).ReceivingName:RecoveredCargo.Catalog(s).Incoming.Single(i=>i.Id==o.InstanceId).InitialName),Status=ReceivingWork.BlockedReason(s,o),Progress=o.Progress.Sum(p=>(long)p.Ticks),Total=RecoveredCargo.Catalog(s).Steps.Sum(n=>(long)n.DurationTicks),Complete=complete,Paused=o.Paused,CanPause=!complete,Actors=Actors(s,o.RoomId,o.Progress.Select(p=>p.ActorId),complete)});}
            foreach(var item in s.Cargo)
            {
                if(ResourceCargo.IsResource(s,item)&&item.FieldStageId==null)
                    jobs.Add(new BaseOperation{Kind="resource",Id=item.Id,RunId=item.RecoveredTick.ToString(),StartedTick=item.RecoveredTick,CompletedTick=ResourceCargo.Consumed(s,item)?item.ResourceWork.Bubbles.Max(b=>b.CompletedTick):null,RoomId=item.CustodyRoomId??s.Base.Rooms.First(r=>r.Definition.Id==s.Base.ResourceProcessing.RoomDefinitionId).Id,Name=ResourceCargo.Name(s,item),Status=ResourceCargo.BlockedReason(s,item),Progress=item.ResourceWork.Bubbles.Sum(b=>(long)b.Ticks),Total=s.Base.ResourceProcessing.Bubbles.Sum(n=>(long)n.DurationTicks),Complete=ResourceCargo.Consumed(s,item),Actors=Actors(s,item.CustodyRoomId,item.ResourceWork.Bubbles.Select(b=>b.ActorId),ResourceCargo.Consumed(s,item))});
                if(item.Handling!=null){var o=item.Handling;jobs.Add(new BaseOperation{Kind="handling",RunId=o.StartedTick.ToString(),StartedTick=o.StartedTick,CompletedTick=o.CompletedTick,Id=item.Id,RoomId=o.RoomId,Name="Handling / "+RecoveredCargo.Name(s,item),Status=CargoHandling.Status(s,item),Progress=o.Ticks,Total=s.Base.Handling.Step.DurationTicks,Complete=CargoHandling.Completed(item),Paused=o.Paused,CanPause=!CargoHandling.Completed(item),Actors=Actors(s,o.RoomId,new[]{o.ActorId},CargoHandling.Completed(item))});}
                if(item.Examination!=null){var o=item.Examination;jobs.Add(new BaseOperation{Kind="analysis",RunId=o.StartedTick.ToString(),StartedTick=o.StartedTick,CompletedTick=o.CompletedTick,Id=item.Id,RoomId=o.RoomId,Name="Analysis / "+RecoveredCargo.Name(s,item),Status=CargoExamination.Status(s,item),Progress=o.Ticks,Total=s.Base.Processing.Step.DurationTicks,Complete=CargoExamination.Completed(item),Paused=o.Paused,CanPause=!CargoExamination.Completed(item),Actors=Actors(s,o.RoomId,new[]{o.ActorId},CargoExamination.Completed(item))});}
            }
            if(s.Construction!=null)
            {
                foreach(var o in s.Construction.Sites)jobs.Add(new BaseOperation{Kind="construction",RunId=o.StartedTick.ToString() + "/ct"+o.Tier,StartedTick=o.StartedTick,CompletedTick=o.CompletedTick,Id=o.RoomId,RoomId=o.MaintenanceRoomId,Name=s.Base.Planning.Rooms.Single(p=>p.Room.Id==o.DefinitionId).Room.Name+" / CT"+o.Tier,Status=o.Completed?"Complete":o.Paused?"Paused":RoomConstruction.RuntimeBlocker(s,o)??"Ready / next tick",Progress=o.WorkedTicks,Total=o.DurationTicks,Complete=o.Completed,Paused=o.Paused,CanPause=!o.Completed,Actors=Actors(s,o.MaintenanceRoomId,o.Bubbles.Count>0?o.Bubbles.Where(b=>!b.CompletedTick.HasValue).Select(b=>b.ActorId):new[]{o.ActorId,o.SecurityActorId},o.Completed)});
                foreach(var o in s.Construction.Clearings){string room=s.Base.Rooms.First(r=>r.Definition.Id==s.Base.Construction.MaintenanceDefinition).Id;jobs.Add(new BaseOperation{Kind="clearing",RunId=o.StartedTick.ToString(),StartedTick=o.StartedTick,CompletedTick=o.CompletedTick,Id=o.Cell,RoomId=room,Name="Clear rock / "+o.Cell,Status=o.Completed?"Complete":TerrainClearing.AvailableActors(s).Any()?"Ready / next tick":"Waiting for Maintenance or Local Response staff",Progress=o.Bubbles.Sum(b=>(long)b.Ticks),Total=TerrainClearing.WorkBubbles(s,o).Sum(n=>(long)n.DurationTicks),Complete=o.Completed,Actors=Actors(s,room,o.Bubbles.Where(b=>!b.CompletedTick.HasValue).Select(b=>b.ActorId),o.Completed)});}
            }
            if(s.Cores!=null)foreach(var o in s.Cores.Orders)jobs.Add(new BaseOperation{Kind="core",RunId=o.StartedTick.ToString(),StartedTick=o.StartedTick,CompletedTick=o.CompletedTick,Id=o.CoreId,RoomId=o.RoomId,Name=(o.Installing?"Install ":"Remove ")+RoomCores.Definition(s,s.Cores.Instances.Single(c=>c.Id==o.CoreId)).Name,Status=RoomCores.BlockedReason(s,o),Progress=o.Work.Bubbles.Sum(b=>(long)b.Ticks),Total=s.Base.Cores.Installation.Sum(n=>(long)n.DurationTicks),Complete=o.CompletedTick.HasValue,Actors=Actors(s,o.RoomId,o.Work.Bubbles.Select(b=>b.ActorId),o.CompletedTick.HasValue)});
            return jobs;
        }
    }
}
