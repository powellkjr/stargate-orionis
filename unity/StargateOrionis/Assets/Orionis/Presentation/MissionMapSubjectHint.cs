using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
namespace Orionis.Presentation
{
    public sealed class MissionMapSubjectHint : MonoBehaviour,IPointerEnterHandler,IPointerExitHandler,IPointerClickHandler
    {
        public Text Details;public string Description;private string previous;
        public void OnPointerEnter(PointerEventData e){if(Details==null)return;previous=Details.text;Details.text=Description;}
        public void OnPointerExit(PointerEventData e){if(Details!=null&&Details.text==Description)Details.text=previous;}
        public void OnPointerClick(PointerEventData e){if(Details!=null){Details.text=Description;previous=Description;}}
    }
}
