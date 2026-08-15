# High-Level Game Design Analysis: Phoenix Point

## 1. Reference Scope

This document analyzes the core **Phoenix Point** campaign and its major systems as a reference for creating an original Unity strategy game.

Phoenix Point combines:

* A real-time global strategy map
* Base construction
* Exploration
* Diplomacy between human factions
* Research and manufacturing
* Aircraft and squad logistics
* Soldier recruitment and development
* Turn-based tactical battles
* Location-based damage
* An enemy force that changes throughout the campaign
* Multiple story and victory paths

The current PC version received the Firebird update in December 2025, followed by patch 1.30.2 on June 24, 2026. Those updates adjusted campaign pacing, research time, facility costs, ammo costs, haven defense calculations, saved equipment loadouts, aircraft arrival displays, and several interface systems.

This analysis focuses mainly on the underlying design, not exact current balance values.

---

# 2. High-Level Game Concept

Phoenix Point is a campaign-scale strategy game in which the player controls a small independent military and research organization during a global crisis.

The player must:

* Explore the world
* Locate surviving settlements
* Establish bases
* Acquire resources
* Recruit and equip soldiers
* Research the enemy
* Manage relationships with competing factions
* Respond to attacks
* Conduct tactical missions
* Find a path to ending the crisis

The player is never simply choosing the next battle. They are deciding:

* Which battle matters most
* Whether their aircraft can reach it
* Which squad should respond
* Whether that squad has enough stamina
* What equipment can be spared
* Whether another settlement will fall while they are traveling
* Whether helping one faction will upset another
* Whether the mission reward is worth the injuries and ammunition

That chain of consequences is the heart of the game.

---

# 3. Player Fantasy

The player fantasy is:

> I command an underfunded global organization trying to solve an impossible crisis while larger groups pursue their own competing solutions.

The player is simultaneously:

* Military commander
* Operations planner
* Research director
* Diplomat
* Logistics manager
* Base administrator
* Equipment quartermaster

This is different from many tactical games where the strategy layer mainly exists to feed the next battle.

In Phoenix Point, the strategic layer creates the battles.

---

# 4. Design Pillars

## 4.1 Tactical Precision

Shots are represented as physical projectiles rather than simple hit or miss rolls. Players can manually aim at particular body parts, equipment, environmental objects, or spaces.

## 4.2 Strategic Scarcity

The player cannot respond to everything. Aircraft, soldiers, resources, ammunition, time, and geographical range all create limits.

## 4.3 Persistent Consequences

Soldiers can die permanently. Injuries, ammunition use, settlement losses, diplomatic choices, and missed missions affect the remaining campaign.

## 4.4 Competing Human Solutions

The major human factions are not merely stores or quest providers. They have different beliefs, technologies, territories, and proposed solutions.

## 4.5 Changing Enemy Pressure

The enemy gains new forms, weapons, defenses, and tactical capabilities as the campaign advances.

## 4.6 Player-Directed Campaign

The player decides where to explore, which factions to support, what to research, where to establish bases, and which victory route to pursue.

---

# 5. Primary Game Loop

## Strategic loop

Survey world map.

Explore locations.

Find settlements, resources, missions, and threats.

Trade or interact with factions.

Select strategic priorities.

Move aircraft and squads.

Begin tactical mission.

## Tactical loop

Deploy squad.

Locate threats and objectives.

Move soldiers using Action Points.

Target enemies and body parts.

Complete objective.

Extract surviving units.

## Progression loop

Receive resources, research samples, equipment, faction reputation, and experience.

Heal and rest soldiers.

Replace ammunition.

Manufacture equipment.

Research new technology.

Improve bases.

Recruit or train additional soldiers.

Deploy again.

The full loop is:

**Explore → choose priority → transport squad → fight mission → absorb consequences → improve organization → face greater threats**

---

# 6. Major Game Areas

# 6.1 Geoscape

The Geoscape is the global strategy map and the central campaign screen.

Phoenix Point uses it for exploration, construction, research, aircraft movement, missions, mist expansion, settlements, alien locations, diplomacy, and global events. The official game description calls exploration an important early objective and identifies havens, scavenging sites, Phoenix locations, and the spreading mist as major map elements.

## Main elements

* Globe or world map
* Player bases
* Faction settlements
* Independent settlements
* Unexplored locations
* Scavenging sites
* Story missions
* Enemy bases
* Aircraft
* Active attacks
* Mission expiration timers
* Environmental threat regions
* Global population or loss condition
* Time controls

## Player actions

* Pause or accelerate time
* Select aircraft
* Move to a connected location
* Explore an unknown site
* Visit a settlement
* Trade resources
* Recruit soldiers
* Respond to attacks
* Launch missions
* Open research
* Open manufacturing
* Inspect diplomacy
* Manage bases

## Location network

Aircraft generally travel between known points rather than moving freely to any coordinate.

A location can act as:

* Destination
* Refueling point
* Exploration target
* Mission location
* Trading location
* Recruitment location
* Range extension point

This produces a useful map-expansion loop:

1. Reach nearby point.
2. Explore it.
3. Reveal new points.
4. Travel farther.
5. Locate another base or settlement.
6. Extend operational range.

Aircraft range therefore matters even when there is no air combat. The official wiki describes aircraft movement as a chain of reachable points limited by aircraft range.

## Unity recommendation

Represent the globe as either:

* A true 3D sphere
* A flat 2D world map
* A stylized node network

For an independent project, a 2D map or node network is the sensible choice.

Each map node should contain:

```text
Node ID
Node type
World position
Discovery state
Owning faction
Available services
Mission state
Mission expiration
Neighboring nodes
Aircraft present
Threat state
Narrative event table
```

## Important design lesson

Do not make exploration a button that merely generates random loot.

Exploration should change the player’s operational reach and understanding of the campaign.

---

# 6.2 Time System

