/* Winedle anonymous counter.
 *
 * Deployed as a Cloudflare Worker with one KV namespace. It stores counts and
 * nothing else: no identifiers, no IP addresses, no wine names, no way to tie a
 * result to a person. The payload is a day number, a guess count and a boolean.
 *
 * Deliberately not a leaderboard. Everything in this game is client-side, so a
 * score can be forged with one fetch; a ranking would be fiction. Aggregate
 * counts survive that - forging them gains nobody anything.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS }
  });

/* Counts live under one key per day so a day rolls off cleanly and nothing
 * accumulates unboundedly. */
const keyFor = day => 'day:' + day;

const BLANK = { plays: 0, wins: 0, dist: [0, 0, 0, 0, 0, 0] };

async function read(env, day) {
  const raw = await env.WINEDLE.get(keyFor(day));
  if (!raw) return { ...BLANK, dist: [...BLANK.dist] };
  try {
    const parsed = JSON.parse(raw);
    return {
      plays: parsed.plays | 0,
      wins: parsed.wins | 0,
      dist: Array.isArray(parsed.dist) && parsed.dist.length === 6
        ? parsed.dist.map(n => n | 0)
        : [...BLANK.dist]
    };
  } catch (e) {
    return { ...BLANK, dist: [...BLANK.dist] };
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (request.method === 'GET' && url.pathname === '/stats') {
      const day = parseInt(url.searchParams.get('day'), 10);
      if (!Number.isInteger(day) || day < 0) return json({ error: 'bad day' }, 400);
      return json(await read(env, day));
    }

    if (request.method === 'POST' && url.pathname === '/play') {
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }

      const day = parseInt(body.day, 10);
      const guesses = parseInt(body.guesses, 10);
      const won = body.won === true;

      /* Reject anything outside the shape the game can actually produce, so a
       * stray or malicious post cannot skew the distribution. */
      if (!Number.isInteger(day) || day < 0 || day > 100000) return json({ error: 'bad day' }, 400);
      if (!Number.isInteger(guesses) || guesses < 1 || guesses > 6) return json({ error: 'bad guesses' }, 400);

      const current = await read(env, day);
      current.plays += 1;
      if (won) {
        current.wins += 1;
        current.dist[guesses - 1] += 1;
      }
      /* 60 days is long enough to look back at and short enough that storage
       * stays flat. */
      await env.WINEDLE.put(keyFor(day), JSON.stringify(current), { expirationTtl: 60 * 86400 });
      return json(current);
    }

    return json({ error: 'not found' }, 404);
  }
};
