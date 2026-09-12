# Provisional Physical Item Schema

## Status

**PROVISIONAL SIMULATOR SCHEMA**

## Authority Resolution

This schema specializes the established persistent Physical Instance contract for simulator items. It does not replace the universal Recipe, custody, Material, Knowledge, or Room Service models.

- Item Definition, Item Instance, Reality, revealed instance Knowledge, process records, and custody remain separate.
- Complete Reality is established when an instance is created; Receiving and Analysis reveal or interpret it rather than creating preexisting properties.
- Process fields are persistent records of work performed by external systems. They are not executable room behavior stored on the item.
- Custody is validated separately from Actor, Tool Service, and Room Service bubble requirements.
- Destructive work, Reverse Engineering, and salvage remain forward physical processes and must declare their consequences.
- The minimum simulator fields are an implementation subset, not the final production schema.

## Purpose

A Physical Item is a persistent instance of something that exists in the game world.

Examples:

```text
Asgard Rifle
Human Coil Rifle
Alien Power Cell
Biological Sample
Recovered Component
Artifact
Tool
Partially Constructed Device
Salvage
```

The item does not contain Receiving, Analysis, Workshop, or Research logic.

Those systems operate on the item.

The item stores persistent state resulting from those operations.

---

# 1. Governing Rule

```text
ITEM DEFINITION
What kind of thing can exist.

ITEM INSTANCE
The actual physical object.

REALITY
What is physically true about this instance.

KNOWLEDGE
What the SGC currently knows about this instance.

PROCESS STATE
What Receiving / Analysis / Construction / Repair / Reverse Engineering
has already done to this instance.

CUSTODY
Where the item physically is.
```

These must remain separate.

---

# 2. Top-Level Item Definition

Canonical database definition:

```json
{
  "id": "ASGARD_EM_RIFLE",
  "name": "Asgard Electromagnetic Rifle",
  "type": "ITEM",
  "family": "RIFLE",
  "version": 1,

  "identity": {},

  "physical": {},

  "possibleReality": {},

  "processCompatibility": {},

  "salvageGuidance": {},

  "extension": {}
}
```

This definition exists before play.

Runtime creates Item Instances referencing it.

---

# 3. Item Definition Schema

```json
{
  "id": "ASGARD_EM_RIFLE",
  "name": "Asgard Electromagnetic Rifle",
  "type": "ITEM",
  "family": "RIFLE",
  "version": 1,

  "identity": {
    "description": "A handheld Asgard ranged weapon using Tier-II electromagnetic acceleration.",
    "civilization": "ASGARD",
    "formFactor": "RIFLE",
    "subjectTags": [
      "WEAPON",
      "RANGED_WEAPON",
      "RIFLE",
      "ASGARD"
    ]
  },

  "physical": {
    "inventoryClass": "EQUIPMENT",
    "isUnique": false,
    "isStackable": false,
    "isContainer": false,
    "isTool": false,
    "isCore": false,
    "isCargo": true
  },

  "possibleReality": {
    "inherentTags": [
      "WEAPON",
      "RANGED_WEAPON",
      "RIFLE",
      "ASGARD",
      "ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION"
    ],

    "possibleTags": [
      "FUNCTIONAL",
      "DAMAGED",
      "CHARGED",
      "DISCHARGED",
      "CONTAMINATED",
      "UNSTABLE"
    ]
  },

  "processCompatibility": {
    "receiving": true,
    "analysis": true,
    "repair": true,
    "reverseEngineering": true,
    "salvage": true,
    "construction": false
  },

  "salvageGuidance": {
    "preserveMass": true
  },

  "extension": {}
}
```

---

# 4. Item Instance

Runtime object:

```json
{
  "instanceId": "ITEM_ASGARD_RIFLE_0001",

  "definitionId": "ASGARD_EM_RIFLE",

  "state": {},

  "reality": {},

  "knowledge": {},

  "custody": {},

  "processes": {},

  "relationships": {},

  "history": []
}
```

---

# 5. Physical State

`state` contains ordinary persistent physical condition.

Example:

```json
{
  "state": {
    "condition": "INTACT",

    "functionalState": "FUNCTIONAL",

    "powerState": "CHARGED",

    "constructionState": "COMPLETE",

    "damage": [],

    "quantity": 1,

    "percentOfWhole": 100
  }
}
```

Suggested enums:

