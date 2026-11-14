# Recipes

A recipe site. Recipes live in the Supabase `recipes` schema, with their photos in Storage, not as
notes in the vault.

## Documenting a recipe

A new recipe is saved to the database (the `recipes` schema in Supabase), and its photo is uploaded
to Storage. Use the `recipe-extract` skill — it holds the extraction workflow and what is saved.
The rules that matter most:

- **Add nothing of your own.** Only what the source says: no extra tips, substitutions,
  clarifications, inferred steps, or unit conversions. Reword the source's steps so its text isn't
  copied verbatim, but don't change or add substance. If something seems worth flagging, say it in
  chat rather than writing it into the recipe.
- **Write measurements exactly as the source writes them.** No metric conversions, no "US can size
  is 15 oz" helpfulness.
- **Keep servings adjustable.** Each recipe is saved with its serving options and its ingredients'
  fields, so the site can rescale the ingredients and the amounts quoted in the steps. The
  `recipe-extract` skill has the fields.
- **Capture** the author's recipe-card notes, the nutrition table, and the source photo, uploaded to Storage.
  **Skip** reader comments, blog headnotes, and the author's book promos.

## Branches (building the site)

Applies when building app code (the site, scripts), not when documenting a recipe (saving it to the Supabase `recipes` schema, with its photo in Storage).

- **`dev`**: all building happens here. Create it if it doesn't exist; never build on `main`.
- **`test`**: when the build on `dev` is done, merge `dev` into `test` and deploy `test`, then
  test there.
- **`main`**: production. Only changes that passed testing on `test` reach it, and only when the
  user asks (see the global release rules: never deploy or push to production on your own).

## Testing (site)

Tests for the recipe site live in `site/tests/` (Playwright, WebKit, iPhone 17 only). Run from `site/`:
`npx playwright test` (starts a fixture site on :8899 and builds + previews the real site on :8888 itself).
Build tests (S-01 to S-04) build fixture notes in temp copies of the site code, so `site/dist` is never touched.
They test the old note-reading build and will be left out of the normal run (once S-04.10 is built); run them on their own with
`npx playwright test tests/S-01-04-build.spec.js tests/S-01-13-photos-courses-build.spec.js`.
On the iPhone emulation, mouse `click()` doesn't reach the page; the UI tests use `tap()`.
