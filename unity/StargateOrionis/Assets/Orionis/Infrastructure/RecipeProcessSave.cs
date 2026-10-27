using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;
namespace Orionis.Infrastructure
{
    // Adapter to the shared Instance.processes record, not a second save model
    // for inventory. Uncommitted resourceOutcomes are capacity-pending results.
    internal static class RecipeProcessSave
    {
        public static JObject Write(RecipeWorkState work,ResourceProcessingCatalog d)
        {
            if(work==null)return null;
            var record=new JObject{["state"]=work.Committed.Count==d.Bubbles.Count?"COMPLETE":work.Outcomes.Keys.Any(i=>!work.Committed.Contains(i))?"BLOCKED":"IN_PROGRESS",["recipeId"]=d.RecipeId,["completedBubbles"]=new JArray(work.Committed.Select(i=>d.Bubbles[i].Id)),["bubbleWork"]=new JArray(work.Bubbles.Select((b,i)=>new JObject{["bubbleId"]=d.Bubbles[i].Id,["actorId"]=b.ActorId,["workedTicks"]=b.Ticks,["completedTick"]=b.CompletedTick})),["resourceOutcomes"]=new JArray(work.Outcomes.Select(p=>new JObject{["transactionId"]=d.InstanceId+"/"+d.Bubbles[p.Key].Id,["bubbleId"]=d.Bubbles[p.Key].Id,["resources"]=JObject.FromObject(p.Value)}))};
            if(work.AllocationHighTierPercent.HasValue)record["allocationHighTierPercent"]=work.AllocationHighTierPercent.Value;
            return record;
        }
        public static RecipeWorkState Read(JObject j,ResourceProcessingCatalog d)
        {
            if(j==null)return null;
            if(d==null||(string)j["recipeId"]!=d.RecipeId||j["bubbleWork"] is not JArray work||work.Count!=d.Bubbles.Count||j["completedBubbles"] is not JArray done||j["resourceOutcomes"] is not JArray outcomes)throw new FormatException("Invalid shared Recipe process record.");
            int Index(string id)=>Enumerable.Range(0,d.Bubbles.Count).Single(i=>d.Bubbles[i].Id==id);
            var bubbles=work.Select((b,i)=>(string)b["bubbleId"]!=d.Bubbles[i].Id?throw new FormatException("Recipe bubble order changed."):new ClearingBubbleWork((string)b["actorId"],(int)b["workedTicks"],(long?)b["completedTick"])).ToList();
            var records=new Dictionary<int,Dictionary<string,long>>();
            foreach(var o in outcomes){int index=Index((string)o["bubbleId"]);if((string)o["transactionId"]!=d.InstanceId+"/"+d.Bubbles[index].Id||o["resources"] is not JObject resources||resources.Properties().Any(p=>p.Value.Type!=JTokenType.Integer||(long)p.Value<0))throw new FormatException("Invalid pending transaction identity or resource quantities.");records.Add(index,resources.Properties().ToDictionary(p=>p.Name,p=>(long)p.Value));}
            var result=new RecipeWorkState(bubbles,done.Select(v=>Index((string)v)),records,bubbles.Where((b,i)=>d.Bubbles[i].OutputWeight>0).Any(b=>b.Ticks>0),(int?)j["allocationHighTierPercent"]);
            if((string)j["state"]!=(string)Write(result,d)["state"])throw new FormatException("Recipe process status disagrees with persistent work.");
            return result;
        }
    }
}
