# High-Level Design Doc: Squad-Based Mobile Strategy RPG

## 1. Game summary
**Stargate Orionis** is a mobile friendly game built around
1. training units
1. managing a base
1. collecting resources
1. making meaningful choice before missions
1. making strategic choices during missions
1. managing different diplomancy avenues

writing{variant="document" id="48317" title="Offworld Missions and Combat System"}

Offworld Missions and Combat System

Design Philosophy

The offworld mission system is built around one central principle:

> The right unit at the right time can make all the difference.



Combat itself is intentionally low-micromanagement. The player's most important decisions happen when assembling the team, interpreting reconnaissance, choosing where to explore, deciding which objectives are worth pursuing, and responding to encounters.

A four-unit team should never be capable of doing everything on a mission. Team composition creates opportunities while simultaneously closing others.

The core mission loop is:

Probe → Assess → Assemble Team → Explore → Encounter → Make Decisions → Manage Stamina/Risk → Extract


---

Probe and Mission Preparation

Before deploying units, the player sends a probe through the Stargate.

The probe provides an initial reconnaissance report containing incomplete information about the mission.

Examples include:

Heavy enemy resistance detected.

Numerous artificial structures detected.

Traps or defensive systems suspected.

Unusual energy readings detected.

Signs of prisoners or captives.

Valuable resources may be present.

Local population detected.

Communications traffic detected.


The report helps the player determine which four units are most appropriate for the mission.

For example, Heavy Resistance encourages bringing strong combat units, while evidence of Traps makes units capable of detecting or disabling traps more valuable.

Reconnaissance should inform the player's choices without revealing the optimal team.


---

Four-Unit Team

Offworld teams contain a maximum of four units.

The four-unit limit forces specialization.

A combat-heavy team may survive dangerous encounters but miss opportunities involving diplomacy, technology, intelligence, treasure, or exploration.

A highly specialized scientific team may access valuable objectives but struggle against unexpected resistance.

There should intentionally be no universally optimal team composition.


---

Grid-Based Exploration

Offworld missions take place on a grid of interconnected tiles.

Tiles visually represent locations such as:

Corridors

Forest clearings

Villages

Ruins

Goa'uld facilities

Ancient structures

Caves

Ships

Military installations


Tiles do not provide tactical combat positioning. Their environments are primarily visual representations of where encounters occur.

The grid instead exists to create exploration decisions.

Most tiles may contain little or nothing of immediate value. The player must decide which direction is worth exploring.


---

Unit-Based Exploration Information

Certain unit skills provide additional information about unexplored tiles.

For example, a unit skilled at finding valuable objects may cause the border of an unexplored tile to indicate:

Possible Treasure

A unit capable of detecting enemies might reveal another tile as:

Heavy Resistance

These indicators do not necessarily reveal exactly what is inside the tile. They provide enough information for the player to make an informed decision about whether to investigate or avoid it.

Different specialists therefore effectively perceive the mission map differently.

A team containing an experienced scout may understand threats.

A treasure specialist may recognize potential loot locations.

A scientist may detect unusual technology.

A diplomat may recognize locations where important NPCs are likely to be encountered.

Team composition therefore affects not only what encounters can be completed, but also what information the player has when navigating the mission.


---

Mission Objectives

Every mission contains more potential objectives than a four-unit team can reasonably complete.

For example:

Gain Intel ×3

Acquire Loot ×4

Execute Sabotage ×1

Free Captives ×2


The expectation is not that the player clears the entire map.

Instead, the player must continually decide:

> Is exploring another room worth the risk and stamina?



Different team compositions naturally prioritize different objectives.

This makes revisiting similar locations with different teams potentially worthwhile and prevents mission success from simply meaning "clear every tile."


---

Stamina

Exploration consumes Stamina.

Moving through the mission, attempting encounters, failing challenges, and dealing with injuries can all reduce available stamina.

Stamina acts as the primary limit on how much of a mission can be explored.

The player must balance:

Potential Reward vs. Remaining Stamina vs. Mission Risk

A team may know valuable loot is nearby but lack enough stamina to safely reach it and return.

Reaching 0 Stamina causes that unit to be immediately evacuated from the mission.

This means the team's capabilities can gradually deteriorate during an expedition.

Losing the team's only engineer, diplomat, medic, or scout can dramatically change which objectives remain practical.


---

Encounter System

Entering certain tiles triggers encounters.

Possible encounters include:

Combat

Traps

Hacking

Diplomacy

Archaeological challenges

Scientific analysis

Sabotage

Prisoner rescue

Intelligence gathering

Environmental hazards

Treasure recovery

NPC interactions


Unit statistics determine which actions become available and how difficult those actions are.


---

Skill Checks

Skill checks should never be purely passive statistical rolls.

The player's unit provides the capability and probability, while the player still performs an interaction.

For example, encountering a hostile NPC while having a unit with high Diplomacy may provide:

NEGOTIATE

Selecting it begins a short timing-based interaction.

The character's Diplomacy statistic determines factors such as the size of the success area, difficulty, available attempts, or strength of the resulting outcome.

The player still has the opportunity to succeed or fail.

This produces the intended relationship:

Character Skill + Player Execution = Result


---

Failure and Retrying

Failing a skill challenge has consequences.

At minimum, failure consumes stamina.

Retrying may introduce escalating risks such as:

Triggering an alarm

Attracting a patrol

Damaging equipment

Injuring a unit

Alerting nearby enemies

Increasing encounter difficulty

Destroying potential loot

Closing an alternative solution


The player therefore cannot simply repeat a skill check until successful.

After failure, the question becomes:

> Do I accept the loss, or risk making the situation worse by trying again?




---

Combat

Combat is primarily automatic.

Units automatically:

Select targets

Attack

Use appropriate basic abilities

Respond to threats

Use certain special abilities when appropriate


The default automatic behavior should be effective enough that the player rarely needs to micromanage combat.

The player's role is primarily team composition and intervention, rather than issuing constant commands.


---

Manual Targeting

The player may override automatic targeting when necessary.

A simple interaction should be sufficient:

1. Select a unit.


2. Select or drag toward an enemy.


3. The unit prioritizes that target.



Manual targeting should provide additional control without becoming necessary for routine combat.

Auto-targeting remains the preferred/default behavior.


---

Special Abilities

Units may possess special abilities with limited availability.

Possible restrictions include:

Once per encounter

Once per room

Once per mission


Abilities should generally support automatic activation.

The player may manually trigger an ability when timing or target selection matters, but optimal play should not require constantly managing every unit's abilities.


---

Downed Units

Reaching 0 HP does not normally kill a unit.

Instead, the unit enters the Downed state.

Downed units remain part of the encounter and retain a limited class-specific ability.

Examples could include:

Soldier providing limited covering fire

Medic stabilizing another unit

Scientist providing analysis

Engineer remotely interacting with equipment

Diplomat communicating with enemies


Remaining downed consumes additional stamina.

This creates pressure to resolve the encounter rather than allowing incapacitated characters to remain indefinitely.

Permanent unit death should be possible but rare and associated with exceptional circumstances rather than ordinary combat defeat.


---

Capture and Mission Failure

If the entire team becomes Downed, the team is Captured and the mission fails.

Captured characters are not automatically lost.

Instead, their capture generates new gameplay opportunities.

Possible follow-up missions include:

Rescue Captured Team

Alternatively, political or diplomatic options may become available:

Negotiate Prisoner Release

The player therefore experiences a meaningful consequence for failure without routinely losing developed characters permanently.

Failure can create new stories rather than simply deleting progress.


---

Enemy Downed State

Enemies use the same Downed concept.

Reducing an enemy to 0 HP generally incapacitates them rather than immediately killing them.

A Downed enemy may retain a dangerous class-specific action.

Examples include:

Summon Patrol

Trigger Alarm

Destroy Evidence

Warn Nearby Units

Activate Security System

Attempt Escape


The player therefore cannot simply ignore incapacitated enemies.

They must decide what to do with them.


---

Capturing, Intimidating, and Executing Enemies

The player can resolve Downed enemies in several ways.

Capture

Capturing an enemy should generally provide the greatest long-term strategic value.

Prisoners may:

Provide intelligence

Become part of prisoner exchanges

Be traded for captured team members

Be exchanged for resources

Become bargaining chips during diplomacy

Provide research or faction information

Create future political events


Intimidate / Interrogate

Intimidating a Downed enemy can provide immediate mission advantages.

Possible rewards include:

Reveal enemy locations

Reveal valuable loot tiles

Identify patrol routes

Reveal hidden objectives

Provide bonuses to hacking attempts

Provide bonuses to research or technology checks

Reveal reinforcements

Reveal traps or defenses


The information may directly alter the mission grid by exposing previously hidden tile information.

Execute

Execution permanently removes the threat but should generally provide less strategic value than capture or intimidation.

It may also have consequences involving:

Faction reputation

Diplomacy

Enemy morale

Future retaliation

Character relationships

Mission outcomes


The system should consistently encourage the player to see enemies as potential resources and sources of information, rather than simply targets that need to be eliminated.


---

Base Defense and Base Events

The same general encounter philosophy extends to the player's base.

Enemies may occasionally attack through the Stargate, creating a Base Defense event.

Threats can move into or appear within different base rooms, requiring available personnel to respond.

Base rooms may also independently generate challenges that require personnel with appropriate skills.

Examples include:

Stargate incursion

Reactor malfunction

Medical emergency

Security breach

Alien infection

Sabotage

Prisoner escape

Technology malfunction

Diplomatic incident

Containment failure


Like offworld encounters, these events reward having the right personnel available at the right moment.

This creates tension between sending the player's strongest personnel offworld and keeping useful specialists at the base.


---

Core Strategic Tension

The combat and exploration systems should continually reinforce three questions:

Who do I bring?

The reconnaissance report and expected objectives determine which four units seem most valuable.

Where do I go?

Unit skills reveal different information about the grid, but stamina prevents exhaustive exploration.

When do I stop?

Every additional tile represents another opportunity for loot, intelligence, prisoners, or objectives, but also another opportunity for injury, stamina loss, alarms, and capture.

The player's strongest decision should often be choosing to leave something behind.

A successful mission is therefore not necessarily one where everything was completed. It is one where the player decided which opportunities mattered most and got the team back through the Stargate.

writing{variant="document" id="48317" title="Offworld Missions and Combat System"}
# Offworld Missions and Combat System

## Design Philosophy

The offworld mission system is built around one central principle:

> **The right unit at the right time can make all the difference.**

Combat itself is intentionally low-micromanagement. The player's most important decisions happen when assembling the team, interpreting reconnaissance, choosing where to explore, deciding which objectives are worth pursuing, and responding to encounters.

A four-unit team should never be capable of doing everything on a mission. Team composition creates opportunities while simultaneously closing others.

The core mission loop is:

**Probe → Assess → Assemble Team → Explore → Encounter → Make Decisions → Manage Stamina/Risk → Extract**

---

## Probe and Mission Preparation

Before deploying units, the player sends a probe through the Stargate.

The probe provides an initial reconnaissance report containing incomplete information about the mission.

Examples include:

- Heavy enemy resistance detected.
- Numerous artificial structures detected.
- Traps or defensive systems suspected.
- Unusual energy readings detected.
- Signs of prisoners or captives.
- Valuable resources may be present.
- Local population detected.
- Communications traffic detected.

The report helps the player determine which four units are most appropriate for the mission.

For example, **Heavy Resistance** encourages bringing strong combat units, while evidence of **Traps** makes units capable of detecting or disabling traps more valuable.

Reconnaissance should inform the player's choices without revealing the optimal team.

---

## Four-Unit Team

Offworld teams contain a maximum of **four units**.

The four-unit limit forces specialization.

A combat-heavy team may survive dangerous encounters but miss opportunities involving diplomacy, technology, intelligence, treasure, or exploration.

A highly specialized scientific team may access valuable objectives but struggle against unexpected resistance.

There should intentionally be **no universally optimal team composition**.

---

# Grid-Based Exploration

Offworld missions take place on a grid of interconnected tiles.

Tiles visually represent locations such as:

- Corridors
- Forest clearings
- Villages
- Ruins
- Goa'uld facilities
- Ancient structures
- Caves
- Ships
- Military installations

Tiles do **not** provide tactical combat positioning. Their environments are primarily visual representations of where encounters occur.

The grid instead exists to create **exploration decisions**.

Most tiles may contain little or nothing of immediate value. The player must decide which direction is worth exploring.

---

## Unit-Based Exploration Information

Certain unit skills provide additional information about unexplored tiles.

For example, a unit skilled at finding valuable objects may cause the border of an unexplored tile to indicate:

**Possible Treasure**

A unit capable of detecting enemies might reveal another tile as:

**Heavy Resistance**

These indicators do not necessarily reveal exactly what is inside the tile. They provide enough information for the player to make an informed decision about whether to investigate or avoid it.

Different specialists therefore effectively perceive the mission map differently.

A team containing an experienced scout may understand threats.

A treasure specialist may recognize potential loot locations.

A scientist may detect unusual technology.

A diplomat may recognize locations where important NPCs are likely to be encountered.

Team composition therefore affects not only what encounters can be completed, but also **what information the player has when navigating the mission**.

---

# Mission Objectives

Every mission contains **more potential objectives than a four-unit team can reasonably complete**.

For example:

- Gain Intel ×3
- Acquire Loot ×4
- Execute Sabotage ×1
- Free Captives ×2

The expectation is not that the player clears the entire map.

Instead, the player must continually decide:

> **Is exploring another room worth the risk and stamina?**

Different team compositions naturally prioritize different objectives.

This makes revisiting similar locations with different teams potentially worthwhile and prevents mission success from simply meaning "clear every tile."

---

# Stamina

Exploration consumes **Stamina**.

Moving through the mission, attempting encounters, failing challenges, and dealing with injuries can all reduce available stamina.

Stamina acts as the primary limit on how much of a mission can be explored.

The player must balance:

**Potential Reward vs. Remaining Stamina vs. Mission Risk**

A team may know valuable loot is nearby but lack enough stamina to safely reach it and return.

Reaching **0 Stamina** causes that unit to be immediately evacuated from the mission.

This means the team's capabilities can gradually deteriorate during an expedition.

Losing the team's only engineer, diplomat, medic, or scout can dramatically change which objectives remain practical.

---

# Encounter System

Entering certain tiles triggers encounters.

Possible encounters include:

- Combat
- Traps
- Hacking
- Diplomacy
- Archaeological challenges
- Scientific analysis
- Sabotage
- Prisoner rescue
- Intelligence gathering
- Environmental hazards
- Treasure recovery
- NPC interactions

Unit statistics determine which actions become available and how difficult those actions are.

---

## Skill Checks

Skill checks should never be purely passive statistical rolls.

The player's unit provides the **capability and probability**, while the player still performs an interaction.

For example, encountering a hostile NPC while having a unit with high Diplomacy may provide:

**NEGOTIATE**

Selecting it begins a short timing-based interaction.

The character's Diplomacy statistic determines factors such as the size of the success area, difficulty, available attempts, or strength of the resulting outcome.

The player still has the opportunity to succeed or fail.

This produces the intended relationship:

**Character Skill + Player Execution = Result**

---

## Failure and Retrying

Failing a skill challenge has consequences.

At minimum, failure consumes stamina.

Retrying may introduce escalating risks such as:

- Triggering an alarm
- Attracting a patrol
- Damaging equipment
- Injuring a unit
- Alerting nearby enemies
- Increasing encounter difficulty
- Destroying potential loot
- Closing an alternative solution

The player therefore cannot simply repeat a skill check until successful.

After failure, the question becomes:

> **Do I accept the loss, or risk making the situation worse by trying again?**

---

# Combat

Combat is primarily automatic.

Units automatically:

- Select targets
- Attack
- Use appropriate basic abilities
- Respond to threats
- Use certain special abilities when appropriate

The default automatic behavior should be effective enough that the player rarely needs to micromanage combat.

The player's role is primarily **team composition and intervention**, rather than issuing constant commands.

---

## Manual Targeting

The player may override automatic targeting when necessary.

A simple interaction should be sufficient:

1. Select a unit.
2. Select or drag toward an enemy.
3. The unit prioritizes that target.

Manual targeting should provide additional control without becoming necessary for routine combat.

Auto-targeting remains the preferred/default behavior.

---

## Special Abilities

Units may possess special abilities with limited availability.

Possible restrictions include:

- Once per encounter
- Once per room
- Once per mission

Abilities should generally support automatic activation.

The player may manually trigger an ability when timing or target selection matters, but optimal play should not require constantly managing every unit's abilities.

---

# Downed Units

Reaching **0 HP does not normally kill a unit**.

Instead, the unit enters the **Downed** state.

Downed units remain part of the encounter and retain a limited class-specific ability.

Examples could include:

- Soldier providing limited covering fire
- Medic stabilizing another unit
- Scientist providing analysis
- Engineer remotely interacting with equipment
- Diplomat communicating with enemies

Remaining downed consumes additional stamina.

This creates pressure to resolve the encounter rather than allowing incapacitated characters to remain indefinitely.

Permanent unit death should be possible but **rare** and associated with exceptional circumstances rather than ordinary combat defeat.

---

## Capture and Mission Failure

If the entire team becomes Downed, the team is **Captured** and the mission fails.

Captured characters are not automatically lost.

Instead, their capture generates new gameplay opportunities.

Possible follow-up missions include:

**Rescue Captured Team**

Alternatively, political or diplomatic options may become available:

**Negotiate Prisoner Release**

The player therefore experiences a meaningful consequence for failure without routinely losing developed characters permanently.

Failure can create new stories rather than simply deleting progress.

---

# Enemy Downed State

Enemies use the same Downed concept.

Reducing an enemy to 0 HP generally incapacitates them rather than immediately killing them.

A Downed enemy may retain a dangerous class-specific action.

Examples include:

- Summon Patrol
- Trigger Alarm
- Destroy Evidence
- Warn Nearby Units
- Activate Security System
- Attempt Escape

The player therefore cannot simply ignore incapacitated enemies.

They must decide what to do with them.

---

# Capturing, Intimidating, and Executing Enemies

The player can resolve Downed enemies in several ways.

### Capture

Capturing an enemy should generally provide the greatest long-term strategic value.

Prisoners may:

- Provide intelligence
- Become part of prisoner exchanges
- Be traded for captured team members
- Be exchanged for resources
- Become bargaining chips during diplomacy
- Provide research or faction information
- Create future political events

### Intimidate / Interrogate

Intimidating a Downed enemy can provide immediate mission advantages.

Possible rewards include:

- Reveal enemy locations
- Reveal valuable loot tiles
- Identify patrol routes
- Reveal hidden objectives
- Provide bonuses to hacking attempts
- Provide bonuses to research or technology checks
- Reveal reinforcements
- Reveal traps or defenses

The information may directly alter the mission grid by exposing previously hidden tile information.

### Execute

Execution permanently removes the threat but should generally provide less strategic value than capture or intimidation.

It may also have consequences involving:

- Faction reputation
- Diplomacy
- Enemy morale
- Future retaliation
- Character relationships
- Mission outcomes

The system should consistently encourage the player to see enemies as **potential resources and sources of information**, rather than simply targets that need to be eliminated.

---

# Base Defense and Base Events

The same general encounter philosophy extends to the player's base.

Enemies may occasionally attack through the Stargate, creating a **Base Defense** event.

Threats can move into or appear within different base rooms, requiring available personnel to respond.

Base rooms may also independently generate challenges that require personnel with appropriate skills.

Examples include:

- Stargate incursion
- Reactor malfunction
- Medical emergency
- Security breach
- Alien infection
- Sabotage
- Prisoner escape
- Technology malfunction
- Diplomatic incident
- Containment failure

Like offworld encounters, these events reward having the **right personnel available at the right moment**.

This creates tension between sending the player's strongest personnel offworld and keeping useful specialists at the base.

---

# Core Strategic Tension

The combat and exploration systems should continually reinforce three questions:

**Who do I bring?**

The reconnaissance report and expected objectives determine which four units seem most valuable.

**Where do I go?**

Unit skills reveal different information about the grid, but stamina prevents exhaustive exploration.

**When do I stop?**

Every additional tile represents another opportunity for loot, intelligence, prisoners, or objectives, but also another opportunity for injury, stamina loss, alarms, and capture.

The player's strongest decision should often be choosing to leave something behind.

A successful mission is therefore not necessarily one where everything was completed. It is one where the player decided **which opportunities mattered most and got the team back through the Stargate.**



writing{variant="document" id="61742" title="Unit Classes and Specializations"}

Unit Classes and Specializations

Overview

Units are organized using a two-level system:

Base Class → Specialization

The game will initially use 6 base classes, with each class having 3 specializations.

Base classes define a unit's broad identity both offworld and at the base. Specializations provide additional differentiation between units of the same class.

The current classes and specializations are preliminary. Their exact stats, abilities, bonuses, and names will be finalized after the offworld encounter, base-room, and progression systems are more fully defined.


---

Design Philosophy

The class system should reinforce the core unit-design principle:

> The right unit at the right time can make all the difference.



A unit's class determines:

General offworld role

Types of encounters the unit is suited to handle

Basic combat behavior

Class-specific abilities

Base assignment bonus

General progression options


A unit's specialization determines:

Areas where the unit particularly excels

Additional encounter options

Specialized abilities

Potential secondary base bonuses

Differences between units belonging to the same class


Specializations should not be so narrow that they function as entirely separate classes.


---

Preliminary Classes

Soldier

Primary Role: Combat and security

Soldiers are the most capable units for missions where significant enemy resistance is expected. They may also be useful for intimidation, breaching, prisoner handling, and identifying dangerous enemy forces.

Base Bonus: Improves security and/or defensive capabilities when assigned to appropriate base rooms.

Possible Specializations

Heavy Weapons

High combat effectiveness

Suppression

Area attacks

Strong against heavily armored enemies


Marksman

Prioritizes dangerous targets

High accuracy

Increased effectiveness against elite enemies

May identify or exploit enemy weaknesses


Commando

Breaching

Infiltration

Close-range combat

Improved performance during sabotage operations



---

Scout

Primary Role: Reconnaissance and exploration

Scouts help the player understand the mission grid before committing to encounters. They specialize in identifying threats, routes, traps, hidden areas, and other useful information.

Base Bonus: Improves intelligence, detection, reconnaissance, or early warning capabilities.

Possible Specializations

Tracker

Detects enemy activity

Identifies patrol routes

Tracks targets

Provides improved information about nearby threats


Pathfinder

Improves exploration efficiency

Detects alternate routes

Identifies environmental hazards

May reduce stamina costs associated with exploration


Infiltrator

Avoids enemy detection

Detects security systems

Improves stealth-related encounters

Helps teams bypass dangerous encounters



---

Engineer

Primary Role: Technology, systems, and mechanical challenges

Engineers interact with computers, security systems, machinery, traps, explosives, doors, power systems, and other technological obstacles.

Base Bonus: Improves room efficiency, construction, maintenance, or repair capabilities.

Possible Specializations

Hacker

Computer systems

Security bypasses

Data acquisition

Electronic countermeasures


Technician

Repairs

Machinery

Power systems

Equipment operation

Strong general-purpose base assignment


Demolitions

Explosives

Breaching

Sabotage

Trap handling

Destruction of enemy infrastructure



---

Scientist

Primary Role: Research and understanding alien discoveries

Scientists identify and analyze alien technology, artifacts, biological samples, unusual energy signatures, archaeological discoveries, and other scientific phenomena.

Base Bonus: Improves research speed or research-related room performance.

Possible Specializations

Archaeologist

Ancient civilizations

Ruins

Languages

Artifacts

Historical information


Xenobiologist

Alien life

Biological hazards

Samples

Parasites and unusual organisms


Physicist

Energy systems

Stargate phenomena

Advanced technology

Anomalies

Exotic materials



---

Medic

Primary Role: Team survival and mission endurance

Medics help keep units operational during longer missions. Their value should extend beyond simply restoring HP and include injuries, Downed units, biological hazards, status effects, and stamina-related consequences.

Base Bonus: Increases regeneration and recovery rates when assigned to the Infirmary or other medical facilities.

Possible Specializations

Field Medic

Offworld healing

Stabilizing Downed units

Reducing consequences from injuries

Keeping teams operational during missions


Surgeon

Serious injury treatment

Faster base recovery

Improved treatment of critically wounded personnel


Xenomedic

Alien diseases

Toxins

Parasites

Implants

Unusual biological conditions



---

Diplomat

Primary Role: Social encounters, factions, and intelligence

Diplomats provide alternatives to solving problems through combat. They specialize in interactions with friendly, neutral, hostile, and captured characters.

Base Bonus: Improves diplomatic, faction, trade, or intelligence-related base operations.

Possible Specializations

Negotiator

Negotiations

Prisoner exchanges

Trade

Conflict resolution

Improved peaceful encounter outcomes


Intelligence Officer

Interrogation

Deception

Information gathering

Enemy analysis

Extracting useful information from captured enemies


Cultural Specialist

Local customs

Languages

Faction relationships

First-contact situations

Identifying social opportunities and risks



---

Preliminary Class Structure

Class	Primary Offworld Function	Example Base Function	Rough Specializations

Soldier	Combat & Security	Base Defense	Heavy Weapons, Marksman, Commando
Scout	Recon & Exploration	Intelligence / Detection	Tracker, Pathfinder, Infiltrator
Engineer	Technology & Systems	Maintenance / Efficiency	Hacker, Technician, Demolitions
Scientist	Research & Analysis	Research	Archaeologist, Xenobiologist, Physicist
Medic	Survival & Recovery	Infirmary	Field Medic, Surgeon, Xenomedic
Diplomat	Social & Faction Interaction	Diplomacy / Intelligence	Negotiator, Intelligence Officer, Cultural Specialist



---

Base Assignment Philosophy

Every class provides a base class bonus when assigned to an appropriate room.

These bonuses should make personnel assignments meaningful without making it prohibitively expensive to send valuable units offworld.

The player should sometimes face decisions such as:

> Do I leave my best Medic in the Infirmary to improve recovery, or send them with an injured offworld team?



This tension is intentional.

However, base bonuses should not become so powerful that the optimal strategy is to permanently leave the player's strongest units at the base.

Specializations may eventually provide additional bonuses when assigned to particular rooms, allowing units belonging to the same class to have different optimal assignments.


---

Future Design Work

The six classes and eighteen specializations should remain provisional until the surrounding systems are better defined.

Before finalizing them, they should be evaluated against:

1. Offworld encounter types


2. Skill-check mechanics


3. Mission-grid information and detection mechanics


4. Combat roles


5. Downed-state abilities


6. Base rooms and room assignments


7. Base-defense encounters


8. Equipment


9. Character progression


10. Faction interactions



Classes or specializations should be merged, renamed, or replaced if they do not provide enough distinct gameplay across these systems.

The goal is not to create eighteen different jobs simply to fill a class tree. Each specialization should eventually give the player a legitimate reason to think:

> "This mission calls for this specific person."



writing{variant="document" id="61742" title="Unit Classes and Specializations"}
# Unit Classes and Specializations

## Overview

Units are organized using a two-level system:

**Base Class → Specialization**

The game will initially use **6 base classes**, with each class having **3 specializations**.

Base classes define a unit's broad identity both **offworld and at the base**. Specializations provide additional differentiation between units of the same class.

The current classes and specializations are preliminary. Their exact stats, abilities, bonuses, and names will be finalized after the offworld encounter, base-room, and progression systems are more fully defined.

---

## Design Philosophy

The class system should reinforce the core unit-design principle:

> **The right unit at the right time can make all the difference.**

A unit's class determines:

- General offworld role
- Types of encounters the unit is suited to handle
- Basic combat behavior
- Class-specific abilities
- Base assignment bonus
- General progression options

A unit's specialization determines:

- Areas where the unit particularly excels
- Additional encounter options
- Specialized abilities
- Potential secondary base bonuses
- Differences between units belonging to the same class

Specializations should **not** be so narrow that they function as entirely separate classes.

---

# Preliminary Classes

## Soldier

**Primary Role:** Combat and security

Soldiers are the most capable units for missions where significant enemy resistance is expected. They may also be useful for intimidation, breaching, prisoner handling, and identifying dangerous enemy forces.

