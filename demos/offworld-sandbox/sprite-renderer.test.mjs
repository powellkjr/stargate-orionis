import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compileMission} from '../shared/offworld/mission.mjs';
import {createRuntime,chooseGate,move} from '../shared/offworld/runtime.mjs';
import {mapLayout} from './map-layout.mjs';
import {renderMap} from './map.mjs';
import {spriteManifest as manifest} from './sprite-manifest.mjs';
import {spritePresentation,instanceSpriteKey,spriteImage,replaceMissingSprite} from './sprite-renderer.mjs';
const read=p=>JSON.parse(readFileSync(new URL(`../shared/data/${p}.json`,import.meta.url)));
const catalog={...read('offworld/archetypes'),itemDefinitions:read('item')},raw=read('offworld/missing-operative-001.finalized'),presets=read('offworld/party-presets');
function fixture(){const m=compileMission(raw,catalog),s=createRuntime(m,presets.units.slice(0,4),'2026-09-24T14:00:00Z');chooseGate(m,s,true);return {m,s};}
const spriteMap=(m,s)=>renderMap(m,s,22,true,[],spritePresentation);
const controls=html=>[...html.matchAll(/data-(?:stage|npc|recipe|observation|transition|engage|dialogue-start|work-group|gate-action)="[^"]*"/g)].map(m=>m[0]);
test('manifest assets exist and cover all Professions; unknown/missing resources fall back once',()=>{
 for(const entry of Object.values(manifest.assets)){assert.match(readFileSync(new URL(entry.src,import.meta.url),'utf8'),/<svg[^>]*viewBox=/);assert(entry.size>0);assert.deepEqual(entry.pivot,[.5,.5]);}
 assert.equal(Object.keys(manifest.professions).length,6);assert.match(spriteImage('not-authored',30,20),/data-sprite="unknown"/);
 const image={tagName:'image',dataset:{},setAttribute(key,value){this[key]=value;}};replaceMissingSprite(image);assert.equal(image.href,manifest.assets.unknown.src);image.href='failed-fallback';replaceMissingSprite(image);assert.equal(image.href,'failed-fallback');
 const broken={tagName:'image',dataset:{},href:manifest.assets.rock.src,getAttribute(key){return this[key];},setAttribute(key,value){this[key]=value;}};replaceMissingSprite(broken);assert.match(spriteImage('rock',20,20),/data-sprite="unknown"/);assert(!spriteImage('rock',20,20).includes('rock.svg'),'Redraws do not retry a failed resource');
});
test('sprites reuse the exact schematic controls and never mutate definitions or runtime',()=>{
 const {m,s}=fixture();move(m,s,'door-gate-to-yard');const before=JSON.stringify({m,s}),schematic=renderMap(m,s),sprites=spriteMap(m,s);
 assert.deepEqual(controls(sprites),controls(schematic));assert.match(sprites,/data-sprite="worker"/);assert.match(sprites,/data-sprite-unit=/);assert.equal(JSON.stringify({m,s}),before);assert.equal(spriteMap(m,s),sprites);
});
test('hidden Stage, object, NPC, transition and unknown identity art do not leak',()=>{
 const {m,s}=fixture(),html=spriteMap(m,s);assert(!html.includes('data-stage="stage-hidden-store"'));assert(!html.includes('data-sprite-instance="operative-01"'));assert(!html.includes('data-sprite-instance="lab-mounted-rifle-01"'));
 assert(!html.includes('data-transition="door-stage-hidden-store"'));assert.equal(instanceSpriteKey(m.indexes.instances['operative-01']),'civilian');
 assert.equal(instanceSpriteKey({archetypeId:'npc_guard_poorly_trained',mapGlyph:'PERSON',identityKnownAtStart:false}),'civilian');
 const surface=spritePresentation.stage(m.indexes.stages['stage-analysis-lab'],{visibility:'PARTIAL'});assert.match(surface,/floor-fog/);assert(!surface.includes('floor-lab'));
});
test('multi-cell Stage edges omit internal walls and preserve existing stable placement',()=>{
 const {m,s}=fixture(),stage={stageId:'test',archetypeId:'stage_room_basic',cells:[{x:0,y:0},{x:1,y:0}]};
 const html=spritePresentation.stage(stage,{visibility:'VISIBLE'});assert.equal([...html.matchAll(/data-sprite="floor-indoor"/g)].length,2);assert.equal([...html.matchAll(/class="sprite-boundary"/g)].length,6);
 const before=mapLayout(m,s);s.instanceStates['worker-yard-01'].custody='RECOVERED_TO_SGC';const after=mapLayout(m,s);assert.deepEqual(after.points['worker-yard-02'],before.points['worker-yard-02']);
});
test('all real mission Stages render with action parity, Lab art and down/stationed treatments',()=>{
 const {m,s}=fixture();for(const stage of m.stages){s.currentStageId=stage.stageId;s.stageStates[stage.stageId].visibility='VISIBLE';for(const u of s.units)u.currentStageId=stage.stageId;
  const html=spriteMap(m,s);assert.deepEqual(controls(html),controls(renderMap(m,s)));assert(html.includes(`data-stage="${stage.stageId}"`));
 }
 assert.match(spritePresentation.unit({...s.units[0],partyStatus:'STATIONED',health:0},{x:20,y:40}),/rotate\(90 20 40\)/);
 assert.match(spritePresentation.stage(m.indexes.stages['stage-analysis-lab'],{visibility:'VISIBLE'}),/floor-lab/);
});
