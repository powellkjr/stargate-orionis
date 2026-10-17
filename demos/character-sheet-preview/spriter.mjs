const value=(t,key,fallback)=>t[key]??fallback;
const identity={x:0,y:0,angle:0,scale_x:1,scale_y:1,a:1};
export function compose(parent,local){
 const p=parent??identity,r=p.angle*Math.PI/180,x=local.x*p.scale_x,y=local.y*p.scale_y;
 return {...local,x:p.x+x*Math.cos(r)-y*Math.sin(r),y:p.y+x*Math.sin(r)+y*Math.cos(r),
  angle:p.angle+local.angle*Math.sign(p.scale_x*p.scale_y),scale_x:p.scale_x*local.scale_x,scale_y:p.scale_y*local.scale_y,a:p.a*local.a};
}
export function interpolate(a,b,t,spin=1){
 let delta=b.angle-a.angle;
 if(spin===0)delta=0;else if(spin>0&&delta<0)delta+=360;else if(spin<0&&delta>0)delta-=360;
 const result={...a};for(const key of ['x','y','scale_x','scale_y','a'])result[key]=a[key]+(b[key]-a[key])*t;
 result.angle=a.angle+delta*t;
 for(const key of ['pivot_x','pivot_y'])if(a[key]!==undefined&&b[key]!==undefined)result[key]=a[key]+(b[key]-a[key])*t;
 return result;
}
function transform(key){const t=key.transform;return {...t,x:value(t,'x',0),y:value(t,'y',0),angle:value(t,'angle',0),scale_x:value(t,'scale_x',1),scale_y:value(t,'scale_y',1),a:value(t,'a',1)};}
function sampleTimeline(animation,ref,time){
 const timeline=animation.timelines[ref.timeline];if(!timeline)throw Error('Missing SCML timeline');
 const i=timeline.keys.findIndex(k=>k.id===ref.key);if(i<0)throw Error('Missing SCML key');
 const key=timeline.keys[i],next=timeline.keys[i+1]??(animation.looping?timeline.keys[0]:key);
 const start=key.time??0;let end=next.time??0;if(next!==key&&end<=start)end+=animation.length;
 const amount=key.curve_type==='instant'||next===key||end===start?0:Math.max(0,Math.min(1,(time-start)/(end-start)));
 return interpolate(transform(key),transform(next),amount,key.spin??1);
}
export function samplePose(character,animation,time){
 const length=animation.length,timeAt=animation.looping?((time%length)+length)%length:Math.max(0,Math.min(time,length));
 const mainline=animation.mainline.filter(k=>(k.time??0)<=timeAt).at(-1)??animation.mainline[0],bones=new Map(),resolving=new Set();
 const resolveBone=id=>{
  if(bones.has(id))return bones.get(id);if(resolving.has(id))throw Error('Cyclic SCML hierarchy');resolving.add(id);
  const ref=mainline.bones.find(r=>r.id===id);if(!ref)throw Error('Missing SCML parent');
  const parent=ref.parent!==undefined?resolveBone(ref.parent):null,world=compose(parent,sampleTimeline(animation,ref,timeAt));
  const result={...world,id,parent:ref.parent,name:animation.timelines[ref.timeline].name};bones.set(id,result);resolving.delete(id);return result;
 };
 for(const ref of mainline.bones)resolveBone(ref.id);
 const objects=mainline.objects.map(ref=>{
  const local=sampleTimeline(animation,ref,timeAt),file=character.files[`${local.folder??0}:${local.file}`];if(!file)throw Error('Missing SCML image');
  return {...compose(ref.parent!==undefined?resolveBone(ref.parent):null,local),file,z:ref.z_index??0,
   pivot_x:local.pivot_x??file.pivot_x??0,pivot_y:local.pivot_y??file.pivot_y??1};
 }).sort((a,b)=>a.z-b.z);
 return {bones:[...bones.values()],objects,time:timeAt};
}
export function poseBounds(pose){
 const points=pose.objects.flatMap(o=>{
  const r=o.angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r),w=o.file.width,h=o.file.height;
  return [[0,0],[w,0],[0,h],[w,h]].map(([px,py])=>{const x=(px-o.pivot_x*w)*o.scale_x,y=((1-o.pivot_y)*h-py)*o.scale_y;return [o.x+x*c-y*s,o.y+x*s+y*c];});
 });
 if(!points.length)return [0,0,1,1];return [Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
}
export function animationBounds(character,animation){
 const times=new Set([0,animation.length,...animation.mainline.map(k=>k.time??0)]);
 for(let t=0;t<animation.length;t+=animation.length/40)times.add(t);
 const boxes=[...times].map(t=>poseBounds(samplePose(character,animation,t)));
 return [Math.min(...boxes.map(b=>b[0])),Math.min(...boxes.map(b=>b[1])),Math.max(...boxes.map(b=>b[2])),Math.max(...boxes.map(b=>b[3]))];
}
