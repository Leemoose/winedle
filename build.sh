#!/bin/sh
# Build the served page: page.html + sources -> index.html, fully inlined.
#
# The site used to serve page.html with four separate <script>/<link> tags. That
# is one cache per file, and a browser holding a stale data/wines.js alongside a
# fresh src/game.js gets new code running against an old answer bank - which
# happened during development and would have shipped the same way. One inlined
# file cannot desynchronise with itself.
set -e
cd "$(dirname "$0")"

# Refuse to build on a failing suite - the bank keeps growing and an
# indistinguishable pair would make a puzzle unwinnable.
node test.js

python3 - <<'PY'
import re

html = open('page.html', encoding='utf-8').read()

css = open('src/style.css', encoding='utf-8').read()
html, n = re.subn(r'<link rel="stylesheet" href="src/style\.css">',
                  lambda m: '<style>\n' + css + '\n</style>', html)
assert n == 1, 'stylesheet link not found'

# Inline every local script in document order, whatever they are called.
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
assert scripts, 'no local scripts found'
bundle = '<script>\n' + '\n'.join(
    open(src, encoding='utf-8').read() for src in scripts) + '\n</script>'

first = html.index('<script src="%s"></script>' % scripts[0])
last = html.index('<script src="%s"></script>' % scripts[-1]) + \
       len('<script src="%s"></script>' % scripts[-1])
html = html[:first] + bundle + html[last:]

leftovers = re.findall(r'(?:src|href)="(?:src|data)/[^"]+"', html)
assert not leftovers, 'not inlined: %s' % leftovers

open('index.html', 'w', encoding='utf-8').write(html)
print('index.html', len(html), 'bytes —', len(scripts), 'scripts inlined')
PY
