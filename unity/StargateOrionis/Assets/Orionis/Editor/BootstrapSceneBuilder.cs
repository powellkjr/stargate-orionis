using System;
using System.IO;
using System.Security.Cryptography;
using Orionis.Infrastructure;
using Orionis.Presentation;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Orionis.Editor
{
    [InitializeOnLoad]
    public static class BootstrapSceneBuilder
    {
        public const string ScenePath = "Assets/Orionis/Scenes/Bootstrap.unity";
        public const string SnapshotPath = "Assets/Orionis/Data/Generated/bootstrap.json";
        static BootstrapSceneBuilder() { EditorApplication.delayCall += PrepareFirstScene; }
        private static void PrepareFirstScene()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode || File.Exists(ScenePath)) return;
            // Unity cannot add a scene alongside an unsaved untitled scene.
            if (!UnityEngine.Application.isBatchMode && HasUntitledScene()) return;
            try { Rebuild(); }
            catch (Exception error) { Debug.LogError("Orionis setup: " + error.Message); }
        }
        public static void ValidateSnapshot()
        {
            var source = BootstrapReader.Parse(File.ReadAllText(SnapshotPath));
            var repository = Path.GetFullPath(Path.Combine(UnityEngine.Application.dataPath, "../../.."));
            foreach (var input in source.sources)
            {
                var path = Path.GetFullPath(Path.Combine(repository, input.path));
                if (!path.StartsWith(repository + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
                    throw new FormatException("Snapshot source escapes repository.");
                using var hash = SHA256.Create();
                var actual = BitConverter.ToString(hash.ComputeHash(File.ReadAllBytes(path))).Replace("-", "").ToLowerInvariant();
                if (actual != input.sha256) throw new InvalidOperationException(
                    "Stale fixture snapshot. From repository root run: node unity/tools/bootstrap-snapshot.mjs");
            }
            BootstrapReader.Read(File.ReadAllText(SnapshotPath));
        }
        [MenuItem("Orionis/Rebuild Bootstrap Scene")]
        public static void Rebuild()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode) throw new InvalidOperationException("Exit Play mode first.");
            if (SceneManager.GetSceneByPath(ScenePath).isLoaded)
                throw new InvalidOperationException("Close the Bootstrap scene before rebuilding it.");
            if (HasUntitledScene() && !UnityEngine.Application.isBatchMode)
                throw new InvalidOperationException("Save or close the untitled scene before creating Bootstrap.");
            ValidateSnapshot();
            Directory.CreateDirectory("Assets/Orionis/Scenes");
            AssetDatabase.Refresh();
            var previous = SceneManager.GetActiveScene();
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,
                HasUntitledScene() ? NewSceneMode.Single : NewSceneMode.Additive);
            try
            {
                SceneManager.SetActiveScene(scene);
                var camera = new GameObject("Main Camera", typeof(Camera));
                camera.tag = "MainCamera"; camera.transform.position = new Vector3(0, 0, -10);
                camera.GetComponent<Camera>().orthographic = true;
                camera.GetComponent<Camera>().clearFlags = CameraClearFlags.SolidColor;
                camera.GetComponent<Camera>().backgroundColor = new Color(.055f, .075f, .1f);
                var root = new GameObject("Orionis Prototype", typeof(PrototypeBootstrap));
                root.GetComponent<PrototypeBootstrap>().Configure(AssetDatabase.LoadAssetAtPath<TextAsset>(SnapshotPath));
                if (!EditorSceneManager.SaveScene(scene, ScenePath)) throw new IOException("Could not save Bootstrap scene.");
            }
            finally
            {
                if (previous.IsValid() && previous.isLoaded)
                {
                    SceneManager.SetActiveScene(previous);
                    EditorSceneManager.CloseScene(scene, true);
                }
            }
            Debug.Log("Orionis bootstrap ready. Choose Orionis > Open Bootstrap, then Play.");
        }
        [MenuItem("Orionis/Open Bootstrap")]
        public static void Open()
        {
            if (!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) return;
            ValidateSnapshot();
            if (!File.Exists(ScenePath)) Rebuild();
            EditorSceneManager.OpenScene(ScenePath);
        }
        private static bool HasUntitledScene()
        {
            for (int i = 0; i < SceneManager.sceneCount; i++)
                if (string.IsNullOrEmpty(SceneManager.GetSceneAt(i).path)) return true;
            return false;
        }
    }
}
