using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class BasePlanningPanel : MonoBehaviour
    {
        private CampaignSession session;
        private RoomPlanningCatalog catalog;
        private RoomPlanDefinition selected;
        private RectTransform board;
        private GameObject preview;
        private Text details, status, tierLabel;
        private int tier, col, row;
        private Button buildButton;
        private Text staffingStatus;
        private Text supplyLabel;
        private enum CellContext { None, Room, Rock, Empty, Site }
        private CellContext context;private bool placing,placed;private RectTransform carousel;private RectTransform categoryJumps;private Button clearButton,cancelPlacement;
        private RectTransform progressContent;
        private readonly System.Collections.Generic.Dictionary<string, ConstructionProgressView> progressViews = new System.Collections.Generic.Dictionary<string, ConstructionProgressView>();
        private readonly System.Collections.Generic.Dictionary<string, TerrainClearingProgressView> clearingViews = new System.Collections.Generic.Dictionary<string, TerrainClearingProgressView>();
        private bool managing;
        private string managedRoom, joinTarget;
        private RectTransform groupActions;
        private string groupActionKey;
        private readonly System.Collections.Generic.Dictionary<string,PlanningJoinOutline> joinOutlines=new System.Collections.Generic.Dictionary<string,PlanningJoinOutline>();

        public void Bind(CampaignSession value, Action back)
        {
            session=value;catalog=session.State.Base.Planning;
            PrototypeUi.Label(PrototypeUi.Rect("Planning heading",transform,new Vector2(.01f,.95f),new Vector2(.65f,1)),"Base planning / select a room or cell",22);
            PrototypeUi.Button("Close base planning",transform,new Vector2(.84f,.95f),new Vector2(.99f,.995f),"Back to base",new Color(.12f,.3f,.36f),()=>back());
            var frame=PrototypeUi.Rect("Expansion grid frame",transform,new Vector2(.02f,.41f),new Vector2(.65f,.9f));board=PrototypeUi.Rect("Expansion grid",frame,Vector2.zero,Vector2.one);var aspect=board.gameObject.AddComponent<AspectRatioFitter>();aspect.aspectMode=AspectRatioFitter.AspectMode.FitInParent;aspect.aspectRatio=(float)catalog.Columns/catalog.Rows;
            for(int y=0;y<catalog.Rows;y++)for(int x=0;x<catalog.Columns;x++)
            {
                int cx=x,cy=y;var room=session.State.Base.Rooms.FirstOrDefault(r=>x>=r.Col&&x<r.Col+r.Definition.Width&&y>=r.Row&&y<r.Row+r.Definition.Height);bool clear=RoomConstruction.IsClear(session.State,x,y);
                var button=PrototypeUi.Button("Plan cell "+x+" "+y,board,new Vector2((float)x/catalog.Columns,1f-(float)(y+1)/catalog.Rows),new Vector2((float)(x+1)/catalog.Columns,1f-(float)y/catalog.Rows),room?.Id??(clear?"":"Rock"),room==null?(clear?new Color(.12f,.16f,.2f):new Color(.29f,.26f,.23f)):Color.Lerp(PrototypeUi.ParseColor(room.Definition.Color),Color.black,.5f),()=>SelectCell(cx,cy));button.GetComponentInChildren<Text>().fontSize=12;
            }
            details=PrototypeUi.ScrollLabel("Planned room details",transform,new Vector2(.68f,.40f),new Vector2(.99f,.89f),"Select a cell to inspect it.",16);
            tierLabel=PrototypeUi.Button("Plan construction tier",transform,new Vector2(.68f,.90f),new Vector2(.99f,.945f),"",new Color(.12f,.3f,.36f),()=>{if(managing||selected==null)return;var tiers=selected.CoresByTier.Keys.OrderBy(t=>t).ToArray();tier=tiers[(Array.IndexOf(tiers,tier)+1)%tiers.Length];placed=false;placing=true;Refresh();}).GetComponentInChildren<Text>();
            staffingStatus=PrototypeUi.Label(PrototypeUi.Rect("Construction readiness",transform,new Vector2(.68f,.28f),new Vector2(.99f,.39f)),"",13);staffingStatus.rectTransform.offsetMin=new Vector2(4,0);staffingStatus.rectTransform.offsetMax=new Vector2(-4,0);
            buildButton=PrototypeUi.Button("Build room",transform,new Vector2(.68f,.025f),new Vector2(.99f,.105f),"Build",new Color(.12f,.35f,.3f),()=>{try{if(managing)session.UpgradeRoom(managedRoom);else if(placed){session.BuildRoom(selected.Room.Id,tier,col,row);placing=placed=false;context=CellContext.Site;Refresh();}}catch(Exception e){status.text=e.Message;}});
            clearButton=PrototypeUi.Button("Clear selected rock",transform,new Vector2(.68f,.025f),new Vector2(.99f,.105f),"Clear / 8 bubbles",new Color(.35f,.28f,.13f),()=>{try{session.ExcavateCell(col,row);Refresh();}catch(Exception e){status.text=e.Message;}});
            cancelPlacement=PrototypeUi.Button("Cancel placement",transform,new Vector2(.68f,.115f),new Vector2(.99f,.19f),"Cancel placement",new Color(.18f,.25f,.29f),()=>{placing=placed=false;selected=null;context=CellContext.Empty;Refresh();});
            groupActions=PrototypeUi.Rect("Manage target actions",transform,new Vector2(.68f,.115f),new Vector2(.99f,.27f));groupActions.gameObject.AddComponent<RectMask2D>();
            carousel=PrototypeUi.Rect("Construction carousel",transform,new Vector2(.02f,.05f),new Vector2(.65f,.205f));carousel.gameObject.AddComponent<Image>().color=new Color(.07f,.1f,.14f);carousel.gameObject.AddComponent<RectMask2D>();
            var content=PrototypeUi.Rect("Construction options",carousel,new Vector2(0,0),new Vector2(0,1));content.pivot=new Vector2(0,.5f);var options=catalog.Rooms.OrderBy(r=>catalog.CategoryOrder.ToList().IndexOf(r.Category)).ThenBy(r=>r.Room.Name).ToArray();content.sizeDelta=new Vector2(options.Length*180,0);var scroll=carousel.gameObject.AddComponent<ScrollRect>();scroll.viewport=carousel;scroll.content=content;scroll.horizontal=true;scroll.vertical=false;scroll.scrollSensitivity=40;
            for(int i=0;i<options.Length;i++){var entry=options[i];var quote=entry.Construction.Values.OrderBy(q=>q.ToTier).FirstOrDefault();var button=PrototypeUi.Button("Plan room "+entry.Room.Id,content,new Vector2(0,0),new Vector2(0,1),entry.Category+"\n"+entry.Room.Name+"\n"+entry.Room.Width+" x "+entry.Room.Height+(quote?.Hours.HasValue==true?" / "+quote.Hours+"h / "+quote.Supply+" S1":""),Color.Lerp(PrototypeUi.ParseColor(entry.Room.Color),Color.black,.6f),()=>Select(entry));var rect=button.GetComponent<RectTransform>();rect.offsetMin=new Vector2(i*180+2,3);rect.offsetMax=new Vector2(i*180+176,-3);button.GetComponentInChildren<Text>().fontSize=14;}
            categoryJumps=PrototypeUi.Rect("Construction groups",transform,new Vector2(.02f,.21f),new Vector2(.65f,.255f));var categories=options.Select(o=>o.Category).Distinct().ToArray();
            for(int i=0;i<categories.Length;i++){string category=categories[i];int first=Array.FindIndex(options,o=>o.Category==category);var jump=PrototypeUi.Button("Construction group "+category,categoryJumps,new Vector2((float)i/categories.Length,0),new Vector2((float)(i+1)/categories.Length,1),category,new Color(.13f,.25f,.3f),()=>{Canvas.ForceUpdateCanvases();float extent=Mathf.Max(0,content.rect.width-carousel.rect.width);content.anchoredPosition=new Vector2(-Mathf.Min(extent,first*180),content.anchoredPosition.y);});jump.GetComponentInChildren<Text>().fontSize=11;}
            status=PrototypeUi.Label(PrototypeUi.Rect("Placement status",transform,new Vector2(.02f,.005f),new Vector2(.65f,.045f)),"Select a room, rock or empty cell.",13);status.rectTransform.offsetMin=Vector2.zero;status.rectTransform.offsetMax=Vector2.zero;
            supplyLabel=PrototypeUi.Label(PrototypeUi.Rect("Construction Supply",transform,new Vector2(.02f,.90f),new Vector2(.65f,.945f)),"",14);
            var progressViewport=PrototypeUi.Rect("Construction progress viewport",transform,new Vector2(.02f,.27f),new Vector2(.65f,.39f));progressViewport.gameObject.AddComponent<Image>().color=new Color(.07f,.1f,.13f);progressViewport.gameObject.AddComponent<RectMask2D>();progressContent=PrototypeUi.Rect("Construction progress",progressViewport,new Vector2(0,1),Vector2.one);progressContent.pivot=new Vector2(.5f,1);var progressScroll=progressViewport.gameObject.AddComponent<ScrollRect>();progressScroll.viewport=progressViewport;progressScroll.content=progressContent;progressScroll.horizontal=false;progressScroll.scrollSensitivity=35;
            session.TickCommitted+=Tick;session.ConstructionChanged+=ConstructionChanged;session.StaffingChanged+=StaffingChanged;RenderSites();RenderProgress();Refresh();
        }
        private void SelectCell(int x,int y)
        {
            var room=session.State.Base.Rooms.FirstOrDefault(r=>x>=r.Col&&x<r.Col+r.Definition.Width&&y>=r.Row&&y<r.Row+r.Definition.Height);
            if(room!=null){placing=placed=false;context=CellContext.Room;managing=true;ManageCell(x,y);return;}
            col=x;row=y;managing=false;managedRoom=joinTarget=null;
            if(session.State.Construction.Sites.Any(s=>!s.Completed&&x>=s.Col&&x<s.Col+catalog.Rooms.Single(p=>p.Room.Id==s.DefinitionId).Room.Width&&y>=s.Row&&y<s.Row+catalog.Rooms.Single(p=>p.Room.Id==s.DefinitionId).Room.Height)){context=CellContext.Site;placing=placed=false;Refresh();return;}
            if(!RoomConstruction.IsClear(session.State,x,y)){context=CellContext.Rock;placing=placed=false;Refresh();return;}
            context=CellContext.Empty;
            if(placing&&selected!=null){var blocker=RoomConstruction.PlacementBlocker(session.State,selected.Room.Id,tier,col,row);if(blocker==null){placed=true;placing=false;}else status.text=blocker;}
            else{selected=null;placed=false;}
            Refresh();
        }
        private bool RefreshCellContext()
        {
            carousel.gameObject.SetActive(context==CellContext.Empty&&!placing&&!placed);categoryJumps.gameObject.SetActive(carousel.gameObject.activeSelf);clearButton.gameObject.SetActive(context==CellContext.Rock);cancelPlacement.gameObject.SetActive(placing||placed);
            bool roomOrPlan=context==CellContext.Room||context==CellContext.Empty&&(placing||placed);
            tierLabel.transform.parent.gameObject.SetActive(roomOrPlan);staffingStatus.transform.parent.gameObject.SetActive(roomOrPlan);buildButton.gameObject.SetActive(roomOrPlan&&(managing?selected.Upgrades.ContainsKey(tier+1):placed));
            if(roomOrPlan)return true;
            groupActions.gameObject.SetActive(false);groupActionKey=null;if(preview!=null){preview.SetActive(false);Destroy(preview);preview=null;}
            supplyLabel.text="Select a cell for its available actions";
            if(context==CellContext.Rock){var order=session.State.Construction.Clearings.SingleOrDefault(o=>o.Col==col&&o.Row==row);var nodes=order==null?TerrainClearing.Plan(session.State,col,row):TerrainClearing.WorkBubbles(session.State,order);double minutes=nodes.Sum(n=>n.DurationTicks)*CampaignTiming.MinutesPerTick;clearButton.GetComponentInChildren<Text>().text="Clear / "+nodes.Count+" bubbles";details.text="Rock / column "+col+", row "+row+"\n\n"+nodes.Count+" bubbles / 3 and 60 minute work\nExpected work: "+(minutes/60).ToString("0.##")+" hours\nYield: "+session.State.Base.Construction.RockSupply+" "+session.State.Base.Construction.RockSupplyClass+" Supply\n\nAvailable Maintenance staff work in parallel.\nSpecialist: "+string.Join(", ",nodes.Where(n=>n.Profession!="UNTRAINED").Select(n=>n.Profession+n.MinimumTier).Distinct())+(order==null?"":"\n\nQueued / "+order.Bubbles.Count(b=>b.CompletedTick.HasValue)+"/"+order.Bubbles.Count+" complete");clearButton.interactable=order==null;}
            else if(context==CellContext.Empty)details.text="Empty cell / column "+col+", row "+row+"\n\nChoose a room in the construction carousel below the map. Then click a clear footprint to place it. Build confirms the placed plan.";
            else if(context==CellContext.Site)details.text="Construction site / column "+col+", row "+row+"\n\nThe footprint is reserved. Its active Recipe is shown in the progress list.";
            else details.text="Select an existing room, a rock cell or a free cell.";
            return false;
        }
        private void Select(RoomPlanDefinition entry)
        {selected=entry;tier=entry.CoresByTier.Keys.Min();managedRoom=joinTarget=null;managing=false;context=CellContext.Empty;placing=true;placed=false;Refresh();}
        private void ManageCell(int x,int y)
        {
            var room=session.State.Base.Rooms.FirstOrDefault(r=>x>=r.Col&&x<r.Col+r.Definition.Width&&y>=r.Row&&y<r.Row+r.Definition.Height);
            if(room==null){status.text="Click an existing room to upgrade or join it.";return;}
            managedRoom=room.Id;joinTarget=null;selected=catalog.Rooms.Single(p=>p.Room.Id==room.Definition.Id);tier=room.ConstructionTier;col=room.Col;row=room.Row;
            Refresh();
        }
        private void Refresh()
        {
            RenderJoinOutlines();if(!RefreshCellContext())return;
            var d = selected.Room;
            string blocker = managing ? (managedRoom == null ? "Select a physical room." : null) : RoomConstruction.PlacementBlocker(session.State, d.Id, tier, col, row);
            tierLabel.text = managing ? (managedRoom ?? "Select room") + " / current CT " + tier : "Construction tier " + tier + " / change";
            details.text = d.Name + "\n" + d.Width + " x " + d.Height + " cells\n\n" + selected.Purpose +
                "\n\nStaff places: " + d.StaffingCapacity(tier) + "\nCore envelope: " + selected.CoresByTier[tier] +
                "\nJoining: " + (selected.JoinGroup ?? "None") +
                (d.TeamSlots > 0 ? "\nOne SG team / " + d.TeamSlots + " members at CT1 / " + d.StaffingCapacity(tier) + " at this tier; at most 4 deploy" : "") +
                "\n\nProfile Services: " + (selected.Services.Count == 0 ? "None listed" : string.Join(", ", selected.Services)) +
                (selected.Construction.TryGetValue(tier, out var build) ? Estimate("New construction", build) : "") +
                (selected.Upgrades.TryGetValue(tier, out var upgrade) ? Estimate("Upgrade CT" + upgrade.FromTier + " to CT" + tier, upgrade) : "");
            status.text = d.Name + " at column " + col + ", row " + row + "\n" +
                (blocker ?? "Footprint fits. " + (RoomConstruction.BuildBlocker(session.State, d.Id, tier, col, row) ?? "Ready to build."));
            var buildBlocker = managing ? RoomConstruction.UpgradeBlocker(session.State, managedRoom) : RoomConstruction.BuildBlocker(session.State, d.Id, tier, col, row);
            buildButton.interactable = buildBlocker == null;
            buildButton.GetComponentInChildren<Text>().text = managing ? "Upgrade room" : "Build";
            RenderGroupActions();
            if(managing)
            {
                status.text=(managedRoom==null?"Select an existing room.":managedRoom+" / "+(buildBlocker??"Ready to upgrade."))+(joinTarget==null?"":"\nJoin "+managedRoom+" > "+joinTarget+": "+(RoomGroups.JoinBlocker(session.State,managedRoom,joinTarget)??"Ready"));
                if(managedRoom!=null){var room=session.State.Base.Rooms.Single(r=>r.Id==managedRoom);if(selected.Upgrades.TryGetValue(room.ConstructionTier+1,out var next))details.text+=Estimate("Upgrade this physical room",next);var group=RoomGroups.ForRoom(session.State,managedRoom);details.text+="\n\n"+(group==null?"Physical room / no Group":group.Id+" / child order: "+string.Join(" > ",RoomGroups.Members(session.State,managedRoom)));}
            }
            supplyLabel.text = "BUILD / UPGRADE / ROOM GROUPS";
            var technician = RoomConstruction.ResolveTechnician(session.State);
            var soldier = technician == null ? null : RoomConstruction.ResolveSecurityActor(session.State, technician);
            staffingStatus.text = technician == null ? RoomConstruction.StaffingBlocker(session.State) :
                "Maintenance: " + session.State.Base.Units.Single(u => u.Id == technician).Name + "\n" +
                (soldier == null ? RoomConstruction.StaffingBlocker(session.State) : "Security: " + session.State.Base.Units.Single(u => u.Id == soldier).Name);
            bool offworld = session.State.Expedition != null && !session.State.Expedition.Returned;
            if (offworld) staffingStatus.text += "\nWork follows mission actions.";
            foreach (var site in session.State.Construction?.Sites.Where(s => !s.Completed&&s.RoomId==managedRoom) ?? Enumerable.Empty<RoomConstructionSite>())
                details.text += "\n\nBuilding " + site.RoomId + " / " + session.State.Base.Planning.Rooms.Single(r => r.Room.Id == site.DefinitionId).Room.Name +
                    "\n" + site.WorkedTicks + "/" + site.DurationTicks + " ticks / " + session.State.Base.Units.Single(u => u.Id == site.ActorId).Name +
                    "\n" + (site.Paused ? "Paused" : RoomConstruction.RuntimeBlocker(session.State, site) ?? (site.WorkedTicks < session.State.Base.Construction.SecurityTicks ? "Soldier: site security" : "Technician: construction"));
            status.color = blocker == null ? new Color(.65f, 1, .75f) : new Color(1, .65f, .55f);
            status.text+="\nDashed: supports joining. Green: valid join target.";
            if (preview != null) { preview.SetActive(false); Destroy(preview); }
            if(managing)return;
            // Clip the visible ghost at the board edge; validation still checks the whole footprint.
            var ghost = PrototypeUi.Rect("Planned footprint", board,
                new Vector2((float)col / catalog.Columns, Mathf.Max(0, 1f - (float)(row + d.Height) / catalog.Rows)),
                new Vector2(Mathf.Min(1, (float)(col + d.Width) / catalog.Columns), 1f - (float)row / catalog.Rows));
            preview = ghost.gameObject;
            var image = preview.AddComponent<Image>(); image.color = blocker == null ? new Color(.2f, 1, .4f, .3f) : new Color(1, .2f, .1f, .4f); image.raycastTarget = false;
        }
        private void RenderJoinOutlines()
        {
            foreach(var room in session.State.Base.Rooms)
            {
                var plan=catalog.Rooms.Single(p=>p.Room.Id==room.Definition.Id);
                if(plan.JoinGroup==null)continue;
                if(!joinOutlines.TryGetValue(room.Id,out var outline))
                {
                    var rect=PrototypeUi.Rect("Join outline "+room.Id,board,new Vector2((float)room.Col/catalog.Columns,1f-(float)(room.Row+room.Definition.Height)/catalog.Rows),new Vector2((float)(room.Col+room.Definition.Width)/catalog.Columns,1f-(float)room.Row/catalog.Rows));
                    outline=rect.gameObject.AddComponent<PlanningJoinOutline>();outline.raycastTarget=false;joinOutlines.Add(room.Id,outline);
                }
                outline.transform.SetAsLastSibling();
                outline.color=managing&&room.Id==managedRoom?new Color(1,.8f,.25f):managing&&managedRoom!=null&&RoomGroups.JoinBlocker(session.State,managedRoom,room.Id)==null?new Color(.3f,1,.6f):new Color(.75f,.85f,.9f,.85f);
            }
        }
        private void RenderGroupActions()
        {
            groupActions.gameObject.SetActive(managing);
            if(!managing){groupActionKey=null;return;}
            var targets=session.State.Base.Rooms.Where(r=>RoomGroups.JoinBlocker(session.State,managedRoom,r.Id)==null)
                .GroupBy(r=>RoomGroups.ForRoom(session.State,r.Id)?.Id??r.Id).Select(g=>g.First()).ToArray();
            var group=managedRoom==null?null:RoomGroups.ForRoom(session.State,managedRoom);
            string key=managedRoom+":"+string.Join(",",targets.Select(r=>r.Id))+":"+group?.Id;
            if(key==groupActionKey)return;groupActionKey=key;
            foreach(Transform child in groupActions){child.gameObject.SetActive(false);Destroy(child.gameObject);}
            var scroll=groupActions.GetComponent<ScrollRect>();if(scroll==null)scroll=groupActions.gameObject.AddComponent<ScrollRect>();
            var content=PrototypeUi.Rect("Valid group actions",groupActions,new Vector2(0,1),Vector2.one);content.pivot=new Vector2(.5f,1);
            int count=targets.Length+(group==null?0:1);content.sizeDelta=new Vector2(0,count*44);groupActions.gameObject.SetActive(count>0);
            scroll.viewport=groupActions;scroll.content=content;scroll.horizontal=false;scroll.vertical=true;scroll.movementType=ScrollRect.MovementType.Clamped;scroll.scrollSensitivity=40;
            int index=0;
            void Add(string name,string caption,Action action)
            {
                var button=PrototypeUi.Button(name,content,new Vector2(0,1),Vector2.one,caption,new Color(.14f,.29f,.33f),()=>{try{action();Refresh();}catch(Exception e){status.text=e.Message;}});
                var r=button.GetComponent<RectTransform>();r.offsetMin=new Vector2(2,-(index+1)*44+2);r.offsetMax=new Vector2(-2,-index*44-2);index++;
                var text=button.GetComponentInChildren<Text>();text.fontSize=12;text.rectTransform.offsetMin=new Vector2(3,0);text.rectTransform.offsetMax=new Vector2(-3,0);
            }
            foreach(var target in targets){var id=target.Id;var targetGroup=RoomGroups.ForRoom(session.State,id);Add("Join target "+id,"Join "+(targetGroup?.Id??id)+" / "+target.Definition.Name,()=>session.JoinRooms(managedRoom,id));}
            if(group!=null)Add("Split target "+group.Id,"Split "+group.Id+" > "+group.Primary+" + "+group.Secondary,()=>session.SplitRooms(managedRoom));
            if(count==0){var text=PrototypeUi.Label(content,managedRoom==null?"Select a room to manage.":"No valid joins or split for this room.",12);text.rectTransform.offsetMin=new Vector2(3,0);text.rectTransform.offsetMax=new Vector2(-3,0);}
        }
        private void Tick(long _) { Refresh(); RenderProgress(); }
        private void StaffingChanged() { Refresh(); RenderProgress(); }
        private void ConstructionChanged()
        {
            RenderSites();
            for (int y = 0; y < catalog.Rows; y++) for (int x = 0; x < catalog.Columns; x++)
            {
                var tile = board.Find("Plan cell " + x + " " + y);
                if(tile==null)continue;
                var clearingOrder=session.State.Construction.Clearings.SingleOrDefault(o=>o.Col==x&&o.Row==y);
                if(clearingOrder!=null){tile.GetComponentInChildren<Text>().text=clearingOrder.Completed?"":"Clearing\n"+clearingOrder.Bubbles.Count(b=>b.CompletedTick.HasValue)+"/"+clearingOrder.Bubbles.Count;tile.GetComponent<Image>().color=clearingOrder.Completed?new Color(.12f,.16f,.2f):new Color(.28f,.3f,.32f);}
            }
            Refresh(); RenderProgress();
        }
        private void RenderProgress()
        {
            foreach(var order in session.State.Construction.Clearings)
            {
                var tile=board.Find("Plan cell "+order.Col+" "+order.Row);
                if(tile==null)continue;
                tile.GetComponentInChildren<Text>().text=order.Completed?"":"Clearing\n"+order.Bubbles.Count(b=>b.CompletedTick.HasValue)+"/"+order.Bubbles.Count;
                tile.GetComponent<Image>().color=order.Completed?new Color(.12f,.16f,.2f):new Color(.28f,.3f,.32f);
            }
            var sites=session.State.Construction?.Sites.OrderBy(s=>s.Completed).ThenByDescending(s=>s.StartedTick).ToList() ?? new System.Collections.Generic.List<RoomConstructionSite>();
            var clearings=session.State.Construction?.Clearings.OrderBy(o=>o.Completed).ThenByDescending(o=>o.StartedTick).ToList() ?? new System.Collections.Generic.List<TerrainClearingOrder>();
            // Active work must precede all completed history, regardless of type.
            var positions=sites.Select(s=>new {Key="build:"+s.WorkId,s.Completed,s.StartedTick})
                .Concat(clearings.Select(o=>new {Key="clear:"+o.Cell,o.Completed,o.StartedTick}))
                .OrderBy(o=>o.Completed).ThenByDescending(o=>o.StartedTick)
                .Select((o,index)=>new{o.Key,index}).ToDictionary(o=>o.Key,o=>o.index);
            progressContent.sizeDelta=new Vector2(0,Mathf.Max(88,(sites.Count+clearings.Count)*88));
            for(int i=0;i<clearings.Count;i++)
            {
                var order=clearings[i];
                if(!clearingViews.TryGetValue(order.Cell,out var view))
                {
                    var card=PrototypeUi.Rect("Clearing progress "+order.Cell,progressContent,new Vector2(0,1),Vector2.one);
                    view=card.gameObject.AddComponent<TerrainClearingProgressView>();view.Bind(session,order);clearingViews.Add(order.Cell,view);
                }
                else view.Refresh(order);
                int position=positions["clear:"+order.Cell];
                var layout=view.GetComponent<RectTransform>();layout.offsetMin=new Vector2(3,-position*88-84);layout.offsetMax=new Vector2(-3,-position*88-3);
            }
            for(int i=0;i<sites.Count;i++)
            {
                var site=sites[i];
                if(!progressViews.TryGetValue(site.WorkId,out var view))
                {
                    var card=PrototypeUi.Rect("Build progress "+site.WorkId,progressContent,new Vector2(0,1),Vector2.one);
                    card.offsetMin=new Vector2(3,-i*88-84);card.offsetMax=new Vector2(-3,-i*88-3);
                    view=card.gameObject.AddComponent<ConstructionProgressView>();view.Bind(session,site);progressViews.Add(site.WorkId,view);
                }
                else view.Refresh(site);
                int position=positions["build:"+site.WorkId];
                var layout=view.GetComponent<RectTransform>();layout.offsetMin=new Vector2(3,-position*88-84);layout.offsetMax=new Vector2(-3,-position*88-3);
            }
        }
        private void OnDestroy() { if (session != null) { session.TickCommitted -= Tick; session.ConstructionChanged -= ConstructionChanged; session.StaffingChanged -= StaffingChanged; } }
        private void RenderSites()
        {
            foreach (Transform child in board) if (child.name.StartsWith("Construction site ")) { child.gameObject.SetActive(false); Destroy(child.gameObject); }
            foreach (var site in session.State.Construction?.Sites.Where(s => !s.Completed) ?? Enumerable.Empty<RoomConstructionSite>())
            {
                var d = catalog.Rooms.Single(r => r.Room.Id == site.DefinitionId).Room;
                var rect = PrototypeUi.Rect("Construction site " + site.RoomId, board, new Vector2((float)site.Col / catalog.Columns, 1f - (float)(site.Row + d.Height) / catalog.Rows), new Vector2((float)(site.Col + d.Width) / catalog.Columns, 1f - (float)site.Row / catalog.Rows));
                var image = rect.gameObject.AddComponent<Image>(); image.color = new Color(.55f, .33f, .1f); image.raycastTarget = false;
                var siteLabel = PrototypeUi.Label(rect, site.RoomId + (site.FromTier.HasValue ? "\nUpgrade" : "\nBuild"), 11); siteLabel.alignment = TextAnchor.MiddleCenter; siteLabel.rectTransform.offsetMin = new Vector2(2, 0); siteLabel.rectTransform.offsetMax = new Vector2(-2, 0);
            }
        }
        private static string Estimate(string title, RoomConstructionEstimate quote)
        {
            if (quote.BlockedReason != null) return "\n\n" + title + ": " + quote.BlockedReason;
            string text = "\n\n" + title + ":\n" + quote.Hours + " hours / " + quote.Supply + " " + quote.SupplyClass + " Supply";
            foreach (var component in quote.Components.Where(c => c.Places > 0))
            {
                string name = component.Kind == "coreSlots" ? "Core slots" : component.Kind == "staffSlots" ? "Staff slots" : component.Kind == "inventoryPlaces" ? "Inventory places" : component.Kind == "resourceUnits" ? "Bulk resource units" : component.Kind == "occupantPlaces" ? "Beds / resident places" : "Shell / commissioning";
                text += "\n" + name + ": " + component.Places + " x " + component.HoursPerPlace + "h = " + component.Hours + "h";
            }
            return text;
        }
    }
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class PlanningJoinOutline : MaskableGraphic
    {
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear();var r=GetPixelAdjustedRect();float inset=2,thickness=2,pitch=9,dash=5;
            for(float x=r.xMin+inset;x<r.xMax-inset;x+=pitch){Box(mesh,x,r.yMin+inset,Mathf.Min(dash,r.xMax-inset-x),thickness);Box(mesh,x,r.yMax-inset-thickness,Mathf.Min(dash,r.xMax-inset-x),thickness);}
            for(float y=r.yMin+inset;y<r.yMax-inset;y+=pitch){Box(mesh,r.xMin+inset,y,thickness,Mathf.Min(dash,r.yMax-inset-y));Box(mesh,r.xMax-inset-thickness,y,thickness,Mathf.Min(dash,r.yMax-inset-y));}
        }
        private void Box(VertexHelper mesh,float x,float y,float w,float h)
        {
            int n=mesh.currentVertCount;mesh.AddVert(new Vector3(x,y),color,Vector2.zero);mesh.AddVert(new Vector3(x,y+h),color,Vector2.zero);mesh.AddVert(new Vector3(x+w,y+h),color,Vector2.zero);mesh.AddVert(new Vector3(x+w,y),color,Vector2.zero);mesh.AddTriangle(n,n+1,n+2);mesh.AddTriangle(n,n+2,n+3);
        }
    }
}
