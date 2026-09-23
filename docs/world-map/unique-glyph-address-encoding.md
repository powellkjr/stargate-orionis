# Codex Update: Unique Glyph Address Encoding

## Problem

The current address renderer appears to map each coordinate value independently to a glyph:

```text
Q q Z r R $
```

This allows repeated glyphs inside one Stargate address whenever two fields happen to contain values that map to the same glyph.

Example:

```text
Q = +2
Z = +2
```

could result in:

```text
G05 ... G05 ...
```

We do **not** want repeated destination glyphs within a normal six-glyph Stargate address.

---

# Required Change

Separate the **logical address** from its **visible glyph encoding**.

Keep the existing logical address:

```text
Q q Z r R $
```

unchanged.

Do not modify galaxy geometry, coordinate generation, routing, major/minor networks, or `$`.

Instead introduce:

```text
Logical Address
      ↓
Address Encoder
      ↓
Six Unique Glyph IDs
```

The six visible destination glyphs must always be distinct.

---

# Important Architectural Rule

Do NOT treat a glyph as a direct visual representation of a coordinate value.

This is no longer correct:

```text
Q = +2 -> G05
q = +2 -> G05
Z = +2 -> G05
```

Instead, the complete logical address is encoded into an ordered sequence of six unique glyphs.

Conceptually:

```text
Logical:

Q = +2
q = -1
Z = +2
r = 0
R = -3
$ = 7

        ↓

CanonicalAddressIndex

        ↓

Permutation Encoder

        ↓

Visible:

G14 G03 G27 G09 G31 G18
```

The duplicate numeric value `+2` causes no problem because individual coordinate values are not directly mapped to individual glyph IDs.

---

# Recommended Glyph Alphabet

Use a configurable shared destination glyph count.

Recommended default:

```text
DestinationGlyphCount = 24
```

Do not hard-code the encoder specifically to 24.

Allow configuration such as:

```csharp
const int DestinationGlyphCount = 24;
const int AddressGlyphCount = 6;
```

Every Gate/DHD uses the same shared destination-glyph vocabulary.

The local Point-of-Origin glyph remains separate.

---

# Capacity

With 24 shared glyphs and six positions, with no repetition:

```text
24P6

= 24 × 23 × 22 × 21 × 20 × 19

= 96,909,120
```

unique ordered destination sequences.

This is far larger than the current structural address space of approximately:

```text
240,944
```

addresses.

Therefore six unique glyphs can be guaranteed without reducing the current address space.

---

# Encoding Requirement

Every valid logical address must map deterministically to exactly one ordered six-glyph permutation.

Required properties:

```text
Encode(address) always returns the same sequence.

No glyph occurs twice in that sequence.

Different valid logical addresses must not produce the same sequence.

Decode(Encode(address)) == address.
```

This should be a bijection between the logical-address index space and the subset of glyph permutations assigned to valid logical addresses.

---

# Step 1: Canonical Logical Address Index

Create a deterministic enumeration/index for every structurally valid:

```text
Q q Z r R $
```

combination.

Do NOT simply pack invalid hex combinations into the normal enumeration unless intentionally desired.

The existing validity rules remain:

```text
S = -(Q + R)
|S| <= MajorRadius

s = -(q + r)
|s| <= MinorRadius
```

Current defaults:

```text
MajorRadius = 3
MinorRadius = 3

Z = -5 ... +5
$ = 0 ... 15
```

Build deterministic ordered lists of valid major and minor cube-coordinate cells.

For example:

```csharp
List<HexCoord> majorCells = GenerateValidHexCells(MajorRadius);
List<HexCoord> minorCells = GenerateValidHexCells(MinorRadius);
```

The ordering must be stable.

Then calculate:

```text
majorIndex
minorIndex
zIndex
endpointIndex
```

and pack them into one canonical address index.

Conceptually:

```text
AddressIndex =
    (((majorIndex * MinorCount)
       + minorIndex)
       * ZCount
       + zIndex)
       * EndpointCount
       + endpointIndex;
```

