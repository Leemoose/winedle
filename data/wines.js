/* Winedle — answer bank
 *
 * SCALES (1-5, WSET L3 language)
 *   body     1 Light  2 Light-Med  3 Medium  4 Med-Full  5 Full
 *   tannin   1 Low    2 Low-Med    3 Medium  4 Med-High  5 High
 *   acidity  1 Low    2 Med-Low    3 Medium  4 Med-High  5 High
 *   climate  1 Cool   2 Moderate   3 Warm    4 Hot
 *
 * KINDS: every record is either a grape variety (kind "Grape") or a wine
 * (kind "Still", "Sparkling", "Off-dry", "Sweet" or "Fortified"). Sweetness
 * lives here rather than in a column of its own: a grape has no inherent
 * sweetness — Riesling runs from Trocken to Trockenbeerenauslese — so a
 * sweetness tile would carry an invented value for 87 of these records and
 * score green in 94% of comparisons. Kind only claims something where it is
 * a fact about the wine in the bottle. Both live in one bank
 * and are guessed against each other. `grape` names the principal variety —
 * for a grape that is itself, which is what lets a guess of Chardonnay score
 * an exact Grape tile against an answer of Chablis.
 *
 * TIERS: 1 classic (a casual drinker could name it), 2 known to enthusiasts,
 * 3 specialist. The daily schedule runs 1,2,1,2,1,2,3 across the week so most
 * days stay winnable for someone who is not studying for an exam; tier 3 gets
 * one slot a week and is always available in the archive and in practice.
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
    kind: "Grape", grape: "Cabernet Sauvignon",
    tier: 1,
    color: "Red", country: "France", region: "Bordeaux", continent: "Europe",
    body: 5, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Blackcurrant", "Green Bell Pepper", "Cedar", "Mint"],
    alsoKnownAs: [],
    note: "The Left Bank benchmark. High everything — tannin, acid, body — which is why it takes oak and time so well. Green bell pepper (pyrazine) shows when it ripens short of full."
  },
  {
    name: "Merlot",
    kind: "Grape", grape: "Merlot",
    tier: 1,
    color: "Red", country: "France", region: "Bordeaux", continent: "Europe",
    body: 4, tannin: 3, acidity: 3, climate: 2,
    oak: "Common",
    flavors: ["Plum", "Blackberry", "Chocolate", "Cedar"],
    alsoKnownAs: [],
    note: "Right Bank's answer to Cabernet: same address, softer everything. Medium tannin and acid are the whole reason Saint-Emilion drinks earlier than Pauillac."
  },
  {
    name: "Pinot Noir",
    kind: "Grape", grape: "Pinot Noir",
    tier: 1,
    color: "Red", country: "France", region: "Burgundy", continent: "Europe",
    body: 2, tannin: 2, acidity: 5, climate: 1,
    oak: "Common",
    flavors: ["Cherry", "Raspberry", "Strawberry", "Forest Floor"],
    alsoKnownAs: ["Spatburgunder", "Pinot Nero"],
    note: "Thin-skinned and cool-climate: light body, low tannin, high acid. The earthy/mushroom note is classic Burgundy; New World versions push fruit instead."
  },
  {
    name: "Syrah",
    kind: "Grape", grape: "Syrah",
    tier: 1,
    color: "Red", country: "France", region: "Northern Rhône", continent: "Europe",
    body: 5, tannin: 4, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Black Pepper", "Smoke", "Violet"],
    alsoKnownAs: ["Shiraz"],
    note: "Black pepper (rotundone) is the tell, and it fades as the climate warms — which is the whole Northern Rhone vs Barossa distinction. Same grape, different name, different wine."
  },
  {
    name: "Nebbiolo",
    kind: "Grape", grape: "Nebbiolo",
    tier: 1,
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 5, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Cherry", "Rose", "Tar", "Dried Herbs"],
    alsoKnownAs: ["Spanna", "Chiavennasca"],
    note: "The great trap: pale garnet in the glass, full-bodied and brutally tannic on the palate. Rose and tar together are diagnostic — nothing else does that pairing."
  },
  {
    name: "Sangiovese",
    kind: "Grape", grape: "Sangiovese",
    tier: 1,
    color: "Red", country: "Italy", region: "Tuscany", continent: "Europe",
    body: 4, tannin: 5, acidity: 5, climate: 3,
    oak: "Common",
    flavors: ["Sour Cherry", "Plum", "Tomato Leaf", "Leather"],
    alsoKnownAs: ["Prugnolo Gentile", "Morellino", "Nielluccio"],
    note: "High acid plus high tannin and a sour-cherry core — built for food, which is why Chianti works at the table and struggles alone."
  },
  {
    name: "Malbec",
    kind: "Grape", grape: "Malbec",
    tier: 1,
    color: "Red", country: "Argentina", region: "Mendoza", continent: "South America",
    body: 5, tannin: 4, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Violet", "Chocolate"],
    alsoKnownAs: ["Cot", "Auxerrois"],
    note: "French by birth (Cahors), Argentine by reputation. High-altitude Mendoza keeps enough acid to stop the ripe fruit going flabby."
  },
  {
    name: "Chardonnay",
    kind: "Grape", grape: "Chardonnay",
    tier: 1,
    color: "White", country: "France", region: "Burgundy", continent: "Europe",
    body: 4, tannin: 1, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Green Apple", "Citrus", "Butter", "Vanilla"],
    alsoKnownAs: [],
    note: "A neutral grape that tastes like wherever it was made and whatever was done to it. Butter is malolactic, vanilla is oak — neither is the grape."
  },
  {
    name: "Riesling",
    kind: "Grape", grape: "Riesling",
    tier: 1,
    color: "White", country: "Germany", region: "Mosel", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Lime", "Peach", "Petrol"],
    alsoKnownAs: [],
    note: "Screaming acidity is what lets it carry sugar without tasting sweet, and what lets it age for decades. Petrol (TDN) develops with bottle age."
  },
  {
    name: "Sauvignon Blanc",
    kind: "Grape", grape: "Sauvignon Blanc",
    tier: 1,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Gooseberry", "Grass", "Grapefruit", "Elderflower"],
    alsoKnownAs: ["Fume Blanc"],
    note: "Pyrazines again, but here they're the point rather than a flaw. Sancerre plays it flinty and restrained; Marlborough turns the volume to eleven."
  },
  {
    name: "Cabernet Franc",
    kind: "Grape", grape: "Cabernet Franc",
    tier: 1,
    color: "Red", country: "France", region: "Loire Valley", continent: "Europe",
    body: 3, tannin: 3, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Red Plum", "Green Bell Pepper", "Violet", "Graphite"],
    alsoKnownAs: ["Bouchet", "Breton"],
    note: "Cabernet Sauvignon's parent, and it shows - the same leafy pyrazine note, but lighter, higher-acid, and ready far sooner. Chinon and Bourgueil are the reference; on the Right Bank it plays support to Merlot."
  },
  {
    name: "Grenache",
    kind: "Grape", grape: "Grenache",
    tier: 1,
    color: "Red", country: "France", region: "Southern Rhône", continent: "Europe",
    body: 5, tannin: 2, acidity: 2, climate: 3,
    oak: "Sometimes",
    flavors: ["Strawberry", "Red Plum", "Garrigue", "White Pepper"],
    alsoKnownAs: ["Garnacha", "Cannonau"],
    note: "The great contradiction: pale in the glass, low in tannin and acid, yet full-bodied and high in alcohol. That combination is why it anchors Châteauneuf blends rather than standing alone."
  },
  {
    name: "Tempranillo",
    kind: "Grape", grape: "Tempranillo",
    tier: 1,
    color: "Red", country: "Spain", region: "Rioja", continent: "Europe",
    body: 4, tannin: 4, acidity: 3, climate: 2,
    oak: "Common",
    flavors: ["Red Plum", "Leather", "Tobacco", "Vanilla"],
    alsoKnownAs: ["Tinto Fino", "Tinta del País", "Tinta Roriz", "Aragonez"],
    note: "Medium acidity is the tell - it ripens early, which is what the name means. The coconut-vanilla lift in traditional Rioja is American oak, not the grape."
  },
  {
    name: "Zinfandel",
    kind: "Grape", grape: "Zinfandel",
    tier: 1,
    color: "Red", country: "United States", region: "California", continent: "North America",
    body: 5, tannin: 3, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Raisin", "Cinnamon", "Chocolate"],
    alsoKnownAs: ["Primitivo", "Tribidrag", "Crljenak Kaštelanski"],
    note: "Ripens unevenly, so one bunch carries green berries and raisins at once - hence the jammy fruit and high alcohol. Primitivo is the same grape; Croatia is where it actually came from."
  },
  {
    name: "Gamay",
    kind: "Grape", grape: "Gamay",
    tier: 1,
    color: "Red", country: "France", region: "Beaujolais", continent: "Europe",
    body: 2, tannin: 2, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Cherry", "Raspberry", "Banana", "Violet"],
    alsoKnownAs: [],
    note: "Banana and bubblegum are not the grape - they are carbonic maceration, the whole-bunch fermentation Beaujolais is built on. The cru wines skip it and taste far more serious."
  },
  {
    name: "Chenin Blanc",
    kind: "Grape", grape: "Chenin Blanc",
    tier: 1,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Green Apple", "Quince", "Honey", "Wet Wool"],
    alsoKnownAs: ["Steen", "Pineau de la Loire"],
    note: "The most versatile white there is - bone dry in Savennières, sweet in Coteaux du Layon, sparkling in Vouvray. Searing acidity is the constant that makes all of it work."
  },
  {
    name: "Viognier",
    kind: "Grape", grape: "Viognier",
    tier: 1,
    color: "White", country: "France", region: "Northern Rhône", continent: "Europe",
    body: 4, tannin: 1, acidity: 2, climate: 2,
    oak: "Sometimes",
    flavors: ["Apricot", "Peach", "Honeysuckle", "Ginger"],
    alsoKnownAs: [],
    note: "Low acid and full body make it the anti-Riesling. Condrieu is the benchmark, and it has to be picked late enough for the apricot perfume to arrive - too early and there is nothing there."
  },
  {
    name: "Pinot Gris",
    kind: "Grape", grape: "Pinot Gris",
    tier: 1,
    color: "White", country: "France", region: "Alsace", continent: "Europe",
    body: 4, tannin: 1, acidity: 3, climate: 2,
    oak: "Rare",
    flavors: ["Pear", "Peach", "Ginger", "Honey"],
    alsoKnownAs: ["Pinot Grigio", "Grauburgunder", "Ruländer"],
    note: "One grape, two wines. Alsace picks it ripe for a rich, oily, off-dry white; Italy picks it early for something light and neutral. The name on the label tells you which you are getting."
  },
  {
    name: "Pinot Blanc",
    kind: "Grape", grape: "Pinot Blanc",
    tier: 2,
    color: "White", country: "France", region: "Alsace", continent: "Europe",
    body: 3, tannin: 1, acidity: 3, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Pear", "Citrus", "Almond"],
    alsoKnownAs: ["Weissburgunder", "Pinot Bianco", "Klevner"],
    note: "A mutation of Pinot Gris, which is itself a mutation of Pinot Noir. Quiet and appley - it does the job Chardonnay does, without the ambition."
  },
  {
    name: "Muscat",
    kind: "Grape", grape: "Muscat",
    tier: 1,
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 2, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Orange Blossom", "Peach", "Grape", "Rose"],
    alsoKnownAs: ["Moscato", "Moscatel", "Muscat Blanc à Petits Grains"],
    note: "The only grape that genuinely smells of grapes. Ancient, and spread across half the wine world - Moscato d'Asti is the lightest and most charming expression of it."
  },
  {
    name: "Touriga Nacional",
    kind: "Grape", grape: "Touriga Nacional",
    tier: 2,
    color: "Red", country: "Portugal", region: "Douro", continent: "Europe",
    body: 5, tannin: 5, acidity: 4, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Violet", "Bergamot", "Slate"],
    alsoKnownAs: [],
    note: "Port's backbone, now increasingly bottled dry. Tiny berries mean a brutal skin-to-juice ratio, which is where the colour and tannin come from."
  },
  {
    name: "Montepulciano",
    kind: "Grape", grape: "Montepulciano",
    tier: 2,
    color: "Red", country: "Italy", region: "Abruzzo", continent: "Europe",
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Sometimes",
    flavors: ["Black Cherry", "Plum", "Dried Herbs", "Clay"],
    alsoKnownAs: [],
    note: "Not to be confused with Vino Nobile di Montepulciano, which is Sangiovese from a Tuscan town of the same name. This is the Abruzzo grape - softer, darker, and one of Italy's great everyday reds."
  },
  {
    name: "Gewürztraminer",
    kind: "Grape", grape: "Gewürztraminer",
    tier: 1,
    color: "White", country: "France", region: "Alsace", continent: "Europe",
    body: 4, tannin: 1, acidity: 2, climate: 2,
    oak: "Rare",
    flavors: ["Lychee", "Rose", "Ginger", "Honey"],
    alsoKnownAs: ["Traminer", "Gewürz"],
    note: "The easiest white to call blind: lychee and rose, deep gold colour, low acid, high alcohol. Pink-skinned, which is where that unusual depth of colour comes from."
  },
  {
    name: "Sémillon",
    kind: "Grape", grape: "Sémillon",
    tier: 1,
    color: "White", country: "France", region: "Bordeaux", continent: "Europe",
    body: 4, tannin: 1, acidity: 3, climate: 2,
    oak: "Sometimes",
    flavors: ["Lemon", "Wax", "Honey", "Toast"],
    alsoKnownAs: ["Hunter River Riesling"],
    note: "Thin skins make it prone to botrytis, which is the whole basis of Sauternes. Dry in the Hunter Valley it starts neutral and turns to toast and honey after a decade with no oak involved."
  },
  {
    name: "Albariño",
    kind: "Grape", grape: "Albariño",
    tier: 2,
    color: "White", country: "Spain", region: "Rías Baixas", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Citrus", "Peach", "Saline", "Almond"],
    alsoKnownAs: ["Alvarinho"],
    note: "Thick-skinned, which is how it survives the rain in Galicia. High acid and a saline finish - the reason it gets pushed at anyone eating shellfish."
  },
  {
    name: "Grüner Veltliner",
    kind: "Grape", grape: "Grüner Veltliner",
    tier: 2,
    color: "White", country: "Austria", region: "Wachau", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Citrus", "Green Apple", "White Pepper", "Nettle"],
    alsoKnownAs: ["Grüner", "Weissgipfler"],
    note: "White pepper is the marker, and almost nothing else does it in a white. Austria's signature grape, and it scales from cheap and spritzy to serious and age-worthy."
  },
  {
    name: "Torrontés",
    kind: "Grape", grape: "Torrontés",
    tier: 2,
    color: "White", country: "Argentina", region: "Salta", continent: "South America",
    body: 3, tannin: 1, acidity: 3, climate: 3,
    oak: "Rare",
    flavors: ["Rose", "Orange Blossom", "Peach", "Citrus"],
    alsoKnownAs: [],
    note: "Smells sweet and finishes dry, which catches people out. A Muscat cross, grown at extreme altitude in Salta where the cool nights hold onto the acidity."
  },
  {
    name: "Furmint",
    kind: "Grape", grape: "Furmint",
    tier: 2,
    color: "White", country: "Hungary", region: "Tokaj", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Green Apple", "Quince", "Honey", "Smoke"],
    alsoKnownAs: [],
    note: "The backbone of Tokaji Aszú, and increasingly bottled dry. Acidity high enough to carry 150 grams of residual sugar without the wine tasting cloying."
  },
  {
    name: "Assyrtiko",
    kind: "Grape", grape: "Assyrtiko",
    tier: 2,
    color: "White", country: "Greece", region: "Santorini", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 3,
    oak: "Sometimes",
    flavors: ["Lemon", "Saline", "Smoke", "Citrus"],
    alsoKnownAs: [],
    note: "Almost unique in keeping high acidity in a hot climate - most grapes lose it. Grown in basket-trained vines on volcanic ash to survive the Santorini wind."
  },
  {
    name: "Garganega",
    kind: "Grape", grape: "Garganega",
    tier: 2,
    color: "White", country: "Italy", region: "Veneto", continent: "Europe",
    body: 3, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Pear", "Almond", "Citrus"],
    alsoKnownAs: ["Grecanico"],
    note: "The grape behind Soave, and behind Soave's reputation problem - overcropped on the plains it is water, but from the volcanic Classico hills it is genuinely good."
  },
  {
    name: "Verdejo",
    kind: "Grape", grape: "Verdejo",
    tier: 2,
    color: "White", country: "Spain", region: "Rueda", continent: "Europe",
    body: 3, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Grapefruit", "Fennel", "Grass", "Almond"],
    alsoKnownAs: [],
    note: "Spain's answer to Sauvignon Blanc, and often blended with it in Rueda. The bitter-almond finish is the giveaway that it is not actually Sauvignon."
  },
  {
    name: "Cortese",
    kind: "Grape", grape: "Cortese",
    tier: 3,
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Lemon", "Almond", "Saline"],
    alsoKnownAs: [],
    note: "Gavi is the place, Cortese is the grape. Piedmont's serious white in a region that is otherwise all about red - lean, high-acid, and deliberately understated."
  },
  {
    name: "Carmenère",
    kind: "Grape", grape: "Carmenère",
    tier: 2,
    color: "Red", country: "Chile", region: "Colchagua", continent: "South America",
    body: 4, tannin: 4, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Green Bell Pepper", "Chocolate", "Clove"],
    alsoKnownAs: ["Grande Vidure"],
    note: "Lost to phylloxera in Bordeaux and mistaken for Merlot in Chile until DNA testing in 1994. Needs a long season - picked early it is all pyrazine and nothing else."
  },
  {
    name: "Pinotage",
    kind: "Grape", grape: "Pinotage",
    tier: 2,
    color: "Red", country: "South Africa", region: "Stellenbosch", continent: "Africa",
    body: 4, tannin: 4, acidity: 4, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Smoke", "Banana"],
    alsoKnownAs: [],
    note: "A 1925 South African crossing of Pinot Noir and Cinsault. Divisive - handled badly it goes to acetone and burnt rubber, handled well it is smoky and dense."
  },
  {
    name: "Mourvèdre",
    kind: "Grape", grape: "Mourvèdre",
    tier: 2,
    color: "Red", country: "France", region: "Bandol", continent: "Europe",
    body: 5, tannin: 5, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Blackberry", "Leather", "Garrigue", "Black Pepper"],
    alsoKnownAs: ["Monastrell", "Mataro"],
    note: "The last to ripen of the Rhône trio, and the most demanding - it needs real heat. Bandol is the benchmark; in GSM blends it supplies the tannin and the meaty, gamey edge."
  },
  {
    name: "Corvina",
    kind: "Grape", grape: "Corvina",
    tier: 2,
    color: "Red", country: "Italy", region: "Veneto", continent: "Europe",
    body: 3, tannin: 2, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Sour Cherry", "Red Plum", "Bay Leaf", "Almond"],
    alsoKnownAs: ["Corvina Veronese"],
    note: "Light and tart as Valpolicella, transformed into Amarone by drying the grapes for months first. Same grape, same hillside, and a completely different wine."
  },
  {
    name: "Nerello Mascalese",
    kind: "Grape", grape: "Nerello Mascalese",
    tier: 2,
    color: "Red", country: "Italy", region: "Etna", continent: "Europe",
    body: 3, tannin: 4, acidity: 5, climate: 3,
    oak: "Sometimes",
    flavors: ["Cherry", "Orange Peel", "Smoke", "Volcanic Ash"],
    alsoKnownAs: ["Nerello"],
    note: "Grown on the slopes of an active volcano, and constantly compared to Nebbiolo and Pinot Noir - pale, high-acid, high-tannin, and marked by the black volcanic soil."
  },
  {
    name: "Aglianico",
    kind: "Grape", grape: "Aglianico",
    tier: 2,
    color: "Red", country: "Italy", region: "Campania", continent: "Europe",
    body: 5, tannin: 5, acidity: 5, climate: 3,
    oak: "Common",
    flavors: ["Black Cherry", "Leather", "Iron", "Clove"],
    alsoKnownAs: [],
    note: "Southern Italy's answer to Nebbiolo, and just as unforgiving young. Ripens dangerously late - well into November - which is how it holds that much acid in a hot region."
  },
  {
    name: "Nero d’Avola",
    kind: "Grape", grape: "Nero d’Avola",
    tier: 2,
    color: "Red", country: "Italy", region: "Sicily", continent: "Europe",
    body: 4, tannin: 4, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Black Cherry", "Plum", "Liquorice", "Oregano"],
    alsoKnownAs: ["Calabrese"],
    note: "Sicily’s workhorse grape, once shipped north in bulk to beef up thin wines from cooler regions. Bottled on its own it is dark, warm and unfussy."
  },
  {
    name: "Barbera",
    kind: "Grape", grape: "Barbera",
    tier: 1,
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 3, tannin: 2, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Sour Cherry", "Red Plum", "Liquorice", "Dried Herbs"],
    alsoKnownAs: [],
    note: "Piedmont’s everyday red, planted on the sites Nebbiolo does not want. Deep colour but low tannin and searing acidity - the inverse of its famous neighbour."
  },
  {
    name: "Petit Verdot",
    kind: "Grape", grape: "Petit Verdot",
    tier: 2,
    color: "Red", country: "France", region: "Bordeaux", continent: "Europe",
    body: 5, tannin: 5, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Violet", "Graphite", "Allspice"],
    alsoKnownAs: [],
    note: "The Left Bank seasoning grape - a few percent for colour, tannin and violet perfume. Often refuses to ripen in Bordeaux, which is why it does better in Australia and Spain."
  },
  {
    name: "Vermentino",
    kind: "Grape", grape: "Vermentino",
    tier: 2,
    color: "White", country: "Italy", region: "Sardinia", continent: "Europe",
    body: 3, tannin: 1, acidity: 4, climate: 3,
    oak: "Rare",
    flavors: ["Citrus", "Green Apple", "Saline", "Almond"],
    alsoKnownAs: ["Rolle", "Pigato", "Favorita"],
    note: "The Mediterranean coastal white — Sardinia, Liguria, Corsica, and Provence, where it goes by Rolle. Keeps its bite in real heat, which is rarer than it sounds."
  },
  {
    name: "Marsanne",
    kind: "Grape", grape: "Marsanne",
    tier: 2,
    color: "White", country: "France", region: "Northern Rhône", continent: "Europe",
    body: 5, tannin: 1, acidity: 1, climate: 2,
    oak: "Sometimes",
    flavors: ["Quince", "Almond", "Honeysuckle", "Wax"],
    alsoKnownAs: [],
    note: "Heavy, waxy and low in acid — the reason it is almost always blended with Roussanne, which supplies the lift it lacks. White Hermitage is the serious version."
  },
  {
    name: "Roussanne",
    kind: "Grape", grape: "Roussanne",
    tier: 2,
    color: "White", country: "France", region: "Northern Rhône", continent: "Europe",
    body: 4, tannin: 1, acidity: 3, climate: 2,
    oak: "Sometimes",
    flavors: ["Pear", "Herbal Tea", "Apricot", "Quince"],
    alsoKnownAs: [],
    note: "Marsanne's partner and its opposite: more aromatic, higher acid, far harder to grow. Named for the russet colour the skins turn when ripe."
  },
  {
    name: "Melon de Bourgogne",
    kind: "Grape", grape: "Melon de Bourgogne",
    tier: 2,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Citrus", "Saline", "Bread"],
    alsoKnownAs: [],
    note: "Muscadet is the wine, Melon de Bourgogne the grape. Neutral to the point of blankness on its own — the bready weight comes from months resting on the lees, sur lie."
  },
  {
    name: "Godello",
    kind: "Grape", grape: "Godello",
    tier: 3,
    color: "White", country: "Spain", region: "Valdeorras", continent: "Europe",
    body: 3, tannin: 1, acidity: 4, climate: 2,
    oak: "Sometimes",
    flavors: ["Pear", "Citrus", "Fennel", "Almond"],
    alsoKnownAs: [],
    note: "Down to a few hundred vines by the 1970s and rescued deliberately. Fuller and more textural than Albariño, and it takes oak in a way Albariño does not."
  },
  {
    name: "Trebbiano",
    kind: "Grape", grape: "Trebbiano",
    tier: 2,
    color: "White", country: "Italy", region: "Abruzzo", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 3,
    oak: "Rare",
    flavors: ["Lemon", "Green Apple", "Almond", "Nettle"],
    alsoKnownAs: ["Ugni Blanc", "Trebbiano Toscano"],
    note: "One of the most planted white grapes on earth and one of the least remarked upon. As Ugni Blanc in France it is grown thin and acidic on purpose, then distilled into Cognac."
  },
  {
    name: "Xinomavro",
    kind: "Grape", grape: "Xinomavro",
    tier: 3,
    color: "Red", country: "Greece", region: "Naoussa", continent: "Europe",
    body: 4, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Sour Cherry", "Tomato", "Olive", "Forest Floor"],
    alsoKnownAs: [],
    note: "The name means sour-black, which is fair warning. Pale, tannic and savoury enough that it gets called the Greek Nebbiolo — sun-dried tomato is the note nothing else gives you."
  },
  {
    name: "Agiorgitiko",
    kind: "Grape", grape: "Agiorgitiko",
    tier: 3,
    color: "Red", country: "Greece", region: "Nemea", continent: "Europe",
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Red Plum", "Black Cherry", "Clove", "Dried Herbs"],
    alsoKnownAs: ["Saint George"],
    note: "Greece's most planted red and the approachable one — soft tannins, deep colour, no hard edges. Nemea sits high enough that the altitude does the work the latitude will not."
  },
  {
    name: "Blaufränkisch",
    kind: "Grape", grape: "Blaufränkisch",
    tier: 2,
    color: "Red", country: "Austria", region: "Burgenland", continent: "Europe",
    body: 4, tannin: 4, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Sour Cherry", "Blackberry", "White Pepper", "Cinnamon"],
    alsoKnownAs: ["Lemberger", "Kékfrankos"],
    note: "Austria's serious red, and the peppery counterpart to Grüner Veltliner. High acid and firm tannin make it read as far more northern than it is."
  },
  {
    name: "Saperavi",
    kind: "Grape", grape: "Saperavi",
    tier: 3,
    color: "Red", country: "Georgia", region: "Kakheti", continent: "Asia",
    body: 5, tannin: 4, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Blackberry", "Plum", "Liquorice", "Iron"],
    alsoKnownAs: [],
    note: "A teinturier — red flesh as well as red skin, which almost no wine grape has, and why it stains the glass. From the country that has been making wine in clay qvevri for eight thousand years."
  },
  {
    name: "Tannat",
    kind: "Grape", grape: "Tannat",
    tier: 2,
    color: "Red", country: "Uruguay", region: "Canelones", continent: "South America",
    body: 5, tannin: 5, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Liquorice", "Chocolate"],
    alsoKnownAs: ["Harriague"],
    note: "Named for its tannin, and it earns it — the most tannic wine grape in commercial use. French by origin, from Madiran, but Uruguay made it a national identity."
  },
  {
    name: "Cinsault",
    kind: "Grape", grape: "Cinsault",
    tier: 2,
    color: "Red", country: "France", region: "Languedoc", continent: "Europe",
    body: 2, tannin: 2, acidity: 3, climate: 3,
    oak: "Rare",
    flavors: ["Strawberry", "Red Plum", "Garrigue", "White Pepper"],
    alsoKnownAs: ["Cinsaut"],
    note: "Pale, soft and perfumed — the grape that makes Provence rosé work. Crossed with Pinot Noir in 1925 to produce Pinotage, which turned out nothing like it."
  },
  {
    name: "Carignan",
    kind: "Grape", grape: "Carignan",
    tier: 2,
    color: "Red", country: "France", region: "Languedoc", continent: "Europe",
    body: 4, tannin: 4, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Blackberry", "Red Plum", "Garrigue", "Leather"],
    alsoKnownAs: ["Mazuelo", "Cariñena", "Samsó"],
    note: "Ripped out across the Midi for decades as the symbol of the wine lake. The old vines that survived the purge now make some of the most interesting reds in the south."
  },
  {
    name: "Mencía",
    kind: "Grape", grape: "Mencía",
    tier: 3,
    color: "Red", country: "Spain", region: "Bierzo", continent: "Europe",
    body: 3, tannin: 3, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Red Plum", "Violet", "Bay Leaf", "Graphite"],
    alsoKnownAs: ["Jaen"],
    note: "Long assumed to be a relative of Cabernet Franc, and it does taste like one — floral, leafy, high-acid. The slate soils of Bierzo show up as a distinctly mineral streak."
  },
  {
    name: "Fiano",
    kind: "Grape", grape: "Fiano",
    tier: 2,
    color: "White", country: "Italy", region: "Campania", continent: "Europe",
    body: 4, tannin: 1, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Hazelnut", "Pear", "Honey", "Chamomile"],
    alsoKnownAs: [],
    note: "One of the few southern Italian whites built to age — waxy and nutty after a few years. Nearly extinct by the 1940s; Avellino is where it came back."
  },
  {
    name: "Verdicchio",
    kind: "Grape", grape: "Verdicchio",
    tier: 2,
    color: "White", country: "Italy", region: "Marche", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Lemon", "Green Apple", "Almond", "Fennel"],
    alsoKnownAs: ["Trebbiano di Soave"],
    note: "The bitter-almond finish is the signature, and it is a feature rather than a fault. Long sold in a novelty amphora bottle that did the wine no favours."
  },
  {
    name: "Silvaner",
    kind: "Grape", grape: "Silvaner",
    tier: 3,
    color: "White", country: "Germany", region: "Franken", continent: "Europe",
    body: 3, tannin: 1, acidity: 4, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Pear", "Nettle", "Wet Stone"],
    alsoKnownAs: ["Sylvaner", "Grüner Silvaner"],
    note: "Germany's quiet alternative to Riesling — earthier, lower in acid, and far more about the site than the fruit. Franken bottles it in the flat green Bocksbeutel."
  },
  {
    name: "Aligoté",
    kind: "Grape", grape: "Aligoté",
    tier: 3,
    color: "White", country: "France", region: "Burgundy", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Lemon", "Chalk", "Almond"],
    alsoKnownAs: [],
    note: "Burgundy's other white, planted where Chardonnay would not ripen well. Sharp enough that the traditional use was to soften it with crème de cassis — a Kir."
  },
  {
    name: "Picpoul",
    kind: "Grape", grape: "Picpoul",
    tier: 3,
    color: "White", country: "France", region: "Languedoc", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 3,
    oak: "Rare",
    flavors: ["Lemon", "Grapefruit", "Saline", "Green Apple"],
    alsoKnownAs: ["Piquepoul", "Picpoul de Pinet"],
    note: "The name means lip-stinger. Grown on the étangs near Sète and sold almost exclusively as an oyster wine, which is the correct use for it."
  },
  {
    name: "Macabeo",
    kind: "Grape", grape: "Macabeo",
    tier: 2,
    color: "White", country: "Spain", region: "Penedès", continent: "Europe",
    body: 3, tannin: 1, acidity: 3, climate: 2,
    oak: "Sometimes",
    flavors: ["Green Apple", "Citrus", "Almond", "Honey"],
    alsoKnownAs: ["Viura", "Macabeu"],
    note: "Two jobs under two names: Viura is the white grape of Rioja, Macabeo the backbone of Cava. Late-budding, which is what keeps it out of trouble with spring frost."
  },
  {
    name: "Pedro Ximénez",
    kind: "Grape", grape: "Pedro Ximénez",
    tier: 2,
    color: "White", country: "Spain", region: "Jerez", continent: "Europe",
    body: 5, tannin: 1, acidity: 2, climate: 4,
    oak: "Common",
    flavors: ["Raisin", "Fig", "Chocolate", "Coffee"],
    alsoKnownAs: ["PX"],
    note: "Laid out on mats to raisin in the Andalusian sun before pressing, which is how a dry white grape ends up as black, syrupy dessert wine. Andalusia is the hottest corner of the wine map represented here."
  },
  {
    name: "Dolcetto",
    kind: "Grape", grape: "Dolcetto",
    tier: 2,
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 3, tannin: 4, acidity: 2, climate: 2,
    oak: "Rare",
    flavors: ["Black Cherry", "Plum", "Liquorice", "Almond"],
    alsoKnownAs: [],
    note: "The name means little sweet one, though the wine is dry and firmly tannic. Low acid is what sets it apart from every other Piedmont red — the everyday bottle while the Barolo waits."
  },
  {
    name: "Lagrein",
    kind: "Grape", grape: "Lagrein",
    tier: 3,
    color: "Red", country: "Italy", region: "Alto Adige", continent: "Europe",
    body: 4, tannin: 4, acidity: 4, climate: 1,
    oak: "Sometimes",
    flavors: ["Blackberry", "Violet", "Chocolate", "Forest Floor"],
    alsoKnownAs: [],
    note: "Startlingly dark for a grape grown in the Alps. A relative of Syrah, and the tannins can turn bitter on the finish if the winemaking is careless."
  },
  {
    name: "Sagrantino",
    kind: "Grape", grape: "Sagrantino",
    tier: 3,
    color: "Red", country: "Italy", region: "Umbria", continent: "Europe",
    body: 5, tannin: 5, acidity: 4, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Forest Floor", "Cinnamon"],
    alsoKnownAs: [],
    note: "Among the most tannic grapes in existence — the polyphenol counts run higher than Tannat. Montefalco law requires nearly three years of ageing before release, and it needs every month."
  },
  {
    name: "Negroamaro",
    kind: "Grape", grape: "Negroamaro",
    tier: 3,
    color: "Red", country: "Italy", region: "Puglia", continent: "Europe",
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Sometimes",
    flavors: ["Black Cherry", "Raisin", "Oregano", "Clay"],
    alsoKnownAs: [],
    note: "Black and bitter, by both name and taste — the roasted, slightly bitter finish is the marker. Salento heat gives it the raisined edge."
  },
  {
    name: "Bobal",
    kind: "Grape", grape: "Bobal",
    tier: 3,
    color: "Red", country: "Spain", region: "Utiel-Requena", continent: "Europe",
    body: 4, tannin: 4, acidity: 5, climate: 3,
    oak: "Sometimes",
    flavors: ["Blackberry", "Red Plum", "Rosemary", "Graphite"],
    alsoKnownAs: [],
    note: "Spain's second most planted red and almost unknown outside it, long sent away for bulk blending. Old bush vines at altitude hold acidity that has no business surviving that heat."
  },
  {
    name: "Zweigelt",
    kind: "Grape", grape: "Zweigelt",
    tier: 2,
    color: "Red", country: "Austria", region: "Niederösterreich", continent: "Europe",
    body: 3, tannin: 2, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Sour Cherry", "Raspberry", "Clove", "Violet"],
    alsoKnownAs: [],
    note: "Austria's most planted red, a 1922 crossing of Blaufränkisch and St. Laurent. Juicy and low-tannin — the one they chill slightly and drink young."
  },
  {
    name: "Pinot Meunier",
    kind: "Grape", grape: "Pinot Meunier",
    tier: 2,
    color: "Red", country: "France", region: "Champagne", continent: "Europe",
    body: 2, tannin: 2, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Red Plum", "Raspberry", "Bread", "Mushroom"],
    alsoKnownAs: ["Meunier"],
    note: "The third Champagne grape and the least discussed, though it is planted more widely than Pinot Noir there. Buds late and ripens early, which is how it survives frost in the Marne Valley."
  },
  {
    name: "Petite Sirah",
    kind: "Grape", grape: "Petite Sirah",
    tier: 2,
    color: "Red", country: "United States", region: "California", continent: "North America",
    body: 5, tannin: 5, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Chocolate", "Black Pepper"],
    alsoKnownAs: ["Durif"],
    note: "Not Syrah and not petite — a Syrah-Peloursin crossing with tiny berries and enormous tannin. Long used to give backbone to Zinfandel before it was bottled on its own."
  },
  {
    name: "Grillo",
    kind: "Grape", grape: "Grillo",
    tier: 3,
    color: "White", country: "Italy", region: "Sicily", continent: "Europe",
    body: 3, tannin: 1, acidity: 4, climate: 3,
    oak: "Rare",
    flavors: ["Citrus", "Peach", "Saline", "Fennel"],
    alsoKnownAs: [],
    note: "Bred for Marsala and left there for a century. Picked early it now makes a taut, saline dry white — one of the clearest signs of how far Sicily has moved."
  },
  {
    name: "Falanghina",
    kind: "Grape", grape: "Falanghina",
    tier: 3,
    color: "White", country: "Italy", region: "Campania", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 3,
    oak: "Rare",
    flavors: ["Citrus", "Pear", "Nettle", "Almond"],
    alsoKnownAs: [],
    note: "Possibly the grape behind Falernian, the most prized wine of ancient Rome. Keeps a sharp citrus edge in a region where most whites turn flabby."
  },
  {
    name: "Arneis",
    kind: "Grape", grape: "Arneis",
    tier: 3,
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 3, tannin: 1, acidity: 3, climate: 2,
    oak: "Rare",
    flavors: ["Pear", "Almond", "Chamomile", "Peach"],
    alsoKnownAs: ["Roero Arneis"],
    note: "The name is Piedmontese for little rascal, earned by being difficult in the vineyard and quick to lose its acidity. Once planted among Nebbiolo to distract birds."
  },
  {
    name: "Encruzado",
    kind: "Grape", grape: "Encruzado",
    tier: 3,
    color: "White", country: "Portugal", region: "Dão", continent: "Europe",
    body: 4, tannin: 1, acidity: 4, climate: 2,
    oak: "Sometimes",
    flavors: ["Citrus", "Pear", "Wet Stone", "Wax"],
    alsoKnownAs: [],
    note: "Portugal's most serious white, and almost entirely confined to the Dão. Structured enough to take oak and years in bottle without ever getting heavy."
  },
  {
    name: "Petit Manseng",
    kind: "Grape", grape: "Petit Manseng",
    tier: 3,
    color: "White", country: "France", region: "Jurançon", continent: "Europe",
    body: 4, tannin: 1, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Apricot", "Citrus", "Honey", "Ginger"],
    alsoKnownAs: [],
    note: "Thick skins and tiny berries left to shrivel on the vine into December — passerillage, not botrytis. Acidity high enough that the sweet wines finish clean."
  },
  {
    name: "Rkatsiteli",
    kind: "Grape", grape: "Rkatsiteli",
    tier: 3,
    color: "White", country: "Georgia", region: "Kakheti", continent: "Asia",
    body: 3, tannin: 1, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Green Apple", "Quince", "Walnut", "Honey"],
    alsoKnownAs: [],
    note: "Georgia's workhorse white, and the classic amber wine when fermented on its skins in buried qvevri. That method gives it grip no other white has."
  },
  {
    name: "Chasselas",
    kind: "Grape", grape: "Chasselas",
    tier: 3,
    color: "White", country: "Switzerland", region: "Lavaux", continent: "Europe",
    body: 3, tannin: 1, acidity: 2, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Almond", "Bread", "Flint"],
    alsoKnownAs: ["Fendant", "Gutedel"],
    note: "So neutral it is treated as a transmitter rather than a flavour — the Swiss judge it entirely on site. Low acid means it has nowhere to hide."
  },
  {
    name: "Teroldego",
    kind: "Grape", grape: "Teroldego",
    tier: 3,
    color: "Red", country: "Italy", region: "Trentino", continent: "Europe",
    body: 4, tannin: 3, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Blackberry", "Plum", "Violet", "Iron"],
    alsoKnownAs: [],
    note: "A parent of Lagrein and a relative of Syrah, grown on the gravel flats of the Campo Rotaliano. Dark and high-acid, with far softer tannins than the colour suggests."
  },
  {
    name: "Frappato",
    kind: "Grape", grape: "Frappato",
    tier: 3,
    color: "Red", country: "Italy", region: "Sicily", continent: "Europe",
    body: 2, tannin: 2, acidity: 5, climate: 3,
    oak: "Rare",
    flavors: ["Strawberry", "Cherry", "Violet", "Oregano"],
    alsoKnownAs: [],
    note: "Pale, floral and best served cool — not what most people expect from Sicily. Blended with Nero d'Avola it makes Cerasuolo di Vittoria, the island's only DOCG."
  },
  {
    name: "Baga",
    kind: "Grape", grape: "Baga",
    tier: 3,
    color: "Red", country: "Portugal", region: "Bairrada", continent: "Europe",
    body: 4, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Sour Cherry", "Blackberry", "Clay", "Leather"],
    alsoKnownAs: [],
    note: "Thick-skinned, late-ripening and severe — high acid on top of high tannin, in a damp maritime climate that does it no favours. Rewards patience and little else."
  },
  {
    name: "Graciano",
    kind: "Grape", grape: "Graciano",
    tier: 3,
    color: "Red", country: "Spain", region: "Rioja", continent: "Europe",
    body: 4, tannin: 4, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Violet", "Dried Herbs", "Black Pepper"],
    alsoKnownAs: ["Morrastel"],
    note: "The seasoning in a Rioja blend — a few percent for acidity and floral lift. Yields so miserly that growers nearly abandoned it before the quality argument won."
  },
  {
    name: "Listán Negro",
    kind: "Grape", grape: "Listán Negro",
    tier: 3,
    color: "Red", country: "Spain", region: "Canary Islands", continent: "Europe",
    body: 3, tannin: 2, acidity: 4, climate: 3,
    oak: "Rare",
    flavors: ["Red Plum", "Smoke", "Bay Leaf", "Volcanic Ash"],
    alsoKnownAs: [],
    note: "Phylloxera never reached the Canaries, so these are ungrafted vines on volcanic ash, some of them centuries old. The smoky, ashy note comes with the ground."
  },
  {
    name: "Trousseau",
    kind: "Grape", grape: "Trousseau",
    tier: 3,
    color: "Red", country: "France", region: "Jura", continent: "Europe",
    body: 3, tannin: 3, acidity: 4, climate: 1,
    oak: "Sometimes",
    flavors: ["Red Plum", "Cherry", "Cinnamon", "Mushroom"],
    alsoKnownAs: ["Bastardo"],
    note: "The sturdier of the Jura's two pale reds, needing the warmest sites to ripen at all. Travels to Portugal as Bastardo, where it goes into Port."
  },
  {
    name: "Dornfelder",
    kind: "Grape", grape: "Dornfelder",
    tier: 3,
    color: "Red", country: "Germany", region: "Pfalz", continent: "Europe",
    body: 3, tannin: 3, acidity: 4, climate: 1,
    oak: "Sometimes",
    flavors: ["Sour Cherry", "Blackberry", "Violet", "Liquorice"],
    alsoKnownAs: [],
    note: "A 1955 crossing bred to solve a specific German problem: red wines too pale to convince anyone. Deeply coloured, moderate in everything else."
  },
  {
    name: "Bonarda",
    kind: "Grape", grape: "Bonarda",
    tier: 3,
    color: "Red", country: "Argentina", region: "Mendoza", continent: "South America",
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Sometimes",
    flavors: ["Plum", "Black Cherry", "Violet", "Star Anise"],
    alsoKnownAs: ["Douce Noire", "Charbono"],
    note: "Argentina's second most planted red, and not Italian Bonarda at all — it is Savoie's Douce Noire, misnamed on arrival. Soft, dark and permanently in Malbec's shadow."
  },
  {
    name: "Glera",
    kind: "Grape", grape: "Glera",
    tier: 3,
    color: "White", country: "Italy", region: "Veneto", continent: "Europe",
    body: 2, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Pear", "Green Apple", "Honeysuckle", "Citrus"],
    alsoKnownAs: ["Prosecco Tondo"],
    note: "Renamed in 2009 so that Prosecco could become a place rather than a grape, and stop anyone else using the word. Neutral, floral and not built to age."
  },
  {
    name: "Palomino",
    kind: "Grape", grape: "Palomino",
    tier: 3,
    color: "White", country: "Spain", region: "Jerez", continent: "Europe",
    body: 2, tannin: 1, acidity: 2, climate: 3,
    oak: "Sometimes",
    flavors: ["Almond", "Green Apple", "Saline", "Citrus"],
    alsoKnownAs: ["Listán Blanco"],
    note: "Almost flavourless as a dry white, which is the point — everything in Sherry comes from flor, oxidation and the solera, not the grape."
  },
  {
    name: "Champagne",
    kind: "Sparkling", grape: "Pinot Noir",
    tier: 1,
    color: "White", country: "France", region: "Champagne", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Green Apple", "Citrus", "Bread", "Almond"],
    alsoKnownAs: [],
    note: "A white wine mostly made from black grapes — Pinot Noir and Meunier outnumber Chardonnay. The bread and pastry notes are autolysis, years spent on dead yeast in bottle, not anything the fruit brought."
  },
  {
    name: "Prosecco",
    kind: "Sparkling", grape: "Glera",
    tier: 1,
    color: "White", country: "Italy", region: "Veneto", continent: "Europe",
    body: 2, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Pear", "Green Apple", "Honeysuckle", "Citrus"],
    alsoKnownAs: [],
    note: "Second fermentation in a pressurised tank rather than the bottle, which keeps the fruit primary and the price down. No bready autolysis — that is the whole difference from Champagne."
  },
  {
    name: "Cava",
    kind: "Sparkling", grape: "Macabeo",
    tier: 2,
    color: "White", country: "Spain", region: "Penedès", continent: "Europe",
    body: 2, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Citrus", "Bread", "Saline"],
    alsoKnownAs: [],
    note: "Made exactly like Champagne — bottle fermentation, lees ageing — from entirely different grapes in a far warmer place. The method is Champenoise; the wine is Spanish."
  },
  {
    name: "Chablis",
    kind: "Still", grape: "Chardonnay",
    tier: 1,
    color: "White", country: "France", region: "Burgundy", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Citrus", "Flint", "Chalk"],
    alsoKnownAs: [],
    note: "The proof that Chardonnay tastes of what is done to it: no oak, cold Kimmeridgian limestone, and it comes out lean and flinty rather than buttery."
  },
  {
    name: "Sancerre",
    kind: "Still", grape: "Sauvignon Blanc",
    tier: 1,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Gooseberry", "Grapefruit", "Flint", "Nettle"],
    alsoKnownAs: [],
    note: "Sauvignon Blanc played restrained and stony, the opposite of Marlborough's volume. Pouilly-Fumé sits across the river doing much the same thing."
  },
  {
    name: "Muscadet",
    kind: "Still", grape: "Melon de Bourgogne",
    tier: 2,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Lemon", "Saline", "Bread"],
    alsoKnownAs: ["Muscadet Sèvre et Maine"],
    note: "Sur lie — months resting on the spent yeast — is what gives a neutral grape any weight at all. The classic oyster wine, from the mouth of the Loire."
  },
  {
    name: "Vouvray",
    kind: "Still", grape: "Chenin Blanc",
    tier: 2,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Quince", "Green Apple", "Honey", "Chamomile"],
    alsoKnownAs: [],
    note: "Bone dry to lusciously sweet to sparkling, all under one name — check the label for sec, demi-sec or moelleux, because the wine changes completely."
  },
  {
    name: "Soave",
    kind: "Still", grape: "Garganega",
    tier: 2,
    color: "White", country: "Italy", region: "Veneto", continent: "Europe",
    body: 3, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Pear", "Almond", "Chamomile"],
    alsoKnownAs: [],
    note: "Ruined by bulk production from the plains and rebuilt by the volcanic Classico hills. Worth checking the word Classico on the label."
  },
  {
    name: "Gavi",
    kind: "Still", grape: "Cortese",
    tier: 2,
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Lemon", "Almond", "Wet Stone"],
    alsoKnownAs: ["Cortese di Gavi"],
    note: "Piedmont's white, in a region the world visits for Nebbiolo. Lean and understated by design — it is meant to disappear behind the food."
  },
  {
    name: "Rías Baixas",
    kind: "Still", grape: "Albariño",
    tier: 2,
    color: "White", country: "Spain", region: "Rías Baixas", continent: "Europe",
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Citrus", "Peach", "Saline", "Nettle"],
    alsoKnownAs: [],
    note: "Green, wet Atlantic Galicia — closer to Portugal than to the rest of Spain in climate and in taste. Vines trained overhead on granite posts to keep the rot off."
  },
  {
    name: "Marlborough Sauvignon Blanc",
    kind: "Still", grape: "Sauvignon Blanc",
    tier: 1,
    color: "White", country: "New Zealand", region: "Marlborough", continent: "Oceania",
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Gooseberry", "Grapefruit", "Grass", "Elderflower"],
    alsoKnownAs: ["Marlborough Sauvignon"],
    note: "The wine that made New Zealand's reputation in about a decade. Intense enough that people either love it or find it exhausting; there is not much middle ground."
  },
  {
    name: "Barolo",
    kind: "Still", grape: "Nebbiolo",
    tier: 1,
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 5, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Cherry", "Rose", "Tar", "Leather"],
    alsoKnownAs: [],
    note: "Nebbiolo at its most uncompromising, and legally aged three years before release because it needs them. Pale in the glass and ferocious on the palate."
  },
  {
    name: "Barbaresco",
    kind: "Still", grape: "Nebbiolo",
    tier: 2,
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 4, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Cherry", "Rose", "Tar", "Violet"],
    alsoKnownAs: [],
    note: "Barolo's neighbour, slightly warmer and lower, so it ripens a little earlier and needs a year less in cellar. Perennially described as the more elegant of the two."
  },
  {
    name: "Chianti Classico",
    kind: "Still", grape: "Sangiovese",
    tier: 1,
    color: "Red", country: "Italy", region: "Tuscany", continent: "Europe",
    body: 4, tannin: 4, acidity: 5, climate: 3,
    oak: "Common",
    flavors: ["Sour Cherry", "Tomato Leaf", "Leather", "Dried Herbs"],
    alsoKnownAs: ["Chianti"],
    note: "The black rooster on the neck marks the original hillside zone, as distinct from the far larger Chianti that grew up around it. Built for the table, not the glass alone."
  },
  {
    name: "Brunello di Montalcino",
    kind: "Still", grape: "Sangiovese",
    tier: 2,
    color: "Red", country: "Italy", region: "Tuscany", continent: "Europe",
    body: 5, tannin: 5, acidity: 5, climate: 3,
    oak: "Common",
    flavors: ["Sour Cherry", "Leather", "Forest Floor", "Liquorice"],
    alsoKnownAs: ["Brunello"],
    note: "Sangiovese alone, from a hotter and drier hill south of Chianti, held five years before release. Bigger and longer-lived than anything Chianti attempts."
  },
  {
    name: "Amarone della Valpolicella",
    kind: "Still", grape: "Corvina",
    tier: 2,
    color: "Red", country: "Italy", region: "Veneto", continent: "Europe",
    body: 5, tannin: 4, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Raisin", "Black Cherry", "Chocolate", "Fig"],
    alsoKnownAs: ["Amarone"],
    note: "The grapes are dried on mats for months before pressing, concentrating everything — appassimento. Dry, despite tasting of raisins, and often over 15% alcohol."
  },
  {
    name: "Valpolicella",
    kind: "Still", grape: "Corvina",
    tier: 2,
    color: "Red", country: "Italy", region: "Veneto", continent: "Europe",
    body: 3, tannin: 2, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Sour Cherry", "Red Plum", "Almond", "Bay Leaf"],
    alsoKnownAs: [],
    note: "The same grapes and the same hillside as Amarone, pressed fresh instead of dried. Light, tart and served cool — the everyday face of the Veneto."
  },
  {
    name: "Etna Rosso",
    kind: "Still", grape: "Nerello Mascalese",
    tier: 3,
    color: "Red", country: "Italy", region: "Etna", continent: "Europe",
    body: 3, tannin: 4, acidity: 5, climate: 3,
    oak: "Sometimes",
    flavors: ["Cherry", "Orange Peel", "Smoke", "Volcanic Ash"],
    alsoKnownAs: [],
    note: "Vineyards on an active volcano, some pre-phylloxera and ungrafted, at altitudes that keep the acidity intact in a Sicilian summer."
  },
  {
    name: "Côte-Rôtie",
    kind: "Still", grape: "Syrah",
    tier: 2,
    color: "Red", country: "France", region: "Northern Rhône", continent: "Europe",
    body: 5, tannin: 4, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Black Pepper", "Violet", "Smoke"],
    alsoKnownAs: [],
    note: "The roasted slope — terraces steep enough to be worked by hand. A little Viognier is legally allowed in the ferment, which lifts the perfume."
  },
  {
    name: "Châteauneuf-du-Pape",
    kind: "Still", grape: "Grenache",
    tier: 1,
    color: "Red", country: "France", region: "Southern Rhône", continent: "Europe",
    body: 5, tannin: 3, acidity: 3, climate: 3,
    oak: "Sometimes",
    flavors: ["Strawberry", "Garrigue", "Leather", "White Pepper"],
    alsoKnownAs: [],
    note: "Thirteen permitted grapes, though Grenache does most of the work. The famous galets — big round stones — hold the day's heat and push the ripeness further."
  },
  {
    name: "Bandol",
    kind: "Still", grape: "Mourvèdre",
    tier: 3,
    color: "Red", country: "France", region: "Bandol", continent: "Europe",
    body: 5, tannin: 5, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Blackberry", "Leather", "Garrigue", "Forest Floor"],
    alsoKnownAs: [],
    note: "One of the few places Mourvèdre ripens fully, on terraces above the Mediterranean. Legally aged eighteen months in wood, and it needs a decade more."
  },
  {
    name: "Beaujolais",
    kind: "Still", grape: "Gamay",
    tier: 1,
    color: "Red", country: "France", region: "Beaujolais", continent: "Europe",
    body: 2, tannin: 2, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Cherry", "Raspberry", "Banana", "Red Plum"],
    alsoKnownAs: [],
    note: "Nouveau did the region's reputation lasting damage. The ten named crus — Morgon, Fleurie, Moulin-à-Vent — are serious wines that happen to share the name."
  },
  {
    name: "Chinon",
    kind: "Still", grape: "Cabernet Franc",
    tier: 3,
    color: "Red", country: "France", region: "Loire Valley", continent: "Europe",
    body: 3, tannin: 3, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Red Plum", "Green Bell Pepper", "Violet", "Bay Leaf"],
    alsoKnownAs: [],
    note: "Cabernet Franc at the northern edge of where it ripens, which is exactly why the leafy pyrazine note shows. Chilled slightly, it is one of the great food reds."
  },
  {
    name: "Pauillac",
    kind: "Still", grape: "Cabernet Sauvignon",
    tier: 2,
    color: "Red", country: "France", region: "Bordeaux", continent: "Europe",
    body: 5, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Blackcurrant", "Cedar", "Graphite", "Mint"],
    alsoKnownAs: [],
    note: "Three of the five First Growths sit in this one commune. Deep gravel drains hard and forces the roots down, which is the whole Left Bank argument."
  },
  {
    name: "Saint-Émilion",
    kind: "Still", grape: "Merlot",
    tier: 2,
    color: "Red", country: "France", region: "Bordeaux", continent: "Europe",
    body: 4, tannin: 3, acidity: 3, climate: 2,
    oak: "Common",
    flavors: ["Plum", "Black Cherry", "Chocolate", "Cedar"],
    alsoKnownAs: [],
    note: "Right Bank clay and limestone suit Merlot where Left Bank gravel suits Cabernet. Softer, rounder, and drinkable years earlier than its neighbours across the river."
  },
  {
    name: "Rioja",
    kind: "Still", grape: "Tempranillo",
    tier: 1,
    color: "Red", country: "Spain", region: "Rioja", continent: "Europe",
    body: 4, tannin: 4, acidity: 3, climate: 2,
    oak: "Common",
    flavors: ["Red Plum", "Leather", "Vanilla", "Tobacco"],
    alsoKnownAs: [],
    note: "Read the back label: Crianza, Reserva and Gran Reserva are legal minimum ageing periods, not quality claims. The coconut-vanilla lift is American oak."
  },
  {
    name: "Ribera del Duero",
    kind: "Still", grape: "Tempranillo",
    tier: 2,
    color: "Red", country: "Spain", region: "Ribera del Duero", continent: "Europe",
    body: 5, tannin: 4, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Vanilla", "Liquorice"],
    alsoKnownAs: [],
    note: "The same grape as Rioja at 800 metres on the Castilian plateau, where nights are cold and days are fierce. Darker, denser and more tannic for it."
  },
  {
    name: "Priorat",
    kind: "Still", grape: "Grenache",
    tier: 2,
    color: "Red", country: "Spain", region: "Priorat", continent: "Europe",
    body: 5, tannin: 4, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Slate", "Liquorice", "Garrigue"],
    alsoKnownAs: [],
    note: "Old bush vines on llicorella, a slate so poor the yields are almost nothing. Abandoned for most of the twentieth century, revived in the 1990s and now Spain's most expensive."
  },
  {
    name: "Napa Cabernet",
    kind: "Still", grape: "Cabernet Sauvignon",
    tier: 1,
    color: "Red", country: "United States", region: "Napa Valley", continent: "North America",
    body: 5, tannin: 4, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackcurrant", "Chocolate", "Vanilla", "Mint"],
    alsoKnownAs: ["Napa Valley Cabernet"],
    note: "The same grape as Pauillac in far more sun: riper fruit, softer tannin, lower acid and more new oak. The 1976 Paris tasting is what put it on the map."
  },
  {
    name: "Barossa Shiraz",
    kind: "Still", grape: "Syrah",
    tier: 1,
    color: "Red", country: "Australia", region: "Barossa Valley", continent: "Oceania",
    body: 5, tannin: 4, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Chocolate", "Liquorice", "Vanilla"],
    alsoKnownAs: ["Barossa Valley Shiraz"],
    note: "Syrah in real heat: the black pepper of the Northern Rhône disappears entirely and sweet dark fruit takes over. Some of the oldest vines on earth, never touched by phylloxera."
  },
  {
    name: "Central Otago Pinot Noir",
    kind: "Still", grape: "Pinot Noir",
    tier: 2,
    color: "Red", country: "New Zealand", region: "Central Otago", continent: "Oceania",
    body: 3, tannin: 2, acidity: 5, climate: 1,
    oak: "Common",
    flavors: ["Cherry", "Raspberry", "Violet", "Forest Floor"],
    alsoKnownAs: ["Central Otago"],
    note: "The world's southernmost wine region, and the only one in New Zealand with a continental rather than maritime climate. Riper and darker than Burgundy without losing the acid."
  },
  {
    name: "Port",
    kind: "Fortified", grape: "Touriga Nacional",
    tier: 1,
    color: "Red", country: "Portugal", region: "Douro", continent: "Europe",
    body: 5, tannin: 4, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Fig", "Chocolate", "Cinnamon"],
    alsoKnownAs: ["Porto"],
    note: "Grape spirit is added partway through fermentation, killing the yeast and leaving the unfermented sugar behind. That is what makes it sweet and strong at once."
  },
  {
    name: "Fino Sherry",
    kind: "Fortified", grape: "Palomino",
    tier: 2,
    color: "White", country: "Spain", region: "Jerez", continent: "Europe",
    body: 2, tannin: 1, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Almond", "Saline", "Bread", "Green Apple"],
    alsoKnownAs: ["Fino"],
    note: "Aged under flor, a living yeast blanket that seals the wine from air and eats what little sugar remains. Bone dry, and it goes stale within days of opening."
  },
  {
    name: "Sauternes",
    kind: "Sweet", grape: "Sémillon",
    tier: 1,
    color: "White", country: "France", region: "Bordeaux", continent: "Europe",
    body: 5, tannin: 1, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Apricot", "Honey", "Toast", "Orange Peel"],
    alsoKnownAs: [],
    note: "Botrytis — noble rot — shrivels the grapes on the vine and concentrates everything. It depends on autumn mists off the Ciron, and in bad years they simply do not make it."
  },
  {
    name: "Tokaji Aszú",
    kind: "Sweet", grape: "Furmint",
    tier: 2,
    color: "White", country: "Hungary", region: "Tokaj", continent: "Europe",
    body: 4, tannin: 1, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Apricot", "Honey", "Orange Peel", "Quince"],
    alsoKnownAs: ["Tokay"],
    note: "Botrytised berries picked individually and kneaded into a paste, measured in puttonyos. Acidity high enough that 150 grams of sugar still finishes clean."
  },
  {
    name: "Muscat de Beaumes-de-Venise",
    kind: "Fortified", grape: "Muscat",
    tier: 3,
    color: "White", country: "France", region: "Southern Rhône", continent: "Europe",
    body: 4, tannin: 1, acidity: 3, climate: 3,
    oak: "Rare",
    flavors: ["Orange Blossom", "Peach", "Grape", "Honey"],
    alsoKnownAs: ["Beaumes-de-Venise"],
    note: "A vin doux naturel: fortified early so most of the grape sugar survives. Tastes more purely of fresh grapes than almost any other wine."
  },
  {
    name: "Mosel Kabinett",
    kind: "Off-dry", grape: "Riesling",
    tier: 2,
    color: "White", country: "Germany", region: "Mosel", continent: "Europe",
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Lime", "Peach", "Wet Stone"],
    alsoKnownAs: ["Kabinett"],
    note: "Barely 8% alcohol, a few grams of sugar left in, and acidity high enough that it reads as refreshing rather than sweet. The Prädikat describes ripeness at harvest, not sweetness in the glass."
  },
  {
    name: "Eiswein",
    kind: "Sweet", grape: "Riesling",
    tier: 3,
    color: "White", country: "Germany", region: "Mosel", continent: "Europe",
    body: 4, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Apricot", "Lime", "Honey", "Peach"],
    alsoKnownAs: ["Ice Wine"],
    note: "Grapes left on the vine until they freeze solid, then pressed still frozen so the water stays behind as ice. No botrytis involved — the fruit stays piercingly clean."
  },
  {
    name: "Coteaux du Layon",
    kind: "Sweet", grape: "Chenin Blanc",
    tier: 3,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    body: 4, tannin: 1, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Quince", "Honey", "Apricot", "Chamomile"],
    alsoKnownAs: ["Layon"],
    note: "Botrytised Chenin from a tributary of the Loire. Chenin's acidity is what stops it cloying — the same grape that makes bone-dry Savennières a few miles north."
  },
  {
    name: "Moscato d’Asti",
    kind: "Sweet", grape: "Muscat",
    tier: 1,
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    body: 2, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Grape", "Orange Blossom", "Peach", "Honeysuckle"],
    alsoKnownAs: [],
    note: "Fermentation stopped early by chilling, leaving sugar, a gentle fizz and about 5% alcohol. Piedmont's other wine, made a few valleys from Barolo and about as different as possible."
  },
  {
    name: "Recioto della Valpolicella",
    kind: "Sweet", grape: "Corvina",
    tier: 3,
    color: "Red", country: "Italy", region: "Veneto", continent: "Europe",
    body: 5, tannin: 3, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Raisin", "Cherry", "Chocolate", "Cinnamon"],
    alsoKnownAs: ["Recioto"],
    note: "The original wine of the Veneto — dried grapes, fermentation stopped while sugar remains. Amarone was the accident that happened when a batch was left to ferment dry."
  },
  {
    name: "Vin Santo",
    kind: "Sweet", grape: "Trebbiano",
    tier: 3,
    color: "White", country: "Italy", region: "Tuscany", continent: "Europe",
    body: 4, tannin: 1, acidity: 4, climate: 3,
    oak: "Common",
    flavors: ["Raisin", "Walnut", "Honey", "Toast"],
    alsoKnownAs: [],
    note: "Grapes hung in the rafters to dry for months, then years in small sealed barrels through Tuscan summers. Oxidative and nutty by design — and the correct thing to dunk cantucci into."
  },
  {
    name: "Pedro Ximénez Sherry",
    kind: "Fortified", grape: "Pedro Ximénez",
    tier: 2,
    color: "White", country: "Spain", region: "Jerez", continent: "Europe",
    body: 5, tannin: 1, acidity: 2, climate: 4,
    oak: "Common",
    flavors: ["Raisin", "Fig", "Coffee", "Toast"],
    alsoKnownAs: [],
    note: "Black, viscous and around 400 grams of sugar per litre — poured over ice cream as often as drunk. A white grape sun-dried into something that looks like treacle."
  },
  {
    name: "Oloroso Sherry",
    kind: "Fortified", grape: "Palomino",
    tier: 2,
    color: "White", country: "Spain", region: "Jerez", continent: "Europe",
    body: 4, tannin: 1, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Walnut", "Toast", "Orange Peel", "Leather"],
    alsoKnownAs: ["Oloroso"],
    note: "Fortified high enough to kill the flor, so it ages in contact with air rather than under yeast. Dry despite tasting of walnuts and dried fruit — the opposite end of Jerez from Fino."
  },
  {
    name: "Rutherglen Muscat",
    kind: "Fortified", grape: "Muscat",
    tier: 3,
    color: "White", country: "Australia", region: "Rutherglen", continent: "Oceania",
    body: 5, tannin: 1, acidity: 3, climate: 4,
    oak: "Common",
    flavors: ["Raisin", "Toast", "Orange Peel", "Cinnamon"],
    alsoKnownAs: ["Rutherglen Muscatel"],
    note: "Aged in barrel through baking Victorian summers in a solera-like system, some of it for decades. Thick, brown and sweet enough to coat the glass."
  },
  {
    name: "Banyuls",
    kind: "Fortified", grape: "Grenache",
    tier: 3,
    color: "Red", country: "France", region: "Roussillon", continent: "Europe",
    body: 5, tannin: 3, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Fig", "Chocolate", "Cherry", "Cinnamon"],
    alsoKnownAs: [],
    note: "France's answer to Port, from terraces above the Mediterranean at the Spanish border. Grenache fortified mid-ferment, then often left in glass demijohns in the sun to oxidise deliberately."
  },
  {
    name: "Alsace Vendanges Tardives",
    kind: "Sweet", grape: "Gewürztraminer",
    tier: 3,
    color: "White", country: "France", region: "Alsace", continent: "Europe",
    body: 5, tannin: 1, acidity: 2, climate: 2,
    oak: "Rare",
    flavors: ["Lychee", "Honey", "Rose", "Ginger"],
    alsoKnownAs: ["Vendanges Tardives"],
    note: "Late harvest, legally defined minimum ripeness, and no chaptalisation allowed. Gewürztraminer's low acidity makes it the richest and most divisive of the four Alsace noble grapes in this style."
  }
];
