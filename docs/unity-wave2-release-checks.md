# Wave2 release checks — October25,2026

Implementation and automated release checks are complete. User acceptance of
the standalone playthrough remains pending; it is not inferred from automation.

- Windows64 build succeeded:145,143,078 bytes,39.3s. Output is
  `unity/StargateOrionis/Builds/Windows/StargateOrionis.exe` with adjacent files.
- Packaged `PLAYTEST.md` matches the current playtest guide.
- Existing full rescue/cache/rifle/equipment/redeployment control walkthrough:
  **1 passed / 0 failed**,20.01s. Assertions cover save/resume, storage reservations,
  progressive resource output, same-instance equipment and retained personnel.
- Two separate headless Windows player launches passed actual Save/Load control
  checks, comparing complete campaign/selection state at tick3. Debug defaults off.
  Only an explicit temporary save path was used; normal slots were untouched.
- Ordinary Editor Play/Stop/restart succeeded; zero nonpersistent PlayMode test
  controllers remained. The user's campaign matched its tick15724 backup and
  original view/clock settings were restored.

Earlier attempts exposed stale test navigation/prose expectations after the UI
changes and additional eligible tierIII crosspath Actors. These were corrected.
The exact unrelated Editor AI Account API timeout warning is expected if emitted;
gameplay log assertions remain strict. The build's remote response timed out,
but Unity's actual build result succeeded; the build was not launched twice.

The [player guide](unity-playtest-guide.md) contains the remaining manual route
and relaunch checklist. Holding intake, Core installation/power, XP/research and
a broader campaign remain outside this slice. The supplied Core design is
preserved with its [authoring audit](unity-receiving-cores-audit.md).
