import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {statsRadar,expertise} from '../shared/portraits/stats-radar.mjs';
import {resourceBars} from './map.mjs';
test('radar normalizes existing stat ranges and preserves raw values accessibly',()=>{
  const unit={profession:'TECHNICIAN',tier:3,perception:5,stamina:50,endurance:5},before=structuredClone(unit),html=statsRadar(unit);
  assert.match(html,/PER 5\/10 · EXP 4\/8 · END 5\/10/);
  assert(!html.includes('STA'));
  assert.match(html,/points="100.00,57.00 122.52,96.00 77.48,96.00"/);
  assert.deepEqual(unit,before);assert(!html.includes('<input'));
});

test('expertise includes entered untrained ranks but not absent paths',()=>{
  assert.equal(expertise({}),0);
  assert.equal(expertise({profession:'UNTRAINED',tier:0}),0);
  for(let tier=0;tier<=3;tier++)assert.equal(expertise({profession:'TECHNICIAN',tier}),tier+1);
  for(const kind of ['cross','specialization'])for(let tier=0;tier<=3;tier++)assert.equal(expertise({profession:'TECHNICIAN',tier:3,branch:{kind,tier}}),tier+5);
  assert.equal(expertise({profession:'TECHNICIAN',tier:2}),3);
});

test('health and stamina are separate resource meters with HP first',()=>{
  const unit={health:50,maxHealth:150,stamina:42},before=structuredClone(unit),html=resourceBars(unit);
  assert(html.indexOf('HP 50/150')<html.indexOf('Stamina 42/100'));
  assert.match(html,/width:42%/);assert.match(html,/aria-label="Stamina"/);
  assert.deepEqual(unit,before);
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