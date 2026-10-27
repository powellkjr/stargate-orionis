using System;
using System.Collections.Generic;
using System.Linq;
namespace Orionis.Domain
{
    public sealed class GroupToolProvider
    {public string RoomService {get;} public string ToolService {get;} public GroupToolProvider(string roomService,string toolService){RoomService=roomService;ToolService=toolService;}}
    public sealed class BaseExecutionCatalog
    {public string ResponseRoomDefinitionId {get;} public IReadOnlyList<GroupToolProvider> GroupTools {get;} public BaseExecutionCatalog(string responseRoomDefinitionId,IEnumerable<GroupToolProvider> groupTools){ResponseRoomDefinitionId=responseRoomDefinitionId;GroupTools=groupTools.ToArray();}}
    public sealed class WorkforceState
    {public IReadOnlyList<string> BaseResponseRooms {get;} public WorkforceState(IEnumerable<string> baseResponseRooms){BaseResponseRooms=(baseResponseRooms??throw new ArgumentNullException(nameof(baseResponseRooms))).ToArray();}}
    // Capability/eligibility is separate from availability and the tick's busy set.
    public static class BaseWork
    {
        public static bool ResponseRoom(CampaignState s,string room)=>s.Base.Execution!=null&&s.Base.Rooms.Any(r=>r.Id==room&&r.Definition.Id==s.Base.Execution.ResponseRoomDefinitionId);
        public static bool OnBaseResponse(CampaignState s,string unit)=>s.Assignments.Any(a=>a.UnitId==unit&&s.Workforce.BaseResponseRooms.Contains(a.RoomInstanceId));
        public static bool Eligible(CampaignState s,string room,string unit)=>s.Assignments.Any(a=>a.UnitId==unit&&(RoomGroups.Contains(s,room,a.RoomInstanceId)||ResponseRoom(s,a.RoomInstanceId)));
        public static int Priority(CampaignState s,string room,string unit){int local=RoomGroups.ActorPriority(s,room,unit);return local==int.MaxValue?100000:local;}
        public static string Source(CampaignState s,string room,string unit){var home=s.Assignments.SingleOrDefault(a=>a.UnitId==unit)?.RoomInstanceId;return home==room?"Local staff":RoomGroups.Contains(s,room,home)?"Group staff / "+home:ResponseRoom(s,home)?"Local Response / "+home:"Unavailable here";}
        public static IEnumerable<InspectionWorker> Workers(CampaignState s,string room,string profession,int tier,string sticky=null)=>
            (s.Base.Receiving?.Workers??Array.Empty<InspectionWorker>()).Where(w=>(sticky==null||sticky==w.UnitId)&&Eligible(s,room,w.UnitId)&&(profession=="UNTRAINED"||w.Qualifications.TryGetValue(profession,out int level)&&level>=tier)&&!OnBaseResponse(s,w.UnitId)&&!Expeditions.IsDeployed(s,w.UnitId)&&!Expeditions.IsIncapacitated(s,w.UnitId)&&!PersonnelRecovery.InBed(s,w.UnitId)).OrderBy(w=>Priority(s,room,w.UnitId)).ThenBy(w=>w.UnitId,StringComparer.Ordinal);
        public static bool GroupTool(CampaignState s,string room,string tool)=>room!=null&&s.Base.Execution?.GroupTools.Any(p=>p.ToolService==tool&&RoomGroups.HasService(s,room,p.RoomService))==true;
        public static bool PersonalTool(CampaignState s,string actor,string service,int charges=0)=>service==null||s.Base.Mission==null&&charges==0&&PersonnelCondition.HasToolService(s,actor,service)||s.Base.Mission!=null&&PersonnelCondition.Tools(s,actor).Any(t=>!t.Damaged&&t.Services.Contains(service)&&t.Charges>=charges);
        public static bool HasTool(CampaignState s,string room,string actor,string service,int charges=0)=>service==null||PersonalTool(s,actor,service,charges)||GroupTool(s,room,service);
        public static string ToolSource(CampaignState s,string room,string actor,string service,int charges=0)=>service==null?"No Tool required":PersonalTool(s,actor,service,charges)?"Personal / "+service:GroupTool(s,room,service)?"Group / "+service:"Missing / "+service;
        public static CampaignState SetBaseResponse(CampaignState s,string room,bool active)
        {if(!ResponseRoom(s,room))throw new InvalidOperationException("Choose a Response Room.");var rooms=s.Workforce.BaseResponseRooms.Where(r=>r!=room).Concat(active?new[]{room}:Array.Empty<string>());return new CampaignState(s.Base,s.Random,s.Clock,s.Assignments,s.Receiving,s.Transfers,s.Expedition,s.Teams,s.Cargo,s.Personnel,s.Construction,s.Cores,new WorkforceState(rooms), completedWork: s.CompletedWork);}
        public static void Validate(CampaignState s)
        {if(s.Workforce.BaseResponseRooms.Distinct().Count()!=s.Workforce.BaseResponseRooms.Count||s.Workforce.BaseResponseRooms.Any(r=>!ResponseRoom(s,r)))throw new InvalidOperationException("Invalid Base Response assignment.");}
    }
}
