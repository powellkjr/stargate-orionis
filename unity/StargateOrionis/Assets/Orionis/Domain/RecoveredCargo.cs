using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class CargoDefinition
    {
        public string ContainerId { get; }
        public string Label { get; }
        public string StageId { get; }
        public string GuardId { get; }
        public int SuspicionDelta { get; }
        public FieldRequirements Reveal { get; }
        public IReadOnlyList<IncomingItem> Items { get; }
        // The original physical payload preserves bindings, findings, history and provenance.
        // It is opaque to simulation and never a player-facing display string.
        public IReadOnlyDictionary<string, string> Payloads { get; }
        public CargoDefinition(string containerId, string label, string stageId, string guardId, int suspicionDelta,
            FieldRequirements reveal, IEnumerable<IncomingItem> items, IDictionary<string, string> payloads)
        { ContainerId = containerId; Label = label; StageId = stageId; GuardId = guardId; SuspicionDelta = suspicionDelta; Reveal = reveal;
          Items = items.ToList().AsReadOnly(); Payloads = new System.Collections.ObjectModel.ReadOnlyDictionary<string, string>(new Dictionary<string, string>(payloads)); }
    }
    public sealed class RecoveredItem
    {
        public string Id { get; }
        public string SourceContainerId { get; }
        public string SourceMissionId { get; }
        public long RecoveredTick { get; }
        public string Payload { get; }
        public string RoomId { get; }
        // RoomId is the reserved storage room, never a temporary work destination.
        // Incoming inventory is a valid logical fallback before room storage admission.
        public string StorageLocationId => RoomId ?? "incoming-inventory";
        public string StorageRoomId => RoomId;
        public string CustodyRoomId { get; }
        public HandlingOrder Handling { get; }
        public bool Retained { get; }
        public ExaminationOrder Examination { get; }
        public string EquippedUnitId { get; }
        public RecoveredItem(string id, string sourceContainerId, string sourceMissionId, long recoveredTick, string payload, string roomId, HandlingOrder handling = null, bool retained = false, ExaminationOrder examination = null, string equippedUnitId = null, string custodyRoomId = null)
        { Id = id; SourceContainerId = sourceContainerId; SourceMissionId = sourceMissionId; RecoveredTick = recoveredTick; Payload = payload; RoomId = roomId; Handling = handling; Retained = retained; Examination = examination; EquippedUnitId = equippedUnitId; CustodyRoomId = equippedUnitId == null ? custodyRoomId ?? roomId : custodyRoomId; }
        public RecoveredItem At(string roomId) => new RecoveredItem(Id, SourceContainerId, SourceMissionId, RecoveredTick, Payload, roomId, Handling, Retained, Examination, EquippedUnitId);
        public RecoveredItem InCustody(string roomId) => new RecoveredItem(Id, SourceContainerId, SourceMissionId, RecoveredTick, Payload, RoomId, Handling, Retained, Examination, null, roomId);
        public RecoveredItem WithHandling(HandlingOrder order) => new RecoveredItem(Id, SourceContainerId, SourceMissionId, RecoveredTick, Payload, RoomId, order, Retained, Examination, EquippedUnitId, CustodyRoomId);
        public RecoveredItem Keep(bool retained) => new RecoveredItem(Id, SourceContainerId, SourceMissionId, RecoveredTick, Payload, RoomId, Handling, retained, Examination, EquippedUnitId, CustodyRoomId);
        public RecoveredItem WithExamination(ExaminationOrder order) => new RecoveredItem(Id, SourceContainerId, SourceMissionId, RecoveredTick, Payload, RoomId, Handling, Retained, order, EquippedUnitId, CustodyRoomId);
        public RecoveredItem Equip(string unitId) => new RecoveredItem(Id, SourceContainerId, SourceMissionId, RecoveredTick, Payload, RoomId, Handling, Retained, Examination, unitId);
    }
    public static class RecoveredCargo
    {
        public static bool Revealed(CampaignState s) => s.Base.Cargo != null && s.Expedition?.Travel?.Field?.Completed.Any(w => w.RecipeId == s.Base.Cargo.Reveal.Id) == true;
        public static bool CanRecover(CampaignState s) => Revealed(s) && s.Expedition.Returned &&
            MissionEvacuation.SecureRoute(s, s.Base.Cargo.StageId) != null && !s.Cargo.Any(i => i.SourceContainerId == s.Base.Cargo.ContainerId);
        public static CampaignState Recover(CampaignState s)
        {
            if (!CanRecover(s)) throw new InvalidOperationException("Recovery requires a revealed crate, an extracted team and a secure known route; each instance can be recovered once.");
            var d = s.Base.Cargo;
            return Replace(s, s.Cargo.Concat(d.Items.Select(i => new RecoveredItem(i.Id, d.ContainerId, s.Expedition.MissionId,
                s.Clock.ElapsedTicks, d.Payloads[i.Id], null))));
        }
        public static ReceivingCatalog Catalog(CampaignState s)
        {
            var c = s.Base.Receiving; if (s.Base.Cargo == null) return c;
            return new ReceivingCatalog(c.RecipeId, c.RequiredCapability, c.StorageClass, c.Steps, c.Incoming.Concat(s.Base.Cargo.Items), c.Rooms, c.Workers, c.RequiredTags, c.Authorize, c.Complete);
        }
        public static string Name(CampaignState s, RecoveredItem i)
        {
            var finding = CargoExamination.Finding(s, i); if (CargoExamination.Identified(s, i)) return finding.Name;
            var d = Catalog(s).Incoming.Single(x => x.Id == i.Id); var work = s.Receiving.SingleOrDefault(w => w.InstanceId == i.Id);
            return work != null && ReceivingWork.IsComplete(Catalog(s), work) ? d.ReceivingName : d.InitialName;
        }
        public static bool IsStored(CampaignState s, string id) => s.Cargo.Any(i => i.Id == id && i.RoomId != null &&
            s.Base.Storage?.Find(s.Base.Rooms.Single(r => r.Id == i.RoomId).Definition.Id) != null);
        public static CampaignState Move(CampaignState s, string id, string destination)
        {
            // Validate admission before spending time; publish the whole transfer/tick atomically.
            var candidate = StorageDestination(s, id, destination);
            return ReceivingWork.AdvanceTick(candidate);
        }
        public static void CheckStorageTransfer(CampaignState s, string id, string destination) => StorageDestination(s, id, destination);
        private static CampaignState StorageDestination(CampaignState s, string id, string destination)
        {
            if (s.Expedition != null && !s.Expedition.Returned) throw new InvalidOperationException("Reassign item storage from the base after the team returns.");
            var i = s.Cargo.SingleOrDefault(x => x.Id == id) ?? throw new InvalidOperationException("Recover the physical instance first.");
            if (i.EquippedUnitId != null) throw new InvalidOperationException("Return equipped custody to storage before routing this item elsewhere.");
            var order = s.Receiving.SingleOrDefault(o => o.InstanceId == id);
            if (order == null || !ReceivingWork.IsComplete(Catalog(s), order)) throw new InvalidOperationException("Complete Receiving before routing this item.");
            if (i.Handling != null && !CargoHandling.Completed(i)) throw new InvalidOperationException("Finish the handling review before moving custody; Containment remains reserved.");
            if (CargoExamination.Active(i)) throw new InvalidOperationException("Finish the Analysis examination before moving this item.");
            if (i.RoomId == destination) throw new InvalidOperationException("The item is already there.");
            var target = s.Base.Rooms.Single(r => r.Id == destination);
            var source = s.Base.Rooms.SingleOrDefault(r => r.Id == i.RoomId);
            bool containment = s.Base.Storage?.Find(target.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("CC")) == true;
            bool equipment = s.Base.Storage?.Find(target.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("EQ")) == true;
            if (source?.Definition.Id == s.Base.Handling?.OrdinaryStorageDefinitionId && !containment)
                throw new InvalidOperationException("Warehouse storage may be reassigned only to Containment. Use Analysis for temporary work custody.");
            var next = i.At(destination);
            if (equipment) next = next.Keep(true); // Explicit acceptance into SGC Equipment Storage.
            return Replace(s, s.Cargo.Select(x => x == i ? next : x));
        }
        public static CampaignState ReturnToStorage(CampaignState s, string id)
        {
            var item = s.Cargo.Single(i => i.Id == id);
            if (item.EquippedUnitId != null || CargoExamination.Active(item) || item.Handling != null && !CargoHandling.Completed(item))
                throw new InvalidOperationException("Finish active work or return the Unit's equipment before returning room custody.");
            if (item.CustodyRoomId == item.RoomId) throw new InvalidOperationException("Custody is already at assigned storage.");
            return Replace(s, s.Cargo.Select(i => i == item ? i.At(item.RoomId) : i));
        }
        public static CampaignState Retain(CampaignState s, string id, bool retained)
        {
            var item = s.Cargo.Single(i => i.Id == id);
            return Replace(s, s.Cargo.Select(i => i == item ? i.Keep(retained) : i));
        }
        // Debug replay only: rewind this instance's processing, never its authored Reality.
        public static CampaignState ResetObject(CampaignState s, string id)
        {
            if (s.Expedition != null && !s.Expedition.Returned) throw new InvalidOperationException("Reset cargo from the base after the team returns.");
            var item = s.Cargo.Single(i => i.Id == id);
            var reset = new RecoveredItem(item.Id, item.SourceContainerId, item.SourceMissionId, item.RecoveredTick, item.Payload, null);
            return new CampaignState(s.Base, s.Random, s.Clock, s.Assignments, s.Receiving.Where(o => o.InstanceId != id),
                s.Transfers.Where(t => t.WorkInstanceId != id), s.Expedition, s.Teams, s.Cargo.Select(i => i == item ? reset : i), s.Personnel, construction: s.Construction);
        }
        private static StorageTab EquipmentTab(CampaignState s, RecoveredItem item, RoomStorageProfile profile)
        {
            var known = CargoExamination.Known(s, item);
            return profile.Tabs.FirstOrDefault(t => t.Classes.Contains("EQ") && s.Base.Processing.EquipmentTabTags.TryGetValue(t.Id, out var tag) && known.Contains(tag));
        }
        internal static CampaignState Replace(CampaignState s, IEnumerable<RecoveredItem> cargo, IEnumerable<ReceivingOrder> receiving = null) =>
            new CampaignState(s.Base, s.Random, s.Clock, s.Assignments, receiving ?? s.Receiving, s.Transfers, s.Expedition, s.Teams, cargo, s.Personnel, construction: s.Construction);
        public static void Validate(CampaignState s)
        {
            if (s.Cargo.Count == 0) return;
            var d = s.Base.Cargo ?? throw new InvalidOperationException("Cargo definitions are missing.");
            if (s.Cargo.Any(i => i == null) || s.Cargo.Select(i => i.Id).Distinct().Count() != s.Cargo.Count ||
                !s.Cargo.Select(i => i.Id).OrderBy(x => x).SequenceEqual(d.Items.Select(i => i.Id).OrderBy(x => x)))
                throw new InvalidOperationException("Recovery must preserve every physical crate/content instance exactly once.");
            foreach (var i in s.Cargo)
            {
                if (i.SourceContainerId != d.ContainerId || i.SourceMissionId != s.Base.Mission.Id || i.RecoveredTick < 0 || i.RecoveredTick > s.Clock.ElapsedTicks || i.Payload != d.Payloads[i.Id])
                    throw new InvalidOperationException("Recovered physical state or provenance changed without an implemented transition.");
                CargoHandling.Validate(s, i);
                CargoExamination.Validate(s, i);
                UnitEquipment.Validate(s, i);
                var order = s.Receiving.SingleOrDefault(o => o.InstanceId == i.Id);
                if (i.EquippedUnitId != null && i.CustodyRoomId != null) throw new InvalidOperationException("An item cannot have room and Unit custody simultaneously.");
                if (i.RoomId == null)
                {
                    if (i.EquippedUnitId != null || i.Examination != null || i.Handling != null ||
                        (order == null ? i.CustodyRoomId != null : i.CustodyRoomId != order.RoomId))
                        throw new InvalidOperationException("Incoming inventory retains fallback storage during Receiving custody.");
                    continue;
                }
                var room = s.Base.Rooms.SingleOrDefault(r => r.Id == i.RoomId) ?? throw new InvalidOperationException("Unknown cargo custody room.");
                if (order == null) throw new InvalidOperationException("Cargo room custody requires Receiving admission.");
                if (i.EquippedUnitId == null && i.CustodyRoomId != i.RoomId &&
                    !(CargoExamination.Active(i) || CargoExamination.Completed(i) && i.Examination.RoomId == i.CustodyRoomId) &&
                    !(i.Handling != null && !CargoHandling.Completed(i) && i.Handling.RoomId == i.CustodyRoomId))
                    throw new InvalidOperationException("Temporary room custody requires a valid local work order.");
                var p = s.Base.Storage?.Find(room.Definition.Id);
                if (p == null || !ReceivingWork.IsComplete(Catalog(s), order)) throw new InvalidOperationException("Storage transfer requires completed Receiving.");
                var item = d.Items.Single(x => x.Id == i.Id);
                if (room.Definition.Id == s.Base.Handling?.OrdinaryStorageDefinitionId)
                {
                    // Warehouse is ordinary holding; unresolved properties remain unknown until Containment examination.
                    long occupied = s.Cargo.Where(x => x.RoomId == room.Id || CargoExamination.Active(x) && x.Examination.PrimaryRoomId == room.Id).Sum(x => (long)d.Items.Single(a => a.Id == x.Id).Quantity);
                    if (occupied > p.CapacityByTier[room.ConstructionTier]) throw new InvalidOperationException("Warehouse item places are full.");
                }
                else
                {
                    var tab = p.Tabs.SingleOrDefault(t => t.Classes.Contains("CC"));
                    if (tab == null)
                    {
                        var equipment = EquipmentTab(s, i, p);
                        if (equipment == null || !CargoExamination.EquipmentReady(s, i) || !i.Retained)
                            throw new InvalidOperationException("Equipment Storage requires all properties revealed, established identity, intact equipment and SGC acceptance.");
                        long used = s.Cargo.Where(x => x.RoomId == room.Id && (p.SharedItemCapacity || EquipmentTab(s, x, p)?.Id == equipment.Id)).Sum(x => (long)d.Items.Single(a => a.Id == x.Id).HandlingCost * d.Items.Single(a => a.Id == x.Id).Quantity);
                        if (used > (p.SharedItemCapacity ? p.CapacityByTier[room.ConstructionTier] : equipment.CapacityByTier[room.ConstructionTier])) throw new InvalidOperationException("Equipment Storage is full; source custody retained.");
                    }
                }
            }
            foreach (var room in s.Base.Rooms)
            {
                var policy = s.Base.Storage?.Find(room.Definition.Id);
                if (room.Definition.Id == s.Base.Handling?.OrdinaryStorageDefinitionId && policy != null && s.Cargo.Where(i => i.RoomId == room.Id || CargoExamination.Active(i) && i.Examination.PrimaryRoomId == room.Id).Sum(i => (long)d.Items.Single(x => x.Id == i.Id).Quantity) > policy.CapacityByTier[room.ConstructionTier])
                    throw new InvalidOperationException("Warehouse capacity is full, including reserved process custody.");
                var tab = policy?.Tabs.SingleOrDefault(t => t.Classes.Contains("CC"));
                if (tab == null) continue;
                long occupancy = s.Cargo.Where(i => i.RoomId == room.Id || i.Handling?.PrimaryRoomId == room.Id && !CargoHandling.Completed(i) || CargoExamination.Active(i) && i.Examination.PrimaryRoomId == room.Id).Sum(i =>
                    { var definition = d.Items.Single(x => x.Id == i.Id); return (long)definition.HandlingCost * definition.Quantity; });
                if (occupancy > tab.CapacityByTier[room.ConstructionTier]) throw new InvalidOperationException("Containment capacity is full, including reserved process custody.");
            }
        }
    }
}
