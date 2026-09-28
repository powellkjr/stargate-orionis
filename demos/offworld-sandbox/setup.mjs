import {validateLoadout} from '../shared/offworld/personnel-save.mjs?v=dialogue-doors-1';
import {clone} from '../shared/offworld/mission.mjs?v=dialogue-doors-1';
import {MAX_PARTY_SIZE} from '../shared/offworld/runtime.mjs?v=dialogue-doors-1';
import {professions,branches,toolOptions,toolTracks,createTool} from '../shared/offworld/equipment.mjs?v=dialogue-doors-1';
import {personnelPanel} from '../shared/js/personnel-panel.mjs?v=dialogue-doors-1';
import {setPersonnelFavorite} from '../shared/js/personnel-roster.mjs?v=dialogue-doors-1';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function setupRoster(container,presets,catalog,deploy,save=()=>{}){
  container.innerHTML=`<div class="roster-filters"><label>Find personnel<input data-roster-filter="search" type="search" placeholder="Name, Profession or branch"></label><label>Profession<select data-roster-filter="profession"><option value="">All Professions</option>${professions.map(p=>`<option>${p}</option>`).join('')}</select></label><label>Progression<select data-roster-filter="group"><option value="">All paths</option><option value="base">Base</option><option value="specialization">Specialization</option><option value="cross">Cross-path</option></select></label><label><input type="checkbox" data-roster-filter="selected"> Selected party only</label><span class="roster-count" aria-live="polite"></span></div>`+presets.units.map((u,i)=>`<article class="roster-card" style="--profession:${esc(u.color)}" data-unit="${i}">${personnelPanel(u,{profession:`${u.profession} ${u.tier}`,branch:u.branch?`${u.branch.id} ${u.branch.tier}`:'Base path'})}<details class="loadout-details"><summary>Stats &amp; equipment</summary><div class="stats">${[['tier','Tier',1,3],['perception','PER',0,10],['stamina','STA',0,100],['endurance','END',1,10]].map(([field,label,min,max])=>`<label>${label}<input type="number" data-field="${field}" aria-label="${esc(u.name)} ${label}" min="${min}" max="${max}" step="1" value="${u[field]}"></label>`).join('')}</div><div class="branch-row"><label>Branch (requires base Tier III)<select data-field="branch"><option value="">Base Profession only</option><optgroup label="Cross-path">${professions.filter(p=>p!==u.profession).map(p=>`<option value="cross:${p}">${p}</option>`).join('')}</optgroup><optgroup label="Specialization">${branches[u.profession].map(p=>`<option value="specialization:${p}">${p}</option>`).join('')}</optgroup></select></label><label>Branch tier<select data-field="branchTier"><option value="0">0 · uncertified</option><option value="1" selected>I</option><option value="2">II</option><option value="3">III</option></select></label></div><div class="tool-slots">${[0,1].map(slot=>`<div><label>Tool slot ${slot+1}<select data-slot="${slot}"></select></label><label>Charges<input data-charges="${slot}" type="number" min="0" max="99" value="3"></label><small data-slot-note="${slot}"></small></div>`).join('')}</div></details><label class="select-unit"><input type="checkbox" data-field="selected" > Include in active party</label></article>`).join('');
  function unitFromCard(el){
    const u=clone(presets.units[Number(el.dataset.unit)]);
    for(const f of ['tier','perception','stamina','endurance'])u[f]=Number(el.querySelector(`[data-field=${f}]`).value);
    const branch=el.querySelector('[data-field=branch]').value;
    u.branch=branch?{kind:branch.split(':')[0],id:branch.split(':')[1],tier:Number(el.querySelector('[data-field=branchTier]').value)}:null;
    return u;
  }
  function updateCard(el){
    const branch=el.querySelector('[data-field=branch]'),tier=Number(el.querySelector('[data-field=tier]').value);
    branch.disabled=tier!==3;if(branch.disabled)branch.value='';el.querySelector('[data-field=branchTier]').disabled=!branch.value;
    const u=unitFromCard(el),options=toolOptions(u,catalog);
    el.querySelector('.profession').textContent=`${u.profession} ${u.tier}`;
    el.querySelector('.branch-label').textContent=u.branch?`${u.branch.id} ${u.branch.tier}`:'Base Profession';
    for(const slot of [0,1]){
      const select=el.querySelector(`[data-slot="${slot}"]`),old=select.value,initialized=select.dataset.initialized;
      const enabled=slot===0||toolTracks(u).length===2;
      select.innerHTML='<option value="">Empty</option>'+options.map(o=>`<option value="${o.id}">${esc(o.label)}</option>`).join('');
      select.disabled=!enabled;el.querySelector(`[data-charges="${slot}"]`).disabled=!enabled;
      select.value=enabled?(options.some(o=>o.id===old)?old:initialized?'':options.filter(o=>o.track===(slot===0?u.profession:u.branch?.id)&&!catalog.tools[o.id]?.variant).at(-1)?.id??''):'';
      select.dataset.initialized='true';el.querySelector(`[data-slot-note="${slot}"]`).textContent=enabled?'Eligible base / branch kits':'Unlock with a certified cross-path or specialization';
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
  container.onchange=event=>{if(event.target.dataset.field==='favorite'){const u=presets.units[event.target.closest('[data-unit]').dataset.unit];setPersonnelFavorite(u.unitId,event.target.checked);u.favorite=event.target.checked;sortFavorites();}if(['tier','branch','branchTier'].includes(event.target.dataset.field))updateCard(event.target.closest('[data-unit]'));updateSelection();
    const card=event.target.closest('[data-unit]');
    if(card&&event.target.dataset.field!=='selected'&&event.target.dataset.field!=='favorite'){
      const u=unitFromCard(card);
      try{const value=validateLoadout(u.unitId,u.profession,{...u,toolSlots:[0,1].map(i=>({kitId:card.querySelector(`[data-slot="${i}"]`).value,charges:Number(card.querySelector(`[data-charges="${i}"]`).value)}))},catalog);Object.assign(presets.units[card.dataset.unit],value);save(u,value);event.target.setCustomValidity('');}
      catch(error){event.target.setCustomValidity(error.message);event.target.reportValidity();}
    }
  };
  container.oninput=event=>{if(event.target.dataset.rosterFilter)filterRoster();};
  container.querySelectorAll('[data-unit]').forEach(card=>{const u=presets.units[Number(card.dataset.unit)];if(u.branch){card.querySelector('[data-field=branch]').value=`${u.branch.kind}:${u.branch.id}`;card.querySelector('[data-field=branchTier]').value=u.branch.tier;}updateCard(card);});
  container.querySelectorAll('[data-unit]').forEach(card=>{const u=presets.units[card.dataset.unit];if(u.toolSlots)for(const [i,t] of u.toolSlots.entries()){card.querySelector(`[data-slot="${i}"]`).value=t.kitId;card.querySelector(`[data-charges="${i}"]`).value=t.charges;}});
  sortFavorites();updateSelection();
  return ()=>[...container.querySelectorAll('[data-unit]')].filter(el=>el.querySelector('[data-field=selected]').checked).map(el=>{
    const u=unitFromCard(el);u.tools=[];
    for(const slot of [0,1]){
      const charges=Number(el.querySelector(`[data-charges="${slot}"]`).value);
      if(!Number.isInteger(charges)||charges<0||charges>99)throw new Error('Tool charges must be 0–99.');
      const tool=createTool(u,slot,el.querySelector(`[data-slot="${slot}"]`).value,charges,catalog);if(tool)u.tools.push(tool);
    }
    return u;
  });
}
