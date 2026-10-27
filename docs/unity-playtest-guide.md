# Windows slice playtest

Updated October25,2026. This covers the supported Missing Operative loop, not complete simulator or campaign parity.

## Launch and saves

Run `unity/StargateOrionis/Builds/Windows/StargateOrionis.exe`. Keep all adjacent build files/folders together. The resizable window starts at1440×900; debug controls start off.

The base clock starts running, with Pause and1×/4×/8×/16× speeds. Offworld actions own campaign ticks while a team is deployed. Save explicitly writes the campaign; there is no autosave. Relaunch starts fresh until you press Load.

The player uses `campaign-save.json` in Unity's persistent data folder, normally `AppData/LocalLow/DefaultCompany/StargateOrionis`. The Editor separately uses `prototype-save.json`. Copying the game folder does not copy its save.

## Supported mission loop

1. Open the **Ready Room**, create an SG team and choose members covering Soldier, Technician, Medic and Diplomat capabilities, with equipped Tools. Crosspaths can provide extra roles. Ready Room CT1/2/3 membership is4/5/6; at most four deploy.
2. Open **Mission briefing**. Mission information is on the left; personnel cards and checkboxes are on the right. Check readiness and assign the team.
3. At the Gate, maintain or close the connection. It lasts12 ticks/36 game minutes. Use target-positioned map hexes for movement, hacks and local work. Select a shared action/response hex, then an adjacent Actor hex to assign the Unit. Hover/select for requirements/blockers. Unknown rooms remain hidden.
4. Follow the yard conversation and clear its guards. Reach Main Hall; hack Holding's door and clear its guards. Ask the medical worker about equipment, stabilize all three patients through **Patients and evacuation**, and identify the operative using the transmitter code.
5. With care and route requirements satisfied, send the operative to the Gate. Return there; the Gate hex switches from Redial to Extract once connected. Crates are marked for extraction and remain at their source. For now all marked items extract; individual item choices and per-item extraction constraints are deferred to the extraction-screen wave. Combat rounds together consume one encounter tick.
6. Debrief shows outcome and extraction-time HP/Tool charges. Marked crate contents and Supply caches enter Receiving on return. Base personnel heal1HP/tick, or2HP/tick in an assigned Infirmary bed; Tools refill on return. Debrief cards keep the extraction figures.

### Supply cache branch

From Main Hall, hack the Processing Room door with a qualified Technician and `TECH_SERVICE_II`. Isolate mining power, inspect the cache twice, then mark it for extraction. The marked cache remains at its source until extraction and enters Receiving on return. This is separate from the weapon crate.

Ask the Processing worker about the facility after isolating the power to learn
the hidden-safe route. The safe has two separately marked physical packages;
both enter Receiving with their original identities. The mission lab's benches
are visible, but its authored parallel search and mounted-device workflow are
not playable yet.

New fights select a random living opponent for each individual attack, for both
sides. Save/Load preserves the fight's targeting stream and pending aim. Fights
already saved under the old roster-order policy retain their original outcomes.

## Room processing and equipment

1. Click **Receiving** on the base map to open its incoming/admitted queue. Assign local Technician/TET1 and Scientist/SCT1 staff from base staffing controls, then admit items. Resume time to execute their visible inspection bubbles; blockers explain missing capabilities.
2. Route objects to eligible **Containment** or **Warehouse** storage. Containment only stores items. Routing keeps the source queue open; **Follow to…** explicitly opens the destination.
3. Send custody to staffed **Analysis** to reveal remaining properties. The same instance retains its fallback-storage reservation. Return custody to storage after examination to release the Analysis item place.
   **Locate all cargo** shows items across queues with stable cargo references
   and their current room or Unit custody. Storage reservations and work custody
   are separate: an item being examined stays reserved in Containment and appears
   in Analysis until explicitly returned.
4. Fully identified, intact equipment can be accepted for SGC use and assigned to **Equipment Storage**, then issued to a Unit there. Each Unit has weapon and armor slots; this route supplies a rifle, not physical armor.
5. The cache's current Balanced graph produces61 S1+15 S2 progressively across10 bubbles (Medium), including its two inspections. Storage-blocked outputs wait unchanged; free capacity and retry them. Save/Load must not duplicate outputs. Receiving starts with installed Medium handling and Balanced recovery Cores.
6. Prepare redeployment at debrief. Team assignments, personnel condition, equipment, cargo and balances persist. Save, quit the player, relaunch and Load before another sortie.

## Base management

- Art/Schematic changes presentation only. Infirmary beds and Holding's four captive places are separate from staff. Complete prisoner intake/assignment remains unimplemented.
- Transfer timing controls appear for unfinished room work; cancellation appears only for a planned move.
- **Base planning** follows simulator catalog categories. Rock clearing has eight one-tick UNTRAINED bubbles, worked in parallel by available Maintenance staff. Supply arrives per completed bubble, totaling10 S1/cell.
- New construction/upgrade orders use80% general Maintenance work and20% specialists, including Soldier security and Technician/TET1 work. Parallel bubbles retain sticky Actors and Save/Load progress. Old orders retain their serial schedules.
- Build needs cleared cells, local Maintenance capabilities and tier-matched Supply. Shared provisional prices use one Supply/work hour; CT1 quotes are generally24–48 work hours. Parallel staff shorten elapsed time. No cancellation refund/salvage exists.
- **Manage** selects a physical room for paid upgrades and valid Join/Split target buttons. Dashed borders show joining support; green marks valid destinations. Physical child rooms and Core sets remain distinct.

