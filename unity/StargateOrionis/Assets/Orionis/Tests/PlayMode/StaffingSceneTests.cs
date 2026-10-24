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
    public sealed class StaffingSceneTests
    {
        private static void Click(string name) { GameObject.Find(name).GetComponent<Button>().onClick.Invoke(); }
        [UnityTest] public IEnumerator ManualStaffingEnforcesCapacityAndRestoresAfterLoad()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-staffing-ui-tests-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json");
            var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Staffing UI test"); var bootstrap = root.AddComponent<PrototypeBootstrap>();
                bootstrap.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                Click("r5"); Click("unit-1"); Click("Assign Unit");
                Click("unit-2"); Click("Assign Unit");
                Assert.That(bootstrap.Session.State.Assignments.Count, Is.EqualTo(2));
                Assert.That(GameObject.Find("r5").GetComponentInChildren<Text>().text, Does.Contain("2/2"));
                Click("unit-3"); Click("Assign Unit");
                Assert.That(bootstrap.Session.State.Assignments.Count, Is.EqualTo(2));
                Assert.That(GameObject.Find("Staffing status").GetComponentInChildren<Text>().text, Does.Contain("no free"));
                Click("r1"); Click("unit-1"); Click("Assign Unit");
                Assert.That(bootstrap.Session.State.Assignments.Single(a => a.UnitId == "unit-1").RoomInstanceId, Is.EqualTo("r1"));
                Assert.That(GameObject.Find("unit-1").GetComponentInChildren<Text>().text, Does.Contain("Gate Room"));
                Click("Save prototype"); Click("Unassign Unit");
                Assert.That(bootstrap.Session.State.Assignments.Count, Is.EqualTo(1));
                Click("Load prototype"); yield return null;
                Assert.That(bootstrap.Session.State.Assignments.Count, Is.EqualTo(2));
                Assert.That(GameObject.Find("unit-1").GetComponent<Outline>().enabled, Is.True);
                // Refresh events after Load must not call views destroyed by the previous binding.
                Click("Unassign Unit");
                Assert.That(GameObject.Find("unit-1").GetComponentInChildren<Text>().text, Does.Contain("Unassigned"));
                Assert.That(bootstrap.Session.State.Clock.ElapsedTicks, Is.Zero);
                LogAssert.NoUnexpectedReceived();
            }
            finally
            {
                if (root != null) Object.Destroy(root); Object.Destroy(asset);
                if (File.Exists(path)) File.Delete(path);
                if (Directory.Exists(directory)) Directory.Delete(directory);
            }
        }
    }
}
#endif
