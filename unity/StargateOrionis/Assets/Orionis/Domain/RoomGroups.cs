using System;
using System.Collections.Generic;
using System.Linq;
namespace Orionis.Domain
{
    // Ordered grouping references physical child rooms; identity, stock and Core ownership stay physical.
    public sealed class RoomGroup
    {
        public string Id { get; }
        public string Primary { get; }
        public string Secondary { get; }
        public bool Active { get; }
        public RoomGroup(string id, string primary, string secondary, bool active = true) { Id=id; Primary=primary; Secondary=secondary; Active=active; }
        public RoomGroup WithActive(bool active) => new RoomGroup(Id,Primary,Secondary,active);
    }
    public static class RoomGroups
    {
        private static IEnumerable<RoomGroup> Groups(CampaignState s) => s.Construction?.Groups ?? Enumerable.Empty<RoomGroup>();
        private static List<string> Flatten(CampaignState s, string reference, HashSet<string> seen = null)
        {
            if (s.Base.Rooms.Any(r=>r.Id==reference)) return new List<string>{reference};
            seen = seen ?? new HashSet<string>();
            if (reference == null || !seen.Add(reference)) throw new InvalidOperationException("Missing or cyclic Room Group reference.");
            var group=Groups(s).SingleOrDefault(g=>g.Id==reference) ?? throw new InvalidOperationException("Unknown Room Group.");
            var a=Flatten(s,group.Primary,new HashSet<string>(seen));a.AddRange(Flatten(s,group.Secondary,new HashSet<string>(seen)));return a;
        }
        public static RoomGroup ForRoom(CampaignState s,string room) => Groups(s).SingleOrDefault(g=>g.Active && Flatten(s,g.Id).Contains(room));
        public static IReadOnlyList<string> Members(CampaignState s,string room)
        {
            if(room==null || !s.Base.Rooms.Any(r=>r.Id==room))return new List<string>();
            var group=ForRoom(s,room);return group==null?new List<string>{room}:Flatten(s,group.Id);
        }
        public static bool Contains(CampaignState s,string room,string candidate) => candidate!=null && Members(s,room).Contains(candidate);
        public static int ActorPriority(CampaignState s,string room,string unit)
        {
            var home=s.Assignments.FirstOrDefault(a=>a.UnitId==unit)?.RoomInstanceId;
            if(home==room)return 0;
            var rooms=Members(s,room).Where(id=>id!=room).ToList();int index=rooms.IndexOf(home);return index<0?int.MaxValue:index+1;
        }
        public static bool HasService(CampaignState s,string room,string service) => service==null || Members(s,room).Any(id=>s.Base.Receiving?.Rooms.SingleOrDefault(p=>p.DefinitionId==s.Base.Rooms.Single(r=>r.Id==id).Definition.Id)?.Services.Contains(service)==true || s.Cores?.Instances.Any(c=>c.RoomId==id&&RoomCores.Definition(s,c).Services.Contains(service))==true);
        public static string Reference(CampaignState s,string room) => ForRoom(s,room)?.Id ?? room;
        private static string ShapeBlocker(CampaignState s,string first,string second)
        {
            RoomJoinFootprint Project(string id)
            {
                var room=s.Base.Rooms.Single(r=>r.Id==id);
                var plan=s.Base.Planning.Rooms.Single(p=>p.Room.Id==room.Definition.Id);
                return new RoomJoinFootprint { Id=id, X=room.Col, Y=room.Row, Width=room.Definition.Width,
                    Height=room.Definition.Height, Tier=room.ConstructionTier, JoinGroup=plan.JoinGroup, Layouts=plan.JoinLayouts };
            }
            return RoomJoinGeometry.Blocker(Flatten(s,first).Select(Project).ToList(), Flatten(s,second).Select(Project).ToList());
        }
        public static string JoinBlocker(CampaignState s,string firstRoom,string secondRoom)
        {
            if(s.Construction==null || firstRoom==null || secondRoom==null || !s.Base.Rooms.Any(r=>r.Id==firstRoom)||!s.Base.Rooms.Any(r=>r.Id==secondRoom))return "Select two existing rooms.";
            string first=Reference(s,firstRoom),second=Reference(s,secondRoom);
            if(first==second)return "These rooms already belong to the same Group.";
            if(Members(s,firstRoom).Concat(Members(s,secondRoom)).Any(id=>s.Construction.Sites.Any(site=>!site.Completed&&site.RoomId==id)))return "Finish construction or upgrades before joining.";
            return ShapeBlocker(s,first,second);
        }
        public static CampaignState Join(CampaignState s,string primaryRoom,string secondaryRoom)
        {
            var blocker=JoinBlocker(s,primaryRoom,secondaryRoom);if(blocker!=null)throw new InvalidOperationException(blocker);
            var first=Reference(s,primaryRoom);var second=Reference(s,secondaryRoom);
            int next=Groups(s).Select(g=>int.Parse(g.Id.Substring(1))).DefaultIfEmpty(0).Max()+1;
            var entries=Groups(s).Select(g=>g.Id==first||g.Id==second?g.WithActive(false):g).Append(new RoomGroup("g"+next,first,second));
            return Replace(s,entries);
        }
        public static CampaignState Split(CampaignState s,string room)
        {
            var group=ForRoom(s,room)??throw new InvalidOperationException("This room is not grouped.");
            return Replace(s,Groups(s).Select(g=>g.Id==group.Id?g.WithActive(false):g.Id==group.Primary||g.Id==group.Secondary?g.WithActive(true):g));
        }
        private static CampaignState Replace(CampaignState s,IEnumerable<RoomGroup> groups)=>new CampaignState(s.Base,s.Random,s.Clock,s.Assignments,s.Receiving,s.Transfers,s.Expedition,s.Teams,s.Cargo,s.Personnel,new ConstructionState(s.Construction.Supply.ToDictionary(p=>p.Key,p=>p.Value),s.Construction.Sites,s.Construction.Excavated,groups,s.Construction.Clearings,s.Construction.ArchivedCargoSupply.ToDictionary(p=>p.Key,p=>p.Value)), cores: s.Cores, workforce: s.Workforce, completedWork: s.CompletedWork);
        public static void Validate(CampaignState s)
        {
            var groups=Groups(s).ToList();var ids=new HashSet<string>();
            foreach(var group in groups)
            {
                if(group==null || group.Id==null || !System.Text.RegularExpressions.Regex.IsMatch(group.Id,"^g[1-9][0-9]*$") || !ids.Add(group.Id))throw new InvalidOperationException("Invalid Room Group identity.");
                var children=Flatten(s,group.Id);if(children.Count!=children.Distinct().Count() || children.Count!=2&&children.Count!=4)throw new InvalidOperationException("Invalid Room Group children.");
            }
            var occupied=new HashSet<string>();
            foreach(var group in groups.Where(g=>g.Active))
            {
                if(ShapeBlocker(s,group.Primary,group.Secondary)!=null || groups.Any(g=>(g.Id==group.Primary||g.Id==group.Secondary)&&g.Active) || Flatten(s,group.Id).Any(id=>!occupied.Add(id)))throw new InvalidOperationException("Room Groups overlap or violate authored joining rules.");
            }
        }
    }
}
