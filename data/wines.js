/* Winedle — answer bank
 *
 * SCALES (1-5, WSET L3 language)
 *   colorInt 1 Pale   2 Light      3 Medium  4 Deep      5 Opaque
 *   body     1 Light  2 Light-Med  3 Medium  4 Med-Full  5 Full
 *   tannin   1 Low    2 Low-Med    3 Medium  4 Med-High  5 High
 *   acidity  1 Low    2 Med-Low    3 Medium  4 Med-High  5 High
 *   climate  1 Cool   2 Moderate   3 Warm    4 Hot
 *
 * RULE ON colorInt: assessed WITHIN the wine's own colour category, the way
 * WSET does it. Riesling at 1 is pale for a white; Nebbiolo at 1 is pale for
 * a red. It is not a red-vs-white axis - the colour tile already does that.
 *
 * RULE ON country/region: this is the grape's CLASSIC HOME — the reference
 * expression a WSET exam would use — not everywhere it's planted. Chardonnay
 * is grown on six continents; its answer is Burgundy, France. Stated up front
 * in the game's How-to-Play so nobody argues with the tile.
 *
 * RULE ON structure: where a grape genuinely shifts by place (Syrah in
 * Hermitage vs Barossa), values describe the classic-home expression. The
 * post-game reveal card names the variation explicitly.
 */

const WINES = [
  {
    name: "Cabernet Sauvignon",
    color: "Red", country: "France", region: "Bordeaux", continent: "Europe",
    colorInt: 5,
    body: 5, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Blackcurrant", "Green Bell Pepper", "Cedar", "Mint"],
    alsoKnownAs: [],
    note: "The Left Bank benchmark. High everything — tannin, acid, body — which is why it takes oak and time so well. Green bell pepper (pyrazine) shows when it ripens short of full."
  },
  {
    name: "Merlot",
    color: "Red", country: "France", region: "Bordeaux", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 3, acidity: 3, climate: 2,
    oak: "Common",
    flavors: ["Plum", "Blackberry", "Chocolate", "Cedar"],
    alsoKnownAs: [],
    note: "Right Bank's answer to Cabernet: same address, softer everything. Medium tannin and acid are the whole reason Saint-Emilion drinks earlier than Pauillac."
  },
  {
    name: "Pinot Noir",
    color: "Red", country: "France", region: "Burgundy", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 2, acidity: 5, climate: 1,
    oak: "Common",
    flavors: ["Cherry", "Raspberry", "Strawberry", "Earthy"],
    alsoKnownAs: ["Spatburgunder", "Pinot Nero"],
    note: "Thin-skinned and cool-climate: light body, low tannin, high acid. The earthy/mushroom note is classic Burgundy; New World versions push fruit instead."
  },
  {
    name: "Syrah",
    color: "Red", country: "France", region: "Northern Rhone", continent: "Europe",
    colorInt: 5,
    body: 5, tannin: 4, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Black Pepper", "Smoke", "Violet"],
    alsoKnownAs: ["Shiraz"],
    note: "Black pepper (rotundone) is the tell, and it fades as the climate warms — which is the whole Northern Rhone vs Barossa distinction. Same grape, different name, different wine."
  },
  {
    name: "Nebbiolo",
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    colorInt: 1,
    body: 5, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Cherry", "Rose", "Tar", "Herbal"],
    alsoKnownAs: ["Spanna", "Chiavennasca"],
    note: "The great trap: pale garnet in the glass, full-bodied and brutally tannic on the palate. Rose and tar together are diagnostic — nothing else does that pairing."
  },
  {
    name: "Sangiovese",
    color: "Red", country: "Italy", region: "Tuscany", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 5, acidity: 5, climate: 3,
    oak: "Common",
    flavors: ["Sour Cherry", "Plum", "Herbal", "Earthy"],
    alsoKnownAs: ["Brunello", "Prugnolo Gentile", "Morellino", "Nielluccio"],
    note: "High acid plus high tannin and a sour-cherry core — built for food, which is why Chianti works at the table and struggles alone."
  },
  {
    name: "Malbec",
    color: "Red", country: "Argentina", region: "Mendoza", continent: "South America",
    colorInt: 5,
    body: 5, tannin: 4, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Violet", "Chocolate"],
    alsoKnownAs: ["Cot", "Auxerrois"],
    note: "French by birth (Cahors), Argentine by reputation. High-altitude Mendoza keeps enough acid to stop the ripe fruit going flabby."
  },
  {
    name: "Chardonnay",
    color: "White", country: "France", region: "Burgundy", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 1, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Green Apple", "Citrus", "Butter", "Vanilla"],
    alsoKnownAs: [],
    note: "A neutral grape that tastes like wherever it was made and whatever was done to it. Butter is malolactic, vanilla is oak — neither is the grape."
  },
  {
    name: "Riesling",
    color: "White", country: "Germany", region: "Mosel", continent: "Europe",
    colorInt: 1,
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Lime", "Peach", "Petrol"],
    alsoKnownAs: [],
    note: "Screaming acidity is what lets it carry sugar without tasting sweet, and what lets it age for decades. Petrol (TDN) develops with bottle age."
  },
  {
    name: "Sauvignon Blanc",
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Gooseberry", "Grass", "Grapefruit", "Elderflower"],
    alsoKnownAs: ["Fume Blanc"],
    note: "Pyrazines again, but here they're the point rather than a flaw. Sancerre plays it flinty and restrained; Marlborough turns the volume to eleven."
  }
];
