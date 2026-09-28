// Presentation-only color helpers for the code-native portrait parts.
// A valid color is always #rrggbb; anything else must be replaced by a caller fallback.
export const isHexColor = value => /^#[\da-f]{6}$/i.test(value ?? '');
const channels = hex => [1,3,5].map(i => parseInt(hex.slice(i,i+2),16));
const toHex = list => '#'+list.map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
export const mix = (a,b,t) => isHexColor(a)&&isHexColor(b) ? toHex(channels(a).map((v,i) => v+(channels(b)[i]-v)*t)) : (isHexColor(a) ? a : b);
export const shade = (hex,amount) => mix(hex, amount < 0 ? '#000000' : '#ffffff', Math.abs(amount));
