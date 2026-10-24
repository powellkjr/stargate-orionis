using System;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class CargoProcessingReader
    {
        internal static CargoProcessingCatalog Read(JObject j, JObject cargo, BootstrapData data)
        {
            if (j == null) return null;
            string Text(JToken t, string key) => t?[key]?.Type == JTokenType.String && !string.IsNullOrWhiteSpace((string)t[key]) ? (string)t[key] : throw new FormatException("Missing cargo processing identifier.");
            int Int(JToken t, string key) => t?[key]?.Type == JTokenType.Integer && (long)t[key] > 0 && (long)t[key] <= 100000 ? (int)t[key] : throw new FormatException("Invalid cargo processing requirement.");
            var a = j["examination"]; var r = a?["recipe"];
            if ((string)j["format"] != "orionis-cargo-processing-prototype-1" || cargo == null || !(j["receivingFindings"] is JArray findings) ||
                !data.Rooms.Any(room => room.Definition.Id == Text(a, "roomDefinitionId")) || Int(r, "minimumTier") > 3 ||
                r["roomService"]?.Type != JTokenType.Null || Text(r, "exposureCategory") != "authoredInstanceProperties")
                throw new FormatException("Invalid cargo processing projection.");
            var step = new InspectionStep(Text(r, "id"), Text(r, "name"), Text(r, "profession"), Int(r, "minimumTier"), Int(r, "durationTicks"), Text(r, "toolService"), null, Text(r, "exposureCategory"));
            var subjects = cargo["items"].Select(entry =>
            {
                var item = entry["item"]; var payload = entry["physicalPayload"];
                var evidence = payload["reality"]?["authoredTags"]?.Values<string>().Distinct().ToArray() ?? Array.Empty<string>();
                var inherent = item["possibleReality"]?["inherentTags"]?.Values<string>() ?? Enumerable.Empty<string>();
                var implementation = payload["reality"]?["theoryBindings"]?.SelectMany(binding => binding["implementationTags"]?.Values<string>() ?? Enumerable.Empty<string>()) ?? Enumerable.Empty<string>();
                // Identity is the authored item name, never an intermediate process label.
                // Required properties are separate from what this examination can reveal.
                return new ExaminationSubject(Text(payload, "instanceId"), (string)item["name"], evidence, evidence.Concat(inherent).Concat(implementation));
            }).ToList();
            var intake = findings.Select(f =>
            {
                var id = Text(f, "instanceId"); var condition = Text(f, "condition");
                if (!cargo["items"].Any(i => (string)i["instance"]?["instanceId"] == id) || !new[] { "UNKNOWN", "INTACT", "DAMAGED" }.Contains(condition) || f["ordinaryStorageSafe"]?.Type != JTokenType.Boolean)
                    throw new FormatException("Invalid Receiving finding.");
                return new HandlingFinding(id, condition, (bool)f["ordinaryStorageSafe"], Text(f, "observation"));
            }).ToList();
            if (intake.Select(f => f.InstanceId).Distinct().Count() != intake.Count) throw new FormatException("Duplicate Receiving finding.");
            return new CargoProcessingCatalog(Text(a, "roomDefinitionId"), Int(a, "concurrentProjects"), step, subjects, intake, j["equipmentTabTags"]?.ToObject<System.Collections.Generic.Dictionary<string, string>>() ?? throw new FormatException("Equipment tab routing is missing."), Int(a, "itemCapacity"));
        }
    }
}
