import {FAMILIES,ACT_STATES,object,identifier,strings,version,freeze,fail} from './contracts.mjs';
const ROW_FIELDS=['id','version','label','description','weight','support','unavailableReason','refs','links','requirements','actAvailability'];
const REQUIREMENTS=['sourceTypes','realityFacts','knownFacts','roles','realityTheories'];
export function validateCatalogs(input,registry){
 const errors=[];
 if(!object(input))fail(['catalog pack must be an object']);
 for(const key of Object.keys(input))if(!['format','id','version','catalogs'].includes(key))errors.push(`pack.${key}: unsupported field`);
 if(input.format!=='mission-author-catalogs-1'||!identifier(input.id)||!version(input.version)||!object(input.catalogs))errors.push('pack: format, ID, version and catalogs required');
 const indexes=Object.create(null),catalogs=input.catalogs??{};
 for(const family of Object.keys(catalogs))if(!FAMILIES.includes(family))errors.push(`unknown catalog ${family}`);
 for(const family of FAMILIES){
  indexes[family]=Object.create(null);const catalog=catalogs[family];
  if(!object(catalog)||!version(catalog.version)||!Array.isArray(catalog.rows)){errors.push(`${family}: version and rows required`);continue;}
  for(const key of Object.keys(catalog))if(!['version','rows'].includes(key))errors.push(`${family}.${key}: unsupported field`);
  for(const row of catalog.rows){
   if(!object(row)){errors.push(`${family}: row must be an object`);continue;}
   const path=`${family}.${row.id}`;
   if(!identifier(row.id)||indexes[family][row.id])errors.push(`${path}: missing or duplicate ID`);
   else indexes[family][row.id]=row;
   for(const key of Object.keys(row))if(!ROW_FIELDS.includes(key))errors.push(`${path}.${key}: unsupported field`);
   if(!version(row.version)||!identifier(row.label)||typeof row.description!=='string'||!Number.isFinite(row.weight)||row.weight<=0)errors.push(`${path}: version, label, description and positive weight required`);
   if(!['SUPPORTED','UNRESOLVED'].includes(row.support)||row.support==='UNRESOLVED'&&!identifier(row.unavailableReason))errors.push(`${path}: unresolved content needs an explicit reason`);
   if(!Array.isArray(row.refs))errors.push(`${path}: refs must be an array`);
   else {const seen=new Set();for(const ref of row.refs){const key=`${ref?.kind}:${ref?.id}`;if(!object(ref)||!identifier(ref.kind)||!identifier(ref.id)||Object.keys(ref).some(k=>!['kind','id'].includes(k))||!registry.tables[ref.kind]?.[ref.id]||seen.has(key))errors.push(`${path}: invalid or duplicate authority reference ${key}`);seen.add(key);}}
   if(!object(row.links))errors.push(`${path}: links must be an object`);
   else for(const [target,ids] of Object.entries(row.links))if(!FAMILIES.includes(target)||!strings(ids))errors.push(`${path}: invalid catalog links ${target}`);
   if(!object(row.requirements))errors.push(`${path}: requirements must be an object`);
   else for(const [key,values] of Object.entries(row.requirements))if(!REQUIREMENTS.includes(key)||!strings(values))errors.push(`${path}: invalid requirement ${key}`);
   if(family==='MISSION_ROLE_CATALOG'&&row.requirements?.roles?.length)errors.push(`${path}: role requirements may not recursively require other roles`);
   if(!object(row.actAvailability)||!Object.hasOwn(row.actAvailability,'*')||Object.entries(row.actAvailability).some(([act,state])=>!identifier(act)||!ACT_STATES.includes(state)))errors.push(`${path}: Act availability with explicit wildcard policy required`);
  }
 }
 for(const family of FAMILIES)for(const row of Object.values(indexes[family])){
  for(const [target,ids] of Object.entries(row.links??{}))if(FAMILIES.includes(target)&&Array.isArray(ids))for(const id of ids)if(!indexes[target][id])errors.push(`${family}.${row.id}: unknown ${target} reference ${id}`);
  for(const role of Array.isArray(row.requirements?.roles)?row.requirements.roles:[])if(!indexes.MISSION_ROLE_CATALOG[role])errors.push(`${row.id}: unknown mission role ${role}`);
  for(const id of Array.isArray(row.requirements?.realityTheories)?row.requirements.realityTheories:[])if(!registry.tables.theory[id])errors.push(`${row.id}: unknown Theory ${id}`);
 }
 for(const state of ACT_STATES)if(!indexes.ACT_AVAILABILITY[state])errors.push(`ACT_AVAILABILITY: missing ${state}`);
 fail(errors);return freeze(structuredClone({...input,indexes}));
}
