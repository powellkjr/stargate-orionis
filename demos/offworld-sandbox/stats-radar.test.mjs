import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {statsRadar} from '../shared/portraits/stats-radar.mjs';
test('radar normalizes existing stat ranges and preserves raw values accessibly',()=>{
  const unit={perception:5,stamina:50,endurance:5},before=structuredClone(unit),html=statsRadar(unit);
  assert.match(html,/PER 5\/10 · STA 50\/100 · END 5\/10/);
  assert.match(html,/points="100.00,57.00 122.52,96.00 77.48,96.00"/);
  assert.deepEqual(unit,before);assert(!html.includes('<input'));
});
test('radar tolerates missing and out-of-range values without invalid SVG coordinates',()=>{
  for(const unit of [{},{perception:NaN,stamina:Infinity,endurance:-4},{perception:30,stamina:300,endurance:30}]){
    const html=statsRadar(unit);assert(!html.includes('NaN'));assert(!html.includes('Infinity'));
  }
});
test('deployment stats are read-only and active-party cards use the shared radar',()=>{
  const setup=readFileSync(new URL('./setup.mjs',import.meta.url),'utf8');
  assert(setup.includes('statsRadar(u)'));assert(!setup.includes("['perception','PER'"));
  const map=readFileSync(new URL('./map.mjs',import.meta.url),'utf8');assert(map.includes('statsRadar(u)'));
});