/**
 * A QR encoder, vendored rather than pulled in as a dependency.
 *
 * This is a byte-for-byte copy of `scripts/qr.ts` from the Tatak app
 * repository, which the app itself uses to build the QR codes on
 * `public/stickers.html` and `public/stickers-intercity.html`. Copying it
 * here - rather than adding a QR library to this site, or reaching across
 * two repositories at build time - keeps this page dependency-free and
 * keeps every module of every code on it something this repository's own
 * code produced and can be checked.
 *
 * Byte mode, error correction level M, versions 1 to 10 - more than enough
 * for the `https://app.tatak.tech/board?code=<BIN>` payload every sticker
 * on this page encodes. ISO/IEC 18004 is the authority for every table and
 * every constant below.
 *
 * Level M rather than L: a sticker gets scratched, gets sun, and is
 * photographed at an angle in bad light, and M recovers about 15% of the
 * modules against L's 7%, at the cost of one version step.
 */

export type QrLevel = 'M'

/**
 * Per version, at level M: error-correction codewords per block, and the
 * blocks themselves. ISO/IEC 18004 table 9. Two groups because from version 8
 * the blocks are not all the same size, and the shorter group always comes
 * first.
 */
type Blocks = {
  ecPerBlock: number
  group1: { blocks: number; dataCodewords: number }
  group2: { blocks: number; dataCodewords: number }
}

const BLOCKS_M: Readonly<Record<number, Blocks>> = {
  1: { ecPerBlock: 10, group1: { blocks: 1, dataCodewords: 16 }, group2: { blocks: 0, dataCodewords: 0 } },
  2: { ecPerBlock: 16, group1: { blocks: 1, dataCodewords: 28 }, group2: { blocks: 0, dataCodewords: 0 } },
  3: { ecPerBlock: 26, group1: { blocks: 1, dataCodewords: 44 }, group2: { blocks: 0, dataCodewords: 0 } },
  4: { ecPerBlock: 18, group1: { blocks: 2, dataCodewords: 32 }, group2: { blocks: 0, dataCodewords: 0 } },
  5: { ecPerBlock: 24, group1: { blocks: 2, dataCodewords: 43 }, group2: { blocks: 0, dataCodewords: 0 } },
  6: { ecPerBlock: 16, group1: { blocks: 4, dataCodewords: 27 }, group2: { blocks: 0, dataCodewords: 0 } },
  7: { ecPerBlock: 18, group1: { blocks: 4, dataCodewords: 31 }, group2: { blocks: 0, dataCodewords: 0 } },
  8: { ecPerBlock: 22, group1: { blocks: 2, dataCodewords: 38 }, group2: { blocks: 2, dataCodewords: 39 } },
  9: { ecPerBlock: 22, group1: { blocks: 3, dataCodewords: 36 }, group2: { blocks: 2, dataCodewords: 37 } },
  10: { ecPerBlock: 26, group1: { blocks: 4, dataCodewords: 43 }, group2: { blocks: 1, dataCodewords: 44 } },
}

/** Alignment-pattern centre coordinates per version. ISO/IEC 18004 annex E.
 *  The three corners a finder pattern already occupies are skipped when the
 *  patterns are placed. */
const ALIGNMENT: Readonly<Record<number, readonly number[]>> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
}

const MAX_VERSION = 10

// ---------------------------------------------------------------------------
// GF(256)
// ---------------------------------------------------------------------------

/** The field QR's Reed-Solomon runs over: GF(2^8) modulo x^8+x^4+x^3+x^2+1
 *  (0x11D), generator 2. Built once at module load. */
const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
}

function mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return EXP[LOG[a] + LOG[b]]
}

/** The generator polynomial for `degree` error-correction codewords:
 *  (x - a^0)(x - a^1)...(x - a^(degree-1)). */
function generatorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1])
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= mul(poly[j], EXP[i])
    }
    poly = next
  }
  return poly
}

/** The `ecCount` error-correction codewords for one block of data. */
function eccFor(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = generatorPoly(ecCount)
  const remainder = new Uint8Array(ecCount)
  for (const byte of data) {
    const factor = byte ^ remainder[0]
    remainder.copyWithin(0, 1)
    remainder[ecCount - 1] = 0
    if (factor !== 0) for (let i = 0; i < ecCount; i++) remainder[i] ^= mul(gen[i + 1], factor)
  }
  return remainder
}