**Base Bonus:** Improves security and/or defensive capabilities when assigned to appropriate base rooms.

### Possible Specializations

**Heavy Weapons**
- High combat effectiveness
- Suppression
- Area attacks
- Strong against heavily armored enemies

**Marksman**
- Prioritizes dangerous targets
- High accuracy
- Increased effectiveness against elite enemies
- May identify or exploit enemy weaknesses

**Commando**
- Breaching
- Infiltration
- Close-range combat
- Improved performance during sabotage operations

---

## Scout

**Primary Role:** Reconnaissance and exploration

Scouts help the player understand the mission grid before committing to encounters. They specialize in identifying threats, routes, traps, hidden areas, and other useful information.

**Base Bonus:** Improves intelligence, detection, reconnaissance, or early warning capabilities.

### Possible Specializations

**Tracker**
- Detects enemy activity
- Identifies patrol routes
- Tracks targets
- Provides improved information about nearby threats

**Pathfinder**
- Improves exploration efficiency
- Detects alternate routes
- Identifies environmental hazards
- May reduce stamina costs associated with exploration

**Infiltrator**
- Avoids enemy detection
- Detects security systems
- Improves stealth-related encounters
- Helps teams bypass dangerous encounters

---

## Engineer

**Primary Role:** Technology, systems, and mechanical challenges

Engineers interact with computers, security systems, machinery, traps, explosives, doors, power systems, and other technological obstacles.

**Base Bonus:** Improves room efficiency, construction, maintenance, or repair capabilities.

### Possible Specializations

**Hacker**
- Computer systems
- Security bypasses
- Data acquisition
- Electronic countermeasures

**Technician**
- Repairs
- Machinery
- Power systems
- Equipment operation
- Strong general-purpose base assignment

**Demolitions**
- Explosives
- Breaching
- Sabotage
- Trap handling
- Destruction of enemy infrastructure

---

## Scientist

**Primary Role:** Research and understanding alien discoveries

Scientists identify and analyze alien technology, artifacts, biological samples, unusual energy signatures, archaeological discoveries, and other scientific phenomena.

**Base Bonus:** Improves research speed or research-related room performance.

### Possible Specializations

**Archaeologist**
- Ancient civilizations
- Ruins
- Languages
- Artifacts
- Historical information

**Xenobiologist**
- Alien life
- Biological hazards
- Samples
- Parasites and unusual organisms

**Physicist**
- Energy systems
- Stargate phenomena
- Advanced technology
- Anomalies
- Exotic materials

---

## Medic

**Primary Role:** Team survival and mission endurance

Medics help keep units operational during longer missions. Their value should extend beyond simply restoring HP and include injuries, Downed units, biological hazards, status effects, and stamina-related consequences.

**Base Bonus:** Increases regeneration and recovery rates when assigned to the Infirmary or other medical facilities.

### Possible Specializations

**Field Medic**
- Offworld healing
- Stabilizing Downed units
- Reducing consequences from injuries
- Keeping teams operational during missions

**Surgeon**
- Serious injury treatment
- Faster base recovery
- Improved treatment of critically wounded personnel

**Xenomedic**
- Alien diseases
- Toxins
- Parasites
- Implants
- Unusual biological conditions

---

## Diplomat

**Primary Role:** Social encounters, factions, and intelligence

Diplomats provide alternatives to solving problems through combat. They specialize in interactions with friendly, neutral, hostile, and captured characters.

**Base Bonus:** Improves diplomatic, faction, trade, or intelligence-related base operations.

### Possible Specializations

**Negotiator**
- Negotiations
- Prisoner exchanges
- Trade
- Conflict resolution
- Improved peaceful encounter outcomes

**Intelligence Officer**
- Interrogation
- Deception
- Information gathering
- Enemy analysis
- Extracting useful information from captured enemies

**Cultural Specialist**
- Local customs
- Languages
- Faction relationships
- First-contact situations
- Identifying social opportunities and risks

---

# Preliminary Class Structure

| Class | Primary Offworld Function | Example Base Function | Rough Specializations |
|---|---|---|---|
| Soldier | Combat & Security | Base Defense | Heavy Weapons, Marksman, Commando |
| Scout | Recon & Exploration | Intelligence / Detection | Tracker, Pathfinder, Infiltrator |
| Engineer | Technology & Systems | Maintenance / Efficiency | Hacker, Technician, Demolitions |
| Scientist | Research & Analysis | Research | Archaeologist, Xenobiologist, Physicist |
| Medic | Survival & Recovery | Infirmary | Field Medic, Surgeon, Xenomedic |
| Diplomat | Social & Faction Interaction | Diplomacy / Intelligence | Negotiator, Intelligence Officer, Cultural Specialist |

---

## Base Assignment Philosophy

Every class provides a **base class bonus** when assigned to an appropriate room.

These bonuses should make personnel assignments meaningful without making it prohibitively expensive to send valuable units offworld.

The player should sometimes face decisions such as:

> Do I leave my best Medic in the Infirmary to improve recovery, or send them with an injured offworld team?

This tension is intentional.

However, base bonuses should not become so powerful that the optimal strategy is to permanently leave the player's strongest units at the base.

Specializations may eventually provide additional bonuses when assigned to particular rooms, allowing units belonging to the same class to have different optimal assignments.

---

## Future Design Work

The six classes and eighteen specializations should remain **provisional** until the surrounding systems are better defined.

Before finalizing them, they should be evaluated against:

1. Offworld encounter types
2. Skill-check mechanics
3. Mission-grid information and detection mechanics
4. Combat roles
5. Downed-state abilities
6. Base rooms and room assignments
7. Base-defense encounters
8. Equipment
9. Character progression
10. Faction interactions

Classes or specializations should be merged, renamed, or replaced if they do not provide enough distinct gameplay across these systems.

The goal is not to create eighteen different jobs simply to fill a class tree. Each specialization should eventually give the player a legitimate reason to think:

> **"This mission calls for this specific person."**



I agree, with one tweak: I'd keep traits separate from specialization progression. Specialization says what the unit is trained to do. Traits say what makes that particular unit unusual. That prevents every Archaeologist or Field Medic from eventually feeling identical.

Add this section after the class structure:

writing{variant="document" id="34186" title="Unit Traits"}

Unit Traits

In addition to Base Class and Specialization, units have Traits that provide individual personality and mechanical variation.

The complete unit identity becomes:

Base Class → Specialization → Traits

Base Class defines the unit's broad role.

Specialization defines the unit's professional focus.

Traits define what makes the individual unit different from others with similar training.


Traits should provide flavor while also gently nudging units toward particular roles, assignments, mission types, or playstyles.

They should generally influence a unit rather than redefine them.

For example, two units could both be:

> Scientist → Archaeologist



but have very different traits.

Unit A

Ancient Linguist

Curious

Academic


Unit B

Treasure Hunter

Cautious

Goa'uld Expert


Both units fulfill the same fundamental Archaeologist role, but the player may prefer one depending on the mission.


---

Class-Specific Traits

Each Base Class should have access to a pool of class-specific traits.

These traits reinforce the identity of the class while creating variation within it.

Possible rough examples include:

Soldier

Intimidating

Weapons Expert

Tough

Protector

Combat Veteran


Scout

Treasure Hunter

Trap Sense

Observant

Survivalist

Stealthy


Engineer

Tinkerer

Security Expert

Improviser

Explosives Expert

Efficient


Scientist

Ancient Linguist

Goa'uld Expert

Curious

Analytical

Artifact Expert


Medic

Combat Responder

Trauma Specialist

Calm Under Pressure

Careful

Alien Anatomy Expert


Diplomat

Charismatic

Deceptive

Empathetic

Intimidating

Cultural Expert


These are preliminary examples rather than a finalized trait list.


---

Traits Can Nudge Specialization

Traits may make a unit naturally better suited to certain specializations without forcing the player into that choice.

For example:

> Engineer
Trait: Explosives Expert



naturally suggests the Demolitions specialization.

However, the player could still develop that unit as a Hacker. The result would be a Hacker who retains an unusual advantage during explosives-related encounters.

This allows imperfect or unconventional combinations to produce interesting units rather than being considered mistakes.


---

Traits Can Affect Multiple Systems

Traits should not be limited to numerical stat bonuses.

They may affect:

Offworld skill checks

Information revealed on mission tiles

Combat behavior

Special abilities

Stamina consumption

Downed-state behavior

Base-room performance

Base-defense events

Faction interactions

Prisoner interactions

Exploration

Loot

Research

Character relationships

Encounter options


Some traits may even provide entirely new actions or information rather than increasing a number.

For example:

Treasure Hunter
May identify unexplored tiles likely to contain valuable loot.

Ancient Linguist
Provides additional options when encountering Ancient writing or technology.

Intimidating
Improves Intimidate actions against Downed enemies.

Calm Under Pressure
Reduces penalties when other team members are Downed.

Security Expert
May identify traps or security systems before entering a tile.

This makes traits something the player actively considers during team selection rather than simply another collection of percentage bonuses.


---

Positive Traits Should Still Create Decisions

Traits do not necessarily need to make a unit universally stronger.

Ideally, many traits create situational advantages.

A Treasure Hunter is valuable when searching ruins but may provide little benefit during a direct military assault.

An Alien Anatomy Expert may be extremely useful against biological threats while offering no special advantage when hacking a Goa'uld computer.

This supports the central unit-design philosophy:

> The right unit at the right time can make all the difference.




---

Potential Trait Sources

The final progression system may allow traits to come from several sources:

Innate traits when the unit is recruited

Class-specific trait pools

Mission experiences

Training

Major successes or failures

Injuries

Encounters with alien technology

Faction relationships

Story events


Not every trait needs to be chosen by the player.

Allowing units to acquire some traits through their experiences can create memorable characters and make two otherwise similar recruits develop differently over time.

The exact rules for gaining, replacing, improving, or limiting traits should be determined when the broader unit progression system is designed.

writing{variant="document" id="34186" title="Unit Traits"}
## Unit Traits

In addition to Base Class and Specialization, units have **Traits** that provide individual personality and mechanical variation.

The complete unit identity becomes:

**Base Class → Specialization → Traits**

- **Base Class** defines the unit's broad role.
- **Specialization** defines the unit's professional focus.
- **Traits** define what makes the individual unit different from others with similar training.

Traits should provide flavor while also gently nudging units toward particular roles, assignments, mission types, or playstyles.

They should generally **influence a unit rather than redefine them**.

For example, two units could both be:

> **Scientist → Archaeologist**

but have very different traits.

**Unit A**
- Ancient Linguist
- Curious
- Academic

**Unit B**
- Treasure Hunter
- Cautious
- Goa'uld Expert

Both units fulfill the same fundamental Archaeologist role, but the player may prefer one depending on the mission.

---

### Class-Specific Traits

Each Base Class should have access to a pool of **class-specific traits**.

These traits reinforce the identity of the class while creating variation within it.

Possible rough examples include:

**Soldier**
- Intimidating
- Weapons Expert
- Tough
- Protector
- Combat Veteran

**Scout**
- Treasure Hunter
- Trap Sense
- Observant
- Survivalist
- Stealthy

**Engineer**
- Tinkerer
- Security Expert
- Improviser
- Explosives Expert
- Efficient

**Scientist**
- Ancient Linguist
- Goa'uld Expert
- Curious
- Analytical
- Artifact Expert

**Medic**
- Combat Responder
- Trauma Specialist
- Calm Under Pressure
- Careful
- Alien Anatomy Expert

**Diplomat**
- Charismatic
- Deceptive
- Empathetic
- Intimidating
- Cultural Expert

These are preliminary examples rather than a finalized trait list.

---

### Traits Can Nudge Specialization

Traits may make a unit naturally better suited to certain specializations without forcing the player into that choice.

For example:

> **Engineer**  
> Trait: Explosives Expert

naturally suggests the **Demolitions** specialization.

However, the player could still develop that unit as a Hacker. The result would be a Hacker who retains an unusual advantage during explosives-related encounters.

This allows imperfect or unconventional combinations to produce interesting units rather than being considered mistakes.

---

### Traits Can Affect Multiple Systems

Traits should not be limited to numerical stat bonuses.

They may affect:

- Offworld skill checks
- Information revealed on mission tiles
- Combat behavior
- Special abilities
- Stamina consumption
- Downed-state behavior
- Base-room performance
- Base-defense events
- Faction interactions
- Prisoner interactions
- Exploration
- Loot
- Research
- Character relationships
- Encounter options

Some traits may even provide entirely new actions or information rather than increasing a number.

For example:

**Treasure Hunter**  
May identify unexplored tiles likely to contain valuable loot.

**Ancient Linguist**  
Provides additional options when encountering Ancient writing or technology.

**Intimidating**  
Improves Intimidate actions against Downed enemies.

**Calm Under Pressure**  
Reduces penalties when other team members are Downed.

**Security Expert**  
May identify traps or security systems before entering a tile.

This makes traits something the player actively considers during team selection rather than simply another collection of percentage bonuses.

---

### Positive Traits Should Still Create Decisions

Traits do not necessarily need to make a unit universally stronger.

Ideally, many traits create **situational advantages**.

A Treasure Hunter is valuable when searching ruins but may provide little benefit during a direct military assault.

An Alien Anatomy Expert may be extremely useful against biological threats while offering no special advantage when hacking a Goa'uld computer.

This supports the central unit-design philosophy:

> **The right unit at the right time can make all the difference.**

---

### Potential Trait Sources

The final progression system may allow traits to come from several sources:

- Innate traits when the unit is recruited
- Class-specific trait pools
- Mission experiences
- Training
- Major successes or failures
- Injuries
- Encounters with alien technology
- Faction relationships
- Story events

Not every trait needs to be chosen by the player.

Allowing units to acquire some traits through their experiences can create memorable characters and make two otherwise similar recruits develop differently over time.

The exact rules for gaining, replacing, improving, or limiting traits should be determined when the broader unit progression system is designed.


writing{variant="document" id="52841" title="Base Design and Room Systems"}

Base Design and Room Systems

Base Design Philosophy

The base is not simply a collection of resource generators and upgrade timers. It is a strategic system built around three major dimensions:

Room Technology

Research provides vertical progression, improving what a room can accomplish without increasing its physical size.

For example:

Coal Power Generation → Advanced Power Generation → Nuclear Power Generation

A vertically upgraded Power Generation room produces more power while occupying the same amount of base space.

Room Size

Rooms provide horizontal progression by allowing up to three identical rooms placed next to one another to merge into a larger complex.

A larger room:

Acts as a single facility.

Provides additional staffing slots.

Can operate with fewer personnel at reduced efficiency and increased risk.

Gains additional benefits from higher staffing levels.

May unlock staffing thresholds that provide special room traits.


For example, a three-wide Power Generation complex might technically operate with one Engineer, while additional personnel provide benefits such as:

Increased power output.

Reduced incident chance.

Reduced worker stamina consumption.

Increased operating efficiency.


Room Personnel

The classes and specializations assigned to a room influence how the room behaves.

Personnel should provide more than simple percentage increases.

Different classes may:

Change event outcomes.

Reveal additional information.

Provide unique room effects.

Reduce particular risks.

Create new opportunities.

Change how the room interacts with other systems.


Two bases with identical layouts and technology may therefore operate very differently depending on how they are staffed.


---

SGC Level

The player's SGC Level controls the overall growth of the base.

SGC Level may determine:

Available room types.

Maximum number of specific rooms.

Maximum base size.

Access to advanced systems.

Maximum personnel capacity.

Other strategic limitations.


For example:

Diplomacy may not become available until SGC Level 3.

The player may initially be limited to a single Power Generation room.

Additional Power Generation rooms may become available at later SGC levels.

A third Power Generation room might not become available until SGC Level 8.


SGC progression should encourage the player to build a balanced and manageable base rather than immediately filling the base with the most mathematically efficient room.


---

Room Staffing

Rooms initially contain one personnel slot.

Additional staffing capacity is unlocked through research and horizontal expansion.

Rooms should be capable of operating while understaffed, but doing so may cause:

Reduced efficiency.

Increased incident chance.

Increased stamina consumption.

Loss of advanced room traits.


Higher staffing levels can unlock additional room-specific bonuses.

Personnel assigned to rooms consume stamina while working.

If a unit reaches 0 Stamina while working, they are automatically removed from their assignment and sent to the nearest available Living Quarters.

This makes personnel availability and base layout part of base management.


---

Power System

Rooms consume Power while operating.

Power Generation rooms establish the base's available power capacity.

If total consumption exceeds capacity, the base automatically begins shutting down rooms.

Distance from Power Generation determines priority.

Rooms farther from the nearest available power source lose power first.

When multiple rooms are the same distance from available Power Generation, power cycles between them at regular intervals.

This makes the physical location of Power Generation and high-priority facilities strategically important.


---

Strategic Resources

The base currently manages four primary resources.

Rations

Represents food and water required by the base and offworld operations.

Sources

Food/Water Production

Offworld missions

Trade

Events


Uses

Personnel support

Mission preparation

Trade

Other base systems


Rations can be generated internally or acquired externally, allowing different economic strategies.


---

Materials

Represents materials used primarily for equipment and technical applications.

Sources

Mission recovery

Equipment salvage

Trade

Events


Materials are not produced by a dedicated base production room.

They must be recovered, salvaged, or acquired through trade.


---

Supplies

Represents construction and infrastructure resources.

Sources

Supplies are primarily harvested from secured offworld resource nodes.

When a Stargate address containing a Supply Node has been identified and secured, that location can automatically provide Supplies while the player maintains control.

The detailed resource-node system will be designed separately.

Supply production does not require a base production room.


---

Artifacts

Artifacts operate differently from normal resources.

They represent unidentified objects recovered during missions.

An unidentified Artifact receives a generic designation based on its origin.

For example:

> P342-A
Unknown Artifact
Origin: P3X-342



Artifacts occupy limited storage capacity until analyzed.

This creates an intentional strategic question:

> Do I keep what I already have, or give something up to make room for a new discovery?



Artifacts may also become relevant before being analyzed.

Factions may:

Request a specific unidentified Artifact.

Offer resources for an Artifact.

Offer reputation for an Artifact.

Offer information about an Artifact.

Provide intelligence regarding its origin.

Warn the player about potential dangers.

Compete with another faction for possession of it.


The player therefore does not necessarily need to know what an Artifact does before it becomes strategically valuable.


---

Artifact Analysis

The base may contain only one Artifact Analysis facility.

Artifact Analysis identifies unknown Artifacts.

Once analysis is complete, the generic Artifact is consumed and its actual result is revealed.

Possible outcomes include:

Unlock new research.

Reveal a Stargate address.

Provide faction intelligence.

Produce unique equipment.

Reveal enemy information.

Create a faction opportunity.

Produce Materials.

Trigger a story event.

Reveal a dangerous property.

Trigger a base incident.


More personnel assigned to Artifact Analysis reduce analysis time.

The classes assigned to the room also influence the analysis process.

Soldier

May:

Detect weapon systems.

Recognize hostile activation.

Reduce danger from weaponized Artifacts.


Scout

May:

Identify origin clues.

Detect concealed compartments.

Recognize hidden functions.


Engineer

May:

Detect technological traps.

Identify mechanical functions.

Improve analysis of technological systems.


Scientist

May:

Increase analysis speed.

Improve identification of research applications.

Reveal additional scientific information.


Medic

May:

Detect toxins.

Detect biological agents.

Identify parasites or pathogens.

Recognize medical applications.


Diplomat

May:

Identify cultural significance.

Recognize faction interest.

Improve estimates of diplomatic or trade value.


The Artifact already possesses its underlying properties. Staffing does not change what the Artifact is.

Instead, staffing changes the player's ability to identify opportunities and detect dangers before they become consequences.


---

Production and Storage

Production rooms contain some internal storage.

Dedicated Storage rooms allow the player to substantially increase resource capacity.

This creates multiple viable economic strategies.

A player might build significant Food/Water Production and generate Rations for trade.

Another player might rely heavily on offworld expeditions and trade while constructing more storage to accommodate large resource hauls.

Production and Storage rooms should also generate different categories of base events.

Production Events

Examples include:

Contamination

Equipment malfunction

Worker injury

Crop disease

Water-system failure

Increased production

Experimental production methods


Storage Events

Examples include:

Spoilage

Infestation

Theft

Inventory discrepancies

Fire

Damaged resources

Unexpected reactions involving stored materials


Increasing capacity therefore creates different risks than increasing production.


---

Gate Room

The Gate Room is the primary entrance and exit for the base.

It controls:

SG team departures.

SG team returns.

Incoming Stargate activity.

Hostile gate incursions.

Certain faction interactions.

Gate-related events.


Personnel assigned to the Gate Room have a significant effect on events occurring through the Stargate.

Example Class Effects

Soldier

Hostile gate incursions suffer initial damage.

Improved immediate defensive response.


Medic

Damaged SG teams receive immediate healing when returning.


Diplomat

Increased chance of favorable faction interactions.

Potential access to favored trades.


Engineer

Improved response to Gate malfunctions.

Potential improvements to Gate efficiency or power usage.


Scientist

Better identification of unusual Gate phenomena.

Additional information from anomalous incoming activity.


Scout

Improved warning of unexpected activity.

Better identification of potential threats.


Gate Room staffing should therefore reflect what the player expects or fears may happen next.


---

Logistics

Logistics serves as the operational center for SG teams.

It handles:

SG team organization.

Mission preparation.

Probe interpretation.

Reconnaissance information.

Offworld operational planning.


The probe collects raw information about an offworld location.

Personnel assigned to Logistics determine how much of that information the player can successfully interpret before selecting an SG team.

For example, a raw probe result might contain:

Enemy Captain

Two Hacking Nodes

Artifact Signature

Prisoners

Heavy Resistance


The player does not necessarily receive all of this information.

Soldier

May convert:

> Enemies Present



into:

> Enemy Captain Present



Soldiers improve interpretation of military threats and enemy composition.

Engineer

May convert:

> Sabotage Opportunity



into:

> 2 Hacking Nodes Detected



Engineers improve technical and infrastructure intelligence.

Scientist

May convert:

> Unusual Reading



into:

> Possible Artifact



Scientists improve scientific and anomaly information.

Scout

May reveal:

Patrol routes.

Enemy movement.

Environmental dangers.

Exploration information.


Diplomat

May reveal:

Faction presence.

Important NPCs.

Potential negotiation opportunities.


Medic

May reveal:

Biological hazards.

Medical emergencies.

Disease or toxin risks.

Potential injured or endangered populations.


Logistics staffing directly affects the information available during team selection without directly changing the contents of the mission.


---

Living Quarters

Living Quarters determine:

Maximum SGC personnel capacity.

Passive stamina regeneration.

Recovery from exhaustion.

Available locations for exhausted personnel.


Stamina represents fatigue and should generally be a more common limitation than HP damage.

When a unit reaches 0 Stamina while working in the base, they are automatically removed from duty and sent to the nearest available Living Quarters.

Medic Staffing

Medics assigned to Living Quarters increase stamina regeneration.

This gives Medics an important alternative assignment to the Infirmary.

Living Quarter quantity, quality, staffing, and physical placement determine how quickly personnel can return to active duty.


---

Infirmary

The Infirmary handles HP and injury recovery, while Living Quarters handle Stamina.

The Infirmary is used for:

Restoring HP between missions.

Treating injuries.

Recovering severely wounded personnel.

Potentially treating diseases, toxins, parasites, and other conditions.


Medics are naturally the primary class associated with the Infirmary.


---

Containment

Containment is used for entities that cannot reasonably be stored in normal Holding Cells.

Examples include:

Large alien animals.

Alien plants.

Biological specimens.

Dangerous organisms.

Large bounty targets.

Mission-specific creatures.


A mission may require available Containment capacity before a capture objective can be completed.

For example:

> Capture the Demon Shell



After capture, contained entities may eventually be:

Studied.

Traded.

Released.

Exchanged for rewards.

Processed into Rations.

Processed into Materials.

Used for another mission or objective.


Containment capacity therefore affects which capture and bounty opportunities the player can pursue.


---

Holding Cells

Holding Cells store intelligent prisoners captured during missions.

Examples include:

Enemy soldiers.

Officers.

Bosses.

Spies.

Hostile faction personnel.


Holding capacity is deliberately limited.

The player must decide when to:

Keep prisoners.

Interrogate them.

Trade them.

Exchange them.

Release them.

Execute them.


Available capacity also affects offworld decisions.

If Holding Cells are nearly full, the player may be unable to capture additional enemies during the current mission.

This gives prisoner capture a logistical cost and prevents capture from always being the automatically correct choice.


---

Promotion Room

The Promotion Room handles specialization advancement.

Promotion requires both:

1. The unit being promoted.


2. Qualified personnel capable of supervising the promotion.



All participating personnel are unavailable for other assignments or missions while promotion is occurring.

For example, promoting a Medic to Rank 3 might require:

1 Rank 4 Medic, or

2 Rank 3 Medics, or

4 Rank 2 Medics.


The exact requirements will be determined with the progression system.

Horizontal Progression

Larger Promotion facilities provide additional staffing slots.

Additional slots allow several lower-ranked personnel to collectively fulfill supervision requirements.

Vertical Progression

Research improvements may:

Reduce promotion time.

Improve training efficiency.

Reduce required supervisor ranks.

Provide other promotion advantages.


This creates a strategic cost to progression because experienced personnel must temporarily be removed from normal duties.


---

Trade Post

The Trade Post allows the base to exchange resources with factions.

Trade is based on throughput and actual faction demand, rather than fixed resource-conversion buttons.

The Trade Post determines how many resources can be exchanged over a given period.

Player-Posted Trades

The player may post an offer such as:

> Offering: 100 Rations
Requesting: 50 Materials



Factions may choose to fulfill the request.

The likelihood, speed, and terms of the trade can depend on:

Faction reputation.

Current faction needs.

Resource availability.

Diplomatic relationships.

Current events.


Faction-Posted Trades

Factions may also post their own offers.

For example:

> Faction Trade Offer
Requested: 75 Materials
Offered: 40 Supplies



The player may choose whether to fulfill the trade.

Some trades may require personnel or an SG team to complete.

Dynamic Trade Conditions

Faction circumstances affect resource values.

Examples include:

A faction experiencing food shortages values Rations more highly.

A faction preparing for war demands Materials.

An industrial faction may have excess Supplies.

Political events may temporarily restrict certain trades.


Diplomatic relationships affect the terms offered to the player.


---

Recruitment Office

The Recruitment Office allows the player to influence the types of personnel available for acquisition.

Its purpose is to give the player agency when attempting to fill specific roster needs.

For example:

> SG-5 needs another Soldier.



The player may direct recruitment efforts toward military personnel rather than waiting entirely on random recruitment opportunities.

Possible recruitment priorities include:

Soldiers

Scouts

Engineers

Scientists

Medics

Diplomats


Room progression may eventually affect:

Number of candidates.

Candidate quality.

Recruitment refresh time.

Visibility of specialization information.

Visibility of traits.

Ability to target particular classes or backgrounds.



---

Current Room List

Infrastructure and Economy

Power Generation

Food/Water Production

Rations Storage

Materials Storage

Supply Storage

Living Quarters


Stargate Operations

Gate Room

Logistics


Personnel

Recruitment Office

Infirmary

Promotion Room


Science and Engineering

Research Lab

Workshop / Armory

Artifact Analysis


Captures and Prisoners

Containment

Holding Cells


Strategic Operations

Diplomacy

Trade Post



---

Core Room Design Rule

Important rooms should be evaluated across three dimensions:

> Technology + Size + Personnel



Technology determines what the room is capable of doing.

Size determines capacity, staffing, throughput, and potential staffing thresholds.

Personnel determine how the room actually behaves.

The goal is for personnel assignment to be a major part of base strategy rather than simply placing the class with the largest numerical production bonus into the obvious room.

The same facility should support different strategies depending on who works there.

This extends the game's central unit philosophy from offworld missions into base management:

> The right unit at the right time can make all the difference.



writing{variant="document" id="52841" title="Base Design and Room Systems"}
# Base Design and Room Systems

## Base Design Philosophy

