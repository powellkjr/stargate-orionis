# Simulator decisions — October 4, 2026

These explicit user decisions supersede conflicting historical proposals for
the simulator topics below. Recording a decision does not mean it is implemented.
Keep physical state, Knowledge, execution capability and custody separate.

## Evacuation, extraction and admission

- A secure route has no active or potential obstacles. An enemy remaining in
  the outer yard blocks evacuation through it. Secured, surrendered, withdrawn
  or otherwise resolved enemies need not block evacuation.
- Party withdrawal is separate: the party may pass back through an unsecured
  yard and extract, but cannot evacuate the operative or loot through that yard.
  This does not remove ordinary movement/connection requirements.
- Before the evacuation screen, selection only marks a subject for extraction;
  it does not commit a transfer or change custody.
- Validate storage/admission contracts only for selected subjects when the
  extraction plan is committed. Reject invalid plans before custody changes.
- The demo Reset button must clear Holding and Receiving capacity usage. Its
  current release of only the current run's reservations is not sufficient.
  Implementation must identify occupancy versus reservations and preserve room
  configuration and unrelated capacity; this is a sandbox reset, not a general
  production rule for deleting prisoners/items.
- Application of the unsecured-route rule to already-collected portable party
  inventory still needs clarification against automatic-return behavior.

## Bypasses and restoration

- A bypass persists during the offworld visit unless deliberately restored.
  Party Gate departure is expected to restore the map for a later visit; exact
  persistence boundaries must be reconciled before implementing a global reset.
- Restoration can provide security/social value, spends a Tool charge, and does
  not refund earlier charges. It may remove the access gained by the bypass.
- Example: hacking a panel establishes tampered state and access; repair removes
  tampering but can remove access. Alerts and later combat consequences must be
  authored, not inferred from prose or applied to every panel automatically.
- Represent these as forward Recipe transitions, not reversing completed work.

## Stats and movement resources

- Stamina is a resource, not a radar stat. Present it as a white resource bar
  below HP; replace its radar axis with expertise.
- Exploration of a new tile costs 3 Stamina; movement through an explored tile
  costs 1. Return estimate is distance to the Gate at cost 1 per travel tile.
- Reconcile tile distance with current multi-cell Stage movement before charging
  per tile; do not silently treat a Stage as one tile.
- Expertise counts progression ranks, including each entered path's untrained
  rank 0. An absent path contributes nothing; rank 0 is not an absent path.

  | Expertise | Progression milestone |
  | --- | --- |
  | 0 | No Profession: civilian or unspecialized recruit |
  | 1 | Base Profession untrained rank 0 |
  | 2–4 | Base Profession ranks I, II, III |
  | 5 | After base III, enter a cross-path or specialization at untrained rank 0 |
  | 6–8 | Branch ranks I, II, III after base III |

- Calculate expertise as base rank + 1 when a base Profession path exists, plus
  branch rank + 1 when a cross-path or specialization exists. Thus Tech II = 3;
  Tech III + Scout II = 7; Tech III + Overdrive II = 7. Radar maximum is 8.
- This settles expertise presentation, not execution qualification: untrained
  rank 0 must not satisfy a rank-I Profession requirement. Current simulator
  loadout validation supports tiers I–III; representing absent/rank-0 paths
  requires explicit schema support rather than reinterpreting those records.

## Communications and strategic map — deferred implementation

- Knowing an address permits dialing subject to physical connection rules;
  unfamiliarity is not political permission to dial. The destination might not
  open its Iris.
- Familiarity may provide known communication channels/frequencies, potentially
  an array including general, trade, defense and local. These examples are not
  yet a validated enum or invented frequency data.
- Defer world-map simulator changes for now.

## Unusual creatures and receiving contracts

- Unusual creatures still require receiving/storage contracts. Do not admit a
  large creature whose requirements exceed SGC capability.
- A collect-sample or observation process is a one-hour work bubble to establish
  enough information for SGC containment assessment through the Gate.
- If containment is feasible, extraction offers Send to containment. Otherwise
  offer non-destructive or destructive harvest paths.
- Actor, Tool, Room Service, sampling outputs, destruction/salvage outputs and
  contract data still require authored definitions. Do not grant Knowledge of
  hidden Reality or invent new Recipes to implement these choices.

## Cultural Platform

- Clone the Tech Platform definition as the starting point; default footprint
  is 2×2. Review copied identifiers and capabilities against room/Core authority
  before implementation. This does not authorize hidden cultural stat bonuses.

## Deferred

Dialogue/repeat/recognition design and world-map changes are deferred. Biological
history and campaign ending questions remain on their existing review lists.