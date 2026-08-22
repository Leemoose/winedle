/* Winedle - daily wine guessing game */
'use strict';

const MAX_GUESSES = 6;
/* A guess scoring this many exact tiles is close enough that the grid alone
 * stops being informative — surface something it does not already show. */
const HINT_AT = 6;
/* The nine tiles are far more informative than they look: a perfect solver
 * averages 2.26 guesses over the bank and never needs more than three, and one
 * opening guess pins the answer outright in most cases. So the remaining-field
 * count is help for someone stuck, not a running readout - showing it from the
 * first guess would announce that the puzzle was already logically over. */
const REMAINING_AFTER = 3;
const EPOCH = Date.UTC(2026, 0, 1);

const ORD_LABELS = {
  body:     ['Light', 'Light-Med', 'Medium', 'Med-Full', 'Full'],
  tannin:   ['Low', 'Low-Med', 'Medium', 'Med-High', 'High'],
  acidity:  ['Low', 'Med-Low', 'Medium', 'Med-High', 'High'],
  climate:  ['Cool', 'Moderate', 'Warm', 'Hot']
};

const COLUMNS = [
  { key: 'kind',    label: 'Type',    type: 'kind'  },
  /* "Hue" rather than "Colour": Champagne genuinely is a white wine, but a tile
   * reading Colour: White next to Type: Sparkling reads as a contradiction to
   * anyone who files sparkling as its own category. Hue says the same thing
   * without arguing with the Type tile - and rosé Champagne then reads
   * Hue: Rosé, Type: Sparkling, which is exactly right. */
  { key: 'color',   label: 'Hue',     type: 'exact' },
  { key: 'grape',   label: 'Grape',   type: 'exact' },
  { key: 'country', label: 'Country', type: 'geo'   },
  { key: 'region',  label: 'Region',  type: 'exact' },
  { key: 'body',    label: 'Body',    type: 'ord'   },
  { key: 'tannin',  label: 'Tannin',  type: 'ord'   },
  { key: 'acidity', label: 'Acidity', type: 'ord'   },
  { key: 'climate', label: 'Climate', type: 'ord'   },
  { key: 'flavors', label: 'Aromas',  type: 'set'   }
];

const EMOJI = { hit: '\u{1F7E5}', near: '\u{1F7E8}', miss: '⬜' };

/* ---------- comparison engine ---------- */

/* Type separates a grape variety from a wine, and among wines separates still
 * from sparkling, fortified and sweet. Two different wine styles score close:
 * knowing you are hunting a wine rather than a grape is real progress even
 * when the style is wrong. */
function cmpKind(g, a) {
  if (g === a) return { state: 'hit', text: g };
  const bothWines = g !== 'Grape' && a !== 'Grape';
  return { state: bothWines ? 'near' : 'miss', text: g };
}

function cmpExact(g, a) {
  return { state: g === a ? 'hit' : 'miss', text: g };
}

function cmpGeo(g, a, guess, answer) {
  if (g === a) return { state: 'hit', text: g };
  if (guess.continent === answer.continent) return { state: 'near', text: g };
  return { state: 'miss', text: g };
}

function cmpOrd(g, a, key) {
  const text = ORD_LABELS[key][g - 1];
  if (g === a) return { state: 'hit', text };
  const arrow = g < a ? '↑' : '↓';
  return { state: Math.abs(g - a) === 1 ? 'near' : 'miss', text, arrow };
}

/* Aromas score in two steps: an exact term, or the right family with the wrong
 * term. Placing the family is real progress in tasting, and treating Lemon
 * against Citrus as a total miss threw that information away. */
function cmpSet(g, a) {
  const shared = g.filter(f => a.includes(f));
  if (shared.length === a.length && g.length === a.length) {
    return { state: 'hit', text: 'all ' + a.length, shared: shared, kin: [],
             detail: shared.join(', ') };
  }

  const missedByAnswer = a.filter(f => !shared.includes(f));
  const kin = [];
  const claimed = [];
  g.filter(f => !shared.includes(f)).forEach(f => {
    const fam = AROMA_FAMILY[f];
    const match = missedByAnswer.find(x => AROMA_FAMILY[x] === fam && !claimed.includes(x));
    if (match) { claimed.push(match); kin.push({ term: f, family: fam }); }
  });

  const detail = [
    shared.length ? shared.join(', ') : '',
    kin.length ? kin.map(k => k.term + ' \u2192 ' + k.family.toLowerCase()).join(', ') : ''
  ].filter(Boolean).join('; ');

  if (!shared.length && !kin.length) return { state: 'miss', text: 'none', shared: [], kin: [], detail: '' };
  if (!shared.length) {
    return { state: 'near', text: kin.length + ' related', shared: [], kin: kin, detail: detail };
  }
  return { state: 'near', text: shared.length + ' of ' + a.length,
           shared: shared, kin: kin, detail: detail };
}

