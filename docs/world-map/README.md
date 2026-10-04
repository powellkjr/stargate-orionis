# World Map Documentation

## Status

The World Map Simulator is a standalone prototype specification. It evaluates seeded galaxy geometry, hidden Stargate routing, campaign placement, and the player-facing map interface. It does not replace the production-game design document.

## Documents

- [Design/demo consistency audit](../design-consistency-audit.md) — settled rules and remaining alignment checklist.
- [Campaign context reconciliation](../campaign-context-reconciliation.md) — incoming endgame concepts, repository resolutions and open decision checklist.

- [World Map Simulator v1](world-map-simulator-v1.md)
- [Unique glyph address encoding](unique-glyph-address-encoding.md)
- [Havens, Population, Resources & Trade supplement](havens-population-resources-trade.md)
- [Specializations and Haven Context Handoff](../theory/professions/specializations-and-haven-context-handoff.md) — faction/local identity design context; does not override the population/economy supplement.
- [Specialization and Haven Decision Checklist](../theory/professions/specializations-and-haven-decisions.md)
- [Runnable simulator and generation assumptions](../../demos/world-map-simulator/README.md)

The v1 specification includes a supplement covering Haven population, P-scale capacity, representative resources, trade constraints, and map layers.

## Authority Boundary

The simulator document defines provisional implementation conventions for geometry experiments, including its generated address grammar, routing graph, hop-limit analysis, and God View/SGC View separation. Production-game address presentation, Haven rules, mission systems, and economy systems remain governed by their existing documentation until explicitly revised.

The implemented demo keeps faction identity and routing state visually separate: faction colors are marker fills, while reachability is shown by an independent ring. `requires staging` uses an orange dashed ring so it cannot be confused with the Concord faction color. The demo displays Concord while retaining legacy faction keys; Moy'na remains the species name.
