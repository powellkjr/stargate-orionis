import test from 'node:test';
import assert from 'node:assert/strict';
import { assetBrowserCatalog, stagedFiles, project } from './room-art-lab.mjs';
import { buildSnapshot } from './bootstrap-snapshot.mjs';
import { starterAssignments } from './room-art-starter-assets.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('isolated lab stages every canonical room and exact authored geometry/join/tier values', () => {
  const files = stagedFiles();
  const catalog = JSON.parse(files.get('Assets/RoomArtLab/Editor/Generated/room-catalog.json'));
  const snapshot = buildSnapshot();
  assert.deepEqual(catalog.rooms.map(r => r.id), snapshot.roomDefinitions.map(r => r.id));
  for (const room of catalog.rooms) {
    const plan = snapshot.roomPlanning.rooms.find(p => p.id === room.id);
    assert.deepEqual(room.joinLayouts, plan.joinLayouts);
    assert.equal(room.joinGroup, plan.joinGroup);
    assert.deepEqual(room.tiers, plan.tiers.map(t => t.tier));
    const definition = snapshot.roomDefinitions.find(d => d.id === room.id);
    assert.equal(room.width, definition.width); assert.equal(room.height, definition.height);
  }
  for (const [relative, content] of files) assert.equal(readFileSync(resolve(project, relative), 'utf8'), content, 'staging is current: ' + relative);
});

test('starter art populates every base and mission room with valid non-disabled candidates and exact mission cells', () => {
  const catalog = assetBrowserCatalog();
  const starters = starterAssignments(catalog);
  for (const target of catalog.targets) assert(starters.assignments.some(a => a.roomId === target.id), target.id);
  for (const entry of starters.assignments) assert(catalog.assets.some(a => a.id === entry.assetId && !a.disabled), entry.assetId);
  assert.equal(new Set(starters.assignments.map(a => a.roomId + '|' + a.assetId)).size, starters.assignments.length);
  const inventory = JSON.parse(readFileSync(new URL('../../docs/room-asset-inventory.json', import.meta.url)));
  for (const mission of inventory.missions) {
    const source = JSON.parse(readFileSync(new URL('../../' + mission.source, import.meta.url)));
    for (const stage of source.stages) {
      const target = catalog.targets.find(t => t.id.endsWith(':' + stage.stageId));
      const minX = Math.min(...stage.cells.map(c => c.x)), minY = Math.min(...stage.cells.map(c => c.y));
      assert.deepEqual(target.cells, stage.cells.map(c => ({ x: c.x - minX, y: c.y - minY })));
    }
  }
});

test('asset browser preserves audited source identities, disabled sprite status and every base/mission assignment target', () => {
  const inventory = JSON.parse(readFileSync(new URL('../../docs/room-asset-inventory.json', import.meta.url)));
  const browser = assetBrowserCatalog();
  assert.equal(browser.assets.length, inventory.assets.reduce((count, group) => count + group.sources.length, 0) + inventory.sprites.length);
  assert.equal(new Set(browser.assets.map(a => a.id)).size, browser.assets.length);
  for (const asset of browser.assets) assert(existsSync(new URL('../../' + asset.path, import.meta.url)), asset.path);
  for (const sprite of inventory.sprites) {
    const projected = browser.assets.find(a => a.id === 'sprite:' + sprite.key);
    assert.equal(projected.disabled, sprite.disabled); assert.equal(projected.path, sprite.path);
  }
  for (const room of inventory.baseRooms) assert(browser.targets.some(t => t.id === 'base:' + room.id));
  assert.equal(browser.targets.filter(t => t.id.startsWith('mission:')).length, 16);
  for (const mission of inventory.missions) for (const stage of mission.stages)
    assert(browser.targets.some(t => t.id.endsWith(':' + stage.stageId)), stage.stageId);
  assert.equal(new Set(browser.targets.map(t => t.id)).size, browser.targets.length);
});
