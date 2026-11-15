// S-48 checks on supabase/check-recipe.js. Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync, spawnSync } = require('child_process');
const path = require('path');
const { checkRecipe } = require('../check-recipe');

const good = () => ({
  name: 'Egg Bake', source_url: 'https://example.com/egg-bake', created: '2026-11-13', course: 'Breakfast',
  base_amount: 4, amount_noun: 'servings', tags: ['breakfast'],
  ingredients: [
    { key: 'milk', name: 'milk', quantity: 2, fixed_text: null },
    { key: 'salt', name: 'salt', quantity: null, fixed_text: 'to taste' },
  ],
  steps: ['Whisk the milk ({milk}) and salt ({salt}).', 'Bake.'],
});

test('a complete recipe passes', () => assert.deepStrictEqual(checkRecipe(good()), []));

const cases = [
  ['S-48.2 missing source', (r) => { r.source_url = ' '; }, /source/i],
  ['S-48.3 missing created', (r) => { delete r.created; }, /created/i],
  ['S-48.3 impossible date', (r) => { r.created = '2026-02-30'; }, /created/i],
  ['S-48.4 no amount', (r) => { r.base_amount = null; }, /yield/i],
  ['S-48.4 no noun', (r) => { r.amount_noun = ''; }, /yield/i],
  ['S-48.5 course not in list', (r) => { r.course = 'Snack'; }, /course/i],
  ['S-48.5 course wrong case', (r) => { r.course = 'main'; }, /course/i],
  ['S-48.5 no course', (r) => { r.course = null; }, /course/i],
  ['S-48.6 ingredient with neither', (r) => { r.ingredients[1].fixed_text = ''; }, /neither a quantity nor fixed text/],
  ['S-48.7 unknown key in step', (r) => { r.steps.push('Add {sugar}.'); }, /\{sugar\}/],
];
for (const [name, mutate, re] of cases) {
  test(name, () => {
    const r = good(); mutate(r);
    const f = checkRecipe(r);
    assert.ok(f.length >= 1 && f.some((x) => re.test(x)), f.join('\n'));
  });
}

test('all six courses are accepted (S-48.5)', () => {
  for (const c of ['Breakfast', 'Main', 'Side', 'Soup', 'Dessert', 'Sauce']) {
    const r = good(); r.course = c; r.tags = [c.toLowerCase()];
    assert.deepStrictEqual(checkRecipe(r), []);
  }
});

test('quantity 0 counts as a quantity; several failures are all reported (S-48.10)', () => {
  const r = good(); r.ingredients[0].quantity = 0; assert.deepStrictEqual(checkRecipe(r), []);
  r.source_url = ''; r.course = 'x';
  assert.strictEqual(checkRecipe(r).length, 2);
});

test('command line: exit 0 on pass, 1 with the reasons on failure (S-48.8, S-48.9, S-48.10)', () => {
  const script = path.join(__dirname, '..', 'check-recipe.js');
  assert.strictEqual(execFileSync('node', [script], { input: JSON.stringify(good()) }).toString().trim(), 'OK');
  const bad = good(); bad.course = 'Snack';
  const p = spawnSync('node', [script], { input: JSON.stringify(bad) });
  assert.strictEqual(p.status, 1);
  assert.match(p.stdout.toString(), /course/i);
});

// ---- extra coverage (tester) ----
const fs = require('fs');
const os = require('os');
const scriptPath = path.join(__dirname, '..', 'check-recipe.js');
const skill = fs.readFileSync(path.join(__dirname, '..', '..', '.claude', 'skills', 'recipe-extract', 'SKILL.md'), 'utf8');

test('S-48.6 every offending ingredient is named; NaN and text-only quantity do not count', () => {
  const r = good();
  r.ingredients[0].quantity = NaN; r.ingredients[1].fixed_text = null;
  const f = checkRecipe(r);
  assert.strictEqual(f.length, 2);
  assert.ok(/milk/.test(f[0]) && /salt/.test(f[1]));
  const r2 = good(); r2.ingredients[0].quantity = '2';
  assert.ok(checkRecipe(r2).some((x) => /milk/.test(x)));
});

test('S-48.7 every unknown key is reported with its step; known keys repeated are fine', () => {
  const r = good(); r.steps = ['{milk} {milk} {salt}', 'Add {a} and {b}.'];
  const f = checkRecipe(r);
  assert.strictEqual(f.length, 2);
  assert.ok(f.every((x) => /Step 2/.test(x)));
});

test('S-48.4 amount must be positive', () => {
  for (const v of [0, -1, '4', NaN]) {
    const r = good(); r.base_amount = v;
    assert.ok(checkRecipe(r).some((x) => /yield/i.test(x)), String(v));
  }
});

test('S-48.3 date format must be YYYY-MM-DD; leap day accepted', () => {
  for (const v of ['13/11/2026', '2026-1-5', 'today', 20261113]) {
    const r = good(); r.created = v;
    assert.ok(checkRecipe(r).some((x) => /created/i.test(x)), String(v));
  }
  const ok = good(); ok.created = '2028-02-29';
  assert.deepStrictEqual(checkRecipe(ok), []);
});

test('S-48.8/9/10 CLI reads a file argument; failure prints every failed check and exits 1', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's48-'));
  const file = path.join(dir, 'r.json');
  const bad = good(); bad.source_url = ''; bad.course = 'Snack'; bad.steps.push('{nope}');
  fs.writeFileSync(file, JSON.stringify(bad));
  const p = spawnSync('node', [scriptPath, file]);
  assert.strictEqual(p.status, 1);
  const out = p.stdout.toString().trim().split('\n');
  assert.strictEqual(out.length, 3);
  assert.ok(/source/i.test(out[0]) && /course/i.test(p.stdout.toString()) && /\{nope\}/.test(p.stdout.toString()));
  fs.writeFileSync(file, JSON.stringify(good()));
  assert.strictEqual(spawnSync('node', [scriptPath, file]).status, 0);
});

test('S-48.9 unreadable input fails with a message and exit 1; nothing is written', () => {
  const p = spawnSync('node', [scriptPath], { input: 'not json' });
  assert.strictEqual(p.status, 1);
  assert.match(p.stdout.toString(), /Could not read/);
});

test('S-48.9 the checker has no network, database, storage or file-write code', () => {
  const src = fs.readFileSync(scriptPath, 'utf8');
  assert.ok(!/fetch\(|https?\.request|require\(['"](https?|net|@supabase\/supabase-js|pg)['"]\)/.test(src));
  assert.ok(!/writeFile|appendFile|\.upload\(|createClient|SERVICE/i.test(src));
});

test('S-48.1/8/9/10 skill tells Claude to read page data and photo address, run the check, and stop on failure', () => {
  assert.match(skill, /node supabase\/check-recipe\.js/);
  assert.match(skill, /photo address/i);
  assert.match(skill, /nothing and upload nothing/i);
  assert.match(skill, /tell the Owner in chat which check failed/i);
});
