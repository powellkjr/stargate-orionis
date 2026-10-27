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
    public sealed class OperationsJournalTests
    {
        [Test] public void CompletedHistorySurvivesRemovedSourcesRepeatedRunsAndSaveLoadNewestFirst()
        {
            string json=File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");var codec=new CampaignSaveCodec(json);var s=new CampaignSession(new CampaignState(BootstrapReader.Read(json),new RandomState(1,1)),null);
            s.AssignUnit("unit-27","r2");s.AssignUnit("unit-28","r2");string id=s.State.Base.Receiving.Incoming.First().Id;
            s.AdmitIncoming(id,"r2");for(int i=0;i<4;i++)s.AdvanceOneTick();Assert.That(s.State.CompletedWork.Count,Is.EqualTo(1));Assert.That(s.State.CompletedWork[0].CompletedTick,Is.EqualTo(4));
            s.ReconfigureCore(s.State.Cores.Instances[0].Id);for(int i=0;i<4;i++)s.AdvanceOneTick();Assert.That(BaseOperations.Jobs(s.State).First().Kind,Is.EqualTo("core"));
            var old=s.State;s=new CampaignSession(new CampaignState(old.Base,old.Random,old.Clock,old.Assignments,Array.Empty<ReceivingOrder>(),old.Transfers,old.Expedition,old.Teams,old.Cargo,old.Personnel,old.Construction,old.Cores,old.Workforce,old.CompletedWork),null);
            s.AdmitIncoming(id,"r2");Assert.That(BaseOperations.Jobs(s.State).First().Complete,Is.False,"Ongoing work stays above completed history.");
            for(int i=0;i<4;i++)s.AdvanceOneTick();Assert.That(s.State.CompletedWork.Count,Is.EqualTo(3));Assert.That(BaseOperations.Jobs(s.State).First().CompletedTick,Is.EqualTo(12));
            s=new CampaignSession(codec.Deserialize(codec.Serialize(new SavedSession(s.State,null))).Campaign,null);Assert.That(s.State.CompletedWork.Count,Is.EqualTo(3));
            old=s.State;var cleared=new CampaignState(old.Base,old.Random,old.Clock,old.Assignments,Array.Empty<ReceivingOrder>(),old.Transfers,old.Expedition,old.Teams,old.Cargo,old.Personnel,old.Construction,new RoomCoreState(old.Cores.Instances,Array.Empty<CoreOrder>()),old.Workforce,old.CompletedWork);
            var saved=codec.Deserialize(codec.Serialize(new SavedSession(cleared,null))).Campaign;
            Assert.That(BaseOperations.Jobs(saved).Count,Is.EqualTo(3));Assert.That(BaseOperations.Jobs(saved).All(j=>j.Historical),Is.True);Assert.That(BaseOperations.Jobs(saved).Select(j=>j.CompletedTick),Is.EqualTo(new long?[]{12,8,4}));
        }
        [Test] public void LegacyReceivingWithoutTimestampsRoundTripsWithoutInventingDates()
        {
            string json=File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");var codec=new CampaignSaveCodec(json);var s=new CampaignSession(new CampaignState(BootstrapReader.Read(json),new RandomState(1,1)),null);
            s.AssignUnit("unit-27","r2");s.AssignUnit("unit-28","r2");s.AdmitIncoming(s.State.Base.Receiving.Incoming.First().Id,"r2");for(int i=0;i<4;i++)s.AdvanceOneTick();
            var old=JObject.Parse(codec.Serialize(new SavedSession(s.State,null)));old["schemaVersion"]=30;old.Property("archivedCargoSupply")?.Remove();old.Property("completedWork").Remove();((JObject)old["receiving"][0]).Property("startedTick").Remove();((JObject)old["receiving"][0]).Property("completedTick").Remove();
            var migrated=codec.Deserialize(old.ToString());Assert.That(migrated.Campaign.CompletedWork.Single().CompletedTick,Is.Null);
            var saved=codec.Serialize(migrated);var restored=codec.Deserialize(saved);Assert.That(restored.Campaign.CompletedWork.Single().CompletedTick,Is.Null);Assert.That(restored.Campaign.CompletedWork.Single().StartedTick,Is.Null);Assert.That(restored.Campaign.CompletedWork.Count,Is.EqualTo(1));
        }
        [Test] public void LegacyHistoryImportsAvailableRecordsAndRejectsDuplicateOrFutureJournalEntries()
        {
            string json=File.ReadAllText("Assets/Orionis/Data/Generated/bootstrap.json");var codec=new CampaignSaveCodec(json);var s=new CampaignSession(new CampaignState(BootstrapReader.Read(json),new RandomState(1,1)),null);s.AssignUnit("unit-27","r2");s.ReconfigureCore(s.State.Cores.Instances[0].Id);for(int i=0;i<4;i++)s.AdvanceOneTick();
            var record=JObject.Parse(codec.Serialize(new SavedSession(s.State,null)));var legacy=(JObject)record.DeepClone();legacy["schemaVersion"]=30;legacy.Property("archivedCargoSupply")?.Remove();legacy.Property("completedWork").Remove();var imported=codec.Deserialize(legacy.ToString()).Campaign;Assert.That(imported.CompletedWork.Count,Is.EqualTo(1));Assert.That(imported.CompletedWork[0].CompletedTick,Is.EqualTo(4));
            ((JArray)record["completedWork"]).Add(record["completedWork"][0].DeepClone());Assert.Catch(()=>codec.Deserialize(record.ToString()));
            record=JObject.Parse(codec.Serialize(new SavedSession(s.State,null)));record["completedWork"][0]["CompletedTick"]=5;Assert.Catch(()=>codec.Deserialize(record.ToString()));
        }
    }
}