The base is not simply a collection of resource generators and upgrade timers. It is a strategic system built around three major dimensions:

### Room Technology

Research provides **vertical progression**, improving what a room can accomplish without increasing its physical size.

For example:

**Coal Power Generation → Advanced Power Generation → Nuclear Power Generation**

A vertically upgraded Power Generation room produces more power while occupying the same amount of base space.

### Room Size

Rooms provide **horizontal progression** by allowing up to three identical rooms placed next to one another to merge into a larger complex.

A larger room:

- Acts as a single facility.
- Provides additional staffing slots.
- Can operate with fewer personnel at reduced efficiency and increased risk.
- Gains additional benefits from higher staffing levels.
- May unlock staffing thresholds that provide special room traits.

For example, a three-wide Power Generation complex might technically operate with one Engineer, while additional personnel provide benefits such as:

- Increased power output.
- Reduced incident chance.
- Reduced worker stamina consumption.
- Increased operating efficiency.

### Room Personnel

The classes and specializations assigned to a room influence **how the room behaves**.

Personnel should provide more than simple percentage increases.

Different classes may:

- Change event outcomes.
- Reveal additional information.
- Provide unique room effects.
- Reduce particular risks.
- Create new opportunities.
- Change how the room interacts with other systems.

Two bases with identical layouts and technology may therefore operate very differently depending on how they are staffed.

---

# SGC Level

The player's **SGC Level** controls the overall growth of the base.

SGC Level may determine:

- Available room types.
- Maximum number of specific rooms.
- Maximum base size.
- Access to advanced systems.
- Maximum personnel capacity.
- Other strategic limitations.

For example:

- Diplomacy may not become available until SGC Level 3.
- The player may initially be limited to a single Power Generation room.
- Additional Power Generation rooms may become available at later SGC levels.
- A third Power Generation room might not become available until SGC Level 8.

SGC progression should encourage the player to build a **balanced and manageable base** rather than immediately filling the base with the most mathematically efficient room.

---

# Room Staffing

Rooms initially contain **one personnel slot**.

Additional staffing capacity is unlocked through research and horizontal expansion.

Rooms should be capable of operating while understaffed, but doing so may cause:

- Reduced efficiency.
- Increased incident chance.
- Increased stamina consumption.
- Loss of advanced room traits.

Higher staffing levels can unlock additional room-specific bonuses.

Personnel assigned to rooms consume stamina while working.

If a unit reaches **0 Stamina while working**, they are automatically removed from their assignment and sent to the nearest available Living Quarters.

This makes personnel availability and base layout part of base management.

---

# Power System

Rooms consume Power while operating.

Power Generation rooms establish the base's available power capacity.

If total consumption exceeds capacity, the base automatically begins shutting down rooms.

Distance from Power Generation determines priority.

Rooms farther from the nearest available power source lose power first.

When multiple rooms are the same distance from available Power Generation, power cycles between them at regular intervals.

This makes the physical location of Power Generation and high-priority facilities strategically important.

---

# Strategic Resources

The base currently manages four primary resources.

## Rations

Represents food and water required by the base and offworld operations.

### Sources

- Food/Water Production
- Offworld missions
- Trade
- Events

### Uses

- Personnel support
- Mission preparation
- Trade
- Other base systems

Rations can be generated internally or acquired externally, allowing different economic strategies.

---

## Materials

Represents materials used primarily for equipment and technical applications.

### Sources

- Mission recovery
- Equipment salvage
- Trade
- Events

Materials are **not produced by a dedicated base production room**.

They must be recovered, salvaged, or acquired through trade.

---

## Supplies

Represents construction and infrastructure resources.

### Sources

Supplies are primarily harvested from **secured offworld resource nodes**.

When a Stargate address containing a Supply Node has been identified and secured, that location can automatically provide Supplies while the player maintains control.

The detailed resource-node system will be designed separately.

Supply production does not require a base production room.

---

# Artifacts

Artifacts operate differently from normal resources.

They represent unidentified objects recovered during missions.

An unidentified Artifact receives a generic designation based on its origin.

For example:

> **P342-A**  
> Unknown Artifact  
> Origin: P3X-342

Artifacts occupy limited storage capacity until analyzed.

This creates an intentional strategic question:

> **Do I keep what I already have, or give something up to make room for a new discovery?**

Artifacts may also become relevant before being analyzed.

Factions may:

- Request a specific unidentified Artifact.
- Offer resources for an Artifact.
- Offer reputation for an Artifact.
- Offer information about an Artifact.
- Provide intelligence regarding its origin.
- Warn the player about potential dangers.
- Compete with another faction for possession of it.

The player therefore does not necessarily need to know what an Artifact does before it becomes strategically valuable.

---

# Artifact Analysis

The base may contain only **one Artifact Analysis facility**.

Artifact Analysis identifies unknown Artifacts.

Once analysis is complete, the generic Artifact is consumed and its actual result is revealed.

Possible outcomes include:

- Unlock new research.
- Reveal a Stargate address.
- Provide faction intelligence.
- Produce unique equipment.
- Reveal enemy information.
- Create a faction opportunity.
- Produce Materials.
- Trigger a story event.
- Reveal a dangerous property.
- Trigger a base incident.

More personnel assigned to Artifact Analysis reduce analysis time.

The **classes assigned to the room also influence the analysis process**.

### Soldier

May:

- Detect weapon systems.
- Recognize hostile activation.
- Reduce danger from weaponized Artifacts.

### Scout

May:

- Identify origin clues.
- Detect concealed compartments.
- Recognize hidden functions.

### Engineer

May:

- Detect technological traps.
- Identify mechanical functions.
- Improve analysis of technological systems.

### Scientist

May:

- Increase analysis speed.
- Improve identification of research applications.
- Reveal additional scientific information.

### Medic

May:

- Detect toxins.
- Detect biological agents.
- Identify parasites or pathogens.
- Recognize medical applications.

### Diplomat

May:

- Identify cultural significance.
- Recognize faction interest.
- Improve estimates of diplomatic or trade value.

The Artifact already possesses its underlying properties. Staffing does not change what the Artifact is.

Instead, staffing changes the player's ability to **identify opportunities and detect dangers before they become consequences**.

---

# Production and Storage

Production rooms contain some internal storage.

Dedicated Storage rooms allow the player to substantially increase resource capacity.

This creates multiple viable economic strategies.

A player might build significant Food/Water Production and generate Rations for trade.

Another player might rely heavily on offworld expeditions and trade while constructing more storage to accommodate large resource hauls.

Production and Storage rooms should also generate **different categories of base events**.

### Production Events

Examples include:

- Contamination
- Equipment malfunction
- Worker injury
- Crop disease
- Water-system failure
- Increased production
- Experimental production methods

### Storage Events

Examples include:

- Spoilage
- Infestation
- Theft
- Inventory discrepancies
- Fire
- Damaged resources
- Unexpected reactions involving stored materials

Increasing capacity therefore creates different risks than increasing production.

---

# Gate Room

The Gate Room is the primary entrance and exit for the base.

It controls:

- SG team departures.
- SG team returns.
- Incoming Stargate activity.
- Hostile gate incursions.
- Certain faction interactions.
- Gate-related events.

Personnel assigned to the Gate Room have a significant effect on events occurring through the Stargate.

### Example Class Effects

**Soldier**
- Hostile gate incursions suffer initial damage.
- Improved immediate defensive response.

**Medic**
- Damaged SG teams receive immediate healing when returning.

**Diplomat**
- Increased chance of favorable faction interactions.
- Potential access to favored trades.

**Engineer**
- Improved response to Gate malfunctions.
- Potential improvements to Gate efficiency or power usage.

**Scientist**
- Better identification of unusual Gate phenomena.
- Additional information from anomalous incoming activity.

**Scout**
- Improved warning of unexpected activity.
- Better identification of potential threats.

Gate Room staffing should therefore reflect what the player expects or fears may happen next.

---

# Logistics

Logistics serves as the operational center for SG teams.

It handles:

- SG team organization.
- Mission preparation.
- Probe interpretation.
- Reconnaissance information.
- Offworld operational planning.

The probe collects **raw information** about an offworld location.

Personnel assigned to Logistics determine how much of that information the player can successfully interpret before selecting an SG team.

For example, a raw probe result might contain:

- Enemy Captain
- Two Hacking Nodes
- Artifact Signature
- Prisoners
- Heavy Resistance

The player does not necessarily receive all of this information.

### Soldier

May convert:

> Enemies Present

into:

> Enemy Captain Present

Soldiers improve interpretation of military threats and enemy composition.

### Engineer

May convert:

> Sabotage Opportunity

into:

> 2 Hacking Nodes Detected

Engineers improve technical and infrastructure intelligence.

### Scientist

May convert:

> Unusual Reading

into:

> Possible Artifact

Scientists improve scientific and anomaly information.

### Scout

May reveal:

- Patrol routes.
- Enemy movement.
- Environmental dangers.
- Exploration information.

### Diplomat

May reveal:

- Faction presence.
- Important NPCs.
- Potential negotiation opportunities.

### Medic

May reveal:

- Biological hazards.
- Medical emergencies.
- Disease or toxin risks.
- Potential injured or endangered populations.

Logistics staffing directly affects the information available during **team selection** without directly changing the contents of the mission.

---

# Living Quarters

Living Quarters determine:

- Maximum SGC personnel capacity.
- Passive stamina regeneration.
- Recovery from exhaustion.
- Available locations for exhausted personnel.

Stamina represents fatigue and should generally be a more common limitation than HP damage.

When a unit reaches 0 Stamina while working in the base, they are automatically removed from duty and sent to the nearest available Living Quarters.

### Medic Staffing

Medics assigned to Living Quarters increase stamina regeneration.

This gives Medics an important alternative assignment to the Infirmary.

Living Quarter quantity, quality, staffing, and physical placement determine how quickly personnel can return to active duty.

---

# Infirmary

The Infirmary handles **HP and injury recovery**, while Living Quarters handle Stamina.

The Infirmary is used for:

- Restoring HP between missions.
- Treating injuries.
- Recovering severely wounded personnel.
- Potentially treating diseases, toxins, parasites, and other conditions.

Medics are naturally the primary class associated with the Infirmary.

---

# Containment

Containment is used for entities that cannot reasonably be stored in normal Holding Cells.

Examples include:

- Large alien animals.
- Alien plants.
- Biological specimens.
- Dangerous organisms.
- Large bounty targets.
- Mission-specific creatures.

A mission may require available Containment capacity before a capture objective can be completed.

For example:

> **Capture the Demon Shell**

After capture, contained entities may eventually be:

- Studied.
- Traded.
- Released.
- Exchanged for rewards.
- Processed into Rations.
- Processed into Materials.
- Used for another mission or objective.

Containment capacity therefore affects which capture and bounty opportunities the player can pursue.

---

# Holding Cells

Holding Cells store intelligent prisoners captured during missions.

Examples include:

- Enemy soldiers.
- Officers.
- Bosses.
- Spies.
- Hostile faction personnel.

Holding capacity is deliberately limited.

The player must decide when to:

- Keep prisoners.
- Interrogate them.
- Trade them.
- Exchange them.
- Release them.
- Execute them.

Available capacity also affects offworld decisions.

If Holding Cells are nearly full, the player may be unable to capture additional enemies during the current mission.

This gives prisoner capture a logistical cost and prevents capture from always being the automatically correct choice.

---

# Promotion Room

The Promotion Room handles specialization advancement.

Promotion requires both:

1. The unit being promoted.
2. Qualified personnel capable of supervising the promotion.

All participating personnel are unavailable for other assignments or missions while promotion is occurring.

For example, promoting a Medic to Rank 3 might require:

- 1 Rank 4 Medic, **or**
- 2 Rank 3 Medics, **or**
- 4 Rank 2 Medics.

The exact requirements will be determined with the progression system.

### Horizontal Progression

Larger Promotion facilities provide additional staffing slots.

Additional slots allow several lower-ranked personnel to collectively fulfill supervision requirements.

### Vertical Progression

Research improvements may:

- Reduce promotion time.
- Improve training efficiency.
- Reduce required supervisor ranks.
- Provide other promotion advantages.

This creates a strategic cost to progression because experienced personnel must temporarily be removed from normal duties.

---

# Trade Post

The Trade Post allows the base to exchange resources with factions.

Trade is based on **throughput and actual faction demand**, rather than fixed resource-conversion buttons.

The Trade Post determines how many resources can be exchanged over a given period.

## Player-Posted Trades

The player may post an offer such as:

> **Offering:** 100 Rations  
> **Requesting:** 50 Materials

Factions may choose to fulfill the request.

The likelihood, speed, and terms of the trade can depend on:

- Faction reputation.
- Current faction needs.
- Resource availability.
- Diplomatic relationships.
- Current events.

## Faction-Posted Trades

Factions may also post their own offers.

For example:

> **Faction Trade Offer**  
> Requested: 75 Materials  
> Offered: 40 Supplies

The player may choose whether to fulfill the trade.

Some trades may require personnel or an SG team to complete.

## Dynamic Trade Conditions

Faction circumstances affect resource values.

Examples include:

- A faction experiencing food shortages values Rations more highly.
- A faction preparing for war demands Materials.
- An industrial faction may have excess Supplies.
- Political events may temporarily restrict certain trades.

Diplomatic relationships affect the terms offered to the player.

---

# Recruitment Office

The Recruitment Office allows the player to influence the types of personnel available for acquisition.

Its purpose is to give the player agency when attempting to fill specific roster needs.

For example:

> SG-5 needs another Soldier.

The player may direct recruitment efforts toward military personnel rather than waiting entirely on random recruitment opportunities.

Possible recruitment priorities include:

- Soldiers
- Scouts
- Engineers
- Scientists
- Medics
- Diplomats

Room progression may eventually affect:

- Number of candidates.
- Candidate quality.
- Recruitment refresh time.
- Visibility of specialization information.
- Visibility of traits.
- Ability to target particular classes or backgrounds.

---

# Current Room List

## Infrastructure and Economy

- Power Generation
- Food/Water Production
- Rations Storage
- Materials Storage
- Supply Storage
- Living Quarters

## Stargate Operations

- Gate Room
- Logistics

## Personnel

- Recruitment Office
- Infirmary
- Promotion Room

## Science and Engineering

- Research Lab
- Workshop / Armory
- Artifact Analysis

## Captures and Prisoners

- Containment
- Holding Cells

## Strategic Operations

- Diplomacy
- Trade Post

---

# Core Room Design Rule

Important rooms should be evaluated across three dimensions:

> **Technology + Size + Personnel**

**Technology** determines what the room is capable of doing.

**Size** determines capacity, staffing, throughput, and potential staffing thresholds.

**Personnel** determine how the room actually behaves.

The goal is for personnel assignment to be a major part of base strategy rather than simply placing the class with the largest numerical production bonus into the obvious room.

The same facility should support different strategies depending on who works there.

This extends the game's central unit philosophy from offworld missions into base management:

> **The right unit at the right time can make all the difference.**

writing{variant="document" id="71426" title="Offworld Mission Archetypes"}

Offworld Mission Archetypes

Overview

Offworld missions are built from a relatively small set of reusable Mission Archetypes rather than a large collection of individually scripted mission types.

Mission variety comes from combining:

Mission Source → Situation → Goal → Approach → Archetype(s) → Objectives → Tile Encounters

Multiple archetypes may be combined within a single mission.

For example:

Infiltrate + Recover = Research heist

Assault + Capture = Raid to capture an enemy commander

Explore + Investigate = Investigation of an unknown world

Diplomatic + Recover = Negotiate for technology

Secure + Investigate = Establish control over a newly identified resource site



---

Mission Sources

Mission opportunities can originate from several systems.

World Sources

Persistent locations and strategic assets may generate missions:

Newly discovered Stargate addresses

Faction Havens

Supply Nodes

Other controlled or known strategic locations


Base Sources

Activities within the SGC may generate missions:

Gate Room events

Logistics

Diplomacy

Artifact Analysis

Prisoners

Research

Trade

Containment

Player requests for particular opportunities


Rooms that generate a mission display a Mission Available indicator.

All available missions are also accessible through Logistics, preventing the player from needing to search individual rooms for available operations.

Consequence Sources

Previous gameplay can create new missions:

Previous mission outcomes

Captured SG teams

Faction retaliation

Failed objectives

Acquired intelligence

Newly revealed locations

Changes in Haven relationships

Lost Supply Nodes

Escaped prisoners or creatures

Other world-state changes


Failure should frequently create new gameplay rather than simply ending a mission chain.


---

Persistent Faction Havens

Factions maintain persistent bases at known Stargate addresses.

Visiting a Haven allows the player to learn what has been constructed there and what activities are occurring.

Possible facilities include:

Research facilities

Power generation

Trade infrastructure

Military facilities

Resource storage

Holding facilities

Specialized faction structures


Facilities can generate opportunities or become mission targets.

For example:

> P3X-65 Research Facility
Current Project: Advanced Power Generation



Depending on relationships and available intelligence, the player might:

Negotiate for the research

Trade for the research

Complete a mission in exchange for it

Infiltrate the facility and steal it

Raid the facility



---

Haven Knowledge

The player does not automatically know everything happening inside a Haven.

Information can be acquired through:

Visits

Diplomacy

Logistics

Prisoners

Hacking

Previous missions

Faction intelligence

Other information sources


Better intelligence reveals more specific information.

For example:

> Basic Intelligence:
Research activity detected.



could eventually become:

> Detailed Intelligence:
Advanced Power Generation research underway. Moderate security. Lead researcher identified.




---

Faction and Haven Relations

Faction Reputation and Haven Reputation are separate values.

Faction Reputation represents how the larger organization views the SGC.

Haven Reputation represents the relationship with a particular settlement or base.

This allows situations such as:

> Faction: Friendly
P3X-65 Haven: Hostile



Local Haven leaders may further influence available opportunities.

Relationships can affect:

Available missions

Trade opportunities

Starting position on mission maps

Access to facilities

Enemy hostility

Diplomatic options

Consequences for failed or hostile actions


Friendly operations may begin close to their objective because the SG team has legitimate access.

Hostile operations may require the team to begin near the Stargate and spend additional stamina reaching the target.


---

Mission Chains

Missions should generally be created as parts of Mission Chains rather than independent events.

A mission's outcome influences which missions become available next.

For example:

> Investigate Mining Colony Uprising

↓

Sabotage Mining Equipment
OR
Capture Mining Foreman

↓

Secure Supply Node
OR
Investigate Hidden Ruins



The next mission should not depend exclusively on a predetermined branching tree.

The system should evaluate:

Mission outcome

Objectives completed

Objectives failed

Intelligence recovered

Prisoners captured

Artifacts recovered

Skill-check results

Alarms triggered

Faction relationships

Haven relationships

Newly revealed locations

Current world state


Conceptually:

> Current Situation + Mission Outcome + New Information + World State → Next Mission



This allows mission chains to respond to what actually happened during gameplay.


---

Core Mission Archetypes

1. Explore

Core Question: What is here?

Explore missions emphasize grid exploration and incomplete information.

Possible objectives include:

Reveal tiles

Locate points of interest

Find Artifacts

Locate ruins

Identify inhabitants

Locate resources

Establish contact

Find new Stargate addresses

Return with intelligence


Explore missions should generally contain more opportunities than the team can reasonably investigate.


---

2. Investigate

Core Question: What is happening?

The player enters with knowledge of a situation but does not understand its cause.

Examples include:

Investigate an uprising

Investigate a missing SG team

Investigate loss of contact

Investigate unusual energy readings

Investigate reduced Supply production


Investigations may contain multiple evidence or intelligence nodes.

The amount and quality of evidence recovered can change later stages of the mission chain.


---

3. Recover

Core Question: Can we bring it back?

The mission centers on retrieving something.

Possible targets include:

Artifacts

Technology

Intelligence

Materials

Equipment

Data

Biological samples


Missions may contain one required recovery target and several optional recovery opportunities.

Some objects may create additional stamina costs, risks, or extraction requirements.


---

4. Rescue

Core Question: Can we get them out?

The objective is locating and extracting friendly or neutral characters.

Possible targets include:

Captured SG teams

Faction operatives

Civilians

Scientists

Political leaders

Prisoners


Rescue targets may be:

Injured

Guarded

Uncooperative

Hidden

Difficult to transport


Freeing a target does not necessarily complete the objective. The target may still need to reach the Stargate.


---

5. Capture

Core Question: Can we bring it back alive?

Capture missions target either intelligent enemies or creatures.

Intelligent Targets

Examples:

Enemy commanders

Bosses

Spies

Important faction personnel


These generally require available Holding Cell capacity.

Creature Targets

Examples:

Large alien animals

Dangerous plants

Biological specimens

Bounty targets


These generally require available Containment capacity.

Targets normally must be:

Downed → Secured → Extracted

Killing the target may fail the Capture objective without necessarily failing the entire mission.


---

6. Sabotage

Core Question: Can we disable or destroy it?

Possible targets include:

Power systems

Mining equipment

Communications

Research facilities

Stargate defenses

Weapons

Supply infrastructure

Security systems


Different classes should support different approaches.

Examples include:

Hack the system

Plant explosives

Overload technology

Convince someone inside to sabotage it

Physically destroy it


The method used may affect diplomatic and strategic consequences.


---

7. Infiltrate

Core Question: Can we accomplish the objective without being caught?

Infiltration uses detection or Alert Level as a central mission constraint.

Possible missions include:

Steal research

Plant surveillance equipment

Extract a prisoner

Hack an intelligence network

Investigate a restricted facility


Failures can increase Alert Level.

Increasing Alert Level may:

Increase patrols

Lock doors

Strengthen enemies

Move objectives

Trigger alarms

Reveal SGC involvement


A failed infiltration does not necessarily end the mission.

It may transform into an escape or Assault situation.


---

8. Assault

Core Question: Can we overpower the opposition?

Assault missions emphasize combat.

Examples include:

Raid enemy facility

Eliminate commander

Destroy defenses

Attack hostile Haven

Retake installation

Break through enemy forces


Assault should not simply mean killing every enemy.

Optional objectives remain important.

Example:

> Raid Enemy Facility

Primary: Destroy Command Center

Optional:

Capture Commander

Recover Intelligence ×3

Free Prisoners ×2

Recover Artifact

Sabotage Power System




Stamina and risk still prevent the player from clearing every tile automatically.


---

9. Secure

Core Question: Can we establish control?

Secure differs from Assault because the objective is establishing persistent control rather than merely defeating opposition.

This is particularly important for Supply Nodes.

Possible requirements include:

Survey the location

Remove threats

Repair infrastructure

Negotiate with inhabitants

Establish defenses

Activate extraction equipment


Successful Secure missions may convert locations into persistent strategic assets.

Those assets can subsequently generate additional missions and events.


---

10. Diplomatic

Core Question: Can we solve the situation through people?

The primary objective is political or social.

Examples include:

Negotiate prisoner exchange

Mediate dispute

Establish relations

Negotiate trade agreement

Convince Haven to cooperate

Secure research agreement


Diplomatic missions still use grid exploration.

The player may visit several locations and gather information before attempting the final negotiation.

Non-Diplomat classes can provide valuable leverage.

For example:

Engineer identifies unsafe equipment.

Scientist proves environmental contamination.

Scout uncovers smuggling.

Soldier identifies concealed weapons.

Medic identifies a public-health problem.

Diplomat uses the acquired information during negotiations.


Diplomatic missions should therefore not automatically encourage teams composed entirely of Diplomats.


---

Mission Approach

The mission's Goal and the player's Approach should be treated separately when appropriate.

For example:

> Goal: Acquire Advanced Power Generation Research



Possible approaches could include:

Diplomatic

Negotiate or trade for the technology.

Archetypes: Diplomatic + Recover

Covert

Infiltrate the facility and steal the technology.

Archetypes: Infiltrate + Recover

Direct

Raid the facility.

Archetypes: Assault + Recover

The selected approach may affect:

Starting tile

Initial Alert Level

Available objectives

Enemy behavior

Diplomatic consequences

Recommended team composition

Available skill checks

Extraction requirements



---

Consequences Based on Method and Outcome

Consequences should consider what actually happened rather than simply which mission archetype was selected.

For example, stealing research could produce several outcomes.

Undetected

The team successfully hacks the research system and escapes without identification.

SGC involvement remains unknown.

Suspected

An alarm is triggered but the team escapes without definitive identification.

The Haven may suspect SGC involvement and suffer a moderate relationship penalty.

Identified

SG personnel are detected or captured.

SGC involvement is confirmed, creating significant diplomatic consequences.

Direct Attack

The SG team attacks Haven personnel and forcibly takes the research.

The attack is known and may significantly damage both Haven and faction relationships.

Skill-check outcomes can therefore have strategic consequences beyond immediate HP or Stamina loss.


---

Mission Generation Structure

The current mission-generation model is:

1. Mission Source

Where did the opportunity originate?

Example:

> P3X-65 Faction Haven



2. Situation

What is happening?

Example:

> The Haven is researching Advanced Power Generation.



3. Goal

What does the player want to accomplish?

Example:

> Acquire Advanced Power Generation.



4. Approach

How does the player intend to accomplish it?

Example:

> Trade / Infiltrate / Assault



5. Archetype Combination

What fundamental gameplay structures does the mission use?

Example:

> Diplomatic + Recover
Infiltrate + Recover
Assault + Recover



6. Objectives

What specific opportunities exist within the mission?

Example:

Acquire Research

Gain Intel ×3

Capture Scientist

Recover Artifact

Hack Security Node


7. Tile Encounters

Individual rooms contain encounters through which objectives, risks, information, combat, and other interactions occur.

These tile encounters will form the basis for determining the game's final set of unit capability stats.

writing{variant="document" id="71426" title="Offworld Mission Archetypes"}
# Offworld Mission Archetypes

## Overview

Offworld missions are built from a relatively small set of reusable **Mission Archetypes** rather than a large collection of individually scripted mission types.

Mission variety comes from combining:

**Mission Source → Situation → Goal → Approach → Archetype(s) → Objectives → Tile Encounters**

Multiple archetypes may be combined within a single mission.

For example:

- **Infiltrate + Recover** = Research heist
- **Assault + Capture** = Raid to capture an enemy commander
- **Explore + Investigate** = Investigation of an unknown world
- **Diplomatic + Recover** = Negotiate for technology
- **Secure + Investigate** = Establish control over a newly identified resource site

---

# Mission Sources

Mission opportunities can originate from several systems.

## World Sources

Persistent locations and strategic assets may generate missions:

- Newly discovered Stargate addresses
- Faction Havens
- Supply Nodes
- Other controlled or known strategic locations

## Base Sources

Activities within the SGC may generate missions:

- Gate Room events
- Logistics
- Diplomacy
- Artifact Analysis
- Prisoners
- Research
- Trade
- Containment
- Player requests for particular opportunities

Rooms that generate a mission display a **Mission Available** indicator.

All available missions are also accessible through **Logistics**, preventing the player from needing to search individual rooms for available operations.

## Consequence Sources

Previous gameplay can create new missions:

- Previous mission outcomes
- Captured SG teams
- Faction retaliation
- Failed objectives
- Acquired intelligence
- Newly revealed locations
- Changes in Haven relationships
- Lost Supply Nodes
- Escaped prisoners or creatures
- Other world-state changes

Failure should frequently create new gameplay rather than simply ending a mission chain.

---

# Persistent Faction Havens

Factions maintain persistent bases at known Stargate addresses.

Visiting a Haven allows the player to learn what has been constructed there and what activities are occurring.

Possible facilities include:

- Research facilities
- Power generation
- Trade infrastructure
- Military facilities
- Resource storage
- Holding facilities
- Specialized faction structures

Facilities can generate opportunities or become mission targets.

For example:

> **P3X-65 Research Facility**  
> Current Project: Advanced Power Generation

Depending on relationships and available intelligence, the player might:

- Negotiate for the research
- Trade for the research
- Complete a mission in exchange for it
- Infiltrate the facility and steal it
- Raid the facility

---

## Haven Knowledge

The player does not automatically know everything happening inside a Haven.

Information can be acquired through:

