using System;
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
        private readonly Dictionary<string, PersonnelCardView> cards = new Dictionary<string, PersonnelCardView>();
        private InputField search;
        private RectTransform entries;
        public void Bind(CampaignSession value)
        {
            session = value;
            var data = session.State.Base; var selection = session.Selection;
            PrototypeUi.Label(PrototypeUi.Rect("Heading", transform, new Vector2(0, .9f), Vector2.one), "Personnel", 26);
            var viewport = PrototypeUi.Rect("Roster viewport", transform, new Vector2(.02f, .02f), new Vector2(.98f, .79f));
            viewport.gameObject.AddComponent<Image>().color = new Color(.08f, .11f, .15f);
            viewport.gameObject.AddComponent<Mask>().showMaskGraphic = true;
            var searchRect=PrototypeUi.Rect("Personnel search",transform,new Vector2(.02f,.81f),new Vector2(.98f,.89f));
            searchRect.gameObject.AddComponent<Image>().color=new Color(.12f,.18f,.23f);
            search=searchRect.gameObject.AddComponent<InputField>();
            search.textComponent=PrototypeUi.Label(PrototypeUi.Rect("Search text",searchRect,Vector2.zero,Vector2.one),"",15);
            search.textComponent.alignment=TextAnchor.MiddleLeft;
            var hint=PrototypeUi.Label(PrototypeUi.Rect("Search placeholder",searchRect,Vector2.zero,Vector2.one),"Search name, profession, room",14);hint.color=new Color(.6f,.69f,.74f);hint.alignment=TextAnchor.MiddleLeft;search.placeholder=hint;
            search.onValueChanged.AddListener(_=>Filter());
            var content = PrototypeUi.Rect("Roster entries", viewport, new Vector2(0, 1), Vector2.one);
            entries=content;
            content.pivot = new Vector2(.5f, 1);
            content.sizeDelta = new Vector2(0, data.Units.Count * 132);
            var scroll = viewport.gameObject.AddComponent<ScrollRect>();
            scroll.viewport = viewport; scroll.content = content; scroll.horizontal = false;
            scroll.movementType = ScrollRect.MovementType.Clamped; scroll.scrollSensitivity = 30;
            for (int i = 0; i < data.Units.Count; i++)
            {
                var unit = data.Units[i];
                var button=PrototypeUi.Button(unit.Id,content,new Vector2(0,1),Vector2.one,PrototypeUi.UnitLabel(unit,data.Mission),Color.Lerp(PrototypeUi.ParseColor(unit.Color),Color.black,.6f),()=>selection.SelectUnit(unit.Id));
                var card = button.gameObject.AddComponent<PersonnelCardView>();
                card.Bind(session, unit.Id);
                button.gameObject.AddComponent<SelectionOutline>().Bind(selection, SelectionKind.Unit, unit.Id);
                var rect = button.GetComponent<RectTransform>();
                rect.offsetMin = new Vector2(2, -(i + 1) * 132 + 2); rect.offsetMax = new Vector2(-2, -i * 132 - 2);
                var label = card.DetailsLabel;
                label.fontSize = 15;
                label.alignment = TextAnchor.MiddleLeft;
                label.rectTransform.offsetMin = new Vector2(card.HasPortrait ? 74 : 12, 7);
                label.rectTransform.offsetMax = new Vector2(-6, -3);
                cards.Add(unit.Id, card);
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
                if(PersonnelRecovery.InBed(session.State,unit.Id))room="Infirmary bed / "+PersonnelRecovery.Bed(session.State,unit.Id);
                var details = PrototypeUi.UnitLabel(unit, session.State.Base.Mission) + "\n" + room;
                cards[unit.Id].SetDetails(details);
            }
            Filter();
        }
        private void Filter()
        {
            int index=0;string query=search?.text??"";
            foreach (var pair in cards)
            {
                var row = pair.Value.GetComponent<RectTransform>();
                bool visible = (pair.Value.DetailsLabel.text.IndexOf(query, StringComparison.OrdinalIgnoreCase) >= 0 || session.State.Base.Units.Single(u => u.Id == pair.Key).Name.IndexOf(query, StringComparison.OrdinalIgnoreCase) >= 0);
                row.gameObject.SetActive(visible);if(!visible)continue;
                row.offsetMin=new Vector2(2,-(index+1)*132+2);row.offsetMax=new Vector2(-2,-index*132-2);index++;
            }
            entries.sizeDelta=new Vector2(0,index*132);
        }
        private void OnDestroy() { if (session != null) session.StaffingChanged -= Refresh; }
    }
}
