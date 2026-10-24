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
        private bool clearing;
        private Text clearLabel;
        private RectTransform progressContent;
        private readonly System.Collections.Generic.Dictionary<string, ConstructionProgressView> progressViews = new System.Collections.Generic.Dictionary<string, ConstructionProgressView>();
        private readonly System.Collections.Generic.Dictionary<string, TerrainClearingProgressView> clearingViews = new System.Collections.Generic.Dictionary<string, TerrainClearingProgressView>();
        private bool managing;
        private string managedRoom, joinTarget;
        private Text manageLabel;
        private Button joinButton, splitButton;

        public void Bind(CampaignSession value, Action back)
        {
            session = value; catalog = session.State.Base.Planning;
            PrototypeUi.Label(PrototypeUi.Rect("Planning heading", transform, new Vector2(.01f, .91f), new Vector2(.8f, 1)), "Base construction", 24);
            PrototypeUi.Button("Close base planning", transform, new Vector2(.85f, .92f), new Vector2(.99f, .99f), "Back to base", new Color(.12f, .3f, .36f), () => back());
            var viewport = PrototypeUi.Rect("Room catalog viewport", transform, new Vector2(.01f, .08f), new Vector2(.26f, .9f));
            viewport.gameObject.AddComponent<Image>().color = new Color(.08f, .11f, .15f);
            viewport.gameObject.AddComponent<RectMask2D>();
            var content = PrototypeUi.Rect("Room catalog entries", viewport, new Vector2(0, 1), Vector2.one);
            content.pivot = new Vector2(.5f, 1); content.sizeDelta = new Vector2(0, catalog.Rooms.Count * 48 + catalog.Rooms.Select(r => r.Category).Distinct().Count() * 32);
            var scroll = viewport.gameObject.AddComponent<ScrollRect>();
            scroll.viewport = viewport; scroll.content = content; scroll.horizontal = false;
            scroll.movementType = ScrollRect.MovementType.Clamped; scroll.scrollSensitivity = 35;
            int offset = 0;
            foreach (var group in catalog.Rooms.GroupBy(r => r.Category).OrderBy(g => catalog.CategoryOrder.Contains(g.Key) ? catalog.CategoryOrder.ToList().IndexOf(g.Key) : int.MaxValue).ThenBy(g => g.Key))
            {
                var heading = PrototypeUi.Rect("Room category " + group.Key, content, new Vector2(0, 1), Vector2.one);
                heading.offsetMin = new Vector2(2, -offset - 32); heading.offsetMax = new Vector2(-2, -offset);
                var label = PrototypeUi.Label(heading, group.Key, 16); label.color = new Color(.65f, .8f, .9f); label.rectTransform.offsetMin = new Vector2(8, 0); label.rectTransform.offsetMax = new Vector2(-8, 0); label.alignment = TextAnchor.MiddleLeft; offset += 32;
                foreach (var entry in group.OrderBy(r => r.Room.Name))
                {
                    var button = PrototypeUi.Button("Plan room " + entry.Room.Id, content, new Vector2(0, 1), Vector2.one,
                        entry.Room.Name, Color.Lerp(PrototypeUi.ParseColor(entry.Room.Color), Color.black, .6f), () => Select(entry));
                    var rect = button.GetComponent<RectTransform>();
                    rect.offsetMin = new Vector2(2, -offset - 46); rect.offsetMax = new Vector2(-2, -offset - 2); offset += 48;
                    button.GetComponentInChildren<Text>().fontSize = 16;
                }
            }
            var frame = PrototypeUi.Rect("Expansion grid frame", transform, new Vector2(.28f, .36f), new Vector2(.76f, .9f));
            board = PrototypeUi.Rect("Expansion grid", frame, Vector2.zero, Vector2.one);
            var aspect = board.gameObject.AddComponent<AspectRatioFitter>();
            aspect.aspectMode = AspectRatioFitter.AspectMode.FitInParent; aspect.aspectRatio = (float)catalog.Columns / catalog.Rows;
            for (int y = 0; y < catalog.Rows; y++) for (int x = 0; x < catalog.Columns; x++)
            {
                int cx = x, cy = y;
                var room = session.State.Base.Rooms.FirstOrDefault(r => x >= r.Col && x < r.Col + r.Definition.Width && y >= r.Row && y < r.Row + r.Definition.Height);
                var button = PrototypeUi.Button("Plan cell " + x + " " + y, board,
                    new Vector2((float)x / catalog.Columns, 1f - (float)(y + 1) / catalog.Rows),
                    new Vector2((float)(x + 1) / catalog.Columns, 1f - (float)y / catalog.Rows),
                    room?.Id ?? (RoomConstruction.IsClear(session.State, x, y) ? "" : "Rock"), room == null ? (RoomConstruction.IsClear(session.State, x, y) ? new Color(.12f, .16f, .2f) : new Color(.29f, .26f, .23f)) : Color.Lerp(PrototypeUi.ParseColor(room.Definition.Color), Color.black, .5f),
                    () => { if (managing) { ManageCell(cx, cy); return; } col = cx; row = cy;
                        if (clearing) { try { session.ExcavateCell(cx, cy); status.text="Clearing queued: eight untrained bubbles. Available Maintenance staff work in parallel."; } catch (Exception error) { status.text = error.Message; return; } }
                        Refresh(); });
                button.GetComponentInChildren<Text>().fontSize = 13;
            }
            tierLabel = PrototypeUi.Button("Plan construction tier", transform, new Vector2(.78f, .81f), new Vector2(.98f, .89f), "", new Color(.12f, .3f, .36f), () =>
            {
                if (managing) return;
                var tiers = selected.CoresByTier.Keys.OrderBy(t => t).ToArray();
                tier = tiers[(Array.IndexOf(tiers, tier) + 1) % tiers.Length]; Refresh();
            }).GetComponentInChildren<Text>();
            details = PrototypeUi.ScrollLabel("Planned room details", transform, new Vector2(.78f, .22f), new Vector2(.99f, .8f), "", 16);
            status = PrototypeUi.Label(PrototypeUi.Rect("Placement status", transform, new Vector2(.28f, .175f), new Vector2(.76f, .25f)), "", 16);
            status.rectTransform.offsetMin = new Vector2(4, 0); status.rectTransform.offsetMax = new Vector2(-4, 0); status.fontSize = 14;
            PrototypeUi.Label(PrototypeUi.Rect("Planning scope", transform, Vector2.zero, new Vector2(.76f, .06f)),
                "Build uses staffed Maintenance: Soldier security, then Technician + TET1. Time follows the campaign clock.", 14);
            supplyLabel = PrototypeUi.Label(PrototypeUi.Rect("Construction Supply", transform, new Vector2(.28f, .9f), new Vector2(.83f, .96f)), "", 15);
            staffingStatus = PrototypeUi.Label(PrototypeUi.Rect("Construction readiness", transform, new Vector2(.78f, .12f), new Vector2(.99f, .21f)), "", 13);
            staffingStatus.rectTransform.offsetMin = new Vector2(4, 0); staffingStatus.rectTransform.offsetMax = new Vector2(-4, 0);
            buildButton = PrototypeUi.Button("Build room", transform, new Vector2(.78f, .035f), new Vector2(.99f, .115f), "Build", new Color(.12f, .35f, .3f), () =>
            {
                try { if (managing) session.UpgradeRoom(managedRoom); else session.BuildRoom(selected.Room.Id, tier, col, row); }
                catch (Exception error) { status.text = error.Message; }
            });
            clearLabel = PrototypeUi.Button("Clear rock mode", transform, new Vector2(.28f, .3f), new Vector2(.60f, .34f), "Clear rock: off", new Color(.3f, .26f, .16f), () => { clearing = !clearing; managing = false; managedRoom = joinTarget = null; if(manageLabel != null) manageLabel.text = "Manage: off"; clearLabel.text = "Clear rock: " + (clearing ? "ON / click rock" : "off"); }).GetComponentInChildren<Text>();
            manageLabel = PrototypeUi.Button("Manage rooms", transform, new Vector2(.61f, .30f), new Vector2(.76f, .34f), "Manage: off", new Color(.13f,.25f,.3f), () => { managing = !managing; managedRoom = joinTarget = null; clearing = false; clearLabel.text = "Clear rock: off"; manageLabel.text = "Manage: " + (managing ? "ON" : "off"); Refresh(); }).GetComponentInChildren<Text>();
            manageLabel.fontSize = 13; manageLabel.rectTransform.offsetMin = new Vector2(2,0); manageLabel.rectTransform.offsetMax = new Vector2(-2,0);
            joinButton = PrototypeUi.Button("Join rooms", transform, new Vector2(.28f,.255f), new Vector2(.52f,.295f), "Join selected rooms", new Color(.14f,.29f,.33f), () => { try { session.JoinRooms(managedRoom,joinTarget);joinTarget=null;Refresh(); } catch(Exception error) { status.text=error.Message; } });
            splitButton = PrototypeUi.Button("Split rooms", transform, new Vector2(.53f,.255f), new Vector2(.76f,.295f), "Split Group", new Color(.14f,.23f,.28f), () => { try { session.SplitRooms(managedRoom);Refresh(); } catch(Exception error) { status.text=error.Message; } });
            foreach(var button in new[]{joinButton,splitButton}) { var text=button.GetComponentInChildren<Text>();text.fontSize=12;text.rectTransform.offsetMin=new Vector2(2,0);text.rectTransform.offsetMax=new Vector2(-2,0); }
            clearLabel.fontSize = 13; clearLabel.rectTransform.offsetMin = new Vector2(3, 0); clearLabel.rectTransform.offsetMax = new Vector2(-3, 0);
            var progressViewport = PrototypeUi.Rect("Construction progress viewport", transform, new Vector2(.28f, .065f), new Vector2(.76f, .17f));
            progressViewport.gameObject.AddComponent<Image>().color = new Color(.07f, .1f, .13f); progressViewport.gameObject.AddComponent<RectMask2D>();
            progressContent = PrototypeUi.Rect("Construction progress", progressViewport, new Vector2(0, 1), Vector2.one); progressContent.pivot = new Vector2(.5f, 1);
            var progressScroll = progressViewport.gameObject.AddComponent<ScrollRect>(); progressScroll.viewport = progressViewport; progressScroll.content = progressContent; progressScroll.horizontal = false; progressScroll.scrollSensitivity = 35;
            session.TickCommitted += Tick; session.ConstructionChanged += ConstructionChanged; session.StaffingChanged += StaffingChanged;
            RenderSites(); RenderProgress();
            Select(catalog.Rooms.OrderBy(r => r.Room.Name).First());
        }
        private void Select(RoomPlanDefinition entry)
        { selected = entry; tier = entry.CoresByTier.Keys.Min(); managedRoom = joinTarget = null; managing = false; if(manageLabel != null) manageLabel.text = "Manage: off"; Refresh(); }
        private void ManageCell(int x,int y)
        {
            var room=session.State.Base.Rooms.FirstOrDefault(r=>x>=r.Col&&x<r.Col+r.Definition.Width&&y>=r.Row&&y<r.Row+r.Definition.Height);
            if(room==null){status.text="Click an existing room to upgrade or join it.";return;}
            if(managedRoom==null || room.Id==managedRoom || room.Id==joinTarget){ managedRoom=room.Id;joinTarget=null;selected=catalog.Rooms.Single(p=>p.Room.Id==room.Definition.Id);tier=room.ConstructionTier;col=room.Col;row=room.Row; }
            else joinTarget=room.Id;
            Refresh();
        }
        private void Refresh()
        {
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
            joinButton.interactable = managing && RoomGroups.JoinBlocker(session.State,managedRoom,joinTarget)==null;
            splitButton.interactable = managing && managedRoom!=null && RoomGroups.ForRoom(session.State,managedRoom)!=null;
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
            foreach (var site in session.State.Construction?.Sites.Where(s => !s.Completed) ?? Enumerable.Empty<RoomConstructionSite>())
                details.text += "\n\nBuilding " + site.RoomId + " / " + session.State.Base.Planning.Rooms.Single(r => r.Room.Id == site.DefinitionId).Room.Name +
                    "\n" + site.WorkedTicks + "/" + site.DurationTicks + " ticks / " + session.State.Base.Units.Single(u => u.Id == site.ActorId).Name +
                    "\n" + (site.Paused ? "Paused" : RoomConstruction.RuntimeBlocker(session.State, site) ?? (site.WorkedTicks < session.State.Base.Construction.SecurityTicks ? "Soldier: site security" : "Technician: construction"));
            status.color = blocker == null ? new Color(.65f, 1, .75f) : new Color(1, .65f, .55f);
            if (preview != null) { preview.SetActive(false); Destroy(preview); }
            // Clip the visible ghost at the board edge; validation still checks the whole footprint.
            var ghost = PrototypeUi.Rect("Planned footprint", board,
                new Vector2((float)col / catalog.Columns, Mathf.Max(0, 1f - (float)(row + d.Height) / catalog.Rows)),
                new Vector2(Mathf.Min(1, (float)(col + d.Width) / catalog.Columns), 1f - (float)row / catalog.Rows));
            preview = ghost.gameObject;
            var image = preview.AddComponent<Image>(); image.color = blocker == null ? new Color(.2f, 1, .4f, .3f) : new Color(1, .2f, .1f, .4f); image.raycastTarget = false;
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
                var layout=view.GetComponent<RectTransform>();layout.offsetMin=new Vector2(3,-i*88-84);layout.offsetMax=new Vector2(-3,-i*88-3);
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
                int position=i+clearings.Count;
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
}
