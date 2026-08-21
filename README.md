# Winedle

A daily wine guessing game. Guess the grape variety in six tries; every guess is
scored against the answer across nine attributes.

## Play it

Open `dist/winedle.html` — one self-contained file, no server, no install.

## Editing

Sources are split for editing, then inlined into the single file:

    data/wines.js    the answer bank (the part worth your attention)
    src/game.js      comparison engine, daily seed, rendering
    src/style.css    the label aesthetic
    index.html       page shell
    ./build.sh       inlines all of the above into dist/winedle.html

Run `./build.sh` after any change. Opening `index.html` directly also works for
quick iteration, but note some browsers block local file loads — if the board
comes up blank, serve the folder instead:

    python3 -m http.server 8000

## Tests

    node test.js

Checks data integrity (schema, ordinal ranges, aroma shape, name and alias
collisions, and the no-two-wines-alike invariant), the comparison engine
including arrow direction and symmetry, schedule determinism, and name
resolution. `build.sh` runs it first and refuses to build on failure.

## Adding wines

Append to `WINES` in `data/wines.js`. Every record needs all fields; the build
does not validate, so keep the shape identical to its neighbours. The scale
legend lives in the file header.

Two rules the data follows, stated in the game's How to Play so players do not
argue with the tiles:

- **country/region is the grape's classic home**, not everywhere it is planted.
- **colorInt is judged within the wine's own colour category**, WSET-style.

The bank currently holds 85 grapes — roughly twelve weeks before the deck runs
out. Each cycle reshuffles, so the order is never the same twice.

Run `node test.js` after adding — it will catch a record that is
indistinguishable from an existing one, or an alias that collides.

## Aroma families

`data/aromas.js` groups the 66-term vocabulary into 15 families. The aroma tile
scores an exact term first, then gives partial credit for the right family with
the wrong note — lime against citrus, sour cherry against cherry. Before this,
the tile was blank in 62% of all guess/answer pairs; it is now blank in 34%.

Every term used in `data/wines.js` must appear in exactly one family, and every
mapped term must be used. `node test.js` enforces both.

## Attributes scored

Colour · Country · Region · Depth · Body · Tannin · Acidity · Climate · Aromas

Oxblood = exact. Amber = one step off, same continent, or shared aromas.
Blank = no match. Arrows on structural tiles point toward the answer.

## Modes

| URL | What it is |
|---|---|
| `/` | the daily puzzle |
| `/?d=<n>` | an archived day |
| `/?mode=practice` | unlimited random wines |

Practice draws from the whole bank regardless of tier, leans toward wines you
have previously failed (`PRACTICE_MISS_BIAS`), and touches neither the streak
nor the shared result. Wines you miss are recorded in `winedle:misses` and
cleared when you next get them right.

## Tiers

Each wine carries `tier`: 1 classic, 2 known to enthusiasts, 3 specialist,
split 22/35/28. The daily week runs `1,2,1,2,1,2,3` — six approachable days
and one deep cut — so an 85-grape bank does not hand a first-time player
Rkatsiteli. Each tier walks its own deck and does not repeat until spent.

## Archive

`?d=<n>` replays any past puzzle, clamped to the schedule's range. Archived
plays are stored under their own key (`winedle:state:<n>`), so a replay never
overwrites the live puzzle and never moves the streak. The index in the page
lists the last 30 days.

## Social card

`assets/og.png` is a capture of `assets/og-card.html`, which is viewport-sized
so it can be re-shot at any resolution. To regenerate: serve the folder, open
the card at a viewport with a 1.905 aspect ratio, screenshot, then

    magick <capture> -resize '1200x630!' -strip assets/og.png

## Hints

A guess scoring `HINT_AT` (6) or more exact tiles is close enough that the grid
stops being informative. Those rows reveal one aroma the answer carries and the
guess did not — never the same one twice, falling back to oak treatment once the
aromas are spent. Hints are derived at render time from the guess list, so they
survive a reload and cost nothing to store.

Raising `HINT_AT` in `src/game.js` makes them rarer; at 7 the hint can only
fire on 20% of answers, at 6 on 69%.
