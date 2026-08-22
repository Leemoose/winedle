/* Winedle — aroma families
 *
 * The aroma tile used to compare terms as opaque strings, so a wine described
 * as Lemon scored nothing against one described as Citrus, and Sour Cherry
 * scored nothing against Cherry. Grouping the vocabulary lets a guess earn
 * partial credit for landing in the right family, which is how tasting notes
 * actually work: you place the family first, then narrow.
 *
 * Every term used in data/wines.js must appear here exactly once — test.js
 * enforces both halves of that, so a dead term or an unmapped one fails the
 * build rather than silently scoring as a miss.
 *
 * The vocabulary deliberately avoids catch-alls. "Herbal", "Earthy" and
 * "Spice" once covered 29, 16 and 14 wines respectively — a third of the bank
 * sharing one filler word, which made the tile look informative while telling
 * you almost nothing. Family scoring means a specific term still earns credit
 * against its neighbours, so there is no longer any reason to be vague.
 */

const AROMA_FAMILIES = {
  'Citrus':      ['Citrus', 'Lemon', 'Lime', 'Grapefruit', 'Orange Peel', 'Bergamot'],
  'Orchard':     ['Green Apple', 'Pear', 'Quince'],
  'Stone fruit': ['Peach', 'Apricot'],
  'Tropical':    ['Lychee', 'Banana', 'Grape'],
  'Red fruit':   ['Cherry', 'Sour Cherry', 'Red Plum', 'Raspberry', 'Strawberry'],
  'Black fruit': ['Blackberry', 'Blackcurrant', 'Black Cherry', 'Plum'],
  'Dried fruit': ['Raisin', 'Fig', 'Honey'],
  'Floral':      ['Rose', 'Violet', 'Orange Blossom', 'Honeysuckle', 'Elderflower', 'Chamomile'],
  'Herbaceous':  ['Herbal Tea', 'Grass', 'Green Bell Pepper', 'Mint', 'Fennel',
                  'Gooseberry', 'Olive', 'Tomato', 'Dried Herbs', 'Tomato Leaf',
                  'Garrigue', 'Nettle', 'Oregano', 'Bay Leaf', 'Rosemary'],
  'Spice':       ['Black Pepper', 'White Pepper', 'Ginger', 'Liquorice', 'Clove',
                  'Cinnamon', 'Star Anise', 'Allspice'],
  'Oak':         ['Cedar', 'Vanilla', 'Toast', 'Chocolate', 'Coffee', 'Smoke'],
  'Earth':       ['Tar', 'Graphite', 'Slate', 'Petrol', 'Saline', 'Forest Floor',
                  'Wet Stone', 'Flint', 'Chalk', 'Clay', 'Iron', 'Volcanic Ash',
                  'Mushroom'],
  'Savoury':     ['Leather', 'Tobacco'],
  'Leesy':       ['Bread', 'Butter', 'Wax', 'Wet Wool'],
  'Nutty':       ['Almond', 'Hazelnut', 'Walnut']
};

/* Same thing at a different shade. These deliberately sit in different families
 * - red fruit against black fruit is a real distinction a taster makes - but
 * scoring cherry against black cherry as completely unrelated reads as a bug,
 * and it did: 5.2% of all guess/answer pairs had a same-fruit term earning
 * nothing. Kinship is checked alongside family, never instead of it.
 */
const AROMA_KIN = {
  'Cherry':  ['Cherry', 'Black Cherry', 'Sour Cherry'],
  'Plum':    ['Plum', 'Red Plum'],
  'Toasted': ['Toast', 'Bread']
};

const AROMA_STEM = (function () {
  const map = {};
  Object.keys(AROMA_KIN).forEach(stem => {
    AROMA_KIN[stem].forEach(term => { map[term] = stem; });
  });
  return map;
})();

const AROMA_FAMILY = (function () {
  const map = {};
  Object.keys(AROMA_FAMILIES).forEach(fam => {
    AROMA_FAMILIES[fam].forEach(term => { map[term] = fam; });
  });
  return map;
})();
