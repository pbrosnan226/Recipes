// S-50 checks on supabase/find-clash.js. Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const { findClashes } = require('../find-clash');

const fake = (rows, status = 200) => {
  const calls = [];
  const f = async (url, opts) => { calls.push({ url, opts }); return { ok: status < 300, status, text: async () => JSON.stringify(rows) }; };
  f.calls = calls; return f;
};

test('S-50.7 no clash gives an empty list', async () => {
  const out = await findClashes({ name: 'New Dish' }, 'k', fake([]));
  assert.deepStrictEqual(out, { ok: true, clashes: [] });
});
test('S-50.1 same name and same slug are told apart, with the old photo file', async () => {
  const rows = [
    { id: 1, name: 'Egg Bake', slug: 'egg-bake', photo_path: 'egg-bake.jpg' },
    { id: 2, name: 'Egg-Bake', slug: 'egg-bake', photo_path: null },
  ];
  const out = await findClashes({ name: 'Egg Bake' }, 'k', fake(rows));
  assert.strictEqual(out.clashes[0].reason, 'same name');
  assert.strictEqual(out.clashes[0].photo_path, 'egg-bake.jpg');
  assert.strictEqual(out.clashes[1].reason, 'different name, same slug');
});
test('S-50.2 the check only reads (GET) and matches name or slug', async () => {
  const f = fake([]);
  await findClashes({ name: 'Egg Bake' }, 'k', f);
  assert.strictEqual(f.calls.length, 1);
  assert.ok(!f.calls[0].opts.method || f.calls[0].opts.method === 'GET');
  const u = decodeURIComponent(f.calls[0].url);
  assert.ok(u.includes('name.eq."Egg Bake"') && u.includes('slug.eq."egg-bake"'));
});
test('a failed lookup is an error, not "no clash"', async () => {
  const out = await findClashes({ name: 'Egg Bake' }, 'k', fake({ message: 'x' }, 500));
  assert.strictEqual(out.ok, false);
});

// ---- added by the tester ----
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..', '..');
const skill = fs.readFileSync(path.join(root, '.claude/skills/recipe-extract/SKILL.md'), 'utf8');
const src = fs.readFileSync(path.join(__dirname, '..', 'find-clash.js'), 'utf8');
const sql = fs.readFileSync(path.join(__dirname, '..', 'save-recipe.sql'), 'utf8');

test('S-50.1 a different-case-or-punctuation name is a slug clash, not a same-name clash', async () => {
  const out = await findClashes({ name: 'Egg Bake' }, 'k', fake([{ id: 3, name: 'egg bake!', slug: 'egg-bake', photo_path: null }]));
  assert.strictEqual(out.clashes[0].reason, 'different name, same slug');
  assert.strictEqual(out.clashes[0].photo_path, null);
});
test('S-50.1 the lookup uses the slug made from the name (punctuation becomes hyphens)', async () => {
  const f = fake([]);
  await findClashes({ name: "Mom's  Egg Bake!" }, 'k', f);
  assert.ok(decodeURIComponent(f.calls[0].url).includes('slug.eq."mom-s-egg-bake"'));
});
test('S-50.1 CLI prints a CLASH line naming the existing recipe, reason and photo file, and exits 2', () => {
  assert.ok(/CLASH "\$\{c\.name\}".*\$\{c\.reason\}.*photo file/.test(src));
  assert.ok(/process\.exit\(2\)/.test(src));
  assert.ok(skill.includes('tell the Owner in chat which existing recipe it clashes with'));
  assert.ok(skill.includes('ask for their OK'));
});
test('S-50.2 the checker has no write call: no POST/PATCH/PUT/DELETE and no Storage', () => {
  assert.ok(!/method\s*:/i.test(src));
  assert.ok(!/storage/i.test(src.replace(/\/\/.*$/gm, '')));
});
test('S-50.2/3 until OK nothing is saved or uploaded (skill wording)', () => {
  assert.ok(skill.includes('Until they say OK, change nothing in the database and nothing in Storage: no save, no upload.'));
  assert.ok(skill.includes('Not OK: save nothing; the existing recipe stays as it is.'));
});
test('S-50.6 a failed lookup is an error that saves nothing; unreachable DB too', async () => {
  const boom = async () => { throw new Error('offline'); };
  const out = await findClashes({ name: 'Egg Bake' }, 'k', boom);
  assert.strictEqual(out.ok, false);
  assert.ok(out.why.includes('offline'));
  assert.ok(skill.includes('`CLASH CHECK FAILED`: save nothing and tell the Owner.'));
});
test('S-50.1 a name with no usable characters is refused, not looked up', async () => {
  const f = fake([]);
  const out = await findClashes({ name: '!!!' }, 'k', f);
  assert.strictEqual(out.ok, false);
  assert.strictEqual(f.calls.length, 0);
});
test('S-50 CLI without the key prints CLASH CHECK FAILED and exits 1 (no network used)', () => {
  const env = { ...process.env }; delete env.SUPABASE_SERVICE_KEY;
  const r = spawnSync('node', [path.join(__dirname, '..', 'find-clash.js')], { env, encoding: 'utf8' });
  assert.strictEqual(r.status, 1);
  assert.ok(r.stdout.includes('CLASH CHECK FAILED'));
});
test('S-50.4 the save replaces the whole recipe in one transaction (delete + insert inside one function)', () => {
  assert.ok(/delete from recipe where name/.test(sql));
  assert.ok(/create (or replace )?function recipes\.save_recipe/.test(sql));
});
test('S-50.4 a slug clash with a DIFFERENT name is replaced too (save must delete by slug as well)', () => {
  // slug is unique in the schema; deleting by name alone leaves the old row and the insert fails.
  assert.ok(/delete from recipe where[^;]*slug/.test(sql), 'save_recipe only deletes by name');
});
test('S-50.5/8 skill: photo overwrites the old file; no photo leaves it, path empty, old file named in chat', () => {
  assert.ok(skill.includes('the upload overwrites the existing photo file'));
  assert.ok(skill.includes('the old photo file stays in the'));
  assert.ok(skill.includes("the recipe's photo path is empty"));
  assert.ok(skill.includes('name the old file'));
});
test('S-50.7 no clash: the skill saves without asking', () => {
  assert.ok(skill.includes('`NO CLASH`: save without asking.'));
});
