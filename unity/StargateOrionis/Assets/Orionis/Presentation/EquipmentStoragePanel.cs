using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class EquipmentStoragePanel : MonoBehaviour
    {
        private CampaignSession session;
        private string roomId, tabId, selected;
        private Action close;
        private bool showIssued;
        private string message = "Stored equipment is separate from equipment carried by Units.";
        public void Bind(CampaignSession value, string room, Action back)
        {
            session = value; roomId = room; close = back;
            session.ReceivingChanged += Render; session.TeamsChanged += Render; session.MissionChanged += Render;
            Render();
        }
        private StorageTab Tab(RecoveredItem item, RoomStorageProfile profile) => profile.Tabs.FirstOrDefault(t =>
            session.State.Base.Processing.EquipmentTabTags.TryGetValue(t.Id, out var tag) && CargoExamination.Known(session.State, item).Contains(tag));
        private void Render()
        {
            foreach (Transform child in transform) { child.gameObject.SetActive(false); Destroy(child.gameObject); }
            var s = session.State; var room = s.Base.Rooms.Single(r => r.Id == roomId);
            var profile = s.Base.Storage.Find(room.Definition.Id);
            var tabs = profile.Tabs.Where(t => t.Classes.Contains("EQ")).ToList();
            var tab = tabs.FirstOrDefault(t => t.Id == tabId) ?? tabs.First(); tabId = tab.Id;
            PrototypeUi.Label(PrototypeUi.Rect("Equipment heading", transform, new Vector2(.02f, .88f), new Vector2(.77f, 1)), room.Definition.Name + " " + room.Id, 26);
            PrototypeUi.Button("Close equipment inventory", transform, new Vector2(.8f, .9f), new Vector2(.98f, .98f), "Back to base", new Color(.12f, .3f, .36f), () => close());
            int index = 0;
            foreach (var choice in tabs)
            {
                var id = choice.Id;
                PrototypeUi.Button("equipment-tab-" + id, transform, new Vector2(.02f + index * .2f, .78f), new Vector2(.21f + index * .2f, .87f), choice.Label,
                    id == tabId ? new Color(.23f, .4f, .42f) : new Color(.12f, .25f, .3f), () => { tabId = id; selected = null; Render(); }); index++;
            }
            PrototypeUi.Button("Toggle issued equipment", transform, new Vector2(.47f, .78f), new Vector2(.75f, .87f), showIssued ? "Show stored equipment" : "Show equipped items", new Color(.12f, .3f, .36f), () => { showIssued = !showIssued; selected = null; Render(); });
            var allocated = s.Cargo.Where(i => i.RoomId == roomId && Tab(i, profile)?.Id == tabId).ToList();
            var capacityAllocated = profile.SharedItemCapacity ? s.Cargo.Where(i => i.RoomId == roomId).ToList() : allocated;
            var items = allocated.Where(i => showIssued ? i.EquippedUnitId != null : i.EquippedUnitId == null).ToList();
            var catalog = RecoveredCargo.Catalog(s);
            long used = capacityAllocated.Sum(i => { var d = catalog.Incoming.Single(a => a.Id == i.Id); return (long)d.HandlingCost * d.Quantity; });
            PrototypeUi.Label(PrototypeUi.Rect("Equipment capacity", transform, new Vector2(.02f, .68f), new Vector2(.44f, .78f)), (profile.SharedItemCapacity ? "All equipment tabs" : tab.Label) + ": " + used + "/" + tab.CapacityByTier[room.ConstructionTier] + " allocated (" + allocated.Count(i => i.EquippedUnitId != null) + " equipped)", 16);
            var viewport = PrototypeUi.Rect("Stored equipment list", transform, new Vector2(.02f, .15f), new Vector2(.44f, .68f));
            viewport.gameObject.AddComponent<Image>().color = new Color(.07f, .1f, .14f); viewport.gameObject.AddComponent<RectMask2D>();
            var content = PrototypeUi.Rect("Stored equipment entries", viewport, new Vector2(0, 1), Vector2.one);
            content.pivot = new Vector2(.5f, 1); content.sizeDelta = new Vector2(0, Math.Max(1, items.Count) * 75);
            var scroll = viewport.gameObject.AddComponent<ScrollRect>(); scroll.viewport = viewport; scroll.content = content; scroll.horizontal = false; scroll.scrollSensitivity = 35; scroll.movementType = ScrollRect.MovementType.Clamped;
            for (int n = 0; n < items.Count; n++)
            {
                var item = items[n]; var button = PrototypeUi.Button("equipment-item-" + item.Id, content, new Vector2(0, 1), Vector2.one,
                    RecoveredCargo.Name(s, item) + "\n" + CargoHandling.Condition(s, item), item.Id == selected ? new Color(.23f, .4f, .42f) : new Color(.12f, .25f, .3f), () => { selected = item.Id; Render(); });
                var rect = button.GetComponent<RectTransform>(); rect.offsetMin = new Vector2(2, -(n + 1) * 75 + 2); rect.offsetMax = new Vector2(-2, -n * 75 - 2);
            }
            if (items.Count == 0) PrototypeUi.Label(content, showIssued ? "No equipped items in this tab." : "No stored equipment in this tab. Accept a fully identified object into Equipment Storage first.", 17);
            var chosen = items.FirstOrDefault(i => i.Id == selected);
            if (chosen != null)
            {
                var d = catalog.Incoming.Single(i => i.Id == chosen.Id);
                var stats = UnitEquipment.Profile(s, chosen.Id);
                var holder = s.Base.Units.FirstOrDefault(u => u.Id == chosen.EquippedUnitId);
                PrototypeUi.ScrollLabel("Stored equipment details", transform, new Vector2(.47f, .48f), new Vector2(.98f, .77f),
                    RecoveredCargo.Name(s, chosen) + "\nCondition: " + CargoHandling.Condition(s, chosen) + "\nQuantity: " + d.Quantity +
                    "\nInstance: " + chosen.Id + "\nKnown properties: " + string.Join(", ", CargoExamination.Known(s, chosen)) + "\nAssigned storage: " + room.Definition.Name + " " + room.Id + "\nCustody: " + (holder == null ? "In storage" : holder.Name + " / equipped") + (stats == null ? "" : "\n" + (stats.Slot == "weapon" ? "Damage per round: " + stats.Damage : "Damage absorbed per hit: " + stats.Protection)), 18);
                int n = 0;
                if (chosen.EquippedUnitId == null)
                foreach (var destination in s.Base.Rooms.Where(r => s.Base.Storage.Find(r.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("CC")) == true || r.Definition.Id == s.Base.Handling.OrdinaryStorageDefinitionId))
                {
                    string blocked = null; try { RecoveredCargo.CheckStorageTransfer(s, chosen.Id, destination.Id); } catch (InvalidOperationException error) { blocked = error.Message; }
                    var button = PrototypeUi.Button("equipment-move-" + destination.Id, transform, new Vector2(.47f, .33f - n * .11f), new Vector2(.98f, .43f - n * .11f), "Assign storage: " + destination.Definition.Name + " / 1 tick" + (blocked == null ? "" : "\n" + blocked), new Color(.12f, .3f, .36f), () => Run(() => session.MoveCargo(chosen.Id, destination.Id)));
                    button.interactable = blocked == null; n++;
                }
                if (holder != null)
                {
                    var button = PrototypeUi.Button("Return equipped item", transform, new Vector2(.47f, .33f), new Vector2(.98f, .43f), "Return custody to Equipment Storage", new Color(.12f, .3f, .36f), () => Run(() => { session.ReturnEquipment(chosen.Id, roomId); showIssued = false; }));
                    button.interactable = !Expeditions.IsDeployed(s, holder.Id);
                    if (!button.interactable) message = "This Unit is offworld. Return equipment after extraction.";
                }
                else
                {
                    var issue = PrototypeUi.Button("Choose equipment recipient", transform, new Vector2(.47f, .11f), new Vector2(.98f, .21f), "Issue " + (stats?.Slot ?? "equipment") + " to a Unit", new Color(.16f, .35f, .3f), () => ChooseUnit(chosen.Id));
                    issue.interactable = stats != null;
                }
            }
            PrototypeUi.Label(PrototypeUi.Rect("Equipment inventory status", transform, new Vector2(.02f, 0), new Vector2(.98f, .13f)), message, 16);
        }
        private void ChooseUnit(string id)
        {
            var s = session.State;
            var panel = PrototypeUi.Rect("Choose equipment recipient", transform, new Vector2(.46f, .14f), new Vector2(.99f, .87f));
            panel.gameObject.AddComponent<Image>().color = new Color(.07f, .12f, .16f);
            PrototypeUi.Label(PrototypeUi.Rect("Equipment recipient heading", panel, new Vector2(0, .88f), Vector2.one), "Choose a Unit / SG teams first", 20);
            PrototypeUi.Button("Cancel equipment issue", panel, new Vector2(.75f, .9f), Vector2.one, "Back", new Color(.12f, .3f, .36f), () => { panel.gameObject.SetActive(false); Destroy(panel.gameObject); });
            var viewport = PrototypeUi.Rect("Equipment recipients", panel, Vector2.zero, new Vector2(1, .88f));
            viewport.gameObject.AddComponent<Image>().color = new Color(.07f, .12f, .16f); viewport.gameObject.AddComponent<RectMask2D>();
            var units = s.Base.Units.OrderBy(u => SGTeams.ForUnit(s, u.Id) == null ? 1 : 0).ThenBy(u => u.Name).ToList();
            var content = PrototypeUi.Rect("Equipment recipient entries", viewport, new Vector2(0, 1), Vector2.one);
            content.pivot = new Vector2(.5f, 1); content.sizeDelta = new Vector2(0, units.Count * 140);
            var scroll = viewport.gameObject.AddComponent<ScrollRect>(); scroll.viewport = viewport; scroll.content = content; scroll.horizontal = false; scroll.scrollSensitivity = 35; scroll.movementType = ScrollRect.MovementType.Clamped;
            for (int n = 0; n < units.Count; n++)
            {
                var unit = units[n]; string blocked = null;
                try { UnitEquipment.Issue(s, id, unit.Id); } catch (InvalidOperationException error) { blocked = error.Message; }
                var team = SGTeams.ForUnit(s, unit.Id);
                var label = (team == null ? "Base personnel" : team.Designation) + " / " + PrototypeUi.UnitLabel(unit, s.Base.Mission) + "\n" + PrototypeUi.EquipmentLabel(s, unit.Id);
                if (blocked != null) label += "\n" + blocked;
                var button = PrototypeUi.Button("issue-equipment-" + unit.Id, content, new Vector2(0, 1), Vector2.one, label, new Color(.12f, .3f, .36f), () => Run(() => { session.IssueEquipment(id, unit.Id); showIssued = true; }));
                button.interactable = blocked == null; button.GetComponentInChildren<Text>().fontSize = 14;
                var rect = button.GetComponent<RectTransform>(); rect.offsetMin = new Vector2(2, -(n + 1) * 140 + 2); rect.offsetMax = new Vector2(-2, -n * 140 - 2);
            }
        }
        private void Run(Action action)
        { try { action(); message = "Equipment custody updated. Save preserves it."; } catch (Exception error) { message = error.Message; } Render(); }
        private void OnDestroy()
        {
            if (session == null) return;
            session.ReceivingChanged -= Render; session.TeamsChanged -= Render; session.MissionChanged -= Render;
        }
    }
}
