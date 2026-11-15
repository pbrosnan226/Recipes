// S-85 checks on supabase/apply-tag-cleanup.js (fetch is stubbed; nothing touches a database). Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { plan, renderReport, applyCleanup } = require('../apply-tag-cleanup');

const rows = [
  { name: 'Apple Pie', course: { name: 'Dessert' }, recipe_tag: [{ position: 3, tag: { name: 'pie' } }, { position: 1, tag: { name: 'apple pie' } }, { position: 2, tag: { name: 'Sweet' } }] },
  { name: 'Roast Chicken', course: { name: 'Main' }, recipe_tag: [{ position: 1, tag: { name: 'Side Dish' } }, { position: 2, tag: { name: 'chicken' } }, { position: 3, tag: { name: 'Italian' } }, { position: 4, tag: { name: 'italian' } }] },
  { name: 'Mystery', course: null, recipe_tag: [{ position: 1, tag: { name: 'misc' } }] },
  { name: 'Plain Rice', course: { name: 'Side' }, recipe_tag: [{ position: 1, tag: { name: 'side' } }, { position: 2, tag: { name: 'rice' } }] },
];
const table = [
  { tag: 'apple pie', action: 'drop' }, { tag: 'Sweet', action: 'rename', to: 'sweet' }, { tag: 'pie', action: 'keep' },
  { tag: 'Side Dish', action: 'drop' }, { tag: 'chicken', action: 'keep' },
  { tag: 'Italian', action: 'rename', to: 'italian' }, { tag: 'italian', action: 'keep' },
  { tag: 'side', action: 'keep' }, { tag: 'rice', action: 'keep' }, { tag: 'misc', action: 'keep' },
];
const fake = (opts = {}) => {
  const calls = [];
  const f = async (u, o = {}) => {
    calls.push({ u, o });
    if (o.method === 'POST') return opts.rpc ? opts.rpc() : { ok: true, status: 200, text: async () => '3' };
    return { ok: true, status: 200, text: async () => JSON.stringify(rows) };
  };
  f.calls = calls;
  return f;
};
const sent = (f) => JSON.parse(f.calls.find((c) => c.o.method === 'POST').o.body).j.recipes;

test('S-85.1 one RPC call carries the whole change; the only writes go to apply_tag_cleanup', async () => {
  const f = fake();
  const out = await applyCleanup(table, 'k', f);
  assert.strictEqual(out.ok, true);
  const posts = f.calls.filter((c) => c.o.method === 'POST');
  assert.strictEqual(posts.length, 1);
  assert.ok(posts[0].u.endsWith('/rpc/apply_tag_cleanup'));
  assert.strictEqual(f.calls.filter((c) => c.o.method && c.o.method !== 'GET' && c.o.method !== 'POST').length, 0);
});
test('S-85.2/3 rename and drop are applied to every recipe that had the tag', async () => {
  const f = fake();
  await applyCleanup(table, 'k', f);
  const apple = sent(f).find((r) => r.name === 'Apple Pie');
  assert.ok(apple.tags.includes('sweet') && !apple.tags.includes('Sweet') && !apple.tags.includes('apple pie'));
});
test('S-85.4 a merge keeps one link at the first position', async () => {
  const f = fake();
  await applyCleanup(table, 'k', f);
  assert.deepStrictEqual(sent(f).find((r) => r.name === 'Roast Chicken').tags, ['main', 'chicken', 'italian']);
});
test('S-85.5/6/7 missing course tag added first, order kept, nothing for no course', async () => {
  const f = fake();
  await applyCleanup(table, 'k', f);
  const s = sent(f);
  assert.deepStrictEqual(s.find((r) => r.name === 'Apple Pie').tags, ['dessert', 'sweet', 'pie']);
  assert.strictEqual(s.find((r) => r.name === 'Plain Rice'), undefined); // already course-first, no change
  assert.strictEqual(s.find((r) => r.name === 'Mystery'), undefined); // unchanged recipes are not sent
});
test('S-85.8 the payload holds only names and tag lists', async () => {
  const f = fake();
  await applyCleanup(table, 'k', f);
  for (const r of sent(f)) assert.deepStrictEqual(Object.keys(r).sort(), ['name', 'tags']);
});
test('S-85.9 the report lists renamed, merged, dropped, added and the recipe count', () => {
  const p = plan(table, [
    { name: 'Apple Pie', course: 'Dessert', tags: ['apple pie', 'Sweet', 'pie'] },
    { name: 'Roast Chicken', course: 'Main', tags: ['Side Dish', 'chicken', 'Italian', 'italian'] },
    { name: 'Mystery', course: null, tags: ['misc'] },
    { name: 'Plain Rice', course: 'Side', tags: ['side', 'rice'] },
  ]);
  assert.deepStrictEqual(p.report.renamed, [{ from: 'Sweet', to: 'sweet' }]);
  assert.deepStrictEqual(p.report.merged, [{ from: ['Italian', 'italian'], to: 'italian' }]);
  assert.deepStrictEqual(p.report.dropped, ['Side Dish', 'apple pie']);
  assert.deepStrictEqual(p.report.added.map((a) => a.tag + '@' + a.recipe), ['dessert@Apple Pie', 'main@Roast Chicken']);
  assert.strictEqual(p.report.recipesChanged, 2);
  const text = renderReport(p.report);
  assert.match(text, /RENAMED: Sweet -> sweet/);
  assert.match(text, /MERGED: Italian \+ italian -> italian/);
  assert.match(text, /RECIPES CHANGED: 2/);
});
test('S-85.10 a failed change reports failure (the database rolls back) and an unreadable list changes nothing', async () => {
  const bad = await applyCleanup(table, 'k', fake({ rpc: () => ({ ok: false, status: 400, text: async () => JSON.stringify({ message: 'recipe not found: X' }) }) }));
  assert.strictEqual(bad.ok, false);
  assert.match(bad.why, /recipe not found: X/);
  const down = async () => { throw new Error('offline'); };
  const out = await applyCleanup(table, 'k', down);
  assert.strictEqual(out.ok, false);
});
test('S-85.10 a table that fails the checks sends nothing', async () => {
  const f = fake();
  const out = await applyCleanup(table.slice(1), 'k', f);
  assert.strictEqual(out.ok, false);
  assert.strictEqual(f.calls.filter((c) => c.o.method === 'POST').length, 0);
});
test('S-85.1/8 the SQL function is one transaction touching only recipe_tag and tag, service role only', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'apply-tag-cleanup.sql'), 'utf8');
  assert.match(sql, /^begin;/m);
  assert.match(sql, /commit;\s*$/);
  assert.match(sql, /grant execute on function recipes\.apply_tag_cleanup\(jsonb\) to service_role/);
  assert.match(sql, /revoke all on function recipes\.apply_tag_cleanup\(jsonb\) from public, anon, authenticated/);
  assert.doesNotMatch(sql, /delete from recipe\b(?!_)/);
  assert.doesNotMatch(sql, /update recipe\b(?!_)/);
});

