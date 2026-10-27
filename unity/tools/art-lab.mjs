// Explicitly targets the independent art Editor, never the game Editor.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../OrionisArtLab/', import.meta.url));
const normalize = p => path.resolve(p).replaceAll('\\', '/').toLowerCase();
const descriptor = JSON.parse(await readFile(path.join(project, 'Library/Pipeline/.unity-pipeline-port'), 'utf8'));
if (normalize(descriptor.projectPath) !== normalize(project)) {
  throw new Error('Refusing automation: descriptor does not belong to OrionisArtLab.');
}
const [command = 'status', jobId] = process.argv.slice(2);
const code = {
  refresh: 'UnityEditor.AssetDatabase.Refresh(); return "Art Lab refresh requested";',
  verify: 'Orionis.Editor.GameActionPreviewBuilder.Build(); return "Focused game action preview built";',
  open: 'if(UnityEditor.EditorApplication.isPlayingOrWillChangePlaymode) throw new System.Exception("Stop Art Lab Play first"); Orionis.Editor.GameActionPreviewBuilder.Open(); return "Focused game action preview opened";',
  play: 'UnityEditor.EditorApplication.isPlaying=true; return "Art Lab Play requested";',
  stop: 'UnityEditor.EditorApplication.isPlaying=false; return "Art Lab Stop requested";',
  capture: 'Orionis.Editor.GameActionPreviewBuilder.Capture(); return "Focused game action render passed";',
  'verify-viewer': 'Orionis.Editor.GameActionPreviewBuilder.Verify(); return "Focused game action checks passed";',
  'build-library': 'Orionis.Editor.ToonSoldiersProofPreview.BuildAndVerify(); return "Legacy library preview built";',
  'open-library': 'Orionis.Editor.ToonSoldiersProofPreview.Open(); return "Legacy library preview opened";',
  'verify-library': 'Orionis.Editor.ToonSoldiersProofPreview.VerifyViewer(); return "Legacy library checks passed";',
  'build-actions': 'Orionis.Editor.GameActionPreviewBuilder.Build(); return "Focused game action preview built";',
  'open-actions': 'Orionis.Editor.GameActionPreviewBuilder.Open(); return "Focused game action preview opened";',
  'verify-actions': 'Orionis.Editor.GameActionPreviewBuilder.Verify(); return "Focused game action checks passed";',
  'verify-parts': 'Orionis.Editor.CharacterPartsBuilder.Verify(); return "Character parts checks passed";',
  'verify-dialogue': 'Orionis.Editor.AdditionalAnimationReview.Verify(); return "New-pack motion checks passed";',
}[command];
if (!['status', 'job'].includes(command) && !code) throw new Error('Use status, refresh, verify, verify-viewer, open, play, stop, capture, or job <id>.');
if (command === 'job' && !/^[a-f0-9]{32}$/i.test(jobId ?? '')) throw new Error('Provide the verification job ID.');
const endpoint = command === 'status' ? '/api/editor_status'
  : command === 'job' ? `/api/job?id=${encodeURIComponent(jobId)}` : '/api/exec';
const response = await fetch(`http://127.0.0.1:${descriptor.port}${endpoint}`, {
  method: code ? 'POST' : 'GET',
  headers: { Authorization: `Bearer ${descriptor.evalToken}`, 'Content-Type': 'application/json' },
  ...(code ? { body: JSON.stringify({ command: 'eval', job: command.startsWith('verify')||command.startsWith('build'), parameters: { code, timeout: 60000 } }) } : {}),
  signal: AbortSignal.timeout(65000),
});
const result = await response.json();
console.log(JSON.stringify(result, null, 2));
if (!response.ok || result.success === false || result.result?.success === false) process.exitCode = 1;
