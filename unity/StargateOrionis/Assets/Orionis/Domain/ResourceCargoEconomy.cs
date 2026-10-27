using System;
using System.Collections.Generic;
using System.Linq;
namespace Orionis.Domain
{
    public sealed class CargoValueBand
    {
        public string Id { get; }
        public int Minimum { get; }
        public int Maximum { get; }
        public CargoValueBand(string id,int minimum,int maximum){Id=id;Minimum=minimum;Maximum=maximum;}
    }
    // Shared-data economic queries only. This class never grants Knowledge,
    // chooses a Core, creates cargo or credits an inventory balance.
    public sealed class ResourceCargoEconomy
    {
        private readonly int scale;
        private readonly IReadOnlyDictionary<int,int> tierWeights;
        private readonly IReadOnlyDictionary<string,string[]> families;
        private readonly IReadOnlyDictionary<string,int> policies;
        public IReadOnlyList<CargoValueBand> QualityBands { get; }
        public IReadOnlyList<CargoValueBand> SizeBands { get; }
        public ResourceCargoEconomy(int conversionScale,IDictionary<int,int> weights,IDictionary<string,string[]> resourceFamilies,IDictionary<string,int> allocationPolicies,IEnumerable<CargoValueBand> quality,IEnumerable<CargoValueBand> sizes)
        {
            scale=conversionScale;tierWeights=new System.Collections.ObjectModel.ReadOnlyDictionary<int,int>(new Dictionary<int,int>(weights));
            families=new System.Collections.ObjectModel.ReadOnlyDictionary<string,string[]>(resourceFamilies.ToDictionary(p=>p.Key,p=>(string[])p.Value.Clone()));
            policies=new System.Collections.ObjectModel.ReadOnlyDictionary<string,int>(new Dictionary<string,int>(allocationPolicies));QualityBands=quality.ToList().AsReadOnly();SizeBands=sizes.ToList().AsReadOnly();
            if(scale<=0||tierWeights.Count!=3||tierWeights.Values.Any(w=>w<=0)||policies.Values.Any(p=>p<0||p>100)||QualityBands.Count!=4||SizeBands.Count!=4)throw new ArgumentException("Invalid shared cargo economy.");
        }
        public int PolicyShare(string policy)=>policies.TryGetValue(policy,out int share)?share:throw new ArgumentException("Unknown cargo policy.");
        public static CargoValueBand Band(IReadOnlyList<CargoValueBand> bands,int value)=>bands.SingleOrDefault(b=>value>=b.Minimum&&value<=b.Maximum)??throw new ArgumentOutOfRangeException(nameof(value),"Value outside authored cargo bands.");
        public IReadOnlyDictionary<string,long> WildYield(int recipeBubbleCount,int conversionStat,string family,IEnumerable<int> eligibleTiers,string policy)
            =>WildYield(recipeBubbleCount,conversionStat,family,eligibleTiers,policies.TryGetValue(policy,out int high)?high:throw new ArgumentException("Unknown cargo policy."));
        public IReadOnlyDictionary<string,long> WildYield(int recipeBubbleCount,int conversionStat,string family,IEnumerable<int> eligibleTiers,int highShare)
        {
            Band(SizeBands,recipeBubbleCount);Band(QualityBands,conversionStat);
            var tiers=eligibleTiers.OrderBy(t=>t).ToArray();
            if(!families.TryGetValue(family,out var classes)||highShare<0||highShare>100||tiers.Length<1||tiers.Length>2||tiers.Distinct().Count()!=tiers.Length||tiers.Any(t=>t<1||t>classes.Length))throw new ArgumentException("Invalid cargo family, tiers or allocation policy.");
            var result=new Dictionary<string,long>();
            foreach(int tier in tiers)
            {
                int share=tiers.Length==1?100:tier==tiers.Last()?highShare:100-highShare;
                result[classes[tier-1]]=checked((long)recipeBubbleCount*conversionStat*share)/checked((long)scale*100*tierWeights[tier]);
            }
            return new System.Collections.ObjectModel.ReadOnlyDictionary<string,long>(result);
        }
        public static IReadOnlyDictionary<string,long> BubbleShare(IReadOnlyDictionary<string,long> totals,IReadOnlyList<int> weights,int index)
        {
            if(index<0||index>=weights.Count||weights.Any(w=>w<0)||totals.Values.Any(n=>n<0))throw new ArgumentException("Invalid authored output distribution.");
            long sum=weights.Sum(w=>(long)w);if(sum<=0)throw new ArgumentException("Recipe has no resource-output weight.");
            long before=weights.Take(index).Sum(w=>(long)w),after=before+weights[index];
            return new System.Collections.ObjectModel.ReadOnlyDictionary<string,long>(totals.ToDictionary(p=>p.Key,p=>checked(p.Value*after)/sum-checked(p.Value*before)/sum));
        }
    }
}
