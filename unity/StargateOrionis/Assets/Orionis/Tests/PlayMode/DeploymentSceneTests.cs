#if UNITY_EDITOR
using System;
using System.Collections;
using System.IO;
using System.Linq;
using NUnit.Framework;
using Orionis.Infrastructure;
using Orionis.Domain;
using Orionis.Presentation;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;
using Object = UnityEngine.Object;

namespace Orionis.Tests
{
    public sealed class DeploymentSceneTests
    {
        [Test] public void HoldingBuildsDetectedSubjectConversationsPatientAndLootControls()
        {
            var session=new Orionis.Application.CampaignSession(new CampaignState(BootstrapReader.Read(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json")),new RandomState(1,1)),null);
            session.Deploy(new[]{"unit-6","unit-25","unit-37","unit-46"});session.ChooseGate(false);session.MoveParty("door-gate-to-yard");session.Respond("yard-ignore","unit-6");session.Engage("incident-yard-guards");while(MissionCombat.Active(session.State)!=null)session.AdvanceCombatRound();session.MoveParty("door-yard-to-mainhall");
            var recipe=MissionField.Requirements(session.State,"hack-door-mainhall-to-holding");var actor=MissionField.Candidates(session.State,recipe).First();session.StartFieldWork(recipe.Id,actor.ActorId,actor.ToolId);session.AdvanceFieldWork();session.MoveParty("door-mainhall-to-holding");
            var root=new GameObject("Holding panel regression",typeof(RectTransform));
            try{root.AddComponent<MissionTravelPanel>().Bind(session);var buttons=root.GetComponentsInChildren<Button>();foreach(string id in new[]{"talk-dialogue-operative","talk-dialogue-holding-worker","talk-dialogue-holding-guard","care-stabilize-patient-01","Reveal equipment cache"})Assert.That(buttons.Any(b=>b.name==id),Is.True,id);}
            finally{Object.DestroyImmediate(root);}
        }

        // Editor account availability is unrelated to this offline game. Expect
        // only this exact package warning if emitted; keep gameplay logs strict.
        private static void EditorAccountWarning(string message,string stack,LogType type)
        {
            if(type==LogType.Warning&&message=="Account API did not become accessible within 30 seconds. This may be due to network issues or editor focus.")LogAssert.Expect(LogType.Warning,message);
        }
        [SetUp] public void ObserveEditorAccountWarning()=>UnityEngine.Application.logMessageReceived+=EditorAccountWarning;
        [TearDown] public void StopObservingEditorAccountWarning()=>UnityEngine.Application.logMessageReceived-=EditorAccountWarning;
        private static void Click(string name)
        {
            var target=GameObject.Find("map-action-"+name)??GameObject.Find(name);
            if(name.StartsWith("responder-"))target=Object.FindObjectsByType<Button>().FirstOrDefault(b=>b.name.StartsWith("map-action-")&&b.name.EndsWith("-actor-"+name.Substring(10)))?.gameObject??target;
            Assert.That(target,Is.Not.Null,"Missing control: "+name);
            target.GetComponent<Button>().onClick.Invoke();
        }
        [UnityTest] public IEnumerator GuardCombatUiSavesRoundsDisengagesAndCommitsOneTickWithoutHealing()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-combat-ui-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json"); var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Combat UI test"); var b = root.AddComponent<PrototypeBootstrap>();
                b.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                Click("Mission view"); yield return null;
                foreach (var id in new[] { "unit-6", "unit-10", "unit-37", "unit-46" }) GameObject.Find("Select " + id).GetComponent<Toggle>().isOn = true;
                Click("Deploy mission"); yield return null; Click("Maintain Gate"); yield return null;
                Click("move-door-gate-to-yard"); yield return null; Click("response-yard-ignore"); yield return null; Click("responder-unit-6"); yield return null;
                Click("engage-incident-yard-guards");yield return null;
                Assert.That(MissionCombat.Active(b.Session.State),Is.Null,"Choosing combat only opens confirmation.");Click("Start combat");yield return null;
                Assert.That(GameObject.Find("Play combat"),Is.Null);Assert.That(GameObject.Find("Next combat round"),Is.Null);
                yield return new WaitUntil(()=>MissionCombat.Active(b.Session.State)==null||MissionCombat.Active(b.Session.State).Rounds>0);
                var snapshot=MissionCombat.Inspect(b.Session.State);long tick=b.Session.State.Clock.ElapsedTicks;int health=snapshot.PartyHealth["unit-6"];Click("Save prototype");
                yield return new WaitForSeconds(1.6f);Click("Load prototype");yield return null;
                Assert.That(MissionCombat.Active(b.Session.State).Rounds,Is.EqualTo(1));Assert.That(MissionCombat.Inspect(b.Session.State).PartyHealth["unit-6"],Is.EqualTo(health));
                Click("Disengage combat");yield return null;Assert.That(b.Session.State.Clock.ElapsedTicks,Is.EqualTo(tick+1));
                Click("engage-incident-yard-guards");yield return null;Click("Start combat");yield return null;
                yield return new WaitUntil(()=>MissionCombat.Active(b.Session.State)==null);
                Assert.That(MissionCombat.GuardsClear(b.Session.State,"stage-outer-yard"),Is.True);Assert.That(MissionCombat.Inspect(b.Session.State).PartyHealth["unit-6"],Is.LessThanOrEqualTo(health));
                LogAssert.NoUnexpectedReceived();
            }
            finally
            {
                if (root != null) Object.Destroy(root); Object.Destroy(asset);
                if (File.Exists(path)) File.Delete(path); if (Directory.Exists(directory)) Directory.Delete(directory);
            }
        }
        [UnityTest] public IEnumerator HoldingHackAndOperativeContactSurviveUiSaveLoadWithoutExtractingAnyone()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-holding-ui-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json"); var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Holding UI test"); var b = root.AddComponent<PrototypeBootstrap>();
                b.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                Click("Mission view"); yield return null; GameObject.Find("Select unit-6").GetComponent<Toggle>().isOn = true;
                Click("Deploy mission"); yield return null; Click("Close Gate"); yield return null;
                Click("move-door-gate-to-yard"); yield return null; Click("response-yard-ignore"); yield return null;
                Click("move-door-yard-to-mainhall"); yield return null;
                Assert.That(GameObject.Find("move-door-mainhall-to-holding"), Is.Null);
                Click("hack-hack-door-mainhall-to-holding"); yield return null;
                Assert.That(GameObject.Find("Field work details").GetComponentInChildren<Text>().text, Does.Contain("Technician Tools"));
                Click("Save prototype"); Click("Cancel field work"); yield return null; Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Work.ActorId, Is.EqualTo("unit-6"));
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(2));
                Click("Complete field work"); yield return null;
                Assert.That(b.Session.State.Expedition.Party[0].Tools.Single(t => t.Services.Contains("TECH_SERVICE_I")).Charges, Is.EqualTo(8));
                Click("move-door-mainhall-to-holding"); yield return null;
                Assert.That(GameObject.Find("Current Stage").GetComponentInChildren<Text>().text, Is.EqualTo("Holding Area"));
                Assert.That(GameObject.Find("Mission progress limit").GetComponentInChildren<Text>().text, Does.Contain("transmitter code confirms"));
                Click("talk-dialogue-operative"); yield return null;
                Assert.That(GameObject.Find("Conversation text").GetComponentInChildren<Text>().text, Does.Contain("Keep your voice down."));
                Click("Save prototype"); Click("response-operative-ready"); yield return null; Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Npcs.Single(n => n.Id == "guard-holding-01").Suspicion, Is.EqualTo(65));
                Click("response-operative-ready"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Knowledge, Does.Contain("operative-contacted"));
                Assert.That(b.Session.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("ACTIVE"));
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(4));
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Subjects.Single(s => s.Id == "operative-01").Evacuation, Is.EqualTo("READY_TO_EVACUATE"));
                LogAssert.NoUnexpectedReceived();
            }
            finally
            {
                if (root != null) Object.Destroy(root); Object.Destroy(asset);
                if (File.Exists(path)) File.Delete(path); if (Directory.Exists(directory)) Directory.Delete(directory);
            }
        }
        [UnityTest] public IEnumerator FullRescueReturnsToSgcAndResetAllowsReplayThroughActualControls()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-care-ui-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json"); var source = Newtonsoft.Json.Linq.JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            source["rooms"].Single(r => (string)r["id"] == "r6")["constructionTier"] = 3;
            var asset = new TextAsset(source.ToString());
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Medical UI test"); var b = root.AddComponent<PrototypeBootstrap>();
                b.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                if(GameObject.Find("Pause clock").GetComponentInChildren<Text>().text=="Pause")Click("Pause clock");
                b.Session.AssignUnit("unit-1", "r1"); Click("r6"); yield return null;
                GameObject.Find("Team designation").GetComponent<InputField>().text = "SG-12"; Click("Create SG team"); yield return null;
                Assert.That(GameObject.Find("Team member unit-1").GetComponent<Toggle>().interactable, Is.False);
                foreach (var id in new[] { "unit-6", "unit-25", "unit-37", "unit-46", "unit-7", "unit-8" })
                { GameObject.Find("Team member " + id).GetComponent<Toggle>().isOn = true; yield return null; }
                Assert.That(b.Session.State.Teams.Single().Members.Count, Is.EqualTo(6));
                Assert.That(GameObject.Find("SG member slots").transform.childCount,Is.EqualTo(6),"Every permanent member needs a visible scrollable slot.");
                Click("Save prototype"); Click("Load prototype"); yield return null; Click("r6"); yield return null;
                Assert.That(GameObject.Find("SG team members").GetComponentInChildren<Text>().text, Does.Contain("SG-12 / 6/6"));
                Click("Close Ready Room"); yield return null;
                Click("Mission view"); yield return null;
                Click("select-team-sg-team-r6"); yield return null;
                var reserve = GameObject.Find("Deploy checkbox unit-7").GetComponent<Toggle>();
                reserve.isOn = true; Assert.That(reserve.isOn, Is.False, "A fifth deployed member must be rejected.");
                var fourth = GameObject.Find("Deploy checkbox unit-46").GetComponent<Toggle>();
                fourth.isOn = false; reserve.isOn = true;
                Assert.That(reserve.isOn, Is.True); Assert.That(fourth.isOn, Is.False);
                reserve.isOn = false; fourth.isOn = true;
                Assert.That(SGTeams.ExperienceShares(b.Session.State, "sg-team-r6", 60).Values.All(v => v == 10), Is.True);
                Canvas.ForceUpdateCanvases();
                var memberList=GameObject.Find("Team deployment members").GetComponent<ScrollRect>();
                var memberCards=memberList.content.GetComponentsInChildren<PersonnelCardView>();
                Assert.That(memberCards.Length,Is.EqualTo(6),"All team members and reserves have cards.");
                Assert.That(GameObject.Find("Deployment status").GetComponentInChildren<Text>().text,Does.Contain("Ready to deploy"));
                Assert.That(memberList.content.rect.height,Is.GreaterThan(memberList.viewport.rect.height));
                var top=memberList.content.anchoredPosition.y;memberList.verticalNormalizedPosition=0;yield return null;
                Assert.That(memberList.content.anchoredPosition.y,Is.GreaterThan(top),"Reserve cards are reachable by scrolling.");
                Click("Deploy SG team"); yield return null;
                Assert.That(b.Session.State.Expedition.TeamId, Is.EqualTo("sg-team-r6"));
                Click("Mission view"); yield return null; Click("r6"); yield return null;
                Assert.That(GameObject.Find("Team designation").GetComponent<InputField>().interactable, Is.False);
                Assert.That(GameObject.Find("Team member unit-6").GetComponent<Toggle>().interactable, Is.False);
                Click("Close Ready Room"); yield return null; Click("Mission view"); yield return null;
                Click("Close Gate"); yield return null; yield return null;
                Assert.That(GameObject.Find("map-action-move-door-gate-to-yard").GetComponent<MapActionHex>(), Is.Not.Null);
                Click("map-action-move-door-gate-to-yard"); yield return null; Click("response-yard-ignore"); yield return null; Click("responder-unit-6"); yield return null;
                Click("engage-incident-yard-guards"); yield return null;Click("Start combat");yield return null;
                yield return new WaitUntil(()=>MissionCombat.Active(b.Session.State)==null);
                Click("move-door-yard-to-mainhall"); yield return null;
                Click("map-action-hack-hack-door-mainhall-to-processing"); yield return null;
                Click("map-action-hack-hack-door-mainhall-to-processing-actor-unit-25");yield return null;
                Click("Complete field work");yield return null;Click("move-door-mainhall-to-processing");yield return null;
                Click("action-isolate-mining-power");yield return null;Click("responder-unit-25");yield return null;Click("Complete field work");yield return null;
                Click("inspect-resource-cache");yield return null;Click("Save prototype");Click("Load prototype");yield return null;
                Click("inspect-resource-cache");yield return null;
                Click("action-collect-supply-cache");yield return null;Click("responder-unit-6");yield return null;Click("Complete field work");yield return null;
                Assert.That(ResourceCargo.Known(b.Session.State,b.Session.State.Cargo.Single(),"CONVERSION"),Is.True);
                Click("move-door-mainhall-to-processing");yield return null;Click("hack-hack-door-mainhall-to-holding");yield return null;
                Click("responder-unit-6");yield return null;
                Click("Complete field work"); yield return null; Click("move-door-mainhall-to-holding"); yield return null;
                Click("engage-incident-holding-guards"); yield return null;Click("Start combat");yield return null;
                yield return new WaitUntil(()=>MissionCombat.Active(b.Session.State)==null);
                Click("Reveal equipment cache"); yield return null; Click("responder-unit-46"); yield return null;
                Click("Save prototype"); Click("Cancel field work"); yield return null; Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Work.RecipeId, Is.EqualTo("persuade-epidemiologist"));
                Click("Complete field work"); yield return null;
                Assert.That(RecoveredCargo.Revealed(b.Session.State), Is.True);
                for (int i = 1; i <= 3; i++)
                {
                    Assert.That(MissionCare.Resolved(b.Session.State),Is.False);
                    Click("care-stabilize-patient-0" + i); yield return null;
                    Click("responder-unit-37");yield return null;
                    Assert.That(GameObject.Find("Field work details").GetComponentInChildren<Text>().text, Does.Contain("Medic Tools"));
                    Click("Save prototype"); Click("Cancel field work"); yield return null; Click("Load prototype"); yield return null;
                    Assert.That(b.Session.State.Expedition.Travel.Field.Work.ActorId, Is.EqualTo("unit-37"));
                    Click("Complete field work"); yield return null;
                }
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Assert.That(MissionEvacuation.SecureRoute(b.Session.State),Is.Not.Null);
                Assert.That(MissionCare.Resolved(b.Session.State), Is.True);
                Assert.That(GameObject.Find("care-stabilize-patient-01").GetComponent<Button>().interactable, Is.False);
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(17));
                Click("talk-dialogue-operative"); yield return null;
                Click("response-operative-ready"); yield return null; Click("responder-unit-6"); yield return null;
                Click("Send operative to Gate"); yield return null;
                Click("responder-unit-6"); yield return null;
                Click("Save prototype"); Click("Cancel field work"); yield return null; Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Work.ToolId, Is.Null);
                Click("Complete field work"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Field.Objectives["extract-operative"], Is.EqualTo("ACTIVE"));
                Click("move-door-mainhall-to-holding"); yield return null; Click("move-door-yard-to-mainhall"); yield return null;
                Assert.That(GameObject.Find("Visible mission objectives").GetComponentInChildren<Text>().text, Does.Contain("COMPLETED").And.Contain("ACTIVE"));
                Click("move-door-gate-to-yard"); yield return null;
                Assert.That(GameObject.Find("Extract to SGC").GetComponent<Button>().interactable, Is.False);
                var extractionHealth=MissionCombat.Inspect(b.Session.State).PartyHealth["unit-6"];
                Click("Redial Gate"); yield return null; Click("Extract to SGC"); yield return null; Click("Confirm extraction to SGC");yield return null;
                if(GameObject.Find("Pause clock").GetComponentInChildren<Text>().text=="Pause")Click("Pause clock");
                Assert.That(GameObject.Find("Mission debrief").GetComponentInChildren<Text>().text, Does.Contain("Operative recovered to SGC"));
                Assert.That(b.Session.State.Cargo.All(i=>i.FieldStageId==null),Is.True);
                Assert.That(b.Session.State.Cargo.Count, Is.EqualTo(3));
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition.Returned, Is.True); Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(22));
                Assert.That(GameObject.Find("Returned personnel").GetComponentsInChildren<PersonnelCardView>().Length,Is.EqualTo(4));
                Assert.That(GameObject.Find("Returned personnel-unit-6").transform.Find("Health count").GetComponentInChildren<Text>().text,Is.EqualTo(extractionHealth+"/100"));
                Click("Mission view"); yield return null; Click("unit-6"); yield return null;
                Assert.That(GameObject.Find("Details").GetComponentInChildren<Text>().text, Does.Contain("Returned health: "+extractionHealth));
                Click("r2"); yield return null;
                var cargoList=GameObject.Find("Cargo item viewport").GetComponent<ScrollRect>();Canvas.ForceUpdateCanvases();
                Assert.That(cargoList.content.childCount,Is.EqualTo(3));
                Assert.That(cargoList.content.rect.height,Is.GreaterThan(cargoList.viewport.rect.height),"Three recovered items must scroll rather than spill into controls.");
                cargoList.verticalNormalizedPosition=0;yield return null;
                Click("cargo-missing-operative-rifle-01"); yield return null;
                Assert.That(GameObject.Find("Cargo physical details").GetComponentInChildren<Text>().text, Does.Not.Contain("ASGARD").And.Not.Contain("ELECTROMAGNETIC"));
                Click("Admit cargo r2"); yield return null;
                Click("Close recovered cargo"); yield return null;
                foreach (var profession in new[] { "TECHNICIAN", "SCIENTIST" })
                {
                    var worker = b.Session.State.Base.Receiving.Workers.First(w => SGTeams.ForUnit(b.Session.State, w.UnitId) == null && w.Qualifications.TryGetValue(profession, out var tier) && tier >= 1 && w.ToolServices.Contains(profession == "TECHNICIAN" ? "TET1" : "SCT1"));
                    Click(worker.UnitId); yield return null; Click("Assign Unit"); yield return null;
                }
                Click("Open recovered cargo"); yield return null; Click("cargo-missing-operative-rifle-01"); yield return null;
                if (GameObject.Find("Pause clock").GetComponentInChildren<Text>().text == "Pause") Click("Pause clock");
                for (int i = 0; i < 4; i++) { Click("Advance tick"); yield return null;
                    var tracker=GameObject.Find("Cargo inspection tracker").GetComponent<InspectionProgressView>();
                    Assert.That(tracker.Rail.SegmentCount,Is.EqualTo(4));
                    float deadline=Time.realtimeSinceStartup+3.5f;
                    while(Enumerable.Range(0,4).Sum(n=>tracker.Rail.Fraction(n))<i+1&&Time.realtimeSinceStartup<deadline)yield return null;
                    Assert.That(Enumerable.Range(0,4).Sum(n=>tracker.Rail.Fraction(n)),Is.EqualTo(i+1));
                }
                Assert.That(GameObject.Find("Cargo physical details").GetComponentInChildren<Text>().text, Does.Contain("Unknown rifle").And.Not.Contain("ASGARD").And.Not.Contain("ELECTROMAGNETIC"));
                Click("Store cargo r10"); yield return null;
                Assert.That(b.Session.State.Cargo.Single(i => i.Id == "missing-operative-rifle-01").RoomId, Is.EqualTo("r10"));
                Assert.That(GameObject.Find("cargo-missing-operative-rifle-01"), Is.Null, "A routed object must leave Receiving's current-custody list.");
                Click("Follow routed item"); yield return null; Click("cargo-missing-operative-rifle-01"); yield return null;
                Assert.That(GameObject.Find("Cargo physical details").GetComponentInChildren<Text>().text, Does.Contain("Identification: Unresolved").And.Contain("Intake: Complete"));
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Cargo.Single(i => i.Id == "missing-operative-rifle-01").RoomId, Is.EqualTo("r10"));
                Click("Mission view"); yield return null; Click("r10"); yield return null; Click("cargo-missing-operative-rifle-01"); yield return null;
                Assert.That(GameObject.Find("Cargo physical details").GetComponentInChildren<Text>().text, Does.Contain("Validated storage: Containment r10").And.Not.Contain("examination:"));
                Click("Start cargo examination r4"); yield return null;
                Assert.That(b.Session.State.Cargo.Single(i => i.Id == "missing-operative-rifle-01").CustodyRoomId, Is.EqualTo("r4"));
                Assert.That(GameObject.Find("cargo-missing-operative-rifle-01"), Is.Null);
                Assert.That(b.Session.State.Cargo.Count(i=>i.RoomId=="r10"),Is.EqualTo(1),"Fallback storage stays reserved while Analysis holds custody.");
                Click("Follow routed item"); yield return null;
                Assert.That(GameObject.Find("cargo-missing-operative-rifle-01"), Is.Not.Null);
                Click("Close recovered cargo"); yield return null;
                var scientist = b.Session.State.Base.Receiving.Workers.First(w => SGTeams.ForUnit(b.Session.State, w.UnitId) == null && w.Qualifications.ContainsKey("SCIENTIST") && w.ToolServices.Contains("SCT1"));
                Click("r4"); yield return null;Click("Close recovered cargo");yield return null; Click(scientist.UnitId); yield return null; Click("Assign Unit"); yield return null;
                Click("Open recovered cargo"); yield return null; Click("cargo-missing-operative-rifle-01"); yield return null;
                Click("Advance tick"); yield return null;
                Assert.That(GameObject.Find("Cargo physical details").GetComponentInChildren<Text>().text, Does.Not.Contain("ASGARD"));
                var analysisTracker=GameObject.Find("Cargo inspection tracker").GetComponent<InspectionProgressView>();
                float analysisDeadline=Time.realtimeSinceStartup+3.5f;
                while(analysisTracker.Rail.Fraction(0)<1&&Time.realtimeSinceStartup<analysisDeadline)yield return null;
                Assert.That(analysisTracker.Rail.SegmentCount,Is.EqualTo(2));Assert.That(analysisTracker.Rail.Fraction(0),Is.EqualTo(1));Assert.That(analysisTracker.Rail.Fraction(1),Is.EqualTo(0));
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Click("Mission view"); yield return null; Click("r4"); yield return null; Click("cargo-missing-operative-rifle-01"); yield return null;
                Click("Advance tick"); yield return null;
                Assert.That(GameObject.Find("Cargo physical details").GetComponentInChildren<Text>().text, Does.Contain("ASGARD").And.Contain("ELECTROMAGNETIC"));
                Assert.That(GameObject.Find("Cargo physical details").GetComponentInChildren<Text>().text, Does.Contain("Identification: Established").And.Contain("free the Analysis item place"));
                var returnTick = b.Session.State.Clock.ElapsedTicks;
                Click("Return cargo to storage"); yield return null;Click("Follow routed item");yield return null;
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(returnTick), "Returning custody to reserved storage is free.");
                Assert.That(b.Session.State.Cargo.Single(i => i.Id == "missing-operative-rifle-01").CustodyRoomId, Is.EqualTo("r10"));
                Click("Store cargo r9"); yield return null;Click("Follow routed item");yield return null;
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Cargo.Single(i => i.Id == "missing-operative-rifle-01").RoomId, Is.EqualTo("r9"));
                Assert.That(b.Session.State.Cargo.Single(i => i.Id == "missing-operative-rifle-01").Retained, Is.True);
                Click("Mission view");yield return null;Click("r2");yield return null;Click("cargo-supply-cache-01");yield return null;
                var supplyBefore=b.Session.State.Construction.Supply.ToDictionary(p=>p.Key,p=>p.Value);
                Click("Admit resource r2");yield return null;
                Assert.That(GameObject.Find("Resource recipe progress").GetComponent<InspectionProgressView>().Rail.SegmentCount,Is.EqualTo(10));
                var expectedRecovery=ResourceCargo.Totals(b.Session.State,b.Session.State.Cargo.Single(i=>i.Id=="supply-cache-01"));
                for(int n=0;n<b.Session.State.Base.ResourceProcessing.Bubbles.Sum(node=>node.DurationTicks);n++){Click("Advance tick");yield return null;if(n==3){Click("Save prototype");Click("Load prototype");yield return null;}}
                Assert.That(ResourceCargo.Consumed(b.Session.State,b.Session.State.Cargo.Single(i=>i.Id=="supply-cache-01")),Is.True);
                foreach(var output in expectedRecovery)Assert.That(b.Session.State.Construction.Supply[output.Key],Is.EqualTo(supplyBefore[output.Key]+output.Value));
                var aftermath = MissionCombat.Inspect(b.Session.State);
                var returnedHealth = PersonnelCondition.Health(b.Session.State,"unit-6");
                var toolCharges = b.Session.State.Expedition.Party.SelectMany(m => m.Tools).Select(t => t.InstanceId + ":" + t.Charges).ToArray();
                Click("Mission view"); yield return null; Click("r9"); yield return null;
                Click("equipment-item-missing-operative-rifle-01"); yield return null;
                var issueTick = b.Session.State.Clock.ElapsedTicks;
                Click("Choose equipment recipient"); yield return null; Click("issue-equipment-unit-6"); yield return null;
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(issueTick), "Unit custody is free.");
                Click("Save prototype"); Click("Load prototype"); yield return null;
                var carried = b.Session.State.Cargo.Single(i => i.Id == "missing-operative-rifle-01");
                Assert.That(carried.RoomId, Is.EqualTo("r9")); Assert.That(carried.EquippedUnitId, Is.EqualTo("unit-6"));
                Assert.That(PersonnelCondition.Health(b.Session.State,"unit-6"), Is.EqualTo(returnedHealth));
                Assert.That(b.Session.State.Expedition.Party.SelectMany(m => m.Tools).Select(t => t.InstanceId + ":" + t.Charges), Is.EqualTo(toolCharges));
                Click("Prepare redeployment"); yield return null;
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition, Is.Null);
                Assert.That(PersonnelCondition.Health(b.Session.State, "unit-6"), Is.EqualTo(returnedHealth));
                Click("select-team-sg-team-r6"); yield return null;
                Assert.That(GameObject.Find("team-unit-unit-6").transform.Find("Health count").GetComponentInChildren<Text>().text,Is.EqualTo(returnedHealth+"/100"));
                Click("Deploy SG team"); yield return null;
                Assert.That(PersonnelCondition.Health(b.Session.State,"unit-6"), Is.EqualTo(returnedHealth));
                Assert.That(b.Session.State.Expedition.Party.SelectMany(m => m.Tools).Select(t => t.InstanceId + ":" + t.Charges), Is.EqualTo(toolCharges));
                Assert.That(b.Session.State.Expedition.Party.Single(m => m.UnitId == "unit-6").Equipment.Single().InstanceId, Is.EqualTo("missing-operative-rifle-01"));
                var resetTick=b.Session.State.Clock.ElapsedTicks;Click("Reset mission"); yield return null;
                Assert.That(b.Session.State.Expedition, Is.Null); Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(resetTick));
                Assert.That(b.Session.State.Teams.Single().Designation, Is.EqualTo("SG-12"));
                Click("select-team-sg-team-r6"); yield return null;
                Click("Deploy SG team"); yield return null;
                Assert.That(b.Session.State.Expedition.GateChoicePending, Is.True);
                Assert.That(b.Session.State.Expedition.Party.Single(m => m.UnitId == "unit-6").Equipment.Any(e=>e.InstanceId=="missing-operative-rifle-01"),Is.False,"Debug Reset removes this mission's physical cargo and dependent equipment custody.");
                Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition, Is.Null, "Debug reset must not overwrite the saved redeployment preparation.");
                Assert.That(PersonnelCondition.Health(b.Session.State, "unit-6"), Is.EqualTo(returnedHealth));
                LogAssert.NoUnexpectedReceived();
            }
            finally
            {
                if (root != null) Object.Destroy(root); Object.Destroy(asset);
                if (File.Exists(path)) File.Delete(path); if (Directory.Exists(directory)) Directory.Delete(directory);
            }
        }
        [UnityTest] public IEnumerator NormalEntryConversationAndMainHallReloadUseActualControls()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-travel-ui-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json"); var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Travel UI test"); var b = root.AddComponent<PrototypeBootstrap>();
                b.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                Click("Mission view"); yield return null;
                GameObject.Find("Select unit-9").GetComponent<Toggle>().isOn = true;
                GameObject.Find("Select unit-1").GetComponent<Toggle>().isOn = true;
                Click("Deploy mission"); yield return null; Click("Maintain Gate"); yield return null;
                Assert.That(GameObject.Find("Known Stages").GetComponentInChildren<Text>().text, Does.Not.Contain("Main Hall"));
                Assert.That(GameObject.Find("Map team marker"), Is.Not.Null);
                Assert.That(GameObject.Find("map-label-stage-main-hall"), Is.Null);
                Assert.That(GameObject.Find("map-label-stage-holding-area"), Is.Null);
                Click("map-cell-stage-outer-yard-4-5"); yield return null;
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(1));
                Assert.That(GameObject.Find("Conversation text").GetComponentInChildren<Text>().text, Does.Contain("Visitors check in with Reynolds inside."));
                Assert.That(GameObject.Find("move-door-yard-to-mainhall"), Is.Null);
                Click("Save prototype"); Click("response-yard-diplomat-smalltalk"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.Knowledge, Does.Contain("reynolds-is-security-supervisor"));
                Click("Load prototype"); yield return null;
                Assert.That(GameObject.Find("Conversation text").GetComponentInChildren<Text>().text, Does.Contain("Visitors check in"));
                Assert.That(b.Session.State.Expedition.Travel.Knowledge, Does.Not.Contain("reynolds-is-security-supervisor"));
                Click("response-yard-ignore"); yield return null;
                Assert.That(GameObject.Find("Choose responder"), Is.Not.Null);
                Click("responder-unit-1"); yield return null;
                Assert.That(b.Session.State.Expedition.Travel.SceneId, Is.Null);
                Assert.That(b.Session.State.Expedition.Travel.History.Last().ActorId, Is.EqualTo("unit-1"));
                Click("Load prototype"); yield return null;
                Click("response-yard-diplomat-smalltalk"); yield return null;
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Assert.That(GameObject.Find("Conversation text").GetComponentInChildren<Text>().text, Does.Contain("Same as usual."));
                Click("Continue conversation"); yield return null;
                Click("move-door-yard-to-mainhall"); yield return null;
                Assert.That(GameObject.Find("Current Stage").GetComponentInChildren<Text>().text, Is.EqualTo("Main Hall"));
                Assert.That(GameObject.Find("map-label-stage-main-hall"), Is.Not.Null);
                Assert.That(GameObject.Find("map-label-stage-holding-area"), Is.Null);
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(2));
                Assert.That(GameObject.Find("Redial Gate").GetComponent<Button>().interactable, Is.False);
                Click("Save prototype"); Click("move-door-yard-to-mainhall"); yield return null;
                Assert.That(GameObject.Find("Conversation text"), Is.Null);
                Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Expedition.StageId, Is.EqualTo("stage-main-hall"));
                Assert.That(b.Session.State.Expedition.Travel.Knowledge.Count(k => k == "reynolds-is-security-supervisor"), Is.EqualTo(1));
                LogAssert.NoUnexpectedReceived();
            }
            finally
            {
                if (root != null) Object.Destroy(root); Object.Destroy(asset);
                if (File.Exists(path)) File.Delete(path); if (Directory.Exists(directory)) Directory.Delete(directory);
            }
        }
        [UnityTest] public IEnumerator SelectDeployChooseGateAndLoadRestoreTheActualTeamWithoutTouchingTheUserSlot()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-deployment-ui-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json"); var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Deployment UI test"); var b = root.AddComponent<PrototypeBootstrap>();
                b.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                b.Session.AssignUnit("unit-1", "r2");
                Click("Mission view"); yield return null;
                Assert.That(GameObject.Find("Mission briefing").GetComponentInChildren<Text>().text, Does.Contain("undercover operative"));
                Assert.That(GameObject.Find("Deploy mission").GetComponent<Button>().interactable, Is.False);
                Assert.That(GameObject.Find("Select unit-1").GetComponent<Toggle>().interactable, Is.False);
                var selected = GameObject.Find("Select unit-6").GetComponent<Toggle>();
                selected.isOn = true;
                Assert.That(GameObject.Find("Deployment team").GetComponentInChildren<Text>().text, Does.Contain("Health 100").And.Contain("charges"));
                Assert.That(b.Session.State.Expedition, Is.Null, "Readiness must not deploy or advance time.");
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.Zero);
                Assert.That(GameObject.Find("mission-unit-6").GetComponent<Outline>().enabled, Is.True);
                Assert.That(GameObject.Find("Deployment team").GetComponentInChildren<Text>().text, Does.Contain("SOLDIER3/TECHNICIAN3"));
                Assert.That(GameObject.Find("mission-unit-6").GetComponentInChildren<Text>().text, Does.StartWith("Name: "));
                selected.isOn = false;
                Assert.That(GameObject.Find("mission-unit-6").GetComponent<Outline>().enabled, Is.False);
                Click("mission-unit-6"); Click("mission-unit-19"); Click("Deploy mission"); yield return null;
                Assert.That(b.Session.State.Expedition.Party.Select(p => p.UnitId), Is.EqualTo(new[] { "unit-6", "unit-19" }));
                Assert.That(GameObject.Find("Gate arrival").GetComponentInChildren<Text>().text, Does.Contain("GATE ARRIVAL"));
                var visibleObjectives = GameObject.Find("Visible mission objectives").GetComponentInChildren<Text>().text;
                var hiddenTexts = b.Session.State.Base.Mission.Travel.Field.Objectives.Where(o => b.Session.State.Expedition.Travel.Field.Objectives[o.Id] == "HIDDEN").Select(o => o.Text);
                foreach (var hidden in hiddenTexts) Assert.That(visibleObjectives, Does.Not.Contain(hidden));
                Assert.That(GameObject.Find("Advance tick").GetComponent<Button>().interactable, Is.False);
                Assert.That(GameObject.Find("Pause clock").GetComponent<Button>().interactable, Is.False);
                Click("Close Gate"); yield return null; Click("Save prototype"); Click("Redial Gate"); yield return null;
                Assert.That(GameObject.Find("Current Stage").GetComponentInChildren<Text>().text, Is.EqualTo("Gate Yard"));
                Assert.That(GameObject.Find("Maintain Gate"), Is.Null);
                Assert.That(GameObject.Find("Mission view").GetComponent<Button>().interactable, Is.True);
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.EqualTo(1));
                Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Clock.ElapsedTicks, Is.Zero);
                Assert.That(b.Session.State.Expedition.GateOpen, Is.False);
                Assert.That(GameObject.Find("Redial Gate").GetComponent<Button>().interactable, Is.True);
                Click("Toggle team details"); yield return null;
                Assert.That(GameObject.Find("Visible mission objectives").GetComponentInChildren<Text>().text, Is.EqualTo(visibleObjectives));
                Assert.That(GameObject.Find("Offworld party").GetComponentInChildren<Text>().text, Does.Contain("Technician Tools"));
                Click("Toggle team details"); yield return null;
                Assert.That(GameObject.Find("Mission map"), Is.Not.Null);
                Click("Mission view"); yield return null;
                Click("unit-19");
                Assert.That(GameObject.Find("Assign Unit").GetComponent<Button>().interactable, Is.False);
                Assert.That(GameObject.Find("unit-19").GetComponentInChildren<Text>().text, Does.Contain("Offworld"));
                LogAssert.NoUnexpectedReceived();
            }
            finally
            {
                if (root != null) Object.Destroy(root); Object.Destroy(asset);
                if (File.Exists(path)) File.Delete(path); if (Directory.Exists(directory)) Directory.Delete(directory);
            }
        }
    }
}
#endif