- Visits
- Diplomacy
- Logistics
- Prisoners
- Hacking
- Previous missions
- Faction intelligence
- Other information sources

Better intelligence reveals more specific information.

For example:

> **Basic Intelligence:**  
> Research activity detected.

could eventually become:

> **Detailed Intelligence:**  
> Advanced Power Generation research underway. Moderate security. Lead researcher identified.

---

# Faction and Haven Relations

**Faction Reputation** and **Haven Reputation** are separate values.

Faction Reputation represents how the larger organization views the SGC.

Haven Reputation represents the relationship with a particular settlement or base.

This allows situations such as:

> Faction: Friendly  
> P3X-65 Haven: Hostile

Local Haven leaders may further influence available opportunities.

Relationships can affect:

- Available missions
- Trade opportunities
- Starting position on mission maps
- Access to facilities
- Enemy hostility
- Diplomatic options
- Consequences for failed or hostile actions

Friendly operations may begin close to their objective because the SG team has legitimate access.

Hostile operations may require the team to begin near the Stargate and spend additional stamina reaching the target.

---

# Mission Chains

Missions should generally be created as parts of **Mission Chains** rather than independent events.

A mission's outcome influences which missions become available next.

For example:

> **Investigate Mining Colony Uprising**
>
> ↓
>
> **Sabotage Mining Equipment**  
> OR  
> **Capture Mining Foreman**
>
> ↓
>
> **Secure Supply Node**  
> OR  
> **Investigate Hidden Ruins**

The next mission should not depend exclusively on a predetermined branching tree.

The system should evaluate:

- Mission outcome
- Objectives completed
- Objectives failed
- Intelligence recovered
- Prisoners captured
- Artifacts recovered
- Skill-check results
- Alarms triggered
- Faction relationships
- Haven relationships
- Newly revealed locations
- Current world state

Conceptually:

> **Current Situation + Mission Outcome + New Information + World State → Next Mission**

This allows mission chains to respond to what actually happened during gameplay.

---

# Core Mission Archetypes

## 1. Explore

**Core Question:** What is here?

Explore missions emphasize grid exploration and incomplete information.

Possible objectives include:

- Reveal tiles
- Locate points of interest
- Find Artifacts
- Locate ruins
- Identify inhabitants
- Locate resources
- Establish contact
- Find new Stargate addresses
- Return with intelligence

Explore missions should generally contain more opportunities than the team can reasonably investigate.

---

## 2. Investigate

**Core Question:** What is happening?

The player enters with knowledge of a situation but does not understand its cause.

Examples include:

- Investigate an uprising
- Investigate a missing SG team
- Investigate loss of contact
- Investigate unusual energy readings
- Investigate reduced Supply production

Investigations may contain multiple evidence or intelligence nodes.

The amount and quality of evidence recovered can change later stages of the mission chain.

---

## 3. Recover

**Core Question:** Can we bring it back?

The mission centers on retrieving something.

Possible targets include:

- Artifacts
- Technology
- Intelligence
- Materials
- Equipment
- Data
- Biological samples

Missions may contain one required recovery target and several optional recovery opportunities.

Some objects may create additional stamina costs, risks, or extraction requirements.

---

## 4. Rescue

**Core Question:** Can we get them out?

The objective is locating and extracting friendly or neutral characters.

Possible targets include:

- Captured SG teams
- Faction operatives
- Civilians
- Scientists
- Political leaders
- Prisoners

Rescue targets may be:

- Injured
- Guarded
- Uncooperative
- Hidden
- Difficult to transport

Freeing a target does not necessarily complete the objective. The target may still need to reach the Stargate.

---

## 5. Capture

**Core Question:** Can we bring it back alive?

Capture missions target either intelligent enemies or creatures.

### Intelligent Targets

Examples:

- Enemy commanders
- Bosses
- Spies
- Important faction personnel

These generally require available **Holding Cell capacity**.

### Creature Targets

Examples:

- Large alien animals
- Dangerous plants
- Biological specimens
- Bounty targets

These generally require available **Containment capacity**.

Targets normally must be:

**Downed → Secured → Extracted**

Killing the target may fail the Capture objective without necessarily failing the entire mission.

---

## 6. Sabotage

**Core Question:** Can we disable or destroy it?

Possible targets include:

- Power systems
- Mining equipment
- Communications
- Research facilities
- Stargate defenses
- Weapons
- Supply infrastructure
- Security systems

Different classes should support different approaches.

Examples include:

- Hack the system
- Plant explosives
- Overload technology
- Convince someone inside to sabotage it
- Physically destroy it

The method used may affect diplomatic and strategic consequences.

---

## 7. Infiltrate

**Core Question:** Can we accomplish the objective without being caught?

Infiltration uses detection or **Alert Level** as a central mission constraint.

Possible missions include:

- Steal research
- Plant surveillance equipment
- Extract a prisoner
- Hack an intelligence network
- Investigate a restricted facility

Failures can increase Alert Level.

Increasing Alert Level may:

- Increase patrols
- Lock doors
- Strengthen enemies
- Move objectives
- Trigger alarms
- Reveal SGC involvement

A failed infiltration does not necessarily end the mission.

It may transform into an escape or Assault situation.

---

## 8. Assault

**Core Question:** Can we overpower the opposition?

Assault missions emphasize combat.

Examples include:

- Raid enemy facility
- Eliminate commander
- Destroy defenses
- Attack hostile Haven
- Retake installation
- Break through enemy forces

Assault should not simply mean killing every enemy.

Optional objectives remain important.

Example:

> **Raid Enemy Facility**
>
> Primary: Destroy Command Center
>
> Optional:
> - Capture Commander
> - Recover Intelligence ×3
> - Free Prisoners ×2
> - Recover Artifact
> - Sabotage Power System

Stamina and risk still prevent the player from clearing every tile automatically.

---

## 9. Secure

**Core Question:** Can we establish control?

Secure differs from Assault because the objective is establishing persistent control rather than merely defeating opposition.

This is particularly important for Supply Nodes.

Possible requirements include:

- Survey the location
- Remove threats
- Repair infrastructure
- Negotiate with inhabitants
- Establish defenses
- Activate extraction equipment

Successful Secure missions may convert locations into persistent strategic assets.

Those assets can subsequently generate additional missions and events.

---

## 10. Diplomatic

**Core Question:** Can we solve the situation through people?

The primary objective is political or social.

Examples include:

- Negotiate prisoner exchange
- Mediate dispute
- Establish relations
- Negotiate trade agreement
- Convince Haven to cooperate
- Secure research agreement

Diplomatic missions still use grid exploration.

The player may visit several locations and gather information before attempting the final negotiation.

Non-Diplomat classes can provide valuable leverage.

For example:

- Engineer identifies unsafe equipment.
- Scientist proves environmental contamination.
- Scout uncovers smuggling.
- Soldier identifies concealed weapons.
- Medic identifies a public-health problem.
- Diplomat uses the acquired information during negotiations.

Diplomatic missions should therefore not automatically encourage teams composed entirely of Diplomats.

---

# Mission Approach

The mission's **Goal** and the player's **Approach** should be treated separately when appropriate.

For example:

> **Goal:** Acquire Advanced Power Generation Research

Possible approaches could include:

### Diplomatic

Negotiate or trade for the technology.

**Archetypes:** Diplomatic + Recover

### Covert

Infiltrate the facility and steal the technology.

**Archetypes:** Infiltrate + Recover

### Direct

Raid the facility.

**Archetypes:** Assault + Recover

The selected approach may affect:

- Starting tile
- Initial Alert Level
- Available objectives
- Enemy behavior
- Diplomatic consequences
- Recommended team composition
- Available skill checks
- Extraction requirements

---

# Consequences Based on Method and Outcome

Consequences should consider what actually happened rather than simply which mission archetype was selected.

For example, stealing research could produce several outcomes.

### Undetected

The team successfully hacks the research system and escapes without identification.

SGC involvement remains unknown.

### Suspected

An alarm is triggered but the team escapes without definitive identification.

The Haven may suspect SGC involvement and suffer a moderate relationship penalty.

### Identified

SG personnel are detected or captured.

SGC involvement is confirmed, creating significant diplomatic consequences.

### Direct Attack

The SG team attacks Haven personnel and forcibly takes the research.

The attack is known and may significantly damage both Haven and faction relationships.

Skill-check outcomes can therefore have strategic consequences beyond immediate HP or Stamina loss.

---

# Mission Generation Structure

The current mission-generation model is:

## 1. Mission Source

Where did the opportunity originate?

Example:

> P3X-65 Faction Haven

## 2. Situation

What is happening?

Example:

> The Haven is researching Advanced Power Generation.

## 3. Goal

What does the player want to accomplish?

Example:

> Acquire Advanced Power Generation.

## 4. Approach

How does the player intend to accomplish it?

Example:

> Trade / Infiltrate / Assault

## 5. Archetype Combination

What fundamental gameplay structures does the mission use?

Example:

> Diplomatic + Recover  
> Infiltrate + Recover  
> Assault + Recover

## 6. Objectives

What specific opportunities exist within the mission?

Example:

- Acquire Research
- Gain Intel ×3
- Capture Scientist
- Recover Artifact
- Hack Security Node

## 7. Tile Encounters

Individual rooms contain encounters through which objectives, risks, information, combat, and other interactions occur.

These tile encounters will form the basis for determining the game's final set of **unit capability stats**.

writing{variant="document" id="36482" title="Offworld Tile and Exploration System"}

Offworld Tile and Exploration System

Overview

Offworld missions take place on interconnected, top-down maps built from a grid of Tiles.

The grid is an exploration and information system rather than a tactical combat system.

Tiles provide stages where encounters occur. They do not provide:

Cover bonuses

Tactical positioning

Range advantages

Flanking

Movement positions within combat


The important questions presented by the map are:

> Where should I go?
What might be there?
How can I get there?
Can I afford to get back?



Unit composition changes the information available to the player and the ways the team can navigate the map.


---

Tile Structure

Tiles can have different shapes and sizes while remaining aligned to the underlying grid.

Examples include:

1×2 corridor

2×2 room

2×3 laboratory

3×4 courtyard

4×4 facility

Large irregular areas constructed within the grid


Not every grid position needs to contain a playable Tile.

Empty space can be used to create interesting map shapes without requiring the player to explore every row or column.

A large map can therefore feel geographically substantial while containing a manageable number of meaningful locations.


---

Tiles, Connections, Information, and Encounters

The exploration system consists of four related concepts.

Tile

The physical location where something can happen.

Examples:

Laboratory

Forest clearing

Village

Holding Cells

Power facility

Ruins

Cave

Corridor


Connection

The method by which the team travels between Tiles.

Connections contain their own requirements, states, actions, and consequences.

Information

What the player currently knows about Tiles and Connections.

Information depends on exploration, reconnaissance, unit capabilities, previous actions, and other intelligence sources.

Encounter

The event or challenge that occurs when the team enters or interacts with a Tile.

The Tile provides the visual stage for the Encounter rather than tactical combat geometry.


---

Multiple Paths

Tiles should generally provide multiple possible routes through a mission.

Unit composition may reveal additional routes or actions.

For example, a normal team may see:

> Locked Door



An Engineer may additionally reveal:

> Hack Door



A Scout may identify:

> Maintenance Passage



A Soldier might provide:

> Force Door



Different teams can therefore perceive different ways of navigating the same map.


---

Connection Types

Connections should use a reusable library of common structures and requirements.

Standard Connections

Examples:

Door

Corridor

Road

Trail

Open passage


These generally require no special action.

Restricted Connections

Examples:

Locked Door

Hack

Find credentials

Force open

Destroy


Security Checkpoint

Fight

Negotiate

Bluff

Present credentials

Hack security

Find another route


Collapsed Passage

Clear obstruction

Use explosives

Find alternate path


Hidden Connections

Possible examples include:

Secret Passage

More likely to be detected by Scouts.


Maintenance Access

More likely to be identified by Engineers.


Alien Transportation System

May require Scientists or Engineers to identify and activate.


Local Shortcut

May be revealed through NPC interaction or Diplomacy.



---

Connection Properties

Connections can contain standardized properties that communicate their consequences to the player.

Possible properties include:

Destructive

The action physically alters the environment and may attract attention.

Noisy

Using the connection may alert nearby enemies.

Restricted

Requires equipment, authorization, a skill check, or another condition.

Dangerous

Failure may damage or Down units.

Exhausting

Using the connection consumes additional Stamina.

Temporary

The connection remains easily accessible only while equipment or another temporary condition remains in place.

Detectable

Enemies may discover that the connection has been used or modified.

Monitored

Passing through the connection may increase Alert or trigger another response.

These properties should be clearly communicated before the player commits to an action.


---

Persistent Connection State

Connections remember what the player has done to them.

For example:

> Locked Door



The player might have several options.

Hack

Quietly unlock the door.

If successful, the connection may remain available in both directions.

Force

Quickly open the door.

The connection remains available, but the action may create noise or increase Alert.

Explosives

Destroy the obstruction.

The connection becomes permanently available but the action is destructive and highly likely to attract attention.

Find Credentials

Explore elsewhere to obtain legitimate access.

This takes longer but may allow safe passage without increasing Alert.

The method chosen therefore affects the route for the remainder of the mission.


---

Temporary Routes

Some routes depend on equipment or temporary conditions.

For example:

> Vertical Drop



A Scout may provide:

> Climb Down
Pathfinder Check
Stamina Cost: 4



After succeeding, the player may need to decide what happens to the climbing equipment.

Leave Rope

Advantages:

Easy return route.

Reduced return Stamina cost.

No repeat climbing check.


Disadvantages:

Rope may be discovered.

Enemies may recognize that someone entered the area.

Alert may increase.


Retract Rope

Advantages:

Removes evidence of the team's route.

Eliminates the immediate detection risk.


Disadvantages:

Return requires another Pathfinder check.

Increased estimated return Stamina.

Failure during the return remains possible.


Successful traversal therefore does not necessarily permanently remove an obstacle.


---

Destructive Routes

Some obstacles can be bypassed through destructive methods.

For example:

> Sealed Wall



An Engineer or properly equipped unit may provide:

> C4 BREACH

High Success Chance
Stamina: 2
⚠ Destructive
⚠ Extremely Loud



Afterward:

> Breached Wall



The connection is permanently available.

However, the action may:

Increase Alert.

Attract patrols.

Reveal SGC presence.

Change nearby encounters.

Cause enemies to reposition.

Create diplomatic consequences.


Destructive actions trade navigation efficiency for operational security.


---

Returning Through Connections

Successfully passing an obstacle does not automatically mean the obstacle remains solved.

The return condition depends on how it was handled.

Examples:

Door hacked and left unlocked

> Remains accessible.



Wall destroyed

> Permanently accessible.



Rope left behind

> Easy return unless discovered or removed.



Rope retracted

> Skill check required again.



Guard persuaded

> Permission may remain valid depending on circumstances.



Patrol avoided

> Patrol remains a potential threat.



Security temporarily disabled

> Security may reactivate.



Elevator repaired

> Remains available unless power conditions change.



Connections therefore create persistent mission state rather than functioning as one-time skill checks.


---

Vertical Map Layers

Height should be represented using actual adjacent map layers rather than tactical height bonuses.

Possible layers include:

Upper Level

Ground Level

Lower Level

Underground

Sewer or maintenance level


A Tile on one layer may provide information about a Tile on another without providing direct access.

For example:

> Upper Observation Platform



may allow the player to see:

> Holding Cells Below



The Holding Cells are now partially revealed, but the team cannot simply enter them.

The player may need to explore several additional Tiles to locate:

> Stairwell → Security Corridor → Lower Level → Holding Cells



This allows vertical environments to contribute to exploration without becoming tactical combat terrain.


---

Fog of War

Unexplored Tiles begin covered by fog of war.

Information can gradually reveal portions of the map without completely exposing them.

Unknown

The Tile is completely hidden.

The player knows nothing about it.

Detected

The player knows that something exists or is occurring in a direction but lacks physical details.

Example:

> 🔴 Hostile activity detected.



The room's shape and exact contents remain unknown.

Mapped

The physical shape and size of the Tile are visible, but its contents remain hidden.

The Tile may appear under a gray overlay.

Assessed

Some information about the Tile's contents becomes available.

Example:

> 3×2 Laboratory
Enemy presence detected
Unknown technology present



Revealed

The currently available information about the Tile is fully visible.

Additional hidden information may still exist if specific skills, traits, encounters, or intelligence sources are required to reveal it.


---

Class-Based Information

Different classes interpret different types of information.

Soldier

Specializes in military intelligence.

May identify:

Enemy strength

Elite enemies

Enemy commanders

Weapons

Defensive preparations

Reinforcements

High-threat locations


Information may progress from:

> Hostile Presence



to:

> Heavy Resistance



to:

> Jaffa Captain and approximately four guards.




---

Scout

Specializes in movement and environmental information.

May identify:

Footprints

Patrol routes

Creature tracks

Hidden paths

Recent movement

Ambush indicators

Frequently traveled connections


A Scout may not know exactly what occupies a room but might determine:

> Heavy foot traffic enters this area.




---

Engineer

Specializes in infrastructure and technological information.

May identify:

Power lines

Network connections

Active machinery

Security systems

Electrical activity

Powered doors

Control systems


Engineers may reveal information trails across otherwise unknown Tiles.

For example:

> Generator → Unknown → Unknown → Security System



The player still does not know what occupies the intermediate Tiles but gains information about how the facility functions.


---

Scientist

Specializes in unusual scientific phenomena.

May identify:

Energy signatures

Radiation

Artifact signals

Unusual materials

Biological anomalies

Stargate-related phenomena


Example:

> Unidentified energy signature detected northeast.




---

Medic

Specializes in biological and medical information.

May identify:

Life signs

Injured individuals

Biological contamination

Disease

Toxins

Dead or dying individuals


Example:

> Multiple weak life signs detected.



This information does not automatically reveal whether those life signs belong to prisoners, civilians, wounded enemies, or something else.


---

Diplomat

Specializes in social and faction information.

May identify:

Faction ownership

Civilian locations

Leadership presence

Negotiation opportunities

Restricted cultural locations

Politically significant individuals


Example:

> Faction official likely present.




---

Information Confidence

Information does not always need to be completely certain.

Possible information states include:

> Possible Artifact Signal



> Probable Enemy Presence



> Confirmed Artifact Signal



Uncertainty should come from incomplete information rather than arbitrary deception.

For example, a Scout may identify tracks heading north.

That reliably means something traveled north, but does not guarantee the target is still there.

Better units, traits, equipment, Logistics intelligence, and other systems can improve information confidence.


---

Directional Information

Not every ability should reveal an exact Tile.

Some abilities provide approximate direction or distance.

For example, a unit with strong treasure-finding capabilities might initially reveal:

> Valuable object detected northeast.



Getting closer could improve this to:

> Possible valuable object within two Tiles.



Eventually:

> Likely loot location.



This preserves exploration while still rewarding specialized team composition.


---

Sound and Activity

Nearby Tiles may provide information through activity that propagates into surrounding locations.

Possible signals include:

Gunfire

Voices

Machinery

Creature sounds

Alarms

Running footsteps

Explosions


A normal team may receive:

> Voices heard to the east.



Different specialists may interpret that information differently.

Scout

> Multiple individuals moving east.



Soldier

> Approximately three armed personnel.



Diplomat

> Goa'uld language detected.



Different units can therefore extract different information from the same environmental signal.


---

Dynamic Maps

Mission maps can change as the player interacts with them.

Examples include:

Alarm Triggered

Security doors lock.

Patrols change routes.

Reinforcements appear.

Previously safe Tiles become dangerous.


Power Disabled

Electronic doors stop functioning.

Security systems deactivate.

Elevators may stop working.

Lighting or sensors may fail.


Explosion

New passage created.

Existing passage damaged.

Nearby enemies alerted.


Security Hacked

Doors unlock.

Cameras deactivate.

Additional map information becomes available.


Prisoner Interrogated

Hidden location revealed.

Patrol information revealed.

Secret connection identified.


Power Restored

Elevators activate.

Machinery becomes usable.

Previously inaccessible systems become available.


Player decisions can therefore change both encounters and navigation.


---

Return Path and Extraction

Unless a mission specifies otherwise, the SG team must maintain a viable route back to extraction.

Every accessible mission location must retain at least one potential route back.

Routes may become:

More expensive

More dangerous

Detectable

Blocked until another action is performed

Dependent on equipment

Dependent on another skill check


However, player actions should not unknowingly create a permanently inaccessible return path.


---

Return Stamina

Because Stamina determines whether units can continue operating, the cost of returning to extraction must be clearly communicated.

The minimap continuously calculates the nearest known return route.

Example:

> Nearest Known Route to Stargate
Estimated Stamina: 11



When relevant, this information can be shown for individual units:

> Soldier: 9
Scout: 8
Engineer: 11
Scientist: 14



This allows the player to understand when pushing deeper into the map places individual team members at risk of exhaustion.


---

Return Route Changes

Actions that modify the current return route should display their consequences before confirmation.

For example:

> RETRACT ROPE

Detection Risk: Removed
Return Pathfinder Check: Required
Estimated Return Cost: 7 → 11 Stamina



Or:

> DISABLE ELEVATOR

Sabotage Objective Completed
Estimated Return Cost: 8 → 16 Stamina



The player may deliberately choose to make extraction more difficult, but the consequence should be an informed strategic decision.


---

Backtracking

Travel through previously explored and secured Tiles should generally cost significantly less Stamina than pushing into unknown territory.

Possible general rule:

Unexplored Route

> Normal Stamina cost.



Explored/Safe Route

> Reduced Stamina cost.



Dangerous or Changed Route

> Cost based on its current state.



The primary Stamina pressure should come from pushing deeper into the mission, not repeatedly paying full exploration costs to cross already-secured locations.


---

Shortcuts

Finding and creating shortcuts can significantly reduce the team's extraction cost.

For example:

> Gate → A → B → C → D → E



After finding a hidden connection:

> E → B → Gate



the estimated return Stamina drops dramatically.

This makes exploration and Pathfinder-style capabilities strategically valuable without requiring tactical combat bonuses.


---

Core Navigation Rule

Offworld navigation should consistently create informed tradeoffs between:

> Speed
Stamina
Information
Risk
Detection
Available Skills



There should rarely be a universally correct route.

A Soldier-heavy team may break through an obstacle.

An Engineer-heavy team may quietly bypass it.

A Scout may find another route entirely.

A Diplomat may gain legitimate access.

The physical map may be the same, but team composition changes how the player understands and moves through it.

This extends the game's central unit philosophy directly into exploration:

> The right unit at the right time can make all the difference.



writing{variant="document" id="36482" title="Offworld Tile and Exploration System"}
# Offworld Tile and Exploration System

## Overview

Offworld missions take place on interconnected, top-down maps built from a grid of **Tiles**.

The grid is an exploration and information system rather than a tactical combat system.

Tiles provide stages where encounters occur. They do **not** provide:

- Cover bonuses
- Tactical positioning
- Range advantages
- Flanking
- Movement positions within combat

The important questions presented by the map are:

> **Where should I go?**  
> **What might be there?**  
> **How can I get there?**  
> **Can I afford to get back?**

Unit composition changes the information available to the player and the ways the team can navigate the map.

---

# Tile Structure

Tiles can have different shapes and sizes while remaining aligned to the underlying grid.

Examples include:

- 1×2 corridor
- 2×2 room
- 2×3 laboratory
- 3×4 courtyard
- 4×4 facility
- Large irregular areas constructed within the grid

Not every grid position needs to contain a playable Tile.

Empty space can be used to create interesting map shapes without requiring the player to explore every row or column.

A large map can therefore feel geographically substantial while containing a manageable number of meaningful locations.

---

# Tiles, Connections, Information, and Encounters

The exploration system consists of four related concepts.

## Tile

The physical location where something can happen.

Examples:

- Laboratory
- Forest clearing
- Village
- Holding Cells
- Power facility
- Ruins
- Cave
- Corridor

## Connection

The method by which the team travels between Tiles.

Connections contain their own requirements, states, actions, and consequences.

## Information

What the player currently knows about Tiles and Connections.

Information depends on exploration, reconnaissance, unit capabilities, previous actions, and other intelligence sources.

## Encounter

The event or challenge that occurs when the team enters or interacts with a Tile.

The Tile provides the visual stage for the Encounter rather than tactical combat geometry.

---

# Multiple Paths

Tiles should generally provide multiple possible routes through a mission.

Unit composition may reveal additional routes or actions.

For example, a normal team may see:

> **Locked Door**

An Engineer may additionally reveal:

> **Hack Door**

A Scout may identify:

> **Maintenance Passage**

A Soldier might provide:

> **Force Door**

Different teams can therefore perceive different ways of navigating the same map.

---

# Connection Types

Connections should use a reusable library of common structures and requirements.

## Standard Connections

Examples:

- Door
- Corridor
- Road
- Trail
- Open passage

These generally require no special action.

## Restricted Connections

Examples:

**Locked Door**
- Hack
- Find credentials
- Force open
- Destroy

**Security Checkpoint**
- Fight
- Negotiate
- Bluff
- Present credentials
- Hack security
- Find another route

**Collapsed Passage**
- Clear obstruction
- Use explosives
- Find alternate path

## Hidden Connections

Possible examples include:

**Secret Passage**
- More likely to be detected by Scouts.

**Maintenance Access**
- More likely to be identified by Engineers.

**Alien Transportation System**
- May require Scientists or Engineers to identify and activate.

**Local Shortcut**
- May be revealed through NPC interaction or Diplomacy.

---

# Connection Properties

Connections can contain standardized properties that communicate their consequences to the player.

Possible properties include:

### Destructive

The action physically alters the environment and may attract attention.

### Noisy

Using the connection may alert nearby enemies.

### Restricted

Requires equipment, authorization, a skill check, or another condition.

### Dangerous

Failure may damage or Down units.

### Exhausting

Using the connection consumes additional Stamina.

### Temporary

The connection remains easily accessible only while equipment or another temporary condition remains in place.

### Detectable

Enemies may discover that the connection has been used or modified.

### Monitored

Passing through the connection may increase Alert or trigger another response.

These properties should be clearly communicated before the player commits to an action.

---

# Persistent Connection State

Connections remember what the player has done to them.

For example:

> **Locked Door**

The player might have several options.

### Hack

Quietly unlock the door.

If successful, the connection may remain available in both directions.

### Force

Quickly open the door.

The connection remains available, but the action may create noise or increase Alert.

### Explosives

Destroy the obstruction.

The connection becomes permanently available but the action is destructive and highly likely to attract attention.

### Find Credentials

Explore elsewhere to obtain legitimate access.

This takes longer but may allow safe passage without increasing Alert.

The method chosen therefore affects the route for the remainder of the mission.

---

# Temporary Routes

Some routes depend on equipment or temporary conditions.

For example:

> **Vertical Drop**

A Scout may provide:

> **Climb Down**  
> Pathfinder Check  
> Stamina Cost: 4

After succeeding, the player may need to decide what happens to the climbing equipment.

### Leave Rope

Advantages:

- Easy return route.
- Reduced return Stamina cost.
- No repeat climbing check.

Disadvantages:

- Rope may be discovered.
- Enemies may recognize that someone entered the area.
- Alert may increase.

### Retract Rope

Advantages:

- Removes evidence of the team's route.
- Eliminates the immediate detection risk.

Disadvantages:

- Return requires another Pathfinder check.
- Increased estimated return Stamina.
- Failure during the return remains possible.

Successful traversal therefore does not necessarily permanently remove an obstacle.

---

# Destructive Routes

Some obstacles can be bypassed through destructive methods.

For example:

> **Sealed Wall**

An Engineer or properly equipped unit may provide:

> **C4 BREACH**
>
> High Success Chance  
> Stamina: 2  
> ⚠ Destructive  
> ⚠ Extremely Loud

Afterward:

> **Breached Wall**

The connection is permanently available.

However, the action may:

- Increase Alert.
- Attract patrols.
- Reveal SGC presence.
- Change nearby encounters.
- Cause enemies to reposition.
- Create diplomatic consequences.

Destructive actions trade **navigation efficiency for operational security**.

---

# Returning Through Connections

