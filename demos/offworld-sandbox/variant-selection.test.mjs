import test from 'node:test';import assert from 'node:assert/strict';
import {createVariantPicker} from '../shared/sprites/variant-selection.mjs';
const v=(key,n,disabled=false)=>({src:`${key}-${n}.png`,sourceId:`batch/${key}__v0${n}__source.png`,disabled});
test('prepared Door/Gate states stay paired by their independent prepared identity',()=>{
 const active={};for(const key of ['door','door-open','gate','gate-open'])active[key]={variants:[{src:key+'.png',sourceId:`sprite-prepared/batch/v01/${key}.png`}]};
 const pick=createVariantPicker(active,'prepared');
 for(const key of Object.keys(active))assert.equal(pick(key,'one')?.src,key+'.png');
 active['door-open'].variants[0].disabled=true;assert.equal(createVariantPicker(active,'prepared')('door','one'),null);
});
test('Each identity has stable seeded variation, rejected variants excluded and families matched',()=>{
 const active={guard:{variants:[v('guard',1),v('guard',2),v('guard',3,true)]},door:{variants:[v('door',1),v('door',2)]},'door-open':{variants:[v('door-open',1),v('door-open',2)]}};
 const before=JSON.stringify(active),pick=createVariantPicker(active,'map-a'),seen=new Set();
 for(let n=0;n<100;n++){const id=`npc-${n}`,chosen=pick('guard',id);seen.add(chosen.src);assert.equal(chosen,pick('guard',id));assert(!chosen.disabled);assert.equal(pick('door',id).src.replace('door','door-open'),pick('door-open',id).src);}
 assert.equal(seen.size,2);assert.equal(JSON.stringify(active),before);assert.equal(pick('unknown','x'),null);
 active['door-open'].variants[0].disabled=true;const paired=createVariantPicker(active,'b');for(let n=0;n<10;n++)assert.equal(paired('door',String(n)).src,'door-2.png');
 assert.notEqual([...Array(30)].map((_,i)=>pick('guard',String(i)).src).join(),[...Array(30)].map((_,i)=>createVariantPicker(active,'map-b')('guard',String(i)).src).join());
});
