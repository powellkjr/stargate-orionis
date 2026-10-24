#if UNITY_EDITOR
using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.TestTools;
using UnityEngine.UI;
using Orionis.Presentation;

namespace Orionis.Tests
{
    public sealed class BootstrapSceneTests
    {
        [UnityTest] public IEnumerator SelectionSceneLoadsAndButtonsUpdateDetails()
        {
            yield return UnityEditor.SceneManagement.EditorSceneManager.LoadSceneAsyncInPlayMode(
                "Assets/Orionis/Scenes/Bootstrap.unity", new LoadSceneParameters(LoadSceneMode.Single));
            yield return null;
            Assert.That(Object.FindAnyObjectByType<PrototypeBootstrap>(), Is.Not.Null);
            Assert.That(Object.FindObjectsByType<Button>().Length, Is.EqualTo(80));
            var button = GameObject.Find("r1").GetComponent<Button>();
            var other = GameObject.Find("r2").GetComponent<Button>();
            var originalColor = button.GetComponent<Image>().color;
            var otherColor = other.GetComponent<Image>().color;
            button.onClick.Invoke();
            Assert.That(GameObject.Find("Details").GetComponentInChildren<Text>().text, Does.Contain("r1"));
            Assert.That(button.GetComponent<Outline>().enabled, Is.True);
            Assert.That(other.GetComponent<Outline>().enabled, Is.False);
            other.onClick.Invoke();
            yield return new WaitForSecondsRealtime(.2f);
            Assert.That(button.transition, Is.EqualTo(Selectable.Transition.None));
            Assert.That(other.transition, Is.EqualTo(Selectable.Transition.None));
            Assert.That(button.GetComponent<Image>().color, Is.EqualTo(originalColor));
            Assert.That(other.GetComponent<Image>().color, Is.EqualTo(otherColor));
            Assert.That(button.GetComponent<Outline>().enabled, Is.False);
            Assert.That(other.GetComponent<Outline>().enabled, Is.True);
            Assert.That(button.GetComponent<Outline>().effectColor, Is.EqualTo(other.GetComponent<Outline>().effectColor));
            GameObject.Find("unit-1").GetComponent<Button>().onClick.Invoke();
            Assert.That(GameObject.Find("Details").GetComponentInChildren<Text>().text, Does.Contain("unit-1"));
            Assert.That(other.GetComponent<Outline>().enabled, Is.False);
            Assert.That(GameObject.Find("unit-1").GetComponent<Outline>().enabled, Is.True);
            LogAssert.NoUnexpectedReceived();
        }
    }
}
#endif
