# Receiving to Equipment Storage Handoff

## Status

Locked successful-path fixture: Human EM Impact Vest recovered offworld when the
SGC has the knowledge necessary to recognize, handle, store, and use it.

Analysis is not mandatory after Receiving. Receiving establishes the next valid
custody or process destination; it does not prove all underlying Theory or fully
characterize the object.

## Known equipment path

OFFWORLD -> INCOMING INVENTORY -> RECEIVING -> EQUIPMENT STORAGE

Receiving operates on the same physical instance and establishes:

1. Broad classification: wearable equipment.
2. Sufficient recognition: Human EM Impact Vest.
3. Observed configuration consistent with the known Item.
4. Basic condition and safety: intact, no intake-blocking problem.
5. Known handling requirements and appropriate Equipment Storage destination.
6. Receiving completion and the RECEIVING_TO_EQUIPMENT_STORAGE boundary.

## Boundary contract

The Item Base Model determines applicable exits and their requirements. The
Receiving-to-Equipment-Storage boundary requires:

- Physical intake complete.
- Identity sufficient for custody classification.
- Knowledge required by the current Receiving path satisfied.
- No unresolved intake hazard.
- No required Analysis or Workshop intervention.
- A valid Equipment Storage destination with compatible storage and capacity.

The result is Receiving complete and custody classification EQUIPMENT. Transfer
preserves the instance ID, Knowledge, physical state, and history; validate and
reserve destination capacity before releasing source custody. Failure must leave
the source instance and queues unchanged.

Do not require every Theory or Pattern bound to the Item to be known. Unknown
information unrelated to safe identification, handling, custody, or routing must
not block this boundary. Required knowledge comes from the selected Item Base
Model path, not a blanket scan of theoryBindings.

## Equipment Storage and assignment

Equipment Storage is a custody destination, not another investigative process.
After successful transfer, the equipment system evaluates assignment availability
using condition and its other rules. For this locked known, intact, usable vest
fixture, the expected next state is AVAILABLE FOR ASSIGNMENT. Receiving alone does
not grant unconditional assignment eligibility for arbitrary equipment.

## General Receiving exits

The model may expose Equipment Storage, General Storage, Analysis, Workshop,
Containment, or Receiving Hold. Not every Item exposes every exit. A hold is a
valid outcome while boundary requirements remain unresolved.

Theory/Pattern graphs and subgraphs plus Item bindings inform the Item Base Model.
Its Receiving stage resolves item-specific boundaries and selects the appropriate
custody/process path. The process matrix separately matches instance processing
requirements to room Processing Capabilities; current technical Services remain
a separate check. No room-name or item-ID special case should choose the path.

## Implementation status

The generic RECEIVING_COMPLETE transition no longer adds ANALYSIS_REQUIRED.
That requirement must be established by the applicable Item Base Model boundary,
not by completion alone. Existing instance requirements are not cleared by this
change: an object already requiring Analysis or Workshop still requires it.
The earlier Asgard path remains a conditional unresolved-object example.

The current simulator does not yet implement Item Base Model boundary resolution,
path-specific recognition/handling evidence checks, or equipment assignment.
Concrete vest knowledge requirements and condition/configuration evidence must
be authored before wiring this route. No new requirements are guessed here, and
no instance or item fixture records are modified by this contract update.