Successfully passing an obstacle does not automatically mean the obstacle remains solved.

The return condition depends on how it was handled.

Examples:

**Door hacked and left unlocked**
> Remains accessible.

**Wall destroyed**
> Permanently accessible.

**Rope left behind**
> Easy return unless discovered or removed.

**Rope retracted**
> Skill check required again.

**Guard persuaded**
> Permission may remain valid depending on circumstances.

**Patrol avoided**
> Patrol remains a potential threat.

**Security temporarily disabled**
> Security may reactivate.

**Elevator repaired**
> Remains available unless power conditions change.

Connections therefore create persistent mission state rather than functioning as one-time skill checks.

---

# Vertical Map Layers

Height should be represented using actual adjacent map layers rather than tactical height bonuses.

Possible layers include:

- Upper Level
- Ground Level
- Lower Level
- Underground
- Sewer or maintenance level

A Tile on one layer may provide information about a Tile on another without providing direct access.

For example:

> **Upper Observation Platform**

may allow the player to see:

> **Holding Cells Below**

The Holding Cells are now partially revealed, but the team cannot simply enter them.

The player may need to explore several additional Tiles to locate:

> Stairwell → Security Corridor → Lower Level → Holding Cells

This allows vertical environments to contribute to exploration without becoming tactical combat terrain.

---

# Fog of War

Unexplored Tiles begin covered by fog of war.

Information can gradually reveal portions of the map without completely exposing them.

## Unknown

The Tile is completely hidden.

The player knows nothing about it.

## Detected

The player knows that something exists or is occurring in a direction but lacks physical details.

Example:

> 🔴 Hostile activity detected.

The room's shape and exact contents remain unknown.

## Mapped

The physical shape and size of the Tile are visible, but its contents remain hidden.

The Tile may appear under a gray overlay.

## Assessed

Some information about the Tile's contents becomes available.

Example:

> **3×2 Laboratory**  
> Enemy presence detected  
> Unknown technology present

## Revealed

The currently available information about the Tile is fully visible.

Additional hidden information may still exist if specific skills, traits, encounters, or intelligence sources are required to reveal it.

---

# Class-Based Information

Different classes interpret different types of information.

## Soldier

Specializes in military intelligence.

May identify:

- Enemy strength
- Elite enemies
- Enemy commanders
- Weapons
- Defensive preparations
- Reinforcements
- High-threat locations

Information may progress from:

> Hostile Presence

to:

> Heavy Resistance

to:

> Jaffa Captain and approximately four guards.

---

## Scout

Specializes in movement and environmental information.

May identify:

- Footprints
- Patrol routes
- Creature tracks
- Hidden paths
- Recent movement
- Ambush indicators
- Frequently traveled connections

A Scout may not know exactly what occupies a room but might determine:

> Heavy foot traffic enters this area.

---

## Engineer

Specializes in infrastructure and technological information.

May identify:

- Power lines
- Network connections
- Active machinery
- Security systems
- Electrical activity
- Powered doors
- Control systems

Engineers may reveal information trails across otherwise unknown Tiles.

For example:

> Generator → Unknown → Unknown → Security System

The player still does not know what occupies the intermediate Tiles but gains information about how the facility functions.

---

## Scientist

Specializes in unusual scientific phenomena.

May identify:

- Energy signatures
- Radiation
- Artifact signals
- Unusual materials
- Biological anomalies
- Stargate-related phenomena

Example:

> Unidentified energy signature detected northeast.

---

## Medic

Specializes in biological and medical information.

May identify:

- Life signs
- Injured individuals
- Biological contamination
- Disease
- Toxins
- Dead or dying individuals

Example:

> Multiple weak life signs detected.

This information does not automatically reveal whether those life signs belong to prisoners, civilians, wounded enemies, or something else.

---

## Diplomat

Specializes in social and faction information.

May identify:

- Faction ownership
- Civilian locations
- Leadership presence
- Negotiation opportunities
- Restricted cultural locations
- Politically significant individuals

Example:

> Faction official likely present.

---

# Information Confidence

Information does not always need to be completely certain.

Possible information states include:

> Possible Artifact Signal

> Probable Enemy Presence

> Confirmed Artifact Signal

Uncertainty should come from incomplete information rather than arbitrary deception.

For example, a Scout may identify tracks heading north.

That reliably means something traveled north, but does not guarantee the target is still there.

Better units, traits, equipment, Logistics intelligence, and other systems can improve information confidence.

---

# Directional Information

Not every ability should reveal an exact Tile.

Some abilities provide approximate direction or distance.

For example, a unit with strong treasure-finding capabilities might initially reveal:

> Valuable object detected northeast.

Getting closer could improve this to:

> Possible valuable object within two Tiles.

Eventually:

> Likely loot location.

This preserves exploration while still rewarding specialized team composition.

---

# Sound and Activity

Nearby Tiles may provide information through activity that propagates into surrounding locations.

Possible signals include:

- Gunfire
- Voices
- Machinery
- Creature sounds
- Alarms
- Running footsteps
- Explosions

A normal team may receive:

> Voices heard to the east.

Different specialists may interpret that information differently.

**Scout**
> Multiple individuals moving east.

**Soldier**
> Approximately three armed personnel.

**Diplomat**
> Goa'uld language detected.

Different units can therefore extract different information from the same environmental signal.

---

# Dynamic Maps

Mission maps can change as the player interacts with them.

Examples include:

### Alarm Triggered

- Security doors lock.
- Patrols change routes.
- Reinforcements appear.
- Previously safe Tiles become dangerous.

### Power Disabled

- Electronic doors stop functioning.
- Security systems deactivate.
- Elevators may stop working.
- Lighting or sensors may fail.

### Explosion

- New passage created.
- Existing passage damaged.
- Nearby enemies alerted.

### Security Hacked

- Doors unlock.
- Cameras deactivate.
- Additional map information becomes available.

### Prisoner Interrogated

- Hidden location revealed.
- Patrol information revealed.
- Secret connection identified.

### Power Restored

- Elevators activate.
- Machinery becomes usable.
- Previously inaccessible systems become available.

Player decisions can therefore change both encounters and navigation.

---

# Return Path and Extraction

Unless a mission specifies otherwise, the SG team must maintain a viable route back to extraction.

Every accessible mission location must retain at least one **potential route back**.

Routes may become:

- More expensive
- More dangerous
- Detectable
- Blocked until another action is performed
- Dependent on equipment
- Dependent on another skill check

However, player actions should not unknowingly create a permanently inaccessible return path.

---

# Return Stamina

Because Stamina determines whether units can continue operating, the cost of returning to extraction must be clearly communicated.

The minimap continuously calculates the nearest known return route.

Example:

> **Nearest Known Route to Stargate**  
> Estimated Stamina: 11

When relevant, this information can be shown for individual units:

> Soldier: 9  
> Scout: 8  
> Engineer: 11  
> Scientist: 14

This allows the player to understand when pushing deeper into the map places individual team members at risk of exhaustion.

---

# Return Route Changes

Actions that modify the current return route should display their consequences before confirmation.

For example:

> **RETRACT ROPE**
>
> Detection Risk: Removed  
> Return Pathfinder Check: Required  
> Estimated Return Cost: 7 → **11 Stamina**

Or:

> **DISABLE ELEVATOR**
>
> Sabotage Objective Completed  
> Estimated Return Cost: 8 → **16 Stamina**

The player may deliberately choose to make extraction more difficult, but the consequence should be an informed strategic decision.

---

# Backtracking

Travel through previously explored and secured Tiles should generally cost significantly less Stamina than pushing into unknown territory.

Possible general rule:

**Unexplored Route**
> Normal Stamina cost.

**Explored/Safe Route**
> Reduced Stamina cost.

**Dangerous or Changed Route**
> Cost based on its current state.

The primary Stamina pressure should come from **pushing deeper into the mission**, not repeatedly paying full exploration costs to cross already-secured locations.

---

# Shortcuts

Finding and creating shortcuts can significantly reduce the team's extraction cost.

For example:

> Gate → A → B → C → D → E

After finding a hidden connection:

> E → B → Gate

the estimated return Stamina drops dramatically.

This makes exploration and Pathfinder-style capabilities strategically valuable without requiring tactical combat bonuses.

---

# Core Navigation Rule

Offworld navigation should consistently create informed tradeoffs between:

> **Speed**  
> **Stamina**  
> **Information**  
> **Risk**  
> **Detection**  
> **Available Skills**

There should rarely be a universally correct route.

A Soldier-heavy team may break through an obstacle.

An Engineer-heavy team may quietly bypass it.

A Scout may find another route entirely.

A Diplomat may gain legitimate access.

The physical map may be the same, but **team composition changes how the player understands and moves through it**.

This extends the game's central unit philosophy directly into exploration:

> **The right unit at the right time can make all the difference.**

writing{variant="document" id="58321" title="Specialist Kit System"}

Specialist Kit System

Overview

Every unit has a class-specific Specialist Kit equipment slot.

Specialist Kits represent mission-specific tools, supplies, equipment, credentials, trade goods, and other limited resources that allow a unit to approach encounters differently.

Conceptually, these items function as plot devices that the player deliberately packs before going offworld.

The system reinforces the core mission philosophy:

> What you bring matters.



A unit's mission capabilities are determined by a combination of:

Base Class + Specialization + Traits + Specialist Kit + Mission Intelligence


---

Pre-Mission Selection

Specialist Kits are selected before the SG team deploys.

Information provided by the probe and Logistics may indicate which equipment could be useful.

For example:

> Basic Intelligence:
Significant vertical terrain detected.



Better intelligence might reveal:

> Detailed Intelligence:
Numerous minor vertical obstacles detected.



The first report tells the player that climbing equipment may be useful.

The second provides enough information to make a more informed decision about which climbing equipment to bring.

Intelligence should suggest useful equipment without simply telling the player the optimal loadout.


---

Limited Capacity

A unit can only bring a limited amount of specialized equipment.

This forces the player to choose between equipment designed for different situations.

For example, a Scout might choose between:

Advanced Climbing Gear

2 uses

Handles Level 2 climbing challenges

Designed for difficult traversal


General Rope Kit

6 uses

Handles Level 1 climbing challenges

Designed for frequent minor traversal obstacles


Neither option is universally superior.

The correct choice depends on:

Mission intelligence

Expected encounters

Team composition

Mission objectives

Player strategy

Acceptable risk



---

Duplicate Classes

Specialist Kits make bringing multiple units of the same class more strategically interesting.

Two Scouts do not need to provide identical capabilities.

For example:

> Scout A
Specialist Kit: Advanced Climbing Gear



> Scout B
Specialist Kit: Recon Equipment



Likewise:

> Engineer A
Specialist Kit: Hacking Kit



> Engineer B
Specialist Kit: Demolition Kit



Bringing two units from the same class can therefore represent deliberate specialization rather than simply doubling the same capability.


---

Specialist Kit Effects

Specialist Kits should not all function as automatic-success consumables.

Different equipment can interact with encounters in several ways.

Bypass

Automatically resolves certain appropriate challenges.

Example:

> General Rope Kit automatically resolves a Level 1 climbing obstacle.




---

Enable

Creates an action that would otherwise be unavailable.

Example:

> Explosives allow an Engineer to create a Breach Wall option.




---

Improve

Makes a skill check easier without guaranteeing success.

Possible effects include:

Larger success area

Slower timing interaction

Additional attempts

Reduced difficulty

Improved success outcome



---

Protect

Reduces the consequences of failure.

Example:

> Specialized protective equipment reduces damage from a failed biological hazard check.




---

Reveal

Provides additional information about Tiles, Connections, or Encounters.

Example:

> Recon equipment reveals movement in nearby unexplored Tiles.




---

Substitute

Allows one capability to solve an encounter normally associated with another.

Example:

A Diplomat's bribe may bypass a checkpoint that might otherwise require:

Hacking

Stealth

Combat

Credentials


Substitution creates additional solutions without requiring every SG team to contain every class.


---

Class-Specific Kits

Each class should eventually receive its own pool of Specialist Kits.

The exact equipment lists should be designed after unit actions and capability stats are finalized.

Soldier

Potential themes include:

Breaching equipment

Specialized ammunition

Defensive equipment

Capture equipment

Suppression tools


Scout

Potential themes include:

Climbing equipment

Ropes

Reconnaissance equipment

Survival gear

Tracking equipment


Engineer

Potential themes include:

Hacking equipment

Demolition equipment

Repair equipment

Electronic bypass tools

Portable power equipment


Scientist

Potential themes include:

Analysis equipment

Sample collection equipment

Sensors

Artifact-handling equipment

Specialized scientific instruments


Medic

Potential themes include:

Medical supplies

Trauma equipment

Antitoxins

Biological protection

Stabilization equipment


Diplomat

Diplomat Specialist Kits do not necessarily represent traditional equipment.

They may instead represent resources or leverage prepared before the mission.

Potential examples include:

Local alcohol

Bribe funds

Trade goods

Cultural gifts

Credentials

Diplomatic documents


For example:

> Bribe Fund



could provide a limited number of opportunities to bypass appropriate Social encounters.


---

Specialist Kits and Skill Checks

Specialist Kits should interact with the existing skill-check system rather than replace it entirely.

Depending on the item and encounter, equipment may:

Automatically resolve simple challenges.

Make difficult challenges possible.

Reduce skill-check difficulty.

Provide additional attempts.

Reduce Stamina cost.

Reduce failure consequences.

Create an entirely new action.

Change the consequences of an existing action.


Higher-level challenges may still require both the correct equipment and a capable unit.


---

Specialist Kits and Connections

Specialist Kits can modify the state of map Connections.

For example:

> Vertical Drop



Scout + General Rope Kit:

> DEPLOY ROPE



After crossing, the player may choose:

Leave Rope

Easy return.

Reduced return Stamina.

No repeat traversal check.

Risk of enemy detection.


Retract Rope

Removes evidence.

Reduces detection risk.

Requires another skill check during extraction.

Increases estimated return Stamina.


The equipment therefore changes more than the immediate skill check. It can modify the mission's persistent navigation state.


---

Specialist Kits and Intelligence

Mission intelligence should influence Specialist Kit selection.

Different Logistics personnel may reveal information that suggests different equipment.

Examples:

Scout Intelligence

> Numerous difficult terrain transitions detected.



Engineer Intelligence

> Multiple electronic security systems detected.



Soldier Intelligence

> Heavy armored resistance likely.



Scientist Intelligence

> Unusual energy signatures detected.



Medic Intelligence

> Biological hazard possible.



Diplomat Intelligence

> Local officials control access to the objective.



The player then determines whether that information is reliable and important enough to dedicate a Specialist Kit slot to it.


---

Imperfect Preparation

The player should not always know which Specialist Kit will be useful.

For example:

> Settlement detected.



The player brings Cultural Gifts.

Upon arrival:

> Settlement abandoned.



The equipment provides little value during the mission.

This is an intentional part of expedition planning.

Better intelligence reduces uncertainty but should rarely eliminate it completely.


---

Design Principle

Specialist Kits should create options rather than mandatory loadouts.

The goal is not:

> This mission contains climbing, therefore bring the climbing item.



The goal is:

> We think there may be difficult terrain. Do I dedicate one of my limited equipment choices to climbing equipment, or trust my Scout's skill and bring something else?



Specialist Kits provide another reason why two otherwise similar units can contribute differently to the same SG team.

The system should ultimately reinforce the larger offworld mission principle:

> The right people, carrying the right equipment, with the right information, can completely change how a mission plays out.



The detailed Specialist Kit catalog, charge counts, challenge levels, and equipment progression should be finalized after the reusable unit actions and capability statistics have been established.

writing{variant="document" id="58321" title="Specialist Kit System"}
# Specialist Kit System

## Overview

Every unit has a **class-specific Specialist Kit equipment slot**.

Specialist Kits represent mission-specific tools, supplies, equipment, credentials, trade goods, and other limited resources that allow a unit to approach encounters differently.

Conceptually, these items function as **plot devices** that the player deliberately packs before going offworld.

The system reinforces the core mission philosophy:

> **What you bring matters.**

A unit's mission capabilities are determined by a combination of:

**Base Class + Specialization + Traits + Specialist Kit + Mission Intelligence**

---

# Pre-Mission Selection

Specialist Kits are selected before the SG team deploys.

Information provided by the probe and Logistics may indicate which equipment could be useful.

For example:

> **Basic Intelligence:**  
> Significant vertical terrain detected.

Better intelligence might reveal:

> **Detailed Intelligence:**  
> Numerous minor vertical obstacles detected.

The first report tells the player that climbing equipment may be useful.

The second provides enough information to make a more informed decision about **which climbing equipment** to bring.

Intelligence should suggest useful equipment without simply telling the player the optimal loadout.

---

# Limited Capacity

A unit can only bring a limited amount of specialized equipment.

This forces the player to choose between equipment designed for different situations.

For example, a Scout might choose between:

### Advanced Climbing Gear

- 2 uses
- Handles Level 2 climbing challenges
- Designed for difficult traversal

### General Rope Kit

- 6 uses
- Handles Level 1 climbing challenges
- Designed for frequent minor traversal obstacles

Neither option is universally superior.

The correct choice depends on:

- Mission intelligence
- Expected encounters
- Team composition
- Mission objectives
- Player strategy
- Acceptable risk

---

# Duplicate Classes

Specialist Kits make bringing multiple units of the same class more strategically interesting.

Two Scouts do not need to provide identical capabilities.

For example:

> **Scout A**  
> Specialist Kit: Advanced Climbing Gear

> **Scout B**  
> Specialist Kit: Recon Equipment

Likewise:

> **Engineer A**  
> Specialist Kit: Hacking Kit

> **Engineer B**  
> Specialist Kit: Demolition Kit

Bringing two units from the same class can therefore represent deliberate specialization rather than simply doubling the same capability.

---

# Specialist Kit Effects

Specialist Kits should not all function as automatic-success consumables.

Different equipment can interact with encounters in several ways.

## Bypass

Automatically resolves certain appropriate challenges.

Example:

> General Rope Kit automatically resolves a Level 1 climbing obstacle.

---

## Enable

Creates an action that would otherwise be unavailable.

Example:

> Explosives allow an Engineer to create a **Breach Wall** option.

---

## Improve

Makes a skill check easier without guaranteeing success.

Possible effects include:

- Larger success area
- Slower timing interaction
- Additional attempts
- Reduced difficulty
- Improved success outcome

---

## Protect

Reduces the consequences of failure.

Example:

> Specialized protective equipment reduces damage from a failed biological hazard check.

---

## Reveal

Provides additional information about Tiles, Connections, or Encounters.

Example:

> Recon equipment reveals movement in nearby unexplored Tiles.

---

## Substitute

Allows one capability to solve an encounter normally associated with another.

Example:

A Diplomat's bribe may bypass a checkpoint that might otherwise require:

- Hacking
- Stealth
- Combat
- Credentials

Substitution creates additional solutions without requiring every SG team to contain every class.

---

# Class-Specific Kits

Each class should eventually receive its own pool of Specialist Kits.

The exact equipment lists should be designed after unit actions and capability stats are finalized.

## Soldier

Potential themes include:

- Breaching equipment
- Specialized ammunition
- Defensive equipment
- Capture equipment
- Suppression tools

## Scout

Potential themes include:

- Climbing equipment
- Ropes
- Reconnaissance equipment
- Survival gear
- Tracking equipment

## Engineer

Potential themes include:

- Hacking equipment
- Demolition equipment
- Repair equipment
- Electronic bypass tools
- Portable power equipment

## Scientist

Potential themes include:

- Analysis equipment
- Sample collection equipment
- Sensors
- Artifact-handling equipment
- Specialized scientific instruments

## Medic

Potential themes include:

- Medical supplies
- Trauma equipment
- Antitoxins
- Biological protection
- Stabilization equipment

## Diplomat

Diplomat Specialist Kits do not necessarily represent traditional equipment.

They may instead represent resources or leverage prepared before the mission.

Potential examples include:

- Local alcohol
- Bribe funds
- Trade goods
- Cultural gifts
- Credentials
- Diplomatic documents

For example:

> **Bribe Fund**

could provide a limited number of opportunities to bypass appropriate Social encounters.

---

# Specialist Kits and Skill Checks

Specialist Kits should interact with the existing skill-check system rather than replace it entirely.

Depending on the item and encounter, equipment may:

- Automatically resolve simple challenges.
- Make difficult challenges possible.
- Reduce skill-check difficulty.
- Provide additional attempts.
- Reduce Stamina cost.
- Reduce failure consequences.
- Create an entirely new action.
- Change the consequences of an existing action.

Higher-level challenges may still require both the correct equipment **and** a capable unit.

---

# Specialist Kits and Connections

Specialist Kits can modify the state of map Connections.

For example:

> **Vertical Drop**

Scout + General Rope Kit:

> **DEPLOY ROPE**

After crossing, the player may choose:

### Leave Rope

- Easy return.
- Reduced return Stamina.
- No repeat traversal check.
- Risk of enemy detection.

### Retract Rope

- Removes evidence.
- Reduces detection risk.
- Requires another skill check during extraction.
- Increases estimated return Stamina.

The equipment therefore changes more than the immediate skill check. It can modify the mission's persistent navigation state.

---

# Specialist Kits and Intelligence

Mission intelligence should influence Specialist Kit selection.

Different Logistics personnel may reveal information that suggests different equipment.

Examples:

**Scout Intelligence**
> Numerous difficult terrain transitions detected.

**Engineer Intelligence**
> Multiple electronic security systems detected.

**Soldier Intelligence**
> Heavy armored resistance likely.

**Scientist Intelligence**
> Unusual energy signatures detected.

**Medic Intelligence**
> Biological hazard possible.

**Diplomat Intelligence**
> Local officials control access to the objective.

The player then determines whether that information is reliable and important enough to dedicate a Specialist Kit slot to it.

---

# Imperfect Preparation

The player should not always know which Specialist Kit will be useful.

For example:

> Settlement detected.

The player brings Cultural Gifts.

Upon arrival:

> Settlement abandoned.

The equipment provides little value during the mission.

This is an intentional part of expedition planning.

Better intelligence reduces uncertainty but should rarely eliminate it completely.

---

# Design Principle

Specialist Kits should create **options rather than mandatory loadouts**.

The goal is not:

> This mission contains climbing, therefore bring the climbing item.

The goal is:

> We think there may be difficult terrain. Do I dedicate one of my limited equipment choices to climbing equipment, or trust my Scout's skill and bring something else?

Specialist Kits provide another reason why two otherwise similar units can contribute differently to the same SG team.

The system should ultimately reinforce the larger offworld mission principle:

> **The right people, carrying the right equipment, with the right information, can completely change how a mission plays out.**

The detailed Specialist Kit catalog, charge counts, challenge levels, and equipment progression should be finalized after the reusable unit actions and capability statistics have been established.

writing{variant="document" id="stamina-endurance-system" title="Unit Stats, Endurance, HP, and Stamina"}

Unit Stats, Endurance, HP, and Stamina

Core Unit Stats

Units currently have five universal stats:

Stat	Core Question

Navigation	How well can this unit get the team through the environment?
Perception	How well can this unit understand what is around them?
Expertise	How capable is this unit at producing good outcomes within their training?
Influence	How strongly does the world react to who this unit is?
Endurance	How well can this unit's mind and body withstand harm, environmental stress, and recovery?


These are universal stats. Every class possesses all five.

Class, specialization, rank, traits, equipment, and history determine how those stats are expressed.


---

Navigation

Navigation represents:

> How effectively can this unit lead the party safely from one location to another?



Navigation is used for movement-related challenges such as:

Climbing

Difficult terrain

Finding safe routes

Crossing damaged structures

Wilderness navigation

Rappelling

Crawling through confined spaces

Moving through hazardous areas

Quietly navigating areas where detection is possible


Navigation is not exclusive to Scouts.

A unit with high Navigation can successfully lead a team through difficult terrain even if no Scout is present.

A Scout gains advantages through:

Naturally favorable Navigation

Scout specializations

Traits

Specialist Kits

Class-specific actions and bypasses


For example, a team without a Scout may still climb a difficult cliff by spending additional Stamina and attempting a harder Navigation check.

A Scout with the correct Specialist Kit may be able to solve the same problem much more safely or efficiently.


---

Single-Unit Party Checks

Only one unit performs a skill check for the party.

The acting unit's stats determine the check.

Other party members modify its difficulty rather than making separate rolls.

For example:

> Scout attempts to quietly move the team through an occupied area.



The Scout performs the Navigation check.

However, the difficulty may be modified by:

Heavily equipped Soldier

Injured teammate

Civilian VIP

Children

Large prisoner group

Current Alert level

Specialist Kits

Traits

Environmental conditions


Success applies to the entire party.

Failure also applies to the entire party.

This same principle applies throughout the encounter system.


---

Perception

Perception represents:

> How effectively can this unit gather and interpret information about its surroundings?



Every class uses the same Perception stat, but class determines the type of specialized information the unit is able to interpret.

Soldier Perception

May reveal:

Enemy strength

Elite enemies

Enemy commanders

Weapons

Reinforcements

Defensive preparations


Scout Perception

May reveal:

Footprints

Patrol routes

Recent movement

Hidden paths

Ambush indicators

Creature tracks


Engineer Perception

May reveal:

Power consumption

Network connections

Security systems

Machinery

Electrical activity

Powered doors


Scientist Perception

May reveal:

Energy signatures

Radiation

Artifact signals

Unusual materials

Scientific anomalies


Medic Perception

May reveal:

Life signs

Injured individuals

Biological contamination

Disease

Toxins

Dead or dying individuals


Diplomat Perception

May reveal:

Faction ownership

Leadership presence

Social significance

Political affiliations

Negotiation opportunities

Cultural restrictions


A Tile can contain multiple hidden pieces of information.

Different classes examining the same Tile may therefore reveal completely different information.


---

Expertise

Expertise represents:

> How good is this unit actually at what they do?



Expertise does not determine which actions a unit knows.

Class, specialization, rank, traits, and equipment determine training and available actions.

Expertise instead determines the quality range of possible outcomes when the unit performs an action.


---

Encounter Outcome Ladder

Each skill-check action generates an ordered table of possible outcomes ranging from worst to best.

Example:

Hack Security Door

Outcome	Result

1	Alarm triggered; door remains locked
2	Terminal damaged; door remains locked
3	Hack fails; additional Stamina consumed
4	Hack fails safely; retry available
5	Door opens but Alert increases
6	Door opens
7	Door opens and security information is revealed
8	Door opens and an adjacent secured door is unlocked
9	Local security network is compromised
10	Networked doors unlock and security map is revealed


The exact number of outcomes may vary during development.


---

Expertise Window

The player does not play for every possible outcome.

Expertise determines which four outcomes are available during the skill-check interaction.

For example:

Low Effective Expertise

> Outcomes 1–4



The player is primarily trying to avoid disaster.

Moderate Effective Expertise

> Outcomes 3–6



The check ranges from failure to normal success.

High Effective Expertise

> Outcomes 5–8



Even poor performance may accomplish something, while good performance creates additional advantages.

Exceptional Effective Expertise

> Outcomes 7–10



The question is no longer whether the unit succeeds, but how much additional benefit they can create.

The player's performance during the skill-check interaction determines which of the four available outcomes occurs.


---

Training and Expertise

High Expertise does not make a unit equally capable at every action.

Training determines how much of an action's Outcome Ladder is available.

Conceptually:

> Training determines the potential ceiling.



> Expertise determines where the four-outcome window sits within that available range.



> Player performance determines which of those four outcomes occurs.



For example:

Engineer Hacking

An Engineer is trained to Hack.

A highly experienced Engineer may have access to nearly the entire Hack Outcome Ladder.

Their Expertise may position their four outcomes near the top:

> 6 / 7 / 8 / 9



Soldier Hacking

A Soldier may still attempt a basic Hack as an untrained Engineer.

Their available Outcome Ladder may be restricted.

Even a Soldier with extremely high Expertise cannot achieve the most advanced Engineer outcomes.

A veteran Soldier might receive:

> 3 / 4 / 5 / 6



Their high Expertise prevents catastrophic mistakes and may allow basic success, but they cannot completely compromise an enemy security network.

