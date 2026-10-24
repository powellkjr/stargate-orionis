using System.Linq;
using Orionis.Application;
using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    public sealed class ResourceHeader : MonoBehaviour
    {
        private CampaignSession session;
        private Text[] labels;
        private string[] categories;
        public void Bind(CampaignSession value)
        {
            session = value;
            categories = new[] { "supplies", "materials", "rations" };
            labels = categories.Select((category, i) => {
                var rect = PrototypeUi.Rect("Resource " + category, transform, new Vector2(i / 3f + .005f, .04f), new Vector2((i + 1) / 3f - .005f, .96f));
                rect.gameObject.AddComponent<Image>().color = new Color(.09f, .14f, .18f);
                var text = PrototypeUi.Label(rect, "", 13); text.alignment = TextAnchor.MiddleLeft;
                text.rectTransform.offsetMin = new Vector2(9, 0); text.rectTransform.offsetMax = new Vector2(-4, 0); return text;
            }).ToArray();
            session.TickCommitted += Tick; session.ConstructionChanged += Refresh;
            Refresh();
        }
        private double Stock(string name) => session.State.Construction != null && session.State.Construction.Supply.TryGetValue(name, out var amount) ? amount : 0;
        private void Refresh()
        {
            for (int i = 0; i < categories.Length; i++)
            {
                var category = categories[i];
                var classes = session.State.Base.Planning?.ResourceClasses.TryGetValue(category, out var names) == true ? names : new string[0];
                string title = category == "supplies" ? "SUPPLY" : category.ToUpperInvariant();
                labels[i].text = title + "  " + classes.Sum(Stock).ToString("0.##") + (classes.Length > 1 ? "    " + string.Join("  /  ", classes.Select(c => c + " " + Stock(c).ToString("0.##"))) : "");
                labels[i].color = category == "supplies" ? new Color(.95f, .8f, .48f) : category == "materials" ? new Color(.65f, .8f, .95f) : new Color(.65f, .9f, .7f);
            }
        }
        private void Tick(long _) => Refresh();
        private void OnDestroy() { if (session != null) { session.TickCommitted -= Tick; session.ConstructionChanged -= Refresh; } }
    }
}
