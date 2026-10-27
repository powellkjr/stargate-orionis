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
    public sealed class SGTeamTests
    {
        private string Json => File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private CampaignSession Create(string json = null) => new CampaignSession(new CampaignState(BootstrapReader.Read(json ?? Json), new RandomState(1, 1)), null);
        [Test] public void ReadyRoomStartsWithFourAndCannotAcceptOrdinaryStaff()
        {
            var s = Create(); var room = s.State.Base.Rooms.Single(r => r.Id == "r6");
            Assert.That(room.Definition.TeamSlots, Is.EqualTo(4)); Assert.That(room.StaffingCapacity, Is.EqualTo(4));
            Assert.That(room.Definition.StaffingByTier.Keys, Is.EqualTo(new[] { 1, 2, 3 }));
            Assert.Throws<InvalidOperationException>(() => s.AssignUnit("unit-1", "r6"));
            Assert.Throws<InvalidOperationException>(() => s.CreateTeam("r5", "Wrong room"));
            s.CreateTeam("r6", "SG-1"); Assert.That(s.State.Teams.Single().Members, Is.Empty);
            Assert.Throws<InvalidOperationException>(() => s.CreateTeam("r6", "SG-2"));
        }
        [Test] public void SixMemberTeamSelectsFourAndExperienceIncludesBothReserves()
        {
            var source = JObject.Parse(Json);
            source["rooms"].Single(r => (string)r["id"] == "r6")["constructionTier"] = 3;
            var s = Create(source.ToString()); s.CreateTeam("r6", "SG-1");
            for (int i = 1; i <= 6; i++) s.SetTeamMember("sg-team-r6", "unit-" + i, true);
            Assert.Throws<InvalidOperationException>(() => Expeditions.Deploy(s.State, s.State.Teams.Single().Members, "sg-team-r6"));
            s.DeployTeam("sg-team-r6", new[] { "unit-2", "unit-3", "unit-4", "unit-5" });
            Assert.That(s.State.Expedition.Party.Select(p => p.UnitId), Is.EqualTo(new[] { "unit-2", "unit-3", "unit-4", "unit-5" }));
            Assert.That(Expeditions.IsDeployed(s.State, "unit-1"), Is.False);
            var shares = SGTeams.ExperienceShares(s.State, "sg-team-r6", 60);
            Assert.That(shares.Count, Is.EqualTo(6)); Assert.That(shares.Values.All(v => v == 10), Is.True);
            var codec = new CampaignSaveCodec(Json);
            var restored = codec.Deserialize(codec.Serialize(new SavedSession(s.State, null))).Campaign;
            Assert.That(restored.Teams.Single().Members.Count, Is.EqualTo(6));
            Assert.That(restored.Expedition.Party.Count, Is.EqualTo(4));
        }
        [Test] public void CapacityMigrationPreservesAnActiveTeamAndItsClockAndAssignments()
        {
            var source = JObject.Parse(Json); var oldJson = source["previousCapacitySnapshot"].ToString();
            var old = Create(oldJson); old.AssignUnit("unit-1", "r1"); old.CreateTeam("r6", "SG-9");
            for (int i = 2; i <= 5; i++) old.SetTeamMember("sg-team-r6", "unit-" + i, true);
            old.DeployTeam("sg-team-r6");
            var codec = new CampaignSaveCodec(Json);
            var restored = codec.Deserialize(new CampaignSaveCodec(oldJson).Serialize(new SavedSession(old.State, new SelectionReference(SelectionKind.Room, "r1"))));
            Assert.That(restored.Campaign.Base.Rooms.Single(r => r.Id == "r1").StaffingCapacity, Is.EqualTo(4));
            Assert.That(restored.Campaign.Base.Storage.Find("containment").Tabs.Single().CapacityByTier[1], Is.EqualTo(40));
            Assert.That(restored.Campaign.Base.Storage.Find("supply_storage").CapacityByTier[1], Is.EqualTo(2000));
            Assert.That(restored.Campaign.Assignments.Single().UnitId, Is.EqualTo("unit-1"));
            Assert.That(restored.Campaign.Teams.Single().Designation, Is.EqualTo("SG-9"));
            Assert.That(restored.Campaign.Expedition.Party.Select(p => p.UnitId), Is.EqualTo(old.State.Expedition.Party.Select(p => p.UnitId)));
            Assert.That(restored.Campaign.Clock.ElapsedTicks, Is.EqualTo(old.State.Clock.ElapsedTicks));
            Assert.That(restored.Selection.Id, Is.EqualTo("r1"));
        }
        [Test] public void MembershipIsPermanentExclusiveAndDoesNotSilentlyRemoveBaseWork()
        {
            var s = Create(); s.CreateTeam("r6", "SG-1"); s.AssignUnit("unit-1", "r1"); var before = s.State;
            Assert.Throws<InvalidOperationException>(() => s.SetTeamMember("sg-team-r6", "unit-1", true)); Assert.That(s.State, Is.SameAs(before));
            s.UnassignUnit("unit-1");
            for (int i = 1; i <= 4; i++) s.SetTeamMember("sg-team-r6", "unit-" + i, true);
            before = s.State; Assert.Throws<InvalidOperationException>(() => s.SetTeamMember("sg-team-r6", "unit-5", true)); Assert.That(s.State, Is.SameAs(before));
            Assert.Throws<InvalidOperationException>(() => s.AssignUnit("unit-1", "r1"));
            Assert.Throws<InvalidOperationException>(() => s.Deploy(new[] { "unit-1" }));
            s.SetTeamMember("sg-team-r6", "unit-1", false); s.AssignUnit("unit-1", "r1");
            Assert.That(s.State.Teams.Single().Members, Is.EqualTo(new[] { "unit-2", "unit-3", "unit-4" })); Assert.That(s.State.Clock.ElapsedTicks, Is.Zero);
        }
        [Test] public void OffworldTeamCannotBeEditedAndResetKeepsItsIdentityAndMembership()
        {
            var s = Create(); s.CreateTeam("r6", "SG-7"); s.SetTeamMember("sg-team-r6", "unit-6", true); s.DeployTeam("sg-team-r6");
            var before = s.State; Assert.That(s.State.Expedition.TeamId, Is.EqualTo("sg-team-r6"));
            Assert.Throws<InvalidOperationException>(() => s.SetTeamMember("sg-team-r6", "unit-6", false));
            Assert.Throws<InvalidOperationException>(() => s.RenameTeam("sg-team-r6", "SG-8")); Assert.That(s.State, Is.SameAs(before));
            s.ChooseGate(false); s.RedialGate(); s.ExtractMission(); Assert.That(s.State.Teams.Single().Designation, Is.EqualTo("SG-7"));
            Assert.Throws<InvalidOperationException>(() => s.AssignUnit("unit-6", "r1"));
            s.ResetMission(); Assert.That(s.State.Teams.Single().Members, Is.EqualTo(new[] { "unit-6" }));
            s.RenameTeam("sg-team-r6", "SG-8"); s.DeployTeam("sg-team-r6"); Assert.That(s.State.Expedition.TeamId, Is.EqualTo("sg-team-r6"));
        }
        [Test] public void UnitsCannotJoinTwoTeamsEvenInDifferentPhysicalReadyRooms()
        {
            var j = JObject.Parse(Json); var extra = j["rooms"].Single(r => (string)r["id"] == "r6").DeepClone(); extra["id"] = "r12"; extra["col"] = 9; ((JArray)j["rooms"]).Add(extra);
            var s = Create(j.ToString()); s.CreateTeam("r6", "SG-1"); s.CreateTeam("r12", "SG-2"); s.SetTeamMember("sg-team-r6", "unit-6", true);
            Assert.Throws<InvalidOperationException>(() => s.SetTeamMember("sg-team-r11", "unit-6", true));
        }
        [TestCase("membership")][TestCase("room")][TestCase("mission")][TestCase("name")][TestCase("missing")]
        public void CorruptTeamSavesCannotChangeAssignmentsOrMissionIdentity(string problem)
        {
            var s = Create(); s.CreateTeam("r6", "SG-1"); s.SetTeamMember("sg-team-r6", "unit-6", true); s.DeployTeam("sg-team-r6");
            var c = new CampaignSaveCodec(Json); var j = JObject.Parse(c.Serialize(new SavedSession(s.State, null)));
            if (problem == "membership") ((JArray)j["teams"][0]["members"]).Add("unit-6");
            if (problem == "room") j["teams"][0]["roomId"] = "r1";
            if (problem == "mission") j["expedition"]["teamId"] = "unknown";
            if (problem == "name") j["teams"][0]["designation"] = "";
            if (problem == "missing") j.Property("teams").Remove();
            Assert.Catch(() => c.Deserialize(j.ToString()));
        }
        [TestCase(false)][TestCase(true)] public void PinnedOldSaveAddsOnlyAnEmptyReadyRoomAndRejectsPlacementConflicts(bool conflict)
        {
            var old = File.ReadAllText("../tools/fixtures/bootstrap-before-ready-room.json"); var s = Create(old);
            s.Selection.SelectRoom("r5"); s.AdvanceOneTick(); s.Deploy(new[] { "unit-6" });
            var j = JObject.Parse(new CampaignSaveCodec(old).Serialize(new SavedSession(s.State, new SelectionReference(SelectionKind.Room, "r5"))));
            j["schemaVersion"] = 11;j.Property("archivedCargoSupply")?.Remove(); j.Property("teams").Remove(); ((JObject)j["expedition"]).Property("teamId").Remove();
            if (conflict) j["rooms"][4]["col"] = 8;
            var c = new CampaignSaveCodec(Json);
            if (conflict) { Assert.Catch(() => c.Deserialize(j.ToString())); return; }
            var restored = c.Deserialize(j.ToString());
            var roundTrip = c.Deserialize(c.Serialize(restored));
            Assert.That(roundTrip.Campaign.Base.Units.Select(u => u.Tier), Is.EqualTo(restored.Campaign.Base.Units.Select(u => u.Tier)));
            Assert.That(restored.Campaign.Base.Rooms.Count, Is.EqualTo(11)); Assert.That(restored.Campaign.Teams, Is.Empty);
            Assert.That(restored.Campaign.Expedition.TeamId, Is.Null); Assert.That(restored.Campaign.Expedition.Party.Single().UnitId, Is.EqualTo("unit-6"));
            Assert.That(restored.Campaign.Clock.ElapsedTicks, Is.EqualTo(1)); Assert.That(restored.Selection.Id, Is.EqualTo("r5"));
        }
    }
}
