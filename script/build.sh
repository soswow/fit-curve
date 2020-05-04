./node_modules/babel-cli/bin/babel.js src/fit-curve.js --out-file lib/fit-curve.js
npx google-closure-compiler --js=lib/fit-curve.js --js_output_file=lib/fit-curve.min.js --rewrite_polyfills=false
