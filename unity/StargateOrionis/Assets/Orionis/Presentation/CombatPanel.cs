using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class CombatPanel : MonoBehaviour
    {
        private CampaignSession session;
        private Text summary, status;
        private bool playing;
        private float elapsed;
        private CombatSnapshot previous;
        public void Bind(CampaignSession value)
        {
            session = value;
            gameObject.AddComponent<Image>().color = new Color(.07f, .12f, .16f);
            summary = PrototypeUi.Label(PrototypeUi.Rect("Combat health", transform, new Vector2(0, .35f), Vector2.one), "", 18);
            playing=true;elapsed=0;
            PrototypeUi.Button("Disengage combat", transform, new Vector2(0, .04f), new Vector2(1, .18f), "Disengage / ends encounter (1 tick)", new Color(.16f, .24f, .3f), () => Run(session.DisengageCombat));
            status = PrototypeUi.Label(PrototypeUi.Rect("Combat status", transform, Vector2.zero, new Vector2(1, .05f)), "", 12);
            status.rectTransform.offsetMin = new Vector2(4, 0); status.rectTransform.offsetMax = new Vector2(-4, 0);
            session.CombatChanged += Refresh; Refresh();
        }
        private void Update()
        {
            if (summary != null) summary.color = Color.Lerp(summary.color, Color.white, Time.unscaledDeltaTime * 4);
            if (!playing || MissionCombat.Active(session.State) == null) return;
            elapsed += Time.unscaledDeltaTime;
            if (elapsed < .75f) return;
            elapsed = 0; Run(session.AdvanceCombatRound);
        }
        private void Refresh()
        {
            var s = session.State; var battle = MissionCombat.Active(s); if (battle == null) return;
            var view = MissionCombat.Inspect(s); var encounter = s.Base.Combat.Encounters.Single(i => i.Id == battle.IncidentId);
            summary.text = "COMBAT / " + s.Base.Mission.Travel.Stages.Single(stage => stage.Id == encounter.StageId).Name + " / round " + battle.Rounds + "\nOne tick commits when the encounter ends.\n\n" +
                string.Join("\n", s.Expedition.Party.Select(u => s.Base.Units.Single(p => p.Id == u.UnitId).Name + ": " + view.PartyHealth[u.UnitId] + " HP" + (view.PartyHealth[u.UnitId] == 0 ? " / DOWN" : ""))) +
                "\n\n" + string.Join("\n", encounter.Participants.Select(p => p.Label + ": " + view.GuardHealth[p.Id] + " HP" + (view.GuardHealth[p.Id] == 0 ? " / DOWN" : "")));
            if (previous != null)
            {
                var partyDamage = previous.PartyHealth.Sum(p => p.Value - view.PartyHealth[p.Key]);
                var hostileDamage = previous.GuardHealth.Sum(p => p.Value - view.GuardHealth[p.Key]);
                summary.text += "\n\nLast round: guards -" + hostileDamage + " HP / team -" + partyDamage + " HP";
                summary.color = new Color(1, .72f, .5f);
            }
            previous = view;
        }
        private void Run(Action action) { try { action(); } catch (Exception e) { playing = false; status.text = e.Message; } }
        private void OnDestroy() { if (session != null) session.CombatChanged -= Refresh; }
    }
}
