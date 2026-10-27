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
    public sealed class RoomCoreTests
    {
        private string json;
        private CampaignSession Create(bool oneWarehousePlace=false)
        {
            var source=JObject.Parse(File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json"));
            if(oneWarehousePlace)source["roomStorage"]["profiles"].Single(p=>(string)p["definitionId"]=="warehouse")["capacityByTier"]["1"]=1;
            json=source.ToString();return new CampaignSession(new CampaignState(BootstrapReader.Read(json),new RandomState(1,1)),null);
        }
        private CampaignSession Reload(CampaignSession s){var codec=new CampaignSaveCodec(json);return new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State,null))).Campaign,null);}
        [Test] public void RemovalAndReinstallKeepIdentityChargesReservationsAndPartialSave()
        {
            var s=Create();var core=s.State.Cores.Instances.Single(c=>RoomCores.Definition(s.State,c).Kind=="HANDLING");string id=core.Id;
            s.ReconfigureCore(id);s.AdvanceOneTick();Assert.That(s.State.Cores.Orders.Single().Work.Committed.Count,Is.Zero);
            Assert.That(RoomCores.BlockedReason(s.State,s.State.Cores.Orders.Single()),Does.Contain("local staff"));
            s.AssignUnit("unit-25","r2");int charges=PersonnelCondition.Tools(s.State,"unit-25").First(t=>t.Services.Contains("TET1")).Charges;
            s.AdvanceOneTick();s.AdvanceOneTick();s=Reload(s);Assert.That(s.State.Cores.Orders.Single().Work.Committed.Count,Is.EqualTo(2));
            Assert.That(RoomCores.WarehouseReserved(s.State,"r11"),Is.EqualTo(1));
            s.AdvanceOneTick();s.AdvanceOneTick();core=s.State.Cores.Instances.Single(c=>c.Id==id);
            Assert.That(core.RoomId,Is.Null);Assert.That(core.WarehouseId,Is.EqualTo("r11"));Assert.That(RoomCores.WarehouseReserved(s.State,"r11"),Is.EqualTo(1));
            Assert.That(PersonnelCondition.Tools(s.State,"unit-25").First(t=>t.Services.Contains("TET1")).Charges,Is.EqualTo(charges-2));
            double reserved=RoomCores.Reserved(s.State);s.ReconfigureCore(id,"r2");Assert.That(RoomCores.Reserved(s.State),Is.EqualTo(reserved+RoomCores.Definition(s.State,core).ActivePower));
            Assert.That(RoomCores.WarehouseReserved(s.State,"r11"),Is.EqualTo(1));
            for(int i=0;i<4;i++)s.AdvanceOneTick();s=Reload(s);core=s.State.Cores.Instances.Single(c=>c.Id==id);
            Assert.That(core.RoomId,Is.EqualTo("r2"));Assert.That(core.WarehouseId,Is.Null);Assert.That(RoomCores.WarehouseReserved(s.State,"r11"),Is.Zero);
            Assert.That(s.State.Cores.Instances.Count,Is.EqualTo(2));Assert.That(s.State.Cores.Orders.All(o=>o.CompletedTick.HasValue),Is.True);
            var codec=new CampaignSaveCodec(json);var before=codec.Serialize(new SavedSession(s.State,null));s.AdvanceOneTick();Assert.That(s.State.Cores.Instances.Count,Is.EqualTo(2));
            var bad=JObject.Parse(before);bad["roomCores"]["Instances"][0]["Id"]="invented-core";Assert.Catch(()=>codec.Deserialize(bad.ToString()));
        }
        [Test] public void WarehouseAndMaximumActivePowerBlockWithoutPublishingPartialTransfers()
        {
            var s=Create(true);s.AssignUnit("unit-25","r2");var first=s.State.Cores.Instances[0];s.ReconfigureCore(first.Id);for(int i=0;i<4;i++)s.AdvanceOneTick();
            var installed=s.State.Cores.Instances.Single(c=>c.RoomId!=null);var codec=new CampaignSaveCodec(json);string before=codec.Serialize(new SavedSession(s.State,null));
            Assert.Throws<InvalidOperationException>(()=>s.ReconfigureCore(installed.Id));Assert.That(codec.Serialize(new SavedSession(s.State,null)),Is.EqualTo(before));
            var stored=s.State.Cores.Instances.Single(c=>c.RoomId==null);var definition=RoomCores.Definition(s.State,stored);int active=definition.ActivePower;definition.ActivePower=100;
            Assert.That(RoomCores.Reserved(s.State),Is.LessThanOrEqualTo(RoomCores.Generated(s.State))); // Idle fits; potential active use does not.
            Assert.Throws<InvalidOperationException>(()=>s.ReconfigureCore(stored.Id,"r2"));Assert.That(s.State.Cores.Orders.Count,Is.EqualTo(1));definition.ActivePower=active;
        }
    }
}