function compare(guess, answer) {
  return COLUMNS.map(col => {
    const g = guess[col.key], a = answer[col.key];
    let r;
    if (col.type === 'kind')       r = cmpKind(g, a);
    else if (col.type === 'exact') r = cmpExact(g, a);
    else if (col.type === 'geo')   r = cmpGeo(g, a, guess, answer);
    else if (col.type === 'ord')   r = cmpOrd(g, a, col.key);
    else                           r = cmpSet(g, a);
    return Object.assign({ label: col.label }, r);
  });
}

/* ---------- daily puzzle selection ---------- */

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const rand = mulberry32(xmur3('winedle-' + seed)());
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function dayNumber(date) {
  const d = date || new Date();
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((utc - EPOCH) / 86400000);
}

/* The week runs easy, medium, easy, medium, easy, medium, specialist. An
 * 85-grape bank drawn flat would hand a first-time player Rkatsiteli and lose
 * them; this keeps six days in seven approachable while the deep cuts still
 * come round. Tier 3 is always reachable in the archive and in practice. */
const TIER_WEEK = [1, 2, 1, 2, 1, 2, 3];

function tierPool(tier) {
  return WINES.filter(w => w.tier === tier);
}

function tierForDay(day) {
  return TIER_WEEK[((day % 7) + 7) % 7];
}

/* How many earlier days drew from this same tier - each tier walks its own
 * deck, so no tier repeats until its pool is spent. */
function indexWithinTier(day, tier) {
  const perWeek = TIER_WEEK.filter(t => t === tier).length;
  const weeks = Math.floor(day / 7);
  let within = 0;
  for (let i = 0; i < day % 7; i++) if (TIER_WEEK[i] === tier) within++;
  return weeks * perWeek + within;
}

/* Shuffle a fresh deck each cycle so nothing repeats until the pool is spent,
 * and the order is not guessable from the source order. */
function puzzleFor(day) {
  const d = Math.max(0, day);
  const tier = tierForDay(d);
  const pool = tierPool(tier);
  const n = pool.length;
  const i = indexWithinTier(d, tier);
  const deck = seededShuffle(pool, tier * 1000 + Math.floor(i / n));
  return deck[i % n];
}

/* ---------- name resolution ---------- */

function normalize(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
          .toLowerCase().replace(/[^a-z0-9]/g, '');
}

const INDEX = (function () {
  const map = new Map();
  WINES.forEach(w => {
    map.set(normalize(w.name), w);
    (w.alsoKnownAs || []).forEach(alias => {
      if (!map.has(normalize(alias))) map.set(normalize(alias), w);
    });
  });
  return map;
})();

function resolve(input) {
  return INDEX.get(normalize(input)) || null;
}

function suggest(query, exclude) {
  const q = normalize(query);
  if (!q) return [];
  const out = [];
  const seen = new Set(exclude || []);
  WINES.forEach(w => {
    if (seen.has(w.name)) return;
    const hitName = normalize(w.name).includes(q);
    const alias = (w.alsoKnownAs || []).find(a => normalize(a).includes(q));
    if (hitName || alias) {
      out.push({ wine: w, via: hitName ? null : alias });
      seen.add(w.name);
    }
  });
  return out.slice(0, 8);
}

/* ---------- deduction ---------- */

/* Two wines are indistinguishable from a given guess when that guess would
 * score identically against both. Comparing signatures is what lets the board
 * say how much of the field is still standing. */
function tileSignature(guess, candidate) {
  return compare(guess, candidate)
    .map(t => t.state + (t.arrow || '') + (t.detail || ''))
    .join('|');
}

/* Every wine that would have produced exactly the feedback already on screen.
 * Pure in its arguments so it can be tested without a browser. */
function candidatesFor(guessNames, answer) {
  if (!guessNames.length) return WINES.slice();
  const played = guessNames.map(n => WINES.find(w => w.name === n));
  const target = played.map(g => tileSignature(g, answer));
  return WINES.filter(c => played.every((g, i) => tileSignature(g, c) === target[i]));
}

/* Of the aromas the answer has and the guess lacks, reveal whichever rules out
 * the most of the remaining field - a hint that halves the candidates beats one
 * that confirms something nearly everything shares. */
function bestAroma(guess, answer, revealed, pool) {
  const fresh = answer.flavors.filter(f => !guess.flavors.includes(f) && !revealed.has(f));
  if (!fresh.length) return null;
  let best = fresh[0];
  let bestLeft = Infinity;
  fresh.forEach(f => {
    const left = pool.filter(c => c.flavors.includes(f)).length;
    if (left < bestLeft) { bestLeft = left; best = f; }
  });
  return best;
}

/* A challenge link carries the wine in the URL. Base64 rather than the plain
 * name so the answer is not sitting in the address bar, URL-safe so it
 * survives being pasted into a chat window, and UTF-8 aware because btoa alone
 * throws on Nero d'Avola's typographic apostrophe. */
function encodeName(name) {
  const bytes = new TextEncoder().encode(name);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function decodeName(token) {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - padded.length % 4) % 4));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return null;
  }
}

