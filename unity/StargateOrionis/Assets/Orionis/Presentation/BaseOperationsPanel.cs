using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    public sealed class BaseOperationsPanel : MonoBehaviour
    {
        private CampaignSession session;private Action back;private Action<BaseOperation> open;private string filter="All",message="";private float position=1;private bool resetScroll;
        public void Bind(CampaignSession value,Action close,Action<BaseOperation> navigate){session=value;back=close;open=navigate;session.TickCommitted+=Tick;session.StaffingChanged+=Render;session.ReceivingChanged+=Render;Render();}
        private void Tick(long tick)=>Render();
        private static bool Blocked(BaseOperation j)=>!j.Complete&&!j.Paused&&(j.Status.StartsWith("Waiting",StringComparison.OrdinalIgnoreCase)||j.Status.StartsWith("Assign",StringComparison.OrdinalIgnoreCase)||j.Status.StartsWith("Queued",StringComparison.OrdinalIgnoreCase));
        private void Render()
        {
            var old=GetComponentInChildren<ScrollRect>();if(old!=null&&!resetScroll)position=old.verticalNormalizedPosition;resetScroll=false;
            foreach(Transform child in transform){child.gameObject.SetActive(false);Destroy(child.gameObject);}
            var s=session.State;var all=BaseOperations.Jobs(s);
            PrototypeUi.Label(PrototypeUi.Rect("Operations title",transform,new Vector2(.02f,.90f),new Vector2(.77f,1)),"Base operations / "+all.Count(j=>!j.Complete)+" unfinished / "+all.Count(Blocked)+" blocked",23);
            PrototypeUi.Button("Close operations",transform,new Vector2(.81f,.92f),new Vector2(.98f,.99f),"Back to base",new Color(.12f,.30f,.36f),()=>back());
            string[] filters={"Active","Blocked","Completed","All"};for(int i=0;i<filters.Length;i++){string f=filters[i];PrototypeUi.Button("Operations filter "+f,transform,new Vector2(.02f+i*.125f,.82f),new Vector2(.14f+i*.125f,.89f),f,new Color(.12f,.25f,.32f),()=>{filter=f;position=1;resetScroll=true;Render();});}
            PrototypeUi.Label(PrototypeUi.Rect("Operations power",transform,new Vector2(.50f,.82f),new Vector2(.98f,.90f)),"PWR "+RoomCores.ActualPower(s).ToString("0.#")+" used / "+RoomCores.Reserved(s).ToString("0.#")+" reserved / "+RoomCores.Generated(s).ToString("0.#")+" generated",15);
            var jobs=all.Where(j=>filter=="All"||filter=="Completed"&&j.Complete||filter=="Blocked"&&Blocked(j)||filter=="Active"&&!j.Complete).ToArray();
            var view=PrototypeUi.Rect("Operations viewport",transform,new Vector2(.02f,.06f),new Vector2(.98f,.81f));view.gameObject.AddComponent<RectMask2D>();var content=PrototypeUi.Rect("Operations rows",view,new Vector2(0,1),Vector2.one);content.pivot=new Vector2(.5f,1);content.sizeDelta=new Vector2(0,Math.Max(150,jobs.Length*150));var scroll=view.gameObject.AddComponent<ScrollRect>();scroll.viewport=view;scroll.content=content;scroll.horizontal=false;scroll.scrollSensitivity=40;scroll.verticalNormalizedPosition=position;
            for(int i=0;i<jobs.Length;i++)
            {var job=jobs[i];var row=PrototypeUi.Rect("Operation "+job.Kind+" "+job.Id,content,new Vector2(0,1),Vector2.one);row.offsetMin=new Vector2(2,-(i+1)*150+5);row.offsetMax=new Vector2(-2,-i*150-3);row.gameObject.AddComponent<Image>().color=job.Paused?new Color(.20f,.18f,.12f):Blocked(job)?new Color(.19f,.13f,.13f):new Color(.08f,.14f,.19f);
             PrototypeUi.Label(PrototypeUi.Rect("Operation details",row,new Vector2(.01f,.29f),new Vector2(.77f,.99f)),job.Name+" / "+job.RoomId+"\n"+job.Status+(string.IsNullOrEmpty(job.Actors)?"":"\n"+job.Actors),15);
             var rail=PrototypeUi.Rect("Operation progress",row,new Vector2(.01f,.05f),new Vector2(.75f,.20f)).gameObject.AddComponent<Image>();rail.color=new Color(.08f,.10f,.12f);var fill=PrototypeUi.Rect("Operation fill",rail.transform,Vector2.zero,new Vector2(job.Total==0?0:Mathf.Clamp01(job.Progress/(float)job.Total),1));fill.gameObject.AddComponent<Image>().color=job.Complete?new Color(.2f,.7f,.4f):new Color(.25f,.65f,.7f);
             PrototypeUi.Button("Open operation "+job.Kind+" "+job.Id,row,new Vector2(.80f,.54f),new Vector2(.99f,.94f),job.Historical?"Open room":"Open work",new Color(.12f,.30f,.36f),()=>open(job));
             if(job.CanPause)PrototypeUi.Button("Pause operation "+job.Kind+" "+job.Id,row,new Vector2(.80f,.07f),new Vector2(.99f,.47f),job.Paused?"Resume":"Pause",new Color(.17f,.24f,.30f),()=>{try{if(job.Kind=="receiving")session.PauseInspection(job.Id,!job.Paused);else if(job.Kind=="handling")session.PauseHandlingReview(job.Id,!job.Paused);else if(job.Kind=="analysis")session.PauseCargoExamination(job.Id,!job.Paused);else session.PauseConstruction(job.Id,!job.Paused);}catch(Exception e){message=e.Message;}Render();});
            }
            if(jobs.Length==0)PrototypeUi.Label(content,filter=="Blocked"?"No blocked work.":"No work in this view.",20);
            PrototypeUi.Label(PrototypeUi.Rect("Operations status",transform,new Vector2(.02f,0),new Vector2(.98f,.05f)),message.Length>0?message:"Open work to reach its room, queue or construction plan. Pause preserves completed work and sticky Actors.",13);
            Canvas.ForceUpdateCanvases();scroll.verticalNormalizedPosition=position;
        }
        private void OnDestroy(){if(session==null)return;session.TickCommitted-=Tick;session.StaffingChanged-=Render;session.ReceivingChanged-=Render;}
    }
}
