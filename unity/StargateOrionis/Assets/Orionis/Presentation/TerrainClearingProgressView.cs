using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    public sealed class TerrainClearingProgressView : MonoBehaviour
    {
        private CampaignSession session;
        private Text title,phase;
        private RecipeProgressGraphic rail;
        public void Bind(CampaignSession value,TerrainClearingOrder order)
        {
            session=value;gameObject.AddComponent<Image>().color=new Color(.055f,.085f,.12f);
            title=PrototypeUi.Label(PrototypeUi.Rect("Clearing title",transform,new Vector2(.015f,.65f),new Vector2(.985f,1)),"",14);
            phase=PrototypeUi.Label(PrototypeUi.Rect("Clearing phase",transform,new Vector2(.015f,.36f),new Vector2(.985f,.7f)),"",12);
            title.rectTransform.offsetMin=phase.rectTransform.offsetMin=new Vector2(3,0);
            title.rectTransform.offsetMax=phase.rectTransform.offsetMax=new Vector2(-3,0);
            rail=PrototypeUi.Rect("Clearing rail "+order.Cell,transform,new Vector2(.015f,.06f),new Vector2(.985f,.36f)).gameObject.AddComponent<RecipeProgressGraphic>();
            Refresh(order,true);
        }
        public void Refresh(TerrainClearingOrder order,bool immediate=false)
        {
            int completed=order.Bubbles.Count(b=>b.CompletedTick.HasValue);
            title.text="Clear rock "+order.Cell+"   "+completed+"/"+order.Bubbles.Count+" bubbles";
            phase.text=(order.Completed?"COMPLETE":"Maintenance / mixed work")+" / "+order.CreditedSupply.ToString("0.##")+" / "+session.State.Base.Construction.RockSupply.ToString("0.##")+" Supply deposited"+(order.Completed||TerrainClearing.AvailableActors(session.State).Any()?"":" / waiting for available staff");
            var fractions=order.Bubbles.Select((b,i)=>(float)b.Ticks/TerrainClearing.WorkBubbles(session.State,order)[i].DurationTicks).ToArray();
            var colors=order.Bubbles.Select(b=>b.ActorId==null?Color.white:PrototypeUi.ParseColor(session.State.Base.Units.Single(u=>u.Id==b.ActorId).Color)).ToArray();
            rail.SetSegments(fractions,colors,immediate||order.Completed);
        }
    }
}
