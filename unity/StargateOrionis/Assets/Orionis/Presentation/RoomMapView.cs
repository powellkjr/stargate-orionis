using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using System.Linq;

namespace Orionis.Presentation
{
    public sealed class RoomMapView : MonoBehaviour
    {
        private CampaignSession session;
        private readonly Dictionary<string, Text> labels = new Dictionary<string, Text>();
        public void Bind(CampaignSession value, System.Action<string> openReadyRoom = null, System.Action<string> openEquipment = null, System.Action openPlanning = null)
        {
            session = value;
            var data = session.State.Base; var selection = session.Selection;
            var heading = PrototypeUi.Label(PrototypeUi.Rect("Heading", transform, new Vector2(0, .9f), Vector2.one), data.BaseName, 22);
            var caption = PrototypeUi.Label(PrototypeUi.Rect("Caption", transform, new Vector2(0, .81f), new Vector2(openPlanning == null ? 1 : .70f, .9f)),
                "SGC / room layout — select a footprint to inspect it.", 14);
            foreach (var text in new[] { heading, caption })
            { text.rectTransform.offsetMin = new Vector2(8, 2); text.rectTransform.offsetMax = new Vector2(-8, -2); }
            if (openPlanning != null) PrototypeUi.Button("Open base planning", transform, new Vector2(.70f, .81f), new Vector2(.99f, .9f),
                "Base planning", new Color(.12f, .3f, .36f), () => openPlanning()).GetComponentInChildren<Text>().fontSize = 14;
            var board = PrototypeUi.Rect("Room grid", transform, new Vector2(.02f, .05f), new Vector2(.98f, .8f));
            // Frame occupied authored cells with a one-cell margin; retain physical geometry and coordinates.
            int left = Mathf.Max(0, data.Rooms.Min(r => r.Col) - 1), top = Mathf.Max(0, data.Rooms.Min(r => r.Row) - 1);
            int right = Mathf.Min(12, data.Rooms.Max(r => r.Col + r.Definition.Width) + 1);
            int bottom = Mathf.Min(10, data.Rooms.Max(r => r.Row + r.Definition.Height) + 1);
            float columns = right - left, rows = bottom - top;
            var aspect = board.gameObject.AddComponent<UnityEngine.UI.AspectRatioFitter>();
            aspect.aspectMode = UnityEngine.UI.AspectRatioFitter.AspectMode.FitInParent; aspect.aspectRatio = columns / rows;
            foreach (var room in data.Rooms)
            {
                var min = new Vector2((room.Col - left) / columns, 1f - (room.Row - top + room.Definition.Height) / rows);
                var max = new Vector2((room.Col - left + room.Definition.Width) / columns, 1f - (room.Row - top) / rows);
                var button = PrototypeUi.Button(room.Id, board, min, max, room.Definition.Name,
                    PrototypeUi.ParseColor(room.Definition.Color), () => { selection.SelectRoom(room.Id); if (room.Definition.TeamSlots > 0) openReadyRoom?.Invoke(room.Id); else if (data.Storage?.Find(room.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("EQ")) == true) openEquipment?.Invoke(room.Id); });
                button.gameObject.AddComponent<SelectionOutline>().Bind(selection, SelectionKind.Room, room.Id);
                var label = button.GetComponentInChildren<Text>();
                label.fontSize = room.Definition.Width > 1 ? 20 : 11;
                labels.Add(room.Id, label);
            }
            session.StaffingChanged += Refresh;
            Refresh();
        }
        private void Refresh()
        {
            foreach (var room in session.State.Base.Rooms)
            {
                // An outgoing canvas may receive one final event before Unity destroys it.
                if (!labels.ContainsKey(room.Id)) continue;
                int reserved = session.State.Transfers.Count(t => t.DestinationRoomId == room.Id);
                if (room.Definition.TeamSlots > 0)
                {
                    var team = session.State.Teams.SingleOrDefault(t => t.RoomId == room.Id);
                    labels[room.Id].text = "Ready Room\n" + (team?.Designation ?? "Create SG team") + "\n" + (team?.Members.Count ?? 0) + "/" + room.TeamCapacity;
                    continue;
                }
                if (session.State.Base.Storage?.Find(room.Definition.Id) != null)
                {
                    labels[room.Id].text = room.Definition.Name + (room.StaffingCapacity > 0 ? "\nStaff " + session.State.Assignments.Count(a => a.RoomInstanceId == room.Id) + "/" + room.StaffingCapacity : "");
                    continue;
                }
                labels[room.Id].text = room.Definition.Name + (room.StaffingCapacity > 0 ? "\n" + session.State.Assignments.Count(a => a.RoomInstanceId == room.Id) + "/" + room.StaffingCapacity : "") +
                    (reserved > 0 ? "\n+" + reserved + " reserved" : "");
            }
        }
        private void OnDestroy() { if (session != null) session.StaffingChanged -= Refresh; }
    }
}
