using System;

namespace Orionis.Domain
{
    public static class CampaignTiming
    {
        public const int MinutesPerTick = 3;
        public const int MovementTicks = 1;
        public const int CombatEncounterTicks = 1;
        public const int GateConnectionTicks = 12;
    }

    public sealed class CampaignClock
    {
        public const long MaximumTicks = long.MaxValue / CampaignTiming.MinutesPerTick;
        public long ElapsedTicks { get; }
        public long ElapsedMinutes => ElapsedTicks * CampaignTiming.MinutesPerTick;
        public CampaignClock(long elapsedTicks = 0)
        {
            if (elapsedTicks < 0 || elapsedTicks > MaximumTicks)
                throw new ArgumentOutOfRangeException(nameof(elapsedTicks), "Campaign clock is outside its supported range.");
            ElapsedTicks = elapsedTicks;
        }
        public CampaignClock AdvanceOneTick() { return new CampaignClock(checked(ElapsedTicks + 1)); }
    }
}
