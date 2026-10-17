import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateHeadVariants,headImage,headPlacement} from './head-variants.mjs';
test('head registry maps explicit parts, excludes death and preserves original fallback',()=>{
 const source='main/head.png',characters=[{name:'Man',files:{'0:1':{src:source},'2:0':{src:'parts/Death/head.png'}}}];
 const v={id:'short',label:'Short hair',character:'Man',replacements:{[source]:'Man/short.png'}};
 const wrap=variants=>({format:'character-head-variants-v1',variants});
 assert.equal(validateHeadVariants(wrap([v]),characters).length,1);
 assert.deepEqual(validateHeadVariants(wrap([]),characters),[]);
 assert.throws(()=>validateHeadVariants(wrap([v,v]),characters),/unique/);
 assert.throws(()=>validateHeadVariants(wrap([{...v,replacements:{[source]:'../bad.png'}}]),characters),/relative/);
 assert.throws(()=>validateHeadVariants(wrap([{...v,replacements:{'parts/Death/head.png':'Man/a.png'}}]),characters),/excluded/);
 const base={},replacement={},variant={images:new Map([[source,replacement]])};
 assert.equal(headImage(source,base,variant,'Walk_gun'),replacement);
 assert.equal(headImage('other',base,variant,'Walk_gun'),base);
 assert.equal(headImage(source,base,variant,'Death'),base);
 assert.equal(headImage(source,base,null,'Walk_gun'),base);
});
test('padded head registration preserves the original pivot frame independently of hair extent',()=>{
 const base={width:137,height:146},image={width:265,height:290},file='main/head.png';
 const variant={images:new Map([[file,image]]),registration:{[file]:{sourceSize:[137,146],offset:[64,112]}}};
 const placed=headPlacement(file,base,variant,'Walk_gun');
 assert.equal(placed.image,image);assert.deepEqual(placed.size,[137,146]);assert.deepEqual(placed.offset,[64,112]);
 const original=headPlacement(file,base,variant,'Death');assert.equal(original.image,base);assert.deepEqual(original.offset,[0,0]);
 const characters=[{name:'Man',files:{'0:1':{src:file,width:137,height:146}}}];
 const row={id:'padded',label:'Padded',character:'Man',replacements:{[file]:'Man/a.png'},registration:variant.registration};
 assert.equal(validateHeadVariants({format:'character-head-variants-v1',variants:[row]},characters).length,1);
 assert.throws(()=>validateHeadVariants({format:'character-head-variants-v1',variants:[{...row,registration:{[file]:{sourceSize:[1,1],offset:[64,112]}}}]},characters),/registration/);
});