function wineFromToken(token) {
  const name = token && decodeName(token);
  return (name && WINES.find(w => w.name === name)) || null;
}

/* Practice draws at random from the whole bank, but leans toward wines you
 * have already failed - a daily puzzle is a habit, revision needs volume and
 * repetition of the things you got wrong. Takes its randomness as an argument
 * so it can be tested. */
const PRACTICE_MISS_BIAS = 0.4;

function practicePick(rand, misses) {
  const missed = Object.keys(misses || {})
    .map(n => WINES.find(w => w.name === n))
    .filter(Boolean);
  if (missed.length && rand() < PRACTICE_MISS_BIAS) {
    return missed[Math.floor(rand() * missed.length)];
  }
  return WINES[Math.floor(rand() * WINES.length)];
}

/* ---------- persistence ---------- */

const KEY_STATE = 'winedle:state';
const KEY_STATS = 'winedle:stats';
const KEY_MISSES = 'winedle:misses';
const KEY_MET = 'winedle:met';

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (e) { return fallback; }
}

function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

function blankStats() {
  return { played: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0,0,0,0,0,0], lastDay: null };
}

function recordResult(won, guessCount, day, live) {
  const s = readJSON(KEY_STATS, blankStats());
  /* Replaying the archive must not inflate a streak that is about the daily. */
  if (!live || s.lastDay === day) return s;
  s.played++;
  if (won) {
    s.wins++;
    s.dist[guessCount - 1]++;
    s.streak = (s.lastDay === day - 1) ? s.streak + 1 : 1;
    s.maxStreak = Math.max(s.maxStreak, s.streak);
  } else {
    s.streak = 0;
  }
  s.lastDay = day;
  writeJSON(KEY_STATS, s);
  return s;
}

/* ---------- game state ---------- */

const TODAY = dayNumber();

/* ?d=<n> replays an archived puzzle. Clamped to the schedule's own range so a
 * hand-edited URL cannot land on an undefined day. */
const query = new URLSearchParams(location.search);
const CHALLENGE = wineFromToken(query.get('w'));
const IS_CHALLENGE = !!CHALLENGE;
const IS_PRACTICE = !IS_CHALLENGE && query.get('mode') === 'practice';
const asked = parseInt(query.get('d'), 10);
const DAY = Number.isInteger(asked) ? Math.min(Math.max(asked, 0), TODAY) : TODAY;
const IS_ARCHIVE = DAY !== TODAY;

/* Archived plays get their own slot, so replaying one never overwrites the
 * live puzzle and never touches the streak. */
const STATE_KEY = IS_CHALLENGE ? KEY_STATE + ':w:' + query.get('w')
  : IS_PRACTICE ? KEY_STATE + ':practice'
  : IS_ARCHIVE ? KEY_STATE + ':' + DAY
  : KEY_STATE;

function dateForDay(d) {
  return new Date(EPOCH + d * 86400000);
}

let state = readJSON(STATE_KEY, null);
const stateFits = state && (
  IS_CHALLENGE ? state.answer === CHALLENGE.name
  : IS_PRACTICE ? state.mode === 'practice'
  : state.day === DAY);

if (!stateFits) {
  state = IS_CHALLENGE
    ? { mode: 'challenge', guesses: [], status: 'playing', answer: CHALLENGE.name }
    : IS_PRACTICE
    ? { mode: 'practice', guesses: [], status: 'playing',
        answer: practicePick(Math.random, readJSON(KEY_MISSES, {})).name }
    : { day: DAY, guesses: [], status: 'playing', answer: puzzleFor(DAY).name };
  writeJSON(STATE_KEY, state);
}

/* Pin the answer to whatever this player started on. The schedule is derived
 * from the bank, so adding a grape mid-day reshuffles it - and a player halfway
 * through would otherwise have the answer swapped underneath them. Falls back
 * to the schedule for states saved before this field existed. */
const ANSWER = (state.answer && WINES.find(w => w.name === state.answer)) || puzzleFor(DAY);
if (state.answer !== ANSWER.name) {
  state.answer = ANSWER.name;
  writeJSON(STATE_KEY, state);
}

/* ---------- rendering ---------- */

/* ---------- hints ---------- */

/* Near-misses reveal an aroma the answer carries and the guess did not, one at
 * a time and never the same one twice. Once the aromas are spent, fall back to
 * oak — the one recorded attribute the grid never scores. */
function hintFor(guess, tiles, revealed, pool) {
  const hits = tiles.filter(t => t.state === 'hit').length;
  if (hits < HINT_AT) return null;
  const aroma = bestAroma(guess, ANSWER, revealed, pool);
  if (aroma) {
    revealed.add(aroma);
    return { kind: 'aroma', value: aroma };
  }
  if (!revealed.has('\u0000oak')) {
    revealed.add('\u0000oak');
    return { kind: 'oak', value: ANSWER.oak };
  }
  return null;
}

