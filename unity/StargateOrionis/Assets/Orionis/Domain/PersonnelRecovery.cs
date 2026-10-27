using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class PersonnelRecoveryRules
    {
        public int BaseHealthPerTick { get; }
        public int BedHealthPerTick { get; }
        public int BedsPerRoom { get; }
        public string InfirmaryRoomId { get; }
        public bool RefillToolsOnReturn { get; }
        public PersonnelRecoveryRules(int baseHealthPerTick, int bedHealthPerTick, int bedsPerRoom, string infirmaryRoomId, bool refillToolsOnReturn)
        {
            if(baseHealthPerTick<0 || bedHealthPerTick<0 || bedsPerRoom<1 || string.IsNullOrEmpty(infirmaryRoomId))
                throw new ArgumentException("Invalid personnel recovery rules.");
            BaseHealthPerTick=baseHealthPerTick; BedHealthPerTick=bedHealthPerTick;
            BedsPerRoom=bedsPerRoom; InfirmaryRoomId=infirmaryRoomId; RefillToolsOnReturn=refillToolsOnReturn;
        }
    }

    public static class PersonnelRecovery
    {
        public static string Bed(CampaignState state,string unitId) => state.Personnel.SingleOrDefault(p=>p.UnitId==unitId)?.BedRoomId;
        public static bool InBed(CampaignState state,string unitId) => Bed(state,unitId)!=null;
        public static int Rate(CampaignState state,string unitId) => Expeditions.IsDeployed(state,unitId) ? 0 :
            InBed(state,unitId) ? state.Base.PersonnelRecovery?.BedHealthPerTick??0 : state.Base.PersonnelRecovery?.BaseHealthPerTick??0;
        private static CampaignState Replace(CampaignState state,IEnumerable<PersonnelRecord> personnel,ExpeditionState expedition=null) =>
            new CampaignState(state.Base,state.Random,state.Clock,state.Assignments,state.Receiving,state.Transfers,
                expedition??state.Expedition,state.Teams,state.Cargo,personnel,state.Construction, cores: state.Cores, workforce: state.Workforce, completedWork: state.CompletedWork);

        public static CampaignState AssignBed(CampaignState state,string unitId,string roomId)
        {
            if(!state.Base.Units.Any(u=>u.Id==unitId))throw new ArgumentException("Unknown Unit.");
            if(Expeditions.IsDeployed(state,unitId))throw new InvalidOperationException("The Unit must return to base first.");
            if(RoomConstruction.ReservesActor(state,unitId)||state.Transfers.Any(t=>t.UnitId==unitId)||
                state.Receiving.Any(o=>o.Progress.Any(p=>p.ActorId==unitId&&p.Ticks>0&&p.Ticks<state.Base.Receiving.Steps.Single(s=>s.Id==p.StepId).DurationTicks))||
                state.Cargo.Any(i=>i.Handling?.ActorId==unitId&&!CargoHandling.Completed(i)||i.Examination?.ActorId==unitId&&CargoExamination.Active(i)))
                throw new InvalidOperationException("Finish or cancel this Unit's active work before assigning a bed.");
            var record=new PersonnelRecord(unitId,PersonnelCondition.Health(state,unitId),PersonnelCondition.Stamina(state,unitId),
                PersonnelCondition.Endurance(state,unitId),PersonnelCondition.Tools(state,unitId),roomId);
            return Replace(state,state.Personnel.Where(p=>p.UnitId!=unitId).Append(record));
        }
        public static CampaignState Tick(CampaignState state)
        {
            if(state.Base.PersonnelRecovery==null)return state;
            var records=state.Personnel.Select(p=>new PersonnelRecord(p.UnitId,
                Math.Min(PersonnelCondition.MaximumHealth(state),p.Health+Rate(state,p.UnitId)),p.Stamina,p.Endurance,p.Tools,p.BedRoomId));
            return Replace(state,records);
        }
        public static CampaignState OnReturn(CampaignState state)
        {
            if(state.Expedition?.Returned!=true || state.Base.PersonnelRecovery==null)return state;
            var e=state.Expedition; var arrival=MissionCombat.Inspect(state).PartyHealth;
            ExpeditionTool Refill(string id,ExpeditionTool tool)
            {
                var limit=state.Base.Mission.Personnel.Single(p=>p.UnitId==id).Tools.Single(t=>t.InstanceId==tool.InstanceId).Charges;
                return new ExpeditionTool(tool.InstanceId,tool.KitId,tool.Slot,state.Base.PersonnelRecovery.RefillToolsOnReturn?limit:tool.Charges,
                    tool.Damaged,tool.Label,tool.Tier,tool.Services);
            }
            var party=e.Party.Select(m=>new ExpeditionMember(m.UnitId,m.Perception,m.Stamina,m.Endurance,m.Tools.Select(t=>Refill(m.UnitId,t)),m.Equipment,m.StartingHealth)).ToList();
            var field=e.Travel.Field;
            var completed=field.Completed.Select(w=>new FieldWork(w.RecipeId,w.StageId,w.ActorId,w.ToolId,w.StartedTick,
                w.ToolChargesRestored||state.Base.PersonnelRecovery.RefillToolsOnReturn&&w.ToolId!=null&&MissionField.Requirements(state,w.RecipeId).ChargeCost>0,w.GroupId,w.Assignments));
            var travel=MissionField.With(e.Travel,new MissionFieldState(field.Subjects,field.Objectives.ToDictionary(p=>p.Key,p=>p.Value),field.Observed,field.Work,completed));
            var returned=new ExpeditionState(e.MissionId,e.StageId,e.StartedTick,e.GateChoicePending,e.GateOpen,e.ConnectionOpenedTick,party,travel,e.Combat,e.ExtractedTick,e.TeamId);
            var records=state.Personnel.Where(p=>!party.Any(m=>m.UnitId==p.UnitId)).Concat(party.Select(m=>new PersonnelRecord(m.UnitId,arrival[m.UnitId],m.Stamina,m.Endurance,m.Tools)));
            return Replace(state,records,returned);
        }
        internal static void ValidateBeds(CampaignState state)
        {
            foreach(var patient in state.Personnel.Where(p=>p.BedRoomId!=null))
            {
                if(state.Base.PersonnelRecovery==null || !state.Base.Rooms.Any(r=>r.Id==patient.BedRoomId&&r.Definition.Id==state.Base.PersonnelRecovery.InfirmaryRoomId)||Expeditions.IsDeployed(state,patient.UnitId))
                    throw new InvalidOperationException("Invalid patient bed assignment.");
            }
            if(state.Base.PersonnelRecovery!=null&&state.Personnel.Where(p=>p.BedRoomId!=null).GroupBy(p=>p.BedRoomId).Any(g=>g.Count()>state.Base.PersonnelRecovery.BedsPerRoom))
                throw new InvalidOperationException("All beds in this Infirmary are occupied.");
        }
    }
}
