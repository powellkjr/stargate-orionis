using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    public sealed class MissionMapView : MonoBehaviour
    {
        private CampaignSession session; private RectTransform viewport; private GameObject grid; private Text status;
        private Vector2 lastSize; private bool dirty; private float cellPixels;
        private string selectedAction;
        private GameObject dialogue;private string dialogueError;
        private void DialogueAction(Action action){try{dialogueError=null;action();}catch(Exception error){dialogueError=error.Message;}dirty=true;}
        private MissionMapNavigation.ViewState navigation; private MissionMiniMap minimap;
        public void Bind(CampaignSession value)
        {
            session=value;navigation=MissionMapNavigation.State(session);session.CombatChanged+=Changed;
            PrototypeUi.Label(PrototypeUi.Rect("Mission map heading",transform,new Vector2(0,.90f),new Vector2(.35f,1)),"Mission map",20);
            PrototypeUi.Button("Zoom out",transform,new Vector2(.36f,.90f),new Vector2(.46f,.99f),"-",new Color(.12f,.25f,.3f),()=>Zoom(-1));
            PrototypeUi.Button("Zoom in",transform,new Vector2(.47f,.90f),new Vector2(.57f,.99f),"+",new Color(.12f,.25f,.3f),()=>Zoom(1));
            PrototypeUi.Button("Center team",transform,new Vector2(.59f,.90f),new Vector2(.79f,.99f),"Team",new Color(.12f,.25f,.3f),()=>{FocusTeam();dirty=true;});
            PrototypeUi.Button("Fit known map",transform,new Vector2(.81f,.90f),new Vector2(.99f,.99f),"Fit",new Color(.12f,.25f,.3f),()=>{navigation.Fit=true;dirty=true;});
            viewport=PrototypeUi.Rect("Mission map viewport",transform,new Vector2(.02f,.27f),new Vector2(.98f,.88f));
            viewport.gameObject.AddComponent<Image>().color=new Color(.035f,.055f,.07f);viewport.gameObject.AddComponent<RectMask2D>();
            var input=viewport.gameObject.AddComponent<MissionMapNavigation>();input.Scroll=Zoom;input.Drag=delta=>{navigation.Center+=new Vector2(-delta.x,delta.y)/Mathf.Max(1,cellPixels);navigation.Fit=false;dirty=true;};
            status=PrototypeUi.ScrollLabel("Mission action details",transform,new Vector2(.02f,.01f),new Vector2(.98f,.25f),"Hover or select a symbol for its full action description and requirements. Scroll: zoom / drag: pan.",16);
            var mini=PrototypeUi.Rect("Offworld minimap",transform,new Vector2(.82f,.28f),new Vector2(.99f,.52f));
            minimap=mini.gameObject.AddComponent<MissionMiniMap>();minimap.Bind(session,point=>{navigation.Center=point;navigation.Fit=false;dirty=true;});dirty=true;
        }
        private void Changed(){dirty=true;}
        private void OnDestroy(){if(session!=null)session.CombatChanged-=Changed;}
        public void Zoom(float amount){navigation.Zoom=Mathf.Clamp(navigation.Zoom*Mathf.Pow(1.25f,amount),.6f,4);navigation.Fit=false;dirty=true;}
        private void FocusTeam(){var f=session.State.Base.MissionMap.Stages.Single(s=>s.Id==session.State.Expedition.StageId);navigation.Center=new Vector2((float)f.Cells.Average(c=>c.X)+.5f,(float)f.Cells.Average(c=>c.Y)+.5f);navigation.Stage=session.State.Expedition.StageId;navigation.Fit=false;}
        private void OnRectTransformDimensionsChange(){dirty=true;}
        private void LateUpdate(){if(viewport==null||session?.State.Expedition==null)return;if(!dirty&&lastSize==viewport.rect.size)return;if(viewport.rect.width<=0||viewport.rect.height<=0)return;lastSize=viewport.rect.size;dirty=false;Render();}
        private RectTransform Tile(string name,Transform parent,float x,float y,float width,float height){var r=PrototypeUi.Rect(name,parent,new Vector2(0,1),new Vector2(0,1));r.pivot=new Vector2(0,1);r.sizeDelta=new Vector2(width,height);r.anchoredPosition=new Vector2(x,-y);return r;}
        private void ShowActors(RectTransform root,float tileSize)
        {
            var bootstrap=GetComponentInParent<PrototypeBootstrap>();if(bootstrap==null)return;
            foreach(var actor in OffworldSceneActors.Visible(session.State))
            {
                var point=actor.point;var marker=Tile("Map NPC "+actor.id,root,point.x*tileSize,point.y*tileSize,tileSize*.2f,tileSize*.2f);
                if(!string.IsNullOrWhiteSpace(actor.profile)){var visual=marker.gameObject.AddComponent<OffworldMapUnit>();if(!visual.Bind(OffworldCharacterPool.For(bootstrap,session),"npc/"+actor.id,actor.profile,point,session.State.Expedition.MissionId+"/"+session.State.Expedition.StartedTick,tileSize))Destroy(visual);}
                else{var icon=marker.gameObject.AddComponent<Image>();icon.color=new Color(.85f,.65f,.28f);icon.raycastTarget=false;}
                var hit=marker.GetComponent<Graphic>();if(hit!=null)hit.raycastTarget=true;
                bool marked=session.State.Base.Cargo?.Caches.Any(c=>c.ContainerId==actor.id&&RecoveredCargo.CacheRevealed(session.State,c))==true||session.State.Base.ResourceProcessing?.InstanceId==actor.id&&ResourceCargo.Collected(session.State);
                var hint=marker.gameObject.AddComponent<MissionMapSubjectHint>();hint.Details=status;hint.Description=actor.label+" / "+(string.IsNullOrWhiteSpace(actor.profile)?"object":"NPC")+(marked?" / marked for extraction; remains at source":"")+". Action symbols are placed beside their subject.";
            }
        }
        private void DrawActions(RectTransform root,float tileSize,MissionTravelPanel panel)
        {
            var state=session.State;var definition=state.Base.Mission.Travel;var expedition=state.Expedition;
            var catalog=Resources.Load<OffworldCharacterCatalog>("OffworldCharacters/catalog");
            var gateNames=new[]{"Maintain Gate","Close Gate","Redial Gate","Extract to SGC"};
            var sources=(panel==null?Array.Empty<Button>():panel.GetComponentsInChildren<Button>()).Concat(transform.parent.GetComponentsInChildren<Button>().Where(b=>gateNames.Contains(b.name))).Distinct().ToArray();
            var stage=state.Base.MissionMap.Stages.Single(s=>s.Id==expedition.StageId);var center=new Vector2((float)stage.Cells.Average(c=>c.X)+.5f,(float)stage.Cells.Average(c=>c.Y)+.5f);var groupCounts=new System.Collections.Generic.Dictionary<string,int>();
            var context=panel==null?null:panel.GetComponentsInChildren<Text>().FirstOrDefault(t=>t.transform.parent.name=="Conversation text"||t.transform.parent.name=="Field work details"||t.transform.parent.name=="Combat health"||t.transform.parent.name=="Combat confirmation text")??panel?.GetComponentsInChildren<Text>().FirstOrDefault(t=>t.transform.parent.name=="Travel status"&&!string.IsNullOrEmpty(t.text));
            var occupied=new System.Collections.Generic.List<Vector2>();
            if(context!=null)status.text=context.text;
            foreach(var source in sources.OrderBy(b=>b.name.StartsWith("Cancel")?1:0))
            {
                if(gateNames.Contains(source.name)){var hidden=source.GetComponent<CanvasGroup>();if(hidden==null)hidden=source.gameObject.AddComponent<CanvasGroup>();hidden.alpha=0;hidden.blocksRaycasts=false;}
                if(source.name=="Redial Gate"&&(expedition.GateChoicePending||expedition.GateOpen))continue;
                if(source.name=="Extract to SGC"&&!expedition.GateOpen)continue;
                string id=null,target=null,door=null,kind=null;
                if(source.name.StartsWith("move-")){door=source.name.Substring(5);kind="MOVE";}
                else if(source.name.StartsWith("group-")){var workGroup=definition.Field.Workflows.Groups.Single(g=>g.Id==source.name.Substring(6));id=workGroup.RecipeIds[0];kind="SEARCH";}
                else if(source.name.StartsWith("hack-")){id=source.name.Substring(5);kind="HACK";door=definition.Field.DoorRecipes.FirstOrDefault(r=>r.Id==id)?.DoorId;}
                else if(source.name.StartsWith("talk-")){var scene=definition.Conversations.Single(c=>c.Id==source.name.Substring(5));target=scene.NpcId;kind="TALK";}
                else if(source.name.StartsWith("response-")||source.name=="Continue conversation"){target=definition.Conversations.Single(c=>c.Id==expedition.Travel.SceneId).NpcId;kind=source.name=="Continue conversation"?"FINISH":"TALK";}
                else if(source.name.StartsWith("action-"))id=source.name.Substring(7);
                else if(source.name.StartsWith("care-"))id=source.name.Substring(5);
                else if(source.name=="Reveal equipment cache")id=state.Base.Cargo.Reveal.Id;
                else if(source.name=="Send operative to Gate"){id=state.Base.Rescue.Requirements.Id;kind="SEND_TO_GATE";}
                else if(source.name=="inspect-resource-cache"){target=state.Base.ResourceProcessing.InstanceId;kind="INSPECT";}
                else if(source.name=="Complete field work"||source.name=="Cancel field work"){id=expedition.Travel.Field.Work.RecipeId;kind=source.name.StartsWith("Complete")?"FINISH":"CANCEL";}
                else if(source.name.StartsWith("engage-")||source.name.Contains("combat")){var battle=MissionCombat.Active(state);var encounter=state.Base.Combat.Encounters.SingleOrDefault(e=>e.Id==(battle?.IncidentId??panel?.PendingCombatId??source.name.Substring(7)));target=encounter?.Participants.FirstOrDefault()?.Id;kind=source.name=="Disengage combat"||source.name=="Cancel combat"?"CANCEL":source.name=="Start combat"?"FINISH":"ENGAGE";}
                else if(gateNames.Contains(source.name)){target="gate-01";kind=source.name=="Extract to SGC"?"EXTRACT":source.name=="Redial Gate"?"REDIAL":source.name=="Maintain Gate"?"KEEP_OPEN":"CLOSE_GATE";}
                else continue;
                var placement=catalog?.actions?.FirstOrDefault(a=>a.id==id);target=target??placement?.target;door=door??placement?.transition;kind=kind??placement?.kind??"INTERACT";
                if(string.IsNullOrWhiteSpace(door))door=null;
                if(string.IsNullOrWhiteSpace(target))target=null;
                Vector2 anchor=catalog?.sceneActors?.FirstOrDefault(a=>a.id==target)?.point??center;
                if(door!=null){var transition=definition.Transitions.SingleOrDefault(t=>t.Id==door);if(transition!=null){if(!MissionTravel.DoorVisible(state,transition))continue;var other=state.Base.MissionMap.Stages.SingleOrDefault(s=>s.Id==transition.Destination(expedition.StageId));if(other!=null){var shared=(from a in stage.Cells from b in other.Cells where Math.Abs(a.X-b.X)+Math.Abs(a.Y-b.Y)==1 select new Vector2((a.X+b.X+1)*.5f,(a.Y+b.Y+1)*.5f)).ToArray();if(shared.Length>0){anchor=shared[0];}}}}
                FieldRequirements recipe=id==null?null:MissionField.Requirements(state,id);
                // Choose the shared action first, then its eligible Actor on adjacent hexes.
                bool actorAction=recipe!=null&&!source.name.StartsWith("group-")&&source.name!="Complete field work"&&source.name!="Cancel field work";
                ConversationResponse response=source.name.StartsWith("response-")?definition.Conversations.Single(c=>c.Id==expedition.Travel.SceneId).Nodes.SelectMany(n=>n.Responses).Single(r=>r.Id==source.name.Substring(9)):null;
                var actors=actorAction&&source.interactable?MissionField.Candidates(state,recipe).Select(c=>c.ActorId).Distinct().ToArray():response!=null&&source.interactable?MissionTravel.EligibleActors(state,response).ToArray():Array.Empty<string>();
                bool needsActor=actors.Length>0;
                string soleActor=actors.Length==1?actors[0]:null;
                actors=selectedAction==source.name&&needsActor?new string[]{null}.Concat(actors).ToArray():new string[]{null};
                string group=door??target??"stage";groupCounts.TryGetValue(group,out int groupIndex);
                foreach(var actorId in actors)
                {
                    float size=Mathf.Clamp(tileSize*.24f,32,48);int q=groupIndex%3,r=groupIndex/3;groupIndex++;
                    float sx=anchor.x>center.x?-1:1,sy=anchor.y>center.y?-1:1;
                    var point=anchor+new Vector2(sx*(.8f+q*.75f),sy*(r+(q%2)*.5f)*.8660254f)*(size/tileSize);
                    if((kind=="FINISH"||kind=="CANCEL")&&navigation.ActionStage==expedition.StageId&&navigation.ActionPoint.HasValue)
                        point=navigation.ActionPoint.Value+(kind=="CANCEL"?new Vector2(.75f,.4330127f)*(size/tileSize):Vector2.zero);
                    // Closely placed authored objects can have different target groups.
                    // Keep each action clickable without moving a pinned confirmation.
                    if(kind!="FINISH")for(int attempt=0;attempt<32&&occupied.Any(p=>Vector2.Distance(p,point)*tileSize<size*.84f);attempt++)point+=new Vector2(0,sy*.8660254f*size/tileSize);
                    occupied.Add(point);
                    var rect=Tile("map-action-"+source.name+(actorId==null?"":"-actor-"+actorId),root,point.x*tileSize-size/2,point.y*tileSize-size/2,size,size);var graphic=rect.gameObject.AddComponent<MapActionHex>();
                    string displayActor=actorId??(kind=="FINISH"||kind=="CANCEL"?expedition.Travel.Field.Work?.GroupId==null?expedition.Travel.Field.Work?.ActorId:null:soleActor);
                    var unit=displayActor==null?null:state.Base.Units.Single(u=>u.Id==displayActor);graphic.BorderColor=unit==null?(source.interactable?new Color(.4f,.85f,.72f):new Color(.8f,.55f,.25f)):PrototypeUi.ParseColor(unit.Color);graphic.color=source.interactable?new Color(.08f,.25f,.28f):new Color(.12f,.16f,.2f);graphic.Details=status;graphic.Description=(context==null?"":context.text+"\n\n")+(source.GetComponentInChildren<Text>()?.text??source.name)+(unit==null?"":"\nActor: "+unit.Name+" / "+unit.Profession+unit.Tier);
                    var button=rect.gameObject.AddComponent<Button>();button.targetGraphic=graphic;button.transition=Selectable.Transition.None;button.interactable=source.interactable;
                    button.onClick.AddListener(()=>{if(status!=null)status.text=graphic.Description;if(source!=null&&source.interactable){if(kind!="CANCEL"){navigation.ActionPoint=point;navigation.ActionStage=expedition.StageId;}if(actorId==null&&needsActor){selectedAction=selectedAction==source.name?null:source.name;if(selectedAction!=null)status.text=graphic.Description+"\nChoose an Actor from the adjacent hexes.";}else if(actorId!=null&&actorAction){var candidate=MissionField.Candidates(session.State,recipe).First(c=>c.ActorId==actorId);session.StartFieldWork(recipe.Id,actorId,candidate.ToolId);}else if(actorId!=null&&response!=null)session.Respond(response.Id,actorId);else source.onClick.Invoke();dirty=true;}});
                    string symbol=kind=="HACK"||kind=="ENTER_CODE"?"#":kind=="STABILIZE"?"+":kind=="TALK"||kind=="INQUIRE"||kind=="SMALL_TALK"||kind=="PERSUADE"?"?":kind=="CANCEL"||kind=="CLOSE_GATE"?"X":kind=="FINISH"?"✓":kind=="EXTRACT"||kind=="SEND_TO_GATE"?"↑":kind=="REDIAL"?"◎":kind=="KEEP_OPEN"?"↔":kind=="ENGAGE"?"!":"↓";
                    if(response!=null)symbol=(definition.Conversations.Single(c=>c.Id==expedition.Travel.SceneId).Nodes.Single(n=>n.Id==expedition.Travel.NodeId).Responses.ToList().IndexOf(response)+1).ToString();
                    if(kind=="SEARCH")symbol="S";
                    if(kind=="MOVE")
                    {
                        var transition=definition.Transitions.Single(t=>t.Id==door);var destination=state.Base.MissionMap.Stages.Single(f=>f.Id==transition.Destination(expedition.StageId));var direction=new Vector2((float)destination.Cells.Average(c=>c.X),(float)destination.Cells.Average(c=>c.Y))-new Vector2(center.x-.5f,center.y-.5f);var icon=PrototypeUi.Rect("Travel direction",rect,new Vector2(.12f,.12f),new Vector2(.88f,.88f)).gameObject.AddComponent<TravelArrowGraphic>();icon.Direction=direction;icon.color=Color.white;icon.raycastTarget=false;
                    }
                    else{var text=PrototypeUi.Label(rect,symbol,20);if(!text.font.HasCharacter(symbol[0]))text.text=kind=="FINISH"?"+":"v";text.alignment=TextAnchor.MiddleCenter;text.rectTransform.offsetMin=Vector2.zero;text.rectTransform.offsetMax=Vector2.zero;}
                    if(unit!=null){var initials=string.Concat(unit.Name.Split(' ').Where(n=>n.Length>0).Select(n=>n[0]).Take(2));var badge=PrototypeUi.Label(PrototypeUi.Rect("Actor initials",rect,new Vector2(.1f,0),new Vector2(.9f,.25f)),initials,9);badge.alignment=TextAnchor.MiddleCenter;badge.rectTransform.offsetMin=badge.rectTransform.offsetMax=Vector2.zero;}
                }
                groupCounts[group]=groupIndex;
                if(gateNames.Contains(source.name)){var hidden=source.GetComponent<CanvasGroup>();if(hidden==null)hidden=source.gameObject.AddComponent<CanvasGroup>();hidden.alpha=0;hidden.blocksRaycasts=false;}
            }
        }
        private void Render()
        {
            var map=session.State.Base.MissionMap;if(map==null){status.text="No authored map geometry is available.";return;}
            bool talking=session.State.Expedition.Travel.SceneId!=null;status.transform.parent.gameObject.SetActive(!talking);minimap.gameObject.SetActive(!talking);viewport.anchorMin=new Vector2(.02f,talking?.46f:.27f);
            if(dialogue!=null){dialogue.SetActive(false);Destroy(dialogue);}
            if(talking){var rect=PrototypeUi.Rect("Readable mission dialogue",transform,new Vector2(.02f,.01f),new Vector2(.98f,.44f));dialogue=rect.gameObject;rect.gameObject.AddComponent<MissionDialogueView>().Show(session,selectedAction?.StartsWith("response-")==true?selectedAction.Substring(9):null,id=>{selectedAction=id==null?null:"response-"+id;dirty=true;},(id,actor)=>DialogueAction(()=>session.Respond(id,actor)),()=>DialogueAction(session.ContinueConversation),dialogueError);}
            if(grid!=null){grid.SetActive(false);Destroy(grid);}var definition=session.State.Base.Mission.Travel;var expedition=session.State.Expedition;var travel=MissionTravel.Current(session.State);
            var travelPanel=transform.parent.GetComponentInChildren<MissionTravelPanel>();
            if(travelPanel!=null){var hidden=travelPanel.GetComponent<CanvasGroup>();if(hidden==null)hidden=travelPanel.gameObject.AddComponent<CanvasGroup>();hidden.alpha=0;hidden.blocksRaycasts=false;}
            var container=PrototypeUi.Rect("Mission map content",viewport,Vector2.zero,Vector2.one);grid=container.gameObject;
            bool Known(string id)=>definition.Stages.Single(s=>s.Id==id).Known||travel.Visits.ContainsKey(id);
            var cells=map.Stages.Where(s=>Known(s.Id)).SelectMany(s=>s.Cells).ToArray();float left=cells.Min(c=>c.X)-1,right=cells.Max(c=>c.X)+2,top=cells.Min(c=>c.Y)-1,bottom=cells.Max(c=>c.Y)+2;
            if(navigation.Stage!=expedition.StageId)FocusTeam();var fit=Mathf.Min(viewport.rect.width/(right-left),viewport.rect.height/(bottom-top));
            float tileSize=navigation.Fit?fit:96*navigation.Zoom;cellPixels=tileSize;if(navigation.Fit)navigation.Center=new Vector2((left+right)*.5f,(top+bottom)*.5f);
            var root=PrototypeUi.Rect("Mission grid",container,new Vector2(.5f,.5f),new Vector2(.5f,.5f));root.sizeDelta=new Vector2(map.Width*tileSize,map.Height*tileSize);root.anchoredPosition=new Vector2((map.Width*.5f-navigation.Center.x)*tileSize,(navigation.Center.y-map.Height*.5f)*tileSize);
            minimap.SetWindow(navigation.Center,viewport.rect.size/tileSize);
            for(int y=0;y<map.Height;y++)for(int x=0;x<map.Width;x++){var cell=Tile("fog-"+x+"-"+y,root,x*tileSize,y*tileSize,tileSize-1,tileSize-1);var image=cell.gameObject.AddComponent<Image>();image.color=new Color(.075f,.095f,.12f);image.raycastTarget=false;}
            foreach(var footprint in map.Stages.Where(s=>Known(s.Id)))
            {
                var stage=definition.Stages.Single(s=>s.Id==footprint.Id);bool current=stage.Id==expedition.StageId,visited=travel.Visits.ContainsKey(stage.Id);
                foreach(var cell in footprint.Cells){var rect=Tile("map-cell-"+stage.Id+"-"+cell.X+"-"+cell.Y,root,cell.X*tileSize,cell.Y*tileSize,tileSize-2,tileSize-2);var image=rect.gameObject.AddComponent<Image>();image.color=current?new Color(.13f,.42f,.48f):visited?new Color(.16f,.3f,.38f):new Color(.16f,.2f,.25f);image.raycastTarget=false;PresentationArt.StageFloor(rect,stage.Id,current||visited);if(current){var outline=rect.gameObject.AddComponent<Outline>();outline.effectColor=new Color(1,.84f,.3f);outline.effectDistance=new Vector2(1,-1);}}
                int x0=footprint.Cells.Min(c=>c.X),y0=footprint.Cells.Min(c=>c.Y),columns=footprint.Cells.Max(c=>c.X)-x0+1;
                var label=PrototypeUi.Label(Tile("map-label-"+stage.Id,root,x0*tileSize+4,y0*tileSize+4,columns*tileSize-8,26),stage.Name,Mathf.Clamp((int)(tileSize*.15f),14,20));label.alignment=TextAnchor.UpperLeft;label.rectTransform.offsetMin=Vector2.zero;label.rectTransform.offsetMax=Vector2.zero;
                if(current){int index=0;foreach(var member in expedition.Party){var point=new Vector2(x0+.15f+(index%2)*.55f,y0+.45f+(index/2)*.30f);index++;var marker=Tile("Map team member "+member.UnitId,root,point.x*tileSize,point.y*tileSize,tileSize*.2f,tileSize*.2f);var bootstrap=GetComponentInParent<PrototypeBootstrap>();var visual=marker.gameObject.AddComponent<OffworldMapUnit>();bool animated=bootstrap!=null&&visual.Bind(OffworldCharacterPool.For(bootstrap,session),member.UnitId,session.State.Base.Units.Single(u=>u.Id==member.UnitId).Profession,point,expedition.MissionId+"/"+expedition.StartedTick,tileSize);if(!animated){Destroy(visual);PresentationArt.FieldUnit(marker,member.UnitId);}}}
            }
            var shell=PrototypeUi.Rect("Mission structural shell",root,Vector2.zero,Vector2.one).gameObject.AddComponent<Structure.RoomStructureGraphic>();shell.Show(Structure.RoomStructureAdapter.Mission(session.State),tileSize,navigation.DoorAmounts);
            foreach(var child in root.Cast<Transform>().Where(c=>c.name.StartsWith("map-label-")||c.name.StartsWith("Map team member ")).ToArray())child.SetAsLastSibling();
            ShowActors(root,tileSize);
            DrawActions(root,tileSize,travelPanel);

        }
    }
}