This allows units to attempt tasks outside their normal role without making classes irrelevant.


---

Difficulty

Encounter difficulty pushes against the unit's effective Expertise window.

A skilled Engineer may easily hack a basic terminal but receive a lower outcome range against an advanced alien security system.

The final outcome window can therefore be influenced by:

Training

Expertise

Encounter difficulty

Specialization

Traits

Specialist Kits

Party composition

VIPs

Environmental conditions

Current mission state

Fatigue


The exact mathematical formula should be determined during balancing.


---

Influence

Influence represents:

> How significant is this unit's identity, reputation, and presence to other people?



Influence is not Charisma and is not inherently positive.

High Influence means people are more likely to recognize or care about the unit.

Whether that recognition is beneficial depends on the location, faction, Haven, NPC, and unit history.


---

Influence Is Magnitude, Not Approval

A high-Influence Soldier may arrive at one Haven and be recognized as:

> Hero of the Battle of P3X-442



Possible benefits:

Improved access

Easier negotiations

Additional information

Friendly NPC reactions


The same Soldier might arrive somewhere else and be recognized as:

> The Villain of P3X-442



Possible consequences:

Restricted access

Increased security

Hostile reactions

Bluff penalties

Revenge encounters


The Influence value has not changed.

The context determines whether that Influence is helpful.


---

Class-Based Influence

Different classes are likely to develop different types of reputations.

Soldier

Military hero

Commander

Rival

Dangerous enemy

Famous combatant


Scout

Explorer

Pathfinder

Spy

Infiltrator

Thief


Engineer

Technical expert

Inventor

Saboteur

Infrastructure specialist

Practitioner of forbidden technology


Scientist

Famous researcher

Artifact expert

Intellectual rival

Research pioneer

Dangerous or controversial scientist


Medic

Famous healer

Humanitarian

Outbreak specialist

Enemy collaborator

Medical expert


Diplomat

Statesperson

Negotiator

Treaty architect

Manipulator

Political rival

Known liar



---

Influence and Havens

Influence can modify a mission before the team leaves the Gate Room.

For example:

> Engineer: Influence 8



At a friendly technical Haven:

> Recognized Expert



The Haven may escort the Engineer directly to its infrastructure or research facilities.

At another Haven:

> Known Forbidden Technology Researcher



The Haven may refuse to allow the team beyond the Gate Room.

This creates situations where a lower-Influence unit may be strategically preferable.


---

Influence and Bluff

High Influence can help or hurt Bluff attempts.

An anonymous unit may have an easier time pretending to be:

> Mercenary
Technician
Inspector
Trader



A famous unit may be immediately recognized.

However, some cover stories may become more believable because of that reputation.

Influence therefore creates situational advantages rather than a universal social bonus.


---

Endurance

Endurance represents:

> How well a unit's mind and body are prepared to withstand physical, biological, environmental, and operational stress.



Endurance primarily determines how strongly individual consequences affect the unit.

It does not generally determine whether the party succeeds at an encounter.


---

Party Failure, Individual Consequences

Skill checks occur once for the entire party, but some consequences are resolved individually using Endurance.

Example:

The Scout fails a Navigation check while crossing a damaged bridge.

> Party Consequence: Fall damage and Stamina loss.



Every unit falls.

Endurance determines how badly each individual is affected.

A high-Endurance unit might receive:

Minor HP loss

Minor Stamina loss

No lasting Injury


A low-Endurance unit might receive:

Significant HP loss

Significant Stamina loss

Injury

Downed state


The acting unit therefore succeeds or fails for the party, while individual units survive the consequences differently.


---

Endurance Effects

Endurance can affect:

Maximum HP

Resistance to encounter damage

Environmental damage

Fall damage

Poison damage

Disease severity

Biological hazards

Chance of receiving an Injury

Incoming healing effectiveness

HP restored when recovering from Downed

Chance of reducing Injury severity during treatment

Recovery time from disease or illness


Endurance does not increase maximum Stamina.

Endurance does not increase normal Stamina regeneration.

Endurance does not make a Medic better at healing another unit.

The Medic determines the quality of treatment.

The patient's Endurance determines how effectively their body responds.


---

HP

HP represents:

> The unit's immediate physical condition.



Damage reduces HP.

At 0 HP, the unit enters the Downed state rather than immediately dying.

Endurance influences:

Maximum HP

Damage mitigation from certain encounter consequences

Incoming healing

Downed recovery

Injury likelihood


Permanent death should remain rare.


---

Injuries and Illness

Injuries represent longer-term consequences that cannot necessarily be solved by simply restoring HP.

Examples:

Fracture

Burns

Concussion

Internal injury

Infection

Poisoning

Alien disease

Radiation exposure


Endurance can influence:

Whether an Injury occurs

Injury severity

Response to treatment

Recovery duration


These conditions can continue affecting units after returning to the SGC.


---

Stamina

Stamina represents:

> How much productive work a unit can reasonably perform before requiring rest.



Every unit has:

> 100 Maximum Stamina



Maximum Stamina is fixed.

There are no naturally high-Stamina or low-Stamina units.


---

Stamina Time Scale

100 Stamina represents approximately:

> 16 hours of productive activity



followed by approximately:

> 8 hours of rest



As a baseline, this corresponds approximately to:

> 6.25 Stamina consumed per working hour.



> 12.5 Stamina restored per resting hour.



These values provide an underlying simulation baseline and do not necessarily need to be shown directly to the player.


---

Stamina as a Rate Limiter

Stamina exists primarily to prevent the player from running the same units continuously.

A unit cannot indefinitely:

> Staff Base → Mission → Staff Base → Mission



without rest.

Instead, personnel naturally move through a cycle:

> Base Work → Offworld Mission → Recovery → Base Work



Stamina creates a natural ebb and flow in unit availability.


---

Shared Base and Offworld Stamina

There is no separate Base Stamina and Mission Stamina.

A unit has one Stamina pool.

If an Engineer returns from a mission with:

> 34 Stamina



and is immediately assigned to Power Generation, they begin that assignment at 34 Stamina.

Likewise, a Scientist pulled from a long Research assignment may begin an offworld mission partially fatigued.

This connects base staffing directly to SG team availability.


---

Base Staffing

Units operate at normal base efficiency while:

> Stamina > 50



There is no significant benefit for keeping a unit at 100 instead of 80.

The player should not feel obligated to constantly rotate rested units.


---

Fatigue Threshold

When Stamina falls below:

> 50



the unit becomes increasingly fatigued.

Normal work may continue, but the chance of accidents and negative events begins increasing.

The lower Stamina falls, the greater the risk.

Conceptually:

51–100

Normal operations.

Below 50

Increasing fatigue risk.

Very Low Stamina

Significant incident risk.

The exact probability curve should be determined during balancing rather than using hard tiers.


---

Base Incidents

Different rooms have their own possible fatigue-related incidents.

Low Stamina increases the probability of those events.

Power Generation

Possible incidents:

Equipment damage

Reduced power

Fire

Unit injury

Temporary shutdown


Artifact Analysis

Possible incidents:

Analysis delay

Artifact damage

Contamination

Artifact activation

Base Defense event


Gate Room

Possible incidents:

Procedure error

Equipment malfunction

Deployment delay

Security incident


Holding Cells

Possible incidents:

Prisoner gains information

Security lapse

Escape attempt


The room determines what can go wrong.

Staff Stamina influences how likely something is to go wrong.

Other stats such as Expertise and Endurance may influence how the resulting event is resolved.


---

Offworld Stamina

Offworld missions consume the same Stamina resource.

Possible Stamina costs include:

Entering unexplored Tiles

Difficult Connections

Navigation

Skill checks

Failed skill checks

Retrying actions

Combat

Environmental conditions

Carrying or assisting VIPs

Downed state

Certain Specialist Kit actions


Stamina therefore functions as the mission's natural expedition clock.


---

Offworld Fatigue

The same 50-Stamina threshold applies offworld.

Above 50:

> Normal operating condition.



Below 50:

> Fatigue begins increasing risk.



This encourages the player to decide how far to push an expedition.

For example:

> Current Stamina: 38
Estimated Extraction Cost: 17



The team effectively has approximately:

> 21 Stamina



available for additional objectives before extraction becomes necessary.

The player may still choose to push farther, but the risks increase.


---

Return Stamina

The minimap should continuously display the estimated Stamina required to return to the Stargate or other extraction point.

This estimate should account for:

Current location

Known routes

Shortcuts

Connection states

Required repeat skill checks

Temporary equipment

Environmental changes


Actions that modify the return route should display the resulting Stamina change before confirmation.


---

Zero Stamina

At:

> 0 Stamina



a unit can no longer continue normal operations.

At the Base

The unit automatically leaves their assignment and reports to the nearest available Living Quarters.

The player cannot force them to continue working.

Offworld

The unit must be removed from active operations.

The exact narrative implementation of emergency evacuation can depend on the mission and extraction mechanics, but mechanically the unit cannot continue participating normally.


---

Rest and Living Quarters

Living Quarters are the primary mechanism for restoring Stamina.

Baseline recovery assumes approximately:

> 8 hours to restore 100 Stamina



Living Quarters can improve recovery through:

Room upgrades

Research

Staffing

Class bonuses

Base events

Other infrastructure


Endurance does not increase normal Stamina recovery.

This keeps the systems distinct:

> Endurance handles physical resilience and medical recovery.



> Living Quarters and base infrastructure handle fatigue recovery.




---

Resource Model

The unit resource system can therefore be summarized as:

HP

> How physically hurt am I right now?



Injuries and Illness

> What longer-term physical consequences am I carrying?



Endurance

> How well does my mind and body withstand harm and respond to recovery?



Stamina

> How much productive work can I continue performing before I require rest?



Together, these systems connect offworld missions, base staffing, medical treatment, Living Quarters, unit availability, and personnel rotation into the same management loop.

The player is not simply managing whether units are alive.

They are managing whether their people are healthy, rested, available, and worth risking on the next assignment.

writing{variant="document" id="stamina-endurance-system" title="Unit Stats, Endurance, HP, and Stamina"}
# Unit Stats, Endurance, HP, and Stamina

## Core Unit Stats

Units currently have five universal stats:

| Stat | Core Question |
|---|---|
| **Navigation** | How well can this unit get the team through the environment? |
| **Perception** | How well can this unit understand what is around them? |
| **Expertise** | How capable is this unit at producing good outcomes within their training? |
| **Influence** | How strongly does the world react to who this unit is? |
| **Endurance** | How well can this unit's mind and body withstand harm, environmental stress, and recovery? |

These are universal stats. Every class possesses all five.

Class, specialization, rank, traits, equipment, and history determine how those stats are expressed.

---

# Navigation

Navigation represents:

> **How effectively can this unit lead the party safely from one location to another?**

Navigation is used for movement-related challenges such as:

- Climbing
- Difficult terrain
- Finding safe routes
- Crossing damaged structures
- Wilderness navigation
- Rappelling
- Crawling through confined spaces
- Moving through hazardous areas
- Quietly navigating areas where detection is possible

Navigation is not exclusive to Scouts.

A unit with high Navigation can successfully lead a team through difficult terrain even if no Scout is present.

A Scout gains advantages through:

- Naturally favorable Navigation
- Scout specializations
- Traits
- Specialist Kits
- Class-specific actions and bypasses

For example, a team without a Scout may still climb a difficult cliff by spending additional Stamina and attempting a harder Navigation check.

A Scout with the correct Specialist Kit may be able to solve the same problem much more safely or efficiently.

---

# Single-Unit Party Checks

Only **one unit performs a skill check** for the party.

The acting unit's stats determine the check.

Other party members modify its difficulty rather than making separate rolls.

For example:

> Scout attempts to quietly move the team through an occupied area.

The Scout performs the Navigation check.

However, the difficulty may be modified by:

- Heavily equipped Soldier
- Injured teammate
- Civilian VIP
- Children
- Large prisoner group
- Current Alert level
- Specialist Kits
- Traits
- Environmental conditions

Success applies to the entire party.

Failure also applies to the entire party.

This same principle applies throughout the encounter system.

---

# Perception

Perception represents:

> **How effectively can this unit gather and interpret information about its surroundings?**

Every class uses the same Perception stat, but **class determines the type of specialized information the unit is able to interpret**.

## Soldier Perception

May reveal:

- Enemy strength
- Elite enemies
- Enemy commanders
- Weapons
- Reinforcements
- Defensive preparations

## Scout Perception

May reveal:

- Footprints
- Patrol routes
- Recent movement
- Hidden paths
- Ambush indicators
- Creature tracks

## Engineer Perception

May reveal:

- Power consumption
- Network connections
- Security systems
- Machinery
- Electrical activity
- Powered doors

## Scientist Perception

May reveal:

- Energy signatures
- Radiation
- Artifact signals
- Unusual materials
- Scientific anomalies

## Medic Perception

May reveal:

- Life signs
- Injured individuals
- Biological contamination
- Disease
- Toxins
- Dead or dying individuals

## Diplomat Perception

May reveal:

- Faction ownership
- Leadership presence
- Social significance
- Political affiliations
- Negotiation opportunities
- Cultural restrictions

A Tile can contain multiple hidden pieces of information.

Different classes examining the same Tile may therefore reveal completely different information.

---

# Expertise

Expertise represents:

> **How good is this unit actually at what they do?**

Expertise does not determine which actions a unit knows.

Class, specialization, rank, traits, and equipment determine training and available actions.

Expertise instead determines the **quality range of possible outcomes** when the unit performs an action.

---

# Encounter Outcome Ladder

Each skill-check action generates an ordered table of possible outcomes ranging from worst to best.

Example:

## Hack Security Door

| Outcome | Result |
|---:|---|
| 1 | Alarm triggered; door remains locked |
| 2 | Terminal damaged; door remains locked |
| 3 | Hack fails; additional Stamina consumed |
| 4 | Hack fails safely; retry available |
| 5 | Door opens but Alert increases |
| 6 | Door opens |
| 7 | Door opens and security information is revealed |
| 8 | Door opens and an adjacent secured door is unlocked |
| 9 | Local security network is compromised |
| 10 | Networked doors unlock and security map is revealed |

The exact number of outcomes may vary during development.

---

# Expertise Window

The player does not play for every possible outcome.

Expertise determines which **four outcomes** are available during the skill-check interaction.

For example:

### Low Effective Expertise

> Outcomes 1–4

The player is primarily trying to avoid disaster.

### Moderate Effective Expertise

> Outcomes 3–6

The check ranges from failure to normal success.

### High Effective Expertise

> Outcomes 5–8

Even poor performance may accomplish something, while good performance creates additional advantages.

### Exceptional Effective Expertise

> Outcomes 7–10

The question is no longer whether the unit succeeds, but how much additional benefit they can create.

The player's performance during the skill-check interaction determines which of the four available outcomes occurs.

---

# Training and Expertise

High Expertise does not make a unit equally capable at every action.

Training determines how much of an action's Outcome Ladder is available.

Conceptually:

> **Training determines the potential ceiling.**

> **Expertise determines where the four-outcome window sits within that available range.**

> **Player performance determines which of those four outcomes occurs.**

For example:

## Engineer Hacking

An Engineer is trained to Hack.

A highly experienced Engineer may have access to nearly the entire Hack Outcome Ladder.

Their Expertise may position their four outcomes near the top:

> 6 / 7 / 8 / 9

## Soldier Hacking

A Soldier may still attempt a basic Hack as an untrained Engineer.

Their available Outcome Ladder may be restricted.

Even a Soldier with extremely high Expertise cannot achieve the most advanced Engineer outcomes.

A veteran Soldier might receive:

> 3 / 4 / 5 / 6

Their high Expertise prevents catastrophic mistakes and may allow basic success, but they cannot completely compromise an enemy security network.

This allows units to attempt tasks outside their normal role without making classes irrelevant.

---

# Difficulty

Encounter difficulty pushes against the unit's effective Expertise window.

A skilled Engineer may easily hack a basic terminal but receive a lower outcome range against an advanced alien security system.

The final outcome window can therefore be influenced by:

- Training
- Expertise
- Encounter difficulty
- Specialization
- Traits
- Specialist Kits
- Party composition
- VIPs
- Environmental conditions
- Current mission state
- Fatigue

The exact mathematical formula should be determined during balancing.

---

# Influence

Influence represents:

> **How significant is this unit's identity, reputation, and presence to other people?**

Influence is **not Charisma** and is not inherently positive.

High Influence means people are more likely to recognize or care about the unit.

Whether that recognition is beneficial depends on the location, faction, Haven, NPC, and unit history.

---

# Influence Is Magnitude, Not Approval

A high-Influence Soldier may arrive at one Haven and be recognized as:

> **Hero of the Battle of P3X-442**

Possible benefits:

- Improved access
- Easier negotiations
- Additional information
- Friendly NPC reactions

The same Soldier might arrive somewhere else and be recognized as:

> **The Villain of P3X-442**

Possible consequences:

- Restricted access
- Increased security
- Hostile reactions
- Bluff penalties
- Revenge encounters

The Influence value has not changed.

The context determines whether that Influence is helpful.

---

# Class-Based Influence

Different classes are likely to develop different types of reputations.

### Soldier

- Military hero
- Commander
- Rival
- Dangerous enemy
- Famous combatant

### Scout

- Explorer
- Pathfinder
- Spy
- Infiltrator
- Thief

### Engineer

- Technical expert
- Inventor
- Saboteur
- Infrastructure specialist
- Practitioner of forbidden technology

### Scientist

- Famous researcher
- Artifact expert
- Intellectual rival
- Research pioneer
- Dangerous or controversial scientist

### Medic

- Famous healer
- Humanitarian
- Outbreak specialist
- Enemy collaborator
- Medical expert

### Diplomat

- Statesperson
- Negotiator
- Treaty architect
- Manipulator
- Political rival
- Known liar

---

# Influence and Havens

Influence can modify a mission before the team leaves the Gate Room.

For example:

> **Engineer: Influence 8**

At a friendly technical Haven:

> **Recognized Expert**

The Haven may escort the Engineer directly to its infrastructure or research facilities.

At another Haven:

> **Known Forbidden Technology Researcher**

The Haven may refuse to allow the team beyond the Gate Room.

This creates situations where a lower-Influence unit may be strategically preferable.

---

# Influence and Bluff

High Influence can help or hurt Bluff attempts.

An anonymous unit may have an easier time pretending to be:

> Mercenary  
> Technician  
> Inspector  
> Trader

A famous unit may be immediately recognized.

However, some cover stories may become more believable because of that reputation.

Influence therefore creates situational advantages rather than a universal social bonus.

---

# Endurance

Endurance represents:

> **How well a unit's mind and body are prepared to withstand physical, biological, environmental, and operational stress.**

Endurance primarily determines how strongly **individual consequences** affect the unit.

It does not generally determine whether the party succeeds at an encounter.

---

# Party Failure, Individual Consequences

Skill checks occur once for the entire party, but some consequences are resolved individually using Endurance.

Example:

The Scout fails a Navigation check while crossing a damaged bridge.

> **Party Consequence:** Fall damage and Stamina loss.

Every unit falls.

Endurance determines how badly each individual is affected.

A high-Endurance unit might receive:

- Minor HP loss
- Minor Stamina loss
- No lasting Injury

A low-Endurance unit might receive:

- Significant HP loss
- Significant Stamina loss
- Injury
- Downed state

The acting unit therefore succeeds or fails **for the party**, while individual units survive the consequences differently.

---

# Endurance Effects

Endurance can affect:

- Maximum HP
- Resistance to encounter damage
- Environmental damage
- Fall damage
- Poison damage
- Disease severity
- Biological hazards
- Chance of receiving an Injury
- Incoming healing effectiveness
- HP restored when recovering from Downed
- Chance of reducing Injury severity during treatment
- Recovery time from disease or illness

Endurance does **not** increase maximum Stamina.

Endurance does **not** increase normal Stamina regeneration.

Endurance does **not** make a Medic better at healing another unit.

The Medic determines the quality of treatment.

The patient's Endurance determines how effectively their body responds.

---

# HP

HP represents:

> **The unit's immediate physical condition.**

Damage reduces HP.

At 0 HP, the unit enters the **Downed** state rather than immediately dying.

Endurance influences:

- Maximum HP
- Damage mitigation from certain encounter consequences
- Incoming healing
- Downed recovery
- Injury likelihood

Permanent death should remain rare.

---

# Injuries and Illness

Injuries represent longer-term consequences that cannot necessarily be solved by simply restoring HP.

Examples:

- Fracture
- Burns
- Concussion
- Internal injury
- Infection
- Poisoning
- Alien disease
- Radiation exposure

Endurance can influence:

- Whether an Injury occurs
- Injury severity
- Response to treatment
- Recovery duration

These conditions can continue affecting units after returning to the SGC.

---

# Stamina

Stamina represents:

> **How much productive work a unit can reasonably perform before requiring rest.**

Every unit has:

> **100 Maximum Stamina**

Maximum Stamina is fixed.

There are no naturally high-Stamina or low-Stamina units.

---

# Stamina Time Scale

100 Stamina represents approximately:

> **16 hours of productive activity**

followed by approximately:

> **8 hours of rest**

As a baseline, this corresponds approximately to:

> 6.25 Stamina consumed per working hour.

> 12.5 Stamina restored per resting hour.

These values provide an underlying simulation baseline and do not necessarily need to be shown directly to the player.

---

# Stamina as a Rate Limiter

Stamina exists primarily to prevent the player from running the same units continuously.

A unit cannot indefinitely:

> Staff Base → Mission → Staff Base → Mission

without rest.

Instead, personnel naturally move through a cycle:

> **Base Work → Offworld Mission → Recovery → Base Work**

Stamina creates a natural ebb and flow in unit availability.

---

# Shared Base and Offworld Stamina

There is no separate Base Stamina and Mission Stamina.

A unit has one Stamina pool.

If an Engineer returns from a mission with:

> 34 Stamina

and is immediately assigned to Power Generation, they begin that assignment at 34 Stamina.

Likewise, a Scientist pulled from a long Research assignment may begin an offworld mission partially fatigued.

This connects base staffing directly to SG team availability.

---

# Base Staffing

Units operate at normal base efficiency while:

> **Stamina > 50**

There is no significant benefit for keeping a unit at 100 instead of 80.

The player should not feel obligated to constantly rotate rested units.

---

# Fatigue Threshold

When Stamina falls below:

> **50**

the unit becomes increasingly fatigued.

Normal work may continue, but the chance of accidents and negative events begins increasing.

The lower Stamina falls, the greater the risk.

Conceptually:

### 51–100

Normal operations.

### Below 50

Increasing fatigue risk.

### Very Low Stamina

Significant incident risk.

The exact probability curve should be determined during balancing rather than using hard tiers.

---

# Base Incidents

Different rooms have their own possible fatigue-related incidents.

Low Stamina increases the probability of those events.

## Power Generation

Possible incidents:

- Equipment damage
- Reduced power
- Fire
- Unit injury
- Temporary shutdown

## Artifact Analysis

Possible incidents:

- Analysis delay
- Artifact damage
- Contamination
- Artifact activation
- Base Defense event

## Gate Room

Possible incidents:

- Procedure error
- Equipment malfunction
- Deployment delay
- Security incident

## Holding Cells

Possible incidents:

- Prisoner gains information
- Security lapse
- Escape attempt

The **room determines what can go wrong**.

Staff Stamina influences **how likely something is to go wrong**.

Other stats such as Expertise and Endurance may influence how the resulting event is resolved.

---

# Offworld Stamina

Offworld missions consume the same Stamina resource.

Possible Stamina costs include:

- Entering unexplored Tiles
- Difficult Connections
- Navigation
- Skill checks
- Failed skill checks
- Retrying actions
- Combat
- Environmental conditions
- Carrying or assisting VIPs
- Downed state
- Certain Specialist Kit actions

Stamina therefore functions as the mission's natural expedition clock.

---

# Offworld Fatigue

The same 50-Stamina threshold applies offworld.

Above 50:

> Normal operating condition.

Below 50:

> Fatigue begins increasing risk.

This encourages the player to decide how far to push an expedition.

For example:

> **Current Stamina:** 38  
> **Estimated Extraction Cost:** 17

The team effectively has approximately:

> **21 Stamina**

available for additional objectives before extraction becomes necessary.

The player may still choose to push farther, but the risks increase.

---

# Return Stamina

The minimap should continuously display the estimated Stamina required to return to the Stargate or other extraction point.

This estimate should account for:

- Current location
- Known routes
- Shortcuts
- Connection states
- Required repeat skill checks
- Temporary equipment
- Environmental changes

Actions that modify the return route should display the resulting Stamina change before confirmation.

---

# Zero Stamina

At:

> **0 Stamina**

a unit can no longer continue normal operations.

## At the Base

The unit automatically leaves their assignment and reports to the nearest available Living Quarters.

The player cannot force them to continue working.

## Offworld

The unit must be removed from active operations.

The exact narrative implementation of emergency evacuation can depend on the mission and extraction mechanics, but mechanically the unit cannot continue participating normally.

---

# Rest and Living Quarters

Living Quarters are the primary mechanism for restoring Stamina.

Baseline recovery assumes approximately:

> **8 hours to restore 100 Stamina**

Living Quarters can improve recovery through:

- Room upgrades
- Research
- Staffing
- Class bonuses
- Base events
- Other infrastructure

Endurance does not increase normal Stamina recovery.

This keeps the systems distinct:

> **Endurance handles physical resilience and medical recovery.**

> **Living Quarters and base infrastructure handle fatigue recovery.**

---

# Resource Model

The unit resource system can therefore be summarized as:

### HP

> How physically hurt am I right now?

### Injuries and Illness

> What longer-term physical consequences am I carrying?

### Endurance

> How well does my mind and body withstand harm and respond to recovery?

### Stamina

> How much productive work can I continue performing before I require rest?

Together, these systems connect offworld missions, base staffing, medical treatment, Living Quarters, unit availability, and personnel rotation into the same management loop.

The player is not simply managing whether units are **alive**.

They are managing whether their people are **healthy, rested, available, and worth risking on the next assignment**.

# Unit Training, Specialization, Cross-Training, and Specialist Kit Progression

## Overview

Unit career progression is built around a choice between **depth and flexibility**.

Every unit begins with one of the six base classes and progresses through four levels of class training:

> **Untrained → Trained → Advanced → Expert**

After becoming an Expert in their first class, the unit makes a permanent career choice:

1. **Specialize** and continue developing their existing class while learning a related specialization.
2. **Cross-Train** and stop advancing their existing class in order to learn a second base class.

A fully developed unit therefore ends as either:

> **Master Class + Expert Specialization**

or:

> **Expert Class + Expert Class**

Neither path should be inherently superior.

Specialists provide exceptional depth and unique solutions.

Cross-trained units provide exceptional flexibility and broader access to actions and equipment.

---

# Base Class Progression

The first four stages of unit progression are dedicated to the unit's initial base class.

For example:

1. Engineer: Untrained
2. Engineer: Trained
3. Engineer: Advanced
4. Engineer: Expert

During these stages, the unit improves their core Engineer actions.

Possible Engineer actions might eventually include:

* Hack
* Repair
* Disable
* Operate System
* Diagnose Equipment
* Basic Demolition

Training determines which portions of an action's Outcome Ladder the unit can potentially access.

Expertise determines which four outcomes within that available range are presented during the skill check.

---

# Career Choice

Upon reaching Expert in a base class, the unit chooses between:

> **Specialization**

or:

> **Cross-Training**

This determines how stages 5 through 8 are spent.

---

# Specialization Path

A specialization represents continued development within the unit's original profession.

For example:

> **Engineer → Explosives Specialist**

Progression might appear as:

1. Engineer: Untrained
2. Engineer: Trained
3. Engineer: Advanced
4. Engineer: Expert
5. Engineer development + Explosives Specialist: Untrained
6. Engineer development + Explosives Specialist: Trained
7. Engineer development + Explosives Specialist: Advanced
8. Engineer: Master + Explosives Specialist: Expert

The unit continues practicing and developing their core Engineering abilities throughout stages 5 through 8.

The specialization develops **in addition to**, rather than instead of, Engineering.

