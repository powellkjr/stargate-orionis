using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class ReceivingPanel : MonoBehaviour
    {
        private CampaignSession session;
        private Text details, status, pauseLabel;
        private Button admit, pause;
        private string instanceId;
        public void Bind(CampaignSession value)
        {
            session = value;
            instanceId = session.State.Base.Receiving.Incoming.First().Id;
            PrototypeUi.Label(PrototypeUi.Rect("Receiving heading", transform, new Vector2(0, .84f), Vector2.one), "Receiving inspection", 23);
            details = PrototypeUi.Label(PrototypeUi.Rect("Receiving details", transform, new Vector2(0, .27f), new Vector2(1, .84f)), "", 16);
            admit = PrototypeUi.Button("Admit incoming object", transform, new Vector2(.01f, .14f), new Vector2(.49f, .27f),
                "Admit test object", new Color(.16f, .28f, .36f), () => Execute(() =>
                {
                    var selected = session.Selection.Current;
                    if (selected == null || selected.Kind != SelectionKind.Room) throw new InvalidOperationException("Select the destination room first.");
                    session.AdmitIncoming(instanceId, selected.Id);
                }));
            pause = PrototypeUi.Button("Pause inspection", transform, new Vector2(.51f, .14f), new Vector2(.99f, .27f),
                "Pause inspection", new Color(.16f, .28f, .36f), () => Execute(() =>
                {
                    var order = session.State.Receiving.Single(o => o.InstanceId == instanceId);
                    session.PauseInspection(instanceId, !order.Paused);
                }));
            pauseLabel = pause.GetComponentInChildren<Text>();
            status = PrototypeUi.Label(PrototypeUi.Rect("Receiving status", transform, Vector2.zero, new Vector2(1, .14f)), "", 14);
            session.TickCommitted += OnTick;
            session.StaffingChanged += Refresh;
            session.ReceivingChanged += Refresh;
            Refresh();
        }
        private void Execute(Action command)
        {
            try { command(); status.text = ""; }
            catch (Exception error) { status.text = error.Message; }
        }
        private void OnTick(long _) => Refresh();
        private void Refresh()
        {
            var catalog = RecoveredCargo.Catalog(session.State);
            if (session.State.Cargo.Count > 0)
            {
                var pending = session.State.Cargo.FirstOrDefault(i => i.RoomId == null);
                if (pending == null)
                {
                    admit.interactable = pause.interactable = false;
                    details.text = "Receiving is empty.\nRouted objects are in their current room's inventory tab.\nCompleted intake records are history, not Receiving custody.";
                    return;
                }
                instanceId = pending.Id;
            }
            var item = catalog.Incoming.Single(i => i.Id == instanceId);
            var order = session.State.Receiving.SingleOrDefault(o => o.InstanceId == instanceId);
            admit.interactable = order == null;
            pause.interactable = order != null && !ReceivingWork.IsComplete(catalog, order);
            pauseLabel.text = order?.Paused == true ? "Resume inspection" : "Pause inspection";
            if (order == null)
            {
                details.text = item.InitialName + "\nSelect Receiving, then admit this incoming object.\n" +
                    string.Join("\n", catalog.Steps.Select(s => s.Name + $": {s.Profession} {s.MinimumTier}, {s.DurationTicks} ticks, " +
                        (s.ToolService ?? "no Tool") + (s.RoomService == null ? "; no extra Room Service" : "; " + s.RoomService))) +
                    "\nAssign qualified staff there; only equipped Tools count.";
                return;
            }
            var complete = ReceivingWork.IsComplete(catalog, order);
            // Definition/instance IDs may themselves encode hidden origin; show only permitted names/findings.
            details.text = (complete ? item.ReceivingName : item.InitialName) + " / Custody: " +
                session.State.Base.Rooms.Single(r => r.Id == order.RoomId).Definition.Name + "\n";
            for (int i = 0; i < catalog.Steps.Count; i++)
            {
                var step = catalog.Steps[i]; var progress = order.Progress[i];
                var actor = progress.ActorId == null ? "Awaiting Actor" : session.State.Base.Units.Single(u => u.Id == progress.ActorId).Name;
                details.text += step.Name + $": {progress.Ticks}/{step.DurationTicks} ticks — " + actor + "\n";
            }
            details.text += "Condition: " + ReceivingWork.Condition(catalog, order) + " / Known: " +
                string.Join(", ", ReceivingWork.KnownTags(catalog, order)) + "\n" + ReceivingWork.BlockedReason(session.State, order);
            if (complete) details.text += "\nIntake checks only. Remaining properties and identity require staffed Analysis.";
        }
        private void OnDestroy()
        {
            if (session == null) return;
            session.TickCommitted -= OnTick;
            session.StaffingChanged -= Refresh;
            session.ReceivingChanged -= Refresh;
        }
    }
}
