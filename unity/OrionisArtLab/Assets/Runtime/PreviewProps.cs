using System;
using UnityEngine;
using KevinIglesias;

namespace Orionis.ArtLab
{
    [Serializable]
    public sealed class PreviewProp
    {
        public GameObject instance;
        public Transform supportGrip;
        [Tooltip("Enable only after authoring the support-hand grip position and rotation for this rig.")]
        public bool gripCalibrated;
        [Tooltip("The calibration was authored with the prop held in the left hand.")]
        public bool calibratedForLeftHold;
    }

    // Unity serializes classes containing arrays, but not jagged arrays.
    [Serializable]
    public sealed class PreviewSubjectProps
    {
        public PreviewProp[] props=Array.Empty<PreviewProp>();
        public Transform ikSwitch;
        public IKHelperTool ikTool;
    }
}
