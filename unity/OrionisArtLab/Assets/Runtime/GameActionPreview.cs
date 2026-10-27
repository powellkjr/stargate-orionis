using System;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;

namespace Orionis.ArtLab
{
    [Serializable] public sealed class PreviewGameAction
    {
        public string label, group;
        public AnimationClip clip;
        public int equipment;
        public bool auxiliaryRig;
        public bool oneShot;
        public string professions="";
        public string notes="";
    }
    [Serializable] public sealed class PreviewProfession
    {
        public string label, body, head, notes;
        public string backpack="",palette="",professionColor="";
        public int defaultAction;
        public bool npc;
        public string[] equipmentNames;
        public int[] equipmentSlotMap;
    }
    [Serializable] public sealed class PreviewHandBridge
    {
        public Transform nativeHand, auxiliaryParent;
        public Quaternion restRotationOffset;
        public void Apply()
        {
            auxiliaryParent.SetPositionAndRotation(nativeHand.position,nativeHand.rotation*restRotationOffset);
        }
    }
    public sealed class GameActionPreview : MonoBehaviour
    {
        public Camera previewCamera;
        public Animator actor;
        public Renderer[] sourceRenderers;
        public string bodyName="TS_Body_01_infantry", headName="TS_Head_01_infantry";
        public GameObject[] equipment;
        public string[] equipmentNames;
        public PreviewGameAction[] actions;
        public PreviewProfession[] professions;
        public GameObject medicalKit;
        public CharacterPartsPanel parts;
        public AnimationClip[] library;
        public string[] libraryLabels;
        public bool[] libraryAuxiliary;
        public Transform auxiliaryRoot, spineProxy, nativeSpine;
        public Quaternion spineRestOffset;
        public PreviewHandBridge[] handBridges;
        PlayableGraph graph;
        AnimationClipPlayable playable;
        Transform[] auxiliaryTransforms;
        Vector3[] bindPositions, bindScales;
        Quaternion[] bindRotations;
        Vector2 scroll;
        string search="";
        bool showLibrary, paused, repeat=true, useAuxiliary;
        float elevation=45,yaw,zoom=2.5f,speed=1;
        double time;
        int selectedEquipment;
        int selectedProfession;
        int actionCategory;
        string selectedLabel="";
        AnimationClip current;
        public AnimationClip CurrentClip=>current;
        public int EquipmentIndex=>selectedEquipment;
        public string SelectedLabel=>selectedLabel;
        public int ProfessionIndex=>selectedProfession;
        public void SelectProfession(int index)
        {
            selectedProfession=index;var profile=professions[index];
            bodyName=profile.body;headName=profile.head;showLibrary=false;search="";scroll=Vector2.zero;actionCategory=0;
            if(parts!=null){parts.ResetParts();parts.ApplyProfession(profile);}
            SelectAction(profile.defaultAction);
        }

