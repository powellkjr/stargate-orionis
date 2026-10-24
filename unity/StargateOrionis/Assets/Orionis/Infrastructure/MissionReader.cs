using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class MissionReader
    {
        private sealed class Record
        {
            [JsonRequired] public string id, title, briefing, gateStageId;
            [JsonRequired] public int maxPartySize, redialTicks;
            [JsonRequired] public List<Person> personnel;
            public JObject travel;
            public string previousTravelFingerprint;
            public List<string> previousTravelNpcIds;
            public JObject previousTravelDefinition;
        }
        private sealed class Person
        {
            [JsonRequired] public string id, profession;
            [JsonRequired] public int tier;
            [JsonProperty(Required = Required.AllowNull)] public Branch branch;
            [JsonRequired] public List<Tool> tools;
        }
        private sealed class Branch { [JsonRequired] public string kind, id; [JsonRequired] public int tier; }
        private sealed class Tool
        {
            [JsonRequired] public string instanceId, kitId, label;
            [JsonRequired] public int slot, tier, charges;
            [JsonRequired] public bool damaged;
            [JsonRequired] public List<string> services;
        }
        private static void Require(bool condition, string message)
        { if (!condition) throw new FormatException("Mission data: " + message); }
        public static MissionDefinition Read(JObject source, BootstrapData data)
        {
            if (source == null) return null;
            foreach (var p in source.Descendants().OfType<JProperty>())
                if (new[] { "maxPartySize", "redialTicks", "slot", "tier", "charges" }.Contains(p.Name))
                    Require(p.Value.Type == JTokenType.Integer, "integer required: " + p.Name);
            var value = source.ToObject<Record>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            Require(new[] { value.id, value.title, value.briefing, value.gateStageId }.All(s => !string.IsNullOrWhiteSpace(s)) &&
                value.maxPartySize >= 1 && value.maxPartySize <= 4 && value.redialTicks == 1, "unsupported mission/arrival timing.");
            Require(value.personnel != null && value.personnel.All(p => p != null) &&
                value.personnel.Select(p => p.id).OrderBy(id => id).SequenceEqual(data.Units.Select(u => u.Id).OrderBy(id => id)), "personnel identities do not match.");
            var loadouts = new List<DeploymentLoadout>(); var identities = new HashSet<string>();
            foreach (var person in value.personnel)
            {
                var unit = data.Units.Single(u => u.Id == person.id);
                Require(person.profession == unit.Profession && person.tier == unit.Tier, "progression mismatch.");
                Require(person.branch == null || person.tier == 3 && person.branch.tier >= 0 && person.branch.tier <= 3 &&
                    new[] { "cross", "specialization" }.Contains(person.branch.kind) && !string.IsNullOrWhiteSpace(person.branch.id), "invalid branch.");
                Require(person.tools != null && person.tools.Count <= 2 && person.tools.All(t => t != null) &&
                    person.tools.Select(t => t.slot).Distinct().Count() == person.tools.Count, "invalid Tool slots.");
                var tools = new List<ExpeditionTool>();
                foreach (var tool in person.tools)
                {
                    Require(!string.IsNullOrWhiteSpace(tool.instanceId) && identities.Add(tool.instanceId) && !string.IsNullOrWhiteSpace(tool.kitId) &&
                        !string.IsNullOrWhiteSpace(tool.label) && tool.slot >= 0 && tool.slot <= 1 && tool.tier >= 1 && tool.tier <= 3 &&
                        (tool.slot == 0 || person.tier == 3 && person.branch != null) && tool.charges >= 0 && tool.charges <= 99 &&
                        tool.services != null && tool.services.All(s => !string.IsNullOrWhiteSpace(s)) &&
                        tool.services.Distinct().Count() == tool.services.Count, "invalid equipped Tool configuration: " + tool.instanceId);
                    tools.Add(new ExpeditionTool(tool.instanceId, tool.kitId, tool.slot, tool.charges, tool.damaged, tool.label, tool.tier, tool.services));
                }
                loadouts.Add(new DeploymentLoadout(person.id, person.profession, person.tier, person.branch?.kind, person.branch?.id, person.branch?.tier ?? 0, tools));
            }
            return new MissionDefinition(value.id, value.title, value.briefing, value.gateStageId, value.maxPartySize, value.redialTicks, loadouts, TravelReader.Read(value.travel, value.gateStageId));
        }
    }
}
