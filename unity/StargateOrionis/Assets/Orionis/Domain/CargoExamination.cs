using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class ExaminationSubject
    {
        public string InstanceId { get; }
        public string Name { get; }
        public IReadOnlyList<string> Evidence { get; }
        public IReadOnlyList<string> RequiredProperties { get; }
        public ExaminationSubject(string id, string name, IEnumerable<string> evidence, IEnumerable<string> requiredProperties)
        { InstanceId = id; Name = name; Evidence = evidence.ToList().AsReadOnly(); RequiredProperties = requiredProperties.Distinct().ToList().AsReadOnly(); }
    }
    public sealed class CargoProcessingCatalog
    {
        public string RoomDefinitionId { get; }
        public int ConcurrentProjects { get; }
        public int ItemCapacity { get; }
        public IReadOnlyDictionary<string, string> EquipmentTabTags { get; }
        public InspectionStep Step { get; }
        public IReadOnlyList<ExaminationSubject> Subjects { get; }
        public IReadOnlyList<HandlingFinding> ReceivingFindings { get; }
        public CargoProcessingCatalog(string room, int places, InspectionStep step, IEnumerable<ExaminationSubject> subjects, IEnumerable<HandlingFinding> findings, IDictionary<string, string> equipmentTabTags, int itemCapacity)
        { RoomDefinitionId = room; ConcurrentProjects = places; ItemCapacity = itemCapacity; Step = step; Subjects = subjects.ToList().AsReadOnly(); ReceivingFindings = findings.ToList().AsReadOnly(); EquipmentTabTags = new System.Collections.ObjectModel.ReadOnlyDictionary<string, string>(equipmentTabTags); }
    }
    public sealed class ExaminationOrder
    {
        public string RoomId { get; }
        public string PrimaryRoomId { get; }
        public string ActorId { get; }
        public long StartedTick { get; }
        public int Ticks { get; }
        public bool Paused { get; }
        public long? CompletedTick { get; }
        public bool LegacyStorageFinding { get; }
        public ExaminationOrder(string room, string primary, string actor, long started, int ticks, bool paused, long? completed, bool legacyStorageFinding = false)
        { RoomId = room; PrimaryRoomId = primary; ActorId = actor; StartedTick = started; Ticks = ticks; Paused = paused; CompletedTick = completed; LegacyStorageFinding = legacyStorageFinding; }
    }
    public static class CargoExamination
    {
        public static bool Completed(RecoveredItem item) => item.Examination?.CompletedTick != null;
        public static bool Active(RecoveredItem item) => item.Examination != null && !Completed(item);
        public static ExaminationSubject Finding(CampaignState s, RecoveredItem item) => Completed(item) ? s.Base.Processing.Subjects.Single(f => f.InstanceId == item.Id) : null;
        public static bool AllPropertiesRevealed(CampaignState s, RecoveredItem item)
        {
            var subject = Finding(s, item);
            return subject != null && subject.RequiredProperties.Count > 0 && subject.RequiredProperties.All(Known(s, item).Contains);
        }
        public static bool Identified(CampaignState s, RecoveredItem item) => AllPropertiesRevealed(s, item) && !string.IsNullOrWhiteSpace(Finding(s, item).Name);
        public static bool EquipmentReady(CampaignState s, RecoveredItem item) => Identified(s, item) &&
            RecoveredCargo.Catalog(s).Incoming.Single(d => d.Id == item.Id).StorageClasses.Contains("EQ") && CargoHandling.Condition(s, item) == "INTACT";
        public static IReadOnlyList<string> Known(CampaignState s, RecoveredItem item)
        {
            var catalog = RecoveredCargo.Catalog(s); var intake = s.Receiving.SingleOrDefault(o => o.InstanceId == item.Id);
            var known = intake == null ? catalog.Incoming.Single(d => d.Id == item.Id).InitialKnown : ReceivingWork.KnownTags(catalog, intake);
            return known.Concat(Finding(s, item)?.Evidence ?? Array.Empty<string>()).Distinct().ToList().AsReadOnly();
        }
        private static IEnumerable<InspectionWorker> Candidates(CampaignState s,ExaminationOrder order)
        {var step=s.Base.Processing.Step;return BaseWork.Workers(s,order.RoomId,step.Profession,step.MinimumTier,order.ActorId).Where(w=>!RoomConstruction.ReservesActor(s,w.UnitId)&&BaseWork.HasTool(s,order.RoomId,w.UnitId,step.ToolService));}
        public static string Status(CampaignState s, RecoveredItem item)
        {
            if (Completed(item)) return Identified(s, item) ? "All properties revealed. Identity established: " + Finding(s, item).Name + ". No institutional Theory or manufacturing Pattern granted." :
                "Examination finished, but properties or identity remain unresolved. Warehouse or Containment only.";
            if (item.Examination == null) return "Send custody to a staffed Analysis lab to examine unknown properties.";
            if (item.Examination.Paused) return "Analysis paused; progress, original Scientist and fallback storage retained.";
            return Candidates(s, item.Examination).Any() ? "Ready for the next tick in Analysis." :
                "Assign the original/qualifying Scientist with equipped " + s.Base.Processing.Step.ToolService + " to Analysis " + item.Examination.RoomId + ".";
        }
        public static CampaignState Start(CampaignState s, string id, string roomId)
        {
            var item = s.Cargo.Single(i => i.Id == id);
            if (item.Examination != null || item.RoomId == null || item.CustodyRoomId != item.RoomId || item.EquippedUnitId != null ||
                s.Base.Rooms.Single(r => r.Id == roomId).Definition.Id != s.Base.Processing?.RoomDefinitionId)
                throw new InvalidOperationException("Choose an object in validated storage and an Analysis lab. Containment is storage only.");
            var next = item.InCustody(roomId).WithExamination(new ExaminationOrder(roomId, item.RoomId, null, s.Clock.ElapsedTicks, 0, false, null));
            return RecoveredCargo.Replace(s, s.Cargo.Select(i => i == item ? next : i));
        }
        public static CampaignState Pause(CampaignState s, string id, bool paused)
        {
            var item = s.Cargo.Single(i => i.Id == id); var o = item.Examination;
            if (!Active(item)) throw new InvalidOperationException("No active Analysis examination.");
            return RecoveredCargo.Replace(s, s.Cargo.Select(i => i == item ? i.WithExamination(new ExaminationOrder(o.RoomId, o.PrimaryRoomId, o.ActorId, o.StartedTick, o.Ticks, paused, null)) : i));
        }
        internal static IReadOnlyList<RecoveredItem> Advance(CampaignState s, CampaignClock clock, ISet<string> busy, IReadOnlyList<RecoveredItem> cargo)
        {
            var rooms = new Dictionary<string, int>();
            return cargo.OrderBy(i => i.Examination?.StartedTick ?? long.MaxValue).ThenBy(i => i.Id, StringComparer.Ordinal).Select(item =>
            {
                if (!Active(item) || item.Examination.Paused) return item;
                var o = item.Examination;
                rooms.TryGetValue(o.RoomId, out var projects);
                if (projects >= s.Base.Processing.ConcurrentProjects) return item;
                var actor = Candidates(s, o).FirstOrDefault(w => !busy.Contains(w.UnitId)); if (actor == null) return item;
                rooms[o.RoomId] = projects + 1; busy.Add(actor.UnitId);
                int ticks = o.Ticks + 1; bool completed = ticks == s.Base.Processing.Step.DurationTicks;
                return item.WithExamination(new ExaminationOrder(o.RoomId, o.PrimaryRoomId, actor.UnitId, o.StartedTick, ticks, false, completed ? clock.ElapsedTicks : (long?)null));
            }).ToList().AsReadOnly();
        }
        public static void Validate(CampaignState s, RecoveredItem item)
        {
            var o = item.Examination; if (o == null) return;
            var c = s.Base.Processing ?? throw new InvalidOperationException("Analysis examination definitions are missing.");
            var room = s.Base.Rooms.SingleOrDefault(r => r.Id == o.RoomId);
            var intake = s.Receiving.SingleOrDefault(w => w.InstanceId == item.Id);
            var primary = s.Base.Rooms.SingleOrDefault(r => r.Id == o.PrimaryRoomId);
            bool legacy = o.LegacyStorageFinding && Completed(item) && s.Base.Storage?.Find(room?.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("CC")) == true;
            if ((!legacy && (o.LegacyStorageFinding || room?.Definition.Id != c.RoomDefinitionId)) ||
                s.Base.Storage?.Find(primary?.Definition.Id) == null ||
                !c.Subjects.Any(f => f.InstanceId == item.Id) || item.Handling != null && !CargoHandling.Completed(item) ||
                intake == null || !ReceivingWork.IsComplete(RecoveredCargo.Catalog(s), intake) ||
                o.StartedTick < item.RecoveredTick + intake.Progress.Sum(p => (long)p.Ticks) || o.StartedTick > s.Clock.ElapsedTicks ||
                o.Ticks < 0 || o.Ticks > c.Step.DurationTicks || o.Ticks > s.Clock.ElapsedTicks - o.StartedTick ||
                (o.Ticks == 0) != (o.ActorId == null) || Completed(item) != (o.Ticks == c.Step.DurationTicks) ||
                o.CompletedTick > s.Clock.ElapsedTicks || o.CompletedTick < o.StartedTick + c.Step.DurationTicks || Completed(item) && o.Paused ||
                Active(item) && (item.CustodyRoomId != o.RoomId || item.RoomId != o.PrimaryRoomId))
                throw new InvalidOperationException("Invalid Analysis examination, timing, custody or reserved storage.");
            if (o.ActorId != null && !s.Base.Receiving.Workers.Any(w => w.UnitId == o.ActorId && w.Qualifications.TryGetValue(c.Step.Profession, out var tier) && tier >= c.Step.MinimumTier))
                throw new InvalidOperationException("Invalid sticky Analysis Scientist.");
            if (!legacy && s.Cargo.Where(i => i.CustodyRoomId == room.Id).Sum(i => (long)s.Base.Cargo.Items.Single(d => d.Id == i.Id).Quantity) > c.ItemCapacity)
                throw new InvalidOperationException("Analysis item places are full; assigned storage and source custody retained.");
        }
    }
}
