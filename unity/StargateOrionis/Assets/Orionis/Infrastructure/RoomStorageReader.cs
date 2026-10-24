using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class RoomStorageReader
    {
        private static string Text(JToken token, string key) => token?[key]?.Type == JTokenType.String && !string.IsNullOrWhiteSpace((string)token[key]) ? (string)token[key] : throw new FormatException("Missing storage identifier/label.");
        private static string[] Strings(JToken token)
        {
            if (!(token is JArray) || token.Count() == 0 || token.Any(v => v.Type != JTokenType.String || string.IsNullOrWhiteSpace((string)v)) || token.Values<string>().Distinct().Count() != token.Count())
                throw new FormatException("Invalid storage categories/classes.");
            return token.Values<string>().ToArray();
        }
        private static IDictionary<int, int> Capacity(JToken token, RoomDefinition definition)
        {
            if (!(token is JObject obj)) throw new FormatException("Missing storage capacity map.");
            var result = new Dictionary<int, int>();
            foreach (var p in obj.Properties())
            {
                if (!int.TryParse(p.Name, out var tier) || p.Value.Type != JTokenType.Integer || (long)p.Value < 0 || (long)p.Value > int.MaxValue) throw new FormatException("Invalid storage capacity.");
                result.Add(tier, (int)p.Value);
            }
            if (!result.Keys.OrderBy(x => x).SequenceEqual(definition.StaffingByTier.Keys.OrderBy(x => x))) throw new FormatException("Storage capacity tiers do not match their room.");
            return result;
        }
        public static RoomStorageCatalog Read(JObject source, BootstrapData data)
        {
            if (source == null) return null;
            if (!(source["profiles"] is JArray profiles)) throw new FormatException("Missing storage profiles.");
            var result = profiles.Select(p =>
            {
                var id = Text(p, "definitionId"); var definition = data.Rooms.FirstOrDefault(r => r.Definition.Id == id)?.Definition ?? throw new FormatException("Storage profile has no physical room.");
                if (!(p["tabs"] is JArray tabs)) throw new FormatException("Missing storage tabs.");
                var entries = tabs.Select(t => new StorageTab(Text(t, "id"), Text(t, "label"), Strings(t["classes"]), Capacity(t["capacityByTier"], definition))).ToList();
                if (entries.Select(t => t.Id).Distinct().Count() != entries.Count) throw new FormatException("Duplicate storage tab.");
                return new RoomStorageProfile(id, Strings(p["categories"]), Capacity(p["capacityByTier"], definition), entries, (bool?)p["sharedItemCapacity"] ?? false);
            }).ToList();
            if (result.Select(p => p.DefinitionId).Distinct().Count() != result.Count) throw new FormatException("Duplicate storage profile.");
            return new RoomStorageCatalog(result);
        }
    }
}