The Geoscape advances in real time but can be paused or accelerated.

## Activities that consume strategic time

* Aircraft travel
* Exploration
* Research
* Manufacturing
* Facility construction
* Soldier healing
* Soldier stamina recovery
* Enemy attacks
* Mission expiration
* Enemy base development
* Faction research
* Global story events

## Why the time system matters

Time is effectively another currency.

Spending six hours exploring may mean:

* A settlement is attacked
* Another mission expires
* A soldier finishes healing
* Manufacturing completes
* Research finishes
* An enemy location grows stronger

The player is therefore constantly comparing opportunity costs.

## Recommended implementation

Create one authoritative `CampaignClock`.

Systems register timed jobs:

```text
TimedJob
- Job ID
- Job type
- Start timestamp
- End timestamp
- Owner
- Completion callback
- Can be cancelled
- Priority
```

When time advances, the clock checks which events complete next.

Do not update every timer individually every frame. Use an ordered event queue.

---

# 6.3 Aircraft and Strategic Logistics

Aircraft carry squads between locations.

They differ in:

* Speed
* Travel range
* Soldier capacity
* Vehicle capacity
* Durability
* Equipment
* Strategic purpose

In Phoenix Point, vehicle capacity consumes multiple personnel slots, and aircraft statistics include speed, range, durability, and capacity.

## Aircraft roles

### Exploration craft

Fast, long-range, small capacity.

Used to reveal locations and perform diplomacy or trade.

### Assault transport

Slower, larger capacity.

Used for full tactical squads.

### Rapid-response craft

Fast enough to intercept attacks.

Carries a smaller elite squad.

### Heavy transport

Carries soldiers plus a ground vehicle.

### Specialized aircraft

May carry sensors, cargo, air weapons, or strategic modules.

## Strategic decisions

* One large squad or two smaller squads?
* Fast aircraft or larger aircraft?
* Keep soldiers stationed near threatened settlements?
* Send an empty aircraft to trade?
* Split experienced soldiers between squads?
* Delay a mission until reinforcements arrive?
* Risk flying with an exhausted team?

## Recommended simplification

For an initial version, use only three aircraft:

| Aircraft  |            Capacity |  Speed |  Range | Purpose           |
| --------- | ------------------: | -----: | -----: | ----------------- |
| Scout     |                   3 |   High |   High | Exploration       |
| Transport |                   6 | Medium | Medium | Standard missions |
| Carrier   | 6 or 4 plus vehicle |    Low |   High | Heavy operations  |

Do not add air combat in the first version. Aircraft logistics alone are enough to create strategy.

---

# 6.4 Player Bases

Bases extend the player’s reach and provide strategic services.

Phoenix Point bases can contain facilities, be powered on or off, become damaged, and come under direct attack. Multiple facilities can be constructed simultaneously.

## Base purposes

* Reveal nearby sites
* Heal soldiers
* Restore stamina
* Train soldiers
* Conduct research
* Manufacture equipment
* Store vehicles
* Contain captured enemies
* Produce resources
* Protect a geographical region
* Support aircraft operations

## Suggested facilities

### Command Center

Required for an active base.

### Radar or Satellite Array

Reveals nearby locations and threats.

### Living Quarters

Increases soldier capacity and stamina recovery.

### Medical Center

Restores soldier health.

### Training Center

Provides passive experience.

### Research Laboratory

Increases research output.

### Fabrication Plant

Increases manufacturing output.

### Vehicle Bay

Repairs and stores ground vehicles.

### Containment Facility

Holds captured enemies.

### Mutation or Augmentation Lab

Provides advanced soldier modifications.

### Storage

Increases item and resource capacity.

### Power Generator

Provides power for other facilities.

### Defense System

Improves base-defense missions or resolves a portion automatically.

## Base layout

Phoenix Point represents bases as grids of facility rooms.

For your game, the grid is optional.

A grid works when:

* Placement restrictions matter
* Adjacency matters
* Damage can target particular rooms
* Space is meaningfully limited

A grid becomes busywork when every room operates independently.

## Better adaptation

Use base slots with categories:

* Operations
* Personnel
* Science
* Industry
* Defense
* Special

Then create actual tradeoffs:

* Only two science slots
* Power limit
* Maintenance cost
* Regional conditions
* Facility adjacency
* Staff assignment

## Base-defense missions

When a base is attacked, the tactical map should reflect its actual facility layout.

Damage during the mission can affect:

* Facility operation
* Construction queue
* Equipment stores
* Radar
* Personnel
* Captured enemies

This creates a satisfying connection between strategy and tactics.

---

# 6.5 Havens and Faction Settlements

Havens are independent or faction-controlled communities located on the Geoscape.

They function as:

* Population centers
* Trade locations
* Recruitment locations
* Mission generators
* Diplomatic assets
* Technology sources
* Strategic territory

The player can visit them to trade resources and recruit personnel, although availability may depend on research, local facilities, or diplomatic standing.

## Haven components

A haven may contain districts such as:

* Food production
* Manufacturing
* Research
* Housing
* Elite training
* Standard training
* Leadership
* Defense

Each component can affect what that haven offers.

## Haven attacks

Enemy forces periodically attack havens.

The player can:

* Defend the haven
* Ignore the attack
* Arrive too late
* Help one faction attack another
* Raid the haven
* Sabotage a district
* Steal technology
* Rescue personnel

## Why havens are valuable

They make the world feel inhabited.

Losing a haven is not simply losing one map icon. It may mean losing:

* Trading access
* Recruit access
* Regional refueling
* Diplomacy income
* A research partner
* A population center
* A buffer against enemy expansion

## Suggested simulation model

Each haven has:

```text
Population
Food level
Defense rating
Faction
Attitude toward player
Facilities
Production type
Available recruit
Trade inventory
Current threat
Political traits
Narrative flags
```

Do not simulate every civilian. A small group of aggregated statistics is enough.

