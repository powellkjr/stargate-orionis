#if UNITY_EDITOR
using System;
using System.Collections;
using System.IO;
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
    public sealed class SaveLoadSceneTests
    {
        [UnityTest] public IEnumerator SaveAndLoadButtonsRestoreAfterRecreatingSessionWithoutTouchingUserSlot()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-save-ui-tests-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json");
            var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject);
                yield return null;
                root = new GameObject("Save UI test");
                var bootstrap = root.AddComponent<PrototypeBootstrap>();
                bootstrap.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text)), false);
                yield return null;
                Assert.That(GameObject.Find("Reset mission"), Is.Null);
                Assert.That(GameObject.Find("Advance tick"), Is.Null);
                var original = bootstrap.Session.State;
                GameObject.Find("Toggle debug controls").GetComponent<Button>().onClick.Invoke();
                yield return null;
                Assert.That(bootstrap.Session.State, Is.SameAs(original));
                Assert.That(GameObject.Find("Reset mission"), Is.Not.Null);
                GameObject.Find("Pause clock").GetComponent<Button>().onClick.Invoke();
                foreach(var expected in new[]{"4x","8x","16x","1x"}) { GameObject.Find("Clock speed").GetComponent<Button>().onClick.Invoke(); Assert.That(GameObject.Find("Clock speed").GetComponentInChildren<Text>().text,Is.EqualTo(expected)); }
                Assert.That(GameObject.Find("Resource supplies").GetComponentInChildren<Text>().text,Does.Contain("800"));
                Assert.That(GameObject.Find("Resource materials").GetComponentInChildren<Text>().text,Does.Contain("0"));
                Assert.That(GameObject.Find("Resource rations").GetComponentInChildren<Text>().text,Does.Contain("0"));
                Assert.That(GameObject.Find("r16").GetComponentInChildren<Text>().text,Does.Not.Contain("0/0"));
                GameObject.Find("Open base planning").GetComponent<Button>().onClick.Invoke();
                yield return null;
                Canvas.ForceUpdateCanvases();
                var frameCorners = new Vector3[4]; var gridCorners = new Vector3[4];
                GameObject.Find("Expansion grid frame").GetComponent<RectTransform>().GetWorldCorners(frameCorners);
                GameObject.Find("Expansion grid").GetComponent<RectTransform>().GetWorldCorners(gridCorners);
                Assert.That(gridCorners[0].x, Is.GreaterThanOrEqualTo(frameCorners[0].x - 1));
                Assert.That(gridCorners[0].y, Is.GreaterThanOrEqualTo(frameCorners[0].y - 1));
                Assert.That(gridCorners[2].x, Is.LessThanOrEqualTo(frameCorners[2].x + 1));
                Assert.That(gridCorners[2].y, Is.LessThanOrEqualTo(frameCorners[2].y + 1));
                GameObject.Find("Plan room cultural_platform").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Plan cell 11 9").GetComponent<Button>().onClick.Invoke();
                Assert.That(GameObject.Find("Placement status").GetComponentInChildren<Text>().text, Does.Contain("outside"));
                GameObject.Find("Plan cell 1 3").GetComponent<Button>().onClick.Invoke();
                Assert.That(GameObject.Find("Placement status").GetComponentInChildren<Text>().text, Does.Contain("overlaps"));
                GameObject.Find("Plan cell 0 0").GetComponent<Button>().onClick.Invoke();
                Assert.That(GameObject.Find("Placement status").GetComponentInChildren<Text>().text, Does.Contain("Footprint fits"));
                GameObject.Find("Plan room ready_room").GetComponent<Button>().onClick.Invoke();
                var planDetails = GameObject.Find("Planned room details").GetComponentInChildren<Text>();
                Assert.That(planDetails.text, Does.Contain("Core envelope: None"));
                Assert.That(planDetails.text, Does.Contain("One SG team / 4 members"));
                Assert.That(planDetails.text, Does.Contain("24 hours / 24 S1 Supply"));
                GameObject.Find("Plan construction tier").GetComponent<Button>().onClick.Invoke();
                Assert.That(GameObject.Find("Plan construction tier").GetComponentInChildren<Text>().text, Does.Contain("tier 2"));
                GameObject.Find("Plan room analysis").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Plan construction tier").GetComponent<Button>().onClick.Invoke();
                Assert.That(planDetails.text, Does.Contain("Staff places: 2"));
                Assert.That(planDetails.text, Does.Contain("Core envelope: 4 per physical room"));
                GameObject.Find("Plan room receiving").GetComponent<Button>().onClick.Invoke();
                Assert.That(planDetails.text, Does.Contain("48 hours / 48 S1 Supply"));
                Assert.That(planDetails.text, Does.Contain("Inventory places: 40 x 0.6h = 24h"));
                GameObject.Find("Plan construction tier").GetComponent<Button>().onClick.Invoke();
                Assert.That(planDetails.text, Does.Contain("Upgrade CT1 to CT2"));
                Assert.That(planDetails.text, Does.Contain("36 hours / 36 S2 Supply"));
                Assert.That(bootstrap.Session.State, Is.SameAs(original), "Planning must not construct rooms or spend resources.");
                GameObject.Find("Close base planning").GetComponent<Button>().onClick.Invoke();
                yield return null;
                GameObject.Find("Load prototype").GetComponent<Button>().onClick.Invoke();
                Assert.That(bootstrap.Session.State, Is.SameAs(original));
                Assert.That(GameObject.Find("Save status").GetComponentInChildren<Text>().text, Does.Contain("No prototype save"));
                GameObject.Find("r2").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Advance tick").GetComponent<Button>().onClick.Invoke();
                Assert.That(bootstrap.Session.State.Clock.ElapsedMinutes, Is.EqualTo(3));
                Assert.That(GameObject.Find("Campaign time").GetComponentInChildren<Text>().text, Does.Contain("00:03"));
                GameObject.Find("Save prototype").GetComponent<Button>().onClick.Invoke();
                Assert.That(File.Exists(path), Is.True);
                GameObject.Find("Advance tick").GetComponent<Button>().onClick.Invoke();
                Assert.That(bootstrap.Session.State.Clock.ElapsedTicks, Is.EqualTo(2));
                Object.Destroy(root); yield return null;
                root = new GameObject("Reloaded save UI test");
                bootstrap = root.AddComponent<PrototypeBootstrap>();
                bootstrap.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text)), false);
                yield return null;
                Assert.That(bootstrap.Session.Selection.Current, Is.Null);
                Assert.That(bootstrap.Session.State.Clock.ElapsedTicks, Is.Zero);
                Assert.That(GameObject.Find("Advance tick"), Is.Null);
                GameObject.Find("Toggle debug controls").GetComponent<Button>().onClick.Invoke();
                yield return null;
                Assert.That(GameObject.Find("Advance tick").GetComponent<Button>().interactable, Is.False);
                GameObject.Find("Pause clock").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Load prototype").GetComponent<Button>().onClick.Invoke();
                yield return null;
                Assert.That(bootstrap.Session.Selection.Current.Id, Is.EqualTo("r2"));
                Assert.That(bootstrap.Session.State.Clock.ElapsedTicks, Is.EqualTo(1));
                Assert.That(GameObject.Find("Advance tick").GetComponent<Button>().interactable, Is.True);
                Assert.That(GameObject.Find("Campaign time").GetComponentInChildren<Text>().text, Does.Contain("Paused"));
                Assert.That(GameObject.Find("r2").GetComponent<Outline>().enabled, Is.True);
                Assert.That(bootstrap.Session.State.Base.Planning, Is.Not.Null);
                GameObject.Find("Open base planning").GetComponent<Button>().onClick.Invoke();
                yield return null;
                Assert.That(GameObject.Find("Plan room cultural_platform"), Is.Not.Null,
                    "Loading a campaign must retain the shared planning catalog and its entry point.");
                Assert.That(GameObject.Find("Room category Operations"), Is.Not.Null);
                GameObject.Find("Plan room ready_room").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Clear rock mode").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Plan cell 0 0").GetComponent<Button>().onClick.Invoke();
                Assert.That(RoomConstruction.IsClear(bootstrap.Session.State,0,0),Is.False);
                Assert.That(GameObject.Find("Clearing rail 0,0").GetComponent<RecipeProgressGraphic>().SegmentCount,Is.EqualTo(8));
                for(int t=0;t<4;t++)bootstrap.Session.AdvanceOneTick();
                yield return null;
                Assert.That(RoomConstruction.IsClear(bootstrap.Session.State,0,0),Is.True);
                var clearingRail=GameObject.Find("Clearing rail 0,0").GetComponent<RecipeProgressGraphic>();
                Assert.That(clearingRail.SegmentColor(0),Is.Not.EqualTo(clearingRail.SegmentColor(1)));
                GameObject.Find("Clear rock mode").GetComponent<Button>().onClick.Invoke();
                Assert.That(GameObject.Find("Construction actor"), Is.Null);
                Assert.That(GameObject.Find("Build room").GetComponent<Button>().interactable, Is.True);
                GameObject.Find("Build room").GetComponent<Button>().onClick.Invoke();
                yield return null;
                var site = bootstrap.Session.State.Construction.Sites[0];
                var rail=GameObject.Find("Progress rail").GetComponent<RecipeProgressGraphic>();
                Assert.That(rail.SegmentCount,Is.EqualTo(24),"24-hour construction has 24 twenty-tick work bubbles.");
                Assert.That(rail.SegmentColor(0),Is.Not.EqualTo(rail.SegmentColor(1)));
                for (int t=0;t<20;t++) bootstrap.Session.AdvanceOneTick();
                yield return null;
                Assert.That(GameObject.Find("Build phase").GetComponentInChildren<Text>().text, Does.Contain("TECHNICIAN"));
                Assert.That(rail.Fraction(0),Is.EqualTo(1));
                GameObject.Find("Save prototype").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Load prototype").GetComponent<Button>().onClick.Invoke();
                yield return null;
                Assert.That(bootstrap.Session.State.Construction.Sites[0].WorkedTicks, Is.EqualTo(20));
                Assert.That(bootstrap.Session.State.Construction.Supply["S1"], Is.EqualTo(486));
                GameObject.Find("Open base planning").GetComponent<Button>().onClick.Invoke();
                yield return null;
                Assert.That(GameObject.Find("Build phase").GetComponentInChildren<Text>().text, Does.Contain("TECHNICIAN"));
                for(int t=20;t<480;t++)bootstrap.Session.AdvanceOneTick();
                yield return null;
                GameObject.Find("Manage rooms").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Plan cell 8 3").GetComponent<Button>().onClick.Invoke();
                Assert.That(GameObject.Find("Build room").GetComponent<Button>().interactable,Is.True);
                GameObject.Find("Build room").GetComponent<Button>().onClick.Invoke();
                for(int t=0;t<120;t++)bootstrap.Session.AdvanceOneTick();
                yield return null;
                Assert.That(System.Linq.Enumerable.Single(bootstrap.Session.State.Base.Rooms,r=>r.Id=="r6").TeamCapacity,Is.EqualTo(5));
                GameObject.Find("Plan room analysis").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Plan cell 6 2").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Build room").GetComponent<Button>().onClick.Invoke();
                for(int t=0;t<480;t++)bootstrap.Session.AdvanceOneTick();
                yield return null;
                GameObject.Find("Manage rooms").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Plan cell 6 3").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Plan cell 6 2").GetComponent<Button>().onClick.Invoke();
                Assert.That(GameObject.Find("Join rooms").GetComponent<Button>().interactable,Is.True);
                GameObject.Find("Join rooms").GetComponent<Button>().onClick.Invoke();
                Assert.That(Orionis.Domain.RoomGroups.Members(bootstrap.Session.State,"r4").Count,Is.EqualTo(2));
                GameObject.Find("Split rooms").GetComponent<Button>().onClick.Invoke();
                Assert.That(Orionis.Domain.RoomGroups.Members(bootstrap.Session.State,"r4").Count,Is.EqualTo(1));

                GameObject.Find("Close base planning").GetComponent<Button>().onClick.Invoke();
                yield return null;
                Assert.That(GameObject.Find("Clock speed").GetComponent<Button>().interactable, Is.True);
                var restored = bootstrap.Session.State;
                File.WriteAllText(path, "{corrupt");
                GameObject.Find("Load prototype").GetComponent<Button>().onClick.Invoke();
                Assert.That(bootstrap.Session.State, Is.SameAs(restored));
                Assert.That(bootstrap.Session.Selection.Current.Id, Is.EqualTo("r2"));
                Assert.That(GameObject.Find("Save status").GetComponentInChildren<Text>().text, Does.Contain("Save/load failed"));
                bootstrap.Session.Deploy(new[]{"unit-2"});
                yield return null;
                Assert.That(GameObject.Find("Campaign time").GetComponentInChildren<Text>().text,Does.Contain("Awaiting Gate decision"));
                GameObject.Find("Mission view").GetComponent<Button>().onClick.Invoke();
                yield return null;
                GameObject.Find("Open base planning").GetComponent<Button>().onClick.Invoke();
                yield return null;
                GameObject.Find("Plan room cultural_platform").GetComponent<Button>().onClick.Invoke();
                GameObject.Find("Plan cell 0 6").GetComponent<Button>().onClick.Invoke();
                Assert.That(GameObject.Find("Construction actor"),Is.Null);
                Assert.That(GameObject.Find("Construction readiness").GetComponentInChildren<Text>().text,Does.Contain("Work follows mission actions"));
                Assert.That(GameObject.Find("Build room").GetComponent<Button>().interactable,Is.True);
                GameObject.Find("Build room").GetComponent<Button>().onClick.Invoke();
                yield return null;
                var cultural=System.Linq.Enumerable.Single(bootstrap.Session.State.Construction.Sites,w=>w.DefinitionId=="cultural_platform");
                Assert.That(cultural.ActorId,Is.EqualTo("unit-22"));Assert.That(cultural.SecurityActorId,Is.EqualTo("unit-1"));Assert.That(cultural.WorkedTicks,Is.Zero);
                bootstrap.Session.ChooseGate(false);bootstrap.Session.MoveParty("door-gate-to-yard");
                yield return null;
                Assert.That(System.Linq.Enumerable.Single(bootstrap.Session.State.Construction.Sites,w=>w.DefinitionId=="cultural_platform").WorkedTicks,Is.EqualTo(1));
                LogAssert.NoUnexpectedReceived();
            }
            finally
            {
                if (root != null) Object.Destroy(root);
                Object.Destroy(asset);
                if (File.Exists(path)) File.Delete(path);
                if (Directory.Exists(directory)) Directory.Delete(directory);
            }
        }
    }
}
#endif