const $ = sel => document.querySelector(sel);
const board = $('#board');
const input = $('#guess-input');
const sugBox = $('#suggestions');
const endPanel = $('#end-panel');
const counter = $('#counter');
const noticeEl = $('#notice');
const remaining = $('#remaining');
const announcer = $('#announcer');

/* The board re-renders in full on every guess, so it must not be a live region -
 * that would re-read every previous row. Announce just what changed. */
function announce(wine, tiles) {
  const exact = tiles.filter(t => t.state === 'hit').map(t => t.label.toLowerCase());
  announcer.textContent = wine.name + ', ' + exact.length + ' of ' + tiles.length +
    ' exact' + (exact.length ? ': ' + exact.join(', ') : '') + '.';
}

const STATE_WORD = { hit: 'exact match', near: 'close', miss: 'no match' };
const STATE_MARK = { hit: '\u2713', near: '\u2248', miss: '' };

function tileLabel(t) {
  let s = t.label + ': ' + t.text + ', ' + STATE_WORD[t.state];
  if (t.arrow) s += ', answer is ' + (t.arrow === '\u2191' ? 'higher' : 'lower');
  if (t.detail) s += ' (' + t.detail + ')';
  return s;
}

function tileEl(t, delay) {
  const el = document.createElement('div');
  el.className = 'tile tile--' + t.state;
  el.style.animationDelay = delay + 'ms';
  el.setAttribute('role', 'listitem');
  el.setAttribute('aria-label', tileLabel(t));
  if (t.detail) el.title = t.detail;
  if (STATE_MARK[t.state]) {
    const mark = document.createElement('span');
    mark.className = 'tile__mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = STATE_MARK[t.state];
    el.appendChild(mark);
  }
  const lab = document.createElement('span');
  lab.className = 'tile__label';
  lab.textContent = t.label;
  const val = document.createElement('span');
  val.className = 'tile__value';
  val.textContent = t.text;
  el.appendChild(lab);
  el.appendChild(val);
  if (t.arrow) {
    const ar = document.createElement('span');
    ar.className = 'tile__arrow';
    ar.textContent = t.arrow;
    el.appendChild(ar);
  }
  return el;
}

/* One caption block under the tiles rather than two floating callouts: a
 * tiny-caps label in the tile's own type, then the detail. Reads as part of
 * the row instead of something stuck to it. */
function noteLine(label, body, kind) {
  const line = document.createElement('p');
  line.className = 'note' + (kind ? ' note--' + kind : '');
  const tag = document.createElement('span');
  tag.className = 'note__label';
  tag.textContent = label;
  const text = document.createElement('span');
  text.className = 'note__body';
  text.textContent = body;
  line.appendChild(tag);
  line.appendChild(text);
  return line;
}

function hintEl(hint) {
  return hint.kind === 'aroma'
    ? noteLine('Hint', 'the answer shows ' + hint.value.toLowerCase(), 'hint')
    : noteLine('Hint', 'oak on the answer is ' + hint.value.toLowerCase(), 'hint');
}

/* The aroma tile can only fit a count. Desktop gets the names on hover, so
 * without this a phone is simply told less about the same guess. */
function aromaLine(tiles) {
  const t = tiles.find(x => x.label === 'Aromas');
  if (!t || t.state === 'miss') return null;
  const parts = [];
  if (t.shared && t.shared.length) parts.push(t.shared.join(', ').toLowerCase());
  if (t.kin && t.kin.length) {
    parts.push(t.kin.map(k => k.term.toLowerCase() + ' \u2192 ' + k.family.toLowerCase()).join(', '));
  }
  if (!parts.length) return null;
  return noteLine('Aromas', parts.join(' \u00b7 '));
}

function rowEl(wine, tiles, animate) {
  const row = document.createElement('article');
  row.className = 'row' + (animate ? ' row--new' : '');

  const name = document.createElement('h2');
  name.className = 'row__name';
  name.textContent = wine.name;
  row.appendChild(name);

  const grid = document.createElement('div');
  grid.className = 'row__tiles';
  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', 'How ' + wine.name + ' scored');
  tiles.forEach((t, i) => grid.appendChild(tileEl(t, animate ? i * 90 : 0)));
  row.appendChild(grid);
  const notes = document.createElement('div');
  notes.className = 'row__notes';
  const shared = aromaLine(tiles);
  if (shared) notes.appendChild(shared);
  row.appendChild(notes);
  return row;
}

