export async function writableDemoStatus(fetcher=fetch){
  try{
    const response=await fetcher('/api/demo-status',{cache:'no-store'});
    if(!response.ok)return false;
    const value=await response.json();
    return value.service==='orionis-writable-demos'&&value.writable===true;
  }catch{return false;}
}
const status=globalThis.document?.getElementById('hostingStatus');
if(status)status.textContent=await writableDemoStatus()
  ?'Writable local mode: shared base, personnel and portrait JSON saves are available.'
  :'Static/read-only mode: shared JSON saves are unavailable. For local JSON saves, run node demos/serve.mjs and open its /demos/ address.';