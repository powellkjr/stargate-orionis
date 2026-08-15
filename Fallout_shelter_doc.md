# Fallout Shelter Systems Analysis for a Stargate-Style Unity Game

## 1. What Fallout Shelter Actually Is

Fallout Shelter is a 2D base-building management game where the player runs an underground Vault, assigns people to rooms, manages resources, sends characters into the wasteland, handles disasters, collects gear, and slowly grows the shelter. Bethesda describes the game around building rooms, managing Dwellers, training S.P.E.C.I.A.L. abilities, sending people on quests, collecting weapons and armor, and defending the base from threats.

For your Stargate game, Fallout Shelter is useful for:

* SGC-style base management
* Room assignment
* Staff specialization
* Timed production
* Resource pressure
* Base incidents
* Away missions
* Team readiness
* Population and personnel growth
* Long-term facility planning

It is less useful for:

* Deep tactical combat
* Faction politics
* Tactical squad control
* Story choice depth
* Sophisticated mission routing

So use Fallout Shelter as the **home base engine**, not the whole game.

---

# 2. Core Loop

Fallout Shelter’s loop is simple:

1. Build rooms.
2. Assign people to rooms.
3. Generate resources.
4. Grow population.
5. Train people.
6. Send people outside.
7. Earn loot.
8. Defend against incidents.
9. Upgrade rooms and gear.
10. Repeat.

The Steam page summarizes the broad fantasy as controlling a Vault, keeping Dwellers happy, and protecting them from the Wasteland. It also calls out building rooms, finding ideal jobs, crafting, recruiting, wasteland exploration, and defense.

## Stargate version

Your loop should be:

1. Build SGC rooms.
2. Assign personnel.
3. Generate supplies, intel, research, and diplomatic influence.
4. Train SG teams.
5. Send teams through the gate.
6. Complete Rebellion-style missions.
7. Bring back artifacts, resources, allies, and intel.
8. Deal with base incidents.
9. Improve base, teams, and gear.
10. Choose which faction solution to support.

That last part is where your game should separate itself. Fallout Shelter has survival pressure. Your version has **ideological pressure**.

---

# 3. Base Layout System

Fallout Shelter uses a side-view underground base made of rectangular rooms. Players place rooms in a grid, connect them with elevators, merge same-type rooms, and upgrade them. Bethesda’s beginner guide specifically says room placement matters, similar rooms should be grouped, and expanding too quickly can make resources and happiness harder to manage.

## What works

The side-view layout makes the whole base readable at a glance.

The player can see:

* Who is working where
* Which rooms are producing
* Which rooms are under attack
* Which rooms are empty
* Which areas are expanding
* Which bottlenecks exist

This is great for a Stargate base because the SGC is naturally room-based.

## Stargate base rooms

### Gate Room

Main mission launch point.

Functions:

* Opens offworld missions
* Controls team deployment
* Handles incoming wormhole events
* Can be attacked during gate breaches
* Requires technicians and guards

### Control Room

Mission control and gate address management.

Functions:

* Decodes gate addresses
* Tracks active missions
* Monitors offworld teams
* Reduces travel or deployment risk

### Briefing Room

Strategic planning.

Functions:

* Select faction policy
* Review mission reports
* Assign team priorities
* Start major story operations

### Armory

Weapons and equipment.

Functions:

* Stores weapons
* Crafts tactical gear
* Assigns mission loadouts
* Improves squad survival

### Infirmary

Healing and recovery.

Functions:

* Restores injured team members
* Treats alien exposure
* Manages psychological strain
* Handles parasite or infection incidents

### Science Lab

Research.

Functions:

* Studies artifacts
* Analyzes enemy technology
* Opens new gear
* Advances faction solutions

### Archaeology Lab

Ancient ruins and symbols.

Functions:

* Decodes inscriptions
* Identifies relics
* Finds new gate addresses
* Helps noncombat mission checks

