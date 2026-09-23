import {generateGeometry,analyze} from './model.mjs';
import {evaluateSeed} from './batch.mjs';
self.onmessage=({data})=>{
  try {
    if(data.type==='batch') {
      for(let i=0;i<data.count;i++) self.postMessage({type:'batch-row',row:evaluateSeed(`${data.prefix}-${i}`,data.config),index:i+1,count:data.count});
      self.postMessage({type:'batch-done'});
    } else {
      const geometry=data.geometry??generateGeometry(data.seed,data.config),analysis=analyze(geometry,data.failures);
      self.postMessage({type:'analyzed',id:data.id,geometry,analysis});
    }
  } catch(error) {self.postMessage({type:'error',id:data.id,message:error.message});}
};
