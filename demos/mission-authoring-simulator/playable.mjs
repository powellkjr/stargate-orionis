import {compileMission} from '../shared/offworld/mission.mjs';

// Preserve authored execution rules and physical identities. A new mission ID
// identifies a scenario variant, not a newly spawned copy of its physical cast.
export function authorMission(source,{missionId,title,briefing}){
 const raw=structuredClone(source);
 if(!raw.mission||typeof raw.mission!=='object')throw Error('An Offworld mission definition is required. Semantic Drafts need a Finalizer.');
 if(typeof missionId!=='string'||!missionId.trim()||!title?.trim())throw Error('Enter a mission ID and title.');
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(missionId.trim()))throw Error('Mission ID must use letters, numbers, underscores or hyphens.');
 if(typeof briefing!=='string'||!briefing.trim())throw Error('Enter a player briefing.');
 raw.mission.missionId=missionId.trim();raw.mission.title=title.trim();
 raw.mission.briefing={...raw.mission.briefing,playerText:briefing.trim()};
 return raw;
}

export function validatePlayable(raw,catalog){
 const definition=compileMission(raw,catalog);
 return {definition,summary:{stages:definition.stages.length,objectives:definition.objectives.length,recipes:definition.recipes.length,startStageId:definition.gate.stageId}};
}

export function playableText(raw,catalog){validatePlayable(raw,catalog);return JSON.stringify(raw,null,2)+'\n';}