## Release acceptance

Complete rescue, cache/weapon recovery, room processing, equipment issue and another sortie without debug resets. Save during work and after return. Quit/relaunch/Load and confirm no lost assignments, duplicated cargo, reset balances or lost Tool expenditure. Check all four personnel cards, target hexes and scrollable queues at your window size.

Owned Core installation/power, broader research/fabrication, mission XP rewards, full prisoner workflows and a second mission remain outside Wave2. See the migration plan and Receiving Core handoff audit.

## Build and verification

In Edit mode choose **Orionis > Build Windows Slice**. It includes this guide as `PLAYTEST.md`. The existing rescue/cache/rifle/redeployment control walkthrough is the main automated acceptance route.

Every Unity player build first regenerates the [authored flow diagrams](generated/flows/README.md)
from shared source data, then checks game snapshot freshness. This also covers
Build Settings and batch BuildPlayer. The build renders PNGs with the local
PlantUML jar (`PLANTUML_JAR`, otherwise `~/Downloads/plantuml-1.2024.6.jar`) when
available. Node.js must be on PATH; rendering also needs Java and Graphviz.
Without a local jar the `.puml` files are still generated. The diagrams show all
authored branches, including those not yet ported to Unity.

An explicit engineering-only `--verify-session` temporary save path plus `--verify-phase save` or `load` enables two-launch Save/Load verification. It compares complete state/selection and default debug visibility, writes a result and exits. It never touches the normal save slot; normal launches do not enable it.


Receiving equipment: select Receiving at base → Cores. Assign a Technician there
with a charged TET Tool. Remove/install uses the displayed four-bubble Recipe;
Save/Load preserves partial work. Removal reserves a Warehouse shelf place;
installation reserves maximum-active PWR and a physical-room slot, then releases
the shelf at commit. Active cache processing completes before queued changes.
The cache tracker explicitly reports missing staff/equipment and blocked deposits.


## Consolidated base-operations check

Use this one route for the larger staffing/UI batch:

1. Open **Operations**. Active/Blocked/All show work, progress and reasons across
   Receiving, handling, Analysis, cache recovery, construction, rock and Cores.
   Open work reaches its queue or construction plan; existing pausable jobs have
   Pause/Resume. All includes saved completed history.
2. Build a Response Room through normal Maintenance work. Assign a qualified
   Technician/Scientist there. Local Response staff can assist Receiving/Analysis
   after permanent local/Group staff; unassigned idle roster members cannot.
3. While a two-tick inspection has one tick of work, switch that Response Room to
   **Base Response**. The same Actor's bubble waits. Save/Load, switch back to
   Local Response, and confirm that Actor resumes. An alternative worker cannot
   inherit the partial bubble. No interruption timeout is invented.
4. Select a room → **Services** to inspect its actual Room Group, embedded/Core
   Services, configured Group Tools and eligible staff sources. A Service in an
   unrelated Group does not count. Construction CT does not grant Technology-II
   tooling; that Workshop installation path remains unauthored.

Do not reset the campaign to test this set. Your existing assignments, equipment,
resource balances, Core identities and completed work remain valid in schema30.


Operations journal update (October26): **All** is the default. Ongoing jobs appear
first, followed by newest completions. **Completed** shows the persistent journal.
Routing, clearing a source queue or redeploying does not erase archived work;
Save/Load retains separate repeated runs. Imported legacy completions without a
time are explicitly marked rather than assigned an invented timestamp.
Receiving/cargo/Core bubble fill interpolates already committed work across ticks
and view rebuilds. Animation never deposits resources or advances Recipes.

## Mission lab and dialogue follow-up (October27)

The Analysis Lab has a group Search action. Each available party member takes
one authored station and works in parallel for one hour; four Units do not turn
that into four elapsed hours or divide it into fifteen minutes. Confirm completes
the existing twenty-tick work, and Save/Load retains every station's Actor.
Search reveals the mounted device and enables passive profession observations.
Characterization needs Scientist capability, equipped SCT1 and the authored
subject Knowledge. Detachment needs Technician2 and TECH_SERVICE_II; mark the
prepared device for extraction afterward. The report terminal uses a Scientist
after characterization. Report/question records are visible in mission details;
they are not physical inventory definitions or institutional Theory grants.
They remain expedition records through extraction/Save/Load; a separate base
knowledge-cargo database/handoff is still outside this adapter. Reset mission
clears expedition records. The physical device follows the existing Receiving,
reserved storage, temporary Analysis custody and return-to-storage route.

Dialogue presents numbered written responses followed by full-name speaker
choices. Back changes the chosen response without committing it. Read terminal
replies before Continue; movement resumes afterward. Map hexes use the same
response/Actor rules. Primitive walls/doors now overlay known indoor floors and
base room Groups; missing base door anchors and mission CT are documented in
the structural handoff rather than inferred.
