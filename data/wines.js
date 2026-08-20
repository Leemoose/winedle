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
  },
  {
    name: "Cabernet Franc",
    color: "Red", country: "France", region: "Loire Valley", continent: "Europe",
    colorInt: 3,
    body: 3, tannin: 3, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Red Plum", "Green Bell Pepper", "Violet", "Graphite"],
    alsoKnownAs: ["Bouchet", "Breton"],
    note: "Cabernet Sauvignon's parent, and it shows - the same leafy pyrazine note, but lighter, higher-acid, and ready far sooner. Chinon and Bourgueil are the reference; on the Right Bank it plays support to Merlot."
  },
  {
    name: "Grenache",
    color: "Red", country: "France", region: "Southern Rhone", continent: "Europe",
    colorInt: 2,
    body: 5, tannin: 2, acidity: 2, climate: 3,
    oak: "Sometimes",
    flavors: ["Strawberry", "Red Plum", "Herbal", "Spice"],
    alsoKnownAs: ["Garnacha", "Cannonau"],
    note: "The great contradiction: pale in the glass, low in tannin and acid, yet full-bodied and high in alcohol. That combination is why it anchors Chateauneuf blends rather than standing alone."
  },
  {
    name: "Tempranillo",
    color: "Red", country: "Spain", region: "Rioja", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 4, acidity: 3, climate: 2,
    oak: "Common",
    flavors: ["Red Plum", "Leather", "Tobacco", "Vanilla"],
    alsoKnownAs: ["Tinto Fino", "Tinta del Pais", "Tinta Roriz", "Aragonez"],
    note: "Medium acidity is the tell - it ripens early, which is what the name means. The coconut-vanilla lift in traditional Rioja is American oak, not the grape."
  },
  {
    name: "Zinfandel",
    color: "Red", country: "United States", region: "California", continent: "North America",
    colorInt: 4,
    body: 5, tannin: 3, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Raisin", "Spice", "Chocolate"],
    alsoKnownAs: ["Primitivo", "Tribidrag", "Crljenak Kastelanski"],
    note: "Ripens unevenly, so one bunch carries green berries and raisins at once - hence the jammy fruit and high alcohol. Primitivo is the same grape; Croatia is where it actually came from."
  },
  {
    name: "Gamay",
    color: "Red", country: "France", region: "Beaujolais", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 2, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Cherry", "Raspberry", "Banana", "Violet"],
    alsoKnownAs: [],
    note: "Banana and bubblegum are not the grape - they are carbonic maceration, the whole-bunch fermentation Beaujolais is built on. The cru wines skip it and taste far more serious."
  },
  {
    name: "Chenin Blanc",
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Green Apple", "Quince", "Honey", "Wet Wool"],
    alsoKnownAs: ["Steen", "Pineau de la Loire"],
    note: "The most versatile white there is - bone dry in Savennieres, sweet in Coteaux du Layon, sparkling in Vouvray. Searing acidity is the constant that makes all of it work."
  },
  {
    name: "Viognier",
    color: "White", country: "France", region: "Northern Rhone", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 1, acidity: 2, climate: 2,
    oak: "Sometimes",
    flavors: ["Apricot", "Peach", "Honeysuckle", "Ginger"],
    alsoKnownAs: [],
    note: "Low acid and full body make it the anti-Riesling. Condrieu is the benchmark, and it has to be picked late enough for the apricot perfume to arrive - too early and there is nothing there."
  },
  {
    name: "Pinot Gris",
    color: "White", country: "France", region: "Alsace", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 1, acidity: 3, climate: 2,
    oak: "Rare",
    flavors: ["Pear", "Peach", "Ginger", "Honey"],
    alsoKnownAs: ["Pinot Grigio", "Grauburgunder", "Rulander"],
    note: "One grape, two wines. Alsace picks it ripe for a rich, oily, off-dry white; Italy picks it early for something light and neutral. The name on the label tells you which you are getting."
  },
  {
    name: "Pinot Blanc",
    color: "White", country: "France", region: "Alsace", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 3, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Pear", "Citrus", "Almond"],
    alsoKnownAs: ["Weissburgunder", "Pinot Bianco", "Klevner"],
    note: "A mutation of Pinot Gris, which is itself a mutation of Pinot Noir. Quiet and appley - it does the job Chardonnay does, without the ambition."
  },
  {
    name: "Muscat",
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Orange Blossom", "Peach", "Grape", "Rose"],
    alsoKnownAs: ["Moscato", "Moscatel", "Muscat Blanc a Petits Grains"],
    note: "The only grape that genuinely smells of grapes. Ancient, and spread across half the wine world - Moscato d'Asti is the lightest and most charming expression of it."
  },
  {
    name: "Touriga Nacional",
    color: "Red", country: "Portugal", region: "Douro", continent: "Europe",
    colorInt: 5,
    body: 5, tannin: 5, acidity: 4, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Violet", "Bergamot", "Slate"],
    alsoKnownAs: [],
    note: "Port's backbone, now increasingly bottled dry. Tiny berries mean a brutal skin-to-juice ratio, which is where the colour and tannin come from."
  },
  {
    name: "Montepulciano",
    color: "Red", country: "Italy", region: "Abruzzo", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Sometimes",
    flavors: ["Black Cherry", "Plum", "Herbal", "Earthy"],
    alsoKnownAs: [],
    note: "Not to be confused with Vino Nobile di Montepulciano, which is Sangiovese from a Tuscan town of the same name. This is the Abruzzo grape - softer, darker, and one of Italy's great everyday reds."
  }
];