---

# 6.6 Factions

Phoenix Point includes three major human factions, each with its own ideology and technology:

* New Jericho
* Synedrion
* Disciples of Anu

The player can cooperate with them, trade, steal technology, oppose them, or pursue faction-related endings.

## Structural purpose of factions

Each faction provides:

* Distinct visual identity
* Political viewpoint
* Military doctrine
* Soldier classes
* Weapons
* Armor
* Aircraft
* Research
* Story missions
* Victory route

## Effective faction pattern

### Militarist faction

Values strength, security, armor, and direct action.

Technologies:

* Heavy weapons
* Armor
* Rockets
* Durable aircraft
* Automated defenses

### Scientific collective

Values research, communication, stealth, and advanced energy systems.

Technologies:

* Laser weapons
* Fast aircraft
* Stealth systems
* Drones
* Environmental technology

### Biological or spiritual faction

Values adaptation, mutation, faith, and biological integration.

Technologies:

* Mutations
* Melee units
* Psychic powers
* Organic weapons
* Biological creatures

This triangle is readable because each group has:

* Different ideology
* Different battle style
* Different proposed solution

## Recommendation for your game

Do not create factions that are simply:

* Red team
* Blue team
* Green team

Give each faction an answer to the central crisis.

For example, in a machine-plague game:

* One faction wants to destroy all artificial intelligence.
* One wants to merge with it.
* One wants to contain and regulate it.

The player should be choosing philosophies as well as equipment.

---

# 6.7 Diplomacy

Diplomacy is represented through a numeric relationship with each faction.

Relationship changes through:

* Defending havens
* Completing faction missions
* Making narrative choices
* Attacking enemies
* Attacking faction locations
* Sabotage
* Theft
* Supporting rival factions
* Research decisions

Phoenix Point uses relationship thresholds that lead to diplomatic missions and increased technology sharing. Its official wiki identifies Friendly, Supportive, Aligned, and Allied progression levels, with major missions appearing near particular relationship thresholds.

## Diplomacy rewards

Higher relations may provide:

* Haven locations
* Trade access
* Recruitment
* Shared research
* New classes
* Equipment designs
* Aircraft designs
* Story missions
* A faction victory route

## Diplomacy conflict

Choices benefiting one faction may hurt another.

This creates a tension between:

* Trying to be everyone’s friend
* Specializing in one technology path
* Remaining independent
* Exploiting faction conflict
* Choosing a final solution

## Better system for an original project

Use two values per faction:

### Trust

How much the faction believes the player is reliable.

### Ideological agreement

How closely the player’s actions support the faction’s worldview.

This is richer than one reputation number.

A faction might:

* Trust you but disagree with you
* Agree with your goals but distrust your methods
* Trade with you while refusing military cooperation
* Offer a temporary alliance against a shared enemy

---

# 6.8 Resource Economy

The main strategic resources can be reduced to several broad categories:

### Materials

Used for construction, weapons, armor, and ammunition.

### Technology

Used for advanced manufacturing and facilities.

### Food or supplies

Used to recruit and support personnel.

### Special biological resource

Used for mutations, advanced research, or biological technology.

### Rare resources

Used for late-game equipment.

## Resource sources

* Tactical scavenging
* Mission rewards
* Trading
* Narrative events
* Haven defense
* Facility production
* Raids
* Recycling equipment
* Special sites

## Resource sinks

* Facility construction
* Base activation
* Recruitment
* Manufacturing
* Ammunition
* Aircraft
* Vehicles
* Repairs
* Advanced research projects
* Story projects

## Design lesson

A good resource system asks:

> What am I giving up by buying this?

A poor resource system asks:

> Which of my fourteen nearly identical materials does this require?

Use three main resources in the first prototype.

---

# 6.9 Trading

Havens offer different exchange rates based on what they produce or need.

## Trading loop

1. Fly aircraft to haven.
2. Inspect offered exchange.
3. Trade surplus resource.
4. Acquire scarce resource.
5. Continue travel.

## Strategic value

Trading gives noncombat aircraft something useful to do.

It also makes geography matter because the player must physically travel to trading locations.

## Recommended quality-of-life changes

Phoenix Point can become heavily administrative. Your version should improve this.

Consider:

* A trade-route automation system
* Regional trade overview
* Searchable haven list
* Favorite locations
* Trade notifications
* Assignable logistics officers
* Repeat-route orders

Do not make the player manually visit seven settlements every few minutes merely to exchange vegetables for metal. That is not command. That is grocery delivery with a rifle.

---

# 6.10 Research

Research drives strategic and narrative progress.

## Research sources

* Player discoveries
* Enemy corpses
* Captured enemies
* Autopsies
* Faction cooperation
* Stolen technology
* Recovered artifacts
* Story events
* Special locations

## Research categories

### Strategic research

* Better radar
* New base functions
* Improved recruitment
* Trading protocols
* Aircraft improvements

### Enemy research

* Autopsies
* Weakness analysis
* Capture methods
* Enemy base detection
* Special damage types

### Equipment research

* Weapons
* Armor
* Vehicles
* Ammunition
* Medical equipment

### Narrative research

* Crisis origin
* Ancient history
* Faction plans
* Final solution

## Research design

Phoenix Point often uses research as the gate connecting different systems. The Firebird update reduced all research times by 20 percent because research pacing heavily affects campaign progression.

That is an important warning.

Do not make every feature wait behind research.

Research should provide:

* New options
* New understanding
* New responses to threats

It should not merely delay basic usability.

## Recommended structure

Use a research web rather than a strict tree.

Research projects can require:

* Prerequisite knowledge
* A recovered specimen
* A faction relationship
* A completed mission
* A facility
* A moral choice

---

# 6.11 Manufacturing and Equipment

The player manufactures:

* Weapons
* Armor
* Ammunition
* Consumables
* Aircraft
* Vehicles
* Special equipment

