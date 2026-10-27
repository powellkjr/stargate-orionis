using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation.Structure
{
    // Orthographic 3D box projection onto the existing map surface. UI's unlit
    // vertex-color material works with URP and keeps cap emission independent of
    // scene lighting, without changing the renderer, floors, or input surfaces.
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class RoomStructureGraphic : MaskableGraphic
    {
        public RoomStructureModel Model {get;private set;}
        private float tile;private IDictionary<string,float> amounts;
        public override Texture mainTexture=>Texture2D.whiteTexture;
        public void Show(RoomStructureModel model,float cellPixels,IDictionary<string,float> doorAmounts=null)
        {Model=model;tile=cellPixels;amounts=doorAmounts??new Dictionary<string,float>();foreach(var door in model.DoorOpen)if(!amounts.ContainsKey(door.Key))amounts[door.Key]=door.Value?1:0;raycastTarget=false;SetVerticesDirty();}
        private void Update(){if(Model==null)return;bool changed=false;foreach(var door in Model.DoorOpen){float next=Mathf.MoveTowards(amounts[door.Key],door.Value?1:0,Time.unscaledDeltaTime*2);changed|=next!=amounts[door.Key];amounts[door.Key]=next;}if(changed)SetVerticesDirty();}
        private sealed class Face{public Vector3[] Points;public Color Color;public float Depth;}
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear();if(Model==null)return;var faces=new List<Face>();
            foreach(var box in Model.Boxes){
                var p=box.Position+(box.DoorId!=null&&amounts.TryGetValue(box.DoorId,out var u)?box.Slide*u:Vector3.zero);
                // Top and camera-facing vertical face; all rotations are cardinal.
                foreach(var normal in new[]{Vector3.up,Vector3.forward,Vector3.back,Vector3.right,Vector3.left}){
                    var n=box.Rotation*normal;if(n.y<.5f&&n.z>-.5f)continue;
                    var tangent=normal==Vector3.up?Vector3.right:Vector3.Cross(Vector3.up,normal);var vertical=normal==Vector3.up?Vector3.forward:Vector3.up;
                    var center=Vector3.Scale(normal,box.Size)*.5f;var a=Vector3.Scale(tangent,box.Size)*.5f;var b=Vector3.Scale(vertical,box.Size)*.5f;
                    var points=new[]{center-a-b,center-a+b,center+a+b,center+a-b}.Select(v=>p+box.Rotation*v).ToArray();
                    var shade=box.Color;if(!box.Emissive&&n.y<.5f)shade=new Color(shade.r*.8f,shade.g*.8f,shade.b*.8f,shade.a);
                    faces.Add(new Face{Points=points,Depth=points.Average(v=>v.z*.5f-v.y*.8660254f),Color=shade});
                }
            }
            var rect=rectTransform.rect;
            foreach(var face in faces.OrderByDescending(f=>f.Depth)){
                int start=mesh.currentVertCount;if(start>65000)throw new System.InvalidOperationException("Structural map exceeds the UI mesh limit; split this render surface.");
                foreach(var v in face.Points)mesh.AddVert(new Vector3(rect.xMin+v.x*tile/4,rect.yMax+(v.z+v.y*.57735027f)*tile/4),face.Color,Vector2.zero);
                mesh.AddTriangle(start,start+1,start+2);mesh.AddTriangle(start,start+2,start+3);
            }
        }
    }
}