---

# Master Training

Master represents the additional base-class development gained by choosing specialization instead of cross-training.

An Engineer/Explosives Specialist is therefore a better Engineer than an Engineer/Soldier.

For example:

> **Engineer / Explosives Specialist**
> Engineering: Master
> Explosives: Expert

versus:

> **Engineer / Soldier**
> Engineering: Expert
> Soldier: Expert

Master-level characters have access to better potential outcomes when performing their base-class actions.

Their specialization also provides new actions that normal members of the base class would not attempt.

---

# Specializations Add Capabilities

Specializations should not simply provide numerical bonuses to existing abilities.

They provide **additional actions, encounter solutions, equipment, and exceptional outcomes**.

For example, an Engineer may already have access to basic demolition.

An Explosives Specialist might gain actions such as:

* Shape Charge
* Controlled Breach
* Structural Demolition
* Explosive Trap
* Remote Detonation
* Ordnance Disposal
* Precision Demolition

These are actions a normal Engineer would not reasonably attempt.

The specialist therefore gains new ways to solve problems while continuing to improve their general Engineering abilities.

---

# Cross-Training Path

Instead of specializing, an Expert unit can begin training in another base class.

For example:

> **Engineer → Soldier**

Progression becomes:

1. Engineer: Untrained
2. Engineer: Trained
3. Engineer: Advanced
4. Engineer: Expert
5. Engineer: Expert + Soldier: Untrained
6. Engineer: Expert + Soldier: Trained
7. Engineer: Expert + Soldier: Advanced
8. Engineer: Expert + Soldier: Expert

Once cross-training begins, **Engineering stops progressing**.

The unit does not lose any Engineering training.

They remain an Expert Engineer permanently.

However, the next four stages are spent learning Soldier capabilities rather than continuing toward Engineering mastery.

---

# Class Order Does Not Matter at Full Development

Cross-training does not use a primary-class/subclass system.

These characters:

> **Engineer / Soldier**

and:

> **Soldier / Engineer**

should have identical access to Engineer and Soldier resources once both classes reach Expert.

Both characters have spent:

> Four stages developing Engineering.

> Four stages developing Soldier.

Therefore, both receive:

* Expert Engineer actions
* Expert Soldier actions
* The same Engineer Outcome Ladder ceilings
* The same Soldier Outcome Ladder ceilings
* Engineer Specialist Kit access
* Soldier Specialist Kit access

Their stats, traits, history, Influence, and equipment selections may still make them different individuals.

Class order itself does not provide a mechanical advantage.

---

# Specialist vs Cross-Trained Comparison

A fully developed unit therefore follows one of two structures.

## Specialist

> **Master Class A + Expert Specialization A**

Provides:

* Maximum development of Class A
* Unique specialization actions
* Specialization-specific encounter solutions
* Access to Class A Specialist Kits
* Access to Specialization A Specialist Kits

Primary strength:

> **Depth**

---

## Cross-Trained

> **Expert Class A + Expert Class B**

Provides:

* Full Expert development of Class A
* Full Expert development of Class B
* Actions from both base classes
* Access to Class A Specialist Kits
* Access to Class B Specialist Kits

Primary strength:

> **Flexibility**

---

# Symmetrical Cross-Training

Specialists should be equally superior to both possible cross-training orders within their area of mastery.

For example:

> Engineer / Explosives Specialist

should have the same Engineering advantage over:

> Engineer / Soldier

and:

> Soldier / Engineer

The first class selected should not secretly provide additional mastery.

Conceptually:

| Unit                  | Engineering | Soldier    | Explosives |
| --------------------- | ----------- | ---------- | ---------- |
| Engineer / Explosives | **Master**  | None       | **Expert** |
| Engineer / Soldier    | **Expert**  | **Expert** | None       |
| Soldier / Engineer    | **Expert**  | **Expert** | None       |

This prevents the system from becoming a disguised primary/subclass system.

---

# Second Specialist Kit Slot

The second half of unit progression also provides access to a **second Specialist Kit slot**.

Both specialists and cross-trained units receive the same equipment capacity.

Neither career path is penalized with fewer equipment slots.

The difference is which equipment pools they can access.

---

# Cross-Trained Kit Loadouts

A cross-trained unit can equip Specialist Kits belonging to either of their base classes.

For example:

> **Engineer / Soldier**

can equip:

### Engineer + Engineer

Example:

> Hacking Kit + Repair Kit

The unit is configured heavily toward Engineering for this mission.

### Soldier + Soldier

Example:

> Heavy Weapons Kit + Capture Kit

The same character is configured heavily toward combat.

### Engineer + Soldier

Example:

> Hacking Kit + Capture Kit

The character enters the mission prepared to handle both categories.

This flexibility is one of the major advantages of cross-training.

---

# Specialist Kit Loadouts

A specialized unit can equip equipment belonging to either their base class or specialization.

For example:

> **Engineer / Explosives Specialist**

can equip:

### Engineer + Engineer

Example:

> Hacking Kit + Repair Kit

The character uses their Master-level Engineering training to handle general Engineering problems extremely effectively.

### Explosives + Explosives

Example:

> Shaped Charges + Demolition Equipment

The character is configured to make an exceptional impact on problems specifically related to their specialization.

### Engineer + Explosives

Example:

> Hacking Kit + Shaped Charges

The character has tools for ordinary Engineering problems while reserving specialized equipment for challenges requiring significantly greater capability.

---

# Training Still Matters When Using Kits

Specialist Kits do not replace training.

They modify, enable, bypass, or improve actions that are still supported by the unit's training.

Therefore, an:

> Engineer / Soldier

using two Engineer Kits is still an **Expert Engineer**.

An:

> Engineer / Explosives Specialist

using those same two Engineer Kits is a **Master Engineer**.

The specialist should be noticeably better at exploiting the same Engineering equipment because they continued developing Engineering after the Expert stage.

---

# Mission Intelligence and Loadout Selection

Mission intelligence makes the Specialist Kit system strategically important.

For example:

> **Limited Intelligence:**
> Enemy facility detected.

A cross-trained Engineer/Soldier may hedge against uncertainty:

> Engineer Kit + Soldier Kit

Better intelligence might reveal:

> **Heavy electronic security. Minimal hostile resistance.**

The same Engineer/Soldier can respond by equipping:

> Engineer Kit + Engineer Kit

The unit temporarily leans heavily into one side of their training.

A specialized Engineer/Systems Specialist might instead equip:

> Systems Kit + Systems Kit

and exploit the highly specific intelligence to make an exceptional impact.

This creates a useful distinction:

> **Cross-trained units adapt well to changing or uncertain requirements.**

> **Specialists capitalize more heavily on accurate intelligence.**

---

# Duplicate Classes

The two-kit system makes duplicate and overlapping classes valuable.

For example, an SG team might contain:

> Engineer / Soldier

and:

> Engineer / Systems Specialist

This is not necessarily redundant.

If heavy resistance is expected:

**Engineer/Soldier**

> Soldier Kit + Soldier Kit

**Engineer/Systems Specialist**

> Engineer Kit + Systems Kit

If extensive technical challenges are expected:

**Engineer/Soldier**

> Engineer Kit + Engineer Kit

**Engineer/Systems Specialist**

> Systems Kit + Systems Kit

The same characters can therefore create very different team compositions depending on their mission loadouts.

---

# Party Composition and Contextual Actions

Class training and equipped Specialist Kits also contribute to the **identity of the party as a whole**.

This is particularly important for actions such as:

> **Bluff**

A Diplomat does not simply make a Bluff check based on their own stats.

The proposed cover story must make sense when compared with:

* Party composition
* Class training
* Equipped Specialist Kits
* VIPs
* Clothing/equipment
* Influence
* Known character history
* Faction intelligence

---

# Example: Mercenary Bluff

Consider this team:

> Soldier / Medic
> Soldier / Engineer
> Soldier / Diplomat
> Soldier / Marksman

Every member has Soldier training.

If each member also equips at least one Soldier-specific Specialist Kit, the team visibly presents itself as a heavily equipped military group.

A Diplomat could therefore receive:

> **BLUFF: Mercenary Company**

with a strong party-plausibility modifier.

The Bluff works not simply because a Diplomat pressed the Bluff button.

The **entire team supports the lie**.

The Soldier/Diplomat performs the actual check, but the composition and equipment of the party modify that check.

---

# Equipment as Part of Party Identity

Specialist Kits therefore serve two purposes.

They provide mechanical tools for solving encounters, but they also communicate **what the SG team appears prepared to do**.

A group carrying:

> Heavy weapons
> Breaching equipment
> Combat medical equipment
> Marksman equipment

looks like a mercenary or military team.

A group carrying:

> Analysis equipment
> Engineering tools
> Medical equipment
> Scientific sensors

may plausibly present itself as a technical or scientific expedition.

A Diplomat's Bluff options can therefore emerge dynamically from what the team actually looks like.

This reinforces the larger rule:

> **The encounter does not contain a fixed list of solutions. The people, training, equipment, history, and circumstances of the SG team generate the available solutions.**

---

# Career Progression Design Principle

The two career paths should remain valuable for different reasons.

## Specialist

> **Master A + Expert Specialization A**

Provides:

* Greater base-class mastery
* Unique specialization actions
* Higher base-class outcome potential
* Specialized equipment
* Exceptional performance when mission requirements are known

## Cross-Trained

> **Expert A + Expert B**

Provides:

* Two complete base-class action sets
* Two base-class equipment pools
* A+A, B+B, or A+B loadouts
* Greater ability to change roles between missions
* Greater party-composition flexibility
* More potential contextual and Bluff identities

The choice is therefore not:

> **Strong character vs weak character**

It is:

> **How much of this unit's value should come from depth, and how much should come from flexibility?**

This choice should remain meaningful throughout the game, particularly because improved probe and Logistics intelligence allows the player to make increasingly informed decisions about which people and Specialist Kits to send through the Stargate.


# Unit Classes and Specializations

## Design Philosophy

Units use a **Base Class + Specialization or Cross-Training** progression system.

There are six Base Classes:

- Soldier
- Scout
- Technician
- Scientist
- Medic
- Diplomat

Each Base Class has three Specializations.

Base Classes represent broad professional competence. Specializations do not replace the Base Class. A specialized unit continues developing their Base Class while gaining access to a narrower set of specialized solutions.

After reaching Expert in their Base Class, a unit chooses between:

1. **Specialization**
   - Continue developing the Base Class to Master.
   - Begin developing one of that class's Specializations.
   - Final potential progression:
     - Base Class: Master
     - Specialization: Expert

2. **Cross-Training**
   - Stop progression in the original Base Class at Expert.
   - Begin training in another Base Class.
   - Final potential progression:
     - Base Class A: Expert
     - Base Class B: Expert

A cross-trained unit does not continue progressing their original Base Class while learning the second class.

An Expert Technician / Expert Soldier and an Expert Soldier / Expert Technician therefore have access to the same class capabilities at the same training levels.

A specialized unit is intentionally deeper:

> Master Technician / Expert Demolitions

while a cross-trained unit is intentionally broader:

> Expert Technician / Expert Soldier

Neither progression path should be universally superior.

---

# Global Training Levels

Training levels have consistent meanings across all classes and specializations.

## Untrained

Basic familiarity or improvised capability.

The unit can attempt straightforward actions but has:

- Limited available actions
- Lower outcome ceilings
- Greater potential consequences
- Limited ability to exploit complex situations

## Trained

Professional competence.

The unit can reliably perform normal work associated with the discipline.

## Advanced

Experienced professional capability.

The unit can handle difficult situations and begin exploiting opportunities beyond the obvious solution.

## Expert

Exceptional professional capability.

The unit can solve unusually difficult problems and create advantages beyond the immediate objective.

Expert is the highest Base Class level available to cross-trained units.

## Master

Exceptional capability achieved through continued dedication to the unit's original Base Class.

Master is only available through Specialization.

Mastery should generally increase the **scale, flexibility, or consequences** of normal class actions rather than simply adding arbitrary new actions.

Specializations themselves progress:

> Untrained → Trained → Advanced → Expert

A fully developed specialized character could therefore be:

> Master Soldier / Expert Guardian

---

# Class Tools

Each class and specialization has a corresponding generic Tool category.

Tools are represented as:

> `<Quality> <Training Level> <Class/Specialization> Tools`

Examples:

> Basic Master Technician Tools  
> Epic Advanced Scout Tools  
> Fine Expert Guardian Tools

Tools should NOT be designed around individual encounter problems.

The encounter determines what the tools represent contextually.

For example, Guardian Tools might manifest as a portable shield generator during a VIP encounter, while Marksman Tools might manifest as a sniper rifle or rocket launcher.

## Tool Training Level

Training Level determines the maximum level of effect the Tools can support.

A unit cannot use Tools beyond their own training capability.

Effective Tool Level is therefore limited by the lower of:

- Unit Training
- Tool Training

## Tool Quality

Quality determines the number of charges.

Illustrative structure:

| Quality | Charges |
|---|---:|
| Basic | 3 |
| Fine | 5 |
| Superior | 7 |
| Epic | 10 |

Exact values remain subject to balancing.

This creates a meaningful equipment choice between:

> Few high-impact charges

and:

> Many lower-impact charges

For example:

> Basic Master Technician Tools

may provide only a few Master-level interventions.

> Epic Advanced Technician Tools

may provide many Advanced-level interventions.

## Charge Consumption

Using Tools does not automatically consume a charge.

Charge consumption can be part of the encounter Outcome Table.

A poor result might solve the problem but consume a charge.

A strong result might solve the same problem while preserving the charge.

Expertise therefore indirectly affects equipment efficiency.

## Equipment Slots

Advanced unit progression provides a second class-specific Tool slot.

Specialized units can choose:

- Base + Base
- Base + Specialization
- Specialization + Specialization

Cross-trained units can choose:

- Class A + Class A
- Class A + Class B
- Class B + Class B

This makes cross-trained units highly flexible without making them as capable at specialized actions as dedicated specialists.

---

# Global Perception Rules

Perception is primarily a **visual information system**.

Information detected through Perception must be represented in the environment.

The player should see what caused the unit to reach their conclusion.

Examples include:

- Footprints
- Wires along walls
- Blood trails
- Faction markings
- Weapon damage
- Drag marks
- Electrical activity
- Biological contamination
- Energy effects
- Red indicators suggesting hostile presence

Detected information should:

1. Become visually apparent on the Tile.
2. Receive a highlight or other readable visual treatment.
3. Be accompanied by text explaining the unit's interpretation.
4. Remain represented on the Tile or map when appropriate.

The player is not expected to manually notice tiny environmental details.

The fantasy is:

> "My unit noticed this."

not:

> "I happened to notice something my unit didn't."

Perception determines whether evidence is noticed within a unit's professional domain.

Training determines how much meaning the unit can extract from that evidence.

---

# Soldier

## Core Identity

> **Control dangerous people and situations.**

Soldiers are not simply the class that deals the most damage.

Combat is primarily automatic, so Soldier training also creates opportunities to control how violent encounters develop.

Soldier training can affect:

- Automatic combat performance
- Target selection
- Capturing enemies
- Intimidation
- Threat management
- Protection
- Combat initiation
- Security encounters

## Perception

Soldiers recognize threats and evidence of violence.

Possible visual information includes:

- Weapon damage
- Defensive positions
- Firing lanes
- Patrol evidence
- Signs of recent combat
- Enemy equipment
- Reinforcement routes
- Heavy weapons
- Command personnel

## Base Bonus

> **Soldiers reduce the severity of hostile Base Incidents.**

They may:

- Inflict initial damage during Gate incursions
- Improve containment during prisoner incidents
- Reduce initial damage during attacks
- Improve security response once an incident begins

## Specializations

### Marksman

> **Focus on the priority threat.**

Core question:

> "Who needs to go down first?"

Marksmen specialize in precision and target priority.

Typical combat effect:

> Deal opening damage against important enemy units before normal combat begins.

Possible targets include:

- Commanders
- Bosses
- Heavy units
- Enemies with dangerous Downed abilities
- Enemies preparing reinforcements

Marksman Tools might contextually appear as:

- Sniper rifles
- Rocket launchers
- Specialized ammunition
- Targeting equipment

**Design shorthand:**

> Control the priority threat.

---

### Guardian

> **Focus on who must remain safe.**

Core question:

> "Who absolutely cannot go down?"

Guardians specialize in:

- VIP protection
- Protecting Downed allies
- Civilian protection
- Prisoner escort
- Defensive positions
- Extraction
- Protecting vulnerable units during interactions

Typical combat effect:

> Prevent the first round of incoming damage against a protected target.

Guardian Tools might manifest as:

- Portable shield generators
- Deployable cover
- Protective equipment
- Extraction equipment

Guardian training can also make otherwise dangerous VIP traversal options possible.

**Design shorthand:**

> Control who is vulnerable.

---

### Tactician

> **Focus on controlling the engagement.**

Core question:

> "How do we make this fight happen on our terms?"

Tacticians specialize in:

- Ambushes
- Initiative
- Suppression
- Coordinated attacks
- Reinforcement control
- Withdrawal
- Capture coordination

Typical combat effect:

> Allow allied units to deal their opening damage before normal enemy attacks begin.

Tactician Tools might manifest as:

- Flash grenades
- Smoke
- Communication equipment
- Distraction devices
- Coordinated breaching equipment

**Design shorthand:**

> Control the engagement.

---

# Scout

## Core Identity

> **Reduce uncertainty about where the team is going and get them there safely.**

Navigation and Perception remain universal stats.

Scout training does not replace them.

Instead, Scouts are especially capable of turning environmental information into exploration decisions.

Base Scout training is particularly useful for understanding what is immediately beyond the team's current position.

Possible actions include:

- Recon
- Assess Route
- Observe
- Follow Trail
- Conceal Movement
- Examine Passage

Advanced Scout actions and Tools may partially reveal adjacent Tiles before entry.

## Perception

Scouts recognize evidence of movement and environmental activity.

Possible visual information includes:

- Footprints
- Tracks
- Disturbed terrain
- Recently opened doors
- Drag marks
- Patrol paths
- Worn flooring
- Climbing marks
- Creature trails
- Signs of recent passage

## Base Bonus

> **Scouts reduce response time to Base Incidents.**

Depending on the situation, Scouts may:

- Reach nearby incidents faster
- Move quickly toward Security Posts
- Report incursions sooner
- Provide earlier warning of developing incidents

Whatever is happening, the Scout helps the base respond sooner.

## Specializations

### Pathfinder

> **Focus on getting to the next Tile.**

Core question:

> "How do we get from here to there?"

Pathfinders specialize in:

- Tile connections
- Alternate routes
- Difficult traversal
- Vertical movement
- Shortcuts
- Return routes
- Traversal consequences
- Temporary routes

Pathfinders should generally create **better route choices** rather than providing a universal Stamina discount.

**Design shorthand:**

> Find a better way.

---

### Tracker

> **Focus on finding the right Tile.**

Core question:

> "Where should we be looking?"

Trackers reduce the search space rather than simply revealing objectives.

They may:

- Eliminate unlikely Tiles
- Highlight probable Tiles
- Follow target movement
- Predict patrol routes
- Identify recently occupied areas
- Estimate where a target is heading

Better Tracker training allows useful conclusions to be reached from weaker or more distant evidence.

**Design shorthand:**

> Find where we should go.

---

### Observer

> **Focus on significant details within the current Tile.**

Core question:

> "What did everyone else miss?"

Observers are strongest after an encounter has been resolved and the immediate danger has passed.

They passively recognize evidence suggesting that something concealed or overlooked may exist.

Observation itself does not cost Stamina.

If sufficient evidence exists, the Observer may expose an active interaction such as:

> **Investigate Further**  
> Stamina: 4

The player should NOT receive generic Search actions on Tiles where nothing meaningful exists.

The uncertainty should be:

> "Is this hidden thing worth the Stamina?"

not:

> "Did the designer put anything here?"

Observers may expose:

- Hidden resources
- Intelligence
- Research
- Secret doors
- Concealed passages
- Hidden NPCs
- Evidence
- Mission information
- New mission branches

Better Observer training can identify clues earlier.

Example:

A high-level Observer notices drag marks one Tile before reaching a hidden cache.

A lower-level Observer may not recognize the significance until standing in the Tile containing the concealed object.

**Design shorthand:**

> Recognize what others overlooked.

---

# Technician

## Core Identity

> **Understand how technology is supposed to work and make it work.**

The Technician replaces the broader "Engineer" Base Class.

The Technician is someone who has effectively "read the manual."

They can:

- Operate
- Repair
- Maintain
- Diagnose
- Bypass
- Restore
- Manipulate familiar systems

Specializations represent ways of intentionally going **beyond the manual**.

## Perception

Technicians recognize:

- Wiring
- Power flow
- Machinery
- Technological systems
- Damaged equipment
- Network connections
- Powered doors
- Infrastructure
- Automated systems

## Base Bonus

> **Technicians reduce machinery and infrastructure-related incident risk in staffed rooms.**

Exact effects can vary by room.

## Specializations

### Demolitions

> **Subtractive solutions.**

Core question:

> "What can I safely remove?"

Demolitions specializes in:

- Breaching
- Controlled destruction
- Structural demolition
- Explosive traps
- Ordnance
- Directional destruction
- Destroying specific components while preserving others

The specialty is not simply making larger explosions.

It is **controlling destruction**.

**Design shorthand:**

> Remove it.

---

### Integrations

> **Exploit connections between systems.**

Core question:

> "What can I connect this to?"

Integrations specializes in:

- Interfacing technologies
- Networks
- Connected security systems
- Communications
- Rerouting
- Piggybacking systems
- Making incompatible technologies interact
- Exploiting system relationships

**Design shorthand:**

> Connect it.

---

### Overdrive

> **Extract maximum short-term performance at the expense of longevity.**

Core question:

> "How much can we get out of this before it breaks?"

Overdrive specializes in:

- Bypassing safeguards
- Increasing output
- Extending range
- Increasing speed
- Temporarily exceeding specifications
- Consuming system lifespan for immediate benefit

Examples:

- Triple generator output temporarily
- Increase shield strength until emitters fail
- Extend transporter range
- Increase sensor range until components burn out
- Override weapon safety limits

Overdrive differs from Demolitions because destruction is not the objective.

The system is being **consumed for value**, and destruction may be the price.

**Design shorthand:**

> Push it.

---

# Scientist

## Core Identity

> **Understand unknown phenomena and turn that understanding into new capabilities.**

Scientists are particularly important to Base progression.

Scientists assigned to rooms can generate vertical progression Research associated with that room.

Examples:

Scientist in Power Generation:

- Improved generator efficiency
- New power generation technology
- Reduced fuel/resource requirements

Scientist staffing can also occasionally result in:

- Additional output
- Reduced cost
- Improved efficiency
- New Research opportunities

All rooms should benefit from vertical progression because Scientists have studied and improved them.

## Perception

Scientists recognize:

- Energy signatures
- Radiation
- Unusual materials
- Artifacts
- Scientific anomalies
- Geological evidence
- Unknown technology signatures
- Experimental phenomena

## Specialization Philosophy

Scientist Specializations are based on **scale**, not scientific discipline.

The question is not:

> "What kind of science do you know?"

It is:

> "At what scale are you trained to turn scientific understanding into a solution?"

### Applied Scientist

> **Individual/object scale.**

Focuses on:

- Individual people
- Individual objects
- Personal equipment
- Weapons
- Personal shields
- Handheld technology
- Small Artifacts

Example:

> Personal Shield

**Design shorthand:**

> Make it work for this.

---

### Operational Scientist

> **Team/room/facility scale.**

Focuses on:

- Teams
- Rooms
- Vehicles
- Laboratories
- Local environmental systems
- Area defenses
- Room-level shields
- Facility sections

Example:

> Gate Room Shield

**Design shorthand:**

> Make it work here.

---

### Strategic Scientist

> **Base/Haven/colony scale.**

Focuses on:

- Bases
- Havens
- Colonies
- Populations
- Large infrastructure
- Large communication networks
- Colony defenses
- Base-wide shields

Example:

> SGC Shield System

**Design shorthand:**

> Make it work everywhere.

---

## Related Research

The same discovery can generate Research at multiple scales.

For example:

> Alien Shield Technology

could eventually produce:

**Applied**
- Personal Shield

**Operational**
- Gate Room Shield
- Containment Field

**Strategic**
- SGC Shield
- Haven Defense Shield

Researching one scale does not automatically grant another.

However, related Research may reduce the cost or difficulty of developing applications at other scales.

---

# Medic

## Core Identity

> **Keep people alive, functional, and recoverable.**

Medic training deals with health, injuries, biological harm, and treatment.

## Perception

Medics recognize:

- Blood
- Biological residue
- Signs of infection
- Poison exposure
- Injured behavior
- Bodies
- Medical equipment
- Contamination
- Malnutrition
- Dehydration
- Physical distress

## Base Bonus

> **Medics increase HP recovery when staffing the Infirmary.**

Medics can also significantly alter medical Base Events.

## Specializations

### Trauma

> **Something bad happened. How do we prevent it from getting worse?**

Focuses on acute catastrophic injury.

Typical situations:

- Downed units
- Severe wounds
- Major bleeding
- Critical burns
- Falls
- Crush injuries
- Emergency stabilization
- Persistent injury prevention

Trauma is especially important to the Downed system.

Possible effects include:

- Reduce Downed Stamina drain
- Stabilize Downed units
- Prevent persistent Injuries
- Return Downed units to limited activity
- Improve emergency recovery

**Design shorthand:**

> Keep them alive.

---

### Field Medicine

> **Something bad is happening. How do we keep the unit functioning?**

The primary expedition-support medical specialization.

Focuses on:

- Poison
- Venom
- Minor/moderate burns
- Toxic exposure
- Environmental conditions
- Pain
- Temporary impairment
- Shock
- Early symptoms
- Antivenoms
- Persistent-condition prevention

Field Medicine frequently **manages rather than cures**.

Example:

A unit receives a poison dart.

Field Medicine might suppress the poison for the remainder of the mission without permanently curing it.

The unit can continue operating but may still require Infirmary treatment after returning.

**Design shorthand:**

> Keep them going.

---

### Epidemiology

> **Something bad keeps happening. How do we make it stop?**

Focuses on recurring and population-level medical problems.

Typical activities:

- Contamination
- Disease
- Infection
- Outbreaks
- Sample collection
- Transmission analysis
- Quarantine
- Source identification
- Long-term treatment plans

Epidemiology should frequently interact with:

- Haven problems
- Base Events
- Mission chains

Example:

One person suffering unusual symptoms is a medical problem.

Twenty people suffering the same symptoms is an Epidemiology problem.

**Design shorthand:**

> Keep it from happening again.

---

# Diplomat

## Core Identity

> **Understand what people want and use that knowledge to change what they are willing to do.**

Diplomat training includes contextual actions such as:

- Persuade
- Bluff
- Bargain
- Mediate
- Appeal
- De-escalate
- Establish Rapport

Bluff is a **base Diplomat capability**, not a Specialization.

Specializations determine what kinds of social opportunities the Diplomat is particularly capable of recognizing and exploiting.

## Perception

Diplomats recognize social information.

Possible visual cues include:

- Faction symbols
- Rank insignia
- Religious symbols
- Clan/family markings
- Signs of wealth
- Ownership
- Political propaganda
- Social hierarchy
- Rival faction markings
- Cultural taboos
- Authority
- Procedural violations

## Base Bonus

> **Diplomats improve interactions between the SGC and outside groups.**

Depending on the staffed room, this may create:

- Favored trade opportunities
- Diplomatic arrivals
- Improved faction intelligence
- Prisoner exchanges
- Faction requests
- Improved mission opportunities

## Specializations

### Negotiator

> **Focus on the terms.**

Core question:

> "What agreement can we reach?"

Negotiators specialize in:

- Trade
- Prisoner exchanges
- Hostage negotiations
- Surrender terms
- Passage agreements
- Ceasefires
- Compensation
- Resource agreements
- Bargaining over mission outcomes

Negotiators can turn obstacles into **costs, exchanges, or obligations**.

Example:

> "Give us access to the laboratory and we'll share the resulting research."

