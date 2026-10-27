using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class TravelArrowGraphic : MaskableGraphic
    {
        public Vector2 Direction=Vector2.right;
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear();var r=rectTransform.rect;float size=Mathf.Min(r.width,r.height)*.33f;var forward=new Vector2(Direction.x,-Direction.y).normalized;if(forward.sqrMagnitude<.1f)forward=Vector2.up;var side=new Vector2(-forward.y,forward.x);
            var points=new[]{new Vector2(-1,-.22f),new Vector2(.15f,-.22f),new Vector2(.15f,-.6f),new Vector2(1,0),new Vector2(.15f,.6f),new Vector2(.15f,.22f),new Vector2(-1,.22f)};
            mesh.AddVert(r.center,color,Vector2.zero);foreach(var p in points)mesh.AddVert(r.center+(forward*p.x+side*p.y)*size,color,Vector2.zero);for(int i=0;i<points.Length;i++)mesh.AddTriangle(0,i+1,(i+1)%points.Length+1);
        }
    }
}
