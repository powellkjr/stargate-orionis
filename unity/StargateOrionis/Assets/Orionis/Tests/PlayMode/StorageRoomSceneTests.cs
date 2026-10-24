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
    public sealed class StorageRoomSceneTests
    {
        private void Click(string name) => GameObject.Find(name).GetComponent<Button>().onClick.Invoke();
        [UnityTest] public IEnumerator StorageTilesExplainConfiguredCapacityAndContainmentCanBeStaffed()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-storage-ui-" + Guid.NewGuid().ToString("N")); var path = Path.Combine(directory, "save.json");
            var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json")); GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode("Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Storage UI test"); var b = root.AddComponent<PrototypeBootstrap>(); b.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                foreach (var id in new[] { "r7", "r8" })
                { Click(id); yield return null; Assert.That(GameObject.Find("Storage room information").GetComponentInChildren<Text>().text, Does.Contain("4000")); }
                Click("r11"); yield return null;
                Assert.That(GameObject.Find("Storage room information").GetComponentInChildren<Text>().text, Does.Contain("Configured item places: 20"));
                Click("r9"); yield return null;
                Assert.That(GameObject.Find("Equipment heading").GetComponentInChildren<Text>().text, Does.Contain("Equipment Storage"));
                Assert.That(GameObject.Find("Equipment capacity").GetComponentInChildren<Text>().text, Does.Contain("Weapons: 0/20"));
                Click("equipment-tab-armor"); yield return null;
                Assert.That(GameObject.Find("Equipment capacity").GetComponentInChildren<Text>().text, Does.Contain("Armor: 0/20"));
                Click("Close equipment inventory"); yield return null;
                Click("r10"); yield return null;
                Assert.That(GameObject.Find("Details").GetComponentInChildren<Text>().text, Does.Contain("Staff 0/2"));
                Click("unit-19"); yield return null; Click("Assign Unit");
                Assert.That(b.Session.State.Assignments.Single().RoomInstanceId, Is.EqualTo("r10"));
                Click("Save prototype"); Click("Load prototype"); yield return null;
                Assert.That(b.Session.State.Base.Rooms.Count, Is.EqualTo(11)); Assert.That(b.Session.State.Assignments.Single().RoomInstanceId, Is.EqualTo("r10"));
                LogAssert.NoUnexpectedReceived();
            }
            finally
            { if (root != null) Object.Destroy(root); Object.Destroy(asset); if (File.Exists(path)) File.Delete(path); if (Directory.Exists(directory)) Directory.Delete(directory); }
        }
    }
}
#endif
