using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Application;
using Orionis.Domain;

namespace Orionis.Infrastructure
{
    public sealed class CampaignSaveCodec
    {
        private sealed class Record
        {
            [JsonRequired] public string format;
            [JsonRequired] public int schemaVersion;
            [JsonRequired] public string fixtureFingerprint;
            [JsonRequired] public string baseName;
            [JsonRequired] public List<RoomRecord> rooms;
            [JsonRequired] public List<UnitRecord> units;
            [JsonRequired] public string randomAlgorithm;
            [JsonRequired] public uint randomSeed;
            [JsonRequired] public uint randomState;
            public long? elapsedTicks;
            public List<AssignmentRecord> assignments;
            public string receivingFingerprint;
            public List<ReceivingRecord> receiving;
            public List<TransferRecord> transfers;
            public string missionFingerprint;
            public string combatFingerprint;
            public string careFingerprint;
            public string rescueFingerprint;
            public ExpeditionRecord expedition;
            public List<TeamRecord> teams;
            public string cargoFingerprint;
            public string handlingFingerprint;
            public string processingFingerprint;
            public string equipmentFingerprint;
            public List<CargoRecord> cargo;
            public List<PersonnelConditionRecord> personnel;
            public string constructionFingerprint;
            public Dictionary<string, double> supplyStock;
            public List<ConstructionRecord> constructionSites;
            public List<string> excavatedCells;
            public List<ClearingRecord> clearings;
            public List<GroupRecord> roomGroups;
            [JsonProperty(Required = Required.AllowNull)] public SelectionRecord selection;
        }
        private sealed class ClearingRecord
        {
            [JsonRequired] public string recipeId;
            [JsonRequired] public int col, row;
            [JsonRequired] public long startedTick;
            [JsonRequired] public List<ClearingBubbleRecord> bubbles;
            [JsonProperty(Required = Required.AllowNull)] public long? completedTick;
        }
        private sealed class ClearingBubbleRecord
        {
            [JsonProperty(Required = Required.AllowNull)] public string actorId;
            [JsonRequired] public int ticks;
            [JsonProperty(Required = Required.AllowNull)] public long? completedTick;
        }
        private sealed class GroupRecord
        {
            [JsonRequired] public string id, primaryChild, secondaryChild;
            [JsonRequired] public List<string> children;
            [JsonRequired] public bool active;
        }
        private sealed class ConstructionRecord
        {
            [JsonRequired] public string roomId, definitionId, actorId, supplyClass, maintenanceRoomId, securityActorId;
            public int? fromTier;
            [JsonRequired] public int tier, col, row;
            [JsonRequired] public long startedTick, durationTicks, workedTicks;
            [JsonRequired] public double supplyCost;
            [JsonRequired] public bool paused;
            [JsonProperty(Required = Required.AllowNull)] public long? completedTick;
        }
        private sealed class CargoRecord
        {
            [JsonRequired] public string id, sourceContainerId, sourceMissionId, payload;
            public bool? retained;
            public HandlingRecord handling;
            public HandlingRecord examination;
            public string equippedUnitId;
            public string storageLocationId, custodyRoomId;
            [JsonRequired] public long recoveredTick;
            [JsonProperty(Required = Required.AllowNull)] public string roomId;
        }
        private sealed class PersonnelConditionRecord
        {
            [JsonRequired] public string unitId;
            [JsonRequired] public int health, stamina, endurance;
            [JsonRequired] public List<ToolRecord> tools;
        }
        private sealed class HandlingRecord
        {
            public bool legacyStorageFinding;
            [JsonRequired] public string roomId, primaryRoomId;
            [JsonProperty(Required = Required.AllowNull)] public string actorId;
            [JsonRequired] public long startedTick;
            [JsonRequired] public int ticks;
            [JsonRequired] public bool paused;
            [JsonProperty(Required = Required.AllowNull)] public long? completedTick;
        }
        private sealed class TeamRecord
        {
            [JsonRequired] public string id, designation, roomId;
            [JsonRequired] public List<string> members;
        }
        private sealed class ExpeditionRecord
        {
            [JsonRequired] public string missionId, stageId;
            [JsonRequired] public long startedTick, connectionOpenedTick;
            [JsonRequired] public bool gateChoicePending, gateOpen;
            [JsonRequired] public List<MemberRecord> party;
            public JObject travel;
            public List<Battle> combat;
            public long? extractedTick;
            public string teamId;
        }
        private sealed class Battle
        {
            [JsonRequired] public string incidentId, outcome;
            [JsonRequired] public long startedTick;
            [JsonProperty(Required = Required.AllowNull)] public long? endedTick;
            [JsonRequired] public int rounds;
        }
        private sealed class MemberRecord
        {
            [JsonRequired] public string unitId;
            [JsonRequired] public int perception, stamina, endurance;
            [JsonRequired] public List<ToolRecord> tools;
            public List<EquipmentRecord> equipment;
            public int? startingHealth;
        }
        private sealed class EquipmentRecord
        {
            [JsonRequired] public string instanceId, slotId, name;
            [JsonRequired] public int damage, protection;
        }
        private sealed class ToolRecord
        {
            [JsonRequired] public string instanceId, kitId;
            [JsonRequired] public int slot, charges;
            [JsonRequired] public bool damaged;
        }
        private sealed class TransferRecord
        {
            [JsonRequired] public string unitId;
            [JsonRequired] public string sourceRoomId;
            [JsonRequired] public string destinationRoomId;
            [JsonRequired] public string timing;
            [JsonRequired] public long requestedTick;
            [JsonProperty(Required = Required.AllowNull)] public string workInstanceId;
            [JsonProperty(Required = Required.AllowNull)] public string workStepId;
        }
        private sealed class ReceivingRecord
        {
            [JsonRequired] public string instanceId;
            [JsonRequired] public string roomId;
            [JsonRequired] public bool paused;
            [JsonRequired] public List<ProgressRecord> progress;
        }
        private sealed class ProgressRecord
        {
            [JsonRequired] public string stepId;
            [JsonProperty(Required = Required.AllowNull)] public string actorId;
            [JsonRequired] public int ticks;
        }
        private sealed class AssignmentRecord
        {
            [JsonRequired] public string unitId;
            [JsonRequired] public string roomInstanceId;
        }
        private sealed class RoomRecord
        {
            [JsonRequired] public string id;
            [JsonRequired] public string definitionId;
            [JsonRequired] public int col;
            [JsonRequired] public int row;
            [JsonRequired] public int width;
            [JsonRequired] public int height;
            [JsonRequired] public int constructionTier;
        }
        private sealed class UnitRecord
        {
            [JsonRequired] public string id;
            [JsonRequired] public string name;
            [JsonRequired] public string profession;
            [JsonRequired] public int tier;
            [JsonProperty(Required = Required.AllowNull)] public string branch;
            [JsonRequired] public int perception;
            [JsonRequired] public int stamina;
            [JsonRequired] public int endurance;
        }
        private sealed class SelectionRecord
        {
            [JsonRequired] public string kind;
            [JsonRequired] public string id;
        }
        private readonly BootstrapSnapshot fixture;
        private readonly string fingerprint;
        private readonly string receivingFingerprint;
        private readonly string missionFingerprint;
        private readonly string combatFingerprint;
        private readonly string careFingerprint;
        private readonly string rescueFingerprint;
        private readonly string cargoFingerprint;
        private readonly string previousCargoNamingFingerprint;
        private readonly string handlingFingerprint;
        private readonly string processingFingerprint;
        private readonly string equipmentFingerprint;
        private readonly CampaignSaveCodec previousProgression;
        private readonly CampaignSaveCodec previousCapacity;
        private readonly CampaignSaveCodec previousExpansion;
        private readonly string legacyMissionFingerprint;
        private static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            MissingMemberHandling = MissingMemberHandling.Error,
            TypeNameHandling = TypeNameHandling.None,
            MetadataPropertyHandling = MetadataPropertyHandling.Ignore,
            MaxDepth = 32
        };
        public CampaignSaveCodec(string bootstrapJson)
        {
            BootstrapReader.Read(bootstrapJson);
            fixture = BootstrapReader.Parse(bootstrapJson);
            previousExpansion = fixture.previousExpansionSnapshot == null ? null : new CampaignSaveCodec(fixture.previousExpansionSnapshot.ToString());
            previousCapacity = fixture.previousCapacitySnapshot == null ? null : new CampaignSaveCodec(fixture.previousCapacitySnapshot.ToString());
            var content = JsonConvert.SerializeObject(new { fixture.baseName, fixture.roomDefinitions, fixture.rooms, fixture.units });
            using var hash = SHA256.Create();
            fingerprint = BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(content))).Replace("-", "").ToLowerInvariant();
            receivingFingerprint = BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.receiving?.ToString(Formatting.None) ?? "null"))).Replace("-", "").ToLowerInvariant();
            missionFingerprint = BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.mission?.ToString(Formatting.None) ?? "null"))).Replace("-", "").ToLowerInvariant();
            combatFingerprint = fixture.missionCombat == null ? null : BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.missionCombat.ToString(Formatting.None)))).Replace("-", "").ToLowerInvariant();
            careFingerprint = fixture.missionCare == null ? null : BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.missionCare.ToString(Formatting.None)))).Replace("-", "").ToLowerInvariant();
            rescueFingerprint = fixture.missionRescue == null ? null : BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.missionRescue.ToString(Formatting.None)))).Replace("-", "").ToLowerInvariant();
            cargoFingerprint = fixture.missionCargo == null ? null : BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.missionCargo.ToString(Formatting.None)))).Replace("-", "").ToLowerInvariant();
            // Older crate definitions had no authored nameResolution. This compatibility
            // variant changes presentation only; physical payload/provenance still validate.
            var beforeNaming = fixture.missionCargo?.DeepClone() as JObject;
            foreach (var pair in beforeNaming?["items"] ?? new JArray())
                if (pair["item"]?["nameResolution"]?["previousName"] != null)
                {
                    pair["item"]["name"] = (string)pair["item"]["nameResolution"]["previousName"];
                    ((JObject)pair["item"]).Property("nameResolution").Remove();
                }
            previousCargoNamingFingerprint = beforeNaming == null ? null : BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(beforeNaming.ToString(Formatting.None)))).Replace("-", "").ToLowerInvariant();
            handlingFingerprint = fixture.cargoHandling == null ? null : BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.cargoHandling.ToString(Formatting.None)))).Replace("-", "").ToLowerInvariant();
            processingFingerprint = fixture.cargoProcessing == null ? null : BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.cargoProcessing.ToString(Formatting.None)))).Replace("-", "").ToLowerInvariant();
            equipmentFingerprint = fixture.unitEquipment == null ? null : BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(fixture.unitEquipment.ToString(Formatting.None)))).Replace("-", "").ToLowerInvariant();
            previousProgression = fixture.previousProgressionSnapshot == null ? null : new CampaignSaveCodec(fixture.previousProgressionSnapshot.ToString());
            var legacyMission = fixture.mission?.DeepClone() as JObject;
            legacyMission?.Property("travel")?.Remove();
            legacyMission?.Property("previousTravelFingerprint")?.Remove(); legacyMission?.Property("previousTravelNpcIds")?.Remove();
            legacyMission?.Property("previousTravelDefinition")?.Remove();
            legacyMissionFingerprint = BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(legacyMission?.ToString(Formatting.None) ?? "null"))).Replace("-", "").ToLowerInvariant();
        }
        public string Serialize(SavedSession session)
        {
            var data = session.Campaign.Base;
            // Current content/save shape retains a recognized historical roster through
            // PersonnelScope during validation; do not serialize new construction under an old scope.
            var record = new Record
            {
                format = "orionis-prototype-save", schemaVersion = session.Campaign.Base.Construction == null ? 20 : 23, fixtureFingerprint = fingerprint,
                constructionFingerprint = fixture.roomConstruction == null ? null : ConstructionFingerprint(),
                supplyStock = session.Campaign.Construction?.Supply.ToDictionary(p => p.Key, p => p.Value),
                roomGroups = session.Campaign.Construction?.Groups.Select(g => new GroupRecord { id = g.Id, primaryChild = g.Primary, secondaryChild = g.Secondary, children = new List<string> { g.Primary, g.Secondary }, active = g.Active }).ToList(),
                excavatedCells = session.Campaign.Construction?.Excavated.ToList(),
                clearings = session.Campaign.Construction?.Clearings.Select(o => new ClearingRecord { recipeId=o.RecipeId, col=o.Col, row=o.Row, startedTick=o.StartedTick, completedTick=o.CompletedTick, bubbles=o.Bubbles.Select(b=>new ClearingBubbleRecord { actorId=b.ActorId,ticks=b.Ticks,completedTick=b.CompletedTick }).ToList() }).ToList(),
                constructionSites = session.Campaign.Construction?.Sites.Select(site => new ConstructionRecord { roomId = site.RoomId, definitionId = site.DefinitionId, tier = site.Tier, fromTier = site.FromTier, col = site.Col, row = site.Row, actorId = site.ActorId, maintenanceRoomId = site.MaintenanceRoomId, securityActorId = site.SecurityActorId, startedTick = site.StartedTick, durationTicks = site.DurationTicks, workedTicks = site.WorkedTicks, supplyCost = site.SupplyCost, supplyClass = site.SupplyClass, paused = site.Paused, completedTick = site.CompletedTick }).ToList(),
                personnel = session.Campaign.Personnel.Select(p => new PersonnelConditionRecord { unitId = p.UnitId, health = p.Health, stamina = p.Stamina, endurance = p.Endurance,
                    tools = p.Tools.Select(t => new ToolRecord { instanceId = t.InstanceId, kitId = t.KitId, slot = t.Slot, charges = t.Charges, damaged = t.Damaged }).ToList() }).ToList(),
                cargoFingerprint = cargoFingerprint, handlingFingerprint = handlingFingerprint, processingFingerprint = processingFingerprint, equipmentFingerprint = equipmentFingerprint,
                cargo = session.Campaign.Cargo.Select(i => new CargoRecord { id = i.Id, sourceContainerId = i.SourceContainerId, sourceMissionId = i.SourceMissionId, recoveredTick = i.RecoveredTick, payload = i.Payload, roomId = i.RoomId, storageLocationId = i.StorageLocationId, custodyRoomId = i.CustodyRoomId, retained = i.Retained, equippedUnitId = i.EquippedUnitId, examination = i.Examination == null ? null : new HandlingRecord { legacyStorageFinding = i.Examination.LegacyStorageFinding, roomId = i.Examination.RoomId, primaryRoomId = i.Examination.PrimaryRoomId, actorId = i.Examination.ActorId, startedTick = i.Examination.StartedTick, ticks = i.Examination.Ticks, paused = i.Examination.Paused, completedTick = i.Examination.CompletedTick }, handling = i.Handling == null ? null : new HandlingRecord { roomId = i.Handling.RoomId, primaryRoomId = i.Handling.PrimaryRoomId, actorId = i.Handling.ActorId, startedTick = i.Handling.StartedTick, ticks = i.Handling.Ticks, paused = i.Handling.Paused, completedTick = i.Handling.CompletedTick } }).ToList(),
                teams = session.Campaign.Teams.Select(t => new TeamRecord { id = t.Id, designation = t.Designation, roomId = t.RoomId, members = t.Members.ToList() }).ToList(),
                baseName = data.BaseName, randomAlgorithm = RandomState.Algorithm,
                randomSeed = session.Campaign.Random.Seed, randomState = session.Campaign.Random.Value,
                elapsedTicks = session.Campaign.Clock.ElapsedTicks,
                assignments = session.Campaign.Assignments.Select(a => new AssignmentRecord { unitId = a.UnitId, roomInstanceId = a.RoomInstanceId }).ToList(),
                receivingFingerprint = receivingFingerprint,
                receiving = session.Campaign.Receiving.Select(o => new ReceivingRecord { instanceId = o.InstanceId, roomId = o.RoomId,
                    paused = o.Paused, progress = o.Progress.Select(p => new ProgressRecord { stepId = p.StepId, actorId = p.ActorId, ticks = p.Ticks }).ToList() }).ToList(),
                transfers = session.Campaign.Transfers.Select(t => new TransferRecord { unitId = t.UnitId, sourceRoomId = t.SourceRoomId,
                    destinationRoomId = t.DestinationRoomId, timing = t.Timing.ToString(), requestedTick = t.RequestedTick,
                    workInstanceId = t.WorkInstanceId, workStepId = t.WorkStepId }).ToList(),
                missionFingerprint = missionFingerprint,
                combatFingerprint = combatFingerprint, careFingerprint = careFingerprint, rescueFingerprint = rescueFingerprint,
                expedition = session.Campaign.Expedition == null ? null : new ExpeditionRecord
                {
                    teamId = session.Campaign.Expedition.TeamId, extractedTick = session.Campaign.Expedition.ExtractedTick, missionId = session.Campaign.Expedition.MissionId, stageId = session.Campaign.Expedition.StageId,
                    startedTick = session.Campaign.Expedition.StartedTick, connectionOpenedTick = session.Campaign.Expedition.ConnectionOpenedTick,
                    gateChoicePending = session.Campaign.Expedition.GateChoicePending, gateOpen = session.Campaign.Expedition.GateOpen,
                    travel = TravelSave.Write(MissionTravel.Current(session.Campaign)),
                    combat = data.Combat == null ? null : (session.Campaign.Expedition.Combat?.Battles ?? Array.Empty<BattleRecord>()).Select(b => new Battle
                    { incidentId = b.IncidentId, outcome = b.Outcome, startedTick = b.StartedTick, endedTick = b.EndedTick, rounds = b.Rounds }).ToList(),
                    party = session.Campaign.Expedition.Party.Select(p => new MemberRecord { unitId = p.UnitId, startingHealth = p.StartingHealth ?? PersonnelCondition.MaximumHealth(session.Campaign), perception = p.Perception, stamina = p.Stamina,
                        endurance = p.Endurance, equipment = p.Equipment.Select(g => new EquipmentRecord { instanceId = g.InstanceId, slotId = g.Slot, name = g.Name, damage = g.Damage, protection = g.Protection }).ToList(), tools = p.Tools.Select(t => new ToolRecord { instanceId = t.InstanceId, kitId = t.KitId, slot = t.Slot, charges = t.Charges, damaged = t.Damaged }).ToList() }).ToList()
                },
                rooms = data.Rooms.Select(r => new RoomRecord { id = r.Id, definitionId = r.Definition.Id,
                    col = r.Col, row = r.Row, width = r.Definition.Width, height = r.Definition.Height,
                    constructionTier = r.ConstructionTier }).ToList(),
                units = data.Units.Select(u => new UnitRecord { id = u.Id, name = u.Name, profession = u.Profession,
                    tier = u.Tier, branch = u.Branch, perception = u.Perception, stamina = u.Stamina, endurance = u.Endurance }).ToList(),
                selection = session.Selection == null ? null : new SelectionRecord
                { kind = session.Selection.Kind.ToString(), id = session.Selection.Id }
            };
            var json = JsonConvert.SerializeObject(record, Formatting.Indented, Settings);
            Deserialize(json); // Validate the complete candidate before any filesystem write.
            return json;
        }
        private string ConstructionFingerprint(bool legacyClearing = false)
        {
            var policy=fixture.roomConstruction?.DeepClone();
            if(legacyClearing && policy?["terrain"] is JObject terrain)terrain.Remove("clearingRecipe");
            using var hash = SHA256.Create();
            return BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(policy?.ToString(Formatting.None) ?? "null"))).Replace("-", "").ToLowerInvariant();
        }
        private BootstrapSnapshot PersonnelScope(IReadOnlyList<BootstrapSnapshot.Unit> units)
        {
            var pending = new Stack<BootstrapSnapshot>(); pending.Push(fixture);
            while (pending.Count > 0)
            {
                var candidate = pending.Pop();
                if (candidate.units.Count == units.Count && candidate.units.All(u => units.Any(p => p.id == u.id && p.tier == u.tier && p.profession == u.profession && (p.branch ?? "") == (u.branch ?? "")))) return candidate;
                if (candidate.previousExpansionSnapshot != null) pending.Push(BootstrapReader.Parse(candidate.previousExpansionSnapshot.ToString()));
                if (candidate.previousCapacitySnapshot != null) pending.Push(BootstrapReader.Parse(candidate.previousCapacitySnapshot.ToString()));
                if (candidate.previousProgressionSnapshot != null) pending.Push(BootstrapReader.Parse(candidate.previousProgressionSnapshot.ToString()));
            }
            throw new FormatException("No authored personnel progression scope matches this save.");
        }
        public SavedSession Deserialize(string json)
        {
            var token = JToken.Parse(json, new JsonLoadSettings { DuplicatePropertyNameHandling = DuplicatePropertyNameHandling.Error });
            if (!(token is JObject root)) throw new FormatException("Save must be a JSON object.");
            // JSON floats must not be rounded into otherwise valid integer state.
            foreach (var value in root.DescendantsAndSelf().OfType<JProperty>())
                if (new[] { "durationTicks", "workedTicks", "schemaVersion", "randomSeed", "randomState", "elapsedTicks", "col", "row", "width", "height",
                    "constructionTier", "tier", "perception", "stamina", "endurance", "health", "startingHealth", "ticks", "requestedTick", "recoveredTick", "startedTick", "connectionOpenedTick", "slot", "charges", "count", "suspicion", "hostility", "rounds", "damage", "protection" }.Contains(value.Name)
                    && value.Value.Type != JTokenType.Integer) throw new FormatException("Save requires an integer: " + value.Name);
            if (root.Descendants().OfType<JProperty>().Any(p => (p.Name == "endedTick" || p.Name == "extractedTick" || p.Name == "completedTick") && p.Value.Type != JTokenType.Null && p.Value.Type != JTokenType.Integer)) throw new FormatException("Combat end tick requires an integer or null.");
            foreach (var value in root.DescendantsAndSelf().OfType<JProperty>())
                if (new[] { "gateChoicePending", "gateOpen", "damaged", "paused", "active" }.Contains(value.Name) && value.Value.Type != JTokenType.Boolean)
                    throw new FormatException("Save requires a boolean: " + value.Name);
            if (root.Descendants().OfType<JProperty>().Any(p => p.Name == "fromTier" && p.Value.Type != JTokenType.Null && p.Value.Type != JTokenType.Integer)) throw new FormatException("Upgrade tier requires an integer or null.");
            var record = token.ToObject<Record>(JsonSerializer.Create(Settings));
            if (record.rooms.Any(r => r == null) || record.units.Any(u => u == null))
                throw new FormatException("Save contains a null room or Unit.");
            if (record.format != "orionis-prototype-save" || record.schemaVersion < 1 || record.schemaVersion > 23)
                throw new FormatException("Unsupported save format/version. This prototype reads versions 1 through 23.");
            if(record.schemaVersion>=23 ? record.clearings==null || record.clearings.Any(o=>o==null||o.bubbles==null||o.bubbles.Any(b=>b==null)) : record.clearings?.Count>0)throw new FormatException("Invalid clearing Recipe records for save version.");
            if (record.schemaVersion >= 22 ? record.roomGroups == null || record.roomGroups.Any(g => g == null || g.children == null || !g.children.SequenceEqual(new[] { g.primaryChild, g.secondaryChild })) || ((JArray)root["constructionSites"]).Any(site => ((JObject)site).Property("fromTier") == null) : record.roomGroups?.Count > 0 || record.constructionSites?.Any(site => site?.fromTier != null) == true)
                throw new FormatException("Invalid Room Group or upgrade records for the save version.");
            if (record.schemaVersion >= 21 ? record.excavatedCells == null || record.excavatedCells.Any(c => c == null) || record.supplyStock == null || record.constructionSites == null || record.constructionSites.Any(site => site == null) || fixture.roomConstruction == null || record.constructionFingerprint != ConstructionFingerprint() && (record.schemaVersion >= 23 || record.constructionFingerprint != ConstructionFingerprint(true)) : record.constructionSites?.Count > 0)
                throw new FormatException("Invalid or unsupported construction save state.");
            if (record.schemaVersion >= 20 ? record.personnel == null || record.personnel.Any(p => p == null || p.tools == null || p.tools.Any(t => t == null)) ||
                record.expedition?.party.Any(p => p.startingHealth == null) == true : record.personnel?.Count > 0)
                throw new FormatException("Invalid personnel condition records for the save version.");
            if (previousExpansion != null && record.fixtureFingerprint != fingerprint)
            {
                var prior = previousExpansion.Deserialize(json);
                var source = BootstrapReader.Parse(JsonConvert.SerializeObject(fixture));
                source.rooms = prior.Campaign.Base.Rooms.Select(r => new BootstrapSnapshot.Room { id = r.Id, definitionId = r.Definition.Id, col = r.Col, row = r.Row, width = r.Definition.Width, height = r.Definition.Height, constructionTier = r.ConstructionTier }).Concat(fixture.rooms.Where(r => !prior.Campaign.Base.Rooms.Any(old => old.Id == r.id))).ToList();
                source.units = prior.Campaign.Base.Units.Select(u => new BootstrapSnapshot.Unit { id = u.Id, name = u.Name, profession = u.Profession, tier = u.Tier, branch = u.Branch, color = u.Color, perception = u.Perception, stamina = u.Stamina, endurance = u.Endurance }).ToList();
                var progression = PersonnelScope(source.units);
                source.mission["personnel"] = progression.mission["personnel"].DeepClone(); source.receiving["units"] = progression.receiving["units"].DeepClone();
                var campaign = prior.Campaign;
                var expandedData = BootstrapReader.Read(JsonConvert.SerializeObject(source));
                return new SavedSession(RoomConstruction.SeedStaff(new CampaignState(expandedData, campaign.Random, campaign.Clock, campaign.Assignments, campaign.Receiving, campaign.Transfers, campaign.Expedition, campaign.Teams, campaign.Cargo, campaign.Personnel)), prior.Selection);
            }
            if (previousCapacity != null && record.fixtureFingerprint != fingerprint)
            {
                var prior = previousCapacity.Deserialize(json);
                var source = BootstrapReader.Parse(JsonConvert.SerializeObject(fixture));
                source.rooms = prior.Campaign.Base.Rooms.Select(r => new BootstrapSnapshot.Room { id = r.Id, definitionId = r.Definition.Id, col = r.Col, row = r.Row, width = r.Definition.Width, height = r.Definition.Height, constructionTier = r.ConstructionTier }).ToList();
                source.units = prior.Campaign.Base.Units.Select(u => new BootstrapSnapshot.Unit { id = u.Id, name = u.Name, profession = u.Profession, tier = u.Tier, branch = u.Branch, color = u.Color, perception = u.Perception, stamina = u.Stamina, endurance = u.Endurance }).ToList();
                // Preserve the exact prior roster/Tool progression while replacing room capacities.
                var progression = PersonnelScope(source.units);
                source.mission["personnel"] = progression.mission["personnel"].DeepClone();
                source.receiving["units"] = progression.receiving["units"].DeepClone();
                var dataWithCapacities = BootstrapReader.Read(JsonConvert.SerializeObject(source));
                var campaign = prior.Campaign;
                return new SavedSession(new CampaignState(dataWithCapacities, campaign.Random, campaign.Clock, campaign.Assignments, campaign.Receiving, campaign.Transfers, campaign.Expedition, campaign.Teams, campaign.Cargo, campaign.Personnel, campaign.Construction), prior.Selection);
            }
            if (previousProgression != null && record.fixtureFingerprint != fingerprint)
                return previousProgression.Deserialize(json); // Exact old scope validates all state/fingerprints before publication.
            if (record.schemaVersion <= (fixture.previousBaseMaxVersion ?? 11) && fixture.previousBaseSnapshot != null && record.fixtureFingerprint != fingerprint)
            {
                // Validate the whole old save against its exact pinned scope first.
                var prior = new CampaignSaveCodec(fixture.previousBaseSnapshot.ToString()).Deserialize(json);
                var migrated = BootstrapReader.Parse(JsonConvert.SerializeObject(fixture));
                var additions = migrated.rooms.Where(r => !prior.Campaign.Base.Rooms.Any(old => old.Id == r.id)).ToList();
                migrated.baseName = prior.Campaign.Base.BaseName;
                migrated.rooms = prior.Campaign.Base.Rooms.Select(r => new BootstrapSnapshot.Room { id = r.Id, definitionId = r.Definition.Id, col = r.Col, row = r.Row,
                    width = r.Definition.Width, height = r.Definition.Height, constructionTier = r.ConstructionTier }).Concat(additions).ToList();
                migrated.units = prior.Campaign.Base.Units.Select(u => new BootstrapSnapshot.Unit { id = u.Id, name = u.Name, profession = u.Profession, tier = u.Tier,
                    branch = u.Branch, color = u.Color, perception = u.Perception, stamina = u.Stamina, endurance = u.Endurance }).ToList();
                var dataWithRoom = BootstrapReader.Read(JsonConvert.SerializeObject(migrated));
                return new SavedSession(new CampaignState(dataWithRoom, prior.Campaign.Random, prior.Campaign.Clock, prior.Campaign.Assignments,
                    prior.Campaign.Receiving, prior.Campaign.Transfers, prior.Campaign.Expedition, prior.Campaign.Teams), prior.Selection);
            }
            if (record.schemaVersion >= 18 ? record.equipmentFingerprint != equipmentFingerprint || record.cargo == null ||
                ((JArray)root["cargo"]).Any(i => ((JObject)i).Property("equippedUnitId") == null || i["equippedUnitId"].Type != JTokenType.Null && i["equippedUnitId"].Type != JTokenType.String) ||
                record.expedition?.party.Any(p => p.equipment == null) == true : record.cargo?.Any(i => i?.equippedUnitId != null) == true || record.expedition?.party.Any(p => p.equipment?.Count > 0) == true)
                throw new FormatException("Personal equipment records/definitions do not match the save schema.");
            if (record.schemaVersion >= 19 && (record.cargo == null || ((JArray)root["cargo"]).Any(i =>
                i["storageLocationId"]?.Type != JTokenType.String || (string)i["storageLocationId"] != ((string)i["roomId"] ?? "incoming-inventory") ||
                ((JObject)i).Property("custodyRoomId") == null || i["custodyRoomId"].Type != JTokenType.Null && i["custodyRoomId"].Type != JTokenType.String ||
                i["equippedUnitId"]?.Type == JTokenType.String && i["custodyRoomId"].Type != JTokenType.Null ||
                i["equippedUnitId"]?.Type == JTokenType.Null && i["roomId"]?.Type == JTokenType.String && i["custodyRoomId"].Type != JTokenType.String)))
                throw new FormatException("Invalid storage assignment or current custody record.");
            bool previousProcessing = record.schemaVersion < 19 && record.processingFingerprint == (string)fixture.cargoProcessing?["previousProcessingFingerprint"];
            if (record.schemaVersion >= 17 ? !previousProcessing && record.processingFingerprint != processingFingerprint || record.cargo == null ||
                ((JArray)root["cargo"]).Any(i => ((JObject)i).Property("examination") == null) : record.cargo?.Any(i => i?.examination != null) == true)
                throw new FormatException("Analysis examination records/definitions do not match the save schema.");
            if (record.schemaVersion >= 16 ? record.handlingFingerprint != handlingFingerprint || record.cargo == null ||
                ((JArray)root["cargo"]).Any(i => i?["retained"]?.Type != JTokenType.Boolean || ((JObject)i).Property("handling") == null) :
                record.cargo?.Any(i => i != null && (i.handling != null || i.retained == true)) == true)
                throw new FormatException("Handling/retention records do not match the save schema.");
            if (record.schemaVersion >= 15 ? record.cargoFingerprint != cargoFingerprint && record.cargoFingerprint != previousCargoNamingFingerprint || record.cargo == null || record.cargo.Any(i => i == null) : record.cargo?.Count > 0)
                throw new FormatException("Cargo state/definitions do not match the save schema.");
            if (record.schemaVersion >= 12 ? record.teams == null || record.teams.Any(t => t == null || t.members == null) ||
                record.expedition != null && ((JObject)root["expedition"]).Property("teamId") == null : record.teams != null || record.expedition?.teamId != null)
                throw new FormatException("SG team records do not match the save schema.");
            if (record.schemaVersion >= 9 ? root.Property("combatFingerprint") == null || record.combatFingerprint != combatFingerprint : record.combatFingerprint != null || record.expedition?.combat != null)
                throw new FormatException("Combat state/definitions do not match the save schema.");
            if (record.schemaVersion >= 10 ? root.Property("careFingerprint") == null || record.careFingerprint != careFingerprint : record.careFingerprint != null ||
                record.expedition?.travel?["field"]?["completed"]?.Any(w => fixture.missionCare?["recipes"]?.Any(r => (string)r["id"] == (string)w["recipeId"]) == true) == true ||
                record.expedition?.travel?["field"]?["work"] is JObject oldWork && fixture.missionCare?["recipes"]?.Any(r => (string)r["id"] == (string)oldWork["recipeId"]) == true)
                throw new FormatException("Care state/definitions do not match the save schema.");
            if (record.schemaVersion >= 11 ? root.Property("rescueFingerprint") == null || record.rescueFingerprint != rescueFingerprint ||
                record.expedition != null && ((JObject)root["expedition"]).Property("extractedTick") == null : record.rescueFingerprint != null || record.expedition?.extractedTick != null ||
                record.expedition?.travel?["field"]?["completed"]?.Any(w => (string)w["recipeId"] == (string)fixture.missionRescue?["requirements"]?["id"]) == true ||
                record.expedition?.travel?["field"]?["work"] is JObject rescueWork && (string)rescueWork["recipeId"] == (string)fixture.missionRescue?["requirements"]?["id"])
                throw new FormatException("Rescue state/definitions do not match the save schema.");
            if (record.schemaVersion >= 2 && !record.elapsedTicks.HasValue || record.schemaVersion == 1 && record.elapsedTicks.HasValue)
                throw new FormatException("Save clock does not match its schema version.");
            if (record.schemaVersion >= 3 && record.assignments == null || record.schemaVersion < 3 && record.assignments != null)
                throw new FormatException("Save staffing does not match its schema version.");
            if (record.schemaVersion >= 4 && (record.receiving == null || record.receivingFingerprint != receivingFingerprint) ||
                record.schemaVersion < 4 && (record.receiving != null || record.receivingFingerprint != null))
                throw new FormatException("Save Receiving definitions/state do not match the schema or current authored content.");
            if (record.schemaVersion >= 5 && record.transfers == null || record.schemaVersion < 5 && record.transfers != null)
                throw new FormatException("Save transfers do not match the schema version.");
            if (record.schemaVersion >= 6 && (root.Property("expedition") == null || record.missionFingerprint != (record.schemaVersion == 6 ? legacyMissionFingerprint :
                    record.schemaVersion == 7 ? (fixture.mission?["previousTravelFingerprint"]?.Value<string>() ?? missionFingerprint) : missionFingerprint)) ||
                record.schemaVersion < 6 && (root.Property("expedition") != null || record.missionFingerprint != null))
                throw new FormatException("Save mission state/definitions do not match its schema version.");
            if (record.schemaVersion == 7 && fixture.mission?["previousTravelDefinition"] is JObject previousTravel)
            {
                // Validate the old state against its exact previous scope first.
                // Additive migration cannot legitimize future Stage IDs or findings.
                var previousBootstrap = JObject.FromObject(fixture);
                var previousMission = (JObject)fixture.mission.DeepClone();
                previousMission["travel"] = previousTravel.DeepClone();
                foreach (var key in new[] { "previousTravelFingerprint", "previousTravelNpcIds", "previousTravelDefinition" }) previousMission.Property(key)?.Remove();
                previousBootstrap["mission"] = previousMission;
                previousBootstrap.Property("missionMap")?.Remove(); // Visual metadata is outside the old simulation scope.
                previousBootstrap.Property("missionCombat")?.Remove(); previousBootstrap.Property("missionCare")?.Remove(); previousBootstrap.Property("missionRescue")?.Remove();
                new CampaignSaveCodec(previousBootstrap.ToString()).Deserialize(json);
            }
            // Version 1 predates the clock. Its explicit migration begins at tick zero.
            var clock = new CampaignClock(record.elapsedTicks ?? 0);
            var compatibleLegacy = fixture.saveCompatibility != null && fixture.saveCompatibility.Any(
                c => record.schemaVersion <= c.maxSaveVersion && c.fromFingerprint == record.fixtureFingerprint && c.toFingerprint == fingerprint);
            if (record.fixtureFingerprint != fingerprint && !compatibleLegacy)
                throw new FormatException("Save belongs to a different fixture snapshot; no migration is available yet.");
            if (record.randomAlgorithm != RandomState.Algorithm) throw new FormatException("Unsupported random stream algorithm.");
            var completedIds = (record.constructionSites ?? new List<ConstructionRecord>()).Where(site => site.completedTick.HasValue && !site.fromTier.HasValue).Select(site => site.roomId);
            var expectedRooms = fixture.rooms.Select(r => r.id).Concat(completedIds).OrderBy(id => id);
            if (!record.rooms.Select(r => r.id).OrderBy(id => id).SequenceEqual(expectedRooms) ||
                !record.units.Select(u => u.id).OrderBy(id => id).SequenceEqual(fixture.units.Select(u => u.id).OrderBy(id => id)))
                throw new FormatException("Save has missing, duplicate or unknown persistent identities.");
            var definitions = fixture.rooms.ToDictionary(r => r.id, r => r.definitionId);
            foreach (var room in record.rooms)
            {
                var definition = definitions.TryGetValue(room.id, out var initial) ? initial : record.constructionSites.Single(site => site.roomId == room.id && site.completedTick.HasValue && !site.fromTier.HasValue).definitionId;
                if (room.definitionId != definition) throw new FormatException("Room identity changed definition.");
            }
            var sourceUnits = fixture.units.ToDictionary(u => u.id);
            foreach (var unit in record.units)
            {
                var migration = fixture.nameMigrations?.FirstOrDefault(m => m.unitId == unit.id && m.fromName == unit.name);
                if (migration != null) unit.name = migration.toName;
            }
            var restored = new BootstrapSnapshot
            {
                roomPlanning = fixture.roomPlanning, roomConstruction = fixture.roomConstruction,
                format = fixture.format, sources = fixture.sources, roomDefinitions = fixture.roomDefinitions, baseName = record.baseName, receiving = fixture.receiving, mission = fixture.mission, missionMap = fixture.missionMap, missionCombat = fixture.missionCombat, missionCare = fixture.missionCare, missionRescue = fixture.missionRescue, roomStorage = fixture.roomStorage, missionCargo = fixture.missionCargo, cargoHandling = fixture.cargoHandling, cargoProcessing = fixture.cargoProcessing, unitEquipment = fixture.unitEquipment,
                rooms = record.rooms.Select(r => new BootstrapSnapshot.Room { id = r.id, definitionId = r.definitionId,
                    col = r.col, row = r.row, width = r.width, height = r.height, constructionTier = r.constructionTier }).ToList(),
                units = record.units.Select(u => new BootstrapSnapshot.Unit { id = u.id, name = u.name, profession = u.profession,
                    tier = u.tier, branch = u.branch, perception = u.perception, stamina = u.stamina, endurance = u.endurance,
                    color = sourceUnits[u.id].color }).ToList()
            };
            var personnelScope = PersonnelScope(restored.units);
            restored.mission = (JObject)restored.mission?.DeepClone();
            restored.receiving = (JObject)restored.receiving?.DeepClone();
            if (restored.mission != null) restored.mission["personnel"] = personnelScope.mission["personnel"].DeepClone();
            if (restored.receiving != null) restored.receiving["units"] = personnelScope.receiving["units"].DeepClone();
            var data = BootstrapReader.Read(JsonConvert.SerializeObject(restored));
            SelectionReference selection = null;
            if (record.selection != null)
            {
                SelectionKind kind;
                if (record.selection.kind == "Room") kind = SelectionKind.Room;
                else if (record.selection.kind == "Unit") kind = SelectionKind.Unit;
                else throw new FormatException("Unsupported selection kind.");
                var check = new SelectionService(data);
                if (kind == SelectionKind.Room) check.SelectRoom(record.selection.id); else check.SelectUnit(record.selection.id);
                selection = new SelectionReference(kind, record.selection.id);
            }
            if (record.assignments != null && record.assignments.Any(a => a == null)) throw new FormatException("Save has a null assignment.");
            var assignments = record.assignments?.Select(a => new StaffAssignment(a.unitId, a.roomInstanceId));
            if (record.receiving != null && record.receiving.Any(o => o == null || o.progress == null || o.progress.Any(p => p == null)))
                throw new FormatException("Save has missing/null Receiving work.");
            // Older saves have no admitted items; never infer completed work or replay rewards.
            var receiving = record.receiving?.Select(o => new ReceivingOrder(o.instanceId, o.roomId, o.paused,
                o.progress.Select(p => new InspectionProgress(p.stepId, p.actorId, p.ticks))));
            if (record.transfers != null && record.transfers.Any(t => t == null)) throw new FormatException("Save has a null transfer.");
            if (record.schemaVersion < 19)
            {
                foreach (var item in record.cargo ?? new List<CargoRecord>())
                {
                    var oldRoom = item.roomId;
                    var intake = record.receiving?.SingleOrDefault(o => o.instanceId == item.id);
                    if (item.handling != null && item.handling.completedTick == null) item.roomId = item.handling.primaryRoomId;
                    else if (oldRoom != null && oldRoom == intake?.roomId && data.Storage?.Find(data.Rooms.Single(r => r.Id == oldRoom).Definition.Id) == null) item.roomId = null;
                    item.custodyRoomId = item.equippedUnitId == null ? oldRoom : null;
                    if (item.examination != null && data.Rooms.Single(r => r.Id == item.examination.roomId).Definition.Id != data.Processing.RoomDefinitionId)
                    {
                        if (item.examination.completedTick != null) item.examination.legacyStorageFinding = true;
                        else
                        {
                            // Old storage work cannot continue in an unstaffed storage room.
                            record.transfers?.RemoveAll(t => t.workInstanceId == item.id && t.workStepId == "CONTAINMENT_EXAMINATION_PROTOTYPE");
                            item.examination = null;
                        }
                    }
                }
            }
            var transfers = record.transfers?.Select(t => new StaffTransfer(t.unitId, t.sourceRoomId, t.destinationRoomId,
                t.timing == "NextTick" ? StaffTransferTiming.NextTick : t.timing == "FinishStep" ? StaffTransferTiming.FinishStep :
                    throw new FormatException("Unsupported pending transfer timing."), t.requestedTick, t.workInstanceId, t.workStepId));
            ExpeditionState expedition = null;
            if (record.expedition != null)
            {
                var e = record.expedition;
                if (data.Mission == null || e.party.Any(p => p == null || p.tools == null || p.tools.Any(t => t == null)))
                    throw new FormatException("Missing mission definition or expedition records.");
                var party = e.party.Select(p =>
                {
                    var loadout = data.Mission.Personnel.SingleOrDefault(u => u.UnitId == p.unitId) ?? throw new FormatException("Unknown expedition Unit.");
                    var tools = p.tools.Select(t =>
                    {
                        var definition = loadout.Tools.SingleOrDefault(d => d.InstanceId == t.instanceId) ?? throw new FormatException("Unknown equipped Tool.");
                        return new ExpeditionTool(t.instanceId, t.kitId, t.slot, t.charges, t.damaged, definition.Label, definition.Tier, definition.Services);
                    });
                    return new ExpeditionMember(p.unitId, p.perception, p.stamina, p.endurance, tools, p.equipment?.Select(g => new MissionEquipment(g.instanceId, g.slotId, g.name, g.damage, g.protection)), record.schemaVersion >= 20 ? p.startingHealth : data.Combat?.PartyHealth);
                });
                if (record.schemaVersion == 6 && (e.travel != null || e.stageId != data.Mission.GateStageId)) throw new FormatException("Legacy deployment contains unsupported travel.");
                if (record.schemaVersion >= 7 && ((JObject)root["expedition"]).Property("travel") == null) throw new FormatException("Missing travel record.");
                var travel = record.schemaVersion == 6 ? MissionTravel.Initial(data.Mission) : TravelSave.Read(e.travel, data.Mission,
                    record.schemaVersion == 7 ? fixture.mission?["previousTravelNpcIds"]?.ToObject<string[]>() ?? data.Mission.Travel.Npcs.Select(n => n.Id).ToArray() : null);
                if (record.schemaVersion >= 9 && (data.Combat == null ? e.combat != null : e.combat == null || e.combat.Any(b => b == null))) throw new FormatException("Missing/invalid combat records.");
                var combat = data.Combat == null ? null : new CombatState(e.combat?.Select(b => new BattleRecord(b.incidentId, b.startedTick, b.endedTick, b.rounds, b.outcome)) ?? Array.Empty<BattleRecord>());
                expedition = new ExpeditionState(e.missionId, e.stageId, e.startedTick, e.gateChoicePending, e.gateOpen, e.connectionOpenedTick, party, travel, combat, e.extractedTick, e.teamId);
            }
            var personnel = record.personnel?.Select(p => new PersonnelRecord(p.unitId, p.health, p.stamina, p.endurance, p.tools.Select(t =>
            {
                var expected = data.Mission?.Personnel.SingleOrDefault(u => u.UnitId == p.unitId)?.Tools.SingleOrDefault(d => d.InstanceId == t.instanceId)
                    ?? throw new FormatException("Unknown personnel Tool or Unit.");
                return new ExpeditionTool(t.instanceId, t.kitId, t.slot, t.charges, t.damaged, expected.Label, expected.Tier, expected.Services);
            })));
            return new SavedSession(new CampaignState(data, new RandomState(record.randomSeed, record.randomState), clock, assignments, receiving, transfers, expedition, record.teams?.Select(t => new SGTeam(t.id, t.designation, t.roomId, t.members)), record.cargo?.Select(i => new RecoveredItem(i.id, i.sourceContainerId, i.sourceMissionId, i.recoveredTick, i.payload, i.roomId, i.handling == null ? null : new HandlingOrder(i.handling.roomId, i.handling.primaryRoomId, i.handling.actorId, i.handling.startedTick, i.handling.ticks, i.handling.paused, i.handling.completedTick), i.retained ?? false, i.examination == null ? null : new ExaminationOrder(i.examination.roomId, i.examination.primaryRoomId, i.examination.actorId, i.examination.startedTick, i.examination.ticks, i.examination.paused, i.examination.completedTick, i.examination.legacyStorageFinding), i.equippedUnitId, i.custodyRoomId)), personnel, record.schemaVersion < 21 ? null : new ConstructionState(record.supplyStock, record.constructionSites.Select(site => new RoomConstructionSite(site.roomId, site.definitionId, site.tier, site.col, site.row, site.actorId, site.startedTick, site.durationTicks, site.workedTicks, site.supplyCost, site.supplyClass, site.paused, site.completedTick, site.maintenanceRoomId, site.securityActorId, site.fromTier)), record.excavatedCells, record.roomGroups?.Select(g => new RoomGroup(g.id, g.primaryChild, g.secondaryChild, g.active)), record.clearings?.Select(o => new TerrainClearingOrder(o.recipeId, o.col, o.row, o.startedTick, o.bubbles.Select(b => new ClearingBubbleWork(b.actorId,b.ticks,b.completedTick)), o.completedTick)))), selection);
        }
    }
}
