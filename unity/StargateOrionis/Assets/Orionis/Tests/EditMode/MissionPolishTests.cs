using System;
using System.IO;
using System.Linq;
using NUnit.Framework;
using Orionis.Application;
using Orionis.Domain;
using Orionis.Infrastructure;
namespace Orionis.Tests
{
    public sealed class MissionPolishTests
    {
        private static string Json=>File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
        private static CampaignSession Create()=>new CampaignSession(new CampaignState(BootstrapReader.Read(Json),new RandomState(1,1)),null);
        private static void Work(CampaignSession s,string id){var recipe=MissionField.Requirements(s.State,id);var c=MissionField.Candidates(s.State,recipe).First();s.StartFieldWork(id,c.ActorId,c.ToolId);s.AdvanceFieldWork();}
        private static void Fight(CampaignSession s,string id){s.Engage(id);while(MissionCombat.Active(s.State)!=null)s.AdvanceCombatRound();}
        [Test] public void StoreLootArrivesAndResetClearsItsProcessesWithoutMovingStaff()
        {
            var s=Create();s.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});s.ChooseGate(false);s.MoveParty("door-gate-to-yard");s.Respond("yard-ignore","unit-6");Fight(s,"incident-yard-guards");s.MoveParty("door-yard-to-mainhall");Work(s,"hack-door-mainhall-to-holding");s.MoveParty("door-mainhall-to-holding");Fight(s,"incident-holding-guards");Work(s,"small-talk-worker-holding");foreach(var care in s.State.Base.Care.Recipes)Work(s,care.Id);s.MoveParty("door-stage-hidden-store");Work(s,"collect-equipment-crate-02");
            s.MoveParty("door-stage-hidden-store");s.MoveParty("door-mainhall-to-holding");s.MoveParty("door-yard-to-mainhall");s.MoveParty("door-gate-to-yard");s.RedialGate();s.ExtractMission();Assert.That(s.State.Cargo.Select(i=>i.Id),Is.EquivalentTo(new[]{"equipment-crate-02","missing-operative-rifle-02"}));
            s.AssignUnit("unit-25","r2");s.AdmitIncoming("missing-operative-rifle-02","r2");Assert.That(s.State.Receiving.Any(o=>o.InstanceId=="missing-operative-rifle-02"),Is.True);s.ResetMission();Assert.That(s.State.Cargo,Is.Empty);Assert.That(s.State.Receiving.Any(o=>o.InstanceId=="missing-operative-rifle-02"),Is.False);Assert.That(s.State.Assignments.Any(a=>a.UnitId=="unit-25"&&a.RoomInstanceId=="r2"),Is.True);
            var codec=new CampaignSaveCodec(Json);string saved=codec.Serialize(new SavedSession(s.State,null));Assert.That(codec.Serialize(codec.Deserialize(saved)),Is.EqualTo(saved));
        }
        [Test] public void RockPlansPersistMixDurationsAndRespectSpecialistExecution()
        {
            var s=Create();var m=s.State.Base.Rooms.Single(r=>r.Definition.Id=="maintenance");s.AssignUnit("unit-6",m.Id);var plan=(from y in Enumerable.Range(0,s.State.Base.Planning.Rows) from x in Enumerable.Range(0,s.State.Base.Planning.Columns) where !RoomConstruction.IsClear(s.State,x,y) select new{x,y}).First();var nodes=TerrainClearing.Plan(s.State,plan.x,plan.y);Assert.That(nodes.Count,Is.InRange(8,12));Assert.That(nodes.Select(n=>n.DurationTicks),Has.Member(1).And.Member(20));Assert.That(nodes.Any(n=>n.Profession=="TECHNICIAN"),Is.True);
            s.ExcavateCell(plan.x,plan.y);s.AdvanceOneTick();var order=s.State.Construction.Clearings.Single();var specialist=nodes.ToList().FindIndex(n=>n.Profession=="TECHNICIAN");Assert.That(order.Bubbles[specialist].ActorId,Is.Null);var codec=new CampaignSaveCodec(Json);string saved=codec.Serialize(new SavedSession(s.State,null));s=new CampaignSession(codec.Deserialize(saved).Campaign,null);Assert.That(TerrainClearing.WorkBubbles(s.State,s.State.Construction.Clearings.Single()).Select(n=>n.DurationTicks),Is.EqualTo(nodes.Select(n=>n.DurationTicks)));
            s.AssignUnit("unit-25",m.Id);double before=s.State.Construction.Supply["S1"];double credited=s.State.Construction.Clearings.Single().CreditedSupply;for(int i=0;i<260&&!s.State.Construction.Clearings.Single().Completed;i++)s.AdvanceOneTick();order=s.State.Construction.Clearings.Single();Assert.That(order.Completed,Is.True);Assert.That(order.Bubbles[specialist].ActorId,Is.EqualTo("unit-25"));Assert.That(s.State.Construction.Supply["S1"],Is.EqualTo(before+s.State.Base.Construction.RockSupply-credited));
        }
    }
}
