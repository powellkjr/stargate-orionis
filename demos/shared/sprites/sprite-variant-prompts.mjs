// Presentation-only design alternatives; never new capabilities or game content.
import {characterArtKeys} from './character-art-prompts.mjs';

export function spriteVariantInstructions(key,entry){
 const natural=['rock','vegetation','floor-outdoor'].includes(key)||key.startsWith('floor-base-');
 const directions=characterArtKeys.includes(key)
  ? ['Clean angular tailoring: straight jacket hems, squared collar/shoulder shapes, crisp garment panels and rectangular existing gear housings.',
     'Soft rounded tailoring: curved jacket seams, rounded collar/shoulder shapes, continuous fabric panels and rounded existing gear housings.',
     'Chunky layered tailoring: overlapping garment panels, reinforced cuffs/hems, broader strap shapes and stepped existing gear housings.']
  :natural
  ? ['Broad compact forms: a few large, blunt masses and spacious low-contrast divisions appropriate to the stated natural subject.',
     'Rounded flowing forms: softer lobes, curved boundaries and organic clustered divisions appropriate to the same subject.',
     'Angular broken forms: faceted masses, irregular layered divisions and sharper contours appropriate to the same subject.']
  :entry.opaque
  ? ['Clean rectilinear layout: broad plain rectangular surface divisions with sparse straight low-contrast seams.',
     'Soft staggered layout: rounded/staggered surface divisions with sparse gently curved low-contrast seams.',
     'Chunky modular layout: offset broad surface divisions with restrained stepped low-contrast seams.']
  :['Clean angular design: broad flat panels, crisp chamfers, squared corners and a simple rectilinear organization.',
    'Soft rounded design: curved shell/panel boundaries, rounded corners and a flowing organization of the same visible components.',
    'Chunky utilitarian design: stepped contours, layered panel construction and a robust block-like organization of the same visible components.'];
 return `VARIANT DESIGN BRIEF — three different shape/design styles, NOT three colorways:
v01 — ${directions[0]}
v02 — ${directions[1]}
v03 — ${directions[2]}
DESIGN DIFFERENCE: change at least three major visible shape features between each pair of variants, such as contour treatment, panel/seam layout and component or garment shape. These must read at runtime size, not only as tiny texture details. Do not duplicate a design and recolor it. Keep the same palette across all three; color changes do not count as variation.
LOCKED PRESENTATION: same bright clean chunky mature stylized painted sci-fi rendering, camera, orientation, lighting, subject scale, occupied footprint envelope and pivot. Different design styles are NOT different rendering media: no pixel-art/anime/photorealistic mixture. Contours and internal geometry may differ within the required envelope; do not enlarge one variant to make it look different.
SEMANTIC LIMITS: preserve the exact public subject, required components, equipment inventory and purpose. Do not add/remove Tools, change capability or tier, imply a new faction/civilization, expose hidden identity, or turn surface appearance into a new game rule. Subject-specific prohibitions take priority over design suggestions; do not add panels to a natural subject or decoration to an empty/void floor.
${characterArtKeys.includes(key)?'CHARACTER LIMITS: keep anatomy, neutral pose and equipment attachment slots consistent; vary clothing cut, seam structure, collar/cuff shapes and existing accessory housings, not equipment inventory. Distinct hairstyles/head shapes are permitted public appearance, but are not a substitute for different garment designs. Material RGB assignments remain identical across variants. Matching portraits must reproduce each variant\'s own design, not a shared generic outfit.\n':''}${entry.pair?'STATE-PAIR LIMITS: each variant is a complete matching state pair. Design may differ BETWEEN v01/v02/v03; within each pair, reuse identical frame/ring pixels, registered bounds and attachments. Never redesign the open/active state separately.\n':''}${entry.opaque?'FLOOR LIMITS: retain the authored material/geology state, fully opaque seamless coverage, restrained contrast and every subject-specific prohibition. Vary permissible surface organization, not state, hazards or props. Keep opposite edges matching and review a 3x3 repeat for EACH variant. For featureless empty/void states, do not invent visible features to force variety; report that the subject limits meaningful style differences.\n':''}VARIATION CHECK: inspect v01/v02/v03 side by side at runtime dimensions and in grayscale. Each should be distinguishable by major shape structure without color cues. Reject colorway-only duplicates and regenerate before packaging. If the subject constraints prevent meaningful differences, report the limitation rather than inventing new content.
`;
}