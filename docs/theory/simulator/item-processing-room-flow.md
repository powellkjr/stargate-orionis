## Item Processing / Room Flow

For now, ignore bubble Actor/Tool/Room Service execution requirements. This pass is only about Item state, tag manipulation, room admission/exit, capacity, custody, and destructive Reverse Engineering.

### Vocabulary

**Reality Tags**

* Authored on the Item Definition.
* Applied when the Item Instance is initialized.
* Describe what is actually true about the object.
* They do not change because the SGC learns something.
* Reality is independent of player knowledge.

**Known Tags**

* Describe what the SGC currently recognizes/interprets about this specific Item Instance.
* Derived from available evidence plus current Theory/Pattern knowledge.
* Must be re-evaluated whenever relevant SGC knowledge changes.
* Learning a Theory later can therefore cause an existing analyzed Item Instance to gain additional Known Tags without repeating Receiving.

**Processing Tags**

* Describe the Item Instance's current processing contracts and progression.
* Examples: `RECEIVING_REQUIRED`, `RECEIVING_AUTHORIZED`, `RECEIVING_COMPLETE`, `IDENTITY_UNKNOWN`, `ANALYSIS_REQUIRED`, `REVERSE_ENGINEERING_AVAILABLE`.
* These replace the earlier "Lifecycle Tags" terminology.

**Physical State**
Use structured properties rather than tags:

```text
condition:
  UNKNOWN
  INTACT
  DAMAGED
  DESTROYED

functionalState:
  FUNCTIONAL
  DEGRADED
  NONFUNCTIONAL
  UNKNOWN

quantity:
  integer >= 1
```

`UNKNOWN` should be added to `condition` if Receiving is responsible for establishing condition.

**Custody**

* Tracks where the physical Item Instance actually is.
* Do not duplicate location as Processing Tags such as `IN_ANALYSIS` if custody already owns that information.

**Room Services**

* Rooms are Service-based, not room-name-based.
* Installed/configured Cores provide Services.

**Room Processing Capabilities**

* Derived from the room's currently available Services.
* Define which Item processing contracts that configured room can accept/perform.
* Examples: `CAN_ACCEPT_RECEIVING`, `CAN_ACCEPT_ANALYSIS`, `CAN_ACCEPT_WORKSHOP`, `CAN_REVERSE_ENGINEER`.
* Item Processing Tags match against Room Processing Capabilities.

---

# Asgard Rifle Paper Test

## 1. Initialize recovered rifle

Reality Tags are initialized from the authored Item Definition:

```text
Reality Tags
  PHYSICAL_OBJECT
  EQUIPMENT
  WEAPON
  RIFLE
  ASGARD_ORIGIN
  ELECTROMAGNETIC_ACCELERATION_IMPLEMENTATION
  ANALYZABLE
  REVERSE_ENGINEERABLE
  DESTRUCTIVE_REVERSE_ENGINEERING_ALLOWED
```

Initial instance:

```text
Known Tags
  PHYSICAL_OBJECT

Processing Tags
  RECEIVING_REQUIRED
  IDENTITY_UNKNOWN

Physical State
  condition: UNKNOWN
  functionalState: UNKNOWN
  quantity: 1

Custody
  INCOMING
```

The Asgard and electromagnetic facts exist in Reality even though the SGC does not initially know them.

---

## 2. Receiving admission

Item requires:

```text
RECEIVING_REQUIRED
```

Destination must expose:

```text
CAN_ACCEPT_RECEIVING
```

Receiving queue/custody capacity must also be available.

If any check fails, the Item Instance does not change.

If all checks pass:

```text
Processing Tags
  + RECEIVING_AUTHORIZED
```

Then custody can transfer:

```text
INCOMING
  ->
RECEIVING_QUEUE
```

Do not remove source custody until destination capacity has been validated/reserved.

---

## 3. Receiving processing

Receiving establishes basic physical state and broad operational identity.

Example:

```text
Physical State
  condition: UNKNOWN -> INTACT
  functionalState: UNKNOWN
  quantity: 1
```

Receiving evidence may allow Known Tags such as:

```text
+ EQUIPMENT
+ WEAPON
+ RIFLE
```

It does not automatically identify Asgard technology or electromagnetic acceleration.

Receiving then completes its processing contract:

```text
Processing Tags
  - RECEIVING_REQUIRED
  - RECEIVING_AUTHORIZED
  - IDENTITY_UNKNOWN

  + RECEIVING_COMPLETE
  + IDENTITY_ESTABLISHED
  + ANALYSIS_REQUIRED
```

`IDENTITY_ESTABLISHED` means sufficient operational identity has been established to classify and route the object. It does not mean the SGC understands its origin or technology.

---

## 4. Analysis admission

Item has:

```text
ANALYSIS_REQUIRED
```

Destination must expose:

```text
CAN_ACCEPT_ANALYSIS
```

and have available queue/custody capacity.

If accepted:

```text
Processing Tags
  + ANALYSIS_AUTHORIZED
```

Then custody transfers:

```text
RECEIVING
  ->
ANALYSIS_QUEUE
```

---

## 5. Analysis processing

Analysis produces evidence/observations.

Those observations can cause the Known Tag resolver to establish facts such as:

```text
NONHUMAN_CONSTRUCTION
ELECTROMAGNETIC_BEHAVIOR
HIGH_ENERGY_ACCELERATION_BEHAVIOR
```

Interpretation depends on current SGC Theory knowledge.

If prerequisite knowledge is insufficient, the SGC may only reach something like:

```text
ADVANCED_BEHAVIOR_UNRESOLVED
```

If sufficient Theory knowledge exists, the same physical evidence may support:

```text
ELECTROMAGNETIC_ACCELERATION_IMPLEMENTATION
KNOWN_ENVELOPE_EXCEEDED
```

Known Tags must therefore be re-evaluated whenever relevant SGC knowledge changes.

Analysis does not alter Reality Tags.

---

## 6. Analysis completion / Workshop routing

Once nondestructive Analysis has exhausted what it can establish:

```text
Processing Tags
  - ANALYSIS_REQUIRED
  - ANALYSIS_AUTHORIZED

  + ANALYSIS_COMPLETE
  + NONDESTRUCTIVE_ANALYSIS_EXHAUSTED
  + WORKSHOP_REQUIRED
  + REVERSE_ENGINEERING_AVAILABLE
```

`DESTRUCTIVE_ACCESS_REQUIRED` may also be appropriate if needed as an explicit processing-state distinction.

The rifle remains physically intact at this point.

Analysis has only established that further progress requires the Workshop/Reverse Engineering path.

---

## 7. Workshop admission

The Item Instance has:

```text
WORKSHOP_REQUIRED
REVERSE_ENGINEERING_AVAILABLE
```

A destination must expose the required Processing Capabilities:

```text
CAN_ACCEPT_WORKSHOP
CAN_REVERSE_ENGINEER
```

and have available queue/custody capacity.

A configured Workshop capable only of repair/salvage is not a valid Reverse Engineering destination.

If accepted:

```text
Processing Tags
  + WORKSHOP_AUTHORIZED
  + REVERSE_ENGINEERING_AUTHORIZED
```

Then custody transfers:

```text
ANALYSIS
  ->
WORKSHOP_QUEUE
```

Again, validate/reserve destination capacity before releasing source custody.

---

## 8. Reverse Engineering starts

Entering the Workshop does not itself destroy the rifle.

When the player chooses the destructive path:

```text
Processing Tags
  + REVERSE_ENGINEERING_SELECTED
```

Selection alone does not physically modify the Item.

When actual Reverse Engineering begins:

```text
Processing Tags
  + REVERSE_ENGINEERING_IN_PROGRESS
```

Physical changes occur only when the authored process reaches the relevant destructive steps.

Reverse Engineering can expose authored evidence/knowledge opportunities during processing.

If the corresponding Theory progression is still useful, it can expose the pre-authored Hypothesis.

If that progression is already complete, route the exposure through the universal Rediscovery behavior instead of creating redundant Knowledge Cargo.

Knowledge output is not stored as a permanent property/tag on the physical rifle.

---

## 9. Destructive Reverse Engineering completion

