using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    // Visual-only projection of the shared active sprite catalog. Missing art
    // keeps the existing schematic; no asset implies a capability or identity.
    public static class PresentationArt
    {
        public static bool RoomArtEnabled { get => PlayerPrefs.GetInt("Orionis.RoomArt",1)!=0; set {PlayerPrefs.SetInt("Orionis.RoomArt",value?1:0);PlayerPrefs.Save();} }
        private static JObject catalog,profiles;
        private static JObject Profiles=>profiles??=JObject.Parse(Resources.Load<TextAsset>("OrionisArt/personnel-catalog")?.text??"{}");
        private static readonly Dictionary<string,Sprite> sprites=new Dictionary<string,Sprite>();
        private static JObject Catalog => catalog??=JObject.Parse(Resources.Load<TextAsset>("OrionisArt/catalog")?.text??"{}");
        private static Sprite Load(string name)
        {
            if(string.IsNullOrEmpty(name))return null;
            if(sprites.TryGetValue(name,out var cached)&&cached!=null)return cached;
            var texture=Resources.Load<Texture2D>("OrionisArt/"+name);
            if(texture==null)return null;
            texture.filterMode=FilterMode.Point;
            return sprites[name]=Sprite.Create(texture,new Rect(0,0,texture.width,texture.height),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
        }
        private static Image Image(Transform parent,string label,Sprite sprite)
        {
            var image=PrototypeUi.Rect(label,parent,Vector2.zero,Vector2.one).gameObject.AddComponent<Image>();
            image.sprite=sprite;image.raycastTarget=false;return image;
        }
        public static bool Room(Transform parent,string definition)
        {
            if(!RoomArtEnabled)return false;
            var entry=Catalog["rooms"]?[definition];var floor=Load((string)(entry?["floor"]));var overlay=Load((string)(entry?["overlay"]));
            if(floor==null&&overlay==null)return false;
            if(floor!=null)Image(parent,"Shared room floor",floor).transform.SetAsFirstSibling();
            if(overlay!=null)Image(parent,"Shared room furnishings",overlay).transform.SetSiblingIndex(floor==null?0:1);
            return true;
        }
        public static string DisplayName(string id,string canonical)
        {
            var n=Profiles["names"]?[id];if(n==null)return canonical;
            int space=canonical.IndexOf(' ');return space<0?canonical:canonical.Substring(0,space)+" \""+(string)n["nickname"]+"\" "+canonical.Substring(space+1);
        }
        public static string Nickname(string id)=>(string)Profiles["names"]?[id]?["nickname"];
        public static bool StageFloor(Transform parent,string stage,bool visited)
        {
            var sprite=Load((string)Catalog["stages"]?[stage]?["floor"]);if(sprite==null)return false;
            Image(parent,"Shared Offworld floor",sprite).color=visited?Color.white:new Color(.55f,.65f,.7f);return true;
        }
        public static bool StageHasWalls(string stage)
        {var file=(string)Catalog["stages"]?[stage]?["floor"];var kind=file==null?null:(string)Catalog["files"]?[file]?["key"];return kind=="floor-indoor"||kind=="floor-lab";}
        public static bool FieldUnit(Transform parent,string id)
        {
            var sprite=Load((string)Catalog["units"]?[id]);if(sprite==null)return false;
            Image(parent,"Offworld unit sprite",sprite).preserveAspect=true;return true;
        }
        private static Sprite AtlasSprite(JToken frame,string key)
        {
            if(frame==null)return null;if(sprites.TryGetValue(key,out var cached)&&cached!=null)return cached;
            var texture=Resources.Load<Texture2D>("OrionisArt/personnel-profiles");if(texture==null)return null;texture.filterMode=FilterMode.Point;
            return sprites[key]=Sprite.Create(texture,new Rect((int)frame["x"],texture.height-(int)frame["y"]-(int)frame["height"],(int)frame["width"],(int)frame["height"]),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
        }
        public static Sprite ToolIcon(string kit)=>AtlasSprite(Profiles["toolStyles"]?[kit]?["icon"],"icon:"+kit);
        public static Color ToolColor(string kit,Color fallback)=>ColorUtility.TryParseHtmlString((string)Profiles["toolStyles"]?[kit]?["color"],out var color)?color:fallback;
        public static bool Unit(Transform parent,string id,string profession)
        {
            var sprite=AtlasSprite(Profiles["portraits"]?[id],"portrait:"+id);if(sprite==null)return false;
            bool roster=parent.name.StartsWith("team-unit-");
            int left=roster?36:8;
            var image=Image(parent,"Personnel profile portrait",sprite);image.preserveAspect=true;
            var rect=image.rectTransform;rect.anchorMin=new Vector2(0,.04f);rect.anchorMax=new Vector2(.29f,.96f);rect.offsetMin=new Vector2(left,0);rect.offsetMax=new Vector2(-4,0);
            return true;
        }
    }
}
