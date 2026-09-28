// Authoring aid: prints busts as ASCII grids so parts, silhouettes and shading can be
// inspected in a terminal. Not part of the simulator runtime.
//   node demos/portrait-simulator/preview-ascii.mjs
//   node demos/portrait-simulator/preview-ascii.mjs --presets
import {readFileSync} from 'node:fs';
import {portraitBustSurface,styles,normalizeAppearance} from '../shared/portraits/portrait-bust.mjs';
// s/h/u/c/f are materials: lowercase = base tone, UPPERCASE = lit tone, ':' = mid tone, '.' = shaded tone.
const MATERIAL={skin:'s',hair:'h',uniform:'u',collar:'c',beard:'f'};
const presetUrl=new URL('../shared/data/portraits/portrait-presets.json',import.meta.url);
const FEATURE={brows:'^',eyes:'o',nose:'~',mouth:'_',background:' ',neck:'s',ear:'s',face:'s'};
function cell(surface,x,y){
  const i=y*surface.width+x,part=surface.parts[i],tag=surface.tags[i];
  if(!tag)return ' ';
  if(part!=='background'&&FEATURE[part]&&!MATERIAL[tag])return FEATURE[part];
  const letter=MATERIAL[tag]??FEATURE[part]??'?';
  const family=surface.tones[tag];
  if(!family)return letter;
  const color=surface.pixels[i];
  if(color===family.light)return letter.toUpperCase();
  if(color===family.mid)return ':';
  if(color===family.dark)return '.';
  return letter;
}
export function asciiPortrait(appearance={},appearanceOverrides){
  const surface=portraitBustSurface({...appearance,...appearanceOverrides}),lines=[];
  for(let y=0;y<surface.height;y++){
    let line='';
    for(let x=0;x<surface.width;x++)line+=cell(surface,x,y);
    lines.push(line);
  }
  return lines;
}
function block(label,lines){
  const head=label.padEnd(Math.max(label.length,lines[0].length),' ');
  return [{text:head},...lines.map(text=>({text}))];
}
export function printGroups(name,entries,perRow=3){
  console.log(`\n=== ${name} ===`);
  for(let i=0;i<entries.length;i+=perRow){
    const blocks=entries.slice(i,i+perRow).map(([label,appearance])=>block(label,asciiPortrait(appearance)));
    const height=Math.max(...blocks.map(b=>b.length));
    for(let row=0;row<height;row++)console.log(blocks.map(b=>(b[row]?.text??'').padEnd(b[0].text.length,' ')).join('   '));
  }
}
const isEntry=process.argv[1]?.replace(/\\/g,'/').endsWith('portrait-simulator/preview-ascii.mjs');
if(isEntry)main();
function main(){
  if(process.argv.includes('--presets')){
    const presets=JSON.parse(readFileSync(presetUrl,'utf8')).presets;
    printGroups('preset studies',presets.filter(p=>!process.argv[2]||p.id===process.argv[2]).map(p=>[p.id,p.appearance]));
    return;
  }
  console.log(`Bust ${portraitBustSurface().width}x${portraitBustSurface().height} · defaults: ${JSON.stringify(normalizeAppearance({}))}`);
  for(const [name,key] of [['face','faceStyle'],['hair','hairStyle'],['brow','browStyle'],['eye','eyeStyle'],['mouth','mouthStyle'],['facialHair','facialHairStyle'],['uniform','uniformStyle'],['collar','collarStyle']])
    printGroups(`${key} ${styles[name].join(' · ')}`,styles[name].map(value=>[value,{[key]:value}]));
}
