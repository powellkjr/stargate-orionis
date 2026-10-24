#if UNITY_EDITOR
using System;
using System.Collections;
using System.IO;
using System.Linq;
using NUnit.Framework;
using Orionis.Infrastructure;
using Orionis.Presentation;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;
using Object = UnityEngine.Object;

namespace Orionis.Tests
{
    public sealed class StaffTransferSceneTests
    {
        private static void Click(string name) => GameObject.Find(name).GetComponent<Button>().onClick.Invoke();
        [UnityTest] public IEnumerator PlannedMoveReservesCapacitySurvivesPausedSaveAndMovesAfterTheStep()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-transfer-ui-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json"); var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Transfer UI test"); var b = root.AddComponent<PrototypeBootstrap>();
                b.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                Click("Pause clock"); // These walkthroughs intentionally use manual ticks.
                Click("r2"); Click("unit-19"); Click("Assign Unit"); Click("r2"); Click("Admit incoming object"); Click("Advance tick");
                Click("r5"); Click("unit-19"); Click("Transfer after step");
                Assert.That(b.Session.State.Transfers.Single().DestinationRoomId, Is.EqualTo("r5"));
                Assert.That(GameObject.Find("Staffing status").GetComponentInChildren<Text>().text, Does.Contain("reserved"));
                Assert.That(b.Session.State.Assignments.Single().RoomInstanceId, Is.EqualTo("r2"));
                Click("Pause inspection"); Click("Save prototype"); Click("Advance tick");
                Assert.That(b.Session.State.Transfers, Has.Count.EqualTo(1));
                Click("Cancel transfer"); Assert.That(b.Session.State.Transfers, Is.Empty);
                Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Transfers, Has.Count.EqualTo(1));
                Click("Pause inspection"); Click("Advance tick");
                Assert.That(b.Session.State.Transfers, Is.Empty);
                Assert.That(b.Session.State.Assignments.Single().RoomInstanceId, Is.EqualTo("r5"));
                Assert.That(GameObject.Find("unit-19").GetComponentInChildren<Text>().text, Does.Contain("Workshop"));
                Assert.That(GameObject.Find("Staffing status").GetComponentInChildren<Text>().text, Does.Not.Contain("Place reserved"));
                Assert.That(b.Session.State.Base.Units.All(u => !u.Name.EndsWith(" Sr.") && !u.Name.EndsWith(" V.")), Is.True);
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
