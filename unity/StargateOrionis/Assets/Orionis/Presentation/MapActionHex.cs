using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace Orionis.Presentation
{
    // A visual/input adapter only; the source action still owns validation and execution.
    public sealed class MapActionHex : Image, IPointerEnterHandler, IPointerExitHandler, ISelectHandler, IDeselectHandler
    {
        public Color BorderColor;
        public Text Details;
        public string Description;
        private string previous;
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear(); var rect=GetPixelAdjustedRect();
            Hex(mesh,rect,0,BorderColor); Hex(mesh,rect,2,color);
        }
        private static void Hex(VertexHelper mesh,Rect rect,float inset,Color tint)
        {
            int start=mesh.currentVertCount;
            mesh.AddVert(rect.center,tint,Vector2.zero);
            for(int i=0;i<6;i++)
            {
                float angle=i*Mathf.PI/3;
                mesh.AddVert(rect.center+new Vector2(Mathf.Cos(angle)*(rect.width/2-inset),Mathf.Sin(angle)*(rect.height/2-inset)),tint,Vector2.zero);
            }
            for(int i=0;i<6;i++)mesh.AddTriangle(start,start+1+i,start+1+(i+1)%6);
        }
        public void OnPointerEnter(PointerEventData _) => Show();
        public void OnPointerExit(PointerEventData _) => Hide();
        public void OnSelect(BaseEventData _) => Show();
        public void OnDeselect(BaseEventData _) => Hide();
        private void Show(){if(Details!=null){previous=Details.text;Details.text=Description;}}
        private void Hide(){if(Details!=null&&Details.text==Description)Details.text=previous;}
        public override bool IsRaycastLocationValid(Vector2 point,Camera camera)
        {
            if(!RectTransformUtility.ScreenPointToLocalPointInRectangle(rectTransform,point,camera,out var local))return false;
            var rect=rectTransform.rect;var p=local-rect.center;
            float x=Mathf.Abs(p.x)/(rect.width*.5f), y=Mathf.Abs(p.y)/(rect.height*.5f);
            return y<=.8661f && x+y/1.7321f<=1;
        }
    }
}
