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
        private float itemPosition=1,actionPosition=1,detailPosition=1;
        private string renderedItem;
        private string previousRoomFilter;
        private string Reference(RecoveredItem item)=>"Cargo #"+(session.State.Cargo.ToList().IndexOf(item)+1);
        private string selected, roomFilter, followItem, followRoom, message = "Select an item in this room queue to work or route it.";
        public void Bind(CampaignSession value, Action back, bool debugControls = true, string roomId = null)
        { session = value; close = back; showDebug = debugControls; roomFilter = roomId??value.State.Base.Rooms.FirstOrDefault(r=>r.Definition.Id=="receiving")?.Id??"incoming"; session.ReceivingChanged += Render; session.TickCommitted += Tick; session.StaffingChanged += Render; Render(); }
        public void FocusItem(string id){selected=id;Render();}
        private void Tick(long _) => Render();
        private void Run(Action action, string success = "Item state updated. Save preserves it.")
        {
            var target=selected;
            try
            {
                action();message=success;
                var moved=session.State.Cargo.SingleOrDefault(i=>i.Id==target);
                if(moved!=null&&roomFilter!=null&&moved.EquippedUnitId==null&&!ResourceCargo.Consumed(session.State,moved))
                { if(moved.CustodyRoomId!=roomFilter){followItem=target;followRoom=moved.CustodyRoomId??"incoming";} }
            }
            catch(Exception e){message=e.Message;}
            Render();
        }
        private void Render()
        {
            var previousList=Active("Cargo item viewport")?.GetComponent<ScrollRect>();
            if(previousList!=null)itemPosition=previousList.verticalNormalizedPosition;
            var previousActions=Active("Cargo action viewport")?.GetComponent<ScrollRect>();
            if(previousActions!=null)actionPosition=previousActions.verticalNormalizedPosition;
            var previousDetails=Active("Cargo physical details")?.GetComponent<ScrollRect>();
            if(previousDetails!=null)detailPosition=previousDetails.verticalNormalizedPosition;
            foreach (Transform c in transform) { c.gameObject.SetActive(false); Destroy(c.gameObject); }
            string locationTitle = roomFilter == null ? "All locations" : roomFilter == "incoming" ? "Incoming inventory" : session.State.Base.Rooms.Single(r => r.Id == roomFilter).Definition.Name + " " + roomFilter;
            PrototypeUi.Label(PrototypeUi.Rect("Cargo heading", transform, new Vector2(.02f, .88f), new Vector2(.78f, 1)), locationTitle + " / item queue", 24);
            PrototypeUi.Button("Close recovered cargo", transform, new Vector2(.8f, .9f), new Vector2(.98f, .98f), "Back to base", new Color(.12f, .3f, .36f), () => close());
            bool InBase(RecoveredItem i)=>!ResourceCargo.IsResource(session.State,i)||i.FieldStageId==null&&!ResourceCargo.Consumed(session.State,i);
            bool intake=roomFilter!=null&&roomFilter!="incoming"&&session.State.Base.Rooms.Single(r=>r.Id==roomFilter).Definition.Id=="receiving";
            bool Visible(RecoveredItem i) => InBase(i)&&(roomFilter==null||(intake||roomFilter=="incoming")&&i.CustodyRoomId==null&&i.EquippedUnitId==null||i.CustodyRoomId==roomFilter&&i.EquippedUnitId==null);
            var departed=session.State.Cargo.SingleOrDefault(i=>i.Id==selected);
            if(departed!=null&&!Visible(departed)&&departed.EquippedUnitId==null&&!ResourceCargo.Consumed(session.State,departed)){followItem=departed.Id;followRoom=departed.CustodyRoomId??"incoming";}
            var staff=roomFilter==null||roomFilter=="incoming"?Array.Empty<string>():session.State.Assignments.Where(a=>a.RoomInstanceId==roomFilter).Select(a=>session.State.Base.Units.Single(u=>u.Id==a.UnitId).Name).ToArray();
            PrototypeUi.Button("Locate all cargo",transform,new Vector2(.02f,.80f),new Vector2(.38f,.87f),roomFilter==null?"Return to room queue":"Locate all cargo",new Color(.12f,.3f,.36f),()=>{if(roomFilter==null)roomFilter=previousRoomFilter??"incoming";else{previousRoomFilter=roomFilter;roomFilter=null;}followItem=followRoom=null;Render();});
            var summary=PrototypeUi.Label(PrototypeUi.Rect("Room queue summary",transform,new Vector2(.42f,.78f),new Vector2(.68f,.87f)),roomFilter==null?"All base cargo / current custody":(intake?"Receiving / incoming and admitted queue":"Current room custody")+"\n"+(staff.Length==0?"No staff assigned":string.Join(", ",staff)),14);summary.rectTransform.offsetMin=new Vector2(2,0);summary.rectTransform.offsetMax=new Vector2(-2,0);
            if(followItem!=null&&followRoom!=roomFilter)
            {
                string destination=followRoom=="incoming"?"Incoming":session.State.Base.Rooms.Single(r=>r.Id==followRoom).Definition.Name;
                PrototypeUi.Button("Follow routed item",transform,new Vector2(.70f,.78f),new Vector2(.98f,.87f),"Follow to "+destination,new Color(.12f,.35f,.4f),()=>{roomFilter=followRoom;selected=followItem;followRoom=followItem=null;if(roomFilter!="incoming")session.Selection.SelectRoom(roomFilter);Render();});
            }
            if(!session.State.Cargo.Any(i=>i.Id==selected&&Visible(i)))selected=session.State.Cargo.FirstOrDefault(Visible)?.Id;
            var itemContent=ScrollContent("Cargo item viewport",new Vector2(.02f,.46f),new Vector2(.38f,.74f));
            int index = 0;
            foreach (var i in session.State.Cargo.Where(Visible))
            {
                var location = i.EquippedUnitId == null ? (i.CustodyRoomId == null ? "Incoming inventory" : session.State.Base.Rooms.Single(r => r.Id == i.CustodyRoomId).Definition.Name) : "Equipped / " + session.State.Base.Units.Single(u => u.Id == i.EquippedUnitId).Name;
                var row=PrototypeUi.Button("cargo-" + i.Id, itemContent, new Vector2(.02f, .58f - index * .15f), new Vector2(.38f, .72f - index * .15f),
                    Reference(i)+" / "+RecoveredCargo.Name(session.State, i) + "\n" + location, i.Id == selected ? new Color(.23f, .4f, .42f) : new Color(.12f, .25f, .3f), () => { selected = i.Id; Render(); });
                var rect=row.GetComponent<RectTransform>();rect.anchorMin=new Vector2(0,1);rect.anchorMax=Vector2.one;rect.offsetMin=new Vector2(2,-(index+1)*88+3);rect.offsetMax=new Vector2(-2,-index*88-3);index++;
            }
            itemContent.sizeDelta=new Vector2(0,Mathf.Max(88,index*88));
            var countLabel=PrototypeUi.Label(PrototypeUi.Rect("Cargo item count",transform,new Vector2(.02f,.745f),new Vector2(.38f,.775f)),index+" items / scroll to browse",12);
            countLabel.rectTransform.offsetMin=new Vector2(2,0);countLabel.rectTransform.offsetMax=new Vector2(-2,0);
            if (index == 0) PrototypeUi.Label(PrototypeUi.Rect("No recovered cargo", transform, new Vector2(.02f, .48f), new Vector2(.98f, .72f)), session.State.Cargo.Count == 0 ? "No physical cargo recovered. Discover recoverable objects and choose them at the mission debrief." : "No items currently in custody here. Storage reservations remain with the assigned storage room while items are away.", 20);
            var item = session.State.Cargo.SingleOrDefault(i => i.Id == selected && Visible(i));
            if(item!=null&&ResourceCargo.IsResource(session.State,item)){RenderResource(item);LayoutActions(item);return;}
            if (item != null)
            {
                var catalog = RecoveredCargo.Catalog(session.State); var d = catalog.Incoming.Single(x => x.Id == item.Id);
                var order = session.State.Receiving.SingleOrDefault(o => o.InstanceId == item.Id);
                var complete = order != null && ReceivingWork.IsComplete(catalog, order);
                var text = Reference(item)+" / "+RecoveredCargo.Name(session.State, item) +
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
                PrototypeUi.ScrollLabel("Cargo physical details", transform, new Vector2(.42f, .52f), new Vector2(.98f, .74f), text, 17);
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
                        // Supply cargo conversion (Wave 1A): cleared supply cargo can be converted to
                        // Supply units in Supply Storage using the authored storage class (S1/S2/S3).
                        var supplyClass = d.StorageClasses.FirstOrDefault(sc => sc == "S1" || sc == "S2" || sc == "S3");
                        if (supplyClass != null)
                        {
                            var supplyRoom = session.State.Base.Rooms.SingleOrDefault(r => r.Definition.Id == "supply_storage");
                            if (supplyRoom != null && n < 3)
                            {
                                var reason = RouteReason(item.Id, supplyRoom.Id);
                                var caption = "Convert to " + supplyClass + " Supply: " + supplyRoom.Definition.Name + " " + supplyRoom.Id + " / 1 tick";
                                var button = PrototypeUi.Button("Convert cargo " + supplyRoom.Id, transform, new Vector2(.42f, .31f - n * .105f), new Vector2(.98f, .41f - n * .105f), caption, new Color(.12f, .3f, .36f), () => Run(() => session.MoveCargo(item.Id, supplyRoom.Id)));
                                button.interactable = reason == null;
                                button.GetComponentInChildren<Text>().fontSize = 14;
                                if (!button.interactable) button.GetComponentInChildren<Text>().color = Color.gray;
                                n++;
                            }
                        }
                    }
                    PrototypeUi.Label(PrototypeUi.Rect("Cargo storage limits", transform, new Vector2(.02f, .08f), new Vector2(.38f, .23f)),
                        "Containment is storage only. Send custody to a staffed Analysis lab to reveal remaining properties. Assigned storage stays reserved.\nEquipment Storage requires all properties revealed, established identity and intact condition.", 16);
                }
            }
            if(item!=null)PrototypeUi.Rect("Cargo inspection tracker",transform,new Vector2(.42f,.41f),new Vector2(.98f,.50f)).gameObject.AddComponent<InspectionProgressView>().Cargo(session.State,item,session);
            LayoutActions(item);
            PrototypeUi.Label(PrototypeUi.Rect("Cargo status", transform, new Vector2(.02f, 0), new Vector2(.98f, .09f)), message, 16);
        }
        private void RenderResource(RecoveredItem item)
        {
            var s=session.State;var d=s.Base.ResourceProcessing;var work=item.ResourceWork;
            int pending=work.Outcomes.Keys.Count(i=>!work.Committed.Contains(i));
            string text=ResourceCargo.Name(s,item)+"\nRecipe work: "+work.Committed.Count+"/"+d.Bubbles.Count+" bubbles committed / "+pending+" pending deposit"+
                "\nCustody: "+(item.CustodyRoomId??"Incoming inventory")+"\nFallback: Incoming inventory\nRecovery: "+ResourceCargo.AllocationLabel(s,item);
            if(ResourceCargo.Known(s,item,"CONVERSION")){var totals=ResourceCargo.Totals(s,item);text+="\nKnown conversion: "+(d.ConversionStat/100d).ToString("0.00")+"\nRecovery total: "+string.Join(" / ",totals.Select(p=>p.Value+" "+p.Key));}
            else text+="\nConversion rate is unknown; finish the inspection bubbles.";
            if(pending>0)text+="\nStorage capacity blocks finished outcomes. No further work or reroll is required for those bubbles. Create capacity, then retry.";
            PrototypeUi.ScrollLabel("Cargo physical details",transform,new Vector2(.42f,.52f),new Vector2(.98f,.74f),text,17);
            var tracker=PrototypeUi.Rect("Resource recipe progress",transform,new Vector2(.42f,.41f),new Vector2(.98f,.50f)).gameObject.AddComponent<InspectionProgressView>();
            tracker.Show(s,"Resource processing",work.Bubbles.Select((b,i)=>new InspectionWork(d.Bubbles[i].DurationTicks,b.Ticks,d.Bubbles[i].Profession,b.ActorId)),session,"resource/"+item.Id+"/"+item.RecoveredTick);
            if(item.CustodyRoomId==null)
            {
                int n=0;foreach(var room in s.Base.Rooms.Where(r=>r.Definition.Id==d.RoomDefinitionId))
                    PrototypeUi.Button("Admit resource "+room.Id,transform,new Vector2(.42f,.3f-n*.1f),new Vector2(.98f,.4f-n++*.1f),"Send custody to "+room.Definition.Name+" "+room.Id+" / 0 ticks",new Color(.12f,.3f,.36f),()=>Run(()=>session.AdmitResourceCache(item.Id,room.Id)));
            }
            if(item.CustodyRoomId!=null)PrototypeUi.Label(PrototypeUi.Rect("Resource blocker",transform,new Vector2(.42f,.33f),new Vector2(.98f,.41f)),ResourceCargo.BlockedReason(s,item),16);
            if(pending>0)PrototypeUi.Button("Retry resource outputs",transform,new Vector2(.42f,.18f),new Vector2(.98f,.28f),"Retry fixed pending outputs / no additional work",new Color(.45f,.3f,.1f),()=>Run(session.RetryResourceOutputs));
            PrototypeUi.Label(PrototypeUi.Rect("Resource work requirements",transform,new Vector2(.02f,.1f),new Vector2(.38f,.43f)),"Receiving staff work the Recipe while the clock runs.\nInspections: Technician/TET1, then Scientist/SCT1.\nRecovery: any available local staff, one Actor per bubble.\nOne open container per Receiving room. Resource credits require atomic Recipe commits.",16);
            PrototypeUi.Label(PrototypeUi.Rect("Cargo status",transform,Vector2.zero,new Vector2(1,.09f)),message,16);
        }
        private Transform Active(string name)=>transform.Cast<Transform>().FirstOrDefault(t=>t.gameObject.activeSelf&&t.name==name);
        private RectTransform ScrollContent(string name,Vector2 min,Vector2 max)
        {
            var viewport=PrototypeUi.Rect(name,transform,min,max);viewport.gameObject.AddComponent<RectMask2D>();
            viewport.gameObject.AddComponent<Image>().color=new Color(.06f,.095f,.12f);
            var content=PrototypeUi.Rect(name+" content",viewport,new Vector2(0,1),Vector2.one);content.pivot=new Vector2(.5f,1);
            var scroll=viewport.gameObject.AddComponent<ScrollRect>();scroll.viewport=viewport;scroll.content=content;scroll.horizontal=false;scroll.scrollSensitivity=40;scroll.movementType=ScrollRect.MovementType.Clamped;
            var bar=PrototypeUi.Rect(name+" scrollbar",viewport,new Vector2(.985f,.01f),new Vector2(1,.99f));bar.gameObject.AddComponent<Image>().color=new Color(.08f,.13f,.16f);
            var thumb=PrototypeUi.Rect("Scroll handle",bar,Vector2.zero,Vector2.one);var graphic=thumb.gameObject.AddComponent<Image>();graphic.color=new Color(.36f,.57f,.64f);
            var scrollbar=bar.gameObject.AddComponent<Scrollbar>();scrollbar.handleRect=thumb;scrollbar.targetGraphic=graphic;scrollbar.direction=Scrollbar.Direction.BottomToTop;
            scroll.verticalScrollbar=scrollbar;scroll.verticalScrollbarVisibility=ScrollRect.ScrollbarVisibility.AutoHide;
            return content;
        }
        private void LayoutActions(RecoveredItem item)
        {
            var actions=transform.Cast<Transform>().Where(t=>t.gameObject.activeSelf&&t.GetComponent<Button>()!=null&&t.GetComponent<RectTransform>().anchorMin.x>=.4f&&t.name!="Close recovered cargo"&&!t.name.StartsWith("cargo-room-")).ToArray();
            var content=ScrollContent("Cargo action viewport",new Vector2(.42f,.11f),new Vector2(.98f,.39f));
            content.sizeDelta=new Vector2(0,Mathf.Max(62,actions.Length*62));
            for(int i=0;i<actions.Length;i++)
            {
                var action=actions[i].GetComponent<RectTransform>();action.SetParent(content,false);action.anchorMin=new Vector2(0,1);action.anchorMax=Vector2.one;
                action.offsetMin=new Vector2(2,-(i+1)*62+3);action.offsetMax=new Vector2(-2,-i*62-3);
                var label=action.GetComponentInChildren<Text>();label.fontSize=14;label.rectTransform.offsetMin=new Vector2(8,3);label.rectTransform.offsetMax=new Vector2(-8,-3);
            }
            if(renderedItem!=item?.Id){detailPosition=actionPosition=1;renderedItem=item?.Id;}
            Canvas.ForceUpdateCanvases();
            Active("Cargo item viewport").GetComponent<ScrollRect>().verticalNormalizedPosition=itemPosition;
            Active("Cargo action viewport").GetComponent<ScrollRect>().verticalNormalizedPosition=actionPosition;
            var details=Active("Cargo physical details")?.GetComponent<ScrollRect>();if(details!=null)details.verticalNormalizedPosition=detailPosition;
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
