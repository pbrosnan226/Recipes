// S-83 checks on supabase/list-tags.js. Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const { listTags } = require('../list-tags');

const fake = (rows, status = 200) => {
  const calls = [];
  const f = async (url, opts) => { calls.push({ url, opts }); return { ok: status < 300, status, text: async () => JSON.stringify(rows) }; };
  f.calls = calls; return f;
};

test('S-83.1/S-83.2 lists tag names only, sorted', async () => {
  const out = await listTags('k', fake([{ name: 'side', recipe_tag: [{ recipe_id: 1 }] }, { name: 'dessert', recipe_tag: [{ recipe_id: 2 }] }]));
  assert.deepStrictEqual(out, { ok: true, tags: ['dessert', 'side'] });
});
test('S-83.3 asks only for tags that a recipe uses', async () => {
  const f = fake([]);
  await listTags('k', f);
  assert.ok(decodeURIComponent(f.calls[0].url).includes('recipe_tag!inner'));
});
test('S-83.4 only one read (GET)', async () => {
  const f = fake([]);
  await listTags('k', f);
  assert.strictEqual(f.calls.length, 1);
  assert.ok(!f.calls[0].opts.method || f.calls[0].opts.method === 'GET');
});
test('S-83.5 a failed read is an error, not an empty list', async () => {
  assert.strictEqual((await listTags('k', fake({ message: 'x' }, 500))).ok, false);
  const down = async () => { throw new Error('offline'); };
  assert.strictEqual((await listTags('k', down)).ok, false);
});

// Added by tester
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
test('S-83.2 output holds strings only, no ids or counts', async () => {
  const out = await listTags('k', fake([{ id: 9, name: 'a', recipe_tag: [{ recipe_id: 1 }, { recipe_id: 2 }] }, { id: 8, name: 'a', recipe_tag: [{ recipe_id: 3 }] }]));
  assert.deepStrictEqual(out, { ok: true, tags: ['a'] });
  assert.ok(out.tags.every((t) => typeof t === 'string'));
});
test('S-83.4 request is a read of the tag table: no body, no storage, no write verb in the script', async () => {
  const f = fake([]);
  await listTags('k', f);
  assert.strictEqual(f.calls[0].opts.body, undefined);
  assert.ok(f.calls[0].url.includes('/rest/v1/tag?'));
  assert.ok(!f.calls[0].url.includes('/storage/'));
  const src = fs.readFileSync(path.join(__dirname, '..', 'list-tags.js'), 'utf8');
  assert.ok(!/POST|PATCH|PUT|DELETE/.test(src.replace(/\/\/.*$/gm, '')));
});
test('S-83.5 unparseable or non-list answer is an error', async () => {
  const bad = async () => ({ ok: true, status: 200, text: async () => 'not json' });
  assert.strictEqual((await listTags('k', bad)).ok, false);
  assert.strictEqual((await listTags('k', fake({ a: 1 }))).ok, false);
});
test('S-83.5 CLI without a key reports TAG LIST FAILED and exits 1 (no network)', () => {
  const env = { ...process.env }; delete env.SUPABASE_SERVICE_KEY;
  const r = spawnSync('node', [path.join(__dirname, '..', 'list-tags.js')], { env, encoding: 'utf8' });
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /^TAG LIST FAILED/);
});
