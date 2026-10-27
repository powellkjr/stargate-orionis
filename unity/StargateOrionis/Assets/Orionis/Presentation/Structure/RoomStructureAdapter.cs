using System;
using System.Collections.Generic;
using System.Linq;
using Orionis.Domain;
using UnityEngine;
namespace Orionis.Presentation.Structure
{
    public static class RoomStructureAdapter
    {
        public static Vector2Int Cell(int x,int y)=>new Vector2Int(x,-y-1);
        public static string BaseKey(CampaignState s)=>string.Join(";",s.Base.Rooms.Select(r=>r.Id+":"+r.Col+","+r.Row+","+r.ConstructionTier+":"+RoomGroups.Reference(s,r.Id)));
        public static RoomStructureModel Base(CampaignState s)
        {
            var groups=s.Base.Rooms.GroupBy(r=>RoomGroups.Reference(s,r.Id)).Select(g=>new RoomStructureGroup{Id=g.Key,Tier=g.First().ConstructionTier,Cells=g.SelectMany(r=>Enumerable.Range(r.Row,r.Definition.Height).SelectMany(y=>Enumerable.Range(r.Col,r.Definition.Width).Select(x=>Cell(x,y)))).ToArray()});
            // Base saves do not retain an exterior cell-edge door mapping. Do not
            // turn legacy side-only doorIndex hints or adjacency into connectivity.
            return RoomStructureModel.Build(groups);
        }
        public static RoomStructureModel Mission(CampaignState s)
        {
            var t=s.Expedition.Travel;var d=s.Base.Mission.Travel;
            bool Known(string id)=>d.Stages.Single(a=>a.Id==id).Known||t.Visits.ContainsKey(id);
            var groups=s.Base.MissionMap.Stages.Where(a=>Known(a.Id)&&PresentationArt.StageHasWalls(a.Id)).Select(a=>new RoomStructureGroup{Id=a.Id,Cells=a.Cells.Select(c=>Cell(c.X,c.Y)).ToArray()}).ToArray();
            var open=new Dictionary<string,bool>();
            foreach(var anchor in s.Base.MissionMap.Doors){var door=d.Transitions.Single(a=>a.Id==anchor.Id);if(!MissionTravel.DoorVisible(s,door))continue;open[door.Id]=door.InitialState=="OPEN"||t.OpenDoors.Contains(door.Id);
                foreach(var group in groups){MapCell cell;string side;if(group.Id==anchor.From){cell=anchor.FromCell;side=anchor.FromDirection;}else if(group.Id==anchor.To){cell=anchor.ToCell;side=anchor.ToDirection;}else continue;
                    if(!Enum.TryParse(side,true,out RoomArtSide parsed))throw new InvalidOperationException("Missing authored door orientation.");var edge=new RoomArtEdge(Cell(cell.X,cell.Y),parsed);if(RoomArtTopology.Exterior(group.Cells).Contains(edge))group.Doors[edge]=door.Id;
                }
            }
            var result=RoomStructureModel.Build(groups);foreach(var entry in open)result.DoorOpen[entry.Key]=entry.Value;return result;
        }
    }
}
