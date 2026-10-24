using System;

namespace Orionis.Application
{
    // Real-time pacing is presentation policy; only committed integer ticks are campaign time.
    public sealed class CampaignClockController
    {
        private readonly CampaignSession session;
        private readonly double secondsPerTick;
        private double pendingSeconds;
        private bool wasOffworld;
        public bool Paused { get; private set; } = true;
        public static readonly System.Collections.Generic.IReadOnlyList<int> Speeds = System.Array.AsReadOnly(new[] { 1, 4, 8, 16 });
        public int Speed { get; private set; } = 1;
        public void CycleSpeed() { SetSpeed(Speeds[(System.Linq.Enumerable.ToList(Speeds).IndexOf(Speed) + 1) % Speeds.Count]); }
        public CampaignClockController(CampaignSession session, double secondsPerTick = 3)
        {
            if (double.IsNaN(secondsPerTick) || double.IsInfinity(secondsPerTick) || secondsPerTick <= 0)
                throw new ArgumentOutOfRangeException(nameof(secondsPerTick));
            this.session = session; this.secondsPerTick = secondsPerTick;
        }
        public void SetPaused(bool paused)
        {
            if (!paused && session.State.Expedition != null && !session.State.Expedition.Returned) throw new InvalidOperationException("Base playback is unavailable while the team is offworld.");
            Paused = paused;
        }
        public void SetSpeed(int speed)
        {
            if (!System.Linq.Enumerable.Contains(Speeds, speed)) throw new ArgumentOutOfRangeException(nameof(speed));
            if (session.State.Expedition != null && !session.State.Expedition.Returned) throw new InvalidOperationException("Base speed controls are unavailable while the team is offworld.");
            Speed = speed;
        }
        public void Step()
        {
            if (!Paused) throw new InvalidOperationException("Pause the clock before advancing one tick manually.");
            session.AdvanceOneTick();
        }
        public void Update(double elapsedRealSeconds)
        {
            if (double.IsNaN(elapsedRealSeconds) || double.IsInfinity(elapsedRealSeconds) || elapsedRealSeconds < 0)
                throw new ArgumentOutOfRangeException(nameof(elapsedRealSeconds));
            if (session.State.Expedition != null && !session.State.Expedition.Returned) { wasOffworld = true; Paused = true; pendingSeconds = 0; return; }
            if (wasOffworld) { wasOffworld = false; Paused = false; }
            if (Paused) return;
            var accumulated = pendingSeconds + elapsedRealSeconds * Speed;
            if (double.IsInfinity(accumulated)) throw new ArgumentOutOfRangeException(nameof(elapsedRealSeconds));
            pendingSeconds = accumulated;
            while (!Paused && pendingSeconds >= secondsPerTick)
            {
                session.AdvanceOneTick();
                pendingSeconds -= secondsPerTick;
            }
        }
    }
}
