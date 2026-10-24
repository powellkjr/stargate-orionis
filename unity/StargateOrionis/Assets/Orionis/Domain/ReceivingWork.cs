using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class InspectionProgress
    {
        public string StepId { get; }
        public string ActorId { get; }
        public int Ticks { get; }
        public InspectionProgress(string stepId, string actorId, int ticks) { StepId = stepId; ActorId = actorId; Ticks = ticks; }
    }
    public sealed class ReceivingOrder
    {
        public string InstanceId { get; }
        public string RoomId { get; }
        public bool Paused { get; }
        public IReadOnlyList<InspectionProgress> Progress { get; }
        public ReceivingOrder(string instanceId, string roomId, bool paused, IEnumerable<InspectionProgress> progress)
        { InstanceId = instanceId; RoomId = roomId; Paused = paused; Progress = progress.ToList().AsReadOnly(); }
    }
    public static class ReceivingWork
    {
        public static bool IsComplete(ReceivingCatalog catalog, ReceivingOrder order) =>
            order.Progress.Select((p, i) => p.Ticks == catalog.Steps[i].DurationTicks).All(done => done);

        public static IReadOnlyList<string> KnownTags(ReceivingCatalog catalog, ReceivingOrder order)
        {
            var item = catalog.Incoming.Single(i => i.Id == order.InstanceId);
            var known = item.InitialKnown.ToList();
            for (int i = 0; i < catalog.Steps.Count; i++)
                if (order.Progress[i].Ticks == catalog.Steps[i].DurationTicks)
                    foreach (var tag in (catalog.Steps[i].ExposureCategory == "identityTags" ? item.IdentityExposure : item.ConditionExposure))
                        if (item.Reality.Contains(tag) && !known.Contains(tag)) known.Add(tag);
            return known.AsReadOnly();
        }
        public static IReadOnlyList<string> ProcessingTags(ReceivingCatalog catalog, ReceivingOrder order)
        {
            var tags = catalog.Authorize.Apply(catalog.Incoming.Single(i => i.Id == order.InstanceId).InitialProcessingTags);
            return IsComplete(catalog, order) ? catalog.Complete.Apply(tags) : tags;
        }
        // Inspecting condition changes the recorded condition, never the underlying authored Reality.
        public static string Condition(ReceivingCatalog catalog, ReceivingOrder order)
        {
            var known = KnownTags(catalog, order);
            return known.Contains("DAMAGED") ? "DAMAGED" : known.Contains("FUNCTIONAL") ? "INTACT" :
                catalog.Incoming.Single(i => i.Id == order.InstanceId).Condition;
        }
        public static void Validate(CampaignState state)
        {
            var catalog = RecoveredCargo.Catalog(state);
            if (catalog == null && state.Receiving.Count > 0) throw new InvalidOperationException("Receiving definitions are missing.");
            var ids = new HashSet<string>();
            foreach (var order in state.Receiving)
            {
                if (order == null || order.InstanceId == null || !ids.Add(order.InstanceId)) throw new InvalidOperationException("Duplicate/missing Receiving instance.");
                var item = catalog.Incoming.SingleOrDefault(i => i.Id == order.InstanceId);
                var room = state.Base.Rooms.SingleOrDefault(r => r.Id == order.RoomId);
                var profile = catalog.Rooms.SingleOrDefault(r => r.DefinitionId == room?.Definition.Id);
                if (item == null || room == null || profile == null || !profile.Capabilities.Contains(catalog.RequiredCapability) ||
                    !profile.StorageClasses.Contains(catalog.StorageClass) || !item.StorageClasses.Contains(catalog.StorageClass))
                    throw new InvalidOperationException("Invalid Receiving item, custody or admission capability.");
                if (!profile.CapacityByTier.TryGetValue(room.ConstructionTier, out var capacity) ||
                    state.Receiving.Where(o => o != null && o.RoomId == room.Id && !state.Cargo.Any(i => i.Id == o.InstanceId)).Sum(o =>
                        checked(catalog.Incoming.Single(t => t.Id == o.InstanceId).HandlingCost * catalog.Incoming.Single(t => t.Id == o.InstanceId).Quantity)) +
                    state.Cargo.Where(i => i.CustodyRoomId == room.Id).Sum(i => checked(catalog.Incoming.Single(d => d.Id == i.Id).HandlingCost * catalog.Incoming.Single(d => d.Id == i.Id).Quantity)) > capacity)
                    throw new InvalidOperationException("Receiving custody capacity is full.");
                if (order.Progress.Count != catalog.Steps.Count) throw new InvalidOperationException("Receiving work graph does not match definitions.");
                if (order.Progress.Any(p => p == null) || order.Progress.Sum(p => (long)p.Ticks) > state.Clock.ElapsedTicks)
                    throw new InvalidOperationException("Receiving progress exceeds committed campaign time.");
                bool earlierComplete = true;
                for (int i = 0; i < catalog.Steps.Count; i++)
                {
                    var step = catalog.Steps[i]; var progress = order.Progress[i];
                    if (progress == null || progress.StepId != step.Id || progress.Ticks < 0 || progress.Ticks > step.DurationTicks ||
                        (progress.Ticks == 0) != (progress.ActorId == null) || !earlierComplete && progress.Ticks > 0)
                        throw new InvalidOperationException("Invalid Receiving progress or dependency ordering.");
                    if (progress.ActorId != null && (!state.Base.Units.Any(u => u.Id == progress.ActorId) ||
                        !catalog.Workers.Any(w => w.UnitId == progress.ActorId && w.Qualifications.TryGetValue(step.Profession, out var tier) && tier >= step.MinimumTier)))
                        throw new InvalidOperationException("Invalid sticky Receiving Actor.");
                    earlierComplete &= progress.Ticks == step.DurationTicks;
                }
                ProcessingTags(catalog, order); // The resulting authored tag transition must also be valid.
            }
        }
        public static CampaignState Admit(CampaignState state, string instanceId, string roomId)
        {
            var catalog = RecoveredCargo.Catalog(state) ?? throw new InvalidOperationException("Receiving definitions are missing.");
            var item = catalog.Incoming.SingleOrDefault(i => i.Id == instanceId) ?? throw new ArgumentException("Unknown incoming instance.");
            var recovered = state.Cargo.SingleOrDefault(i => i.Id == instanceId);
            if (state.Base.Cargo?.Items.Any(i => i.Id == instanceId) == true && (recovered == null || recovered.CustodyRoomId != null || recovered.RoomId != null)) throw new InvalidOperationException("Recover this physical instance before admission; it must still be incoming.");
            if (!catalog.RequiredTags.All(item.InitialProcessingTags.Contains)) throw new InvalidOperationException("Incoming processing requirements are missing.");
            var order = new ReceivingOrder(instanceId, roomId, false, catalog.Steps.Select(s => new InspectionProgress(s.Id, null, 0)));
            return RecoveredCargo.Replace(state, state.Cargo.Select(i => i == recovered ? i.InCustody(roomId) : i), state.Receiving.Append(order));
        }
        public static CampaignState SetPaused(CampaignState state, string instanceId, bool paused)
        {
            if (!state.Receiving.Any(o => o.InstanceId == instanceId)) throw new ArgumentException("Unknown Receiving order.");
            return new CampaignState(state.Base, state.Random, state.Clock, state.Assignments, state.Receiving.Select(o =>
                o.InstanceId == instanceId ? new ReceivingOrder(o.InstanceId, o.RoomId, paused, o.Progress) : o), state.Transfers, state.Expedition, teams: state.Teams, cargo: state.Cargo, personnel: state.Personnel, construction: state.Construction);
        }
        public static string BlockedReason(CampaignState state, ReceivingOrder order) => Readiness(state, order, null) ?? "Ready to work on the next campaign tick.";
        private static string Readiness(CampaignState state, ReceivingOrder order, ISet<string> busy)
        {
            var catalog = RecoveredCargo.Catalog(state);
            if (RecoveredCargo.IsStored(state, order.InstanceId)) return "Receiving work is complete; assigned storage remains reserved.";
            if (IsComplete(catalog, order)) return "Receiving complete. Ready for routing review.";
            if (order.Paused) return "Inspection paused. Progress and assigned Actors are retained.";
            var index = order.Progress.ToList().FindIndex(p => p.Ticks < catalog.Steps.Single(s => s.Id == p.StepId).DurationTicks);
            var step = catalog.Steps[index]; var progress = order.Progress[index];
            var room = state.Base.Rooms.Single(r => r.Id == order.RoomId);
            var environment = catalog.Rooms.Single(r => r.DefinitionId == room.Definition.Id);
            if (step.RoomService != null && !RoomGroups.HasService(state, order.RoomId, step.RoomService)) return "Waiting for Room Service: " + step.RoomService;
            var candidates = Candidates(state, order, step, progress).ToList();
            if (candidates.Count == 0) return progress.ActorId == null ? "Assign a qualified " + step.Profession + " to this room." : "Waiting for the original Actor to return to this room.";
            if (!candidates.Any(w => step.ToolService == null || PersonnelCondition.HasToolService(state, w.UnitId, step.ToolService))) return "Waiting for equipped Tool Service: " + step.ToolService;
            if (!candidates.Any(w => (step.ToolService == null || PersonnelCondition.HasToolService(state, w.UnitId, step.ToolService)) && (busy == null || !busy.Contains(w.UnitId)))) return "Qualified Actor is working on another inspection this tick.";
            return null;
        }
        private static IEnumerable<InspectionWorker> Candidates(CampaignState state, ReceivingOrder order, InspectionStep step, InspectionProgress progress) =>
            RecoveredCargo.Catalog(state).Workers.Where(w => (progress.ActorId == null || progress.ActorId == w.UnitId) &&
                !Expeditions.IsIncapacitated(state, w.UnitId) && !RoomConstruction.ReservesActor(state, w.UnitId) &&
                state.Assignments.Any(a => a.UnitId == w.UnitId && RoomGroups.Contains(state, order.RoomId, a.RoomInstanceId)) &&
                w.Qualifications.TryGetValue(step.Profession, out var tier) && tier >= step.MinimumTier).OrderBy(w => RoomGroups.ActorPriority(state, order.RoomId, w.UnitId)).ThenBy(w => w.UnitId, StringComparer.Ordinal);

        public static CampaignState AdvanceTick(CampaignState state)
        { return AdvanceTick(state, null); }
        internal static CampaignState AdvanceTick(CampaignState state, ExpeditionState expedition)
        {
            var clock = state.Clock.AdvanceOneTick(); // Overflow fails before any candidate work is published.
            var orders = state.Receiving.ToList(); var busy = new HashSet<string>(); var catalog = RecoveredCargo.Catalog(state);
            foreach (var order in state.Receiving.OrderBy(o => o.InstanceId, StringComparer.Ordinal))
            {
                if (Readiness(state, order, busy) != null) continue;
                int index = order.Progress.ToList().FindIndex(p => p.Ticks < catalog.Steps.Single(s => s.Id == p.StepId).DurationTicks);
                var step = catalog.Steps[index]; var progress = order.Progress[index];
                var actor = Candidates(state, order, step, progress).First(w => !busy.Contains(w.UnitId) && (step.ToolService == null || PersonnelCondition.HasToolService(state, w.UnitId, step.ToolService)));
                busy.Add(actor.UnitId);
                var next = order.Progress.ToList(); next[index] = new InspectionProgress(step.Id, actor.UnitId, progress.Ticks + 1);
                orders[orders.IndexOf(order)] = new ReceivingOrder(order.InstanceId, order.RoomId, false, next);
                // Only the step eligible at tick start advances. A dependent step waits until the next tick.
            }
            var cargo = CargoHandling.Advance(state, clock, busy);
            cargo = CargoExamination.Advance(state, clock, busy, cargo);
            return RoomConstruction.Advance(StaffTransfers.CommitTick(state, clock, orders, expedition, cargo), busy, state);
        }
    }
}