Manufacturing consumes resources and strategic time.

## Equipment principles

Equipment is generally owned by the organization, not permanently attached to one soldier.

This permits:

* Moving rare weapons between squads
* Reusing recovered gear
* Equipping teams for specific missions
* Losing equipment when soldiers die or missions fail
* Running short of magazines or explosives

## Loadout components

* Primary weapon
* Secondary weapon
* Armor pieces
* Quick-access items
* Backpack inventory
* Ammunition
* Medical item
* Grenades
* Class equipment
* Mounts or modules

The June 2026 patch added saved soldier loadouts and automatic equipping for selected mission teams, demonstrating how important equipment management becomes once the roster grows.

## Recommendation

Implement organization-owned equipment, but add:

* Saved loadouts
* Missing-item warnings
* Substitute equipment button
* Equip entire squad
* Reserve loadouts for squads
* Clear indication of which soldier holds an item

The design value comes from scarcity, not from hunting through twelve menus for Steve’s spare magazine.

---

# 6.12 Personnel and Recruitment

Soldiers are persistent campaign characters.

## Soldier data

```text
Name
Portrait
Voice
Level
Experience
Skill points
Primary class
Secondary class
Personal perks
Strength
Willpower
Speed
Current health
Maximum health
Stamina
Equipment
Inventory
Augmentations
Mission history
Kills
Injuries
Status
Aircraft assignment
```

## Recruitment sources

* Havens
* Player bases
* Rescue missions
* Narrative missions
* Special events

Recruits may differ by:

* Class
* Level
* Equipment
* Cost
* Personal perks
* Augmentations
* Origin faction

## Personnel pressure

A growing organization needs:

* More soldiers
* More equipment
* More aircraft
* More training
* More base capacity
* More player attention

This creates natural scaling costs.

---

# 6.13 Soldier Classes

Phoenix Point uses standard classes and faction-specific specialist classes.

A useful structural set is:

### Assault

Mobile generalist.

### Heavy

Armor, explosives, heavy weapons, mobility equipment.

### Sniper

Accuracy, long-range attacks, precision targeting.

### Berserker

Aggressive close combat and resistance abilities.

### Technician

Turrets, repairs, mechanical support.

### Priest

Mental effects, morale, psychic abilities.

### Infiltrator

Stealth, deception, reconnaissance, precision damage.

## Multiclassing

Soldiers can combine two class skill sets.

This creates combinations such as:

* Assault and Sniper
* Heavy and Berserker
* Technician and Priest
* Infiltrator and Sniper

## Risk of multiclass systems

Multiclassing can produce:

* Meaningful character expression
* Distinct battlefield roles
* Unexpected combinations

It can also produce:

* Dominant ability combinations
* Extremely long turns
* Skill chains that overwhelm normal combat
* Classes that lose their identity

## Recommendation

For your first version:

* Give each soldier one class.
* Add one optional specialization.
* Do not allow full dual-class skill access.

Example:

```text
Primary class: Ranger
Specialization: Medic

The soldier receives:
- Full Ranger tree
- Three Medic skills
- One Medic passive
```

That is easier to balance and easier for players to understand.

---

# 6.14 Character Development

Soldiers earn experience through missions and training facilities. Level increases provide skill points, which can purchase class skills and improve attributes.

## Improvement categories

* Class abilities
* Personal perks
* Strength
* Willpower
* Speed
* Secondary specialization
* Equipment
* Augmentation

## Attribute functions

### Strength

* Maximum health
* Carrying capacity
* Some melee effects

### Willpower

* Ability resource
* Mental resistance
* Panic threshold

### Speed

* Movement distance per Action Point

## Personal perks

Random personal perks differentiate soldiers of the same class.

Examples:

* Weapon proficiency
* Increased perception
* Extra carrying capacity
* Resistance to a damage type
* Bonus movement
* Improved healing

## Recommendation

Use controlled randomness.

A soldier should not become permanently useless because the random generator gave them three unrelated perks.

Offer either:

* A choice between two perks
* Perk rerolling
* Background-based perks
* Perk categories tied to class

---

# 6.15 Health, Stamina, Injury, and Death

Campaign soldiers have both tactical health and strategic readiness.

## Health

Damage sustained in battle persists afterward.

Healing takes time or medical facilities.

## Stamina

Repeated deployment reduces stamina.

Low stamina can reduce tactical effectiveness.

Resting at a suitable base restores stamina.

## Injuries

Disabled limbs matter during battle and may require treatment.

## Death

Soldier death is permanent unless your game includes a specific recovery mechanic.

## Why these systems matter

They prevent one elite squad from solving every problem.

They encourage:

* Multiple squads
* Reserves
* Rotation
* Base placement
* Medical investment
* Risk assessment

## Recommendation

Health and stamina overlap somewhat.

For a smaller game, use:

* Health for physical readiness
* Stress for psychological readiness

Stress may increase from:

* Injuries
* Squadmate deaths
* Mutant encounters
* Failed missions
* Special enemy effects

That produces more interesting character stories than a generic energy bar.

---

# 6.16 Augmentation and Mutation

Certain soldiers can receive permanent body modifications.

Possible systems include:

* Mechanical augmentation
* Biological mutation
* Psychic alteration
* Symbiotic equipment

## Modification tradeoffs

Each modification should provide:

* Strong mechanical benefit
* Visible physical change
* Equipment restriction
* Resource cost
* Ideological or faction consequence

Examples:

### Mechanical arms

Increased weapon stability and strength.

Cannot wear normal arm armor.

### Mutated legs

Improved speed or jumping.

Reduced compatibility with standard equipment.

### Neural implant

Mental resistance and targeting assistance.

Vulnerable to electromagnetic damage.

## Design purpose

Augmentation should not merely be another equipment tier.

It should change:

* Soldier silhouette
* Tactical role
* Faction relationships
* Narrative identity

