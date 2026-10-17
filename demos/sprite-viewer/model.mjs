import {spriteManifest} from '../offworld-sandbox/sprite-manifest.mjs';
export const assets=Object.entries(spriteManifest.assets).map(([key,entry])=>({key,...entry,
 url:new URL(entry.src,new URL('../offworld-sandbox/sprite-manifest.mjs',import.meta.url)).href}));
export function identifySprite(name){
 const match=/^([a-z0-9-]+)(?:__v(0[1-3])__source)?\.png$/.exec(name);
 if(!match||!Object.hasOwn(spriteManifest.assets,match[1]))return null;
 return {key:match[1],variant:match[2]?`v${match[2]}`:'Prepared PNG',source:!!match[2]};
}
export function previewSize(asset,mode){
 return mode==='world'?asset.displaySize:asset.runtimePixels;
}
export function newestAssetsFirst(list,candidates){
 const latest=new Map();for(const candidate of candidates)latest.set(candidate.key,Math.max(latest.get(candidate.key)??0,candidate.loadedOrder??0));
 return [...list].sort((a,b)=>(latest.get(b.key)??0)-(latest.get(a.key)??0));
}
export function spriteSourceId(path){
 const parts=path.replaceAll('\\','/').split('/'),name=parts.at(-1);
 if(!identifySprite(name))return null;
 if(parts.length===3&&/^v0[1-3]$/.test(parts[1])&&!identifySprite(name).source)return spriteSourceId(`sprite-prepared/${path}`);
 const prepared=parts.indexOf('sprite-prepared');
 if(prepared>=0){
  const batch=parts[prepared+1],variant=parts[prepared+2],info=identifySprite(name);
  if(parts.length!==prepared+4||info.source||!/^v0[1-3]$/.test(variant??'')||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(batch??''))return null;
  return `sprite-prepared/${batch}/${variant}/${name}`;
 }
 const index=parts.indexOf('sprite-sources');
 const batch=index>=0?parts[index+1]:parts[0]?.toLowerCase().endsWith('.zip')?parts[0].slice(0,-4):parts.length>1?parts.at(-2):'loose';
 return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(batch??'')?`${batch}/${name}`:null;
}