### Alien Containment

Captives, specimens, dangerous artifacts.

Functions:

* Holds captured enemies
* Studies alien biology
* Risks containment breaches
* Opens special research

### Diplomatic Office

Faction relationships.

Functions:

* Manages the three major factions
* Sends envoys
* Negotiates treaties
* Handles allied worlds

### Training Room

Team development.

Functions:

* Improves soldiers, scientists, medics, engineers, diplomats
* Prepares new recruits
* Specializes personnel

### Hangar / Vehicle Bay

Only needed if you add ships later.

Functions:

* Repairs puddle-jumper-style craft
* Maintains drones
* Supports offworld vehicles

## Recommendation

Use the Fallout Shelter room layout idea, but do not copy the vault silhouette exactly. A Stargate base should feel like a military facility carved into a mountain, not a cheerful ant farm with nukes.

---

# 4. Room Merging and Upgrading

Fallout Shelter lets identical rooms join into wider rooms when placed beside each other, up to a larger shared room. Bethesda’s guide says joined rooms are more efficient and can hold more workers, but upgraded rooms do not merge cleanly with non-matching room levels, so players are encouraged to join first and upgrade later.

## Why this works

Room merging creates satisfying planning:

* Small room early
* Bigger room later
* More workers
* More output
* Higher risk if disaster hits

A large room is efficient, but if it catches fire or gets attacked, more workers are exposed at once.

## Stargate adaptation

Use room expansion, but make it more logical:

### Horizontal expansion

More workstations.

Example:

* Small Lab: 2 scientists
* Expanded Lab: 4 scientists
* Full Lab: 6 scientists

### Vertical upgrade

Better equipment.

Example:

* Lab Level 1: basic artifact analysis
* Lab Level 2: alien tech analysis
* Lab Level 3: Ancient device containment

### Risk tradeoff

Larger upgraded rooms produce more, but incidents are worse.

Example:

* Small lab artifact malfunction: one scientist injured
* Full lab artifact malfunction: power drain, two injuries, research pause

That is much better than “bigger number go brrr,” which is usually where base games get lazy.

---

# 5. Personnel Assignment

Fallout Shelter’s main staff system is built around placing Dwellers in rooms where their stats make them more effective. Bethesda describes finding ideal jobs, providing outfits and weapons, and training abilities.

## Core mechanic

Each person has stats.

Each room wants a stat.

Matching people to rooms improves output.

## Stargate stat system

Do not use S.P.E.C.I.A.L. directly. Make your own stat set.

Suggested Stargate-style stats:

| Stat        | Meaning                                          | Best rooms                     |
| ----------- | ------------------------------------------------ | ------------------------------ |
| Command     | Leadership and mission planning                  | Briefing Room, Gate Room       |
| Combat      | Fighting ability                                 | Armory, Gate defense, missions |
| Science     | Research and analysis                            | Science Lab                    |
| Engineering | Devices, repairs, power systems                  | Control Room, Engineering      |
| Medicine    | Healing and biohazards                           | Infirmary                      |
| Diplomacy   | Negotiation and cultural contact                 | Diplomatic Office              |
| Archaeology | Ancient languages and ruins                      | Archaeology Lab                |
| Resolve     | Stress resistance and alien influence resistance | Missions, containment          |

## Why this matters

This lets noncombat staff matter.

A scientist is not useless because they are bad with a rifle.

A diplomat can prevent a fight.

An archaeologist can open a ruin route.

An engineer can stop a gate overload.

That is much more Stargate than “everyone is a shooter with different hats.”

---

# 6. Production Rooms

Fallout Shelter’s base depends on core resources like power, food, and water. Bethesda’s guide warns players not to expand too quickly because resource management becomes harder. It also recommends planning floors around food, water, and power.

## Fallout Shelter resource structure

The base constantly consumes resources.

Rooms produce resources over time.

More population increases demand.

More rooms increase demand.

Failure creates penalties.

