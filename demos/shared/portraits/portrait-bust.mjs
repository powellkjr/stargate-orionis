// Presentation-only, interchangeable pixel parts at a 48x64 bust scale.
// No gameplay identity or competency is encoded here. Colors must be #rrggbb values;
// SVG markup is never accepted as an appearance value. Every part is composable, so the
// same appearance record also drives the 48x48 icon and the 14x14 map token.
import {isHexColor,mix,shade} from './palette.mjs';
export const BUST_WIDTH=48,BUST_HEIGHT=64;
export const styles=Object.freeze({
  face:['square','soft','oval','angular'],
  hair:['crop','swept','bob','braid','curls','bun','tied','receding'],
  brow:['level','angled','arched','raised'],
  eye:['neutral','narrow','wide','relaxed'],
  mouth:['neutral','firm','frown','smile'],
  facialHair:['none','stubble','beard','goatee'],
  uniform:['field','jacket','plate'],
  collar:['split','band','stand'],
});
export const appearanceDefaults=Object.freeze({
  backgroundColor:'#000000',faceStyle:'square',skinColor:'#ac785a',hairStyle:'crop',
  hairColor:'#342c30',browStyle:'level',eyeStyle:'neutral',eyeColor:'#2f2422',
  mouthStyle:'neutral',facialHairStyle:'none',facialHairColor:null,
  uniformStyle:'field',uniformColor:'#3b4c57',collarStyle:'split',collarColor:'#d1495b',
});
// Unknown style names and malformed colors fall back to the default record instead of failing.
// A null or 'transparent' background is preserved so the bust can render with no backdrop.
export function normalizeAppearance(appearance={}){
  const out={};
  for(const [key,fallback] of Object.entries(appearanceDefaults)){
    const value=appearance[key];
    if(key==='backgroundColor')out[key]=value===null||value==='transparent'?null:isHexColor(value)?value:fallback;
    else if(key.endsWith('Color'))out[key]=isHexColor(value)?value:fallback;
    else out[key]=styles[key.replace(/Style$/,'')].includes(value)?value:fallback;
  }
  out.facialHairColor=isHexColor(appearance.facialHairColor)?appearance.facialHairColor:out.hairColor;
  return Object.freeze(out);
}
// Tones are derived from the record's own colors; the simulator never stores hand-picked shading.
export function tonalPalette(appearance={}){
  const a=normalizeAppearance(appearance),skin=a.skinColor,hair=a.hairColor,beard=a.facialHairColor,uniform=a.uniformColor,collar=a.collarColor;
  const lip=mix(skin,'#9c4f48',.5);
  return Object.freeze({appearance:a,background:a.backgroundColor,
    skin:{base:skin,light:shade(skin,.16),mid:shade(skin,-.22),dark:shade(skin,-.4)},
    hair:{base:hair,light:shade(hair,.34),mid:shade(hair,-.32),dark:shade(hair,-.58)},
    beard:{base:shade(beard,-.04),light:shade(beard,.24),mid:shade(beard,-.34),dark:shade(beard,-.56)},
    uniform:{base:uniform,light:shade(uniform,.26),mid:shade(uniform,-.34),dark:shade(uniform,-.58),seam:shade(uniform,-.45),metal:shade(uniform,.55)},
    collar:{base:shade(uniform,.1),light:shade(uniform,.32),mid:shade(uniform,-.28),dark:shade(uniform,-.5),accent:collar,pip:shade(collar,.3),shadow:shade(collar,-.42)},
    features:{sclera:mix(skin,'#f7f0e7',.86),iris:a.eyeColor,pupil:shade(a.eyeColor,-.62),lash:shade(hair,-.6),brow:shade(beard,-.26),lip,lipDark:shade(lip,-.38),nose:shade(skin,-.32)}});
}
const W=BUST_WIDTH,H=BUST_HEIGHT,CX=24,FACE_TOP=13,FACE_BOTTOM=46;
function createSurface(){
  const size=W*H;
  return {pixels:new Array(size).fill(null),parts:new Array(size).fill(null),tags:new Array(size).fill(null)};
}
const inside=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
function put(s,x,y,color,part,tag=part){
  if(!inside(x,y))return;
  const i=y*W+x;s.pixels[i]=color;s.parts[i]=part;s.tags[i]=tag;
}
function putRun(s,y,x0,x1,color,part,tag=part){for(let x=Math.max(0,x0);x<=Math.min(W-1,x1);x++)put(s,x,y,color,part,tag);}
function repaint(s,x,y,color){if(inside(x,y)&&s.tags[y*W+x])s.pixels[y*W+x]=color;}
function span(half){return [Math.round(CX-half),Math.round(CX+half)-1];}
function profile(points){
  const map=new Map();
  for(let i=0;i<points.length-1;i++){const [y0,w0]=points[i],[y1,w1]=points[i+1];
    for(let y=y0;y<=y1;y++)map.set(y,w0+(w1-w0)*((y-y0)/(y1-y0)));}
  return y=>map.get(y);
}
function runsOf(s,tag){
  const rows=[];
  for(let y=0;y<H;y++){
    let row=null;
    for(let x=0;x<W;x++){
      if(s.tags[y*W+x]!==tag)continue;
      if(!row)rows[y]=row=[];
      const last=row[row.length-1];
      if(last&&last[1]===x-1)last[1]=x;else row.push([x,x]);
    }
  }
  return rows;
}
// Authored silhouettes. Profiles are [row, half-width] control points in logical bust pixels.
const FACE_SHAPES={
  square:[[13,6],[15,8],[18,9.5],[22,11],[27,11],[31,11],[35,10],[38,9],[41,8],[43,7],[45,5],[46,3.5]],
  soft:[[13,5],[15,7],[18,9],[22,10],[27,10],[31,9],[35,8],[38,7],[41,6],[43,5],[45,4],[46,2.5]],
  oval:[[13,6],[15,8],[18,9.5],[22,10],[27,10],[31,10],[35,9],[38,8],[41,7],[43,6],[45,4.5],[46,3]],
  angular:[[13,7],[15,9],[18,10],[22,11],[27,11],[31,11],[35,11],[37,10],[40,8],[42,7],[44,5],[46,3.5]],
};
const TORSO=[[49,9],[51,12.5],[53,16],[55,19],[57,22],[59,24],[63,26]];
const COLLAR=[[42,8.5],[45,9.5],[48,10],[52,11],[57,12]];
const NECK=[[39,5],[52,5.5],[56,6]];
const HAIR_SHAPES={
  crop:{top:5,points:[[5,5],[6,8],[8,10.5],[10,12],[13,12.5],[16,12.5],[19,12],[21,11.5],[23,10.5]],hairline:15},
  swept:{top:4,points:[[4,5],[6,9.5],[8,12],[11,12.8],[14,13],[17,12.6],[20,12],[22,11]],hairline:14},
  bob:{top:5,points:[[5,5],[7,10],[10,12.8],[14,13.5],[18,13.5],[22,13.5],[26,13],[30,12],[33,10],[35,6]],hairline:15},
  braid:{top:5,points:[[5,5],[7,10],[10,12.8],[14,13.5],[18,13.5],[22,13],[26,12],[30,11],[33,9.5],[35,7]],hairline:15},
  curls:{top:4,points:[[4,6],[6,10.5],[9,13.5],[12,15],[16,15.5],[20,15],[24,14],[28,13],[31,11],[33,8]],hairline:14},
  bun:{top:6,points:[[6,5],[8,9.5],[10,11.5],[13,12],[16,11.5],[19,11],[21,10]],hairline:15},
  tied:{top:5,points:[[5,5],[7,9.5],[10,12],[13,12.5],[17,12.5],[21,12],[24,11],[26,10]],hairline:14},
  receding:{top:7,points:[[7,6],[9,10],[12,11.5],[15,12],[18,11.5],[21,11],[23,10]],hairline:15},
};
// Hairline coverage painted in front of the face. Rows are [row, from, to] in bust columns;
// -1 means the exposed face's own edge at that row. Two entries may share a row.
const FOREHEAD={
  crop:{rows:[[13,-1,-1],[14,-1,-1]]},
  swept:{rows:[[13,-1,-1],[14,-1,-1],[15,-1,-1],[16,20,-1],[17,22,-1],[18,25,-1],[19,28,-1],[20,30,-1]]},
  bob:{rows:[[13,-1,-1],[14,-1,-1],[15,-1,-1],[16,-1,-1],[17,19,27]]},
  braid:{rows:[[13,-1,-1],[14,-1,-1],[15,-1,-1],[16,-1,-1],[17,20,26]]},
  curls:{rows:[[13,-1,-1],[14,-1,-1],[15,-1,-1],[16,14,21],[16,27,33],[17,17,20],[17,28,31]]},
  bun:{rows:[[13,-1,-1],[14,-1,-1],[15,19,28]]},
  tied:{rows:[[13,-1,-1]]},
  receding:{rows:[[13,19,28],[14,19,28],[15,19,28],[16,20,27],[17,21,26],[18,22,25]]},
};
// Round masses: curl clusters and the bun's knot. [centre x, centre y, radius].
const HAIR_DISKS={
  curls:[[11.5,9.5,3],[18.5,6.5,3],[25.5,5.5,3],[31.5,7.5,3],[35.5,11.5,3],[9.5,14.5,3],[38.5,15.5,2.5],[12.5,18.5,2.5],[37.5,19.5,2.5],[10.5,21.5,2]],
  bun:[[36.5,9.5,4.5]],
};
const HAIR_TEXTURE={
  crop:[[18,5],[22,4],[27,4],[31,5],[34,7]],
  swept:[[16,3],[21,2],[26,3],[30,4],[12,6]],
  bob:[[18,4],[23,3],[28,4],[33,6]],
  braid:[[18,4],[23,3],[28,4],[33,6]],
  curls:[[13,3],[18,2],[23,2],[28,3],[33,4],[10,7],[37,7]],
  bun:[[17,5],[22,4],[27,5]],
  tied:[[16,4],[21,3],[26,4]],
  receding:[[17,6],[22,5],[27,6]],
};
const HAIR_SHINE={crop:[[10,0],[11,1]],swept:[[9,0],[10,1],[11,2]],bob:[[10,0],[11,1],[12,2]],braid:[[10,0],[11,1],[12,2]],curls:[[8,0],[9,1],[10,2]],bun:[[11,0],[12,1]],tied:[[10,0],[11,1]],receding:[[12,0],[13,1]]};
function paintBackground(s,t){if(!t.background)return;for(let y=0;y<H;y++)putRun(s,y,0,W-1,t.background,'background','background');}
function paintTorso(s,t,a){
  const p=profile(TORSO),u=t.uniform;
  for(let y=49;y<=63;y++){const [x0,x1]=span(p(y));putRun(s,y,x0,x1,u.base,'uniform','uniform');}
  shadeEdges(s,'uniform',{base:u.base,light:u.light,mid:u.mid,dark:u.dark,darkLeft:1,midLeft:5,darkRight:1,midRight:5,lightTop:2});
  if(a.uniformStyle==='plate'){
    for(const side of [-1,1])for(let y=49;y<=55;y++){
      const inner=CX+side*10,outer=CX+side*(13+(y-49));
      for(let x=Math.round(Math.min(inner,outer));x<=Math.round(Math.max(inner,outer));x++)put(s,x,y,y<51?u.light:u.base,'uniform','uniform');
      put(s,Math.round(outer),y,u.dark,'uniform','uniform');
      put(s,Math.round(inner),y,u.seam,'uniform','uniform');
    }
  }
  if(a.uniformStyle==='jacket')for(const x of [16,31])for(let y=57;y<H;y++)put(s,x,y,u.mid,'uniform','uniform');
  // Chest quilting and the centre zip sit below the collar's front flaps.
  for(let y=57;y<H;y++){put(s,23,y,u.dark,'uniform','uniform');put(s,24,y,u.seam,'uniform','uniform');}
  put(s,23,58,u.light,'uniform','uniform');
  for(const y of [60,62])putRun(s,y,10,37,u.seam,'uniform','uniform');
  for(const x of [11,36])for(let y=54;y<H;y++)put(s,x,y,u.seam,'uniform','uniform');
}
function paintCollarBack(s,t){
  const p=profile(COLLAR),c=t.collar;
  for(let y=42;y<=57;y++){const [x0,x1]=span(p(y));putRun(s,y,x0,x1,c.base,'collar','collar');}
  shadeEdges(s,'collar',{base:c.base,light:c.light,mid:c.mid,dark:c.dark,darkRight:1,midRight:3,midLeft:3,lightLeft:1});
  const [tx0,tx1]=span(p(42));
  putRun(s,42,tx0,tx1,c.dark,'collar','collar');
  putRun(s,43,tx0,tx1,c.mid,'collar','collar');
}
function paintCollarFront(s,t,a){
  const p=profile(COLLAR),mirror=x=>W-1-x,c=t.collar,inner=y=>y<47?19:y<50?20:21;
  for(let y=44;y<=56;y++){
    const [x0,x1]=span(p(y)),edge=a.collarStyle==='stand'?22:inner(y);
    if(edge<=x0)continue;
    for(let x=x0;x<=edge;x++)put(s,x,y,c.base,'collar','collar');
    for(let x=mirror(edge);x<=x1;x++)put(s,x,y,c.base,'collar','collar');
    put(s,edge,y,c.accent,'collar','collar');
    put(s,mirror(edge),y,c.accent,'collar','collar');
    put(s,x0,y,c.dark,'collar','collar');
    put(s,x1,y,c.dark,'collar','collar');
    if(a.collarStyle==='split'){
      put(s,edge-1,y,c.pip,'collar','collar');put(s,mirror(edge)+1,y,c.pip,'collar','collar');
      put(s,edge-2,y,c.base,'collar','collar');put(s,mirror(edge)+2,y,c.base,'collar','collar');
    } else if(a.collarStyle==='band'){
      const bandBottom=y<47?x1:y<51?mirror(edge):edge+2;
      for(let x=edge;x<=bandBottom;x++)put(s,x,y,c.accent,'collar','collar');
      if(y===44)for(let x=x0;x<=x1;x++)put(s,x,y,c.pip,'collar','collar');
    }
  }
  if(a.collarStyle==='stand')for(let y=44;y<=52;y++){put(s,23,y,c.accent,'collar','collar');put(s,24,y,c.shadow,'collar','collar');}
}
function paintNeck(s,t){
  const p=profile(NECK);
  for(let y=39;y<=56;y++){const [x0,x1]=span(p(y));putRun(s,y,x0,x1,t.skin.base,'neck','skin');}
}
// Directional edge shading: lit edges lean upper-left, shaded edges lower-right.
function shadeEdges(s,tag,o){
  const rows=runsOf(s,tag),top=new Array(W).fill(H),bottom=new Array(W).fill(-1);
  for(let y=0;y<H;y++){const row=rows[y];if(!row)continue;
    for(const [x0,x1] of row)for(let x=x0;x<=x1;x++){if(y<top[x])top[x]=y;if(y>bottom[x])bottom[x]=y;}}
  for(let y=0;y<H;y++){const row=rows[y];if(!row)continue;
    for(const [x0,x1] of row)for(let x=x0;x<=x1;x++){
      const l=x-x0,r=x1-x,t=y-top[x],b=bottom[x]-y;
      const color=(o.darkRight&&r<o.darkRight)||(o.darkLeft&&l<o.darkLeft)||(o.darkTop&&t<o.darkTop)||(o.darkBottom&&b<o.darkBottom)?o.dark
        :(o.midRight&&r<o.midRight)||(o.midLeft&&l<o.midLeft)||(o.midTop&&t<o.midTop)||(o.midBottom&&b<o.midBottom)?o.mid
        :(o.lightLeft&&l<o.lightLeft)||(o.lightTop&&t<o.lightTop)?o.light:o.base;
      repaint(s,x,y,color);
    }}
}
function paintFace(s,t,a){
  const p=profile(FACE_SHAPES[a.faceStyle]),bottom=new Array(W).fill(-1);
  for(let y=FACE_TOP;y<=FACE_BOTTOM;y++){
    const [x0,x1]=span(p(y));
    putRun(s,y,x0,x1,t.skin.base,'face','skin');
    for(let x=x0;x<=x1;x++)bottom[x]=y;
  }
  return bottom;
}
// Ears are a short bump outside the face edge, so the shading pass treats them as face volume.
function paintEars(s,t,a){
  const p=profile(FACE_SHAPES[a.faceStyle]);
  for(const side of [-1,1])for(let y=24;y<=33;y++){
    const [ex0,ex1]=span(p(y)+(y>24&&y<33?2:1.2)),[fx0,fx1]=span(p(y));
    if(side<0)for(let x=ex0;x<fx0;x++)put(s,x,y,t.skin.base,'ear','skin');
    else for(let x=fx1+1;x<=ex1;x++)put(s,x,y,t.skin.base,'ear','skin');
  }
}
function paintEarDetail(s,t,a){
  const p=profile(FACE_SHAPES[a.faceStyle]);
  for(const side of [-1,1])for(let y=25;y<=32;y++){
    const [fx0,fx1]=span(p(y));
    put(s,side<0?fx0-1:fx1+1,y,t.skin.mid,'ear','skin');
  }
}
function paintJawShadow(s,t,bottom){
  for(let x=0;x<W;x++){
    const fb=bottom[x];if(fb<FACE_TOP)continue;
    const neckBelow=fb<H-1&&s.tags[(fb+1)*W+x]==='skin';
    for(let d=0;d<2;d++)put(s,x,fb-d,d===0?t.skin.dark:t.skin.mid,'face','skin');
    if(neckBelow)put(s,x,fb+1,t.skin.mid,'neck','skin');
  }
}
function paintDisk(s,cx,cy,r,color,part,tag){
  for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++)
    if(Math.hypot(x+.5-cx,y+.5-cy)<=r)put(s,x,y,color,part,tag);
}
function paintHairBack(s,t,a){
  const shape=HAIR_SHAPES[a.hairStyle],p=profile(shape.points),last=shape.points[shape.points.length-1][0];
  for(let y=shape.top;y<=last;y++){
    const hw=p(y);if(hw==null)continue;
    const [x0,x1]=span(hw);
    putRun(s,y,x0,x1,t.hair.base,'hair','hair');
  }
  for(const [cx,cy,r] of HAIR_DISKS[a.hairStyle]??[])paintDisk(s,cx,cy,r,t.hair.base,'hair','hair');
}
// The fringe and hairline sit in front of the exposed face.
function paintHairFront(s,t,a){
  const fp=profile(FACE_SHAPES[a.faceStyle]);
  for(const [y,from,to] of FOREHEAD[a.hairStyle].rows){
    const hw=fp(y);if(hw==null)continue;
    const [fx0,fx1]=span(hw);
    putRun(s,y,from<0?fx0:from,to<0?fx1:to,t.hair.base,'hair','hair');
  }
}
function paintHairTrail(s,t,a){
  const c=t.hair;
  if(a.hairStyle==='braid'){
    for(let y=34;y<=58;y++){
      const drift=(y-34)/24,x0=Math.round(11-3*drift),x1=x0+4-Math.round(drift),band=Math.floor((y-34)/3)%2===0;
      for(let x=x0;x<=x1;x++)put(s,x,y,band?(x<x0+2?c.light:c.base):(x>x1-2?c.dark:c.mid),'hair','hair');
    }
    for(let x=11;x<=15;x++){put(s,x,33,c.dark,'hair','hair');put(s,x,34,c.mid,'hair','hair');}
  }
  if(a.hairStyle==='tied'){
    for(let y=26;y<=42;y++){
      const drift=(y-26)/16,x0=Math.round(8-2*drift),x1=x0+4;
      for(let x=x0;x<=x1;x++)put(s,x,y,x===x0?c.mid:c.base,'hair','hair');
      put(s,x1,y,c.mid,'hair','hair');
    }
    for(let y=26;y<=33;y++)put(s,15,y,c.base,'hair','hair');
    for(let y=22;y<=25;y++)put(s,14,y,c.base,'hair','hair');
  }
}
function paintHairDetail(s,t,a){
  const rows=runsOf(s,'hair');
  for(const [y,inset] of HAIR_SHINE[a.hairStyle]??[]){
    const row=rows[y];if(!row)continue;
    for(const [x0,x1] of row){
      const width=x1-x0+1;
      const start=x0+Math.max(1,Math.round(width*.2))+inset;
      const end=x1-Math.max(1,Math.round(width*.32));
      for(let x=start;x<=end;x++)put(s,x,y,t.hair.light,'hair','hair');
    }
  }
  for(const [x,y] of HAIR_TEXTURE[a.hairStyle]??[])put(s,x,y,t.hair.base,'hair','hair');
}

