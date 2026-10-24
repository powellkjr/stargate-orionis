using System;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class ConstructionSetupReader
    {
        public static ConstructionSetup Read(JObject source)
        {
            if (source == null) return null;
            var execution = source["execution"];
            if (execution == null || source["startingSupply"] == null) throw new FormatException("Construction execution or starting stock is missing.");
            string profession = (string)execution["profession"], tool = (string)execution["toolService"], storage = (string)execution["supplyStorageDefinitionId"];
            int tier = (int?)execution["minimumTier"] ?? 0;
            if (string.IsNullOrWhiteSpace(profession) || string.IsNullOrWhiteSpace(storage) || tier < 1 || tier > 3 || execution["roomService"]?.Type != JTokenType.Null || (string)execution["actorSelection"] != "MAINTENANCE_PERMANENT_STAFF") throw new FormatException("Unsupported construction execution setup.");
            var stock = ((JObject)source["startingSupply"]).Properties().ToDictionary(p => p.Name, p => (double)p.Value);
            if (!stock.Keys.OrderBy(k => k).SequenceEqual(new[] { "S1", "S2", "S3" }) || stock.Values.Any(v => !double.IsFinite(v) || v < 0)) throw new FormatException("Invalid construction starting Supply.");
            var security = execution["security"]; var terrain = source["terrain"];
            if (security == null || terrain == null || (int)security["durationTicks"] <= 0 || (double)terrain["supplyPerCell"] < 0) throw new FormatException("Missing construction bubbles or terrain policy.");
            var clearing = terrain["clearingRecipe"];
            if (clearing != null && (string.IsNullOrWhiteSpace((string)clearing["id"]) || clearing["bubbles"] is not JArray bubbles || bubbles.Count != 8 || bubbles.Any(b => (int?)b["durationTicks"] != 1 && (int?)b["durationTicks"] != 20 || (string)b["actor"] != "UNTRAINED" || b["toolService"]?.Type != JTokenType.Null || b["roomService"]?.Type != JTokenType.Null) || bubbles.Select(b => (string)b["id"]).Distinct().Count() != 8)) throw new FormatException("Clearing requires eight authored untrained-Actor bubbles.");
            return new ConstructionSetup(profession, tier, tool, storage, stock, (string)execution["requiredRoomDefinitionId"], (string)security["profession"], (int)security["minimumTier"], (int)security["durationTicks"], (int)terrain["clearCol"], (int)terrain["clearRow"], (int)terrain["clearWidth"], (int)terrain["clearHeight"], (string)terrain["supplyClass"], (double)terrain["supplyPerCell"], source["startupStaff"].Select(a => new StaffAssignment((string)a["unitId"], (string)a["roomId"])), (string)clearing?["id"], clearing?["bubbles"]?.Select(b => (int)b["durationTicks"]));
        }
    }
}
