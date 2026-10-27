using System;
using System.Runtime.CompilerServices;
using Orionis.Application;
using UnityEngine;
using UnityEngine.EventSystems;
namespace Orionis.Presentation
{
    public sealed class MissionMapNavigation : MonoBehaviour, IScrollHandler, IDragHandler
    {
        public sealed class ViewState{public float Zoom=1.5f;public Vector2 Center;public string Stage;public bool Fit;public Vector2? ActionPoint;public string ActionStage;public readonly System.Collections.Generic.Dictionary<string,float> DoorAmounts=new System.Collections.Generic.Dictionary<string,float>();}
        private static readonly ConditionalWeakTable<CampaignSession,ViewState> states=new ConditionalWeakTable<CampaignSession,ViewState>();
        public static ViewState State(CampaignSession session)=>states.GetValue(session,_=>new ViewState());
        public Action<float> Scroll;public Action<Vector2> Drag;
        public void OnScroll(PointerEventData e){Scroll?.Invoke(Mathf.Clamp(e.scrollDelta.y,-3,3));}
        public void OnDrag(PointerEventData e){var canvas=GetComponentInParent<Canvas>();Drag?.Invoke(e.delta/(canvas==null?1:canvas.scaleFactor));}
    }
}