function render(animateLast) {
  board.innerHTML = '';
  const revealed = new Set();
  state.guesses.forEach((n, i) => {
    const wine = WINES.find(w => w.name === n);
    const tiles = compare(wine, ANSWER);
    const row = rowEl(wine, tiles, animateLast && i === state.guesses.length - 1);
    if (wine.name !== ANSWER.name) {
      const hint = hintFor(wine, tiles, revealed, candidatesFor(state.guesses, ANSWER));
      if (hint) row.querySelector('.row__notes').appendChild(hintEl(hint));
    }
    board.appendChild(row);
  });
  counter.textContent = state.status === 'playing'
    ? (MAX_GUESSES - state.guesses.length) + ' left'
    : state.guesses.length + '/' + MAX_GUESSES;

  /* How much of the field is still standing. Held back until the player has
   * spent half their guesses - see REMAINING_AFTER. */
  if (state.status === 'playing' && state.guesses.length >= REMAINING_AFTER) {
    const n = candidatesFor(state.guesses, ANSWER).length;
    remaining.textContent = n === 1 ? '1 answer still fits' : n + ' answers still fit';
    remaining.hidden = false;
  } else {
    remaining.hidden = true;
  }
  if (state.status !== 'playing') showEnd();
}

/* A shared result is useless if the recipient cannot find the game. Prefer the
 * address it is actually being played at, so a fork or a custom domain shares
 * itself rather than the original. */
const SHARE_URL = /^https?:$/.test(location.protocol)
  ? location.origin + location.pathname.replace(/index\.html$/, '')
  : 'https://leemoose.github.io/winedle/';

function shareText() {
  const grid = state.guesses.map(n => {
    const wine = WINES.find(w => w.name === n);
    return compare(wine, ANSWER).map(t => EMOJI[t.state]).join('');
  }).join('\n');
  const score = state.status === 'won' ? state.guesses.length + '/' + MAX_GUESSES : 'X/' + MAX_GUESSES;
  const url = IS_ARCHIVE ? SHARE_URL + '?d=' + DAY : SHARE_URL;
  return 'Winedle #' + DAY + '  ' + score + '\n\n' + grid + '\n\n' + url;
}

/* What you missed comes back sooner in practice; what you got, stops nagging.
 * Solves are also tallied permanently - a streak says how consistent you have
 * been, but the tally says which of the bank you can actually name, which is
 * the part worth knowing if you are revising. */
function recordOutcome(won) {
  const misses = readJSON(KEY_MISSES, {});
  if (won) delete misses[ANSWER.name];
  else misses[ANSWER.name] = (misses[ANSWER.name] || 0) + 1;
  writeJSON(KEY_MISSES, misses);

  if (won) {
    const met = readJSON(KEY_MET, {});
    met[ANSWER.name] = (met[ANSWER.name] || 0) + 1;
    writeJSON(KEY_MET, met);
  }
}

/* navigator.clipboard rejects for reasons the page cannot control: focus lost
 * to another window, Safari's stricter activation rules, a denied permission.
 * Reporting success either way - which this did - is how a "copied" challenge
 * link ends up never reaching the person it was meant for. On failure, put the
 * text on screen, selected, so it can still be copied by hand. */
function offerCopy(button, text, label) {
  const flash = msg => {
    button.textContent = msg;
    setTimeout(() => { button.textContent = label; }, 1800);
  };

  const fallback = () => {
    button.textContent = label;
    const multiline = text.indexOf('\n') !== -1;
    let box = endPanel.querySelector('.copy-fallback');
    if (!box || (box.tagName === 'TEXTAREA') !== multiline) {
      if (box) box.remove();
      box = document.createElement(multiline ? 'textarea' : 'input');
      box.className = 'copy-fallback';
      if (multiline) box.rows = 8;
      box.readOnly = true;
      endPanel.appendChild(box);
    }
    box.value = text;
    box.hidden = false;
    box.focus();
    box.select();
  };

  const attempt = navigator.clipboard && window.isSecureContext
    ? navigator.clipboard.writeText(text)
    : Promise.reject(new Error('clipboard unavailable'));

  attempt.then(() => flash('Copied'), fallback);
}

