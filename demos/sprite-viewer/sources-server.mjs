// Local demo-server source storage; never changes active sprite mappings.
import {mkdir,realpath,readdir,readFile,writeFile,mkdtemp,rename,rm,stat} from 'node:fs/promises';
import {resolve,sep,join} from 'node:path';import {inflateRawSync} from 'node:zlib';
import {readSpriteZip} from './zip.mjs';import {identifySprite,spriteSourceId} from './model.mjs';
function pngSize(bytes){
 if(bytes.length<33||!Buffer.from(bytes.subarray(0,8)).equals(Buffer.from([137,80,78,71,13,10,26,10]))||bytes.toString('ascii',12,16)!=='IHDR')throw Error('Invalid PNG source.');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 if(!width||!height||width*height>16000000)throw Error('PNG dimensions exceed source limits.');return [width,height];
}
async function sourceRoot(root,create=false){
 const base=await realpath(root),artwork=resolve(base,'artwork');
 if(create)await mkdir(artwork,{recursive:true});
 const realArtwork=await realpath(artwork);if(!realArtwork.startsWith(base+sep))throw Error('Source directory is outside this repository.');
 const folder=join(realArtwork,'sprite-sources');if(create)await mkdir(folder,{recursive:true});
 const realFolder=await realpath(folder);if(!realFolder.startsWith(base+sep))throw Error('Source directory is outside this repository.');return realFolder;
}
export async function listSpriteSources(root){
 let folder;try{folder=await sourceRoot(root);}catch(error){if(error.code!=='ENOENT')throw error;}
 const files=[];
 for(const batch of folder?await readdir(folder,{withFileTypes:true}):[]){
  if(!batch.isDirectory()||batch.name.startsWith('.'))continue;
  for(const entry of await readdir(join(folder,batch.name),{withFileTypes:true})){
   if(!entry.isFile()||!identifySprite(entry.name))continue;
   const bytes=await readFile(join(folder,batch.name,entry.name));let dimensions;
   try{dimensions=pngSize(bytes);}catch{continue;}
   const path=`artwork/sprite-sources/${batch.name}/${entry.name}`;
   files.push({name:entry.name,path,dimensions,savedAt:(await stat(join(folder,batch.name,entry.name))).mtimeMs,url:'/'+path.split('/').map(encodeURIComponent).join('/')});
  }
 }
 const base=await realpath(root),prepared=resolve(base,'artwork/sprite-prepared');
 let batches=[];try{const canonical=await realpath(prepared);if(!canonical.startsWith(base+sep))throw Error('Prepared directory is outside this repository.');batches=await readdir(prepared,{withFileTypes:true});}catch(error){if(error.code!=='ENOENT')throw error;}
 for(const batch of batches){
  if(!batch.isDirectory()||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(batch.name))continue;
  for(const variant of await readdir(join(prepared,batch.name),{withFileTypes:true})){
   if(!variant.isDirectory()||!/^v0[1-3]$/.test(variant.name))continue;
   for(const entry of await readdir(join(prepared,batch.name,variant.name),{withFileTypes:true})){
    if(!entry.isFile()||!identifySprite(entry.name)||identifySprite(entry.name).source)continue;
    const path=`artwork/sprite-prepared/${batch.name}/${variant.name}/${entry.name}`,actual=await realpath(resolve(root,path));if(!actual.startsWith(base+sep))throw Error('Prepared file is outside this repository.');
    let dimensions;try{dimensions=pngSize(await readFile(actual));}catch{continue;}
    files.push({name:entry.name,path,dimensions,savedAt:(await stat(actual)).mtimeMs,url:'/'+path.split('/').map(encodeURIComponent).join('/')});
   }
  }
 }
 return files;
}
export async function saveSpriteSources(root,archiveName,bytes){
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}\.zip$/i.test(archiveName))throw Error('Use a ZIP filename containing letters, numbers, hyphens or underscores.');
 const decoded=await readSpriteZip(bytes,{inflate:(data,limit)=>inflateRawSync(data,{maxOutputLength:Math.max(1,limit)})});
 const files=decoded.filter(file=>identifySprite(file.name));if(!files.length)throw Error('ZIP has no recognized sprite PNGs.');
 const names=new Set();for(const file of files){if(names.has(file.name))throw Error('ZIP contains repeated sprite filenames; save each batch separately.');names.add(file.name);pngSize(Buffer.from(file.bytes));}
 const folder=await sourceRoot(root,true),batch=archiveName.slice(0,-4),destination=join(folder,batch);
 try{
  const entries=await readdir(destination,{withFileTypes:true});
  if(entries.some(entry=>entry.isSymbolicLink()))throw Error('Existing batch contains symbolic links.');
  const canonical=await realpath(destination);if(!canonical.startsWith(folder+sep))throw Error('Batch is outside the sources directory.');
  if(entries.length===files.length&&(await Promise.all(files.map(async file=>{try{return Buffer.from(file.bytes).equals(await readFile(join(destination,file.name)));}catch{return false;}}))).every(Boolean))return {saved:true,alreadySaved:true,count:files.length,path:`artwork/sprite-sources/${batch}`};
  throw Error('Batch already exists with different contents. Rename the ZIP to a new batch; existing files were kept.');
 }catch(error){if(error.code!=='ENOENT')throw error;}
 const staging=await mkdtemp(join(folder,'.incoming-'));
 try{for(const file of files)await writeFile(join(staging,file.name),file.bytes,{flag:'wx'});await rename(staging,destination);}
 catch(error){await rm(staging,{recursive:true,force:true});throw error;}
 return {saved:true,count:files.length,path:`artwork/sprite-sources/${batch}`};
}
export async function readSpriteReviews(root){
 try{
  const folder=await sourceRoot(root),data=JSON.parse(await readFile(join(folder,'sprite-review.json'),'utf8'));
  if(!Array.isArray(data.rejected)||data.rejected.some(id=>typeof id!=='string'||spriteSourceId(id)!==id))throw Error('Invalid sprite review record.');
  return data.rejected;
 }catch(error){if(error.code==='ENOENT')return [];throw error;}
}
export async function setSpriteRejected(root,id,rejected){
 if(typeof id!=='string'||spriteSourceId(id)!==id||typeof rejected!=='boolean')throw Error('Invalid sprite rejection.');
 const entries=new Set(await readSpriteReviews(root));if(rejected)entries.add(id);else entries.delete(id);
 const folder=await sourceRoot(root,true),staging=await mkdtemp(join(folder,'.review-'));
 try{await writeFile(join(staging,'review.json'),JSON.stringify({version:1,rejected:[...entries].sort()},null,2)+'\n');await rename(join(staging,'review.json'),join(folder,'sprite-review.json'));}
 finally{await rm(staging,{recursive:true,force:true});}
 await (await import('./install-server.mjs')).syncInstalledReviews(root);
 return {saved:true,rejected:[...entries].sort()};
}
export async function assertSpriteCandidateAllowed(root,path){
 const id=spriteSourceId(path);if(id&&(await readSpriteReviews(root)).includes(id))throw Error('This variant was rejected in the Sprite Viewer. Restore it before preparing it for installation.');
}
