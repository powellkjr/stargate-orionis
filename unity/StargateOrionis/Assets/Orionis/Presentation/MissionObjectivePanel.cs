using System.Linq;
using Orionis.Domain;
using UnityEngine;

namespace Orionis.Presentation
{
    public sealed class MissionObjectivePanel : MonoBehaviour
    {
        public void Bind(CampaignState state)
        {
            var field = state.Expedition?.Travel?.Field;
            if (field == null) return;
            var objectives = state.Base.Mission.Travel.Field.Objectives
                .Where(o => field.Objectives[o.Id] != "HIDDEN")
                .Select(o => (field.Objectives[o.Id] == "COMPLETED" ? "[x] " : "[ ] ") +
                    o.Text + " / " + field.Objectives[o.Id]);
            PrototypeUi.ScrollLabel("Visible mission objectives", transform, Vector2.zero, Vector2.one,
                "MISSION OBJECTIVES\n" + string.Join("\n", objectives), 16);
        }
    }
}
