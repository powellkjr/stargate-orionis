using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using Orionis.Application;
using UnityEngine;
namespace Orionis.Presentation
{
    // Visual interpolation of already committed work. No prediction or simulation writes.
    public sealed class InspectionProgressAnimation
    {
        private float[] from,target;private float changedAt,duration;
        public float[] Value(float now)
        {float t=duration<=0?1:Mathf.Clamp01((now-changedAt)/duration);return target.Select((v,i)=>Mathf.Lerp(from[i],v,t)).ToArray();}
        public void Retarget(float[] values,float now,float seconds,bool snap=false)
        {
            if(target!=null&&target.SequenceEqual(values))return;
            snap|=target==null||target.Length!=values.Length||values.Where((v,i)=>target!=null&&i<target.Length&&v<target[i]).Any();
            from=snap?(float[])values.Clone():Value(now);target=(float[])values.Clone();changedAt=now;duration=snap?0:Mathf.Max(.03f,seconds);
        }
        private sealed class Entry{public InspectionProgressAnimation Animation=new InspectionProgressAnimation();public long Tick;}
        private sealed class Timeline
        {
            public readonly Dictionary<string,Entry> Entries=new Dictionary<string,Entry>();public long Tick;public float LastTime,Interval=.2f;
            public Timeline(CampaignSession session){Tick=session.State.Clock.ElapsedTicks;LastTime=Time.unscaledTime;session.TickCommitted+=Observe;}
            public void Observe(long tick)
            {
                if(tick==Tick)return;float now=Time.unscaledTime;
                if(tick<Tick){Entries.Clear();Interval=.2f;}
                else Interval=Mathf.Clamp((now-LastTime)/Mathf.Max(1,tick-Tick),.03f,3f);
                Tick=tick;LastTime=now;
            }
        }
        private static readonly ConditionalWeakTable<CampaignSession,Timeline> Timelines=new ConditionalWeakTable<CampaignSession,Timeline>();
        public static InspectionProgressAnimation Track(CampaignSession session,string key,float[] values)
        {
            var timeline=Timelines.GetValue(session,s=>new Timeline(s));timeline.Observe(session.State.Clock.ElapsedTicks);
            bool fresh=!timeline.Entries.TryGetValue(key,out var entry);if(fresh)timeline.Entries[key]=entry=new Entry{Tick=timeline.Tick};
            entry.Animation.Retarget(values,Time.unscaledTime,timeline.Interval,fresh||timeline.Tick-entry.Tick>1);entry.Tick=timeline.Tick;return entry.Animation;
        }
    }
}
