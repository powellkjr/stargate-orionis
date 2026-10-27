using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class MissionMapReader
    {
        private sealed class Record { [JsonRequired] public int width, height; [JsonRequired] public List<Stage> stages;public List<Anchor> doors; }
        private sealed class Anchor{public string id,from,to,fromDirection,toDirection;public Cell fromCell,toCell;public bool provisional;}
        private sealed class Stage { [JsonRequired] public string id; [JsonRequired] public List<Cell> cells; }
        private sealed class Cell { [JsonRequired] public int x, y; }
        public static MissionMapDefinition Read(JObject source, MissionDefinition mission)
        {
            if (source == null || mission?.Travel == null) return null;
            foreach (var p in source.Descendants().OfType<JProperty>())
                if (new[] { "width", "height", "x", "y" }.Contains(p.Name) && p.Value.Type != JTokenType.Integer) throw new FormatException("Map geometry requires integers.");
            var r = source.ToObject<Record>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            if (r.width < 1 || r.width > 128 || r.height < 1 || r.height > 128 || r.stages == null || r.stages.Any(s => s == null) ||
                !r.stages.Select(s => s.id).OrderBy(x => x).SequenceEqual(mission.Travel.Stages.Select(s => s.Id).OrderBy(x => x))) throw new FormatException("Map references do not match the mission.");
            var occupied = new HashSet<(int, int)>();
            foreach (var stage in r.stages)
                if (stage.cells == null || stage.cells.Count == 0 || stage.cells.Any(c => c == null || c.x < 0 || c.y < 0 || c.x >= r.width || c.y >= r.height || !occupied.Add((c.x, c.y))))
                    throw new FormatException("Invalid or overlapping mission cells.");
            var doors=(r.doors??new List<Anchor>()).Where(a=>r.stages.Any(s=>s.id==a.from)&&r.stages.Any(s=>s.id==a.to)).ToArray();
            if(doors.Select(a=>a.id).Distinct().Count()!=doors.Length)throw new FormatException("Duplicate presentation doorway.");
            var directions=new Dictionary<string,(int x,int y)>{{"NORTH",(0,-1)},{"EAST",(1,0)},{"SOUTH",(0,1)},{"WEST",(-1,0)}};
            foreach(var a in doors)if(a.fromCell==null||a.toCell==null||a.fromDirection==null||a.toDirection==null||!directions.TryGetValue(a.fromDirection,out var step)||!directions.TryGetValue(a.toDirection,out var back)||step.x!=-back.x||step.y!=-back.y||a.toCell.x-a.fromCell.x!=step.x||a.toCell.y-a.fromCell.y!=step.y)throw new FormatException("Invalid presentation doorway orientation.");
            foreach(var a in doors)if(a.fromCell==null||a.toCell==null||!mission.Travel.Transitions.Any(d=>d.Id==a.id&&d.From==a.from&&d.To==a.to)||!r.stages.Single(s=>s.id==a.from).cells.Any(c=>c.x==a.fromCell.x&&c.y==a.fromCell.y)||!r.stages.Single(s=>s.id==a.to).cells.Any(c=>c.x==a.toCell.x&&c.y==a.toCell.y)||System.Math.Abs(a.fromCell.x-a.toCell.x)+System.Math.Abs(a.fromCell.y-a.toCell.y)!=1)throw new FormatException("Invalid presentation door anchor.");
            return new MissionMapDefinition(r.width, r.height, r.stages.Select(s => new StageFootprint(s.id, s.cells.Select(c => new MapCell(c.x, c.y)))),doors.Select(a=>new MissionDoorAnchor{Id=a.id,From=a.from,To=a.to,FromDirection=a.fromDirection,ToDirection=a.toDirection,FromCell=new MapCell(a.fromCell.x,a.fromCell.y),ToCell=new MapCell(a.toCell.x,a.toCell.y),Provisional=a.provisional}));
        }
    }
}
