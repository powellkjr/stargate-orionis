# Codex Handoff — Unity Receiving Cores
## Approved Rules, Existing Architecture, Proposals, and Open Decisions

**Repository:** `powellkjr/stargate-orionis`  
**Working branch:** `unity-migration-wave-0`  
**Objective:** Unblock Unity's first persistent Receiving Core installation and configuration workflow.

**Authority rule:** Sections 1 and 2 describe approved design decisions and existing repository architecture. Section 3 contains implementation proposals, not authorization to create canonical gameplay rules. Section 4 lists unresolved decisions.

Do not silently promote a proposal into an approved rule.

---

# 1. Approved design decisions

These decisions were explicitly confirmed during the design discussion.

## 1.1 Embedded T0 Cores

Every room has permanent embedded T0 Core functionality.

- T0 equipment is built into the room.
- It cannot be uninstalled.
- It is not an independent Warehouse inventory item.
- It does not consume removable Core slots.
- Its power is included in the room's base power cost, together with basic environmental requirements.
- Removing all removable Cores must not leave the room without its fundamental function.

### Receiving T0

Approved Receiving baseline:

- Provides `CARGO_PROCESSING`.
- Supports basic Small cargo processing.
- Provides basic recovery.

The exact numerical definition of **basic recovery** has not been approved.

Receiving's cargo-processing scope covers Supply, Material, Rations, and Knowledge, subject to their applicable processing requirements.

## 1.2 Receiving's initial equipment

The initial Receiving room has two removable installed Cores:

**Medium Processing Equipment**
- Provides Small and Medium cargo handling.
- Occupies a physical Core slot.

**Balanced Recovery Equipment**
- Provides general Balanced recovery.
- Applies across eligible cargo classes.
- Occupies a physical Core slot.

These are real installed physical Core instances, not permanent room settings.

The intended visible equipment includes handling workstations for Medium processing and ordinary inspection stations and scales for Balanced recovery.

## 1.3 Cumulative size-processing equipment

| Equipment | Supported cargo sizes | Minimum CT |
|---|---|---|
| Medium Processing Equipment | Small, Medium | CT1 |
| Large Processing Equipment | Small, Medium, Large | CT2 |
| Huge Processing Equipment | Small, Medium, Large, Huge | CT3 |

Higher-level processing equipment includes the handling capabilities of lower levels.

Large equipment can visually include conveyors and hand trucks.

CT requirements represent the structural, power-connection, stability, and other installation constraints associated with the destination room.

## 1.4 Recovery equipment

There are three separate general recovery equipment types:

- Quantity Recovery Equipment
- Balanced Recovery Equipment
- Quality Recovery Equipment

These are separate physical Cores, not settings on a single configurable Core.

General CT1 recovery equipment applies across eligible cargo classes.

CT2 and CT3 recovery equipment can specialize by cargo class, such as Supply Quality Recovery.

### Recovery distribution

The agreed notation is:

`higher-tier fixed / lower-tier fixed / flexible`

The percentages total 100%.

The flexible portion follows the applicable Quantity, Balanced, or Quality preference.

The existing example for CT1 Balanced is `25/25/50`.

Examples of CT2/CT3 distributions were illustrative. Exact numerical distributions were **not approved**.

Rations and Knowledge retain their established resource semantics; do not invent multi-tier conversions for them.

## 1.5 Cargo processing hierarchy

Each cargo item can have an authored hierarchy of processing capabilities.

- More specific applicable capabilities are preferred over general ones.
- The resolver should follow the cargo's hierarchy.
- It must not infer priority merely from slot position or Core name.
- A specialized Supply recovery capability can take precedence over general recovery for Supply while general recovery remains applicable to other cargo classes.

## 1.6 Core compatibility and emergent Services

The existing tag system is used for:

- Core-to-Core Group compatibility.
- Matching required processing capabilities.
- Exposing compound or emergent Services.

Example:

**Encryption Core + Faction Channel Core → Faction Encrypted Channel Service**

The compound Service exists when its authored requirements are satisfied by compatible installed Cores.

This is not permission to invent those canonical Core or Service identifiers without checking authored data.

## 1.7 Redundancy and stacking

- Multiple Cores may provide the same capability.
- Duplicating a non-stacking recovery capability does not multiply its recovery effect.
- Redundant installation is allowed, even when it provides no immediate numerical advantage.
- The player may want redundancy in case a Core is lost or otherwise unavailable.
- A warning may identify an installation that adds no immediate benefit.
- Additive benefits stack when authored as additive.

Example: two Cores providing `+20 INV` each can provide `+40 INV`.

Do not treat every duplicate Core as an invalid installation.

## 1.8 Degradation

Ordinary Core degradation must not create an invalid game state.

