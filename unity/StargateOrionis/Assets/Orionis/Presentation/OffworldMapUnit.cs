using UnityEngine;
using UnityEngine.UI;
namespace Orionis.Presentation
{
    public sealed class OffworldMapUnit : MonoBehaviour
    {
        private OffworldCharacterPool pool;private string unit;private float tile;private RectTransform rect;public RenderTexture Texture{set{var image=gameObject.AddComponent<RawImage>();image.texture=value;image.raycastTarget=false;}}
        public bool Bind(OffworldCharacterPool value,string id,string profession,Vector2 target,string expedition,float tileSize)
        {pool=value;unit=id;tile=tileSize;rect=(RectTransform)transform;bool attached=pool.Attach(this,id,profession,target,expedition);if(!attached)pool=null;return attached;}
        public void Detach(){pool=null;var image=GetComponent<RawImage>();if(image!=null)image.texture=null;}
        private void LateUpdate(){if(pool==null||rect==null)return;if(!pool.TryPosition(unit,out var point)){Detach();return;}rect.anchoredPosition=new Vector2(point.x*tile,-point.y*tile);}
    }
}
