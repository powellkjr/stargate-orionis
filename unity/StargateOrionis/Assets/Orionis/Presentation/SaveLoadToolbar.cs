using System;
using System.IO;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class SaveLoadToolbar : MonoBehaviour
    {
        private Text status;
        public void Bind(Action save, Action load, string message, Action reset = null, Action toggleDebug = null, bool debugEnabled = false)
        {
            PrototypeUi.Button("Save prototype", transform, new Vector2(.01f, .12f), new Vector2(.065f, .88f),
                "Save", new Color(.15f, .23f, .3f), () => Run(save, "Campaign saved."));
            PrototypeUi.Button("Load prototype", transform, new Vector2(.07f, .12f), new Vector2(.125f, .88f),
                "Load", new Color(.15f, .23f, .3f), () => Run(load, "Campaign loaded."));
            if (reset != null) PrototypeUi.Button("Reset mission", transform, new Vector2(.13f, .12f), new Vector2(.225f, .88f),
                "Reset mission", new Color(.32f, .2f, .16f), () => Run(reset, "Mission reset. Existing save is unchanged until Save."));
            if (toggleDebug != null) PrototypeUi.Button("Toggle debug controls", transform, new Vector2(.78f, .12f), new Vector2(.87f, .88f),
                debugEnabled ? "Debug: on" : "Debug: off", new Color(.15f, .23f, .3f), () => toggleDebug());
            foreach (var button in GetComponentsInChildren<Button>()) button.GetComponentInChildren<Text>().fontSize = 14;
            status = PrototypeUi.Label(PrototypeUi.Rect("Save status", transform, new Vector2(reset == null ? .14f : .24f, 0), new Vector2(toggleDebug == null ? .87f : .77f, 1)), message, 12);
            status.alignment = TextAnchor.MiddleLeft;
        }
        private void Run(Action action, string message)
        {
            try { action(); status.text = message; }
            catch (FileNotFoundException) { status.text = "No campaign save yet. Choose Save first."; }
            catch (DirectoryNotFoundException) { status.text = "No campaign save yet. Choose Save first."; }
            catch (Exception error) { status.text = "Save/load failed: " + error.Message; }
        }
    }
}
