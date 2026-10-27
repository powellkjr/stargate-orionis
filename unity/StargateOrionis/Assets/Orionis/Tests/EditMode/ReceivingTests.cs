using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Orionis.Application;
using Orionis.Domain;
using Orionis.Infrastructure;

namespace Orionis.Tests
{
    public sealed class ReceivingTests
    {
        private const string ItemId = "ITEM_ASGARD_RIFLE_0001";
        private string json;
        private CampaignSession Create(Action<JObject> edit = null)
        {
            var root = JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            edit?.Invoke(root); json = root.ToString();
            return new CampaignSession(new CampaignState(BootstrapReader.Read(json), new RandomState(1, 1)), null);
        }
        private static string Worker(CampaignSession s, string profession, int skip = 0) => s.State.Base.Receiving.Workers.Where(w =>
            w.Qualifications.TryGetValue(profession, out var tier) && tier >= 1 && w.ToolServices.Contains(profession == "TECHNICIAN" ? "TET1" : "SCT1")).Skip(skip).First().UnitId;
        private static ReceivingOrder Order(CampaignSession s) => s.State.Receiving.Single();
        [Test] public void AdmissionPreservesIdentityAndRejectsWrongRoomOrDuplicateWithoutMutation()
        {
            var s = Create(); var initial = s.State;
            Assert.Throws<InvalidOperationException>(() => s.AdmitIncoming(ItemId, "r5"));
            Assert.That(s.State, Is.SameAs(initial));
            s.AdmitIncoming(ItemId, "r2"); var admitted = s.State;
            Assert.Throws<InvalidOperationException>(() => s.AdmitIncoming(ItemId, "r2"));
            Assert.That(s.State, Is.SameAs(admitted)); Assert.That(Order(s).InstanceId, Is.EqualTo(ItemId));
            Assert.That(ReceivingWork.KnownTags(s.State.Base.Receiving, Order(s)), Is.EqualTo(new[] { "PHYSICAL_OBJECT" }));
            Assert.That(s.State.Clock.ElapsedTicks, Is.Zero);
        }
        [Test] public void NoRosterWideActorSearchAndNoWrongProfessionFallback()
        {
            var s = Create(); s.AdmitIncoming(ItemId, "r2");
            s.AssignUnit("unit-1", "r2"); s.AdvanceOneTick();
            Assert.That(Order(s).Progress.All(p => p.Ticks == 0 && p.ActorId == null), Is.True);
            Assert.That(ReceivingWork.BlockedReason(s.State, Order(s)), Does.Contain("TECHNICIAN"));
            s.UnassignUnit("unit-1"); s.AssignUnit(Worker(s, "TECHNICIAN"), "r5"); s.AdvanceOneTick();
            Assert.That(Order(s).Progress[0].Ticks, Is.Zero);
        }
        [Test] public void MissingPersonalToolBlocksWithoutBindingAnActorOrRevealingReality()
        {
            var s = Create(root => { foreach (var worker in root["receiving"]["units"]) worker["toolServices"] = new JArray(); });
            var tech = s.State.Base.Units.First(u => u.Profession == "TECHNICIAN").Id;
            s.AssignUnit(tech, "r2"); s.AdmitIncoming(ItemId, "r2"); s.AdvanceOneTick();
            Assert.That(Order(s).Progress[0].ActorId, Is.Null);
            Assert.That(ReceivingWork.BlockedReason(s.State, Order(s)), Does.Contain("TET1"));
            Assert.That(ReceivingWork.KnownTags(s.State.Base.Receiving, Order(s)), Is.EqualTo(new[] { "PHYSICAL_OBJECT" }));
        }
        [TestCase(false)][TestCase(true)] public void RoomServiceResolvesOnlyFromDestinationConfiguration(bool available)
        {
            var s = Create(root =>
            {
                root["receiving"]["recipe"]["steps"][0]["roomService"] = "TEST_ROOM_SERVICE";
                root["receiving"]["rooms"].Single(r => r["definitionId"].Value<string>() == (available ? "receiving" : "workshop"))["services"] = new JArray("TEST_ROOM_SERVICE");
            });
            s.AssignUnit(Worker(s, "TECHNICIAN"), "r2"); s.AdmitIncoming(ItemId, "r2"); s.AdvanceOneTick();
            Assert.That(Order(s).Progress[0].Ticks, Is.EqualTo(available ? 1 : 0));
            if (!available) Assert.That(ReceivingWork.BlockedReason(s.State, Order(s)), Does.Contain("TEST_ROOM_SERVICE"));
        }
        [Test] public void FullCustodyCapacityRejectsAdmissionBeforeCreatingWork()
        {
            var s = Create(root => root["receiving"]["rooms"].Single(r => r["definitionId"].Value<string>() == "receiving")["capacityByTier"]["1"] = 0);
            var before = s.State;
            Assert.Throws<InvalidOperationException>(() => s.AdmitIncoming(ItemId, "r2"));
            Assert.That(s.State, Is.SameAs(before)); Assert.That(s.State.Receiving, Is.Empty);
        }
        [Test] public void CompletionRevealsOnlyExistingPermittedFactsAndDependenciesWaitForNextTick()
        {
            var s = Create(); var catalog = s.State.Base.Receiving; var reality = catalog.Incoming.Single().Reality.ToArray();
            s.AssignUnit(Worker(s, "TECHNICIAN"), "r2"); s.AssignUnit(Worker(s, "SCIENTIST"), "r2"); s.AdmitIncoming(ItemId, "r2");
            s.AdvanceOneTick(); Assert.That(ReceivingWork.KnownTags(catalog, Order(s)), Has.Count.EqualTo(1));
            s.AdvanceOneTick(); Assert.That(Order(s).Progress[1].Ticks, Is.Zero);
            Assert.That(ReceivingWork.KnownTags(catalog, Order(s)), Is.EquivalentTo(new[] { "PHYSICAL_OBJECT", "FUNCTIONAL", "CHARGED" }));
            s.AdvanceOneTick(); s.AdvanceOneTick();
            Assert.That(ReceivingWork.IsComplete(catalog, Order(s)), Is.True);
            Assert.That(ReceivingWork.KnownTags(catalog, Order(s)), Is.EquivalentTo(new[] { "PHYSICAL_OBJECT", "FUNCTIONAL", "CHARGED", "WEAPON", "RANGED_WEAPON", "RIFLE" }));
            Assert.That(ReceivingWork.ProcessingTags(catalog, Order(s)), Is.EquivalentTo(new[] { "RECEIVING_COMPLETE", "IDENTITY_ESTABLISHED" }));
            Assert.That(catalog.Incoming.Single().Reality, Is.EqualTo(reality));
            Assert.That(ReceivingWork.Condition(catalog, Order(s)), Is.EqualTo("INTACT"));
            var completed = Order(s); s.AdvanceOneTick();
            Assert.That(Order(s), Is.SameAs(completed)); Assert.That(s.State.Random.Value, Is.EqualTo(1u));
        }
        [Test] public void PauseAndStaffTransferRetainProgressAndAnotherActorCannotInheritIt()
        {
            var s = Create(); var original = Worker(s, "TECHNICIAN"); var replacement = Worker(s, "TECHNICIAN", 1);
            s.AssignUnit(original, "r2"); s.AdmitIncoming(ItemId, "r2"); s.AdvanceOneTick();
            s.PauseInspection(ItemId, true); s.AdvanceOneTick(); Assert.That(Order(s).Progress[0].Ticks, Is.EqualTo(1));
            s.AssignUnit(original, "r5"); s.AssignUnit(replacement, "r2"); s.PauseInspection(ItemId, false); s.AdvanceOneTick();
            Assert.That(Order(s).Progress[0].Ticks, Is.EqualTo(1)); Assert.That(Order(s).Progress[0].ActorId, Is.EqualTo(original));
            s.AssignUnit(original, "r2"); s.AdvanceOneTick(); Assert.That(Order(s).Progress[0].Ticks, Is.EqualTo(2));
        }
        [Test] public void OneActorAdvancesAtMostOneOrderPerTickInStableInstanceOrder()
        {
            var s = Create(root =>
            {
                var second = root["receiving"]["items"][0].DeepClone(); second["instance"]["instanceId"] = "TEST_SECOND_ITEM";
                ((JArray)root["receiving"]["items"]).Add(second);
            });
            s.AssignUnit(Worker(s, "TECHNICIAN"), "r2");
            s.AdmitIncoming("TEST_SECOND_ITEM", "r2"); s.AdmitIncoming(ItemId, "r2"); s.AdvanceOneTick();
            Assert.That(s.State.Receiving.Single(o => o.InstanceId == ItemId).Progress[0].Ticks, Is.EqualTo(1));
            Assert.That(s.State.Receiving.Single(o => o.InstanceId == "TEST_SECOND_ITEM").Progress[0].Ticks, Is.Zero);
        }
        [Test] public void IndependentActorsCanAdvanceIndependentOrdersInTheSameTick()
        {
            var s = Create(root =>
            {
                var second = root["receiving"]["items"][0].DeepClone(); second["instance"]["instanceId"] = "TEST_SECOND_ITEM";
                ((JArray)root["receiving"]["items"]).Add(second);
            });
            s.AssignUnit(Worker(s, "TECHNICIAN"), "r2"); s.AssignUnit(Worker(s, "TECHNICIAN", 1), "r2");
            s.AdmitIncoming(ItemId, "r2"); s.AdmitIncoming("TEST_SECOND_ITEM", "r2"); s.AdvanceOneTick();
            Assert.That(s.State.Receiving.All(o => o.Progress[0].Ticks == 1), Is.True);
            Assert.That(s.State.Receiving.Select(o => o.Progress[0].ActorId).Distinct().Count(), Is.EqualTo(2));
        }
        [Test] public void PartialWorkRoundtripRetainsActorCustodyKnowledgeAndPauseThenResumes()
        {
            var s = Create(); var tech = Worker(s, "TECHNICIAN");
            s.AssignUnit(tech, "r2"); s.AdmitIncoming(ItemId, "r2"); s.AdvanceOneTick(); s.PauseInspection(ItemId, true);
            var codec = new CampaignSaveCodec(json); var saved = codec.Serialize(new SavedSession(s.State, null));
            Assert.That(saved, Does.Not.Contain("ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION"));
            var restored = new CampaignSession(codec.Deserialize(saved).Campaign, null);
            Assert.That(Order(restored).RoomId, Is.EqualTo("r2")); Assert.That(Order(restored).Paused, Is.True);
            Assert.That(Order(restored).Progress[0].ActorId, Is.EqualTo(tech));
            restored.AdvanceOneTick(); Assert.That(Order(restored).Progress[0].Ticks, Is.EqualTo(1));
            restored.PauseInspection(ItemId, false); restored.AdvanceOneTick();
            Assert.That(Order(restored).Progress[0].Ticks, Is.EqualTo(2));
        }
        [TestCase("fraction")][TestCase("overflow")][TestCase("wrong-actor")][TestCase("dependency")]
        [TestCase("duplicate")][TestCase("missing")][TestCase("fingerprint")][TestCase("unknown-item")]
        public void CorruptWorkCannotLoad(string problem)
        {
            var s = Create(); s.AssignUnit(Worker(s, "TECHNICIAN"), "r2"); s.AdmitIncoming(ItemId, "r2"); s.AdvanceOneTick();
            var codec = new CampaignSaveCodec(json); var value = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            var order = value["receiving"][0]; var step = order["progress"][0];
            switch (problem)
            {
                case "fraction": step["ticks"] = 1.2; break;
                case "overflow": step["ticks"] = 3; break;
                case "wrong-actor": step["actorId"] = "unit-1"; break;
                case "dependency": order["progress"][1]["ticks"] = 1; order["progress"][1]["actorId"] = Worker(s, "SCIENTIST"); break;
                case "duplicate": ((JArray)value["receiving"]).Add(order.DeepClone()); break;
                case "missing": value.Property("receiving").Remove(); break;
                case "fingerprint": value["receivingFingerprint"] = "changed"; break;
                case "unknown-item": order["instanceId"] = "UNKNOWN"; break;
            }
            Assert.Catch(() => codec.Deserialize(value.ToString()));
        }
        [Test] public void VersionThreeMigrationPreservesAssignmentsAndTimeWithoutInventingItems()
        {
            var s = Create(); s.AssignUnit(Worker(s, "TECHNICIAN"), "r2"); s.AdvanceOneTick();
            var codec = new CampaignSaveCodec(json); var value = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            value["schemaVersion"] = 3;value.Property("archivedCargoSupply")?.Remove(); value.Property("teams").Remove(); value.Property("receiving").Remove(); value.Property("receivingFingerprint").Remove();
            value.Property("transfers").Remove();
            value.Property("expedition").Remove(); value.Property("missionFingerprint").Remove(); value.Property("combatFingerprint").Remove(); value.Property("careFingerprint").Remove(); value.Property("rescueFingerprint").Remove();
            var restored = codec.Deserialize(value.ToString()).Campaign;
            Assert.That(restored.Receiving, Is.Empty); Assert.That(restored.Clock.ElapsedTicks, Is.EqualTo(1));
            Assert.That(restored.Assignments.Single().UnitId, Is.EqualTo(s.State.Assignments.Single().UnitId));
        }
    }
}
