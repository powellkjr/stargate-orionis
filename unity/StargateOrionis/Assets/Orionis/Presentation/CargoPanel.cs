using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class CargoPanel : MonoBehaviour
    {
        private CampaignSession session;
        private Action close;
        private bool showDebug;
        private string selected, roomFilter, message = "Inventory spans all locations. Choose a room tab to see its current custody.";
        public void Bind(CampaignSession value, Action back, bool debugControls = true, string roomId = null)
        { session = value; close = back; showDebug = debugControls; roomFilter = roomId; session.ReceivingChanged += Render; session.TickCommitted += Tick; session.StaffingChanged += Render; Render(); }
        private void Tick(long _) => Render();
        private void Run(Action action, string success = "Item state updated. Save preserves it.")
        { try { action(); message = success; } catch (Exception e) { message = e.Message; } Render(); }
        private void Render()
        {
            foreach (Transform c in transform) { c.gameObject.SetActive(false); Destroy(c.gameObject); }
            var rooms = session.State.Base.Rooms.Where(r => session.State.Base.Storage?.Find(r.Definition.Id) != null || r.Definition.Id == session.State.Base.Processing?.RoomDefinitionId || RecoveredCargo.Catalog(session.State).Rooms.Any(p => p.DefinitionId == r.Definition.Id && p.Capabilities.Contains(RecoveredCargo.Catalog(session.State).RequiredCapability))).ToList();
            // Tabs are physical custody views, never a second inventory or a storage transfer.
            var tabs = new[] { (Id: (string)null, Label: "All locations"), (Id: "incoming", Label: "Incoming") }
                .Concat(rooms.Where(r => session.State.Cargo.Any(i => i.RoomId == r.Id || i.CustodyRoomId == r.Id) || r.Definition.Id == session.State.Base.Processing?.RoomDefinitionId || r.Definition.Id == session.State.Base.Handling?.OrdinaryStorageDefinitionId || session.State.Base.Storage?.Find(r.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("CC") || t.Classes.Contains("EQ")) == true || RecoveredCargo.Catalog(session.State).Rooms.Any(p => p.DefinitionId == r.Definition.Id && p.Capabilities.Contains(RecoveredCargo.Catalog(session.State).RequiredCapability)))
                .Select(r => (Id: r.Id, Label: r.Definition.Name))).ToList();
            string locationTitle = roomFilter == null ? "All locations" : roomFilter == "incoming" ? "Incoming inventory" : session.State.Base.Rooms.Single(r => r.Id == roomFilter).Definition.Name + " " + roomFilter;
            PrototypeUi.Label(PrototypeUi.Rect("Cargo heading", transform, new Vector2(.02f, .88f), new Vector2(.78f, 1)), "Base inventory / " + locationTitle, 24);
            PrototypeUi.Button("Close recovered cargo", transform, new Vector2(.8f, .9f), new Vector2(.98f, .98f), "Back to base", new Color(.12f, .3f, .36f), () => close());
            bool Visible(RecoveredItem i) => roomFilter == null || roomFilter == "incoming" && i.CustodyRoomId == null && i.EquippedUnitId == null || i.CustodyRoomId == roomFilter;
            for (int t = 0; t < tabs.Count; t++)
            {
                var tab = tabs[t];
                int count = session.State.Cargo.Count(i => tab.Id == null || tab.Id == "incoming" && i.CustodyRoomId == null && i.EquippedUnitId == null || i.CustodyRoomId == tab.Id);
                int reserved = tab.Id == null ? 0 : session.State.Cargo.Count(i => i.RoomId == tab.Id);
                var button = PrototypeUi.Button("cargo-room-" + (tab.Id ?? "all"), transform, new Vector2(.02f + t * .96f / tabs.Count, .78f), new Vector2(.02f + (t+1) * .96f / tabs.Count - .004f, .87f), tab.Label + "\n" + count + " here" + (reserved > count ? " / " + reserved + " reserved" : ""), roomFilter == tab.Id ? new Color(.23f,.4f,.42f) : new Color(.12f,.25f,.3f), () => { roomFilter = tab.Id; selected = null; Render(); });
                button.GetComponentInChildren<Text>().fontSize = 13;
            }
            int index = 0;
            foreach (var i in session.State.Cargo.Where(Visible))
            {
                var location = i.EquippedUnitId == null ? (i.CustodyRoomId == null ? "Incoming inventory" : session.State.Base.Rooms.Single(r => r.Id == i.CustodyRoomId).Definition.Name) : "Equipped / " + session.State.Base.Units.Single(u => u.Id == i.EquippedUnitId).Name;
                PrototypeUi.Button("cargo-" + i.Id, transform, new Vector2(.02f, .58f - index * .15f), new Vector2(.38f, .72f - index * .15f),
                    RecoveredCargo.Name(session.State, i) + "\n" + location, i.Id == selected ? new Color(.23f, .4f, .42f) : new Color(.12f, .25f, .3f), () => { selected = i.Id; Render(); }); index++;
            }
            if (index == 0) PrototypeUi.Label(PrototypeUi.Rect("No recovered cargo", transform, new Vector2(.02f, .48f), new Vector2(.98f, .72f)), session.State.Cargo.Count == 0 ? "No physical cargo recovered. Discover recoverable objects and choose them at the mission debrief." : "No items currently in custody here. Storage reservations remain with the assigned storage room while items are away.", 20);
            var item = session.State.Cargo.SingleOrDefault(i => i.Id == selected && Visible(i));
            if (item != null)
            {
                var catalog = RecoveredCargo.Catalog(session.State); var d = catalog.Incoming.Single(x => x.Id == item.Id);
                var order = session.State.Receiving.SingleOrDefault(o => o.InstanceId == item.Id);
                var complete = order != null && ReceivingWork.IsComplete(catalog, order);
                var text = RecoveredCargo.Name(session.State, item) +
                    "\nIntake: " + (complete ? "Complete (handling / broad classification only)" : order == null ? "Not admitted" : "In progress") +
                    "\nIdentification: " + (CargoExamination.Identified(session.State, item) ? "Established" : "Unresolved — Analysis required");
                if (CargoExamination.Completed(item) && item.CustodyRoomId == item.Examination.RoomId && item.CustodyRoomId != item.RoomId)
                    text += "\nNext: return custody to assigned storage to free the Analysis item place.";
                text += "\nQuantity: " + d.Quantity + " / Whole: " + (d.PercentOfWhole / 10f) + "%\n" +
                    "Condition: " + CargoHandling.Condition(session.State, item) + "\nKnown: " + string.Join(", ", CargoExamination.Known(session.State, item)) +
                    "\nRetention: " + (item.Retained ? "Kept for SGC" : "Undecided") + (item.EquippedUnitId == null ? " / not issued equipment\n" : " / equipped by " + session.State.Base.Units.Single(u => u.Id == item.EquippedUnitId).Name + "\nAssigned storage: " + session.State.Base.Rooms.Single(r => r.Id == item.RoomId).Definition.Name + " " + item.RoomId + "\n");
                text += "\nValidated storage: " + (item.RoomId == null ? "Incoming inventory" : session.State.Base.Rooms.Single(r => r.Id == item.RoomId).Definition.Name + " " + item.RoomId) +
                    "\nCustody: " + (item.EquippedUnitId != null ? "Unit " + item.EquippedUnitId : item.CustodyRoomId == null ? "Incoming inventory" : session.State.Base.Rooms.Single(r => r.Id == item.CustodyRoomId).Definition.Name + " " + item.CustodyRoomId) + "\n";
                if (order != null && item.RoomId == null)
                    text += "\n" + string.Join("\n", order.Progress.Select((p, n) => catalog.Steps[n].Name + ": " + p.Ticks + "/" + catalog.Steps[n].DurationTicks)) + "\n" + ReceivingWork.BlockedReason(session.State, order);
                var finding = CargoHandling.Finding(session.State, item);
                if (finding != null && !CargoExamination.Identified(session.State, item)) text += "\nReceiving finding: " + finding.Observation;
                if (item.Examination != null)
                    text += (item.Examination.LegacyStorageFinding ? "\nHistorical finding: " : "\nAnalysis examination: ") + item.Examination.Ticks + "/" + session.State.Base.Processing.Step.DurationTicks + " ticks\n" +
                        (item.Examination.ActorId == null ? "Awaiting local Scientist" : session.State.Base.Units.Single(u => u.Id == item.Examination.ActorId).Name) + "\n" + CargoExamination.Status(session.State, item);
                if (item.Handling != null)
                    text += "\nHandling review: " + item.Handling.Ticks + "/" + session.State.Base.Handling.Step.DurationTicks + " ticks\n" +
                        (item.Handling.ActorId == null ? "Awaiting Actor" : session.State.Base.Units.Single(u => u.Id == item.Handling.ActorId).Name) + "\n" + CargoHandling.Status(session.State, item);
                if (item.Handling != null && !CargoHandling.Completed(item))
                    text += "\nContainment reserved: " + item.Handling.PrimaryRoomId;
                var retention = PrototypeUi.Button("Retain cargo", transform, new Vector2(.02f, .34f), new Vector2(.38f, .44f), item.Retained ? "Mark retention undecided" : "Keep for SGC", new Color(.12f, .3f, .36f), () => Run(() => session.RetainCargo(item.Id, !item.Retained)));
                retention.interactable = item.EquippedUnitId == null;
                if (showDebug) PrototypeUi.Button("Reset cargo object", transform, new Vector2(.02f, .24f), new Vector2(.23f, .32f), "Reset object", new Color(.32f, .2f, .16f), () => Run(() => session.ResetCargoObject(item.Id), "Object reset to incoming inventory. Staff and SG-team assignments kept; Save preserves this setup."));
                PrototypeUi.ScrollLabel("Cargo physical details", transform, new Vector2(.42f, .45f), new Vector2(.98f, .74f), text, 17);
                int n = 0;
                if (order == null)
                    foreach (var room in session.State.Base.Rooms.Where(r => catalog.Rooms.Any(p => p.DefinitionId == r.Definition.Id && p.Capabilities.Contains(catalog.RequiredCapability))))
                    {
                        PrototypeUi.Button("Admit cargo " + room.Id, transform, new Vector2(.42f, .3f - n * .1f), new Vector2(.98f, .4f - n * .1f), "Admit to " + room.Definition.Name + " " + room.Id, new Color(.12f, .3f, .36f), () => Run(() => session.AdmitIncoming(item.Id, room.Id))); n++;
                    }
                else
                {
                    if (!complete)
                        PrototypeUi.Button("Pause cargo inspection", transform, new Vector2(.42f, .3f), new Vector2(.98f, .4f), order.Paused ? "Resume inspection" : "Pause inspection", new Color(.12f, .3f, .36f), () => Run(() => session.PauseInspection(item.Id, !order.Paused)));
                    if (complete && item.EquippedUnitId != null)
                        PrototypeUi.Button("Return cargo equipment", transform, new Vector2(.42f, .3f), new Vector2(.98f, .4f), "Return custody to Equipment Storage", new Color(.12f, .3f, .36f), () => Run(() => session.ReturnEquipment(item.Id, item.RoomId)));
                    else if (complete && CargoExamination.Active(item))
                        PrototypeUi.Button("Pause cargo examination", transform, new Vector2(.42f, .3f), new Vector2(.98f, .4f), item.Examination.Paused ? "Resume Analysis examination" : "Pause Analysis examination", new Color(.12f, .3f, .36f), () => Run(() => session.PauseCargoExamination(item.Id, !item.Examination.Paused)));
                    else if (complete && item.Handling != null && !CargoHandling.Completed(item))
                        PrototypeUi.Button("Pause handling review", transform, new Vector2(.42f, .3f), new Vector2(.98f, .4f), item.Handling.Paused ? "Resume legacy handling review" : "Pause legacy handling review", new Color(.12f, .3f, .36f), () => Run(() => session.PauseHandlingReview(item.Id, !item.Handling.Paused)));
                    else if (complete)
                    {
                        if (item.RoomId != null && item.CustodyRoomId != item.RoomId)
                        {
                            PrototypeUi.Button("Return cargo to storage", transform, new Vector2(.42f, .31f), new Vector2(.98f, .41f), "Return custody to assigned storage / " + item.RoomId + " / 0 ticks", new Color(.12f, .3f, .36f), () => Run(() => session.ReturnCargoToStorage(item.Id), "Custody returned to reserved storage. Analysis item place released."));
                            n++;
                        }
                        if (item.RoomId != null && item.Examination == null)
                            foreach (var lab in session.State.Base.Rooms.Where(r => r.Definition.Id == session.State.Base.Processing?.RoomDefinitionId))
                            {
                                var reason = AnalysisReason(item.Id, lab.Id);
                                var button = PrototypeUi.Button("Start cargo examination " + lab.Id, transform, new Vector2(.42f, .31f - n * .105f), new Vector2(.98f, .41f - n * .105f), "Send custody to Analysis " + lab.Id + " / 0 ticks; examination / " + session.State.Base.Processing.Step.DurationTicks + " ticks" + (reason == null ? "" : "\n" + reason), new Color(.12f, .3f, .36f), () => Run(() => session.StartCargoExamination(item.Id, lab.Id)));
                                button.interactable = reason == null; button.GetComponentInChildren<Text>().fontSize = 14; n++;
                                var finished = session.State.Cargo.FirstOrDefault(i => i.CustodyRoomId == lab.Id && CargoExamination.Completed(i) && i.RoomId != lab.Id);
                                if (reason != null && finished != null && n < 3)
                                {
                                    PrototypeUi.Button("Open blocked Analysis " + lab.Id, transform, new Vector2(.42f,.31f-n*.105f),new Vector2(.98f,.41f-n*.105f),"Open Analysis: return completed " + RecoveredCargo.Name(session.State,finished),new Color(.4f,.28f,.12f),()=>{roomFilter=lab.Id;selected=finished.Id;Render();}).GetComponentInChildren<Text>().fontSize=14;
                                    n++;
                                }
                                if (n >= 3) break;
                            }
                        foreach (var room in session.State.Base.Rooms.Where(r => session.State.Base.Storage?.Find(r.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("CC") || t.Classes.Contains("EQ")) == true || r.Definition.Id == session.State.Base.Handling?.OrdinaryStorageDefinitionId))
                        {
                            if (room.Id == item.RoomId) continue;
                            var sourceRoom = session.State.Base.Rooms.SingleOrDefault(r => r.Id == item.RoomId);
                            if (sourceRoom?.Definition.Id == session.State.Base.Handling?.OrdinaryStorageDefinitionId && session.State.Base.Storage.Find(room.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("CC")) != true) continue;
                            bool equipment = session.State.Base.Storage.Find(room.Definition.Id).Tabs.Any(t => t.Classes.Contains("EQ"));
                            if (equipment && (!d.StorageClasses.Contains("EQ") || !CargoExamination.EquipmentReady(session.State, item))) continue;
                            if (n >= 3) break;
                            var reason = RouteReason(item.Id, room.Id);
                            var caption = (equipment ? "Accept for SGC / " : "Assign storage: ") + room.Definition.Name + " " + room.Id + " / 1 tick";
                            if (reason != null) caption += "\n" + reason;
                            var button = PrototypeUi.Button("Store cargo " + room.Id, transform, new Vector2(.42f, .31f - n * .105f), new Vector2(.98f, .41f - n * .105f), caption, new Color(.12f, .3f, .36f), () => Run(() => session.MoveCargo(item.Id, room.Id)));
                            button.interactable = reason == null;
                            button.GetComponentInChildren<Text>().fontSize = 14;
                            if (!button.interactable) button.GetComponentInChildren<Text>().color = Color.gray;
                            n++;
                        }
                    }
                    PrototypeUi.Label(PrototypeUi.Rect("Cargo storage limits", transform, new Vector2(.02f, .08f), new Vector2(.38f, .23f)),
                        "Containment is storage only. Send custody to a staffed Analysis lab to reveal remaining properties. Assigned storage stays reserved.\nEquipment Storage requires all properties revealed, established identity and intact condition.", 16);
                }
            }
            PrototypeUi.Label(PrototypeUi.Rect("Cargo status", transform, new Vector2(.02f, 0), new Vector2(.98f, .09f)), message, 16);
        }
        private string RouteReason(string id, string roomId)
        {
            try { RecoveredCargo.CheckStorageTransfer(session.State, id, roomId); return null; }
            catch (InvalidOperationException error) { return error.Message; }
            catch (ArgumentException error) { return error.Message; }
        }
        private string AnalysisReason(string id, string roomId)
        {
            try { CargoExamination.Start(session.State, id, roomId); return null; }
            catch (InvalidOperationException error) { return error.Message; }
        }
        private void OnDestroy()
        { if (session != null) { session.ReceivingChanged -= Render; session.TickCommitted -= Tick; session.StaffingChanged -= Render; } }
    }
}
