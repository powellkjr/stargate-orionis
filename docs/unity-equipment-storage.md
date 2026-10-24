# Equipment Storage browser

Click the Equipment Storage footprint in the base to open its inventory.
Weapon/armor tabs and capacities come from authored storage definitions. The
list shows physical recovered instances actually stored in that room; selecting
one shows its known name, condition, quantity and revealed properties. Custody
transfers back to Warehouse/Containment validate capacity before releasing it.
Back to base closes the inventory without changing playback speed or pause.

The user authorized separate **weapon** and **armor** slots on each Unit, with
provisional combat values. Select stored equipment, choose **Issue to a Unit**,
then pick an eligible Unit. SG-team members appear first. Occupied slots,
offworld or incapacitated recipients and unidentified equipment are rejected.
Profession Tool slots and Services remain separate.

**Assigned storage stays Equipment Storage while custody becomes the Unit.**
The physical instance ID and allocated storage place remain unchanged. Choose
**Show equipped items** to see personal custody, then **Return custody to
Equipment Storage** when the Unit is home. Returning to the assigned room uses
the existing reserved allocation; no duplicate physical object is created.

Provisional data in `unit-equipment-prototype.json`: ordinary weapon damage 24,
recovered Asgard rifle damage 30 per visual round; armor absorbs 2 damage per hit
with at least 1 getting through. Units without issued gear retain existing
combat baseline values. No physical armor is added to the current mission;
the generic armor path is exercised by an isolated test fixture.

Deployment snapshots item IDs, names, slots and stats. These survive work,
combat and reload; changing equipment after returning cannot rewrite the
archived battle. Ready Room, personnel details and briefing show both slots.
Schema 19 persists personal custody and deployment snapshots with an equipment
definition fingerprint. Older saves gain no issued gear or changed combat.
Room custody is also separate from reserved storage: staffed Analysis can hold
an object without releasing its fallback place. Containment is storage only.

Implementation: `Presentation/EquipmentStoragePanel.cs`, the storage callback
in `RoomMapView.cs` and view navigation in `PrototypeBootstrap.cs`. Existing
`StorageRoomSceneTests` now covers the inventory tabs and staffed Containment
inspector. No new physical equipment, knowledge, schema or save writes are
introduced by browsing. Issuing changes custody and its slot state explicitly.
