using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    // This bounded DTO reads an explicitly generated projection, not arbitrary mission data.
    public sealed class BootstrapSnapshot
    {
        public string format, baseName;
        public List<Source> sources;
        public List<Definition> roomDefinitions;
        public List<Room> rooms;
        public List<Unit> units;
        public List<SaveCompatibility> saveCompatibility;
        public JObject receiving;
        public JObject mission;
        public JObject missionMap;
        public JObject missionCombat;
        public JObject missionCare;
        public JObject missionRescue;
        public JObject previousBaseSnapshot;
        public JObject previousProgressionSnapshot;
        public int? previousBaseMaxVersion;
        public JObject roomStorage;
        public JObject missionCargo;
        public JObject cargoHandling;
        public JObject cargoProcessing;
        public JObject unitEquipment;
        public JObject roomPlanning;
        public JObject roomConstruction;
        public JObject previousCapacitySnapshot;
        public JObject previousExpansionSnapshot;
        public List<NameMigration> nameMigrations;
        public sealed class NameMigration { public string unitId, fromName, toName; }
        public sealed class SaveCompatibility { public string fromFingerprint, toFingerprint; public int maxSaveVersion; }
        public sealed class Source { public string path, sha256; }
        public sealed class Definition { public string id, name, color; public int width, height; public Dictionary<int, int> staffingByTier; [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)] public int teamSlots; [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)] public string teamExperienceSharing; }
        public sealed class Room { public string id, definitionId; public int col, row, width, height, constructionTier; }
        public sealed class Unit
        {
            public string id, name, profession, branch, color;
            public int tier, perception, stamina, endurance;
        }
    }

    public static class BootstrapReader
    {
        private static void Require(bool valid, string reason)
        { if (!valid) throw new FormatException("Bootstrap data: " + reason); }
        public static BootstrapSnapshot Parse(string json)
        {
            var snapshot = JsonConvert.DeserializeObject<BootstrapSnapshot>(json,
                new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error });
            Require(snapshot != null && snapshot.format == "orionis-bootstrap-1", "unsupported format.");
            Require(!string.IsNullOrWhiteSpace(snapshot.baseName), "missing base name.");
            Require(snapshot.sources != null && snapshot.sources.Count > 0, "missing provenance.");
            foreach (var source in snapshot.sources)
                Require(source != null && !string.IsNullOrWhiteSpace(source.path) &&
                    source.sha256 != null && source.sha256.Length == 64, "invalid provenance.");
            Require(snapshot.roomDefinitions != null && snapshot.rooms != null && snapshot.units != null,
                "required collection missing.");
            return snapshot;
        }
        public static BootstrapData Read(string json)
        {
            var source = Parse(json);
            var definitions = new Dictionary<string, RoomDefinition>();
            foreach (var d in source.roomDefinitions)
            {
                Require(d != null && !string.IsNullOrWhiteSpace(d.id) && !string.IsNullOrWhiteSpace(d.name), "invalid room definition.");
                Require(d.width > 0 && d.height > 0 && !definitions.ContainsKey(d.id), "duplicate/invalid room definition: " + d.id);
                Require(d.staffingByTier != null && d.staffingByTier.Count > 0 && d.staffingByTier.All(p => p.Key >= 1 && p.Key <= 3 && p.Value >= 0), "missing/invalid authored staffing capacity.");
                Require(d.teamSlots == 0 || d.teamSlots == 4 && d.width == 1 && d.height == 1 && d.staffingByTier.All(p => p.Value == p.Key + 3) && d.staffingByTier.TryGetValue(1, out var slots) && slots == 4, "invalid Ready Room capacity/footprint.");
                definitions.Add(d.id, new RoomDefinition(d.id, d.name, d.color, d.width, d.height, d.staffingByTier, d.teamSlots, d.teamExperienceSharing));
            }
            var ids = new HashSet<string>();
            var cells = new HashSet<string>();
            var rooms = new List<RoomInstance>();
            foreach (var r in source.rooms)
            {
                Require(r != null && !string.IsNullOrWhiteSpace(r.id) && ids.Add(r.id), "duplicate/missing room instance.");
                Require(r.definitionId != null && definitions.ContainsKey(r.definitionId), "unknown room definition.");
                var d = definitions[r.definitionId];
                Require(d.StaffingByTier.ContainsKey(r.constructionTier), "unsupported authored construction tier: " + r.id);
                Require(r.width == d.Width && r.height == d.Height && r.col >= 0 && r.row >= 0 &&
                    r.col + r.width <= 12 && r.row + r.height <= 10 && r.constructionTier >= 1 && r.constructionTier <= 3,
                    "invalid room footprint/tier: " + r.id);
                for (int x = r.col; x < r.col + r.width; x++)
                    for (int y = r.row; y < r.row + r.height; y++)
                        Require(cells.Add(x + "," + y), "overlapping room instances.");
                rooms.Add(new RoomInstance(r.id, d, r.col, r.row, r.constructionTier));
            }
            ids.Clear();
            var professions = new HashSet<string> { "SOLDIER", "SCOUT", "TECHNICIAN", "SCIENTIST", "MEDIC", "DIPLOMAT" };
            var units = new List<UnitSummary>();
            foreach (var u in source.units)
            {
                Require(u != null && !string.IsNullOrWhiteSpace(u.id) && ids.Add(u.id) &&
                    !string.IsNullOrWhiteSpace(u.name) && professions.Contains(u.profession ?? ""), "duplicate/invalid Unit.");
                Require(u.tier >= 1 && u.tier <= 3 && u.perception >= 0 && u.perception <= 10 &&
                    u.stamina >= 0 && u.stamina <= 100 && u.endurance >= 1 && u.endurance <= 10,
                    "invalid Unit stats: " + u.id);
                units.Add(new UnitSummary(u.id, u.name, u.profession, u.tier, u.branch,
                    u.color, u.perception, u.stamina, u.endurance));
            }
            var data = new BootstrapData(source.baseName, rooms, units);
            var mission = MissionReader.Read(source.mission, data);
            var combat = CombatReader.Read(source.missionCombat, mission);
            var care = CareReader.Read(source.missionCare, mission, combat);
            var cargo = CargoReader.Read(source.missionCargo, mission);
            return new BootstrapData(source.baseName, rooms, units, ReceivingReader.Read(source.receiving, data), mission, MissionMapReader.Read(source.missionMap, mission), combat, care, RescueReader.Read(source.missionRescue, mission, care, combat), RoomStorageReader.Read(source.roomStorage, data), cargo, HandlingReader.Read(source.cargoHandling, cargo, data), CargoProcessingReader.Read(source.cargoProcessing, source.missionCargo, data), UnitEquipmentReader.Read(source.unitEquipment, cargo), RoomPlanningReader.Read(source.roomPlanning, definitions), ConstructionSetupReader.Read(source.roomConstruction));
        }
    }
}
