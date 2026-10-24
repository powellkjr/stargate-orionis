using System;
using System.IO;
using NUnit.Framework;
using Orionis.Application;
using Orionis.Domain;
using Orionis.Infrastructure;

namespace Orionis.Tests
{
    public sealed class CampaignClockTests
    {
        private CampaignSession Create()
        {
            var json = File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
            return new CampaignSession(new CampaignState(BootstrapReader.Read(json), new RandomState(1, 1)), null);
        }
        [Test] public void TwelveCommittedTicksAdvanceExactlyThirtySixMinutes()
        {
            var session = Create(); var data = session.State.Base; var random = session.State.Random;
            for (int i = 0; i < 12; i++) session.AdvanceOneTick();
            Assert.That(session.State.Clock.ElapsedTicks, Is.EqualTo(12));
            Assert.That(session.State.Clock.ElapsedMinutes, Is.EqualTo(36));
            Assert.That(CampaignTiming.GateConnectionTicks * CampaignTiming.MinutesPerTick, Is.EqualTo(36));
            Assert.That(CampaignTiming.MovementTicks, Is.EqualTo(1));
            Assert.That(CampaignTiming.CombatEncounterTicks, Is.EqualTo(1));
            Assert.That(session.State.Base, Is.SameAs(data));
            Assert.That(session.State.Random, Is.SameAs(random));
        }
        [Test] public void EachTickPublishesAfterCommitAndRejectsRecursiveAdvancement()
        {
            var session = Create(); int events = 0;
            session.TickCommitted += tick =>
            {
                events++;
                Assert.That(session.State.Clock.ElapsedTicks, Is.EqualTo(tick));
                Assert.Throws<InvalidOperationException>(() => session.AdvanceOneTick());
            };
            session.AdvanceOneTick(); session.AdvanceOneTick();
            Assert.That(events, Is.EqualTo(2));
            Assert.That(session.State.Clock.ElapsedMinutes, Is.EqualTo(6));
        }
        [Test] public void ClockRejectsNegativeStateAndOverflowBeforeCommit()
        {
            Assert.Throws<ArgumentOutOfRangeException>(() => new CampaignClock(-1));
            Assert.Throws<ArgumentOutOfRangeException>(() => new CampaignClock(CampaignClock.MaximumTicks + 1));
            var initial = Create().State;
            var session = new CampaignSession(new CampaignState(initial.Base, initial.Random,
                new CampaignClock(CampaignClock.MaximumTicks)), null);
            var current = session.State;
            Assert.Throws<ArgumentOutOfRangeException>(() => session.AdvanceOneTick());
            Assert.That(session.State, Is.SameAs(current));
        }
        [Test] public void PausedClockDoesNotAdvanceAndStepCommitsExactlyOneTick()
        {
            var session = Create(); var controller = new CampaignClockController(session);
            controller.Update(100); Assert.That(session.State.Clock.ElapsedTicks, Is.Zero);
            controller.Step(); Assert.That(session.State.Clock.ElapsedMinutes, Is.EqualTo(3));
            controller.SetPaused(false);
            Assert.Throws<InvalidOperationException>(() => controller.Step());
            Assert.That(session.State.Clock.ElapsedTicks, Is.EqualTo(1));
        }
        [TestCase(4),TestCase(8),TestCase(16)] public void FramePartitionAndPlaybackSpeedDoNotChangeMinutesPerTick(int speed)
        {
            var a = Create(); var b = Create();
            var one = new CampaignClockController(a); var split = new CampaignClockController(b);
            one.SetPaused(false); split.SetPaused(false);
            one.Update(3); for (int i = 0; i < 12; i++) split.Update(.25);
            Assert.That(a.State.Clock.ElapsedTicks, Is.EqualTo(b.State.Clock.ElapsedTicks));
            split.SetSpeed(speed); split.Update(3d/speed);
            Assert.That(b.State.Clock.ElapsedTicks, Is.EqualTo(2));
            Assert.That(b.State.Clock.ElapsedMinutes, Is.EqualTo(6));
        }
        [Test] public void PausePreservesOnlyUncommittedPlaybackFraction()
        {
            var session = Create(); var controller = new CampaignClockController(session);
            controller.SetPaused(false); controller.Update(7.5);
            Assert.That(session.State.Clock.ElapsedTicks, Is.EqualTo(2));
            controller.SetPaused(true); controller.Update(500);
            controller.SetPaused(false); controller.Update(1.5);
            Assert.That(session.State.Clock.ElapsedTicks, Is.EqualTo(3));
        }
        [Test] public void ReturningToBaseResumesPlaybackAfterOffworldActions()
        {
            var session = Create(); var controller = new CampaignClockController(session);
            controller.SetPaused(false); session.Deploy(new[] { "unit-6" }); session.ChooseGate(false);
            controller.Update(100); Assert.That(controller.Paused, Is.True);
            session.RedialGate(); session.ExtractMission(); var tick = session.State.Clock.ElapsedTicks;
            controller.Update(3);
            Assert.That(controller.Paused, Is.False); Assert.That(session.State.Clock.ElapsedTicks, Is.EqualTo(tick + 1));
        }
        [Test] public void InvalidPlaybackInputNeverChangesClock()
        {
            var session = Create(); var controller = new CampaignClockController(session);
            controller.SetPaused(false);
            Assert.Throws<ArgumentOutOfRangeException>(() => controller.Update(double.NaN));
            Assert.Throws<ArgumentOutOfRangeException>(() => controller.Update(double.PositiveInfinity));
            Assert.Throws<ArgumentOutOfRangeException>(() => controller.Update(-1));
            Assert.Throws<ArgumentOutOfRangeException>(() => controller.SetSpeed(0));
            Assert.That(session.State.Clock.ElapsedTicks, Is.Zero);
        }
    }
}
