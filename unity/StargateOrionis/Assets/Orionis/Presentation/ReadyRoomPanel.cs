using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class ReadyRoomPanel : MonoBehaviour
    {
        private CampaignSession session;
        private string roomId;
        private Action close;
        private string message = "Choose permanent members up to this room's capacity; at most four deploy. Assigned Units must first be unassigned from their ordinary room.";
        public void Bind(CampaignSession value, string room, Action back)
        { session = value; roomId = room; close = back; session.TeamsChanged += Render; Render(); }
        private void Run(Action action)
        { try { action(); message = "Team configuration updated. Save preserves it."; } catch (Exception e) { message = e.Message; } Render(); }
        private void Render()
        {
            foreach (Transform child in transform) { child.gameObject.SetActive(false); Destroy(child.gameObject); }
            var team = session.State.Teams.SingleOrDefault(t => t.RoomId == roomId);
            var offworld = team != null && SGTeams.Offworld(session.State, team.Id);
            PrototypeUi.Label(PrototypeUi.Rect("Ready Room heading", transform, new Vector2(.02f, .86f), new Vector2(.7f, 1)), "SG Team Ready Room / " + roomId, 28);
            PrototypeUi.Button("Close Ready Room", transform, new Vector2(.78f, .89f), new Vector2(.98f, .98f), "Back to base", new Color(.15f, .23f, .3f), () => close());
            var inputObject = DefaultControls.CreateInputField(new DefaultControls.Resources()); inputObject.name = "Team designation";
            var inputRect = inputObject.GetComponent<RectTransform>(); inputRect.SetParent(transform, false);
            inputRect.anchorMin = new Vector2(.02f, .73f); inputRect.anchorMax = new Vector2(.39f, .83f); inputRect.offsetMin = inputRect.offsetMax = Vector2.zero;
            var input = inputObject.GetComponent<InputField>(); input.textComponent.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            input.textComponent.fontSize = 22; input.characterLimit = 40; input.text = team?.Designation ?? "SG-1"; input.interactable = !offworld;
            if (input.placeholder is Text placeholder) { placeholder.font = input.textComponent.font; placeholder.text = "Team designation"; }
            PrototypeUi.Button(team == null ? "Create SG team" : "Rename SG team", transform, new Vector2(.02f, .61f), new Vector2(.39f, .71f),
                team == null ? "Create team" : "Save designation", new Color(.12f, .35f, .4f), () => Run(() =>
                { if (team == null) session.CreateTeam(roomId, input.text); else session.RenameTeam(team.Id, input.text); })).interactable = !offworld;
            var capacity = session.State.Base.Rooms.Single(r => r.Id == roomId).TeamCapacity;
            var text = team == null ? "One team / " + capacity + " permanent member slots.\nAt most four deploy. Create the team, then choose members." : team.Designation + " / " + team.Members.Count + "/" + capacity + "\n" + (offworld ? "Offworld — membership locked" : "Home Ready Room") + "\n\n" +
                string.Join("\n\n", team.Members.Select((id, i) => (i + 1) + ". " + PrototypeUi.UnitLabel(session.State.Base.Units.Single(u => u.Id == id), session.State.Base.Mission) + "\n" + PrototypeUi.EquipmentLabel(session.State, id)));
            PrototypeUi.ScrollLabel("SG team members", transform, new Vector2(.02f, .15f), new Vector2(.4f, .6f), text, 17);
            PrototypeUi.Label(PrototypeUi.Rect("SG team status", transform, new Vector2(.02f, .01f), new Vector2(.4f, .14f)), message, 16);
            var viewport = PrototypeUi.Rect("Team roster", transform, new Vector2(.43f, .02f), new Vector2(.98f, .85f));
            viewport.gameObject.AddComponent<Image>().color = new Color(.08f, .11f, .15f); viewport.gameObject.AddComponent<Mask>().showMaskGraphic = true;
            var content = PrototypeUi.Rect("Team roster entries", viewport, new Vector2(0, 1), Vector2.one); content.pivot = new Vector2(.5f, 1);
            content.sizeDelta = new Vector2(0, session.State.Base.Units.Count * 90);
            var scroll = viewport.gameObject.AddComponent<ScrollRect>(); scroll.viewport = viewport; scroll.content = content; scroll.horizontal = false; scroll.scrollSensitivity = 35; scroll.movementType = ScrollRect.MovementType.Clamped;
            int index = 0;
            foreach (var unit in session.State.Base.Units)
            {
                var member = team?.Members.Contains(unit.Id) == true; var owner = SGTeams.ForUnit(session.State, unit.Id);
                var assigned = session.State.Assignments.FirstOrDefault(a => a.UnitId == unit.Id);
                bool available = team != null && !offworld && (member || owner == null && assigned == null && !session.State.Transfers.Any(t => t.UnitId == unit.Id) &&
                    !Expeditions.IsDeployed(session.State, unit.Id) && !Expeditions.IsIncapacitated(session.State, unit.Id));
                var row = PrototypeUi.Button("team-unit-" + unit.Id, content, new Vector2(0, 1), Vector2.one,
                    PrototypeUi.UnitLabel(unit, session.State.Base.Mission) + "\n" + (owner?.Designation ?? (Expeditions.IsDeployed(session.State, unit.Id) ? "Offworld" : assigned == null ? "Available" : "Assigned to " + assigned.RoomInstanceId)),
                    Color.Lerp(PrototypeUi.ParseColor(unit.Color), Color.black, .6f), () => Run(() => session.SetTeamMember(team.Id, unit.Id, !member)));
                var r = row.GetComponent<RectTransform>(); r.offsetMin = new Vector2(2, -(index + 1) * 90 + 2); r.offsetMax = new Vector2(-2, -index * 90 - 2); index++;
                row.interactable = available; var label = row.GetComponentInChildren<Text>(); label.fontSize = 16; label.alignment = TextAnchor.MiddleLeft; label.rectTransform.offsetMin = new Vector2(50, 2); label.color = available ? Color.white : Color.gray;
                var box = PrototypeUi.Rect("Team member " + unit.Id, row.transform, new Vector2(0, .5f), new Vector2(0, .5f)); box.sizeDelta = new Vector2(26, 26); box.anchoredPosition = new Vector2(26, 0);
                var background = box.gameObject.AddComponent<Image>(); background.color = available ? Color.white : Color.gray;
                var toggle = box.gameObject.AddComponent<Toggle>(); toggle.targetGraphic = background; toggle.transition = Selectable.Transition.None;
                var mark = PrototypeUi.Label(box, "✓", 22); mark.alignment = TextAnchor.MiddleCenter; mark.color = new Color(.05f, .12f, .16f); mark.rectTransform.offsetMin = mark.rectTransform.offsetMax = Vector2.zero;
                toggle.graphic = mark; toggle.SetIsOnWithoutNotify(member); toggle.interactable = available;
                toggle.onValueChanged.AddListener(value => Run(() => session.SetTeamMember(team.Id, unit.Id, value)));
                if (member) { var outline = row.gameObject.AddComponent<Outline>(); outline.effectColor = new Color(1, .84f, .3f); outline.effectDistance = new Vector2(2, -2); }
            }
        }
        private void OnDestroy() { if (session != null) session.TeamsChanged -= Render; }
    }
}