## Stargate resource structure

Use fewer, stronger resources.

### Power

Runs the base, gate, labs, shields, and containment.

Failure causes:

* Rooms shut down
* Gate unavailable
* Research paused
* Containment risk

### Supplies

Food, medicine, ammo, general mission logistics.

Failure causes:

* Lower morale
* Healing delays
* Mission prep delays

### Intel

Gate addresses, enemy movement, faction information.

Used for:

* Opening missions
* Previewing risks
* Avoiding ambushes
* Finding hidden worlds

### Research Data

Generated by labs and missions.

Used for:

* Technology
* enemy analysis
* faction solution paths

### Diplomatic Influence

Generated through envoys, treaties, and faction support.

Used for:

* Alliance missions
* trade
* reinforcements
* special endings

Do not use too many resources early. Five is already plenty. A resource list should not look like a grocery receipt from another planet.

---

# 7. Happiness and Morale

Fallout Shelter tracks Dweller happiness, which reflects whether the Vault is functioning well. Bethesda’s beginner guide connects room planning, resource stability, incidents, and population management to keeping the Vault thriving.

## What happiness does structurally

It is a simple health check for the base.

If players mismanage the base, happiness suffers.

If the base runs well, happiness rises.

## Stargate version

Use **Morale** and **Trust** instead of happiness.

### Base Morale

Affected by:

* Injuries
* deaths
* mission failures
* resource shortages
* alien attacks
* successful rescues
* good living conditions
* time off duty

### Command Trust

Affected by:

* faction decisions
* risky experiments
* secrecy choices
* civilian casualties
* repeated team overuse
* letting allies fall

Morale should affect production and mission readiness.

Trust should affect faction cooperation and staff loyalty.

This gives you a more serious tone than Fallout Shelter’s goofy happiness meter.

---

# 8. Population Growth and Recruiting

Fallout Shelter grows its population through recruitment and matchmaking. The App Store description mentions using a Radio Room to recruit new Dwellers or matchmaking to grow the population.

## What to borrow

Recruitment is gated by base capacity.

More people means more production.

More people also means more resource demand.

## What not to borrow

Do not use Fallout Shelter-style romance baby-making as your main personnel growth system. For Stargate, that would be weird. Like, “sir, the Goa’uld are attacking, but HR has paired two archaeologists in the bunk room.” No. Jail.

## Stargate recruitment sources

Use:

* Military recruits
* Scientists
* engineers
* doctors
* archaeologists
* diplomats
* rescued offworld allies
* defectors
* faction liaisons
* special story characters

## Recruitment rooms

### Personnel Office

Generates recruit candidates.

### Diplomatic Office

Attracts offworld allies.

### Training Program

Turns basic recruits into usable staff.

### Faction Embassy

Gives access to faction-specific recruits.

---

# 9. Incidents and Base Threats

Fallout Shelter periodically throws problems at the base: fires, infestations, and raider attacks. Bethesda’s guide specifically calls out fires, Radroach infestations, and Raiders as problems that can appear, and recommends arming people so they can respond.

## Why incidents are important

They keep the base from being a passive spreadsheet.

They force the player to care about:

* Room layout
* Staff placement
* weapons
* response time
* emergency reserves

## Stargate incident types

### Gate Breach

Enemies come through the gate.

Response:

* Security teams
* Gate shutdown
* iris/shield control
* combat in Gate Room

### Artifact Malfunction

Ancient device causes chaos.

Effects:

* Injuries
* power drain
* locked rooms
* random teleportation
* strange research opportunity

### Containment Breach

Captured enemy or organism escapes.

Effects:

* room lockdown
* staff injury
* research pause
* possible spread

### Alien Virus

Biological or digital infection.

Effects:

* infirmary overload
* lab shutdown
* personnel quarantine
* mission restrictions

### Sabotage

Faction-aligned infiltrator damages a room.

Effects:

