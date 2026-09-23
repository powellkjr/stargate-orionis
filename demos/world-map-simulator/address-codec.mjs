// Reversible visible-address encoding. Logical coordinates remain separate.
export const DEFAULT_ADDRESS_CODEC = Object.freeze({
  majorRadius: 3,
  minorRadius: 3,
  zRange: 5,
  endpointRange: 16,
  destinationGlyphCount: 24,
  addressGlyphCount: 6
});

export function permutationCount(n,k) {
  if(!Number.isInteger(n)||!Number.isInteger(k)||n<0||k<0||k>n) return 0;
  if(n>64)throw Error('Destination alphabet cannot exceed 64 glyphs in this simulator.');
  let result=1;
  for(let i=0;i<k;i++) {result*=n-i;if(!Number.isSafeInteger(result))throw Error('Permutation capacity exceeds safe integer precision.');}
  return result;
}

export function validHexCells(radius) {
  if(!Number.isSafeInteger(radius)||radius<0||radius>100)throw Error('Hex radius must be an integer from 0 to 100.');
  const cells=[];
  for(let q=-radius;q<=radius;q++) for(let r=-radius;r<=radius;r++) {
    if(Math.abs(q+r)<=radius) cells.push({q,r,s:-q-r});
  }
  return cells;
}

function codecConfig(input={}) {
  const c={...DEFAULT_ADDRESS_CODEC,...input};
  for(const key of ['majorRadius','minorRadius','zRange','endpointRange','destinationGlyphCount','addressGlyphCount']) {
    if(!Number.isInteger(c[key])||c[key]<0) throw Error(`${key} must be a nonnegative integer.`);
  }
  if(c.addressGlyphCount>c.destinationGlyphCount) throw Error('Address glyph count cannot exceed destination glyph count.');
  if(c.addressGlyphCount!==6)throw Error('A destination requires six glyphs; Origin remains separate.');
  if(c.zRange>100||c.endpointRange<1||c.endpointRange>1000) throw Error('Address ranges are invalid.');
  const capacity=permutationCount(c.destinationGlyphCount,c.addressGlyphCount);
  const logicalCount=validHexCells(c.majorRadius).length*validHexCells(c.minorRadius).length*(2*c.zRange+1)*c.endpointRange;
  if(logicalCount>capacity) throw Error(`Logical address count ${logicalCount} exceeds glyph permutation capacity ${capacity}.`);
  return c;
}

function indexes(address,c) {
  if(!address||!['Q','R','q','r','Z','endpoint'].every(k=>Number.isSafeInteger(address[k])))throw Error('Logical address fields must be integers.');
  const major=validHexCells(c.majorRadius), minor=validHexCells(c.minorRadius);
  const majorIndex=major.findIndex(p=>p.q===address.Q&&p.r===address.R);
  const minorIndex=minor.findIndex(p=>p.q===address.q&&p.r===address.r);
  const zIndex=address.Z+c.zRange;
  if(majorIndex<0||minorIndex<0||zIndex<0||zIndex>2*c.zRange||!Number.isInteger(address.endpoint)||address.endpoint<0||address.endpoint>=c.endpointRange) throw Error('Address is outside the configured logical address space.');
  return {majorIndex,minorIndex,zIndex,endpointIndex:address.endpoint,major,minor};
}

export function addressIndex(address,input={}) {
  const c=codecConfig(input),i=indexes(address,c);
  return (((i.majorIndex*i.minor.length)+i.minorIndex)*(2*c.zRange+1)+i.zIndex)*c.endpointRange+i.endpointIndex;
}

export function decodeAddressIndex(index,input={}) {
  const c=codecConfig(input),major=validHexCells(c.majorRadius),minor=validHexCells(c.minorRadius);
  const logicalCount=major.length*minor.length*(2*c.zRange+1)*c.endpointRange;
  if(!Number.isInteger(index)||index<0||index>=logicalCount) throw Error('Address index is outside the configured logical address space.');
  const endpoint=index%c.endpointRange; index=Math.floor(index/c.endpointRange);
  const zIndex=index%(2*c.zRange+1); index=Math.floor(index/(2*c.zRange+1));
  const minorIndex=index%minor.length; const majorIndex=Math.floor(index/minor.length);
  return {Q:major[majorIndex].q,R:major[majorIndex].r,q:minor[minorIndex].q,r:minor[minorIndex].r,Z:zIndex-c.zRange,endpoint};
}

export function unrankPartialPermutation(rank,alphabetSize=24,sequenceLength=6) {
  const capacity=permutationCount(alphabetSize,sequenceLength);
  if(!Number.isInteger(rank)||rank<0||rank>=capacity) throw Error('Permutation rank is outside the configured capacity.');
  const available=Array.from({length:alphabetSize},(_,i)=>i),result=[];
  for(let position=0;position<sequenceLength;position++) {
    const blockSize=permutationCount(available.length-1,sequenceLength-position-1);
    const selectionIndex=Math.floor(rank/blockSize);
    rank%=blockSize;
    result.push(available.splice(selectionIndex,1)[0]);
  }
  return result;
}

export function rankPartialPermutation(glyphIds,alphabetSize=24) {
  if(!Array.isArray(glyphIds)||!Number.isSafeInteger(alphabetSize)||alphabetSize<0||alphabetSize>64)throw Error('Invalid destination glyph alphabet or sequence.');
  permutationCount(alphabetSize,glyphIds.length);
  const sequenceLength=glyphIds.length;
  if(sequenceLength>alphabetSize||new Set(glyphIds).size!==sequenceLength) throw Error('Destination glyph sequence must contain unique glyph IDs.');
  const available=Array.from({length:alphabetSize},(_,i)=>i); let rank=0;
  for(let position=0;position<sequenceLength;position++) {
    const selectionIndex=available.indexOf(glyphIds[position]);
    if(selectionIndex<0) throw Error('Invalid destination glyph ID.');
    rank+=selectionIndex*permutationCount(available.length-1,sequenceLength-position-1);
    available.splice(selectionIndex,1);
  }
  return rank;
}

export function encodeAddress(address,input={}) {
  const c=codecConfig(input),index=addressIndex(address,c);
  return unrankPartialPermutation(index,c.destinationGlyphCount,c.addressGlyphCount);
}

export function decodeAddress(glyphIds,input={}) {
  const c=codecConfig(input);
  if(!Array.isArray(glyphIds)||glyphIds.length!==c.addressGlyphCount) throw Error(`Destination address must contain exactly ${c.addressGlyphCount} glyphs.`);
  return decodeAddressIndex(rankPartialPermutation(glyphIds,c.destinationGlyphCount),c);
}

export function logicalAddressCount(input={}) {
  const c=codecConfig(input);
  return validHexCells(c.majorRadius).length*validHexCells(c.minorRadius).length*(2*c.zRange+1)*c.endpointRange;
}
