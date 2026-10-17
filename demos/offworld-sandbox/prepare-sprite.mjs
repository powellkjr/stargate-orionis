// Optional offline tool: Node orchestrates a small Pillow raster worker.
// No generative processing, dependencies installed, or manifest edits.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {spriteManifest} from './sprite-manifest.mjs';
import {assertSpriteCandidateAllowed} from '../sprite-viewer/sources-server.mjs';
import {migrateInstalledVariants} from '../sprite-viewer/install-server.mjs';
import {roomSpriteSubjects,roomSpriteAssets} from '../shared/sprites/room-sprite-requirements.mjs';
import {roomTilePrompts,roomTileChecklist} from '../shared/sprites/room-tile-prompts.mjs';
import {roomKitCatalog,roomKitPromptEntries,roomKitMetadata,roomKitChecklist,roomKitRegistrationGuide} from '../shared/sprites/room-kit-prompts.mjs';
import {characterArtKeys,characterPaletteInstructions,profilePrompt} from '../shared/sprites/character-art-prompts.mjs';
import {spriteVariantInstructions} from '../shared/sprites/sprite-variant-prompts.mjs';
import {outstandingSpriteRequests} from '../shared/sprites/outstanding-sprite-prompts.mjs';
import {headKitPrompts,headKitChecklist} from '../shared/sprites/head-kit-prompts.mjs';
import {characterRigPrompts,characterRigChecklist,rigSourceMetadata} from '../shared/sprites/character-rig-prompts.mjs';
import {rigParts,rigTemplate,rigParents,rigOrder} from '../shared/sprites/character-rig.mjs';
const [mode,key,input,...options]=process.argv.slice(2);
const worker=fileURLToPath(new URL('./prepare-sprite.py',import.meta.url));
const python=process.env.SPRITE_PYTHON??'python';
// Public appearance only; these descriptions do not disclose instance Reality.
const subjects={
 ...roomSpriteSubjects,
 'floor-lab':'A seamless swatch of clean light-gray laboratory floor with sparse subtle seams; no equipment, markings, drains, lights or heavy wear.',
 'floor-outdoor':'A seamless swatch of muted light earth and compacted gravel for a facility yard; fine sparse texture, no rocks large enough to read as props, vegetation, tracks or dramatic cracks.',
 'floor-fog':'A seamless neutral desaturated low-contrast material swatch for unrevealed ground; no clues to room type, objects or occupants.',
 wall:'One clean chunky neutral-gray sci-fi wall top strip with subtle bevels and straight repeatable ends; no doors, fixtures or tall visible facade.',
 corner:'One compact symmetric neutral-gray sci-fi wall junction post viewed from above, matching the wall material.',
 door:'A matching closed/open pair of neutral-gray facility doors. Closed state has a solid door leaf; open state removes the leaf and leaves the aperture transparent. Keep identical outer frame pixels in both states.',
 'door-open':'Use the matching closed/open facility-door pair; show the open aperture transparent and preserve the closed-state frame exactly.',
 gate:'A matching inactive/active pair of chunky neutral-gray sci-fi transit rings lying in the overhead viewing plane. Inactive center is transparent; active center contains a restrained cyan energy surface. Preserve identical ring pixels in both states.',
 'gate-open':'Use the matching inactive/active transit-ring pair; include the cyan energy surface and preserve the inactive ring exactly.',
 unknown:'One simple neutral unidentified-object marker with a compact abstract silhouette; no recognizable weapon, technology, lettering or question-mark UI.',
 civilian:'One ordinary adult civilian in neutral practical clothing, directly overhead in a relaxed north-facing pose; no insignia or hidden-role clues.',
 worker:'One facility worker in simple muted work clothes, directly overhead in a relaxed north-facing pose; no faction insignia.',
 guard:'One facility guard in simple muted security clothing with a compact protective vest, directly overhead in a relaxed north-facing pose; no aiming pose or faction insignia.',
 console:'One compact sci-fi control console showing its top control surface from directly above, with a few restrained cyan/amber indicators; no readable text.',
 generator:'One chunky enclosed technical machine with a readable simple top silhouette and restrained indicators; no specific scientific mechanism or hidden component shown.',
 'test-rig':'One compact laboratory test bench with simple top-mounted instrument housings; no specific experiment, sample identity or scientific finding shown.',
 crate:'One plain closed supply crate with a clean chunky silhouette, subtle lid seams and no contents or readable label.',
 bed:'One simple medical cot viewed directly overhead, with a light mattress and compact frame; no patient or equipment attached.',
 terminal:'One compact security terminal viewed directly overhead, showing the top control surface with restrained indicators; no readable screen content.',
 evidence:'One neutral closed document/evidence container viewed directly overhead; no exposed contents, readable labels or story clues.',
 medical:'One closed compact medical supply case viewed directly overhead; no contents, diagnosis or readable labels.',
 security:'One compact generic security-device housing viewed directly overhead; no hidden sensors, readable labels or identifiable technology.',
 rock:'One small simple muted natural rock viewed directly overhead with subtle local shading, no ground backdrop.',
 vegetation:'One compact patch of low muted-green vegetation viewed directly overhead, with a simple readable silhouette and no ground backdrop.'
};
for(const role of Object.keys(spriteManifest.professions))subjects[role.toLowerCase()]=`One ${role.toLowerCase()} party member in practical muted sci-fi field clothing, directly overhead in a relaxed north-facing pose. Use a readable mature human silhouette consistent with worker and guard; no faction insignia, aiming pose, text or hidden-role clues.`;
try{
 if(mode==='variants-refresh'){
  if(key!==undefined)throw Error('Usage: node prepare-sprite.mjs variants-refresh');
  const active=await migrateInstalledVariants(fileURLToPath(new URL('../../',import.meta.url)));
  console.log(`Recovered installed pools: ${Object.entries(active).map(([key,entry])=>`${key}=${entry.variants?.length??1}`).join(', ')}`);
 }else if(mode==='rig-prompts'){
  const args=[key,input,...options].filter(v=>v!==undefined);
  if(args.length&&!(args.length===2&&args[0]==='--out'&&args[1]))throw Error('Usage: node prepare-sprite.mjs rig-prompts [--out directory]');
  const out=resolve(args[1]??'artwork/sprite-prompts-v4/rig-proof-jointed');
  const entries=[...characterRigPrompts,{file:'README.md',text:characterRigChecklist},{file:'rig.json',text:JSON.stringify(rigSourceMetadata,null,2)+'\n'}];
  for(const entry of entries)if(existsSync(resolve(out,entry.file)))throw Error(`Refusing to replace existing prompt file: ${resolve(out,entry.file)}`);
  mkdirSync(out,{recursive:true});for(const entry of entries)writeFileSync(resolve(out,entry.file),entry.text,{encoding:'utf8',flag:'wx'});
  console.log(`Wrote ${characterRigPrompts.length} character rig prompts and source metadata: ${out}`);
 }else if(mode==='rig-prepare'){
  if(!key||input!=='--out'||options.length!==1)throw Error('Usage: node prepare-sprite.mjs rig-prepare <source-folder> --out <output-folder>');
  const out=resolve(options[0]),rigRoot=fileURLToPath(new URL('../shared/sprites/offworld/rigs/',import.meta.url));
  if(resolve(out,'..')!==resolve(rigRoot)||!/^[-a-zA-Z0-9_]+$/.test(out.split(/[\\/]/).at(-1)))throw Error('Rig output must be a named child of demos/shared/sprites/offworld/rigs');
  const result=spawnSync(python,[fileURLToPath(new URL('./prepare-character-rig.py',import.meta.url)),resolve(key),out,JSON.stringify({parts:rigParts,pivots:rigTemplate,parents:rigParents,order:rigOrder})],{encoding:'utf8'});
  if(result.error||result.status!==0)throw Error(result.error?.message??result.stderr.trim());process.stdout.write(result.stdout);
 }else if(mode==='head-prompts'){
  const args=[key,input,...options].filter(v=>v!==undefined);
  if(args.length&&!(args.length===2&&args[0]==='--out'&&args[1]))throw Error('Usage: node prepare-sprite.mjs head-prompts [--out directory]');
  const out=resolve(args[1]??'artwork/sprite-prompts-v4/head-kit');
  const entries=[...headKitPrompts,{file:'README.md',text:headKitChecklist}];
  for(const entry of entries)if(existsSync(resolve(out,entry.file)))throw Error(`Refusing to replace existing prompt file: ${resolve(out,entry.file)}`);
  mkdirSync(out,{recursive:true});for(const entry of entries)writeFileSync(resolve(out,entry.file),entry.text,{encoding:'utf8',flag:'wx'});
  console.log(`Wrote ${headKitPrompts.length} registered head-kit prompts: ${out}`);
 }else if(mode==='outstanding-prompts'){
  const args=[key,input,...options].filter(v=>v!==undefined);
  if(args.length!==2||args[0]!=='--out'||!args[1])throw Error('Usage: node prepare-sprite.mjs outstanding-prompts --out <fresh-directory>');
  const out=resolve(args[1]);
  const requests=outstandingSpriteRequests(spriteManifest.assets,spriteManifest.installed,src=>existsSync(fileURLToPath(new URL(src,import.meta.url))));
  const entries=requests.map(({key:id,reason},i)=>{
   const overlay=roomTilePrompts.find(prompt=>prompt.key===id);
   let text=overlay?.text;
   if(!text){
    const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'prompt',id],{encoding:'utf8'});
    if(result.status!==0)throw Error(result.stderr||`Prompt failed: ${id}`);
    text=result.stdout;
   }
   return {file:`${String(i+1).padStart(2,'0')}-${id}-prompt.txt`,text:`REGENERATION / ACQUISITION REASON: ${reason}\n\n${text}`};
  });
  entries.push({file:'README.md',text:'# Outstanding sprite acquisition and regeneration\n\nSnapshot of live installed PNG coverage plus explicit visual-review regeneration requests. Installed does not mean visually approved. Disabled variants and unavailable files do not count as coverage. Paired states are requested together. This command does not install or reject artwork. Refresh this queue into a fresh folder after installation; review flags remain until explicitly resolved after visual review.\n\n'+requests.map((request,i)=>`- [ ] ${entries[i].file} — ${request.reason}`).join('\n')+'\n\nRoom overlays require full-frame transparent extraction, not isolated-object cropping or opaque tile splitting. Generate three distinct variants and review against the complete prompt before installation.\n'});
  for(const entry of entries)if(existsSync(resolve(out,entry.file)))throw Error(`Refusing to replace existing prompt file: ${resolve(out,entry.file)}. Choose a fresh directory.`);
  mkdirSync(out,{recursive:true});
  for(const entry of entries)writeFileSync(resolve(out,entry.file),entry.text,{encoding:'utf8',flag:'wx'});
  console.log(`Wrote ${requests.length} outstanding prompts: ${out}`);
 }else if(mode==='room-kit-prompts'){
  const args=[key,input,...options].filter(v=>v!==undefined),kits=[];
  let output;
  for(let i=0;i<args.length;i+=2){
   if(!args[i+1])throw Error('Usage: node prepare-sprite.mjs room-kit-prompts [--kit <base-room-id>] --out <fresh-directory>');
   if(args[i]==='--kit')kits.push(args[i+1]);
   else if(args[i]==='--out'&&output===undefined)output=args[i+1];
   else throw Error(`Unknown or repeated option: ${args[i]}`);
  }
  if(!output)throw Error('room-kit-prompts requires --out <fresh-directory>');
  const ids=kits.length?[...new Set(kits)]:Object.keys(roomKitCatalog),out=resolve(output);
  const entries=[...roomKitPromptEntries(ids),{file:'README.md',text:roomKitChecklist(ids)},
   {file:'room-kits.json',text:JSON.stringify(roomKitMetadata(ids),null,2)+'\n'},
   {file:'registration-guide.svg',text:roomKitRegistrationGuide}];
  for(const entry of entries)if(existsSync(resolve(out,entry.file)))throw Error(`Refusing to replace existing prompt file: ${resolve(out,entry.file)}. Choose a fresh directory.`);
  mkdirSync(out,{recursive:true});
  for(const entry of entries)writeFileSync(resolve(out,entry.file),entry.text,{encoding:'utf8',flag:'wx'});
  console.log(`Wrote ${ids.length} coordinated room kits (${ids.length*18} prompts) and registration metadata: ${out}`);
 }else if(mode==='room-tile-prompts'){
  const args=[key,input,...options].filter(v=>v!==undefined);
  if(args.length&&!(args.length===2&&args[0]==='--out'&&args[1]))throw Error('Usage: node prepare-sprite.mjs room-tile-prompts [--out directory]');
  const out=resolve(args[1]??'artwork/room-tile-prompts-v1');
  const entries=[...roomTilePrompts,{file:'README.md',text:roomTileChecklist}];
  for(const entry of entries)if(existsSync(resolve(out,entry.file)))throw Error(`Refusing to replace existing prompt file: ${resolve(out,entry.file)}`);
  mkdirSync(out,{recursive:true});
  for(const entry of entries)writeFileSync(resolve(out,entry.file),entry.text,{encoding:'utf8',flag:'wx'});
  console.log(`Wrote ${roomTilePrompts.length} three-tile sheet prompts: ${out}`);
 }else if(mode==='prompts'||mode==='room-prompts'){
  const roomsOnly=mode==='room-prompts';
  const args=[key,input,...options].filter(v=>v!==undefined);
  if(args.length&&!(args.length===2&&args[0]==='--out'&&args[1]))throw Error(`Usage: node prepare-sprite.mjs ${mode} [--out directory]`);
  const out=resolve(args[1]??(roomsOnly?'artwork/room-sprite-prompts-v1':'artwork/sprite-prompts'));
  const priority=['floor-indoor','floor-outdoor','wall','corner','door','gate','console','generator','worker','guard'];
  const roomKeys=roomSpriteAssets.map(([id])=>id);
  const keys=roomsOnly?[...roomKeys.filter(id=>!id.startsWith('floor-')),...roomKeys.filter(id=>id.startsWith('floor-'))]:[...priority,...Object.keys(spriteManifest.assets).filter(id=>!spriteManifest.assets[id].preserveFrame&&!priority.includes(id)&&!['door-open','gate-open'].includes(id))];
  const files=keys.map((id,i)=>`${String(i+1).padStart(2,'0')}-${id}-prompt.txt`);
  const profileFiles=roomsOnly?[]:characterArtKeys.map(id=>`profiles/${id}-profile-prompt.txt`);
  for(const file of [...files,...profileFiles,'README.md'])if(existsSync(resolve(out,file)))throw Error(`Refusing to replace existing prompt file: ${resolve(out,file)}. Choose a new --out directory.`);
  const prompts=keys.map(id=>{
   const result=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'prompt',id],{encoding:'utf8'});
   if(result.status!==0)throw Error(result.stderr.trim()||`Prompt failed: ${id}`);return result.stdout;
  });
  mkdirSync(out,{recursive:true});
  files.forEach((file,i)=>writeFileSync(resolve(out,file),prompts[i],{encoding:'utf8',flag:'wx'}));
  if(profileFiles.length)mkdirSync(resolve(out,'profiles'),{recursive:true});
  profileFiles.forEach((file,i)=>writeFileSync(resolve(out,file),profilePrompt(characterArtKeys[i]),{encoding:'utf8',flag:'wx'}));
  const checklist='# Sprite prompt upload checklist\n\nUpload each numbered .txt separately, in order. Keep the same art-direction references across chats. Each request produces three different shape/design styles, not colorways: clean angular, soft rounded, chunky layered/utilitarian, with subject-appropriate natural/floor equivalents. Keep palettes fixed and review major shape differences at runtime size and in grayscale. Featureless subjects may limit meaningful variation; do not invent new content to force it. Door and Gate prompts each request both matching states (six PNGs); do not generate their open states independently. Review art and validate delivery before installation. These ordinary whole-sprite variants are not registered rig/head-kit parts; use those separate workflows for layers.\n\n'+keys.map((id,i)=>`- [ ] ${files[i]} — ${id}${spriteManifest.assets[id].pair?` + ${spriteManifest.assets[id].pair}`:''}`).join('\n')+'\n';
  const supplement=roomsOnly?'\n## Room-only queue\n\nSix decorative furnishings first, then 13 seamless geology materials. All keys already exist in the shared manifest and Room Sandbox mappings. No new items, Services, room rules or hidden scientific identity are authored by these images. Reuse existing floors, walls, corners, doors, Gate, consoles, crates, beds and people from your installed library; this queue covers the additional room assets only. Each request delivers three canonical named source PNGs in its own ZIP. Load the ZIP in Sprite Viewer, review and install keepers, then refresh Room Sandbox. Geological art depicts only the requested existing state; do not add hazards or clues. No character/portrait/rig requests are included here.\n':'\n## Matching profile pictures\n\nCharacter prompts use the same material palette. Generate each overhead batch first, then upload its three named source PNGs with the corresponding profiles/<class>-profile-prompt.txt. Use exact RGB bases and the five allowed shading tones in every matched view. Existing downloads can serve as geometry/identity references, but normalize both new overhead and portrait outputs to the strict source palette; retain the originals unchanged. Profile ZIPs are separate source deliveries; the current viewer/installer does not ingest them.\n\n'+profileFiles.map(file=>`- [ ] ${file}`).join('\n')+'\n';
  writeFileSync(resolve(out,'README.md'),checklist+supplement,{encoding:'utf8',flag:'wx'});
  console.log(`Wrote ${keys.length} prompts covering ${roomsOnly?'additional room':`all ${Object.values(spriteManifest.assets).filter(entry=>!entry.preserveFrame).length}`} assets: ${out}`);
 }else if(mode==='profile-prompt'){
  if(input!==undefined&&(input!=='--out'||options.length!==1||!options[0]))throw Error('Usage: node prepare-sprite.mjs profile-prompt <character-key> [--out prompt.txt]');
  const prompt=profilePrompt(key);
  if(input==='--out'){writeFileSync(resolve(options[0]),prompt,'utf8');console.log(`Prompt written: ${options[0]}`);}else process.stdout.write(prompt);
 }else if(mode==='split-sheet'){
  const entry=spriteManifest.assets[key];
  if(!entry||!input)throw Error('Usage: node prepare-sprite.mjs split-sheet <asset-key> <sheet.png> --batch <new-batch> [--out artwork-root] [--background #ffffff] [--tolerance 5]');
  if(entry.opaque||entry.pair||entry.preserveFrame)throw Error('Sheet splitting supports isolated sprites only, not floors, room overlays or registered Door/Gate pairs.');
  const result=spawnSync(python,[fileURLToPath(new URL('./split-sprite-sheet.py',import.meta.url)),JSON.stringify({...entry,key}),resolve(input),...options],{encoding:'utf8'});
  if(result.error)throw result.error;
  process.stdout.write(result.stdout??'');if(result.status!==0)throw Error(result.stderr.trim()||'Sheet splitting failed.');
 }else if(mode==='unpack'){
  const result=spawnSync(python,[fileURLToPath(new URL('./unpack-sprites.py',import.meta.url)),'-',key,...[input,...options].filter(v=>v!==undefined)],{encoding:'utf8',input:JSON.stringify(spriteManifest.assets)});
  if(result.error)throw result.error;process.stdout.write(result.stdout??'');if(result.status!==0)throw Error(result.stderr.trim()||'ZIP validation failed.');
 }else if(mode==='prompt'){
  const entry=spriteManifest.assets[key];if(!entry)throw Error('prompt requires an existing asset key.');
  if(input!==undefined&&(input!=='--out'||options.length!==1||!options[0]))throw Error('Usage: node prepare-sprite.mjs prompt <asset-key> [--out prompt.txt]');
  const group=['door','door-open'].includes(key)?'door':['gate','gate-open'].includes(key)?'gate':key;
  const packaging=`BATCH PACKAGING: Produce exactly three visual variants v01, v02, v03.
ZIP FILENAME: orionis-${group}-b001.zip (increment b002, b003 for later batches)
ZIP ROOT FOLDER: orionis-${group}-b001/
SOURCE FILENAMES: ${group===key&&!entry.pair?`${key}__v01__source.png, ${key}__v02__source.png, ${key}__v03__source.png`:`${group}__vNN__source.png and ${group}-open__vNN__source.png for NN=01,02,03`}
VARIATION: Follow the three shape/design style briefs below, not colorway swaps. Preserve camera, subject scale, pivot, lighting and occupied footprint envelope. State pairs must match within each variant. No gameplay/identity changes.
ARCHIVE CONTENTS: PNG source files only inside the named root; no previews, contact sheets, nested folders or extra files. Attach an actual ZIP, not an image of filenames.
If ZIP/file export is unavailable, say so and deliver separate PNG files with these exact names; do not claim an archive exists.
`;
  const specification=`ASSET ID: ${key}
OUTPUT FILENAME: ${key}__vNN__source.png (NN=01,02,03)
SOURCE ART SIZE: 1024x1024 PNG, single frame
RUNTIME FILENAME: ${entry.runtimeFile}
RUNTIME SIZE: ${entry.runtimePixels.join('x')} pixels; ${entry.displaySize.join('x')} SVG world units
BACKGROUND: ${entry.opaque?'Fully opaque seamless tile':'True RGBA transparency; no baked backdrop'}
CAMERA: Direct overhead, north up; no isometric or front-facing surfaces
ORIENTATION: ${key==='wall'||key.startsWith('door')?'Horizontal long axis, left to right':'North-facing neutral overhead'}
VISIBLE FOOTPRINT: ${entry.pair?(key.startsWith('gate')?'Registered ring bounds [112,112,912,912] on source canvas':'Registered frame bounds [112,320,912,704] on source canvas'):key==='wall'?'Centered horizontal strip, approximately 960x90 source pixels':entry.opaque?'Full canvas, seamless edges':'One isolated subject, preserve aspect ratio; tool centers its alpha bounds'}
PIVOT: [0.5, 0.5], canvas center
PADDING: ${entry.opaque?'None; material fills every pixel to all four edges':`${entry.padding}px minimum transparent runtime border; ${entry.pair?'preserve shared source canvas and frame exactly':'normalizer supplies border for isolated sprites'}`}
SHADOW: ${entry.opaque?'None; seamless opaque material only':'Tight centered translucent contact shadow; no directional cast shadow or backdrop'}
LIGHTING: ${entry.opaque?'Uniform diffuse illumination across the entire canvas; no bright corner, dark edge, vignette or broad directional gradient':'Soft upper-left, low contrast; walls/doors/characters must tolerate 90-degree rotation'}
ROTATION POLICY: ${key==='wall'||key.startsWith('door')?'Programmatic 90 degrees':spriteManifest.professions[key.toUpperCase()]||['worker','guard','civilian'].includes(key)?'Programmatic 90 degrees for down/dead; no direction variants':'No directional variants; fixed orientation'}
MATCHING ASSET: ${entry.pair??'None'}
ART DIRECTION: Bright clean chunky mature stylized 2D sci-fi, simplified painted materials, low noise${entry.opaque?', quiet low-contrast ground beneath characters and props':', controlled cyan/amber emissives'}
SPECIAL REQUIREMENTS: ${key==='gate-open'?'Energy surface included in this image; preserve the inactive ring':key.startsWith('door')?'Reuse identical outer frame pixels; source aperture bounds [256,352,768,672]; leave open aperture transparent':entry.pair?'Reuse identical frame pixels and outer silhouette from matching state':key.startsWith('floor-')?'No props, walls, labels, baked shadows or identity information':'No UI, labels, scripts or hidden technology/identity cues'}
SUBJECT DETAILS: ${key==='floor-indoor'?'A seamless repeatable swatch of light neutral cool-gray sci-fi facility floor. Broad plain matte panels with sparse thin low-contrast seams and barely visible surface variation. No outer frame, raised border, vents, light strips, emissives, bolts, large cracks or heavy grunge. This is floor material, not a room illustration or an assembly of machines. Keep characters and props visually dominant.':subjects[key]??'[supply the public visual subject for this asset]'}${entry.opaque?'\nTILING CHECK: Match the pattern, color and brightness at opposite edges. Inspect a 3x3 repeat before delivery; no visible tile boundary, lighting stripe or repeating bright/dark corner. Tiling is a visual check, not established by a square canvas.':''}`;
  const workflow=entry.opaque
   ?'ASSET-SPECIFIC PRODUCTION WORKFLOW: Generate three separate full-canvas opaque seamless floor sources. Do not use a transparent three-column sheet, isolate subjects or add padding. Follow the tiling check below.\n'
   :entry.pair
   ?'ASSET-SPECIFIC PRODUCTION WORKFLOW: Generate three registered matching-state pairs (six separate source PNGs). Preserve the shared canvas, frame pixels and prescribed bounds across each pair. Do not independently crop or recenter states, or use the ordinary three-column extraction workflow.\n'
   :`## Image Generation and Packaging Workflow

Generate one reference image containing exactly three variations of the requested asset, arranged horizontally in three clearly separated columns.

Each variation must:
- Follow the locked Stargate Orionis art direction.
- Show one complete subject, with nothing clipped.
- Use exactly the same overhead camera, lighting direction, scale, and footprint.
- Have a clear gap separating it from neighboring variations.
- Use a transparent background.
- Use the assigned v01/v02/v03 shape/design style; palette swaps and tiny surface-detail changes do not count as distinct variants.

The generated image is an intermediate production sheet, not the delivered asset.

After generation:
1. Extract each variation into a separate image.
2. Remove the surrounding background, preserving true RGBA transparency.
3. Center each subject on its own 1024×1024 transparent canvas.
4. Preserve proportions without stretching.
5. Validate transparency, padding, dimensions, and complete silhouettes.
6. Save as ${['01','02','03'].map(v=>`\`${key}__v${v}__source.png\``).join(', ')}.
7. Package the three PNGs in \`orionis-${group}-bNNN.zip\` under a root folder matching the ZIP filename without \`.zip\` (use the batch number specified below).
8. Verify the ZIP and provide a clickable download link.

Do not include the intermediate sheet, previews, or any additional files in the archive.

For seamless floors and registered state pairs, use their asset-specific production workflows instead.
`;
  const prompt=workflow+'\n'+packaging+'\n'+specification+'\n'+spriteVariantInstructions(key,entry)+'\n'+(characterArtKeys.includes(key)?characterPaletteInstructions()+'\nMATCHED PORTRAITS: retain each final variant as the exact visual reference for its matching profile picture. Keep anatomy, pose and equipment attachment slots consistent across variants; vary clothing design and existing accessory shapes according to the style briefs. Palette assignments stay fixed.\n':'');
  if(input==='--out'){writeFileSync(resolve(options[0]),prompt,'utf8');console.log(`Prompt written: ${options[0]}`);}else process.stdout.write(prompt);
 }else if(mode==='validate-manifest'){
  for(const [id,entry] of Object.entries(spriteManifest.assets)){
   const path=fileURLToPath(new URL(entry.src,import.meta.url));
   const result=spawnSync(python,[worker,'manifest',JSON.stringify({...entry,key:id}),path],{encoding:'utf8'});
   if(result.error||result.status!==0)throw Error(result.error?.message??result.stderr.trim());
   process.stdout.write(result.stdout);
  }
 }else{
  if(!['prepare','validate'].includes(mode)||!spriteManifest.assets[key]||!input)throw Error('Usage: node prepare-sprite.mjs prepare|validate <asset-key> <file.png> [--out file.png] [--pair partner.png] [--overwrite]\n       node prepare-sprite.mjs validate-manifest');
  if(mode==='prepare')await assertSpriteCandidateAllowed(fileURLToPath(new URL('../../',import.meta.url)),resolve(input));
  const entry=spriteManifest.assets[key],out=fileURLToPath(new URL(`../shared/sprites/offworld/production/${entry.runtimeFile}`,import.meta.url));
  const result=spawnSync(python,[worker,mode,JSON.stringify({...entry,key,out}),resolve(input),...options],{encoding:'utf8'});
  if(result.error)throw result.error;
  process.stdout.write(result.stdout??'');if(result.status!==0)throw Error(result.stderr.trim()||'Sprite worker failed.');
 }
}catch(error){console.error(error.message);process.exitCode=1;}
