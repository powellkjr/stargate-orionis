// Explicit visual-review findings, separate from installation and gameplay data.
export const spriteRegenerationReasons=Object.freeze({
 'floor-room-cultural-platform':'Installed designs obstruct the requested continuous open center; regenerate with seating/tables confined to the perimeter and no planters.',
 'floor-room-offworld-medical-holding':'Installed designs include beds; regenerate without beds or other separately rendered medical instances.'
});

export function outstandingSpriteRequests(assets,installed,fileAvailable,reasons=spriteRegenerationReasons){
 return Object.keys(assets).filter(key=>!['door-open','gate-open'].includes(key)).flatMap(key=>{
  const available=id=>{
   const entry=installed[id];
   return !!entry&&(entry.variants??[entry]).some(v=>!v.disabled&&/\.png$/i.test(v.src??'')&&fileAvailable(v.src));
  };
  const missing=!available(key)||(assets[key].pair&&!available(assets[key].pair));
  const reason=reasons[key]??(missing?'No enabled installed production PNG available for this asset or its required state pair.':null);
  return reason?[{key,reason}]:[];
 });
}