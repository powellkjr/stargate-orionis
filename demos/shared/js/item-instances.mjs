export function createArrivalStore(){
  const instances={};
  const queue=[];
  let serial=0;
  function resize(capacity){
    const used=queue.reduce((sum,id)=>sum+(id?instances[id].custody.cost.extendedCost:0),0);
    if(queue.filter(Boolean).length>capacity || used>capacity)throw new Error("Receiving capacity is occupied; keep the current construction tier.");
    const occupied=queue.filter(Boolean);
    queue.splice(0,queue.length,...occupied);
    while(queue.length<capacity)queue.push(null);
    queue.length=capacity;
  }
  function receive(item,config){
    const occupied=queue.filter(Boolean);
    if(occupied.length>=queue.length)throw new Error("Receiving queue is full.");
    if(!config.storageClasses.some(value=>item.storage.storageClasses.includes(value)))throw new Error("Item is incompatible with Receiving storage.");
    const cost=item.storage.handlingCost;
    if(!Number.isInteger(cost) || cost<0)throw new Error("Invalid item handling cost.");
    const used=queue.reduce((sum,id)=>sum+(id?instances[id].custody.cost.extendedCost:0),0);
    if(used+cost>queue.length)throw new Error("Receiving has insufficient handling capacity.");
    const instanceId=`ITEM_OFFWORLD_${String(serial+1).padStart(6,"0")}`;
    const instance={
      instanceId,itemId:item.id,state:structuredClone(config.initialState),
      reality:{theoryBindings:[],authoredTags:[...(item.possibleReality?.inherentTags ?? item.tags)]},
      knowledge:{revealedTags:[],instanceFindings:[]},
      custody:{storageId:config.storageId,containerId:config.storageId,leaseId:null,state:"STANDBY",nextStorageId:null,status:"STORED",reservedBy:null,committedBy:null,cost:{unitCost:cost,extendedCost:cost}},
      processes:Object.fromEntries(["receiving","analysis","reverseEngineering","salvage"].map(name=>[name,{state:"NOT_STARTED"}])),
      history:[{event:"RECOVERED",source:"OFFWORLD"},{event:"ENTERED_SGC_CUSTODY",location:config.storageId}]
    };
    // Commit only after compatibility, slot and capacity checks pass.
    instances[instanceId]=instance;
    queue.splice(0,queue.length,...occupied,instanceId,...Array(queue.length-occupied.length-1).fill(null));
    serial++;
    return instance;
  }
  return {instances,queue,resize,receive};
}
