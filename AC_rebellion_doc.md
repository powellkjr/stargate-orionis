# High-Level Design Doc: Squad-Based Mobile Strategy RPG Inspired by Assassin’s Creed Rebellion

## 1. Reference Game Summary

**Assassin’s Creed Rebellion** is a mobile free-to-play strategy RPG built around collecting heroes, managing a base, improving characters, and sending small squads into tactical missions. Ubisoft described the launch version as set in 15th-century Spain during the Inquisition, with players building a Brotherhood, recruiting characters, and sending three-person squads into strongholds. At launch, Ubisoft referenced up to 40 recruitable characters, while later store and Ubisoft pages describe 70+ or 100+ characters, so the roster clearly grew over time.
For your Unity project, the useful pattern is:

**Collect heroes → improve heroes → build base rooms → gather resources → run missions → earn more resources and hero shards → repeat.**

That is the sauce. Do not copy the Assassin’s Creed setting unless you enjoy cease-and-desist confetti.

---

## 2. Core Player Fantasy

The player is the leader of a hidden organization. They do not directly control one main hero all the time. Instead, they:

Manage a headquarters.

Recruit a roster of specialists.

Build teams for different mission problems.

Make strategic choices during short missions.

Collect resources to make the whole operation stronger.

The fantasy is less “I am one hero” and more “I run the whole crew.”

---

## 3. Core Game Areas

## 3.1 Headquarters / Base / Hideout

This is the main home screen and long-term progression hub.

In Assassin’s Creed Rebellion, the HQ contains buildable and upgradable rooms. Official support lists rooms for medicine crafting, armor crafting, hero promotion, intel generation, codex generation, healing, storage, supply runs, training, coins, weapons, and accessories.

### Player actions

Build rooms.

Upgrade rooms.

Assign heroes to rooms.

Collect generated resources.

Start timers for training, crafting, healing, or production.

Expand the base as account level rises.

### Why this area matters

The HQ gives the player something to check between missions.

It turns time into progress.

It creates resource planning.

It gives lower-priority heroes a use outside combat.

### Suggested Unity version

Create a 2D or 2.5D base layout with room slots.

Each room should be data-driven:

Room ID

Room type

Level

Build cost

Upgrade cost

Timer length

Output resource

Assigned character slots

Level requirement

### Example room types for your game

Command Room: raises account cap or opens new features.

Training Room: levels heroes over time.

Workshop: crafts weapons and tools.

Infirmary: heals injured heroes.

Intel Room: generates mission entry currency.

Supply Room: sends idle heroes for wood, metal, food, tech parts, etc.

Treasury: generates soft currency.

Armory: stores and upgrades gear.

Research Room: improves passive bonuses.

Barracks: increases roster size.

The base should not just be decoration. Every room needs a reason to exist, or players will smell filler from space.

---

## 3.2 World Map

The world map is the mission selection screen.

In Rebellion, story missions move the story forward, open new regions, allow new rooms, and give rewards. Standard missions give training resources. Loot missions give crafting materials. Legacy missions cost intel and give hero DNA fragments. Rift missions are tied to limited-time events.

### Player actions

Pick a region.

Select a mission node.

Preview enemy power, mission rewards, room layout, and suggested hero types.

Build a team.

Start the mission manually or use instant completion if eligible.

### Suggested map structure

Region 1: tutorial and early base materials.

Region 2: first team composition checks.

Region 3: gear requirements begin.

Region 4: specialist mechanics matter more.

Region 5: late-game crafting and rare hero materials.

Event Region: rotating special missions.

### Mission node data

Mission ID

Region

Mission type

Energy or entry cost

Required account level

Suggested power

Required or recommended hero tags

Room sequence

Enemy list

Trap list

Rewards

Star conditions

First-clear reward

Repeat reward

---

## 3.3 Mission Gameplay

This is the tactical layer.

Rebellion uses three-person squads for covert missions. Ubisoft describes choosing the right team and deciding whether to fight through encounters or use stealth.

### Mission format

A mission is a sequence of rooms.

Each room presents one or more interaction choices:

Fight enemy.

Sneak past enemy.

Assassinate enemy.

Disarm trap.

Open chest.

Heal ally.

Climb or navigate route.

Use support skill.

Each choice checks a hero’s stats, class, role, gear, or special ability.

### Good mission design pattern

The player should rarely have one perfect hero for everything.

A strong combat hero may fail stealth checks.

A stealth hero may be fragile in combat.

A healer may keep the team alive but may not help with traps.

A trap expert may be weak against bosses.

This creates actual team-building decisions instead of “sort by biggest number.” That sort button is useful, but it should not play the game for them.

