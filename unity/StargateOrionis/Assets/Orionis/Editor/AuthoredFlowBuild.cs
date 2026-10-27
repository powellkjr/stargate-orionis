using System;
using System.Diagnostics;
using System.IO;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;

namespace Orionis.Editor
{
    // Runs for the menu build, batch BuildPlayer and ordinary Build Settings.
    // Authored-flow export is required; PNGs use the optional local PlantUML jar.
    public sealed class AuthoredFlowBuild : IPreprocessBuildWithReport
    {
        public int callbackOrder => -1000;
        public void OnPreprocessBuild(BuildReport report)
        {
            Generate();
            BootstrapSceneBuilder.ValidateSnapshot();
        }
        public static void Generate()
        {
            var repository=Path.GetFullPath(Path.Combine(UnityEngine.Application.dataPath,"../../.."));
            var start=new ProcessStartInfo
            {
                FileName="node",Arguments="tools/export-flows.mjs --render-if-available",
                WorkingDirectory=repository,UseShellExecute=false,CreateNoWindow=true,
                RedirectStandardOutput=true,RedirectStandardError=true
            };
            try
            {
                using var process=Process.Start(start);
                var output=process.StandardOutput.ReadToEndAsync();
                var errors=process.StandardError.ReadToEndAsync();
                if(!process.WaitForExit(210000))
                {
                    process.Kill();
                    throw new BuildFailedException("Authored-flow export timed out.");
                }
                if(process.ExitCode!=0)throw new BuildFailedException("Authored-flow export failed:\n"+errors.Result+output.Result);
                UnityEngine.Debug.Log(output.Result.Trim());
            }
            catch(BuildFailedException){throw;}
            catch(Exception error){throw new BuildFailedException("Cannot run authored-flow exporter. Ensure Node.js is on PATH. "+error.Message);}
        }
    }
}
