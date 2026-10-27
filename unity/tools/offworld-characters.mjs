import {readFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const manifest=JSON.parse(readFileSync(resolve(root,'artwork/toon-soldiers-proof/offworld-import-manifest.json'),'utf8'));
const lab=resolve(root,'unity/OrionisArtLab'),game=resolve(root,'unity/StargateOrionis');
const check=process.argv.includes('--check');
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
for(const entry of manifest.files){
 if(!entry.path.startsWith('Assets/')||entry.path.split('/').includes('..'))throw Error('Invalid asset path');
 const source=resolve(lab,entry.path),target=resolve(game,entry.path);
 if(!source.startsWith(lab+sep)||!target.startsWith(game+sep))throw Error('Asset escapes project');
 if(!existsSync(source)||hash(source)!==entry.sha256)throw Error('Art Lab source missing/changed: '+entry.path);
 if(existsSync(target)){
  if(hash(target)!==entry.sha256)throw Error('Main asset differs; preserve local changes before restaging: '+entry.path);
 }else{
  if(check)throw Error('Main asset missing: '+entry.path);
  mkdirSync(dirname(target),{recursive:true});copyFileSync(source,target);
 }
}
console.log(`${check?'Verified':'Staged'} ${manifest.files.length} original dependency files; selected Art Lab motion clips.`);
