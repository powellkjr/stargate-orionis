using System;
using System.Collections.Generic;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class StaffingPanel : MonoBehaviour
    {
        private CampaignSession session;
        private SelectionService selection;
        private List<RoomInstance> rooms;
        private Dropdown destination;
        private Button assign, unassign, nextTick, finishStep, cancel;
        private Text status;
        public void Bind(CampaignSession value)
        {
            session = value; selection = session.Selection;
            rooms = session.State.Base.Rooms.Where(r => r.StaffingCapacity > 0 && r.Definition.TeamSlots == 0).ToList();
            var heading = PrototypeUi.Label(PrototypeUi.Rect("Staffing title", transform, new Vector2(0, .9f), Vector2.one), "Room assignment", 19);
            heading.rectTransform.offsetMin = new Vector2(8, 2); heading.rectTransform.offsetMax = new Vector2(-8, -2);
            var dropdown = DefaultControls.CreateDropdown(new DefaultControls.Resources());
            dropdown.name = "Staffing destination";
            var rect = dropdown.GetComponent<RectTransform>(); rect.SetParent(transform, false);
            rect.anchorMin = new Vector2(.04f, .77f); rect.anchorMax = new Vector2(.96f, .89f);
            rect.offsetMin = rect.offsetMax = Vector2.zero;
            destination = dropdown.GetComponent<Dropdown>();
            destination.ClearOptions(); destination.AddOptions(rooms.Count == 0 ? new List<string> { "No staffed rooms" } : rooms.Select(r => r.Definition.Name).ToList());
            destination.captionText.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            destination.captionText.fontSize = 16;
            destination.interactable = rooms.Count > 0;
            assign = PrototypeUi.Button("Assign Unit", transform, new Vector2(.02f, .64f), new Vector2(.5f, .76f),
                "Assign now", new Color(.15f, .23f, .3f), () => Run(() => session.AssignUnit(selection.Current.Id, rooms[destination.value].Id), "Assigned."));
            unassign = PrototypeUi.Button("Unassign Unit", transform, new Vector2(.5f, .64f), new Vector2(.98f, .76f),
                "Unassign", new Color(.15f, .23f, .3f), () => Run(() => session.UnassignUnit(selection.Current.Id), "Unassigned."));
            nextTick = PrototypeUi.Button("Transfer next tick", transform, new Vector2(.02f, .5f), new Vector2(.98f, .62f),
                "Move after next tick", new Color(.15f, .23f, .3f), () => Run(() => session.PlanTransfer(selection.Current.Id, rooms[destination.value].Id, StaffTransferTiming.NextTick), "Assigned."));
            finishStep = PrototypeUi.Button("Transfer after step", transform, new Vector2(.02f, .36f), new Vector2(.98f, .48f),
                "Finish step, then move", new Color(.15f, .23f, .3f), () => Run(() => session.PlanTransfer(selection.Current.Id, rooms[destination.value].Id, StaffTransferTiming.FinishStep), "Assigned; no unfinished local step."));
            cancel = PrototypeUi.Button("Cancel transfer", transform, new Vector2(.02f, .22f), new Vector2(.98f, .34f),
                "Cancel planned move", new Color(.15f, .23f, .3f), () => Run(() => session.CancelTransfer(selection.Current.Id), "Planned move cancelled. Place released."));
            status = PrototypeUi.Label(PrototypeUi.Rect("Staffing status", transform, Vector2.zero, new Vector2(1, .22f)), "Select a Unit, choose its room, then Assign.", 14);
            destination.onValueChanged.AddListener(_=>Refresh());
            selection.Changed += SelectionChanged;
            session.StaffingChanged += Refresh;
            session.TickCommitted += OnTick;
            if (selection.Current != null) SelectionChanged(selection.Current); else Refresh();
        }
        private void SelectionChanged(SelectionDetails details)
        {
            if (details.Kind == SelectionKind.Room)
            {
                int index = rooms.FindIndex(r => r.Id == details.Id);
                if (index >= 0) destination.SetValueWithoutNotify(index);
            }
            status.text = details.Kind == SelectionKind.Unit ? "Choose a destination room." : "Select a Unit to assign.";
            Refresh();
        }
        private void Refresh()
        {
            var current = selection.Current;
            bool unit = current != null && current.Kind == SelectionKind.Unit && !Expeditions.IsDeployed(session.State, current.Id) && SGTeams.ForUnit(session.State, current.Id) == null && !Expeditions.IsIncapacitated(session.State, current.Id);
            assign.interactable = unit && rooms.Count > 0;
            nextTick.interactable = finishStep.interactable = unit && rooms.Count > 0;
            unassign.interactable = unit && session.State.Assignments.Any(a => a.UnitId == current.Id);
            cancel.interactable = unit && session.State.Transfers.Any(t => t.UnitId == current.Id);
            bool conflict=unit&&(session.State.Receiving.Any(o=>o.Progress.Any(p=>p.ActorId==current.Id&&p.Ticks>0&&p.Ticks<session.State.Base.Receiving.Steps.Single(s=>s.Id==p.StepId).DurationTicks))||session.State.Cargo.Any(i=>i.Handling?.ActorId==current.Id&&!CargoHandling.Completed(i)&&i.Handling.Ticks>0||i.Examination?.ActorId==current.Id&&CargoExamination.Active(i)&&i.Examination.Ticks>0));
            nextTick.gameObject.SetActive(conflict);finishStep.gameObject.SetActive(conflict);
            cancel.gameObject.SetActive(unit&&session.State.Transfers.Any(t=>t.UnitId==current.Id));
            if (current?.Kind == SelectionKind.Unit && !unit) status.text = "This Unit is offworld, assigned to an SG team, or incapacitated.";
            for (int i = 0; i < rooms.Count; i++)
            {
                int reserved = session.State.Transfers.Count(t => t.DestinationRoomId == rooms[i].Id);
                destination.options[i].text = rooms[i].Definition.Name + (reserved == 0 ? "" : " (" + reserved + " reserved)");
            }
            destination.RefreshShownValue();
            if (unit)
            {
                var move = session.State.Transfers.SingleOrDefault(t => t.UnitId == current.Id);
                if (move != null) status.text = "Place reserved in " + rooms.Single(r => r.Id == move.DestinationRoomId).Definition.Name +
                    (move.Timing == StaffTransferTiming.NextTick ? ". Moves after next tick." : ". Moves when the current step finishes.");
                else status.text = conflict?"This Unit has unfinished room work. Choose when to move.":"";
            }
        }
        private void OnTick(long _) => Refresh();
        private void Run(Action action, string message)
        {
            try { action(); status.text = message; Refresh(); }
            catch (Exception error) { status.text = error.Message; }
        }
        private void OnDestroy()
        {
            if (selection != null) selection.Changed -= SelectionChanged;
            if (session != null) session.StaffingChanged -= Refresh;
            if (session != null) session.TickCommitted -= OnTick;
        }
    }
}
