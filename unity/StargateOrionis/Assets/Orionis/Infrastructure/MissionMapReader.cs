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
        private sealed class Record { [JsonRequired] public int width, height; [JsonRequired] public List<Stage> stages; }
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
            return new MissionMapDefinition(r.width, r.height, r.stages.Select(s => new StageFootprint(s.id, s.cells.Select(c => new MapCell(c.x, c.y)))));
        }
    }
}
