using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    public static class RoomPlanningReader
    {
        public static RoomPlanningCatalog Read(JObject source, IDictionary<string, RoomDefinition> definitions)
        {
            if (source == null) return null; // Historical snapshots predate the planner.
            int columns = (int?)source["columns"] ?? 0, rows = (int?)source["rows"] ?? 0;
            if (columns != 12 || rows != 10 || !(source["rooms"] is JArray entries))
                throw new FormatException("Invalid base planning grid/catalog.");
            var result = new List<RoomPlanDefinition>();
            foreach (var entry in entries)
            {
                string id = (string)entry["id"];
                if (id == null || !definitions.TryGetValue(id, out var room) || result.Any(r => r.Room.Id == id))
                    throw new FormatException("Unknown/duplicate planning room.");
                var cores = new Dictionary<int, string>();
                var construction = new Dictionary<int, RoomConstructionEstimate>();
                var upgrades = new Dictionary<int, RoomConstructionEstimate>();
                foreach (var tier in (JArray)entry["tiers"])
                {
                    int value = (int)tier["tier"]; string description = (string)tier["cores"];
                    if (!room.StaffingByTier.ContainsKey(value) || string.IsNullOrWhiteSpace(description) || cores.ContainsKey(value))
                        throw new FormatException("Invalid planning construction tier.");
                    cores.Add(value, description);
                    if (tier["construction"] is JObject build) construction.Add(value, ReadEstimate(build, value));
                    if (tier["upgrade"] is JObject upgrade) upgrades.Add(value, ReadEstimate(upgrade, value));
                }
                if (cores.Count != room.StaffingByTier.Count) throw new FormatException("Incomplete planning tiers.");
                result.Add(new RoomPlanDefinition(room, (bool)entry["constructible"], (bool)entry["unique"],
                    (string)entry["purpose"], (string)entry["joinGroup"], cores,
                    entry["services"].Values<string>(), entry["capabilities"].Values<string>(), construction, upgrades, (string)entry["category"] ?? "Other", entry["joinLayouts"]?.Values<string>()));
            }
            if (result.Count != definitions.Count) throw new FormatException("Incomplete planning catalog.");
            return new RoomPlanningCatalog(columns, rows, result, source["categoryOrder"]?.Values<string>(), (source["resourceClasses"] as JObject)?.Properties().ToDictionary(p => p.Name, p => p.Value.Values<string>().ToArray()));
        }
        private static RoomConstructionEstimate ReadEstimate(JObject value, int tier)
        {
            double? hours = (double?)value["hours"], supply = (double?)value["supply"];
            int? from = (int?)value["fromTier"];
            string blocked = (string)value["blockedReason"], supplyClass = (string)value["supplyClass"];
            if ((int?)value["toTier"] != tier || supplyClass != "S" + tier ||
                (blocked == null ? hours == null || hours < 0 || supply == null || supply < 0 : hours != null || supply != null))
                throw new FormatException("Invalid construction quote.");
            var components = new List<ConstructionWorkComponent>();
            foreach (var component in (JArray)value["components"])
            {
                string kind = (string)component["kind"];
                int places = (int)component["places"];
                double rate = (double)component["hoursPerPlace"], work = (double)component["hours"];
                if (!new[] { "coreSlots", "staffSlots", "inventoryPlaces", "resourceUnits", "occupantPlaces", "shellWork" }.Contains(kind) || components.Any(c => c.Kind == kind) ||
                    places < 0 || rate <= 0 || !double.IsFinite(rate) || !double.IsFinite(work) || Math.Abs(places * rate - work) > .000001)
                    throw new FormatException("Invalid construction work component.");
                components.Add(new ConstructionWorkComponent(kind, places, rate, work));
            }
            if (blocked == null && ((components.Count < 5 || components.Count > 6) || Math.Abs(components.Sum(c => c.Hours) - hours.Value) > .000001))
                throw new FormatException("Construction quote total differs from work.");
            return new RoomConstructionEstimate(from, tier, hours, supply, supplyClass, blocked, components);
        }
    }
}
