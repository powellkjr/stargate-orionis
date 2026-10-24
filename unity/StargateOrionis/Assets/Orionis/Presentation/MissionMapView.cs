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
        private CampaignSession session;
        private RectTransform viewport;
        private GameObject grid;
        private Text status;
        private Vector2 lastSize;
        private bool dirty;
        private const string Legend = "Hex choices use the current Stage's actions.\nHover or select a hex for requirements and blockers.\nGold: team / green: open door / amber: locked.";
        public void Bind(CampaignSession value)
        {
            session = value;
            PrototypeUi.Label(PrototypeUi.Rect("Mission map heading", transform, new Vector2(0, .88f), Vector2.one), "Mission map", 20);
            viewport = PrototypeUi.Rect("Mission map viewport", transform, new Vector2(.02f, .12f), new Vector2(.98f, .88f));
            status = PrototypeUi.Label(PrototypeUi.Rect("Mission map legend", transform, Vector2.zero, new Vector2(1, .12f)),
                Legend, 14);
            status.rectTransform.offsetMin = new Vector2(4, 0); status.rectTransform.offsetMax = new Vector2(-4, 0);
            dirty = true;
        }
        private void OnRectTransformDimensionsChange() { dirty = true; }
        private void LateUpdate()
        {
            if (viewport == null || session?.State.Expedition == null) return;
            if (!dirty && lastSize == viewport.rect.size) return;
            if (viewport.rect.width <= 0 || viewport.rect.height <= 0) return;
            lastSize = viewport.rect.size; dirty = false; Render();
        }
        private void Move(string stageId)
        {
            try
            {
                var door = session.State.Base.Mission.Travel.Transitions.FirstOrDefault(t => t.Destination(session.State.Expedition.StageId) == stageId);
                if (door == null) throw new InvalidOperationException("Choose an adjacent room through a doorway.");
                session.MoveParty(door.Id);
            }
            catch (Exception error) { status.text = error.Message; }
        }
        private RectTransform Tile(string name, Transform parent, float x, float y, float width, float height)
        {
            var r = PrototypeUi.Rect(name, parent, new Vector2(0, 1), new Vector2(0, 1));
            r.pivot = new Vector2(0, 1); r.sizeDelta = new Vector2(width, height); r.anchoredPosition = new Vector2(x, -y); return r;
        }
        private void Render()
        {
            var map = session.State.Base.MissionMap;
            if (map == null) { status.text = "No authored map geometry is available."; return; }
            if (grid != null) { grid.SetActive(false); Destroy(grid); }
            var definition = session.State.Base.Mission.Travel; var expedition = session.State.Expedition;
            var travel = MissionTravel.Current(session.State);
            var travelPanel = transform.parent.GetComponentInChildren<MissionTravelPanel>();
            var actions = travelPanel == null ? Array.Empty<Button>() : travelPanel.GetComponentsInChildren<Button>().Where(b => b.name.StartsWith("move-") || b.name.StartsWith("hack-") || b.name.StartsWith("talk-") || b.name.StartsWith("engage-") || b.name == "Patients and evacuation" || b.name == "Reveal equipment cache" || b.name == "Complete field work" || b.name == "Cancel field work").ToArray();
            var container=PrototypeUi.Rect("Mission map content",viewport,Vector2.zero,Vector2.one);grid=container.gameObject;
            float mapFraction=actions.Length==0?1:.68f;
            var tileSize = Mathf.Min(viewport.rect.width * mapFraction / map.Width, viewport.rect.height / map.Height);
            var root = PrototypeUi.Rect("Mission grid", container, new Vector2(mapFraction/2, .5f), new Vector2(mapFraction/2, .5f));
            root.sizeDelta = new Vector2(map.Width * tileSize, map.Height * tileSize);
            for (int y = 0; y < map.Height; y++)
                for (int x = 0; x < map.Width; x++)
                {
                    var cell = Tile("fog-" + x + "-" + y, root, x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
                    var image = cell.gameObject.AddComponent<Image>(); image.color = new Color(.075f, .095f, .12f); image.raycastTarget = false;
                }
            bool Known(string id) => definition.Stages.Single(s => s.Id == id).Known || travel.Visits.ContainsKey(id);
            var free = !expedition.GateChoicePending && travel.SceneId == null && travel.Field?.Work == null && MissionCombat.Active(session.State) == null && !MissionCombat.Inspect(session.State).Incapacitated;
            foreach (var footprint in map.Stages.Where(s => Known(s.Id)))
            {
                var stage = definition.Stages.Single(s => s.Id == footprint.Id);
                var current = stage.Id == expedition.StageId;
                var visited = travel.Visits.ContainsKey(stage.Id);
                var edge = definition.Transitions.FirstOrDefault(t => t.Destination(expedition.StageId) == stage.Id);
                var canMove = free && edge != null && (edge.InitialState != "LOCKED" || travel.OpenDoors.Contains(edge.Id));
                foreach (var cell in footprint.Cells)
                {
                    var rect = Tile("map-cell-" + stage.Id + "-" + cell.X + "-" + cell.Y, root, cell.X * tileSize, cell.Y * tileSize, tileSize - 2, tileSize - 2);
                    var image = rect.gameObject.AddComponent<Image>(); image.color = current ? (MissionCombat.Active(session.State) != null ? new Color(.45f, .18f, .16f) : new Color(.13f, .42f, .48f)) : visited ? new Color(.16f, .3f, .38f) : new Color(.16f, .2f, .25f);
                    var button = rect.gameObject.AddComponent<Button>(); button.targetGraphic = image; button.transition = Selectable.Transition.None;
                    button.interactable = canMove; button.onClick.AddListener(() => Move(stage.Id));
                    if (current)
                    {
                        var outline = rect.gameObject.AddComponent<Outline>(); outline.effectColor = new Color(1, .84f, .3f); outline.effectDistance = new Vector2(1, -1); outline.useGraphicAlpha = false;
                    }
                }
                var x0 = footprint.Cells.Min(c => c.X); var y0 = footprint.Cells.Min(c => c.Y);
                var columns = footprint.Cells.Max(c => c.X) - x0 + 1; var rows = footprint.Cells.Max(c => c.Y) - y0 + 1;
                var labelRect = Tile("map-label-" + stage.Id, root, x0 * tileSize, y0 * tileSize, columns * tileSize - 2, rows * tileSize - 2);
                var label = PrototypeUi.Label(labelRect, columns == 1 ? stage.Name.Replace(" ", "\n") : stage.Name, Mathf.Clamp((int)(tileSize * .24f), 10, 15));
                label.alignment = TextAnchor.MiddleCenter; label.rectTransform.offsetMin = new Vector2(2, 2); label.rectTransform.offsetMax = new Vector2(-2, -2);
                if (current)
                {
                    var marker = Tile("Map team marker", root, (x0 + .78f) * tileSize, (y0 + .78f) * tileSize, tileSize * .15f, tileSize * .15f);
                    var image = marker.gameObject.AddComponent<Image>(); image.color = new Color(1, .84f, .3f); image.raycastTarget = false;
                }
                if (visited && session.State.Base.Combat?.Encounters.Any(i => i.StageId == stage.Id) == true)
                {
                    var badge = Tile("map-guards-" + stage.Id, root, (x0 + .07f) * tileSize, (y0 + .07f) * tileSize, tileSize * .16f, tileSize * .16f);
                    var image = badge.gameObject.AddComponent<Image>(); image.raycastTarget = false;
                    image.color = MissionCombat.GuardsClear(session.State, stage.Id) ? new Color(.3f, .85f, .55f) : new Color(1, .65f, .2f);
                }
            }
            foreach (var door in definition.Transitions.Where(t => Known(t.From) && Known(t.To) || t.Destination(expedition.StageId) != null))
            {
                var a = map.Stages.Single(s => s.Id == door.From); var b = map.Stages.Single(s => s.Id == door.To);
                var shared = (from x in a.Cells from y in b.Cells where Math.Abs(x.X - y.X) + Math.Abs(x.Y - y.Y) == 1 select (A: x, B: y)).FirstOrDefault();
                if (shared.A == null) continue;
                var horizontal = shared.A.X == shared.B.X;
                var cx = (shared.A.X + shared.B.X + 1) * .5f; var cy = (shared.A.Y + shared.B.Y + 1) * .5f;
                var width = horizontal ? tileSize * .5f : 5; var height = horizontal ? 5 : tileSize * .5f;
                var rect = Tile("map-door-" + door.Id, root, cx * tileSize - width / 2, cy * tileSize - height / 2, width, height);
                var image = rect.gameObject.AddComponent<Image>(); image.raycastTarget = false;
                image.color = door.InitialState == "LOCKED" && !travel.OpenDoors.Contains(door.Id) ? new Color(1, .65f, .2f) : new Color(.3f, .85f, .55f);
            }
            for(int i=0;i<actions.Length;i++)
            {
                var source=actions[i];
                string caption=source.name.StartsWith("move-")?"MOVE":source.name.StartsWith("hack-")?"HACK":source.name.StartsWith("talk-")?"TALK":source.name.StartsWith("engage-")?"ENGAGE":source.name=="Patients and evacuation"?"PATIENTS":source.name=="Reveal equipment cache"?"CARGO":source.name=="Complete field work"?"FINISH":"CANCEL";
                string profession=caption=="HACK"?"TECHNICIAN":caption=="PATIENTS"?"MEDIC":caption=="ENGAGE"?"SOLDIER":caption=="CARGO"?"DIPLOMAT":null;
                var border=profession==null?new Color(.6f,.75f,.8f):PrototypeUi.ParseColor(session.State.Base.Units.First(u=>u.Profession==profession).Color);
                var slot=PrototypeUi.Rect("Map action slot "+i,container,new Vector2(.69f,.81f-i*.145f),new Vector2(.99f,.95f-i*.145f));
                var rect=PrototypeUi.Rect("map-action-"+source.name,slot,Vector2.zero,Vector2.one);
                var aspect=rect.gameObject.AddComponent<AspectRatioFitter>();aspect.aspectMode=AspectRatioFitter.AspectMode.FitInParent;aspect.aspectRatio=1;
                var graphic=rect.gameObject.AddComponent<MapActionHex>();graphic.BorderColor=border;graphic.color=source.targetGraphic.color;graphic.Details=status;graphic.Description=source.GetComponentInChildren<Text>().text;
                var button=rect.gameObject.AddComponent<Button>();button.targetGraphic=graphic;button.transition=Selectable.Transition.None;button.interactable=source.interactable;
                button.onClick.AddListener(()=>{if(source!=null&&source.interactable)source.onClick.Invoke();});
                string destination=caption=="MOVE"?source.GetComponentInChildren<Text>().text.Split('/')[0].Replace("Move: ","").Trim():"";
                var label=PrototypeUi.Label(rect,caption+(destination.Length==0?"":"\n"+destination),12);label.alignment=TextAnchor.MiddleCenter;
                label.rectTransform.offsetMin=new Vector2(10,0);label.rectTransform.offsetMax=new Vector2(-10,0);
                if(!source.interactable)label.color=new Color(.8f,.8f,.8f);
            }
        }
    }
}