### Suggested room interaction model

Each room contains:

Environment challenge

Enemy challenge

Optional reward challenge

Risk value

Recommended role

Success chance formula

Failure consequence

Example:

Room: Guarded Hallway

Options:

Fight guard: uses Attack and Defense.

Sneak past: uses Stealth.

Silent takedown: uses Assassination.

Failure: hero takes damage, alarm meter rises, or enemy combat starts.

---

## 3.4 Heroes / Roster

This is the collection layer.

In Rebellion, players collect DNA fragments to recruit heroes and improve them. Official help says heroes are recruited by accumulating enough DNA fragments, then adding them from the Heroes screen.

### Hero data

Hero ID

Name

Rarity

Class

Role specialization

Level

Rank / star level

Current XP

Power score

Health

Attack

Defense

Agility

Stealth

Crit chance

Skill list

Gear slots

Portrait

Animation set

Faction or theme tag

### Classes

Official support lists three broad classes:

Enforcers: direct melee fighters.

Shadows: stealth-focused characters.

Specialists: support characters with varied skills.

### Role specializations

Official support lists role types such as assassination, stealth, navigation, disarm, support, heal, area damage, damage, and tank.

### Your version

Use three readable classes:

Fighter: survives direct combat.

Sneak: avoids danger and handles silent options.

Specialist: solves mission problems.

Then use roles for more texture:

Assassin

Scout

Medic

Engineer

Saboteur

Tank

Duelist

Archer

Alchemist

Hacker, if you go sci-fi

Scout Leader

### Hero improvement paths

Level: raises base stats.

Rank / stars: raises cap and skill strength.

Gear: adds stats and sometimes effects.

Promotion: consumes duplicate shards or special materials.

Training: timer-based improvement.

Elite training: late-game stat tuning.

## Rebellion uses Training Rooms for leveling, with training costing codex, coins, and time. Promotion uses the Ceremony Room, costs coins, takes time, and requires other participating heroes.

## 3.5 Gear / Crafting

Gear gives players another progression path besides hero shards.

Official support says weapons, armor, and accessories are crafted by assigning a hero to a crafting room, choosing the item, spending coins and materials, and waiting on a timer.

### Gear slots

Weapon

Armor

Accessory

Optional late-game slot: artifact, tool, charm, gadget, relic

### Gear functions

Increase stats.

Meet mission power requirements.

Add role bonuses.

Change how a skill works.

Create build variety.

### Keep this sane

Do not create 800 tiny gear materials unless you want your player inventory to look like a junk drawer had a baby with a spreadsheet.

Use clear crafting materials:

Common metal

Fine cloth

Rare crystal

Ancient schematic

Medical herbs

Mechanical parts

Then let rarity and tier do the work.

---

## 3.6 Resources and Currencies

Rebellion has several resource types: premium currency, event tokens, coins, account XP, DNA fragments, intel, training codex, crafting materials, wood, and stone.

### Your resource categories

Soft currency: used for everyday upgrades.

Premium currency: used carefully for convenience, cosmetics, or optional purchases.

Mission energy: limits repeated play.

Intel currency: entry cost for shard missions.

Training books: level heroes.

Hero shards: recruit and promote heroes.

Crafting materials: make gear.

Base materials: build and upgrade rooms.

Event tokens: enter event missions.

### Economy advice

Keep early resources simple.

Add new resource types only when they create a new decision.

Do not make five currencies that all mean “generic upgrade money.” That is fake depth. Players notice.

---

## 3.7 Mission Types

Use different mission types to route players toward different goals.

### Story Missions

Purpose: campaign progression.

Rewards: first-clear currency, base features, new regions, hero shards.

Replay value: low to medium.

### Training Missions

Purpose: earn XP books or training resources.

Rewards: codex-style items.

Replay value: high.

### Loot Missions

Purpose: earn crafting materials.

Rewards: gear parts.

Replay value: high.

### Hero Shard Missions

Purpose: collect shards for specific heroes.

Cost: intel or special entry currency.

Replay value: very high.

### Event Missions

Purpose: limited-time content.

Rewards: event points, leaderboard rewards, rare shards, cosmetics.

Replay value: high during event window.

### Challenge Missions

Purpose: skill and roster checks.

Rewards: one-time milestone rewards.

Replay value: medium.

---

## 3.8 Instant Completion / Rush System

Rebellion has Rush Mode, where a player can instantly claim mission rewards after previously earning three stars. It still requires a valid healed team, and heroes lose a small amount of health.

### Your version

Call it Sweep, Dispatch, Auto-Resolve, or Quick Run.

