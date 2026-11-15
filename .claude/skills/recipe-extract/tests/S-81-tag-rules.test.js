// S-81 checks: the Tags rules in the recipe-extract skill (text only).
// Run: node --test .claude/skills/recipe-extract/tests/
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const skill = fs.readFileSync(path.join(__dirname, '..', 'SKILL.md'), 'utf8');
const flat = (s) => s.replace(/\s+/g, ' ');
const i = skill.indexOf('\n## Tags');
assert.ok(i >= 0, 'Tags section exists');
const rest = skill.slice(i + 1);
const n = rest.slice(3).search(/\n## /);
const tags = flat(n < 0 ? rest : rest.slice(0, n + 3));

test('S-81.1 Tags section names the kinds in order: course, protein, cuisine, healthy, holiday', () => {
  const pos = ['**Course', '**Protein', '**Cuisine', '**Healthy', '**Holiday'].map((k) => tags.indexOf(k));
  pos.forEach((p) => assert.ok(p >= 0));
  assert.deepStrictEqual([...pos].sort((a, b) => a - b), pos);
  assert.ok(/in this order, when they apply/.test(tags));
});
test('S-81.2 course tag is the lowercase course word, same as course, first', () => {
  assert.ok(/lowercase course word, the same as the recipe's course/.test(tags));
  assert.ok(/comes first/.test(tags));
});
test('S-81.3 protein only when source states it or plainly the main one', () => {
  assert.ok(/Protein:\*\* only when the source states it or it is plainly the main one/.test(tags));
});
test('S-81.4 cuisine from the source', () => {
  assert.ok(/Cuisine:\*\* from the source/.test(tags));
});
test('S-81.5 healthy only when the source itself calls it healthy, light, low-calorie or similar', () => {
  assert.ok(/Healthy:\*\* only when the source itself calls the recipe healthy, light, low-calorie or similar/.test(tags));
});
test('S-81.6 holiday only when the source names the holiday', () => {
  assert.ok(/Holiday:\*\* only when the source names the holiday/.test(tags));
});
test('S-81.7 other tags allowed after those, e.g. diet or method', () => {
  assert.ok(/Other tags\*\*, after those, when they help find the recipe \(for example a diet or a method\)/.test(tags));
});
test('S-81.8 redundant tags are not saved: repeat, course, dish name, recipe/recipes', () => {
  assert.ok(/redundant, and not saved/.test(tags));
  assert.ok(/repeats another tag of the recipe \(a synonym, or the same word singular and plural\)/.test(tags));
  assert.ok(/repeats the course/.test(tags));
  assert.ok(/is the dish's own name or part of it/.test(tags));
  assert.ok(/is `recipe` or `recipes`/.test(tags));
});
test('S-81.9 lowercase, singular, hyphens for multiword', () => {
  assert.ok(/Tags are lowercase and singular, with hyphens for a multiword tag/.test(tags));
});
test('S-81.10 kind with nothing to say adds no tag; no filler tag', () => {
  assert.ok(/A kind with nothing to say adds no tag\. Add no filler tag\./.test(tags));
});
test('S-81.11 before saving, list existing tags (S-83) and reuse one with same meaning', () => {
  assert.ok(/Before saving, list the existing tags .*list-tags\.js.*Reuse a listed tag that already means the same/.test(tags));
});
test('S-81.12 "Tags in order" line no longer contradicts the rules', () => {
  const line = flat(skill).match(/\*\*Tags in order:\*\*[^*]*?(?=- \*\*|$)/);
  assert.ok(line, 'line exists');
  assert.ok(/rules under Tags/.test(line[0]));
  assert.ok(!/site's categories|keywords|as the source|copied/i.test(line[0]));
  assert.ok(!/category.*keyword/i.test(line[0]));
});