```text
condition:
  INTACT
  DAMAGED
  DESTROYED

functionalState:
  FUNCTIONAL
  DEGRADED
  NONFUNCTIONAL
  UNKNOWN

constructionState:
  COMPLETE
  PARTIAL
  NOT_APPLICABLE
```

Do not equate condition with function.

An intact object may be nonfunctional.

A damaged object may remain functional.

---

# 6. Reality

Reality stores facts that are objectively true whether or not the SGC knows them.

Example:

```json
{
  "reality": {
    "tags": [
      "WEAPON",
      "RANGED_WEAPON",
      "RIFLE",
      "ASGARD",
      "ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION",
      "FUNCTIONAL",
      "CHARGED"
    ],

    "technology": [
      "ELECTROMAGNETIC_ACCELERATION_II"
    ],

    "fabricationEcosystem": [
      "ASGARD_FABRICATION_II"
    ],

    "materials": [
      {
        "materialId": "UNKNOWN_ASGARD_ALLOY",
        "massFraction": null
      }
    ]
  }
}
```

Important:

```text
Reality tags do not automatically become known.
```

---

# 7. Instance Knowledge

Knowledge records what the SGC currently recognizes about this specific object.

```json
{
  "knowledge": {
    "revealedTags": [],

    "recognizedIdentity": null,

    "recognizedCivilization": null,

    "recognizedItemClass": null,

    "instanceFindings": [],

    "handlingKnowledge": [],

    "knownProcessRequirements": []
  }
}
```

This is separate from institutional Theory Knowledge.

---

# 8. After Receiving

The rifle might begin as:

```json
{
  "knowledge": {
    "revealedTags": [],

    "recognizedIdentity": null,

    "recognizedCivilization": null,

    "recognizedItemClass": null,

    "instanceFindings": [],

    "handlingKnowledge": [],

    "knownProcessRequirements": []
  }
}
```

After Receiving:

```json
{
  "knowledge": {
    "revealedTags": [
      "RANGED_WEAPON"
    ],

    "recognizedIdentity": null,

    "recognizedCivilization": "ASGARD",

    "recognizedItemClass": "RANGED_WEAPON",

    "instanceFindings": [],

    "handlingKnowledge": [
      "ENERGETIC_DEVICE_HANDLING"
    ],

    "knownProcessRequirements": []
  }
}
```

Receiving has answered:

```text
What broad kind of thing is this?
How should we handle it?
Where should it go next?
```

It has not explained how the weapon works.

---

# 9. After Analysis

Assume:

```text
ELECTROMAGNETIC_ACCELERATION_I = KNOWN
```

Analysis might add:

```json
{
  "knowledge": {
    "revealedTags": [
      "RANGED_WEAPON",
      "ELECTROMAGNETIC_ACCELERATION"
    ],

    "recognizedIdentity": null,

    "recognizedCivilization": "ASGARD",

    "recognizedItemClass": "RANGED_WEAPON",

    "instanceFindings": [
      {
        "id": "FINDING_EM_ENVELOPE_EXCEEDED_0001",

        "type": "INSTANCE_FINDING",

        "claim": "Device operation exceeds the known ELECTROMAGNETIC_ACCELERATION_I capability envelope.",

        "scope": "INSTANCE",

        "status": "SUPPORTED",

        "relatedTheory": "ELECTROMAGNETIC_ACCELERATION_I"
      }
    ],

    "handlingKnowledge": [
      "ENERGETIC_DEVICE_HANDLING"
    ],

    "knownProcessRequirements": [
      {
        "process": "REVERSE_ENGINEERING",

        "roomService": "SAFE_ELECTROMAGNETIC_ENVIRONMENT_II"
      }
    ]
  }
}
```

That is the important handoff.

Analysis does not produce:

```text
ELECTROMAGNETIC_ACCELERATION_II = KNOWN
```

It produces an instance finding and identifies the requirement for further physical work.

---

# 10. Custody

Custody tells the simulator where the object physically exists.

```json
{
  "custody": {
    "holderType": "ROOM",
    "holderId": "RECEIVING_ROOM_01",

    "roomGroupId": "GROUP_03",

    "status": "STORED",

    "reservedBy": null
  }
}
```

Suggested `holderType` values:

```text
ROOM
UNIT
MISSION
HAVEN
STORAGE
TRANSIT
NONE
```

Suggested custody status:

```text
STORED
EQUIPPED
IN_USE
IN_PROCESS
IN_TRANSIT
RESERVED
```

---

