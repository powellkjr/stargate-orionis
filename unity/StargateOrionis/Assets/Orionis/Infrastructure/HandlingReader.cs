using System;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class HandlingReader
    {
        internal static HandlingCatalog Read(JObject j, CargoDefinition cargo, BootstrapData data)
        {
            if (j == null) return null;
            string Text(JToken t, string k) => t?[k]?.Type == JTokenType.String && !string.IsNullOrWhiteSpace((string)t[k]) ? (string)t[k] : throw new FormatException("Missing handling identifier or observation.");
            int Int(JToken t, string k) => t?[k]?.Type == JTokenType.Integer && (long)t[k] >= 0 && (long)t[k] <= 100000 ? (int)t[k] : throw new FormatException("Invalid handling requirement.");
            var r = j["recipe"];
            if ((string)j["format"] != "orionis-cargo-handling-prototype-1" || cargo == null || !(j["findings"] is JArray findings) || findings.Count == 0 ||
                !data.Rooms.Any(room => room.Definition.Id == Text(j, "ordinaryStorageDefinitionId")) ||
                r?["toolService"] == null || r["roomService"] == null || Int(r, "minimumTier") < 1 || Int(r, "minimumTier") > 3 || Int(r, "durationTicks") < 1 ||
                !data.Units.Any(u => u.Profession == Text(r, "profession"))) throw new FormatException("Invalid handling definition or reference.");
            var step = new InspectionStep(Text(r, "id"), Text(r, "name"), Text(r, "profession"), Int(r, "minimumTier"), Int(r, "durationTicks"),
                r["toolService"].Type == JTokenType.Null ? null : Text(r, "toolService"), r["roomService"].Type == JTokenType.Null ? null : Text(r, "roomService"), Text(r, "exposureCategory"));
            var facts = findings.Select(f =>
            {
                var id = Text(f, "instanceId"); var condition = Text(f, "condition");
                if (!cargo.Items.Any(i => i.Id == id) || !new[] { "INTACT", "DAMAGED", "UNKNOWN" }.Contains(condition) || f["ordinaryStorageSafe"]?.Type != JTokenType.Boolean)
                    throw new FormatException("Invalid authored handling fact.");
                return new HandlingFinding(id, condition, (bool)f["ordinaryStorageSafe"], Text(f, "observation"));
            }).ToList();
            if (facts.Select(f => f.InstanceId).Distinct().Count() != facts.Count) throw new FormatException("Duplicate handling fact.");
            return new HandlingCatalog(Text(j, "ordinaryStorageDefinitionId"), step, facts);
        }
    }
}
