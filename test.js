/* Winedle test suite — run with `node test.js`. build.sh runs it and refuses
 * to build on failure.
 *
 * The engine lives in a browser script with no module system, so we evaluate
 * the part above the persistence section (everything from there down touches
 * localStorage and the DOM) and pull the pure functions out of it.
 */
'use strict';

const fs = require('fs');

const WINES = new Function(fs.readFileSync('data/wines.js', 'utf8') + '; return WINES;')();
const source = fs.readFileSync('src/game.js', 'utf8');
const pure = source.split('/* ---------- persistence ---------- */')[0];
const api = new Function('WINES', pure + `; return {
  compare, puzzleFor, dayNumber, seededShuffle, resolve, suggest, normalize,
  COLUMNS, ORD_LABELS, MAX_GUESSES, HINT_AT, tierPool, tierForDay, TIER_WEEK,
  candidatesFor, tileSignature, bestAroma, REMAINING_AFTER,
  practicePick, PRACTICE_MISS_BIAS
};`)(WINES);

let failures = 0;
let checks = 0;

function ok(name, cond, detail) {
  checks++;
  if (cond) return;
  failures++;
  console.log('  FAIL  ' + name + (detail ? '\n        ' + detail : ''));
}

function section(name) { console.log('\n' + name); }

const by = n => WINES.find(w => w.name === n);
const ORD = ['colorInt', 'body', 'tannin', 'acidity', 'climate'];

/* ---------- data integrity ---------- */

section('data');

const shape = Object.keys(WINES[0]).sort().join(',');
const offShape = WINES.filter(w => Object.keys(w).sort().join(',') !== shape);
ok('every record has the same fields', offShape.length === 0,
   offShape.map(w => w.name).join(', '));

const badOrd = WINES.filter(w => ORD.some(k => !Number.isInteger(w[k]) || w[k] < 1 || w[k] > 5));
ok('ordinals are integers 1-5', badOrd.length === 0, badOrd.map(w => w.name).join(', '));

const badClimate = WINES.filter(w => w.climate > api.ORD_LABELS.climate.length);
ok('climate stays inside its label range', badClimate.length === 0,
   badClimate.map(w => w.name).join(', '));

const badText = WINES.filter(w =>
  !w.name || !w.color || !w.country || !w.region || !w.continent || !w.oak || !w.note);
ok('no empty text fields', badText.length === 0, badText.map(w => w.name).join(', '));

const badTier = WINES.filter(w => ![1, 2, 3].includes(w.tier));
ok('every wine has a tier of 1, 2 or 3', badTier.length === 0, badTier.map(w => w.name).join(', '));

[1, 2, 3].forEach(tier => ok('tier ' + tier + ' has enough wines to fill a cycle',
  api.tierPool(tier).length >= 10, 'only ' + api.tierPool(tier).length));

const badFlavors = WINES.filter(w => !Array.isArray(w.flavors) || w.flavors.length !== 4);
ok('every wine has exactly four aromas', badFlavors.length === 0,
   badFlavors.map(w => w.name).join(', '));

const dupFlavors = WINES.filter(w => new Set(w.flavors).size !== w.flavors.length);
ok('no wine repeats an aroma', dupFlavors.length === 0, dupFlavors.map(w => w.name).join(', '));

/* The invariant that keeps every puzzle solvable: no two wines may be
 * indistinguishable across all nine scored tiles. */
const FULL = ['color', 'country', 'region', 'colorInt', 'body', 'tannin', 'acidity', 'climate'];
const fullSig = w => FULL.map(k => w[k]).join('|') + '|' + [...w.flavors].sort().join(',');
const bySig = {};
WINES.forEach(w => (bySig[fullSig(w)] = bySig[fullSig(w)] || []).push(w.name));
const twins = Object.values(bySig).filter(v => v.length > 1);
ok('no two wines are identical across all nine tiles', twins.length === 0,
   JSON.stringify(twins));

/* Names and aliases share one lookup table, so a collision silently steals a
 * grape's name and makes it unguessable. */
const seen = new Map();
const collisions = [];
WINES.forEach(w => [w.name, ...w.alsoKnownAs].forEach(n => {
  const k = api.normalize(n);
  if (seen.has(k) && seen.get(k) !== w.name) collisions.push(n + ': ' + seen.get(k) + ' vs ' + w.name);
  seen.set(k, w.name);
}));
ok('no name or alias collides with another grape', collisions.length === 0, collisions.join('; '));

const selfAlias = WINES.filter(w => w.alsoKnownAs.some(a => api.normalize(a) === api.normalize(w.name)));
ok('no wine lists itself as an alias', selfAlias.length === 0, selfAlias.map(w => w.name).join(', '));

ok('every white is low tannin', WINES.filter(w => w.color === 'White').every(w => w.tannin === 1));

