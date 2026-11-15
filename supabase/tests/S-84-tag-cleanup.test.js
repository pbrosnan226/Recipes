// S-84 checks on supabase/tag-cleanup.js. Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { readRecipes, buildTable, render } = require('../tag-cleanup');

const rows = [
  { name: 'Apple Pie', course: { name: 'Dessert' }, recipe_tag: [{ position: 2, tag: { name: 'pie' } }, { position: 1, tag: { name: 'apple pie' } }] },
  { name: 'Roast Chicken', course: { name: 'Main' }, recipe_tag: [{ position: 1, tag: { name: 'Side Dish' } }, { position: 2, tag: { name: 'chicken' } }] },
  { name: 'Mystery', course: null, recipe_tag: [{ position: 1, tag: { name: 'side' } }] },
];
const fake = (body, status = 200) => { const calls = []; const f = async (u, o) => { calls.push({ u, o }); return { ok: status < 300, status, text: async () => JSON.stringify(body) }; }; f.calls = calls; return f; };
const recipes = [
  { name: 'Apple Pie', course: 'Dessert', tags: ['apple pie', 'pie'] },
  { name: 'Roast Chicken', course: 'Main', tags: ['Side Dish', 'chicken', 'italian'] },
  { name: 'Mystery', course: null, tags: ['side', 'Italian'] },
];
const good = [
  { tag: 'apple pie', action: 'drop' }, { tag: 'pie', action: 'keep' },
  { tag: 'Side Dish', action: 'drop' }, { tag: 'chicken', action: 'keep' },
  { tag: 'italian', action: 'keep' }, { tag: 'side', action: 'drop' }, { tag: 'Italian', action: 'rename', to: 'italian' },
];

test('S-84.1 reads recipes with course and ordered tags, with GET only', async () => {
  const f = fake(rows);
  const out = await readRecipes('k', f);
  assert.deepStrictEqual(out.recipes[0], { name: 'Apple Pie', course: 'Dessert', tags: ['apple pie', 'pie'] });
  assert.strictEqual(out.recipes[2].course, null);
  assert.strictEqual(f.calls.length, 1);
  assert.ok(!f.calls[0].o.method || f.calls[0].o.method === 'GET');
});
test('S-84.1 a failed read is an error', async () => {
  assert.strictEqual((await readRecipes('k', fake({}, 500))).ok, false);
});
test('S-84.2 table lists every tag with action, new name and recipes', () => {
  const b = buildTable(good, recipes);
  assert.deepStrictEqual(b.fails, []);
  assert.strictEqual(b.rows.length, 7);
  const text = render(b);
  assert.ok(text.includes('- Italian -> rename -> italian (Mystery)'));
  assert.ok(text.includes('- apple pie -> drop (Apple Pie)'));
});
test('S-84.2 a tag missing from the table is refused', () => {
  assert.ok(buildTable(good.slice(1), recipes).fails.some((f) => f.includes('missing from the table')));
});
test('S-84.4 adds the course tag first where missing; S-84.5 none without a course', () => {
  const b = buildTable(good, recipes);
  assert.deepStrictEqual(b.result[0].tags, ['dessert', 'pie']);
  assert.deepStrictEqual(b.result[1].tags, ['main', 'chicken', 'italian']);
  assert.deepStrictEqual(b.result[2].tags, ['italian']);
  assert.deepStrictEqual(b.additions, [{ recipe: 'Apple Pie', tag: 'dessert' }, { recipe: 'Roast Chicken', tag: 'main' }]);
});
test('S-84.6 adds nothing but course tags', () => {
  const b = buildTable(good, recipes);
  for (const r of b.result) for (const t of r.tags) assert.ok(recipes.find((x) => x.name === r.name).tags.map((x) => x.toLowerCase()).includes(t) || t === r.course.toLowerCase());
});
test('S-84.7/8 a new name that fails the S-82 checks is reported with the tag', () => {
  const bad = good.map((e) => (e.tag === 'Italian' ? { tag: 'Italian', action: 'rename', to: 'Italian Food' } : e));
  const b = buildTable(bad, recipes);
  assert.ok(b.fails.some((f) => f.includes('"Italian Food"') && f.includes('not lowercase')));
  const rec = good.map((e) => (e.tag === 'pie' ? { tag: 'pie', action: 'rename', to: 'recipe' } : e));
  assert.ok(buildTable(rec, recipes).fails.some((f) => f.includes('"recipe"')));
  const nm = good.map((e) => (e.tag === 'apple pie' ? { tag: 'apple pie', action: 'keep' } : e));
  assert.ok(buildTable(nm, recipes).fails.some((f) => f.includes('"apple pie"')));
});
test('S-84 merging two tags keeps one, at the first one\'s position', () => {
  const rs = [{ name: 'A', course: 'Side', tags: ['x', 'Side Dish', 'side', 'y'] }];
  const t = [{ tag: 'x', action: 'keep' }, { tag: 'Side Dish', action: 'rename', to: 'side' }, { tag: 'side', action: 'keep' }, { tag: 'y', action: 'keep' }];
  assert.deepStrictEqual(buildTable(t, rs).result[0].tags, ['side', 'x', 'y']);
});
test('S-84.11 the script has no write calls', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'tag-cleanup.js'), 'utf8');
  assert.ok(!/method\s*:\s*["'](POST|PATCH|PUT|DELETE)/i.test(src));
  assert.ok(!/writeFile|rpc\//.test(src));
});
