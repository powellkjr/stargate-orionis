// Browser-only ZIP preview: no filesystem extraction and no dependencies.
const MAX_ARCHIVE=128*1024*1024,MAX_TOTAL=192*1024*1024,MAX_FILE=32*1024*1024;
export function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
async function inflateRaw(bytes,limit){
 const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
 const chunks=[];let size=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit)throw Error('ZIP member exceeds its declared size.');chunks.push(value);}}
 catch(error){await reader.cancel().catch(()=>{});throw error;}
 const out=new Uint8Array(size);let offset=0;for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.length;}return out;
}
export async function readSpriteZip(input,{inflate=inflateRaw}={}){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 if(bytes.length>MAX_ARCHIVE)throw Error('ZIP exceeds 128 MiB.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),decoder=new TextDecoder('utf-8',{fatal:true});
 const check=(offset,length)=>{if(offset<0||length<0||offset+length>bytes.length)throw Error('Truncated ZIP.');};
 const u16=offset=>{check(offset,2);return view.getUint16(offset,true);};
 const u32=offset=>{check(offset,4);return view.getUint32(offset,true);};
 let end=-1;
 for(let offset=bytes.length-22;offset>=Math.max(0,bytes.length-65557);offset--)if(u32(offset)===0x06054b50&&offset+22+u16(offset+20)===bytes.length){end=offset;break;}
 if(end<0)throw Error('Not a supported ZIP archive.');
 if(u16(end+4)||u16(end+6)||u16(end+8)!==u16(end+10))throw Error('Multi-volume ZIPs are unsupported.');
 const count=u16(end+10),directorySize=u32(end+12),directory=u32(end+16);
 if(count>256||directory===0xffffffff||directorySize===0xffffffff||directory+directorySize!==end)throw Error('ZIP directory is too large or unsupported (including ZIP64).');
 check(directory,directorySize);let cursor=directory,total=0;const entries=[],names=new Set();
 for(let n=0;n<count;n++){
  check(cursor,46);if(u32(cursor)!==0x02014b50)throw Error('Invalid ZIP directory.');
  const flags=u16(cursor+8),method=u16(cursor+10),crc=u32(cursor+16),compressed=u32(cursor+20),size=u32(cursor+24),nameSize=u16(cursor+28),extra=u16(cursor+30),comment=u16(cursor+32),offset=u32(cursor+42);
  check(cursor+46,nameSize+extra+comment);const path=decoder.decode(bytes.subarray(cursor+46,cursor+46+nameSize));
  if(!path||path.startsWith('/')||path.includes('\\')||path.includes(':')||/[\x00-\x1f]/.test(path)||path.split('/').some(part=>part==='..'||part==='.'))throw Error('Unsafe ZIP member path.');
  if(names.has(path))throw Error('Duplicate ZIP member path.');names.add(path);
  if((u32(cursor+38)>>>16&0xf000)===0xa000)throw Error('ZIP symlinks are unsupported.');
  if(flags&1||u16(cursor+34))throw Error('Encrypted or multi-volume ZIP members are unsupported.');
  if(![0,8].includes(method))throw Error('ZIP compression must be stored or deflate.');
  total+=size;if(size>MAX_FILE||total>MAX_TOTAL||offset===0xffffffff)throw Error('ZIP member or total expanded size exceeds the preview limit.');
  entries.push({path,flags,method,crc,compressed,size,offset});cursor+=46+nameSize+extra+comment;
 }
 if(cursor!==end)throw Error('Invalid ZIP directory length.');
 const files=[];
 for(const entry of entries){
  const {path,offset,method,compressed,size,crc}=entry;
  check(offset,30);if(u32(offset)!==0x04034b50||u16(offset+8)!==method||u16(offset+6)!==entry.flags)throw Error('Invalid ZIP local header.');
  const nameSize=u16(offset+26),extra=u16(offset+28);check(offset+30,nameSize+extra);
  if(decoder.decode(bytes.subarray(offset+30,offset+30+nameSize))!==path)throw Error('ZIP member names disagree.');
  const start=offset+30+nameSize+extra;if(start+compressed>directory)throw Error('ZIP member overlaps its directory.');check(start,compressed);
  if(path.endsWith('/')||!path.toLowerCase().endsWith('.png'))continue;
  const packed=bytes.subarray(start,start+compressed),data=method===0?packed:await inflate(packed,size);
  if(data.length!==size||crc32(data)!==crc)throw Error(`Corrupt ZIP member: ${path}`);
  files.push({name:path.split('/').at(-1),path,bytes:data});
 }
 return files;
}