Requirements:

Mission completed perfectly before.

Team meets power requirement.

Required class or role tags are satisfied.

Enough entry currency.

Heroes are not injured.

Cost:

Energy or intel.

Small health loss.

Optional ticket.

Why it matters:

Reduces boring repetition.

Makes daily farming tolerable.

Rewards mastery without forcing the player to replay easy content forever.

---

## 3.9 Events

Rebellion includes limited-time events, challenge modes, leaderboard competition, event-specific rewards, and bonus heroes that increase event output. Ubisoft’s official page describes Helix Rift Events set in different time periods with leaderboard rewards and Legendary Heroes.

Official help also says event access depends on account level, with different event systems becoming available at Brotherhood levels 6, 7, and 8.

### Event structure

Event lasts 3 to 7 days.

Player spends event tokens.

Missions award event points.

Certain heroes give score bonuses.

Leaderboard pays ranked rewards.

Milestones pay fixed rewards.

### Event mission tiers

Official help lists five event difficulty tiers: Novice, Adept, Expert, Master, and Grandmaster, each with higher team power requirements and higher point rewards.

### Your version

Use tiers like:

Rookie

Veteran

Elite

Master

Nightmare

Avoid copying names directly. Easy win.

### Event reward types

Hero shards.

Rare gear materials.

Cosmetics.

Premium currency.

Crafting recipes.

Profile frames.

Base decorations.

### Warning

Leaderboards can make money, but they can also make normal people leave. Use milestone rewards as the main path and leaderboard rewards as extra bragging rights. Otherwise whales eat the village.

---

## 3.10 Daily Objectives and Login Rewards

This is the habit layer.

The game needs reasons to check in without making the player feel like they have homework from a tiny digital manager.

### Daily objective examples

Complete 3 missions.

Train 1 hero.

Collect coins from HQ.

Craft 1 item.

Complete 1 hero shard mission.

Use 1 healer.

Spend event tokens.

Claim all room outputs.

### Weekly objective examples

Finish 20 missions.

Promote 1 hero.

Complete 5 event missions.

Craft rare gear.

Earn 15 stars in a region.

### Login reward calendar

Daily reward track.

Monthly reset.

Premium track optional.

Catch-up system optional.

Keep it simple. If the daily list takes 45 minutes, you made a second job, not a game.

---

## 3.11 Shop and Monetization

The App Store listing describes Rebellion as free to play with optional real-money purchases, premium access, increased login and daily objective rewards, faster event token regeneration, and faster HQ timers.

### Possible monetization

Premium currency packs.

Hero shard packs.

Starter bundles.

Monthly pass.

Cosmetic skins.

Event pass.

Timer skips.

Extra resource packs.

### Safer design stance

Sell convenience, cosmetics, and choice.

Be careful selling raw power.

Do not make the campaign miserable unless the player pays. That is not strategy. That is a toll booth wearing a fake mustache.

---

## 4. Core Systems

## 4.1 Account Progression

Rebellion uses Brotherhood Level, which increases from Brotherhood XP earned by completing missions. Official help lists a cap of 50 for that system.

### Your version

Use Player Level or Organization Level.

It controls:

Max hero level.

Available rooms.

Available room levels.

Regions.

Event tiers.

Feature access.

Energy cap.

Team slots.

### Account XP sources

First mission completion.

Repeat mission completion.

Daily objectives.

Event milestones.

Base achievements.

---

## 4.2 Team Building

The team-building screen is one of the most important screens.

### Inputs the player needs

Mission power recommendation.

Enemy types.

Trap types.

Required roles.

Suggested roles.

Reward preview.

Hero health.

Hero power.

Hero skills.

Class tags.

Auto-fill button.

### Team size

Use 3 heroes.

Three is small enough for mobile and large enough for meaningful tradeoffs.

### Team design rules

Every mission should ask:

Can you survive combat?

Can you bypass or solve hazards?

Can you reach optional rewards?

Can you keep everyone alive for full stars?

---

## 4.3 Star Rating

Use a 1 to 3 star system.

Possible star rules:

1 star: mission completed.

2 stars: mission completed with no more than one hero down.

3 stars: all heroes survive.

Rebellion’s event star reward help says three stars are awarded when all heroes survive, and collecting all stars in a difficulty tier gives extra rewards.

### Why stars matter

Stars gate instant completion.

Stars give completion rewards.

Stars guide replay goals.

Stars help players understand mastery.

---

## 4.4 Health and Recovery

Heroes should persist after missions.

If they take damage, they need time or resources to recover.

### System

Hero has current HP and max HP.

Damage carries out of missions.

