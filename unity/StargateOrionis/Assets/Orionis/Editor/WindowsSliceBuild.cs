using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Orionis.Editor
{
    public static class WindowsSliceBuild
    {
        [MenuItem("Orionis/Build Windows Slice")]
        public static void Build()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode)
                throw new InvalidOperationException("Exit Play mode before building.");
            var output = Path.GetFullPath("Builds/Windows/StargateOrionis.exe");
            Directory.CreateDirectory(Path.GetDirectoryName(output));
            var width = PlayerSettings.defaultScreenWidth;
            var height = PlayerSettings.defaultScreenHeight;
            var mode = PlayerSettings.fullScreenMode;
            var resizable = PlayerSettings.resizableWindow;
            try
            {
                PlayerSettings.defaultScreenWidth = 1440;
                PlayerSettings.defaultScreenHeight = 900;
                PlayerSettings.fullScreenMode = FullScreenMode.Windowed;
                PlayerSettings.resizableWindow = true;
                var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
                {
                    scenes = new[] { BootstrapSceneBuilder.ScenePath },
                    locationPathName = output,
                    target = BuildTarget.StandaloneWindows64,
                    options = BuildOptions.None
                });
                if (report.summary.result != BuildResult.Succeeded)
                    throw new InvalidOperationException("Windows build failed: " + report.summary.result);
                var guide = Path.GetFullPath(Path.Combine(UnityEngine.Application.dataPath, "../../../docs/unity-playtest-guide.md"));
                File.Copy(guide, Path.Combine(Path.GetDirectoryName(output), "PLAYTEST.md"), true);
                Debug.Log("Orionis Windows build ready: " + output + " (" + report.summary.totalSize + " bytes).");
            }
            finally
            {
                PlayerSettings.defaultScreenWidth = width;
                PlayerSettings.defaultScreenHeight = height;
                PlayerSettings.fullScreenMode = mode;
                PlayerSettings.resizableWindow = resizable;
            }
        }
    }
}
