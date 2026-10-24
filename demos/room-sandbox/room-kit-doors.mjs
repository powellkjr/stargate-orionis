export const doorLeafName=(kit,family,state)=>`${kit}-door-leaf-${state}__${family}__source.png`;

// A leaf occupies only the wall-depth cross-section of the existing passage.
// Retracted leaves are hidden behind the fixed frame: open is transparent.
export function roomDoorLeaves(edges,{kit,family,state,sources={}}) {
 return edges.filter(e=>e.door).map(e=>{
  const src=sources[doorLeafName(kit,family,state)];
  const content=src?`<image data-door-leaf-art="${state}" data-family="${family}" href="${src}" width="128" height="128"/>`:
   state==='closed'?`<g data-door-placeholder="closed"><rect x="48" y="0" width="32" height="12" fill="#161e25"/>
    <path d="M48.5 .6H63.5V11.4H48.5Z M64.5 .6H79.5V11.4H64.5Z" fill="#62717c" stroke="#a1aeb6" stroke-width=".5"/>
    <path d="M50 3H62 M66 3H78 M50 9H62 M66 9H78" fill="none" stroke="#36434e" stroke-width="1"/>
    <path d="M64 0V12" stroke="#0a1016" stroke-width="1"/></g>`:'';
  return `<g data-door-state="${state}" data-door-edge="${e.key}" transform="translate(${e.x*128} ${e.y*128}) rotate(${e.rotation} 64 64)">${content}</g>`;
 }).join('');
}
