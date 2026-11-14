// S-38 checks on the text of supabase/recipes-schema.sql. Nothing is applied anywhere.
// Run: node --test "supabase/tests/"   (from the repo root; plain Node, no dependencies)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '..', 'recipes-schema.sql'), 'utf8');
const sql = raw.replace(/--[^\n]*/g, '').replace(/\s+/g, ' ').trim();
const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);

// type families: text, uuid, int, num, date, bool
const ERD = {
  recipe: { id: 'uuid', course_id: 'uuid', name: 'text', slug: 'text', source_url: 'text', archived_url: 'text', site: 'text', author: 'text', description: 'text', photo_path: 'text', created: 'date', base_amount: 'num', amount_noun: 'text', amount_noun_singular: 'text', servings_label: 'text', prep_time: 'text', cook_time: 'text', total_time: 'text', total_minutes: 'int', nutrition_basis: 'text' },
  course: { id: 'uuid', name: 'text', position: 'int' },
  recipe_alias: { id: 'uuid', recipe_id: 'uuid', alias: 'text' },
  tag: { id: 'uuid', name: 'text' },
  recipe_tag: { recipe_id: 'uuid', tag_id: 'uuid', position: 'int' },
  serving_option: { id: 'uuid', recipe_id: 'uuid', position: 'int', amount: 'num', label: 'text' },
  recipe_ingredient: { id: 'uuid', recipe_id: 'uuid', position: 'int', ingredient_key: 'text', name: 'text', text_as_written: 'text', group_name: 'text', quantity: 'num', quantity_high: 'num', unit_singular: 'text', unit_plural: 'text', fixed_text: 'text', lead_text: 'text', grams_before: 'num', hidden: 'bool' },
  step: { id: 'uuid', recipe_id: 'uuid', position: 'int', text: 'text' },
  recipe_note: { id: 'uuid', recipe_id: 'uuid', position: 'int', level: 'int', text: 'text' },
  nutrient: { id: 'uuid', recipe_id: 'uuid', position: 'int', name: 'text', amount: 'text' },
};
const REQUIRED = {
  recipe: ['name', 'slug', 'source_url', 'created', 'base_amount', 'amount_noun'],
  course: ['name', 'position'],
  recipe_alias: ['recipe_id', 'alias'],
  tag: ['name'],
  recipe_tag: ['recipe_id', 'tag_id', 'position'],
  serving_option: ['recipe_id', 'position', 'amount'],
  recipe_ingredient: ['recipe_id', 'position', 'ingredient_key', 'name', 'text_as_written', 'hidden'],
  step: ['recipe_id', 'position', 'text'],
  recipe_note: ['recipe_id', 'position', 'level', 'text'],
  nutrient: ['recipe_id', 'position', 'name', 'amount'],
};
const UNIQUE = { recipe: ['name', 'slug'], course: ['name'], tag: ['name'] };
const FKS = { // table.column -> parent, on delete
  'recipe.course_id': ['course', 'set null'],
  'recipe_alias.recipe_id': ['recipe', 'cascade'], 'recipe_tag.recipe_id': ['recipe', 'cascade'], 'recipe_tag.tag_id': ['tag', 'cascade'],
  'serving_option.recipe_id': ['recipe', 'cascade'], 'recipe_ingredient.recipe_id': ['recipe', 'cascade'],
  'step.recipe_id': ['recipe', 'cascade'], 'recipe_note.recipe_id': ['recipe', 'cascade'], 'nutrient.recipe_id': ['recipe', 'cascade'],
};

