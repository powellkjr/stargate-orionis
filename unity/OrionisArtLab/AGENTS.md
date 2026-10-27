# Independent animation workspace

Read the repository's ../../REPO_MAP.md and update the existing animation
workstream in ../../CURRENT_TASK.md; do not create a replacement task.

This project is an isolated art/rig/animation lab. The game project is
../StargateOrionis. Do not operate its Editor, Play mode, pipeline endpoint,
campaign state or save files for art work.

Use THIS project's Library/Pipeline/.unity-pipeline-port to target its Editor.
Read projectPath from the descriptor and confirm it resolves to OrionisArtLab
before any automation command. Different Unity projects have different ports;
never assume port 7801 belongs to this lab.

Keep vendor files under Assets/ToonSoldiers_demo unchanged and untracked.
Put original preview scenes, controllers and editor utilities in this project.
Promote reviewed assets into the main game only as a separate explicit task.
No game-domain code or campaign save fixtures belong in the lab.

User-facing terminal commands must use Git Bash syntax.
