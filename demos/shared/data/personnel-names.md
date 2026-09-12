# Personnel name pools

`personnel-names.json` contains the ordered name pools used by the staffing demo.
Batch `profession-reference-v1` (2026-09-09) replaces all previous names: 16 given
names and 16 surnames per profession, 192 components in total. All 96 given names
are globally unique. No component was reused from the previous manifest.

## Sources and editorial mapping

The linked Fantasy Name Generators category descriptions were read as style
references. Codex generated and curated the new lists locally; these are **not
captured outputs from the site's Generate buttons**. No website generator code
or underlying name databases were copied. There was no button option or random
seed for this authoring pass. The manifest records the exact authoring prompt,
per-profession style briefs, URLs, date, and accepted ordered arrays.

| Profession | Reference | Editorial treatment | First runtime name |
| --- | --- | --- | --- |
| Soldier | [American English](https://www.fantasynamegenerators.com/english-names.php) | Concise contemporary names; ordinary surnames; no ranks or callsigns | Brett Holt |
| Scout | [Nature](https://www.fantasynamegenerators.com/nature-names.php) | Nature given names and landscape surnames | Aspen Woodland |
| Technician | [Steampunk](https://www.fantasynamegenerators.com/steampunk-names.php) | Victorian flavor and restrained craft surnames; omit the generator's middle-name convention | Alfred Arkwright |
| Scientist | [Victorian](https://www.fantasynamegenerators.com/victorian-names.php) | Classical names for an academic tone; no honorifics | Ambrose Ainsworth |
| Medic | [American English](https://www.fantasynamegenerators.com/english-names.php) | Familiar contemporary names; no medical puns | Abigail Anderson |
| Diplomat | [Royal/Posh](https://www.fantasynamegenerators.com/posh-names.php) | Formal names; omit noble titles | Anastasia Ashford |

This mapping is an editorial choice for presentation, not a mapping supplied by
Fantasy Name Generators or a rule about profession, nationality, or ancestry.
The [Profession generator](https://www.fantasynamegenerators.com/profession-names.php)
produces job titles rather than people's names. The
[Mad Scientist generator](https://www.fantasynamegenerators.com/mad-scientist-names.php)
focuses on comic nicknames and title-based wordplay, so Victorian names were used
as the Scientist reference instead.

## Repeat the process

1. Read the category pages above and the `provenance.references` style briefs.
   Use the same mapping unless intentionally revising the editorial direction.
2. Copy the exact `provenance.prompt` from the manifest. Supply the current pools
   as the exclusion list when requesting another full replacement. Generate 16
   given names and 16 surnames for each existing class ID in manifest order.
3. Review for the recorded style, readable human names, omitted titles/suffixes,
   and obvious famous-character combinations. Keep given names globally unique;
   require nonempty strings and no duplicates within a surname pool. For a full
   replacement, compare all components against the prior manifest and reject any
   reused component. Shared surnames across professions are allowed.
4. Save the accepted arrays in their reviewed order. Update the batch ID, date,
   authoring method, exact prompt, source URLs, and style briefs in `provenance`.
   This batch accepted 16 entries in each array; validation found no duplicates
   or old-name overlap. The saved arrays are the complete accepted output.
5. Run the check below, then serve and open the demo using its README. Confirm
   that 54 units load and display the intended names. The first nine given names
   in each pool appear in the current roster, all paired with its first surname.

The prompt and mapping repeat the **method**, not the exact creative output.
For exact replay, retain the manifest: runtime selection is deterministic and
requires no network access to Fantasy Name Generators. If a future batch uses
actual website-generated names, record the URL, button/options, displayed names,
accepted names, and any edits before recombination. The site produces random
batches, so a URL alone cannot reproduce one. Its
[Saved Names instructions](https://www.fantasynamegenerators.com/saved-names.php)
explain how to collect selected results with source links.

## Runtime behavior

`generatedPersonName(classId, index, variant)` in the staffing demo selects:

```js
first[index % first.length]
last[Math.floor(index / first.length) % last.length]
```

It appends ` Sr.` for specialization entries and ` V.` for cross-path entries.
Base entries have no suffix; unknown classes fall back to Scientist.
`buildUnitRoster()` uses a separate zero-based counter per class, creating one
base, three specialization, and five cross-path units (54 total).
The pools provide 256 combinations per class before repetition. Adding names
does not add roster units. Changing array lengths or order can rename units;
unit IDs and staffing capabilities are independent of display names.

## Validation

Run from the repository root (Python standard library only):

```powershell
python demos/shared/data/validate-personnel-names.py
```

This checks manifest class coverage, pool lengths, trimmed strings, uniqueness,
and source coverage. It does not test the browser. To verify no reuse during a
future replacement, compare against the prior manifest before overwriting it.
There is no existing project-wide automated test suite or package test command.

## Profession nicknames

Each profession entry in `pools` also contains 16 `nicknames` (96 total).
Examples include Soldier `Bulldog`, Scout `Ghost`, Technician `Sparky`,
Scientist `Brainwave`, Medic `Stitch`, and Diplomat `theRealDeal`.
These are optional presentation choices, not ranks, traits, or capabilities.

Store nicknames separately without quotation marks and preserve their casing.
The user's examples illustrate display formatting: `Jim "Sparky" Gagliardi`
and `Tom "theRealDeal" McGee`. They do not add Jim or Tom to the given-name
pools. Nickname assignment and rendering are not yet wired into the demo.

`nicknameProvenance` records the user examples, local authoring method, exact
expansion prompt, and profession style briefs. To generate more, supply all
current nicknames as exclusions, follow those briefs, reject case-insensitive
duplicates across professions, and append reviewed candidates. Retain previous
batch provenance when recording subsequent batches. The earlier restrictions
on jokes and callsigns apply to given names and surnames; these separate pools
intentionally allow playful profession nicknames. The validator checks nickname
coverage, minimum pool sizes, trimmed strings, and uniqueness.

## Population pools

`populationPools` adds 16 complete display-name candidates for each of the three
factions and three independent populations (96 candidates). These are locally
authored fictional names inspired by the user's mapping, not captured website
output or a claim of authentic Earth naming. Complete names allow single-name
candidates without imposing a first-name/surname structure on every population.

| Population | Fantasy Name Generators search breadcrumbs | Editorial rationale |
| --- | --- | --- |
| Scions | Hellenic; Byzantine; Roman | Old, formal inheritors of the Ancestors; avoid simply repeating Ancient/Goa'uld naming. |
| Concord | Persian/Iranian; Sanskrit; Swahili | Softer, flowing names beside Moy'na, distinct from Scions without treating Concord as the alien-named faction. |
| CLP | English (American); German; Dutch | Familiar, practical names from an ordinary commercial civilization rather than an identity built around antiquity or biology. |
| Independent A | Mongolian | A distinct sound for an isolated Haven culture. |
| Independent B | Akan | A different tradition that broadens the independent populations' naming influences. |
| Independent C | Polynesian/Samoan | A recognizable sound with little overlap with the major factions. |

Independent A/B/C remain placeholders, not newly established faction names.
The manifest stores the full rationale and exact category labels under
`populationProvenance.references`. These labels are search breadcrumbs supplied
by the user; category pages were not consulted for this batch.

To expand, copy `populationProvenance.prompt` and supply the current population
pools as exclusions. Review candidates against each reference and rationale,
reject case-insensitive duplicates across population pools, and append accepted
names in order. Record the next batch and any actual source URLs, generator
options, captured output, and editorial changes if using the website. Retain
previous batch provenance when recording subsequent batches. Save accepted
arrays for exact replay; there is no random seed for this local authoring pass.

Population pools are available as authored data for future selection. The
staffing demo still selects from profession `pools`; no population assignment or
runtime selection rule is introduced here. Profession uniqueness counts above
apply to the original profession batch only.

## Historical provenance

The original inline `CLASS_NAME_POOLS` first appears in commit `10267cd`.
No source URL, prompt, seed, or import procedure was recorded, so the suspected
Fantasy Name Generators origin remains unverified. An initial local expansion
also preceded this batch. Neither set is part of the active pools anymore.
