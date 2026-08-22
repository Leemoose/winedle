# Winedle counter

A Cloudflare Worker holding aggregate play counts. Free tier is far beyond what
this needs (100k requests/day).

## Deploy

    cd worker
    npx wrangler login                       # opens a browser, one time
    npx wrangler kv namespace create WINEDLE # prints an id
    # paste that id into wrangler.jsonc
    npx wrangler deploy                      # prints the worker URL

Cloudflare refuses to deploy any Worker until the account's email address is
verified — deploy fails with error 10034 until you click the link Cloudflare
emails you.

Then put the URL into `COUNTER_URL` in `../src/config.js` and run `../build.sh`.

## API

    POST /play    {day, guesses, won}  -> {plays, wins, dist}
    GET  /stats?day=N                  -> {plays, wins, dist}

## What it stores

One record per day: a play count, a win count, and a six-bucket guess
distribution. No identifiers, no IP addresses, no wine names. Records expire
after 60 days.

## What it is not

A leaderboard. The game is entirely client-side, so any score can be forged
with a single fetch — a ranking would be fiction. Aggregates degrade gracefully
under that: forging them gains nobody anything.
