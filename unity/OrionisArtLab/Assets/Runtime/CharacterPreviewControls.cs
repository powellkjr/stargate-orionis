using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using KevinIglesias;

namespace Orionis.ArtLab
{
    public sealed class CharacterPreviewControls : MonoBehaviour
    {
        [SerializeField] Camera previewCamera;
        [SerializeField] Animator[] subjects=Array.Empty<Animator>();
        [SerializeField] PreviewSubjectProps[] propSets=Array.Empty<PreviewSubjectProps>();
        [SerializeField] string[] weaponLabels=Array.Empty<string>();
        [SerializeField] AnimationClip[] clips=Array.Empty<AnimationClip>();
        [SerializeField] string[] clipLabels=Array.Empty<string>(), clipNotes=Array.Empty<string>();
        [SerializeField] float elevation=60, yaw, zoom=1.9f;
        [SerializeField] bool solo=true, repeat=true, automaticProp=true, holdInLeftHand, supportIk;
        [SerializeField] int selectedWeapon;
        Vector3[] positions;
        Quaternion[] rotations;
        AnimatorOverrideController[] overrides;
        RuntimeAnimatorController[] controllers;
        int selectedClip=-1;
        bool paused, showProps;
        float speed=1;
        Vector2 scroll, propScroll;
        string filter="", propFilter="";
        public float Elevation=>elevation;
        public float Yaw=>yaw;
        public bool Solo=>solo;
        public int ClipCount=>clips.Length;
        public int PropCount=>weaponLabels.Length;
        public int SelectedWeapon=>selectedWeapon;
        public bool AutomaticProp=>automaticProp;
        public AnimationClip CurrentClip=>selectedClip>=0?clips[selectedClip]:null;
        public string CurrentPropLabel=>weaponLabels.Length>selectedWeapon?weaponLabels[selectedWeapon]:"None";
        public PreviewSubjectProps[] PropSets=>propSets;

