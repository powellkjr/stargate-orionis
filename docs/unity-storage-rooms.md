# Starting-base storage rooms



October 18 user correction: the basic base needs storage, equipment storage and

containment to support objects coming back from offworld.



The existing authored catalog already defines these categories. The starting

layout now contains the following physical rooms, all 1×1 at CT1:



| Instance | Definition | Zero-based cell | Staff | Authored configured limits shown |

| --- | --- | --- | --- | --- |

| r7 | Material Storage | 4,4 | 0 | Bulk storage 4000; CT2/3 definitions retain 6000/8000. |

| r8 | Supply Storage | 5,4 | 0 | Bulk storage 4000; CT2/3 definitions retain 6000/8000. |

| r9 | Equipment Storage | 6,4 | 0 | Weapons and Armor EQ tabs reference storage 20/40/80. |

| r10 | Containment | 7,4 | 2 | CC Storage references inventory 20/40/80. |

| r11 | Warehouse | 8,4 | 0 | 20 item places; provisional, explicitly approved October 18. |



Material and Supply Storage stay separate because the catalog distinguishes

material cargo from supply cargo. Existing rooms, Ready Room and team membership

are preserved. This adds physical instances to the test base; it does not change

the catalog's joining, construction, Core or staffing rules for those room types.



Select a storage room in Unity to inspect its configured categories and tab

limits. Containment can be staffed through the existing Unit assignment UI.

The four automated storage rooms cannot accept ordinary staff. Map labels

identify storage rather than displaying a misleading staff 0/0 counter.



`roomStorage` is a read-only bootstrap configuration projection. It is imported

by `Infrastructure/RoomStorageReader.cs` into `Domain/RoomStorage.cs` and shown

by the selection UI. It is not an occupied-inventory counter, item admission

system, equipped-Tool pool or physical custody ledger.



## Preserve the separate authored quantities



Containment has a separate storage-rule progression 2/4/8 and a CC inventory

progression 20/40/80. The CC tab explicitly uses inventory; both values remain

in the projection and the UI labels that tab's configured capacity as 20 at CT1.

Equipment Storage also has a parent item-slot description alongside the tab

storage progression. This change does not reconcile those quantities, add the

two EQ tab limits together or invent a shared/per-tab occupancy policy. Inventory

implementation must inspect the existing admission/capacity contracts before

enforcing occupied capacity.



## Save compatibility



Schema 13 pins the exact six-room/SG-team projection in

`unity/tools/fixtures/bootstrap-before-storage-rooms.json`. Saves through schema

12 are validated against that previous scope first, including its earlier

five-room migrations. Then only the four new room instances are added. Team

records, active mission Team ID, staff, receiving custody/progress/Actor, clock,

RNG and selection remain intact. Custom old placement conflicts are rejected

instead of moving or overlapping rooms. Load does not write the player slot.



## Remaining cargo integration



The supported Unity mission currently extracts the operative; generic physical

offworld item recovery is still pending. Adding rooms does not move cargo into

them. The next item slice must connect the existing authored offworld recovery

and debrief selection to persistent base item instances, Receiving admission,

handling/classification and capacity-checked custody transfers to valid storage.

Preserve the same instance ID and hidden Reality/Knowledge boundaries throughout.

Do not infer item contents, grant Tools or skip required processing from a room's

existence. See `unity-receiving-gap-audit.md`, the original mission/item fixtures,

`demos/shared/offworld/recovery.mjs` and the existing process-transfer tests.



## Warehouse and retention decision — October 18 clarification



The user named the previously missing General Storage room **Warehouse** and

approved a provisional 1×1 room, 20 item places, no staff or Cores, no joining,

and no stacking (CT1 only). Its authored definition is `warehouse`; instance

r11 sits at cell 8,4. Material/Supply Storage do not substitute for it.



Intended routing after Receiving safe handling:



- Warehouse: safe temporary shelf holding while retention/disposition is undecided.

- Equipment Storage: suitable equipment accepted by the SGC for Unit use.

- Containment: leaking, unsafe, damaged in a hazardous way, or insufficiently

  classified to establish safe ordinary storage. Damage alone does not prove a

  hazard; actual condition and established handling requirements govern routing.



Physical custody/location must stay separate from the decision to retain an

item for SGC use. A Warehouse item is physically held at the base without

becoming issued equipment or granting its hidden Knowledge. No new ownership

state, storage-class tag, automatic routing rule or blanket safety assumption

has been invented. Those admission/retention transitions still require the

next inventory implementation; the room now exposes configuration only.



Schema 14 pins the prior ten-room snapshot in

`unity/tools/fixtures/bootstrap-before-warehouse.json`, recursively preserving

the earlier migrations. Existing teams (all four ordered members), active

expeditions, Receiving progress/Actor, clock and selection survive; conflicting

custom room placement is rejected. Loading does not overwrite the save slot.



The Ready Room and mission briefing member summaries now size to their content

and scroll, so the fourth two-line member entry is reachable at short window

heights. Ad hoc deployment summaries use the same helper.


Validation: 204 EditMode, 11 PlayMode and 22 focused Node tests passed. Bootstrap freshness and diff checks passed. Four-member scrolling and Warehouse configuration were visually reviewed. The tick-40 Gate Yard live campaign was restored after isolated checks; the player save slot was not written.

## Follow-up: first physical recovery implemented

The earlier configuration-only checkpoint is historical. The Holding crate and
its unknown rifle now have a persistent recovery/custody ledger, optional debrief
recovery, Receiving inspection and compatible Containment transfer. See
[the cargo walkthrough](unity-cargo-recovery.md). Warehouse clearance, retention
and Equipment issuing remain unimplemented; unknown condition is not inferred
as safe or functional from completed inspection.

## Follow-up: occupied Warehouse and primary Containment reservations

The first recovered rifle can now complete a handling review, then move explicitly
from Containment to Warehouse. A temporary Receiving review reserves its original
CC place. Warehouse validates physical item quantities against 20 places; CC
continues to validate weighted inventory. Retention intent is separate from
custody and does not authorize equipment use. See
[handling review and Warehouse](unity-warehouse-clearance.md).
