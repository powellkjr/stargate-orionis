using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
using System.Linq;
using System.Collections.Generic;

namespace Orionis.Presentation
{
    public sealed class RosterView : MonoBehaviour
    {
        private CampaignSession session;
        private readonly Dictionary<string, Text> labels = new Dictionary<string, Text>();
        public void Bind(CampaignSession value)
        {
            session = value;
            var data = session.State.Base; var selection = session.Selection;
            PrototypeUi.Label(PrototypeUi.Rect("Heading", transform, new Vector2(0, .9f), Vector2.one), "Personnel", 26);
            var viewport = PrototypeUi.Rect("Roster viewport", transform, new Vector2(.02f, .02f), new Vector2(.98f, .89f));
            viewport.gameObject.AddComponent<Image>().color = new Color(.08f, .11f, .15f);
            viewport.gameObject.AddComponent<Mask>().showMaskGraphic = true;
            var content = PrototypeUi.Rect("Roster entries", viewport, new Vector2(0, 1), Vector2.one);
            content.pivot = new Vector2(.5f, 1);
            content.sizeDelta = new Vector2(0, data.Units.Count * 78);
            var scroll = viewport.gameObject.AddComponent<ScrollRect>();
            scroll.viewport = viewport; scroll.content = content; scroll.horizontal = false;
            scroll.movementType = ScrollRect.MovementType.Clamped; scroll.scrollSensitivity = 30;
            for (int i = 0; i < data.Units.Count; i++)
            {
                var unit = data.Units[i];
                var button = PrototypeUi.Button(unit.Id, content, new Vector2(0, 1), Vector2.one,
                    unit.Name + "\n" + unit.Profession + " " + unit.Tier,
                    Color.Lerp(PrototypeUi.ParseColor(unit.Color), Color.black, .6f), () => selection.SelectUnit(unit.Id));
                button.gameObject.AddComponent<SelectionOutline>().Bind(selection, SelectionKind.Unit, unit.Id);
                var rect = button.GetComponent<RectTransform>();
                rect.offsetMin = new Vector2(2, -(i + 1) * 78 + 2); rect.offsetMax = new Vector2(-2, -i * 78 - 2);
                var label = button.GetComponentInChildren<Text>(); label.fontSize = 16;
                labels.Add(unit.Id, label);
            }
            session.StaffingChanged += Refresh;
            Refresh();
        }
        private void Refresh()
        {
            foreach (var unit in session.State.Base.Units)
            {
                var assignment = session.State.Assignments.FirstOrDefault(a => a.UnitId == unit.Id);
                var team = SGTeams.ForUnit(session.State, unit.Id);
                var room = Orionis.Domain.Expeditions.IsDeployed(session.State, unit.Id) ? "Offworld" : team != null ? team.Designation + " / Ready Room" : assignment == null ? "Unassigned" : session.State.Base.Rooms.First(r => r.Id == assignment.RoomInstanceId).Definition.Name;
                labels[unit.Id].text = PrototypeUi.UnitLabel(unit, session.State.Base.Mission) + "\n" + room;
            }
        }
        private void OnDestroy() { if (session != null) session.StaffingChanged -= Refresh; }
    }
}
