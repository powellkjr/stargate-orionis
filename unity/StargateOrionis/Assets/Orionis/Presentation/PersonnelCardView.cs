using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    // A shared visual for roster rows and permanent team slots. No assignment state.
    public sealed class PersonnelCardView : MonoBehaviour
    {
        private CampaignSession session;
        private string unitId;
        private bool missionReport;
        private PersonnelHealthGraphic health;
        private Text nicknameLabel, detailsLabel, healthCount;
        private readonly Image[][] charges=new Image[2][];
        private readonly Image[] symbols=new Image[2];
        private readonly Text[] counts=new Text[2];
        private readonly Text[] tiers=new Text[2];
        private readonly float[] shownCharges={-1,-1},targetCharges=new float[2];
        private readonly Color[] toolColors=new Color[2];
        public bool HasPortrait {get;private set;}
        public Text DetailsLabel => detailsLabel;
        public void Bind(CampaignSession value,string id,bool extractionReport=false)
        {
            session=value;unitId=id;missionReport=extractionReport;
            var unit=session.State.Base.Units.Single(u=>u.Id==id);var color=PrototypeUi.ParseColor(unit.Color);
            detailsLabel=GetComponentInChildren<Text>();
            detailsLabel.alignment=TextAnchor.UpperLeft;
            detailsLabel.supportRichText=true;
            detailsLabel.horizontalOverflow=HorizontalWrapMode.Wrap;
            detailsLabel.verticalOverflow=VerticalWrapMode.Truncate;
            var edge=PrototypeUi.Rect("Profession accent",transform,Vector2.zero,new Vector2(0,1));edge.sizeDelta=new Vector2(4,0);edge.anchoredPosition=new Vector2(2,0);
            edge.gameObject.AddComponent<Image>().color=color;edge.GetComponent<Image>().raycastTarget=false;
            nicknameLabel=PrototypeUi.Label(PrototypeUi.Rect("Nickname",transform,new Vector2(.30f,.70f),new Vector2(.98f,.96f)),"",26);
            nicknameLabel.alignment=TextAnchor.UpperLeft;
            nicknameLabel.supportRichText=true;
            nicknameLabel.rectTransform.offsetMin=nicknameLabel.rectTransform.offsetMax=Vector2.zero;
            nicknameLabel.resizeTextForBestFit=true;nicknameLabel.resizeTextMinSize=14;nicknameLabel.resizeTextMaxSize=26;
            var heart=PrototypeUi.Rect("Health symbol",transform,new Vector2(.30f,.265f),new Vector2(.37f,.375f)).gameObject.AddComponent<PersonnelHeartGraphic>();heart.color=Color.white;heart.raycastTarget=false;
            var track=PrototypeUi.Rect("Health track",transform,new Vector2(.38f,.265f),new Vector2(.87f,.375f));track.gameObject.AddComponent<Image>().color=new Color(.025f,.04f,.05f);track.GetComponent<Image>().raycastTarget=false;
            health=PrototypeUi.Rect("Health fill",track,Vector2.zero,Vector2.one).gameObject.AddComponent<PersonnelHealthGraphic>();health.raycastTarget=false;
            healthCount=PrototypeUi.Label(PrototypeUi.Rect("Health count",transform,new Vector2(.88f,.265f),new Vector2(.98f,.375f)),"",11);healthCount.alignment=TextAnchor.MiddleRight;
            healthCount.rectTransform.offsetMin=healthCount.rectTransform.offsetMax=Vector2.zero;
            healthCount.resizeTextForBestFit=true;healthCount.resizeTextMinSize=6;healthCount.resizeTextMaxSize=11;
            for(int slot=0;slot<2;slot++)
            {
                var row=PrototypeUi.Rect("Tool charges "+slot,transform,new Vector2(.30f+slot*.345f,.075f),new Vector2(.635f+slot*.345f,.225f));
                var icon=PrototypeUi.Rect("Tool symbol",row,new Vector2(0,0),new Vector2(.12f,1));symbols[slot]=icon.gameObject.AddComponent<Image>();symbols[slot].preserveAspect=true;symbols[slot].raycastTarget=false;
                tiers[slot]=PrototypeUi.Label(PrototypeUi.Rect("Tool tier",row,new Vector2(.12f,0),new Vector2(.24f,1)),"",10);tiers[slot].alignment=TextAnchor.MiddleCenter;tiers[slot].rectTransform.offsetMin=tiers[slot].rectTransform.offsetMax=Vector2.zero;
                counts[slot]=PrototypeUi.Label(PrototypeUi.Rect("Charge count",row,new Vector2(.86f,0),Vector2.one),"",10);counts[slot].alignment=TextAnchor.MiddleRight;counts[slot].rectTransform.offsetMin=counts[slot].rectTransform.offsetMax=Vector2.zero;
                counts[slot].resizeTextForBestFit=true;counts[slot].resizeTextMinSize=6;counts[slot].resizeTextMaxSize=10;
                var pips=new Image[9];charges[slot]=pips;
                for(int n=0;n<9;n++)
                {
                    var pip=PrototypeUi.Rect("Charge "+n,row,new Vector2(.25f+n*.066f,.22f),new Vector2(.25f+(n+1)*.066f-.006f,.78f));pips[n]=pip.gameObject.AddComponent<Image>();pips[n].raycastTarget=false;
                }
            }
            HasPortrait=PresentationArt.Unit(transform,id,unit.Profession);
            SetDetails(detailsLabel.text);
            session.TickCommitted+=Tick;session.StaffingChanged+=Refresh;RefreshNickname();Refresh();
        }
        // Parent panels (roster, ready room, room interior) set name/profession/assignment here.
        public void SetDetails(string text)
        {
            if(detailsLabel==null)return;
            int newline=text.IndexOf('\n');
            detailsLabel.text=session.State.Base.Units.Single(u=>u.Id==unitId).Name+(newline<0?"":text.Substring(newline));
        }
        private void RefreshNickname()
        {
            if(nicknameLabel==null)return;
            var nickname=PresentationArt.Nickname(unitId);
            var text=string.IsNullOrEmpty(nickname)?"":"<b>\""+nickname+"\"</b>";
            if(nicknameLabel.text==text)return;
            nicknameLabel.text=text;
        }
        private void LateUpdate()
        {
            RefreshNickname();
            for(int slot=0;slot<2;slot++)
            {
                shownCharges[slot]=Mathf.Lerp(shownCharges[slot],targetCharges[slot],1-Mathf.Exp(-Time.unscaledDeltaTime*8));
                for(int n=0;n<9;n++)if(charges[slot]!=null)charges[slot][n].color=Color.Lerp(new Color(.10f,.14f,.18f),toolColors[slot],Mathf.Clamp01(shownCharges[slot]-n));
            }
            if(detailsLabel==null)return;
            detailsLabel.rectTransform.anchorMin=new Vector2(.30f,.40f);detailsLabel.rectTransform.anchorMax=new Vector2(.98f,.70f);
            detailsLabel.rectTransform.offsetMin=detailsLabel.rectTransform.offsetMax=Vector2.zero;
            detailsLabel.alignment=TextAnchor.UpperLeft;detailsLabel.fontSize=12;
        }
        private void Tick(long _) => Refresh();
        private void Refresh()
        {
            if(health==null)return;
            int currentHealth=missionReport&&session.State.Expedition?.Returned==true?MissionCombat.Inspect(session.State).PartyHealth[unitId]:PersonnelCondition.Health(session.State,unitId);
            float hp=currentHealth/(float)PersonnelCondition.MaximumHealth(session.State);
            health.SetHealth(currentHealth,PersonnelCondition.MaximumHealth(session.State),PrototypeUi.ParseColor(hp<=.25f?"#d1495b":hp<=.5f?"#f2c94c":"#45b97a"));
            healthCount.text=currentHealth+"/"+PersonnelCondition.MaximumHealth(session.State);
            var tools=PersonnelCondition.Tools(session.State,unitId);
            for(int slot=0;slot<2;slot++)
            {
                var tool=tools.SingleOrDefault(t=>t.Slot==slot);symbols[slot].sprite=tool==null?null:PresentationArt.ToolIcon(tool.KitId);symbols[slot].color=tool==null?Color.clear:Color.white;
                int displayCharges=tool?.Charges??0;
                if(missionReport&&tool!=null&&session.State.Expedition?.Returned==true)displayCharges=Mathf.Max(0,displayCharges-session.State.Expedition.Travel.Field.Completed.Where(w=>w.ToolId==tool.InstanceId&&w.ToolChargesRestored).Sum(w=>MissionField.Requirements(session.State,w.RecipeId).ChargeCost));
                counts[slot].text=tool==null?"—":displayCharges+"/9";
                tiers[slot].text=tool==null?"":new string('I',tool.Tier);
                toolColors[slot]=tool==null?Color.gray:tool.Damaged?new Color(1,.65f,.25f):PresentationArt.ToolColor(tool.KitId,Color.white);
                targetCharges[slot]=displayCharges;if(shownCharges[slot]<0)shownCharges[slot]=targetCharges[slot];
            }
        }
        private void OnDestroy(){if(session!=null){session.TickCommitted-=Tick;session.StaffingChanged-=Refresh;}}
    }
    // Smooth presentation follows committed health; it never predicts simulation.
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class PersonnelHealthGraphic : MaskableGraphic
    {
        private float target,shown=-1;
        public void SetHealth(int value,int max,Color tint){target=Mathf.Clamp01(value/(float)Mathf.Max(1,max));if(shown<0)shown=target;color=tint;SetVerticesDirty();}
        private void Update(){float next=Mathf.Lerp(shown,target,1-Mathf.Exp(-Time.unscaledDeltaTime*8));if(Mathf.Abs(next-target)<.0001f)next=target;if(next!=shown){shown=next;SetVerticesDirty();}}
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear();var r=GetPixelAdjustedRect();float right=r.xMin+r.width*Mathf.Max(0,shown);
            mesh.AddVert(new Vector3(r.xMin,r.yMin),color,Vector2.zero);mesh.AddVert(new Vector3(r.xMin,r.yMax),color,Vector2.zero);
            mesh.AddVert(new Vector3(right,r.yMax),color,Vector2.zero);mesh.AddVert(new Vector3(right,r.yMin),color,Vector2.zero);
            mesh.AddTriangle(0,1,2);mesh.AddTriangle(0,2,3);
        }
    }
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class PersonnelHeartGraphic : MaskableGraphic
    {
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear();var r=GetPixelAdjustedRect();float size=Mathf.Min(r.width,r.height);var origin=r.center-new Vector2(size,size)*.5f;
            var points=new[]{new Vector2(.5f,.05f),new Vector2(.08f,.48f),new Vector2(.04f,.72f),new Vector2(.20f,.94f),new Vector2(.38f,.94f),new Vector2(.5f,.80f),new Vector2(.62f,.94f),new Vector2(.80f,.94f),new Vector2(.96f,.72f),new Vector2(.92f,.48f)};
            mesh.AddVert(origin+new Vector2(.5f,.55f)*size,color,Vector2.zero);
            foreach(var p in points)mesh.AddVert(origin+p*size,color,Vector2.zero);
            for(int i=0;i<points.Length;i++)mesh.AddTriangle(0,i+1,(i+1)%points.Length+1);
        }
    }
}
