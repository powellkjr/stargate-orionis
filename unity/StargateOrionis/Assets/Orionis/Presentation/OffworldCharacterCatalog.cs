using System;
using UnityEngine;
namespace Orionis.Presentation
{
    [Serializable] public sealed class OffworldActionPlacement{public string id,target,transition,kind;}
    [Serializable] public sealed class OffworldSceneActor{public string id,stage,label,profile,conditionInstance,conditionField,requiredKnowledge;public bool conditional,conditionValue;public Vector2 point;}
    [Serializable] public sealed class OffworldCharacterProfile{public string profession;public GameObject prefab;}
    public sealed class OffworldCharacterCatalog : ScriptableObject
    {public OffworldActionPlacement[] actions;public OffworldSceneActor[] sceneActors;public OffworldCharacterProfile[] profiles;public int renderLayer=31,rendererIndex;public RuntimeAnimatorController controller;}
}
