import {generateGeometry,analyze,failureTest} from './model.mjs';

export function evaluateSeed(seed,config={},failures=true) {
  const geometry=generateGeometry(seed,config),a=analyze(geometry);
  const row={seed,config:geometry.config,connectivity:a.connectivity,components:a.components,gateComponents:a.gateComponents,recommendedHop:a.recommendedHop,averageHops:a.averageHops,maximumHops:a.maximumHops,
    gates:a.totalGates,chokepoints:a.criticalNodes.length,criticalEdgePairs:a.criticalPairs.length,regionalIsolation:a.hopAnalysis.find(r=>r.hop===(a.recommendedHop??20))?.stagingPairs??0};
  if(failures) {
    const baseline=a.largestGateComponent/Math.max(1,a.totalGates);
    for(const [name,type] of [['random1','1%'],['random5','5%'],['pair','pair'],['critical','critical']]) {
      const f=failureTest(geometry,type,`${seed}:failure`,a),after=analyze(geometry,f);
      row[name]={connectivity:after.connectivity,largestGateFraction:after.largestGateComponent/Math.max(1,a.totalGates),disabledNodes:f.nodes.size,disabledPairs:f.pairs.size};
    }
    row.resilience=Math.min(row.random1.largestGateFraction,row.random5.largestGateFraction,row.pair.largestGateFraction,row.critical.largestGateFraction);
    row.pairDependence=baseline-row.pair.largestGateFraction;
  }
  return row;
}

// CLI intentionally has no dependency on browser globals or third-party packages.
if(typeof process!=='undefined'&&process.argv[1]?.replaceAll('\\','/').endsWith('/batch.mjs')) {
  const {writeFile,readFile}=await import('node:fs/promises');
  const args=process.argv.slice(2),get=(flag,fallback)=>{const i=args.indexOf(flag);return i<0?fallback:args[i+1];};
  if(args.includes('--help')) {
    console.log('node demos/world-map-simulator/batch.mjs --count 1000 --prefix candidate --out results.json [--config config.json] [--sort connectivity] [--min-connectivity 0.9] [--no-failures]');
  } else {
    const count=Number(get('--count','10')),prefix=get('--prefix','candidate'),out=get('--out','world-map-seeds.json'),sort=get('--sort','connectivity'),minimum=Number(get('--min-connectivity','0'));
    if(!Number.isInteger(count)||count<1||count>10000) throw Error('Count must be 1–10000.');
    if(!Number.isFinite(minimum)||minimum<0||minimum>1) throw Error('Minimum connectivity must be 0–1.');
    if(!['connectivity','components','gateComponents','recommendedHop','averageHops','maximumHops','gates','chokepoints','criticalEdgePairs','regionalIsolation','pairDependence','resilience'].includes(sort)) throw Error('Unknown sort metric.');
    if(args.includes('--no-failures')&&['resilience','pairDependence'].includes(sort)) throw Error('Failure metrics require failure testing.');
    const cfg=get('--config',null),config=cfg?JSON.parse(await readFile(cfg,'utf8')):{},results=[];
    for(let i=0;i<count;i++) {results.push(evaluateSeed(`${prefix}-${i}`,config,!args.includes('--no-failures')));if((i+1)%10===0||i+1===count) console.error(`${i+1}/${count} seeds analyzed`);}
    const descending=['connectivity','resilience'].includes(sort);
    results.sort((a,b)=>((a[sort]??Infinity)-(b[sort]??Infinity))*(descending?-1:1));
    await writeFile(out,JSON.stringify({version:1,config,results:results.filter(r=>r.connectivity>=minimum)},null,2));
    console.log(`Wrote ${out}`);
  }
}