For the current simulator rule, Reverse Engineering is destructive.

When Reverse Engineering completes:

```text
Physical State
  condition: DESTROYED
  functionalState: NONFUNCTIONAL
```

Processing updates:

```text
Processing Tags
  - WORKSHOP_REQUIRED
  - WORKSHOP_AUTHORIZED
  - REVERSE_ENGINEERING_AUTHORIZED
  - REVERSE_ENGINEERING_SELECTED
  - REVERSE_ENGINEERING_IN_PROGRESS

  + REVERSE_ENGINEERING_COMPLETE
```

The destroyed Item Instance then produces physical salvage according to the Item Definition's authored `salvageClass`.

`salvageClass` is a property, not a Reality/Known/Processing Tag.

It is separate from `storageClasses[]`:

```text
storageClasses[]
  = where the intact Item can validly be stored

salvageClass
  = the resource classification produced when the Item is destructively converted
```

Current salvage-class vocabulary:

```text
M1
M2
M3
S1
S2
S3
RATION
KNOWLEDGE
```

For an Asgard rifle, for example:

```text
salvageClass: M3
```

Knowledge exposure from Reverse Engineering remains separate from physical salvage. The same destructive process can produce M3 salvage and expose a pre-authored Hypothesis/Rediscovery result.

After all outputs are successfully committed, the destroyed original Item Instance can be consumed/removed.

---

# General Room Boundary Rule

Every Item transfer follows the same order:

```text
1. Item reaches valid Processing Tags for an exit.

2. Candidate destination exposes matching
   Room Processing Capabilities.

3. Destination validates queue/custody capacity.

4. Destination capacity is reserved.

5. Authorization Processing Tag(s) are added.

6. Source custody is released.

7. Destination custody is established.

8. Destination processing occurs.

9. Current Required/Authorized Processing Tags are removed
   when that contract completes.

10. Persistent completion/result Processing Tags remain,
    and the next Required/Available tags are added.
```

The important separation is:

```text
Reality Tags
  What the object actually is.

Known Tags
  What the SGC currently understands about it.

Processing Tags
  What processing contract/state the object currently has.

Physical State
  Condition, functionality, quantity.

Custody
  Where the physical object currently is.

Room Services
  What the configured room provides.

Room Processing Capabilities
  Which processing contracts those Services allow the room to handle.
```

Do not use room names to determine processing validity. Processing validity comes from the room's Service-derived Processing Capabilities.


## Schema integration status

This is the authored target contract for the next simulator pass. Existing item,
instance, and room data has not been migrated to the paper-test tags or custody
IDs. Actor/Tool/Room Service bubble execution is deferred for this pass; Service-
derived room admission is still part of the target contract.

The current schema retains `reality.authoredTags`, `knowledge.revealedTags`,
structured `state`, and `custody`. Known Tag re-evaluation requires retained
evidence and current institutional Knowledge; the resolver must not reveal
Reality merely because it is present on a definition.

Room `function.processingCapabilities` records reference a contract, its
`requiredRoomServices`, and optional `providesCapabilities` IDs. The latter are
outputs of Service resolution, not unconditional room permissions. A declaration
without its required configured Services does not expose those capabilities.
Exact Service-to-capability mappings remain to be authored.

`processingTags` uses a flat array of unique authored tag IDs. Identity,
selection, availability, exhaustion, requirements, authorization, and completion
can coexist as distinct contract facts without subgroups. Authored contracts
specify prerequisites and add/remove operations. Selection is not authorization;
tag names alone do not execute transitions. Detailed process progress remains in
`processes`, while location remains in `custody`. The previous grouped schema is
superseded; existing instance records remain unchanged.

The paper test supersedes the earlier intact/empty-Known-Tags arrival example
as a target: condition UNKNOWN and Known Tag PHYSICAL_OBJECT. Existing runtime
defaults are unchanged until the implementation/data pass. Physical condition
is a structured field even when its initial value is UNKNOWN.

Salvage yield, destination resource capacity, knowledge-exposure rules, and
Rediscovery behavior must resolve through authored data before destructive
completion can commit. The M3 example does not silently assign item data.