* power failure
* stolen intel
* diplomatic fallout
* trust loss

### Psychic Influence

Enemy attempts to control personnel.

Effects:

* morale damage
* temporary staff loss
* bad decisions
* special mission to identify source

## Design rule

Incidents should not just be random punishment.

They should test the player’s earlier choices:

* Did you staff security?
* Did you maintain power reserves?
* Did you isolate dangerous artifacts?
* Did you over-trust a faction?
* Did you send all good fighters offworld?

That is where the fun is. Random pain is just bad weather in code form.

---

# 10. Rush System

Fallout Shelter has a room-rushing mechanic where the player can try to instantly collect production, but failure can trigger an incident. The official beginner guide talks about incidents as a core management problem, and the game’s design uses rushing as a risk-reward pressure point.

## Why rush works

It creates a quick decision:

* Wait safely
* Take resources now and risk disaster

## Stargate version

Use **Emergency Orders**.

Examples:

### Overclock Generator

Gain power now.

Risk:

* fire
* room damage
* power grid instability

### Force Artifact Analysis

Finish research faster.

Risk:

* artifact malfunction
* injured scientist
* corrupted data

### Rapid Gate Dial

Start mission sooner.

Risk:

* wrong destination
* ambush
* gate lockout

### Emergency Medical Push

Heal faster.

Risk:

* supply waste
* staff exhaustion
* reduced recovery quality

This fits Stargate extremely well. Half the show is basically “we need this impossible thing in eight minutes.” Great design fuel.

---

# 11. Wasteland Exploration

Fallout Shelter lets players send Dwellers outside to explore, collect loot, gain experience, and risk death. Bethesda’s guide says explorers should be equipped with good gear, Stimpaks, and RadAway, and that recalling them sends them home safely in half the outbound time.

## Structural role

Exploration is a background mission.

The player sends someone out.

They generate text events and loot over time.

The player checks in later.

## Stargate adaptation

Use **Recon Assignments**.

A recon assignment is not the same as a full Rebellion-style tactical mission.

### Recon assignment examples

* Scout a new gate address
* Observe enemy patrols
* Survey ruins
* Negotiate with a village
* Track a signal
* Recover minor supplies
* Watch a faction border

### Recon results

* New mission appears
* Resource reward
* artifact found
* ambush risk
* faction reputation shift
* team injury
* new gate address
* intel gained

This is a great way to add activity without making the player manually play every little thing.

---

# 12. Quest System

Fallout Shelter added structured quests where selected Dwellers travel to locations, fight room by room, earn loot, and return. Bethesda’s support says quests become available when the player has 18 Dwellers and builds the Overseer’s Office. The App Store description also mentions sending Dwellers on quests, finding armor and weapons, gaining experience, earning Caps, and meeting new Dwellers.

## Why this matters for you

This is the part that connects most directly to Assassin’s Creed Rebellion.

Fallout Shelter quests are simple room-to-room expeditions.

Rebellion missions are also squad-based, role-driven, room/problem sequences.

Your combat can sit between those two.

## Stargate mission structure

Mission = sequence of nodes or rooms.

Each node presents choices.

Example mission:

**Ancient Ruin Survey**

Node 1: Gate arrival

* Check for ambush
* scan symbols
* send scout ahead

Node 2: Broken corridor

* engineer opens door
* soldier clears debris
* archaeologist identifies safe route

Node 3: Enemy patrol

* fight
* sneak past
* diplomat bluffs
* sabotage alarm

Node 4: Artifact chamber

* scientist analyzes device
* archaeologist translates
* soldier guards entrance

Node 5: Escape

* hold position
* sprint to gate
* call base for remote dial

## Mission checks

Instead of only combat stats, use role checks:

* Combat
* Science
* Engineering
* Archaeology
* Medicine
* Diplomacy
* Stealth
* Resolve

This is where your game can feel more Stargate than most Stargate games ever did. Do not make the archaeologist just a worse soldier. Let them solve problems no soldier can.

