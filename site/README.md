# Recipe site

A static site built from the vault's recipe notes (root-level `.md` files tagged `recipe`). Nothing here pushes or deploys.

## Run locally
```
cd site
npm install        # once (installs js-yaml)
npm run build      # writes site/dist; names every skipped note; exits non-zero when no recipe is readable
npm run preview    # serves site/dist at http://localhost:8888 (PORT=... to change)
```
`RECIPE_ROOT=/some/folder npm run build` reads the notes (and `scripts/scale/view.js`) from another folder.

## How it works
- `lib/read.js` reads and validates the notes (S-01). A note is skipped, with a reason in the build log, when it is
  missing source / created / what the source makes, its properties don't parse, or its ingredient or steps block is malformed.
- `lib/scale.js` runs the vault's own `scripts/scale/view.js` (unchanged) once per dropdown option, so the amounts are exactly
  what Obsidian shows. The pages hold the precomputed tables and steps; `static/recipe.js` swaps them when the dropdown changes.
- `lib/render.js` writes the Home page (cards) and recipe pages; `static/list.js` does course chips, sort, search and tag filter; `static/recipe.js` does servings, ticks and Cook mode.
- Photos: a note's `![](images/<name>.<ext>)` line is copied from the repo's `images/` into `dist/images/`; a missing file, an http(s) address or an invalid `course` value gives a `NOTE` line in the build log and the recipe is still built.
- Fonts (Fraunces, Inter; SIL OFL 1.1) are in `static/fonts/`.
- `build.js` writes into `dist.tmp` and renames to `dist` only on success; on any failure `dist` is removed (nothing to publish).
- `../netlify.toml` (repo root): sets `base = "site"`, the build command and `publish = "dist"` (relative to the base), so Netlify needs no Base directory setting.

## Netlify build (S-63)
`npm run build` runs `build-shell.js`: it publishes the page shell (`index.html`, `recipe.html`, `style.css`, `scale.js`, fonts, `robots.txt`) and `config.js`, which holds the Supabase project address and public key read from the build environment (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`). It reads no note and makes no request. The build fails when either is missing. The old note-reading build is `npm run build:notes` (the Playwright config uses it for the old UI tests).
