#!/bin/sh
rm alameda.min.js.gz
uglifyjs -c -m -o alameda.min.js alameda.js
gzip alameda.min.js
ls -la alameda.min.js.gz

