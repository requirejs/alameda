#!/bin/sh
rm dynamite.min.js.gz
~/scripts/closure.sh dynamite.js dynamite.min.js
gzip dynamite.min.js
ls -la dynamite.min.js.gz