function showEnd() {
  const won = state.status === 'won';
  recordOutcome(won);
  const stats = recordResult(won, state.guesses.length, DAY, !IS_ARCHIVE && !IS_PRACTICE && !IS_CHALLENGE);
  const pct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  endPanel.innerHTML = '';
  endPanel.hidden = false;

  const verdict = document.createElement('p');
  verdict.className = 'end__verdict';
  verdict.textContent = won
    ? ['Uncanny.', 'Sharp palate.', 'Well judged.', 'Got there.', 'Close run.', 'By the skin of your teeth.'][state.guesses.length - 1]
    : 'Not this time.';
  endPanel.appendChild(verdict);

  const card = document.createElement('div');
  card.className = 'reveal';
  card.innerHTML =
    '<p class="reveal__eyebrow">' +
      (IS_ARCHIVE || IS_PRACTICE || IS_CHALLENGE ? 'The ' : 'Today’s ') +
      (ANSWER.kind === 'Grape' ? 'grape' : 'wine') + '</p>' +
    '<h3 class="reveal__name">' + ANSWER.name + '</h3>' +
    '<p class="reveal__origin">' + ANSWER.region + ', ' + ANSWER.country + '</p>' +
    '<p class="reveal__note">' + ANSWER.note + '</p>' +
    '<dl class="reveal__meta">' +
      '<div><dt>Oak</dt><dd>' + ANSWER.oak + '</dd></div>' +
      '<div><dt>Aromas</dt><dd>' + ANSWER.flavors.join(', ') + '</dd></div>' +
      (ANSWER.alsoKnownAs.length
        ? '<div><dt>Also called</dt><dd>' + ANSWER.alsoKnownAs.join(', ') + '</dd></div>' : '') +
    '</dl>';
  endPanel.appendChild(card);

  const bar = document.createElement('div');
  bar.className = 'stats';
  if (IS_PRACTICE || IS_CHALLENGE) bar.hidden = true;
  bar.innerHTML =
    '<div><strong>' + stats.played + '</strong><span>Played</span></div>' +
    '<div><strong>' + pct + '%</strong><span>Won</span></div>' +
    '<div><strong>' + stats.streak + '</strong><span>Streak</span></div>' +
    '<div><strong>' + stats.maxStreak + '</strong><span>Best</span></div>';
  endPanel.appendChild(bar);

  if (IS_CHALLENGE) {
    const back = document.createElement('p');
    back.className = 'countdown';
    back.innerHTML = '<a href="' + SELF + '">Play today\u2019s wine</a>';
    endPanel.appendChild(back);
  } else if (IS_PRACTICE) {
    const again = document.createElement('button');
    again.className = 'share';
    again.textContent = 'Another wine';
    again.addEventListener('click', () => {
      try { localStorage.removeItem(STATE_KEY); } catch (e) {}
      location.reload();
    });
    endPanel.appendChild(again);
  } else if (IS_ARCHIVE) {
    const back = document.createElement('p');
    back.className = 'countdown';
    back.innerHTML = '<a href="' + dayHref(TODAY) + '">Back to today\u2019s wine</a>';
    endPanel.appendChild(back);
  } else {
    const clock = document.createElement('p');
    clock.className = 'countdown';
    endPanel.appendChild(clock);
    startCountdown(clock);
  }

  reportAndShow(won, state.guesses.length);

  /* Pass this exact wine on to someone else. Works from any mode, because the
   * wine travels in the link rather than depending on the date. */
  const challenge = document.createElement('button');
  challenge.className = 'share share--ghost';
  challenge.textContent = 'Challenge a friend';
  challenge.addEventListener('click', () => {
    offerCopy(challenge, SHARE_URL + '?w=' + encodeName(ANSWER.name), 'Challenge a friend');
  });
  endPanel.appendChild(challenge);

  /* Nothing to share from practice or a challenge: the grid would be stamped
   * with a daily puzzle number it does not belong to. */
  if (IS_PRACTICE || IS_CHALLENGE) return;

  const btn = document.createElement('button');
  btn.className = 'share';
  btn.textContent = 'Copy result';
  btn.addEventListener('click', () => offerCopy(btn, shareText(), 'Copy result'));
  endPanel.appendChild(btn);
}

/* Puzzles roll over at local midnight, matching how DAY is derived. */
function startCountdown(el) {
  function tick() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const left = next - now;
    const pad = n => String(n).padStart(2, '0');
    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    el.textContent = 'Next wine in ' + pad(h) + ':' + pad(m) + ':' + pad(s);
    /* `next` is recomputed every tick, so `left` never reaches zero - compare
     * the day instead, or the page sits on a stale puzzle past midnight. */
    if (dayNumber() !== DAY) location.reload();
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- archive ---------- */

const ARCHIVE_SHOWN = 30;

/* Link relative to the file actually being viewed, not to the directory: the
 * portable dist/winedle.html copy is not an index, so './' would 404 there. */
const SELF = location.pathname;
const dayHref = d => (d === TODAY ? SELF : SELF + '?d=' + d);

function statusOf(day) {
  const s = readJSON(day === TODAY ? KEY_STATE : KEY_STATE + ':' + day, null);
  if (!s || s.day !== day || s.status === 'playing') return null;
  return s.status;
}

function renderArchive() {
  const list = $('#archive-list');
  if (!list) return;
  list.innerHTML = '';
  for (let d = TODAY; d > Math.max(-1, TODAY - ARCHIVE_SHOWN); d--) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = dayHref(d);
    a.textContent = 'No. ' + d;
    const when = document.createElement('span');
    when.className = 'archive-list__date';
    when.textContent = dateForDay(d).toLocaleDateString(undefined,
      { day: 'numeric', month: 'short', timeZone: 'UTC' });
    const st = statusOf(d);
    const mark = document.createElement('span');
    mark.className = 'archive-list__mark';
    mark.textContent = st === 'won' ? '\u2713' : st === 'lost' ? '\u2715' : '';
    if (st) a.classList.add('is-done');
    if (d === DAY) li.className = 'is-current';
    li.appendChild(a);
    li.appendChild(when);
    li.appendChild(mark);
    list.appendChild(li);
  }
}