# 11. Room Transfer

Moving Receiving → Analysis → Workshop does not create a new object.

Only custody changes.

Example:

```json
{
  "custody": {
    "holderType": "ROOM",
    "holderId": "WORKSHOP_01",
    "roomGroupId": "GROUP_07",
    "status": "STORED",
    "reservedBy": null
  }
}
```

All previous Receiving and Analysis results remain attached to:

```text
ITEM_ASGARD_RIFLE_0001
```

---

# 12. Persistent Process State

The item should record processes that operate directly on the physical instance.

```json
{
  "processes": {
    "receiving": {},
    "analysis": {},
    "construction": {},
    "repair": {},
    "reverseEngineering": {},
    "salvage": {}
  }
}
```

Only applicable processes need actual records.

---

# 13. Receiving Process State

Example:

```json
{
  "receiving": {
    "state": "COMPLETE",

    "completedSteps": [
      "DETERMINE_HANDLING",
      "DETERMINE_ITEM_CLASS"
    ],

    "currentStep": null
  }
}
```

---

# 14. Analysis Process State

Example:

```json
{
  "analysis": {
    "state": "COMPLETE",

    "completedSteps": [
      "OBSERVE_OPERATION",
      "CHARACTERIZE_KNOWN_BEHAVIOR"
    ],

    "currentStep": null,

    "findingsProduced": [
      "FINDING_EM_ENVELOPE_EXCEEDED_0001"
    ]
  }
}
```

Analysis state belongs to the physical item.

Moving the rifle does not erase it.

---

# 15. Reverse Engineering State

Before reverse engineering:

```json
{
  "reverseEngineering": {
    "state": "NOT_STARTED",

    "recipeId": "REVERSE_ENGINEER_ADVANCED_IMPLEMENTATION",

    "completedBubbles": [],

    "currentBubble": null,

    "partialProgress": 0
  }
}
```

During work:

```json
{
  "reverseEngineering": {
    "state": "ACTIVE",

    "recipeId": "REVERSE_ENGINEER_ADVANCED_IMPLEMENTATION",

    "completedBubbles": [
      "CHARACTERIZE_IMPLEMENTATION",
      "DISASSEMBLE_SYSTEM"
    ],

    "currentBubble": "ISOLATE_ACCELERATOR_ASSEMBLY",

    "partialProgress": 36
  }
}
```

---

# 16. Reverse Engineering Completion

Successful destructive Reverse Engineering may transactionally produce:

```text
Item consumed/destroyed
+
Salvage
+
Hypothesis Cargo
```

Example final state:

```json
{
  "state": {
    "condition": "DESTROYED",
    "functionalState": "NONFUNCTIONAL",
    "powerState": "DISCHARGED",
    "constructionState": "COMPLETE",
    "damage": [],
    "quantity": 1,
    "percentOfWhole": 0
  }
}
```

And the transaction creates separate runtime records:

```json
{
  "outputs": [
    {
      "type": "MATERIAL",
      "id": "ASGARD_RIFLE_SALVAGE_0001"
    },
    {
      "type": "HYPOTHESIS",
      "id": "HYP_INSTANCE_0042",
      "definitionId": "HYP_EM_ACCELERATION_II_EXTRACTION"
    }
  ]
}
```

The Hypothesis is not stored inside the destroyed rifle.

It is a new Knowledge Cargo record.

---

# 17. Item Relationships

Useful for components, containers, construction, and source provenance.

```json
{
  "relationships": {
    "parentInstanceId": null,

    "childInstanceIds": [],

    "createdFrom": [],

    "sourceRecipeId": null,

    "derivedKnowledge": []
  }
}
```

For the rifle after Reverse Engineering:

```json
{
  "derivedKnowledge": [
    "HYP_INSTANCE_0042"
  ]
}
```

This is provenance only.

---

# 18. Item History

A simple event history is useful for simulator debugging.

```json
{
  "history": [
    {
      "event": "RECEIVED",
      "location": "RECEIVING_ROOM_01"
    },
    {
      "event": "RECEIVING_COMPLETED"
    },
    {
      "event": "TRANSFERRED",
      "from": "RECEIVING_ROOM_01",
      "to": "ANALYSIS_ROOM_01"
    },
    {
      "event": "ANALYSIS_COMPLETED"
    },
    {
      "event": "TRANSFERRED",
      "from": "ANALYSIS_ROOM_01",
      "to": "WORKSHOP_01"
    }
  ]
}
```

