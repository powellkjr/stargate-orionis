// Source-art material colors for mask authoring, not Profession/gameplay colors.
export const characterArtKeys=Object.freeze(['worker','guard','civilian','soldier','scout','technician','scientist','medic','diplomat']);
export const characterMaterialPalette=Object.freeze({shirt:'#929394',trousers:'#526f89',harness:'#baa98d',gear:'#343a40',accents:'#e3a52e',display:'#00d9ee',skin:'#d59b70',hair:'#704322'});
export const characterShadeOffsets=Object.freeze([-32,-16,0,16,32]);
const channels=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
export function materialRgbRamp(hex){return characterShadeOffsets.map(delta=>channels(hex).map(value=>Math.max(0,Math.min(255,value+delta))));}
const rgbText=values=>`RGB(${values.join(', ')})`;
const materialLine=(label,key)=>`${label}: base ${rgbText(channels(characterMaterialPalette[key]))} (${characterMaterialPalette[key]}); allowed shadow -> highlight values: ${materialRgbRamp(characterMaterialPalette[key]).map(rgbText).join(' | ')}.`;
export function characterPaletteInstructions(){return `CHARACTER MATERIAL PALETTE (shared by overhead sprites and matching profile pictures):
STRICT RGB SOURCE PALETTE: use these integer 8-bit sRGB values, not approximate named colors. Hex values are equivalents for reference. These source colors encode recolorable materials; final skin/hair/clothing colors are applied later by the simulator.
${materialLine('Shirt / jacket fabric','shirt')}
${materialLine('Trousers','trousers')}
${materialLine('Harness / fabric straps','harness')}
${materialLine('Gear, gloves, boots and protective pads','gear')}
${materialLine('Accent trim / small fasteners','accents')}
${materialLine('Exposed skin / head / ears','skin')}
${materialLine('Hair / eyebrows / facial hair','hair')}
Electronic displays only: RGB(0, 217, 238) (${characterMaterialPalette.display}); never use this value on clothing. No emissive color spill.
Ink outlines: RGB(20, 22, 24). Lens pixels on separate layers: RGB(200, 210, 220), alpha 0..80 of 255, with sparse highlights RGB(240, 244, 248), alpha at most 128. Opaque material interiors use alpha 255; transparent background uses alpha 0. Antialiasing may use intermediate alpha at silhouette edges, but retain the owning material's listed RGB instead of baking a background into it.
SHADING RULE: only the five listed tones per matte material, ordered deepest shadow, shadow, base, light, highlight. Use broad simplified cel-painted shading; no additional RGB values, smooth gradients, colored bounce light, hue shifts, tinted highlights, mottled fabric or multicolored texture. Keep material regions distinct, with clean boundaries. Eye whites/iris and facial detail must stay within the listed skin/hair/outline tones for these recolorable source masters.
Apply the identical values and shade assignments to corresponding materials in overhead, portrait and head-kit views. Source palette takes priority over reference colors: preserve reference geometry, identity, hairstyle, shading placement and accessories while normalizing BOTH matched views to these values. Do not recolor just one view or alter previously downloaded original files. Do not change palette assignments by class or variant; class differences use clothing/equipment shapes. No faction insignia, labels or hidden-role clues.
DELIVERY CHECK: inspect actual PNG pixel values before claiming strict compliance. Quantize interior material pixels to the listed ramp after generation if needed, without changing registration or silhouette. If pixel-level verification/quantization is unavailable, say the palette is requested but unverified; do not claim exact RGB compliance.
Do not generate a separate guessed segmentation mask. Masks will be derived and reviewed from the final source pixels.
`;}
export function profilePrompt(key){
 if(!characterArtKeys.includes(key))throw Error('profile-prompt requires a character asset key.');
 return `MATCHED CHARACTER PROFILE PICTURES: ${key}
REFERENCE REQUIRED: attach the three final ${key}__v01__source.png, ${key}__v02__source.png and ${key}__v03__source.png from one overhead character batch. If they are unavailable, request those references before generating; do not invent replacement characters.
Create exactly three matching front-facing head-and-shoulders portraits, not side-profile views. v01 matches overhead v01, v02 matches v02, v03 matches v03. Preserve each person's skin tone, hair color/style, visible head/face shape, age, clothing cut, harness, accessories and material colors. Reveal no new story/role information. Use a neutral relaxed expression, eye-level camera, consistent bust framing and soft low-contrast upper-left lighting. Bright clean chunky mature stylized painted sci-fi, matching the overhead art.
SOURCE SIZE: one 1024x1024 true RGBA transparent PNG per portrait. Center head and shoulders, retain the entire hair silhouette, leave breathing room around the top and sides, no background, UI, text, insignia, frame or cast shadow. Show only materials visible in a bust; do not force trousers or boots into the picture.
${characterPaletteInstructions()}
REFERENCE COLOR PRIORITY: strict source RGB values override reference colors for NEW outputs. Normalize both matched views together; an older overhead reference requires a matching normalized overhead source before this portrait is used as a color-matched pair. Preserve the downloaded originals. Region names remain shirt, trousers, harness, gear, accents, hair and skin in either view.
DESIGN MATCHING: the overhead variants are different shape/design styles, not colorways. Reproduce each reference's own garment cut, collar/cuff shapes, seams, harness and accessory housing shapes in its matching portrait. Do not collapse all three into one generic outfit or create new styles unrelated to the references. The material palette remains identical across variants.
Keep the same framing and subject scale across variants. Generate and review all three against their overhead references, then export separate PNGs. Any contact sheet is intermediate only and must stay out of the archive.
ZIP FILENAME: orionis-${key}-b001-profiles.zip (replace b001 with the exact batch number of the attached overhead sources).
ZIP ROOT FOLDER: orionis-${key}-b001-profiles/ (same batch number).
SOURCE FILENAMES: ${key}__v01__profile-source.png, ${key}__v02__profile-source.png, ${key}__v03__profile-source.png.
ARCHIVE CONTENTS: exactly these three PNG files inside the root, no nested folders or extra files. Verify the ZIP and provide a clickable download link. If file/ZIP export is unavailable, say so; never claim an archive exists.
These portraits are source masters for a later matching-portrait importer, not overhead sprite replacements. Keep the profile archive separate from the overhead archive.
`;}
