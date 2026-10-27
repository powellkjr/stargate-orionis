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
        public string PendingCombatId {get;private set;}
        public static string ActionLabel(CampaignState state,FieldActionRecipe action)
        {
            var cache=state.Base.Cargo?.Caches.FirstOrDefault(c=>c.Recipe.Id==action.Id);
            if(cache!=null)return "Mark for extraction: "+cache.Label;
            if(state.Base.ResourceProcessing!=null&&action.Effects.Any(e=>e.Type=="CARRY_TARGET"&&e.InstanceId==state.Base.ResourceProcessing.InstanceId))return "Mark for extraction: Supply cache";
            return action.Label;
        }
        private static string ActionReason(string blocker) => blocker switch
        {
            "NO_VALID_ACTOR" => "No Unit meets Profession / tier / perception requirements",
            "ACTOR_UNAVAILABLE" => "Qualified Unit incapacitated or unavailable",
            "TOOL_SERVICE_MISSING" => "Required Tool Service is not equipped",
            "TOOL_DAMAGED" => "Required Tool is damaged",
            "TOOL_CHARGES_DEPLETED" => "Required Tool has insufficient charges",
            "HOSTILES_PRESENT" => "Clear hostile guards first",
            "COMPLETED" => "Completed",
            "KNOWLEDGE_REQUIRED" => "Required subject knowledge is missing",
            "PREPARATION_REQUIRED" => "Complete the required preparation first",
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
                "Explored: " + travel.Visits.Count + " rooms / minimap shows the known layout", 15);
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
                    (w.GroupId!=null?definition.Field.Workflows.Groups.Single(g=>g.Id==w.GroupId).Label:recipe is FieldActionRecipe action ? ActionLabel(session.State,action) : rescue ? "Send operative to Gate" : session.State.Base.Cargo?.Reveal.Id == w.RecipeId ? "Ask medical worker about equipment" : care == null ? "Door hack ready" : "Stabilize: " + care.SubjectId) + "\n" + (w.Assignments.Count>0?string.Join(" / ",w.Assignments.Select(a=>session.State.Base.Units.Single(u=>u.Id==a.ActorId).Name)):actor.Name) + "\n" +
                    (tool == null ? "No Tool required" : tool.Label + " / " + recipe.ChargeCost + " charge on completion") + "\nSave/Load preserves this work.", 17);
                PrototypeUi.Button("Complete field work", transform, new Vector2(0, .25f), new Vector2(1, .4f), "Complete work / " + recipe.Ticks + " tick", new Color(.12f, .35f, .4f), () => Run(session.AdvanceFieldWork));
                PrototypeUi.Button("Cancel field work", transform, new Vector2(0, .08f), new Vector2(1, .23f), "Cancel / no charge spent", new Color(.18f, .2f, .23f), () => Run(session.CancelFieldWork));
                return;
            }
            ShowStageActions(session);
        }
        private void ShowStageActions(CampaignSession session)
        {
            var s=session.State;var travel=s.Expedition.Travel;var stage=s.Expedition.StageId;var definition=s.Base.Mission.Travel;
            var actions=definition.Field.Actions.Concat(s.Base.Cargo?.Caches.Select(c=>c.Recipe).OfType<FieldActionRecipe>()??Enumerable.Empty<FieldActionRecipe>()).Where(a=>a.StageId==stage&&!travel.Field.Completed.Any(w=>w.RecipeId==a.Id)).ToList();
            var viewport=PrototypeUi.Rect("Stage action viewport",transform,new Vector2(0,.12f),new Vector2(1,.72f));viewport.gameObject.AddComponent<RectMask2D>();var content=PrototypeUi.Rect("Stage action choices",viewport,new Vector2(0,1),Vector2.one);content.pivot=new Vector2(.5f,1);var scroll=viewport.gameObject.AddComponent<ScrollRect>();scroll.viewport=viewport;scroll.content=content;scroll.horizontal=false;scroll.scrollSensitivity=35;int index=0;
            Button Row(string name,string text,UnityEngine.Events.UnityAction click)
            {var button=PrototypeUi.Button(name,content,new Vector2(0,1),Vector2.one,text,new Color(.12f,.3f,.36f),click);var rect=button.GetComponent<RectTransform>();rect.offsetMin=new Vector2(2,-(++index)*76+2);rect.offsetMax=new Vector2(-2,-(index-1)*76-2);button.GetComponentInChildren<Text>().fontSize=14;return button;}
            foreach(var door in definition.Transitions.Where(d=>d.Destination(stage)!=null&&MissionTravel.DoorVisible(s,d)))
            {
                var destination=definition.Stages.Single(x=>x.Id==door.Destination(stage));bool locked=door.InitialState=="LOCKED"&&!travel.OpenDoors.Contains(door.Id);
                if(locked){var recipe=definition.Field.DoorRecipes.SingleOrDefault(r=>r.DoorId==door.Id);if(recipe==null){Row("blocked-"+door.Id,"Locked route / no supported interaction",()=>{}).interactable=false;continue;}var candidates=MissionField.Candidates(s,recipe).ToList();var button=Row("hack-"+recipe.Id,"Locked door: Hack / "+recipe.Profession+recipe.MinimumTier+" / "+recipe.Service+" / "+recipe.ChargeCost+" charge",()=>ChooseActor(session,candidates.Select(c=>c.ActorId).Distinct().ToList(),id=>session.StartFieldWork(recipe.Id,id,candidates.First(c=>c.ActorId==id).ToolId)));ShowReadiness(button,MissionField.CapabilityBlocker(s,recipe));}
                else Row("move-"+door.Id,"Move: "+(destination.Known||travel.Visits.ContainsKey(destination.Id)?destination.Name:"Unexplored area")+" / 1 tick",()=>Run(()=>session.MoveParty(door.Id)));
            }
            foreach(var scene in definition.Conversations.Where(c=>c.StageId==stage&&c.FirstVisit==0&&!travel.StartedConversations.Contains(c.Id)&&(definition.Npcs.Any(n=>n.Id==c.NpcId)||travel.Field.Subjects.Any(x=>x.Id==c.NpcId&&x.Detection=="LOCATED"))))Row("talk-"+scene.Id,"Talk: "+(definition.Npcs.FirstOrDefault(n=>n.Id==scene.NpcId)?.Label??definition.Field.Subjects.Single(x=>x.Id==scene.NpcId).Label),()=>Run(()=>session.Talk(scene.Id))).interactable=!MissionCombat.HostilesPresent(s);
            foreach(var encounter in s.Base.Combat?.Encounters.Where(i=>i.StageId==stage)??Enumerable.Empty<GuardEncounter>())if(!MissionCombat.GuardsClear(s,stage))Row("engage-"+encounter.Id,"Engage guards / encounter: 1 tick",()=>ConfirmCombat(session,encounter.Id));
            if(s.Base.Care?.StageId==stage)
            {
                foreach(var recipe in s.Base.Care.Recipes)
                {
                    var candidates=MissionField.Candidates(s,recipe.Requirements).ToList();bool done=MissionCare.Completed(s,recipe.Id);
                    var button=Row("care-"+recipe.Id,recipe.SubjectId+" / "+MissionCare.Condition(s,recipe)+"\nStabilize / MEDIC"+recipe.Requirements.MinimumTier+" / "+recipe.Requirements.Service+" / 1 tick",()=>{var actors=candidates.Select(c=>c.ActorId).Distinct().ToList();Action<string> start=id=>session.StartFieldWork(recipe.Id,id,candidates.First(c=>c.ActorId==id).ToolId);if(actors.Count==1)Run(()=>start(actors[0]));else ChooseActor(session,actors,start);});
                    ShowReadiness(button,done?"COMPLETED":MissionCombat.HostilesPresent(s)?"HOSTILES_PRESENT":MissionField.CapabilityBlocker(s,recipe.Requirements));
                }
                if(s.Base.Rescue!=null){var r=s.Base.Rescue.Requirements;Row("Send operative to Gate","Send operative to Gate / "+r.Ticks+" tick / no Tool",()=>ChooseActor(session,MissionField.Candidates(s,r).Select(c=>c.ActorId).Distinct().ToList(),id=>session.StartFieldWork(r.Id,id,null))).interactable=MissionRescue.CanDepart(s)&&!MissionCombat.HostilesPresent(s);}
            }
            var cargo=s.Base.Cargo;if(cargo!=null&&cargo.StageId==stage){bool revealed=RecoveredCargo.Revealed(s);var candidates=MissionField.Candidates(s,cargo.Reveal).ToList();Row("Reveal equipment cache",revealed?cargo.Label+" / marked for extraction":"Ask medical worker about equipment / DIPLOMAT1 / 1 tick",()=>ChooseActor(session,candidates.Select(c=>c.ActorId).Distinct().ToList(),id=>session.StartFieldWork(cargo.Reveal.Id,id,null))).interactable=!revealed&&candidates.Count>0&&!MissionCombat.HostilesPresent(s);}
            foreach(var group in definition.Field.Workflows.Groups.Where(g=>g.StageId==stage&&!MissionField.GroupCompleted(s,g.Id)))Row("group-"+group.Id,group.Label+" / one Actor per station / the available party searches in parallel",()=>Run(()=>session.StartFieldGroup(group.Id))).interactable=!MissionCombat.HostilesPresent(s)&&s.Expedition.Party.Any(p=>MissionCombat.CanAct(s,p.UnitId));
            foreach(var action in actions)
            {
                if(action.WorkGroupId!=null||!MissionField.ActionVisible(s,action))continue;
                var candidates=MissionField.Candidates(s,action).ToList();var button=Row("action-"+action.Id,ActionLabel(s,action)+"\n"+action.Profession+action.MinimumTier+" / "+(action.Service??"no Tool")+" / "+action.ChargeCost+" charge / "+action.Ticks+" tick",()=>{var actors=candidates.Select(c=>c.ActorId).Distinct().ToList();Action<string> start=id=>session.StartFieldWork(action.Id,id,candidates.First(c=>c.ActorId==id).ToolId);if(actors.Count==1)Run(()=>start(actors[0]));else ChooseActor(session,actors,start);});ShowReadiness(button,MissionField.ActionBlocker(s,action)??MissionField.CapabilityBlocker(s,action));
            }
            if(s.Base.ResourceProcessing?.StageId==stage){var item=s.Cargo.SingleOrDefault(i=>ResourceCargo.IsResource(s,i));var inspect=Row("inspect-resource-cache",item==null?"Inspect cache / first assessment / 1 tick":ResourceCargo.Name(s,item)+"\nInspect next property / 1 tick",()=>Run(session.InspectResourceCache));if(item!=null&&ResourceCargo.Known(s,item,"CONVERSION")){inspect.interactable=false;inspect.GetComponentInChildren<Text>().text=ResourceCargo.Name(s,item)+"\nField inspection complete; mark the cache for extraction.";}status.text=ResourceCargo.StageSafe(s,stage)?"Processing incident resolved. Mark the cache for extraction.":"Isolate the mining power before ordinary field work.";}
            var finding=travel.Field.Completed.Select(w=>definition.Field.Actions.SingleOrDefault(a=>a.Id==w.RecipeId&&a.StageId==stage)).LastOrDefault(a=>!string.IsNullOrEmpty(a?.OutcomeText));if(finding!=null)status.text=finding.OutcomeText;
            var observations=definition.Field.Observations.Where(o=>o.StageId==stage&&travel.Field.Observed.Contains(o.Id)).Select(o=>o.Text);var records=MissionField.Records(s).Select(r=>"Party inventory: "+r).Concat(MissionField.Records(s,true).Select(r=>"Research question: "+r));status.text=string.Join("\n\n",new[]{status.text}.Concat(observations).Concat(records).Where(t=>!string.IsNullOrEmpty(t)));
            content.sizeDelta=new Vector2(0,Mathf.Max(76,index*76));Canvas.ForceUpdateCanvases();scroll.verticalNormalizedPosition=1;
        }
        private void ConfirmCombat(CampaignSession session,string id)
        {
            PendingCombatId=id;var choices=transform.Find("Stage action viewport");if(choices!=null)choices.gameObject.SetActive(false);
            var panel=PrototypeUi.Rect("Combat confirmation",transform,new Vector2(0,.12f),new Vector2(1,.72f));
            PrototypeUi.Label(PrototypeUi.Rect("Combat confirmation text",panel,new Vector2(0,.4f),Vector2.one),"Start combat? The encounter plays automatically after confirmation.",18);
            PrototypeUi.Button("Start combat",panel,new Vector2(0,0),new Vector2(.48f,.35f),"Start combat / automatic playback",new Color(.35f,.18f,.15f),()=>Run(()=>session.Engage(id)));
            PrototypeUi.Button("Cancel combat",panel,new Vector2(.52f,0),new Vector2(1,.35f),"Cancel / no time spent",new Color(.15f,.25f,.3f),()=>{PendingCombatId=null;Destroy(panel.gameObject);if(choices!=null)choices.gameObject.SetActive(true);});
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
            var root=transform.parent;var existing = root.Find("Choose responder"); if (existing != null) { existing.gameObject.SetActive(false); Destroy(existing.gameObject); }
            var panel = PrototypeUi.Rect("Choose responder", root, new Vector2(.12f,.10f), new Vector2(.88f,.86f));
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
