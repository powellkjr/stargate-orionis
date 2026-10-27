using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    // One mesh and one coordinate space: fill, hazard backing and slanted seams
    // share the same boundaries. Full progress completely covers the backing.
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class RecipeProgressGraphic : MaskableGraphic
    {
        private float[] targets=new float[0], shown=new float[0];
        private Color[] colors=new Color[0];
        public int SegmentCount => targets.Length;
        public float Fraction(int i) => targets[i];
        public Color SegmentColor(int i) => colors[i];
        public void SetSegments(float[] fractions,Color[] palette,bool immediate=false)
        {
            if(shown.Length!=fractions.Length){shown=new float[fractions.Length];immediate=true;}
            targets=(float[])fractions.Clone();colors=(Color[])palette.Clone();
            if(immediate)shown=(float[])fractions.Clone();
            raycastTarget=false;SetVerticesDirty();
        }
        private void Update()
        {
            bool changed=false;
            for(int i=0;i<shown.Length;i++){float next=Mathf.Lerp(shown[i],targets[i],1-Mathf.Exp(-Time.unscaledDeltaTime*8));if(Mathf.Abs(next-targets[i])<.0001f)next=targets[i];changed|=next!=shown[i];shown[i]=next;}
            if(changed)SetVerticesDirty();
        }
        protected override void OnPopulateMesh(VertexHelper mesh)
        {
            mesh.Clear();if(shown.Length==0)return;
            var r=GetPixelAdjustedRect();Box(mesh,r,new Color(.65f,.65f,.57f));
            r=new Rect(r.xMin+1.5f,r.yMin+1.5f,Mathf.Max(0,r.width-3),Mathf.Max(0,r.height-3));
            if(r.width<=0||r.height<=0)return;
            Box(mesh,r,new Color(.045f,.055f,.065f));
            float pitch=Mathf.Max(12,r.height*1.5f);
            for(float x=r.xMin-pitch;x<r.xMax+pitch;x+=pitch)
                Polygon(mesh,r,new[]{new Vector2(x,r.yMin),new Vector2(x-r.height*.5f,r.yMax),new Vector2(x-r.height*.5f+pitch*.45f,r.yMax),new Vector2(x+pitch*.45f,r.yMin)},new Color(.36f,.29f,.095f));
            float step=r.width/shown.Length, skew=Mathf.Min(r.height*.32f,step*.2f);
            for(int i=0;i<shown.Length;i++)
            {
                float left=r.xMin+i*step,right=left+step;
                if(shown[i]>0)
                {
                    var clip=new Rect(r.xMin,r.yMin,Mathf.Min(r.width,right-step*(1-shown[i])-r.xMin+skew),r.height);
                    Polygon(mesh,clip,new[]{new Vector2(i==0?r.xMin:left-skew,r.yMin),new Vector2(i==0?r.xMin:left+skew,r.yMax),new Vector2(i==shown.Length-1?r.xMax:right+skew,r.yMax),new Vector2(i==shown.Length-1?r.xMax:right-skew,r.yMin)},colors[i]);
                }
                else
                {
                    // Unworked requirements retain their input color (white for
                    // UNTRAINED); committed fill uses the actual Actor's color.
                    Box(mesh,new Rect(left+skew+1,r.yMax-1,Mathf.Max(0,step-2*skew-2),1),colors[i]);
                }
                if(i>0)Polygon(mesh,r,new[]{new Vector2(left-skew-1,r.yMin),new Vector2(left+skew-1,r.yMax),new Vector2(left+skew+1,r.yMax),new Vector2(left-skew+1,r.yMin)},new Color(.035f,.045f,.055f));
            }
        }
        private static void Box(VertexHelper mesh,Rect r,Color color)=>Polygon(mesh,r,new[]{new Vector2(r.xMin,r.yMin),new Vector2(r.xMin,r.yMax),new Vector2(r.xMax,r.yMax),new Vector2(r.xMax,r.yMin)},color);
        private static void Polygon(VertexHelper mesh,Rect clip,IEnumerable<Vector2> input,Color color)
        {
            var points=Clip(new List<Vector2>(input),clip.xMin,true);points=Clip(points,clip.xMax,false);
            if(points.Count<3)return;int start=mesh.currentVertCount;
            foreach(var p in points)mesh.AddVert(p,color,Vector2.zero);
            for(int i=1;i<points.Count-1;i++)mesh.AddTriangle(start,start+i,start+i+1);
        }
        private static List<Vector2> Clip(List<Vector2> points,float edge,bool minimum)
        {
            var result=new List<Vector2>();if(points.Count==0)return result;
            var previous=points[points.Count-1];bool before=minimum?previous.x>=edge:previous.x<=edge;
            foreach(var p in points){bool inside=minimum?p.x>=edge:p.x<=edge;if(before!=inside)result.Add(Vector2.Lerp(previous,p,(edge-previous.x)/(p.x-previous.x)));if(inside)result.Add(p);previous=p;before=inside;}
            return result;
        }
    }
}
