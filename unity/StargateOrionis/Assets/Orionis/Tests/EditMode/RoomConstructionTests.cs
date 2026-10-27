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
    public sealed class RoomConstructionTests
    {
        private string fixture;
        private CampaignState Fresh() { var legacy=JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));((JObject)legacy["roomConstruction"]["terrain"]).Property("variation")?.Remove();fixture=legacy.ToString(); return RoomConstruction.SeedStaff(new CampaignState(BootstrapReader.Read(fixture), new RandomState(1,1))); }
        [Test] public void StaffedSequentialBubblesSpendOnceSurviveSaveAndBecomeTheSamePhysicalRoom()
        {
            var state = Fresh();
            Assert.That(RoomConstruction.BuildBlocker(state,"ready_room",1,0,0,"unit-22"), Does.Contain("rock"));
            state = RoomConstruction.Excavate(state,0,0);
            Assert.Throws<InvalidOperationException>(() => RoomConstruction.Excavate(state,0,0));
            Assert.That(RoomConstruction.IsClear(state,0,0),Is.False);
            Assert.That(state.Construction.Supply["S1"],Is.EqualTo(500));
            state=ReceivingWork.AdvanceTick(state);
            Assert.That(state.Construction.Clearings.Single().Bubbles.Count(b=>b.CompletedTick.HasValue),Is.EqualTo(2));
            Assert.That(state.Construction.Supply["S1"],Is.EqualTo(502),"Each pair of finished clearing bubbles deposits its cumulative share immediately.");
            var clearingCodec=new CampaignSaveCodec(fixture);
            state=clearingCodec.Deserialize(clearingCodec.Serialize(new SavedSession(state,null))).Campaign;
            state=ReceivingWork.AdvanceTick(ReceivingWork.AdvanceTick(state));
            Assert.That(RoomConstruction.IsClear(state,0,0),Is.False);
            Assert.That(state.Construction.Supply["S1"],Is.EqualTo(507));
            state=ReceivingWork.AdvanceTick(state);
            Assert.That(RoomConstruction.IsClear(state,0,0),Is.True);
            Assert.That(state.Construction.Clearings.Single().Bubbles.Select(b=>b.ActorId).Distinct().Count(),Is.EqualTo(2));
            Assert.That(state.Construction.Supply["S1"],Is.EqualTo(510));
            state = RoomConstruction.Start(state,"ready_room",1,0,0,"unit-22");
            var id = state.Construction.Sites.Single().RoomId;
            Assert.That(state.Construction.Supply["S1"], Is.EqualTo(486));
            Assert.That(RoomConstruction.ReservesActor(state,"unit-1"), Is.True);
            Assert.Throws<InvalidOperationException>(() => Staffing.Unassign(state,"unit-1"));
            Assert.Throws<InvalidOperationException>(() => RoomConstruction.Start(state,"ready_room",1,1,2,"unit-22"));
            for (int tick=0;tick<20;tick++) state = ReceivingWork.AdvanceTick(state);
            Assert.That(RoomConstruction.ReservesActor(state,"unit-1"), Is.False);
            Assert.That(RoomConstruction.ReservesActor(state,"unit-22"), Is.True);
            var codec = new CampaignSaveCodec(fixture);
            state = codec.Deserialize(codec.Serialize(new SavedSession(state,null))).Campaign;
            Assert.That(state.Construction.Sites.Single().WorkedTicks, Is.EqualTo(20));
            state = RoomConstruction.SetPaused(state,id,true);
            state = ReceivingWork.AdvanceTick(state);
            Assert.That(state.Construction.Sites.Single().WorkedTicks, Is.EqualTo(20));
            state = RoomConstruction.SetPaused(state,id,false);
            for(int tick=20;tick<480;tick++) state = ReceivingWork.AdvanceTick(state);
            Assert.That(state.Base.Rooms.Single(r=>r.Id==id).Definition.Id, Is.EqualTo("ready_room"));
            Assert.That(state.Construction.Sites.Single().Completed, Is.True);
            Assert.That(RoomConstruction.ReservesActor(state,"unit-22"), Is.False);
            state = codec.Deserialize(codec.Serialize(new SavedSession(state,null))).Campaign;
            Assert.That(state.Base.Rooms.Count(r=>r.Id==id), Is.EqualTo(1));
            Assert.That(state.Construction.Supply["S1"], Is.EqualTo(486));
            var tampered = JObject.Parse(codec.Serialize(new SavedSession(state,null))); tampered["supplyStock"]["S1"] = 500;
            Assert.Throws<InvalidOperationException>(()=>codec.Deserialize(tampered.ToString()));
        }
        [Test] public void UntrainedClearingUsesOnlyAssignedMaintenanceStaffAndOldSavesKeepClearedCells()
        {
            var state=Fresh();state=Staffing.Unassign(state,"unit-1");state=Staffing.Unassign(state,"unit-22");
            state=RoomConstruction.Excavate(state,0,0);state=ReceivingWork.AdvanceTick(state);
            Assert.That(state.Construction.Clearings.Single().Bubbles.All(b=>b.ActorId==null),Is.True,"Idle roster must not be searched.");
            state=Staffing.Assign(state,"unit-37","r12");state=ReceivingWork.AdvanceTick(state);
            Assert.That(state.Construction.Clearings.Single().Bubbles.Count(b=>b.CompletedTick.HasValue),Is.EqualTo(1));
            Assert.That(state.Construction.Clearings.Single().Bubbles.First().ActorId,Is.EqualTo("unit-37"),"Medic can perform untrained work without a Tool.");
            var codec=new CampaignSaveCodec(fixture);var record=JObject.Parse(codec.Serialize(new SavedSession(Fresh(),null)));
            record["schemaVersion"]=22;record.Property("archivedCargoSupply")?.Remove();record.Property("clearings").Remove();record.Property("resourceProcessingFingerprint").Remove();record.Property("personnelRecoveryFingerprint").Remove();
            Assert.That(codec.Deserialize(record.ToString()).Campaign.Construction.Clearings,Is.Empty);
        }
        [Test] public void ConstructionRequiresLocalSecurityAndRejectsActorSubstitution()
        {
            var state = Fresh();
            var noSoldier = Staffing.Unassign(state,"unit-1");
            Assert.That(RoomConstruction.BuildBlocker(noSoldier,"ready_room",1,0,2,"unit-22"), Does.Contain("Soldier"));
            state = RoomConstruction.Start(state,"ready_room",1,0,2,"unit-22");
            Assert.Throws<InvalidOperationException>(()=>Staffing.Unassign(state,"unit-22"));
            for(int i=0;i<21;i++)state=ReceivingWork.AdvanceTick(state);
            Assert.That(state.Construction.Sites.Single().WorkedTicks, Is.EqualTo(21));
            Assert.That(state.Construction.Sites.Single().SecurityActorId, Is.EqualTo("unit-1"));
            var tools=PersonnelCondition.Tools(state,"unit-22").Select(t=>new ExpeditionTool(t.InstanceId,t.KitId,t.Slot,t.Charges,true,t.Label,t.Tier,t.Services));
            var damaged=new CampaignState(state.Base,state.Random,state.Clock,state.Assignments,state.Receiving,state.Transfers,state.Expedition,state.Teams,state.Cargo,new[]{new PersonnelRecord("unit-22",100,PersonnelCondition.Stamina(state,"unit-22"),PersonnelCondition.Endurance(state,"unit-22"),tools)},state.Construction);
            damaged=ReceivingWork.AdvanceTick(damaged);
            Assert.That(damaged.Construction.Sites.Single().WorkedTicks,Is.EqualTo(21),"A missing Tool blocks work without deleting progress.");
            var codec=new CampaignSaveCodec(fixture);var saved=JObject.Parse(codec.Serialize(new SavedSession(state,null)));
            saved["constructionSites"][0]["securityActorId"]="unit-22";
            Assert.Throws<InvalidOperationException>(()=>codec.Deserialize(saved.ToString()));
        }
        [Test] public void PreviousCapacitySaveAddsEssentialRoomsWithoutLosingAssignmentsOrClock()
        {
            Fresh();var oldFixture=BootstrapReader.Parse(fixture).previousExpansionSnapshot.ToString();
            var oldState=new CampaignState(BootstrapReader.Read(oldFixture),new RandomState(3,3));
            oldState=Staffing.Assign(oldState,"unit-22","r2");oldState=ReceivingWork.AdvanceTick(oldState);
            var oldCodec=new CampaignSaveCodec(oldFixture);
            var migrated=new CampaignSaveCodec(fixture).Deserialize(oldCodec.Serialize(new SavedSession(oldState,null))).Campaign;
            Assert.That(migrated.Base.Rooms.Count,Is.EqualTo(16));
            Assert.That(migrated.Assignments.Single(a=>a.UnitId=="unit-22").RoomInstanceId,Is.EqualTo("r2"));
            Assert.That(migrated.Clock.ElapsedTicks,Is.EqualTo(1));
            Assert.That(migrated.Construction.Supply["S1"],Is.EqualTo(500));
        }
        [Test] public void PhysicalUpgradeSpendsDestinationSupplyAndRestoresSameRoomAndAssignments()
        {
            var state=Fresh();var codec=new CampaignSaveCodec(fixture);
            var room=state.Base.Rooms.Single(r=>r.Id=="r6");
            state=RoomConstruction.Upgrade(state,"r6","unit-22");
            Assert.That(state.Base.Rooms.Single(r=>r.Id=="r6").TeamCapacity,Is.EqualTo(4));
            Assert.That(state.Construction.Supply["S2"],Is.EqualTo(194));
            Assert.Throws<InvalidOperationException>(()=>RoomConstruction.Upgrade(state,"r6","unit-22"));
            for(int i=0;i<40;i++)state=ReceivingWork.AdvanceTick(state);
            state=codec.Deserialize(codec.Serialize(new SavedSession(state,null))).Campaign;
            for(int i=40;i<120;i++)state=ReceivingWork.AdvanceTick(state);
            Assert.That(state.Base.Rooms.Count,Is.EqualTo(16));
            Assert.That(state.Base.Rooms.Single(r=>r.Id=="r6").TeamCapacity,Is.EqualTo(5));
            Assert.That(state.Assignments.Count,Is.EqualTo(2));
            state=RoomConstruction.Upgrade(state,"r6","unit-22");
            for(int i=0;i<120;i++)state=ReceivingWork.AdvanceTick(state);
            state=codec.Deserialize(codec.Serialize(new SavedSession(state,null))).Campaign;
            Assert.That(state.Base.Rooms.Single(r=>r.Id=="r6").TeamCapacity,Is.EqualTo(6));
            Assert.That(state.Construction.Sites.Select(site=>site.WorkId).Distinct().Count(),Is.EqualTo(2));
            Assert.That(state.Construction.Supply["S3"],Is.EqualTo(94));
        }
        [Test] public void OrderedPairsFormSquareAndSplitWithoutMergingPhysicalChildren()
        {
            var state=Fresh();
            foreach(var cell in new[]{new[]{0,6},new[]{1,6},new[]{0,7},new[]{1,7}})
            {state=RoomConstruction.Start(state,"analysis",1,cell[0],cell[1],"unit-22");for(int i=0;i<480;i++)state=ReceivingWork.AdvanceTick(state);}
            state=RoomGroups.Join(state,"r17","r18");state=RoomGroups.Join(state,"r19","r20");state=RoomGroups.Join(state,"r17","r19");
            Assert.That(RoomGroups.Members(state,"r20"),Is.EqualTo(new[]{"r17","r18","r19","r20"}));
            Assert.That(state.Base.Rooms.Count,Is.EqualTo(20));
            var codec=new CampaignSaveCodec(fixture);state=codec.Deserialize(codec.Serialize(new SavedSession(state,null))).Campaign;
            Assert.That(RoomConstruction.UpgradeBlocker(state,"r17","unit-22"),Does.Contain("Split"));
            Assert.Throws<InvalidOperationException>(()=>RoomGroups.Join(state,"r6","r17"));
            state=RoomGroups.Split(state,"r20");
            Assert.That(state.Construction.Groups.Count(g=>g.Active),Is.EqualTo(2));
            Assert.That(RoomGroups.Members(state,"r20"),Is.EqualTo(new[]{"r19","r20"}));
            var bad=JObject.Parse(codec.Serialize(new SavedSession(state,null)));bad["roomGroups"][0]["primaryChild"]="g3";bad["roomGroups"][0]["children"][0]="g3";
            Assert.Throws<InvalidOperationException>(()=>codec.Deserialize(bad.ToString()));
        }
        [Test] public void Schema21ConstructionLoadPreservesStockAndProgress()
        {
            var state=Fresh();state=RoomConstruction.Start(state,"ready_room",1,0,2,"unit-22");state=ReceivingWork.AdvanceTick(state);
            var codec=new CampaignSaveCodec(fixture);var old=JObject.Parse(codec.Serialize(new SavedSession(state,null)));old["schemaVersion"]=21;old.Property("archivedCargoSupply")?.Remove();old.Property("roomGroups").Remove();foreach(JObject site in old["constructionSites"])site.Property("fromTier").Remove();
            old.Property("resourceProcessingFingerprint").Remove();old.Property("personnelRecoveryFingerprint").Remove();
            var restored=codec.Deserialize(old.ToString()).Campaign;
            Assert.That(restored.Construction.Supply["S1"],Is.EqualTo(476));Assert.That(restored.Construction.Sites[0].WorkedTicks,Is.EqualTo(1));Assert.That(restored.Construction.Groups,Is.Empty);
        }
        [Test] public void AutomaticConstructionUsesOnlyMaintenanceStaffAndRefreshesAfterAssignmentChanges()
        {
            var state=Fresh();state=Staffing.Unassign(state,"unit-22");
            Assert.That(RoomConstruction.ResolveTechnician(state),Is.Null,"An idle roster Technician is not a local Maintenance Actor.");
            Assert.That(RoomConstruction.BuildBlocker(state,"cultural_platform",1,0,6),Does.Contain("Maintenance"));
            state=Staffing.Assign(state,"unit-22","r12");
            Assert.That(RoomConstruction.BuildBlocker(state,"cultural_platform",1,0,6),Is.Null);
            state=RoomConstruction.Start(state,"cultural_platform",1,0,6);
            Assert.That(state.Construction.Sites.Single().ActorId,Is.EqualTo("unit-22"));Assert.That(state.Construction.Sites.Single().SecurityActorId,Is.EqualTo("unit-1"));
            Assert.That(RoomConstruction.ResolveTechnician(state),Is.EqualTo("unit-22"),"Selecting a project does not claim an Actor before its bubble starts.");
            var codec=new CampaignSaveCodec(fixture);state=codec.Deserialize(codec.Serialize(new SavedSession(state,null))).Campaign;
            state=ReceivingWork.AdvanceTick(state);
            Assert.That(state.Construction.Sites.Single().WorkedTicks,Is.EqualTo(1));Assert.That(state.Construction.Sites.Single().ActorId,Is.EqualTo("unit-22"));
            for(int i=0;i<state.Base.Construction.SecurityTicks+2&&!state.Construction.Sites.Single().Bubbles.Any(b=>b.ActorId=="unit-22"&&b.Ticks>0&&!b.CompletedTick.HasValue);i++)state=ReceivingWork.AdvanceTick(state);
            Assert.That(state.Construction.Sites.Single().Bubbles.Any(b=>b.ActorId=="unit-22"&&b.Ticks>0&&!b.CompletedTick.HasValue),Is.True);Assert.That(RoomConstruction.ResolveTechnician(state),Is.Null,"An Actor with partial bubble work cannot be double booked.");
        }
    }
}
