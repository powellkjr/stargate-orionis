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
        private readonly Dictionary<string,Text> structureLabels=new Dictionary<string,Text>();
        private Structure.RoomStructureGraphic structure;private string structureKey;
        public void Bind(CampaignSession value, System.Action<string> openReadyRoom = null, System.Action<string> openEquipment = null, System.Action openPlanning = null, System.Action repaint = null,System.Action<string> openRoom = null)
        {
            session = value;
            var data = session.State.Base; var selection = session.Selection;
            var heading = PrototypeUi.Label(PrototypeUi.Rect("Heading", transform, new Vector2(0, .9f), Vector2.one), data.BaseName, 22);
            var caption = PrototypeUi.Label(PrototypeUi.Rect("Caption", transform, new Vector2(0, .81f), new Vector2(repaint==null?(openPlanning == null ? 1 : .70f):.44f, .9f)),
                "Select a room. Drag to pan.", 14);
            foreach (var text in new[] { heading, caption })
            { text.rectTransform.offsetMin = new Vector2(8, 2); text.rectTransform.offsetMax = new Vector2(-8, -2); }
            if (openPlanning != null) PrototypeUi.Button("Open base planning", transform, new Vector2(.70f, .81f), new Vector2(.99f, .9f),
                "Base planning", new Color(.12f, .3f, .36f), () => openPlanning()).GetComponentInChildren<Text>().fontSize = 14;
            if(repaint!=null)PrototypeUi.Button("Toggle room art",transform,new Vector2(.46f,.81f),new Vector2(.68f,.9f),PresentationArt.RoomArtEnabled?"Art: on":"Schematic",new Color(.12f,.25f,.3f),()=>{PresentationArt.RoomArtEnabled=!PresentationArt.RoomArtEnabled;repaint();}).GetComponentInChildren<Text>().fontSize=13;
            var board = PrototypeUi.Rect("Room grid", transform, new Vector2(.02f, .05f), new Vector2(.98f, .8f));
            board.gameObject.AddComponent<Image>().color=new Color(.035f,.05f,.07f);
            board.gameObject.AddComponent<RectMask2D>();
            var viewport=board;
            board=PrototypeUi.Rect("Base floor grid",viewport,new Vector2(0,1),new Vector2(0,1));board.pivot=new Vector2(0,1);
            float columns=data.Planning?.Columns??12,rows=data.Planning?.Rows??10;
            board.sizeDelta=new Vector2(columns*72,rows*72);
            var scroll=viewport.gameObject.AddComponent<ScrollRect>();scroll.viewport=viewport;scroll.content=board;scroll.horizontal=true;scroll.vertical=true;scroll.scrollSensitivity=45;
            scroll.movementType=ScrollRect.MovementType.Clamped;
            board.anchoredPosition=new Vector2(0,Mathf.Max(0,data.Rooms.Min(r=>r.Row)-1)*72);
            int left=0,top=0;
            for(int y=0;y<rows;y++)for(int x=0;x<columns;x++)
            {
                bool clear=data.Construction==null||RoomConstruction.IsClear(session.State,x,y);
                var cell=PrototypeUi.Rect("Floor cell "+x+" "+y,board,new Vector2(x/columns,1-(y+1)/rows),new Vector2((x+1)/columns,1-y/rows));
                cell.offsetMin=new Vector2(1,1);cell.offsetMax=new Vector2(-1,-1);
                cell.gameObject.AddComponent<Image>().color=clear?new Color(.075f,.095f,.12f):new Color(.18f,.19f,.21f);
                var coordinate=PrototypeUi.Label(cell,x+","+y,9);coordinate.color=new Color(.42f,.47f,.53f);coordinate.alignment=TextAnchor.UpperLeft;
            }
            foreach (var room in data.Rooms)
            {
                var min = new Vector2((room.Col - left) / columns, 1f - (room.Row - top + room.Definition.Height) / rows);
                var max = new Vector2((room.Col - left + room.Definition.Width) / columns, 1f - (room.Row - top) / rows);
                var button = PrototypeUi.Button(room.Id, board, min, max, room.Definition.Name,
                    PrototypeUi.ParseColor(room.Definition.Color), () => { selection.SelectRoom(room.Id); if (room.Definition.TeamSlots > 0) openReadyRoom?.Invoke(room.Id); else if (data.Storage?.Find(room.Definition.Id)?.Tabs.Any(t => t.Classes.Contains("EQ")) == true) openEquipment?.Invoke(room.Id); else if(room.Definition.Id=="receiving"||room.Definition.Id==data.Processing?.RoomDefinitionId||data.Storage?.Find(room.Definition.Id)!=null&&room.Definition.Id!="holding")openRoom?.Invoke(room.Id); });
                var footprint=button.GetComponent<RectTransform>();footprint.offsetMin=new Vector2(5,5);footprint.offsetMax=new Vector2(-5,-5);
                var edge=button.gameObject.AddComponent<Outline>();edge.effectDistance=new Vector2(2,-2);edge.effectColor=PrototypeUi.ParseColor(room.ConstructionTier==1?"#8b949e":room.ConstructionTier==2?"#38bdf8":"#f59e0b");
                button.gameObject.AddComponent<SelectionOutline>().Bind(selection, SelectionKind.Room, room.Id);
                var label = button.GetComponentInChildren<Text>();
                label.fontSize = room.Definition.Width > 1 ? 20 : 11;
                label.rectTransform.offsetMin=new Vector2(2,2);label.rectTransform.offsetMax=new Vector2(-2,-2);
                label.color=new Color(.035f,.06f,.075f);
                if(PresentationArt.Room(button.transform,room.Definition.Id))
                {
                    var footer=PrototypeUi.Rect("Room name backing",button.transform,Vector2.zero,new Vector2(1,.46f));footer.gameObject.AddComponent<Image>().color=new Color(.025f,.045f,.06f,.87f);footer.GetComponent<Image>().raycastTarget=false;footer.SetAsLastSibling();label.transform.SetAsLastSibling();
                    label.rectTransform.anchorMax=new Vector2(1,.46f);label.color=Color.white;label.resizeTextForBestFit=true;label.resizeTextMinSize=8;label.resizeTextMaxSize=room.Definition.Width>1?18:10;
                }
                labels.Add(room.Id, label);
            }
            structure=PrototypeUi.Rect("Base structural shell",board,Vector2.zero,Vector2.one).gameObject.AddComponent<Structure.RoomStructureGraphic>();
            Canvas.ForceUpdateCanvases();
            foreach(var entry in labels){var original=entry.Value;var copy=Instantiate(original.gameObject,board,false).GetComponent<Text>();copy.name="Structure room label "+entry.Key;copy.enabled=true;copy.raycastTarget=false;copy.rectTransform.anchorMin=copy.rectTransform.anchorMax=new Vector2(0,1);copy.rectTransform.pivot=original.rectTransform.pivot;copy.rectTransform.sizeDelta=original.rectTransform.rect.size;copy.rectTransform.anchoredPosition=board.InverseTransformPoint(original.transform.position);original.enabled=false;structureLabels.Add(entry.Key,copy);}
            session.StaffingChanged += Refresh;
            session.ConstructionChanged+=Refresh;
            Refresh();
        }
        private void Refresh()
        {
            var key=Structure.RoomStructureAdapter.BaseKey(session.State);if(key!=structureKey){structureKey=key;structure?.Show(Structure.RoomStructureAdapter.Base(session.State),72);}
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
            foreach(var pair in structureLabels)pair.Value.text=labels[pair.Key].text;
        }
        private void OnDestroy() { if (session != null){session.StaffingChanged -= Refresh;session.ConstructionChanged-=Refresh;} }
    }
}