This history should not itself be gameplay authority.

Current state remains authoritative.

---

# 19. Complete Asgard Rifle Instance Example

```json
{
  "instanceId": "ITEM_ASGARD_RIFLE_0001",

  "definitionId": "ASGARD_EM_RIFLE",

  "state": {
    "condition": "INTACT",
    "functionalState": "FUNCTIONAL",
    "powerState": "CHARGED",
    "constructionState": "COMPLETE",
    "damage": [],
    "quantity": 1,
    "percentOfWhole": 100
  },

  "reality": {
    "tags": [
      "WEAPON",
      "RANGED_WEAPON",
      "RIFLE",
      "ASGARD",
      "ELECTROMAGNETIC_ACCELERATION_II_IMPLEMENTATION",
      "FUNCTIONAL",
      "CHARGED"
    ],

    "technology": [
      "ELECTROMAGNETIC_ACCELERATION_II"
    ],

    "fabricationEcosystem": [
      "ASGARD_FABRICATION_II"
    ],

    "materials": []
  },

  "knowledge": {
    "revealedTags": [
      "RANGED_WEAPON",
      "ELECTROMAGNETIC_ACCELERATION"
    ],

    "recognizedIdentity": null,

    "recognizedCivilization": "ASGARD",

    "recognizedItemClass": "RANGED_WEAPON",

    "instanceFindings": [
      {
        "id": "FINDING_EM_ENVELOPE_EXCEEDED_0001",

        "type": "INSTANCE_FINDING",

        "claim": "Device operation exceeds the known ELECTROMAGNETIC_ACCELERATION_I capability envelope.",

        "scope": "INSTANCE",

        "status": "SUPPORTED",

        "relatedTheory": "ELECTROMAGNETIC_ACCELERATION_I"
      }
    ],

    "handlingKnowledge": [
      "ENERGETIC_DEVICE_HANDLING"
    ],

    "knownProcessRequirements": [
      {
        "process": "REVERSE_ENGINEERING",

        "roomService": "SAFE_ELECTROMAGNETIC_ENVIRONMENT_II"
      }
    ]
  },

  "custody": {
    "holderType": "ROOM",
    "holderId": "WORKSHOP_01",
    "roomGroupId": "GROUP_07",
    "status": "STORED",
    "reservedBy": null
  },

  "processes": {
    "receiving": {
      "state": "COMPLETE",

      "completedSteps": [
        "DETERMINE_HANDLING",
        "DETERMINE_ITEM_CLASS"
      ],

      "currentStep": null
    },

    "analysis": {
      "state": "COMPLETE",

      "completedSteps": [
        "OBSERVE_OPERATION",
        "CHARACTERIZE_KNOWN_BEHAVIOR"
      ],

      "currentStep": null,

      "findingsProduced": [
        "FINDING_EM_ENVELOPE_EXCEEDED_0001"
      ]
    },

    "construction": null,

    "repair": null,

    "reverseEngineering": {
      "state": "NOT_STARTED",

      "recipeId": "REVERSE_ENGINEER_ADVANCED_IMPLEMENTATION",

      "completedBubbles": [],

      "currentBubble": null,

      "partialProgress": 0
    },

    "salvage": null
  },

  "relationships": {
    "parentInstanceId": null,
    "childInstanceIds": [],
    "createdFrom": [],
    "sourceRecipeId": null,
    "derivedKnowledge": []
  },

  "history": []
}
```

---

# 20. Minimum Simulator Fields

If the simulator needs the smallest viable implementation first, support:

```text
instanceId
definitionId

state

reality.tags

knowledge.revealedTags
knowledge.instanceFindings
knowledge.knownProcessRequirements

custody

processes.receiving
processes.analysis
processes.reverseEngineering
```

Everything else can be retained in the schema without initially being used by the UI.

---

# 21. Important Boundary

Do not encode:

```text
"This rifle goes to Receiving, then Analysis, then Workshop"
```

inside the rifle definition.

Instead:

```text
Item says what processes are valid.

Receiving determines its own valid subjects.
Analysis determines its own valid subjects.
Workshop determines its own valid subjects.

Custody moves the same persistent item between them.
```

This preserves the room boundary.

---

# 22. Governing Principle

> A Physical Item stores persistent physical truth, instance knowledge, condition, custody, and the results of processes performed on it. Rooms and Recipes determine what can be done to the item; the item does not contain room behavior.
