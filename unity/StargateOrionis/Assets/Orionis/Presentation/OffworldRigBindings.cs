using UnityEngine;
namespace Orionis.Presentation
{
    public sealed class OffworldRigBindings : MonoBehaviour
    {
        public Transform nativeSpine,spineProxy;public Quaternion spineRestOffset;
        private void LateUpdate(){if(nativeSpine!=null&&spineProxy!=null)nativeSpine.rotation=spineProxy.rotation*spineRestOffset;}
    }
}