---

# 7. Tactical Layer

# 7.1 Tactical Map

Tactical battles occur on generated or assembled maps based on mission type and location.

Phoenix Point features procedural layouts, faction-specific architecture, destructible structures, scavenging locations, bases, and alien environments.

## Map components

* Terrain tiles or navigation mesh
* Buildings
* Cover objects
* Elevation
* Doors
* Windows
* Destructible walls
* Explosive props
* Objective zones
* Reinforcement points
* Evacuation zones
* Loot containers
* Civilian positions
* Spawn zones

## Recommended production approach

Do not generate every building procedurally from scratch.

Use handcrafted modular parcels:

* Building
* Courtyard
* Road section
* Warehouse
* Defensive wall
* Residential block
* Laboratory
* Alien growth

Then arrange them according to mission rules.

This provides:

* Better visual quality
* More reliable navigation
* Fewer impossible layouts
* Controlled sightlines
* Faster testing

---

# 7.2 Turn Structure

Phoenix Point uses a team-turn structure.

The player acts with all available units, then the enemy acts.

## Action Points

Characters normally have four Action Points per turn.

Action Points can be divided among movement, attacks, and abilities in any order. Movement is continuous, so a unit can move, shoot, and continue moving if enough points remain. Different weapons have different Action Point costs.

## Example turn

A soldier could:

* Move for 1.25 AP
* Fire a 2 AP weapon
* Move for the remaining 0.75 AP

Another could:

* Fire a 3 AP sniper rifle
* Use a 1 AP pistol ability

## Why this works

It avoids rigid actions such as:

* Move once
* Attack once
* End turn

Players can construct their own action sequences.

## Unity model

Store AP internally as smaller units.

For example:

```text
1 displayed AP = 4 internal movement units
4 displayed AP = 16 internal units
```

This allows movement to consume fractions without floating-point confusion.

---

# 7.3 Will Points

Will Points are both:

* An ability resource
* A morale system

Skills consume Will Points.

Will Points can also decrease when:

* Allies die
* Certain limbs are disabled
* Psychic attacks occur
* Viral effects occur

Characters can recover Will Points through kills, special map locations, support skills, or by spending an entire turn recovering. Falling below zero causes panic.

## Why this system is strong

The same value controls:

* Powerful abilities
* Emotional stability
* Momentum

Using several abilities may make a soldier more vulnerable to panic.

Killing enemies restores confidence and allows further action.

## Recommended adaptation

Rename it to:

* Resolve
* Focus
* Nerve
* Command
* Spirit

Avoid creating separate mana and morale bars unless they serve genuinely different purposes.

---

# 7.4 Shooting and Free Aim

Phoenix Point allows the player to manually aim many ranged attacks.

The reticle represents the projectile distribution area. Shots land within the outer circle, with a higher probability of landing in the inner circle.

## Possible targets

* Head
* Torso
* Arms
* Legs
* Weapon
* Shield
* Special enemy organ
* Explosive object
* Wall
* Enemy behind another enemy
* Empty space for area attacks

## Mechanical distinction

This is not simply:

> 75 percent chance to hit.

Instead, the game determines:

* Shooter position
* Weapon spread
* Line of fire
* Target geometry
* Projectile path
* Intervening cover
* Body part struck

## Recommended Unity implementation

### Step 1: Determine firing origin

Use the weapon muzzle or adjusted camera firing point.

### Step 2: Build aim cone

Calculate outer cone from:

* Weapon accuracy
* Soldier accuracy
* Range
* Stance
* Armor modifiers
* Status effects

### Step 3: Generate projectile direction

Choose a point within the spread circle.

### Step 4: Raycast or simulate projectile

The first valid collider receives the hit.

### Step 5: Resolve penetration and destruction

Projectile may:

* Stop
* Damage cover
* Penetrate
* Continue with reduced power
* Explode

## Important warning

True projectile simulation is one of the most expensive systems in this design.

Prototype it before building the campaign.

If free aim is not fun and readable, you should not build a Phoenix Point-like tactical game around it.

---

# 7.5 Body-Part Damage

Units have global health plus individual body-part health.

Damaging a body part also damages global health.

When a body part is disabled, the unit may:

* Lose an ability
* Drop or lose access to a weapon
* Move more slowly
* Lose Will Points
* Begin bleeding
* Lose perception
* Lose an attack type

Phoenix Point applies armor and health separately to different body locations. Disabled parts create specific penalties and may cause ongoing bleeding.

## Example enemy anatomy

```text
Head
- Perception
- Psychic attack

Left arm
- Shield

Right arm
- Ranged weapon

Torso
- Main health
- Armor

Legs
- Movement
```

The player may choose to:

* Destroy the weapon arm
* Disable the legs
* Remove the head ability
* Ignore armor and shoot an exposed limb
* Attack the torso for maximum lethal damage

## Why this is compelling

The player can neutralize enemies without killing them immediately.

This creates tactical verbs beyond:

* Damage
* More damage
* Biggest damage

## Recommended data model

```text
BodyPartDefinition
- Name
- Maximum health
- Armor
- Collider
- Attached abilities
- Disabled effects
- Bleed amount
- Destruction visual
- Parent unit
```

---

# 7.6 Armor, Piercing, and Shredding

Armor applies separately to each body part.

Standard damage is reduced by effective armor.

Weapons may use:

### Piercing

Ignores a specified amount of armor.

### Shredding

Permanently reduces armor.

### Explosive damage

Damages multiple body parts and nearby objects.

### Special damage

May include:

* Fire
* Acid
* Poison
* Paralysis
* Viral
* Psychic
* Shock
* Electromagnetic

The official combat documentation describes fixed projectile damage reduced by armor, with piercing ignoring part of that armor and shredding reducing armor after damage is calculated.

## Tactical consequence

Weapon usefulness depends on target type.

