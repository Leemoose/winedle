/* Winedle - daily wine guessing game */
'use strict';

const MAX_GUESSES = 6;
/* A guess scoring this many exact tiles is close enough that the grid alone
 * stops being informative — surface something it does not already show. */
const HINT_AT = 6;
const EPOCH = Date.UTC(2026, 0, 1);

const ORD_LABELS = {
  colorInt: ['Pale', 'Light', 'Medium', 'Deep', 'Opaque'],
  body:     ['Light', 'Light-Med', 'Medium', 'Med-Full', 'Full'],
  tannin:   ['Low', 'Low-Med', 'Medium', 'Med-High', 'High'],
  acidity:  ['Low', 'Med-Low', 'Medium', 'Med-High', 'High'],
  climate:  ['Cool', 'Moderate', 'Warm', 'Hot']
};

const COLUMNS = [
  { key: 'color',    label: 'Colour',  type: 'exact' },
  { key: 'country',  label: 'Country', type: 'geo'   },
  { key: 'region',   label: 'Region',  type: 'exact' },
  { key: 'colorInt', label: 'Depth',   type: 'ord'   },
  { key: 'body',     label: 'Body',    type: 'ord'   },
  { key: 'tannin',   label: 'Tannin',  type: 'ord'   },
  { key: 'acidity',  label: 'Acidity', type: 'ord'   },
  { key: 'climate',  label: 'Climate', type: 'ord'   },
  { key: 'flavors',  label: 'Aromas',  type: 'set'   }
];

const EMOJI = { hit: '\u{1F7E5}', near: '\u{1F7E8}', miss: '⬜' };

/* ---------- comparison engine ---------- */

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

function cmpSet(g, a) {
  const shared = g.filter(f => a.includes(f));
  if (shared.length === a.length && g.length === a.length) {
    return { state: 'hit', text: 'all ' + a.length, detail: shared.join(', ') };
  }
  if (shared.length === 0) return { state: 'miss', text: 'none', detail: '' };
  return { state: 'near', text: shared.length + ' of ' + a.length, detail: shared.join(', ') };
}

