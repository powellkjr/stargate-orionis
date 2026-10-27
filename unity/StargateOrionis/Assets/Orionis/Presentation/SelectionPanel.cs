using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
using System.Linq;

namespace Orionis.Presentation
{
    public sealed class SelectionPanel : MonoBehaviour
    {
        private SelectionService selection;
        private CampaignSession session;
        private Text title, description;
        private Text storageInfo;
        private GameObject staffingControls;
        private Button inventory;
        public void Bind(CampaignSession value, System.Action<string> openInventory = null)
        {
            if (selection != null) selection.Changed -= Render;
            session = value; selection = session.Selection;
            title = PrototypeUi.Label(PrototypeUi.Rect("Title", transform, new Vector2(0, .88f), Vector2.one), "Inspect", 26);
            description = PrototypeUi.Label(PrototypeUi.Rect("Details", transform, new Vector2(0, .54f), new Vector2(1, .88f)),
                "Select a room or roster entry.", 16);
            var staffing = PrototypeUi.Rect("Staffing controls", transform, Vector2.zero, new Vector2(1, .54f));
            staffingControls = staffing.gameObject;
            staffing.gameObject.AddComponent<StaffingPanel>().Bind(session);
            storageInfo = PrototypeUi.Label(PrototypeUi.Rect("Storage room information", transform, Vector2.zero, new Vector2(1, .54f)), "", 16);
            storageInfo.gameObject.SetActive(false);
            if(openInventory != null)
            {
                description.rectTransform.anchorMin = new Vector2(0,.62f);
                inventory = PrototypeUi.Button("Open selected room inventory",transform,new Vector2(.02f,.55f),new Vector2(.98f,.61f),"Open room inventory",new Color(.12f,.3f,.36f),()=>openInventory(selection.Current.Id));
                inventory.GetComponentInChildren<Text>().fontSize=14;
                inventory.gameObject.SetActive(false);
            }
            selection.Changed += Render;
            session.StaffingChanged += Refresh; session.TickCommitted += Tick;
            if (selection.Current != null) Render(selection.Current);
        }
        private void Render(SelectionDetails details)
        {
            title.text = details.Title; description.text = details.Description;
            storageInfo.gameObject.SetActive(false); staffingControls.SetActive(true);
            if(inventory != null)inventory.gameObject.SetActive(details.Kind == SelectionKind.Room && (session.State.Base.Storage?.Find(session.State.Base.Rooms.First(r=>r.Id==details.Id).Definition.Id) != null || session.State.Base.Rooms.First(r=>r.Id==details.Id).Definition.Id == session.State.Base.Processing?.RoomDefinitionId || RecoveredCargo.Catalog(session.State).Rooms.Any(p=>p.DefinitionId==session.State.Base.Rooms.First(r=>r.Id==details.Id).Definition.Id && p.Capabilities.Contains(RecoveredCargo.Catalog(session.State).RequiredCapability))));
            if (details.Kind == SelectionKind.Room)
            {
                var room = session.State.Base.Rooms.First(r => r.Id == details.Id);
                var assigned = session.State.Assignments.Where(a => a.RoomInstanceId == details.Id).ToList();
                if (room.StaffingCapacity > 0) description.text += $"\n\nStaff {assigned.Count}/{room.StaffingCapacity}";
                int reserved = session.State.Transfers.Count(t => t.DestinationRoomId == room.Id);
                if (reserved > 0) description.text += $" / {reserved} reserved";
                foreach (var entry in assigned) description.text += "\n" + session.State.Base.Units.First(u => u.Id == entry.UnitId).Name;
                var profile = session.State.Base.Storage?.Find(room.Definition.Id);
                if (profile != null && room.StaffingCapacity > 0)
                    description.text += "\nStored items: " + session.State.Cargo.Count(i => i.RoomId == room.Id) + "\nContainment provides storage; send items to a staffed Analysis lab to examine unknown properties.";
                if (profile != null && room.StaffingCapacity == 0)
                {
                    staffingControls.SetActive(false); storageInfo.gameObject.SetActive(true);
                    storageInfo.text = "Stores: " + string.Join(", ", profile.Categories) + "\n\n" +
                        (profile.Tabs.Count == 0 ? (room.Definition.Id == "warehouse" ? "Configured item places: " : "Configured bulk capacity: ") + profile.CapacityByTier[room.ConstructionTier] :
                            string.Join("\n", profile.Tabs.Select(t => t.Label + " (" + string.Join(", ", t.Classes) + "): " + t.CapacityByTier[room.ConstructionTier]))) +
                        "\n\nValidated storage stays reserved during work or Unit custody. Containment is storage only; examination requires a staffed Analysis lab.\nEquipment Storage accepts fully identified, intact equipment.\nReserved item places here: " + session.State.Cargo.Count(i => i.RoomId == room.Id);
                }
            }
            else
            {
                var assigned = session.State.Assignments.FirstOrDefault(a => a.UnitId == details.Id);
                description.text += "\n" + PrototypeUi.EquipmentLabel(session.State, details.Id);
                if (session.State.Personnel.Any(p => p.UnitId == details.Id))
                    description.text += "\nCampaign health: " + Orionis.Domain.PersonnelCondition.Health(session.State, details.Id) +
                        "\n" + string.Join(" / ", Orionis.Domain.PersonnelCondition.Tools(session.State, details.Id).Select(t => t.Label + ": " + t.Charges + " charges"));
                var team = Orionis.Domain.SGTeams.ForUnit(session.State, details.Id);
                description.text += "\n\n" + (Orionis.Domain.Expeditions.IsDeployed(session.State, details.Id) ? "Offworld — unavailable for base staffing" :
                    team != null ? "SG team: " + team.Designation + " / Ready Room " + team.RoomId : assigned == null ? "Unassigned" : "Assigned: " + session.State.Base.Rooms.First(r => r.Id == assigned.RoomInstanceId).Definition.Name);
                if (session.State.Expedition?.Returned == true && session.State.Expedition.Party.Any(u => u.UnitId == details.Id))
                {
                    var member = session.State.Expedition.Party.Single(u => u.UnitId == details.Id);
                    description.text += "\nReturned health: " + PersonnelCondition.Health(session.State,details.Id) +
                        "\n" + string.Join(" / ", member.Tools.Select(t => t.Label + ": " + t.Charges + " charges"));
                }
            }
        }
        private void Tick(long _) => Refresh();
        private void Refresh() { if (selection.Current != null) Render(selection.Current); }
        private void OnDestroy()
        {
            if (selection != null) selection.Changed -= Render;
            if (session != null) { session.StaffingChanged -= Refresh; session.TickCommitted -= Tick; }
        }
    }
}