// ---------------------------------------------------------------------------
// The bit stream
// ---------------------------------------------------------------------------

class Bits {
  private readonly bits: number[] = []
  push(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1)
  }
  get length(): number {
    return this.bits.length
  }
  /** Pads to a byte boundary and returns the codewords. */
  bytes(): Uint8Array {
    while (this.bits.length % 8 !== 0) this.bits.push(0)
    const out = new Uint8Array(this.bits.length / 8)
    for (let i = 0; i < out.length; i++) {
      let byte = 0
      for (let j = 0; j < 8; j++) byte = (byte << 1) | this.bits[i * 8 + j]
      out[i] = byte
    }
    return out
  }
}

function dataCodewords(version: number): number {
  const b = BLOCKS_M[version]
  return b.group1.blocks * b.group1.dataCodewords + b.group2.blocks * b.group2.dataCodewords
}

/** Byte mode's character-count indicator is 8 bits up to version 9 and 16
 *  bits from version 10. ISO/IEC 18004 table 3. */
function countBits(version: number): number {
  return version < 10 ? 8 : 16
}

function smallestVersion(byteLength: number): number {
  for (let v = 1; v <= MAX_VERSION; v++) {
    const capacity = dataCodewords(v) * 8
    if (4 + countBits(v) + byteLength * 8 <= capacity) return v
  }
  throw new Error(
    `qr: ${byteLength} bytes does not fit in a version ${MAX_VERSION} symbol at level M`,
  )
}

/** Mode 0100, the count, the bytes, a terminator, then the two alternating
 *  pad codewords 0xEC and 0x11 until the version is full. */
function codewordsFor(text: string, version: number): Uint8Array {
  const data = new TextEncoder().encode(text)
  const total = dataCodewords(version)
  const bits = new Bits()
  bits.push(0b0100, 4)
  bits.push(data.length, countBits(version))
  for (const byte of data) bits.push(byte, 8)
  const terminator = Math.min(4, total * 8 - bits.length)
  bits.push(0, terminator)
  const bytes = bits.bytes()
  const out = new Uint8Array(total)
  out.set(bytes)
  for (let i = bytes.length; i < total; i++) out[i] = i % 2 === bytes.length % 2 ? 0xec : 0x11
  return out
}

/** Data blocks and error-correction blocks, interleaved as ISO/IEC 18004
 *  section 8.6 requires: the first codeword of every block, then the second
 *  of every block, and so on, data first and error correction after. */
function interleave(codewords: Uint8Array, version: number): Uint8Array {
  const spec = BLOCKS_M[version]
  const groups = [spec.group1, spec.group2]
  const dataBlocks: Uint8Array[] = []
  const ecBlocks: Uint8Array[] = []
  let at = 0
  for (const group of groups) {
    for (let i = 0; i < group.blocks; i++) {
      const block = codewords.subarray(at, at + group.dataCodewords)
      at += group.dataCodewords
      dataBlocks.push(block)
      ecBlocks.push(eccFor(block, spec.ecPerBlock))
    }
  }
  const out: number[] = []
  const longest = Math.max(...dataBlocks.map((b) => b.length))
  for (let i = 0; i < longest; i++)
    for (const block of dataBlocks) if (i < block.length) out.push(block[i])
  for (let i = 0; i < spec.ecPerBlock; i++) for (const block of ecBlocks) out.push(block[i])
  return Uint8Array.from(out)
}

// ---------------------------------------------------------------------------
// The symbol
// ---------------------------------------------------------------------------

type Grid = {
  size: number
  /** True is a dark module. */
  module: boolean[][]
  /** True where a function pattern or a reserved area sits, so data placement
   *  and masking both skip it. */
  reserved: boolean[][]
}

function blank(version: number): Grid {
  const size = version * 4 + 17
  return {
    size,
    module: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
    reserved: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
  }
}

function set(g: Grid, row: number, col: number, dark: boolean, reserve = true) {
  g.module[row][col] = dark
  if (reserve) g.reserved[row][col] = true
}

function placeFinder(g: Grid, row: number, col: number) {
  // The 7x7 pattern plus its one-module separator, clipped at the edges.
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r
      const cc = col + c
      if (rr < 0 || rr >= g.size || cc < 0 || cc >= g.size) continue
      const onRing = (r === 0 || r === 6) && c >= 0 && c <= 6
      const onSide = (c === 0 || c === 6) && r >= 0 && r <= 6
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4
      set(g, rr, cc, onRing || onSide || inCore)
    }
  }
}

