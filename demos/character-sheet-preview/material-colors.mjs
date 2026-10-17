// ID0 retains the source. Each other pixel belongs to one authored material.
export function materialPixels(source,ids,materials,references,colors,{review=false}={}){
 if(source.length!==ids.length*4)throw Error('Mask dimensions do not match source');
 const result=new Uint8ClampedArray(source),byId=new Map(Object.entries(materials).map(([name,m])=>[m.id,{name,...m}]));
 const diagnostics=['#181a1c','#f45c6a','#54ccc6','#f2c470','#ffe030','#76e693','#b574ea','#59b0f8'];
 for(let p=0;p<ids.length;p++){
  const id=ids[p],m=byId.get(id),i=p*4;if(!source[i+3]||(!m&&!review))continue;
  if(id&&!m)throw Error('Unknown material ID');
  const hex=review?diagnostics[id]:colors[m.name]??m.color;
  if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error('Invalid material color');
  const rgb=[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16));
  const light=source[i]*.2126+source[i+1]*.7152+source[i+2]*.0722;
  const factor=review?1:light/Math.max(1,references[m.name]??1);
  for(let c=0;c<3;c++)result[i+c]=rgb[c]*factor;
 }
 return result;
}