- Guaranteed capacity contributions cannot diminish solely because of ordinary degradation.
- Secondary benefits may weaken as the Core's condition deteriorates.
- Quality recovery performance can decline toward Balanced.
- Gradual linear degradation was accepted as the intended approach for numerical recovery performance.
- Service existence remains separate from the strength of numerical bonuses.

Removing, stealing, destroying, or otherwise losing the configured provider is different from ordinary degradation.

## 1.9 Generator power v1

Approved provisional rules:

- Each Generator room provides **100 PWR**.
- Multiple Generator rooms contribute additive power.
- Generator disruptions are not simulated yet.
- Load shedding and power-priority behavior are not required yet.
- Every removable Core has an Idle PWR cost and Active PWR cost.
- Active PWR is the total active cost, not Idle plus Active.
- Installation must validate available generator capacity.
- The maximum Active PWR requirement is reserved for installed Cores.
- A room's base PWR already accounts for its embedded T0 equipment and basic environment.

### When a Core becomes active

**Active power follows actual Service provision, not generic room activity.**

Example:

A Supply Quality Recovery Core:

1. Consumes Idle PWR while its Service is not being used.
2. Consumes Active PWR while it is providing the selected Supply recovery Service to Supply cargo in Receiving.
3. Returns to Idle PWR after that Service is no longer in use.

Other installed, unselected recovery Cores remain idle.

## 1.10 Ownership and Warehouse custody

Uninstalled removable Cores belong in **Warehouse**, not Material Storage.

- Uninstalled Cores consume Warehouse capacity.
- Installed Cores belong to the assigned physical room's Core Group.
- Installed Cores occupy Core slots, not Warehouse capacity.
- Installed Cores do not reserve Warehouse shelf space.
- Installation preserves the same Core instance and condition.
- Uninstallation returns that instance to Warehouse.
- Uninstallation requires available Warehouse capacity.

### No direct swaps

A Core cannot be exchanged directly for another Core.

The required sequence is:

1. Uninstall existing Core.
2. Complete transfer into Warehouse.
3. Separately install replacement Core from Warehouse.

## 1.11 Reversible installation Recipes

Core construction and Core installation are different Recipes.

**Installation and uninstallation use the same installation Recipe in opposite directions.**

- Installation transfers an owned Core from Warehouse into its destination Core Group.
- Uninstallation returns the installed Core to Warehouse.
- Installation Recipes can specify requirements for Actors, Tools, Room Services, CT, time, and environmental conditions.
- Requirements are authored for the actual Core and destination context.
- Some installations may involve Soldiers for security and Technicians for wiring.
- An Infirmary installation may involve more Medic work.
- These profession examples do not define a mandatory universal bubble template.

## 1.12 Reconfiguration timing

- A room cannot change its Core configuration during active work.
- Reconfiguration waits until its current active item is complete.
- Queued work does not prevent a scheduled reconfiguration.
- New work waits for reconfiguration to finish.
- Installation and removal are separate operations.
- Existing bubble execution and interruption behavior applies.

---

# 2. Existing repository architecture to reuse

The following are existing architectural requirements or definitions, not newly proposed mechanics.

## 2.1 Universal Recipe execution

`docs/theory/architecture/recipe-bubble-contract.md` establishes:

- Installation/removal uses universal Recipes.
- Recipe bubbles resolve qualified Actors and required Services.
- Actor identity becomes sticky once work begins.
- Room Service and Tool Service providers can be substituted when an eligible alternative exists.
- Recipe admission and runtime availability are separate.
- Room Services remain binary configuration facts.
- Ordinary damage can degrade numerical modifiers without degrading Service existence.
- Core Groups remain physically distinct even when rooms join.
- Emergent Services must follow authored combination rules.
- Active Research contracts cannot be invalidated through Core removal.

Preserve these rules.

## 2.2 Receiving Core slots

The shared room definition establishes physical Receiving Core slots:

| CT | Slots per physical room |
|---|---:|
| CT1 | 2 |
| CT2 | 4 |
| CT3 | 6 |

Joining rooms does not merge their physical Core sets.

## 2.3 Generator implementation status

The existing Generator room definition previously left output and power behavior undefined.

The approved provisional `100 PWR` rule fills that particular design gap.

It does not authorize inventing generator fuel, interruptions, damage behavior, or load shedding.

## 2.4 Shared authority

Canonical definitions belong in shared authored data.

Unity should import and execute the shared definitions rather than establishing competing rules.

Inspect:

- `AGENTS.md`
- `REPO_MAP.md`
- `CURRENT_TASK.md`
- `docs/unity-migration-plan.md`
- `docs/theory/architecture/recipe-bubble-contract.md`
- `docs/theory/architecture/plans-and-requirements.md`
- `demos/shared/data/rooms_schema.json`
- `demos/shared/data/room.schema.json`
- `demos/shared/data/theory/stargate_theory_simulator_import.json`
- Existing Core, custody, inventory, Recipe, generator, and Unity persistence implementations.

