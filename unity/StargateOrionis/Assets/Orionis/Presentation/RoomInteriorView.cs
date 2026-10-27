using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    // Room-local slot presentation; commands retain the existing assignment authority.
    public sealed class RoomInteriorView : MonoBehaviour
    {
        private CampaignSession session;
        private Action<string> openInventory;
        private string roomId, unitId, tab="staff";
        private string message="";
        private bool showDebug;
        public void Bind(CampaignSession value,Action<string> inventory,bool debugControls=true)
        {
            session=value;openInventory=inventory;showDebug=debugControls;
            session.Selection.Changed+=Selected;
            session.StaffingChanged+=Refresh;
            session.TickCommitted+=Tick;
            roomId=session.State.Assignments.FirstOrDefault()?.RoomInstanceId??session.State.Base.Rooms.First().Id;
            Selected(session.Selection.Current);
        }
        public void ShowTab(string value){tab=value;Refresh();}
        private void Selected(SelectionDetails selected)
        {
            if(selected?.Kind==SelectionKind.Room)
            {
                if(roomId!=selected.Id)tab=session.State.Base.Rooms.Single(r=>r.Id==selected.Id).Definition.Id==session.State.Base.PersonnelRecovery?.InfirmaryRoomId?"beds":session.State.Base.Rooms.Single(r=>r.Id==selected.Id).Definition.Id=="holding"?"captives":"staff";
                roomId=selected.Id;
            }
            if(selected?.Kind==SelectionKind.Unit)unitId=selected.Id;
            Refresh();
        }
        private void Tick(long _) => Refresh();
        private void Run(Action action)
        {
            try{action();message="";}catch(Exception e){message=e.Message;}
            Refresh();
        }
        private void Refresh()
        {
            foreach(Transform child in transform){child.gameObject.SetActive(false);Destroy(child.gameObject);}
            var state=session.State;var room=state.Base.Rooms.Single(r=>r.Id==roomId);
            var color=PrototypeUi.ParseColor(room.Definition.Color);
            var background=PrototypeUi.Rect("Room interior background",transform,Vector2.zero,Vector2.one);
            background.gameObject.AddComponent<Image>().color=Color.Lerp(color,Color.black,.76f);
            var header=PrototypeUi.Rect("Room interior header",transform,new Vector2(.015f,.81f),new Vector2(.985f,.99f));
            header.gameObject.AddComponent<Image>().color=Color.Lerp(color,Color.black,.18f);
            var title=PrototypeUi.Label(header,room.Definition.Name+"  /  CT"+room.ConstructionTier+"  /  "+room.Id,20);
            title.alignment=TextAnchor.MiddleLeft;title.rectTransform.offsetMin=new Vector2(12,0);
            if(state.Base.Storage?.Find(room.Definition.Id)!=null||room.Definition.Id=="receiving"||room.Definition.Id==state.Base.Processing?.RoomDefinitionId)PrototypeUi.Button("Open recovered cargo",header,new Vector2(.76f,.12f),new Vector2(.98f,.88f),"Inventory",new Color(.10f,.17f,.22f),()=>openInventory(room.Id));
            title.rectTransform.anchorMax=new Vector2(.43f,1);
            PrototypeUi.Button("Room Services",header,new Vector2(.44f,.12f),new Vector2(.56f,.88f),tab=="services"?"Staff":"Services",new Color(.10f,.17f,.22f),()=>{tab=tab=="services"?"staff":"services";Refresh();});
            if(BaseWork.ResponseRoom(state,room.Id))PrototypeUi.Button("Response posture",header,new Vector2(.57f,.12f),new Vector2(.75f,.88f),state.Workforce.BaseResponseRooms.Contains(room.Id)?"Base Response":"Local Response",new Color(.17f,.25f,.30f),()=>Run(()=>session.SetBaseResponse(room.Id,!state.Workforce.BaseResponseRooms.Contains(room.Id))));
            if(tab=="services"){PrototypeUi.Rect("Room Services view",transform,new Vector2(.015f,.02f),new Vector2(.985f,.80f)).gameObject.AddComponent<BaseServicesView>().Show(session,room.Id);return;}
            if(state.Cores!=null&&room.Definition.Id=="receiving")
                PrototypeUi.Button("Configure room Cores",header,new Vector2(.57f,.12f),new Vector2(.75f,.88f),tab=="cores"?"Receiving":"Cores",new Color(.10f,.17f,.22f),()=>{tab=tab=="cores"?"staff":"cores";Refresh();});
            if(state.Cores!=null&&tab=="cores")
            {
                var panel=PrototypeUi.Rect("Physical Core configuration",transform,new Vector2(.015f,.11f),new Vector2(.985f,.80f));panel.gameObject.AddComponent<RoomCorePanel>().Show(session,room.Id,Run);
                PrototypeUi.Label(PrototypeUi.Rect("Core status",transform,new Vector2(.02f,0),new Vector2(.98f,.10f)),message,12);return;
            }
            if(room.Definition.Id=="receiving")
            {
                var receiving=PrototypeUi.Rect("Receiving work",transform,new Vector2(.015f,.04f),new Vector2(.985f,.80f));
                if(showDebug)receiving.gameObject.AddComponent<ReceivingPanel>().Bind(session);
                else
                {
                    PrototypeUi.Label(PrototypeUi.Rect("Receiving summary",receiving,new Vector2(0,.4f),Vector2.one),"Receiving\nInspect incoming objects, then route them to storage or staffed work rooms.",18);
                    PrototypeUi.Button("Open Receiving queue",receiving,new Vector2(.02f,.08f),new Vector2(.98f,.32f),"Open Receiving queue",new Color(.12f,.3f,.36f),()=>openInventory(room.Id));
                }
                return;
            }
            int coreCapacity=state.Base.Planning?.Rooms.SingleOrDefault(r=>r.Room.Id==room.Definition.Id)?.Construction[room.ConstructionTier].Components.Where(c=>c.Kind=="coreSlots").Sum(c=>c.Places)??0;
            bool beds=room.Definition.Id==state.Base.PersonnelRecovery?.InfirmaryRoomId;
            bool captives=room.Definition.Id=="holding";
            int cellCapacity=captives?state.Base.Planning.Rooms.Single(p=>p.Room.Id==room.Definition.Id).Construction[room.ConstructionTier].Components.Where(c=>c.Kind=="occupantPlaces").Sum(c=>c.Places):0;
            if(room.StaffingCapacity==0&&tab=="staff")tab=coreCapacity>0?"cores":"storage";
            string[] tabs=(room.StaffingCapacity>0?new[]{"staff"}:Array.Empty<string>()).Concat(beds?new[]{"beds"}:captives?new[]{"captives"}:Array.Empty<string>()).Concat(coreCapacity>0?new[]{"cores"}:Array.Empty<string>()).ToArray();
            for(int i=0;i<tabs.Length;i++)
            {
                var key=tabs[i];var text=key=="staff"?"Staff slots":key=="beds"?"Patient beds":key=="captives"?"Holding cells":"Core slots";
                PrototypeUi.Button("Room tab "+key,transform,new Vector2(.02f+i*.96f/tabs.Length,.68f),new Vector2(.02f+(i+1)*.96f/tabs.Length-.008f,.79f),text,tab==key?new Color(.19f,.36f,.41f):new Color(.10f,.16f,.21f),()=>{tab=key;Refresh();});
            }
            var preview=PrototypeUi.Rect("Shared room preview",transform,new Vector2(.02f,.12f),new Vector2(.26f,.66f));
            bool roomArt=PresentationArt.Room(preview,room.Definition.Id);if(!roomArt)Destroy(preview.gameObject);
            var viewport=PrototypeUi.Rect("Room slot viewport",transform,new Vector2(roomArt?.28f:.02f,.11f),new Vector2(.98f,.66f));
            viewport.gameObject.AddComponent<RectMask2D>();
            var content=PrototypeUi.Rect("Room slots",viewport,new Vector2(0,1),Vector2.one);content.pivot=new Vector2(.5f,1);
            var scroll=viewport.gameObject.AddComponent<ScrollRect>();scroll.content=content;scroll.viewport=viewport;scroll.horizontal=false;scroll.scrollSensitivity=35;
            var staff=state.Assignments.Where(a=>a.RoomInstanceId==room.Id).Select(a=>a.UnitId).ToArray();
            var patients=state.Personnel.Where(p=>p.BedRoomId==room.Id).Select(p=>p.UnitId).ToArray();
            int count=tab=="captives"?cellCapacity:tab=="beds"?state.Base.PersonnelRecovery.BedsPerRoom:tab=="cores"?coreCapacity:tab=="staff"?room.StaffingCapacity:0;
            content.sizeDelta=new Vector2(0,Mathf.Max(80,((count+1)/2)*140));
            for(int i=0;i<count;i++)
            {
                if(tab=="captives")
                {
                    var captive=state.Cargo.Where(c=>c.RoomId==room.Id).ElementAtOrDefault(i);
                    var cell=PrototypeUi.Button("Holding cell "+i,content,new Vector2(i%2*.5f,1),new Vector2((i%2+1)*.5f,1),captive==null?"Empty holding cell "+(i+1):RecoveredCargo.Name(state,captive)+(captive.CustodyRoomId==room.Id?"\nIn cell":"\nReserved / custody elsewhere"),new Color(.10f,.15f,.20f),()=>openInventory(room.Id));
                    var cellRect=cell.GetComponent<RectTransform>();cellRect.offsetMin=new Vector2(4,-(i/2+1)*140+4);cellRect.offsetMax=new Vector2(-4,-i/2*140-4);continue;
                }
                string assigned=tab=="beds"?patients.ElementAtOrDefault(i):tab=="staff"?staff.ElementAtOrDefault(i):null;
                var unit=state.Base.Units.SingleOrDefault(u=>u.Id==assigned);
                string caption=unit==null?(tab=="beds"?"Empty bed\nSelect a Unit, then assign":tab=="cores"?"Empty Core slot":"Empty staff slot\nAssign from Personnel"):
                    PresentationArt.DisplayName(unit.Id,unit.Name)+"\n"+unit.Profession+" "+unit.Tier+"  /  HP "+PersonnelCondition.Health(state,unit.Id)+(tab=="beds"?"\n"+state.Base.PersonnelRecovery.BedHealthPerTick+" HP/tick · click to release":"");
                var slot=PrototypeUi.Button("Room "+tab+" slot "+i,content,new Vector2((i%2)*.5f,1),new Vector2((i%2+1)*.5f,1),caption,
                    unit==null?new Color(.10f,.15f,.20f):Color.Lerp(PrototypeUi.ParseColor(unit.Color),Color.black,.28f),()=>
                    {
                        if(tab=="beds"){if(assigned!=null)Run(()=>session.AssignInfirmaryBed(assigned,null));else if(unitId!=null)Run(()=>session.AssignInfirmaryBed(unitId,room.Id));else{message="Select a Unit from Personnel first.";Refresh();}}
                        else if(assigned!=null)session.Selection.SelectUnit(assigned);
                    });
                var rect=slot.GetComponent<RectTransform>();rect.offsetMin=new Vector2(4,-(i/2+1)*140+4);rect.offsetMax=new Vector2(-4,-i/2*140-4);
                slot.GetComponentInChildren<Text>().fontSize=14;
                if(unit!=null){var card=slot.gameObject.AddComponent<PersonnelCardView>();card.Bind(session,unit.Id);card.DetailsLabel.fontSize=12;}
                var outline=slot.gameObject.AddComponent<Outline>();outline.effectColor=unit==null?new Color(.32f,.39f,.45f):Color.Lerp(PrototypeUi.ParseColor(unit.Color),Color.white,.25f);outline.effectDistance=new Vector2(1,-1);
            }
            if(count==0)PrototypeUi.Label(content,"Open Inventory to inspect stored items and resource tabs.",16);
            PrototypeUi.Label(PrototypeUi.Rect("Room interior status",transform,new Vector2(.02f,0),new Vector2(.98f,.10f)),message.Length>0?message:BaseWork.ResponseRoom(state,room.Id)?(state.Workforce.BaseResponseRooms.Contains(room.Id)?"Base Response: ordinary work waits; existing Actor progress is retained.":"Local Response: assigned staff can assist other base rooms after local/Group staff."):tab=="beds"?"Beds are separate from staff. Base: "+state.Base.PersonnelRecovery.BaseHealthPerTick+" HP/tick; bed: "+state.Base.PersonnelRecovery.BedHealthPerTick+" HP/tick.":"Select a staff card or a Unit from Personnel to manage assignments.",12);
        }
        private void OnDestroy()
        {
            if(session==null)return;
            session.Selection.Changed-=Selected;session.StaffingChanged-=Refresh;session.TickCommitted-=Tick;
        }
    }
}