function renderArchiveNav() {
  const nav = $('#archive-nav');
  if (!nav || !IS_ARCHIVE) return;
  nav.hidden = false;
  const bits = [];
  if (DAY > 0) bits.push('<a href="' + dayHref(DAY - 1) + '">\u2190 No. ' + (DAY - 1) + '</a>');
  bits.push('<a href="' + dayHref(TODAY) + '">Today</a>');
  if (DAY < TODAY) bits.push('<a href="' + dayHref(DAY + 1) + '">No. ' + (DAY + 1) + ' \u2192</a>');
  nav.innerHTML = 'Archive \u00b7 ' + bits.join('<span class="sep">\u00b7</span>');
}

/* ---------- cellar book ---------- */

function renderStats() {
  const s = readJSON(KEY_STATS, blankStats());
  const pct = s.played ? Math.round((s.wins / s.played) * 100) : 0;
  $('#stats-summary').innerHTML =
    '<div><strong>' + s.played + '</strong><span>Played</span></div>' +
    '<div><strong>' + pct + '%</strong><span>Won</span></div>' +
    '<div><strong>' + s.streak + '</strong><span>Streak</span></div>' +
    '<div><strong>' + s.maxStreak + '</strong><span>Best</span></div>';

  const peak = Math.max(1, ...s.dist);
  const solvedToday = !IS_ARCHIVE && state.status === 'won' ? state.guesses.length : 0;
  $('#stats-histogram').innerHTML = s.dist.map(function (n, i) {
    const pctW = Math.round((n / peak) * 100);
    return '<div class="bar' + (i + 1 === solvedToday ? ' is-latest' : '') + '">' +
      '<span class="bar__n">' + (i + 1) + '</span>' +
      '<span class="bar__fill" style="width:' + Math.max(pctW, n ? 8 : 2) + '%">' +
      '<span class="bar__count">' + n + '</span></span></div>';
  }).join('');
}

/* The bank, alphabetically, marked with what you have solved. Every name is
 * already reachable through the typeahead, so listing the unmet ones gives
 * nothing away - it just makes the gap visible. */
function renderMet() {
  const met = readJSON(KEY_MET, {});
  const solved = WINES.filter(w => met[w.name]);
  $('#met-count').textContent = solved.length + ' of ' + WINES.length +
    ' (' + Math.round((solved.length / WINES.length) * 100) + '%)';

  const list = $('#met-list');
  list.innerHTML = '';
  WINES.slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(w => {
      const times = met[w.name] || 0;
      const li = document.createElement('li');
      li.className = 'met' + (times ? ' is-met' : '');
      const name = document.createElement('span');
      name.textContent = w.name;
      const tally = document.createElement('span');
      tally.className = 'met__tally';
      tally.textContent = times > 1 ? '\u00d7' + times : times ? '\u2713' : '';
      li.appendChild(name);
      li.appendChild(tally);
      list.appendChild(li);
    });
}

const statsDialog = $('#stats-dialog');
$('#stats-open').addEventListener('click', () => { renderStats(); renderMet(); statsDialog.showModal(); });
$('#stats-close').addEventListener('click', () => statsDialog.close());
statsDialog.addEventListener('click', e => { if (e.target === statsDialog) statsDialog.close(); });

/* ---------- optional integrations ---------- */

/* Page-view analytics. Loaded only if a site code is configured, and only for
 * the real daily puzzle - counting archive replays and practice rounds would
 * make the numbers meaningless. */
function loadAnalytics() {
  if (!CONFIG.GOATCOUNTER || !/^https?:$/.test(location.protocol)) return;
  const s = document.createElement('script');
  s.async = true;
  s.dataset.goatcounter = 'https://' + CONFIG.GOATCOUNTER + '.goatcounter.com/count';
  s.src = 'https://gc.zgo.at/count.js';
  document.head.appendChild(s);
}

/* Aggregate counts, posted once per finished daily puzzle. The payload is a day
 * number, a guess count and a boolean - nothing that identifies a player and
 * nothing that says which wine it was. */
const KEY_REPORTED = 'winedle:reported';

function reportAndShow(won, guessCount) {
  if (!CONFIG.COUNTER_URL || IS_ARCHIVE || IS_PRACTICE || IS_CHALLENGE) return;

  const reported = readJSON(KEY_REPORTED, {});
  const already = reported[DAY] === true;

  const target = CONFIG.COUNTER_URL.replace(/\/$/, '');
  const request = already
    ? fetch(target + '/stats?day=' + DAY)
    : fetch(target + '/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: DAY, guesses: guessCount, won: won })
      });

  request
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      if (!data || typeof data.plays !== 'number') return;
      if (!already) {
        reported[DAY] = true;
        writeJSON(KEY_REPORTED, reported);
      }
      showCrowd(data, won, guessCount);
    })
    .catch(() => {});   /* offline, blocked, or not deployed - say nothing */
}

function showCrowd(data, won, guessCount) {
  if (!data.plays) return;
  const line = document.createElement('p');
  line.className = 'crowd';

  const bits = [data.plays.toLocaleString() + (data.plays === 1 ? ' player today' : ' players today')];
  if (won && data.wins) {
    const better = data.dist.slice(0, guessCount - 1).reduce((a, b) => a + b, 0);
    const share = Math.round((better / data.wins) * 100);
    bits.push(share === 0 ? 'nobody solved it faster' : share + '% solved it faster');
  }
  line.textContent = bits.join(' \u00b7 ');
  endPanel.appendChild(line);
}

