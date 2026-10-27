using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    public sealed class RoomCorePanel : MonoBehaviour
    {
        public void Show(CampaignSession session,string roomId,Action<Action> run)
        {
            var s=session.State;var room=s.Base.Rooms.Single(r=>r.Id==roomId);
            string power="PWR "+RoomCores.ActualPower(s).ToString("0.#")+" used / "+RoomCores.Reserved(s).ToString("0.#")+" reserved / "+RoomCores.Generated(s).ToString("0.#")+" available";
            PrototypeUi.Label(PrototypeUi.Rect("Core power",transform,new Vector2(.02f,.83f),new Vector2(.98f,1)),power+"\nEmbedded T0 is permanent; installed equipment reserves maximum active PWR.",14);
            var viewport=PrototypeUi.Rect("Core viewport",transform,new Vector2(.02f,.02f),new Vector2(.98f,.82f));viewport.gameObject.AddComponent<RectMask2D>();
            var content=PrototypeUi.Rect("Core controls",viewport,new Vector2(0,1),Vector2.one);content.pivot=new Vector2(.5f,1);
            var scroll=viewport.gameObject.AddComponent<ScrollRect>();scroll.viewport=viewport;scroll.content=content;scroll.horizontal=false;scroll.scrollSensitivity=35;
            int row=0;
            void Label(string name,string text,int height=42){var rect=PrototypeUi.Rect(name,content,new Vector2(0,1),Vector2.one);rect.offsetMin=new Vector2(4,-row-height);rect.offsetMax=new Vector2(-4,-row);PrototypeUi.Label(rect,text,14);row+=height;}
            void Button(string name,string text,Action action,bool enabled=true){var button=PrototypeUi.Button(name,content,new Vector2(0,1),Vector2.one,text,new Color(.12f,.30f,.36f),()=>run(action));var rect=button.GetComponent<RectTransform>();rect.offsetMin=new Vector2(4,-row-38);rect.offsetMax=new Vector2(-4,-row-4);button.interactable=enabled;row+=42;}
            var order=s.Cores.Orders.LastOrDefault(o=>o.RoomId==roomId&&!o.CompletedTick.HasValue);
            if(order!=null){Label("Core work reason",(order.Installing?"Installing ":"Removing ")+RoomCores.Definition(s,s.Cores.Instances.Single(c=>c.Id==order.CoreId)).Name+"\n"+RoomCores.BlockedReason(s,order),74);var rect=PrototypeUi.Rect("Core Recipe",content,new Vector2(0,1),Vector2.one);rect.offsetMin=new Vector2(4,-row-76);rect.offsetMax=new Vector2(-4,-row);rect.gameObject.AddComponent<InspectionProgressView>().Show(s,"Reconfiguration",order.Work.Bubbles.Select((b,i)=>new InspectionWork(s.Base.Cores.Installation[i].DurationTicks,b.Ticks,s.Base.Cores.Installation[i].Profession,b.ActorId)),session,"core/"+order.CoreId+"/"+order.StartedTick);row+=80;}
            foreach(var core in s.Cores.Instances.Where(c=>c.RoomId==roomId).OrderBy(c=>c.Slot))
            {var d=RoomCores.Definition(s,core);Label("Core "+core.Id,"Slot "+(core.Slot+1)+": "+d.Name+"\n"+d.IdlePower+" idle / "+d.ActivePower+" active PWR");Button("Uninstall "+core.Id,"Remove to Warehouse / "+s.Base.Cores.Installation.Sum(b=>b.DurationTicks)+" ticks",()=>session.ReconfigureCore(core.Id),order==null);}
            int empty=RoomCores.Capacity(s,roomId)-s.Cores.Instances.Count(c=>c.RoomId==roomId);
            Label("Core vacancies",empty+" free physical-room Core slots.\nUninstalled equipment retains a Warehouse place; removal reserves it before work.",64);
            foreach(var core in s.Cores.Instances.Where(c=>c.RoomId==null&&RoomCores.Compatible(s,c,roomId)))
            {var d=RoomCores.Definition(s,core);Button("Install "+core.Id,d.Name+" · Warehouse "+core.WarehouseId+"\nInstall / "+s.Base.Cores.Installation.Sum(b=>b.DurationTicks)+" ticks / reserve "+d.ActivePower+" PWR",()=>session.ReconfigureCore(core.Id,roomId),order==null&&empty>0);}
            content.sizeDelta=new Vector2(0,Math.Max(row,100));
        }
    }
}
