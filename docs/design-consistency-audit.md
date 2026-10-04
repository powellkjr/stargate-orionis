# Design / Demo Consistency Audit

This is a consistency pass, not a numeric balance revision. Latest explicit
design decisions govern the labels and branch rules below. Detailed base
Profession curricula and the Haven population/economy specification retain
their own authority. Demo behavior is evidence of implementation, not new canon.

## Settled — do not reopen as design ambiguity

- [x] Scout: Pathfinder, Tracker, Observer.
- [x] Scientist: Applied, Operational, Strategic.
- [x] Medic: Field Medicine, Trauma, Epidemiology.
- [x] Soldier: Marksman, Guardian, Tactician; Technician: Demolitions,
  Integrations, Overdrive; Diplomat: Negotiator, Ambassador, Arbiter.
- [x] Branch selection requires base Tier III. Selecting a T0/untrained branch
  unlocks slot two; it grants neither equipment nor trained capability.
- [x] No branch means no second slot. Cross-Path and Specialization are
  permanently exclusive; no gameplay switching, including to another branch.
- [x] Concord is the faction; Moy'na is the species, not another faction.
- [x] Story origins are fixed at Scions 6, CLP 5, Concord 4, and three unrelated
  Independent Havens. These are curriculum origins, not exclusive ownership.
- [x] Haven scale means ration-support capacity, not population; bonded pairs
  count as two sentient individuals. Independent Haven count is not a claim
  about Independent population share.
- [x] Ordinary base Medic field medicine is not the named Field Medicine specialization.
  Preserve the detailed curriculum's ordinary-practice terminology.

## Demo alignment checklist — implementation work, not undecided rules

| Status | Conflict / evidence | Required alignment |
| --- | --- | --- |
| [x] | Medic naming | Field Medicine is preferred and already matches runtime; no migration needed. |
| [x] | T0 slot admission | Either valid T0 branch unlocks slot two for eligible base Tools, without branch competency or automatic grants. |
| [x] | Character editor | Demo roster authoring only. Final-game progression uses the Promotion Room and permanent branch commitment; not simulated here. |
| [ ] | Icon registry has 15 labels; Applied, Tracker and Field Medicine are missing. | Add presentation coverage deliberately; do not derive curriculum or capability from artwork. |
| [x] | Faction display | Display Concord, retaining legacy Moy’na keys and species/cohort terminology. |

Relevant files: `demos/shared/offworld/equipment.mjs`,
`demos/shared/offworld/personnel-save.mjs`,
`demos/portrait-simulator/app.mjs`, `demos/shared/data/specialization-icons.json`,
`demos/world-map-simulator/havens.mjs`, and `demos/world-map-simulator/campaign.mjs`.

## Prototype boundaries that already agree

- Base Tier III remains senior generalist competency, not specialization.
- Demo branch labels/tool tracks do not establish dedicated specialization curricula.
- World-map `RATION_CAPACITY` uses 1/4/16 million; population totals count a
  bonded pair as two, with the authored provisional ration equivalents.
- `TRADE_RULES` declares one trade per Haven per hour, but execution is
  explicitly not simulated. Complementary trade suggestions are not shipments.
- Capacity targets and faction resource tendencies are generation guidance,
  not immutable quotas or faction-wide resource pooling.
- Defense must eventually derive from actual Rooms/Cores/infrastructure;
  generic authoritative MilitaryStrength/Offense is prohibited in both specs.
- Cultural naming references are presentation guidance, not ethnicity/species rules.

## Open decisions / authoring checklist

- [ ] **Legacy faction keys:** recommend keeping existing keys as compatibility
  aliases and using Concord for display, followed by an explicit canonical
  export migration if wanted. No silent rewrite of saved campaigns.
- [ ] **Specialization progression:** define tiers, competency, Tool Services,
  equipment relationships and specialist-versus-cross-trained distinctions.
  Names and story-origin assignments are not sufficient specifications.
- [ ] **Onboarding:** define mentor eligibility, supervised mission count,
  completion conditions and resulting state; retain fixed story origins.
- [ ] **Haven authoring:** recover existing Haven/NPC assignments before creating
  new ones; design three unrelated Independent civilizations.
- [ ] **Haven mechanics:** define local government variation, access enforcement,
  separate faction/Haven/leader relationships, allegiance changes and lifecycle.
- [ ] **Prototype progression:** identify the future gameplay selection owner;
  keep character editing distinct from mission-earned progression.

The first item is a compatibility choice; the others are missing design rather
than conflicts that can be settled by copying current demo behavior.

## Sources and scope

- [Confirmed decisions](theory/professions/specializations-and-haven-decisions.md)
- [Context handoff](theory/professions/specializations-and-haven-context-handoff.md)
- [Fixed story origins](theory/professions/specialization-haven-assignment-supplement.md)
- [Base curricula index](theory/professions/README.md)
- [Haven economy authority](world-map/havens-population-resources-trade.md)
- [World-map prototype specification](world-map/world-map-simulator-v1.md)

Scope: repository documentation terminology and authority boundaries, confirmed
specialization/branch rules, shared equipment/editor behavior, and strategic
Haven population/resource/trade samples. This is not a complete simulation of
future Haven governance or a line-by-line capability review of every curriculum.
