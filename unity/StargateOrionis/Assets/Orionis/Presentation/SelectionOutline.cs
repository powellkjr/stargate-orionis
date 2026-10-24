using Orionis.Application;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    // Selection follows application state, independent of EventSystem keyboard/mouse focus.
    public sealed class SelectionOutline : MonoBehaviour
    {
        private SelectionService selection;
        private SelectionKind kind;
        private string entityId;
        private Outline outline;

        public void Bind(SelectionService service, SelectionKind entityKind, string id)
        {
            if (selection != null) selection.Changed -= Render;
            selection = service; kind = entityKind; entityId = id;
            outline = GetComponent<Outline>() ?? gameObject.AddComponent<Outline>();
            outline.effectColor = new Color(1f, .84f, .3f, 1f);
            outline.effectDistance = new Vector2(2, -2);
            outline.useGraphicAlpha = false;
            Render(selection.Current);
            selection.Changed += Render;
        }
        private void Render(SelectionDetails details)
        { outline.enabled = details != null && details.Kind == kind && details.Id == entityId; }
        private void OnDestroy()
        { if (selection != null) selection.Changed -= Render; }
    }
}
