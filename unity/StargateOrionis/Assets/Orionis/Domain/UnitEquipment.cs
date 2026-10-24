using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class EquipmentSlotDefinition
    {
        public string Id { get; }
        public string RequiredTag { get; }
        public int Damage { get; }
        public int Protection { get; }
        public EquipmentSlotDefinition(string id, string tag, int damage, int protection)
        { Id = id; RequiredTag = tag; Damage = damage; Protection = protection; }
    }
    public sealed class UnitEquipmentCatalog
    {
        public IReadOnlyList<EquipmentSlotDefinition> Slots { get; }
        public IReadOnlyDictionary<string, int> DamageOverrides { get; }
        public UnitEquipmentCatalog(IEnumerable<EquipmentSlotDefinition> slots, IDictionary<string, int> damage)
        { Slots = slots.ToList().AsReadOnly(); DamageOverrides = new System.Collections.ObjectModel.ReadOnlyDictionary<string, int>(damage); }
    }
    public sealed class MissionEquipment
    {
        public string InstanceId { get; }
        public string Slot { get; }
        public string Name { get; }
        public int Damage { get; }
        public int Protection { get; }
        public MissionEquipment(string id, string slot, string name, int damage, int protection)
        { InstanceId = id; Slot = slot; Name = name; Damage = damage; Protection = protection; }
    }
    public static class UnitEquipment
    {
        // Definition lookup is private simulation data. UI only calls it for identified items.
        public static MissionEquipment Profile(CampaignState s, string instanceId)
        {
            var item = s.Base.Cargo?.Items.SingleOrDefault(i => i.Id == instanceId);
            var subject = s.Base.Processing?.Subjects.SingleOrDefault(i => i.InstanceId == instanceId);
            var slot = s.Base.Equipment?.Slots.SingleOrDefault(d => subject?.RequiredProperties.Contains(d.RequiredTag) == true);
            if (item == null || slot == null) return null;
            int damage = slot.Damage;
            if (damage > 0 && s.Base.Equipment.DamageOverrides.TryGetValue(item.DefinitionId, out var value)) damage = value;
            return new MissionEquipment(instanceId, slot.Id, subject.Name, damage, slot.Protection);
        }
        public static IReadOnlyList<MissionEquipment> Loadout(CampaignState s, string unitId) => s.Cargo.Where(i => i.EquippedUnitId == unitId)
            .Select(i => Profile(s, i.Id) ?? throw new InvalidOperationException("Equipped instance has no valid slot profile.")).OrderBy(i => i.Slot, StringComparer.Ordinal).ToList().AsReadOnly();
        public static CampaignState Issue(CampaignState s, string id, string unitId)
        {
            var item = s.Cargo.Single(i => i.Id == id); var unit = s.Base.Units.SingleOrDefault(u => u.Id == unitId);
            var room = s.Base.Rooms.SingleOrDefault(r => r.Id == item.RoomId); var profile = Profile(s, id);
            if (s.Base.Cargo.Items.Single(i => i.Id == id).Quantity != 1) throw new InvalidOperationException("Equip one physical weapon or armor instance at a time.");
            if (unit == null || profile == null || item.EquippedUnitId != null || item.CustodyRoomId != item.RoomId || !item.Retained || !CargoExamination.EquipmentReady(s, item) ||
                s.Base.Storage?.Find(room?.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("EQ")) != true)
                throw new InvalidOperationException("Issue identified, intact equipment from Equipment Storage to an existing Unit.");
            if (Expeditions.IsDeployed(s, unitId) || Expeditions.IsIncapacitated(s, unitId)) throw new InvalidOperationException("This Unit is offworld or incapacitated.");
            if (Loadout(s, unitId).Any(i => i.Slot == profile.Slot)) throw new InvalidOperationException("The Unit's " + profile.Slot + " slot is occupied. Return that item first.");
            return RecoveredCargo.Replace(s, s.Cargo.Select(i => i == item ? i.Equip(unitId) : i));
        }
        public static CampaignState Return(CampaignState s, string id, string roomId)
        {
            var item = s.Cargo.Single(i => i.Id == id);
            if (item.EquippedUnitId == null || Expeditions.IsDeployed(s, item.EquippedUnitId)) throw new InvalidOperationException("Return carried equipment after its Unit comes back to base.");
            var room = s.Base.Rooms.SingleOrDefault(r => r.Id == roomId);
            if (roomId != item.RoomId) throw new InvalidOperationException("Return custody to assigned storage first; storage reassignment costs one tick.");
            if (s.Base.Storage?.Find(room?.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("EQ")) != true) throw new InvalidOperationException("Choose Equipment Storage for the return.");
            return RecoveredCargo.Replace(s, s.Cargo.Select(i => i == item ? i.Equip(null).At(roomId) : i));
        }
        public static void Validate(CampaignState s, RecoveredItem item)
        {
            if (item.EquippedUnitId == null) return;
            var profile = Profile(s, item.Id);
            if (profile == null || s.Base.Cargo.Items.Single(i => i.Id == item.Id).Quantity != 1 || !s.Base.Units.Any(u => u.Id == item.EquippedUnitId) || s.Base.Storage?.Find(s.Base.Rooms.SingleOrDefault(r => r.Id == item.RoomId)?.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("EQ")) != true || !item.Retained || !CargoExamination.EquipmentReady(s, item) ||
                s.Cargo.Count(i => i.EquippedUnitId == item.EquippedUnitId && Profile(s, i.Id)?.Slot == profile.Slot) > 1)
                throw new InvalidOperationException("Invalid personal equipment identity, slot, custody or clearance.");
        }
        private static string Signature(MissionEquipment i) => i.InstanceId + ":" + i.Slot + ":" + i.Name + ":" + i.Damage + ":" + i.Protection;
        public static void ValidateMember(CampaignState s, ExpeditionMember member)
        {
            var gear = member.Equipment;
            if (gear.Any(i => i == null || Profile(s, i.InstanceId) == null || Signature(i) != Signature(Profile(s, i.InstanceId))) ||
                gear.Select(i => i.Slot).Distinct().Count() != gear.Count || gear.Select(i => i.InstanceId).Distinct().Count() != gear.Count)
                throw new InvalidOperationException("Invalid deployed equipment snapshot.");
            if (!s.Expedition.Returned && !gear.Select(Signature).OrderBy(x => x).SequenceEqual(Loadout(s, member.UnitId).Select(Signature).OrderBy(x => x)))
                throw new InvalidOperationException("Offworld equipment must match the Unit's deployment snapshot.");
        }
    }
}
