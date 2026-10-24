# First Unity physical recovery loop

October 18, 2026. This is a bounded port of one existing Missing Operative
recovery target, not a general inventory/economy implementation.

## Playtest

1. Deploy a team that includes a Diplomat I, a Technician and a Medic.
2. Follow the supported route to Holding. Defeat its guards, then choose
   **Ask medical worker about equipment**. Select the Diplomat and complete
   the one-tick work. The existing authored persuasion reveals the crate;
   neutral guards receive the original +30 suspicion and may escalate.
3. Complete the rescue route and return to the Gate. Redial and extract.
4. In the debrief, choose **Recover Sealed equipment crate 01**. Discovery,
   extraction and a known secure return route are required. Recovery is optional
   and does not cost another tick, matching the existing debrief abstraction.
5. Go to Base > **Recovered cargo**. Choose the unknown object that is the rifle
   and **Admit to Receiving r2**. The crate shell is retained as another physical
   instance; it is not silently consumed or fabricated into resources.
6. In Base assign a Technician with equipped TET1 and Scientist with SCT1 to
   Receiving. Advance four ticks: two handling/condition, then two classification.
   Return to Recovered cargo and select the rifle to inspect progress/findings.
7. After inspection choose **Move to Containment r10**. Save and Load. The same
   rifle, completed Receiving work and Containment location must remain.

## Preserved boundaries

The source crate is `equipment-crate-01`, with child
`missing-operative-rifle-01`. Their original physical snapshots preserve exact
state, quantity, percent-of-whole, hidden Reality/bindings, Knowledge, history
and source custody. A persistent `RecoveredItem` records current location and
recovery provenance separately. The snapshot is original evidence, not current
custody: `RoomId` is authoritative after arrival; null means incoming inventory.
Receiving work stays attached to its original workroom and preserves sticky
Actors even after the object moves. Completed work derives current permitted
findings/condition, without exposing raw snapshots to the UI.

User-confirmed rule, October 18: **Require Containment while condition is unknown,
until safety is established.** Receiving completion alone does not establish safety.
This confirms the current pilot behavior; Warehouse and Equipment Storage stay blocked.

The rifle's authored condition remains UNKNOWN after Receiving: its Reality
does not assert FUNCTIONAL or DAMAGED. Do not turn successful inspection into a
functional/safe declaration. This pilot offers compatible Containment, leaving
ordinary Warehouse safety clearance and equipment retention/issuing unsupported.
There is no automatic equipment grant, alien Pattern or Theory Knowledge grant.
The crate shell lacks CC compatibility and remains incoming/Receiving pending
its handling/content-authoring follow-up. No generic hazardous-item execution
capability or container-opening duration has been invented.

Recovery preserves both package and contents as distinct instances in incoming
inventory, retaining their source-container relation. The original JS debrief
already carries both the physical package and cargo payload. This prototype
exposes them as separate admission requests; it does not implement a reusable
container-opening work Recipe, nesting UI or disposal process.

Containment capacity uses the authored CC tab's weighted inventory limit
(20 at CT1), not the separate 2/4/8 storage-rule progression. Receiving checks
weighted capacity before admission. Transfers publish one validated replacement;
full/wrong destinations, incomplete work and duplicate recovery leave state
unchanged. Stored objects no longer occupy Receiving; work history remains.
Recovery, transfer and inspection menus consume no ticks. Actual inspection and
persuasion work use the shared campaign tick transaction.

## Implementation and persistence

- `Domain/RecoveredCargo.cs`: physical recovery/provenance, separate current
  custody, catalog view and capacity-checked transfer.
- `Infrastructure/CargoReader.cs` and `unity/tools/bootstrap-snapshot.mjs`:
  source-validated persuasion/crate/content projection, separate from mission
  display and the original Receiving fingerprint.
- `Presentation/CargoPanel.cs`: item selection, permitted findings, explicit
  admission and Containment routing. Existing mission panels expose discovery
  and the optional debrief recovery.
- Schema 15 stores the cargo ledger plus a separate `cargoFingerprint`.
  Earlier saves retain their campaign/mission without gaining discoveries or
  cargo. Reset mission preserves recovered physical objects. Replaying cannot
  duplicate the fixed source IDs; multiple mission-instance namespaces remain
  future work. Original source snapshots cannot be edited through unimplemented
  transitions in saves.

Remaining: an authored ordinary-storage safety/clearance decision, retention and
Equipment issuing, container processing, other recovery targets/mission routes,
Analysis/Workshop item work, wider storage-tab occupancy/reservations and a
multi-mission history. Storage-room presence alone does not implement these.

Validation: 215 EditMode, 11 PlayMode and 23 focused Node tests passed. After the final crate-label/percentage adjustment, all 11 cargo EditMode checks and the full rescue/cargo UI walkthrough passed again. Clean compilation, snapshot freshness, syntax and diff checks passed. The cargo panel was visually reviewed. The original tick-40 Gate Yard campaign (no cargo) was restored without writing the player save slot.

## Follow-up: handling review and Warehouse now available

The configuration-only handling limits above are historical. The user authored
the rifle as intact and safe for ordinary shelf storage, with its technology
still unfamiliar. A separate two-tick Receiving handling review reveals those
facts while retaining a primary Containment reservation. Explicit Warehouse
transfer and independent retention intent now persist under schema 16. Equipment
use remains uncleared. See [the next playtest](unity-warehouse-clearance.md).
