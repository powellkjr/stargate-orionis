using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Orionis.Domain;
using Orionis.Infrastructure;
namespace Orionis.Tests
{
    public sealed class ResourceCargoEconomyTests
    {
        [Test] public void SharedExamplesAndProgressiveRoundingAgreeWithTheImportedCatalog()
        {
            var json=File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");
            var data=BootstrapReader.Read(json);var economy=data.CargoEconomy;
            foreach(var sample in JObject.Parse(json)["resourceCargoEconomy"]["examples"])
            {
                var actual=economy.WildYield((int)sample["inv"],(int)sample["conversionStat"],(string)sample["family"],sample["tiers"].Select(v=>(int)v),(string)sample["policy"]);
                Assert.That(actual,Is.EquivalentTo(((JObject)sample["outputs"]).Properties().ToDictionary(p=>p.Name,p=>(long)p.Value)));
                var weights=new[]{0,0}.Concat(Enumerable.Repeat(1,18)).ToArray();
                var parts=Enumerable.Range(0,weights.Length).Select(i=>ResourceCargoEconomy.BubbleShare(actual,weights,i)).ToList();
                Assert.That(parts[0].Values.All(n=>n==0),Is.True);
                foreach(var output in actual)Assert.That(parts.Sum(p=>p[output.Key]),Is.EqualTo(output.Value));
            }
            Assert.That(ResourceCargoEconomy.Band(economy.SizeBands,8).Id,Is.EqualTo("MEDIUM"));
            Assert.That(ResourceCargoEconomy.Band(economy.SizeBands,16).Id,Is.EqualTo("LARGE"));
            Assert.That(ResourceCargoEconomy.Band(economy.SizeBands,21).Id,Is.EqualTo("HUGE"));
        }
        [Test] public void FamiliesAndInputBoundsCannotProduceKnowledgeCurrencyOrUnsupportedRationTiers()
        {
            var economy=BootstrapReader.Read(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json")).CargoEconomy;
            Assert.That(economy.WildYield(8,100,"RATIONS",new[]{1},"BALANCED"),Is.EquivalentTo(new Dictionary<string,long>{{"R1",8}}));
            Assert.That(()=>economy.WildYield(8,100,"RATIONS",new[]{1,2},"BALANCED"),Throws.ArgumentException);
            Assert.That(()=>economy.WildYield(8,100,"KNOWLEDGE",new[]{1},"BALANCED"),Throws.ArgumentException);
            Assert.That(()=>economy.WildYield(41,1230,"SUPPLY",new[]{1,2},"BALANCED"),Throws.Exception);
        }
    }
}
