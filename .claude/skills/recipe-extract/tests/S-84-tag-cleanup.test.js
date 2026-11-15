// S-84 checks: the Tag cleanup section of the recipe-extract skill (text only).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const skill = fs.readFileSync(path.join(__dirname, '..', 'SKILL.md'), 'utf8').replace(/\s+/g, ' ');
const i = skill.indexOf('## Tag cleanup');
assert.ok(i >= 0);
const sec = skill.slice(i, skill.indexOf('## Photo', i));
test('S-84 names the read and table commands through with-key.sh', () => {
  assert.ok(sec.includes('supabase/with-key.sh node supabase/tag-cleanup.js read'));
  assert.ok(sec.includes('supabase/with-key.sh node supabase/tag-cleanup.js table'));
});
test('S-84 keep/rename/drop, course tag only, no other kinds', () => {
  assert.ok(/keep\*\*, \*\*rename\*\*.*or \*\*drop/.test(sec));
  assert.ok(/Add no protein, cuisine, healthy or holiday tag/.test(sec));
  assert.ok(/no course tag/.test(sec));
});
test('S-84 failed check names the tag and changes nothing; asks confirm/changes/cancel', () => {
  assert.ok(/TABLE FAILED.*which tag, change nothing/.test(sec));
  assert.ok(/\*\*confirm\*\*, \*\*ask for changes\*\* or \*\*cancel\*\*/.test(sec));
  assert.ok(/new table/.test(sec) && /nothing was changed/.test(sec));
  assert.ok(/nothing changes until the Owner confirms/.test(sec));
});
test('S-84.3 proposal is made under the Tags rules (S-81)', () => {
  assert.ok(/under the Tags rules above/.test(sec));
  assert.ok(/lowercase, singular, hyphens/.test(sec));
  assert.ok(/no redundant tag; no dish-name tag; never `recipe` or `recipes`/.test(sec));
});
