using System.Collections.Generic;
using System.Linq;
using Orionis.Domain;
using UnityEngine;
namespace Orionis.Presentation
{
    // Placement/outfits are presentation. Visibility uses recognized mission state only.
    public static class OffworldSceneActors
    {
        public static IEnumerable<OffworldSceneActor> Visible(CampaignState state)
        {
            var catalog=Resources.Load<OffworldCharacterCatalog>("OffworldCharacters/catalog");if(catalog?.sceneActors==null||state.Expedition==null)yield break;
            var travel=state.Expedition.Travel;
            foreach(var actor in catalog.sceneActors.Where(a=>a.stage==state.Expedition.StageId))
            {
                var subject=travel.Field.Subjects.SingleOrDefault(s=>s.Id==actor.id);
                // NPC presence is already recognized by travel. A parallel Field
                // record may exist solely for combat/suspicion, with no detection
                // observation; that record must not hide a visible guard or corpse.
                bool recognizedNpc=travel.Npcs.Any(n=>n.Id==actor.id&&n.StageId==actor.stage);
                if(subject!=null&&(subject.StageId!=actor.stage||subject.Detection=="HIDDEN"&&!recognizedNpc))continue;
                if(actor.conditional)
                {
                    bool known=actor.requiredKnowledge!=null&&travel.Knowledge.Contains(actor.requiredKnowledge);
                    known|=actor.conditionInstance=="epidemiologist-01"&&actor.conditionField=="cacheRevealed"&&RecoveredCargo.Revealed(state);
                    if(!known)continue;
                }
                // Hide a collected source rather than displaying duplicate uncollected loot.
                if(state.Cargo.Any(i=>(i.Id==actor.id||i.SourceContainerId==actor.id)&&i.FieldStageId==null))continue;
                yield return actor;
            }
        }
    }
}
