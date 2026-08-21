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
    tier: 1,
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
    tier: 1,
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
    tier: 1,
    color: "Red", country: "France", region: "Burgundy", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 2, acidity: 5, climate: 1,
    oak: "Common",
    flavors: ["Cherry", "Raspberry", "Strawberry", "Forest Floor"],
    alsoKnownAs: ["Spatburgunder", "Pinot Nero"],
    note: "Thin-skinned and cool-climate: light body, low tannin, high acid. The earthy/mushroom note is classic Burgundy; New World versions push fruit instead."
  },
  {
    name: "Syrah",
    tier: 1,
    color: "Red", country: "France", region: "Northern Rhône", continent: "Europe",
    colorInt: 5,
    body: 5, tannin: 4, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Black Pepper", "Smoke", "Violet"],
    alsoKnownAs: ["Shiraz"],
    note: "Black pepper (rotundone) is the tell, and it fades as the climate warms — which is the whole Northern Rhone vs Barossa distinction. Same grape, different name, different wine."
  },
  {
    name: "Nebbiolo",
    tier: 1,
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    colorInt: 1,
    body: 5, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Cherry", "Rose", "Tar", "Dried Herbs"],
    alsoKnownAs: ["Spanna", "Chiavennasca"],
    note: "The great trap: pale garnet in the glass, full-bodied and brutally tannic on the palate. Rose and tar together are diagnostic — nothing else does that pairing."
  },
  {
    name: "Sangiovese",
    tier: 1,
    color: "Red", country: "Italy", region: "Tuscany", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 5, acidity: 5, climate: 3,
    oak: "Common",
    flavors: ["Sour Cherry", "Plum", "Tomato Leaf", "Leather"],
    alsoKnownAs: ["Brunello", "Prugnolo Gentile", "Morellino", "Nielluccio"],
    note: "High acid plus high tannin and a sour-cherry core — built for food, which is why Chianti works at the table and struggles alone."
  },
  {
    name: "Malbec",
    tier: 1,
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
    tier: 1,
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
    tier: 1,
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
    tier: 1,
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
    tier: 1,
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
    tier: 1,
    color: "Red", country: "France", region: "Southern Rhône", continent: "Europe",
    colorInt: 2,
    body: 5, tannin: 2, acidity: 2, climate: 3,
    oak: "Sometimes",
    flavors: ["Strawberry", "Red Plum", "Garrigue", "White Pepper"],
    alsoKnownAs: ["Garnacha", "Cannonau"],
    note: "The great contradiction: pale in the glass, low in tannin and acid, yet full-bodied and high in alcohol. That combination is why it anchors Châteauneuf blends rather than standing alone."
  },
  {
    name: "Tempranillo",
    tier: 1,
    color: "Red", country: "Spain", region: "Rioja", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 4, acidity: 3, climate: 2,
    oak: "Common",
    flavors: ["Red Plum", "Leather", "Tobacco", "Vanilla"],
    alsoKnownAs: ["Tinto Fino", "Tinta del País", "Tinta Roriz", "Aragonez"],
    note: "Medium acidity is the tell - it ripens early, which is what the name means. The coconut-vanilla lift in traditional Rioja is American oak, not the grape."
  },
  {
    name: "Zinfandel",
    tier: 1,
    color: "Red", country: "United States", region: "California", continent: "North America",
    colorInt: 4,
    body: 5, tannin: 3, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Raisin", "Cinnamon", "Chocolate"],
    alsoKnownAs: ["Primitivo", "Tribidrag", "Crljenak Kaštelanski"],
    note: "Ripens unevenly, so one bunch carries green berries and raisins at once - hence the jammy fruit and high alcohol. Primitivo is the same grape; Croatia is where it actually came from."
  },
  {
    name: "Gamay",
    tier: 1,
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
    tier: 1,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Sometimes",
    flavors: ["Green Apple", "Quince", "Honey", "Wet Wool"],
    alsoKnownAs: ["Steen", "Pineau de la Loire"],
    note: "The most versatile white there is - bone dry in Savennières, sweet in Coteaux du Layon, sparkling in Vouvray. Searing acidity is the constant that makes all of it work."
  },
  {
    name: "Viognier",
    tier: 1,
    color: "White", country: "France", region: "Northern Rhône", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 1, acidity: 2, climate: 2,
    oak: "Sometimes",
    flavors: ["Apricot", "Peach", "Honeysuckle", "Ginger"],
    alsoKnownAs: [],
    note: "Low acid and full body make it the anti-Riesling. Condrieu is the benchmark, and it has to be picked late enough for the apricot perfume to arrive - too early and there is nothing there."
  },
  {
    name: "Pinot Gris",
    tier: 1,
    color: "White", country: "France", region: "Alsace", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 1, acidity: 3, climate: 2,
    oak: "Rare",
    flavors: ["Pear", "Peach", "Ginger", "Honey"],
    alsoKnownAs: ["Pinot Grigio", "Grauburgunder", "Ruländer"],
    note: "One grape, two wines. Alsace picks it ripe for a rich, oily, off-dry white; Italy picks it early for something light and neutral. The name on the label tells you which you are getting."
  },
  {
    name: "Pinot Blanc",
    tier: 2,
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
    tier: 1,
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Orange Blossom", "Peach", "Grape", "Rose"],
    alsoKnownAs: ["Moscato", "Moscatel", "Muscat Blanc à Petits Grains"],
    note: "The only grape that genuinely smells of grapes. Ancient, and spread across half the wine world - Moscato d'Asti is the lightest and most charming expression of it."
  },
  {
    name: "Touriga Nacional",
    tier: 2,
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
    tier: 2,
    color: "Red", country: "Italy", region: "Abruzzo", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Sometimes",
    flavors: ["Black Cherry", "Plum", "Dried Herbs", "Clay"],
    alsoKnownAs: [],
    note: "Not to be confused with Vino Nobile di Montepulciano, which is Sangiovese from a Tuscan town of the same name. This is the Abruzzo grape - softer, darker, and one of Italy's great everyday reds."
  },
  {
    name: "Gewürztraminer",
    tier: 1,
    color: "White", country: "France", region: "Alsace", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 1, acidity: 2, climate: 2,
    oak: "Rare",
    flavors: ["Lychee", "Rose", "Ginger", "Honey"],
    alsoKnownAs: ["Traminer", "Gewürz"],
    note: "The easiest white to call blind: lychee and rose, deep gold colour, low acid, high alcohol. Pink-skinned, which is where that unusual depth of colour comes from."
  },
  {
    name: "Sémillon",
    tier: 1,
    color: "White", country: "France", region: "Bordeaux", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 1, acidity: 3, climate: 2,
    oak: "Sometimes",
    flavors: ["Lemon", "Wax", "Honey", "Toast"],
    alsoKnownAs: ["Hunter River Riesling"],
    note: "Thin skins make it prone to botrytis, which is the whole basis of Sauternes. Dry in the Hunter Valley it starts neutral and turns to toast and honey after a decade with no oak involved."
  },
  {
    name: "Albariño",
    tier: 2,
    color: "White", country: "Spain", region: "Rías Baixas", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Citrus", "Peach", "Saline", "Almond"],
    alsoKnownAs: ["Alvarinho"],
    note: "Thick-skinned, which is how it survives the rain in Galicia. High acid and a saline finish - the reason it gets pushed at anyone eating shellfish."
  },
  {
    name: "Grüner Veltliner",
    tier: 2,
    color: "White", country: "Austria", region: "Wachau", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Citrus", "Green Apple", "White Pepper", "Nettle"],
    alsoKnownAs: ["Grüner", "Weissgipfler"],
    note: "White pepper is the marker, and almost nothing else does it in a white. Austria's signature grape, and it scales from cheap and spritzy to serious and age-worthy."
  },
  {
    name: "Torrontés",
    tier: 2,
    color: "White", country: "Argentina", region: "Salta", continent: "South America",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 3, climate: 3,
    oak: "Rare",
    flavors: ["Rose", "Orange Blossom", "Peach", "Citrus"],
    alsoKnownAs: [],
    note: "Smells sweet and finishes dry, which catches people out. A Muscat cross, grown at extreme altitude in Salta where the cool nights hold onto the acidity."
  },
  {
    name: "Furmint",
    tier: 2,
    color: "White", country: "Hungary", region: "Tokaj", continent: "Europe",
    colorInt: 3,
    body: 3, tannin: 1, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Green Apple", "Quince", "Honey", "Smoke"],
    alsoKnownAs: [],
    note: "The backbone of Tokaji Aszú, and increasingly bottled dry. Acidity high enough to carry 150 grams of residual sugar without the wine tasting cloying."
  },
  {
    name: "Assyrtiko",
    tier: 2,
    color: "White", country: "Greece", region: "Santorini", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 5, climate: 3,
    oak: "Sometimes",
    flavors: ["Lemon", "Saline", "Smoke", "Citrus"],
    alsoKnownAs: [],
    note: "Almost unique in keeping high acidity in a hot climate - most grapes lose it. Grown in basket-trained vines on volcanic ash to survive the Santorini wind."
  },
  {
    name: "Garganega",
    tier: 2,
    color: "White", country: "Italy", region: "Veneto", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Pear", "Almond", "Citrus"],
    alsoKnownAs: ["Grecanico"],
    note: "The grape behind Soave, and behind Soave's reputation problem - overcropped on the plains it is water, but from the volcanic Classico hills it is genuinely good."
  },
  {
    name: "Verdejo",
    tier: 2,
    color: "White", country: "Spain", region: "Rueda", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Grapefruit", "Fennel", "Grass", "Almond"],
    alsoKnownAs: [],
    note: "Spain's answer to Sauvignon Blanc, and often blended with it in Rueda. The bitter-almond finish is the giveaway that it is not actually Sauvignon."
  },
  {
    name: "Cortese",
    tier: 3,
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    colorInt: 1,
    body: 2, tannin: 1, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Lemon", "Almond", "Saline"],
    alsoKnownAs: ["Gavi"],
    note: "Gavi is the place, Cortese is the grape. Piedmont's serious white in a region that is otherwise all about red - lean, high-acid, and deliberately understated."
  },
  {
    name: "Carmenère",
    tier: 2,
    color: "Red", country: "Chile", region: "Colchagua", continent: "South America",
    colorInt: 5,
    body: 4, tannin: 4, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Green Bell Pepper", "Chocolate", "Clove"],
    alsoKnownAs: ["Grande Vidure"],
    note: "Lost to phylloxera in Bordeaux and mistaken for Merlot in Chile until DNA testing in 1994. Needs a long season - picked early it is all pyrazine and nothing else."
  },
  {
    name: "Pinotage",
    tier: 2,
    color: "Red", country: "South Africa", region: "Stellenbosch", continent: "Africa",
    colorInt: 5,
    body: 4, tannin: 4, acidity: 4, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Smoke", "Banana"],
    alsoKnownAs: [],
    note: "A 1925 South African crossing of Pinot Noir and Cinsault. Divisive - handled badly it goes to acetone and burnt rubber, handled well it is smoky and dense."
  },
  {
    name: "Mourvèdre",
    tier: 2,
    color: "Red", country: "France", region: "Bandol", continent: "Europe",
    colorInt: 5,
    body: 5, tannin: 5, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Blackberry", "Leather", "Garrigue", "Black Pepper"],
    alsoKnownAs: ["Monastrell", "Mataro"],
    note: "The last to ripen of the Rhône trio, and the most demanding - it needs real heat. Bandol is the benchmark; in GSM blends it supplies the tannin and the meaty, gamey edge."
  },
  {
    name: "Corvina",
    tier: 2,
    color: "Red", country: "Italy", region: "Veneto", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 2, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Sour Cherry", "Red Plum", "Bay Leaf", "Almond"],
    alsoKnownAs: ["Corvina Veronese"],
    note: "Light and tart as Valpolicella, transformed into Amarone by drying the grapes for months first. Same grape, same hillside, and a completely different wine."
  },
  {
    name: "Nerello Mascalese",
    tier: 2,
    color: "Red", country: "Italy", region: "Etna", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 4, acidity: 5, climate: 3,
    oak: "Sometimes",
    flavors: ["Cherry", "Orange Peel", "Smoke", "Volcanic Ash"],
    alsoKnownAs: ["Nerello"],
    note: "Grown on the slopes of an active volcano, and constantly compared to Nebbiolo and Pinot Noir - pale, high-acid, high-tannin, and marked by the black volcanic soil."
  },
  {
    name: "Aglianico",
    tier: 2,
    color: "Red", country: "Italy", region: "Campania", continent: "Europe",
    colorInt: 5,
    body: 5, tannin: 5, acidity: 5, climate: 3,
    oak: "Common",
    flavors: ["Black Cherry", "Leather", "Iron", "Clove"],
    alsoKnownAs: [],
    note: "Southern Italy's answer to Nebbiolo, and just as unforgiving young. Ripens dangerously late - well into November - which is how it holds that much acid in a hot region."
  },
  {
    name: "Nero d’Avola",
    tier: 2,
    color: "Red", country: "Italy", region: "Sicily", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 4, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Black Cherry", "Plum", "Liquorice", "Oregano"],
    alsoKnownAs: ["Calabrese"],
    note: "Sicily’s workhorse grape, once shipped north in bulk to beef up thin wines from cooler regions. Bottled on its own it is dark, warm and unfussy."
  },
  {
    name: "Barbera",
    tier: 1,
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    colorInt: 4,
    body: 3, tannin: 2, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Sour Cherry", "Red Plum", "Liquorice", "Dried Herbs"],
    alsoKnownAs: [],
    note: "Piedmont’s everyday red, planted on the sites Nebbiolo does not want. Deep colour but low tannin and searing acidity - the inverse of its famous neighbour."
  },
  {
    name: "Petit Verdot",
    tier: 2,
    color: "Red", country: "France", region: "Bordeaux", continent: "Europe",
    colorInt: 5,
    body: 5, tannin: 5, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Violet", "Graphite", "Allspice"],
    alsoKnownAs: [],
    note: "The Left Bank seasoning grape - a few percent for colour, tannin and violet perfume. Often refuses to ripen in Bordeaux, which is why it does better in Australia and Spain."
  },
  {
    name: "Vermentino",
    tier: 2,
    color: "White", country: "Italy", region: "Sardinia", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 4, climate: 3,
    oak: "Rare",
    flavors: ["Citrus", "Green Apple", "Saline", "Almond"],
    alsoKnownAs: ["Rolle", "Pigato", "Favorita"],
    note: "The Mediterranean coastal white — Sardinia, Liguria, Corsica, and Provence, where it goes by Rolle. Keeps its bite in real heat, which is rarer than it sounds."
  },
  {
    name: "Marsanne",
    tier: 2,
    color: "White", country: "France", region: "Northern Rhône", continent: "Europe",
    colorInt: 3,
    body: 5, tannin: 1, acidity: 1, climate: 2,
    oak: "Sometimes",
    flavors: ["Quince", "Almond", "Honeysuckle", "Wax"],
    alsoKnownAs: [],
    note: "Heavy, waxy and low in acid — the reason it is almost always blended with Roussanne, which supplies the lift it lacks. White Hermitage is the serious version."
  },
  {
    name: "Roussanne",
    tier: 2,
    color: "White", country: "France", region: "Northern Rhône", continent: "Europe",
    colorInt: 2,
    body: 4, tannin: 1, acidity: 3, climate: 2,
    oak: "Sometimes",
    flavors: ["Pear", "Herbal Tea", "Apricot", "Quince"],
    alsoKnownAs: [],
    note: "Marsanne's partner and its opposite: more aromatic, higher acid, far harder to grow. Named for the russet colour the skins turn when ripe."
  },
  {
    name: "Melon de Bourgogne",
    tier: 2,
    color: "White", country: "France", region: "Loire Valley", continent: "Europe",
    colorInt: 1,
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Citrus", "Saline", "Bread"],
    alsoKnownAs: ["Muscadet"],
    note: "Muscadet is the wine, Melon de Bourgogne the grape. Neutral to the point of blankness on its own — the bready weight comes from months resting on the lees, sur lie."
  },
  {
    name: "Godello",
    tier: 3,
    color: "White", country: "Spain", region: "Valdeorras", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 4, climate: 2,
    oak: "Sometimes",
    flavors: ["Pear", "Citrus", "Fennel", "Almond"],
    alsoKnownAs: [],
    note: "Down to a few hundred vines by the 1970s and rescued deliberately. Fuller and more textural than Albariño, and it takes oak in a way Albariño does not."
  },
  {
    name: "Trebbiano",
    tier: 2,
    color: "White", country: "Italy", region: "Abruzzo", continent: "Europe",
    colorInt: 1,
    body: 2, tannin: 1, acidity: 5, climate: 3,
    oak: "Rare",
    flavors: ["Lemon", "Green Apple", "Almond", "Nettle"],
    alsoKnownAs: ["Ugni Blanc", "Trebbiano Toscano"],
    note: "One of the most planted white grapes on earth and one of the least remarked upon. As Ugni Blanc in France it is grown thin and acidic on purpose, then distilled into Cognac."
  },
  {
    name: "Xinomavro",
    tier: 3,
    color: "Red", country: "Greece", region: "Naoussa", continent: "Europe",
    colorInt: 2,
    body: 4, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Sour Cherry", "Tomato", "Olive", "Forest Floor"],
    alsoKnownAs: [],
    note: "The name means sour-black, which is fair warning. Pale, tannic and savoury enough that it gets called the Greek Nebbiolo — sun-dried tomato is the note nothing else gives you."
  },
  {
    name: "Agiorgitiko",
    tier: 3,
    color: "Red", country: "Greece", region: "Nemea", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Red Plum", "Black Cherry", "Clove", "Dried Herbs"],
    alsoKnownAs: ["Saint George"],
    note: "Greece's most planted red and the approachable one — soft tannins, deep colour, no hard edges. Nemea sits high enough that the altitude does the work the latitude will not."
  },
  {
    name: "Blaufränkisch",
    tier: 2,
    color: "Red", country: "Austria", region: "Burgenland", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 4, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Sour Cherry", "Blackberry", "White Pepper", "Cinnamon"],
    alsoKnownAs: ["Lemberger", "Kékfrankos"],
    note: "Austria's serious red, and the peppery counterpart to Grüner Veltliner. High acid and firm tannin make it read as far more northern than it is."
  },
  {
    name: "Saperavi",
    tier: 3,
    color: "Red", country: "Georgia", region: "Kakheti", continent: "Asia",
    colorInt: 5,
    body: 5, tannin: 4, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Blackberry", "Plum", "Liquorice", "Iron"],
    alsoKnownAs: [],
    note: "A teinturier — red flesh as well as red skin, which almost no wine grape has, and why it stains the glass. From the country that has been making wine in clay qvevri for eight thousand years."
  },
  {
    name: "Tannat",
    tier: 2,
    color: "Red", country: "Uruguay", region: "Canelones", continent: "South America",
    colorInt: 5,
    body: 5, tannin: 5, acidity: 4, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Liquorice", "Chocolate"],
    alsoKnownAs: ["Harriague"],
    note: "Named for its tannin, and it earns it — the most tannic wine grape in commercial use. French by origin, from Madiran, but Uruguay made it a national identity."
  },
  {
    name: "Cinsault",
    tier: 2,
    color: "Red", country: "France", region: "Languedoc", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 2, acidity: 3, climate: 3,
    oak: "Rare",
    flavors: ["Strawberry", "Red Plum", "Garrigue", "White Pepper"],
    alsoKnownAs: ["Cinsaut"],
    note: "Pale, soft and perfumed — the grape that makes Provence rosé work. Crossed with Pinot Noir in 1925 to produce Pinotage, which turned out nothing like it."
  },
  {
    name: "Carignan",
    tier: 2,
    color: "Red", country: "France", region: "Languedoc", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 4, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Blackberry", "Red Plum", "Garrigue", "Leather"],
    alsoKnownAs: ["Mazuelo", "Cariñena", "Samsó"],
    note: "Ripped out across the Midi for decades as the symbol of the wine lake. The old vines that survived the purge now make some of the most interesting reds in the south."
  },
  {
    name: "Mencía",
    tier: 3,
    color: "Red", country: "Spain", region: "Bierzo", continent: "Europe",
    colorInt: 3,
    body: 3, tannin: 3, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Red Plum", "Violet", "Bay Leaf", "Graphite"],
    alsoKnownAs: ["Jaen"],
    note: "Long assumed to be a relative of Cabernet Franc, and it does taste like one — floral, leafy, high-acid. The slate soils of Bierzo show up as a distinctly mineral streak."
  },
  {
    name: "Fiano",
    tier: 2,
    color: "White", country: "Italy", region: "Campania", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 1, acidity: 4, climate: 3,
    oak: "Sometimes",
    flavors: ["Hazelnut", "Pear", "Honey", "Chamomile"],
    alsoKnownAs: [],
    note: "One of the few southern Italian whites built to age — waxy and nutty after a few years. Nearly extinct by the 1940s; Avellino is where it came back."
  },
  {
    name: "Verdicchio",
    tier: 2,
    color: "White", country: "Italy", region: "Marche", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 5, climate: 2,
    oak: "Rare",
    flavors: ["Lemon", "Green Apple", "Almond", "Fennel"],
    alsoKnownAs: ["Trebbiano di Soave"],
    note: "The bitter-almond finish is the signature, and it is a feature rather than a fault. Long sold in a novelty amphora bottle that did the wine no favours."
  },
  {
    name: "Silvaner",
    tier: 3,
    color: "White", country: "Germany", region: "Franken", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 4, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Pear", "Nettle", "Wet Stone"],
    alsoKnownAs: ["Sylvaner", "Grüner Silvaner"],
    note: "Germany's quiet alternative to Riesling — earthier, lower in acid, and far more about the site than the fruit. Franken bottles it in the flat green Bocksbeutel."
  },
  {
    name: "Aligoté",
    tier: 3,
    color: "White", country: "France", region: "Burgundy", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 1, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Green Apple", "Lemon", "Chalk", "Almond"],
    alsoKnownAs: [],
    note: "Burgundy's other white, planted where Chardonnay would not ripen well. Sharp enough that the traditional use was to soften it with crème de cassis — a Kir."
  },
  {
    name: "Picpoul",
    tier: 3,
    color: "White", country: "France", region: "Languedoc", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 1, acidity: 5, climate: 3,
    oak: "Rare",
    flavors: ["Lemon", "Grapefruit", "Saline", "Green Apple"],
    alsoKnownAs: ["Piquepoul", "Picpoul de Pinet"],
    note: "The name means lip-stinger. Grown on the étangs near Sète and sold almost exclusively as an oyster wine, which is the correct use for it."
  },
  {
    name: "Macabeo",
    tier: 2,
    color: "White", country: "Spain", region: "Penedès", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 3, climate: 2,
    oak: "Sometimes",
    flavors: ["Green Apple", "Citrus", "Almond", "Honey"],
    alsoKnownAs: ["Viura", "Macabeu"],
    note: "Two jobs under two names: Viura is the white grape of Rioja, Macabeo the backbone of Cava. Late-budding, which is what keeps it out of trouble with spring frost."
  },
  {
    name: "Pedro Ximénez",
    tier: 2,
    color: "White", country: "Spain", region: "Jerez", continent: "Europe",
    colorInt: 3,
    body: 5, tannin: 1, acidity: 2, climate: 4,
    oak: "Common",
    flavors: ["Raisin", "Fig", "Chocolate", "Coffee"],
    alsoKnownAs: ["PX"],
    note: "Laid out on mats to raisin in the Andalusian sun before pressing, which is how a dry white grape ends up as black, syrupy dessert wine. Andalusia is the hottest corner of the wine map represented here."
  },
  {
    name: "Dolcetto",
    tier: 2,
    color: "Red", country: "Italy", region: "Piedmont", continent: "Europe",
    colorInt: 4,
    body: 3, tannin: 4, acidity: 2, climate: 2,
    oak: "Rare",
    flavors: ["Black Cherry", "Plum", "Liquorice", "Almond"],
    alsoKnownAs: [],
    note: "The name means little sweet one, though the wine is dry and firmly tannic. Low acid is what sets it apart from every other Piedmont red — the everyday bottle while the Barolo waits."
  },
  {
    name: "Lagrein",
    tier: 3,
    color: "Red", country: "Italy", region: "Alto Adige", continent: "Europe",
    colorInt: 5,
    body: 4, tannin: 4, acidity: 4, climate: 1,
    oak: "Sometimes",
    flavors: ["Blackberry", "Violet", "Chocolate", "Forest Floor"],
    alsoKnownAs: [],
    note: "Startlingly dark for a grape grown in the Alps. A relative of Syrah, and the tannins can turn bitter on the finish if the winemaking is careless."
  },
  {
    name: "Sagrantino",
    tier: 3,
    color: "Red", country: "Italy", region: "Umbria", continent: "Europe",
    colorInt: 5,
    body: 5, tannin: 5, acidity: 4, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Forest Floor", "Cinnamon"],
    alsoKnownAs: [],
    note: "Among the most tannic grapes in existence — the polyphenol counts run higher than Tannat. Montefalco law requires nearly three years of ageing before release, and it needs every month."
  },
  {
    name: "Negroamaro",
    tier: 3,
    color: "Red", country: "Italy", region: "Puglia", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Sometimes",
    flavors: ["Black Cherry", "Raisin", "Oregano", "Clay"],
    alsoKnownAs: [],
    note: "Black and bitter, by both name and taste — the roasted, slightly bitter finish is the marker. Salento heat gives it the raisined edge."
  },
  {
    name: "Bobal",
    tier: 3,
    color: "Red", country: "Spain", region: "Utiel-Requena", continent: "Europe",
    colorInt: 5,
    body: 4, tannin: 4, acidity: 5, climate: 3,
    oak: "Sometimes",
    flavors: ["Blackberry", "Red Plum", "Rosemary", "Graphite"],
    alsoKnownAs: [],
    note: "Spain's second most planted red and almost unknown outside it, long sent away for bulk blending. Old bush vines at altitude hold acidity that has no business surviving that heat."
  },
  {
    name: "Zweigelt",
    tier: 2,
    color: "Red", country: "Austria", region: "Niederösterreich", continent: "Europe",
    colorInt: 3,
    body: 3, tannin: 2, acidity: 4, climate: 2,
    oak: "Rare",
    flavors: ["Sour Cherry", "Raspberry", "Clove", "Violet"],
    alsoKnownAs: [],
    note: "Austria's most planted red, a 1922 crossing of Blaufränkisch and St. Laurent. Juicy and low-tannin — the one they chill slightly and drink young."
  },
  {
    name: "Pinot Meunier",
    tier: 2,
    color: "Red", country: "France", region: "Champagne", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 2, acidity: 5, climate: 1,
    oak: "Rare",
    flavors: ["Red Plum", "Raspberry", "Bread", "Mushroom"],
    alsoKnownAs: ["Meunier"],
    note: "The third Champagne grape and the least discussed, though it is planted more widely than Pinot Noir there. Buds late and ripens early, which is how it survives frost in the Marne Valley."
  },
  {
    name: "Petite Sirah",
    tier: 2,
    color: "Red", country: "United States", region: "California", continent: "North America",
    colorInt: 5,
    body: 5, tannin: 5, acidity: 3, climate: 3,
    oak: "Common",
    flavors: ["Blackberry", "Plum", "Chocolate", "Black Pepper"],
    alsoKnownAs: ["Durif"],
    note: "Not Syrah and not petite — a Syrah-Peloursin crossing with tiny berries and enormous tannin. Long used to give backbone to Zinfandel before it was bottled on its own."
  },
  {
    name: "Grillo",
    tier: 3,
    color: "White", country: "Italy", region: "Sicily", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 4, climate: 3,
    oak: "Rare",
    flavors: ["Citrus", "Peach", "Saline", "Fennel"],
    alsoKnownAs: [],
    note: "Bred for Marsala and left there for a century. Picked early it now makes a taut, saline dry white — one of the clearest signs of how far Sicily has moved."
  },
  {
    name: "Falanghina",
    tier: 3,
    color: "White", country: "Italy", region: "Campania", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 5, climate: 3,
    oak: "Rare",
    flavors: ["Citrus", "Pear", "Nettle", "Almond"],
    alsoKnownAs: [],
    note: "Possibly the grape behind Falernian, the most prized wine of ancient Rome. Keeps a sharp citrus edge in a region where most whites turn flabby."
  },
  {
    name: "Arneis",
    tier: 3,
    color: "White", country: "Italy", region: "Piedmont", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 3, climate: 2,
    oak: "Rare",
    flavors: ["Pear", "Almond", "Chamomile", "Peach"],
    alsoKnownAs: ["Roero Arneis"],
    note: "The name is Piedmontese for little rascal, earned by being difficult in the vineyard and quick to lose its acidity. Once planted among Nebbiolo to distract birds."
  },
  {
    name: "Encruzado",
    tier: 3,
    color: "White", country: "Portugal", region: "Dão", continent: "Europe",
    colorInt: 2,
    body: 4, tannin: 1, acidity: 4, climate: 2,
    oak: "Sometimes",
    flavors: ["Citrus", "Pear", "Wet Stone", "Wax"],
    alsoKnownAs: [],
    note: "Portugal's most serious white, and almost entirely confined to the Dão. Structured enough to take oak and years in bottle without ever getting heavy."
  },
  {
    name: "Petit Manseng",
    tier: 3,
    color: "White", country: "France", region: "Jurançon", continent: "Europe",
    colorInt: 3,
    body: 4, tannin: 1, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Apricot", "Citrus", "Honey", "Ginger"],
    alsoKnownAs: [],
    note: "Thick skins and tiny berries left to shrivel on the vine into December — passerillage, not botrytis. Acidity high enough that the sweet wines finish clean."
  },
  {
    name: "Rkatsiteli",
    tier: 3,
    color: "White", country: "Georgia", region: "Kakheti", continent: "Asia",
    colorInt: 3,
    body: 3, tannin: 1, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Green Apple", "Quince", "Walnut", "Honey"],
    alsoKnownAs: [],
    note: "Georgia's workhorse white, and the classic amber wine when fermented on its skins in buried qvevri. That method gives it grip no other white has."
  },
  {
    name: "Chasselas",
    tier: 3,
    color: "White", country: "Switzerland", region: "Lavaux", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 1, acidity: 2, climate: 2,
    oak: "Rare",
    flavors: ["Green Apple", "Almond", "Bread", "Flint"],
    alsoKnownAs: ["Fendant", "Gutedel"],
    note: "So neutral it is treated as a transmitter rather than a flavour — the Swiss judge it entirely on site. Low acid means it has nowhere to hide."
  },
  {
    name: "Teroldego",
    tier: 3,
    color: "Red", country: "Italy", region: "Trentino", continent: "Europe",
    colorInt: 5,
    body: 4, tannin: 3, acidity: 5, climate: 2,
    oak: "Sometimes",
    flavors: ["Blackberry", "Plum", "Violet", "Iron"],
    alsoKnownAs: [],
    note: "A parent of Lagrein and a relative of Syrah, grown on the gravel flats of the Campo Rotaliano. Dark and high-acid, with far softer tannins than the colour suggests."
  },
  {
    name: "Frappato",
    tier: 3,
    color: "Red", country: "Italy", region: "Sicily", continent: "Europe",
    colorInt: 2,
    body: 2, tannin: 2, acidity: 5, climate: 3,
    oak: "Rare",
    flavors: ["Strawberry", "Cherry", "Violet", "Oregano"],
    alsoKnownAs: [],
    note: "Pale, floral and best served cool — not what most people expect from Sicily. Blended with Nero d'Avola it makes Cerasuolo di Vittoria, the island's only DOCG."
  },
  {
    name: "Baga",
    tier: 3,
    color: "Red", country: "Portugal", region: "Bairrada", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 5, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Sour Cherry", "Blackberry", "Clay", "Leather"],
    alsoKnownAs: [],
    note: "Thick-skinned, late-ripening and severe — high acid on top of high tannin, in a damp maritime climate that does it no favours. Rewards patience and little else."
  },
  {
    name: "Graciano",
    tier: 3,
    color: "Red", country: "Spain", region: "Rioja", continent: "Europe",
    colorInt: 4,
    body: 4, tannin: 4, acidity: 5, climate: 2,
    oak: "Common",
    flavors: ["Blackberry", "Violet", "Dried Herbs", "Black Pepper"],
    alsoKnownAs: ["Morrastel"],
    note: "The seasoning in a Rioja blend — a few percent for acidity and floral lift. Yields so miserly that growers nearly abandoned it before the quality argument won."
  },
  {
    name: "Listán Negro",
    tier: 3,
    color: "Red", country: "Spain", region: "Canary Islands", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 2, acidity: 4, climate: 3,
    oak: "Rare",
    flavors: ["Red Plum", "Smoke", "Bay Leaf", "Volcanic Ash"],
    alsoKnownAs: [],
    note: "Phylloxera never reached the Canaries, so these are ungrafted vines on volcanic ash, some of them centuries old. The smoky, ashy note comes with the ground."
  },
  {
    name: "Trousseau",
    tier: 3,
    color: "Red", country: "France", region: "Jura", continent: "Europe",
    colorInt: 2,
    body: 3, tannin: 3, acidity: 4, climate: 1,
    oak: "Sometimes",
    flavors: ["Red Plum", "Cherry", "Cinnamon", "Mushroom"],
    alsoKnownAs: ["Bastardo"],
    note: "The sturdier of the Jura's two pale reds, needing the warmest sites to ripen at all. Travels to Portugal as Bastardo, where it goes into Port."
  },
  {
    name: "Dornfelder",
    tier: 3,
    color: "Red", country: "Germany", region: "Pfalz", continent: "Europe",
    colorInt: 5,
    body: 3, tannin: 3, acidity: 4, climate: 1,
    oak: "Sometimes",
    flavors: ["Sour Cherry", "Blackberry", "Violet", "Liquorice"],
    alsoKnownAs: [],
    note: "A 1955 crossing bred to solve a specific German problem: red wines too pale to convince anyone. Deeply coloured, moderate in everything else."
  },
  {
    name: "Bonarda",
    tier: 3,
    color: "Red", country: "Argentina", region: "Mendoza", continent: "South America",
    colorInt: 4,
    body: 4, tannin: 3, acidity: 3, climate: 3,
    oak: "Sometimes",
    flavors: ["Plum", "Black Cherry", "Violet", "Star Anise"],
    alsoKnownAs: ["Douce Noire", "Charbono"],
    note: "Argentina's second most planted red, and not Italian Bonarda at all — it is Savoie's Douce Noire, misnamed on arrival. Soft, dark and permanently in Malbec's shadow."
  }
];