Infirmary restores HP over time.

Medicine restores HP instantly.

Instant completion causes small HP loss.

### Why it works

It limits endless use of one overpowered team.

It gives the base healing room a purpose.

It nudges players to develop a broader roster.

---

## 4.5 Skill Checks

This is the tactical heart of the game.

### Interaction types

Combat

Sneak

Assassinate

Disarm

Navigate

Heal

Support

Area attack

Tank

Hack / research / magic, depending on theme

### Success formula concept

Success Chance = Hero Stat + Skill Bonus + Gear Bonus + Team Bonus - Mission Difficulty

Show players the chance before they commit.

Do not hide too much. Hidden math is where trust goes to die.

### Failure outcomes

Take damage.

Start combat.

Trigger alarm.

Lose optional reward.

Increase enemy strength.

Remove one skill charge.

---

## 4.6 Skills

Each hero should have:

Basic attack.

One class skill.

One role skill.

One passive.

Optional ultimate or signature skill.

### Skill limits

Charges per mission.

Cooldowns by room.

Once-per-mission powers.

Passive effects.

### Example hero kit

Class: Sneak

Role: Disarm

Skill 1: Silent Strike

Skill 2: Trap Sense

Passive: Starts each mission with +10 percent disarm chance.

Gear bias: daggers, light armor, tools.

---

## 4.7 Rarity and Hero Shards

Rarity creates collection goals.

### Suggested rarity tiers

Common

Uncommon

Rare

Epic

Legendary

### Shard system

Collect shards.

Recruit hero when threshold is met.

Use extra shards for promotion.

Higher rarity requires more shards.

Shard sources:

Story rewards.

Hero shard missions.

Event milestones.

Shop packs.

Daily rewards.

Achievements.

Be careful here. Too stingy and the game feels rigged. Too generous and the collection layer runs out of road.

---

## 4.8 Crafting Timers

Timers are a major part of the base loop.

### Timer uses

Build room.

Upgrade room.

Train hero.

Promote hero.

Craft gear.

Heal hero.

Run supply missions.

### Timer rules

Short timers early.

Longer timers later.

Allow one or more parallel queues.

Let room upgrades increase speed or queue size.

Premium currency can finish timers, but do not make every tap beg for money. Nobody likes a needy button.

---

## 4.9 Inventory

### Inventory categories

Gear

Crafting materials

Consumables

Hero shards

Event items

Cosmetics

### Needed features

Sort by rarity.

Filter by gear type.

Filter by hero compatibility.

Sell or convert extras.

Mark favorites.

Show source of missing materials.

---

## 5. Screen List

## 5.1 Main HQ Screen

Purpose: base management and resource collection.

Contains:

Room grid.

Build button.

Event button.

Mission/map button.

Hero button.

Shop button.

Daily objective button.

Resource bar.

Notification badges.

## 5.2 Heroes Screen

Purpose: roster management.

Contains:

Hero list.

Filters by class, role, rarity, power, health.

Hero detail page.

Training button.

Promote button.

Gear tab.

Skills tab.

Shard progress.

## 5.3 Hero Detail Screen

Purpose: character improvement.

Contains:

Stats.

Current gear.

Skill descriptions.

Rank.

Level.

Shard count.

Training status.

Promotion requirements.

## 5.4 Map Screen

Purpose: mission selection.

Contains:

Regions.

Mission nodes.

Mission type icons.

Reward preview.

Star completion.

Power recommendations.

## 5.5 Team Select Screen

Purpose: pre-mission planning.

Contains:

Three hero slots.

Mission requirements.

Recommended roles.

Enemy preview.

Auto-fill.

Start button.

Instant completion button when available.

## 5.6 Mission Screen

Purpose: tactical play.

Contains:

Room-by-room layout.

Hero portraits and health.

Room challenge options.

Success chances.

Skill buttons.

Reward chest indicators.

Exit and pause options.

## 5.7 Results Screen

Purpose: reward feedback.

Contains:

Stars earned.

XP gained.

Resources earned.

Hero shards earned.

Damage taken.

New records.

Next suggested action.

## 5.8 Crafting Screen

Purpose: gear production.

Contains:

Craftable gear list.

Material costs.

Timer.

Required room.

Required room level.

Assigned worker.

## 5.9 Events Screen

Purpose: limited-time play.

Contains:

Current event.

Timer remaining.

Event missions.

Milestone rewards.

Leaderboard.

Bonus heroes.

Event shop.

## 5.10 Shop Screen

Purpose: purchases and free claims.

Contains:

Free daily pack.

Premium currency.

Bundles.

Hero shard offers.

