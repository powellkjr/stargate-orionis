using System;
using Orionis.Application;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    public sealed class CampaignClockPanel : MonoBehaviour
    {
        private CampaignSession session;
        private CampaignClockController controller;
        private Text label, playLabel, speedLabel;
        private Button step, play, speed;
        public void Bind(CampaignSession value, CampaignClockController playback = null, bool debugControls = true)
        {
            session = value;
            controller = playback ?? new CampaignClockController(session);
            play = PrototypeUi.Button("Pause clock", transform, new Vector2(.01f, .14f), new Vector2(.065f, .86f),
                "Run", new Color(.15f, .23f, .3f), () => { controller.SetPaused(!controller.Paused); Refresh(); });
            playLabel = play.GetComponentInChildren<Text>();
            if (debugControls) step = PrototypeUi.Button("Advance tick", transform, new Vector2(.07f, .14f), new Vector2(.145f, .86f),
                "+1 tick", new Color(.15f, .23f, .3f), () => { controller.Step(); Refresh(); });
            speed = PrototypeUi.Button("Clock speed", transform, new Vector2(debugControls ? .15f : .07f, .14f), new Vector2(debugControls ? .20f : .12f, .86f),
                "1x", new Color(.15f, .23f, .3f), () => { controller.CycleSpeed(); Refresh(); });
            speedLabel = speed.GetComponentInChildren<Text>();
            foreach (var button in new[] { play, step, speed }) if (button != null) button.GetComponentInChildren<Text>().fontSize = 14;
            label = PrototypeUi.Label(PrototypeUi.Rect("Campaign time", transform, new Vector2(.22f, 0), Vector2.one), "", 14);
            label.alignment = TextAnchor.MiddleLeft;
            Refresh();
        }
        private void Update()
        {
            if (controller == null) return;
            try { controller.Update(Time.unscaledDeltaTime); Refresh(); }
            catch (Exception error) { controller.SetPaused(true); label.text = error.Message; enabled = false; Debug.LogException(error, this); }
        }
        private void Refresh()
        {
            var clock = session.State.Clock;
            label.text = $"Elapsed {clock.ElapsedMinutes / 60:00}:{clock.ElapsedMinutes % 60:00}  /  Tick {clock.ElapsedTicks}  /  {(controller.Paused ? "Paused" : "Running")}";
            playLabel.text = controller.Paused ? "Run" : "Pause";
            speedLabel.text = controller.Speed + "x";
            bool offworld = session.State.Expedition != null && !session.State.Expedition.Returned;
            if (step != null) step.interactable = controller.Paused && !offworld;
            play.interactable = speed.interactable = !offworld;
            if (offworld)
            {
                playLabel.text = "Mission";
                label.text = $"Elapsed {clock.ElapsedMinutes / 60:00}:{clock.ElapsedMinutes % 60:00} / Tick {clock.ElapsedTicks} / " +
                    (session.State.Expedition.GateChoicePending ? "Awaiting Gate decision: choose Maintain/Close in Mission briefing." : "Offworld mission actions advance time and base work.");
                label.color = new Color(1, .8f, .48f);
            }
            else label.color = Color.white;
        }
    }
}
