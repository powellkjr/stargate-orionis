using System;
using System.Linq;
using Orionis.Application;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
namespace Orionis.Presentation
{
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class MissionMiniMap : MaskableGraphic, IPointerClickHandler, IDragHandler
    {
        private CampaignSession session;private Action<Vector2> focus;private Vector2 center,window;
        public void Bind(CampaignSession value,Action<Vector2> callback){session=value;focus=callback;color=Color.white;raycastTarget=true;SetVerticesDirty();}
        public void SetWindow(Vector2 value,Vector2 size){center=value;window=size;SetVerticesDirty();}
        private Rect MapRect(){var r=rectTransform.rect;var map=session.State.Base.MissionMap;float scale=Mathf.Min(r.width/map.Width,r.height/map.Height);return new Rect(r.center-new Vector2(map.Width,map.Height)*scale/2,new Vector2(map.Width,map.Height)*scale);}
        private static void Box(VertexHelper mesh,Rect r,Color color){int i=mesh.currentVertCount;mesh.AddVert(new Vector2(r.xMin,r.yMin),color,Vector2.zero);mesh.AddVert(new Vector2(r.xMin,r.yMax),color,Vector2.zero);mesh.AddVert(new Vector2(r.xMax,r.yMax),color,Vector2.zero);mesh.AddVert(new Vector2(r.xMax,r.yMin),color,Vector2.zero);mesh.AddTriangle(i,i+1,i+2);mesh.AddTriangle(i,i+2,i+3);}
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear();Box(mesh,rectTransform.rect,new Color(.02f,.035f,.05f,.98f));if(session?.State.Expedition==null)return;
            var map=session.State.Base.MissionMap;var travel=session.State.Expedition.Travel;var rect=MapRect();float scale=rect.width/map.Width;
            foreach(var stage in map.Stages.Where(s=>session.State.Base.Mission.Travel.Stages.Single(d=>d.Id==s.Id).Known||travel.Visits.ContainsKey(s.Id)))foreach(var cell in stage.Cells)Box(mesh,new Rect(rect.x+cell.X*scale+1,rect.yMax-(cell.Y+1)*scale+1,scale-2,scale-2),stage.Id==session.State.Expedition.StageId?new Color(1,.8f,.25f):travel.Visits.ContainsKey(stage.Id)?new Color(.2f,.5f,.58f):new Color(.2f,.25f,.3f));
            float x=Mathf.Clamp(center.x-window.x/2,0,map.Width),y=Mathf.Clamp(center.y-window.y/2,0,map.Height),right=Mathf.Clamp(center.x+window.x/2,0,map.Width),bottom=Mathf.Clamp(center.y+window.y/2,0,map.Height);var frame=new Rect(rect.x+x*scale,rect.yMax-bottom*scale,(right-x)*scale,(bottom-y)*scale);var tint=new Color(.85f,.95f,1);Box(mesh,new Rect(frame.xMin,frame.yMin,frame.width,1),tint);Box(mesh,new Rect(frame.xMin,frame.yMax-1,frame.width,1),tint);Box(mesh,new Rect(frame.xMin,frame.yMin,1,frame.height),tint);Box(mesh,new Rect(frame.xMax-1,frame.yMin,1,frame.height),tint);
        }
        public void OnPointerClick(PointerEventData e)=>Locate(e);public void OnDrag(PointerEventData e)=>Locate(e);
        private void Locate(PointerEventData e){if(session==null)return;RectTransformUtility.ScreenPointToLocalPointInRectangle(rectTransform,e.position,e.pressEventCamera,out var point);var rect=MapRect();var map=session.State.Base.MissionMap;focus?.Invoke(new Vector2(Mathf.Clamp01((point.x-rect.x)/rect.width)*map.Width,Mathf.Clamp01((rect.yMax-point.y)/rect.height)*map.Height));}
    }
}