/* ---------- comparison engine ---------- */

section('engine');

const self = api.compare(by('Nebbiolo'), by('Nebbiolo'));
ok('a wine against itself scores every tile exact', self.every(t => t.state === 'hit'));
ok('the grid is nine tiles wide', self.length === 9 && api.COLUMNS.length === 9);

const nebSang = api.compare(by('Sangiovese'), by('Nebbiolo'));
const tile = (tiles, label) => tiles.find(t => t.label === label);
ok('same country scores exact', tile(nebSang, 'Country').state === 'hit');
ok('different region inside the same country scores no match',
   tile(nebSang, 'Region').state === 'miss');
ok('one step off scores close', tile(nebSang, 'Body').state === 'near');
ok('one step low points the arrow up', tile(nebSang, 'Body').arrow === '↑');

const euroSA = api.compare(by('Malbec'), by('Nebbiolo'));
ok('a different continent scores no match on country',
   tile(euroSA, 'Country').state === 'miss');
const sameContinent = api.compare(by('Tempranillo'), by('Nebbiolo'));
ok('a different country on the same continent scores close',
   tile(sameContinent, 'Country').state === 'near');

const twoOff = api.compare(by('Pinot Noir'), by('Nebbiolo'));
ok('two or more steps off scores no match', tile(twoOff, 'Body').state === 'miss');
ok('a no-match ordinal still points the way', tile(twoOff, 'Body').arrow === '↑');

const noShare = api.compare(by('Riesling'), by('Cabernet Sauvignon'));
ok('no shared aromas scores no match', tile(noShare, 'Aromas').state === 'miss');
const someShare = api.compare(by('Merlot'), by('Cabernet Sauvignon'));
ok('partial aroma overlap scores close', tile(someShare, 'Aromas').state === 'near');
ok('a close aroma tile names what was shared', !!tile(someShare, 'Aromas').detail);

/* Symmetry: swapping guess and answer must flip the arrows, not the states. */
const ab = api.compare(by('Merlot'), by('Nebbiolo'));
const ba = api.compare(by('Nebbiolo'), by('Merlot'));
ok('comparison states are symmetric', ab.every((t, i) => t.state === ba[i].state));
ok('comparison arrows invert', ab.every((t, i) =>
  !t.arrow || (ba[i].arrow && t.arrow !== ba[i].arrow)));

/* ---------- schedule ---------- */

section('schedule');

ok('the schedule is deterministic', api.puzzleFor(500).name === api.puzzleFor(500).name);

const run = [];
for (let d = 0; d < 400; d++) run.push(api.puzzleFor(d).name);
ok('every scheduled day yields a wine', run.every(Boolean));

/* Each tier walks its own deck, so nothing should repeat until that tier's
 * pool is spent - check each tier's own run rather than the mixed sequence. */
[1, 2, 3].forEach(tier => {
  const days = [];
  for (let d = 0; d < 400; d++) if (api.tierForDay(d) === tier) days.push(d);
  const size = api.tierPool(tier).length;
  const firstPass = days.slice(0, size).map(d => api.puzzleFor(d).name);
  ok('tier ' + tier + ' does not repeat within one pass',
     new Set(firstPass).size === firstPass.length,
     firstPass.filter((n, i) => firstPass.indexOf(n) !== i).join(', '));
  ok('tier ' + tier + ' days only draw tier ' + tier + ' wines',
     days.slice(0, 60).every(d => api.puzzleFor(d).tier === tier));
});

/* Six days in seven must be approachable. */
const week = api.TIER_WEEK;
ok('the week is mostly tiers 1 and 2', week.filter(t => t < 3).length === 6);
ok('the week includes one specialist day', week.filter(t => t === 3).length === 1);

const sample = [];
for (let d = 0; d < 70; d++) sample.push(api.puzzleFor(d).tier);
ok('a ten-week sample is 30/30/10 by tier',
   sample.filter(t => t === 1).length === 30 &&
   sample.filter(t => t === 2).length === 30 &&
   sample.filter(t => t === 3).length === 10,
   JSON.stringify([1,2,3].map(t => sample.filter(x => x === t).length)));

ok('negative and out-of-range days still resolve', !!api.puzzleFor(0) && !!api.puzzleFor(99999));

const shuffled = api.seededShuffle(WINES, 7).map(w => w.name).join();
ok('the shuffle is stable for a given seed', shuffled === api.seededShuffle(WINES, 7).map(w => w.name).join());
ok('different seeds give different orders', shuffled !== api.seededShuffle(WINES, 8).map(w => w.name).join());

/* ---------- name resolution ---------- */

section('names');

