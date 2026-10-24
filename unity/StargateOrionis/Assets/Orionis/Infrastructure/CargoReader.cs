using System;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class CargoReader
    {
        internal static CargoDefinition Read(JObject j, MissionDefinition mission)
        {
            if (j == null) return null;
            string Text(JToken t, string k) => t?[k]?.Type == JTokenType.String && !string.IsNullOrWhiteSpace((string)t[k]) ? (string)t[k] : throw new FormatException("Missing cargo identifier.");
            int Int(JToken t, string k) => t?[k]?.Type == JTokenType.Integer && (long)t[k] >= 0 && (long)t[k] <= int.MaxValue ? (int)t[k] : throw new FormatException("Invalid cargo number.");
            var r = j["reveal"];
            var req = new FieldRequirements(Text(r, "id"), Text(r, "profession"), Int(r, "minimumTier"), 0, null, 0, Int(r, "ticks"));
            if (req.Ticks != 1 || req.MinimumTier != 1 || req.Profession != "DIPLOMAT" || !(j["items"] is JArray pairs) || pairs.Count == 0 ||
                mission?.Travel?.Stages.Any(s => s.Id == Text(j, "stageId")) != true || !mission.Travel.Npcs.Any(n => n.Id == Text(j, "guardId")))
                throw new FormatException("Unsupported cargo reveal/recovery contract.");
            var items = ReceivingReader.Items(pairs);
            if (items.Select(i => i.Id).Distinct().Count() != items.Count || !items.Any(i => i.Id == Text(j, "containerId"))) throw new FormatException("Missing or duplicate physical crate/content identity.");
            var payloads = pairs.ToDictionary(p => Text(p["instance"], "instanceId"), p => p["physicalPayload"]?.Type == JTokenType.Object ? p["physicalPayload"].ToString(Formatting.None) : throw new FormatException("Missing original physical payload."));
            foreach (var pair in pairs)
            {
                var p = pair["physicalPayload"]; var i = pair["instance"];
                if ((string)p["instanceId"] != (string)i["instanceId"] || (string)p["itemId"] != (string)i["itemId"] ||
                    !JToken.DeepEquals(p["state"], i["state"]) || !JToken.DeepEquals(p["reality"], i["reality"]) || !JToken.DeepEquals(p["knowledge"], i["knowledge"]))
                    throw new FormatException("Cargo projection changed physical state or Knowledge.");
            }
            return new CargoDefinition(Text(j, "containerId"), Text(j, "label"), Text(j, "stageId"), Text(j, "guardId"), Int(j, "suspicionDelta"), req, items, payloads);
        }
    }
}
