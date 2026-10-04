import {validateLoadout,configuredTools} from '../shared/offworld/personnel-save.mjs?v=dialogue-doors-1';
import {statsRadar} from '../shared/portraits/stats-radar.mjs';
import {clone} from '../shared/offworld/mission.mjs?v=dialogue-doors-1';
import {MAX_PARTY_SIZE} from '../shared/offworld/runtime.mjs?v=dialogue-doors-1';
import {professions,secondToolSlotUnlocked,createTool} from '../shared/offworld/equipment.mjs?v=dialogue-doors-1';
import {personnelPanel} from '../shared/js/personnel-panel.mjs?v=dialogue-doors-1';
import {setPersonnelFavorite} from '../shared/js/personnel-roster.mjs?v=dialogue-doors-1';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function setupRoster(container,presets,catalog,deploy,save=()=>{}){
  container.innerHTML=`<div class="roster-filters"><label>Find personnel<input data-roster-filter="search" type="search" placeholder="Name, Profession or branch"></label><label>Profession<select data-roster-filter="profession"><option value="">All Professions</option>${professions.map(p=>`<option>${p}</option>`).join('')}</select></label><label>Progression<select data-roster-filter="group"><option value="">All paths</option><option value="base">Base</option><option value="specialization">Specialization</option><option value="cross">Cross-path</option></select></label><label><input type="checkbox" data-roster-filter="selected"> Selected party only</label><span class="roster-count" aria-live="polite"></span></div>`+presets.units.map((u,i)=>`<article class="roster-card" style="--profession:${esc(u.color)}" data-unit="${i}">${personnelPanel(u,{profession:`${u.profession} ${u.tier}`,branch:u.branch?`${u.branch.id} ${u.branch.tier}`:'Base path'})}<div class="stats-chart">${statsRadar(u)}</div><div class="tool-slots">${[0,1].map(slot=>`<label>Tool ${slot+1}<select data-slot="${slot}" aria-label="${esc(u.name)} Tool ${slot+1}"></select></label>`).join('')}</div><small>Configure progression and Tools in the <a href="../portrait-simulator/">character editor</a>.</small><label class="select-unit"><input type="checkbox" data-field="selected" > Include in active party</label></article>`).join('');
  function unitFromCard(el){
    const u=clone(presets.units[Number(el.dataset.unit)]);
    u.availableTools=configuredTools(u);
    u.toolSlots=[0,1].map(slot=>{const type=el.querySelector(`[data-slot="${slot}"]`).value;return {kitId:type,charges:u.availableTools.find(t=>t.type===type)?.charges??0};});
    return u;
  }
  function updateCard(el){
    const u=presets.units[el.dataset.unit],options=configuredTools(u);
    for(const slot of [0,1]){
      const select=el.querySelector(`[data-slot="${slot}"]`),enabled=slot===0||secondToolSlotUnlocked(u);
      select.innerHTML='<option value="">Empty</option>'+options.map(t=>`<option value="${esc(t.type)}">${esc(catalog.tools[t.type]?.label??t.type)} - ${t.charges} charges</option>`).join('');
      select.disabled=!enabled;select.value=enabled?(u.toolSlots?.[slot]?.kitId??''):'';
    }
  }
  function filterRoster(){
    const search=container.querySelector('[data-roster-filter=search]').value.toLowerCase(),profession=container.querySelector('[data-roster-filter=profession]').value,group=container.querySelector('[data-roster-filter=group]').value,selected=container.querySelector('[data-roster-filter=selected]').checked;
    let visible=0;
    for(const card of container.querySelectorAll('[data-unit]')){const u=presets.units[Number(card.dataset.unit)];card.hidden=!( (!search||`${u.name} ${u.profession} ${u.branch?.id??''}`.toLowerCase().includes(search))&&(!profession||u.profession===profession)&&(!group||u.rosterGroup===group)&&(!selected||card.querySelector('[data-field=selected]').checked));if(!card.hidden)visible++;}
    container.querySelector('.roster-count').textContent=`${visible} / ${presets.units.length} personnel`;
  }
  function sortFavorites(){
    const cards=[...container.querySelectorAll('[data-unit]')];
    cards.sort((a,b)=>Number(presets.units[b.dataset.unit].favorite)-Number(presets.units[a.dataset.unit].favorite)||Number(a.dataset.unit)-Number(b.dataset.unit));
    cards.forEach(card=>container.append(card));
  }
  function updateSelection(){
    const boxes=[...container.querySelectorAll('[data-field=selected]')],count=boxes.filter(b=>b.checked).length;
    for(const box of boxes)box.disabled=!box.checked&&count>=MAX_PARTY_SIZE;
    deploy.textContent=`Deploy party (${count}/${MAX_PARTY_SIZE}) →`;deploy.disabled=count===0||count>MAX_PARTY_SIZE;filterRoster();
  }
  container.onchange=event=>{
    const card=event.target.closest('[data-unit]');
    if(event.target.dataset.field==='favorite'){const u=presets.units[card.dataset.unit];setPersonnelFavorite(u.unitId,event.target.checked);u.favorite=event.target.checked;sortFavorites();}
    updateSelection();
    if(card&&event.target.dataset.slot!==undefined){
      const u=unitFromCard(card);
      try{const value=validateLoadout(u.unitId,u.profession,u,catalog);Object.assign(presets.units[card.dataset.unit],value);save(u,value);event.target.setCustomValidity('');}
      catch(error){event.target.setCustomValidity(error.message);event.target.reportValidity();}
    }
  };
  container.oninput=event=>{if(event.target.dataset.rosterFilter)filterRoster();};
  container.querySelectorAll('[data-unit]').forEach(updateCard);
  sortFavorites();updateSelection();
  return ()=>[...container.querySelectorAll('[data-unit]')].filter(el=>el.querySelector('[data-field=selected]').checked).map(el=>{
    const u=unitFromCard(el);u.tools=[];
    for(const slot of [0,1]){
      const charges=u.toolSlots[slot].charges;
      if(!Number.isInteger(charges)||charges<0||charges>99)throw new Error('Tool charges must be 0–99.');
      const tool=createTool(u,slot,el.querySelector(`[data-slot="${slot}"]`).value,charges,catalog);if(tool)u.tools.push(tool);
    }
    return u;
  });
}
