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
    public sealed class RecoveredCargoTests
    {
        private const string Rifle = "missing-operative-rifle-01";
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private CampaignSession New(string json = null) => new CampaignSession(new CampaignState(BootstrapReader.Read(json ?? Json), new RandomState(1, 1)), null);
        private void Fight(CampaignSession s, string id) { s.Engage(id); while (MissionCombat.Active(s.State) != null) s.AdvanceCombatRound(); }
        private void Work(CampaignSession s, string id)
        { var a = MissionField.Candidates(s.State, MissionField.Requirements(s.State, id)).First(); s.StartFieldWork(id, a.ActorId, a.ToolId); s.AdvanceFieldWork(); }
        private CampaignSession ReturnWithDiscovery(string json = null)
        {
            var s = New(json); s.Deploy(new[] { "unit-6", "unit-10", "unit-37", "unit-46" }); s.ChooseGate(false);
            Assert.Throws<InvalidOperationException>(s.RecoverMissionCargo);
            s.MoveParty("door-gate-to-yard"); s.Respond("yard-ignore", "unit-6"); Fight(s, "incident-yard-guards");
            s.MoveParty("door-yard-to-mainhall"); Work(s, s.State.Base.Mission.Travel.Field.DoorRecipes.Single(r=>r.DoorId=="door-mainhall-to-holding").Id);
            s.MoveParty("door-mainhall-to-holding"); Fight(s, "incident-holding-guards");
            var tick = s.State.Clock.ElapsedTicks; Work(s, s.State.Base.Cargo.Reveal.Id);
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(tick + 1)); Assert.That(RecoveredCargo.Revealed(s.State), Is.True);
            foreach (var r in s.State.Base.Care.Recipes) Work(s, r.Id);
            Assert.Throws<InvalidOperationException>(s.RecoverMissionCargo);
            s.MoveParty("door-mainhall-to-holding"); s.MoveParty("door-yard-to-mainhall"); s.MoveParty("door-gate-to-yard"); s.RedialGate(); s.ExtractMission();
            Assert.That(RecoveredCargo.CanRecover(s.State), Is.False); Assert.That(s.State.Cargo.Count,Is.EqualTo(2)); return s;
        }
        private void Inspect(CampaignSession s)
        {
            s.AdmitIncoming(Rifle, "r2");
            foreach (var profession in new[] { "TECHNICIAN", "SCIENTIST" })
            {
                var worker = s.State.Base.Receiving.Workers.First(w => w.Qualifications.TryGetValue(profession, out var tier) && tier >= 1 && w.ToolServices.Contains(profession == "TECHNICIAN" ? "TET1" : "SCT1"));
                s.AssignUnit(worker.UnitId, "r2");
            }
            for (int i = 0; i < 4; i++) s.AdvanceOneTick();
        }
        [Test] public void RecoveryInspectionPreservesInstancesAndExplicitMissionResetRestoresLoot()
        {
            var s = ReturnWithDiscovery(); var original = s.State; Assert.That(s.State.Cargo.Count, Is.EqualTo(2));
            Assert.Throws<InvalidOperationException>(s.RecoverMissionCargo); Assert.That(s.State, Is.SameAs(original));
            var payload = s.State.Cargo.Single(i => i.Id == Rifle).Payload;
            Assert.That(payload, Does.Contain("ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION"));
            Assert.That(RecoveredCargo.Name(s.State, s.State.Cargo.Single(i => i.Id == Rifle)), Is.EqualTo("Unknown object"));
            Inspect(s); var order = s.State.Receiving.Single(); var catalog = RecoveredCargo.Catalog(s.State);
            Assert.That(ReceivingWork.IsComplete(catalog, order), Is.True);
            Assert.That(ReceivingWork.Condition(catalog, order), Is.EqualTo("UNKNOWN"));
            Assert.That(ReceivingWork.KnownTags(catalog, order), Does.Contain("RIFLE").And.Not.Contain("ASGARD").And.Not.Contain("ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION"));
            original = s.State;
            s.MoveCargo(Rifle, "r11"); original = s.State;
            Assert.Throws<InvalidOperationException>(() => s.MoveCargo(Rifle, "r9")); Assert.That(s.State, Is.SameAs(original));
            s.MoveCargo(Rifle, "r10"); s.AdvanceOneTick(); s.ResetMission();
            var codec = new CampaignSaveCodec(Json); var restored = codec.Deserialize(codec.Serialize(new SavedSession(s.State, null))).Campaign;
            Assert.That(restored.Cargo,Is.Empty);Assert.That(restored.Receiving.Any(o=>o.InstanceId==Rifle),Is.False);
            var replay = new CampaignSession(restored, null); replay.Deploy(new[] { "unit-46" }); replay.ChooseGate(false); replay.MoveParty("door-gate-to-yard");
            Assert.That(replay.State.Cargo,Is.Empty);
        }
        [Test] public void NoFieldOrBaseAdmissionCanInventAnUnrecoveredObject()
        {
            var s = New(); var original = s.State;
            Assert.Throws<InvalidOperationException>(() => s.AdmitIncoming(Rifle, "r2")); Assert.That(s.State, Is.SameAs(original));
            s.Deploy(new[] { "unit-6" }); s.ChooseGate(false);
            Assert.Throws<InvalidOperationException>(() => s.StartFieldWork(s.State.Base.Cargo.Reveal.Id, "unit-6", null));
            s.RedialGate(); s.ExtractMission(); Assert.Throws<InvalidOperationException>(s.RecoverMissionCargo);
        }
        [TestCase("receiving")][TestCase("containment")] public void FullDestinationRejectsTheWholeTransferWithoutMutation(string destination)
        {
            var j = JObject.Parse(Json);
            if (destination == "receiving") j["receiving"]["rooms"].Single(r => (string)r["definitionId"] == "receiving")["capacityByTier"]["1"] = 0;
            else j["roomStorage"]["profiles"].Single(r => (string)r["definitionId"] == "containment")["tabs"][0]["capacityByTier"]["1"] = 0;
            var s = ReturnWithDiscovery(j.ToString());
            if (destination == "containment") Inspect(s);
            var original = s.State;
            Assert.Catch(() => { if (destination == "receiving") s.AdmitIncoming(Rifle, "r2"); else s.MoveCargo(Rifle, "r10"); });
            Assert.That(s.State, Is.SameAs(original)); Assert.That(s.State.Cargo.Count, Is.EqualTo(2));
        }
        [TestCase("payload")][TestCase("id")][TestCase("duplicate")][TestCase("room")][TestCase("future")][TestCase("fingerprint")]
        public void TamperedPhysicalCargoCannotLoad(string problem)
        {
            var s = ReturnWithDiscovery(); var codec = new CampaignSaveCodec(Json); var j = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            var row = j["cargo"][1];
            if (problem == "payload") row["payload"] = "{}";
            if (problem == "id") row["id"] = "invented";
            if (problem == "duplicate") ((JArray)j["cargo"]).Add(row.DeepClone());
            if (problem == "room") row["roomId"] = "r10";
            if (problem == "future") row["recoveredTick"] = 100000;
            if (problem == "fingerprint") j["cargoFingerprint"] = "bad";
            Assert.Catch(() => codec.Deserialize(j.ToString()));
        }
        private void Contain(CampaignSession s) { Inspect(s); s.MoveCargo(Rifle, "r10"); }
        private CampaignSession Reload(CampaignSession s, string json = null)
        { var codec = new CampaignSaveCodec(json ?? Json); return new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State, null))).Campaign, null); }
        [Test] public void StorageToAnalysisRevealsPropertiesAndEquipmentTransferSurvivesReload()
        {
            var s = ReturnWithDiscovery(); Inspect(s); var payload = s.State.Cargo.Single(i => i.Id == Rifle).Payload;
            Assert.That(CargoHandling.Condition(s.State, s.State.Cargo.Single(i => i.Id == Rifle)), Is.EqualTo("INTACT"));
            var transferTick = s.State.Clock.ElapsedTicks;
            RecoveredCargo.CheckStorageTransfer(s.State, Rifle, "r11");
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(transferTick), "Routing previews spend no time.");
            s.MoveCargo(Rifle, "r11"); var before = s.State;
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(transferTick + 1));
            Assert.Throws<InvalidOperationException>(() => s.MoveCargo(Rifle, "r9")); Assert.That(s.State, Is.SameAs(before));
            s.MoveCargo(Rifle, "r10");
            var scientist = s.State.Base.Receiving.Workers.First(w => w.Qualifications.ContainsKey("SCIENTIST") && w.ToolServices.Contains("SCT1"));
            s.AssignUnit(scientist.UnitId, "r10"); s.AdvanceOneTick(); s.AdvanceOneTick();
            Assert.That(s.State.Cargo.Single(i => i.Id == Rifle).Examination, Is.Null, "Containment never processes properties, even with a Scientist assigned.");
            var custodyTick = s.State.Clock.ElapsedTicks; s.StartCargoExamination(Rifle, "r4");
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(custodyTick), "Analysis changes custody only.");
            s.AssignUnit(scientist.UnitId, "r2"); s.AdmitIncoming("equipment-crate-01", "r2");
            for (int n = 0; n < 4; n++) s.AdvanceOneTick();
            s.MoveCargo("equipment-crate-01", "r10"); before = s.State;
            Assert.Throws<InvalidOperationException>(() => s.StartCargoExamination("equipment-crate-01", "r4"));
            Assert.That(s.State, Is.SameAs(before), "A full Analysis workspace cannot move custody or release either reservation.");
            s.AssignUnit(scientist.UnitId, "r4"); s.AdvanceOneTick(); s = Reload(s);
            var processing = s.State.Cargo.Single(i => i.Id == Rifle);
            Assert.That(processing.RoomId, Is.EqualTo("r10")); Assert.That(processing.CustodyRoomId, Is.EqualTo("r4"));
            var codec = new CampaignSaveCodec(Json); var reserved = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            var full = JObject.Parse(Json); full["roomStorage"]["profiles"].Single(p => (string)p["definitionId"] == "containment")["tabs"][0]["capacityByTier"]["1"] = 0;
            Assert.Catch(() => new CampaignSaveCodec(full.ToString()).Deserialize(reserved.ToString()), "Analysis custody must not release reserved Containment capacity.");
            Assert.That(s.State.Cargo.Single(i => i.Id == Rifle).Examination.Ticks, Is.EqualTo(1));
            Assert.That(CargoExamination.Known(s.State, s.State.Cargo.Single(i => i.Id == Rifle)), Does.Not.Contain("ASGARD"));
            before = s.State; Assert.Throws<InvalidOperationException>(() => s.MoveCargo(Rifle, "r9")); Assert.That(s.State, Is.SameAs(before));
            s.AdvanceOneTick();
            Assert.That(CargoExamination.Known(s.State, s.State.Cargo.Single(i => i.Id == Rifle)), Does.Contain("ASGARD").And.Contain("ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION"));
            Assert.That(RecoveredCargo.Name(s.State, s.State.Cargo.Single(i => i.Id == Rifle)), Is.EqualTo("Asgard Electromagnetic Rifle"));
            custodyTick = s.State.Clock.ElapsedTicks; s.ReturnCargoToStorage(Rifle); s = Reload(s);
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(custodyTick), "Returning to reserved storage changes custody only.");
            Assert.That(s.State.Cargo.Single(i => i.Id == Rifle).CustodyRoomId, Is.EqualTo("r10"));
            s.MoveCargo(Rifle, "r9"); s.ResetMission(); s = Reload(s);
            var item = s.State.Cargo.Single(i => i.Id == Rifle);
            Assert.That(item.RoomId, Is.EqualTo("r9")); Assert.That(item.Retained, Is.True); Assert.That(item.Payload, Is.EqualTo(payload));
            Assert.That(RecoveredCargo.Name(s.State, item), Is.EqualTo("Asgard Electromagnetic Rifle"));
            // The crate can be held without invented condition or extra properties.
            s.MoveCargo("equipment-crate-01", "r11"); s.MoveCargo("equipment-crate-01", "r10");
            Assert.That(s.State.Cargo.Single(i => i.Id == "equipment-crate-01").Examination, Is.Null);
        }
        [Test] public void StorageCustodyMigrationPreservesCompletedFindingsAndStopsLegacyStorageWork()
        {
            var s = ReturnWithDiscovery(); Inspect(s); s.MoveCargo(Rifle, "r10"); s.StartCargoExamination(Rifle, "r4");
            var scientist = s.State.Base.Receiving.Workers.First(w => w.Qualifications.ContainsKey("SCIENTIST") && w.ToolServices.Contains("SCT1"));
            s.AssignUnit(scientist.UnitId, "r4"); s.AdvanceOneTick();
            var codec = new CampaignSaveCodec(Json);
            foreach (var completed in new[] { false, true })
            {
                if (completed) s.AdvanceOneTick();
                var record = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
                record["schemaVersion"] = 18;record.Property("archivedCargoSupply")?.Remove(); record["processingFingerprint"] = JObject.Parse(Json)["cargoProcessing"]["previousProcessingFingerprint"];
                foreach (JObject row in record["cargo"])
                {
                    row.Property("storageLocationId").Remove(); row.Property("custodyRoomId").Remove();
                    if ((string)row["id"] != Rifle) continue;
                    row["examination"]["roomId"] = "r10"; row["examination"]["primaryRoomId"] = "r10";
                    ((JObject)row["examination"]).Property("legacyStorageFinding").Remove();
                }
                var restored = codec.Deserialize(record.ToString()).Campaign; var item = restored.Cargo.Single(i => i.Id == Rifle);
                Assert.That(item.RoomId, Is.EqualTo("r10")); Assert.That(item.CustodyRoomId, Is.EqualTo("r10"));
                Assert.That(item.Examination != null, Is.EqualTo(completed));
                Assert.That(CargoExamination.Identified(restored, item), Is.EqualTo(completed));
                Assert.That(codec.Deserialize(codec.Serialize(new SavedSession(restored, null))).Campaign.Cargo.Single(i => i.Id == Rifle).Payload, Is.EqualTo(item.Payload));
            }
        }
        [TestCase("identity")][TestCase("property")]
        public void CompletedExaminationCannotApproveAnUnresolvedObject(string missing)
        {
            var j = JObject.Parse(Json);
            var entry = j["missionCargo"]["items"].Single(i => (string)i["instance"]["instanceId"] == Rifle);
            if (missing == "identity") ((JObject)entry["item"]).Property("name").Remove();
            else
                foreach (var key in new[] { "instance", "physicalPayload" })
                    entry[key]["reality"]["authoredTags"].Single(t => (string)t == "ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION").Remove();
            var s = ReturnWithDiscovery(j.ToString()); Inspect(s); s.MoveCargo(Rifle, "r10");
            var scientist = s.State.Base.Receiving.Workers.First(w => w.Qualifications.ContainsKey("SCIENTIST") && w.ToolServices.Contains("SCT1"));
            if (s.State.Cargo.Single(i => i.Id == Rifle).Examination == null) s.StartCargoExamination(Rifle, "r4"); s.AssignUnit(scientist.UnitId, "r4"); s.AdvanceOneTick(); s.AdvanceOneTick();
            var item = s.State.Cargo.Single(i => i.Id == Rifle);
            Assert.That(CargoExamination.Completed(item), Is.True);
            Assert.That(CargoExamination.Identified(s.State, item), Is.False);
            Assert.That(CargoExamination.EquipmentReady(s.State, item), Is.False);
            Assert.That(RecoveredCargo.Name(s.State, item), Is.EqualTo("Unknown rifle"));
            var before = s.State; Assert.Throws<InvalidOperationException>(() => s.MoveCargo(Rifle, "r9")); Assert.That(s.State, Is.SameAs(before));
            s.MoveCargo(Rifle, "r11"); s.MoveCargo(Rifle, "r10");
            Assert.That(s.State.Cargo.Single(i => i.Id == Rifle).RoomId, Is.EqualTo("r10"));
        }
        [Test] public void AnalysisWorkIsStickyAndFinishStepTransferWaitsWhileDestinationFailureIsAtomic()
        {
            var j = JObject.Parse(Json);
            j["roomStorage"]["profiles"].Single(p => (string)p["definitionId"] == "equipment_storage")["capacityByTier"]["1"] = 0;
            var s = ReturnWithDiscovery(j.ToString()); Inspect(s); s.MoveCargo(Rifle, "r10");
            var scientist = s.State.Base.Receiving.Workers.First(w => w.Qualifications.ContainsKey("SCIENTIST") && w.ToolServices.Contains("SCT1"));
            if (s.State.Cargo.Single(i => i.Id == Rifle).Examination == null) s.StartCargoExamination(Rifle, "r4"); s.AssignUnit(scientist.UnitId, "r4"); s.AdvanceOneTick(); s.PauseCargoExamination(Rifle, true);
            s.PlanTransfer(scientist.UnitId, "r2", StaffTransferTiming.FinishStep); s.AdvanceOneTick();
            Assert.That(s.State.Assignments.Single(a => a.UnitId == scientist.UnitId).RoomInstanceId, Is.EqualTo("r4"));
            s.PauseCargoExamination(Rifle, false); s.AdvanceOneTick();
            Assert.That(s.State.Assignments.Single(a => a.UnitId == scientist.UnitId).RoomInstanceId, Is.EqualTo("r2"));
            var before = s.State; Assert.Throws<InvalidOperationException>(() => s.MoveCargo(Rifle, "r9"));
            Assert.That(s.State, Is.SameAs(before)); Assert.That(s.State.Cargo.Single(i => i.Id == Rifle).Retained, Is.False);
            var codec = new CampaignSaveCodec(j.ToString()); var saved = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            saved["cargo"].Single(i => (string)i["id"] == Rifle)["examination"]["completedTick"] = 0;
            Assert.Catch(() => codec.Deserialize(saved.ToString()));
        }
        [Test] public void OriginalRosterSchemaSixteenCampaignCanEnterNewFlowWithoutInstantKnowledgeOrTierUpgrade()
        {
            var original = JObject.Parse(Json)["previousProgressionSnapshot"].ToString();
            var s = ReturnWithDiscovery(original); Contain(s); var codec = new CampaignSaveCodec(original);
            var saved = JObject.Parse(codec.Serialize(new SavedSession(s.State, null))); saved["schemaVersion"] = 16;saved.Property("archivedCargoSupply")?.Remove();
            saved.Property("processingFingerprint").Remove(); foreach (JObject item in saved["cargo"]) item.Property("examination").Remove();
            var current = new CampaignSaveCodec(Json); s = new CampaignSession(current.Deserialize(saved.ToString()).Campaign, null);
            Assert.That(s.State.Base.Units.Single(u => u.Id == "unit-1").Tier, Is.EqualTo(1));
            Assert.That(s.State.Cargo.Single(i => i.Id == Rifle).Examination, Is.Null);
            s.StartCargoExamination(Rifle, "r4");
            var scientist = s.State.Base.Receiving.Workers.First(w => w.Qualifications.ContainsKey("SCIENTIST") && w.ToolServices.Contains("SCT1"));
            if (s.State.Cargo.Single(i => i.Id == Rifle).Examination == null) s.StartCargoExamination(Rifle, "r4"); s.AssignUnit(scientist.UnitId, "r4"); s.AdvanceOneTick(); s.AdvanceOneTick(); s.MoveCargo(Rifle, "r9");
            var restored = current.Deserialize(current.Serialize(new SavedSession(s.State, null))).Campaign;
            Assert.That(restored.Base.Units.Single(u => u.Id == "unit-1").Tier, Is.EqualTo(1));
            Assert.That(restored.Cargo.Single(i => i.Id == Rifle).RoomId, Is.EqualTo("r9"));
        }
        [Test] public void ResetObjectPreservesAssignmentsTeamsOtherCargoAndRoundTripsWithoutWorkReferences()
        {
            var s = ReturnWithDiscovery(); Inspect(s); s.MoveCargo(Rifle, "r10");
            var scientist = s.State.Base.Receiving.Workers.First(w => w.Qualifications.ContainsKey("SCIENTIST") && w.ToolServices.Contains("SCT1"));
            if (s.State.Cargo.Single(i => i.Id == Rifle).Examination == null) s.StartCargoExamination(Rifle, "r4"); s.AssignUnit(scientist.UnitId, "r4"); s.AdvanceOneTick();
            s.PlanTransfer(scientist.UnitId, "r2", StaffTransferTiming.FinishStep);
            s.CreateTeam("r6", "SG-1"); s.SetTeamMember("sg-team-r6", "unit-46", true);
            s.AdmitIncoming("equipment-crate-01", "r2");
            var before = s.State; var payload = before.Cargo.Single(i => i.Id == Rifle).Payload;
            s.ResetCargoObject(Rifle); s = Reload(s);
            var item = s.State.Cargo.Single(i => i.Id == Rifle);
            Assert.That(item.RoomId, Is.Null); Assert.That(item.Examination, Is.Null); Assert.That(item.Handling, Is.Null); Assert.That(item.Retained, Is.False);
            Assert.That(item.Payload, Is.EqualTo(payload)); Assert.That(RecoveredCargo.Name(s.State, item), Is.EqualTo("Unknown object"));
            Assert.That(s.State.Assignments.Select(a => a.UnitId + ":" + a.RoomInstanceId), Is.EquivalentTo(before.Assignments.Select(a => a.UnitId + ":" + a.RoomInstanceId)));
            Assert.That(s.State.Teams.Single().Members, Is.EqualTo(before.Teams.Single().Members));
            Assert.That(s.State.Receiving.Any(o => o.InstanceId == Rifle), Is.False); Assert.That(s.State.Transfers.Any(t => t.WorkInstanceId == Rifle), Is.False);
            Assert.That(s.State.Cargo.Single(i => i.Id == "equipment-crate-01").CustodyRoomId, Is.EqualTo("r2"));
            Assert.That(s.State.Clock.ElapsedTicks, Is.EqualTo(before.Clock.ElapsedTicks));
            s.AdmitIncoming(Rifle, "r2"); // Replay uses the saved staff configuration.
        }
        private string PersonalEquipmentFixture(string crateTag)
        {
            var j = JObject.Parse(Json); var entry = j["missionCargo"]["items"].Single(i => (string)i["instance"]["instanceId"] == "equipment-crate-01");
            entry["item"]["name"] = "Fixture " + crateTag.ToLowerInvariant();
            entry["item"]["storage"]["storageClasses"] = new JArray("INV", "CC", "EQ");
            entry["item"]["possibleReality"] = new JObject { ["inherentTags"] = new JArray("PHYSICAL_OBJECT", crateTag) };
            foreach (var key in new[] { "instance", "physicalPayload" })
            {
                entry[key]["reality"]["authoredTags"] = new JArray("PHYSICAL_OBJECT", crateTag);
                entry[key]["state"]["condition"] = "INTACT";
            }
            return j.ToString();
        }
        private void PreparePersonalEquipment(CampaignSession s, string id)
        {
            if (id == Rifle) Inspect(s);
            else
            {
                s.AdmitIncoming(id, "r2");
                foreach (var profession in new[] { "TECHNICIAN", "SCIENTIST" })
                {
                    var worker = s.State.Base.Receiving.Workers.First(w => w.Qualifications.ContainsKey(profession) && w.ToolServices.Contains(profession == "TECHNICIAN" ? "TET1" : "SCT1"));
                    s.AssignUnit(worker.UnitId, "r2");
                }
                for (int n = 0; n < 4; n++) s.AdvanceOneTick();
            }
            s.MoveCargo(id, "r10");
            var scientist = s.State.Base.Receiving.Workers.First(w => w.Qualifications.ContainsKey("SCIENTIST") && w.ToolServices.Contains("SCT1"));
            if (s.State.Cargo.Single(i => i.Id == id).Examination == null) s.StartCargoExamination(id, "r4"); s.AssignUnit(scientist.UnitId, "r4"); s.AdvanceOneTick(); s.AdvanceOneTick(); s.MoveCargo(id, "r9");
        }
        [Test] public void PersonalEquipmentWeaponArmorSnapshotsAffectCombatAndDoNotRewriteReturnedHistory()
        {
            var json = PersonalEquipmentFixture("ARMOR"); var s = ReturnWithDiscovery(json);
            PreparePersonalEquipment(s, Rifle); PreparePersonalEquipment(s, "equipment-crate-01");
            s.IssueEquipment(Rifle, "unit-6"); s.IssueEquipment("equipment-crate-01", "unit-6"); s = Reload(s, json);
            Assert.That(s.State.Cargo.All(i => i.RoomId == "r9" && i.EquippedUnitId == "unit-6"), Is.True, "Assigned storage remains Equipment Storage; personal custody changes.");
            Assert.That(UnitEquipment.Loadout(s.State, "unit-6").Select(i => i.Slot), Is.EquivalentTo(new[] { "weapon", "armor" }));
            s.ResetMission();
            if (s.State.Assignments.Any(a => a.UnitId == "unit-6")) s.UnassignUnit("unit-6");
            var party = new[] { "unit-6" }.Concat(s.State.Base.Units.Where(u => u.Id != "unit-6" && !s.State.Assignments.Any(a => a.UnitId == u.Id)).Take(3).Select(u => u.Id)).ToArray();
            s.Deploy(party); s.ChooseGate(true);
            var tools = s.State.Expedition.Party.First().Tools.Select(t => t.InstanceId).ToArray();
            s.MoveParty("door-gate-to-yard"); s.Respond("yard-ignore", "unit-6"); s.Engage("incident-yard-guards"); s.AdvanceCombatRound();
            Assert.That(MissionCombat.Inspect(s.State).GuardHealth["guard-yard-01"], Is.EqualTo(66));
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(94));
            s = Reload(s, json);
            var before = s.State; Assert.Throws<InvalidOperationException>(() => s.ReturnEquipment(Rifle, "r9")); Assert.That(s.State, Is.SameAs(before));
            var codec = new CampaignSaveCodec(json); var forged = JObject.Parse(codec.Serialize(new SavedSession(s.State, null)));
            forged["expedition"]["party"][0]["equipment"][1]["damage"] = 30.1; Assert.Catch(() => codec.Deserialize(forged.ToString()));
            while (MissionCombat.Active(s.State) != null) s.AdvanceCombatRound();
            s.MoveParty("door-gate-to-yard"); s.ExtractMission(); var health = MissionCombat.Inspect(s.State).PartyHealth["unit-6"];
            s.ReturnEquipment(Rifle, "r9"); s.ReturnEquipment("equipment-crate-01", "r9"); s = Reload(s, json);
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-6"], Is.EqualTo(health));
            Assert.That(s.State.Expedition.Party.First().Tools.Select(t => t.InstanceId), Is.EqualTo(tools));
            Assert.That(s.State.Cargo.All(i => i.RoomId == "r9" && i.EquippedUnitId == null), Is.True);
        }
        [Test] public void PersonalEquipmentRejectsUnknownAndOccupiedSlotsAndRetainsReservedStorageCapacity()
        {
            var json = PersonalEquipmentFixture("WEAPON"); var s = ReturnWithDiscovery(json);
            Assert.Throws<InvalidOperationException>(() => s.IssueEquipment(Rifle, "unit-6"));
            PreparePersonalEquipment(s, Rifle); PreparePersonalEquipment(s, "equipment-crate-01"); s.IssueEquipment(Rifle, "unit-6");
            var before = s.State; Assert.Throws<InvalidOperationException>(() => s.IssueEquipment("equipment-crate-01", "unit-6")); Assert.That(s.State, Is.SameAs(before));
            s.IssueEquipment("equipment-crate-01", "unit-10");
            Assert.That(UnitEquipment.Loadout(s.State, "unit-10").Single().Damage, Is.EqualTo(24));
            var codec = new CampaignSaveCodec(json); var record = codec.Serialize(new SavedSession(s.State, null));
            var full = JObject.Parse(json); full["roomStorage"]["profiles"].Single(i => (string)i["definitionId"] == "equipment_storage")["capacityByTier"]["1"] = 1;
            Assert.Catch(() => new CampaignSaveCodec(full.ToString()).Deserialize(record), "Both equipped items still reserve their storage places.");
            s.ReturnEquipment(Rifle, "r9"); Assert.That(s.State.Cargo.Single(i => i.Id == Rifle).RoomId, Is.EqualTo("r9"));
            Assert.That(s.State.Cargo.Single(i => i.Id == Rifle).EquippedUnitId, Is.Null);
        }
        [Test] public void PersonalEquipmentSchemaSeventeenMigrationDoesNotInventCarriedItemsOrRewriteCombat()
        {
            var s = ReturnWithDiscovery(); var codec = new CampaignSaveCodec(Json); var before = MissionCombat.Inspect(s.State).PartyHealth["unit-6"];
            var record = JObject.Parse(codec.Serialize(new SavedSession(s.State, null))); record["schemaVersion"] = 17;record.Property("archivedCargoSupply")?.Remove(); record.Property("equipmentFingerprint").Remove();
            foreach (JObject item in record["cargo"]) item.Property("equippedUnitId").Remove();
            foreach (JObject member in record["expedition"]["party"]) member.Property("equipment").Remove();
            var restored = codec.Deserialize(record.ToString()).Campaign;
            Assert.That(restored.Cargo.All(i => i.EquippedUnitId == null), Is.True);
            Assert.That(restored.Expedition.Party.All(m => m.Equipment.Count == 0), Is.True);
            Assert.That(MissionCombat.Inspect(restored).PartyHealth["unit-6"], Is.EqualTo(before));
        }
        [Test] public void SchemaFourteenSaveRetainsItsMissionAndDoesNotGainCargo()
        {
            var s = New(); s.Deploy(new[] { "unit-6" }); s.ChooseGate(false); var codec = new CampaignSaveCodec(Json);
            var j = JObject.Parse(codec.Serialize(new SavedSession(s.State, null))); j["schemaVersion"] = 14;j.Property("archivedCargoSupply")?.Remove(); j.Property("cargo").Remove(); j.Property("cargoFingerprint").Remove();
            var state = codec.Deserialize(j.ToString()).Campaign; Assert.That(state.Cargo, Is.Empty); Assert.That(state.Expedition.Party.Single().UnitId, Is.EqualTo("unit-6"));
        }
        [Test] public void JoinedAnalysisUsesGroupStaffAndSplitRetainsStickyScientistProgress()
        {
            var s=ReturnWithDiscovery();Inspect(s);s.MoveCargo(Rifle,"r10");
            s.AssignUnit("unit-22","r12");s.AssignUnit("unit-1","r12");s.BuildRoom("analysis",1,6,2,"unit-22");
            for(int i=0;i<480;i++)s.AdvanceOneTick();
            var lab=s.State.Construction.Sites.Single().RoomId;
            var scientist=s.State.Base.Receiving.Workers.First(w=>w.Qualifications.ContainsKey("SCIENTIST")&&w.ToolServices.Contains("SCT1"));
            s.AssignUnit(scientist.UnitId,lab);s.StartCargoExamination(Rifle,"r4");s.AdvanceOneTick();
            Assert.That(s.State.Cargo.Single(i=>i.Id==Rifle).Examination.Ticks,Is.Zero,"Idle roster and unrelated rooms cannot supply an Actor.");
            s.JoinRooms("r4",lab);s.AdvanceOneTick();s=Reload(s);
            Assert.That(s.State.Cargo.Single(i=>i.Id==Rifle).Examination.ActorId,Is.EqualTo(scientist.UnitId));
            s.SplitRooms("r4");s.AdvanceOneTick();
            Assert.That(s.State.Cargo.Single(i=>i.Id==Rifle).Examination.Ticks,Is.EqualTo(1));
            s.JoinRooms("r4",lab);s.PlanTransfer(scientist.UnitId,"r2",StaffTransferTiming.FinishStep);
            Assert.That(s.State.Assignments.Single(a=>a.UnitId==scientist.UnitId).RoomInstanceId,Is.EqualTo(lab));
            s.AdvanceOneTick();
            Assert.That(s.State.Assignments.Single(a=>a.UnitId==scientist.UnitId).RoomInstanceId,Is.EqualTo("r2"));
            var item=s.State.Cargo.Single(i=>i.Id==Rifle);
            Assert.That(CargoExamination.Completed(item),Is.True);Assert.That(item.RoomId,Is.EqualTo("r10"));Assert.That(item.CustodyRoomId,Is.EqualTo("r4"));
        }
    }
}
