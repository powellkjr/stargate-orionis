import {freeze} from './contracts.mjs';
export function candidateTrace(family,rows,selectedId=null){return freeze(structuredClone({family,candidates:rows,selectedId}));}
export function resultTrace(identity,decisions,warnings){return freeze(structuredClone({format:'mission-author-trace-1',identity,decisions,warnings}));}
