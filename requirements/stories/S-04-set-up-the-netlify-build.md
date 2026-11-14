# S-04 Set up the Netlify build

**Workflow:** [W-03 Publish new or changed recipes](../workflows/W-03-publish-new-or-changed-recipes.html), step 2
**Screens:** None

## Actors
- **Build**: Netlify's build (primary)

## Trigger
The Owner pushes recipe changes to GitHub (the push, the GitHub connection and the Netlify account are done by the Owner, outside every story).

## Pre-conditions
- The Netlify site is connected to the GitHub repo by the Owner.

## Acceptance criteria
- S-04.1 Verify that the site's code lives in the `site/` folder of the repo.
- S-04.2 Verify that the repo holds a Netlify configuration that names the build command and the folder to publish.
- S-04.3 Verify that the build command runs from a clean checkout with no manual step and produces the static site in the folder to publish.
- S-04.4 Verify that the build reads the recipe notes from the repo root even though its code is in `site/`.
- S-04.5 (changed 2026-11-14) Verify that the build command doesn't need a server, a login or any secret to run; (unchanged by the redesign: sign-in and favorites are deferred, so it reads no Supabase settings).
- S-04.6 Verify that nothing in the repo pushes to GitHub or deploys by itself.

## Post-conditions
- A push to GitHub starts the build, which runs S-01 and S-02 (or S-03 on failure).
