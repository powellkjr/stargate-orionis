// Pure economic queries. No instance creation, Knowledge reveal, Recipe runner,
// Core selection, resource ledger or inventory mutation belongs here.
const integer=(n,min=0)=>Number.isSafeInteger(n)&&n>=min;
export function validateCargoRecipe(data){
 const nodes=data?.recipe?.bubbles;
 if(data?.format!=='orionis-resource-cargo-playtest-1'||data.recipe.finalEffect!=='CONSUME_TARGET'||!nodes?.length||nodes.length>40||new Set(nodes.map(n=>n.id)).size!==nodes.length)throw Error('Invalid cargo recovery graph.');
 const done=new Set();
 for(const n of nodes){
  if(!n.id||![1,20].includes(n.durationTicks)||!['UNTRAINED','TECHNICIAN','SCIENTIST','SOLDIER','SCOUT','MEDIC','DIPLOMAT'].includes(n.profession)||!integer(n.minimumTier)||n.minimumTier>3||!integer(n.outputWeight)||!Array.isArray(n.reveals)||!Array.isArray(n.dependsOn)||n.dependsOn.some(id=>!done.has(id))||new Set(n.dependsOn).size!==n.dependsOn.length||!(n.toolService===null||typeof n.toolService==='string'))throw Error('Invalid bubble requirements or dependency order.');
  if(n.profession==='UNTRAINED'&&(n.minimumTier!==0||n.toolService!==null))throw Error('Untrained work cannot require a profession Tool.');
  if(n.profession!=='UNTRAINED'&&n.minimumTier===0)throw Error('Qualified work needs an authored tier.');
  done.add(n.id);
 }
 if(!nodes.some(n=>n.outputWeight>0)||['SUPPLY','MATERIAL'].some(f=>data.defaultPolicies?.[f]!=='BALANCED'))throw Error('Invalid provisional recovery policy.');
 return data;
}
export function cargoBand(bands,value){const band=bands.find(b=>value>=b.min&&value<=b.max);if(!integer(value,1)||!band)throw Error('Value outside authored cargo bands.');return band;}
export function validateCargoEconomy(data){
 if(data?.format!=='orionis-resource-cargo-economy-1'||!integer(data.conversionScale,1))throw Error('Invalid cargo economy.');
 for(const bands of [data.sizeBands,data.qualityBands]){
  if(bands?.length!==4||new Set(bands.map(b=>b.id)).size!==4||bands.some((b,i)=>!b.id||!integer(b.min,1)||!integer(b.max,b.min)||(i>0&&b.min!==bands[i-1].max+1)))throw Error('Invalid cargo bands.');
 }
 for(const family of ['SUPPLY','MATERIAL','RATIONS'])if(!data.families?.[family]?.length)throw Error('Missing resource family.');
 for(const tier of [1,2,3])if(!integer(data.tierWeights?.[tier],1))throw Error('Invalid tier weight.');
 for(const policy of ['QUANTITY','BALANCED','QUALITY'])if(!integer(data.policies?.[policy])||data.policies[policy]>100)throw Error('Invalid allocation policy.');
 return data;
}
export function wildCargoYield(data,recipe,cargo,policy){
 validateCargoEconomy(data);
 if(cargo?.mode!=='WILD'||!Array.isArray(recipe?.bubbles)||new Set(recipe.bubbles.map(b=>b.id)).size!==recipe.bubbles.length||recipe.bubbles.some(b=>!b.id))throw Error('Wild cargo needs an actual authored Recipe.');
 const inv=recipe.bubbles.length;cargoBand(data.sizeBands,inv);cargoBand(data.qualityBands,cargo.conversionStat);
 const classes=data.families[cargo.family],tiers=cargo.tiers?.slice().sort((a,b)=>a-b);
 if(!classes||!tiers?.length||tiers.length>2||new Set(tiers).size!==tiers.length||tiers.some(t=>!integer(t,1)||!classes[t-1])||!Object.hasOwn(data.policies,policy))throw Error('Invalid cargo family, tiers or policy.');
 const numerator=inv*cargo.conversionStat,result={};
 for(const tier of tiers){const share=tiers.length===1?100:tier===tiers.at(-1)?data.policies[policy]:100-data.policies[policy];result[classes[tier-1]]=Math.floor(numerator*share/(data.conversionScale*100*data.tierWeights[tier]));}
 return result;
}
export function wildCandidateEligibility(data,recipe,cargo){
 const outputs=wildCargoYield(data,recipe,cargo,'QUANTITY'),size=cargoBand(data.sizeBands,recipe.bubbles.length),high=Math.max(...cargo.tiers);
 const minimum=high>1?size.minimumHighTier[high]:0;
 return {accepted:outputs[data.families[cargo.family][high-1]]>=minimum,outputs,minimum};
}
export function manifestedCargoContents(data,cargo){
 if(cargo?.mode!=='MANIFESTED'||Boolean(cargo.resources)===Boolean(cargo.knowledgeInstanceIds))throw Error('Manifest requires exact resources or persistent Knowledge instance IDs.');
 if(cargo.knowledgeInstanceIds){if(!Array.isArray(cargo.knowledgeInstanceIds)||!cargo.knowledgeInstanceIds.length||cargo.knowledgeInstanceIds.some(id=>typeof id!=='string'||!id)||new Set(cargo.knowledgeInstanceIds).size!==cargo.knowledgeInstanceIds.length)throw Error('Invalid Knowledge manifest.');return {knowledgeInstanceIds:[...cargo.knowledgeInstanceIds]};}
 const classes=Object.values(data.families).flat();if(!Object.keys(cargo.resources).length||Object.entries(cargo.resources).some(([key,n])=>!classes.includes(key)||!integer(n)))throw Error('Invalid exact resource manifest.');
 return {resources:{...cargo.resources}};
}
export function bubbleResourceShare(totals,weights,index){
 if(!Array.isArray(weights)||!weights.length||weights.some(w=>!integer(w))||!integer(index)||index>=weights.length||Object.values(totals).some(n=>!integer(n)))throw Error('Invalid authored output distribution.');
 const sum=weights.reduce((a,b)=>a+b,0);if(sum===0)throw Error('Recipe has no resource-output weight.');
 const before=weights.slice(0,index).reduce((a,b)=>a+b,0),after=before+weights[index];
 return Object.fromEntries(Object.entries(totals).map(([key,total])=>[key,Math.floor(total*after/sum)-Math.floor(total*before/sum)]));
}