---

# 13. Gear and Crafting

Fallout Shelter lets players equip Dwellers with outfits and weapons, and the Steam page describes crafting by turning junk into useful items and customizing Dwellers in the Barbershop.

## Gear system purpose

Gear does three things:

* Improves output in rooms
* Improves survival in incidents
* Improves success on missions

## Stargate gear categories

### Weapons

* Sidearms
* rifles
* energy weapons
* staff weapons
* zat-style stun weapons, but rename if original
* heavy weapons

### Armor

* tactical vest
* hazard suit
* offworld armor
* faction armor
* stealth armor

### Tools

* scanner
* translator
* medkit
* repair kit
* shield disruptor
* artifact container
* drone

### Artifacts

* Ancient device
* alien relic
* symbiotic tech
* power crystal
* dimensional beacon

## Gear rule

Gear should support roles, not erase them.

A scientist with a rifle should still not be your best frontline fighter.

A soldier with a scanner should not replace an archaeologist.

Otherwise the roster turns into “who has the biggest gun,” and that is boring with extra clicking.

---

# 14. Training Rooms

Fallout Shelter includes training rooms that improve stats over time. Bethesda’s guide notes that having more Dwellers in a training room reduces training time for everyone in that room.

## Stargate version

Training should improve staff capabilities, but slowly.

### Training rooms

#### Firing Range

Improves Combat.

#### Science Program

Improves Science.

#### Engineering Bay

Improves Engineering.

#### Medical Simulation

Improves Medicine.

#### Cultural Studies

Improves Diplomacy and Archaeology.

#### Mental Conditioning

Improves Resolve.

## Key design decision

Training should help weak recruits become useful.

It should not make everyone perfect.

Use caps, specializations, or diminishing returns.

Otherwise every unit eventually becomes identical, and the roster loses its point.

---

# 15. Staff Traits and Identity

Fallout Shelter Dwellers are simple, but they still have names, stats, outfits, jobs, health, happiness, and sometimes rarity. The game gets a lot of value from making little people feel visible inside the base. Bethesda leans into “get to know your Dwellers” and “find their ideal jobs.”

## Stargate version

Your personnel should have:

* Name
* role
* primary stat
* secondary stat
* trait
* faction leaning
* stress level
* injury state
* mission history
* base assignment
* team assignment

### Trait examples

* Ancient language specialist
* Former special forces
* Alien tech skeptic
* Diplomatic instinct
* Claustrophobic
* Gate travel anxiety
* Fast learner
* Reckless
* Loyal to faction A
* Distrusts faction B
* Resistant to mind control

This is where your three-faction system can quietly touch every system.

A scientist loyal to the “contain the threat” faction may object if you start using dangerous alien tech. That is interesting.

---

# 16. Three-Faction Integration

You said your faction system will focus on three groups with different goals for solving the main obstacle. Good. Keep it that tight.

Fallout Shelter does not really have this, so this is where you add your own identity.

## Example main obstacle

The gate network is destabilizing, and something ancient or hostile is spreading through it.

Three factions propose different solutions.

### Faction 1: The Militarists

Goal:

Destroy the source.

Belief:

The network is too dangerous to leave active.

Gameplay style:

* Strong weapons
* base defense
* direct assaults
* armor
* command bonuses

Base influence:

* Armory upgrades
* security rooms
* gate lockdown options

Mission style:

* kill target
* destroy facility
* extract prisoner
* defend allied base

Ending:

The threat is stopped by force, but parts of the gate network are lost.

### Faction 2: The Scientists

Goal:

Control or stabilize the network.

Belief:

The obstacle is dangerous but understandable.

Gameplay style:

* research speed
* artifacts
* scanners
* nonlethal solutions
* better mission information

Base influence:

* Science Lab upgrades
* artifact containment
* predictive gate modeling

Mission style:

