using System;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Orionis.Application;
using Orionis.Domain;
using Orionis.Infrastructure;

namespace Orionis.Tests
{
    public sealed class PersonnelRecoveryTests
    {
        private string json;
        private CampaignSession Create()
        {
            var j=JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            ((JArray)j["rooms"]).Add(new JObject{["id"]="medical-test",["definitionId"]="infirmary",["col"]=0,["row"]=2,["width"]=1,["height"]=1,["constructionTier"]=1});
            json=j.ToString();var data=BootstrapReader.Read(json);
            var people=Enumerable.Range(1,5).Select(n=>"unit-"+n).Select(id=>new PersonnelRecord(id,50,90,8,data.Mission.Personnel.Single(p=>p.UnitId==id).Tools));
            return new CampaignSession(new CampaignState(data,new RandomState(1,1),personnel:people),null);
        }
        [Test] public void BedsAreSeparateFromStaffSaveTheirOccupancyAndRecoverOnlyBaseUnits()
        {
            var s=Create();s.AssignInfirmaryBed("unit-1","medical-test");s.AdvanceOneTick();
            Assert.That(PersonnelCondition.Health(s.State,"unit-1"),Is.EqualTo(52));
            Assert.That(PersonnelCondition.Health(s.State,"unit-2"),Is.EqualTo(51));
            Assert.That(s.State.Assignments,Is.Empty,"A patient never becomes medical staff.");
            var codec=new CampaignSaveCodec(json);s=new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State,null))).Campaign,null);
            foreach(var id in new[]{"unit-2","unit-3","unit-4"})s.AssignInfirmaryBed(id,"medical-test");
            var before=s.State;Assert.Throws<InvalidOperationException>(()=>s.AssignInfirmaryBed("unit-5","medical-test"));Assert.That(s.State,Is.SameAs(before));
            Assert.Throws<InvalidOperationException>(()=>s.Deploy(new[]{"unit-1"}));
            s.Deploy(new[]{"unit-5"});s.ChooseGate(false);s.RedialGate();
            Assert.That(PersonnelCondition.Health(s.State,"unit-5"),Is.EqualTo(51),"Offworld Units receive no passive base healing.");
            Assert.That(PersonnelCondition.Health(s.State,"unit-1"),Is.EqualTo(54));
            s.AssignInfirmaryBed("unit-1",null);Assert.That(PersonnelRecovery.InBed(s.State,"unit-1"),Is.False);
        }
        [Test] public void ReturningRefillsTheSameToolsWithoutRepairAndHealingCarriesIntoRedeployment()
        {
            var s=Create();s.Deploy(new[]{"unit-1"});s.ChooseGate(false);
            var codec=new CampaignSaveCodec(json);var changed=JObject.Parse(codec.Serialize(new SavedSession(s.State,null)));
            changed["expedition"]["party"][0]["tools"][0]["charges"]=2;
            changed["expedition"]["party"][0]["tools"][0]["damaged"]=true;
            s=new CampaignSession(codec.Deserialize(changed.ToString()).Campaign,null);
            var toolId=PersonnelCondition.Tools(s.State,"unit-1")[0].InstanceId;
            s.RedialGate();s.ExtractMission();
            Assert.That(PersonnelCondition.Health(s.State,"unit-1"),Is.EqualTo(50));
            Assert.That(PersonnelCondition.Tools(s.State,"unit-1")[0].Charges,Is.EqualTo(9));
            Assert.That(PersonnelCondition.Tools(s.State,"unit-1")[0].InstanceId,Is.EqualTo(toolId));
            Assert.That(PersonnelCondition.Tools(s.State,"unit-1")[0].Damaged,Is.True);
            s.AdvanceOneTick();Assert.That(PersonnelCondition.Health(s.State,"unit-1"),Is.EqualTo(51));
            s=new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State,null))).Campaign,null);
            s.PrepareRedeployment();s.Deploy(new[]{"unit-1"});
            Assert.That(MissionCombat.Inspect(s.State).PartyHealth["unit-1"],Is.EqualTo(51));
        }
    }
}
