/* Winedle — aroma families
 *
 * The aroma tile used to compare terms as opaque strings, so a wine described
 * as Lemon scored nothing against one described as Citrus, and Sour Cherry
 * scored nothing against Cherry. Grouping the vocabulary lets a guess earn
 * partial credit for landing in the right family, which is how tasting notes
 * actually work: you place the family first, then narrow.
 *
 * Every term used in data/wines.js must appear here exactly once — test.js
 * enforces both halves of that.
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
  'Herbaceous':  ['Herbal', 'Herbal Tea', 'Grass', 'Green Bell Pepper', 'Mint', 'Fennel',
                  'Gooseberry', 'Olive', 'Tomato'],
  'Spice':       ['Spice', 'Black Pepper', 'White Pepper', 'Ginger', 'Liquorice'],
  'Oak':         ['Cedar', 'Vanilla', 'Toast', 'Chocolate', 'Coffee', 'Smoke'],
  'Earth':       ['Earthy', 'Tar', 'Graphite', 'Slate', 'Petrol', 'Saline'],
  'Savoury':     ['Leather', 'Tobacco'],
  'Leesy':       ['Bread', 'Butter', 'Wax', 'Wet Wool'],
  'Nutty':       ['Almond', 'Hazelnut']
};

const AROMA_FAMILY = (function () {
  const map = {};
  Object.keys(AROMA_FAMILIES).forEach(fam => {
    AROMA_FAMILIES[fam].forEach(term => { map[term] = fam; });
  });
  return map;
})();
