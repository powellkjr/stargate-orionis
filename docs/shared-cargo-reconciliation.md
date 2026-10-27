# Shared cargo implementation checkpoint

The [verbatim supplied handoff](orionis-cargo-shared-schema-handoff-unity-migration-wave-0.md)
is the design input. Its locked rules are implemented below where executable
authoring exists; its proposed keys are not automatically canonical APIs.

## Implemented foundation

October 24 Processing Room batch: the original reference mission branch now
projects its door hack, mining power isolation and collection actions. A separate
`SIM_SUPPLY_CACHE` preserves the weapon crate's original role. Shared authoring
is `resource-cargo-playtest.json` with its strict schema; the economy catalog
remains the authority for bands, weights and rounding. The provisional graph has
twenty one-tick bubbles: two ordered inspections, then eighteen independent
recovery bubbles, yielding 123 S1 + 30 S2 with the authored stat1230 and Balanced.
Field inspection and extraction preserve one physical instance and work record.

`BubbleExecution` is a clock/stock-independent transaction kernel used inside
the existing campaign tick by resource recovery and Maintenance clearing. It
retains sticky Actors, completed work and calculated outcomes; capacity failures
commit nothing and retry unchanged. Credits use the existing Supply stock and
storage capacity, including clearing reservations. Save24 persists the shared
Recipe process shape and authoring fingerprint, and migrates prior mission saves
without granting the new Stage's work. Consumed cache records retain transaction
history for conservation checks and disappear from physical inventory lists.
The user explicitly accepted Balanced defaults instead of installed Cores.

This completes the bounded ordinary Supply-cache route, not every handoff
scenario: Material/Ration deposits, owned/queued allocation Cores, optional
critical/special-property authoring and the larger fixed physical Rock Formation
remain separate work. Eight-bubble clearing now pays progressively with save25
credits, while remaining a cell work order rather than the handoff's larger
fixed physical cargo instance.

- Shared authority: `demos/shared/data/resource-cargo-economy.json` and its schema.
  Four qualities use integer 100x conversion units; four sizes count actual
  Recipe bubbles. Supply, Material and Rations remain distinct families;
  Knowledge is an exact list of persistent objects, never currency.
- Pure JS queries: `demos/shared/js/resource-cargo.mjs`. Wild allocation uses
  authored policy and tier weights, floors each tier independently and never
  supplements low yields. Quantity-policy generation eligibility reports a
  failed minimum without modifying authored Reality. It is not a generator.
- Progressive shares require an explicit authored output-weight list, including
  zero-output inspection/preparation bubbles. Differences of cumulative shares
  conserve totals. No default payout distribution or critical chance is invented.
- Exact manifest queries copy packed quantities/Knowledge instance IDs without
  applying wild allocation or bonuses. These queries do not perform packing,
  unpacking, custody transfers or deposits.
- Unity's bootstrap projects the same catalog. `ResourceCargoEconomy` reads that
  projection and supports allocation, bands and progressive shares. Neither
  runtime owns an additional inventory balance or Recipe runner.
- Existing physical crate/rifle behavior remains separate. Removed an unfinished
  storage-routing conversion that used handling cost as yield and consumed an
  object. Assigning storage never generates resources.

## Schema extension mapping

| Existing authority | Optional extension | Meaning |
| --- | --- | --- |
| `instance.schema.json#/$defs/reality` | `resourceCargo` | WILD potential or exact MANIFESTED payload; independent of condition and item footprint. No payload is inferred from `isCargo` or an old container ID. |
| `instance.schema.json#/$defs/knowledge` | `resourceCargo` | Explicit evidenced quality/tier/rate fields. Reading Reality never populates them. |
| `instance.schema.json#/$defs/processes` | `maintenance` | Reuses the existing process record; does not introduce another runner. |
| `instance.schema.json#/$defs/process` | `bubbleWork` | Per-bubble Actor/progress records for independent work. |
| `instance.schema.json#/$defs/process` | `pendingResourceOutcome` | One fixed combined transaction outcome, including any explicitly authored bonus, awaiting a capacity-validated commit. Not a resource balance. |

These fields establish the shared storage format. The cache now uses generic
execution and `resourceOutcomes` history for exact-once commit and pending-output
save/retry; only uncommitted outcomes are pending, not an additional balance.
Existing item/instance fixtures still validate without any of these optional
fields. Item definitions reuse existing `storage.isCargo`, physical/container,
form-factor and process-compatibility fields; no parallel Item type was added.

## Reconciliation and unfinished acceptance scenarios

The current user-requested base clearing prototype has **eight** one-tick
UNTRAINED bubbles, permanent Maintenance staff, parallel work, saved Actor
history and ten S1 deposited progressively across its completed bubbles. Save25
persists credits and migrates old completed orders as already paid. It is Medium
under the new size ranges.
Do not silently replace saved clearing work with the handoff's inspected,
specialized Large/Huge rock scenario, or call eight bubbles Huge. The prototype
currently tracks a cell work order rather than a shared fixed physical Instance;
that remains an integration gap.

The source supplies formulas, but not a complete executable cache/rock Recipe
graph, property-output catalog, critical parameters, fixed-instance placement
contract or owned Receiving Core installation/reconfiguration path. The two
handoff scenarios therefore remain open. Current Supply is still the existing
construction ledger; Material/Ration deposits require their authoritative stock
integration rather than another cargo-only ledger.

Next implementation: provide the remaining authored critical/special outcomes
and larger fixed-obstruction graph, then implement their transaction effects.
Owned/queued Core changes need universal room configuration, beyond the user's
accepted Balanced fallback. Fixed obstruction removal must be a final valid
physical/world transaction. Ordinary cache work must not invent those rules.


October 25 cache balance update: the user changed the reference cache from Large
to Medium. Its current graph has two inspections and eight recovery bubbles,
producing 61 S1 + 15 S2 at Balanced. Original 20-bubble economic examples are
unchanged; started historical saves keep their old graph and outputs. See
[Receiving first-pass authoring](unity-receiving-cores-first-pass.md).
