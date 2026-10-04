import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {characterStatsLoadout} from './character-stats.mjs';
import {validateLoadout,configuredTools} from '../shared/offworld/personnel-save.mjs';
const catalog=JSON.parse(readFileSync(new URL('../shared/data/offworld/archetypes.json',import.meta.url)));
const unit={unitId:'unit-1',profession:'SOLDIER',tier:1,branch:null,perception:5,stamina:80,endurance:6,toolSlots:[{kitId:'SOT1',charges:3},{kitId:'',charges:0}]};
test('character stat saves preserve deployment configuration and do not mutate it',()=>{
  const before=structuredClone(unit),value=characterStatsLoadout(unit,{perception:0,stamina:100,endurance:1},catalog);
  assert.equal(value.perception,0);assert.equal(value.stamina,100);assert.equal(value.endurance,1);
  assert.equal(value.tier,unit.tier);assert.deepEqual(value.branch,unit.branch);assert.deepEqual(value.toolSlots,unit.toolSlots);
  assert.deepEqual(unit,before);
});
test('character stats reject missing, fractional and out-of-range values',()=>{
  for(const stats of [{perception:11},{perception:1.5},{stamina:-1},{endurance:0},{endurance:NaN}]){
    assert.throws(()=>characterStatsLoadout(unit,{perception:5,stamina:80,endurance:6,...stats},catalog));
  }
});
test('characters without configured slots get empty slots, never automatic tools',()=>{
  const value=characterStatsLoadout({...unit,toolSlots:undefined},{perception:10,stamina:0,endurance:10},catalog);
  assert.deepEqual(value.toolSlots,[{kitId:'',charges:0},{kitId:'',charges:0}]);
});
test('configured Tool arrays validate types, charges, eligibility and equipped selection',()=>{
  const value={...unit,availableTools:[{type:'SOT1',charges:3}]};
  assert.deepEqual(validateLoadout(unit.unitId,unit.profession,value,catalog).availableTools,value.availableTools);
  assert.deepEqual(configuredTools(unit),value.availableTools);
  for(const availableTools of [[{type:'SOT1',charges:4}],[{type:'MET1',charges:3}],[{type:'SOT1',charges:100}],[{type:'SOT1',charges:3},{type:'SOT1',charges:3}],[]]){
    assert.throws(()=>validateLoadout(unit.unitId,unit.profession,{...value,availableTools},catalog));
  }
  assert.deepEqual(characterStatsLoadout(value,{perception:8,stamina:90,endurance:7},catalog).availableTools,value.availableTools);
});