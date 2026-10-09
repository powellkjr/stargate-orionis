import {identifier,object} from './contracts.mjs';
export const ALGORITHM='canonical-fnv1a-mulberry32-v1';
// JSON-compatible inputs only; canonical ordering is independent of locale.
export const compare=(a,b)=>a<b?-1:a>b?1:0;
export function canonical(value){
 if(value===null||typeof value==='boolean'||typeof value==='string')return JSON.stringify(value);
 if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
 if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;
 if(object(value))return `{${Object.keys(value).sort(compare).map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
 throw Error('Deterministic inputs must be finite JSON values.');
}
export function namedRandom(identity,name,key=''){
 if(!identifier(name))throw Error('A named random stream is required.');
 const input=canonical({algorithm:ALGORITHM,identity,name,key});let state=2166136261;
 for(const byte of new TextEncoder().encode(input)){state^=byte;state=Math.imul(state,16777619)>>>0;}
 return ()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export function chooseWeighted(candidates,random){
 const rows=[...candidates].sort((a,b)=>compare(a.id,b.id));
 if(!rows.length)return null;
 if(rows.some(r=>!Number.isFinite(r.weight)||r.weight<=0))throw Error('Selection weights must be positive and finite.');
 const total=rows.reduce((n,r)=>n+r.weight,0);if(!Number.isFinite(total))throw Error('Selection weight total overflow.');
 let cursor=random()*total;
 for(const row of rows){cursor-=row.weight;if(cursor<0)return row;}
 return rows.at(-1);
}
