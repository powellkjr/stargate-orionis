// Presentation-only masks. Coordinates refer to the untouched 1024px source.
// Each source needs its own reviewed regions; these are not transferable to v02/v03.
export const technicianRegions = [
 {key:'uniformColor',label:'Shirt',color:'#87919a',reference:'#929394',kind:'neutral',polygons:[
  [[390,317],[397,371],[412,425],[392,461],[378,485],[350,485],[321,473],[305,442],[325,397],[346,352]],
  [[600,318],[635,331],[660,357],[681,400],[701,443],[695,473],[667,488],[645,489],[620,474],[598,441],[605,384]],
  [[452,423],[477,440],[531,440],[548,423],[552,468],[571,482],[583,507],[558,519],[456,518],[441,480]],
  [[394,460],[409,474],[418,502],[415,519],[392,506]],
  [[584,459],[610,457],[621,489],[610,508],[589,517]]],
  exclude:[[[489,462],[568,462],[568,518],[489,518]]]},
 {key:'trouserColor',label:'Trousers',color:'#87919a',reference:'#929394',kind:'neutral',polygons:[
  [[413,537],[453,539],[493,544],[500,567],[482,598],[481,642],[468,663],[414,667],[397,633],[392,578]],
  [[511,543],[554,538],[597,534],[611,578],[614,630],[599,664],[551,667],[535,640],[529,603],[510,574]]],
  exclude:[[[397,596],[425,607],[460,605],[483,592],[482,633],[463,641],[422,638],[400,624]],
   [[529,594],[551,605],[580,605],[609,591],[613,623],[594,639],[550,640],[532,628]]]},
 {key:'collarColor',label:'Accents',color:'#e3a52e',reference:'#e3a52e',kind:'warm',polygons:[
  [[347,327],[390,326],[393,411],[348,411]],[[608,326],[654,327],[653,409],[608,409]],
  [[420,431],[458,431],[458,460],[420,460]],[[540,433],[574,433],[574,460],[540,460]],
  [[376,500],[415,500],[415,545],[376,545]],
  [[407,594],[465,594],[465,620],[407,620]],[[542,594],[602,594],[602,620],[542,620]],
  [[416,708],[458,708],[458,734],[416,734]],[[547,708],[589,708],[589,734],[547,734]]]},
 {key:'hairColor',label:'Hair',color:'#704322',reference:'#704322',kind:'warm',polygons:[
  [[411,193],[552,192],[582,260],[582,302],[577,383],[562,407],[532,424],[475,428],[444,413],[428,391],[415,363],[421,306],[408,280]]]},
 {key:'skinColor',label:'Skin',color:'#d59b70',reference:'#d59b70',kind:'warm',polygons:[
  [[309,470],[362,480],[346,528],[309,524]],[[644,480],[691,471],[695,524],[655,529]],
  [[446,401],[477,417],[520,419],[553,401],[542,434],[506,446],[470,441]]]},
 {key:'harnessColor',label:'Harness',color:'#a4aaae',reference:'#a4aaae',kind:'neutral',polygons:[
  [[391,310],[417,301],[435,304],[438,371],[456,431],[464,470],[432,488],[412,451],[396,399]],
  [[565,300],[591,306],[609,317],[601,379],[581,442],[579,481],[546,484],[540,453],[554,401]]]},
 // Cover the remaining neutral equipment separately, without tinting the display.
 {key:'gearColor',label:'Gear / boots',color:'#343a40',reference:'#343a40',kind:'neutral',polygons:[
  [[285,300],[722,300],[722,782],[285,782]]],exclude:[[[490,462],[568,462],[568,518],[490,518]]]}
];
export function insidePolygon(x,y,points){
 let inside=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const [xi,yi]=points[i],[xj,yj]=points[j];
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
 }
 return inside;
}
const rgb=hex=>{if(!/^#[\da-f]{6}$/i.test(hex))throw Error('Expected a six-digit color');return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));};
const luminance=([r,g,b])=>.2126*r+.7152*g+.0722*b;
export function buildRegionMap(pixels,width,height,regions=technicianRegions){
 if(pixels.length!==width*height*4)throw Error('Invalid pixel dimensions');
 const map=new Uint8Array(width*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,[r,g,b,a]=pixels.subarray(i,i+4);
  if(!a||Math.max(r,g,b)<30)continue; // Leave ink outlines intact.
  for(let n=0;n<regions.length;n++){
   const region=regions[n],eligible=region.kind==='neutral'?Math.max(r,g,b)-Math.min(r,g,b)<38:r>g*1.08&&g>b*1.08;
   const sx=(x+.5)*1024/width,sy=(y+.5)*1024/height;
   if(eligible&&region.polygons.some(p=>insidePolygon(sx,sy,p))&&!region.exclude?.some(p=>insidePolygon(sx,sy,p))){map[y*width+x]=n+1;break;}
  }
 }
 return map;
}
export function recolorPixels(pixels,map,colors,regions=technicianRegions){
 if(pixels.length!==map.length*4)throw Error('Invalid mask dimensions');
 const output=new Uint8ClampedArray(pixels),targets=regions.map(r=>rgb(colors[r.key]??r.color)),refs=regions.map(r=>rgb(r.reference));
 for(let p=0;p<map.length;p++){
  const n=map[p]-1;if(n<0)continue;if(n>=regions.length)throw Error('Unknown mask region');
  const i=p*4,light=luminance(pixels.subarray(i,i+3)),delta=light-luminance(refs[n]);
  // Preserve highlight/shadow differences while replacing the material color.
  for(let c=0;c<3;c++)output[i+c]=Math.max(0,Math.min(255,targets[n][c]+delta));
 }
 return output;
}
