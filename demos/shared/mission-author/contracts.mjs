export const FAMILIES=Object.freeze(['MISSION_HOOK_CATALOG','MISSION_PATTERN_CATALOG','STAGE_PURPOSE_CATALOG','ENVIRONMENT_ROLE_CATALOG','MISSION_ROLE_CATALOG','GENERIC_NPC_ROLE_CATALOG','INSTANCE_ROLE_CATALOG','INCIDENT_CATALOG','EVENT_CATALOG','FACT_ROLE_CATALOG','CLUE_SOURCE_CATALOG','INTERACTION_INTENT_CATALOG','COMPLICATION_CATALOG','OPTIONAL_OPPORTUNITY_CATALOG','RECOVERY_ROLE_CATALOG','CONSEQUENCE_TYPE_CATALOG','ACT_AVAILABILITY']);
export const ACT_STATES=Object.freeze(['AVAILABLE','PREFERRED','RESTRICTED','FORBIDDEN']);
export const STREAMS=Object.freeze(['destination','hook','pattern','roles','graph','NPC','instances','facts','clues','Incident','Event','optional opportunities']);
export const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
export const identifier=v=>typeof v==='string'&&v.trim()===v&&v.length>0&&!['__proto__','constructor','prototype'].includes(v);
export const version=v=>Number.isSafeInteger(v)&&v>0;
export const strings=v=>Array.isArray(v)&&v.every(identifier)&&new Set(v).size===v.length;
export function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
export function fail(errors){if(errors.length)throw Error(`MISSION AUTHOR VALIDATION ERROR\n${errors.join('\n')}`);}
export function validateRequest(input){
 const errors=[];
 if(!object(input)){fail(['request must be an object']);}
 for(const key of Object.keys(input))if(!['version','seed','actId','destinationId','hookId','patternId','allowRestricted'].includes(key))errors.push(`request.${key}: unsupported field`);
 if(!version(input.version))errors.push('request.version: positive integer required');
 if(!(identifier(input.seed)||Number.isSafeInteger(input.seed)))errors.push('request.seed: nonempty string or safe integer required');
 if(!identifier(input.actId))errors.push('request.actId: explicit Act context required');
 for(const key of ['destinationId','hookId','patternId'])if(input[key]!==undefined&&!identifier(input[key]))errors.push(`request.${key}: invalid ID`);
 if(input.allowRestricted!==undefined&&!strings(input.allowRestricted))errors.push('request.allowRestricted: unique qualified row IDs required');
 fail(errors);return freeze(structuredClone({...input,allowRestricted:input.allowRestricted??[]}));
}
