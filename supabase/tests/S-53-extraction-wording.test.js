// S-53 checks: wording of the recipe-extract skill and CLAUDE.md (text only).
// Run: node --test "supabase/tests/"
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..', '..');
const SKILL_PATH = '.claude/skills/recipe-extract/SKILL.md';
const skill = fs.readFileSync(path.join(root, SKILL_PATH), 'utf8');
const claude = fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8');
const flat = (s) => s.replace(/\s+/g, ' ');
const skillF = flat(skill);
const claudeF = flat(claude);

// Text of one "## heading" section (heading line included), to the next "## ".
const section = (text, heading) => {
  const i = text.indexOf('\n' + heading);
  assert.ok(i >= 0, 'section exists: ' + heading);
  const rest = text.slice(i + 1);
  const n = rest.slice(3).search(/\n## /);
  return n < 0 ? rest : rest.slice(0, n + 3);
};
const head = (file) => execFileSync('git', ['show', 'HEAD:' + file], { cwd: root, encoding: 'utf8' });

test('S-53.1 description and opening paragraph say save to the recipes schema in Supabase, not a vault note', () => {
  const desc = skill.match(/^description:(.*)$/m)[1];
  assert.ok(/save it to the `recipes` schema in Supabase/.test(desc));
  assert.ok(!/note/i.test(desc), 'description no longer mentions a note');
  const open = flat(skill.slice(skill.indexOf('# Recipe extraction'), skill.indexOf('## 1.')));
  assert.ok(/saved to the `recipes` schema in Supabase \(not a note in the vault root\)/.test(open));
  assert.ok(!/one note in the vault root/.test(open));
});

test('S-53.2 no note template; lists what is saved', () => {
  assert.ok(!/## \d*\.? ?Note template/.test(skill));
  assert.ok(!skill.includes('![<dish>](images/'));
  assert.ok(!/```dataview/i.test(skill));
  assert.ok(!/^---\s*\n(aliases|source|tags):/m.test(skill.slice(skill.indexOf('# Recipe extraction'))));
  const s = flat(section(skill, '## 4. What is saved'));
  assert.ok(s.includes('No note, no template.'));
  for (const w of ['The recipe data', 'Aliases', 'Tags in order', 'Serving options', 'Ingredients', 'Steps', 'Notes with level', 'Nutrients']) {
    assert.ok(s.includes('**' + w), 'lists ' + w);
  }
  assert.ok(s.includes('requirements/erd.md'));
});

test('S-53.3 servings section: no Dataview/Meta Bind/view.js; saves label, options and ingredient fields', () => {
  const s = flat(section(skill, '## 3. Servings'));
  assert.ok(!/dataview|meta ?bind|view\.js/i.test(s));
  assert.ok(/servings label/.test(s) && /serving options/.test(s) && /choices of the dropdown/.test(s));
  for (const f of ['`key`', '`name`', '`text`', '`group`', '`quantity`', '`high quantity`', '`units`', '`fixed text`', '`lead text`', '`grams before`', '`hidden`']) {
    assert.ok(s.includes(f), 'field ' + f);
  }
  assert.ok(/text.*as written|source's line in full as written/.test(s));
});

test('S-53.4 photo: download, upload as downloaded, named after recipe with real extension, service key env var, nothing in images/', () => {
  const s = flat(section(skill, '## Photo'));
  assert.ok(/download the source's photo/.test(s));
  assert.ok(/upload it to the Storage bucket/.test(s));
  assert.ok(/exactly as downloaded, with no resizing, converting or editing/.test(s));
  assert.ok(/Name the file after the recipe, with the extension of the file type actually downloaded/.test(s));
  assert.ok(s.includes('French Toast.jpg') && s.includes('French Toast.webp'));
  assert.ok(/service key from the environment variable `SUPABASE_SERVICE_KEY`/.test(s));
  assert.ok(/Save no photo in `images\/`/.test(s));
});

test('S-53.5 never read the service key, never print it anywhere', () => {
  const s = flat(section(skill, '## Photo'));
  assert.ok(/Never read the service key, and never print it in chat, in a command, in a file or in a log\./.test(s));
});

test('S-53.6 photo failure keeps the recipe saved and tells the Owner; no photo leaves path empty and says so', () => {
  const s = flat(section(skill, '## Photo'));
  assert.ok(/can't be downloaded or uploaded, keep the recipe saved without a photo and tell the Owner in chat which photo failed \(recipe name and photo address\) and why/.test(s));
  assert.ok(/source gives no photo, leave the photo path empty and say so in chat/.test(s));
});

test('S-53.7 checks before saving (S-48.2 to S-48.7), failed check saves nothing and is reported, save all-or-nothing', () => {
  const c = flat(section(skill, '## Check before saving'));
  for (const w of ['has a source', 'created date', 'says what the source makes', 'course is one of Breakfast, Main, Side, Soup, Dessert or Sauce', 'quantity or fixed text', 'every `{key}` in a step']) {
    assert.ok(c.includes(w), 'check: ' + w);
  }
  assert.ok(/any check fails, save nothing and upload nothing, and tell the Owner in chat which check failed/.test(c));
  assert.ok(/saved in one transaction: all of them or none/.test(flat(section(skill, '## Save to the database'))));
});

test('S-53.8 same name or same slug: ask, replace whole recipe and overwrite photo only on OK, else save nothing', () => {
  const s = flat(section(skill, '## Ask before replacing a recipe'));
  assert.ok(/same name or the same slug/.test(s));
  assert.ok(/whether it is the same name or a different name with the same slug, and ask for their OK to replace it/.test(s));
  assert.ok(/Until they say OK, change nothing in the database and nothing in Storage/.test(s));
  assert.ok(/Not OK: save nothing/.test(s));
  assert.ok(/replaces the whole existing recipe/.test(s));
  assert.ok(/the upload overwrites the existing photo file/.test(s));
  assert.ok(!/Ask before overwriting a note/.test(skill));
});

test('S-53.9 course section keeps the S-34 rules, saving to the database', () => {
  const s = flat(section(skill, '## Course'));
  assert.ok(/exactly one of Breakfast, Main, Side, Soup, Dessert or Sauce/.test(s));
  assert.ok(/ignoring upper and lower case/.test(s));
  assert.ok(/canonical capitalisation/.test(s));
  assert.ok(/ask the Owner to choose one of the six and save their choice/.test(s));
  assert.ok(/Never save a `course` outside the list/.test(s));
  assert.ok(/`course` to one of the six existing courses/.test(flat(section(skill, '## Save to the database'))));
});

test('S-53.10 close-out has no note file; still reports only problems and judgment calls', () => {
  const s = flat(section(skill, '## 5. Close out'));
  assert.ok(!/note file|the note\b|\.md/i.test(s));
  assert.ok(/Mention only what went wrong or was left out/.test(s));
  assert.ok(/any judgment call the user might want to change/.test(s));
});

test('S-53.11 content rules kept', () => {
  const s = flat(section(skill, '## 2. Rules'));
  assert.ok(s.includes('**Add nothing of your own.**'));
  assert.ok(s.includes('**Reword, don\'t copy.**') && /never paste the author's sentences/.test(s));
  assert.ok(s.includes('**Measurements exactly as written.**') && /no metric or unit conversions/.test(s));
  assert.ok(s.includes('**Amounts in the steps.**') && s.includes('`{key}` token'));
  assert.ok(s.includes('**Include:**') && s.includes('**Skip:**'));
  assert.ok(s.includes('**Omit what the source doesn\'t publish.**') && /Never fill a gap with a guess/.test(s));
});

test('S-53.12 extraction ladder (section 1) is identical to git HEAD', () => {
  const now = section(skill, '## 1. Pull the source data');
  const old = section(head(SKILL_PATH), '## 1. Pull the source data');
  assert.strictEqual(now, old);
});

test('S-53.13 CLAUDE.md: saved to database, photo to Storage; intro, Branches and "the recipe" wording', () => {
  const doc = flat(section(claude, '## Documenting a recipe'));
  assert.ok(/saved to the database \(the `recipes` schema in Supabase\), and its photo is uploaded to Storage/.test(doc));
  assert.ok(!/dataview|meta ?bind|view\.js|`images\/`|note template/i.test(doc));
  assert.ok(!/one note per recipe/i.test(claudeF));
  const intro = flat(claude.slice(0, claude.indexOf('## Documenting')));
  assert.ok(/Recipes live in the Supabase `recipes` schema, with their photos in Storage, not as notes in the vault/.test(intro));
  const br = flat(section(claude, '## Branches (building the site)'));
  assert.ok(/not when documenting a recipe \(saving it to the Supabase `recipes` schema, with its photo in Storage\)/.test(br));
  assert.ok(!/documenting a recipe note/.test(claudeF));
  assert.ok(/say it in chat rather than writing it into the recipe\./.test(doc));
  assert.ok(!/rather than writing it into the note/.test(claudeF));
});

test('S-53.14 CLAUDE.md keeps Add nothing, measurements exactly, Capture/Skip', () => {
  const doc = flat(section(claude, '## Documenting a recipe'));
  assert.ok(/\*\*Add nothing of your own\.\*\* Only what the source says: no extra tips, substitutions, clarifications, inferred steps, or unit conversions\./.test(doc));
  assert.ok(/Reword the source's steps so its text isn't copied verbatim, but don't change or add substance\./.test(doc));
  assert.ok(/\*\*Write measurements exactly as the source writes them\.\*\* No metric conversions, no "US can size is 15 oz" helpfulness\./.test(doc));
  assert.ok(/\*\*Capture\*\* the author's recipe-card notes, the nutrition table, and the source photo/.test(doc));
  assert.ok(/\*\*Skip\*\* reader comments, blog headnotes, and the author's book promos\./.test(doc));
});

test('S-53.15 neither file tells the Extractor to resize or convert photos', () => {
  for (const [n, t] of [['skill', skillF], ['CLAUDE.md', claudeF]]) {
    assert.ok(!/(resize|convert|compress|crop)\s+(the\s+|a\s+)?(photo|image)/i.test(t), n + ' has no resize/convert instruction');
  }
  assert.ok(/no resizing, converting or editing/.test(skillF), 'skill says to upload untouched');
});

test('S-53.16 Testing (site) changed only by the old-build-tests sentence; Branches bullets intact', () => {
  const now = section(claude, '## Testing (site)');
  const old = section(head('CLAUDE.md'), '## Testing (site)');
  const oldLines = old.split('\n');
  const added = now.split('\n').filter((l) => !oldLines.includes(l));
  const addedF = flat(added.join(' '));
  assert.ok(/old note-reading build/.test(addedF) && /S-01 to S-04|S-04\.10/.test(addedF + flat(now)));
  assert.ok(/left out of the normal run \(once S-04\.10 is built\)/.test(addedF));
  assert.ok(/npx playwright test tests\/S-01-04-build\.spec\.js tests\/S-01-13-photos-courses-build\.spec\.js/.test(addedF));
  assert.strictEqual(added.length, 2, 'only the two new lines were added');
  // nothing was removed from the old section
  const nowLines = now.split('\n');
  assert.deepStrictEqual(oldLines.filter((l) => !nowLines.includes(l)), []);
  const br = section(claude, '## Branches (building the site)');
  for (const b of ['**`dev`**', '**`test`**', '**`main`**']) assert.ok(br.includes(b));
});