test('S-85.2/3 a rename and a drop reach every recipe that had the tag', async () => {
  const two = [
    { name: 'A', course: { name: 'Main' }, recipe_tag: [{ position: 1, tag: { name: 'main' } }, { position: 2, tag: { name: 'Old' } }, { position: 3, tag: { name: 'junk' } }] },
    { name: 'B', course: { name: 'Main' }, recipe_tag: [{ position: 1, tag: { name: 'main' } }, { position: 2, tag: { name: 'junk' } }, { position: 3, tag: { name: 'Old' } }] },
  ];
  const t = [{ tag: 'main', action: 'keep' }, { tag: 'Old', action: 'rename', to: 'new' }, { tag: 'junk', action: 'drop' }];
  const f = async (u, o = {}) => (o.method === 'POST' ? { ok: true, status: 200, text: async () => '2' } : { ok: true, status: 200, text: async () => JSON.stringify(two) });
  const calls = [];
  const g = async (u, o = {}) => { calls.push(o); return f(u, o); };
  await applyCleanup(t, 'k', g);
  const s = JSON.parse(calls.find((c) => c.method === 'POST').body).j.recipes;
  assert.deepStrictEqual(s.map((r) => r.tags), [['main', 'new'], ['main', 'new']]);
});
test('S-85.7 a course tag that is not first moves to the front, others keep their order', async () => {
  const one = [{ name: 'C', course: { name: 'Main' }, recipe_tag: [{ position: 1, tag: { name: 'x' } }, { position: 2, tag: { name: 'main' } }, { position: 3, tag: { name: 'y' } }] }];
  const t = [{ tag: 'x', action: 'keep' }, { tag: 'main', action: 'keep' }, { tag: 'y', action: 'keep' }];
  const calls = [];
  const g = async (u, o = {}) => { calls.push(o); return o.method === 'POST' ? { ok: true, status: 200, text: async () => '1' } : { ok: true, status: 200, text: async () => JSON.stringify(one) }; };
  await applyCleanup(t, 'k', g);
  const s = JSON.parse(calls.find((c) => c.method === 'POST').body).j.recipes;
  assert.deepStrictEqual(s[0].tags, ['main', 'x', 'y']);
});
test('S-85.6 the SQL numbers tags from 1 by list place (with ordinality) and clears old links first', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'apply-tag-cleanup.sql'), 'utf8');
  assert.match(sql, /with ordinality as u\(v, ord\)/);
  assert.match(sql, /select rid, t\.id, u\.ord/);
  assert.match(sql, /delete from recipe_tag where recipe_id = rid/);
});
