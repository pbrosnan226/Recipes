// S-52 checks: skill wording ("When the photo is missing") and the save with no photo.
// Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { saveRecipe, prepare } = require('../save-recipe');

const root = path.join(__dirname, '..', '..');
const whole = fs.readFileSync(path.join(root, '.claude/skills/recipe-extract/SKILL.md'), 'utf8');
const start = whole.indexOf('## When the photo is missing');
assert.ok(start >= 0, 'section "When the photo is missing" exists');
const rest = whole.slice(start + 5);
const next = rest.search(/\n## /);
const sec = (next < 0 ? rest : rest.slice(0, next)).replace(/\s+/g, ' ');
const bullet = (label) => {
  const i = sec.indexOf(label);
  assert.ok(i >= 0, 'bullet missing: ' + label);
  const j = sec.indexOf(' - **', i + 1);
  return j < 0 ? sec.slice(i) : sec.slice(i, j);
};

const good = () => ({
  name: 'Egg Bake', source_url: 'https://example.com/e', created: '2026-11-14', course: 'Breakfast',
  base_amount: 4, amount_noun: 'servings', total_time: null,
  ingredients: [{ key: 'milk', name: 'milk', quantity: 2 }], steps: ['Add {milk}.'],
  notes: [{ level: 0, text: 'a' }], photo_path: null,
});

test('S-52.1 the recipe is saved before the photo, so a photo problem never undoes the save', () => {
  assert.ok(sec.includes('The recipe is saved before its photo is handled, so a photo problem never undoes the save.'));
  assert.ok(sec.includes('In every case below the recipe stays saved'));
});

test('S-52.2 download fails: nothing uploaded, no file left, photo path empty', () => {
  const b = bullet('**The download fails**');
  assert.ok(/upload nothing, so no file for this recipe is left in the Storage bucket/.test(b));
  assert.ok(sec.includes('its photo path stays empty (`photo_path` null in the recipe JSON, and nothing sets it later)'));
});

test('S-52.3 download fails: Owner told in chat the recipe name, photo address and why', () => {
  const b = bullet('**The download fails**');
  assert.ok(/Tell the Owner in chat which photo couldn't be downloaded/.test(b));
  assert.ok(b.includes('the recipe name and the photo address'));
  assert.ok(/and why/.test(b));
  assert.ok(/blocked, dead link, not an image/.test(b));
});

test('S-52.4 upload fails after the save: recipe stays saved, path empty, Owner told which photo and why', () => {
  const b = bullet('**The upload fails after the save**');
  assert.ok(b.includes('SUPABASE_SERVICE_KEY'));
  assert.ok(/leave the photo path empty/.test(b));
  assert.ok(/do not retry by changing the recipe/.test(b));
  assert.ok(/Tell the Owner in chat which photo couldn't be uploaded/.test(b));
  assert.ok(b.includes('the recipe name and the photo address') && /and why/.test(b));
});

test('S-52.5 no photo address: nothing downloaded or uploaded, Owner told the recipe has no photo', () => {
  const b = bullet('**The source gives no photo address:**');
  assert.ok(/download nothing, upload nothing/.test(b));
  assert.ok(/tell the Owner in chat that the recipe has no photo/.test(b));
});

test('S-52.6 same data and parts as with a photo (wording) and saving with a null photo works the same', async () => {
  assert.ok(sec.includes('exactly as it would be with a photo (same data, same parts)'));
  const withPhoto = { ...good(), photo_path: 'egg-bake.jpg' };
  const a = prepare(good()), b = prepare(withPhoto);
  assert.deepStrictEqual(a.problems, []);
  const { photo_path: _a, ...ra } = a.recipe; const { photo_path: _b, ...rb } = b.recipe;
  assert.deepStrictEqual(ra, rb);
  let sent;
  const f = async (u, o) => { sent = JSON.parse(o.body); return { ok: true, status: 200, text: async () => '1' }; };
  const out = await saveRecipe(good(), 'k', f);
  assert.strictEqual(out.ok, true);
  assert.strictEqual(sent.j.photo_path, null);
  assert.strictEqual(sent.j.slug, 'egg-bake');
});

test('S-52.7 skill says the site shows it without a photo; the save stores an empty photo_path', () => {
  assert.ok(sec.includes('the site shows it without a photo'));
  const sql = fs.readFileSync(path.join(__dirname, '..', 'save-recipe.sql'), 'utf8');
  assert.ok(sql.includes("j->>'photo_path'"), 'null JSON value becomes a null column');
});

test('S-52.9 replaced recipe with no new photo: old file stays, path empty, old file named in chat', () => {
  const b = bullet('**The recipe replaced an existing one**');
  assert.ok(/old photo file stays in the bucket unused/.test(b));
  assert.ok(/Name it in chat \(the `photo file:` in the clash line\)/.test(b));
  assert.ok(/no new photo/.test(b));
});

test('S-52.8 the service key never appears in a message, command, file or log', () => {
  assert.ok(sec.includes('The service key never appears in a message to the Owner, a command, a file or a log'));
  assert.ok(sec.includes('with the key removed'));
  assert.ok(sec.includes('leave that part out'));
});

test('S-52 failed save sends no key into the result text', async () => {
  const key = 'SECRETKEY123';
  const f = async () => ({ ok: false, status: 401, text: async () => '{"message":"bad"}' });
  const out = await saveRecipe(good(), key, f);
  assert.strictEqual(out.ok, false);
  assert.ok(!JSON.stringify(out).includes(key));
});
