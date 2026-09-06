# Vehicle vectors

Seven Karnataka vehicles drawn as flat SVG, in a three-quarter view from the
front and door or platform side. Four buses under `buses/` and three metro
trains under `metro/`. They are the source of what the fleet page serves from
`public/fleet/`, and are meant to be reused anywhere that needs a recognisable
vehicle rather than a photograph.

| File | Vehicle | Livery |
| --- | --- | --- |
| `bmtc-bengaluru-sarige.svg` | BMTC Bengaluru Sarige, the ordinary city bus | blue, white rear panel, yellow rule |
| `bmtc-vajra-volvo.svg` | BMTC Vajra, the air conditioned Volvo | deep red, twin white swooshes |
| `ksrtc-karnataka-sarige.svg` | KSRTC Karnataka Sarige, the unreserved coach | red over a silver midband |
| `nwkrtc-airavat-gold-class.svg` | NWKRTC Airavat Gold Class, reserved | yellow, blue wave, green curtains |

And under `metro/`:

| File | Line | Board |
| --- | --- | --- |
| `namma-metro-green.svg` | Green | `SILK INSTITUTE` |
| `namma-metro-purple.svg` | Purple | `CHALLAGHATTA` |
| `namma-metro-yellow.svg` | Yellow | `BOMMASANDRA` |

The trains are light grey and silver with the line colour as a band below the
windows, which sweeps up at the cab into a thick border round the windscreen
and mask and over the roof edge. Green `#1fa04c`, purple `#7c3399`, yellow
`#f3c317`.

## They share one camera, and that is the point

All four are projected through the same pinhole camera onto the same
`viewBox="0 0 626 629"`. Station point on the road, eye height 1.6 m, level
line of sight, focal length 900 viewBox units. A world point `(x, y, z)` lands
at `(900x/z, -900(y - 1.6)/z)`, which puts the horizon at `y = 336.6`.

Every vehicle is parked in the same bay: front door corner 1.35 m right of the
camera axis and 5.2 m ahead, yawed 32 degrees. So the two vanishing points are
identical across all four files, the length direction at `x = 718.7` and the
width direction at `x = -1284`.

Two consequences worth knowing before you use them:

- **Drop any of them beside another and they line up.** The horizon and the
  near front corner sit in the same place in every file. Four bays, one tripod.
- **The sizes are real, not styled.** Bengaluru Sarige 10.6 m long and 3.1 m
  tall, Karnataka Sarige 11 m and 3.16 m, Vajra 12 m and 3.2 m on a low floor,
  Airavat 12 m and 3.62 m on a high floor with luggage bays and a third axle.
  Nothing is scaled per file, so the coach genuinely stands taller than the
  city bus. Do not rescale one on its own or that breaks.

  The one deliberate exception is the metro car length. A real car is about
  21.6 m, which projects past the shared viewBox and would be cropped, so the
  cars are drawn at 15 m. Every other metro dimension is true: 2.88 m wide,
  3.9 m to the roof crest, floor at 1.1 m, 1.4 m doors on a 4.6 m pitch. The
  shortening costs one door bay and nothing else.

The horizon sits below every window sill, so you see the underside of the roof
curve and none of the roof deck, the way you would standing next to one. The
off-side wheels and the Vajra's roof pod are absent because at this eye height
they are genuinely hidden, not because they were skipped.

## Destination boards

The boards carry real `<text>`, the only text in these files. Everything else,
wordmarks and emblems included, is shapes. Each glyph carries its own affine
transform taken from the local derivative of the projection at its position on
the board, so a string shears with the face and converges toward the same
vanishing point as the vehicle rather than sitting flat on top of it.

The font stack is `ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace`.
Monospace is deliberate: the per-glyph advance is fixed in the geometry, so the
lettering lands correctly whatever face resolves, and it reads like the dot
matrix and stencil boards the real vehicles use. No webfont will load, since
these are usually consumed through `<img>`.

Current boards are `500-CA BANASHANKARI`, `V-500CA ITPL`, `MANGALURU` and
`HUBBALLI`. The two city routes are real and both run ITPL to Banashankari, so
they show opposite directions of one working.

## Regenerating

`generate.mjs` emits all four. It is the source; the SVGs are output.

```
node assets/vectors/generate.mjs public/fleet
```

It emits all seven into one directory. The library keeps them split by mode, so
copy them across after regenerating:

```
cp public/fleet/bmtc-*.svg public/fleet/ksrtc-*.svg public/fleet/nwkrtc-*.svg assets/vectors/buses/
cp public/fleet/namma-metro-*.svg assets/vectors/metro/
```

An optional third argument writes review PNGs, which needs `sharp`:

```
node assets/vectors/generate.mjs public/fleet /tmp/vehicle-png
```

Change a livery, a board or a dimension in the generator rather than editing an
SVG by hand. Editing the output means the next regeneration silently discards
your change, and hand-editing a projected point almost certainly breaks the
shared camera the set depends on.

## Where they came from

The buses are drawn from Wikimedia Commons reference photographs, used to get
liveries, proportions and the camera angle right. The trains carry estimates
where the stock is not documented: roof height, windscreen rake, sheeting line
and bogie centres are typical metro values rather than measured Namma Metro
ones, and the mark on the mask is a plain four-lobed rosette in magenta, a
stand-in for the BMRCL emblem rather than a copy of it. No photograph is
embedded and none ships, so nothing here carries an attribution requirement.
