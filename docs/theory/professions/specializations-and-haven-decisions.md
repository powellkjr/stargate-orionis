# Specialization and Haven Decision Checklist

Companion to the [context handoff](specializations-and-haven-context-handoff.md).
See the [cross-document/demo audit](../../design-consistency-audit.md) for
confirmed resolutions, implementation evidence and remaining compatibility choices.
Unchecked items are unresolved, not implementation instructions. Detailed
curricula and the World Map population/economy supplement retain authority.

## Resolved Design Decisions

- [x] **Scout roster:** Pathfinder, Tracker, Observer.
- [x] **Scientist roster:** Applied, Operational, Strategic.
- [x] **Medic roster:** Field Medicine, Trauma, Epidemiology (Field Medicine matches the runtime
  label; capability curricula are still unauthored).
- [x] **Second equipment slot:** unlock when either branch is selected at T0
  (untrained), after base Tier III. No branch means no second slot. Selection
  does not grant equipment or trained competency.
- [x] **Branch exclusivity:** Cross-Path and Specialization are permanently
  exclusive. There is no switching to another branch after selection.
- [x] **Naming:** Concord is the faction; Moy'na is the species.
- [x] **Specialization story origins:** six Scion, five CLP, four Concord and
  three separate Independent Haven stories, as fixed in the
  [assignment supplement](specialization-haven-assignment-supplement.md).

## Implementation Alignment — Not Unresolved Design

- [x] Field Medicine is the preferred name and matches the existing runtime.
- [x] Separate second-slot admission from positive-tier branch Tool eligibility:
  either valid T0 branch at base Tier III unlocks a second base-Tool slot.
- [x] Label character-editor controls as demo roster authoring, not gameplay
  progression. Final-game permanent commitment and Tool-making on T1 promotion
  belong in the Promotion Room; that workflow remains unimplemented.
- [x] Display Concord while preserving historical simulator keys for compatibility.
- [ ] Decide whether a future version explicitly migrates historical faction IDs.
- [ ] Update icon coverage for confirmed labels lacking entries; do not infer
  specialization capability from icons.

## Specialization Authoring

- [ ] Recover or provide the referenced Profession Specialization Story Handoff;
  it has not been located in the repository.
- [ ] Recover or author specific origin Havens and NPCs without changing the
  fixed assignments; Independent A/B/C must remain unrelated Havens.

- [x] Confirm the complete three-specialization roster for all six Professions
  (unchanged Soldier, Technician and Diplomat rosters plus confirmations above).
- [ ] Author dedicated capabilities and boundaries for each specialization.
- [ ] Define specialization progression/tier structure.
- [ ] Define Tool Service requirements.
- [ ] Define equipment relationships without automatically granting equipment.
- [ ] Define exact onboarding rules, separate from certification.
- [ ] Define mentor eligibility.
- [ ] Define supervised mission count and chain structure.
- [ ] Define completion conditions and final onboarding state.
- [ ] Define specialization versus cross-path progression relationships.
- [ ] Define the specialist/cross-trained mechanical distinction in overlapping domains.

## Haven / Faction Authoring

- [ ] Define CLP political/governance structure; do not assume uniform local government.
- [ ] Apply confirmed Concord/Moy'na distinction in simulator data (alignment above).
- [ ] Define Scion local government patterns.
- [ ] Define Concord local variation around Princess/Governor governance.
- [ ] Define Independent Haven generation, including minority population guidance
  distinct from the 20/100 Haven-count target.
- [ ] Define local specialties and their representation.
- [ ] Define Haven leader generation.
- [ ] Define cultural identity generation.
- [ ] Define access-state mechanics and relation to physical access.
- [ ] Define Haven-specific relationship mechanics.
- [ ] Define leader-specific relationship mechanics, including SGC individuals.
- [ ] Define faction policy constraints on local Haven behavior.
- [ ] Decide whether/how Havens change faction allegiance.
- [ ] Define founding, abandonment, destruction, isolation and rediscovery.
- [ ] Decide ownership of conceptual Haven fields across Theory, Instance,
  Knowledge and presentation records; do not treat the sketch as a locked schema.

## Repository Evidence

- [Icon labels](../../../demos/shared/data/specialization-icons.json)
- [Runtime branch and equipment rules](../../../demos/shared/offworld/equipment.mjs)
- [Profession progression and boundaries](README.md)
- [Onboarding context](profession-context-handoff.md#specialization-onboarding)
- [Haven population/economy authority](../../world-map/havens-population-resources-trade.md)
- [Population naming references](../../../demos/shared/data/personnel-names.md)

No data migration, runtime behavior change or new curriculum is authorized by
this checklist alone. Record agreed decisions in their owning documents before
implementing them.