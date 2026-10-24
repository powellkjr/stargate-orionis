# CT1 room capacities and construction tuning

Approved direction: October 20, 2026. This replaces the earlier proposed four-staff/four-Core checklist. Shared authority: `demos/shared/data/rooms_schema.json`.

The ordinary staffed/Core-capable baseline is **2 staff / 2 Cores**. Automated rooms retain no staff; unsupported features remain absent. Counts are per physical room, not per footprint cell.

| Room | Staff | Cores | Item INV | People places | Bulk capacity | Hours / Supply |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Cultural Platform | 0 | 2 | 0 | 0 | 0 | 24 |
| Analysis | 2 | 2 | 0 | 0 | 0 | 24 |
| Containment | 2 | 2 | 40 | 0 | 0 | 48 |
| Data Storage | 0 | 2 | 0 | 0 | 0 | 24 |
| Equipment Storage | 0 | 2 | 20 | 0 | 0 | 24 |
| Gate Room | 4 | 2 | 0 | 0 | 0 | 36 |
| Holding | 2 | 2 | 0 | 4 | 0 | 48 |
| Infirmary | 2 | 2 | 0 | 4 | 0 | 48 |
| Living Quarters | 0 | 2 | 8 | 4 | 0 | 40.8 |
| Maintenance | 2 | 2 | 0 | 0 | 0 | 24 |
| Material Storage | 0 | 2 | 0 | 0 | 2,000 | 24 |
| Generator | 0 | 2 | 0 | 0 | 0 | 24 |
| Ration Storage | 0 | 2 | 0 | 0 | 2,000 | 24 |
| Receiving | 2 | 2 | 40 | 0 | 0 | 48 |
| Research | 2 | 2 | 0 | 0 | 0 | 24 |
| Response Room | 2 | 2 | 0 | 0 | 0 | 24 |
| Supply Storage | 0 | 2 | 0 | 0 | 2,000 | 24 |
| Tech Platform | 0 | 2 | 0 | 0 | 0 | 24 |
| Workshop | 2 | 2 | 0 | 0 | 0 | 24 |
| SG Team Ready Room | 4 | 0 | 0 | 0 | 0 | 24 |
| Warehouse | 0 | 0 | 20 | 0 | 0 | 24 |

## Confirmed special rules

- Gate Room: four staff and two Core slots.
- Containment: 40 item places at CT1.
- Cultural/Tech Platforms: two CT1 Cores, one Focus + one Support.
- Response Room: two Cores.
- Ready Room: membership 4/5/6 at CT1/2/3, one team per room, no Cores/joining/stacking. Four members maximum deploy; select them in the briefing.
- Experience sharing: equal shares across every assigned SG-team member, including reserves. Shared policy and the allocation query are implemented/tested; mission reward totals and persistent XP awards are not authored yet.
- Living Quarters: each resident has two CT1 Tool locker places; four resident places therefore require eight item places. Resident places and lockers are distinct capacities. No personal locker inventory runtime is implied.
- Equipment Storage: 20 shared item capacity across Weapons and Armor, including allocations retained while equipment is issued. Warehouse: 20 item places.
- Material/Ration/Supply Storage: 2,000 CT1 resource capacity; shared tier tabs do not multiply it.

## Provisional construction prices

- Six work hours per staff, Core or occupant place.
- Six hours per ten item places (0.6h each), or per 1,000 bulk capacity (0.006h each).
- New-room shell/commissioning minimum: 24 hours.
- One Supply per work hour. Upgrades charge added capacity in destination-tier Supply.
- Every current CT1 quote lies between 24 and 48 hours. Prices are estimates; executable construction and Supply reservations remain pending.

## Progression and save scope

Ready Room progression is explicitly 4/5/6. Other upper-tier capacities retain their previous authored values; this task changes their CT1 baseline only. For example, bulk remains 2,000/6,000/8,000 until upper tiers are tuned, and Containment is 40/40/80. These uneven steps are visible data, not an inferred new progression.

The importer pins the old room catalog strictly for historical save validation, then applies current shared definitions. A capacity migration preserves room identities/positions/tiers, roster progression, personnel, clock, assignments, work, team identity and mission party. Old reserves/crew are not discarded. New shared storage caps are validated; invalid over-capacity saves are rejected instead of silently deleting allocations.
