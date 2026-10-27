using System;
using System.Linq;
using UnityEngine;

namespace Orionis.ArtLab
{
    [Serializable] public sealed class PreviewReferenceProp
    {
        public string label,path;
        public GameObject instance;
        public int reviewedEquipment;
        public Quaternion stageRotation;
    }
    // Local visual experiments only; never changes vendor materials or game equipment.
    public sealed class CharacterPartsPanel : MonoBehaviour
    {
        public GameActionPreview preview;
        public string[] bodies,heads;
        public GameObject[] backpacks,weapons;
        public Material[] colors;
        public PreviewReferenceProp[] referenceProps=Array.Empty<PreviewReferenceProp>();
        public int ReferenceIndex {get;private set;}
        public bool StagedPropVisible=>ReferenceIndex>0&&referenceProps[ReferenceIndex-1].reviewedEquipment==0;
        public bool open;
        public int BackpackIndex {get;private set;}
        public int WeaponIndex {get;private set;}
        public int BodyColor {get;private set;}
        public int HeadColor {get;private set;}
        Material[][] originals;
        Vector2 scroll;
        int tab;
        string referenceSearch="";
        float propYaw;
        readonly string[] tabs={"Body","Head","Backpack","Hand prop","Colors","Other props"};
        void Initialize()
        {
            if(originals==null)originals=preview.sourceRenderers.Select(r=>r.sharedMaterials).ToArray();
        }
        public void SelectBody(int index){preview.bodyName=bodies[index];ApplyColors();}
        public void SelectHead(int index){preview.headName=heads[index];ApplyColors();}
        public void SelectBackpack(int index){BackpackIndex=index;ApplyAttachments();}
        public void SelectWeapon(int index)
        {
            preview.SetEquipment(0);WeaponIndex=index;ApplyAttachments();
        }
        public void ClearWeapon(){WeaponIndex=ReferenceIndex=0;ApplyAttachments();}
        public void SelectReferenceProp(int index)
        {
            preview.SetEquipment(index==0?0:referenceProps[index-1].reviewedEquipment);
            ReferenceIndex=index;ApplyAttachments();SetPropRotation(0);
        }
        public void SetPropRotation(float yaw)
        {
            propYaw=yaw;if(!StagedPropVisible)return;
            var prop=referenceProps[ReferenceIndex-1];prop.instance.transform.rotation=Quaternion.Euler(0,yaw,0)*prop.stageRotation;
            var renderers=prop.instance.GetComponentsInChildren<Renderer>();var bounds=renderers[0].bounds;
            foreach(var r in renderers.Skip(1))bounds.Encapsulate(r.bounds);
            prop.instance.transform.position+=new Vector3(.85f-bounds.center.x,-bounds.min.y,-bounds.center.z);
        }
        public void SetColors(int body,int head){BodyColor=body;HeadColor=head;ApplyColors();}
        void ApplyColors()
        {
            Initialize();
            for(int i=0;i<preview.sourceRenderers.Length;i++)
            {
                var r=preview.sourceRenderers[i];
                int color=r.name.StartsWith("TS_Body_",StringComparison.Ordinal)?BodyColor:
                    r.name.StartsWith("TS_Head_",StringComparison.Ordinal)?HeadColor:0;
                r.sharedMaterials=color==0?originals[i]:originals[i].Select(_=>colors[color-1]).ToArray();
            }
        }
        public void ResetParts()
        {
            BackpackIndex=WeaponIndex=BodyColor=HeadColor=ReferenceIndex=0;ApplyColors();ApplyAttachments();
        }
        public void ApplyProfession(PreviewProfession profile)
        {
            SelectBackpack(Array.FindIndex(backpacks,o=>o.name==profile.backpack)+1);
            int color=Array.FindIndex(colors,m=>m.name=="ToonSoldiers_"+profile.palette)+1;
            SetColors(color,color);
        }
        public void ApplyAttachments()
        {
            for(int i=0;i<backpacks.Length;i++)backpacks[i].SetActive(i+1==BackpackIndex);
            for(int i=0;i<weapons.Length;i++)weapons[i].SetActive(i+1==WeaponIndex);
            for(int i=0;i<referenceProps.Length;i++)
                if(referenceProps[i].reviewedEquipment==0)referenceProps[i].instance.SetActive(i+1==ReferenceIndex);
        }
        public void RestoreProfession(){preview.SelectProfession(preview.ProfessionIndex);}
        void OnGUI()
        {
            if(!open)return;
            float width=Mathf.Min(300,Screen.width*.3f);
            var rect=new Rect(Screen.width-width,0,width,Screen.height);
            GUI.DrawTexture(rect,Texture2D.blackTexture);
            GUILayout.BeginArea(new Rect(rect.x+8,8,width-16,Screen.height-16),GUI.skin.box);
            GUILayout.Label("CHARACTER PARTS",GUI.skin.box);
            if(GUILayout.Button("Close parts panel"))open=false;
            if(GUILayout.Button("Restore profession appearance"))RestoreProfession();
            tab=GUILayout.SelectionGrid(tab,tabs,2);
            var wrap=new GUIStyle(GUI.skin.label){wordWrap=true};
            if(tab==3)GUILayout.Label("Visual fit only. Current animation may not grip this prop correctly.",wrap);
            if(tab==4)GUILayout.Label("Supplied atlas variants. Body and head can use different colors.",wrap);
            if(tab==5)
            {
                GUILayout.Label("Reviewed tools attach to the hand; other props are scaled reference displays beside the actor.",wrap);
                GUILayout.Label("Find prop");referenceSearch=GUILayout.TextField(referenceSearch);
                if(StagedPropVisible){GUILayout.Label("Prop rotation");float rotation=GUILayout.HorizontalSlider(propYaw,0,360);if(rotation!=propYaw)SetPropRotation(rotation);}
            }
            scroll=GUILayout.BeginScrollView(scroll);
            if(tab==0)Choose(bodies,preview.bodyName,SelectBody);
            if(tab==1)Choose(heads,preview.headName,SelectHead);
            if(tab==2)ChooseObjects(backpacks,BackpackIndex,SelectBackpack);
            if(tab==3)ChooseObjects(weapons,WeaponIndex,SelectWeapon);
            if(tab==4)
            {
                var names=new[]{"Original"}.Concat(colors.Select(m=>m.name.Replace("ToonSoldiers_",""))).ToArray();
                GUILayout.Label("Body color");int b=GUILayout.SelectionGrid(BodyColor,names,2);
                GUILayout.Label("Head color");int h=GUILayout.SelectionGrid(HeadColor,names,2);
                if(b!=BodyColor||h!=HeadColor)SetColors(b,h);
            }
            if(tab==5)
            {
                if(GUILayout.Toggle(ReferenceIndex==0,"None",GUI.skin.button)&&ReferenceIndex!=0)SelectReferenceProp(0);
                for(int i=0;i<referenceProps.Length;i++)
                {
                    var prop=referenceProps[i];if(prop.label.IndexOf(referenceSearch,StringComparison.OrdinalIgnoreCase)<0)continue;
                    if(GUILayout.Toggle(ReferenceIndex==i+1,prop.label+(prop.reviewedEquipment>0?" · fitted":" · staged"),GUI.skin.button)&&ReferenceIndex!=i+1)SelectReferenceProp(i+1);
                }
            }
            GUILayout.EndScrollView();
            GUILayout.Label("Parts and colors are session experiments. Restore resets to the selected profession.",wrap);
            GUILayout.EndArea();
        }
        void Choose(string[] names,string selected,Action<int> select)
        {
            for(int i=0;i<names.Length;i++)
                if(GUILayout.Toggle(names[i]==selected,names[i].Replace("TS_Body_","").Replace("TS_Head_",""),GUI.skin.button)&&names[i]!=selected)select(i);
        }
        void ChooseObjects(GameObject[] objects,int selected,Action<int> select)
        {
            if(GUILayout.Toggle(selected==0,"None",GUI.skin.button)&&selected!=0)select(0);
            for(int i=0;i<objects.Length;i++)
                if(GUILayout.Toggle(selected==i+1,objects[i].name,GUI.skin.button)&&selected!=i+1)select(i+1);
        }
    }
}
