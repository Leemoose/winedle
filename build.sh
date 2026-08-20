#!/bin/sh
# Inline data + css + js into one portable file at dist/winedle.html
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
import re
html = open('index.html').read()
css  = open('src/style.css').read()
data = open('data/wines.js').read()
game = open('src/game.js').read()

html = html.replace('<link rel="stylesheet" href="src/style.css">',
                    '<style>\n' + css + '\n</style>')
html = html.replace('<script src="data/wines.js"></script>\n<script src="src/game.js"></script>',
                    '<script>\n' + data + '\n' + game + '\n</script>')
assert 'src/style.css' not in html and 'data/wines.js' not in html, 'inline failed'
open('dist/winedle.html', 'w').write(html)
print('dist/winedle.html', len(html), 'bytes')
PY
