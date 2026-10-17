export function headCenteredView(pose,bounds,zoom=1){
 const head=pose.objects.find(o=>o.z===8);
 if(!head)return null;
 const r=head.angle*Math.PI/180,x=head.file.width*(.5-head.pivot_x)*head.scale_x,y=head.file.height*(.5-head.pivot_y)*head.scale_y;
 const center=[head.x+x*Math.cos(r)-y*Math.sin(r),head.y+x*Math.sin(r)+y*Math.cos(r)];
 const extentX=Math.max(1,Math.abs(bounds[0]-center[0]),Math.abs(bounds[2]-center[0]));
 const extentY=Math.max(1,Math.abs(bounds[1]-center[1]),Math.abs(bounds[3]-center[1]));
 return {center,scale:Math.min(210/extentX,210/extentY)*zoom};
}
// Hand-estimated visual centers for playback only, not anatomical joint pivots.
const centers={
 'walk-gun':[24,69,112,155,198,246], 'walk-bat':[29,71,113,158,209,260],
 'walk-machine-gun':[23,78,130,188,240,301], 'walk-knife':[25,65,106,147,190,229],
 'walk-flamethrower':[27,76,126,180,229,280], 'gun-shot':[451,501,565,625,677],
 'knife-attack':[407,450,504,549,596,638,683], 'machine-gun-shot':[383,441,516,609],
 'bat-attack':[410,455,500,545,588,634,678], 'flamethrower-attack':[318,376,445,553,646],
 death:[430,472,508,554,613,668]
};
export function actionOf(name){return name.replace(/-\d+$/,'');}
export function groupedFrames(records){
 const groups=new Map();
 for(const record of records.filter(r=>r.category==='frames')){
  const action=actionOf(record.name);if(!groups.has(action))groups.set(action,[]);
  groups.get(action).push(record);
 }
 for(const frames of groups.values())frames.sort((a,b)=>a.name.localeCompare(b.name));
 return groups;
}
export function playbackOffset(record){
 const action=actionOf(record.name),index=Number(record.name.match(/-(\d+)$/)?.[1])-1;
 const [left,top,right,bottom]=record.sourceRectangle;
 const x=centers[action]?.[index]??(left+right)/2;
 return [record.sourceOrigin[0]-x,record.sourceOrigin[1]-(top+bottom)/2];
}
export function localPoint(layer,x,y){
 const angle=-layer.angle*Math.PI/180,dx=(x-layer.x)/layer.scale,dy=(y-layer.y)/layer.scale;
 return [dx*Math.cos(angle)-dy*Math.sin(angle)+layer.pivot[0],dx*Math.sin(angle)+dy*Math.cos(angle)+layer.pivot[1]];
}
export function hitLayer(layers,images,x,y){
 for(let i=layers.length-1;i>=0;i--){
  const layer=layers[i],im=images.get(layer.file);if(!im)continue;
  const [lx,ly]=localPoint(layer,x,y);
  if(lx>=0&&ly>=0&&lx<im.width&&ly<im.height)return layer;
 }
 return null;
}
export function poseStudy(layers){return {format:'character-cutout-pose-study-v1',registeredRig:false,pivotStatus:'editable provisional preview pivots',layers:layers.map(l=>({...l,pivot:[...l.pivot]}))};}
