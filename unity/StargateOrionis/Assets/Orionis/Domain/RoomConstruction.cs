using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class ConstructionSetup
    {
        public ClearingVariation ClearingVariation {get;set;}
        public double GeneralWorkShare {get;set;}
        public string MaintenanceDefinition { get; }
        public string SecurityProfession { get; }
        public int SecurityTier { get; }
        public int SecurityTicks { get; }
        public int ClearCol { get; }
        public int ClearRow { get; }
        public int ClearWidth { get; }
        public int ClearHeight { get; }
        public string RockSupplyClass { get; }
        public double RockSupply { get; }
        public string ClearingRecipeId { get; }
        public IReadOnlyList<int> ClearingBubbles { get; }
        public IReadOnlyList<StaffAssignment> StartupStaff { get; }
        public string Profession { get; }
        public int MinimumTier { get; }
        public string ToolService { get; }
        public string SupplyStorageDefinitionId { get; }
        public IReadOnlyDictionary<string, double> StartingSupply { get; }
        public ConstructionSetup(string profession, int tier, string tool, string storage, IDictionary<string, double> supply, string maintenance, string securityProfession, int securityTier, int securityTicks, int clearCol, int clearRow, int clearWidth, int clearHeight, string rockClass, double rockSupply, IEnumerable<StaffAssignment> startupStaff, string clearingRecipeId = null, IEnumerable<int> clearingBubbles = null)
        { ClearingRecipeId = clearingRecipeId; ClearingBubbles = (clearingBubbles ?? Enumerable.Empty<int>()).ToList().AsReadOnly(); MaintenanceDefinition = maintenance; SecurityProfession = securityProfession; SecurityTier = securityTier; SecurityTicks = securityTicks; ClearCol = clearCol; ClearRow = clearRow; ClearWidth = clearWidth; ClearHeight = clearHeight; RockSupplyClass = rockClass; RockSupply = rockSupply; StartupStaff = startupStaff.ToList().AsReadOnly(); Profession = profession; MinimumTier = tier; ToolService = tool; SupplyStorageDefinitionId = storage; StartingSupply = new ReadOnlyDictionary<string, double>(new Dictionary<string, double>(supply)); }
    }
    // This is the persistent physical construction object, identified by its future room ID.
    // Supply becomes embodied in this site; pausing never refunds it or removes the footprint.
    public sealed class RoomConstructionSite
    {
        public IReadOnlyList<ClearingBubbleWork> Bubbles {get;private set;}=Array.Empty<ClearingBubbleWork>();
        public RoomConstructionSite WithBubbles(IEnumerable<ClearingBubbleWork> bubbles){Bubbles=bubbles.ToList().AsReadOnly();return this;}
        public string RoomId { get; }
        public string DefinitionId { get; }
        public int Tier { get; }
        public int? FromTier { get; }
        public string WorkId => RoomId + "-ct" + Tier;
        public int Col { get; }
        public int Row { get; }
        public string MaintenanceRoomId { get; }
        public string SecurityActorId { get; }
        public string ActorId { get; }
        public long StartedTick { get; }
        public long DurationTicks { get; }
        public long WorkedTicks { get; }
        public double SupplyCost { get; }
        public string SupplyClass { get; }
        public bool Paused { get; }
        public long? CompletedTick { get; }
        public bool Completed => CompletedTick.HasValue;
        public RoomConstructionSite(string roomId, string definition, int tier, int col, int row, string actor, long started, long duration, long worked, double supply, string supplyClass, bool paused = false, long? completed = null, string maintenance = null, string securityActor = null, int? fromTier = null)
        { FromTier = fromTier; MaintenanceRoomId = maintenance; SecurityActorId = securityActor; RoomId = roomId; DefinitionId = definition; Tier = tier; Col = col; Row = row; ActorId = actor; StartedTick = started; DurationTicks = duration; WorkedTicks = worked; SupplyCost = supply; SupplyClass = supplyClass; Paused = paused; CompletedTick = completed; }
        public RoomConstructionSite With(long worked, bool paused, long? completed) => new RoomConstructionSite(RoomId, DefinitionId, Tier, Col, Row, ActorId, StartedTick, DurationTicks, worked, SupplyCost, SupplyClass, paused, completed, MaintenanceRoomId, SecurityActorId, FromTier).WithBubbles(Bubbles);
    }
    public sealed class ConstructionState
    {
        public IReadOnlyDictionary<string, double> ArchivedCargoSupply {get;}
        public IReadOnlyDictionary<string, double> Supply { get; }
        public IReadOnlyList<RoomConstructionSite> Sites { get; }
        public IReadOnlyList<string> Excavated { get; }
        public IReadOnlyList<RoomGroup> Groups { get; }
        public IReadOnlyList<TerrainClearingOrder> Clearings { get; }
        public ConstructionState(IDictionary<string, double> supply, IEnumerable<RoomConstructionSite> sites, IEnumerable<string> excavated = null, IEnumerable<RoomGroup> groups = null, IEnumerable<TerrainClearingOrder> clearings = null, IDictionary<string,double> archivedCargoSupply=null)
        { ArchivedCargoSupply=new ReadOnlyDictionary<string,double>(new Dictionary<string,double>(archivedCargoSupply??new Dictionary<string,double>())); Clearings = (clearings ?? Enumerable.Empty<TerrainClearingOrder>()).ToList().AsReadOnly(); Groups = (groups ?? Enumerable.Empty<RoomGroup>()).ToList().AsReadOnly(); Excavated = (excavated ?? Enumerable.Empty<string>()).ToList().AsReadOnly(); Supply = new ReadOnlyDictionary<string, double>(new Dictionary<string, double>(supply)); Sites = sites.ToList().AsReadOnly(); }
    }
    public static class RoomConstruction
    {
        public static bool ReservesActor(CampaignState state, string actor) => state.Construction?.Sites.Any(s => !s.Completed && (s.Bubbles.Count>0?s.Bubbles.Any(b=>b.ActorId==actor&&!b.CompletedTick.HasValue):(s.ActorId == actor || s.WorkedTicks < state.Base.Construction.SecurityTicks && s.SecurityActorId == actor))) == true || TerrainClearing.ReservesActor(state, actor);
        public static string MaintenanceFor(CampaignState state,string actor)
        {var home=state.Assignments.SingleOrDefault(a=>a.UnitId==actor)?.RoomInstanceId;return state.Base.Rooms.FirstOrDefault(r=>r.Id==home&&r.Definition.Id==state.Base.Construction?.MaintenanceDefinition)?.Id??(BaseWork.ResponseRoom(state,home)?state.Base.Rooms.FirstOrDefault(r=>r.Definition.Id==state.Base.Construction?.MaintenanceDefinition)?.Id:null);}
        private static string WorkerBlocker(CampaignState state, string actor, string profession, int minimumTier, string tool, bool ownReservation)
        {
            if (actor == null || !state.Base.Units.Any(u => u.Id == actor)) return "Assign qualified staff to Maintenance.";
            if (BaseWork.OnBaseResponse(state,actor))return "Unit is on Base Response; ordinary work waits.";
            if (MaintenanceFor(state, actor) == null) return "Assign this Unit permanently to Maintenance first.";
            if (state.Transfers.Any(t => t.UnitId == actor) || SGTeams.ForUnit(state, actor) != null || Expeditions.IsDeployed(state, actor)) return "This Maintenance Unit is unavailable.";
            if (!ownReservation && ReservesActor(state, actor)) return "This Unit is already assigned to a construction bubble.";
            if(PersonnelRecovery.InBed(state,actor))return "This Unit is assigned to an Infirmary bed.";
            if (Expeditions.IsIncapacitated(state, actor)) return "This Unit is incapacitated.";
            var worker = state.Base.Receiving?.Workers.SingleOrDefault(w => w.UnitId == actor);
            if (profession!="UNTRAINED"&&(worker == null || !worker.Qualifications.TryGetValue(profession, out var tier) || tier < minimumTier)) return "A qualified " + profession + " is required.";
            if (tool != null && !BaseWork.HasTool(state,MaintenanceFor(state,actor),actor,tool)) return "Equip an undamaged Tool providing " + tool + ".";
            return null;
        }
        public static string ActorBlocker(CampaignState state, string actor, bool ownReservation = false)
        {
            var setup = state.Base.Construction;
            return setup == null ? "Construction execution is not configured." : WorkerBlocker(state, actor, setup.Profession, setup.MinimumTier, setup.ToolService, ownReservation);
        }
        private static IEnumerable<string> MaintenanceTechnicians(CampaignState state)
        {
            var setup = state.Base.Construction;
            if (setup == null) return Enumerable.Empty<string>();
            return state.Assignments.Where(a => MaintenanceFor(state, a.UnitId) != null &&
                state.Base.Receiving.Workers.Any(w => w.UnitId == a.UnitId && w.Qualifications.TryGetValue(setup.Profession, out var tier) && tier >= setup.MinimumTier))
                .OrderBy(a => BaseWork.Priority(state,MaintenanceFor(state,a.UnitId),a.UnitId)).ThenBy(a => a.UnitId, StringComparer.Ordinal).Select(a => a.UnitId);
        }
        public static string ResolveTechnician(CampaignState state)
        {
            var available = MaintenanceTechnicians(state).Where(id => ActorBlocker(state, id) == null).ToList();
            return available.FirstOrDefault(id => ResolveSecurityActor(state, id) != null) ?? available.FirstOrDefault();
        }
        public static string StaffingBlocker(CampaignState state)
        {
            if (state.Base.Construction == null) return "Construction execution is not configured.";
            var technician = ResolveTechnician(state);
            if (technician != null) return ResolveSecurityActor(state, technician) == null ? "Staff this Maintenance room or Group with an available Soldier (SO1)." : null;
            return MaintenanceTechnicians(state).Select(id => ActorBlocker(state, id)).FirstOrDefault() ?? "Assign a qualified " + state.Base.Construction.Profession + " with equipped " + state.Base.Construction.ToolService + " to Maintenance.";
        }
        public static string ResolveSecurityActor(CampaignState state, string technician) => state.Assignments.Where(a => BaseWork.Eligible(state,MaintenanceFor(state,technician),a.UnitId) && a.UnitId != technician).OrderBy(a => BaseWork.Priority(state,MaintenanceFor(state,technician),a.UnitId)).ThenBy(a => a.UnitId, StringComparer.Ordinal).Select(a => a.UnitId).FirstOrDefault(id => WorkerBlocker(state, id, state.Base.Construction.SecurityProfession, state.Base.Construction.SecurityTier, null, false) == null);
        public static IReadOnlyList<RecipeBubble> WorkBubbles(CampaignState state,RoomConstructionSite site)
        {
            var setup=state.Base.Construction;var result=new List<RecipeBubble>();
            result.Add(new RecipeBubble("security",setup.SecurityTicks,setup.SecurityProfession,setup.SecurityTier,null,Array.Empty<string>()));
            long general=Math.Min((long)Math.Floor(site.DurationTicks*setup.GeneralWorkShare),site.DurationTicks-setup.SecurityTicks);
            long specialist=site.DurationTicks-general-setup.SecurityTicks;
            void Add(long ticks,string profession,int tier,string tool)
            {
                while(ticks>0){int duration=ticks>=20?20:1;result.Add(new RecipeBubble("build-"+result.Count,duration,profession,tier,tool,new[]{"security"}));ticks-=duration;}
            }
            Add(specialist,setup.Profession,setup.MinimumTier,setup.ToolService);Add(general,"UNTRAINED",0,null);return result;
        }
        private static RoomConstructionSite InitializeBubbles(CampaignState state,RoomConstructionSite site)=>state.Base.Construction.GeneralWorkShare<=0?site:site.WithBubbles(WorkBubbles(state,site).Select(_=>new ClearingBubbleWork()));
        private static string ResolveBubbleActor(CampaignState state,RoomConstructionSite site,RecipeBubble node,string sticky,ISet<string> busy)
        {
            return state.Assignments.Where(a=>(sticky==null||sticky==a.UnitId)&&BaseWork.Eligible(state,site.MaintenanceRoomId,a.UnitId))
                .OrderBy(a=>BaseWork.Priority(state,site.MaintenanceRoomId,a.UnitId)).ThenBy(a=>a.UnitId,StringComparer.Ordinal)
                .Select(a=>a.UnitId).FirstOrDefault(id=>!busy.Contains(id)&&WorkerBlocker(state,id,node.Profession,node.MinimumTier,node.ToolService,sticky==id)==null);
        }
        public static string RuntimeBlocker(CampaignState state, RoomConstructionSite site)
        {
            if(site.Bubbles.Count==0)return site.WorkedTicks < state.Base.Construction.SecurityTicks ? WorkerBlocker(state, site.SecurityActorId, state.Base.Construction.SecurityProfession, state.Base.Construction.SecurityTier, null, true) : ActorBlocker(state, site.ActorId, true);
            var nodes=WorkBubbles(state,site);
            return Enumerable.Range(0,nodes.Count).Any(i=>!site.Bubbles[i].CompletedTick.HasValue&&nodes[i].DependsOn.All(id=>site.Bubbles[nodes.ToList().FindIndex(n=>n.Id==id)].CompletedTick.HasValue)&&ResolveBubbleActor(state,site,nodes[i],site.Bubbles[i].ActorId,new HashSet<string>())!=null)?null:"Waiting for available local Maintenance staff / required specialist Tools.";
        }
        public static bool IsClear(CampaignState state, int col, int row)
        {
            var setup = state.Base.Construction;
            return setup == null || col >= setup.ClearCol && col < setup.ClearCol + setup.ClearWidth && row >= setup.ClearRow && row < setup.ClearRow + setup.ClearHeight || state.Construction.Excavated.Contains(col + "," + row);
        }
        private static bool FootprintClear(CampaignState state, RoomDefinition d, int col, int row) => Enumerable.Range(col, d.Width).All(x => Enumerable.Range(row, d.Height).All(y => IsClear(state, x, y)));
        public static CampaignState Excavate(CampaignState state, int col, int row)
        {
            return TerrainClearing.Start(state, col, row);
        }
        // Seed only explicit free starter staff. Never displace saved room/team assignments.
        public static CampaignState SeedStaff(CampaignState state)
        {
            var entries = state.Assignments.ToList();
            foreach (var seed in state.Base.Construction?.StartupStaff ?? Enumerable.Empty<StaffAssignment>())
                if (!entries.Any(a => a.UnitId == seed.UnitId) && SGTeams.ForUnit(state, seed.UnitId) == null && !state.Transfers.Any(t => t.UnitId == seed.UnitId) && !Expeditions.IsDeployed(state, seed.UnitId) && entries.Count(a => a.RoomInstanceId == seed.RoomInstanceId) < state.Base.Rooms.Single(r => r.Id == seed.RoomInstanceId).StaffingCapacity)
                    entries.Add(seed);
            return new CampaignState(state.Base, state.Random, state.Clock, entries, state.Receiving, state.Transfers, state.Expedition, state.Teams, state.Cargo, state.Personnel, state.Construction, cores: state.Cores, workforce: state.Workforce, completedWork: state.CompletedWork);
        }
        private static bool Overlaps(int x, int y, RoomDefinition d, int otherX, int otherY, RoomDefinition other) =>
            x < otherX + other.Width && x + d.Width > otherX && y < otherY + other.Height && y + d.Height > otherY;
        public static string PlacementBlocker(CampaignState state, string definition, int tier, int col, int row)
        {
            var catalog = state.Base.Planning;
            var blocker = catalog.PlacementBlocker(state.Base, definition, tier, col, row);
            if (blocker != null) return blocker;
            var room = catalog.Rooms.Single(r => r.Room.Id == definition).Room;
            foreach (var site in state.Construction?.Sites.Where(s => !s.Completed) ?? Enumerable.Empty<RoomConstructionSite>())
            {
                var other = catalog.Rooms.Single(r => r.Room.Id == site.DefinitionId).Room;
                if (Overlaps(col, row, room, site.Col, site.Row, other)) return "Footprint overlaps construction site " + site.RoomId + ".";
                if (site.DefinitionId == definition && catalog.Rooms.Single(r => r.Room.Id == definition).Unique) return "The unique room is already under construction.";
            }
            return null;
        }
        public static string BuildBlocker(CampaignState state, string definition, int tier, int col, int row, string actor = null)
        {
            actor = actor ?? ResolveTechnician(state);
            var blocker = PlacementBlocker(state, definition, tier, col, row) ?? (actor == null ? StaffingBlocker(state) : ActorBlocker(state, actor));
            if (blocker != null) return blocker;
            if (!FootprintClear(state, state.Base.Planning.Rooms.Single(r => r.Room.Id == definition).Room, col, row)) return "Clear the rock in this footprint first.";
            if (ResolveSecurityActor(state, actor) == null) return "Staff the same Maintenance room with an available Soldier (SO1).";
            var quote = state.Base.Planning.Rooms.Single(r => r.Room.Id == definition).Construction[tier];
            if (quote.BlockedReason != null) return quote.BlockedReason;
            if (state.Construction == null || !state.Construction.Supply.TryGetValue(quote.SupplyClass, out var available) || available + .000001 < quote.Supply.Value) return "Not enough " + quote.SupplyClass + " Supply.";
            return null;
        }
        private static long Duration(RoomConstructionEstimate quote) => checked((long)Math.Ceiling(quote.Hours.Value * 60 / CampaignTiming.MinutesPerTick - .000001));
        public static CampaignState Start(CampaignState state, string definition, int tier, int col, int row, string actor = null)
        {
            actor = actor ?? ResolveTechnician(state);
            var blocker = BuildBlocker(state, definition, tier, col, row, actor);
            if (blocker != null) throw new InvalidOperationException(blocker);
            var quote = state.Base.Planning.Rooms.Single(r => r.Room.Id == definition).Construction[tier];
            int next = state.Base.Rooms.Select(r => int.Parse(r.Id.Substring(1))).Concat(state.Construction.Sites.Select(s => int.Parse(s.RoomId.Substring(1)))).DefaultIfEmpty(0).Max() + 1;
            var site = new RoomConstructionSite("r" + next, definition, tier, col, row, actor, state.Clock.ElapsedTicks, Duration(quote), 0, quote.Supply.Value, quote.SupplyClass, maintenance: MaintenanceFor(state, actor), securityActor: ResolveSecurityActor(state, actor));
            site=InitializeBubbles(state,site);
            var supply = state.Construction.Supply.ToDictionary(p => p.Key, p => p.Value);
            supply[quote.SupplyClass] = Math.Max(0, supply[quote.SupplyClass] - quote.Supply.Value);
            return Replace(state, state.Base, new ConstructionState(supply, state.Construction.Sites.Append(site), state.Construction.Excavated, state.Construction.Groups, state.Construction.Clearings,state.Construction.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value)));
        }
        public static string UpgradeBlocker(CampaignState state, string roomId, string actor = null)
        {
            var room = state.Base.Rooms.SingleOrDefault(r => r.Id == roomId);
            if (room == null) return "Select an existing physical room.";
            if (state.Construction?.Sites.Any(s => s.RoomId == roomId && !s.Completed) == true) return "This room already has work in progress.";
            var plan = state.Base.Planning.Rooms.Single(p => p.Room.Id == room.Definition.Id);
            if (!plan.Upgrades.TryGetValue(room.ConstructionTier + 1, out var quote)) return "This room is at its maximum authored CT.";
            if (RoomGroups.Members(state, roomId).Count > 1) return "Split this Room Group before upgrading a child, then rejoin matching tiers.";
            if (quote.BlockedReason != null) return quote.BlockedReason;
            if (quote.Hours <= 0) return "The next tier adds no authored capacity.";
            actor = actor ?? ResolveTechnician(state);
            var blocker = actor == null ? StaffingBlocker(state) : ActorBlocker(state, actor); if (blocker != null) return blocker;
            if (ResolveSecurityActor(state, actor) == null) return "Staff Maintenance with an available Soldier (SO1).";
            return state.Construction.Supply[quote.SupplyClass] + .000001 < quote.Supply ? "Not enough " + quote.SupplyClass + " Supply." : null;
        }
        public static CampaignState Upgrade(CampaignState state, string roomId, string actor = null)
        {
            actor = actor ?? ResolveTechnician(state);
            var blocker = UpgradeBlocker(state, roomId, actor); if (blocker != null) throw new InvalidOperationException(blocker);
            var room = state.Base.Rooms.Single(r => r.Id == roomId);
            var quote = state.Base.Planning.Rooms.Single(p => p.Room.Id == room.Definition.Id).Upgrades[room.ConstructionTier + 1];
            var site = new RoomConstructionSite(room.Id, room.Definition.Id, quote.ToTier, room.Col, room.Row, actor, state.Clock.ElapsedTicks, Duration(quote), 0, quote.Supply.Value, quote.SupplyClass, maintenance: MaintenanceFor(state, actor), securityActor: ResolveSecurityActor(state, actor), fromTier: room.ConstructionTier);
            site=InitializeBubbles(state,site);
            var supply = state.Construction.Supply.ToDictionary(p => p.Key, p => p.Value); supply[quote.SupplyClass] -= quote.Supply.Value;
            return Replace(state, state.Base, new ConstructionState(supply, state.Construction.Sites.Append(site), state.Construction.Excavated, state.Construction.Groups, state.Construction.Clearings,state.Construction.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value)));
        }
        public static CampaignState SetPaused(CampaignState state, string roomId, bool paused)
        {
            var site = state.Construction.Sites.Single(s => s.RoomId == roomId);
            if (site.Completed) throw new InvalidOperationException("Construction is already complete.");
            return Replace(state, state.Base, new ConstructionState(state.Construction.Supply.ToDictionary(p => p.Key, p => p.Value), state.Construction.Sites.Select(s => s == site ? s.With(s.WorkedTicks, paused, null) : s), state.Construction.Excavated, state.Construction.Groups, state.Construction.Clearings,state.Construction.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value)));
        }
        public static CampaignState Advance(CampaignState state, ISet<string> busy = null, CampaignState actorContext = null)
        {
            busy??=new HashSet<string>();actorContext??=state;
            state = TerrainClearing.Advance(state, busy, actorContext);
            if (state.Construction == null || state.Construction.Sites.All(s => s.Completed || s.Paused)) return state;
            var rooms = state.Base.Rooms.ToList(); bool changed = false, roomAdded = false;
            var sites = state.Construction.Sites.Select(site =>
            {
                if (site.Completed || site.Paused || RuntimeBlocker(state, site) != null) return site;
                changed = true; long worked = site.WorkedTicks + 1;var updated=site;
                if(site.Bubbles.Count>0)
                {
                    var nodes=WorkBubbles(state,site);var previous=new RecipeWorkState(site.Bubbles,Enumerable.Range(0,site.Bubbles.Count).Where(i=>site.Bubbles[i].CompletedTick.HasValue));
                    var execution=BubbleExecution.Advance(nodes,previous,state.Clock.ElapsedTicks,busy,i=>true,(i,sticky)=>ResolveBubbleActor(actorContext,site,nodes[i],sticky,busy),i=>new Dictionary<string,long>(),(i,outcome)=>true);
                    worked=execution.Bubbles.Sum(b=>(long)b.Ticks);updated=site.With(worked,false,null).WithBubbles(execution.Bubbles);
                }
                if (worked == site.DurationTicks)
                {
                    var definition = state.Base.Planning.Rooms.Single(r => r.Room.Id == site.DefinitionId).Room;
                    if (site.FromTier.HasValue) rooms.RemoveAll(r => r.Id == site.RoomId);
                    rooms.Add(new RoomInstance(site.RoomId, definition, site.Col, site.Row, site.Tier)); roomAdded = true;
                    return updated.With(worked, false, state.Clock.ElapsedTicks);
                }
                return updated.With(worked, false, null);
            }).ToList();
            if (!changed) return state;
            var b = state.Base;
            var data = roomAdded ? new BootstrapData(b.BaseName, rooms, b.Units, b.Receiving, b.Mission, b.MissionMap, b.Combat, b.Care, b.Rescue, b.Storage, b.Cargo, b.Handling, b.Processing, b.Equipment, b.Planning, b.Construction, b.CargoEconomy, b.ResourceProcessing,b.PersonnelRecovery,b.Cores,b.Execution) : b;
            return Replace(state, data, new ConstructionState(state.Construction.Supply.ToDictionary(p => p.Key, p => p.Value), sites, state.Construction.Excavated, state.Construction.Groups, state.Construction.Clearings,state.Construction.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value)));
        }
        internal static CampaignState Replace(CampaignState s, BootstrapData data, ConstructionState construction) => new CampaignState(data, s.Random, s.Clock, s.Assignments, s.Receiving, s.Transfers, s.Expedition, s.Teams, s.Cargo, s.Personnel, construction, cores: s.Cores, workforce: s.Workforce, completedWork: s.CompletedWork);
        public static void Validate(CampaignState state)
        {
            var setup = state.Base.Construction; var work = state.Construction;
            if (setup == null) { if (work != null) throw new InvalidOperationException("Construction definitions are missing."); return; }
            if (work == null || !work.Supply.Keys.OrderBy(k => k).SequenceEqual(setup.StartingSupply.Keys.OrderBy(k => k)) || work.Supply.Values.Any(v => !double.IsFinite(v) || v < 0)) throw new InvalidOperationException("Invalid construction Supply stock.");
            TerrainClearing.Validate(state);
            if (work.Excavated.Distinct().Count() != work.Excavated.Count) throw new InvalidOperationException("Duplicate excavated cell.");
            foreach (var cell in work.Excavated)
            {
                var parts = cell.Split(',');
                if (parts.Length != 2 || !int.TryParse(parts[0], out int x) || !int.TryParse(parts[1], out int y) || cell != x + "," + y || x < 0 || x >= state.Base.Planning.Columns || y < 0 || y >= state.Base.Planning.Rows || x >= setup.ClearCol && x < setup.ClearCol + setup.ClearWidth && y >= setup.ClearRow && y < setup.ClearRow + setup.ClearHeight) throw new InvalidOperationException("Invalid excavated rock cell.");
            }
            if(work.ArchivedCargoSupply.Any(p=>!setup.StartingSupply.ContainsKey(p.Key)||!double.IsFinite(p.Value)||p.Value<0))throw new InvalidOperationException("Invalid archived cargo Supply credits.");
            foreach (var initial in setup.StartingSupply)
                if (Math.Abs(work.Supply[initial.Key] + work.Sites.Where(site => site != null && site.SupplyClass == initial.Key).Sum(site => site.SupplyCost) - initial.Value - ResourceCargo.CommittedSupply(state,initial.Key) - (work.ArchivedCargoSupply.TryGetValue(initial.Key,out var archived)?archived:0) - (initial.Key == setup.RockSupplyClass ? work.Excavated.Count * setup.RockSupply + work.Clearings.Where(o=>!o.Completed).Sum(o=>o.CreditedSupply) : 0)) > .000001)
                    throw new InvalidOperationException("Construction Supply does not balance with persistent site inputs.");
            var storage = state.Base.Rooms.Where(r => r.Definition.Id == setup.SupplyStorageDefinitionId).Sum(r => (long)state.Base.Storage.Find(r.Definition.Id).CapacityByTier[r.ConstructionTier]);
            if (work.Supply.Values.Sum() > storage + .000001) throw new InvalidOperationException("Supply Storage capacity exceeded.");
            var ids = new HashSet<string>(); var actors = new HashSet<string>(); var active = new List<RoomConstructionSite>();
            foreach (var site in work.Sites)
            {
                var plan = state.Base.Planning.Rooms.SingleOrDefault(r => r.Room.Id == site?.DefinitionId);
                if (site == null || plan == null || !ids.Add(site.WorkId) || !System.Text.RegularExpressions.Regex.IsMatch(site.RoomId, "^r[1-9][0-9]*$") || !(site.FromTier.HasValue ? plan.Upgrades : plan.Construction).TryGetValue(site.Tier, out var quote) || quote.BlockedReason != null || site.FromTier != quote.FromTier || site.DurationTicks != Duration(quote) || site.SupplyClass != quote.SupplyClass || !double.IsFinite(site.SupplyCost) || Math.Abs(site.SupplyCost - quote.Supply.Value) > .000001 || site.WorkedTicks < 0 || site.WorkedTicks > site.DurationTicks || site.StartedTick < 0 || site.StartedTick > state.Clock.ElapsedTicks || site.Bubbles.Count==0 && site.WorkedTicks > state.Clock.ElapsedTicks - site.StartedTick || site.Completed != (site.WorkedTicks == site.DurationTicks)) throw new InvalidOperationException("Invalid persistent construction site.");
                if (!state.Base.Rooms.Any(r => r.Id == site.MaintenanceRoomId && r.Definition.Id == setup.MaintenanceDefinition) || site.SecurityActorId == site.ActorId || !state.Base.Units.Any(u => u.Id == site.ActorId) || !state.Base.Units.Any(u => u.Id == site.SecurityActorId) || !FootprintClear(state, plan.Room, site.Col, site.Row)) throw new InvalidOperationException("Invalid construction bubble or uncleared footprint.");
                var room = state.Base.Rooms.SingleOrDefault(r => r.Id == site.RoomId);
                if(site.Bubbles.Count>0)
                {
                    var nodes=WorkBubbles(state,site);
                    if(nodes.Count!=site.Bubbles.Count||site.Bubbles.Sum(b=>(long)b.Ticks)!=site.WorkedTicks)throw new InvalidOperationException("Invalid construction bubble schedule.");
                    for(int i=0;i<nodes.Count;i++)
                    {
                        var b=site.Bubbles[i];var n=nodes[i];
                        if(b.Ticks<0||b.Ticks>n.DurationTicks||b.Ticks>state.Clock.ElapsedTicks-site.StartedTick||(b.ActorId==null)!=(b.Ticks==0)||b.CompletedTick.HasValue!=(b.Ticks==n.DurationTicks)||b.CompletedTick>state.Clock.ElapsedTicks||b.CompletedTick<site.StartedTick+b.Ticks||b.ActorId!=null&&!state.Base.Units.Any(u=>u.Id==b.ActorId)||b.Ticks>0&&n.DependsOn.Any(id=>!site.Bubbles[nodes.ToList().FindIndex(x=>x.Id==id)].CompletedTick.HasValue))throw new InvalidOperationException("Invalid construction bubble Actor or progress.");
                        if(b.ActorId!=null&&!b.CompletedTick.HasValue&&(!actors.Add(b.ActorId)||!RoomGroups.Contains(state,site.MaintenanceRoomId,MaintenanceFor(state,b.ActorId))||state.Transfers.Any(t=>t.UnitId==b.ActorId)))throw new InvalidOperationException("Construction bubble Actor is already assigned or moved.");
                    }
                }
                if (site.Completed)
                {
                    if (room == null || room.Definition.Id != site.DefinitionId || room.Col != site.Col || room.Row != site.Row || room.ConstructionTier < site.Tier || site.CompletedTick > state.Clock.ElapsedTicks || site.Bubbles.Count==0 && site.CompletedTick < site.StartedTick + site.WorkedTicks) throw new InvalidOperationException("Completed construction does not match its physical room.");
                    continue;
                }
                if ((site.FromTier.HasValue ? room == null || room.Definition.Id != site.DefinitionId || room.Col != site.Col || room.Row != site.Row || room.ConstructionTier != site.FromTier : room != null) || active.Any(a => a.RoomId == site.RoomId) || !state.Base.Rooms.Any(r=>r.Id==site.MaintenanceRoomId) || site.Bubbles.Count==0 && (!actors.Add(site.ActorId) || !state.Base.Units.Any(u => u.Id == site.ActorId) || MaintenanceFor(state, site.ActorId) != site.MaintenanceRoomId || state.Transfers.Any(t => t.UnitId == site.ActorId) || SGTeams.ForUnit(state, site.ActorId) != null || Expeditions.IsDeployed(state, site.ActorId))) throw new InvalidOperationException("Construction Actor or footprint is already assigned.");
                if (site.Bubbles.Count==0 && site.WorkedTicks < setup.SecurityTicks && (!actors.Add(site.SecurityActorId) || !RoomGroups.Contains(state, site.MaintenanceRoomId, MaintenanceFor(state, site.SecurityActorId)) || state.Transfers.Any(t => t.UnitId == site.SecurityActorId))) throw new InvalidOperationException("Security Actor is already assigned or moved.");
                var blocker = site.FromTier.HasValue ? null : state.Base.Planning.PlacementBlocker(state.Base, site.DefinitionId, site.Tier, site.Col, site.Row);
                if (blocker != null || plan.Unique && active.Any(a => a.DefinitionId == site.DefinitionId) || active.Any(a => Overlaps(site.Col, site.Row, plan.Room, a.Col, a.Row, state.Base.Planning.Rooms.Single(p => p.Room.Id == a.DefinitionId).Room))) throw new InvalidOperationException("Construction footprint is invalid or overlaps another site.");
                active.Add(site);
            }
        }
    }
}
