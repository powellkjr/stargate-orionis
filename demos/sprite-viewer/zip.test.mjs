import test from 'node:test';import assert from 'node:assert/strict';import {inflateRawSync,deflateRawSync} from 'node:zlib';
import {readSpriteZip,crc32} from './zip.mjs';import {zipFixture} from './zip-fixtures.mjs';
const content=new TextEncoder().encode('123456789'),path='anything/floor-indoor__v01__source.png';
test('ZIP previews accept stored/deflate PNG candidates without strict batch names or counts',async()=>{
 assert.equal(crc32(content),0xcbf43926);
 for(const compress of [null,deflateRawSync]){
  const files=await readSpriteZip(zipFixture([[path,content],['notes.txt',content]],{compress}),{inflate:inflateRawSync});
  assert.equal(files.length,1);assert.equal(files[0].path,path);assert.deepEqual([...files[0].bytes],[...content]);
 }
});
test('bad archives reject unsafe paths, duplicates, corruption, encryption and oversized declarations',async()=>{
 for(const name of ['../escape.png','/absolute.png','C:/file.png','nested/../file.png','dir\\file.png'])await assert.rejects(()=>readSpriteZip(zipFixture([[name,content]])),/Unsafe/);
 await assert.rejects(()=>readSpriteZip(zipFixture([[path,content],[path,content]])),/Duplicate/);
 const corrupt=zipFixture([[path,content]]);corrupt[30+path.length]^=1;await assert.rejects(()=>readSpriteZip(corrupt),/Corrupt/);
 const encrypted=zipFixture([[path,content]]),dir=30+path.length+content.length;new DataView(encrypted.buffer).setUint16(dir+8,1,true);await assert.rejects(()=>readSpriteZip(encrypted),/Encrypted/);
 const huge=zipFixture([[path,content]]);new DataView(huge.buffer).setUint32(dir+24,33*1024*1024,true);await assert.rejects(()=>readSpriteZip(huge),/size exceeds/);
 await assert.rejects(()=>readSpriteZip(content),/supported ZIP/);
 await assert.rejects(()=>readSpriteZip(corrupt.subarray(0,corrupt.length-5)),/supported ZIP/);
});
