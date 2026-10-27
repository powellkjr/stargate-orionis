using System;
using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;
namespace Orionis.Infrastructure
{
    internal static class ResourceCargoEconomyReader
    {
        public static ResourceCargoEconomy Read(JObject source)
        {
            if(source==null)return null; // Historical snapshots have no cargo economics.
            if((string)source["format"]!="orionis-resource-cargo-economy-1")throw new FormatException("Unsupported cargo economics format.");
            CargoValueBand[] Bands(string key)=>source[key].Select(b=>new CargoValueBand((string)b["id"],(int)b["min"],(int)b["max"])).ToArray();
            return new ResourceCargoEconomy((int)source["conversionScale"],((JObject)source["tierWeights"]).Properties().ToDictionary(p=>int.Parse(p.Name),p=>(int)p.Value),((JObject)source["families"]).Properties().ToDictionary(p=>p.Name,p=>p.Value.Select(v=>(string)v).ToArray()),((JObject)source["policies"]).Properties().ToDictionary(p=>p.Name,p=>(int)p.Value),Bands("qualityBands"),Bands("sizeBands"));
        }
    }
}