* Shotguns work well against exposed targets.
* Rifles suffer against heavy armor.
* Explosives remove armor across several parts.
* High-piercing weapons defeat specific protected areas.
* Fire controls areas and damages over time.

This creates horizontal equipment choices rather than a simple weapon-level ladder.

---

# 7.7 Destructible Environments

Buildings, cover, props, and walls can be damaged.

Destruction permits:

* Firing through walls
* Removing cover
* Creating entrances
* Collapsing sight blockers
* Triggering explosive objects
* Exposing units
* Changing navigation

Phoenix Point advertises its tactical environments as procedurally assembled and potentially destructible.

## Unity implementation options

### Full voxel destruction

Very expensive and unnecessary.

### Modular destruction

Objects have several damage states:

* Intact
* Damaged
* Destroyed

### Panel destruction

Walls are made from destructible sections.

### Visual-only destruction

Collider disappears when health reaches zero.

For a small team, modular destruction is the right answer.

---

# 7.8 Cover

Cover should be physical rather than purely statistical.

A wall protects the portion of a unit physically hidden behind it.

A projectile can still strike:

* Exposed head
* Visible arm
* Legs beneath an object
* Cover itself
* Another object in the path

## Cover categories

* Low cover
* High cover
* Partial obstruction
* Fully blocking structure
* Destructible cover
* Indestructible terrain

## Readability requirement

Players must be able to predict whether a shot is possible.

Provide:

* Line-of-fire preview
* Targeted-body-part highlight
* Obstruction warning
* Estimated spread
* Cover visibility
* Camera inspection

Physical systems feel unfair when visual information is unclear.

---

# 7.9 Overwatch and Return Fire

## Overwatch

The player reserves an attack for enemy movement during the opposing turn.

A cone or firing region defines the watched area.

## Return fire

Some units can automatically fire back after being attacked.

Phoenix Point lists overwatch and return fire as important forms of interaction between turns.

## Design risk

Too much reaction fire can:

* Interrupt turns repeatedly
* Slow battle pacing
* Punish movement
* Create unclear chains
* Allow attacks without meaningful cost

## Recommended version

Overwatch should consume:

* Remaining Action Points
* Ammunition
* A reaction charge

Return fire should be limited to:

* Once per round
* Specific weapons
* A visible cone
* A class skill

---

# 7.10 Detection and Stealth

Units have perception and stealth values.

Detection may depend on:

* Distance
* Line of sight
* Noise
* Lighting
* Armor
* Movement
* Special abilities
* Enemy perception

## States

* Unknown
* Heard
* Suspected location
* Revealed
* Fully identified

## Why partial information matters

A pure line-of-sight system can make stealth too predictable.

An uncertain-contact state creates:

* Tension
* Scouting value
* Ambushes
* Sound-based decisions
* Reconnaissance roles

---

# 7.11 Mission Objectives

Phoenix Point uses many mission categories, including haven defense, rescue, sabotage, base assault, scavenging, infiltration, settlement conflict, and story operations.

## Core mission types

### Elimination

Defeat all enemies.

### Evacuation

Reach extraction with surviving units.

### Rescue

Locate and evacuate civilians or recruits.

### Scavenging

Collect supplies and leave before enemy reinforcements overwhelm the squad.

Official development notes describe scavenging missions as a risk-reward structure where reinforcements continue arriving while the player chooses how much loot to collect before evacuating.

### Defense

Protect a settlement, facility, civilian, or object.

### Sabotage

Destroy specified structures.

### Raid

Steal resources, technology, aircraft, or equipment.

### Capture

Paralyze or restrain a living enemy.

### Enemy-base assault

Locate and destroy a specific biological or command structure.

### Boss mission

Disable body parts and survive unique attacks.

### Story mission

Hand-authored objective and narrative sequence.

## Mission composition

A mission definition should include:

```text
Map biome
Map parcel set
Attacker faction
Defender faction
Player deployment zone
Enemy deployment rules
Objective set
Reinforcement rules
Extraction rules
Loot rules
Civilian rules
Weather
Time of day
Threat level
Reward table
Failure consequences
```

---

# 8. Enemy Progression

Phoenix Point’s enemy is designed to change during the campaign.

The game’s official description emphasizes a mutating threat that generates new forms and adapts as the player becomes more capable.

## Enemy variation

Enemies can change:

* Weapons
* Armor
* Body parts
* Movement systems
* Defensive organs
* Special attacks
* Resistances
* Support abilities

## Adaptation model

A sophisticated adaptation system might examine:

* Player weapon usage
* Damage types
* Average engagement distance
* Common soldier classes
* Explosive use
* Stealth use
* Mission success rate

Then alter enemy-generation weights.

## Recommended model

Do not directly counter the player every time.

That feels like cheating.

Use three inputs:

### Campaign time

Stronger forms appear as the crisis progresses.

### Enemy infrastructure

Existing enemy bases produce evolution points or threat capacity.

### Player behavior

Frequently used tactics slightly influence mutation weighting.

Example:

```text
Enemy evolution score:
50% campaign stage
35% enemy territory
15% player behavior
```

The 2025 Firebird update changed the official game so that Pandorans no longer gained evolution points from losing battles or having bases destroyed. The developers identified that older behavior as contradictory because successful resistance could make the enemy stronger.

That is a good lesson.

Do not punish the player merely for engaging with the game correctly.

---

# 9. Enemy Bases and Strategic Pressure

Enemy bases create regional attacks.

Possible tiers:

* Nest
* Lair
* Citadel

Higher-tier bases may:

* Launch stronger attacks
* Affect a larger region
* Produce advanced enemies
* Spread environmental corruption
* Conceal themselves
* Require specialized assault missions

## Discovery

Enemy bases may be revealed by:

* Defending nearby settlements
* Research
* Reconnaissance
* Interrogating captives
* Sensor facilities

## Strategic loop

