# Windows slice playtest

Build from Unity in Edit mode using **Orionis > Build Windows Slice**.
Launch `unity/StargateOrionis/Builds/Windows/StargateOrionis.exe`.
Keep the executable and every adjacent build file/folder together when copying it.
The build opens Bootstrap directly in a resizable 1440 × 900 window.

1. Open the Ready Room and assign available Units to an SG team (four places at CT1, five at CT2, six at CT3).
2. Open Mission briefing, select the team, check up to four members and deploy. Other members remain reserves. Follow the rescue mission
   through extraction and the debrief. Offworld actions advance campaign time.
   The map's Stage action hexes use the same commands as the detailed action
   controls. Hover or select a hex to read its requirements/blocker; choose a
   movement hex to travel. Hacking, combat, care and cargo hexes open the existing
   work/choice panels. These are Stage choices, not a full object-position map.
3. At base, open **Base inventory** or select a room and choose **Open room
   inventory**. Tabs filter current custody by physical room; reserved storage
   is shown separately when an item is away. Receiving's completed intake only
   establishes handling and broad classification, not full identity. Containment
   stores items; staffed Analysis reveals their remaining properties.
   A finished object continues occupying its Analysis place until you choose
   **Return custody to assigned storage** (zero ticks), or assign another valid
   storage destination (one tick). If Analysis is full, the inventory offers a
   shortcut to its completed object. Return it, then send the next object.
4. Fully identified eligible equipment can be accepted for SGC use, assigned to
   Equipment Storage and issued through its inventory browser.
5. Save, close the application, relaunch and Load. Check that the same team,
   mission progress, personnel condition and item assignments return.
6. Prepare redeployment from the returned mission to begin another attempt using
   the current personnel condition and issued equipment.

The base clock starts running. Pause and 1×/4×/8×/16× controls remain available.
Debug starts off in the standalone player. Its toggle exposes manual tick
stepping, Reset mission and Reset object for repeated testing. Mission reset
also restores personnel condition; object reset preserves staff/team assignments.
Resets change the live session; Save explicitly replaces the slot.

The Windows player uses `campaign-save.json` in Unity's application persistent
data folder (`AppData/LocalLow/DefaultCompany/StargateOrionis`). The Editor keeps
using `prototype-save.json`, so testing the player does not replace the Editor
slot. The player starts a fresh session until you choose Load; there is no autosave.

Resource cargo conversion, recovery and replenishment remain unfinished Wave 1
work. This build is a playtest of the implemented mission/equipment loop.

## Base construction

1. From the base map choose **Base planning**. The room catalog uses the same
   category groups as the simulator.
2. Select **Ready Room**, CT1. Click an empty cell in the central cleared area,
   or enable **Clear rock**, click a Rock cell, then turn clearance off. Each
   rock cell starts eight one-tick UNTRAINED bubbles. Assign Units to Maintenance:
   any profession can work them, without a Tool. Each available Unit works one
   bubble per tick, so two available staff finish in four ticks. White unworked
   bubbles take their worker's profession color. The cell stays blocked until
   all eight finish, then yields 10 S1 once. Save/Load preserves partial work.
3. Click **Build**. Eligible permanent Maintenance staff resolve automatically.
   Maintenance must also have an available Soldier (SO1). Starter staff are
   supplied when their authored Units have no saved assignment; otherwise assign
   a Technician with TET1 and a Soldier to Maintenance yourself.
4. Supply decreases once (24 S1 for Ready Room). Keep the base clock running;
   1x/4x/8x/16x affect elapsed real time, not required work. CT1 rooms take 24–48 game
   hours. Progress shows percent and profession-colored segments: Soldier security
   first, then Technician work. Missing staff/Tool capability displays a blocker
   and retains completed work.
5. Save during construction, then Load. Stock, cleared rock and progress should
   remain. On completion the orange construction site becomes a normal usable
   room under the same ID. A new Ready Room can hold another SG team.

Construction needs cleared cells, valid geometry, enough tier-matched Supply,
local Maintenance staff and an equipped TET1 Tool. The starter stock and rock yield
are provisional shared data. New support rooms are present, but this batch adds
no resident, healing, power or ration-consumption simulation. There is no cancel
refund. The tier selector quotes a new room at that tier; it does not upgrade an
existing room.

### Construction estimates and Ready Room tiers

Scroll the planner details for new-construction and incremental upgrade quotes.
Rates are six hours per Core/staff/occupant place, ten INV or 1,000 resources;
new-room minimum is 24 hours, at one Supply/hour. Every CT1 room quotes 24-48
hours. Receiving/Containment are 48h, Gate Room is 36h, Equipment Storage is 24h.

Select Ready Room and cycle CT1/2/3: membership capacity is 4/5/6. This is still
a preview; it does not upgrade your existing Ready Room. When a room has extra
members, the mission briefing offers checkboxes for its four deployees and lists
reserves. XP sharing is specified for the entire roster; mission XP awards are
not connected yet. Equipment Storage has 20 shared places across both tabs.

See the approved CT1 chart in docs/room-capacity-standardization-checklist.md in
the repository for all room capacities and the unchanged upper-tier scope.

## Physical room upgrades and Room Groups

The clock-speed button cycles **1x -> 4x -> 8x -> 16x -> 1x**. The resource bar
remains visible on every screen. Supply includes S1/S2/S3 stock; Materials and
Rations show zero until their campaign has stock. No stock is granted by UI.

In **Base planning**, enable **Manage**, click an existing room. Maintenance staff resolve
automatically. **Upgrade room** spends the incremental quote in Supply
matching the destination CT. A Ready Room CT1->2 takes six game hours and six S2;
it remains four places until completion, then has five. Save/Load during work
must retain progress, Supply, assignments and the same room ID. The tier button
continues to quote new construction in placement mode.

For a Group test, build another **Analysis** at column6,row2, directly above the
starter Analysis at6,3. In Manage mode click6,3 (primary), then6,2 (secondary), and
**Join selected rooms**. The details show child order. A Scientist assigned to
one child can work on an object whose Analysis custody is at the other child.
Validated storage stays reserved. Split pauses work if its sticky Scientist is
outside the destination's remaining Group; rejoining permits the same Scientist
to resume. **Split Group** restores children without deleting rooms or inventory.
Click the selected secondary again to make it the new primary selection.

Rooms must share joining rules and CT. Join two adjacent physical rooms into a
pair, or two pairs into a2x2. Split before upgrading one child, then rejoin after
tiers match. Ready Rooms retain their authored no-joining rule. Core installation,
Group Tools and Response staffing remain pending authoring/implementation.

Construction cards use a reusable visual component, smooth bounded fills,
framed profession-colored segments and an active-step pulse. Actual ticks remain
integer work; animation grants no progress. Reference reviewed:
[Code Monkey's health-bar tutorial](https://unitycodemonkey.com/video.php?v=Gtw7VyuMdDc).
The frame, segmented styling and active highlight are this prototype's own UI.

### When the clock waits during a mission

A team still offworld owns campaign time through its committed actions. The base
clock therefore waits even while you inspect the base. If the header says
**Awaiting Gate decision**, open **Mission briefing** and choose Maintain/Close;
subsequent mission actions advance both the clock and construction. Construction
can be ordered from the base while the team is offworld; it does not gain free
real-time progress. After extraction the base clock resumes automatically.

Construction and upgrades no longer have a Technician dropdown. The readiness
panel shows the eligible Maintenance Technician and Soldier automatically, or the
specific staffing/Tool/reservation blocker. Assignments are re-resolved whenever
staffing changes; once a work order starts, its Actor identities remain sticky.