With current values:

```text
MajorCount = 37
MinorCount = 37
ZCount = 11
EndpointCount = 16
```

there are:

```text
240,944
```

canonical logical address indices.

---

# Step 2: Map Address Index to Unique Glyph Permutation

Treat all ordered selections of six distinct glyphs from the destination-glyph alphabet as an indexed permutation space.

For 24 glyphs:

```text
P(24,6) = 96,909,120
```

Then:

```text
CanonicalAddressIndex
        ↓
PermutationIndex
        ↓
UnrankPermutation()
        ↓
Glyph[6]
```

At the simplest level:

```text
PermutationIndex = CanonicalAddressIndex
```

is sufficient.

However, that may make neighboring logical addresses produce visibly patterned glyph sequences.

Therefore preferably apply a deterministic reversible scrambling/permutation of the logical address index first:

```text
CanonicalAddressIndex
        ↓
ReversibleAddressScrambler
        ↓
PermutationIndex
        ↓
UnrankPermutation
```

The scrambler must be bijective over the assigned address-index domain.

Do NOT use a normal hash followed by modulo because collisions would destroy reversibility.

For Simulator v1, if implementing a clean reversible scrambler is unnecessary complexity, use:

```text
PermutationIndex = CanonicalAddressIndex
```

first.

Correctness is more important than visual randomness.

We can add scrambling afterward.

---

# Step 3: Unrank a Partial Permutation

Implement a function similar to:

```csharp
int[] UnrankPartialPermutation(
    long rank,
    int alphabetSize,
    int sequenceLength)
```

For:

```text
alphabetSize = 24
sequenceLength = 6
```

it returns six unique glyph IDs.

Conceptual algorithm:

```csharp
public static int[] UnrankPartialPermutation(
    long rank,
    int alphabetSize,
    int sequenceLength)
{
    if (sequenceLength > alphabetSize)
        throw new ArgumentException(
            "Sequence length cannot exceed alphabet size.");

    long capacity = PermutationCount(
        alphabetSize,
        sequenceLength);

    if (rank < 0 || rank >= capacity)
        throw new ArgumentOutOfRangeException(nameof(rank));

    var available = new List<int>(alphabetSize);

    for (int i = 0; i < alphabetSize; i++)
        available.Add(i);

    var result = new int[sequenceLength];

    for (int position = 0;
         position < sequenceLength;
         position++)
    {
        int remainingPositions =
            sequenceLength - position - 1;

        long blockSize = PermutationCount(
            available.Count - 1,
            remainingPositions);

        int selectionIndex =
            (int)(rank / blockSize);

        rank %= blockSize;

        result[position] =
            available[selectionIndex];

        available.RemoveAt(selectionIndex);
    }

    return result;
}
```

Helper:

```csharp
public static long PermutationCount(int n, int k)
{
    if (k < 0 || n < 0 || k > n)
        return 0;

    long result = 1;

    for (int i = 0; i < k; i++)
        result *= n - i;

    return result;
}
```

Because a selected glyph is removed from `available`, repetition is impossible by construction.

---

# Step 4: Ranking for Decode

Implement the inverse:

```csharp
long RankPartialPermutation(
    IReadOnlyList<int> glyphIds,
    int alphabetSize)
```

Conceptually:

```csharp
public static long RankPartialPermutation(
    IReadOnlyList<int> glyphIds,
    int alphabetSize)
{
    int sequenceLength = glyphIds.Count;

    if (sequenceLength > alphabetSize)
        throw new ArgumentException();

    if (glyphIds.Distinct().Count() != sequenceLength)
        throw new ArgumentException(
            "Destination address contains duplicate glyphs.");

    var available = new List<int>(alphabetSize);

    for (int i = 0; i < alphabetSize; i++)
        available.Add(i);

    long rank = 0;

    for (int position = 0;
         position < sequenceLength;
         position++)
    {
        int selectionIndex =
            available.IndexOf(glyphIds[position]);

        if (selectionIndex < 0)
            throw new ArgumentException(
                "Invalid glyph ID.");

        int remainingPositions =
            sequenceLength - position - 1;

        long blockSize = PermutationCount(
            available.Count - 1,
            remainingPositions);

        rank += selectionIndex * blockSize;

        available.RemoveAt(selectionIndex);
    }

    return rank;
}
```

