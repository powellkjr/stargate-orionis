// Presentation-only, interchangeable pixel parts. No gameplay identity is encoded here.
export const styles = Object.freeze({ face: ['square', 'soft'], hair: ['crop', 'swept', 'bob'], uniform: ['field', 'jacket'], collar: ['split', 'band'] });
const rect = (x,y,w,h,fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const color = (value, fallback) => /^#[\da-f]{6}$/i.test(value ?? '') ? value : fallback;
// The 48x48 icon supports a subset of the bust's parts; richer hair names map to the closest icon shape.
const iconHair = value => ({braid:'bob',tied:'bob',curls:'bob',bun:'crop',receding:'crop'}[value] ?? value);
export function portraitSvg(appearance = {}) {
  const skin = color(appearance.skinColor, '#bd8664');
  const hair = color(appearance.hairColor, '#342d30');
  const uniform = color(appearance.uniformColor, '#394854');
  const collar = color(appearance.collarColor, '#78c7d2');
  const background = color(appearance.backgroundColor, '#162630');
  const soft = appearance.faceStyle === 'soft';
  const hairStyle = iconHair(appearance.hairStyle);
  const parts = {
    background: rect(0,0,48,48,background)+rect(4,4,40,40,'#223540'),
    uniform: rect(9,35,30,13,uniform)+rect(5,39,38,9,uniform)+rect(22,36,3,12,'#202d37')+(appearance.uniformStyle==='jacket'?rect(10,41,8,3,'#64717b')+rect(30,41,8,3,'#64717b'):''),
    face: rect(20,29,8,8,skin)+rect(soft?16:14,12,soft?16:20,17,skin)+rect(17,27,14,5,skin)+rect(13,19,3,7,skin)+rect(32,19,3,7,skin)+rect(18,21,3,2,'#202831')+rect(28,21,3,2,'#202831')+rect(23,25,2,2,'#815946')+rect(21,29,7,1,'#664a43'),
    hair: hairStyle==='bob' ? rect(12,9,24,9,hair)+rect(11,16,5,17,hair)+rect(32,16,5,17,hair)+rect(16,7,16,4,hair) : hairStyle==='swept' ? rect(14,9,21,7,hair)+rect(12,13,7,8,hair)+rect(18,7,15,4,hair)+rect(30,14,5,6,hair) : rect(14,10,20,5,hair)+rect(12,14,4,7,hair)+rect(32,14,4,7,hair),
    collar: appearance.collarStyle==='band' ? rect(16,34,16,4,collar) : rect(14,33,7,4,collar)+rect(17,37,5,3,collar)+rect(27,33,7,4,collar)+rect(26,37,5,3,collar),
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges" aria-label="Personnel portrait" role="img">${Object.entries(parts).map(([part,svg])=>`<g data-part="${part}">${svg}</g>`).join('')}</svg>`;
}
