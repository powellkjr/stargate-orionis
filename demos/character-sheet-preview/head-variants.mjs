// Registered replacements retain each original file's full canvas and pivots.
export function validateHeadVariants(data,characters){
 if(data?.format!=='character-head-variants-v1'||!Array.isArray(data.variants))throw Error('Invalid head variant registry');
 const seen=new Set();
 return data.variants.map(v=>{
  if(!v.id||seen.has(v.id)||typeof v.label!=='string')throw Error('Head variant needs a unique ID and label');
  seen.add(v.id);const character=characters.find(c=>c.name===v.character);if(!character)throw Error('Unknown head variant character');
  const files=new Map(Object.values(character.files).map(f=>[f.src,f]));
  if(!v.replacements||!Object.keys(v.replacements).length)throw Error('Head variant needs replacements');
  for(const [source,path] of Object.entries(v.replacements)){
   if(!files.has(source)||source.includes('/Death/'))throw Error('Unknown or excluded head source');
   if(typeof path!=='string'||!path.endsWith('.png')||path.startsWith('/')||path.includes('\\')||path.split('/').some(p=>!p||p==='..'||p==='.')||path.includes(':'))throw Error('Head PNG must use a relative variant-folder path');
   const registration=v.registration?.[source];
   if(registration){
    const original=files.get(source);
    if(!Array.isArray(registration.sourceSize)||registration.sourceSize[0]!==original.width||registration.sourceSize[1]!==original.height||!Array.isArray(registration.offset)||registration.offset.length!==2||!registration.offset.every(n=>Number.isInteger(n)&&n>=0))throw Error('Invalid head registration');
   }
   const mask=v.masks?.[source];
   if(mask&&(typeof mask.path!=='string'||mask.path.startsWith('/')||mask.path.includes(':')||mask.path.includes('\\')||mask.path.split('/').some(p=>!p||p==='..'||p==='.')))throw Error('Invalid head mask path');
  }
  return {...v};
 });
}
export function headImage(file,base,variant,animationName){
 return animationName==='Death'?base:variant?.images.get(file)??base;
}
export function headPlacement(file,base,variant,animationName){
 const active=animationName!=='Death'&&variant?.images.has(file);
 const registration=active?variant.registration?.[file]:null;
 return {image:headImage(file,base,variant,animationName),size:registration?.sourceSize??[base.width,base.height],offset:registration?.offset??[0,0]};
}
