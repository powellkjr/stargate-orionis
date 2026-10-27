using System;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;
namespace Orionis.Infrastructure
{
    internal static class ResourceProcessingReader
    {
        public static ResourceProcessingCatalog Read(JObject j,bool historical=false)
        {
            if(j==null)return null;
            var payload=j["physicalPayload"];var cargo=payload["reality"]["resourceCargo"];
            var pair=new JObject{["item"]=j["item"].DeepClone(),["instance"]=payload.DeepClone()};
            pair["instance"]["processingTags"]=new JArray();
            pair["instance"]["processes"]["receiving"]=new JObject{["state"]="NOT_STARTED"};
            var d=new ResourceProcessingCatalog{LegacyHandling=historical,InstanceId=(string)j["instanceId"],RecipeId=(string)j["recipe"]["id"],ItemId=(string)j["item"]["id"],StageId=(string)j["stageId"],RoomDefinitionId=(string)j["roomDefinitionId"],Payload=payload.ToString(Formatting.None),InitialName=(string)j["item"]["nameResolution"]["initialName"],Family=(string)cargo["family"],ConversionStat=(int)cargo["conversionStat"],Tiers=cargo["tiers"].Select(t=>(int)t).ToArray(),Policy=(string)j["defaultPolicies"][(string)cargo["family"]],Incoming=ReceivingReader.Items(new JArray(pair)).Single(),HazardInstanceId=(string)j["hazard"]["sourceInstanceId"],HazardField=(string)j["hazard"]["resolutionCondition"]["field"],Bubbles=j["recipe"]["bubbles"].ToObject<RecipeBubble[]>()};
            if(d.Bubbles.Count<1||d.Bubbles.Count>40||d.Bubbles.Select(b=>b.Id).Distinct().Count()!=d.Bubbles.Count||d.Bubbles.Any(b=>b.DurationTicks!=1&&b.DurationTicks!=20||b.OutputWeight<0||b.MinimumTier<0||b.MinimumTier>3||b.DependsOn.Any(id=>!d.Bubbles.TakeWhile(n=>n.Id!=b.Id).Any(n=>n.Id==id)))||!d.Bubbles.Any(b=>b.OutputWeight>0)||(string)cargo["mode"]!="WILD"||d.Family!="SUPPLY"||(string)j["recipe"]["finalEffect"]!="CONSUME_TARGET"||d.Policy!="BALANCED")throw new FormatException("Invalid resource cargo Recipe projection.");
            return d;
        }
    }
}
