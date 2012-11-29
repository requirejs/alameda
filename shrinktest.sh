#!/bin/sh
rm alameda.min.js.gz
~/scripts/closure.sh alameda.js alameda.min.js
gzip alameda.min.js
ls -la alameda.min.js.gz

