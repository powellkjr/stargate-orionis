using System;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class UnitEquipmentReader
    {
        internal static UnitEquipmentCatalog Read(JObject j, CargoDefinition cargo)
        {
            if (j == null) return null;
            int Number(JToken token) => token?.Type == JTokenType.Integer && (long)token >= 0 && (long)token <= 1000 ? (int)token : throw new FormatException("Invalid equipment stat.");
            if ((string)j["format"] != "orionis-unit-equipment-prototype-1" || !(j["slots"] is JArray entries) || !(j["itemDamageOverrides"] is JObject damage)) throw new FormatException("Invalid equipment profile.");
            var slots = entries.Select(t => new EquipmentSlotDefinition((string)t["id"], (string)t["requiredTag"], Number(t["damage"]), Number(t["protection"]))).ToList();
            if (!slots.Select(s => s.Id).OrderBy(x => x).SequenceEqual(new[] { "armor", "weapon" }) || slots.Any(s => string.IsNullOrWhiteSpace(s.RequiredTag)) ||
                slots.Single(s => s.Id == "weapon").Damage < 1 || slots.Single(s => s.Id == "armor").Protection < 1)
                throw new FormatException("Weapon and armor slots require authored eligibility and stats.");
            var overrides = damage.Properties().ToDictionary(p => p.Name, p => Number(p.Value));
            if (overrides.Any(p => p.Value < 1 || cargo?.Items.Any(i => i.DefinitionId == p.Key) != true)) throw new FormatException("Unknown equipment damage override.");
            return new UnitEquipmentCatalog(slots, overrides);
        }
    }
}
