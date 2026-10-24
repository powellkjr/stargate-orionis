import test from 'node:test';
import assert from 'node:assert/strict';
import {layerPieces,layerPixelAllowed,roomLayerPrompt,layerName} from '../shared/sprites/room-layer-contract.mjs';
import {resolveKitLayout,rectangleCells} from './room-kit-layout.mjs';
import {RoomLayerStudy} from './room-layer-study.mjs';

test('structural masks exclude furniture, channels and the door passage for every role',()=>{
 for(const piece of layerPieces)for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const wall=layerPixelAllowed('structure',piece,x+.5,y+.5),furniture=layerPixelAllowed('furniture',piece,x+.5,y+.5);
  assert(!(wall&&furniture));
  if(piece==='edge-door'&&x>=48&&x<80&&y<32)assert(!wall&&!furniture);
  if(y>=4&&y<9)assert(!wall);
  if(piece==='corner'&&x>=4&&x<9)assert(!wall);
 }
 assert(layerPixelAllowed('structure','corner',31,1));
 assert(layerPixelAllowed('structure','corner',1,31));
 assert(!layerPixelAllowed('structure','corner',16,16));
});

test('same 2×2 structure supports independent furniture families and visibility',()=>{
 const cells=rectangleCells(2,2),{modules}=resolveKitLayout(cells),before=JSON.stringify(modules);
 const study=new RoomLayerStudy();
 for(const piece of layerPieces){
  study.sources.structure[layerName('structure',piece,'v01')]=`walls/${piece}.png`;
  study.sources.furniture[layerName('furniture',piece,'v02')]=`furniture/${piece}.png`;
 }
 const both=study.render(modules,{wallFamily:'v01',furnitureFamily:'v02',showFurniture:true});
 assert(both.includes('data-room-layer="structure"')&&both.includes('data-room-layer="furniture"'));
 assert(!both.includes('data-layer-placeholder'));
 const hidden=study.render(modules,{wallFamily:'v01',furnitureFamily:'v02',showFurniture:false});
 assert(!hidden.includes('furniture/'));
 assert.equal(JSON.stringify(modules),before);
});

test('each layer prompt starts and finishes with the exact downloadable filename requirement',()=>{
 for(const layer of ['structure','furniture'])for(const family of ['v01','v02','v03'])for(const piece of layerPieces){
  const text=roomLayerPrompt(layer,piece,family).trim(),lines=text.split('\n');
  assert.equal(lines[0],lines.at(-1));
  assert(lines[0].includes('CLICKABLE DOWNLOAD LINK')&&lines[0].includes(layerName(layer,piece,family)));
 }
});
