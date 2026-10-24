using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    internal static class PrototypeUi
    {
        public static string UnitLabel(Orionis.Domain.UnitSummary unit, Orionis.Domain.MissionDefinition mission)
        {
            var branch = mission == null ? null : System.Linq.Enumerable.FirstOrDefault(mission.Personnel, p => p.UnitId == unit.Id);
            return "Name: " + unit.Name + "\n" + unit.Profession + unit.Tier +
                (branch?.BranchId == null ? "" : "/" + branch.BranchId + branch.BranchTier);
        }
        public static string DeploymentLabel(Orionis.Domain.CampaignState state, string id)
        {
            var unit = System.Linq.Enumerable.Single(state.Base.Units, u => u.Id == id);
            var tools = System.Linq.Enumerable.Select(Orionis.Domain.PersonnelCondition.Tools(state, id), t => t.Label + ": " + t.Charges + " charges" + (t.Damaged ? " (damaged)" : ""));
            return UnitLabel(unit, state.Base.Mission) + "\nHealth " + Orionis.Domain.PersonnelCondition.Health(state, id) +
                " / Stamina " + Orionis.Domain.PersonnelCondition.Stamina(state, id) + "\n" + string.Join(" / ", tools) + "\n" + EquipmentLabel(state, id);
        }
        public static string EquipmentLabel(Orionis.Domain.CampaignState state, string unitId) => EquipmentLabel(Orionis.Domain.UnitEquipment.Loadout(state, unitId));
        public static string EquipmentLabel(System.Collections.Generic.IEnumerable<Orionis.Domain.MissionEquipment> equipment)
        {
            var gear = System.Linq.Enumerable.ToList(equipment);
            var weapon = System.Linq.Enumerable.SingleOrDefault(gear, g => g.Slot == "weapon");
            var armor = System.Linq.Enumerable.SingleOrDefault(gear, g => g.Slot == "armor");
            return "Weapon: " + (weapon == null ? "empty" : weapon.Name + " / " + weapon.Damage + " damage") +
                "\nArmor: " + (armor == null ? "empty" : armor.Name + " / " + armor.Protection + " protection");
        }
        public static RectTransform Rect(string name, Transform parent, Vector2 min, Vector2 max)
        {
            var rect = new GameObject(name, typeof(RectTransform)).GetComponent<RectTransform>();
            rect.SetParent(parent, false);
            rect.anchorMin = min; rect.anchorMax = max;
            rect.offsetMin = Vector2.zero; rect.offsetMax = Vector2.zero;
            return rect;
        }
        public static Text Label(Transform parent, string text, int size = 20)
        {
            var rect = Rect("Label", parent, Vector2.zero, Vector2.one);
            rect.offsetMin = new Vector2(12, 8); rect.offsetMax = new Vector2(-12, -8);
            var label = rect.gameObject.AddComponent<Text>();
            label.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            label.text = text; label.fontSize = size; label.color = Color.white;
            label.alignment = TextAnchor.UpperLeft; label.raycastTarget = false;
            return label;
        }
        public static Text ScrollLabel(string name, Transform parent, Vector2 min, Vector2 max, string text, int size)
        {
            var viewport = Rect(name, parent, min, max);
            viewport.gameObject.AddComponent<Image>().color = new Color(.07f, .1f, .14f);
            viewport.gameObject.AddComponent<RectMask2D>();
            var label = Label(viewport, text, size);
            var content = label.rectTransform;
            content.anchorMin = new Vector2(0, 1); content.anchorMax = Vector2.one;
            content.pivot = new Vector2(.5f, 1);
            content.offsetMin = new Vector2(12, 0); content.offsetMax = new Vector2(-12, -8);
            label.gameObject.AddComponent<ContentSizeFitter>().verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            var scroll = viewport.gameObject.AddComponent<ScrollRect>();
            scroll.viewport = viewport; scroll.content = content; scroll.horizontal = false;
            scroll.movementType = ScrollRect.MovementType.Clamped; scroll.scrollSensitivity = 35;
            return label;
        }
        public static Color ParseColor(string value)
        { return ColorUtility.TryParseHtmlString(value, out var color) ? color : new Color(.2f, .3f, .4f); }
        public static Button Button(string name, Transform parent, Vector2 min, Vector2 max,
            string text, Color color, UnityEngine.Events.UnityAction clicked)
        {
            var rect = Rect(name, parent, min, max);
            rect.offsetMin = new Vector2(2, 2); rect.offsetMax = new Vector2(-2, -2);
            var image = rect.gameObject.AddComponent<Image>(); image.color = color;
            var button = rect.gameObject.AddComponent<Button>(); button.targetGraphic = image;
            // ColorTint multiplies the tint by each authored fill, producing different hues.
            button.transition = Selectable.Transition.None;
            button.onClick.AddListener(clicked);
            var label = Label(rect, text, 18); label.alignment = TextAnchor.MiddleCenter;
            label.rectTransform.offsetMin = new Vector2(4, 2); label.rectTransform.offsetMax = new Vector2(-4, -2);
            return button;
        }
    }
}