The repository may already contain portions of these systems. Reuse them instead of rebuilding them.

---

# 3. Implementation proposals — not yet approved as canonical rules

These are suggested methods of unblocking Unity.

Codex may investigate and report on them, but should not silently author missing mechanics or values.

## Proposal A — Two-step implementation batch

**Step 1: Shared configuration and data validation**

- Identify existing Core schemas and runtime representations.
- Locate the current Receiving T0 capabilities.
- Identify existing definitions for starter Medium and Balanced Cores.
- Identify the installation Recipe representation.
- Identify how compatible tags and emergent Services are resolved.
- Identify the existing generator and power-capacity interfaces.
- Report missing data rather than filling it with invented values.

**Step 2: Unity integration**

- Use the shared definitions to populate actual installed Core instances.
- Enable Warehouse-to-Core Group custody transitions.
- Reuse the universal Recipe executor for reversible installation.
- Validate Core slots, compatibility, CT, Warehouse capacity, and power.
- Resolve Room Services after changes.
- Preserve the resulting state through save/load.

These are proposed implementation steps, not claims that all necessary shared data already exists.

## Proposal B — Narrow first demonstration

Use the starter Receiving room and its initial Medium Processing and Balanced Recovery equipment.

Demonstrate:

1. Medium cargo is eligible while Medium Processing Equipment is installed.
2. Uninstalling that equipment removes the Medium handling capability.
3. Small cargo remains processable through T0.
4. The same Core can return to Warehouse and later be reinstalled.
5. Save/load preserves this result.

This should be the first functional acceptance path.

## Proposal C — UI scope

Reuse existing Unity room and inventory views to expose:

- Installed Core identities.
- Free Core slots.
- Install/uninstall actions.
- Relevant validation blockers.
- Derived Room Services.

Avoid creating a new Core-management application if existing UI structures are sufficient.

## Proposal D — Focused tests

Prefer focused tests of:

- T0 fallback.
- Installed Core identity.
- Cargo capability changes.
- Warehouse capacity validation.
- CT and tag compatibility.
- Power-capacity validation.
- Reversible Recipe execution.
- Save/load persistence.
- No duplicate Cores or free Services.

Use the repository's existing testing conventions.

---

# 4. Missing authored data and unresolved decisions

These are **not approved facts**. Codex must inspect the repository before deciding whether they are genuinely missing.

| Area | Missing decision or verification |
|---|---|
| Receiving T0 | Exact numerical definition of basic recovery |
| Starter Cores | Canonical IDs and complete shared Core definitions |
| Power | Per-Core Idle and Active PWR values |
| Room base power | Exact Receiving and other room base PWR costs |
| Installation Recipes | Exact authored bubbles, durations, inputs, Actors and Tools |
| Reversibility | How existing transaction semantics handle irreversible consumables |
| Core custody | Existing Warehouse item/capacity representation |
| Compatibility | Exact tag vocabulary and valid installation requirements |
| Service resolution | Exact IDs and hierarchy for size handling and recovery |
| Degradation | Existing Core-condition representation and numerical interpolation support |
| Persistence | Existing representation of Core instances and installed assignments |
| Legacy saves | Migration strategy for saves created before physical starter Core instances exist |

Do not invent values or identifiers simply to make tests pass.

If an approved rule cannot be implemented without additional authored data, identify the smallest missing decision and report it.

---

# 5. Explicitly deferred

Do not expand this work into:

- Core manufacturing or acquisition progression.
- Alien Core reproduction.
- Complete CT2/CT3 specialized recovery equipment catalogs.
- Final higher-tier recovery percentages.
- Generator fuel.
- Generator disruptions and load shedding.
- Power-priority policies.
- Comprehensive Core damage and repair.
- Broad maintenance-system redesign.
- Separate Core installation mini-games.
- Unrelated room or mission systems.

---

# 6. Codex execution instructions

**First:** Audit the current implementation against Sections 1 and 2.

Produce a short checklist identifying:

- Already implemented and compatible.
- Implemented but conflicting with approved rules.
- Missing implementation with sufficient approved data.
- Blocked by missing authored data or decisions.

**Then:** Implement the smallest unblocked end-to-end Receiving Core path, using the existing architecture and shared schemas.

Follow `AGENTS.md` and the repository's focused testing conventions.

Update the existing `CURRENT_TASK.md` as work proceeds without replacing concurrent visual/art work.

Do not perform broad Git staging, resetting, or unrelated refactors.

## Completion report

Report:

1. Existing systems reused.
2. Approved rules implemented.
3. Files changed.
4. Tests run and failures.
5. Remaining design or data blockers.
6. Any proposals that still require user approval.

**Success means Unity can install and uninstall a real Receiving Core through existing gameplay systems, preserve physical identity and custody, and correctly resolve actual cargo capabilities after save/load.**

Do not mistake a UI-only toggle or simulated Core slot for a completed implementation.