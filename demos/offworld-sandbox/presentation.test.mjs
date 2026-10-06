import {renderMapSurface,surfaceGeometry,tileSlots} from '../shared/map/renderer.mjs';
import {mapLayout} from './map-layout.mjs';
import {requirementReport,requirementsHtml} from './requirements.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deploymentRoster} from '../shared/offworld/roster.mjs';
import {buildPersonnelRoster} from '../shared/js/personnel-roster.mjs';
import {branches,createTool} from '../shared/offworld/equipment.mjs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,move} from '../shared/offworld/runtime.mjs';
import {renderMap,partyCard} from './map.mjs';
import {layoutActionHexes} from './hex-layout.mjs';
const read=name=>{const data=JSON.parse(readFileSync(new URL(`../shared/data/${name}.json`,import.meta.url)));return name.endsWith('archetypes')?{...data,itemDefinitions:JSON.parse(readFileSync(new URL('../shared/data/item.json',import.meta.url)))}:data;};
const classes=read('base-classes'),names=read('personnel-names'),presets=read('offworld/party-presets');
test('deployment preserves all 54 staffing identities and their exact progression',()=>{
  const original=buildPersonnelRoster(classes,names.pools,Object.fromEntries(Object.entries(branches).map(([id,items])=>[id.toLowerCase(),items])));
  const roster=deploymentRoster(classes,names,presets);assert.equal(roster.units.length,54);assert.equal(new Set(roster.units.map(u=>u.unitId)).size,54);
  roster.units.forEach((u,i)=>{const source=original[i];assert.equal(u.unitId,source.id);assert.equal(u.name,source.name);assert.equal(u.tier,source.baseTier+1);if(source.crossPathId){assert.equal(u.branch.id,source.crossPathId.toUpperCase());assert.equal(u.branch.tier,source.crossPathTier+1);}if(source.specializationId)assert.equal(u.branch.id,source.specializationId);});
  assert.equal(roster.units.filter(u=>u.branch?.kind==='specialization').length,18);assert.equal(roster.units.filter(u=>u.branch?.kind==='cross').length,30);
  assert.deepEqual(roster, deploymentRoster(classes,names,presets));
  assert(partyCard({...roster.units[0],activityState:'IDLE',partyStatus:'ACTIVE_PARTY'}).includes('viewBox="0 0 48 64"'));
});
test('regular hexagons tessellate with shared edges and no interior overlap at multiple zoom scales',()=>{
  for(const radius of [13,22,45]){
    const cells=layoutActionHexes(Array.from({length:16},(_,i)=>({id:i,anchor:{x:100+(i%3)*27,y:100}})),radius);
    let shared=0;
    for(const cell of cells)for(let i=0;i<6;i++)assert(Math.abs(Math.hypot(cell.vertices[i].x-cell.vertices[(i+1)%6].x,cell.vertices[i].y-cell.vertices[(i+1)%6].y)-radius)<1e-8);
    const key=p=>`${p.x.toFixed(6)},${p.y.toFixed(6)}`;
    for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){
      assert(Math.hypot(cells[i].x-cells[j].x,cells[i].y-cells[j].y)>=Math.sqrt(3)*radius-1e-8);
      if(cells[i].vertices.filter(p=>cells[j].vertices.some(v=>key(p)===key(v))).length===2)shared++;
    }
    assert(shared>0,'neighboring hexagons share full edges');
  }
});
test('inactive transitions are smaller, muted and noninteractive; adjacent movement is distinct',()=>{
  const m=compileMission({...read('offworld/missing-operative-001.finalized'),dialogueScenes:[]},read('offworld/archetypes'));
  const s=createRuntime(m,presets.units.slice(0,4),'2026-09-24T14:00:00Z');chooseGate(m,s,true);move(m,s,'door-gate-to-yard');move(m,s,'door-yard-to-mainhall');
  s.transitionStates['door-mainhall-to-security'].state='LOCKED';
  const html=renderMap(m,s);
  assert(html.includes('door-selectable'));assert(html.includes('door-locked'));assert(html.includes('door-inactive'));
  assert(!/class="door door-inactive"[^>]*data-transition=/.test(html));
  assert(!renderMap(m,s,22,false).includes('data-transition="'));
});

test('action debug separates tier, Perception, equipment and local availability',()=>{
  const m=compileMission({...read('offworld/missing-operative-001.finalized'),dialogueScenes:[]},read('offworld/archetypes'));
  const units=structuredClone(presets.units.slice(0,4));const tech=units.find(u=>u.profession==='TECHNICIAN');tech.perception=5;tech.tools=[createTool(tech,0,'TET2',3,m.toolCatalog)];
  const s=createRuntime(m,units,'2026-09-24T14:00:00Z');chooseGate(m,s,true);move(m,s,'door-gate-to-yard');move(m,s,'door-yard-to-mainhall');
  const r=m.indexes.recipes['hack-door-mainhall-to-security'];let row=requirementReport(m,s,r).units.find(u=>u.unitId===tech.unitId);
  assert.equal(row.professionPass,true);assert.equal(row.perceptionPass,false);assert.equal(row.toolPass,true);
  assert.match(requirementsHtml(m,s,r),/PER 5 \/ required 6/);
  const runtimeTech=s.units.find(u=>u.unitId===tech.unitId);runtimeTech.perception=6;runtimeTech.tools[0].chargesRemaining=0;
  row=requirementReport(m,s,r).units.find(u=>u.unitId===tech.unitId);assert.equal(row.perceptionPass,true);assert.equal(row.toolPass,false);
  runtimeTech.tools[0].chargesRemaining=3;runtimeTech.currentStageId=m.gate.stageId;
  row=requirementReport(m,s,r).units.find(u=>u.unitId===tech.unitId);assert.equal(row.local,false);assert.notEqual(row.eligibility.status,'AVAILABLE');
});

test('shared renderer omits interior edges and applies caller padding only to exposed sides',()=>{
  const cells=[{x:0,y:0},{x:1,y:0}],tiles=surfaceGeometry(cells,{cellSize:80,padding:8});
  assert.equal(tiles[0].left+tiles[0].width,80);assert.equal(tiles[1].left,80);assert.equal(tiles.flatMap(t=>t.edges).length,6);
  assert(!tiles.flatMap(t=>t.edges).some(e=>e.x1===80&&e.x2===80));
  assert.match(renderMapSurface(cells),/shared-map-surface/);
  const slots=tileSlots([{x:0,y:0}]);assert.equal(slots.length,16);assert.equal(new Set(slots.map(p=>p.x)).size,4);assert.equal(new Set(slots.map(p=>p.y)).size,4);
});
test('map positions keep party members separate from visible people and objects in every mission Stage',()=>{
  const m=compileMission({...read('offworld/missing-operative-001.finalized'),dialogueScenes:[]},read('offworld/archetypes'));
  const s=createRuntime(m,presets.units.slice(0,4),'2026-09-24T14:00:00Z');
  for(const stage of m.stages){s.currentStageId=stage.stageId;for(const st of Object.values(s.stageStates))st.visibility='HIDDEN';s.stageStates[stage.stageId].visibility='VISIBLE';for(const u of s.units)u.currentStageId=stage.stageId;
    const layout=mapLayout(m,s),points=Object.values(layout.points);
    for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)assert(Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)>=19);
    for(const p of points)assert(stage.cells.some(c=>p.x>c.x*100&&p.x<(c.x+1)*100&&p.y>c.y*100&&p.y<(c.y+1)*100));
  }
});