function placeAlignment(g: Grid, version: number) {
  const centres = ALIGNMENT[version]
  for (const r of centres) {
    for (const c of centres) {
      // The three finder corners already own these.
      if (g.reserved[r][c]) continue
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++)
          set(g, r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1)
    }
  }
}

function placeTiming(g: Grid) {
  for (let i = 8; i < g.size - 8; i++) {
    const dark = i % 2 === 0
    set(g, 6, i, dark)
    set(g, i, 6, dark)
  }
}

/** The 15 format bits: two for the level, three for the mask, BCH(15,5) over
 *  them, then XOR 0x5412 so an all-zero format is not all-zero on the
 *  symbol. Level M is `00`. ISO/IEC 18004 section 8.9. */
function formatBits(mask: number): number {
  const data = (0b00 << 3) | mask
  let rem = data << 10
  for (let i = 14; i >= 10; i--) if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10)
  return ((data << 10) | rem) ^ 0x5412
}

/** The 18 version bits, from version 7 up: six data bits and a BCH(18,6)
 *  remainder. ISO/IEC 18004 section 8.10. */
function versionBits(version: number): number {
  let rem = version << 12
  for (let i = 17; i >= 12; i--) if ((rem >>> i) & 1) rem ^= 0x1f25 << (i - 12)
  return (version << 12) | rem
}

function reserveFormatAreas(g: Grid) {
  for (let i = 0; i < 9; i++) {
    if (!g.reserved[8][i] || i === 6) g.reserved[8][i] = true
    if (!g.reserved[i][8] || i === 6) g.reserved[i][8] = true
  }
  for (let i = 0; i < 8; i++) {
    g.reserved[8][g.size - 1 - i] = true
    g.reserved[g.size - 1 - i][8] = true
  }
}

/**
 * Both copies of the format information, most significant bit first: bit 14
 * of the encoded string sits at (8,0) and the sequence runs from there. The
 * always-dark module is written last, on top of copy 2's eighth bit, which is
 * what ISO/IEC 18004 section 8.9 means by that module being fixed.
 */
function writeFormat(g: Grid, mask: number) {
  const bits = formatBits(mask)
  for (let i = 0; i < 15; i++) {
    const dark = ((bits >>> (14 - i)) & 1) === 1
    // Copy 1, around the top-left finder.
    if (i < 6) set(g, 8, i, dark)
    else if (i === 6) set(g, 8, 7, dark)
    else if (i === 7) set(g, 8, 8, dark)
    else if (i === 8) set(g, 7, 8, dark)
    else set(g, 14 - i, 8, dark)
    // Copy 2, split between the other two finders.
    if (i < 8) set(g, g.size - 1 - i, 8, dark)
    else set(g, 8, g.size - 15 + i, dark)
  }
  // The one module that is always dark, ISO/IEC 18004 section 8.9. Written
  // after copy 2, which would otherwise put a data-dependent bit here.
  set(g, g.size - 8, 8, true)
}

function writeVersion(g: Grid, version: number) {
  if (version < 7) return
  const bits = versionBits(version)
  for (let i = 0; i < 18; i++) {
    const dark = ((bits >>> i) & 1) === 1
    const row = Math.floor(i / 3)
    const col = i % 3
    set(g, row, g.size - 11 + col, dark)
    set(g, g.size - 11 + col, row, dark)
  }
}

/** The mask condition for each of the eight patterns. ISO/IEC 18004 table
 *  10; `row`/`col` are the module's own coordinates. */
const MASKS: ReadonlyArray<(row: number, col: number) => boolean> = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
]

/** Zigzag placement: two-module-wide columns, right to left, alternating
 *  upward and downward, skipping the vertical timing column at index 6. */
function placeData(g: Grid, data: Uint8Array) {
  let bit = 0
  let upward = true
  let right = g.size - 1
  while (right >= 1) {
    // Column 6 is the vertical timing pattern and is never one of a data
    // column pair. Stepping over it here rather than relying on the reserved
    // mask keeps the pairs aligned with the standard's own numbering.
    if (right === 6) right = 5
    for (let step = 0; step < g.size; step++) {
      const row = upward ? g.size - 1 - step : step
      for (const col of [right, right - 1]) {
        if (g.reserved[row][col]) continue
        const dark = bit < data.length * 8 && ((data[bit >>> 3] >>> (7 - (bit & 7))) & 1) === 1
        g.module[row][col] = dark
        bit++
      }
    }
    upward = !upward
    right -= 2
  }
}

