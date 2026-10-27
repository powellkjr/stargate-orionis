using System.Collections.Generic;
using System.Linq;
using Orionis.Domain;
using UnityEngine;
namespace Orionis.Presentation
{
    public static class OffworldRoute
    {
        public static IReadOnlyList<Vector2> ThroughRooms(MissionMapDefinition map,string fromStage,string toStage,Vector2 from,Vector2 to)
        {
            var cells=map.Stages.Where(s=>s.Id==fromStage||s.Id==toStage).SelectMany(s=>s.Cells).Select(c=>new Vector2Int(c.X,c.Y)).ToHashSet();
            var start=new Vector2Int(Mathf.FloorToInt(from.x),Mathf.FloorToInt(from.y));var end=new Vector2Int(Mathf.FloorToInt(to.x),Mathf.FloorToInt(to.y));
            var queue=new Queue<Vector2Int>();var previous=new Dictionary<Vector2Int,Vector2Int>();queue.Enqueue(start);previous[start]=start;
            var directions=new[]{Vector2Int.up,Vector2Int.right,Vector2Int.down,Vector2Int.left};
            while(queue.Count>0){var c=queue.Dequeue();if(c==end)break;foreach(var d in directions){var n=c+d;if(cells.Contains(n)&&!previous.ContainsKey(n)){previous[n]=c;queue.Enqueue(n);}}}
            if(!previous.ContainsKey(end))return new[]{from}; // No visual shortcut through non-room cells.
            var path=new List<Vector2Int>();for(var c=end;c!=start;c=previous[c])path.Add(c);path.Reverse();
            var offset=from-new Vector2(start.x,start.y);var points=new List<Vector2>{from};points.AddRange(path.Select(c=>new Vector2(c.x,c.y)+offset));if(points.Last()!=to)points.Add(to);return points;
        }
    }
}