Enemy base appears.

It launches regional attacks.

Player defends a settlement.

Defense reveals approximate base location.

Player scans or explores.

Player assaults base.

Regional pressure decreases.

This links tactical success to the world map.

---

# 10. Narrative Events

Exploration and faction interaction can trigger text-based events with decisions and consequences.

The official wiki catalogs exploration and haven events tied to locations, factions, and research.

## Event structure

```text
Title
Narrative text
Image
Trigger conditions
Available choices
Resource requirements
Faction effects
Research effects
Follow-up event
Mission created
World-state flags
```

## Choice effects

* Gain or lose resources
* Change faction relations
* Start a mission
* Recruit character
* Damage aircraft
* Reveal location
* Alter research
* Affect settlement
* Change later dialogue
* Commit to a victory route

## Good choice design

Avoid:

* Good option
* Evil option
* Obviously stupid option

Use tradeoffs such as:

* Save civilians but lose equipment
* Support a faction but damage rival relations
* Study a threat but delay immediate response
* Destroy dangerous research or preserve it
* Tell the truth and create panic, or conceal it and lose trust later

---

# 11. Campaign Failure and Victory

## Failure pressure

Possible failure conditions:

* Global population falls too low
* All viable soldiers die
* Every base is destroyed
* Critical objective expires
* Enemy completes final project

## Victory paths

Phoenix Point supports different conclusions connected to faction relationships and research choices. The game’s store description explicitly identifies multiple endings and faction-specific approaches.

## Recommended structure

Include four broad paths:

### Independent solution

Most difficult research route, few faction requirements.

### Military solution

Destroy the source through overwhelming force.

### Technological solution

Control, contain, or rewrite the threat.

### Biological solution

Adapt humanity to survive alongside the threat.

The route should affect:

* Required research
* Required facilities
* Final missions
* Faction alliances
* Enemy behavior
* Ending state

---

# 12. Major Interface Areas

## 12.1 Geoscape Screen

Contains:

* Global map
* Aircraft panel
* Time controls
* Active missions
* Event timers
* Resource display
* Research status
* Manufacturing status
* Population or crisis indicator
* Faction relations

## 12.2 Base Screen

Contains:

* Facility slots
* Power status
* Construction
* Repairs
* Personnel present
* Aircraft present
* Regional scan range
* Base defense

## 12.3 Personnel Screen

Contains:

* Soldier roster
* Status
* Class
* Level
* Health
* Stamina or stress
* Equipment
* Aircraft assignment
* Skills
* Augmentations

## 12.4 Equipment Screen

Contains:

* Armor pieces
* Weapons
* Ammo
* Quick items
* Backpack
* Weight
* Saved loadouts
* Available inventory

## 12.5 Research Screen

Contains:

* Available projects
* Research queue
* Prerequisites
* Progress
* Laboratories
* Completed research archive

## 12.6 Manufacturing Screen

Contains:

* Available designs
* Resource cost
* Production time
* Queue
* Facility output
* Owned quantity
* Equipment filters

## 12.7 Diplomacy Screen

Contains:

* Relationship values
* Faction goals
* Active faction missions
* Known research
* Current wars
* Diplomatic benefits
* Final-project status

## 12.8 Mission Deployment Screen

Contains:

* Aircraft
* Selected soldiers
* Equipment warnings
* Vehicle slots
* Threat rating
* Objective
* Enemy information
* Deployment capacity

## 12.9 Tactical Screen

Contains:

* Map
* Unit portraits
* Health
* Action Points
* Will Points
* Abilities
* Weapon
* Ammo
* Movement preview
* Cover preview
* Overwatch controls
* End turn

## 12.10 Mission Results

Contains:

* Objective result
* Survivors
* Deaths
* Injuries
* Experience
* Skill points
* Recovered items
* Resources
* Diplomacy changes
* Strategic consequences

---

# 13. Unity Architecture

# 13.1 Campaign Data

Use ScriptableObjects for static definitions:

```text
FactionDefinition
SoldierClassDefinition
SkillDefinition
WeaponDefinition
ArmorDefinition
BodyPartDefinition
EnemyTemplate
MutationDefinition
FacilityDefinition
AircraftDefinition
VehicleDefinition
MissionDefinition
MapParcelDefinition
ResearchDefinition
EventDefinition
ResourceDefinition
```

Use serializable save objects for campaign state:

```text
CampaignState
WorldNodeState
BaseState
HavenState
FactionState
AircraftState
SoldierState
InventoryState
ResearchState
ManufacturingState
EnemyEvolutionState
MissionState
NarrativeFlags
```

Do not save direct references to scene objects.

Save stable IDs and reconstruct runtime objects when loading.

---

# 13.2 Core Strategic Services

```text
CampaignClockService
WorldMapService
ExplorationService
MissionGenerationService
FactionService
DiplomacyService
BaseService
ResearchService
ManufacturingService
InventoryService
PersonnelService
AircraftService
EnemyEvolutionService
NarrativeEventService
SaveService
```

Use event messages between systems.

Example:

```text
OnResearchCompleted
OnHavenAttacked
OnAircraftArrived
OnMissionExpired
OnEnemyBaseCreated
OnSoldierKilled
OnFactionRelationChanged
```

This prevents every manager from directly calling every other manager. Otherwise you will eventually create a spaghetti creature worthy of Phoenix Point itself.

---

# 13.3 Tactical Architecture

```text
TacticalBattleController
TurnController
UnitController
ActionPointSystem
MovementSystem
AimingSystem
ProjectileSystem
DamageSystem
BodyPartSystem
CoverSystem
DestructionSystem
StatusEffectSystem
AbilitySystem
DetectionSystem
ObjectiveSystem
EnemyAIController
TacticalSaveSystem
```

## Unit composition

Prefer component-based units:

