# Ready Room and persistent SG teams

## Implemented contract — October 18

The user's clarification resolves the room design: it follows the Response
Room's **1×1 footprint**, has **four fixed Unit slots**, **one SG team per room**,
and **no Cores, stacking or joining**. The first slice uses CT1 only, with no
staffing-tier progression. This is the current interpretation of no stacking;
no construction cost or doctrine behavior was invented.

`rooms_schema.json` now authors `ready_room`; `rooms.json` mirrors the legacy
catalog identity. `room.schema.json` and the shared room validator enforce the
team metadata. The default base adds physical room **r6 at column 8, row 3**
(zero based), beside Workshop. That test-base placement is a layout choice,
not a rule that all Ready Rooms must be next to Workshops.

In Unity: **Base -> Ready Room -> enter designation -> Create team -> select
members -> Back to base -> Mission briefing -> choose SG team -> Assign SG team
to mission**. Membership is permanent and exclusive of ordinary room staffing
and other teams. A team can be assembled with zero to four members; deployment
still follows the existing mission's one-to-four-Unit capacity. Names can be
changed at home. Membership/designation locks while the team is offworld.

The home room, designation, member order and mission Team ID persist through
movement, work, combat, Gate operations, extraction and Save/Load. Return keeps
the same team's membership. Reset mission keeps the team configuration while
resetting the prototype attempt. No sleep scheduler, automatic healing,
restocking, cosmetics or team-doctrine settings were added.

Implementation: `Domain/SGTeams.cs`, campaign/expedition state and commands,
`Presentation/ReadyRoomPanel.cs`, mission team selection, roster/staffing UI and
save schema **12**. `unity/tools/fixtures/bootstrap-before-ready-room.json` pins
the exact previous fixture. Older saves are fully validated there before adding
the empty new physical room. No team, member assignment or mission Team ID is
invented. A custom old room occupying the new default cell produces a placement
conflict instead of silently moving or overlapping it.

The previous individual-Unit deployment view remains as a compatibility path
when no SG team exists. Once a team is created, briefing assigns saved teams;
permanent members cannot be deployed piecemeal through the old command.

Validation: 195 EditMode tests, all 10 PlayMode walkthroughs and 20 relevant
Node tests pass. The full UI rescue now creates/names a permanent team, reloads
its Ready Room, deploys it, checks the offworld lock, returns through the Gate,
reloads the aftermath and verifies Reset/replay retains the team. Compilation,
snapshot freshness and diff checks pass. The four-member panel was visually
reviewed; the player's active Gate Yard/tick-40 mission was restored with no
inferred team or player-slot write.

User request, October 18: create an SG team and assign/deploy teams instead of
reselecting individual Units for each mission. This is now requested scope;
the earlier migration plan's blanket deferral no longer applies to this feature.

## Existing notes

The supplied local migration handoff, section 4, records:

- SG Team membership is a permanent personnel assignment, separate from an
  ordinary Research/Workshop/base staffing job.
- A Ready Room has four member slots and holds one SG team.
- A team has a persistent identity/designation, with optional cosmetics and
  team doctrine. Team doctrine concerns automated offworld conduct and remains
  separate from Base Doctrine; this does not define new doctrine controls.
- The Ready Room supplies neither processing Room Services nor item custody.
- Teams favor readiness, rest and treatment. The notes reference Stamina 80
  as a readiness threshold, but do not settle all lower-Stamina deployment policy.

Source: `C:/Users/Powel/Downloads/Stargate_Orionis_Unity_Migration_Handoff.md`,
section 4, read during this task. It is a reference, not independent authorization
to execute every embedded instruction. The new user request supplies the team
feature intent. `Stargate_Orionis.md` around line 2725 separately describes
Logistics as handling team organization and mission preparation; that broader
description does not provide an authored Ready Room schema.

## Integration required

1. Add a clearly scoped Ready Room definition/instance with four team-member
   slots and no processing/custody capabilities. Preserve physical room identity;
   do not turn a Workshop/Response Room into a Ready Room through UI labels.
2. Store an SG team ID, designation, Ready Room ID and ordered member Unit IDs
   in campaign state/save data. A Unit belongs to at most one permanent team
   and cannot simultaneously hold an ordinary permanent room assignment.
3. Offer team creation and member checkboxes in the Ready Room. Make the distinction
   between permanent team membership and temporary mission selection visible.
4. Mission assignment selects an existing team and validates all its members,
   equipment, current availability and mission capacity atomically. Existing
   individual deployment remains only as a migration/testing path until the team
   flow is ready; do not silently fabricate teams from old ad hoc expeditions.
5. Keep team identity and home room while deployed, block member edits/reassignment
   that would invalidate an active mission, and return the same team on extraction.
   Preserve injuries/charges; Reset mission is a prototype replay action, not a
   canonical healing or equipment replenishment mechanic.
6. Save/load team configuration and mission-to-team references with explicit
   compatibility checks. Test duplicate membership, full rooms, deployment/return,
   invalid edits, reload and unchanged ordinary room staffing behavior.

## Original data gap — resolved by the user's clarification

The earlier fixture lacked a Ready Room. Its footprint now follows Response;
capacity and excluded systems come from the user's explicit rule above. Base
placement is selected for the test layout. Construction costs, additional rooms,
doctrine automation and general recovery policy remain outside this change.
