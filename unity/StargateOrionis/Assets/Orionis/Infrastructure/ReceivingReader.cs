using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class ReceivingReader
    {
        private static void Require(bool condition, string reason)
        { if (!condition) throw new FormatException("Receiving data: " + reason); }
        private static string Text(JToken value, string key)
        {
            Require(value?[key]?.Type == JTokenType.String && !string.IsNullOrWhiteSpace(value[key].Value<string>()), "missing " + key);
            return value[key].Value<string>();
        }
        private static int Number(JToken value, string key)
        { Require(value?[key]?.Type == JTokenType.Integer, "integer required: " + key); return value[key].Value<int>(); }
        private static List<string> Strings(JToken value)
        {
            Require(value is JArray && value.All(v => v.Type == JTokenType.String && !string.IsNullOrWhiteSpace(v.Value<string>())), "invalid identifier list.");
            var result = value.Values<string>().ToList(); Require(result.Distinct().Count() == result.Count, "duplicate identifier."); return result;
        }
        private static Dictionary<int, int> Capacity(JToken value)
        {
            Require(value is JObject, "capacity map required.");
            var result = new Dictionary<int, int>();
            foreach (var p in ((JObject)value).Properties())
            {
                Require(int.TryParse(p.Name, out var tier) && tier >= 1 && tier <= 3 && p.Value.Type == JTokenType.Integer && p.Value.Value<int>() >= 0, "invalid capacity.");
                result.Add(tier, p.Value.Value<int>());
            }
            return result;
        }
        internal static List<IncomingItem> Items(JArray pairs)
        {
            return pairs.Select(pair =>
            {
                var i = pair["instance"]; var d = pair["item"];
                Require(i is JObject && d is JObject && Text(i, "itemId") == Text(d, "id") &&
                    i["processes"]?["receiving"]?["state"]?.Value<string>() == "NOT_STARTED", "invalid incoming fixture.");
                int quantity = Number(i["state"], "quantity"), whole = Number(i["state"], "percentOfWhole"), cost = Number(d["storage"], "handlingCost");
                Require(quantity >= 1 && whole >= 0 && whole <= 1000 && cost >= 0 && (long)quantity * cost <= int.MaxValue, "invalid physical quantity or handling cost.");
                var reality = Strings(i["reality"]?["authoredTags"]);
                // Preserve existing Reality, including item/instance implementation bindings, without granting Knowledge.
                foreach (var b in (d["theoryBindings"] ?? new JArray()).Concat(i["reality"]?["theoryBindings"] ?? new JArray()))
                    foreach (var tag in Strings(b["implementationTags"] ?? new JArray())) if (!reality.Contains(tag)) reality.Add(tag);
                return new IncomingItem(Text(i, "instanceId"), Text(d, "id"), (string)d["nameResolution"]?["initialName"] ?? (string)i["displayName"] ?? "Unknown object",
                    (string)d["nameResolution"]?["processExitNames"]?["receiving"] ?? (string)i["displayName"] ?? "Unclassified object", Text(i["state"], "condition"), (string)i["state"]?["functionalState"] ?? "UNKNOWN",
                    quantity, whole, cost, reality, Strings(i["knowledge"]?["revealedTags"]), Strings(i["processingTags"]),
                    Strings(d["storage"]?["storageClasses"]), Strings(d["processingExposure"]?["receiving"]?["identityTags"] ?? new JArray()),
                    Strings(d["processingExposure"]?["receiving"]?["conditionTags"] ?? new JArray()));
            }).ToList();
        }
        public static ReceivingCatalog Read(JObject source, BootstrapData data)
        {
            if (source == null) return null;
            Require(source["recipe"] is JObject && source["items"] is JArray && source["rooms"] is JArray && source["units"] is JArray && source["transitions"] is JArray, "missing collections.");
            var recipe = source["recipe"];
            Require(recipe["steps"] is JArray && recipe["steps"].Count() > 0, "steps required.");
            var steps = recipe["steps"].Select(s =>
            {
                var tier = Number(s, "minimumTier"); var ticks = Number(s, "durationTicks");
                Require(tier >= 1 && tier <= 3 && ticks > 0 && ticks <= 100000, "invalid step tier or duration.");
                var category = Text(s, "exposureCategory"); Require(category == "identityTags" || category == "conditionTags", "unsupported inspection exposure.");
                Require(s["toolService"] != null && s["roomService"] != null, "Service requirements must be explicit, including null.");
                return new InspectionStep(Text(s, "id"), Text(s, "name"), Text(s, "profession"), tier, ticks,
                    s["toolService"].Type == JTokenType.Null ? null : Text(s, "toolService"),
                    s["roomService"].Type == JTokenType.Null ? null : Text(s, "roomService"), category);
            }).ToList();
            Require(steps.Select(s => s.Id).Distinct().Count() == steps.Count, "duplicate step.");
            var incoming = Items((JArray)source["items"]);
            Require(incoming.Count > 0 && incoming.Select(i => i.Id).Distinct().Count() == incoming.Count, "duplicate/missing incoming instances.");
            var rooms = source["rooms"].Select(r => new InspectionRoom(Text(r, "definitionId"), Capacity(r["capacityByTier"]),
                Strings(r["storageClasses"]), Strings(r["capabilities"]), Strings(r["services"]))).ToList();
            Require(rooms.Select(r => r.DefinitionId).Distinct().Count() == rooms.Count && data.Rooms.All(r => rooms.Any(p => p.DefinitionId == r.Definition.Id)), "invalid room profiles.");
            var workers = source["units"].Select(w =>
            {
                Require(w["qualifications"] is JObject, "worker qualifications required.");
                var qualifications = ((JObject)w["qualifications"]).Properties().ToDictionary(p => p.Name, p =>
                { Require(p.Value.Type == JTokenType.Integer && p.Value.Value<int>() >= 0 && p.Value.Value<int>() <= 3, "invalid qualification."); return p.Value.Value<int>(); });
                return new InspectionWorker(Text(w, "id"), qualifications, Strings(w["toolServices"]));
            }).ToList();
            Require(workers.Select(w => w.UnitId).OrderBy(id => id).SequenceEqual(data.Units.Select(u => u.Id).OrderBy(id => id)), "worker identities do not match the roster.");
            ProcessingTransition Transition(string id)
            {
                var t = source["transitions"].SingleOrDefault(v => v["id"]?.Value<string>() == id);
                Require(t != null, "missing transition: " + id);
                return new ProcessingTransition(Strings(t["requiredProcessingTags"] ?? new JArray()), Strings(t["addProcessingTags"] ?? new JArray()), Strings(t["removeProcessingTags"] ?? new JArray()));
            }
            var capability = Text(recipe, "requiredRoomCapability");
            Require(Strings(source["admission"]?["requiredRoomCapabilities"]).SequenceEqual(new[] { capability }), "unsupported admission capabilities.");
            Require(!Strings(source["admission"]?["forbiddenProcessingTags"] ?? new JArray()).Any(), "unsupported admission exclusions.");
            return new ReceivingCatalog(Text(recipe, "id"), capability, Text(recipe, "storageClass"), steps, incoming, rooms, workers,
                Strings(source["admission"]?["requiredProcessingTags"]), Transition("RECEIVING_AUTHORIZE"), Transition("RECEIVING_COMPLETE"));
        }
    }
}
