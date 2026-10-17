// Explicit local art installation: validated files first, one activation commit.
import {readFile,writeFile,mkdir,realpath,rename,mkdtemp,rm,readdir,stat,copyFile} from 'node:fs/promises';
import {resolve,join,sep} from 'node:path';import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';import {promisify} from 'node:util';
import {spriteManifest} from '../offworld-sandbox/sprite-manifest.mjs';
import {spriteSourceId,identifySprite} from './model.mjs';
import {assertSpriteCandidateAllowed,listSpriteSources,readSpriteReviews} from './sources-server.mjs';
import {replaceRegistry} from './atomic-replace.mjs';
const exec=promisify(execFile),worker=fileURLToPath(new URL('../offworld-sandbox/prepare-sprite.py',import.meta.url));
const registry='demos/shared/sprites/active-sprites.mjs';
export async function readActiveSprites(root){
 try{
  const text=await readFile(resolve(root,registry),'utf8'),match=/export const activeSprites = (\{[\s\S]*\});\s*$/.exec(text);
  if(!match)throw Error('Invalid active sprite registry.');const active=JSON.parse(match[1]);
  for(const [key,entry] of Object.entries(active))for(const variant of [entry,...(entry.variants??[])])if(!spriteManifest.assets[key]||typeof variant.src!=='string'||!/^\.\.\/shared\/sprites\/offworld\/production\/installed-[a-zA-Z0-9-]+\/[a-z0-9-]+\.png$/.test(variant.src)||spriteSourceId(variant.sourceId)!==variant.sourceId)throw Error('Invalid installed sprite selection.');
  return active;
 }catch(error){if(error.code==='ENOENT')return {};throw error;}
}
export async function writeActiveSprites(root,active){
 const folder=await checkedDirectory(root,'demos/shared/sprites'),stage=await mkdtemp(join(folder,'.activation-'));
 try{await writeFile(join(stage,'active.mjs'),'// Written by the local sprite installer. Presentation selections and installed variant pools.\nexport const activeSprites = '+JSON.stringify(active,null,2)+';\n');await replaceRegistry(join(stage,'active.mjs'),join(folder,'active-sprites.mjs'));}
 finally{await rm(stage,{recursive:true,force:true});}
}
export async function syncInstalledReviews(root){
 const active=await readActiveSprites(root),rejected=new Set(await readSpriteReviews(root));
 for(const entry of Object.values(active)){entry.disabled=rejected.has(entry.sourceId);for(const v of entry.variants??[])v.disabled=rejected.has(v.sourceId);}
 if(Object.keys(active).length)await writeActiveSprites(root,active);
}
export async function migrateInstalledVariants(root){
 const active=await readActiveSprites(root),base=await realpath(root),folder=resolve(root,'demos/shared/sprites/offworld/production'),installed=[];
 let dirs;try{dirs=await readdir(folder,{withFileTypes:true});}catch(error){if(error.code==='ENOENT')return active;throw error;}
 for(const dir of dirs){if(!dir.isDirectory()||!/^installed-[a-zA-Z0-9-]+$/.test(dir.name))continue;
  for(const file of await readdir(join(folder,dir.name),{withFileTypes:true})){const key=file.name.replace(/\.png$/,'');if(!file.isFile()||!file.name.endsWith('.png')||!spriteManifest.assets[key])continue;
   const path=await realpath(join(folder,dir.name,file.name));if(!path.startsWith(base+sep))throw Error('Installed source is outside repository');installed.push({key,path,src:`../shared/sprites/offworld/production/${dir.name}/${file.name}`,installedAt:new Date((await stat(path)).mtimeMs).toISOString()});
  }
 }
 const sources=[];for(const s of await listSpriteSources(root)){if(s.path.includes('/sprite-prepared/'))continue;const path=await realpath(resolve(root,s.path));if(!path.startsWith(base+sep))throw Error('Saved source is outside repository');sources.push({key:identifySprite(s.name).key,path,id:spriteSourceId(s.path)});}
 const result=await new Promise((resolveResult,reject)=>{const child=execFile(process.env.SPRITE_PYTHON??'python',[fileURLToPath(new URL('./match-installed.py',import.meta.url))],{windowsHide:true,maxBuffer:8*1024*1024},(error,stdout)=>error?reject(error):resolveResult(stdout));child.stdin.end(JSON.stringify({sources,installed,assets:spriteManifest.assets}));});
 const rejected=new Set(await readSpriteReviews(root));
 for(const match of JSON.parse(result)){const {key,src,sourceId,installedAt}=match,variant={src,sourceId,installedAt,disabled:rejected.has(sourceId)},entry=active[key]??variant;
  const pool=entry.variants??[{src:entry.src,sourceId:entry.sourceId,installedAt:entry.installedAt,disabled:rejected.has(entry.sourceId)}];
  if(!pool.some(v=>v.sourceId===sourceId))pool.push(variant);active[key]={...entry,disabled:rejected.has(entry.sourceId),variants:pool};
 }
 await writeActiveSprites(root,active);return active;
}
async function checkedDirectory(root,relative){
 const base=await realpath(root);let directory=base;
 for(const part of relative.split('/')){directory=join(directory,part);await mkdir(directory,{recursive:true});directory=await realpath(directory);if(!directory.startsWith(base+sep))throw Error('Installation directory is outside the repository.');}
 return directory;
}
export async function installSpriteVariant(root,id){
 if(typeof id!=='string'||spriteSourceId(id)!==id)throw Error('Invalid sprite source selection.');
 const info=identifySprite(id.split('/').at(-1)),entry=spriteManifest.assets[info.key],batch=id.split('/')[0];
 const prepared=id.startsWith('sprite-prepared/');
 const ids=[id];if(entry.pair){if(prepared)ids.push(`${id.slice(0,id.lastIndexOf('/')+1)}${entry.pair}.png`);else{if(!info.source)throw Error('Install matching source variants for paired assets.');ids.push(`${batch}/${entry.pair}__${info.variant}__source.png`);}}
 const base=await realpath(root),sources=[];
 for(const sourceId of ids){
  await assertSpriteCandidateAllowed(root,sourceId);
  const inputRoot=await realpath(resolve(root,prepared?'artwork/sprite-prepared':'artwork/sprite-sources'));
  let path;try{path=await realpath(resolve(inputRoot,prepared?sourceId.slice('sprite-prepared/'.length):sourceId));}catch(error){if(error.code==='ENOENT')throw Error(`Missing source: ${sourceId}`);throw error;}
  if(!inputRoot.startsWith(base+sep)||!path.startsWith(inputRoot+sep))throw Error('Source is outside the candidate directory.');sources.push(path);
 }
 const production=await checkedDirectory(root,'demos/shared/sprites/offworld/production'),staging=await mkdtemp(join(production,'.install-'));
 const folder=`installed-${staging.split(/[\\/]/).at(-1).slice(1)}`,destination=join(production,folder);
 const python=process.env.SPRITE_PYTHON??'python';
 async function run(mode,key,input,options=[]){
  const config={...spriteManifest.assets[key],key,out:join(staging,`${key}.png`)};
  try{await exec(python,[worker,mode,JSON.stringify(config),input,...options],{windowsHide:true,maxBuffer:1024*1024});}
  catch(error){throw Error(error.stderr?.trim()||error.message);}
 }
 let committed=false,registryTemp;
 try{
  if(entry.pair&&!prepared)await run('pair-source',info.key,sources[0],['--pair',sources[1]]);
  for(let i=0;i<ids.length;i++){const key=identifySprite(ids[i].split('/').at(-1)).key;if(prepared)await copyFile(sources[i],join(staging,`${key}.png`));else await run('prepare',key,sources[i]);}
  for(const sourceId of ids){const key=identifySprite(sourceId.split('/').at(-1)).key;await run('validate',key,join(staging,`${key}.png`));}
  const active=await readActiveSprites(root),installedAt=new Date().toISOString();
  for(const sourceId of ids){const key=identifySprite(sourceId.split('/').at(-1)).key,next={src:`../shared/sprites/offworld/production/${folder}/${key}.png`,sourceId,installedAt},prior=active[key],pool=prior?.variants??(prior?[{src:prior.src,sourceId:prior.sourceId,installedAt:prior.installedAt,disabled:prior.disabled}]:[]);active[key]={...next,variants:[...pool.filter(v=>v.sourceId!==sourceId),next]};}
  const registryFolder=await checkedDirectory(root,'demos/shared/sprites');registryTemp=await mkdtemp(join(registryFolder,'.activation-'));
  await writeFile(join(registryTemp,'active.mjs'),'// Written by the local sprite installer. Presentation selections only.\nexport const activeSprites = '+JSON.stringify(active,null,2)+';\n');
  await rename(staging,destination);
  await replaceRegistry(join(registryTemp,'active.mjs'),join(registryFolder,'active-sprites.mjs'));committed=true;
  return {installed:true,active,keys:ids.map(sourceId=>identifySprite(sourceId.split('/').at(-1)).key)};
 }finally{
  await rm(staging,{recursive:true,force:true});if(registryTemp)await rm(registryTemp,{recursive:true,force:true});
  if(!committed)await rm(destination,{recursive:true,force:true});
 }
}
