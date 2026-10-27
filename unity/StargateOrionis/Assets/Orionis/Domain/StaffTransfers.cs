using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public enum StaffTransferTiming { Now, NextTick, FinishStep }

    public sealed class StaffTransfer
    {
        public string UnitId { get; }
        public string SourceRoomId { get; }
        public string DestinationRoomId { get; }
        public StaffTransferTiming Timing { get; }
        public long RequestedTick { get; }
        public string WorkInstanceId { get; }
        public string WorkStepId { get; }
        public StaffTransfer(string unitId, string sourceRoomId, string destinationRoomId, StaffTransferTiming timing,
            long requestedTick, string workInstanceId = null, string workStepId = null)
        { UnitId = unitId; SourceRoomId = sourceRoomId; DestinationRoomId = destinationRoomId; Timing = timing;
          RequestedTick = requestedTick; WorkInstanceId = workInstanceId; WorkStepId = workStepId; }
    }

    public static class StaffTransfers
    {
        public static void Validate(CampaignState state)
        {
            var ids = new HashSet<string>();
            foreach (var move in state.Transfers)
            {
                if (move == null || move.UnitId == null || !ids.Add(move.UnitId) ||
                    !state.Assignments.Any(a => a.UnitId == move.UnitId && a.RoomInstanceId == move.SourceRoomId) ||
                    !state.Base.Rooms.Any(r => r.Id == move.DestinationRoomId) || move.SourceRoomId == move.DestinationRoomId ||
                    move.RequestedTick < 0 || move.RequestedTick > state.Clock.ElapsedTicks)
                    throw new InvalidOperationException("Invalid staffing transfer identity, source or destination.");
                if (move.Timing == StaffTransferTiming.NextTick)
                {
                    if (move.RequestedTick != state.Clock.ElapsedTicks || move.WorkInstanceId != null || move.WorkStepId != null)
                        throw new InvalidOperationException("Next-tick transfer has invalid timing or work references.");
                }
                else if (move.Timing == StaffTransferTiming.FinishStep)
                {
                    var order = state.Receiving.SingleOrDefault(o => o.InstanceId == move.WorkInstanceId);
                    var progress = order?.Progress.SingleOrDefault(p => p.StepId == move.WorkStepId && p.ActorId == move.UnitId);
                    var step = state.Base.Receiving?.Steps.SingleOrDefault(s => s.Id == move.WorkStepId);
                    var handling = state.Cargo.SingleOrDefault(i => i.Id == move.WorkInstanceId)?.Handling;
                    bool handlingWork = handling != null && state.Base.Handling?.Step.Id == move.WorkStepId && handling.ActorId == move.UnitId && handling.Ticks > 0 && handling.Ticks < state.Base.Handling.Step.DurationTicks;
                    var analysis = state.Cargo.SingleOrDefault(i => i.Id == move.WorkInstanceId)?.Examination;
                    bool analysisWork = analysis != null && state.Base.Processing?.Step.Id == move.WorkStepId && analysis.ActorId == move.UnitId && analysis.Ticks > 0 && analysis.Ticks < state.Base.Processing.Step.DurationTicks;
                    if (!handlingWork && !analysisWork && (progress == null || step == null || progress.Ticks <= 0 || progress.Ticks >= step.DurationTicks))
                        throw new InvalidOperationException("Finish-step transfer must reference this Actor's unfinished personal work.");
                }
                else throw new InvalidOperationException("Only pending next-tick or finish-step transfers are stored.");
            }
            foreach (var room in state.Base.Rooms)
            {
                int used = state.Assignments.Count(a => a.RoomInstanceId == room.Id);
                int reserved = state.Transfers.Count(t => t.DestinationRoomId == room.Id);
                if (used + reserved > room.StaffingCapacity)
                    throw new InvalidOperationException(room.Definition.Name + " has no free staffing places (including reserved transfers).");
            }
        }
        public static CampaignState Request(CampaignState state, string unitId, string roomId, StaffTransferTiming timing)
        {
            if (!Enum.IsDefined(typeof(StaffTransferTiming), timing)) throw new ArgumentException("Unknown transfer timing.");
            if (!state.Base.Units.Any(u => u.Id == unitId)) throw new ArgumentException("Unknown Unit.");
            if (SGTeams.ForUnit(state, unitId) != null) throw new InvalidOperationException("Remove the Unit from its SG team before assigning ordinary room work.");
            if (Expeditions.IsIncapacitated(state, unitId)) throw new InvalidOperationException("This Unit needs to recover before working. Assign an Infirmary bed or allow recovery at base.");
            if (!state.Base.Rooms.Any(r => r.Id == roomId)) throw new ArgumentException("Unknown physical room.");
            var source = state.Assignments.SingleOrDefault(a => a.UnitId == unitId);
            var otherMoves = state.Transfers.Where(t => t.UnitId != unitId).ToList();
            var order = state.Receiving.FirstOrDefault(o => o.Progress.Any(p =>
                p.ActorId == unitId && p.Ticks > 0 && p.Ticks < state.Base.Receiving.Steps.Single(s => s.Id == p.StepId).DurationTicks));
            var handlingItem = state.Cargo.FirstOrDefault(i => i.Handling?.ActorId == unitId && !CargoHandling.Completed(i) && i.Handling.Ticks > 0);
            var analysisItem = state.Cargo.FirstOrDefault(i => i.Examination?.ActorId == unitId && CargoExamination.Active(i) && i.Examination.Ticks > 0);
            if (source == null || source.RoomInstanceId == roomId || timing == StaffTransferTiming.Now || timing == StaffTransferTiming.FinishStep && order == null && handlingItem == null && analysisItem == null)
            {
                var assignments = state.Assignments.Where(a => a.UnitId != unitId).Append(new StaffAssignment(unitId, roomId));
                return new CampaignState(state.Base, state.Random, state.Clock, assignments, state.Receiving, otherMoves, state.Expedition, teams: state.Teams, cargo: state.Cargo, personnel: state.Personnel, construction: state.Construction, cores: state.Cores, workforce: state.Workforce, completedWork: state.CompletedWork);
            }
            state.Clock.AdvanceOneTick(); // Future-boundary requests must be representable by the campaign clock.
            var progress = order?.Progress.First(p => p.ActorId == unitId && p.Ticks > 0 && p.Ticks < state.Base.Receiving.Steps.Single(s => s.Id == p.StepId).DurationTicks);
            otherMoves.Add(new StaffTransfer(unitId, source.RoomInstanceId, roomId, timing, state.Clock.ElapsedTicks,
                timing == StaffTransferTiming.FinishStep ? order?.InstanceId ?? handlingItem?.Id ?? analysisItem?.Id : null,
                timing == StaffTransferTiming.FinishStep ? progress?.StepId ?? (handlingItem != null ? state.Base.Handling.Step.Id : state.Base.Processing.Step.Id) : null));
            return new CampaignState(state.Base, state.Random, state.Clock, state.Assignments, state.Receiving, otherMoves, state.Expedition, teams: state.Teams, cargo: state.Cargo, personnel: state.Personnel, construction: state.Construction, cores: state.Cores, workforce: state.Workforce, completedWork: state.CompletedWork);
        }
        public static CampaignState Cancel(CampaignState state, string unitId)
        {
            if (!state.Transfers.Any(t => t.UnitId == unitId)) throw new ArgumentException("This Unit has no planned move.");
            return new CampaignState(state.Base, state.Random, state.Clock, state.Assignments, state.Receiving, state.Transfers.Where(t => t.UnitId != unitId), state.Expedition, teams: state.Teams, cargo: state.Cargo, personnel: state.Personnel, construction: state.Construction, cores: state.Cores, workforce: state.Workforce, completedWork: state.CompletedWork);
        }
        // Resolve work first, then due transfers, and validate the complete result before publishing one tick.
        internal static CampaignState CommitTick(CampaignState previous, CampaignClock clock, IReadOnlyList<ReceivingOrder> work, ExpeditionState expedition = null, IReadOnlyList<RecoveredItem> cargo = null, ConstructionState construction = null)
        {
            var assignments = previous.Assignments.ToList(); var remaining = previous.Transfers.ToList();
            foreach (var move in previous.Transfers.OrderBy(t => t.UnitId, StringComparer.Ordinal))
            {
                bool due = move.Timing == StaffTransferTiming.NextTick || (previous.Base.Processing?.Step.Id == move.WorkStepId ?
                    (cargo ?? previous.Cargo).Single(i => i.Id == move.WorkInstanceId).Examination.CompletedTick != null : previous.Base.Handling?.Step.Id == move.WorkStepId ?
                    (cargo ?? previous.Cargo).Single(i => i.Id == move.WorkInstanceId).Handling.CompletedTick != null :
                    work.Single(o => o.InstanceId == move.WorkInstanceId).Progress.Single(p => p.StepId == move.WorkStepId).Ticks == previous.Base.Receiving.Steps.Single(s => s.Id == move.WorkStepId).DurationTicks);
                if (!due) continue;
                assignments.RemoveAll(a => a.UnitId == move.UnitId);
                assignments.Add(new StaffAssignment(move.UnitId, move.DestinationRoomId));
                remaining.Remove(move);
            }
            return new CampaignState(previous.Base, previous.Random, clock, assignments, work, remaining, Expeditions.AtTick(expedition ?? previous.Expedition, clock), teams: previous.Teams, cargo: cargo ?? previous.Cargo, personnel: previous.Personnel, construction: construction ?? previous.Construction, cores: previous.Cores, workforce: previous.Workforce, completedWork: previous.CompletedWork);
        }
    }
}
