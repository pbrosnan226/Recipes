# Retiring the notes

Written 2026-11-13 for S-47. **Nothing has been removed.** This guide says what removing each item would change and what would break, so the Owner can decide. Dependencies were found by searching the repo (excluding `node_modules`, `.git`, `dist` and `test-results`).

## Where things stand

- The import is **identical** to the current built site (S-45, S-46): 26 recipes and 115 servings options compared, 0 differences. Compared: names, source links, courses, descriptions, times, tags in order, notes with nesting, nutrition, photo names, the servings dropdown (label, options, starting option), and for every option the ingredient amounts, group headings, hidden ingredients and the steps.
- The old notes-reading build (`site/build.js`, `site/lib/read.js`, `site/lib/scale.js`, `site/lib/render.js`) currently runs as `npm run build` in `site/`, and **Netlify runs the same command** (`netlify.toml`). The two stories that split it out are not built yet: S-04.9 (the old build gets its own command, separate from Netlify's) and S-04.10 (its tests are left out of the normal `npx playwright test` run). Until then, "the command the old build runs under" is `npm run build`, and its tests (`S-01-04`, `S-01-13`, `S-14-34`) run with everything else. Fill in the new command name here once S-04.9 is built.
- The new site (S-63) will be a page shell that loads recipes from Supabase. It is not built yet, so for now **every item below is still needed** by the live site.

## 1. The recipe notes (`*.md` in the repo root)

**What removing them changes**
- *Owner (Obsidian):* the notes, their servings dropdowns (Dataview and Meta Bind), `Recipes.base` and the vault's recipe list disappear. Recipes would only be viewable on the site. The notes are also the Owner's archive of the original text.
- *Site:* the current site builds from the notes, so removing them makes `npm run build` fail (no readable recipes), and `dist` is removed. The new site (S-63) does not read notes.
- *Tests:* the build tests build their own fixture notes in a temp folder; the "real site" tests (port 8888) build from the repo's notes and fail without them.

**Dependencies (every thing in the repo that refers to the notes)**
- `site/lib/read.js`, `site/build.js` (read the notes; `RECIPE_ROOT` overrides where). Would break: the old build.
- `supabase/import-notes.js` and `supabase/confirmed-import.json`: read the notes with `site/lib/read.js`. Would break: re-running the import (replacing or re-saving recipes from notes).
- `site/tests/S-01-04-build.spec.js`, `S-01-13-photos-courses-build.spec.js`, `S-14-34-wording.spec.js`, `S-05-12-ui.spec.js`, `S-20-37-ui-gaps.spec.js`, `S-61-scale.spec.js`, `site/tests/support/build.js`, `notes.js`, `oracle.js`, `fixture-server.js`: build from or compare against notes. Would break: those tests (the S-61 test reads all 26 notes).
- `.claude/skills/recipe-extract/SKILL.md`: the extraction skill writes a new note per recipe. Would break: adding recipes (until S-53 updates it to write to the database).
- `Recipes.base` (selects notes tagged `recipe`), `CLAUDE.md` (describes the vault as one note per recipe), `site/README.md`.
- The `Broccoli Cheddar.pdf` in the root is not a note and is not used by the build.

**Does the new site (S-63) need it?** No. After the import it reads the database. The notes are still the only copy of the original text if the database is lost.

## 2. `images/`

**What removing it changes**
- *Owner:* the notes' embedded photos stop showing in Obsidian.
- *Site:* the old build copies each recipe's photo from `images/` into `dist/images/`, so the current pages lose their photos. The new site shows photos from the Supabase Storage bucket `recipe-photos`, not from `images/`.
- *Tests:* tests that check photos on the built site fail.

**Dependencies**
- Every note's photo line `![](images/<name>.jpg)` (25 of 26 notes).
- `site/build.js` (copies photos), `site/lib/read.js` (reads the photo line), `site/lib/render.js` (photo URL).
- `supabase/import-notes.js`: uploads each photo from `images/` to Storage. Would break: re-running the import or re-uploading photos.
- `site/tests/S-01-13-photos-courses-build.spec.js`, `S-05-12-ui.spec.js`, `S-14-34-wording.spec.js`, `site/tests/support/notes.js`, `fixture-server.js`.
- `.claude/skills/recipe-extract/SKILL.md` (saves each source photo into `images/`).
- `CLAUDE.md` (says to capture the source photo as a file in `images/`).

**Does the new site need it?** No. The photos are copied to Storage. `images/` becomes the only backup of the originals if Storage is lost.

## 3. `scripts/scale/view.js`

**What removing it changes**
- *Owner:* the servings dropdown and the rescaled Ingredients and steps stop working in every note (each note calls `dv.view("scripts/scale", …)`). Notes would show an error where the ingredients should be.
- *Site:* the old build runs this file once per dropdown option, so the build fails. The new browser code (`site/static/scale.js`, S-61) is a separate copy and does not load it.
- *Tests:* tests that compare against it fail.

**Dependencies**
- All 26 notes (each has the `dataviewjs` block that calls it).
- `site/lib/scale.js` (loads it from `RECIPE_ROOT`).
- `site/tests/support/oracle.js` and `site/tests/S-61-scale.spec.js` (S-61.11 compares `site/static/scale.js` with it for every recipe and option).
- `.claude/skills/recipe-extract/SKILL.md`, `CLAUDE.md`, `site/README.md`, `site/static/scale.js` (comment only).

**Does the new site need it?** No (S-61.12: the browser code does not load it). Keep it for as long as the notes are kept, and while the S-61 equivalence test is wanted.

## 4. The old build code

Files: `site/build.js`, `site/lib/read.js`, `site/lib/scale.js`, `site/lib/render.js`, and the build tests (`site/tests/S-01-04-build.spec.js`, `S-01-13-photos-courses-build.spec.js`, `S-14-34-wording.spec.js`, `site/tests/support/build.js`).

**What removing it changes**
- *Owner:* nothing in Obsidian.
- *Site:* the current live build stops (Netlify runs `npm run build`, which is `build.js`). Until S-63 switches Netlify to the new page shell, the site would stop publishing.
- *Tests:* the build tests have nothing to test. `site/tests/S-05-12-ui.spec.js` and `S-20-37-ui-gaps.spec.js` test the pages the old build writes, and the Playwright config starts it (`npm run build && npm run preview` on port 8888), so the whole run fails to start.

**Dependencies**
- `site/package.json` (scripts `build` and `preview`), `netlify.toml` (`command = "npm install && npm run build"`, `publish = "dist"`), `site/playwright.config.js` (builds and serves it for the UI tests), `site/preview.js` (serves `dist`).
- `supabase/import-notes.js`: reuses `site/lib/read.js`. Would break: the import script, which is also what re-checks the notes against the database.
- `site/tests/S-61-scale.spec.js` and `site/tests/support/oracle.js` use `site/lib/read.js`.
- `site/static/*` (`list.js`, `recipe.js`, `style.css`) are copied by `build.js`; the new site may reuse them.
- `site/README.md` and `requirements/` documents describe it.

**Does the new site (S-63) need it?** No, apart from `site/static/` files the page shell reuses. Keep `site/lib/read.js` as long as `supabase/import-notes.js` is used.

## Suggested order, if the Owner decides to retire things

1. Build S-04.9 and S-04.10 (old build gets its own command; its tests leave the normal run) and S-63 (Netlify publishes the new shell).
2. Only then remove the old build code (item 4).
3. Keep the notes, `images/` and `scripts/scale/view.js` (items 1 to 3) for as long as the Owner wants the vault as an archive or Obsidian view. Remove `scripts/scale/view.js` last, with the notes.
