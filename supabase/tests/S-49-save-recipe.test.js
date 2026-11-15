// S-49 checks on supabase/save-recipe.js and supabase/save-recipe.sql. Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { slugify, prepare, saveRecipe } = require('../save-recipe');

const good = () => ({
  name: 'Mom’s Egg Bake!', source_url: 'https://example.com/e', created: '2026-11-13', course: 'Breakfast',
  base_amount: 4, amount_noun: 'servings', total_time: '1 hr 5 min', total_minutes: 65, tags: ['breakfast'],
  ingredients: [{ key: 'milk', name: 'milk', quantity: 2 }], steps: ['Add {milk}.'],
  notes: [{ level: 0, text: 'a' }, { level: 1, text: 'b' }],
});

test('S-49.2 slug is lowercase with punctuation and spaces as hyphens', () => {
  assert.strictEqual(slugify('Creamy Tomato Pasta'), 'creamy-tomato-pasta');
  assert.strictEqual(prepare(good()).recipe.slug, 'mom-s-egg-bake');
});
test('S-49.6 total_minutes empty without a total time', () => {
  const r = good(); r.total_time = null;
  assert.strictEqual(prepare(r).recipe.total_minutes, null);
  const bad = good(); bad.total_minutes = 65.5;
  assert.ok(prepare(bad).problems.length);
});
test('S-49.11 note levels', () => {
  const r = good(); r.notes[0].level = 1;
  assert.ok(prepare(r).problems.some((p) => /first note/.test(p)));
});
test('S-49.7/8 a failed save reports why and a passing one sends the slug', async () => {
  let sent;
  const ok = await saveRecipe(good(), 'k', async (u, o) => { sent = JSON.parse(o.body).j; return { ok: true, text: async () => '"abc"' }; });
  assert.deepStrictEqual(ok, { ok: true, id: 'abc' });
  assert.strictEqual(sent.slug, 'mom-s-egg-bake');
  const bad = await saveRecipe(good(), 'k', async () => ({ ok: false, status: 400, text: async () => '{"message":"boom"}' }));
  assert.strictEqual(bad.ok, false); assert.match(bad.why, /boom/);
  const down = await saveRecipe(good(), 'k', async () => { throw new Error('offline'); });
  assert.match(down.why, /offline/);
});
test('S-49 a recipe that fails the checks is not sent', async () => {
  const r = good(); r.course = 'Snack'; let called = false;
  const out = await saveRecipe(r, 'k', async () => { called = true; });
  assert.strictEqual(out.ok, false); assert.strictEqual(called, false);
});
test('S-49.3/4/12 the SQL function is one transaction, links tags by position, creates no course', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'save-recipe.sql'), 'utf8');
  assert.match(sql, /on conflict \(name\) do nothing/);
  assert.match(sql, /insert into recipe_tag \(recipe_id, tag_id, position\)/);
  assert.doesNotMatch(sql, /insert into course/i);
});

// ---- Added by tester: one test per remaining criterion (no live database, no key) ----
const { spawnSync } = require('child_process');
const SQL = () => fs.readFileSync(path.join(__dirname, '..', 'save-recipe.sql'), 'utf8');
const SKILL = () => fs.readFileSync(path.join(__dirname, '..', '..', '.claude', 'skills', 'recipe-extract', 'SKILL.md'), 'utf8');
const full = () => ({
  ...good(), archived_url: 'https://archive.example/e', site: 'Example', author: 'A. Cook', description: 'd',
  servings_label: 'Serves 4 to 6', prep_time: '10 min', cook_time: '55 min', nutrition_basis: 'Per 1 slice (100g)',
  nutrients: [{ name: 'Calories', amount: '210 kcal' }], tags: ['breakfast', 'a', 'c'],
});
const sentFor = async (r) => { let s; await saveRecipe(r, 'k', async (u, o) => { s = JSON.parse(o.body).j; return { ok: true, text: async () => '"id"' }; }); return s; };

