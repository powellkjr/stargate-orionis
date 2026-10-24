#if UNITY_EDITOR
using System;
using System.Collections;
using System.IO;
using System.Linq;
using NUnit.Framework;
using Orionis.Domain;
using Orionis.Infrastructure;
using Orionis.Presentation;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;
using Object = UnityEngine.Object;

namespace Orionis.Tests
{
    public sealed class ReceivingSceneTests
    {
        private static void Click(string name) => GameObject.Find(name).GetComponent<Button>().onClick.Invoke();
        [UnityTest] public IEnumerator ReceivingUiRejectsWrongCustodyPausesSavesLoadsAndCompletesWithoutHiddenFacts()
        {
            var directory = Path.Combine(Path.GetTempPath(), "orionis-receiving-ui-" + Guid.NewGuid().ToString("N"));
            var path = Path.Combine(directory, "save.json");
            var asset = new TextAsset(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            GameObject root = null;
            try
            {
                yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                    "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
                Object.Destroy(Object.FindAnyObjectByType<PrototypeBootstrap>().gameObject); yield return null;
                root = new GameObject("Receiving UI test"); var bootstrap = root.AddComponent<PrototypeBootstrap>();
                bootstrap.Configure(asset, new FileCampaignSaveStore(path, new CampaignSaveCodec(asset.text))); yield return null;
                Click("Pause clock"); // These walkthroughs intentionally use manual ticks.
                var s = bootstrap.Session;
                var tech = s.State.Base.Units.First(u => u.Profession == "TECHNICIAN").Id;
                var scientist = s.State.Base.Units.First(u => u.Profession == "SCIENTIST").Id;
                Click("r5"); Click("Admit incoming object");
                Assert.That(s.State.Receiving, Is.Empty);
                Assert.That(GameObject.Find("Receiving status").GetComponentInChildren<Text>().text, Does.Contain("admission"));
                Click("r2"); Click("Admit incoming object"); Click("Advance tick");
                Assert.That(GameObject.Find("Receiving details").GetComponentInChildren<Text>().text, Does.Contain("Assign a qualified TECHNICIAN"));
                Click(tech); Click("Assign Unit"); Click(scientist); Click("Assign Unit");
                Click("Advance tick"); Click("Pause inspection"); Click("Save prototype"); Click("Advance tick");
                Assert.That(s.State.Receiving.Single().Progress[0].Ticks, Is.EqualTo(1));
                Click("Load prototype"); yield return null;
                Assert.That(s.State.Receiving.Single().Paused, Is.True);
                Assert.That(s.State.Receiving.Single().Progress[0].Ticks, Is.EqualTo(1));
                Click("Pause inspection"); Click("Advance tick");
                Assert.That(s.State.Receiving.Single().Progress[1].Ticks, Is.Zero);
                Click("Advance tick"); Click("Advance tick");
                var text = GameObject.Find("Receiving details").GetComponentInChildren<Text>().text;
                Assert.That(text, Does.Contain("Unknown rifle").And.Contain("Receiving complete").And.Contain("RIFLE"));
                Assert.That(text, Does.Not.Contain("ASGARD").And.Not.Contain("ELECTROMAGNETIC"));
                Assert.That(ReceivingWork.IsComplete(s.State.Base.Receiving, s.State.Receiving.Single()), Is.True);
                Assert.That(GameObject.Find("Admit incoming object").GetComponent<Button>().interactable, Is.False);
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
