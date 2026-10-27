using System;
using System.Linq;
using NUnit.Framework;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Orionis.RoomArtLab.Tests
{
    public sealed class RoomArtLabTests
    {
        private static RoomArtDefinition Joinable() => RoomArtCatalog.Load().rooms.First(r => !string.IsNullOrEmpty(r.joinGroup) && r.joinLayouts.Contains("2x2") && r.joinLayouts.Contains("1x2"));
        [Test] public void CatalogIncludesEveryProjectedRoomWithDataDerivedSpecialFootprintsAndTiers()
        {
            var catalog = RoomArtCatalog.Load();
            Assert.That(catalog.rooms.Length, Is.GreaterThan(20));
            foreach (var room in catalog.rooms) {
                var single = RoomArtLayouts.For(room)[0];
                Assert.That(single.Width, Is.EqualTo(room.width)); Assert.That(single.Height, Is.EqualTo(room.height));
                Assert.That(single.Joined, Is.False); Assert.That(room.tiers, Is.Not.Empty);
                if (string.IsNullOrEmpty(room.joinGroup)) Assert.That(RoomArtLayouts.For(room).Count, Is.EqualTo(1));
            }
            Assert.That(catalog.rooms.Any(r => r.width == 3 && r.height == 3), Is.True);
        }
        [Test] public void LayoutsUseActualSharedJoinRuleAndRejectLongOrLShapes()
        {
            var room = Joinable(); var layouts = RoomArtLayouts.For(room);
            Assert.That(layouts.Select(l => (l.Width, l.Height)), Is.EquivalentTo(new[] { (1, 1), (2, 1), (1, 2), (2, 2) }));
            Assert.That(RoomArtLayouts.Blocker(room, RoomArtLayouts.Cells(3, 1), room.tiers[0]), Is.Not.Null);
            Assert.That(RoomArtLayouts.Blocker(room, new[] { Vector2Int.zero, Vector2Int.right, Vector2Int.up }, room.tiers[0]), Is.Not.Null);
            Assert.That(RoomArtLayouts.Blocker(room, RoomArtLayouts.Cells(2, 2), 99), Is.Not.Null);
            var special = RoomArtCatalog.Load().rooms.First(r => r.width > 1);
            Assert.That(RoomArtLayouts.Blocker(special, RoomArtLayouts.Cells(2, 1), special.tiers[0]), Is.Not.Null);
        }
        [TestCase(0)] [TestCase(1)] [TestCase(2)] [TestCase(3)] [TestCase(4)] [TestCase(5)] [TestCase(6)] [TestCase(7)]
        [TestCase(8)] [TestCase(9)] [TestCase(10)] [TestCase(11)] [TestCase(12)] [TestCase(13)] [TestCase(14)] [TestCase(15)]
        public void AllSingleCellDoorCombinationsReplaceOnlyTheirCenteredSegment(int mask)
        {
            var cells = RoomArtLayouts.Cells(1, 1); var edges = RoomArtTopology.Exterior(cells);
            var doors = edges.Where(e => (mask & (1 << (int)e.Side)) != 0).ToArray();
            var modules = RoomArtTopology.Build(cells, doors);
            Assert.That(modules.Count(m => m.Role == RoomArtRole.Junction), Is.EqualTo(4));
            Assert.That(modules.Count(m => m.Role == RoomArtRole.Straight), Is.EqualTo(12 - doors.Length));
            Assert.That(modules.Count(m => m.Role == RoomArtRole.StraightDoor), Is.EqualTo(doors.Length));
            foreach (var d in modules.Where(m => m.Role == RoomArtRole.StraightDoor)) {
                Assert.That(d.Segment, Is.EqualTo(1));
                Assert.That(d.Side == RoomArtSide.North || d.Side == RoomArtSide.South ? d.Position.x : d.Position.z, Is.EqualTo(2));
            }
        }
        [TestCase(2, 1, 6, 6)] [TestCase(1, 2, 6, 6)] [TestCase(2, 2, 8, 8)] [TestCase(3, 3, 12, 12)]
        public void JoinedAndSpecialPerimetersHaveNoInternalWallOrInteriorPost(int width, int height, int edges, int junctions)
        {
            var cells = RoomArtLayouts.Cells(width, height); var exterior = RoomArtTopology.Exterior(cells);
            var modules = RoomArtTopology.Build(cells, Array.Empty<RoomArtEdge>());
            Assert.That(exterior.Count, Is.EqualTo(edges));
            Assert.That(modules.Count(m => m.Role == RoomArtRole.Straight), Is.EqualTo(edges * 3));
            Assert.That(modules.Count(m => m.Role == RoomArtRole.Junction), Is.EqualTo(junctions));
            foreach (var m in modules.Where(m => m.Side.HasValue)) Assert.That(exterior, Does.Contain(new RoomArtEdge(m.Cell, m.Side.Value)));
            foreach (var m in modules.Where(m => m.Role == RoomArtRole.Junction))
                Assert.That(m.Position.x == 0 || m.Position.x == width * 4 || m.Position.z == 0 || m.Position.z == height * 4, Is.True);
            foreach (var edge in exterior) Assert.DoesNotThrow(() => RoomArtTopology.Build(cells, new[] { edge }));
        }
        [Test] public void InternalAndOutsideDoorsAreRejected()
        {
            var cells = RoomArtLayouts.Cells(2, 2);
            Assert.Throws<ArgumentException>(() => RoomArtTopology.Build(cells, new[] { new RoomArtEdge(Vector2Int.zero, RoomArtSide.East) }));
            Assert.Throws<ArgumentException>(() => RoomArtTopology.Build(cells, new[] { new RoomArtEdge(new Vector2Int(9, 9), RoomArtSide.North) }));
        }
        [Test] public void ComparisonMatchesRequestedBoardAndKeepsEveryGroupPerimeterSeparate()
        {
            var room = Joinable(); var groups = RoomArtComparison.Groups(room, room.tiers[0]);
            Assert.That(groups.Select(g => g.Label), Is.EqualTo(new[] { "A", "B", "C", "D" }));
            string Row(int y) => string.Concat(Enumerable.Range(0, 3).Select(x => groups.Single(g => g.Cells.Contains(new Vector2Int(x, y))).Label));
            Assert.That(new[] { Row(2), Row(1), Row(0) }, Is.EqualTo(new[] { "AAB", "AAB", "CCD" }));
            var doors = groups.Select(g => new RoomArtEdge(g.Origin, RoomArtSide.South)).ToArray();
            var modules = RoomArtComparison.Build(groups, doors);
            Assert.That(modules.Count(m => m.Role == RoomArtRole.Floor), Is.EqualTo(9));
            Assert.That(modules.Count(m => m.Role == RoomArtRole.StraightDoor), Is.EqualTo(4));
            Assert.That(modules.Count(m => m.Role == RoomArtRole.DoorLeaf), Is.EqualTo(8));
            foreach (var group in groups) {
                var original = RoomArtTopology.Build(RoomArtLayouts.Cells(group.Layout.Width, group.Layout.Height),
                    new[] { new RoomArtEdge(Vector2Int.zero, RoomArtSide.South) });
                var displayed = modules.Where(m => m.Group == group.Label).ToArray();
                Assert.That(displayed.Length, Is.EqualTo(original.Count));
                for (int i = 0; i < original.Count; i++) {
                    Assert.That(Vector3.Distance(displayed[i].Position - group.Offset, original[i].Position), Is.LessThan(.00001f));
                    Assert.That(displayed[i].Role, Is.EqualTo(original[i].Role));
                }
            }
            Assert.Throws<ArgumentException>(() => RoomArtComparison.Build(groups,
                new[] { new RoomArtEdge(new Vector2Int(0, 1), RoomArtSide.East) }));
        }
        [Test] public void ComparisonDoesNotInventUnsupportedJoinsOrSpecialRoomGroups()
        {
            var special = RoomArtCatalog.Load().rooms.First(r => r.width == 3);
            Assert.That(RoomArtComparison.Available(special), Is.False);
            Assert.That(RoomArtComparison.Groups(special, special.tiers[0]), Is.Empty);
            var room = Joinable();
            var pairOnly = new RoomArtDefinition { width = 1, height = 1, joinGroup = room.joinGroup,
                tiers = room.tiers, joinLayouts = new[] { "1x2" } };
            Assert.That(RoomArtComparison.Groups(pairOnly, pairOnly.tiers[0]).Select(g => g.Label), Is.EqualTo(new[] { "B", "C", "D" }));
        }
        [TestCase(RoomArtSide.North)] [TestCase(RoomArtSide.East)] [TestCase(RoomArtSide.South)] [TestCase(RoomArtSide.West)]
        public void DoorLeavesMeetInCenterAndSlideSidewaysUntilTheOpeningIsClear(RoomArtSide side)
        {
            var modules = RoomArtTopology.Build(RoomArtLayouts.Cells(1, 1), new[] { new RoomArtEdge(Vector2Int.zero, side) });
            var leaves = modules.Where(m => m.Role == RoomArtRole.DoorLeaf).ToArray();
            Assert.That(leaves.Length, Is.EqualTo(2));
            var center = (leaves[0].Position + leaves[1].Position) / 2;
            var tangent = leaves[0].Rotation * Vector3.right;
            float leafWidth = leaves[0].Size.x;
            foreach (float amount in new[] { 0f, .5f, 1f }) {
                float left = Vector3.Dot(leaves[0].PositionAt(amount) - center, tangent);
                float right = Vector3.Dot(leaves[1].PositionAt(amount) - center, tangent);
                Assert.That(left, Is.EqualTo(-right).Within(.00001f));
                Assert.That(leaves.All(l => Mathf.Abs(l.PositionAt(amount).y - .85f) < .00001f), Is.True);
                Assert.That(right - left - leafWidth, Is.EqualTo(2 * amount * (leafWidth + .02f)).Within(.00001f));
                if (amount == 1) Assert.That(right - leafWidth / 2, Is.GreaterThan(leafWidth));
            }
        }
        [TestCase(1, 1, 8)] [TestCase(2, 2, 12)] [TestCase(3, 1, 16)]
        public void TierFixturesMatchSimulatorRunsAndStayWithinTheNeutralChannel(int tier, int count, int coverage)
        {
            var runs = RoomArtTierLights.Runs(tier); float s = RoomArtTierLights.Scale;
            Assert.That(runs.Length, Is.EqualTo(count));
            Assert.That(runs.Sum(r => r.y), Is.EqualTo(coverage * s).Within(.00001f));
            Assert.That(runs.Sum(r => r.x), Is.EqualTo(0).Within(.00001f));
            foreach (var run in runs)
                Assert.That(Mathf.Abs(run.x) + (run.y + 2.4f * s) / 2, Is.LessThan(12 * s));
            if (tier == 2) Assert.That(runs[0].x + (runs[0].y + 2.4f * s) / 2,
                Is.LessThan(runs[1].x - (runs[1].y + 2.4f * s) / 2));
        }
        [Test] public void FixturesFollowEachComparisonPerimeterAndExcludeDoorsAndInternalJoins()
        {
            var room = Joinable(); var groups = RoomArtComparison.Groups(room, room.tiers[0]);
            var doors = groups.Select(g => new RoomArtEdge(g.Origin, RoomArtSide.South)).ToArray();
            var modules = RoomArtComparison.Build(groups, doors);
            var fixtures = modules.Where(m => RoomArtTierLights.HasFixture(m, modules)).ToArray();
            Assert.That(fixtures.Length, Is.EqualTo(RoomArtComparison.Edges(groups).Count - doors.Length));
            foreach (var fixture in fixtures) {
                Assert.That(doors.Contains(new RoomArtEdge(fixture.Cell, fixture.Side.Value)), Is.False);
                var group = groups.Single(g => g.Label == fixture.Group);
                Assert.That(RoomArtTopology.Exterior(group.Cells), Does.Contain(new RoomArtEdge(fixture.Cell, fixture.Side.Value)));
            }
            var allDoors = RoomArtComparison.Build(groups, RoomArtComparison.Edges(groups));
            Assert.That(allDoors.Any(m => RoomArtTierLights.HasFixture(m, allDoors)), Is.False);
        }
        [Test] public void TierChangesReuseStructureAndPreviewNeverDirtiesActiveScene()
        {
            var active = SceneManager.GetActiveScene(); bool dirty = active.isDirty;
            int count = active.GetRootGameObjects().Length;
            int previews = EditorSceneManager.previewSceneCount;
            var room = Joinable(); var groups = RoomArtComparison.Groups(room, room.tiers[0]);
            var modules = RoomArtComparison.Build(groups, groups.Select(g => new RoomArtEdge(g.Origin, RoomArtSide.South)));
            var existingRoots = Resources.FindObjectsOfTypeAll<GameObject>();
            using (var preview = new RoomArtPreview()) {
                preview.Groups = groups;
                for (int tier = 1; tier <= 3; tier++) {
                    preview.Rebuild(modules, tier);
                    Assert.That(SceneManager.GetActiveScene(), Is.EqualTo(active));
                    Assert.That(active.isDirty, Is.EqualTo(dirty));
                    Assert.That(active.GetRootGameObjects().Length, Is.EqualTo(count));
                    var roots = Resources.FindObjectsOfTypeAll<GameObject>().Where(g => g.name == "Disposable Room Art Preview" && !existingRoots.Contains(g)).ToArray();
                    var rendered = roots.SelectMany(g => g.GetComponentsInChildren<Renderer>()).ToArray();
                    int lamps = modules.Count(m => RoomArtTierLights.HasFixture(m, modules)) * RoomArtTierLights.Runs(tier).Length;
                    Assert.That(rendered.Count(r => r.name == "CT lamp core"), Is.EqualTo(lamps));
                    foreach (var r in rendered.Where(r => r.name == "CT lamp color")) {
                        Assert.That(r.sharedMaterial.GetColor("_EmissionColor"), Is.EqualTo(RoomArtTierLights.Color(tier).linear));
                        Assert.That(r.sharedMaterial.IsKeywordEnabled("_EMISSION"), Is.True);
                        Assert.That(r.transform.position.y, Is.GreaterThan(RoomArtTopology.WallHeight));
                    }
                }
                preview.TierLights = false; preview.Rebuild(modules, 2);
                Assert.That(Resources.FindObjectsOfTypeAll<GameObject>().Where(g => g.name == "Disposable Room Art Preview" && !existingRoots.Contains(g))
                    .SelectMany(g => g.GetComponentsInChildren<Renderer>()).Any(r => r.name == "CT lamp core"), Is.False);
            }
            Assert.That(EditorSceneManager.previewSceneCount, Is.EqualTo(previews));
        }
    }
}
