import {rename} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';

// Windows readers/virus scanners can briefly deny replacement. Never unlink the
// destination or overwrite it in place: the old registry must survive failure.
export async function replaceRegistry(source,destination,{renameFile=rename,wait=delay,platform=process.platform}={}){
 const delays=[50,100,200,400,800,1000];
 for(let attempt=0;;attempt++){
  try{await renameFile(source,destination);return;}
  catch(error){
   const locked=platform==='win32'&&['EPERM','EACCES','EBUSY'].includes(error.code);
   if(!locked)throw error;
   if(attempt===delays.length){
    const failure=new Error('Windows blocked replacement of active-sprites.mjs. The previous registry was kept. Close applications locking that file, check folder permissions/security software, then retry installation. Restart the demo server if it is still blocked.',{cause:error});
    failure.code=error.code;throw failure;
   }
   await wait(delays[attempt]);
  }
 }
}