Cosmetic offers.

Monthly pass.

---

## 6. Unity Implementation Plan

## 6.1 Data Architecture

Use ScriptableObjects for static data:

HeroDefinition

SkillDefinition

GearDefinition

RoomDefinition

MissionDefinition

RegionDefinition

RewardTable

ResourceDefinition

EventDefinition

Use save data for player-owned state:

Owned heroes

Hero levels

Hero ranks

Hero gear

Current resources

Built rooms

Room timers

Mission stars

Event progress

Inventory

Daily objective state

## 6.2 Core Managers

GameStateManager

SaveManager

ResourceManager

HeroManager

RoomManager

MissionManager

CombatResolver

RewardManager

TimerManager

EventManager

ShopManager

UIManager

## 6.3 Mission Resolver

For an MVP, do not build full side-scrolling combat first.

Start with a room card system:

Show room.

Show choices.

Pick hero/action.

Resolve success chance.

Apply result.

Move to next room.

This gets the strategy working before you spend three weeks making a tiny character climb a ladder with dramatic knees.

## 6.4 Save System

You need persistent timers.

Save:

Start time.

Duration.

Timer type.

Assigned hero.

Room ID.

Output.

When the player returns, calculate elapsed time from real-world time.

## 6.5 MVP Scope

Build this first:

10 heroes.

3 classes.

6 roles.

5 rooms.

1 region.

15 missions.

3 mission types.

Basic gear.

Basic training.

Basic crafting.

Star ratings.

Instant completion.

Daily objectives.

Skip events and shop until the core loop is fun. Monetizing a boring loop is just selling sadness with extra steps.

---

## 7. MVP Feature Priority

### Must Have

Hero roster.

Team selection.

Room-based missions.

Base rooms.

Resources.

Training.

Crafting.

Star ratings.

Mission rewards.

Save/load.

### Should Have

Hero shards.

Promotion.

Health recovery.

Instant completion.

Daily objectives.

Region progression.

### Could Have

Events.

Leaderboards.

Skins.

Monthly pass.

Advanced crafting.

Elite stat training.

### Do Not Build First

Real-time multiplayer.

Huge campaign.

100 heroes.

Live event tooling.

Complex monetization.

Custom animation for every hero.

That way lies pain, and probably coffee at 1:17 a.m.

---

## 8. Core Loop Diagram

Player opens HQ.

Collects resources.

Starts room timers.

Checks heroes.

Selects mission.

Builds 3-hero squad.

Completes room-based tactical mission.

Gets XP, materials, shards, coins.

Trains, crafts, promotes, or upgrades.

New missions and rooms become available.

Repeat.

---

## 9. What To Change So It Feels Like Your Own Game

Change the theme completely.

Instead of assassins, use:

Space smugglers.

Monster hunters.

Rebel librarians.

Mythic animal rescuers.

Time-traveling thieves.

Fantasy guild.

Underground resistance.

Post-apocalyptic courier network.

Magical academy field teams.

Change the mission verbs.

Instead of assassinate, use:

Capture.

Disable.

Rescue.

Investigate.

Sneak.

Sabotage.

Negotiate.

Seal portal.

Recover artifact.

Change the base.

Instead of a fortress, use:

Airship.

Space station.

Hidden village.

Traveling caravan.

Underground bunker.

Floating academy.

Train headquarters.

Change the collectible item.

Instead of DNA fragments, use:

Recruit tokens.

Memory shards.

Contracts.

Signal fragments.

Hero pages.

Oath marks.

Character dossiers.

Soul sparks.

Please do not use “DNA fragments” unless your theme really needs genetics. Otherwise it screams “I copied the homework and changed the font.”

---

## 10. Biggest Design Lessons

The best part of this style of game is the loop between base, roster, and missions.

The base gives passive progress.

The roster gives long-term goals.

Missions give active play.

Resources connect everything.

Timers create return visits.

Star ratings create mastery goals.

Events give temporary goals.

Instant completion keeps farming from becoming a chore.

The weakest risk is bloat. Too many currencies, too many timers, too many heroes, too many gear parts, and suddenly the player needs a part-time accountant. Keep the early game clean.

---

## 11. Recommended First Prototype

Build one playable vertical slice:

Theme: original hidden crew concept.

Base: 5 rooms.

Heroes: 9 total, 3 per class.

Mission: 10 room-card missions.

Progression: level, gear, shards.

Combat: chance-based room resolution.

Goal: clear Region 1 boss mission.

The prototype should answer one question:

“Is it fun to pick the right three-person team for a mission and then improve them afterward?”

Until that answer is yes, nothing else matters.
