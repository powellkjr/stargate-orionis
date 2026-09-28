import {portraitBustSvg} from '../portraits/portrait-bust.mjs?v=personnel-20260925-2';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Shared staffing identity panel; each simulator supplies its own actions below it.
export function personnelPanel(unit,{profession,branch}={}){
  return `<div class="personnel-panel class-chip"><div class="portrait">${portraitBustSvg(unit.portrait?.appearance??unit.appearance)}</div><div class="class-copy"><div class="class-name">${esc(unit.name)}</div><div class="class-short profession">${esc(profession)}</div><div class="class-meta branch-label">${esc(branch??'Base path')}</div><label class="personnel-favorite"><input type="checkbox" data-field="favorite" ${unit.favorite?'checked':''}> Favorite</label></div></div>`;
}
