// Presentation-only: normalize against the existing stat ranges, never mutate stats.
const axes=[['perception','PER',10],['expertise','EXP',8],['endurance','END',10]];
export function expertise(unit){
  if(!unit.profession||unit.profession==='UNTRAINED')return 0;
  const rank=unit.tier;
  if(!Number.isInteger(rank)||rank<0||rank>3)return 0;
  const branch=unit.branch;
  return rank+1+(branch&&Number.isInteger(branch.tier)&&branch.tier>=0&&branch.tier<=3?branch.tier+1:0);
}
export function statsRadar(unit){
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const point=(index,ratio)=>{const angle=-Math.PI/2+index*Math.PI*2/3;return {x:100+Math.cos(angle)*52*ratio,y:83+Math.sin(angle)*52*ratio};};
  const points=ratio=>axes.map((_,i)=>{const p=point(i,ratio);return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ');
  const values=axes.map(([key])=>key==='expertise'?expertise(unit):Number.isFinite(unit[key])?unit[key]:0);
  const polygon=values.map((value,i)=>{const p=point(i,Math.max(0,Math.min(1,value/axes[i][2])));return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;}).join(' ');
  const summary=axes.map(([,label,max],i)=>`${label} ${values[i]}/${max}`).join(' · ');
  return `<svg class="stats-radar" viewBox="0 0 200 165" role="img" aria-label="${escape(summary)}"><title>${escape(summary)}. Each axis uses its own stat maximum.</title>${[.25,.5,.75,1].map(r=>`<polygon points="${points(r)}" fill="none" stroke="#465b64" stroke-width="1"/>`).join('')}${axes.map((_,i)=>{const p=point(i,1);return `<line x1="100" y1="83" x2="${p.x}" y2="${p.y}" stroke="#465b64"/>`;}).join('')}<polygon class="stats-radar-values" points="${polygon}" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="2"/>${axes.map(([,label],i)=>{const p=point(i,1.4);return `<text x="${p.x}" y="${p.y}" text-anchor="middle" fill="#e0e9e9" font-size="11">${label} ${escape(values[i])}</text>`;}).join('')}</svg>`;
}