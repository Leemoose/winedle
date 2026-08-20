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

## Adding wines

Append to `WINES` in `data/wines.js`. Every record needs all fields; the build
does not validate, so keep the shape identical to its neighbours. The scale
legend lives in the file header.

Two rules the data follows, stated in the game's How to Play so players do not
argue with the tiles:

- **country/region is the grape's classic home**, not everywhere it is planted.
- **colorInt is judged within the wine's own colour category**, WSET-style.

The bank currently holds 55 grapes — roughly two months before the deck runs
out. Each cycle reshuffles, so the order is never the same twice.

Before adding, check that the new record is not indistinguishable from an
existing one. No two wines may match on all nine scored attributes:

    node -e 'const W=new Function(require("fs").readFileSync("data/wines.js","utf8")+";return WINES;")();
    const K=["color","country","region","colorInt","body","tannin","acidity","climate"];
    const m={};W.forEach(w=>(m[K.map(k=>w[k]).join("|")+"|"+[...w.flavors].sort()] ||= []).push(w.name));
    console.log(Object.values(m).filter(v=>v.length>1))'

## Attributes scored

Colour · Country · Region · Depth · Body · Tannin · Acidity · Climate · Aromas

Oxblood = exact. Amber = one step off, same continent, or shared aromas.
Blank = no match. Arrows on structural tiles point toward the answer.
