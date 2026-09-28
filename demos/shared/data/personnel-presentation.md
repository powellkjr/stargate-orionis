# Shared personnel presentation

`personnel-presentation.json` stores a record by stable staffing Unit ID for all 54 personnel. Each record has `favorite` and `portrait: { renderer, appearance }`. Appearance contains editable parts and colors for the current portrait simulator bust renderer; it has no competency meaning. Initial combinations are deterministic, normal-range human variations generated from the stable Unit IDs, with profession collar colors.

Staffing and Offworld use `shared/js/personnel-panel.mjs` and the same stylesheet. The roster builder attaches the shared presentation record; Offworld copies its appearance into the mission unit for map tokens and party portraits. It no longer synthesizes portraits from the old six-person fixture.

Favorite checkboxes persist overrides by Unit ID in browser localStorage under `sgc-personnel-presentation-v1`. Favorites sort first in both demos, with each demo retaining its ordinary secondary order. This is same-origin browser persistence, not a write back to the repository JSON or synchronization across devices. Authored defaults remain false.
