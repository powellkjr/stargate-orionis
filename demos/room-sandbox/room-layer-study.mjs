import {layerPieces,layerFamilies,layerName,layerPixelAllowed,furnitureRects} from '../shared/sprites/room-layer-contract.mjs';
const escaped=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const wallMask=piece=>{
 let path='';
 for(let y=0;y<32;y++){
  let start=null;
  for(let x=0;x<=128;x++){
   const allowed=x<128&&layerPixelAllowed('structure',piece,x+.5,y+.5);
   if(allowed&&start===null)start=x;
   if(!allowed&&start!==null){path+=`M${start} ${y}h${x-start}v1H${start}Z`;start=null}
  }
 }
 return path;
};
const wallPaths=Object.fromEntries(layerPieces.map(p=>[p,wallMask(p)]));
function placeholder(layer,piece,family){
 if(layer==='structure'){
  const color={v01:'#a0adb5',v02:'#b6c0c5',v03:'#8d9eaa'}[family];
  return `<path d="${wallPaths[piece]}" fill="${color}"/>`;
 }
 const caseArt=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="#b0c1bb" stroke="#3a5751" stroke-width="1"/><path d="M${x+2} ${y+h/2}h${w-4}" stroke="#57766e" stroke-width="1"/>`;
 if(piece==='edge-normal')return `<rect x="36" y="15" width="30" height="14" rx="1" fill="#678481"/><rect x="38" y="16" width="26" height="12" rx="1" fill="#d2deda"/><rect x="39" y="17" width="5" height="10" rx="1" fill="#eff4ef"/>${caseArt(78,17,12,10)}`;
 return furnitureRects[piece].map(([x,y,w,h])=>caseArt(x+1,y+1,w-2,h-2)).join('');
}

export class RoomLayerStudy {
 sources={structure:{},furniture:{}};
 urls={structure:[],furniture:[]};
 loading={structure:false,furniture:false};
 render(modules,{wallFamily,furnitureFamily,showFurniture}){
  const layers=showFurniture?['structure','furniture']:['structure'];
  return layers.map(layer=>`<g data-room-layer="${layer}">${modules.filter(m=>layerPieces.includes(m.piece)).map(m=>{
   const family=layer==='structure'?wallFamily:furnitureFamily,src=this.sources[layer][layerName(layer,m.piece,family)];
   const art=src?`<image data-layer-piece="${m.piece}" data-layer-family="${family}" href="${escaped(src)}" width="128" height="128"/>`:
    `<g data-layer-placeholder="${layer}" data-layer-piece="${m.piece}">${placeholder(layer,m.piece,family)}</g>`;
   return `<g transform="translate(${m.x*128} ${m.y*128}) rotate(${m.rotation} 64 64)"><g${m.reflect?' transform="matrix(0 1 1 0 0 0)"':''}>${art}</g></g>`;
  }).join('')}</g>`).join('');
 }
 status(layer,family){return layerPieces.every(p=>this.sources[layer][layerName(layer,p,family)])?'imported artwork':'SCHEMATIC PLACEHOLDERS'}
 async import(layer,files){
  if(this.loading[layer])throw Error('Layer import is already running');
  this.loading[layer]=true;const urls=[],candidate={};
  try{
   const prefix=layer==='structure'?'shared-wall':'infirmary-furniture';
   const pattern=new RegExp(`^${prefix}-(corner|shared|edge-normal|edge-door)__(v0[123])__source\\.png$`);
   for(const file of files){
    const match=pattern.exec(file.name);if(!match)throw Error(`Expected ${prefix}-<piece>__vNN__source.png`);
    if(candidate[file.name])throw Error(`Duplicate file: ${file.name}`);
    const src=URL.createObjectURL(file);urls.push(src);
    const image=new Image();image.src=src;await image.decode();
    if(image.naturalWidth!==1024||image.naturalHeight!==1024)throw Error(`${file.name}: expected full 1024-square source`);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
    const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
    const data=context.getImageData(0,0,1024,1024).data;let visible=false;
    for(let y=0;y<1024;y++)for(let x=0;x<1024;x++)if(data[(y*1024+x)*4+3]){
     visible=true;if(!layerPixelAllowed(layer,match[1],x/8,y/8))throw Error(`${file.name}: pixels outside ${layer} mask (wall/channel/door clearance)`);
    }
    if(!visible)throw Error(`${file.name}: layer artwork is empty`);
    candidate[file.name]=src;
   }
   const complete=Object.keys(layerFamilies).filter(f=>layerPieces.every(p=>candidate[layerName(layer,p,f)]));
   if(!complete.length)throw Error('Select all four pieces for at least one complete family');
   const selected=Object.keys(candidate);
   if(selected.some(name=>!complete.some(f=>name.includes(`__${f}__`))))throw Error('Incomplete family: import four matching pieces together');
   this.urls[layer].forEach(URL.revokeObjectURL);this.urls[layer]=urls;this.sources[layer]=candidate;
   return complete;
  }catch(error){urls.forEach(URL.revokeObjectURL);throw error}
  finally{this.loading[layer]=false}
 }
}
