# Technician rig proof

The master is selected. Use the SAME approved master with each request 01-11.
This produces eleven separate registered layers with elbows and knees. Keep original
downloads and older head-kit templates; they require conversion to this rig's
head-owned neck overlap before reuse. Portraits are not animation rig layers.

- [ ] 00-technician-master-prompt.txt
- [ ] 01-torso-prompt.txt
- [ ] 02-head-prompt.txt
- [ ] 03-left-upper-arm-prompt.txt
- [ ] 04-right-upper-arm-prompt.txt
- [ ] 05-left-forearm-prompt.txt
- [ ] 06-right-forearm-prompt.txt
- [ ] 07-left-upper-leg-prompt.txt
- [ ] 08-right-upper-leg-prompt.txt
- [ ] 09-left-lower-leg-prompt.txt
- [ ] 10-right-lower-leg-prompt.txt
- [ ] 11-equipment-prompt.txt

Collect the eleven PNGs plus the provided version-2 rig.json into one source folder, then:

`node demos/offworld-sandbox/prepare-sprite.mjs rig-prepare artwork/rig-sources/technician-v01 --out demos/shared/sprites/offworld/rigs/technician-v01`

The tool validates formats/registration and normalizes all parts together. It
does not activate the rig or certify visual seams/RGB. Review neutral pose,
arms +/-12 degrees, legs +/-15 degrees, equipment alignment and readability at
22 world units before registering the output rig in active-character-rigs.mjs.
No current viewer ZIP installer understands rig parts yet.