        public void Configure(Camera camera,Animator[] models,PreviewSubjectProps[] props,string[] propLabels,
            AnimationClip[] animations,string[] labels,string[] notes)
        {
            previewCamera=camera;subjects=models;propSets=props;weaponLabels=propLabels;
            clips=animations;clipLabels=labels;clipNotes=notes;
        }
        void Awake()
        {
            positions=subjects.Select(s=>s.transform.position).ToArray();
            rotations=subjects.Select(s=>s.transform.rotation).ToArray();
            controllers=subjects.Select(s=>s.runtimeAnimatorController).ToArray();
            foreach(var subject in subjects)subject.fireEvents=false;
            overrides=new AnimatorOverrideController[subjects.Length];
            ApplyView();ApplyProps();
        }
        public void SetElevation(float value){elevation=Mathf.Clamp(value,5,90);ApplyView();}
        public void SetYaw(float value){yaw=Mathf.Repeat(value,360);ApplyView();}
        public void SetSolo(bool value){solo=value;ApplyView();ApplyProps();}
        public void SetZoom(float value){zoom=Mathf.Clamp(value,1,5);ApplyView();}
        public void SetWeapon(int index,bool manual=true)
        {
            if(index<0||index>=weaponLabels.Length)throw new ArgumentOutOfRangeException(nameof(index));
            selectedWeapon=index;
            if(manual)automaticProp=false;
            ApplyProps();
        }
        public void SetAutomaticProp(bool value)
        {automaticProp=value;if(value&&CurrentClip!=null)AutoSelectWeapon(CurrentClip.name);}
        public void SetSupportIk(bool value){supportIk=value;ApplyProps();}
        public void SetHoldInLeftHand(bool value){holdInLeftHand=value;ApplyProps();}
        public void ApplyProps()
        {
            for(int i=0;i<subjects.Length;i++)
            {
                if(i>=propSets.Length||propSets[i]==null)continue;
                var set=propSets[i];
                bool visible=!solo||i==0;
                PreviewProp selected=null;
                for(int j=0;j<set.props.Length;j++)
                {
                    var prop=set.props[j];
                    if(prop?.instance==null)continue;
                    bool chosen=selectedWeapon==j+1;
                    prop.instance.SetActive(visible&&chosen);
                    if(chosen)selected=prop;
                }
                var holding=subjects[i].GetBoneTransform(holdInLeftHand?HumanBodyBones.LeftHand:HumanBodyBones.RightHand);
                var other=subjects[i].GetBoneTransform(holdInLeftHand?HumanBodyBones.RightHand:HumanBodyBones.LeftHand);
                if(selected?.instance!=null&&holding!=null&&selected.instance.transform.parent!=holding)
                    selected.instance.transform.SetParent(holding,false);
                if(set.ikTool==null||set.ikSwitch==null)continue;
                // The supporting hand targets a prop held by the other hand, avoiding a cyclic goal.
                bool calibrated=visible&&supportIk&&selected!=null&&selected.gripCalibrated
                    &&selected.calibratedForLeftHold==holdInLeftHand&&selected.supportGrip!=null;
                set.ikTool.hand=holdInLeftHand?IKHelperHand.RightHand:IKHelperHand.LeftHand;
                set.ikTool.handEffector=calibrated?selected.supportGrip:other;
                set.ikTool.iKSwitch=set.ikSwitch;
                set.ikSwitch.localPosition=calibrated?Vector3.up:Vector3.zero;
                // Keep the zero-weight callback alive to clear a previously active IK goal.
                set.ikTool.enabled=other!=null;
            }
        }
        void ApplyView()
        {
            if(previewCamera==null||positions==null)return;
            for(int i=0;i<subjects.Length;i++)
            {
                subjects[i].gameObject.SetActive(!solo||i==0);
                subjects[i].transform.position=solo?Vector3.zero:positions[i];
                subjects[i].transform.rotation=rotations[i]*Quaternion.Euler(0,yaw,0);
            }
            var focus=new Vector3(0,1.1f,0);
            float pitch=elevation*Mathf.Deg2Rad;
            previewCamera.transform.position=focus+new Vector3(0,Mathf.Sin(pitch),Mathf.Cos(pitch))*10;
            previewCamera.transform.rotation=Quaternion.Euler(elevation,180,0);
            float margin=Mathf.Min(330f/Mathf.Max(Screen.width,1),.45f);
            previewCamera.rect=new Rect(margin,0,1-margin,1);
            previewCamera.orthographicSize=solo?zoom:zoom*2.05f;
        }
        public void SelectClip(int index)
        {
            if(index<0||index>=clips.Length)throw new ArgumentOutOfRangeException(nameof(index));
            selectedClip=index;
            var animator=subjects[0];
            if(overrides[0]==null)overrides[0]=new AnimatorOverrideController(controllers[0]);
            var pairs=new List<KeyValuePair<AnimationClip,AnimationClip>>();
            overrides[0].GetOverrides(pairs);
            for(int i=0;i<pairs.Count;i++)pairs[i]=new KeyValuePair<AnimationClip,AnimationClip>(pairs[i].Key,clips[index]);
            overrides[0].ApplyOverrides(pairs);
            animator.runtimeAnimatorController=overrides[0];
            animator.Rebind();animator.Update(0);animator.Play(0,0,0);animator.Update(0);
            animator.speed=paused?0:speed;
            AutoSelectWeapon(clips[index].name);
        }
        static string Token(string value)=>new string(value.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
        void AutoSelectWeapon(string clipName)
        {
            if(!automaticProp||weaponLabels.Length==0)return;
            string name=Token(clipName);
            int match=Enumerable.Range(1,weaponLabels.Length-1).Where(i=>name.Contains(Token(weaponLabels[i].Split('(')[0])))
                .OrderByDescending(i=>Token(weaponLabels[i].Split('(')[0]).Length).DefaultIfEmpty(0).First();
            SetWeapon(match,false);
        }
        public void Restart(){foreach(var s in subjects)if(s.gameObject.activeSelf){s.Play(0,0,0);s.Update(0);}}
        void LateUpdate()
        {
            ApplyView();ApplyProps();
            if(selectedClip>=0&&repeat&&!paused&&!clips[selectedClip].isLooping&&subjects[0].GetCurrentAnimatorStateInfo(0).normalizedTime>=1)
            {subjects[0].Play(0,0,0);subjects[0].Update(0);}
        }
        void OnGUI()
        {
            float width=Mathf.Min(320,Screen.width*.44f);
            var wrap=new GUIStyle(GUI.skin.label){wordWrap=true};
            GUILayout.BeginArea(new Rect(8,8,width-8,Screen.height-16),GUI.skin.box);
            GUILayout.Label("CHARACTER PREVIEW",GUI.skin.box);
            GUILayout.Label("Camera angle: "+elevation.ToString("0")+"°");SetElevation(GUILayout.HorizontalSlider(elevation,5,90));
            GUILayout.Label("Character rotation: "+yaw.ToString("0")+"°");SetYaw(GUILayout.HorizontalSlider(yaw,0,359.9f));
            GUILayout.Label("Zoom");SetZoom(GUILayout.HorizontalSlider(zoom,1,5));
            bool nextSolo=GUILayout.Toggle(solo,"Single character");if(nextSolo!=solo)SetSolo(nextSolo);
            GUILayout.BeginHorizontal();
            if(GUILayout.Button(paused?"Play":"Pause")){paused=!paused;foreach(var s in subjects)s.speed=paused?0:speed;}
            if(GUILayout.Button("Restart"))Restart();
            if(GUILayout.Button("Reset view")){elevation=60;yaw=0;zoom=1.9f;ApplyView();}
            GUILayout.EndHorizontal();
            repeat=GUILayout.Toggle(repeat,"Repeat one-shot clips");
            GUILayout.Label("Playback speed: "+speed.ToString("0.00")+"×");
            float nextSpeed=GUILayout.HorizontalSlider(speed,.1f,2);
            if(!Mathf.Approximately(nextSpeed,speed)){speed=nextSpeed;foreach(var s in subjects)s.speed=paused?0:speed;}
            bool auto=GUILayout.Toggle(automaticProp,"Match prop to animation");if(auto!=automaticProp)SetAutomaticProp(auto);
            if(GUILayout.Button("Prop: "+CurrentPropLabel+" ▾"))showProps=!showProps;
            if(showProps)
            {
                propFilter=GUILayout.TextField(propFilter);
                propScroll=GUILayout.BeginScrollView(propScroll,GUILayout.Height(140));
                for(int i=0;i<weaponLabels.Length;i++)
                    if(string.IsNullOrEmpty(propFilter)||weaponLabels[i].IndexOf(propFilter,StringComparison.OrdinalIgnoreCase)>=0)
                        if(GUILayout.Button(weaponLabels[i])){SetWeapon(i);showProps=false;}
                GUILayout.EndScrollView();
            }
            bool left=GUILayout.Toggle(holdInLeftHand,"Hold prop in left hand");if(left!=holdInLeftHand)SetHoldInLeftHand(left);
            var current=propSets.Length>0&&selectedWeapon>0&&selectedWeapon<=propSets[0].props.Length?propSets[0].props[selectedWeapon-1]:null;
            bool wasEnabled=GUI.enabled;GUI.enabled=current!=null&&current.gripCalibrated&&current.calibratedForLeftHold==holdInLeftHand;
            bool ik=GUILayout.Toggle(supportIk,"Calibrated support-hand IK");if(ik!=supportIk)SetSupportIk(ik);GUI.enabled=wasEnabled;
            if(current!=null&&(!current.gripCalibrated||current.calibratedForLeftHold!=holdInLeftHand))GUILayout.Label("Support grip needs calibration for this holding hand.");
            GUILayout.Label("Toon model includes a rifle; None hides added props.",wrap);
            GUILayout.Label("Animations ("+clips.Length+")");filter=GUILayout.TextField(filter);
            scroll=GUILayout.BeginScrollView(scroll,false,true);
            for(int i=0;i<clips.Length;i++)
            {
                string label=clipLabels.Length>i?clipLabels[i]:clips[i].name;
                if(!string.IsNullOrEmpty(filter)&&label.IndexOf(filter,StringComparison.OrdinalIgnoreCase)<0)continue;
                if(GUILayout.Button(new GUIContent((selectedClip==i?"▶ ":"")+label,label),
                    new GUIStyle(GUI.skin.button){alignment=TextAnchor.MiddleLeft},GUILayout.Width(width-40)))SelectClip(i);
            }
            GUILayout.EndScrollView();
            if(CurrentClip!=null)GUILayout.Label(CurrentClip.name+" · "+CurrentClip.length.ToString("0.00")+"s",wrap);
            if(selectedClip>=0&&clipNotes.Length>selectedClip&&!string.IsNullOrEmpty(clipNotes[selectedClip]))GUILayout.Label(clipNotes[selectedClip],wrap);
            GUILayout.EndArea();
        }
        void OnDestroy()
        {
            if(overrides==null)return;
            for(int i=0;i<overrides.Length;i++)if(overrides[i]!=null)
            {if(subjects[i]!=null)subjects[i].runtimeAnimatorController=controllers[i];Destroy(overrides[i]);}
        }
    }
}
