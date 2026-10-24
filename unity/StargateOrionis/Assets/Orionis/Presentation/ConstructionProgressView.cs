using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    // Passive presentation: interpolation and pulse never advance simulation work.
    public sealed class ConstructionProgressView : MonoBehaviour
    {
        private CampaignSession session;
        private RoomConstructionSite site;
        private Text title, phase;
        private RecipeProgressGraphic rail;
        public static string Key(RoomConstructionSite site) => site.FromTier.HasValue ? site.WorkId : site.RoomId;
        public void Bind(CampaignSession value, RoomConstructionSite work)
        {
            session=value;site=work;
            gameObject.AddComponent<Image>().color=new Color(.055f,.085f,.12f);
            var border=gameObject.AddComponent<Outline>();border.effectColor=new Color(.2f,.32f,.4f);border.effectDistance=new Vector2(1,-1);
            title=Label("Build title",new Vector2(.015f,.66f),new Vector2(.985f,.97f),14);
            phase=Label("Build phase",new Vector2(.015f,.38f),new Vector2(.985f,.68f),12);
            rail=PrototypeUi.Rect("Progress rail",transform,new Vector2(.015f,.06f),new Vector2(.985f,.36f)).gameObject.AddComponent<RecipeProgressGraphic>();
            Refresh(work,true);
        }
        private Text Label(string name,Vector2 min,Vector2 max,int size)
        {
            var text=PrototypeUi.Label(PrototypeUi.Rect(name,transform,min,max),"",size);
            text.rectTransform.offsetMin=new Vector2(3,0);text.rectTransform.offsetMax=new Vector2(-3,0);return text;
        }
        public void Refresh(RoomConstructionSite work,bool immediate=false)
        {
            site=work;var setup=session.State.Base.Construction;
            var name=session.State.Base.Planning.Rooms.Single(p=>p.Room.Id==work.DefinitionId).Room.Name;
            title.text=work.RoomId+"  "+name+(work.FromTier.HasValue?"  CT"+work.FromTier+" > "+work.Tier:"")+"   "+(100d*work.WorkedTicks/work.DurationTicks).ToString("0")+"%";
            var blocker=work.Completed?null:RoomConstruction.RuntimeBlocker(session.State,work);
            string profession=work.WorkedTicks<setup.SecurityTicks?setup.SecurityProfession:setup.Profession;
            phase.text=work.Completed?"COMPLETE":profession+" / "+(work.WorkedTicks<setup.SecurityTicks?"site security":"construction")+"   /   "+((work.DurationTicks-work.WorkedTicks)*CampaignTiming.MinutesPerTick/60d).ToString("0.#")+"h remaining"+(work.Paused?" / PAUSED":blocker==null?"":" / "+blocker);
            phase.color=blocker==null?new Color(.65f,.78f,.85f):new Color(1,.65f,.42f);
            int hourTicks=60/CampaignTiming.MinutesPerTick;
            int remainder=(int)(work.DurationTicks-setup.SecurityTicks);
            var durations=new[]{setup.SecurityTicks}.Concat(Enumerable.Repeat(hourTicks,remainder/hourTicks)).Concat(Enumerable.Repeat(1,remainder%hourTicks)).ToArray();
            var fractions=new float[durations.Length];var colors=new Color[durations.Length];
            long start=0;
            for(int i=0;i<durations.Length;i++)
            {
                fractions[i]=Mathf.Clamp01((float)(work.WorkedTicks-start)/durations[i]);
                colors[i]=PrototypeUi.ParseColor(session.State.Base.Units.First(u=>u.Profession==(i==0?setup.SecurityProfession:setup.Profession)).Color);
                start+=durations[i];
            }
            rail.SetSegments(fractions,colors,immediate||work.Completed);
        }
    }
}
