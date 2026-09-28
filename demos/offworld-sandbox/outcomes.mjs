const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words=s=>String(s).replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase().replaceAll('_',' ');
export function outcomeLines(m,w){
  if(w.status==='FAILED')return [`Failed: ${w.failure}. No effects or charges were committed.`];
  const lines=w.outcome?.text?[w.outcome.text]:[];
  for(const e of w.outcome?.changes??[]){
    const label=m.indexes.instances[e.instanceId]?.playerLabel??'Target';
    if(e.type==='INSTANCE_CHANGED'&&!(e.field==='interviewed'&&w.outcome?.text))lines.push(e.field==='interviewed'?'Conversation recorded.':`${label}: ${words(e.field)} → ${typeof e.value==='string'?words(e.value):JSON.stringify(e.value)}.`);
    else if(e.type==='TRANSITION_CHANGED')lines.push(`Door ${words(e.state)}.`);
    else if(e.type==='ASSET_SECURED')lines.push(`${label} is secured at the site. Select it for recovery during the debrief.`);
    else if(e.type==='ASSET_SENT_TO_GATE')lines.push(`${label} is waiting at the Gate for extraction.`);
    else if(e.type==='ASSET_CARRIED')lines.push(`${label} is now with the party. Return to SGC to complete recovery.`);
    else if(e.type==='DISCOVERY_CREATED')lines.push(`Discovery recorded: ${e.discoveryId}.`);
  }
  if(w.outcome?.chargesSpent)lines.push(`${w.outcome.chargesSpent} Tool charge(s) spent.`);
  return lines.length?lines:['Action completed; no state change was recorded.'];
}
export function outcomesHtml(m,s){
  const incidents=s.resultEvents.filter(e=>e.type==='INCIDENT_RESOLVED'&&m.indexes.incidents[e.incidentId]?.stageId===s.currentStageId).slice(-3).reverse();
  const incidentHtml=incidents.map(e=>`<article class="action-result"><strong>Incident resolved</strong><small>${esc(e.incidentId.replace('incident-','').replaceAll('-',' '))}</small><ul>${(e.participants??[]).map(p=>`<li>${esc(m.indexes.instances[p.instanceId].playerLabel)}: ${esc(words(p.state??'resolved'))}</li>`).join('')}</ul></article>`).join('');
  const completed=s.activeWork.filter(w=>['COMPLETED','FAILED'].includes(w.status)).slice().reverse();
  const card=w=>{const r=m.indexes.recipes[w.recipeId],t=m.indexes.interactionTargets[r.targetId],actor=s.units.find(u=>u.unitId===w.actorId);return `<article class="action-result"><strong>${esc(r.actionType)} · ${esc(t.transitionId?'Door':m.indexes.instances[t.instanceId].playerLabel)}</strong><small>${esc(actor?.name)} · ${Math.floor(w.completedAt/60)}m ${w.completedAt%60}s · ${w.status}</small><ul>${outcomeLines(m,w).map(line=>`<li>${esc(line)}</li>`).join('')}</ul></article>`;};
  return completed.length||incidents.length?`<h3>Action results</h3>${incidentHtml}${completed.slice(0,3).map(card).join('')}${completed.length>3?`<details><summary>Earlier results (${completed.length-3})</summary>${completed.slice(3).map(card).join('')}</details>`:''}`:'';
}
