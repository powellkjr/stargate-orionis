// Optional reference-inspired presentation study, separate from authored PNGs.
// Keep the agreed 24-unit CT run and 8 / 6+6 / 16 colored coverage.
export function insetRoomLights(edges,tier,id) {
 const config={1:{color:'#ffb52e',core:'#fff4ce',runs:[[60,8]]},
  2:{color:'#20cfff',core:'#e4fcff',runs:[[56,6],[66,6]]},
  3:{color:'#c164ff',core:'#f8e5ff',runs:[[56,16]]}}[tier];
 const filter=`light-glow-${id}`,clip=`light-wall-${id}`;
 return `<defs><filter id="${filter}" x="-100%" y="-200%" width="300%" height="500%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1.1"/></filter><clipPath id="${clip}"><rect x="46" y="0" width="36" height="12"/></clipPath></defs><g data-lighting="inset">${edges.filter(e=>!e.door).map(e=>
  `<g data-light-edge="${e.key}" transform="translate(${e.x*128} ${e.y*128}) rotate(${e.rotation} 64 64)" clip-path="url(#${clip})">
   ${config.runs.map(([x,width])=>`<g data-light-run="${width}"><rect data-light-housing="" x="${x-1.2}" y="3.8" width="${width+2.4}" height="5.4" rx=".65" fill="#28343d" stroke="#9aa8b0" stroke-width=".5"/><rect x="${x-.7}" y="4.3" width="${width+1.4}" height="4.4" rx="1" fill="${config.color}" opacity=".7" filter="url(#${filter})"/><rect x="${x-.4}" y="4.2" width="${width+.8}" height="4.6" rx=".4" fill="#090d13"/><rect x="${x}" y="4.8" width="${width}" height="3.4" rx=".4" fill="${config.color}"/><rect x="${x+.5}" y="5.7" width="${width-1}" height="1.1" rx=".3" fill="${config.core}"/><path d="M${x+.5} 5.1h${width-1}" stroke="white" stroke-opacity=".6" stroke-width=".3"/></g>`).join('')}
  </g>`).join('')}</g>`;
}
