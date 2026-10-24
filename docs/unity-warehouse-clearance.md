# Handling review, Warehouse and retention

Historical workflow: superseded by the October 19 user revision in
[cargo routing and Containment examination](unity-cargo-routing.md). Do not
repeat Receiving work or use this guide's Warehouse prohibition for new play.

The user chose the recovered rifle's actual condition for this playtest:
**intact and safe for ordinary storage, with unfamiliar technology**. Unknown
condition still requires Containment until those facts are established.

## Playtest from the recovered rifle

1. Complete Receiving and move the rifle to Containment, as in the cargo loop.
2. In Base > Recovered cargo, select the rifle and start **Handling review in
   Receiving**. It takes two ticks of local Technician I work with equipped TET1.
   The original Containment place stays reserved during temporary process custody.
3. Leave the qualified Technician assigned to Receiving and advance two ticks.
   The same item returns to Containment; its known condition becomes INTACT and
   the observation establishes ordinary shelf-storage safety.
4. Choose **Move to Warehouse**. This validates its 20 item places before releasing
   Containment. Save/Load preserves the same ID, review evidence and location.
5. **Keep for SGC** is optional and separate. It records retention intent without
   moving the object, identifying its technology, issuing it or clearing equipment
   use. It can also be marked undecided again.

A paused review retains progress, the original Actor and the Containment
reservation. A replacement worker cannot inherit partial personal work. A
finish-step staff transfer waits for this review to finish. Receiving intake and
handling review share the per-Actor tick budget; one worker cannot perform both
in the same tick. No global idle-roster search or remote Room Service borrowing
is added. Equipment Storage remains blocked without its separate use boundary.

## Truth, findings and scope

`demos/shared/data/cargo-handling-prototype.json` authors the instance's condition
and ordinary-storage safety before execution. The original recovered physical
snapshot remains unchanged as historical evidence; this supplemental authored
truth is distinct from the initial UNKNOWN observation and from current player
Knowledge. The review reveals those existing facts rather than fabricating a
functional/safe outcome. INTACT does not assert FUNCTIONAL, discharge its power,
identify its origin or establish Theory/Pattern Knowledge.

The Technician/TET1/two-tick recipe is provisional routine Receiving review
using the already authorized playtest tuning. It is one Actor, at most one Tool
Service and no additional technical Room Service. It is not a deep Analysis
Recipe, repair, hazard treatment, equipment certification or proof that ordinary
Receiving can handle every dangerous object. The supported source is the intact,
safe rifle selected by the user; the crate shell still lacks authored handling
findings. No universal clearance rule is invented for unrelated objects.

During review, current process custody is Receiving while primary Containment
remains reserved, following the existing process-transfer primary-storage model.
Unknown-condition objects cannot enter Warehouse. Full Receiving/Containment
capacity, an invalid room or incomplete clearance rejects the entire operation
without releasing the source. Review completion restores the reserved place;
only an explicit subsequent Warehouse transfer releases it. Warehouse counts
physical item quantities against its provisional 20 item places; CC retains its
authored weighted inventory limit.

## Files and persistence

- `Domain/CargoHandling.cs`: data-driven review, sticky worker resolution,
  condition/safety findings, primary reservations and shared-tick work.
- `Domain/RecoveredCargo.cs`: independent retention intent, ordinary-storage
  boundary and occupied/reserved capacity validation.
- `Infrastructure/HandlingReader.cs`, bootstrap exporter and generated snapshot:
  authored finding/recipe import, separate from original recovery payloads.
- `Presentation/CargoPanel.cs`: review progress, pause/resume, Warehouse transfer
  and retention choices. Application commands publish validated replacements.
- Schema 16 stores review work and retention alongside each physical item, plus
  a separate handling-definition fingerprint. Schema-15 cargo gains neither a
  completed review nor retention. Original payload, hidden Reality and discovery
  work remain intact; Reset/replay keep the new records.

The existing Unity-only all-tier-III roster override is preserved for fresh
playtests. `previousProgressionSnapshot` retains the complete original progression
scope before that override. The save codec validates older campaigns through
that exact scope and keeps their existing qualifications, mission state and
Tools when loading or resaving; it does not silently upgrade them. Historical
base migrations run against their original progression as well. This was needed
to restore the actual backed-up campaign, whose original roster differs from
the fresh tier-III playtest roster.

Remaining: equipment-use recognition/certification and issuing; broad Analysis
and Workshop item work; crate processing; hazard-treatment paths; and repeated
mission namespaces/history.

Validation completed October 19: 228 EditMode, 11 PlayMode and 30 focused Node
tests passed. Compilation, snapshot freshness, exporter syntax and diff checks
passed. Visual review covered active primary Containment reservation and completed
Warehouse storage with independent retention. Both original and fresh playtest
rosters validate. The latest saved tick-0 session was restored after isolated
review; the player save file is unchanged (SHA-256 verified). The older tick-30
campaign backup remains available in the Unity project Logs directory.
