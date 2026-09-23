# World Map Documentation

## Status

The World Map Simulator is a standalone prototype specification. It evaluates seeded galaxy geometry, hidden Stargate routing, campaign placement, and the player-facing map interface. It does not replace the production-game design document.

## Documents

- [World Map Simulator v1](world-map-simulator-v1.md)
- [Unique glyph address encoding](unique-glyph-address-encoding.md)
- [Havens, Population, Resources & Trade supplement](havens-population-resources-trade.md)
- [Runnable simulator and generation assumptions](../../demos/world-map-simulator/README.md)

The v1 specification includes a supplement covering Haven population, P-scale capacity, representative resources, trade constraints, and map layers.

## Authority Boundary

The simulator document defines provisional implementation conventions for geometry experiments, including its generated address grammar, routing graph, hop-limit analysis, and God View/SGC View separation. Production-game address presentation, Haven rules, mission systems, and economy systems remain governed by their existing documentation until explicitly revised.

The implemented demo keeps faction identity and routing state visually separate: faction colors are marker fills, while reachability is shown by an independent ring. `requires staging` uses an orange dashed ring so it cannot be confused with the Moy'na faction color.
