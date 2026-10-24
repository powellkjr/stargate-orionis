import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildPersonnelRoster} from '../shared/js/personnel-roster.mjs';
import {branches} from '../shared/offworld/equipment.mjs';
const read=name=>JSON.parse(readFileSync(new URL(`../shared/data/${name}.json`,import.meta.url)));
const classes=read('base-classes'),names=read('personnel-names');
const matrix=Object.fromEntries(Object.entries(branches).map(([key,value])=>[key.toLowerCase(),value]));
test('roster uses distinct authored surnames throughout each profession instead of repeating the first one',()=>{
 const before=JSON.stringify(names),roster=buildPersonnelRoster(classes,names.pools,matrix);
 assert.equal(roster.length,54);
 for(const profession of classes){
  const entries=roster.filter(u=>u.classId===profession.id),pool=names.pools[profession.id];
  const surnames=entries.map(u=>{
   const plain=u.name.replace(/ (Sr\.|V\.)$/,'');
   assert(pool.first.some(first=>plain.startsWith(first+' ')));
   const surname=pool.last.find(last=>plain.endsWith(' '+last));assert(surname);return surname;
  });
  assert.equal(new Set(surnames).size,9);
 }
 assert.equal(JSON.stringify(names),before,'shuffling must not reorder the authored pools');
});
test('name selection replays without using name suffixes as progression markers',()=>{
 const first=buildPersonnelRoster(classes,names.pools,matrix),again=buildPersonnelRoster(classes,names.pools,matrix);
 assert.deepEqual(first,again);
 assert.deepEqual(first.map(u=>u.id),Array.from({length:54},(_,i)=>`unit-${i+1}`));
 assert.equal(new Set(first.map(u=>u.name)).size,54);
 assert.equal(first[0].sortGroup,'base');assert.equal(first[1].sortGroup,'specialization');assert.equal(first[4].sortGroup,'cross');
 assert(first.every(u=>!/(?: Sr\.| V\.)$/.test(u.name)));
});