function paintFacialHair(s,t,a){
  const style=a.facialHairStyle;if(style==='none')return;
  const b=t.beard,stubble=mix(t.skin.mid,b.base,.45);
  const skinAt=(x,y)=>inside(x,y)&&s.tags[y*W+x]==='skin';
  const mouthZone=(x,y)=>y>=36&&y<=38&&x>=20&&x<=27;
  for(let y=32;y<=FACE_BOTTOM;y++)for(let x=0;x<W;x++){
    if(!skinAt(x,y)||mouthZone(x,y))continue;
    if(style==='stubble'){if(y>=35&&(y>=39||x<=20||x>=27)&&(x+y)%2===0)put(s,x,y,stubble,'facialHair','beard');}
    else if(style==='beard'){if(y>=39||(y>=35&&(x<=20||x>=27)))put(s,x,y,(x+y)%4===0?b.mid:b.base,'facialHair','beard');}
    else if(y>=39&&x>=20&&x<=27)put(s,x,y,b.base,'facialHair','beard');
  }
  if(style!=='goatee')for(const y of [35,36])for(let x=20;x<=27;x++){
    if(!skinAt(x,y)||(y===35&&(x===23||x===24)))continue;
    put(s,x,y,(x+y)%3===0?b.mid:b.base,'facialHair','beard');
  }
}
const BROW_SHAPE={level:[0,0,0,0,0,0],angled:[0,0,1,1,2,2],arched:[1,0,0,0,0,1],raised:[-1,0,0,0,0,0]};
function paintBrows(s,t,a){
  const shape=BROW_SHAPE[a.browStyle],baseY=a.browStyle==='raised'?18:20,thick=a.browStyle==='raised'?1:2;
  for(const [x0,dir] of [[16,1],[26,-1]])for(let i=0;i<6;i++){
    const x=x0+i,y=baseY+shape[dir>0?i:5-i];
    for(let d=0;d<thick;d++)put(s,x,y+d,t.features.brow,'brows','brows');
  }
}
// Eye art is authored per style over a 6px box; rows start at bust row 23.
const EYE_ART={
  neutral:['LLLLLL','SSIGSS','SSPISS','.mmmm.'],
  narrow:['LLLLLL','SSIGSS','.LLLL.'],
  wide:['LLLLLL','SSIGSS','SSPISS','SSSSSS','.mmmm.'],
  relaxed:['llllll','SSIGSS','SSPISS','.mmmm.'],
};
function paintEyes(s,t,a){
  const f=t.features,legend={L:f.lash,S:f.sclera,G:f.sclera,I:f.iris,P:f.pupil,m:t.skin.mid,l:t.skin.mid,'.':null};
  for(const x0 of [16,26])EYE_ART[a.eyeStyle].forEach((row,y)=>[...row].forEach((ch,dx)=>{
    const color=legend[ch];
    if(color)put(s,x0+dx,23+y,color,'eyes','eyes');
  }));
}
function paintNose(s,t,a){
  for(const [x,y,color] of [[22,29,t.skin.light],[22,30,t.skin.light],[23,31,t.skin.light],[23,32,t.skin.light],[24,32,t.skin.light],
    [25,28,t.skin.mid],[25,29,t.skin.mid],[25,30,t.skin.mid],[25,31,t.skin.mid],[25,32,t.skin.mid],[26,31,t.skin.mid],[26,32,t.skin.mid],
    [21,33,t.features.nose],[26,33,t.features.nose],[22,34,t.features.nose],[25,34,t.features.nose]])put(s,x,y,color,'nose','nose');
  putRun(s,34,23,24,t.skin.mid,'nose','nose');
}
const MOUTH_ART={
  neutral:['.dddddd.','..llll..'],
  firm:['.dddddd.'],
  smile:['d......d','.dddddd.','..llll..'],
  frown:['.dddddd.','..llll..','d......d'],
};
function paintMouth(s,t,a){
  const legend={d:t.features.lipDark,l:t.features.lip};
  MOUTH_ART[a.mouthStyle].forEach((row,i)=>[...row].forEach((ch,dx)=>{if(legend[ch])put(s,20+dx,38+i,legend[ch],'mouth','mouth');}));
  put(s,23,42,t.skin.mid,'mouth','mouth');put(s,24,42,t.skin.mid,'mouth','mouth');
  put(s,23,43,t.skin.light,'mouth','mouth');put(s,24,43,t.skin.light,'mouth','mouth');
}
const PART_ORDER=['background','uniform','collar','neck','ear','face','hair','facialHair','brows','eyes','nose','mouth'];
function renderSvg(s){
  const groups=[];
  for(const part of PART_ORDER){
    let body='';
    for(let y=0;y<H;y++){
      let x=0;
      while(x<W){
        const color=s.parts[y*W+x]===part?s.pixels[y*W+x]:null;
        if(!color){x++;continue;}
        let end=x;
        while(end+1<W&&s.parts[y*W+end+1]===part&&s.pixels[y*W+end+1]===color)end++;
        body+=`<rect x="${x}" y="${y}" width="${end-x+1}" height="1" fill="${color}"/>`;
        x=end+1;
      }
    }
    if(body)groups.push(`<g data-part="${part}">${body}</g>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" aria-label="Personnel portrait" role="img">${groups.join('')}</svg>`;
}
export function portraitBustSurface(appearance={}){
  const a=normalizeAppearance(appearance),t=tonalPalette(a),s=createSurface();
  paintBackground(s,t);
  paintTorso(s,t,a);
  paintCollarBack(s,t);
  paintNeck(s,t);
  paintHairBack(s,t,a);
  const bottom=paintFace(s,t,a);
  paintEars(s,t,a);
  shadeEdges(s,'skin',{base:t.skin.base,light:t.skin.light,mid:t.skin.mid,dark:t.skin.dark,darkRight:1,midRight:3,midTop:2,midBottom:2,lightLeft:1});
  paintJawShadow(s,t,bottom);
  paintEarDetail(s,t,a);
  paintHairFront(s,t,a);
  shadeEdges(s,'hair',{base:t.hair.base,light:t.hair.light,mid:t.hair.mid,dark:t.hair.dark,lightLeft:1,darkRight:1,midRight:3,darkBottom:1,midBottom:2});
  paintHairDetail(s,t,a);
  paintCollarFront(s,t,a);
  paintHairTrail(s,t,a);
  paintFacialHair(s,t,a);
  paintBrows(s,t,a);
  paintEyes(s,t,a);
  paintNose(s,t,a);
  paintMouth(s,t,a);
  return {width:W,height:H,appearance:a,tones:t,pixels:s.pixels,parts:s.parts,tags:s.tags};
}
export function portraitBustSvg(appearance={}){return renderSvg(portraitBustSurface(appearance));}

