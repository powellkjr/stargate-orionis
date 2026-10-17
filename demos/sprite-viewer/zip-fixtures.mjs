// Test-only archive builder; browser uses stored entries, Node can supply deflate.
import {crc32} from './zip.mjs';
export function zipFixture(entries,{compress=null}={}){
 const chunks=[],records=[];let offset=0;
 for(const [path,data] of entries){
  const name=new TextEncoder().encode(path),packed=compress?compress(data):data,method=compress?8:0;
  const local=new Uint8Array(30+name.length),l=new DataView(local.buffer);
  l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(8,method,true);l.setUint32(14,crc32(data),true);l.setUint32(18,packed.length,true);l.setUint32(22,data.length,true);l.setUint16(26,name.length,true);local.set(name,30);
  const central=new Uint8Array(46+name.length),c=new DataView(central.buffer);
  c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(10,method,true);c.setUint32(16,crc32(data),true);c.setUint32(20,packed.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);central.set(name,46);
  chunks.push(local,packed);records.push(central);offset+=local.length+packed.length;
 }
 const directorySize=records.reduce((n,r)=>n+r.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);
 e.setUint32(0,0x06054b50,true);e.setUint16(8,entries.length,true);e.setUint16(10,entries.length,true);e.setUint32(12,directorySize,true);e.setUint32(16,offset,true);
 const result=new Uint8Array(offset+directorySize+22);let cursor=0;
 for(const chunk of [...chunks,...records,end]){result.set(chunk,cursor);cursor+=chunk.length;}return result;
}
