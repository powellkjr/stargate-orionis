using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
namespace Orionis.Presentation
{
    public sealed class BaseServicesView : MonoBehaviour
    {
        public void Show(CampaignSession session,string room)
        {
            var s=session.State;var lines=new System.Collections.Generic.List<string>{"Room Group: "+string.Join(" / ",RoomGroups.Members(s,room)),"","Configured Room Services"};
            foreach(string child in RoomGroups.Members(s,room)){
                var r=s.Base.Rooms.Single(r=>r.Id==child);var profile=s.Base.Receiving?.Rooms.SingleOrDefault(p=>p.DefinitionId==r.Definition.Id);
                foreach(var service in profile?.Services??System.Array.Empty<string>())lines.Add(child+" / "+service+" / embedded");
                foreach(var core in s.Cores?.Instances.Where(c=>c.RoomId==child)??System.Array.Empty<CoreInstance>())foreach(var service in RoomCores.Definition(s,core).Services)lines.Add(child+" / "+service+" / "+RoomCores.Definition(s,core).Name);
            }
            lines.Add("");lines.Add("Configured Group Tool Services");var tools=s.Base.Execution?.GroupTools.Where(p=>BaseWork.GroupTool(s,room,p.ToolService)).ToArray()??System.Array.Empty<GroupToolProvider>();foreach(var tool in tools)lines.Add(tool.ToolService+" / unlimited / "+tool.RoomService);if(tools.Length==0)lines.Add("None. Stored Tools are not automatically retrieved.");
            lines.Add("");lines.Add("Available staff (local, Group, then Local Response)");foreach(var worker in BaseWork.Workers(s,room,"UNTRAINED",0)){var unit=s.Base.Units.Single(u=>u.Id==worker.UnitId);lines.Add(unit.Name+" / "+BaseWork.Source(s,room,unit.Id));}
            lines.Add("");lines.Add("Construction Tier changes room capacity. It does not establish Technology Tier or grant technical Services.");
            PrototypeUi.ScrollLabel("Room execution services",transform,new Vector2(.02f,.02f),new Vector2(.98f,.98f),string.Join("\n",lines),16);
        }
    }
}
