import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {headKitPrompts} from '../shared/sprites/head-kit-prompts.mjs';
import {characterArtKeys,characterMaterialPalette,profilePrompt,materialRgbRamp} from '../shared/sprites/character-art-prompts.mjs';
const run=(...args)=>spawnSync(process.execPath,['demos/offworld-sandbox/prepare-sprite.mjs',...args],{encoding:'utf8'});
test('Every character prompt and corresponding portrait uses the same material palette and paired identities',()=>{
 for(const key of characterArtKeys){
  const sprite=run('prompt',key),profile=run('profile-prompt',key);
  assert.equal(sprite.status,0,sprite.stderr);assert.equal(profile.status,0,profile.stderr);
  for(const color of Object.values(characterMaterialPalette)){assert(sprite.stdout.includes(color));assert(profile.stdout.includes(color));}
  assert.match(profile.stdout,/REFERENCE REQUIRED/);assert.match(profile.stdout,/v01 matches overhead v01/);
   assert.match(sprite.stdout,/Clean angular tailoring/);assert.match(sprite.stdout,/Soft rounded tailoring/);assert.match(sprite.stdout,/Chunky layered tailoring/);
   assert.match(sprite.stdout,/not equipment inventory/);
   assert.match(profile.stdout,/DESIGN MATCHING/);assert.match(profile.stdout,/Do not collapse all three into one generic outfit/);
  assert.match(profile.stdout,/front-facing head-and-shoulders/);assert.match(profile.stdout,/Normalize both matched views together/);
  for(const text of [sprite.stdout,profile.stdout]){assert.match(text,/STRICT RGB SOURCE PALETTE/);assert.match(text,/RGB\(213, 155, 112\)/);assert.match(text,/RGB\(112, 67, 34\)/);assert.match(text,/only the five listed tones/);assert.match(text,/requested but unverified/);}
  assert.match(profile.stdout,new RegExp(`${key}__v03__profile-source.png`));assert.match(profile.stdout,/Keep the profile archive separate/);
 }
 assert.doesNotMatch(run('prompt','floor-indoor').stdout,/CHARACTER MATERIAL PALETTE/);
 assert.throws(()=>profilePrompt('crate'));
 assert.notEqual(run('profile-prompt','crate').status,0);
});
test('Head kit exports a reference-bound matched-view queue and refuses replacement',()=>{
 const out=join(mkdtempSync(join(tmpdir(),'head-kit-prompts-')),'queue');
 const result=run('head-prompts','--out',out);assert.equal(result.status,0,result.stderr);
 assert.equal(readdirSync(out).length,7);
 const initial=readFileSync(join(out,headKitPrompts[0].file),'utf8');
 for(const {file} of headKitPrompts){const text=readFileSync(join(out,file),'utf8');
  assert.match(text,/1024x1024 true RGBA/);assert.match(text,/Never independently crop, recenter/);
  assert.match(text,/overhead-source.png/);assert.match(text,/portrait-source.png/);
  assert.match(text,/hair and facial hair use hair/);assert.match(text,/frames\/straps use gear/);
  assert.match(text,/current viewer\/installer does not ingest/);
  assert.match(text,/STRICT RGB SOURCE PALETTE/);assert.match(text,/RGB\(200, 210, 220\)/);
 }
 assert.match(initial,/Remove the entire original head/);assert.match(initial,/registration.json/);
 assert.match(readFileSync(join(out,'04-goggles-variant-prompt.txt'),'utf8'),/goggles-lens__v01__portrait-source.png/);
 assert.match(readFileSync(join(out,'03-beard-variant-prompt.txt'),'utf8'),/fully occluded overhead/);
 assert.notEqual(run('head-prompts','--out',out).status,0);
 assert.equal(readFileSync(join(out,headKitPrompts[0].file),'utf8'),initial);
 assert.notEqual(run('head-prompts','--out').status,0);
});
test('Exact material ramps use bounded integer RGB and consistent brightness offsets',()=>{
 assert.deepEqual(materialRgbRamp('#929394'),[[114,115,116],[130,131,132],[146,147,148],[162,163,164],[178,179,180]]);
 assert.deepEqual(materialRgbRamp('#343a40')[0],[20,26,32]);
 for(const hex of Object.values(characterMaterialPalette))for(const rgb of materialRgbRamp(hex))for(const value of rgb)assert(Number.isInteger(value)&&value>=0&&value<=255);
});
