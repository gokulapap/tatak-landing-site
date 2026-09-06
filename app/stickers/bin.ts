/**
 * Mints a BIN: a three-letter hub, a four-digit serial and a Damm check
 * character over the serial. Ported from `src/fleet/checkChar.ts` and
 * `src/fleet/bin.ts` in the Tatak app repository, trimmed to the one
 * direction this page needs.
 *
 * The app repository carries the full round trip - compute a check
 * character and verify one a rider typed - because it has to reject a
 * mistyped code before ever asking the fleet service about it. This page
 * only ever mints sample codes, so only `compute` made the trip over.
 *
 * Damm, not Luhn: over all 10,000 four-digit serials, Damm's table catches
 * every adjacent-digit transposition and Luhn misses 600 of them, which is
 * exactly the mistake a thumb makes on a moving bus. See `checkChar.ts` for
 * the full argument; the table below is copied unchanged from it.
 */

/** The standard totally anti-symmetric quasigroup of order 10, from Damm's
 *  2004 dissertation. Rows are the interim digit, columns the digit being
 *  consumed. */
const DAMM: readonly (readonly number[])[] = [
  [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
  [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
  [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
  [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
  [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
  [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
  [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
  [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
  [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
  [2, 5, 8, 1, 4, 3, 6, 7, 9, 0],
]

function dammCheckDigit(serial: string): string {
  let interim = 0
  for (let i = 0; i < serial.length; i++) interim = DAMM[interim][serial.charCodeAt(i) - 48]
  return String(interim)
}

/**
 * `HUB-SSSSC`: the hub, the four-digit serial and the Damm check character
 * over it, hyphenated the way the app displays a BIN to a rider. Throws on
 * a malformed hub or serial - every caller on this page passes a literal,
 * so a bad one is a bug here, not user input to handle gracefully.
 */
export function mintBin(hub: string, serial: string): string {
  if (!/^[A-Z]{3}$/.test(hub)) throw new Error(`mintBin: bad hub: ${hub}`)
  if (!/^[0-9]{4}$/.test(serial)) throw new Error(`mintBin: bad serial: ${serial}`)
  return `${hub}-${serial}${dammCheckDigit(serial)}`
}
