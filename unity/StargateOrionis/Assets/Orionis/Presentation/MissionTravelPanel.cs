using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class MissionTravelPanel : MonoBehaviour
    {
        private Text status;
        private static string ActionReason(string blocker) => blocker switch
        {
            "NO_VALID_ACTOR" => "No Unit meets Profession / tier / perception requirements",
            "ACTOR_UNAVAILABLE" => "Qualified Unit incapacitated or unavailable",
            "TOOL_SERVICE_MISSING" => "Required Tool Service is not equipped",
            "TOOL_DAMAGED" => "Required Tool is damaged",
            "TOOL_CHARGES_DEPLETED" => "Required Tool has insufficient charges",
            "HOSTILES_PRESENT" => "Clear hostile guards first",
            "COMPLETED" => "Completed",
            null => "Ready",
            _ => "Mission action unavailable"
        };
        private static void ShowReadiness(Button button, string blocker)
        {
            var color = blocker == null ? new Color(.12f,.35f,.32f) : blocker.StartsWith("TOOL_") ? new Color(.46f,.29f,.08f) : new Color(.23f,.26f,.3f);
            button.targetGraphic.color = color;
            // Keep the diagnostic color visible even when the action is disabled.
            button.transition = Selectable.Transition.None;
            button.interactable = blocker == null;
            button.GetComponentInChildren<Text>().text += "\n" + ActionReason(blocker);
        }
        private void Run(Action action) { try { action(); } catch (Exception error) { status.text = error.Message; } }
        public void Bind(CampaignSession session)
        {
            var definition = session.State.Base.Mission.Travel;
            var travel = MissionTravel.Current(session.State); var expedition = session.State.Expedition;
            if (definition == null) return;
            var stage = definition.Stages.Single(s => s.Id == expedition.StageId);
            PrototypeUi.Label(PrototypeUi.Rect("Current Stage", transform, new Vector2(0, .85f), Vector2.one), stage.Name, 20);
            PrototypeUi.Label(PrototypeUi.Rect("Known Stages", transform, new Vector2(0, .73f), new Vector2(1, .85f)),
                "Known: " + string.Join(" / ", definition.Stages.Where(s => s.Known || travel.Visits.ContainsKey(s.Id)).Select(s => s.Name)), 15);
            status = PrototypeUi.Label(PrototypeUi.Rect("Travel status", transform, Vector2.zero, new Vector2(1, .1f)), "", 15);
            status.rectTransform.offsetMin = new Vector2(12, 0); status.rectTransform.offsetMax = new Vector2(-12, 0);
            if (MissionCombat.Active(session.State) != null)
            {
                PrototypeUi.Rect("Guard encounter", transform, Vector2.zero, new Vector2(1, 1.42f)).gameObject.AddComponent<CombatPanel>().Bind(session); return;
            }
            if (session.State.Base.Combat != null && MissionCombat.Inspect(session.State).Incapacitated)
            {
                PrototypeUi.Label(PrototypeUi.Rect("Incapacitated party", transform, new Vector2(0, .15f), new Vector2(1, .75f)), "The party is incapacitated. Damage is preserved by Save/Load. Recovery is not implemented yet.", 20); return;
            }
            if (travel.SceneId != null)
            {
                var scene = definition.Conversations.Single(c => c.Id == travel.SceneId);
                var node = scene.Nodes.Single(n => n.Id == travel.NodeId);
                if (node.Responses.Count > 2) status.text = "Scroll for more responses.";
                var speaker = definition.Npcs.FirstOrDefault(n => n.Id == scene.NpcId)?.Label ?? definition.Field.Subjects.Single(s => s.Id == scene.NpcId).Label;
                var textBottom = node.Text.Length > 140 ? .35f : .53f;
                PrototypeUi.Label(PrototypeUi.Rect("Conversation text", transform, new Vector2(0, textBottom), new Vector2(1, .75f)), speaker + ":\n" + node.Text, 18);
                var options = PrototypeUi.Rect("Conversation options", transform, new Vector2(0, .11f), new Vector2(1, textBottom));
                options.gameObject.AddComponent<Image>().color = new Color(.08f, .11f, .15f);
                options.gameObject.AddComponent<Mask>().showMaskGraphic = true;
                var content = PrototypeUi.Rect("Response entries", options, new Vector2(0, 1), Vector2.one);
                content.pivot = new Vector2(.5f, 1);
                content.sizeDelta = new Vector2(0, Math.Max(1, node.Responses.Count) * 64);
                var scroll = options.gameObject.AddComponent<ScrollRect>(); scroll.viewport = options; scroll.content = content;
                scroll.horizontal = false; scroll.movementType = ScrollRect.MovementType.Clamped; scroll.scrollSensitivity = 30;
                if (node.End)
                    PrototypeUi.Button("Continue conversation", options, new Vector2(0, .2f), new Vector2(1, .8f), "Continue", new Color(.12f, .35f, .4f), () => Run(session.ContinueConversation));
                for (int i = 0; i < node.Responses.Count; i++)
                {
                    var response = node.Responses[i]; var candidates = MissionTravel.EligibleActors(session.State, response).ToList();
                    var button = PrototypeUi.Button("response-" + response.Id, content, new Vector2(0, 1), Vector2.one,
                        response.Text + (response.Profession == null ? "" : "\n" + response.Profession + response.MinimumTier), new Color(.12f, .25f, .32f), () =>
                        {
                            if (candidates.Count == 1) Run(() => session.Respond(response.Id, candidates[0]));
                            else ChooseActor(session, candidates, id => session.Respond(response.Id, id));
                        });
                    var rect = button.GetComponent<RectTransform>(); rect.offsetMin = new Vector2(2, -(i + 1) * 64 + 2); rect.offsetMax = new Vector2(-2, -i * 64 - 2);
                    button.GetComponentInChildren<Text>().fontSize = 16;
                    button.interactable = candidates.Count > 0;
                    if (!button.interactable) button.GetComponentInChildren<Text>().color = Color.gray;
                }
                return;
            }
            if (travel.Field?.Work != null)
            {
                var w = travel.Field.Work; var recipe = MissionField.Requirements(session.State, w.RecipeId);
                var care = MissionCare.Recipe(session.State, w.RecipeId);
                var rescue = MissionRescue.IsRecipe(session.State, w.RecipeId);
                var actor = session.State.Base.Units.Single(u => u.Id == w.ActorId);
                var tool = expedition.Party.Single(u => u.UnitId == w.ActorId).Tools.SingleOrDefault(t => t.InstanceId == w.ToolId);
                PrototypeUi.Label(PrototypeUi.Rect("Field work details", transform, new Vector2(0, .4f), new Vector2(1, .74f)),
                    (rescue ? "Send operative to Gate" : session.State.Base.Cargo?.Reveal.Id == w.RecipeId ? "Ask medical worker about equipment" : care == null ? "Door hack ready" : "Stabilize: " + care.SubjectId) + "\n" + actor.Name + "\n" +
                    (tool == null ? "No Tool required" : tool.Label + " / " + recipe.ChargeCost + " charge on completion") + "\nSave/Load preserves this work.", 17);
                PrototypeUi.Button("Complete field work", transform, new Vector2(0, .25f), new Vector2(1, .4f), "Complete work / " + recipe.Ticks + " tick", new Color(.12f, .35f, .4f), () => Run(session.AdvanceFieldWork));
                PrototypeUi.Button("Cancel field work", transform, new Vector2(0, .08f), new Vector2(1, .23f), "Cancel / no charge spent", new Color(.18f, .2f, .23f), () => Run(session.CancelFieldWork));
                return;
            }
            int index = 0;
            foreach (var door in definition.Transitions.Where(t => t.Destination(stage.Id) != null))
            {
                var destination = definition.Stages.Single(s => s.Id == door.Destination(stage.Id));
                var known = destination.Known || travel.Visits.ContainsKey(destination.Id);
                var locked = door.InitialState == "LOCKED" && !travel.OpenDoors.Contains(door.Id);
                if (locked)
                {
                    var recipe = definition.Field.DoorRecipes.Single(r => r.DoorId == door.Id);
                    var candidates = MissionField.Candidates(session.State, recipe).ToList();
                    var button = PrototypeUi.Button("hack-" + recipe.Id, transform, new Vector2(0, .55f - index * .14f), new Vector2(1, .71f - index * .14f),
                        "Locked door: Hack / " + recipe.Profession + recipe.MinimumTier + " / " + recipe.Service + " / " + recipe.ChargeCost + " charge", new Color(.12f, .3f, .36f), () =>
                        {
                            var actors = candidates.Select(c => c.ActorId).Distinct().ToList();
                            Action<string> start = id => session.StartFieldWork(recipe.Id, id, candidates.First(c => c.ActorId == id).ToolId);
                            if (actors.Count == 1) Run(() => start(actors[0])); else ChooseActor(session, actors, start);
                        });
                    button.GetComponentInChildren<Text>().fontSize = 16; button.interactable = candidates.Count > 0;
                    ShowReadiness(button, MissionCombat.HostilesPresent(session.State) ? "HOSTILES_PRESENT" : MissionField.CapabilityBlocker(session.State, recipe));
                }
                else PrototypeUi.Button("move-" + door.Id, transform, new Vector2(0, .55f - index * .14f), new Vector2(1, .71f - index * .14f),
                    "Move: " + (known ? destination.Name : "Unexplored Stage") + " / 1 tick", new Color(.12f, .35f, .4f), () => Run(() => session.MoveParty(door.Id)));
                index++;
            }
            foreach (var scene in definition.Conversations.Where(c => c.FirstVisit == 0 && c.StageId == stage.Id && !travel.StartedConversations.Contains(c.Id)))
            {
                PrototypeUi.Button("talk-" + scene.Id, transform, new Vector2(0, .55f - index * .14f), new Vector2(1, .71f - index * .14f),
                    "Talk: " + definition.Field.Subjects.Single(s => s.Id == scene.NpcId).Label, new Color(.12f, .35f, .4f), () => Run(() => session.Talk(scene.Id))).interactable = !MissionCombat.HostilesPresent(session.State); index++;
            }
            foreach (var encounter in session.State.Base.Combat?.Encounters.Where(i => i.StageId == stage.Id) ?? Enumerable.Empty<GuardEncounter>())
                if (!MissionCombat.GuardsClear(session.State, stage.Id))
                {
                    PrototypeUi.Button("engage-" + encounter.Id, transform, new Vector2(0, .55f - index * .14f), new Vector2(1, .71f - index * .14f),
                        "Engage guards / encounter: 1 tick", new Color(.4f, .18f, .16f), () => Run(() => session.Engage(encounter.Id))); index++;
                }
                else status.text = "Guards cleared. Other evacuation conditions still apply.";
            if (session.State.Base.Care?.StageId == stage.Id)
            {
                var careButton = PrototypeUi.Button("Patients and evacuation", transform, new Vector2(0, .55f - index * .14f), new Vector2(1, .71f - index * .14f),
                    "Patients & evacuation / " + session.State.Base.Care.Recipes.Count(r => MissionCare.Completed(session.State, r.Id)) + "/" + session.State.Base.Care.Recipes.Count + " stabilized",
                    new Color(.12f, .35f, .32f), () => ShowCare(session)); index++;
                var pending = session.State.Base.Care.Recipes.Where(r => !MissionCare.Completed(session.State, r.Id)).ToList();
                var careBlocker = pending.Select(r => MissionField.CapabilityBlocker(session.State, r.Requirements)).ToList();
                if (pending.Count > 0 && careBlocker.All(b => b != null))
                {
                    ShowReadiness(careButton, careBlocker[0]);
                    careButton.interactable = true; // Inspection/navigation remains available.
                }
            }
            var cargo = session.State.Base.Cargo;
            if (cargo != null && cargo.StageId == stage.Id)
            {
                var revealed = RecoveredCargo.Revealed(session.State);
                var candidates = MissionField.Candidates(session.State, cargo.Reveal).ToList();
                var button = PrototypeUi.Button("Reveal equipment cache", transform, new Vector2(0, .55f - index * .14f), new Vector2(1, .71f - index * .14f),
                    revealed ? cargo.Label + " / recovery available at debrief" : "Ask medical worker about equipment / DIPLOMAT1 / 1 tick", new Color(.16f, .3f, .3f),
                    () => ChooseActor(session, candidates.Select(c => c.ActorId).ToList(), id => session.StartFieldWork(cargo.Reveal.Id, id, null)));
                button.interactable = !revealed && candidates.Count > 0 && !MissionCombat.HostilesPresent(session.State); index++;
            }
            if (travel.Field?.Observed.Any(id => definition.Field.Observations.Any(o => o.Id == id && o.StageId == stage.Id)) == true)
            {
                var label = PrototypeUi.Label(PrototypeUi.Rect("Mission progress limit", transform, new Vector2(0, index >= 3 ? 0 : .1f), new Vector2(1, index >= 3 ? .11f : .35f)),
                    string.Join("\n", definition.Field.Observations.Where(o => o.StageId == stage.Id && travel.Field.Observed.Contains(o.Id)).Select(o => o.Text)) +
                    (index >= 3 ? "" : "\nSend the operative to the Gate, then return there to extract."), 15);
                label.rectTransform.offsetMin = new Vector2(12, 0); label.rectTransform.offsetMax = new Vector2(-12, 0);
            }
        }
        private void ShowCare(CampaignSession session)
        {
            var panel = PrototypeUi.Rect("Patient care", transform, Vector2.zero, new Vector2(1, 1.42f));
            panel.gameObject.AddComponent<Image>().color = new Color(.07f, .12f, .16f);
            PrototypeUi.Label(PrototypeUi.Rect("Care heading", panel, new Vector2(0, .88f), Vector2.one), "Patient care", 22);
            int i = 0;
            foreach (var r in session.State.Base.Care.Recipes.Where(r => r.StageId == session.State.Expedition.StageId))
            {
                var candidates = MissionField.Candidates(session.State, r.Requirements).ToList(); var done = MissionCare.Completed(session.State, r.Id);
                var button = PrototypeUi.Button("care-" + r.Id, panel, new Vector2(0, .72f - i * .17f), new Vector2(1, .87f - i * .17f),
                    r.SubjectId + " / " + MissionCare.Condition(session.State, r) + (done ? "" : "\nStabilize / MEDIC" + r.Requirements.MinimumTier + " / " + r.Requirements.Service + " / 1 charge / 1 tick"),
                    new Color(.12f, .3f, .32f), () =>
                    {
                        var actors = candidates.Select(c => c.ActorId).Distinct().ToList();
                        Action<string> start = id => session.StartFieldWork(r.Id, id, candidates.First(c => c.ActorId == id).ToolId);
                        if (actors.Count == 1) Run(() => start(actors[0])); else ChooseActor(session, actors, start);
                    });
                button.GetComponentInChildren<Text>().fontSize = 16;
                ShowReadiness(button, done ? "COMPLETED" : MissionCombat.HostilesPresent(session.State) ? "HOSTILES_PRESENT" : MissionField.CapabilityBlocker(session.State, r.Requirements)); i++;
            }
            PrototypeUi.Label(PrototypeUi.Rect("Evacuation readiness", panel, new Vector2(0, .24f), new Vector2(1, .37f)),
                (MissionCare.Resolved(session.State) ? "Medical incident resolved.\n" : "All patients must be stabilized to resolve the medical incident.\n") +
                MissionEvacuation.Status(session.State), 16);
            var sent = session.State.Expedition.Travel.Field.Subjects.Any(x => x.Id == session.State.Base.Rescue?.SubjectId && x.Evacuation == "AT_GATE");
            var send = PrototypeUi.Button("Send operative to Gate", panel, new Vector2(0, .12f), new Vector2(1, .23f), sent ? "Operative waiting at Gate" : "Send operative to Gate / 1 tick / no Tool", new Color(.12f, .35f, .4f), () =>
            {
                var r = session.State.Base.Rescue.Requirements;
                ChooseActor(session, MissionField.Candidates(session.State, r).Select(c => c.ActorId).ToList(), id => session.StartFieldWork(r.Id, id, null));
            });
            send.interactable = MissionRescue.CanDepart(session.State) && !MissionCombat.HostilesPresent(session.State);
            PrototypeUi.Button("Close patient care", panel, Vector2.zero, new Vector2(1, .11f), "Back", new Color(.18f, .2f, .23f),
                () => { panel.gameObject.SetActive(false); Destroy(panel.gameObject); });
        }
        private void ChooseActor(CampaignSession session, System.Collections.Generic.IReadOnlyList<string> candidates, Action<string> choose)
        {
            var existing = transform.Find("Choose responder"); if (existing != null) { existing.gameObject.SetActive(false); Destroy(existing.gameObject); }
            var panel = PrototypeUi.Rect("Choose responder", transform, Vector2.zero, new Vector2(1, 1.42f));
            panel.gameObject.AddComponent<Image>().color = new Color(.07f, .12f, .16f);
            PrototypeUi.Label(PrototypeUi.Rect("Responder heading", panel, new Vector2(0, .83f), Vector2.one), "Who responds?", 18);
            for (int i = 0; i < candidates.Count; i++)
            {
                var id = candidates[i]; var unit = session.State.Base.Units.Single(u => u.Id == id);
                var button = PrototypeUi.Button("responder-" + id, panel, new Vector2(0, .65f - i * .16f), new Vector2(1, .8f - i * .16f),
                    PrototypeUi.UnitLabel(unit, session.State.Base.Mission), new Color(.12f, .3f, .36f), () => Run(() => choose(id)));
                button.GetComponentInChildren<Text>().fontSize = 15;
            }
            PrototypeUi.Button("Cancel responder", panel, Vector2.zero, new Vector2(1, .12f), "Back", new Color(.18f, .2f, .23f), () => { panel.gameObject.SetActive(false); Destroy(panel.gameObject); }).GetComponentInChildren<Text>().fontSize = 16;
        }
    }
}
