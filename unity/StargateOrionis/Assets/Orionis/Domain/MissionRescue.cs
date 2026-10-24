using System;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Domain
{
    public sealed class RescueCondition
    {
        public string Kind { get; }
        public string Id { get; }
        public string Field { get; }
        public string Value { get; }
        public IReadOnlyList<RescueCondition> Conditions { get; }
        public RescueCondition(string kind, string id, string field, string value, IEnumerable<RescueCondition> conditions)
        { Kind = kind; Id = id; Field = field; Value = value; Conditions = (conditions ?? Array.Empty<RescueCondition>()).ToList().AsReadOnly(); }
    }
    public sealed class RescueDefinition
    {
        public string SubjectId { get; }
        public string StageId { get; }
        public FieldRequirements Requirements { get; }
        public RescueCondition Departure { get; }
        public RescueDefinition(string subjectId, string stageId, FieldRequirements requirements, RescueCondition departure)
        { SubjectId = subjectId; StageId = stageId; Requirements = requirements; Departure = departure; }
    }
    public static class MissionRescue
    {
        public static bool IsRecipe(CampaignState s, string id) => s.Base.Rescue?.Requirements.Id == id;
        private static bool Condition(CampaignState s, RescueCondition c)
        {
            if (c.Kind == "ALL") return c.Conditions.All(x => Condition(s, x));
            if (c.Kind == "ANY") return c.Conditions.Any(x => Condition(s, x));
            if (c.Kind == "KNOWLEDGE_PRESENT") return s.Expedition.Travel.Knowledge.Contains(c.Id);
            if (c.Kind == "INCIDENT_STATE") return (c.Id == s.Base.Care.IncidentId ? MissionCare.Resolved(s) :
                s.Base.Combat.Encounters.Any(i => i.Id == c.Id && MissionCombat.GuardsClear(s, i.StageId))) && c.Value == "RESOLVED";
            if (c.Kind == "STAGE_STATE") return false; // Social-passage work is not yet ported; no clearance is granted.
            var patient = s.Base.Care.Recipes.SingleOrDefault(r => r.SubjectId == c.Id);
            if (patient != null && c.Field == "condition") return MissionCare.Condition(s, patient) == c.Value;
            var subject = s.Expedition.Travel.Field.Subjects.SingleOrDefault(x => x.Id == c.Id);
            if (subject != null && c.Field == "evacState") return subject.Evacuation == c.Value;
            // Source containment is outside this four-Stage route; its authored
            // initial active=true state has not changed. Never grant containment.
            return c.Kind == "INSTANCE_STATE" && c.Field == "active" && c.Value == "true";
        }
        public static bool CanDepart(CampaignState s)
        {
            var d = s.Base.Rescue;
            return d != null && s.Expedition != null && !s.Expedition.Returned && s.Expedition.StageId == d.StageId &&
                s.Expedition.Travel.Field.Subjects.Any(x => x.Id == d.SubjectId && x.StageId == d.StageId && x.Detection == "LOCATED") &&
                MissionEvacuation.SecureRoute(s) != null && Condition(s, d.Departure);
        }
        public static FieldSubject SendToGate(CampaignState s, FieldSubject subject) => subject.Id != s.Base.Rescue.SubjectId ? subject :
            new FieldSubject(subject.Id, s.Base.Mission.GateStageId, subject.Label, subject.Detection, "AT_GATE", subject.Combat);
        public static CampaignState Extract(CampaignState s)
        {
            MissionCombat.RequireFree(s);
            var e = s.Expedition ?? throw new InvalidOperationException("No mission is active."); var t = e.Travel;
            if (e.GateChoicePending || !e.GateOpen || e.StageId != s.Base.Mission.GateStageId || t.SceneId != null || t.Field.Work != null)
                throw new InvalidOperationException("Return to the Gate, finish work/dialogue and redial SGC before extracting.");
            var f = t.Field; var subjects = f.Subjects.Select(x => x.Evacuation == "AT_GATE" ?
                new FieldSubject(x.Id, x.StageId, x.Label, x.Detection, "EXTRACTED", x.Combat) : x).ToList();
            var objectives = f.Objectives.ToDictionary(p => p.Key, p => p.Value);
            if (s.Base.Rescue != null && subjects.Any(x => x.Id == s.Base.Rescue.SubjectId && x.Evacuation == "EXTRACTED")) objectives[s.Base.Rescue.Requirements.Id] = "COMPLETED";
            var travel = MissionField.With(t, new MissionFieldState(subjects, objectives, f.Observed, null, f.Completed));
            return new CampaignState(s.Base, s.Random, s.Clock, s.Assignments, s.Receiving, s.Transfers,
                new ExpeditionState(e.MissionId, e.StageId, e.StartedTick, false, false, e.ConnectionOpenedTick, e.Party, travel, e.Combat, s.Clock.ElapsedTicks, teamId: e.TeamId), teams: s.Teams, cargo: s.Cargo, personnel: s.Personnel, construction: s.Construction);
        }
    }
}
