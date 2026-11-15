// S-82 tag checks on supabase/check-recipe.js. Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const { checkRecipe } = require('../check-recipe');

const good = () => ({
  name: 'Apple Pie', source_url: 'https://example.com/p', created: '2026-11-13', course: 'Dessert',
  base_amount: 8, amount_noun: 'servings',
  ingredients: [{ key: 'apple', name: 'apple', quantity: 3, fixed_text: null }],
  steps: ['Slice {apple}.'],
  tags: ['dessert', 'apple', 'pie', 'american'],
});
const fails = (mut) => { const r = good(); mut(r); return checkRecipe(r); };

test('a recipe with good tags passes (S-82.12)', () => assert.deepStrictEqual(checkRecipe(good()), []));
test('no tags at all fails only the course-tag rule', () => {
  const f = fails((r) => { r.tags = []; }); assert.strictEqual(f.length, 1); assert.match(f[0], /course tag/i);
});
test('S-82.1 not lowercase', () => assert.ok(fails((r) => { r.tags[3] = 'American'; }).some((x) => /not lowercase/.test(x) && /American/.test(x))));
test('S-82.2 recipe / recipes', () => {
  for (const t of ['recipe', 'recipes']) assert.ok(fails((r) => { r.tags.push(t); }).some((x) => /never tags/.test(x)));
});
test('S-82.3 course word not first', () => assert.ok(fails((r) => { r.tags = ['apple', 'dessert']; }).some((x) => /first tag/.test(x))));
test('S-82.4 course word twice', () => assert.ok(fails((r) => { r.tags.push('dessert'); }).some((x) => /more than once/.test(x))));
test('S-82.5 course but no course tag', () => assert.ok(fails((r) => { r.tags = ['apple']; }).some((x) => /Missing course tag/.test(x))));
test('S-82.6 whole name or consecutive words, hyphen as space', () => {
  for (const t of ['apple pie', 'apple-pie', 'Apple-Pie']) assert.ok(fails((r) => { r.tags.push(t); }).some((x) => /name/.test(x)), t);
  const f = fails((r) => { r.name = 'Slow Cooker Beef Stew'; r.tags = ['dessert', 'cooker-beef']; });
  assert.ok(f.some((x) => /name/.test(x)));
});
test('S-82.6 one-word recipe name as tag fails', () =>
  assert.ok(fails((r) => { r.name = 'Lasagna'; r.tags.push('lasagna'); }).some((x) => /name/.test(x))));
test('S-82.7 single words of the name pass', () => {
  assert.deepStrictEqual(fails((r) => { r.tags = ['dessert', 'apple', 'pie']; }), []);
  assert.deepStrictEqual(fails((r) => { r.name = 'Chicken Parmesan'; r.course = 'Main'; r.tags = ['main', 'chicken']; }), []);
});
test('S-82.8 identical tags', () => assert.ok(fails((r) => { r.tags.push('american'); }).some((x) => /more than once/.test(x) && /american/.test(x))));
test('S-82.11 useless or synonym tags are not failed', () =>
  assert.deepStrictEqual(fails((r) => { r.tags.push('yummy', 'sweet', 'sweets'); }), []));
test('no course: a course-word tag fails', () => {
  const f = fails((r) => { r.course = null; r.tags = ['side', 'apple']; });
  assert.ok(f.some((x) => /has no course/.test(x)));
});
test('no course: other tags are not course failures', () => {
  const f = fails((r) => { r.course = null; r.tags = ['apple']; });
  assert.ok(!f.some((x) => /course tag/i.test(x)));
});
test('a recipe with no tags field is treated as no tags', () => {
  const f = fails((r) => { delete r.tags; });
  assert.ok(f.some((x) => /Missing course tag/.test(x)));
});

// ---- Added by tester: S-82.9, S-82.10, S-82.12 end to end (fakes only; no database, Storage or key) ----
const { saveRecipe } = require('../save-recipe');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const okFetch = (log) => async (u, o) => { log.push(u); return { ok: true, text: async () => '"id1"' }; };

test('S-82.9 a failed tag check sends nothing to the database or Storage', async () => {
  const bad = [
    (r) => { r.tags[3] = 'American'; }, (r) => { r.tags.push('recipes'); }, (r) => { r.tags = ['apple', 'dessert']; },
    (r) => { r.tags.push('dessert'); }, (r) => { r.tags = ['apple']; }, (r) => { r.tags.push('apple-pie'); },
    (r) => { r.tags.push('american'); },
  ];
  for (const mut of bad) {
    const calls = [];
    const r = good(); mut(r);
    const out = await saveRecipe(r, 'fake-key', okFetch(calls));
    assert.strictEqual(out.ok, false);
    assert.deepStrictEqual(calls, [], 'no request of any kind (database rpc or storage) may be made');
  }
});
test('S-82.10 the failure names the tag and the rule broken', async () => {
  const cases = [
    [(r) => { r.tags[3] = 'American'; }, /"American"/, /lowercase/],
    [(r) => { r.tags.push('recipes'); }, /"recipes"/, /never tags/],
    [(r) => { r.tags = ['apple', 'dessert']; }, /"dessert"/, /first tag/],
    [(r) => { r.tags.push('dessert'); }, /"dessert"/, /more than once/],
    [(r) => { r.tags = ['apple']; }, /dessert/, /Missing course tag/],
    [(r) => { r.tags.push('apple-pie'); }, /"apple-pie"/, /name/],
    [(r) => { r.tags.push('american'); }, /"american"/, /more than once/],
  ];
  for (const [mut, tag, rule] of cases) {
    const r = good(); mut(r);
    const out = await saveRecipe(r, 'fake-key', async () => { throw new Error('must not be called'); });
    assert.match(out.why, tag); assert.match(out.why, rule);
  }
});
test('S-82.10 the command line prints each failed line and exits 1', () => {
  const f = path.join(os.tmpdir(), `s82-${process.pid}.json`);
  const r = good(); r.tags.push('apple pie'); fs.writeFileSync(f, JSON.stringify(r));
  const out = spawnSync('node', [path.join(__dirname, '..', 'check-recipe.js'), f], { encoding: 'utf8' });
  fs.unlinkSync(f);
  assert.strictEqual(out.status, 1); assert.match(out.stdout, /apple pie/); assert.match(out.stdout, /name/);
});
test('S-82.12 when every check passes the recipe is sent to be saved, with tags in order', async () => {
  const calls = []; let sent;
  const out = await saveRecipe(good(), 'fake-key', async (u, o) => { calls.push(u); sent = JSON.parse(o.body).j; return { ok: true, text: async () => '"id1"' }; });
  assert.deepStrictEqual(out, { ok: true, id: 'id1' });
  assert.strictEqual(calls.length, 1); assert.match(calls[0], /rpc\/save_recipe$/);
  assert.deepStrictEqual(sent.tags, ['dessert', 'apple', 'pie', 'american']);
});
