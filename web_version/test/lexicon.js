// Tests plural-tolerant Lexicon.isWord — dogs/qualities/wolves are accepted
// when only the singular is in the dictionary.
//
//   node web_version/test/lexicon.js
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Lexicon } from '../src/lexicon.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'shared_data');
const dict = JSON.parse(readFileSync(join(DATA, 'dictionary.json'), 'utf8'));
const lex = new Lexicon(dict.words);

let pass = 0;
let fail = 0;
const check = (cond, msg) => {
  if (cond) pass++;
  else { fail++; console.log('  FAIL -', msg); }
};

// Singulars still work.
for (const w of ['quality', 'dog', 'stone', 'box', 'wolf', 'knife']) {
  check(lex.isWord(w), `singular in dict: ${w}`);
}

// Plurals are now accepted via singular fallback.
for (const w of ['qualities', 'dogs', 'stones', 'boxes', 'dishes', 'wolves', 'knives', 'babies', 'notes']) {
  check(lex.isWord(w), `plural accepted: ${w}`);
}

// Case-insensitive.
check(lex.isWord('Qualities'), 'plural case-insensitive');

// Nonsense still rejected.
for (const w of ['xyzzys', 'qwerties', 'blarghves', 'zzzz']) {
  check(!lex.isWord(w), `nonsense rejected: ${w}`);
}

// Don't over-strip: 'ss'-final words shouldn't lose the final s.
// (dress -> dres is not a word; the guard prevents accepting 'dres'.)
check(!lex.isWord('dres'), `no over-strip for ss-final`);

console.log(`lexicon: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