**Design shorthand:**

> Change the terms.

---

### Ambassador

> **Focus on the relationship.**

Core question:

> "Is this disagreement worth damaging our larger relationship?"

Ambassadors specialize in leveraging:

- Faction reputation
- Haven reputation
- Personal Influence
- Previous favors
- Shared enemies
- Existing alliances
- Leadership relationships
- Treaties
- Long-term consequences

Example:

> "We've defended this Haven three times. Are you really going to start shooting at us over a locked door?"

Ambassador interactions make Influence particularly important.

High Influence can be beneficial or harmful depending on how the faction perceives that individual.

**Design shorthand:**

> Leverage the relationship.

---

### Arbiter

> **Focus on policy, rules, and procedure.**

Core question:

> "What rule applies here, and how can we use it?"

Arbiters specialize in understanding:

- Laws
- Regulations
- Customs
- Procedures
- Chains of command
- Contracts
- Religious rules
- Military protocols
- Bureaucracy
- Local policy

Arbiters gather intelligence about local rules and notice violations or procedural opportunities.

Examples:

> Food inspection certificate is expired.

> Security team failed required readiness procedure.

> Prisoner treatment violates local law.

> Guard is wearing incorrect rank insignia.

These observations can create new Diplomat actions, including Bluffs.

Example:

> **CLAIM FOOD INSPECTION AUTHORITY**

The Arbiter does not gain a unique ability to lie.

Their knowledge of policy makes the Bluff plausible.

## Arbiter in Hostile Encounters

Arbiters can use rules, procedure, or perceived authority to prevent combat.

Example:

> "We got the drop on you. You can surrender, or we can paint the walls."

The argument is that the enemy has already lost according to the practical rules of the engagement.

Another example:

> "Your captain sent us to determine how far an enemy team could penetrate before being detected. You failed. Report for additional training immediately."

This is still a Bluff.

Arbiter training created the opportunity because the unit understands how the organization operates.

**Design shorthand:**

> Use the rules.

---

# Current Class Matrix

| Base Class | Specialization 1 | Specialization 2 | Specialization 3 |
|---|---|---|---|
| **Soldier** | Marksman | Guardian | Tactician |
| **Scout** | Pathfinder | Tracker | Observer |
| **Technician** | Demolitions | Integrations | Overdrive |
| **Scientist** | Applied | Operational | Strategic |
| **Medic** | Trauma | Field Medicine | Epidemiology |
| **Diplomat** | Negotiator | Ambassador | Arbiter |

## Specialization Identity Summary

| Specialization | Primary Question |
|---|---|
| **Marksman** | Who needs to go down first? |
| **Guardian** | Who absolutely cannot go down? |
| **Tactician** | How should this engagement happen? |
| **Pathfinder** | How do we get to the next Tile? |
| **Tracker** | Which Tile should we be trying to reach? |
| **Observer** | What did everyone else miss here? |
| **Demolitions** | What can I safely remove? |
| **Integrations** | What can I connect or exploit? |
| **Overdrive** | How much can I get out of this before it breaks? |
| **Applied Scientist** | How do we apply this to an individual or object? |
| **Operational Scientist** | How do we apply this to a team, room, or facility? |
| **Strategic Scientist** | How do we apply this to a base, Haven, or colony? |
| **Trauma** | How do we keep this from getting worse? |
| **Field Medicine** | How do we keep this person functioning? |
| **Epidemiology** | Why does this keep happening, and how do we stop it? |
| **Negotiator** | What terms can we agree on? |
| **Ambassador** | What does our larger relationship allow? |
| **Arbiter** | What rules or policies can we use? |

---

# Core Design Principle

Classes and Specializations should create **new choices**, not merely statistical bonuses.

The ideal encounter asks:

> "Who did I bring, what did they notice, and what can they do about it?"

Different specialists should frequently solve the same problem in different ways.

The player should feel the consequences of team composition before, during, and after encounters without needing to micromanage individual units during combat.

The right unit at the right time can make all the difference.


# Class Progression Structure

Units progress through **8 Class Levels**.

Levels **1–4** develop the unit's initial Base Class.

At Level **5**, the unit chooses between:

- **Specialization:** Continue developing within the Base Class's discipline.
- **Cross-Training:** Begin developing a second Base Class.

The chosen second discipline progresses through the same four stages:

> **Untrained → Trained → Advanced → Expert**

## Class Level Progression

| Class Level | Specialization Path | Cross-Training Path |
|---:|---|---|
| 1 | Class A: Untrained | Class A: Untrained |
| 2 | Class A: Trained | Class A: Trained |
| 3 | Class A: Advanced | Class A: Advanced |
| 4 | Class A: Expert | Class A: Expert |
| 5 | Class A: Expert + Specialization: Untrained | Class A: Expert + Class B: Untrained |
| 6 | Class A: Expert + Specialization: Trained | Class A: Expert + Class B: Trained |
| 7 | **Class A: Expert + Specialization: Advanced** | **Class A: Expert + Class B: Advanced** |
| 8 | **Class A: Master + Specialization: Expert** | **Class A: Expert + Class B: Expert** |

## Specialization Path

A unit that chooses a Specialization continues developing within the domain of its original Base Class.

Example:

> Technician: Untrained  
> → Technician: Trained  
> → Technician: Advanced  
> → Technician: Expert  
> → Technician: Expert + Demolitions: Untrained  
> → Technician: Expert + Demolitions: Trained  
> → Technician: Expert + Demolitions: Advanced  
> → **Technician: Master + Demolitions: Expert**

Completing the Specialization path at Class Level 8 also advances the original Base Class:

> **Expert → Master**

Master is therefore the reward for completing a Specialization rather than a normal fifth Training stage.

A specialized unit ends progression as:

> **Class A: Master + Specialization: Expert**

## Cross-Training Path

A unit that chooses Cross-Training stops progressing its original Base Class and begins training in a second Base Class.

Example:

> Technician: Untrained  
> → Technician: Trained  
> → Technician: Advanced  
> → Technician: Expert  
> → Technician: Expert + Soldier: Untrained  
> → Technician: Expert + Soldier: Trained  
> → Technician: Expert + Soldier: Advanced  
> → **Technician: Expert + Soldier: Expert**

The original Base Class remains at Expert.

A cross-trained unit ends progression as:

> **Class A: Expert + Class B: Expert**

A Technician/Soldier and Soldier/Technician therefore have access to the same Class capabilities once fully developed.

## Progression Tradeoff

The two paths provide different rewards.

### Specialization

> **Depth**

- Class A reaches Master.
- Specialization reaches Expert.
- Gains access to specialized Actions and Tools.
- Produces the strongest results within a narrower professional domain.

### Cross-Training

> **Breadth**

- Class A remains Expert.
- Class B reaches Expert.
- Gains access to the Actions and Tools of both Base Classes.
- Can equip Tools from either discipline.
- Provides substantially greater flexibility in team composition and mission preparation.

Neither path is intended to be inherently superior.

The core choice is:

> **Do I want this unit to become exceptional within one professional discipline, or highly capable across two?**

# Training Center Curriculum Installation

Training Center Curricula represent physical modifications to the Training Center, not simply information assigned to the room.

Installing advanced Curricula may require permanent structural changes, specialized safety systems, practice equipment, and other infrastructure.

## New Curriculum Installation

Installing a Curriculum into a compatible generic Training Center requires:

- Required Curriculum knowledge
- Supply
- Installation time

Example:

> **Upgrade to Field Medicine III**  
> Supply: 400  
> Installation: 6 days

The Training Center is unavailable during installation.

---

## Curriculum Conversion

Changing an already-specialized Training Center requires removing incompatible infrastructure before the new Curriculum can be installed.

Conversion therefore has two phases:

> **Demolition → Installation**

Example:

> **Convert Demolitions III → Field Medicine III**  
> Demolition: 3 days  
> Installation: 6 days  
> Total downtime: 9 days

The Curriculum installation UI should explicitly show both phases rather than presenting only the combined duration.

The Supply invested in the previous installation is normally forfeited.

The SGC retains its captured Curriculum knowledge, so converting away from a Curriculum does not require that Curriculum to be captured again later.

---

## Compatible Curriculum Upgrades

Not every Curriculum change requires complete demolition.

Related Curricula may contain infrastructure that can be reused.

For example:

> **Demolitions II → Demolitions III**

should normally require substantially less demolition than:

> **Demolitions III → Field Medicine III**

Likewise, some related specializations may share enough infrastructure to reduce conversion costs.

For example:

> **Demolitions III → Overdrive II**

might salvage blast protection, reinforced test equipment, safety systems, or other compatible infrastructure.

This creates the concept of:

> **Curriculum Compatibility**

Compatibility may eventually affect:

- Demolition time
- Installation time
- Supply recovered or reused
- Required construction work

The exact compatibility system should be designed separately.

---

## Current Design Principle

For now, Curriculum conversion follows one simple rule:

> **Changing what a Training Center teaches requires physically changing the room.**

The player pays for that decision through:

1. **Supply**
2. **Demolition time when necessary**
3. **Installation time**
4. **Loss of Training Center availability during the work**

This makes Training Center specialization a strategic commitment rather than a Curriculum menu that can be freely changed between training sessions.

# Curriculum, Promotion, and Personal Tool Progression

## Core Principle

Class progression, Curriculum, Tool Research, Tool fabrication, and Promotion are related systems, but they represent different things.

- **Curriculum:** Do we know how to teach this?
- **Research:** Do we know how to manufacture what this level requires?
- **Upgrade Kit Fabrication:** Have we prepared the difficult components?
- **Promotion:** Can this unit apply that knowledge and upgrade their own professional equipment?
- **Personal Tools:** What capability can this specific unit bring into an encounter?

---

# 1. Personal Class Tools

Every unit receives a personal set of Class Tools when they begin a Class.

For example:

**Basic Untrained Scout Tools**

These Tools belong permanently to that unit.

They are not discarded and replaced every time the unit advances. Instead, the same Tool set progresses with the character.

## Training Grade

Basic Untrained Scout Tools  
↓  
Basic Trained Scout Tools  
↓  
Basic Advanced Scout Tools  
↓  
Basic Expert Scout Tools

The Tool's Training Grade determines the maximum Training level the Tool can support during Tool-required Actions.

A unit cannot skip Tool Training Grades.

An Untrained Tool set must become Trained before it can become Advanced.

---

# 2. Tool Quality

Tool Quality is a separate progression axis from Training Grade.

**Basic → Fine → Epic**

Quality primarily determines the number of Tool charges available.

| Tool | Training Capability | Charges |
|---|---|---:|
| Basic Expert Scout Tools | Expert | Low |
| Fine Expert Scout Tools | Expert | Medium |
| Epic Expert Scout Tools | Expert | High |

Exact charge counts will be balanced later.

This allows combinations such as:

- **Epic Trained Scout Tools**
- **Basic Expert Scout Tools**

The first provides many uses of Trained-level capability.

The second provides fewer uses of Expert-level capability.

---

# 3. Master Tools

Normal craftable Tool progression ends at:

**Expert Tools**

There is no normal Master promotion and therefore no normal Master Tool Upgrade Kit.

Master Tools are exceptional.

They may come from:

- Rare faction technology
- Major story chains
- Unique artifacts
- Temporary prototypes
- Encounter-specific equipment
- Environmental opportunities

Frequently, the "Master Tool" will be part of the location itself.

## Example: Global Network Terminal

Most characters see:

**Security Terminal**

An Expert Technician may recognize useful privileged access.

A Master Technician may recognize something nobody else understands:

**Global Network Administration Interface**

This reveals a Master-only Action:

**COMPROMISE GLOBAL NETWORK**

- Master Technician Required
- Terminal acts as Master Technician Tool

The Master Technician did not bring Master Tools with them.

Their Master-level knowledge allows them to recognize and exploit an extraordinary Tool already present in the environment.

**Master character + exceptional opportunity = Master Action**

---

# 4. Curriculum Capture

Curriculum represents institutional knowledge possessed by the SGC.

It answers:

**Can we reliably teach personnel to perform at this level?**

Curriculum is captured in the Promotion Room.

## Required Staffing

- **Record Slot:** Scientist
- **Capture Slot:** Qualified subject-matter unit

The subject must possess the Training level being documented.

The Scientist records, organizes, tests, and formalizes that knowledge.

---

# 5. Curriculum Progress Uses Lessons

Curriculum is captured through discrete **Lessons**, not uninterrupted continuous time.

Example:

**Soldier III Curriculum**

- 14 / 24 Lessons Captured
- Current Lesson: 85%

Completed Lessons are permanent SGC knowledge.

Partial Lessons are not.

If the session is interrupted:

- Lessons 1–14 remain captured.
- The current Lesson returns from 85% to 0%.

This creates meaningful decisions around interrupting Curriculum work.

A unit 10% through the current Lesson may be easy to pull for a mission.

A unit 90% through the final Lesson may be much more valuable finishing the Curriculum.

---

# 6. Curriculum Progress Belongs to the SGC

Curriculum progress is not tied to the person who started recording it.

Once a Lesson is completed, the SGC owns that knowledge.

Example:

**Soldier III: 14 / 24 Lessons**

Carter may have contributed the first 14 Lessons.

Carter is not required to finish them.

Any valid combination of:

**Scientist + Advanced-or-better Soldier**

can return to the Promotion Room and continue with Lesson 15.

Different personnel may therefore contribute to the same Curriculum over time.

---

# 7. Scientist Quality

The number of Lessons required does not change based on Scientist quality.

For example:

**Soldier III always requires 24 Lessons.**

Scientist capability instead affects how quickly an individual Lesson can be completed.

A more capable Scientist extracts, verifies, and records the subject's knowledge more efficiently.

This makes swapping Scientists potentially valuable when Curriculum completion is time-sensitive.

Exact Lesson durations and Scientist modifiers will be balanced later.

---

# 8. Curriculum Prerequisites

Curriculum follows the same progression tree as character Training.

Higher Curricula require all lower Curricula in that branch.

Example:

Technician I  
↓  
Technician II  
↓  
Technician III  
↓  
Demolitions I  
↓  
Demolitions II  
↓  
Demolitions III

A unit may already possess knowledge far beyond what the SGC has captured.

The SGC must still document the missing Curricula sequentially.

## Example

The SGC recruits an:

**Advanced Demolitions Specialist**

The SGC currently possesses only:

**Technician I**

The unit is capable of contributing knowledge through Demolitions II.

However, the SGC must capture:

Technician II  
↓  
Technician III  
↓  
Demolitions I  
↓  
Demolitions II

one Curriculum at a time.

---

# 9. Cross-Trained Curriculum Capture

Cross-trained units may possess capturable knowledge on two Base Class branches.

Example:

**Expert Technician / Advanced Soldier**

If the SGC is missing relevant Curriculum, placing this unit in the Capture Slot may reveal multiple available Curriculum projects.

For example:

- **New Curriculum Available: Technician II**
- **New Curriculum Available: Soldier III**

The player chooses which Curriculum the Promotion Room records.

Only one Curriculum can be actively captured because there is only one Promotion Room.

---

# 10. Curriculum and Tool Research Are Different

Curriculum and Tools represent different kinds of knowledge.

## Curriculum

**How do we teach this?**

- Captured directly from qualified personnel.
- Uses the Promotion Room.
- Does not use the normal Research queue.

## Tool Research

**How do we manufacture the equipment required to perform at this level?**

- Handled through traditional Research.
- Uses normal Research capacity.
- Competes with other scientific and technological Research.

Curriculum capture can therefore continue without forcing the SGC to stop unrelated Research.

---

# 11. Curriculum Completion Generates Tool Research

Completing a Curriculum reveals the requirements for the corresponding Tool progression.

Example:

**Complete Soldier III Curriculum**

↓

**New Research Available: Advanced Soldier Tool Upgrade Kit**

↓

Traditional Research

↓

**Advanced Soldier Upgrade Kit unlocked**

Completing Curriculum does not automatically provide the Upgrade Kit.

It only makes the corresponding Tool Research available.

---

# 12. Tool Upgrade Kits

Technicians do not manufacture complete personal Tools from scratch.

Instead, they fabricate **Tool Upgrade Kits**.

An Upgrade Kit contains the difficult or specialized components required to advance an existing personal Tool set.

Examples:

- Scout Trained Upgrade Kit
- Scout Advanced Upgrade Kit
- Scout Expert Upgrade Kit

These are generic inventory items.

They are not tied to a particular character.

---

# 13. Upgrade Kit Fabrication

Fabricating an Upgrade Kit requires:

- Required Tool Research
- Materials
- Technician
- Promotion Room
- Fabrication time

The Technician handles the fabrication work that the future user cannot reasonably perform themselves.

The result is essentially:

**"Here is the box of specialized components. Now you need to know what to do with them."**

---

# 14. Upgrade Kit Fabrication Uses Components

Upgrade Kit construction uses discrete Components rather than requiring uninterrupted continuous progress.

Example:

**Advanced Scout Upgrade Kit**

- Components Complete: 5 / 8
- Current Component: 60%

Completed Components are preserved.

If fabrication is interrupted:

- Components 1–5 remain complete.
- The current Component returns from 60% to 0%.

Any qualified Technician may later resume the project.

The project is not tied to the Technician who started it.

---

# 15. Generic Upgrade Kit Inventory

Completed Upgrade Kits are stored as generic Base inventory.

| Upgrade Kit | Available |
|---|---:|
| Trained Scout | 3 |
| Advanced Scout | 1 |
| Expert Scout | 0 |
| Trained Soldier | 4 |
| Advanced Soldier | 2 |
| Expert Soldier | 0 |
| Advanced Technician | 2 |

This creates a logistics decision.

The player may manufacture Upgrade Kits only when needed, or spend Materials ahead of time and maintain a stockpile.

Stockpiling consumes resources but reduces delays when units become eligible for Promotion.

---

# 16. Promotion

When a unit becomes eligible for Promotion, they use the appropriate Upgrade Kit to modify their existing personal Tools.

Example:

Carter currently possesses:

**Basic Trained Scout Tools**

Carter becomes eligible for:

**Scout: Trained → Advanced**

Requirements:

- Character progression requirement met
- Scout II Curriculum captured
- Advanced Scout Upgrade Kit available
- Promotion Room available

Carter enters the Promotion Room with their existing Tools and takes an:

**Advanced Scout Upgrade Kit**

During Promotion, Carter performs the final assembly, configuration, calibration, or modification appropriate to the profession.

The result is:

**Basic Advanced Scout Tools**

The Upgrade Kit is consumed.

---

# 17. Promotion as Practical Qualification

Final Tool assembly is part of the Promotion process.

The Technician has already performed the specialized fabrication.

The promotee must demonstrate that they understand their professional equipment well enough to configure and use it.

This creates the principle:

**If you cannot correctly upgrade and configure your own professional equipment using a prepared Upgrade Kit, you are not ready for the Promotion.**

---

# 18. Tool Quality Upgrade Kits

Tool Quality upgrades follow a similar system.

Once the appropriate Research has been completed, Technicians may fabricate generic Quality Upgrade Kits.

Example:

**Scout Fine Quality Upgrade Kit**

A Scout can use this kit to upgrade:

**Basic Untrained Scout Tools → Fine Untrained Scout Tools**

or:

**Basic Expert Scout Tools → Fine Expert Scout Tools**

Quality does not change Training capability.

It changes Tool durability and available charges.

Quality Upgrade Kits therefore do not need separate versions for every Training Grade.

---

# 19. Tool Quality Research

Higher Tool Quality is not automatically unlocked by having the previous quality.

For example:

**Basic Scout Tools**

↓

Additional Requirement

↓

**Fine Scout Tool Research**

Possible future requirements may include:

- Improved manufacturing technology
- Fabrication room progression
- Material analysis
- Faction technology
- Scientist breakthroughs
- Field experience
- Relevant artifacts

The exact requirements will be designed later.

The important distinction is:

**Curriculum progression unlocks Training Grade Tool Research.**

**Other technological progression unlocks Tool Quality Research.**

---

# 20. Specialization and Cross-Training Tools

At Class Level 5, a unit gains access to a second professional discipline and therefore a second Tool slot.

## Specialization

Example:

**Expert Technician + Untrained Demolitions**

The unit gains:

**Basic Untrained Demolitions Tools**

These then progress:

Untrained Demolitions  
↓  
Trained Demolitions  
↓  
Advanced Demolitions  
↓  
Expert Demolitions

using the same Upgrade Kit system.

## Cross-Training

Example:

**Expert Technician + Untrained Soldier**

The second Tool slot begins with:

**Basic Untrained Soldier Tools**

and follows normal Soldier Tool progression.

The Tool system does not require different rules for Specialization and Cross-Training.

Tools belong to disciplines.

Character progression determines which disciplines the unit possesses.

---

# 21. Curriculum Installation and Training Centers

Captured Curriculum represents SGC knowledge.

Training Centers represent the physical infrastructure required to practice that knowledge.

These are separate concepts.

The SGC may know:

**Demolitions III Curriculum**

without possessing:

**Demolitions III Training Center**

The SGC can still use that knowledge for:

- Tool Research
- Promotion requirements
- Institutional progression

What it cannot do is efficiently drill Demolitions Expertise at that level without an appropriate Training Center.

---

# 22. Base Class Training Centers

Standard Training Centers can rotate between captured Base Class Curricula.

The room must still be configured for the discipline being trained.

A room configured for Scout training cannot simultaneously be used for Medic training.

However, Base Class configurations are portable enough that changing between them can reasonably occur between normal training cycles.

Higher Curriculum levels include all lower Curriculum levels.

Therefore:

**Technician III includes Technician I, Technician II, and Technician III.**

There is no need to choose between Technician I, II, or III when training.

The facility provides the highest applicable Technician Curriculum it supports.

---

# 23. Specialization Training Centers

Specialization Curricula require permanent infrastructure.

Installing advanced Specialization Curriculum converts the room into a dedicated Training Center.

Example:

**Demolitions Training Center III**

The facility inherently contains the required Technician Curriculum because the Curriculum dependency is:

Technician I  
↓  
Technician II  
↓  
Technician III  
↓  
Demolitions I  
↓  
Demolitions II  
↓  
Demolitions III

A Demolitions III Training Center can therefore train:

- Any Technician
- Any Demolitions Specialist

against the highest relevant Curriculum available.

It cannot normally train unrelated disciplines.

---

# 24. Curriculum Relevance and Expertise Practice

Curriculum level does not determine whether someone is allowed to train.

It determines how useful the available drills are to that person's current Training.

A character may practice below their Training level but receives reduced Expertise Practice.

## Example: Technician Curriculum II

| Technician Training | Practice Earned |
|---|---:|
| Untrained | 100% |
| Trained | 100% |
| Advanced | 50% |
| Expert | 25% |
| Master | 25% or less |

An Expert Technician can train there.

They are simply practicing things they probably already know very well.

**The unit is not blocked. The Curriculum is failing to challenge them.**

Exact Practice multipliers remain subject to balancing.

---

# 25. Promotion Room

The SGC has exactly **one Promotion Room**.

The Promotion Room can perform only one major project at a time.

## Curriculum Capture

Requires:

- Scientist
- Qualified subject-matter unit

Produces:

- Curriculum Lessons

## Tool Upgrade Kit Fabrication

Requires:

- Technician
- Materials

Produces:

- Generic Tool Upgrade Kit

## Promotion

Requires:

- Eligible unit
- Appropriate Upgrade Kit

Produces:

- Higher Training level
- Upgraded personal Tools

## Tool Quality Upgrade

Requires:

- Tool owner
- Appropriate Quality Upgrade Kit

Produces:

- Higher-quality personal Tools

Because there is only one Promotion Room, these activities compete for Base time.

The important question becomes:

**What is important enough to occupy the Promotion Room right now?**

---

# 26. Logistics: Curriculum Tab

Curriculum Capture is tracked through a dedicated Curriculum tab in Logistics rather than through the normal Research queue.

The screen provides an institutional overview of:

- Captured Curricula
- Missing Curricula
- Available Curriculum Capture opportunities
- Active Curriculum Capture
- Lesson progress
- Prerequisites
- Installed Training capabilities

Example:

| Discipline | I | II | III |
|---|:---:|:---:|:---:|
| Technician | ✓ | ✓ | 14/24 |
| Demolitions | ✓ | ○ | ○ |
| Integrations | ○ | ○ | ○ |
| Soldier | ✓ | ✓ | ✓ |
| Marksman | ✓ | ○ | ○ |
| Guardian | ○ | ○ | ○ |

Possible states include:

- **✓** Captured
- **14/24** In Progress
- **○** Available
- **🔒** Prerequisite or qualified personnel missing

Because Curriculum follows strict prerequisites, impossible gaps do not occur.

For example:

**If Demolitions I exists, Technician I, Technician II, and Technician III necessarily already exist.**

---

# 27. Logistics: Promotions Tab

The Promotions tab tracks the equipment and Promotion pipeline.

It primarily tracks generic Upgrade Kit inventory and the current Promotion Room activity.

## Upgrade Kit Inventory

| Upgrade Kit | Available |
|---|---:|
| Trained Scout | 3 |
| Advanced Scout | 1 |
| Expert Scout | 0 |
| Advanced Soldier | 2 |
| Expert Soldier | 0 |
| Advanced Technician | 1 |

## Current Promotion Room Activity

**Fabricating: Expert Scout Upgrade Kit**

- Components: 7 / 10
- Current Component: 60%
- Technician: Carter

The Promotions tab may also identify units that are:

- Eligible for Promotion
- Waiting for Curriculum
- Waiting for Tool Research
- Waiting for an Upgrade Kit
- Waiting for Promotion Room availability

This makes the personnel-development pipeline visible from one screen.

---

# 28. Complete Promotion Pipeline

A normal Promotion follows this sequence:

1. A qualified higher-level unit provides knowledge.
2. A Scientist and qualified unit capture the required Curriculum.
3. Curriculum completion reveals the corresponding Tool Upgrade Kit Research.
4. The Tool Upgrade Kit enters the normal Research system.
5. Research completes.
6. A Technician uses Materials and the Promotion Room to fabricate a generic Upgrade Kit.
7. The completed Upgrade Kit enters Logistics inventory.
8. An eligible unit takes the Upgrade Kit into the Promotion Room.
9. The unit uses the Upgrade Kit to modify their existing personal Tools.
10. The unit completes Promotion.

## Example: Scout Trained → Advanced

**Advanced Scout knowledge encountered**

↓

**Capture Scout II Curriculum**

↓

**Advanced Scout Upgrade Kit Research becomes available**

↓

**Research Advanced Scout Upgrade Kit**

↓

**Technician fabricates Advanced Scout Upgrade Kit**

↓

**Upgrade Kit enters Logistics inventory**

↓

**Trained Scout becomes Promotion-ready**

↓

**Scout enters Promotion Room with Upgrade Kit**

↓

**Basic Trained Scout Tools → Basic Advanced Scout Tools**

↓

**Unit becomes Advanced Scout**

---

# 29. Three Separate Institutional Capabilities

The SGC can possess three related but independent capabilities.

## We Know How to Teach It

**Curriculum captured**

## We Know How to Equip People to Do It

**Tool Upgrade Kit Research completed**

## We Have Somewhere to Practice It Efficiently

**Appropriate Training Center installed**

These capabilities should remain separate.

For example:

- Demolitions III Curriculum: ✓
- Expert Demolitions Upgrade Kit Research: ✓
- Demolitions III Training Center: ✗

The SGC knows how to teach Expert Demolitions and knows how to manufacture the required Tool Upgrade Kits.

What it lacks is a dedicated facility where personnel can efficiently accumulate high-level Demolitions Expertise through controlled practice.

Those personnel must instead gain relevant Practice through:

- Field work
- Relevant Base work
- Haven facilities
- Other real professional experience

---

# Design Principle

The SGC is not simply leveling characters.

It is gradually learning how to **reproduce professional competence**.

Individual characters bring knowledge into the organization.

Scientists capture that knowledge.

Research turns professional requirements into reproducible technology.

Technicians manufacture the difficult components.

Training Centers provide controlled practice.

The Promotion Room turns institutional capability back into individual advancement.

The personal Tools a character carries are the physical history of that progression.