using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Orionis.Domain;
namespace Orionis.Infrastructure
{
    internal static class RoomCoreReader
    {
        private static string Profession(string requirement)
        {
            if(requirement=="UNTRAINED")return requirement;
            var names=new Dictionary<string,string>{{"TE","TECHNICIAN"},{"SC","SCIENTIST"},{"SO","SOLDIER"},{"ST","SCOUT"},{"ME","MEDIC"},{"DI","DIPLOMAT"}};
            return names[requirement.Substring(0,2)];
        }
        public static RoomCoreCatalog Read(JObject j)
        {
            if(j==null)return null;
            var recipe=j["recipes"].Single(r=>(string)r["id"]==(string)j["installationRecipeId"]);
            var nodes=recipe["bubbles"].Select((b,i)=>new RecipeBubble((string)b["id"],(int)b["durationTicks"],Profession((string)b["actorRequirement"]),(string)b["actorRequirement"]=="UNTRAINED"?0:int.Parse(((string)b["actorRequirement"]).Substring(2)),(string)b["toolRequirement"],recipe["edges"].Where(e=>(string)e[1]==(string)b["id"]).Select(e=>(string)e[0]))).ToArray();
            var definitions=j["coreDefinitions"].Select(c=>new RoomCoreDefinition{Id=(string)c["id"],Name=(string)c["name"]??(string)c["id"],Kind=(string)c["contribution"]["kind"],HighTierPercent=(int?)c["contribution"]["highTierFixedPercent"]+(int?)((double?)c["contribution"]["flexiblePercent"]*(double?)c["contribution"]["flexibleHighTierShare"])??0,Policy=(string)c["contribution"]["kind"]=="RECOVERY"?c["providesServices"].Values<string>().Single():null,MinimumCT=(int)c["minimumConstructionTier"],Tags=c["compatibleRoomTags"].Values<string>().ToArray(),Services=c["providesServices"].Values<string>().ToArray(),Sizes=c["contribution"]["supportedSizes"]?.Values<string>().ToArray()??Array.Empty<string>(),IdlePower=(int)c["power"]["idle"],ActivePower=(int)c["power"]["active"]}).ToArray();
            var prefs=(JObject)j["cargoCapabilityPreferences"];
            return new RoomCoreCatalog{GeneratorDefinitionId=(string)j["power"]["generatorDefinitionId"],RoomTags=j["roomTagsByDefinition"].ToObject<Dictionary<string,string[]>>(),T0HighTierPercent=(int)j["embeddedT0"]["receiving"]["recovery"]["highTierFixedPercent"],ToolCharges=recipe["bubbles"].ToDictionary(b=>(string)b["id"],b=>(int)b["toolCharges"]),Definitions=definitions,Installation=nodes,GeneratorOutput=(int)j["power"]["generatorOutput"],RoomPower=j["power"]["roomBaseByDefinition"].ToObject<Dictionary<string,double>>(),TierPower=j["power"]["roomBaseTierMultipliers"].ToObject<Dictionary<int,double>>(),ReceivingSlots=j["receiving"]["coreSlotsByConstructionTier"].ToObject<Dictionary<int,int>>(),Starters=j["starterInstances"].Select(c=>new CoreInstance((string)c["instanceId"],(string)c["coreDefinitionId"],(string)c["roomInstanceId"],(int)c["slotIndex"],null)).ToArray(),RecoveryPreferences=prefs.Properties().ToDictionary(p=>p.Name,p=>p.Value["recovery"].Values<string>().ToArray()),HandlingPreferences=prefs.Properties().ToDictionary(p=>p.Name,p=>p.Value["handling"].Values<string>().ToArray())};
        }
        public static RoomCoreState State(JObject j)=>j==null?null:JsonConvert.DeserializeObject<RoomCoreState>(j.ToString(),new JsonSerializerSettings{MissingMemberHandling=MissingMemberHandling.Error});
    }
}
