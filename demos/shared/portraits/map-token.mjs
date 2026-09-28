import {tileSlots} from '../map/renderer.mjs?v=shared-map-1';
// Pure presentation: 14×14 overhead silhouettes, with sixteen slots per 100×100 tile.
// Stacked shadow, shoulders, collar and head; no upright body or legs.
const color=(value,fallback)=>/^#[\da-f]{6}$/i.test(value??'')?value:fallback;
export function mapToken(appearance={}) {
  const uniform=color(appearance.uniformColor,'#526773'),collar=color(appearance.collarColor,'#9fafab');
  const skin=color(appearance.skinColor,'#b99a7b'),hair=color(appearance.hairColor,'#433a34');
  return `<ellipse cx="0" cy="2" rx="7" ry="5" fill="#071219" opacity=".6"/><rect x="-7" y="-3" width="14" height="8" rx="3" fill="${uniform}"/><rect x="-4" y="-4" width="8" height="6" rx="2" fill="${collar}"/><rect x="-3" y="-6" width="6" height="7" rx="2" fill="${skin}"/><rect x="-3" y="-6" width="6" height="5" rx="2" fill="${hair}"/>`;
}
export function formationSlot(index,cells) {return tileSlots(cells)[index%(cells.length*16)];}
