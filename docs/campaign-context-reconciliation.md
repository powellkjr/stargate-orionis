# Campaign Context Handoff — Reconciliation

## Status and authority

This records an incoming **context-only** conversation handoff and subsequent
confirmed campaign direction. It is not a complete mechanical campaign
specification or authorization to implement unspecified rules. Existing
repository architecture and the latest explicit user decisions take precedence.
Unconfirmed proposals below are retained so they are not lost, not promoted to
canon by being written here. Demo implementation is not proof of final-game rules.

Authorities:

- [Historical context checklist and deferred conflicts](historical-context-reconciliation.md)
- [Latest faction campaign and nine endings reconciliation](faction-campaign-nine-endings-reconciliation.md)
- [Design consistency audit](design-consistency-audit.md)
- [Central threat reconciliation and unresolved decisions](central-threat-reconciliation.md)
- [Specializations and Haven context](theory/professions/specializations-and-haven-context-handoff.md)
- [Confirmed decisions and remaining authoring](theory/professions/specializations-and-haven-decisions.md)
- [Fixed specialization story origins](theory/professions/specialization-haven-assignment-supplement.md)
- [Haven population/economy](world-map/havens-population-resources-trade.md)
- [World Map simulator scope and routing](world-map/world-map-simulator-v1.md)
- [Reality and Knowledge](theory/architecture/knowledge-evidence-model.md)
- [Persistent instance/item tables](theory/simulator/instance-item-theory-tables.md)
- [Offworld implementation and limitations](../demos/offworld-sandbox/README.md)

## Resolved conflicts — prefer established repository decisions

- [x] **Faction/species:** Concord is the faction; Moy'na is the species.
  Older combined names identify the same faction, not a fourth faction.
  Legacy simulator keys can remain compatibility identifiers; the demo displays
  Concord. Do not silently rewrite saved IDs.
- [x] **Leadership:** use the documented Queen + human President agreement at
  faction level, and Princess + human Governor at Haven level. Do not import
  Grand Matriarch as replacement leadership.
- [x] **Specializations:** use the confirmed 18 names, including Field Medicine,
  Applied, Operational and Strategic, and the fixed Haven story origins. Older
  TBD rosters do not reopen these decisions.
- [x] **Progression:** base Tier III plus a selected T0 branch unlocks slot two,
  not trained branch Tools. Branch commitment is permanently exclusive in the
  game; the editor is demo roster authoring. Promotion Room progression is not
  currently simulated.
- [x] **Custody:** do not create a generic Security storage bucket from the
  handoff. Current room schema distinguishes Holding captive slots from
  Containment-compatible item storage. Choose custody by authored admission,
  physical instance state and capacity, not by a boss/bounty label or size alone.
  Captured living entities remain actors/units where appropriate.
- [x] **Artifacts:** a generic recovery designation can be a player-facing
  reference, not scientific Knowledge or a replacement for persistent instance
  identity. No automatic Theory extraction or artifact consumption. Any
  consumption/transformation requires an authored Recipe.
- [x] **Network:** campaign accessibility must layer on routing, endpoint state,
  and SGC Knowledge. Physical presence, reachability and permission are separate.
  The v1 world-map prototype expressly excludes full threat expansion, faction
  AI and mission generation; campaign ambitions do not expand that scope by fiat.
- [x] **Ancient infrastructure:** technology does not imply a living faction.
  Confirmed: Ancients/Ancestors are historical; there are no living Ancients or
  active present-day Ancient faction. Their technology and the active Stargate
  network remain important. Reopening this requires an explicit canon change.

## Confirmed campaign / endgame direction

The user confirmed the incoming endgame content. These are accepted design
directions, not implemented systems or permission to infer missing mechanics.

- **Exactly nine major endings:** three associated with each of the three major
  factions. This is a fixed target, not a planning estimate. The factions offer
  substantially different answers to the central threat; none is automatically
  the objectively correct solution.
- **Scions:** consolidate approximately nine major Ancestor sites/locations.
  Super-weapon advocates, Gate-weapon protocol and planetary Sentinel systems
  form the accepted endgame direction. Contamination or Emergence can threaten
  access to sacred technology. The approximate site count is not a Haven quota.
- **CLP:** reduce existential dependence on the Stargate network; Gate shutdown
  or isolation can become viable strategic objectives. Spacecraft, rapid
  terraforming, generation ships and planetary denial/defense belong to this
  direction. Federation/republic-style organization is a long-term direction,
  not a defined uniform government for every CLP Haven. Objections to symbiosis,
  biological dependency and reinfection are CLP strategic perspectives, not
  established scientific truth about Moy'na.
- **Concord:** Emergence, Resurgence and Convergence are accepted campaign-program
  names. The latest handoff distinguishes human reconstruction, permanent Moy'na
  development and genuine hybridization respectively; see the nine-ending
  reconciliation above. Exact capabilities and execution mechanics remain open.
- **Escalation:** growing network threat, Sentinel activity, CLP isolation,
  Scion consolidation and scheduled events should change strategic state and
  create time pressure. Rates, deadlines and transitions are not yet defined.
- **Ending philosophy:** paths become viable through accumulated commitments,
  relationships, Haven/faction/network state, discoveries and earlier decisions,
  rather than a single isolated final dialogue choice.

The starting SGC premise and Eclipse Protocol remain unresolved. When concrete
alternatives are recovered, prefer the richer, more fun option while preserving
the established authority boundaries. This preference does not select an
unknown version or authorize inventing missing mechanics.

## Compatible context — keep existing boundaries

These ideas fit existing architecture, but detailed mechanics are not thereby
implemented or fully authored:

1. **Mission sources and provenance:** exploration, Haven/faction requests,
   scheduled events, shortages, base incidents, prior discoveries and follow-up
   consequences can explain mission availability. Preserve source references.
   An authored chain can branch after investigation; persistent state should
   retain its consequences rather than reset to a faction baseline.
2. **Logistics presentation:** expose available missions and why they exist.
   The exact Logistics room/UI responsibility needs authoring, not inference
   from the word Logistics.
3. **Survival ethic:** people remain persistent entities; incapacitation is not
   execution. Treatment, custody, release, exchange and recruitment can matter.
   Material conservation applies to authored destructive work; this is not an
   assertion that all strategic resources are globally nonrenewable.
4. **Personal recognition:** use persistent personnel/NPC identities and local
   relationship history, not a single faction reputation value. Detailed rules
   for recognition and Influence remain open.
5. **Escort:** carrying/protecting someone can impose authored operational
   constraints. Do not derive penalties or restrictions from an objective flag.
6. **Probe:** bounded pre-deployment intel influences party and equipment
   selection without revealing hidden Reality. `HEAVY_RESISTANCE`, `TRAPS` and
   `TREASURE` are proposed vocabulary, not a validated canonical tag registry.
7. **Return UI:** communicate the known return route/cost, stamina/endurance
   and route-changing consequences. Existing Offworld work supports this
   direction; it does not establish every future production UI detail.
8. **Network change:** blocked, isolated, inaccessible or infected destinations
   remain compatible with routing architecture. Threat events must distinguish
   actual state from what the SGC knows.

## Campaign proposals retained, not yet canonized

| Incoming proposal | Reconciliation / unresolved boundary |
| --- | --- |
| Three major faction solution families, three endings each: nine major endings | Confirmed fixed target: exactly nine. Specific outcomes and viability contracts still require authoring; not an implemented count. None is presumed objectively correct. |
| Scion consolidation of approximately nine major Ancestor sites | A campaign-scale working target, not Haven generation quotas or a rule for every Scion Haven. |
| Scion super-weapon advocates, Gate-weapon protocol and planetary Sentinels | Names/concepts need authored functions and relationships. Do not equate planetary or Gate Sentinels with existing map routing objects without a definition. |
| Contamination or Emergence revokes sacred technology access | Requires a defined access mechanism, trigger, scope and recovery path. No automatic item or faction rule is imported. |
| CLP: “Gates are the problem” | Consistent with documented independence from Gate logistics, but not a universal local attitude or currently implemented ending. Spacecraft, rapid terraforming, generation ships and planetary denial remain campaign concepts. |
| CLP federation/republic organization | Accepted long-term direction; CLP governance remains underdesigned, not a uniform Haven government. |
| CLP objections to symbiosis, biological vulnerabilities and reinfection | Proposed strategic perspective, not established truth about Moy'na biology. |
| Concord programs: Emergence, Resurgence, Convergence | Latest handoff replaces the earlier Awakening label with Resurgence. Human reconstruction, permanent Moy'na development and genuine hybridization are distinct directions; exact capabilities remain to author. |
| Timed escalation: network threat, Sentinels, shutdown/isolation and consolidation | Requires authored events and state transitions. No deadlines or escalation rates are established here. |
| Endings built through accumulated commitments, not one final dialogue choice | Confirmed campaign philosophy; define viability from explicit state rather than ad hoc final-choice overrides. |

## Quick decision checklist

Confirmed directions are checked below. Unchecked entries require detailed
authoring or reconciliation, not reapproval of the accepted endgame direction.

- [x] **Ending target:** exactly nine major endings, three per major faction.
- [x] **Endgame content:** accept the incoming Scion, CLP and Concord direction,
  timed strategic escalation and accumulated-commitment ending philosophy.
- [x] **Ancients:** historical only; no living Ancients or active Ancient faction.
- [ ] **Ending authoring:** define the nine distinct outcomes and their viability
  conditions; do not assume each named program already specifies one ending.
- [ ] **Scion implementation:** distinguish the named approaches; recover sites
  before creating replacements; define access loss, triggers and recovery.
- [ ] **Concord implementation:** define the accepted programs' functions and
  whether/how Emergence relates to the access-loss complication.
- [ ] **CLP implementation:** define campaign execution separately from the
  still-open governance structure and local Haven variation.
- [ ] **Escalation mechanics:** author events, deadlines and state transitions.
- [ ] **Central threat compatibility:** use the biological-civilization direction
  and [threat checklist](central-threat-reconciliation.md); distinguish suppression,
  local clearance and durable victory. Intelligence, Gate/root/Iris interaction,
  reservoirs and faction victory conditions remain open; no weekly cadence or
  automatic biological immunity is established.
- [ ] **Starting premise:** locate the authoritative starting SGC state before
  importing an inherited/operational-base premise. Remains unresolved; prefer
  richer, more fun concrete alternatives when comparing them.
- [ ] **Eclipse Protocol:** recover and compare its actual mechanics; the older
  name alone is insufficient to approve, reject or merge the system. Remains
  unresolved, with the same richer/more-fun comparison preference.
- [ ] **Mission logistics:** author source/provenance records and the exact
  Logistics access/UI role, without expanding simulator scope automatically.
- [ ] **Escort / recognition / Probe:** define restrictions, persistence rules
  and permitted intel vocabulary before implementing them.
- [ ] **Custody edge cases:** author admission for unusual living captures and
  capacity handling where current Holding/Containment definitions are insufficient.

No demo runtime, numerical balance, save schema, event, Theory, Service, Room or
specialization capability is changed by this reconciliation.