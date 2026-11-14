# Recipes

An Obsidian vault of recipes. One note per recipe, named after the dish, flat in the vault root
(`Creamy Tomato Pasta.md`). Course, cuisine and other facets live in note properties and tags,
not folders.

## Documenting a recipe

Use the `recipe-extract` skill — it holds the extraction workflow and the note template. The rules
that matter most:

- **Add nothing of your own.** Only what the source says: no extra tips, substitutions,
  clarifications, inferred steps, or unit conversions. Reword the source's steps so its text isn't
  copied verbatim, but don't change or add substance. If something seems worth flagging, say it in
  chat rather than writing it into the note.
- **Write measurements exactly as the source writes them.** No metric conversions, no "US can size
  is 15 oz" helpfulness.
- **Keep servings adjustable.** Each note has a servings dropdown that rescales the ingredients and
  the amounts quoted in the steps (Dataview + Meta Bind plugins, renderer in `scripts/scale/view.js`).
  The `recipe-extract` skill has the format.
- **Capture** the author's recipe-card notes, the nutrition table, and the source photo as a file in `images/`, linked from the note.
  **Skip** reader comments, blog headnotes, and the author's book promos.

## Testing (site)

Tests for the recipe site live in `site/tests/` (Playwright, WebKit, iPhone 17 only). Run from `site/`:
`npx playwright test` (starts a fixture site on :8899 and builds + previews the real site on :8888 itself).
Build tests (S-01 to S-04) build fixture notes in temp copies of the site code, so `site/dist` is never touched.
On the iPhone emulation, mouse `click()` doesn't reach the page; the UI tests use `tap()`.