function compare(guess, answer) {
  return COLUMNS.map(col => {
    const g = guess[col.key], a = answer[col.key];
    let r;
    if (col.type === 'exact')      r = cmpExact(g, a);
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

/* Shuffle a fresh deck each cycle so nothing repeats until the bank is spent,
 * and the order is not guessable from the source order. */
function puzzleFor(day) {
  const n = WINES.length;
  const deck = seededShuffle(WINES, Math.floor(day / n));
  return deck[((day % n) + n) % n];
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

/* ---------- persistence ---------- */

const KEY_STATE = 'winedle:state';
const KEY_STATS = 'winedle:stats';

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

function recordResult(won, guessCount, day) {
  const s = readJSON(KEY_STATS, blankStats());
  if (s.lastDay === day) return s;
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

const DAY = dayNumber();

let state = readJSON(KEY_STATE, null);
if (!state || state.day !== DAY) {
  state = { day: DAY, guesses: [], status: 'playing', answer: puzzleFor(DAY).name };
  writeJSON(KEY_STATE, state);
}

/* Pin the answer to whatever this player started on. The schedule is derived
 * from the bank, so adding a grape mid-day reshuffles it - and a player halfway
 * through would otherwise have the answer swapped underneath them. Falls back
 * to the schedule for states saved before this field existed. */
const ANSWER = (state.answer && WINES.find(w => w.name === state.answer)) || puzzleFor(DAY);
if (state.answer !== ANSWER.name) {
  state.answer = ANSWER.name;
  writeJSON(KEY_STATE, state);
}

/* ---------- rendering ---------- */

/* ---------- hints ---------- */

/* Near-misses reveal an aroma the answer carries and the guess did not, one at
 * a time and never the same one twice. Once the aromas are spent, fall back to
 * oak — the one recorded attribute the grid never scores. */
function hintFor(guess, tiles, revealed) {
  const hits = tiles.filter(t => t.state === 'hit').length;
  if (hits < HINT_AT) return null;
  const fresh = ANSWER.flavors.filter(f => !guess.flavors.includes(f) && !revealed.has(f));
  if (fresh.length) {
    revealed.add(fresh[0]);
    return { kind: 'aroma', value: fresh[0] };
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

function hintEl(hint) {
  const el = document.createElement('p');
  el.className = 'hint';
  if (hint.kind === 'aroma') {
    el.innerHTML = 'Close. The answer shows <strong>' +
      hint.value.toLowerCase() + '</strong> — your guess does not.';
  } else {
    el.innerHTML = 'Close. Oak on the answer: <strong>' +
      hint.value.toLowerCase() + '</strong>.';
  }
  return el;
}

/* The aroma tile can only fit a count. Desktop gets the names on hover, so
 * without this a phone is simply told less about the same guess. */
function aromaLine(tiles) {
  const t = tiles.find(x => x.label === 'Aromas');
  if (!t || t.state === 'miss' || !t.detail) return null;
  const el = document.createElement('p');
  el.className = 'row__shared';
  el.textContent = 'Shared aromas: ' + t.detail.toLowerCase() + '.';
  return el;
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
  const shared = aromaLine(tiles);
  if (shared) row.appendChild(shared);
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
      const hint = hintFor(wine, tiles, revealed);
      if (hint) row.appendChild(hintEl(hint));
    }
    board.appendChild(row);
  });
  counter.textContent = state.status === 'playing'
    ? (MAX_GUESSES - state.guesses.length) + ' left'
    : state.guesses.length + '/' + MAX_GUESSES;
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
  return 'Winedle #' + DAY + '  ' + score + '\n\n' + grid + '\n\n' + SHARE_URL;
}

function showEnd() {
  const won = state.status === 'won';
  const stats = recordResult(won, state.guesses.length, DAY);
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
    '<p class="reveal__eyebrow">Today’s wine</p>' +
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
  bar.innerHTML =
    '<div><strong>' + stats.played + '</strong><span>Played</span></div>' +
    '<div><strong>' + pct + '%</strong><span>Won</span></div>' +
    '<div><strong>' + stats.streak + '</strong><span>Streak</span></div>' +
    '<div><strong>' + stats.maxStreak + '</strong><span>Best</span></div>';
  endPanel.appendChild(bar);

  const clock = document.createElement('p');
  clock.className = 'countdown';
  endPanel.appendChild(clock);
  startCountdown(clock);

  const btn = document.createElement('button');
  btn.className = 'share';
  btn.textContent = 'Copy result';
  btn.addEventListener('click', () => {
    const text = shareText();
    const done = () => { btn.textContent = 'Copied'; setTimeout(() => btn.textContent = 'Copy result', 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
    else done();
  });
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

/* ---------- input ---------- */

function submitGuess(wine) {
  if (state.status !== 'playing') return;
  if (state.guesses.includes(wine.name)) return;
  state.guesses.push(wine.name);
  if (wine.name === ANSWER.name) state.status = 'won';
  else if (state.guesses.length >= MAX_GUESSES) state.status = 'lost';
  writeJSON(KEY_STATE, state);
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
  notice('No grape by that name \u2014 keep typing, or pick from the list.');
});

input.addEventListener('blur', () => setTimeout(() => renderSuggestions([]), 120));

$('#puzzle-no').textContent = 'No. ' + DAY;
$('#puzzle-date').textContent = new Date().toLocaleDateString(undefined,
  { day: 'numeric', month: 'long', year: 'numeric' });

if (state.status !== 'playing') {
  input.disabled = true;
  input.placeholder = 'Back tomorrow';
}
render(false);

if (state.status === 'playing' && !matchMedia('(hover: none)').matches) input.focus();