ok('an exact name resolves', api.resolve('Nebbiolo') === by('Nebbiolo'));
ok('case and spacing are ignored', api.resolve('  nEbBiOlO ') === by('Nebbiolo'));
ok('accents are optional', api.resolve('gewurztraminer') === by('Gewürztraminer'));
ok('apostrophes are optional', api.resolve('nero davola') === by('Nero d’Avola'));
ok('aliases resolve to their grape', api.resolve('Shiraz') === by('Syrah'));
ok('Primitivo resolves to Zinfandel', api.resolve('primitivo') === by('Zinfandel'));
ok('nonsense resolves to nothing', api.resolve('zzzzz') === null);

const sug = api.suggest('pinot', []);
ok('suggestions match on substring', sug.length >= 3);
ok('suggestions are capped', api.suggest('a', []).length <= 8);
ok('already-guessed wines are excluded from suggestions',
   api.suggest('nebbiolo', ['Nebbiolo']).length === 0);

/* ---------- deduction ---------- */

section('deduction');

const answer = by('Nebbiolo');

ok('with no guesses the whole bank is possible',
   api.candidatesFor([], answer).length === WINES.length);

ok('the answer survives every filter',
   api.candidatesFor(['Riesling', 'Merlot', 'Sangiovese'], answer).some(c => c.name === answer.name));

ok('guessing the answer narrows the field to one',
   api.candidatesFor([answer.name], answer).length === 1);

/* A wrong guess must remove itself: it cannot be the answer, because it did
 * not score all-exact. */
ok('a wrong guess rules itself out',
   !api.candidatesFor(['Merlot'], answer).some(c => c.name === 'Merlot'));

/* More information can never widen the field. */
let previous = WINES.length;
let monotonic = true;
['Riesling', 'Merlot', 'Barbera', 'Sangiovese'].forEach((n, i, arr) => {
  const size = api.candidatesFor(arr.slice(0, i + 1), answer).length;
  if (size > previous) monotonic = false;
  previous = size;
});
ok('each further guess never widens the field', monotonic);

/* Every candidate must be genuinely consistent - it would have produced the
 * same board. */
const guesses = ['Merlot', 'Barbera'];
const consistent = api.candidatesFor(guesses, answer).every(c =>
  guesses.every(n => api.tileSignature(by(n), c) === api.tileSignature(by(n), answer)));
ok('every surviving candidate reproduces the board exactly', consistent);

/* The hint should pick the aroma that rules out the most, not the first. */
const pool = api.candidatesFor(['Sangiovese'], answer);
const picked = api.bestAroma(by('Sangiovese'), answer, new Set(), pool);
const options = answer.flavors.filter(f => !by('Sangiovese').flavors.includes(f));
const counts = options.map(f => ({ f, n: pool.filter(c => c.flavors.includes(f)).length }));
const fewest = counts.reduce((a, b) => (b.n < a.n ? b : a));
ok('the hint reveals the most eliminating aroma', picked === fewest.f,
   'picked ' + picked + ', best was ' + fewest.f + ' (' + JSON.stringify(counts) + ')');

ok('the remaining-field count is withheld until the player is stuck',
   api.REMAINING_AFTER >= 3 && api.REMAINING_AFTER < api.MAX_GUESSES,
   'REMAINING_AFTER is ' + api.REMAINING_AFTER);

ok('the hint never repeats a revealed aroma',
   api.bestAroma(by('Sangiovese'), answer, new Set(answer.flavors), pool) === null);

/* ---------- practice ---------- */

section('practice');

/* Seeded so the draw is reproducible. */
function seq(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

ok('with no history it draws from the whole bank',
   api.practicePick(seq([0.5]), {}) === WINES[Math.floor(0.5 * WINES.length)]);

ok('a low roll redraws something previously missed',
   api.practicePick(seq([0.1, 0]), { 'Nebbiolo': 2 }).name === 'Nebbiolo');

ok('a high roll ignores the miss list',
   api.practicePick(seq([0.9, 0.5]), { 'Nebbiolo': 2 }).name !== 'Nebbiolo' ||
   WINES[Math.floor(0.5 * WINES.length)].name === 'Nebbiolo');

ok('a stale miss for a grape no longer in the bank is skipped',
   !!api.practicePick(seq([0.1, 0]), { 'Deleted Grape': 1 }));

ok('the practice draw always returns a real wine',
   [0, 0.25, 0.5, 0.75, 0.99].every(r => WINES.includes(api.practicePick(seq([r]), {}))));

ok('the miss bias leaves room for new wines',
   api.PRACTICE_MISS_BIAS > 0 && api.PRACTICE_MISS_BIAS < 1);

/* ---------- summary ---------- */

console.log('\n' + (failures ? failures + ' failed' : 'all passed') + ' — ' + checks + ' checks\n');
process.exit(failures ? 1 : 0);
