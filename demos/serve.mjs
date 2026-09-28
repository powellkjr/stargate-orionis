import {validateBase} from './shared/js/base-configuration.mjs';
import {createServer} from 'node:http';
import {readFile,writeFile,rename,realpath} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validateLoadout} from './shared/offworld/personnel-save.mjs';
import {buildPersonnelRoster} from './shared/js/personnel-roster.mjs';
import {branches} from './shared/offworld/equipment.mjs';
import {normalizeAppearance} from './shared/portraits/portrait-bust.mjs';
const project=fileURLToPath(new URL('../',import.meta.url));
export function demoServer(root=project){
    const dataPath=resolve(root,'demos/shared/data/personnel-loadouts.json'),presentationPath=resolve(root,'demos/shared/data/personnel-presentation.json');let queue=Promise.resolve();
  const json=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
  return createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');
    try{
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/api/base-configuration'){
        if(req.method!=='PUT'){res.writeHead(405).end();return;}
        if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.writeHead(403).end();return;}
        let body='';for await(const chunk of req){body+=chunk;if(body.length>1048576)throw Error('Request too large.');}
        const input=JSON.parse(body);let saved;
        const save=queue.then(async()=>{
          const current=await json('demos/shared/data/base-configuration.json');
          if(input.revision!==current.revision)throw Error('Base changed in another simulator. Reload the base and try again.');
          saved=validateBase(input,await json('demos/shared/data/rooms_schema.json'));saved.revision++;
          const path=resolve(root,'demos/shared/data/base-configuration.json');await writeFile(path+'.tmp',JSON.stringify(saved,null,2)+'\n');await rename(path+'.tmp',path);
        });queue=save.catch(()=>{});await save;res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(saved));return;
      }
      if(url.pathname.startsWith('/api/personnel/')){
        if(req.method!=='PUT'){res.writeHead(405).end();return;}
        if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.writeHead(403).end();return;}
        const id=url.pathname.slice('/api/personnel/'.length);
        if(!/^unit-\d+$/.test(id))throw new Error('Invalid personnel ID.');
        let body='';for await(const chunk of req){body+=chunk;if(body.length>8192)throw new Error('Request too large.');}
        const input=JSON.parse(body);
        const save=queue.then(async()=>{
          const [data,catalog,classes,names]=await Promise.all([json('demos/shared/data/personnel-loadouts.json'),json('demos/shared/data/offworld/archetypes.json'),json('demos/shared/data/base-classes.json'),json('demos/shared/data/personnel-names.json')]);
          if(!Object.hasOwn(data.units,id))throw new Error('Unknown personnel ID.');
          const profession=buildPersonnelRoster(classes,names.pools,Object.fromEntries(Object.entries(branches).map(([k,v])=>[k.toLowerCase(),v]))).find(u=>u.id===id)?.classId.toUpperCase();
          data.units[id]=validateLoadout(id,profession,input,catalog);
          await writeFile(dataPath+'.tmp',JSON.stringify(data,null,2)+'\n');await rename(dataPath+'.tmp',dataPath);
        });queue=save.catch(()=>{});await save;res.writeHead(200,{'Content-Type':'application/json'}).end('{"saved":true}');return;
      }
      if(url.pathname.startsWith('/api/personnel-presentation/')){
        if(req.method!=='PUT'){res.writeHead(405).end();return;}
        if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.writeHead(403).end();return;}
        const id=url.pathname.slice('/api/personnel-presentation/'.length);
        if(!/^unit-\d+$/.test(id))throw new Error('Invalid personnel ID.');
        let body='';for await(const chunk of req){body+=chunk;if(body.length>8192)throw new Error('Request too large.');}
        const input=JSON.parse(body),appearance=normalizeAppearance(input?.portrait?.appearance??input?.appearance);
        const save=queue.then(async()=>{
          const data=await json('demos/shared/data/personnel-presentation.json');
          if(!Object.hasOwn(data.units,id))throw new Error('Unknown personnel ID.');
          data.units[id]={...data.units[id],portrait:{renderer:'bust',appearance}};
          await writeFile(presentationPath+'.tmp',JSON.stringify(data,null,2)+'\n');await rename(presentationPath+'.tmp',presentationPath);
        });queue=save.catch(()=>{});await save;res.writeHead(200,{'Content-Type':'application/json'}).end('{"saved":true}');return;
      }
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
      let pathname=decodeURIComponent(url.pathname);if(pathname.endsWith('/'))pathname+='index.html';
      const file=await realpath(resolve(root,'.'+pathname));
      if(!file.startsWith(resolve(root)+sep)||file.includes(`${sep}.git${sep}`)){res.writeHead(403).end();return;}
      const bytes=await readFile(file),type={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'}[extname(file)]??'application/octet-stream';
      res.writeHead(200,{'Content-Type':type});res.end(req.method==='HEAD'?undefined:bytes);
    }catch(error){res.writeHead(error.code==='ENOENT'?404:400,{'Content-Type':'application/json'}).end(JSON.stringify({error:error.message}));}
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const port=Number(process.argv[2]??8001);demoServer().listen(port,'127.0.0.1',()=>console.log(`Writable demos: http://127.0.0.1:${port}/demos/offworld-sandbox/`));}
