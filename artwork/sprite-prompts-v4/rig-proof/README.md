# Technician rig proof

Historical seven-part queue. The current eleven-part version-2 requests are in
`../rig-proof-jointed/`; elbow/knee joints supersede these complete-limb layers.

Approve 00 first. Upload the SAME approved master with each request 01-07.
This produces seven separate registered layers, not a frame sheet. Keep original
downloads and older head-kit templates; they require conversion to this rig's
head-owned neck overlap before reuse. Portraits are not animation rig layers.

- [ ] 00-technician-master-prompt.txt
- [ ] 01-torso-prompt.txt
- [ ] 02-head-prompt.txt
- [ ] 03-left-arm-prompt.txt
- [ ] 04-right-arm-prompt.txt
- [ ] 05-left-leg-prompt.txt
- [ ] 06-right-leg-prompt.txt
- [ ] 07-equipment-prompt.txt

Collect the seven PNGs plus the provided rig.json into one source folder, then:

`node demos/offworld-sandbox/prepare-sprite.mjs rig-prepare artwork/rig-sources/technician-v01 --out demos/shared/sprites/offworld/rigs/technician-v01`

The tool validates formats/registration and normalizes all parts together. It
does not activate the rig or certify visual seams/RGB. Review neutral pose,
arms +/-12 degrees, legs +/-15 degrees, equipment alignment and readability at
22 world units before registering the output rig in active-character-rigs.mjs.
No current viewer ZIP installer understands rig parts yet.
