# Cargo storage and Analysis

Containment is storage only. Remaining instance properties are processed in a
staffed Analysis lab, not in Containment. This supersedes the earlier examination
prototype and repeat Receiving handling review.

1. Recover cargo after extraction, then admit each physical instance to Receiving.
   Local qualified staff with equipped profession Tools perform the existing
   handling/classification work. Incoming inventory stays its logical fallback.
2. Route completed intake to Warehouse or Containment. This assigns validated
   storage and moves custody there. Warehouse storage can be reassigned only to
   Containment; sending temporary custody to Analysis does not reassign storage.
3. Select a stored item and choose **Send custody to Analysis r4**. Its assigned
   storage remains reserved. Analysis has one authored process item place; an
   occupied destination rejects admission without changing either item.
4. Assign a Scientist with equipped SCT1 to the Analysis lab. The provisional
   examination takes two ticks, with sticky Actor/progress and pause/reload support.
   It reveals authored instance evidence, never institutional Theory or Patterns.
5. When complete, choose **Return custody to assigned storage**, or explicitly
   route to a valid new storage destination. Returning uses the reserved place.
   Equipment Storage requires all properties revealed, established identity,
   intact condition, equipment compatibility and explicit SGC acceptance.
6. Open Equipment Storage to issue a weapon/armor instance to a Unit. Assigned
   storage remains reserved while custody belongs to the Unit, including offworld.

Cargo details show validated storage and current custody separately. Fully known
items display the authored name. The crate still has its authored UNKNOWN
condition and no invented equipment compatibility or extra properties.

Each successful storage reassignment costs one campaign tick; validation occurs
before spending it. This includes incoming inventory to Warehouse/Containment.
Temporary custody transfers cost zero ticks: Receiving admission, Analysis
admission, return to assigned storage and personal equipment issue/return.
Analysis work still takes two ticks independently of moving custody. A Unit
returns equipment to its existing assigned storage; reassign storage afterward
through the one-tick transfer action.

Schema 19 saves both relationships. Legacy completed Containment findings remain
historical evidence; unfinished examinations in storage are removed and must be
started in Analysis. Staff/team assignments and physical identities are preserved.
Legacy handling reviews retain their reserved Containment place during Receiving
custody. No new handling-review button is offered.

**Reset object** rewinds only the selected cargo processing state to incoming
inventory, preserving original Reality, identity, other cargo, staff, SG teams and
campaign time. Save preserves that staffed replay setup. It is a prototype debug
action, not a production item transformation.

The Scientist I/SCT1/two-tick/no-charges tuning remains provisional. Automatic
failure recovery and broader Analysis/Workshop recipes remain future migrations;
this batch provides a valid reserved fallback and explicit custody return.
