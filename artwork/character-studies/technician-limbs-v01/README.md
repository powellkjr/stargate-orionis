# Technician limb artwork study

Generated October 11 with the built-in imagegen tool, using only the project's
`artwork/sprite-sources/orionis-technician-b001/technician__v01__source.png`
as a clothing/style/camera reference. Purchased character assets were not supplied
to image generation. Existing source artwork and animation files are unchanged.

Preferred first study: [limb-atlas.png](limb-atlas.png). Eight independently drawn
parts in two columns and four rows: upper sleeves, forearms, gloves, boots.
Pairs are ordered anatomical left then right, using inward-facing thumbs.
These are new counterparts, not geometry-preserving replacements for SCML parts.

[prompt.txt](prompt.txt) records the generation request. The alternate
[limb-atlas-v02.png](limb-atlas-v02.png) attempted alpha cleanup, but changed some
shading/accent colors and did not fully remove halos. Keep both as review evidence.

Both files are 1024×1536 RGBA with transparent background pixels, but faint
semi-transparent halos remain and interior opacity tops out at 254. The requested
strict RGB palette was not followed exactly. Do not treat either as a validated
material-mask master or installable rig pack.

No joint measurements, pivots, separate part exports, source masks, animation or
runtime installation were authored. Review the clothing and part shapes first;
fitting these to the purchased rig requires its existing geometry and registration
to be preserved or explicitly mapped. No code changes or server restart required.