function splitTop(s) { // split on commas outside parentheses
  const out = []; let d = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') d++; if (ch === ')') d--;
    if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim()); return out;
}
function family(t) {
  t = t.toLowerCase();
  if (t.startsWith('uuid')) return 'uuid';
  if (/^(int|integer|bigint|smallint)/.test(t)) return 'int';
  if (/^(numeric|decimal)/.test(t)) return 'num';
  if (/^(text|varchar|character)/.test(t)) return 'text';
  if (t.startsWith('date')) return 'date';
  if (t.startsWith('bool')) return 'bool';
  return t;
}
const tables = {};
for (const st of statements) {
  const m = st.match(/^create table (?:if not exists )?([\w."]+) \((.*)\)$/i);
  if (!m) continue;
  const [schema, name] = m[1].replace(/"/g, '').split('.');
  const t = { schema, name, cols: {}, unique: [], pk: [], fks: {} };
  for (const item of splitTop(m[2])) {
    let mm;
    if ((mm = item.match(/^primary key \((.*)\)$/i))) { t.pk = mm[1].split(',').map((x) => x.trim()); continue; }
    if ((mm = item.match(/^unique \((.*)\)$/i))) { t.unique.push(mm[1].split(',').map((x) => x.trim())); continue; }
    const c = item.match(/^(\w+) (\w+)(.*)$/i);
    const col = { type: family(c[2]), rest: c[3].toLowerCase() };
    t.cols[c[1]] = col;
    if (/primary key/.test(col.rest)) t.pk.push(c[1]);
    if (/\bunique\b/.test(col.rest)) t.unique.push([c[1]]);
    if ((mm = col.rest.match(/references ([\w."]+) ?\((\w+)\)(?: on delete (set null|cascade|restrict|no action))?/))) {
      t.fks[c[1]] = { parent: mm[1].replace(/"/g, ''), on: mm[3] || 'no action' };
    }
  }
  tables[name] = t;
}
const isRequired = (t, c) => /not null/.test(t.cols[c].rest) || t.pk.includes(c);

test('S-38.4 schema recipes and a table for each ERD entity, with columns', () => {
  assert.ok(statements.some((s) => /^create schema (if not exists )?recipes$/i.test(s)), 'create schema recipes');
  assert.deepStrictEqual(Object.keys(tables).sort(), Object.keys(ERD).sort());
  for (const [name, cols] of Object.entries(ERD)) {
    const t = tables[name];
    assert.strictEqual(t.schema, 'recipes', `${name} in recipes schema`);
    assert.deepStrictEqual(Object.keys(t.cols).sort(), Object.keys(cols).sort(), `${name} columns`);
    for (const [c, ty] of Object.entries(cols)) assert.strictEqual(t.cols[c].type, ty, `${name}.${c} type`);
  }
});
test('S-38.4 required fields are not null, optional fields are nullable', () => {
  for (const [name, cols] of Object.entries(ERD)) for (const c of Object.keys(cols)) {
    const pkCol = c === 'id' && name !== 'recipe_tag';
    const should = pkCol || REQUIRED[name].includes(c);
    assert.strictEqual(isRequired(tables[name], c), should, `${name}.${c} required=${should}`);
  }
  assert.match(tables.recipe_ingredient.cols.hidden.rest, /default false/);
  assert.match(tables.recipe_note.cols.level.rest, /check \(level in \(0, ?1\)\)/);
});
test('S-38.4 primary and unique keys', () => {
  for (const [name, t] of Object.entries(tables)) {
    assert.deepStrictEqual(t.pk, name === 'recipe_tag' ? ['recipe_id', 'tag_id'] : ['id'], `${name} pk`);
    const expected = [...(UNIQUE[name] || []).map((c) => [c]), ...(name === 'recipe_ingredient' ? [['recipe_id', 'ingredient_key']] : [])];
    assert.deepStrictEqual(t.unique.map((u) => u.join(',')).sort(), expected.map((u) => u.join(',')).sort(), `${name} unique`);
  }
});
test('S-38.4 relationships (foreign keys and delete behaviour)', () => {
  for (const [name, t] of Object.entries(tables)) for (const c of Object.keys(t.cols)) {
    const exp = FKS[`${name}.${c}`], got = t.fks[c];
    if (!exp) { assert.ok(!got, `${name}.${c} should not be an FK`); continue; }
    assert.ok(got, `${name}.${c} FK`);
    assert.strictEqual(got.parent, `recipes.${exp[0]}`);
    assert.strictEqual(got.on, exp[1], `${name}.${c} on delete`);
  }
});

test('S-38.5 public key has read-only access to every table', () => {
  for (const name of Object.keys(ERD)) {
    assert.ok(statements.some((s) => new RegExp(`^alter table recipes\\.${name} enable row level security$`, 'i').test(s)), `${name} RLS on`);
    assert.ok(statements.some((s) => new RegExp(`^create policy "[^"]+" on recipes\\.${name} for select to [^;]*anon[^;]* using \\(true\\)$`, 'i').test(s)), `${name} select policy for anon`);
  }
  assert.ok(statements.some((s) => /^grant select on all tables in schema recipes to [^;]*anon/i.test(s)), 'grant select to anon');
  assert.ok(statements.some((s) => /^grant usage on schema recipes to [^;]*anon/i.test(s)), 'usage on schema');
  // nothing writable for anon / authenticated / public
  for (const s of statements) {
    if (/^grant /i.test(s) && /\b(anon|authenticated|public)\b/i.test(s.replace(/^grant .*? on /i, '$&').split(/ to /i)[1] || '')) {
      assert.ok(/^grant (select|usage)\b/i.test(s), `unexpected grant to public roles: ${s}`);
    }
    if (/^create policy/i.test(s) && /recipes\./.test(s)) assert.match(s, / for select /i, `non-select policy: ${s}`);
  }
});
test('S-38.5 public Storage bucket for photos, anyone can read, nobody public can write', () => {
  const ins = statements.find((s) => /^insert into storage\.buckets/i.test(s));
  assert.ok(ins, 'bucket insert');
  assert.match(ins, /'recipe-photos'/);
  assert.match(ins, /\btrue\b/i, 'public = true');
  const pol = statements.filter((s) => /^create policy .* on storage\.objects/i.test(s));
  assert.ok(pol.length >= 1);
  for (const p of pol) {
    assert.match(p, / for select /i);
    assert.match(p, /anon/i);
    assert.match(p, /bucket_id = 'recipe-photos'/);
  }
});

test('S-38.6 touches nothing outside the recipes schema and the photo bucket', () => {
  const allowed = /^(begin|commit|create schema (if not exists )?recipes|create table recipes\.|create index \w+ on recipes\.|insert into recipes\.|alter table recipes\.|create policy "[^"]+" on recipes\.|grant (usage on schema|select on all tables in schema|all on all tables in schema) recipes |insert into storage\.buckets .*'recipe-photos'|create policy "[^"]+" on storage\.objects .*bucket_id = 'recipe-photos')/i;
  for (const s of statements) assert.match(s, allowed, `statement outside scope: ${s.slice(0, 100)}`);
  // no unqualified or foreign-schema table references
  for (const s of statements) {
    assert.ok(!/\b(public|auth|extensions)\./i.test(s), `foreign schema in: ${s.slice(0, 80)}`);
    assert.ok(!/^(drop|truncate|delete|update|alter (schema|role|database|default))/i.test(s), `destructive: ${s.slice(0, 80)}`);
  }
  // every FK targets the recipes schema
  for (const t of Object.values(tables)) for (const f of Object.values(t.fks)) assert.match(f.parent, /^recipes\./);
  // storage bucket insert only adds the one bucket
  const ins = statements.filter((s) => /storage\.buckets/i.test(s));
  assert.strictEqual(ins.length, 1);
});

test('S-38.10 six COURSE rows with positions 1 to 6', () => {
  const ins = statements.filter((s) => /^insert into recipes\.course/i.test(s));
  assert.strictEqual(ins.length, 1);
  assert.match(ins[0], /^insert into recipes\.course \(name, position\) values/i);
  const rows = [...ins[0].matchAll(/\('([^']+)', ?(\d+)\)/g)].map((m) => [m[1], Number(m[2])]);
  assert.deepStrictEqual(rows, [['Breakfast', 1], ['Main', 2], ['Side', 3], ['Soup', 4], ['Dessert', 5], ['Sauce', 6]]);
});