function applyMask(g: Grid, mask: number): boolean[][] {
  const condition = MASKS[mask]
  return g.module.map((row, r) =>
    row.map((dark, c) => (g.reserved[r][c] ? dark : dark !== condition(r, c))),
  )
}

/** The four penalty rules of ISO/IEC 18004 section 8.8.2, summed. Lower is
 *  better; the encoder tries all eight masks and keeps the best. */
function penalty(m: boolean[][]): number {
  const size = m.length
  let score = 0

  // Rule 1: runs of five or more of one colour, in each row and column.
  for (const line of [...Array(size).keys()].flatMap((i) => [
    m[i],
    m.map((row) => row[i]),
  ])) {
    let run = 1
    for (let i = 1; i < size; i++) {
      if (line[i] === line[i - 1]) run++
      else {
        if (run >= 5) score += run - 2
        run = 1
      }
    }
    if (run >= 5) score += run - 2
  }

  // Rule 2: every 2x2 block of one colour.
  for (let r = 0; r < size - 1; r++)
    for (let c = 0; c < size - 1; c++)
      if (m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c] && m[r][c] === m[r + 1][c + 1])
        score += 3

  // Rule 3: the finder-like 1:1:3:1:1 sequence with four light modules on
  // either side, in either orientation.
  const A = [true, false, true, true, true, false, true, false, false, false, false]
  const B = [false, false, false, false, true, false, true, true, true, false, true]
  const matches = (line: boolean[], at: number, pattern: boolean[]) =>
    pattern.every((want, i) => line[at + i] === want)
  for (let i = 0; i < size; i++) {
    const row = m[i]
    const col = m.map((r) => r[i])
    for (const line of [row, col])
      for (let at = 0; at + 11 <= size; at++)
        if (matches(line, at, A) || matches(line, at, B)) score += 40
  }

  // Rule 4: how far the proportion of dark modules is from half.
  const dark = m.flat().filter(Boolean).length
  const percent = (dark * 100) / (size * size)
  score += Math.floor(Math.abs(percent - 50) / 5) * 10

  return score
}

/**
 * The module grid for `text`, as `matrix[row][col]`, true for a dark module.
 * No quiet zone: a caller draws that as margin, which is what the sticker's
 * white QR panel already is.
 */
export function qrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text).length
  const version = smallestVersion(bytes)
  const g = blank(version)

  placeFinder(g, 0, 0)
  placeFinder(g, 0, g.size - 7)
  placeFinder(g, g.size - 7, 0)
  placeAlignment(g, version)
  placeTiming(g)
  reserveFormatAreas(g)
  writeVersion(g, version)
  placeData(g, interleave(codewordsFor(text, version), version))

  let best: boolean[][] | null = null
  let bestScore = Infinity
  let bestMask = 0
  for (let mask = 0; mask < 8; mask++) {
    const candidate = applyMask(g, mask)
    const score = penalty(candidate)
    if (score < bestScore) {
      bestScore = score
      best = candidate
      bestMask = mask
    }
  }

  // The format bits carry the mask, so they are written after it is chosen
  // and onto the masked grid - they are never themselves masked.
  const chosen = best as boolean[][]
  const out: Grid = { size: g.size, module: chosen, reserved: g.reserved }
  writeFormat(out, bestMask)
  return out.module
}

/**
 * The matrix as the `<rect>` runs a sticker's inline SVG carries: one rect
 * per horizontal run of dark modules, which is what keeps a 33x33 symbol
 * around 4 KB rather than 1,089 elements.
 */
export function qrSvgRects(matrix: boolean[][]): string {
  const parts: string[] = []
  for (let r = 0; r < matrix.length; r++) {
    let c = 0
    while (c < matrix.length) {
      if (!matrix[r][c]) {
        c++
        continue
      }
      let run = 0
      while (c + run < matrix.length && matrix[r][c + run]) run++
      parts.push(`<rect x="${c}" y="${r}" width="${run}" height="1"/>`)
      c += run
    }
  }
  return parts.join('')
}
