# S-04 Set up the Netlify build

**Workflow:** [W-03 Publish new or changed recipes](../workflows/W-03-publish-new-or-changed-recipes.html), step 2
**Screens:** None

## Actors
- **Build**: Netlify's build (primary)

## Trigger
The Owner pushes site code changes to GitHub (changed 2026-11-13: was "recipe changes"; recipes no longer go through the build) (the push, the GitHub connection and the Netlify account are done by the Owner, outside every story).

## Pre-conditions
- The Netlify site is connected to the GitHub repo by the Owner.

## Acceptance criteria
- S-04.1 Verify that the site's code lives in the `site/` folder of the repo.
- S-04.2 Verify that the repo holds a Netlify configuration that names the build command and the folder to publish.
- S-04.3 (changed 2026-11-13: needs the two Supabase settings the Owner sets in Netlify, S-42) Verify that the build command runs from a clean checkout with no manual step and produces the static site in the folder to publish.
- S-04.4 (Superseded 2026-11-13 by S-63.3: the Build reads no recipe notes) Verify that the build reads the recipe notes from the repo root even though its code is in `site/`.
- S-04.5 (changed 2026-11-14; changed again 2026-11-13: the build now reads the project address and the public read-only key, S-63.2, and fails without them, S-64; it needs no server, no login and no secret key) Verify that the build command doesn't need a server, a login or any secret to run; (unchanged by the redesign: sign-in and favorites are deferred, so it reads no Supabase settings).
- S-04.6 Verify that nothing in the repo pushes to GitHub or deploys by itself.
- S-04.7 (added 2026-11-14) Verify that the repo-root Netlify configuration sets the base directory to `site`, so the build works without any Base directory setting in Netlify.
- S-04.8 (new 2026-11-13) Verify that the build command Netlify runs is a new, simpler build that publishes the page shell (S-63) and reads no note.
- S-04.9 (new 2026-11-13) Verify that the old note-reading build (`site/build.js`, `site/lib/read.js`, `site/lib/scale.js`, `site/lib/render.js`) stays in the repo, unchanged in what it does, and runs under its own command that is separate from the command Netlify runs.
- S-04.10 (new 2026-11-13) Verify that the tests of the old note-reading build (the build tests S-01 to S-04) stay in the repo and are left out of the normal test run (`npx playwright test`).
- S-04.11 (new 2026-11-13) Verify that nothing is deleted: the notes, `images/`, `scripts/scale/view.js` and the old build code are all still in the repo.

## Post-conditions
- A push to GitHub starts the build, which runs S-63 (or S-64 and S-03 on failure) (changed 2026-11-13: was S-01 and S-02).