* scan anomaly
* retrieve device
* protect scientist
* delay enemy while device charges

Ending:

The network survives, but the player risks creating a new dependency on alien tech.

### Faction 3: The Adaptation / Alliance Faction

Goal:

Unite with offworld peoples and adapt.

Belief:

Earth cannot solve this alone.

Gameplay style:

* diplomacy
* alien allies
* hybrid gear
* morale
* cultural routes
* alternate mission solutions

Base influence:

* Diplomatic Office
* alien embassy
* mixed teams
* offworld recruitment

Mission style:

* negotiate
* escort
* rescue
* prevent faction conflict
* expose enemy deception

Ending:

The threat is contained through alliance, but Earth gives up total control.

## Fallout Shelter connection

Each faction can affect the base like a room system:

* Build faction-aligned rooms
* Assign faction-aligned personnel
* receive different mission types
* alter incident chances
* change available recruits
* change final solution path

That gives faction politics teeth. Without mechanical consequences, factions are just three people arguing in a menu.

---

# 17. Incidents as Faction Pressure

This is one of the best ways to combine Fallout Shelter with your faction plan.

Instead of only random fires and monster attacks, incidents can reflect faction tension.

## Examples

### Militarist pressure

They demand gate lockdown after an attack.

Choice:

* Accept: fewer gate incidents, lower diplomatic access
* Reject: gain ally trust, higher security risk

### Scientist pressure

They want to test a dangerous artifact.

Choice:

* Approve: faster research, malfunction risk
* Deny: safer base, slower research

### Alliance pressure

They want to house offworld refugees.

Choice:

* Accept: new recruits and diplomacy, higher supply use
* Reject: stable resources, reputation loss

Now the base is not just producing numbers. It is expressing your campaign politics.

---

# 18. Seasons and Limited-Time Vaults

Fallout Shelter added Seasons as themed, limited-time experimental Vaults separate from the main Vault, with challenges and rewards. Bethesda support describes Seasons as part of the game’s largest update since launch, with time-limited experimental vaults separate from the main one. Bethesda also says Season rewards can return to the original vault after the Season ends.

## Why this matters

This is a smart live-content structure:

* Temporary separate run
* Special rules
* themed challenge
* rewards feed main save

## Stargate version

Use **Offworld Operations** instead of seasons.

Examples:

### Atlantis-style Outpost

Temporary base in another galaxy.

Rules:

* limited supplies
* unique Ancient tech
* stronger isolation
* special enemies

### Enemy Occupied World

Temporary resistance campaign.

Rules:

* limited personnel
* stealth focus
* faction support matters

### Quarantine Planet

Temporary survival base.

Rules:

* disease pressure
* medical staff matter
* evacuation objective

### Lost Colony

Temporary social challenge.

Rules:

* diplomacy matters
* food and morale pressure
* low combat

This is a great way to reuse your base systems without bloating the main campaign. Just do not build this first. Future-you can have the chaos. Present-you needs an MVP.

---

# 19. Monetization Lessons, Even If You Are Not Monetizing

Fallout Shelter is free to play and includes in-app purchases on Steam and mobile.

Even if your game is premium, the system lesson matters:

* short timers create frequent check-ins
* long timers create return visits
* loot boxes create collection excitement
* rare characters create long-term goals
* optional speed-ups reduce waiting

## Premium game adaptation

If you are not making free-to-play, be careful with timers.

For a PC or premium Unity game, real-world timers are usually a bad fit.

Use campaign-time timers instead.

Example:

* Research takes 3 in-game days
* Gate travel takes 2 hours
* Healing takes 1 day
* Building a room takes 5 days

The player can advance time, but doing so lets events happen.

That keeps strategic time pressure without making the player literally wait for a fake room to finish.

---

# 20. UI Lessons

Fallout Shelter’s strongest UI idea is that the base itself is the menu.

The player does not need ten tabs to understand the shelter. They look at rooms.

