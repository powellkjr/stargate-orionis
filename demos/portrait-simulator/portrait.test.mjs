import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {portraitBustSvg,portraitBustSurface,normalizeAppearance,tonalPalette,styles,appearanceDefaults,BUST_WIDTH,BUST_HEIGHT} from '../shared/portraits/portrait-bust.mjs';
import {portraitSvg} from '../shared/portraits/portrait.mjs';
import {mapToken} from '../shared/portraits/map-token.mjs';
import {randomAppearance,mixAppearance,appearanceJson,parseAppearance,describeAppearance,loadPresets,rosterEntries,sharedRosterEntries,layerGroups,editorFields,colorFields} from './model.mjs';
import {buildPersonnelRoster,personnelPresentation,setPersonnelPortrait} from '../shared/js/personnel-roster.mjs';
const readPortrait=name=>JSON.parse(readFileSync(new URL(`../shared/data/portraits/${name}.json`,import.meta.url),'utf8'));
const sharedPresentation=JSON.parse(readFileSync(new URL('../shared/data/personnel-presentation.json',import.meta.url),'utf8'));
const studies=loadPresets(readPortrait('portrait-presets'));
const roster=rosterEntries(JSON.parse(readFileSync(new URL('../shared/data/offworld/party-presets.json',import.meta.url),'utf8')));
const rectsOf=svg=>[...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[0-9a-f]{6})"\/>/g)]
  .map(([,x,y,w,h,fill])=>({x:+x,y:+y,width:+w,height:+h,fill}));
