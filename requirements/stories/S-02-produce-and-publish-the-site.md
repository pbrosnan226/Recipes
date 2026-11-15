# S-02 Produce and publish the list and recipe pages

**Partly superseded 2026-11-13.** The Build no longer reads notes or produces a page per recipe (W-03 changed); the trigger and pre-conditions below (S-01 has produced readable recipes) no longer apply. What the Build publishes now is in S-63; each criterion below says what became of it.

**Workflow:** [W-03 Publish new or changed recipes](../workflows/W-03-publish-new-or-changed-recipes.html), steps 5 and 6
**Screens:** [Home](../mockups/home.html), [Recipe](../mockups/recipe.html), [Recipe on phone](../mockups/recipe-phone.html) (changed 2026-11-14: replace Recipe list and Recipe page)

## Actors
- **Build**: Netlify's build (primary)
- **Owner**: sees the result on the next page load

## Trigger
The Build has finished reading the notes (S-01) and at least one recipe is readable.

## Pre-conditions
- S-01 has produced a set of readable recipes.

## Acceptance criteria
- S-02.1 (Superseded 2026-11-13 by S-54.2: the cards come from the database) Verify that the Build produces one Home page that has a card for every readable recipe.
- S-02.2 (Superseded 2026-11-13 by S-57.5: one Recipe page serves every recipe) Verify that the Build produces one Recipe page for every readable recipe.
- S-02.3 (Superseded 2026-11-13 by S-44.14 and S-54.2) Verify that the Build produces no page for a skipped note, and the Home page has no card for it.
- S-02.4 (changed 2026-11-13: the pages are a fixed shell that fetches recipes in the browser, see S-63.7) Verify that the site is static: the produced pages are plain files and need no server of the site's own and the site saves nothing (sign-in and favorites are deferred, see todo.md).
- S-02.5 (changed 2026-11-13: see S-63.1) Verify that the Build publishes the produced site when the build succeeds.
- S-02.6 (still applies 2026-11-13; restated in S-63.8) Verify that every produced page contains a `noindex` robots directive.
- S-02.7 (still applies 2026-11-13; restated in S-63.9) Verify that the produced site includes a `robots.txt` that disallows all crawling.
- S-02.8 (still applies 2026-11-13) Verify that the Build never pushes to GitHub and never deploys on its own beyond Netlify's own publish of a successful build.
- S-02.9 (Superseded 2026-11-13 by S-54.5 and S-57.7: recipes show with no build) Verify that when the Owner loads the site after a successful build, the Owner sees the new or changed recipes.
- S-02.10 (Superseded 2026-11-13 by S-44.8: photos are in Storage, not copied into the site) Verify that the published site contains the photo files copied by S-13, so no page depends on the photo's source site.
- S-02.11 (changed 2026-11-13: works on the recipes loaded from the database, see S-54.7) Verify that on the published Home page, the course chips, **Sort by** control, search and tag selection work using only the published files, with no request to a server of the site's own.
- S-02.12 (Superseded 2026-11-13 by S-61.1) Verify that each Recipe page carries the data it needs to rescale ingredients and steps for every servings option, without a request to a server of the site's own.

## Post-conditions
- The new site is live with a list and a page for each readable recipe.
- A recipe note that changed shows its new content; a recipe note that was removed or skipped is gone.