        void Awake()
        {
            actor.runtimeAnimatorController=null;actor.applyRootMotion=false;actor.fireEvents=false;
            actor.cullingMode=AnimatorCullingMode.AlwaysAnimate;
            // Auxiliary spine/hand binding changes happen after animation evaluation.
            // Refresh render matrices so visible skin follows those final bone poses.
            foreach(var renderer in sourceRenderers)
                if(renderer is SkinnedMeshRenderer skin)
                {skin.updateWhenOffscreen=true;skin.forceMatrixRecalculationPerRender=true;}
            auxiliaryTransforms=auxiliaryRoot.GetComponentsInChildren<Transform>(true);
            bindPositions=Array.ConvertAll(auxiliaryTransforms,t=>t.localPosition);
            bindRotations=Array.ConvertAll(auxiliaryTransforms,t=>t.localRotation);
            bindScales=Array.ConvertAll(auxiliaryTransforms,t=>t.localScale);
            SelectProfession(0);
        }
        public void SelectAction(int index)
        {
            var action=actions[index];
            repeat=!action.oneShot;
            SelectClip(action.clip,action.label,action.auxiliaryRig);
            SetEquipment(action.equipment);
        }
        public void SelectLibraryClip(int index)
        {
            var clip=library[index];
            repeat=clip.isLooping;
            SelectClip(clip,libraryLabels[index],libraryAuxiliary[index]);
            SetEquipment(0);
        }
        void SelectClip(AnimationClip clip,string label,bool aux)
        {
            if(graph.IsValid())graph.Destroy();
            actor.Rebind();
            for(int i=0;i<auxiliaryTransforms.Length;i++)
            {auxiliaryTransforms[i].localPosition=bindPositions[i];auxiliaryTransforms[i].localRotation=bindRotations[i];auxiliaryTransforms[i].localScale=bindScales[i];}
            graph=PlayableGraph.Create("Art Lab exact clip preview");
            graph.SetTimeUpdateMode(DirectorUpdateMode.GameTime);
            playable=AnimationClipPlayable.Create(graph,clip);
            playable.SetApplyFootIK(false);playable.SetApplyPlayableIK(false);
            playable.SetSpeed(paused?0:speed);
            var output=AnimationPlayableOutput.Create(graph,"Character",actor);output.SetSourcePlayable(playable);
            graph.Play();current=clip;selectedLabel=label;useAuxiliary=aux;time=0;Sample(0);
        }
        public void SetEquipment(int index)
        {
            if(index<0||index>equipment.Length)throw new ArgumentOutOfRangeException(nameof(index));
            selectedEquipment=index;ApplyGeometry();
            if(parts!=null)parts.ClearWeapon();
        }
        public void SetView(float pitch,float rotation)
        {elevation=Mathf.Clamp(pitch,5,90);yaw=Mathf.Repeat(rotation,360);ApplyView();}
        public void Sample(float normalized)
        {
            time=normalized*current.length;playable.SetTime(time);graph.Evaluate(.000001f);
            ApplyBindings();ApplyGeometry();ApplyView();
        }
        void ApplyBindings()
        {
            if(useAuxiliary)nativeSpine.rotation=spineProxy.rotation*spineRestOffset;
            foreach(var bridge in handBridges)bridge.Apply();
        }
        void ApplyGeometry()
        {
            // Explicit renderer selection prevents all modular variants appearing together.
            foreach(var r in sourceRenderers)
            {
                bool chosen=r.name==bodyName||r.name==headName;
                if(chosen)r.gameObject.SetActive(true);
                r.enabled=chosen;
            }
            for(int i=0;i<equipment.Length;i++)equipment[i].SetActive(selectedEquipment==i+1);
            if(medicalKit!=null)medicalKit.SetActive(professions[selectedProfession].label=="Medical"&&!(parts!=null&&parts.StagedPropVisible));
        }
        void ApplyView()
        {
            actor.transform.SetPositionAndRotation(Vector3.zero,Quaternion.Euler(0,yaw,0));
            var center=new Vector3(0,1.3f,0);float p=elevation*Mathf.Deg2Rad;
            if(parts!=null&&parts.StagedPropVisible)center.x=.4f;
            // Native death clips can displace the hips well away from the standing root.
            // Follow the fallen body's bounds so it remains visible during inspection.
            if(current!=null&&current.name.IndexOf("death",StringComparison.OrdinalIgnoreCase)>=0)
                foreach(var r in sourceRenderers)if(r.name==bodyName){center=r.bounds.center;break;}
            previewCamera.transform.position=center+new Vector3(0,Mathf.Sin(p),Mathf.Cos(p))*10;
            previewCamera.transform.rotation=Quaternion.Euler(elevation,180,0);
            float margin=Mathf.Min(350f/Mathf.Max(Screen.width,1),.45f);
            float right=parts!=null&&parts.open?Mathf.Min(300f/Mathf.Max(Screen.width,1),.3f):0;
            previewCamera.rect=new Rect(margin,0,1-margin-right,1);previewCamera.orthographicSize=zoom;
        }
        void LateUpdate()
        {
            if(!graph.IsValid())return;
            playable.SetSpeed(paused?0:speed);
            time=playable.GetTime();
            if(time>=current.length)
            {
                if(repeat)playable.SetTime(time%Math.Max(current.length,.001));
                else {playable.SetTime(current.length);playable.SetSpeed(0);}
            }
            ApplyBindings();ApplyGeometry();ApplyView();
        }
        void OnGUI()
        {
            // The scene camera leaves the sidebar outside its viewport.
            // Clear it explicitly so changed labels/sliders do not leave old pixels.
            GUI.DrawTexture(new Rect(0,0,Mathf.Min(350,Screen.width*.45f),Screen.height),Texture2D.blackTexture);
            float width=Mathf.Min(338,Screen.width*.44f);
            var wrap=new GUIStyle(GUI.skin.label){wordWrap=true};
            GUILayout.BeginArea(new Rect(8,8,width-8,Screen.height-16),GUI.skin.box);
            GUILayout.Label("ORIONIS · GAME ACTIONS",GUI.skin.box);
            if(parts!=null&&GUILayout.Button(parts.open?"Hide parts panel":"Try character parts / colors"))parts.open=!parts.open;
            int profession=GUILayout.SelectionGrid(selectedProfession,Array.ConvertAll(professions,p=>p.label),3);
            if(profession!=selectedProfession)SelectProfession(profession);
            GUILayout.Label("Camera angle: "+elevation.ToString("0")+"°");elevation=GUILayout.HorizontalSlider(elevation,5,90);
            GUILayout.Label("Character rotation: "+yaw.ToString("0")+"°");yaw=GUILayout.HorizontalSlider(yaw,0,359.9f);
            GUILayout.Label("Zoom");zoom=GUILayout.HorizontalSlider(zoom,1,4);
            GUILayout.BeginHorizontal();
            if(GUILayout.Button(paused?"Play":"Pause"))paused=!paused;
            if(GUILayout.Button("Restart"))Sample(0);
            if(GUILayout.Button("Reset view")){elevation=45;yaw=0;zoom=2.5f;}
            GUILayout.EndHorizontal();
            repeat=GUILayout.Toggle(repeat,"Repeat");GUILayout.Label("Speed: "+speed.ToString("0.00")+"×");speed=GUILayout.HorizontalSlider(speed,.1f,2);
            var map=professions[selectedProfession].equipmentSlotMap;
            int gridPos=Array.IndexOf(map,selectedEquipment);if(gridPos<0)gridPos=0;
            GUILayout.Label("Equipment");int equip=GUILayout.SelectionGrid(gridPos,professions[selectedProfession].equipmentNames,2);
            if(equip!=gridPos)SetEquipment(map[equip]);
            showLibrary=GUILayout.Toggle(showLibrary,"Browse full library (unreviewed)");
            if(!showLibrary)actionCategory=GUILayout.SelectionGrid(actionCategory,new[]{"All","Deaths","Interacts","Dialogue"},4);
            search=GUILayout.TextField(search);
            scroll=GUILayout.BeginScrollView(scroll,false,true);
            if(showLibrary)
            {
                for(int i=0;i<library.Length;i++)if(Matches(libraryLabels[i]))
                    if(GUILayout.Button(new GUIContent(libraryLabels[i],libraryLabels[i]),GUILayout.Width(width-40)))SelectLibraryClip(i);
            }
            else
            {
                string group="";
                for(int i=0;i<actions.Length;i++)if(Matches(actions[i].label)&&
                    (actionCategory==0||(actionCategory==3?actions[i].group.StartsWith("Dialogue",StringComparison.Ordinal):actions[i].clip.name.IndexOf(actionCategory==1?"death":"interact",StringComparison.OrdinalIgnoreCase)>=0))&&
                    (string.IsNullOrEmpty(actions[i].professions)||Array.IndexOf(actions[i].professions.Split(','),professions[selectedProfession].label)>=0))
                {
                    if(group!=actions[i].group){group=actions[i].group;GUILayout.Label(group,GUI.skin.box);}
                    if(GUILayout.Button(actions[i].label,GUILayout.Width(width-40)))SelectAction(i);
                }
            }
            GUILayout.EndScrollView();
            GUILayout.Label(selectedLabel,wrap);
            if(!showLibrary)
                foreach(var action in actions)if(action.clip==current&&!string.IsNullOrEmpty(action.notes)){GUILayout.Label(action.notes,wrap);break;}
            GUILayout.Label(professions[selectedProfession].notes,wrap);
            GUILayout.Label(showLibrary?"Library pose only. Equipment and custom bindings may need review.":"Focused art studies; no gameplay commands execute.",wrap);
            GUILayout.EndArea();
        }
        bool Matches(string value)=>string.IsNullOrEmpty(search)||value.IndexOf(search,StringComparison.OrdinalIgnoreCase)>=0;
        void OnDestroy(){if(graph.IsValid())graph.Destroy();}
    }
}