/* ---------- input ---------- */

function submitGuess(wine) {
  if (state.status !== 'playing') return;
  if (state.guesses.includes(wine.name)) return;
  state.guesses.push(wine.name);
  if (wine.name === ANSWER.name) state.status = 'won';
  else if (state.guesses.length >= MAX_GUESSES) state.status = 'lost';
  writeJSON(STATE_KEY, state);
  input.value = '';
  activeIdx = 0;
  notice('');
  renderSuggestions([]);
  render(true);
  announce(wine, compare(wine, ANSWER));
  if (state.status !== 'playing') {
    input.disabled = true;
    input.placeholder = 'Back tomorrow';
  }
}

/* The suggestion list is a combobox: arrow keys move the selection, Enter takes
 * it, Escape dismisses. activeIdx is the only piece of state that matters. */
let currentList = [];
let activeIdx = 0;

function renderSuggestions(list) {
  currentList = list;
  if (activeIdx >= list.length) activeIdx = 0;
  sugBox.innerHTML = '';
  sugBox.hidden = list.length === 0;
  input.setAttribute('aria-expanded', String(list.length > 0));
  list.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'suggestion' + (i === activeIdx ? ' is-active' : '');
    li.id = 'suggestion-' + i;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(i === activeIdx));
    li.textContent = s.wine.name;
    if (s.via) {
      const via = document.createElement('em');
      via.textContent = ' \u2014 ' + s.via;
      li.appendChild(via);
    }
    li.addEventListener('mousedown', e => { e.preventDefault(); submitGuess(s.wine); });
    sugBox.appendChild(li);
  });
  input.setAttribute('aria-activedescendant', list.length ? 'suggestion-' + activeIdx : '');
}

function moveActive(delta) {
  if (!currentList.length) return;
  activeIdx = (activeIdx + delta + currentList.length) % currentList.length;
  renderSuggestions(currentList);
  const el = sugBox.children[activeIdx];
  if (el) el.scrollIntoView({ block: 'nearest' });
}

/* Silent failure is the worst outcome for a typed guess - say what went wrong. */
function notice(msg) {
  noticeEl.textContent = msg || '';
  noticeEl.hidden = !msg;
  if (!msg) return;
  input.classList.remove('is-wrong');
  void input.offsetWidth;
  input.classList.add('is-wrong');
}

input.addEventListener('input', () => {
  notice('');
  activeIdx = 0;
  renderSuggestions(suggest(input.value, state.guesses));
});

input.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); return moveActive(1); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); return moveActive(-1); }
  if (e.key === 'Escape')    { renderSuggestions([]); return notice(''); }
  if (e.key !== 'Enter') return;
  e.preventDefault();

  const typed = input.value.trim();
  if (!typed) return;

  const exact = resolve(typed);
  if (exact) {
    if (state.guesses.includes(exact.name)) return notice('Already guessed ' + exact.name + '.');
    return submitGuess(exact);
  }
  if (currentList.length) return submitGuess(currentList[activeIdx].wine);
  notice('Nothing by that name \u2014 keep typing, or pick from the list.');
});

input.addEventListener('blur', () => setTimeout(() => renderSuggestions([]), 120));

if (IS_CHALLENGE) {
  $('#puzzle-no').textContent = 'Challenge';
  $('#puzzle-date').textContent = 'Sent by a friend';
} else if (IS_PRACTICE) {
  $('#puzzle-no').textContent = 'Practice';
  $('#puzzle-date').textContent = 'No streak, no limit';
} else {
  $('#puzzle-no').textContent = 'No. ' + DAY;
  $('#puzzle-date').textContent = dateForDay(DAY).toLocaleDateString(undefined,
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
$('#mode-link').textContent = IS_PRACTICE ? 'Back to the daily' : 'Practice';
$('#mode-link').href = IS_PRACTICE ? SELF : SELF + '?mode=practice';
if (IS_ARCHIVE) document.body.classList.add('is-archive');
renderArchive();
renderArchiveNav();
if (!IS_ARCHIVE && !IS_PRACTICE && !IS_CHALLENGE) loadAnalytics();

/* A newcomer otherwise lands on a bare input with no idea what is wanted. */
if (!readJSON(KEY_STATS, null) && !state.guesses.length) {
  const howto = document.querySelector('.howto:not(.archive)');
  if (howto) howto.open = true;
}

/* Offline play and a home-screen icon. Registration is best-effort: it fails
 * harmlessly from file:// and from the portable single-file copy. */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

if (state.status !== 'playing') {
  input.disabled = true;
  input.placeholder = 'Back tomorrow';
}
render(false);

if (state.status === 'playing' && !matchMedia('(hover: none)').matches) input.focus();
