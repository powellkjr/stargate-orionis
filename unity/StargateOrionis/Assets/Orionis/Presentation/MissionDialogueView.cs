using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    // Readable counterpart to the numbered map hexes. Selection is presentation
    // state; only choosing a qualified speaker commits an authored response.
    public sealed class MissionDialogueView : MonoBehaviour
    {
        public void Show(CampaignSession session,string responseId,Action<string> select,Action<string,string> respond,Action finish,string error)
        {
            var state=session.State;var travel=state.Expedition.Travel;
            var scene=state.Base.Mission.Travel.Conversations.Single(s=>s.Id==travel.SceneId);
            var node=scene.Nodes.Single(n=>n.Id==travel.NodeId);
            var npc=state.Base.Mission.Travel.Npcs.FirstOrDefault(n=>n.Id==scene.NpcId)?.Label??travel.Field.Subjects.Single(s=>s.Id==scene.NpcId).Label;
            (GetComponent<Image>()??gameObject.AddComponent<Image>()).color=new Color(.055f,.09f,.12f);
            var selected=node.Responses.SingleOrDefault(r=>r.Id==responseId);
            var heading=PrototypeUi.Label(PrototypeUi.Rect("Dialogue step",transform,new Vector2(.02f,.84f),new Vector2(.98f,.99f)),node.End?"Conversation / read the reply, then Continue":selected==null?"1. Choose a response / "+node.Responses.Count+" choices (scroll the list)":"2. Choose who says it (scroll the list)",17);
            heading.rectTransform.offsetMin=new Vector2(4,0);heading.rectTransform.offsetMax=new Vector2(-4,0);
            string speech=npc+":\n"+node.Text;
            var last=travel.History.LastOrDefault(h=>h.SceneId==scene.Id&&h.ActorId!=null);
            if(last!=null){var previous=scene.Nodes.SelectMany(n=>n.Responses).Single(r=>r.Id==last.EntryId);speech=state.Base.Units.Single(u=>u.Id==last.ActorId).Name+": "+previous.Text+"\n\n"+speech;}
            PrototypeUi.ScrollLabel("Readable conversation",transform,new Vector2(.02f,.10f),new Vector2(.52f,.84f),speech,17);
            if(!string.IsNullOrEmpty(error)){var message=PrototypeUi.Label(PrototypeUi.Rect("Dialogue error",transform,new Vector2(.02f,0),new Vector2(.98f,.1f)),error,13);message.color=new Color(1,.65f,.45f);message.rectTransform.offsetMin=message.rectTransform.offsetMax=Vector2.zero;}
            if(node.End){PrototypeUi.Button("Read conversation continue",transform,new Vector2(.56f,.26f),new Vector2(.98f,.64f),"Continue",new Color(.12f,.35f,.4f),()=>finish());return;}
            var viewport=PrototypeUi.Rect("Readable response viewport",transform,new Vector2(.55f,.08f),new Vector2(.955f,.83f));viewport.gameObject.AddComponent<Image>().color=new Color(.04f,.07f,.09f);viewport.gameObject.AddComponent<RectMask2D>();
            var content=PrototypeUi.Rect("Readable response entries",viewport,new Vector2(0,1),Vector2.one);content.pivot=new Vector2(.5f,1);
            var scroll=viewport.gameObject.AddComponent<ScrollRect>();scroll.content=content;scroll.viewport=viewport;scroll.horizontal=false;scroll.scrollSensitivity=35;scroll.movementType=ScrollRect.MovementType.Clamped;
            var track=PrototypeUi.Rect("Dialogue list scrollbar",transform,new Vector2(.963f,.08f),new Vector2(.982f,.83f));track.gameObject.AddComponent<Image>().color=new Color(.08f,.15f,.19f);var bar=track.gameObject.AddComponent<Scrollbar>();bar.direction=Scrollbar.Direction.BottomToTop;
            var handle=PrototypeUi.Rect("Dialogue list handle",track,Vector2.zero,Vector2.one);var handleImage=handle.gameObject.AddComponent<Image>();handleImage.color=new Color(.35f,.65f,.7f);bar.handleRect=handle;bar.targetGraphic=handleImage;scroll.verticalScrollbar=bar;
            int index=0;
            Button Row(string name,string text,Color color,Action click){int row=index++;var button=PrototypeUi.Button(name,content,new Vector2(0,1),Vector2.one,text,color,()=>click());var rect=button.GetComponent<RectTransform>();rect.offsetMin=new Vector2(2,-(row+1)*78+2);rect.offsetMax=new Vector2(-2,-row*78-2);button.GetComponentInChildren<Text>().fontSize=15;return button;}
            if(selected==null)
            {
                foreach(var response in node.Responses){int number=node.Responses.ToList().IndexOf(response)+1;var actors=MissionTravel.EligibleActors(state,response).ToArray();var button=Row("Choose response "+response.Id,number+". "+response.Text+(response.Profession==null?"":"\n"+response.Profession+" "+response.MinimumTier)+(actors.Length==0?" / no qualified speaker":""),new Color(.12f,.25f,.32f),()=>select(response.Id));button.interactable=actors.Length>0;}
            }
            else
            {
                Row("Back to dialogue responses","Back to responses",new Color(.18f,.23f,.28f),()=>select(null));
                Row("Selected dialogue response",selected.Text,new Color(.09f,.17f,.21f),()=>{}).interactable=false;
                foreach(var id in MissionTravel.EligibleActors(state,selected)){var unit=state.Base.Units.Single(u=>u.Id==id);var button=Row("Choose speaker "+id,unit.Name+"\n"+unit.Profession+" "+unit.Tier,Color.Lerp(PrototypeUi.ParseColor(unit.Color),Color.black,.68f),()=>respond(selected.Id,id));var outline=button.gameObject.AddComponent<Outline>();outline.effectColor=PrototypeUi.ParseColor(unit.Color);outline.effectDistance=new Vector2(2,-2);}
            }
            content.sizeDelta=new Vector2(0,Math.Max(78,index*78));
            scroll.verticalNormalizedPosition=1;
        }
    }
}
