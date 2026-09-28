// Standalone portrait-simulator state and fixture loading. No game catalogs or runtime state
// are modified, and nothing here encodes competency: appearance is presentation only.
import {normalizeAppearance,styles} from '../shared/portraits/portrait-bust.mjs';
export const editorFields=Object.freeze([
  {key:'faceStyle',label:'Face',options:styles.face},
  {key:'hairStyle',label:'Hair',options:styles.hair},
  {key:'browStyle',label:'Brows',options:styles.brow},
  {key:'eyeStyle',label:'Eyes',options:styles.eye},
  {key:'mouthStyle',label:'Mouth',options:styles.mouth},
  {key:'facialHairStyle',label:'Facial hair',options:styles.facialHair},
  {key:'uniformStyle',label:'Uniform',options:styles.uniform},
  {key:'collarStyle',label:'Collar',options:styles.collar},
]);
export const colorFields=Object.freeze([
  {key:'skinColor',label:'Skin'},{key:'hairColor',label:'Hair'},
  {key:'facialHairColor',label:'Facial hair'},{key:'eyeColor',label:'Eyes'},
  {key:'uniformColor',label:'Uniform'},{key:'collarColor',label:'Collar accent'},
  {key:'backgroundColor',label:'Background'},
]);
// Part groups emitted by the bust renderer, in render order. Layer toggles are preview-only.
export const layerGroups=Object.freeze(['background','uniform','collar','neck','ear','face','hair','facialHair','brows','eyes','nose','mouth']);
// Same seeded random convention as the world-map simulator: FNV-1a seed, mulberry32 stream.
export function random(seed){
  let h=2166136261;
  for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);
  return ()=>{h+=0x6D2B79F5;let t=Math.imul(h^(h>>>15),1|h);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};
}
// Person-only palettes. The deployment uniform, collar accent and backdrop always come from the base.
const PALETTE=Object.freeze({
  skin:['#f0c8a8','#dda87f','#c9976d','#a9714a','#8d5b3c','#7b4f34','#5d3b28'],
  hair:['#1c1a1f','#241f22','#3a2a30','#5a3a24','#8a4b26','#b0522c','#a2a29c','#d8d5cd'],
  eye:['#2a1d18','#3a2b24','#4a3126','#33414f'],
});
// Randomization changes the person only. Uniform style, collar style, colours and backdrop stay.
export const personFields=Object.freeze(['faceStyle','hairStyle','browStyle','eyeStyle','mouthStyle','facialHairStyle']);
export function randomAppearance(seed='orionis-1',base={}){
  const rng=random(seed),pick=list=>list[Math.floor(rng()*list.length)],next={...base};
  for(const {key,options} of editorFields)if(personFields.includes(key))next[key]=pick(options);
  next.skinColor=pick(PALETTE.skin);next.hairColor=pick(PALETTE.hair);next.eyeColor=pick(PALETTE.eye);
  next.facialHairColor=next.hairColor;
  return normalizeAppearance(next);
}
export function mixAppearance(base,patch){return normalizeAppearance({...base,...patch});}
export function describeAppearance(appearance){
  const a=normalizeAppearance(appearance);
  return `${a.faceStyle} face · ${a.hairStyle} hair · ${a.uniformStyle} uniform · ${a.collarStyle} collar${a.facialHairStyle==='none'?'':` · ${a.facialHairStyle}`}`;
}
export function appearanceJson(appearance){
  const a=normalizeAppearance(appearance);
  return JSON.stringify({...a,backgroundColor:a.backgroundColor??'transparent'},null,2);
}
export function parseAppearance(text){
  let data;
  try{data=JSON.parse(text);}catch{throw new Error('Appearance record is not valid JSON.');}
  if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Appearance record must be a JSON object.');
  return normalizeAppearance(data);
}
export function loadPresets(data){
  const parsed=typeof data==='string'?JSON.parse(data):data;
  if(!parsed||!Array.isArray(parsed.presets))throw new Error('Portrait fixture must contain a presets array.');
  const seen=new Set();
  return Object.freeze(parsed.presets.map(entry=>{
    if(!entry||typeof entry.id!=='string'||!entry.id)throw new Error('Every portrait preset needs a string id.');
    if(seen.has(entry.id))throw new Error(`Duplicate portrait preset id: ${entry.id}.`);
    seen.add(entry.id);
    return Object.freeze({id:entry.id,label:String(entry.label??entry.id),note:String(entry.accentSource??''),appearance:normalizeAppearance(entry.appearance??{})});
  }));
}
// The authored deployment roster stays authoritative in the offworld fixture; this only reads it.
export function rosterEntries(data){
  const units=data?.units;
  if(!Array.isArray(units))throw new Error('Deployment roster must contain a units array.');
  return Object.freeze(units.map(unit=>{
    if(!unit||typeof unit.unitId!=='string')throw new Error('Every deployment unit needs a unitId.');
    return Object.freeze({id:unit.unitId,name:String(unit.name??unit.unitId),profession:String(unit.profession??''),color:String(unit.color??'#8ad1ba'),appearance:normalizeAppearance(unit.appearance??{})});
  }));
}
export function sharedRosterEntries(roster,classCatalog){
  const colors=Object.fromEntries(classCatalog.map(c=>[c.id,c.color]));
  return Object.freeze(roster.map(unit=>Object.freeze({
    id:unit.id,name:unit.name,profession:String(unit.classId??'').toUpperCase(),
    color:colors[unit.classId]??'#8ad1ba',favorite:!!unit.favorite,
    appearance:normalizeAppearance(unit.portrait?.appearance??{})
  })));
}