## Stargate UI version

Main screen:

* side-view SGC base
* Gate Room centered or top-level
* Control Room visible above gate
* labs and infirmary nearby
* security close to Gate Room
* diplomatic spaces safer and deeper
* containment isolated

Each room should show:

* assigned personnel
* current job
* timer
* alert state
* output
* risk
* room level

## Warning

Do not hide too much behind icons.

If the player needs a legend, a wiki, and a snack to understand your base screen, the UI lost.

---

# 21. Systems to Borrow

Borrow these directly in structure:

* Room-based base layout
* Assigned staff
* stat-room matching
* resource production
* room upgrades
* incidents
* emergency risk actions
* outside exploration
* quest teams
* gear and outfits
* staff training
* population capacity
* mission rewards feeding base growth

---

# 22. Systems to Change

Change these heavily:

## Population growth

Do not copy the baby system.

Use recruitment, rescue, allied worlds, and faction liaisons.

## Combat

Do not copy Fallout Shelter combat as your main mission system.

Use Rebellion-style mission choices and squad checks.

## Theme

Do not copy vault humor or Fallout presentation.

Use military sci-fi, offworld wonder, moral tension, and alien mystery.

## Timers

Use campaign time, not real-world waiting, unless you are intentionally building mobile free-to-play.

## Resources

Use fewer, clearer resources tied to Stargate decisions.

---

# 23. Suggested Stargate Base System

## Main base resources

* Power
* Supplies
* Intel
* Research Data
* Diplomatic Influence

## Personnel types

* Soldier
* Scientist
* Engineer
* Medic
* Archaeologist
* Diplomat
* Security
* Alien Ally

## Room categories

### Command

* Gate Room
* Control Room
* Briefing Room

### Support

* Infirmary
* Living Quarters
* Training Room

### Science

* Science Lab
* Archaeology Lab
* Artifact Containment

### Defense

* Armory
* Security Station
* Isolation Ward

### Diplomacy

* Diplomatic Office
* Embassy Quarters
* Trade Office

## Core loop

1. Collect base outputs.
2. Review incoming gate events.
3. Assign personnel to rooms.
4. Choose research or faction policy.
5. Send SG team on Rebellion-style mission.
6. Resolve mission nodes.
7. Return with resources, injuries, intel, and faction effects.
8. Handle base incidents.
9. Improve rooms, gear, and teams.
10. Move closer to one of three faction solutions.

---

# 24. MVP Recommendation

Build only this first:

## Base

* Gate Room
* Control Room
* Science Lab
* Armory
* Infirmary
* Diplomatic Office
* Living Quarters

## Resources

* Power
* Supplies
* Intel
* Research Data
* Diplomatic Influence

## Personnel

* 12 recruitable characters
* 6 roles
* 2 traits each
* injury and morale states

## Missions

* 15 Rebellion-style missions
* 5 mission types
* 3 faction mission chains
* 1 base defense event
* 1 artifact malfunction event
* 1 gate breach event

## Factions

* 3 factions
* 3 solution paths
* relationship score
* faction-specific room upgrade
* faction-specific recruit
* faction-specific ending requirement

That is enough. More than enough, honestly. If you build 80 rooms and 200 recruits first, you are not making a game. You are making a database with theme music.

---

# 25. Biggest Design Takeaways

Fallout Shelter’s best idea is that the base is alive.

People are not just stats.

Rooms are not just buttons.

Resources are not just numbers.

Incidents are not just interruptions.

Everything is visible, moving, and slightly unstable.

For your Stargate game, the best version is:

> The SGC is the living strategic hub, the gate network is the mission map, Rebellion-style missions are the active gameplay, and the three factions pull the player toward different solutions.

The base should constantly ask:

* Who is available?
* Who is injured?
* What is the gate doing?
* Which room needs staff?
* Which faction is pressuring us?
* Which mission can we risk?
* What happens if we wait?

That is the good stuff.
