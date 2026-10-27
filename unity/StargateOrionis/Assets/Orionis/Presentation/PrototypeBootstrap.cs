using System;
using System.IO;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using Orionis.Infrastructure;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class PrototypeBootstrap : MonoBehaviour
    {
        [SerializeField] private TextAsset snapshot;
        private ICampaignSaveStore saveStore;
        private GameObject canvasRoot;
        private CampaignClockController clockController;
        private bool showDebug = UnityEngine.Application.isEditor;
        private bool showMission;
        private bool showOperations;
        private bool showCargo;
        private string cargoRoomId;
        private bool showPlanning;
        private string readyRoomId;
        private string equipmentRoomId;
        public CampaignSession Session { get; private set; }
        public void OpenReceiving()
        {
            readyRoomId=null;equipmentRoomId=null;showMission=false;showPlanning=false;showOperations=false;showCargo=true;
            cargoRoomId=Session.State.Base.Rooms.First(r=>r.Definition.Id=="receiving").Id;
            BuildView("Recovered cargo / Receiving queue");
        }
        public void Configure(TextAsset value, ICampaignSaveStore saves = null, bool? debugControls = null) { snapshot = value; saveStore = saves; if (debugControls.HasValue) showDebug = debugControls.Value; }
        private void Start()
        {
            try
            {
                if (snapshot == null) throw new InvalidOperationException("Bootstrap snapshot is missing. Use Orionis > Rebuild Bootstrap Scene.");
                var data = BootstrapReader.Read(snapshot.text);
                if (saveStore == null) saveStore = new FileCampaignSaveStore(
                    PlayerSaveVerification.SavePath??Path.Combine(UnityEngine.Application.persistentDataPath, UnityEngine.Application.isEditor ? "prototype-save.json" : "campaign-save.json"), new CampaignSaveCodec(snapshot.text));
                // Fixed technical seed while no gameplay RNG consumer exists; never reroll on load.
                Session = new CampaignSession(RoomConstruction.SeedStaff(new CampaignState(data, new RandomState(1, 1))), saveStore);
                clockController = new CampaignClockController(Session);
                clockController.SetPaused(false);
                Session.MissionChanged += MissionChanged;
                Session.BaseChanged += BaseChanged;
                BuildView("Ready. Save or load your session.");
                if (!UnityEngine.Application.isEditor)
                    Debug.Log("Orionis campaign UI ready; debug controls " + (showDebug ? "shown" : "hidden") + ".");
                if (EventSystem.current == null)
                {
                    var events = new GameObject("EventSystem", typeof(EventSystem), typeof(InputSystemUIInputModule));
                    events.transform.SetParent(transform, false);
                }
                if(PlayerSaveVerification.Requested)StartCoroutine(PlayerSaveVerification.Run(this,clockController,snapshot.text));
            }
            catch (Exception error) { Debug.LogException(error, this); enabled = false; }
        }
        private void Load()
        {
            Session.Load();
            readyRoomId = null; equipmentRoomId = null; showCargo = false; showPlanning = false; showOperations=false;
            if (Session.State.Expedition != null) showMission = true;
            BuildView("Campaign loaded.");
        }
        private void MissionChanged() { readyRoomId = null; equipmentRoomId = null; showCargo = false; showPlanning = false; showOperations=false; showMission = true; BuildView(Session.State.Expedition == null ? "Mission briefing ready. Existing save unchanged until Save." : Session.State.Expedition.Returned ? "Returned to SGC. Save preserves the debrief." : "Mission ready. Save preserves progress."); }
        private void BaseChanged() { BuildView("Room work complete. Base capacity updated."); }
        private void OnDestroy() { if (Session != null) { Session.MissionChanged -= MissionChanged; Session.BaseChanged -= BaseChanged; } }
        private void BuildView(string message)
        {
            if (canvasRoot != null) { canvasRoot.SetActive(false); Destroy(canvasRoot); }
            var canvas = new GameObject("Orionis UI", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasRoot = canvas;
            canvas.transform.SetParent(transform, false);
            canvas.GetComponent<Canvas>().renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvas.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1440, 900); scaler.matchWidthOrHeight = .5f;
            var background = PrototypeUi.Rect("Background", canvas.transform, Vector2.zero, Vector2.one);
            background.gameObject.AddComponent<Image>().color = new Color(.055f, .075f, .1f);
            var toolbar = PrototypeUi.Rect("Save controls", background, new Vector2(0, .955f), Vector2.one);
            toolbar.gameObject.AddComponent<SaveLoadToolbar>().Bind(Session.Save, Load, message, showDebug ? Session.ResetMission : (Action)null,
                () => { showDebug = !showDebug; BuildView(showDebug ? "Debug controls shown." : "Debug controls hidden."); }, showDebug);
            var status=toolbar.GetComponentsInChildren<Text>().FirstOrDefault(t=>t.name=="Save status");if(status!=null)status.rectTransform.anchorMax=new Vector2(.675f,1);
            PrototypeUi.Button("Base operations",toolbar,new Vector2(.68f,.12f),new Vector2(.77f,.88f),"Operations",new Color(.12f,.30f,.36f),()=>{showOperations=!showOperations;BuildView("Base operations");}).GetComponentInChildren<Text>().fontSize=14;
            if (Session.State.Base.Mission != null)
                PrototypeUi.Button("Mission view", toolbar, new Vector2(.88f, .12f), new Vector2(.99f, .88f), showMission ? "Base" : "Mission briefing",
                    new Color(.12f, .3f, .36f), () => { readyRoomId = null; equipmentRoomId = null; showCargo = false; showPlanning = false; showOperations=false; showMission = !showMission; BuildView("Prototype ready."); }).GetComponentInChildren<Text>().fontSize = 14;
            var clock = PrototypeUi.Rect("Clock controls", background, new Vector2(0, .91f), new Vector2(1, .955f));
            clock.gameObject.AddComponent<CampaignClockPanel>().Bind(Session, clockController, showDebug);
            var workspace = PrototypeUi.Rect("Workspace", background, Vector2.zero, new Vector2(1, .875f));
            var resources = PrototypeUi.Rect("Resource header", background, new Vector2(0, .875f), new Vector2(1, .91f));
            resources.gameObject.AddComponent<ResourceHeader>().Bind(Session);
            if(showOperations){workspace.gameObject.AddComponent<BaseOperationsPanel>().Bind(Session,()=>{showOperations=false;BuildView("Back to base.");},job=>{showOperations=false;showMission=false;showPlanning=job.Kind=="construction"||job.Kind=="clearing";showCargo=!showPlanning&&job.Kind!="core";cargoRoomId=showCargo?job.RoomId:null;readyRoomId=null;equipmentRoomId=null;BuildView("Base work / "+job.Name);if(!showPlanning&&job.RoomId!=null)Session.Selection.SelectRoom(job.RoomId);if(job.Kind=="core")GetComponentInChildren<RoomInteriorView>()?.ShowTab("cores");else if(showCargo)GetComponentInChildren<CargoPanel>()?.FocusItem(job.Id);});return;}
            if (showPlanning && Session.State.Base.Planning != null)
            {
                workspace.gameObject.AddComponent<BasePlanningPanel>().Bind(Session, () => { showPlanning = false; BuildView("Returned to base."); }); return;
            }
            if (equipmentRoomId != null)
            {
                workspace.gameObject.AddComponent<EquipmentStoragePanel>().Bind(Session, equipmentRoomId, () => { equipmentRoomId = null; BuildView("Returned to base."); }); return;
            }
            if (showCargo)
            {
                workspace.gameObject.AddComponent<CargoPanel>().Bind(Session, () => { showCargo = false; cargoRoomId = null; showPlanning = false; BuildView("Returned to base."); }, showDebug, cargoRoomId); return;
            }
            if (readyRoomId != null)
            {
                workspace.gameObject.AddComponent<ReadyRoomPanel>().Bind(Session, readyRoomId, () => { readyRoomId = null; BuildView("Ready Room configuration retained."); }); return;
            }
            if (showMission && Session.State.Base.Mission != null)
            {
                workspace.gameObject.AddComponent<MissionPanel>().Bind(Session);
                return;
            }
            var hasReceiving = Session.State.Base.Receiving != null;
            var rooms = PrototypeUi.Rect("Rooms", workspace, new Vector2(0, hasReceiving ? .45f : 0), new Vector2(.53f, 1));
            rooms.gameObject.AddComponent<RoomMapView>().Bind(Session, id => { readyRoomId = id; showMission = false; BuildView("Configure a permanent SG team."); }, id => { equipmentRoomId = id; showMission = false; showCargo = false; showPlanning = false; BuildView("Equipment inventory"); }, Session.State.Base.Planning == null ? (Action)null : () => { showPlanning = true; BuildView("Preview base expansion."); },()=>BuildView("Base presentation updated."),id=>{cargoRoomId=id;showCargo=true;showMission=false;BuildView("Room queue");});
            if (hasReceiving)
            {
                var receiving = PrototypeUi.Rect("Receiving work", workspace, Vector2.zero, new Vector2(.53f, .45f));
                receiving.gameObject.AddComponent<RoomInteriorView>().Bind(Session, id => { showCargo=true;cargoRoomId=id;BuildView("Room queue"); },showDebug);
            }
            var roster = PrototypeUi.Rect("Roster", workspace, new Vector2(.53f, 0), new Vector2(.78f, 1));
            roster.gameObject.AddComponent<RosterView>().Bind(Session);
            var details = PrototypeUi.Rect("Selection", workspace, new Vector2(.79f, 0), Vector2.one);
            details.gameObject.AddComponent<SelectionPanel>().Bind(Session, id => { cargoRoomId = id; showCargo = true; BuildView("Room inventory"); });
        }
    }
}