```text
Unit
├── Attributes
├── Health
├── BodyParts
├── Inventory
├── Equipment
├── Movement
├── ActionPoints
├── Will or Resolve
├── Abilities
├── Detection
├── Faction
└── AI or PlayerControl
```

---

# 13.4 Ability System

Make abilities data-driven.

An ability definition should contain:

```text
Ability ID
Display name
AP cost
Will cost
Target type
Range
Area
Required equipment
Cooldown
Charge count
Effects
Animation
AI value
```

Effects should be reusable building blocks:

* Deal damage
* Apply status
* Restore health
* Move unit
* Change armor
* Add Action Points
* Add Will Points
* Spawn object
* Reveal area
* Control unit
* Modify accuracy

---

# 13.5 Tactical AI

Use utility-based AI.

Each enemy evaluates possible actions:

```text
Attack exposed target
Disable dangerous weapon
Move to cover
Retreat
Use support ability
Destroy objective
Protect ally
Flank
Overwatch
Escape
```

Score each action using:

* Expected damage
* Kill probability
* Disable probability
* Exposure after acting
* Objective value
* Range
* Resource cost
* Unit personality

Do not start with machine learning or a giant search tree.

A good utility system is enough.

---

# 14. Recommended Original Version

A full Phoenix Point equivalent is too large for an initial Unity project.

Build a smaller version with:

## Strategic layer

* One continent
* 30 map nodes
* Three factions
* Three player bases
* Three aircraft types
* Three resources
* 20 research projects
* One enemy-evolution system
* One main crisis meter

## Tactical layer

* Four-person squads
* Five soldier classes
* Eight enemy types
* Three enemy body layouts
* Twelve weapons
* Six armor sets
* Eight mission types
* Three map themes
* Modular destruction
* Free aiming
* Body-part damage
* Action Points
* Resolve abilities

## Campaign

* 12 to 20 hours
* Three faction routes
* One independent route
* Approximately 40 required tactical missions
* Optional procedural missions
* Four final mission variations

---

# 15. Development Order

## Phase 1: Tactical shooting prototype

Build:

* One soldier
* One enemy
* One room
* Movement
* Action Points
* Free aim
* Projectile spread
* Body parts
* Armor
* Destructible cover

Do not continue until shooting is readable and satisfying.

## Phase 2: Tactical squad prototype

Add:

* Four soldiers
* Turn order
* Abilities
* Will or Resolve
* Overwatch
* Enemy AI
* Objectives
* Extraction

## Phase 3: Persistent soldiers

Add:

* Soldier progression
* Inventory
* Equipment
* Injuries
* Death
* Mission rewards

## Phase 4: Small strategic map

Add:

* Map nodes
* Aircraft movement
* Time
* Missions
* Expiration
* One base
* Healing
* Manufacturing

## Phase 5: Strategic campaign

Add:

* Factions
* Diplomacy
* Research
* Multiple aircraft
* Haven attacks
* Enemy bases
* Enemy progression

## Phase 6: Narrative and final paths

Add:

* Events
* Decisions
* Faction stories
* Ending projects
* Final missions

## Phase 7: Optional complexity

Only then consider:

* Vehicles
* Augmentation
* Base-defense layouts
* Air combat
* Advanced faction wars
* Rare-resource sites
* Mod support

---

# 16. Systems You Should Not Copy Exactly

Do not copy:

* Phoenix Point terminology
* Pandoravirus
* Phoenix Project
* Existing faction names
* Existing faction ideologies word for word
* Enemy silhouettes
* Creature anatomy
* Weapon names
* Story events
* Research names
* UI layout
* Art direction
* Narrative text
* Specific classes and abilities as a complete set

You can use:

* Global strategic operations
* Competing factions
* Aircraft-limited response
* Modular bases
* Location-based damage
* Physical projectile simulation
* Persistent personnel
* Horizontal technology
* Enemy adaptation
* Multiple solutions to a crisis

Mechanics can be inspiration. The full expression of those mechanics needs to be yours.

---

# 17. Strongest Design Lessons

## The strategic map must create tactical context

A tactical battle matters more when the player understands:

* Why it happened
* What will be lost
* Who is involved
* What the reward enables
* What else they are neglecting

## Physical shooting needs excellent information

Manual aiming is satisfying only when:

* Colliders match visuals
* Cover behaves predictably
* Projectile spread is visible
* Body parts are readable
* The camera cooperates

## Disabling is more interesting than raw damage

Body parts, equipment, morale, movement, and abilities give players several ways to neutralize a threat.

## Technology should provide alternatives

New research should create different solutions, not simply make every old weapon obsolete.

## The player should not save everyone

Aircraft range, travel time, fatigue, and simultaneous attacks make prioritization meaningful.

## Administration must be controlled

Phoenix Point’s depth can turn into excessive inventory, trade, aircraft, and roster management.

Your version should automate repetitive decisions without automating strategic choices.

## Enemy adaptation must feel understandable

Show the player why enemies are changing.

Examples:

* “Enemy armor development detected.”
* “Frequent incendiary attacks have favored heat-resistant forms.”
* “Destroying the regional hive will slow heavy-unit production.”

Invisible countermeasures feel rigged.

---

# 18. Final Recommended Core Loop

The cleanest original adaptation would be:

1. Scan a region.
2. Reveal settlements, threats, and resources.
3. Decide which faction or location to support.
4. Prepare a four-person squad.
5. Fly to the mission before it expires.
6. Complete a body-targeting tactical battle.
7. Recover equipment, intelligence, and specimens.
8. Treat injuries and manage stress.
9. Research new responses.
10. Manufacture specialized equipment.
11. Establish another regional base.
12. Face stronger enemy variants.
13. Commit to one of several solutions to the crisis.

The central design question is:

> Can the player make an interesting strategic decision before the mission, an interesting tactical decision during the mission, and a meaningful recovery decision afterward?

When all three answers are yes, the campaign loop works.