This gives:

```text
Glyph sequence
    ↓
Permutation rank
    ↓
inverse scrambler, if enabled
    ↓
CanonicalAddressIndex
    ↓
Q q Z r R $
```

---

# Step 5: Decode Canonical Address Index

Implement the reverse of the canonical packing.

Conceptually:

```csharp
endpointIndex =
    addressIndex % EndpointCount;

addressIndex /= EndpointCount;

zIndex =
    addressIndex % ZCount;

addressIndex /= ZCount;

minorIndex =
    addressIndex % MinorCount;

addressIndex /= MinorCount;

majorIndex =
    addressIndex;
```

Then retrieve:

```text
majorCells[majorIndex]
minorCells[minorIndex]
ZValues[zIndex]
endpointIndex
```

to reconstruct:

```text
Q q Z r R $
```

---

# Point of Origin Is Separate

Do not include the local Point-of-Origin glyph in this six-glyph uniqueness encoder.

Destination:

```text
G1 G2 G3 G4 G5 G6
```

Local Point of Origin:

```text
O
```

Full dialing sequence:

```text
G1 G2 G3 G4 G5 G6 O
```

The Point of Origin belongs to the **originating Gate**, not the destination.

For now it can continue to use:

```text
OriginGlyphID
```

or:

```text
OriginGlyphSeed
```

generated separately.

---

# DHD Behavior

The DHD should contain:

```text
24 shared destination glyphs
+
1 local Point-of-Origin glyph
```

Therefore every DHD can dial the same destination-glyph sequences but has its own unique origin symbol.

The visual DHD layout does not need to encode:

```text
Q
q
Z
r
R
$
```

Those meanings exist in the underlying address encoding, not as separate button categories.

---

# Validation

Add generation-time validation.

For every generated Gate:

```csharp
var glyphs = EncodeAddress(gate.Address);

Debug.Assert(glyphs.Length == 6);

Debug.Assert(
    glyphs.Distinct().Count() == 6);
```

Also verify global uniqueness:

```text
No two logical addresses may have the same six-glyph sequence.
```

And verify round trip:

```text
Decode(Encode(address)) == address
```

---

# Recommended Automated Tests

## Test 1: No Duplicate Glyphs

For every structurally valid logical address:

```text
Encode(address)
```

must contain exactly six distinct glyph IDs.

---

## Test 2: Global Address Uniqueness

Encode all approximately 240,944 structural addresses.

Insert their six-glyph sequences into a `HashSet`.

Expected:

```text
HashSet.Count == LogicalAddressCount
```

Any collision is a failure.

---

## Test 3: Round Trip

For every structural address:

```text
decoded = Decode(Encode(address))
```

Expected:

```text
decoded == address
```

---

## Test 4: Determinism

Encoding the same logical address repeatedly must always produce the same sequence.

---

## Test 5: Capacity Guard

At startup verify:

```text
LogicalAddressCount
<=
PermutationCount(
    DestinationGlyphCount,
    AddressGlyphCount)
```

If false, generation should fail loudly.

Do not silently allow duplicate glyphs or collisions.

---

# Important Design Result

After this change there are three separate concepts:

```text
Logical Address
Q q Z r R $

Visible Destination Address
G1 G2 G3 G4 G5 G6

Full Dialing Sequence
G1 G2 G3 G4 G5 G6 O
```

The logical address continues to drive galaxy geometry.

The visible address is a reversible encoding of that logical address.

The Point of Origin identifies the Gate initiating the connection.

This solves repeated glyphs without changing the existing galaxy geometry or routing architecture.
