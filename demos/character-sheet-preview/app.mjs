import {hitLayer,poseStudy,headCenteredView} from './model.mjs';
import {samplePose,animationBounds} from './spriter.mjs';
import {normalWalk,fitShirtArms} from './normal-walk.mjs';
import {materialPixels} from './material-colors.mjs';
import {validateHeadVariants,headPlacement} from './head-variants.mjs';
const $=id=>document.getElementById(id),root=new URL('../../artwork/zombie-tds-main-characters/',import.meta.url),originalImages=new Map();
let images=originalImages,technicianImages=null;
let maskPack=null,maskSources=new Map();
let headVariants=[],activeHead=null,plainParts=[];
const limbChoices=new Map();
const limbSlots=['center-torso','left-upper-arm','left-forearm','right-upper-arm','right-forearm','left-leg','right-leg'];
const limbSlot=z=>({0:'left-leg',1:'right-leg',2:'center-torso',3:'left-upper-arm',4:'left-forearm',5:'right-forearm',7:'right-upper-arm'})[z]??null;
function limbChoice(slot){return limbChoices.get(`${character.name}:${slot}`)??($('limbSet').value==='original'?'original':'plain');}
function syncArmFit(){
 if(animation?.name!=='Walk_normal')return;
 animation=limbChoice('center-torso')==='original'?character.animations.find(a=>a.name==='Walk_normal'):character.shirtWalk;
 bounds=animationBounds(character,animation);
}
function limbImage(file,z){
 const slot=limbSlot(z),variant=slot?limbChoice(slot):'original';
 const part=animation?.name==='Walk_normal'&&variant!=='original'?plainParts.find(p=>p.character===character.name&&p.z===z&&p.source===file&&(p.variant??'plain')===variant):null;
 return images.get(part?.src??file);
}
function renderLimbTiles(){
 if(!character)return;
 const container=$('limbTiles');container.replaceChildren();
 const local=plainParts.filter(p=>p.character===character.name);
 if(!local.length){container.textContent='Prepare the local limb pack to show options.';return;}
 for(const slot of limbSlots){
  const [side,...kind]=slot.split('-'),type=kind.join('-'),section=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=type==='torso'?'Torso':`${side==='left'?'Left':'Right'} ${type==='upper-arm'?'upper arm':type==='forearm'?'lower arm':type}`;section.append(legend);
  const choices=type==='torso'?['original',...new Set(local.filter(p=>p.part==='torso').map(p=>p.variant??'plain'))]:['upper-arm','forearm'].includes(type)?['original','plain','short','long']:['original','plain','compact'];
  for(const variant of choices){
   const candidates=local.filter(p=>p.side===side&&(type==='leg'?p.part.startsWith('leg-'):p.part===type)&&(p.variant??'plain')===(variant==='original'?'plain':variant));
   if(type==='leg')candidates.sort((a,b)=>b.height-a.height).splice(1);
   if(!candidates.length)continue;
   const button=document.createElement('button');button.type='button';button.className='limb-tile';button.dataset.slot=slot;button.dataset.variant=variant;button.setAttribute('aria-pressed',String(limbChoice(slot)===variant));button.disabled=animation?.name!=='Walk_normal';
   const canvas=document.createElement('canvas');canvas.width=88;canvas.height=100;const ctx=canvas.getContext('2d');checker(ctx);
   for(let i=0;i<candidates.length;i++){
    const im=images.get(variant==='original'?candidates[i].source:candidates[i].src);if(!im)continue;
    const w=88/candidates.length,scale=Math.min((w-4)/im.width,90/im.height);ctx.drawImage(im,i*w+(w-im.width*scale)/2,(100-im.height*scale)/2,im.width*scale,im.height*scale);
   }
   const label=document.createElement('span');label.textContent=({original:'Authored',plain:type==='torso'?'No backpack':'Plain',short:type==='forearm'?'Bare':'Short sleeve',long:type==='forearm'?'Sleeved':'Long sleeve'})[variant]??candidates[0].label??variant;button.append(canvas,label);
   button.onclick=()=>{limbChoices.set(`${character.name}:${slot}`,variant);$('limbSet').value='custom';syncArmFit();renderLimbTiles();drawAnimation();};section.append(button);
  }
  container.append(section);
 }
 $('limbTilesNote').textContent=animation?.name==='Walk_normal'?'Choose each limb segment independently. Leg choices include both stride frames.':'Limb tiles apply to Normal walk · unarmed.';
}
function rebuildColors(){
 if(!maskPack)return;
 const colors=Object.fromEntries(Object.keys(maskPack.materials).map(name=>[name,$(`color-${name}`).value]));
 for(const [file,entry] of maskSources){
  if(entry.fixed){technicianImages.set(file,originalImages.get(file));continue;}
  const canvas=document.createElement('canvas');canvas.width=entry.width;canvas.height=entry.height;
  canvas.getContext('2d').putImageData(new ImageData(materialPixels(entry.pixels,entry.ids,maskPack.materials,entry.references,colors,{review:$('maskReview').checked}),entry.width,entry.height),0,0);
  technicianImages.set(file,canvas);
 }
 if(character&&$('skin').value==='technician'){images=technicianImages;drawAnimation();drawAssembly();}
 rebuildHeadColors();renderLimbTiles();
}
function rebuildHeadColors(){
 const materials={skin:{id:5,color:'#d59b70'},hair:{id:6,color:'#704322'},accessories:{id:3,color:'#62676b'}};
 const colors=Object.fromEntries(Object.keys(materials).map(name=>[name,(name==='accessories'?$('headColor-accessories'):$(`color-${name}`))?.value??materials[name].color]));
 for(const variant of headVariants)for(const [file,entry] of variant.maskSources??[]){
  if(!$('headColorsEnabled').checked&&!$('maskReview').checked){variant.images.set(file,entry.original);continue;}
  const canvas=document.createElement('canvas');canvas.width=entry.width;canvas.height=entry.height;
  canvas.getContext('2d').putImageData(new ImageData(materialPixels(entry.pixels,entry.ids,materials,entry.references,colors,{review:$('maskReview').checked}),entry.width,entry.height),0,0);variant.images.set(file,canvas);
 }
 if(character){drawAnimation();drawAssembly();}
}
let characters,character,animation,bounds,time=0,playing=true,last=0,layers=[],selected=null,nextId=1,parts=[];
const option=(value,label)=>new Option(label,value);
function checker(ctx){
 for(let x=0;x<ctx.canvas.width;x+=12)for(let y=0;y<ctx.canvas.height;y+=12){ctx.fillStyle=(x/12+y/12)%2?'#9ba8b0':'#7b8993';ctx.fillRect(x,y,12,12);}
 ctx.imageSmoothingEnabled=false;
}
function drawAnimation(){
 const pose=samplePose(character,animation,time),ctx=$('animation').getContext('2d'),[left,bottom,right,top]=bounds;
 // A constant rest-frame camera preserves the authored bob without resizing
 // the whole character or chasing its head on every animation frame.
 const view=headCenteredView(samplePose(character,animation,0),bounds,Number($('zoom').value));
 const fit=view?.scale??Math.min(420/Math.max(1,right-left),420/Math.max(1,top-bottom))*Number($('zoom').value);checker(ctx);
 if($('crop').checked&&animation.frames.length){
  const index=Math.min(animation.frames.length-1,Math.floor(time/animation.length*animation.frames.length)),im=images.get(animation.frames[index]);
  const scale=Math.min(420/im.width,420/im.height)*Number($('zoom').value);ctx.drawImage(im,240-im.width*scale/2,240-im.height*scale/2,im.width*scale,im.height*scale);
  $('animation').dataset.frame=animation.frames[index];
 }else{
  const [cx,cy]=view?.center??[(left+right)/2,(bottom+top)/2];
  ctx.save();ctx.translate(240-cx*fit,240+cy*fit);ctx.scale(fit,fit);ctx.imageSmoothingEnabled=true;
  $('animation').dataset.headCenter=view?'240,240':'';
  $('animation').dataset.viewScale=String(fit);
  $('animation').dataset.viewCenter=String(view?.center??[(left+right)/2,(bottom+top)/2]);
  for(const o of pose.objects){const placed=headPlacement(o.file.src,limbImage(o.file.src,o.z),activeHead,animation.name),im=placed.image;ctx.save();ctx.translate(o.x,-o.y);ctx.rotate(-o.angle*Math.PI/180);ctx.scale(o.scale_x,o.scale_y);ctx.globalAlpha=Math.max(0,Math.min(1,o.a));ctx.drawImage(im,-o.pivot_x*placed.size[0]-placed.offset[0],-(1-o.pivot_y)*placed.size[1]-placed.offset[1]);ctx.restore();}
  if($('bones').checked){ctx.strokeStyle='#00ffff';ctx.fillStyle='#ffff66';ctx.lineWidth=1.5/fit;for(const bone of pose.bones){const parent=pose.bones.find(b=>b.id===bone.parent);if(parent){ctx.beginPath();ctx.moveTo(parent.x,-parent.y);ctx.lineTo(bone.x,-bone.y);ctx.stroke();}ctx.beginPath();ctx.arc(bone.x,-bone.y,2.5/fit,0,Math.PI*2);ctx.fill();}}
  ctx.restore();$('animation').dataset.frame=`${character.name}/${animation.name}/${Math.round(time)}`;
 }
 $('animation').dataset.bones=String(pose.bones.length);$('animation').dataset.objects=String(pose.objects.length);$('animation').dataset.skin=$('skin').value;
 $('animation').dataset.head=activeHead?.id??'original';
 $('time').value=String(time);$('frameStatus').textContent=`${character.name} · ${animation.name} · ${Math.round(time)} / ${animation.length} ms · ${pose.bones.length} bones · ${pose.objects.length} parts · ${animation.derived?'preview normal-walk loop':animation.looping?'authored loop':'authored one-shot'}${$('crop').checked?' · PNG frame timing approximated':''}`;
}
function drawAssembly(){
 const ctx=$('assembly').getContext('2d');checker(ctx);
 for(const l of layers){const placed=headPlacement(l.file,images.get(l.file),activeHead),im=placed.image;ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.angle*Math.PI/180);ctx.scale(l.scale,l.scale);ctx.drawImage(im,-l.pivot[0]-placed.offset[0],-l.pivot[1]-placed.offset[1]);
  if(l.id===selected){ctx.strokeStyle='#00eeff';ctx.lineWidth=1/l.scale;ctx.strokeRect(-l.pivot[0]-placed.offset[0],-l.pivot[1]-placed.offset[1],im.width,im.height);ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(3,0);ctx.moveTo(0,-3);ctx.lineTo(0,3);ctx.stroke();}ctx.restore();}
 $('assembly').dataset.layers=String(layers.length);
}
function sync(){
 $('layer').replaceChildren(...layers.slice().reverse().map(l=>option(l.id,`${l.name} #${l.id}`)));$('layer').value=String(selected??'');
 const l=layers.find(l=>l.id===selected);for(const id of ['rotation','partScale','pivotX','pivotY','forward','remove'])$(id).disabled=!l;
 if(l){$('rotation').value=l.angle;$('partScale').value=l.scale;$('pivotX').value=l.pivot[0];$('pivotY').value=l.pivot[1];}
 drawAssembly();
}
function tick(now){const delta=last?Math.min(100,now-last):0;last=now;if(playing){time+=delta*Number($('speed').value);if(time>=animation.length){if(animation.looping||$('repeat').checked)time%=animation.length;else{time=animation.length;playing=false;$('play').textContent='Play';}}drawAnimation();}requestAnimationFrame(tick);}
function syncComparison(){ $('crop').disabled=!animation.frames.length||images!==originalImages||!!activeHead;if($('crop').disabled)$('crop').checked=false; }
function chooseSkin(){images=$('skin').value==='technician'?technicianImages:originalImages;syncComparison();drawAnimation();drawAssembly();renderLimbTiles();}
function chooseAnimation(){animation=character.animations.find(a=>a.name===$('action').value);syncArmFit();bounds=animationBounds(character,animation);time=0;last=0;$('time').max=animation.length;syncComparison();drawAnimation();renderLimbTiles();}
function chooseCharacter(){
 character=characters.find(c=>c.name===$('character').value);
 activeHead=null;$('headVariant').replaceChildren(option('original','Original head'),...headVariants.filter(v=>v.character===character.name).map(v=>option(v.id,v.label)));$('headVariant').value='original';
 $('action').replaceChildren(...character.animations.map(a=>option(a.name,a.derived?'Normal walk · unarmed':a.name)));$('action').value='Walk_normal';
 parts=[...Object.values(character.files),...plainParts.filter(p=>p.character===character.name)].sort((a,b)=>a.name.localeCompare(b.name));$('part').replaceChildren(...parts.map(p=>option(p.src,p.name)));
 layers=[];selected=null;sync();chooseAnimation();
 $('status').textContent=`Ready: ${character.name} · 11 authored animations + normal walk · ${parts.length} parts. Skin applies to playback and workbench. Workbench changes stay in this tab.`;
}
function pointer(e){const rect=$('assembly').getBoundingClientRect();return [(e.clientX-rect.left)*480/rect.width,(e.clientY-rect.top)*480/rect.height];}
let drag=null;
$('assembly').addEventListener('pointerdown',e=>{const [x,y]=pointer(e),pickingImages=new Map(images),pickingLayers=layers.map(l=>{const placed=headPlacement(l.file,images.get(l.file),activeHead);pickingImages.set(l.file,placed.image);return {...l,pivot:[l.pivot[0]+placed.offset[0],l.pivot[1]+placed.offset[1]]};}),l=hitLayer(pickingLayers,pickingImages,x,y);if(!l)return;selected=l.id;drag=[x-l.x,y-l.y];$('assembly').setPointerCapture(e.pointerId);sync();});
$('assembly').addEventListener('pointermove',e=>{if(!drag)return;const l=layers.find(l=>l.id===selected),[x,y]=pointer(e);l.x=x-drag[0];l.y=y-drag[1];drawAssembly();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('assembly').addEventListener(event,()=>drag=null);
try{
 const response=await fetch(new URL('preview-data.json',root));if(!response.ok)throw Error('Run python demos/character-sheet-preview/import-pack.py after placing your purchased pack in artwork/zombie-tds-main-characters.');const data=await response.json();
 characters=data.characters.map(c=>{const walk=normalWalk(c);return {...c,shirtWalk:fitShirtArms(c,walk),animations:[walk,...c.animations]};});
 const paths=new Set(characters.flatMap(c=>[...Object.values(c.files).map(f=>f.src),...c.animations.flatMap(a=>a.frames)]));
 await Promise.all([...paths].map(async file=>{const im=new Image();im.src=new URL(file.split('/').map(encodeURIComponent).join('/'),root);await im.decode();images.set(file,im);}));
 // Optional local skin pack. Keep all original rig/file metadata and pivots.
 try{
  const skinResponse=await fetch(new URL('technician-reskin-v01/skin.json',root));
  if(skinResponse.ok){
   const skin=await skinResponse.json(),candidate=new Map(originalImages);
   const partPaths=new Set(characters.flatMap(c=>Object.values(c.files).map(f=>f.src)));
   await Promise.all([...partPaths].map(async file=>{
    if(!skin.files[file])throw Error(`Missing skin part: ${file}`);
    const im=new Image();im.src=new URL(skin.files[file].split('/').map(encodeURIComponent).join('/'),root);await im.decode();
    const original=originalImages.get(file);if(im.width!==original.width||im.height!==original.height)throw Error(`Skin size mismatch: ${file}`);
    candidate.set(file,im);
   }));
   technicianImages=candidate;$('skin').append(option('technician','Technician'));$('skin').value='technician';images=technicianImages;
  }
 }catch(error){$('skinNote').textContent=`Technician skin unavailable: ${error.message}`;}
 try{
  const response=await fetch(new URL('material-masks-v01/masks.json',root));
  if(response.ok&&technicianImages){
   const pack=await response.json(),candidate=new Map();
   for(const file of new Set(characters.flatMap(c=>Object.values(c.files).map(f=>f.src)))){
    const entry=pack.files[file];if(!entry)throw Error(`Missing mask: ${file}`);
    if(entry.fixed){
     candidate.set(file,{fixed:true});continue;
    }
    const map=new Image();map.src=new URL(entry.map.split('/').map(encodeURIComponent).join('/'),root);await map.decode();
    const im=originalImages.get(file);if(map.width!==im.width||map.height!==im.height)throw Error(`Mask size mismatch: ${file}`);
    const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d');
    ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,im.width,im.height).data;
    ctx.clearRect(0,0,im.width,im.height);ctx.drawImage(map,0,0);const rgba=ctx.getImageData(0,0,im.width,im.height).data;
    candidate.set(file,{pixels,ids:Uint8Array.from({length:im.width*im.height},(_,i)=>rgba[i*4]),width:im.width,height:im.height,references:entry.references});
   }
   maskPack=pack;maskSources=candidate;$('materialControls').hidden=false;
   for(const [name,m] of Object.entries(pack.materials)){
    const label=document.createElement('label');label.textContent=name+' ';const input=document.createElement('input');input.type='color';input.id=`color-${name}`;input.value=m.color;input.oninput=rebuildColors;label.append(input);$('materialColors').append(label);
   }
   $('maskReview').oninput=rebuildColors;rebuildColors();
  }
 }catch(error){$('skinNote').textContent=`Using saved technician colors; material masks unavailable: ${error.message}`;}
 $('skin').disabled=false;$('skin').onchange=chooseSkin;
 try{
  const folder=new URL('head-variants/',root),response=await fetch(new URL('index.json',folder));
  if(response.ok){
   const registered=validateHeadVariants(await response.json(),characters);
   for(const variant of registered){
    try{
     const loaded=new Map(),headMasks=new Map();
     for(const [file,path] of Object.entries(variant.replacements)){
      const im=new Image();im.src=new URL(path.split('/').map(encodeURIComponent).join('/'),folder);await im.decode();
      const original=originalImages.get(file),registration=variant.registration?.[file];
      if(registration){if(im.width<registration.offset[0]+original.width||im.height<registration.offset[1]+original.height)throw Error('Padded canvas does not contain original frame');}
      else if(im.width!==original.width||im.height!==original.height)throw Error(`Canvas must match ${original.width}×${original.height}`);
      loaded.set(file,im);
      const mask=variant.masks?.[file];if(mask){
       const map=new Image();map.src=new URL(mask.path.split('/').map(encodeURIComponent).join('/'),folder);await map.decode();if(map.width!==im.width||map.height!==im.height)throw Error('Head mask size mismatch');
       const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,im.width,im.height).data;ctx.clearRect(0,0,im.width,im.height);ctx.drawImage(map,0,0);const rgba=ctx.getImageData(0,0,im.width,im.height).data;
       headMasks.set(file,{original:im,pixels,ids:Uint8Array.from({length:im.width*im.height},(_,i)=>rgba[i*4]),width:im.width,height:im.height,references:mask.references});
      }
     }
     headVariants.push({...variant,images:loaded,maskSources:headMasks});
    }catch(error){$('headNote').textContent=`Skipped ${variant.label}: ${error.message}`;}
   }
  }
 }catch(error){$('headNote').textContent=`Head variants unavailable: ${error.message}`;}
 $('headVariant').disabled=false;$('headVariant').onchange=()=>{activeHead=headVariants.find(v=>v.id===$('headVariant').value)??null;syncComparison();drawAnimation();drawAssembly();};
 for(const id of ['headColorsEnabled','headColor-accessories'])$(id).oninput=rebuildHeadColors;
 // Optional side-specific plain limb pack. Originals and SCML stay immutable.
 try{
  const response=await fetch(new URL('plain-limbs-v01/index.json',root));
  if(response.ok){
   const pack=await response.json();if(pack.format!=='plain-limbs-v1')throw Error('Unsupported plain limb pack');
   const loaded=[];
   for(const part of pack.parts){
    if(!['Man','Girl'].includes(part.character)||!(['left','right'].includes(part.side)||(part.side==='center'&&part.part==='torso'&&part.z===2))||!part.src.startsWith('plain-limbs-v01/')||part.src.includes('..')||!part.map.startsWith('plain-limbs-v01/')||part.map.includes('..'))throw Error('Invalid plain limb entry');
    const original=originalImages.get(part.source);if(!original)throw Error('Unknown limb source');
    const im=new Image();im.src=new URL(part.src,root);await im.decode();
    if(im.width!==original.width||im.height!==original.height)throw Error('Plain limb registration mismatch');
    const map=new Image();map.src=new URL(part.map,root);await map.decode();if(map.width!==im.width||map.height!==im.height)throw Error('Plain limb mask size mismatch');
    const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,im.width,im.height).data;ctx.clearRect(0,0,im.width,im.height);ctx.drawImage(map,0,0);const rgba=ctx.getImageData(0,0,im.width,im.height).data;
    loaded.push({part,im,entry:{pixels,ids:Uint8Array.from({length:im.width*im.height},(_,i)=>rgba[i*4]),width:im.width,height:im.height,references:part.references}});
   }
   for(const {part,im,entry} of loaded){originalImages.set(part.src,im);technicianImages?.set(part.src,im);maskSources.set(part.src,entry);}
   plainParts=loaded.map(x=>x.part);$('limbSet').append(option('plain','Plain · separate left/right'));$('limbSet').value='plain';$('limbSet').disabled=false;rebuildColors();
  }
 }catch(error){$('limbNote').textContent=`Plain limbs unavailable: ${error.message}`;}
 const custom=option('custom','Custom · tiles');custom.disabled=true;$('limbSet').append(custom);
 $('limbSet').onchange=()=>{for(const slot of limbSlots)limbChoices.delete(`${character.name}:${slot}`);syncArmFit();renderLimbTiles();drawAnimation();};
 $('character').replaceChildren(...characters.map(c=>option(c.name,c.name)));$('character').value='Man';
 for(const id of ['play','step','add','reset','export'])$(id).disabled=false;
 $('play').onclick=()=>{playing=!playing;if(playing&&time>=animation.length)time=0;$('play').textContent=playing?'Pause':'Play';last=0;};
 $('step').onclick=()=>{playing=false;$('play').textContent='Play';time=Math.min(animation.length,time+50);drawAnimation();};
 $('action').onchange=chooseAnimation;$('character').onchange=chooseCharacter;
 for(const id of ['zoom','crop','bones'])$(id).oninput=drawAnimation;
 $('time').oninput=()=>{playing=false;$('play').textContent='Play';time=Number($('time').value);drawAnimation();};
 $('add').onclick=()=>{const r=parts.find(r=>r.src===$('part').value),im=images.get(r.src);selected=nextId++;layers.push({id:selected,name:r.name,file:r.src,x:240,y:240,angle:0,scale:.75,pivot:[(r.pivot_x??0)*im.width,(1-(r.pivot_y??1))*im.height]});sync();};
 $('layer').onchange=()=>{selected=Number($('layer').value);sync();};
 for(const [id,field] of [['rotation','angle'],['partScale','scale'],['pivotX',0],['pivotY',1]])$(id).oninput=()=>{const l=layers.find(l=>l.id===selected),value=Number($(id).value);if(!l||!Number.isFinite(value)||($(id).value===''))return;if(field==='scale'&&(value<.25||value>8))return;if(typeof field==='number')l.pivot[field]=value;else l[field]=value;drawAssembly();};
 $('remove').onclick=()=>{layers=layers.filter(l=>l.id!==selected);selected=layers.at(-1)?.id??null;sync();};
 $('forward').onclick=()=>{const i=layers.findIndex(l=>l.id===selected);if(i<0)return;layers.push(...layers.splice(i,1));sync();};
 $('reset').onclick=()=>{layers=[];selected=null;sync();};
 $('export').onclick=()=>{const study=poseStudy(layers);study.headVariant=activeHead?.id??'original';const url=URL.createObjectURL(new Blob([JSON.stringify(study,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='character-pose-study.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 chooseCharacter();requestAnimationFrame(tick);
}catch(e){$('status').textContent=`Loading failed: ${e.message}`;}
