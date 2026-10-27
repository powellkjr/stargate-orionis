using System;
using System.Collections.Generic;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class SGTeamDeploymentPanel : MonoBehaviour
    {
        private CampaignSession session;
        private SGTeam active;
        private readonly List<string> selected = new List<string>();
        private readonly Dictionary<string, Toggle> boxes = new Dictionary<string, Toggle>();
        private readonly Dictionary<string, Outline> outlines = new Dictionary<string, Outline>();
        private RectTransform members;
        private Text party, status;
        private Button deploy;

        public void Bind(CampaignSession value)
        {
            session = value;
            PrototypeUi.ScrollLabel("Mission briefing", transform, new Vector2(.02f, .23f), new Vector2(.46f, .86f), session.State.Base.Mission.Briefing, 20);
            party = PrototypeUi.ScrollLabel("Deployment team", transform, new Vector2(.02f, .16f), new Vector2(.46f, .22f), "Choose an SG team, then up to four members to deploy.", 18);
            status = PrototypeUi.Label(PrototypeUi.Rect("Deployment status", transform, new Vector2(.02f, 0), new Vector2(.46f, .08f)), "", 16);
            deploy = PrototypeUi.Button("Deploy SG team", transform, new Vector2(.02f, .08f), new Vector2(.42f, .15f), "Assign SG team to mission", new Color(.12f, .35f, .4f), () =>
            {
                try { session.DeployTeam(active?.Id, selected); }
                catch (Exception error) { status.text = error.Message; }
            });
            deploy.interactable = false;
            PrototypeUi.Label(PrototypeUi.Rect("SG team briefing heading", transform, new Vector2(.47f, .87f), new Vector2(.98f, .95f)), "SG teams / choose up to four members", 22);
            var teams = ScrollContent("Available teams", new Vector2(.49f, .76f), new Vector2(.98f, .86f));
            teams.sizeDelta = new Vector2(0, session.State.Teams.Count * 65);
            members = ScrollContent("Team deployment members", new Vector2(.49f, .01f), new Vector2(.98f, .75f));
            int index = 0;
            foreach (var team in session.State.Teams)
            {
                var capacity = session.State.Base.Rooms.Single(r => r.Id == team.RoomId).TeamCapacity;
                var button = PrototypeUi.Button("select-team-" + team.Id, teams, new Vector2(0, 1), Vector2.one,
                    team.Designation + " / " + team.Members.Count + "/" + capacity + " / Ready Room " + team.RoomId,
                    new Color(.12f, .28f, .34f), () => SelectTeam(team));
                PlaceRow(button, index++, 65);
            }
            if(session.State.Teams.Count>0)SelectTeam(session.State.Teams[0]);
        }
        private RectTransform ScrollContent(string name, Vector2 min, Vector2 max)
        {
            var viewport = PrototypeUi.Rect(name, transform, min, max);
            viewport.gameObject.AddComponent<Image>().color = new Color(.08f, .11f, .15f);
            viewport.gameObject.AddComponent<RectMask2D>();
            var content = PrototypeUi.Rect(name + " entries", viewport, new Vector2(0, 1), Vector2.one);
            content.pivot = new Vector2(.5f, 1);
            var scroll = viewport.gameObject.AddComponent<ScrollRect>();
            scroll.viewport = viewport; scroll.content = content; scroll.horizontal = false;
            scroll.movementType = ScrollRect.MovementType.Clamped; scroll.scrollSensitivity = 35;
            return content;
        }
        private static void PlaceRow(Button button, int index, int height)
        {
            var rect = button.GetComponent<RectTransform>();
            rect.offsetMin = new Vector2(2, -(index + 1) * height + 2); rect.offsetMax = new Vector2(-2, -index * height - 2);
        }
        private void SelectTeam(SGTeam team)
        {
            active = team; selected.Clear();
            selected.AddRange(team.Members.Where(id => !Expeditions.IsIncapacitated(session.State, id)).Take(session.State.Base.Mission.MaxPartySize));
            foreach (Transform child in members) { child.gameObject.SetActive(false); Destroy(child.gameObject); }
            boxes.Clear(); outlines.Clear(); members.sizeDelta = new Vector2(0, team.Members.Count * 156);
            int index = 0;
            foreach (var id in team.Members)
            {
                var unit = session.State.Base.Units.Single(u => u.Id == id);
                var button = PrototypeUi.Button("team-unit-" + id, members, new Vector2(0, 1), Vector2.one,
                    PrototypeUi.UnitLabel(unit, session.State.Base.Mission), Color.Lerp(PrototypeUi.ParseColor(unit.Color), Color.black, .6f), () => ToggleMember(id));
                PlaceRow(button, index++, 156);
                button.gameObject.AddComponent<PersonnelCardView>().Bind(session,id);
                var label = button.GetComponentInChildren<Text>(); label.fontSize = 16; label.alignment = TextAnchor.MiddleLeft; label.rectTransform.offsetMin = new Vector2(48, 2);
                var rect = button.GetComponent<RectTransform>();
                var box = PrototypeUi.Rect("Deploy checkbox " + id, rect, new Vector2(0, .5f), new Vector2(0, .5f));
                box.sizeDelta = new Vector2(26, 26); box.anchoredPosition = new Vector2(24, 0);
                var image = box.gameObject.AddComponent<Image>(); image.color = new Color(.85f, .9f, .95f);
                var toggle = box.gameObject.AddComponent<Toggle>(); toggle.targetGraphic = image; toggle.transition = Selectable.Transition.None;
                var mark = PrototypeUi.Label(box, "✓", 22); mark.color = new Color(.06f, .13f, .18f); mark.alignment = TextAnchor.MiddleCenter;
                mark.rectTransform.offsetMin = mark.rectTransform.offsetMax = Vector2.zero;
                toggle.graphic = mark; toggle.onValueChanged.AddListener(_ => ToggleMember(id));
                bool available = !Expeditions.IsIncapacitated(session.State, id);
                toggle.interactable = button.interactable = available; if (!available) image.color = Color.gray;
                boxes.Add(id, toggle);
                var outline = button.gameObject.AddComponent<Outline>(); outline.effectColor = new Color(1, .8f, .2f); outline.effectDistance = new Vector2(2, 2); outlines.Add(id, outline);
            }
            members.parent.GetComponent<ScrollRect>().verticalNormalizedPosition = 1;
            Refresh();
        }
        private void ToggleMember(string id)
        {
            if (selected.Contains(id)) selected.Remove(id);
            else if (selected.Count < session.State.Base.Mission.MaxPartySize) selected.Add(id);
            else { Refresh(); status.text = "At most four deploy. Uncheck a selected member first."; return; }
            Refresh();
        }
        private void Refresh()
        {
            party.text = active.Designation + " / deploying " + selected.Count + "/" + session.State.Base.Mission.MaxPartySize + " / reserves " + (active.Members.Count-selected.Count);
            foreach (var pair in boxes) { pair.Value.SetIsOnWithoutNotify(selected.Contains(pair.Key)); outlines[pair.Key].enabled = selected.Contains(pair.Key); }
            var readiness = DeploymentReadiness.Inspect(session.State, selected, active.Id);
            deploy.interactable = readiness.CanDeploy; status.text = readiness.Message;
        }
    }
}