const partsOf=svg=>new Set([...svg.matchAll(/data-part="([a-zA-Z]+)"/g)].map(m=>m[1]));
const everyAppearance=[...studies.map(s=>s.appearance),...roster.map(r=>r.appearance)];
test('every authored record draws a complete, in-bounds bust',()=>{
  assert.ok(everyAppearance.length>=10);
  for(const appearance of everyAppearance){
    const svg=portraitBustSvg(appearance);
    assert.match(svg,new RegExp(`viewBox="0 0 ${BUST_WIDTH} ${BUST_HEIGHT}"`));
    for(const part of ['background','uniform','collar','neck','face','hair','brows','eyes','nose','mouth'])
      assert(partsOf(svg).has(part),`${part} missing for ${describeAppearance(appearance)}`);
    for(const rect of rectsOf(svg)){
      assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=BUST_WIDTH&&rect.y+rect.height<=BUST_HEIGHT,'rect outside the bust canvas');
      assert.ok(rect.width>0&&rect.height>0);
    }
    assert.equal(rectsOf(svg).length,[...svg.matchAll(/<rect /g)].length,'every rect must be a valid pixel run');
  }
});
test('the same record drives the bust, the roster icon and the map token',()=>{
  for(const appearance of everyAppearance){
    const a=normalizeAppearance(appearance),icon=portraitSvg(a),token=mapToken(a);
    assert.match(icon,/viewBox="0 0 48 48"/);
    assert(icon.includes(a.collarColor)&&icon.includes(a.skinColor));
    assert(token.includes(a.uniformColor)&&token.includes(a.collarColor));
    assert(!icon.includes('<script>')&&!token.includes('<script>'));
  }
  for(const style of styles.hair)assert.match(portraitSvg({hairStyle:style}),/data-part="hair"/,'icon hair alias');
});
test('style and colour choices change only what they describe',()=>{
  const base=normalizeAppearance({});
  for(const [group,options] of Object.entries(styles)){
    assert.equal(options.length,editorFields.find(field=>field.key===`${group}Style`).options.length);
    for(const option of options){
      const appearance=mixAppearance(base,{[`${group}Style`]:option}),svg=portraitBustSvg(appearance);
      const other=portraitBustSvg(mixAppearance(base,{[`${group}Style`]:options.find(value=>value!==option)}));
      assert.notEqual(svg,other,`${group}=${option} must render differently`);
      assert.equal(appearance[`${group}Style`],option);
      for(const part of ['face','hair','uniform','collar'])assert(partsOf(svg).has(part));
    }
  }
  const before=JSON.stringify(base),changed=portraitBustSvg(mixAppearance(base,{collarColor:'#ff0000'}));
  assert.notEqual(changed,portraitBustSvg(base));
  assert(changed.includes('#ff0000'));
  assert.equal(JSON.stringify(base),before,'normalizing must not mutate the caller record');
});
test('band collar paints a filled accent panel instead of a one-pixel line',()=>{
  const surface=portraitBustSurface({collarStyle:'band',collarColor:'#ff0000'});
  let accent=0,rows=new Set();
  for(let y=0;y<surface.height;y++)for(let x=0;x<surface.width;x++){
    const i=y*surface.width+x;
    if(surface.parts[i]==='collar'&&surface.pixels[i]==='#ff0000'){accent++;rows.add(y);}
  }
  assert.ok(accent>=45,`band accent should be filled, got ${accent} pixels`);
  assert.ok(rows.size>=7,`band accent should span multiple rows, got ${rows.size}`);
});
test('unknown styles, malformed colours and markup fall back instead of breaking',()=>{
  const fallback=normalizeAppearance({});
  for(const bad of [{faceStyle:'invented'},{hairStyle:'<svg onload=1>'},{collarStyle:'split"><script>x</script>'},{uniformStyle:null}])
    assert.equal(normalizeAppearance(bad).faceStyle,fallback.faceStyle);
  for(const bad of [{skinColor:'red'},{hairColor:'#12345'},{uniformColor:'"><script>'},{backgroundColor:'#GGGGGG'},{eyeColor:null}])
    assert(!portraitBustSvg(bad).includes('<script>'));
  assert.equal(normalizeAppearance({skinColor:'#12345'}).skinColor,appearanceDefaults.skinColor);
  assert.equal(normalizeAppearance({hairStyle:'braid'}).hairStyle,'braid');
  assert.equal(normalizeAppearance({hairColor:'#112233'}).facialHairColor,'#112233');
  assert.equal(normalizeAppearance({facialHairColor:null,skinColor:'#010203'}).facialHairColor,appearanceDefaults.hairColor);
});
test('tones are derived from the record and transparent backgrounds are real',()=>{
  const tones=tonalPalette({skinColor:'#804020',hairColor:'#204080',collarColor:'#00ff00'});
  assert.equal(tones.skin.base,'#804020');
  assert.notEqual(tones.skin.dark,tones.skin.base);
  assert.notEqual(tones.hair.light,tones.hair.base);
  assert(portraitBustSvg({skinColor:'#804020'}).includes(tones.skin.dark));
  const surface=portraitBustSurface({backgroundColor:'transparent'});
  assert.equal(surface.appearance.backgroundColor,null);
  assert(!partsOf(portraitBustSvg({backgroundColor:'transparent'})).has('background'));
  assert.equal(surface.tags.filter(tag=>tag==='background').length,0);
  assert(partsOf(portraitBustSvg({})).has('background'));
});
test('pixel surface stays inside the canvas with parts and materials tagged',()=>{
  const surface=portraitBustSurface({hairStyle:'curls',facialHairStyle:'beard'});
  assert.equal(surface.width,BUST_WIDTH);
  assert.equal(surface.height,BUST_HEIGHT);
  assert.equal(surface.pixels.length,BUST_WIDTH*BUST_HEIGHT);
  let painted=0;
  for(let i=0;i<surface.pixels.length;i++){
    if(!surface.pixels[i]){assert.equal(surface.tags[i],null);continue;}
    painted++;
    assert.match(surface.pixels[i],/^#[0-9a-f]{6}$/);
    assert(layerGroups.includes(surface.parts[i]),`unknown part ${surface.parts[i]}`);
  }
  assert.ok(painted>1200,'a bust should cover a substantial part of the canvas');
  assert.ok(painted<=BUST_WIDTH*BUST_HEIGHT);
});
test('layer toggles cover every part the renderer can emit',()=>{
  for(const style of styles.hair)for(const face of styles.face){
    const svg=portraitBustSvg({hairStyle:style,faceStyle:face,facialHairStyle:'beard',uniformStyle:'plate',collarStyle:'stand'});
    for(const part of partsOf(svg))assert(layerGroups.includes(part),`layer toggle missing for ${part}`);
  }
});
test('seeded randomize is deterministic, valid, and keeps the deployment record',()=>{
  const first=randomAppearance('orionis-1');
  assert.deepEqual(first,randomAppearance('orionis-1'));
  assert.notDeepEqual(first,randomAppearance('orionis-2'));
  const deployment={uniformColor:'#101820',collarColor:'#ff0000',uniformStyle:'plate',collarStyle:'stand',backgroundColor:'transparent'};
  const kept=randomAppearance('orionis-1',deployment),expected=normalizeAppearance(deployment);
  for(const key of Object.keys(deployment))assert.equal(kept[key],expected[key],`${key} must survive randomization`);
  assert.equal(kept.facialHairColor,kept.hairColor);
  for(const seed of ['a','candidate-7','']){
    const appearance=randomAppearance(seed);
    for(const {key,options} of editorFields)assert(options.includes(appearance[key]),`${key} must be an authored style`);
    for(const {key} of colorFields)assert.match(appearance[key],/^#[0-9a-f]{6}$/);
    assert(!portraitBustSvg(appearance).includes('undefined'));
  }
});
test('export and import round-trip a normalized record',()=>{
  for(const appearance of [...everyAppearance,randomAppearance('round-trip')]){
    const json=appearanceJson(appearance),parsed=parseAppearance(json);
    assert.deepEqual(parsed,normalizeAppearance(appearance));
    assert.deepEqual(parseAppearance(appearanceJson(parsed)),parsed);
  }
  assert.match(appearanceJson({backgroundColor:'transparent'}),/"backgroundColor": "transparent"/);
  for(const bad of ['','not json','[1,2]','"text"','null'])assert.throws(()=>parseAppearance(bad),/Appearance record/);
});
test('the deployment fixture is read, never rewritten',()=>{
  assert.equal(roster.length,6);
  assert.equal(roster[0].name,'Brett Holt');
  assert.equal(new Set(roster.map(unit=>unit.id)).size,roster.length);
  for(const unit of roster)assert.match(unit.appearance.skinColor,/^#[0-9a-f]{6}$/);
  assert.equal(studies.length,6);
  assert.equal(new Set(studies.map(study=>study.id)).size,6);
  assert.throws(()=>loadPresets({presets:[{id:'a'},{id:'a'}]}),/Duplicate/);
  assert.throws(()=>loadPresets({}),/presets array/);
  assert.throws(()=>loadPresets({presets:[{}]}),/string id/);
  assert.throws(()=>rosterEntries({units:null}),/units array/);
  assert.throws(()=>rosterEntries({units:[{name:'x'}]}),/unitId/);
});
test('the portrait editor uses every shared roster identity and persists appearance overrides',()=>{
  const classes=JSON.parse(readFileSync(new URL('../shared/data/base-classes.json',import.meta.url),'utf8'));
  const names=JSON.parse(readFileSync(new URL('../shared/data/personnel-names.json',import.meta.url),'utf8'));
  const matrix={soldier:['Marksman','Guardian','Tactician'],scout:['Pathfinder','Tracker','Observer'],technician:['Demolitions','Integrations','Overdrive'],scientist:['Applied','Operational','Strategic'],medic:['Trauma','Field Medicine','Epidemiology'],diplomat:['Negotiator','Ambassador','Arbiter']};
  const source=buildPersonnelRoster(classes,names.pools,matrix),shared=sharedRosterEntries(source,classes);
  assert.equal(shared.length,54);assert.equal(new Set(shared.map(unit=>unit.id)).size,54);
  const storage={data:{},getItem(key){return this.data[key]??null;},setItem(key,value){this.data[key]=value;}};
  const edited=mixAppearance(shared[0].appearance,{faceStyle:'angular',skinColor:'#5d3b28'});
  setPersonnelPortrait(shared[0].id,edited,storage);
  assert.equal(personnelPresentation(shared[0].id,storage).portrait.appearance.faceStyle,'angular');
  assert.equal(personnelPresentation(shared[0].id,storage).portrait.appearance.skinColor,'#5d3b28');
});
test('shared personnel presentation has unique normal-range appearances for the full roster',()=>{
  const units=Object.values(sharedPresentation.units);
  assert.equal(units.length,54);
  const appearances=units.map(unit=>normalizeAppearance(unit.portrait.appearance));
  assert.equal(new Set(appearances.map(appearance=>JSON.stringify(appearance))).size,54);
  assert.ok(new Set(appearances.map(appearance=>appearance.skinColor)).size>=6);
  assert.ok(new Set(appearances.map(appearance=>appearance.hairStyle)).size>=7);
  assert.ok(new Set(appearances.map(appearance=>appearance.collarStyle)).has('band'));
  for(const appearance of appearances){
    for(const {key,options} of editorFields)assert(options.includes(appearance[key]),`${key} must stay in the authored normal style range`);
    for(const {key} of colorFields)assert.match(appearance[key],/^#[0-9a-f]{6}$/);
  }
});

