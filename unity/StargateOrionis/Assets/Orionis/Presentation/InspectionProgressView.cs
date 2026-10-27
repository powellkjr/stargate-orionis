using System;
using System.Collections.Generic;
using System.Linq;
using Orionis.Domain;
using Orionis.Application;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class InspectionWork
    {
        public int Duration { get; }
        public int Ticks { get; }
        public string Profession { get; }
        public string Actor { get; }
        public InspectionWork(int duration,int ticks,string profession,string actor)
        {Duration=duration;Ticks=ticks;Profession=profession;Actor=actor;}
    }
    // Legacy step counters are displayed in the same one/20-tick work chunks as
    // construction. This view never creates, completes or spends execution work.
    public sealed class InspectionProgressView : MonoBehaviour
    {
        private Text caption;
        private RecipeProgressGraphic rail;
        private InspectionProgressAnimation animation;
        private Color[] palette;
        public RecipeProgressGraphic Rail => rail;
        public void Show(CampaignState state,string title,IEnumerable<InspectionWork> work,CampaignSession session=null,string key=null)
        {
            if(rail==null)
            {
                caption=PrototypeUi.Label(PrototypeUi.Rect("Inspection progress caption",transform,new Vector2(0,.55f),Vector2.one),"",13);
                caption.rectTransform.offsetMin=new Vector2(2,0);caption.rectTransform.offsetMax=new Vector2(-2,0);
                caption.resizeTextForBestFit=true;caption.resizeTextMinSize=9;caption.resizeTextMaxSize=13;
                rail=PrototypeUi.Rect("Inspection bubbles",transform,new Vector2(0,.04f),new Vector2(1,.5f)).gameObject.AddComponent<RecipeProgressGraphic>();
            }
            var fractions=new List<float>();var colors=new List<Color>();
            foreach(var step in work)
            {
                var actor=state.Base.Units.FirstOrDefault(u=>u.Id==step.Actor);
                var requirement=state.Base.Units.FirstOrDefault(u=>u.Profession==step.Profession);
                var color=actor!=null?PrototypeUi.ParseColor(actor.Color):requirement!=null?PrototypeUi.ParseColor(requirement.Color):Color.white;
                int start=0;
                while(start<step.Duration)
                {
                    int duration=step.Duration-start>=20?20:1;
                    fractions.Add(Mathf.Clamp01((step.Ticks-start)/(float)duration));colors.Add(color);start+=duration;
                }
            }
            caption.text=title+" / "+fractions.Count(f=>f>=1)+"/"+fractions.Count+" bubbles";
            palette=colors.ToArray();
            animation=session!=null&&key!=null?InspectionProgressAnimation.Track(session,key,fractions.ToArray()):null;
            rail.SetSegments(animation?.Value(Time.unscaledTime)??fractions.ToArray(),palette,animation!=null);

        }
        private void Update(){if(animation!=null&&rail!=null)rail.SetSegments(animation.Value(Time.unscaledTime),palette,true);}
        public void Receiving(CampaignState state,ReceivingOrder order,CampaignSession session=null)
        {
            var steps=RecoveredCargo.Catalog(state).Steps;
            Show(state,"Receiving inspection",steps.Select((s,i)=>new InspectionWork(s.DurationTicks,order?.Progress[i].Ticks??0,s.Profession,order?.Progress[i].ActorId)),session,"receiving/"+order?.InstanceId+"/"+order?.StartedTick);
        }
        public void Cargo(CampaignState state,RecoveredItem item,CampaignSession session=null)
        {
            if(item.Examination!=null){var step=state.Base.Processing.Step;Show(state,"Analysis",new[]{new InspectionWork(step.DurationTicks,item.Examination.Ticks,step.Profession,item.Examination.ActorId)},session,"analysis/"+item.Id+"/"+item.Examination.StartedTick);}
            else if(item.Handling!=null){var step=state.Base.Handling.Step;Show(state,"Handling review",new[]{new InspectionWork(step.DurationTicks,item.Handling.Ticks,step.Profession,item.Handling.ActorId)},session,"handling/"+item.Id+"/"+item.Handling.StartedTick);}
            else Receiving(state,state.Receiving.SingleOrDefault(o=>o.InstanceId==item.Id),session);
        }
    }
}
