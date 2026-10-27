using System;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    public sealed class MissionExtractionPanel : MonoBehaviour
    {
        public static void Open(Transform parent,CampaignSession session)
        {
            var existing=parent.Find("Extraction manifest");if(existing!=null){existing.gameObject.SetActive(false);Destroy(existing.gameObject);}
            // Isolate input and sorting from the map's hidden action sources and
            // any nested canvases. Cover the entire mission workspace.
            var panel=PrototypeUi.Rect("Extraction manifest",parent,Vector2.zero,Vector2.one);
            var canvas=panel.gameObject.AddComponent<Canvas>();canvas.overrideSorting=true;canvas.sortingOrder=parent.GetComponentInParent<Canvas>().sortingOrder+1;
            panel.gameObject.AddComponent<GraphicRaycaster>();
            panel.gameObject.AddComponent<MissionExtractionPanel>().Bind(session);
        }
        public static string Manifest(CampaignState s)
        {
            string text="EXTRACTION TO SGC\n\n"+(MissionRescue.ExtractionBlocker(s)??"Gate connection active. Ready to return.")+"\n\n";
            var cargo=s.Base.Cargo;
            if(cargo!=null){bool existing=s.Cargo.Any(i=>i.SourceContainerId==cargo.ContainerId);text+=cargo.Label+": "+(existing?"Already recovered; existing items stay in their assigned storage.":!RecoveredCargo.Revealed(s)?"Not marked this sortie.":"Marked for extraction; contents will enter Receiving on return.")+"\n\n";}
            foreach(var extra in cargo?.Caches.Skip(1)??Enumerable.Empty<CargoCache>())text+=extra.Label+": "+(s.Cargo.Any(i=>i.SourceContainerId==extra.ContainerId)?"Already at base.":!RecoveredCargo.CacheRevealed(s,extra)?"Not marked for extraction.":"Marked for extraction; contents will enter Receiving on return.")+"\n\n";
            var cache=s.Cargo.SingleOrDefault(i=>ResourceCargo.IsResource(s,i));
            text+="Supply cache: "+(cache==null?"Not marked for extraction.":ResourceCargo.Consumed(s,cache)?"Already converted; Supply is in base storage.":cache.FieldStageId==null?"Already at base.":!ResourceCargo.Collected(s)?"Inspected; not marked for extraction.":"Marked for extraction; will enter Receiving on return.")+"\n\n";
            var people=s.Expedition.Travel.Field.Subjects.Where(x=>x.Evacuation=="AT_GATE").ToArray();text+="People returning: "+(people.Length==0?"SG team only":string.Join(", ",people.Select(p=>p.Label)))+"\n\nAll marked items are included for now. Items stay at their source until extraction and retain their identity.";return text;
        }
        private void Bind(CampaignSession session)
        {
            gameObject.AddComponent<Image>().color=new Color(.055f,.09f,.12f);
            var details=PrototypeUi.ScrollLabel("Extraction cargo manifest",transform,new Vector2(.02f,.21f),new Vector2(.98f,.98f),Manifest(session.State),18);
            var confirm=PrototypeUi.Button("Confirm extraction to SGC",transform,new Vector2(.52f,.04f),new Vector2(.97f,.17f),"Return to SGC / queue recovered cargo",new Color(.12f,.35f,.3f),()=>{try{session.ExtractMission();}catch(Exception e){details.text=e.Message+"\n\n"+Manifest(session.State);}});confirm.interactable=MissionRescue.ExtractionBlocker(session.State)==null;
            PrototypeUi.Button("Cancel extraction",transform,new Vector2(.03f,.04f),new Vector2(.48f,.17f),"Stay offworld",new Color(.15f,.23f,.28f),()=>{gameObject.SetActive(false);Destroy(gameObject);});
        }
    }
}