test('S-49.1 every ERD recipe field is sent and written by the SQL', async () => {
  const s = await sentFor(full());
  for (const f of ['source_url', 'archived_url', 'site', 'author', 'description', 'created', 'base_amount', 'amount_noun', 'total_minutes', 'prep_time', 'cook_time', 'total_time', 'nutrition_basis', 'course']) {
    assert.notStrictEqual(s[f], undefined, f + ' sent');
    assert.ok(SQL().includes(`j->>'${f}'`), f + ' written by save_recipe');
  }
  assert.match(SQL(), /insert into recipe \(/);
});
test('S-49.2 name is saved as the Owner gave it; slug is derived from it', async () => {
  const s = await sentFor(full());
  assert.strictEqual(s.name, 'Mom’s Egg Bake!');
  assert.strictEqual(s.slug, 'mom-s-egg-bake');
  assert.strictEqual(slugify('  Ben & Jerry\'s -- Pie  '), 'ben-jerry-s-pie');
  assert.match(SQL(), /j->>'name', j->>'slug'/);
});
test('S-49.3 all parts go in one function call (single transaction) and each table is filled', async () => {
  const sql = SQL();
  for (const t of ['recipe_alias', 'recipe_tag', 'serving_option', 'recipe_ingredient', 'step', 'recipe_note', 'nutrient']) {
    assert.match(sql, new RegExp('insert into ' + t + ' '), t);
  }
  let calls = 0;
  await saveRecipe(full(), 'k', async () => { calls++; return { ok: true, text: async () => '"id"' }; });
  assert.strictEqual(calls, 1, 'one request carries the recipe and all its parts');
  assert.match(sql, /language plpgsql/);
});
test('S-49.4 tags keep the listed order and are deduplicated by name', async () => {
  const s = await sentFor(full());
  assert.deepStrictEqual(s.tags, ['breakfast', 'a', 'c']);
  assert.match(SQL(), /with ordinality t\(v, ord\)/);
  assert.match(SQL(), /on conflict \(name\) do nothing/);
});
test('S-49.5 times, nutrients, basis, ingredient text and label are sent untouched', async () => {
  const r = full(); r.ingredients[0].text_as_written = '2 cups (480ml) milk';
  const s = await sentFor(r);
  assert.strictEqual(s.total_time, '1 hr 5 min'); assert.strictEqual(s.prep_time, '10 min');
  assert.strictEqual(s.nutrients[0].amount, '210 kcal');
  assert.strictEqual(s.nutrition_basis, 'Per 1 slice (100g)');
  assert.strictEqual(s.ingredients[0].text_as_written, '2 cups (480ml) milk');
  assert.strictEqual(s.servings_label, 'Serves 4 to 6');
});
test('S-49.6 total_minutes kept when whole, nulled when no total time (blank string too)', async () => {
  assert.strictEqual((await sentFor(full())).total_minutes, 65);
  const r = full(); r.total_time = '  '; r.total_minutes = 30;
  assert.strictEqual(prepare(r).recipe.total_minutes, null);
  const z = full(); z.total_minutes = 0; assert.strictEqual(prepare(z).problems.length, 0);
  assert.match(SQL(), /\(j->>'total_minutes'\)::integer/);
});
test('S-49.7 failed save: reason returned, nothing partial is sent (checks fail before any request)', async () => {
  const r = full(); r.notes = [{ level: 2, text: 'x' }]; let called = false;
  const out = await saveRecipe(r, 'k', async () => { called = true; });
  assert.strictEqual(out.ok, false); assert.strictEqual(called, false);
  assert.match(out.why, /level 0 or 1/);
  assert.match(SQL(), /^begin;/m); assert.match(SQL(), /^commit;/m);
});
test('S-49.8 CLI prints SAVE FAILED with the reason and exits 1 (no key / unreachable database)', () => {
  const run = (env, args = []) => spawnSync('node', [path.join(__dirname, '..', 'save-recipe.js'), ...args], { env: { PATH: process.env.PATH, ...env }, encoding: 'utf8' });
  const noKey = run({});
  assert.strictEqual(noKey.status, 1); assert.match(noKey.stdout, /^SAVE FAILED: .*SUPABASE_SERVICE_KEY/);
  const tmp = path.join(require('os').tmpdir(), 's49-recipe.json'); fs.writeFileSync(tmp, JSON.stringify(good()));
  const down = run({ SUPABASE_SERVICE_KEY: 'dummy', SUPABASE_URL: 'http://127.0.0.1:1' }, [tmp]);
  assert.strictEqual(down.status, 1); assert.match(down.stdout, /^SAVE FAILED: could not reach the database/);
  const badFile = run({ SUPABASE_SERVICE_KEY: 'dummy' }, ['/nonexistent.json']);
  assert.strictEqual(badFile.status, 1); assert.match(badFile.stdout, /SAVE FAILED: could not read/);
  assert.match(SKILL(), /SAVE FAILED: <why>[\s\S]*download and upload no photo/);
});
test('S-49.9 the skill saves the recipe before it downloads the photo', () => {
  const t = SKILL();
  assert.match(t, /save\s+the recipe before downloading its photo/);
  assert.match(t, /`SAVED <id>`: go on to the photo/);
  assert.ok(t.indexOf('## Save to the database') < t.indexOf('go on to the photo'));
});
test('S-49.10 the save script writes no note and no file', () => {
  const js = fs.readFileSync(path.join(__dirname, '..', 'save-recipe.js'), 'utf8');
  assert.doesNotMatch(js, /writeFile|appendFile|createWriteStream|mkdirSync/);
  assert.match(SKILL(), /writes no note and saves no file in `images\/`/);
});
test('S-49.11 servings label saved as written; sub-note levels accepted, bad ones rejected', async () => {
  assert.strictEqual((await sentFor(full())).servings_label, 'Serves 4 to 6');
  assert.match(SQL(), /j->>'servings_label'/);
  assert.match(SQL(), /\(n\.v->>'level'\)::integer/);
  assert.strictEqual(prepare(good()).problems.length, 0);
  const r = good(); r.notes = [{ level: 0, text: 'a' }, { level: 1, text: 'b' }, { level: 1, text: 'c' }, { level: 0, text: 'd' }];
  assert.strictEqual(prepare(r).problems.length, 0);
  r.notes[1].level = 2; assert.ok(prepare(r).problems.length);
  assert.strictEqual(prepare({ ...good(), notes: [] }).problems.length, 0);
});
test('S-49.12 course is looked up, never created; unknown course is refused before saving', async () => {
  assert.match(SQL(), /\(select id from course where name = j->>'course'\)/);
  assert.doesNotMatch(SQL(), /insert into course/i);
  for (const c of ['Breakfast', 'Main', 'Side', 'Soup', 'Dessert', 'Sauce']) {
    const r = good(); r.course = c; r.tags = [c.toLowerCase()]; assert.strictEqual((await saveRecipe(r, 'k', async () => ({ ok: true, text: async () => '"i"' }))).ok, true, c);
  }
  const r = good(); r.course = 'Brunch'; let called = false;
  assert.strictEqual((await saveRecipe(r, 'k', async () => { called = true; })).ok, false); assert.strictEqual(called, false);
});
