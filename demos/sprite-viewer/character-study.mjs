import {technicianRegions,buildRegionMap,recolorPixels} from './character-colors.mjs';
import {normalizeAppearance} from '../shared/portraits/portrait-bust.mjs';
const $=id=>document.getElementById(id);
export async function startCharacterStudy(){
 const image=new Image();image.src='../../artwork/character-studies/technician-v01/source.png';
 try{
  await image.decode();
  const source=document.createElement('canvas');source.width=image.naturalWidth;source.height=image.naturalHeight;
  const ctx=source.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const original=ctx.getImageData(0,0,source.width,source.height),map=buildRegionMap(original.data,source.width,source.height);
  const colors=Object.fromEntries(technicianRegions.map(r=>[r.key,r.color]));
  function render(){
   const appearance=normalizeAppearance(colors),chosen={...colors,uniformColor:appearance.uniformColor,collarColor:appearance.collarColor,hairColor:appearance.hairColor,skinColor:appearance.skinColor};
   ctx.putImageData(new ImageData(recolorPixels(original.data,map,chosen),source.width,source.height),0,0);
   if($('characterMasks').checked){
    const overlay=ctx.getImageData(0,0,source.width,source.height),palette=['#ef6464','#65a8ee','#f4d35e','#a578e8','#69d5ac','#ffa86a','#b5c7d5'];
    for(let p=0;p<map.length;p++)if(map[p]){const color=palette[map[p]-1];for(let c=0;c<3;c++)overlay.data[p*4+c]=parseInt(color.slice(1+c*2,3+c*2),16);}
    ctx.putImageData(overlay,0,0);
   }
   // Match ordinary sprite preparation: shared alpha crop + 8px padding on 128.
   let left=source.width,top=source.height,right=0,bottom=0;
   for(let p=0;p<original.data.length/4;p++)if(original.data[p*4+3]){const x=p%source.width,y=Math.floor(p/source.width);left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
   const cropWidth=right-left,cropHeight=bottom-top,ratio=112/Math.max(cropWidth,cropHeight);
   for(const id of ['characterOriginal','characterPreview','characterMap']){const canvas=$(id),target=canvas.getContext('2d');canvas.width=canvas.height=128;target.clearRect(0,0,128,128);target.drawImage(id==='characterOriginal'?image:source,left,top,cropWidth,cropHeight,(128-cropWidth*ratio)/2,(128-cropHeight*ratio)/2,cropWidth*ratio,cropHeight*ratio);}
   $('characterStatus').textContent=$('characterMasks').checked?'Mask coverage: red shirt · blue trousers · yellow accents · purple hair · green skin · orange harness · silver gear. Dark outlines and chest display remain unchanged.':'Viewer preview only. Colors are not installed or saved to personnel.';
   $('characterStudy').dataset.ready='true';
  }
  for(const region of technicianRegions){const label=document.createElement('label');label.textContent=region.label;const input=document.createElement('input');input.type='color';input.value=region.color;input.id=`character-${region.key}`;input.oninput=()=>{colors[region.key]=input.value;render();};label.append(input);$('characterColors').append(label);}
  $('characterMasks').onchange=render;
  $('characterReset').onclick=()=>{for(const r of technicianRegions){colors[r.key]=r.color;$(`character-${r.key}`).value=r.color;}$('characterMasks').checked=false;render();};
  render();
 }catch(error){$('characterStatus').textContent=`Character preview unavailable: ${error.message}`;}
}
