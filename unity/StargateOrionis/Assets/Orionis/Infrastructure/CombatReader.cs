using System;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    internal static class CombatReader
    {
        public static CombatDefinition Read(JObject source, MissionDefinition mission)
        {
            if (source == null || mission?.Travel == null) return null;
            foreach (var p in source.Descendants().OfType<JProperty>())
                if (new[] { "partyHealth", "partyDamage", "hostileHealth", "hostileDamage" }.Contains(p.Name) && p.Value.Type != JTokenType.Integer) throw new FormatException("Combat stats require integers.");
            var d = source.ToObject<CombatDefinition>(JsonSerializer.Create(new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error }));
            if (d.PartyHealth < 1 || d.PartyHealth > 10000 || d.PartyDamage < 1 || d.PartyDamage > 10000 ||
                d.Encounters.Any(i => i == null || string.IsNullOrWhiteSpace(i.Id) || !mission.Travel.Stages.Any(s => s.Id == i.StageId) ||
                    i.HostileHealth < 1 || i.HostileHealth > 10000 || i.HostileDamage < 0 || i.HostileDamage > 10000 || i.Participants.Count == 0 ||
                    i.Participants.Any(p => p == null || string.IsNullOrWhiteSpace(p.Id) || string.IsNullOrWhiteSpace(p.Label))) ||
                d.Encounters.Select(i => i.Id).Distinct().Count() != d.Encounters.Count ||
                d.Encounters.SelectMany(i => i.Participants).Select(p => p.Id).Distinct().Count() != d.Encounters.Sum(i => i.Participants.Count)) throw new FormatException("Invalid authored combat configuration.");
            return d;
        }
    }
}
