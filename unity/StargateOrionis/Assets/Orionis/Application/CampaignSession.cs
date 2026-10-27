using System;
using System.Linq;
using Orionis.Domain;

namespace Orionis.Application
{
    public sealed class SelectionReference
    {
        public SelectionKind Kind { get; }
        public string Id { get; }
        public SelectionReference(SelectionKind kind, string id) { Kind = kind; Id = id; }
    }
    public sealed class SavedSession
    {
        public CampaignState Campaign { get; }
        public SelectionReference Selection { get; }
        public SavedSession(CampaignState campaign, SelectionReference selection)
        { Campaign = campaign; Selection = selection; }
    }
    public interface ICampaignSaveStore
    {
        void Save(SavedSession session);
        SavedSession Load();
    }

    public sealed class CampaignSession
    {
        private readonly ICampaignSaveStore saves;
        private CampaignState state;
        public CampaignState State
        {
            get => state;
            private set
            {
                var previous = state; state = value;
                if (previous == null || ReferenceEquals(previous.Base, value.Base)) return;
                var current = Selection?.Current;
                Selection = new SelectionService(value.Base);
                if (current != null) { if (current.Kind == SelectionKind.Room && value.Base.Rooms.Any(r => r.Id == current.Id)) Selection.SelectRoom(current.Id); else if (current.Kind == SelectionKind.Unit && value.Base.Units.Any(u => u.Id == current.Id)) Selection.SelectUnit(current.Id); }
                BaseChanged?.Invoke();
            }
        }
        public SelectionService Selection { get; private set; }
        private bool advancingTick;
        public event Action<long> TickCommitted;
        public event Action BaseChanged;
        public event Action ConstructionChanged;
        public event Action StaffingChanged;
        public event Action ReceivingChanged;
        public event Action MissionChanged;
        public event Action CombatChanged;
        public event Action TeamsChanged;
        public CampaignSession(CampaignState initial, ICampaignSaveStore saves)
        { State = initial; Selection = new SelectionService(initial.Base); this.saves = saves; }
        public void AdvanceOneTick()
        {
            if (State.Expedition != null && !State.Expedition.Returned) throw new InvalidOperationException("Offworld time advances through committed mission actions.");
            if (advancingTick) throw new InvalidOperationException("Cannot recursively advance the campaign clock.");
            advancingTick = true;
            try
            {
                var previous = State;
                var next = ReceivingWork.AdvanceTick(previous);
                State = next;
                if (!previous.Assignments.SequenceEqual(next.Assignments) || previous.Transfers.Count != next.Transfers.Count) StaffingChanged?.Invoke();
                TickCommitted?.Invoke(next.Clock.ElapsedTicks);
            }
            finally { advancingTick = false; }
        }
        public void SetBaseResponse(string room,bool active){State=BaseWork.SetBaseResponse(State,room,active);StaffingChanged?.Invoke();ReceivingChanged?.Invoke();ConstructionChanged?.Invoke();}
        public void ReconfigureCore(string id,string room=null)
        {State=RoomCores.Request(State,id,room);StaffingChanged?.Invoke();ReceivingChanged?.Invoke();ConstructionChanged?.Invoke();}
        public void BuildRoom(string definition, int tier, int col, int row, string actor = null)
        {
            State = RoomConstruction.Start(State, definition, tier, col, row, actor);
            ConstructionChanged?.Invoke(); StaffingChanged?.Invoke();
        }
        public void UpgradeRoom(string room, string actor = null)
        { State = RoomConstruction.Upgrade(State, room, actor); ConstructionChanged?.Invoke(); StaffingChanged?.Invoke(); }
        public void JoinRooms(string primary, string secondary)
        { State = RoomGroups.Join(State, primary, secondary); ConstructionChanged?.Invoke(); StaffingChanged?.Invoke(); }
        public void SplitRooms(string room)
        { State = RoomGroups.Split(State, room); ConstructionChanged?.Invoke(); StaffingChanged?.Invoke(); }
        public void ExcavateCell(int col, int row)
        { State = RoomConstruction.Excavate(State, col, row); ConstructionChanged?.Invoke(); }
        public void InspectResourceCache(){State=ResourceCargo.InspectField(State);MissionChanged?.Invoke();}
        public void StartFieldGroup(string id){State=MissionField.StartGroup(State,id);MissionChanged?.Invoke();}
        public void RecoverResourceCache(){State=ResourceCargo.Recover(State);ReceivingChanged?.Invoke();MissionChanged?.Invoke();}
        public void AdmitResourceCache(string id,string room){State=ResourceCargo.Admit(State,id,room);ReceivingChanged?.Invoke();}
        public void RetryResourceOutputs(){State=ResourceCargo.Retry(State);ReceivingChanged?.Invoke();ConstructionChanged?.Invoke();}
        public void PauseConstruction(string roomId, bool paused)
        {
            State = RoomConstruction.SetPaused(State, roomId, paused); ConstructionChanged?.Invoke();
        }
        public void AssignUnit(string unitId, string roomId)
        {
            var candidate = Staffing.Assign(State, unitId, roomId);
            State = candidate;
            StaffingChanged?.Invoke();
        }
        public void UnassignUnit(string unitId)
        {
            var candidate = Staffing.Unassign(State, unitId);
            State = candidate;
            StaffingChanged?.Invoke();
        }
        public void PlanTransfer(string unitId, string roomId, StaffTransferTiming timing)
        {
            State = StaffTransfers.Request(State, unitId, roomId, timing);
            StaffingChanged?.Invoke();
        }
        public void CancelTransfer(string unitId)
        {
            State = StaffTransfers.Cancel(State, unitId);
            StaffingChanged?.Invoke();
        }
        public void Deploy(System.Collections.Generic.IEnumerable<string> unitIds)
        {
            State = Expeditions.Deploy(State, unitIds);
            MissionChanged?.Invoke();
        }
        public void CreateTeam(string roomId, string designation) { State = SGTeams.Create(State, roomId, designation); TeamsChanged?.Invoke(); StaffingChanged?.Invoke(); }
        public void RenameTeam(string teamId, string designation) { State = SGTeams.Rename(State, teamId, designation); TeamsChanged?.Invoke(); StaffingChanged?.Invoke(); }
        public void SetTeamMember(string teamId, string unitId, bool assigned) { State = SGTeams.SetMember(State, teamId, unitId, assigned); TeamsChanged?.Invoke(); StaffingChanged?.Invoke(); }
        public void DeployTeam(string teamId, System.Collections.Generic.IEnumerable<string> members = null)
        {
            var team = State.Teams.SingleOrDefault(t => t.Id == teamId) ?? throw new InvalidOperationException("Choose an existing SG team.");
            State = Expeditions.Deploy(State, members ?? team.Members.Take(State.Base.Mission.MaxPartySize), team.Id); MissionChanged?.Invoke();
        }
        public void ChooseGate(bool keepOpen)
        {
            State = Expeditions.ChooseGate(State, keepOpen);
            MissionChanged?.Invoke();
        }
        public void RedialGate()
        { CommitMissionAction(Expeditions.Redial); }
        public void MoveParty(string doorId)
        { CommitMissionAction(state => MissionTravel.Move(state, doorId)); }
        public void Respond(string responseId, string actorId)
        { CommitMissionAction(state => MissionTravel.Respond(state, responseId, actorId)); }
        public void ContinueConversation()
        { CommitMissionAction(MissionTravel.Continue); }
        public void Talk(string sceneId) { CommitMissionAction(state => MissionTravel.Talk(state, sceneId)); }
        public void StartFieldWork(string recipeId, string actorId, string toolId) { CommitMissionAction(state => MissionField.Start(state, recipeId, actorId, toolId)); }
        public void CancelFieldWork() { CommitMissionAction(MissionField.Cancel); }
        public void AdvanceFieldWork() { CommitMissionAction(MissionField.Advance); }
        public void ResetMission()
        {
            if (advancingTick) throw new InvalidOperationException("Finish the current command first.");
            var resetIds=State.Cargo.Where(i=>i.SourceMissionId==State.Base.Mission.Id).Select(i=>i.Id).ToHashSet();
            var construction=State.Construction;
            if(construction!=null){var archived=construction.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value);foreach(var resource in construction.Supply.Keys){archived.TryGetValue(resource,out var old);archived[resource]=old+ResourceCargo.CommittedSupply(State,resource,resetIds);}construction=new ConstructionState(construction.Supply.ToDictionary(p=>p.Key,p=>p.Value),construction.Sites,construction.Excavated,construction.Groups,construction.Clearings,archived);}
            State = new CampaignState(State.Base, State.Random, State.Clock, State.Assignments, State.Receiving.Where(o=>!resetIds.Contains(o.InstanceId)), State.Transfers.Where(t=>t.WorkInstanceId==null||!resetIds.Contains(t.WorkInstanceId)), teams: State.Teams, cargo: State.Cargo.Where(i=>!resetIds.Contains(i.Id)), construction: construction, cores: State.Cores, workforce: State.Workforce, completedWork: State.CompletedWork);
            MissionChanged?.Invoke();
        }
        public void AssignInfirmaryBed(string unitId,string roomId)
        { State=PersonnelRecovery.AssignBed(State,unitId,roomId); StaffingChanged?.Invoke(); }
        public void PrepareRedeployment()
        { State = PersonnelCondition.PrepareRedeployment(State); MissionChanged?.Invoke(); }
        public void ExtractMission() { CommitMissionAction(s=>{
            var next=PersonnelRecovery.OnReturn(MissionRescue.Extract(s));
            if(RecoveredCargo.CanRecover(next))next=RecoveredCargo.Recover(next);
            var cache=next.Cargo.SingleOrDefault(i=>ResourceCargo.IsResource(next,i));
            if(cache!=null&&cache.FieldStageId!=null&&ResourceCargo.Collected(next))next=ResourceCargo.Recover(next);
            return next;
        }); }
        public void Engage(string incidentId) { CommitMissionAction(s => MissionCombat.Engage(s, incidentId)); }
        public void AdvanceCombatRound() { CommitMissionAction(MissionCombat.Round, false); }
        public void DisengageCombat() { CommitMissionAction(MissionCombat.Disengage); }
        private void CommitMissionAction(Func<CampaignState, CampaignState> action, bool refreshMission = true)
        {
            if (advancingTick) throw new InvalidOperationException("Cannot recursively commit a mission action.");
            advancingTick = true;
            try
            {
                var previous = State;
                State = action(previous);
                if (!previous.Assignments.SequenceEqual(State.Assignments) || previous.Transfers.Count != State.Transfers.Count) StaffingChanged?.Invoke();
                if (State.Clock.ElapsedTicks != previous.Clock.ElapsedTicks) TickCommitted?.Invoke(State.Clock.ElapsedTicks);
                if (refreshMission || MissionCombat.Active(State) == null) MissionChanged?.Invoke(); else CombatChanged?.Invoke();
            }
            finally { advancingTick = false; }
        }
        public void AdmitIncoming(string instanceId, string roomId)
        {
            State = ReceivingWork.Admit(State, instanceId, roomId);
            ReceivingChanged?.Invoke();
        }
        public void RecoverMissionCargo() { State = RecoveredCargo.Recover(State); MissionChanged?.Invoke(); }
        public void StartHandlingReview(string id, string roomId) { State = CargoHandling.Start(State, id, roomId); ReceivingChanged?.Invoke(); }
        public void PauseHandlingReview(string id, bool paused) { State = CargoHandling.Pause(State, id, paused); ReceivingChanged?.Invoke(); }
        public void IssueEquipment(string id, string unitId)
        { State = UnitEquipment.Issue(State, id, unitId); ReceivingChanged?.Invoke(); }
        public void ReturnEquipment(string id, string roomId)
        { State = UnitEquipment.Return(State, id, roomId); ReceivingChanged?.Invoke(); }
        public void ResetCargoObject(string id)
        { State = RecoveredCargo.ResetObject(State, id); ReceivingChanged?.Invoke(); StaffingChanged?.Invoke(); }
        public void StartCargoExamination(string id, string roomId)
        { State = CargoExamination.Start(State, id, roomId); ReceivingChanged?.Invoke(); }
        public void PauseCargoExamination(string id, bool paused)
        { State = CargoExamination.Pause(State, id, paused); ReceivingChanged?.Invoke(); }
        public void RetainCargo(string id, bool retained) { State = RecoveredCargo.Retain(State, id, retained); ReceivingChanged?.Invoke(); }
        public void MoveCargo(string id, string roomId) { State = RecoveredCargo.Move(State, id, roomId); ReceivingChanged?.Invoke(); }
        public void ReturnCargoToStorage(string id) { State = RecoveredCargo.ReturnToStorage(State, id); ReceivingChanged?.Invoke(); }
        public void PauseInspection(string instanceId, bool paused)
        {
            State = ReceivingWork.SetPaused(State, instanceId, paused);
            ReceivingChanged?.Invoke();
        }
        public void Save()
        {
            var current = Selection.Current;
            saves.Save(new SavedSession(State, current == null ? null : new SelectionReference(current.Kind, current.Id)));
        }
        public void Load()
        {
            var candidate = saves.Load();
            var selection = new SelectionService(candidate.Campaign.Base);
            if (candidate.Selection != null)
            {
                if (candidate.Selection.Kind == SelectionKind.Room) selection.SelectRoom(candidate.Selection.Id);
                else if (candidate.Selection.Kind == SelectionKind.Unit) selection.SelectUnit(candidate.Selection.Id);
                else throw new FormatException("Save has an unsupported selection kind.");
            }
            // Publish neither replacement until the entire candidate is validated.
            State = candidate.Campaign;
            Selection = selection;
        }
    }
}
