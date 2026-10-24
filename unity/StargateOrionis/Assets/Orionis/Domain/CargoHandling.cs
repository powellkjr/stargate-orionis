using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class HandlingFinding
    {
        public string InstanceId { get; }
        public string Condition { get; }
        public bool OrdinaryStorageSafe { get; }
        public string Observation { get; }
        public HandlingFinding(string id, string condition, bool safe, string observation)
        { InstanceId = id; Condition = condition; OrdinaryStorageSafe = safe; Observation = observation; }
    }
    public sealed class HandlingCatalog
    {
        public string OrdinaryStorageDefinitionId { get; }
        public InspectionStep Step { get; }
        public IReadOnlyList<HandlingFinding> Findings { get; }
        public HandlingCatalog(string storage, InspectionStep step, IEnumerable<HandlingFinding> findings)
        { OrdinaryStorageDefinitionId = storage; Step = step; Findings = findings.ToList().AsReadOnly(); }
    }
    public sealed class HandlingOrder
    {
        public string RoomId { get; }
        public string PrimaryRoomId { get; }
        public string ActorId { get; }
        public long StartedTick { get; }
        public int Ticks { get; }
        public bool Paused { get; }
        public long? CompletedTick { get; }
        public HandlingOrder(string roomId, string primaryRoomId, string actorId, long startedTick, int ticks, bool paused, long? completedTick)
        { RoomId = roomId; PrimaryRoomId = primaryRoomId; ActorId = actorId; StartedTick = startedTick; Ticks = ticks; Paused = paused; CompletedTick = completedTick; }
    }
    public static class CargoHandling
    {
        public static bool Completed(RecoveredItem i) => i.Handling?.CompletedTick != null;
        public static HandlingFinding Finding(CampaignState s, RecoveredItem i)
        {
            var intake = s.Receiving.SingleOrDefault(o => o.InstanceId == i.Id);
            if (!Completed(i) && (intake == null || !ReceivingWork.IsComplete(RecoveredCargo.Catalog(s), intake))) return null;
            return s.Base.Handling?.Findings.SingleOrDefault(f => f.InstanceId == i.Id) ?? s.Base.Processing?.ReceivingFindings.SingleOrDefault(f => f.InstanceId == i.Id);
        }
        public static string Condition(CampaignState s, RecoveredItem i)
        {
            var finding = Finding(s, i); if (finding != null) return finding.Condition;
            var order = s.Receiving.SingleOrDefault(o => o.InstanceId == i.Id); var c = RecoveredCargo.Catalog(s);
            return order == null ? c.Incoming.Single(d => d.Id == i.Id).Condition : ReceivingWork.Condition(c, order);
        }
        public static bool Cleared(CampaignState s, RecoveredItem i) => Finding(s, i)?.OrdinaryStorageSafe == true && Condition(s, i) != "UNKNOWN";
        private static IEnumerable<InspectionWorker> Candidates(CampaignState s, HandlingOrder order)
        {
            var step = s.Base.Handling.Step;
            return RecoveredCargo.Catalog(s).Workers.Where(w => (order.ActorId == null || w.UnitId == order.ActorId) &&
                s.Assignments.Any(a => a.UnitId == w.UnitId && RoomGroups.Contains(s, order.RoomId, a.RoomInstanceId)) && !Expeditions.IsIncapacitated(s, w.UnitId) && !RoomConstruction.ReservesActor(s, w.UnitId) &&
                w.Qualifications.TryGetValue(step.Profession, out var tier) && tier >= step.MinimumTier &&
                (step.ToolService == null || PersonnelCondition.HasToolService(s, w.UnitId, step.ToolService))).OrderBy(w => RoomGroups.ActorPriority(s, order.RoomId, w.UnitId)).ThenBy(w => w.UnitId, StringComparer.Ordinal);
        }
        private static bool Ready(CampaignState s, RecoveredItem item)
        {
            var o = item.Handling; if (o == null || Completed(item) || o.Paused) return false;
            var room = s.Base.Rooms.Single(r => r.Id == o.RoomId); var step = s.Base.Handling.Step;
            return (step.RoomService == null || RoomGroups.HasService(s, o.RoomId, step.RoomService)) && Candidates(s, o).Any();
        }
        public static string Status(CampaignState s, RecoveredItem item)
        {
            if (item.Handling == null) return "No handling review started. Unknown condition requires Containment.";
            if (Completed(item)) return Finding(s, item).Observation;
            if (item.Handling.Paused) return "Handling review paused; work and Containment reservation retained.";
            var room = s.Base.Rooms.Single(r => r.Id == item.Handling.RoomId);
            var step = s.Base.Handling.Step; var profile = s.Base.Receiving.Rooms.Single(p => p.DefinitionId == room.Definition.Id);
            if (step.RoomService != null && !RoomGroups.HasService(s, item.Handling.RoomId, step.RoomService)) return "Waiting for local Room Service: " + step.RoomService;
            return Candidates(s, item.Handling).Any() ? "Ready for the next tick. Containment remains reserved." : "Waiting for the original/qualifying local Actor with equipped " + step.ToolService + ".";
        }
        public static CampaignState Start(CampaignState s, string id, string roomId)
        {
            var item = s.Cargo.Single(i => i.Id == id); var catalog = s.Base.Handling;
            var primary = s.Base.Rooms.SingleOrDefault(r => r.Id == item.RoomId);
            var order = s.Receiving.SingleOrDefault(o => o.InstanceId == id);
            if (catalog == null || !catalog.Findings.Any(f => f.InstanceId == id) || item.Handling != null || item.EquippedUnitId != null || CargoExamination.Active(item) || order == null ||
                !ReceivingWork.IsComplete(RecoveredCargo.Catalog(s), order) || primary == null ||
                s.Base.Storage?.Find(primary.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("CC")) != true)
                throw new InvalidOperationException("Handling review requires completed Receiving, compatible Containment and authored assessment facts.");
            var work = new HandlingOrder(roomId, primary.Id, null, s.Clock.ElapsedTicks, 0, false, null);
            return RecoveredCargo.Replace(s, s.Cargo.Select(i => i == item ? i.WithHandling(work).InCustody(roomId) : i));
        }
        public static CampaignState Pause(CampaignState s, string id, bool paused)
        {
            var item = s.Cargo.Single(i => i.Id == id); var o = item.Handling;
            if (o == null || Completed(item)) throw new InvalidOperationException("No active handling review.");
            var next = new HandlingOrder(o.RoomId, o.PrimaryRoomId, o.ActorId, o.StartedTick, o.Ticks, paused, null);
            return RecoveredCargo.Replace(s, s.Cargo.Select(i => i == item ? i.WithHandling(next) : i));
        }
        internal static IReadOnlyList<RecoveredItem> Advance(CampaignState s, CampaignClock clock, ISet<string> busy)
        {
            return s.Cargo.OrderBy(i => i.Id, StringComparer.Ordinal).Select(item =>
            {
                var o = item.Handling;
                if (!Ready(s, item)) return item;
                var actor = Candidates(s, o).FirstOrDefault(w => !busy.Contains(w.UnitId)); if (actor == null) return item;
                busy.Add(actor.UnitId); var ticks = o.Ticks + 1; bool complete = ticks == s.Base.Handling.Step.DurationTicks;
                var next = item.WithHandling(new HandlingOrder(o.RoomId, o.PrimaryRoomId, actor.UnitId, o.StartedTick, ticks, false, complete ? clock.ElapsedTicks : (long?)null));
                return complete ? next.At(o.PrimaryRoomId) : next;
            }).ToList().AsReadOnly();
        }
        public static void Validate(CampaignState s, RecoveredItem item)
        {
            var o = item.Handling; if (o == null) return;
            var catalog = s.Base.Handling ?? throw new InvalidOperationException("Handling definitions are missing.");
            var step = catalog.Step;
            var room = s.Base.Rooms.SingleOrDefault(r => r.Id == o.RoomId);
            var primary = s.Base.Rooms.SingleOrDefault(r => r.Id == o.PrimaryRoomId);
            var admission = s.Base.Receiving.Rooms.SingleOrDefault(p => p.DefinitionId == room?.Definition.Id);
            if (!catalog.Findings.Any(f => f.InstanceId == item.Id) || room == null || primary == null || room.Id == primary.Id ||
                admission?.Capabilities.Contains(s.Base.Receiving.RequiredCapability) != true ||
                s.Base.Storage?.Find(primary.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("CC")) != true ||
                o.StartedTick < item.RecoveredTick || o.StartedTick > s.Clock.ElapsedTicks || o.Ticks < 0 || o.Ticks > step.DurationTicks ||
                o.Ticks > s.Clock.ElapsedTicks - o.StartedTick || (o.Ticks == 0) != (o.ActorId == null) ||
                Completed(item) != (o.Ticks == step.DurationTicks) || o.CompletedTick > s.Clock.ElapsedTicks ||
                o.CompletedTick < o.StartedTick + step.DurationTicks || Completed(item) && o.Paused ||
                !Completed(item) && (item.CustodyRoomId != room.Id || item.RoomId != primary.Id))
                throw new InvalidOperationException("Invalid handling work, process custody or primary Containment reservation.");
            if (o.ActorId != null && !s.Base.Receiving.Workers.Any(w => w.UnitId == o.ActorId &&
                w.Qualifications.TryGetValue(step.Profession, out var tier) && tier >= step.MinimumTier))
                throw new InvalidOperationException("Invalid sticky handling Actor.");
            var work = s.Receiving.SingleOrDefault(w => w.InstanceId == item.Id);
            if (work == null || !ReceivingWork.IsComplete(RecoveredCargo.Catalog(s), work)) throw new InvalidOperationException("Handling review lacks completed intake.");
            long intakeTicks = work.Progress.Sum(p => (long)p.Ticks);
            if (o.StartedTick < item.RecoveredTick + intakeTicks) throw new InvalidOperationException("Handling review predates intake work.");
            long receivingUse = s.Cargo.Where(i => i.CustodyRoomId == room.Id).Sum(i => { var d = RecoveredCargo.Catalog(s).Incoming.Single(x => x.Id == i.Id); return (long)d.HandlingCost * d.Quantity; });
            receivingUse += s.Receiving.Where(w => w.RoomId == room.Id && !s.Cargo.Any(i => i.Id == w.InstanceId)).Sum(w => { var d = s.Base.Receiving.Incoming.Single(x => x.Id == w.InstanceId); return (long)d.HandlingCost * d.Quantity; });
            if (receivingUse > admission.CapacityByTier[room.ConstructionTier]) throw new InvalidOperationException("Receiving has no available handling capacity.");
        }
    }
}
