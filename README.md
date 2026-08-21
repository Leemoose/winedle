# Winedle

A daily wine guessing game. Guess the grape variety in six tries; every guess is
scored against the answer across nine attributes.

## Play it

Open `index.html` — one self-contained file, no server, no install.

## Editing

`index.html` is **generated**. Never edit it; edit the sources and rebuild:

    page.html        page shell (the template)
    data/wines.js    the answer bank (the part worth your attention)
    data/aromas.js   aroma family map
    src/game.js      comparison engine, schedule, rendering
    src/style.css    the label aesthetic
    ./build.sh       runs the tests, then inlines all of it into index.html

Run `./build.sh` after any change. Inlining is not just for portability: four
separate files meant four separate caches, and a browser holding a stale
`data/wines.js` next to a fresh `src/game.js` runs new code against an old
answer bank. That happened during development. One file cannot desynchronise
with itself.

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
| `/?w=<token>` | a challenge link for one specific wine |

Challenge tokens are URL-safe base64 of the grape name — enough that the answer
is not sitting in plain text in the address bar, not a security measure. The
"Challenge a friend" button on the end panel copies one for the wine just
played, from any mode.

Practice draws from the whole bank regardless of tier, leans toward wines you
have previously failed (`PRACTICE_MISS_BIAS`), and touches neither the streak
nor the shared result. Wines you miss are recorded in `winedle:misses` and
cleared when you next get them right.

## Tiers

Each wine carries `tier`: 1 classic, 2 known to enthusiasts, 3 specialist,
split 22/35/28. The daily week runs `1,2,1,2,1,2,3` — six approachable days
and one deep cut — so an 85-grape bank does not hand a first-time player
Rkatsiteli. Each tier walks its own deck and does not repeat until spent.

## Stored state

| Key | What it holds |
|---|---|
| `winedle:state` | today's board |
| `winedle:state:<n>` | an archived day |
| `winedle:state:practice` | the current practice wine |
| `winedle:state:w:<token>` | a challenge |
| `winedle:stats` | played, wins, streak, guess distribution |
| `winedle:misses` | wines failed, used to weight practice |
| `winedle:met` | wines solved and how often — the study record |

`winedle:met` is what the Cellar book's "Wines met" list reads. A streak says
how consistent you have been; the tally says which of the bank you can
actually name.

## Archive

`?d=<n>` replays any past puzzle, clamped to the schedule's range. Archived
plays are stored under their own key (`winedle:state:<n>`), so a replay never
overwrites the live puzzle and never moves the streak. The index in the page
lists the last 30 days.

## Installing

`manifest.webmanifest` plus `sw.js` make it installable and playable offline.
The service worker is deliberately **network-first**: cache-first would be
faster but would pin players to a stale answer bank, and a wrong wine is a
worse failure than a slow load. Bump `CACHE` in `sw.js` when you want old
caches cleared.

Icons are captured from `assets/icon-card.html` the same way as the social
card, then

    magick <capture> -crop 840x840+0+0 +repage -resize 512x512 assets/icon-512.png

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
